package com.petschool.service.ai;

import lombok.Getter;

/**
 * AI 调用相关异常，携带业务错误码，由 GlobalExceptionHandler 统一收口
 */
@Getter
public class AiException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /** 业务错误码 */
    private final Integer code;

    public AiException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public AiException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
