import express from 'express';
import { 
  getAdminRequests, 
  getAdminRequestById, 
  updateAdminRequest, 
  getAdminStatistics, 
  sendEmailToSupplier, 
  uploadQCMedia,
  generateTempPassword,
  getBuyerList,
  getBuyerProfile,
  toggleBlockUser
} from '../controllers/adminController.js';
import { getResetRequests, processResetRequest } from '../controllers/passwordResetController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { upload } from '../controllers/requestController.js';
import { validateUploadedFiles } from '../utils/fileTypeVerifier.js';
import { uploadRequestOptions, updateRequestOption, deleteRequestOption, finalizeDeal, shipOrder, completeOrder, togglePublishRating } from '../controllers/adminRequestActions.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

// Requests Management
router.get('/requests', getAdminRequests);
router.get('/requests/:id', getAdminRequestById);
router.put('/requests/:id', updateAdminRequest);
router.post('/requests/:id/media', upload.array('qc_images', 5), validateUploadedFiles, uploadQCMedia);

// Request Options Management
router.post('/requests/:id/options', upload.array('images', 5), validateUploadedFiles, uploadRequestOptions);
router.put('/requests/:id/options/:optionId', upload.array('images', 5), validateUploadedFiles, updateRequestOption);
router.delete('/requests/:id/options/:optionId', deleteRequestOption);

// Deal & Order Actions
router.post('/requests/:id/finalize', upload.single('payment_qr'), validateUploadedFiles, finalizeDeal);
router.post('/requests/:id/ship', shipOrder);
router.post('/requests/:id/complete', completeOrder);
router.post('/ratings/:id/toggle-publish', togglePublishRating);

// Statistics & Communications
router.get('/statistics', getAdminStatistics);
router.post('/requests/:id/email', sendEmailToSupplier);

// [NEW] Requirement 4: Admin Endpoint to generate temporary password for buyer
router.post('/users/:userId/generate-temp-password', generateTempPassword);

// [NEW Issue 1] Password Reset Requests (Admin)
router.get('/reset-requests', getResetRequests);
router.post('/reset-requests/:requestId/process', processResetRequest);

// [NEW Issue 3] Buyer User Management
router.get('/users', getBuyerList);
router.get('/users/:userId', getBuyerProfile);

// [NEW Issue 4] Block / Unblock Buyer
router.post('/users/:userId/toggle-block', toggleBlockUser);

export default router;
