<template>
  <BuyerLayout activeRoute="messages">
    <div class="w-full max-w-6xl mx-auto py-4 sm:py-6">
      
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
            <span class="material-symbols-outlined text-xl">forum</span>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Chat Admin Support</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Komunikasi langsung dengan Admin AfriChina Bridge</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        <!-- Left: Requests selector -->
        <div class="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col h-[650px]">
          <h2 class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3 px-2">Threading / Topik Chat</h2>
          
          <div class="space-y-2 overflow-y-auto flex-1 pr-1">
            <!-- General Support Thread -->
            <button 
              @click="selectedRequestId = null"
              :class="['w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3', selectedRequestId === null ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25' : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800']"
            >
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center shrink-0', selectedRequestId === null ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400']">
                <span class="material-symbols-outlined text-lg">headset_mic</span>
              </div>
              <div class="flex-1 overflow-hidden">
                <h4 class="text-xs font-bold truncate">General Customer Support</h4>
                <p :class="['text-[11px] truncate mt-0.5', selectedRequestId === null ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400']">Bantuan umum & konsultasi</p>
              </div>
            </button>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-2 block">Request Sourcing Saya</span>
              
              <div v-if="loadingRequests" class="text-center py-6">
                <span class="material-symbols-outlined animate-spin text-indigo-500">progress_activity</span>
              </div>

              <div v-else-if="requests.length === 0" class="text-center py-6 text-xs text-slate-400 italic">
                Belum ada request sourcing.
              </div>

              <div v-else class="space-y-1.5">
                <button
                  v-for="req in requests"
                  :key="req.id"
                  @click="selectedRequestId = req.id"
                  :class="['w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5', selectedRequestId === req.id ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200' : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200']"
                >
                  <div class="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-base">inventory_2</span>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-xs font-bold truncate">{{ req.product_name }}</p>
                    <span class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block mt-0.5">#{{ req.id.split('-')[0].toUpperCase() }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Chat Box -->
        <div class="lg:col-span-3 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[650px]">
          <ChatComponent 
            :key="selectedRequestId || 'general'"
            :requestId="selectedRequestId || 'general-support'" 
            :isAdmin="false" 
          />
        </div>
      </div>
    </div>
  </BuyerLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import { requestService } from '../../api/requestService.js'

const requests = ref([])
const loadingRequests = ref(true)
const selectedRequestId = ref(null)

onMounted(async () => {
  try {
    const res = await requestService.getBuyerRequests()
    requests.value = res || []
  } catch (err) {
    console.error('Failed to load buyer requests for chat:', err)
  } finally {
    loadingRequests.value = false
  }
})
</script>
