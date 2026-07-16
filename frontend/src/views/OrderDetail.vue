<template>
  <div class="min-h-screen bg-[#f8fafc] text-on-surface antialiased font-['Inter',_sans-serif]">
    
    <!-- Top Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 glass-header flex justify-between items-center w-full px-4 sm:px-6 py-4 shadow-sm" style="height: 72px;">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <span class="text-lg sm:text-xl font-bold text-[#3525cd]">{{ $t('order_detail.title') }}</span>
      </div>
      
      <div class="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
      </div>
    </header>

    <!-- Side Navigation Bar -->
    <aside 
      v-if="showSidebar"
      class="flex flex-col h-screen w-64 fixed left-0 glass-sidebar border-r border-white/50 z-40"
      :style="{ top: '72px', height: 'calc(100vh - 72px)' }"
    >
      <div class="mb-6 px-2 pt-4">
        <h2 class="text-xl font-black text-[#3525cd]">{{ $t('auth.title') }}</h2>
        <p class="text-sm text-gray-500/70">{{ userRole === 'admin' ? 'Administrator' : $t('dashboard.verified_buyer') }}</p>
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
        <button v-if="userRole === 'admin'" @click="router.push('/admin')" class="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 text-gray-600 hover:bg-white/40 hover:translate-x-1">
          <span class="material-symbols-outlined">admin_panel_settings</span>
          <span class="font-semibold text-sm">{{ $t('nav.admin_terminal') }}</span>
        </button>
      </nav>

      <div class="flex flex-col gap-1 border-t border-white/50 pt-4 px-2 pb-4">
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
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#3525cd] mb-4" style="font-size: 48px;">progress_activity</span>
      </div>
      <div v-else-if="!request" class="text-center py-20">
        <h2 class="text-xl font-bold text-gray-600">Request not found</h2>
      </div>
      <div v-else class="w-full max-w-5xl mx-auto">
        
        <!-- Request Header Card -->
        <div class="premium-card rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('order_detail.order_no') }}</span>
                <span class="text-sm font-bold text-[#3525cd]">{{ request.id.split('-')[0].toUpperCase() }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{{ request.product_name }}</h1>
            </div>
            <span :class="['font-semibold text-xs px-3 py-1 rounded-full text-white self-start', getStatusClass(request.status)]">
              {{ $t('status.' + request.status) || request.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('admin.category') }}</p>
              <p class="font-semibold text-sm text-gray-800">{{ request.category }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('admin.request_date') }}</p>
              <p class="font-semibold text-sm text-gray-800">{{ formatDate(request.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('request_details.quantity') }}</p>
              <p class="font-semibold text-sm text-gray-800">{{ request.quantity }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('admin.est_volume') }}</p>
              <p class="font-semibold text-sm text-[#3525cd]">{{ request.quoted_price ? '$' + Number(request.quoted_price).toLocaleString() : 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <!-- Left Column: Product Details & Specs -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Product Details -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#3525cd]">inventory_2</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.product_details') }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">{{ $t('request_details.product_name') }}</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.product_name }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">{{ $t('admin.category') }}</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.category }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">{{ $t('request_details.quantity') }}</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.quantity }} units</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-sm text-gray-600">{{ $t('request_details.budget') }}</span>
                  <span class="text-sm font-semibold text-[#3525cd]">{{ request.budget_range }}</span>
                </div>
              </div>
            </div>

            <!-- Specifications -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#3525cd]">description</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.specifications') }}</h2>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {{ request.specifications }}
                </p>
              </div>
            </div>

            <!-- Reference Images -->
            <div v-if="request.image_urls && request.image_urls.length > 0" class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#3525cd]">image</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.references') }}</h2>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div v-for="(img, idx) in request.image_urls" :key="idx" class="relative group">
                  <img :src="'http://localhost:5000' + img" class="w-full h-32 object-cover rounded-lg border border-gray-200" />
                </div>
              </div>
            </div>

            <!-- Supplier Information (If Assigned) -->
            <div v-if="request.assigned_supplier_id" class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#3525cd]">business</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800">Assigned Supplier</h2>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span class="material-symbols-outlined text-blue-600 text-[20px]">verified</span>
                    </div>
                    <div>
                      <p class="font-semibold text-sm text-gray-800">{{ request.supplier_name }}</p>
                      <p class="text-xs text-gray-500">{{ request.factory_address }} • {{ request.verification_level }}</p>
                    </div>
                  </div>
                  <span class="text-lg font-bold text-[#3525cd]">${{ Number(request.quoted_price).toLocaleString() }}</span>
                </div>
                <div v-if="request.status === 'quoted' && userRole !== 'admin'" class="flex gap-2 mt-4">
                  <button @click="acceptQuote" :disabled="accepting" class="flex-1 px-3 py-2 bg-[#3525cd] text-white text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-70">
                    <span v-if="accepting" class="material-symbols-outlined animate-spin align-middle text-sm">progress_activity</span>
                    <span v-else>{{ $t('order_detail.accept_quote') }}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Rating Form (If Completed) -->
            <div v-if="request.status === 'completed' && request.assigned_supplier_id && !existingRating && userRole !== 'admin'" class="premium-card rounded-xl p-4 sm:p-6 bg-purple-50 border-purple-200">
              <h3 class="font-bold text-gray-800 mb-2">Rate your supplier</h3>
              <p class="text-sm text-gray-600 mb-4">How was your experience with {{ request.supplier_name }}?</p>
              
              <div class="flex items-center gap-2 mb-4">
                <button 
                  v-for="star in 5" 
                  :key="star" 
                  @click="ratingScore = star"
                  @mouseover="hoverScore = star"
                  @mouseleave="hoverScore = 0"
                  class="text-3xl transition-colors"
                  :class="star <= (hoverScore || ratingScore) ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </button>
              </div>
              
              <textarea 
                v-model="ratingReview"
                rows="3"
                placeholder="Write a review..."
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3525cd] mb-4 text-sm"
              ></textarea>
              
              <button 
                @click="submitRating" 
                :disabled="!ratingScore || submittingRating"
                class="px-6 py-2 bg-[#3525cd] text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Submit Review
              </button>
            </div>
            
            <div v-if="existingRating" class="premium-card rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-2">Your Review</h3>
              <div class="flex text-yellow-400 text-xl mb-2">
                {{ '★'.repeat(existingRating.score) }}{{ '☆'.repeat(5 - existingRating.score) }}
              </div>
              <p class="text-sm text-gray-700 italic">"{{ existingRating.review }}"</p>
            </div>
          </div>

          <!-- Right Column: Timeline & Actions -->
          <div class="space-y-4 sm:space-y-6">
            
            <!-- Status Timeline -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#3525cd]">timeline</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('order_detail.status_timeline') }}</h2>
              </div>

              <div class="space-y-4">
                <div v-for="(log, idx) in trackingLogs" :key="log.id" class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center', idx === trackingLogs.length - 1 ? 'bg-[#3525cd] ring-4 ring-[#3525cd]/20' : 'bg-green-500']">
                      <span v-if="idx === trackingLogs.length - 1" class="material-symbols-outlined text-white text-[16px]">radio_button_checked</span>
                      <span v-else class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div v-if="idx < trackingLogs.length - 1" class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p :class="['font-semibold text-sm', idx === trackingLogs.length - 1 ? 'text-[#3525cd]' : 'text-gray-800']">
                      {{ $t('status.' + log.status) || log.status }}
                    </p>
                    <p class="text-xs text-gray-500">{{ formatDate(log.created_at) }}</p>
                    <p v-if="log.notes" class="text-xs text-gray-600 mt-1">{{ log.notes }}</p>
                  </div>
                </div>
                <div v-if="trackingLogs.length === 0" class="text-sm text-gray-500 italic">No timeline events yet.</div>
              </div>
            </div>

            <!-- Admin Actions (Only if admin) -->
            <div v-if="userRole === 'admin'" class="premium-card rounded-xl p-4 sm:p-6 bg-blue-50 border border-blue-200">
              <h3 class="font-bold text-gray-800 mb-4">Admin Actions</h3>
              <div class="space-y-2">
                <button @click="openUpdateModal" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3525cd] text-white rounded-lg transition-colors font-semibold">
                  <span class="material-symbols-outlined text-[18px]">update</span>
                  Update Order Status
                </button>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-4">{{ $t('order_detail.quick_actions') }}</h3>
              <div class="space-y-2">
                <button class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-gray-600">download</span>
                  <span class="text-sm font-semibold text-gray-700">{{ $t('order_detail.download_pdf') }}</span>
                </button>
                <button class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-gray-600">share</span>
                  <span class="text-sm font-semibold text-gray-700">{{ $t('order_detail.share_request') }}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
    
    <!-- Admin Update Status Modal -->
    <div 
      v-if="showUpdateModal && userRole === 'admin'" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      @click.self="closeUpdateModal"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-gray-800">{{ $t('admin.update_status_title') }}</h2>
            </div>
            <button @click="closeUpdateModal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-gray-600">close</span>
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">{{ $t('admin.update_status_to') }}</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="status in statusOptions" 
                :key="status.value"
                @click="selectedStatus = status.value"
                :class="[
                  'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  selectedStatus === status.value 
                    ? 'border-[#3525cd] bg-[#3525cd]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <span class="material-symbols-outlined" :class="selectedStatus === status.value ? 'text-[#3525cd]' : 'text-gray-400'">
                  {{ status.icon }}
                </span>
                <span class="text-sm font-semibold" :class="selectedStatus === status.value ? 'text-[#3525cd]' : 'text-gray-700'">
                  {{ status.label }}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Price Quote ($)</label>
            <input type="number" v-model="adminPrice" class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-4 sm:p-6 rounded-b-2xl">
          <div class="flex gap-3">
            <button @click="closeUpdateModal" class="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              {{ $t('admin.cancel') }}
            </button>
            <button @click="saveStatusUpdate" class="flex-1 px-4 py-3 text-white font-semibold rounded-lg transition-all hover:opacity-95" style="background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);">
              {{ $t('admin.save_changes') }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { requestService } from '../api/requestService.js'
import { adminService } from '../api/adminService.js'
import { ratingService } from '../api/ratingService.js'

const router = useRouter()
const route = useRoute()

// State
const request = ref(null)
const trackingLogs = ref([])
const loading = ref(true)
const accepting = ref(false)
const userRole = ref(JSON.parse(localStorage.getItem('user') || '{}').role)

const ratingScore = ref(0)
const hoverScore = ref(0)
const ratingReview = ref('')
const existingRating = ref(null)
const submittingRating = ref(false)

// Admin Modal
const showUpdateModal = ref(false)
const selectedStatus = ref('')
const adminPrice = ref('')

const statusOptions = [
  { value: 'quoted', label: 'Quoted', icon: 'request_quote' },
  { value: 'processing', label: 'Processing', icon: 'conveyor_belt' },
  { value: 'inspected', label: 'Inspected', icon: 'verified' },
  { value: 'shipped', label: 'Shipped', icon: 'local_shipping' },
  { value: 'completed', label: 'Completed', icon: 'task_alt' }
]

// Device Detection
const isTablet = ref(false)
const isMobile = ref(false)
const isDesktop = ref(false)
const windowWidth = ref(0)
const activeRoute = ref('requests')

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

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

const loadData = async () => {
  try {
    const reqId = route.params.id
    request.value = await requestService.getRequestById(reqId)
    trackingLogs.value = await requestService.getTrackingLogs(reqId)
    if (request.value.status === 'completed') {
      existingRating.value = await ratingService.getByRequest(reqId)
    }
  } catch (error) {
    console.error('Failed to load request:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
  loadData()
})
onUnmounted(() => window.removeEventListener('resize', updateDeviceType))

const acceptQuote = async () => {
  if (!confirm('Are you sure you want to accept this quotation?')) return;
  accepting.value = true;
  try {
    await requestService.acceptQuote(request.value.id)
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to accept quote')
  } finally {
    accepting.value = false
  }
}

const submitRating = async () => {
  submittingRating.value = true
  try {
    const data = await ratingService.createRating({
      request_id: request.value.id,
      supplier_id: request.value.assigned_supplier_id,
      score: ratingScore.value,
      review: ratingReview.value
    })
    existingRating.value = data
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to submit rating')
  } finally {
    submittingRating.value = false
  }
}

const openUpdateModal = () => {
  selectedStatus.value = request.value.status
  adminPrice.value = request.value.quoted_price
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
}

const saveStatusUpdate = async () => {
  try {
    await adminService.updateRequest(request.value.id, {
      status: selectedStatus.value,
      quoted_price: adminPrice.value
    })
    closeUpdateModal()
    await loadData()
  } catch (error) {
    alert(error.response?.data?.message || 'Update failed')
  }
}

const goBack = () => router.back()
const navigate = (r) => { activeRoute.value = r; if (r === 'dashboard') router.push('/dashboard') }
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; line-height: 1; }
.glass-header { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255, 255, 255, 0.5); }
.glass-sidebar { background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(12px); }
.premium-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 1); }
.premium-card:hover { box-shadow: 0 20px 40px -12px rgba(53, 37, 205, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 1); }
.active-glow { box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2); }
.status-quoted { background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.status-processing { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.status-pending { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.status-completed { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.fab-premium { background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%); box-shadow: 0 15px 30px rgba(53, 37, 205, 0.3), inset 0 1px 0 rgba(255,255,255,0.4); }
</style>