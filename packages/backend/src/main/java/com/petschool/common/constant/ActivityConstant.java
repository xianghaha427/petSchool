package com.petschool.common.constant;

import java.time.Duration;

/**
 * 校园活动相关常量
 */
public class ActivityConstant {

    // 状态常量：0-已下架，1-正常
    public static final Integer DISABLE = 0;
    public static final Integer ENABLE = 1;

    /**
     * 卡片配色主题白名单（正则）。
     * <p>
     * 存的是「主题键」而不是 Tailwind 类名。原因：Tailwind 的 JIT 只扫描源文件里
     * 出现过的字面量类名，数据库下发的 {@code from-orange-500} 它扫不到，
     * 结果是渐变**静默消失**、不报任何错。前端用 activityTheme.ts 的固定映射表
     * 把这里的键还原成类名字面量。
     * <p>
     * 用 {@code public static final String} 是为了让 DTO 上的 @Pattern 能引用它。
     */
    public static final String THEME_REGEX = "^(teal|orange|pink|blue|red|purple)$";

    /** 未指定主题时的默认值，必须与前端 DEFAULT_ACTIVITY_THEME 保持一致 */
    public static final String DEFAULT_THEME = "teal";

    /**
     * 报名截止提前量：距活动开始不足这个时长即视为「即将开始」，报名截止。
     * <p>
     * 也就是说报名窗口是 {@code [现在, 开始时间 - 24h)}，与前端
     * {@code getActivityStatus()} 返回「报名中」的区间完全一致。
     * <p>
     * <b>必须与前端 activityStatus.ts 的 STARTING_SOON_MS 保持一致。</b>
     * 这个阈值决定「报名中 / 即将开始」的分界，两边各写一份，一旦漂移就会出现
     * 「按钮能点但后端拒绝」（或反过来），而且不会有任何报错——
     * 唯一的防线是 ActivitySignupWindowTest 里那条断言它等于 24 小时的测试。
     */
    public static final Duration SIGNUP_LEAD = Duration.ofHours(24);
}
