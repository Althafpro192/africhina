<template>
  <BuyerLayout activeRoute="dashboard">
    <div class="w-full max-w-5xl mx-auto py-8">
      
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {{ userName }}!</h1>
          <p class="text-gray-500 mt-1">Here's an overview of your sourcing activity.</p>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div @click="$router.push('/buyer/rfq/create')" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group">
          <div class="w-12 h-12 bg-gradient-to-br from-[#3525cd]/10 to-[#3525cd]/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-[#3525cd]">add_circle</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">New Request</h3>
            <p class="text-xs text-gray-500">Post a sourcing requirement</p>
          </div>
        </div>
        <div @click="$router.push('/buyer/requests')" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group">
          <div class="w-12 h-12 bg-gradient-to-br from-[#3525cd]/10 to-[#3525cd]/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-[#3525cd]">request_quote</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">My Requests</h3>
            <p class="text-xs text-gray-500">View quotes and statuses</p>
          </div>
        </div>
        <div @click="$router.push('/buyer/suppliers')" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group">
          <div class="w-12 h-12 bg-gradient-to-br from-[#3525cd]/10 to-[#3525cd]/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-[#3525cd]">business</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">Find Suppliers</h3>
            <p class="text-xs text-gray-500">Browse verified factories</p>
          </div>
        </div>
      </div>

      <!-- Main Overview Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Activity Chart -->
        <div class="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
            <div class="w-8 h-8 bg-[#3525cd]/10 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[#3525cd] text-[18px]">insights</span>
            </div>
            Activity Overview
          </h2>
          
          <div v-if="loading" class="h-64 flex items-center justify-center">
             <span class="material-symbols-outlined animate-spin text-gray-300 text-3xl">progress_activity</span>
          </div>
          <div v-else class="h-64 flex items-end justify-between px-2 gap-2 relative">
            
            <div v-for="(day, index) in activityData" :key="index" class="w-full flex flex-col justify-end group h-full relative cursor-pointer">
              <!-- Bar -->
              <div 
                :class="['w-full rounded-t-lg transition-all duration-500', index === activityData.length - 1 ? 'bg-[#3525cd] shadow-[0_0_15px_rgba(53,37,205,0.3)] hover:opacity-90' : 'bg-[#3525cd]/20 hover:bg-[#3525cd]/40']"
                :style="{ height: Math.max((day.count / maxActivity) * 100, 5) + '%' }"
              ></div>
              <!-- Tooltip -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {{ day.count }} updates
              </div>
            </div>
            
          </div>
          <!-- X-Axis Labels -->
          <div class="flex justify-between text-xs text-gray-400 mt-4 px-2 font-medium" v-if="!loading">
            <span v-for="day in activityData" :key="day.label" class="text-center w-full">{{ day.label }}</span>
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col">
          <h2 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-orange-500 text-[18px]">notifications_active</span>
            </div>
            Recent Updates
          </h2>
          
          <div v-if="loading" class="flex-1 flex items-center justify-center">
             <span class="material-symbols-outlined animate-spin text-gray-300 text-3xl">progress_activity</span>
          </div>
          <div v-else-if="recentUpdates.length === 0" class="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <span class="material-symbols-outlined text-gray-200 text-5xl mb-3">history</span>
            <p class="text-sm text-gray-500 font-bold">No recent activity</p>
            <p class="text-xs text-gray-400 mt-1">Updates on your requests and orders will appear here.</p>
          </div>
          <div v-else class="space-y-6 flex-1 overflow-y-auto pr-2">
            
            <div v-for="update in recentUpdates" :key="update.id" class="flex items-start gap-4">
              <div class="w-2 h-2 mt-1.5 rounded-full bg-[#3525cd] shrink-0 shadow-[0_0_5px_rgba(53,37,205,0.5)]"></div>
              <div>
                <p class="text-sm font-bold text-gray-800 leading-snug line-clamp-2 cursor-pointer hover:text-[#3525cd] transition-colors" @click="$router.push(`/buyer/rfq/${update.id}`)">
                  {{ update.product_name }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-md text-white', getStatusClass(update.status)]">
                    {{ $t('status.' + update.status) || update.status }}
                  </span>
                  <span class="text-xs text-gray-400 font-medium">{{ timeAgo(update.updated_at || update.created_at) }}</span>
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
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import { requestService } from '../../api/requestService.js'

const userName = ref('')
const loading = ref(true)
const requests = ref([])

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  userName.value = user.name ? user.name.split(' ')[0] : 'Guest'

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
    
    // Count requests created or updated on this day
    const count = requests.value.filter(r => {
      const targetDate = new Date(r.updated_at || r.created_at)
      return targetDate >= d && targetDate < nextD
    }).length
    
    const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })
    
    data.push({
      label,
      count
    })
  }
  return data
})

const maxActivity = computed(() => {
  const max = Math.max(...activityData.value.map(d => d.count))
  return max > 0 ? max : 1 // prevent divide by zero
})

// Calculate Recent Updates Feed (Top 5)
const recentUpdates = computed(() => {
  return [...requests.value]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 5)
})

// Helper methods
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
    'quoted': 'bg-emerald-500',
    'approved': 'bg-blue-500',
    'processing': 'bg-indigo-500',
    'production': 'bg-indigo-600',
    'shipped': 'bg-purple-500',
    'completed': 'bg-emerald-600',
  }
  return classes[status] || 'bg-gray-400'
}
</script>