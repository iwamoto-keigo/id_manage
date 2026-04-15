from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from keycloak import KeycloakAdmin
from keycloak.exceptions import KeycloakError

from ..keycloak_client import get_kc_admin
from ..schemas import MessageResponse, UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


def _handle_kc_error(exc: KeycloakError) -> HTTPException:
    """Map a KeycloakError to an HTTPException preserving upstream status if present."""
    upstream_status = getattr(exc, "response_code", None) or 500
    return HTTPException(status_code=upstream_status, detail=str(exc))


@router.get("", response_model=list[UserResponse])
def list_users(
    search: str | None = Query(default=None, description="Full-text search on username/email"),
    first: int = Query(default=0, ge=0),
    max_results: int = Query(default=100, ge=1, le=1000, alias="max"),
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> list[dict[str, Any]]:
    query: dict[str, Any] = {"first": first, "max": max_results}
    if search:
        query["search"] = search
    try:
        return kc.get_users(query=query)
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> dict[str, Any]:
    kc_payload: dict[str, Any] = {
        "username": payload.username,
        "email": payload.email,
        "enabled": payload.enabled,
        "emailVerified": False,
        "credentials": [
            {"type": "password", "value": payload.password, "temporary": False}
        ],
    }
    if payload.first_name is not None:
        kc_payload["firstName"] = payload.first_name
    if payload.last_name is not None:
        kc_payload["lastName"] = payload.last_name

    try:
        user_id = kc.create_user(kc_payload, exist_ok=False)
        return kc.get_user(user_id)
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> dict[str, Any]:
    try:
        return kc.get_user(user_id)
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> dict[str, Any]:
    kc_payload: dict[str, Any] = {}
    if payload.email is not None:
        kc_payload["email"] = payload.email
    if payload.first_name is not None:
        kc_payload["firstName"] = payload.first_name
    if payload.last_name is not None:
        kc_payload["lastName"] = payload.last_name
    if payload.enabled is not None:
        kc_payload["enabled"] = payload.enabled

    if not kc_payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided",
        )

    try:
        kc.update_user(user_id, kc_payload)
        return kc.get_user(user_id)
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc


@router.delete("/{user_id}", response_model=MessageResponse)
def disable_user(
    user_id: str,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> MessageResponse:
    """Soft-delete: disable the user (does not remove the record)."""
    try:
        kc.update_user(user_id, {"enabled": False})
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc
    return MessageResponse(message=f"User {user_id} disabled")


@router.put("/{user_id}/toggle", response_model=UserResponse)
def toggle_user(
    user_id: str,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> dict[str, Any]:
    try:
        user = kc.get_user(user_id)
        new_enabled = not bool(user.get("enabled", True))
        kc.update_user(user_id, {"enabled": new_enabled})
        return kc.get_user(user_id)
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc
