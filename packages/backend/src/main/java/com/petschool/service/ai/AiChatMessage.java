package com.petschool.service.ai;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 与供应商无关的对话消息
 */
@Data
@Builder
public class AiChatMessage {

    /** 角色：system / user / assistant */
    private String role;

    /** 文本内容 */
    private String text;

    /** 图片 data url 列表，例如 data:image/png;base64,xxxx */
    private List<String> imageDataUrls;

    public static AiChatMessage system(String text) {
        return AiChatMessage.builder().role("system").text(text).build();
    }

    public static AiChatMessage user(String text) {
        return AiChatMessage.builder().role("user").text(text).build();
    }

    public static AiChatMessage userWithImage(String text, String dataUrl) {
        return AiChatMessage.builder()
                .role("user")
                .text(text)
                .imageDataUrls(List.of(dataUrl))
                .build();
    }
}
