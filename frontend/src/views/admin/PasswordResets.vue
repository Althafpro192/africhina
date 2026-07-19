<template>
  <AdminLayout activeRoute="security">
    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      <header class="flex justify-between items-end gap-6">
        <div>
          <h2 class="text-[48px] leading-[1.1] tracking-[-0.02em] font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Password Reset Requests</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551]">Manage and generate password reset links for buyers</p>
        </div>
      </header>

      <section class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[#7a7582] uppercase text-[11px] font-bold tracking-widest bg-[#f8f2fa]/50">
                <th class="px-8 py-4">Buyer Info</th>
                <th class="px-6 py-4">Request Date</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Reset Link</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#cbc4d2]/30" v-if="!loading">
              <tr v-for="request in requests" :key="request.id" class="group hover:bg-gray-50 transition-all">
                <td class="px-8 py-5">
                  <p class="font-bold text-[#1d1b20]">{{ request.full_name }}</p>
                  <p class="text-xs text-[#7a7582]">{{ request.email }}</p>
                </td>
                <td class="px-6 py-5 text-sm text-[#494551]">
                  {{ new Date(request.created_at).toLocaleString() }}
                </td>
                <td class="px-6 py-5">
                  <span v-if="request.status === 'pending'" class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                  <span v-else-if="request.status === 'approved'" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Link Generated</span>
                  <span v-else-if="request.status === 'processed'" class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Completed</span>
                </td>
                <td class="px-6 py-5">
                  <div v-if="request.token" class="flex items-center gap-2">
                    <input type="text" readonly :value="getResetUrl(request.token)" class="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1 w-48 text-gray-600 outline-none" />
                    <button @click="copyToClipboard(getResetUrl(request.token))" class="text-[#4f378a] hover:bg-[#4f378a]/10 p-1 rounded transition-colors" title="Copy Link">
                      <span class="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                  <span v-else class="text-xs text-gray-400">No link generated yet</span>
                </td>
                <td class="px-6 py-5 text-right">
                  <button 
                    v-if="request.status === 'pending'" 
                    @click="generateLink(request.id)" 
                    :disabled="generating === request.id"
                    class="bg-[#4f378a] text-white px-4 py-2 rounded-xl text-sm font-bold shadow hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    <span v-if="generating === request.id" class="material-symbols-outlined animate-spin text-[16px] align-middle mr-1">progress_activity</span>
                    Generate Link
                  </button>
                </td>
              </tr>
              <tr v-if="requests.length === 0">
                <td colspan="5" class="px-8 py-10 text-center text-gray-500">
                  No password reset requests found.
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="5" class="px-8 py-10 text-center text-gray-500">
                  <span class="material-symbols-outlined animate-spin text-[#3525cd]" style="font-size: 32px;">progress_activity</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
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

const loadRequests = async () => {
  try {
    requests.value = await authService.getResetRequests()
  } catch (error) {
    showToast('Failed to load password reset requests', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRequests()
})

const getResetUrl = (token) => {
  return `${window.location.origin}/reset-password?token=${token}`
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('Link copied to clipboard!', 'success')
  } catch (err) {
    showToast('Failed to copy link', 'error')
  }
}

const generateLink = async (id) => {
  generating.value = id
  try {
    await authService.generateResetLink(id)
    showToast('Reset link generated successfully', 'success')
    await loadRequests()
  } catch (error) {
    showToast('Failed to generate reset link', 'error')
  } finally {
    generating.value = null
  }
}
</script>
