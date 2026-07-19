<template>
  <BuyerLayout activeRoute="requests" v-model:searchQuery="searchQuery" :notificationCount="notificationCount">
    <div class="flex h-full w-full overflow-hidden bg-gray-50/30">
      
      <!-- Left Pane: Request List -->
      <div 
        :class="[
          'w-full lg:w-[400px] xl:w-[450px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar',
          { 'hidden lg:block': route.params.id }
        ]"
      >
        <div class="p-4 sm:p-6">
          <!-- Header Section -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">{{ $t('nav.requests') }}</h1>
              <p class="text-gray-500 text-xs mt-1">Manage your active sourcing requests</p>
            </div>
            <button @click="createNewRequest" class="p-2 bg-[#4f378a] text-white rounded-lg hover:opacity-90 transition-all shadow-md" title="New Request">
              <span class="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingRequests" class="flex flex-col items-center justify-center py-20">
            <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 32px;">progress_activity</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredRequests.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-gray-300" style="font-size: 32px;">inbox</span>
            </div>
            <h3 class="text-base font-bold text-gray-800 mb-1">No Active Requests</h3>
            <p class="text-gray-500 mb-6 text-xs max-w-[200px]">You don't have any pending requests.</p>
            <button @click="createNewRequest" class="px-5 py-2 text-sm bg-[#4f378a] text-white font-bold rounded-lg shadow-md">
              Create Request
            </button>
          </div>

          <!-- Request List -->
          <div v-else class="space-y-3">
            <div
              v-for="req in filteredRequests"
              :key="req.id"
              :class="[
                'border rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col gap-3 relative overflow-hidden',
                route.params.id == req.id 
                  ? 'bg-blue-50/50 border-[#4f378a] shadow-md ring-1 ring-[#4f378a]/50' 
                  : 'bg-white border-gray-100 hover:border-[#4f378a]/30 hover:shadow-md hover:-translate-y-0.5'
              ]"
              @click="viewDetails(req.id)"
            >
              <!-- Indicator line for active item -->
              <div v-if="route.params.id == req.id" class="absolute left-0 top-0 bottom-0 w-1 bg-[#4f378a]"></div>
              
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{{ req.category }}</span>
                  <span class="text-[10px] text-gray-400 font-medium">{{ formatDate(req.created_at) }}</span>
                </div>
                <span :class="['font-bold text-[9px] px-2 py-0.5 rounded-full text-white whitespace-nowrap', getStatusClass(req.status)]">
                  {{ req.status === 'quoted' ? 'Quote Received' : 'Awaiting Quotes' }}
                </span>
              </div>
              
              <div>
                <h3 :class="['text-sm font-bold leading-tight line-clamp-1', route.params.id == req.id ? 'text-[#4f378a]' : 'text-gray-800']">
                  {{ req.product_name }}
                </h3>
                <p class="text-xs text-gray-500 mt-1 line-clamp-1">{{ req.specifications || 'No detailed specifications.' }}</p>
              </div>

              <div class="flex justify-between items-end mt-1 pt-3 border-t border-gray-100/60">
                <div v-if="req.quoted_price">
                  <span class="block text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Est. Value</span>
                  <span class="font-black text-sm text-[#4f378a]">${{ Number(req.quoted_price).toLocaleString() }}</span>
                </div>
                <div v-else>
                  <span class="block text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Target Qty</span>
                  <span class="font-bold text-xs text-gray-700">{{ req.quantity }} units</span>
                </div>
                
                <span v-if="route.params.id == req.id" class="material-symbols-outlined text-[#4f378a] text-[18px]">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Pane: Details (Router View) -->
      <div 
        :class="[
          'flex-1 overflow-y-auto bg-gray-50/30 relative custom-scrollbar',
          { 'hidden lg:block': !route.params.id }
        ]"
      >
        <router-view :key="route.fullPath" v-if="route.params.id"></router-view>
        <div v-else class="h-full w-full flex flex-col items-center justify-center text-gray-400">
          <span class="material-symbols-outlined text-[80px] mb-6 opacity-20">inventory_2</span>
          <h2 class="text-xl font-bold text-gray-600 mb-2">Pilih Permintaan</h2>
          <p class="text-sm">Silakan pilih salah satu pesanan dari daftar di sebelah kiri untuk melihat detailnya.</p>
        </div>
      </div>

    </div>
  </BuyerLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import { requestService } from '../../api/requestService.js'

const router = useRouter()
const route = useRoute()

// Reactive State
const searchQuery = ref('')
const notificationCount = ref(0)
const requests = ref([])
const loadingRequests = ref(true)

// Filter for only 'pending' and 'quoted' status
const filteredRequests = computed(() => {
  const activeStatuses = ['pending', 'quoted', 'deal_finalized', 'menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final', 'menunggu_pembayaran', 'menunggu_verifikasi_pembayaran', 'sedang_diproses', 'dikirim', 'menunggu_verifikasi_admin', 'dp_verified', 'approved']
  let filtered = requests.value.filter(r => activeStatuses.includes(r.status))
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.product_name.toLowerCase().includes(q) || 
      r.category.toLowerCase().includes(q)
    )
  }
  return filtered
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

// Custom CSS for scrollbar to keep it clean in split-pane
const customStyle = document.createElement('style')
customStyle.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
`
document.head.appendChild(customStyle)

onMounted(() => {
  fetchRequests()
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
    'pending': 'bg-gradient-to-r from-amber-400 to-amber-500',
    'quoted': 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  }
  return classes[status] || 'bg-gray-400'
}

const createNewRequest = () => { router.push('/buyer/rfq/create') }
const viewDetails = (id) => { router.push(`/buyer/rfq/${id}`) }
</script>

<style scoped>
/* Scoped styles kept minimal as we rely heavily on Tailwind utility classes */
</style>