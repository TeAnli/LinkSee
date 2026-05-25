from pydantic import BaseModel, Field


class TitleGenerateRequest(BaseModel):
    content: str
    categoryId: int | None = None
    style: str | None = Field(default=None, pattern=r"^(technical|question|story|data|suspense)?$")


class TitleItem(BaseModel):
    text: str
    style: str = ""


class TitleGenerateResponse(BaseModel):
    taskId: str
    titles: list[TitleItem]


class OutlineAssistRequest(BaseModel):
    topic: str
    categoryId: int | None = None
    detailLevel: str | None = "standard"


class OutlineSection(BaseModel):
    heading: str
    suggestedWords: int = 0
    points: list[str] = []


class OutlineResult(BaseModel):
    title: str = ""
    sections: list[OutlineSection] = []


class PolishOptimizeRequest(BaseModel):
    text: str
    intensity: str | None = "medium"
    targetStyle: str | None = "formal"


class DiffItem(BaseModel):
    original: str
    modified: str


class ContinueWriteRequest(BaseModel):
    context: str
    mode: str | None = "detail"
    maxLength: int | None = 500


class TranslateRequest(BaseModel):
    text: str
    targetLang: str


class SummaryExtractRequest(BaseModel):
    content: str
    maxLength: int | None = 200


class KeywordItem(BaseModel):
    word: str
    weight: float = 0


class TagRecommendRequest(BaseModel):
    title: str
    content: str
    categoryId: int | None = None
    limit: int | None = 10


class TagItem(BaseModel):
    name: str
    confidence: float = 0


class InspireRequest(BaseModel):
    topic: str
    categoryId: int | None = None
    count: int | None = 5


class InspirationItem(BaseModel):
    angle: str
    suggestion: str
    example: str = ""


class ChatSendRequest(BaseModel):
    question: str
    sessionId: str | None = None
    contextPostId: int | None = None
    stream: bool = True


class SessionItem(BaseModel):
    id: str
    title: str
    lastMessageAt: str | None = None
    messageCount: int = 0
    firstQuestion: str = ""


class ChatMessageItem(BaseModel):
    role: str
    content: str
    sources: list[dict] | None = None
    createdAt: str | None = None


class FeedbackRequest(BaseModel):
    sessionId: str
    messageId: str
    rating: str = Field(pattern=r"^(helpful|unhelpful)$")
    comment: str | None = None


class QuotaResponse(BaseModel):
    dailyLimit: int
    dailyUsed: int
    dailyRemaining: int
    level: int
    levelName: str
    unlimited: bool
