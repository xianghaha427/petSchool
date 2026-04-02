import apiClient from './apiClient';
import type { Pet, CarouselImage, ApiResponse, PaginatedResponse } from '@/types/pet';

// 搜索筛选参数
export interface PetSearchParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  studentId?: string;
  name?: string;
  species?: string;
  breed?: string;
  gender?: number;
  minAge?: number;
  maxAge?: number;
  sort?: 'newest' | 'oldest' | 'name';
}

export const petService = {
  // 获取宠物列表（带搜索筛选）
  getPets: async (params: PetSearchParams = {}): Promise<PaginatedResponse<Pet>> => {
    const searchParams = new URLSearchParams();
    if (params.pageNum) searchParams.append('pageNum', String(params.pageNum));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));
    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.studentId) searchParams.append('studentId', params.studentId);
    if (params.name) searchParams.append('name', params.name);
    if (params.species) searchParams.append('species', params.species);
    if (params.breed) searchParams.append('breed', params.breed);
    if (params.gender) searchParams.append('gender', String(params.gender));
    if (params.minAge) searchParams.append('minAge', String(params.minAge));
    if (params.maxAge) searchParams.append('maxAge', String(params.maxAge));
    if (params.sort) searchParams.append('sort', params.sort);
    return apiClient.get(`/pets?${searchParams.toString()}`);
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

  // ===== 我的宠物 =====
  // 获取我的宠物列表
  getMyPets: async (): Promise<Pet[]> => {
    const res = await apiClient.get<ApiResponse<Pet[]>>('/my-pets');
    return res.data || [];
  },

  // 更新我的宠物
  updateMyPet: async (id: number, data: Partial<Pet>): Promise<void> => {
    await apiClient.put(`/my-pets/${id}`, data);
  },

  // 删除我的宠物
  deleteMyPet: async (id: number): Promise<void> => {
    await apiClient.delete(`/my-pets/${id}`);
  },

  // ===== 收藏 =====
  // 获取收藏列表
  getFavorites: async (): Promise<Pet[]> => {
    const res = await apiClient.get<ApiResponse<Pet[]>>('/favorites');
    return res.data || [];
  },

  // 添加收藏
  addFavorite: async (petId: number): Promise<void> => {
    await apiClient.post(`/favorites/${petId}`);
  },

  // 取消收藏
  removeFavorite: async (petId: number): Promise<void> => {
    await apiClient.delete(`/favorites/${petId}`);
  },

  // 检查是否已收藏
  checkFavorite: async (petId: number): Promise<boolean> => {
    const res = await apiClient.get<ApiResponse<boolean>>(`/favorites/check/${petId}`);
    return res.data;
  },
};

export default petService;
