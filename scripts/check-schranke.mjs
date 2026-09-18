/*
 * Steht das Tor da, wo es soll – und nur dort?
 * ---------------------------------------------------------------------------
 * Ein Gast ohne Konto bekommt den freien Teil: von jedem der fünfundzwanzig
 * Spiele eine Runde, und die ersten zehn Stationen der Reise. Ist die Runde
 * gespielt, trägt das Haus ein Schloss, wird blass, und statt zu öffnen zeigt
 * es das Tor – den Zug vor der Schranke. Hinter dem Knopf "Für Eltern"
 * wartet ein Rechenrätsel, und erst die richtige Antwort öffnet das
 * Profilfenster.
 *
 * Die verbrauchten Runden stehen im Speicher des Geräts. Diese Prüfung legt
 * sie vor dem Laden hinein – so lässt sich der Zustand "schon gespielt"
 * zeigen, ohne fünfundzwanzig Runden zu spielen.
 *
 * Geprüft wird im Browser, ohne Firebase (das SDK ist umgeleitet, also gilt
 * "Gast"):
 *   - Startbild frisch: kein Haus trägt ein Schloss
 *   - Startbild mit verbrauchter Runde: genau dieses Haus trägt ein Schloss,
 *     ist blass, zeigt beim Tippen das Tor – die anderen nicht
 *   - Der Zug als Menü: ein Tipp auf einen Wagen zeigt die fünf Spiele seines
 *     Bereichs, verbrauchte mit Schloss
 *   - Tor: Zurück schliesst; "Für Eltern" → Rätsel; falsch dreimal → Tor;
 *     richtig → der Preis, nicht die Anmeldung;
 *     richtig → Profilfenster
 *   - Direktaufruf: memory.html frisch baut die Bühne, memory.html mit
 *     verbrauchter Runde zeigt das Tor mit Rückweg
 *   - Levelwahl: buchstaben.html frisch hat alle Stufen offen, mit
 *     verbrauchter Runde alle zu und mit Tor
 *   - Die Rechnung selbst: Station 10 frei, 11 zu; jedes Spiel frei, bis es
 *     gespielt ist, und dann nur dieses zu
 *
 * Und zum Schluss mit Konto (ein nachgebautes Firebase, das sich – wie im
 * Ernstfall – erst nach einem Moment meldet): Ein Kind mit Gründer-Zugang
 * darf das Tor nie sehen, auch nicht für den Augenblick, in dem die Anmeldung
 * noch unterwegs ist. Genau das ging einmal schief: Die Bühne fragte die
 * Schranke, bevor Firebase gesagt hatte, wer spielt, bekam "Gast" zur Antwort
 * und liess das Tor stehen – bei jedem Öffnen einer Station.
 *
 * Aufruf:  node scripts/check-schranke.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4192);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich das Tor nicht prüfen."); process.exit(2); }

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

// Drei angemeldete Konten. verzoegerung ist der Moment, in dem Firebase sagt,
// wer da ist – im Ernstfall ein paar Hundertstel bis Sekunden, und genau in
// dieser Lücke stand das Tor einmal falsch.
const KONTEN = [
  { name: "Gründerkind (langsame Anmeldung)", verzoegerung: 700, parentUid: null, kauf: false, grund: "gruender", tor: false },
  { name: "Gründerkind (sofort)", verzoegerung: 0, parentUid: null, kauf: false, grund: "gruender", tor: false },
  { name: "Kind mit Elternkonto, ohne Kauf", verzoegerung: 300, parentUid: "eltern1", kauf: false, grund: "offen", tor: true },
  { name: "Kind mit Elternkonto, gekauft", verzoegerung: 300, parentUid: "eltern1", kauf: true, grund: "gekauft", tor: false },
];

// Ein schlankes Firebase für den Browser: ein Kind, sein Kontodokument und –
// wenn gekauft – sein Kaufeintrag. Mehr braucht die Schranke nicht zu wissen.
function firebaseErsatz({ verzoegerung, parentUid, kauf }) {
  const KIND = { uid: "kind-alt", email: "lino@lernapp.local", emailVerified: false, displayName: "Lino", providerData: [{ providerId: "password" }] };
  const daten = new Map([["users/kind-alt", {
    authEmail: KIND.email, email: null, username: "Lino", displayName: "Lino", role: "child",
    ...(parentUid ? { parentUid } : {}),
    stats: { totalSeconds: 60, moves: 5, resets: 0, solvedLevels: 0, sessions: 1 },
  }]]);
  if (kauf) daten.set("entitlements/kind-alt", { plan: "familie", active: true, grantedAtMs: 1700000000000, source: "stripe" });
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
    onAuthStateChanged(rueckruf) { setTimeout(() => rueckruf(nutzer), verzoegerung); return () => {}; },
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
  const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
  context.setDefaultTimeout(5000);
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  const page = await context.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(e.message));
  const oeffne = async (pfad) => {
    await page.goto(`${BASIS}/${pfad}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.LernappEntitlement && window.LernappFirebase), null, { timeout: 10000 });
    await page.waitForTimeout(400);
  };
  // Die verbrauchten Schnupperrunden. Sie stehen im Speicher des Geräts, und
  // die Schranke liest sie beim Laden – also müssen sie vorher dort liegen.
  const RUNDEN_KEY = "lernapp.gratis.runden";
  const verbrauche = async (stand) => {
    await page.evaluate(([key, wert]) => localStorage.setItem(key, JSON.stringify(wert)), [RUNDEN_KEY, stand]);
  };
  const frischerSpeicher = async () => {
    await page.evaluate((key) => localStorage.removeItem(key), RUNDEN_KEY);
  };

  // --- Die Rechnung ---------------------------------------------------------
  await oeffne("index.html");
  await frischerSpeicher();
  const rechnung = await page.evaluate(() => {
    const e = window.LernappEntitlement;
    return {
      grund: e.reason(), frei: e.isFree(), runden: e.GRATIS_RUNDEN,
      s1: e.stationFree(1), s10: e.stationFree(10), s11: e.stationFree(11), s130: e.stationFree(130),
      backpack: e.gameFree("backpack.html"), memory: e.gameFree("memory.html"), tiersprung: e.gameFree("tiersprung.html"), kakuro: e.gameFree("kakuro.html"),
      werkstatt: e.gameFree("train-test.html"),
      ziel10: e.targetFree("arukone.html?station=10"), ziel11: e.targetFree("kakuro.html?station=11"),
      wiese: e.levelFree({ game: "letterPuzzle", difficulty: "easy" }), wald: e.levelFree({ game: "letterPuzzle", difficulty: "medium" }),
      kakuroWeltall: e.levelFree({ game: "kakuro", difficulty: "expert" }),
    };
  });
  if (rechnung.grund !== "gast") fehlt(`ohne Konto ist der Grund ${rechnung.grund}, erwartet gast`);
  if (rechnung.frei) fehlt("ein Gast ist frei");
  if (rechnung.runden !== 1) fehlt(`GRATIS_RUNDEN ist ${rechnung.runden}, erwartet 1`);
  if (!rechnung.s1 || !rechnung.s10) fehlt("Station 1 oder 10 ist für den Gast zu");
  if (rechnung.s11 || rechnung.s130) fehlt("Station 11 oder 130 ist für den Gast frei");
  if (!rechnung.backpack || !rechnung.memory || !rechnung.tiersprung || !rechnung.kakuro) fehlt("ein noch nie gespieltes Spiel ist zu");
  if (!rechnung.werkstatt) fehlt("eine Seite ohne Bereich (Werkstatt) ist zu");
  if (!rechnung.ziel10) fehlt("Ziel mit Station 10 ist zu");
  if (rechnung.ziel11) fehlt("Ziel mit Station 11 ist frei");
  if (!rechnung.wiese || !rechnung.wald || !rechnung.kakuroWeltall) fehlt("eine Welt ist einzeln gesperrt – es soll nur das Spiel zählen");

  // Eine Runde zu Ende gespielt: genau dieses Spiel fällt zu, kein anderes.
  const nachDerRunde = await page.evaluate(() => {
    const e = window.LernappEntitlement;
    e.rundeBeendet("memory");
    return {
      memory: e.gameFree("memory.html"), gespielt: e.gameGespielt("memory.html"), anzahl: e.gespielteRunden("memory.html"),
      andere: e.gameFree("backpack.html") && e.gameFree("kakuro.html"),
      level: e.levelFree({ game: "memory", difficulty: "easy" }),
      reise: e.targetFree("memory.html?station=3"),
    };
  });
  if (nachDerRunde.memory || !nachDerRunde.gespielt) fehlt("nach der Runde ist Memory noch offen");
  if (nachDerRunde.anzahl !== 1) fehlt(`nach einer Runde stehen ${nachDerRunde.anzahl} Runden`);
  if (!nachDerRunde.andere) fehlt("die Runde in Memory sperrt andere Spiele mit");
  if (nachDerRunde.level) fehlt("nach der Runde ist das Level von Memory noch frei");
  if (!nachDerRunde.reise) fehlt("die verbrauchte Runde schliesst die freie Station der Reise");

  // --- Startbild frisch: kein Schloss ---------------------------------------
  // Direkt in einen Bereich, wie nach einem Spiel: ?bereich=gedaechtnis.
  await frischerSpeicher();
  await oeffne("index.html?bereich=gedaechtnis");
  await page.waitForTimeout(800);
  const haeuser = page.locator("[data-page]:not(body)");
  const anzahl = await haeuser.count();
  if (anzahl < 5) fehlt(`im Bereich stehen ${anzahl} Häuser, erwartet mindestens 5`);
  if (await page.locator(".train-building.is-locked").count()) fehlt("frisch trägt schon ein Haus ein Schloss");
  if (await page.locator(".stage-layer .train-lock-badge").count()) fehlt("frisch hängt schon ein Schloss auf der Bühne");

  // --- Startbild mit verbrauchter Runde -------------------------------------
  // Memory ist gespielt, die anderen vier Spiele des Bereichs nicht. Genau ein
  // Haus muss ein Schloss tragen, blass sein und das Tor zeigen.
  await verbrauche({ memory: 1 });
  await oeffne("index.html?bereich=gedaechtnis");
  await page.waitForTimeout(800);
  const memoryHaus = page.locator('[data-building="memory"]');
  if (!(await memoryHaus.count())) fehlt("das Haus von Memory steht nicht auf der Bühne");
  else {
    if (!(await memoryHaus.first().evaluate((n) => n.classList.contains("is-locked")))) fehlt("das gespielte Haus ist nicht als gesperrt gezeichnet");
    if (!(await memoryHaus.first().locator(".train-lock-badge").count())) fehlt("am gespielten Haus fehlt das Schloss");
    const blass = await memoryHaus.first().locator(".train-building-art").evaluate((n) => getComputedStyle(n).filter);
    if (!blass || blass === "none") fehlt("das gespielte Haus wird nicht blass gezeichnet");
    const beschriftung = (await memoryHaus.first().getAttribute("aria-label")) || "";
    if (!/gesperrt/.test(beschriftung)) fehlt(`am gespielten Haus fehlt "gesperrt" in der Beschriftung: "${beschriftung}"`);
  }
  const gesperrteHaeuser = await page.locator(".stage-layer .train-building.is-locked").count();
  if (gesperrteHaeuser !== 1) fehlt(`${gesperrteHaeuser} Häuser tragen ein Schloss, erwartet genau 1`);

  const seiteVorher = page.url();
  await memoryHaus.first().click({ force: true });
  await page.waitForTimeout(700);
  const tor = page.locator(".tor-overlay");
  if (!(await tor.count())) fehlt("das gespielte Haus zeigt kein Tor");
  if (page.url() !== seiteVorher) fehlt(`das gespielte Haus hat die Seite gewechselt: ${page.url()}`);
  if ((await tor.count()) && !/Eltern/.test((await tor.textContent()) || "")) fehlt("im Tor fehlt der Satz für das Kind");
  // Zurück schliesst.
  await tor.locator(".tor-zurueck").click();
  await page.waitForTimeout(300);
  if (await tor.count()) fehlt("Zurück schliesst das Tor nicht");
  // Und die Bühne lebt noch: noch einmal tippen → Tor noch einmal.
  await memoryHaus.first().click({ force: true });
  await page.waitForTimeout(700);
  if (!(await tor.count())) fehlt("nach dem Schliessen kommt das Tor kein zweites Mal – die Bühne ist gesperrt geblieben");

  // --- Der Zug: ein Schloss erst, wenn das Spiel verbraucht ist -------------
  // Alle fünf Spiele des Gedächtnis-Bereichs verbraucht, von der Konzentration
  // nur eines. Dann trägt genau ein Tor ein Schloss.
  await tor.locator(".tor-zurueck").click();
  await page.waitForTimeout(300);
  // Seit der grüne Knopf gleich ins Abenteuer fährt, ist der Zug das Menü:
  // Ein Tipp auf einen Wagen zeigt die fünf Spiele seines Bereichs, jedes als
  // Kiste – und eine verbrauchte Kiste trägt ein Schloss.
  await verbrauche({ backpack: 1, memory: 1, beachTreasure: 1, tileMemory: 1, missingItem: 1, flanker: 1 });
  await oeffne("index.html");
  // Der Zug fährt erst herein, wenn die Seite eine Berührung gesehen hat.
  await page.evaluate(() => document.dispatchEvent(new Event("pointerdown")));
  await page.waitForTimeout(2400);
  const tippeWagen = async (id) => {
    await page.evaluate((bereich) => document.querySelector(`[data-area="${bereich}"]`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })), id);
    await page.waitForTimeout(800);
  };
  await tippeWagen("gedaechtnis");
  if (await page.evaluate(() => document.querySelector("#train-stage")?.dataset.view) !== "wagon") fehlt("ein Tipp auf den Wagen öffnet seinen Bereich nicht");
  const kisten = await page.locator(".wagon-crate").count();
  if (kisten !== 5) fehlt(`der Wagen zeigt ${kisten} Spiele, erwartet 5`);
  const kistenZu = await page.locator(".wagon-crate.is-locked").count();
  if (kistenZu !== 5) fehlt(`${kistenZu} Spiele tragen ein Schloss, erwartet 5 (der ganze Bereich ist verbraucht)`);
  const beschriftung = (await page.locator(".wagon-crate").first().getAttribute("aria-label")) || "";
  if (!/Gesperrt/.test(beschriftung)) fehlt(`am verbrauchten Spiel fehlt "Gesperrt" in der Beschriftung: "${beschriftung}"`);
  // Der halb verbrauchte Bereich: dort wartet noch etwas.
  await page.locator(".stage-back").click();
  await page.waitForTimeout(800);
  await tippeWagen("konzentration");
  const kistenZuHalb = await page.locator(".wagon-crate.is-locked").count();
  if (kistenZuHalb !== 1) fehlt(`im halb verbrauchten Bereich tragen ${kistenZuHalb} Spiele ein Schloss, erwartet 1`);
  await page.locator(".stage-back").click();
  await page.waitForTimeout(600);

  // --- Zurück zum Tor über ein gesperrtes Haus ------------------------------
  await oeffne("index.html?bereich=gedaechtnis");
  await page.waitForTimeout(900);
  await page.locator('[data-building="memory"]').first().click({ force: true });
  await page.waitForTimeout(700);
  if (!(await tor.count())) fehlt("das gesperrte Haus zeigt kein Tor mehr");

  // --- Das Rechenrätsel ---------------------------------------------------------
  await tor.locator(".tor-eltern").click();
  await page.waitForTimeout(200);
  const gate = tor.locator(".tor-gate");
  if (!(await gate.count())) fehlt("'Für Eltern' zeigt kein Rätsel");
  const aufgabe = (await gate.locator(".tor-gate-text").textContent()) || "";
  const m = aufgabe.match(/(\d+)\s*\+\s*(\d+)/);
  if (!m) fehlt(`das Rätsel ist keine Addition: "${aufgabe}"`);
  // Dreimal falsch → zurück zum Tor.
  for (let i = 0; i < 3; i += 1) { await gate.locator("input").fill("1"); await gate.locator("button[type=submit]").click(); await page.waitForTimeout(150); }
  if (await tor.locator(".tor-gate").count()) fehlt("nach drei falschen Antworten steht das Rätsel noch");
  if (!(await tor.locator(".tor-eltern").isVisible())) fehlt("nach drei falschen Antworten fehlt der Eltern-Knopf");
  // Richtig → der Verkaufsbildschirm: erst der Preis, dann die Anmeldung. Wer
  // hier steht, hat gerechnet wie ein Erwachsener und will wissen, was das
  // kostet – ein Anmeldeformular allein wäre eine Frage ohne Angebot.
  await tor.locator(".tor-eltern").click();
  await page.waitForTimeout(200);
  const text2 = (await tor.locator(".tor-gate-text").textContent()) || "";
  const m2 = text2.match(/(\d+)\s*\+\s*(\d+)/);
  if (m2) {
    await tor.locator(".tor-gate input").fill(String(Number(m2[1]) + Number(m2[2])));
    await tor.locator(".tor-gate button[type=submit]").click();
    await page.waitForTimeout(400);
    if (await tor.count()) fehlt("nach der richtigen Antwort steht das Tor noch");
    const kauf = page.locator(".account-modal:not(.hidden) .kauf-seite");
    if (!(await kauf.count())) fehlt("nach der richtigen Antwort kommt nicht der Verkaufsbildschirm");
    else {
      const text = (await kauf.textContent()) || "";
      if (!/CHF 30/.test(text)) fehlt("im Verkaufsbildschirm fehlt der Preis");
      if (!/Familie/.test(text)) fehlt("im Verkaufsbildschirm steht nicht, dass der Kauf für die Familie gilt");
      if (!(await kauf.locator(".kauf-vorteile li").count())) fehlt("im Verkaufsbildschirm fehlt, was dazugehört");
      // Darunter die Anmeldung – nur für Eltern, und sie führt an die Kasse.
      if (await kauf.locator(".auth-tabs").count()) fehlt("der Verkaufsbildschirm zeigt die Reiter Kind/Eltern");
      if (!(await kauf.locator('[data-kauf-form] input[name="email"]').count())) fehlt("im Verkaufsbildschirm fehlt das Feld für die Eltern-Adresse");
      if (await kauf.locator('input[name="loginName"]').count()) fehlt("der Verkaufsbildschirm fragt nach einem Kindernamen");
      const knopf = (await kauf.locator('[data-kauf-form] button[type="submit"]').textContent()) || "";
      if (!/bezahlen/i.test(knopf)) fehlt(`der Hauptknopf führt nicht zur Zahlung: "${knopf}"`);
      // Das Fenster lässt sich wieder schliessen, ohne dass das Kind hängen bleibt.
      await page.locator(".account-close").click();
      await page.waitForTimeout(200);
      if (await page.locator(".account-modal:not(.hidden)").count()) fehlt("der Verkaufsbildschirm lässt sich nicht schliessen");
    }
  }

  // --- Direktaufruf ----------------------------------------------------------------
  // Nur Memory ist verbraucht: backpack muss wieder offen sein.
  if (await page.locator(".tor-overlay").count()) await page.locator(".tor-zurueck").click();
  await verbrauche({ memory: 1 });
  await oeffne("backpack.html");
  await page.waitForTimeout(600);
  if (await page.locator(".tor-overlay").count()) fehlt("backpack.html zeigt das Tor, obwohl die Runde noch offen ist");
  await oeffne("memory.html");
  await page.waitForTimeout(600);
  if (!(await page.locator(".tor-overlay").count())) fehlt("memory.html zeigt kein Tor, obwohl die Runde verbraucht ist");
  await page.locator(".tor-zurueck").click();
  await page.waitForTimeout(800);
  if (!/index\.html/.test(page.url())) fehlt(`Zurück vom Tor auf memory.html führt nicht zum Zug: ${page.url()}`);
  // Auf der Reise öffnet dasselbe Spiel trotzdem: Dort zählt die Station.
  await oeffne("memory.html?station=3");
  await page.waitForTimeout(600);
  if (await page.locator(".tor-overlay").count()) fehlt("memory.html auf einer freien Station zeigt das Tor");

  // --- Levelwahl -------------------------------------------------------------------
  // Frisch: die Schranke sperrt keine Welt. Wiese ist offen, weil sie immer
  // der Anfang ist; Wald ist zu, weil dort erst die Wiese gelöst sein muss –
  // das ist der gewohnte Aufbau des Spiels, nicht die Schranke. Sichtbar wird
  // der Unterschied am Knopf: Was nur der Aufbau sperrt, ist stumm; was die
  // Schranke sperrt, ist tippbar und zeigt das Tor.
  await oeffne("buchstaben.html");
  await page.waitForTimeout(800);
  const karten = page.locator(".difficulty-card");
  if ((await karten.count()) < 2) fehlt("buchstaben.html zeigt keine Stufen");
  else {
    if (await karten.nth(0).isDisabled()) fehlt("Wiese ist gesperrt, obwohl die Runde noch offen ist");
    if (!(await karten.nth(1).isDisabled())) fehlt("Wald ist tippbar, obwohl nur der Aufbau ihn sperrt – das Tor gehört nicht hierher");
  }
  // Runde verbraucht: alle Stufen zu, und jede zeigt das Tor.
  await verbrauche({ memory: 1, letterPuzzle: 1 });
  await oeffne("buchstaben.html");
  await page.waitForTimeout(800);
  const karten2 = page.locator(".difficulty-card");
  if ((await karten2.count()) < 2) fehlt("buchstaben.html zeigt nach der Runde keine Stufen");
  else {
    const wiese = karten2.nth(0);
    if (!(await wiese.evaluate((n) => n.classList.contains("locked")))) fehlt("nach der Runde ist Wiese nicht als zu markiert");
    if (await wiese.isDisabled()) fehlt("nach der Runde ist Wiese stumm gesperrt statt tippbar mit Tor");
    await wiese.click();
    await page.waitForTimeout(400);
    if (!(await page.locator(".tor-overlay").count())) fehlt("Tipp auf die gesperrte Wiese zeigt kein Tor");
  }

  if (fehler.length) fehlt(`JavaScript-Fehler: ${fehler.slice(0, 3).join(" | ")}`);
  await context.close();

  // --- Mit Konto: Gründer, Familie ohne Kauf, Familie mit Kauf ----------------
  for (const fall of KONTEN) {
    const eigener = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
    eigener.setDefaultTimeout(5000);
    // Das echte SDK liegt auf einem fremden Server; hier zählt der Ersatz.
    await eigener.route("**/*gstatic.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
    await eigener.addInitScript(firebaseErsatz, fall);
    const seite = await eigener.newPage();
    const seitenfehler = [];
    seite.on("pageerror", (e) => seitenfehler.push(e.message));
    // Station 15 liegt auf Karte 2 – die ist nur mit Kauf oder Gründer-Zugang frei.
    await seite.goto(`${BASIS}/memory.html?station=15`, { waitUntil: "domcontentloaded" });
    // Zweimal messen: gleich nach dem Laden (da ist die Anmeldung noch
    // unterwegs) und wenn alles steht.
    await seite.waitForTimeout(400);
    const frueh = await seite.locator(".tor-overlay").count();
    await seite.waitForTimeout(1800);
    const spaet = await seite.locator(".tor-overlay").count();
    const stand = await seite.evaluate(() => ({
      grund: window.LernappEntitlement.reason(),
      frei: window.LernappEntitlement.isFree(),
      geladen: window.LernappEntitlement.isLoaded(),
      station15: window.LernappEntitlement.stationFree(15),
    }));
    if (stand.grund !== fall.grund) fehlt(`${fall.name}: der Grund ist "${stand.grund}", erwartet "${fall.grund}"`);
    if (stand.frei !== !fall.tor) fehlt(`${fall.name}: isFree ist ${stand.frei}`);
    if (!stand.geladen) fehlt(`${fall.name}: der Kontostand steht auch nach zwei Sekunden nicht fest`);
    if (stand.station15 === fall.tor) fehlt(`${fall.name}: Station 15 ist ${stand.station15 ? "frei" : "zu"}`);
    if (Boolean(spaet) !== fall.tor) fehlt(`${fall.name}: nach dem Laden ${spaet ? "steht" : "fehlt"} das Tor`);
    // Der eigentliche Fehler von damals: das Tor im Augenblick der Anmeldung.
    if (Boolean(frueh) !== fall.tor) fehlt(`${fall.name}: während der Anmeldung ${frueh ? "blitzt das Tor auf" : "fehlt das Tor"}`);
    if (seitenfehler.length) fehlt(`${fall.name}: JavaScript-Fehler: ${seitenfehler.slice(0, 2).join(" | ")}`);
    await eigener.close();
  }
} catch (abbruch) {
  fehlt(`Abbruch: ${String(abbruch?.message || abbruch).split("\n")[0]}`);
} finally {
  await browser.close();
  halt();
}

if (befunde.length) {
  console.error("Befunde:");
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log(`Das Tor steht, wo es soll – und nur dort (auch für ${KONTEN.length} angemeldete Konten).`);
