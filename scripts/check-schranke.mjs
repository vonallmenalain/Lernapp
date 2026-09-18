/*
 * Steht das Tor da, wo es soll – und nur dort?
 * ---------------------------------------------------------------------------
 * Ein Gast ohne Konto bekommt den freien Teil: in jedem Bereich das erste
 * Spiel, dort die Stufe Wiese, und die erste Karte der Reise. Alles andere
 * zeigt das Tor – der Zug vor der Schranke – statt zu öffnen. Hinter dem
 * Knopf "Für Eltern" wartet ein Rechenrätsel, und erst die richtige Antwort
 * öffnet das Profilfenster.
 *
 * Geprüft wird im Browser, ohne Firebase (das SDK ist umgeleitet, also gilt
 * "Gast"):
 *   - Startbild: Haus 1 eines Bereichs öffnet, Haus 2 zeigt das Tor
 *   - Tor: Zurück schliesst; "Für Eltern" → Rätsel; falsch dreimal → Tor;
 *     richtig → Profilfenster
 *   - Direktaufruf: backpack.html (Spiel 1) baut die Bühne, memory.html
 *     (Spiel 2) zeigt das Tor mit Rückweg
 *   - Levelwahl: buchstaben.html (Spiel 1) hat Wiese offen, Wald zu mit Tor
 *   - Die Rechnung selbst: Station 10 frei, 11 zu; Spiel 1 frei, 2 zu
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

  // --- Die Rechnung ---------------------------------------------------------
  await oeffne("index.html");
  const rechnung = await page.evaluate(() => {
    const e = window.LernappEntitlement;
    return {
      grund: e.reason(), frei: e.isFree(),
      s1: e.stationFree(1), s10: e.stationFree(10), s11: e.stationFree(11), s130: e.stationFree(130),
      backpack: e.gameFree("backpack.html"), memory: e.gameFree("memory.html"), tiersprung: e.gameFree("tiersprung.html"), kakuro: e.gameFree("kakuro.html"),
      werkstatt: e.gameFree("train-test.html"),
      ziel10: e.targetFree("arukone.html?station=10"), ziel11: e.targetFree("kakuro.html?station=11"), ziel11b: e.targetFree("memory.html?station=11"),
      wiese: e.levelFree({ game: "letterPuzzle", difficulty: "easy" }), wald: e.levelFree({ game: "letterPuzzle", difficulty: "medium" }),
      kakuroWiese: e.levelFree({ game: "kakuro", difficulty: "easy" }),
    };
  });
  if (rechnung.grund !== "gast") fehlt(`ohne Konto ist der Grund ${rechnung.grund}, erwartet gast`);
  if (rechnung.frei) fehlt("ein Gast ist frei");
  if (!rechnung.s1 || !rechnung.s10) fehlt("Station 1 oder 10 ist für den Gast zu");
  if (rechnung.s11 || rechnung.s130) fehlt("Station 11 oder 130 ist für den Gast frei");
  if (!rechnung.backpack || !rechnung.tiersprung) fehlt("das erste Spiel eines Bereichs ist zu");
  if (rechnung.memory || rechnung.kakuro) fehlt("das zweite Spiel eines Bereichs ist frei");
  if (!rechnung.werkstatt) fehlt("eine Seite ohne Bereich (Werkstatt) ist zu");
  if (!rechnung.ziel10) fehlt("Ziel mit Station 10 ist zu");
  if (rechnung.ziel11 || rechnung.ziel11b) fehlt("Ziel mit Station 11 ist frei");
  if (!rechnung.wiese) fehlt("Wiese im ersten Spiel ist zu");
  if (rechnung.wald) fehlt("Wald im ersten Spiel ist frei");
  if (rechnung.kakuroWiese) fehlt("Wiese im zweiten Spiel ist frei – das ganze Spiel müsste zu sein");

  // --- Startbild: Haus 1 öffnet, Haus 2 zeigt das Tor ----------------------------
  // Direkt in einen Bereich, wie nach einem Spiel: ?bereich=gedaechtnis.
  await oeffne("index.html?bereich=gedaechtnis");
  await page.waitForTimeout(800);
  const haeuser = page.locator("[data-page]:not(body)");
  const anzahl = await haeuser.count();
  if (anzahl < 5) fehlt(`im Bereich stehen ${anzahl} Häuser, erwartet mindestens 5`);
  const zweites = haeuser.nth(1);
  const seiteVorher = page.url();
  await zweites.click({ force: true });
  await page.waitForTimeout(700);
  const tor = page.locator(".tor-overlay");
  if (!(await tor.count())) fehlt("Haus 2 zeigt kein Tor");
  if (page.url() !== seiteVorher) fehlt(`Haus 2 hat die Seite gewechselt: ${page.url()}`);
  if ((await tor.count()) && !/Eltern/.test((await tor.textContent()) || "")) fehlt("im Tor fehlt der Satz für das Kind");
  // Zurück schliesst.
  await tor.locator(".tor-zurueck").click();
  await page.waitForTimeout(300);
  if (await tor.count()) fehlt("Zurück schliesst das Tor nicht");
  // Und die Bühne lebt noch: Haus 2 noch einmal → Tor noch einmal.
  await zweites.click({ force: true });
  await page.waitForTimeout(700);
  if (!(await tor.count())) fehlt("nach dem Schliessen kommt das Tor kein zweites Mal – die Bühne ist gesperrt geblieben");

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
  await oeffne("backpack.html");
  await page.waitForTimeout(600);
  if (await page.locator(".tor-overlay").count()) fehlt("backpack.html (Spiel 1) zeigt das Tor");
  await oeffne("memory.html");
  await page.waitForTimeout(600);
  if (!(await page.locator(".tor-overlay").count())) fehlt("memory.html (Spiel 2) zeigt kein Tor");
  await page.locator(".tor-zurueck").click();
  await page.waitForTimeout(800);
  if (!/index\.html/.test(page.url())) fehlt(`Zurück vom Tor auf memory.html führt nicht zum Zug: ${page.url()}`);

  // --- Levelwahl -------------------------------------------------------------------
  await oeffne("buchstaben.html");
  await page.waitForTimeout(800);
  const karten = page.locator(".difficulty-card");
  if ((await karten.count()) < 2) fehlt("buchstaben.html zeigt keine Stufen");
  else {
    const wiese = karten.nth(0);
    const wald = karten.nth(1);
    if (await wiese.isDisabled()) fehlt("Wiese im ersten Spiel ist gesperrt");
    if (!(await wald.evaluate((n) => n.classList.contains("locked")))) fehlt("Wald ist nicht als zu markiert");
    if (await wald.isDisabled()) fehlt("Wald ist stumm gesperrt statt tippbar mit Tor");
    await wald.click();
    await page.waitForTimeout(400);
    if (!(await page.locator(".tor-overlay").count())) fehlt("Tipp auf Wald zeigt kein Tor");
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
