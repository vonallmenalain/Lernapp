/*
 * Der Adminbereich, wirklich aufgeklappt.
 * ---------------------------------------------------------------------------
 * Der Adminbereich ist die einzige Ansicht der App, die kein Kind je sieht –
 * und deshalb die einzige, bei der niemand von selbst merkt, wenn sie kaputt
 * ist. Diese Prüfung meldet sich als Admin an, klappt ein Konto auf und
 * schaut nach, ob dasteht, was dastehen soll.
 *
 * Er ist seit dem Umbau eine eigene Seite (admin.html), kein Abschnitt im
 * Profilfenster mehr: Kontenliste, Gästeliste, Spielauswertung, Wagen und
 * Gruppen brauchen Platz. Geprüft wird deshalb die Seite – und dazu, dass
 * das Profilfenster überhaupt noch dorthin führt.
 *
 * Firebase kommt nicht aus dem Netz: vor allen Skripten der Seite wird ein
 * Ersatz eingehängt, der Anmeldung und Firestore im Speicher nachbildet – ein
 * kleiner Bruder des Ersatzes in validate-train-gruppe.mjs. Geprüft wird die
 * Oberfläche, nicht Google.
 *
 * Gemessen wird:
 *   - das Profilfenster führt mit einem Knopf auf die Seite
 *   - fünf Reiter, und die Konten stehen zugeklappt da
 *   - jede Zeile trägt den Zug als fünf Balken, dazu Rolle, Kaufstand und
 *     das Datum der letzten Aktivität
 *   - filtern nach bezahlt/gratis und Eltern/Kind, sortieren nach Datum,
 *     Kaufstand und Name – und andersherum
 *   - ein Tipp klappt auf, ein zweiter wieder zu
 *   - aufgeklappt: Zug, probierte Level, Freischalten, Gruppe, Zurücksetzen,
 *     Level, Sitzungen
 *   - freischalten ruft den Server mit Token und Kennung an
 *   - der Reiter "Spiele" zählt richtig
 *   - der Reiter "Gruppen" legt eine übergreifende Gruppe an
 *   - "Ganz entfernen" fragt zweimal, nennt die Kinder beim Namen und fehlt
 *     beim eigenen Konto des Admins
 *   - der Reiter "E-Mail" zeigt Ein- und Ausgang, filtert, und das Speichern
 *     der Weiterleitung ruft den Server an
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
    // Ein Elternkonto, das bezahlt hat, mit zwei Kindern – und eines ohne
    // Kauf. Erst damit lässt sich prüfen, ob die Liste bezahlt von gratis
    // trennt und ob sie nach dem Datum wirklich sortiert.
    "eltern-1": {
      authEmail: "eltern@example.com", email: "eltern@example.com", username: "Familie Muster", displayName: "Familie Muster", role: "parent",
      children: [{ uid: "kind-mia", name: "Mia" }, { uid: "kind-ben", name: "Ben" }],
      group: { id: "familie", name: "Familie", displayName: "Eltern" },
      lastSeenAt: 1699900000000,
      stats: { totalSeconds: 10, moves: 1, resets: 0, solvedLevels: 0, sessions: 1 },
    },
    "kind-mia": {
      authEmail: "mia@lernapp.local", username: "Mia", displayName: "Mia", parentUid: "eltern-1",
      lastSeenAt: 1699800000000,
      group: { id: "familie", name: "Familie", displayName: "Mia" },
      stats: { totalSeconds: 900, moves: 120, resets: 4, solvedLevels: 3, sessions: 7 },
      gameState: {
        "lernapp.turmbau": { data: { runs: 6, scores: [24, 19, 11] }, updatedAt: 1 },
        "lernapp.trackrouter": { data: { best: { 1: { stars: 3 }, 2: { stars: 2 } } }, updatedAt: 1 },
      },
    },
    "kind-ben": {
      authEmail: "ben@lernapp.local", username: "Ben", displayName: "Ben", parentUid: "eltern-1",
      lastSeenAt: 1699700000000,
      // Diese Familie hat eigene Wagen gewählt. Ein globaler Wechsel muss die
      // Wahl aufheben – sonst hiesse "für alle" in Wahrheit "für alle ausser
      // denen, die sich einmal anders entschieden haben".
      wagonSet: { id: "2", switchedAtMs: 1699700000000, switchedBy: "eltern-1" },
      group: { id: "familie", name: "Familie", displayName: "Ben" },
      stats: { totalSeconds: 300, moves: 20, resets: 1, solvedLevels: 0, sessions: 2 },
      gameState: { "lernapp.turmbau": { data: { runs: 3, scores: [15] }, updatedAt: 1 } },
    },
  },
  guests: {
    guest_abcdefgh12345678: { type: "guest", displayName: "Gast 345678", lastSeenAt: 1699600000000, stats: { totalSeconds: 120, moves: 8, resets: 2, solvedLevels: 1, sessions: 1 } },
  },
  // Wer bezahlt hat. Die Familie ja, der Admin nicht – so steht in der Liste
  // beides nebeneinander.
  kaeufe: {
    "eltern-1": { plan: "familie", active: true, source: "stripe", grantedAtMs: 1699000000000 },
    "kind-mia": { plan: "familie", active: true, source: "stripe", via: "eltern-1", grantedAtMs: 1699000000000 },
    "kind-ben": { plan: "familie", active: true, source: "stripe", via: "eltern-1", grantedAtMs: 1699000000000 },
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
  // Die Post: eine verschickte, eine angekommene und eine, die nicht rausging.
  // Die dritte ist die wichtigste – der Filter "Fehler" ist der einzige Weg,
  // eine Mail zu finden, von der man nicht weiss, dass sie fehlt.
  mails: {
    "willkommen-eltern-1": {
      richtung: "aus", art: "willkommen", status: "gesendet", von: "kids@alae.app", an: "eltern@example.com",
      betreff: "Willkommen bei Gripszug", text: "Schön, dass du da bist.", zeitMs: 1699900000000,
    },
    "ein-abc123": {
      richtung: "ein", art: "eingang", status: "empfangen", von: "mutter@example.com", an: "kids@alae.app",
      betreff: "Frage zur Lizenz", text: "Gibt es das auch für eine Schulklasse?", zeitMs: 1699950000000,
      pruefung: { spf: "pass", dkim: "pass" },
    },
    "bestellung-cs_test_1": {
      richtung: "aus", art: "bestellung", status: "fehler", von: "kids@alae.app", an: "eltern@example.com",
      betreff: "Deine Bestellung bei Gripszug", text: "Danke für deinen Kauf!", zeitMs: 1699960000000,
      fehler: "Domain is not verified",
    },
  },
};

// Der Ersatz läuft im Browser, vor allen Skripten der Seite. addInitScript
// reicht genau einen Wert hinein, deshalb kommt beides in einem Paket.
function firebaseErsatz({ daten, adminEmail }) {
  const laden = new Map();
  Object.entries(daten.users).forEach(([id, doc]) => laden.set(`users/${id}`, doc));
  Object.entries(daten.guests).forEach(([id, doc]) => laden.set(`guests/${id}`, doc));
  Object.entries(daten.kaeufe || {}).forEach(([id, doc]) => laden.set(`entitlements/${id}`, doc));
  Object.entries(daten.levels).forEach(([pfad, doc]) => laden.set(pfad, doc));
  Object.entries(daten.sitzungen).forEach(([pfad, doc]) => laden.set(pfad, doc));
  Object.entries(daten.mails || {}).forEach(([id, doc]) => laden.set(`mails/${id}`, doc));

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
          // ref gehört dazu: Das echte SDK gibt jedem Treffer einer Abfrage
          // eine Referenz mit, und firebase.js löscht darüber (deleteAllDocs,
          // batch.delete(doc.ref)). Ohne ref liefe jedes Zurücksetzen hier in
          // einen Fehler, den es im Ernstfall nicht gibt.
          docs.push({ id: rest, ref: docRef(key), data: () => JSON.parse(JSON.stringify(doc)) });
        });
        return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn) => docs.forEach(fn) };
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
    // Das Token, mit dem der Client beim Server anruft – ohne das käme kein
    // Aufruf zustande, und "freischalten" wäre nicht zu prüfen.
    getIdToken: async () => "token-attrappe",
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
  // Zum Nachsehen, was die Seite geschrieben hat: Eine Gruppe, die nur so
  // aussieht, als wäre sie gesetzt, fiele sonst nicht auf.
  window.__ersatz = { lies: (pfad) => { const doc = laden.get(pfad); return doc === undefined ? null : JSON.parse(JSON.stringify(doc)); } };
}

const befunde = [];
function pruefe(bedingung, meldung) { if (!bedingung) befunde.push(meldung); }

if (!(await warteAufServer())) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}
const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROMIUM_PFAD || undefined,
  args: ["--no-sandbox"],
});
const seitenFehler = [];
// Den Server unter /api/ spielt Playwright. Gemerkt wird, was er gefragt wurde.
const anfragen = [];

// Ein Fenster mit Firebase-Ersatz und Server-Ersatz. daten wird als Ganzes
// hineingereicht – addInitScript läuft bei jeder Navigation neu und baut den
// Speicher jedes Mal daraus auf. Deshalb lässt sich unterwegs nichts
// hinzufügen, was eine Navigation überlebt: Wer andere Daten braucht, macht
// ein neues Fenster auf.
async function neuesFenster(daten) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block", reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (e) => seitenFehler.push(e.message));
  // Das echte SDK liegt auf einem fremden Server und wird hier nicht gebraucht.
  await page.route("https://www.gstatic.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const pfad = new URL(request.url()).pathname.replace(/^\/api\//, "");
    let body = null;
    try { body = request.postDataJSON(); } catch { body = null; }
    anfragen.push({ pfad, methode: request.method(), token: request.headers().authorization || "", body });
    // Der Reiter E-Mail fragt nach den Einstellungen und erwartet eine andere
    // Antwort als "freischalten". Gespeichert wird hier nichts – zurück kommt,
    // was hineingereicht wurde, damit die Oberfläche zeigen kann, was sie
    // gerade gespeichert hat.
    if (pfad === "mail-einstellungen") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          weiterleitungAn: body?.weiterleitungAn || "vonallmenalain@gmail.com",
          weiterleitungAktiv: body?.weiterleitungAktiv !== false,
          absender: "kids@alae.app",
          bereit: true,
          eingangBereit: true,
          ...(body?.aktion === "test" ? { test: { an: body?.weiterleitungAn || "vonallmenalain@gmail.com", gesendet: true } } : {}),
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ uid: body?.uid, frei: body?.frei !== false, konten: 3 }) });
  });
  await page.addInitScript(firebaseErsatz, { daten, adminEmail: ADMIN });
  return { context, page };
}

let page;
const knips = async (name) => {
  const ordner = process.env.SCREENSHOT_DIR || process.env.BILDER;
  if (ordner) await page.screenshot({ path: path.join(ordner, `${name}.png`), fullPage: true });
};
const text = async (locator) => ((await locator.textContent()) || "").replace(/\s+/g, " ").trim();

// --- Der Weg hinein ----------------------------------------------------------
// Im Profilfenster steht seit dem Umbau nur noch die Tür: ein Knopf auf die
// eigene Seite. Führte er ins Leere, käme niemand mehr hin.
const erstes = await neuesFenster(DATEN);
page = erstes.page;
await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
await page.locator(".account-button").click();
const tuer = page.locator("a.admin-link");
await tuer.waitFor({ timeout: 10000 }).catch(() => {});
pruefe(await tuer.count() === 1, "Im Profilfenster steht kein Knopf zum Adminbereich");
pruefe((await text(tuer)).includes("Zum Adminbereich"), `Der Knopf heisst anders: "${await text(tuer)}"`);
pruefe(await page.locator("[data-admin-section]").count() === 0, "Der Adminbereich steht immer noch im Profilfenster");
await knips("0-tuer-im-fenster");
await tuer.click();
await page.waitForURL(/admin\.html/, { timeout: 10000 });

// Welche Level es wirklich gibt. Die Levelabdeckung vergleicht den
// Fortschritt eines Kontos mit dem Katalog aus app.js – mit erfundenen
// Kennungen träfe sie nichts, und die Prüfung sagte nur, dass nichts
// getroffen wird. Also werden die Vorgabe-Level auf echte umgeschrieben.
const katalog = await page.evaluate(() => ({
  arukone: (window.LernappLevelCatalog?.arukone || []).slice(0, 2).map((level) => level.id),
  kakuro: (window.LernappLevelCatalog?.kakuro || []).slice(0, 1).map((level) => level.id),
}));
pruefe(katalog.arukone.length === 2 && katalog.kakuro.length === 1, `Der Levelkatalog ist auf der Seite nicht geladen: ${JSON.stringify(katalog)}`);
await erstes.context.close();

const ECHTE_DATEN = { ...DATEN, levels: { ...DATEN.levels } };
delete ECHTE_DATEN.levels["users/kind-mia/levelProgress/arukone_a1"];
delete ECHTE_DATEN.levels["users/kind-mia/levelProgress/arukone_a2"];
delete ECHTE_DATEN.levels["users/kind-mia/levelProgress/kakuro_k1"];
ECHTE_DATEN.levels[`users/kind-mia/levelProgress/arukone_${katalog.arukone[0]}`] = { game: "arukone", levelId: katalog.arukone[0], levelName: "Rätsel eins", difficulty: "easy", solved: true, attempts: 3, resets: 2, moves: 40, timeSeconds: 120 };
ECHTE_DATEN.levels[`users/kind-mia/levelProgress/arukone_${katalog.arukone[1]}`] = { game: "arukone", levelId: katalog.arukone[1], levelName: "Rätsel zwei", difficulty: "easy", solved: true, attempts: 1, resets: 0, moves: 25, timeSeconds: 80 };
ECHTE_DATEN.levels[`users/kind-mia/levelProgress/kakuro_${katalog.kakuro[0]}`] = { game: "kakuro", levelId: katalog.kakuro[0], levelName: "Kakuro eins", difficulty: "medium", solved: false, attempts: 4, resets: 3, moves: 60, timeSeconds: 200 };

// --- Die Seite ----------------------------------------------------------------
const zweites = await neuesFenster(ECHTE_DATEN);
page = zweites.page;
await page.goto(`${BASIS}/admin.html`, { waitUntil: "domcontentloaded" });
await page.locator(".admin-reiter").waitFor({ timeout: 15000 });
await page.locator(".admin-entry").first().waitFor({ timeout: 15000 });

const reiter = (await page.locator(".admin-reiter [data-reiter]").allTextContents()).map((t) => t.trim());
pruefe(reiter.length === 6, `Es gibt ${reiter.length} Reiter, erwartet 6: ${reiter.join(", ")}`);
["User", "Gäste", "Spiele", "Wagen", "Gruppen", "E-Mail"].forEach((name) => {
  pruefe(reiter.includes(name), `Der Reiter "${name}" fehlt: ${reiter.join(", ")}`);
});

// --- Zugeklappt ----------------------------------------------------------------
const zeilen = await page.locator(".admin-entry").count();
pruefe(zeilen === 4, `Es stehen ${zeilen} Konten da, erwartet 4`);
pruefe(await page.locator(".admin-entry-body").count() === 0,
  "Beim Öffnen ist schon ein Konto aufgeklappt – die Liste soll zugeklappt beginnen");

const balken = await page.locator(".admin-entry").first().locator(".admin-train-car").count();
pruefe(balken === 5, `Die Zeile zeigt ${balken} Wagen, erwartet 5`);

const gruppenMarken = await page.locator(".admin-entry-group").allTextContents();
pruefe(gruppenMarken.filter((eintrag) => eintrag.trim() === "Familie").length === 3,
  `Die Gruppe steht an ${gruppenMarken.length} Zeilen: ${gruppenMarken.join(", ")}`);

// Rolle und Kaufstand: die beiden Wörter, nach denen hier gesucht wird.
const marken = await page.locator(".admin-marke").allTextContents();
pruefe(marken.some((m) => m.trim() === "Eltern"), `Keine Zeile ist als Eltern markiert: ${marken.join(", ")}`);
pruefe(marken.filter((m) => m.trim() === "Kind").length === 2, `Erwartet zwei Kinder-Marken: ${marken.join(", ")}`);
pruefe(marken.filter((m) => m.trim() === "Bezahlt").length === 3, `Erwartet drei Bezahlt-Marken: ${marken.join(", ")}`);
pruefe(await page.locator(".admin-entry-zuletzt").count() === 4, "Nicht jede Zeile trägt das Datum der letzten Aktivität");
await knips("1-konten-zugeklappt");

// --- Zahlen oben ---------------------------------------------------------------
const kopfzahlen = await text(page.locator(".admin-stat-strip").first());
pruefe(/4\s*Konten/.test(kopfzahlen), `Die Kopfzahlen zählen nicht 4 Konten: "${kopfzahlen}"`);
pruefe(/3\s*bezahlt/.test(kopfzahlen), `Die Kopfzahlen zählen nicht 3 bezahlte: "${kopfzahlen}"`);
pruefe(/1\s*gratis/.test(kopfzahlen), `Die Kopfzahlen zählen nicht 1 gratis: "${kopfzahlen}"`);

// --- Filtern -------------------------------------------------------------------
const namen = async () => (await page.locator(".admin-entry-name strong").allTextContents()).map((t) => t.trim());
await page.locator('[data-kauf-filter="gratis"]').click();
await page.waitForTimeout(200);
pruefe((await namen()).join(",") === "Alain", `Der Gratis-Filter zeigt ${(await namen()).join(", ")}, erwartet nur Alain`);
await page.locator('[data-kauf-filter="bezahlt"]').click();
await page.waitForTimeout(200);
pruefe((await namen()).length === 3, `Der Bezahlt-Filter zeigt ${(await namen()).length} Konten, erwartet 3`);
await page.locator('[data-kauf-filter="alle"]').click();
await page.locator('[data-rolle-filter="kinder"]').click();
await page.waitForTimeout(200);
pruefe((await namen()).sort().join(",") === "Ben,Mia", `Der Kinder-Filter zeigt ${(await namen()).join(", ")}`);
await page.locator('[data-rolle-filter="eltern"]').click();
await page.waitForTimeout(200);
pruefe(!(await namen()).includes("Mia"), "Der Eltern-Filter zeigt ein Kind");
await page.locator('[data-rolle-filter="alle"]').click();
await page.waitForTimeout(200);

// Suchen: der kürzeste Weg zu einem bestimmten Kind.
await page.locator("[data-suche]").fill("ben");
await page.waitForTimeout(250);
pruefe((await namen()).join(",") === "Ben", `Die Suche nach "ben" findet ${(await namen()).join(", ")}`);
await page.locator("[data-suche]").fill("");
await page.waitForTimeout(250);
await knips("2-gefiltert");

// --- Sortieren -----------------------------------------------------------------
// Das Datum der letzten Aktivität ist die Voreinstellung, neueste zuerst.
pruefe((await namen())[0] === "Alain", `Zuoberst steht ${(await namen())[0]}, erwartet das zuletzt aktive Konto (Alain)`);
pruefe((await namen()).at(-1) === "Ben", `Zuunterst steht ${(await namen()).at(-1)}, erwartet das längst inaktive (Ben)`);
// Noch einmal dieselbe Spalte dreht die Richtung um.
await page.locator('[data-sortierung="aktivitaet"]').click();
await page.waitForTimeout(200);
pruefe((await namen())[0] === "Ben", `Umgedreht steht ${(await namen())[0]} zuoberst, erwartet Ben`);
await page.locator('[data-sortierung="name"]').click();
await page.waitForTimeout(200);
pruefe((await namen()).join(",") === "Alain,Ben,Familie Muster,Mia", `Nach Namen sortiert: ${(await namen()).join(", ")}`);
await page.locator('[data-sortierung="kauf"]').click();
await page.waitForTimeout(200);
pruefe((await namen()).at(-1) === "Alain", `Nach Kaufstand sortiert steht ${(await namen()).at(-1)} zuunterst, erwartet das Konto ohne Kauf`);
await page.locator('[data-sortierung="aktivitaet"]').click();
await page.waitForTimeout(200);

// --- Aufklappen ------------------------------------------------------------------
const miaZeile = page.locator('.admin-entry:has([data-konto="kind-mia"])');
await miaZeile.locator(".admin-entry-head").click();
await miaZeile.locator(".admin-entry-body").waitFor({ timeout: 10000 });

pruefe(await page.locator(".admin-entry-body").count() === 1, "Ein Tipp klappt mehr als ein Konto auf");
const koerper = miaZeile.locator(".admin-entry-body");
for (const [wahl, was] of [
  [".admin-train-detail", "der Zug-Fortschritt"],
  [".admin-abdeckung", "die probierten Level"],
  [".admin-kauf", "der Kaufstand"],
  [".admin-group", "die Gruppe"],
  [".admin-stufe", "die Schwierigkeitsstufe"],
  [".admin-reset", "das Zurücksetzen"],
  [".admin-game-filter", "der Spiel-Filter"],
  [".admin-columns", "Level und Sitzungen"],
]) {
  pruefe(await koerper.locator(wahl).count() > 0, `Aufgeklappt fehlt ${was} (${wahl})`);
}

const levelKarten = await koerper.locator(".admin-columns section").first().locator(".admin-data-card").count();
pruefe(levelKarten === 3, `Mia hat ${levelKarten} Level-Karten, erwartet 3`);
const wagenZahl = await koerper.locator(".admin-train-detail > div > span").count();
pruefe(wagenZahl === 5, `Der Zug-Fortschritt zeigt ${wagenZahl} Bereiche, erwartet 5`);

// Die Frage, die eine Liste gelöster Level nicht beantwortet: was NICHT
// angefasst wurde. Ein Punkt je Level, und Mia hat genau zwei gelöst.
const abdeckung = koerper.locator(".admin-abdeckung");
pruefe(await abdeckung.locator(".abdeckung-punkte i").count() > 50, "Die Levelabdeckung zeigt kaum Punkte – der Levelkatalog fehlt");
pruefe(await abdeckung.locator(".abdeckung-punkte i.ist-geloest").count() === 2, `Mia hat ${await abdeckung.locator(".abdeckung-punkte i.ist-geloest").count()} gelöste Punkte, erwartet 2`);
pruefe(await abdeckung.locator(".abdeckung-punkte i.ist-probiert").count() === 1, "Das angefangene, ungelöste Level ist nicht als solches markiert");
pruefe(await abdeckung.locator(".abdeckung-punkte i.ist-offen").count() > 50, "Kein Level gilt als nie geöffnet – so wäre nicht zu sehen, was fehlt");
await knips("3-konto-aufgeklappt");

// --- Freischalten ------------------------------------------------------------------
// Der Knopf, den es sonst nirgends gibt. Geschrieben wird der Eintrag vom
// Server, nicht vom Client – hier wird geprüft, dass der Aufruf hingeht.
const alainZeile = page.locator('.admin-entry:has([data-konto="admin1"])');
await miaZeile.locator(".admin-entry-head").click();
await page.waitForTimeout(300);
await alainZeile.locator(".admin-entry-head").click();
await alainZeile.locator(".admin-entry-body").waitFor({ timeout: 10000 });
const kaufKarte = alainZeile.locator(".admin-kauf");
pruefe((await text(kaufKarte)).includes("Nicht freigeschaltet"), `Das Konto ohne Kauf zeigt: "${await text(kaufKarte)}"`);
await knips("4-freischalten");
await alainZeile.locator("[data-gratis-an]").click();
await page.waitForTimeout(1200);
const ruf = anfragen.find((a) => a.pfad === "freischalten");
pruefe(Boolean(ruf), "Freischalten ruft den Server nicht an");
pruefe(ruf?.body?.uid === "admin1" && ruf?.body?.frei === true, `Freischalten schickt ${JSON.stringify(ruf?.body)}`);
pruefe(ruf?.methode === "POST" && ruf?.token.startsWith("Bearer "), "Freischalten geht ohne Token oder nicht per POST");

// --- Der Reiter "Spiele" -------------------------------------------------------
await page.locator('[data-reiter="games"]').click();
await page.locator(".admin-game-card").first().waitFor({ timeout: 10000 });

const karten = await page.locator(".admin-game-card").count();
pruefe(karten === 25, `Die Auswertung zeigt ${karten} Spiele, erwartet 25`);

// Arukone: drei Konten haben daran gespielt – Mia zweimal gelöst, Ben nicht,
// der Gast einmal. Versuche 3+1+2+1 = 7, gelöst 3, Neustarts 2+0+1+0 = 3.
const arukoneText = await text(page.locator('.admin-game-card:has-text("Arukone")').first());
pruefe(/Gespielt\s*7/.test(arukoneText), `Arukone: "${arukoneText.slice(0, 160)}"`);
pruefe(/Abgeschlossen\s*3/.test(arukoneText), `Arukone abgeschlossen stimmt nicht: "${arukoneText.slice(0, 160)}"`);
pruefe(/Neu gestartet\s*3/.test(arukoneText), `Arukone Neustarts stimmen nicht: "${arukoneText.slice(0, 160)}"`);

// Turmbau führt keine Neustarts – dort muss ein Strich stehen, keine Null.
const turmbauText = await text(page.locator('.admin-game-card:has-text("Turmbau")').first());
pruefe(/Neu gestartet\s*–/.test(turmbauText), `Turmbau zeigt bei Neustarts keine „–“: "${turmbauText.slice(0, 160)}"`);
pruefe(/Gespielt\s*9/.test(turmbauText), `Turmbau: 6 + 3 Runden erwartet – "${turmbauText.slice(0, 160)}"`);
pruefe(/24 Blöcke/.test(turmbauText), `Turmbau: der Bestwert fehlt – "${turmbauText.slice(0, 160)}"`);
pruefe(/Mia/.test(turmbauText), `Turmbau: der Halter des Bestwerts fehlt – "${turmbauText.slice(0, 160)}"`);

// Ein Bereichsfilter blendet aus.
await page.locator('[data-bereich="zahlbuchstabe"]').click();
await page.waitForTimeout(300);
pruefe(await page.locator(".admin-game-card").count() === 5, `Der Bereich "Zahl und Buchstabe" zeigt ${await page.locator(".admin-game-card").count()} Spiele, erwartet 5`);

// --- Der Reiter "Wagen" ---------------------------------------------------------
// Zwei Sets als Zug, das erste aktiv, das zweite zum Wechseln – aber erst nach
// einer Rückfrage, und die lässt sich abbrechen.
await page.locator('[data-reiter="wagons"]').click();
await page.locator(".admin-set").first().waitFor({ timeout: 10000 });
pruefe(await page.locator(".admin-set").count() === 2, "Der Wagen-Reiter zeigt nicht zwei Sets");
pruefe(await page.locator(".admin-set.is-active").count() === 1, "Genau ein Set muss als aktiv markiert sein");
pruefe(await page.locator(".admin-set-preview svg").count() === 2, "Die Vorschau-Züge fehlen");
pruefe(await page.locator('[data-set-vorschau="2"] [data-wagon="unicorn"]').count() === 1, "Im zweiten Set fehlt das Einhorn in der Vorschau");
pruefe(await page.locator("[data-set-ja]").count() === 0, "Die Rückfrage steht schon da, bevor jemand wechseln will");
await knips("5-wagen");
await page.locator("[data-set-frage]").click();
await page.waitForTimeout(300);
pruefe(await page.locator("[data-set-ja]").count() === 1, "Der Wechsel fragt nicht nach");
await knips("6-wagen-rueckfrage");
await page.locator("[data-set-ab]").click();
await page.waitForTimeout(300);
pruefe(await page.locator("[data-set-ja]").count() === 0, "Abbrechen nimmt die Rückfrage nicht weg");
pruefe(await page.evaluate(() => window.__ersatz.lies("config/train")) === null,
  "Das Wagen-Set wurde umgestellt, obwohl abgebrochen wurde");
pruefe((await text(page.locator(".admin-eigene-sets"))).includes("Ben"),
  "Der Wagen-Reiter nennt die Familie mit eigener Wahl nicht");

// Und jetzt wirklich umstellen: Das hebt die eigene Wahl auf.
await page.locator("[data-set-frage]").click();
await page.waitForTimeout(300);
await page.locator("[data-set-ja]").click();
await page.waitForFunction(() => /Umgestellt auf/.test(document.querySelector(".admin-set-done")?.textContent || ""), null, { timeout: 30000 }).catch(() => {});
const nachUmstellen = await page.evaluate(() => ({
  global: window.__ersatz.lies("config/train")?.wagonSet,
  ben: window.__ersatz.lies("users/kind-ben")?.wagonSet,
  meldung: document.querySelector(".admin-set-done")?.textContent || "",
}));
pruefe(nachUmstellen.global === "2", `config/train steht auf ${nachUmstellen.global} statt 2`);
pruefe(!nachUmstellen.ben, `die eigene Wahl der Familie steht noch da: ${JSON.stringify(nachUmstellen.ben)}`);
pruefe(/eigener Wahl/.test(nachUmstellen.meldung), `die Meldung sagt nichts über die aufgehobenen Wahlen: "${nachUmstellen.meldung.replace(/\s+/g, " ").trim()}"`);
await knips("6b-wagen-umgestellt");

// --- Der Reiter "Gruppen" --------------------------------------------------------
// Eine Familie ist von selbst eine Gruppe. Was es nur hier gibt, ist die
// übergreifende: zwei Familien in einer. Das kann sonst niemand.
await page.locator('[data-reiter="groups"]').click();
await page.locator(".admin-gruppen").waitFor({ timeout: 10000 });
pruefe(await page.locator(".admin-gruppe").count() >= 2, "Die Gruppen-Sicht zeigt weder die Familie noch die Konten ohne Gruppe");
pruefe((await text(page.locator('.admin-gruppe:has-text("Familie")').first())).includes("3 Konten"),
  "Die Familiengruppe zählt nicht ihre drei Konten");
await page.locator("[data-gruppe-neu]").click();
await page.locator(".admin-gruppe-editor").waitFor({ timeout: 5000 });
await page.locator("[data-editor-name]").fill("Nachbarschaft");
// Eine ganze Familie auf einmal: Wer zwei Familien zusammenlegt, hakt zwei
// Blöcke an und sucht nicht acht Zeilen zusammen.
await page.locator('[data-familie="eltern-1"]').check();
await page.waitForTimeout(300);
pruefe(await page.locator("[data-mitglied]:checked").count() === 3, `Die Familie hakt ${await page.locator("[data-mitglied]:checked").count()} Konten an, erwartet 3`);
await knips("7-gruppen-editor");
await page.locator("[data-editor-speichern]").click();
await page.waitForTimeout(2000);
const nachher = await page.evaluate(() => ({
  eltern: window.__ersatz.lies("users/eltern-1")?.group,
  mia: window.__ersatz.lies("users/kind-mia")?.group,
  admin: window.__ersatz.lies("users/admin1")?.group,
}));
pruefe(nachher.eltern?.name === "Nachbarschaft", `Das Elternkonto steht in ${JSON.stringify(nachher.eltern)}`);
pruefe(nachher.mia?.name === "Nachbarschaft", `Das Kind steht in ${JSON.stringify(nachher.mia)}`);
pruefe(nachher.eltern?.by === "admin", "Die Zuordnung ist nicht als vom Admin gesetzt markiert – der Server schriebe sie beim nächsten Anmelden weg");
pruefe(!nachher.admin, "Ein nicht angehaktes Konto ist in der Gruppe gelandet");
await knips("8-gruppen-fertig");

// --- Gäste -------------------------------------------------------------------
await page.locator('[data-reiter="guests"]').click();
await page.locator(".admin-entry").first().waitFor({ timeout: 10000 });
pruefe(await page.locator(".admin-entry").count() === 1, "Der Gast fehlt im Gäste-Reiter");
pruefe(await page.locator(".admin-entry-body").count() === 0, "Der Gäste-Reiter beginnt nicht zugeklappt");
await page.locator(".admin-entry-head").first().click();
await page.locator(".admin-entry-body").waitFor({ timeout: 10000 });
pruefe(await page.locator(".admin-entry-body .admin-reset").count() === 0,
  "Ein Gast bekommt den Zurücksetzen-Knopf – sein Stand liegt auf seinem Gerät, der Knopf täte dort nichts Sichtbares");
pruefe(await page.locator(".admin-entry-body .admin-kauf").count() === 0,
  "Ein Gast bekommt den Freischalten-Knopf – ohne Konto gibt es nichts freizuschalten");

// --- Ganz entfernen ---------------------------------------------------------------
// Der einzige Knopf, der auch die Anmeldung mitnimmt. Geprüft wird, dass er
// zweimal fragt, dass er beim eigenen Konto gar nicht erst erscheint, und dass
// eine Familie die Namen der Kinder nennt, bevor sie verschwindet.
// Frisch laden: Die Abschnitte davor haben gefiltert, sortiert, Konten
// aufgeklappt und Gruppen umgeschrieben. addInitScript baut den Speicher bei
// jeder Navigation neu aus DATEN auf – damit steht hier wieder der Anfangs-
// zustand, und die Prüfung hängt nicht daran, was vorher geklickt wurde.
await page.goto(`${BASIS}/admin.html`, { waitUntil: "load" });
await page.locator(".admin-reiter").waitFor({ timeout: 15000 });
await page.locator(".admin-entry-head").first().waitFor({ timeout: 10000 });

// Das eigene Konto des Admins: kein Knopf, sondern der Grund dafür.
await page.locator('.admin-entry:has-text("Alain") .admin-entry-head').first().click();
await page.locator(".admin-entry-body").waitFor({ timeout: 10000 });
pruefe(await page.locator("[data-loeschen-frage]").count() === 0,
  "Der Admin kann sein eigenes Konto löschen – danach käme er nicht mehr herein");
pruefe((await text(page.locator(".admin-entry-body"))).includes("Das ist dein eigenes Konto"),
  "Beim eigenen Konto fehlt der Grund, warum nicht gelöscht werden kann");
await page.locator('.admin-entry:has-text("Alain") .admin-entry-head').first().click();

// Das Elternkonto mit zwei Kindern: Die Rückfrage nennt beide.
await page.locator('.admin-entry:has-text("Familie Muster") .admin-entry-head').first().click();
await page.locator("[data-loeschen-frage]").first().waitFor({ timeout: 10000 });
await page.locator("[data-loeschen-frage]").first().click();
await page.locator("[data-loeschen-ja]").waitFor({ timeout: 5000 });
const frageText = await text(page.locator(".admin-reset.is-confirming"));
pruefe(frageText.includes("Mia") && frageText.includes("Ben"),
  `Die Rückfrage nennt die Kinder nicht: ${frageText.slice(0, 200)}`);
pruefe(frageText.includes("3 Konten"), "Die Rückfrage sagt nicht, wie viele Konten es trifft");
await knips("10-loeschen-frage");

// Abbrechen tut nichts.
const vorherAnfragen = anfragen.filter((a) => a.pfad === "konto-loeschen").length;
await page.locator("[data-frage-ab]").first().click();
await page.waitForTimeout(300);
pruefe(anfragen.filter((a) => a.pfad === "konto-loeschen").length === vorherAnfragen,
  "Abbrechen hat trotzdem gelöscht");

// Und mit Ja geht es an den Server – mit Token und mit auchKinder.
await page.locator("[data-loeschen-frage]").first().click();
await page.locator("[data-loeschen-ja]").waitFor({ timeout: 5000 });
await page.locator("[data-loeschen-ja]").click();
await page.waitForTimeout(1500);
const geloescht = anfragen.filter((a) => a.pfad === "konto-loeschen");
pruefe(geloescht.length === 1, `Löschen rief den Server ${geloescht.length}-mal an, erwartet einmal`);
pruefe(geloescht[0]?.body?.uid === "eltern-1", `Gelöscht wurde ${JSON.stringify(geloescht[0]?.body)}`);
pruefe(geloescht[0]?.body?.auchKinder === true, "Die Kinder wurden nicht mitgeschickt – sie blieben als Gründer zurück");
pruefe(geloescht[0]?.token.startsWith("Bearer "), "Das Löschen ging ohne Token an den Server");

// --- Der Reiter "E-Mail" ---------------------------------------------------------
// Was verschickt wurde, was ankam, und wohin die Post weitergeleitet wird.
await page.locator('[data-reiter="mails"]').click();
await page.locator(".admin-mail-einstellungen").waitFor({ timeout: 10000 });
await page.locator(".admin-mail-zeile").first().waitFor({ timeout: 10000 });
pruefe(await page.locator(".admin-mail-zeile").count() === 3, `Der Reiter E-Mail zeigt ${await page.locator(".admin-mail-zeile").count()} Mails, erwartet 3`);
pruefe(await page.locator(".admin-mail-zeile.is-fehler").count() === 1, "Die Mail, die nicht rausging, ist nicht als Fehler zu erkennen");
pruefe((await page.locator("[data-mail-adresse]").inputValue()) === "vonallmenalain@gmail.com",
  "Die Weiterleitungsadresse steht nicht im Feld");

// Filtern: Eingang lässt genau die eine übrig.
await page.locator('[data-mail-filter="ein"]').click();
await page.waitForTimeout(200);
pruefe(await page.locator(".admin-mail-zeile").count() === 1, "Der Filter «Eingang» zeigt nicht genau die eine angekommene Mail");
await page.locator('[data-mail-filter="fehler"]').click();
await page.waitForTimeout(200);
pruefe(await page.locator(".admin-mail-zeile").count() === 1, "Der Filter «Fehler» zeigt nicht genau die eine misslungene Mail");
await page.locator('[data-mail-filter="alle"]').click();
await page.waitForTimeout(200);

// Aufklappen: der Inhalt steht da.
await page.locator('.admin-mail-zeile:has-text("Frage zur Lizenz") .admin-entry-head').click();
await page.locator(".admin-mail-text").waitFor({ timeout: 5000 });
pruefe((await text(page.locator(".admin-mail-text"))).includes("Schulklasse"),
  "Die aufgeklappte Mail zeigt ihren Text nicht");
await knips("9-mails");

// Speichern ruft den Server an – ändern darf das nur er.
await page.locator("[data-mail-adresse]").fill("post@example.com");
await page.locator("[data-mail-speichern]").click();
await page.waitForTimeout(1500);
const gespeichert = anfragen.filter((a) => a.pfad === "mail-einstellungen" && a.body?.aktion === "speichern");
pruefe(gespeichert.length === 1, `Speichern rief den Server ${gespeichert.length}-mal an, erwartet einmal`);
pruefe(gespeichert[0]?.body?.weiterleitungAn === "post@example.com",
  `Gespeichert wurde ${JSON.stringify(gespeichert[0]?.body)}`);
pruefe(gespeichert[0]?.token.startsWith("Bearer "), "Das Speichern ging ohne Token an den Server");

await browser.close();
halt();

if (seitenFehler.length) befunde.push(...seitenFehler.map((f) => `Fehler auf der Seite: ${f}`));
if (befunde.length) {
  console.error(`${befunde.length} Befund(e):`);
  befunde.forEach((zeile) => console.error(`  - ${zeile}`));
  process.exit(1);
}

console.log("Adminbereich geprüft: eigene Seite, sechs Reiter, filtern und sortieren, probierte Level, freischalten, Konten ganz entfernen mit Rückfrage, Auswertung je Spiel, Wagen mit Rückfrage und aufgehobenen Familienwahlen, übergreifende Gruppe, Postein- und -ausgang.");
