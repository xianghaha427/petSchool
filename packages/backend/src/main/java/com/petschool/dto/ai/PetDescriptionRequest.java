package com.petschool.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AI 生成宠物简介请求，字段全部可空
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "AI 生成宠物简介请求")
public class PetDescriptionRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "宠物名字")
    private String name;

    @Schema(description = "种类")
    private String species;

    @Schema(description = "品种")
    private String breed;

    @Schema(description = "月龄")
    private Integer ageMonths;

    @Schema(description = "性别：1-公，2-母")
    private Integer gender;

    @Schema(description = "毛色")
    private String color;

    @Schema(description = "关键词，例如：粘人、爱睡觉")
    private String keywords;
}
