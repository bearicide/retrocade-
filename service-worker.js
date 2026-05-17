const CACHE_NAME = 'retrocade-v4-motion-pass';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/arcade.css',
  './js/arcade.js',
  './assets/bg/neon-grid.svg',
  './assets/branding/retrocade-logo.svg',
  './assets/icons/icon.svg',
  './assets/ui/mb-ui-control-kit.svg',
  './games/snake.html',
  './games/breakout.html',
  './games/invaders.html',
  './games/asteroids.html',
  './games/pong.html',
  './games/claw.html',
  './games/bubble.html',
  './games/memory.html',
  './games/racer.html',
  './games/rhythm.html',
  './games/blocks.html',
  './games/frog.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        CORE_ASSETS.map(asset => cache.add(asset))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isPageRequest = event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.html') || requestUrl.pathname.endsWith('/');

  if (isSameOrigin && isPageRequest) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || cache.match('./index.html');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const freshPromise = fetch(request)
    .then(response => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || freshPromise;
}
