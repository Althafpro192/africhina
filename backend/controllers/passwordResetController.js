// Password Reset Request Controller
// Handles buyer reset requests and admin processing (Issue 1)
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import logger from '../config/logger.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * Buyer: Submit a password reset request to Admin.
 * Uses INSERT ... ON CONFLICT to prevent duplicate pending requests.
 * Always returns 200 OK to avoid leaking user existence.
 */
export const requestPasswordReset = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Look up user by email
  const userRes = await pool.query(
    'SELECT id, email FROM users WHERE email = $1 AND role = $2',
    [email, 'buyer']
  );

  if (userRes.rows.length === 0) {
    // Don't reveal whether user exists — return success anyway
    return res.json({
      message: 'If an account with that email exists, your request has been submitted. Admin will process it shortly.'
    });
  }

  const user = userRes.rows[0];

  // Insert with conflict guard: partial unique index on (user_id) WHERE status = 'pending'
  await pool.query(
    `INSERT INTO password_reset_requests (user_id, email, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (user_id) WHERE status = 'pending'
     DO NOTHING`,
    [user.id, user.email]
  );

  logger.info(`[PasswordReset] Reset request submitted for user ${user.email}`);

  res.json({
    message: 'Reset request submitted. Admin will process it shortly.'
  });
});

/**
 * Admin: Get all pending password reset requests.
 * Returns distinct entries per user (the unique index already prevents duplicates,
 * but DISTINCT ON ensures clean results even for edge cases).
 */
export const getResetRequests = catchAsync(async (req, res) => {
  const result = await pool.query(
    `SELECT DISTINCT ON (prr.user_id)
       prr.id, prr.user_id, prr.status, prr.created_at, prr.updated_at,
       u.full_name, u.email, u.avatar_url
     FROM password_reset_requests prr
     JOIN users u ON prr.user_id = u.id
     WHERE prr.status = 'pending'
     ORDER BY prr.user_id, prr.created_at DESC`
  );

  res.json(result.rows);
});

/**
 * Admin: Process a password reset request.
 * Generates a secure temporary password, updates user hash,
 * and marks the request as 'processed'.
 */
export const processResetRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;

  // Fetch the reset request
  const reqRes = await pool.query(
    `SELECT prr.*, u.full_name, u.email 
     FROM password_reset_requests prr
     JOIN users u ON prr.user_id = u.id
     WHERE prr.id = $1 AND prr.status = 'pending'`,
    [requestId]
  );

  if (reqRes.rows.length === 0) {
    throw new AppError('Reset request not found or already processed', 404);
  }

  const resetRequest = reqRes.rows[0];
  const expiryHours = parseInt(process.env.TEMP_PASSWORD_EXPIRY_HOURS, 10) || 24;

  // Generate cryptographically secure 12-char temporary password
  const tempPassword = crypto.randomBytes(6).toString('hex');
  const salt = await bcrypt.genSalt(10);
  const tempPasswordHash = await bcrypt.hash(tempPassword, salt);

  // Update user with temp password hash and expiry
  await pool.query(
    `UPDATE users 
     SET temp_password_hash = $1, 
         temp_password_expires_at = NOW() + ($2 || ' hours')::INTERVAL 
     WHERE id = $3`,
    [tempPasswordHash, expiryHours, resetRequest.user_id]
  );

  // Mark request as processed
  await pool.query(
    `UPDATE password_reset_requests 
     SET status = 'processed', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [requestId]
  );

  logger.info(`[PasswordReset] Admin ${req.userId} processed reset request for ${resetRequest.email} (expiry: ${expiryHours}h)`);

  res.json({
    message: 'Temporary password generated successfully',
    requestId,
    userId: resetRequest.user_id,
    userEmail: resetRequest.email,
    userName: resetRequest.full_name,
    tempPassword,
    expiresIn: `${expiryHours} hours`
  });
});
