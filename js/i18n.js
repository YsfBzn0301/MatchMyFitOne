// Lightweight i18n: locale files are ES modules exporting a flat key -> text object.

export const LANGS = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

const STORAGE_KEY = 'mmf-lang';
const cache = {};
let current = 'de';

async function load(code) {
  if (!cache[code]) {
    try {
      cache[code] = (await import(`./locales/${code}.js`)).default || {};
    } catch {
      cache[code] = {};
    }
  }
  return cache[code];
}

function detect() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
  if (saved && LANGS.some(l => l.code === saved)) return saved;
  const nav = (navigator.languages || [navigator.language || 'de'])
    .map(l => l.slice(0, 2).toLowerCase());
  return nav.find(c => LANGS.some(l => l.code === c)) || 'de';
}

export async function initI18n() {
  await load('en'); // fallback
  await setLang(detect(), { silent: true });
  return current;
}

export async function setLang(code, { silent = false } = {}) {
  if (!LANGS.some(l => l.code === code)) code = 'de';
  await load(code);
  current = code;
  try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  document.documentElement.lang = code;
  applyTranslations();
  if (!silent) window.dispatchEvent(new CustomEvent('langchange', { detail: code }));
}

export function getLang() {
  return current;
}

export function t(key, params = {}) {
  let str = cache[current]?.[key] ?? cache.en?.[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.split(`{${k}}`).join(String(v));
  }
  return str;
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s && s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
}
