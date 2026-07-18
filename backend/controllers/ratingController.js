import logger from '../config/logger.js';
import pool from '../config/db.js';

export const createRating = async (req, res) => {
  const { request_id, supplier_id, score, review } = req.body;
  try {
    // Check if buyer already rated this request
    const existing = await pool.query(
      'SELECT id FROM ratings WHERE request_id = $1 AND buyer_id = $2',
      [request_id, req.userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'You have already rated this request' });
    }

    const newRating = await pool.query(
      'INSERT INTO ratings (request_id, supplier_id, buyer_id, score, review) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [request_id, supplier_id, req.userId, score, review]
    );

    // Update supplier average rating
    await pool.query(`
      UPDATE suppliers 
      SET avg_rating = (SELECT AVG(score) FROM ratings WHERE supplier_id = $1)
      WHERE id = $1
    `, [supplier_id]);

    res.status(201).json(newRating.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRatingsBySupplier = async (req, res) => {
  try {
    const ratings = await pool.query(
      `SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company
       FROM ratings r JOIN users u ON r.buyer_id = u.id
       WHERE r.supplier_id = $1 ORDER BY r.created_at DESC`,
      [req.params.supplierId]
    );
    res.json(ratings.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRatingByRequest = async (req, res) => {
  try {
    const rating = await pool.query(
      'SELECT * FROM ratings WHERE request_id = $1 AND buyer_id = $2',
      [req.params.requestId, req.userId]
    );
    res.json(rating.rows[0] || null);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await pool.query(
      `SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company
       FROM ratings r JOIN users u ON r.buyer_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(ratings.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
