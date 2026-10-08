package com.petschool.common;

import lombok.Getter;

/**
 * 响应状态码枚举
 */
@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),

    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),

    INTERNAL_ERROR(500, "服务器内部错误"),

    // 业务错误码
    PET_NOT_FOUND(1001, "宠物信息不存在"),
    STUDENT_ID_DUPLICATE(1002, "学号已存在"),
    CAROUSEL_NOT_FOUND(1003, "轮播图不存在"),
    AI_UNAVAILABLE(1004, "AI 服务暂时不可用，请手动填写"),
    AI_RECOGNIZE_FAILED(1005, "AI 识别失败，请手动填写"),
    FILE_UPLOAD_FAILED(1006, "图片上传失败"),
    // 不复用 1005：那是"AI 识别失败"，用在养护建议上会读成"AI 识别失败"，与用户实际动作对不上
    AI_GENERATE_FAILED(1007, "AI 生成建议失败，请稍后重试"),

    // 校园活动
    ACTIVITY_NOT_FOUND(1008, "活动不存在"),
    ACTIVITY_SIGNUP_CLOSED(1009, "报名已截止"),
    ACTIVITY_ALREADY_SIGNED_UP(1010, "你已报名该活动"),
    ACTIVITY_SIGNUP_NOT_FOUND(1011, "你还没有报名该活动");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
