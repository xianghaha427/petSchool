import { useQuery } from '@tanstack/react-query';
import { petService } from '@/services/petService';
import type { Pet } from '@/types/pet';

export function usePetDetail(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await petService.getPetById(Number(id));
      return res;
    },
    enabled: !!id,
  });

  return {
    pet: data || null,
    isLoading,
    error: error ? '加载失败，请稍后重试' : null,
    refetch,
  };
}
