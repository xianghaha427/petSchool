package com.petschool.service;

import com.petschool.vo.FileUploadVO;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

/**
 * 文件存储服务
 */
public interface FileStorageService {

    /**
     * 保存上传的文件
     *
     * @return 包含可访问 url 的结果
     */
    FileUploadVO store(MultipartFile file);

    /** 存储根目录 */
    Path resolveRoot();

    /** 初始化目录，应用启动时调用 */
    void initDirectory();
}
