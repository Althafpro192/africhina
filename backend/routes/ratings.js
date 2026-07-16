import express from 'express';
import { createRating, getRatingsBySupplier, getRatingByRequest } from '../controllers/ratingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', createRating);
router.get('/supplier/:supplierId', getRatingsBySupplier);
router.get('/request/:requestId', getRatingByRequest);

export default router;
