import apiClient from './apiClient';
import type { Pet, CarouselImage, ApiResponse, PaginatedResponse } from '@/types/pet';

export const petService = {
  // 获取宠物列表
  getPets: async (pageNum = 1, pageSize = 12): Promise<PaginatedResponse<Pet>> => {
    return apiClient.get(`/pets?pageNum=${pageNum}&pageSize=${pageSize}`);
  },

  // 获取宠物详情
  getPetById: async (id: number): Promise<Pet> => {
    const res = await apiClient.get<ApiResponse<Pet>>(`/pets/${id}`);
    return res.data;
  },

  // 根据学号查询宠物
  getPetByStudentId: async (studentId: string): Promise<Pet> => {
    const res = await apiClient.get<ApiResponse<Pet>>(`/pets/student/${studentId}`);
    return res.data;
  },

  // 创建宠物登记
  createPet: async (data: Partial<Pet>): Promise<Pet> => {
    const res = await apiClient.post<ApiResponse<Pet>>('/pets', data);
    return res.data;
  },

  // 更新宠物信息
  updatePet: async (id: number, data: Partial<Pet>): Promise<Pet> => {
    const res = await apiClient.put<ApiResponse<Pet>>(`/pets/${id}`, data);
    return res.data;
  },

  // 删除宠物
  deletePet: async (id: number): Promise<void> => {
    await apiClient.delete(`/pets/${id}`);
  },

  // 获取轮播图图片
  getCarouselImages: async (): Promise<CarouselImage[]> => {
    const res = await apiClient.get<ApiResponse<CarouselImage[]>>('/carousel');
    return res.data || [];
  },
};

export default petService;
