/*
 * Prüft Freie Fahrt aus freiefahrt.js, ohne Browser.
 *
 * Die Zahl, die dem Kind als Bestmarke angezeigt wird ("3 von 8"), ist das
 * Herz des Spiels: sie sagt, wie kurz die kürzeste Lösung ist, und daran hängt
 * die Sternbewertung. Eine geschätzte Zahl wäre dort schlimmer als gar keine.
 * Deshalb rechnet dieses Skript jedes ausgelieferte Level neu durch – mit
 * demselben Löser, mit dem die App spielt – und vergleicht.
 *
 * Zusätzlich laufen die drei Level aus der Aufgabenstellung mit: sie sind
 * unabhängig entstanden und mit 8, 8 und 14 Zügen belegt. Wenn der Löser die
 * trifft, misst er dasselbe wie die Vorlage – und nicht bloss sich selbst.
 *
 * Aufruf:  node scripts/validate-freiefahrt.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "freiefahrt.js"), "utf8");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// Die Datei meldet ihren Löser und ihre Level an window an, bevor sie nach der
// Seite fragt. Eine fremde Seite reicht also – der ganze Spielteil bleibt aus.
const windowStub = {};
const context = vm.createContext({
  window: windowStub,
  document: { body: { dataset: { page: "keine" } }, querySelector: () => null, addEventListener() {} },
  console,
});
vm.runInContext(source, context);

const api = windowStub.LernappFreieFahrt;
assert(api, "freiefahrt.js hat window.LernappFreieFahrt nicht gesetzt");
const { N, TOR_REIHE, LEVELS, STUFEN, LEVELS_FOR_DONE, leseFeld, suche, starsFor } = api;

/*
 * Spielt einen Lösungsweg Zug für Zug auf dem Brett nach und prüft dabei jede
 * einzelne Bewegung: bleibt der Wagen auf seiner Achse, bleibt er im Feld,
 * fährt er durch keinen anderen hindurch, bewegt er sich überhaupt? Am Schluss
 * muss die Lok im Tor stehen.
 *
 * Ohne dieses Nachspielen prüfte die Zahl sich selbst: sie käme aus derselben
 * Suche, die sie belegen soll. So belegt sie eine zweite, unabhängige Rechnung.
 */
function nachspielen(wagen, weg, wo) {
  const stand = wagen.map((w) => ({ ...w }));
  const achse = (w) => (w.richtung === "waagerecht" ? w.spalte : w.reihe);

  const belegung = () => {
    const raster = new Map();
    stand.forEach((w) => {
      for (let k = 0; k < w.laenge; k += 1) {
        const reihe = w.richtung === "waagerecht" ? w.reihe : w.reihe + k;
        const spalte = w.richtung === "waagerecht" ? w.spalte + k : w.spalte;
        raster.set(`${reihe},${spalte}`, w.id);
      }
    });
    return raster;
  };

  weg.forEach((zug, nummer) => {
    const w = stand.find((eintrag) => eintrag.id === zug.wagen);
    assert(w, `${wo}, Zug ${nummer + 1}: Wagen ${zug.wagen} gibt es nicht`);
    const von = achse(w);
    assert(zug.ziel !== von, `${wo}, Zug ${nummer + 1}: Wagen ${w.id} bewegt sich nicht`);
    assert(zug.ziel >= 0 && zug.ziel + w.laenge <= N, `${wo}, Zug ${nummer + 1}: Wagen ${w.id} fährt aus dem Feld`);

    // Jedes Feld auf der Strecke muss frei sein – die eigenen ausgenommen.
    const raster = belegung();
    const schritt = zug.ziel > von ? 1 : -1;
    for (let pos = von + schritt; schritt > 0 ? pos <= zug.ziel : pos >= zug.ziel; pos += schritt) {
      const kante = schritt > 0 ? pos + w.laenge - 1 : pos;
      const reihe = w.richtung === "waagerecht" ? w.reihe : kante;
      const spalte = w.richtung === "waagerecht" ? kante : w.spalte;
      const drauf = raster.get(`${reihe},${spalte}`);
      assert(!drauf || drauf === w.id, `${wo}, Zug ${nummer + 1}: Wagen ${w.id} fährt durch ${drauf} hindurch`);
    }

    if (w.richtung === "waagerecht") w.spalte = zug.ziel; else w.reihe = zug.ziel;
  });

  const lok = stand.find((w) => w.lok);
  assert(lok.spalte + lok.laenge === N, `${wo}: nach ${weg.length} Zügen steht die Lok nicht im Tor`);
}

// --- Der Löser gegen fremde Vorlagen ----------------------------------------
// Aus der Aufgabenstellung, unabhängig von dieser App erzeugt und dort Zug für
// Zug nachgespielt. Dieselbe Stellung, dieselbe Mindestzugzahl.
const VORLAGEN = [
  ["leicht_A", 8, [
    ".DB...",
    ".DB..C",
    "RRB..C",
    ".AAA.C",
    "......",
    "......",
  ]],
  ["leicht_B", 8, [
    "..E.D.",
    "..E.D.",
    "RR..D.",
    ".A....",
    ".AC.BB",
    "..C...",
  ]],
  ["mittel_A", 14, [
    ".FFF..",
    "......",
    "RRGDA.",
    "..GDA.",
    ".CBEE.",
    ".CB...",
  ]],
];

VORLAGEN.forEach(([name, soll, feld]) => {
  const wagen = leseFeld(feld);
  const { zuege, weg } = suche(wagen);
  assert(zuege === soll, `Vorlage ${name}: Löser sagt ${zuege} Züge statt ${soll}`);
  assert(weg.length === soll, `Vorlage ${name}: der Weg hat ${weg.length} Züge statt ${soll}`);
  nachspielen(wagen, weg, `Vorlage ${name}`);
});

// --- Die Stufen --------------------------------------------------------------
// Die Bänder aus der Aufgabenstellung. Ein Level, das aus seinem Band fällt,
// stünde unter dem falschen Namen in der Auswahl.
const BAENDER = {
  leicht: [8, 12],
  mittel: [13, 18],
  schwer: [19, 26],
  knifflig: [27, 40],
};

assert(STUFEN.length === 4, `erwartet 4 Stufen, gefunden ${STUFEN.length}`);
STUFEN.forEach((stufe) => {
  assert(BAENDER[stufe.id], `unbekannte Stufe "${stufe.id}"`);
  assert(stufe.label && stufe.farbe, `Stufe ${stufe.id}: Name oder Farbe fehlt`);
});
const farben = STUFEN.map((s) => s.farbe);
assert(new Set(farben).size === farben.length, "zwei Stufen haben dieselbe Farbe");

// --- Jedes Level -------------------------------------------------------------
assert(LEVELS.length >= 12, `erwartet mindestens 12 Level, gefunden ${LEVELS.length}`);

const gesehen = new Set();
LEVELS.forEach((level) => {
  const wo = `Level ${level.nr} (${level.stufe} ${level.platz})`;

  // Das Feld: sechs Zeilen zu sechs Zeichen.
  assert(Array.isArray(level.feld) && level.feld.length === N, `${wo}: ${level.feld?.length} Zeilen statt ${N}`);
  level.feld.forEach((zeile, i) => {
    assert(typeof zeile === "string" && zeile.length === N, `${wo}, Zeile ${i + 1}: "${zeile}" hat nicht ${N} Zeichen`);
  });

  const schluessel = level.feld.join("/");
  assert(!gesehen.has(schluessel), `${wo}: dieselbe Stellung gibt es schon`);
  gesehen.add(schluessel);

  const wagen = leseFeld(level.feld);

  // Jeder Wagen muss ein Wagen sein: gerade, lückenlos, zwei oder drei Felder.
  const belegt = new Set();
  wagen.forEach((w) => {
    assert(w.laenge === 2 || w.laenge === 3, `${wo}: Wagen ${w.id} ist ${w.laenge} Felder lang`);
    for (let k = 0; k < w.laenge; k += 1) {
      const reihe = w.richtung === "waagerecht" ? w.reihe : w.reihe + k;
      const spalte = w.richtung === "waagerecht" ? w.spalte + k : w.spalte;
      assert(reihe < N && spalte < N, `${wo}: Wagen ${w.id} ragt über das Feld hinaus`);
      const feld = `${reihe},${spalte}`;
      assert(!belegt.has(feld), `${wo}: zwei Wagen auf Feld ${feld}`);
      belegt.add(feld);
      // Lückenlos: das Zeichen muss auf jedem Feld der Strecke stehen.
      assert(level.feld[reihe][spalte] === w.id, `${wo}: Wagen ${w.id} hat eine Lücke oder einen Knick`);
    }
  });

  // Die Lok: genau eine, waagerecht, zwei Felder, in der Torreihe – und noch
  // nicht draussen.
  const loks = wagen.filter((w) => w.lok);
  assert(loks.length === 1, `${wo}: ${loks.length} rote Loks`);
  const lok = loks[0];
  assert(lok.richtung === "waagerecht", `${wo}: die Lok steht hochkant und käme nie zum Tor`);
  assert(lok.laenge === 2, `${wo}: die Lok ist ${lok.laenge} Felder lang`);
  assert(lok.reihe === TOR_REIHE, `${wo}: die Lok steht in Reihe ${lok.reihe}, das Tor ist in Reihe ${TOR_REIHE}`);
  assert(lok.spalte + lok.laenge < N, `${wo}: die Lok steht schon im Tor`);

  // Kein zweiter waagerechter Wagen in der Torreihe: rechts von der Lok stünde
  // er für immer im Weg, links wäre er nur Beiwerk.
  wagen.filter((w) => !w.lok && w.richtung === "waagerecht" && w.reihe === TOR_REIHE)
    .forEach((w) => fail(`${wo}: Wagen ${w.id} liegt quer in der Torreihe`));

  // Und der Kern: die Mindestzugzahl wird nachgerechnet, nicht geglaubt – und
  // der gefundene Weg wird Zug für Zug nachgespielt.
  const { zuege: gemessen, weg } = suche(wagen);
  assert(gemessen > 0, `${wo}: nicht lösbar`);
  assert(gemessen === level.zuege, `${wo}: gerechnet ${gemessen} Züge, in der Tabelle stehen ${level.zuege}`);
  assert(weg.length === gemessen, `${wo}: der Weg hat ${weg.length} Züge, gerechnet wurden ${gemessen}`);
  nachspielen(wagen, weg, wo);

  const [min, max] = BAENDER[level.stufe];
  assert(gemessen >= min && gemessen <= max,
    `${wo}: ${gemessen} Züge passen nicht ins Band ${min}–${max} der Stufe ${level.stufe}`);
});

// Je Stufe mindestens drei Level, und innerhalb einer Stufe wird es schwerer.
STUFEN.forEach((stufe) => {
  const eigene = LEVELS.filter((level) => level.stufe === stufe.id);
  assert(eigene.length >= 3, `Stufe ${stufe.id} hat nur ${eigene.length} Level`);
  eigene.forEach((level, index) => {
    assert(level.platz === index + 1, `Stufe ${stufe.id}: Level an Platz ${index + 1} nennt sich ${level.platz}`);
    if (index === 0) return;
    assert(level.zuege > eigene[index - 1].zuege,
      `Stufe ${stufe.id}: Level ${level.platz} ist mit ${level.zuege} Zügen nicht schwerer als das davor`);
  });
});

// Und über die Stufen hinweg: das leichteste Level einer Stufe ist schwerer als
// das schwerste der Stufe davor.
STUFEN.slice(1).forEach((stufe, index) => {
  const vorher = LEVELS.filter((level) => level.stufe === STUFEN[index].id);
  const jetzt = LEVELS.filter((level) => level.stufe === stufe.id);
  assert(Math.min(...jetzt.map((l) => l.zuege)) > Math.max(...vorher.map((l) => l.zuege)),
    `Stufe ${stufe.id} fängt nicht über der Stufe ${STUFEN[index].id} an`);
});

// --- Die Sternregel ----------------------------------------------------------
// Die kürzeste Lösung gibt drei Sterne, und weniger als einen gibt es nie.
assert(starsFor(8, 8) === 3, "die kürzeste Lösung muss drei Sterne geben");
assert(starsFor(7, 8) === 3, "unter der Bestmarke – auch drei Sterne");
assert(starsFor(11, 8) === 2, "8 + 3 Züge müssen noch zwei Sterne geben");
assert(starsFor(12, 8) === 1, "deutlich darüber gibt einen Stern");
assert(starsFor(40, 30) === 2, "bei 30 nötigen Zügen müssen 40 noch zwei Sterne geben");
assert(starsFor(41, 30) === 1, "und 41 einen");
LEVELS.forEach((level) => {
  assert(starsFor(level.zuege, level.zuege) === 3, `Level ${level.nr}: die eigene Bestmarke gibt keine drei Sterne`);
  assert(starsFor(level.zuege * 5, level.zuege) === 1, `Level ${level.nr}: geschafft muss mindestens einen Stern geben`);
});

assert(LEVELS_FOR_DONE === 5, `erwartet 5 Level bis zum fertigen Wagen, gefunden ${LEVELS_FOR_DONE}`);
assert(LEVELS.length >= LEVELS_FOR_DONE, "es gibt weniger Level, als für den Wagen nötig sind");

const bereiche = STUFEN.map((stufe) => {
  const eigene = LEVELS.filter((level) => level.stufe === stufe.id);
  return `${stufe.label} ${Math.min(...eigene.map((l) => l.zuege))}–${Math.max(...eigene.map((l) => l.zuege))}`;
}).join(", ");
console.log(`Freie Fahrt geprüft: ${LEVELS.length} Level nachgerechnet (${bereiche}), drei fremde Vorlagen getroffen.`);
