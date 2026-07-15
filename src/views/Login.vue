<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
    <!-- Background Decorations -->
    <div class="fixed top-20 right-20 opacity-20">
      <span class="material-icons text-8xl text-purple-400">language</span>
    </div>
    <div class="fixed bottom-20 left-20 opacity-20">
      <span class="material-icons text-6xl text-gray-400">local_shipping</span>
    </div>
    <div class="fixed top-1/2 right-32 opacity-20">
      <span class="material-icons text-7xl text-purple-400">bridge</span>
    </div>

    <!-- Login Card -->
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
          <span class="material-icons text-white text-3xl">bridge</span>
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AfriChina Bridge
        </h1>
        <p class="text-gray-600 mt-2">Premium B2B Supply Chain Hub</p>
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
              <span class="material-icons text-gray-400 text-sm">mail</span>
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="e.g. buyer@example.com"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot?
            </button>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="material-icons text-gray-400 text-sm">lock</span>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
            <button
              @click.prevent="togglePassword"
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span class="material-icons text-gray-400 text-sm">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Sign In Button -->
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
        >
          Sign In
          <span class="material-icons text-sm">arrow_forward</span>
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
          class="text-blue-600 hover:text-blue-700 font-semibold ml-1"
        >
          Create one
        </button>
      </p>
    </div>

    <!-- Footer -->
    <div class="fixed bottom-4 left-0 right-0 text-center text-gray-400 text-sm z-10">
      <div class="flex justify-center gap-4 mb-2">
        <span class="material-icons text-lg opacity-30">local_shipping</span>
        <span class="material-icons text-lg opacity-30">bridge</span>
      </div>
      <p>© 2024 AFRICHINA BRIDGE</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Reactive state
const email = ref('')
const password = ref('')
const showPassword = ref(false)

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
/* Additional custom styles if needed */
</style>