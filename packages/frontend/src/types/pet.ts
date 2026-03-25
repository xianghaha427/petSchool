// 宠物实体类型定义
export interface Pet {
  id: number;
  name: string;           // 宠物姓名
  studentId: string;      // 学号 (例如 "P20240001")
  species: string;        // 种类（狗、猫等）
  breed?: string;         // 品种
  age: number;            // 年龄（月）
  weight: number;         // 体重（kg）
  gender: number;         // 1-公，2-母
  genderLabel?: string;   // 性别标签（公/母）
  photoUrl: string;       // 可爱照片 URL
  description?: string;   // 简介
  // 详细信息字段（详情页展示）
  ownerName?: string;
  ownerContact?: string;
  vaccinationDate?: string;
  isVaccinated?: number;  // 0-否，1-是
  isNeutered?: number;    // 0-否，1-是
  healthStatus?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

// 轮播图图片类型
export interface CarouselImage {
  id: number;
  imageUrl: string;
  title?: string;
  linkUrl?: string;
  sortOrder?: number;
  status?: number;
  createTime?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  pages: number;
  pageNum: number;
  pageSize: number;
}

// 宠物登记表单数据
export interface PetRegisterFormData {
  name: string;           // 宠物姓名
  studentId?: string;     // 学号（可选，系统可自动生成）
  species: string;        // 种类（狗/猫/其他）
  breed?: string;         // 品种
  age: number;            // 年龄
  ageUnit: 'month' | 'year'; // 年龄单位
  weight: number;         // 体重（kg）
  gender: 'male' | 'female';
  photoUrl?: string;      // 照片 URL（可选）
  photoFile?: File;       // 照片文件（用于上传）
  description?: string;   // 简介
  ownerName: string;      // 主人姓名
  ownerContact: string;   // 主人联系方式
  isVaccinated: boolean;  // 是否已接种疫苗
  vaccinationDate?: string; // 疫苗接种日期
  isNeutered: boolean;    // 是否已绝育
  healthStatus?: string;  // 健康状况说明
}
