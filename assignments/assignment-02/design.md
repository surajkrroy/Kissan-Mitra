# Kissan Mitra - Assignment 02
## Service Design, Contracts and Database Schema

## 1. System Overview

Kissan Mitra is a farmer-to-buyer marketplace. Farmers can publish and manage agricultural products, buyers can browse products and place orders, and administrators can supervise users and platform activity.

The system is divided into six logical services: User Management, Catalogue, Orders, Payments, Delivery, and Administration. Each service has a defined responsibility, API contract, and data ownership boundary.

## 2. Main Capabilities

1. User registration, authentication, and account management.
2. Farmer profile and product listing management.
3. Product browsing, searching, and category management.
4. Order creation, retrieval, cancellation, and order-status management.
5. Payment initiation, payment-status tracking, and refunds.
6. Delivery creation and shipment tracking.
7. Administrative user management, activity monitoring, and audit recording.

## 3. Service Boundaries, Data Ownership, and Team Allocation

| Service | Responsibilities | Owned Data | Assigned Member |
|---|---|---|---|
| User Management | Register users, retrieve permitted user information, and manage account status | Users, account status | Vivek Kumar |
| Catalogue | Create, update, retrieve, and search product listings | Products, categories | Sandeep Parmar |
| Orders | Create orders, manage order items, and control the order-status workflow | Orders, order items | Dipesh Mishra |
| Payments | Initiate payments, track payment results, and manage permitted refunds | Payments, transactions | Suraj Kumar Saw |
| Delivery | Create delivery records and manage shipment tracking | Deliveries, tracking events | Suraj Kumar Saw |
| Administration | Review platform activity, manage authorized administrative actions, and maintain audit records | Administrative action audit records | Vivek Kumar |

Each service owns and controls its data. Other services must not directly read or modify its database tables. Cross-service data access must use documented APIs.

The Orders service is responsible for the order-status workflow. The Delivery service is responsible for shipment and delivery tracking. These responsibilities must remain separate to avoid overlapping ownership.

## 4. Service Communication

- User Management provides authorized identity and account information.
- Catalogue provides product details, current prices, and availability information.
- Orders validates the buyer and requests product validation from Catalogue before creating an order.
- Orders communicates with Payments to initiate payment and obtain the payment result.
- Orders requests Delivery to create a delivery record only when the order reaches the required state.
- Delivery records shipment events and provides delivery-status information.
- Administration uses authorized APIs to review platform activity and perform permitted administrative actions.

All service-to-service requests must define their inputs, successful outputs, authentication requirements, and error responses.

Services must not directly access another service's database. If a downstream service is unavailable, the calling service must handle the failure without incorrectly reporting the operation as successful.

## 5. API Contract Summary

| Service | Operation | Purpose |
|---|---|---|
| User Management | `registerUser` | Create a user account |
| User Management | `getUser` | Retrieve permitted user information |
| User Management | `updateUserStatus` | Activate or suspend an account |
| Catalogue | `createProduct` | Publish a product listing |
| Catalogue | `getProduct` | Retrieve product details |
| Catalogue | `searchProducts` | Search available listings |
| Catalogue | `updateProduct` | Update a product listing |
| Catalogue | `checkAvailability` | Validate product availability, current prices, and requested quantities |
| Orders | `placeOrder` | Create an order |
| Orders | `getOrder` | Retrieve order details |
| Orders | `cancelOrder` | Request order cancellation |
| Orders | `updateOrderStatus` | Update an order's status |
| Payments | `createPayment` | Initiate a payment |
| Payments | `getPaymentStatus` | Retrieve payment status |
| Payments | `refundPayment` | Request a refund when permitted |
| Delivery | `createDelivery` | Create a delivery record |
| Delivery | `getDeliveryStatus` | Retrieve delivery status |
| Delivery | `addTrackingEvent` | Record a shipment-tracking update |
| Administration | `getPlatformReport` | Review platform activity |
| Administration | `recordAdminAction` | Record an administrative action |

## 6. Detailed Contract: `placeOrder`

**Responsible service:** Orders

**Assigned member:** Dipesh Mishra

### Purpose

Create an order for products selected by an authenticated buyer.

### Input

- `buyerId`: identifier of the authenticated buyer.
- `items`: list of product IDs and requested quantities.
- `deliveryAddress`: destination address for the order.
- `idempotencyKey`: unique key used to prevent duplicate orders when a request is retried.

### Processing

1. Authenticate the caller and verify that the caller has permission to place an order.
2. Validate that the item list is not empty and that every requested quantity is valid.
3. Ask User Management to validate the buyer account where required.
4. Ask Catalogue to verify product existence, availability, and current prices.
5. Calculate the total amount using validated product prices rather than client-supplied totals.
6. Check the idempotency key. If the same request has already been processed, return its existing result instead of creating another order.
7. Create the order and its order items with an appropriate initial status.
8. Request payment processing through Payments.
9. Update the order status according to the confirmed payment result.
10. Request Delivery to create a delivery record only after the order reaches the required state.
11. Return the order details and current status.

### Successful Output

- `orderId`: unique order identifier.
- `buyerId`: buyer identifier.
- `items`: ordered products, quantities, and validated prices.
- `totalAmount`: calculated order total.
- `status`: current order status.
- `createdAt`: order creation timestamp.

### Possible Errors

| HTTP Status | Error | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_INPUT` | Required fields or item quantities are invalid |
| `401 Unauthorized` | `UNAUTHENTICATED` | Authentication is missing or invalid |
| `403 Forbidden` | `ORDER_NOT_ALLOWED` | The caller is not permitted to place the order |
| `404 Not Found` | `PRODUCT_NOT_FOUND` | A requested product does not exist |
| `409 Conflict` | `PRODUCT_UNAVAILABLE` | A product is unavailable or the requested operation conflicts with the current state |
| `409 Conflict` | `IDEMPOTENCY_CONFLICT` | The same idempotency key was reused with different request data |
| `502 Bad Gateway` | `DOWNSTREAM_ERROR` | A required downstream service returned an invalid or unsuccessful response |
| `503 Service Unavailable` | `SERVICE_UNAVAILABLE` | A required downstream service is unavailable |

### Failure Handling and Consistency

- **Catalogue validation fails:** Do not confirm the order. Return an appropriate error.
- **Payment fails:** Mark the order as `PAYMENT_FAILED` or another documented failure state. Do not create a delivery record.
- **Payment result is unknown because of a timeout:** Do not assume payment failed or succeeded. Check the payment status using the payment reference before retrying or changing the order state.
- **Delivery creation fails after payment succeeds:** Keep the paid order recorded in its existing valid order state. Track the delivery-creation retry separately in the Orders service orchestration (for example, through a retry record or outbox); do not write a delivery-specific state into `orders.status`. Allow a controlled retry rather than creating another order or charging the buyer again.
- **A request is retried:** Use the idempotency key to avoid duplicate orders. Payment requests should also use an appropriate unique reference or idempotency mechanism.
- **A downstream service is unavailable:** Return an appropriate error or a documented pending result. Never report an unconfirmed operation as successful.

The Orders service must maintain a consistent order-status workflow and must not assume that a distributed operation can be rolled back automatically across all services.

## 7. Database Design Principles

- Every table must have a primary key.
- Foreign keys must be used for relationships within a service's database boundary.
- Separate services must not share database tables.
- Cross-service identifiers must be validated through APIs; cross-service database foreign keys must not be used.
- Passwords must be stored as secure hashes, never as plain text.
- Administrative actions must be recorded for auditability.
- Monetary values must use an appropriate fixed-precision decimal type.
- Order items must preserve the product price used when the order was created.
- Database entities, columns, keys, and relationships must agree with the database schema and ER diagram.
- The `updated_at` columns are initialized by the database defaults; application update operations must explicitly refresh them unless an update trigger is added.
- Service-specific database changes must remain within the owning service's data boundary.

## 8. Service-wise Validation Checklist

### User Management — Vivek Kumar
- Validate required registration fields and supported user roles.
- Reject duplicate account identifiers where uniqueness is required.
- Verify authorization before changing account status.
- Never return password hashes or other restricted account data in API responses.

### Catalogue — Sandeep Parmar
- Validate product names, prices, quantities, and categories.
- Reject invalid prices and negative stock quantities.
- Verify that only an authorized farmer can create or update their listings.
- Return clear errors for missing or unavailable products.

### Orders — Dipesh Mishra
- Validate buyer permissions, item lists, quantities, and delivery address.
- Obtain current prices and availability from Catalogue.
- Prevent duplicate orders when an idempotency key is retried.
- Handle payment failure, downstream timeouts, and order-status transitions explicitly.
- Create delivery records only when the order reaches the required state.

### Payments — Suraj Kumar Saw
- Validate the order reference, amount, currency, and payment request.
- Prevent duplicate payment attempts caused by safe retries.
- Verify payment results before reporting success.
- Permit refunds only when the payment and order state allow them.
- Keep payment records consistent with the payment provider's confirmed result.

### Delivery — Suraj Kumar Saw
- Validate the order reference and delivery details.
- Prevent duplicate delivery records for the same applicable order.
- Validate tracking-event data and timestamps.
- Restrict shipment-status updates to authorized callers.
- Keep shipment status separate from the Orders service's order-status workflow.

### Administration — Vivek Kumar
- Restrict administrative operations to authorized administrators.
- Validate report requests and access permissions.
- Record the administrator, action, timestamp, and relevant target identifier in the audit record.
- Prevent unauthorized users from modifying account status or accessing restricted reports.

## 9. Final Design Validation

- All six services have clear responsibilities and assigned team members.
- Each service owns its data and exposes documented API contracts.
- Cross-service communication uses APIs rather than direct database access.
- Service operations define expected inputs, outputs, authorization, and error responses.
- Database tables, keys, and relationships agree with the schema and ER diagram.
- The `placeOrder` contract documents processing, success output, errors, idempotency, and downstream failure handling.
- Order status and delivery tracking have distinct responsibilities.
- Validation rules are documented for each service.
- Service boundaries minimize unnecessary coupling and preserve data ownership.
