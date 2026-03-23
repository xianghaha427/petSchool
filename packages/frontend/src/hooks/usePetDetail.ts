import { mockPets } from '@/data/mockPets';
import type { Pet } from '@/types/pet';

export function usePetDetail(id: string) {
  // 使用 Mock 数据
  const pet = mockPets.find((p) => p.id === id) || null;

  return {
    pet,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}
