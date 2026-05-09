from pathlib import Path
from sqlite3 import IntegrityError

from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.exceptions import RequestValidationError
from app.config import settings

from app.exceptions import AppException

from app.middleware.error_handler import (
    app_exception_handler,
    generic_exception_handler,
    integrity_error_handler,
    validation_exception_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
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

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get("/")
async def root():
    return "Seelink API"
