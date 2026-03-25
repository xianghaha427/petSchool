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
    CAROUSEL_NOT_FOUND(1003, "轮播图不存在");

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
