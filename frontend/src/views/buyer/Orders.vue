<template>
  <BuyerLayout activeRoute="orders" v-model:searchQuery="searchQuery">
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-6">
      
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('nav.orders') }}</h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Track active manufacturing orders and production milestones.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 mb-4 text-4xl">progress_activity</span>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">Loading active orders...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 text-center p-6">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-400">
          <span class="material-symbols-outlined text-4xl">shopping_cart</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Orders</h3>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
          You haven't placed any manufacturing orders yet. Start by accepting a supplier quote from your active sourcing requests.
        </p>
        <button 
          @click="$router.push('/buyer/requests')" 
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
        >
          View My Requests
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 rounded-3xl p-5 sm:p-7 transition-all duration-300 group cursor-pointer flex flex-col sm:flex-row justify-between gap-6 hover:-translate-y-1"
          @click="viewDetails(order.id)"
        >
          <div class="flex-1 space-y-4">
            <!-- Header -->
            <div class="flex justify-between items-start gap-4">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 leading-snug">
                  {{ order.product_name }}
                </h3>
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span class="font-bold text-slate-700 dark:text-slate-300">Order #{{ order.id.split('-')[0].toUpperCase() }}</span>
                  <span class="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                  <span>{{ formatDate(order.created_at) }}</span>
                </div>
              </div>

              <span :class="['font-extrabold text-[10px] sm:text-xs px-3 py-1.5 rounded-full text-white shadow-xs whitespace-nowrap', getStatusClass(order.status)]">
                {{ $t('status.' + order.status) || order.status }}
              </span>
            </div>

            <!-- Supplier Info -->
            <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-xl">verified</span>
              </div>
              <div class="overflow-hidden">
                <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{{ order.supplier_name || 'Assigned Supplier' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ order.factory_address || 'Verified Manufacturer' }}</p>
              </div>
            </div>
          </div>

          <!-- Financials & Actions -->
          <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200/80 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 shrink-0 sm:min-w-[160px]">
            <div class="text-left sm:text-right">
              <span class="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Order Value</span>
              <span class="font-black text-lg sm:text-xl text-indigo-600 dark:text-indigo-400">${{ Number(order.quoted_price).toLocaleString() }}</span>
            </div>
            <div class="text-left sm:text-right mt-1">
              <span class="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Quantity</span>
              <span class="font-bold text-xs text-slate-700 dark:text-slate-300">{{ order.quantity }} units</span>
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

const filteredOrders = computed(() => {
  const orderStatuses = ['processing', 'production', 'shipped', 'completed']
  let filtered = requests.value.filter(r => orderStatuses.includes(r.status))
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
    console.error('Failed to fetch orders:', err)
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
    'processing': 'bg-blue-600',
    'production': 'bg-indigo-600',
    'shipped': 'bg-purple-600',
    'completed': 'bg-emerald-600',
  }
  return classes[status] || 'bg-slate-500'
}

const viewDetails = (id) => { router.push(`/buyer/rfq/${id}`) }
</script>
