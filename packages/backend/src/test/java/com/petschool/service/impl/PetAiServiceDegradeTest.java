package com.petschool.service.impl;

import com.petschool.common.ResultCode;
import com.petschool.common.exception.BusinessException;
import com.petschool.config.properties.AiProperties;
import com.petschool.dto.ai.PetDescriptionRequest;
import com.petschool.service.ai.AiClient;
import com.petschool.service.ai.AiException;
import com.petschool.vo.PetRecognitionVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * 编排层降级行为的纯单元测试（不启动 Spring 容器）
 */
class PetAiServiceDegradeTest {

    private AiClient aiClient;
    private PetAiServiceImpl service;

    @BeforeEach
    void setUp() {
        aiClient = mock(AiClient.class);
        AiProperties aiProperties = new AiProperties();
        aiProperties.setVisionModel("qwen3-vl-flash");
        aiProperties.setTextModel("qwen-plus");
        service = new PetAiServiceImpl(aiClient, aiProperties);

        when(aiClient.providerName()).thenReturn("stub");
    }

    private MockMultipartFile image() {
        return new MockMultipartFile("image", "cat.jpg", "image/jpeg",
                "fake-image-bytes".getBytes(StandardCharsets.UTF_8));
    }

    private PetDescriptionRequest descriptionRequest() {
        PetDescriptionRequest request = new PetDescriptionRequest();
        request.setBreed("英国短毛猫");
        return request;
    }

    // ------------------------------------------------------------------
    // 识别
    // ------------------------------------------------------------------

    @Test
    @DisplayName("AI 未配置时透出 1004")
    void recognizePet_shouldThrow1004WhenAiUnavailable() {
        when(aiClient.chat(any())).thenThrow(
                new AiException(ResultCode.AI_UNAVAILABLE.getCode(), ResultCode.AI_UNAVAILABLE.getMessage()));

        AiException ex = assertThrows(AiException.class, () -> service.recognizePet(image()));
        assertEquals(ResultCode.AI_UNAVAILABLE.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("chat 抛出的 AiException 原样冒泡，不被包装成 1005")
    void recognizePet_shouldPropagateAiExceptionAsIs() {
        when(aiClient.chat(any())).thenThrow(
                new AiException(ResultCode.AI_UNAVAILABLE.getCode(), "供应商返回 429"));

        AiException ex = assertThrows(AiException.class, () -> service.recognizePet(image()));
        assertEquals(ResultCode.AI_UNAVAILABLE.getCode(), ex.getCode());
        assertEquals("供应商返回 429", ex.getMessage());
    }

    @Test
    @DisplayName("模型返回非 JSON 时抛 1005")
    void recognizePet_shouldThrow1005WhenResponseIsNotJson() {
        when(aiClient.chat(any())).thenReturn("抱歉，这张图片我看不清，无法识别。");

        AiException ex = assertThrows(AiException.class, () -> service.recognizePet(image()));
        assertEquals(ResultCode.AI_RECOGNIZE_FAILED.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("模型说画面里没有宠物时抛 1005")
    void recognizePet_shouldThrow1005WhenModelSaysNotAPet() {
        when(aiClient.chat(any())).thenReturn("{\"isPet\":false,\"species\":\"other\"}");

        AiException ex = assertThrows(AiException.class, () -> service.recognizePet(image()));
        assertEquals(ResultCode.AI_RECOGNIZE_FAILED.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("代码围栏包裹的 JSON 也能正常解析并归一化")
    void recognizePet_shouldNormalizeFencedJson() {
        when(aiClient.chat(any())).thenReturn("""
                ```json
                {"isPet":true,"species":"猫咪","gender":"母","ageMonths":8,"confidence":0.9}
                ```""");

        PetRecognitionVO vo = service.recognizePet(image());

        assertEquals("cat", vo.getSpecies());
        assertEquals(Integer.valueOf(2), vo.getGender());
        assertEquals("母", vo.getGenderLabel());
        assertEquals(Integer.valueOf(8), vo.getAgeMonths());
        assertEquals("幼年", vo.getAgeStage());
        assertEquals(Boolean.TRUE, vo.getIsPet());
        assertEquals("qwen3-vl-flash", vo.getModel());
    }

    @Test
    @DisplayName("空文件被拒绝")
    void recognizePet_shouldRejectEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile("image", "a.jpg", "image/jpeg", new byte[0]);
        assertThrows(BusinessException.class, () -> service.recognizePet(empty));
    }

    @Test
    @DisplayName("非图片类型被拒绝")
    void recognizePet_shouldRejectNonImageContentType() {
        MockMultipartFile text = new MockMultipartFile("image", "a.txt", "text/plain",
                "hello".getBytes(StandardCharsets.UTF_8));
        assertThrows(BusinessException.class, () -> service.recognizePet(text));
    }

    // ------------------------------------------------------------------
    // 简介
    // ------------------------------------------------------------------

    @Test
    @DisplayName("什么信息都没填时抛 400")
    void generateDescription_shouldRejectAllBlankRequest() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.generateDescription(new PetDescriptionRequest()));
        assertEquals(ResultCode.BAD_REQUEST.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("请求体为 null 时抛 400 而不是 NPE")
    void generateDescription_shouldRejectNullRequest() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.generateDescription(null));
        assertEquals(ResultCode.BAD_REQUEST.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("模型输出被清洗（去引号、压空白）")
    void generateDescription_shouldCleanModelOutput() {
        when(aiClient.chat(any())).thenReturn("\"  这是一只  很乖的猫咪。\n希望你喜欢  \"");

        assertEquals("这是一只 很乖的猫咪。 希望你喜欢",
                service.generateDescription(descriptionRequest()));
    }

    @Test
    @DisplayName("超长输出被截断到 150 字")
    void generateDescription_shouldTruncateLongOutput() {
        when(aiClient.chat(any())).thenReturn("猫".repeat(400));

        String text = service.generateDescription(descriptionRequest());
        assertEquals(150, text.length());
    }

    @Test
    @DisplayName("模型返回空白时抛 1005")
    void generateDescription_shouldThrow1005WhenModelReturnsBlank() {
        when(aiClient.chat(any())).thenReturn("   \n  ");

        AiException ex = assertThrows(AiException.class,
                () -> service.generateDescription(descriptionRequest()));
        assertEquals(ResultCode.AI_RECOGNIZE_FAILED.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("AI 不可用时简介接口同样透出 1004")
    void generateDescription_shouldThrow1004WhenAiUnavailable() {
        when(aiClient.chat(any())).thenThrow(
                new AiException(ResultCode.AI_UNAVAILABLE.getCode(), ResultCode.AI_UNAVAILABLE.getMessage()));

        AiException ex = assertThrows(AiException.class,
                () -> service.generateDescription(descriptionRequest()));
        assertEquals(ResultCode.AI_UNAVAILABLE.getCode(), ex.getCode());
        assertTrue(ex.getMessage().contains("请手动填写"));
    }
}
