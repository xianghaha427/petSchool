package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.ActivitySignupDTO;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.service.ActivityService;
import com.petschool.vo.ActivityVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 校园活动接口（公开读 + 用户报名）
 * <p>
 * 类上刻意不写 {@code @RequestMapping}，每个方法写全路径。原因是列表接口
 * {@code /activities} 在 WebMvcConfiguration 里被免登录放行，而写接口挂在
 * {@code /activities/{id}/signup} 上——路径写全了，才看得清哪一个被放行、哪一个没有。
 */
@Slf4j
@RestController
@Tag(name = "校园活动接口")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    /**
     * 活动列表（免登录，供首页浏览）
     */
    @GetMapping("/activities")
    @Operation(summary = "获取校园活动列表")
    public Result<List<ActivityVO>> listActivities() {
        return Result.success(activityService.listActivities());
    }

    /**
     * 当前用户报名过的活动（首页据此显示「已报名」按钮态）
     */
    @GetMapping("/my-activities")
    @Operation(summary = "获取当前用户报名的活动")
    public Result<List<ActivityVO>> listMySignups(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        return Result.success(activityService.listMySignups(userId));
    }

    /**
     * 报名活动
     */
    @PostMapping("/activities/{id}/signup")
    @Operation(summary = "报名校园活动")
    public Result<Void> signup(HttpServletRequest request,
                               @PathVariable("id") Long activityId,
                               @Valid @RequestBody ActivitySignupDTO dto) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("用户报名校园活动, activityId: {}, userId: {}", activityId, userId);
        activityService.signup(activityId, userId, dto);
        return Result.success();
    }

    /**
     * 取消报名
     */
    @DeleteMapping("/activities/{id}/signup")
    @Operation(summary = "取消报名校园活动")
    public Result<Void> cancelSignup(HttpServletRequest request,
                                     @PathVariable("id") Long activityId) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        log.info("用户取消校园活动报名, activityId: {}, userId: {}", activityId, userId);
        activityService.cancelSignup(activityId, userId);
        return Result.success();
    }
}
