import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  updateProfile, 
  uploadAvatar,
  forgotPassword,
  getResetRequests,
  generateResetLink,
  executeResetPassword
} from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

const router = express.Router();

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/profile/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', executeResetPassword);
router.get('/admin/reset-requests', verifyToken, isAdmin, getResetRequests);
router.post('/admin/reset-requests/:id/generate', verifyToken, isAdmin, generateResetLink);

export default router;
