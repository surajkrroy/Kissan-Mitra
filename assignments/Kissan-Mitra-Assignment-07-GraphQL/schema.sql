-- Kissan-Mitra Assignment 07: Catalogue service
-- Run this script in MySQL Workbench or with: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS kissan_mitra_graphql
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kissan_mitra_graphql;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  location VARCHAR(120) NOT NULL,
  farmer_name VARCHAR(120) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_product_price CHECK (price_per_kg >= 0),
  CONSTRAINT chk_product_quantity CHECK (available_quantity >= 0)
);

INSERT INTO products
  (name, category, price_per_kg, unit, available_quantity, location, farmer_name, available)
SELECT seed.name, seed.category, seed.price_per_kg, seed.unit, seed.available_quantity,
       seed.location, seed.farmer_name, seed.available
FROM (
  SELECT 'Fresh Tomatoes' AS name, 'Vegetables' AS category, 28.00 AS price_per_kg,
         'kg' AS unit, 120.00 AS available_quantity, 'Giridih, Jharkhand' AS location,
         'Ramesh Kumar' AS farmer_name, TRUE AS available
  UNION ALL SELECT 'Premium Potatoes', 'Vegetables', 22.50, 'kg', 250.00, 'Dhanbad, Jharkhand', 'Sita Devi', TRUE
  UNION ALL SELECT 'Mustard Seeds', 'Oilseeds', 68.00, 'kg', 80.00, 'Bokaro, Jharkhand', 'Mahesh Mahto', TRUE
  UNION ALL SELECT 'Seasonal Green Peas', 'Vegetables', 45.00, 'kg', 0.00, 'Giridih, Jharkhand', 'Anita Kumari', FALSE
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM products existing WHERE existing.name = seed.name AND existing.farmer_name = seed.farmer_name
);
