import pool from '../config/db.js';

export const createRating = async (req, res) => {
  const { request_id, supplier_id, score, review } = req.body;
  try {
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
    res.status(500).json({ message: error.message });
  }
};
