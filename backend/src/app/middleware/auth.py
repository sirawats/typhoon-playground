from typing import Sequence
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.auth import AuthHandler
from app.core.cache import TokenCache
from app.core.exceptions import AuthenticationError


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, public_paths: Sequence[str]):
        super().__init__(app)
        self.public_paths = set(public_paths)
        self.auth_handler = AuthHandler(TokenCache())

    async def dispatch(self, request: Request, call_next):
        try:
            if request.method == "OPTIONS" or request.url.path in self.public_paths:
                return await call_next(request)

            user_id = await self.auth_handler.authenticate(request.headers.get("Authorization"))
            request.state.user_id = user_id

            return await call_next(request)
        except AuthenticationError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": str(e)},
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            raise e
