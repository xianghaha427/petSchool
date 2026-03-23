import apiClient from './apiClient';
import type { Pet, CarouselImage, ApiResponse, PaginatedResponse } from '@/types/pet';

export const petService = {
  // 获取宠物列表
  getPets: async (page = 1, limit = 12): Promise<PaginatedResponse<Pet>> => {
    return apiClient.get(`/pets?page=${page}&limit=${limit}`);
  },

  // 获取宠物详情
  getPetById: async (id: string): Promise<Pet> => {
    return apiClient.get(`/pets/${id}`);
  },

  // 创建宠物登记
  createPet: async (data: Partial<Pet>): Promise<Pet> => {
    return apiClient.post('/pets', data);
  },

  // 更新宠物信息
  updatePet: async (id: string, data: Partial<Pet>): Promise<Pet> => {
    return apiClient.put(`/pets/${id}`, data);
  },

  // 删除宠物
  deletePet: async (id: string): Promise<void> => {
    return apiClient.delete(`/pets/${id}`);
  },

  // 获取轮播图图片
  getCarouselImages: async (): Promise<CarouselImage[]> => {
    const res = await apiClient.get<ApiResponse<{ images: CarouselImage[] }>>('/carousel/images');
    return res.data?.images || [];
  },
};

export default petService;
