<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%);">
    
    <!-- Background Decorations -->
    <div class="fixed top-20 right-20 opacity-20 pointer-events-none">
      <span class="material-symbols-outlined text-purple-400" style="font-size: 120px;">language</span>
    </div>
    <div class="fixed bottom-20 left-20 opacity-20 pointer-events-none">
      <span class="material-symbols-outlined text-gray-400" style="font-size: 96px;">local_shipping</span>
    </div>
    <div class="fixed top-1/2 right-32 opacity-20 pointer-events-none">
      <span class="material-symbols-outlined text-purple-400" style="font-size: 112px;">bridge</span>
    </div>

    <!-- Language Switcher -->
    <div class="absolute top-6 right-6 z-50">
      <LanguageSwitcher />
    </div>

    <!-- Login Card --> 
    <div class="bg-white rounded-2xl shadow-2xl w-full relative z-10" :style="{ maxWidth: isMobile ? '100%' : '448px', padding: isMobile ? '24px' : '32px' }">
      
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style="background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%); box-shadow: 0 10px 25px rgba(53, 37, 205, 0.3)">
          <span class="material-symbols-outlined text-white" style="font-size: 32px;">bridge</span>
        </div>
        <h1 class="text-3xl font-bold mb-2" style="background: linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          {{ $t('auth.title') }}
        </h1>
        <p class="text-gray-600">{{ $t('auth.subtitle') }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-red-500" style="font-size: 18px;">error</span>
        {{ errorMsg }}
      </div>

      <!-- Success Message -->
      <div v-if="successMsg" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-green-500" style="font-size: 18px;">check_circle</span>
        {{ successMsg }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <!-- Company Name (Register Only) -->
        <div v-if="isRegister">
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.company_name') }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">business</span>
            </div>
            <input v-model="form.company_name" type="text" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" :style="{ fontSize: isMobile ? '14px' : '16px' }" required />
          </div>
        </div>

        <div v-if="isRegister" class="grid grid-cols-2 gap-4">
          <!-- Contact Person -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.contact_person') }}</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">person</span>
              </div>
              <input v-model="form.contact_person" type="text" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" :style="{ fontSize: isMobile ? '14px' : '16px' }" required />
            </div>
          </div>
          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.phone') }}</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">phone</span>
              </div>
              <input v-model="form.phone" type="text" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" :style="{ fontSize: isMobile ? '14px' : '16px' }" required />
            </div>
          </div>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('auth.email') }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">mail</span>
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="e.g. buyer@example.com"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              :style="{ fontSize: isMobile ? '14px' : '16px' }"
              required
            />
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ $t('auth.password') }}
            </label>
            <button
              v-if="!isRegister"
              @click.prevent="handleForgot"
              class="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {{ $t('auth.forgot') }}
            </button>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">lock</span>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              :style="{ fontSize: isMobile ? '14px' : '16px' }"
              required
            />
            <button
              @click.prevent="togglePassword"
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Sign In Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full text-white font-semibold py-3 px-6 rounded-xl hover:opacity-95 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          :style="{ background: 'linear-gradient(135deg, #4f46e5 0%, #3525cd 100%)', boxShadow: '0 10px 25px rgba(53, 37, 205, 0.3)' }"
        >
          <span v-if="loading" class="material-symbols-outlined animate-spin" style="font-size: 20px;">progress_activity</span>
          <span v-else>{{ isRegister ? $t('auth.create_account') : $t('auth.sign_in') }}</span>
          <span v-if="!loading" class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">{{ $t('auth.or') }}</span>
        </div>
      </div>

      <!-- Create Account Link -->
      <p class="text-center text-gray-600" v-if="!isRegister">
        {{ $t('auth.no_account') }}
        <button
          @click="toggleMode"
          class="text-purple-600 hover:text-purple-700 font-semibold ml-1"
        >
          {{ $t('auth.create_one') }}
        </button>
      </p>
      
      <p class="text-center text-gray-600" v-else>
        {{ $t('auth.have_account') }}
        <button
          @click="toggleMode"
          class="text-purple-600 hover:text-purple-700 font-semibold ml-1"
        >
          {{ $t('auth.login_now') }}
        </button>
      </p>
    </div>

    <!-- Footer -->
    <div class="fixed bottom-4 left-0 right-0 text-center text-gray-400 text-sm z-10">
      <p>{{ $t('auth.footer') }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { authService } from '../../api/authService.js'

const router = useRouter()

// Form State
const isRegister = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = ref({
  company_name: '',
  contact_person: '',
  phone: ''
})

// Device Detection
const isMobile = ref(false)
const windowWidth = ref(0)

const updateDeviceType = () => {
  windowWidth.value = window.innerWidth
  isMobile.value = windowWidth.value < 768
}

onMounted(() => {
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
})

// Methods
const handleSubmit = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true

  try {
    if (isRegister.value) {
      // Register
      await authService.register({
        full_name: form.value.contact_person,
        email: email.value,
        password: password.value,
        country: '',
        phone: form.value.phone,
        company_name: form.value.company_name
      })
      successMsg.value = 'Account created successfully! Please login.'
      isRegister.value = false
      password.value = ''
    } else {
      // Login
      const data = await authService.login(email.value, password.value)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/buyer/dashboard')
      }
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleForgot = () => {
  console.log('Forgot password clicked')
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  errorMsg.value = ''
  successMsg.value = ''
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
}
</style>