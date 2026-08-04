const CACHE_NAME = "planning-dojo-club-v41-1";
const APP_SHELL = [
  "./",
  "./index.html?v=411",
  "./app.css?v=411",
  "./app.js?v=411",
  "./mobile-data.js?v=411",
  "./manifest.webmanifest?v=411",
  "./apple-touch-icon.png?v=411",
  "./icon-192.png?v=411",
  "./icon-512.png?v=411",
  "./icon-maskable-512.png?v=411"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html?v=411", copy));
          return response;
        })
        .catch(() => caches.match("./index.html?v=411"))
    );
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
