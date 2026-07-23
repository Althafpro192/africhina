import logger from '../config/logger.js';
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const createRating = catchAsync(async (req, res) => {
  const { request_id, supplier_id, score, review } = req.body;

  const existing = await pool.query(
    'SELECT id FROM ratings WHERE request_id = $1 AND buyer_id = $2',
    [request_id, req.userId]
  );
  if (existing.rows.length > 0) {
    throw new AppError('You have already rated this request', 400);
  }

  const newRating = await pool.query(
    'INSERT INTO ratings (request_id, supplier_id, buyer_id, score, review) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [request_id, supplier_id, req.userId, score, review]
  );

  await pool.query(`
    UPDATE suppliers 
    SET avg_rating = (SELECT AVG(score) FROM ratings WHERE supplier_id = $1)
    WHERE id = $1
  `, [supplier_id]);

  res.status(201).json(newRating.rows[0]);
});

export const getRatingsBySupplier = catchAsync(async (req, res) => {
  const { supplierId } = req.params;
  const ratings = await pool.query(
    `SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company
     FROM ratings r JOIN users u ON r.buyer_id = u.id
     WHERE r.supplier_id = $1 ORDER BY r.created_at DESC`,
    [supplierId]
  );
  res.json(ratings.rows);
});

export const getRatingByRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const rating = await pool.query(
    'SELECT * FROM ratings WHERE request_id = $1 AND buyer_id = $2',
    [requestId, req.userId]
  );
  res.json(rating.rows[0] || null);
});

export const getAllRatings = catchAsync(async (req, res) => {
  const ratings = await pool.query(
    `SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company
     FROM ratings r JOIN users u ON r.buyer_id = u.id
     ORDER BY r.created_at DESC`
  );
  res.json(ratings.rows);
});
