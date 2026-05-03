import type { UserLevel } from "./types";

export const APP_NAME = "LinkSee 灵犀";
export const APP_DESCRIPTION = "AI赋能垂直行业智能论坛系统";

export const USER_LEVEL_NAMES: Record<UserLevel, string> = {
  [UserLevel.NEWBIE]: "萌新小白",
  [UserLevel.ACTIVE]: "活跃新人",
  [UserLevel.EXPERT]: "社区达人",
  [UserLevel.PROFESSIONAL]: "领域专家",
  [UserLevel.STAR]: "灵犀之星",
  [UserLevel.LEADER]: "社区领袖",
};

export const USER_LEVEL_ICONS: Record<UserLevel, string> = {
  [UserLevel.NEWBIE]: "\u{1F331}",
  [UserLevel.ACTIVE]: "\u{1F33F}",
  [UserLevel.EXPERT]: "\u{1F333}",
  [UserLevel.PROFESSIONAL]: "\u{1F525}",
  [UserLevel.STAR]: "\u{2B50}",
  [UserLevel.LEADER]: "\u{1F451}",
};

export const USER_LEVEL_EXP: Record<UserLevel, number> = {
  [UserLevel.NEWBIE]: 0,
  [UserLevel.ACTIVE]: 100,
  [UserLevel.EXPERT]: 500,
  [UserLevel.PROFESSIONAL]: 2000,
  [UserLevel.STAR]: 5000,
  [UserLevel.LEADER]: 10000,
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
