<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const isSubmitting = ref(false);

const handlePasswordChange = async () => {
  error.value = '';
  success.value = '';

  if (!newPassword.value) {
    error.value = 'Please enter a new password.';
    return;
  }

  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters long.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  isSubmitting.value = true;
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/v1/auth/change-password', {
      newPassword: newPassword.value
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }

    success.value = 'Password updated successfully! Redirecting to dashboard...';
    setTimeout(() => {
      const user = res.data.user || {};
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/buyer/dashboard');
      }
    }, 1500);
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update password. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
          <span class="material-symbols-outlined text-amber-400 text-2xl">lock_reset</span>
        </div>
        <h2 class="text-xl font-bold text-slate-100">Set New Password</h2>
        <p class="text-xs text-slate-400 mt-1">
          You are logging in with a temporary password. Please set a new permanent password to continue.
        </p>
      </div>

      <form @submit.prevent="handlePasswordChange" class="space-y-4">
        <div v-if="error" class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
          {{ error }}
        </div>

        <div v-if="success" class="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">
          {{ success }}
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">New Permanent Password</label>
          <input 
            v-model="newPassword" 
            type="password" 
            required 
            placeholder="Enter at least 6 characters"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            required 
            placeholder="Re-enter new password"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/20"
        >
          {{ isSubmitting ? 'Updating Password...' : 'Save & Continue' }}
        </button>
      </form>
    </div>
  </div>
</template>
