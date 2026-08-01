<template>
  <div class="image-gallery">
    <!-- Preview / current image display -->
    <div class="image-gallery__preview" :class="{ 'image-gallery__preview--empty': !displayUrl }">
      <img
        v-if="displayUrl"
        :src="displayUrl"
        :alt="alt"
        class="image-gallery__img"
        @click="openLightbox"
        @error="onImageError"
      />
      <div v-else class="image-gallery__placeholder">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-sm text-gray-500 mt-2">{{ placeholderText }}</span>
      </div>

      <!-- Loading overlay -->
      <div v-if="uploading" class="image-gallery__loading">
        <div class="flex flex-col items-center">
          <svg class="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span v-if="uploadProgress > 0" class="text-white text-sm mt-2">{{ uploadProgress }}%</span>
        </div>
      </div>
    </div>

    <!-- Upload controls -->
    <div class="image-gallery__controls mt-3 flex items-center gap-2">
      <label
        class="image-gallery__upload-btn"
        :class="{ 'image-gallery__upload-btn--disabled': uploading }"
      >
        <input
          ref="fileInput"
          type="file"
          :accept="acceptAttr"
          class="hidden"
          :disabled="uploading"
          @change="onFileChange"
        />
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>{{ displayUrl ? replaceText : uploadText }}</span>
      </label>

      <button
        v-if="displayUrl && !readonly"
        type="button"
        class="image-gallery__delete-btn"
        :disabled="uploading"
        @click="onDelete"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>{{ deleteText }}</span>
      </button>
    </div>

    <!-- Error message -->
    <p v-if="error" class="image-gallery__error">{{ error }}</p>

    <!-- Lightbox overlay -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="image-gallery__lightbox"
        @click.self="closeLightbox"
        @keydown.esc="closeLightbox"
        tabindex="-1"
      >
        <button class="image-gallery__lightbox-close" @click="closeLightbox" aria-label="Close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          :src="displayUrl"
          :alt="alt"
          class="image-gallery__lightbox-img"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useImageUpload, buildImageUrl } from '@/composables/useImageUpload'
import axios from '@/api/axios'

const props = defineProps({
  entityId: { type: [String, Number], required: true },
  imageUrl: { type: String, default: '' },
  uploadEndpoint: { type: [String, Function], required: true },
  deleteEndpoint: { type: [String, Function], required: true },
  fieldName: { type: String, default: 'logo' },
  allowedTypes: { type: Array, default: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] },
  maxSizeMB: { type: Number, default: 5 },
  alt: { type: String, default: 'Image preview' },
  placeholderText: { type: String, default: 'No image' },
  uploadText: { type: String, default: 'Upload' },
  replaceText: { type: String, default: 'Replace' },
  deleteText: { type: String, default: 'Delete' },
  readonly: { type: Boolean, default: false },
  baseURL: { type: String, default: '' },
})

const emit = defineEmits(['uploaded', 'deleted', 'error'])

const fileInput = ref(null)
const lightboxOpen = ref(false)
const previewUrl = ref(null)
const internalUrl = ref(props.imageUrl || '')

const acceptAttr = computed(() => props.allowedTypes.join(','))

const currentImageUrl = computed(() => internalUrl.value || props.imageUrl)

const displayUrl = computed(() => {
  if (previewUrl.value) return previewUrl.value
  if (!currentImageUrl.value) return ''
  return buildImageUrl(currentImageUrl.value, props.baseURL)
})

const { uploading, error: uploadError, uploadProgress, upload, remove } = useImageUpload({
  uploadEndpoint: props.uploadEndpoint,
  deleteEndpoint: props.deleteEndpoint,
  maxSizeMB: props.maxSizeMB,
  acceptedTypes: props.allowedTypes,
})

const error = computed(() => uploadError.value)

watch(() => props.imageUrl, (v) => {
  if (v) internalUrl.value = v
  previewUrl.value = null
})

const onFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  // Preview
  const reader = new FileReader()
  reader.onload = (ev) => { previewUrl.value = ev.target.result }
  reader.readAsDataURL(file)

  const result = await upload(props.entityId, file, props.fieldName)
  if (result.success) {
    const newUrl = result.data.logo_url || result.data.photo_url || result.data.url || ''
    internalUrl.value = newUrl
    previewUrl.value = null
    emit('uploaded', { entityId: props.entityId, url: newUrl, data: result.data })
  } else {
    previewUrl.value = null
    emit('error', { entityId: props.entityId, error: result.error })
  }
  // Reset file input so same file can be re-selected
  if (fileInput.value) fileInput.value.value = ''
}

const onDelete = async () => {
  if (!confirm('Delete this image?')) return
  const result = await remove(props.entityId)
  if (result.success) {
    internalUrl.value = ''
    previewUrl.value = null
    emit('deleted', { entityId: props.entityId })
  } else {
    emit('error', { entityId: props.entityId, error: result.error })
  }
}

const openLightbox = () => {
  if (displayUrl.value) lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const onImageError = () => {
  console.warn('Image failed to load:', displayUrl.value)
}
</script>

<style scoped>
.image-gallery {
  display: inline-block;
}

.image-gallery__preview {
  position: relative;
  width: 12rem;
  height: 12rem;
  border-radius: 0.75rem;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
  transition: border-color 0.2s;
}

.image-gallery__preview:hover {
  border-color: #9ca3af;
}

.image-gallery__preview--empty {
  cursor: default;
}

.image-gallery__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-gallery__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
}

.image-gallery__loading {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-gallery__controls {
  display: flex;
  gap: 0.5rem;
}

.image-gallery__upload-btn,
.image-gallery__delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.image-gallery__upload-btn {
  background: #3b82f6;
  color: white;
}

.image-gallery__upload-btn:hover:not(:disabled) {
  background: #2563eb;
}

.image-gallery__upload-btn--disabled,
.image-gallery__upload-btn:disabled,
.image-gallery__delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-gallery__delete-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.image-gallery__delete-btn:hover:not(:disabled) {
  background: #fecaca;
}

.image-gallery__error {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.image-gallery__lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  outline: none;
}

.image-gallery__lightbox-img {
  max-width: 95%;
  max-height: 95%;
  object-fit: contain;
  border-radius: 0.5rem;
}

.image-gallery__lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.image-gallery__lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
