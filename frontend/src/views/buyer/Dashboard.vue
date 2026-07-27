<template>
  <BuyerLayout activeRoute="dashboard">
    <div class="w-full max-w-6xl mx-auto py-4 sm:py-6">
      
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {{ userName }}! 👋
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's an overview of your B2B sourcing activity and updates.
          </p>
        </div>

        <button 
          @click="$router.push('/buyer/rfq/create')" 
          class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          <span>New RFQ Request</span>
        </button>
      </div>

      <!-- Quick Actions Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div 
          @click="$router.push('/buyer/rfq/create')" 
          class="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-2xl">add_circle</span>
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">New Request</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Post a sourcing requirement</p>
          </div>
        </div>

        <div 
          @click="$router.push('/buyer/requests')" 
          class="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-2xl">request_quote</span>
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">My Requests</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View quotes and status updates</p>
          </div>
        </div>

        <div 
          @click="$router.push('/buyer/suppliers')" 
          class="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-2xl">factory</span>
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Find Suppliers</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Browse verified manufacturers</p>
          </div>
        </div>
      </div>

      <!-- Main Overview Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Activity Chart Card -->
        <div class="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 p-6 sm:p-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div class="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <span class="material-symbols-outlined text-xl">insights</span>
              </div>
              <span>Activity Overview</span>
            </h2>
            <span class="text-xs font-semibold text-slate-400">Last 5 Days</span>
          </div>
          
          <div v-if="loading" class="h-64 flex items-center justify-center">
             <span class="material-symbols-outlined animate-spin text-slate-300 dark:text-slate-600 text-3xl">progress_activity</span>
          </div>

          <div v-else class="h-64 flex items-end justify-between px-2 gap-3 relative">
            <div 
              v-for="(day, index) in activityData" 
              :key="index" 
              class="w-full flex flex-col justify-end group h-full relative cursor-pointer"
            >
              <!-- Bar -->
              <div 
                :class="['w-full rounded-2xl transition-all duration-500', index === activityData.length - 1 ? 'bg-gradient-to-t from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30' : 'bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/80']"
                :style="{ height: Math.max((day.count / maxActivity) * 100, 8) + '%' }"
              ></div>
              <!-- Tooltip -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {{ day.count }} requests
              </div>
            </div>
          </div>

          <!-- X-Axis Labels -->
          <div class="flex justify-between text-xs text-slate-400 font-semibold mt-4 px-2" v-if="!loading">
            <span v-for="day in activityData" :key="day.label" class="text-center w-full">{{ day.label }}</span>
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 p-6 sm:p-8 flex flex-col">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div class="w-9 h-9 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <span class="material-symbols-outlined text-xl">notifications_active</span>
            </div>
            <span>Recent Updates</span>
          </h2>
          
          <div v-if="loading" class="flex-1 flex items-center justify-center">
             <span class="material-symbols-outlined animate-spin text-slate-300 dark:text-slate-600 text-3xl">progress_activity</span>
          </div>

          <div v-else-if="recentUpdates.length === 0" class="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <span class="material-symbols-outlined text-slate-300 dark:text-slate-700 text-5xl mb-3">history</span>
            <p class="text-sm font-bold text-slate-700 dark:text-slate-300">No recent activity</p>
            <p class="text-xs text-slate-400 mt-1">Updates on your RFQ requests will appear here.</p>
          </div>

          <div v-else class="space-y-4 flex-1 overflow-y-auto pr-1">
            <div 
              v-for="update in recentUpdates" 
              :key="update.id" 
              class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/40 transition-colors"
            >
              <p 
                class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" 
                @click="$router.push(`/buyer/rfq/${update.id}`)"
              >
                {{ update.product_name }}
              </p>
              <div class="flex items-center justify-between gap-2 mt-2">
                <span :class="['text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white shadow-xs', getStatusClass(update.status)]">
                  {{ $t('status.' + update.status) || update.status }}
                </span>
                <span class="text-[11px] text-slate-400 font-medium">{{ timeAgo(update.updated_at || update.created_at) }}</span>
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
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import { requestService } from '../../api/requestService.js'

const userName = ref('')
const loading = ref(true)
const requests = ref([])

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  userName.value = user.full_name ? user.full_name.split(' ')[0] : 'Buyer'

  loading.value = true
  try {
    requests.value = await requestService.getRequests()
  } catch(e) {
    console.error("Failed to fetch requests for dashboard", e)
  } finally {
    loading.value = false
  }
})

// Calculate Activity Chart Data (last 5 days)
const activityData = computed(() => {
  const data = []
  const today = new Date()
  
  for(let i = 4; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    d.setHours(0,0,0,0)
    const nextD = new Date(d)
    nextD.setDate(nextD.getDate() + 1)
    
    const count = requests.value.filter(r => {
      const targetDate = new Date(r.updated_at || r.created_at)
      return targetDate >= d && targetDate < nextD
    }).length
    
    const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })
    
    data.push({ label, count })
  }
  return data
})

const maxActivity = computed(() => {
  const max = Math.max(...activityData.value.map(d => d.count))
  return max > 0 ? max : 1
})

const recentUpdates = computed(() => {
  return [...requests.value]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 5)
})

const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' yrs ago'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' mos ago'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hrs ago'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' mins ago'
  return Math.floor(seconds) + ' secs ago'
}

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-amber-500',
    'quoted': 'bg-indigo-600',
    'approved': 'bg-blue-600',
    'processing': 'bg-indigo-500',
    'production': 'bg-purple-600',
    'shipped': 'bg-purple-500',
    'completed': 'bg-emerald-600',
  }
  return classes[status] || 'bg-slate-500'
}
</script>