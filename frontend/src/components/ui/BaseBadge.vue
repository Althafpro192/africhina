<template>
  <span :class="['px-3 py-1 rounded-full text-xs font-semibold', statusClass]">
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  status: {
    type: String,
    required: true,
  }
});

const { t } = useI18n();

const statusClass = computed(() => {
  switch (props.status.toLowerCase()) {
    case 'pending': return 'bg-status-pending-bg text-status-pending-text';
    case 'processing': return 'bg-status-processing-bg text-status-processing-text';
    case 'quoted': return 'bg-status-quoted-bg text-status-quoted-text';
    case 'production': return 'bg-status-processing-bg text-status-processing-text';
    case 'completed': return 'bg-status-completed-bg text-status-completed-text';
    default: return 'bg-gray-100 text-gray-800';
  }
});

const statusLabel = computed(() => {
  return t(`status.${props.status.toLowerCase()}`) || props.status;
});
</script>
