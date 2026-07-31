<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleCancel"
        ></div>
        
        <!-- Modal content -->
        <div 
          class="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-slate-800 transition-all"
          :class="{ 'scale-100 opacity-100': isOpen, 'scale-95 opacity-0': !isOpen }"
        >
          <!-- Icon -->
          <div 
            :class="[
              'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4',
              iconBgClass
            ]"
          >
            <span class="material-symbols-outlined text-2xl" :class="iconClass">
              {{ iconName }}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
            {{ title }}
          </h3>

          <!-- Message -->
          <p class="text-sm text-gray-600 dark:text-slate-400 text-center mb-6">
            {{ message }}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button 
              @click="handleCancel"
              class="flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all
                     bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700
                     text-gray-700 dark:text-slate-300"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="handleConfirm"
              :class="[
                'flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-white',
                confirmButtonClass
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    default: 'warning' // 'warning' | 'danger' | 'info' | 'success'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Icon and color classes based on type
const iconName = computed(() => {
  const icons = {
    warning: 'warning',
    danger: 'error',
    info: 'info',
    success: 'check_circle'
  }
  return icons[props.type] || 'warning'
})

const iconClass = computed(() => {
  const classes = {
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-emerald-600 dark:text-emerald-400'
  }
  return classes[props.type] || classes.warning
})

const iconBgClass = computed(() => {
  const classes = {
    warning: 'bg-amber-100 dark:bg-amber-950/60',
    danger: 'bg-red-100 dark:bg-red-950/60',
    info: 'bg-blue-100 dark:bg-blue-950/60',
    success: 'bg-emerald-100 dark:bg-emerald-950/60'
  }
  return classes[props.type] || classes.warning
})

const confirmButtonClass = computed(() => {
  const classes = {
    warning: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25',
    danger: 'bg-red-600 hover:bg-red-500 shadow-red-500/25',
    info: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',
    success: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25'
  }
  return classes[props.type] || classes.warning
})

const handleConfirm = () => {
  emit('confirm', true)
  isOpen.value = false
}

const handleCancel = () => {
  emit('cancel', false)
  isOpen.value = false
}

// Handle escape key
const handleKeydown = (e) => {
  if (!isOpen.value) return
  if (e.key === 'Escape') handleCancel()
  if (e.key === 'Enter') handleConfirm()
}

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
