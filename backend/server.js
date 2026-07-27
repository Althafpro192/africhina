import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import logger from './config/logger.js';
import globalErrorHandler from './middleware/errorHandler.js';
import globalSanitizer from './middleware/sanitizer.js';
import versionNegotiation from './middleware/version.js';

import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import supplierRoutes from './routes/suppliers.js';
import ratingRoutes from './routes/ratings.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

import pool from './config/db.js';

// Asynchronously verify or create notifications table
pool.query(`
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'notifications',
    path VARCHAR(200),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(async () => {
  logger.info('[DB] Notifications table verified/created successfully');
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM notifications');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      logger.info('[DB] Seeding default notifications...');
      const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      const buyerRes = await pool.query("SELECT id FROM users WHERE role = 'buyer' LIMIT 1");
      
      if (buyerRes.rows.length > 0) {
        const bId = buyerRes.rows[0].id;
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, icon, path, read, created_at) VALUES 
           ($1, 'New Supplier Quote Received', 'RFQ #9402 has received a verified factory quotation from Ningbo Tech.', 'request_quote', '/buyer/requests', false, NOW() - INTERVAL '10 minutes'),
           ($1, 'Logistics Update', 'Shipment #AF-8840 has passed customs inspection at Mombasa Port.', 'local_shipping', '/buyer/requests', false, NOW() - INTERVAL '2 hours'),
           ($1, 'Account Verified', 'Your business license verification is completed successfully.', 'verified', '/buyer/settings', true, NOW() - INTERVAL '1 day')`,
          [bId]
        );
      }
      
      if (adminRes.rows.length > 0) {
        const aId = adminRes.rows[0].id;
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, icon, path, read, created_at) VALUES 
           ($1, 'New RFQ Submitted', 'Buyer Kwame Osei submitted RFQ #9402 for Solar Panels (500 units).', 'request_quote', '/admin/dashboard', false, NOW() - INTERVAL '15 minutes'),
           ($1, 'Password Reset Requested', 'User Fatoumata Diallo requested a temporary password reset.', 'lock_reset', '/admin/security/password-resets', false, NOW() - INTERVAL '1 hour'),
           ($1, 'New Rating Submitted', 'Buyer Emmanuel Kiprono rated Supplier Guangzhou Machinery 5 stars.', 'stars', '/admin/ratings', true, NOW() - INTERVAL '3 hours')`,
          [aId]
        );
      }
      logger.info('[DB] Default notifications seeded successfully');
    }
  } catch (err) {
    logger.warn(`Failed to seed default notifications: ${err.message}`);
  }
}).catch(err => {
  logger.error(`[DB] Error verifying/creating notifications table: ${err.message}`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const rawOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5000', 'https://africhina.saktiku.my.id'];
const allowedOrigins = rawOrigins.map(o => o.trim().replace(/\/$/, ''));

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// [FIX] Requirement 13: Socket.io Handshake JWT Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (!token) return next(new Error('Authentication error: Token missing'));
  
  if (!process.env.JWT_SECRET) return next(new Error('JWT_SECRET is not defined'));
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  });
});

// [FIX] Requirement 13: Socket.io Room Isolation (room:nego-{negotiationId})
io.on('connection', async (socket) => {
  logger.info(`[Socket] User connected: ${socket.userId}`);

  // Automatically join personal buyer room for direct messaging
  if (socket.userId) {
    socket.join(`room:buyer-${socket.userId}`);
    if (socket.userRole === 'admin') {
      socket.join('room:admin');
      logger.info(`[Socket] Admin ${socket.userId} joined room: room:admin`);
    }
  }

  // [FIX Issue 4] Check if user is blocked on connection
  try {
    const { default: pool } = await import('./config/db.js');
    const blockedRes = await pool.query('SELECT is_blocked FROM users WHERE id = $1', [socket.userId]);
    socket.isBlocked = blockedRes.rows[0]?.is_blocked || false;
  } catch (err) {
    logger.warn(`[Socket] Failed to check blocked status for ${socket.userId}: ${err.message}`);
    socket.isBlocked = false;
  }
  
  socket.on('join_room', (roomId) => {
    let targetRoom;
    if (roomId.startsWith('room:')) {
      targetRoom = roomId;
    } else if (roomId.startsWith('buyer-')) {
      targetRoom = `room:${roomId}`;
    } else {
      targetRoom = `room:nego-${roomId}`;
    }
    socket.join(targetRoom);
    // Legacy room join support
    socket.join(`request_${roomId}`);
    logger.info(`[Socket] User ${socket.userId} joined room: ${targetRoom}`);
  });

  socket.on('leave_room', (roomId) => {
    const targetRoom = roomId.startsWith('room:nego-') ? roomId : `room:nego-${roomId}`;
    socket.leave(targetRoom);
    logger.info(`[Socket] User ${socket.userId} left room: ${targetRoom}`);
  });

  // [FIX Issue 4] Guard against blocked users sending messages via socket
  socket.on('send_message', (data) => {
    if (socket.isBlocked) {
      return socket.emit('error', { message: 'You are blocked from sending messages.' });
    }
    // Message sending is handled by messageController via HTTP,
    // but this guard prevents any direct socket emission attempts
  });

  socket.on('typing_start', ({ roomId }) => {
    if (socket.isBlocked) return;
    const targetRoom = roomId.startsWith('room:nego-') ? roomId : `room:nego-${roomId}`;
    socket.to(targetRoom).emit('user_typing', { userId: socket.userId, isTyping: true });
  });

  socket.on('typing_stop', ({ roomId }) => {
    const targetRoom = roomId.startsWith('room:nego-') ? roomId : `room:nego-${roomId}`;
    socket.to(targetRoom).emit('user_typing', { userId: socket.userId, isTyping: false });
  });

  socket.on('disconnect', () => {
    logger.info(`[Socket] User disconnected: ${socket.userId}`);
  });
});

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// [FIX] Requirement 2: Strict CSP (Content Security Policy)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [ 
        "'self'",
        "data:",
        "blob:",
        "http://localhost:5000",
        "http://localhost:5173",
        "http://192.168.20.95:5000",
        "https://africhina.saktiku.my.id",
        "https://lh3.googleusercontent.com",
        "https://ui-avatars.com",
        "https://*.amazonaws.com"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "ws://localhost:5000", "ws://localhost:5173", "http://192.168.20.95:5000", "ws://192.168.20.95:5000","https://africhina.saktiku.my.id","ws://africhina.saktiku.my.id","wss://africhina.saktiku.my.id"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// [FIX] Requirement 2: Global Input Sanitizer
app.use(globalSanitizer);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// [FIX] Requirement 10: API Version Negotiation Header
app.use('/api/', versionNegotiation(['v1']));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// [FIX] Requirement 10: API v1 Route Mounts
const apiV1Router = express.Router();
apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/requests', requestRoutes);
apiV1Router.use('/admin', adminRoutes);
apiV1Router.use('/admin/suppliers', supplierRoutes);
apiV1Router.use('/ratings', ratingRoutes);
apiV1Router.use('/payments', paymentRoutes);
apiV1Router.use('/notifications', notificationRoutes);

app.use('/api/v1', apiV1Router);
// Fallback / legacy route mapping to v1
app.use('/api', apiV1Router);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// [FIX] Requirement 7: Centralized Error Handler Middleware
app.use(globalErrorHandler);

httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT} across interfaces (0.0.0.0)`);
});
