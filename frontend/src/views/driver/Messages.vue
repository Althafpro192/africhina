<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased font-['Inter',_sans-serif] flex flex-col">
    <!-- Header -->
    <header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">local_shipping</span>
          </div>
          <div>
            <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ $t('driver_messages.title') }}</h1>
            <p class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">{{ $t('driver_messages.driver_terminal') }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            @click="logout"
            class="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-base">logout</span>
            <span class="hidden sm:inline">{{ $t('nav.logout') }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col">
      <div class="mb-6">
        <h2 class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
          {{ $t('driver_messages.heading') }}
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('driver_messages.subheading') }}
        </p>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 mb-4" style="font-size: 48px;">progress_activity</span>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="errorMessage" class="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 text-center">
        <span class="material-symbols-outlined text-rose-600 dark:text-rose-400 text-4xl mb-2">error</span>
        <h3 class="font-bold text-rose-800 dark:text-rose-300 mb-1">{{ $t('driver_messages.error_title') }}</h3>
        <p class="text-sm text-rose-700 dark:text-rose-400">{{ errorMessage }}</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Left Column: Assignments List -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-lg text-indigo-600 dark:text-indigo-400">inventory_2</span>
                {{ $t('driver_messages.my_assignments') }}
              </h3>
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ assignedRequests.length }}</span>
            </div>

            <div v-if="assignedRequests.length === 0" class="p-8 text-center text-slate-400 dark:text-slate-500">
              <span class="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
              <p class="text-xs">{{ $t('driver_messages.no_assignments') }}</p>
            </div>

            <div v-else class="divide-y divide-slate-200/60 dark:divide-slate-800">
              <button
                v-for="req in assignedRequests"
                :key="req.id"
                @click="selectRequest(req)"
                :class="['w-full text-left p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer', selectedRequest?.id === req.id ? 'bg-indigo-50 dark:bg-indigo-950/40' : '']"
              >
                <div class="flex items-start gap-3">
                  <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', req.delivery_method === 'sea' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : req.delivery_method === 'air' ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800']">
                    <span class="material-symbols-outlined text-xl">{{ req.delivery_method === 'sea' ? 'directions_boat' : req.delivery_method === 'air' ? 'flight' : 'verified_user' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{{ req.product_name }}</p>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{{ req.buyer_name }}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase"
                      :class="getStatusColor(req.status)">
                      {{ $t(`status.${req.status.toLowerCase()}`) }}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Chat -->
        <div class="lg:col-span-2">
          <div v-if="!selectedRequest" class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-indigo-500 dark:text-indigo-400 mb-4">forum</span>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ $t('driver_messages.select_conversation') }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('driver_messages.select_hint') }}</p>
          </div>

          <div v-else class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden flex flex-col" style="min-height: 600px;">
            <!-- Chat Header -->
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {{ selectedRequest.buyer_name ? selectedRequest.buyer_name.charAt(0).toUpperCase() : 'B' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ selectedRequest.buyer_name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ selectedRequest.product_name }}</p>
                </div>
                <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
                  :class="getStatusColor(selectedRequest.status)">
                  {{ $t(`status.${selectedRequest.status.toLowerCase()}`) }}
                </span>
              </div>
            </div>

            <!-- Chat Component (using existing ChatComponent) -->
            <div class="flex-1 flex flex-col">
              <ChatComponent :requestId="selectedRequest.id" :isAdmin="false" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from '../../composables/useToast.js'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import api from '../../api/axios.js'
import { authService } from '../../api/authService.js'

const router = useRouter()
const { showToast } = useToast()
const { t: _t } = useI18n()

const loading = ref(true)
const errorMessage = ref('')
const assignedRequests = ref([])
const selectedRequest = ref(null)

const loadAssignedRequests = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    // Get all requests, then filter on frontend (or use a dedicated endpoint in future)
    const { data } = await api.get('/requests')
    const allRequests = Array.isArray(data) ? data : (data?.data || [])
    // Show only requests where this driver is the assigned driver
    const me = JSON.parse(localStorage.getItem('user') || '{}')
    const myId = me?.id
    assignedRequests.value = allRequests.filter(r => r.assigned_driver_id === myId)
  } catch (e) {
    console.error('Failed to load assignments:', e)
    errorMessage.value = e.response?.data?.message || e.message || 'Failed to load assignments'
    showToast(errorMessage.value)
  } finally {
    loading.value = false
  }
}

const selectRequest = (req) => {
  selectedRequest.value = req
}

const getStatusColor = (status) => {
  const colors = {
    'menunggu_pembayaran': 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    'sedang_diproses': 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'dikirim': 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    'menunggu_verifikasi_admin': 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
    'selesai': 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
  }
  return colors[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
}

const logout = async () => {
  try {
    await authService.logout()
  } catch (e) {
    console.error('Logout error:', e)
  } finally {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }
}

onMounted(() => {
  // Verify role
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role !== 'driver') {
    showToast('Access denied: This page is for drivers only.')
    router.push('/login')
    return
  }
  loadAssignedRequests()
})
</script>
