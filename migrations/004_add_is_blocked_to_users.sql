-- Migration 004: Add is_blocked column to users table
-- PostgreSQL 14+ handles ADD COLUMN ... DEFAULT without table rewrite (instant).

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Index for admin queries filtering blocked users
CREATE INDEX IF NOT EXISTS idx_users_is_blocked
ON users(is_blocked)
WHERE is_blocked = TRUE;
