// AI 识别与图片上传相关类型定义

// 图片上传结果（/api/files/upload）
export interface FileUploadResult {
  url: string;        // 相对路径，如 /api/uploads/20260924_ab12cd34.jpg，可直接用于 <img src>
  filename: string;
  size: number;
}

// AI 宠物识别结果（/api/ai/pet-recognize）
export interface PetRecognitionResult {
  isPet: boolean;
  species: 'dog' | 'cat' | 'other';
  speciesLabel?: string;
  breed?: string | null;
  gender?: 1 | 2 | null;
  genderLabel?: string | null;
  color?: string | null;
  ageMonths?: number | null;
  ageStage?: string | null;
  confidence?: number | null;
  tips?: string | null;
  model?: string;
  degraded?: boolean;   // AI 服务降级时返回，结果可能不可靠
}

// AI 生成简介请求体（/api/ai/pet-description）
export interface PetDescriptionPayload {
  name?: string;
  species?: string;
  breed?: string;
  ageMonths?: number;
  gender?: number;      // 1-公，2-母
  color?: string;
  keywords?: string;
}

/**
 * AI 相关业务错误码。
 * 后端以 HTTP 200 + body.code !== 200 返回，因此这两个码不代表"请求失败"，
 * 而是"AI 没帮上忙"，UI 上应使用温和的 info 提示，而非 error。
 */
export const AI_ERROR_CODES = {
  UNAVAILABLE: 1004,
  RECOGNIZE_FAILED: 1005,
} as const;

/**
 * 业务错误（code !== 200）的统一异常类型。
 * 因为 apiClient 的响应拦截器不会因业务错误码 reject，各 service 需自行抛出本异常，
 * 调用方可通过 instanceof 判断并区分 AI 的"软失败"与真实错误。
 */
export class AiServiceError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
  }
}
