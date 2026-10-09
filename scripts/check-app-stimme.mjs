/*
 * Spricht die App überall mit der Google-Stimme?
 * ---------------------------------------------------------------------------
 * Ein Rundgang durch jede Seite mit kids.js: Hilfe-Knopf, dann eine Weile
 * zufällig tippen und ziehen, wie ein Kind, das alles ausprobiert. Gemeldet
 * wird jeder Satz, den die Seite dabei mit der Gerätestimme sagt statt als
 * Aufnahme (app-stimme.js, bau-stimme.js, lesen-stimme.js) – und wo.
 *
 *   node scripts/check-app-stimme.mjs [--seiten memory,silbenzug] [--sekunden 25] [--aus datei.json] [--liste]
 *
 * Mit --liste gilt jeder Satz als aufgenommen, der in der Liste steht
 * (scripts/stimme-app-texte.mjs) – so zeigt der Rundgang schon vor dem
 * Vertonen, welche Sätze in der Liste fehlen.
 *
 * Zufällig heisst: Nicht jeder Satz kommt in jedem Lauf vor. Ein Satz, der
 * hier auftaucht, gehört in scripts/stimme-app-texte.mjs (oder eine Regel in
 * scripts/stimme-app/) – oder er lässt sich nicht vorher aufnehmen (der Name,
 * den das Kind tippt); dann steht er dort unter NICHT. Danach:
 *   node scripts/stimme-google.mjs vertonen --bereich app
 * Die Bauecke hat ihren eigenen, gründlicheren Rundgang:
 * scripts/check-bau-stimme.mjs.
 */
import fs from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import { appTexte } from "./stimme-app-texte.mjs";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4203);
const BASIS = `http://127.0.0.1:${PORT}`;
const argument = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const SEKUNDEN = Number(argument("sekunden", 25));
const GLEICHZEITIG = Number(argument("gleichzeitig", 4));
const NUR_LISTE = process.argv.includes("--liste");
const listenVerzeichnis = NUR_LISTE
  ? `window.LernappStimmeDateien = Object.assign(window.LernappStimmeDateien || {}, ${JSON.stringify(Object.fromEntries((await appTexte()).map((t) => [t.text, "stimme/google/liste.mp3"])))});`
  : null;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich die App nicht prüfen."); process.exit(2); }

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });
async function warteAufServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht */ } await new Promise((w) => setTimeout(w, 100)); }
  return false;
}

// Sprachausgabe und Aufnahmen, die gleich fertig sind. Was mit der
// Gerätestimme zu Ende gesprochen wird, meldet __geraetSagt.
function stimmeErsatz() {
  HTMLMediaElement.prototype.play = function play() {
    const quelle = String(this.src);
    const lauf = (this.__lauf = (this.__lauf || 0) + 1);
    setTimeout(() => {
      if (this.__lauf !== lauf || String(this.src) !== quelle) return;
      this.dispatchEvent(new Event("ended"));
    }, 3);
    return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function pause() { this.__lauf = (this.__lauf || 0) + 1; };
  let abbruch = 0;
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [],
    speak(aeusserung) {
      const meins = abbruch;
      setTimeout(() => {
        if (meins !== abbruch) return;
        window.__geraetSagt?.(String(aeusserung.text), location.pathname + location.search);
        aeusserung.dispatchEvent(new Event("end"));
      }, 3);
    },
    cancel() { abbruch += 1; }, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  try { localStorage.setItem("lernapp.tts", "1"); } catch { /* egal */ }
  // Die Schranke offen, wie nach dem Kauf: Sonst endet jedes Spiel nach
  // einer Runde vor dem Tor (das prüft check-schranke.mjs).
  const frei = {
    STATIONS_FREE: 10, GRATIS_RUNDEN: 1, AREAS: [],
    reason: () => "gekauft", isFree: () => true, isLoaded: () => true, whenReady: () => Promise.resolve(true),
    stationFree: () => true, gameFree: () => true, levelFree: () => true, targetFree: () => true, buchFree: () => true,
    gameEntry: () => null, gameGespielt: () => false, gespielteRunden: () => 0, rundeBeendet() {}, showGate: () => () => {}, closeGate() {}, onChange: () => () => {},
  };
  Object.defineProperty(window, "LernappEntitlement", { get: () => frei, set() {}, configurable: true });
}

// Ein zufälliger Schritt: meist ein Tipp auf etwas Antippbares, manchmal ein
// Ziehen von einem zum anderen. Links auf andere Seiten bleiben aus.
async function schritt(page) {
  const ziele = await page.evaluate(() => {
    const sichtbar = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return null;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.pointerEvents === "none" || Number(s.opacity) === 0) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const alle = [...document.querySelectorAll('button, [role="button"], [tabindex="0"], svg [data-id], .is-antippbar, [draggable="true"], a[href^="#"]')];
    return alle.filter((el) => !el.disabled && !el.closest("a[href]:not([href^='#'])") && !/zurück|startseite|abmelden|konto/i.test(el.getAttribute("aria-label") || el.textContent || ""))
      .map((el) => sichtbar(el)).filter(Boolean);
  });
  if (!ziele.length) return;
  const a = ziele[Math.floor(Math.random() * ziele.length)];
  if (Math.random() < 0.2 && ziele.length > 1) {
    const b = ziele[Math.floor(Math.random() * ziele.length)];
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    for (let i = 1; i <= 6; i += 1) await page.mouse.move(a.x + ((b.x - a.x) * i) / 6, a.y + ((b.y - a.y) * i) / 6);
    await page.mouse.up();
  } else {
    await page.mouse.click(a.x, a.y);
  }
}

const geraet = new Map();   // Satz → Set der Seiten
const fehler = [];

async function rundgang(browser, seite) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  await context.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await context.exposeBinding("__geraetSagt", (_quelle, text, wo) => {
    if (!geraet.has(text)) geraet.set(text, new Set());
    geraet.get(text).add(wo || seite);
  });
  await context.addInitScript(stimmeErsatz);
  if (listenVerzeichnis) await context.route("**/app-stimme.js*", (route) => route.fulfill({ contentType: "text/javascript; charset=utf-8", body: listenVerzeichnis }));
  const page = await context.newPage();
  page.on("pageerror", (e) => fehler.push(`${seite}: ${e.message}`));
  page.on("dialog", (d) => d.dismiss().catch(() => {}));
  const start = `${BASIS}/${seite}`;
  try {
    await page.goto(start, { waitUntil: "load" });
    await page.waitForTimeout(800);
    await page.locator(".help-voice-button").click({ timeout: 1500 }).catch(() => {});
    await page.waitForTimeout(300);
    const ende = Date.now() + SEKUNDEN * 1000;
    while (Date.now() < ende) {
      if (!page.url().startsWith(start.split("?")[0])) await page.goto(start, { waitUntil: "load" }).catch(() => {});
      await schritt(page).catch(() => {});
      await page.waitForTimeout(120 + Math.random() * 250);
      if (Math.random() < 0.08) await page.locator(".help-voice-button").click({ timeout: 500 }).catch(() => {});
    }
  } catch (e) {
    fehler.push(`${seite}: ${e.message.split("\n")[0]}`);
  }
  await context.close();
}

if (!(await warteAufServer())) { console.error("Der lokale Server startet nicht."); process.exit(2); }
const browser = await playwright.chromium.launch();
const gewaehlt = argument("seiten");
const seiten = gewaehlt
  ? gewaehlt.split(",").map((s) => (s.endsWith(".html") ? s : `${s}.html`))
  : fs.readdirSync(WURZEL).filter((f) => f.endsWith(".html") && f !== "admin.html" && fs.readFileSync(path.join(WURZEL, f), "utf8").includes("kids.js")).sort();
const warteschlange = [...seiten];
await Promise.all(Array.from({ length: GLEICHZEITIG }, async () => {
  while (warteschlange.length) await rundgang(browser, warteschlange.shift());
}));
await browser.close();

const liste = [...geraet].map(([text, wo]) => ({ text, wo: [...wo].sort() })).sort((a, b) => a.wo[0].localeCompare(b.wo[0]) || a.text.localeCompare(b.text));
const aus = argument("aus");
if (aus) fs.writeFileSync(aus, `${JSON.stringify(liste, null, 2)}\n`);
console.log(`Rundgang durch ${seiten.length} Seiten, je ${SEKUNDEN} Sekunden.`);
if (fehler.length) console.log(`\nFehler im Browser (${fehler.length}):\n  ${[...new Set(fehler)].slice(0, 20).join("\n  ")}`);
if (!liste.length) {
  console.log("Die App spricht überall mit der Google-Stimme.");
} else {
  console.log(`\nMit der Gerätestimme (${liste.length}):`);
  liste.forEach((e) => console.log(`  ${e.wo.join(", ")}: ${e.text}`));
}
server.kill();
process.exit(0);
