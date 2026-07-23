-- Migration 005: Direct Chat & General Customer Support Support
-- Allows messages without a request_id (direct buyer-admin chat) and links buyer_id directly.

-- 1. Make request_id nullable if restricted
ALTER TABLE messages ALTER COLUMN request_id DROP NOT NULL;

-- 2. Add buyer_id column referencing users
ALTER TABLE messages ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 3. Backfill buyer_id for existing messages tied to requests
UPDATE messages m
SET buyer_id = r.user_id
FROM requests r
WHERE m.request_id = r.id AND m.buyer_id IS NULL;

-- 4. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_messages_buyer_id ON messages(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);
