from sqlalchemy import select
from app.api.users.schema import User, UserCreate, UserCreateRes, UserUpdate, UserUpdateRes
from app.core.security import hash_password
import app.db.orm as orm
from app.core.base_repository import BaseRepository
from app.db.session import get_async_session
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


class UserRepo:
    def __init__(
        self,
        session: AsyncSession = Depends(get_async_session),
    ) -> None:
        self.user_account_repo = BaseRepository[orm.UserAccount](orm.UserAccount, session)
        self.user_profile_repo = BaseRepository[orm.UserProfile](orm.UserProfile, session)

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        user_accounts = await self.user_account_repo.get_all(skip, limit)
        result = [
            User(id=user_account.id, email=user_account.email, full_name=str(user_account.profile.full_name))
            for user_account in user_accounts
        ]

        return result

    async def get_user_by_id(self, id: int) -> User:
        user_account = await self.user_account_repo.get_by_id(id)

        if not user_account:
            raise HTTPException(status_code=404, detail="User not found")

        return User(id=user_account.id, email=user_account.email, full_name=str(user_account.profile.full_name))

    async def get_user_by_email(self, email: str) -> User:
        result = await self.user_account_repo.session.execute(
            select(orm.UserAccount).where(orm.UserAccount.email == email).options(selectinload(orm.UserAccount.profile))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    async def create_user(self, user_create: UserCreate) -> UserCreateRes:
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

        user_account = await self.user_account_repo.create(user_model, ["profile"])
        return UserCreateRes(email=user_account.email, full_name=str(user_account.profile.full_name))

    async def update_user(self, id: int, user_update: UserUpdate) -> UserUpdateRes:
        user_account = await self.user_account_repo.update(id, user_update.model_dump())
        return UserUpdateRes.model_validate(user_account)

    async def delete_user(self, id: int) -> None:
        return await self.user_account_repo.delete(id)
