/*
 * Was die App ausserhalb der Bauecke sagt – Satz für Satz, für die Aufnahmen
 * mit der Stimme von Google (scripts/stimme-google.mjs --bereich app,
 * docs/STIMME-GOOGLE.md).
 * ---------------------------------------------------------------------------
 * Die Bauecke hat ihre eigene Liste (stimme-bau-texte.mjs, bau-stimme.js,
 * nur auf index.html). Diese hier gilt für alle Seiten mit kids.js:
 * app-stimme.js, geladen nach lesen-stimme.js.
 *
 * Drei Teile:
 *   fest      jede Zeichenkette im Code der Spiele, die wie ein gesprochener
 *             Satz aussieht (gross am Anfang, Satzzeichen am Schluss) –
 *             gefunden von stimme-quelltext.mjs. Mehr als nötig: auch ein
 *             Satz, der nur auf dem Bildschirm steht, bekommt eine Aufnahme.
 *             Das kostet ein paar Zeichen, verpasst aber keinen.
 *   daten     was die Spiele aus ihren Listen vorlesen: Wörter, Bücher,
 *             Steckbriefe, Fälle, Postkarten, Aufträge der Reise …
 *   vorlagen  Sätze mit Wechselndem («Du hast 3 von 8 Wörtern …»): die
 *             Regeln in scripts/stimme-app/*.mjs rechnen sie aus.
 *
 * Gezählt wird in Sätzen wie in kids.js (aufnahmeStuecke): Ein Text wird an
 * den Satzenden geteilt, und je Satz wird eine Aufnahme gesucht. Was fehlt,
 * spricht die Gerätestimme. scripts/check-app-stimme.mjs findet es im
 * Browser.
 *
 * Eine Regel-Datei in scripts/stimme-app/ sieht so aus:
 *   export default function texte(d) { return ["…", { text: "…", wo: "x.js" }]; }
 * { optional: true } heisst: Fehlt die Aufnahme, weiss sich der Code selbst
 * zu helfen – etwa wenn die Stimme ein Stück nicht aussprechen kann.
 *   export const NICHT = [{ wo: "x.js:12", warum: "der Name, den das Kind tippt" }];
 * d: die Daten der App (d.inhalte, d.buecher, d.detektive, d.wurm,
 * d.stand, d.reise, d.train), d.quelle(datei) für den Quelltext und
 * d.zeichenketten(datei) für dessen Zeichenketten. NICHT sammelt, was sich
 * nicht vorher aufnehmen lässt (der Name des Kindes, Zufallswörter) – es
 * steht in docs/STIMME-GOOGLE.md.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { WURZEL, sprechText, dateiFuer as dateiIn } from "./stimme-texte.mjs";
import { saetzeVon } from "./stimme-bau-texte.mjs";
import { zeichenketten, LUECKE } from "./stimme-quelltext.mjs";

export const ORDNER = "stimme/google";
export const VERZEICHNIS = "app-stimme.js";
export const dateiFuer = (text) => dateiIn(text, ORDNER);

const lies = (name) => fs.readFileSync(path.join(WURZEL, name), "utf8");

// Die Skripte, deren Zeichenketten gesprochen werden können. Die Bauecke
// (bau-*.js, train-bau.js) hat ihre eigene Liste; Zeichnungen, Daten ohne
// Sprache, Admin, Konto und Cache fallen weg.
const NICHT_GESPROCHEN = new Set([
  "admin.js", "firebase.js", "game-cloud.js", "highscore.js", "laute-aufnehmen.js", "lesen-art.js", "lesen-bilder.js",
  "lesen-laute.js", "lesen-stimme.js", "app-stimme.js", "pwa.js", "service-worker.js", "strand-art.js", "train-art.js",
  "train-scenes.js", "train-bau.js",
]);
export function sprechDateien() {
  return fs.readdirSync(WURZEL)
    .filter((f) => f.endsWith(".js") && !f.startsWith("bau-") && !NICHT_GESPROCHEN.has(f))
    .sort();
}

// Sieht eine Zeichenkette wie ein gesprochener Satz aus?
export function istSatz(satz) {
  if (!satz || satz.includes(LUECKE) || satz.length > 400) return false;
  if (!/^[A-ZÄÖÜ0-9«„"]/.test(satz) || !/[.!?…:]["»“]?$/.test(satz)) return false;
  if (!/[a-zäöüß]/.test(satz) || /[<>={}|\\_#@`]|https?:|\.(js|html|mp3|png|svg)\b/.test(satz)) return false;
  return true;
}

// Die Daten der App, wie die Seiten sie laden.
let daten = null;
export function appDaten() {
  if (daten) return daten;
  const speicher = { getItem: () => null, setItem() {}, removeItem() {} };
  const fenster = {
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {}, location: { search: "", pathname: "/", hash: "" },
    localStorage: speicher, sessionStorage: speicher, navigator: {}, matchMedia: () => ({ matches: false, addEventListener() {} }),
  };
  fenster.window = fenster;
  const dokument = {
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], documentElement: { dataset: {}, classList: { add() {}, remove() {}, toggle() {} } },
    createElementNS: () => ({ setAttribute() {}, append() {}, appendChild() {}, style: {} }),
    createElement: () => ({ setAttribute() {}, append() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, toggle() {} } }),
  };
  const ctx = vm.createContext({ window: fenster, document: dokument, localStorage: speicher, navigator: {}, console, setTimeout, clearTimeout, performance });
  for (const datei of ["lesen-art.js", "lesen-inhalte.js", "lesen-buecher.js", "lesen-detektive.js", "lesen-wurm.js", "lesen-stand.js", "journey-plan.js", "train-progress.js"]) {
    vm.runInContext(lies(datei), ctx, { filename: datei });
  }
  const quellen = new Map();
  const quelle = (datei) => {
    if (!quellen.has(datei)) quellen.set(datei, lies(datei));
    return quellen.get(datei);
  };
  daten = {
    inhalte: fenster.LernappLeseInhalte,
    buecher: fenster.LernappLeseBuecher,
    detektive: fenster.LernappLeseDetektive,
    wurm: fenster.LernappLeseWurm,
    stand: fenster.LernappLeseStand,
    reise: fenster.LernappReise,
    train: fenster.LernappTrain,
    quelle,
    zeichenketten: (datei) => zeichenketten(quelle(datei)),
    LUECKE,
  };
  return daten;
}

// Die Regel-Dateien in scripts/stimme-app/.
const REGELN = path.join(WURZEL, "scripts", "stimme-app");
async function regeln() {
  if (!fs.existsSync(REGELN)) return [];
  const dateien = fs.readdirSync(REGELN).filter((f) => f.endsWith(".mjs")).sort();
  return Promise.all(dateien.map(async (f) => ({ datei: f, modul: await import(path.join(REGELN, f)) })));
}

// [{ text, wo, teil }] – jeder Satz einmal. Ein Satz, der fest im Code
// steht, gehört zu «fest».
export async function appTexte() {
  const d = appDaten();
  const liste = new Map();
  const RANG = { fest: 0, daten: 1, vorlagen: 2 };
  // optional: Der Code weiss sich ohne Aufnahme zu helfen («Wörter bauen»
  // spielt dann die Laute) – gilt nur, wenn jede Stelle es so sagt.
  const dazu = (text, teil, wo, optional = false) => {
    for (const satz of saetzeVon(sprechText(text))) {
      if (!satz || satz.includes(LUECKE)) continue;
      const alt = liste.get(satz);
      const eintrag = !alt || RANG[teil] < RANG[alt.teil] ? { text: satz, wo, teil } : alt;
      eintrag.optional = optional && (!alt || alt.optional === true);
      liste.set(satz, eintrag);
    }
  };
  for (const datei of sprechDateien()) {
    for (const { wert } of d.zeichenketten(datei)) {
      for (const satz of saetzeVon(sprechText(wert))) if (istSatz(satz)) dazu(satz, "fest", datei);
    }
  }
  for (const { datei, modul } of await regeln()) {
    const ergebnis = modul.default ? await modul.default(d) : [];
    for (const eintrag of ergebnis || []) {
      const text = typeof eintrag === "string" ? eintrag : eintrag?.text;
      if (!text) continue;
      const teil = typeof eintrag === "object" && eintrag.teil in RANG ? eintrag.teil : "vorlagen";
      dazu(text, teil, eintrag?.wo || datei, eintrag?.optional === true);
    }
  }
  return [...liste.values()];
}

// Was sich nicht vorher aufnehmen lässt (aus den NICHT der Regel-Dateien).
export async function nichtAufnehmbar() {
  return (await regeln()).flatMap(({ datei, modul }) => (modul.NICHT || []).map((n) => ({ ...n, regel: datei })));
}

export function verzeichnis() {
  const datei = path.join(WURZEL, VERZEICHNIS);
  if (!fs.existsSync(datei)) return null;
  const fenster = {};
  vm.runInContext(fs.readFileSync(datei, "utf8"), vm.createContext({ window: fenster }), { filename: VERZEICHNIS });
  return fenster.LernappStimmeDateien || {};
}

export function schreibeVerzeichnis(eintraege, { stimme = "" } = {}) {
  const zeilen = Object.entries(eintraege).map(([text, datei]) => `  ${JSON.stringify(text)}: ${JSON.stringify(datei)},`);
  const kopf = `/*
 * app-stimme.js – Was die App sagt, als Aufnahme mit einer Stimme von Google
 * (Chirp 3 HD${stimme ? `, ${stimme}` : ""}).
 *
 * Wie bau-stimme.js für die Bauecke, hier für alle Seiten mit kids.js: Gibt
 * es zu einem Satz eine Aufnahme, spielt kids.js sie (aufnahmeStuecke), sonst
 * spricht die Gerätestimme. Kommt nach lesen-stimme.js und ergänzt dessen
 * Verzeichnis; wo beide denselben Satz kennen, gilt dieser.
 * Welche Sätze dazugehören, steht in scripts/stimme-app-texte.mjs.
 *
 * Nicht von Hand ändern: scripts/stimme-google.mjs schreibt diese Datei.
 */
`;
  const inhalt = zeilen.length ? `{\n${zeilen.join("\n")}\n}` : "{}";
  fs.writeFileSync(path.join(WURZEL, VERZEICHNIS), `${kopf}window.LernappStimmeDateien = Object.assign(window.LernappStimmeDateien || {}, ${inhalt});\n`);
}
