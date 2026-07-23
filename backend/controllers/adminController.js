// [FIX] Keyset Cursor-Based Pagination, Temp Password Regeneration, TEMP_PASSWORD_EXPIRY_HOURS env var
import logger from '../config/logger.js';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import storageService from '../config/storage.js';

// [FIX] Keyset (Cursor-based) Pagination for Admin Requests
export const getAdminRequests = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const cursor = req.query.cursor; // Last item ID or created_at string
  const statusFilter = req.query.status;
  const page = req.query.page ? parseInt(req.query.page, 10) : null;

  // If offset page is explicitly requested (fallback for legacy UI)
  if (page && !cursor) {
    const offset = (page - 1) * limit;
    let countQuery = 'SELECT count(*) FROM requests';
    let dataQuery = `
      SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company, s.company_name as supplier_name 
      FROM requests r 
      JOIN users u ON r.user_id = u.id 
      LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id
    `;
    const queryParams = [];
    const countParams = [];

    if (statusFilter) {
      countQuery += ' WHERE status = $1';
      dataQuery += ' WHERE r.status = $1';
      queryParams.push(statusFilter);
      countParams.push(statusFilter);
    }

    dataQuery += ` ORDER BY r.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const totalRes = await pool.query(countQuery, countParams);
    const total = parseInt(totalRes.rows[0].count, 10);
    const requests = await pool.query(dataQuery, queryParams);

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

  // [FIX] High-Performance Keyset (Cursor-based) Pagination: WHERE (created_at, id) < (cursor_created_at, cursor_id)
  let keysetQuery = `
    SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company, s.company_name as supplier_name 
    FROM requests r 
    JOIN users u ON r.user_id = u.id 
    LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id
  `;

  const whereConditions = [];
  const queryParams = [];
  let paramIdx = 1;

  if (statusFilter) {
    whereConditions.push(`r.status = $${paramIdx++}`);
    queryParams.push(statusFilter);
  }

  if (cursor) {
    // Expect cursor in format "created_at|id" or uuid
    if (cursor.includes('|')) {
      const [cursorTime, cursorId] = cursor.split('|');
      whereConditions.push(`(r.created_at, r.id) < ($${paramIdx++}, $${paramIdx++})`);
      queryParams.push(cursorTime, cursorId);
    } else {
      whereConditions.push(`r.id < $${paramIdx++}`);
      queryParams.push(cursor);
    }
  }

  if (whereConditions.length > 0) {
    keysetQuery += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  keysetQuery += ` ORDER BY r.created_at DESC, r.id DESC LIMIT $${paramIdx}`;
  queryParams.push(limit + 1); // Fetch limit + 1 to determine hasMore

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

export const getAdminRequestById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const request = await pool.query(`
    SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company, u.email as buyer_email,
           s.company_name as supplier_name, s.verification_level, s.factory_address 
    FROM requests r 
    JOIN users u ON r.user_id = u.id 
    LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id
    WHERE r.id = $1
  `, [id]);
  
  if (request.rows.length === 0) {
    throw new AppError('Request not found', 404);
  }
  
  const options = await pool.query('SELECT * FROM request_options WHERE request_id = $1 ORDER BY created_at ASC', [id]);
  const responseData = request.rows[0];
  responseData.options = options.rows;
  
  res.json(responseData);
});

export const updateAdminRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, assigned_supplier_id, quoted_price, internal_notes, production_progress } = req.body;

  const setClauses = ['updated_at = CURRENT_TIMESTAMP'];
  const values = [];
  let idx = 1;

  if (status !== undefined) {
    setClauses.push(`status = $${idx++}`);
    values.push(status);
  }
  if (assigned_supplier_id !== undefined) {
    setClauses.push(`assigned_supplier_id = $${idx++}`);
    values.push(assigned_supplier_id);
  }
  if (quoted_price !== undefined) {
    setClauses.push(`quoted_price = $${idx++}`);
    values.push(quoted_price);
  }
  if (internal_notes !== undefined) {
    setClauses.push(`internal_notes = $${idx++}`);
    values.push(internal_notes);
  }
  if (production_progress !== undefined) {
    setClauses.push(`production_progress = $${idx++}`);
    values.push(production_progress);
  }

  values.push(id);
  const updateQuery = `UPDATE requests SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;

  const updated = await pool.query(updateQuery, values);
  if (updated.rows.length === 0) {
    throw new AppError('Request not found', 404);
  }

  if (status) {
    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, $2, $3)", [id, status, 'Admin updated status']);
  }
  
  res.json(updated.rows[0]);
});

// [FIX] Requirement 4 & Enhancement 1: Admin Temp Password Generation & Overwrite/Regeneration with Configurable Expiry
export const generateTempPassword = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const userCheck = await pool.query('SELECT id, email, full_name FROM users WHERE id = $1', [userId]);
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  // Configurable Expiry via Environment Variable
  const expiryHours = parseInt(process.env.TEMP_PASSWORD_EXPIRY_HOURS, 10) || 24;

  // Generate new cryptographically secure 12-character temporary password
  const rawBytes = crypto.randomBytes(6);
  const tempPassword = rawBytes.toString('hex');

  const salt = await bcrypt.genSalt(10);
  const tempPasswordHash = await bcrypt.hash(tempPassword, salt);

  // Overwrite existing hash and reset expiry window (invalidates old temp password if regenerated)
  await pool.query(
    `UPDATE users 
     SET temp_password_hash = $1, 
         temp_password_expires_at = NOW() + ($2 || ' hours')::INTERVAL 
     WHERE id = $3`,
    [tempPasswordHash, expiryHours, userId]
  );

  logger.info(`[AdminAuth] Admin ${req.userId} regenerated temporary password for Buyer user ${userId} (expiry: ${expiryHours}h)`);

  res.json({
    message: 'Temporary password generated successfully',
    userId,
    userEmail: userCheck.rows[0].email,
    tempPassword,
    expiresIn: `${expiryHours} hours`
  });
});

export const getAdminStatistics = catchAsync(async (req, res) => {
  const totalRequests = await pool.query('SELECT count(*) FROM requests');
  const pendingRequests = await pool.query("SELECT count(*) FROM requests WHERE status IN ('menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final', 'menunggu_pembayaran', 'menunggu_verifikasi_pembayaran')");
  const processingRequests = await pool.query("SELECT count(*) FROM requests WHERE status IN ('sedang_diproses', 'dikirim', 'menunggu_verifikasi_admin')");
  const completedRequests = await pool.query("SELECT count(*) FROM requests WHERE status = 'selesai'");
  const statusCounts = await pool.query('SELECT status, count(*) FROM requests GROUP BY status');
  const categoryCounts = await pool.query('SELECT category, count(*) FROM requests GROUP BY category');
  
  res.json({
    total_requests: parseInt(totalRequests.rows[0].count, 10),
    pending_requests: parseInt(pendingRequests.rows[0].count, 10),
    processing_requests: parseInt(processingRequests.rows[0].count, 10),
    completed_requests: parseInt(completedRequests.rows[0].count, 10),
    statusBreakdown: statusCounts.rows,
    categoryBreakdown: categoryCounts.rows,
    avgResponseTime: '24h'
  });
});

export const sendEmailToSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  const requestData = await pool.query(
    'SELECT r.*, s.email as supplier_email FROM requests r JOIN suppliers s ON r.assigned_supplier_id = s.id WHERE r.id = $1',
    [id]
  );
  if (requestData.rows.length === 0 || !requestData.rows[0].supplier_email) {
    throw new AppError('Supplier email not found', 400);
  }

  await pool.query(
    'INSERT INTO email_logs (request_id, sender_id, receiver_email, subject, body) VALUES ($1, $2, $3, $4, $5)',
    [id, req.userId, requestData.rows[0].supplier_email, subject, body]
  );

  res.json({ message: 'Email queued/sent successfully' });
});

export const uploadQCMedia = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const mediaUrls = [];
  if (req.files) {
    for (const f of req.files) {
      const url = await storageService.upload(f);
      mediaUrls.push(url);
    }
  }

  if (mediaUrls.length === 0) {
    throw new AppError('No media files uploaded', 400);
  }

  const updated = await pool.query(
    "UPDATE requests SET production_media = array_cat(COALESCE(production_media, '{}'), $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [mediaUrls, id]
  );
  await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'qc_update', 'Admin uploaded new QC media')", [id]);
  
  res.json(updated.rows[0]);
});

// [NEW Issue 3] Get paginated list of all buyers for admin chat sidebar
export const getBuyerList = catchAsync(async (req, res) => {
  const search = req.query.search || '';
  const limit = parseInt(req.query.limit, 10) || 100;
  const offset = parseInt(req.query.offset, 10) || 0;

  let query = `
    SELECT u.id, u.full_name, u.email, u.avatar_url, u.is_blocked, u.created_at, u.phone, u.company_name,
           lm.content as last_message, lm.created_at as last_message_at
    FROM users u
    LEFT JOIN LATERAL (
      SELECT content, created_at 
      FROM messages 
      WHERE buyer_id = u.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) lm ON true
    WHERE u.role = 'buyer'
  `;
  const params = [];
  let paramIdx = 1;

  if (search) {
    query += ` AND (u.full_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx} OR u.company_name ILIKE $${paramIdx})`;
    params.push(`%${search}%`);
    paramIdx++;
  }

  query += ` ORDER BY COALESCE(lm.created_at, u.created_at) DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  let countQuery = `SELECT count(*) FROM users WHERE role = 'buyer'`;
  const countParams = [];
  if (search) {
    countQuery += ` AND (full_name ILIKE $1 OR email ILIKE $1 OR company_name ILIKE $1)`;
    countParams.push(`%${search}%`);
  }
  const totalRes = await pool.query(countQuery, countParams);

  res.json({
    data: result.rows,
    total: parseInt(totalRes.rows[0].count, 10)
  });
});

// [NEW Issue 3] Get full buyer profile with stats
export const getBuyerProfile = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const userRes = await pool.query(
    `SELECT id, full_name, email, phone, avatar_url, company_name, country, country_code, is_blocked, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (userRes.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const user = userRes.rows[0];

  // Get stats
  const totalOrders = await pool.query(
    'SELECT count(*) FROM requests WHERE user_id = $1',
    [userId]
  );
  const totalSpent = await pool.query(
    "SELECT COALESCE(SUM(quoted_price), 0) as total FROM requests WHERE user_id = $1 AND status = 'selesai'",
    [userId]
  );

  // Get recent requests as activities
  const recentActivities = await pool.query(
    `SELECT id, product_name, status, created_at, updated_at
     FROM requests WHERE user_id = $1
     ORDER BY updated_at DESC LIMIT 5`,
    [userId]
  );

  res.json({
    ...user,
    stats: {
      total_orders: parseInt(totalOrders.rows[0].count, 10),
      total_spent: parseFloat(totalSpent.rows[0].total),
      joined_date: user.created_at
    },
    recent_activities: recentActivities.rows
  });
});

// [NEW Issue 4] Toggle block/unblock a buyer
export const toggleBlockUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const userCheck = await pool.query('SELECT id, is_blocked, role FROM users WHERE id = $1', [userId]);
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found', 404);
  }
  if (userCheck.rows[0].role === 'admin') {
    throw new AppError('Cannot block an admin user', 400);
  }

  const newBlockedState = !userCheck.rows[0].is_blocked;

  await pool.query(
    'UPDATE users SET is_blocked = $1 WHERE id = $2',
    [newBlockedState, userId]
  );

  logger.info(`[AdminBlock] Admin ${req.userId} ${newBlockedState ? 'blocked' : 'unblocked'} user ${userId}`);

  res.json({
    message: `User ${newBlockedState ? 'blocked' : 'unblocked'} successfully`,
    userId,
    is_blocked: newBlockedState
  });
});
