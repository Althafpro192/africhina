import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
 server: {
    host: '0.0.0.0', // Agar bisa diakses via IP
    port: 5173,
    // Tambahkan baris di bawah ini:
    allowedHosts: [
      'africhina.saktiku.my.id', // Domain kamu
      'localhost',
      '127.0.0.1'
    ]
  },
})
