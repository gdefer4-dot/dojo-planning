const CACHE_NAME = "planning-dojo-club-v42-1";
const APP_SHELL = [
  "./",
  "./index.html?v=420",
  "./app.css?v=420",
  "./app.js?v=420",
  "./mobile-data.js?v=4201",
  "./manifest.webmanifest?v=420",
  "./apple-touch-icon.png?v=420",
  "./icon-192.png?v=420",
  "./icon-512.png?v=420",
  "./icon-maskable-512.png?v=420"
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
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html?v=420", copy));
          return response;
        })
        .catch(() => caches.match("./index.html?v=420"))
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
