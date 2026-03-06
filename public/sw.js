const STATIC_CACHE = 'aura-static-v2';
const HTML_CACHE = 'aura-html-v1';
const OFFLINE_FALLBACK = '/';

const APP_SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.png',
  '/sketchbook.png',
  '/texture.png',
];

const ASSET_EXTENSIONS = /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== HTML_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/functions/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || ASSET_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirstAsset(request));
  }
});

async function networkFirstPage(request) {
  const cache = await caches.open(HTML_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const fallback = await caches.match(OFFLINE_FALLBACK);

    if (fallback) {
      return fallback;
    }

    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}
