#!/usr/bin/env bash
set -e

echo "=== LinkSee Backend Entrypoint ==="

# Wait for PostgreSQL using pg_isready
echo "Waiting for PostgreSQL..."
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U linksee -t 2 >/dev/null 2>&1; do
    echo "  PostgreSQL ($DB_HOST:${DB_PORT:-5432}) not ready — retrying in 2s..."
    sleep 2
done
echo "PostgreSQL is ready."

# Run database migrations
echo "Running database migrations..."
uv run alembic upgrade head

# Start the FastAPI server
echo "Starting FastAPI on 0.0.0.0:8080..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8080
