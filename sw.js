const VERSION = 'v1.0.5'; // SETIAP KALI UPDATE KODE, NAIKKAN ANGKA INI
const CACHE_NAME = `absen-kominfo-${VERSION}`;

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Paksa versi baru langsung aktif tanpa nunggu tab ditutup
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        'index.html',
        'app.js',
        'manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
