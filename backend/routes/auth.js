import express from 'express';
import { register, login, logout, getMe, updateProfile, forgotPassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/forgot-password', forgotPassword);

export default router;
