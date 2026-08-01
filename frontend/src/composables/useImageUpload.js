import { ref, computed } from 'vue'
import axios from '@/api/axios'

/**
 * Composable for handling image uploads to a specific entity (supplier logo, driver photo, etc.)
 * Supports both multipart upload (recommended) and base64 fallback.
 */
export function useImageUpload(options = {}) {
  const {
    uploadEndpoint, // e.g. (id) => `/admin/suppliers/${id}/logo`
    deleteEndpoint, // e.g. (id) => `/admin/suppliers/${id}/logo`
    maxSizeMB = 5,
    acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'],
  } = options

  const uploading = ref(false)
  const uploadError = ref(null)
  const uploadProgress = ref(0)
  const previewUrl = ref(null)
  const currentImageUrl = ref(null)

  const isValidFile = (file) => {
    if (!file) return { valid: false, error: 'No file selected' }
    if (!acceptedTypes.includes(file.type)) {
      return { valid: false, error: `Invalid type. Allowed: ${acceptedTypes.join(', ')}` }
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `File too large. Max ${maxSizeMB}MB` }
    }
    return { valid: true }
  }

  const previewFile = (file) => {
    if (!file) {
      previewUrl.value = null
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }

  /**
   * Upload a file via multipart form data
   * @param {number|string} entityId - The ID of the entity
   * @param {File} file - The file to upload
   * @param {string} fieldName - The form field name (default: 'logo' or 'photo')
   */
  const upload = async (entityId, file, fieldName = 'logo') => {
    uploadError.value = null
    const validation = isValidFile(file)
    if (!validation.valid) {
      uploadError.value = validation.error
      return { success: false, error: validation.error }
    }

    uploading.value = true
    uploadProgress.value = 0
    try {
      const formData = new FormData()
      formData.append(fieldName, file)

      const url = typeof uploadEndpoint === 'function' ? uploadEndpoint(entityId) : uploadEndpoint
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            uploadProgress.value = Math.round((e.loaded * 100) / e.total)
          }
        },
      })

      if (response.data && response.data.success) {
        currentImageUrl.value = response.data.logo_url || response.data.photo_url || response.data.url
        previewUrl.value = null
        uploadProgress.value = 100
        return { success: true, data: response.data }
      }
      return { success: false, error: 'Upload failed', data: response.data }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Upload failed'
      uploadError.value = msg
      return { success: false, error: msg }
    } finally {
      uploading.value = false
    }
  }

  /**
   * Delete the current image
   */
  const remove = async (entityId) => {
    uploadError.value = null
    uploading.value = true
    try {
      const url = typeof deleteEndpoint === 'function' ? deleteEndpoint(entityId) : deleteEndpoint
      const response = await axios.delete(url)
      currentImageUrl.value = null
      previewUrl.value = null
      return { success: true, data: response.data }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Delete failed'
      uploadError.value = msg
      return { success: false, error: msg }
    } finally {
      uploading.value = false
    }
  }

  return {
    uploading,
    uploadError,
    uploadProgress,
    previewUrl,
    currentImageUrl,
    isValidFile,
    previewFile,
    upload,
    remove,
  }
}

/**
 * Helper to build a full URL for a stored image.
 * Handles absolute URLs, /storage paths, and base64 data URLs.
 */
export function buildImageUrl(url, baseURL = '') {
  if (!url) return ''
  if (url.startsWith('data:')) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return baseURL + url
  return baseURL + '/' + url
}

export default useImageUpload
