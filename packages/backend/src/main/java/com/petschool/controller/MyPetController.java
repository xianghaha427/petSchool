package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.PetDTO;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.service.PetService;
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
 * 用户自己的宠物管理 Controller
 */
@Tag(name = "我的宠物相关接口")
@RestController
@RequestMapping("/my-pets")
@Slf4j
public class MyPetController {

    @Autowired
    private PetService petService;

    // 获取我的宠物列表
    @Operation(summary = "获取我的宠物列表")
    @GetMapping
    public Result<List<PetVO>> getMyPets(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("获取我的宠物列表, userId: {}", userId);
        List<PetVO> pets = petService.getMyPets(userId);
        return Result.success(pets);
    }

    // 更新我的宠物
    @Operation(summary = "更新我的宠物信息")
    @PutMapping("/{id}")
    public Result updateMyPet(
            HttpServletRequest request,
            @Parameter(description = "宠物 ID") @PathVariable("id") Long petId,
            @RequestBody PetDTO petDTO) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("更新我的宠物, petId={}, userId: {}", petId, userId);
        petService.updateMyPet(petId, userId, petDTO);
        return Result.success();
    }

    // 删除我的宠物
    @Operation(summary = "删除我的宠物")
    @DeleteMapping("/{id}")
    public Result deleteMyPet(
            HttpServletRequest request,
            @Parameter(description = "宠物 ID") @PathVariable("id") Long petId) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("删除我的宠物, petId={}, userId: {}", petId, userId);
        petService.deleteMyPet(petId, userId);
        return Result.success();
    }
}
