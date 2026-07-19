<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%);">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2 text-[#3525cd]">Reset Password</h1>
        <p class="text-gray-600">Enter your new password below.</p>
      </div>

      <div v-if="successMsg" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
        <p class="font-bold mb-2">{{ successMsg }}</p>
        <button @click="router.push('/login')" class="text-sm font-semibold text-[#3525cd] hover:underline">Return to Login</button>
      </div>

      <form v-else @submit.prevent="handleReset" class="space-y-6">
        <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {{ errorMsg }}
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input v-model="newPassword" type="password" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3525cd] outline-none transition-all" required placeholder="••••••••" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input v-model="confirmPassword" type="password" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3525cd] outline-none transition-all" required placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="loading" class="w-full text-white font-semibold py-3 px-6 rounded-xl shadow-lg bg-[#3525cd] hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <span v-if="loading" class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          Reset Password
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../../api/authService'

const route = useRoute()
const router = useRouter()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(() => {
  token.value = route.query.token
  if (!token.value) {
    errorMsg.value = 'Invalid or missing reset token.'
  }
})

const handleReset = async () => {
  if (!token.value) {
    errorMsg.value = 'Invalid or missing reset token.'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }
  
  if (newPassword.value.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters long.'
    return
  }

  loading.value = true
  errorMsg.value = ''
  try {
    const data = await authService.executeResetPassword(token.value, newPassword.value)
    successMsg.value = data.message || 'Password reset successfully!'
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Failed to reset password. The link might be expired.'
  } finally {
    loading.value = false
  }
}
</script>
