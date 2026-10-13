import pytest
from fastapi.testclient import TestClient
from delivery_rest.app import app, check_order_eligible
from delivery_rest.store import store

@pytest.fixture(autouse=True)
def clean_store(monkeypatch):
    store.reset()
    monkeypatch.setattr("delivery_rest.app.check_order_eligible", lambda order_id: (True, None, ""))
    yield
    store.reset()

@pytest.fixture
def client():
    return TestClient(app)

def payload(order_id="1042"):
    return {"orderId": order_id, "deliveryAddress": "Village Rampur, India", "packageDetails": "One farm-produce order"}

def test_create_returns_201_location_header(client):
    response = client.post("/deliveries", json=payload(), headers={"Idempotency-Key": "order-1042-create"})
    assert response.status_code == 201
    assert response.headers["location"] == f"/deliveries/{response.json()['deliveryId']}"
    assert response.json()["orderId"] == "1042"
    assert "idempotency_key" not in response.json()

def test_idempotent_repeat_returns_original_without_second_record(client, monkeypatch):
    calls = {"count": 0}
    def eligible(order_id):
        calls["count"] += 1
        return True, None, ""
    monkeypatch.setattr("delivery_rest.app.check_order_eligible", eligible)
    headers = {"Idempotency-Key": "repeat-1042"}
    first = client.post("/deliveries", json=payload(), headers=headers)
    second = client.post("/deliveries", json=payload(), headers=headers)
    assert first.status_code == second.status_code == 201
    assert first.json()["deliveryId"] == second.json()["deliveryId"]
    assert second.headers.get("idempotency-replayed") == "true"
    assert calls["count"] == 1
    assert client.get("/deliveries").json()["count"] == 1

def test_malformed_body_has_common_problem_shape(client):
    response = client.post("/deliveries", content="{bad json", headers={"Content-Type": "application/json", "Idempotency-Key": "bad-body"})
    assert response.status_code == 400
    assert {"type", "title", "status", "detail"}.issubset(response.json())

def test_unknown_delivery_returns_404(client):
    response = client.get("/deliveries/no-such-delivery")
    assert response.status_code == 404
    assert response.json()["status"] == 404
    assert response.json()["code"] == "DELIVERY_NOT_FOUND"

def test_terminal_delivery_tracking_conflict(client):
    created = client.post("/deliveries", json=payload(), headers={"Idempotency-Key": "terminal"})
    delivery_id = created.json()["deliveryId"]
    moved = client.post(f"/deliveries/{delivery_id}/tracking-events", json={"description": "Delivered to buyer", "status": "DELIVERED"})
    assert moved.status_code == 201
    conflict = client.post(f"/deliveries/{delivery_id}/tracking-events", json={"description": "Attempt another update"})
    assert conflict.status_code == 409
    assert conflict.json()["code"] == "INVALID_DELIVERY_STATE"

def test_same_idempotency_key_with_different_body_is_409(client):
    headers = {"Idempotency-Key": "key-conflict"}
    assert client.post("/deliveries", json=payload("100"), headers=headers).status_code == 201
    response = client.post("/deliveries", json=payload("101"), headers=headers)
    assert response.status_code == 409
    assert response.json()["code"] == "IDEMPOTENCY_CONFLICT"

def test_dependency_4xx_is_not_retried(monkeypatch):
    class FakeResponse:
        status_code = 422
        def json(self): return {"eligible": False}
    calls = {"count": 0}
    def fake_get(*args, **kwargs):
        calls["count"] += 1
        return FakeResponse()
    monkeypatch.setenv("ORDERS_SERVICE_URL", "http://orders.test")
    monkeypatch.setattr("delivery_rest.app.requests.get", fake_get)
    ok, status, detail = check_order_eligible("1042")
    assert not ok and status == 422
    assert calls["count"] == 1
