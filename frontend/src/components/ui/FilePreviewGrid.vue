<template>
  <div class="file-preview-grid">
    <TransitionGroup name="file-list" tag="div" class="file-grid">
      <div
        v-for="file in files"
        :key="file.id"
        class="file-card"
        :class="{
          'file-card--uploading': !file.uploaded,
          'file-card--error': file.error,
        }"
        @click="openPreview(file)"
      >
        <!-- Thumbnail -->
        <div class="file-card__thumbnail">
          <!-- Image preview -->
          <img
            v-if="file.thumbnail"
            :src="file.thumbnail"
            :alt="file.name"
            class="file-card__image"
          />
          
          <!-- Video preview -->
          <div v-else-if="file.isVideo" class="file-card__video-placeholder">
            <video
              v-if="file.videoData"
              :src="file.videoData"
              class="file-card__video-preview"
              muted
              @loadeddata="captureVideoFrame(file)"
            ></video>
            <div v-else class="file-card__icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="file-card__video-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <!-- Document icon -->
          <div v-else class="file-card__icon-wrapper" :class="getFileIconClass(file)">
            <!-- PDF -->
            <svg v-if="file.type === 'application/pdf'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
              <path fill-rule="evenodd" d="M6.922 4.929c.69-.628 1.681-.968 2.705-.968 1.024 0 2.015.34 2.705.968l4.828 4.414c.69.628 1.68.968 2.704.968.79 0 1.547-.218 2.166-.629V4.17A2.417 2.417 0 0020.102 2C18.193 2 16.39 3.099 15.404 4.522L9.422 9.665a2.73 2.73 0 01-1.59.46c-.744 0-1.452-.228-2.01-.64L6.922 4.929zM2.294 14.587c-.69.628-1.681.968-2.704.968A2.735 2.735 0 00-1 16.523c0 1.024.34 2.015.968 2.704l4.828 4.414c.69.628 1.681.968 2.705.968.79 0 1.547-.218 2.165-.629v-1.504A2.417 2.417 0 007.902 20C6.593 20 5.29 19.401 4.304 18.48l-4.01-3.667V14.587z" clip-rule="evenodd" />
            </svg>
            <!-- Word Document -->
            <svg v-else-if="file.type?.includes('word') || file.name?.endsWith('.doc') || file.name?.endsWith('.docx')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
              <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v16.5c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V10.5a.75.75 0 00-1.5 0v7.125c0 .414-.336.75-.75.75H5.625a.75.75 0 00-.75.75v4.875c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V3.375a.75.75 0 00-1.5 0V6c0-.621-.504-1.125-1.125-1.125H5.625z" clip-rule="evenodd" />
              <path d="M9.156 12.566h3.563a.188.188 0 00.188-.188V9.75a.188.188 0 00-.188-.188H9.156a.188.188 0 00-.188.188v2.628c0 .104.084.188.188.188zM9.156 15.972h3.563a.188.188 0 00.188-.188v-2.553a.188.188 0 00-.188-.188H9.156a.188.188 0 00-.188.188v2.553c0 .104.084.188.188.188zM9.156 19.378h3.563a.188.188 0 00.188-.188v-2.553a.188.188 0 00-.188-.188H9.156a.188.188 0 00-.188.188v2.553c0 .104.084.188.188.188z" />
            </svg>
            <!-- Excel -->
            <svg v-else-if="file.type?.includes('excel') || file.type?.includes('spreadsheet') || file.name?.endsWith('.xls') || file.name?.endsWith('.xlsx')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
              <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v16.5c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V10.5a.75.75 0 00-1.5 0v7.125c0 .414-.336.75-.75.75H5.625a.75.75 0 00-.75.75v4.875c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V3.375a.75.75 0 00-1.5 0V6c0-.621-.504-1.125-1.125-1.125H5.625z" clip-rule="evenodd" />
              <path d="M8.782 12.866h1.5v3.563H8.782v-3.563zm0-4.219h1.5v2.063H8.782V8.647zm0 8.437h1.5v.938H8.782v-.938zm4.5 0h1.5v.938h-1.5v-.938zm0-4.219h1.5v2.063h-1.5V12.866zm0 4.219h1.5v3.563h-1.5v-3.563zm0-8.437h1.5v2.063h-1.5V8.647z" />
            </svg>
            <!-- Generic file -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
              <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v16.5c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V10.5a.75.75 0 00-1.5 0v7.125c0 .414-.336.75-.75.75H5.625a.75.75 0 00-.75.75v4.875c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V3.375a.75.75 0 00-1.5 0V6c0-.621-.504-1.125-1.125-1.125H5.625z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Delete button - always visible -->
          <button
            type="button"
            class="file-card__delete"
            @click.stop="handleDelete(file.id)"
            :title="$t('upload.delete') || 'Delete'"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>

          <!-- Upload progress overlay -->
          <div v-if="!file.uploaded" class="file-card__upload-overlay">
            <div class="upload-spinner"></div>
            <span v-if="file.progress > 0" class="upload-percent">{{ file.progress }}%</span>
          </div>

          <!-- Error overlay -->
          <div v-if="file.error" class="file-card__error-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- File info -->
        <div class="file-card__info">
          <p class="file-card__name" :title="file.name">{{ truncateName(file.name) }}</p>
          <p class="file-card__size">{{ file.formattedSize || formatFileSize(file.size) }}</p>
        </div>
      </div>
    </TransitionGroup>

    <!-- Empty state -->
    <div v-if="files.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
        <path fill-rule="evenodd" d="M3 9a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9zm0 6.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
      </svg>
      <p>{{ $t('upload.noFiles') || 'No files uploaded yet' }}</p>
    </div>
  </div>

  <!-- Preview Overlay -->
  <FilePreviewOverlay
    v-if="previewFile"
    :file="previewFile"
    @close="closePreview"
  />
</template>

<script setup>
import { ref } from 'vue';
import FilePreviewOverlay from './FilePreviewOverlay.vue';
import { formatFileSize } from '../../utils/mediaUrl.js';

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  deletable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['delete', 'preview']);

// Preview state
const previewFile = ref(null);

// Truncate long filenames
const truncateName = (name, maxLength = 20) => {
  if (!name || name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  const baseName = name.slice(0, name.length - ext.length - 1);
  return baseName.slice(0, maxLength - ext.length - 4) + '...' + '.' + ext;
};

// Get icon class based on file type
const getFileIconClass = (file) => {
  if (file.type === 'application/pdf') return 'icon-pdf';
  if (file.type?.includes('word') || file.name?.endsWith('.doc')) return 'icon-doc';
  if (file.type?.includes('excel') || file.name?.endsWith('.xls')) return 'icon-xls';
  return 'icon-default';
};

// Capture video frame for thumbnail
const captureVideoFrame = (file) => {
  // This would capture the first frame of the video
  // Implementation depends on browser support
};

// Open preview
const openPreview = (file) => {
  if (file.uploaded || file.thumbnail || file.videoData) {
    previewFile.value = file;
    emit('preview', file);
  }
};

// Close preview
const closePreview = () => {
  previewFile.value = null;
};

// Handle delete
const handleDelete = (fileId) => {
  if (props.deletable) {
    emit('delete', fileId);
  }
};
</script>

<style scoped>
.file-preview-grid {
  width: 100%;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.file-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

.file-card--uploading {
  opacity: 0.7;
}

.file-card--error {
  border-color: #ef4444;
}

.file-card__thumbnail {
  position: relative;
  aspect-ratio: 1;
  background: #f9fafb;
  overflow: hidden;
}

.file-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-card__video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.file-card__video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-card__video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.file-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9ca3af;
}

.file-card__icon-wrapper.icon-pdf {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.file-card__icon-wrapper.icon-doc {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.file-card__icon-wrapper.icon-xls {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.file-card__icon-wrapper.icon-default {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.file-card__delete {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  opacity: 1;
  transition: all 0.2s ease;
  z-index: 10;
}

.file-card__delete:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.file-card__upload-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  gap: 8px;
}

.upload-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-percent {
  font-size: 12px;
  font-weight: 500;
}

.file-card__error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.file-card__info {
  padding: 10px;
}

.file-card__name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-card__size {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #9ca3af;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Animations */
.file-list-enter-active {
  animation: fadeInScale 0.3s ease;
}

.file-list-leave-active {
  animation: fadeOutScale 0.2s ease;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOutScale {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .file-preview-grid {
    /* Container inherits background */
  }

  .file-card {
    background: #1e293b;
    border-color: #334155;
  }

  .file-card:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  }

  .file-card__thumbnail {
    background: #0f172a;
  }

  .file-card__icon-wrapper {
    color: #64748b;
  }

  .file-card__info {
    background: #1e293b;
  }

  .file-card__name {
    color: #f1f5f9;
  }

  .file-card__size {
    color: #94a3b8;
  }

  .file-card__upload-overlay {
    background: rgba(15, 23, 42, 0.8);
  }

  .empty-state {
    color: #64748b;
    background: transparent;
  }

  .empty-state p {
    color: #94a3b8;
  }
}

/* Additional dark mode support via class */
.dark .file-preview-grid .file-card {
  background: #1e293b;
  border-color: #334155;
}

.dark .file-preview-grid .file-card__thumbnail {
  background: #0f172a;
}

.dark .file-preview-grid .file-card__info {
  background: #1e293b;
}

.dark .file-preview-grid .file-card__name {
  color: #f1f5f9;
}

.dark .file-preview-grid .file-card__size {
  color: #94a3b8;
}

.dark .file-preview-grid .file-card__icon-wrapper {
  color: #64748b;
}
</style>
