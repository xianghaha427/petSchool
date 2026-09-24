import apiClient from './apiClient';
import type { ApiResponse } from '@/types/pet';
import type { FileUploadResult } from '@/types/ai';
import { AiServiceError } from '@/types/ai';

// 上传比普通请求慢，单独放宽超时（实例默认仅 10s）
const UPLOAD_TIMEOUT = 30000;

/**
 * 上传宠物照片。
 * 注意：必须显式声明 multipart/form-data —— axios 实例默认 Content-Type 是 application/json，
 * 而 axios 的默认 transformRequest 遇到"FormData + JSON Content-Type"会把 FormData
 * JSON.stringify 掉，导致上传静默失败。显式声明后 axios 会把它置空交由浏览器补 boundary。
 */
export async function uploadPhoto(file: File): Promise<FileUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post<ApiResponse<FileUploadResult>>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
  });

  if (!res || res.code !== 200) {
    throw new AiServiceError(res?.code ?? -1, res?.message || '图片上传失败');
  }
  return res.data;
}

export default uploadPhoto;
