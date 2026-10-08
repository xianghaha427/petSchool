package com.petschool.common.exception;

import com.petschool.common.Result;
import com.petschool.common.ResultCode;
import com.petschool.service.ai.AiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.error("业务异常：{}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("参数校验失败");
        log.error("参数校验异常：{}", message);
        return Result.error(ResultCode.BAD_REQUEST.getCode(), message);
    }

    /**
     * 处理 AI 调用异常（未配置 key、超时、返回内容不可解析等）
     * <p>
     * 必须排在下面的 Exception 之前单独处理：AI 失败是有明确业务语义的
     * （该让用户「手动填写」），不该被吞成笼统的「服务器内部错误」。
     */
    @ExceptionHandler(AiException.class)
    public Result<?> handleAiException(AiException e) {
        log.warn("AI 异常：code={}, message={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理上传文件超过 multipart 限制的异常
     * <p>
     * 少了这个 handler，请求体超过 spring.servlet.multipart.max-request-size 时会冒到
     * 下面的 Exception 分支，前端只能看到「服务器内部错误」，完全看不出是文件太大。
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Result<?> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.warn("上传文件超过大小限制：{}", e.getMessage());
        return Result.error(ResultCode.BAD_REQUEST.getCode(), "图片不能超过 5MB，请压缩后重试");
    }

    /**
     * 处理其他异常
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常：{}", e.getMessage(), e);
        return Result.error(ResultCode.INTERNAL_ERROR.getCode(), "服务器内部错误");
    }
}
