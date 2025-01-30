# app/core/cache.py
import json
from typing import Optional
from app.core.redis import RedisClient


class TokenCache:
    @staticmethod
    async def set(token: str, user_id: int, exp_seconds: int = 3600):
        redis = await RedisClient.get_instance()
        await redis.set(f"token:{token}", json.dumps({"user_id": user_id}), ex=exp_seconds)

    @staticmethod
    async def get(token: str) -> Optional[dict]:
        redis = await RedisClient.get_instance()
        data = await redis.get(f"token:{token}")
        return json.loads(data) if data else None

    @staticmethod
    async def invalidate(token: str):
        redis = await RedisClient.get_instance()
        await redis.delete(f"token:{token}")
