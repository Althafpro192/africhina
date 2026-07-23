<template>
  <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex-shrink-0 flex items-center">
            <span class="text-xl font-bold text-primary tracking-tight">AfriChina Bridge</span>
          </router-link>
        </div>
        <div class="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <template v-if="isLoggedIn">
            <div class="relative">
              <button @click="toggleMenu" class="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out">
                <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {{ userInitials }}
                </div>
              </button>
              
              <div v-if="showMenu" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div class="py-1">
                  <router-link to="/buyer/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{{ $t('nav.dashboard') }}</router-link>
                  <a href="#" @click.prevent="logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{{ $t('nav.logout') }}</a>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="text-gray-500 hover:text-gray-700 font-medium text-sm">{{ $t('nav.login') }}</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { authService } from '../api/authService.js';

const router = useRouter();
const showMenu = ref(false);

const isLoggedIn = computed(() => !!localStorage.getItem('user'));
const userInitials = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';
});

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const logout = async () => {
  try {
    await authService.logout();
  } catch(e) {
    console.error('Logout failed:', e);
  }
  localStorage.removeItem('user');
  router.push('/login');
};
</script>
