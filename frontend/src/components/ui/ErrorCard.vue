<template>
  <div class="error-card" :class="[`severity-${severity}`]">
    <div class="error-icon">
      <svg v-if="severity === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="severity === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="error-content">
      <h4 v-if="title" class="error-title">{{ title }}</h4>
      <p class="error-message">{{ message }}</p>
      <div v-if="details && showDetails" class="error-details">
        <pre>{{ details }}</pre>
      </div>
    </div>
    <div class="error-actions">
      <button v-if="details && !showDetails" @click="showDetails = true" class="btn-details">
        {{ $t('common.showDetails') || 'Show Details' }}
      </button>
      <button v-if="details && showDetails" @click="showDetails = false" class="btn-details">
        {{ $t('common.hideDetails') || 'Hide Details' }}
      </button>
      <button v-if="retry" @click="$emit('retry')" class="btn-retry">
        {{ $t('common.retry') || 'Retry' }}
      </button>
      <button v-if="dismissible" @click="$emit('dismiss')" class="btn-dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: [String, Object, Array],
    default: null
  },
  severity: {
    type: String,
    default: 'error',
    validator: (v) => ['error', 'warning', 'info'].includes(v)
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  retry: {
    type: Boolean,
    default: false
  }
})

defineEmits(['dismiss', 'retry'])

const showDetails = ref(false)
</script>

<style scoped>
.error-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--bg-elevated, #ffffff);
  border-left: 4px solid;
}

.severity-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.severity-warning {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.severity-info {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.error-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.severity-error .error-icon { color: #ef4444; }
.severity-warning .error-icon { color: #f59e0b; }
.severity-info .error-icon { color: #3b82f6; }

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0 0 0.25rem;
}

.error-message {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
  line-height: 1.5;
}

.error-details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.375rem;
  overflow-x: auto;
}

.error-details pre {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-details,
.btn-retry {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  background-color: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-details:hover,
.btn-retry:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-dismiss {
  padding: 0.25rem;
  color: var(--text-muted, #9ca3af);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-dismiss:hover {
  color: var(--text-secondary, #6b7280);
}

.btn-dismiss svg {
  width: 16px;
  height: 16px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .severity-error {
    background-color: rgba(239, 68, 68, 0.1);
  }
  
  .severity-warning {
    background-color: rgba(245, 158, 11, 0.1);
  }
  
  .severity-info {
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .error-title {
    color: var(--text-primary, #f3f4f6);
  }
  
  .error-details {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
