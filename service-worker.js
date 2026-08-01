/* Panklaar service worker — offline app-shell.
   Verhoog CACHE bij een nieuwe versie, anders houden telefoons de oude. */
const CACHE = 'panklaar-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // Externe calls (bv. de Anthropic API) nooit onderscheppen of cachen.
  if(url.origin !== location.origin) return;
  // App-shell: eerst cache, anders netwerk; index.html netwerk-eerst voor updates.
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
