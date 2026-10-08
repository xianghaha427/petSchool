import { useQuery } from '@tanstack/react-query';
import { generateHealthAdvice } from '@/services/aiService';
import { buildHealthAdvicePayload } from '@/utils/aiMapping';
import { aiErrorMessageOf } from '@/types/ai';
import type { PetHealthAdviceResult } from '@/types/ai';
import type { Pet } from '@/types/pet';

export type HealthAdviceStatus = 'idle' | 'generating' | 'done' | 'failed';

/**
 * AI 养护建议：按需生成，不随页面自动触发。
 *
 * 刻意用 useQuery(enabled: false) 而不是 useMutation：
 *  · 请求生命周期交给 React Query，组件卸载后不会 setState 到已卸载组件
 *  · 自带按键缓存，5 分钟内切走再回来不必重新烧一次 token
 *  · useMutation 没有键缓存，要自己维护「这只宠物的建议生成过没有」
 *
 * petId 参与 queryKey，因此切换宠物时新键没有缓存，状态自动回到 idle，
 * 不会把上一只宠物的建议串到这一只身上。
 */
export function usePetHealthAdvice(pet: Pet | null, petId: string) {
  const query = useQuery<PetHealthAdviceResult>({
    queryKey: ['pet-health-advice', petId],
    queryFn: () => generateHealthAdvice(buildHealthAdvicePayload(pet)),
    // 不点按钮就不请求：养护建议不是页面必需内容
    enabled: false,
    // React Query 默认失败重试 3 次。AI 单次最长 30s，一次失败会变成 ~120 秒 + 4 倍 token
    retry: false,
    // 与后端无缓存的事实匹配：这 5 分钟只是给前端省一次重复点击，F5 后依旧要重新生成
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // 缓存由 staleTime 决定新鲜度，这里全部关掉，避免刷新页面就自动烧 token
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // 成功后又点「重新生成」时，data 还在但 isFetching 为真，仍应显示加载态
  const status: HealthAdviceStatus = query.isFetching
    ? 'generating'
    : query.data
      ? 'done'
      : query.error
        ? 'failed'
        : 'idle';

  return {
    advice: query.data ?? null,
    status,
    isGenerating: query.isFetching,
    /**
     * 展示给用户的中文提示：后端业务错误优先用它自己的 message；
     * 超时/断网时 axios 的 message 是英文串，aiErrorMessageOf 会返回空串，
     * 这里退回"稍后再试"，而不是把 "Network Error" 摆到用户面前。
     */
    errorMessage: query.error
      ? aiErrorMessageOf(query.error) || 'AI 暂时不可用，请稍后再试'
      : '',
    generate: query.refetch,
  };
}

export default usePetHealthAdvice;
