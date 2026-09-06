const APP_VERSION = "2026-09-13-2";
const CACHE_PREFIX = "lernapp-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const ASSET_VERSION_QUERY = `?v=${APP_VERSION}`;
const FALLBACK_DOCUMENT = "./index.html";

// Nach so vielen Millisekunden gilt das Netz als zu zäh und der Cache
// antwortet. Ohne diese Schranke wartet ein Abruf am schlechten Mobilnetz
// beliebig lange – die installierte App bliebe dabei auf einem leeren Bild
// stehen, und von aussen sieht das aus, als starte sie gar nicht.
const NETWORK_TIMEOUT_MS = 3500;

// Das Firebase-SDK liegt auf einem fremden Server. Ohne eigene Kopie hängen
// die drei Zeilen im <head>-losen Seitenfuss am Netz: sie stehen vor allen
// eigenen Skripten, und solange sie nicht antworten, baut keine Seite ihre
// Bühne auf. Deshalb kommen sie mit in den Cache.
const FIREBASE_SDK = [
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore-compat.js"
];

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./arukone.html",
  "./backpack.html",
  "./blaetter.html",
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
  "./kacheln.html",
  "./fischteich.html",
  "./freiefahrt.html",
  "./turmbau.html",
  "./zahlengleis.html",
  "./signal.html",
  "./wasfehlt.html",
  "./faesser.html",
  "./doppelt.html",
  `./styles.css${ASSET_VERSION_QUERY}`,
  `./spatial-puzzles.js${ASSET_VERSION_QUERY}`,
  `./kids.js${ASSET_VERSION_QUERY}`,
  `./highscore.js${ASSET_VERSION_QUERY}`,
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
  `./kacheln.js${ASSET_VERSION_QUERY}`,
  `./fischteich.js${ASSET_VERSION_QUERY}`,
  `./freiefahrt.js${ASSET_VERSION_QUERY}`,
  `./blaetter.js${ASSET_VERSION_QUERY}`,
  `./turmbau.js${ASSET_VERSION_QUERY}`,
  `./zahlengleis.js${ASSET_VERSION_QUERY}`,
  `./signal.js${ASSET_VERSION_QUERY}`,
  `./wasfehlt.js${ASSET_VERSION_QUERY}`,
  `./faesser.js${ASSET_VERSION_QUERY}`,
  `./doppelt.js${ASSET_VERSION_QUERY}`,
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

// Fremde Antworten sind undurchsichtig und tragen den Status 0. cache.add()
// lehnt sie ab, cache.put() nimmt sie an – deshalb dieser Umweg.
async function addOpaque(cache, url) {
  const response = await fetch(url, { mode: "no-cors" });
  await cache.put(url, response);
}

// Jede Datei wird einzeln abgelegt. Vorher lag hier ein cache.addAll() über
// alle knapp fünfzig Adressen: ein einziger Aussetzer am Mobilnetz liess die
// ganze Installation scheitern, es entstand gar kein Cache, und die auf den
// Startbildschirm gelegte App startete ohne Netz überhaupt nicht mehr.
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

function fetchWithTimeout(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Netz zu langsam")), NETWORK_TIMEOUT_MS);
    fetch(request).then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function fetchAndStore(cache, request) {
  const response = await fetchWithTimeout(request);
  // Undurchsichtige Antworten (Status 0) sind brauchbar und gehören mit in
  // den Cache; Weiterleitungen und Fehlerseiten nicht. cache.put() lehnt
  // manche Antwort ab – das darf den Abruf nicht umwerfen.
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

// Der Start der installierten App. Erst der Cache, dann im Hintergrund
// auffrischen: das Bild ist sofort da, auch ohne Netz. Eine neue Fassung
// kommt über den Versionswechsel des Service Workers, der die Seite von
// sich aus neu lädt – vorher fragte hier jeder Start zuerst das Netz und
// blieb an einer lahmen Verbindung hängen.
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
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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

  // styles.css?v=… und app.js?v=… tragen die Fassung im Namen: ändert sich
  // die Version, ändert sich der Schlüssel. Der Cache darf also direkt
  // antworten, ohne vorher das Netz zu fragen.
  if (requestUrl.searchParams.has("v")) {
    event.respondWith(cacheFirst(event));
    return;
  }

  const cacheFirstDestinations = new Set(["image", "font"]);
  if (cacheFirstDestinations.has(event.request.destination)) {
    event.respondWith(cacheFirst(event));
    return;
  }

  const revalidateDestinations = new Set(["script", "style", "manifest"]);
  if (revalidateDestinations.has(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event));
  }
});
