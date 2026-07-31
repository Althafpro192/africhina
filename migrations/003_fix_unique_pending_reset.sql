-- Migration 003: Fix duplicate pending password reset requests
-- Re-create password_reset_requests table (002 dropped it) with proper schema
-- and add partial unique index to enforce ONE pending request per buyer.

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Partial unique index: only ONE pending request per user_id at any time
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_reset
ON password_reset_requests(user_id)
WHERE status = 'pending';

-- Index for admin queries filtering by status
CREATE INDEX IF NOT EXISTS idx_reset_requests_status
ON password_reset_requests(status);
