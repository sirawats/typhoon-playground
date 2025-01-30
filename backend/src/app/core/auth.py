from fastapi.security.utils import get_authorization_scheme_param
from datetime import datetime
from jose import JWTError

from app.core.cache import TokenCache
from app.core.security import verify_token
from app.core.exceptions import AuthenticationError, InvalidTokenError, NoAuthHeaderError


class AuthHandler:
    def __init__(self, token_cache: TokenCache):
        self.token_cache = token_cache

    async def authenticate(self, authorization: str | None) -> int:
        if not authorization:
            raise NoAuthHeaderError()

        scheme, token = get_authorization_scheme_param(authorization)
        if scheme.lower() != "bearer":
            raise InvalidTokenError()

        try:
            # Try cache first
            cached = await self.token_cache.get(token)
            if cached:
                return cached["user_id"]

            # Verify token if not cached
            payload = verify_token(token)
            user_id = int(payload.get("sub"))  # type: ignore
            if not user_id:
                raise InvalidTokenError()

            # Cache valid token
            exp = payload.get("exp", datetime.now().timestamp() + 3600)
            ttl = int(exp - datetime.now().timestamp())
            if ttl > 0:
                await self.token_cache.set(token, user_id, ttl)

            return user_id

        except (JWTError, ValueError) as e:
            # Log the original error for debugging if needed
            # logger.error(f"Token validation failed: {str(e)}")

            # Always return a consistent InvalidTokenError
            raise InvalidTokenError()
        except Exception as e:
            # For any other unexpected errors, still return 401 instead of 500
            raise AuthenticationError()
