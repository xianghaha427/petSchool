package com.petschool.service.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petschool.common.ResultCode;
import com.petschool.config.properties.AiProperties;
import com.petschool.service.ai.AiChatMessage;
import com.petschool.service.ai.AiChatRequest;
import com.petschool.service.ai.AiClient;
import com.petschool.service.ai.AiException;
import com.petschool.service.ai.AiResponseParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 阿里云百炼（DashScope）OpenAI 兼容模式客户端
 * <p>
 * 注意：日志中绝不能出现 apiKey 与 base64 图片数据。
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "pet.ai", name = "mock", havingValue = "false", matchIfMissing = true)
public class DashScopeAiClient implements AiClient {

    /** 供应商错误体在日志中的最大展示长度 */
    private static final int ERROR_BODY_LOG_LIMIT = 200;

    private final RestTemplate restTemplate;
    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    public DashScopeAiClient(@Qualifier("aiRestTemplate") RestTemplate restTemplate,
                             AiProperties aiProperties,
                             ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.aiProperties = aiProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean isAvailable() {
        return aiProperties.isConfigured();
    }

    @Override
    public String providerName() {
        return "dashscope";
    }

    @Override
    public String chat(AiChatRequest request) {
        if (!isAvailable()) {
            throw new AiException(ResultCode.AI_UNAVAILABLE.getCode(), ResultCode.AI_UNAVAILABLE.getMessage());
        }

        String url = aiProperties.getBaseUrl() + aiProperties.getChatPath();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(aiProperties.getApiKey().trim());
        Map<String, Object> body = buildBody(request);

        long start = System.currentTimeMillis();
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    url, new HttpEntity<>(body, headers), String.class);

            log.info("AI 调用完成 provider={} model={} httpStatus={} cost={}ms",
                    providerName(), request.getModel(),
                    response.getStatusCode().value(), System.currentTimeMillis() - start);

            String text = AiResponseParser.extractAssistantText(readTree(response.getBody()));
            if (text == null || text.isBlank()) {
                throw new AiException(ResultCode.AI_RECOGNIZE_FAILED.getCode(), "AI 返回内容为空，请手动填写");
            }
            return text;
        } catch (HttpStatusCodeException e) {
            // 供应商明确返回了错误状态码
            log.warn("AI 调用失败 provider={} model={} httpStatus={} cost={}ms body={}",
                    providerName(), request.getModel(), e.getStatusCode().value(),
                    System.currentTimeMillis() - start, truncate(e.getResponseBodyAsString()));
            throw new AiException(ResultCode.AI_UNAVAILABLE.getCode(),
                    ResultCode.AI_UNAVAILABLE.getMessage(), e);
        } catch (ResourceAccessException e) {
            // 断网、连接超时、读取超时
            log.warn("AI 网络异常 provider={} model={} cost={}ms message={}",
                    providerName(), request.getModel(), System.currentTimeMillis() - start, e.getMessage());
            throw new AiException(ResultCode.AI_UNAVAILABLE.getCode(),
                    ResultCode.AI_UNAVAILABLE.getMessage(), e);
        } catch (AiException e) {
            // 上面主动抛出的业务异常原样冒泡，不要被下面的兜底吞掉
            throw e;
        } catch (Exception e) {
            log.error("AI 调用异常 provider={} model={} cost={}ms",
                    providerName(), request.getModel(), System.currentTimeMillis() - start, e);
            throw new AiException(ResultCode.AI_RECOGNIZE_FAILED.getCode(),
                    ResultCode.AI_RECOGNIZE_FAILED.getMessage(), e);
        }
    }

    /**
     * 手搓 OpenAI 兼容请求体
     */
    private Map<String, Object> buildBody(AiChatRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", request.getModel());

        List<Map<String, Object>> messages = new ArrayList<>();
        if (request.getMessages() != null) {
            for (AiChatMessage message : request.getMessages()) {
                if (message == null) {
                    continue;
                }
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("role", message.getRole() == null ? "user" : message.getRole());
                item.put("content", buildContent(message));
                messages.add(item);
            }
        }
        body.put("messages", messages);

        if (request.getTemperature() != null) {
            body.put("temperature", request.getTemperature());
        }
        if (request.getMaxTokens() != null) {
            body.put("max_tokens", request.getMaxTokens());
        }
        if (aiProperties.isJsonMode()) {
            Map<String, Object> responseFormat = new LinkedHashMap<>();
            responseFormat.put("type", "json_object");
            body.put("response_format", responseFormat);
        }
        return body;
    }

    /**
     * 有图时 content 为分片数组，无图时为纯字符串
     */
    private Object buildContent(AiChatMessage message) {
        String text = message.getText() == null ? "" : message.getText();
        List<String> images = message.getImageDataUrls();
        if (images == null || images.isEmpty()) {
            return text;
        }

        List<Map<String, Object>> content = new ArrayList<>();
        for (String dataUrl : images) {
            if (dataUrl == null || dataUrl.isBlank()) {
                continue;
            }
            Map<String, Object> imageUrl = new LinkedHashMap<>();
            imageUrl.put("url", dataUrl);

            Map<String, Object> part = new LinkedHashMap<>();
            part.put("type", "image_url");
            part.put("image_url", imageUrl);
            content.add(part);
        }

        Map<String, Object> textPart = new LinkedHashMap<>();
        textPart.put("type", "text");
        textPart.put("text", text);
        content.add(textPart);

        return content;
    }

    private JsonNode readTree(String body) {
        if (body == null || body.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(body);
        } catch (Exception e) {
            log.warn("AI 响应不是合法 JSON：{}", e.getMessage());
            return null;
        }
    }

    /**
     * 截断供应商错误体，避免日志被刷屏
     */
    private String truncate(String raw) {
        if (raw == null) {
            return "";
        }
        String s = raw.replaceAll("\\s+", " ").trim();
        return s.length() <= ERROR_BODY_LOG_LIMIT ? s : s.substring(0, ERROR_BODY_LOG_LIMIT) + "...";
    }
}
