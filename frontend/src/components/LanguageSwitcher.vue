<template>
  <div class="relative">
    <select v-model="locale" class="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer">
      <option value="en">EN</option>
      <option value="id">ID</option>
      <option value="zh">ZH</option>
    </select>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
</script>
