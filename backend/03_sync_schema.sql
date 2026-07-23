-- Migration: Sync schema with application code
-- Date: 2026-07-18
-- Description: Add missing tables and columns required by controllers

-- 1. Table: request_options (used by adminRequestActions.js)
CREATE TABLE IF NOT EXISTS request_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    product_name VARCHAR(200),
    description TEXT,
    image_url TEXT,
    price_min NUMERIC(15,2),
    price_max NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: messages (used by messageController.js)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add missing columns to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS deal_finalized_at TIMESTAMP;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS selected_option_id UUID REFERENCES request_options(id);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- 4. Add missing column to ratings table
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
