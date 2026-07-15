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

    <!-- Login Card --> 
    <div class="bg-white rounded-2xl shadow-2xl w-full relative z-10" :style="{ maxWidth: isMobile ? '100%' : '448px', padding: isMobile ? '24px' : '32px' }">
      
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center mb-4" style="width: '64px'; height: '64px'; background: 'linear-gradient(135deg, #4f46e5 0%, #3525cd 100%)'; borderRadius: '16px'; boxShadow: '0 10px 25px rgba(53, 37, 205, 0.3)'">
          <span class="material-symbols-outlined text-white" style="font-size: 32px;">bridge</span>
        </div>
        <h1 class="text-3xl font-bold mb-2" style="background: linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          AfriChina Bridge
        </h1>
        <p class="text-gray-600">Premium B2B Supply Chain Hub</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
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
              Password
            </label>
            <button
              @click.prevent="handleForgot"
              class="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Forgot?
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
          class="w-full text-white font-semibold py-3 px-6 rounded-xl hover:opacity-95 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
          :style="{ background: 'linear-gradient(135deg, #4f46e5 0%, #3525cd 100%)', boxShadow: '0 10px 25px rgba(53, 37, 205, 0.3)' }"
        >
          Sign In
          <span class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>

      <!-- Create Account Link -->
      <p class="text-center text-gray-600">
        Don't have an account?
        <button
          @click="handleCreateAccount"
          class="text-purple-600 hover:text-purple-700 font-semibold ml-1"
        >
          Create one
        </button>
      </p>
    </div>

    <!-- Footer -->
    <div class="fixed bottom-4 left-0 right-0 text-center text-gray-400 text-sm z-10">
      <p>© 2024 AfriChina Bridge</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Form State
const email = ref('')
const password = ref('')
const showPassword = ref(false)

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
const handleLogin = () => {
  console.log('Login attempted with:', {
    email: email.value,
    password: password.value
  })
  // Add your login logic here
}

const handleForgot = () => {
  console.log('Forgot password clicked')
  // Add your forgot password logic here
}

const handleCreateAccount = () => {
  console.log('Create account clicked')
  // Add your create account logic here
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