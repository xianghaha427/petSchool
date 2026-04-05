package com.petschool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 宠物信息实体类
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("pet")
public class Pet {

    /**
     * 主键 ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 创建用户ID
     */
    private Long userId;

    /**
     * 学号（格式：P20240001）
     */
    private String studentId;

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
     * 状态：0-禁用，1-正常
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
