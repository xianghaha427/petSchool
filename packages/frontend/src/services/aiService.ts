import apiClient from './apiClient';
import type { ApiResponse } from '@/types/pet';
import type { PetRecognitionResult, PetDescriptionPayload } from '@/types/ai';
import { AiServiceError } from '@/types/ai';

// AI 推理较慢，必须逐请求放宽超时（实例默认仅 10s，会让请求在前端先超时、
// 且只能拿到无信息量的 Network Error）。前端 40s > 后端 30s，保证是后端先超时。
const RECOGNIZE_TIMEOUT = 40000;
const DESCRIPTION_TIMEOUT = 40000;

/**
 * 上传图片做宠物识别。
 * 必须显式声明 multipart/form-data，原因见 fileService.ts 的注释。
 */
export async function recognizePet(file: File): Promise<PetRecognitionResult> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiClient.post<ApiResponse<PetRecognitionResult>>(
    '/ai/pet-recognize',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: RECOGNIZE_TIMEOUT,
    }
  );

  if (!res || res.code !== 200) {
    throw new AiServiceError(res?.code ?? -1, res?.message || 'AI 识别失败');
  }
  return res.data;
}

/**
 * 根据已填信息生成宠物简介，返回纯文本。
 */
export async function generateDescription(payload: PetDescriptionPayload): Promise<string> {
  const res = await apiClient.post<ApiResponse<string>>('/ai/pet-description', payload, {
    timeout: DESCRIPTION_TIMEOUT,
  });

  if (!res || res.code !== 200) {
    throw new AiServiceError(res?.code ?? -1, res?.message || 'AI 生成简介失败');
  }
  return res.data;
}

export default { recognizePet, generateDescription };
