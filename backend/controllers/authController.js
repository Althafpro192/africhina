import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const register = async (req, res) => {
  const { full_name, email, password, country, phone, company_name } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, country, phone, company_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role',
      [full_name, email, password_hash, country, phone, company_name]
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
    const user = await pool.query('SELECT id, full_name, email, country, phone, company_name, role FROM users WHERE id = $1', [req.userId]);
    if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(user.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  const { full_name, company_name, phone } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE users SET full_name = $1, company_name = $2, phone = $3 WHERE id = $4 RETURNING id, full_name, email, country, phone, company_name, role',
      [full_name, company_name, phone, req.userId]
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
    
    // In a real app, generate a reset token and send an email here.
    // For this MVP, we simulate a successful email send.
    res.json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
