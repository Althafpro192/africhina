import pool from '../config/db.js';
import logger from '../config/logger.js';
import translate from 'google-translate-api-x';

export const getMessages = async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await pool.query(
      `SELECT m.*, u.full_name as sender_name, u.role as sender_role 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.request_id = $1 
       ORDER BY m.created_at ASC`,
      [id]
    );
    res.json(messages.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  // Media handling
  let mediaUrl = null;
  let mediaType = null;
  
  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
    // Simple mime type check for 'image' or 'audio'
    if (req.file.mimetype.startsWith('image/')) {
      mediaType = 'image';
    } else if (req.file.mimetype.startsWith('audio/') || req.file.mimetype.startsWith('video/')) {
      mediaType = 'audio';
    } else {
      mediaType = 'document';
    }
  }

  // If both content and file are empty, reject
  if (!content && !req.file) {
    return res.status(400).json({ message: 'Message content or media is required' });
  }

  const safeContent = content || '';
  try {
    let translations = {};
    try {
      // Translate to 4 target languages (including original just in case)
      const targets = ['en', 'id', 'zh-cn', 'fr'];
      const translationPromises = targets.map(async (lang) => {
        if (!safeContent) return { lang: lang === 'zh-cn' ? 'zh' : lang, text: '' };
        try {
          const res = await translate(safeContent, { to: lang, autoCorrect: true });
          return { lang: lang === 'zh-cn' ? 'zh' : lang, text: res.text };
        } catch (err) {
          logger.warn(`Translation to ${lang} failed: ${err.message}`);
          return { lang: lang === 'zh-cn' ? 'zh' : lang, text: safeContent };
        }
      });
      const results = await Promise.all(translationPromises);
      results.forEach(res => {
        translations[res.lang] = res.text;
      });
    } catch (translationError) {
      logger.error(`Bulk translation error: ${translationError.message}`);
    }

    const newMessage = await pool.query(
      "INSERT INTO messages (request_id, sender_id, content, translations, media_url, media_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id, req.userId, safeContent, JSON.stringify(translations), mediaUrl, mediaType]
    );
    
    // Fetch with sender info
    const messageDetails = await pool.query(
      `SELECT m.*, u.full_name as sender_name, u.role as sender_role 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = $1`,
      [newMessage.rows[0].id]
    );
    
    if (req.io) {
      req.io.to(`request_${id}`).emit('new-message', messageDetails.rows[0]);
    }
    
    res.status(201).json(messageDetails.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const editMessage = async (req, res) => {
  const { id, msgId } = req.params;
  const { content } = req.body;
  
  try {
    // Check ownership
    const checkMsg = await pool.query("SELECT sender_id FROM messages WHERE id = $1 AND request_id = $2", [msgId, id]);
    if (checkMsg.rows.length === 0) return res.status(404).json({ message: 'Message not found' });
    if (checkMsg.rows[0].sender_id !== req.userId) return res.status(403).json({ message: 'Unauthorized to edit this message' });

    let translations = {};
    if (content) {
      try {
        const targets = ['en', 'id', 'zh-cn', 'fr'];
        const translationPromises = targets.map(async (lang) => {
          try {
            const res = await translate(content, { to: lang, autoCorrect: true });
            return { lang: lang === 'zh-cn' ? 'zh' : lang, text: res.text };
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

    const updated = await pool.query(
      "UPDATE messages SET content = $1, translations = $2, is_edited = true WHERE id = $3 RETURNING *",
      [content, JSON.stringify(translations), msgId]
    );

    // Fetch with sender info
    const messageDetails = await pool.query(
      `SELECT m.*, u.full_name as sender_name, u.role as sender_role 
       FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = $1`,
      [msgId]
    );

    if (req.io) {
      req.io.to(`request_${id}`).emit('message-edited', messageDetails.rows[0]);
    }

    res.json(messageDetails.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteMessage = async (req, res) => {
  const { id, msgId } = req.params;
  
  try {
    // Check ownership
    const checkMsg = await pool.query("SELECT sender_id FROM messages WHERE id = $1 AND request_id = $2", [msgId, id]);
    if (checkMsg.rows.length === 0) return res.status(404).json({ message: 'Message not found' });
    if (checkMsg.rows[0].sender_id !== req.userId && req.userRole !== 'admin') {
      // Admin can delete any message, sender can delete their own
      return res.status(403).json({ message: 'Unauthorized to delete this message' });
    }

    // Soft delete
    await pool.query(
      "UPDATE messages SET is_deleted = true, content = '', translations = '{}', media_url = NULL, media_type = NULL WHERE id = $1",
      [msgId]
    );

    if (req.io) {
      req.io.to(`request_${id}`).emit('message-deleted', { id: msgId, is_deleted: true });
    }

    res.json({ message: 'Message deleted successfully', id: msgId });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
