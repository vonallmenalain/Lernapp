/*
 * Steht beim Rucksack jeder Gegenstand im Bild?
 * ---------------------------------------------------------------------------
 * Die Gegenstände stehen nebeneinander in einer Reihe. Wie gross sie sein
 * dürfen, hing lange allein an der Fensterbreite (11vw) – und das ging so
 * lange gut, bis vier Sachen zusammen zwei Pixel breiter waren als das Feld:
 * Dann rutschte die vierte in eine zweite Reihe, und auf einem flachen
 * Handy-Bild (700 × 320) stand diese zweite Reihe unter dem unteren Rand. Ein
 * Gegenstand, den kein Kind sehen und antippen kann – und weil die Sachen
 * jede Runde neu gewürfelt werden, traf es mal den Schal, mal die Geige.
 *
 * Seit die Bildgrösse aus dem Platz gerechnet wird, der einem Gegenstand
 * zusteht (styles.css, --rs-platz), kann das nicht mehr passieren. Diese
 * Prüfung hält es fest, und zwar für jede Stufe: drei Sachen auf leicht, vier
 * auf mittel, sechs auf schwer – die engste Reihe ist die auf schwer, und die
 * spielt kein Kind, solange nur der Standard geprüft wird.
 *
 * Gemessen wird in drei Schritten – aussuchen, merken, packen –, quer und
 * hochkant:
 *   - liegt jeder Gegenstand ganz im Bild?
 *   - liegt keiner unter dem Rucksack, wo ihn kein Finger trifft?
 *   - ist jeder noch gross genug für einen Kinderfinger?
 *
 * Aufruf:  node scripts/check-rucksack.mjs
 * Nötig:   Playwright (npm i -D playwright). Fehlt es, sagt das Skript das und
 *          hört auf. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4193);
const BASIS = `http://127.0.0.1:${PORT}`;

// Quer wie hochkant, vom kleinen Handy bis zum Tablet. Die kurzen Bilder sind
// die strengen: Dort ist unten am wenigsten Luft.
const GERAETE = [
  { name: "handy-klein", width: 640, height: 360 },
  { name: "handy-browser", width: 700, height: 320 },
  { name: "handy-lang", width: 800, height: 360 },
  { name: "iphone", width: 844, height: 390 },
  { name: "pixel", width: 914, height: 412 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "hochkant", width: 390, height: 844 },
  { name: "hochkant-klein", width: 360, height: 640 },
];

// Drei, vier, sechs Sachen zur Wahl – so viele sind es je Stufe.
const STUFEN = ["leicht", "mittel", "schwer"];

// Kleiner darf ein Gegenstand nicht werden: darunter trifft ihn ein
// Kinderfinger nicht mehr zuverlässig.
const MIN_GROESSE = 40;

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich die Lage nicht messen.");
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
      const antwort = await fetch(`${BASIS}/backpack.html`);
      if (antwort.ok) return true;
    } catch { /* noch nicht da */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}

// Im Browser: wo stehen die Gegenstände, und wo steht der Rucksack?
function messen() {
  const kasten = (el) => {
    const r = el.getBoundingClientRect();
    return { l: r.left, o: r.top, re: r.right, u: r.bottom, b: r.width, h: r.height };
  };
  const items = [...document.querySelectorAll(".rs-item")].map((el) => ({
    ...kasten(el),
    name: el.getAttribute("aria-label") || el.textContent.trim(),
  }));
  const sack = document.querySelector(".rs-rucksack");
  return {
    phase: document.querySelector(".rs-stage")?.dataset.rsPhase || "?",
    anzahl: items.length,
    rucksack: sack ? kasten(sack) : null,
    items,
  };
}

const befunde = [];

function pruefeLage(wo, mass, geraet) {
  if (!mass.items.length) {
    befunde.push(`${wo}: kein Gegenstand zu sehen`);
    return;
  }
  mass.items.forEach((item) => {
    const platz = `[${Math.round(item.l)},${Math.round(item.o)}–${Math.round(item.re)},${Math.round(item.u)}]`;
    if (item.u > geraet.height + 1 || item.o < -1 || item.l < -1 || item.re > geraet.width + 1) {
      befunde.push(`${wo}: „${item.name}“ steht nicht im Bild ${platz} von ${geraet.width}×${geraet.height}`);
    }
    if (mass.rucksack) {
      const s = mass.rucksack;
      const quer = Math.min(item.re, s.re) - Math.max(item.l, s.l);
      const hoch = Math.min(item.u, s.u) - Math.max(item.o, s.o);
      if (quer > 1 && hoch > 1) {
        befunde.push(`${wo}: „${item.name}“ liegt unter dem Rucksack (${Math.round(quer)}×${Math.round(hoch)} px)`);
      }
    }
    if (item.b < MIN_GROESSE || item.h < MIN_GROESSE) {
      befunde.push(`${wo}: „${item.name}“ ist nur ${Math.round(item.b)}×${Math.round(item.h)} px – zu klein für einen Kinderfinger`);
    }
  });
}

async function pruefe(browser, geraet, stufe) {
  const page = await browser.newPage({ viewport: { width: geraet.width, height: geraet.height } });
  // Die Stufe steht im Kasten der Reise; ohne Anmeldung ist das der Speicher
  // dieses Geräts.
  await page.addInitScript((wert) => {
    try { localStorage.setItem("lernapp.reise", JSON.stringify({ stufe: wert, stufeAt: Date.now() })); } catch { /* privater Modus */ }
  }, stufe);
  await page.goto(`${BASIS}/backpack.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  const wo = (schritt) => `${geraet.name} (${geraet.width}×${geraet.height}), ${stufe}, ${schritt}`;
  const wahl = await page.evaluate(messen);
  pruefeLage(wo("Aussuchen"), wahl, geraet);

  // Einen aussuchen: er steht kurz allein da, fliegt in den Rucksack, und
  // danach wird gepackt.
  await page.click(".rs-item");
  await page.waitForTimeout(700);
  const merken = await page.evaluate(messen);
  pruefeLage(wo("Merken"), merken, geraet);

  await page.waitForTimeout(2400);
  const packen = await page.evaluate(messen);
  pruefeLage(wo("Packen"), packen, geraet);

  await page.close();

  const reihen = new Set(packen.items.map((item) => Math.round(item.o))).size;
  console.log(`  ${befunde.length ? " " : "ok"}  ${wo("Packen").padEnd(46)} ${String(packen.anzahl).padStart(2)} Stück in ${reihen} Reihe(n)`);
}

if (!(await warteAufServer())) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROMIUM_PFAD || undefined,
  args: ["--no-sandbox"],
});
for (const geraet of GERAETE) {
  for (const stufe of STUFEN) await pruefe(browser, geraet, stufe);
}
await browser.close();
halt();

if (befunde.length) {
  console.error(`\n${befunde.length} Befund(e):`);
  befunde.forEach((zeile) => console.error(`  - ${zeile}`));
  process.exit(1);
}

console.log("\nJeder Gegenstand steht im Bild, neben dem Rucksack und gross genug zum Antippen.");
