<template>
  <AdminLayout activeRoute="messages">
    <div class="w-full max-w-7xl mx-auto py-4 sm:py-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
            <span class="material-symbols-outlined text-xl">forum</span>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Buyer Messages Workspace</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Pusat pesan & negosiasi langsung dengan Buyer verified</p>
          </div>
        </div>
      </div>

      <!-- Split-Pane Workspace Container -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        
        <!-- Left Panel: Buyer / Conversation List -->
        <div class="lg:col-span-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col h-[680px]">
          
          <!-- Search input -->
          <div class="relative mb-3">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama buyer atau RFQ..."
              class="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <h3 class="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2 px-1">Daftar Percakapan</h3>

          <div v-if="loading" class="flex flex-col items-center justify-center flex-1 py-10">
            <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400">progress_activity</span>
          </div>

          <div v-else-if="filteredConversations.length === 0" class="text-center py-12 text-xs text-slate-400 italic flex-1">
            Tidak ada percakapan ditemukan.
          </div>

          <div v-else class="space-y-2 overflow-y-auto flex-1 pr-1">
            <div 
              v-for="conv in filteredConversations"
              :key="conv.id"
              @click="selectedConv = conv"
              :class="['p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3', selectedConv?.id === conv.id ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20' : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800']"
            >
              <!-- Avatar -->
              <img 
                class="w-10 h-10 rounded-xl border border-indigo-500/30 object-cover shrink-0" 
                :src="getAvatarUrl(conv.buyer_avatar, conv.buyer_name)"
                alt="Buyer Avatar"
              />
              <div class="flex-1 overflow-hidden">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ conv.buyer_name || 'Buyer User' }}</h4>
                  <span class="text-[10px] font-medium text-slate-400">{{ formatDateShort(conv.updated_at) }}</span>
                </div>
                <p class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">{{ conv.product_name }}</p>
                <p class="text-[10px] text-slate-400 truncate">RFQ #{{ conv.id.split('-')[0].toUpperCase() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Real-time Chat Box -->
        <div class="lg:col-span-8 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[680px]">
          <div v-if="!selectedConv" class="flex flex-col items-center justify-center h-full p-8 text-center">
            <div class="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-3xl">chat</span>
            </div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white">Pilih Percakapan</h3>
            <p class="text-xs text-slate-400 mt-1 max-w-sm">Klik salah satu buyer dari daftar di sebelah kiri untuk melihat pesan dan merespons penawaran.</p>
          </div>

          <template v-else>
            <!-- Chat Header -->
            <div class="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div class="flex items-center gap-3">
                <img 
                  class="w-9 h-9 rounded-xl border border-indigo-500/30 object-cover" 
                  :src="getAvatarUrl(selectedConv.buyer_avatar, selectedConv.buyer_name)"
                  alt="Buyer Avatar"
                />
                <div>
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white">{{ selectedConv.buyer_name }}</h3>
                  <p class="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-xs">{{ selectedConv.product_name }} (#{{ selectedConv.id.split('-')[0].toUpperCase() }})</p>
                </div>
              </div>
              <router-link :to="`/admin/request/${selectedConv.id}`" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                <span>Detail RFQ</span>
                <span class="material-symbols-outlined text-sm">open_in_new</span>
              </router-link>
            </div>

            <!-- Embedded Chat Component -->
            <div class="flex-1 overflow-hidden">
              <ChatComponent 
                :key="selectedConv.id"
                :requestId="selectedConv.id" 
                :isAdmin="true" 
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import { adminService } from '../../api/adminService.js'

const conversations = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedConv = ref(null)

const getAvatarUrl = (url, name) => {
  if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=4f378a&color=fff`
  if (url.startsWith('/uploads/avatar-')) {
    url = url.replace('/uploads/avatar-', '/uploads/avatars/avatar-')
  }
  if (url.startsWith('/')) {
    return `${window.location.protocol}//${window.location.hostname}:5000${url}`
  }
  return url
}

const formatDateShort = (dStr) => {
  if (!dStr) return ''
  const d = new Date(dStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(c => 
    (c.buyer_name && c.buyer_name.toLowerCase().includes(q)) ||
    (c.product_name && c.product_name.toLowerCase().includes(q)) ||
    (c.id && c.id.toLowerCase().includes(q))
  )
})

onMounted(async () => {
  try {
    const res = await adminService.getAllRequests()
    conversations.value = res || []
    if (conversations.value.length > 0) {
      selectedConv.value = conversations.value[0]
    }
  } catch (err) {
    console.error('Failed to load admin request conversations:', err)
  } finally {
    loading.value = false
  }
})
</script>
