import datetime

from pydantic import BaseModel, Field


# --- Category ---
class CategoryNode(BaseModel):
    id: int
    name: str
    icon: str = ""
    description: str = ""
    themeColor: str = ""
    postCount: int = 0
    sortOrder: int = 0
    parentId: int | None = None
    children: list["CategoryNode"] = []

    model_config = {"from_attributes": True}


class CategoryInfo(BaseModel):
    id: int
    name: str
    icon: str
    description: str
    themeColor: str
    postCount: int
    postTemplate: dict = {}
    aiPersona: str = ""


class PostBrief(BaseModel):
    id: int
    title: str
    author: dict | None = None
    viewCount: int = 0
    commentCount: int = 0
    publishedAt: str | None = None

    model_config = {"from_attributes": True}


class CategoryDetailResponse(BaseModel):
    categoryInfo: CategoryInfo
    topPosts: list[PostBrief] = []
    essencePosts: list[PostBrief] = []


# --- Post ---
class PostCreateRequest(BaseModel):
    categoryId: int
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=50000)
    tagList: list[str] = Field(default=[], max_length=10)
    coverImageUrl: str | None = None


class PostCreateResponse(BaseModel):
    postId: int
    status: int
    message: str


class PostUpdateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    content: str | None = Field(default=None, max_length=50000)
    tagList: list[str] | None = None
    categoryId: int | None = None
    coverImageUrl: str | None = None


class AuthorBrief(BaseModel):
    id: int
    nickname: str
    avatarUrl: str = ""
    level: int = 1
    bio: str = ""
    postCount: int = 0
    followerCount: int = 0
    isFollowed: bool = False


class AiDataBrief(BaseModel):
    aiSummary: str = ""
    aiKeywords: list[str] = []
    qualityScore: float = 0
    estimatedReadTime: int = 0


class PostDetailData(BaseModel):
    id: int
    title: str
    content: str = ""
    summary: str = ""
    coverImageUrl: str = ""
    tagList: list[str] = []
    categoryId: int
    categoryName: str = ""
    viewCount: int = 0
    likeCount: int = 0
    commentCount: int = 0
    collectCount: int = 0
    status: int = 0
    isTop: bool = False
    isEssence: bool = False
    authorId: int
    authorNickname: str = ""
    authorAvatarUrl: str = ""
    authorLevel: int = 1
    publishedAt: str | None = None
    createdAt: str | None = None


class PostDetailResponse(BaseModel):
    post: PostDetailData
    author: AuthorBrief | None = None
    aiData: AiDataBrief | None = None
    isLiked: bool = False
    isCollected: bool = False


class PostSummary(BaseModel):
    id: int
    title: str
    summary: str = ""
    coverImageUrl: str = ""
    tagList: list[str] = []
    categoryId: int
    categoryName: str = ""
    viewCount: int = 0
    likeCount: int = 0
    commentCount: int = 0
    collectCount: int = 0
    isTop: bool = False
    isEssence: bool = False
    author: dict | None = None
    publishedAt: str | None = None


# --- Comment ---
class CommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parentId: int | None = None
    replyUserId: int | None = None


class ReplyTo(BaseModel):
    userId: int
    nickname: str


class CommentItem(BaseModel):
    id: int
    content: str
    likeCount: int = 0
    isLiked: bool = False
    createdAt: str | None = None
    author: dict | None = None
    replyTo: ReplyTo | None = None
    childCount: int = 0
    children: list["CommentItem"] = []


# --- Toggle ---
class ToggleResponse(BaseModel):
    liked: bool | None = None
    collected: bool | None = None
    followed: bool | None = None
    likeCount: int | None = None
    collectCount: int | None = None
    followerCount: int | None = None
