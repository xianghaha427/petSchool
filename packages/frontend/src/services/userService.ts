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
  }
}

export default userService
