import translate from 'google-translate-api-x';
import logger from '../config/logger.js';

const MAX_CACHE_SIZE = 1000;
const translationCache = new Map();

/**
 * Utility to wrap a promise with a timeout deadline.
 */
function withTimeout(promise, ms, fallbackValue) {
  let timer = null;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue);
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Normalizes text for cache keys.
 */
function getCacheKey(text) {
  return typeof text === 'string' ? text.trim() : '';
}

/**
 * Returns cached translations if present in memory.
 */
export function getCachedTranslations(text) {
  const key = getCacheKey(text);
  if (!key) return null;
  return translationCache.get(key) || null;
}

/**
 * Stores translation object in cache, removing oldest item if max size reached.
 */
export function setCachedTranslations(text, translations) {
  const key = getCacheKey(text);
  if (!key || !translations) return;

  if (translationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }

  translationCache.set(key, translations);
}

/**
 * Translates single text string to a target language with timeout protection.
 */
async function translateSingle(text, targetConfig, timeoutMs = 3000) {
  const { code, key, forceTo } = targetConfig;
  
  const execution = (async () => {
    try {
      const opts = { to: code, autoCorrect: true };
      if (forceTo) opts.forceTo = true;
      const res = await translate(text, opts);
      return { lang: key, text: res.text || text };
    } catch (err) {
      logger.warn(`Translation to ${code} failed: ${err.message}`);
      return { lang: key, text };
    }
  })();

  return withTimeout(execution, timeoutMs, { lang: key, text });
}

/**
 * Bulk translates text into target languages ('en', 'id', 'zh', 'fr').
 * Returns cached value if available, otherwise performs async requests.
 */
export async function getTranslations(text, timeoutMs = 3000) {
  const safeText = typeof text === 'string' ? text.trim() : '';
  if (!safeText) return {};

  const cached = getCachedTranslations(safeText);
  if (cached) {
    return cached;
  }

  const targets = [
    { code: 'en', key: 'en' },
    { code: 'id', key: 'id' },
    { code: 'zh-CN', key: 'zh', forceTo: true },
    { code: 'fr', key: 'fr' }
  ];
  const promises = targets.map((target) => translateSingle(safeText, target, timeoutMs));

  const results = await Promise.all(promises);
  const translations = {};
  for (const res of results) {
    translations[res.lang] = res.text;
  }

  setCachedTranslations(safeText, translations);
  return translations;
}

export default {
  getCachedTranslations,
  setCachedTranslations,
  getTranslations
};
