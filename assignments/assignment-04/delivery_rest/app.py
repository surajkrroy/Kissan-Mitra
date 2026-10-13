"""CampusEats/Kissan Mitra Delivery REST service for Assignment 4."""
from __future__ import annotations
import os, random, time
from datetime import datetime
from typing import Any
from urllib.parse import quote
import requests
from fastapi import FastAPI, Request, Query, Header
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import RequestValidationError
from .errors import problem
from .store import store

app = FastAPI(title="Kissan Mitra Delivery API", version="1.0.0", description="Delivery records and shipment tracking. Delivery owns its records; Orders owns order workflow.")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return problem(400, "Malformed request or invalid query parameter.", code="INVALID_INPUT")


def validate(payload: Any, required: dict[str, type], optional: dict[str, type] | None = None) -> tuple[bool, str]:
    """Validate shape/types before any endpoint reads a request field."""
    if not isinstance(payload, dict):
        return False, "Request body must be a JSON object."
    optional = optional or {}
    for name, expected in required.items():
        if name not in payload:
            return False, f"Missing required field: {name}."
        if not isinstance(payload[name], expected) or (expected is str and not payload[name].strip()):
            return False, f"Field {name} must be a non-empty {expected.__name__}."
    allowed = set(required) | set(optional)
    unknown = set(payload) - allowed
    if unknown:
        return False, "Unknown field(s): " + ", ".join(sorted(unknown)) + "."
    for name, expected in optional.items():
        if name in payload and payload[name] is not None and not isinstance(payload[name], expected):
            return False, f"Field {name} must be {expected.__name__} or null."
    return True, ""


async def read_json(request: Request):
    try:
        return await request.json()
    except Exception:
        return None


def orders_service_url() -> str:
    return os.getenv("ORDERS_SERVICE_URL", "").rstrip("/")


def check_order_eligible(order_id: str) -> tuple[bool, int | None, str]:
    """Call Orders API. Retry only transient network/5xx failures; never retry 4xx."""
    base = orders_service_url()
    if not base:
        return False, 503, "ORDERS_SERVICE_URL is not configured."
    url = f"{base}/orders/{quote(order_id, safe='')}/delivery-eligibility"
    max_attempts = max(1, int(os.getenv("OUTBOUND_MAX_ATTEMPTS", "3")))
    timeout = float(os.getenv("OUTBOUND_TIMEOUT_SECONDS", "1.5"))
    for attempt in range(max_attempts):
        try:
            response = requests.get(url, timeout=timeout, headers={"Accept": "application/json"})
            if 400 <= response.status_code < 500:
                if response.status_code == 404:
                    return False, 404, "Order was not found by the Orders service."
                if response.status_code == 409 or response.status_code == 422:
                    return False, 422, "Orders service says this order is not eligible for delivery."
                return False, 502, f"Orders service rejected the eligibility request with HTTP {response.status_code}."
            if response.status_code >= 500:
                if attempt + 1 < max_attempts:
                    time.sleep(min(0.05 * (2 ** attempt) + random.uniform(0, 0.05), 0.5))
                    continue
                return False, 503, "Orders service remained unavailable after safe retries."
            try:
                data = response.json()
            except ValueError:
                return False, 502, "Orders service returned malformed JSON."
            if not isinstance(data, dict) or not isinstance(data.get("eligible"), bool):
                return False, 502, "Orders service returned an invalid eligibility response."
            if not data["eligible"]:
                return False, 422, "Order has not reached the state required for delivery creation."
            return True, None, ""
        except (requests.Timeout, requests.ConnectionError):
            if attempt + 1 < max_attempts:
                time.sleep(min(0.05 * (2 ** attempt) + random.uniform(0, 0.05), 0.5))
                continue
            return False, 503, "Orders service is unreachable; no delivery record was created."
    return False, 503, "Orders service is unavailable."


@app.get("/health", tags=["Operations"])
def health():
    return {"status": "ok", "service": "delivery"}


@app.post("/deliveries", status_code=201, tags=["Deliveries"])
async def create_delivery(request: Request, idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")):
    payload = await read_json(request)
    ok, detail = validate(payload, {"orderId": str, "deliveryAddress": str}, {"packageDetails": str, "partnerReference": str})
    if not ok:
        return problem(400, detail, code="INVALID_INPUT")
    key = idempotency_key
    if not key or not key.strip():
        return problem(400, "Idempotency-Key header is required.", code="INVALID_INPUT")
    if len(key) > 150:
        return problem(400, "Idempotency-Key must be 150 characters or fewer.", code="INVALID_INPUT")
    # Idempotent replay is returned before a network call; this avoids repeating work.
    existing, replayed, conflict = store.lookup_idempotency(key, payload) if hasattr(store, "lookup_idempotency") else (None, False, False)
    if conflict:
        return problem(409, "Idempotency-Key was already used with different request data.", code="IDEMPOTENCY_CONFLICT")
    if replayed and existing:
        return JSONResponse(status_code=201, content=existing.as_json(), headers={"Location": f"/deliveries/{existing.delivery_id}", "Idempotency-Replayed": "true"})
    eligible, status, reason = check_order_eligible(payload["orderId"])
    if not eligible:
        if status == 404:
            return problem(404, reason, code="ORDER_NOT_FOUND")
        if status == 422:
            return problem(422, reason, code="ORDER_NOT_ELIGIBLE")
        return problem(status or 503, reason, code="SERVICE_UNAVAILABLE" if status == 503 else "DOWNSTREAM_ERROR")
    delivery, replayed, conflict = store.create(payload, key)
    if conflict:
        # Existing order is a duplicate; same key/different body is idempotency conflict.
        if delivery.idempotency_key == key:
            return problem(409, "Idempotency-Key was already used with different request data.", code="IDEMPOTENCY_CONFLICT")
        return problem(409, "A delivery already exists for this order.", code="DUPLICATE_DELIVERY")
    return JSONResponse(status_code=201, content=delivery.as_json(), headers={"Location": f"/deliveries/{delivery.delivery_id}"})


@app.get("/deliveries", tags=["Deliveries"])
def list_deliveries(status: str | None = Query(default=None, pattern="^(PENDING|ASSIGNED|IN_TRANSIT|DELIVERED|FAILED)$"), order_id: str | None = None):
    items = store.list(status=status, order_id=order_id)
    return {"items": [d.as_json() for d in items], "count": len(items)}


@app.get("/deliveries/{delivery_id}", tags=["Deliveries"])
def get_delivery(delivery_id: str):
    delivery = store.get(delivery_id)
    if not delivery:
        return problem(404, f"Delivery {delivery_id} was not found.", code="DELIVERY_NOT_FOUND")
    return delivery.as_json()


@app.post("/deliveries/{delivery_id}/tracking-events", status_code=201, tags=["Tracking"])
async def add_tracking_event(delivery_id: str, request: Request):
    payload = await read_json(request)
    ok, detail = validate(payload, {"description": str}, {"location": str, "eventTime": str, "status": str})
    if not ok:
        return problem(400, detail, code="INVALID_EVENT")
    if "eventTime" in payload and payload["eventTime"] is not None:
        try:
            datetime.fromisoformat(payload["eventTime"].replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return problem(400, "eventTime must be an ISO-8601 date-time.", code="INVALID_EVENT")
    allowed_statuses = {"ASSIGNED", "IN_TRANSIT", "DELIVERED", "FAILED"}
    if payload.get("status") is not None and payload["status"] not in allowed_statuses:
        return problem(400, "status must be ASSIGNED, IN_TRANSIT, DELIVERED, or FAILED.", code="INVALID_EVENT")
    delivery = store.get(delivery_id)
    if not delivery:
        return problem(404, f"Delivery {delivery_id} was not found.", code="DELIVERY_NOT_FOUND")
    if delivery.status in {"DELIVERED", "FAILED"}:
        return problem(409, f"Tracking cannot be changed after delivery status is {delivery.status}.", code="INVALID_DELIVERY_STATE")
    event = store.add_event(delivery, payload)
    return JSONResponse(status_code=201, content=event.as_json(), headers={"Location": f"/deliveries/{delivery_id}/tracking-events/{event.event_id}"})
