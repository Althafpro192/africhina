<template>
  <div class="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="glass-card py-8 px-4 sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input id="email" v-model="email" name="email" type="email" required class="input-3d block w-full sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input id="password" v-model="password" name="password" type="password" required class="input-3d block w-full sm:text-sm" />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button type="submit" class="btn-primary w-full flex justify-center">
              Sign in
            </button>
          </div>
          
          <div class="text-center mt-4">
             <router-link to="/register" class="text-primary hover:text-primary-hover text-sm font-medium">Don't have an account? Register</router-link>
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
const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  try {
    error.value = '';
    const response = await api.post('/auth/login', { email: email.value, password: password.value });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    if (response.data.user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  }
};
</script>