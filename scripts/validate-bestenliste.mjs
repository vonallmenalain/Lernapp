/*
 * Prüft die Bestenliste (highscore.js).
 *
 * Eine Rangfolge ist schnell hingeschrieben und schwer richtig: Turmbau misst
 * Blöcke, Weichen-Wirrwarr Sterne, Arukone gelöste Level und gebrauchte Zeit.
 * Wer alle drei über einen Kamm schert, bekommt eine Liste, die nichts
 * bedeutet – und die Kinder in der Gruppe merken das als Erste.
 *
 * Geprüft wird:
 *   1. Jedes Spiel des Zugs hat eine Messart, und die Titel stimmen mit
 *      train-progress.js überein.
 *   2. Punkte-Spiele: die beste Runde gewinnt.
 *   3. Sterne-Spiele: die Sterne zusammen, und je Level die eigenen.
 *   4. Katalog-Spiele: gelöst schlägt ungelöst, und unter den Gelösten
 *      gewinnt die kürzere Zeit.
 *   5. Wer noch nichts gespielt hat, steht am Ende – aber er steht in der
 *      Liste.
 *   6. Gleichstand teilt den Platz.
 *   7. Die Auswertung für den Adminbereich zählt richtig zusammen, und wo
 *      eine Zahl nicht erhoben wird, steht null und nicht 0.
 *
 * Läuft ohne Browser: highscore.js und train-progress.js laufen in einer
 * Sandbox.
 *
 * Aufruf:  node scripts/validate-bestenliste.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }

// --- Sandbox ----------------------------------------------------------------
const store = new Map();
const elementStub = {
  style: { setProperty() {}, removeProperty() {} },
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  dataset: {},
  setAttribute() {}, removeAttribute() {}, append() {}, prepend() {}, remove() {},
  addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
};

const windowStub = { addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
const context = vm.createContext({
  window: windowStub,
  document: {
    body: { dataset: {}, classList: elementStub.classList, append() {} },
    documentElement: elementStub,
    createElement: () => ({ ...elementStub }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    readyState: "complete",
  },
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  },
  navigator: {},
  console,
  performance: { now: () => 0 },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  structuredClone: (value) => JSON.parse(JSON.stringify(value)),
});

for (const file of ["spatial-puzzles.js", "app.js", "train-progress.js", "highscore.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const hs = windowStub.LernappHighscore;
const train = windowStub.LernappTrain;
assert(hs, "highscore.js hat window.LernappHighscore nicht gesetzt");
assert(train, "train-progress.js hat window.LernappTrain nicht gesetzt");

// ============================================================================
// 1. Jedes Spiel des Zugs steht in der Liste, und die Titel stimmen überein
// ============================================================================
// Der Titel steht an zwei Stellen, weil train-progress.js nur auf dem
// Startbild läuft, der Adminbereich aber auf jeder Seite aufgeht. Zwei Stellen
// laufen auseinander, wenn niemand sie zusammenhält – das ist diese Prüfung.
const zugSpiele = train.AREAS.flatMap((bereich) => bereich.games.map((spiel) => ({ ...spiel, bereich: bereich.id })));

assert(zugSpiele.length === hs.SPIELE.length,
  `Der Zug kennt ${zugSpiele.length} Spiele, die Bestenliste ${hs.SPIELE.length}`);

for (const spiel of zugSpiele) {
  const eintrag = hs.spiel(spiel.id);
  assert(eintrag, `Spiel ${spiel.id} fehlt in highscore.js`);
  assert(eintrag.titel === spiel.title,
    `Spiel ${spiel.id}: der Zug nennt es "${spiel.title}", die Bestenliste "${eintrag.titel}"`);
  assert(eintrag.bereich === spiel.bereich,
    `Spiel ${spiel.id}: der Zug legt es in ${spiel.bereich}, die Bestenliste in ${eintrag.bereich}`);
  assert(["punkte", "sterne", "katalog"].includes(eintrag.art),
    `Spiel ${spiel.id}: unbekannte Messart ${eintrag.art}`);
  if (eintrag.art !== "katalog") {
    assert(eintrag.key, `Spiel ${spiel.id} misst sich an einem Kasten, nennt aber keinen Schlüssel`);
  }
}

// Und die Bereichsnamen: der Adminbereich stellt seine Auswertung danach
// zusammen, gezeichnet werden die Bereiche aber in train-progress.js.
for (const bereich of train.AREAS) {
  assert(hs.BEREICHE[bereich.id] === bereich.label,
    `Bereich ${bereich.id}: der Zug nennt ihn "${bereich.label}", die Bestenliste "${hs.BEREICHE[bereich.id]}"`);
}
assert(Object.keys(hs.BEREICHE).length === train.AREAS.length,
  "Die Bestenliste kennt andere Bereiche als der Zug");

// Der Schlüssel eines Spiels mit eigenem Konto muss derselbe sein, unter dem
// das Spiel wirklich speichert. Sonst zeigt die Bestenliste einen leeren
// Kasten und niemand merkt es – die Liste sähe nur aus, als hätte niemand
// gespielt.
const KASTEN_IN = {
  "lernapp.backpack": "rucksack.js",
  "lernapp.memory": "memory.js",
  "lernapp.beachtreasure": "strandschatz.js",
  "lernapp.kacheln": "kacheln.js",
  "lernapp.flanker": "schwarmfokus.js",
  "lernapp.trackrouter": "weichen.js",
  "lernapp.fischteich": "fischteich.js",
  "lernapp.freiefahrt": "freiefahrt.js",
  "lernapp.tiersprung.progress": "tiersprung.js",
  "lernapp.cardmatch": "kartenmerker.js",
  "lernapp.blaetter": "blaetter.js",
  "lernapp.turmbau": "turmbau.js",
  "lernapp.raumdetektiv": "app.js",
  "lernapp.wasfehlt": "wasfehlt.js",
  "lernapp.signal": "signal.js",
  "lernapp.doppelt": "doppelt.js",
  "lernapp.faesser": "faesser.js",
  "lernapp.zahlengleis": "zahlengleis.js",
};

for (const spiel of hs.SPIELE) {
  if (spiel.art === "katalog") continue;
  const datei = KASTEN_IN[spiel.key];
  assert(datei, `Für den Schlüssel ${spiel.key} (${spiel.id}) ist keine Datei bekannt`);
  const quelle = fs.readFileSync(path.join(root, datei), "utf8");
  assert(quelle.includes(spiel.key),
    `${datei} speichert nicht unter ${spiel.key} – die Bestenliste von ${spiel.id} bliebe leer`);
}

// ============================================================================
// 2. Punkte-Spiele: die beste Runde gewinnt
// ============================================================================
function konto(name, { eigen = false, gameState = {}, levels = [] } = {}) {
  return { id: name.toLowerCase(), name, eigen, gameState, levels };
}

function punkte(key, runs, scores) {
  return { [key]: { data: { runs, scores }, updatedAt: 1 } };
}

const TURM = "lernapp.turmbau";
const turmKonten = [
  konto("Mia", { gameState: punkte(TURM, 4, [12, 9, 7]) }),
  konto("Ben", { eigen: true, gameState: punkte(TURM, 9, [21, 18, 3]) }),
  konto("Lea"),
];

const turm = hs.liste("towerStack", turmKonten);
assert(turm[0].name === "Ben", `Turmbau: vorn steht ${turm[0].name}, erwartet Ben`);
assert(turm[0].text === "21 Blöcke", `Turmbau: Bestwert ist "${turm[0].text}", erwartet "21 Blöcke"`);
assert(turm[0].zusatz === "9 Runden", `Turmbau: Zusatz ist "${turm[0].zusatz}"`);
assert(turm[1].name === "Mia", "Turmbau: der zweite Platz stimmt nicht");
assert(turm[2].name === "Lea" && turm[2].leer, "Turmbau: wer nie gespielt hat, muss am Ende stehen");
assert(turm[2].platz === null, "Turmbau: wer nie gespielt hat, bekommt keinen Platz");
assert(turm[0].eigen === true, "Turmbau: das eigene Konto ist nicht als eigenes erkannt");
// Ein Kasten ohne Hülle – so, wie game-cloud.js ihn auf dem Gerät ablegt.
const ohneHuelle = hs.liste("towerStack", [konto("Solo", { gameState: { [TURM]: { runs: 2, scores: [30] } } })]);
assert(ohneHuelle[0].text === "30 Blöcke", "Ein Kasten ohne Hülle wird nicht verstanden");
// Punkte-Spiele kennen keine Level: eine Runde ist eine Runde.
assert(hs.level("towerStack", turmKonten).length === 0, "Turmbau hat keine Level, meldet aber welche");

// ============================================================================
// 3. Sterne-Spiele: zusammen und je Level
// ============================================================================
const WEICHEN = "lernapp.trackrouter";
function sterne(key, best) { return { [key]: { data: { best }, updatedAt: 1 } }; }

const weichenKonten = [
  konto("Mia", { gameState: sterne(WEICHEN, { 1: { stars: 3 }, 2: { stars: 1 } }) }),
  konto("Ben", { gameState: sterne(WEICHEN, { 1: { stars: 2 }, 2: { stars: 3 }, 3: { stars: 2 } }) }),
];

const gesamt = hs.liste("trackRouter", weichenKonten);
assert(gesamt[0].name === "Ben" && gesamt[0].text === "7 Sterne", `Weichen gesamt: ${gesamt[0].name} mit ${gesamt[0].text}`);
assert(gesamt[0].zusatz === "3 Level geschafft", `Weichen gesamt: Zusatz ist "${gesamt[0].zusatz}"`);
assert(gesamt[1].name === "Mia" && gesamt[1].text === "4 Sterne", "Weichen gesamt: der zweite Platz stimmt nicht");

const level1 = hs.liste("trackRouter", weichenKonten, "1");
assert(level1[0].name === "Mia" && level1[0].text === "3 Sterne", `Weichen Level 1: ${level1[0].name} mit ${level1[0].text}`);
const level3 = hs.liste("trackRouter", weichenKonten, "3");
assert(level3[0].name === "Ben", "Weichen Level 3: Ben hat es als Einziger geschafft");
assert(level3[1].leer, "Weichen Level 3: wer es nicht geschafft hat, muss als leer gelten");

const weichenLevel = hs.level("trackRouter", weichenKonten);
assert(weichenLevel.map((eintrag) => eintrag.id).join(",") === "1,2,3", "Die Level stehen nicht in der Reihenfolge 1,2,3");
assert(weichenLevel[0].label === "Level 1", `Das erste Level heisst "${weichenLevel[0].label}"`);

// Memory zählt Kartenzahlen statt Level – "16 Karten" statt "Level 16".
const memoryLevel = hs.level("memory", [konto("Mia", { gameState: sterne("lernapp.memory", { 8: { stars: 3 }, 16: { stars: 3 } }) })]);
assert(memoryLevel[0].label === "8 Karten", `Memory nennt sein erstes Level "${memoryLevel[0].label}"`);

// ============================================================================
// 4. Katalog-Spiele: gelöst schlägt ungelöst, dann zählt die Zeit
// ============================================================================
function stufe(game, levelId, felder = {}) {
  return { id: `${game}_${levelId}`, game, levelId, levelName: `Rätsel ${levelId}`, difficulty: "easy", ...felder };
}

const arukoneKonten = [
  konto("Mia", { levels: [
    stufe("arukone", "a1", { solved: true, timeSeconds: 90, moves: 30, resets: 1, attempts: 2 }),
    stufe("arukone", "a2", { solved: true, timeSeconds: 60, moves: 20, resets: 0, attempts: 1 }),
  ] }),
  konto("Ben", { levels: [
    stufe("arukone", "a1", { solved: true, timeSeconds: 40, moves: 25, resets: 3, attempts: 4 }),
  ] }),
  konto("Lea", { levels: [
    stufe("arukone", "a1", { solved: false, attempts: 5, resets: 2, timeSeconds: 200 }),
  ] }),
];

const arukone = hs.liste("arukone", arukoneKonten);
assert(arukone[0].name === "Mia" && arukone[0].text === "2 Level gelöst", `Arukone gesamt: ${arukone[0].name} mit ${arukone[0].text}`);
assert(arukone[1].name === "Ben", "Arukone gesamt: Ben muss auf Platz 2 stehen");
assert(arukone[2].name === "Lea" && arukone[2].leer, "Arukone gesamt: wer nichts gelöst hat, steht am Ende");

const a1 = hs.liste("arukone", arukoneKonten, "a1");
assert(a1[0].name === "Ben", `Arukone a1: vorn steht ${a1[0].name} – die kürzere Zeit gewinnt`);
assert(a1[0].text === "40 s", `Arukone a1: der Bestwert ist "${a1[0].text}"`);
assert(a1[1].name === "Mia", "Arukone a1: Mia muss auf Platz 2 stehen");
assert(a1[2].name === "Lea" && a1[2].text === "noch offen", `Arukone a1: Lea steht mit "${a1[2].text}" da`);
assert(a1[2].zusatz === "5 Versuche", `Arukone a1: Leas Zusatz ist "${a1[2].zusatz}"`);
// Wer es versucht hat, hat es angefasst: das ist kein leerer Eintrag mehr.
assert(a1[2].leer === false, "Arukone a1: fünf Versuche sind nicht nichts");

const arukoneLevel = hs.level("arukone", arukoneKonten);
assert(arukoneLevel.length === 2, `Arukone kennt ${arukoneLevel.length} gespielte Level, erwartet 2`);
assert(arukoneLevel[0].label === "Rätsel a1", `Das erste Level heisst "${arukoneLevel[0].label}"`);

// ============================================================================
// 5. Gleichstand teilt den Platz
// ============================================================================
const gleich = hs.liste("towerStack", [
  konto("Ann", { gameState: punkte(TURM, 3, [10]) }),
  konto("Bo", { gameState: punkte(TURM, 3, [10]) }),
  konto("Cid", { gameState: punkte(TURM, 3, [4]) }),
]);
assert(gleich[0].platz === 1 && gleich[1].platz === 1,
  `Gleichstand: die Plätze sind ${gleich[0].platz} und ${gleich[1].platz}, erwartet 1 und 1`);
assert(gleich[2].platz === 3, `Gleichstand: der nächste steht auf Platz ${gleich[2].platz}, erwartet 3`);

// ============================================================================
// 6. Die Auswertung für den Adminbereich
// ============================================================================
const turmZahlen = hs.auswertung("towerStack", turmKonten);
assert(turmZahlen.gespielt === 13, `Turmbau: ${turmZahlen.gespielt} Runden gezählt, erwartet 13`);
assert(turmZahlen.abgeschlossen === 13, "Turmbau: eine gezählte Runde ist eine beendete Runde");
assert(turmZahlen.neugestartet === null,
  "Turmbau kennt keine Neustarts – dort muss null stehen und nicht 0, sonst liest sich „nicht gezählt“ wie „keinmal“");
assert(turmZahlen.spieler === 2, `Turmbau: ${turmZahlen.spieler} Spieler gezählt, erwartet 2`);
assert(turmZahlen.bestwertVon === "Ben", `Turmbau: den Bestwert hält ${turmZahlen.bestwertVon}`);

const arukoneZahlen = hs.auswertung("arukone", arukoneKonten);
assert(arukoneZahlen.gespielt === 12, `Arukone: ${arukoneZahlen.gespielt} Versuche gezählt, erwartet 12`);
assert(arukoneZahlen.abgeschlossen === 3, `Arukone: ${arukoneZahlen.abgeschlossen} gelöste Level gezählt, erwartet 3`);
assert(arukoneZahlen.neugestartet === 6, `Arukone: ${arukoneZahlen.neugestartet} Neustarts gezählt, erwartet 6`);
assert(arukoneZahlen.zeit === 390, `Arukone: ${arukoneZahlen.zeit} Sekunden gezählt, erwartet 390`);

const weichenZahlen = hs.auswertung("trackRouter", weichenKonten);
assert(weichenZahlen.abgeschlossen === 5, `Weichen: ${weichenZahlen.abgeschlossen} geschaffte Level, erwartet 5`);

// Ein Spiel, das noch niemand angefasst hat, darf nicht in Fehler laufen.
const leer = hs.auswertung("fishPond", [konto("Nie")]);
assert(leer.spieler === 0 && leer.bestwert === "", "Ein Spiel ohne Spieler meldet trotzdem einen Bestwert");

// Alle Spiele auf einmal – die Übersicht im Adminbereich.
const alle = hs.alleAuswertungen(arukoneKonten);
assert(alle.length === hs.SPIELE.length, "Die Übersicht lässt Spiele aus");
assert(alle.every((eintrag) => eintrag.bereich), "In der Übersicht fehlt der Bereich");

console.log(`Bestenliste geprüft: ${hs.SPIELE.length} Spiele, drei Messarten, geteilte Plätze und die Auswertung.`);
