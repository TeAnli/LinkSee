import time
from typing import Any

from app.constants import ERR_SUCCESS


def ok(data: Any = None, message: str = "success") -> dict:
    return {
        "code": ERR_SUCCESS,
        "message": message,
        "data": data,
        "timestamp": int(time.time() * 1000),
    }


def fail(code: int, message: str, data: Any = None) -> dict:
    return {
        "code": code,
        "message": message,
        "data": data,
        "timestamp": int(time.time() * 1000),
    }
