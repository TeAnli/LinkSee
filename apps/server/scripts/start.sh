#!/usr/bin/env bash
set -e

export PYTHONIOENCODING=utf-8
export LC_CTYPE=en_US.UTF-8

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

if [ ! -f ".env" ]; then
    echo ":: .env 不存在，从 .env.example 复制..."
    cp .env.example .env
    echo ":: 已创建 .env"
fi

if ! command -v uv &> /dev/null; then
    echo ":: 未检测到 uv，请先安装: https://docs.astral.sh/uv/"
    exit 1
fi

echo ":: 同步依赖..."
uv sync

echo ":: 运行数据库迁移..."
uv run alembic upgrade head || echo ":: 迁移失败，请检查数据库连接"

echo ":: 启动 FastAPI 服务 (http://127.0.0.1:8080)..."
uv run uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
