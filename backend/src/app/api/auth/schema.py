from app.core.base_schema import CamelModel


class UserLoginReq(CamelModel):
    email: str
    password: str


class UserLoginRes(CamelModel):
    id: int
    email: str
    full_name: str

class Token(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: UserLoginRes  # Nest user info in token response