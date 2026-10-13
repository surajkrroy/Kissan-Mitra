"""CampusEats Delivery REST API — Assignment 5 HTTP methods, headers and safe retries."""
from __future__ import annotations
import os, random, time, json
from datetime import datetime
from hashlib import sha256
from typing import Any
from urllib.parse import quote
import requests
from fastapi import FastAPI, Request, Query, Header
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.gzip import GZipMiddleware
from .errors import problem
from .store import store

app = FastAPI(title="CampusEats Delivery API", version="1.1.0", description="Delivery owns delivery records and tracking; Orders owns order workflow.")
app.add_middleware(GZipMiddleware, minimum_size=1000)
_rate_lock = __import__('threading').RLock()
_rate_state: dict[str, tuple[int, float]] = {}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return problem(400, "Malformed request or invalid query parameter.", code="INVALID_INPUT")

@app.middleware("http")
async def protocol_headers_and_controls(request: Request, call_next):
    # Method override is deliberately constrained to POST and documented for restricted clients.
    override = request.headers.get("X-HTTP-Method-Override", "").upper()
    if override:
        if request.method == "POST" and override in {"PUT", "DELETE"}:
            request.scope["method"] = override
        else:
            response = problem(400, "X-HTTP-Method-Override is allowed only on POST with PUT or DELETE.", code="INVALID_METHOD_OVERRIDE")
            return add_headers(request, response)
    path = request.url.path
    is_health = path == "/health"
    is_preflight = request.method == "OPTIONS" and bool(request.headers.get("Origin"))
    if not is_health and request.method != "OPTIONS" and path != "/openapi.json" and path != "/docs" and path != "/docs/oauth2-redirect" and path != "/redoc":
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer ") or not auth[7:].strip():
            return add_headers(request, problem(401, "A non-empty Bearer token is required.", code="UNAUTHENTICATED", headers={"WWW-Authenticate": "Bearer"}))
    accept = request.headers.get("Accept", "*/*")
    if not is_preflight and "application/json" not in accept and "*/*" not in accept and "application/*" not in accept:
        return add_headers(request, problem(406, "This API only produces application/json.", code="NOT_ACCEPTABLE"))
    if not is_health and not is_preflight and path not in {"/openapi.json", "/docs", "/docs/oauth2-redirect", "/redoc"}:
        client = request.client.host if request.client else "unknown"
        limit = max(1, int(os.getenv("RATE_LIMIT_PER_MINUTE", "120")))
        now = time.monotonic()
        with _rate_lock:
            count, start = _rate_state.get(client, (0, now))
            if now - start >= 60: count, start = 0, now
            if count >= limit:
                retry = max(1, int(60 - (now - start)))
                response = problem(429, "Per-client request budget exceeded; retry later.", code="RATE_LIMITED", headers={"Retry-After": str(retry), "X-RateLimit-Limit": str(limit), "X-RateLimit-Remaining": "0"})
                return add_headers(request, response)
            _rate_state[client] = (count + 1, start)
            remaining = max(0, limit - count - 1)
    else:
        limit, remaining = max(1, int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))), max(1, int(os.getenv("RATE_LIMIT_PER_MINUTE", "120")))
    response = await call_next(request)
    response.headers.setdefault("X-RateLimit-Limit", str(limit))
    response.headers.setdefault("X-RateLimit-Remaining", str(remaining))
    return add_headers(request, response)

def add_headers(request: Request, response: Response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    response.headers.setdefault("Cache-Control", "no-store")
    origin = request.headers.get("Origin")
    response.headers.setdefault("Access-Control-Allow-Origin", origin or "*")
    response.headers.setdefault("Vary", "Origin, Accept, Accept-Encoding")
    if request.method == "OPTIONS":
        response.headers.setdefault("Allow", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.setdefault("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        response.headers.setdefault("Access-Control-Allow-Headers", "Authorization, Content-Type, Idempotency-Key, If-Match, If-None-Match, X-HTTP-Method-Override")
        response.headers.setdefault("Access-Control-Max-Age", "600")
    if response.status_code not in {204, 304} and response.body if hasattr(response, "body") else False:
        response.headers.setdefault("Content-Type", "application/json")
    return response

def validate(payload: Any, required: dict[str, type], optional: dict[str, type] | None = None) -> tuple[bool, str]:
    if not isinstance(payload, dict): return False, "Request body must be a JSON object."
    optional = optional or {}
    for name, expected in required.items():
        if name not in payload: return False, f"Missing required field: {name}."
        if not isinstance(payload[name], expected) or (expected is str and not payload[name].strip()): return False, f"Field {name} must be a non-empty {expected.__name__}."
    allowed = set(required) | set(optional)
    unknown = set(payload) - allowed
    if unknown: return False, "Unknown field(s): " + ", ".join(sorted(unknown)) + "."
    for name, expected in optional.items():
        if name in payload and payload[name] is not None and not isinstance(payload[name], expected): return False, f"Field {name} must be {expected.__name__} or null."
    return True, ""

async def read_json(request: Request):
    try: return await request.json()
    except Exception: return None

def orders_service_url() -> str: return os.getenv("ORDERS_SERVICE_URL", "").rstrip("/")

def check_order_eligible(order_id: str) -> tuple[bool, int | None, str]:
    """Retry only transient network/5xx failures with timeout and exponential backoff+jitter."""
    base = orders_service_url()
    if not base: return False, 503, "ORDERS_SERVICE_URL is not configured."
    url = f"{base}/orders/{quote(order_id, safe='')}/delivery-eligibility"
    max_attempts = max(1, int(os.getenv("OUTBOUND_MAX_ATTEMPTS", "3")))
    timeout = float(os.getenv("OUTBOUND_TIMEOUT_SECONDS", "1.5"))
    for attempt in range(max_attempts):
        try:
            response = requests.get(url, timeout=timeout, headers={"Accept": "application/json"})
            if 400 <= response.status_code < 500:
                if response.status_code == 404: return False, 404, "Order was not found by the Orders service."
                if response.status_code in {409, 422}: return False, 422, "Orders service says this order is not eligible for delivery."
                return False, 502, f"Orders service rejected the eligibility request with HTTP {response.status_code}."
            if response.status_code >= 500:
                if attempt + 1 < max_attempts:
                    time.sleep(min(0.05 * (2 ** attempt) + random.uniform(0, 0.05), 0.5)); continue
                return False, 503, "Orders service remained unavailable after safe retries."
            try: data = response.json()
            except ValueError: return False, 502, "Orders service returned malformed JSON."
            if not isinstance(data, dict) or not isinstance(data.get("eligible"), bool): return False, 502, "Orders service returned an invalid eligibility response."
            if not data["eligible"]: return False, 422, "Order has not reached the state required for delivery creation."
            return True, None, ""
        except (requests.Timeout, requests.ConnectionError):
            if attempt + 1 < max_attempts: time.sleep(min(0.05 * (2 ** attempt) + random.uniform(0, 0.05), 0.5)); continue
            return False, 503, "Orders service is unreachable; no delivery record was created."
    return False, 503, "Orders service is unavailable."

def etag_for(delivery) -> str:
    raw = json.dumps(delivery.as_json(), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return '"' + sha256(raw.encode()).hexdigest() + '"'

def json_response(status: int, content: Any, headers: dict[str, str] | None = None):
    return JSONResponse(status_code=status, content=content, headers=headers or {})

@app.get("/health", tags=["Operations"])
def health(): return {"status": "ok", "service": "delivery"}

@app.options("/deliveries", tags=["Deliveries"])
def options_deliveries():
    return Response(status_code=204, headers={"Allow": "GET, POST, OPTIONS"})

@app.post("/deliveries", status_code=201, tags=["Deliveries"])
async def create_delivery(request: Request, idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")):
    payload = await read_json(request)
    ok, detail = validate(payload, {"orderId": str, "deliveryAddress": str}, {"packageDetails": str, "partnerReference": str})
    if not ok: return problem(400, detail, code="INVALID_INPUT")
    key = idempotency_key
    if not key or not key.strip(): return problem(400, "Idempotency-Key header is required.", code="INVALID_INPUT")
    if len(key) > 150: return problem(400, "Idempotency-Key must be 150 characters or fewer.", code="INVALID_INPUT")
    existing, replayed, conflict = store.lookup_idempotency(key, payload)
    if conflict: return problem(409, "Idempotency-Key was already used with different request data.", code="IDEMPOTENCY_CONFLICT")
    if replayed and existing: return json_response(201, existing.as_json(), {"Location": f"/deliveries/{existing.delivery_id}", "Idempotency-Replayed": "true"})
    eligible, status, reason = check_order_eligible(payload["orderId"])
    if not eligible:
        if status == 404: return problem(404, reason, code="ORDER_NOT_FOUND")
        if status == 422: return problem(422, reason, code="ORDER_NOT_ELIGIBLE")
        return problem(status or 503, reason, code="SERVICE_UNAVAILABLE" if status == 503 else "DOWNSTREAM_ERROR")
    delivery, replayed, conflict = store.create(payload, key)
    if conflict:
        if delivery.idempotency_key == key: return problem(409, "Idempotency-Key was already used with different request data.", code="IDEMPOTENCY_CONFLICT")
        return problem(409, "A delivery already exists for this order.", code="DUPLICATE_DELIVERY")
    return json_response(201, delivery.as_json(), {"Location": f"/deliveries/{delivery.delivery_id}"})

@app.get("/deliveries", tags=["Deliveries"])
def list_deliveries(status: str | None = Query(default=None, pattern="^(PENDING|ASSIGNED|IN_TRANSIT|DELIVERED|FAILED)$"), order_id: str | None = None,
                   sort: str = Query(default="createdAt", pattern="^(createdAt|updatedAt|status|orderId)$"), order: str = Query(default="asc", pattern="^(asc|desc)$"),
                   offset: int = Query(default=0, ge=0), limit: int = Query(default=20, ge=1, le=100)):
    items, total = store.list(status=status, order_id=order_id, sort=sort, order=order, offset=offset, limit=limit)
    return {"items": [d.as_json() for d in items], "count": len(items), "total": total, "offset": offset, "limit": limit, "sort": sort, "order": order}

@app.get("/deliveries/{delivery_id}", tags=["Deliveries"])
def get_delivery(delivery_id: str, request: Request):
    delivery = store.get(delivery_id)
    if not delivery: return problem(404, f"Delivery {delivery_id} was not found.", code="DELIVERY_NOT_FOUND")
    etag = etag_for(delivery)
    if request.headers.get("If-None-Match") in {etag, "*"}:
        return Response(status_code=304, headers={"ETag": etag, "Cache-Control": "private, max-age=30"})
    return json_response(200, delivery.as_json(), {"ETag": etag, "Cache-Control": "private, max-age=30"})

@app.put("/deliveries/{delivery_id}", tags=["Deliveries"])
async def replace_delivery(delivery_id: str, request: Request):
    delivery = store.get(delivery_id)
    if not delivery: return problem(404, f"Delivery {delivery_id} was not found.", code="DELIVERY_NOT_FOUND")
    current = etag_for(delivery)
    supplied = request.headers.get("If-Match")
    if not supplied: return problem(400, "If-Match header is required for a conditional update.", code="IF_MATCH_REQUIRED")
    if supplied not in {current, "*"}: return problem(412, "The delivery changed since it was read; fetch the latest ETag and retry.", code="PRECONDITION_FAILED", headers={"ETag": current})
    payload = await read_json(request)
    ok, detail = validate(payload, {"deliveryAddress": str}, {"packageDetails": str})
    if not ok: return problem(400, detail, code="INVALID_INPUT")
    if delivery.status in {"DELIVERED", "FAILED"}: return problem(409, "A terminal delivery cannot be replaced.", code="INVALID_DELIVERY_STATE")
    updated = store.update(delivery, payload)
    return json_response(200, updated.as_json(), {"ETag": etag_for(updated), "Cache-Control": "no-store"})

@app.patch("/deliveries/{delivery_id}", tags=["Deliveries"])
async def patch_delivery(delivery_id: str, request: Request):
    delivery = store.get(delivery_id)
    if not delivery: return problem(404, f"Delivery {delivery_id} was not found.", code="DELIVERY_NOT_FOUND")
    current = etag_for(delivery)
    supplied = request.headers.get("If-Match")
    if not supplied: return problem(400, "If-Match header is required for a conditional update.", code="IF_MATCH_REQUIRED")
    if supplied not in {current, "*"}: return problem(412, "The delivery changed since it was read; fetch the latest ETag and retry.", code="PRECONDITION_FAILED", headers={"ETag": current})
    payload = await read_json(request)
    ok, detail = validate(payload, {}, {"deliveryAddress": str, "packageDetails": str})
    if not ok or not payload: return problem(400, detail or "PATCH body must contain at least one editable field.", code="INVALID_INPUT")
    if delivery.status in {"DELIVERED", "FAILED"}: return problem(409, "A terminal delivery cannot be modified.", code="INVALID_DELIVERY_STATE")
    updated = store.patch(delivery, payload)
    return json_response(200, updated.as_json(), {"ETag": etag_for(updated), "Cache-Control": "no-store"})

@app.delete("/deliveries/{delivery_id}", status_code=204, tags=["Deliveries"])
def delete_delivery(delivery_id: str):
    delivery = store.get(delivery_id)
    if not delivery: return problem(404, f"Delivery {delivery_id} was not found.", code="DELIVERY_NOT_FOUND")
    if delivery.status in {"DELIVERED", "FAILED"}: return problem(409, "A terminal delivery cannot be deleted.", code="INVALID_DELIVERY_STATE")
    store.delete(delivery_id)
    return Response(status_code=204)

@app.post("/deliveries/{delivery_id}/tracking-events", status_code=201, tags=["Tracking"])
async def add_tracking_event(delivery_id: str, request: Request):
    payload = await read_json(request)
    ok, detail = validate(payload, {"description": str}, {"location": str, "eventTime": str, "status": str})
    if not ok: return problem(400, detail, code="INVALID_EVENT")
    if "eventTime" in payload and payload["eventTime"] is not None:
        try: datetime.fromisoformat(payload["eventTime"].replace("Z", "+00:00"))
        except (ValueError, TypeError): return problem(400, "eventTime must be an ISO-8601 date-time.", code="INVALID_EVENT")
    allowed_statuses = {"ASSIGNED", "IN_TRANSIT", "DELIVERED", "FAILED"}
    if payload.get("status") is not None and payload["status"] not in allowed_statuses: return problem(400, "status must be ASSIGNED, IN_TRANSIT, DELIVERED, or FAILED.", code="INVALID_EVENT")
    delivery = store.get(delivery_id)
    if not delivery: return problem(404, f"Delivery {delivery_id} was not found.", code="DELIVERY_NOT_FOUND")
    if delivery.status in {"DELIVERED", "FAILED"}: return problem(409, f"Tracking cannot be changed after delivery status is {delivery.status}.", code="INVALID_DELIVERY_STATE")
    event = store.add_event(delivery, payload)
    return json_response(201, event.as_json(), {"Location": f"/deliveries/{delivery_id}/tracking-events/{event.event_id}"})
