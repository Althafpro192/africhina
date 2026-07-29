import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;
const TARGET_PORT = 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'africhina_super_secret_jwt_key_2026_change_in_prod';

// Create HTTP server
const server = http.createServer((req, res) => {
  // 1. Handle HTTP POST /broadcast
  if (req.url === '/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { event, payload } = data;
        
        console.log(`[Bridge] Broadcasting event: ${event}`);
        
        // Broadcast based on payload contents
        if (event === 'new-message') {
          const { buyer_id, request_id } = payload;
          if (buyer_id) {
            io.to(`room:buyer-${buyer_id}`).emit('new-message', payload);
          }
          if (request_id) {
            io.to(`room:nego-${request_id}`).to(`request_${request_id}`).emit('new-message', payload);
          }
          if (payload.sender_role !== 'admin') {
            io.to('room:admin').emit('new-message', payload);
          }
        } else if (event === 'message-edited') {
          const { buyer_id, request_id } = payload;
          if (buyer_id) {
            io.to(`room:buyer-${buyer_id}`).emit('message-edited', payload);
          }
          if (request_id) {
            io.to(`room:nego-${request_id}`).to(`request_${request_id}`).emit('message-edited', payload);
          }
        } else if (event === 'message-deleted') {
          io.emit('message-deleted', payload);
        } else if (event === 'new-notification') {
          const { user_id } = payload;
          if (user_id) {
            io.to(`room:buyer-${user_id}`).emit('new-notification', payload);
          } else {
            io.to('room:admin').emit('new-notification', payload);
          }
        } else {
          io.emit(event, payload);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. Otherwise, proxy request to Laravel
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error: ' + err.message);
  });
});

// Setup Socket.IO on same HTTP server
const rawOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5000', 'https://africhina.saktiku.my.id'];
const allowedOrigins = rawOrigins.map(o => o.trim().replace(/\/$/, ''));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Authenticate socket connections using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (!token) return next(new Error('Authentication error: Token missing'));
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.userId}`);

  if (socket.userId) {
    socket.join(`room:buyer-${socket.userId}`);
    if (socket.userRole === 'admin') {
      socket.join('room:admin');
    }
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
    socket.join(`request_${roomId}`);
    console.log(`[Socket] Joined room: ${targetRoom}`);
  });

  socket.on('leave_room', (roomId) => {
    const targetRoom = roomId.startsWith('room:nego-') ? roomId : `room:nego-${roomId}`;
    socket.leave(targetRoom);
    console.log(`[Socket] Left room: ${targetRoom}`);
  });

  socket.on('typing_start', ({ roomId }) => {
    const targetRoom = roomId.startsWith('room:nego-') ? roomId : `room:nego-${roomId}`;
    socket.to(targetRoom).emit('user_typing', { userId: socket.userId, isTyping: true });
  });

  socket.on('typing_stop', ({ roomId }) => {
    const targetRoom = roomId.startsWith('room:nego-') ? roomId : `room:nego-${roomId}`;
    socket.to(targetRoom).emit('user_typing', { userId: socket.userId, isTyping: false });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.userId}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Bridge] Server listening on port ${PORT}`);
});
