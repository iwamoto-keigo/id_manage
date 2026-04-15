from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from keycloak import KeycloakAdmin
from keycloak.exceptions import KeycloakError

from ..keycloak_client import get_kc_admin

router = APIRouter(prefix="/api/events", tags=["events"])


def _handle_kc_error(exc: KeycloakError) -> HTTPException:
    upstream_status = getattr(exc, "response_code", None) or 500
    return HTTPException(status_code=upstream_status, detail=str(exc))


@router.get("")
def list_events(
    user_id: str | None = Query(default=None, alias="user", description="Filter by user ID"),
    event_type: str | None = Query(
        default=None,
        alias="type",
        description="Event type, e.g. LOGIN, LOGIN_ERROR, LOGOUT",
    ),
    client: str | None = Query(default=None, description="Filter by clientId string"),
    date_from: str | None = Query(
        default=None, alias="dateFrom", description="ISO date, e.g. 2026-04-01"
    ),
    date_to: str | None = Query(
        default=None, alias="dateTo", description="ISO date, e.g. 2026-04-30"
    ),
    first: int = Query(default=0, ge=0),
    max_results: int = Query(default=100, ge=1, le=1000, alias="max"),
    kc: KeycloakAdmin = Depends(get_kc_admin),
) -> list[dict[str, Any]]:
    """List login-related events.

    By default Keycloak only stores authentication events when event logging
    is enabled for the realm (Realm settings → Events → User events settings).
    """
    query: dict[str, Any] = {"first": first, "max": max_results}
    if user_id is not None:
        query["user"] = user_id
    if event_type is not None:
        query["type"] = event_type
    if client is not None:
        query["client"] = client
    if date_from is not None:
        query["dateFrom"] = date_from
    if date_to is not None:
        query["dateTo"] = date_to

    try:
        return kc.get_events(query=query)
    except KeycloakError as exc:
        raise _handle_kc_error(exc) from exc
