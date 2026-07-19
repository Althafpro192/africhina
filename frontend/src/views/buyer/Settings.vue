<template>
  <BuyerLayout activeRoute="settings">
    <div class="w-full max-w-4xl mx-auto py-8">
      
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">{{ $t('nav.settings') }}</h1>
      </div>

      <!-- Settings Content -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        <div class="p-6 sm:p-8 border-b border-gray-100">
          <div class="flex items-center gap-4 mb-6">
            <div class="relative group">
              <img 
                class="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                :src="user.avatar_url ? 'http://localhost:5000' + user.avatar_url : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.full_name || 'User') + '&background=random'" 
                alt="Profile"
              />
              <div v-if="uploadingAvatar" class="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined animate-spin text-[#4f378a]">progress_activity</span>
              </div>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ form.full_name || 'User Name' }}</h2>
              <p class="text-gray-500 text-sm mb-2">{{ user.role === 'admin' ? 'Administrator' : 'Verified Buyer' }}</p>
              
              <input type="file" ref="avatarInput" accept="image/png, image/jpeg, image/jpg" class="hidden" @change="handleAvatarChange" />
              <button @click="$refs.avatarInput.click()" :disabled="uploadingAvatar" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                Change Avatar
              </button>
            </div>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4 max-w-lg">
            <div v-if="successMsg" class="p-3 bg-green-50 text-green-700 text-sm rounded-lg mb-4">{{ successMsg }}</div>
            <div v-if="errorMsg" class="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-4">{{ errorMsg }}</div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input v-model="form.full_name" type="text" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f378a] outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input :value="user.email" type="email" class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed" disabled />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <div class="flex gap-2">
                <select v-model="form.country_code" class="w-1/3 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f378a] outline-none bg-white">
                  <option v-for="c in countryCodes" :key="c.code" :value="c.code">{{ c.code }} ({{ c.country.split(' ')[0] }})</option>
                </select>
                <input v-model="form.phone" type="text" class="w-2/3 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f378a] outline-none" placeholder="1234567890" />
              </div>
              <p v-if="phoneError" class="text-xs text-red-500 mt-1">{{ phoneError }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
              <input v-model="form.company_name" type="text" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f378a] outline-none" required />
            </div>
            
            <div class="pt-4">
              <button type="submit" :disabled="saving" class="px-6 py-2.5 bg-[#4f378a] text-white font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2">
                <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div class="p-6 sm:p-8 bg-gray-50">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Security</h3>
          <div class="space-y-4 max-w-lg">
            <button class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-gray-500">lock</span>
                <span class="font-semibold text-gray-700">Change Password</span>
              </div>
              <span class="material-symbols-outlined text-gray-400">chevron_right</span>
            </button>
            <button class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-gray-500">verified_user</span>
                <span class="font-semibold text-gray-700">Two-Factor Authentication</span>
              </div>
              <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Enabled</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  </BuyerLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import { authService } from '../../api/authService'
import { countryCodes, validatePhone } from '../../utils/phoneValidation'
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

onMounted(async () => {
  try {
    const me = await authService.getMe()
    user.value = me
    form.value.full_name = me.full_name || ''
    form.value.phone = me.phone || ''
    form.value.country_code = me.country_code || '+62'
    form.value.company_name = me.company_name || ''
    
    // Update local storage just in case avatar was updated elsewhere
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

watch(() => form.value.country_code, () => {
  if (form.value.phone) {
    phoneError.value = validatePhone(form.value.phone, form.value.country_code)
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
    
    // Update local storage
    const updatedUser = { ...user.value, ...data.user }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    user.value = updatedUser
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}
</script>
