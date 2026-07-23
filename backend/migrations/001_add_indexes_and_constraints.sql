-- Migration: 001_add_indexes_and_constraints.sql
-- Description: Add performance indexes for foreign keys, status columns, created_at, and non-blocking status CHECK constraints.

CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_supplier_id ON requests(assigned_supplier_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tracking_logs_request_id ON tracking_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_tracking_logs_status ON tracking_logs(status);

CREATE INDEX IF NOT EXISTS idx_ratings_request_id ON ratings(request_id);
CREATE INDEX IF NOT EXISTS idx_ratings_supplier_id ON ratings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ratings_buyer_id ON ratings(buyer_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_request_id ON email_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sender_id ON email_logs(sender_id);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_requests_status'
    ) THEN
        ALTER TABLE requests ADD CONSTRAINT chk_requests_status 
        CHECK (status IN (
            'pending',
            'menunggu_penawaran_admin',
            'menunggu_pemilihan_buyer',
            'menunggu_kesepakatan_final',
            'menunggu_pembayaran',
            'menunggu_verifikasi_pembayaran',
            'sedang_diproses',
            'dikirim',
            'menunggu_verifikasi_admin',
            'selesai',
            'batal',
            'dispute',
            'approved',
            'quoted',
            'rejected'
        )) NOT VALID;

        ALTER TABLE requests VALIDATE CONSTRAINT chk_requests_status;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') AND
       NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_status') THEN
        ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
        CHECK (status IN ('pending', 'verified', 'rejected')) NOT VALID;

        ALTER TABLE payments VALIDATE CONSTRAINT chk_payments_status;
    END IF;
END $$;
