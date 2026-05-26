"""
内容审核服务

审核流程：
1. DFA 敏感词快速检查 → 命中则直接标记违规
2. AI 深度审核（mock 实现，后续可接入真实大模型）
   - 置信度 > 0.8 → 通过
   - 0.5 ~ 0.8 → 疑似违规，人工复审
   - < 0.5 → 违规

审核结果：
- pass: 自动通过，帖子直接发布
- review: 疑似违规，需人工复审
- reject: 违规，标记为违规状态并通知用户
"""

import random

from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import (
    ERR_CONTENT_SENSITIVE,
    POST_STATUS_PUBLISHED,
    POST_STATUS_REVIEWING,
    POST_STATUS_VIOLATION,
)
from app.exceptions import AppException
from app.models.ai_moderation import AiModerationLog
from app.models.post import ForumPost
from app.services.sensitive_word import get_filter


def _dfa_check(title: str, content: str) -> tuple[bool, list[str]]:
    """DFA 敏感词初筛，返回 (是否命中, 命中词列表)"""
    f = get_filter()
    found: list[str] = []
    found += [w for _, _, w in f.find_all(title)]
    found += [w for _, _, w in f.find_all(content)]
    return len(found) > 0, found


async def _ai_moderate(title: str, content: str, db: AsyncSession | None = None) -> tuple[float, str, str]:
    """
    AI 深度审核。

    返回 (置信度, 违规类型, 理由)
    置信度越高表示内容越安全（0=违规, 1=完全通过）
    """
    from app.config import settings

    if settings.ai_mock_enabled:
        roll = random.random()
        if roll < 0.05:
            violation_types = ["广告/垃圾信息", "人身攻击", "色情低俗", "政治敏感"]
            vt = random.choice(violation_types)
            return (round(random.uniform(0.1, 0.45), 2), vt, f"检测到{violation_types}内容")
        elif roll < 0.15:
            return (round(random.uniform(0.5, 0.75), 2), "", "内容包含疑似违规表述，建议人工复审")
        else:
            return (round(random.uniform(0.85, 0.99), 2), "", "")

    # 使用真实 LLM
    from app.services.ai.agent.forum_agent import ForumAgent
    from app.services.ai.providers.factory import ProviderFactory

    provider = ProviderFactory.create(settings)
    agent = ForumAgent(provider, db)
    return await agent.moderate(title, content)


async def moderate_post(db: AsyncSession, post_id: int) -> dict:
    """
    对帖子进行内容审核。

    先 DFA 快速检查，命中敏感词直接拒绝；
    再 AI 深度审核，根据置信度决定通过/疑似/违规。
    """
    post = await db.get(ForumPost, post_id)
    if not post:
        return {"action": "error", "reason": "帖子不存在"}

    # Step 1: DFA 敏感词检查
    dfa_hit, hit_words = _dfa_check(post.title, post.content)
    if dfa_hit:
        # 直接违规
        post.status = POST_STATUS_VIOLATION
        log = AiModerationLog(
            content_id=post_id,
            content_type="post",
            result=3,         # 违规
            violation_type=",".join(hit_words[:5]),
            confidence=1.0,   # DFA 命中置信度 100%
            action="reject",
        )
        db.add(log)
        await db.flush()
        return {"action": "reject", "reason": f"内容包含敏感词: {', '.join(hit_words[:5])}", "violationType": ",".join(hit_words[:5])}

    # Step 2: AI 深度审核
    confidence, violation_type, reason = await _ai_moderate(post.title, post.content, db)

    if confidence >= 0.8:
        # 通过
        post.status = POST_STATUS_PUBLISHED
        action = "pass"
    elif confidence >= 0.5:
        # 疑似，需人工复审
        post.status = POST_STATUS_REVIEWING
        action = "review"
    else:
        # 违规
        post.status = POST_STATUS_VIOLATION
        action = "reject"

    log = AiModerationLog(
        content_id=post_id,
        content_type="post",
        result=post.status,
        violation_type=violation_type,
        confidence=confidence,
        action=action,
    )
    db.add(log)
    await db.flush()

    return {
        "action": action,
        "confidence": confidence,
        "violationType": violation_type,
        "reason": reason,
        "newStatus": post.status,
    }


async def manual_approve(db: AsyncSession, post_id: int, admin_id: int) -> dict:
    """管理员手动通过审核"""
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(40401, "帖子不存在", 404)

    post.status = POST_STATUS_PUBLISHED
    await db.flush()
    return {"action": "approved", "postId": post_id}


async def manual_reject(db: AsyncSession, post_id: int, admin_id: int, reason: str = "") -> dict:
    """管理员手动拒绝审核"""
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(40401, "帖子不存在", 404)

    post.status = POST_STATUS_VIOLATION
    log = AiModerationLog(
        content_id=post_id,
        content_type="post",
        result=POST_STATUS_VIOLATION,
        violation_type="manual_reject",
        confidence=1.0,
        action="reject",
    )
    db.add(log)
    await db.flush()
    return {"action": "rejected", "postId": post_id, "reason": reason}
