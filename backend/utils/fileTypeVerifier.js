import fs from 'fs';
import path from 'path';

/**
 * Validates file magic numbers (file signatures) to verify actual file content matches allowed types.
 * Supported signatures: JPEG, PNG, GIF, WEBP, PDF.
 */
export const verifyMagicBytes = async (filePath) => {
  const buffer = Buffer.alloc(12);
  const fd = await fs.promises.open(filePath, 'r');
  try {
    await fd.read(buffer, 0, 12, 0);
  } finally {
    await fd.close();
  }

  // Check magic bytes
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: '.jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) {
    return { mime: 'image/png', ext: '.png' };
  }

  // GIF: 47 49 46 38 (GIF8)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { mime: 'image/gif', ext: '.gif' };
  }

  // WEBP: RIFF ... WEBP (bytes 0-3: 52 49 46 46, bytes 8-11: 57 45 42 50)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: '.webp' };
  }

  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mime: 'application/pdf', ext: '.pdf' };
  }

  // WebM / Matroska: 1A 45 DF A3 (EBML container used for WebM voice notes)
  if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) {
    return { mime: 'audio/webm', ext: '.webm' };
  }

  // OGG Audio: 4F 67 67 53 (OggS)
  if (buffer[0] === 0x4F && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return { mime: 'audio/ogg', ext: '.ogg' };
  }

  // MP3 Audio: ID3 header (49 44 33) or MPEG sync frame (FF FB / FF FA / FF F3)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) ||
    (buffer[0] === 0xFF && (buffer[1] === 0xFB || buffer[1] === 0xFA || buffer[1] === 0xF3))
  ) {
    return { mime: 'audio/mpeg', ext: '.mp3' };
  }

  // WAV Audio: RIFF ... WAVE (bytes 0-3: 52 49 46 46, bytes 8-11: 57 41 56 45)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45
  ) {
    return { mime: 'audio/wav', ext: '.wav' };
  }

  // MP4 / M4A Audio: ftyp box at offset 4 (66 74 79 70)
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return { mime: 'audio/mp4', ext: '.mp4' };
  }

  return null;
};

/**
 * Middleware wrapper for multer post-upload magic byte validation.
 */
export const validateUploadedFiles = async (req, res, next) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else if (typeof req.files === 'object') {
      Object.values(req.files).forEach(fileArray => files.push(...fileArray));
    }
  }

  for (const file of files) {
    if (!file.path) continue;
    try {
      const detected = await verifyMagicBytes(file.path);
      if (!detected) {
        // Clean up file
        await fs.promises.unlink(file.path).catch(() => {});
        return res.status(400).json({ message: `Security violation: File ${file.originalname} has invalid magic numbers/signature.` });
      }

      // Check extension vs detected type
      const ext = path.extname(file.originalname).toLowerCase();
      const validExtensions = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf'],
        'audio/webm': ['.webm', '.mkv'],
        'audio/ogg': ['.ogg', '.oga', '.opus'],
        'audio/mpeg': ['.mp3'],
        'audio/wav': ['.wav'],
        'audio/mp4': ['.mp4', '.m4a', '.aac']
      };

      const allowedExts = validExtensions[detected.mime] || [];
      if (!allowedExts.includes(ext)) {
        await fs.promises.unlink(file.path).catch(() => {});
        return res.status(400).json({ message: `Security violation: File extension ${ext} does not match detected file type ${detected.mime}.` });
      }
    } catch (err) {
      await fs.promises.unlink(file.path).catch(() => {});
      return res.status(400).json({ message: `Error verifying file integrity: ${err.message}` });
    }
  }

  next();
};
