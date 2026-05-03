import axios from "axios";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@linksee/shared";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use((config) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storage = (globalThis as any).localStorage;
  const token = storage?.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // TODO: implement token refresh
    }
    return Promise.reject(error);
  },
);

// === Auth API ===

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<{ userId: number; token: string }>>(
      "/auth/register",
      data,
    ),

  logout: () => apiClient.post("/auth/logout"),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<LoginResponse>>("/auth/refresh-token", {
      refreshToken,
    }),

  getCaptcha: () =>
    apiClient.get<ApiResponse<{ captchaId: string; captchaImageBase64: string }>>(
      "/auth/captcha",
    ),
};

export default apiClient;
