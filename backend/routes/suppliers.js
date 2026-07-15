import express from 'express';
import { getSuppliers, createSupplier } from '../controllers/supplierController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, isAdmin);
router.get('/', getSuppliers);
router.post('/', createSupplier);

export default router;
