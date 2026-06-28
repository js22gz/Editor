const CACHE_NAME = 'Editor-v4';  

const urlsToCache = [
	'./',
	'index.html',
	'manifest.json',
	'favicon.ico',
	'logo192.png',
	'logo512.png',
];

self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(CACHE_NAME)
			.then(c => c.addAll(urlsToCache))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', e => {
	e.waitUntil(
		caches.keys()
			.then(names => Promise.all(
				names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
			))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('sync', e => {
	if (e.tag === 'state-refresh') {
		e.waitUntil(
			self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
				.then(clients => clients.forEach(c => c.postMessage({ type: 'SW_SYNC_REFRESH' })))
		);
	}
});

self.addEventListener('fetch', e => {
	if (e.request.mode === 'navigate') {
		// Network-first so tab reloads after discard pick up the latest restore logic
		e.respondWith(
			fetch(e.request).then(networkResponse => {
				if (networkResponse && networkResponse.ok) {
					const clone = networkResponse.clone();
					caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
				}
				return networkResponse;
			}).catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
		);
		return;
	}

	e.respondWith(
		caches.match(e.request).then(cached => cached || fetch(e.request))
	);
});
