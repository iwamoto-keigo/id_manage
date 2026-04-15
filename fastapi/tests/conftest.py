from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.keycloak_client import get_kc_admin
from app.main import app


@pytest.fixture
def mock_kc() -> MagicMock:
    """A MagicMock standing in for the KeycloakAdmin client."""
    return MagicMock()


@pytest.fixture
def client(mock_kc: MagicMock):
    """FastAPI TestClient with the Keycloak dependency overridden."""
    app.dependency_overrides[get_kc_admin] = lambda: mock_kc
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
