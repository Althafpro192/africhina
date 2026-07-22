<template>
  <BuyerLayout activeRoute="requests" v-model:searchQuery="searchQuery" :notificationCount="notificationCount">
    <div class="flex h-[calc(100vh-100px)] w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 backdrop-blur-xl">
      
      <!-- Left Pane: Request List -->
      <div 
        :class="[
          'w-full lg:w-[400px] xl:w-[450px] shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-y-auto custom-scrollbar transition-colors duration-300',
          { 'hidden lg:block': route.params.id }
        ]"
      >
        <div class="p-4 sm:p-6">
          <!-- Header Section -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('nav.requests') }}</h1>
              <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage active sourcing requirements</p>
            </div>
            <button 
              @click="createNewRequest" 
              class="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/25 cursor-pointer" 
              title="New Request"
            >
              <span class="material-symbols-outlined text-lg">add</span>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingRequests" class="flex flex-col items-center justify-center py-20">
            <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 mb-4 text-3xl">progress_activity</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredRequests.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <span class="material-symbols-outlined text-3xl">inbox</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">No Active Requests</h3>
            <p class="text-slate-500 dark:text-slate-400 mb-6 text-xs max-w-[200px]">You don't have any pending sourcing requests.</p>
            <button 
              @click="createNewRequest" 
              class="px-5 py-2.5 text-xs bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
            >
              Create Request
            </button>
          </div>

          <!-- Request List Cards -->
          <div v-else class="space-y-3">
            <div
              v-for="req in filteredRequests"
              :key="req.id"
              :class="[
                'border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col gap-3 relative overflow-hidden',
                route.params.id == req.id 
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50' 
                  : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500/40 hover:shadow-md hover:-translate-y-0.5'
              ]"
              @click="viewDetails(req.id)"
            >
              <!-- Indicator line for active item -->
              <div v-if="route.params.id == req.id" class="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 dark:bg-indigo-400"></div>
              
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[9px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/80 px-2 py-0.5 rounded-md">{{ req.category }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(req.created_at) }}</span>
                </div>
                <span :class="['font-bold text-[10px] px-2.5 py-0.5 rounded-full text-white whitespace-nowrap shadow-xs', getStatusClass(req.status)]">
                  {{ req.status === 'quoted' ? 'Quote Received' : 'Awaiting Quotes' }}
                </span>
              </div>
              
              <div>
                <h3 :class="['text-xs sm:text-sm font-bold leading-tight line-clamp-1', route.params.id == req.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white']">
                  {{ req.product_name }}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{{ req.specifications || 'No detailed specifications.' }}</p>
              </div>

              <div class="flex justify-between items-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <div v-if="req.quoted_price">
                  <span class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Est. Value</span>
                  <span class="font-black text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">${{ Number(req.quoted_price).toLocaleString() }}</span>
                </div>
                <div v-else>
                  <span class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Target Qty</span>
                  <span class="font-bold text-xs text-slate-700 dark:text-slate-300">{{ req.quantity }} units</span>
                </div>
                
                <span v-if="route.params.id == req.id" class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-lg">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Pane: Details (Router View) -->
      <div 
        :class="[
          'flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30 relative custom-scrollbar',
          { 'hidden lg:block': !route.params.id }
        ]"
      >
        <router-view :key="route.fullPath" v-if="route.params.id"></router-view>
        <div v-else class="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
          <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">inventory_2</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Select a Sourcing Request</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">Please choose a request from the list on the left to view detailed quotes, timelines, and communications.</p>
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

// Filter for active statuses
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

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-amber-500',
    'quoted': 'bg-indigo-600',
  }
  return classes[status] || 'bg-slate-500'
}

const createNewRequest = () => { router.push('/buyer/rfq/create') }
const viewDetails = (id) => { router.push(`/buyer/rfq/${id}`) }
</script>