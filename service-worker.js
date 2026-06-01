const CACHE_NAME = "lernapp-pwa-v6";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./arukone.html",
  "./bimaru.html",
  "./hidoku.html",
  "./kakuro.html",
  "./shikaku.html",
  "./sudoku.html",
  "./zahlenzauber.html",
  "./wortdetektiv.html",
  "./styles.css",
  "./app.js",
  "./firebase.js",
  "./pwa.js",
  "./app.webmanifest",
  "./icons/icon-32.png",
  "./icons/apple-touch-icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || cache.match("./index.html");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  const cacheableDestinations = new Set(["document", "script", "style", "image", "font", "manifest"]);
  if (cacheableDestinations.has(event.request.destination)) {
    event.respondWith(cacheFirst(event.request));
  }
});
