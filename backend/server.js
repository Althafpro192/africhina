import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import supplierRoutes from './routes/suppliers.js';
import ratingRoutes from './routes/ratings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (QC images, reference images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/suppliers', supplierRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/', (req, res) => {
  res.send('AfriChina Bridge API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
