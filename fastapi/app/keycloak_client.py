from fastapi import HTTPException, status
from keycloak import KeycloakAdmin
from keycloak.exceptions import KeycloakError

from .config import get_settings


def get_kc_admin() -> KeycloakAdmin:
    """FastAPI dependency: build a KeycloakAdmin client per request.

    A fresh instance is created each time to avoid issues with stale
    tokens in a long-running process. python-keycloak caches the token
    internally for the lifetime of the instance.
    """
    settings = get_settings()
    try:
        return KeycloakAdmin(
            server_url=settings.server_url,
            username=settings.admin_username,
            password=settings.admin_password,
            realm_name=settings.realm,
            user_realm_name=settings.user_realm,
            client_id=settings.admin_client_id,
            verify=settings.verify_ssl,
        )
    except KeycloakError as exc:  # pragma: no cover - network failure path
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to Keycloak: {exc}",
        ) from exc
