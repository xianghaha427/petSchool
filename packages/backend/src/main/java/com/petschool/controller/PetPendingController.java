package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.PetPendingDTO;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.service.PetPendingService;
import com.petschool.vo.PetPendingVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 待审核宠物控制器
 */
@Slf4j
@RestController
@RequestMapping("/pets/pending")
@Tag(name = "待审核宠物接口")
public class PetPendingController {

    @Autowired
    private PetPendingService petPendingService;

    /**
     * 用户提交待审核登记
     */
    @PostMapping
    @Operation(summary = "提交待审核登记")
    public Result<Void> submitPending(@RequestBody PetPendingDTO petPendingDTO, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        petPendingService.submitPending(petPendingDTO, userId);
        return Result.success();
    }

    /**
     * 用户查看自己的待审核列表
     */
    @GetMapping("/my")
    @Operation(summary = "查看我的待审核列表")
    public Result<List<PetPendingVO>> getMyPendingList(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        List<PetPendingVO> list = petPendingService.getMyPendingList(userId);
        return Result.success(list);
    }
}
