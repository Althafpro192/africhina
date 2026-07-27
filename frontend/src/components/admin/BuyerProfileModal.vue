<template>
  <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isOpen ? 'visible' : 'invisible']">
    <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <div :class="['bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white overflow-hidden', isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
      
      <!-- Loading State -->
      <div v-if="loading" class="p-12 flex items-center justify-center">
        <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 text-3xl">progress_activity</span>
      </div>

      <template v-else-if="profile">
        <!-- Header with Avatar -->
        <div class="p-6 pb-4 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-4">
              <img 
                class="w-14 h-14 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 object-cover shadow-lg" 
                :src="getAvatarUrl(profile.avatar_url, profile.full_name)"
                :alt="profile.full_name"
              />
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ profile.full_name }}</h3>
                  <span v-if="profile.is_blocked" class="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    <span class="material-symbols-outlined text-xs">block</span>
                    Blocked
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ profile.email }}</p>
                <p v-if="profile.company_name" class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{{ profile.company_name }}</p>
              </div>
            </div>
            <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="p-6 pb-4">
          <div class="grid grid-cols-3 gap-3 mb-5">
            <div class="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl p-3 text-center">
              <p class="text-lg font-black text-indigo-600 dark:text-indigo-400">{{ profile.stats?.total_orders || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('buyer_profile.total_orders') }}</p>
            </div>
            <div class="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 rounded-2xl p-3 text-center">
              <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">${{ formatMoney(profile.stats?.total_spent) }}</p>
              <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('buyer_profile.total_spent') }}</p>
            </div>
            <div class="bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 rounded-2xl p-3 text-center">
              <p class="text-sm font-black text-purple-600 dark:text-purple-400">{{ formatJoinDate(profile.stats?.joined_date) }}</p>
              <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('buyer_profile.joined') }}</p>
            </div>
          </div>

          <!-- Contact Details -->
          <div class="space-y-2.5 mb-5">
            <h4 class="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">{{ $t('buyer_profile.contact_details') }}</h4>
            <div class="flex items-center gap-2.5 text-xs">
              <span class="material-symbols-outlined text-slate-400 text-base">mail</span>
              <span class="text-slate-700 dark:text-slate-300">{{ profile.email }}</span>
            </div>
            <div v-if="profile.phone" class="flex items-center gap-2.5 text-xs">
              <span class="material-symbols-outlined text-slate-400 text-base">phone</span>
              <span class="text-slate-700 dark:text-slate-300">{{ profile.country_code || '' }} {{ profile.phone }}</span>
            </div>
            <div v-if="profile.country" class="flex items-center gap-2.5 text-xs">
              <span class="material-symbols-outlined text-slate-400 text-base">location_on</span>
              <span class="text-slate-700 dark:text-slate-300">{{ profile.country }}</span>
            </div>
          </div>

          <!-- Recent Activities -->
          <div v-if="profile.recent_activities?.length" class="mb-4">
            <h4 class="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">{{ $t('buyer_profile.recent_activity') }}</h4>
            <div class="space-y-1.5 max-h-32 overflow-y-auto">
              <div 
                v-for="activity in profile.recent_activities" 
                :key="activity.id"
                class="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs"
              >
                <span class="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">{{ activity.product_name }}</span>
                <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-full">{{ activity.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="px-6 pb-6 flex gap-3">
          <button 
            @click="handleToggleBlock"
            :disabled="toggling"
            :class="[
              'flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer',
              profile.is_blocked 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20'
            ]"
          >
            <span v-if="toggling" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            <span v-else class="material-symbols-outlined text-sm">{{ profile.is_blocked ? 'check_circle' : 'block' }}</span>
            {{ profile.is_blocked ? $t('buyer_profile.unblock_user') : $t('buyer_profile.block_user') }}
          </button>
          <button 
            @click="$emit('close')" 
            class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { adminService } from '../../api/adminService.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  userId: { type: String, default: null }
})

const emit = defineEmits(['close', 'blocked-toggled'])

const profile = ref(null)
const loading = ref(false)
const toggling = ref(false)

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

const formatMoney = (val) => {
  if (!val || val === 0) return '0'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const formatJoinDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const loadProfile = async (userId) => {
  if (!userId) return
  loading.value = true
  try {
    profile.value = await adminService.getBuyerProfile(userId)
  } catch (err) {
    console.error('Failed to load buyer profile:', err)
  } finally {
    loading.value = false
  }
}

const handleToggleBlock = async () => {
  toggling.value = true
  try {
    const result = await adminService.toggleBlockUser(props.userId)
    profile.value.is_blocked = result.is_blocked
    emit('blocked-toggled', { userId: props.userId, is_blocked: result.is_blocked })
  } catch (err) {
    console.error('Failed to toggle block:', err)
  } finally {
    toggling.value = false
  }
}

watch(() => props.userId, (newId) => {
  if (newId && props.isOpen) {
    loadProfile(newId)
  }
})

watch(() => props.isOpen, (open) => {
  if (open && props.userId) {
    loadProfile(props.userId)
  } else {
    profile.value = null
  }
})
</script>
