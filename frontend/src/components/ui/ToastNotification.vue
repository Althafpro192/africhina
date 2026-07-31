<template>
  <Transition name="toast-slide">
    <div v-if="toastState.show" 
         class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer"
         :class="{
           'bg-emerald-50 border border-emerald-200 text-emerald-700': toastState.type === 'success',
           'bg-red-50 border border-red-200 text-red-700': toastState.type === 'error',
           'bg-blue-50 border border-blue-200 text-blue-700': toastState.type === 'info',
           'bg-yellow-50 border border-yellow-200 text-yellow-700': toastState.type === 'warning',
         }"
         @click="closeToast"
    >
      <span class="material-symbols-outlined text-[20px]">
        {{ toastState.type === 'success' ? 'check_circle' : 
           toastState.type === 'error' ? 'error' : 
           toastState.type === 'info' ? 'info' : 'warning' }}
      </span>
      <span class="font-semibold text-sm">{{ toastState.message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { useToast } from '../../composables/useToast';
const { toastState, closeToast } = useToast();
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
