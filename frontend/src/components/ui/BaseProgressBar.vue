<template>
  <div class="w-full">
    <div class="flex justify-between mb-1">
      <span class="text-sm font-medium text-primary">Production Progress</span>
      <span class="text-sm font-medium text-primary">{{ progress }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div class="bg-primary h-2.5 rounded-full transition-all duration-500" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  }
});
</script>
