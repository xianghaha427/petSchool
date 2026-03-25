package com.petschool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petschool.entity.Carousel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 轮播图 Mapper 接口
 */
@Mapper
public interface CarouselMapper extends BaseMapper<Carousel> {

    /**
     * 查询启用的轮播图列表（按排序）
     */
    List<Carousel> selectEnabledCarousels();

    /**
     * 根据 ID 查询轮播图
     */
    Carousel selectCarouselById(@Param("id") Long id);
}
