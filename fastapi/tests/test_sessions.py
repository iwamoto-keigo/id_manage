def test_list_sessions_by_user(client, mock_kc):
    mock_kc.get_sessions.return_value = [{"id": "s1", "userId": "u1"}]

    r = client.get("/api/sessions?user_id=u1")

    assert r.status_code == 200
    assert r.json() == [{"id": "s1", "userId": "u1"}]
    mock_kc.get_sessions.assert_called_once_with(user_id="u1")
    mock_kc.get_clients.assert_not_called()


def test_list_sessions_by_client(client, mock_kc):
    mock_kc.get_client_all_sessions.return_value = [{"id": "s1"}]

    r = client.get("/api/sessions?client_id=abc-123")

    assert r.status_code == 200
    mock_kc.get_client_all_sessions.assert_called_once_with(client_id="abc-123")
    mock_kc.get_clients.assert_not_called()


def test_list_sessions_aggregates_across_clients(client, mock_kc):
    mock_kc.get_clients.return_value = [
        {"id": "c1", "clientId": "demo-app"},
        {"id": "c2", "clientId": "account"},
    ]

    def sessions_for(client_id):
        return {
            "c1": [{"id": "s1", "userId": "u1"}],
            "c2": [{"id": "s2", "userId": "u2"}],
        }[client_id]

    mock_kc.get_client_all_sessions.side_effect = lambda client_id: sessions_for(client_id)

    r = client.get("/api/sessions")

    assert r.status_code == 200
    body = r.json()
    assert len(body) == 2
    # Each session is annotated with its clientId string.
    client_ids = {s["clientId"] for s in body}
    assert client_ids == {"demo-app", "account"}
    assert mock_kc.get_client_all_sessions.call_count == 2
