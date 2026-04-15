from typing import Any

from pydantic import BaseModel, EmailStr, Field


# ---------- Users ----------


class UserCreate(BaseModel):
    username: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=1)
    enabled: bool = True
    first_name: str | None = None
    last_name: str | None = None


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    first_name: str | None = None
    last_name: str | None = None
    enabled: bool | None = None


class UserResponse(BaseModel):
    id: str
    username: str
    email: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    enabled: bool = True
    emailVerified: bool = False

    model_config = {"extra": "allow"}


# ---------- Roles ----------


class RoleResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    composite: bool = False
    clientRole: bool = False

    model_config = {"extra": "allow"}


class RoleAssign(BaseModel):
    role_name: str = Field(min_length=1)


# ---------- Generic ----------


class MessageResponse(BaseModel):
    message: str
    detail: dict[str, Any] | None = None
