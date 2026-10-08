package com.petschool.service.ai.impl;

import com.petschool.config.properties.AiProperties;
import com.petschool.service.ai.AiChatMessage;
import com.petschool.service.ai.AiChatRequest;
import com.petschool.service.ai.AiClient;
import com.petschool.service.ai.AiPrompts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 本地演示用的假 AI 客户端：pet.ai.mock=true 时启用，不产生任何外部请求
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "pet.ai", name = "mock", havingValue = "true")
public class MockAiClient implements AiClient {

    /** 带图片时返回的假识别结果（一只猫） */
    private static final String MOCK_RECOGNITION_JSON = """
            {"isPet":true,"species":"cat","breed":"英国短毛猫","gender":2,"color":"橘白相间",\
            "ageMonths":8,"ageStage":"幼年","confidence":0.93,\
            "tips":"建议按时接种疫苗，并保证充足饮水。"}""";

    /** 不带图片时返回的假简介 */
    private static final String MOCK_DESCRIPTION =
            "这是一只性格温柔的小家伙，喜欢在午后阳光下打盹，也喜欢追着逗猫棒满屋跑。"
                    + "它亲人不怕生，见到熟悉的人会主动蹭过来撒娇。希望能在这里遇到愿意长期陪伴它的主人。";

    /**
     * 养护建议的假结果。
     * 即使是演示数据也不出现药名、剂量，并且保留"该就医就明说"这一条，
     * 免得 mock 模式下的表现和真实链路差太远。
     */
    private static final String MOCK_HEALTH_ADVICE =
            "这只小家伙正处于需要细心照料的阶段，日常可以从几件小事做起："
                    + "按时完成疫苗接种和定期驱虫，并把每次的记录留下来，方便日后就医时参考；"
                    + "保证随时有干净的饮水，粮按它的体型和活动量来喂，别让它一次吃太撑；"
                    + "每天留一点时间陪它活动，既能消耗精力，也能帮你及早发现精神或步态上的变化；"
                    + "另外记得每年安排一次体检。如果它出现持续呕吐、腹泻、精神差或食欲明显下降，"
                    + "建议尽快到正规宠物医院就诊。";

    private final AiProperties aiProperties;

    public MockAiClient(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String providerName() {
        return "mock";
    }

    @Override
    public String chat(AiChatRequest request) {
        sleep();
        if (hasImage(request)) {
            log.info("mock AI 识别请求已返回内置结果");
            return MOCK_RECOGNITION_JSON;
        }
        // 不带图片的请求不止"简介"一种，必须按 system 提示词区分，
        // 否则 mock 模式下养护建议会拿到一段宠物简介
        if (isHealthAdviceRequest(request)) {
            log.info("mock AI 养护建议请求已返回内置结果");
            return MOCK_HEALTH_ADVICE;
        }
        log.info("mock AI 简介请求已返回内置结果");
        return MOCK_DESCRIPTION;
    }

    /**
     * 是否为养护建议请求。system 消息是服务端自己拼的，等值判断可靠。
     */
    private boolean isHealthAdviceRequest(AiChatRequest request) {
        if (request == null || request.getMessages() == null) {
            return false;
        }
        for (AiChatMessage message : request.getMessages()) {
            if (message != null && AiPrompts.PET_HEALTH_ADVICE_SYSTEM.equals(message.getText())) {
                return true;
            }
        }
        return false;
    }

    private boolean hasImage(AiChatRequest request) {
        if (request == null || request.getMessages() == null) {
            return false;
        }
        for (AiChatMessage message : request.getMessages()) {
            if (message == null) {
                continue;
            }
            List<String> images = message.getImageDataUrls();
            if (images != null && !images.isEmpty()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 保留一点耗时，让前端 loading 态能被看到
     */
    private void sleep() {
        long delay = aiProperties.getMockDelayMs();
        if (delay <= 0) {
            return;
        }
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
