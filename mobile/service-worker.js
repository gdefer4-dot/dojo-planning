const CACHE_NAME = 'planning-dojo-club-v40-1';
const APP_SHELL = ['./','./index.html','./app.css','./planning-data.js','./app.js','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
 if (event.request.method !== 'GET') return;
 if (event.request.mode === 'navigate') {
   event.respondWith(fetch(event.request).then(r => { const c=r.clone(); caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',c)); return r; }).catch(()=>caches.match('./index.html')));
   return;
 }
 event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(r => { const c=r.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(event.request,c)); return r; })));
});
