/**
 * File Upload Composable
 * 
 * Provides reactive state management for file uploads with:
 * - Drag & drop support
 * - Client-side validation
 * - Progress tracking
 * - Preview generation
 * - Multiple file support
 * - Parallel processing without compression
 */

import { ref, computed } from 'vue';
import { getMediaUrl, isImage, isVideo, formatFileSize } from '../utils/mediaUrl.js';
import { getStoredToken } from '../api/axios.js';
import { i18n as globalI18n } from '../i18n.js';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Resolve the i18n instance available to this composable. The composable is a
// plain JS file (no `<script setup>`), so we lazily grab the global i18n
// instance created in `i18n.js`. If anything goes wrong (test environment,
// bundled differently) we fall back to a no-op translation helper so the
// composable still works.
let _i18nInstance = null;
try {
  _i18nInstance = globalI18n?.global ?? globalI18n ?? null;
} catch (_e) {
  _i18nInstance = null;
}

/**
 * Translate a dotted key (e.g. "upload.addFailed") against the global i18n
 * instance. Returns `fallback` when the key is missing or i18n is unavailable.
 */
const t = (key, fallback, params) => {
  try {
    if (_i18nInstance && typeof _i18nInstance.t === 'function') {
      const translated = _i18nInstance.t(key, params);
      // vue-i18n returns the key itself when missing; treat that as a miss.
      if (translated && translated !== key) return translated;
    }
  } catch (_e) {
    // ignore — fall through to fallback
  }
  return fallback;
};

// Allowed MIME types
const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/avif'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

// Cross-context safe ID generator.
// `crypto.randomUUID()` is undefined in non-secure contexts (e.g. when the
// app is served over plain HTTP from a remote server / LAN IP / IP address, or
// inside iframes without a secure context). Falling back to a Math.random-based
// ID keeps the upload pipeline functional in every environment.
const safeId = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (_) {
    // ignore - fall through to fallback
  }
  return `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
};

// Max file size (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function useFileUpload(options = {}) {
  const {
    maxFiles = 10,
    maxSize = MAX_FILE_SIZE,
    acceptedTypes = [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.videos, ...ALLOWED_TYPES.documents],
    onSuccess = null,
    onError = null,
    onProgress = null,
  } = options;

  // Reactive state
  const files = ref([]);
  const isUploading = ref(false);
  const isProcessing = ref(false);
  const uploadProgress = ref({});
  const errors = ref([]);
  const isDragging = ref(false);

  // Computed
  const hasFiles = computed(() => files.value.length > 0);
  const fileCount = computed(() => files.value.length);
  const canAddMore = computed(() => files.value.length < maxFiles);

  // Validate a single file
  const validateFile = (file) => {
    const validationErrors = [];

    // Check file type. Extension fallback handles files whose MIME type is
    // empty or incorrectly reported by the operating system/browser.
    const typeAllowed = acceptedTypes.includes(file.type)
      || (looksLikeImage(file) && acceptedTypes.some(type => type.startsWith('image/')))
      || (looksLikeVideo(file) && acceptedTypes.some(type => type.startsWith('video/')));
    if (!typeAllowed) {
      validationErrors.push(`File type "${file.type || getExtension(file.name)}" is not allowed`);
    }

    // Check file size
    if (file.size > maxSize) {
      validationErrors.push(`File size exceeds ${formatFileSize(maxSize)}`);
    }

    return {
      valid: validationErrors.length === 0,
      errors: validationErrors,
    };
  };

  // Get file category from MIME type, with an extension fallback applied
  // after the extension helpers are initialized below.
  const getFileCategory = (mimeType, file = null) => {
    if (ALLOWED_TYPES.images.includes(mimeType) || (file && looksLikeImage(file))) return 'images';
    if (ALLOWED_TYPES.videos.includes(mimeType) || (file && looksLikeVideo(file))) return 'videos';
    if (ALLOWED_TYPES.documents.includes(mimeType)) return 'documents';
    return 'other';
  };

  // Track blob URLs for cleanup
  const blobUrls = new Map();

  // File extensions fallback (some screenshot tools leave MIME empty)
  const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif', 'bmp', 'heic', 'heif', 'ico'];
  const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'];

  const getExtension = (filename) => {
    if (!filename || typeof filename !== 'string') return '';
    const idx = filename.lastIndexOf('.');
    return idx >= 0 ? filename.slice(idx + 1).toLowerCase() : '';
  };

  const looksLikeImage = (file) => {
    if (isImage(file.type)) return true;
    const ext = getExtension(file.name);
    return IMAGE_EXTENSIONS.includes(ext);
  };

  const looksLikeVideo = (file) => {
    if (isVideo(file.type)) return true;
    const ext = getExtension(file.name);
    return VIDEO_EXTENSIONS.includes(ext);
  };

  // Safely create a blob URL; returns null on failure (e.g., memory pressure)
  const safeCreateObjectURL = (file) => {
    try {
      if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
        return null;
      }
      return URL.createObjectURL(file);
    } catch (err) {
      console.warn('URL.createObjectURL failed for', file.name, err);
      return null;
    }
  };

  // Generate preview for a file using Blob URL (instant, no memory bloat).
  // IMPORTANT: This function NEVER rejects. Even if URL.createObjectURL
  // throws or the file has an unknown MIME type, it resolves with a
  // safe fallback so the upload UI never blocks on a single file.
  const generatePreview = (file) => {
    return new Promise((resolve) => {
      try {
        if (looksLikeImage(file)) {
          const blobUrl = safeCreateObjectURL(file);
          if (blobUrl) {
            blobUrls.set(file.name + file.size, blobUrl);
            resolve({
              thumbnail: blobUrl,
              isImage: true,
              warning: null,
            });
          } else {
            // Could not create blob URL (memory pressure, very large file, etc.)
            // Still allow the file to be added — preview will fall back to icon.
            resolve({
              thumbnail: null,
              isImage: true,
              warning: 'preview_unavailable',
            });
          }
        } else if (looksLikeVideo(file)) {
          const blobUrl = safeCreateObjectURL(file);
          if (blobUrl) {
            blobUrls.set(file.name + file.size, blobUrl);
            resolve({
              thumbnail: null,
              videoUrl: blobUrl,
              isVideo: true,
              warning: null,
            });
          } else {
            resolve({
              thumbnail: null,
              videoUrl: null,
              isVideo: true,
              warning: 'preview_unavailable',
            });
          }
        } else {
          resolve({
            thumbnail: null,
            isDocument: true,
            warning: null,
          });
        }
      } catch (err) {
        // Last-resort safety net — should never trigger, but if anything
        // synchronous throws inside the executor, swallow it so the file
        // is still added (without preview) instead of being rejected.
        console.warn('generatePreview encountered an error for', file.name, err);
        resolve({
          thumbnail: null,
          isDocument: true,
          warning: 'preview_unavailable',
        });
      }
    });
  };

  // Cleanup blob URL for a file
  const cleanupBlobUrl = (file) => {
    const key = file.name + file.size;
    if (blobUrls.has(key)) {
      URL.revokeObjectURL(blobUrls.get(key));
      blobUrls.delete(key);
    }
  };

  // Create a file object with all needed properties
  const createFileObject = (file, serverResponse = null, previewData = null) => {
    // Use extension fallback when MIME is empty (common for Linux screenshot tools)
    const detectedIsImage = previewData?.isImage ?? looksLikeImage(file);
    const detectedIsVideo = previewData?.isVideo ?? looksLikeVideo(file);
    const detectedType = detectedIsImage ? 'image' : (detectedIsVideo ? 'video' : null);

    return {
      id: serverResponse?.id || safeId(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      category: serverResponse?.type || getFileCategory(file.type || detectedType, file),
      extension: getExtension(file.name),
      url: serverResponse?.url || null,
      thumbnail: previewData?.thumbnail || null,
      videoUrl: previewData?.videoUrl || null,
      isImage: detectedIsImage,
      isVideo: detectedIsVideo,
      isDocument: previewData?.isDocument ?? !(detectedIsImage || detectedIsVideo),
      previewWarning: previewData?.warning || null,
      uploaded: !!serverResponse,
      progress: serverResponse ? 100 : 0,
      formattedSize: formatFileSize(file.size),
    };
  };

  // Add files to the list (parallel processing without compression)
  const addFiles = async (newFiles) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.value.length;

    if (fileArray.length > remainingSlots) {
      errors.value.push(`Maximum ${maxFiles} files allowed. ${fileArray.length - remainingSlots} files will be ignored.`);
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);

    try {
      // Show processing state
      isProcessing.value = true;

      // Process all files in parallel for better performance
      const processingPromises = filesToAdd.map(async (file) => {
        const validation = validateFile(file);
        if (!validation.valid) {
          errors.value.push(...validation.errors.map(e => `${file.name}: ${e}`));
          return null;
        }

        // Per-file isolation: a failure in preview generation OR in
        // createFileObject must NEVER reject the surrounding Promise.all, so
        // the outer `Failed to add files` error cannot fire from this path.
        let previewData = null;
        try {
          // generatePreview is resilient and NEVER rejects; the catch is
          // purely defensive.
          previewData = await generatePreview(file);
        } catch (e) {
          console.warn('Unexpected error while generating preview for', file.name, e);
          previewData = {
            thumbnail: null,
            isDocument: !looksLikeImage(file) && !looksLikeVideo(file),
            warning: 'preview_unavailable',
          };
        }

        try {
          return createFileObject(file, null, previewData);
        } catch (e) {
          console.error('Unexpected error while creating file object for', file.name, e);
          errors.value.push(
            t('upload.fileAddFailed', `${file.name}: failed_to_add`)
          );
          return null;
        }
      });
  
      const results = await Promise.all(processingPromises);
      const validFiles = results.filter(f => f !== null);
      files.value = [...files.value, ...validFiles];
    } catch (error) {
      console.error('Error adding files:', error);
      errors.value.push(t('upload.addFailed', 'Failed to add files'));
    } finally {
      isProcessing.value = false;
    }
  };

  // Remove a file by ID
  const removeFile = (fileId) => {
    const fileToRemove = files.value.find(f => f.id === fileId);
    if (fileToRemove) {
      cleanupBlobUrl(fileToRemove);
    }
    files.value = files.value.filter(f => f.id !== fileId);
  };

  // Clear all files
  const clearFiles = () => {
    // Cleanup all blob URLs
    files.value.forEach(file => cleanupBlobUrl(file));
    blobUrls.clear();
    files.value = [];
    errors.value = [];
    uploadProgress.value = {};
  };

  // Upload a single file
  const uploadFile = async (fileObj) => {
    const formData = new FormData();
    formData.append('file', fileObj.file);

    try {
      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          uploadProgress.value[fileObj.id] = progress;
          fileObj.progress = progress;

          if (onProgress) {
            onProgress(fileObj.id, progress);
          }
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText || 'Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Upload timed out'));

        xhr.open('POST', `${API_URL}/api/upload`);
        xhr.timeout = 120000; // 2 minutes
        xhr.withCredentials = true;
        const token = getStoredToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });

      if (response.success) {
        // Update file object with server response
        Object.assign(fileObj, {
          id: response.data.id,
          url: response.data.url,
          uploaded: true,
          progress: 100,
        });

        if (onSuccess) {
          onSuccess(fileObj, response.data);
        }

        return response.data;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      fileObj.error = error.message;
      fileObj.uploaded = false;

      if (onError) {
        onError(fileObj, error);
      }

      throw error;
    }
  };

  // Upload all pending files
  const uploadAll = async () => {
    const pendingFiles = files.value.filter(f => !f.uploaded);

    if (pendingFiles.length === 0) {
      return [];
    }

    isUploading.value = true;
    const results = [];
    const uploadErrors = [];

    for (const fileObj of pendingFiles) {
      try {
        const result = await uploadFile(fileObj);
        results.push(result);
      } catch (error) {
        uploadErrors.push({ file: fileObj, error: error.message });
      }
    }

    isUploading.value = false;

    return { results, errors: uploadErrors };
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = true;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set to false if leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      isDragging.value = false;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      await addFiles(droppedFiles);
    }
  };

  // Handle file input change
  const handleFileSelect = async (e) => {
    const selectedFiles = e.target?.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await addFiles(selectedFiles);
    }
    // Reset input so same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  // Get file input reference
  let fileInputRef = null;
  const setFileInputRef = (el) => {
    fileInputRef = el;
  };

  const triggerFileSelect = () => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  };

  // Get all uploaded file URLs
  const getUploadedUrls = () => {
    return files.value
      .filter(f => f.uploaded && f.url)
      .map(f => f.url);
  };

  // Get all uploaded file data
  const getUploadedFiles = () => {
    return files.value.filter(f => f.uploaded);
  };

  // Clear errors
  const clearErrors = () => {
    errors.value = [];
  };

  return {
    // State
    files,
    isUploading,
    isProcessing,
    uploadProgress,
    errors,
    isDragging,

    // Computed
    hasFiles,
    fileCount,
    canAddMore,

    // Methods
    validateFile,
    addFiles,
    removeFile,
    clearFiles,
    uploadFile,
    uploadAll,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    setFileInputRef,
    triggerFileSelect,
    getUploadedUrls,
    getUploadedFiles,
    clearErrors,
    formatFileSize,
    getMediaUrl,
    isImage,
    isVideo,
  };
}

export default useFileUpload;