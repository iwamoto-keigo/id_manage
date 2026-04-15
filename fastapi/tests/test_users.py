from unittest.mock import ANY


def _user(uid: str = "u1", **overrides):
    base = {
        "id": uid,
        "username": "alice",
        "email": "alice@example.com",
        "enabled": True,
        "emailVerified": False,
        "firstName": "Alice",
        "lastName": "Doe",
    }
    base.update(overrides)
    return base


def test_list_users(client, mock_kc):
    mock_kc.get_users.return_value = [_user("u1"), _user("u2", username="bob")]

    r = client.get("/api/users")

    assert r.status_code == 200
    assert len(r.json()) == 2
    mock_kc.get_users.assert_called_once()
    query = mock_kc.get_users.call_args.kwargs["query"]
    assert query["first"] == 0
    assert query["max"] == 100
    assert "search" not in query


def test_list_users_with_search(client, mock_kc):
    mock_kc.get_users.return_value = []

    r = client.get("/api/users?search=ali&first=10&max=50")

    assert r.status_code == 200
    query = mock_kc.get_users.call_args.kwargs["query"]
    assert query == {"first": 10, "max": 50, "search": "ali"}


def test_create_user(client, mock_kc):
    mock_kc.create_user.return_value = "u1"
    mock_kc.get_user.return_value = _user("u1")

    r = client.post(
        "/api/users",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "s3cret",
            "enabled": True,
            "first_name": "Alice",
            "last_name": "Doe",
        },
    )

    assert r.status_code == 201
    assert r.json()["id"] == "u1"

    mock_kc.create_user.assert_called_once()
    payload = mock_kc.create_user.call_args.args[0]
    assert payload["username"] == "alice"
    assert payload["email"] == "alice@example.com"
    assert payload["enabled"] is True
    assert payload["firstName"] == "Alice"
    assert payload["credentials"] == [
        {"type": "password", "value": "s3cret", "temporary": False}
    ]
    assert mock_kc.create_user.call_args.kwargs == {"exist_ok": False}


def test_create_user_rejects_invalid_email(client, mock_kc):
    r = client.post(
        "/api/users",
        json={
            "username": "alice",
            "email": "not-an-email",
            "password": "s3cret",
            "enabled": True,
        },
    )
    assert r.status_code == 422
    mock_kc.create_user.assert_not_called()


def test_get_user(client, mock_kc):
    mock_kc.get_user.return_value = _user("u1")

    r = client.get("/api/users/u1")

    assert r.status_code == 200
    assert r.json()["id"] == "u1"
    mock_kc.get_user.assert_called_once_with("u1")


def test_update_user(client, mock_kc):
    mock_kc.get_user.return_value = _user("u1", email="new@example.com")

    r = client.put(
        "/api/users/u1",
        json={"email": "new@example.com", "first_name": "Al"},
    )

    assert r.status_code == 200
    assert r.json()["email"] == "new@example.com"
    mock_kc.update_user.assert_called_once_with(
        "u1", {"email": "new@example.com", "firstName": "Al"}
    )


def test_update_user_empty_body_is_400(client, mock_kc):
    r = client.put("/api/users/u1", json={})
    assert r.status_code == 400
    mock_kc.update_user.assert_not_called()


def test_delete_user_disables(client, mock_kc):
    r = client.delete("/api/users/u1")

    assert r.status_code == 200
    assert "disabled" in r.json()["message"]
    mock_kc.update_user.assert_called_once_with("u1", {"enabled": False})


def test_toggle_user_enabled_to_disabled(client, mock_kc):
    mock_kc.get_user.side_effect = [_user("u1", enabled=True), _user("u1", enabled=False)]

    r = client.put("/api/users/u1/toggle")

    assert r.status_code == 200
    assert r.json()["enabled"] is False
    mock_kc.update_user.assert_called_once_with("u1", {"enabled": False})


def test_toggle_user_disabled_to_enabled(client, mock_kc):
    mock_kc.get_user.side_effect = [_user("u1", enabled=False), _user("u1", enabled=True)]

    r = client.put("/api/users/u1/toggle")

    assert r.status_code == 200
    assert r.json()["enabled"] is True
    mock_kc.update_user.assert_called_once_with("u1", {"enabled": True})
