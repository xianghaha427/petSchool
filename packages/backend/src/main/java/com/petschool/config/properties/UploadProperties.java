package com.petschool.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 本地文件上传相关配置
 */
@Component
@ConfigurationProperties(prefix = "pet.upload")
@Data
public class UploadProperties {

    /** 上传目录（相对路径以进程工作目录为基准） */
    private String dir = "./uploads";

    /** 对外访问前缀 */
    private String urlPrefix = "/api/uploads";

    /** 单个文件最大字节数 */
    private long maxBytes = 4194304L;

    /**
     * 上传目录的绝对规范化路径，供静态资源映射使用
     */
    public Path resolveRoot() {
        return Paths.get(dir == null || dir.isBlank() ? "./uploads" : dir)
                .toAbsolutePath()
                .normalize();
    }
}
