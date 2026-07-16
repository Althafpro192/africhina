<template>
  <div class="relative">
    <button 
      @click="toggleDropdown" 
      class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
    >
      <span class="text-xl">{{ currentFlag }}</span>
      <span>{{ currentLang }}</span>
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <div v-if="isOpen" class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
      <button 
        v-for="lang in languages" 
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
        :class="{ 'bg-blue-50 text-blue-600': i18n.locale === lang.code }"
      >
        <span class="text-xl">{{ lang.flag }}</span>
        <span>{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const isOpen = ref(false);

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' } // <--- Tambahkan Prancis
];

const currentLang = computed(() => {
  return languages.find(l => l.code === i18n.locale)?.name || 'English';
});

const currentFlag = computed(() => {
  return languages.find(l => l.code === i18n.locale)?.flag || '🇺🇸';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const changeLanguage = (code) => {
  i18n.locale = code;
  localStorage.setItem('locale', code);
  isOpen.value = false;
  
  // Opsional: Reload halaman jika diperlukan untuk menerjemahkan konten statis yang tidak reaktif
  // window.location.reload(); 
};

// Tutup dropdown jika klik di luar
const closeDropdown = () => {
  isOpen.value = false;
};

// Listener global bisa ditambahkan di onMounted jika diperlukan
</script>