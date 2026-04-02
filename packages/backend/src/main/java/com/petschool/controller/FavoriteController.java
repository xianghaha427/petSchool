package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.service.FavoriteService;
import com.petschool.vo.PetVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 收藏 Controller
 */
@Tag(name = "收藏相关接口")
@RestController
@RequestMapping("/favorites")
@Slf4j
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    // 获取我的收藏列表
    @Operation(summary = "获取我的收藏列表")
    @GetMapping
    public Result<List<PetVO>> getMyFavorites(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("获取我的收藏列表, userId: {}", userId);
        List<PetVO> favorites = favoriteService.getUserFavorites(userId);
        return Result.success(favorites);
    }

    // 添加收藏
    @Operation(summary = "添加收藏")
    @PostMapping("/{petId}")
    public Result addFavorite(HttpServletRequest request,
                               @Parameter(description = "宠物 ID") @PathVariable("petId") Long petId) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("添加收藏, userId: {}, petId: {}", userId, petId);
        favoriteService.addFavorite(userId, petId);
        return Result.success();
    }

    // 取消收藏
    @Operation(summary = "取消收藏")
    @DeleteMapping("/{petId}")
    public Result removeFavorite(HttpServletRequest request,
                                  @Parameter(description = "宠物 ID") @PathVariable("petId") Long petId) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("取消收藏, userId: {}, petId: {}", userId, petId);
        favoriteService.removeFavorite(userId, petId);
        return Result.success();
    }

    // 检查是否已收藏
    @Operation(summary = "检查是否已收藏")
    @GetMapping("/check/{petId}")
    public Result<Boolean> checkFavorite(HttpServletRequest request,
                                           @Parameter(description = "宠物 ID") @PathVariable("petId") Long petId) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("检查是否已收藏, userId: {}, petId: {}", userId, petId);
        boolean favorited = favoriteService.isFavorited(userId, petId);
        return Result.success(favorited);
    }
}
