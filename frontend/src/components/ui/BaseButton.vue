<template>
  <button 
    :class="computedClasses"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, outline, white
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg
  },
  block: {
    type: Boolean,
    default: false
  }
});

const computedClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#4f46e5] to-[#3525cd] text-white shadow-lg hover:opacity-95 active:scale-95',
    outline: 'border-2 border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5]/5 active:scale-95',
    white: 'bg-white text-[#4f46e5] hover:bg-gray-50 shadow-md active:scale-95'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]'
  };

  return [
    base,
    variants[props.variant] || variants.primary,
    sizes[props.size] || sizes.md,
    props.block ? 'w-full' : ''
  ].join(' ');
});

defineEmits(['click']);
</script>
