// 원신 대난투: the installed app's helper. It keeps only the page itself and the app's icons on the device:
// the page comes from the network first, so every update arrives, with the saved copy as a fallback when offline.
// Pictures and sounds are NOT handled here: they go to the network and the browser's own cache, exactly as on the web site.
// (Serving them from here broke the character frames in the iPhone app: they never arrived.)
// VER changes with every upload; the new version clears the old saved copies, including pictures saved by the first version.
const VER = '20261028222615', CACHE = 'brawl-' + VER;
const SHELL = ['./', './manifest.webmanifest', './img/app/icon-192.png', './img/app/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('brawl-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode !== 'navigate') return;   // only the page itself; everything else goes straight to the network
  e.respondWith(fetch(req).then(r => {
    if (r && r.status === 200) { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./', cp)); }
    return r;
  }).catch(() => caches.match('./')));
});
