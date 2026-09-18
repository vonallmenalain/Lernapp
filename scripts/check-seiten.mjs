/*
 * Die Seiten für Erwachsene: Willkommen, Impressum, Datenschutz, AGB.
 * ---------------------------------------------------------------------------
 * Vier Seiten ohne Skript und ohne Firebase – und trotzdem die, auf die es
 * rechtlich ankommt. Diese Prüfung hält zweierlei fest:
 *
 *   1. Der Inhalt: kein Platzhalter mehr, kein Entwurfs-Hinweis, die
 *      Kontaktadresse steht da, und Impressum, Datenschutz und AGB verweisen
 *      aufeinander. Ein Platzhalter, der live geht, ist peinlicher als ein
 *      Tippfehler – und niemand liest diese Seiten freiwillig nach.
 *   2. Die Darstellung von 280 bis 1280 px: nichts steht über den Rand (dann
 *      liesse sich die Seite seitwärts schieben), und keine Überschrift bricht
 *      mitten im Wort um. "Geschäftsbedingun|gen" sieht nach kaputt aus.
 *   3. Die Blöcke der Willkommensseite stehen auf einer Achse. Eine
 *      margin-Kurzform hat dort einmal die Zentrierung von .wrap überschrieben,
 *      und die drei Kacheln klebten am linken Rand, während der Rest mittig
 *      stand. Von blossem Lesen fällt so etwas nicht auf, von Messen schon.
 *
 * Aufruf:  node scripts/check-seiten.mjs
 *          BILDER=/ein/ordner node scripts/check-seiten.mjs   legt Bilder ab
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4189);
const BASIS = `http://127.0.0.1:${PORT}`;
const BILDER = process.env.BILDER || "";
const SEITEN = ["willkommen", "impressum", "datenschutz", "agb"];
// Von der Faltschachtel bis zum Bildschirm. 280 px ist das aufgeklappte
// Falthandy, 320 das kleinste iPhone, 1280 ein Laptop.
const BREITEN = [280, 320, 360, 390, 430, 460, 600, 900, 1280];
const KONTAKT = "kontakt@alae.app";

const befunde = [];
const fehlt = (was) => befunde.push(was);

// --- 1. Der Inhalt, ohne Browser ---------------------------------------------
const lies = (name) => fs.readFileSync(path.join(WURZEL, `${name}.html`), "utf8");

for (const name of SEITEN) {
  const html = lies(name);
  if (/class="platzhalter"|\[Datum\]|\[Vorname|\[PLZ|\[kontakt|PLATZHALTER/.test(html)) fehlt(`${name}.html: noch ein Platzhalter drin`);
  if (/class="entwurf"/.test(html)) fehlt(`${name}.html: der Entwurfs-Hinweis steht noch da`);
  if (/adresse\.ch/.test(html) && !/deine@adresse\.ch/.test(html)) fehlt(`${name}.html: die Beispiel-Adresse adresse.ch steht noch drin`);
  // Zugesagt wird keine Rückgabe mehr: Der Kauf ist verbindlich (agb.html,
  // Abschnitt 4). Gesucht wird die Zusage, nicht das Wort – "eine Rückgabe ist
  // ausgeschlossen" soll ja gerade dastehen.
  if (/Geld zurück|erstatten wir|Betrag zurück|30 Tagen?[^.]*(zurück|erstatt)/i.test(html)) fehlt(`${name}.html: ein Rückgabeversprechen steht noch da`);
}
// Und die AGB sagen, was stattdessen gilt.
{
  const agb = lies("agb");
  if (!/Rückgabe oder Rückerstattung ist ausgeschlossen/.test(agb)) fehlt("agb.html: der Ausschluss der Rückgabe fehlt");
  if (!/Widerrufsrecht erlischt/.test(agb)) fehlt("agb.html: der Hinweis auf das erlöschende Widerrufsrecht fehlt");
}
// Das Alter steht an drei Stellen und muss überall dasselbe sagen.
{
  const html = lies("willkommen");
  if (/4 bis 8/.test(html)) fehlt("willkommen.html: irgendwo stehen noch 4 bis 8 Jahre");
  if ((html.match(/3 bis 10/g) || []).length < 3) fehlt("willkommen.html: das Alter 3 bis 10 fehlt in Titel, Vorspann oder Fragen");
}
for (const name of ["impressum", "datenschutz", "agb"]) {
  const html = lies(name);
  if (!html.includes(KONTAKT)) fehlt(`${name}.html: die Kontaktadresse ${KONTAKT} fehlt`);
  if (!/Alain von Allmen/.test(html)) fehlt(`${name}.html: der Name des Anbieters fehlt`);
}
for (const [name, muss] of [["impressum", ["datenschutz.html", "agb.html"]], ["datenschutz", ["impressum.html", "agb.html"]], ["agb", ["impressum.html", "datenschutz.html"]]]) {
  const html = lies(name);
  muss.forEach((ziel) => { if (!html.includes(`href="${ziel}"`)) fehlt(`${name}.html verlinkt ${ziel} nicht`); });
}
// Und die App führt zu ihnen: sonst findet sie niemand.
const app = fs.readFileSync(path.join(WURZEL, "firebase.js"), "utf8");
["willkommen.html", "impressum.html", "datenschutz.html", "agb.html"].forEach((ziel) => {
  if (!app.includes(`href="${ziel}"`)) fehlt(`firebase.js: die Anmeldung verlinkt ${ziel} nicht`);
});

// --- 2. Die Darstellung, im Browser -------------------------------------------
let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich die Darstellung nicht messen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  console.error("Oder eine vorhandene Installation über NODE_PATH bekannt machen.");
  process.exit(2);
}

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });

async function warteAufServer() {
  for (let versuch = 0; versuch < 50; versuch += 1) {
    try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht da */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}
if (!(await warteAufServer())) { console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`); process.exit(2); }

// Läuft im Browser: Was steht über den Rand, und welches Wort ist mittendrin
// umgebrochen? Ein Wort, das über mehrere Zeilen geht, hat mehr als ein
// Rechteck – das ist der ganze Trick.
function messen() {
  const breite = window.innerWidth;
  const raus = [];
  document.querySelectorAll("body, body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > breite + 1) raus.push(`${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(" ")[0]}` : ""}`);
  });
  const range = document.createRange();
  const zerrissen = [];
  document.querySelectorAll("h1, h2, h3").forEach((el) => {
    el.childNodes.forEach((knoten) => {
      if (knoten.nodeType !== 3) return;
      for (const wort of knoten.textContent.matchAll(/\S+/g)) {
        range.setStart(knoten, wort.index);
        range.setEnd(knoten, wort.index + wort[0].length);
        if (range.getClientRects().length > 1) zerrissen.push(wort[0]);
      }
    });
  });
  return { scroll: document.documentElement.scrollWidth, breite, raus: [...new Set(raus)].slice(0, 3), zerrissen: [...new Set(zerrissen)].slice(0, 3) };
}

const browser = await playwright.chromium.launch({ args: ["--no-sandbox"] });
try {
  for (const breite of BREITEN) {
    const context = await browser.newContext({ viewport: { width: breite, height: 800 }, serviceWorkers: "block", reducedMotion: "reduce" });
    const page = await context.newPage();
    const fehler = [];
    page.on("pageerror", (e) => fehler.push(e.message));
    page.on("response", (r) => { if (r.status() >= 400) fehler.push(`${r.status()} ${r.url()}`); });
    for (const name of SEITEN) {
      await page.goto(`${BASIS}/${name}.html`, { waitUntil: "load" });
      const mass = await page.evaluate(messen);
      if (mass.scroll > mass.breite + 1) fehlt(`${name} @${breite}px: waagrecht scrollbar (${mass.scroll}px)${mass.raus.length ? ` – ${mass.raus.join(", ")}` : ""}`);
      if (mass.zerrissen.length) fehlt(`${name} @${breite}px: Überschrift mitten im Wort umgebrochen (${mass.zerrissen.join(", ")})`);
      if (name === "willkommen") {
        // Alles, was .wrap trägt, steht auf derselben Achse – links wie rechts.
        const achsen = await page.evaluate(() => [...document.querySelectorAll(".wrap")].map((el) => {
          const r = el.getBoundingClientRect();
          return { name: String(el.className).split(" ").filter((k) => k !== "wrap")[0] || "wrap", links: Math.round(r.left), rechts: Math.round(r.right) };
        }));
        const links = new Set(achsen.map((a) => a.links));
        const rechts = new Set(achsen.map((a) => a.rechts));
        if (links.size > 1 || rechts.size > 1) {
          const schief = achsen.filter((a) => a.links !== achsen[0].links || a.rechts !== achsen[0].rechts);
          fehlt(`willkommen @${breite}px: ${schief.map((a) => `${a.name} (${a.links}–${a.rechts})`).join(", ")} steht nicht auf der Achse von ${achsen[0].name} (${achsen[0].links}–${achsen[0].rechts})`);
        }
      }
      if (BILDER && breite === 390) await page.screenshot({ path: path.join(BILDER, `${name}.png`), fullPage: true });
    }
    if (fehler.length) fehlt(`@${breite}px: ${fehler.slice(0, 2).join(" | ")}`);
    await context.close();
  }
} finally {
  await browser.close();
  halt();
}

if (befunde.length) {
  console.error("Die Seiten für Erwachsene stimmen nicht:");
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log(`Die vier Seiten stehen: ausgefüllt, verlinkt, und von ${BREITEN[0]} bis ${BREITEN[BREITEN.length - 1]} px ohne Überlauf.`);
