// Service worker minimo: rende la pagina installabile e la apre anche con rete debole.
const CACHE = 'laboratori-v1';
const FILES = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icon-64.png', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './qrcode.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// prima la rete (così le modifiche a config.js arrivano subito), poi la copia salvata
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
