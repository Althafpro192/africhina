import pool from '../config/db.js';
import logger from '../config/logger.js';

export const uploadPaymentProof = async (req, res) => {
  const { id: requestId } = req.params;
  const paymentProofUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!paymentProofUrl) return res.status(400).json({ message: 'Payment proof file is required' });

  try {
    const requestCheck = await pool.query('SELECT status, deal_finalized_at, quoted_price, currency FROM requests WHERE id = $1 AND user_id = $2', [requestId, req.userId]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    if (requestCheck.rows[0].status !== 'menunggu_pembayaran' || !requestCheck.rows[0].deal_finalized_at) {
      return res.status(400).json({ message: 'Payment is not yet finalized by admin' });
    }

    const { quoted_price, currency } = requestCheck.rows[0];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create payment record
      await client.query(
        "INSERT INTO payments (request_id, amount, currency, payment_proof_url, status) VALUES ($1, $2, $3, $4, 'pending')",
        [requestId, quoted_price, currency, paymentProofUrl]
      );

      // Update request status
      const updated = await client.query(
        "UPDATE requests SET payment_proof_url = $1, status = 'menunggu_verifikasi_pembayaran', updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [paymentProofUrl, requestId]
      );

      await client.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_verifikasi_pembayaran', 'Buyer has uploaded payment proof to escrow')", [requestId]);
      
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

export const verifyPayment = async (req, res) => {
  const { id: requestId } = req.params;
  try {
    // get payment record
    const paymentCheck = await pool.query("SELECT * FROM payments WHERE request_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1", [requestId]);
    if (paymentCheck.rows.length === 0) return res.status(404).json({ message: 'Pending payment not found for this request' });
    
    const payment = paymentCheck.rows[0];
    const paymentId = payment.id;

    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1', [requestId]);
    if (requestCheck.rows.length === 0 || requestCheck.rows[0].status !== 'menunggu_verifikasi_pembayaran') {
       return res.status(400).json({ message: 'Request is not waiting for payment verification' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update payment
      await client.query(
        "UPDATE payments SET status = 'verified', verified_by = $1, verified_at = CURRENT_TIMESTAMP WHERE id = $2",
        [req.userId, paymentId]
      );

      // Update request
      const updated = await client.query(
        "UPDATE requests SET status = 'sedang_diproses', payment_rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        [requestId]
      );

      await client.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'sedang_diproses', 'Payment verified by Admin. Order is now in production/processing.')", [requestId]);

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

export const rejectPayment = async (req, res) => {
  const { id: requestId } = req.params;
  const { reason } = req.body;

  if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

  try {
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1', [requestId]);
    if (requestCheck.rows.length === 0 || requestCheck.rows[0].status !== 'menunggu_verifikasi_pembayaran') {
       return res.status(400).json({ message: 'Request is not waiting for payment verification' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update latest pending payment if exists
      await client.query(
        "UPDATE payments SET status = 'rejected' WHERE request_id = $1 AND status = 'pending'",
        [requestId]
      );

      // Reset request status back to Waiting Payment and store rejection reason
      const updated = await client.query(
        "UPDATE requests SET status = 'menunggu_pembayaran', payment_rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [reason, requestId]
      );

      await client.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'menunggu_pembayaran', $2)", [requestId, `Payment proof rejected by Admin: ${reason}`]);

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

export const getBuyerPayments = async (req, res) => {
  const { requestId } = req.params;
  try {
    const requestCheck = await pool.query('SELECT id FROM requests WHERE id = $1 AND user_id = $2', [requestId, req.userId]);
    if (requestCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    const payments = await pool.query('SELECT * FROM payments WHERE request_id = $1 ORDER BY created_at DESC', [requestId]);
    res.json(payments.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAdminPayments = async (req, res) => {
  const { requestId } = req.params;
  try {
    const payments = await pool.query('SELECT * FROM payments WHERE request_id = $1 ORDER BY created_at DESC', [requestId]);
    res.json(payments.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
