import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activityService';
import type { Activity } from '@/types/activity';

/**
 * 首页活动列表。
 *
 * 免登录接口，所以没有 enabled 条件——未登录也要能看到活动（点报名才跳登录）。
 * staleTime 给 1 分钟：报名人数是会变的，但首页没必要每次聚焦都重拉。
 * 报名/取消成功后由调用方 invalidate ['activities'] 强制刷新，不依赖这个时间。
 */
export function useActivities() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activities'],
    queryFn: activityService.listActivities,
    staleTime: 60_000,
  });

  return {
    activities: (data || []) as Activity[],
    isLoading,
    error: error ? '活动加载失败，请稍后重试' : null,
    refetch,
  };
}

export default useActivities;
