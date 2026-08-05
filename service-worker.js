const VERSION = "V45.5.11";
const CACHE_NAME = "planning-dojo-club-v45-5-11";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./mobile-data.js",
  "./manifest.webmanifest",
  "./version.json",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_SHELL.map(url =>
        cache.add(new Request(url, { cache: "reload" })).catch(() => null)
      ))
    )
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

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});


self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const mutable = (
    event.request.mode === "navigate" ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/mobile-data.js") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/app.css") ||
    url.pathname.endsWith("/version.json") ||
    url.pathname.endsWith("/service-worker.js")
  );

  if (mutable) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          const copie = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copie));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copie = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copie));
        return response;
      });
    })
  );
});
