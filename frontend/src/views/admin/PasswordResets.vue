<template>
  <AdminLayout activeRoute="security">
    <main class="w-full max-w-[1600px] mx-auto space-y-8">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            {{ $t('resets.title') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('resets.sub') }}
          </p>
        </div>
      </header>

      <!-- Request Table Card -->
      <section class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden transition-colors duration-300">
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 class="text-base font-extrabold text-slate-900 dark:text-white">{{ $t('resets.active_requests') }}</h3>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ requests.length }} requests total</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-widest bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                <th class="px-6 py-4">{{ $t('resets.buyer_info') }}</th>
                <th class="px-6 py-4">{{ $t('resets.request_date') }}</th>
                <th class="px-6 py-4">{{ $t('resets.status') }}</th>
                <th class="px-6 py-4">{{ $t('resets.temp_credential') }}</th>
                <th class="px-6 py-4 text-right">{{ $t('resets.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800" v-if="!loading">
              <tr 
                v-for="request in requests" 
                :key="request.id" 
                class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      {{ request.full_name?.charAt(0) || '?' }}
                    </div>
                    <div>
                      <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{{ request.full_name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ request.email }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {{ new Date(request.created_at).toLocaleString() }}
                </td>

                <td class="px-6 py-4">
                  <span v-if="request.status === 'pending'" class="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {{ $t('resets.pending') }}
                  </span>
                  <span v-else class="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                    <span class="material-symbols-outlined text-xs">check_circle</span>
                    {{ $t('resets.processed') }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <div v-if="request.temp_password" class="flex items-center gap-2">
                    <code class="text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                      {{ request.temp_password }}
                    </code>
                    <button 
                      @click="copyToClipboard(request.temp_password)" 
                      class="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" 
                      title="Copy Temporary Password"
                    >
                      <span class="material-symbols-outlined text-base">content_copy</span>
                    </button>
                  </div>
                  <span v-else class="text-xs text-slate-400 italic">{{ $t('resets.no_temp') }}</span>
                </td>

                <td class="px-6 py-4 text-right">
                  <button 
                    @click="createTempPassword(request)" 
                    :disabled="generating === request.id"
                    class="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span v-if="generating === request.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span v-else class="material-symbols-outlined text-sm">key</span>
                    <span>{{ $t('resets.create_temp_pass') }}</span>
                  </button>
                </td>
              </tr>

              <tr v-if="requests.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                  {{ $t('resets.no_requests') }}
                </td>
              </tr>
            </tbody>
            
            <tbody v-else>
              <tr>
                <td colspan="5" class="px-6 py-16 text-center">
                  <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 text-3xl">progress_activity</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- TEMPORARY PASSWORD ISSUED MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isTempModalOpen ? 'visible' : 'invisible']">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="isTempModalOpen = false"></div>
      
      <div :class="['bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isTempModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">key</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('resets.modal_title') }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('resets.modal_sub') }}</p>
            </div>
          </div>
          <button @click="isTempModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Password sementara: <strong class="text-indigo-600 dark:text-indigo-400">{{ activeBuyer?.email }}</strong>:
          </p>

          <!-- Password Display Card -->
          <div class="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3">
            <code class="text-base sm:text-lg font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
              {{ generatedTempPassword }}
            </code>
            <button 
              @click="copyToClipboard(generatedTempPassword)" 
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">content_copy</span>
              <span>{{ $t('resets.copy') }}</span>
            </button>
          </div>

          <!-- Expiry Info -->
          <div v-if="generatedExpiry" class="text-xs text-slate-500 dark:text-slate-400 text-center">
            {{ $t('resets.expires_in') }} <strong class="text-indigo-600 dark:text-indigo-400">{{ generatedExpiry }}</strong>
          </div>

          <!-- Important Note -->
          <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <span class="material-symbols-outlined text-amber-500 text-lg shrink-0 mt-0.5">info</span>
            <p class="leading-relaxed">
              {{ $t('resets.instruction') }}
            </p>
          </div>

          <div class="pt-2">
            <button 
              @click="isTempModalOpen = false" 
              class="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {{ $t('resets.finish_close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { authService } from '../../api/authService'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()
const requests = ref([])
const loading = ref(true)
const generating = ref(null)

const isTempModalOpen = ref(false)
const activeBuyer = ref(null)
const generatedTempPassword = ref('')
const generatedExpiry = ref('')

const loadRequests = async () => {
  try {
    const data = await authService.getResetRequests()
    requests.value = data || []
  } catch (error) {
    showToast('Failed to load password reset requests', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRequests()
})

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('Temporary password copied to clipboard!', 'success')
  } catch (err) {
    showToast('Failed to copy password', 'error')
  }
}

// [FIX Issue 1] Use the real admin processResetRequest endpoint
// which generates a cryptographically secure temp password on the server
const createTempPassword = async (request) => {
  generating.value = request.id
  try {
    const result = await authService.processResetRequest(request.id)
    
    // Use the REAL server-generated temp password
    request.temp_password = result.tempPassword
    request.status = 'processed'
    activeBuyer.value = { ...request, email: result.userEmail || request.email }
    generatedTempPassword.value = result.tempPassword
    generatedExpiry.value = result.expiresIn || ''
    isTempModalOpen.value = true
    
    showToast('Temporary password created successfully!', 'success')
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to create temporary password', 'error')
  } finally {
    generating.value = null
  }
}
</script>
