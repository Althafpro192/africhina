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
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('admin_messages.workspace_title') }}</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('admin_messages.workspace_sub') }}</p>
          </div>
        </div>
      </div>

      <!-- Split-Pane Workspace Container -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        
        <!-- Left Panel: Buyer List -->
        <div class="lg:col-span-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col h-[680px]">
          
          <!-- Search input -->
          <div class="relative mb-3">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              :placeholder="$t('admin_messages.search_buyer_placeholder')"
              class="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <!-- Tab Toggle: Buyers vs Conversations -->
          <div class="grid grid-cols-2 p-0.5 mb-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button 
              @click="activeTab = 'buyers'" 
              :class="['py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer', activeTab === 'buyers' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400']"
            >
              {{ $t('admin_messages.tab_buyers') }}
            </button>
            <button 
              @click="activeTab = 'conversations'" 
              :class="['py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer', activeTab === 'conversations' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400']"
            >
              {{ $t('admin_messages.tab_rfqs') }}
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex flex-col items-center justify-center flex-1 py-10">
            <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400">progress_activity</span>
          </div>

          <!-- Buyers Tab -->
          <template v-else-if="activeTab === 'buyers'">
            <h3 class="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2 px-1">
              {{ buyers.length }} {{ $t('admin_messages.buyers_total') }}
            </h3>

            <div v-if="buyers.length === 0" class="text-center py-12 text-xs text-slate-400 italic flex-1">
              {{ $t('admin_messages.no_buyers_found') }}
            </div>

            <div v-else class="space-y-2 overflow-y-auto flex-1 pr-1">
              <div 
                v-for="buyer in buyers"
                :key="buyer.id"
                @click="selectBuyer(buyer)"
                :class="['p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3', selectedBuyer?.id === buyer.id ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20' : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800']"
              >
                <!-- Avatar -->
                <img 
                  class="w-10 h-10 rounded-xl border border-indigo-500/30 object-cover shrink-0" 
                  :src="getAvatarUrl(buyer.avatar_url, buyer.full_name)"
                  :alt="buyer.full_name"
                />
                <div class="flex-1 overflow-hidden">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 overflow-hidden">
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ buyer.full_name || 'Buyer' }}</h4>
                      <span v-if="buyer.is_blocked" class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Blocked"></span>
                    </div>
                    <button 
                      @click.stop="openProfile(buyer)" 
                      class="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="View Profile"
                    >
                      <span class="material-symbols-outlined text-sm">person</span>
                    </button>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ buyer.email }}</p>
                  <p v-if="buyer.last_message" class="text-[10px] text-slate-400 truncate mt-0.5 italic">
                    "{{ buyer.last_message }}"
                  </p>
                  <p v-else-if="buyer.company_name" class="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                    {{ buyer.company_name }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- Conversations Tab (RFQs) -->
          <template v-else-if="activeTab === 'conversations'">
            <h3 class="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2 px-1">{{ $t('admin_messages.rfq_list_title') }}</h3>

            <div v-if="filteredConversations.length === 0" class="text-center py-12 text-xs text-slate-400 italic flex-1">
              {{ $t('admin_messages.no_conv_found') }}
            </div>

            <div v-else class="space-y-2 overflow-y-auto flex-1 pr-1">
              <div 
                v-for="conv in filteredConversations"
                :key="conv.id"
                @click="selectedConv = conv; selectedBuyer = null"
                :class="['p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3', selectedConv?.id === conv.id && !selectedBuyer ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20' : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800']"
              >
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
          </template>
        </div>

        <!-- Right Panel: Real-time Chat Box -->
        <div class="lg:col-span-8 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[680px]">
          
          <!-- No selection state -->
          <div v-if="!selectedConv && !selectedBuyer" class="flex flex-col items-center justify-center h-full p-8 text-center">
            <div class="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-3xl">chat</span>
            </div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white">{{ $t('admin_messages.select_conv_title') }}</h3>
            <p class="text-xs text-slate-400 mt-1 max-w-sm">{{ $t('admin_messages.select_conv_desc') }}</p>
          </div>

          <template v-else>
            <!-- Chat Header -->
            <div class="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div class="flex items-center gap-3">
                <img 
                  class="w-9 h-9 rounded-xl border border-indigo-500/30 object-cover" 
                  :src="getAvatarUrl(chatHeaderAvatar, chatHeaderName)"
                  alt="Avatar"
                />
                <div>
                  <div class="flex items-center gap-1.5">
                    <h3 class="text-xs font-bold text-slate-900 dark:text-white">{{ chatHeaderName }}</h3>
                    <span v-if="selectedBuyer?.is_blocked" class="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                      <span class="material-symbols-outlined text-[10px]">block</span> {{ $t('admin_messages.blocked') }}
                    </span>
                  </div>
                  
                  <!-- Thread selector dropdown if buyer has multiple RFQs -->
                  <div v-if="selectedBuyer && buyerRFQs.length > 0" class="flex items-center gap-2 mt-0.5">
                    <select 
                      v-model="activeThreadId" 
                      class="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 font-medium text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
                    >
                      <option :value="`buyer-${selectedBuyer.id}`">{{ $t('admin_messages.direct_support_chat') }}</option>
                      <option v-for="rfq in buyerRFQs" :key="rfq.id" :value="rfq.id">
                        RFQ: {{ rfq.product_name }} (#{{ rfq.id.split('-')[0].toUpperCase() }})
                      </option>
                    </select>
                  </div>
                  <p v-else class="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-xs">{{ chatHeaderSub }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  v-if="selectedBuyer" 
                  @click="openProfile(selectedBuyer)" 
                  class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">person</span>
                  {{ $t('admin_messages.profile') }}
                </button>
                <router-link 
                  v-if="activeChatRequestId && !activeChatRequestId.startsWith('buyer-') && activeChatRequestId !== 'general-support'" 
                  :to="`/admin/request/${activeChatRequestId}`" 
                  class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>{{ $t('admin_messages.detail_rfq') }}</span>
                  <span class="material-symbols-outlined text-sm">open_in_new</span>
                </router-link>
              </div>
            </div>

            <!-- Embedded Chat Component -->
            <div class="flex-1 overflow-hidden">
              <ChatComponent 
                :key="activeChatRequestId"
                :requestId="activeChatRequestId" 
                :isAdmin="true" 
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Buyer Profile Modal -->
    <BuyerProfileModal 
      :isOpen="isProfileOpen" 
      :userId="profileUserId" 
      @close="isProfileOpen = false"
      @blocked-toggled="onBlockedToggled"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import BuyerProfileModal from '../../components/admin/BuyerProfileModal.vue'
import { adminService } from '../../api/adminService.js'

const buyers = ref([])
const conversations = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedBuyer = ref(null)
const selectedConv = ref(null)
const activeTab = ref('buyers')
const activeThreadId = ref(null)

// Profile modal
const isProfileOpen = ref(false)
const profileUserId = ref(null)

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

// Buyer's RFQs list
const buyerRFQs = computed(() => {
  if (!selectedBuyer.value) return []
  return conversations.value.filter(c => c.user_id === selectedBuyer.value.id)
})

// Chat header computed values
const chatHeaderName = computed(() => {
  if (selectedBuyer.value) return selectedBuyer.value.full_name || 'Buyer'
  if (selectedConv.value) return selectedConv.value.buyer_name || 'Buyer User'
  return ''
})

const chatHeaderAvatar = computed(() => {
  if (selectedBuyer.value) return selectedBuyer.value.avatar_url
  if (selectedConv.value) return selectedConv.value.buyer_avatar
  return null
})

const chatHeaderSub = computed(() => {
  if (selectedBuyer.value) {
    return `Direct Customer Support (${selectedBuyer.value.email})`
  }
  if (selectedConv.value) {
    return `${selectedConv.value.product_name} (#${selectedConv.value.id.split('-')[0].toUpperCase()})`
  }
  return ''
})

const activeChatRequestId = computed(() => {
  if (selectedBuyer.value) {
    return activeThreadId.value || `buyer-${selectedBuyer.value.id}`
  }
  if (selectedConv.value) return selectedConv.value.id
  return null
})

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (activeTab.value === 'buyers') {
      await loadBuyers()
    }
  }, 300)
}

const loadBuyers = async () => {
  try {
    const result = await adminService.getBuyerList(searchQuery.value)
    buyers.value = result.data || result || []
  } catch (err) {
    console.error('Failed to load buyers:', err)
  }
}

const selectBuyer = async (buyer) => {
  selectedBuyer.value = buyer
  selectedConv.value = null
  activeThreadId.value = `buyer-${buyer.id}`
}

const openProfile = (buyer) => {
  profileUserId.value = buyer.id
  isProfileOpen.value = true
}

const onBlockedToggled = ({ userId, is_blocked }) => {
  const buyerIdx = buyers.value.findIndex(b => b.id === userId)
  if (buyerIdx !== -1) {
    buyers.value[buyerIdx].is_blocked = is_blocked
  }
  if (selectedBuyer.value?.id === userId) {
    selectedBuyer.value.is_blocked = is_blocked
  }
}

onMounted(async () => {
  try {
    const [buyerResult, requestResult] = await Promise.all([
      adminService.getBuyerList(),
      adminService.getAllRequests()
    ])
    buyers.value = buyerResult.data || buyerResult || []
    conversations.value = requestResult || []
    
    if (buyers.value.length > 0) {
      await selectBuyer(buyers.value[0])
    }
  } catch (err) {
    console.error('Failed to load admin messages workspace:', err)
  } finally {
    loading.value = false
  }
})
</script>
