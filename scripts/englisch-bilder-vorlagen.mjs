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
 * Dazu die Bögen für Sticker und Aufnäher (bogen-<name>.png, 4 × 4 Felder zu
 * 256 Pixeln, boegen.json sagt, was in welchem Feld steht) und das leere Buch
 * des Wörterbuchs (buch.png). Gemalt schneidet sie
 * scripts/englisch-sticker-schneiden.py aus.
 *
 * Die Vorlagen gehen mit einer Stilvorlage an das Malprogramm («Male dieses
 * Bild neu, alles bleibt, wo es ist»). Danach sucht
 * scripts/englisch-bilder-abgleich.py jedes Ding im Gemälde und schreibt
 * englisch-gemalt.js. Siehe docs/ENGLISCHECKE-KONZEPT.md, «Gemalte Bilder».
 *
 * Mit --sprache franzoesisch: die Geschichten des Französischwagens, mit
 * Margot statt Rocco gezeichnet, und margot-referenz.png (Margot in vier
 * Haltungen); dazu geschichten-mit-margot.json, auf welchen Bildern sie steht.
 * Von den Welten nur die, die der Englischwagen nicht hat («fetes»), und
 * Bögen nur für Wörter und Welten, die noch keinen gemalten Sticker oder
 * Aufnäher haben.
 *
 * Aufruf:  node scripts/englisch-bilder-vorlagen.mjs <ordner> [--sprache franzoesisch]
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
const FRANZ = process.argv.includes("--sprache") && process.argv[process.argv.indexOf("--sprache") + 1] === "franzoesisch";
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
if (FRANZ) {
  // Der Französischwagen ist offen: Margot statt Rocco, ohne Margots Gemälde.
  await seite.waitForFunction(() => window.LernappFranzoesischArt && window.LernappFranzoesischInhalt);
  const n = await seite.evaluate(() => {
    const F = window.LernappFranzoesischArt;
    const I = window.LernappFranzoesischInhalt;
    const ohne = { geschichten: {}, ordner: "bilder/franzoesisch" };
    window.LernappSprachwagen.aktiv = { id: "franzoesisch", maskottchen: F.MASKOTTCHEN, art: () => F, inhalt: () => I, gemalt: () => ohne };
    // Auf welchen Bildern Margot steht: mit einem Merkzeichen statt ihrer Zeichnung.
    const merk = { ...F.MASKOTTCHEN, rocco: () => "<!--MARGOT-->", roccoKopf: () => "<!--MARGOT-->" };
    window.LernappSprachwagen.aktiv.maskottchen = merk;
    const mit = Object.fromEntries(I.GESCHICHTEN.map((g) => [g.id, g.bilder.map((_, i) => F.geschichtsBild(g.id, i, { gezeichnet: true }).includes("<!--MARGOT-->"))]));
    window.LernappSprachwagen.aktiv.maskottchen = F.MASKOTTCHEN;
    return mit;
  });
  fs.writeFileSync(path.join(AUS, "geschichten-mit-margot.json"), JSON.stringify(n, null, 1));
}
const info = await seite.evaluate((franz) => {
  const I = franz ? window.LernappFranzoesischInhalt : window.LernappEnglischInhalt;
  const A = franz ? window.LernappFranzoesischArt : window.LernappEnglischArt;
  return {
    welten: I.WELTEN.map((w) => w.id),
    geschichten: I.GESCHICHTEN.map((g) => [g.id, g.bilder.length]),
    orte: Object.fromEntries(I.WELTEN.map((w) => [w.id, Object.fromEntries(Object.entries(A.ORTE[w.id] || {}).map(([id, o]) => [id, o.slice(0, 3)]))])),
    titelbild: Object.fromEntries(I.GESCHICHTEN.map((g) => [g.id, A.TITELBILD[g.id] ?? 0])),
  };
}, FRANZ);
if (FRANZ) {
  info.welten = await seite.evaluate(() => {
    const englisch = new Set(window.LernappEnglischInhalt.WELTEN.map((w) => w.id));
    return window.LernappFranzoesischInhalt.WELTEN.map((w) => w.id).filter((id) => !englisch.has(id));
  });
}
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
// Rocco (oder Margot) in vier Haltungen – die Vorlage für die Figur.
const rocco = await seite.evaluate((franz) => {
  const A = franz ? window.LernappFranzoesischArt : window.LernappEnglischArt;
  const posen = [["steh", "froh"], ["wirf", "froh"], ["steh", "traurig"], ["jubel", "freude"]];
  return `<svg viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="400" fill="#fff"/>${posen.map(([p, l], i) => `<g transform="translate(${120 + i * 220} 330) scale(1.6)">${A.rocco(p, l)}</g>`).join("")}</svg>`;
}, FRANZ);
await zeige(rocco, 900, 400, FRANZ ? "margot-referenz.png" : "rocco-referenz.png", "none");
fs.writeFileSync(path.join(AUS, "vorlagen.json"), JSON.stringify(vorlagen, null, 1));
if (FRANZ) {
  // Bögen nur für das, was noch nicht gemalt ist (Margots Sticker hat seinen eigenen).
  const neu = await seite.evaluate(() => {
    const I = window.LernappFranzoesischInhalt;
    const G = window.LernappEnglischArt.GEMALT;
    const ids = [...I.WELTEN.flatMap((w) => w.woerter), ...I.EXTRA_WOERTER].map((x) => x.id).filter((id) => id !== "raccoon" && !G.sticker?.has(id));
    const b = [];
    for (let i = 0; i < ids.length; i += 16) b.push({ name: `fr-${b.length + 1}`, ids: ids.slice(i, i + 16) });
    const welten = I.WELTEN.map((w) => w.id).filter((id) => !G.aufnaeher?.has(id));
    if (welten.length) b.push({ name: "fr-aufnaeher", ids: welten, aufnaeher: true });
    return b;
  });
  for (const bogen of neu) {
    const svg = await seite.evaluate((bogen) => {
      const A = window.LernappFranzoesischArt;
      let s = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><defs><filter id="en-grau"><feColorMatrix type="saturate" values="0"/></filter>${window.LernappBauTiere?.defs?.() || ""}</defs><rect width="1024" height="1024" fill="#d6e6f0"/>`;
      bogen.ids.forEach((id, i) => {
        const cx = 128 + (i % 4) * 256, cy = 128 + Math.floor(i / 4) * 256;
        s += bogen.aufnaeher ? A.aufnaeher(id, cx, cy, 100, { anteil: 1, voll: true }) : A.sticker(id, cx, cy, 112, "gehoert").replace(/^<circle[^>]*\/>/, "");
      });
      return `${s}</svg>`;
    }, bogen);
    await zeige(svg, 1024, 1024, `bogen-${bogen.name}.png`, "none");
  }
  fs.writeFileSync(path.join(AUS, "boegen.json"), JSON.stringify(neu, null, 1));
  await browser.close();
  halt();
  console.log(`Vorlagen in ${AUS}: ${info.welten.length} Wimmelbilder, ${info.geschichten.reduce((s, [, n]) => s + n, 0)} Geschichtenbilder mit Margot, ${neu.length} Bögen, margot-referenz.png, vorlagen.json und boegen.json.`);
  process.exit(0);
}

// Die Bögen: je Welt ihre Sticker, dazu die Extra-Wörter mit den Farben, die
// Zahlen und die Aufnäher. Heller Grund, damit auch Weisses zu sehen ist.
const boegen = await seite.evaluate(() => {
  const I = window.LernappEnglischInhalt;
  const b = I.WELTEN.map((w) => ({ name: w.id, ids: w.woerter.map((x) => x.id) }));
  b.push({ name: "extra", ids: [...I.EXTRA_WOERTER.map((x) => x.id), ...(I.FARBEN || []).map((x) => x.id)] });
  b.push({ name: "zahlen", ids: (I.ZAHLEN || []).map((x) => x.id) });
  b.push({ name: "aufnaeher", ids: I.WELTEN.map((w) => w.id), aufnaeher: true });
  return b;
});
for (const bogen of boegen) {
  const svg = await seite.evaluate((bogen) => {
    const A = window.LernappEnglischArt;
    let s = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><defs><filter id="en-grau"><feColorMatrix type="saturate" values="0"/></filter>${window.LernappBauTiere?.defs?.() || ""}</defs><rect width="1024" height="1024" fill="#d6e6f0"/>`;
    // Ohne Gemälde zeichnen: GEMALT kurz leeren.
    const G = A.GEMALT;
    const merke = [G.sticker, G.aufnaeher];
    G.sticker = new Set(); G.aufnaeher = new Set();
    bogen.ids.forEach((id, i) => {
      const cx = 128 + (i % 4) * 256, cy = 128 + Math.floor(i / 4) * 256;
      s += bogen.aufnaeher ? A.aufnaeher(id, cx, cy, 100, { anteil: 1, voll: true }) : A.sticker(id, cx, cy, 112, "gehoert").replace(/^<circle[^>]*\/>/, "");
    });
    [G.sticker, G.aufnaeher] = merke;
    return `${s}</svg>`;
  }, bogen);
  await zeige(svg, 1024, 1024, `bogen-${bogen.name}.png`, "none");
}
fs.writeFileSync(path.join(AUS, "boegen.json"), JSON.stringify(boegen, null, 1));
const buch = await seite.evaluate(() => {
  const A = window.LernappEnglischArt;
  const merke = A.GEMALT.woerterbuch;
  A.GEMALT.woerterbuch = false;
  const s = `<svg viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg">${A.woerterbuchBild()}</svg>`;
  A.GEMALT.woerterbuch = merke;
  return s;
});
await zeige(buch, 1000, 560, "buch.png", "none");
await browser.close();
halt();
console.log(`Vorlagen in ${AUS}: ${info.welten.length} Wimmelbilder, ${info.geschichten.reduce((s, [, n]) => s + n, 0)} Geschichtenbilder, ${boegen.length} Bögen, das Buch, vorlagen.json und boegen.json.`);
