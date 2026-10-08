package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.ActivityCreateDTO;
import com.petschool.entity.User;
import com.petschool.service.ActivityService;
import com.petschool.utils.AdminChecker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理员活动接口
 * <p>
 * 写接口刻意与公开的 {@link ActivityController} 分成两个类：WebMvcConfiguration 里
 * 放行了 {@code /activities}，若把创建也挂在这个前缀下，放行规则很容易被写宽成
 * {@code /activities/**}，那匿名就能建活动了。
 */
@Slf4j
@RestController
@RequestMapping("/admin/activities")
@Tag(name = "管理员活动接口")
public class AdminActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private AdminChecker adminChecker;

    /**
     * 创建校园活动（仅管理员）
     */
    @PostMapping
    @Operation(summary = "创建校园活动")
    public Result<Void> createActivity(HttpServletRequest request,
                                       @Valid @RequestBody ActivityCreateDTO dto) {
        User admin = adminChecker.check(request);
        log.info("管理员创建校园活动, userId: {}, title: {}", admin.getId(), dto.getTitle());
        activityService.createActivity(dto, admin.getId());
        return Result.success();
    }
}
