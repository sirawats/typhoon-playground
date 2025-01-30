from typing import Optional

from redis.asyncio import ConnectionPool, Redis

from app.config import settings


class RedisClient:
    _instance: Optional[Redis] = None
    _pool: Optional[ConnectionPool] = None

    @classmethod
    async def get_instance(cls) -> Redis:
        if cls._instance is None:
            cls._pool = ConnectionPool.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
                max_connections=settings.REDIS_POOL_SIZE,
                decode_responses=True,
            )
            cls._instance = Redis(connection_pool=cls._pool)
        return cls._instance

    @classmethod
    async def close(cls):
        if cls._instance:
            await cls._instance.close()
            if cls._pool:
                await cls._pool.disconnect()
            cls._instance = None
            cls._pool = None
