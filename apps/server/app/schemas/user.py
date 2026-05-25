from pydantic import BaseModel, Field


class ProfileUpdateRequest(BaseModel):
    nickname: str | None = Field(default=None, max_length=50)
    bio: str | None = Field(default=None, max_length=500)
    location: str | None = None
    personalWebsite: str | None = None
    socialLinks: dict | None = None
    skillsTags: list[str] | None = None
    education: str | None = None
    occupation: str | None = None


class LevelInfo(BaseModel):
    currentLv: int
    currentLvName: str
    currentLvExp: int
    nextLvExp: int
    progress: float
    nextLvName: str
    todayAiCallsRemaining: int
    todayAiCallsTotal: int


class UserProfileData(BaseModel):
    user: dict
    profile: dict
    levelInfo: LevelInfo


class PublicProfileData(BaseModel):
    user: dict
    isFollowed: bool = False


class FollowerItem(BaseModel):
    userId: int
    nickname: str
    avatarUrl: str
    level: int
    bio: str = ""
    isFollowed: bool = False
    followedAt: str | None = None


class RankingItem(BaseModel):
    rank: int
    userId: int
    nickname: str
    avatarUrl: str
    level: int
    value: int
    badge: str = ""


class CheckInResponse(BaseModel):
    pointsEarned: int
    consecutiveDays: int
    totalPoints: int


class AvatarResponse(BaseModel):
    avatarUrl: str
