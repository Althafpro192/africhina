<template>
  <div class="loading-container" :class="[sizeClass, variantClass]">
    <div class="spinner" :class="[`spinner-${variant}`]">
      <div v-if="variant === 'circular'" class="circular-spinner">
        <svg viewBox="0 0 50 50">
          <circle
            class="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke-width="4"
          />
        </svg>
      </div>
      <div v-else-if="variant === 'dots'" class="dots-spinner">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div v-else-if="variant === 'bars'" class="bars-spinner">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
      <div v-else class="default-spinner">
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
      </div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v)
  },
  variant: {
    type: String,
    default: 'circular',
    validator: (v) => ['circular', 'dots', 'bars', 'default'].includes(v)
  },
  text: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'primary'
  }
})

const sizeClass = computed(() => `size-${props.size}`)
const variantClass = computed(() => `variant-${props.variant}`)
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.loading-text {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin: 0;
}

/* Size variants */
.size-xs { transform: scale(0.5); }
.size-sm { transform: scale(0.75); }
.size-lg { transform: scale(1.25); }
.size-xl { transform: scale(1.5); }

/* ========== Circular Spinner ========== */
.circular-spinner {
  width: 40px;
  height: 40px;
}

.circular-spinner svg {
  animation: rotate 1.5s linear infinite;
  width: 100%;
  height: 100%;
}

.circular-spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* ========== Dots Spinner ========== */
.dots-spinner {
  display: flex;
  gap: 6px;
}

.dots-spinner .dot {
  width: 10px;
  height: 10px;
  background-color: currentColor;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dots-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.dots-spinner .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* ========== Bars Spinner ========== */
.bars-spinner {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 40px;
}

.bars-spinner .bar {
  width: 5px;
  background-color: currentColor;
  animation: stretch 1s infinite ease-in-out;
}

.bars-spinner .bar:nth-child(1) { animation-delay: -0.4s; }
.bars-spinner .bar:nth-child(2) { animation-delay: -0.3s; }
.bars-spinner .bar:nth-child(3) { animation-delay: -0.2s; }

@keyframes stretch {
  0%, 40%, 100% { height: 10px; }
  20% { height: 25px; }
}

/* ========== Default Spinner (Blades) ========== */
.default-spinner {
  width: 40px;
  height: 40px;
  position: relative;
}

.default-spinner .blade {
  position: absolute;
  width: 3px;
  height: 10px;
  background-color: currentColor;
  left: 50%;
  top: 50%;
  transform-origin: center -10px;
  border-radius: 2px;
  opacity: 0;
  animation: fade-in 1s linear infinite;
}

.default-spinner .blade:nth-child(1) { transform: translateX(-50%) rotate(0deg); animation-delay: 0s; }
.default-spinner .blade:nth-child(2) { transform: translateX(-50%) rotate(45deg); animation-delay: 0.125s; }
.default-spinner .blade:nth-child(3) { transform: translateX(-50%) rotate(90deg); animation-delay: 0.25s; }
.default-spinner .blade:nth-child(4) { transform: translateX(-50%) rotate(135deg); animation-delay: 0.375s; }
.default-spinner .blade:nth-child(5) { transform: translateX(-50%) rotate(180deg); animation-delay: 0.5s; }
.default-spinner .blade:nth-child(6) { transform: translateX(-50%) rotate(225deg); animation-delay: 0.625s; }
.default-spinner .blade:nth-child(7) { transform: translateX(-50%) rotate(270deg); animation-delay: 0.75s; }
.default-spinner .blade:nth-child(8) { transform: translateX(-50%) rotate(315deg); animation-delay: 0.875s; }

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
