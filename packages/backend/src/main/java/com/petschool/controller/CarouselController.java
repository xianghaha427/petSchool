package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.entity.Carousel;
import com.petschool.service.CarouselService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 轮播图 Controller
 */
@Tag(name = "轮播图管理")
@RestController
@RequestMapping("/carousel")
@RequiredArgsConstructor
public class CarouselController {

    private final CarouselService carouselService;

    @Operation(summary = "查询启用的轮播图列表")
    @GetMapping
    public Result<List<Carousel>> getEnabledCarousels() {
        List<Carousel> carousels = carouselService.getEnabledCarousels();
        return Result.success(carousels);
    }

    @Operation(summary = "根据 ID 查询轮播图")
    @GetMapping("/{id}")
    public Result<Carousel> getCarouselById(
            @Parameter(description = "轮播图 ID") @PathVariable Long id) {
        Carousel carousel = carouselService.getCarouselById(id);
        return Result.success(carousel);
    }
}
