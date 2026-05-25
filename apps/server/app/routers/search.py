from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import search_service
from app.utils import ok

router = APIRouter(prefix="/api/search", tags=["搜索"])


@router.get("")
async def fulltext_search(
    q: str = Query(min_length=1),
    categoryId: int | None = None,
    tag: str | None = None,
    sort: str = "relevance",
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    data = await search_service.search(db, q, categoryId, tag, sort, page, size)
    return ok(data)


@router.get("/hot")
async def hot_keywords():
    data = await search_service.hot_keywords()
    return ok(data)


@router.get("/suggest")
async def search_suggest(q: str = Query(min_length=2), db: AsyncSession = Depends(get_db)):
    data = await search_service.suggest(db, q)
    return ok(data)
