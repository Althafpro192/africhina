import express from 'express';
import { getAdminRequests, updateAdminRequest, getAdminStatistics, sendEmailToSupplier } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { upload } from '../controllers/requestController.js';

const router = express.Router();

router.use(verifyToken, isAdmin);
router.get('/requests', getAdminRequests);
router.put('/requests/:id', upload.array('qc_images', 5), updateAdminRequest);
router.get('/statistics', getAdminStatistics);
router.post('/requests/:id/email', sendEmailToSupplier);

export default router;
