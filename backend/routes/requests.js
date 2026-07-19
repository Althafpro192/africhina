import express from 'express';
import { createRequest, getRequests, getRequestById, acceptQuote, getTrackingLogs, upload, editRequestDetails, updateRequest, deleteRequest } from '../controllers/requestController.js';
import { verifyToken } from '../middleware/auth.js';
import { requestValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', upload.array('images', 3), requestValidation, createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.put('/:id', upload.array('images', 3), editRequestDetails);
router.get('/:id/tracking', getTrackingLogs);
import { selectOption, confirmDelivery, cancelRequest, disputeRequest } from '../controllers/buyerRequestActions.js';
import { getMessages, sendMessage, editMessage, deleteMessage } from '../controllers/messageController.js';

router.post('/:id/select-option', selectOption);
router.post('/:id/confirm-delivery', confirmDelivery);
router.post('/:id/cancel', cancelRequest);
router.post('/:id/dispute', disputeRequest);

// Chat messages
router.get('/:id/messages', getMessages);
router.post('/:id/messages', upload.single('media'), sendMessage);
router.put('/:id/messages/:msgId', editMessage);
router.delete('/:id/messages/:msgId', deleteMessage);

export default router;
