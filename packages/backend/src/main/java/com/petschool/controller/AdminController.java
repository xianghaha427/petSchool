package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.common.constant.UserConstant;
import com.petschool.entity.User;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.mapper.UserMapper;
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
 * 管理员控制器
 */
@Slf4j
@RestController
@RequestMapping("/admin/pets/pending")
@Tag(name = "管理员待审核宠物接口")
public class AdminController {

    @Autowired
    private PetPendingService petPendingService;

    @Autowired
    private UserMapper userMapper;

    /**
     * 管理员查看所有待审核列表
     */
    @GetMapping
    @Operation(summary = "查看所有待审核列表")
    public Result<List<PetPendingVO>> getAllPendingList(HttpServletRequest request) {
        // 检查管理员权限
        checkAdmin权限(request);

        List<PetPendingVO> list = petPendingService.getAllPendingList();
        return Result.success(list);
    }

    /**
     * 管理员通过审核
     */
    @PutMapping("/{id}/approve")
    @Operation(summary = "通过审核")
    public Result<Void> approve(@PathVariable Long id, HttpServletRequest request) {
        // 检查管理员权限
        checkAdmin权限(request);

        petPendingService.approve(id);
        return Result.success();
    }

    /**
     * 管理员拒绝审核
     */
    @PutMapping("/{id}/reject")
    @Operation(summary = "拒绝审核")
    public Result<Void> reject(@PathVariable Long id,
                               @RequestParam String rejectReason,
                               HttpServletRequest request) {
        // 检查管理员权限
        checkAdmin权限(request);

        petPendingService.reject(id, rejectReason);
        return Result.success();
    }

    /**
     * 检查管理员权限
     */
    private void checkAdmin权限(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        User user = userMapper.selectById(userId);
        if (user == null || !UserConstant.EMPLOYEE.equals(user.getRole())) {
            throw new com.petschool.common.exception.BusinessException(403, "无管理员权限");
        }
    }
}
