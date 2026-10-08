package com.petschool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.petschool.common.ResultCode;
import com.petschool.common.constant.ActivityConstant;
import com.petschool.common.exception.BusinessException;
import com.petschool.dto.ActivityCreateDTO;
import com.petschool.dto.ActivitySignupDTO;
import com.petschool.entity.Activity;
import com.petschool.entity.ActivitySignup;
import com.petschool.mapper.ActivityMapper;
import com.petschool.mapper.ActivitySignupMapper;
import com.petschool.service.ActivityService;
import com.petschool.vo.ActivityVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 校园活动服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityMapper activityMapper;

    private final ActivitySignupMapper signupMapper;

    // ==================== 报名窗口 ====================

    /**
     * 报名窗口判定：「现在是否早于 开始时间 - 24 小时」。
     * <p>
     * 报名窗口是 {@code [现在, 开始时间 - 24h)}：距开始不足 24 小时之后，
     * 卡片上就显示成「即将开始」，报名同时截止；活动已经开始或结束当然更不能报。
     * 换句话说<b>只有「报名中」这一个状态能报名</b>。
     * <p>
     * 这个条件恰好等价于前端 activityStatus.ts 的 {@code canRegister()}
     * （{@code status === '报名中'}）。24 小时这个阈值来自
     * {@link ActivityConstant#SIGNUP_LEAD}，前端另有一份 STARTING_SOON_MS，
     * 两边必须一致——见该常量的说明。
     * <p>
     * 时间缺失时返回 false（宁可不让报名，也不要 NPE 把请求打成 500）。
     */
    static boolean isSignupOpen(LocalDateTime now, LocalDateTime startTime) {
        if (now == null || startTime == null) {
            return false;
        }
        return now.isBefore(startTime.minus(ActivityConstant.SIGNUP_LEAD));
    }

    /**
     * 报名窗口已关则抛 1009
     */
    private void assertSignupOpen(Activity activity) {
        if (!isSignupOpen(LocalDateTime.now(), activity.getStartTime())) {
            throw new BusinessException(ResultCode.ACTIVITY_SIGNUP_CLOSED);
        }
    }

    // ==================== 查询 ====================

    @Override
    public List<ActivityVO> listActivities() {
        QueryWrapper<Activity> wrapper = new QueryWrapper<>();
        wrapper.eq("status", ActivityConstant.ENABLE);
        wrapper.orderByDesc("start_time");
        List<Activity> activities = activityMapper.selectList(wrapper);

        if (activities == null || activities.isEmpty()) {
            return new ArrayList<>();
        }

        Map<Long, Integer> counts = countSignupsByActivity();
        // 列表接口是匿名放行的，拿不到 userId，signedUp 一律 false
        return activities.stream()
                .map(a -> toVO(a, counts.getOrDefault(a.getId(), 0), false))
                .collect(Collectors.toList());
    }

    @Override
    public List<ActivityVO> listMySignups(Long userId) {
        QueryWrapper<ActivitySignup> mineWrapper = new QueryWrapper<>();
        mineWrapper.eq("user_id", userId);
        List<ActivitySignup> mine = signupMapper.selectList(mineWrapper);

        if (mine == null || mine.isEmpty()) {
            return new ArrayList<>();
        }

        Set<Long> activityIds = mine.stream()
                .map(ActivitySignup::getActivityId)
                .collect(Collectors.toSet());

        // 用 selectBatchIds 一次取回，不要循环 selectById
        List<Activity> activities = activityMapper.selectBatchIds(activityIds);
        if (activities == null || activities.isEmpty()) {
            return new ArrayList<>();
        }

        Map<Long, Integer> counts = countSignupsByActivity();
        return activities.stream()
                .map(a -> toVO(a, counts.getOrDefault(a.getId(), 0), true))
                .collect(Collectors.toList());
    }

    // ==================== 创建 ====================

    @Override
    public void createActivity(ActivityCreateDTO dto, Long adminId) {
        if (!dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "结束时间必须晚于开始时间");
        }

        Activity activity = new Activity();
        // 这里刻意不用 BeanUtils.copyProperties：DTO 的 startAt/endAt 与实体的
        // startTime/endTime 不同名，copyProperties 会静默跳过这两个字段，
        // 结果是 NOT NULL 列拿到 null 在 insert 时才炸。逐个显式赋值，漏了编译期就能看出来。
        activity.setTitle(dto.getTitle());
        activity.setDescription(dto.getDescription());
        activity.setLocation(dto.getLocation());
        activity.setStartTime(dto.getStartAt());
        activity.setEndTime(dto.getEndAt());
        activity.setCoverUrl(dto.getCoverUrl());
        // 配色漏传时回落默认值（@Pattern 对 null 放行，见 ActivityCreateDTO 的说明）
        activity.setTheme(dto.getTheme() == null || dto.getTheme().isBlank()
                ? ActivityConstant.DEFAULT_THEME
                : dto.getTheme());
        activity.setStatus(ActivityConstant.ENABLE);
        activity.setCreateUserId(adminId);

        LocalDateTime now = LocalDateTime.now();
        activity.setCreateTime(now);
        activity.setUpdateTime(now);

        activityMapper.insert(activity);
        log.info("管理员创建校园活动成功, activityId: {}, userId: {}", activity.getId(), adminId);
    }

    // ==================== 报名 / 取消 ====================

    @Override
    public void signup(Long activityId, Long userId, ActivitySignupDTO dto) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null || !ActivityConstant.ENABLE.equals(activity.getStatus())) {
            // 已下架的活动对外等同于不存在，不额外暴露「存在但下架」这个信息
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        assertSignupOpen(activity);

        // 前置查重只是为了给出友好文案；并发下两个请求可能同时通过这里，
        // 真正的防线是 uk_activity_user 唯一键（下面的 catch）
        QueryWrapper<ActivitySignup> dupWrapper = new QueryWrapper<>();
        dupWrapper.eq("activity_id", activityId);
        dupWrapper.eq("user_id", userId);
        Long exists = signupMapper.selectCount(dupWrapper);
        if (exists != null && exists > 0) {
            throw new BusinessException(ResultCode.ACTIVITY_ALREADY_SIGNED_UP);
        }

        ActivitySignup signup = new ActivitySignup();
        signup.setActivityId(activityId);
        signup.setUserId(userId);
        signup.setPetName(dto.getPetName());
        signup.setOwnerName(dto.getOwnerName());
        signup.setPhone(dto.getPhone());
        signup.setEmail(dto.getEmail());
        signup.setNote(dto.getNote());
        signup.setCreateTime(LocalDateTime.now());

        try {
            signupMapper.insert(signup);
        } catch (DuplicateKeyException e) {
            // MySQL 1062（唯一键冲突）经 Spring 翻译成 DuplicateKeyException。
            // 走到这里说明上面的查重被并发绕过了，对用户来说结果仍是「你已报名」。
            log.warn("重复报名被唯一键拦下, activityId: {}, userId: {}", activityId, userId);
            throw new BusinessException(ResultCode.ACTIVITY_ALREADY_SIGNED_UP);
        }

        log.info("活动报名成功, activityId: {}, userId: {}", activityId, userId);
    }

    @Override
    public void cancelSignup(Long activityId, Long userId) {
        QueryWrapper<ActivitySignup> wrapper = new QueryWrapper<>();
        wrapper.eq("activity_id", activityId);
        wrapper.eq("user_id", userId);

        // 物理删除，与 favorite 的取消收藏一致（不保留历史报名记录）
        int deleted = signupMapper.delete(wrapper);
        if (deleted == 0) {
            throw new BusinessException(ResultCode.ACTIVITY_SIGNUP_NOT_FOUND);
        }

        log.info("取消活动报名成功, activityId: {}, userId: {}", activityId, userId);
    }

    // ==================== 内部工具 ====================

    /**
     * 一次 GROUP BY 拿到全部活动的报名人数，不在循环里逐个 count。
     */
    private Map<Long, Integer> countSignupsByActivity() {
        QueryWrapper<ActivitySignup> wrapper = new QueryWrapper<>();
        wrapper.select("activity_id", "COUNT(*) AS cnt");
        wrapper.groupBy("activity_id");

        List<Map<String, Object>> rows = signupMapper.selectMaps(wrapper);
        Map<Long, Integer> counts = new HashMap<>();
        if (rows == null) {
            return counts;
        }

        for (Map<String, Object> row : rows) {
            Object idValue = pick(row, "activity_id");
            Object cntValue = pick(row, "cnt");
            if (idValue instanceof Number && cntValue instanceof Number) {
                counts.put(((Number) idValue).longValue(), ((Number) cntValue).intValue());
            }
        }
        return counts;
    }

    /**
     * 从 selectMaps 的一行里取值。
     * <p>
     * key 由 JDBC 列标签决定，大小写与下划线风格随驱动/配置而异（{@code activity_id}
     * 可能变成 {@code ACTIVITY_ID}）。取不到就会让所有活动的报名数静默变成 0——
     * 页面照常渲染、不报任何错。所以这里先精确匹配，再退化成忽略大小写与下划线的比较。
     */
    private static Object pick(Map<String, Object> row, String column) {
        if (row == null) {
            return null;
        }
        if (row.containsKey(column)) {
            return row.get(column);
        }
        String wanted = normalizeKey(column);
        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (normalizeKey(entry.getKey()).equals(wanted)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private static String normalizeKey(String key) {
        return key == null ? "" : key.replace("_", "").toLowerCase(Locale.ROOT);
    }

    /**
     * 实体 → VO。participants 由调用方传入（0 人报名的活动不会出现在 GROUP BY 结果里，
     * 必须在调用处就回落到 0，否则卡片会显示「null 只宠物已报名」）。
     */
    private ActivityVO toVO(Activity activity, int participants, boolean signedUp) {
        return ActivityVO.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .description(activity.getDescription())
                .location(activity.getLocation())
                .startAt(activity.getStartTime())
                .endAt(activity.getEndTime())
                .coverUrl(activity.getCoverUrl())
                .theme(activity.getTheme())
                .participants(participants)
                .signedUp(signedUp)
                .build();
    }
}
