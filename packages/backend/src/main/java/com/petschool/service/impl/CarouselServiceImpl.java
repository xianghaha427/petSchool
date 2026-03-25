package com.petschool.service.impl;

import com.petschool.common.ResultCode;
import com.petschool.common.exception.BusinessException;
import com.petschool.entity.Carousel;
import com.petschool.mapper.CarouselMapper;
import com.petschool.service.CarouselService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 轮播图服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CarouselServiceImpl implements CarouselService {

    private final CarouselMapper carouselMapper;

    @Override
    public List<Carousel> getEnabledCarousels() {
        log.info("查询启用的轮播图列表");
        return carouselMapper.selectEnabledCarousels();
    }

    @Override
    public Carousel getCarouselById(Long id) {
        log.info("根据 ID 查询轮播图，id={}", id);

        Carousel carousel = carouselMapper.selectCarouselById(id);
        if (carousel == null) {
            throw new BusinessException(ResultCode.CAROUSEL_NOT_FOUND);
        }

        return carousel;
    }
}
