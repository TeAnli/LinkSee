from pydantic import BaseModel


class NotificationItem(BaseModel):
    id: int
    type: str = ""
    title: str
    content: str = ""
    relatedId: int | None = None
    isRead: bool = False
    createdAt: str | None = None


class UnreadCountResponse(BaseModel):
    total: int
    interaction: int
    system: int
    ai: int


class MarkAllReadRequest(BaseModel):
    type: str | None = None
