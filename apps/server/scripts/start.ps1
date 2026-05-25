$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

if (-not (Test-Path ".env")) {
    Write-Host ":: .env 不存在，从 .env.example 复制..."
    Copy-Item .env.example .env
    Write-Host ":: 已创建 .env"
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host ":: 未检测到 uv，请先安装: https://docs.astral.sh/uv/"
    exit 1
}

Write-Host ":: 同步依赖..."
uv sync

Write-Host ":: 运行数据库迁移..."
uv run alembic upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host ":: 迁移失败，请检查数据库连接"
}

Write-Host ":: 启动 FastAPI 服务 (http://127.0.0.1:8080)..."
uv run uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
