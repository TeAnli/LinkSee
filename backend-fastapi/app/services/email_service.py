import asyncio
import random
import string
from email.mime.text import MIMEText

import aiosmtplib

from app.config import settings
from app.redis import redis_client


async def send_email_code(to_email: str) -> str:
    code = "".join(random.choices(string.digits, k=6))

    key = f"email_code:{to_email}"
    await redis_client.setex(key, settings.email_code_expire_seconds, code)

    rate_key = f"email_code_rate:{to_email}"
    await redis_client.setex(rate_key, settings.email_code_rate_limit_seconds, "1")

    if settings.smtp_username and settings.smtp_password:
        msg = MIMEText(
            f"<html><body><h2>LinkSee 邮箱验证码</h2><p>您的验证码是：<strong>{code}</strong></p><p>有效期 {settings.email_code_expire_seconds // 60} 分钟，请勿泄露给他人。</p></body></html>",
            "html",
            "utf-8",
        )
        msg["Subject"] = "LinkSee 邮箱验证码"
        msg["From"] = settings.smtp_from_email or settings.smtp_username
        msg["To"] = to_email

        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            use_tls=settings.smtp_use_tls,
        )
    else:
        # SMTP not configured — print code to console for dev
        print(f"[DEV] Email verification code for {to_email}: {code}")

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


async def send_email_code_with_retry(to_email: str, max_retries: int = 2) -> str:
    for attempt in range(max_retries + 1):
        try:
            return await send_email_code(to_email)
        except Exception:
            if attempt == max_retries:
                raise
            await asyncio.sleep(1 ** (attempt + 1))
    return ""
