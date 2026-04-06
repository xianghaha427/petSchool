package com.petschool.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 待审核宠物 VO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetPendingVO {

    /**
     * 主键 ID
     */
    private Long id;

    /**
     * 提交用户ID
     */
    private Long userId;

    /**
     * 用户名（用于展示）
     */
    private String username;

    /**
     * 宠物姓名
     */
    private String name;

    /**
     * 种类（狗、猫等）
     */
    private String species;

    /**
     * 品种
     */
    private String breed;

    /**
     * 年龄（月）
     */
    private Integer age;

    /**
     * 体重（kg）
     */
    private BigDecimal weight;

    /**
     * 性别：1-公，2-母
     */
    private Integer gender;

    /**
     * 性别标签
     */
    private String genderLabel;

    /**
     * 照片 URL
     */
    private String photoUrl;

    /**
     * 简介
     */
    private String description;

    /**
     * 主人姓名
     */
    private String ownerName;

    /**
     * 主人联系方式
     */
    private String ownerContact;

    /**
     * 最近疫苗接种日期
     */
    private LocalDate vaccinationDate;

    /**
     * 是否已接种疫苗：0-否，1-是
     */
    private Integer isVaccinated;

    /**
     * 是否已绝育：0-否，1-是
     */
    private Integer isNeutered;

    /**
     * 健康状态备注
     */
    private String healthStatus;

    /**
     * 审核状态：0-待审核，1-已通过，2-已拒绝
     */
    private Integer status;

    /**
     * 状态标签
     */
    private String statusLabel;

    /**
     * 拒绝原因
     */
    private String rejectReason;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
