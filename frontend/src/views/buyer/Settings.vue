<template>
  <BuyerLayout activeRoute="settings">
    <div class="w-full max-w-4xl mx-auto py-4 sm:py-6">
      
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('nav.settings') }}</h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{{ $t('settings_page.subtitle') }}</p>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden transition-colors duration-300">
        
        <!-- Profile Section -->
        <div class="p-6 sm:p-8 border-b border-slate-200/80 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div class="relative group">
              <img 
                class="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md"
                :src="getAvatarUrl(user.avatar_url, form.full_name, user.id, user.avatar_data, user.avatar_mime_type)"
                alt="Profile"
              />
              <div v-if="uploadingAvatar" class="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white">
                <span class="material-symbols-outlined animate-spin">progress_activity</span>
              </div>
            </div>

            <div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white">{{ form.full_name || 'Buyer User' }}</h2>
              <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-3">{{ user.role === 'admin' ? $t('settings_page.administrator') : $t('settings_page.verified_buyer') }}</p>
              
              <input type="file" ref="avatarInput" accept="image/png, image/jpeg, image/jpg" class="hidden" @change="handleAvatarChange" />
              <button 
                @click="$refs.avatarInput.click()" 
                :disabled="uploadingAvatar" 
                class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-sm">photo_camera</span>
                <span>{{ $t('settings_page.change_avatar') }}</span>
              </button>
            </div>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4 max-w-lg">
            <div v-if="successMsg" class="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold rounded-2xl border border-emerald-200 dark:border-emerald-800">{{ successMsg }}</div>
            <div v-if="errorMsg" class="p-3.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold rounded-2xl border border-rose-200 dark:border-rose-800">{{ errorMsg }}</div>
            
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.full_name') }}</label>
              <input v-model="form.full_name" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.email_address') }}</label>
              <input :value="user.email" type="email" class="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed outline-none text-xs sm:text-sm" disabled />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.phone_number') }}</label>
              <div class="flex gap-2">
                <select v-model="form.country_code" class="w-1/3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none text-xs">
                  <option v-for="c in countryCodes" :key="c.code" :value="c.code">{{ c.code }}</option>
                </select>
                <input v-model="form.phone" type="text" class="w-2/3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm" placeholder="1234567890" />
              </div>
              <p v-if="phoneError" class="text-xs text-rose-500 mt-1">{{ phoneError }}</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.company_name') }}</label>
              <input v-model="form.company_name" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm" required />
            </div>
            
            <div class="pt-2">
              <button 
                type="submit" 
                :disabled="saving" 
                class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="saving" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                <span>{{ $t('settings_page.save_changes') }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Security Section -->
        <div class="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 class="text-base font-extrabold text-slate-900 dark:text-white mb-4">{{ $t('settings_page.account_security') }}</h3>
          <div class="space-y-4 max-w-lg">
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">lock</span>
                </div>
                <div>
                  <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">{{ $t('settings_page.change_password') }}</span>
                  <span class="text-[11px] text-slate-400">{{ $t('settings_page.change_password_desc') }}</span>
                </div>
              </div>
              
              <button 
                @click="isChangePassOpen = true"
                class="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
              >
                {{ $t('settings_page.change_password') }}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isChangePassOpen ? 'visible' : 'invisible']">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="isChangePassOpen = false"></div>
      
      <div :class="['bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isChangePassOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('settings_page.modal_title') }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ $t('settings_page.modal_subtitle') }}</p>
          </div>
          <button @click="isChangePassOpen = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form @submit.prevent="submitChangePassword" class="space-y-4">
          <div v-if="passSuccess" class="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800">{{ passSuccess }}</div>
          <div v-if="passError" class="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">{{ passError }}</div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.new_password') }}</label>
            <input v-model="newPassword" type="password" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm" required :placeholder="$t('settings_page.min_chars')" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.confirm_new_password') }}</label>
            <input v-model="confirmPassword" type="password" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm" required :placeholder="$t('settings_page.repeat_pass')" />
          </div>

          <div class="flex justify-end gap-3 pt-3">
            <button type="button" @click="isChangePassOpen = false" class="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              {{ $t('settings_page.cancel') }}
            </button>
            <button type="submit" :disabled="passLoading" class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2">
              <span v-if="passLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              {{ $t('settings_page.save_new_password') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </BuyerLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import { authService } from '../../api/authService'
import { countryCodes, validatePhone } from '../../utils/phoneValidation'
import { getAvatarUrl } from '../../utils/avatar'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const form = ref({
  full_name: '',
  phone: '',
  country_code: '+62',
  company_name: ''
})

const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const phoneError = ref('')

const avatarInput = ref(null)
const uploadingAvatar = ref(false)

// Change Password Modal State
const isChangePassOpen = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passLoading = ref(false)
const passSuccess = ref('')
const passError = ref('')

onMounted(async () => {
  try {
    const me = await authService.getMe()
    user.value = me
    form.value.full_name = me.full_name || ''
    form.value.phone = me.phone || ''
    form.value.country_code = me.country_code || '+62'
    form.value.company_name = me.company_name || ''
    localStorage.setItem('user', JSON.stringify(me))
  } catch (error) {
    console.error('Failed to load profile', error)
  }
})

watch(() => form.value.phone, () => {
  if (form.value.phone) {
    phoneError.value = validatePhone(form.value.phone, form.value.country_code)
  } else {
    phoneError.value = ''
  }
})

const handleAvatarChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.size > 2 * 1024 * 1024) {
    showToast('File is too large. Max size is 2MB.', 'error')
    return
  }

  uploadingAvatar.value = true
  try {
    const data = await authService.uploadAvatar(file)
    user.value.avatar_url = data.avatar_url
    user.value.avatar_data = data.avatar_data
    user.value.avatar_mime_type = data.avatar_mime_type
    localStorage.setItem('user', JSON.stringify(user.value))
    showToast('Avatar updated successfully!', 'success')
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to upload avatar', 'error')
  } finally {
    uploadingAvatar.value = false
    if (avatarInput.value) avatarInput.value.value = ''
  }
}

const handleUpdateProfile = async () => {
  if (phoneError.value) {
    errorMsg.value = 'Please fix the errors before saving.'
    return
  }
  
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const data = await authService.updateProfile(form.value)
    successMsg.value = 'Profile updated successfully!'
    const updatedUser = { ...user.value, ...data.user }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    user.value = updatedUser
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

const submitChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    passError.value = t('settings_page.error_match')
    return
  }
  if (newPassword.value.length < 6) {
    passError.value = t('settings_page.error_min')
    return
  }

  passLoading.value = true
  passSuccess.value = ''
  passError.value = ''
  try {
    await authService.updateProfile({ password: newPassword.value })
    passSuccess.value = t('settings_page.success_update')
    showToast(t('settings_page.success_update'), 'success')
    setTimeout(() => {
      isChangePassOpen.value = false
      newPassword.value = ''
      confirmPassword.value = ''
    }, 1500)
  } catch (err) {
    passError.value = err.response?.data?.message || t('settings_page.failed_update')
  } finally {
    passLoading.value = false
  }
}
</script>
