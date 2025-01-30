from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = Field(validate_default=True)

    # Database connection
    DB_USERNAME: str = Field(validate_default=True)
    DB_PASSWORD: str = Field(validate_default=True)
    DB_HOST: str = Field(validate_default=True)
    DB_PORT: str = Field("5432", validate_default=True)
    DB_DATABASE: str = Field(validate_default=True)

    # Redis connection
    REDIS_HOST: str = Field(validate_default=True)
    REDIS_PORT: str = Field(validate_default=True)
    REDIS_POOL_SIZE: int = Field(10)

    # Database pool
    DB_POOL_SIZE: int = Field(10)
    DB_MAX_OVERFLOW: int = Field(5)
    DB_POOL_TIMEOUT: int = Field(30)
    DB_POOL_RECYCLE: int = Field(1800)

    # Typhoon API
    TYPHOON_API_URL: str = Field(validate_default=True)
    TYPHOON_API_KEY: str = Field(validate_default=True)

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()  # type: ignore
