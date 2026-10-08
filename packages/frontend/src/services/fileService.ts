import apiClient from './apiClient';
import type { ApiResponse } from '@/types/pet';
// 类型统一声明在 @/types/ai，避免两处各写一份 FileUploadResult 日后悄悄跑偏
import type { FileUploadResult } from '@/types/ai';

/**
 * 上传宠物照片
 *
 * 有两处不能省，都是踩过的坑：
 *
 * 1. 必须显式声明 Content-Type: multipart/form-data。apiClient 实例的默认头写死了
 *    application/json，而 axios 遇到「FormData + JSON Content-Type」会把 FormData
 *    JSON.stringify 成 "{}"，上传会静默失败。显式声明后 axios 会把它置空，
 *    交回浏览器补 multipart 的 boundary。
 * 2. 上传比普通请求慢，实例默认超时只有 10s，这里放宽到 30s。
 *
 * 失败时由 apiClient 的响应拦截器抛 ApiError（后端业务失败也返回 HTTP 200），
 * 所以这里不需要再判 code。
 */
export async function uploadPhoto(file: File): Promise<FileUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post<ApiResponse<FileUploadResult>>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });

  return res.data;
}
