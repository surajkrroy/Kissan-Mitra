# Kissan Mitra - Service API Contracts

## 1. User Management Service

**Assigned member:** Vivek Kumar

| Operation | Input | Successful Output | Possible Errors |
|---|---|---|---|
| `registerUser` | Name, email, phone, password, role | User ID, account status | `400 INVALID_INPUT`, `409 DUPLICATE_EMAIL` |
| `getUser` | User ID, authenticated caller | Permitted user profile | `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 USER_NOT_FOUND` |
| `updateUserStatus` | User ID, new status, authorized caller | Updated account status | `400 INVALID_STATUS`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 USER_NOT_FOUND` |

**Security rules:**
- Store passwords using a suitable secure password-hashing algorithm.
- Never include password hashes in API responses.
- Enforce role-based access control for account and status operations.
- Return only the user information the caller is permitted to access.

## 2. Catalogue Service

**Assigned member:** Sandeep Parmar

| Operation | Input | Successful Output | Possible Errors |
|---|---|---|---|
| `createProduct` | Farmer ID, name, category, price, quantity, unit, authenticated caller | Product ID, product status | `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 FORBIDDEN` |
| `getProduct` | Product ID | Product details | `404 PRODUCT_NOT_FOUND` |
| `searchProducts` | Search term, category, page, page size | Matching products and pagination details | `400 INVALID_QUERY` |
| `updateProduct` | Product ID, permitted changes, authenticated caller | Updated product | `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 PRODUCT_NOT_FOUND` |
| `checkAvailability` | Product IDs and requested quantities | Availability, current prices, and relevant product details | `400 INVALID_INPUT`, `404 PRODUCT_NOT_FOUND`, `409 INSUFFICIENT_STOCK` |

**Validation rules:**
- Prices must be valid and non-negative; apply the platform's minimum-price rules if required.
- Quantities must be valid and must not be negative.
- Only an authorized farmer may create or update their own listings.
- Orders must use prices validated by Catalogue, not totals supplied by the buyer's client.

## 3. Orders Service

**Assigned member:** Dipesh Mishra

| Operation | Input | Successful Output | Possible Errors |
|---|---|---|---|
| `placeOrder` | Buyer ID, items, delivery address, idempotency key, authenticated caller | Order ID, validated items, total amount, order status, creation timestamp | `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ORDER_NOT_ALLOWED`, `404 PRODUCT_NOT_FOUND`, `409 PRODUCT_UNAVAILABLE`, `409 IDEMPOTENCY_CONFLICT`, `502 DOWNSTREAM_ERROR`, `503 SERVICE_UNAVAILABLE` |
| `getOrder` | Order ID, authenticated caller | Order details, items, total, current status | `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 ORDER_NOT_FOUND` |
| `cancelOrder` | Order ID, authenticated caller, cancellation reason | Updated order status | `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 ORDER_NOT_FOUND`, `409 INVALID_ORDER_STATE` |
| `updateOrderStatus` | Order ID, new status, authorized actor | Updated order status | `400 INVALID_STATUS`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 ORDER_NOT_FOUND`, `409 INVALID_STATUS_TRANSITION` |

**Order-processing rules:**
- Verify buyer permissions and validate all requested quantities.
- Call Catalogue to validate product availability and current prices.
- Calculate the total amount using validated prices.
- Use the idempotency key to return the previous result for a repeated equivalent request. Reusing the same key with different request data must return `409 IDEMPOTENCY_CONFLICT`.
- Initiate payment through Payments and update the order only according to a confirmed payment result.
- If payment status is unknown because of a timeout, check the payment status before retrying the payment.
- If payment is confirmed failed, persist `PAYMENT_FAILED` and return an order result that clearly reports that state; never report the order as paid or confirmed. A retry must follow the documented payment/order flow and must not create a duplicate order or charge.
- Create a delivery record only when the order reaches the required state.
- If delivery creation fails after payment succeeds, retain the paid order and allow controlled delivery retry. Do not create another order or charge the buyer again.
- The Orders service owns the order-status workflow; it does not own shipment-tracking events.

## 4. Payments Service

**Assigned member:** Suraj Kumar Saw

| Operation | Input | Successful Output | Possible Errors |
|---|---|---|---|
| `createPayment` | Order ID, amount, currency, payment method token, idempotency key | Payment ID, payment status, transaction reference when available | `400 INVALID_AMOUNT`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 ORDER_NOT_FOUND`, `409 DUPLICATE_REQUEST`, `502 PAYMENT_PROVIDER_ERROR`, `503 SERVICE_UNAVAILABLE` |
| `getPaymentStatus` | Payment ID or order ID, authenticated caller | Payment status and permitted transaction details | `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 PAYMENT_NOT_FOUND`, `503 SERVICE_UNAVAILABLE` |
| `refundPayment` | Payment ID, refund amount, authorized request | Refund ID and refund status | `400 INVALID_REFUND_AMOUNT`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 PAYMENT_NOT_FOUND`, `409 REFUND_NOT_PERMITTED`, `502 PAYMENT_PROVIDER_ERROR` |

**Security and consistency rules:**
- Do not store or return sensitive payment credentials unnecessarily.
- Keep payment-provider credentials secret.
- Validate that the requested amount matches the expected order amount before processing payment.
- Use idempotency or unique transaction references to prevent duplicate charges on retries.
- Report payment success only after receiving a confirmed result from the payment provider.
- If the result is uncertain, expose a pending or unknown state until it can be verified.
- Process refunds only when permitted by the payment and order states.

## 5. Delivery Service

**Assigned member:** Suraj Kumar Saw

| Operation | Input | Successful Output | Possible Errors |
|---|---|---|---|
| `createDelivery` | Order ID, delivery address, package details, authorized caller | Delivery ID, tracking number, delivery status | `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 ORDER_NOT_FOUND`, `409 DUPLICATE_DELIVERY`, `503 SERVICE_UNAVAILABLE` |
| `getDeliveryStatus` | Delivery ID or tracking number, authorized caller | Delivery status and latest tracking event | `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 DELIVERY_NOT_FOUND` |
| `addTrackingEvent` | Delivery ID, location, description, event time, authorized caller | Created tracking event | `400 INVALID_EVENT`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 DELIVERY_NOT_FOUND`, `409 INVALID_DELIVERY_STATE` |

**Delivery rules:**
- Create delivery records only for eligible orders.
- Prevent duplicate delivery records for the same order.
- Validate tracking-event details and timestamps.
- Restrict shipment updates to authorized callers or approved delivery integrations.
- The Delivery service owns delivery and tracking information. It must not directly change the Orders service's database or independently own the order-status workflow.

## 6. Administration Service

**Assigned member:** Vivek Kumar

| Operation | Input | Successful Output | Possible Errors |
|---|---|---|---|
| `getPlatformReport` | Authenticated administrator, date range, permitted report filters | Aggregated platform report | `400 INVALID_DATE_RANGE`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `503 SERVICE_UNAVAILABLE` |
| `recordAdminAction` | Authenticated administrator, action type, target reference, details | Audit record ID | `400 INVALID_ACTION`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `503 SERVICE_UNAVAILABLE` |

**Administrative rules:**
- Restrict operations to authorized administrators.
- Validate date ranges and report permissions.
- Record the administrator identity, action, timestamp, target reference, and relevant details.
- Keep audit records protected from unauthorized modification.
- Use service APIs to obtain platform information rather than accessing other services' database tables directly.

## 7. Cross-Service Rules

1. **Data ownership:** Each service owns its data and controls changes to that data.
2. **API communication:** Services communicate through documented APIs, not direct database access.
3. **Authentication:** APIs authenticate callers and enforce role-based permissions.
4. **Input validation:** Each service validates incoming data before processing it.
5. **Error mapping:** A calling service maps downstream failures into documented errors without hiding the cause or falsely reporting success.
6. **Idempotency:** Order and payment operations must handle safe retries without unintended duplicates.
7. **Timeouts:** A timeout does not prove that a downstream operation failed. Check its status before retrying operations that may create an order, charge, or delivery.
8. **Consistent status ownership:** Orders owns order status; Payments owns payment status; Delivery owns shipment and tracking status.
9. **Sensitive information:** Do not expose passwords, payment credentials, secrets, or unauthorized personal information.
10. **Auditability:** Administrative actions and relevant payment outcomes must be traceable through appropriate records.

## 8. Contract Validation

Each contract defines the operation, input, successful output, expected errors, and relevant authorization or validation rules.

The following implementation details may be specified in the corresponding OpenAPI document:

- Exact HTTP methods and endpoint paths.
- JSON request and response schemas.
- Authentication schemes and role requirements.
- HTTP status-code mappings and error-response formats.
- Pagination limits and filtering rules.
- Timeout, retry, and idempotency behavior.

The implemented APIs, service diagrams, and database schema must remain consistent with these contracts. Any change to an operation or its data ownership must be reflected in the relevant design documentation.
