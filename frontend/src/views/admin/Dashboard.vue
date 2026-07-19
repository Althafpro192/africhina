<template>
  <AdminLayout>
    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      <!-- Header -->
      <header class="flex justify-between items-end gap-6">
        <div>
          <h2 class="text-[48px] leading-[1.1] tracking-[-0.02em] font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">{{ $t('admin.title') }}</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551]">{{ $t('admin.subtitle') }}</p>
        </div>
        <div class="flex gap-4 items-center">
          <div class="relative w-80">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7582]">search</span>
            <input 
              v-model="searchQuery"
              class="w-full pl-12 pr-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 text-[#1d1b20] placeholder:text-[#cbc4d2] outline-none" 
              :placeholder="$t('admin.search_placeholder')" 
              type="text"
            />
          </div>
        </div>
      </header>

      <!-- STATS GRID -->
      <section v-if="stats" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <!-- Total Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#4f378a]/10 flex items-center justify-center border border-[#4f378a]/20">
              <span class="material-symbols-outlined text-[#4f378a] text-2xl" style="font-variation-settings: 'FILL' 1;">assignment</span>
            </div>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('admin.total_requests') }}</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">{{ stats.total_requests }}</p>
        </div>

        <!-- Pending Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <span class="material-symbols-outlined text-orange-600 text-2xl" style="font-variation-settings: 'FILL' 1;">hourglass_empty</span>
            </div>
            <span class="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">High Priority</span>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('admin.pending_approval') }}</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">{{ stats.pending_requests }}</p>
        </div>

        <!-- Processing Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <span class="material-symbols-outlined text-blue-600 text-2xl" style="font-variation-settings: 'FILL' 1;">conveyor_belt</span>
            </div>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('admin.in_processing') }}</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">{{ stats.processing_requests }}</p>
        </div>

        <!-- Completed Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <span class="material-symbols-outlined text-green-600 text-2xl" style="font-variation-settings: 'FILL' 1;">task_alt</span>
            </div>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('admin.completed_deals') }}</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">{{ stats.completed_requests }}</p>
        </div>
      </section>

      <!-- TABLE SECTION -->
      <section class="glass-panel rounded-3xl deep-shadow overflow-hidden">
        <div class="p-6 border-b border-[#cbc4d2] flex justify-between items-center bg-white/30">
          <h4 class="text-[24px] leading-[1.3] font-bold text-[#4f378a]">{{ $t('admin.recent_requests') }}</h4>
          <div class="flex gap-3">
            <select v-model="filterStatus" class="px-4 py-2 rounded-xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none text-sm text-[#1d1b20]">
              <option value="">All Statuses</option>
              <option value="menunggu_penawaran_admin">Pending</option>
              <option value="menunggu_pemilihan_buyer">Quoted</option>
              <option value="sedang_diproses">Processing</option>
              <option value="dikirim">Shipped</option>
              <option value="selesai">Completed</option>
              <option value="batal">Rejected</option>
            </select>
            <select v-model="filterCategory" class="px-4 py-2 rounded-xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none text-sm text-[#1d1b20]">
              <option value="">All Categories</option>
              <option value="Machinery">Machinery</option>
              <option value="Electronics">Electronics</option>
              <option value="Textiles">Textiles</option>
              <option value="Construction">Construction</option>
              <option value="Solar">Solar</option>
            </select>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[#7a7582] uppercase text-[11px] font-bold tracking-widest bg-[#f8f2fa]/50">
                <th class="px-8 py-4">{{ $t('admin.buyer_entity') }}</th>
                <th class="px-6 py-4">{{ $t('admin.category') }}</th>
                <th class="px-6 py-4">{{ $t('admin.request_date') }}</th>
                <th class="px-6 py-4">{{ $t('admin.est_volume') }}</th>
                <th class="px-6 py-4">{{ $t('admin.status') }}</th>
                <th class="px-6 py-4 text-right">{{ $t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#cbc4d2]/30" v-if="!loading">
              <tr v-for="req in filteredRequests" :key="req.id" class="group hover:bg-gradient-to-r hover:from-[#4f378a]/5 hover:to-transparent transition-all cursor-pointer">
                <td class="px-8 py-5" @click="router.push(`/admin/request/${req.id}`)">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full border-2 border-[#4f378a]/30 p-0.5 flex items-center justify-center bg-gray-100">
                      <span class="material-symbols-outlined text-[#4f378a]">business</span>
                    </div>
                    <div>
                      <p class="font-bold text-[#1d1b20]">{{ req.company_name || req.buyer_name }}</p>
                      <p class="text-xs text-[#7a7582]">{{ req.product_name }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="bg-[#ece6ee] px-3 py-1 rounded-lg text-[#4f378a] text-xs font-bold border border-white/50 shadow-sm">{{ req.category }}</span>
                </td>
                <td class="px-6 py-5 text-sm text-[#494551]">{{ formatDate(req.created_at) }}</td>
                <td class="px-6 py-5 font-bold text-[#1d1b20]">{{ req.quoted_price ? '$' + Number(req.quoted_price).toLocaleString() : 'Pending' }}</td>
                <td class="px-6 py-5">
                  <div :class="getStatusBadgeClass(req.status)">
                    {{ formatStatusLabel(req.status) }}
                  </div>
                </td>
                <td class="px-6 py-5 text-right flex justify-end gap-2">
                  <button @click.stop="openStatusModal(req)" class="text-[#7a7582] hover:text-[#4f378a] px-3 py-1 rounded-lg hover:bg-gray-100 transition-all text-sm font-semibold">
                    Edit Status
                  </button>
                  <button @click.stop="openMediaModal(req)" class="text-[#7a7582] hover:text-[#4f378a] px-3 py-1 rounded-lg hover:bg-gray-100 transition-all text-sm font-semibold" title="Upload QC Media">
                    <span class="material-symbols-outlined text-[18px]">add_a_photo</span>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredRequests.length === 0">
                <td colspan="6" class="px-8 py-10 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="px-8 py-10 text-center text-gray-500">
                  <span class="material-symbols-outlined animate-spin text-[#3525cd]" style="font-size: 32px;">progress_activity</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- STATUS UPDATE MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center transition-all duration-300', isModalOpen ? 'visible' : 'invisible']">
      <!-- Backdrop -->
      <div 
        :class="['absolute inset-0 bg-[#322f35]/40 backdrop-blur-sm transition-opacity duration-300', isModalOpen ? 'opacity-100' : 'opacity-0']" 
        @click="closeStatusModal"
      ></div>
      
      <!-- Modal Content -->
      <div :class="['bg-white w-[500px] rounded-3xl p-8 shadow-2xl relative border border-gray-200 transition-all duration-300', isModalOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-[24px] leading-[1.3] font-bold text-[#4f378a]">{{ $t('admin.update_status_title') }}</h3>
            <p class="text-sm text-[#494551] mt-1">{{ editingRequest?.product_name }}</p>
          </div>
          <button @click="closeStatusModal" class="text-[#7a7582] hover:text-[#4f378a] transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Status Selection -->
          <div class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551]">{{ $t('admin.update_status_to') }}</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                v-for="status in statusOptions" 
                :key="status.value"
                @click="selectedStatus = status.value" 
                :class="['flex items-center gap-3 p-3 rounded-2xl bg-white border transition-all', selectedStatus === status.value ? 'border-[#4f378a] bg-[#4f378a]/5 ring-2 ring-[#4f378a]' : 'border-gray-200 hover:bg-gray-50']"
              >
                <span :class="['material-symbols-outlined', selectedStatus === status.value ? 'text-[#4f378a]' : status.color]">{{ status.icon }}</span>
                <span :class="['font-bold text-xs', selectedStatus === status.value ? 'text-[#4f378a]' : 'text-[#1d1b20]']">{{ status.label }}</span>
              </button>
            </div>
          </div>

          <!-- Price Quote -->
          <div class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551]">Price Quote</label>
            <div class="flex gap-2">
              <select v-model="adminCurrency" class="w-1/3 px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none text-[#1d1b20] bg-white/70">
                <option value="USD">USD ($)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <input 
                v-model="adminPrice"
                type="number"
                class="w-2/3 px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none text-[#1d1b20] bg-white/70"
                placeholder="e.g. 4500"
              />
            </div>
          </div>

          <!-- Supplier Assignment -->
          <div class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551]">{{ $t('admin.assign_supplier') }}</label>
            <div class="relative">
              <select v-model="selectedSupplier" class="w-full pl-4 pr-10 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 appearance-none text-[#1d1b20] outline-none bg-white/70">
                <option value="">None</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.company_name }}
                </option>
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7a7582]">expand_more</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551]">{{ $t('admin.internal_notes') }}</label>
            <textarea v-model="internalNotes" class="w-full p-4 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 h-24 resize-none text-[#1d1b20] outline-none bg-white/70" placeholder="Internal updates (not visible to buyer)..."></textarea>
          </div>

          <!-- Production Progress (Visible when processing/production) -->
          <div v-if="['processing', 'production', 'inspected'].includes(selectedStatus)" class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551] flex justify-between">
              Production Progress <span>{{ productionProgress }}%</span>
            </label>
            <input 
              v-model="productionProgress" 
              type="range" 
              min="0" max="100" step="5"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4f378a]"
            />
          </div>


          <div class="flex gap-4 pt-4">
            <button @click="closeStatusModal" class="flex-1 py-3 rounded-2xl bg-[#ece6ee] text-[#1d1b20] font-bold hover:bg-[#e6e0e9] transition-all lift-effect">
              {{ $t('admin.cancel') }}
            </button>
            <button @click="saveChanges" :disabled="saving" class="flex-[2] px-8 py-3 rounded-2xl bg-[#4f378a] text-white font-bold shadow-lg shadow-[#4f378a]/20 border-t border-white/30 lift-effect disabled:opacity-70 flex items-center justify-center">
              <span v-if="saving" class="material-symbols-outlined animate-spin mr-2">progress_activity</span>
              {{ $t('admin.save_changes') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QC MEDIA MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center transition-all duration-300', isMediaModalOpen ? 'visible' : 'invisible']">
      <!-- Backdrop -->
      <div 
        :class="['absolute inset-0 bg-[#322f35]/40 backdrop-blur-sm transition-opacity duration-300', isMediaModalOpen ? 'opacity-100' : 'opacity-0']" 
        @click="closeMediaModal"
      ></div>
      
      <!-- Modal Content -->
      <div :class="['bg-white w-[500px] rounded-3xl p-8 shadow-2xl relative border border-gray-200 transition-all duration-300', isMediaModalOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-[24px] leading-[1.3] font-bold text-[#4f378a]">Upload QC Media</h3>
            <p class="text-sm text-[#494551] mt-1">{{ editingRequest?.product_name }}</p>
          </div>
          <button @click="closeMediaModal" class="text-[#7a7582] hover:text-[#4f378a] transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-6">
          <!-- QC Media Upload -->
          <div class="space-y-2">
            <div
              @click="triggerQcUpload"
              @dragover.prevent
              @dragenter.prevent
              @drop.prevent="handleQcDrop"
              class="border-2 border-dashed border-[#4f378a]/30 bg-[#4f378a]/5 rounded-2xl p-6 text-center cursor-pointer hover:border-[#4f378a]/60 hover:bg-[#4f378a]/10 transition-all"
            >
              <input ref="qcFileInput" type="file" multiple accept="image/*,video/*" @change="handleQcSelect" class="hidden" />
              <span class="material-symbols-outlined text-3xl text-[#4f378a] mb-2">add_a_photo</span>
              <p class="text-xs text-gray-500 font-medium">Click or drag media here to upload QC updates</p>
            </div>
            
            <div v-if="qcFiles.length > 0" class="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
              <div v-for="(file, idx) in qcFiles" :key="idx" class="relative shrink-0 w-16 h-16 rounded-xl border border-gray-200 overflow-hidden group">
                <img v-if="file.type.startsWith('image/')" :src="file.preview" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                  <span class="material-symbols-outlined text-gray-400">videocam</span>
                </div>
                <button @click.prevent="removeQcFile(idx)" class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button @click="closeMediaModal" class="flex-1 py-3 rounded-2xl bg-[#ece6ee] text-[#1d1b20] font-bold hover:bg-[#e6e0e9] transition-all lift-effect">
              Cancel
            </button>
            <button @click="saveMedia" :disabled="uploadingMedia || qcFiles.length === 0" class="flex-[2] px-8 py-3 rounded-2xl bg-[#4f378a] text-white font-bold shadow-lg shadow-[#4f378a]/20 border-t border-white/30 lift-effect disabled:opacity-70 flex items-center justify-center">
              <span v-if="uploadingMedia" class="material-symbols-outlined animate-spin mr-2">progress_activity</span>
              Upload Media
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';
const { showToast } = useToast();

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { adminService } from '../../api/adminService.js'
import { supplierService } from '../../api/supplierService.js'

const router = useRouter()

// Reactive State
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const loading = ref(true)
const requests = ref([])
const stats = ref(null)
const suppliers = ref([])
const saving = ref(false)

const isModalOpen = ref(false)
const isMediaModalOpen = ref(false)
const uploadingMedia = ref(false)
const editingRequest = ref(null)
const selectedStatus = ref('pending')
const selectedSupplier = ref('')
const adminPrice = ref('')
const adminCurrency = ref('USD')
const internalNotes = ref('')
const productionProgress = ref(0)
const qcFiles = ref([])
const qcFileInput = ref(null)

const statusOptions = [
  { value: 'menunggu_penawaran_admin', label: 'Pending', icon: 'hourglass_empty', color: 'text-yellow-600' },
  { value: 'menunggu_pemilihan_buyer', label: 'Quoted', icon: 'request_quote', color: 'text-orange-600' },
  { value: 'sedang_diproses', label: 'Processing', icon: 'conveyor_belt', color: 'text-blue-600' },
  { value: 'dikirim', label: 'Shipped', icon: 'local_shipping', color: 'text-purple-600' },
  { value: 'selesai', label: 'Completed', icon: 'task_alt', color: 'text-green-600' },
  { value: 'batal', label: 'Rejected', icon: 'cancel', color: 'text-red-600' }
]

const filteredRequests = computed(() => {
  let result = requests.value

  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }

  if (filterCategory.value) {
    result = result.filter(r => r.category && r.category.toLowerCase() === filterCategory.value.toLowerCase())
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      r.product_name.toLowerCase().includes(q) || 
      r.company_name?.toLowerCase().includes(q)
    )
  }
  
  return result
})

const loadData = async () => {
  loading.value = true
  try {
    requests.value = await adminService.getAdminRequests()
    stats.value = await adminService.getStatistics()
    suppliers.value = await supplierService.getAll()
  } catch (error) {
    console.error('Failed to load admin data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const getStatusBadgeClass = (status) => {
  const base = 'flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-bold w-fit shadow-sm'
  const map = {
    'menunggu_penawaran_admin': 'text-yellow-700 bg-yellow-100 border border-yellow-200',
    'menunggu_pemilihan_buyer': 'text-orange-700 bg-orange-100 border border-orange-200',
    'menunggu_kesepakatan_final': 'text-orange-700 bg-orange-100 border border-orange-200',
    'menunggu_pembayaran': 'text-blue-700 bg-blue-100 border border-blue-200',
    'menunggu_verifikasi_pembayaran': 'text-blue-700 bg-blue-100 border border-blue-200',
    'sedang_diproses': 'text-blue-700 bg-blue-100 border border-blue-200',
    'dikirim': 'text-purple-700 bg-purple-100 border border-purple-200',
    'menunggu_verifikasi_admin': 'text-purple-700 bg-purple-100 border border-purple-200',
    'selesai': 'text-green-700 bg-green-100 border border-green-200',
    'batal': 'text-red-700 bg-red-100 border border-red-200',
    'dispute': 'text-red-700 bg-red-100 border border-red-200'
  }
  return `${base} ${map[status] || 'text-gray-700 bg-gray-100 border border-gray-200'}`
}

const formatStatusLabel = (status) => {
  const map = {
    'menunggu_penawaran_admin': 'PENDING',
    'menunggu_pemilihan_buyer': 'QUOTED',
    'menunggu_kesepakatan_final': 'QUOTED',
    'menunggu_pembayaran': 'PROCESSING',
    'menunggu_verifikasi_pembayaran': 'PROCESSING',
    'sedang_diproses': 'PROCESSING',
    'dikirim': 'SHIPPED',
    'menunggu_verifikasi_admin': 'SHIPPED',
    'selesai': 'COMPLETED',
    'batal': 'REJECTED',
    'dispute': 'DISPUTE'
  }
  return map[status] || status.toUpperCase()
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const openStatusModal = (req) => {
  editingRequest.value = req
  selectedStatus.value = req.status
  selectedSupplier.value = req.assigned_supplier_id || ''
  adminPrice.value = req.quoted_price || ''
  adminCurrency.value = req.currency || 'USD'
  internalNotes.value = '' // Clear previous session notes
  productionProgress.value = req.production_progress || 0
  qcFiles.value = []
  isModalOpen.value = true
}

const closeStatusModal = () => {
  isModalOpen.value = false
  editingRequest.value = null
}

const openMediaModal = (req) => {
  editingRequest.value = req
  qcFiles.value = []
  isMediaModalOpen.value = true
}

const closeMediaModal = () => {
  isMediaModalOpen.value = false
  editingRequest.value = null
  qcFiles.value = []
}

const triggerQcUpload = () => qcFileInput.value?.click()

const handleQcSelect = (e) => processQcFiles(Array.from(e.target.files))
const handleQcDrop = (e) => processQcFiles(Array.from(e.dataTransfer.files))

const processQcFiles = (files) => {
  files.forEach(file => {
    if (qcFiles.value.length >= 5) return;
    const reader = new FileReader()
    reader.onload = (e) => {
      qcFiles.value.push({ file, preview: e.target.result, type: file.type })
    }
    reader.readAsDataURL(file)
  })
}

const removeQcFile = (index) => qcFiles.value.splice(index, 1)

const saveChanges = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('status', selectedStatus.value)
    
    if (selectedSupplier.value) formData.append('assigned_supplier_id', selectedSupplier.value)
    if (adminPrice.value) {
      formData.append('quoted_price', adminPrice.value)
      formData.append('currency', adminCurrency.value)
    }
    if (internalNotes.value) formData.append('notes', internalNotes.value)
    
    if (['processing', 'production', 'inspected'].includes(selectedStatus.value)) {
      formData.append('production_progress', productionProgress.value)
    }

    await adminService.updateRequest(editingRequest.value.id, formData)
    closeStatusModal()
    await loadData() // Refresh list and stats
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to update')
  } finally {
    saving.value = false
  }
}

const saveMedia = async () => {
  uploadingMedia.value = true
  try {
    const formData = new FormData()
    qcFiles.value.forEach(f => formData.append('qc_images', f.file));
    
    await adminService.uploadMedia(editingRequest.value.id, formData)
    closeMediaModal()
    await loadData()
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to upload media')
  } finally {
    uploadingMedia.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

:root {
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-blur: 20px;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-top-width: 1.5px;
}

.deep-shadow { box-shadow: 0 20px 50px rgba(79, 70, 229, 0.15); }
.lift-effect { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease; }
.lift-effect:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(79, 70, 229, 0.2); }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.inner-recess { box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }

/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbc4d2; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #4f378a; }
</style>