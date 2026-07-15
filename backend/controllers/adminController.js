import pool from '../config/db.js';
import nodemailer from 'nodemailer';

export const getAdminRequests = async (req, res) => {
  try {
    const requests = await pool.query(`
      SELECT r.*, u.full_name as buyer_name, u.company_name as buyer_company, s.company_name as supplier_name 
      FROM requests r 
      JOIN users u ON r.user_id = u.id 
      LEFT JOIN suppliers s ON r.assigned_supplier_id = s.id
      ORDER BY r.created_at DESC
    `);
    res.json(requests.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdminRequest = async (req, res) => {
  const { id } = req.params;
  const { status, assigned_supplier_id, quoted_price, internal_notes, production_progress } = req.body;
  const mediaUrls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : null;

  try {
    let updateQuery = 'UPDATE requests SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let idx = 1;

    if (status) {
      updateQuery += `, status = $${idx++}`;
      values.push(status);
    }
    if (assigned_supplier_id) {
      updateQuery += `, assigned_supplier_id = $${idx++}`;
      values.push(assigned_supplier_id);
    }
    if (quoted_price) {
      updateQuery += `, quoted_price = $${idx++}`;
      values.push(quoted_price);
    }
    if (internal_notes !== undefined) {
      updateQuery += `, internal_notes = $${idx++}`;
      values.push(internal_notes);
    }
    if (production_progress !== undefined) {
      updateQuery += `, production_progress = $${idx++}`;
      values.push(production_progress);
    }
    if (mediaUrls && mediaUrls.length > 0) {
      // append new media
      updateQuery += `, production_media = array_cat(COALESCE(production_media, '{}'), $${idx++})`;
      values.push(mediaUrls);
    }

    updateQuery += ` WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const updated = await pool.query(updateQuery, values);
    if (status) {
       await pool.query("INSERT INTO tracking_logs (request_id, status, notes) VALUES ($1, $2, $3)", [id, status, 'Admin updated status']);
    }
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStatistics = async (req, res) => {
  try {
    const totalRequests = await pool.query('SELECT count(*) FROM requests');
    const statusCounts = await pool.query('SELECT status, count(*) FROM requests GROUP BY status');
    const categoryCounts = await pool.query('SELECT category, count(*) FROM requests GROUP BY category');
    const avgResponseTime = '24h'; // Mock data for now
    
    res.json({
      total: totalRequests.rows[0].count,
      statusBreakdown: statusCounts.rows,
      categoryBreakdown: categoryCounts.rows,
      avgResponseTime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendEmailToSupplier = async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;
  try {
    const requestData = await pool.query('SELECT r.*, s.email as supplier_email FROM requests r JOIN suppliers s ON r.assigned_supplier_id = s.id WHERE r.id = $1', [id]);
    if (requestData.rows.length === 0 || !requestData.rows[0].supplier_email) {
      return res.status(400).json({ message: 'Supplier email not found' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: requestData.rows[0].supplier_email,
      subject,
      text: body
    });

    await pool.query(
      'INSERT INTO email_logs (request_id, sender_id, receiver_email, subject, body) VALUES ($1, $2, $3, $4, $5)',
      [id, req.userId, requestData.rows[0].supplier_email, subject, body]
    );

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
