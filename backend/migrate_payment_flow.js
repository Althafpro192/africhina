import pool from './config/db.js';

async function migrate() {
  console.log('Running database migration for invoice & payment verification workflow...');
  try {
    await pool.query(`
      ALTER TABLE requests 
      ADD COLUMN IF NOT EXISTS buyer_notes TEXT,
      ADD COLUMN IF NOT EXISTS final_price DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS price_breakdown JSONB,
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS payment_qr_url TEXT,
      ADD COLUMN IF NOT EXISTS payment_notes TEXT,
      ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT;
    `);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
