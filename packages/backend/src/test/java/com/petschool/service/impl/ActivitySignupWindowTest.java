package com.petschool.service.impl;

import com.petschool.common.constant.ActivityConstant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 报名窗口判定的边界测试（纯单元测试，不启动 Spring）
 * <p>
 * 报名窗口是 <b>{@code [现在, 开始时间 - 24h)}</b>：<b>只有「报名中」能报名</b>。
 * 距开始不足 24 小时即切换为「即将开始」并同时截止报名；活动进行中、已结束更不能报。
 * 后端的「能否报名」必须与前端 activityStatus.ts 的
 * {@code canRegister}（{@code status === '报名中'}）严格等价——这个谓词是两边唯一的
 * 交汇点，一旦漂移，会出现「按钮能点但后端拒绝」或反过来的情况，所以逐个钉边界。
 * <p>
 * 这里先后被改成过「边界在 endTime」「边界就是 startTime」，两次都理解错了需求。
 * 现在的 24 小时是最终确认的规则：活动还没开始不等于还能报名。
 */
class ActivitySignupWindowTest {

    private static final LocalDateTime START = LocalDateTime.of(2026, 3, 15, 14, 0, 0);
    private static final LocalDateTime END = LocalDateTime.of(2026, 3, 15, 17, 0, 0);

    /** 报名截止线：距开始正好 24 小时 */
    private static final LocalDateTime CUTOFF = START.minusHours(24);

    @Test
    @DisplayName("截止线之前（「报名中」）：可报名")
    void openBeforeCutoff() {
        assertTrue(ActivityServiceImpl.isSignupOpen(CUTOFF.minusSeconds(1), START));
        assertTrue(ActivityServiceImpl.isSignupOpen(CUTOFF.minusDays(7), START));
        assertTrue(ActivityServiceImpl.isSignupOpen(START.minusYears(1), START));
    }

    @Test
    @DisplayName("恰好等于截止线：不可报名（isBefore 为 false，与前端 <=24h 算「即将开始」对齐）")
    void closedExactlyAtCutoff() {
        assertFalse(ActivityServiceImpl.isSignupOpen(CUTOFF, START));
    }

    @Test
    @DisplayName("截止线之后、开始之前（「即将开始」）：不可报名——活动没开始也不等于还能报")
    void closedWhileStartingSoon() {
        assertFalse(ActivityServiceImpl.isSignupOpen(CUTOFF.plusSeconds(1), START));
        assertFalse(ActivityServiceImpl.isSignupOpen(START.minusHours(1), START));
    }

    @Test
    @DisplayName("恰好等于开始时间（「进行中」）：不可报名")
    void closedExactlyAtStart() {
        assertFalse(ActivityServiceImpl.isSignupOpen(START, START));
    }

    @Test
    @DisplayName("活动进行中：不可报名")
    void closedDuringActivity() {
        assertFalse(ActivityServiceImpl.isSignupOpen(START.plusSeconds(1), START));
        assertFalse(ActivityServiceImpl.isSignupOpen(END, START));
    }

    @Test
    @DisplayName("活动已结束：不可报名")
    void closedAfterEnd() {
        assertFalse(ActivityServiceImpl.isSignupOpen(END.plusSeconds(1), START));
        assertFalse(ActivityServiceImpl.isSignupOpen(START.plusYears(1), START));
    }

    @Test
    @DisplayName("开始时间为 null：不可报名，且不抛 NPE")
    void closedWhenStartTimeMissing() {
        assertFalse(ActivityServiceImpl.isSignupOpen(START, null));
    }

    @Test
    @DisplayName("当前时间为 null：不可报名，且不抛 NPE")
    void closedWhenNowMissing() {
        assertFalse(ActivityServiceImpl.isSignupOpen(null, START));
    }

    @Test
    @DisplayName("两者都为 null：不可报名")
    void closedWhenBothMissing() {
        assertFalse(ActivityServiceImpl.isSignupOpen(null, null));
    }

    @Test
    @DisplayName("截止提前量就是 24 小时（跨语言契约：必须与前端 STARTING_SOON_MS 一致）")
    void signupLeadIsExactly24Hours() {
        // 这个阈值同时存在于 Java（ActivityConstant.SIGNUP_LEAD）和 TypeScript
        // （activityStatus.ts 的 STARTING_SOON_MS），没有任何机制保证二者同步。
        // 改动其中一边而忘了另一边，表现是「按钮能点但后端拒绝」——没有报错。
        // 所以把「就是 24 小时」这个事实单独钉一条，任何一侧被改都会在这里暴露。
        assertEquals(Duration.ofHours(24), ActivityConstant.SIGNUP_LEAD,
                "改了这里就必须同步改前端 activityStatus.ts 的 STARTING_SOON_MS");
    }
}
