// MatchMyFit service worker: precache app shell, runtime caching for same-origin GETs.
const CACHE = 'mmf-v6';
const PRECACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/i18n.js',
  './js/matching.js',
  './js/camera.js',
  './js/tour.js',
  './js/locales/de.js',
  './js/locales/en.js',
  './js/locales/tr.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Resilient precache: one missing file must not fail the whole install.
    await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first so online users always get the latest version; cache is the offline fallback
  event.respondWith(req.mode === 'navigate' ? networkFirstNavigation(req) : networkFirst(req));
});

async function networkFirstNavigation(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetchWithTimeout(req, 4000);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) ||
      (await cache.match('./index.html')) ||
      Response.error();
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetchWithTimeout(req, 4000);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}

// Slow networks fall back to the cache instead of hanging
function fetchWithTimeout(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    // no-cache: revalidate with the server instead of using the browser's HTTP cache
    fetch(req.mode === 'navigate' ? req.url : req, { cache: 'no-cache' }).then((res) => { clearTimeout(timer); resolve(res); }, (err) => { clearTimeout(timer); reject(err); });
  });
}
