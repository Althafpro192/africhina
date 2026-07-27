import pool from '../config/db.js';
import logger from '../config/logger.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import storageService from '../config/storage.js';

export const uploadRequestOptions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { product_name, description, price_min, price_max, admin_reason, target_delivery, shipping_method, est_time_sea, est_time_air, is_fixed_price } = req.body;
  
  const imageUrls = [];
  if (req.files) {
    for (const f of req.files) {
      const url = await storageService.upload(f);
      imageUrls.push(url);
    }
  }
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

  const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1', [id]);
  if (requestCheck.rows.length === 0) throw new AppError('Request not found', 404);
  
  if (!['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer'].includes(requestCheck.rows[0].status)) {
    throw new AppError('Cannot upload options at this stage', 400);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      `INSERT INTO request_options 
       (request_id, product_name, description, image_url, images, price_min, price_max, admin_reason, target_delivery, shipping_method, est_time_sea, est_time_air, is_fixed_price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, product_name, description, imageUrl, JSON.stringify(imageUrls), price_min || null, price_max || null, admin_reason, target_delivery || null, shipping_method || null, est_time_sea || null, est_time_air || null, is_fixed_price === 'true']
    );
    
    const updated = await client.query(
      "UPDATE requests SET status = 'menunggu_pemilihan_buyer', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    
    await client.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_pemilihan_buyer', 'Admin has provided product options')", [id]);
    
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

export const updateRequestOption = catchAsync(async (req, res) => {
  const { id, optionId } = req.params;
  const { product_name, description, price_min, price_max, admin_reason, target_delivery, shipping_method, est_time_sea, est_time_air, is_fixed_price } = req.body;
  
  const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1', [id]);
  if (requestCheck.rows.length === 0) throw new AppError('Request not found', 404);

  let updateQuery = `
    UPDATE request_options 
    SET product_name = $1, description = $2, price_min = $3, price_max = $4, 
        admin_reason = $5, target_delivery = $6, shipping_method = $7, 
        est_time_sea = $8, est_time_air = $9, is_fixed_price = $10`;
  const queryParams = [
    product_name, description, price_min || null, price_max || null, 
    admin_reason, target_delivery || null, shipping_method || null, 
    est_time_sea || null, est_time_air || null, is_fixed_price === 'true'
  ];

  if (req.files && req.files.length > 0) {
    const imageUrls = [];
    for (const f of req.files) {
      const url = await storageService.upload(f);
      imageUrls.push(url);
    }
    updateQuery += `, image_url = $11, images = $12`;
    queryParams.push(imageUrls[0], JSON.stringify(imageUrls));
  }

  updateQuery += ` WHERE id = $${queryParams.length + 1} AND request_id = $${queryParams.length + 2} RETURNING *`;
  queryParams.push(optionId, id);

  const updated = await pool.query(updateQuery, queryParams);
  if (updated.rows.length === 0) throw new AppError('Option not found', 404);
  
  res.json(updated.rows[0]);
});

export const deleteRequestOption = catchAsync(async (req, res) => {
  const { id, optionId } = req.params;
  const deleted = await pool.query('DELETE FROM request_options WHERE id = $1 AND request_id = $2 RETURNING *', [optionId, id]);
  if (deleted.rows.length === 0) throw new AppError('Option not found', 404);
  
  res.json({ message: 'Option deleted successfully' });
});

export const finalizeDeal = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { 
    final_price, 
    quoted_price, 
    price_breakdown, 
    bank_name, 
    bank_account_number, 
    bank_account_name, 
    payment_notes 
  } = req.body;

  let paymentQrUrl = null;
  if (req.file) {
    paymentQrUrl = await storageService.upload(req.file);
  } else {
    paymentQrUrl = req.body.payment_qr_url || null;
  }

  const priceToSet = final_price || quoted_price || null;

  const updated = await pool.query(
    `UPDATE requests 
     SET status = 'menunggu_pembayaran', 
         deal_finalized_at = CURRENT_TIMESTAMP, 
         updated_at = CURRENT_TIMESTAMP,
         final_price = $1,
         quoted_price = $1,
         price_breakdown = $2,
         bank_name = $3,
         bank_account_number = $4,
         bank_account_name = $5,
         payment_qr_url = $6,
         payment_notes = $7,
         payment_rejection_reason = NULL
     WHERE id = $8 RETURNING *`,
    [
      priceToSet,
      price_breakdown ? (typeof price_breakdown === 'string' ? price_breakdown : JSON.stringify(price_breakdown)) : null,
      bank_name || null,
      bank_account_number || null,
      bank_account_name || null,
      paymentQrUrl,
      payment_notes || null,
      id
    ]
  );

  if (updated.rows.length === 0) throw new AppError('Request not found', 404);

  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_pembayaran', $2)", [id, `Admin finalized deal with invoice amount USD ${priceToSet || 0}. Waiting for buyer payment.`]);
  res.json(updated.rows[0]);
});

export const shipOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await pool.query(
    "UPDATE requests SET status = 'dikirim', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );
  if (updated.rows.length === 0) throw new AppError('Request not found', 404);
  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'dikirim', 'Order has been shipped.')", [id]);
  res.json(updated.rows[0]);
});

export const completeOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await pool.query(
    "UPDATE requests SET status = 'selesai', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );
  if (updated.rows.length === 0) throw new AppError('Request not found', 404);
  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'selesai', 'Admin verified delivery. Order completed.')", [id]);
  res.json(updated.rows[0]);
});

export const togglePublishRating = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { is_published } = req.body;
  const updated = await pool.query(
    "UPDATE ratings SET is_published = $1 WHERE id = $2 RETURNING *",
    [is_published, id]
  );
  if (updated.rows.length === 0) throw new AppError('Rating not found', 404);
  res.json(updated.rows[0]);
});
