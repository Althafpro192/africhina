<template>
  <BuyerLayout activeRoute="orders" v-model:searchQuery="searchQuery" :notificationCount="notificationCount">
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-8">
      
      <!-- Header Section -->
      <div class="flex justify-between items-end mb-6 sm:mb-8">
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{{ $t('nav.orders') }}</h1>
          <p class="text-gray-500 mt-2 text-sm sm:text-base">Track your active orders currently in production.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 48px;">progress_activity</span>
        <p class="text-gray-500 font-medium">Loading your orders...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-gray-300" style="font-size: 48px;">shopping_cart</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">No Active Orders</h3>
        <p class="text-gray-500 mb-8 text-center max-w-md">You haven't placed any orders yet. Start by accepting a quote from a supplier in your sourcing requests.</p>
        <button @click="$router.push('/buyer/requests')" class="px-6 py-3 bg-[#4f378a] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#4f378a]/20">
          View My Requests
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-xl rounded-2xl p-5 sm:p-6 transition-all duration-300 group cursor-pointer flex flex-col sm:flex-row justify-between gap-6 hover:-translate-y-1"
          @click="viewDetails(order.id)"
        >
          <div class="flex-1 space-y-4">
            <!-- Header -->
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-bold text-gray-800 group-hover:text-[#4f378a] transition-colors mb-1">{{ order.product_name }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <span class="font-medium text-gray-700">Order #{{ order.id.split('-')[0].toUpperCase() }}</span>
                  <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{{ formatDate(order.created_at) }}</span>
                </div>
              </div>
              <span :class="['font-bold text-[10px] sm:text-xs px-3 py-1.5 rounded-full text-white shadow-sm whitespace-nowrap', getStatusClass(order.status)]">
                {{ $t('status.' + order.status) || order.status }}
              </span>
            </div>

            <!-- Supplier Info -->
            <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-blue-600 text-[20px]">verified</span>
              </div>
              <div>
                <p class="font-bold text-sm text-gray-800">{{ order.supplier_name || 'Assigned Supplier' }}</p>
                <p class="text-xs text-gray-500">{{ order.factory_address || 'Verified Manufacturer' }}</p>
              </div>
            </div>
          </div>

          <!-- Financials & Actions -->
          <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 shrink-0 sm:min-w-[160px]">
            <div class="text-left sm:text-right">
              <span class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Order Value</span>
              <span class="font-black text-xl text-[#4f378a]">${{ Number(order.quoted_price).toLocaleString() }}</span>
            </div>
            <div class="text-left sm:text-right mt-2 sm:mt-4">
              <span class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Quantity</span>
              <span class="font-bold text-sm text-gray-700">{{ order.quantity }} units</span>
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
const loading = ref(true)

// Filter for Order statuses (after it becomes an order)
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
    notificationCount.value = requests.value.filter(r => r.status === 'quoted').length
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
    'approved': 'bg-gradient-to-r from-blue-500 to-blue-600',
    'processing': 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'production': 'bg-gradient-to-r from-indigo-600 to-indigo-700',
  }
  return classes[status] || 'bg-gray-400'
}

const viewDetails = (id) => { router.push(`/buyer/rfq/${id}`) }
</script>
