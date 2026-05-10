@echo off
cd /d "%~dp0.."

if not exist ".env" (
    echo :: .env 不存在，从 .env.example 复制...
    copy .env.example .env
    echo :: 已创建 .env
)

where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo :: 未检测到 uv，请先安装: https://docs.astral.sh/uv/
    exit /b 1
)

echo :: 同步依赖...
uv sync


echo :: 运行数据库迁移...
uv run alembic upgrade head || echo :: 迁移失败，请检查数据库连接

echo :: 启动 FastAPI 服务 (http://127.0.0.1:8000)...
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
