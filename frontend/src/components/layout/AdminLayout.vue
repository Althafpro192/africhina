<template>
  <div class="flex min-h-screen text-[#1d1b20]" style="background: radial-gradient(circle at top left, #fdf7ff, #f2ecf4); font-family: 'Inter', sans-serif; overflow-x: hidden;">
    
    <!-- SIDEBAR -->
    <aside class="glass-panel w-72 h-screen sticky top-0 flex flex-col p-6 z-40 border-r-0 rounded-r-3xl deep-shadow">
      <div class="mb-10 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f378a] to-[#6750a4] flex items-center justify-center shadow-lg border-t border-white/40">
          <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">badge</span>
        </div>
        <div>
          <h1 class="text-[24px] leading-[1.3] font-bold text-[#4f378a] tracking-tight">{{ $t('auth.title') }}</h1>
          <p class="text-[10px] font-bold text-[#7a7582] tracking-widest uppercase">{{ $t('nav.admin_terminal') }}</p>
        </div>
      </div>

      <nav class="flex-1 space-y-3">
        <router-link to="/admin/dashboard" class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all lift-effect group cursor-pointer" :class="isActive('/admin/dashboard') ? 'bg-gradient-to-r from-[#4f378a] to-[#6750a4] text-white shadow-lg' : 'text-[#494551] hover:bg-[#ece6ee]'">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner" :class="isActive('/admin/dashboard') ? 'bg-white/20' : 'bg-[#e6e0e9] border border-white/50'">
            <span class="material-symbols-outlined text-xl" :class="isActive('/admin/dashboard') ? '' : 'text-[#4f378a]'" :style="isActive('/admin/dashboard') ? `font-variation-settings: 'FILL' 1;` : `font-variation-settings: 'FILL' 0;`">dashboard</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.dashboard') }}</span>
        </router-link>

        <router-link to="/admin/suppliers" class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all lift-effect group cursor-pointer" :class="isActive('/admin/suppliers') ? 'bg-gradient-to-r from-[#4f378a] to-[#6750a4] text-white shadow-lg' : 'text-[#494551] hover:bg-[#ece6ee]'">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner" :class="isActive('/admin/suppliers') ? 'bg-white/20' : 'bg-[#e6e0e9] border border-white/50'">
            <span class="material-symbols-outlined text-xl" :class="isActive('/admin/suppliers') ? '' : 'text-[#4f378a]'" :style="isActive('/admin/suppliers') ? `font-variation-settings: 'FILL' 1;` : `font-variation-settings: 'FILL' 0;`">business</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.suppliers') }}</span>
        </router-link>

        <router-link to="/admin/ratings" class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all lift-effect group cursor-pointer" :class="isActive('/admin/ratings') ? 'bg-gradient-to-r from-[#4f378a] to-[#6750a4] text-white shadow-lg' : 'text-[#494551] hover:bg-[#ece6ee]'">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner" :class="isActive('/admin/ratings') ? 'bg-white/20' : 'bg-[#e6e0e9] border border-white/50'">
            <span class="material-symbols-outlined text-xl" :class="isActive('/admin/ratings') ? '' : 'text-[#4f378a]'" :style="isActive('/admin/ratings') ? `font-variation-settings: 'FILL' 1;` : `font-variation-settings: 'FILL' 0;`">stars</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Ratings Moderation</span>
        </router-link>
      </nav>



      <!-- Profile Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-3 p-2 rounded-2xl bg-[#f8f2fa] border border-white/30">
          <div class="relative">
            <div class="w-10 h-10 rounded-full border-2 border-[#4f378a] overflow-hidden shadow-md flex items-center justify-center bg-gray-200">
              <span class="material-symbols-outlined text-[#4f378a]">person</span>
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#1d1b20] truncate">{{ adminName }}</p>
            <p class="text-[10px] text-[#494551]">Administrator</p>
          </div>
        </div>
        <button @click="logout" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#e6e0e9] text-[#4f378a] font-semibold shadow-md hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors lift-effect">
          <span class="material-symbols-outlined text-xl">logout</span>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen relative overflow-hidden">
      <!-- Language Switcher -->
      <div class="absolute top-6 right-8 z-50">
        <LanguageSwitcher />
      </div>
      <slot></slot>
    </main>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '../../api/authService';
import LanguageSwitcher from '../LanguageSwitcher.vue';

const route = useRoute();
const router = useRouter();

const adminData = computed(() => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
});

const adminName = computed(() => adminData.value?.full_name || 'Admin');

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};

const logout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('user');
    router.push('/login');
  }
};
</script>
