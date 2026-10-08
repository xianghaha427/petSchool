package com.petschool.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * AI 生成宠物养护建议请求，字段全部可空
 * <p>
 * 刻意传字段而不是传 petId：编排层因此不需要依赖 PetService/PetMapper，
 * 保持"两个依赖、可纯单测"的形态。安全性上没有损失——GET /pets/{id}
 * 本来就返回原始 Pet 实体且无归属校验，这些字段调用方自己就能查到。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "AI 生成宠物养护建议请求")
public class PetHealthAdviceRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "宠物名字")
    private String name;

    @Schema(description = "种类")
    private String species;

    @Schema(description = "品种")
    private String breed;

    @Schema(description = "月龄（注意单位是月，不是岁）")
    private Integer ageMonths;

    @Schema(description = "性别：1-公，2-母")
    private Integer gender;

    @Schema(description = "体重（kg）")
    private BigDecimal weight;

    /**
     * 刻意用 Integer 而不是 Boolean：数据库里 is_vaccinated 是三态
     * （1=是 / 0=否 / NULL=未填写）。若用 Boolean，Jackson 会把 null 和 false
     * 都变成 false，于是"没填"会被模型当成"没接种"，在健康类内容里是错误的暗示。
     */
    @Schema(description = "是否已接种疫苗：1-是，0-否，null-未填写（会从提示词里省略）")
    private Integer isVaccinated;

    @Schema(description = "是否已绝育：1-是，0-否，null-未填写（会从提示词里省略）")
    private Integer isNeutered;

    @Schema(description = "健康状况说明")
    private String healthStatus;
}
