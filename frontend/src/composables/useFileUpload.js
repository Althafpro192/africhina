/**
 * File Upload Composable
 * 
 * Provides reactive state management for file uploads with:
 * - Drag & drop support
 * - Client-side validation
 * - Progress tracking
 * - Preview generation
 * - Multiple file support
 */

import { ref, computed } from 'vue';
import { getMediaUrl, isImage, isVideo, formatFileSize } from '../utils/mediaUrl.js';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://backend:8000';

// Allowed MIME types
const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/avif'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
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

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      validationErrors.push(`File type "${file.type}" is not allowed`);
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

  // Get file category from MIME type
  const getFileCategory = (mimeType) => {
    if (ALLOWED_TYPES.images.includes(mimeType)) return 'images';
    if (ALLOWED_TYPES.videos.includes(mimeType)) return 'videos';
    if (ALLOWED_TYPES.documents.includes(mimeType)) return 'documents';
    return 'other';
  };

  // Generate preview for a file
  const generatePreview = (file) => {
    return new Promise((resolve) => {
      if (isImage(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            thumbnail: e.target.result,
            isImage: true,
          });
        };
        reader.readAsDataURL(file);
      } else if (isVideo(file.type)) {
        // For videos, we'll use a placeholder or first frame later
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            thumbnail: null,
            videoData: e.target.result,
            isVideo: true,
          });
        };
        reader.readAsDataURL(file);
      } else {
        resolve({
          thumbnail: null,
          isDocument: true,
        });
      }
    });
  };

  // Create a file object with all needed properties
  const createFileObject = (file, serverResponse = null, previewData = null) => {
    return {
      id: serverResponse?.id || crypto.randomUUID(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      category: serverResponse?.type || getFileCategory(file.type),
      extension: file.name.split('.').pop().toLowerCase(),
      url: serverResponse?.url || null,
      thumbnail: previewData?.thumbnail || null,
      videoData: previewData?.videoData || null,
      isImage: previewData?.isImage || isImage(file.type),
      isVideo: previewData?.isVideo || isVideo(file.type),
      isDocument: previewData?.isDocument || false,
      uploaded: !!serverResponse,
      progress: serverResponse ? 100 : 0,
      formattedSize: formatFileSize(file.size),
    };
  };

  // Add files to the list
  const addFiles = async (newFiles) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.value.length;

    if (fileArray.length > remainingSlots) {
      errors.value.push(`Maximum ${maxFiles} files allowed. ${fileArray.length - remainingSlots} files will be ignored.`);
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const newFileObjects = [];

    for (const file of filesToAdd) {
      const validation = validateFile(file);

      if (!validation.valid) {
        errors.value.push(...validation.errors.map(e => `${file.name}: ${e}`));
        continue;
      }

      const previewData = await generatePreview(file);
      const fileObj = createFileObject(file, null, previewData);
      newFileObjects.push(fileObj);
    }

    files.value = [...files.value, ...newFileObjects];

    return newFileObjects;
  };

  // Remove a file by ID
  const removeFile = (fileId) => {
    files.value = files.value.filter(f => f.id !== fileId);
  };

  // Clear all files
  const clearFiles = () => {
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
