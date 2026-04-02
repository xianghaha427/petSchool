package com.petschool.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 分页查询参数 DTO
 */
@Data
public class PetPageDTO implements Serializable {

    // 页码
    private Integer pageNum = 1;

    // 每页数量
    private Integer pageSize = 10;

    // 关键词搜索（名称或学号）
    private String keyword;

    // 学号
    private String studentId;

    // 宠物名称
    private String name;

    // 物种
    private String species;

    // 品种
    private String breed;

    // 性别：1-公，2-母
    private Integer gender;

    // 最小年龄
    private Integer minAge;

    // 最大年龄
    private Integer maxAge;

    // 排序：newest, oldest, name
    private String sort = "newest";
}
