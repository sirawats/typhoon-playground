import base64
import secrets
from datetime import datetime, timedelta, timezone

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from fastapi import HTTPException
from jose import JWTError, jwt

from ..config import settings

ITERATIONS = 100000  # High iteration count for security


def hash_password(password: str) -> tuple[str, str]:
    """
    Hash a password using PBKDF2 with a random salt.
    Returns (hash, salt)
    """
    salt = secrets.token_hex(16)

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=bytes.fromhex(salt),
        iterations=ITERATIONS,
    )

    password_hash = base64.b64encode(kdf.derive(password.encode())).decode()
    return password_hash, salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verify a password against a stored hash and salt"""
    try:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=bytes.fromhex(salt),
            iterations=ITERATIONS,
        )

        password_hash = base64.b64encode(kdf.derive(password.encode())).decode()
        return secrets.compare_digest(password_hash, stored_hash)
    except Exception:
        return False


# JWT functions remain the same
ACCESS_TOKEN_EXPIRE_MINUTES = 120
ALGORITHM = "HS256"


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": True, "verify_aud": True})
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
