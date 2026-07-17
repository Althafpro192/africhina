<template>
  <div class="min-h-screen bg-[#f8fafc] text-on-surface antialiased font-['Inter',_sans-serif]">
    
    <!-- Top Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 glass-header flex justify-between items-center w-full px-4 sm:px-6 py-4 shadow-sm" style="height: 72px;">
      <div class="flex items-center gap-4">
        <span class="text-xl sm:text-2xl font-extrabold text-[#3525cd] tracking-tight">{{ $t('auth.title') }}</span>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex gap-4 xl:gap-6 items-center">
        <button @click="navigate('sourcing')" class="font-semibold text-sm xl:text-base text-gray-600 hover:text-[#3525cd] transition-colors duration-200">{{ $t('nav.sourcing') }}</button>
        <button @click="navigate('orders')" class="font-semibold text-sm xl:text-base text-[#3525cd] border-b-2 border-[#3525cd] pb-1">{{ $t('nav.orders') }}</button>
        <button @click="navigate('suppliers')" class="font-semibold text-sm xl:text-base text-gray-600 hover:text-[#3525cd] transition-colors duration-200">{{ $t('nav.suppliers') }}</button>
        <button @click="navigate('logistics')" class="font-semibold text-sm xl:text-base text-gray-600 hover:text-[#3525cd] transition-colors duration-200">{{ $t('nav.logistics') }}</button>
      </nav>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
        <div v-if="showSearch" class="hidden sm:flex items-center bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/80">
          <span class="material-symbols-outlined text-gray-600 mr-2 text-[18px] sm:text-[20px]">search</span>
          <input 
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            class="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-48 placeholder-gray-500/50 outline-none" 
            :placeholder="$t('nav.search')" 
            type="text"
          />
        </div>
        
        <button @click="toggleNotifications" class="material-symbols-outlined text-gray-600 hover:text-[#3525cd] transition-colors relative p-1">
          notifications
          <span v-if="notificationCount > 0" class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <button @click="openChat" class="hidden sm:flex material-symbols-outlined text-gray-600 hover:text-[#3525cd] transition-colors p-1">chat</button>
        
        <img 
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm object-cover cursor-pointer" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2RyODKtjBq88GCEOb-L1uA_CtkK3ef6kiw8x2MkcxAyKA5k5exGbISqmxr4ywURFwwn2E-ht7wTlhC6QomyTA7OI1s0-PDO_juQB1o9Y_EIVRHQCec9tT3Jf35QCDiVBsUoMTSR8pyjUaeA_pXveQS2lHoCnAIhUrdxmp3NzyW2mX0hGdg-VV5_6JRD0ZqLdP525IP4hdJjwbgoLP92DyHa5e9kc0AbYCAkLfd0i7pFK4dGb8mzUjQ260snLqXL3uuXW8d18C9ot9"
          alt="Profile"
          @click="toggleProfileMenu"
        />
        <LanguageSwitcher />
      </div>
    </header>

    <!-- Side Navigation Bar -->
    <aside 
      v-if="showSidebar"
      class="flex flex-col h-screen w-64 fixed left-0 glass-sidebar border-r border-white/50 z-40"
      :style="{ top: '72px', left: '10px', height: 'calc(100vh - 72px)' }"
    >
      <div class="mb-6 px-2 pt-4">
        <h2 class="text-xl font-black text-[#3525cd]">Global Sourcing</h2>
        <p class="text-sm text-gray-500/70">{{ $t('dashboard.verified_buyer') }}</p>
      </div>

      <nav class="flex-grow flex flex-col gap-1 px-2">
        <button @click="navigate('dashboard')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'dashboard' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="font-semibold text-sm">{{ $t('nav.dashboard') }}</span>
        </button>
        <button @click="navigate('requests')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'requests' ? 'text-white active-glow bg-[#3525cd] translate-x-1 font-bold' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">request_quote</span>
          <span class="font-semibold text-sm">{{ $t('nav.requests') }}</span>
        </button>
        <button @click="navigate('orders')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'orders' ? 'bg-white/40 translate-x-1 text-[#3525cd] font-bold' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span class="font-semibold text-sm">{{ $t('nav.orders') }}</span>
        </button>
        <button @click="navigate('suppliers')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'suppliers' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">business</span>
          <span class="font-semibold text-sm">{{ $t('nav.suppliers') }}</span>
        </button>
        <button @click="navigate('settings')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'settings' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-semibold text-sm">{{ $t('nav.settings') }}</span>
        </button>
      </nav>

      <div class="px-2 pb-4">
        <button @click="createNewRequest" class="w-full fab-premium text-white py-4 rounded-lg font-semibold transition-all hover:opacity-95 active:scale-95 flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[20px]">add</span>
          {{ $t('nav.new_request') }}
        </button>
      </div>

      <div class="flex flex-col gap-1 border-t border-white/50 pt-4 px-2 pb-4">
        <button @click="openHelp" class="flex items-center gap-4 p-4 text-gray-600 hover:text-[#3525cd] transition-colors rounded-lg hover:bg-white/30">
          <span class="material-symbols-outlined">help</span>
          <span class="font-semibold text-sm">{{ $t('nav.help') }}</span>
        </button>
        <button @click="logout" class="flex items-center gap-4 p-4 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-white/30">
          <span class="material-symbols-outlined">logout</span>
          <span class="font-semibold text-sm">{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main 
      class="min-h-screen transition-all duration-300"
      :style="{ 
        paddingTop: '88px',
        paddingLeft: showSidebar ? '272px' : '16px',
        paddingRight: '16px',
        paddingBottom: isMobile ? '100px' : '32px'
      }"
    >
      <slot :isMobile="isMobile" :isTablet="isTablet" :isDesktop="isDesktop"></slot>
    </main>

    <!-- Floating Action Button -->
    <button 
      @click="createNewRequest" 
      class="fixed fab-premium text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 shadow-2xl"
      :style="{
        bottom: isMobile ? '80px' : '24px',
        right: '24px',
        width: isMobile ? '56px' : '64px',
        height: isMobile ? '56px' : '64px'
      }"
    >
      <span class="material-symbols-outlined" :style="{ fontSize: isMobile ? '24px' : '32px' }">add</span>
    </button>

    <!-- Bottom Navigation - Mobile Only -->
    <nav 
      v-if="isMobile"
      class="fixed bottom-0 left-0 right-0 glass-header border-t border-white/50 flex justify-around py-3 px-2 z-40"
    >
      <button @click="navigate('dashboard')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">dashboard</span>
        <span class="text-[10px] font-semibold">Home</span>
      </button>
      <button @click="navigate('requests')" class="flex flex-col items-center text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">request_quote</span>
        <span class="text-[10px] font-semibold">Requests</span>
      </button>
      <button @click="navigate('orders')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
        <span class="text-[10px] font-semibold">Orders</span>
      </button>
      <button @click="navigate('suppliers')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">business</span>
        <span class="text-[10px] font-semibold">Suppliers</span>
      </button>
      <button @click="navigate('settings')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">settings</span>
        <span class="text-[10px] font-semibold">Settings</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../LanguageSwitcher.vue'
import { authService } from '../../api/authService.js'

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
  },
  notificationCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:searchQuery'])

const router = useRouter()

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
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
})

const navigate = (route) => {
  if (route === 'dashboard') router.push('/buyer/dashboard')
}

const toggleNotifications = () => { }
const openChat = () => { }
const toggleProfileMenu = () => {}
const createNewRequest = () => { router.push('/buyer/rfq/create') }
const openHelp = () => {}

const logout = async () => {
  try {
    await authService.logout();
  } catch(e) {}
  localStorage.removeItem('user');
  router.push('/login');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
}

.glass-header {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.glass-sidebar {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.active-glow { box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2); }

.fab-premium {
  background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);
  box-shadow: 0 15px 30px rgba(53, 37, 205, 0.3), inset 0 1px 0 rgba(255,255,255,0.4);
}
</style>
