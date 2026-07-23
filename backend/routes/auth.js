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
  changePassword
} from '../controllers/authController.js';
import { requestPasswordReset } from '../controllers/passwordResetController.js';
import { verifyToken, ensurePasswordChanged } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';
import { validateUploadedFiles } from '../utils/fileTypeVerifier.js';

const router = express.Router();

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

// [FIX Issue 2] Buyer: Request password reset (replaces legacy forgot-password)
// Public endpoint — no auth required, buyer submits email
router.post('/request-password-reset', requestPasswordReset);

// Protected routes requiring authentication & password change check
router.get('/me', verifyToken, ensurePasswordChanged, getMe);
router.put('/profile', verifyToken, ensurePasswordChanged, updateProfile);
router.post('/profile/avatar', verifyToken, ensurePasswordChanged, upload.single('avatar'), validateUploadedFiles, uploadAvatar);

// [NEW] Change / set permanent password (available when mustChangePassword flag is true or false)
router.post('/change-password', verifyToken, changePassword);

export default router;
