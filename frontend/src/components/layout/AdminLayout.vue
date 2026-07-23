<template>
  <div :class="['flex min-h-screen antialiased font-[\'Inter\',_sans-serif] transition-colors duration-300 overflow-x-hidden', isDark ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-[#f8f9ff] text-slate-900']">
    
    <!-- MOBILE OVERLAY (hanya muncul saat sidebar terbuka di layar < lg) -->
    <div 
      v-if="isSidebarOpen && !isDesktop"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
      @click="toggleSidebar"
    ></div>

    <!-- SIDEBAR -->
    <aside 
      class="fixed lg:sticky top-0 left-0 h-screen w-[280px] flex flex-col p-6 z-50 transition-transform duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 shadow-xl"
      :class="[
        isDesktop ? 'translate-x-0' : (isSidebarOpen ? 'translate-x-0' : '-translate-x-full'),
        isDesktop ? 'lg:flex' : ''
      ]"
    >
      <!-- Brand Header -->
      <div class="mb-8 flex items-center gap-3 cursor-pointer" @click="$router.push('/admin/dashboard')">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">admin_panel_settings</span>
        </div>
        <div>
          <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ $t('auth.title') }}</h1>
          <p class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">{{ $t('nav.admin_terminal') }}</p>
        </div>
      </div>

      <!-- Navigation Links (sama seperti sebelumnya) -->
      <nav class="flex-1 space-y-2 overflow-y-auto">
        <router-link 
          to="/admin/dashboard" 
          class="flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200"
          :class="isActive('/admin/dashboard') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <span class="material-symbols-outlined text-xl">dashboard</span>
          <span>{{ $t('nav.dashboard') }}</span>
        </router-link>

        <router-link 
          to="/admin/suppliers" 
          class="flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200"
          :class="isActive('/admin/suppliers') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <span class="material-symbols-outlined text-xl">factory</span>
          <span>{{ $t('nav.suppliers') }}</span>
        </router-link>

        <router-link 
          to="/admin/ratings" 
          class="flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200"
          :class="isActive('/admin/ratings') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <span class="material-symbols-outlined text-xl">stars</span>
          <span>{{ $t('nav.ratings_moderation') }}</span>
        </router-link>

        <router-link 
          to="/admin/messages" 
          class="flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200"
          :class="isActive('/admin/messages') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <span class="material-symbols-outlined text-xl">forum</span>
          <span>{{ $t('nav.buyer_messages') }}</span>
        </router-link>

        <div class="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800">
          <p class="px-4 mb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ $t('nav.security_audit') }}</p>
          <router-link 
            to="/admin/security/password-resets" 
            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200"
            :class="isActive('/admin/security/password-resets') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >
            <span class="material-symbols-outlined text-xl">lock_reset</span>
            <span>{{ $t('nav.password_resets') }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Profile & Controls -->
      <div class="pt-4 space-y-3 border-t border-slate-200/80 dark:border-slate-800">
        <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div class="relative">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {{ adminName.charAt(0) }}
            </div>
            <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ adminName }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Administrator</p>
          </div>
        </div>

        <button 
          @click="logout" 
          class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-lg">logout</span>
          <span>{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen relative overflow-hidden">
      <!-- Top Bar (untuk mobile: hamburger + judul, dan kontrol kanan) -->
      <div class="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 h-16 sm:h-18 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60 lg:px-8">
        <!-- Kiri: Tombol hamburger (hanya untuk < lg) + judul (opsional) -->
        <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button 
            v-if="!isDesktop"
            @click="toggleSidebar" 
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0 aspect-square"
            aria-label="Toggle sidebar"
          >
            <span class="material-symbols-outlined text-xl sm:text-2xl">{{ isSidebarOpen ? 'close' : 'menu' }}</span>
          </button>
          <span class="text-base font-bold text-slate-900 dark:text-white lg:hidden">Dashboard</span>
        </div>

        <!-- Kanan: Theme, Notifikasi, Language -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            @click="toggleTheme" 
            class="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm items-center justify-center cursor-pointer shrink-0 aspect-square"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <span class="material-symbols-outlined text-lg sm:text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <div class="relative shrink-0" ref="notifRef">
            <button 
              @click="toggleNotifications" 
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm relative cursor-pointer flex items-center justify-center shrink-0 aspect-square"
              title="Admin Notifications"
            >
              <span class="material-symbols-outlined text-lg sm:text-xl">notifications</span>
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <!-- Notification Dropdown -->
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-1"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-1"
            >
              <div 
                v-if="isNotificationOpen" 
                class="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-4 overflow-hidden"
              >
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-black text-slate-900 dark:text-white">Admin Alerts</h4>
                    <span v-if="unreadCount > 0" class="px-2 py-0.5 text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-800">
                      {{ unreadCount }} pending
                    </span>
                  </div>
                  <button 
                    v-if="unreadCount > 0"
                    @click="markAllAsRead" 
                    class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <div 
                    v-for="notif in notifications" 
                    :key="notif.id"
                    @click="readNotif(notif)"
                    class="p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3"
                    :class="notif.read ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 opacity-70' : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'"
                  >
                    <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span class="material-symbols-outlined text-base">{{ notif.icon }}</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{{ notif.title }}</p>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{{ notif.message }}</p>
                      <span class="text-[10px] text-slate-400 font-medium mt-1 block">{{ notif.time }}</span>
                    </div>
                    <span v-if="!notif.read" class="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <LanguageSwitcher />
        </div>
      </div>

      <!-- Konten Halaman -->
      <div class="p-4 sm:p-6 lg:p-10 flex-1">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from '../../composables/useTheme';
import { authService } from '../../api/authService';
import LanguageSwitcher from '../LanguageSwitcher.vue';

const route = useRoute();
const router = useRouter();
const { isDark, toggleTheme } = useTheme();

// Sidebar state
const isSidebarOpen = ref(false);
const isDesktop = ref(window.innerWidth >= 1024);

// Notifications state
const isNotificationOpen = ref(false);
const notifRef = ref(null);
const notifications = ref([
  { id: 1, title: 'New RFQ Submitted', message: 'Buyer Kwame Osei submitted RFQ #9402 for Solar Panels (500 units).', icon: 'request_quote', time: '15m ago', read: false },
  { id: 2, title: 'Password Reset Requested', message: 'User Fatoumata Diallo requested a temporary password reset.', icon: 'lock_reset', time: '1h ago', read: false },
  { id: 3, title: 'New Rating Submitted', message: 'Buyer Emmanuel Kiprono rated Supplier Guangzhou Machinery 5 stars.', icon: 'stars', time: '3h ago', read: true }
]);

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value;
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
};

const readNotif = (notif) => {
  notif.read = true;
  isNotificationOpen.value = false;
};

const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    isNotificationOpen.value = false;
  }
};

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Detect window resize untuk menentukan desktop
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024;
  if (isDesktop.value) {
    isSidebarOpen.value = false; // tutup off-canvas saat desktop
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});

// Admin name
const adminData = computed(() => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
});

const adminName = computed(() => adminData.value?.full_name || 'Admin');

// Active route check
const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};

// Logout
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