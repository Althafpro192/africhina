<template>
  <BuyerLayout activeRoute="logistics" v-model:searchQuery="searchQuery" :notificationCount="notificationCount">
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-8">
      
      <!-- Header Section -->
      <div class="flex justify-between items-end mb-6 sm:mb-8">
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{{ $t('nav.logistics') }}</h1>
          <p class="text-gray-500 mt-2 text-sm sm:text-base">Monitor your shipments and delivery status.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#3525cd] mb-4" style="font-size: 48px;">progress_activity</span>
        <p class="text-gray-500 font-medium">Loading logistics data...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLogistics.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-gray-300" style="font-size: 48px;">local_shipping</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">No Active Shipments</h3>
        <p class="text-gray-500 mb-8 text-center max-w-md">You don't have any orders currently in transit. Logistics tracking will appear here once your orders are shipped.</p>
        <button @click="$router.push('/buyer/orders')" class="px-6 py-3 bg-[#3525cd] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#3525cd]/20">
          Check My Orders
        </button>
      </div>

      <!-- Logistics List -->
      <div v-else class="space-y-6">
        <div 
          v-for="item in filteredLogistics" 
          :key="item.id"
          class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-xl rounded-2xl p-5 sm:p-6 transition-all duration-300 group cursor-pointer flex flex-col gap-6 hover:-translate-y-1"
          @click="viewDetails(item.id)"
        >
          <!-- Top Info -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shrink-0 border border-indigo-200">
                <span class="material-symbols-outlined text-[#3525cd]">directions_boat</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 group-hover:text-[#3525cd] transition-colors mb-0.5">{{ item.product_name }}</h3>
                <p class="text-xs text-gray-500 font-medium">Order #{{ item.id.split('-')[0].toUpperCase() }} • {{ item.quantity }} units</p>
              </div>
            </div>
            
            <div class="flex flex-col sm:items-end">
              <span :class="['font-bold text-[10px] sm:text-xs px-3 py-1 rounded-full text-white shadow-sm whitespace-nowrap mb-1', getStatusClass(item.status)]">
                {{ item.status === 'completed' ? 'Delivered' : 'In Transit' }}
              </span>
              <span class="text-xs text-gray-500 font-medium">Updated {{ formatDate(item.updated_at || item.created_at) }}</span>
            </div>
          </div>

          <!-- Progress Bar Area -->
          <div class="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
            <div class="relative max-w-3xl mx-auto">
              <!-- Background Line -->
              <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
              
              <!-- Active Line -->
              <div class="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-400 to-[#3525cd] -translate-y-1/2 rounded-full z-0 transition-all duration-1000" 
                   :style="{ width: item.status === 'completed' ? '100%' : '50%' }"></div>
              
              <!-- Nodes -->
              <div class="relative z-10 flex justify-between">
                <!-- Origin -->
                <div class="flex flex-col items-center">
                  <div class="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex items-center justify-center">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-[10px] font-bold text-gray-700 mt-2">Dispatched</span>
                  <span class="text-[10px] text-gray-400">{{ item.supplier_name || 'Supplier' }}</span>
                </div>
                
                <!-- Transit -->
                <div class="flex flex-col items-center">
                  <div :class="['w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors', item.status === 'completed' ? 'bg-emerald-500' : 'bg-[#3525cd]']">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-[10px] font-bold text-gray-700 mt-2">In Transit</span>
                  <span class="text-[10px] text-[#3525cd] font-semibold" v-if="item.status === 'shipped'">Customs / Sea Freight</span>
                </div>

                <!-- Destination -->
                <div class="flex flex-col items-center">
                  <div :class="['w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors', item.status === 'completed' ? 'bg-[#3525cd]' : 'bg-gray-300']">
                    <div v-if="item.status === 'completed'" class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-[10px] font-bold text-gray-700 mt-2">Delivered</span>
                  <span class="text-[10px] text-gray-400">Destination</span>
                </div>
              </div>
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

const searchQuery = ref('')
const notificationCount = ref(0)
const requests = ref([])
const loading = ref(true)

// Filter for Logistics statuses
const filteredLogistics = computed(() => {
  let filtered = requests.value.filter(r => ['shipped', 'completed'].includes(r.status))
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.product_name.toLowerCase().includes(q) || 
      (r.supplier_name && r.supplier_name.toLowerCase().includes(q))
    )
  }
  return filtered
})

const fetchData = async () => {
  loading.value = true
  try {
    requests.value = await requestService.getRequests()
    notificationCount.value = requests.value.filter(r => r.status === 'quoted').length
  } catch (err) {
    console.error('Failed to fetch logistics:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getStatusClass = (status) => {
  const classes = {
    'shipped': 'bg-gradient-to-r from-purple-500 to-indigo-600',
    'completed': 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  }
  return classes[status] || 'bg-gray-400'
}

const viewDetails = (id) => { router.push(`/buyer/rfq/${id}`) }
</script>
