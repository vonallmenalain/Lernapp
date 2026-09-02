/*
 * Sucht neue Level für Freie Fahrt – einmalig, nicht im Spiel.
 *
 * Warum nicht auf dem Gerät: zufällig gewürfelte Stellungen sind zuverlässig
 * leicht. In den Versuchen zu diesem Spiel lag praktisch jede zufällige Auslage
 * bei acht bis elf Zügen; ein Feld, das zwanzig oder dreissig braucht, kommt so
 * gut wie nie heraus. Wer auf Zufall wartet, wartet auf einem Kinderhandy
 * beliebig lange – und bekäme ein Level, das vorher niemand gesehen hat.
 *
 * Deshalb: hier suchen, prüfen, und das Ergebnis als Tabelle in freiefahrt.js
 * eintragen. Gesucht wird nicht blind, sondern bergauf – von einer zufälligen
 * Auslage aus wird immer wieder ein Wagen versetzt, neu gelöst, und die
 * Änderung behalten, wenn die Zugzahl nicht sinkt. Gleich gute Nachbarn werden
 * manchmal übernommen, sonst bliebe die Suche im ersten kleinen Hügel stecken.
 *
 * Gelöst wird mit dem Löser aus freiefahrt.js selbst – ein zweiter Löser hier
 * wäre eine zweite Meinung darüber, was ein Zug ist.
 *
 * Aufruf:  node scripts/generate-freiefahrt.mjs [stufe] [sekunden]
 *          node scripts/generate-freiefahrt.mjs schwer 120
 *
 * Heraus kommt ein Block, der sich unverändert in die Tabelle FELDER in
 * freiefahrt.js einsetzen lässt. Danach unbedingt
 * `node scripts/validate-freiefahrt.mjs` laufen lassen: erst dort wird jede
 * Zugzahl nachgerechnet und der Lösungsweg nachgespielt.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const windowStub = {};
vm.runInContext(fs.readFileSync(path.join(root, "freiefahrt.js"), "utf8"), vm.createContext({
  window: windowStub,
  document: { body: { dataset: { page: "keine" } }, querySelector: () => null, addEventListener() {} },
  console,
}));
const { N, TOR_REIHE, loesen } = windowStub.LernappFreieFahrt;

// Die Bänder aus der Aufgabenstellung: so viele Züge muss die kürzeste Lösung
// brauchen, damit ein Level unter diesem Namen in der Auswahl stehen darf.
const STUFEN = {
  leicht: { wagen: 9, lange: 2, band: [8, 12] },
  mittel: { wagen: 11, lange: 3, band: [13, 18] },
  schwer: { wagen: 12, lange: 4, band: [19, 26] },
  knifflig: { wagen: 13, lange: 4, band: [27, 40] },
};

const stufe = process.argv[2] || "leicht";
const sekunden = Number(process.argv[3] || 60);
const regel = STUFEN[stufe];
if (!regel) {
  console.error(`Unbekannte Stufe "${stufe}". Bekannt: ${Object.keys(STUFEN).join(", ")}`);
  process.exit(2);
}

const wuerfel = (n) => Math.floor(Math.random() * n);

// Passt die Auslage überhaupt? Zwei Wagen auf einem Feld gibt es nicht.
function belegt(wagen) {
  const raster = new Int8Array(N * N).fill(-1);
  for (let i = 0; i < wagen.length; i += 1) {
    const w = wagen[i];
    for (let k = 0; k < w.laenge; k += 1) {
      const reihe = w.richtung === "waagerecht" ? w.reihe : w.reihe + k;
      const spalte = w.richtung === "waagerecht" ? w.spalte + k : w.spalte;
      if (reihe >= N || spalte >= N || raster[reihe * N + spalte] !== -1) return null;
      raster[reihe * N + spalte] = i;
    }
  }
  return raster;
}

// Ein zweiter waagerechter Wagen in der Torreihe wäre entweder für immer im Weg
// oder blosse Deko – beides taugt nicht.
function erlaubt(w) {
  return !(w.richtung === "waagerecht" && w.reihe === TOR_REIHE);
}

function auslage() {
  const wagen = [{ id: "R", reihe: TOR_REIHE, spalte: wuerfel(3), laenge: 2, richtung: "waagerecht", lok: true }];
  let lange = regel.lange;
  for (let versuch = 0; versuch < 600 && wagen.length < regel.wagen; versuch += 1) {
    const laenge = lange > 0 && Math.random() < 0.45 ? 3 : 2;
    const richtung = Math.random() < 0.5 ? "waagerecht" : "senkrecht";
    const kandidat = {
      id: String(wagen.length),
      laenge,
      richtung,
      reihe: richtung === "waagerecht" ? wuerfel(N) : wuerfel(N - laenge + 1),
      spalte: richtung === "waagerecht" ? wuerfel(N - laenge + 1) : wuerfel(N),
    };
    if (!erlaubt(kandidat) || !belegt([...wagen, kandidat])) continue;
    wagen.push(kandidat);
    if (laenge === 3) lange -= 1;
  }
  return wagen.length === regel.wagen ? wagen : null;
}

// Ein Schritt bergauf: einen Wagen (nie die Lok) neu hinstellen, drehen oder
// verlängern.
function versetzen(wagen) {
  const kopie = wagen.map((w) => ({ ...w }));
  const w = kopie[1 + wuerfel(kopie.length - 1)];
  const art = wuerfel(3);
  if (art === 0) w.richtung = Math.random() < 0.5 ? "waagerecht" : "senkrecht";
  else if (art === 1) w.laenge = w.laenge === 2 ? 3 : 2;
  w.reihe = w.richtung === "waagerecht" ? wuerfel(N) : wuerfel(N - w.laenge + 1);
  w.spalte = w.richtung === "waagerecht" ? wuerfel(N - w.laenge + 1) : wuerfel(N);
  if (!erlaubt(w)) return null;
  if (kopie.filter((x) => x.laenge === 3).length > regel.lange) return null;
  return belegt(kopie) ? kopie : null;
}

// Ein volleres Feld, über mehr Reihen und Spalten verteilt, sieht nach Bahnhof
// aus statt nach einem Haufen in einer Ecke.
function schoenheit(wagen) {
  const reihen = new Set();
  const spalten = new Set();
  let felder = 0;
  wagen.forEach((w) => {
    felder += w.laenge;
    for (let k = 0; k < w.laenge; k += 1) {
      reihen.add(w.richtung === "waagerecht" ? w.reihe : w.reihe + k);
      spalten.add(w.richtung === "waagerecht" ? w.spalte + k : w.spalte);
    }
  });
  return reihen.size + spalten.size + felder / 4;
}

// Aus der Auslage die sechs Zeilen, wie sie in freiefahrt.js stehen. Die
// Buchstaben werden in Lesereihenfolge vergeben, damit sich das Feld im
// Quelltext von oben links nach unten rechts durchliest.
function alsFeld(wagen) {
  const zeilen = Array.from({ length: N }, () => Array(N).fill("."));
  let naechster = 0;
  [...wagen]
    .sort((a, b) => (a.reihe - b.reihe) || (a.spalte - b.spalte))
    .forEach((w) => {
      const zeichen = w.lok ? "R" : "ABCDEFGHIJKLMNOP"[naechster++];
      for (let k = 0; k < w.laenge; k += 1) {
        const reihe = w.richtung === "waagerecht" ? w.reihe : w.reihe + k;
        const spalte = w.richtung === "waagerecht" ? w.spalte + k : w.spalte;
        zeilen[reihe][spalte] = zeichen;
      }
    });
  return zeilen.map((zeile) => zeile.join(""));
}

// --- Suchen ------------------------------------------------------------------
const [unten, oben] = regel.band;
const fund = new Map();          // Zugzahl -> beste gefundene Auslage
const schluss = Date.now() + sekunden * 1000;
let anlaeufe = 0;

while (Date.now() < schluss) {
  let hier = auslage();
  if (!hier) continue;
  anlaeufe += 1;
  let zuege = loesen(hier);
  for (let schritt = 0; schritt < 8000 && Date.now() < schluss; schritt += 1) {
    const kandidat = versetzen(hier);
    if (!kandidat) continue;
    const gemessen = loesen(kandidat);
    if (gemessen < 0) continue;
    if (gemessen >= unten && gemessen <= oben) {
      const bisher = fund.get(gemessen);
      if (!bisher || schoenheit(kandidat) > schoenheit(bisher)) fund.set(gemessen, kandidat);
    }
    // Bergauf, und gleich hohe Nachbarn manchmal mitnehmen: sonst bleibt die
    // Suche in der ersten flachen Stelle liegen.
    if (gemessen > zuege || (gemessen === zuege && Math.random() < 0.35)) { hier = kandidat; zuege = gemessen; }
    if (zuege >= oben) break;
  }
}

const zahlen = [...fund.keys()].sort((a, b) => a - b);
if (!zahlen.length) {
  console.error(`Nichts im Band ${unten}–${oben} gefunden. Mehr Zeit geben: node scripts/generate-freiefahrt.mjs ${stufe} ${sekunden * 3}`);
  process.exit(1);
}

console.error(`${stufe}: ${anlaeufe} Anläufe, gefunden bei ${zahlen.join(", ")} Zügen.`);
zahlen.forEach((zuege) => {
  console.log(`    ["${stufe}", ${zuege}, [`);
  alsFeld(fund.get(zuege)).forEach((zeile) => console.log(`      "${zeile}",`));
  console.log("    ]],");
});
