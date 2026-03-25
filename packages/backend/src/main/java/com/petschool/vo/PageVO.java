package com.petschool.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 分页响应 VO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PageVO<T> implements Serializable {

    // 总记录数
    private Long total;

    // 总页数
    private Integer pages;

    // 当前页码
    private Integer pageNum;

    // 每页数量
    private Integer pageSize;

    // 数据列表
    private List<T> list;
}
