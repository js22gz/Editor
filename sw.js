const CACHE_NAME = 'Editor-v2';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'favicon.ico',
  'logo192.png',
  'logo512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // HTML network-first, fallback to cache (true offline)
    e.respondWith(fetch(e.request).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(fresh => {
      if (fresh.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, fresh.clone()));
      return fresh;
    }))
  );
});
