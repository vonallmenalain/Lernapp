/*
 * Welche festen Texte eine Aufnahme mit Alains Stimme bekommen – und wie
 * eine Aufnahme heisst.
 * ---------------------------------------------------------------------------
 * Geteilt von scripts/stimme-vertonen.mjs (erzeugte Dateien übernehmen) und
 * scripts/validate-lesen.mjs (passt jede Aufnahme zu ihrem Text?).
 *
 * Die Texte kommen aus den Quellen, nicht aus einer Abschrift: aus dem Buch
 * so, wie buecher.js es Satz für Satz vorliest (lesen-buecher.js, saetze),
 * aus den Spielen der Hilfetext, den der Lautsprecher sagt. Ändert sich ein
 * Text dort, gehört seine Aufnahme nicht mehr dazu, und die Prüfung meldet es.
 *
 * Der Name einer Aufnahme ist der Anfang des SHA-256 ihres Textes – so, wie
 * die App ihn nachschlägt (kids.js, sprechText: Leerräume zu je einem
 * Leerzeichen).
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

export const WURZEL = path.resolve(import.meta.dirname, "..");
export const ORDNER = "stimme/alain";
export const VERZEICHNIS = "lesen-stimme.js";

const lies = (name) => fs.readFileSync(path.join(WURZEL, name), "utf8");

export function sprechText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

// ordner: wessen Stimme – stimme/alain, oder stimme/google für die Bauecke
// (scripts/stimme-bau-texte.mjs).
export function dateiFuer(text, ordner = ORDNER) {
  const hash = crypto.createHash("sha256").update(sprechText(text), "utf8").digest("hex").slice(0, 12);
  return `${ordner}/${hash}.mp3`;
}

// Ein fester Text aus einer Quelle: const NAME = "…"; oder
// const NAME = ["…", "…"].join(" ");
function festerText(datei, name) {
  const quelle = lies(datei);
  const liste = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\]\\.join\\(" "\\);`).exec(quelle);
  const einzeln = new RegExp(`const ${name} = ("(?:[^"\\\\]|\\\\.)*");`).exec(quelle);
  if (!liste && !einzeln) throw new Error(`${datei}: ${name} nicht gefunden`);
  const teile = liste ? [...liste[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)) : [JSON.parse(einzeln[1])];
  return sprechText(teile.join(" "));
}

// Ein Satz, den ein Spiel wörtlich sagt: ton.sprich("…").
function gesagterSatz(datei, anfang) {
  const treffer = [...lies(datei).matchAll(/ton\.sprich\("((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)).find((s) => s.startsWith(anfang));
  if (!treffer) throw new Error(`${datei}: kein ton.sprich("${anfang}…")`);
  return sprechText(treffer);
}

function buecher() {
  const fenster = {};
  vm.runInContext(lies("lesen-buecher.js"), vm.createContext({ window: fenster }), { filename: "lesen-buecher.js" });
  return fenster.LernappLeseBuecher;
}

// Was der Probelauf vertont: [{ text, wo }] in der Reihenfolge, in der man es
// hört. Jeder Text nur einmal.
export function texte() {
  const bib = buecher();
  const liste = [];
  const dazu = (text, wo) => {
    const t = sprechText(text);
    if (t && !liste.some((e) => e.text === t)) liste.push({ text: t, wo });
  };

  // 1. Das freie Hörbuch: Titel, jede Seite Satz für Satz, die Fragen und die
  //    richtigen Antworten (die Stimme sagt sie nach dem Tipp) – und was sie
  //    nach einem falschen Tipp sagt.
  const buch = bib.BY_ID["hase-rueebli"];
  if (!buch) throw new Error("lesen-buecher.js: «Wo ist das Rüebli?» (hase-rueebli) fehlt");
  dazu(buch.titel, "Buch «Wo ist das Rüebli?»: Titel");
  buch.seiten.forEach((seite, nr) => bib.saetze(seite.text).forEach((satz) => dazu(satz, `Buch «Wo ist das Rüebli?»: Seite ${nr + 1}`)));
  buch.fragen.forEach((frage, nr) => {
    // Hörbücher fragen mit Bildern: gesagt wird nur die Frage (buecher.js,
    // frageSprechen).
    dazu(frage.frage, `Buch «Wo ist das Rüebli?»: Frage ${nr + 1}`);
    dazu(frage.antworten[frage.richtig].text, `Buch «Wo ist das Rüebli?»: Antwort ${nr + 1}`);
  });
  dazu(gesagterSatz("buecher.js", "Nicht ganz."), "Buch «Wo ist das Rüebli?»: nach einem falschen Tipp");

  // 2. Der Hilfetext des Lesewagens. Meist sagt der Lautsprecher vorher, was
  //    der Lesewurm vorschlägt – das bleibt bei der Gerätestimme, der Rest
  //    kommt aus der Aufnahme (kids.js, aufnahmeStuecke).
  dazu(festerText("train-leseecke.js", "HILFE"), "Lesewagen: Lautsprecher");

  // 3. Die Hilfetexte von Silbenzug und Buchstabenhaus.
  dazu(festerText("silbenzug.js", "HELP"), "Silbenzug: Lautsprecher");
  dazu(festerText("buchstabenhaus.js", "HELP_HAUS"), "Buchstabenhaus: Lautsprecher");
  dazu(festerText("buchstabenhaus.js", "HELP_SUCHEN"), "Buchstabenhaus, Suchspiel: Lautsprecher");
  return liste;
}

// Das Verzeichnis, wie es in lesen-stimme.js steht: { text: datei }.
export function verzeichnis() {
  const fenster = {};
  vm.runInContext(lies(VERZEICHNIS), vm.createContext({ window: fenster }), { filename: VERZEICHNIS });
  return fenster.LernappStimmeDateien;
}

const KOPF = `/*
 * lesen-stimme.js – Feste Texte als Aufnahme mit Alains Stimme.
 *
 * Die App liest sonst mit der Sprachausgabe des Geräts vor, die Laute aber
 * kommen von Alain (lesen-laute.js). Damit beides gleich klingt, gibt es feste
 * Texte – die Sätze eines Buches, die Hilfe eines Spiels – als Aufnahme: aus
 * dem geschriebenen Text erzeugt mit Alains Stimmprofil auf Higgsfield
 * (text2speech_v2, elevenlabs), als MP3 in stimme/alain/ (mono, 32 kbit/s).
 * Eine Datei heisst nach dem Anfang des SHA-256 ihres Textes.
 *
 * Gespielt wird in kids.js (aufnahmeStuecke, aufnahmeFolge): Gibt es zu einem
 * Text eine Aufnahme, spielt sie, sonst spricht die Gerätestimme wie bisher.
 * Welche Texte dazugehören, steht in scripts/stimme-texte.mjs, und
 * scripts/validate-lesen.mjs prüft, dass jede Datei da ist und zu ihrem Text
 * passt.
 *
 * Nicht von Hand ändern: scripts/stimme-vertonen.mjs schreibt diese Datei.
 */
`;

export function schreibeVerzeichnis(eintraege) {
  const zeilen = Object.entries(eintraege).map(([text, datei]) => `  ${JSON.stringify(text)}: ${JSON.stringify(datei)},`);
  const inhalt = zeilen.length ? `{\n${zeilen.join("\n")}\n}` : "{}";
  fs.writeFileSync(path.join(WURZEL, VERZEICHNIS), `${KOPF}window.LernappStimmeDateien = ${inhalt};\n`);
}
