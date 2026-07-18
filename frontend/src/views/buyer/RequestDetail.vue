<template>
  <div class="min-h-screen bg-[#f8fafc] text-on-surface antialiased font-['Inter',_sans-serif]">
    
    <!-- Top Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 glass-header flex justify-between items-center w-full px-4 sm:px-6 py-4 shadow-sm" style="height: 72px;">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <span class="text-lg sm:text-xl font-bold text-[#4f378a]">{{ $t('order_detail.title') }}</span>
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
        <h2 class="text-xl font-black text-[#4f378a]">{{ $t('auth.title') }}</h2>
        <p class="text-sm text-gray-500/70">{{ userRole === 'admin' ? 'Administrator' : $t('dashboard.verified_buyer') }}</p>
      </div>

      <nav class="flex-grow flex flex-col gap-1 px-2">
        <button @click="navigate('dashboard')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'dashboard' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="font-semibold text-sm">{{ $t('nav.dashboard') }}</span>
        </button>
        <button @click="navigate('requests')" :class="['flex items-center gap-4 p-4 text-white active-glow rounded-lg font-bold translate-x-1 transition-all duration-200 bg-[#4f378a]']">
          <span class="material-symbols-outlined">request_quote</span>
          <span class="font-semibold text-sm">{{ $t('nav.requests') }}</span>
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
        <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 48px;">progress_activity</span>
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
                <span class="text-sm font-bold text-[#4f378a]">{{ request.id.split('-')[0].toUpperCase() }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{{ request.product_name }}</h1>
            </div>
            <span :class="['font-semibold text-xs px-3 py-1 rounded-full text-white self-start', getStatusClass(request.status)]">
              {{ request.status.replace(/_/g, ' ').toUpperCase() }}
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
          </div>
        </div>

        <!-- Tracking Timeline Header -->
        <div class="mb-6">
          <div class="relative w-full flex justify-between items-center px-2">
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full transform -translate-y-1/2"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-[#4f378a] -z-10 rounded-full transform -translate-y-1/2 transition-all duration-1000" :style="{ width: progressWidth }"></div>
            
            <div v-for="stage in timelineStages" :key="stage.value" class="flex flex-col items-center gap-2 bg-[#f8fafc] px-1 relative">
              <div :class="[
                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500',
                stage.passed ? 'bg-[#4f378a] text-white shadow-lg shadow-[#4f378a]/30 scale-110' : 
                stage.current ? 'bg-white border-2 border-[#4f378a] text-[#4f378a] scale-110' : 'bg-gray-100 text-gray-400'
              ]">
                <span class="material-symbols-outlined text-[18px]">{{ stage.icon }}</span>
              </div>
              <span :class="['text-[11px] font-bold uppercase tracking-wider hidden sm:block', stage.current || stage.passed ? 'text-[#4f378a]' : 'text-gray-400']">{{ stage.label }}</span>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Product Details -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">inventory_2</span>
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
                  <span class="text-sm font-semibold text-[#4f378a]">{{ request.budget_range }}</span>
                </div>
              </div>
            </div>

            <!-- Product Options (Golden Path) -->
            <div v-if="request.options && request.options.length > 0" class="premium-card rounded-xl p-4 sm:p-6 bg-blue-50/30 border border-blue-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">list_alt</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">Product Options</h2>
              </div>
              
              <div class="space-y-4">
                <div v-for="opt in request.options" :key="opt.id" class="border border-gray-200 bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 relative" :class="{'ring-2 ring-[#4f378a]': request.selected_option_id === opt.id}">
                  <div v-if="opt.image_url" class="w-full sm:w-32 h-32 shrink-0">
                    <img :src="opt.image_url" class="w-full h-full object-cover rounded-lg border border-gray-100" />
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="font-bold text-gray-800">{{ opt.product_name }}</h3>
                      <span v-if="request.selected_option_id === opt.id" class="px-2 py-1 bg-[#4f378a] text-white text-xs font-bold rounded-lg flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">check_circle</span> Selected
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">{{ opt.description }}</p>
                    <p class="font-bold text-[#4f378a] mb-4">Price: {{ opt.price_min }} - {{ opt.price_max }}</p>
                    
                    <button v-if="request.status === 'menunggu_pemilihan_buyer' && !request.selected_option_id" 
                            @click="selectOption(opt.id)" 
                            :disabled="selectingOption"
                            class="px-4 py-2 bg-[#4f378a] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                      Pilih Opsi Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upload Payment Proof -->
            <div v-if="request.status === 'menunggu_pembayaran' && request.deal_finalized_at" class="premium-card rounded-xl p-4 sm:p-6 bg-yellow-50 border border-yellow-200">
              <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-yellow-600">account_balance</span>
                Upload Bukti Pembayaran
              </h3>
              <p class="text-sm text-gray-600 mb-4">Kesepakatan telah difinalisasi. Silakan transfer dan unggah bukti pembayaran Anda untuk memulai proses produksi.</p>
              
              <div class="flex gap-2 items-center">
                <input type="file" ref="paymentProofInput" accept="image/*,.pdf" class="hidden" @change="handlePaymentProofChange">
                <button @click="paymentProofInput.click()" class="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">upload_file</span>
                  {{ paymentProofFile ? paymentProofFile.name : 'Pilih File Bukti Bayar' }}
                </button>
                <button @click="submitPaymentProof" :disabled="!paymentProofFile || uploadingProof" class="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center">
                  <span v-if="uploadingProof" class="material-symbols-outlined animate-spin">progress_activity</span>
                  <span v-else>Kirim</span>
                </button>
              </div>
            </div>

            <!-- Negotiation Chat -->
            <div v-if="shouldShowChat">
              <ChatComponent :requestId="request.id" :isAdmin="false" />
            </div>

            <!-- Action to Confirm Delivery (menunggu_verifikasi_admin) -->
            <div v-if="request.status === 'dikirim'" class="premium-card rounded-xl p-4 sm:p-6 bg-emerald-50 border border-emerald-200">
              <h3 class="font-bold text-gray-800 mb-2">Konfirmasi Barang Tiba</h3>
              <p class="text-sm text-gray-600 mb-4">Klik tombol di bawah jika barang fisik telah Anda terima dalam kondisi baik.</p>
              <button @click="confirmDelivery" :disabled="confirming" class="w-full px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <span v-if="confirming" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span class="material-symbols-outlined" v-else>done_all</span>
                Barang Diterima
              </button>
            </div>
            
            <!-- Cancel Action -->
            <div v-if="['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final'].includes(request.status)" class="premium-card rounded-xl p-4 sm:p-6 bg-red-50 border border-red-200 mt-4">
              <h3 class="font-bold text-red-800 mb-2">Batalkan Permintaan</h3>
              <p class="text-sm text-red-600 mb-4">Jika Anda berubah pikiran, Anda dapat membatalkan permintaan ini sebelum pembayaran dilakukan.</p>
              <button @click="cancelModalOpen = true" class="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
                Batalkan Permintaan
              </button>
            </div>

            <!-- Dispute Action -->
            <div v-if="['dikirim', 'menunggu_verifikasi_admin'].includes(request.status)" class="premium-card rounded-xl p-4 sm:p-6 bg-yellow-50 border border-yellow-200 mt-4">
              <h3 class="font-bold text-yellow-800 mb-2">Ajukan Komplain</h3>
              <p class="text-sm text-yellow-600 mb-4">Jika ada masalah dengan pesanan, ajukan komplain untuk ditinjau oleh Admin.</p>
              <button @click="disputeModalOpen = true" class="w-full px-4 py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 transition-colors">
                Ajukan Komplain
              </button>
            </div>
            
            <!-- Rating Form (If Completed) -->
            <div v-if="request.status === 'selesai' && !existingRating" class="premium-card rounded-xl p-4 sm:p-6 bg-purple-50 border-purple-200">
              <h3 class="font-bold text-gray-800 mb-2">Beri Rating Pesanan Ini</h3>
              <p class="text-sm text-gray-600 mb-4">Bagaimana pengalaman Anda?</p>
              
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
                placeholder="Tulis ulasan Anda..."
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f378a] mb-4 text-sm"
              ></textarea>
              
              <button 
                @click="submitRating" 
                :disabled="!ratingScore || submittingRating"
                class="px-6 py-2 bg-[#4f378a] text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Kirim Ulasan
              </button>
            </div>
            
            <div v-if="existingRating" class="premium-card rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-2">Ulasan Anda</h3>
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
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">timeline</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('order_detail.status_timeline') }}</h2>
              </div>

              <div class="space-y-4">
                <div v-for="(log, idx) in trackingLogs" :key="log.id" class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center', idx === trackingLogs.length - 1 ? 'bg-[#4f378a] ring-4 ring-[#4f378a]/20' : 'bg-green-500']">
                      <span v-if="idx === trackingLogs.length - 1" class="material-symbols-outlined text-white text-[16px]">radio_button_checked</span>
                      <span v-else class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div v-if="idx < trackingLogs.length - 1" class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p :class="['font-semibold text-sm', idx === trackingLogs.length - 1 ? 'text-[#4f378a]' : 'text-gray-800']">
                      {{ log.status.replace(/_/g, ' ').toUpperCase() }}
                    </p>
                    <p class="text-xs text-gray-500">{{ formatDate(log.created_at) }}</p>
                    <p v-if="log.notes" class="text-xs text-gray-600 mt-1">{{ log.notes }}</p>
                  </div>
                </div>
                <div v-if="trackingLogs.length === 0" class="text-sm text-gray-500 italic">No timeline events yet.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Cancel Modal -->
      <div v-if="cancelModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Batalkan Permintaan</h2>
          <p class="text-sm text-gray-600 mb-4">Tuliskan alasan Anda membatalkan permintaan ini.</p>
          <textarea v-model="cancelReason" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4" placeholder="Alasan pembatalan..."></textarea>
          <div class="flex gap-2 justify-end">
            <button @click="cancelModalOpen = false" class="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">Batal</button>
            <button @click="submitCancel" :disabled="!cancelReason || cancelling" class="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50">Ya, Batalkan</button>
          </div>
        </div>
      </div>

      <!-- Dispute Modal -->
      <div v-if="disputeModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="disputeModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Ajukan Komplain</h2>
          <p class="text-sm text-gray-600 mb-4">Tuliskan alasan atau masalah terkait pesanan ini.</p>
          <textarea v-model="disputeReason" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4" placeholder="Detail masalah..."></textarea>
          <div class="flex gap-2 justify-end">
            <button @click="disputeModalOpen = false" class="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">Batal</button>
            <button @click="submitDispute" :disabled="!disputeReason || disputing" class="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 disabled:opacity-50">Kirim Komplain</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import { requestService } from '../../api/requestService.js'
import { ratingService } from '../../api/ratingService.js'

const router = useRouter()
const route = useRoute()

// State
const request = ref(null)
const trackingLogs = ref([])
const loading = ref(true)
const confirming = ref(false)
const userRole = ref(JSON.parse(localStorage.getItem('user') || '{}').role)

const ratingScore = ref(0)
const hoverScore = ref(0)
const ratingReview = ref('')
const existingRating = ref(null)
const submittingRating = ref(false)

const cancelModalOpen = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)

const disputeModalOpen = ref(false)
const disputeReason = ref('')
const disputing = ref(false)

const selectingOption = ref(false)
const paymentProofInput = ref(null)
const paymentProofFile = ref(null)
const uploadingProof = ref(false)

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

// The Golden Path Stages
const stages = [
  'menunggu_penawaran_admin', 
  'menunggu_pemilihan_buyer', 
  'menunggu_kesepakatan_final', 
  'menunggu_pembayaran', 
  'menunggu_verifikasi_pembayaran', 
  'sedang_diproses', 
  'dikirim', 
  'menunggu_verifikasi_admin', 
  'selesai'
];

const timelineStages = computed(() => {
  if (!request.value) return [];
  const currentIdx = Math.max(0, stages.indexOf(request.value.status));
  
  return [
    { value: 'menunggu_penawaran_admin', label: 'RFQ Sent', icon: 'edit_document', passed: currentIdx > 0, current: currentIdx === 0 },
    { value: 'menunggu_pemilihan_buyer', label: 'Options', icon: 'list_alt', passed: currentIdx > 1, current: currentIdx === 1 },
    { value: 'menunggu_kesepakatan_final', label: 'Negotiate', icon: 'forum', passed: currentIdx > 2, current: currentIdx === 2 },
    { value: 'menunggu_pembayaran', label: 'Payment', icon: 'payments', passed: currentIdx > 3, current: currentIdx === 3 },
    { value: 'sedang_diproses', label: 'Process', icon: 'conveyor_belt', passed: currentIdx > 5, current: currentIdx === 5 },
    { value: 'dikirim', label: 'Shipped', icon: 'local_shipping', passed: currentIdx > 6, current: currentIdx === 6 },
    { value: 'selesai', label: 'Complete', icon: 'task_alt', passed: currentIdx > 8, current: currentIdx === 8 }
  ];
});

const progressWidth = computed(() => {
  if (!request.value) return '0%';
  const currentIdx = Math.max(0, stages.indexOf(request.value.status));
  return `${(currentIdx / (stages.length - 1)) * 100}%`;
});

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getStatusClass = (status) => {
  const classes = {
    'menunggu_penawaran_admin': 'bg-gray-500',
    'menunggu_pemilihan_buyer': 'bg-blue-500',
    'menunggu_kesepakatan_final': 'bg-indigo-500',
    'menunggu_pembayaran': 'bg-yellow-500',
    'menunggu_verifikasi_pembayaran': 'bg-orange-500',
    'sedang_diproses': 'bg-blue-600',
    'dikirim': 'bg-cyan-500',
    'menunggu_verifikasi_admin': 'bg-teal-500',
    'selesai': 'bg-green-500',
    'batal': 'bg-red-500',
    'dispute': 'bg-red-700'
  }
  return classes[status] || 'bg-gray-500'
}

const shouldShowChat = computed(() => {
  if (!request.value) return false;
  const idx = stages.indexOf(request.value.status);
  return idx >= 2 && request.value.status !== 'batal'; // Show from 'menunggu_kesepakatan_final'
});

const loadData = async () => {
  try {
    const reqId = route.params.id
    request.value = await requestService.getRequestById(reqId)
    trackingLogs.value = await requestService.getTrackingLogs(reqId)
    if (request.value.status === 'selesai') {
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

const selectOption = async (optionId) => {
  selectingOption.value = true;
  try {
    await requestService.selectOption(request.value.id, optionId);
    await loadData();
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to select option');
  } finally {
    selectingOption.value = false;
  }
}

const handlePaymentProofChange = (e) => {
  if (e.target.files.length > 0) {
    paymentProofFile.value = e.target.files[0];
  }
}

const submitPaymentProof = async () => {
  if (!paymentProofFile.value) return;
  uploadingProof.value = true;
  try {
    const formData = new FormData();
    formData.append('payment_proof', paymentProofFile.value);
    await requestService.uploadPaymentProof(request.value.id, formData);
    paymentProofFile.value = null;
    await loadData();
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to upload payment proof');
  } finally {
    uploadingProof.value = false;
  }
}

const confirmDelivery = async () => {
  if (!confirm('Apakah Anda yakin barang fisik telah diterima? Admin akan memverifikasi langkah ini.')) return;
  confirming.value = true
  try {
    await requestService.confirmDelivery(request.value.id)
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to confirm delivery')
  } finally {
    confirming.value = false
  }
}

const submitCancel = async () => {
  cancelling.value = true;
  try {
    await requestService.cancelRequest(request.value.id, cancelReason.value);
    cancelModalOpen.value = false;
    await loadData();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to cancel request');
  } finally {
    cancelling.value = false;
  }
}

const submitDispute = async () => {
  disputing.value = true;
  try {
    await requestService.disputeRequest(request.value.id, disputeReason.value);
    disputeModalOpen.value = false;
    await loadData();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to dispute request');
  } finally {
    disputing.value = false;
  }
}

const submitRating = async () => {
  submittingRating.value = true
  try {
    const data = await ratingService.createRating({
      request_id: request.value.id,
      supplier_id: request.value.assigned_supplier_id || request.value.user_id, // Fallback if no supplier explicitly attached to ratings in new schema
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

const goBack = () => router.back()
const navigate = (r) => { activeRoute.value = r; if (r === 'dashboard') router.push('/buyer/dashboard') }
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.glass-sidebar {
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.premium-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 1);
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.05),
    0 8px 10px -6px rgba(0, 0, 0, 0.01),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c7c7cc;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a1a1a6;
}
</style>
