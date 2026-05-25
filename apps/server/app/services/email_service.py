import asyncio
import random
import string
from email.mime.text import MIMEText

import aiosmtplib

from app.config import settings
from app.redis import redis_client


async def send_email_code(to_email: str, code_type: str = "register") -> str:
    code = "".join(random.choices(string.digits, k=6))

    if code_type == "reset-password":
        key = f"email_code_reset:{to_email}"
    else:
        key = f"email_code:{to_email}"
    await redis_client.setex(key, settings.email_code_expire_seconds, code)

    rate_key = f"email_code_rate:{to_email}"
    await redis_client.setex(rate_key, settings.email_code_rate_limit_seconds, "1")

    if settings.smtp_username and settings.smtp_password:
        if code_type == "reset-password":
            subject = "LinkSee 密码重置验证码"
            body = (
                f"<html><body>"
                f"<h2>LinkSee 密码重置</h2>"
                f"<p>您正在重置密码，验证码为：<strong>{code}</strong></p>"
                f"<p>有效期 {settings.email_code_expire_seconds // 60} 分钟，请勿泄露给他人。</p>"
                f"<p>如非本人操作，请忽略此邮件。</p>"
                f"</body></html>"
            )
        else:
            subject = "LinkSee 邮箱验证码"
            body = (
                f"<html><body>"
                f"<h2>LinkSee 邮箱验证码</h2>"
                f"<p>您的验证码是：<strong>{code}</strong></p>"
                f"<p>有效期 {settings.email_code_expire_seconds // 60} 分钟，请勿泄露给他人。</p>"
                f"</body></html>"
            )
        msg = MIMEText(body, "html", "utf-8")
        msg["Subject"] = subject
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
