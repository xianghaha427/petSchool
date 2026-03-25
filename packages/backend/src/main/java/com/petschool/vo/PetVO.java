package com.petschool.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 宠物 VO - 用于返回给前端的视图对象
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetVO implements Serializable {

    // 主键 ID
    private Long id;

    // 学号
    private String studentId;

    // 宠物姓名
    private String name;

    // 种类（狗、猫等）
    private String species;

    // 品种
    private String breed;

    // 年龄（月）
    private Integer age;

    // 体重（kg）
    private BigDecimal weight;

    // 性别：1-公，2-母
    private Integer gender;

    // 性别标签
    private String genderLabel;

    // 照片 URL
    private String photoUrl;

    // 简介
    private String description;

    // 主人姓名
    private String ownerName;

    // 主人联系方式
    private String ownerContact;

    // 最近疫苗接种日期
    private LocalDate vaccinationDate;

    // 是否已接种疫苗：0-否，1-是
    private Integer isVaccinated;

    // 是否已绝育：0-否，1-是
    private Integer isNeutered;

    // 健康状态备注
    private String healthStatus;

    // 状态：0-禁用，1-正常
    private Integer status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}
