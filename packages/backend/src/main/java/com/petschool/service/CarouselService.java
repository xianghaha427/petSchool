package com.petschool.service;

import com.petschool.entity.Carousel;
import java.util.List;

/**
 * 轮播图服务接口
 */
public interface CarouselService {

    /**
     * 查询启用的轮播图列表
     */
    List<Carousel> getEnabledCarousels();

    /**
     * 根据 ID 查询轮播图
     */
    Carousel getCarouselById(Long id);
}
