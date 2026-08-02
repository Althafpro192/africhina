<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div 
        v-if="isVisible"
        class="file-preview-overlay"
        @click="handleBackdropClick"
        @keydown.esc="close"
        @keydown.stop
      >
        <!-- Close button -->
        <button 
          class="overlay-close"
          @click="close"
          :title="$t('common.close') || 'Close'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Content wrapper -->
        <div class="overlay-content" @click.stop>
          <!-- Image -->
          <img
            v-if="isImage"
            :src="imageSrc"
            :alt="file?.name || 'Preview'"
            class="overlay-image"
          />

          <!-- Video -->
          <video
            v-else-if="isVideo"
            ref="videoRef"
            :src="videoSrc"
            class="overlay-video"
            controls
            :autoplay="autoplay"
          />

          <!-- PDF Document -->
          <div v-else-if="isPdf" class="overlay-document">
            <iframe
              :src="pdfSrc"
              class="overlay-pdf"
              frameborder="0"
            ></iframe>
          </div>

          <!-- Other Document -->
          <div v-else-if="isDocument" class="overlay-document-fallback">
            <div class="document-icon">
              <svg v-if="isWord" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v16.5c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V10.5a.75.75 0 00-1.5 0v7.125c0 .414-.336.75-.75.75H5.625a.75.75 0 00-.75.75v4.875c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V3.375a.75.75 0 00-1.5 0V6c0-.621-.504-1.125-1.125-1.125H5.625z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="isExcel" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v16.5c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V10.5a.75.75 0 00-1.5 0v7.125c0 .414-.336.75-.75.75H5.625a.75.75 0 00-.75.75v4.875c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V3.375a.75.75 0 00-1.5 0V6c0-.621-.504-1.125-1.125-1.125H5.625z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v16.5c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V10.5a.75.75 0 00-1.5 0v7.125c0 .414-.336.75-.75.75H5.625a.75.75 0 00-.75.75v4.875c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V3.375a.75.75 0 00-1.5 0V6c0-.621-.504-1.125-1.125-1.125H5.625z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="document-name">{{ file?.name }}</p>
            <p class="document-size">{{ file?.formattedSize || formatFileSize(file?.size) }}</p>
            <a
              v-if="fileUrl"
              :href="fileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="document-download"
              @click.prevent="openInNewTab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" clip-rule="evenodd" />
                <path fill-rule="evenodd" d="M3 20.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 20.25z" clip-rule="evenodd" />
              </svg>
              {{ $t('upload.download') || 'Download' }}
            </a>
          </div>
        </div>

        <!-- File info -->
        <div class="overlay-info" v-if="file">
          <p class="overlay-filename">{{ file.name }}</p>
          <p class="overlay-filesize">{{ file.formattedSize || formatFileSize(file.size) }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { getMediaUrl, formatFileSize, isImage as checkIsImage, isVideo as checkIsVideo, isDocument as checkIsDocument } from '../../utils/mediaUrl.js';

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

// Refs
const isVisible = ref(true);
const videoRef = ref(null);

// Check file types
const isImage = computed(() => {
  if (!props.file) return false;
  return props.file.isImage || checkIsImage(props.file.type) || checkIsImage(props.file.mimeType);
});

const isVideo = computed(() => {
  if (!props.file) return false;
  return props.file.isVideo || checkIsVideo(props.file.type) || checkIsVideo(props.file.mimeType);
});

const isPdf = computed(() => {
  if (!props.file) return false;
  return props.file.type === 'application/pdf' || 
         props.file.mimeType === 'application/pdf' ||
         props.file.name?.endsWith('.pdf');
});

const isDocument = computed(() => {
  if (!props.file) return false;
  return !isImage.value && !isVideo.value && !isPdf.value && (
    checkIsDocument(props.file.type) || 
    checkIsDocument(props.file.mimeType) ||
    props.file.name?.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i)
  );
});

const isWord = computed(() => {
  if (!props.file) return false;
  return props.file.name?.match(/\.(doc|docx)$/i);
});

const isExcel = computed(() => {
  if (!props.file) return false;
  return props.file.name?.match(/\.(xls|xlsx)$/i);
});

// Get image source
const imageSrc = computed(() => {
  if (!props.file) return '';
  // Priority: thumbnail > url > videoUrl
  return props.file.thumbnail || getMediaUrl(props.file.url) || '';
});

// Get video source
const videoSrc = computed(() => {
  if (!props.file) return '';
  // Priority: videoUrl (local preview) > url (uploaded)
  return props.file.videoUrl || getMediaUrl(props.file.url) || '';
});

// Get PDF source
const pdfSrc = computed(() => {
  if (!props.file) return '';
  return getMediaUrl(props.file.url) || '';
});

// Get file URL for download
const fileUrl = computed(() => {
  if (!props.file) return '';
  return getMediaUrl(props.file.url) || '';
});

// Close overlay
const close = () => {
  isVisible.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
};

// Handle backdrop click
const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    close();
  }
};

// Open in new tab
const openInNewTab = () => {
  if (fileUrl.value) {
    window.open(fileUrl.value, '_blank', 'noopener,noreferrer');
  }
};

// Handle escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isVisible.value) {
    close();
  }
};

// Handle video autoplay
watch(() => props.autoplay, (newVal) => {
  if (newVal && videoRef.value) {
    nextTick(() => {
      videoRef.value?.play();
    });
  }
}, { immediate: true });

// Setup event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.file-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  /* Blur backdrop as specified */
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Close button - large as specified */
.overlay-close {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10001;
}

.overlay-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.1);
}

.overlay-close svg {
  width: 28px;
  height: 28px;
}

/* Content wrapper */
.overlay-content {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: zoomIn 0.3s ease;
}

/* Image */
.overlay-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Video */
.overlay-video {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* PDF iframe */
.overlay-document {
  width: 80vw;
  height: 85vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.overlay-pdf {
  width: 100%;
  height: 100%;
  border: none;
}

/* Document fallback */
.overlay-document-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: white;
  border-radius: 16px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.document-icon {
  margin-bottom: 24px;
  color: #6366f1;
}

.document-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
  word-break: break-all;
}

.document-size {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
}

.document-download {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.document-download:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

/* File info */
.overlay-info {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 12px 24px;
  border-radius: 8px;
  text-align: center;
  z-index: 10001;
}

.overlay-filename {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0 0 4px;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overlay-filesize {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Animations */
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Vue transitions */
.overlay-enter-active {
  animation: fadeIn 0.3s ease;
}

.overlay-leave-active {
  animation: fadeOut 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
