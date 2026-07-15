import { createApp } from 'vue'
import './style.css' // File CSS Tailwind kamu
import App from './App.vue'
import router from './router' // <-- Tambahkan ini

const app = createApp(App)

app.use(router) // <-- Daftarkan router
app.mount('#app')