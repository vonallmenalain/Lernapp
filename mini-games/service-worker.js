const APP_VERSION = "2026-09-19-23";
const CACHE_PREFIX = "lernapp-mini-";
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const FALLBACK_DOCUMENT = "./index.html";
const NETWORK_TIMEOUT_MS = 3500;

/*
 * Der Service Worker der Mini-Games.
 * ---------------------------------------------------------------------------
 * ERZEUGT von scripts/generate-mini-games.mjs – nicht von Hand ändern. Die
 * Liste unten ist genau das, was die Seiten unter mini-games/ laden; sie
 * entsteht aus ihnen, damit sie nicht auseinanderlaufen kann.
 *
 * Er bedient nur diesen Ordner (der Pfad bestimmt den Bereich), der Service
 * Worker der App eine Ebene höher weiterhin alles andere. Beide haben eigene
 * Caches und stehen sich nicht im Weg.
 */
const FIREBASE_SDK = [
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore-compat.js"
];

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./backpack.html",
  "./strandschatz.html",
  "./kacheln.html",
  "./wasfehlt.html",
  "./schwarmfokus.html",
  "./fischteich.html",
  "./signal.html",
  "./kartenmerker.html",
  "./blaetter.html",
  "./turmbau.html",
  "./doppelt.html",
  "./zahlengleis.html",
  "../highscore.js?v=2026-09-19-23",
  "../firebase.js?v=2026-09-19-23",
  "../mini-games.js?v=2026-09-19-23",
  "../pwa.js?v=2026-09-19-23",
  "../styles.css?v=2026-09-19-23",
  "./app.webmanifest?v=2026-09-19-23",
  "../entitlement.js?v=2026-09-19-23",
  "../kids.js?v=2026-09-19-23",
  "../train-art.js?v=2026-09-19-23",
  "../train-scenes.js?v=2026-09-19-23",
  "../game-cloud.js?v=2026-09-19-23",
  "../journey-plan.js?v=2026-09-19-23",
  "../game-shell.js?v=2026-09-19-23",
  "../rucksack.js?v=2026-09-19-23",
  "../strand-art.js?v=2026-09-19-23",
  "../strandschatz.js?v=2026-09-19-23",
  "../kacheln.js?v=2026-09-19-23",
  "../wasfehlt.js?v=2026-09-19-23",
  "../schwarmfokus.js?v=2026-09-19-23",
  "../fischteich.js?v=2026-09-19-23",
  "../signal.js?v=2026-09-19-23",
  "../kartenmerker.js?v=2026-09-19-23",
  "../blaetter.js?v=2026-09-19-23",
  "../turmbau.js?v=2026-09-19-23",
  "../doppelt.js?v=2026-09-19-23",
  "../zahlengleis.js?v=2026-09-19-23",
  "../icons/mini-32.png",
  "../icons/mini-180.png",
  "../icons/mini-192.png",
  "../icons/mini-512.png",
  "../icons/mini-maskable-192.png",
  "../icons/mini-maskable-512.png"
];

async function addOpaque(cache, url) {
  const response = await fetch(url, { mode: "no-cors" });
  await cache.put(url, response);
}

// Jede Datei einzeln: Ein Aussetzer am Mobilnetz darf nicht die ganze
// Installation umwerfen – sonst entstünde gar kein Cache.
async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled([
    ...CORE_ASSETS.map((asset) => cache.add(asset)),
    ...FIREBASE_SDK.map((url) => addOpaque(cache, url))
  ]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Netz zu langsam")), NETWORK_TIMEOUT_MS);
    fetch(request).then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function fetchAndStore(cache, request) {
  const response = await fetchWithTimeout(request);
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function cacheFirst(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  return fetchAndStore(cache, event.request);
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(event.request);
  if (!cached) return fetchAndStore(cache, event.request);
  event.waitUntil(fetchAndStore(cache, event.request).catch(() => {}));
  return cached;
}

async function documentFirstFromCache(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(event.request, { ignoreSearch: true });
  if (cached) {
    event.waitUntil(fetchAndStore(cache, event.request).catch(() => {}));
    return cached;
  }
  try {
    return await fetchAndStore(cache, event.request);
  } catch (error) {
    const fallback = await cache.match(FALLBACK_DOCUMENT);
    if (fallback) return fallback;
    throw error;
  }
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    if (FIREBASE_SDK.includes(requestUrl.href)) event.respondWith(cacheFirst(event));
    return;
  }

  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(documentFirstFromCache(event));
    return;
  }

  // Die Fassung steht im Namen: Ändert sie sich, ändert sich der Schlüssel.
  if (requestUrl.searchParams.has("v")) {
    event.respondWith(cacheFirst(event));
    return;
  }

  if (event.request.destination === "image" || event.request.destination === "font") {
    event.respondWith(cacheFirst(event));
    return;
  }

  if (["script", "style", "manifest"].includes(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event));
  }
});
