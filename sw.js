const CACHE = 'training-log-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate' || e.request.url.endsWith('index.html') || e.request.url.endsWith('/');
  if (isPage) {
    // network first, so a new upload shows up next time the app is opened online
    e.respondWith(
      fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
        .catch(() => caches.match(e.request, {ignoreSearch:true}).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match('./index.html')))
  );
});
