package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.PasswordChangeDTO;
import com.petschool.dto.UserProfileUpdateDTO;
import com.petschool.entity.User;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户个人中心 Controller
 */
@Tag(name = "用户个人中心相关接口")
@RestController
@RequestMapping("/users")
@Slf4j
public class UserProfileController {

    @Autowired
    private UserService userService;

    // 获取当前用户资料
    @Operation(summary = "获取当前用户资料")
    @GetMapping("/profile")
    public Result<User> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("获取用户资料, userId: {}", userId);
        User user = userService.getbyId(userId);
        // 密码置空
        user.setPassword(null);
        return Result.success(user);
    }

    // 更新当前用户资料
    @Operation(summary = "更新当前用户资料")
    @PutMapping("/profile")
    public Result updateProfile(HttpServletRequest request,
                                @RequestBody UserProfileUpdateDTO profileDTO) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("更新用户资料, userId: {}", userId);
        userService.updateProfile(userId, profileDTO);
        return Result.success();
    }

    // 修改密码
    @Operation(summary = "修改密码")
    @PutMapping("/password")
    public Result changePassword(HttpServletRequest request,
                                  @RequestBody PasswordChangeDTO passwordDTO) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("修改密码, userId: {}", userId);
        userService.changePassword(userId, passwordDTO);
        return Result.success();
    }
}
