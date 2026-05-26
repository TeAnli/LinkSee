import json
import time
import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
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
from app.services.ai.agent.forum_agent import ForumAgent
from app.services.ai.memory.chat_memory import ChatMemoryService
from app.services.ai.providers.factory import ProviderFactory
from app.services.ai.streaming import sse_adapter
from app.utils import fail, ok

router = APIRouter(prefix="/api/ai", tags=["AI"])

# 全局缓存的 ForumAgent 实例
_forum_agent: ForumAgent | None = None


async def _get_forum_agent(db: AsyncSession) -> ForumAgent:
    global _forum_agent
    if _forum_agent is None:
        provider = ProviderFactory.create(settings)
        _forum_agent = ForumAgent(provider, db)
    else:
        _forum_agent._db = db
    return _forum_agent


# === Executor 抽象 ===

class MockAIExecutor:

    @property
    def model_name(self) -> str:
        return "mock"

    async def title_generate(self, req: TitleGenerateRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_title_generate(req.content, req.style)

    async def outline_assist(self, req: OutlineAssistRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_outline_assist(req.topic, req.detailLevel or "standard")

    async def polish_optimize(self, req: PolishOptimizeRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_polish_optimize(req.text, req.intensity or "medium", req.targetStyle or "formal")

    async def continue_write(self, req: ContinueWriteRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_continue_write(req.context, req.mode or "detail", req.maxLength or 500)

    async def translate(self, req: TranslateRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_translate(req.text, req.targetLang)

    async def summary_extract(self, req: SummaryExtractRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_summary_extract(req.content, req.maxLength or 200)

    async def tag_recommend(self, req: TagRecommendRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_tag_recommend(req.title, req.content, req.categoryId)

    async def inspire(self, req: InspireRequest, user: SysUser, db: AsyncSession) -> dict:
        return ai_mock.mock_inspire(req.topic, req.count or 5)

    async def chat_send(self, req: ChatSendRequest, user: SysUser, db: AsyncSession) -> dict:
        sid = req.sessionId or f"sess_{uuid.uuid4().hex[:12]}"
        return {
            "sessionId": sid,
            "answer": f"关于「{req.question}」这个问题，根据社区中的相关讨论...",
            "sources": [
                {"postId": 100001, "title": "相关讨论帖", "authorName": "李四", "relevance": 0.92},
            ],
            "followups": ["能给我举个具体的例子吗？", "这个问题的深层原因是什么？"],
            "tokensUsed": {"input": 350, "output": 200},
        }

    async def chat_send_stream(self, req: ChatSendRequest, user: SysUser, db: AsyncSession):
        async for event in ai_mock.mock_chat_stream(req.question, req.sessionId):
            yield f"event: {event['event']}\ndata: {event['data']}\n\n"


class RealAIExecutor:

    def __init__(self, agent: ForumAgent):
        self._agent = agent

    @property
    def model_name(self) -> str:
        return self._agent.model_name

    async def title_generate(self, req: TitleGenerateRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.generate_titles(req.content, req.style)
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def outline_assist(self, req: OutlineAssistRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.generate_outline(req.topic, req.detailLevel or "standard")
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def polish_optimize(self, req: PolishOptimizeRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.polish_text(req.text, req.intensity or "medium", req.targetStyle or "formal")
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def continue_write(self, req: ContinueWriteRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.continue_write(req.context, req.mode or "detail", req.maxLength or 500)
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def translate(self, req: TranslateRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.translate(req.text, req.targetLang)
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def summary_extract(self, req: SummaryExtractRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.extract_summary(req.content, req.maxLength or 200)
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def tag_recommend(self, req: TagRecommendRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.recommend_tags(req.title, req.content, req.categoryId)
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def inspire(self, req: InspireRequest, user: SysUser, db: AsyncSession) -> dict:
        data = await self._agent.inspire(req.topic, req.count or 5)
        data["taskId"] = f"task_{uuid.uuid4().hex[:12]}"
        return data

    async def chat_send(self, req: ChatSendRequest, user: SysUser, db: AsyncSession) -> dict:
        memory = ChatMemoryService(db)
        session_id = await memory.get_or_create_session(user.id, req.sessionId)
        history = await memory.load_history(session_id)
        result = await self._agent.execute_chat(req.question, user, history)
        await memory.save_exchange(session_id, user.id, req.question, result["answer"])
        return {
            "sessionId": session_id,
            "answer": result["answer"],
            "sources": result.get("sources", []),
            "followups": result.get("followups", []),
            "tokensUsed": result.get("tokensUsed", {"input": 0, "output": 0}),
        }


async def get_ai_executor(db: AsyncSession = Depends(get_db)):
    if settings.ai_mock_enabled:
        return MockAIExecutor()
    agent = await _get_forum_agent(db)
    return RealAIExecutor(agent)


# === AI 写作辅助（8 个接口） ===

@router.post("/create/title-generate")
async def title_generate(
    req: TitleGenerateRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    start = time.time()
    data = await executor.title_generate(req, user, db)
    elapsed = int((time.time() - start) * 1000)
    await ai_service.record_task(db, user.id, "TITLE_GENERATE", req.content[:200],
                                 json.dumps(data.get("titles", []), ensure_ascii=False),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/outline-assist")
async def outline_assist(
    req: OutlineAssistRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    data = await executor.outline_assist(req, user, db)
    await ai_service.record_task(db, user.id, "OUTLINE_ASSIST", req.topic,
                                 json.dumps(data.get("outline", {}), ensure_ascii=False),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/polish-optimize")
async def polish_optimize(
    req: PolishOptimizeRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    data = await executor.polish_optimize(req, user, db)
    await ai_service.record_task(db, user.id, "POLISH_OPTIMIZE", req.text[:200],
                                 data.get("polishedText", ""),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/continue-write")
async def continue_write(
    req: ContinueWriteRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    data = await executor.continue_write(req, user, db)
    await ai_service.record_task(db, user.id, "CONTINUE_WRITE", req.context[:200],
                                 data.get("continuedText", ""),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/translate")
async def translate(
    req: TranslateRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    data = await executor.translate(req, user, db)
    await ai_service.record_task(db, user.id, "TRANSLATE", req.text[:200],
                                 data.get("translatedText", ""),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/summary-extract")
async def summary_extract(
    req: SummaryExtractRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    data = await executor.summary_extract(req, user, db)
    await ai_service.record_task(db, user.id, "SUMMARY_EXTRACT", req.content[:200],
                                 data.get("summary", ""),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/tag-recommend")
async def tag_recommend(
    req: TagRecommendRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    data = await executor.tag_recommend(req, user, db)
    await ai_service.record_task(db, user.id, "TAG_RECOMMEND", req.title,
                                 json.dumps(data.get("tags", []), ensure_ascii=False),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


@router.post("/create/inspire")
async def inspire(
    req: InspireRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    await ai_service.check_quota(user)
    data = await executor.inspire(req, user, db)
    await ai_service.record_task(db, user.id, "INSPIRE", req.topic,
                                 json.dumps(data.get("inspirations", []), ensure_ascii=False),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


# === AI 智能问答 ===

@router.post("/chat/send")
async def chat_send(
    req: ChatSendRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    executor=Depends(get_ai_executor),
):
    if user.level < 2:
        from app.constants import ERR_LEVEL_INSUFFICIENT
        from app.exceptions import AppException
        raise AppException(ERR_LEVEL_INSUFFICIENT, "用户等级不足（需LV2）", 403)

    await ai_service.check_quota(user)

    if req.stream:
        async def event_generator():
            if isinstance(executor, MockAIExecutor):
                async for chunk in executor.chat_send_stream(req, user, db):
                    yield chunk
            else:
                memory = ChatMemoryService(db)
                session_id = await memory.get_or_create_session(user.id, req.sessionId)
                history = await memory.load_history(session_id)
                full_answer: list[str] = []

                async for chunk in sse_adapter.stream_agent_response(
                    executor._agent, req.question, user, session_id, history,
                ):
                    # 收集完整回答用于保存
                    # SSE 事件以 JSON 形式传递，我们透传
                    yield chunk

                # 保存对话
                # full_answer 收集逻辑在 SSE adapter 中完成，此处简化处理
                await memory.save_exchange(session_id, user.id, req.question, "[流式回答]")

        await ai_service.record_task(db, user.id, "QA_CHAT", req.question, "[streamed]")
        await ai_service.consume_quota(db, user)
        return StreamingResponse(event_generator(), media_type="text/event-stream")

    # 非流式
    data = await executor.chat_send(req, user, db)
    await ai_service.record_task(db, user.id, "QA_CHAT", req.question,
                                 data.get("answer", ""),
                                 model=executor.model_name)
    await ai_service.consume_quota(db, user)
    return ok(data)


# === 会话管理 ===

@router.get("/chat/sessions")
async def chat_sessions(
    page: int = 1, size: int = 20,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if settings.ai_mock_enabled:
        sessions = ai_mock._MOCK_SESSIONS
        return ok({"total": len(sessions), "sessions": sessions})

    memory = ChatMemoryService(db)
    sessions = await memory.get_sessions(user.id)
    return ok({"total": len(sessions), "sessions": sessions})


@router.get("/chat/session/{session_id}/messages")
async def chat_messages(
    session_id: str,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if settings.ai_mock_enabled:
        msgs = ai_mock._MOCK_MESSAGES.get(session_id, [])
        return ok({"messages": msgs})

    memory = ChatMemoryService(db)
    msgs = await memory.get_messages(session_id, user.id)
    return ok({"messages": msgs})


@router.delete("/chat/session/{session_id}")
async def delete_session(
    session_id: str,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.ai_mock_enabled:
        memory = ChatMemoryService(db)
        await memory.delete_session(session_id, user.id)
    return ok(None, "会话已删除")


@router.get("/usage/quota")
async def get_quota(user: SysUser = Depends(get_current_user)):
    data = ai_service.get_quota_info(user)
    return ok(data)


@router.post("/chat/feedback")
async def submit_feedback(req: FeedbackRequest, user: SysUser = Depends(get_current_user)):
    return ok(None, "反馈已收到")
