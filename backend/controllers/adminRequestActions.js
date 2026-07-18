import pool from '../config/db.js';
import logger from '../config/logger.js';

// Admin uploads product options
export const uploadRequestOptions = async (req, res) => {
  const { id } = req.params;
  const options = req.body.options; // Array of { product_name, description, price_min, price_max }
  // Note: in a real scenario we'd parse images too, but for simplicity assuming JSON with image_url or handling it via array

  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    
    // Allow updating options if waiting for admin or buyer
    if (!['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer'].includes(requestCheck.rows[0].status)) {
      return res.status(400).json({ message: 'Cannot upload options at this stage' });
    }

    // Insert options
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const opt of options) {
        await client.query(
          'INSERT INTO request_options (request_id, product_name, description, image_url, price_min, price_max) VALUES ($1, $2, $3, $4, $5, $6)',
          [id, opt.product_name, opt.description, opt.image_url, opt.price_min, opt.price_max]
        );
      }
      
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
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const finalizeDeal = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await pool.query(
      "UPDATE requests SET status = 'menunggu_pembayaran', deal_finalized_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_pembayaran', 'Admin finalized deal. Waiting for buyer payment.')", [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const shipOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await pool.query(
      "UPDATE requests SET status = 'dikirim', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'dikirim', 'Order has been shipped.')", [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const completeOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await pool.query(
      "UPDATE requests SET status = 'selesai', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'selesai', 'Admin verified delivery. Order completed.')", [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const togglePublishRating = async (req, res) => {
  const { id } = req.params;
  const { is_published } = req.body;
  try {
    const updated = await pool.query(
      "UPDATE ratings SET is_published = $1 WHERE id = $2 RETURNING *",
      [is_published, id]
    );
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
