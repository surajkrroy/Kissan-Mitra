# Assignment 04 — Rebuilding a CampusEats Service in REST

## Team members (first-page requirement)

- Vivek Kumar — Roll No. 20251651104
- Sandeep Parmar — Roll No. 20251651082
- Dipesh Mishra — Roll No. 20251651036
- Suraj Kumar Saw — Roll No. 20251651092

**Chosen service:** Delivery

**Ownership preserved from Assignment 2:** Delivery owns delivery records and tracking events. Orders owns the order-status workflow. Delivery checks order eligibility through the Orders API and does not directly access the Orders database.

## Part A — Resource modelling

### A2. SOAP-style operations that could have been written

- `createDelivery(orderId, deliveryAddress, packageDetails)`
- `getDeliveryStatus(deliveryId)`
- `searchDeliveries(status, orderId)`
- `addTrackingEvent(deliveryId, location, description, eventTime, status)`

### A4. REST resource table

| Method | URL | What it does | Success code | Failure codes |
|---|---|---|---:|---|
| `POST` | `/deliveries` | Creates a delivery for an eligible order; requires `Idempotency-Key` | `201 Created` with `Location` | `400`, `404`, `409`, `422`, `502`, `503` |
| `GET` | `/deliveries/{delivery_id}` | Reads one delivery and its tracking events | `200 OK` | `404` |
| `GET` | `/deliveries?status=PENDING&order_id=1042` | Lists deliveries filtered by status and/or order | `200 OK` | `400` |
| `POST` | `/deliveries/{delivery_id}/tracking-events` | Adds a tracking event and may advance Delivery-owned status | `201 Created` with `Location` | `400`, `404`, `409` |

The list route uses query parameters for filtering rather than embedding verbs in a URL. The tracking-events route is a sub-resource because an event belongs to a particular delivery.

### A5. Hard resource-mapping choice

`addTrackingEvent` was the least comfortable operation to map because it sounds like an imperative command and may also change delivery status. I modelled the durable noun as a tracking event, so the operation creates a child resource at `/deliveries/{delivery_id}/tracking-events`. An optional `status` field advances only the Delivery-owned shipment state as part of that event. I rejected `/addTrackingEvent` and a generic `/setDeliveryStatus` URL because both expose verbs rather than resources and obscure the event history.

## Part B — OpenAPI contract

`openapi.yaml` is the contract-first artifact. It documents the create, single-resource read, filtered collection, tracking-event sub-resource, their request/parameter inputs, and failure responses. Request and response structures are declared under `components.schemas` and reused through `$ref`.

The included `validate_openapi.py` checks YAML parsing, operation structure, response counts, and local schema references. **It is an offline structural check only.** The current build environment could not install `openapi-spec-validator` because network package access was unavailable. For the assignment's official zero-error evidence, open `openapi.yaml` in Swagger Editor (`https://editor.swagger.io/`) or run `openapi-spec-validator` where available, and save the resulting terminal output/screenshot with the submission.

### Line count comparison

- Assignment 3 `partner.wsdl`: **104 lines** (counted from the supplied file).
- This `openapi.yaml`: **229 lines** (counted from the submitted file).
- Difference: **125 more lines** in the OpenAPI file.

This difference is not a measure of one format being more powerful. The OpenAPI file spells out multiple REST paths, query/header/path parameters, JSON representations, response codes, and reusable JSON schemas. The WSDL is shorter because it describes one SOAP operation and uses XML Schema elements/messages for its request, response, and fault.

Two SOAP-specific things declared by the WSDL that this OpenAPI contract does not need are the SOAP 1.1 binding/transport declaration and the `soapAction` value. The WSDL also declares SOAP messages, a port type, and a SOAP header message; the REST contract expresses HTTP paths, headers, and JSON bodies directly instead.

## Part C — Implementation notes

- `models.py` separates the stored `Delivery`/`TrackingEvent` records from their public `as_json()` representation. Idempotency keys, request fingerprints, and internal partner references are not returned.
- `store.py` is the only in-process store for this service. Other services must not import it.
- `validate()` is called before endpoint code reads request fields; malformed JSON and invalid bodies use the shared `problem()` response helper.
- All failure responses use the same base shape: `type`, `title`, `status`, and `detail`, with an optional stable `code`.
- `POST /deliveries` returns `201` and a `Location` header. Equivalent requests with the same `Idempotency-Key` return the original delivery; reusing a key with different data returns `409 IDEMPOTENCY_CONFLICT`. A second key for an order that already has a delivery returns `409 DUPLICATE_DELIVERY`.
- `pytest` covers create/Location, idempotent replay, malformed body, missing resource, state conflict, idempotency-key conflict, and no retry on downstream 4xx.

## Part D — Cross-service call and fallback

The Delivery service calls the Orders service at `GET {ORDERS_SERVICE_URL}/orders/{orderId}/delivery-eligibility`. The URL comes from the `ORDERS_SERVICE_URL` environment variable, never from a hard-coded production URL. The request has a configurable timeout (`OUTBOUND_TIMEOUT_SECONDS`) and a bounded retry policy with exponential backoff and jitter. It retries connection/timeouts and 5xx responses only; a 4xx is returned/mapped immediately and is never retried. This is a read-only eligibility call, so retrying it is safe; no outbound create is retried.

**Fallback:** If Orders cannot be reached after safe retries, Delivery returns `503 SERVICE_UNAVAILABLE` and does not create a delivery record. It would be wrong to degrade by creating a delivery anyway because eligibility depends on the Orders-owned workflow; doing so could create a shipment for an unpaid, cancelled, or otherwise ineligible order. The paid-order recovery/retry orchestration remains the Orders service's responsibility, as specified in Assignment 2.

## Answers required by the assignment

### 1. WSDL versus OpenAPI line count

The supplied WSDL is 104 lines and this `openapi.yaml` is 229 lines, a difference of 125 lines. Most of the additional lines describe four REST operations, HTTP inputs/responses, reusable JSON schemas, and explicit failure responses. The WSDL's SOAP binding/transport declaration and `soapAction` are two declarations this REST contract does not need.

### 2. SOAP Fault and its HTTP replacement

From the supplied `soap-fault.xml`:

```xml
<faultcode>soapenv:Server</faultcode>
<faultstring>Delivery partner is temporarily unavailable</faultstring>
<del:code>partner_unavailable</del:code>
<del:retryable>true</del:retryable>
```

The REST equivalent should be HTTP **`503 Service Unavailable`**, using the same problem shape as other failures:

```json
{
  "type": "https://httpstatuses.com/503",
  "title": "Service Unavailable",
  "status": 503,
  "detail": "Delivery partner is temporarily unavailable.",
  "code": "SERVICE_UNAVAILABLE"
}
```

An error carried inside `200 OK` tells generic HTTP intermediaries that the request succeeded. Caches, monitors, retry policies, and gateways may therefore treat the failed operation as success and fail to apply availability handling. A correct non-2xx status makes the failure visible to the HTTP infrastructure.

### 3. UDDI publish, find, bind

The ideas still exist, but not necessarily as UDDI registry operations. **Publish** becomes publishing the OpenAPI contract and service deployment/configuration. **Find** becomes discovering the contract through the repository, API catalogue, or documentation portal. **Bind** becomes configuring the client with the service base URL and using the HTTP/JSON contract. A dedicated UDDI registry and its SOAP-oriented registry calls are no longer required in this setup; repository/API-catalogue publication and ordinary HTTP configuration take over their roles.

### 4. XML Schema validation versus OpenAPI validation

The specific runtime function is `validate()` in `app.py`. Without it, a request such as `{"orderId": 1042}` could pass JSON parsing but fail the service's expected string type, or a body missing `deliveryAddress` could cause a field-access exception instead of a controlled `400` problem response. OpenAPI documents the schema but does not automatically enforce it in this implementation.

### 5. Where SOAP would still be preferred

I would still consider SOAP for a tightly governed enterprise delivery-partner integration where the partner requires a formal WSDL/XSD contract and WS-Security message-level credentials/signatures. The guarantee being purchased is interoperable, machine-checkable XML message structure and explicit SOAP fault/header/binding contracts across heterogeneous clients; WS-Security can also protect message integrity and identity beyond transport-level TLS where that is required. For the REST service built here, HTTP status codes and a shared JSON problem shape are simpler for ordinary web/API infrastructure.

## Evidence files

- `curl-transcript.txt` — actual `curl -i` responses for create, repeated idempotent request, malformed body, missing resource, and state conflict.
- `pytest-output.txt` — captured test result.
- `openapi-structural-validation.txt` — captured offline structural-check result; obtain official Swagger Editor/openapi-spec-validator evidence separately as noted above.
