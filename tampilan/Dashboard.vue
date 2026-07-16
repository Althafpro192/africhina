<template>
  <div class="min-h-screen bg-[#f8fafc] text-on-surface antialiased font-['Inter',_sans-serif]">
    
    <!-- Top Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 glass-header flex justify-between items-center w-full px-4 sm:px-6 py-4 shadow-sm" style="height: 72px;">
      <div class="flex items-center gap-4">
        <span class="text-xl sm:text-2xl font-extrabold text-[#3525cd] tracking-tight">AfriChina Bridge</span>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex gap-4 xl:gap-6 items-center">
        <button @click="navigate('sourcing')" class="font-semibold text-sm xl:text-base text-gray-600 hover:text-[#3525cd] transition-colors duration-200">Sourcing</button>
        <button @click="navigate('orders')" class="font-semibold text-sm xl:text-base text-[#3525cd] border-b-2 border-[#3525cd] pb-1">Orders</button>
        <button @click="navigate('suppliers')" class="font-semibold text-sm xl:text-base text-gray-600 hover:text-[#3525cd] transition-colors duration-200">Suppliers</button>
        <button @click="navigate('logistics')" class="font-semibold text-sm xl:text-base text-gray-600 hover:text-[#3525cd] transition-colors duration-200">Logistics</button>
      </nav>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
        <div class="hidden sm:flex items-center bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/80">
          <span class="material-symbols-outlined text-gray-600 mr-2 text-[18px] sm:text-[20px]">search</span>
          <input 
            v-model="searchQuery" 
            class="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-48 placeholder-gray-500/50 outline-none" 
            placeholder="Search requests..." 
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
        <p class="text-sm text-gray-500/70">Verified Buyer</p>
      </div>

      <nav class="flex-grow flex flex-col gap-1 px-2">
        <button @click="navigate('dashboard')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'dashboard' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="font-semibold text-sm">Dashboard</span>
        </button>
        <button @click="navigate('requests')" :class="['flex items-center gap-4 p-4 text-white active-glow rounded-lg font-bold translate-x-1 transition-all duration-200', activeRoute === 'requests' ? 'bg-[#3525cd]' : 'bg-[#3525cd]']">
          <span class="material-symbols-outlined">request_quote</span>
          <span class="font-semibold text-sm">Requests</span>
        </button>
        <button @click="navigate('orders')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'orders' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span class="font-semibold text-sm">Orders</span>
        </button>
        <button @click="navigate('suppliers')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'suppliers' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">business</span>
          <span class="font-semibold text-sm">Suppliers</span>
        </button>
        <button @click="navigate('settings')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'settings' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-semibold text-sm">Settings</span>
        </button>
      </nav>

      <div class="px-2 pb-4">
        <button @click="createNewRequest" class="w-full fab-premium text-white py-4 rounded-lg font-semibold transition-all hover:opacity-95 active:scale-95 flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[20px]">add</span>
          New Request
        </button>
      </div>

      <div class="flex flex-col gap-1 border-t border-white/50 pt-4 px-2 pb-4">
        <button @click="openHelp" class="flex items-center gap-4 p-4 text-gray-600 hover:text-[#3525cd] transition-colors rounded-lg hover:bg-white/30">
          <span class="material-symbols-outlined">help</span>
          <span class="font-semibold text-sm">Help Center</span>
        </button>
        <button @click="logout" class="flex items-center gap-4 p-4 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-white/30">
          <span class="material-symbols-outlined">logout</span>
          <span class="font-semibold text-sm">Sign Out</span>
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
      <div class="w-full max-w-5xl mx-auto">
        
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">My Requests</h1>
          <div class="flex items-center gap-2 md:hidden">
            <img class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgjcDm9LUEt_9KYagQYGByJCOUAJOjnoylLj8Hz1fqa6l-Cb04JkhmiHs-34pwid1kWfCXm72UD0Z77HG84YXM1D36P69YKhYAzaUmjvgICMjtZ_SHa2cKUe8r1XD0J6LU8e8ERNbFrHI4y7DenwNcby71OxIRoV-HKCJPIW7mtwjLmvaQRKXSc00H_Ibwdlum73GIIOtW8t6U3jwrQwjuxgb6yj9-JBojC7so2N3pDo7CI6oUzh26FBjNjmNTawdZQeg7R0KnutpZ" alt="Avatar"/>
          </div>
        </div>

        <!-- Bento Grid / Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          <!-- Card 1: Industrial Generator -->
          <div class="premium-card rounded-xl p-4 transition-all group relative overflow-hidden">
            <div class="flex justify-between items-start mb-4 relative z-10">
              <div class="flex flex-col gap-2">
                <span class="category-badge self-start font-semibold text-xs text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">precision_manufacturing</span> Machinery
                </span>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-800">Industrial Generator 50kVA</h3>
              </div>
              <span class="status-quoted font-semibold text-xs px-2 sm:px-3 py-1 rounded-full text-white">Quoted</span>
            </div>
            <div class="space-y-2 mb-4 relative z-10">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">calendar_today</span> Oct 25, 2023</span>
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">inventory_2</span> 2 units</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-6 relative z-10">
              <div class="bg-[#3525cd]/5 px-3 sm:px-4 py-2 rounded-lg border border-[#3525cd]/10">
                <span class="font-semibold text-sm text-[#3525cd] font-bold">$4,500.00</span>
              </div>
              <button @click="viewDetails('generator')" class="font-semibold text-sm text-[#3525cd] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Details <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Card 2: Cotton Fabric Rolls -->
          <div class="premium-card rounded-xl p-4 transition-all group">
            <div class="flex justify-between items-start mb-4">
              <div class="flex flex-col gap-2">
                <span class="category-badge self-start font-semibold text-xs text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">apparel</span> Textiles
                </span>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-800">Cotton Fabric Rolls</h3>
              </div>
              <span class="status-processing font-semibold text-xs px-2 sm:px-3 py-1 rounded-full text-white">Processing</span>
            </div>
            <div class="space-y-2 mb-4">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">calendar_today</span> Oct 20, 2023</span>
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">straighten</span> 500m</span>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-black/5 flex justify-end">
              <button @click="trackStatus('cotton')" class="text-gray-600 font-semibold text-sm flex items-center gap-1 hover:text-[#3525cd] transition-colors">
                Track Status <span class="material-symbols-outlined text-[16px]">query_stats</span>
              </button>
            </div>
          </div>

          <!-- Card 3: Solar Panels -->
          <div class="premium-card rounded-xl p-4 transition-all group">
            <div class="flex justify-between items-start mb-4">
              <div class="flex flex-col gap-2">
                <span class="category-badge self-start font-semibold text-xs text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">wb_sunny</span> Solar
                </span>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-800">Solar Panels 400W</h3>
              </div>
              <span class="status-pending font-semibold text-xs px-2 sm:px-3 py-1 rounded-full text-white">Pending</span>
            </div>
            <div class="space-y-2 mb-4">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">calendar_today</span> Oct 18, 2023</span>
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">inventory_2</span> 100 units</span>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-black/5 flex justify-between items-center">
              <span class="text-xs text-gray-500/70 italic">Awaiting supplier quotes</span>
              <button @click="editRequest('solar')" class="text-[#3525cd] font-bold text-sm hover:underline">Edit Request</button>
            </div>
          </div>

          <!-- Empty State Suggestion -->
          <div @click="createNewRequest" class="bg-white/30 backdrop-blur-sm border-2 border-dashed border-[#3525cd]/20 rounded-xl p-4 flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-all cursor-pointer min-h-[180px] hover:border-[#3525cd]/40 hover:bg-white/40">
            <span class="material-symbols-outlined text-[#3525cd] text-4xl mb-2">add_circle</span>
            <span class="font-semibold text-sm text-[#3525cd] font-bold text-center">Create new sourcing request</span>
          </div>
        </div>

        <!-- Dashboard Stats -->
        <div class="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div class="premium-card p-4 sm:p-6 rounded-xl flex flex-col group">
            <span class="font-semibold text-xs text-gray-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span> Total Active Volume
            </span>
            <span class="text-2xl sm:text-3xl font-bold gradient-text">$124,800</span>
          </div>
          <div class="premium-card p-4 sm:p-6 rounded-xl flex flex-col group">
            <span class="font-semibold text-xs text-gray-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">hourglass_empty</span> Pending Responses
            </span>
            <span class="text-2xl sm:text-3xl font-bold gradient-text">04</span>
          </div>
          <div class="premium-card p-4 sm:p-6 rounded-xl flex flex-col group">
            <span class="font-semibold text-xs text-gray-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">group</span> Suppliers Contacted
            </span>
            <span class="text-2xl sm:text-3xl font-bold gradient-text">12</span>
          </div>
        </div>

      </div>
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

// Reactive State
const searchQuery = ref('')
const notificationCount = ref(3)
const activeRoute = ref('requests')

// Device Detection
const isTablet = ref(false)
const isMobile = ref(false)
const isDesktop = ref(false)
const windowWidth = ref(0)

const updateDeviceType = () => {
  windowWidth.value = window.innerWidth
  
  // Breakpoints yang lebih presisi
  // Mobile: < 768px
  // Tablet: 768px - 1023px (iPad Mini 768px, iPad Air 820px, Surface Pro 912px)
  // Desktop: >= 1024px (1024x600 laptop, iPad Pro landscape, desktop)
  
  if (windowWidth.value < 768) {
    isMobile.value = true
    isTablet.value = false
    isDesktop.value = false
  } else if (windowWidth.value >= 768 && windowWidth.value < 1024) {
    isMobile.value = false
    isTablet.value = true
    isDesktop.value = false
  } else {
    isMobile.value = false
    isTablet.value = false
    isDesktop.value = true
  }
  
  console.log(`Width: ${windowWidth.value}px | Mobile: ${isMobile.value} | Tablet: ${isTablet.value} | Desktop: ${isDesktop.value}`)
}

const showSidebar = computed(() => {
  // Sidebar tampil di tablet dan desktop
  return isTablet.value || isDesktop.value
})

onMounted(() => {
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
})

// Navigation Functions
const navigate = (route) => {
  console.log(`Navigating to: ${route}`)
  activeRoute.value = route
}

const toggleNotifications = () => {
  console.log('Toggling notifications dropdown')
  notificationCount.value = 0
}

const openChat = () => {
  console.log('Opening chat widget')
}

const toggleProfileMenu = () => {
  console.log('Toggling profile menu')
}

const createNewRequest = () => {
  console.log('Redirecting to New Request form')
}

const openHelp = () => {
  console.log('Opening Help Center')
}

const logout = () => {
  console.log('Logging out user')
}

const viewDetails = (id) => {
  console.log(`Viewing details for request: ${id}`)
}

const trackStatus = (id) => {
  console.log(`Tracking status for request: ${id}`)
}

const editRequest = (id) => {
  console.log(`Editing request: ${id}`)
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

.premium-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 1);
}

.premium-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(53, 37, 205, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 1);
}

.active-glow {
  box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2);
}

.status-quoted {
  background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1);
}

.status-processing {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1);
}

.status-pending {
  background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1);
}

.category-badge {
  background: linear-gradient(135deg, rgba(241, 245, 249, 1) 0%, rgba(226, 232, 240, 1) 100%);
  border: 1px solid rgba(255,255,255,0.8);
}

.gradient-text {
  background: linear-gradient(135deg, #3525cd 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fab-premium {
  background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);
  box-shadow: 0 15px 30px rgba(53, 37, 205, 0.3), inset 0 1px 0 rgba(255,255,255,0.4);
}
</style>