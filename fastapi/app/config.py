from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings loaded from environment variables (prefix: KC_)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="KC_",
        extra="ignore",
    )

    server_url: str = Field(
        default="http://keycloak:8080/",
        description="Keycloak server base URL (must end with /)",
    )
    admin_username: str = Field(default="admin")
    admin_password: str = Field(default="admin")
    realm: str = Field(
        default="demo",
        description="Target realm that the API operates on",
    )
    user_realm: str = Field(
        default="master",
        description="Realm where the admin user lives (almost always 'master')",
    )
    admin_client_id: str = Field(default="admin-cli")
    verify_ssl: bool = Field(default=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
