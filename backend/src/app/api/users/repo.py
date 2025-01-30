from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import app.db.orm as orm
from app.api.users.schema import UserCreate
from app.core.base_repository import BaseRepository
from app.core.security import hash_password
from app.db.session import get_async_session


class UserRepo(BaseRepository[orm.UserAccount]):
    def __init__(
        self,
        session: AsyncSession = Depends(get_async_session),
    ) -> None:
        super().__init__(orm.UserAccount, session)
        self.session = session
        self.user_profile_repo = BaseRepository[orm.UserProfile](orm.UserProfile, session)

    async def get_user_by_email(self, email: str) -> orm.UserAccount:
        result = await self.session.execute(
            select(orm.UserAccount).where(orm.UserAccount.email == email).options(selectinload(orm.UserAccount.profile))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    async def create(self, user_create: UserCreate) -> orm.UserAccount:
        hashed_password, salt = hash_password(user_create.password)

        user_model = orm.UserAccount(
            email=user_create.email,
            hashed_password=hashed_password,
            password_salt=salt,
            password_iterations=100000,
            is_active=True,
            is_superuser=False,
            profile=orm.UserProfile(full_name=user_create.full_name),
        )

        user_account = await super().create(user_model, ["profile"])
        return user_account
