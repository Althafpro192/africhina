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
    case 'menunggu_penawaran_admin': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50';
    case 'menunggu_pemilihan_buyer': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50';
    case 'menunggu_pembayaran': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50';
    case 'dikirim': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50';
    case 'selesai': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50';
    case 'processing': return 'bg-status-processing-bg text-status-processing-text';
    case 'quoted': return 'bg-status-quoted-bg text-status-quoted-text';
    case 'production': return 'bg-status-processing-bg text-status-processing-text';
    case 'completed': return 'bg-status-completed-bg text-status-completed-text';
    default: return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
});

const statusLabel = computed(() => {
  return t(`status.${props.status.toLowerCase()}`) || props.status;
});
</script>
