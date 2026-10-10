/*
 * Die Leseecke im Browser: einsteigen, spielen, lesen, aussteigen.
 * ---------------------------------------------------------------------------
 * Was validate-lesen.mjs an den Listen nachrechnet, zeigt sich hier am
 * Bildschirm. Geprüft wird als Gast (Firebase ist umgeleitet) und mit einer
 * Sprachausgabe, die sich merkt, was gesagt wird, und sofort fertig ist –
 * ebenso die Aufnahmen der Laute (lesen-laute.js):
 *
 *   Startbild     Der Lesewagen steht auf jedem Bildschirm im Bild, gross
 *                 genug zum Antippen, und deckt keinen anderen Knopf zu.
 *                 Ein Tipp öffnet das Zimmer mit seinen sieben Orten; durch
 *                 seine zwei Fenster scheint eine Sonne, nicht zwei.
 *   Die Orte      Jeder führt auf seine Seite; dort steht die Bühne, der Pfeil
 *                 zurück führt in den Lesewagen (index.html?lesen=1).
 *   Silbenzug     Eine ganze Runde, für jede Silbe ein Schlag: sechs von
 *                 sechs, drei Sterne, und die Schnupperrunde ist verbraucht.
 *   Laute kuppeln Die Stimme sagt Laute und halbe Silben, aber nie das ganze
 *                 Wort, bevor das Kind das Bild gewählt hat.
 *   Buchstabenhaus Entdecken öffnet ein Fenster, das Suchspiel zählt Treffer
 *                 im Lesestand. Offen sind nur so viele Fenster, wie die Stufe
 *                 sagt, nie zwei, die gleich klingen; ein Laut kommt mit
 *                 seinem Wort («a – wie Affe»), der Laut aus der Aufnahme.
 *   Stimmt das?   Der Würfel: Ein Satz, der stimmen soll, beschreibt das Bild;
 *                 einer, der nicht stimmen soll, weicht ab – auf jeder Stufe.
 *   Bücher        Das Hörbuch liest von selbst vor; im Zusammen-Modus liest
 *                 die Stimme den Satz des Kindes nicht; nach den Fragen stehen
 *                 Sterne da, das Buch ist gelesen, und der Lesewurm ist
 *                 gewachsen. Ein Buch, das zum Kauf gehört, zeigt das Tor;
 *                 der Lesewurm im Sessel öffnet ein passendes Buch. Ein
 *                 Kapitelbuch zeigt und liest seine Überschriften, sein
 *                 Lesezeichen führt zurück, wo das Kind aufgehört hat, und
 *                 fällt heraus, wenn das Buch aus ist. Ohne Wort-Hilfe
 *                 schweigt ein Tipp beim Selberlesen; «sehr gross» ist grösser.
 *                 Alle Bücher haben gemalte Bilder: im Regal, auf der
 *                 Titelseite und auf jeder Seite, alle gleich beim Aufgehen
 *                 geladen; fehlt eines, zeigt die Seite ihre Zeichnung, und
 *                 ein Buch ohne Bilder zeichnet wie bisher. Postkarte und
 *                 Steckbrief zeigen ihr gemaltes Bild ebenso.
 *   Aufnahmen     Gibt es einen festen Text als Aufnahme (lesen-stimme.js),
 *                 spielt sie statt der Sprachausgabe: der Titel und ein Satz
 *                 des Hörbuchs, die Hilfe im Silbenzug – ein zweiter Tipp hält
 *                 sie an, und lädt sie nicht, spricht die Gerätestimme. Im
 *                 Lesewagen sagt die Gerätestimme den Vorschlag des
 *                 Lesewurms, die Aufnahme den Rest. Liegen echte Aufnahmen im
 *                 Repo, spielt die kürzeste wirklich, und der Service Worker
 *                 legt sie in ihren Cache und beantwortet Anfragen in
 *                 Stücken (Range), wie Safari sie stellt.
 *   Stolperwörter Der Lautsprecher über den Wörtern liest den Satz mit dem
 *                 Stein: auf «leicht» auch von selbst, auf «mittel» erst auf
 *                 einen Tipp. Auf Zeit fehlt er.
 *   Auf Zeit     Auf «schwer» bieten Stimmt das? und Stolperwörter die Uhr
 *                 an: ohne Vorlesen, mit eigenem Bestwert im Lesestand.
 *   Mitwachsen    Ein Spiel, das einen Schritt gewachsen ist, spielt eine
 *                 Stufe höher als das Kind; eine Runde zählt für die Serie.
 *   Lesewurm      Auf dem Sofa sitzt er in der Stufe, die der Lesestand sagt;
 *                 die Missionskarte zeigt, was er vorschlägt, und so viele
 *                 Buchstaben, wie er hat. Ein Tipp auf ihn merkt die Mission,
 *                 und die Runde dieses Spiels bringt zwei Buchstaben. Nach dem
 *                 Lesefalter zieht er aufs Regal und ein neuer schlüpft, dann
 *                 der Express, zuletzt der Zauberer – danach keine Leiste mehr.
 *   Ruhe          Zurück aus einem Spiel, mit Konto: Das Zimmer steht einmal
 *                 da, auch wenn sich die Cloud nacheinander meldet; was sie am
 *                 Zimmer ändert, kommt an Ort und Stelle hinein.
 *   Bewegung      Mit Animationen: Kein Teil einer Zeichnung verliert seine
 *                 Lage an CSS, der winkende Arm ist oben; Text in den Spielen
 *                 lässt sich nicht markieren (Android: «Tippen zum Suchen»).
 *                 Im Zimmer hüpft beim Hereinkommen reihum, was sich antippen
 *                 lässt, zuletzt der Lesewurm – die Einrichtung nie, die
 *                 Schatten bleiben am Boden, und beim Auffrischen hüpft nichts
 *                 noch einmal. Ohne Bewegung hüpft gar nichts.
 *
 * Aufruf:  node scripts/check-leseecke.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import { texte as stimmeTexte, verzeichnis as stimmeVerzeichnis } from "./stimme-texte.mjs";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4197);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich die Leseecke nicht prüfen."); process.exit(2); }

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });
async function warteAufServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht */ } await new Promise((w) => setTimeout(w, 100)); }
  return false;
}

const befunde = [];
const fehlt = (was) => befunde.push(was);

// Eine Sprachausgabe, die sofort fertig ist und sich merkt, was sie sagen
// sollte. Ebenso die Aufnahmen: Sie sind gleich zu Ende, und gemerkt wird,
// welche lief. Läuft vor jedem Skript der Seite.
//
//   __gesagt          was zu hören war – aus der Sprachausgabe oder als
//                     Aufnahme eines festen Textes (lesen-stimme.js)
//   __sprachausgabe   nur, was die Sprachausgabe sagte
//   __gespielt        die Quellen der Audio-Elemente
//
// __aufnahmeKaputt: eine Aufnahme lädt nicht. __aufnahmeHaengt: sie spielt,
// bis jemand sie anhält. { echtesAudio: true }: Audio-Elemente spielen
// wirklich.
function stimmeErsatz(wie = {}) {
  window.__gesagt = [];
  window.__sprachausgabe = [];
  window.__gespielt = [];
  if (!wie?.echtesAudio) {
    HTMLMediaElement.prototype.play = function play() {
      const quelle = String(this.src);
      window.__gespielt.push(quelle);
      if (window.__aufnahmeKaputt) return Promise.reject(new DOMException("lädt nicht", "NotSupportedError"));
      const dateien = window.LernappStimmeDateien || {};
      const text = Object.keys(dateien).find((t) => quelle.endsWith(`/${dateien[t]}`));
      if (text) window.__gesagt.push(text);
      // Zu Ende ist sie nur, wenn das Element nicht inzwischen etwas anderes spielt.
      if (!window.__aufnahmeHaengt) setTimeout(() => { if (String(this.src) === quelle) this.dispatchEvent(new Event("ended")); }, 10);
      return Promise.resolve();
    };
  }
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [],
    speak(aeusserung) {
      window.__gesagt.push(String(aeusserung.text));
      window.__sprachausgabe.push(String(aeusserung.text));
      setTimeout(() => aeusserung.dispatchEvent(new Event("end")), 10);
    },
    cancel() {}, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
}

// Ein Augenblick Stille als WAV (8 kHz, 8 Bit, mono).
function stilleWav(sekunden) {
  const n = Math.round(8000 * sekunden);
  const b = Buffer.alloc(44 + n, 0x80);
  b.write("RIFF", 0, "latin1"); b.writeUInt32LE(36 + n, 4); b.write("WAVE", 8, "latin1");
  b.write("fmt ", 12, "latin1"); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34);
  b.write("data", 36, "latin1"); b.writeUInt32LE(n, 40);
  return b;
}

// Die Schranke ganz offen – wie nach dem Kauf. Für die Bücher, die nicht frei
// sind; das Tor selbst prüft check-schranke.mjs.
function schrankeOffen() {
  const frei = {
    STATIONS_FREE: 10, GRATIS_RUNDEN: 1, AREAS: [],
    reason: () => "gekauft", isFree: () => true, isLoaded: () => true, whenReady: () => Promise.resolve(true),
    stationFree: () => true, gameFree: () => true, levelFree: () => true, targetFree: () => true, buchFree: () => true,
    gameEntry: () => null, gameGespielt: () => false, gespielteRunden: () => 0, rundeBeendet() {}, showGate: () => () => {}, closeGate() {}, onChange: () => () => {},
  };
  Object.defineProperty(window, "LernappEntitlement", { get: () => frei, set() {}, configurable: true });
}

// Ein schlankes Firebase (wie in check-schranke.mjs): ein angemeldetes Kind,
// das sich erst nach einem Moment meldet, und in seinem Kontodokument ein
// Lesestand, der weiter ist als der auf dem Gerät – gelesen auf einem anderen.
function firebaseMitKonto(lesen) {
  const daten = new Map([["users/kind-leser", {
    authEmail: "mia@lernapp.local", email: null, username: "Mia", displayName: "Mia", role: "child",
    stats: { totalSeconds: 60, moves: 5, resets: 0, solvedLevels: 0, sessions: 1 },
    gameState: { "lernapp.lesen": { data: lesen, updatedAt: 1700000000000 } },
  }]]);
  const schnapp = (pfad) => ({ exists: daten.has(pfad), id: pfad.split("/").pop(), data: () => daten.get(pfad) });
  const docRef = (pfad) => ({
    path: pfad, id: pfad.split("/").pop(),
    async get() { return schnapp(pfad); },
    async set(nutzlast, optionen) { daten.set(pfad, optionen?.merge ? { ...(daten.get(pfad) || {}), ...nutzlast } : nutzlast); },
    async update(nutzlast) { daten.set(pfad, { ...(daten.get(pfad) || {}), ...nutzlast }); },
    async delete() { daten.delete(pfad); },
    onSnapshot(rueckruf) { setTimeout(() => rueckruf(schnapp(pfad)), 10); return () => {}; },
    collection: (name) => collRef(`${pfad}/${name}`),
  });
  function collRef(pfad) {
    const abfrage = {
      orderBy: () => abfrage, limit: () => abfrage, where: () => abfrage,
      async get() { return { docs: [], size: 0, empty: true, forEach() {} }; },
      doc: (id) => docRef(`${pfad}/${id}`),
    };
    return abfrage;
  }
  const nutzer = { uid: "kind-leser", email: "mia@lernapp.local", emailVerified: false, displayName: "Mia", providerData: [{ providerId: "password" }], updateProfile: async () => {}, reload: async () => {}, getIdToken: async () => "token-attrappe" };
  const auth = () => ({
    currentUser: null,
    setPersistence: () => Promise.resolve(),
    onAuthStateChanged(rueckruf) { setTimeout(() => rueckruf(nutzer), 300); return () => {}; },
    signOut: async () => {},
  });
  auth.Auth = { Persistence: { LOCAL: "local" } };
  auth.GoogleAuthProvider = function GoogleAuthProvider() {};
  const firestore = () => ({
    collection: (name) => collRef(name),
    batch: () => ({ set() { return this; }, update() { return this; }, delete() { return this; }, async commit() {} }),
  });
  firestore.FieldValue = { serverTimestamp: () => 1700000000000, increment: (um) => um, delete: () => null };
  window.firebase = { apps: [], initializeApp: () => ({}), app: () => ({}), auth, firestore };
}

// Zählt, wie viele Lesezimmer und wie viele Zeichnungen davon ins Dokument
// kommen – jedes Element einmal, auch wenn es mitsamt seiner Hülle kommt.
function zimmerZaehler() {
  window.__zimmer = { platz: 0, zeichnung: 0 };
  const gezaehlt = new WeakSet();
  const zaehle = (knoten, wahl, feld) => {
    const treffer = knoten.matches(wahl) ? [knoten] : [...knoten.querySelectorAll(wahl)];
    treffer.forEach((t) => { if (!gezaehlt.has(t)) { gezaehlt.add(t); window.__zimmer[feld] += 1; } });
  };
  new MutationObserver((liste) => liste.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    zaehle(n, ".leseecke", "platz");
    zaehle(n, ".lesezimmer-svg", "zeichnung");
  }))).observe(document, { childList: true, subtree: true });
}

if (!(await warteAufServer())) { console.error("Server antwortet nicht."); process.exit(2); }
const browser = await playwright.chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
  context.setDefaultTimeout(8000);
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  await context.addInitScript(stimmeErsatz);
  const page = await context.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(`${page.url().replace(BASIS, "")}: ${e.message}`));
  const gesagt = () => page.evaluate(() => window.__gesagt || []);
  const vergiss = () => page.evaluate(() => { window.__gesagt = []; });
  const oeffne = async (pfad, bereit = "window.LernappLeseStand") => {
    await page.goto(`${BASIS}/${pfad}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(bereit, null, { timeout: 10000 });
    await page.waitForTimeout(300);
  };

  // --- 1. Der Lesewagen auf dem Startbild ---------------------------------------
  for (const [breite, hoehe] of [[844, 390], [1024, 640], [1180, 820], [1366, 768]]) {
    await page.setViewportSize({ width: breite, height: hoehe });
    await oeffne("index.html", "document.querySelector('.lesewagen-knopf')");
    await page.waitForFunction(() => document.querySelector(".lesewagen-knopf")?.dataset.placed === "1", null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(900);
    const wagen = await page.evaluate(() => {
      const knopf = document.querySelector(".lesewagen-knopf");
      const r = knopf.getBoundingClientRect();
      const stil = getComputedStyle(knopf);
      const sichtbar = (x) => { const s = getComputedStyle(x); const b = x.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) > 0.05 && b.width > 0 && b.height > 0; };
      const ueber = [...document.querySelectorAll("button, a, [role=button]")]
        .filter((x) => x !== knopf && !knopf.contains(x) && !x.contains(knopf) && sichtbar(x))
        .filter((x) => { const b = x.getBoundingClientRect(); return b.left < r.right - 4 && b.right > r.left + 4 && b.top < r.bottom - 4 && b.bottom > r.top + 4; })
        .map((x) => String(x.className || x.id || x.tagName).slice(0, 40));
      return { platziert: knopf.dataset.placed, sichtbar: sichtbar(knopf), l: r.left, t: r.top, b: r.width, h: r.height, vw: innerWidth, vh: innerHeight, ueber, deckkraft: stil.opacity };
    });
    const wo = `Startbild ${breite}×${hoehe}`;
    if (wagen.platziert !== "1" || !wagen.sichtbar) fehlt(`${wo}: der Lesewagen ist nicht zu sehen`);
    else {
      if (wagen.h < 44 || wagen.b < 60) fehlt(`${wo}: der Lesewagen ist nur ${Math.round(wagen.b)}×${Math.round(wagen.h)} gross`);
      if (wagen.l < 0 || wagen.t < 0 || wagen.l + wagen.b > wagen.vw || wagen.t + wagen.h > wagen.vh) fehlt(`${wo}: der Lesewagen ragt aus dem Bild`);
      if (wagen.ueber.length) fehlt(`${wo}: der Lesewagen liegt über ${wagen.ueber.join(", ")}`);
    }
  }

  // Einsteigen: das Zimmer mit sieben Orten und dem Schild, der Lesewurm im Sessel.
  await page.setViewportSize({ width: 1024, height: 640 });
  await oeffne("index.html", "document.querySelector('.lesewagen-knopf')");
  await page.waitForFunction(() => document.querySelector(".lesewagen-knopf")?.dataset.placed === "1", null, { timeout: 8000 }).catch(() => {});
  await page.locator(".lesewagen-knopf").click();
  await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen" && document.querySelector(".lesezimmer-svg"), null, { timeout: 8000 }).catch(() => {});
  const zimmer = await page.evaluate(() => ({
    ansicht: document.querySelector(".train-stage")?.dataset.view,
    orte: [...document.querySelectorAll(".lesezimmer-svg [data-ort]")].map((o) => o.dataset.ort).sort().join(","),
    wurm: Boolean(document.querySelector(".lese-ort-weiter .lesewurm")),
    // Ein Kind ohne Runde: der Lesefalter in Stufe 1 (das Buch mit dem Loch),
    // und die Karte schlägt vor, was naechstes() sagt.
    stufe: `${document.querySelector(".lese-ort-weiter .lesewurm")?.dataset.leben}/${document.querySelector(".lese-ort-weiter .lesewurm")?.dataset.stufe}`,
    mission: document.querySelector(".lese-ort-mission .lw-missionsname")?.textContent || "",
    missionSoll: (() => { const n = window.LernappLeseStand.naechstes(); return n.id === "buecher" ? "Ein Buch" : n.titel; })(),
    leiste: `${document.querySelector(".lese-ort-mission .lw-blase")?.dataset.hat}/${document.querySelector(".lese-ort-mission .lw-blase")?.dataset.braucht}`,
    hilfe: window.LernappKids?.currentHelp?.() || "",
    zurueck: (() => { const k = document.querySelector(".stage-back"); return Boolean(k && !k.hidden && k.getBoundingClientRect().width > 20); })(),
    // Durch beide Fenster sieht man dieselbe Landschaft: eine Sonne, und die
    // steht in einem Fenster.
    sonnen: document.querySelectorAll(".lesezimmer-svg .lesezimmer-sonne, .lesezimmer-svg .lesezimmer-fenster circle").length,
    // Ohne Bewegung hüpft nichts.
    huepft: [...document.querySelectorAll(".lesezimmer-svg [data-ort], .lesezimmer-svg .lese-schatten")].some((n) => getComputedStyle(n).animationName !== "none"),
    sonneImFenster: (() => {
      const sonne = document.querySelector(".lesezimmer-svg .lesezimmer-sonne")?.getBoundingClientRect();
      if (!sonne) return false;
      return [...document.querySelectorAll(".lesezimmer-svg .lesezimmer-fenster > rect:first-child")].some((f) => {
        const r = f.getBoundingClientRect();
        return sonne.left >= r.left && sonne.right <= r.right && sonne.top >= r.top && sonne.bottom <= r.bottom;
      });
    })(),
  }));
  if (zimmer.ansicht !== "lesen") fehlt(`Lesewagen: nach dem Tipp ist die Ansicht ${zimmer.ansicht}, nicht lesen`);
  if (zimmer.sonnen !== 1 || !zimmer.sonneImFenster) fehlt(`Lesewagen: ${zimmer.sonnen} Sonnen in den Fenstern${zimmer.sonneImFenster ? "" : ", und keine steht in einem Fenster"}`);
  if (zimmer.orte !== "buchstaben,buecher,detektiv,mission,saetze,silben,weiter,woerter,wurmname") fehlt(`Lesewagen: die Orte sind ${zimmer.orte}`);
  if (!zimmer.wurm) fehlt("Lesewagen: der Lesewurm sitzt nicht im Sessel");
  if (zimmer.stufe !== "falter/1") fehlt(`Lesewagen: ohne eine Runde sitzt der Lesewurm als ${zimmer.stufe} auf dem Sofa statt als Lesefalter in Stufe 1`);
  if (!zimmer.mission || zimmer.mission !== zimmer.missionSoll) fehlt(`Lesewagen: die Missionskarte zeigt «${zimmer.mission}» statt «${zimmer.missionSoll}»`);
  if (zimmer.leiste !== "0/1") fehlt(`Lesewagen: die Leiste der Missionskarte steht auf ${zimmer.leiste} statt 0/1`);
  if (zimmer.huepft) fehlt("Lesewagen ohne Bewegung: die Dinge im Zimmer hüpfen trotzdem");
  if (!zimmer.zurueck) fehlt("Lesewagen: kein Pfeil zurück an den Zug");
  if (zimmer.hilfe && !/Lesewagen/.test(zimmer.hilfe)) fehlt(`Lesewagen: der Lautsprecher sagt etwas anderes: ${zimmer.hilfe.slice(0, 60)}`);
  await page.locator(".stage-back").click();
  await page.waitForTimeout(500);
  if ((await page.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) === "lesen") fehlt("Lesewagen: der Pfeil führt nicht hinaus");

  // --- 2. Jeder Ort führt auf seine Seite, und von dort zurück --------------------
  // Steht hinter einem Ding nur ein Spiel, geht es gleich los; stehen mehrere
  // dahinter, kommt die Auswahl – und jede Karte darin führt auf ihre Seite.
  const katalog = await page.evaluate(() => Object.entries(window.LernappLeseStand.SPIELE).map(([id, s]) => ({ id, page: s.page, ort: s.ort })));
  const ORTE = ["silben", "buchstaben", "woerter", "saetze", "buecher", "detektiv"];
  const zumOrt = async (ort) => {
    await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
    await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen", null, { timeout: 8000 }).catch(() => {});
    await page.locator(`.lesezimmer-svg [data-ort="${ort}"]`).click({ force: true });
  };
  for (const ort of ORTE) {
    const spiele = katalog.filter((s) => s.ort === ort);
    if (!spiele.length) { fehlt(`Ort ${ort}: kein Spiel im Katalog`); continue; }
    for (const [nr, spiel] of spiele.entries()) {
      await zumOrt(ort);
      if (spiele.length > 1) {
        await page.waitForSelector(".lese-wahl .lese-wahl-spiel", { timeout: 5000 }).catch(() => {});
        const karten = await page.locator(".lese-wahl .lese-wahl-spiel").evaluateAll((k) => k.map((x) => x.dataset.spiel));
        if (nr === 0 && karten.join(",") !== spiele.map((s) => s.id).join(",")) fehlt(`Ort ${ort}: die Auswahl zeigt ${karten.join(", ")} statt ${spiele.map((s) => s.id).join(", ")}`);
        await page.locator(`.lese-wahl .lese-wahl-spiel[data-spiel="${spiel.id}"]`).click();
      }
      await page.waitForURL(`**/${spiel.page}*`, { timeout: 8000 }).catch(() => {});
      if (!page.url().includes(spiel.page)) { fehlt(`Ort ${ort}: ${spiel.id} führt nicht auf ${spiel.page}, sondern auf ${page.url()}`); continue; }
      await page.waitForFunction(() => document.querySelector("#lese-stage .cm-play"), null, { timeout: 8000 }).catch(() => {});
      const buehne = await page.evaluate(() => ({ spiel: Boolean(document.querySelector("#lese-stage .cm-play")), schrift: getComputedStyle(document.querySelector("#lese-stage .cm-play") || document.body).fontFamily }));
      if (!buehne.spiel) fehlt(`${spiel.page}: keine Bühne`);
      if (!/Andika/.test(buehne.schrift)) fehlt(`${spiel.page}: gelesen wird nicht in Andika (${buehne.schrift})`);
      await page.locator(".cm-icon-back").first().click();
      await page.waitForURL("**/index.html?lesen=1", { timeout: 8000 }).catch(() => {});
      await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen", null, { timeout: 8000 }).catch(() => {});
      if ((await page.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) !== "lesen") fehlt(`${spiel.page}: der Pfeil zurück führt nicht in den Lesewagen`);
    }
  }
  // Die Auswahl geht auch wieder zu, ohne dass etwas aufgeht.
  await zumOrt("woerter");
  await page.waitForSelector(".lese-wahl", { timeout: 5000 }).catch(() => {});
  await page.locator(".lese-wahl-zu").click();
  if (await page.locator(".lese-wahl").count()) fehlt("Auswahl im Lesewagen: das Kreuz schliesst sie nicht");
  if (!page.url().includes("index.html")) fehlt("Auswahl im Lesewagen: das Kreuz öffnet ein Spiel");

  // Der Lesewurm im Sessel wählt etwas, das es gibt – ein Tipp auf ihn oder
  // auf seine Karte führt dorthin und merkt sich die Mission.
  const spielSeiten = new RegExp(`(${katalog.map((s) => s.page.replace(".html", "")).join("|")})\\.html`);
  for (const [ort, wer] of [["mission", "Missionskarte"], ["weiter", "Lesewurm im Sessel"]]) {
    await page.evaluate(() => localStorage.removeItem("lernapp.lesen.mission"));
    await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
    const vorgeschlagen = await page.evaluate(() => window.LernappLeseStand.naechstes());
    await page.locator(`.lesezimmer-svg [data-ort="${ort}"]`).click({ force: true });
    await page.waitForURL(spielSeiten, { timeout: 8000 }).catch(() => {});
    if (!spielSeiten.test(page.url())) fehlt(`${wer}: führt nach ${page.url()}`);
    else if (!page.url().includes(vorgeschlagen.page.split("?")[0])) fehlt(`${wer}: die Karte schlägt ${vorgeschlagen.page} vor, der Tipp führt nach ${page.url()}`);
    const gemerkt = await page.evaluate(() => JSON.parse(localStorage.getItem("lernapp.lesen.mission") || "null"));
    if (gemerkt?.id !== vorgeschlagen.id) fehlt(`${wer}: der Tipp merkt die Mission nicht (${JSON.stringify(gemerkt)} statt ${vorgeschlagen.id})`);
  }

  // --- 3. Silbenzug: eine ganze Runde ----------------------------------------------
  // Als Mission: Der Wurm hat den Silbenzug vorgeschlagen, also bringt die
  // Runde zwei Buchstaben, und die Tafel sagt es.
  await oeffne("silbenzug.html", "window.LernappSilbenzug");
  const vorMission = await page.evaluate(() => {
    localStorage.setItem("lernapp.lesen.mission", JSON.stringify({ id: "silbenzug", at: Date.now() }));
    return { buchstaben: window.LernappLeseStand.buchstaben(), missionen: window.LernappLeseStand.stand().missionen };
  });
  await page.locator(".lese-los-knopf").click();
  for (let i = 0; i < 6; i += 1) {
    await page.waitForFunction(() => window.LernappSilbenzug.wort() && !document.querySelector(".silben-abfahrt")?.disabled, null, { timeout: 8000 }).catch(() => {});
    const silben = await page.evaluate(() => window.LernappSilbenzug.wort()?.silben.length || 0);
    for (let s = 0; s < silben; s += 1) await page.locator(".silben-trommel").dispatchEvent("pointerdown");
    const wagen = await page.locator(".silben-ein-wagen").count();
    if (wagen !== silben) fehlt(`Silbenzug: ${silben} Schläge, aber ${wagen} Wagen`);
    await page.locator(".silben-abfahrt").click();
    await page.waitForTimeout(150);
  }
  await page.waitForSelector(".cm-overlay", { timeout: 15000 }).catch(() => {});
  const silbenzug = await page.evaluate(() => ({
    sterne: document.querySelectorAll(".cm-overlay .cm-result-star.is-on").length,
    stand: window.LernappLeseStand.stand().spiele.silbenzug,
    gespielt: window.LernappEntitlement.gameGespielt("silbenzug.html"),
    buchstaben: window.LernappLeseStand.buchstaben(),
    missionen: window.LernappLeseStand.stand().missionen,
    mission: localStorage.getItem("lernapp.lesen.mission"),
    notiz: document.querySelector(".cm-overlay .cm-runs")?.textContent || "",
  }));
  if (silbenzug.buchstaben !== vorMission.buchstaben + 2 || silbenzug.missionen !== vorMission.missionen + 1 || silbenzug.mission) {
    fehlt(`Silbenzug als Mission: ${silbenzug.buchstaben - vorMission.buchstaben} Buchstaben statt zwei (Missionen ${vorMission.missionen} → ${silbenzug.missionen}, gemerkt: ${silbenzug.mission})`);
  }
  if (!/Zwei Buchstaben|Überraschung/.test(silbenzug.notiz)) fehlt(`Silbenzug als Mission: die Tafel sagt nicht, was der Wurm bekommt («${silbenzug.notiz}»)`);
  if (silbenzug.sterne !== 3) fehlt(`Silbenzug: nach sechs richtigen Zügen ${silbenzug.sterne} Sterne`);
  if (silbenzug.stand?.runden !== 1 || silbenzug.stand?.best !== 6) fehlt(`Silbenzug: im Lesestand steht ${JSON.stringify(silbenzug.stand)}`);
  if (!silbenzug.gespielt) fehlt("Silbenzug: die Schnupperrunde ist nach der Runde nicht verbraucht");
  // Die Runde ist verbraucht: Wer noch einmal will, steht vor dem Tor.
  await page.locator(".cm-overlay .cm-icon-again").click();
  await page.waitForSelector(".tor-overlay", { timeout: 8000 }).catch(() => {});
  if (!(await page.locator(".tor-overlay").count())) fehlt("Silbenzug: nach der Schnupperrunde kommt kein Tor");

  // --- 4. Laute kuppeln: nie das ganze Wort vor dem Bild ---------------------------
  await oeffne("lautekuppeln.html", "window.LernappLauteKuppeln");
  await page.locator(".lese-los-knopf").click();
  for (let i = 0; i < 3; i += 1) {
    await page.waitForFunction(() => window.LernappLauteKuppeln.wort() && document.querySelector(".kp-wagen.ist-dran"), null, { timeout: 8000 }).catch(() => {});
    const wort = await page.evaluate(() => window.LernappLauteKuppeln.wort());
    await vergiss();
    const anzahl = await page.locator(".kp-wagen").count();
    for (let k = 0; k < anzahl; k += 1) {
      await page.waitForFunction((nr) => document.querySelectorAll(".kp-wagen")[nr]?.classList.contains("ist-dran"), k, { timeout: 8000 }).catch(() => {});
      await page.locator(".kp-wagen").nth(k).click();
    }
    await page.waitForSelector(".kp-bilder:not([hidden]) .kp-bild", { timeout: 8000 }).catch(() => {});
    const vorher = await gesagt();
    if (vorher.some((t) => t.toLowerCase() === wort.wort.toLowerCase())) fehlt(`Laute kuppeln: die Stimme sagt «${wort.wort}», bevor das Kind das Bild gewählt hat`);
    const bilder = await page.locator(".kp-bild").allTextContents();
    if (bilder.length !== 3 || !bilder.includes(wort.bild)) fehlt(`Laute kuppeln ${wort.wort}: die Bilder sind ${bilder.join(" ")}`);
    await page.locator(".kp-bild", { hasText: wort.bild }).first().click();
    await page.waitForFunction((w) => window.LernappLauteKuppeln.wort() !== w || document.querySelector(".cm-overlay"), wort.wort, { timeout: 8000 }).catch(() => {});
    if (!(await gesagt()).some((t) => t === wort.wort)) fehlt(`Laute kuppeln: nach dem richtigen Bild sagt die Stimme «${wort.wort}» nicht`);
  }

  // --- 5. Buchstabenhaus: entdecken und suchen -------------------------------------
  await oeffne("buchstabenhaus.html", "window.LernappBuchstabenhaus");
  const fenster = await page.locator(".bh-fenster").count();
  if (fenster < 6) fehlt(`Buchstabenhaus: nur ${fenster} Fenster`);
  await page.locator(".bh-fenster").first().click();
  await page.waitForSelector(".bh-karte", { timeout: 5000 }).catch(() => {});
  if (!(await page.locator(".bh-karte mark").count())) fehlt("Buchstabenhaus: das Fenster zeigt den Laut im Wort nicht hervorgehoben");
  await page.locator(".bh-karte-zu").click();
  await page.locator(".bh-lupe").click();
  // Im Suchspiel sind nur ein paar Fenster offen – auf «mittel» vier, der
  // gesuchte immer dabei –, und die Blase zeigt das Bild zum Laut.
  for (let i = 0; i < 3; i += 1) {
    await page.waitForFunction(() => window.LernappBuchstabenhaus.ziel(), null, { timeout: 8000 }).catch(() => {});
    const frage = await page.evaluate(() => ({
      ziel: window.LernappBuchstabenhaus.ziel(),
      wahl: window.LernappBuchstabenhaus.wahl(),
      offen: [...document.querySelectorAll(".bh-fenster")].filter((f) => !f.hidden && f.getBoundingClientRect().width > 0).map((f) => f.dataset.laut),
      bild: Boolean(document.querySelector(".bh-blase .bh-blase-bild")),
    }));
    const ziel = frage.ziel;
    if (frage.offen.length !== 4 || !frage.offen.includes(ziel) || frage.offen.slice().sort().join() !== frage.wahl.slice().sort().join()) fehlt(`Buchstabenhaus: im Suchspiel sind ${frage.offen.join(", ")} offen (gesucht ${ziel}, zur Wahl ${frage.wahl.join(", ")})`);
    if (!frage.bild) fehlt(`Buchstabenhaus: die Frage nach ${ziel} zeigt kein Bild`);
    await page.locator(`.bh-fenster[data-laut="${ziel}"]`).click();
    // Die nächste Frage kommt, wenn die Stimme den Laut gesagt hat.
    await page.waitForFunction((nr) => window.LernappBuchstabenhaus.nr() > nr, i, { timeout: 8000 }).catch(() => {});
  }
  const laute = await page.evaluate(() => window.LernappLeseStand.stand().laute);
  const treffer = Object.values(laute || {}).reduce((n, e) => n + (Number(e.r) || 0), 0);
  if (treffer !== 3) fehlt(`Buchstabenhaus: nach drei Treffern stehen ${treffer} im Lesestand`);
  // Ein hörbarer Laut kommt mit seinem Wort: «a – wie Affe». Ein Laut allein
  // aus der Sprachausgabe war oft zu undeutlich. Das «a» kommt aus der
  // Aufnahme, solange es eine gibt, sonst aus der Sprachausgabe.
  await vergiss();
  await page.evaluate(() => { window.__gespielt = []; window.LernappBuchstabenhaus.uebe("a"); });
  await page.waitForFunction(() => (window.__gesagt || []).includes("wie Affe"), null, { timeout: 5000 }).catch(() => {});
  const zumA = await gesagt();
  const aufnahmeA = await page.evaluate(() => {
    const quelle = window.LernappLauteAufnahmen?.a || null;
    return { da: Boolean(quelle), lief: Boolean(quelle) && (window.__gespielt || []).includes(quelle) };
  });
  const lautA = aufnahmeA.da ? aufnahmeA.lief : zumA.includes("a");
  if (!lautA || !zumA.includes("wie Affe")) fehlt(`Buchstabenhaus: zum Laut a kommt nicht «a – wie Affe» (${aufnahmeA.da ? (aufnahmeA.lief ? "Aufnahme lief" : "Aufnahme lief nicht") : "ohne Aufnahme"}; gesagt: ${zumA.join(" | ")})`);
  // Die Wahl auf jeder Stufe, im vollen Haus mit allen Lauten: so viele
  // Fenster, wie die Stufe sagt; nie zwei, die gleich klingen oder ineinander
  // stecken (i und ie, S und Sch); auf «leicht» keine, die junge Ohren leicht
  // verwechseln (m und n), auf «schwer» immer eine davon, wenn es eine gibt.
  const wahlBefunde = await page.evaluate(() => {
    const bh = window.LernappBuchstabenhaus;
    const S = window.LernappLeseStand;
    const aehnlich = (a, b) => window.LernappLeseInhalte.AEHNLICHE_ANLAUTE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    // Hier nachgerechnet, nicht beim Spiel nachgefragt: Einer steckt im
    // anderen, oder sie klingen gleich.
    const gleich = [["i", "ie"], ["e", "ä"], ["f", "v"], ["w", "v"], ["k", "ck"]];
    const verwechselbar = (a, b) => a.startsWith(b) || b.startsWith(a) || gleich.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    const alt = { stufe: S.stufe, lesestufe: S.lesestufe };
    const befunde = [];
    try {
      S.lesestufe = () => "saetze";
      for (const stufe of ["leicht", "mittel", "schwer"]) {
        S.stufe = () => stufe;
        const haus = bh.bewohner();
        if (haus.length !== 36) befunde.push(`im vollen Haus wohnen ${haus.length}`);
        for (const ziel of haus) {
          const partner = haus.some((l) => l.id !== ziel.id && aehnlich(ziel.id, l.id) && !verwechselbar(ziel.id, l.id));
          for (let n = 0; n < 12; n += 1) {
            const wahl = bh.kandidaten(ziel).map((l) => l.id);
            const andere = wahl.filter((id) => id !== ziel.id);
            if (wahl.length !== bh.WAHL_JE_STUFE[stufe] || andere.length !== wahl.length - 1 || new Set(wahl).size !== wahl.length) befunde.push(`${stufe}, ${ziel.id}: ${wahl.join(" ")}`);
            if (andere.some((id) => verwechselbar(ziel.id, id))) befunde.push(`${stufe}, ${ziel.id}: verwechselbar ${wahl.join(" ")}`);
            if (stufe === "leicht" && andere.some((id) => aehnlich(ziel.id, id))) befunde.push(`leicht, ${ziel.id}: ähnlich ${wahl.join(" ")}`);
            if (stufe === "schwer" && partner && !andere.some((id) => aehnlich(ziel.id, id))) befunde.push(`schwer, ${ziel.id}: ohne kniffligen ${wahl.join(" ")}`);
          }
        }
      }
    } finally { Object.assign(S, alt); }
    return [...new Set(befunde)];
  });
  if (wahlBefunde.length) fehlt(`Buchstabenhaus: die Wahl im Suchspiel stimmt nicht – ${wahlBefunde.slice(0, 4).join(" | ")}`);

  // --- 6. Stimmt das?: der Würfel ------------------------------------------------------
  await oeffne("stimmtdas.html", "window.LernappStimmtDas");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const wuerfel = await page.evaluate((s) => {
      window.LernappLeseStand.stufe = () => s;
      const d = window.LernappStimmtDas;
      const probleme = [];
      let stimmt = 0;
      for (let i = 0; i < 400; i += 1) {
        const a = d.aufgabe();
        if (!d.passt(a.wahr)) probleme.push(`unmögliches Bild ${JSON.stringify(a.wahr)}`);
        if (a.stimmt && a.text !== a.richtig) probleme.push(`soll stimmen, tut es nicht: ${a.text} / ${a.richtig}`);
        if (!a.stimmt && a.text === a.richtig) probleme.push(`soll nicht stimmen, tut es: ${a.text}`);
        if (!/^[A-ZÄÖÜ][^.]* (steht|stehen) (auf|unter|neben) (dem|der) [A-ZÄÖÜ][a-zäöü]+\.$/.test(a.text)) probleme.push(`seltsamer Satz: ${a.text}`);
        if (s !== "schwer" && a.wahr.anzahl !== 1) probleme.push(`auf ${s} mehrere Tiere`);
        if (a.stimmt) stimmt += 1;
      }
      return { probleme: [...new Set(probleme)].slice(0, 4), stimmt };
    }, stufe);
    wuerfel.probleme.forEach((p) => fehlt(`Stimmt das? (${stufe}): ${p}`));
    if (wuerfel.stimmt < 120 || wuerfel.stimmt > 280) fehlt(`Stimmt das? (${stufe}): ${wuerfel.stimmt} von 400 Sätzen stimmen – der Würfel ist schief`);
  }
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".sd-daumen", { timeout: 5000 }).catch(() => {});
  const aufgabe = await page.evaluate(() => window.LernappStimmtDas.jetzt());
  await page.locator(aufgabe?.stimmt ? ".sd-ja" : ".sd-nein").click();
  await page.waitForTimeout(200);
  if ((await page.evaluate(() => document.querySelector(".cm-count-value")?.textContent)) !== "1") fehlt("Stimmt das?: die richtige Antwort zählt nicht");

  // --- 6b. Die Spiele aus Etappe 2: je eine Aufgabe -------------------------------------
  const zaehler = () => page.evaluate(() => document.querySelector(".cm-count-value")?.textContent);
  const los = async (seite, api) => {
    await oeffne(seite, `window.${api}`);
    await vergiss();
    await page.locator(".lese-los-knopf").click();
  };

  // Reimkupplung: Gefragt wird nach dem Reim auf das Wort am Zug; nur der Reim kuppelt.
  await los("reimkupplung.html", "LernappReimkupplung");
  await page.waitForSelector(".rk-kandidat", { timeout: 8000 }).catch(() => {});
  await page.waitForFunction(() => (window.__gesagt || []).some((t) => /^Was reimt sich auf /.test(t)), null, { timeout: 5000 }).catch(() => {});
  const reim = await page.evaluate(() => window.LernappReimkupplung.jetzt());
  if (!(await gesagt()).includes(`Was reimt sich auf ${reim?.ziel?.wort}?`)) fehlt("Reimkupplung: die Frage nach dem Reim wird nicht gestellt");
  const reimWahl = await page.evaluate(() => window.LernappReimkupplung.jetzt().wahl.map((w) => w.wort));
  if (!reimWahl.includes(reim.reim.wort) || reimWahl.length !== 3) fehlt(`Reimkupplung: zur Wahl stehen ${reimWahl.join(", ")}`);
  await page.locator('.rk-kandidat:not([data-reim="1"])').first().click();
  // Der falsche Wagen: beide Wörter nacheinander, mit einer Pause dazwischen.
  await page.waitForTimeout(1200);
  await page.locator('.rk-kandidat[data-reim="1"]').click();
  await page.waitForFunction(() => window.LernappReimkupplung.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "0") fehlt("Reimkupplung: nach einem Fehlgriff zählt der Reim trotzdem");
  if (!(await gesagt()).some((t) => t.startsWith(`${reim.ziel.wort} – ${reim.reim.wort}`))) fehlt("Reimkupplung: die Stimme sagt die beiden Reimwörter nicht");

  // Anlaut-Lauscher: Das Bild mit demselben ersten Laut zählt.
  await los("anlautlauscher.html", "LernappAnlautLauscher");
  await page.waitForSelector(".al-bild", { timeout: 8000 }).catch(() => {});
  const anlaut = await page.evaluate(() => {
    const a = window.LernappAnlautLauscher.jetzt();
    const I = window.LernappLeseInhalte;
    return { laut: a.laut, ziel: I.anlautVon(a.ziel.wort), treffer: I.anlautVon(a.treffer.wort), andere: a.wahl.filter((w) => w !== a.treffer).map((w) => I.anlautVon(w.wort)), mehrdeutig: a.wahl.some((w) => I.MEHRDEUTIG.has(w.wort)) };
  });
  if (anlaut.ziel !== anlaut.laut || anlaut.treffer !== anlaut.laut || anlaut.andere.includes(anlaut.laut)) fehlt(`Anlaut-Lauscher: die Aufgabe stimmt nicht: ${JSON.stringify(anlaut)}`);
  if (anlaut.mehrdeutig) fehlt("Anlaut-Lauscher: ein mehrdeutiges Bild steht zur Wahl");
  await page.locator('.al-bild[data-treffer="1"]').click();
  await page.waitForFunction(() => window.LernappAnlautLauscher.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Anlaut-Lauscher: der richtige Anfang zählt nicht");

  // Wer fährt mit?: Das Wort sagt die Stimme erst nach der Antwort.
  await los("werfaehrtmit.html", "LernappWerFaehrtMit");
  await page.waitForSelector(".wm-bild", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(400);
  const fahrkarte = await page.evaluate(() => window.LernappWerFaehrtMit.jetzt().wort.wort);
  if ((await gesagt()).some((t) => t === fahrkarte)) fehlt(`Wer fährt mit?: die Stimme verrät «${fahrkarte}», bevor das Kind gewählt hat`);
  if ((await page.locator(".wm-wort").textContent()) !== fahrkarte) fehlt("Wer fährt mit?: auf der Fahrkarte steht ein anderes Wort");
  await page.locator('.wm-bild[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappWerFaehrtMit.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Wer fährt mit?: der richtige Fahrgast zählt nicht");
  if (!(await gesagt()).includes(fahrkarte)) fehlt("Wer fährt mit?: nach der Antwort sagt die Stimme das Wort nicht");

  // Wörter bauen: Was daliegt, wird vorgelesen – auch falsch. Richtige Steine bleiben liegen.
  await los("woerterbauen.html", "LernappWoerterBauen");
  await page.waitForSelector(".wb-stein", { timeout: 8000 }).catch(() => {});
  const bau = await page.evaluate(() => ({ wort: window.LernappWoerterBauen.jetzt().wort, richtig: window.LernappWoerterBauen.richtig() }));
  const legeSteine = async (reihe) => {
    for (const text of reihe) {
      const index = await page.locator(".wb-stein:not([hidden])").evaluateAll((alle, t) => alle.findIndex((k) => k.getAttribute("aria-label") === `Stein ${t}`), text);
      if (index < 0) return false;
      await page.locator(".wb-stein:not([hidden])").nth(index).click();
    }
    return true;
  };
  const verkehrt = [...bau.richtig].reverse();
  if (verkehrt.join("") !== bau.wort) {
    await vergiss();
    await legeSteine(verkehrt);
    await page.waitForFunction(() => document.querySelectorAll(".wb-feld.ist-voll").length < document.querySelectorAll(".wb-feld").length || window.LernappWoerterBauen.nr() > 0, null, { timeout: 8000 }).catch(() => {});
    const vorgelesen = (await gesagt()).map((t) => t.toLowerCase());
    if (!vorgelesen.includes(verkehrt.join("").toLowerCase())) fehlt(`Wörter bauen: «${verkehrt.join("")}» wird nicht vorgelesen (gesagt: ${vorgelesen.join(" | ")})`);
    const fest = await page.locator(".wb-feld.ist-fest").count();
    const sollFest = verkehrt.filter((t, i) => t === bau.richtig[i]).length;
    if (fest !== sollFest) fehlt(`Wörter bauen: ${fest} Steine bleiben liegen, richtig lagen ${sollFest}`);
    const offen = await page.locator(".wb-feld:not(.ist-fest)").evaluateAll((f) => f.map((x) => Number(x.dataset.nr)));
    await legeSteine(offen.map((i) => bau.richtig[i]));
  } else {
    await legeSteine(bau.richtig);
  }
  await page.waitForFunction(() => window.LernappWoerterBauen.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await page.evaluate(() => window.LernappWoerterBauen.nr())) !== 1) fehlt("Wörter bauen: nach dem richtigen Wort geht es nicht weiter");

  // Silbenbahn: Die Silben der Reihe nach angekuppelt ergeben das Wort.
  await los("silbenbahn.html", "LernappSilbenbahn");
  await page.waitForSelector(".sb-neben .sb-wagen", { timeout: 8000 }).catch(() => {});
  const bahn = await page.evaluate(() => window.LernappSilbenbahn.jetzt());
  for (let i = 0; i < bahn.silben.length; i += 1) {
    await page.waitForFunction((n) => window.LernappSilbenbahn.dran() === n, i, { timeout: 8000 }).catch(() => {});
    await page.locator(`.sb-neben .sb-wagen[data-nr="${i}"]`).click();
  }
  await page.waitForFunction(() => window.LernappSilbenbahn.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Silbenbahn: das richtig gekuppelte Wort zählt nicht");
  if (!(await gesagt()).includes(bahn.wort)) fehlt("Silbenbahn: am Schluss sagt die Stimme das Wort nicht");

  // Blitzwörter: erst blitzen, dann wählen; der Treffer steht im Lesestand.
  await los("blitzwoerter.html", "LernappBlitzwoerter");
  await page.waitForFunction(() => window.LernappBlitzwoerter.phase() === "waehlen", null, { timeout: 10000 }).catch(() => {});
  const blitz = await page.evaluate(() => window.LernappBlitzwoerter.jetzt().wort);
  if ((await page.locator(".bw-knopf").count()) !== 4) fehlt("Blitzwörter: es stehen nicht vier Wörter zur Wahl");
  if ((await page.locator(".bw-wort").textContent()) === blitz) fehlt("Blitzwörter: das Wort steht noch im Fenster, während gewählt wird");
  await page.locator(".bw-knopf", { hasText: new RegExp(`^${blitz}$`) }).click();
  await page.waitForFunction(() => window.LernappBlitzwoerter.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  const blitzStand = await page.evaluate((w) => window.LernappLeseStand.stand().blitz[w], blitz);
  if ((await zaehler()) !== "1" || blitzStand?.r !== 1) fehlt(`Blitzwörter: der Treffer zählt nicht (${JSON.stringify(blitzStand)})`);

  // --- 6c. Mein Name und der Name des Lesewurms ---------------------------------------
  // Ohne Konto fragt das Spiel nach dem Namen; er bleibt auf dem Gerät und
  // geht nicht in den Spielstand. Drei Fahrten, in der dritten zwei fremde
  // Wagen; ein Fehlgriff kostet den Punkt dieser Fahrt.
  await oeffne("meinname.html", "window.LernappMeinName");
  if (!(await page.locator(".mn-eingabe input").count())) fehlt("Mein Name: ohne Konto fragt niemand nach dem Namen");
  // Die Spiele markieren keinen Text – ein Eingabefeld schon: Safari liesse
  // sonst nicht hineinschreiben.
  const mnMarkieren = await page.evaluate(() => getComputedStyle(document.querySelector(".mn-eingabe input")).userSelect);
  if (mnMarkieren === "none") fehlt("Mein Name: das Eingabefeld lässt sich nicht markieren – Safari liesse nicht hineinschreiben");
  await page.fill(".mn-eingabe input", "  noah ");
  await page.locator(".mn-eingabe-ok").click();
  await page.waitForSelector(".mn-schild", { timeout: 5000 }).catch(() => {});
  const schildText = await page.evaluate(() => document.querySelector(".mn-schild")?.textContent);
  if (schildText !== "Noah") fehlt(`Mein Name: auf dem Schild steht «${schildText}» statt «Noah»`);
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  const naechsterWagen = () => page.evaluate(() => {
    const j = window.LernappMeinName.jetzt();
    return j.phase === "kuppeln" ? [...j.name][j.dran].toLowerCase() : null;
  });
  for (let fahrt = 0; fahrt < 3; fahrt += 1) {
    await page.waitForFunction((f) => window.LernappMeinName.jetzt().fahrt === f && window.LernappMeinName.jetzt().phase === "kuppeln", fahrt, { timeout: 8000 }).catch(() => {});
    const anzahl = await page.locator(".mn-neben .mn-wagen").count();
    const fremde = await page.locator('.mn-neben .mn-wagen[data-fremd="1"]').count();
    if (fahrt === 0 && (await page.locator(".mn-platz.ist-leer").count()) !== 4) fehlt("Mein Name: hinter der Lok stehen nicht vier leere Plätze für Noah");
    if (anzahl !== 4 + (fahrt === 2 ? 2 : 0) || fremde !== (fahrt === 2 ? 2 : 0)) fehlt(`Mein Name, Fahrt ${fahrt + 1}: ${anzahl} Wagen, davon ${fremde} fremde`);
    if (fahrt === 2 && !(await page.locator(".mn-schild.ist-zu").count())) fehlt("Mein Name: in der dritten Fahrt ist das Schild nicht zugedeckt");
    for (let i = 0; i < 4; i += 1) {
      await page.waitForFunction(() => window.LernappMeinName.jetzt().phase === "kuppeln", null, { timeout: 5000 }).catch(() => {});
      const b = await naechsterWagen();
      if (!b) break;
      if (fahrt === 1 && i === 2) {
        await page.locator(`.mn-neben .mn-wagen:not([data-zeichen="${b}"])`).first().click();
        await page.waitForTimeout(150);
      }
      await page.locator(`.mn-neben .mn-wagen[data-zeichen="${b}"]`).first().click();
    }
  }
  await page.waitForFunction(() => window.LernappMeinName.jetzt().phase === "over", null, { timeout: 8000 }).catch(() => {});
  const nameStand = await page.evaluate(() => ({
    j: window.LernappMeinName.jetzt(),
    runden: window.LernappLeseStand.stand().spiele?.meinname?.runden || 0,
    lokal: localStorage.getItem("lernapp.lesen.meinname"),
    box: localStorage.getItem("lernapp.lesen") || "",
  }));
  if (nameStand.j.punkte !== 2 || nameStand.j.fahrt !== 3) fehlt(`Mein Name: nach drei Fahrten mit einem Fehlgriff ${nameStand.j.punkte} Punkte (Fahrt ${nameStand.j.fahrt})`);
  if (nameStand.runden !== 1) fehlt("Mein Name: die Runde steht nicht im Lesestand");
  if (nameStand.lokal !== "Noah") fehlt(`Mein Name: auf dem Gerät steht ${nameStand.lokal} statt Noah`);
  if (/Noah/.test(nameStand.box)) fehlt("Mein Name: der eingetippte Name steht im Spielstand, der in die Cloud geht");
  if (!(await gesagt()).includes("Noah")) fehlt("Mein Name: die Stimme sagt den fertigen Namen nicht");

  // Der Lesewurm bekommt einen Namen: über das Schild im Zimmer, immer frei.
  const frei = await page.evaluate(() => window.LernappEntitlement?.targetFree?.("meinname.html?wurm=1"));
  if (frei !== true) fehlt("Lesewurm taufen: meinname.html?wurm=1 ist nicht frei");
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  if ((await page.evaluate(() => document.querySelector('[data-ort="wurmname"] .lese-wurmname')?.textContent)) !== "?") fehlt("Lesewurm taufen: auf dem Schild steht nicht «?», solange er keinen Namen hat");
  await page.locator('.lesezimmer-svg [data-ort="wurmname"]').click({ force: true });
  await page.waitForURL("**/meinname.html?wurm=1", { timeout: 8000 }).catch(() => {});
  await page.waitForFunction(() => window.LernappMeinName && document.querySelector(".mn-taste"), null, { timeout: 8000 }).catch(() => {});
  if (!(await page.locator(".mn-taste").count())) fehlt("Lesewurm taufen: das Schild führt nicht zu den Buchstaben");
  else {
    await vergiss();
    for (const b of ["b", "o", "d", "o"]) await page.locator(`.mn-taste[data-laut="${b}"]`).click();
    const vorgelesen = await gesagt();
    if (!vorgelesen.includes("Bodo") || vorgelesen.includes("B")) fehlt(`Lesewurm taufen: vorgelesen wird ${vorgelesen.join(" | ")}`);
    await page.locator(".mn-weg").click();
    if ((await page.evaluate(() => document.querySelector(".mn-wurmschild")?.textContent)) !== "Bod") fehlt("Lesewurm taufen: der Pfeil nimmt den letzten Buchstaben nicht weg");
    await page.locator('.mn-taste[data-laut="o"]').click();
    await page.locator(".mn-fertig").click();
    await page.waitForURL("**/index.html*", { timeout: 8000 }).catch(() => {});
    await page.waitForFunction(() => document.querySelector(".lesezimmer-svg"), null, { timeout: 8000 }).catch(() => {});
    const getauft = await page.evaluate(() => ({ name: window.LernappLeseStand.wurmName(), schild: document.querySelector('[data-ort="wurmname"] .lese-wurmname')?.textContent }));
    if (getauft.name !== "Bodo" || getauft.schild !== "Bodo") fehlt(`Lesewurm taufen: er heisst ${getauft.name}, auf dem Schild steht ${getauft.schild}`);
  }
  // Vor jeder Runde steht der Name unter dem Wurm.
  await oeffne("silbenzug.html", "window.LernappLeseStand");
  if ((await page.evaluate(() => document.querySelector(".lese-los-wurmname")?.textContent)) !== "Bodo") fehlt("Lesewurm: vor der Runde steht sein Name nicht unter ihm");

  // --- 6e. Lückensätze ---------------------------------------------------------------------
  // Der Würfel: Das richtige Wort steht zur Wahl, jedes falsche macht einen
  // anderen Satz, das Bild passt in den Rahmen, und jede Stufe fragt nach dem,
  // was zu ihr gehört. Dann eine Aufgabe: erst daneben, dann richtig.
  await oeffne("lueckensaetze.html", "window.LernappLueckensaetze");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const wuerfel = await page.evaluate((s) => {
      window.LernappLeseStand.stufe = () => s;
      const d = window.LernappLueckensaetze;
      const inhalte = window.LernappLeseInhalte;
      const art = window.LernappLeseArt;
      const probleme = [];
      const rollen = new Set();
      for (let i = 0; i < 300; i += 1) {
        const rolle = d.FRAGEN[s][i % d.FRAGEN[s].length];
        const a = d.aufgabe(rolle);
        rollen.add(a.rolle);
        if (!art.szenePasst(a.lage)) probleme.push(`das Bild passt nicht in den Rahmen: ${a.satz}`);
        if (a.lage.anzahl > art.platzFuer(a.lage.ding, a.lage.wo, a.lage.tun)) probleme.push(`mehr Tiere als Platz: ${a.satz}`);
        if (!a.wahl.includes(a.richtig)) probleme.push(`das richtige Wort fehlt: ${a.satz}`);
        if (new Set(a.wahl).size !== a.wahl.length || a.wahl.length !== (s === "leicht" ? 2 : 3)) probleme.push(`Wahl ${a.wahl.join("/")}`);
        if (`${a.teile.map((t) => t.text).join(" ")}.` !== a.satz || a.satz !== inhalte.satzZurLage(a.lage)) probleme.push(`der Satz stimmt nicht mit dem Bild: ${a.satz}`);
        a.wahl.filter((w) => w !== a.richtig).forEach((w) => {
          const anders = a.teile.map((t, j) => (j === a.stelle ? w : t.text)).join(" ");
          if (`${anders}.` === a.satz) probleme.push(`ein falsches Wort ergibt denselben Satz: ${a.satz}`);
          if (a.rolle === "tun" && /^(steht|stehen)$/.test(w)) probleme.push(`«${w}» ist nie falsch genug: ${a.satz}`);
        });
        if (!/^[A-ZÄÖÜ][a-zäöü]+ [A-ZÄÖÜ][a-zäöü]+ (steht|stehen|schläft|schlafen|liest|lesen|singt|singen|hüpft|hüpfen) (auf|unter|neben) (dem|der) [A-ZÄÖÜ][a-zäöü]+\.$/.test(a.satz)) probleme.push(`seltsamer Satz: ${a.satz}`);
        if (a.lage.tun === "schlaeft" && a.lage.anzahl !== 1) probleme.push(`mehrere schlafen: ${a.satz}`);
      }
      return { probleme: [...new Set(probleme)].slice(0, 4), rollen: [...rollen].sort().join(",") };
    }, stufe);
    wuerfel.probleme.forEach((p) => fehlt(`Lückensätze (${stufe}): ${p}`));
    const soll = { leicht: "ding,tier", mittel: "ding,tier,tun,wo", schwer: "anzahl,ding,tier,tun,wo" }[stufe];
    if (wuerfel.rollen !== soll) fehlt(`Lückensätze (${stufe}): gefragt wird nach ${wuerfel.rollen} statt ${soll}`);
  }
  await oeffne("lueckensaetze.html", "window.LernappLueckensaetze");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".ls-wort", { timeout: 5000 }).catch(() => {});
  const luecke = await page.evaluate(() => { const a = window.LernappLueckensaetze.jetzt(); return { satz: a.satz, richtig: a.richtig, teile: a.teile.map((t) => t.text), stelle: a.stelle }; });
  if (!(await page.locator(".ls-satz .ls-luecke").count())) fehlt("Lückensätze: im Satz ist keine Lücke");
  const falschesWort = await page.locator('.ls-wort:not([data-richtig="1"])').first().getAttribute("data-wort");
  await page.locator('.ls-wort:not([data-richtig="1"])').first().click();
  await page.waitForFunction(() => window.LernappLueckensaetze.phase() === "waehlen", null, { timeout: 5000 }).catch(() => {});
  const falschGesagt = `${luecke.teile.map((t, i) => (i === luecke.stelle ? falschesWort : t)).join(" ")}?`;
  if (!(await gesagt()).includes(falschGesagt)) fehlt(`Lückensätze: der falsche Satz wird nicht vorgelesen (${falschGesagt})`);
  if (!(await page.locator('.ls-wort[disabled]').count())) fehlt("Lückensätze: das falsche Wort lässt sich nochmals wählen");
  await page.locator('.ls-wort[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappLueckensaetze.nr() === 1, null, { timeout: 5000 }).catch(() => {});
  if (!(await gesagt()).includes(luecke.satz)) fehlt(`Lückensätze: der richtige Satz wird nicht vorgelesen (${luecke.satz})`);
  if ((await zaehler()) !== "0") fehlt("Lückensätze: nach einem Fehlgriff zählt die Lücke trotzdem");

  // --- 6f. Buchstabengleis -------------------------------------------------------------
  // Mit der Maus über das Gleis, Strich für Strich: Die Lok folgt nur auf dem
  // Gleis und nur vorwärts; wer weit abkommt, entgleist. Punkte werden
  // angetippt. Ist der Buchstabe fertig, sagt die Stimme sein Wort.
  await oeffne("buchstabengleis.html", "window.LernappBuchstabengleis");
  const gleisListe = await page.evaluate(() => window.LernappBuchstabengleis.buchstabenListe().map((l) => l.id).join(","));
  if (gleisListe !== "m,a,l,i,o,s,e,r,n,u,f,w,h,d,t,b,k,p,g") fehlt(`Buchstabengleis: zur Wahl stehen ${gleisListe}`);
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".bg-svg", { timeout: 5000 }).catch(() => {});
  // Die Lok bleibt klein neben dem Buchstaben – auch in Safari, das die
  // CSS-Grösse einer Zeichnung in einer Zeichnung nicht kennt: Dort zog sie
  // sich über die ganze Tafel und verdeckte das W. Nachgestellt, indem an der
  // Lok alles CSS wegfällt (Klasse und style); es zählen nur ihre Attribute.
  for (const zeichen of ["W", "e"]) {
    await page.evaluate((z) => window.LernappBuchstabengleis.uebe(z), zeichen);
    const lok = await page.evaluate(() => {
      const innen = document.querySelector(".bg-lok svg");
      const buchstabe = document.querySelector(".bg-svg > g");
      if (!innen || !buchstabe) return null;
      innen.removeAttribute("class");
      innen.removeAttribute("style");
      return { lok: innen.getBoundingClientRect().height, buchstabe: buchstabe.getBoundingClientRect().height };
    });
    if (!lok || lok.lok > lok.buchstabe * 0.4) fehlt(`Buchstabengleis ${zeichen}: ohne CSS ist die Lok ${Math.round(lok?.lok)} px hoch, der Buchstabe ${Math.round(lok?.buchstabe)} px – sie verdeckt ihn`);
  }
  const fahreStrich = async ({ weit = false } = {}) => {
    const pts = await page.evaluate(() => window.LernappBuchstabengleis.bildschirmPunkte());
    if (!pts.length) return;
    await page.mouse.move(pts[0].x, pts[0].y);
    await page.mouse.down();
    if (weit) {
      await page.mouse.move(pts[0].x + 150, pts[0].y + 150, { steps: 6 });
    } else {
      for (let i = 0; i < pts.length; i += 4) await page.mouse.move(pts[i].x + 2, pts[i].y + 2);
      await page.mouse.move(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    await page.mouse.up();
  };
  for (const [zeichen, striche] of [["E", 4], ["i", 2]]) {
    await page.evaluate((z) => window.LernappBuchstabengleis.uebe(z), zeichen);
    await vergiss();
    // Erst daneben: Die Lok bleibt, wo sie war, und es zählt als Entgleisen.
    if (zeichen === "E") {
      await fahreStrich({ weit: true });
      const nachher = await page.evaluate(() => window.LernappBuchstabengleis.jetzt());
      if (nachher.entgleist !== 1 || nachher.strich !== 0 || nachher.pos > 20) fehlt(`Buchstabengleis: weit daneben fährt die Lok mit (${JSON.stringify(nachher)})`);
    }
    for (let n = 0; n < striche; n += 1) {
      const j = await page.evaluate(() => window.LernappBuchstabengleis.jetzt());
      if (j.phase !== "fahren") break;
      if (j.punkt) {
        const [p0] = await page.evaluate(() => window.LernappBuchstabengleis.bildschirmPunkte());
        await page.mouse.click(p0.x, p0.y);
      } else await fahreStrich();
      await page.waitForTimeout(60);
    }
    const fertig = await page.evaluate(() => window.LernappBuchstabengleis.jetzt());
    if (fertig.phase !== "fertig" && fertig.phase !== "over") fehlt(`Buchstabengleis ${zeichen}: nach ${striche} Strichen ist der Buchstabe nicht fertig (${JSON.stringify(fertig)})`);
    await page.waitForFunction(() => window.LernappBuchstabengleis.jetzt().phase !== "fahren", null, { timeout: 3000 }).catch(() => {});
    await page.waitForFunction((w) => (window.__gesagt || []).includes(w), zeichen === "E" ? "Ente" : "Igel", { timeout: 5000 }).catch(() => {});
    if (!(await gesagt()).includes(zeichen === "E" ? "Ente" : "Igel")) fehlt(`Buchstabengleis ${zeichen}: die Stimme sagt das Wort nicht`);
  }

  // --- 6g. Etappe 3: Satz kuppeln, Quatschsätze, Stolperwörter, Quatschwörter ------------
  // Satz kuppeln: Die Wagen ergeben den Satz zum Bild, vorne gross, hinten der
  // Punkt; ein Wagen am falschen Platz stösst an, und der Satz zählt nicht.
  await oeffne("satzkuppeln.html", "window.LernappSatzKuppeln");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const probleme = await page.evaluate((st) => {
      window.LernappLeseStand.stufe = () => st;
      const d = window.LernappSatzKuppeln;
      const fehler = [];
      for (let i = 0; i < 200; i += 1) {
        const a = d.aufgabe();
        if (!/^[A-ZÄÖÜ]/.test(a.woerter[0]) || !/\.$/.test(a.woerter[a.woerter.length - 1])) fehler.push(`Anfang oder Punkt fehlt: ${a.satz}`);
        if (a.woerter.join(" ") !== a.satz) fehler.push(`Wagen und Satz passen nicht: ${a.satz}`);
        if (st === "leicht" && a.woerter.length !== 3) fehler.push(`auf leicht zu lang: ${a.satz}`);
        if (st !== "leicht" && a.satz !== window.LernappLeseInhalte.satzZurLage(a.lage)) fehler.push(`der Satz sagt nicht, was das Bild zeigt: ${a.satz}`);
        if (!window.LernappLeseArt.szenePasst(a.lage)) fehler.push(`das Bild passt nicht in den Rahmen: ${a.satz}`);
      }
      return [...new Set(fehler)].slice(0, 3);
    }, stufe);
    probleme.forEach((p) => fehlt(`Satz kuppeln (${stufe}): ${p}`));
  }
  await oeffne("satzkuppeln.html", "window.LernappSatzKuppeln");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".sk-neben .sk-wagen", { timeout: 5000 }).catch(() => {});
  const sk = await page.evaluate(() => window.LernappSatzKuppeln.jetzt());
  await page.locator(`.sk-neben .sk-wagen[data-nr="${sk.woerter.length - 1}"]`).click();
  await page.waitForTimeout(150);
  if ((await page.evaluate(() => window.LernappSatzKuppeln.dran())) !== 0) fehlt("Satz kuppeln: der letzte Wagen kuppelt als erster an");
  for (let i = 0; i < sk.woerter.length; i += 1) {
    await page.waitForFunction(() => window.LernappSatzKuppeln.phase() === "kuppeln", null, { timeout: 4000 }).catch(() => {});
    await page.locator(`.sk-neben .sk-wagen[data-nr="${i}"]`).click();
  }
  await page.waitForFunction(() => window.LernappSatzKuppeln.nr() === 1, null, { timeout: 6000 }).catch(() => {});
  if (!(await gesagt()).includes(sk.satz)) fehlt(`Satz kuppeln: der fertige Satz wird nicht vorgelesen (${sk.satz})`);
  if ((await zaehler()) !== "0") fehlt("Satz kuppeln: nach einem Fehlgriff zählt der Satz trotzdem");

  // Quatschsätze: halb Sinn, halb Quatsch, kurz genug für die Stufe; wohin
  // der Wagen fährt, sagt der Satz, nicht der Tipp.
  await oeffne("quatschsaetze.html", "window.LernappQuatschsaetze");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const r = await page.evaluate((st) => {
      window.LernappLeseStand.stufe = () => st;
      const d = window.LernappQuatschsaetze;
      const runde = d.runde();
      return { n: runde.length, sinn: runde.filter((s) => s.sinn).length, doppelt: new Set(runde.map((s) => s.satz)).size !== runde.length, lang: runde.filter((s) => s.satz.split(/\s+/).length > d.LAENGE[st]).map((s) => s.satz) };
    }, stufe);
    if (r.n !== 8 || r.sinn !== 4 || r.doppelt || r.lang.length) fehlt(`Quatschsätze (${stufe}): ${JSON.stringify(r)}`);
  }
  await oeffne("quatschsaetze.html", "window.LernappQuatschsaetze");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".qs-knopf", { timeout: 5000 }).catch(() => {});
  const qs = await page.evaluate(() => window.LernappQuatschsaetze.jetzt());
  await page.locator(qs.sinn ? ".qs-nein" : ".qs-ja").click();
  await page.waitForFunction(() => window.LernappQuatschsaetze.nr() === 1, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "0") fehlt("Quatschsätze: eine falsche Antwort zählt");
  // Satz für Satz aus den Aufnahmen: zusammengesetzt muss es dastehen.
  if (!(await gesagt()).join(" ").includes(`${qs.satz} ${qs.sinn ? "Das kann sein." : "Das ist Quatsch!"}`)) fehlt("Quatschsätze: nach der Antwort sagt niemand, wohin der Satz gehört");
  const qs2 = await page.evaluate(() => window.LernappQuatschsaetze.jetzt());
  await page.locator(qs2.sinn ? ".qs-ja" : ".qs-nein").click();
  await page.waitForFunction(() => window.LernappQuatschsaetze.nr() === 2, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Quatschsätze: die richtige Antwort zählt nicht");

  // Stolperwörter: Der Stein liegt nie am Anfang oder am Ende und steht nicht
  // schon im Satz; vom Gleis getippt, liest die Stimme den Satz ohne ihn. Der
  // Lautsprecher über den Wörtern liest ihn mit dem Stein – auf «leicht» tut
  // die Stimme das auch von selbst, auf «mittel» erst auf den Tipp.
  await oeffne("stolperwoerter.html", "window.LernappStolperwoerter");
  const sw = await page.evaluate(() => {
    window.LernappLeseStand.stufe = () => "schwer";
    const d = window.LernappStolperwoerter;
    const fehler = [];
    const saetze = d.saetze();
    for (let i = 0; i < 300; i += 1) {
      const a = d.aufgabe(saetze[i % saetze.length]);
      if (a.stelle < 1 || a.stelle > a.woerter.length - 2) fehler.push(`Stein am Rand: ${a.woerter.join(" ")}`);
      if (a.satz.toLowerCase().split(/[\s.,!?]+/).includes(a.stein.toLowerCase())) fehler.push(`Stein steht schon im Satz: ${a.satz}`);
      if (a.woerter.filter((w, j) => j !== a.stelle).join(" ") !== a.satz) fehler.push(`ohne Stein nicht der Satz: ${a.woerter.join(" ")}`);
    }
    return { fehler: [...new Set(fehler)].slice(0, 3), anzahl: saetze.length };
  });
  sw.fehler.forEach((p) => fehlt(`Stolperwörter: ${p}`));
  if (sw.anzahl < 40) fehlt(`Stolperwörter: auf schwer nur ${sw.anzahl} Sätze`);
  await oeffne("stolperwoerter.html", "window.LernappStolperwoerter");
  await page.evaluate(() => { window.LernappLeseStand.stufe = () => "leicht"; });
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".sw-wort", { timeout: 5000 }).catch(() => {});
  const swLeicht = await page.evaluate(() => window.LernappStolperwoerter.jetzt().woerter.join(" "));
  await page.waitForFunction((s) => (window.__gesagt || []).includes(s), swLeicht, { timeout: 3000 }).catch(() => {});
  if (!(await gesagt()).includes(swLeicht)) fehlt(`Stolperwörter auf leicht: der Satz wird nicht von selbst vorgelesen (${swLeicht})`);
  await vergiss();
  await page.locator(".sw-vorlesen").click();
  await page.waitForFunction((s) => (window.__gesagt || []).includes(s), swLeicht, { timeout: 3000 }).catch(() => {});
  if (!(await gesagt()).includes(swLeicht)) fehlt(`Stolperwörter auf leicht: der Lautsprecher sagt den Satz nicht noch einmal (${swLeicht})`);
  await oeffne("stolperwoerter.html", "window.LernappStolperwoerter");
  await page.evaluate(() => { window.LernappLeseStand.stufe = () => "mittel"; });
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".sw-wort", { timeout: 5000 }).catch(() => {});
  const swa = await page.evaluate(() => window.LernappStolperwoerter.jetzt());
  const swMitStein = swa.woerter.join(" ");
  await page.waitForTimeout(150);
  if ((await gesagt()).includes(swMitStein)) fehlt(`Stolperwörter auf mittel: der Satz wird ungefragt vorgelesen (${swMitStein})`);
  await page.locator(".sw-vorlesen").click();
  await page.waitForFunction((s) => (window.__gesagt || []).includes(s), swMitStein, { timeout: 3000 }).catch(() => {});
  if (!(await gesagt()).includes(swMitStein)) fehlt(`Stolperwörter: der Lautsprecher liest den Satz mit dem Stein nicht vor (${swMitStein})`);
  await page.locator('.sw-wort[data-stein="1"]').click();
  await page.waitForFunction(() => window.LernappStolperwoerter.nr() === 1, null, { timeout: 6000 }).catch(() => {});
  if (!(await gesagt()).includes(swa.satz)) fehlt(`Stolperwörter: der Satz ohne Stein wird nicht vorgelesen (${swa.satz})`);
  if ((await zaehler()) !== "1") fehlt("Stolperwörter: der gefundene Stein zählt nicht");

  // Quatschwörter: Den Namen gibt es nicht als Wort, die Schilder sind fast
  // gleich, und das Monster stellt sich vor.
  await oeffne("quatschwoerter.html", "window.LernappQuatschwoerter");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const probleme = await page.evaluate((st) => {
      window.LernappLeseStand.stufe = () => st;
      const d = window.LernappQuatschwoerter;
      const fehler = [];
      const abstand = (a, b) => { let n = Math.abs(a.length - b.length); for (let i = 0; i < Math.min(a.length, b.length); i += 1) if (a[i] !== b[i]) n += 1; return n; };
      for (let i = 0; i < 300; i += 1) {
        const a = d.aufgabe();
        if (d.ECHTE.has(a.wort)) fehler.push(`ein echtes Wort: ${a.wort}`);
        if (!a.wahl.includes(a.wort) || new Set(a.wahl).size !== a.wahl.length) fehler.push(`Schilder ${a.wahl.join("/")}`);
        if (a.wahl.length !== (st === "leicht" ? 2 : 3)) fehler.push(`${a.wahl.length} Schilder`);
        a.wahl.filter((w) => w !== a.wort).forEach((w) => { if (abstand(w, a.wort) > 2) fehler.push(`${w} sieht ${a.wort} nicht ähnlich`); });
        if (/(.)\1/.test(a.wort)) fehler.push(`doppelter Buchstabe: ${a.wort}`);
      }
      return [...new Set(fehler)].slice(0, 3);
    }, stufe);
    probleme.forEach((p) => fehlt(`Quatschwörter (${stufe}): ${p}`));
  }
  await oeffne("quatschwoerter.html", "window.LernappQuatschwoerter");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".qw-schild", { timeout: 5000 }).catch(() => {});
  const qw = await page.evaluate(() => window.LernappQuatschwoerter.jetzt());
  const qwName = qw.wort.charAt(0).toUpperCase() + qw.wort.slice(1);
  await page.waitForFunction((n) => (window.__gesagt || []).includes(`Ich heisse ${n}.`), qwName, { timeout: 4000 }).catch(() => {});
  if (!(await gesagt()).includes(`Ich heisse ${qwName}.`)) fehlt("Quatschwörter: das Monster stellt sich nicht vor");
  // Das Monster ist gemalt, eines je Farbe; ist das Bild da, tritt die
  // Zeichnung zurück, nur der Schatten bleibt.
  await page.waitForFunction(() => ["da", "fehlt"].includes(document.querySelector(".qw-monster-svg")?.dataset.foto), null, { timeout: 8000 }).catch(() => {});
  const qwBild = await page.evaluate(() => {
    const svg = document.querySelector(".qw-monster-svg");
    const sichtbar = [...(svg?.children || [])].filter((n) => getComputedStyle(n).display !== "none").map((n) => n.tagName.toLowerCase());
    return { stand: svg?.dataset.foto || null, pfad: svg?.querySelector("image.qw-foto")?.getAttribute("href") || null, sichtbar: sichtbar.join(",") };
  });
  const qwSoll = `bilder/monster/monster-${await page.evaluate(() => ["#7c5ce6", "#3fa34d", "#00a5b5", "#ef6fa8", "#f5a623", "#e8543f"].indexOf(window.LernappQuatschwoerter.jetzt().farbe) + 1)}.webp`;
  if (qwBild.stand !== "da" || qwBild.pfad !== qwSoll || qwBild.sichtbar !== "ellipse,image") fehlt(`Quatschwörter: das Monster ist nicht gemalt (${JSON.stringify(qwBild)}, erwartet ${qwSoll})`);
  await page.locator('.qw-schild[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappQuatschwoerter.nr() === 1, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Quatschwörter: das richtige Schild zählt nicht");
  // Lädt das gemalte Monster nicht, steht die Zeichnung da.
  const qwOhne = await page.context().newPage();
  qwOhne.on("pageerror", (e) => fehler.push(`${qwOhne.url().replace(BASIS, "")}: ${e.message}`));
  await qwOhne.route("**/bilder/monster/**", (route) => route.abort());
  await qwOhne.goto(`${BASIS}/quatschwoerter.html`, { waitUntil: "domcontentloaded" });
  await qwOhne.waitForFunction("window.LernappQuatschwoerter", null, { timeout: 8000 }).catch(() => {});
  await qwOhne.locator(".lese-los-knopf").click({ force: true }).catch(() => {});
  await qwOhne.waitForFunction(() => document.querySelector(".qw-monster-svg")?.dataset.foto === "fehlt", null, { timeout: 8000 }).catch(() => {});
  const qwZeichnung = await qwOhne.evaluate(() => {
    const svg = document.querySelector(".qw-monster-svg");
    return { stand: svg?.dataset.foto || null, bild: Boolean(svg?.querySelector("image")), sichtbar: [...(svg?.children || [])].filter((n) => getComputedStyle(n).display !== "none").length };
  });
  if (qwZeichnung.stand !== "fehlt" || qwZeichnung.bild || qwZeichnung.sichtbar < 8) fehlt(`Quatschwörter: ohne Bild zeigt das Monster nicht seine Zeichnung (${JSON.stringify(qwZeichnung)})`);
  await qwOhne.close();

  // --- 6h. Etappe 3: Laut-Position, Buchstaben-Signal, Lies und tu! ------------------------
  // Laut-Position: Wo der Laut steht, rechnen die Steine aus; jede Stelle
  // kommt in der Runde vor, auf «leicht» nie die Mitte.
  await oeffne("lautposition.html", "window.LernappLautPosition");
  const lpWerte = await page.evaluate(() => {
    const d = window.LernappLautPosition;
    return [["Mama", "m"], ["Lama", "m"], ["Tasse", "s"], ["Schaf", "sch"], ["Fisch", "sch"], ["Ofen", "f"], ["Ball", "l"], ["Sonne", "n"]].map(([w, l]) => `${w}:${l}=${d.stelleIn(w, l)}`);
  });
  const lpSoll = ["Mama:m=null", "Lama:m=mitte", "Tasse:s=mitte", "Schaf:sch=vorne", "Fisch:sch=hinten", "Ofen:f=mitte", "Ball:l=hinten", "Sonne:n=mitte"];
  lpWerte.filter((w, i) => w !== lpSoll[i]).forEach((w) => fehlt(`Laut-Position: ${w}`));
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const r = await page.evaluate((st) => {
      window.LernappLeseStand.stufe = () => st;
      const d = window.LernappLautPosition;
      const fehler = [];
      for (let i = 0; i < 40; i += 1) {
        const runde = d.runde();
        const stellen = new Set(runde.map((a) => a.stelle));
        if (runde.length !== d.RUNDE) fehler.push(`${runde.length} Aufgaben`);
        if (st === "leicht" && stellen.has("mitte")) fehler.push("auf leicht in der Mitte");
        if (st !== "leicht" && stellen.size !== 3) fehler.push(`nur ${[...stellen].join("/")}`);
        runde.forEach((a) => { if (d.stelleIn(a.wort, a.laut) !== a.stelle) fehler.push(`${a.wort}: ${a.laut} nicht ${a.stelle}`); });
      }
      return [...new Set(fehler)].slice(0, 3);
    }, stufe);
    r.forEach((p) => fehlt(`Laut-Position (${stufe}): ${p}`));
  }
  await oeffne("lautposition.html", "window.LernappLautPosition");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".lp-teil", { timeout: 5000 }).catch(() => {});
  const lp = await page.evaluate(() => window.LernappLautPosition.jetzt());
  await page.waitForFunction((w) => (window.__gesagt || []).includes(w), lp.wort, { timeout: 4000 }).catch(() => {});
  if (!(await gesagt()).includes(lp.wort)) fehlt("Laut-Position: die Stimme sagt das Wort nicht");
  // Daneben: vorne oder hinten (die Mitte fehlt auf «leicht»), dann richtig.
  const lpFalsch = ["vorne", "hinten", "mitte"].find((s) => s !== lp.stelle);
  await page.locator(`.lp-teil[data-stelle="${lpFalsch}"]`).click();
  await page.locator(`.lp-teil[data-stelle="${lp.stelle}"]`).click();
  await page.waitForFunction(() => window.LernappLautPosition.nr() === 1, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "0") fehlt("Laut-Position: nach einem Fehlgriff zählt die Aufgabe trotzdem");
  const lp2 = await page.evaluate(() => window.LernappLautPosition.jetzt());
  await page.locator(`.lp-teil[data-stelle="${lp2.stelle}"]`).click();
  await page.waitForFunction(() => window.LernappLautPosition.nr() === 2, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Laut-Position: die richtige Stelle zählt nicht");

  // Buchstaben-Signal: Der gesuchte Buchstabe kommt vor, nie drei gleiche
  // nacheinander; wer jeden Treffer anhält und einmal danebentippt, hat
  // alle erwischt und einen daneben, und die Runde geht zu Ende.
  await oeffne("buchstabensignal.html", "window.LernappBuchstabenSignal");
  const bsgReihen = await page.evaluate(() => {
    const d = window.LernappBuchstabenSignal;
    const fehler = [];
    for (let i = 0; i < 300; i += 1) {
      const paar = d.paar();
      const reihe = d.reihe(paar);
      if (reihe.length !== d.WAGEN) fehler.push(`${reihe.length} Wagen`);
      if (!reihe.some((w) => w.treffer)) fehler.push("kein Treffer");
      if (reihe.some((w, j) => j >= 2 && w.treffer === reihe[j - 1].treffer && w.treffer === reihe[j - 2].treffer)) fehler.push("drei gleiche nacheinander");
      if (reihe.some((w) => w.zeichen.toLowerCase() !== (w.treffer ? paar[0] : paar[1]))) fehler.push(`falscher Buchstabe in ${paar.join("/")}`);
    }
    return [...new Set(fehler)].slice(0, 3);
  });
  bsgReihen.forEach((p) => fehlt(`Buchstaben-Signal: ${p}`));
  await page.evaluate(() => window.LernappBuchstabenSignal.tempo(0.35));
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".bsg-wagen", { timeout: 8000 }).catch(() => {});
  let bsgDaneben = false;
  const bsgEnde = Date.now() + 20000;
  while (Date.now() < bsgEnde && (await page.evaluate(() => window.LernappBuchstabenSignal.jetzt().phase)) === "fahren") {
    bsgDaneben = await page.evaluate((schon) => {
      const imBild = (k) => { const r = k.getBoundingClientRect(); return r.left < innerWidth - 20 && r.right > 20; };
      document.querySelectorAll('.bsg-wagen[data-treffer="1"]:not(.ist-richtig)').forEach((k) => { if (imBild(k)) k.click(); });
      const anders = [...document.querySelectorAll(".bsg-wagen:not([data-treffer])")].find(imBild);
      if (!schon && anders) { anders.click(); return true; }
      return schon;
    }, bsgDaneben);
    await page.waitForTimeout(100);
  }
  const bsg = await page.evaluate(() => { const j = window.LernappBuchstabenSignal.jetzt(); return { phase: j.phase, erwischt: j.erwischt, daneben: j.daneben, verpasst: j.verpasst, von: j.reihe.filter((w) => w.treffer).length }; });
  if (bsg.phase !== "over") fehlt(`Buchstaben-Signal: die Runde geht nicht zu Ende (${JSON.stringify(bsg)})`);
  if (bsg.erwischt !== bsg.von || bsg.verpasst !== 0) fehlt(`Buchstaben-Signal: angehaltene Wagen zählen nicht (${JSON.stringify(bsg)})`);
  if (bsgDaneben && bsg.daneben !== 1) fehlt(`Buchstaben-Signal: ein falscher Wagen zählt nicht als daneben (${JSON.stringify(bsg)})`);
  // Für den Bericht an die Eltern: Das Paar steht als Verwechslung im Lesestand.
  const bsgPaar = await page.evaluate(() => { const [a, b] = window.LernappBuchstabenSignal.jetzt().paar; return { paar: [a, b].sort().join("|"), liste: window.LernappLeseStand.stand().verwechselt }; });
  if (bsgDaneben && !(bsgPaar.liste[bsgPaar.paar] >= 1)) fehlt(`Buchstaben-Signal: die Verwechslung ${bsgPaar.paar} steht nicht im Lesestand (${JSON.stringify(bsgPaar.liste)})`);

  // Lies und tu!: Jeder Auftrag ist ein Satz, der zur Szene passt; nur genau
  // das Verlangte zählt – das falsche Tier, die falsche Farbe oder eins zu
  // viel nicht.
  await oeffne("liesundtu.html", "window.LernappLiesUndTu");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const probleme = await page.evaluate((st) => {
      window.LernappLeseStand.stufe = () => st;
      const d = window.LernappLiesUndTu;
      const inh = window.LernappLeseInhalte;
      const fehler = [];
      for (let i = 0; i < 200; i += 1) {
        const s = d.setzAuftrag();
        const tier = inh.TIERE.find((t) => t.id === s.ziel.tier);
        const ding = inh.DINGE.find((x) => x.id === s.ziel.ding);
        if (s.text !== `Setz ${tier.wen} ${s.ziel.wo} ${ding.wohin}.`) fehler.push(`Satz: ${s.text}`);
        if (!ding.wo.includes(s.ziel.wo) || !s.dinge.includes(s.ziel.ding) || !s.tiere.includes(s.ziel.tier)) fehler.push(`nicht im Bild: ${s.text}`);
        if (s.dinge.length !== (st === "leicht" ? 1 : 2) || s.tiere.length !== (st === "leicht" ? 2 : 3)) fehler.push(`${s.dinge.length} Dinge, ${s.tiere.length} Tiere`);
        const m = d.malAuftrag();
        const passend = m.stuecke.filter((x) => !m.ziel.groesse || x.gross === (m.ziel.groesse === "gross")).length;
        if (passend < m.ziel.zahl) fehler.push(`zu wenig zum Anmalen: ${m.text}`);
        if (!/^Male (einen|eine|zwei|drei) [a-zäöü ]*[A-ZÄÖÜ][a-zäöü]+ (rot|blau|gelb|grün) an\.$/.test(m.text)) fehler.push(`Satz: ${m.text}`);
        if ((st === "schwer") !== Boolean(m.ziel.groesse)) fehler.push(`Grösse auf ${st}: ${m.text}`);
      }
      return [...new Set(fehler)].slice(0, 3);
    }, stufe);
    probleme.forEach((p) => fehlt(`Lies und tu! (${stufe}): ${p}`));
  }
  await oeffne("liesundtu.html", "window.LernappLiesUndTu");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".lt-wartet", { timeout: 5000 }).catch(() => {});
  const lt = await page.evaluate(() => window.LernappLiesUndTu.jetzt());
  const ltAnderes = lt.tiere.find((t) => t !== lt.ziel.tier);
  await page.locator(`.lt-wartet[data-tier="${ltAnderes}"]`).click();
  await page.locator(`.lt-zone[data-ding="${lt.ziel.ding}"][data-wo="${lt.ziel.wo}"]`).click();
  await page.waitForFunction(() => window.LernappLiesUndTu.phase() === "tun", null, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(100);
  if (await page.locator(".lt-tier-gesetzt").count()) fehlt("Lies und tu!: das falsche Tier bleibt stehen");
  if (!(await gesagt()).includes(lt.text)) fehlt("Lies und tu!: nach einem Fehlgriff wird der Auftrag nicht vorgelesen");
  const ltFalschGezaehlt = (await page.evaluate(() => window.LernappLiesUndTu.nr())) !== 0;
  if (ltFalschGezaehlt) fehlt("Lies und tu!: das falsche Tier zählt");
  else {
    await page.locator(`.lt-wartet[data-tier="${lt.ziel.tier}"]`).click();
    await page.locator(`.lt-zone[data-ding="${lt.ziel.ding}"][data-wo="${lt.ziel.wo}"]`).click();
    await page.waitForFunction(() => window.LernappLiesUndTu.nr() === 1, null, { timeout: 6000 }).catch(() => {});
    if ((await page.evaluate(() => window.LernappLiesUndTu.nr())) !== 1) fehlt("Lies und tu!: das richtige Tier am richtigen Ort zählt nicht");
    if ((await zaehler()) !== "0") fehlt("Lies und tu!: nach einem Fehlgriff zählt der Auftrag trotzdem");
  }
  // Weiter mit dem Malen nur, wenn das Setzen gezählt hat, wie es soll.
  const ltWeiter = !ltFalschGezaehlt && (await page.evaluate(() => window.LernappLiesUndTu.nr())) === 1;
  const ltm = await page.evaluate(() => window.LernappLiesUndTu.jetzt());
  if (ltWeiter && ltm.art !== "malen") fehlt(`Lies und tu!: auf das Setzen folgt ${ltm.art}`);
  else if (ltWeiter) {
    const passend = ltm.stuecke.filter((s) => !ltm.ziel.groesse || s.gross === (ltm.ziel.groesse === "gross")).slice(0, ltm.ziel.zahl);
    const andereFarbe = ["rot", "blau", "gelb", "grün"].find((f) => f !== ltm.ziel.farbe);
    const zuViel = ltm.stuecke.find((s) => !passend.includes(s));
    const tippe = async (...wahl) => { for (const w of wahl) await page.locator(w).click(); };
    const stueck = (s) => `.lt-stueck[data-nr="${s.nr}"]`;
    // Gibt das Spiel fertig, ohne dass es zählen darf: Es bleibt beim Auftrag.
    const bleibt = async () => {
      await tippe(".lt-fertig");
      await page.waitForFunction(() => window.LernappLiesUndTu.phase() === "tun", null, { timeout: 4000 }).catch(() => {});
      return (await page.evaluate(() => window.LernappLiesUndTu.nr())) === 1;
    };
    const malProbe = async () => {
      // Erst in einer anderen Farbe: zählt nicht.
      await tippe(`.lt-topf[data-farbe="${andereFarbe}"]`, ...passend.map(stueck));
      if (!(await bleibt())) return "die falsche Farbe zählt";
      // Dieselbe Farbe noch einmal macht wieder weiss; dann richtig angemalt
      // und eins zu viel: zählt auch nicht.
      await tippe(...passend.map(stueck), `.lt-topf[data-farbe="${ltm.ziel.farbe}"]`, ...passend.map(stueck), stueck(zuViel));
      if (!(await bleibt())) return "eins zu viel angemalt zählt";
      await tippe(stueck(zuViel), ".lt-fertig");
      await page.waitForFunction(() => window.LernappLiesUndTu.nr() === 2, null, { timeout: 6000 }).catch(() => {});
      if ((await page.evaluate(() => window.LernappLiesUndTu.nr())) !== 2) return `richtig angemalt zählt nicht (${ltm.text})`;
      return null;
    };
    const malFehler = await malProbe();
    if (malFehler) fehlt(`Lies und tu!: ${malFehler}`);
  }

  // --- 6i. Geschichtenzug ----------------------------------------------------------------------
  // Die Seiten stehen in der Reihenfolge der Geschichte, die erste ist immer
  // dabei, und jeder Satz kommt aus seiner Seite. Die Bücher kommen aus den
  // Fächern der Lesestufe, gelesene zuerst. Gespielt: Ein Wagen, der noch
  // nicht dran ist, stösst an, und die Geschichte zählt nicht mehr; jeder
  // angekuppelte Wagen wird vorgelesen; die nächste ohne Fehler zählt.
  await oeffne("geschichtenzug.html", "window.LernappGeschichtenzug");
  const gzWuerfel = await page.evaluate(() => {
    const d = window.LernappGeschichtenzug;
    const fehler = [];
    window.LernappLeseBuecher.BUECHER.forEach((b) => {
      [3, 4].forEach((n) => {
        const nr = d.seitenFuer(b, n);
        if (nr.length !== n || nr[0] !== 0 || nr.some((x, i) => i > 0 && x <= nr[i - 1]) || nr[n - 1] >= b.seiten.length) fehler.push(`${b.id}: Seiten ${nr.join(",")}`);
      });
      b.seiten.forEach((seite, i) => {
        const { text } = d.satzVon(seite);
        if (!text || !seite.text.includes(text)) fehler.push(`${b.id}, Seite ${i + 1}: «${text}» steht nicht auf der Seite`);
      });
    });
    const echt = window.LernappLeseStand.stand;
    window.LernappLeseStand.stand = () => ({ ...echt(), buecher: { "pino-insel": { mal: 1, sterne: 3 } } });
    for (const [stufe, faecher] of Object.entries(d.FAECHER)) {
      window.LernappLeseStand.lesestufe = () => stufe;
      const liste = d.buecherListe();
      if (liste.length < d.RUNDE) fehler.push(`${stufe}: nur ${liste.length} Bücher`);
      liste.forEach((b) => { if (!faecher.includes(b.stufe)) fehler.push(`${stufe}: ${b.id} aus dem Fach ${b.stufe}`); });
      if (faecher.includes("erste") && liste[0]?.id !== "pino-insel") fehler.push(`${stufe}: das gelesene Buch kommt nicht zuerst (${liste[0]?.id})`);
    }
    return fehler.slice(0, 5);
  });
  gzWuerfel.forEach((p) => fehlt(`Geschichtenzug: ${p}`));
  await oeffne("geschichtenzug.html", "window.LernappGeschichtenzug");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".gz-neben .gz-wagen", { timeout: 5000 }).catch(() => {});
  const gz = await page.evaluate(() => { const a = window.LernappGeschichtenzug.jetzt(); return { n: a.wagen.length, text: a.text, gelesen: a.wagen.map((w) => (a.text ? w.satz : w.seite.text)) }; });
  const gzKuppeln = async (nr) => {
    for (let i = 0; i < 2 * gz.n; i += 1) {
      await page.waitForFunction((n) => window.LernappGeschichtenzug.phase() === "kuppeln" || window.LernappGeschichtenzug.nr() !== n, nr, { timeout: 4000 }).catch(() => {});
      const jetzt = await page.evaluate(() => ({ nr: window.LernappGeschichtenzug.nr(), dran: window.LernappGeschichtenzug.dran() }));
      const wagen = page.locator(`.gz-neben .gz-wagen[data-reihe="${jetzt.dran}"]`);
      if (jetzt.nr !== nr || !(await wagen.count())) return;
      await wagen.click();
    }
  };
  await page.locator('.gz-neben .gz-wagen[data-reihe="1"]').click();
  await page.waitForTimeout(150);
  if ((await page.evaluate(() => window.LernappGeschichtenzug.dran())) !== 0) fehlt("Geschichtenzug: ein Wagen kuppelt an, bevor er dran ist");
  // Der Text auf einem angekuppelten Wagen lässt sich nicht markieren: Auf
  // Android öffnete ein Tipp darauf sonst «Tippen zum Suchen» von Google.
  await page.locator('.gz-neben .gz-wagen[data-reihe="0"]').click();
  await page.waitForSelector(".gz-angekuppelt .gz-dran", { timeout: 5000 }).catch(() => {});
  const gzMarkieren = await page.evaluate(() => [".gz-angekuppelt .gz-dran", ".gz-titel", ".cm-stage"].map((wahl) => {
    const knoten = document.querySelector(wahl);
    return `${wahl} ${knoten ? getComputedStyle(knoten).userSelect : "fehlt"}`;
  }));
  if (gzMarkieren.some((z) => !z.endsWith(" none"))) fehlt(`Geschichtenzug: Text lässt sich markieren (${gzMarkieren.join(", ")}) – auf Android öffnet ein Tipp die Google-Suche`);
  await gzKuppeln(0);
  await page.waitForFunction(() => window.LernappGeschichtenzug.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await page.evaluate(() => window.LernappGeschichtenzug.nr())) !== 1) fehlt("Geschichtenzug: die ganze Geschichte fährt nicht ab");
  if ((await zaehler()) !== "0") fehlt("Geschichtenzug: nach einem Fehlgriff zählt die Geschichte trotzdem");
  // Satz für Satz aus den Aufnahmen: zusammengesetzt muss es dastehen.
  const gzGesagt = (await gesagt()).join(" ");
  gz.gelesen.forEach((t) => { if (!gzGesagt.includes(t.replace(/\s+/g, " ").trim())) fehlt(`Geschichtenzug: beim Ankuppeln wird «${t.slice(0, 40)}» nicht vorgelesen`); });
  await gzKuppeln(1);
  await page.waitForFunction(() => window.LernappGeschichtenzug.nr() === 2, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Geschichtenzug: eine Geschichte ohne Fehler zählt nicht");

  // --- 6j. Etappe 4: Wer bin ich? und die Wortbaustelle -----------------------------------
  // Wer bin ich?: Punkte nach der Zahl der Hinweise; ein falsches Bild kostet
  // einen Hinweis. Am Schluss stellt sich das Rätsel vor.
  await oeffne("werbinich.html", "window.LernappWerBinIch");
  const wiRegel = await page.evaluate(() => { const d = window.LernappWerBinIch; return { punkte: [1, 2, 3, 4, 5].map(d.punkteFuer).join(","), runde: d.runde().length, eindeutig: new Set(d.runde().map((r) => r.id)).size }; });
  if (wiRegel.punkte !== "3,3,2,1,1" || wiRegel.runde !== 6 || wiRegel.eindeutig !== 6) fehlt(`Wer bin ich?: ${JSON.stringify(wiRegel)}`);
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".wi-bild", { timeout: 5000 }).catch(() => {});
  const wi = await page.evaluate(() => ({ id: window.LernappWerBinIch.jetzt().id, wer: window.LernappWerBinIch.jetzt().wer, gezeigt: window.LernappWerBinIch.gezeigt(), zeilen: document.querySelectorAll(".wi-hinweis").length }));
  if (wi.gezeigt !== 1 || wi.zeilen !== 1) fehlt(`Wer bin ich?: zu Beginn ${wi.zeilen} Hinweise statt einem`);
  await page.locator(".wi-mehr").click();
  await page.locator(".wi-bild:not([data-richtig])").first().click();
  await page.waitForTimeout(150);
  const wiNach = await page.evaluate(() => ({ gezeigt: window.LernappWerBinIch.gezeigt(), durch: document.querySelectorAll(".wi-bild.ist-falsch").length }));
  if (wiNach.gezeigt !== 3 || wiNach.durch !== 1) fehlt(`Wer bin ich?: nach Lupe und falschem Bild ${JSON.stringify(wiNach)}`);
  await page.locator('.wi-bild[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappWerBinIch.nr() === 1, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "2") fehlt(`Wer bin ich?: nach drei Hinweisen ${await zaehler()} Punkte statt 2`);
  if (!(await gesagt()).some((t) => t.includes(`Ich bin ${wi.wer}.`))) fehlt("Wer bin ich?: das Rätsel stellt sich nicht vor");

  // Wortbaustelle: je Stufe die richtigen Aufgaben; beim Bauen genau ein
  // passender Teil, beim Zerlegen der Schnitt nach dem ersten Wort. Gespielt:
  // ein falscher Teil wird vorgelesen und zählt nicht, ein Schnitt sitzt.
  await oeffne("wortbaustelle.html", "window.LernappWortbaustelle");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const probleme = await page.evaluate((st) => {
      window.LernappLeseStand.stufe = () => st;
      const fehler = [];
      for (let i = 0; i < 20; i += 1) {
        window.LernappWortbaustelle.aufgaben().forEach((a, nr) => {
          const soll = st === "leicht" ? "bauen" : st === "schwer" ? "zerlegen" : (nr % 2 ? "zerlegen" : "bauen");
          if (a.art !== soll) fehler.push(`${nr}: ${a.art} statt ${soll}`);
          if (a.art === "bauen" && (a.wahl.length !== 3 || a.wahl.filter((t) => t.richtig).length !== 1 || a.wahl.find((t) => t.richtig).wort !== a.teile[1])) fehler.push(`${a.wort}: Wahl ${JSON.stringify(a.wahl)}`);
          if (a.wort.slice(0, a.schnitt) !== a.teile[0]) fehler.push(`${a.wort}: Schnitt bei ${a.schnitt}`);
        });
      }
      return [...new Set(fehler)].slice(0, 3);
    }, stufe);
    probleme.forEach((p) => fehlt(`Wortbaustelle (${stufe}): ${p}`));
  }
  await oeffne("wortbaustelle.html", "window.LernappWortbaustelle");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".ws-wahl", { timeout: 5000 }).catch(() => {});
  const ws = await page.evaluate(() => window.LernappWortbaustelle.jetzt());
  const wsFalsch = ws.wahl?.find((t) => !t.richtig);
  if (!wsFalsch) fehlt(`Wortbaustelle: die erste Aufgabe auf «mittel» ist ${ws.art}, nicht bauen`);
  else {
    await page.locator(".ws-wahl:not([data-richtig])").first().click();
    await page.waitForTimeout(150);
    const unsinn = await gesagt();
    const unsinnText = unsinn.join(" ");
    if (!(unsinnText.includes("? Das gibt es nicht.") && unsinnText.includes(ws.teile[0]))) fehlt(`Wortbaustelle: der falsche Teil wird nicht vorgelesen (${unsinn.slice(-2).join(" | ")})`);
    await page.locator('.ws-wahl[data-richtig="1"]').click();
    await page.waitForFunction(() => window.LernappWortbaustelle.nr() === 1, null, { timeout: 6000 }).catch(() => {});
    if (!(await gesagt()).includes(`${ws.teile[0]} und ${ws.teile[1]}: ${ws.wort}.`)) fehlt("Wortbaustelle: das fertige Wort wird nicht vorgelesen");
    if ((await zaehler()) !== "0") fehlt("Wortbaustelle: nach einem falschen Teil zählt das Wort trotzdem");
    const wz = await page.evaluate(() => window.LernappWortbaustelle.jetzt());
    if (wz.art !== "zerlegen") fehlt(`Wortbaustelle: die zweite Aufgabe auf «mittel» ist ${wz.art}`);
    else {
      await page.locator(`.ws-buchstabe[data-nr="${wz.schnitt}"]`).click();
      await page.waitForFunction(() => window.LernappWortbaustelle.nr() === 2, null, { timeout: 6000 }).catch(() => {});
      if ((await zaehler()) !== "1") fehlt("Wortbaustelle: der richtige Schnitt zählt nicht");
    }
  }

  // --- 6k. Etappe 4: Steckbriefe, Detektivfälle, Postkarten --------------------------------
  // Steckbriefe: Wer danebentippt, sieht die Zeile leuchten, in der die
  // Antwort steht; die richtige Antwort zählt nur beim ersten Versuch.
  await oeffne("steckbriefe.html", "window.LernappSteckbriefe");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".stb-weiter", { timeout: 5000 }).catch(() => {});
  const stb = await page.evaluate(() => window.LernappSteckbriefe.jetzt());
  await page.locator(".stb-weiter").click();
  await page.locator(".stb-antwort:not([data-richtig])").first().click();
  await page.waitForTimeout(150);
  const stbHin = await page.evaluate(() => [...document.querySelectorAll(".stb-zeile.zeigt-hin")].map((z) => z.dataset.zeile).join(","));
  if (stbHin !== stb.fragen[0].zeile) fehlt(`Steckbriefe: nach dem Fehlgriff leuchtet «${stbHin}» statt «${stb.fragen[0].zeile}»`);
  await page.locator('.stb-antwort[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappSteckbriefe.frage() === 1, null, { timeout: 6000 }).catch(() => {});
  await page.locator('.stb-antwort[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappSteckbriefe.frage() === 2, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt(`Steckbriefe: nach einem Fehlgriff und einer richtigen Antwort ${await zaehler()} Punkte statt 1`);

  // Detektivfälle: erst der Täter, dann der Beweis; am Schluss die Auflösung.
  await oeffne("detektivfaelle.html", "window.LernappDetektivfaelle");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".df-wer", { timeout: 5000 }).catch(() => {});
  const df = await page.evaluate(() => window.LernappDetektivfaelle.jetzt());
  await page.locator(".df-wer:not([data-taeter])").first().click();
  await page.locator('.df-wer[data-taeter="1"]').click();
  await page.waitForFunction(() => window.LernappDetektivfaelle.phase() === "beweis", null, { timeout: 4000 }).catch(() => {});
  if ((await page.evaluate(() => window.LernappDetektivfaelle.phase())) !== "beweis") fehlt("Detektivfälle: nach dem Täter kommt die Frage nach dem Beweis nicht");
  await page.locator('.df-satz:not([data-beweis])').first().click();
  await page.waitForTimeout(120);
  if ((await page.evaluate(() => window.LernappDetektivfaelle.nr())) !== 0) fehlt("Detektivfälle: ein falscher Satz gilt als Beweis");
  await page.locator('.df-satz[data-beweis="1"]').click();
  await page.waitForFunction(() => window.LernappDetektivfaelle.nr() === 1, null, { timeout: 6000 }).catch(() => {});
  if (!(await gesagt()).join(" ").includes(df.aufloesung.replace(/\s+/g, " ").trim())) fehlt("Detektivfälle: die Auflösung wird nicht vorgelesen");
  if ((await zaehler()) !== "0") fehlt(`Detektivfälle: nach zwei Fehlgriffen ${await zaehler()} Punkte statt 0`);
  await page.locator('.df-wer[data-taeter="1"]').click();
  await page.waitForFunction(() => window.LernappDetektivfaelle.phase() === "beweis", null, { timeout: 4000 }).catch(() => {});
  await page.locator('.df-satz[data-beweis="1"]').click();
  await page.waitForFunction(() => window.LernappDetektivfaelle.nr() === 2, null, { timeout: 6000 }).catch(() => {});
  if ((await zaehler()) !== "2") fehlt(`Detektivfälle: Täter und Beweis gleich gefunden geben ${await zaehler()} statt 2 Punkte`);

  // Postkarten: Ohne Reise ist nur Finos Karte da, und es heisst, wer als
  // Nächstes schreibt. Ist die Karte «Wiese» gefahren, kommt Hoppels Karte.
  await oeffne("postkarten.html", "window.LernappPostkarten");
  const pkLeer = await page.evaluate(() => ({ da: window.LernappPostkarten.angekommen().map((k) => k.karte), naechst: window.LernappPostkarten.naechstePost()?.karte }));
  if (pkLeer.da.join() !== "" || pkLeer.da.length !== 1 || pkLeer.naechst !== "wiese") fehlt(`Postkarten ohne Reise: ${JSON.stringify(pkLeer)}`);
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".pk-weiter", { timeout: 5000 }).catch(() => {});
  // Der Zähler sagt beides getrennt: die wievielte Karte der Runde, und wie
  // viele schon angekommen sind. «4 von 14» allein sah aus wie die Nummer der
  // Karte und blieb doch auf jeder gleich.
  const pkZaehler = await page.locator(".pk-zaehler").textContent();
  if (!/Postkarte 1 von 1/.test(pkZaehler) || !/1 von 14 gesammelt/.test(pkZaehler)) fehlt(`Postkarten: oben steht «${pkZaehler}»`);
  await page.locator(".pk-weiter").click();
  await page.locator('.pk-antwort[data-richtig="1"]').click();
  await page.waitForSelector(".cm-overlay", { timeout: 8000 }).catch(() => {});
  const pkEnde = await page.evaluate(() => document.querySelector(".cm-overlay")?.textContent || "");
  if (!/Hoppel/.test(pkEnde) || !/Wiese/.test(pkEnde)) fehlt(`Postkarten: am Schluss steht nicht, wer als Nächstes schreibt (${pkEnde.slice(0, 120)})`);
  await page.evaluate(() => {
    const done = {};
    for (let nr = 1; nr <= 10; nr += 1) done[String(nr)] = { stars: 3, game: "x", at: 1 };
    const alt = JSON.parse(localStorage.getItem("lernapp.reise") || "{}");
    localStorage.setItem("lernapp.reise", JSON.stringify({ ...alt, done, tries: {}, choice: {}, alt: {} }));
  });
  await oeffne("postkarten.html", "window.LernappPostkarten");
  const pkReise = await page.evaluate(() => ({ da: window.LernappPostkarten.angekommen().map((k) => k.karte || "fino"), runde: window.LernappPostkarten.runde().map((k) => k.karte || "fino") }));
  if (pkReise.da.join() !== "fino,wiese" || pkReise.runde[0] !== "wiese") fehlt(`Postkarten nach der Wiese: ${JSON.stringify(pkReise)}`);
  await page.evaluate(() => localStorage.removeItem("lernapp.reise"));

  // --- 6d. Die Buchstaben der Schule --------------------------------------------------
  // Haben die Eltern abgehakt, wohnen genau diese Laute im Buchstabenhaus, und
  // Laute kuppeln nimmt nur Wörter, die sich damit lesen lassen.
  await page.evaluate(() => localStorage.setItem("lernapp.lesen.eltern", JSON.stringify({ startpunkt: "auto", schrift: "auto", bekannt: ["m", "a", "l", "i", "o", "s", "e", "r", "n", "u"], at: Date.now() })));
  await oeffne("buchstabenhaus.html", "window.LernappBuchstabenhaus");
  const schulHaus = await page.evaluate(() => [...document.querySelectorAll(".bh-fenster")].map((f) => f.dataset.laut).join(","));
  if (schulHaus !== "m,a,l,i,o,s,e,r,n,u") fehlt(`Buchstaben der Schule: im Buchstabenhaus wohnen ${schulHaus}`);
  for (const [seite, api] of [["lautekuppeln.html", "LernappLauteKuppeln"], ["werfaehrtmit.html", "LernappWerFaehrtMit"], ["woerterbauen.html", "LernappWoerterBauen"]]) {
    await oeffne(seite, `window.${api}`);
    const unlesbar = await page.evaluate((name) => {
      const bekannt = window.LernappLeseStand.bekannteLaute();
      return window[name].wortListe().filter((w) => window.LernappLeseInhalte.fehlendeLaute(w.silben, bekannt).length).map((w) => w.wort);
    }, api);
    if (unlesbar.length) fehlt(`Buchstaben der Schule: ${seite} nimmt ${unlesbar.join(", ")}`);
  }
  await page.evaluate(() => localStorage.removeItem("lernapp.lesen.eltern"));

  // --- 7. Das Bücherregal ------------------------------------------------------------------
  await oeffne("buecher.html", "window.LernappBuecher");
  await page.waitForTimeout(300);
  const regal = await page.evaluate(() => ({
    buecher: document.querySelectorAll(".bu-umschlag").length,
    gesperrt: [...document.querySelectorAll(".bu-umschlag.is-locked")].map((b) => b.dataset.buch),
    reiter: [...document.querySelectorAll(".bu-reiter")].map((r) => r.dataset.stufe).join(","),
    offen: document.querySelector(".bu-reiter.is-offen")?.dataset.stufe,
    sichtbar: [...document.querySelectorAll(".bu-fach:not([hidden]) .bu-umschlag")].map((b) => b.dataset.buch),
    soll: window.LernappLeseBuecher.BUECHER.filter((b) => b.stufe === "hoerbuch").map((b) => b.id),
  }));
  if (regal.buecher < 24) fehlt(`Bücherregal: nur ${regal.buecher} Bücher`);
  if (regal.gesperrt.includes("hase-rueebli") || regal.gesperrt.includes("leo-melone")) fehlt("Bücherregal: ein freies Buch trägt ein Schloss");
  if (!regal.gesperrt.includes("sepp-gewitter")) fehlt("Bücherregal: ein Buch, das zum Kauf gehört, ist für den Gast offen");
  // Ein Fach je Stufe: Ohne Einstellung (Lesestufe Buchstaben) ist das Fach
  // zum Zuhören offen, und nur seine Bücher stehen da.
  if (regal.reiter !== "hoerbuch,erste,klein,geschichte,kapitel") fehlt(`Bücherregal: die Reiter sind ${regal.reiter}`);
  if (regal.offen !== "hoerbuch" || regal.sichtbar.join(",") !== regal.soll.join(",")) fehlt(`Bücherregal: offen ist ${regal.offen} mit ${regal.sichtbar.join(", ")}`);
  await page.locator('.bu-reiter[data-stufe="geschichte"]').click();
  const geschichten = await page.evaluate(() => [...document.querySelectorAll(".bu-fach:not([hidden]) .bu-umschlag")].map((b) => b.dataset.buch));
  if (!geschichten.includes("sepp-gewitter") || geschichten.includes("hase-rueebli")) fehlt(`Bücherregal: das Fach Geschichten zeigt ${geschichten.join(", ")}`);
  await page.locator('.bu-umschlag[data-buch="sepp-gewitter"]').click();
  await page.waitForSelector(".tor-overlay", { timeout: 5000 }).catch(() => {});
  if (!(await page.locator(".tor-overlay").count())) fehlt("Bücherregal: ein gesperrtes Buch zeigt kein Tor");
  if ((await page.locator(".bu-titelseite").count())) fehlt("Bücherregal: ein gesperrtes Buch geht trotzdem auf");

  // Das Hörbuch, ganz: Es liest von selbst, und die Fragen haben Bilder.
  const woerterVorher = await page.evaluate(() => window.LernappLeseStand.stand().woerter);
  await oeffne("buecher.html?buch=hase-rueebli", "document.querySelector('.bu-titelseite')");
  await vergiss();
  await page.locator(".bu-modus").first().click();
  await page.waitForTimeout(700);
  const hoerbuch = await gesagt();
  if (!hoerbuch.some((t) => t.startsWith("Das ist Hoppel"))) fehlt(`Hörbuch: die erste Seite wird nicht vorgelesen (gesagt: ${hoerbuch.slice(0, 3).join(" | ")})`);
  const seiten = await page.evaluate(() => window.LernappLeseBuecher.BY_ID["hase-rueebli"].seiten.length);
  for (let i = 0; i < seiten; i += 1) await page.locator(".bu-weiter").click();
  for (let i = 0; i < 3; i += 1) {
    await page.waitForSelector(".bu-antwort", { timeout: 5000 }).catch(() => {});
    const richtig = await page.evaluate(() => { const b = window.LernappBuecher.state; return b.buch.fragen[b.frage].richtig; });
    if (i === 0) {
      // Erst daneben: «Im Buch nachsehen» erscheint und führt auf die Seite.
      const falsch = (richtig + 1) % 3;
      await page.locator(`.bu-antwort[data-nr="${falsch}"]`).click();
      await page.locator(".bu-nachsehen").click();
      const seite = await page.evaluate(() => ({ nr: window.LernappBuecher.state.seite, ansicht: window.LernappBuecher.state.ansicht }));
      if (seite.ansicht !== "seite" || seite.nr !== 1) fehlt(`Hörbuch: «Im Buch nachsehen» führt auf ${JSON.stringify(seite)} statt Seite 2`);
      await page.locator(".bu-weiter").click();
    }
    await page.waitForSelector(".bu-antwort", { timeout: 5000 }).catch(() => {});
    await page.locator(`.bu-antwort[data-nr="${richtig}"]`).click();
    // Die nächste Frage kommt erst, wenn die Stimme die Antwort gesagt hat.
    await page.waitForFunction((nr) => window.LernappBuecher.state.frage > nr || window.LernappBuecher.state.ansicht === "ende", i, { timeout: 8000 }).catch(() => {});
  }
  await page.waitForSelector(".cm-overlay", { timeout: 10000 }).catch(() => {});
  const nachher = await page.evaluate(() => ({
    sterne: document.querySelectorAll(".cm-overlay .cm-result-star.is-on").length,
    buch: window.LernappLeseStand.stand().buecher["hase-rueebli"],
    woerter: window.LernappLeseStand.stand().woerter,
    soll: window.LernappLeseBuecher.wortZahl(window.LernappLeseBuecher.BY_ID["hase-rueebli"]),
    runden: JSON.parse(localStorage.getItem("lernapp.gratis.runden") || "{}"),
  }));
  if (nachher.sterne !== 2) fehlt(`Hörbuch: mit einem Fehler ${nachher.sterne} Sterne statt 2`);
  if (!nachher.buch || nachher.buch.mal !== 1 || nachher.buch.sterne !== 2) fehlt(`Hörbuch: im Lesestand steht ${JSON.stringify(nachher.buch)}`);
  if (nachher.woerter - woerterVorher !== nachher.soll) fehlt(`Hörbuch: der Lesewurm wuchs um ${nachher.woerter - woerterVorher} Wörter statt ${nachher.soll}`);
  if (Object.keys(nachher.runden).some((k) => /^(buecher|buch)\b|hase-rueebli/i.test(k))) fehlt(`Hörbuch: ein Buch verbraucht eine Schnupperrunde (${JSON.stringify(nachher.runden)})`);
  // Zurück ans Regal: Das Buch trägt jetzt Sterne.
  await page.locator(".cm-overlay .cm-icon-back").click();
  await page.waitForSelector(".bu-regal", { timeout: 5000 }).catch(() => {});
  if (!(await page.locator('.bu-umschlag[data-buch="hase-rueebli"] .bu-stern.is-on').count())) fehlt("Bücherregal: das gelesene Buch trägt keine Sterne");

  // --- 7a. Aufnahmen fester Texte (lesen-stimme.js) ------------------------------------
  // Mit einem Verzeichnis zum Ausprobieren: Titel und erster Satz des Hörbuchs,
  // die Hilfe des Silbenzugs und die des Lesewagens als Aufnahme. Abspielen
  // tut das ersetzte Audio-Element nicht, es merkt sich nur, was es spielen
  // sollte; laden tut es aber – deshalb bekommt jede Probe-Datei einen
  // Augenblick Stille, sonst meldete es «lädt nicht».
  {
    const liste = stimmeTexte();
    const textVon = (wo) => liste.find((e) => e.wo === wo)?.text || "";
    const SILBENZUG = textVon("Silbenzug: Lautsprecher");
    const LESEWAGEN = textVon("Lesewagen: Lautsprecher");
    const PROBE = {
      "Wo ist das Rüebli?": "stimme/probe/titel.mp3",
      "Das ist Hoppel.": "stimme/probe/seite-1.mp3",
      [SILBENZUG]: "stimme/probe/silbenzug.mp3",
      [LESEWAGEN]: "stimme/probe/lesewagen.mp3",
    };
    if (!SILBENZUG || !LESEWAGEN) fehlt("Aufnahmen: scripts/stimme-texte.mjs kennt die Hilfe von Silbenzug oder Lesewagen nicht");
    const probe = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
    probe.setDefaultTimeout(8000);
    await probe.route("**/*gstatic.com/**", (route) => route.abort());
    await probe.route("**/lesen-stimme.js*", (route) => route.fulfill({ contentType: "text/javascript; charset=utf-8", body: `window.LernappStimmeDateien = ${JSON.stringify(PROBE)};` }));
    // Die Probe prüft, wie kids.js mit einem Verzeichnis umgeht – die Sätze der
    // Google-Stimme (app-stimme.js, bau-stimme.js) bleiben dafür draussen.
    await probe.route(/\/(app|bau)-stimme\.js/, (route) => route.fulfill({ contentType: "text/javascript; charset=utf-8", body: "" }));
    await probe.route("**/stimme/probe/*.mp3", (route) => route.fulfill({ contentType: "audio/wav", body: stilleWav(0.2) }));
    await probe.addInitScript(stimmeErsatz);
    const seite = await probe.newPage();
    seite.on("pageerror", (e) => fehler.push(`Aufnahmen ${seite.url().replace(BASIS, "")}: ${e.message}`));
    const protokoll = () => seite.evaluate(() => ({ gesagt: window.__gesagt, sprach: window.__sprachausgabe, gespielt: window.__gespielt }));
    const leeren = () => seite.evaluate(() => { window.__gesagt = []; window.__sprachausgabe = []; window.__gespielt = []; });
    const gespielt = (p, datei) => p.gespielt.some((q) => q.endsWith(`/${datei}`));

    // Das Hörbuch: Der Titel kommt aus seiner Aufnahme, ebenso der erste Satz;
    // der zweite hat keine und kommt von der Gerätestimme – in dieser Reihe.
    await seite.goto(`${BASIS}/buecher.html?buch=hase-rueebli`, { waitUntil: "domcontentloaded" });
    await seite.waitForSelector(".bu-titelseite", { timeout: 10000 });
    await seite.waitForTimeout(400);
    await leeren();
    await seite.locator(".bu-titel-deckel").click();
    await seite.waitForTimeout(200);
    let p = await protokoll();
    if (!gespielt(p, PROBE["Wo ist das Rüebli?"]) || p.sprach.includes("Wo ist das Rüebli?")) fehlt(`Aufnahmen: der Titel kommt nicht aus seiner Aufnahme (${JSON.stringify(p)})`);
    await leeren();
    await seite.locator(".bu-modus").first().click();
    await seite.waitForTimeout(700);
    p = await protokoll();
    const zweiter = "Hoppel ist ein kleiner Hase, und er hat grossen Hunger.";
    if (!gespielt(p, PROBE["Das ist Hoppel."]) || p.sprach.includes("Das ist Hoppel.")) fehlt(`Aufnahmen: der erste Satz kommt nicht aus seiner Aufnahme (${JSON.stringify(p)})`);
    if (!p.sprach.includes(zweiter)) fehlt(`Aufnahmen: der Satz ohne Aufnahme bleibt stumm (${JSON.stringify(p.sprach)})`);
    if (!(p.gesagt.indexOf("Das ist Hoppel.") >= 0 && p.gesagt.indexOf("Das ist Hoppel.") < p.gesagt.indexOf(zweiter))) fehlt(`Aufnahmen: das Hörbuch liest nicht der Reihe nach (${JSON.stringify(p.gesagt.slice(0, 3))})`);

    // Der Lautsprecher im Silbenzug: die Aufnahme statt der Sprachausgabe.
    await seite.goto(`${BASIS}/silbenzug.html`, { waitUntil: "domcontentloaded" });
    await seite.waitForFunction(() => window.LernappKids?.currentHelp?.(), null, { timeout: 10000 });
    await seite.waitForTimeout(300);
    const hilfe = await seite.evaluate(() => window.LernappKids.currentHelp());
    if (hilfe !== SILBENZUG) fehlt(`Aufnahmen: der Silbenzug meldet eine andere Hilfe an als die aufgenommene (${hilfe.slice(0, 60)})`);
    await leeren();
    await seite.locator(".help-voice-button").click();
    await seite.waitForTimeout(200);
    p = await protokoll();
    if (!gespielt(p, PROBE[SILBENZUG]) || p.sprach.length) fehlt(`Aufnahmen: der Lautsprecher im Silbenzug spielt nicht die Aufnahme (${JSON.stringify(p)})`);
    // Spielt sie noch, hält ein zweiter Tipp sie an, und der Knopf ist wieder
    // bereit.
    await seite.evaluate(() => { window.__aufnahmeHaengt = true; });
    await seite.locator(".help-voice-button").click();
    await seite.waitForTimeout(150);
    const laeuft = await seite.evaluate(() => ({ spricht: window.LernappKids.sprichtGerade(), knopf: document.querySelector(".help-voice-button").classList.contains("speaking") }));
    await seite.locator(".help-voice-button").click();
    await seite.waitForTimeout(150);
    const angehalten = await seite.evaluate(() => ({ spricht: window.LernappKids.sprichtGerade(), knopf: document.querySelector(".help-voice-button").classList.contains("speaking") }));
    if (!laeuft.spricht || !laeuft.knopf) fehlt(`Aufnahmen: während die Aufnahme spielt, gilt der Lautsprecher nicht als sprechend (${JSON.stringify(laeuft)})`);
    if (angehalten.spricht || angehalten.knopf) fehlt(`Aufnahmen: ein zweiter Tipp hält die Aufnahme nicht an (${JSON.stringify(angehalten)})`);
    // Lädt die Aufnahme nicht, spricht die Gerätestimme.
    await seite.evaluate(() => { window.__aufnahmeHaengt = false; window.__aufnahmeKaputt = true; });
    await leeren();
    await seite.locator(".help-voice-button").click();
    await seite.waitForTimeout(250);
    p = await protokoll();
    if (!p.sprach.includes(SILBENZUG)) fehlt(`Aufnahmen: lädt die Aufnahme nicht, schweigt der Lautsprecher (${JSON.stringify(p)})`);

    // Im Lesewagen: Was der Lesewurm vorschlägt, sagt die Gerätestimme, den
    // festen Rest die Aufnahme – erst das eine, dann das andere.
    await seite.goto(`${BASIS}/index.html?lesen=1`, { waitUntil: "domcontentloaded" });
    await seite.waitForFunction(() => document.querySelector(".lesezimmer-svg") && window.LernappKids?.currentHelp?.(), null, { timeout: 10000 });
    await seite.waitForTimeout(400);
    const ansage = await seite.evaluate(() => window.LernappKids.currentHelp());
    await leeren();
    await seite.locator(".help-voice-button").click();
    await seite.waitForTimeout(300);
    p = await protokoll();
    const vorne = ansage.endsWith(LESEWAGEN) ? ansage.slice(0, -LESEWAGEN.length).trim() : null;
    if (vorne === null) fehlt(`Aufnahmen: die Ansage im Lesewagen endet nicht mit seiner Hilfe (${ansage.slice(0, 80)})`);
    else if (!gespielt(p, PROBE[LESEWAGEN]) || p.sprach.some((t) => t.includes("Der Lesewagen.")) || (vorne && JSON.stringify(p.gesagt) !== JSON.stringify([vorne, LESEWAGEN]))) {
      fehlt(`Aufnahmen: im Lesewagen kommen Vorschlag und Hilfe nicht aus Gerätestimme und Aufnahme (${JSON.stringify(p)})`);
    }
    await probe.close();
  }

  // --- 7b. Echte Aufnahmen ----------------------------------------------------------------
  // Liegen welche im Repo, spielt die kürzeste wirklich – ohne Ersatz für das
  // Audio-Element, über den Service Worker. Er legt sie in ihren eigenen
  // Cache und beantwortet eine Anfrage nach einem Stück (Range: bytes=…), wie
  // Safari sie stellt, mit genau diesem Stück.
  {
    const echte = Object.entries(stimmeVerzeichnis() || {}).sort((a, b) => a[0].length - b[0].length);
    const STIMME_CACHE = /const STIMME_CACHE = "([^"]+)"/.exec(readFileSync(path.join(WURZEL, "service-worker.js"), "utf8"))?.[1];
    if (echte.length) {
      const [text, datei] = echte[0];
      const echt = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "allow", reducedMotion: "reduce" });
      echt.setDefaultTimeout(15000);
      await echt.route("**/*gstatic.com/**", (route) => route.abort());
      await echt.addInitScript(stimmeErsatz, { echtesAudio: true });
      const seite = await echt.newPage();
      seite.on("pageerror", (e) => fehler.push(`Echte Aufnahme ${seite.url().replace(BASIS, "")}: ${e.message}`));
      await seite.goto(`${BASIS}/buecher.html`, { waitUntil: "load" });
      await seite.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 20000 }).catch(() => {});
      const sw = await seite.evaluate(async ([pfad, cache]) => {
        if (!navigator.serviceWorker?.controller) return { ohne: true };
        const ganz = await fetch(pfad);
        const groesse = (await ganz.arrayBuffer()).byteLength;
        const stueck = await fetch(pfad, { headers: { Range: "bytes=2-9" } });
        const imCache = Boolean(await (await caches.open(cache)).match(new URL(pfad, location.href).href));
        return { ganz: ganz.status, groesse, stueck: stueck.status, bereich: stueck.headers.get("Content-Range"), laenge: (await stueck.arrayBuffer()).byteLength, imCache };
      }, [datei, STIMME_CACHE]);
      if (sw.ohne) fehlt("Echte Aufnahme: der Service Worker übernimmt die Seite nicht");
      else if (sw.ganz !== 200 || !sw.imCache || sw.stueck !== 206 || sw.bereich !== `bytes 2-9/${sw.groesse}` || sw.laenge !== 8) fehlt(`Echte Aufnahme: der Service Worker beantwortet sie nicht richtig (${JSON.stringify(sw)})`);
      // Eine Taste gibt das Audio frei (wie ein Tipp); dann spielt die Aufnahme
      // ganz, ohne dass die Gerätestimme einspringt.
      await seite.keyboard.press("x");
      const lauf = await seite.evaluate(async (t) => {
        const kids = window.LernappKids;
        const start = performance.now();
        const ersatz = [];
        const ok = await kids.aufnahmeFolge(kids.aufnahmeStuecke(t), { geraet: async (teil) => { ersatz.push(teil); } });
        return { ok, ersatz, ms: Math.round(performance.now() - start) };
      }, text);
      if (!lauf.ok || lauf.ersatz.length || lauf.ms < 250) fehlt(`Echte Aufnahme: «${text}» spielt nicht (${JSON.stringify(lauf)})`);
      // Fehlt eine Datei, springt die Gerätestimme ein.
      const fehltDatei = await seite.evaluate(async () => {
        const ersatz = [];
        const ok = await window.LernappKids.aufnahmeFolge([{ text: "Gibt es nicht.", datei: "stimme/alain/000000000000.mp3" }], { geraet: async (teil) => { ersatz.push(teil); } });
        return { ok, ersatz };
      });
      if (!fehltDatei.ok || fehltDatei.ersatz.join() !== "Gibt es nicht.") fehlt(`Echte Aufnahme: für eine fehlende Datei springt die Gerätestimme nicht ein (${JSON.stringify(fehltDatei)})`);
      await echt.close();
    }
  }

  // Zusammen lesen: Den Satz des Kindes liest die Stimme nicht.
  await oeffne("buecher.html?buch=leo-melone", "document.querySelector('.bu-titelseite')");
  await page.locator('.bu-modus[data-modus="zusammen"]').click();
  await page.waitForTimeout(500);
  await vergiss();
  await page.locator(".bu-weiter").click();
  await page.waitForTimeout(500);
  const zusammen = await page.evaluate(() => ({
    kind: document.querySelector(".bu-satz.du-bist-dran")?.textContent || "",
    gesagt: window.__gesagt,
  }));
  if (!/Leo mag Melonen/i.test(zusammen.kind)) fehlt(`Zusammen lesen: auf Seite 2 leuchtet nicht der Satz des Kindes (${zusammen.kind})`);
  if (zusammen.gesagt.some((t) => /Leo mag Melonen/.test(t))) fehlt("Zusammen lesen: die Stimme liest den Satz des Kindes vor");
  // Ein Wort antippen sagt dieses Wort.
  await vergiss();
  await page.locator(".bu-wort", { hasText: "Melonen" }).first().click();
  await page.waitForTimeout(150);
  if (!(await gesagt()).includes("Melonen")) fehlt("Bücher: ein Tipp auf ein Wort sagt es nicht");

  // Kapitelbücher: eine Überschrift über der ersten Seite jedes Kapitels, die
  // Stimme liest sie zuerst (beim Selberlesen nur auf Tipp), und ein
  // Lesezeichen merkt sich, wo das Kind aufgehört hat – bis das Buch aus ist.
  // Gekauft gedacht: in einem eigenen Fenster, in dem die Schranke alles
  // offen lässt (das Tor prüft check-schranke.mjs).
  const offen = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
  offen.setDefaultTimeout(8000);
  await offen.route("**/*gstatic.com/**", (route) => route.abort());
  await offen.addInitScript(stimmeErsatz);
  await offen.addInitScript(schrankeOffen);
  const leser = await offen.newPage();
  leser.on("pageerror", (e) => fehler.push(`${leser.url().replace(BASIS, "")}: ${e.message}`));
  const leserGesagt = () => leser.evaluate(() => window.__gesagt || []);
  const leserVergiss = () => leser.evaluate(() => { window.__gesagt = []; });
  const kapitelbuch = async (id) => {
    await leser.goto(`${BASIS}/buecher.html?buch=${id}`, { waitUntil: "domcontentloaded" });
    await leser.waitForSelector(".bu-titelseite", { timeout: 8000 }).catch(() => {});
    await leser.waitForTimeout(400);
  };
  await kapitelbuch("baumhaus-nacht");
  if (await leser.locator(".bu-lesezeichen").count()) fehlt("Kapitelbuch: ein Lesezeichen, obwohl es noch niemand gelesen hat");
  await leserVergiss();
  await leser.locator('.bu-modus[data-modus="vorlesen"]').click();
  await leser.waitForFunction(() => (window.__gesagt || []).length >= 2, null, { timeout: 5000 }).catch(() => {});
  const kapitelEins = await leser.evaluate(() => ({ kopf: document.querySelector(".bu-text .bu-kapitel")?.textContent || "", gesagt: window.__gesagt.slice(0, 2) }));
  if (!/^Kapitel 1\s*Die Einladung$/.test(kapitelEins.kopf)) fehlt(`Kapitelbuch: über der ersten Seite steht «${kapitelEins.kopf}»`);
  if (kapitelEins.gesagt[0] !== "Kapitel 1. Die Einladung." || !/^Flitz hat ein Baumhaus/.test(kapitelEins.gesagt[1] || "")) fehlt(`Kapitelbuch: die Stimme liest nicht zuerst die Überschrift (${kapitelEins.gesagt.join(" | ")})`);
  for (let i = 0; i < 3; i += 1) await leser.locator(".bu-weiter").click();
  const kapitelZwei = await leser.evaluate(() => ({
    seite: window.LernappBuecher.state.seite,
    kopf: document.querySelector(".bu-text .bu-kapitel")?.textContent || "",
    zeichen: JSON.parse(localStorage.getItem("lernapp.lesen.lesezeichen") || "{}")["baumhaus-nacht"] || null,
  }));
  if (kapitelZwei.seite !== 3 || !/^Kapitel 2\s*Geräusche in der Nacht$/.test(kapitelZwei.kopf)) fehlt(`Kapitelbuch: auf Seite ${kapitelZwei.seite + 1} steht «${kapitelZwei.kopf}» statt des zweiten Kapitels`);
  if (kapitelZwei.zeichen?.seite !== 3 || kapitelZwei.zeichen?.modus !== "vorlesen") fehlt(`Kapitelbuch: das Lesezeichen steht auf ${JSON.stringify(kapitelZwei.zeichen)}`);
  // Wieder auf: weiter bei Kapitel 2, in derselben Art zu lesen.
  await kapitelbuch("baumhaus-nacht");
  const zeichenKnopf = await leser.locator(".bu-lesezeichen").textContent().catch(() => "");
  if (!/Weiter bei Kapitel 2/.test(zeichenKnopf)) fehlt(`Kapitelbuch: auf der Titelseite steckt kein Lesezeichen (${zeichenKnopf})`);
  else {
    await leser.locator(".bu-lesezeichen").click();
    await leser.waitForTimeout(200);
    const weiterBei = await leser.evaluate(() => ({ ansicht: window.LernappBuecher.state.ansicht, seite: window.LernappBuecher.state.seite, modus: window.LernappBuecher.state.modus }));
    if (weiterBei.ansicht !== "seite" || weiterBei.seite !== 3 || weiterBei.modus !== "vorlesen") fehlt(`Kapitelbuch: das Lesezeichen führt auf ${JSON.stringify(weiterBei)}`);
  }
  // Selbst lesen: Die Überschrift bleibt still, bis das Kind darauf tippt.
  await kapitelbuch("bergrennen");
  await leser.locator('.bu-modus[data-modus="selbst"]').click();
  await leser.waitForTimeout(300);
  await leserVergiss();
  await leser.waitForTimeout(400);
  if ((await leserGesagt()).some((t) => /^Kapitel/.test(t))) fehlt("Kapitelbuch: beim Selberlesen liest die Stimme die Überschrift von selbst");
  await leser.locator(".bu-text .bu-kapitel").click();
  await leser.waitForTimeout(150);
  if (!(await leserGesagt()).includes("Kapitel 1. Das Plakat.")) fehlt(`Kapitelbuch: ein Tipp auf die Überschrift liest sie nicht (${(await leserGesagt()).join(" | ")})`);
  // Ausgelesen, alle Fragen gleich richtig: drei Sterne, und das Lesezeichen fällt heraus.
  const seitenBerg = await leser.evaluate(() => window.LernappLeseBuecher.BY_ID.bergrennen.seiten.length);
  for (let i = 0; i < seitenBerg; i += 1) await leser.locator(".bu-weiter").click();
  for (let i = 0; i < 4; i += 1) {
    await leser.waitForSelector(".bu-antwort", { timeout: 5000 }).catch(() => {});
    const richtig = await leser.evaluate(() => { const b = window.LernappBuecher.state; return b.buch.fragen[b.frage]?.richtig ?? 0; });
    await leser.locator(`.bu-antwort[data-nr="${richtig}"]`).click().catch(() => {});
    await leser.waitForFunction((nr) => window.LernappBuecher.state.frage > nr || window.LernappBuecher.state.ansicht === "ende", i, { timeout: 8000 }).catch(() => {});
  }
  await leser.waitForSelector(".cm-overlay", { timeout: 10000 }).catch(() => {});
  // Und ein Buch ohne Kapitel bekommt kein Lesezeichen.
  await leser.goto(`${BASIS}/buecher.html?buch=leo-melone`, { waitUntil: "domcontentloaded" });
  await leser.waitForSelector(".bu-titelseite", { timeout: 8000 }).catch(() => {});
  await leser.locator('.bu-modus[data-modus="selbst"]').click().catch(() => {});
  await leser.locator(".bu-weiter").click().catch(() => {});
  const ausgelesen = await leser.evaluate(() => ({
    zeichen: JSON.parse(localStorage.getItem("lernapp.lesen.lesezeichen") || "{}"),
    buch: window.LernappLeseStand.stand().buecher.bergrennen || null,
  }));
  if (ausgelesen.zeichen.bergrennen) fehlt("Kapitelbuch: nach dem letzten Kapitel steckt das Lesezeichen noch");
  if (!ausgelesen.buch || ausgelesen.buch.sterne !== 3) fehlt(`Kapitelbuch: im Lesestand steht ${JSON.stringify(ausgelesen.buch)}`);
  if (Object.keys(ausgelesen.zeichen).join(",") !== "baumhaus-nacht") fehlt(`Kapitelbuch: Lesezeichen stecken in ${Object.keys(ausgelesen.zeichen).join(", ") || "keinem Buch"}`);

  // Gemalte Bilder: Alle Bücher im Regal haben sie – klein auf dem Umschlag
  // im Regal, gross auf der Titelseite, und eines auf jeder Seite, über der
  // Zeichnung. Geht ein Buch auf, kommen gleich alle seine Bilder. Lädt ein Bild
  // nicht (hier ist Seite 2 im Baumhaus gesperrt), zeigt die Seite ihre
  // Zeichnung; ein Buch ohne Bilder zeichnet wie bisher.
  const gemalteBuecher = {
    hoerbuch: ["hase-rueebli", "eule-ella", "pippa-regen", "bruno-sterne", "fino-schal"],
    erste: ["leo-melone", "pino-insel", "mia-ball", "tim-malt", "fred-frosch"],
    klein: ["flitz-nuss", "pino-schneemann", "flitz-geheimnis", "hoppel-velo", "ella-ei"],
    geschichte: ["sepp-gewitter", "leo-bruellt", "reise-mond", "geschenk-oma-rosa", "bruno-schnee"],
    kapitel: ["baumhaus-nacht", "leuchtturm-licht", "bergrennen", "pippa-bambus"],
  };
  const gemalt = await offen.newPage();
  gemalt.on("pageerror", (e) => fehler.push(`${gemalt.url().replace(BASIS, "")}: ${e.message}`));
  await gemalt.route("**/bilder/buecher/baumhaus-nacht/seite-02.webp", (route) => route.abort());
  const fotoVon = (seite, wahl) => seite.evaluate((w) => {
    const svg = document.querySelector(w);
    const foto = svg?.querySelector("image.bu-foto");
    return {
      da: Boolean(svg), stand: svg?.dataset.foto || null,
      pfad: foto?.getAttribute("href") || null,
      breite: foto ? Math.round(foto.getBoundingClientRect().width) : 0,
      // Innen gemessen: Der Rahmen des Bildes ist ein CSS-Rand um die Zeichnung.
      svgBreite: svg ? svg.clientWidth : 0,
      zeichnung: svg ? svg.querySelectorAll(".journey-passenger").length : 0,
      abgedeckt: Boolean(svg?.querySelector(".bu-foto-grund")),
    };
  }, wahl);
  const fotoFertig = (seite, wahl) => seite.waitForFunction((w) => ["da", "fehlt"].includes(document.querySelector(w)?.dataset.foto), wahl, { timeout: 8000 }).catch(() => {});
  await gemalt.goto(`${BASIS}/buecher.html`, { waitUntil: "domcontentloaded" });
  await gemalt.waitForSelector(".bu-reiter", { timeout: 8000 }).catch(() => {});
  for (const [fach, ids] of Object.entries(gemalteBuecher)) {
    await gemalt.locator(`.bu-reiter[data-stufe="${fach}"]`).click().catch(() => {});
    for (const id of ids) {
      const imRegal = `.bu-umschlag[data-buch="${id}"] svg.bu-umschlag-svg`;
      await fotoFertig(gemalt, imRegal);
      const regalFoto = await fotoVon(gemalt, imRegal);
      if (regalFoto.stand !== "da" || regalFoto.pfad !== `bilder/buecher/${id}/umschlag-klein.webp`) fehlt(`Gemalte Bilder: im Regal zeigt ${id} nicht seinen kleinen Umschlag (${JSON.stringify(regalFoto)})`);
    }
  }
  await gemalt.goto(`${BASIS}/buecher.html?buch=baumhaus-nacht`, { waitUntil: "domcontentloaded" });
  await gemalt.waitForSelector(".bu-titelseite", { timeout: 8000 }).catch(() => {});
  const aufDemTitel = ".bu-titel-deckel svg.bu-umschlag-svg";
  await fotoFertig(gemalt, aufDemTitel);
  const titelFoto = await fotoVon(gemalt, aufDemTitel);
  if (titelFoto.stand !== "da" || !/baumhaus-nacht\/umschlag\.webp$/.test(titelFoto.pfad || "")) fehlt(`Gemalte Bilder: die Titelseite zeigt nicht den grossen Umschlag (${JSON.stringify(titelFoto)})`);
  // Gleich beim Aufgehen geladen: der Umschlag und alle zwölf Seiten.
  await gemalt.waitForFunction(() => performance.getEntriesByType("resource").filter((e) => e.name.includes("/bilder/buecher/baumhaus-nacht/seite-")).length >= 11, null, { timeout: 8000 }).catch(() => {});
  const vorgeladen = await gemalt.evaluate(() => [...new Set(performance.getEntriesByType("resource").map((e) => e.name.match(/baumhaus-nacht\/(seite-\d+)\.webp/)?.[1]).filter(Boolean))].sort());
  if (vorgeladen.length < 11) fehlt(`Gemalte Bilder: beim Aufgehen sind erst ${vorgeladen.length} Seiten geladen (${vorgeladen.join(", ")})`);
  await gemalt.locator('.bu-modus[data-modus="selbst"]').click().catch(() => {});
  const seitenBild = ".bu-bild svg.bu-bild-svg";
  await fotoFertig(gemalt, seitenBild);
  const ersteSeite = await fotoVon(gemalt, seitenBild);
  if (ersteSeite.stand !== "da" || !/baumhaus-nacht\/seite-01\.webp$/.test(ersteSeite.pfad || "") || ersteSeite.abgedeckt) fehlt(`Gemalte Bilder: Seite 1 zeigt ihr Bild nicht (${JSON.stringify(ersteSeite)})`);
  if (ersteSeite.breite < ersteSeite.svgBreite - 2) fehlt(`Gemalte Bilder: das Bild auf Seite 1 füllt seinen Rahmen nicht (${ersteSeite.breite} von ${ersteSeite.svgBreite} px)`);
  await gemalt.locator(".bu-weiter").click().catch(() => {});
  await gemalt.waitForFunction(() => window.LernappBuecher.state.seite === 1, null, { timeout: 4000 }).catch(() => {});
  await fotoFertig(gemalt, seitenBild);
  const gesperrt = await fotoVon(gemalt, seitenBild);
  if (gesperrt.stand !== "fehlt" || gesperrt.pfad || gesperrt.abgedeckt || gesperrt.zeichnung < 1) fehlt(`Gemalte Bilder: ohne Bild zeigt Seite 2 nicht ihre Zeichnung (${JSON.stringify(gesperrt)})`);
  await gemalt.locator(".bu-weiter").click().catch(() => {});
  await gemalt.waitForFunction(() => window.LernappBuecher.state.seite === 2, null, { timeout: 4000 }).catch(() => {});
  await fotoFertig(gemalt, seitenBild);
  const dritteSeite = await fotoVon(gemalt, seitenBild);
  if (dritteSeite.stand !== "da" || !/baumhaus-nacht\/seite-03\.webp$/.test(dritteSeite.pfad || "")) fehlt(`Gemalte Bilder: Seite 3 zeigt ihr Bild nicht (${JSON.stringify(dritteSeite)})`);
  // Alle anderen: der grosse Umschlag auf der Titelseite, und beim Aufgehen
  // kommt jede Seite an – keine fehlt im Ordner.
  for (const id of Object.values(gemalteBuecher).flat().filter((i) => i !== "baumhaus-nacht")) {
    await gemalt.goto(`${BASIS}/buecher.html?buch=${id}`, { waitUntil: "domcontentloaded" });
    await gemalt.waitForSelector(".bu-titelseite", { timeout: 8000 }).catch(() => {});
    await fotoFertig(gemalt, aufDemTitel);
    const titel = await fotoVon(gemalt, aufDemTitel);
    if (titel.stand !== "da" || titel.pfad !== `bilder/buecher/${id}/umschlag.webp`) fehlt(`Gemalte Bilder: die Titelseite von ${id} zeigt nicht den grossen Umschlag (${JSON.stringify(titel)})`);
    const ordner = `/bilder/buecher/${id}/seite-`;
    const anzahl = await gemalt.evaluate((i) => window.LernappLeseBuecher.BY_ID[i].seiten.length, id);
    await gemalt.waitForFunction(([o, n]) => performance.getEntriesByType("resource").filter((e) => e.name.includes(o)).length >= n, [ordner, anzahl], { timeout: 8000 }).catch(() => {});
    const angekommen = await gemalt.evaluate((o) => [...new Set(performance.getEntriesByType("resource").filter((e) => e.name.includes(o) && e.responseStatus === 200).map((e) => e.name.split("/").pop()))].sort(), ordner);
    const soll = Array.from({ length: anzahl }, (_, nr) => `seite-${String(nr + 1).padStart(2, "0")}.webp`);
    if (angekommen.join(",") !== soll.join(",")) fehlt(`Gemalte Bilder: von ${id} kommen beim Aufgehen nur ${angekommen.length} von ${anzahl} Seiten an (${angekommen.join(", ")})`);
  }
  await gemalt.close();
  // Ein Buch ohne Bilder: Hier verliert «Leo und die Melone» seine Bilder,
  // bevor das Regal steht. Im Regal und auf der Seite zeichnet es wie bisher
  // und lädt kein Bild.
  const ungemalt = await offen.newPage();
  ungemalt.on("pageerror", (e) => fehler.push(`${ungemalt.url().replace(BASIS, "")}: ${e.message}`));
  await ungemalt.addInitScript(() => {
    let bib;
    Object.defineProperty(window, "LernappLeseBuecher", {
      configurable: true,
      get: () => bib,
      set: (wert) => { if (wert?.BY_ID?.["leo-melone"]) delete wert.BY_ID["leo-melone"].bilder; bib = wert; },
    });
  });
  await ungemalt.goto(`${BASIS}/buecher.html`, { waitUntil: "domcontentloaded" });
  await ungemalt.waitForSelector(".bu-reiter", { timeout: 8000 }).catch(() => {});
  await ungemalt.locator('.bu-reiter[data-stufe="erste"]').click().catch(() => {});
  const ohneBilder = await fotoVon(ungemalt, '.bu-umschlag[data-buch="leo-melone"] svg.bu-umschlag-svg');
  if (!ohneBilder.da || ohneBilder.stand || ohneBilder.pfad || ohneBilder.zeichnung < 1) fehlt(`Gemalte Bilder: ein Buch ohne Bilder lädt im Regal eines (${JSON.stringify(ohneBilder)})`);
  await ungemalt.goto(`${BASIS}/buecher.html?buch=leo-melone`, { waitUntil: "domcontentloaded" });
  await ungemalt.waitForSelector(".bu-titelseite", { timeout: 8000 }).catch(() => {});
  await ungemalt.locator('.bu-modus[data-modus="selbst"]').click().catch(() => {});
  await ungemalt.waitForSelector(seitenBild, { timeout: 4000 }).catch(() => {});
  const gezeichnet = await fotoVon(ungemalt, seitenBild);
  if (gezeichnet.stand || gezeichnet.pfad || gezeichnet.zeichnung < 1) fehlt(`Gemalte Bilder: ein Buch ohne Bilder zeigt nicht seine Zeichnung (${JSON.stringify(gezeichnet)})`);
  const geladen = await ungemalt.evaluate(() => performance.getEntriesByType("resource").filter((e) => e.name.includes("/bilder/buecher/leo-melone/")).length);
  if (geladen) fehlt(`Gemalte Bilder: ein Buch ohne Bilder lädt trotzdem ${geladen} Bilder`);
  await ungemalt.close();
  // Postkarten und Steckbriefe legen ihr gemaltes Bild genauso über die
  // Zeichnung: Finos Karte zeigt willkommen.webp, ein Steckbrief das Bild
  // seines Tieres. Fehlt es, steht die Zeichnung da.
  const karten = await offen.newPage();
  karten.on("pageerror", (e) => fehler.push(`${karten.url().replace(BASIS, "")}: ${e.message}`));
  await karten.goto(`${BASIS}/postkarten.html`, { waitUntil: "domcontentloaded" });
  await karten.waitForFunction("window.LernappPostkarten", null, { timeout: 8000 }).catch(() => {});
  await karten.locator(".lese-los-knopf").click().catch(() => {});
  await karten.waitForSelector(".pk-vorne svg", { timeout: 5000 }).catch(() => {});
  await fotoFertig(karten, ".pk-vorne svg");
  const kartenFoto = await fotoVon(karten, ".pk-vorne svg");
  if (kartenFoto.stand !== "da" || kartenFoto.pfad !== "bilder/postkarten/willkommen.webp" || kartenFoto.zeichnung < 1) fehlt(`Gemalte Bilder: Finos Postkarte zeigt ihr Bild nicht (${JSON.stringify(kartenFoto)})`);
  await karten.goto(`${BASIS}/steckbriefe.html`, { waitUntil: "domcontentloaded" });
  await karten.waitForFunction("window.LernappSteckbriefe", null, { timeout: 8000 }).catch(() => {});
  await karten.locator(".lese-los-knopf").click().catch(() => {});
  await karten.waitForSelector(".stb-figur", { timeout: 5000 }).catch(() => {});
  await fotoFertig(karten, ".stb-figur");
  const briefId = await karten.evaluate(() => window.LernappSteckbriefe.jetzt()?.id || null);
  const briefFoto = await fotoVon(karten, ".stb-figur");
  if (briefFoto.stand !== "da" || briefFoto.pfad !== `bilder/steckbriefe/${briefId}.webp` || briefFoto.breite < briefFoto.svgBreite - 2) fehlt(`Gemalte Bilder: der Steckbrief ${briefId} zeigt sein Bild nicht (${JSON.stringify(briefFoto)})`);
  await karten.route("**/bilder/steckbriefe/**", (route) => route.abort());
  await karten.goto(`${BASIS}/steckbriefe.html`, { waitUntil: "domcontentloaded" });
  await karten.waitForFunction("window.LernappSteckbriefe", null, { timeout: 8000 }).catch(() => {});
  await karten.locator(".lese-los-knopf").click().catch(() => {});
  await karten.waitForSelector(".stb-figur", { timeout: 5000 }).catch(() => {});
  await fotoFertig(karten, ".stb-figur");
  const ohneBrief = await fotoVon(karten, ".stb-figur");
  if (ohneBrief.stand !== "fehlt" || ohneBrief.pfad || ohneBrief.zeichnung < 1) fehlt(`Gemalte Bilder: ohne Bild zeigt der Steckbrief nicht seine Figur (${JSON.stringify(ohneBrief)})`);
  await karten.close();

  // Auf Zeit (ab Stufe «schwer»): neben «Los» die Uhr, 45 Sekunden ohne
  // Vorlesen, und das Ergebnis ist ein eigener Bestwert. Auf «mittel» gibt es
  // die Uhr nicht.
  const stufeSetzen = (stufe) => leser.evaluate((st) => localStorage.setItem("lernapp.reise", JSON.stringify({ stufe: st, stufeAt: Date.now() })), stufe);
  await stufeSetzen("mittel");
  await leser.goto(`${BASIS}/stimmtdas.html`, { waitUntil: "domcontentloaded" });
  await leser.waitForFunction("window.LernappStimmtDas", null, { timeout: 8000 }).catch(() => {});
  await leser.waitForTimeout(300);
  if (await leser.locator(".lese-zeit-knopf").count()) fehlt("Auf Zeit: «Stimmt das?» bietet die Uhr schon auf «mittel» an");
  await stufeSetzen("schwer");
  const zeitRunde = async (seite, api, tippen) => {
    await leser.goto(`${BASIS}/${seite}`, { waitUntil: "domcontentloaded" });
    await leser.waitForFunction(`window.${api}`, null, { timeout: 8000 }).catch(() => {});
    await leser.waitForTimeout(300);
    if (!(await leser.locator(".lese-zeit-knopf").count())) { fehlt(`Auf Zeit: ${seite} bietet auf «schwer» keine Runde auf Zeit an`); return null; }
    await leser.locator(".lese-zeit-knopf").click();
    await leser.waitForTimeout(300);
    await leserVergiss();
    const uhr = await leser.evaluate(() => {
      const balken = document.querySelector(".cm-time");
      return { zeit: document.querySelector("#lese-stage")?.dataset.zeit, balken: Boolean(balken) && getComputedStyle(balken).display !== "none" && getComputedStyle(balken).visibility !== "hidden" };
    });
    if (uhr.zeit !== "1" || !uhr.balken) fehlt(`Auf Zeit: ${seite} zeigt keinen Zeitbalken (${JSON.stringify(uhr)})`);
    await tippen();
    const zwischen = await leser.evaluate((a) => ({ punkte: window[a].punkte(), gesagt: window.__gesagt }), api);
    await leser.evaluate((a) => window[a].zeitUm(), api);
    await leser.waitForSelector(".cm-overlay", { timeout: 5000 }).catch(() => {});
    const ende = await leser.evaluate(() => document.querySelector(".cm-overlay")?.textContent || "");
    return { ...zwischen, ende };
  };
  // Stimmt das?: drei Sätze richtig, einer falsch – die Lösung steht kurz da, gesagt wird nichts.
  const sdZeit = await zeitRunde("stimmtdas.html", "LernappStimmtDas", async () => {
    for (let i = 0; i < 4; i += 1) {
      const a = await leser.evaluate(() => window.LernappStimmtDas.jetzt());
      const richtig = i !== 2;
      await leser.locator(a?.stimmt === richtig ? ".sd-ja" : ".sd-nein").click();
      await leser.waitForFunction((n) => window.LernappStimmtDas.nr() > n, i, { timeout: 5000 }).catch(() => {});
    }
  });
  if (sdZeit) {
    const eintrag = await leser.evaluate(() => window.LernappLeseStand.stand().spiele.stimmtdas);
    if (sdZeit.punkte !== 3) fehlt(`Auf Zeit: «Stimmt das?» zählt ${sdZeit.punkte} statt drei richtige Sätze`);
    if (sdZeit.gesagt.length) fehlt(`Auf Zeit: «Stimmt das?» liest vor und kostet Zeit (${sdZeit.gesagt.join(" | ")})`);
    if (eintrag?.zeit !== 3 || eintrag?.best !== 0 || eintrag?.runden !== 1) fehlt(`Auf Zeit: im Lesestand steht ${JSON.stringify(eintrag)}`);
    if (!/3 Sätze in 45 Sekunden/.test(sdZeit.ende)) fehlt(`Auf Zeit: das Ergebnis von «Stimmt das?» sagt «${sdZeit.ende.slice(0, 90)}»`);
  }
  // Stolperwörter: drei Steine, gleich der nächste Satz, nichts vorgelesen –
  // und kein Lautsprecher, der etwas verspräche.
  const swZeit = await zeitRunde("stolperwoerter.html", "LernappStolperwoerter", async () => {
    if (await leser.locator(".sw-vorlesen").count()) fehlt("Auf Zeit: Stolperwörter zeigt den Lautsprecher, obwohl die Stimme schweigt");
    for (let i = 0; i < 3; i += 1) {
      await leser.locator('.sw-wort[data-stein="1"]').click();
      await leser.waitForFunction((n) => window.LernappStolperwoerter.nr() > n, i, { timeout: 5000 }).catch(() => {});
    }
  });
  if (swZeit) {
    const eintrag = await leser.evaluate(() => window.LernappLeseStand.stand().spiele.stolperwoerter);
    if (swZeit.punkte !== 3) fehlt(`Auf Zeit: Stolperwörter zählt ${swZeit.punkte} statt drei Steine`);
    if (swZeit.gesagt.length) fehlt(`Auf Zeit: Stolperwörter liest vor und kostet Zeit (${swZeit.gesagt.join(" | ")})`);
    if (eintrag?.zeit !== 3 || eintrag?.runden !== 1) fehlt(`Auf Zeit: im Lesestand von Stolperwörter steht ${JSON.stringify(eintrag)}`);
  }
  // Mitwachsen: Ist «Stimmt das?» schon einen Schritt mitgewachsen, spielt es
  // auf «schwer» – mit der Uhr –, während Stolperwörter auf der Stufe des
  // Kindes bleibt. Eine Runde mit allen Sätzen richtig zählt für die Serie.
  await stufeSetzen("mittel");
  await leser.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("lernapp.lesen") || "{}");
    s.spiele = { ...(s.spiele || {}), stimmtdas: { runden: 4, best: 8, zuletzt: 1, schritt: 1, serie: 0 } };
    delete s.spiele.stolperwoerter;
    localStorage.setItem("lernapp.lesen", JSON.stringify(s));
  });
  await leser.goto(`${BASIS}/stimmtdas.html`, { waitUntil: "domcontentloaded" });
  await leser.waitForFunction("window.LernappStimmtDas", null, { timeout: 8000 }).catch(() => {});
  await leser.waitForTimeout(300);
  const gewachsen = await leser.evaluate(() => ({ stufe: window.LernappLeseStand.stufe("stimmtdas"), kind: window.LernappLeseStand.stufe(), uhr: Boolean(document.querySelector(".lese-zeit-knopf")) }));
  if (gewachsen.stufe !== "schwer" || gewachsen.kind !== "mittel" || !gewachsen.uhr) fehlt(`Mitwachsen: «Stimmt das?» spielt nach einem Schritt auf ${gewachsen.stufe} (Kind ${gewachsen.kind}, Uhr ${gewachsen.uhr})`);
  await leser.locator(".lese-los-knopf").click();
  for (let i = 0; i < 8; i += 1) {
    await leser.waitForSelector(".sd-daumen:not([disabled])", { timeout: 5000 }).catch(() => {});
    const a = await leser.evaluate(() => window.LernappStimmtDas.jetzt());
    await leser.locator(a?.stimmt ? ".sd-ja" : ".sd-nein").click();
    await leser.waitForFunction((n) => window.LernappStimmtDas.nr() > n, i, { timeout: 6000 }).catch(() => {});
  }
  await leser.waitForSelector(".cm-overlay", { timeout: 8000 }).catch(() => {});
  const serie = await leser.evaluate(() => window.LernappLeseStand.stand().spiele.stimmtdas);
  if (serie?.serie !== 1 || serie?.schritt !== 1 || serie?.runden !== 5) fehlt(`Mitwachsen: nach einer Runde mit drei Sternen steht ${JSON.stringify(serie)}`);
  await leser.goto(`${BASIS}/stolperwoerter.html`, { waitUntil: "domcontentloaded" });
  await leser.waitForFunction("window.LernappStolperwoerter", null, { timeout: 8000 }).catch(() => {});
  await leser.waitForTimeout(300);
  if (await leser.locator(".lese-zeit-knopf").count()) fehlt("Mitwachsen: Stolperwörter ist mitgewachsen, obwohl nur «Stimmt das?» einen Schritt gemacht hat");

  // Postkarten, zwei in einer Runde (die Karte «Wiese» ist gefahren): Oben
  // steht, die wievielte Karte der Runde es ist, und daneben, wie viele schon
  // angekommen sind. «2 von 14» allein sah aus wie die Nummer der Karte und
  // blieb doch auf jeder gleich.
  await leser.evaluate(() => {
    const done = {};
    for (let nr = 1; nr <= 10; nr += 1) done[String(nr)] = { stars: 3, game: "x", at: 1 };
    localStorage.setItem("lernapp.reise", JSON.stringify({ done, tries: {}, choice: {}, alt: {} }));
    localStorage.removeItem("lernapp.lesen.postkarten");
  });
  await leser.goto(`${BASIS}/postkarten.html`, { waitUntil: "domcontentloaded" });
  await leser.waitForFunction("window.LernappPostkarten", null, { timeout: 8000 }).catch(() => {});
  await leser.waitForTimeout(300);
  await leser.locator(".lese-los-knopf").click();
  await leser.waitForSelector(".pk-weiter", { timeout: 5000 }).catch(() => {});
  const pkErste = await leser.locator(".pk-zaehler").textContent();
  await leser.locator(".pk-weiter").click();
  await leser.locator('.pk-antwort[data-richtig="1"]').click();
  await leser.waitForFunction(() => window.LernappPostkarten.nr() === 1 && window.LernappPostkarten.phase() === "lesen", null, { timeout: 8000 }).catch(() => {});
  const pkZweite = await leser.locator(".pk-zaehler").textContent();
  if (!/Postkarte 1 von 2/.test(pkErste) || !/Postkarte 2 von 2/.test(pkZweite) || ![pkErste, pkZweite].every((z) => /2 von 14 gesammelt/.test(z))) fehlt(`Postkarten nach der Wiese: oben steht «${pkErste}», dann «${pkZweite}»`);
  await leser.evaluate(() => localStorage.removeItem("lernapp.reise"));

  // Die Eltern schalten die Wort-Hilfe aus und stellen die Schrift sehr gross:
  // Beim Selberlesen schweigt ein Tipp auf ein Wort, der Lautsprecher fehlt,
  // die Schrift ist grösser. Beim Vorlesen hilft der Tipp weiterhin.
  const buchSchrift = async (modus) => {
    await leser.goto(`${BASIS}/buecher.html?buch=leo-melone`, { waitUntil: "domcontentloaded" });
    await leser.waitForSelector(".bu-titelseite", { timeout: 8000 }).catch(() => {});
    await leser.locator(`.bu-modus[data-modus="${modus}"]`).click();
    await leser.waitForTimeout(700);
    await leserVergiss();
    await leser.locator(".bu-text .bu-wort").first().click();
    await leser.waitForTimeout(200);
    return leser.evaluate(() => ({
      hilfe: document.querySelector(".bu-buch")?.dataset.hilfe || "an",
      lautsprecher: !document.querySelector(".bu-leiste .bu-vorlesen")?.hidden,
      gesagt: window.__gesagt,
      schrift: parseFloat(getComputedStyle(document.querySelector(".bu-text")).fontSize),
    }));
  };
  const normal = await buchSchrift("selbst");
  await leser.evaluate(() => localStorage.setItem("lernapp.lesen.eltern", JSON.stringify({ startpunkt: "auto", schrift: "auto", groesse: "sehr-gross", hilfe: "aus", at: Date.now() })));
  const ohneHilfe = await buchSchrift("selbst");
  if (normal.hilfe !== "an" || !normal.lautsprecher || !normal.gesagt.length) fehlt(`Wort-Hilfe: ohne Einstellung fehlt sie (${JSON.stringify(normal)})`);
  if (ohneHilfe.hilfe !== "aus" || ohneHilfe.lautsprecher || ohneHilfe.gesagt.length) fehlt(`Wort-Hilfe: abgeschaltet hilft sie trotzdem (${JSON.stringify(ohneHilfe)})`);
  if (!(ohneHilfe.schrift > normal.schrift * 1.2)) fehlt(`Schriftgrösse: «sehr gross» steht in ${ohneHilfe.schrift} px statt mehr als ${normal.schrift} px`);
  const vorgelesen = await buchSchrift("vorlesen");
  if (!vorgelesen.gesagt.length) fehlt("Wort-Hilfe: beim Vorlesen sagt ein Tipp auf ein Wort nichts mehr");
  await leser.evaluate(() => localStorage.removeItem("lernapp.lesen.eltern"));
  await offen.close();

  // Der Lesewurm im Sessel: ein passendes Buch, das noch nicht gelesen ist.
  await oeffne("buecher.html?weiter=1", "window.LernappBuecher");
  await page.waitForSelector(".bu-titelseite", { timeout: 5000 }).catch(() => {});
  const weiter = await page.evaluate(() => window.LernappBuecher.state.buch?.id || null);
  if (!weiter) fehlt("Bücher ?weiter=1: es geht kein Buch auf");
  else if (weiter === "hase-rueebli") fehlt("Bücher ?weiter=1: es geht das Buch auf, das eben gelesen wurde");

  // --- 8. Der Lesewurm wächst ------------------------------------------------------------
  // Seit dem letzten Besuch sind Runden fertig geworden (das Buch, die Spiele):
  // Das Zimmer zeigt ihn in der Stufe aus dem Lesestand, die Karte so viele
  // Buchstaben, wie er hat, und entweder springen neue in die Leiste, oder er
  // hat sich verwandelt.
  const imZimmer = () => page.evaluate(() => {
    const w = document.querySelector(".lese-ort-weiter .lesewurm");
    const blase = document.querySelector(".lese-ort-mission .lw-blase");
    return {
      ist: `${w?.dataset.leben}/${w?.dataset.stufe}`,
      leiste: `${blase?.dataset.hat}/${blase?.dataset.braucht}`,
      geschenk: Boolean(blase?.querySelector(".lw-geschenk")),
      soll: window.LernappLeseStand.wurmStand(),
      regal: [...document.querySelectorAll(".lese-ort-buecher [data-regal]")].map((n) => n.dataset.regal).join(","),
      neu: Boolean(document.querySelector(".lesezimmer-svg .lw-platz.is-neu, .lesezimmer-svg .lw-feld-neu")),
      regalNeu: Boolean(document.querySelector(".lesezimmer-svg .lw-vitrine .is-neu")),
      knall: Boolean(document.querySelector(".lesezimmer-svg .lw-knall")),
      hilfe: window.LernappKids?.currentHelp?.() || "",
    };
  });
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  const wurm = await imZimmer();
  if (wurm.ist !== `${wurm.soll.id}/${wurm.soll.stufe}` || wurm.leiste !== `${wurm.soll.hat}/${wurm.soll.braucht}`) {
    fehlt(`Lesewurm: gezeichnet ${wurm.ist} mit Leiste ${wurm.leiste}, im Lesestand ${wurm.soll.id}/${wurm.soll.stufe} mit ${wurm.soll.hat}/${wurm.soll.braucht}`);
  }
  if (!wurm.neu) fehlt("Lesewurm: nach den Runden zeigt das Zimmer weder neue Buchstaben noch eine Verwandlung");
  // Die drei Leben: Steht er beim Hereinkommen weiter als beim letzten Besuch,
  // zeigt das Zimmer die Verwandlung – nach dem Lesefalter mit einem neuen
  // Wurm und dem Falter auf dem Regal, nach dem Express mit beiden dort, und
  // nach dem Zauberer bleibt nur die Karte ohne Leiste.
  const lesenMit = (runden, gesehen) => page.evaluate(({ runden: n, gesehen: g }) => {
    const s = JSON.parse(localStorage.getItem("lernapp.lesen") || "{}");
    localStorage.setItem("lernapp.lesen", JSON.stringify({ ...s, spiele: { silbenzug: { runden: n, best: 6, zuletzt: 1 } }, missionen: 0 }));
    localStorage.setItem("lernapp.lesen.wurm-gesehen", JSON.stringify(g));
  }, { runden, gesehen });
  const sicherung = await page.evaluate(() => localStorage.getItem("lernapp.lesen"));
  for (const fall of [
    { runden: 75, gesehen: { nr: 15, buchstaben: 70 }, ist: "express/3", leiste: "1/2", regal: "falter", sagt: /Lesefalter fliegt aufs Regal/ },
    { runden: 150, gesehen: { nr: 30, buchstaben: 140 }, ist: "zauberer/5", leiste: "0/3", regal: "falter,express", sagt: /Lesewurm-Express fährt aufs Regal/ },
    { runden: 230, gesehen: { nr: 44, buchstaben: 204 }, ist: "zauberer/15", leiste: "0/0", regal: "falter,express", sagt: /Regenbogen aus Buchstaben/ },
  ]) {
    await lesenMit(fall.runden, fall.gesehen);
    await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
    const z = await imZimmer();
    const wo = `Lesewurm nach ${fall.runden} Runden`;
    if (z.ist !== fall.ist || z.leiste !== fall.leiste) fehlt(`${wo}: ${z.ist} mit Leiste ${z.leiste} statt ${fall.ist} mit ${fall.leiste}`);
    if (z.regal !== fall.regal) fehlt(`${wo}: auf dem Regal stehen «${z.regal}» statt «${fall.regal}»`);
    if (!z.neu || !fall.sagt.test(z.hilfe)) fehlt(`${wo}: die Verwandlung fehlt, oder der Lautsprecher sagt sie nicht (${z.hilfe.slice(0, 90)})`);
    if (fall.regal.split(",").length > Math.floor((fall.gesehen.nr - 1) / 15) && !z.regalNeu) fehlt(`${wo}: was eben aufs Regal gezogen ist, funkelt nicht`);
    if (fall.leiste === "0/0" && z.geschenk) fehlt(`${wo}: nach dem dritten Leben hat die Karte noch ein Geschenk`);
    // Ohne Bewegung steht der Knall nicht still um den Wurm herum.
    if (z.knall) fehlt(`${wo}: ohne Bewegung bleibt der Knall der Verwandlung als Sternhaufen stehen`);
  }
  // Der Wurm verdeckt in keiner seiner 45 Stufen, was neben ihm ein Knopf ist:
  // Auf Pinnwand und Namensschild und auf Knopf, Name und Leiste der Karte
  // liegt obenauf das Ding selbst – ein Tipp dorthin trifft es. Stehen Fühler
  // oder Hut vor dem Zipfel der Karte, ist das recht: Wurm und Karte führen
  // zum selben Spiel. Gezählt wird bis zum fertigen Lesezauberer, eine Runde
  // nach der anderen, und das Zimmer frischt sich dabei an Ort und Stelle auf.
  await page.evaluate(() => {
    localStorage.setItem("lernapp.lesen", JSON.stringify({ woerter: 0, spiele: {}, buecher: {}, laute: {}, blitz: {}, missionen: 0 }));
    localStorage.removeItem("lernapp.lesen.wurm-gesehen");
  });
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg .lese-ort-mission')");
  const verdecktVomWurm = await page.evaluate(async () => {
    const s = window.LernappLeseStand;
    const warte = (ms) => new Promise((weiter) => setTimeout(weiter, ms));
    const raster = (r, nx, ny) => {
      const punkte = [];
      for (let i = 1; i <= nx; i += 1) for (let j = 1; j <= ny; j += 1) punkte.push([r.left + (r.width * i) / (nx + 1), r.top + (r.height * j) / (ny + 1)]);
      return punkte;
    };
    const trifft = (ort, [x, y]) => Boolean(document.elementFromPoint(x, y)?.closest(`[data-ort="${ort}"]`));
    const kasten = (wahl) => document.querySelector(wahl)?.getBoundingClientRect();
    // Wo Pinnwand und Schild ohne grossen Wurm obenauf liegen (Stufe 1).
    const fest = {
      detektiv: raster(kasten('.lesezimmer-svg [data-ort="detektiv"] > rect'), 7, 6).filter((p) => trifft("detektiv", p)),
      wurmname: raster(kasten('.lesezimmer-svg [data-ort="wurmname"]'), 5, 6).filter((p) => trifft("wurmname", p)),
    };
    const funde = [];
    if (fest.detektiv.length < 30 || fest.wurmname.length < 6) funde.push(`zu wenig Messpunkte (${fest.detektiv.length}, ${fest.wurmname.length})`);
    for (let nr = 1; nr <= 45; nr += 1) {
      let runden = 0;
      while (s.wurmStand().nr < nr && runden < 20) { s.spielRunde("silbenzug", { punkte: 6 }); runden += 1; }
      const soll = s.wurmStand();
      for (let mal = 0; mal < 60; mal += 1) {
        const w = document.querySelector(".lese-ort-weiter .lesewurm");
        if (w && `${w.dataset.leben}/${w.dataset.stufe}` === `${soll.id}/${soll.stufe}`) break;
        await warte(25);
      }
      const w = document.querySelector(".lese-ort-weiter .lesewurm");
      if (`${w?.dataset.leben}/${w?.dataset.stufe}` !== `${soll.id}/${soll.stufe}`) { funde.push(`Stufe ${nr}: das Zimmer zeigt ${w?.dataset.leben}/${w?.dataset.stufe}`); continue; }
      const blase = document.querySelector(".lese-ort-mission .lw-blase");
      const karte = [
        ...raster(blase?.querySelector(".lw-los circle")?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }, 2, 2),
        ...raster(blase?.querySelector(".lw-missionsname")?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }, 3, 1),
        ...[...(blase?.querySelectorAll("rect") || [])].filter((r) => r.getAttribute("fill") === "#f6efe2").flatMap((r) => raster(r.getBoundingClientRect(), 8, 1)),
      ];
      const zu = [
        ["Pinnwand", fest.detektiv.filter((p) => !trifft("detektiv", p)).length],
        ["Namensschild", fest.wurmname.filter((p) => !trifft("wurmname", p)).length],
        ["Missionskarte", karte.filter((p) => !trifft("mission", p)).length],
      ].filter(([, n]) => n);
      if (zu.length) funde.push(`Stufe ${nr} (${soll.id}/${soll.stufe}) verdeckt ${zu.map(([was, n]) => `${was} an ${n} Punkten`).join(", ")}`);
    }
    return funde;
  });
  if (verdecktVomWurm.length) fehlt(`Lesewurm verdeckt Knöpfe: ${verdecktVomWurm.slice(0, 4).join(" | ")}`);
  await page.evaluate((s) => { localStorage.setItem("lernapp.lesen", s); localStorage.removeItem("lernapp.lesen.wurm-gesehen"); }, sicherung);

  // --- 9. Der Lesewagen wird gemütlich -------------------------------------------------
  // So viele Dinge, wie der Lesestand sagt; was seit dem letzten Besuch dazukam,
  // leuchtet, und der Lautsprecher nennt es. Keines fängt einen Tipp ab.
  await page.evaluate(() => localStorage.setItem("lernapp.lesen.ausbau-gesehen", "1"));
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  const ausbau = await page.evaluate(() => {
    const dinge = [...document.querySelectorAll(".lesezimmer-svg .lese-ausbau")];
    const fangen = dinge.filter((g) => {
      const r = g.getBoundingClientRect();
      const oben = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return oben && g.contains(oben);
    }).map((g) => g.dataset.ausbau);
    return {
      ids: dinge.map((g) => g.dataset.ausbau),
      neu: dinge.filter((g) => g.classList.contains("is-neu")).map((g) => g.dataset.ausbau),
      soll: window.LernappLeseStand.wagenStufe(),
      reihe: window.LernappLeseArt.AUSBAU.map((a) => a.id),
      hilfe: window.LernappKids?.currentHelp?.() || "",
      fangen,
    };
  });
  if (ausbau.soll < 2 || ausbau.ids.length !== ausbau.soll) fehlt(`Lesewagen: ${ausbau.ids.length} Dinge eingerichtet, ${ausbau.soll} im Lesestand`);
  if (ausbau.ids.slice().sort().join() !== ausbau.reihe.slice(0, ausbau.soll).sort().join()) fehlt(`Lesewagen: eingerichtet sind ${ausbau.ids.join(", ")}`);
  if (ausbau.neu.slice().sort().join() !== ausbau.reihe.slice(1, ausbau.soll).sort().join()) fehlt(`Lesewagen: neu leuchten ${ausbau.neu.join(", ")} statt ${ausbau.reihe.slice(1, ausbau.soll).join(", ")}`);
  if (!/Neu im Lesewagen/.test(ausbau.hilfe)) fehlt(`Lesewagen: der Lautsprecher sagt nicht, was neu ist (${ausbau.hilfe.slice(0, 80)})`);
  if (ausbau.fangen.length) fehlt(`Lesewagen: ${ausbau.fangen.join(", ")} fängt Tipps ab`);
  // Beim nächsten Besuch ist nichts mehr neu.
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  if (await page.locator(".lese-ausbau.is-neu").count()) fehlt("Lesewagen: beim zweiten Besuch leuchtet noch etwas als neu");

  // --- 10. Der Lesewurm fährt auf der Lok mit ----------------------------------------------
  // Erst wenn der Lesewagen ganz eingerichtet ist (60 gelesene Stücke).
  for (const [runden, soll] of [[59, false], [60, true]]) {
    await page.evaluate((n) => localStorage.setItem("lernapp.lesen", JSON.stringify({ woerter: 500, spiele: { silbenzug: { runden: n, best: 6, zuletzt: 1 } }, buecher: {}, laute: {}, blitz: {} })), runden);
    await oeffne("index.html", "document.querySelector('.train-band svg')");
    const faehrt = await page.locator('.train-band [data-part="lesewurm"]').count();
    if (Boolean(faehrt) !== soll) fehlt(`Lesewurm auf der Lok: nach ${runden} Stücken ${faehrt ? "fährt er mit" : "fährt er nicht mit"}`);
  }

  // --- 11. Ruhe nach der Rückkehr, auch mit Konto -------------------------------------------
  // Zurück aus einem Lesespiel melden sich Anmeldung, Schranke, Einstellungen
  // und Fortschritt nacheinander. Früher baute jeder Bescheid das Zimmer neu,
  // und es flackerte drei-, viermal. Jetzt steht es einmal da; was die Cloud
  // am Zimmer ändert – hier ein längerer Lesewurm –, kommt an Ort und Stelle
  // hinein. Der Zug draussen wird beim Hinausgehen neu gebaut.
  const konto = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
  konto.setDefaultTimeout(8000);
  await konto.route("**/*gstatic.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await konto.addInitScript(firebaseMitKonto, { woerter: 400, buecher: {}, spiele: { silbenzug: { runden: 12, best: 6, zuletzt: 1 } }, laute: {}, blitz: {} });
  await konto.addInitScript(stimmeErsatz);
  await konto.addInitScript(zimmerZaehler);
  // Auf dem Gerät: weniger gelesen als in der Cloud, und das Zimmer kennt es.
  await konto.addInitScript(() => {
    if (sessionStorage.getItem("__vorbereitet")) return;
    sessionStorage.setItem("__vorbereitet", "1");
    localStorage.setItem("lernapp.lesen", JSON.stringify({ woerter: 42, buecher: {}, spiele: { silbenzug: { runden: 2, best: 6, zuletzt: 1 } }, laute: {}, blitz: {} }));
    localStorage.setItem("lernapp.lesen.wurm-gesehen", JSON.stringify({ nr: 2, buchstaben: 2 }));
    localStorage.setItem("lernapp.lesen.ausbau-gesehen", "0");
  });
  const kind = await konto.newPage();
  kind.on("pageerror", (e) => fehler.push(`mit Konto: ${e.message}`));
  await kind.goto(`${BASIS}/index.html?lesen=1`, { waitUntil: "domcontentloaded" });
  await kind.waitForSelector(".leseecke .lesezimmer-svg", { timeout: 8000 }).catch(() => {});
  await kind.waitForTimeout(2000);
  const ruhe = await kind.evaluate(() => ({
    ...window.__zimmer,
    ist: `${document.querySelector(".leseecke .lesewurm")?.dataset.leben}/${document.querySelector(".leseecke .lesewurm")?.dataset.stufe}`,
    soll: (() => { const w = window.LernappLeseStand.wurmStand(); return `${w.id}/${w.stufe}`; })(),
    gewachsen: Boolean(document.querySelector(".leseecke .lw-platz.is-neu")),
    hilfe: window.LernappKids?.currentHelp?.() || "",
    angemeldet: Boolean(window.LernappFirebase?.getGameState?.("lernapp.lesen")),
  }));
  if (!ruhe.angemeldet) fehlt("Ruhe: das nachgebaute Konto hat sich nicht angemeldet");
  if (ruhe.platz !== 1) fehlt(`Ruhe: nach der Rückkehr mit Konto wird das Lesezimmer ${ruhe.platz}-mal eingeblendet (erwartet einmal)`);
  if (ruhe.zeichnung > 2) fehlt(`Ruhe: das Zimmer wird ${ruhe.zeichnung}-mal gezeichnet – nur einmal und einmal für den Wurm aus der Cloud`);
  // Zwölf Runden aus der Cloud sind zwölf Buchstaben: Stufe 6, die Fühler.
  if (ruhe.soll !== "falter/6" || ruhe.ist !== ruhe.soll) fehlt(`Ruhe: der Lesewurm aus der Cloud fehlt im Zimmer (${ruhe.ist} gezeichnet, ${ruhe.soll} im Lesestand, erwartet falter/6)`);
  if (!ruhe.gewachsen || !/Fühler/.test(ruhe.hilfe)) fehlt(`Ruhe: dass der Wurm sich verwandelt hat, zeigt und sagt das Zimmer nicht (${ruhe.hilfe.slice(0, 80)})`);
  // Hinaus an den Zug: Jetzt wird die Bühne neu gebaut, und der Text des
  // Lesewagens geht mit.
  await kind.evaluate(() => { document.querySelector(".train-band").dataset.alt = "1"; });
  await kind.locator(".stage-back").click();
  await kind.waitForTimeout(300);
  const draussen = await kind.evaluate(() => ({
    ansicht: document.querySelector(".train-stage")?.dataset.view,
    neuerZug: Boolean(document.querySelector(".train-band")) && !document.querySelector(".train-band[data-alt]"),
    hilfe: window.LernappKids?.currentHelp?.() || "",
  }));
  if (draussen.ansicht !== "home") fehlt(`Ruhe: der Pfeil führt aus dem Lesewagen nach «${draussen.ansicht}»`);
  if (!draussen.neuerZug) fehlt("Ruhe: draussen steht noch der Zug von vor den Bescheiden aus der Cloud");
  if (/Lesewagen|Lesewurm/.test(draussen.hilfe)) fehlt(`Ruhe: draussen spricht noch der Lesewagen (${draussen.hilfe.slice(0, 60)})`);
  await konto.close();

  // --- 12. Mit Bewegung ---------------------------------------------------------------------
  // Alles oben läuft mit «weniger Bewegung», und dann steht jede Animation
  // still. Genau darum fiel nicht auf, dass der winkende Arm der Tiere seine
  // Lage verlor: Die CSS-Bewegung ersetzte sein transform-Attribut, und er
  // lag beim Winken unten am Boden. Hier mit Bewegung, wie bei einem Kind,
  // das nichts eingestellt hat: Kein Teil einer Zeichnung verliert sein
  // transform-Attribut an CSS, und Finos Hand ist oben, nicht bei den Füssen.
  // Dazu: Startbild und die älteren Spiele markieren keinen Text.
  const bewegt = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block" });
  bewegt.setDefaultTimeout(8000);
  await bewegt.route("**/*gstatic.com/**", (route) => route.abort());
  await bewegt.addInitScript(stimmeErsatz);
  const bunt = await bewegt.newPage();
  bunt.on("pageerror", (e) => fehler.push(`mit Bewegung: ${e.message}`));
  const verdraengt = () => bunt.evaluate(() => {
    const funde = [];
    document.querySelectorAll("svg [transform]").forEach((n) => {
      const css = getComputedStyle(n).transform;
      if (!css || css === "none") return;
      const m = n.transform?.baseVal?.consolidate?.()?.matrix;
      const attr = m ? [m.a, m.b, m.c, m.d, m.e, m.f] : [1, 0, 0, 1, 0, 0];
      const c = new DOMMatrix(css);
      if ([c.a, c.b, c.c, c.d, c.e, c.f].some((v, i) => Math.abs(v - attr[i]) > 0.02)) funde.push(`${n.getAttribute("class") || n.tagName} (${n.getAttribute("transform")})`);
    });
    return funde;
  });
  // Der Los-Knopf pulsiert mit Bewegung; ein Klick der Prüfung wartete
  // vergeblich darauf, dass er still steht.
  const losBunt = () => bunt.evaluate(() => document.querySelector(".lese-los-knopf")?.click());
  for (const [seite, bereit, bild] of [["postkarten.html", "window.LernappPostkarten", ".pk-vorne svg"], ["geschichtenzug.html", "window.LernappGeschichtenzug", ".gz-neben .bu-bild-svg"]]) {
    await bunt.goto(`${BASIS}/${seite}`, { waitUntil: "domcontentloaded" });
    await bunt.waitForFunction(bereit, null, { timeout: 10000 }).catch(() => {});
    await bunt.waitForTimeout(300);
    await losBunt();
    await bunt.waitForSelector(bild, { timeout: 5000 }).catch(() => {});
    const funde = new Set();
    for (let mal = 0; mal < 4; mal += 1) {
      await bunt.waitForTimeout(250);
      (await verdraengt()).forEach((f) => funde.add(f));
    }
    if (funde.size) fehlt(`Mit Bewegung, ${seite}: CSS verdrängt die Lage von ${[...funde].slice(0, 3).join(", ")}`);
  }
  await bunt.goto(`${BASIS}/postkarten.html`, { waitUntil: "domcontentloaded" });
  await bunt.waitForFunction("window.LernappPostkarten", null, { timeout: 10000 }).catch(() => {});
  await bunt.waitForTimeout(300);
  await losBunt();
  await bunt.waitForSelector(".pk-vorne .journey-passenger-arm", { timeout: 5000 }).catch(() => {});
  for (let mal = 0; mal < 3; mal += 1) {
    await bunt.waitForTimeout(300);
    const arm = await bunt.evaluate(() => {
      const figur = document.querySelector(".pk-vorne .journey-passenger.is-waving");
      const hand = figur?.querySelector(".journey-passenger-arm circle")?.getBoundingClientRect();
      const koerper = figur?.querySelectorAll(":scope > rect")[2]?.getBoundingClientRect();
      return hand && koerper ? { hand: Math.round(hand.top + hand.height / 2), oben: Math.round(koerper.top), unten: Math.round(koerper.bottom) } : null;
    });
    if (!arm || arm.hand > arm.oben + 4) { fehlt(`Mit Bewegung: Finos winkende Hand ist nicht oben (${JSON.stringify(arm)})`); break; }
  }
  // Das Zimmer mit Bewegung: Was sich antippen lässt, hüpft beim Hereinkommen
  // reihum, zuletzt der Lesewurm; die Einrichtung hüpft nie, und die Schatten
  // bleiben am Boden liegen. Keines verliert dabei seine Lage an CSS. Frischt
  // sich das Zimmer auf, weil neuer Lesestand kommt, hüpft nichts noch einmal.
  await bunt.evaluate(() => localStorage.setItem("lernapp.lesen", JSON.stringify({ woerter: 400, spiele: { silbenzug: { runden: 12, best: 6, zuletzt: 1 } }, buecher: {}, laute: {}, blitz: {} })));
  await bunt.goto(`${BASIS}/index.html?lesen=1`, { waitUntil: "domcontentloaded" });
  await bunt.waitForFunction(() => document.querySelector(".lesezimmer-svg [data-ort]"), null, { timeout: 10000 }).catch(() => {});
  // Erst wenn das Zimmer eingeblendet ist: Das Einblenden zoomt ein wenig und
  // sähe beim Messen selbst wie ein Hüpfer aus.
  await bunt.waitForTimeout(500);
  const huepfen = await bunt.evaluate(() => {
    const svg = document.querySelector(".lesezimmer-svg");
    const orte = [...(svg?.querySelectorAll("[data-ort]") || [])];
    const name = (n) => getComputedStyle(n).animationName;
    const verzug = (n) => parseFloat(getComputedStyle(n).animationDelay) || 0;
    return {
      klasse: Boolean(svg?.classList.contains("is-huepfen")),
      still: orte.filter((n) => name(n) !== "lese-ort-huepft").map((n) => n.dataset.ort),
      einrichtung: [...(svg?.querySelectorAll(".lese-ausbau, .lese-ausbau *") || [])].filter((n) => name(n) === "lese-ort-huepft").length,
      reihe: orte.slice().sort((a, b) => verzug(a) - verzug(b)).map((n) => n.dataset.ort).join(","),
      soll: (window.LernappLeseecke?.REIHUM || []).join(","),
      verzuege: new Set(orte.map(verzug)).size,
      schatten: [...(svg?.querySelectorAll(".lese-ort .lese-schatten") || [])].map((n) => name(n)),
    };
  });
  if (!huepfen.klasse || huepfen.still.length) fehlt(`Zimmer mit Bewegung: es hüpft nicht alles, was sich antippen lässt (still: ${huepfen.still.join(", ") || "alles"})`);
  if (huepfen.einrichtung) fehlt(`Zimmer mit Bewegung: ${huepfen.einrichtung} Teile der Einrichtung hüpfen mit`);
  if (huepfen.reihe !== huepfen.soll || huepfen.verzuege < 9 || !huepfen.reihe.endsWith("weiter,mission")) fehlt(`Zimmer mit Bewegung: die Dinge hüpfen nicht reihum (${huepfen.reihe})`);
  if (huepfen.schatten.length < 4 || huepfen.schatten.some((n) => n !== "lese-schatten-bleibt")) fehlt(`Zimmer mit Bewegung: die Schatten hüpfen mit (${huepfen.schatten.join(", ")})`);
  // Ein paar Bilder lang hinsehen: Jedes Ding geht wirklich hoch, sein Schatten
  // bleibt liegen, und keine Lage geht an CSS verloren.
  const hoch = {};
  const boden = {};
  const lageWeg = new Set();
  for (let mal = 0; mal < 30; mal += 1) {
    const jetzt = await bunt.evaluate(() => ({
      orte: Object.fromEntries([...document.querySelectorAll(".lesezimmer-svg [data-ort]")].map((n) => [n.dataset.ort, n.getBoundingClientRect().top])),
      schatten: Object.fromEntries([...document.querySelectorAll(".lesezimmer-svg .lese-ort .lese-schatten")].map((n) => { const r = n.getBoundingClientRect(); return [n.closest("[data-ort]").dataset.ort, (r.top + r.bottom) / 2]; })),
    }));
    Object.entries(jetzt.orte).forEach(([ort, y]) => { (hoch[ort] ||= []).push(y); });
    Object.entries(jetzt.schatten).forEach(([ort, y]) => { (boden[ort] ||= []).push(y); });
    if (mal % 6 === 0) (await verdraengt()).forEach((f) => lageWeg.add(f));
    await bunt.waitForTimeout(90);
  }
  const hub = (werte) => Math.max(...werte) - Math.min(...werte);
  const kaumBewegt = Object.entries(hoch).filter(([, werte]) => hub(werte) < 6).map(([ort]) => ort);
  const schattenWandert = Object.entries(boden).filter(([, werte]) => hub(werte) > 1).map(([ort, werte]) => `${ort} ${Math.round(hub(werte))} px`);
  if (kaumBewegt.length) fehlt(`Zimmer mit Bewegung: ${kaumBewegt.join(", ")} hüpft nicht sichtbar`);
  if (schattenWandert.length) fehlt(`Zimmer mit Bewegung: Schatten heben vom Boden ab (${schattenWandert.join(", ")})`);
  if (lageWeg.size) fehlt(`Zimmer mit Bewegung: CSS verdrängt die Lage von ${[...lageWeg].slice(0, 3).join(", ")}`);
  // Eine Runde mehr (aus der Cloud, von einem anderen Gerät): ein Buchstabe
  // mehr in der Leiste, an Ort und Stelle.
  const leisteVorher = await bunt.evaluate(() => Number(document.querySelector(".lesezimmer-svg .lw-blase")?.dataset.hat || 0));
  await bunt.evaluate(() => window.LernappLeseStand.spielRunde("stimmtdas", { punkte: 6 }));
  await bunt.waitForTimeout(150);
  const aufgefrischt = await bunt.evaluate(() => {
    const svg = document.querySelector(".lesezimmer-svg");
    return {
      hat: Number(svg?.querySelector(".lw-blase")?.dataset.hat || 0),
      neuesFeld: svg?.querySelectorAll(".lw-feld-neu").length || 0,
      klasse: Boolean(svg?.classList.contains("is-huepfen")),
      huepfen: [...(svg?.querySelectorAll("[data-ort]") || [])].filter((n) => getComputedStyle(n).animationName === "lese-ort-huepft").length,
    };
  });
  if (aufgefrischt.hat !== leisteVorher + 1 || aufgefrischt.neuesFeld !== 1) fehlt(`Zimmer mit Bewegung: nach einer Runde mehr frischt sich die Leiste nicht auf (${leisteVorher} → ${aufgefrischt.hat}, ${aufgefrischt.neuesFeld} neue Felder)`);
  else if (aufgefrischt.klasse || aufgefrischt.huepfen) fehlt("Zimmer mit Bewegung: beim Auffrischen hüpft alles noch einmal");

  // Die Verwandlung mit Bewegung, Bild für Bild: Beim letzten Besuch stand der
  // Lesefalter auf Stufe 6 mit 13 Buchstaben, jetzt sind es 15 – Stufe 7.
  // Erst springen die zwei neuen Buchstaben in die alte Leiste, dann geht das
  // Geschenk auf, der Wurm verschwindet und erscheint mit einem Knall in der
  // neuen Stufe. Dabei hüpft nichts (die Verwandlung ist das Ereignis), und
  // keine Lage geht an CSS verloren. Beim nächsten Besuch ist sie vorbei.
  await bunt.evaluate(() => {
    localStorage.setItem("lernapp.lesen", JSON.stringify({ woerter: 400, spiele: { silbenzug: { runden: 15, best: 6, zuletzt: 1 } }, buecher: {}, laute: {}, blitz: {} }));
    localStorage.setItem("lernapp.lesen.wurm-gesehen", JSON.stringify({ nr: 6, buchstaben: 13 }));
  });
  await bunt.goto(`${BASIS}/index.html?lesen=1`, { waitUntil: "domcontentloaded" });
  await bunt.waitForFunction(() => document.querySelector(".lesezimmer-svg .lesewurm"), null, { timeout: 10000 }).catch(() => {});
  const bilder = [];
  const lageVerwandlung = new Set();
  for (let mal = 0; mal < 40; mal += 1) {
    bilder.push(await bunt.evaluate(() => {
      const svg = document.querySelector(".lesezimmer-svg");
      const q = (s) => Boolean(svg?.querySelector(s));
      return {
        stufe: svg?.querySelector(".lese-ort-weiter .lesewurm")?.dataset.stufe || "",
        felder: q(".lw-feld-neu"),
        geschenk: q(".lw-geschenk-auf"),
        weg: q(".lw-platz.is-weg"),
        knall: q(".lw-knall"),
        huepft: Boolean(svg?.classList.contains("is-huepfen")),
      };
    }));
    if (mal % 5 === 0) (await verdraengt()).forEach((f) => lageVerwandlung.add(f));
    await bunt.waitForTimeout(80);
  }
  const zuerst = (pruef) => bilder.findIndex(pruef);
  const phasen = [
    zuerst((b) => b.stufe === "6" && b.felder),
    zuerst((b) => b.stufe === "6" && b.geschenk),
    zuerst((b) => b.stufe === "6" && b.weg),
    zuerst((b) => b.stufe === "7" && b.knall),
  ];
  if (phasen.some((i) => i < 0) || phasen.some((i, n) => n && i < phasen[n - 1])) {
    fehlt(`Verwandlung mit Bewegung: nicht Buchstaben, Geschenk, Verschwinden, Knall nacheinander (${phasen.join(", ")}; ${bilder.map((b) => `${b.stufe}${b.felder ? "f" : ""}${b.geschenk ? "g" : ""}${b.weg ? "w" : ""}${b.knall ? "k" : ""}`).join(" ")})`);
  }
  if (bilder.at(-1)?.stufe !== "7" || bilder.at(-1)?.weg) fehlt(`Verwandlung mit Bewegung: am Schluss steht nicht Stufe 7 da (${JSON.stringify(bilder.at(-1))})`);
  if (bilder.some((b) => b.huepft)) fehlt("Verwandlung mit Bewegung: das Zimmer hüpft mitten in die Verwandlung");
  if (lageVerwandlung.size) fehlt(`Verwandlung mit Bewegung: CSS verdrängt die Lage von ${[...lageVerwandlung].slice(0, 3).join(", ")}`);
  const nachVerwandlung = await bunt.evaluate(() => ({
    hilfe: window.LernappKids?.currentHelp?.() || "",
    gesehen: localStorage.getItem("lernapp.lesen.wurm-gesehen"),
  }));
  if (!/Überraschung! Dein Lesewurm ist dick und bunt geringelt!/.test(nachVerwandlung.hilfe)) fehlt(`Verwandlung mit Bewegung: der Lautsprecher sagt die Überraschung nicht (${nachVerwandlung.hilfe.slice(0, 90)})`);
  if (nachVerwandlung.gesehen !== JSON.stringify({ nr: 7, buchstaben: 15 })) fehlt(`Verwandlung mit Bewegung: gemerkt ist ${nachVerwandlung.gesehen}`);
  await bunt.goto(`${BASIS}/index.html?lesen=1`, { waitUntil: "domcontentloaded" });
  await bunt.waitForFunction(() => document.querySelector(".lesezimmer-svg .lesewurm"), null, { timeout: 10000 }).catch(() => {});
  await bunt.waitForTimeout(300);
  const zweiterBesuch = await bunt.evaluate(() => {
    const svg = document.querySelector(".lesezimmer-svg");
    return { huepft: Boolean(svg?.classList.contains("is-huepfen")), alt: Boolean(svg?.querySelector(".lw-geschenk-auf, .lw-platz.is-weg, .lw-knall, .lw-platz.is-neu")) };
  });
  if (!zweiterBesuch.huepft || zweiterBesuch.alt) fehlt(`Verwandlung mit Bewegung: beim nächsten Besuch ${zweiterBesuch.alt ? "verwandelt er sich noch einmal" : "hüpft das Zimmer nicht"}`);

  for (const [seite, bereit, wahl] of [["index.html", "document.querySelector('.train-stage .train-band')", ".train-stage"], ["buchstaben.html", "document.querySelector('.app-shell')", ".app-shell"]]) {
    await bunt.goto(`${BASIS}/${seite}`, { waitUntil: "domcontentloaded" });
    await bunt.waitForFunction(bereit, null, { timeout: 10000 }).catch(() => {});
    const markieren = await bunt.evaluate((w) => { const n = document.querySelector(w); return n ? getComputedStyle(n).userSelect : "fehlt"; }, wahl);
    if (markieren !== "none") fehlt(`${seite}: Text lässt sich markieren (${wahl} ${markieren}) – auf Android öffnet ein Tipp die Google-Suche`);
  }
  await bewegt.close();

  if (fehler.length) fehlt(`Fehler auf den Seiten: ${[...new Set(fehler)].slice(0, 5).join(" | ")}`);
} finally {
  await browser.close();
  halt();
}

if (befunde.length) {
  console.error("Die Leseecke stimmt im Browser nicht:");
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Leseecke läuft: Lesewagen, Zimmer mit Auswahl, alle Spiele hin und zurück, eine Runde Silbenzug bis zum Tor, Laute kuppeln ohne verratenes Wort, Buchstabenhaus, der Würfel von «Stimmt das?», Reimkupplung, Anlaut-Lauscher, Wer fährt mit?, Wörter bauen, Silbenbahn, Blitzwörter, Mein Name, der Lesewurm bekommt seinen Namen, Lückensätze, Buchstabengleis, Satz kuppeln, Quatschsätze, Stolperwörter, Quatschwörter, Laut-Position, Buchstaben-Signal, Lies und tu!, Geschichtenzug, Wer bin ich?, Wortbaustelle, Steckbriefe, Detektivfälle, Postkarten, die Buchstaben der Schule, Hörbuch mit Nachsehen, Aufnahmen fester Texte statt der Gerätestimme (auch im Lesewagen, mit Rückfall und Anhalten), Zusammen lesen, Kapitelbücher mit Überschrift, Lesezeichen und gemalten Bildern, Runden auf Zeit, Wort-Hilfe und Schriftgrösse der Eltern, Spiele, die mitwachsen, Ruhe nach der Rückkehr mit Konto, winkende Tiere mit Bewegung, die Missionskarte des Lesewurms mit zwei Buchstaben für seine Runde, seine drei Leben mit Verwandlung (auch mit Bewegung) und den Fertigen auf dem Regal, der Lesewagen wird gemütlich, und der Lesewurm fährt auf der Lok mit.");
