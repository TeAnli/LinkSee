import redis.asyncio as aioredis

from app.config import settings

redis_client = aioredis.from_url(
    settings.redis_url,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_keepalive=True,
)
