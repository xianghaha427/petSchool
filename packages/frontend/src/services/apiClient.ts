import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = '/api';

// 登录态相关的 localStorage key，401 时需要一并清除
const AUTH_STORAGE_KEYS = ['token', 'userId', 'username', 'role'];

function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

/**
 * 业务错误：后端把失败也返回成 HTTP 200（body 里 code != 200），
 * 由响应拦截器转成这个错误抛出，调用方按普通 Error 处理即可。
 */
export class ApiError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const body = response.data;
        // 非 { code, message, data } 包装的响应直接放行（当前后端不存在，防御性处理）
        if (!body || typeof body !== 'object' || !('code' in body)) {
          return body;
        }
        // 后端业务失败同样是 HTTP 200，只看 HTTP 状态码会把失败当成功。
        // 这里仍然返回整个 Result，所以调用方继续读 res.data 即可。
        if (body.code !== 200) {
          return Promise.reject(new ApiError(body.code, body.message || '请求失败'));
        }
        return body;
      },
      (error: AxiosError) => {
        console.error('API Error:', error);
        // 401：token 失效或过期。清掉登录态并回登录页，
        // 否则会出现"页面一直报错、右上角却仍显示已登录"的状态。
        if (error.response?.status === 401) {
          clearAuthStorage();
          // Header 已监听 auth-change，会立刻切换成未登录
          window.dispatchEvent(new Event('auth-change'));
          // 拦截器在 React 之外拿不到 navigate；已在登录页时不再跳转，避免死循环
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
