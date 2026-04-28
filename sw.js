const VERSION = 'v1.0.3'; // Ganti ke v1.0.4 jika Bapak update kode lagi nanti
const CACHE_NAME = `absen-kominfo-${VERSION}`;

const assets = [
  './',
  'index.html',
  'app.js',
  'manifest.json'
];

// Tahap Install: Simpan file ke cache
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Paksa SW baru untuk langsung aktif
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assets))
  );
});

// Tahap Aktivasi: Hapus cache versi lama agar tidak menumpuk
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Tahap Fetch: Ambil dari cache, jika gagal baru ambil dari internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
