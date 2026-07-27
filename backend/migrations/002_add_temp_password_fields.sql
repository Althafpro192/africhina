-- Migration: 002_add_temp_password_fields.sql
-- Description: Add temporary password fields for Admin-generated temporary password flow.

ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMPTZ;

-- Drop obsolete legacy password reset requests table if present
DROP TABLE IF EXISTS password_reset_requests CASCADE;
