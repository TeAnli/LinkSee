import asyncio
import random
import string

from app.config import settings
from app.redis import redis_client
from app.services.email_template_service import render_template, send_email_direct


async def send_email_code(to_email: str, code_type: str = "register") -> str:
    code = "".join(random.choices(string.digits, k=6))

    if code_type == "reset-password":
        key = f"email_code_reset:{to_email}"
    else:
        key = f"email_code:{to_email}"
    await redis_client.setex(key, settings.email_code_expire_seconds, code)

    rate_key = f"email_code_rate:{to_email}"
    await redis_client.setex(rate_key, settings.email_code_rate_limit_seconds, "1")

    subject = "LinkSee 密码重置验证码" if code_type == "reset-password" else "LinkSee 邮箱验证码"
    body = render_template("verification_code",
        code=code,
        code_type=code_type,
        expire_minutes=settings.email_code_expire_seconds // 60,
    )

    if settings.smtp_username and settings.smtp_password:
        await send_email_direct(to_email, subject, body)
    else:
        print(f"[DEV] Email code ({code_type}) for {to_email}: {code}")

    return code


async def check_email_rate_limit(email: str) -> bool:
    rate_key = f"email_code_rate:{email}"
    return await redis_client.exists(rate_key) == 0


async def verify_email_code(email: str, code: str) -> bool:
    key = f"email_code:{email}"
    stored = await redis_client.get(key)
    if stored is None:
        return False
    if stored != code:
        return False
    await redis_client.delete(key)
    return True


async def verify_reset_email_code(email: str, code: str) -> bool:
    key = f"email_code_reset:{email}"
    stored = await redis_client.get(key)
    if stored is None:
        return False
    if stored != code:
        return False
    await redis_client.delete(key)
    return True


async def send_email_code_with_retry(to_email: str, code_type: str = "register", max_retries: int = 2) -> str:
    for attempt in range(max_retries + 1):
        try:
            return await send_email_code(to_email, code_type)
        except Exception:
            if attempt == max_retries:
                raise
            await asyncio.sleep(1 ** (attempt + 1))
    return ""
