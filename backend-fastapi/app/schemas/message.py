from pydantic import BaseModel


class NotificationItem(BaseModel):
    id: int
    type: str = ""
    subType: str = ""
    title: str
    content: str = ""
    targetType: str = ""
    targetId: int = 0
    postId: int | None = None
    triggerUserId: int | None = None
    triggerUserNickname: str | None = None
    triggerUserAvatarUrl: str | None = None
    isRead: bool = False
    createdAt: str | None = None


class UnreadCountResponse(BaseModel):
    total: int
    interaction: int
    system: int
    ai: int


class MarkAllReadRequest(BaseModel):
    type: str | None = None
