import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ResetPasswordRequest,
    SendEmailCodeRequest,
    OAuthLoginRequest,
    OAuthProvider,
    OAuthProviderInfo,
    OAuthBindItem,
} from "@linksee/shared";

import apiClient from ".";

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

    sendEmailCode: (data: SendEmailCodeRequest) =>
        apiClient.post<ApiResponse<null>>("/auth/send-email-code", data),

    resetPassword: (data: ResetPasswordRequest) =>
        apiClient.post<ApiResponse<null>>("/auth/reset-password", data),

    // === OAuth API ===
    getOAuthProviders: () =>
        apiClient.get<ApiResponse<OAuthProviderInfo[]>>("/auth/oauth/providers"),

    getOAuthAuthorizeUrl: (provider: OAuthProvider, redirectUri?: string) =>
        apiClient.get<ApiResponse<{ authorizeUrl: string; state: string }>>(
            `/auth/oauth/authorize/${provider}`,
            redirectUri ? { params: { redirectUri } } : undefined
        ),

    oauthLogin: (data: OAuthLoginRequest, redirectUri?: string) =>
        apiClient.post<ApiResponse<LoginResponse>>(
            "/auth/oauth/login",
            data,
            redirectUri ? { params: { redirectUri } } : undefined,
        ),

    // === OAuth Bind API ===
    getOAuthBindStatus: () =>
        apiClient.get<ApiResponse<OAuthBindItem[]>>("/auth/oauth/bind-status"),

    oauthBind: (provider: OAuthProvider, code: string, state: string) =>
        apiClient.post<ApiResponse<null>>("/auth/oauth/bind", { provider, code, state }),

    oauthUnbind: (provider: OAuthProvider) =>
        apiClient.post<ApiResponse<null>>(`/auth/oauth/unbind/${provider}`),
};