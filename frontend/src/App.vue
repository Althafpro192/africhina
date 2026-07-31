<template>
  <ToastNotification />
  <ConfirmModal 
    :modelValue="confirmState.show" 
    :title="confirmState.title"
    :message="confirmState.message"
    :confirmText="confirmState.confirmText"
    :cancelText="confirmState.cancelText"
    :type="confirmState.type"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
  <router-view></router-view>
</template>

<script setup>
import ToastNotification from './components/ui/ToastNotification.vue';
import ConfirmModal from './components/ui/ConfirmModal.vue';
import { useConfirm } from './composables/useConfirm.js';

const { confirmState, confirm } = useConfirm();

const handleConfirm = () => {
  if (confirmState.value.resolve) {
    confirmState.value.resolve(true);
  }
};

const handleCancel = () => {
  if (confirmState.value.resolve) {
    confirmState.value.resolve(false);
  }
  confirmState.value.show = false;
};
</script>
