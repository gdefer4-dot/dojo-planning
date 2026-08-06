self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.map(nom => caches.delete(nom)));
    await self.clients.claim();

    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of clients) {
      client.postMessage({ type: "ANCIEN_CACHE_SUPPRIME" });
    }

    await self.registration.unregister();
  })());
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request, { cache: "no-store" }));
});