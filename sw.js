// Service worker de Délico ODV — permite instalar la app y usarla sin conexión.
// IMPORTANTE: cada vez que se suba una versión nueva de index.html, sube este archivo
// también y cambia el número de CACHE_NAME (por ejemplo v31, v32...) para que los
// celulares descarguen la versión nueva en vez de quedarse con la vieja en caché.
const CACHE_NAME = 'delico-odv-v30';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

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

// Red primero (para traer la versión más nueva cuando hay internet), y si falla, usa el caché (modo sin conexión).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return resp;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
