import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'africhina.saktiku.my.id',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      // Default Laravel `php artisan serve` port is 8000.
      // If you run Laravel via `php artisan serve --port=5000` (matches the
      // production Dockerfile), change the targets below to `:5000`.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

