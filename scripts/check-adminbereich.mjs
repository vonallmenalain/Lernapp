/*
 * Der Adminbereich, wirklich aufgeklappt.
 * ---------------------------------------------------------------------------
 * Der Adminbereich ist die einzige Ansicht der App, die kein Kind je sieht –
 * und deshalb die einzige, bei der niemand von selbst merkt, wenn sie kaputt
 * ist. Diese Prüfung meldet sich als Admin an, klappt ein Konto auf und
 * schaut nach, ob dasteht, was dastehen soll.
 *
 * Firebase kommt nicht aus dem Netz: vor allen Skripten der Seite wird ein
 * Ersatz eingehängt, der Anmeldung und Firestore im Speicher nachbildet – ein
 * kleiner Bruder des Ersatzes in validate-train-gruppe.mjs. Geprüft wird die
 * Oberfläche, nicht Google.
 *
 * Gemessen wird:
 *   - drei Reiter, und die Konten stehen zugeklappt da
 *   - jede Zeile trägt den Zug als fünf Balken
 *   - ein Tipp klappt auf, ein zweiter wieder zu
 *   - aufgeklappt: Zug-Fortschritt, Gruppe, Zurücksetzen, Level, Sitzungen
 *   - der Reiter "Spiele" zählt richtig
 *
 * Aufruf:  node scripts/check-adminbereich.mjs
 * Nötig:   Playwright (npm i -D playwright).
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4184);
const BASIS = `http://127.0.0.1:${PORT}`;
const ADMIN = "alain.sc2@gmail.com";

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich der Adminbereich nicht aufklappen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  console.error("Oder eine vorhandene Installation über NODE_PATH bekannt machen.");
  process.exit(2);
}

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], {
  cwd: WURZEL,
  stdio: "ignore",
});
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });

async function warteAufServer() {
  for (let versuch = 0; versuch < 50; versuch += 1) {
    try {
      const antwort = await fetch(`${BASIS}/index.html`);
      if (antwort.ok) return true;
    } catch { /* noch nicht da */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}

// --- Die erfundene Datenbank -------------------------------------------------
// Ein Admin, zwei Kinder, ein Gast. Mia hat in zwei Bereichen etwas geschafft,
// Ben nur Turmbau gespielt – so lässt sich sehen, ob Zug-Balken und Auswertung
// wirklich rechnen und nicht bloss dieselbe Zahl überall hinschreiben.
const DATEN = {
  users: {
    admin1: { authEmail: ADMIN, username: "Alain", displayName: "Alain", role: "admin", isAdmin: true, stats: { totalSeconds: 60, moves: 5, resets: 0, solvedLevels: 0, sessions: 1 } },
    "kind-mia": {
      authEmail: "mia@lernapp.local", username: "Mia", displayName: "Mia",
      group: { id: "familie", name: "Familie", displayName: "Mia" },
      stats: { totalSeconds: 900, moves: 120, resets: 4, solvedLevels: 3, sessions: 7 },
      gameState: {
        "lernapp.turmbau": { data: { runs: 6, scores: [24, 19, 11] }, updatedAt: 1 },
        "lernapp.trackrouter": { data: { best: { 1: { stars: 3 }, 2: { stars: 2 } } }, updatedAt: 1 },
      },
    },
    "kind-ben": {
      authEmail: "ben@lernapp.local", username: "Ben", displayName: "Ben",
      group: { id: "familie", name: "Familie", displayName: "Ben" },
      stats: { totalSeconds: 300, moves: 20, resets: 1, solvedLevels: 0, sessions: 2 },
      gameState: { "lernapp.turmbau": { data: { runs: 3, scores: [15] }, updatedAt: 1 } },
    },
  },
  guests: {
    guest_abcdefgh12345678: { type: "guest", displayName: "Gast 345678", stats: { totalSeconds: 120, moves: 8, resets: 2, solvedLevels: 1, sessions: 1 } },
  },
  // Level-Fortschritt: Pfad -> Dokument
  levels: {
    "users/kind-mia/levelProgress/arukone_a1": { game: "arukone", levelId: "a1", levelName: "Rätsel eins", difficulty: "easy", solved: true, attempts: 3, resets: 2, moves: 40, timeSeconds: 120 },
    "users/kind-mia/levelProgress/arukone_a2": { game: "arukone", levelId: "a2", levelName: "Rätsel zwei", difficulty: "easy", solved: true, attempts: 1, resets: 0, moves: 25, timeSeconds: 80 },
    "users/kind-mia/levelProgress/kakuro_k1": { game: "kakuro", levelId: "k1", levelName: "Kakuro eins", difficulty: "medium", solved: false, attempts: 4, resets: 3, moves: 60, timeSeconds: 200 },
    "users/kind-ben/levelProgress/arukone_a1": { game: "arukone", levelId: "a1", levelName: "Rätsel eins", difficulty: "easy", solved: false, attempts: 2, resets: 1, moves: 10, timeSeconds: 45 },
    "guests/guest_abcdefgh12345678/levelProgress/arukone_a1": { game: "arukone", levelId: "a1", levelName: "Rätsel eins", difficulty: "easy", solved: true, attempts: 1, resets: 0, moves: 22, timeSeconds: 70 },
  },
  sitzungen: {
    "users/kind-mia/sessions/s1": { game: "arukone", levelId: "a1", levelName: "Rätsel eins", difficulty: "easy", solved: true, durationSeconds: 120, moves: 40, resets: 2 },
    "users/kind-mia/sessions/s2": { game: "kakuro", levelId: "k1", levelName: "Kakuro eins", difficulty: "medium", solved: false, durationSeconds: 200, moves: 60, resets: 3 },
  },
};

// Der Ersatz läuft im Browser, vor allen Skripten der Seite. addInitScript
// reicht genau einen Wert hinein, deshalb kommt beides in einem Paket.
function firebaseErsatz({ daten, adminEmail }) {
  const laden = new Map();
  Object.entries(daten.users).forEach(([id, doc]) => laden.set(`users/${id}`, doc));
  Object.entries(daten.guests).forEach(([id, doc]) => laden.set(`guests/${id}`, doc));
  Object.entries(daten.levels).forEach(([pfad, doc]) => laden.set(pfad, doc));
  Object.entries(daten.sitzungen).forEach(([pfad, doc]) => laden.set(pfad, doc));

  const SERVER = "__serverTimestamp";
  const DELETE = "__deleteField";

  const aufloesen = (wert) => {
    if (wert && wert.__marker === SERVER) return 1700000000000;
    if (Array.isArray(wert)) return wert.map(aufloesen);
    if (wert && typeof wert === "object") {
      return Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, aufloesen(v)]));
    }
    return wert;
  };

  const mischen = (ziel, patch) => {
    const raus = { ...(ziel || {}) };
    for (const [key, wert] of Object.entries(patch)) {
      if (wert && wert.__marker === DELETE) { delete raus[key]; continue; }
      const einfach = wert && typeof wert === "object" && !Array.isArray(wert) && !wert.__marker;
      raus[key] = einfach && raus[key] && typeof raus[key] === "object" ? mischen(raus[key], wert) : aufloesen(wert);
    }
    return raus;
  };

  const feld = (doc, pfad) => String(pfad).split(".").reduce((eintrag, key) => (eintrag == null ? eintrag : eintrag[key]), doc);

  const docRef = (pfad) => ({
    path: pfad,
    id: pfad.split("/").pop(),
    async get() {
      const doc = laden.get(pfad);
      return { exists: doc !== undefined, id: pfad.split("/").pop(), data: () => doc && JSON.parse(JSON.stringify(doc)) };
    },
    async set(payload, optionen) {
      laden.set(pfad, optionen?.merge ? mischen(laden.get(pfad), payload) : aufloesen(payload));
    },
    async delete() { laden.delete(pfad); },
    collection: (name) => collectionRef(`${pfad}/${name}`),
  });

  function collectionRef(pfad, filter = []) {
    const abfrage = {
      orderBy: () => abfrage,
      limit: () => abfrage,
      where: (f, op, wert) => collectionRef(pfad, [...filter, { f, op, wert }]),
      async get() {
        const docs = [];
        laden.forEach((doc, key) => {
          if (!key.startsWith(`${pfad}/`)) return;
          const rest = key.slice(pfad.length + 1);
          if (rest.includes("/")) return;
          if (!filter.every(({ f, wert }) => feld(doc, f) === wert)) return;
          docs.push({ id: rest, data: () => JSON.parse(JSON.stringify(doc)) });
        });
        return { docs, size: docs.length, forEach: (fn) => docs.forEach(fn) };
      },
      doc: (id) => docRef(`${pfad}/${id}`),
    };
    return abfrage;
  }

  const nutzer = {
    uid: "admin1",
    email: adminEmail,
    emailVerified: true,
    displayName: "Alain",
    providerData: [{ providerId: "google.com" }],
    updateProfile: async () => {},
  };

  const auth = () => ({
    currentUser: nutzer,
    setPersistence: () => Promise.resolve(),
    onAuthStateChanged(rueckruf) { setTimeout(() => rueckruf(nutzer), 0); return () => {}; },
    signOut: async () => {},
  });
  auth.Auth = { Persistence: { LOCAL: "local" } };
  auth.GoogleAuthProvider = function GoogleAuthProvider() {};

  const firestore = () => ({
    collection: (name) => collectionRef(name),
    batch() {
      const schritte = [];
      return {
        set(ref, payload, optionen) { schritte.push(["set", ref, payload, optionen]); return this; },
        delete(ref) { schritte.push(["delete", ref]); return this; },
        async commit() {
          for (const [art, ref, payload, optionen] of schritte) {
            if (art === "delete") await ref.delete(); else await ref.set(payload, optionen);
          }
        },
      };
    },
  });
  firestore.FieldValue = {
    serverTimestamp: () => ({ __marker: SERVER }),
    increment: (um) => um,
    delete: () => ({ __marker: DELETE }),
  };

  window.firebase = { apps: [], initializeApp: () => ({}), app: () => ({}), auth, firestore };
}

const befunde = [];
function pruefe(bedingung, meldung) { if (!bedingung) befunde.push(meldung); }

if (!(await warteAufServer())) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
// Das echte SDK liegt auf einem fremden Server und wird hier nicht gebraucht.
await page.route("https://www.gstatic.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
await page.addInitScript(firebaseErsatz, { daten: DATEN, adminEmail: ADMIN });
await page.goto(`${BASIS}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// Profilfenster öffnen – dort steckt der Adminbereich.
await page.locator(".account-button").click();
await page.waitForSelector("[data-admin-section]", { timeout: 5000 }).catch(() => {});
await page.waitForTimeout(900);

pruefe(await page.locator("[data-admin-section]").count() === 1, "Der Adminbereich geht nicht auf");

const reiter = await page.locator(".admin-tabs button").allTextContents();
pruefe(reiter.length === 3, `Es gibt ${reiter.length} Reiter, erwartet 3 (User, Gäste, Spiele)`);
pruefe(reiter.includes("Spiele"), `Der Reiter "Spiele" fehlt: ${reiter.join(", ")}`);

// --- Zugeklappt --------------------------------------------------------------
const zeilen = await page.locator(".admin-entry").count();
pruefe(zeilen === 3, `Es stehen ${zeilen} Konten da, erwartet 3`);
pruefe(await page.locator(".admin-entry-body").count() === 0,
  "Beim Öffnen ist schon ein Konto aufgeklappt – die Liste soll zugeklappt beginnen");

const balken = await page.locator(".admin-entry").first().locator(".admin-train-car").count();
pruefe(balken === 5, `Die Zeile zeigt ${balken} Wagen, erwartet 5`);

const gruppen = await page.locator(".admin-entry-group").allTextContents();
pruefe(gruppen.filter((eintrag) => eintrag.trim() === "Familie").length === 2,
  `Die Gruppe steht an ${gruppen.length} Zeilen: ${gruppen.join(", ")}`);

// --- Aufklappen --------------------------------------------------------------
const miaZeile = page.locator('.admin-entry:has([data-admin-user="kind-mia"])');
await miaZeile.locator(".admin-entry-head").click();
await page.waitForTimeout(700);

pruefe(await page.locator(".admin-entry-body").count() === 1, "Ein Tipp klappt das Konto nicht auf");
pruefe(await miaZeile.locator(".admin-entry-body").count() === 1, "Aufgeklappt wurde das falsche Konto");

const koerper = miaZeile.locator(".admin-entry-body");
for (const [wahl, was] of [
  [".admin-train-detail", "der Zug-Fortschritt"],
  [".admin-group", "die Gruppe"],
  [".admin-reset", "das Zurücksetzen"],
  [".admin-game-filter", "der Spiel-Filter"],
  [".admin-columns", "Level und Sitzungen"],
]) {
  pruefe(await koerper.locator(wahl).count() > 0, `Aufgeklappt fehlt ${was} (${wahl})`);
}

const levelKarten = await koerper.locator(".admin-columns section").first().locator(".admin-data-card").count();
pruefe(levelKarten === 3, `Mia hat ${levelKarten} Level-Karten, erwartet 3`);

const wagen = await koerper.locator(".admin-train-detail span").count();
pruefe(wagen === 5, `Der Zug-Fortschritt zeigt ${wagen} Bereiche, erwartet 5`);

// Ein zweiter Tipp klappt wieder zu.
await miaZeile.locator(".admin-entry-head").click();
await page.waitForTimeout(500);
pruefe(await page.locator(".admin-entry-body").count() === 0, "Ein zweiter Tipp klappt das Konto nicht wieder zu");

// --- Der Reiter "Spiele" -----------------------------------------------------
await page.locator('[data-admin-view="games"]').click();
await page.waitForTimeout(900);

const karten = await page.locator(".admin-game-card").count();
pruefe(karten === 20, `Die Auswertung zeigt ${karten} Spiele, erwartet 20`);

// Arukone: drei Konten haben daran gespielt – Mia zweimal gelöst, Ben nicht,
// der Gast einmal. Versuche 3+1+2+1 = 7, gelöst 3, Neustarts 2+0+1+0 = 3.
const arukone = page.locator('.admin-game-card:has-text("Arukone")').first();
const arukoneText = (await arukone.textContent() || "").replace(/\s+/g, " ");
pruefe(/Gespielt\s*7/.test(arukoneText), `Arukone: "${arukoneText.slice(0, 160)}"`);
pruefe(/Abgeschlossen\s*3/.test(arukoneText), `Arukone abgeschlossen stimmt nicht: "${arukoneText.slice(0, 160)}"`);
pruefe(/Neu gestartet\s*3/.test(arukoneText), `Arukone Neustarts stimmen nicht: "${arukoneText.slice(0, 160)}"`);

// Turmbau führt keine Neustarts – dort muss ein Strich stehen, keine Null.
const turmbau = page.locator('.admin-game-card:has-text("Turmbau")').first();
const turmbauText = (await turmbau.textContent() || "").replace(/\s+/g, " ");
pruefe(/Neu gestartet\s*–/.test(turmbauText), `Turmbau zeigt bei Neustarts keine „–“: "${turmbauText.slice(0, 160)}"`);
pruefe(/Gespielt\s*9/.test(turmbauText), `Turmbau: 6 + 3 Runden erwartet – "${turmbauText.slice(0, 160)}"`);
pruefe(/24 Blöcke/.test(turmbauText), `Turmbau: der Bestwert fehlt – "${turmbauText.slice(0, 160)}"`);
pruefe(/Mia/.test(turmbauText), `Turmbau: der Halter des Bestwerts fehlt – "${turmbauText.slice(0, 160)}"`);

// Ein Bereichsfilter blendet aus.
await page.locator('[data-admin-area="zahlbuchstabe"]').click();
await page.waitForTimeout(400);
const gefiltert = await page.locator(".admin-game-card").count();
pruefe(gefiltert === 4, `Der Bereich "Zahl und Buchstabe" zeigt ${gefiltert} Spiele, erwartet 4`);

// --- Gäste -------------------------------------------------------------------
await page.locator('[data-admin-view="guests"]').click();
await page.waitForTimeout(900);
pruefe(await page.locator(".admin-entry").count() === 1, "Der Gast fehlt im Gäste-Reiter");
pruefe(await page.locator(".admin-entry-body").count() === 0, "Der Gäste-Reiter beginnt nicht zugeklappt");
await page.locator(".admin-entry-head").first().click();
await page.waitForTimeout(700);
pruefe(await page.locator(".admin-entry-body .admin-reset").count() === 0,
  "Ein Gast bekommt den Zurücksetzen-Knopf – sein Stand liegt auf seinem Gerät, der Knopf täte dort nichts Sichtbares");

await browser.close();
halt();

if (befunde.length) {
  console.error(`${befunde.length} Befund(e):`);
  befunde.forEach((zeile) => console.error(`  - ${zeile}`));
  process.exit(1);
}

console.log("Adminbereich geprüft: drei Reiter, Konten zugeklappt, Zug je Konto, Auswertung je Spiel.");
