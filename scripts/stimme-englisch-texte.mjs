/*
 * Was Rocco in der Englischecke auf Englisch sagt – Satz für Satz, für die
 * Aufnahmen mit der amerikanischen Stimme von Google
 * (scripts/stimme-google.mjs --bereich englisch, docs/STIMME-GOOGLE.md).
 * ---------------------------------------------------------------------------
 * Die Stimme steht fest: en-US-Chirp3-HD-Puck, Tempo 0.9 (so entschieden,
 * docs/ENGLISCHECKE-KONZEPT.md). Die Aufnahmen liegen in stimme/englisch/,
 * das Verzeichnis ist englisch-stimme.js (window.LernappEnglischDateien);
 * kids.js spielt sie, wenn ein Text mit { sprache: "en" } gesprochen wird.
 *
 * Die deutsche Seite jedes Paars (der Knopf DE) gehört zur App und spricht
 * mit der deutschen Stimme: scripts/stimme-app/englischecke.mjs.
 *
 * Alles kommt aus englisch-inhalt.js (paare): jedes Paar [Englisch, Deutsch],
 * jedes Wort mit Satz und Frage, die Geschichten, Roccos Sätze, das Lob, die
 * Einrichtung, Farben, Zahlen, die Sätze der Spiele, die Verse und die
 * Bücher. Aufgenommen wird der ganze Text, so wie train-englischecke.js
 * ihn sagt – kids.js sucht zuerst den ganzen Text.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { WURZEL, sprechText, dateiFuer as dateiIn } from "./stimme-texte.mjs";

export const ORDNER = "stimme/englisch";
export const VERZEICHNIS = "englisch-stimme.js";
export const STIMME = "en-US-Chirp3-HD-Puck";
export const TEMPO = 0.9;
export const dateiFuer = (text) => dateiIn(text, ORDNER);

const lies = (name) => fs.readFileSync(path.join(WURZEL, name), "utf8");

// Der Inhalt, wie die Seite ihn lädt.
export function englischInhalt() {
  const fenster = {};
  vm.runInContext(lies("englisch-inhalt.js"), vm.createContext({ window: fenster }), { filename: "englisch-inhalt.js" });
  return fenster.LernappEnglischInhalt;
}

// Alle Paare [Englisch, Deutsch] mit ihrem Ort – für beide Sprachen. Die
// Liste führt englisch-inhalt.js selbst (paare), damit kein Satz fehlt, den
// ein Spiel zusammensetzt («Tap the red balloon!», «Three ducks!»).
export function paare(I = englischInhalt()) {
  return I.paare();
}

// [{ text, wo, teil }] – jeder englische Text einmal.
export async function englischTexte() {
  const gesehen = new Map();
  for (const p of paare()) {
    const text = sprechText(p.en);
    if (text && !gesehen.has(text)) gesehen.set(text, { text, wo: p.wo, teil: "englisch" });
  }
  return [...gesehen.values()];
}

export function verzeichnis() {
  const datei = path.join(WURZEL, VERZEICHNIS);
  if (!fs.existsSync(datei)) return null;
  const fenster = {};
  vm.runInContext(fs.readFileSync(datei, "utf8"), vm.createContext({ window: fenster }), { filename: VERZEICHNIS });
  return fenster.LernappEnglischDateien || {};
}

export function schreibeVerzeichnis(eintraege, { stimme = "" } = {}) {
  const zeilen = Object.entries(eintraege).map(([text, datei]) => `  ${JSON.stringify(text)}: ${JSON.stringify(datei)},`);
  const kopf = `/*
 * englisch-stimme.js – Was Rocco in der Englischecke auf Englisch sagt, als
 * Aufnahme mit einer amerikanischen Stimme von Google (Chirp 3 HD${stimme ? `, ${stimme}` : ""}).
 *
 * kids.js spielt sie, wenn ein Text mit { sprache: "en" } gesprochen wird
 * (sprichEnglisch); was fehlt, sagt eine englische Stimme des Geräts.
 * Welche Sätze dazugehören, steht in scripts/stimme-englisch-texte.mjs.
 *
 * Nicht von Hand ändern: scripts/stimme-google.mjs --bereich englisch
 * schreibt diese Datei.
 */
`;
  const inhalt = zeilen.length ? `{\n${zeilen.join("\n")}\n}` : "{}";
  fs.writeFileSync(path.join(WURZEL, VERZEICHNIS), `${kopf}window.LernappEnglischDateien = Object.assign(window.LernappEnglischDateien || {}, ${inhalt});\n`);
}
