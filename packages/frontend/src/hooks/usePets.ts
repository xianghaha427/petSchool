import { useQuery } from '@tanstack/react-query';
import { petService } from '@/services/petService';

interface UsePetsOptions {
  page?: number;
  limit?: number;
}

export function usePets({ page = 1, limit = 12 }: UsePetsOptions = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pets', page, limit],
    queryFn: () => petService.getPets(page, limit),
  });

  return {
    pets: data?.list || [],
    total: data?.total || 0,
    currentPage: data?.pageNum || page,
    totalPages: data?.pages || 0,
    isLoading,
    error,
    refetch,
  };
}
