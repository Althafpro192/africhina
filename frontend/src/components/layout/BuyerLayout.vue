<template>
  <div :class="['min-h-screen antialiased font-[\'Inter\',_sans-serif] transition-colors duration-300', isDark ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-[#f8f9ff] text-slate-900']">
    
    <!-- Top Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 flex justify-between items-center w-full px-3 sm:px-6 h-16 sm:h-20 shadow-sm transition-colors duration-300">
      <div class="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" @click="navigate('dashboard')">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 aspect-square">
          <span class="material-symbols-outlined text-white text-xl sm:text-2xl" style="font-variation-settings: 'FILL' 1;">account_tree</span>
        </div>
        <span class="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-[140px] sm:max-w-none">AfriChina Bridge</span>
      </div>
      
      <!-- Desktop Navigation Links -->
      <nav class="hidden lg:flex gap-4 xl:gap-6 items-center shrink-0">
        <button 
          @click="navigate('dashboard')" 
          :class="['font-bold text-sm xl:text-base transition-colors duration-200 px-3 py-1.5 rounded-xl', activeRoute === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white']"
        >
          {{ $t('nav.dashboard') }}
        </button>
        <button 
          @click="navigate('requests')" 
          :class="['font-bold text-sm xl:text-base transition-colors duration-200 px-3 py-1.5 rounded-xl', activeRoute === 'requests' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white']"
        >
          {{ $t('nav.requests') }}
        </button>
        <button 
          @click="navigate('sourcing')" 
          :class="['font-bold text-sm xl:text-base transition-colors duration-200 px-3 py-1.5 rounded-xl', activeRoute === 'sourcing' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white']"
        >
          {{ $t('nav.sourcing') }}
        </button>
        <button 
          @click="navigate('messages')" 
          :class="['font-bold text-sm xl:text-base transition-colors duration-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5', activeRoute === 'messages' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white']"
        >
          <span class="material-symbols-outlined text-lg">forum</span>
          <span>Chat Admin</span>
        </button>
      </nav>

      <!-- Right Side Controls -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Search Input -->
        <div v-if="showSearch" class="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 px-3 h-9 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-slate-400 text-lg mr-2 shrink-0">search</span>
          <input 
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            class="bg-transparent border-none focus:ring-0 text-xs sm:text-sm w-28 md:w-44 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none" 
            :placeholder="$t('nav.search')" 
            type="text"
          />
        </div>
        
        <!-- Theme Switcher Button (Desktop Only) -->
        <button 
          @click="toggleTheme" 
          class="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm items-center justify-center cursor-pointer shrink-0 aspect-square"
          :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <span class="material-symbols-outlined text-lg sm:text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <!-- Notifications Bell & Popover Card -->
        <div class="relative shrink-0" ref="notifRef">
          <button 
            @click="toggleNotifications" 
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer flex items-center justify-center shrink-0 aspect-square"
            title="Notifications"
          >
            <span class="material-symbols-outlined text-lg sm:text-xl">notifications</span>
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          <!-- Notification Dropdown Card -->
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
                  <h4 class="text-sm font-black text-slate-900 dark:text-white">Notifications</h4>
                  <span v-if="unreadCount > 0" class="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {{ unreadCount }} new
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
                  :class="notif.read ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 opacity-70' : 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80'"
                >
                  <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span class="material-symbols-outlined text-base">{{ notif.icon }}</span>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{{ notif.title }}</p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{{ notif.message }}</p>
                    <span class="text-[10px] text-slate-400 font-medium mt-1 block">{{ notif.time }}</span>
                  </div>
                  <span v-if="!notif.read" class="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        
        <!-- User Avatar & Profile Dropdown -->
        <div class="relative" ref="profileRef">
          <img 
            class="w-9 h-9 rounded-xl border-2 border-indigo-500/30 shadow-sm object-cover cursor-pointer hover:scale-105 transition-transform" 
            :src="getAvatarUrl(user.avatar_url, user.full_name)"
            alt="Profile"
            @click="toggleProfileMenu"
          />
          <div v-if="showProfileMenu" class="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl py-2 border border-slate-200 dark:border-slate-800 z-50">
            <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ user.full_name || 'Buyer User' }}</p>
              <p class="text-[11px] text-slate-400 truncate">{{ user.email }}</p>
            </div>

            <!-- Unified Theme Mode Switcher inside Profile Menu -->
            <button 
              @click="toggleTheme" 
              class="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg text-amber-500 dark:text-amber-400">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
                <span>{{ isDark ? 'Mode Terang' : 'Mode Gelap' }}</span>
              </div>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {{ isDark ? 'Dark' : 'Light' }}
              </span>
            </button>

            <button @click="navigate('settings'); showProfileMenu = false" class="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
              <span class="material-symbols-outlined text-lg">settings</span>
              {{ $t('nav.settings') }}
            </button>
            <button @click="logout" class="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer">
              <span class="material-symbols-outlined text-lg">logout</span>
              {{ $t('nav.logout') }}
            </button>
          </div>
        </div>

        <!-- Language Switcher -->
        <LanguageSwitcher />
      </div>
    </header>

    <!-- Sidebar Navigation -->
    <aside 
      v-if="showSidebar"
      class="flex flex-col w-64 fixed bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 z-40 transition-colors duration-300"
      :style="{ top: '72px', left: '0px', height: 'calc(100vh - 72px)' }"
    >
      <div class="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <h2 class="text-base font-black text-slate-900 dark:text-white">Buyer Workspace</h2>
        <span class="inline-block mt-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {{ $t('dashboard.verified_buyer') }}
        </span>
      </div>

      <nav class="flex-grow flex flex-col gap-1.5 p-3 overflow-y-auto">
        <button 
          @click="navigate('dashboard')" 
          :class="['flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200', activeRoute === 'dashboard' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <span class="material-symbols-outlined text-xl">dashboard</span>
          <span>{{ $t('nav.dashboard') }}</span>
        </button>

        <button 
          @click="navigate('requests')" 
          :class="['flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200', activeRoute === 'requests' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <span class="material-symbols-outlined text-xl">request_quote</span>
          <span>{{ $t('nav.requests') }}</span>
        </button>

        <button 
          @click="navigate('sourcing')" 
          :class="['flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200', activeRoute === 'sourcing' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <span class="material-symbols-outlined text-xl">manage_search</span>
          <span>{{ $t('nav.sourcing') }}</span>
        </button>

        <button 
          @click="navigate('messages')" 
          :class="['flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200', activeRoute === 'messages' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <span class="material-symbols-outlined text-xl">forum</span>
          <span>Chat Admin</span>
        </button>

        <button 
          @click="navigate('suppliers')" 
          :class="['flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200', activeRoute === 'suppliers' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <span class="material-symbols-outlined text-xl">factory</span>
          <span>{{ $t('nav.suppliers') }}</span>
        </button>

        <button 
          @click="navigate('settings')" 
          :class="['flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200', activeRoute === 'settings' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <span class="material-symbols-outlined text-xl">settings</span>
          <span>{{ $t('nav.settings') }}</span>
        </button>
      </nav>

      <!-- New Request Action -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800">
        <button 
          @click="createNewRequest" 
          class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl hover:opacity-95 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span class="material-symbols-outlined text-lg">add_circle</span>
          <span>Buat Request Baru</span>
        </button>
      </div>

      <!-- Logout & Help -->
      <div class="flex flex-col gap-1 p-3 border-t border-slate-100 dark:border-slate-800">
        <button @click="logout" class="flex items-center gap-3 px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-lg">logout</span>
          <span>{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Slot -->
    <main 
      class="min-h-screen transition-all duration-300"
      :style="{ 
        paddingTop: isMobile ? '76px' : '88px',
        paddingLeft: showSidebar ? '272px' : '16px',
        paddingRight: '16px',
        paddingBottom: isMobile ? '100px' : '32px'
      }"
    >
      <slot :isMobile="isMobile" :isTablet="isTablet" :isDesktop="isDesktop"></slot>
    </main>

    <!-- Floating Action Button (FAB) -->
    <button 
      @click="createNewRequest" 
      class="fixed bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 shadow-2xl shadow-indigo-500/40"
      :style="{
        bottom: isMobile ? '80px' : '24px',
        right: '24px',
        width: isMobile ? '52px' : '60px',
        height: isMobile ? '52px' : '60px'
      }"
    >
      <span class="material-symbols-outlined" :style="{ fontSize: isMobile ? '24px' : '28px' }">add</span>
    </button>

    <!-- Bottom Navigation - Mobile Only -->
    <nav 
      v-if="isMobile"
      class="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around py-2.5 px-2 z-40"
    >
      <button @click="navigate('dashboard')" :class="['flex flex-col items-center p-1', activeRoute === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400']">
        <span class="material-symbols-outlined text-xl">dashboard</span>
        <span class="text-[10px]">Dashboard</span>
      </button>
      <button @click="navigate('requests')" :class="['flex flex-col items-center p-1', activeRoute === 'requests' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400']">
        <span class="material-symbols-outlined text-xl">request_quote</span>
        <span class="text-[10px]">Requests</span>
      </button>
      <button @click="navigate('messages')" :class="['flex flex-col items-center p-1', activeRoute === 'messages' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400']">
        <span class="material-symbols-outlined text-xl">forum</span>
        <span class="text-[10px]">Chat Admin</span>
      </button>
      <button @click="navigate('settings')" :class="['flex flex-col items-center p-1', activeRoute === 'settings' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400']">
        <span class="material-symbols-outlined text-xl">settings</span>
        <span class="text-[10px]">Settings</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../LanguageSwitcher.vue'
import { useTheme } from '../../composables/useTheme'
import { authService } from '../../api/authService.js'

const { isDark, toggleTheme } = useTheme()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const getAvatarUrl = (url, name) => {
  if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff`
  let path = url
  if (path.startsWith('/uploads/avatar-')) {
    path = path.replace('/uploads/avatar-', '/uploads/avatars/avatar-')
  }
  if (path.startsWith('/')) {
    return `${window.location.protocol}//${window.location.hostname}:5000${path}`
  }
  return path
}

const props = defineProps({
  activeRoute: {
    type: String,
    default: 'requests'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  showSearch: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:searchQuery'])
const router = useRouter()

// Notifications State & Popover
const isNotificationOpen = ref(false)
const notifRef = ref(null)
const notifications = ref([
  { id: 1, title: 'New Supplier Quote Received', message: 'RFQ #9402 has received a verified factory quotation from Ningbo Tech.', icon: 'request_quote', time: '10m ago', read: false },
  { id: 2, title: 'Logistics Update', message: 'Shipment #AF-8840 has passed customs inspection at Mombasa Port.', icon: 'local_shipping', time: '2h ago', read: false },
  { id: 3, title: 'Account Verified', message: 'Your business license verification is completed successfully.', icon: 'verified', time: '1d ago', read: true }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const readNotif = (notif) => {
  notif.read = true
  isNotificationOpen.value = false
}

const profileRef = ref(null)

const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    isNotificationOpen.value = false
  }
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    showProfileMenu.value = false
  }
}

// Device Detection
const isTablet = ref(false)
const isMobile = ref(false)
const isDesktop = ref(false)
const windowWidth = ref(0)

const updateDeviceType = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value < 768) {
    isMobile.value = true; isTablet.value = false; isDesktop.value = false
  } else if (windowWidth.value < 1024) {
    isMobile.value = false; isTablet.value = true; isDesktop.value = false
  } else {
    isMobile.value = false; isTablet.value = false; isDesktop.value = true
  }
}

const showSidebar = computed(() => isTablet.value || isDesktop.value)

onMounted(() => {
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
  document.removeEventListener('click', handleClickOutside)
})

const navigate = (route) => {
  router.push(`/buyer/${route}`)
}

const showProfileMenu = ref(false)
const toggleProfileMenu = () => { showProfileMenu.value = !showProfileMenu.value }
const createNewRequest = () => { router.push('/buyer/rfq/create') }

const logout = async () => {
  try {
    await authService.logout();
  } catch(e) {}
  localStorage.removeItem('user');
  router.push('/login');
}
</script>
