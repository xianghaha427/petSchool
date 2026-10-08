import apiClient from './apiClient';
import type { ApiResponse } from '@/types/pet';
import type { Activity, ActivityCreatePayload, ActivitySignupPayload } from '@/types/activity';

/**
 * 后端业务失败时返回的是 HTTP 200 + code!=200（见 GlobalExceptionHandler），
 * axios 不会 reject，必须自己检查 code。与 adminService 保持同一写法。
 */
const unwrap = <T>(res: ApiResponse<T>): T => {
  if (res?.code !== 200) {
    throw new Error(res?.message || '操作失败');
  }
  return res.data;
};

/**
 * 校园活动接口
 *
 * 列表接口 `GET /activities` 在后端是**免登录放行**的（WebMvcConfiguration 里
 * excludePathPatterns），所以首页未登录也能看到活动；报名与「我的报名」需要 token，
 * 由 apiClient 的请求拦截器自动带上。
 */
export const activityService = {
  /** 活动列表（公开），participants 是实时统计出来的报名人数 */
  listActivities: async (): Promise<Activity[]> => {
    const res = await apiClient.get<ApiResponse<Activity[]>>('/activities');
    return unwrap(res) || [];
  },

  /** 当前用户报名过的活动，signedUp 恒为 true。需登录 */
  listMySignups: async (): Promise<Activity[]> => {
    const res = await apiClient.get<ApiResponse<Activity[]>>('/my-activities');
    return unwrap(res) || [];
  },

  /** 报名。后端会校验活动是否还在报名窗口内（1009）与是否重复报名（1010） */
  signup: async (activityId: number, payload: ActivitySignupPayload): Promise<void> => {
    const res = await apiClient.post<ApiResponse<null>>(`/activities/${activityId}/signup`, payload);
    unwrap(res);
  },

  /** 取消报名。没报过名时后端返回 1011 */
  cancelSignup: async (activityId: number): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/activities/${activityId}/signup`);
    unwrap(res);
  },

  /** 创建活动（仅管理员，后端二次校验 role=1） */
  createActivity: async (payload: ActivityCreatePayload): Promise<void> => {
    const res = await apiClient.post<ApiResponse<null>>('/admin/activities', payload);
    unwrap(res);
  },
};

export default activityService;
