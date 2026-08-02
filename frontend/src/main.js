import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n.js';
import './style.css';

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');

// Initialize Tawk.to if ID is provided in env
const tawkId = import.meta.env.VITE_TAWKTO_ID;
if (tawkId) {
  try {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    (function(){
      var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = `https://embed.tawk.to/${tawkId}/default`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    })();
  } catch (e) {
    console.warn('Tawk.to initialization failed:', e);
  }
}
