/*
 * Steht der Startknopf immer vor der Lok?
 * ---------------------------------------------------------------------------
 * Das Startsignal schwebt in dem Stück Gleis, das hinter der Lok noch
 * weiterläuft. Wie breit dieses Stück auf dem Bildschirm ist, hängt an der
 * Fensterbreite – und wurde der Knopf nur an den rechten Rand geklemmt, schob
 * ihn diese Klemme auf einem schmalen Bild rückwärts auf die Lok. Dort ist er
 * nicht nur schlecht zu sehen: ein Tipp auf die Lok öffnet die Werkstatt, und
 * wer losfahren wollte, landete beim Umbauen.
 *
 * Schmal wird es nicht nur in einem kleinen Fenster. Wer am Handy die Anzeige
 * vergrössert, bekommt weniger CSS-Pixel, als das Gerät Punkte hat – dasselbe
 * Bild, nur enger. Deshalb misst diese Prüfung bis hinunter zu Breiten, die
 * kein Handy von sich aus hat.
 *
 * Gemessen wird auf dem Startbild:
 *   - liegt der Knopf ganz rechts der Lok?
 *   - liegt er ganz im Bild?
 *   - ist er noch gross genug für einen Kinderfinger?
 *
 * Aufruf:  node scripts/check-startknopf.mjs
 * Nötig:   Playwright (npm i -D playwright). Fehlt es, sagt das Skript das und
 *          hört auf. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4182);
const BASIS = `http://127.0.0.1:${PORT}`;

// Von einem kleinen Handy quer bis zum Tablet – und darunter die Breiten, die
// erst durch eine vergrösserte Anzeige entstehen.
const BREITEN = [
  { name: "sehr eng", width: 380, height: 300 },
  { name: "eng", width: 460, height: 300 },
  { name: "vergroessert", width: 560, height: 340 },
  { name: "handy-klein", width: 640, height: 360 },
  { name: "handy-browser", width: 700, height: 320 },
  { name: "iphone", width: 844, height: 390 },
  { name: "pixel", width: 914, height: 412 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
];

// Kleiner darf der Knopf nicht werden: darunter trifft ihn ein Kinderfinger
// nicht mehr zuverlässig.
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
      const antwort = await fetch(`${BASIS}/index.html`);
      if (antwort.ok) return true;
    } catch { /* noch nicht da */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}

// Im Browser: die Kästen von Lok und Knopf, gemessen im Koordinatensystem der
// Bühne.
function messen() {
  const stage = document.querySelector("#train-stage");
  const loco = document.querySelector("[data-loco]");
  const knopf = document.querySelector(".train-start");
  if (!stage || !loco || !knopf) return null;
  const host = stage.getBoundingClientRect();
  const l = loco.getBoundingClientRect();
  const k = knopf.getBoundingClientRect();
  return {
    breite: host.width,
    lokRechts: l.right - host.left,
    links: k.left - host.left,
    rechts: k.right - host.left,
    oben: k.top - host.top,
    unten: k.bottom - host.top,
    hoehe: host.height,
    gesetzt: knopf.dataset.placed === "1",
    sichtbar: !knopf.hidden && Number(getComputedStyle(knopf).opacity) > 0.05,
  };
}

const befunde = [];

async function pruefe(browser, geraet) {
  const page = await browser.newPage({ viewport: { width: geraet.width, height: geraet.height } });
  await page.goto(`${BASIS}/index.html`, { waitUntil: "networkidle" });
  // Der Zug wartet auf die erste Berührung, bevor er hereinfährt. Ohne sie
  // stünde er ausserhalb des Bilds, und gemessen wäre nichts.
  await page.mouse.click(4, 4);
  await page.waitForTimeout(3000);

  const mass = await page.evaluate(messen);
  await page.close();

  const wo = `${geraet.name} (${geraet.width}×${geraet.height})`;
  if (!mass) { befunde.push(`${wo}: Lok oder Startknopf nicht gefunden`); return; }
  if (!mass.gesetzt || !mass.sichtbar) { befunde.push(`${wo}: Startknopf steht nicht auf der Bühne`); return; }

  const groesse = Math.round(mass.rechts - mass.links);
  if (mass.links < mass.lokRechts) {
    befunde.push(`${wo}: Startknopf liegt auf der Lok (Knopf ab ${Math.round(mass.links)}, Lok bis ${Math.round(mass.lokRechts)})`);
  }
  if (mass.rechts > mass.breite + 1 || mass.links < 0) {
    befunde.push(`${wo}: Startknopf ragt aus dem Bild (${Math.round(mass.links)}–${Math.round(mass.rechts)} von ${Math.round(mass.breite)})`);
  }
  if (mass.oben < 0 || mass.unten > mass.hoehe + 1) {
    befunde.push(`${wo}: Startknopf ragt oben oder unten heraus (${Math.round(mass.oben)}–${Math.round(mass.unten)} von ${Math.round(mass.hoehe)})`);
  }
  if (groesse < MIN_GROESSE) {
    befunde.push(`${wo}: Startknopf nur ${groesse} px – zu klein für einen Kinderfinger`);
  }

  const luft = Math.round(mass.links - mass.lokRechts);
  console.log(`  ${befunde.length ? " " : "ok"}  ${wo.padEnd(28)} Knopf ${String(groesse).padStart(3)} px, ${String(luft).padStart(3)} px vor der Lok`);
}

if (!(await warteAufServer())) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

const browser = await playwright.chromium.launch();
for (const geraet of BREITEN) await pruefe(browser, geraet);
await browser.close();
halt();

if (befunde.length) {
  console.error(`\n${befunde.length} Befund(e):`);
  befunde.forEach((zeile) => console.error(`  - ${zeile}`));
  process.exit(1);
}

console.log("\nDer Startknopf steht auf jeder Breite vor der Lok und ganz im Bild.");
