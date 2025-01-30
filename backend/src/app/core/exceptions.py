from fastapi import HTTPException, status


class AuthenticationError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, headers={"WWW-Authenticate": "Bearer"})


class InvalidTokenError(AuthenticationError):
    def __init__(self):
        super().__init__("Invalid or expired token")


class NoAuthHeaderError(AuthenticationError):
    def __init__(self):
        super().__init__("No authorization header")
