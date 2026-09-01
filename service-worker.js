const APP_VERSION = "2026-09-03-1";
const CACHE_PREFIX = "lernapp-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const ASSET_VERSION_QUERY = `?v=${APP_VERSION}`;
const FALLBACK_DOCUMENT = "./index.html";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./arukone.html",
  "./backpack.html",
  "./bimaru.html",
  "./hidoku.html",
  "./kakuro.html",
  "./memory.html",
  "./raumdetektiv.html",
  "./shikaku.html",
  "./wortdetektiv.html",
  "./buchstaben.html",
  "./kartenmerker.html",
  "./schwarmfokus.html",
  "./strandschatz.html",
  "./weichen.html",
  "./tiersprung.html",
  `./styles.css${ASSET_VERSION_QUERY}`,
  `./spatial-puzzles.js${ASSET_VERSION_QUERY}`,
  `./kids.js${ASSET_VERSION_QUERY}`,
  `./app.js${ASSET_VERSION_QUERY}`,
  `./train-progress.js${ASSET_VERSION_QUERY}`,
  `./train-art.js${ASSET_VERSION_QUERY}`,
  `./train-scenes.js${ASSET_VERSION_QUERY}`,
  `./train-home.js${ASSET_VERSION_QUERY}`,
  `./tiersprung.js${ASSET_VERSION_QUERY}`,
  `./game-cloud.js${ASSET_VERSION_QUERY}`,
  `./game-shell.js${ASSET_VERSION_QUERY}`,
  `./kartenmerker.js${ASSET_VERSION_QUERY}`,
  `./strand-art.js${ASSET_VERSION_QUERY}`,
  `./strandschatz.js${ASSET_VERSION_QUERY}`,
  `./schwarmfokus.js${ASSET_VERSION_QUERY}`,
  `./weichen.js${ASSET_VERSION_QUERY}`,
  `./rucksack.js${ASSET_VERSION_QUERY}`,
  `./memory.js${ASSET_VERSION_QUERY}`,
  `./firebase.js${ASSET_VERSION_QUERY}`,
  `./pwa.js${ASSET_VERSION_QUERY}`,
  `./app.webmanifest${ASSET_VERSION_QUERY}`,
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
    caches.keys()
      .then((keys) => {
        const staleKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
        return Promise.all(staleKeys.map((key) => caches.delete(key))).then(() => staleKeys.length > 0);
      })
      .then((wasUpdated) => self.clients.claim().then(() => wasUpdated))
      .then((wasUpdated) => {
        if (!wasUpdated) return undefined;
        return self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "APP_UPDATED", version: APP_VERSION });
          });
        });
      })
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === "navigate" || request.destination === "document") {
      const fallback = await cache.match(FALLBACK_DOCUMENT);
      if (fallback) return fallback;
    }

    throw error;
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

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  const networkFirstDestinations = new Set(["document", "script", "style", "manifest"]);
  if (networkFirstDestinations.has(event.request.destination)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  const cacheFirstDestinations = new Set(["image", "font"]);
  if (cacheFirstDestinations.has(event.request.destination)) {
    event.respondWith(cacheFirst(event.request));
  }
});
