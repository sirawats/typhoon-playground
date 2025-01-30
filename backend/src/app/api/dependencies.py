from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.api.users.repo import UserRepo
from app.core.security import verify_token
from app.db.orm import UserAccount

# Specify token URL that matches our auth endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], user_repo: Annotated[UserRepo, Depends()]
) -> UserAccount:
    """
    Validate access token and return current user.
    Raises 401 if token is invalid or user not found.
    Raises 403 if user account is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Verify token and extract user_id
        payload = verify_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    try:
        # Get user from database
        user = await user_repo.get_by_id(int(user_id))
        if user is None:
            raise credentials_exception

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        return user

    except ValueError:  # Invalid user_id format
        raise credentials_exception
