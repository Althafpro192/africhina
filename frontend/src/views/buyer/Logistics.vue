<template>
  <BuyerLayout activeRoute="logistics" v-model:searchQuery="searchQuery">
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-6">
      
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('nav.logistics') }}</h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor shipments, vessel tracking, and port delivery status.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 mb-4 text-4xl">progress_activity</span>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">Loading logistics data...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLogistics.length === 0" class="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 text-center p-6">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-400">
          <span class="material-symbols-outlined text-4xl">local_shipping</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Shipments</h3>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
          You don't have any orders currently in transit. Logistics tracking timeline will appear automatically once your orders are dispatched.
        </p>
        <button 
          @click="$router.push('/buyer/orders')" 
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
        >
          Check My Orders
        </button>
      </div>

      <!-- Logistics List -->
      <div v-else class="space-y-6">
        <div 
          v-for="item in filteredLogistics" 
          :key="item.id"
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 rounded-3xl p-5 sm:p-7 transition-all duration-300 group cursor-pointer flex flex-col gap-6 hover:-translate-y-1"
          @click="viewDetails(item.id)"
        >
          <!-- Top Info -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                <span class="material-symbols-outlined text-2xl">directions_boat</span>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-0.5 leading-snug">
                  {{ item.product_name }}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Order #{{ item.id.split('-')[0].toUpperCase() }} • {{ item.quantity }} units</p>
              </div>
            </div>
            
            <div class="flex flex-col sm:items-end">
              <span :class="['font-extrabold text-[10px] sm:text-xs px-3 py-1 rounded-full text-white shadow-xs whitespace-nowrap mb-1', getStatusClass(item.status)]">
                {{ item.status === 'completed' ? 'Delivered' : 'In Transit' }}
              </span>
              <span class="text-[11px] text-slate-400 font-medium">Updated {{ formatDate(item.updated_at || item.created_at) }}</span>
            </div>
          </div>

          <!-- Progress Bar Area -->
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60">
            <div class="relative max-w-3xl mx-auto">
              <!-- Background Line -->
              <div class="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full z-0"></div>
              
              <!-- Active Line -->
              <div 
                class="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-1000" 
                :style="{ width: item.status === 'completed' ? '100%' : '50%' }"
              ></div>
              
              <!-- Nodes -->
              <div class="relative z-10 flex justify-between">
                <!-- Origin -->
                <div class="flex flex-col items-center">
                  <div class="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-900 dark:text-white mt-2">Dispatched</span>
                  <span class="text-[10px] text-slate-400">{{ item.supplier_name || 'China Factory' }}</span>
                </div>
                
                <!-- Transit -->
                <div class="flex flex-col items-center">
                  <div :class="['w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center transition-colors', item.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600']">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-900 dark:text-white mt-2">In Transit</span>
                  <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold" v-if="item.status === 'shipped'">Customs / Freight</span>
                </div>

                <!-- Destination -->
                <div class="flex flex-col items-center">
                  <div :class="['w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center transition-colors', item.status === 'completed' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700']">
                    <div v-if="item.status === 'completed'" class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-900 dark:text-white mt-2">Delivered</span>
                  <span class="text-[10px] text-slate-400">Buyer Warehouse</span>
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
const requests = ref([])
const loading = ref(true)

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
    'shipped': 'bg-indigo-600',
    'completed': 'bg-emerald-600',
  }
  return classes[status] || 'bg-slate-500'
}

const viewDetails = (id) => { router.push(`/buyer/rfq/${id}`) }
</script>
