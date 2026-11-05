/*
 * Was Margot im Französischwagen auf Französisch sagt – Satz für Satz, für
 * die Aufnahmen mit der französischen Stimme von Google
 * (scripts/stimme-google.mjs --bereich franzoesisch, docs/STIMME-GOOGLE.md).
 * ---------------------------------------------------------------------------
 * Die Stimme steht fest: fr-FR-Chirp3-HD-Aoede, Tempo 0.9 (so entschieden,
 * docs/FRANZOESISCHECKE-KONZEPT.md). Die Aufnahmen liegen in
 * stimme/franzoesisch/, das Verzeichnis ist franzoesisch-stimme.js
 * (window.LernappFranzoesischDateien); kids.js spielt sie, wenn ein Text mit
 * { sprache: "fr" } gesprochen wird.
 *
 * Die deutsche Seite jedes Paars (der Knopf DE) gehört zur App und spricht
 * mit der deutschen Stimme: scripts/stimme-app/franzoesischecke.mjs.
 *
 * Alles kommt aus franzoesisch-inhalt.js (paare) – wie im Englischwagen.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { WURZEL, sprechText, dateiFuer as dateiIn } from "./stimme-texte.mjs";

export const ORDNER = "stimme/franzoesisch";
export const VERZEICHNIS = "franzoesisch-stimme.js";
export const STIMME = "fr-FR-Chirp3-HD-Aoede";
export const TEMPO = 0.9;
export const dateiFuer = (text) => dateiIn(text, ORDNER);

const lies = (name) => fs.readFileSync(path.join(WURZEL, name), "utf8");

// Der Inhalt, wie die Seite ihn lädt.
export function franzoesischInhalt() {
  const fenster = {};
  vm.runInContext(lies("franzoesisch-inhalt.js"), vm.createContext({ window: fenster }), { filename: "franzoesisch-inhalt.js" });
  return fenster.LernappFranzoesischInhalt;
}

// Alle Paare [Französisch, Deutsch] mit ihrem Ort (franzoesisch-inhalt.js, paare).
export function paare(I = franzoesischInhalt()) {
  return I.paare();
}

// [{ text, wo, teil }] – jeder französische Text einmal.
export async function franzoesischTexte() {
  const gesehen = new Map();
  for (const p of paare()) {
    const text = sprechText(p.en);
    if (text && !gesehen.has(text)) gesehen.set(text, { text, wo: p.wo, teil: "franzoesisch" });
  }
  return [...gesehen.values()];
}

export function verzeichnis() {
  const datei = path.join(WURZEL, VERZEICHNIS);
  if (!fs.existsSync(datei)) return null;
  const fenster = {};
  vm.runInContext(fs.readFileSync(datei, "utf8"), vm.createContext({ window: fenster }), { filename: VERZEICHNIS });
  return fenster.LernappFranzoesischDateien || {};
}

export function schreibeVerzeichnis(eintraege, { stimme = "" } = {}) {
  const zeilen = Object.entries(eintraege).map(([text, datei]) => `  ${JSON.stringify(text)}: ${JSON.stringify(datei)},`);
  const kopf = `/*
 * franzoesisch-stimme.js – Was Margot im Französischwagen auf Französisch
 * sagt, als Aufnahme mit einer französischen Stimme von Google (Chirp 3 HD${stimme ? `, ${stimme}` : ""}).
 *
 * kids.js spielt sie, wenn ein Text mit { sprache: "fr" } gesprochen wird;
 * was fehlt, sagt eine französische Stimme des Geräts. Welche Sätze
 * dazugehören, steht in scripts/stimme-franzoesisch-texte.mjs.
 *
 * Nicht von Hand ändern: scripts/stimme-google.mjs --bereich franzoesisch
 * schreibt diese Datei.
 */
`;
  const inhalt = zeilen.length ? `{\n${zeilen.join("\n")}\n}` : "{}";
  fs.writeFileSync(path.join(WURZEL, VERZEICHNIS), `${kopf}window.LernappFranzoesischDateien = Object.assign(window.LernappFranzoesischDateien || {}, ${inhalt});\n`);
}
