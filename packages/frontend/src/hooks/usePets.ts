import { useQuery } from '@tanstack/react-query';
import { mockPets } from '@/data/mockPets';
import type { Pet } from '@/types/pet';

interface UsePetsOptions {
  page?: number;
  limit?: number;
}

export function usePets({ page = 1, limit = 12 }: UsePetsOptions = {}) {
  // 使用 Mock 数据
  const pets = mockPets.slice(0, limit);

  return {
    pets,
    total: mockPets.length,
    currentPage: page,
    totalPages: Math.ceil(mockPets.length / limit),
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}
