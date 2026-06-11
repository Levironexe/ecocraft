const CACHE_NAME = 'ecocraft-v2';

const SUPABASE_STORAGE = 'https://oxazgmvqiacyvbnviesf.supabase.co/storage/v1/object/public/models';

const PRECACHE_MODELS = [
  `${SUPABASE_STORAGE}/materials/chai-nhua.glb`,
  `${SUPABASE_STORAGE}/materials/chai-thuy-tinh.glb`,
  `${SUPABASE_STORAGE}/materials/day-ruy-bang.glb`,
  `${SUPABASE_STORAGE}/materials/dua-go.glb`,
  `${SUPABASE_STORAGE}/materials/giay-bao.glb`,
  `${SUPABASE_STORAGE}/materials/loi-giay.glb`,
  `${SUPABASE_STORAGE}/materials/lon-nuoc.glb`,
  `${SUPABASE_STORAGE}/materials/nap-chai.glb`,
  `${SUPABASE_STORAGE}/materials/ong-hut.glb`,
  `${SUPABASE_STORAGE}/materials/thung-carton.glb`,
  `${SUPABASE_STORAGE}/materials/vai-vun.glb`,
  `${SUPABASE_STORAGE}/materials/vo-trung.glb`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching material models from Supabase...');
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
  const url = event.request.url;

  // Cache-first for any GLB file (Supabase storage or local)
  if (url.endsWith('.glb')) {
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

  // Skip API routes
  if (url.includes('/api/')) return;

  // Network-first for everything else
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
