import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import './style.css';

import en from './locales/en.json';
import id from './locales/id.json';
import zh from './locales/zh.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, id, zh }
});

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');