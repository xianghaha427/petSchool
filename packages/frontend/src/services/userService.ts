import apiClient from './apiClient'

export interface LoginRequest {
  userName: string
  password: string
}

export interface RegisterRequest {
  userName: string
  password: string
  email: string
  phone: string
}

export interface LoginResponse {
  id: number
  userName: string
  token: string
}

export interface UserProfile {
  id: number
  userName: string
  nickname?: string
  email?: string
  phone?: string
  avatarUrl?: string
  role?: number
  status?: number
  createTime?: string
}

export interface ProfileUpdateRequest {
  nickname?: string
  email?: string
  phone?: string
  avatarUrl?: string
}

export interface PasswordChangeRequest {
  oldPassword: string
  newPassword: string
}

export const userService = {
  // 用户登录
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post('/users/login', data)
    return res.data
  },

  // 用户注册
  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post('/users/register', data)
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) return null
    const res = await apiClient.get(`/users/${userId}`)
    return res.data
  },

  // 获取个人资料
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<{ data: UserProfile }>('/users/profile')
    return res.data
  },

  // 更新个人资料
  updateProfile: async (data: ProfileUpdateRequest): Promise<void> => {
    await apiClient.put('/users/profile', data)
  },

  // 修改密码
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    await apiClient.put('/users/password', data)
  },
}

export default userService
