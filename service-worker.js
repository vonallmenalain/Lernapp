const APP_VERSION = "2026-10-06-30";
const CACHE_PREFIX = "lernapp-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const ASSET_VERSION_QUERY = `?v=${APP_VERSION}`;
const FALLBACK_DOCUMENT = "./index.html";

// Nach so vielen Millisekunden gilt das Netz als zu zäh und der Cache
// antwortet. Ohne diese Schranke wartet ein Abruf am schlechten Mobilnetz
// beliebig lange – die installierte App bliebe dabei auf einem leeren Bild
// stehen, und von aussen sieht das aus, als starte sie gar nicht.
const NETWORK_TIMEOUT_MS = 3500;

// Die gemalten Bilder der Bücher (bilder/buecher/…) sind gross und ändern sich
// selten. Sie liegen in einem eigenen Cache, den ein Versionswechsel der App
// nicht leert: Ein Buch, das einmal offen war, hat seine Bilder auch nach
// einem Update ohne Netz. Wird ein Bild ersetzt, braucht der Name hier eine
// neue Nummer – dann holt jedes Gerät die Bilder neu. Ein Bild darf länger
// laden als eine Seite: Fehlt es, zeigt das Buch seine Zeichnung. Die
// gemalten Postkarten (bilder/postkarten/…), Steckbriefe
// (bilder/steckbriefe/…) und die Monster der Quatschwörter (bilder/monster/…)
// liegen im selben Cache.
const BUCHBILDER_CACHE = "lernapp-buchbilder-1";
const BUCHBILDER_TIMEOUT_MS = 20000;

// Die Aufnahmen fester Texte mit Alains Stimme (stimme/…, lesen-stimme.js)
// halten es wie die Buchbilder: ein eigener Cache, den ein Versionswechsel
// nicht leert – ein Satz, der einmal zu hören war, ist es auch ohne Netz. Eine
// Datei heisst nach ihrem Text; wird derselbe Text neu gesprochen, braucht der
// Name hier eine neue Nummer. Lädt eine Aufnahme nicht, spricht die
// Gerätestimme (kids.js).
const STIMME_CACHE = "lernapp-stimme-1";
const STIMME_TIMEOUT_MS = 8000;

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
  "./admin.html",
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
  "./silbenzug.html",
  "./buchstabenhaus.html",
  "./lautekuppeln.html",
  "./stimmtdas.html",
  "./buecher.html",
  "./reimkupplung.html",
  "./anlautlauscher.html",
  "./werfaehrtmit.html",
  "./woerterbauen.html",
  "./silbenbahn.html",
  "./blitzwoerter.html",
  "./meinname.html",
  "./lueckensaetze.html",
  "./buchstabengleis.html",
  "./satzkuppeln.html",
  "./quatschsaetze.html",
  "./stolperwoerter.html",
  "./quatschwoerter.html",
  "./lautposition.html",
  "./buchstabensignal.html",
  "./liesundtu.html",
  "./geschichtenzug.html",
  "./werbinich.html",
  "./wortbaustelle.html",
  "./steckbriefe.html",
  "./detektivfaelle.html",
  "./postkarten.html",
  `./styles.css${ASSET_VERSION_QUERY}`,
  `./spatial-puzzles.js${ASSET_VERSION_QUERY}`,
  `./kids.js${ASSET_VERSION_QUERY}`,
  `./highscore.js${ASSET_VERSION_QUERY}`,
  `./app.js${ASSET_VERSION_QUERY}`,
  `./train-progress.js${ASSET_VERSION_QUERY}`,
  `./entitlement.js${ASSET_VERSION_QUERY}`,
  `./train-art.js${ASSET_VERSION_QUERY}`,
  `./train-scenes.js${ASSET_VERSION_QUERY}`,
  `./train-home.js${ASSET_VERSION_QUERY}`,
  `./journey-plan.js${ASSET_VERSION_QUERY}`,
  `./train-journey.js${ASSET_VERSION_QUERY}`,
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
  `./leseschrift.css${ASSET_VERSION_QUERY}`,
  `./lesen-inhalte.js${ASSET_VERSION_QUERY}`,
  `./lesen-stand.js${ASSET_VERSION_QUERY}`,
  `./lesen-laute.js${ASSET_VERSION_QUERY}`,
  `./lesen-stimme.js${ASSET_VERSION_QUERY}`,
  `./lesen-ton.js${ASSET_VERSION_QUERY}`,
  `./lesen-art.js${ASSET_VERSION_QUERY}`,
  `./lesen-wurm.js${ASSET_VERSION_QUERY}`,
  `./lesen-spiel.js${ASSET_VERSION_QUERY}`,
  `./lesen-buecher.js${ASSET_VERSION_QUERY}`,
  `./lesen-bilder.js${ASSET_VERSION_QUERY}`,
  `./lesen-detektive.js${ASSET_VERSION_QUERY}`,
  `./train-leseecke.js${ASSET_VERSION_QUERY}`,
  `./bau.css${ASSET_VERSION_QUERY}`,
  `./bau-moebel.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-wohnen.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-haus.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-spital.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-station.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-laeden.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-dienste.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-freizeit.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-buero.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-arbeit.js${ASSET_VERSION_QUERY}`,
  `./bau-katalog.js${ASSET_VERSION_QUERY}`,
  `./bau-stand.js${ASSET_VERSION_QUERY}`,
  `./bau-art.js${ASSET_VERSION_QUERY}`,
  `./train-bau.js${ASSET_VERSION_QUERY}`,
  `./silbenzug.js${ASSET_VERSION_QUERY}`,
  `./buchstabenhaus.js${ASSET_VERSION_QUERY}`,
  `./lautekuppeln.js${ASSET_VERSION_QUERY}`,
  `./stimmtdas.js${ASSET_VERSION_QUERY}`,
  `./buecher.js${ASSET_VERSION_QUERY}`,
  `./reimkupplung.js${ASSET_VERSION_QUERY}`,
  `./anlautlauscher.js${ASSET_VERSION_QUERY}`,
  `./werfaehrtmit.js${ASSET_VERSION_QUERY}`,
  `./woerterbauen.js${ASSET_VERSION_QUERY}`,
  `./silbenbahn.js${ASSET_VERSION_QUERY}`,
  `./blitzwoerter.js${ASSET_VERSION_QUERY}`,
  `./meinname.js${ASSET_VERSION_QUERY}`,
  `./lueckensaetze.js${ASSET_VERSION_QUERY}`,
  `./buchstabengleis.js${ASSET_VERSION_QUERY}`,
  `./satzkuppeln.js${ASSET_VERSION_QUERY}`,
  `./quatschsaetze.js${ASSET_VERSION_QUERY}`,
  `./stolperwoerter.js${ASSET_VERSION_QUERY}`,
  `./quatschwoerter.js${ASSET_VERSION_QUERY}`,
  `./lautposition.js${ASSET_VERSION_QUERY}`,
  `./buchstabensignal.js${ASSET_VERSION_QUERY}`,
  `./liesundtu.js${ASSET_VERSION_QUERY}`,
  `./geschichtenzug.js${ASSET_VERSION_QUERY}`,
  `./werbinich.js${ASSET_VERSION_QUERY}`,
  `./wortbaustelle.js${ASSET_VERSION_QUERY}`,
  `./steckbriefe.js${ASSET_VERSION_QUERY}`,
  `./detektivfaelle.js${ASSET_VERSION_QUERY}`,
  `./postkarten.js${ASSET_VERSION_QUERY}`,
  `./firebase.js${ASSET_VERSION_QUERY}`,
  `./admin.js${ASSET_VERSION_QUERY}`,
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
        const alteBilder = keys.filter((key) => key.startsWith("lernapp-buchbilder-") && key !== BUCHBILDER_CACHE);
        const alteStimmen = keys.filter((key) => key.startsWith("lernapp-stimme-") && key !== STIMME_CACHE);
        return Promise.all([...staleKeys, ...alteBilder, ...alteStimmen].map((key) => caches.delete(key))).then(() => staleKeys.length > 0);
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

function fetchWithTimeout(request, timeoutMs = NETWORK_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Netz zu langsam")), timeoutMs);
    fetch(request).then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function fetchAndStore(cache, request, timeoutMs = NETWORK_TIMEOUT_MS) {
  const response = await fetchWithTimeout(request, timeoutMs);
  // Undurchsichtige Antworten (Status 0) sind brauchbar und gehören mit in
  // den Cache; Weiterleitungen und Fehlerseiten nicht. cache.put() lehnt
  // manche Antwort ab – das darf den Abruf nicht umwerfen.
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function cacheFirst(event, cacheName = CACHE_NAME, timeoutMs = NETWORK_TIMEOUT_MS) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  return fetchAndStore(cache, event.request, timeoutMs);
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(event.request);
  if (!cached) return fetchAndStore(cache, event.request);

  event.waitUntil(fetchAndStore(cache, event.request).catch(() => {}));
  return cached;
}

// Eine Aufnahme. Ein Audio-Element fragt in Stücken (Range: bytes=…), und
// Safari spielt nur, was so beantwortet wird – mit 206 und dem Stück. Im Cache
// liegt die ganze Datei, geholt ohne Range; das verlangte Stück wird daraus
// geschnitten.
async function aufnahme(event) {
  const cache = await caches.open(STIMME_CACHE);
  const adresse = event.request.url;
  let ganz = await cache.match(adresse);
  if (!ganz) {
    const response = await fetchWithTimeout(adresse, STIMME_TIMEOUT_MS);
    if (response.status !== 200) return response;
    cache.put(adresse, response.clone()).catch(() => {});
    ganz = response;
  }
  const bereich = event.request.headers.get("range");
  return bereich ? stueckAus(ganz, bereich) : ganz;
}

async function stueckAus(response, bereich) {
  const daten = await response.arrayBuffer();
  const groesse = daten.byteLength;
  const treffer = /^bytes=(\d*)-(\d*)$/.exec(bereich.trim());
  let von = NaN;
  let bis = groesse - 1;
  if (treffer && treffer[1] !== "") {
    von = Number(treffer[1]);
    if (treffer[2] !== "") bis = Math.min(Number(treffer[2]), groesse - 1);
  } else if (treffer && treffer[2] !== "") {
    // bytes=-500: die letzten 500
    von = Math.max(0, groesse - Number(treffer[2]));
  }
  if (!(von >= 0) || von >= groesse || bis < von) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${groesse}` } });
  }
  return new Response(daten.slice(von, bis + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
      "Content-Length": String(bis - von + 1),
      "Content-Range": `bytes ${von}-${bis}/${groesse}`,
      "Accept-Ranges": "bytes"
    }
  });
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

  if (requestUrl.pathname.includes("/bilder/buecher/") || requestUrl.pathname.includes("/bilder/postkarten/") || requestUrl.pathname.includes("/bilder/steckbriefe/") || requestUrl.pathname.includes("/bilder/monster/")) {
    event.respondWith(cacheFirst(event, BUCHBILDER_CACHE, BUCHBILDER_TIMEOUT_MS));
    return;
  }

  if (requestUrl.pathname.includes("/stimme/")) {
    event.respondWith(aufnahme(event));
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
