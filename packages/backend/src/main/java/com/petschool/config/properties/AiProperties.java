package com.petschool.config.properties;

import lombok.Data;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * AI 能力相关配置
 * <p>
 * api-key 允许为空：缺失时应用仍可正常启动，只是 AI 接口会返回 1004（AI 服务暂时不可用）。
 */
@Component
@ConfigurationProperties(prefix = "pet.ai")
@Data
public class AiProperties {

    /** 供应商 API Key，通过环境变量 DASHSCOPE_API_KEY 注入，缺省为空 */
    @ToString.Exclude
    private String apiKey;

    /** OpenAI 兼容模式的 base url */
    private String baseUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1";

    /** 对话补全路径 */
    private String chatPath = "/chat/completions";

    /** 图像识别使用的多模态模型 */
    private String visionModel = "qwen3-vl-flash";

    /** 文本生成使用的模型 */
    private String textModel = "qwen-plus";

    /** 建立连接超时（毫秒） */
    private int connectTimeoutMs = 3000;

    /** 读取响应超时（毫秒） */
    private int readTimeoutMs = 30000;

    /** 允许识别的图片最大字节数 */
    private long maxImageBytes = 4194304L;

    /** 是否要求供应商返回严格 JSON */
    private boolean jsonMode = false;

    /** 是否启用 mock 模式（本地演示，不调用真实 AI） */
    private boolean mock = false;

    /** mock 模式下的模拟耗时（毫秒），用于保留前端 loading 态 */
    private long mockDelayMs = 800L;

    /**
     * 是否已完成必要配置（mock 模式下永远视为已配置）
     */
    public boolean isConfigured() {
        return !mock && apiKey != null && !apiKey.isBlank();
    }
}
