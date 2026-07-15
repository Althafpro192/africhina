import express from 'express';
import { createRating } from '../controllers/ratingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', createRating);

export default router;
