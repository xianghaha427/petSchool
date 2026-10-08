import apiClient from './apiClient';
import type { ApiResponse } from '@/types/pet';
import type { PetPending } from './petService';

/**
 * 后端业务失败时返回的是 HTTP 200 + code!=200（见 GlobalExceptionHandler），
 * axios 不会 reject，必须自己检查 code，否则失败会被当成成功。
 */
const unwrap = <T>(res: ApiResponse<T>): T => {
  if (res?.code !== 200) {
    throw new Error(res?.message || '操作失败');
  }
  return res.data;
};

/**
 * 管理员审核相关接口
 * 注意：这些接口在后端会二次校验 user.role == 1，前端隐藏入口只是体验优化
 */
export const adminService = {
  // 获取全部宠物登记记录（含已通过、已拒绝）
  getAllPending: async (): Promise<PetPending[]> => {
    const res = await apiClient.get<ApiResponse<PetPending[]>>('/admin/pets/pending');
    return unwrap(res) || [];
  },

  // 通过审核：后端会写入 pet 表并生成学号，同时把 pet_pending 记录标记为已通过
  approvePending: async (id: number): Promise<void> => {
    const res = await apiClient.put<ApiResponse<null>>(`/admin/pets/pending/${id}/approve`);
    unwrap(res);
  },

  // 拒绝审核：后端用 @RequestParam 接收原因，必须放在 query string 上
  rejectPending: async (id: number, rejectReason: string): Promise<void> => {
    const res = await apiClient.put<ApiResponse<null>>(`/admin/pets/pending/${id}/reject`, null, {
      params: { rejectReason },
    });
    unwrap(res);
  },
};

export default adminService;
