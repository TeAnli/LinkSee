from sqlalchemy import BigInteger, Double, ForeignKey, Identity, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ForumPostAiData(Base):
    __tablename__ = "forum_post_ai_data"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    post_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("forum_post.id"), unique=True, nullable=False)
    ai_summary: Mapped[str] = mapped_column(Text, default="")
    ai_keywords: Mapped[list] = mapped_column(JSONB, default=list)
    sentiment_score: Mapped[float] = mapped_column(Double, default=0)
    quality_score: Mapped[float] = mapped_column(Double, default=0)
    read_duration_estimate: Mapped[int] = mapped_column(Integer, default=0)
    vector_id: Mapped[str] = mapped_column(String(100), default="")

    post: Mapped["ForumPost"] = relationship(back_populates="ai_data")
