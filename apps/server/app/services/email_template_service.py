from pathlib import Path

import aiosmtplib
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader

from app.config import settings

_TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates" / "email"
_env = Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR)), autoescape=True)


def render_template(template_name: str, **kwargs) -> str:
    template = _env.get_template(f"{template_name}.html")
    return template.render(frontend_url=settings.frontend_url, **kwargs)


def _make_msg(to_email: str, subject: str, html: str) -> MIMEText:
    msg = MIMEText(html, "html", "utf-8")
    msg["Subject"] = subject
    name = settings.smtp_from_name
    addr = settings.smtp_from_email or settings.smtp_username
    msg["From"] = f"{name} <{addr}>"
    msg["To"] = to_email
    return msg


async def send_email_direct(to_email: str, subject: str, html: str) -> None:
    if not settings.smtp_username or not settings.smtp_password:
        print(f"[DEV] Email to {to_email}: {subject}")
        return

    msg = _make_msg(to_email, subject, html)
    await aiosmtplib.send(
        msg,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_username,
        password=settings.smtp_password,
        use_tls=settings.smtp_use_tls,
    )
