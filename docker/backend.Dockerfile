# ============================================================
# LinkSee Backend — FastAPI Dockerfile
# ============================================================
FROM python:3.12-slim

# Prevent Python from writing .pyc and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        gcc \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for layer caching
COPY apps/server/pyproject.toml apps/server/uv.lock ./

# Install Python dependencies
RUN uv sync --frozen --no-dev

# Copy application source
COPY apps/server/ ./

# Copy entrypoint
COPY docker/entrypoint.backend.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
