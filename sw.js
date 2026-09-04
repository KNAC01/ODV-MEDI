// Service worker de Délico ODV — permite instalar la app y usarla sin conexión.
// IMPORTANTE: cada vez que se suba una versión nueva de index.html, sube este archivo
// también y cambia el número de CACHE_NAME (por ejemplo v31, v32...) para que los
// celulares descarguen la versión nueva en vez de quedarse con la vieja en caché.
const CACHE_NAME = 'delico-odv-v66';
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

// Red primero (para traer la versión más nueva cuando hay internet), y si falla, usa el caché (modo sin conexión).
// Importante: el "de vuelta a index.html" solo debe pasar para la página misma (navegación),
// nunca para otros archivos (como las librerías externas de exportar Excel/PDF) — si no, un archivo
// externo que falla podría terminar mostrando el HTML de la app y romperse con un error de sintaxis.
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
