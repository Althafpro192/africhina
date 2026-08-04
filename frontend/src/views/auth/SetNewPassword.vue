<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { useToast } from '../../composables/useToast';
import { useFormValidation } from '../../composables/useFormValidation';
import BaseAlert from '../../components/ui/BaseAlert.vue';

const { t } = useI18n();
const router = useRouter();
const { showToast } = useToast();
const { errors, submitGuard } = useFormValidation();

const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const isSubmitting = ref(false);

// Synthetic form object so the `match` rule can compare newPassword === confirmPassword
// (these are separate refs, not members of a single form object)
const form = computed(() => ({
  newPassword: newPassword.value,
  confirmPassword: confirmPassword.value
}));

const rules = computed(() => [
  { field: 'newPassword', required: true, minLength: 6, label: t('set_new_password.new_password_label') },
  { field: 'confirmPassword', required: true, match: 'newPassword', label: t('set_new_password.confirm_password_label') }
]);

const performPasswordChange = async () => {
  isSubmitting.value = true;
  error.value = '';
  success.value = '';

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

    success.value = t('set_new_password.success');
    setTimeout(() => {
      const user = res.data.user || {};
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/buyer/dashboard');
      }
    }, 1500);
  } catch (err) {
    error.value = err.response?.data?.message || t('set_new_password.failed');
  } finally {
    isSubmitting.value = false;
  }
};

const handlePasswordChange = () => {
  error.value = '';
  success.value = '';
  submitGuard(form.value, rules.value, performPasswordChange);
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
      <router-link to="/login" class="absolute top-4 left-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center">
        <span class="material-symbols-outlined text-sm">arrow_back</span>
      </router-link>

      <div class="text-center mb-6 mt-2">
        <div class="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
          <span class="material-symbols-outlined text-amber-400 text-2xl">lock_reset</span>
        </div>
        <h2 class="text-xl font-bold text-slate-100">{{ t('set_new_password.title') }}</h2>
        <p class="text-xs text-slate-400 mt-1">
          {{ t('set_new_password.subtitle') }}
        </p>
      </div>

      <form novalidate @submit.prevent="handlePasswordChange" class="space-y-4">
        <BaseAlert
          v-if="error"
          type="error"
          :message="error"
          :dismissible="false"
        />

        <BaseAlert
          v-if="success"
          type="success"
          :message="success"
          :dismissible="false"
        />

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">{{ t('set_new_password.new_password_label') }}</label>
          <input
            v-model="newPassword"
            type="password"
            data-field="newPassword"
            :placeholder="t('set_new_password.new_password_placeholder')"
            :class="[
              'w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors',
              errors.newPassword
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-slate-800 focus:border-amber-500'
            ]"
          />
          <p v-if="errors.newPassword" class="text-[11px] text-rose-500 mt-1 font-medium">
            {{ errors.newPassword }}
          </p>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">{{ t('set_new_password.confirm_password_label') }}</label>
          <input
            v-model="confirmPassword"
            type="password"
            data-field="confirmPassword"
            :placeholder="t('set_new_password.confirm_password_placeholder')"
            :class="[
              'w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors',
              errors.confirmPassword
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-slate-800 focus:border-amber-500'
            ]"
          />
          <p v-if="errors.confirmPassword" class="text-[11px] text-rose-500 mt-1 font-medium">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/20"
        >
          {{ isSubmitting ? t('set_new_password.submitting') : t('set_new_password.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>
