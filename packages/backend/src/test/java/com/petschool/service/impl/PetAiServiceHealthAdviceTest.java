package com.petschool.service.impl;

import com.petschool.common.ResultCode;
import com.petschool.common.exception.BusinessException;
import com.petschool.config.properties.AiProperties;
import com.petschool.dto.ai.PetHealthAdviceRequest;
import com.petschool.service.ai.AiChatRequest;
import com.petschool.service.ai.AiClient;
import com.petschool.service.ai.AiException;
import com.petschool.vo.PetHealthAdviceVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 养护建议编排逻辑的纯单元测试（不启动 Spring 容器）
 * <p>
 * 之所以能这么轻量，是因为接口刻意用"字段入参"而不是 petId，
 * 编排层不需要依赖 PetService / PetMapper。
 */
class PetAiServiceHealthAdviceTest {

    private AiClient aiClient;
    private PetAiServiceImpl service;

    @BeforeEach
    void setUp() {
        aiClient = mock(AiClient.class);
        AiProperties aiProperties = new AiProperties();
        aiProperties.setTextModel("qwen-plus");
        service = new PetAiServiceImpl(aiClient, aiProperties);

        when(aiClient.providerName()).thenReturn("stub");
    }

    private PetHealthAdviceRequest request() {
        PetHealthAdviceRequest req = new PetHealthAdviceRequest();
        req.setSpecies("cat");
        return req;
    }

    /** 取出本次实际发给模型的用户指令文本 */
    private String capturedUserMessage() {
        ArgumentCaptor<AiChatRequest> captor = ArgumentCaptor.forClass(AiChatRequest.class);
        verify(aiClient).chat(captor.capture());
        return captor.getValue().getMessages().get(1).getText();
    }

    // ------------------------------------------------------------------
    // 入参校验
    // ------------------------------------------------------------------

    @Test
    @DisplayName("什么信息都没填时抛 400")
    void healthAdvice_shouldRejectAllBlankRequest() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.generateHealthAdvice(new PetHealthAdviceRequest()));
        assertEquals(ResultCode.BAD_REQUEST.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("请求体为 null 时抛 400 而不是 NPE")
    void healthAdvice_shouldRejectNullRequest() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.generateHealthAdvice(null));
        assertEquals(ResultCode.BAD_REQUEST.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("只有名字时抛 400（名字不算有效信息）")
    void healthAdvice_shouldRejectNameOnlyRequest() {
        PetHealthAdviceRequest req = new PetHealthAdviceRequest();
        req.setName("小毛");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.generateHealthAdvice(req));
        assertEquals(ResultCode.BAD_REQUEST.getCode(), ex.getCode());
    }

    // ------------------------------------------------------------------
    // 正常路径
    // ------------------------------------------------------------------

    @Test
    @DisplayName("正常生成：正文、免责声明、模型名都带回")
    void healthAdvice_shouldReturnAdviceAndDisclaimer() {
        when(aiClient.chat(any())).thenReturn("这是一段养护建议，记得按时接种疫苗并保证饮水。");

        PetHealthAdviceVO vo = service.generateHealthAdvice(request());

        assertEquals("这是一段养护建议，记得按时接种疫苗并保证饮水。", vo.getAdvice());
        assertNotNull(vo.getDisclaimer());
        assertFalse(vo.getDisclaimer().isBlank());
        assertTrue(vo.getDisclaimer().contains("宠物医院"));
        assertEquals("qwen-plus", vo.getModel());
    }

    @Test
    @DisplayName("provider 为 mock 时标记 degraded=true")
    void healthAdvice_shouldMarkDegradedWhenProviderIsMock() {
        when(aiClient.providerName()).thenReturn("mock");
        when(aiClient.chat(any())).thenReturn("演示用的养护建议。");

        assertEquals(Boolean.TRUE, service.generateHealthAdvice(request()).getDegraded());
    }

    @Test
    @DisplayName("provider 为真实供应商时 degraded=false")
    void healthAdvice_shouldNotMarkDegradedForRealProvider() {
        when(aiClient.providerName()).thenReturn("dashscope");
        when(aiClient.chat(any())).thenReturn("真实模型给出的养护建议。");

        assertEquals(Boolean.FALSE, service.generateHealthAdvice(request()).getDegraded());
    }

    // ------------------------------------------------------------------
    // 失败与输出清洗
    // ------------------------------------------------------------------

    @Test
    @DisplayName("客户端抛出的 1004 原样冒泡，不被包装成 1007")
    void healthAdvice_shouldPropagate1004AsIs() {
        when(aiClient.chat(any())).thenThrow(
                new AiException(ResultCode.AI_UNAVAILABLE.getCode(), ResultCode.AI_UNAVAILABLE.getMessage()));

        AiException ex = assertThrows(AiException.class,
                () -> service.generateHealthAdvice(request()));
        assertEquals(ResultCode.AI_UNAVAILABLE.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("模型返回空白时抛 1007（不是 1005）")
    void healthAdvice_shouldThrow1007WhenModelReturnsBlank() {
        when(aiClient.chat(any())).thenReturn("   \n\t  ");

        AiException ex = assertThrows(AiException.class,
                () -> service.generateHealthAdvice(request()));
        assertEquals(ResultCode.AI_GENERATE_FAILED.getCode(), ex.getCode());
        assertEquals(ResultCode.AI_GENERATE_FAILED.getMessage(), ex.getMessage());
    }

    @Test
    @DisplayName("超长输出被截断到 300 字")
    void healthAdvice_shouldTruncateLongOutput() {
        when(aiClient.chat(any())).thenReturn("猫".repeat(1000));

        assertEquals(300, service.generateHealthAdvice(request()).getAdvice().length());
    }

    @Test
    @DisplayName("被截断的超长输出，免责声明依然完整——截断删不掉安全文案")
    void healthAdvice_shouldKeepDisclaimerEvenWhenAdviceIsTruncated() {
        when(aiClient.chat(any())).thenReturn("猫".repeat(1000));

        PetHealthAdviceVO vo = service.generateHealthAdvice(request());

        assertEquals(300, vo.getAdvice().length());
        // 这正是把 disclaimer 做成后端常量、而不是让模型写在正文末尾的原因
        assertNotNull(vo.getDisclaimer());
        assertTrue(vo.getDisclaimer().contains("不能替代兽医诊断"));
        assertTrue(vo.getDisclaimer().contains("宠物医院"));
    }

    @Test
    @DisplayName("markdown 代码围栏被剥掉")
    void healthAdvice_shouldStripCodeFence() {
        when(aiClient.chat(any())).thenReturn("```\n这是一段养护建议。\n```");

        assertEquals("这是一段养护建议。", service.generateHealthAdvice(request()).getAdvice());
    }

    @Test
    @DisplayName("带语言标识的代码围栏也被剥掉")
    void healthAdvice_shouldStripFenceWithLanguageTag() {
        when(aiClient.chat(any())).thenReturn("```text\n这是一段养护建议。\n```");

        assertEquals("这是一段养护建议。", service.generateHealthAdvice(request()).getAdvice());
    }

    @Test
    @DisplayName("模型输出被清洗：去引号、压空白、换行变空格")
    void healthAdvice_shouldCleanModelOutput() {
        when(aiClient.chat(any())).thenReturn("\"  第一句。\n\n第二句。  \"");

        assertEquals("第一句。 第二句。", service.generateHealthAdvice(request()).getAdvice());
    }

    @Test
    @DisplayName("体重 4.20 进提示词时是 4.2，不是 4.20")
    void healthAdvice_shouldSendCleanWeightToModel() {
        when(aiClient.chat(any())).thenReturn("这是一段养护建议。");
        PetHealthAdviceRequest req = request();
        req.setWeight(new BigDecimal("4.20"));

        service.generateHealthAdvice(req);

        String userMessage = capturedUserMessage();
        assertTrue(userMessage.contains("体重：4.2kg"), userMessage);
        assertFalse(userMessage.contains("4.20"), userMessage);
    }

    @Test
    @DisplayName("未填写的疫苗/绝育状态不会出现在提示词里")
    void healthAdvice_shouldNotMentionUnfilledVaccinationInPrompt() {
        when(aiClient.chat(any())).thenReturn("这是一段养护建议。");
        PetHealthAdviceRequest req = request();
        req.setIsVaccinated(null);
        req.setIsNeutered(null);

        service.generateHealthAdvice(req);

        String userMessage = capturedUserMessage();
        assertFalse(userMessage.contains("已接种疫苗"), userMessage);
        assertFalse(userMessage.contains("已绝育"), userMessage);
    }

    @Test
    @DisplayName("temperature 明显低于简介，避免健康类内容自由发挥")
    void healthAdvice_shouldUseLowerTemperatureThanDescription() {
        when(aiClient.chat(any())).thenReturn("这是一段养护建议。");

        service.generateHealthAdvice(request());

        ArgumentCaptor<AiChatRequest> captor = ArgumentCaptor.forClass(AiChatRequest.class);
        verify(aiClient).chat(captor.capture());
        assertEquals(0.3, captor.getValue().getTemperature());
    }
}
