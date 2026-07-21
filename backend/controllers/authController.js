import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const register = async (req, res) => {
  const { full_name, email, password, country, country_code, phone, company_name } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, country, country_code, phone, company_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, role',
      [full_name, email, password_hash, country, country_code, phone, company_name]
    );
    res.status(201).json({ user: newUser.rows[0] });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ user: { id: user.rows[0].id, full_name: user.rows[0].full_name, role: user.rows[0].role } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const user = await pool.query('SELECT id, full_name, email, country, country_code, phone, company_name, role, avatar_url FROM users WHERE id = $1', [req.userId]);
    if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(user.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  const { full_name, company_name, phone, country_code } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE users SET full_name = $1, company_name = $2, phone = $3, country_code = $4 WHERE id = $5 RETURNING id, full_name, email, country, country_code, phone, company_name, role, avatar_url',
      [full_name, company_name, phone, country_code, req.userId]
    );
    if (updated.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user: updated.rows[0] });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ message: 'Email not found' });
    
    // Insert into password_reset_requests
    await pool.query('INSERT INTO password_reset_requests (user_id, email, status) VALUES ($1, $2, $3)', [user.rows[0].id, email, 'pending']);
    
    res.json({ message: 'Reset request sent to Admin. Please wait for an Admin to provide you with a reset link.' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.userId]);
    res.json({ message: 'Avatar updated successfully', avatar_url: avatarUrl });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getResetRequests = async (req, res) => {
  try {
    const requests = await pool.query(`
      SELECT pr.*, u.full_name 
      FROM password_reset_requests pr 
      JOIN users u ON pr.user_id = u.id 
      ORDER BY pr.created_at DESC
    `);
    res.json(requests.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const generateResetLink = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await pool.query('SELECT * FROM password_reset_requests WHERE id = $1', [id]);
    if (request.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    await pool.query('UPDATE password_reset_requests SET token = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [token, 'approved', id]);
    
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    res.json({ message: 'Reset link generated', resetLink });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const executeResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const request = await pool.query('SELECT * FROM password_reset_requests WHERE token = $1 AND status = $2', [token, 'approved']);
    if (request.rows.length === 0) return res.status(400).json({ message: 'Invalid or expired token' });
    
    const userId = request.rows[0].user_id;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, userId]);
    await pool.query('UPDATE password_reset_requests SET status = $3, updated_at = CURRENT_TIMESTAMP WHERE token = $1 AND status = $2', [token, 'approved', 'processed']);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
