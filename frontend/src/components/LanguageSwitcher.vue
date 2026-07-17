<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen" 
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    >
      <span v-if="locale === 'en'">🇬🇧</span>
      <span v-else-if="locale === 'id'">🇮🇩</span>
      <span v-else-if="locale === 'zh'">🇨🇳</span>
      <span v-else-if="locale === 'fr'">🇫🇷</span> <!-- Ikon Prancis -->
      
      <span>{{ getLanguageName(locale) }}</span>
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>

    <div v-if="isOpen" class="absolute right-0 z-50 w-32 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
      <button @click="changeLang('en')" class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">🇬🇧 English</button>
      <button @click="changeLang('id')" class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">🇮🇩 Indonesia</button>
      <button @click="changeLang('zh')" class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">🇨🇳 中文</button>
      <button @click="changeLang('fr')" class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">🇫🇷 Français</button> <!-- Tombol Prancis -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const isOpen = ref(false);

const changeLang = (lang) => {
  locale.value = lang;
  isOpen.value = false;
  // Opsional: Simpan preferensi ke localStorage
  localStorage.setItem('locale', lang);
};

const getLanguageName = (lang) => {
  const names = { en: 'EN', id: 'ID', zh: 'ZH', fr: 'FR' };
  return names[lang] || 'EN';
};

// Tutup dropdown jika klik di luar
const closeDropdown = () => isOpen.value = false;
// (Tambahkan event listener click outside jika perlu)
</script>