/*
 * Vorlagen für die gemalten Bilder der Englischecke.
 * ---------------------------------------------------------------------------
 * Rendert jedes Wimmelbild (1000 × 560) und jedes Bild der Bildgeschichten
 * (472 × 204, doppelt so gross) als Zeichnung – so, wie es ohne Gemälde
 * aussieht – und schreibt dazu, wo jedes Ding steht (vorlagen.json):
 *
 *   welten[welt][id]          [[bx, by, bw, bh]]  Rahmen der Zeichnung
 *   orte[welt][id]            [x, y, m]           wo die Zeichnung sitzt (ORTE)
 *   geschichten[g][i][wort]   [[bx, by, bw, bh]]  Rahmen im Mass 472 × 204
 *   titelbild[g]              welches Bild die Geschichte im Regal zeigt
 *
 * Die Vorlagen gehen mit einer Stilvorlage an das Malprogramm («Male dieses
 * Bild neu, alles bleibt, wo es ist»). Danach sucht
 * scripts/englisch-bilder-abgleich.py jedes Ding im Gemälde und schreibt
 * englisch-gemalt.js. Siehe docs/ENGLISCHECKE-KONZEPT.md, «Gemalte Bilder».
 *
 * Aufruf:  node scripts/englisch-bilder-vorlagen.mjs <ordner>
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4295);
const BASIS = `http://127.0.0.1:${PORT}`;
const AUS = path.resolve(process.argv[2] || "");
if (!process.argv[2]) { console.error("Aufruf: node scripts/englisch-bilder-vorlagen.mjs <ordner>"); process.exit(2); }
fs.mkdirSync(AUS, { recursive: true });

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt."); process.exit(2); }

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
for (let i = 0; i < 50; i += 1) {
  try { if ((await fetch(`${BASIS}/index.html`)).ok) break; } catch { /* noch nicht */ }
  await new Promise((w) => setTimeout(w, 100));
}

const browser = await playwright.chromium.launch();
const seite = await browser.newPage({ viewport: { width: 1000, height: 560 } });
await seite.route("**/*gstatic.com/**", (r) => r.abort());
await seite.goto(`${BASIS}/index.html`);
await seite.waitForFunction(() => window.LernappEnglischArt && window.LernappEnglischInhalt);
const info = await seite.evaluate(() => {
  const I = window.LernappEnglischInhalt;
  const A = window.LernappEnglischArt;
  return {
    welten: I.WELTEN.map((w) => w.id),
    geschichten: I.GESCHICHTEN.map((g) => [g.id, g.bilder.length]),
    orte: Object.fromEntries(I.WELTEN.map((w) => [w.id, Object.fromEntries(Object.entries(A.ORTE[w.id] || {}).map(([id, o]) => [id, o.slice(0, 3)]))])),
    titelbild: Object.fromEntries(I.GESCHICHTEN.map((g) => [g.id, A.TITELBILD[g.id] ?? 0])),
  };
});
// Zeigt eine Zeichnung allein auf der Seite, fotografiert sie und misst die
// Rahmen der Dinge (im Mass der viewBox).
async function zeige(svg, breite, hoehe, datei, wahl) {
  await seite.setViewportSize({ width: breite, height: hoehe });
  const rahmen = await seite.evaluate(({ svg, breite, hoehe, wahl }) => {
    document.body.innerHTML = `<div id="vorlage" style="position:fixed;inset:0;background:#fff;z-index:99999">${svg}</div>`;
    const s = document.querySelector("#vorlage svg");
    s.setAttribute("width", breite);
    s.setAttribute("height", hoehe);
    const f = breite / s.viewBox.baseVal.width;
    const o = s.getBoundingClientRect();
    const aus = {};
    s.querySelectorAll(wahl).forEach((g) => {
      const ziel = g.matches("[data-ding]") ? g.querySelector("g") : g;
      const r = ziel.getBoundingClientRect();
      const id = g.dataset.ding || g.dataset.wort;
      (aus[id] = aus[id] || []).push([(r.left - o.left) / f, (r.top - o.top) / f, r.width / f, r.height / f].map((v) => Math.round(v * 10) / 10));
    });
    return aus;
  }, { svg, breite, hoehe, wahl });
  await seite.waitForTimeout(120);
  await seite.screenshot({ path: path.join(AUS, datei) });
  return rahmen;
}
const vorlagen = { welten: {}, orte: info.orte, geschichten: {}, titelbild: info.titelbild };
for (const w of info.welten) {
  const svg = await seite.evaluate((w) => window.LernappEnglischArt.szene(w, { gezeichnet: true }), w);
  vorlagen.welten[w] = await zeige(svg, 1000, 560, `welt-${w}.png`, "[data-ding]");
}
for (const [g, n] of info.geschichten) {
  vorlagen.geschichten[g] = [];
  for (let i = 0; i < n; i += 1) {
    const svg = await seite.evaluate(({ g, i }) => `<svg viewBox="0 0 472 204" xmlns="http://www.w3.org/2000/svg">${window.LernappEnglischArt.geschichtsBild(g, i, { gezeichnet: true })}</svg>`, { g, i });
    vorlagen.geschichten[g].push(await zeige(svg, 944, 408, `geschichte-${g}-${i + 1}.png`, "[data-wort]"));
  }
}
// Rocco in vier Haltungen – die Vorlage für die Figur.
const rocco = await seite.evaluate(() => {
  const A = window.LernappEnglischArt;
  const posen = [["steh", "froh"], ["wirf", "froh"], ["steh", "traurig"], ["jubel", "freude"]];
  return `<svg viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="400" fill="#fff"/>${posen.map(([p, l], i) => `<g transform="translate(${120 + i * 220} 330) scale(1.6)">${A.rocco(p, l)}</g>`).join("")}</svg>`;
});
await zeige(rocco, 900, 400, "rocco-referenz.png", "none");
fs.writeFileSync(path.join(AUS, "vorlagen.json"), JSON.stringify(vorlagen, null, 1));
await browser.close();
halt();
console.log(`Vorlagen in ${AUS}: ${info.welten.length} Wimmelbilder, ${info.geschichten.reduce((s, [, n]) => s + n, 0)} Geschichtenbilder, vorlagen.json.`);
