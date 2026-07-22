import pool from '../config/db.js';
import logger from '../config/logger.js';

// Buyer selects options
export const selectOption = async (req, res) => {
  const { id } = req.params;
  const { option_ids, buyer_notes } = req.body;
  
  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    if (requestCheck.rows[0].status !== 'menunggu_pemilihan_buyer') {
      return res.status(400).json({ message: 'Invalid status for selecting option' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      if (option_ids && option_ids.length > 0) {
        // Mark selected options
        await client.query(
          "UPDATE request_options SET is_selected = true WHERE id = ANY($1)",
          [option_ids]
        );
        // Update request status to negotiation and save buyer notes
        const updated = await client.query(
          "UPDATE requests SET status = 'menunggu_kesepakatan_final', buyer_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
          [buyer_notes || null, id]
        );
        await client.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_kesepakatan_final', $2)", [id, `Buyer selected ${option_ids.length} option(s). Note: ${buyer_notes || 'None'}`]);
        
        await client.query('COMMIT');
        res.json(updated.rows[0]);
      } else {
        // Buyer requested alternative options
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
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Buyer confirms delivery
export const confirmDelivery = async (req, res) => {
  const { id } = req.params;
  
  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    if (requestCheck.rows[0].status !== 'dikirim') {
      return res.status(400).json({ message: 'Order is not yet shipped' });
    }

    // RULE-01: Must change to menunggu_verifikasi_admin, NOT selesai
    const updated = await pool.query(
      "UPDATE requests SET status = 'menunggu_verifikasi_admin', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_verifikasi_admin', 'Buyer confirmed physical delivery. Waiting for Admin verification.')", [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Buyer cancels request
export const cancelRequest = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) return res.status(400).json({ message: 'Reason is required for cancellation' });

  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    
    const allowedStatuses = ['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final'];
    if (!allowedStatuses.includes(requestCheck.rows[0].status)) {
      return res.status(400).json({ message: 'Cannot cancel request at this stage' });
    }

    const updated = await pool.query(
      "UPDATE requests SET status = 'batal', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'batal', $2)", [id, `Buyer Cancelled: ${reason}`]);
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Buyer disputes request
export const disputeRequest = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) return res.status(400).json({ message: 'Reason is required for dispute' });

  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    
    if (!['dikirim', 'menunggu_verifikasi_admin'].includes(requestCheck.rows[0].status)) {
      return res.status(400).json({ message: 'Can only dispute when order is shipped or waiting for admin verification' });
    }

    const updated = await pool.query(
      "UPDATE requests SET status = 'dispute', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'dispute', $2)", [id, `Buyer Disputed: ${reason}`]);
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
