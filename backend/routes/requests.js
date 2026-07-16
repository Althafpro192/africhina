import express from 'express';
import { createRequest, getRequests, getRequestById, acceptQuote, getTrackingLogs, upload } from '../controllers/requestController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', upload.array('images', 3), createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.get('/:id/tracking', getTrackingLogs);
router.put('/:id/accept', acceptQuote);

export default router;
