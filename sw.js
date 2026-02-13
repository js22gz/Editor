const CACHE_NAME = 'Editor-v2';

const urlsToCache = [
  './',
  'index.html',
  'manifest.json'
];

// Install - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version immediately
      if (cachedResponse) {
        // But also fetch fresh version in background
        const fetchPromise = fetch(event.request)
          .then(freshResponse => {
            // Update cache with fresh response
            if (freshResponse && freshResponse.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, freshResponse.clone());
              });
            }
            return freshResponse;
          })
          .catch(() => cachedResponse); // Fallback to cached on error
        
        return cachedResponse;
      }
      
      // No cache - fetch from network
      return fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response && response.ok && event.request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
    })
  );
});
