/**
 * Global vue-i18n instance.
 *
 * Centralised here so non-component modules (composables, plain JS utilities)
 * can perform translations without going through `useI18n()`. The Vue app
 * mounts this same instance in `main.js`.
 */
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import id from './locales/id.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';

const savedLocale =
  (typeof localStorage !== 'undefined' && localStorage.getItem('locale')) || 'en';

export const SUPPORTED_LOCALES = ['en', 'id', 'zh', 'fr'];

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, id, zh, fr },
});

export default i18n;
