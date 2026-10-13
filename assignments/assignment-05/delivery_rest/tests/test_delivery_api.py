import pytest
from fastapi.testclient import TestClient
from delivery_rest.app import app, check_order_eligible
from delivery_rest.store import store

AUTH = {"Authorization": "Bearer test-token"}
@pytest.fixture(autouse=True)
def clean_store(monkeypatch):
    store.reset()
    monkeypatch.setattr("delivery_rest.app.check_order_eligible", lambda order_id: (True, None, ""))
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "120")
    yield
    store.reset()
@pytest.fixture
def client(): return TestClient(app)
def payload(order_id="1042"):
    return {"orderId": order_id, "deliveryAddress": "Village Rampur, India", "packageDetails": "One farm-produce order"}
def create(client, order_id="1042", key="key"):
    return client.post("/deliveries", json=payload(order_id), headers={**AUTH, "Idempotency-Key": key})

def test_create_returns_201_location_header(client):
    response = create(client)
    assert response.status_code == 201
    assert response.headers["location"] == f"/deliveries/{response.json()['deliveryId']}"
    assert response.headers["content-type"].startswith("application/json")
    assert response.json()["orderId"] == "1042"
    assert "idempotency_key" not in response.json()

def test_idempotent_repeat_returns_original_without_second_record(client, monkeypatch):
    calls = {"count": 0}
    def eligible(order_id): calls["count"] += 1; return True, None, ""
    monkeypatch.setattr("delivery_rest.app.check_order_eligible", eligible)
    headers = {**AUTH, "Idempotency-Key": "repeat-1042"}
    first = client.post("/deliveries", json=payload(), headers=headers)
    second = client.post("/deliveries", json=payload(), headers=headers)
    assert first.status_code == second.status_code == 201
    assert first.json()["deliveryId"] == second.json()["deliveryId"]
    assert second.headers.get("idempotency-replayed") == "true"
    assert calls["count"] == 1 and client.get("/deliveries", headers=AUTH).json()["count"] == 1

def test_malformed_body_has_common_problem_shape(client):
    response = client.post("/deliveries", content="{bad json", headers={**AUTH, "Content-Type": "application/json", "Idempotency-Key": "bad-body"})
    assert response.status_code == 400
    assert {"type", "title", "status", "detail"}.issubset(response.json())

def test_unknown_delivery_returns_404(client):
    response = client.get("/deliveries/no-such-delivery", headers=AUTH)
    assert response.status_code == 404 and response.json()["code"] == "DELIVERY_NOT_FOUND"

def test_terminal_delivery_tracking_conflict(client):
    delivery_id = create(client, key="terminal").json()["deliveryId"]
    moved = client.post(f"/deliveries/{delivery_id}/tracking-events", json={"description": "Delivered", "status": "DELIVERED"}, headers=AUTH)
    assert moved.status_code == 201
    conflict = client.post(f"/deliveries/{delivery_id}/tracking-events", json={"description": "Attempt another update"}, headers=AUTH)
    assert conflict.status_code == 409

def test_same_idempotency_key_with_different_body_is_409(client):
    headers = {**AUTH, "Idempotency-Key": "key-conflict"}
    assert client.post("/deliveries", json=payload("100"), headers=headers).status_code == 201
    response = client.post("/deliveries", json=payload("101"), headers=headers)
    assert response.status_code == 409

def test_dependency_4xx_is_not_retried(monkeypatch):
    class FakeResponse:
        status_code = 422
        def json(self): return {"eligible": False}
    calls = {"count": 0}
    def fake_get(*args, **kwargs): calls["count"] += 1; return FakeResponse()
    monkeypatch.setenv("ORDERS_SERVICE_URL", "http://orders.test")
    monkeypatch.setattr("delivery_rest.app.requests.get", fake_get)
    ok, status, detail = check_order_eligible("1042")
    assert not ok and status == 422 and calls["count"] == 1

def test_auth_missing_or_empty_token_is_401(client):
    assert client.get("/deliveries").status_code == 401
    assert client.get("/deliveries", headers={"Authorization": "Bearer "}).status_code == 401

def test_accept_unsupported_returns_406(client):
    response = client.get("/deliveries", headers={**AUTH, "Accept": "text/html"})
    assert response.status_code == 406

def test_single_get_etag_and_conditional_304(client):
    delivery_id = create(client, key="etag").json()["deliveryId"]
    first = client.get(f"/deliveries/{delivery_id}", headers=AUTH)
    assert first.status_code == 200 and first.headers.get("etag")
    second = client.get(f"/deliveries/{delivery_id}", headers={**AUTH, "If-None-Match": first.headers["etag"]})
    assert second.status_code == 304 and not second.content

def test_if_match_stale_write_returns_412_and_fresh_write_updates_etag(client):
    delivery_id = create(client, key="put").json()["deliveryId"]
    read = client.get(f"/deliveries/{delivery_id}", headers=AUTH)
    old_etag = read.headers["etag"]
    updated = client.put(f"/deliveries/{delivery_id}", json={"deliveryAddress": "New address", "packageDetails": "Updated"}, headers={**AUTH, "If-Match": old_etag})
    assert updated.status_code == 200 and updated.headers["etag"] != old_etag
    stale = client.put(f"/deliveries/{delivery_id}", json={"deliveryAddress": "Lost update"}, headers={**AUTH, "If-Match": old_etag})
    assert stale.status_code == 412

def test_put_missing_if_match_returns_400(client):
    delivery_id = create(client, key="missing-if-match").json()["deliveryId"]
    assert client.put(f"/deliveries/{delivery_id}", json={"deliveryAddress": "New"}, headers=AUTH).status_code == 400

def test_options_allow_and_cors_preflight(client):
    response = client.options("/deliveries", headers={"Origin": "https://campus.example", "Access-Control-Request-Method": "POST"})
    assert response.status_code == 204
    assert "POST" in response.headers["allow"]
    assert response.headers["access-control-allow-origin"] == "https://campus.example"

def test_list_supports_filter_sort_and_pagination(client):
    create(client, "1", "page-1"); create(client, "2", "page-2")
    response = client.get("/deliveries?sort=orderId&order=desc&offset=0&limit=1", headers=AUTH)
    assert response.status_code == 200 and response.json()["limit"] == 1
    assert len(response.json()["items"]) == 1 and response.json()["items"][0]["orderId"] == "2"

def test_delete_returns_204(client):
    delivery_id = create(client, key="delete").json()["deliveryId"]
    response = client.delete(f"/deliveries/{delivery_id}", headers=AUTH)
    assert response.status_code == 204 and not response.content
    assert client.get(f"/deliveries/{delivery_id}", headers=AUTH).status_code == 404

def test_rate_limit_is_per_client_and_has_retry_after(client, monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "1")
    # Clear middleware's module-level rate state so this test is deterministic.
    from delivery_rest import app as app_module
    app_module._rate_state.clear()
    assert client.get("/deliveries", headers=AUTH).status_code == 200
    limited = client.get("/deliveries", headers=AUTH)
    assert limited.status_code == 429 and limited.headers.get("retry-after")


def test_patch_changes_only_supplied_field_and_refreshes_etag(client):
    delivery_id = create(client, key="patch").json()["deliveryId"]
    read = client.get(f"/deliveries/{delivery_id}", headers=AUTH)
    patched = client.patch(f"/deliveries/{delivery_id}", json={"packageDetails": "Fragile"}, headers={**AUTH, "If-Match": read.headers["etag"]})
    assert patched.status_code == 200
    assert patched.json()["deliveryAddress"] == "Village Rampur, India"
    assert patched.json()["packageDetails"] == "Fragile"
    assert patched.headers["etag"] != read.headers["etag"]


def test_method_override_put_is_documented_fallback(client):
    delivery_id = create(client, key="override").json()["deliveryId"]
    read = client.get(f"/deliveries/{delivery_id}", headers=AUTH)
    response = client.post(f"/deliveries/{delivery_id}", json={"deliveryAddress": "Override address"}, headers={**AUTH, "If-Match": read.headers["etag"], "X-HTTP-Method-Override": "PUT"})
    assert response.status_code == 200
    assert response.json()["deliveryAddress"] == "Override address"
