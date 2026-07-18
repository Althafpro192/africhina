import logger from '../config/logger.js';
import pool from '../config/db.js';
import multer from 'multer';
import path from 'path';

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

export const createRequest = async (req, res) => {
  const { 
    product_name, category, sub_category, specifications, 
    quality_requirements, certifications, quantity, unit, 
    currency, budget_range, delivery_timeline, 
    shipping_terms, payment_terms 
  } = req.body;
  
  const imageUrls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

  try {
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
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await pool.query(
      'SELECT r.*, s.company_name as supplier_name, s.verification_level FROM requests r LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id WHERE r.user_id = $1 ORDER BY r.created_at DESC',
      [req.userId]
    );
    res.json(requests.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await pool.query(
      'SELECT * FROM requests WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (request.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    
    // Fetch options
    const options = await pool.query('SELECT * FROM request_options WHERE request_id = $1 ORDER BY created_at ASC', [req.params.id]);
    const responseData = request.rows[0];
    responseData.options = options.rows;
    
    // IMPORTANT: Security measure. Ensure we never leak supplier info to the buyer.
    delete responseData.assigned_supplier_id;
    delete responseData.internal_notes;
    
    res.json(responseData);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const acceptQuote = async (req, res) => {
  try {
    const reqData = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (reqData.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    if (reqData.rows[0].status !== 'quoted') return res.status(400).json({ message: 'Cannot accept, status is not quoted' });

    const updated = await pool.query(
      "UPDATE requests SET status = 'approved', quote_accepted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, 'approved', 'Buyer accepted quotation')", [req.params.id]);
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTrackingLogs = async (req, res) => {
  try {
    const logs = await pool.query(
      'SELECT * FROM tracking_logs WHERE request_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(logs.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if request belongs to buyer
    const requestCheck = await client.query('SELECT * FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }
    
    const request = requestCheck.rows[0];
    
    if (status === 'rejected' && request.status !== 'quoted') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Can only reject a quoted request' });
    }
    
    if (status === 'completed' && request.status !== 'shipped') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Can only confirm delivery for a shipped request' });
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
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    client.release();
  }
};

export const deleteRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if request belongs to buyer and is pending
    const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (requestCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }
    
    if (requestCheck.rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be deleted' });
    }
    
    await pool.query('DELETE FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
