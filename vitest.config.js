import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['backend/__tests__/**/*.test.js', 'frontend/__tests__/**/*.test.js'],
    alias: {
      '@': path.resolve(__dirname, './frontend/src')
    }
  }
});
