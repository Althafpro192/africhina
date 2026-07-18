<template>
  <BuyerLayout activeRoute="suppliers" v-model:searchQuery="searchQuery" :notificationCount="notificationCount">
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-8">
      
      <!-- Header Section -->
      <div class="flex justify-between items-end mb-6 sm:mb-8">
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{{ $t('nav.suppliers') }}</h1>
          <p class="text-gray-500 mt-2 text-sm sm:text-base">Your network of verified manufacturers and suppliers.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 48px;">progress_activity</span>
        <p class="text-gray-500 font-medium">Loading your suppliers...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSuppliers.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-gray-300" style="font-size: 48px;">business</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">No Connected Suppliers</h3>
        <p class="text-gray-500 mb-8 text-center max-w-md">You haven't partnered with any suppliers yet. Suppliers will appear here once you accept their quotes.</p>
        <button @click="$router.push('/buyer/sourcing')" class="px-6 py-3 bg-[#4f378a] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#4f378a]/20">
          Start Sourcing
        </button>
      </div>

      <!-- Suppliers Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="supplier in filteredSuppliers" 
          :key="supplier.id"
          class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-xl rounded-2xl p-6 transition-all duration-300 group flex flex-col hover:-translate-y-1 relative overflow-hidden cursor-pointer"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-[#4f378a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div class="flex items-start justify-between mb-4 relative z-10">
            <div class="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[#4f378a] text-3xl">factory</span>
            </div>
            <div class="flex flex-col items-end">
              <span class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                <span class="material-symbols-outlined text-[14px]">verified</span>
                {{ supplier.level || 'Verified' }}
              </span>
            </div>
          </div>

          <div class="mb-6 relative z-10">
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-[#4f378a] transition-colors line-clamp-2 leading-tight">{{ supplier.name }}</h3>
            <p class="text-xs text-gray-500 mt-2 flex items-start gap-1">
              <span class="material-symbols-outlined text-[14px] mt-0.5">location_on</span>
              <span class="line-clamp-2">{{ supplier.address || 'Location unavailable' }}</span>
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-auto border-t border-gray-100 pt-4 relative z-10">
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</span>
              <span class="text-lg font-bold text-gray-800">{{ supplier.orderCount }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Volume</span>
              <span class="text-lg font-black text-[#4f378a]">${{ supplier.totalVolume.toLocaleString() }}</span>
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

// Extract unique suppliers from requests
const uniqueSuppliers = computed(() => {
  const map = new Map();
  requests.value.forEach(r => {
    if (r.assigned_supplier_id) {
      if (!map.has(r.assigned_supplier_id)) {
        map.set(r.assigned_supplier_id, {
          id: r.assigned_supplier_id,
          name: r.supplier_name,
          address: r.factory_address,
          level: r.verification_level,
          orderCount: 1,
          totalVolume: Number(r.quoted_price || 0)
        })
      } else {
        const existing = map.get(r.assigned_supplier_id)
        existing.orderCount += 1
        existing.totalVolume += Number(r.quoted_price || 0)
      }
    }
  })
  return Array.from(map.values())
})

// Filter suppliers by search query
const filteredSuppliers = computed(() => {
  let filtered = uniqueSuppliers.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) || 
      (s.address && s.address.toLowerCase().includes(q))
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
    console.error('Failed to fetch suppliers:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
