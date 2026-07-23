// [FIX] Support Direct Buyer-Admin Chat & General Support Threads + RFQ Negotiation
import pool from '../config/db.js';
import logger from '../config/logger.js';
import translate from 'google-translate-api-x';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import storageService from '../config/storage.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves thread identifiers (requestId vs buyerId) flexibly.
 */
async function resolveThread(idParam, userId, userRole, reqQuery = {}) {
  let requestId = null;
  let buyerId = reqQuery.buyer_id || null;

  if (!idParam || idParam === 'general-support') {
    if (userRole === 'buyer') {
      buyerId = userId;
    }
  } else if (idParam.startsWith('buyer-')) {
    buyerId = idParam.replace('buyer-', '');
  } else if (UUID_REGEX.test(idParam)) {
    // Check if it's an RFQ ID
    const reqRes = await pool.query('SELECT user_id FROM requests WHERE id = $1', [idParam]);
    if (reqRes.rows.length > 0) {
      requestId = idParam;
      buyerId = reqRes.rows[0].user_id;
    } else {
      // Check if it's a Buyer User ID
      const userRes = await pool.query('SELECT id, role FROM users WHERE id = $1', [idParam]);
      if (userRes.rows.length > 0) {
        buyerId = idParam;
      }
    }
  }

  // Fallback for buyers
  if (!buyerId && userRole === 'buyer') {
    buyerId = userId;
  }

  return { requestId, buyerId };
}

export const getMessages = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { requestId, buyerId } = await resolveThread(id, req.userId, req.userRole, req.query);

  let queryText;
  let queryParams;

  if (requestId) {
    queryText = `
      SELECT m.*, u.full_name as sender_name, u.role as sender_role 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.request_id = $1 
      ORDER BY m.created_at ASC
    `;
    queryParams = [requestId];
  } else if (buyerId) {
    queryText = `
      SELECT m.*, u.full_name as sender_name, u.role as sender_role 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.request_id IS NULL AND m.buyer_id = $1 
      ORDER BY m.created_at ASC
    `;
    queryParams = [buyerId];
  } else {
    return res.json([]);
  }

  const messages = await pool.query(queryText, queryParams);
  res.json(messages.rows);
});

export const sendMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  // [FIX Issue 4] Check if user is blocked before allowing message send
  const blockedCheck = await pool.query('SELECT is_blocked FROM users WHERE id = $1', [req.userId]);
  if (blockedCheck.rows[0]?.is_blocked) {
    throw new AppError('You are blocked from sending messages.', 403);
  }

  const { requestId, buyerId } = await resolveThread(id, req.userId, req.userRole, req.query);

  if (!buyerId && !requestId) {
    throw new AppError('Invalid chat target recipient', 400);
  }

  let mediaUrl = null;
  let mediaType = null;
  
  if (req.file) {
    mediaUrl = await storageService.upload(req.file);
    if (req.file.mimetype.startsWith('image/')) {
      mediaType = 'image';
    } else if (req.file.mimetype.startsWith('audio/') || req.file.mimetype.startsWith('video/')) {
      mediaType = 'audio';
    } else {
      mediaType = 'document';
    }
  }

  if (!content && !req.file) {
    throw new AppError('Message content or media is required', 400);
  }

  const safeContent = content || '';
  let translations = {};

  if (safeContent) {
    try {
      const targets = ['en', 'id', 'zh-cn', 'fr'];
      const translationPromises = targets.map(async (lang) => {
        try {
          const result = await translate(safeContent, { to: lang, autoCorrect: true });
          return { lang: lang === 'zh-cn' ? 'zh' : lang, text: result.text };
        } catch (err) {
          logger.warn(`Translation to ${lang} failed: ${err.message}`);
          return { lang: lang === 'zh-cn' ? 'zh' : lang, text: safeContent };
        }
      });
      const results = await Promise.all(translationPromises);
      results.forEach(res => {
        translations[res.lang] = res.text;
      });
    } catch (e) {
      logger.error(`Bulk translation error: ${e.message}`);
    }
  }

  const newMessage = await pool.query(
    `INSERT INTO messages (request_id, buyer_id, sender_id, content, translations, media_url, media_type) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [requestId, buyerId, req.userId, safeContent, JSON.stringify(translations), mediaUrl, mediaType]
  );
  
  const messageDetails = await pool.query(
    `SELECT m.*, u.full_name as sender_name, u.role as sender_role 
     FROM messages m 
     JOIN users u ON m.sender_id = u.id 
     WHERE m.id = $1`,
    [newMessage.rows[0].id]
  );
  
  const messagePayload = messageDetails.rows[0];

  if (req.io) {
    // Broadcast to real-time rooms
    if (buyerId) {
      req.io.to(`room:buyer-${buyerId}`).emit('new-message', messagePayload);
    }
    if (requestId) {
      req.io.to(`room:nego-${requestId}`).to(`request_${requestId}`).emit('new-message', messagePayload);
    } else {
      req.io.to('room:nego-general-support').to(`room:nego-buyer-${buyerId}`).emit('new-message', messagePayload);
    }
  }
  
  res.status(201).json(messagePayload);
});

export const editMessage = catchAsync(async (req, res) => {
  const { id, msgId } = req.params;
  const { content } = req.body;
  
  const checkMsg = await pool.query("SELECT sender_id, request_id, buyer_id FROM messages WHERE id = $1", [msgId]);
  if (checkMsg.rows.length === 0) throw new AppError('Message not found', 404);
  if (checkMsg.rows[0].sender_id !== req.userId) throw new AppError('Unauthorized to edit this message', 403);

  let translations = {};
  if (content) {
    try {
      const targets = ['en', 'id', 'zh-cn', 'fr'];
      const translationPromises = targets.map(async (lang) => {
        try {
          const result = await translate(content, { to: lang, autoCorrect: true });
          return { lang: lang === 'zh-cn' ? 'zh' : lang, text: result.text };
        } catch (err) {
          return { lang: lang === 'zh-cn' ? 'zh' : lang, text: content };
        }
      });
      const results = await Promise.all(translationPromises);
      results.forEach(res => { translations[res.lang] = res.text; });
    } catch (e) {
      logger.error(`Bulk translation error on edit: ${e.message}`);
    }
  }

  await pool.query(
    "UPDATE messages SET content = $1, translations = $2, is_edited = true WHERE id = $3",
    [content, JSON.stringify(translations), msgId]
  );

  const messageDetails = await pool.query(
    `SELECT m.*, u.full_name as sender_name, u.role as sender_role 
     FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = $1`,
    [msgId]
  );

  const msgData = messageDetails.rows[0];

  if (req.io) {
    if (msgData.buyer_id) {
      req.io.to(`room:buyer-${msgData.buyer_id}`).emit('message-edited', msgData);
    }
    if (msgData.request_id) {
      req.io.to(`room:nego-${msgData.request_id}`).to(`request_${msgData.request_id}`).emit('message-edited', msgData);
    }
  }

  res.json(msgData);
});

export const deleteMessage = catchAsync(async (req, res) => {
  const { id, msgId } = req.params;
  
  const checkMsg = await pool.query("SELECT sender_id, request_id, buyer_id FROM messages WHERE id = $1", [msgId]);
  if (checkMsg.rows.length === 0) throw new AppError('Message not found', 404);
  if (checkMsg.rows[0].sender_id !== req.userId && req.userRole !== 'admin') {
    throw new AppError('Unauthorized to delete this message', 403);
  }

  const msgData = checkMsg.rows[0];

  await pool.query(
    "UPDATE messages SET is_deleted = true, content = '', translations = '{}', media_url = NULL, media_type = NULL WHERE id = $1",
    [msgId]
  );

  if (req.io) {
    if (msgData.buyer_id) {
      req.io.to(`room:buyer-${msgData.buyer_id}`).emit('message-deleted', { id: msgId, is_deleted: true });
    }
    if (msgData.request_id) {
      req.io.to(`room:nego-${msgData.request_id}`).to(`request_${msgData.request_id}`).emit('message-deleted', { id: msgId, is_deleted: true });
    }
  }

  res.json({ message: 'Message deleted successfully', id: msgId });
});
