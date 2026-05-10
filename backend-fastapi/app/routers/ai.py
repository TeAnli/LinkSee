import json
import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import SysUser
from app.schemas.ai import (
    ChatSendRequest,
    ContinueWriteRequest,
    FeedbackRequest,
    InspireRequest,
    OutlineAssistRequest,
    PolishOptimizeRequest,
    SummaryExtractRequest,
    TagRecommendRequest,
    TitleGenerateRequest,
    TranslateRequest,
)
from app.services import ai_mock, ai_service
from app.utils import fail, ok

router = APIRouter(prefix="/api/ai", tags=["AI"])


# === AI Create (8 functions) ===
@router.post("/create/title-generate")
async def title_generate(req: TitleGenerateRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_title_generate(req.content, req.style)
    await ai_service.record_task(db, user.id, "TITLE_GENERATE", req.content[:200], json.dumps(data["titles"], ensure_ascii=False))
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/outline-assist")
async def outline_assist(req: OutlineAssistRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_outline_assist(req.topic, req.detailLevel or "standard")
    await ai_service.record_task(db, user.id, "OUTLINE_ASSIST", req.topic, json.dumps(data["outline"], ensure_ascii=False))
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/polish-optimize")
async def polish_optimize(req: PolishOptimizeRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_polish_optimize(req.text, req.intensity or "medium", req.targetStyle or "formal")
    await ai_service.record_task(db, user.id, "POLISH_OPTIMIZE", req.text[:200], data["polishedText"])
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/continue-write")
async def continue_write(req: ContinueWriteRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_continue_write(req.context, req.mode or "detail", req.maxLength or 500)
    await ai_service.record_task(db, user.id, "CONTINUE_WRITE", req.context[:200], data["continuedText"])
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/translate")
async def translate(req: TranslateRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_translate(req.text, req.targetLang)
    await ai_service.record_task(db, user.id, "TRANSLATE", req.text[:200], data["translatedText"])
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/summary-extract")
async def summary_extract(req: SummaryExtractRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_summary_extract(req.content, req.maxLength or 200)
    await ai_service.record_task(db, user.id, "SUMMARY_EXTRACT", req.content[:200], data["summary"])
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/tag-recommend")
async def tag_recommend(req: TagRecommendRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_tag_recommend(req.title, req.content, req.categoryId)
    await ai_service.record_task(db, user.id, "TAG_RECOMMEND", req.title, json.dumps(data["tags"], ensure_ascii=False))
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/inspire")
async def inspire(req: InspireRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ai_service.check_quota(user)
    data = ai_mock.mock_inspire(req.topic, req.count or 5)
    await ai_service.record_task(db, user.id, "INSPIRE", req.topic, json.dumps(data["inspirations"], ensure_ascii=False))
    await ai_service.consume_quota(db, user)
    return ok(data)


# === AI Chat ===
@router.post("/chat/send")
async def chat_send(req: ChatSendRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.level < 2:
        from app.constants import ERR_LEVEL_INSUFFICIENT
        from app.exceptions import AppException
        raise AppException(ERR_LEVEL_INSUFFICIENT, "用户等级不足（需LV2）", 403)

    await ai_service.check_quota(user)

    if req.stream:
        async def event_generator():
            async for event in ai_mock.mock_chat_stream(req.question, req.sessionId):
                yield f"event: {event['event']}\ndata: {event['data']}\n\n"
        await ai_service.record_task(db, user.id, "QA_CHAT", req.question, "[streamed]")
        await ai_service.consume_quota(db, user)
        return StreamingResponse(event_generator(), media_type="text/event-stream")
    else:
        sid = req.sessionId or f"sess_{uuid.uuid4().hex[:12]}"
        answer = f"关于「{req.question}」这个问题，根据社区中的相关讨论...\n\n**核心要点**：这是一个值得深入探讨的话题。社区中有多篇精华帖子从不同角度给出了精彩的分析。\n\n> 来源: [相关讨论帖](/post/100001) — 作者: 李四\n> 来源: [技术分析帖](/post/100050) — 作者: 王五\n"
        sources = [
            {"postId": 100001, "title": "相关讨论帖", "authorName": "李四", "relevance": 0.92},
            {"postId": 100050, "title": "技术分析帖", "authorName": "王五", "relevance": 0.85},
        ]
        await ai_service.record_task(db, user.id, "QA_CHAT", req.question, answer)
        await ai_service.consume_quota(db, user)
        return ok({
            "sessionId": sid, "answer": answer, "sources": sources,
            "followups": ["能给我举个具体的例子吗？", "这个问题的深层原因是什么？"],
            "tokensUsed": {"input": 350, "output": 200},
        })


@router.get("/chat/sessions")
async def chat_sessions(
    page: int = 1, size: int = 20,
    user: SysUser = Depends(get_current_user),
):
    sessions = ai_mock._MOCK_SESSIONS
    return ok({"total": len(sessions), "sessions": sessions})


@router.get("/chat/session/{session_id}/messages")
async def chat_messages(session_id: str, user: SysUser = Depends(get_current_user)):
    msgs = ai_mock._MOCK_MESSAGES.get(session_id, [])
    return ok({"messages": msgs})


@router.delete("/chat/session/{session_id}")
async def delete_session(session_id: str, user: SysUser = Depends(get_current_user)):
    return ok(None, "会话已删除")


@router.get("/usage/quota")
async def get_quota(user: SysUser = Depends(get_current_user)):
    data = ai_service.get_quota_info(user)
    return ok(data)


@router.post("/chat/feedback")
async def submit_feedback(req: FeedbackRequest, user: SysUser = Depends(get_current_user)):
    return ok(None, "反馈已收到")
