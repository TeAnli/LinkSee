from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
import uvicorn

from app.config import settings
from app.crypto import generate_rsa_key_pair
from app.exceptions import AppException
from app.middleware.decrypt import DecryptionMiddleware
from app.middleware.error_handler import (
    app_exception_handler,
    generic_exception_handler,
    integrity_error_handler,
    validation_exception_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    if settings.encryption_enabled:
        generate_rsa_key_pair()
    yield


""" 
创建FastAPI实例 
配置初始版本号 version: 1.0.0
配置文档URL docs_url: /docs
配置生命周期函数 lifespan
"""
app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

"""
请求解密中间件 - 在 CORS 之前注册，确保加密请求先被解密
拦截带有 X-Encrypted: true 头的请求，解密后传递给下游路由
"""
app.add_middleware(DecryptionMiddleware)

"""
跨域中间件配置，允许前端应用访问API
allow_origins: 允许的来源列表，来自配置 settings.allowed_origins_list
allow_credentials: 允许携带凭证（如cookies）
allow_methods: 允许的HTTP方法，这里设置为允许所有方法 ["*"]
allow_headers: 允许的HTTP头，这里设置为允许所有头 ["*"]
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

""" 
异常处理
为应用添加全局异常处理器，捕获不同类型的异常并返回统一格式的错误响应
AppException: 自定义应用异常，使用 app_exception_handler 处理
RequestValidationError: 请求验证错误，使用 validation_exception_handler 处理
IntegrityError: 数据库完整性错误，使用 integrity_error_handler 处理
Exception: 捕获所有其他未处理的异常，使用 generic_exception_handler 处理
"""
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)

""" 
静态文件配置
创建上传目录（如果不存在），并将其挂载为静态文件目录，允许
通过 /uploads 路径访问上传的文件
"""
uploads_dir = Path(settings.upload_dir)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.forum import router as forum_router
from app.routers.search import router as search_router
from app.routers.ai import router as ai_router
from app.routers.message import router as message_router
from app.routers.admin import router as admin_router

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(forum_router)
app.include_router(search_router)
app.include_router(ai_router)
app.include_router(message_router)
app.include_router(admin_router)


@app.get("/")
async def root():
    return "Linksee API"


# if __name__ == "__main__":
#     uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
