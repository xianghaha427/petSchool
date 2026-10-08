package com.petschool.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.petschool.common.ResultCode;
import com.petschool.common.exception.BusinessException;
import com.petschool.config.properties.AiProperties;
import com.petschool.dto.ai.PetDescriptionRequest;
import com.petschool.dto.ai.PetHealthAdviceRequest;
import com.petschool.service.PetAiService;
import com.petschool.service.ai.AiChatMessage;
import com.petschool.service.ai.AiChatRequest;
import com.petschool.service.ai.AiClient;
import com.petschool.service.ai.AiException;
import com.petschool.service.ai.AiPrompts;
import com.petschool.service.ai.AiResponseParser;
import com.petschool.service.ai.PetRecognitionNormalizer;
import com.petschool.vo.PetHealthAdviceVO;
import com.petschool.vo.PetRecognitionVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

/**
 * 宠物 AI 能力编排实现
 * <p>
 * 这里刻意不做 try/catch 兜底降级：所有失败都以 {@link AiException} /
 * {@link BusinessException} 抛出，由 GlobalExceptionHandler 统一收口，
 * 避免异常被吞掉前端却拿到"成功"响应。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PetAiServiceImpl implements PetAiService {

    /** 生成的简介最大字符数 */
    private static final int DESCRIPTION_MAX_CHARS = 150;

    /**
     * 养护建议正文最大字符数，留了缓冲（提示词要求 180~260 字）。
     * 注意正文会被硬截断，所以"建议就医"这类安全文案绝不能写在正文里，
     * 只能放在 {@link #HEALTH_ADVICE_DISCLAIMER}。
     */
    private static final int HEALTH_ADVICE_MAX_CHARS = 300;

    /**
     * 免责声明：后端固定给出，不经过模型，因此永远不可能被截断或改写掉。
     * 正文可以超长、可以被截断，这句话始终完整。
     */
    private static final String HEALTH_ADVICE_DISCLAIMER =
            "以上建议由 AI 根据已登记信息生成，仅供日常养护参考，不能替代兽医诊断；"
                    + "如宠物出现异常症状，请及时前往正规宠物医院就诊。";

    private final AiClient aiClient;
    private final AiProperties aiProperties;

    @Override
    public PetRecognitionVO recognizePet(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请先选择要识别的照片");
        }
        if (file.getSize() > aiProperties.getMaxImageBytes()) {
            // 与上传接口同样从配置算 MB 数，避免 max-image-bytes 改了而提示还在说 5MB
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "图片不能超过 " + (aiProperties.getMaxImageBytes() / 1024 / 1024) + "MB，请压缩后重试");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "只支持识别图片文件");
        }

        String model = aiProperties.getVisionModel();
        AiChatRequest request = AiChatRequest.builder()
                .model(model)
                .messages(List.of(
                        AiChatMessage.system(AiPrompts.PET_RECOGNITION_SYSTEM),
                        AiChatMessage.userWithImage(AiPrompts.PET_RECOGNITION_USER, toDataUrl(file, contentType))))
                .temperature(0.1)
                .maxTokens(512)
                .build();

        String raw = aiClient.chat(request);
        JsonNode json = AiResponseParser.extractJsonObject(AiResponseParser.stripCodeFence(raw));
        PetRecognitionVO vo = PetRecognitionNormalizer.normalize(json, model);

        if (Boolean.FALSE.equals(vo.getIsPet())) {
            throw new AiException(ResultCode.AI_RECOGNIZE_FAILED.getCode(),
                    "没有识别到宠物，请换一张更清晰的照片");
        }
        log.info("宠物识别完成 provider={} model={} species={} confidence={}",
                aiClient.providerName(), model, vo.getSpecies(), vo.getConfidence());
        return vo;
    }

    @Override
    public String generateDescription(PetDescriptionRequest request) {
        PetDescriptionRequest req = request == null ? new PetDescriptionRequest() : request;
        if (isAllBlank(req)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请先填写品种或关键词");
        }

        String model = aiProperties.getTextModel();
        AiChatRequest aiRequest = AiChatRequest.builder()
                .model(model)
                .messages(List.of(
                        AiChatMessage.system(AiPrompts.PET_DESCRIPTION_SYSTEM),
                        AiChatMessage.user(AiPrompts.petDescriptionUser(req))))
                .temperature(0.8)
                .maxTokens(300)
                .build();

        String raw = aiClient.chat(aiRequest);
        String text = AiResponseParser.cleanPlainText(raw, DESCRIPTION_MAX_CHARS);
        if (text == null || text.isBlank()) {
            throw new AiException(ResultCode.AI_RECOGNIZE_FAILED.getCode(),
                    "AI 生成简介失败，请手动填写");
        }
        log.info("宠物简介生成完成 provider={} model={} length={}",
                aiClient.providerName(), model, text.length());
        return text;
    }

    @Override
    public PetHealthAdviceVO generateHealthAdvice(PetHealthAdviceRequest request) {
        PetHealthAdviceRequest req = request == null ? new PetHealthAdviceRequest() : request;
        if (isAllBlank(req)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "宠物信息不足，无法生成养护建议");
        }

        String model = aiProperties.getTextModel();
        AiChatRequest aiRequest = AiChatRequest.builder()
                .model(model)
                .messages(List.of(
                        AiChatMessage.system(AiPrompts.PET_HEALTH_ADVICE_SYSTEM),
                        AiChatMessage.user(AiPrompts.healthAdviceUser(req))))
                // 明显低于简介的 0.8：健康类内容要保守，不能让模型自由发挥
                .temperature(0.3)
                .maxTokens(600)
                .build();

        String raw = aiClient.chat(aiRequest);
        // cleanPlainText 只压空白、不剥围栏，所以围栏必须在这里先去掉
        String advice = AiResponseParser.cleanPlainText(
                AiResponseParser.stripCodeFence(raw), HEALTH_ADVICE_MAX_CHARS);
        if (advice == null || advice.isBlank()) {
            throw new AiException(ResultCode.AI_GENERATE_FAILED.getCode(),
                    ResultCode.AI_GENERATE_FAILED.getMessage());
        }
        log.info("宠物养护建议生成完成 provider={} model={} length={}",
                aiClient.providerName(), model, advice.length());

        return PetHealthAdviceVO.builder()
                .advice(advice)
                .disclaimer(HEALTH_ADVICE_DISCLAIMER)
                .model(model)
                .degraded("mock".equalsIgnoreCase(aiClient.providerName()))
                .build();
    }

    /**
     * 判断用户是否什么有效信息都没填（名字不算，光有名字写不出建议）
     */
    private boolean isAllBlank(PetHealthAdviceRequest req) {
        return isBlank(req.getSpecies())
                && isBlank(req.getBreed())
                && req.getAgeMonths() == null
                && req.getGender() == null
                && req.getWeight() == null
                && req.getIsVaccinated() == null
                && req.getIsNeutered() == null
                && isBlank(req.getHealthStatus());
    }

    /**
     * 判断用户是否什么有效信息都没填（名字不算，光有名字写不出简介）
     */
    private boolean isAllBlank(PetDescriptionRequest req) {
        return isBlank(req.getSpecies())
                && isBlank(req.getBreed())
                && req.getAgeMonths() == null
                && req.getGender() == null
                && isBlank(req.getColor())
                && isBlank(req.getKeywords());
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    /**
     * 编码成 data url 供多模态模型消费
     */
    private String toDataUrl(MultipartFile file, String contentType) {
        try {
            return "data:" + contentType + ";base64,"
                    + Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException e) {
            log.error("读取上传图片失败", e);
            throw new BusinessException(ResultCode.BAD_REQUEST, "图片读取失败，请重新上传");
        }
    }
}
