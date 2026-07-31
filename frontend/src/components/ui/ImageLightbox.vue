<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
        
        <!-- Close button -->
        <button 
          @click="close"
          class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Navigation arrows for multiple images -->
        <button 
          v-if="images.length > 1 && currentIndex > 0"
          @click="prev"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        
        <button 
          v-if="images.length > 1 && currentIndex < images.length - 1"
          @click="next"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>

        <!-- Image container -->
        <div class="relative max-w-5xl max-h-[90vh] w-full">
          <img 
            :src="currentImage" 
            :alt="alt"
            class="max-w-full max-h-[85vh] mx-auto object-contain rounded-lg shadow-2xl"
          />
          
          <!-- Image counter -->
          <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>

        <!-- Thumbnail strip for multiple images -->
        <div v-if="images.length > 1" class="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 max-w-full px-8">
          <button
            v-for="(img, idx) in images"
            :key="idx"
            @click="currentIndex = idx"
            :class="[
              'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer',
              idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
            ]"
          >
            <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  alt: {
    type: String,
    default: 'Image'
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  startIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const currentIndex = ref(props.startIndex)

const currentImage = computed(() => {
  if (props.images.length === 0) return ''
  return props.images[currentIndex.value] || props.images[0]
})

watch(() => props.startIndex, (val) => {
  currentIndex.value = val
})

const close = () => {
  isOpen.value = false
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!isOpen.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

// Add event listener when component mounts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: all 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-from img,
.lightbox-leave-to img {
  transform: scale(0.9);
}
</style>
