from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "LinkSee API"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://linksee:linksee123@localhost:5432/linksee"
    jwt_secret: str = "change-me-in-production-min-256-bits-length"
    jwt_expiration_seconds: int = 7200
    jwt_refresh_expiration_seconds: int = 604800
    redis_url: str = "redis://localhost:6379/0"
    upload_dir: str = "./uploads"
    max_upload_size: int = 5 * 1024 * 1024
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    ai_mock_enabled: bool = True

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
