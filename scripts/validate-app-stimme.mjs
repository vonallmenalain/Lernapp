/*
 * Spricht die App ihre Sätze als Aufnahme? (app-stimme.js)
 * ---------------------------------------------------------------------------
 *   node scripts/validate-app-stimme.mjs
 *
 * - Jeder Satz der Liste (scripts/stimme-app-texte.mjs) hat eine Aufnahme.
 *   Fehlt eine – ein neuer oder geänderter Satz –, spräche dort die
 *   Gerätestimme: node scripts/stimme-google.mjs vertonen --bereich app
 * - Jede Aufnahme gehört zu einem Satz, den die App noch sagt
 *   (sonst: node scripts/stimme-google.mjs aufraeumen --bereich app), heisst
 *   nach ihrem Text, ist da, ist eine MP3 wie die anderen (mono, 24 kHz,
 *   32 kbit/s) und so lang, wie ihr Satz es verlangt.
 * - Jede Seite mit kids.js lädt app-stimme.js nach lesen-stimme.js (das sein
 *   Verzeichnis neu anlegt), und der Service Worker legt es in den Cache.
 */
import fs from "node:fs";
import path from "node:path";
import { WURZEL, sprechText, mp3Rahmen } from "./stimme-texte.mjs";
import { passtZumText, sekundenVon } from "./stimme-bau-texte.mjs";
import { appTexte, verzeichnis, dateiFuer, VERZEICHNIS, nichtAufnehmbar } from "./stimme-app-texte.mjs";

const fehler = [];
const pruefe = (bedingung, was) => { if (!bedingung) fehler.push(was); };
const lies = (name) => fs.readFileSync(path.join(WURZEL, name), "utf8");

const texte = await appTexte();
const gesagt = new Set(texte.map((t) => t.text));
const dateien = verzeichnis();
pruefe(dateien && typeof dateien === "object" && !Array.isArray(dateien), `${VERZEICHNIS} fehlt oder legt kein Verzeichnis an`);

let aufnahmen = 0;
Object.entries(dateien || {}).forEach(([text, datei]) => {
  const wo = `Aufnahme «${text.length > 50 ? `${text.slice(0, 50)}…` : text}»`;
  pruefe(text === sprechText(text), `${wo}: der Text steht nicht so da, wie die App ihn nachschlägt (Leerräume)`);
  pruefe(gesagt.has(text), `${wo}: die App sagt diesen Satz nicht mehr so – node scripts/stimme-google.mjs aufraeumen --bereich app`);
  pruefe(datei === dateiFuer(text), `${wo}: die Datei heisst ${datei}, nach ihrem Text ${dateiFuer(text)}`);
  const pfad = path.join(WURZEL, datei);
  if (!fs.existsSync(pfad)) { pruefe(false, `${wo}: ${datei} fehlt`); return; }
  const daten = fs.readFileSync(pfad);
  pruefe(daten.length <= 100 * 1024, `${wo}: ${Math.round(daten.length / 1024)} KB – mehr als 100 KB für einen Satz`);
  const rahmen = mp3Rahmen(daten);
  if (!rahmen) { pruefe(false, `${wo}: ${datei} ist keine MP3`); return; }
  pruefe(rahmen.every((r) => r.version === 2 && r.rate === 24000 && r.kanaele === 1) && rahmen.slice(1).every((r) => r.kbit === 32),
    `${wo}: nicht mono, 24 kHz, 32 kbit/s (${JSON.stringify(rahmen[1] || rahmen[0])})`);
  const sekunden = sekundenVon(daten);
  pruefe(passtZumText(sekunden, text), `${wo}: ${sekunden.toFixed(2)} s für ${text.length} Zeichen – passt nicht zum Satz`);
  aufnahmen += 1;
});

const ohne = texte.filter((t) => !dateien?.[t.text]);
pruefe(!ohne.length, `${ohne.length} Sätze ohne Aufnahme, z. B. «${ohne.slice(0, 3).map((t) => t.text).join("», «")}» – node scripts/stimme-google.mjs vertonen --bereich app`);

// Jede Seite mit kids.js lädt das Verzeichnis, nach lesen-stimme.js.
fs.readdirSync(WURZEL).filter((f) => f.endsWith(".html")).forEach((seite) => {
  const html = lies(seite);
  if (!html.includes('src="kids.js?v=')) return;
  const stelle = html.indexOf('src="app-stimme.js?v=');
  pruefe(stelle >= 0, `${seite} lädt app-stimme.js nicht`);
  const alain = html.indexOf('src="lesen-stimme.js?v=');
  pruefe(alain < 0 || stelle > alain, `${seite}: app-stimme.js steht vor lesen-stimme.js – lesen-stimme.js legt das Verzeichnis neu an`);
});
pruefe(lies("service-worker.js").includes("./app-stimme.js${ASSET_VERSION_QUERY}"), "service-worker.js legt app-stimme.js nicht in den Cache");

if (fehler.length) {
  console.error(`Die Stimme der App stimmt nicht (${fehler.length}):`);
  fehler.slice(0, 60).forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
const nicht = await nichtAufnehmbar();
console.log(`Die App spricht mit der Google-Stimme: ${aufnahmen} Sätze als Aufnahme${nicht.length ? `; ${nicht.length} Stellen lassen sich nicht vorher aufnehmen (der Name, den das Kind tippt, Zufallswörter)` : ""}.`);
