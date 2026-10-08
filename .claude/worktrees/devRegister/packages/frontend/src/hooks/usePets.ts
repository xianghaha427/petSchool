import { useQuery } from '@tanstack/react-query';
import { petService, PetSearchParams } from '@/services/petService';
import type { Pet } from '@/types/pet';

interface UsePetsOptions extends PetSearchParams {
  pageNum?: number;
  pageSize?: number;
}

export function usePets({ pageNum = 1, pageSize = 12, ...rest }: UsePetsOptions = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pets', pageNum, pageSize, rest],
    queryFn: async () => {
      const res = await petService.getPets({ pageNum, pageSize, ...rest });
      return res;
    },
  });

  return {
    pets: data?.data?.list || [],
    total: data?.data?.total || 0,
    currentPage: data?.data?.pageNum || pageNum,
    totalPages: data?.data?.pages || 1,
    isLoading,
    error: error ? '加载失败，请稍后重试' : null,
    refetch,
  };
}
