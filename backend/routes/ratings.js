import express from 'express';
import { createRating, getRatingsBySupplier, getRatingByRequest, getAllRatings } from '../controllers/ratingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', createRating);
router.get('/', getAllRatings);
router.get('/supplier/:supplierId', getRatingsBySupplier);
router.get('/request/:requestId', getRatingByRequest);

export default router;
