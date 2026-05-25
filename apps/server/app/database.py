from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
    echo=settings.debug,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    """获取数据库会话的异步生成器，用于依赖注入。"""
    async with async_session() as session:
        try:
            yield session  # 提供会话给调用方
            await session.commit()  # 正常完成时提交事务
        except Exception:
            await session.rollback()  # 异常时回滚事务
            raise
