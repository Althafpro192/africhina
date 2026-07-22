<template>
  <div :class="['min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300 font-[\'Inter\',_sans-serif]', isDark ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-[#f8f9ff] text-slate-900']">
    
    <!-- Background Animated Blobs -->
    <div class="fixed top-10 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full filter blur-3xl pointer-events-none animate-pulse"></div>
    <div class="fixed bottom-10 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full filter blur-3xl pointer-events-none animate-pulse"></div>

    <!-- Top Right Controls (Theme & Language) -->
    <div class="absolute top-6 right-6 z-50 flex items-center gap-3">
      <button 
        @click="toggleTheme" 
        class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <span class="material-symbols-outlined text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
      </button>
      <LanguageSwitcher />
    </div>

    <!-- Main Card Container --> 
    <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl shadow-indigo-500/10 w-full max-w-md p-6 sm:p-9 relative z-10 transition-all duration-300">
      
      <!-- Brand Logo & Header -->
      <div class="text-center mb-8">
        <div 
          class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform"
          @click="$router.push('/')"
        >
          <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">account_tree</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          {{ $t('auth.title') }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {{ $t('auth.subtitle') }}
        </p>
      </div>

      <!-- Mode Toggle Pills (Login / Register) -->
      <div class="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
        <button 
          @click="isRegister = false; errorMsg = ''; successMsg = '';" 
          class="py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200"
          :class="!isRegister ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          {{ $t('auth.sign_in') }}
        </button>
        <button 
          @click="isRegister = true; errorMsg = ''; successMsg = '';" 
          class="py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200"
          :class="isRegister ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          {{ $t('auth.create_account') }}
        </button>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMsg" class="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
        <span class="material-symbols-outlined text-rose-500 text-lg shrink-0">error</span>
        <span>{{ errorMsg }}</span>
      </div>

      <!-- Success Alert -->
      <div v-if="successMsg" class="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
        <span class="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
        <span>{{ successMsg }}</span>
      </div>

      <!-- Auth Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5">
        
        <!-- Company Name (Register Only) -->
        <div v-if="isRegister">
          <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ $t('auth.company_name') }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-lg">business</span>
            </div>
            <input 
              v-model="form.company_name" 
              type="text" 
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm" 
              required 
            />
          </div>
        </div>

        <div v-if="isRegister" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Contact Person -->
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ $t('auth.contact_person') }}</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-lg">person</span>
              </div>
              <input 
                v-model="form.contact_person" 
                type="text" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm" 
                required 
              />
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ $t('auth.phone') }}</label>
            <div class="flex gap-2">
              <select v-model="form.country_code" class="w-1/3 px-2 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs">
                <option v-for="c in countryCodes" :key="c.code" :value="c.code">{{ c.code }}</option>
              </select>
              <div class="relative w-2/3">
                <input 
                  v-model="form.phone" 
                  type="text" 
                  class="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm" 
                  placeholder="812345678" 
                  required 
                />
              </div>
            </div>
            <p v-if="phoneError" class="text-[11px] text-rose-500 mt-1 font-medium">{{ phoneError }}</p>
          </div>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {{ $t('auth.email') }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-lg">mail</span>
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="e.g. buyer@example.com"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              {{ $t('auth.password') }}
            </label>
            <button
              v-if="!isRegister"
              @click.prevent="handleForgot"
              class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              {{ $t('auth.forgot') }}
            </button>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-lg">lock</span>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm"
              required
            />
            <button
              @click.prevent="togglePassword"
              type="button"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span class="material-symbols-outlined text-lg">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Submit Button (Indigo/Purple Brand Gradient) -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full text-white font-bold py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span v-if="loading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          <span v-else class="text-sm sm:text-base">{{ isRegister ? $t('auth.create_account') : $t('auth.sign_in') }}</span>
          <span v-if="!loading" class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </form>

      <!-- Footer Text -->
      <div class="pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          <span v-if="!isRegister">
            {{ $t('auth.no_account') }}
            <button @click="toggleMode" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">
              {{ $t('auth.create_one') }}
            </button>
          </span>
          <span v-else>
            {{ $t('auth.have_account') }}
            <button @click="toggleMode" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">
              {{ $t('auth.login_now') }}
            </button>
          </span>
        </p>
      </div>
    </div>

    <!-- Bottom Copyright Footer -->
    <div class="fixed bottom-4 left-0 right-0 text-center text-xs text-slate-400 dark:text-slate-500 z-10">
      <p>{{ $t('auth.footer') }}</p>
    </div>

    <!-- Forgot Password Modal -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isForgotModalOpen ? 'visible' : 'invisible']">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md" @click="closeForgotModal"></div>
      
      <div :class="['bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isForgotModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your email address to receive a password reset link.</p>
          </div>
          <button @click="closeForgotModal" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form @submit.prevent="submitForgotPassword" class="space-y-4">
          <div v-if="forgotSuccessMsg" class="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs">
            {{ forgotSuccessMsg }}
          </div>
          <div v-if="forgotErrorMsg" class="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
            {{ forgotErrorMsg }}
          </div>
          
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <input 
              v-model="forgotEmail" 
              type="email" 
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-xs sm:text-sm" 
              required 
              placeholder="e.g. buyer@example.com" 
            />
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeForgotModal" class="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="forgotLoading" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2 text-xs">
              <span v-if="forgotLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Request Reset
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { useTheme } from '../../composables/useTheme'
import { authService } from '../../api/authService.js'
import { countryCodes, validatePhone } from '../../utils/phoneValidation.js'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()

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
  phone: '',
  country_code: '+62'
})
const phoneError = ref('')

// Forgot Password State
const isForgotModalOpen = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotSuccessMsg = ref('')
const forgotErrorMsg = ref('')

watch(() => form.value.phone, () => {
  if (isRegister.value && form.value.phone) {
    phoneError.value = validatePhone(form.value.phone, form.value.country_code)
  } else {
    phoneError.value = ''
  }
})

watch(() => form.value.country_code, () => {
  if (isRegister.value && form.value.phone) {
    phoneError.value = validatePhone(form.value.phone, form.value.country_code)
  }
})

// Methods
const handleSubmit = async () => {
  if (isRegister.value && phoneError.value) {
    errorMsg.value = 'Please fix the phone number errors.'
    return
  }

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
        country: form.value.country_code,
        country_code: form.value.country_code,
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
  isForgotModalOpen.value = true
  forgotEmail.value = email.value
  forgotErrorMsg.value = ''
  forgotSuccessMsg.value = ''
}

const closeForgotModal = () => {
  isForgotModalOpen.value = false
}

const submitForgotPassword = async () => {
  forgotLoading.value = true
  forgotErrorMsg.value = ''
  forgotSuccessMsg.value = ''
  try {
    const data = await authService.forgotPassword(forgotEmail.value)
    forgotSuccessMsg.value = data.message || 'Request sent successfully.'
  } catch (err) {
    forgotErrorMsg.value = err.response?.data?.message || 'Failed to send request.'
  } finally {
    forgotLoading.value = false
  }
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