from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.exceptions import AppException
from app.utils import fail


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=fail(exc.code, exc.detail["message"]))


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    detail = "; ".join(e["msg"] for e in errors[:3])
    return JSONResponse(status_code=422, content=fail(40000, f"请求参数错误: {detail}"))


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    msg = str(exc.orig).lower() if exc.orig else ""
    if "unique" in msg or "duplicate" in msg:
        if "username" in msg:
            return JSONResponse(status_code=409, content=fail(40001, "用户名已存在"))
        if "email" in msg:
            return JSONResponse(status_code=409, content=fail(40002, "邮箱已注册"))
        if "phone" in msg:
            return JSONResponse(status_code=409, content=fail(40003, "手机号已注册"))
        return JSONResponse(status_code=409, content=fail(40000, "数据重复冲突"))
    return JSONResponse(status_code=500, content=fail(50000, "数据库操作异常"))


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content=fail(50000, "服务器内部错误"))
