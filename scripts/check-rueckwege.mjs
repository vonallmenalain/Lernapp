/*
 * Kein Bildschirm ohne Weg zurück.
 * ---------------------------------------------------------------------------
 * In der installierten App gibt es keine Zurück-Taste des Browsers. Fehlt auf
 * einem Bildschirm der eigene Knopf, sitzt ein Kind fest und kommt nur noch
 * über das Schliessen der App heraus. Genau das war in der Levelwahl der Fall:
 * der Weg zurück stand als Textzeile im Vorspann, und auf der Landschaft fällt
 * der Vorspann weg – samt Textzeile.
 *
 * Ob ein Knopf wirklich zu sehen ist, entscheidet sich erst im Browser: eine
 * Regel weiter unten im Stylesheet kann eine weiter oben aufheben, ein Feld
 * kann hinter einem anderen liegen, ein Panel kann versteckt sein. Deshalb
 * fährt diese Prüfung die Seiten wirklich an und misst, statt im Quelltext zu
 * raten.
 *
 * Aufruf:  node scripts/check-rueckwege.mjs
 * Nötig:   Playwright (npm i -D playwright). Fehlt es, sagt das Skript das und
 *          hört auf, statt mit einem Fehler abzustürzen.
 * Der lokale Server wird selbst gestartet und am Ende wieder beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4179);
const BASIS = `http://127.0.0.1:${PORT}`;

// Die Rätselseiten bauen ihre Bildschirme mit app.js: erst die Stufe, dann die
// Level, dann das Rätsel. Jede dieser Stufen wird einzeln geprüft.
const RAETSEL_SEITEN = [
  "arukone", "bimaru", "buchstaben", "hidoku",
  "kakuro", "raumdetektiv", "shikaku", "wortdetektiv",
];

// Die Spiele bauen ihre Bühne mit game-shell.js und tragen die Leiste mit Haus
// und Pfeil von Anfang an.
const SPIEL_SEITEN = [
  "backpack", "blaetter", "doppelt", "faesser", "fischteich", "freiefahrt", "kacheln",
  "kartenmerker", "memory", "schwarmfokus", "signal", "strandschatz", "tiersprung",
  "turmbau", "wasfehlt", "weichen", "zahlengleis",
];

// Alles, was zurückführt: das Haus auf die Startseite, der Pfeil eine Stufe
// zurück. Neue Knöpfe gehören hier hinein, sonst zählt die Prüfung sie nicht.
const WEGE_ZURUECK = [
  'a[href^="index.html"]',
  "#home-button",
  "#back-button",
  // In dieser Leiste steht nichts anderes als Wege zurück.
  ".selection-actions a",
  ".selection-actions button",
  ".cm-icon-home",
  ".cm-icon-back",
].join(", ");

// Im Browser ausgeführt: welche Wege zurück sind gerade wirklich zu sehen?
// Gezählt wird nur, was gross genug zum Antippen ist und im Bild liegt.
function sichtbareWege(auswahl) {
  return [...document.querySelectorAll(auswahl)]
    .filter((knopf) => {
      const kasten = knopf.getBoundingClientRect();
      const stil = getComputedStyle(knopf);
      return kasten.width >= 24 && kasten.height >= 24
        && stil.display !== "none" && stil.visibility !== "hidden"
        && Number(stil.opacity) > 0.05
        && kasten.bottom > 0 && kasten.top < window.innerHeight
        && kasten.right > 0 && kasten.left < window.innerWidth;
    })
    .map((knopf) => knopf.id ? `#${knopf.id}` : `.${String(knopf.className).split(" ")[0]}`);
}

let playwright;
try {
  playwright = await import("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich Sichtbarkeit nicht messen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], {
  cwd: WURZEL,
  stdio: "ignore",
});
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });

// Warten, bis der Server antwortet – ein fester Wert wäre mal zu kurz und mal
// unnötig lang.
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

if (!await warteAufServer()) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROMIUM_PFAD || undefined,
  args: ["--no-sandbox"],
});
// Ein breites, flaches Fenster: so steht die App auf einem Handy im Querformat,
// und dort ist der Platz am knappsten.
const sitzung = await browser.newContext({
  viewport: { width: 914, height: 411 },
  isMobile: true,
  hasTouch: true,
});

const festgefahren = [];

async function pruefe(seite, blatt, schirm) {
  const wege = await blatt.evaluate(sichtbareWege, WEGE_ZURUECK);
  const inOrdnung = wege.length > 0;
  console.log(`  ${inOrdnung ? "ok  " : "FEST"}  ${`${seite}.html`.padEnd(20)} ${schirm.padEnd(18)} ${wege.join(", ") || "— kein Weg zurück —"}`);
  if (!inOrdnung) festgefahren.push(`${seite}.html · ${schirm}`);
}

console.log("Rätselseiten (Stufe, Level, Rätsel):");
for (const seite of RAETSEL_SEITEN) {
  const blatt = await sitzung.newPage();
  await blatt.goto(`${BASIS}/${seite}.html`, { waitUntil: "load" });
  await blatt.waitForTimeout(1400);
  await pruefe(seite, blatt, "erste Auswahl");

  // Sich Stufe um Stufe hineintippen, solange eine freie Kachel da ist.
  for (const schirm of ["nach 1. Tipp", "im Rätsel"]) {
    const kachel = await blatt.$("#level-grid button:not([disabled])");
    if (!kachel || !(await kachel.isVisible())) break;
    await kachel.click({ timeout: 5000 }).catch(() => {});
    await blatt.waitForTimeout(1200);
    await pruefe(seite, blatt, schirm);
  }
  await blatt.close();
}

console.log("\nSpielseiten:");
for (const seite of SPIEL_SEITEN) {
  const blatt = await sitzung.newPage();
  await blatt.goto(`${BASIS}/${seite}.html`, { waitUntil: "load" });
  await blatt.waitForTimeout(2000);
  await pruefe(seite, blatt, "Einstieg");
  await blatt.close();
}

await browser.close();
halt();

if (festgefahren.length > 0) {
  console.error(`\n${festgefahren.length} Bildschirm(e) ohne Weg zurück:`);
  festgefahren.forEach((eintrag) => console.error(`  - ${eintrag}`));
  process.exit(1);
}
console.log("\nJeder Bildschirm hat einen Weg zurück.");
