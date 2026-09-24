package com.petschool.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 宠物照片识别结果 VO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "宠物照片识别结果")
public class PetRecognitionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "画面中是否存在宠物")
    private Boolean isPet;

    @Schema(description = "物种，固定为 dog / cat / other")
    private String species;

    @Schema(description = "物种中文标签")
    private String speciesLabel;

    @Schema(description = "品种")
    private String breed;

    @Schema(description = "性别：1-公，2-母，无法判断为 null")
    private Integer gender;

    @Schema(description = "性别标签")
    private String genderLabel;

    @Schema(description = "毛色")
    private String color;

    @Schema(description = "估算月龄")
    private Integer ageMonths;

    @Schema(description = "年龄阶段：幼年 / 成年 / 老年")
    private String ageStage;

    @Schema(description = "识别置信度，0~1")
    private Double confidence;

    @Schema(description = "养护建议")
    private String tips;

    @Schema(description = "本次识别使用的模型")
    private String model;

    @Schema(description = "是否为降级结果（AI 不可用时的兜底数据）")
    private Boolean degraded;
}
