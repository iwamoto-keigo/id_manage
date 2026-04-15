def test_list_events_default_query(client, mock_kc):
    mock_kc.get_events.return_value = [{"type": "LOGIN", "userId": "u1"}]

    r = client.get("/api/events")

    assert r.status_code == 200
    assert r.json() == [{"type": "LOGIN", "userId": "u1"}]
    query = mock_kc.get_events.call_args.kwargs["query"]
    assert query == {"first": 0, "max": 100}


def test_list_events_filtered(client, mock_kc):
    mock_kc.get_events.return_value = []

    r = client.get(
        "/api/events?user=u1&type=LOGIN&client=demo-app"
        "&dateFrom=2026-04-01&dateTo=2026-04-30&first=20&max=50"
    )

    assert r.status_code == 200
    query = mock_kc.get_events.call_args.kwargs["query"]
    assert query == {
        "first": 20,
        "max": 50,
        "user": "u1",
        "type": "LOGIN",
        "client": "demo-app",
        "dateFrom": "2026-04-01",
        "dateTo": "2026-04-30",
    }
