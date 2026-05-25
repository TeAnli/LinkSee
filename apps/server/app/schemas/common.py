import time
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    data: T | None = None
    timestamp: int = Field(default_factory=lambda: int(time.time() * 1000))


class PageParams(BaseModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)


class PageResponse(BaseModel, Generic[T]):
    total: int
    page: int
    size: int
    has_more: bool
    list: list[T]


class UserBriefInfo(BaseModel):
    id: int
    nickname: str = ""
    avatarUrl: str = ""
    level: int = 1

    model_config = {"from_attributes": True}


def make_user_brief(user) -> UserBriefInfo:
    return UserBriefInfo(
        id=user.id,
        nickname=user.nickname or user.username,
        avatarUrl=user.avatar_url or "",
        level=user.level,
    )
