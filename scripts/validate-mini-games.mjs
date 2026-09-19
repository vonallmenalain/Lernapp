/*
 * Stimmen die Mini-Games noch?
 * ---------------------------------------------------------------------------
 * Ein Mini-Game ist ein Link, den jemand weitergegeben hat. Das ist der
 * Unterschied zu allem anderen in dieser App: Eine kaputte Spielseite findet
 * das Kind beim nächsten Öffnen, und es kann daneben etwas anderes spielen.
 * Einen kaputten Mini-Link findet der Fremde, dem er geschickt wurde – einmal,
 * und dann nie wieder.
 *
 * Deshalb wird hier nachgezählt, und zwar an allen Stellen, an denen die Kette
 * reissen kann:
 *
 *   1. mini-games.js, entitlement.js und die Dateien unter mini-games/ nennen
 *      dieselben Spiele und dieselben Seiten.
 *   2. Jede Mini-Seite lädt genau das, was die Seite in der App lädt – plus
 *      mini-games.js, minus pwa.js – und trägt den Schalter data-mini.
 *   3. Jedes Mini-Game hat in highscore.js eine Punktzahl. Sterne oder
 *      Levelkatalog gäben keine Bestenliste her, die etwas bedeutet.
 *   4. Der Weg auf die Site steht: netlify/build.mjs kopiert den Ordner,
 *      der Service Worker kennt mini-games.js.
 *   5. firestore.rules lässt die Bestenliste lesen und schreiben. Ohne die
 *      Regel spielt das Mini-Game, aber niemand kommt je in die Liste.
 *
 * Läuft ohne Netz, ohne Browser, ohne Emulator:
 *
 *   node scripts/validate-mini-games.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { alleSeiten, spieleAusModul } from "./generate-mini-games.mjs";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const lies = (...teile) => fs.readFileSync(path.join(WURZEL, ...teile), "utf8");

const befunde = [];
const fehlt = (was) => befunde.push(was);
let geprueft = 0;
const pruefe = (bedingung, was) => { geprueft += 1; if (!bedingung) fehlt(was); };

// --- 1. und 2. Die Seiten ----------------------------------------------------
let seiten = [];
try {
  seiten = alleSeiten();
} catch (fehler) {
  fehlt(`Die Mini-Seiten lassen sich nicht bilden: ${fehler.message}`);
}

for (const { spiel, appSeite, datei, html } of seiten) {
  const name = path.relative(WURZEL, datei);
  if (!fs.existsSync(datei)) {
    fehlt(`${name} fehlt – node scripts/generate-mini-games.mjs schreibt sie.`);
    continue;
  }
  const vorhanden = fs.readFileSync(datei, "utf8");
  pruefe(vorhanden === html, `${name} weicht von ${appSeite} ab – node scripts/generate-mini-games.mjs schreibt sie neu.`);
  pruefe(/<body[^>]*data-mini="1"/.test(vorhanden), `${name}: der Schalter data-mini fehlt – ohne ihn ist es die App, nicht das Mini-Game.`);
  pruefe(vorhanden.includes(`data-mini-spiel="${spiel.id}"`), `${name}: data-mini-spiel="${spiel.id}" fehlt.`);
  pruefe(/src="\.\.\/mini-games\.js/.test(vorhanden), `${name}: mini-games.js wird nicht geladen.`);
  pruefe(!/pwa\.js/.test(vorhanden), `${name}: pwa.js gehört nicht auf eine Mini-Seite.`);
  pruefe(!/rel="manifest"/.test(vorhanden), `${name}: das Manifest der App gehört nicht auf eine Mini-Seite.`);
  pruefe(!/(href|src)="(?!https?:|\.\.\/|#)[^"]/.test(vorhanden), `${name}: eine Adresse zeigt nicht eine Ebene höher – von /mini-games/ aus geht sie ins Leere.`);

  // Dieselben Skripte wie in der App: Ein vergessenes und das Spiel startet
  // nicht. Verglichen werden die Dateinamen ohne Fassung und ohne Pfad.
  const skripte = (text) => [...text.matchAll(/<script defer src="(?:\.\.\/)?([^"?]+)/g)].map(([, s]) => s);
  const inApp = skripte(lies(appSeite)).filter((s) => s !== "pwa.js");
  const inMini = skripte(vorhanden).filter((s) => s !== "mini-games.js");
  pruefe(inApp.join("|") === inMini.join("|"),
    `${name}: lädt andere Dateien als ${appSeite}\n      App:  ${inApp.join(", ")}\n      Mini: ${inMini.join(", ")}`);
}

// Die Übersicht: die Seite, auf die /mini-games führt.
const uebersicht = path.join(WURZEL, "mini-games", "index.html");
pruefe(fs.existsSync(uebersicht), "mini-games/index.html fehlt – /mini-games zeigte dann nichts.");
if (fs.existsSync(uebersicht)) {
  const html = fs.readFileSync(uebersicht, "utf8");
  pruefe(/data-mini-uebersicht/.test(html), "mini-games/index.html: der Platz für die Übersicht (data-mini-uebersicht) fehlt.");
  pruefe(/data-page="mini-hub"/.test(html), "mini-games/index.html: data-page=\"mini-hub\" fehlt – mini-games.js baut dann nichts.");
  pruefe(/<body[^>]*data-mini="1"/.test(html), "mini-games/index.html: der Schalter data-mini fehlt.");
  ["highscore.js", "firebase.js", "mini-games.js"].forEach((datei) => {
    pruefe(html.includes(`../${datei}`), `mini-games/index.html: ${datei} wird nicht geladen.`);
  });
}

// --- 3. Jedes Mini-Game hat eine Punktzahl -----------------------------------
const highscore = lies("highscore.js");
for (const spiel of spieleAusModul()) {
  const zeile = highscore.split("\n").find((z) => z.includes(`id: "${spiel.id}"`));
  pruefe(Boolean(zeile), `highscore.js kennt das Mini-Game "${spiel.id}" nicht.`);
  if (zeile) {
    pruefe(/art: "punkte"/.test(zeile),
      `${spiel.id} ist kein Spiel mit Punktzahl (highscore.js) – als Mini-Game hätte es keine Bestenliste, die etwas bedeutet.`);
  }
}

// --- 4. Der Weg auf die Site -------------------------------------------------
const build = lies("netlify", "build.mjs");
pruefe(/ORDNER = \[[^\]]*"mini-games"/.test(build), "netlify/build.mjs kopiert den Ordner mini-games/ nicht – auf der Site gäbe es ihn nicht.");
pruefe(build.includes('"mini-games/index.html"'), "netlify/build.mjs prüft nicht, ob mini-games/index.html in dist/ gelandet ist.");
const worker = lies("service-worker.js");
pruefe(worker.includes("./mini-games.js"), "service-worker.js legt mini-games.js nicht ab – im Adminbereich fehlte der Haken ohne Netz.");

// --- 5. Die Regeln der Bestenliste -------------------------------------------
const regeln = lies("firestore.rules");
pruefe(/match \/miniScores\/\{/.test(regeln), "firestore.rules kennt miniScores nicht – niemand käme in die Bestenliste.");
pruefe(/istMiniEintrag/.test(regeln), "firestore.rules prüft die Einträge der Mini-Games nicht.");
// Die Liste der erlaubten Spiele steht zweimal: in mini-games.js, damit die
// Seiten entstehen, und in den Regeln, damit niemand ein erfundenes Spiel
// einträgt. Zwei Listen, die auseinanderlaufen, wären schlimmer als eine
// schlechte: Ein neues Mini-Game käme dann durch die Regeln nicht durch, und
// niemand wüsste warum.
{
  const block = regeln.match(/function miniSpiele\(\) \{\s*return \[([\s\S]*?)\];/);
  pruefe(Boolean(block), "firestore.rules führt keine Liste der erlaubten Mini-Games (miniSpiele).");
  if (block) {
    const inRegeln = [...block[1].matchAll(/"([^"]+)"/g)].map(([, id]) => id).sort();
    const inModul = spieleAusModul().map((spiel) => spiel.id).sort();
    pruefe(inRegeln.join(",") === inModul.join(","),
      `firestore.rules und mini-games.js nennen verschiedene Spiele:\n      Regeln: ${inRegeln.join(", ")}\n      Modul:  ${inModul.join(", ")}`);
  }
}
// Ein Name, eine Kennung und ein Bestwert sind kein Fortschritt der App: Ein
// Zurücksetzen oder ein Wechsel des Wagen-Sets räumt alles unter "lernapp."
// weg, was nicht in LOCAL_KEEP_KEYS steht – und nähme einem fremden Besucher
// mit, was ihn in der Liste ausmacht.
{
  const cloud = lies("firebase.js");
  const keep = cloud.match(/const LOCAL_KEEP_KEYS = new Set\(\[([\s\S]*?)\]\);/);
  pruefe(Boolean(keep), "firebase.js führt keine Liste LOCAL_KEEP_KEYS mehr.");
  ["lernapp.mini.name", "lernapp.mini.id", "lernapp.mini.best"].forEach((schluessel) => {
    pruefe(Boolean(keep) && keep[1].includes(`"${schluessel}"`),
      `${schluessel} steht nicht in LOCAL_KEEP_KEYS – ein Zurücksetzen der App löschte ihn mit.`);
  });
}
// Gelesen wird je Spiel, nicht die ganze Kollektion: Sonst drängte ein gut
// laufendes Mini-Game die Einträge eines anderen aus der Antwort.
{
  const cloud = lies("firebase.js");
  pruefe(/\.where\("game", "==", id\)/.test(cloud), "firebase.js liest die Bestenliste nicht je Spiel.");
  pruefe(/aendereMiniName/.test(cloud), "firebase.js kann einen Namen nicht ändern, ohne eine Runde daraus zu machen.");
}

// --- 6. Der Adminbereich -----------------------------------------------------
const admin = lies("admin.js");
pruefe(/setMiniSpiel/.test(admin), "admin.js setzt den Haken \"Mini-Game\" nicht.");
pruefe(lies("admin.html").includes("mini-games.js"), "admin.html lädt mini-games.js nicht – ohne die Datei weiss der Adminbereich nicht, welche Spiele Mini-Games sein können.");

// ---------------------------------------------------------------------------
console.log(`${geprueft} Prüfungen, ${seiten.length} Mini-Seiten.`);
if (befunde.length) {
  console.error(`\n${befunde.length} Befund${befunde.length === 1 ? "" : "e"}:`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Mini-Games stimmen.");
