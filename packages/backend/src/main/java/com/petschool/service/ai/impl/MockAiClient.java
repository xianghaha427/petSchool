package com.petschool.service.ai.impl;

import com.petschool.config.properties.AiProperties;
import com.petschool.service.ai.AiChatMessage;
import com.petschool.service.ai.AiChatRequest;
import com.petschool.service.ai.AiClient;
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
        log.info("mock AI 简介请求已返回内置结果");
        return MOCK_DESCRIPTION;
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
