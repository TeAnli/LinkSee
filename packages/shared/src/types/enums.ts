// === Enums ===

export enum PostStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  UNDER_REVIEW = 2,
  VIOLATION = 3,
}

export enum UserLevel {
  NEWBIE = 1,
  ACTIVE = 2,
  EXPERT = 3,
  PROFESSIONAL = 4,
  STAR = 5,
  LEADER = 6,
}

export enum UserRole {
  VISITOR = "visitor",
  USER = "user",
  VERIFIED = "verified",
  MODERATOR = "moderator",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}
