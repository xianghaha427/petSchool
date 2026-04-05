package com.petschool.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 宠物 DTO - 用于接收前端请求参数
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "宠物信息")
public class PetDTO implements Serializable {

    // 主键 ID
    @Schema(description = "宠物ID，更新时需要")
    private Long id;

    @Schema(description = "学号")
    @NotBlank(message = "学号不能为空")
    private String studentId;

    @Schema(description = "宠物姓名")
    @NotBlank(message = "宠物姓名不能为空")
    @Size(max = 64, message = "宠物姓名不能超过64字符")
    private String name;

    @Schema(description = "种类（狗、猫等）")
    @NotBlank(message = "种类不能为空")
    private String species;

    @Schema(description = "品种")
    @Size(max = 64, message = "品种不能超过64字符")
    private String breed;

    @Schema(description = "年龄（月）")
    @NotNull(message = "年龄不能为空")
    @Min(value = 1, message = "年龄最小为1个月")
    @Max(value = 240, message = "年龄最大为240个月（20年）")
    private Integer age;

    @Schema(description = "体重（kg）")
    @NotNull(message = "体重不能为空")
    @DecimalMin(value = "0.1", message = "体重最小为0.1kg")
    @DecimalMax(value = "200.0", message = "体重最大为200kg")
    private BigDecimal weight;

    @Schema(description = "性别：1-公，2-母")
    @NotNull(message = "性别不能为空")
    @Min(value = 1, message = "性别值无效")
    @Max(value = 2, message = "性别值无效")
    private Integer gender;

    @Schema(description = "照片 URL")
    @NotBlank(message = "照片不能为空")
    private String photoUrl;

    @Schema(description = "简介")
    @Size(max = 512, message = "简介不能超过512字符")
    private String description;

    @Schema(description = "主人姓名")
    @Size(max = 64, message = "主人姓名不能超过64字符")
    private String ownerName;

    @Schema(description = "主人联系方式")
    @Size(max = 128, message = "联系方式不能超过128字符")
    private String ownerContact;

    @Schema(description = "最近疫苗接种日期")
    private LocalDate vaccinationDate;

    @Schema(description = "是否已接种疫苗：0-否，1-是")
    @Min(value = 0, message = "疫苗状态值无效")
    @Max(value = 1, message = "疫苗状态值无效")
    private Integer isVaccinated;

    @Schema(description = "是否已绝育：0-否，1-是")
    @Min(value = 0, message = "绝育状态值无效")
    @Max(value = 1, message = "绝育状态值无效")
    private Integer isNeutered;

    @Schema(description = "健康状态备注")
    @Size(max = 128, message = "健康状态备注不能超过128字符")
    private String healthStatus;

    @Schema(description = "状态：0-禁用，1-正常")
    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;
}
