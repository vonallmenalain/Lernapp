/*
 * Wird ein Besuch gemeldet – und nur dann, wenn er soll?
 * ---------------------------------------------------------------------------
 * Bis besuch.mjs entstand ein Gastdokument erst, wenn jemand ein Level
 * STARTETE. Wer die App öffnete, sich umsah und wieder ging, hinterliess
 * nichts – und fehlte damit in der Antwort auf die Frage, wie viele Menschen
 * die App überhaupt besuchen. Seither meldet die App beim Öffnen einmal an
 * POST /api/besuch.
 *
 * Diese Prüfung steht hier, weil der Adminbereich sie nicht abdecken kann:
 * Dort ist immer jemand angemeldet, und angemeldet wird gerade nichts
 * gemeldet. Es ist die einzige Stelle, die den Client-Teil der Zählung
 * anfasst.
 *
 * Gemessen wird – der Server wird dabei abgefangen, nicht angerufen:
 *   - Ohne Konto geht genau EIN Aufruf raus, mit einer Kennung, die dem
 *     Muster aus firestore.rules entspricht
 *   - Er trägt Sprache, Zeitzone, Bildschirmgrösse und die Seite bei sich –
 *     und weder User-Agent noch IP: Was der Server ohnehin sieht, hat im
 *     Rumpf nichts zu suchen
 *   - Ein Neuladen innerhalb der Sperrfrist meldet NICHT noch einmal. Das ist
 *     die Bremse auf dem Gerät; der Server hat seine eigene
 *   - Ist die Sperrfrist abgelaufen, meldet die App wieder
 *   - Wer angemeldet ist, meldet gar nicht: Ein Konto steht im Reiter "User",
 *     nicht bei den Gästen
 *   - Antwortet der Server nicht, passiert nichts Sichtbares. Ein Zähler ist
 *     das Unwichtigste in dieser App und darf nie etwas kaputtmachen –
 *     deshalb wird hier auch auf Fehler in der Seite geachtet
 *
 * Aufruf:  node scripts/check-besuch.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4196);
const BASIS = `http://127.0.0.1:${PORT}`;

// Dasselbe Muster wie in firestore.rules (isGuestId) und in besuch.mjs
// (GAST_MUSTER). Läuft eine Stelle weg, schickt der Client Kennungen, die der
// Server ablehnt.
const GAST_MUSTER = /^guest_[A-Za-z0-9_-]{8,48}$/;
const SPERRFRIST_MS = 30 * 60 * 1000;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich der Aufruf nicht prüfen."); process.exit(2); }

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });
async function warteAufServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht */ } await new Promise((w) => setTimeout(w, 100)); }
  return false;
}

const befunde = [];
const pruefe = (bedingung, was) => { if (!bedingung) befunde.push(was); };

// Ein Firebase, das nur eines kann: sagen, ob jemand angemeldet ist. Mehr
// braucht die Zählung nicht zu wissen – und weniger auch nicht, denn genau an
// dieser Antwort hängt sie.
function firebaseErsatz({ angemeldet }) {
  const KIND = { uid: "kind-1", email: "lino@lernapp.local", emailVerified: false, displayName: "Lino", providerData: [{ providerId: "password" }] };
  const daten = new Map([["users/kind-1", { authEmail: KIND.email, username: "Lino", displayName: "Lino", role: "child", stats: { totalSeconds: 0, moves: 0, resets: 0, solvedLevels: 0, sessions: 0 } }]]);
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
  const nutzer = { ...KIND, updateProfile: async () => {}, reload: async () => {}, getIdToken: async () => "token-attrappe" };
  const auth = () => ({
    currentUser: null,
    setPersistence: () => Promise.resolve(),
    onAuthStateChanged(rueckruf) { setTimeout(() => rueckruf(angemeldet ? nutzer : null), 0); return () => {}; },
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

if (!(await warteAufServer())) { console.error("Server antwortet nicht."); process.exit(2); }

const browser = await playwright.chromium.launch();
try {
  // --- Ohne Konto: einmal melden -------------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
    context.setDefaultTimeout(5000);
    await context.route("**/*gstatic.com/**", (route) => route.abort());
    await context.addInitScript(firebaseErsatz, { angemeldet: false });

    const aufrufe = [];
    // Abgefangen, nicht durchgelassen: Diese Prüfung misst den Client. Was der
    // Server daraus macht, steht in test-functions.mjs.
    await context.route("**/api/besuch", async (route) => {
      let rumpf = {};
      try { rumpf = JSON.parse(route.request().postData() || "{}"); } catch { rumpf = { kaputt: true }; }
      aufrufe.push(rumpf);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, gezaehlt: true }) });
    });

    const page = await context.newPage();
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push(e.message));
    await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
    await page.waitForTimeout(1200);

    pruefe(aufrufe.length === 1, `Ohne Konto ging ${aufrufe.length} Mal ein Besuch raus, erwartet war einmal`);
    const erster = aufrufe[0] || {};
    pruefe(GAST_MUSTER.test(erster.guestId || ""), `Die gemeldete Kennung passt nicht zum Muster aus firestore.rules: ${erster.guestId}`);
    pruefe(erster.client?.sprache, "Die Sprache fehlt in der Meldung");
    pruefe(erster.client?.zeitzone, "Die Zeitzone fehlt in der Meldung");
    pruefe(/^\d{2,5}×\d{2,5}$/.test(erster.client?.bildschirm || ""), `Die Bildschirmgrösse fehlt oder ist krumm: ${erster.client?.bildschirm}`);
    pruefe(erster.client?.seite !== undefined, "Die Seite fehlt in der Meldung");

    // Was der Server ohnehin sieht, gehört nicht in den Rumpf – und was er nie
    // sehen soll, erst recht nicht.
    const alsText = JSON.stringify(erster);
    pruefe(!/Mozilla|AppleWebKit|Chrome\//.test(alsText), `Der User-Agent steht im Rumpf: ${alsText.slice(0, 200)}`);
    pruefe(!/\b\d{1,3}(\.\d{1,3}){3}\b/.test(alsText), `Etwas, das wie eine IP-Adresse aussieht, steht im Rumpf: ${alsText.slice(0, 200)}`);

    // --- Neuladen meldet nicht noch einmal ---------------------------------
    await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
    await page.waitForTimeout(1200);
    pruefe(aufrufe.length === 1, `Ein Neuladen hat noch einmal gemeldet (${aufrufe.length} Aufrufe) – die Bremse auf dem Gerät greift nicht`);

    // Die Kennung bleibt dieselbe: Sie überlebt das Neuladen, sonst zählte
    // jeder Aufruf als neues Gerät.
    const kennungNachher = await page.evaluate(() => localStorage.getItem("lernapp.guest.id"));
    pruefe(kennungNachher === erster.guestId, `Die Gastkennung hat sich beim Neuladen geändert: ${kennungNachher}`);

    // --- Sperrfrist abgelaufen: wieder melden ------------------------------
    // Die Uhr lässt sich hier nicht vorstellen, der Zeitstempel schon – und
    // genau er entscheidet.
    await page.evaluate((frist) => {
      localStorage.setItem("lernapp.guest.lastPing", String(Date.now() - frist - 1000));
    }, SPERRFRIST_MS);
    await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
    await page.waitForTimeout(1200);
    pruefe(aufrufe.length === 2, `Nach Ablauf der Sperrfrist wurde nicht wieder gemeldet (${aufrufe.length} Aufrufe)`);
    pruefe(aufrufe[1]?.guestId === erster.guestId, "Der zweite Besuch kam unter einer anderen Kennung – dasselbe Gerät zählte doppelt");

    pruefe(seitenFehler.length === 0, `Die Seite hat Fehler geworfen: ${seitenFehler.slice(0, 2).join(" | ")}`);
    await context.close();
  }

  // --- Mit Konto: gar nicht melden ------------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
    context.setDefaultTimeout(5000);
    await context.route("**/*gstatic.com/**", (route) => route.abort());
    await context.addInitScript(firebaseErsatz, { angemeldet: true });
    const aufrufe = [];
    await context.route("**/api/besuch", async (route) => {
      aufrufe.push(1);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    const page = await context.newPage();
    await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
    await page.waitForTimeout(1200);
    pruefe(aufrufe.length === 0, `Ein angemeldetes Konto hat sich als Gast gemeldet (${aufrufe.length} Aufrufe)`);
    await context.close();
  }

  // --- Der Server antwortet nicht -------------------------------------------
  // Der wichtigste Fall, und der einzige, den ein Kind je merken würde. Ein
  // Zähler darf nichts kaputtmachen: keine Fehlermeldung, keine hängende
  // Seite, kein fehlender Startknopf.
  {
    const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
    context.setDefaultTimeout(5000);
    await context.route("**/*gstatic.com/**", (route) => route.abort());
    await context.addInitScript(firebaseErsatz, { angemeldet: false });
    await context.route("**/api/besuch", (route) => route.abort("failed"));
    const page = await context.newPage();
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push(e.message));
    await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
    await page.waitForTimeout(1200);
    pruefe(seitenFehler.length === 0, `Ein fehlgeschlagener Besuchsaufruf wirft Fehler in der Seite: ${seitenFehler.slice(0, 2).join(" | ")}`);
    pruefe(await page.locator("body").isVisible(), "Die Seite steht nach einem fehlgeschlagenen Besuchsaufruf nicht mehr");
    await context.close();
  }
} finally {
  await browser.close();
  halt();
}

if (befunde.length) {
  console.error(`${befunde.length} Befund(e):`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Besuchszählung meldet sich einmal ohne Konto, nicht beim Neuladen, wieder nach der Sperrfrist, nie mit Konto – und bleibt still, wenn der Server schweigt.");
process.exit(0);
