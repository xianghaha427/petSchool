package com.petschool.service.ai.impl;

import com.petschool.config.properties.AiProperties;
import com.petschool.service.ai.AiChatMessage;
import com.petschool.service.ai.AiChatRequest;
import com.petschool.service.ai.AiPrompts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * mock 客户端的请求分流测试。
 * <p>
 * mock 模式是本地演示的主路径，分流判错不会报错、只会静默返回错误内容，
 * 所以这里必须把三条链路都钉住。
 */
class MockAiClientTest {

    private MockAiClient client;

    @BeforeEach
    void setUp() {
        AiProperties aiProperties = new AiProperties();
        // 测试里不需要保留 loading 态的假耗时
        aiProperties.setMockDelayMs(0L);
        client = new MockAiClient(aiProperties);
    }

    private AiChatRequest requestWithSystem(String systemPrompt) {
        return AiChatRequest.builder()
                .model("qwen-plus")
                .messages(List.of(
                        AiChatMessage.system(systemPrompt),
                        AiChatMessage.user("随便什么用户指令")))
                .build();
    }

    @Test
    @DisplayName("养护建议请求返回养护建议，而不是宠物简介")
    void chat_shouldReturnHealthAdviceForHealthAdviceRequest() {
        String text = client.chat(requestWithSystem(AiPrompts.PET_HEALTH_ADVICE_SYSTEM));

        // 分流的全部意义就在这里：只按"有没有图"判断的话，这里会拿到一段宠物简介
        assertTrue(text.contains("宠物医院"), text);
        assertFalse(text.contains("希望能在这里遇到愿意长期陪伴它的主人"), text);
    }

    @Test
    @DisplayName("简介请求仍然返回简介，没有被养护建议分支抢走")
    void chat_shouldReturnDescriptionForDescriptionRequest() {
        String text = client.chat(requestWithSystem(AiPrompts.PET_DESCRIPTION_SYSTEM));

        assertTrue(text.contains("希望能在这里遇到愿意长期陪伴它的主人"), text);
        assertFalse(text.contains("宠物医院"), text);
    }

    @Test
    @DisplayName("带图请求仍然走识别分支，优先级高于文本分流")
    void chat_shouldReturnRecognitionJsonWhenImagePresent() {
        AiChatRequest request = AiChatRequest.builder()
                .model("qwen3-vl-flash")
                .messages(List.of(
                        AiChatMessage.system(AiPrompts.PET_RECOGNITION_SYSTEM),
                        AiChatMessage.userWithImage(AiPrompts.PET_RECOGNITION_USER, "data:image/png;base64,AAA")))
                .build();

        String text = client.chat(request);

        assertTrue(text.contains("\"isPet\":true"), text);
    }

    @Test
    @DisplayName("养护建议的 mock 文案同样守住红线：不出现药名与剂量")
    void healthAdviceMockShouldAvoidDrugNames() {
        String text = client.chat(requestWithSystem(AiPrompts.PET_HEALTH_ADVICE_SYSTEM));

        // mock 文案与真实链路的差距越小，演示时越不容易被误当成"功能就这样"
        assertFalse(text.contains("mg"), text);
        assertFalse(text.contains("剂量"), text);
        assertFalse(text.contains("片"), text);
    }

    @Test
    @DisplayName("messages 为 null 或空时不抛异常")
    void chat_shouldNotThrowOnEmptyMessages() {
        assertTrue(client.chat(AiChatRequest.builder().model("qwen-plus").build()).contains("主人"));
        assertTrue(client.chat(AiChatRequest.builder()
                .model("qwen-plus").messages(List.of()).build()).contains("主人"));
    }
}
