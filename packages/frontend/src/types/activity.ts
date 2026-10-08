import type { ActivityStatus } from '@/utils/activityStatus';

/**
 * 校园活动的**唯一**类型定义。
 *
 * 在本次改动之前，这个形状被重复声明了两遍：
 *   - Activities.tsx 里的 `ActivityWithStatus`（8 个字段，含 participants/image/color）
 *   - ActivityRegisterModal.tsx 里的 `Activity`（5 个字段，没有 participants）
 * 两处靠结构兼容勉强对上，任何一边加字段都不会报错。现在只此一份。
 *
 * 字段名与后端 ActivityVO 一一对应（注意是 startAt/endAt，不是 startTime/endTime——
 * 后者是数据库列名，只存在于后端实体里）。
 */
export interface Activity {
  id: number;
  title: string;
  description?: string | null;
  location: string;
  /**
   * ISO 串，形如 '2026-03-15T14:00:00'，**不带时区**。
   *
   * 后端 ActivityVO 上显式标了 @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")，
   * 所以拿到的一定是带 T 的字符串。这不是可有可无的：不带 @JsonFormat 时
   * Jackson 对 LocalDateTime 默认输出**数组** [2026,3,15,14,0,0]（AdminPendingPage
   * 里就在处理这种数组），而如果后端改用空格分隔（application.yml 的全局
   * date-format 只管 java.util.Date），new Date('2026-03-15 14:00:00') 在
   * Safari/iOS 上是 Invalid Date —— 结果是**所有活动都显示「已结束」且不报错**。
   */
  startAt: string;
  endAt: string;
  /** 封面图 URL，可能为空（为空时卡片用主题渐变兜底，不会破图） */
  coverUrl?: string | null;
  /** 配色主题键（'teal' | 'orange' | ...），不是 Tailwind 类名，见 utils/activityTheme.ts */
  theme?: string | null;
  participants: number;
  /** 当前用户是否已报名。列表接口是匿名放行的，只有 /my-activities 会给 true */
  signedUp: boolean;
}

/** 带实时算出的状态的完整活动，供卡片与弹窗共用 */
export interface ActivityWithStatus extends Activity {
  status: ActivityStatus;
}

/** 报名表单提交体，字段与后端 ActivitySignupDTO 对应 */
export interface ActivitySignupPayload {
  petName: string;
  ownerName: string;
  phone: string;
  email?: string;
  note?: string;
}

/** 创建活动表单提交体，字段与后端 ActivityCreateDTO 对应 */
export interface ActivityCreatePayload {
  title: string;
  description?: string;
  location: string;
  /** 'yyyy-MM-ddTHH:mm:ss'，秒必须有（后端 @JsonFormat 的 pattern 带秒） */
  startAt: string;
  endAt: string;
  coverUrl?: string;
  theme?: string;
}
