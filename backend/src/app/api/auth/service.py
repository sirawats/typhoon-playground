from datetime import datetime

from fastapi import Depends, HTTPException

from app.api.auth.schema import Token, UserLoginReq, UserLoginRes
from app.api.users.repo import UserRepo
from app.api.users.schema import UserCreate, UserCreateRes
from app.core.security import create_access_token, verify_password


class AuthService:
    def __init__(self, user_repo: UserRepo = Depends()):
        self.user_repo = user_repo

    async def register(self, user_create: UserCreate) -> UserCreateRes:
        user_account = await self.user_repo.create(user_create)
        return UserCreateRes(email=user_account.email, full_name=str(user_account.profile.full_name))

    async def login(self, login_req: UserLoginReq) -> Token:
        try:
            user = await self.user_repo.get_user_by_email(login_req.email)
        except HTTPException as e:
            if e.status_code == 404:
                raise HTTPException(status_code=401, detail="Invalid credentials1") from e
            raise

        if not verify_password(login_req.password, user.hashed_password, user.password_salt):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Update last login
        user.last_login_at = datetime.now()
        await self.user_repo.update(user.id, {"last_login_at": user.last_login_at})

        # Create access token
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_data)

        return Token(
            access_token=access_token, user=UserLoginRes(id=user.id, email=user.email, full_name=str(user.profile.full_name))
        )
