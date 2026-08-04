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
              
              <input type="file" ref="avatarInput" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden" @change="handleAvatarChange" />
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

          <form @submit.prevent="handleUpdateProfile" novalidate class="space-y-4 max-w-lg">
            <BaseAlert v-if="successMsg" v-model="successMsg" type="success" :message="successMsg" dismissible class="text-xs sm:text-sm rounded-2xl" />
            <BaseAlert v-if="errorMsg" v-model="errorMsg" type="error" :message="errorMsg" dismissible class="text-xs sm:text-sm rounded-2xl" />

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.full_name') }}</label>
              <input
                v-model="form.full_name"
                data-field="full_name"
                type="text"
                :class="['w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm', profileErrors.full_name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700']"
              />
              <p v-if="profileErrors.full_name" class="text-[11px] text-rose-500 mt-1 font-medium">{{ profileErrors.full_name }}</p>
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
                <input
                  v-model="form.phone"
                  data-field="phone"
                  type="text"
                  :class="['w-2/3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm', profileErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700']"
                  placeholder="1234567890"
                />
              </div>
              <p v-if="profileErrors.phone" class="text-[11px] text-rose-500 mt-1 font-medium">{{ profileErrors.phone }}</p>
              <p v-else-if="phoneError" class="text-xs text-rose-500 mt-1">{{ phoneError }}</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.company_name') }}</label>
              <input
                v-model="form.company_name"
                data-field="company_name"
                type="text"
                :class="['w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm', profileErrors.company_name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700']"
              />
              <p v-if="profileErrors.company_name" class="text-[11px] text-rose-500 mt-1 font-medium">{{ profileErrors.company_name }}</p>
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

        <form @submit.prevent="submitChangePassword" novalidate class="space-y-4">
          <BaseAlert v-if="passSuccess" v-model="passSuccess" type="success" :message="passSuccess" dismissible class="text-xs rounded-xl" />
          <BaseAlert v-if="passError" v-model="passError" type="error" :message="passError" dismissible class="text-xs rounded-xl" />

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.new_password') }}</label>
            <input
              v-model="newPassword"
              data-field="newPassword"
              type="password"
              :class="['w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm', passErrors.newPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700']"
              :placeholder="$t('settings_page.min_chars')"
            />
            <p v-if="passErrors.newPassword" class="text-[11px] text-rose-500 mt-1 font-medium">{{ passErrors.newPassword }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ $t('settings_page.confirm_new_password') }}</label>
            <input
              v-model="confirmPassword"
              data-field="confirmPassword"
              type="password"
              :class="['w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm', passErrors.confirmPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700']"
              :placeholder="$t('settings_page.repeat_pass')"
            />
            <p v-if="passErrors.confirmPassword" class="text-[11px] text-rose-500 mt-1 font-medium">{{ passErrors.confirmPassword }}</p>
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
import BaseAlert from '../../components/ui/BaseAlert.vue'
import { authService } from '../../api/authService'
import { countryCodes, validatePhone } from '../../utils/phoneValidation'
import { getAvatarUrl } from '../../utils/avatar'
import { useToast } from '../../composables/useToast'
import { useFormValidation } from '../../composables/useFormValidation'
import { compressImage } from '../../utils/imageCompressor'

const { showToast } = useToast()

// Two separate validation scopes: profile + password modal
const { errors: profileErrors, submitGuard: profileSubmitGuard } = useFormValidation()
const { errors: passErrors, submitGuard: passSubmitGuard } = useFormValidation()

const profileRules = [
  { field: 'full_name', required: true, label: t('settings_page.full_name') },
  { field: 'company_name', required: true, label: t('settings_page.company_name') }
  // phone is optional here; live phoneError (phoneValidation util) still flags malformed numbers
]

const passRules = [
  { field: 'newPassword', required: true, minLength: 6, label: t('settings_page.new_password') },
  { field: 'confirmPassword', required: true, match: 'newPassword', label: t('settings_page.confirm_new_password') }
]

// Safe LocalStorage JSON parse with fallback
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {
    console.warn('Failed to parse user from localStorage', e)
    return {}
  }
}
const user = ref(getStoredUser())
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
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    showToast('Only JPEG, PNG, WebP, and GIF images are allowed.', 'error')
    return
  }
  
  // Max file size: 10MB (before compression), compression will reduce it further
  if (file.size > 10 * 1024 * 1024) {
    showToast('File is too large. Max size is 10MB.', 'error')
    return
  }

  uploadingAvatar.value = true
  try {
    // Compress image before uploading for better performance
    let fileToUpload = file
    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
      fileToUpload = await compressImage(file, 800, 800, 0.85) // Resize to max 800x800 for avatar
      showToast('Optimizing image...', 'info')
    }
    
    const data = await authService.uploadAvatar(fileToUpload)
    user.value.avatar_url = data.avatar_url
    user.value.avatar_data = data.avatar_data
    user.value.avatar_mime_type = data.avatar_mime_type
    localStorage.setItem('user', JSON.stringify(user.value))
    showToast('Avatar updated successfully!', 'success')
  } catch (err) {
    console.error('Avatar upload error:', err)
    showToast(err.response?.data?.message || 'Failed to upload avatar. Please try again.', 'error')
  } finally {
    uploadingAvatar.value = false
    if (avatarInput.value) avatarInput.value.value = ''
  }
}

const performUpdateProfile = async () => {
  if (phoneError.value) {
    errorMsg.value = t('validation.fix_errors_before_saving')
    return
  }

  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const data = await authService.updateProfile(form.value)
    successMsg.value = t('settings_page.update_success')
    const updatedUser = { ...user.value, ...data.user }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    user.value = updatedUser
  } catch (error) {
    errorMsg.value = error.response?.data?.message || t('settings_page.update_failed')
  } finally {
    saving.value = false
  }
}

const handleUpdateProfile = () => {
  errorMsg.value = ''
  successMsg.value = ''
  profileSubmitGuard(form.value, profileRules, performUpdateProfile)
}

const performChangePassword = async () => {
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

const submitChangePassword = () => {
  passError.value = ''
  passSuccess.value = ''
  // Pass a synthetic object so the match rule can compare newPassword === confirmPassword
  const passForm = { newPassword: newPassword.value, confirmPassword: confirmPassword.value }
  passSubmitGuard(passForm, passRules, performChangePassword)
}
</script>
