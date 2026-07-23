import express from 'express';
import { uploadPaymentProof, verifyPayment, rejectPayment, getBuyerPayments, getAdminPayments } from '../controllers/paymentController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { upload } from '../controllers/requestController.js';

const router = express.Router();

router.use(verifyToken);

// Buyer routes
router.post('/requests/:id', upload.single('payment_proof'), uploadPaymentProof);
router.get('/requests/:requestId', getBuyerPayments);

// Admin routes
router.put('/admin/:id/verify', isAdmin, verifyPayment);
router.put('/admin/:id/reject', isAdmin, rejectPayment);
router.get('/admin/requests/:requestId', isAdmin, getAdminPayments);

export default router;
