<template>
  <div class="relative" ref="dropdownRef">
    <button 
      @click="isOpen = !isOpen" 
      class="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all duration-200"
      :aria-expanded="isOpen"
    >
      <span class="text-base leading-none">{{ getFlag(locale) }}</span>
      <span>{{ getLanguageName(locale) }}</span>
      <span class="material-symbols-outlined text-sm transition-transform duration-200" :class="{ 'rotate-180': isOpen }">expand_more</span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div 
        v-if="isOpen" 
        class="absolute right-0 z-50 w-40 mt-2 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-indigo-500/10 overflow-hidden"
      >
        <button 
          v-for="lang in availableLanguages" 
          :key="lang.code"
          @click="changeLang(lang.code)" 
          class="flex items-center gap-3 w-full px-4 py-2.5 text-xs sm:text-sm font-medium text-left transition-colors duration-150"
          :class="[
            locale === lang.code 
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-bold' 
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          ]"
        >
          <span class="text-base">{{ lang.flag }}</span>
          <span>{{ lang.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const isOpen = ref(false);
const dropdownRef = ref(null);

const availableLanguages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }
];

const changeLang = (lang) => {
  locale.value = lang;
  isOpen.value = false;
  localStorage.setItem('locale', lang);
};

const getFlag = (code) => {
  const item = availableLanguages.find(l => l.code === code);
  return item ? item.flag : '🌐';
};

const getLanguageName = (code) => {
  return code.toUpperCase();
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>