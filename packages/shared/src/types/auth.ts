// === Auth Types ===

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatarUrl: string;
  email: string;
  level: number;
  experience: number;
  status: number;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  token: string;
  refreshToken: string;
  userInfo: UserInfo;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  emailCode?: string;
  captchaId: string;
  captchaValue: string;
}

export interface SendEmailCodeRequest {
  email: string;
  type?: string; // "register" or "reset-password"
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}
