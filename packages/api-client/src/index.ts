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
    config.url !== "/auth/public-key" &&
      !config.url?.startsWith("/auth/oauth")
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

// Token refresh state — dedupe concurrent refresh attempts
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function getStorage() {
  return (globalThis as Record<string, unknown>).localStorage as Storage | undefined;
}

function storeTokens(token: string, refreshToken: string) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem('access_token', token);
  storage.setItem('refresh_token', refreshToken);
  // Also update zustand persisted state so useAuthStore picks it up
  try {
    const raw = storage.getItem('linksee-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state.token = token;
      parsed.state.refreshToken = refreshToken;
      storage.setItem('linksee-auth', JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

function clearAndRedirect() {
  const storage = getStorage();
  if (storage) {
    storage.removeItem('access_token');
    storage.removeItem('refresh_token');
    storage.removeItem('linksee-auth');
  }
  // Only redirect if not already on login page
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

async function refreshAccessToken(): Promise<string> {
  const storage = getStorage();
  const refreshToken = storage?.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');

  const res = await apiClient.post<{
    code: number;
    data: { token: string; refreshToken: string };
  }>('/auth/refresh-token', { refreshToken });

  const { token, refreshToken: newRefreshToken } = res.data.data;
  storeTokens(token, newRefreshToken);
  return token;
}

// Response interceptor: handle 401 refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if the failing request was itself a refresh call
      if (originalRequest.url === '/auth/refresh-token') {
        clearAndRedirect();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Another request is already refreshing — queue behind it
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        // Resolve all queued requests with the new token
        for (const entry of pendingQueue) {
          entry.resolve(newToken);
        }
        pendingQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — reject queued requests and redirect to login
        for (const entry of pendingQueue) {
          entry.reject(refreshError);
        }
        pendingQueue = [];
        clearAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
export { aiApi } from "./ai";