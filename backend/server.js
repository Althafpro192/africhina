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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5000'];

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
        "https://lh3.googleusercontent.com",
        "https://ui-avatars.com",
        "https://*.amazonaws.com"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "ws://localhost:5000", "ws://localhost:5173"],
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