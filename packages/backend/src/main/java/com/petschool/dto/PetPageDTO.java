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

    // 学号
    private String studentId;

    // 宠物名称
    private String name;

    // 物种
    private String species;
}
