import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activityService';

/**
 * 当前用户已报名的活动 id 集合，首页据此把按钮显示成「已报名」。
 *
 * 为什么不做成「每张卡片查一次」（后端原本也可以提供 GET /activities/{id}/signup
 * 那种 check 接口）：首页一次渲染 3~6 张卡片，那样就是 3~6 个额外请求。
 * 这里一个请求拿回全部报名，前端在内存里查表。
 *
 * 未登录时 enabled=false，直接不发请求返回空集合。
 */
export function useMyActivitySignups(): Set<number> {
  const isLoggedIn = !!localStorage.getItem('token');

  const { data } = useQuery({
    queryKey: ['my-activity-signups'],
    queryFn: activityService.listMySignups,
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  return useMemo(() => new Set((data || []).map((activity) => activity.id)), [data]);
}

export default useMyActivitySignups;
