-- Migration: Add driver role support
-- 1. Allow 'driver' as a user role
-- 2. Allow requests to have an assigned driver and delivery method

-- Update role column on users to allow 'driver'
-- MySQL 8 / MariaDB supports modifying ENUM with a new value
ALTER TABLE users
    MODIFY COLUMN role ENUM('buyer', 'supplier', 'admin', 'driver') NOT NULL DEFAULT 'buyer';

-- Add driver and delivery metadata to requests table
ALTER TABLE requests
    ADD COLUMN assigned_driver_id CHAR(36) NULL AFTER assigned_supplier_id,
    ADD COLUMN delivery_method ENUM('sea', 'air', 'trusted_provider') NULL AFTER assigned_driver_id,
    ADD COLUMN assigned_driver_at TIMESTAMP NULL AFTER delivery_method,
    ADD INDEX idx_requests_assigned_driver (assigned_driver_id),
    ADD CONSTRAINT fk_requests_driver
        FOREIGN KEY (assigned_driver_id) REFERENCES users(id)
        ON DELETE SET NULL;