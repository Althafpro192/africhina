import express from 'express';
import { createRequest, getRequests, getRequestById, acceptQuote, getTrackingLogs, upload, editRequestDetails, updateRequest, deleteRequest } from '../controllers/requestController.js';
import { verifyToken } from '../middleware/auth.js';
import { forceChangePassword } from '../middleware/forceChangePassword.js';
import { requestValidation } from '../middleware/validation.js';
import { validateUploadedFiles } from '../utils/fileTypeVerifier.js';
import { selectOption, confirmDelivery, cancelRequest, disputeRequest } from '../controllers/buyerRequestActions.js';
import { getMessages, sendMessage, editMessage, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

router.use(verifyToken, forceChangePassword);

router.post('/', upload.array('images', 3), validateUploadedFiles, requestValidation, createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.put('/:id', upload.array('images', 3), validateUploadedFiles, editRequestDetails);
router.get('/:id/tracking', getTrackingLogs);

router.post('/:id/select-option', selectOption);
router.post('/:id/confirm-delivery', confirmDelivery);
router.post('/:id/cancel', cancelRequest);
router.post('/:id/dispute', disputeRequest);

// Chat messages
router.get('/:id/messages', getMessages);
router.post('/:id/messages', upload.single('media'), validateUploadedFiles, sendMessage);
router.put('/:id/messages/:msgId', editMessage);
router.delete('/:id/messages/:msgId', deleteMessage);

export default router;
