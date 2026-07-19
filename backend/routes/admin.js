import express from 'express';
import { getAdminRequests, getAdminRequestById, updateAdminRequest, getAdminStatistics, sendEmailToSupplier, uploadQCMedia } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { upload } from '../controllers/requestController.js';

const router = express.Router();

router.use(verifyToken, isAdmin);
router.get('/requests', getAdminRequests);
router.get('/requests/:id', getAdminRequestById);
router.put('/requests/:id', updateAdminRequest);
router.post('/requests/:id/media', upload.array('qc_images', 5), uploadQCMedia);
import { uploadRequestOptions, updateRequestOption, deleteRequestOption, finalizeDeal, shipOrder, completeOrder, togglePublishRating } from '../controllers/adminRequestActions.js';

router.post('/requests/:id/options', upload.array('images', 5), uploadRequestOptions);
router.put('/requests/:id/options/:optionId', upload.array('images', 5), updateRequestOption);
router.delete('/requests/:id/options/:optionId', deleteRequestOption);
router.post('/requests/:id/finalize', finalizeDeal);
router.post('/requests/:id/ship', shipOrder);
router.post('/requests/:id/complete', completeOrder);
router.post('/ratings/:id/toggle-publish', togglePublishRating);

router.get('/statistics', getAdminStatistics);
router.post('/requests/:id/email', sendEmailToSupplier);
export default router;
