import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SendEmailCodeRequest,
} from "@linksee/shared";

import apiClient from "./index";

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

    forgotPassword: (data: ForgotPasswordRequest) =>
        apiClient.post<ApiResponse<null>>("/auth/forgot-password", data),

    resetPassword: (data: ResetPasswordRequest) =>
        apiClient.post<ApiResponse<null>>("/auth/reset-password", data),
};