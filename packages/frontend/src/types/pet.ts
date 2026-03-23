// 宠物实体类型定义
export interface Pet {
  id: string;
  name: string;           // 宠物姓名
  studentId: string;      // 学号 (例如 "P20240001")
  species: string;        // 种类（狗、猫等）
  breed?: string;         // 品种
  age: number;            // 年龄（月或年，统一单位）
  weight: number;         // 体重（kg）
  gender: 'male' | 'female';
  photoUrl: string;       // 可爱照片 URL
  description?: string;   // 简介
  // 详细信息字段（详情页展示）
  ownerName?: string;
  ownerContact?: string;
  vaccinationDate?: string;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  healthStatus?: string;
}

// 轮播图图片类型
export interface CarouselImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
