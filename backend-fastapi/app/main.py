from pathlib import Path

from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from app.config import settings


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


@app.get("/")
async def root():
    return "Seelink API"
