import axios from "axios";
import { authApi } from "./auth";
import { encryptPayload } from "./crypto";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token + encrypt POST/PUT/PATCH bodies
apiClient.interceptors.request.use(async (config) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storage = (globalThis as any).localStorage;
  const token = storage?.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let browser set the correct multipart boundary for FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const method = config.method?.toLowerCase();
  if (
    config.data &&
    typeof config.data === "object" &&
    !(config.data instanceof FormData) &&
    (method === "post" || method === "put" || method === "patch") &&
    config.url !== "/auth/public-key"
  ) {
    try {
      const encrypted = await encryptPayload(config.data);
      config.data = encrypted;
      config.headers["X-Encrypted"] = "true";
    } catch (err) {
      console.warn("Request encryption failed, sending unencrypted:", err);
    }
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

// 导出API客户端实例，供其他模块使用
export default apiClient;
// 导出的API接口
export { authApi };
export { forumApi } from "./forum";
export { adminApi } from "./admin";
export { notificationApi } from "./notification";
export { userApi } from "./user";