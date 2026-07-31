import { ref } from 'vue'

// Global state for the confirmation modal
const confirmState = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'warning', // 'warning' | 'danger' | 'info' | 'success'
  resolve: null
})

export function useConfirm() {
  /**
   * Show a confirmation dialog and return a promise
   * @param {Object} options - Configuration options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message
   * @param {string} [options.confirmText='Confirm'] - Confirm button text
   * @param {string} [options.cancelText='Cancel'] - Cancel button text
   * @param {string} [options.type='warning'] - Dialog type: 'warning' | 'danger' | 'info' | 'success'
   * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
   */
  const confirm = (options) => {
    return new Promise((resolve) => {
      confirmState.value = {
        show: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        resolve
      }
      confirmState.value.resolve = resolve
    })
  }

  /**
   * Convenience methods for common confirmation types
   */
  const confirmDelete = (name, type = 'danger') => {
    return confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type
    })
  }

  const confirmBlock = (name, isBlocked = false) => {
    return confirm({
      title: isBlocked ? 'Unblock Confirmation' : 'Block Confirmation',
      message: isBlocked 
        ? `Are you sure you want to unblock "${name}"?`
        : `Are you sure you want to block "${name}"?`,
      confirmText: isBlocked ? 'Unblock' : 'Block',
      cancelText: 'Cancel',
      type: 'warning'
    })
  }

  const confirmAction = (title, message, type = 'warning') => {
    return confirm({
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type
    })
  }

  return {
    confirmState,
    confirm,
    confirmDelete,
    confirmBlock,
    confirmAction
  }
}
