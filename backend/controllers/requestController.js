import pool from '../config/db.js';
import multer from 'multer';
import path from 'path';

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
export const upload = multer({ storage: storage });

export const createRequest = async (req, res) => {
  const { product_name, category, specifications, quantity, budget_range } = req.body;
  const imageUrls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
  
  try {
    const newReq = await pool.query(
      `INSERT INTO requests (user_id, product_name, category, specifications, quantity, budget_range, image_urls) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, product_name, category, specifications, quantity, budget_range, imageUrls]
    );
    res.status(201).json(newReq.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await pool.query(
      'SELECT r.*, s.company_name as supplier_name, s.verification_level, s.factory_address FROM requests r LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id WHERE r.id = $1 AND r.user_id = $2',
      [req.params.id, req.userId]
    );
    if (request.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    res.json(request.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};
