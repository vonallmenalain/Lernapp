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
 *   - Tor: Zurück schliesst; "Für Eltern" → Rätsel; falsch dreimal → Tor;
 *     richtig → Profilfenster
 *   - Direktaufruf: memory.html frisch baut die Bühne, memory.html mit
 *     verbrauchter Runde zeigt das Tor mit Rückweg
 *   - Levelwahl: buchstaben.html frisch hat alle Stufen offen, mit
 *     verbrauchter Runde alle zu und mit Tor
 *   - Die Rechnung selbst: Station 10 frei, 11 zu; jedes Spiel frei, bis es
 *     gespielt ist, und dann nur dieses zu
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

  // --- Die Tore: ein Schloss erst, wenn dahinter alles zu ist ---------------
  // Alle fünf Spiele des Gedächtnis-Bereichs verbraucht, von der Konzentration
  // nur eines. Dann trägt genau ein Tor ein Schloss.
  await tor.locator(".tor-zurueck").click();
  await page.waitForTimeout(300);
  await verbrauche({ backpack: 1, memory: 1, beachTreasure: 1, tileMemory: 1, missingItem: 1, flanker: 1 });
  await oeffne("index.html");
  await page.waitForTimeout(1200);
  await page.locator(".train-start").click();
  await page.waitForTimeout(2600);
  const toreAlle = await page.locator("[data-gate]").count();
  if (toreAlle !== 5) fehlt(`nach dem Abfahren stehen ${toreAlle} Tore, erwartet 5`);
  const toreZu = await page.locator(".train-gate.is-locked").count();
  if (toreZu !== 1) fehlt(`${toreZu} Tore tragen ein Schloss, erwartet genau 1 (nur Gedächtnis ist ganz verbraucht)`);
  const gedaechtnisTor = page.locator('[data-gate="gedaechtnis"]');
  if (!(await gedaechtnisTor.count())) fehlt("das Tor des Gedächtnis-Bereichs steht nicht auf der Bühne");
  else {
    if (!(await gedaechtnisTor.first().locator(".train-lock-badge").count())) fehlt("am ganz verbrauchten Tor fehlt das Schloss");
    const blassesTor = await gedaechtnisTor.first().locator(".train-gate-art").evaluate((n) => getComputedStyle(n).filter);
    if (!blassesTor || blassesTor === "none") fehlt("das ganz verbrauchte Tor wird nicht blass gezeichnet");
    const beschriftung = (await gedaechtnisTor.first().getAttribute("aria-label")) || "";
    if (!/gesperrt/.test(beschriftung)) fehlt(`am verbrauchten Tor fehlt "gesperrt" in der Beschriftung: "${beschriftung}"`);
  }
  // Das halb verbrauchte Tor bleibt offen: dort wartet noch ein Spiel.
  const konzentrationTor = page.locator('[data-gate="konzentration"]');
  if ((await konzentrationTor.count()) && (await konzentrationTor.first().evaluate((n) => n.classList.contains("is-locked")))) {
    fehlt("ein Tor mit noch offenen Spielen trägt ein Schloss");
  }

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
  // Richtig → Profilfenster.
  await tor.locator(".tor-eltern").click();
  await page.waitForTimeout(200);
  const text2 = (await tor.locator(".tor-gate-text").textContent()) || "";
  const m2 = text2.match(/(\d+)\s*\+\s*(\d+)/);
  if (m2) {
    await tor.locator(".tor-gate input").fill(String(Number(m2[1]) + Number(m2[2])));
    await tor.locator(".tor-gate button[type=submit]").click();
    await page.waitForTimeout(400);
    if (await tor.count()) fehlt("nach der richtigen Antwort steht das Tor noch");
    if (!(await page.locator(".account-modal:not(.hidden) .auth-tabs").count())) fehlt("nach der richtigen Antwort ist das Profilfenster nicht offen");
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
console.log("Das Tor steht, wo es soll – und nur dort.");
