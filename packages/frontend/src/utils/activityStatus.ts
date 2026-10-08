// 校园活动状态：由起止时间实时算出。
//
// 之前 Activities.tsx 里的 tag 是写死的字符串，活动日期过了也一直显示「报名中」，
// 因为根本没有任何地方拿当前时间去比过。这里把判定抽成纯函数，
// 顺带让卡片上显示的日期也由同一份时间格式化而来——显示和比较不会再各说各话。

export type ActivityStatus = '报名中' | '即将开始' | '进行中' | '已结束';

/** 距开始不足这个时长时，从「报名中」切换为「即将开始」 */
const STARTING_SOON_MS = 24 * 60 * 60 * 1000;

/**
 * 判断活动状态，规则按优先级依次为：
 *
 *   1. 已过结束时间       -> 已结束
 *   2. 已过开始时间       -> 进行中
 *   3. 距开始不足 24 小时 -> 即将开始
 *   4. 其余               -> 报名中
 *
 * 时间无法解析时返回「已结束」：宁可把脏数据显示成已结束，
 * 也不要显示成可以报名。
 */
export function getActivityStatus(
  startAt: string,
  endAt: string,
  now: Date = new Date()
): ActivityStatus {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const t = now.getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return '已结束';
  if (t > end) return '已结束';
  if (t >= start) return '进行中';
  if (start - t <= STARTING_SOON_MS) return '即将开始';
  return '报名中';
}

/**
 * 该状态下是否还能报名。
 *
 * 报名窗口是 [现在, 开始时间 - 24h)：**只有「报名中」能报**。
 * 距开始不足 24 小时就切换成「即将开始」并同时截止报名——活动还没开始，
 * 但报名已经关了，所以这里不能用「还没开始就能报」来判定。
 *
 * 这与后端 ActivityServiceImpl.isSignupOpen（now < 开始时间 - 24h）是同一个条件，
 * 24 小时的阈值对应后端 ActivityConstant.SIGNUP_LEAD 与这里的 STARTING_SOON_MS，
 * 两边一旦漂移就会出现「按钮能点但后端拒绝」或反过来的情况。
 */
export function canRegister(status: ActivityStatus): boolean {
  return status === '报名中';
}

/**
 * 不能报名时，卡片按钮上显示的关闭原因。
 *
 * 用 Record 是为了穷尽所有状态：日后给 ActivityStatus 加状态时，
 * 这里会直接编译报错，而不是静默显示上一次的文案。
 */
export const CLOSED_REASON: Record<ActivityStatus, string> = {
  报名中: '', // 能报名，走不到这里，占位以满足穷尽性
  即将开始: '报名已截止',
  进行中: '活动进行中',
  已结束: '活动已结束',
};

/** 排序权重：报名中在前，已结束沉到最后 */
export const STATUS_ORDER: Record<ActivityStatus, number> = {
  报名中: 0,
  即将开始: 1,
  进行中: 2,
  已结束: 3,
};

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 起止时间 -> 卡片上展示的「3月15日」和「14:00 - 17:00」。
 *
 * 注意 ISO 串形如 '2026-03-15T14:00:00'（不带时区），
 * 按 ES 规范这种写法会被当作本地时间解析，正是我们要的。
 */
export function formatActivityDate(startAt: string, endAt: string): { date: string; time: string } {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { date: '', time: '' };
  }
  return {
    date: `${start.getMonth() + 1}月${start.getDate()}日`,
    time: `${hhmm(start)} - ${hhmm(end)}`,
  };
}
