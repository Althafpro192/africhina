import pool from '../config/db.js';
import logger from '../config/logger.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const selectOption = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { option_ids, buyer_notes } = req.body;
  
  const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
  if (requestCheck.rows.length === 0) throw new AppError('Request not found', 404);
  if (requestCheck.rows[0].status !== 'menunggu_pemilihan_buyer') {
    throw new AppError('Invalid status for selecting option', 400);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    if (option_ids && option_ids.length > 0) {
      await client.query(
        "UPDATE request_options SET is_selected = true WHERE id = ANY($1)",
        [option_ids]
      );
      const updated = await client.query(
        "UPDATE requests SET status = 'menunggu_kesepakatan_final', buyer_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [buyer_notes || null, id]
      );
      await client.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_kesepakatan_final', $2)", [id, `Buyer selected ${option_ids.length} option(s). Note: ${buyer_notes || 'None'}`]);
      
      await client.query('COMMIT');
      res.json(updated.rows[0]);
    } else {
      const updated = await client.query(
        "UPDATE requests SET status = 'menunggu_penawaran_admin', buyer_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [buyer_notes || null, id]
      );
      await client.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_penawaran_admin', $2)", [id, `Buyer requested alternative options. Note: ${buyer_notes || 'None'}`]);
      
      await client.query('COMMIT');
      res.json(updated.rows[0]);
    }
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

export const confirmDelivery = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
  if (requestCheck.rows.length === 0) throw new AppError('Request not found', 404);
  if (requestCheck.rows[0].status !== 'dikirim') {
    throw new AppError('Order is not yet shipped', 400);
  }

  const updated = await pool.query(
    "UPDATE requests SET status = 'menunggu_verifikasi_admin', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );

  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_verifikasi_admin', 'Buyer confirmed physical delivery. Waiting for Admin verification.')", [id]);
  res.json(updated.rows[0]);
});

export const cancelRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) throw new AppError('Reason is required for cancellation', 400);

  const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
  if (requestCheck.rows.length === 0) throw new AppError('Request not found', 404);
  
  const allowedStatuses = ['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final'];
  if (!allowedStatuses.includes(requestCheck.rows[0].status)) {
    throw new AppError('Cannot cancel request at this stage', 400);
  }

  const updated = await pool.query(
    "UPDATE requests SET status = 'batal', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );

  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'batal', $2)", [id, `Buyer Cancelled: ${reason}`]);
  res.json(updated.rows[0]);
});

export const disputeRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) throw new AppError('Reason is required for dispute', 400);

  const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
  if (requestCheck.rows.length === 0) throw new AppError('Request not found', 404);
  
  if (!['dikirim', 'menunggu_verifikasi_admin'].includes(requestCheck.rows[0].status)) {
    throw new AppError('Can only dispute when order is shipped or waiting for admin verification', 400);
  }

  const updated = await pool.query(
    "UPDATE requests SET status = 'dispute', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );

  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'dispute', $2)", [id, `Buyer Disputed: ${reason}`]);
  res.json(updated.rows[0]);
});
