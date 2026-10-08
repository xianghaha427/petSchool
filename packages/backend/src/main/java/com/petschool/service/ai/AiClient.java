package com.petschool.service.ai;

/**
 * AI 传输层抽象
 * <p>
 * 实现约定：任何失败都必须抛出 {@link AiException}，绝不返回 null。
 */
public interface AiClient {

    /** 当前客户端是否可用（配置是否就绪） */
    boolean isAvailable();

    /** 供应商标识，仅用于日志 */
    String providerName();

    /**
     * 发起一次对话补全
     *
     * @return 助手回复的纯文本，非 null
     * @throws AiException 调用失败、超时、未配置或返回内容为空
     */
    String chat(AiChatRequest request);
}
