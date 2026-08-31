const VERSION = "V49.0.31";
const CACHE_NAME = "planning-dojo-club-v49-0-31";
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

  const variable =
    event.request.mode === "navigate" ||
    /\/(index\.html|mobile-data\.js|app\.js|app\.css|version\.json|manifest\.webmanifest|service-worker\.js)$/.test(url.pathname);

  if (variable) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          if (response && response.ok) {
            const copie = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copie));
          }
          return response;
        })
        .catch(async () =>
          (await caches.match(event.request)) ||
          (await caches.match("./index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        if (response && response.ok) {
          const copie = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copie));
        }
        return response;
      })
    )
  );
});