<template>
  <BuyerLayout activeRoute="suppliers" v-model:searchQuery="searchQuery">
    <div class="w-full max-w-6xl mx-auto py-4 sm:py-6">
      
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('nav.suppliers') }}</h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Your network of verified Chinese manufacturers and suppliers.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 mb-4 text-4xl">progress_activity</span>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">Loading your supplier network...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSuppliers.length === 0" class="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 text-center p-6">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-400">
          <span class="material-symbols-outlined text-4xl">business</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">No Connected Suppliers</h3>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
          You haven't partnered with any suppliers yet. Verified factory profiles will automatically appear here when you accept quotes.
        </p>
        <button 
          @click="$router.push('/buyer/sourcing')" 
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
        >
          Start Sourcing
        </button>
      </div>

      <!-- Suppliers Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="supplier in filteredSuppliers" 
          :key="supplier.id"
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 rounded-3xl p-6 transition-all duration-300 group flex flex-col hover:-translate-y-1 relative overflow-hidden cursor-pointer"
        >
          <div class="flex items-start justify-between mb-4 relative z-10">
            <div class="w-13 h-13 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-2xl">factory</span>
            </div>
            
            <span class="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span class="material-symbols-outlined text-xs">verified</span>
              {{ supplier.level || 'Verified' }}
            </span>
          </div>

          <div class="mb-6 relative z-10">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
              {{ supplier.name }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-start gap-1.5 leading-relaxed">
              <span class="material-symbols-outlined text-sm mt-0.5 shrink-0 text-slate-400">location_on</span>
              <span class="line-clamp-2">{{ supplier.address || 'Guangdong, China' }}</span>
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 relative z-10">
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Orders</span>
              <span class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{{ supplier.orderCount }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Volume</span>
              <span class="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">${{ supplier.totalVolume.toLocaleString() }}</span>
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
