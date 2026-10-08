/**
 * 活动卡片的配色主题。
 *
 * 为什么要有这一层：活动配色现在存在数据库里（activity.theme），而 Tailwind 是
 * **JIT 编译**的——它只生成「能在源码文件里被当成字面量扫到」的类名。如果数据库
 * 直接下发 `'from-orange-500 to-amber-500'` 这样的字符串，Tailwind 扫不到，
 * 这些渐变类就不会被生成，卡片渐变会**静默消失**（不报任何错，只是颜色没了）。
 *
 * 所以库里只存主题**键**（teal/orange/...），映射表写在这个文件里，
 * 键到类名的对应关系始终以字面量形式出现在源码中，JIT 扫得到。
 *
 * 值刻意与改动前 Activities.tsx 里硬编码的那 6 个字符串一致，保证外观不变。
 * 注意 blue 和 teal 的结束色都是 cyan-500，这是原样保留下来的，不是笔误。
 */
export const ACTIVITY_THEMES = {
  teal: 'from-teal-500 to-cyan-500',
  orange: 'from-orange-500 to-amber-500',
  pink: 'from-pink-500 to-rose-500',
  blue: 'from-blue-500 to-cyan-500',
  red: 'from-red-500 to-orange-500',
  purple: 'from-purple-500 to-pink-500',
} as const;

export type ActivityTheme = keyof typeof ACTIVITY_THEMES;

/** 建活动时未选配色、或库里存了未知键时的兜底主题 */
export const DEFAULT_ACTIVITY_THEME: ActivityTheme = 'teal';

/** 供创建表单渲染下拉选项，顺序即展示顺序 */
export const ACTIVITY_THEME_KEYS = Object.keys(ACTIVITY_THEMES) as ActivityTheme[];

/** 主题键的中文名，仅用于创建表单的下拉标签 */
export const ACTIVITY_THEME_LABELS: Record<ActivityTheme, string> = {
  teal: '青绿',
  orange: '橙黄',
  pink: '粉红',
  blue: '天蓝',
  red: '赤红',
  purple: '紫罗兰',
};

/**
 * 主题键 → Tailwind 渐变类名。
 *
 * **永不返回 undefined**：库里存了未知键（比如以后加了主题又回滚了代码）时
 * 回落到默认主题，而不是让 `bg-gradient-to-r ${undefined}` 拼出半个类名。
 */
export function activityGradient(theme?: string | null): string {
  if (theme && Object.prototype.hasOwnProperty.call(ACTIVITY_THEMES, theme)) {
    return ACTIVITY_THEMES[theme as ActivityTheme];
  }
  return ACTIVITY_THEMES[DEFAULT_ACTIVITY_THEME];
}
