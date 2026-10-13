# Assignment 04 — Delivery REST Service

**Team**
- Vivek Kumar — 20251651104
- Sandeep Parmar — 20251651082
- Dipesh Mishra — 20251651036
- Suraj Kumar Saw — 20251651092

## Service boundary

This service owns `deliveries` and `tracking_events`. It does not directly read or update Orders database tables and does not own the order-status workflow. Before creating a new delivery it calls the Orders service eligibility API.

## Run locally (PowerShell)

Open two terminals from `assignments\assignment-04`.

Terminal 1 — mock Orders service for local demonstration only:

```powershell
python -m uvicorn delivery_rest.tests.mock_orders_service:app --host 127.0.0.1 --port 8101
```

Terminal 2 — Delivery service:

```powershell
$env:ORDERS_SERVICE_URL = "http://127.0.0.1:8101"
$env:OUTBOUND_TIMEOUT_SECONDS = "1.5"
$env:OUTBOUND_MAX_ATTEMPTS = "3"
python -m uvicorn delivery_rest.app:app --host 127.0.0.1 --port 8102
```

Install dependencies first:

```powershell
python -m pip install -r delivery_rest\requirements.txt
```

The mock Orders service is for local demo/tests only. Replace it with the real Orders service URL in a deployed environment. If `ORDERS_SERVICE_URL` is missing or the service is unreachable, creation fails closed with `503` and no new delivery is stored.

## Test and local OpenAPI structural validation

From `assignments\assignment-04`:

```powershell
python -m pytest delivery_rest\tests -q
python delivery_rest\validate_openapi.py
```

For the official OpenAPI validation requested in the assignment, open `delivery_rest\openapi.yaml` in https://editor.swagger.io/ or run `openapi-spec-validator` in an environment where it is installed. The included validator is an offline structural check, not a substitute for the official validator.

## Endpoints

- `POST /deliveries` — create delivery; requires `Idempotency-Key`; returns `201` and `Location`.
- `GET /deliveries/{delivery_id}` — retrieve one delivery.
- `GET /deliveries?status=PENDING&order_id=1042` — filtered list.
- `POST /deliveries/{delivery_id}/tracking-events` — create a tracking event and optionally advance delivery status.

Interactive API docs are available at `http://localhost:8102/docs` when the service is running.
