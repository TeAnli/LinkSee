from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "LinkSee API"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://postgres:123456@localhost:5432/linksee"
    jwt_secret: str = "change-me-in-production-min-256-bits-length"
    jwt_expiration_seconds: int = 7200
    jwt_refresh_expiration_seconds: int = 604800
    redis_url: str = "redis://localhost:6379/0"
    upload_dir: str = "./uploads"
    max_upload_size: int = 5 * 1024 * 1024
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    ai_mock_enabled: bool = True
    smtp_host: str = "smtp.qq.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_use_tls: bool = True
    email_code_expire_seconds: int = 60
    email_code_rate_limit_seconds: int = 300
    password_reset_token_expire_seconds: int = 60
    frontend_url: str = "http://localhost:5173"
    encryption_enabled: bool = True
    rsa_key_dir: str = "./keys"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent / ".env"),
        "env_file_encoding": "utf-8",
    }


settings = Settings()
