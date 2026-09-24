package com.petschool.service.impl;

import com.petschool.common.ResultCode;
import com.petschool.common.exception.BusinessException;
import com.petschool.config.properties.UploadProperties;
import com.petschool.service.FileStorageService;
import com.petschool.vo.FileUploadVO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 本地磁盘文件存储
 * <p>
 * 安全约定：文件名完全由服务端生成，原始文件名只用来提取扩展名，
 * 因此不存在路径穿越风险。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LocalFileStorageService implements FileStorageService {

    /** 允许的图片扩展名 */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final UploadProperties uploadProperties;

    @PostConstruct
    @Override
    public void initDirectory() {
        try {
            Path root = resolveRoot();
            Files.createDirectories(root);
            log.info("上传目录已就绪：{}", root);
        } catch (Exception e) {
            // 目录问题绝不能变成启动失败
            log.warn("上传目录创建失败，上传接口将不可用：{}，原因：{}", resolveRoot(), e.getMessage());
        }
    }

    @Override
    public Path resolveRoot() {
        return uploadProperties.resolveRoot();
    }

    @Override
    public FileUploadVO store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请选择要上传的图片");
        }
        if (file.getSize() > uploadProperties.getMaxBytes()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "图片不能超过 5MB，请压缩后重试");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "只支持上传图片文件");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "只支持 jpg、jpeg、png、webp 格式的图片");
        }

        String filename = DATE_FORMATTER.format(LocalDate.now())
                + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8)
                + "." + extension;

        Path root = resolveRoot();
        Path target = root.resolve(filename).normalize();
        // 双保险：文件名是自生成的，这里再确认一次没有逃出根目录
        if (!target.startsWith(root)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "非法的文件名");
        }

        try {
            Files.createDirectories(root);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            log.error("图片保存失败：{}", target, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED);
        }

        return FileUploadVO.builder()
                .url(uploadProperties.getUrlPrefix() + "/" + filename)
                .filename(filename)
                .size(file.getSize())
                .build();
    }

    /**
     * 从原始文件名中提取小写扩展名（不含点）
     */
    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return null;
        }
        // 统一分隔符后只取最后一段，避免 ../ 之类的干扰
        String name = originalFilename.replace('\\', '/');
        int slash = name.lastIndexOf('/');
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            return null;
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
