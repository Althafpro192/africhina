<template>
  <Transition name="alert-fade">
    <div
      v-if="modelValue"
      :class="[
        'rounded-xl border p-4 flex items-start gap-3',
        containerClass
      ]"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <!-- Icon -->
      <span
        :class="[
          'material-symbols-outlined text-[22px] flex-shrink-0 mt-0.5',
          iconClass
        ]"
      >
        {{ iconName }}
      </span>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4
          v-if="title"
          :class="['text-sm font-semibold mb-0.5', titleClass]"
        >
          {{ title }}
        </h4>
        <div :class="['text-sm', messageClass]">
          <slot>
            <p>{{ message }}</p>
          </slot>
        </div>
        <div v-if="$slots.actions" class="mt-3 flex gap-2 flex-wrap">
          <slot name="actions" />
        </div>
      </div>

      <!-- Dismiss -->
      <button
        v-if="dismissible"
        type="button"
        :class="[
          'flex-shrink-0 -mr-1 -mt-1 p-1 rounded transition-colors',
          dismissClass
        ]"
        :aria-label="dismissAriaLabel"
        @click="handleDismiss"
      >
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'error', 'warning', 'info'].includes(v)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  /** Override the icon name (Material Symbols). */
  icon: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const dismissAriaLabel = computed(() => t('common.close'));

const iconName = computed(() => {
  if (props.icon) return props.icon;
  const map = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
  return map[props.type] || 'info';
});

const containerClass = computed(() => {
  const map = {
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60',
    error: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60'
  };
  return map[props.type] || map.info;
});

const iconClass = computed(() => {
  const map = {
    success: 'text-emerald-600 dark:text-emerald-400',
    error: 'text-rose-600 dark:text-rose-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400'
  };
  return map[props.type] || map.info;
});

const titleClass = computed(() => {
  const map = {
    success: 'text-emerald-800 dark:text-emerald-200',
    error: 'text-rose-800 dark:text-rose-200',
    warning: 'text-amber-800 dark:text-amber-200',
    info: 'text-blue-800 dark:text-blue-200'
  };
  return map[props.type] || map.info;
});

const messageClass = computed(() => {
  const map = {
    success: 'text-emerald-700 dark:text-emerald-300',
    error: 'text-rose-700 dark:text-rose-300',
    warning: 'text-amber-700 dark:text-amber-300',
    info: 'text-blue-700 dark:text-blue-300'
  };
  return map[props.type] || map.info;
});

const dismissClass = computed(() => {
  const map = {
    success: 'text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/60',
    error: 'text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60',
    warning: 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/60',
    info: 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/60'
  };
  return map[props.type] || map.info;
});

const handleDismiss = () => {
  emit('update:modelValue', false);
  emit('close');
};
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.2s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
