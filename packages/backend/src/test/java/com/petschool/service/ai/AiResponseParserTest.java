package com.petschool.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * AI 返回内容解析的纯单元测试
 */
class AiResponseParserTest {

    private final ObjectMapper mapper = new ObjectMapper();

    // ------------------------------------------------------------------
    // stripCodeFence
    // ------------------------------------------------------------------

    @Test
    @DisplayName("去掉 ```json 代码围栏")
    void stripCodeFence_shouldRemoveJsonFence() {
        assertEquals("{\"a\":1}", AiResponseParser.stripCodeFence("```json\n{\"a\":1}\n```"));
    }

    @Test
    @DisplayName("去掉无语言标识的代码围栏")
    void stripCodeFence_shouldRemovePlainFence() {
        assertEquals("{\"a\":1}", AiResponseParser.stripCodeFence("```\n{\"a\":1}\n```"));
    }

    @Test
    @DisplayName("去掉单行写法的代码围栏")
    void stripCodeFence_shouldRemoveSingleLineFence() {
        assertEquals("{\"a\":1}", AiResponseParser.stripCodeFence("```json{\"a\":1}```"));
    }

    @Test
    @DisplayName("没有围栏时原样返回")
    void stripCodeFence_shouldKeepPlainJson() {
        assertEquals("{\"a\":1}", AiResponseParser.stripCodeFence("  {\"a\":1}  "));
    }

    @Test
    @DisplayName("null 输入返回 null")
    void stripCodeFence_shouldHandleNull() {
        assertNull(AiResponseParser.stripCodeFence(null));
    }

    // ------------------------------------------------------------------
    // extractAssistantText
    // ------------------------------------------------------------------

    @Test
    @DisplayName("content 为字符串")
    void extractAssistantText_shouldReadStringContent() throws Exception {
        JsonNode root = mapper.readTree(
                "{\"choices\":[{\"message\":{\"role\":\"assistant\",\"content\":\"你好\"}}]}");
        assertEquals("你好", AiResponseParser.extractAssistantText(root));
    }

    @Test
    @DisplayName("content 为分片数组")
    void extractAssistantText_shouldReadArrayContent() throws Exception {
        JsonNode root = mapper.readTree("""
                {"choices":[{"message":{"content":[
                    {"type":"text","text":"{\\"isPet\\":"},
                    {"type":"text","text":"true}"}
                ]}}]}""");
        assertEquals("{\"isPet\":true}", AiResponseParser.extractAssistantText(root));
    }

    @Test
    @DisplayName("响应结构异常时返回 null 而不抛异常")
    void extractAssistantText_shouldReturnNullOnUnexpectedShape() throws Exception {
        assertNull(AiResponseParser.extractAssistantText(null));
        assertNull(AiResponseParser.extractAssistantText(mapper.readTree("{}")));
        assertNull(AiResponseParser.extractAssistantText(mapper.readTree("{\"choices\":[]}")));
        assertNull(AiResponseParser.extractAssistantText(
                mapper.readTree("{\"choices\":[{\"message\":{}}]}")));
    }

    // ------------------------------------------------------------------
    // extractJsonObject
    // ------------------------------------------------------------------

    @Test
    @DisplayName("纯 JSON 直接解析")
    void extractJsonObject_shouldParsePlainJson() {
        JsonNode node = AiResponseParser.extractJsonObject("{\"isPet\":true}");
        assertNotNull(node);
        assertEquals(true, node.path("isPet").asBoolean());
    }

    @Test
    @DisplayName("JSON 夹在解释文字中也能抠出来")
    void extractJsonObject_shouldPickJsonOutOfProse() {
        String text = "好的，这是识别结果：\n{\"species\":\"cat\",\"ageMonths\":8}\n希望有帮助！";
        JsonNode node = AiResponseParser.extractJsonObject(text);
        assertNotNull(node);
        assertEquals("cat", node.path("species").asText());
        assertEquals(8, node.path("ageMonths").asInt());
    }

    @Test
    @DisplayName("嵌套括号与字符串内的括号都能正确配对")
    void extractJsonObject_shouldHandleNestedAndQuotedBraces() {
        JsonNode node = AiResponseParser.extractJsonObject("前缀 {\"a\":{\"b\":1},\"c\":\"}\"} 后缀");
        assertNotNull(node);
        assertEquals(1, node.path("a").path("b").asInt());
        assertEquals("}", node.path("c").asText());
    }

    @Test
    @DisplayName("内容非法时返回 null")
    void extractJsonObject_shouldReturnNullOnInvalidInput() {
        assertNull(AiResponseParser.extractJsonObject(null));
        assertNull(AiResponseParser.extractJsonObject("完全不是 JSON"));
        assertNull(AiResponseParser.extractJsonObject("{\"a\":1"));
        assertNull(AiResponseParser.extractJsonObject("{\"a\": 1 没有闭合"));
    }

    // ------------------------------------------------------------------
    // cleanPlainText
    // ------------------------------------------------------------------

    @Test
    @DisplayName("去引号、压空白、截断")
    void cleanPlainText_shouldTidyText() {
        assertEquals("这是一只 很乖的猫咪。",
                AiResponseParser.cleanPlainText("\"  这是一只  很乖的猫咪。\n\"", 150));
    }

    @Test
    @DisplayName("超长文本被截断到 maxChars")
    void cleanPlainText_shouldTruncate() {
        String long_ = "猫".repeat(300);
        String result = AiResponseParser.cleanPlainText(long_, 150);
        assertEquals(150, result.length());
    }

    @Test
    @DisplayName("空内容返回空串")
    void cleanPlainText_shouldReturnEmptyForBlank() {
        assertEquals("", AiResponseParser.cleanPlainText("   \n  ", 150));
        assertNull(AiResponseParser.cleanPlainText(null, 150));
    }
}
