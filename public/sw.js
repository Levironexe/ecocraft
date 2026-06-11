const CACHE_NAME = 'ecocraft-v1';

const PRECACHE_MODELS = [
  '/models/bang-keo.glb',
  '/models/bua-nho.glb',
  '/models/but-long.glb',
  '/models/chai-nhua.glb',
  '/models/chai-thuy-tinh.glb',
  '/models/day-ruy-bang.glb',
  '/models/dua-go.glb',
  '/models/giay-bao.glb',
  '/models/keo-cat.glb',
  '/models/keo-dan.glb',
  '/models/loi-giay.glb',
  '/models/lon-nuoc.glb',
  '/models/nap-chai.glb',
  '/models/ong-hut.glb',
  '/models/son.glb',
  '/models/thung-carton.glb',
  '/models/vai-vun.glb',
  '/models/vo-trung.glb',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching models...');
      return cache.addAll(PRECACHE_MODELS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.glb')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
