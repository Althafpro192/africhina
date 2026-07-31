<template>
  <div class="file-upload-container">
    <!-- Drop Zone -->
    <div
      ref="dropZoneRef"
      class="drop-zone"
      :class="{
        'drop-zone--dragging': isDragging,
        'drop-zone--disabled': !canAddMore && !hasFiles,
        'drop-zone--has-files': hasFiles,
      }"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        class="file-input-hidden"
        :accept="acceptString"
        :multiple="maxFiles > 1"
        @change="handleFileSelect"
      />

      <!-- Drop content -->
      <div class="drop-zone__content" v-if="!hasFiles">
        <div class="drop-zone__icon" :class="{ 'drop-zone__icon--active': isDragging }">
          <svg v-if="isDragging" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V16.5h-2.25a.75.75 0 010-1.5h2.25v-2.25a.75.75 0 011.5 0z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <p class="drop-zone__text">
          <span v-if="isDragging">{{ $t('upload.dropHere') || 'Drop files here' }}</span>
          <span v-else>{{ $t('upload.dragDrop') || 'Drag & drop files here or' }}</span>
        </p>
        
        <button 
          type="button"
          class="drop-zone__button"
          @click="triggerFileSelect"
          :disabled="!canAddMore"
        >
          {{ $t('upload.selectFiles') || 'Select Files' }}
        </button>
        
        <p class="drop-zone__hint">
          {{ $t('upload.allowedTypes') || 'Images, Videos, PDFs, Documents' }} • {{ $t('upload.maxSize') || 'Max 20MB per file' }}
        </p>
      </div>

      <!-- Add more files button when has files -->
      <div class="drop-zone__add-more" v-else>
        <button 
          type="button"
          class="add-more-button"
          @click="triggerFileSelect"
          :disabled="!canAddMore"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
          </svg>
          {{ $t('upload.addMore') || 'Add More Files' }}
        </button>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="errors.length > 0" class="upload-errors">
      <div v-for="(error, index) in errors" :key="index" class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="isUploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-bar__fill" :style="{ width: overallProgress + '%' }"></div>
      </div>
      <span class="progress-text">{{ overallProgress }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useFileUpload } from '../../composables/useFileUpload.js';

const props = defineProps({
  // Maximum number of files
  maxFiles: {
    type: Number,
    default: 10,
  },
  // Maximum file size in bytes (default 20MB)
  maxSize: {
    type: Number,
    default: 20 * 1024 * 1024,
  },
  // Accepted file types
  acceptedTypes: {
    type: Array,
    default: () => [
      'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  // Initial files (e.g., from server)
  initialFiles: {
    type: Array,
    default: () => [],
  },
  // Label text
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:files', 'upload-complete', 'file-added', 'file-removed', 'error']);

// File upload composable
const {
  files,
  isUploading,
  uploadProgress,
  errors,
  isDragging,
  hasFiles,
  canAddMore,
  addFiles,
  removeFile,
  clearFiles,
  uploadAll,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileSelect,
  setFileInputRef,
  triggerFileSelect,
  formatFileSize,
} = useFileUpload({
  maxFiles: props.maxFiles,
  maxSize: props.maxSize,
  acceptedTypes: props.acceptedTypes,
  onSuccess: (file, response) => {
    emit('upload-complete', { file, response });
  },
  onError: (file, error) => {
    emit('error', { file, error });
  },
  onProgress: (fileId, progress) => {
    // Progress tracking handled internally
  },
});

// Refs
const dropZoneRef = ref(null);
const fileInputRef = ref(null);

// Set file input ref on mount
onMounted(() => {
  if (fileInputRef.value) {
    setFileInputRef(fileInputRef.value);
  }
});

// Accept string for file input
const acceptString = computed(() => {
  return props.acceptedTypes.join(',');
});

// Overall upload progress
const overallProgress = computed(() => {
  if (!isUploading.value) return 0;
  
  const progressValues = Object.values(uploadProgress.value);
  if (progressValues.length === 0) return 0;
  
  const total = progressValues.reduce((sum, val) => sum + val, 0);
  return Math.round(total / progressValues.length);
});

// Watch for file changes and emit
watch(files, (newFiles) => {
  emit('update:files', newFiles);
}, { deep: true });

// Watch for errors and emit
watch(errors, (newErrors) => {
  if (newErrors.length > 0) {
    emit('error', { errors: newErrors });
  }
});

// Expose methods for parent components
defineExpose({
  files,
  isUploading,
  addFiles,
  removeFile,
  clearFiles,
  uploadAll,
  triggerFileSelect,
  getUploadedUrls: () => files.value.filter(f => f.uploaded).map(f => f.url),
  getUploadedFiles: () => files.value.filter(f => f.uploaded),
});
</script>

<style scoped>
.file-upload-container {
  width: 100%;
}

.drop-zone {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  background: #f9fafb;
  cursor: pointer;
}

.drop-zone:hover {
  border-color: #6366f1;
  background: #f0f1ff;
}

.drop-zone--dragging {
  border-color: #6366f1;
  border-style: solid;
  background: #eef2ff;
  transform: scale(1.01);
}

.drop-zone--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drop-zone--has-files {
  padding: 16px;
  min-height: 60px;
}

.file-input-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.drop-zone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drop-zone__icon {
  color: #9ca3af;
  transition: all 0.3s ease;
}

.drop-zone__icon--active {
  color: #6366f1;
  transform: scale(1.1);
}

.drop-zone__text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.drop-zone__button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.drop-zone__button:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.drop-zone__button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.drop-zone__hint {
  color: #9ca3af;
  font-size: 12px;
  margin: 0;
}

.drop-zone__add-more {
  display: flex;
  justify-content: center;
}

.add-more-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-more-button:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.add-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error Messages */
.upload-errors {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
}

.error-message svg {
  flex-shrink: 0;
}

/* Upload Progress */
.upload-progress {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  min-width: 40px;
}
</style>
