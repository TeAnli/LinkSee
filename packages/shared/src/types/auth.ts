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
  roles?: string[];
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

// === OAuth Types ===

export type OAuthProvider = 'github' | 'google' | 'qq' | 'discord';

export interface OAuthLoginRequest {
  provider: OAuthProvider;
  code: string;
  state: string;
}

export interface OAuthProviderInfo {
  provider: OAuthProvider;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface OAuthBindItem {
  provider: OAuthProvider;
  name: string;
  icon: string;
  bound: boolean;
  bindAt?: string;
}

export interface OAuthStateItem {
  state: string;
  provider: OAuthProvider;
  createdAt: number;
}
