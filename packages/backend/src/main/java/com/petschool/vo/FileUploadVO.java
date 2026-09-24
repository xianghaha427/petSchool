package com.petschool.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 文件上传结果 VO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "文件上传结果")
public class FileUploadVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "可直接用于展示的访问地址")
    private String url;

    @Schema(description = "服务端生成的文件名")
    private String filename;

    @Schema(description = "文件大小（字节）")
    private Long size;
}
