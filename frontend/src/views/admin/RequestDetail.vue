<template>
  <AdminLayout>
    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      
      <!-- Header Area inside Main -->
      <header class="flex justify-between items-end gap-6 mb-8">
        <div>
          <button @click="goBack" class="flex items-center gap-2 text-[#4f378a] hover:underline mb-2 font-semibold">
            <span class="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <h2 class="text-[40px] leading-[1.1] tracking-[-0.02em] font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Request Detail</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551]">Manage options and timeline</p>
        </div>
        <div class="flex gap-4 items-center">
          <LanguageSwitcher />
        </div>
      </header>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 48px;">progress_activity</span>
      </div>
      <div v-else-if="!request" class="text-center py-20">
        <h2 class="text-xl font-bold text-gray-600">Request not found</h2>
      </div>
      <div v-else class="w-full max-w-5xl mx-auto">
        
        <!-- Request Header Card -->
        <div class="bg-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm border border-gray-100">
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
        </div>

        <!-- Tracking Timeline Header -->
        <div class="mb-6">
          <div class="relative w-full flex justify-between items-center px-2">
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full transform -translate-y-1/2"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-[#4f378a] -z-10 rounded-full transform -translate-y-1/2 transition-all duration-1000" :style="{ width: progressWidth }"></div>
            
            <div v-for="stage in timelineStages" :key="stage.value" class="flex flex-col items-center gap-2 bg-[#f3f0fa] px-1 relative">
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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Buyer Information -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">person</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">Buyer Information</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Name</p>
                  <p class="font-semibold text-sm text-gray-800">{{ request.buyer_name }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Company</p>
                  <p class="font-semibold text-sm text-gray-800">{{ request.buyer_company }}</p>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-xs text-gray-500 mb-1">Email</p>
                  <p class="font-semibold text-sm text-[#4f378a]">{{ request.buyer_email }}</p>
                </div>
              </div>
            </div>

            <!-- Product Details -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
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
                  <span class="text-sm text-gray-600">{{ $t('request_details.quantity') }}</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.quantity }} units</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-sm text-gray-600">{{ $t('request_details.budget') }}</span>
                  <span class="text-sm font-semibold text-[#4f378a]">{{ request.budget_range }}</span>
                </div>
                <div class="mt-4 bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-700 whitespace-pre-line">{{ request.specifications }}</p>
                </div>
              </div>
            </div>

            <!-- Product Options -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a]">list_alt</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800">Product Options</h2>
                </div>
                <button v-if="['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer'].includes(request.status)" @click="showOptionsModal = true" class="px-3 py-1.5 bg-[#4f378a] text-white text-xs font-bold rounded-lg hover:opacity-90">
                  + Add Option
                </button>
              </div>
              
              <div v-if="request.options && request.options.length > 0" class="space-y-4">
                <div v-for="opt in request.options" :key="opt.id" class="border border-gray-200 bg-gray-50/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 relative" :class="{'ring-2 ring-[#4f378a]': request.selected_option_id === opt.id}">
                  <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="font-bold text-gray-800">{{ opt.product_name }}</h3>
                      <span v-if="request.selected_option_id === opt.id" class="px-2 py-1 bg-[#4f378a] text-white text-xs font-bold rounded-lg flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">check_circle</span> Selected by Buyer
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">{{ opt.description }}</p>
                    <p class="font-bold text-[#4f378a] mb-4">Price: {{ opt.price_min }} - {{ opt.price_max }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-500 text-sm">
                No options added yet. Please source from suppliers and add options for the buyer.
              </div>
            </div>

            <!-- Negotiation Chat -->
            <div v-if="shouldShowChat">
              <ChatComponent :requestId="request.id" :isAdmin="true" />
            </div>

          </div>

          <!-- Right Column: Timeline & Actions -->
          <div class="space-y-4 sm:space-y-6">
            
            <!-- Admin Golden Path Actions -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border-2 border-[#4f378a]/20">
              <h3 class="font-bold text-[#4f378a] mb-4">Admin Operations</h3>
              <div class="space-y-3">
                
                <button v-if="request.status === 'menunggu_kesepakatan_final'" @click="finalizeDeal" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4f378a] text-white rounded-lg transition-colors font-semibold disabled:opacity-50">
                  <span class="material-symbols-outlined text-[18px]">gavel</span>
                  Finalisasi Kesepakatan
                </button>

                <div v-if="request.status === 'menunggu_verifikasi_pembayaran'" class="space-y-3">
                  <a v-if="request.payment_proof_url" :href="'http://localhost:5000' + request.payment_proof_url" target="_blank" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-[#4f378a] border border-[#4f378a]/30 rounded-lg transition-colors font-semibold hover:bg-gray-200">
                    <span class="material-symbols-outlined text-[18px]">receipt_long</span>
                    Lihat Bukti Bayar Buyer
                  </a>
                  <button @click="verifyPayment" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg transition-colors font-semibold hover:bg-orange-600 disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]">verified_user</span>
                    Verifikasi Pembayaran
                  </button>
                </div>

                <button v-if="request.status === 'sedang_diproses'" @click="shipOrder" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg transition-colors font-semibold hover:bg-cyan-700 disabled:opacity-50">
                  <span class="material-symbols-outlined text-[18px]">local_shipping</span>
                  Kirim Barang (Ship)
                </button>

                <div v-if="request.status === 'menunggu_verifikasi_admin'" class="space-y-3">
                  <div class="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 mb-2">
                    Buyer telah menekan tombol barang tiba. Pastikan Anda telah memeriksa dokumen Bill of Lading.
                  </div>
                  <button @click="completeOrder" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg transition-colors font-semibold hover:bg-teal-700 disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]">done_all</span>
                    Selesaikan Order
                  </button>
                </div>
                
                <div v-if="['selesai', 'batal', 'dispute', 'menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_pembayaran'].includes(request.status)" class="text-sm text-gray-500 italic text-center py-2">
                  No action required at this stage or waiting for buyer.
                </div>

              </div>
            </div>

            <!-- Status Timeline -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
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
    </main>
    
    <!-- Add Option Modal -->
    <div v-if="showOptionsModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="showOptionsModal = false">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div class="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-800">Add Product Option</h2>
          <button @click="showOptionsModal = false" class="text-gray-500 hover:text-gray-800"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-4 sm:p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Option Name</label>
            <input v-model="newOption.product_name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" placeholder="e.g. Premium Solar Panel 500W">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea v-model="newOption.description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" placeholder="Brand, specs, materials..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Min Price</label>
              <input v-model="newOption.price_min" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" placeholder="0">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Max Price</label>
              <input v-model="newOption.price_max" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" placeholder="0">
            </div>
          </div>
          <button @click="submitOption" :disabled="uploadingOption" class="w-full py-3 bg-[#4f378a] text-white rounded-lg font-bold hover:bg-purple-800 transition-colors disabled:opacity-50">
            {{ uploadingOption ? 'Saving...' : 'Save Option' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { adminService } from '../../api/adminService.js'
import { requestService } from '../../api/requestService.js'

const router = useRouter()
const route = useRoute()

// State
const request = ref(null)
const trackingLogs = ref([])
const loading = ref(true)
const loadingAction = ref(false)

// Options Modal
const showOptionsModal = ref(false)
const uploadingOption = ref(false)
const newOption = ref({ product_name: '', description: '', price_min: '', price_max: '' })

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
    request.value = await adminService.getAdminRequestById(reqId)
    trackingLogs.value = await requestService.getTrackingLogs(reqId)
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

const submitOption = async () => {
  if (!newOption.value.product_name) return;
  uploadingOption.value = true;
  try {
    // Send array with 1 option
    await adminService.uploadOptions(request.value.id, [newOption.value]);
    showOptionsModal.value = false;
    newOption.value = { product_name: '', description: '', price_min: '', price_max: '' };
    await loadData();
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to add option');
  } finally {
    uploadingOption.value = false;
  }
}

const finalizeDeal = async () => {
  if(!confirm('Finalisasi deal? Ini akan memunculkan form bayar ke buyer.')) return;
  loadingAction.value = true;
  try {
    await adminService.finalizeDeal(request.value.id);
    await loadData();
  } catch (e) {
    alert(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const verifyPayment = async () => {
  if(!confirm('Verifikasi pembayaran? Order akan diproses.')) return;
  loadingAction.value = true;
  try {
    await adminService.verifyPayment(request.value.id);
    await loadData();
  } catch (e) {
    alert(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const shipOrder = async () => {
  if(!confirm('Kirim pesanan?')) return;
  loadingAction.value = true;
  try {
    await adminService.shipOrder(request.value.id);
    await loadData();
  } catch (e) {
    alert(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const completeOrder = async () => {
  if(!confirm('Selesaikan pesanan? (Sudah verifikasi B/L dan penerimaan?)')) return;
  loadingAction.value = true;
  try {
    await adminService.completeOrder(request.value.id);
    await loadData();
  } catch (e) {
    alert(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const goBack = () => router.back()
const navigate = (r) => { activeRoute.value = r; if (r === 'dashboard') router.push('/admin/dashboard') }
</script>
