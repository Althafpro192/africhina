import pool from '../config/db.js';
import logger from '../config/logger.js';

// Admin uploads product options
export const uploadRequestOptions = async (req, res) => {
  const { id } = req.params;
  const { product_name, description, price_min, price_max, admin_reason, target_delivery, shipping_method, est_time_sea, est_time_air, is_fixed_price } = req.body;
  const imageUrls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    
    // Allow updating options if waiting for admin or buyer
    if (!['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer'].includes(requestCheck.rows[0].status)) {
      return res.status(400).json({ message: 'Cannot upload options at this stage' });
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
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateRequestOption = async (req, res) => {
  const { id, optionId } = req.params;
  const { product_name, description, price_min, price_max, admin_reason, target_delivery, shipping_method, est_time_sea, est_time_air, is_fixed_price } = req.body;
  
  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

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
      const imageUrls = req.files.map(f => `/uploads/${f.filename}`);
      updateQuery += `, image_url = $11, images = $12`;
      queryParams.push(imageUrls[0], JSON.stringify(imageUrls));
    }

    updateQuery += ` WHERE id = $${queryParams.length + 1} AND request_id = $${queryParams.length + 2} RETURNING *`;
    queryParams.push(optionId, id);

    const updated = await pool.query(updateQuery, queryParams);
    
    if (updated.rows.length === 0) return res.status(404).json({ message: 'Option not found' });
    
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteRequestOption = async (req, res) => {
  const { id, optionId } = req.params;
  
  try {
    const deleted = await pool.query('DELETE FROM request_options WHERE id = $1 AND request_id = $2 RETURNING *', [optionId, id]);
    if (deleted.rows.length === 0) return res.status(404).json({ message: 'Option not found' });
    
    res.json({ message: 'Option deleted successfully' });
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
