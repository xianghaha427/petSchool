package com.petschool.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

/**
 * AI 返回内容解析工具
 * <p>
 * 大模型经常会画蛇添足地加上 markdown 代码围栏或解释性文字，
 * 这里提供一组容错解析方法，把"脏"回复还原成可用的文本 / JSON。
 */
@Slf4j
public final class AiResponseParser {

    /** 首尾需要剥掉的引号类字符（含中英文引号与反引号） */
    private static final String QUOTE_CHARS = "\"'`“”‘’「」";

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private AiResponseParser() {
    }

    /**
     * 从 OpenAI 兼容响应中取出助手回复文本。
     * 兼容 choices[0].message.content 为字符串或数组两种形态。
     *
     * @return 回复文本，取不到时返回 null
     */
    public static String extractAssistantText(JsonNode root) {
        if (root == null || root.isNull() || root.isMissingNode()) {
            return null;
        }
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            return null;
        }
        JsonNode message = choices.get(0).path("message");
        if (message.isMissingNode() || message.isNull()) {
            return null;
        }
        JsonNode content = message.path("content");

        // 形态一：content 是纯字符串
        if (content.isTextual()) {
            return content.asText();
        }

        // 形态二：content 是分片数组，例如 [{"type":"text","text":"..."}]
        if (content.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode part : content) {
                if (part == null || part.isNull()) {
                    continue;
                }
                JsonNode text = part.path("text");
                if (text.isTextual()) {
                    sb.append(text.asText());
                }
            }
            return sb.length() == 0 ? null : sb.toString();
        }

        return null;
    }

    /**
     * 去掉 markdown 代码围栏，支持 ```json ... ```、``` ... ``` 以及单行写法
     */
    public static String stripCodeFence(String raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim();
        if (s.isEmpty()) {
            return s;
        }
        if (s.startsWith("```")) {
            s = s.substring(3);
            // 跳过语言标识（json / JSON / text ...），停在第一个 JSON 起始字符上
            int i = 0;
            while (i < s.length()) {
                char c = s.charAt(i);
                if (Character.isWhitespace(c) || c == '{' || c == '[') {
                    break;
                }
                i++;
            }
            s = s.substring(i);
        }
        if (s.endsWith("```")) {
            s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }

    /**
     * 从自由文本中抠出第一个括号平衡的 {...} 子串并解析
     *
     * @return 解析成功返回 JSON 对象节点，找不到或非法返回 null
     */
    public static JsonNode extractJsonObject(String text) {
        if (text == null) {
            return null;
        }
        int start = text.indexOf('{');
        if (start < 0) {
            return null;
        }
        int depth = 0;
        boolean inString = false;
        boolean escaped = false;
        for (int i = start; i < text.length(); i++) {
            char c = text.charAt(i);
            if (inString) {
                if (escaped) {
                    escaped = false;
                } else if (c == '\\') {
                    escaped = true;
                } else if (c == '"') {
                    inString = false;
                }
                continue;
            }
            if (c == '"') {
                inString = true;
            } else if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return parseObject(text.substring(start, i + 1));
                }
            }
        }
        return null;
    }

    /**
     * 清洗纯文本：去首尾引号与换行、把连续空白压成单个空格、按字符数截断
     *
     * @param maxChars 最大字符数，<=0 表示不截断
     */
    public static String cleanPlainText(String raw, int maxChars) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim();
        // 连续空白（含换行、制表符）压成单空格
        s = s.replaceAll("\\s+", " ");
        s = stripSurroundingQuotes(s).trim();
        if (maxChars > 0 && s.length() > maxChars) {
            int end = maxChars;
            // 避免把代理对（emoji 等）从中间劈开
            if (Character.isHighSurrogate(s.charAt(end - 1))) {
                end--;
            }
            s = s.substring(0, end).trim();
        }
        return s;
    }

    private static JsonNode parseObject(String candidate) {
        try {
            JsonNode node = MAPPER.readTree(candidate);
            return node != null && node.isObject() ? node : null;
        } catch (Exception e) {
            log.debug("JSON 解析失败，忽略：{}", e.getMessage());
            return null;
        }
    }

    private static String stripSurroundingQuotes(String s) {
        int start = 0;
        int end = s.length();
        while (start < end && QUOTE_CHARS.indexOf(s.charAt(start)) >= 0) {
            start++;
        }
        while (end > start && QUOTE_CHARS.indexOf(s.charAt(end - 1)) >= 0) {
            end--;
        }
        return s.substring(start, end);
    }
}
