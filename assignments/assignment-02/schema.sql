-- Kissan Mitra - Assignment 02
-- PostgreSQL-compatible logical service schemas
-- Each service owns its tables.
-- Cross-service IDs are validated through APIs, not foreign keys.

-- =====================================================
-- SERVICE 1: USER MANAGEMENT
-- Assigned member: Vivek Kumar
-- Owns: users
-- =====================================================

CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('FARMER', 'BUYER', 'ADMIN')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICE 2: CATALOGUE
-- Assigned member: Sandeep Parmar
-- Owns: categories, products
-- farmer_id belongs to User Management.
-- =====================================================

CREATE TABLE categories (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE products (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    category_id BIGINT REFERENCES categories(category_id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVIEW')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICE 3: ORDERS
-- Assigned member: Dipesh Mishra
-- Owns: orders, order_items
-- buyer_id belongs to User Management.
-- product_id belongs to Catalogue.
-- =====================================================

CREATE TABLE orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLACED'
        CHECK (status IN (
            'PLACED',
            'PAYMENT_PENDING',
            'PAYMENT_FAILED',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED'
        )),
    total_amount NUMERIC(12, 2) NOT NULL
        CHECK (total_amount >= 0),
    delivery_address TEXT NOT NULL,
    idempotency_key VARCHAR(150) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (buyer_id, idempotency_key)
);

CREATE TABLE order_items (
    order_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    product_id BIGINT NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICE 4: PAYMENTS
-- Assigned member: Suraj Kumar Saw
-- Owns: payments, payment_refunds
-- order_id belongs to the Orders service.
-- =====================================================

CREATE TABLE payments (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN (
            'PENDING',
            'SUCCESS',
            'FAILED',
            'REFUND_PENDING',
            'PARTIALLY_REFUNDED',
            'REFUNDED'
        )),
    transaction_ref VARCHAR(150) UNIQUE,
    idempotency_key VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_refunds (
    refund_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(payment_id),
    refund_amount NUMERIC(12, 2) NOT NULL CHECK (refund_amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    provider_ref VARCHAR(150) UNIQUE,
    idempotency_key VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICE 5: DELIVERY
-- Assigned member: Suraj Kumar Saw
-- Owns: deliveries, tracking_events
-- order_id belongs to the Orders service.
-- =====================================================

CREATE TABLE deliveries (
    delivery_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    delivery_address TEXT NOT NULL,
    package_details TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN (
            'PENDING',
            'ASSIGNED',
            'IN_TRANSIT',
            'DELIVERED',
            'FAILED'
        )),
    tracking_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tracking_events (
    event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    delivery_id BIGINT NOT NULL REFERENCES deliveries(delivery_id),
    location VARCHAR(255),
    description TEXT NOT NULL,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICE 6: ADMINISTRATION
-- Assigned member: Vivek Kumar
-- Owns: admin_actions
-- admin_user_id belongs to User Management.
-- =====================================================

CREATE TABLE admin_actions (
    action_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Catalogue indexes
CREATE INDEX idx_products_farmer_id
    ON products(farmer_id);

CREATE INDEX idx_products_category_id
    ON products(category_id);

CREATE INDEX idx_products_status
    ON products(status);

CREATE INDEX idx_products_name
    ON products(name);

-- Orders indexes
CREATE INDEX idx_orders_buyer_id
    ON orders(buyer_id);

CREATE INDEX idx_orders_status
    ON orders(status);

CREATE INDEX idx_orders_created_at
    ON orders(created_at);

CREATE INDEX idx_order_items_order_id
    ON order_items(order_id);

CREATE INDEX idx_order_items_product_id
    ON order_items(product_id);

-- Payments indexes
CREATE INDEX idx_payments_order_id
    ON payments(order_id);

CREATE INDEX idx_payments_status
    ON payments(status);

CREATE INDEX idx_payment_refunds_payment_id
    ON payment_refunds(payment_id);

-- Delivery indexes
CREATE INDEX idx_deliveries_order_id
    ON deliveries(order_id);

CREATE INDEX idx_deliveries_status
    ON deliveries(status);

CREATE INDEX idx_tracking_events_delivery_id
    ON tracking_events(delivery_id);

CREATE INDEX idx_tracking_events_event_time
    ON tracking_events(event_time);

-- Administration indexes
CREATE INDEX idx_admin_actions_admin_user_id
    ON admin_actions(admin_user_id);

CREATE INDEX idx_admin_actions_created_at
    ON admin_actions(created_at);

CREATE INDEX idx_admin_actions_target
    ON admin_actions(target_type, target_id);
