-- Migration: Add user_id to suppliers table for supplier registration
-- This links supplier accounts to user accounts

ALTER TABLE suppliers
ADD COLUMN user_id CHAR(36) NULL AFTER id;

-- Add foreign key constraint
ALTER TABLE suppliers
ADD CONSTRAINT fk_suppliers_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
