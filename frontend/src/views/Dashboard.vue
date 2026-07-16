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
        <div class="hidden sm:flex items-center bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/80">
          <span class="material-symbols-outlined text-gray-600 mr-2 text-[18px] sm:text-[20px]">search</span>
          <input 
            v-model="searchQuery" 
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
        <button @click="navigate('requests')" :class="['flex items-center gap-4 p-4 text-white active-glow rounded-lg font-bold translate-x-1 transition-all duration-200 bg-[#3525cd]']">
          <span class="material-symbols-outlined">request_quote</span>
          <span class="font-semibold text-sm">{{ $t('nav.requests') }}</span>
        </button>
        <button @click="navigate('orders')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'orders' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
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
      <div class="w-full max-w-5xl mx-auto">
        
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{{ $t('dashboard.title') }}</h1>
        </div>

        <!-- Loading State -->
        <div v-if="loadingRequests" class="flex flex-col items-center justify-center py-20">
          <span class="material-symbols-outlined animate-spin text-[#3525cd] mb-4" style="font-size: 48px;">progress_activity</span>
          <p class="text-gray-500 font-medium">Loading your requests...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="requests.length === 0" class="flex flex-col items-center justify-center py-20">
          <span class="material-symbols-outlined text-gray-300 mb-4" style="font-size: 64px;">inbox</span>
          <h3 class="text-xl font-bold text-gray-600 mb-2">No Requests Yet</h3>
          <p class="text-gray-400 mb-6">Start by creating your first sourcing request</p>
          <button @click="createNewRequest" class="fab-premium text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined">add</span>
            {{ $t('nav.new_request') }}
          </button>
        </div>

        <!-- Request Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          <!-- Dynamic Request Cards -->
          <div 
            v-for="req in filteredRequests" 
            :key="req.id"
            class="premium-card rounded-xl p-4 transition-all group relative overflow-hidden cursor-pointer"
            @click="viewDetails(req.id)"
          >
            <div class="flex justify-between items-start mb-4 relative z-10">
              <div class="flex flex-col gap-2">
                <span class="category-badge self-start font-semibold text-xs text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">{{ getCategoryIcon(req.category) }}</span> {{ req.category }}
                </span>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-800">{{ req.product_name }}</h3>
              </div>
              <span :class="['font-semibold text-xs px-2 sm:px-3 py-1 rounded-full text-white', getStatusClass(req.status)]">
                {{ $t('status.' + req.status) || req.status }}
              </span>
            </div>
            <div class="space-y-2 mb-4 relative z-10">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">calendar_today</span> {{ formatDate(req.created_at) }}</span>
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">inventory_2</span> {{ req.quantity }} units</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-6 relative z-10">
              <div v-if="req.quoted_price" class="bg-[#3525cd]/5 px-3 sm:px-4 py-2 rounded-lg border border-[#3525cd]/10">
                <span class="font-semibold text-sm text-[#3525cd]">${{ Number(req.quoted_price).toLocaleString() }}</span>
              </div>
              <div v-else class="text-xs text-gray-400 italic">{{ $t('dashboard.awaiting_quotes') }}</div>
              <button class="font-semibold text-sm text-[#3525cd] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {{ $t('dashboard.view_details') }} <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Empty State Suggestion -->
          <div @click="createNewRequest" class="bg-white/30 backdrop-blur-sm border-2 border-dashed border-[#3525cd]/20 rounded-xl p-4 flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-all cursor-pointer min-h-[180px] hover:border-[#3525cd]/40 hover:bg-white/40">
            <span class="material-symbols-outlined text-[#3525cd] text-4xl mb-2">add_circle</span>
            <span class="font-semibold text-sm text-[#3525cd] font-bold text-center">{{ $t('dashboard.create_new') }}</span>
          </div>
        </div>

        <!-- Dashboard Stats -->
        <div class="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div class="premium-card p-4 sm:p-6 rounded-xl flex flex-col group">
            <span class="font-semibold text-xs text-gray-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span> {{ $t('dashboard.total_volume') }}
            </span>
            <span class="text-2xl sm:text-3xl font-bold gradient-text">${{ totalVolume }}</span>
          </div>
          <div class="premium-card p-4 sm:p-6 rounded-xl flex flex-col group">
            <span class="font-semibold text-xs text-gray-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">hourglass_empty</span> {{ $t('dashboard.pending_responses') }}
            </span>
            <span class="text-2xl sm:text-3xl font-bold gradient-text">{{ pendingCount }}</span>
          </div>
          <div class="premium-card p-4 sm:p-6 rounded-xl flex flex-col group">
            <span class="font-semibold text-xs text-gray-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">group</span> {{ $t('dashboard.suppliers_contacted') }}
            </span>
            <span class="text-2xl sm:text-3xl font-bold gradient-text">{{ suppliersCount }}</span>
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
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { requestService } from '../api/requestService.js'

const router = useRouter()

// Reactive State
const searchQuery = ref('')
const notificationCount = ref(0)
const activeRoute = ref('requests')
const requests = ref([])
const loadingRequests = ref(true)

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

// Computed stats from real data
const filteredRequests = computed(() => {
  if (!searchQuery.value) return requests.value
  const q = searchQuery.value.toLowerCase()
  return requests.value.filter(r => 
    r.product_name.toLowerCase().includes(q) || 
    r.category.toLowerCase().includes(q)
  )
})

const totalVolume = computed(() => {
  const sum = requests.value
    .filter(r => r.quoted_price)
    .reduce((acc, r) => acc + Number(r.quoted_price), 0)
  return sum.toLocaleString()
})

const pendingCount = computed(() => {
  return requests.value.filter(r => r.status === 'pending').length.toString().padStart(2, '0')
})

const suppliersCount = computed(() => {
  const unique = new Set(requests.value.filter(r => r.assigned_supplier_id).map(r => r.assigned_supplier_id))
  return unique.size.toString().padStart(2, '0')
})

// Fetch data from API
const fetchRequests = async () => {
  loadingRequests.value = true
  try {
    requests.value = await requestService.getRequests()
    notificationCount.value = requests.value.filter(r => r.status === 'quoted').length
  } catch (err) {
    console.error('Failed to fetch requests:', err)
  } finally {
    loadingRequests.value = false
  }
}

onMounted(() => {
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
  fetchRequests()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
})

// Helper functions
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getCategoryIcon = (category) => {
  const icons = {
    'Machinery': 'precision_manufacturing',
    'Textiles': 'apparel',
    'Solar': 'wb_sunny',
    'Electronics': 'devices',
    'Construction': 'construction',
    'renewable-energy': 'wb_sunny',
    'industrial-machinery': 'precision_manufacturing',
    'electronics-it': 'devices',
    'textiles-apparel': 'apparel',
    'construction-materials': 'construction'
  }
  return icons[category] || 'category'
}

const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'quoted': 'status-quoted',
    'approved': 'status-quoted',
    'processing': 'status-processing',
    'production': 'status-processing',
    'shipped': 'status-processing',
    'completed': 'status-completed'
  }
  return classes[status] || 'status-pending'
}

// Navigation Functions
const navigate = (route) => {
  activeRoute.value = route
  if (route === 'dashboard') router.push('/dashboard')
}

const toggleNotifications = () => { notificationCount.value = 0 }
const openChat = () => { /* Tawk.to will handle this */ }
const toggleProfileMenu = () => {}

const createNewRequest = () => { router.push('/request/new') }
const openHelp = () => {}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const viewDetails = (id) => { router.push(`/request/${id}`) }
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

.active-glow { box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2); }

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
.status-completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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