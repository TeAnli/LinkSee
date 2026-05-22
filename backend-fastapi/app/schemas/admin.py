from pydantic import BaseModel


class DashboardOverview(BaseModel):
    totalUsers: int = 0
    newUsersToday: int = 0
    totalPosts: int = 0
    newPostsToday: int = 0
    totalComments: int = 0
    newCommentsToday: int = 0
    activeUsers7d: int = 0
    aiCallsToday: int = 0


class TrendItem(BaseModel):
    date: str
    count: int


class UserStatusRequest(BaseModel):
    status: int
    reason: str | None = None
    muteUntil: str | None = None


class RoleUpdateRequest(BaseModel):
    roles: list[str]
    moderatorCategories: list[int] | None = None


class PostModerateRequest(BaseModel):
    action: str
    reason: str = ""


class PostFeatureRequest(BaseModel):
    isTop: bool | None = None
    topExpireAt: str | None = None
    isEssence: bool | None = None
    essenceReason: str | None = None


class CategoryManageRequest(BaseModel):
    name: str
    icon: str = ""
    parentId: int | None = None
    description: str = ""
    sortOrder: int = 0
    themeColor: str = "#1890ff"
    postTemplate: dict | None = None
    aiPersona: str = "专业友好的助手"
    status: int = 1


class AiUsageBreakdownItem(BaseModel):
    groupBy: str
    calls: int
    avgTokens: float = 0


class SensitiveWordAddRequest(BaseModel):
    category: str
    words: list[str]


class SensitiveWordDeleteRequest(BaseModel):
    category: str
    word: str


class SensitiveWordRawRequest(BaseModel):
    raw: str
