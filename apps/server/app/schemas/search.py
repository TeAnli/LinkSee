from pydantic import BaseModel


class SearchResultItem(BaseModel):
    id: int
    title: str
    summary: str = ""
    tagList: list[str] = []
    categoryId: int | None = None
    categoryName: str = ""
    author: dict | None = None
    viewCount: int = 0
    likeCount: int = 0
    commentCount: int = 0
    publishedAt: str | None = None
    highlight: dict | None = None
    score: float = 0


class HotKeywordItem(BaseModel):
    keyword: str
    heat: int = 0
