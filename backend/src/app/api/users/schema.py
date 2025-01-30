from app.core.base_schema import CamelModel


class User(CamelModel):
    id: int
    email: str
    full_name: str


class UserCreate(CamelModel):
    email: str
    full_name: str
    password: str


class UserCreateRes(CamelModel):
    email: str
    full_name: str


class UserUpdate(CamelModel):
    email: str
    full_name: str


class UserUpdateRes(CamelModel):
    email: str
    full_name: str


class UserDelete(CamelModel):
    id: int
