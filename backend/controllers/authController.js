// [FIX] Priority 0: Buyer Login Temporary Password Flow & Legacy Reset Code Removal
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import storageService from '../config/storage.js';

export const register = catchAsync(async (req, res) => {
  const { full_name, email, password, country, country_code, phone, company_name } = req.body;

  const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userExists.rows.length > 0) {
    throw new AppError('User already exists', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  
  const newUser = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, country, country_code, phone, company_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, role',
    [full_name, email, password_hash, country, country_code, phone, company_name]
  );

  res.status(201).json({ user: newUser.rows[0] });
});

// [FIX] Requirement 4: Buyer Login Modification for Temp Password
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const userRes = await pool.query(
    'SELECT id, full_name, email, role, password_hash, temp_password_hash, temp_password_expires_at FROM users WHERE email = $1',
    [email]
  );

  if (userRes.rows.length === 0) {
    throw new AppError('Invalid credentials', 400);
  }

  const user = userRes.rows[0];
  let isTempPasswordLogin = false;

  // 1. Check permanent password hash first
  const validPermanentPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!validPermanentPassword) {
    // 2. Check temporary password if permanent password fails
    if (user.temp_password_hash && user.temp_password_expires_at) {
      const isExpired = new Date(user.temp_password_expires_at).getTime() < Date.now();
      if (!isExpired) {
        const validTempPassword = await bcrypt.compare(password, user.temp_password_hash);
        if (validTempPassword) {
          isTempPasswordLogin = true;
        }
      }
    }

    if (!isTempPasswordLogin) {
      throw new AppError('Invalid credentials', 400);
    }
  }

  const mustChangePassword = isTempPasswordLogin;

  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role, 
      mustChangePassword 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.json({
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      mustChangePassword
    },
    token
  });
});

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = catchAsync(async (req, res) => {
  const user = await pool.query(
    'SELECT id, full_name, email, country, country_code, phone, company_name, role, avatar_url FROM users WHERE id = $1',
    [req.userId]
  );
  
  if (user.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const userData = user.rows[0];
  userData.mustChangePassword = req.mustChangePassword || false;
  res.json(userData);
});

export const updateProfile = catchAsync(async (req, res) => {
  const { full_name, company_name, phone, country_code } = req.body;

  const updated = await pool.query(
    'UPDATE users SET full_name = $1, company_name = $2, phone = $3, country_code = $4 WHERE id = $5 RETURNING id, full_name, email, country, country_code, phone, company_name, role, avatar_url',
    [full_name, company_name, phone, country_code, req.userId]
  );

  if (updated.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  res.json({ message: 'Profile updated successfully', user: updated.rows[0] });
});

// [NEW] Requirement 4: Force Change Permanent Password
export const changePassword = catchAsync(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  // Update permanent password and clear temporary password fields
  await pool.query(
    `UPDATE users 
     SET password_hash = $1, 
         temp_password_hash = NULL, 
         temp_password_expires_at = NULL 
     WHERE id = $2`,
    [newPasswordHash, req.userId]
  );

  // Issue new JWT token without mustChangePassword flag
  const userRes = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = $1', [req.userId]);
  const user = userRes.rows[0];

  const newToken = jwt.sign(
    { id: user.id, role: user.role, mustChangePassword: false },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.cookie('token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({
    message: 'Password changed successfully',
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      mustChangePassword: false
    },
    token: newToken
  });
});

export const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const avatarUrl = await storageService.upload(req.file);
  await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.userId]);

  res.json({ message: 'Avatar updated successfully', avatar_url: avatarUrl });
});
