// 원신 대난투: what the installed app keeps on the device.
// The page itself comes from the network first, so every update arrives, with the saved copy as a fallback when offline.
// Pictures and sounds come from the saved copy when there is one, otherwise from the network, and are saved as they are first used.
// Other sites (the fonts, the online-play service) are left alone. VER changes with every upload, which clears the old copies.
const VER = '20261028215256', CACHE = 'brawl-' + VER;
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
  if (req.method !== 'GET' || url.origin !== location.origin || req.headers.has('range')) return;
  const save = r => { if (r && r.status === 200) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; };
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
});
