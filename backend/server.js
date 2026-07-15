import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import supplierRoutes from './routes/suppliers.js';
import ratingRoutes from './routes/ratings.js';
// email routing can be part of admin

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
