package com.petschool.service.impl;

import com.petschool.common.ResultCode;
import com.petschool.common.constant.ActivityConstant;
import com.petschool.common.exception.BusinessException;
import com.petschool.dto.ActivityCreateDTO;
import com.petschool.dto.ActivitySignupDTO;
import com.petschool.entity.Activity;
import com.petschool.entity.ActivitySignup;
import com.petschool.mapper.ActivityMapper;
import com.petschool.mapper.ActivitySignupMapper;
import com.petschool.vo.ActivityVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DuplicateKeyException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 活动服务的纯单元测试（Mock 掉 Mapper，不启动 Spring、不连库）
 */
class ActivityServiceImplTest {

    private static final LocalDateTime START = LocalDateTime.of(2026, 3, 15, 14, 0, 0);
    private static final LocalDateTime END = LocalDateTime.of(2026, 3, 15, 17, 0, 0);

    private ActivityMapper activityMapper;
    private ActivitySignupMapper signupMapper;
    private ActivityServiceImpl service;

    @BeforeEach
    void setUp() {
        activityMapper = mock(ActivityMapper.class);
        signupMapper = mock(ActivitySignupMapper.class);
        service = new ActivityServiceImpl(activityMapper, signupMapper);
    }

    // ------------------------------------------------------------------
    // 构造数据
    // ------------------------------------------------------------------

    /** 一个还没开始的活动（报名窗口是开的） */
    private Activity openActivity() {
        Activity a = new Activity();
        a.setId(1L);
        a.setTitle("春季运动会");
        a.setLocation("中央草坪");
        a.setStartTime(LocalDateTime.now().plusDays(3));
        a.setEndTime(LocalDateTime.now().plusDays(3).plusHours(3));
        a.setTheme(ActivityConstant.DEFAULT_THEME);
        a.setStatus(ActivityConstant.ENABLE);
        return a;
    }

    private ActivityCreateDTO validCreateDTO() {
        ActivityCreateDTO dto = new ActivityCreateDTO();
        dto.setTitle("春季运动会");
        dto.setDescription("狗狗们的田径狂欢");
        dto.setLocation("中央草坪");
        dto.setStartAt(START);
        dto.setEndAt(END);
        dto.setTheme("orange");
        return dto;
    }

    private ActivitySignupDTO validSignupDTO() {
        ActivitySignupDTO dto = new ActivitySignupDTO();
        dto.setPetName("旺财");
        dto.setOwnerName("张三");
        dto.setPhone("13800138000");
        return dto;
    }

    private static BusinessException expectBusinessException(Runnable action) {
        return assertThrows(BusinessException.class, action::run);
    }

    private static void assertCode(ResultCode expected, BusinessException actual) {
        assertEquals(expected.getCode(), actual.getCode().intValue(),
                "错误码应为 " + expected.getCode() + "，实际 " + actual.getCode());
    }

    // ------------------------------------------------------------------
    // createActivity
    // ------------------------------------------------------------------

    @Test
    @DisplayName("创建：结束时间早于开始时间 → 400")
    void create_shouldRejectWhenEndBeforeStart() {
        ActivityCreateDTO dto = validCreateDTO();
        dto.setEndAt(START.minusHours(1));

        assertCode(ResultCode.BAD_REQUEST, expectBusinessException(() -> service.createActivity(dto, 14L)));
        verify(activityMapper, never()).insert(any());
    }

    @Test
    @DisplayName("创建：结束时间恰好等于开始时间 → 400（零时长活动没有意义）")
    void create_shouldRejectWhenEndEqualsStart() {
        ActivityCreateDTO dto = validCreateDTO();
        dto.setEndAt(START);

        assertCode(ResultCode.BAD_REQUEST, expectBusinessException(() -> service.createActivity(dto, 14L)));
        verify(activityMapper, never()).insert(any());
    }

    @Test
    @DisplayName("创建：正常路径写入，且时间字段确实落到了 startTime/endTime 上")
    void create_shouldPersistStartAndEndTime() {
        service.createActivity(validCreateDTO(), 14L);

        ArgumentCaptor<Activity> captor = ArgumentCaptor.forClass(Activity.class);
        verify(activityMapper, times(1)).insert(captor.capture());
        Activity saved = captor.getValue();

        // 这条专防「用 BeanUtils.copyProperties 导致 startAt→startTime 静默没拷过去」：
        // 那样 start_time 会是 null，撞上 NOT NULL 才在 insert 时炸，离现场很远
        assertEquals(START, saved.getStartTime());
        assertEquals(END, saved.getEndTime());
        assertEquals("春季运动会", saved.getTitle());
        assertEquals("中央草坪", saved.getLocation());
        assertEquals(ActivityConstant.ENABLE, saved.getStatus());
        assertEquals(14L, saved.getCreateUserId());
        assertNotNull(saved.getCreateTime());
        assertNotNull(saved.getUpdateTime());
    }

    @Test
    @DisplayName("创建：主题漏传时回落默认主题，而不是写 null")
    void create_shouldFallbackToDefaultTheme() {
        ActivityCreateDTO dto = validCreateDTO();
        dto.setTheme(null);

        service.createActivity(dto, 14L);

        ArgumentCaptor<Activity> captor = ArgumentCaptor.forClass(Activity.class);
        verify(activityMapper).insert(captor.capture());
        assertEquals(ActivityConstant.DEFAULT_THEME, captor.getValue().getTheme());
    }

    @Test
    @DisplayName("创建：显式传了主题就保留原值")
    void create_shouldKeepExplicitTheme() {
        service.createActivity(validCreateDTO(), 14L);

        ArgumentCaptor<Activity> captor = ArgumentCaptor.forClass(Activity.class);
        verify(activityMapper).insert(captor.capture());
        assertEquals("orange", captor.getValue().getTheme());
    }

    // ------------------------------------------------------------------
    // signup
    // ------------------------------------------------------------------

    @Test
    @DisplayName("报名：活动不存在 → 1008")
    void signup_shouldThrow1008WhenActivityMissing() {
        when(activityMapper.selectById(999L)).thenReturn(null);

        assertCode(ResultCode.ACTIVITY_NOT_FOUND,
                expectBusinessException(() -> service.signup(999L, 7L, validSignupDTO())));
        verify(signupMapper, never()).insert(any());
    }

    @Test
    @DisplayName("报名：活动已下架（status=0）→ 1008，不暴露「存在但下架」")
    void signup_shouldThrow1008WhenActivityDisabled() {
        Activity disabled = openActivity();
        disabled.setStatus(ActivityConstant.DISABLE);
        when(activityMapper.selectById(1L)).thenReturn(disabled);

        assertCode(ResultCode.ACTIVITY_NOT_FOUND,
                expectBusinessException(() -> service.signup(1L, 7L, validSignupDTO())));
        verify(signupMapper, never()).insert(any());
    }

    @Test
    @DisplayName("报名：活动即将开始（距开始不足24小时）→ 1009")
    void signup_shouldThrow1009WhenStartingSoon() {
        // 钉住需求：活动还没开始 ≠ 还能报名。距开始不足 24 小时即截止。
        Activity soon = openActivity();
        soon.setStartTime(LocalDateTime.now().plusHours(1));
        soon.setEndTime(LocalDateTime.now().plusHours(4));
        when(activityMapper.selectById(1L)).thenReturn(soon);

        assertCode(ResultCode.ACTIVITY_SIGNUP_CLOSED,
                expectBusinessException(() -> service.signup(1L, 7L, validSignupDTO())));
        verify(signupMapper, never()).insert(any());
    }

    @Test
    @DisplayName("报名：活动进行中 → 1009（只有「报名中」这一个状态能报）")
    void signup_shouldThrow1009WhileActivityIsRunning() {
        // 钉住需求：活动进行中不能报名。曾经把窗口放宽到 endTime，那是错的。
        Activity running = openActivity();
        running.setStartTime(LocalDateTime.now().minusMinutes(30));
        running.setEndTime(LocalDateTime.now().plusMinutes(30));
        when(activityMapper.selectById(1L)).thenReturn(running);

        assertCode(ResultCode.ACTIVITY_SIGNUP_CLOSED,
                expectBusinessException(() -> service.signup(1L, 7L, validSignupDTO())));
        verify(signupMapper, never()).insert(any());
    }

    @Test
    @DisplayName("报名：已报过名 → 1010")
    void signup_shouldThrow1010WhenAlreadySignedUp() {
        when(activityMapper.selectById(1L)).thenReturn(openActivity());
        when(signupMapper.selectCount(any())).thenReturn(1L);

        assertCode(ResultCode.ACTIVITY_ALREADY_SIGNED_UP,
                expectBusinessException(() -> service.signup(1L, 7L, validSignupDTO())));
        verify(signupMapper, never()).insert(any());
    }

    @Test
    @DisplayName("报名：正常路径写入，表单字段全部落库")
    void signup_shouldPersistSignup() {
        when(activityMapper.selectById(1L)).thenReturn(openActivity());
        when(signupMapper.selectCount(any())).thenReturn(0L);

        ActivitySignupDTO dto = validSignupDTO();
        dto.setEmail("zhangsan@example.com");
        dto.setNote("第一次参加");
        service.signup(1L, 7L, dto);

        ArgumentCaptor<ActivitySignup> captor = ArgumentCaptor.forClass(ActivitySignup.class);
        verify(signupMapper, times(1)).insert(captor.capture());
        ActivitySignup saved = captor.getValue();

        assertEquals(1L, saved.getActivityId());
        assertEquals(7L, saved.getUserId());
        assertEquals("旺财", saved.getPetName());
        assertEquals("张三", saved.getOwnerName());
        assertEquals("13800138000", saved.getPhone());
        assertEquals("zhangsan@example.com", saved.getEmail());
        assertEquals("第一次参加", saved.getNote());
        assertNotNull(saved.getCreateTime());
    }

    @Test
    @DisplayName("报名：并发下唯一键冲突 → 仍翻译成 1010，不是 500")
    void signup_shouldTranslateDuplicateKeyTo1010() {
        when(activityMapper.selectById(1L)).thenReturn(openActivity());
        // 前置查重被并发绕过：查重说没有，insert 时唯一键拦下
        when(signupMapper.selectCount(any())).thenReturn(0L);
        when(signupMapper.insert(any())).thenThrow(new DuplicateKeyException("uk_activity_user"));

        assertCode(ResultCode.ACTIVITY_ALREADY_SIGNED_UP,
                expectBusinessException(() -> service.signup(1L, 7L, validSignupDTO())));
    }

    // ------------------------------------------------------------------
    // cancelSignup
    // ------------------------------------------------------------------

    @Test
    @DisplayName("取消报名：没有报名记录 → 1011")
    void cancel_shouldThrow1011WhenNothingDeleted() {
        when(signupMapper.delete(any())).thenReturn(0);

        assertCode(ResultCode.ACTIVITY_SIGNUP_NOT_FOUND,
                expectBusinessException(() -> service.cancelSignup(1L, 7L)));
    }

    @Test
    @DisplayName("取消报名：正常路径删除成功")
    void cancel_shouldDelete() {
        when(signupMapper.delete(any())).thenReturn(1);

        service.cancelSignup(1L, 7L);

        verify(signupMapper, times(1)).delete(any());
    }

    // ------------------------------------------------------------------
    // listActivities
    // ------------------------------------------------------------------

    @Test
    @DisplayName("列表：空库返回空集合，不是 null（前端要靠 length 判空态）")
    void list_shouldReturnEmptyListNotNull() {
        when(activityMapper.selectList(any())).thenReturn(Collections.emptyList());

        List<ActivityVO> result = service.listActivities();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("列表：mapper 返回 null 时也要给空集合，不能把 null 透给前端")
    void list_shouldTolerateNullFromMapper() {
        when(activityMapper.selectList(any())).thenReturn(null);

        List<ActivityVO> result = service.listActivities();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("列表：报名人数按活动聚合；0 人报名的活动必须是 0 而不是 null")
    void list_shouldMapParticipantsWithZeroFallback() {
        Activity withSignups = openActivity();
        withSignups.setId(1L);
        Activity withoutSignups = openActivity();
        withoutSignups.setId(2L);

        when(activityMapper.selectList(any())).thenReturn(List.of(withSignups, withoutSignups));

        // GROUP BY 只会吐出「有报名记录」的活动，2 号活动根本不在结果里
        Map<String, Object> row = new HashMap<>();
        row.put("activity_id", 1L);
        row.put("cnt", 3L);
        when(signupMapper.selectMaps(any())).thenReturn(List.of(row));

        List<ActivityVO> result = service.listActivities();

        assertEquals(2, result.size());
        assertEquals(3, result.get(0).getParticipants());
        assertEquals(0, result.get(1).getParticipants(),
                "0 人报名的活动若回落成 null，卡片会显示「null 只宠物已报名」");
    }

    @Test
    @DisplayName("列表：selectMaps 的 key 大小写/下划线风格变了也要能取到报名数")
    void list_shouldTolerateDifferentMapKeyCasing() {
        Activity activity = openActivity();
        activity.setId(1L);
        when(activityMapper.selectList(any())).thenReturn(List.of(activity));

        // 驱动若把列标签大写成 ACTIVITY_ID / CNT，精确匹配会落空 →
        // 报名数静默全变 0，页面照常渲染且不报错。这里钉住兜底逻辑
        Map<String, Object> row = new HashMap<>();
        row.put("ACTIVITY_ID", 1L);
        row.put("CNT", 5L);
        when(signupMapper.selectMaps(any())).thenReturn(List.of(row));

        assertEquals(5, service.listActivities().get(0).getParticipants());
    }

    @Test
    @DisplayName("列表：公开接口拿不到 userId，signedUp 一律 false")
    void list_shouldAlwaysReportNotSignedUp() {
        Activity activity = openActivity();
        when(activityMapper.selectList(any())).thenReturn(List.of(activity));
        when(signupMapper.selectMaps(any())).thenReturn(new ArrayList<>());

        assertFalse(service.listActivities().get(0).getSignedUp());
    }

    @Test
    @DisplayName("列表：VO 的时间字段来自实体的 startTime/endTime")
    void list_shouldMapTimeFields() {
        Activity activity = openActivity();
        activity.setStartTime(START);
        activity.setEndTime(END);
        when(activityMapper.selectList(any())).thenReturn(List.of(activity));
        when(signupMapper.selectMaps(any())).thenReturn(new ArrayList<>());

        ActivityVO vo = service.listActivities().get(0);

        assertEquals(START, vo.getStartAt());
        assertEquals(END, vo.getEndAt());
    }

    // ------------------------------------------------------------------
    // listMySignups
    // ------------------------------------------------------------------

    @Test
    @DisplayName("我的报名：没报过名时直接返回空集合，不去查活动表")
    void mySignups_shouldShortCircuitWhenNone() {
        when(signupMapper.selectList(any())).thenReturn(Collections.emptyList());

        assertTrue(service.listMySignups(7L).isEmpty());
        verify(activityMapper, never()).selectBatchIds(any());
    }

    @Test
    @DisplayName("我的报名：signedUp 置 true（首页据此显示「已报名」）")
    void mySignups_shouldFlagSignedUp() {
        ActivitySignup signup = new ActivitySignup();
        signup.setActivityId(1L);
        signup.setUserId(7L);
        when(signupMapper.selectList(any())).thenReturn(List.of(signup));

        Activity activity = openActivity();
        activity.setId(1L);
        when(activityMapper.selectBatchIds(any())).thenReturn(List.of(activity));

        Map<String, Object> row = new HashMap<>();
        row.put("activity_id", 1L);
        row.put("cnt", 4L);
        when(signupMapper.selectMaps(any())).thenReturn(List.of(row));

        List<ActivityVO> result = service.listMySignups(7L);

        assertEquals(1, result.size());
        assertTrue(result.get(0).getSignedUp());
        assertEquals(4, result.get(0).getParticipants());
    }
}
