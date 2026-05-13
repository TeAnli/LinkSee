import type { UserInfo } from "./auth";

// === User Types ===

export interface UserProfileDetail {
  bio: string;
  location: string;
  personalWebsite: string;
  socialLinks: Record<string, string>;
  skillsTags: string[];
  education: string;
  occupation: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
}

export interface UserLevelInfo {
  currentLv: number;
  currentLvName: string;
  currentLvExp: number;
  nextLvExp: number;
  progress: number;
  nextLvName: string;
  todayAiCallsRemaining: number;
  todayAiCallsTotal: number;
}

export interface UserProfileResponse {
  user: UserInfo;
  profile: UserProfileDetail;
  levelInfo: UserLevelInfo;
}
