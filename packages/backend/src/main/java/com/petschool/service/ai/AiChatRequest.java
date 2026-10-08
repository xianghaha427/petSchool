package com.petschool.service.ai;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 与供应商无关的对话补全请求
 */
@Data
@Builder
public class AiChatRequest {

    /** 模型名 */
    private String model;

    /** 消息列表，第一条通常是 system */
    private List<AiChatMessage> messages;

    /** 采样温度 */
    private Double temperature;

    /** 最大输出 token 数 */
    private Integer maxTokens;
}
