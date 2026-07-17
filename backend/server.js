import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
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

// CORS Configuration - Diperbaiki
app.use(cors({
  origin: function (origin, callback) {
    // Izinkan jika origin tidak ada (seperti request dari mobile app/postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'https://africhina.saktiku.my.id', // Domain production (tanpa spasi)
      'http://africhina.saktiku.my.id'   // HTTP fallback
    ];

    // Izinkan semua IP lokal (192.168.x.x, 10.x.x.x, 127.0.0.1) dengan port berapapun
    const isLocalhost = origin.includes('localhost') || 
                        origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
                        origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/);

    if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Penting untuk mengirim cookie/token
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
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

// Pastikan listen menggunakan '0.0.0.0' agar bisa diakses dari jaringan luar/lain
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Accessible via: http://localhost:${PORT}`);
});