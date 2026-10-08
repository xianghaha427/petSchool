package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.service.FileStorageService;
import com.petschool.vo.FileUploadVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传 Controller
 * <p>
 * /files/** 不在 JwtTokenInterceptor 的放行名单里，所以上传必须携带 token。
 */
@Tag(name = "文件上传")
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @Operation(summary = "上传图片，返回可访问地址")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<FileUploadVO> upload(
            @Parameter(description = "图片文件") @RequestPart("file") MultipartFile file) {
        return Result.success(fileStorageService.store(file));
    }
}
