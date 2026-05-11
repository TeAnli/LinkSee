import json
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings
from app.crypto import decrypt_payload

logger = logging.getLogger(__name__)


class DecryptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not settings.encryption_enabled:
            return await call_next(request)

        if request.headers.get("X-Encrypted") != "true":
            return await call_next(request)

        try:
            body = await request.body()
            encrypted_body = json.loads(body)

            if not encrypted_body.get("encrypted"):
                return await call_next(request)

            plaintext = decrypt_payload(encrypted_body)

            async def _receive():
                return {"type": "http.request", "body": plaintext, "more_body": False}

            request._receive = _receive
            request._body = plaintext

        except Exception:
            logger.exception("Failed to decrypt request body")
            return JSONResponse(
                status_code=400,
                content={"code": 40003, "message": "请求解密失败", "data": None, "timestamp": 0},
            )

        return await call_next(request)
