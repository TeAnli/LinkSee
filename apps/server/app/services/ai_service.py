from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import ERR_AI_QUOTA_EXHAUSTED, ERR_LEVEL_INSUFFICIENT, LEVEL_CONFIG
from app.exceptions import AppException
from app.models.user import SysUser


async def check_quota(user: SysUser) -> int:
    cfg = LEVEL_CONFIG.get(user.level, LEVEL_CONFIG[1])
    daily_limit = cfg["daily_ai"]
    if daily_limit == 0:
        return 999  # unlimited
    remaining = daily_limit - user.daily_ai_calls
    if remaining <= 0:
        raise AppException(ERR_AI_QUOTA_EXHAUSTED, "今日AI额度已用完", 429)
    return remaining


async def consume_quota(db: AsyncSession, user: SysUser):
    user.daily_ai_calls = (user.daily_ai_calls or 0) + 1
    await db.flush()


async def record_task(
    db: AsyncSession, user_id: int, task_type: str, input_summary: str,
    output_content: str, model: str = "mock", status: int = 1,
    tokens_input: int = 0, tokens_output: int = 0, response_ms: int = 0,
):
    from app.models.ai_task import AiTaskRecord
    task = AiTaskRecord(
        user_id=user_id, task_type=task_type, input_summary=input_summary,
        output_content=output_content, model_used=model, status=status,
        tokens_input=tokens_input, tokens_output=tokens_output, response_ms=response_ms,
    )
    db.add(task)
    await db.flush()
    return task.id


def get_quota_info(user: SysUser) -> dict:
    cfg = LEVEL_CONFIG.get(user.level, LEVEL_CONFIG[1])
    daily_limit = cfg["daily_ai"]
    unlimited = daily_limit == 0
    daily_used = user.daily_ai_calls
    daily_remaining = 999 if unlimited else max(0, daily_limit - daily_used)
    return {
        "dailyLimit": daily_limit if daily_limit > 0 else 999,
        "dailyUsed": daily_used,
        "dailyRemaining": daily_remaining,
        "level": user.level,
        "levelName": cfg["name"],
        "unlimited": unlimited,
    }
