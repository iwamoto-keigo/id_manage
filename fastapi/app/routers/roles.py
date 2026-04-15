from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from keycloak import KeycloakAdmin
from keycloak.exceptions import KeycloakError

from ..keycloak_client import get_kc_admin
from ..schemas import MessageResponse, RoleAssign, RoleResponse

router = APIRouter(prefix="/api", tags=["roles"])


def _handle_kc_error(exc: KeycloakError) -> HTTPException:
    upstream_status = getattr(exc, "response_code", None) or 500
    return HTTPException(status_code=upstream_status, detail=str(exc))


@router.get("/roles", response_model=list[RoleResponse])
def list_roles(kc: KeycloakAdmin = Depends(get_kc_admin)) -> list[dict[str, Any]]:
    try:
        return kc.get_realm_roles()
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc


@router.get("/users/{user_id}/roles", response_model=list[RoleResponse])
def list_user_roles(
    user_id: str,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> list[dict[str, Any]]:
    try:
        return kc.get_realm_roles_of_user(user_id=user_id)
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc


@router.post(
    "/users/{user_id}/roles",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_role(
    user_id: str,
    payload: RoleAssign,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> MessageResponse:
    try:
        role = kc.get_realm_role(payload.role_name)
        kc.assign_realm_roles(user_id=user_id, roles=[role])
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc
    return MessageResponse(
        message=f"Role '{payload.role_name}' assigned to user {user_id}"
    )


@router.delete("/users/{user_id}/roles/{role_name}", response_model=MessageResponse)
def revoke_role(
    user_id: str,
    role_name: str,
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> MessageResponse:
    try:
        role = kc.get_realm_role(role_name)
        kc.delete_realm_roles_of_user(user_id=user_id, roles=[role])
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc
    return MessageResponse(message=f"Role '{role_name}' revoked from user {user_id}")
