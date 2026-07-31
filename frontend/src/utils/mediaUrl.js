/**
 * Unified Media URL Helper
 * 
 * Provides consistent URL handling for all media types:
 * - Base64 data URIs (stored in database as BLOBs)
 * - External URLs (CDN, third-party)
 * - Local upload paths
 * - Avatar URLs
 * 
 * @example
 * // Get full URL for display
 * getMediaUrl('/storage/uploads/file.jpg') // -> 'http://backend:8000/storage/uploads/file.jpg'
 * getMediaUrl('data:image/png;base64,...') // -> stays as is
 * getMediaUrl('https://cdn.example.com/image.png') // -> stays as is
 */

// Get backend URL from environment or use default
const getBackendUrl = () => {
  // In production/Vite, use the configured backend URL
  return import.meta.env.VITE_API_URL || 'http://backend:8000';
};

/**
 * Check if a URL is a data URI (base64)
 * @param {string} url 
 * @returns {boolean}
 */
export const isDataUri = (url) => {
  if (!url) return false;
  return url.startsWith('data:');
};

/**
 * Check if a URL is an external URL (http/https)
 * @param {string} url 
 * @returns {boolean}
 */
export const isExternalUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Check if a URL is a local upload path
 * @param {string} url 
 * @returns {boolean}
 */
export const isLocalPath = (url) => {
  if (!url) return false;
  return url.startsWith('/uploads/') || url.startsWith('/storage/');
};

/**
 * Get the full URL for a media file
 * Handles:
 * - Data URIs (base64) - returned as-is
 * - External URLs - returned as-is
 * - Local paths - prepended with backend URL
 * 
 * @param {string|null} url - The URL or path to process
 * @param {object} options - Additional options
 * @param {string} options.fallback - Fallback URL if url is null/empty
 * @param {string} options.defaultType - Default MIME type for data URIs
 * @returns {string} Full URL safe to use in <img src> or similar
 */
export const getMediaUrl = (url, options = {}) => {
  const { fallback = '', defaultType = 'image/png' } = options;

  // Handle null/undefined/empty
  if (!url) {
    return fallback;
  }

  // Data URI (base64) - return as-is
  if (isDataUri(url)) {
    return url;
  }

  // External URL - return as-is
  if (isExternalUrl(url)) {
    return url;
  }

  // Local path - prepend backend URL
  if (isLocalPath(url)) {
    return `${getBackendUrl()}${url}`;
  }

  // Unknown format - assume it's a local path
  return `${getBackendUrl()}/${url}`;
};

/**
 * Get avatar URL with proper fallback
 * 
 * @param {string|null} avatarUrl - Avatar URL from API
 * @param {string|null} avatarData - Base64 avatar data from API
 * @param {string|null} mimeType - Avatar MIME type
 * @param {string} name - User name for fallback avatar
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (avatarUrl, avatarData, mimeType, name = 'User') => {
  // If avatar_data is provided, construct data URL directly
  if (avatarData && mimeType) {
    return `data:${mimeType};base64,${avatarData}`;
  }

  // If avatar_url is provided, use unified URL handler
  if (avatarUrl) {
    return getMediaUrl(avatarUrl);
  }

  // Fallback to UI Avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
};

/**
 * Get image/media URL for chat messages
 * 
 * @param {string|null} mediaUrl - Media URL from API
 * @param {string|null} mediaData - Base64 media data (for BLOBs)
 * @param {string|null} mimeType - Media MIME type
 * @param {string} type - Media type ('image', 'video', 'document')
 * @returns {string} Media URL
 */
export const getChatMediaUrl = (mediaUrl, mediaData, mimeType, type = 'image') => {
  // If media_data is provided (BLOB from database)
  if (mediaData && mimeType) {
    // Determine actual mime type if not provided
    const actualMimeType = mimeType || getMimeTypeFromType(type);
    return `data:${actualMimeType};base64,${mediaData}`;
  }

  // If media_url is provided
  if (mediaUrl) {
    return getMediaUrl(mediaUrl);
  }

  return '';
};

/**
 * Get MIME type from media type string
 * 
 * @param {string} type - Media type
 * @returns {string} MIME type
 */
export const getMimeTypeFromType = (type) => {
  const mimeTypes = {
    image: 'image/jpeg',
    video: 'video/mp4',
    document: 'application/pdf',
    audio: 'audio/mpeg',
  };
  return mimeTypes[type] || 'application/octet-stream';
};

/**
 * Determine media type from MIME type
 * 
 * @param {string} mimeType - MIME type
 * @returns {string} Media type ('image', 'video', 'document', 'other')
 */
export const getTypeFromMime = (mimeType) => {
  if (!mimeType) return 'other';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet')) {
    return 'document';
  }

  return 'other';
};

/**
 * Format file size to human readable string
 * 
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
};

/**
 * Check if a file type is an image
 * 
 * @param {string} mimeType - MIME type
 * @returns {boolean}
 */
export const isImage = (mimeType) => {
  return mimeType && mimeType.startsWith('image/');
};

/**
 * Check if a file type is a video
 * 
 * @param {string} mimeType - MIME type
 * @returns {boolean}
 */
export const isVideo = (mimeType) => {
  return mimeType && mimeType.startsWith('video/');
};

/**
 * Check if a file type is a document
 * 
 * @param {string} mimeType - MIME type
 * @returns {boolean}
 */
export const isDocument = (mimeType) => {
  if (!mimeType) return false;
  return mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet');
};

/**
 * Get file extension from filename
 * 
 * @param {string} filename - File name
 * @returns {string} Extension (lowercase, without dot)
 */
export const getExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Get icon name for file type
 * 
 * @param {string} mimeType - MIME type
 * @returns {string} Icon name for use with Material Icons or similar
 */
export const getFileIcon = (mimeType) => {
  if (isImage(mimeType)) return 'image';
  if (isVideo(mimeType)) return 'video_file';
  if (mimeType === 'application/pdf') return 'picture_as_pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart';
  return 'insert_drive_file';
};

// Export all functions
export default {
  getBackendUrl,
  isDataUri,
  isExternalUrl,
  isLocalPath,
  getMediaUrl,
  getAvatarUrl,
  getChatMediaUrl,
  getMimeTypeFromType,
  getTypeFromMime,
  formatFileSize,
  isImage,
  isVideo,
  isDocument,
  getExtension,
  getFileIcon,
};
