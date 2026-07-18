<template>
  <BuyerLayout activeRoute="requests" v-model:searchQuery="searchQuery" :notificationCount="notificationCount">
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-8">
      
      <!-- Header Section -->
      <div class="flex justify-between items-end mb-6 sm:mb-8">
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{{ $t('nav.requests') }}</h1>
          <p class="text-gray-500 mt-2 text-sm sm:text-base">Manage your active sourcing requests and review quotes.</p>
        </div>
        <button @click="createNewRequest" class="hidden sm:flex px-5 py-2.5 bg-[#4f378a] text-white font-bold rounded-xl hover:opacity-90 transition-all items-center gap-2 shadow-lg shadow-[#4f378a]/20">
          <span class="material-symbols-outlined text-[20px]">add</span> New Request
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingRequests" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 48px;">progress_activity</span>
        <p class="text-gray-500 font-medium">Loading your requests...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRequests.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-gray-300" style="font-size: 48px;">inbox</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">No Active Requests</h3>
        <p class="text-gray-500 mb-8 text-center max-w-md">You don't have any pending requests. Start by creating a new sourcing request.</p>
        <button @click="createNewRequest" class="px-8 py-3 bg-[#4f378a] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#4f378a]/20">
          Create Sourcing Request
        </button>
      </div>

      <!-- Request List -->
      <div v-else class="space-y-4">
        <div 
          v-for="req in filteredRequests" 
          :key="req.id"
          class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-xl rounded-2xl p-5 sm:p-6 transition-all duration-300 group cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-1"
          @click="viewDetails(req.id)"
        >
          <div class="flex items-start gap-4 flex-1">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 border border-[#4f378a]/10 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[#4f378a]">{{ getCategoryIcon(req.category) }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{{ req.category }}</span>
                <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span class="text-xs text-gray-400 font-medium">{{ formatDate(req.created_at) }}</span>
              </div>
              <h3 class="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-[#4f378a] transition-colors leading-tight">{{ req.product_name }}</h3>
              <p class="text-sm text-gray-500 mt-1.5 line-clamp-1 max-w-2xl">{{ req.specifications || 'No detailed specifications provided.' }}</p>
            </div>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 shrink-0 sm:min-w-[160px]">
            <span :class="['font-bold text-[10px] sm:text-xs px-3 py-1.5 rounded-full text-white shadow-sm whitespace-nowrap', getStatusClass(req.status)]">
              {{ req.status === 'quoted' ? 'Quote Received' : 'Awaiting Quotes' }}
            </span>
            <div v-if="req.quoted_price" class="text-right">
              <span class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Est. Value</span>
              <span class="font-black text-lg sm:text-xl text-[#4f378a]">${{ Number(req.quoted_price).toLocaleString() }}</span>
            </div>
            <div v-else class="text-right">
              <span class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Target Qty</span>
              <span class="font-bold text-sm sm:text-base text-gray-700">{{ req.quantity }} units</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </BuyerLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import { requestService } from '../../api/requestService.js'

const router = useRouter()

// Reactive State
const searchQuery = ref('')
const notificationCount = ref(0)
const requests = ref([])
const loadingRequests = ref(true)

// Filter for only 'pending' and 'quoted' status
const filteredRequests = computed(() => {
  const activeStatuses = ['pending', 'quoted', 'deal_finalized', 'menunggu_verifikasi_admin', 'dp_verified', 'approved']
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