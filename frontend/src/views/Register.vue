<template>
  <div class="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="glass-card py-8 px-4 sm:px-10">
        <form class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label class="block text-sm font-medium text-gray-700">Full Name</label>
            <div class="mt-1">
              <input v-model="form.full_name" type="text" required class="input-3d block w-full sm:text-sm" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Company Name</label>
            <div class="mt-1">
              <input v-model="form.company_name" type="text" required class="input-3d block w-full sm:text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input v-model="form.email" type="email" required class="input-3d block w-full sm:text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input v-model="form.password" type="password" required class="input-3d block w-full sm:text-sm" />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button type="submit" class="btn-primary w-full flex justify-center">
              Register
            </button>
          </div>
          
          <div class="text-center mt-4">
             <router-link to="/login" class="text-primary hover:text-primary-hover text-sm font-medium">Already have an account? Login</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const router = useRouter();
const form = ref({
  full_name: '',
  company_name: '',
  email: '',
  password: '',
  country: 'Nigeria',
  phone: ''
});
const error = ref('');

const handleRegister = async () => {
  try {
    error.value = '';
    await api.post('/auth/register', form.value);
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed';
  }
};
</script>
