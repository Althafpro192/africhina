// [FIX] Keyset Cursor-Based Pagination for Buyer Requests
import logger from '../config/logger.js';
import pool from '../config/db.js';
import multer from 'multer';
import path from 'path';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import storageService from '../config/storage.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.'), false);
  }
};

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const createRequest = catchAsync(async (req, res) => {
  const { 
    product_name, category, sub_category, specifications, 
    quality_requirements, certifications, quantity, unit, 
    currency, budget_range, delivery_timeline, 
    shipping_terms, payment_terms 
  } = req.body;
  
  const imageUrls = [];
  if (req.files) {
    for (const f of req.files) {
      const url = await storageService.upload(f);
      imageUrls.push(url);
    }
  }

  const newReq = await pool.query(
    `INSERT INTO requests (
      user_id, product_name, category, sub_category, specifications, 
      quality_requirements, certifications, quantity, unit, currency, 
      budget_range, delivery_timeline, shipping_terms, payment_terms, image_urls
    ) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
    [
      req.userId, product_name, category, sub_category, specifications, 
      quality_requirements, certifications, quantity, unit, currency, 
      budget_range, delivery_timeline || null, shipping_terms, payment_terms, imageUrls
    ]
  );

  res.status(201).json(newReq.rows[0]);
});

// [FIX] High-Performance Keyset (Cursor-based) Pagination for Buyer Requests
export const getRequests = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const cursor = req.query.cursor;
  const page = req.query.page ? parseInt(req.query.page, 10) : null;

  // Fallback to offset pagination if page is explicitly passed
  if (page && !cursor) {
    const offset = (page - 1) * limit;
    const totalRes = await pool.query('SELECT count(*) FROM requests WHERE user_id = $1', [req.userId]);
    const total = parseInt(totalRes.rows[0].count, 10);

    const requests = await pool.query(
      `SELECT r.*, s.company_name as supplier_name, s.verification_level 
       FROM requests r 
       LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id 
       WHERE r.user_id = $1 
       ORDER BY r.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    return res.json({
      data: requests.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  // Cursor-based Keyset Pagination
  let keysetQuery = `
    SELECT r.*, s.company_name as supplier_name, s.verification_level 
    FROM requests r 
    LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id 
    WHERE r.user_id = $1
  `;
  const queryParams = [req.userId];
  let paramIdx = 2;

  if (cursor) {
    if (cursor.includes('|')) {
      const [cursorTime, cursorId] = cursor.split('|');
      keysetQuery += ` AND (r.created_at, r.id) < ($${paramIdx++}, $${paramIdx++})`;
      queryParams.push(cursorTime, cursorId);
    } else {
      keysetQuery += ` AND r.id < $${paramIdx++}`;
      queryParams.push(cursor);
    }
  }

  keysetQuery += ` ORDER BY r.created_at DESC, r.id DESC LIMIT $${paramIdx}`;
  queryParams.push(limit + 1);

  const result = await pool.query(keysetQuery, queryParams);
  const hasMore = result.rows.length > limit;
  const data = hasMore ? result.rows.slice(0, limit) : result.rows;

  const lastItem = data[data.length - 1];
  const nextCursor = lastItem ? `${lastItem.created_at.toISOString()}|${lastItem.id}` : null;

  res.json({
    data,
    pagination: {
      nextCursor,
      hasMore,
      limit
    }
  });
});

export const getRequestById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const request = await pool.query(
    'SELECT * FROM requests WHERE id = $1 AND user_id = $2',
    [id, req.userId]
  );
  if (request.rows.length === 0) {
    throw new AppError('Request not found', 404);
  }
  
  const options = await pool.query('SELECT * FROM request_options WHERE request_id = $1 ORDER BY created_at ASC', [id]);
  const responseData = request.rows[0];
  responseData.options = options.rows;
  
  delete responseData.assigned_supplier_id;
  delete responseData.internal_notes;
  
  res.json(responseData);
});

export const acceptQuote = catchAsync(async (req, res) => {
  const { id } = req.params;

  const reqData = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
  if (reqData.rows.length === 0) {
    throw new AppError('Request not found', 404);
  }
  if (reqData.rows[0].status !== 'quoted') {
    throw new AppError('Cannot accept quotation at this stage', 400);
  }

  const updated = await pool.query(
    "UPDATE requests SET status = 'approved', quote_accepted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );

  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'approved', 'Buyer accepted quotation')", [id]);
  res.json(updated.rows[0]);
});

export const getTrackingLogs = catchAsync(async (req, res) => {
  const { id } = req.params;
  const logs = await pool.query(
    'SELECT * FROM tracking_logs WHERE request_id = $1 ORDER BY created_at ASC',
    [id]
  );
  res.json(logs.rows);
});

export const editRequestDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const requestCheck = await client.query('SELECT * FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new AppError('Request not found or unauthorized', 404);
    }
    
    if (requestCheck.rows[0].status !== 'menunggu_penawaran_admin') {
      await client.query('ROLLBACK');
      throw new AppError('Cannot edit request at this stage', 400);
    }

    const currentRequest = requestCheck.rows[0];
    const {
      product_name, category, sub_category, description,
      quality_requirements, certifications,
      quantity, unit, budget_range, currency,
      target_delivery, shipping_terms, payment_terms
    } = req.body;

    let imageUrls = currentRequest.image_urls || [];
    if (req.files && req.files.length > 0) {
      imageUrls = [];
      for (const f of req.files) {
        const url = await storageService.upload(f);
        imageUrls.push(url);
      }
    } else if (req.body.keep_images === 'false') {
      imageUrls = [];
    }

    const updated = await client.query(
      `UPDATE requests SET 
        product_name = COALESCE($1, product_name),
        category = COALESCE($2, category),
        sub_category = COALESCE($3, sub_category),
        specifications = COALESCE($4, specifications),
        quality_requirements = COALESCE($5, quality_requirements),
        certifications = COALESCE($6, certifications),
        quantity = COALESCE($7, quantity),
        unit = COALESCE($8, unit),
        budget_range = COALESCE($9, budget_range),
        currency = COALESCE($10, currency),
        delivery_timeline = COALESCE($11, delivery_timeline),
        shipping_terms = COALESCE($12, shipping_terms),
        payment_terms = COALESCE($13, payment_terms),
        image_urls = $14,
        updated_at = NOW()
       WHERE id = $15 RETURNING *`,
      [
        product_name, category, sub_category, description,
        quality_requirements, certifications,
        quantity, unit, budget_range, currency,
        target_delivery, shipping_terms, payment_terms,
        imageUrls, id
      ]
    );

    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const updateRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const requestCheck = await client.query('SELECT * FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new AppError('Not authorized to update this request', 403);
    }
    
    const request = requestCheck.rows[0];
    
    if (status === 'rejected' && request.status !== 'quoted') {
      await client.query('ROLLBACK');
      throw new AppError('Can only reject a quoted request', 400);
    }
    
    if (status === 'completed' && request.status !== 'shipped') {
      await client.query('ROLLBACK');
      throw new AppError('Can only confirm delivery for a shipped request', 400);
    }

    const updated = await client.query(
      'UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    await client.query(
      'INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, $2, $3)',
      [id, status, status === 'completed' ? 'Delivery confirmed by buyer' : 'Quotation rejected by buyer']
    );

    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const deleteRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
  if (requestCheck.rows.length === 0) {
    throw new AppError('Not authorized to delete this request', 403);
  }
  
  if (requestCheck.rows[0].status !== 'pending') {
    throw new AppError('Only pending requests can be deleted', 400);
  }
  
  await pool.query('DELETE FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
  res.json({ message: 'Request deleted successfully' });
});
