from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from keycloak import KeycloakAdmin
from keycloak.exceptions import KeycloakError

from ..keycloak_client import get_kc_admin

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _handle_kc_error(exc: KeycloakError) -> HTTPException:
    upstream_status = getattr(exc, "response_code", None) or 500
    return HTTPException(status_code=upstream_status, detail=str(exc))


@router.get("")
def list_sessions(
    user_id: str | None = Query(default=None, description="Filter by user ID"),
    client_id: str | None = Query(
        default=None, description="Filter by client UUID (not clientId string)"
    ),
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> list[dict[str, Any]]:
    """List active user sessions.

    - With `user_id`: sessions for that user.
    - With `client_id`: sessions on that specific client.
    - With neither: aggregate active sessions across all clients in the realm.
    """
    try:
        if user_id is not None:
            return kc.get_sessions(user_id=user_id)

        if client_id is not None:
            return kc.get_client_all_sessions(client_id=client_id)

        all_sessions: list[dict[str, Any]] = []
        for client in kc.get_clients():
            cid = client.get("id")
            if not cid:
                continue
            try:
                sessions = kc.get_client_all_sessions(client_id=cid)
            except KeycloakError:
                # Some built-in clients don't expose session endpoints; skip.
                continue
            for s in sessions:
                s["clientId"] = client.get("clientId")
            all_sessions.extend(sessions)
        return all_sessions
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc
