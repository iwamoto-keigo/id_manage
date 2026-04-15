def _role(name: str = "user") -> dict:
    return {
        "id": f"role-{name}",
        "name": name,
        "description": f"{name} role",
        "composite": False,
        "clientRole": False,
    }


def test_list_roles(client, mock_kc):
    mock_kc.get_realm_roles.return_value = [_role("user"), _role("admin")]

    r = client.get("/api/roles")

    assert r.status_code == 200
    names = [role["name"] for role in r.json()]
    assert set(names) == {"user", "admin"}
    mock_kc.get_realm_roles.assert_called_once()


def test_list_user_roles(client, mock_kc):
    mock_kc.get_realm_roles_of_user.return_value = [_role("user")]

    r = client.get("/api/users/u1/roles")

    assert r.status_code == 200
    assert [role["name"] for role in r.json()] == ["user"]
    mock_kc.get_realm_roles_of_user.assert_called_once_with(user_id="u1")


def test_assign_role(client, mock_kc):
    role = _role("admin")
    mock_kc.get_realm_role.return_value = role

    r = client.post("/api/users/u1/roles", json={"role_name": "admin"})

    assert r.status_code == 201
    assert "admin" in r.json()["message"]
    mock_kc.get_realm_role.assert_called_once_with("admin")
    mock_kc.assign_realm_roles.assert_called_once_with(user_id="u1", roles=[role])


def test_revoke_role(client, mock_kc):
    role = _role("admin")
    mock_kc.get_realm_role.return_value = role

    r = client.delete("/api/users/u1/roles/admin")

    assert r.status_code == 200
    assert "revoked" in r.json()["message"]
    mock_kc.get_realm_role.assert_called_once_with("admin")
    mock_kc.delete_realm_roles_of_user.assert_called_once_with(user_id="u1", roles=[role])


def test_assign_role_requires_role_name(client, mock_kc):
    r = client.post("/api/users/u1/roles", json={})
    assert r.status_code == 422
    mock_kc.assign_realm_roles.assert_not_called()
