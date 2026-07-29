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
    <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl shadow-indigo-500/10 w-full max-w-2xl p-6 sm:p-9 relative z-10 transition-all duration-300">
      
      <!-- Brand Logo & Header -->
      <div class="text-center mb-6">
        <div 
          class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform"
          @click="$router.push('/')"
        >
          <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">account_tree</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          {{ $t('supplier_register.title') }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {{ $t('supplier_register.subtitle') }}
        </p>
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

      <!-- Registration Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5">
        
        <!-- Full Name -->
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {{ $t('supplier_register.full_name') }} <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-lg">person</span>
            </div>
            <input 
              v-model="form.full_name" 
              type="text" 
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm" 
              :placeholder="$t('supplier_register.full_name_placeholder')"
              required 
            />
          </div>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {{ $t('supplier_register.email') }} <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-lg">mail</span>
            </div>
            <input
              v-model="form.email"
              type="email"
              :placeholder="$t('supplier_register.email_placeholder')"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <!-- Password & Confirm Password -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {{ $t('supplier_register.password') }} <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-lg">lock</span>
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="$t('supplier_register.password_placeholder')"
                class="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm"
                required
                minlength="6"
              />
              <button
                @click.prevent="showPassword = !showPassword"
                type="button"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span class="material-symbols-outlined text-lg">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {{ $t('supplier_register.confirm_password') }} <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-lg">lock</span>
              </div>
              <input
                v-model="form.password_confirmation"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="$t('supplier_register.confirm_password_placeholder')"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm"
                required
                minlength="6"
              />
            </div>
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {{ $t('supplier_register.phone') }}
          </label>
          <div class="flex gap-2">
            <select v-model="form.country_code" class="w-1/3 px-2 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs">
              <option value="+86">+86 中国</option>
              <option value="+1">+1 US</option>
              <option value="+62">+62 Indonesia</option>
              <option value="+254">+254 Kenya</option>
              <option value="+233">+233 Ghana</option>
              <option value="+27">+27 South Africa</option>
              <option value="+225">+225 Ivory Coast</option>
              <option value="+221">+221 Senegal</option>
            </select>
            <div class="relative w-2/3">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-lg">phone</span>
              </div>
              <input 
                v-model="form.phone" 
                type="text" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm" 
                :placeholder="$t('supplier_register.phone_placeholder')"
              />
            </div>
          </div>
        </div>

        <!-- Company Name -->
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {{ $t('supplier_register.company_name') }} <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-lg">business</span>
            </div>
            <input 
              v-model="form.company_name" 
              type="text" 
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm" 
              :placeholder="$t('supplier_register.company_name_placeholder')"
              required 
            />
          </div>
        </div>

        <!-- Category & Factory Address Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category -->
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {{ $t('supplier_register.category') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-lg">category</span>
              </div>
              <select 
                v-model="form.category" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm appearance-none"
              >
                <option value="">{{ $t('supplier_register.select_category') }}</option>
                <option value="electronics">{{ $t('rfq_create.categories.electronics') }}</option>
                <option value="machinery">{{ $t('rfq_create.categories.machinery') }}</option>
                <option value="textiles">{{ $t('rfq_create.categories.textiles') }}</option>
                <option value="building">{{ $t('rfq_create.categories.building') }}</option>
                <option value="automotive">{{ $t('rfq_create.categories.automotive') }}</option>
                <option value="chemicals">{{ $t('rfq_create.categories.chemicals') }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-lg">expand_more</span>
              </div>
            </div>
          </div>

          <!-- Business License -->
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {{ $t('supplier_register.business_license') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-lg">description</span>
              </div>
              <input 
                v-model="form.business_license" 
                type="text" 
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm" 
                :placeholder="$t('supplier_register.business_license_placeholder')"
              />
            </div>
          </div>
        </div>

        <!-- Factory Address -->
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {{ $t('supplier_register.factory_address') }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-lg">location_on</span>
            </div>
            <textarea 
              v-model="form.factory_address" 
              rows="2"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs sm:text-sm resize-none" 
              :placeholder="$t('supplier_register.factory_address_placeholder')"
            ></textarea>
          </div>
        </div>

        <!-- Terms Checkbox -->
        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
          <input 
            v-model="form.accept_terms" 
            type="checkbox" 
            id="accept_terms"
            class="mt-0.5 w-4 h-4 text-indigo-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 cursor-pointer"
            required
          />
          <label for="accept_terms" class="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            {{ $t('supplier_register.terms_agreement') }}
            <a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline" @click.prevent>{{ $t('supplier_register.terms_link') }}</a>
            {{ $t('supplier_register.terms_and') }}
            <a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline" @click.prevent>{{ $t('supplier_register.privacy_link') }}</a>
          </label>
        </div>

        <!-- Submit Button (Indigo/Purple Brand Gradient) -->
        <button
          type="submit"
          :disabled="loading || !form.accept_terms"
          class="w-full text-white font-bold py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span v-if="loading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          <span v-else class="text-sm sm:text-base">{{ $t('supplier_register.submit') }}</span>
          <span v-if="!loading" class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </form>

      <!-- Footer Text -->
      <div class="pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ $t('supplier_register.have_account') }}
          <button @click="$router.push('/login')" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">
            {{ $t('supplier_register.login_now') }}
          </button>
        </p>
      </div>
    </div>

    <!-- Bottom Copyright Footer -->
    <div class="fixed bottom-4 left-0 right-0 text-center text-xs text-slate-400 dark:text-slate-500 z-10">
      <p>{{ $t('auth.footer') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { useTheme } from '../../composables/useTheme'
import { authService } from '../../api/authService.js'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()

// Form State
const form = ref({
  full_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  country_code: '+86',
  company_name: '',
  category: '',
  factory_address: '',
  business_license: '',
  accept_terms: false
})

const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Methods
const handleSubmit = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  // Validate passwords match
  if (form.value.password !== form.value.password_confirmation) {
    errorMsg.value = 'Password and confirmation password do not match.'
    return
  }

  // Validate password length
  if (form.value.password.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters.'
    return
  }

  loading.value = true

  try {
    await authService.registerSupplier({
      full_name: form.value.full_name,
      email: form.value.email,
      password: form.value.password,
      phone: form.value.phone || null,
      country_code: form.value.country_code,
      company_name: form.value.company_name,
      category: form.value.category || null,
      factory_address: form.value.factory_address || null,
      business_license: form.value.business_license || null
    })
    
    successMsg.value = 'Registration submitted successfully! Your account is pending verification. Please login with your credentials.'
    
    // Reset form
    form.value = {
      full_name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
      country_code: '+86',
      company_name: '',
      category: '',
      factory_address: '',
      business_license: '',
      accept_terms: false
    }

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
