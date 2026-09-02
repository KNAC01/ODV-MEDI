const CACHE_NAME = 'delico-odv-v43';
const ASSETS = ['./index.html', './app_data.json', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const esNavegacion = event.request.mode === 'navigate';
  const esMismoOrigen = event.request.url.startsWith(self.location.origin);
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        if (esMismoOrigen) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(event.request).then((cached) => {
        if (cached) return cached;
        if (esNavegacion) return caches.match('./index.html');
        return Response.error();
      }))
  );
});
