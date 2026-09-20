/*
 * Die Seiten unter mini-games/ – erzeugt, nicht getippt.
 * ---------------------------------------------------------------------------
 * Ein Mini-Game ist kein zweites Spiel, sondern dasselbe Spiel unter einer
 * anderen Adresse: mini-games/turmbau.html lädt turmbau.js, game-shell.js und
 * den ganzen Rest genau wie turmbau.html. Der Unterschied sind drei Dinge:
 *
 *   data-mini="1"              schaltet den Mini-Modus ein. Daran hängen die
 *                              Schranke (entitlement.js: nichts gesperrt,
 *                              nichts verbraucht), die Ablage (game-cloud.js:
 *                              nichts geschrieben) und die Bühne
 *                              (game-shell.js: andere Knöpfe, andere Liste).
 *   data-mini-spiel="towerStack"  welches Spiel das hier ist.
 *   mini-games.js              die Knöpfe, das Fenster, die Bestenliste.
 *
 * Dazu ein eigenes Manifest und ein eigener Service Worker unter
 * mini-games/: Die Mini-Games lassen sich als eigene App auf den
 * Startbildschirm legen, neben Gripszug und unabhängig davon. Ohne das gäbe
 * es auf dem Handy keinen Weg zu ihnen ausser der Adresszeile.
 *
 * Diese Dateien von Hand zu pflegen hiesse, dreizehn Skriptlisten parallel
 * aktuell zu halten. Beim ersten vergessenen Eintrag lädt ein Mini-Game eine
 * Datei nicht, die es braucht – und es fällt niemandem auf, weil niemand
 * dreizehn Seiten durchklickt. Deshalb entstehen sie hier aus der Seite der
 * App, und scripts/validate-mini-games.mjs prüft, dass sie es noch tun.
 *
 * Der Service Worker entsteht hier mit: Seine Liste ist genau das, was die
 * Seiten laden – von Hand gepflegt liefe sie auseinander, und eine installierte
 * App, der eine Datei fehlt, startet ohne Netz gar nicht.
 *
 *   node scripts/generate-mini-games.mjs             schreibt die Seiten
 *   node scripts/generate-mini-games.mjs --pruefen   sagt nur, ob sie stimmen
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const ZIEL = path.join(WURZEL, "mini-games");

// Welche Spiele es als Mini-Game gibt, steht in mini-games.js – einmal, für
// die App und für dieses Skript. Gelesen wird die Tabelle aus der Datei statt
// sie hier zu wiederholen: Zwei Listen liefen auseinander.
export function spieleAusModul() {
  const quelle = fs.readFileSync(path.join(WURZEL, "mini-games.js"), "utf8");
  const block = quelle.match(/const SPIELE = \[([\s\S]*?)\n  \];/);
  if (!block) throw new Error("In mini-games.js ist die Tabelle SPIELE nicht zu finden.");
  const spiele = [...block[1].matchAll(/\{\s*id:\s*"([^"]+)",\s*seite:\s*"([^"]+)"\s*\}/g)]
    .map(([, id, seite]) => ({ id, seite }));
  if (!spiele.length) throw new Error("In mini-games.js steht kein einziges Mini-Game.");
  return spiele;
}

// Die Seite der App, aus der die Mini-Seite wird: entitlement.js weiss, welche
// Datei zu welchem Spiel gehört. Auch das wird gelesen und nicht wiederholt.
export function seitenAusSchranke() {
  const quelle = fs.readFileSync(path.join(WURZEL, "entitlement.js"), "utf8");
  const seiten = new Map();
  [...quelle.matchAll(/\{\s*id:\s*"([^"]+)",\s*page:\s*"([^"]+)"/g)]
    .forEach(([, id, page]) => { if (!seiten.has(id)) seiten.set(id, page); });
  if (!seiten.size) throw new Error("In entitlement.js sind keine Spielseiten zu finden.");
  return seiten;
}

// Aus turmbau.html wird mini-games/turmbau.html.
export function baueSeite({ id, seite }, appSeite, quelle) {
  const titel = (quelle.match(/<title>([^<]*)<\/title>/) || [, "Gripszug"])[1].split("·")[0].trim();
  let html = quelle;

  // 1. Der Name oben im Tab sagt, wo man ist.
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${titel} · Mini-Games</title>`);

  // 2. Das Manifest der App gehört nicht hierher – aber ein eigenes schon:
  //    Die Mini-Games sind eine eigene App auf dem Startbildschirm, mit
  //    eigenem Namen, eigenem Icon und eigenem Bereich (scope /mini-games/).
  //    Gesetzt wird es unten, nach dem Umschreiben der Adressen.
  html = html.replace(/\n *<link rel="manifest"[^>]*>/g, "");

  // 3. Eine Ebene tiefer: styles.css liegt über uns, nicht neben uns.
  html = html.replace(/(href|src)="(?!https?:|\/|\.\.\/|#)([^"]+)"/g, (_treffer, was, wert) => `${was}="../${wert}"`);

  // 3b. Und was auf dem Startbildschirm steht, ist nicht Gripszug: eigener
  //     Name, eigener Pokal statt der Lok. iOS liest genau diese drei Zeilen.
  html = html.replace(/<meta name="application-name" content="[^"]*"/, '<meta name="application-name" content="Mini-Games"');
  html = html.replace(/<meta name="apple-mobile-web-app-title" content="[^"]*"/, '<meta name="apple-mobile-web-app-title" content="Mini-Games"');
  html = html.replace(/href="\.\.\/icons\/apple-touch-icon-180\.png"/, 'href="../icons/mini-180.png"');
  html = html.replace(/href="\.\.\/icons\/icon-32\.png"/, 'href="../icons/mini-32.png"');

  // 4. Der Schalter, an dem alles hängt.
  html = html.replace(/<body([^>]*)>/, (_treffer, rest) => `<body${rest} data-mini="1" data-mini-spiel="${id}">`);

  // 5. Die Skripte: mini-games.js kommt direkt hinter firebase.js – es braucht
  //    dessen Daten und muss vor game-shell.js dastehen. pwa.js bleibt drin und
  //    meldet von hier aus den Service Worker unter mini-games/ an: Es
  //    registriert "./service-worker.js", und "hier" ist dieser Ordner.
  const version = (quelle.match(/firebase\.js\?v=([0-9a-z-]+)/) || [, ""])[1];
  const fassung = version ? `?v=${version}` : "";
  const miniZeile = `    <script defer src="../mini-games.js${fassung}"></script>`;
  html = html.replace(/( *<script defer src="\.\.\/firebase\.js[^"]*"><\/script>)/, `$1\n${miniZeile}`);
  // 5b. Das eigene Manifest, dort wo das der App stand.
  const manifestZeile = `    <link rel="manifest" href="app.webmanifest${fassung}" />`;
  html = html.replace(/( *<link rel="stylesheet"[^>]*>)/, `$1\n${manifestZeile}`);

  // 6. Und der Hinweis, dass hier niemand von Hand arbeiten soll.
  const kopf = [
    "<!--",
    `  Erzeugt aus ${appSeite} von scripts/generate-mini-games.mjs.`,
    "  Nicht von Hand ändern: Was hier steht, muss dieselben Dateien laden wie",
    "  die Seite in der App – sonst spielt das Mini-Game ein anderes Spiel.",
    "  Ändern heisst: die Seite der App ändern, dann das Skript laufen lassen.",
    "-->",
  ].join("\n");
  html = html.replace(/<!doctype html>\n/i, `<!doctype html>\n${kopf}\n`);

  return html;
}

// ---------------------------------------------------------------------------
// Der eigene Service Worker
// ---------------------------------------------------------------------------
// Ohne ihn liessen sich die Mini-Games nicht installieren: Ein Browser legt
// nur etwas auf den Startbildschirm, das auch ohne Netz startet. Er bedient
// nur /mini-games/ – der Service Worker der App liegt eine Ebene höher und
// bleibt für alles andere zuständig.
//
// Seine Liste entsteht aus den Seiten selbst. Von Hand gepflegt fehlte nach
// dem ersten Umbau eine Datei, und die installierte App startete ohne Netz
// nicht mehr – ein Fehler, den niemand bemerkt, bis er im Zug sitzt.
export function baueWorker(seiten, hubHtml) {
  const holen = (html, muster) => [...html.matchAll(muster)].map(([, wert]) => wert);
  const dateien = new Set();
  const alle = [hubHtml, ...seiten.map(({ html }) => html)];
  alle.forEach((html) => {
    holen(html, /<script defer src="(\.\.\/[^"]+)"/g).forEach((wert) => dateien.add(wert));
    holen(html, /<link rel="stylesheet" href="(\.\.\/[^"]+)"/g).forEach((wert) => dateien.add(wert));
    holen(html, /<link rel="manifest" href="([^"]+)"/g).forEach((wert) => dateien.add(`./${wert}`));
  });
  const version = (hubHtml.match(/styles\.css\?v=([0-9a-z-]+)/) || [, ""])[1];
  const sdk = [...new Set(alle.flatMap((html) => holen(html, /<script defer src="(https:\/\/[^"]+)"/g)))];
  const seitenListe = ['"./"', '"./index.html"', ...seiten.map(({ datei }) => `"./${path.basename(datei)}"`)];
  const icons = ["mini-32", "mini-180", "mini-192", "mini-512", "mini-maskable-192", "mini-maskable-512"]
    .map((name) => `"../icons/${name}.png"`);

  return `const APP_VERSION = "${version}";
const CACHE_PREFIX = "lernapp-mini-";
const CACHE_NAME = \`\${CACHE_PREFIX}\${APP_VERSION}\`;
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
${sdk.map((url) => `  "${url}"`).join(",\n")}
];

const CORE_ASSETS = [
${[...seitenListe, ...[...dateien].map((wert) => `"${wert}"`), ...icons].map((wert) => `  ${wert}`).join(",\n")}
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
`;
}

export function alleSeiten() {
  const spiele = spieleAusModul();
  const seiten = seitenAusSchranke();
  return spiele.map((spiel) => {
    const appSeite = seiten.get(spiel.id);
    if (!appSeite) throw new Error(`entitlement.js kennt das Spiel "${spiel.id}" nicht.`);
    const erwartet = `${spiel.seite}.html`;
    if (appSeite !== erwartet) {
      throw new Error(`mini-games.js sagt "${spiel.seite}", entitlement.js sagt "${appSeite}" für ${spiel.id}.`);
    }
    const quelle = fs.readFileSync(path.join(WURZEL, appSeite), "utf8");
    return { spiel, appSeite, datei: path.join(ZIEL, erwartet), html: baueSeite(spiel, appSeite, quelle) };
  });
}

// ---------------------------------------------------------------------------
// Aufruf von der Kommandozeile
// ---------------------------------------------------------------------------
const direkt = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direkt) {
  const nurPruefen = process.argv.includes("--pruefen");
  const seiten = alleSeiten();
  fs.mkdirSync(ZIEL, { recursive: true });

  const abweichungen = [];
  for (const { datei, html, appSeite } of seiten) {
    const vorhanden = fs.existsSync(datei) ? fs.readFileSync(datei, "utf8") : null;
    if (vorhanden === html) continue;
    abweichungen.push(`${path.relative(WURZEL, datei)} ${vorhanden === null ? "fehlt" : `weicht von ${appSeite} ab`}`);
    if (!nurPruefen) fs.writeFileSync(datei, html);
  }

  // Und der Service Worker, aus denselben Seiten.
  const hub = path.join(ZIEL, "index.html");
  if (!fs.existsSync(hub)) {
    abweichungen.push("mini-games/index.html fehlt – ohne die Übersicht gibt es keine App zum Installieren.");
  } else {
    const worker = path.join(ZIEL, "service-worker.js");
    const soll = baueWorker(seiten, fs.readFileSync(hub, "utf8"));
    const ist = fs.existsSync(worker) ? fs.readFileSync(worker, "utf8") : null;
    if (ist !== soll) {
      abweichungen.push(`mini-games/service-worker.js ${ist === null ? "fehlt" : "ist nicht mehr aktuell"}`);
      if (!nurPruefen) fs.writeFileSync(worker, soll);
    }
  }

  // Und keine Seite zu viel: Ein Spiel, das kein Mini-Game mehr ist, lässt
  // sonst eine Adresse zurück, die noch funktioniert.
  const erlaubt = new Set([...seiten.map(({ datei }) => path.basename(datei)), "index.html"]);
  const zuviel = fs.readdirSync(ZIEL).filter((name) => name.endsWith(".html") && !erlaubt.has(name));
  zuviel.forEach((name) => {
    abweichungen.push(`mini-games/${name} gehört zu keinem Mini-Game mehr`);
    if (!nurPruefen) fs.unlinkSync(path.join(ZIEL, name));
  });

  if (nurPruefen) {
    if (abweichungen.length) {
      console.error(`${abweichungen.length} Abweichung${abweichungen.length === 1 ? "" : "en"}:`);
      abweichungen.forEach((zeile) => console.error(`  - ${zeile}`));
      console.error("\nnode scripts/generate-mini-games.mjs schreibt sie neu.");
      process.exit(1);
    }
    console.log(`${seiten.length} Mini-Seiten stimmen mit den Seiten der App überein.`);
  } else {
    console.log(abweichungen.length
      ? `${seiten.length} Mini-Seiten geschrieben, ${abweichungen.length} davon geändert.`
      : `${seiten.length} Mini-Seiten waren schon aktuell.`);
  }
}
