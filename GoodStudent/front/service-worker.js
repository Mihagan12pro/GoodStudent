const CACHE_NAME = 'attendance-app-v1';
const ASSETS = [
  '/',
  '/pages/qr.html',
  '/styles/styles.css',
  '/qr.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});
self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if (url.pathname.startsWith('/api/')) {
    evt.respondWith(fetch(evt.request).catch(() => caches.match(evt.request)));
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(matched => matched || fetch(evt.request).catch(()=>caches.match('/pages/qr.html')))
  );
});
