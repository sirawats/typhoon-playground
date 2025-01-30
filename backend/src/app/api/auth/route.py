# app/api/auth/route.py
from fastapi import APIRouter, Depends

from app.api.auth.schema import Token, UserLoginReq
from app.api.auth.service import AuthService
from app.api.users.schema import UserCreate, UserCreateRes

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/create-account", response_model=UserCreateRes)
async def register(user_create: UserCreate, auth_service: AuthService = Depends()) -> UserCreateRes:
    return await auth_service.register(user_create)


@router.post("/login", response_model=Token)
async def login(login_req: UserLoginReq, auth_service: AuthService = Depends()) -> Token:
    return await auth_service.login(login_req)
