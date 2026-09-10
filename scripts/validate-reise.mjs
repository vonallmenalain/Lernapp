/*
 * Prüft den Fahrplan der Reise (journey-plan.js):
 * Hat jede Karte zehn Stationen, jeden Bereich zweimal, nie denselben Bereich
 * hintereinander und kein Spiel zweimal? Sind Station 4 und 8 Wahlstationen,
 * ist Station 10 ein Rätsel und verlangen die ersten beiden nichts zu lesen?
 * Zeigt jeder Auftrag auf ein Level, das es gibt, und kommt jedes der 25
 * Spiele mindestens zweimal dran? Und stimmen die Drei-Sterne-Schwellen mit
 * train-progress.js überein, die Titel mit highscore.js?
 *
 * Läuft ohne Browser: journey-plan.js braucht nur window und localStorage.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

function load(files, extra = {}) {
  const store = new Map();
  const windowStub = { ...extra };
  const context = vm.createContext({
    window: windowStub,
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    },
    document: { createElementNS: () => ({ setAttribute() {}, append() {} }), dispatchEvent() {}, addEventListener() {} },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    console,
  });
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return windowStub;
}

const win = load(["journey-plan.js"]);
const reise = win.LernappReise;
assert(reise, "journey-plan.js hat window.LernappReise nicht gesetzt");

const { MAPS, GAMES, STATIONS_PER_MAP, STATION_COUNT, LOCKS } = reise;
const AREAS = ["gedaechtnis", "konzentration", "geschwindigkeit", "problemloesen", "zahlbuchstabe"];
const READING = new Set(["letterPuzzle", "readingPuzzle", "kakuro"]);
const WORLDS = ["easy", "medium", "hard", "extreme"];

// --- Die Spiele -------------------------------------------------------------
assert(Object.keys(GAMES).length === 25, `erwartet 25 Spiele, gefunden ${Object.keys(GAMES).length}`);
for (const [id, game] of Object.entries(GAMES)) {
  assert(AREAS.includes(game.area), `${id}: unbekannter Bereich ${game.area}`);
  assert(fs.existsSync(path.join(root, game.page)), `${id}: Seite ${game.page} fehlt`);
  assert(["score", "level", "size", "catalog"].includes(game.kind), `${id}: unbekannte Art ${game.kind}`);
  if (game.kind === "score") assert(Number.isFinite(game.gut) && game.gut >= 3 && game.einheit, `${id}: gut oder Einheit fehlt`);
  assert(typeof game.auftrag === "function" && game.auftrag(5).length > 5, `${id}: kein Auftragssatz`);
}

// Die Titel aus highscore.js, die Schwellen aus train-progress.js: beide
// Dateien laufen sonst nie zusammen mit dem Fahrplan, also hier.
const hs = load(["highscore.js"]).LernappHighscore;
if (hs?.SPIELE) {
  for (const spiel of hs.SPIELE) {
    assert(GAMES[spiel.id], `${spiel.id} steht in highscore.js, aber nicht im Fahrplan`);
    assert(GAMES[spiel.id].title === spiel.titel, `${spiel.id}: Titel "${GAMES[spiel.id].title}" ≠ "${spiel.titel}" (highscore.js)`);
    assert(GAMES[spiel.id].area === spiel.bereich, `${spiel.id}: Bereich passt nicht zu highscore.js`);
  }
}
const progressWin = load(["train-progress.js"], {
  LernappGameCloud: { register: () => ({ onChange() {} }), mergeLevels() {}, mergeScores: () => () => ({}) },
  LernappLevelCatalog: {},
});
const train = progressWin.LernappTrain;
if (train) {
  // Die Drei-Sterne-Schwelle steckt in runsProgress; sie lässt sich ablesen,
  // indem man eine Runde mit genau so vielen Punkten bewerten lässt.
  const source = fs.readFileSync(path.join(root, "train-progress.js"), "utf8");
  for (const [id, game] of Object.entries(GAMES)) {
    if (game.kind !== "score") continue;
    const match = source.match(new RegExp(`${id}: runsProgress\\([A-Z_]+, (\\d+)\\)`));
    assert(match, `${id}: keine runsProgress-Schwelle in train-progress.js gefunden`);
    assert(Number(match[1]) === game.gut, `${id}: gut ${game.gut} ≠ ${match[1]} in train-progress.js`);
  }
  for (const area of train.AREAS) {
    for (const game of area.games) {
      assert(GAMES[game.id], `${game.id} fehlt im Fahrplan`);
      assert(GAMES[game.id].page === game.page, `${game.id}: Seite ${GAMES[game.id].page} ≠ ${game.page}`);
    }
  }
}

// --- Wie viele Level es gibt: aus den Spieldateien gelesen -------------------
function count(file, pattern) {
  return (fs.readFileSync(path.join(root, file), "utf8").match(pattern) || []).length;
}
const LEVEL_MAX = {
  trackRouter: count("weichen.js", /\{ nr: \d+, farben:/g),
  craneStack: count("faesser.js", /\{ nr: \d+, n: \d/g),
  gridlock: count("freiefahrt.js", /^\s+\["(leicht|mittel|schwer|knifflig)", \d+, \[/gm),
  tiersprung: count("tiersprung.js", /\{ animal: "/g),
};
assert(LEVEL_MAX.trackRouter === 10 && LEVEL_MAX.craneStack === 10 && LEVEL_MAX.gridlock === 12 && LEVEL_MAX.tiersprung === 10,
  `Levelzahlen unerwartet: ${JSON.stringify(LEVEL_MAX)}`);
const MEMORY_SIZES = [8, 12, 16, 20, 24];
const CATALOG_PER_WORLD = { spatialPuzzle: 1 };

// --- Die Karten ---------------------------------------------------------------
assert(MAPS.length === 6, `erwartet sechs Karten, gefunden ${MAPS.length}`);
assert(STATION_COUNT === 60 && STATIONS_PER_MAP === 10, "erwartet 60 Stationen zu je 10");
const appearances = new Map(Object.keys(GAMES).map((id) => [id, 0]));
const rewards = new Set();
let lastFactor = 0;

function checkSpec(spec, where, mapIndex) {
  const game = GAMES[spec.game];
  assert(game, `${where}: unbekanntes Spiel ${spec.game}`);
  if (game.kind === "level") {
    assert(Number.isInteger(spec.level) && spec.level >= 1 && spec.level <= LEVEL_MAX[spec.game], `${where}: Level ${spec.level} gibt es bei ${spec.game} nicht`);
  } else if (game.kind === "size") {
    assert(MEMORY_SIZES.includes(spec.size), `${where}: Kartenzahl ${spec.size} gibt es nicht`);
  } else if (game.kind === "catalog") {
    assert(WORLDS.includes(spec.world), `${where}: unbekannte Welt ${spec.world}`);
    const perWorld = CATALOG_PER_WORLD[spec.game] || 10;
    assert(Number.isInteger(spec.pos) && spec.pos >= 1 && spec.pos <= perWorld, `${where}: Level ${spec.pos} gibt es in Welt ${spec.world} nicht`);
    // Die Welten steigen mit den Karten: Weltall gehört Reise 2.
    assert(spec.world !== "extreme", `${where}: Weltall-Level gehören noch nicht in die Reise`);
    assert(!(mapIndex < 2 && spec.world !== "easy"), `${where}: auf den ersten beiden Karten nur Wiese-Level`);
    assert(!(mapIndex < 4 && spec.world === "hard"), `${where}: Meer-Level erst ab Karte 5`);
  } else {
    assert(!("level" in spec) && !("size" in spec), `${where}: ein Runden-Spiel braucht kein Level`);
  }
  return game;
}

MAPS.forEach((map, mapIndex) => {
  const where = `Karte ${map.nr} (${map.id})`;
  assert(map.stations.length === STATIONS_PER_MAP, `${where}: ${map.stations.length} Stationen statt ${STATIONS_PER_MAP}`);
  assert(map.factor > lastFactor && map.factor <= 1, `${where}: Faktor ${map.factor} steigt nicht`);
  lastFactor = map.factor;
  assert(map.reward?.id && map.reward.label && map.reward.part, `${where}: Belohnung unvollständig`);
  assert(!rewards.has(map.reward.id), `${where}: Belohnung ${map.reward.id} doppelt`);
  rewards.add(map.reward.id);
  assert(typeof map.landmark === "string" && map.landmark, `${where}: kein Wahrzeichen`);
  assert(typeof map.scene === "string" && map.scene, `${where}: keine Landschaft`);

  const perArea = Object.fromEntries(AREAS.map((a) => [a, 0]));
  const gamesOnMap = new Set();
  let previousArea = null;
  map.stations.forEach((station, index) => {
    const at = `${where}, Station ${index + 1}`;
    assert(AREAS.includes(station.area), `${at}: unbekannter Bereich ${station.area}`);
    perArea[station.area] += 1;
    assert(station.area !== previousArea, `${at}: zweimal hintereinander ${station.area}`);
    previousArea = station.area;

    const specs = station.choice ? station.choice : [station];
    const isChoice = index === 3 || index === 7;
    assert(Boolean(station.choice) === isChoice, `${at}: ${isChoice ? "muss" : "darf keine"} Wahlstation ${isChoice ? "sein" : "sein"}`);
    if (station.choice) assert(station.choice.length === 2, `${at}: eine Wahlstation hat zwei Spiele`);
    specs.forEach((spec) => {
      const game = checkSpec(spec, at, mapIndex);
      assert(game.area === station.area, `${at}: ${spec.game} gehört nicht zu ${station.area}`);
      assert(!gamesOnMap.has(spec.game), `${at}: ${spec.game} kommt auf dieser Karte zweimal vor`);
      gamesOnMap.add(spec.game);
      appearances.set(spec.game, appearances.get(spec.game) + 1);
      if (index < 2) assert(!READING.has(spec.game), `${at}: ${spec.game} verlangt Lesen – nicht an den ersten beiden Stationen`);
      if (index === 9) {
        assert(station.goal === true, `${at}: der Ziel-Bahnhof muss goal tragen`);
        assert(game.kind !== "score", `${at}: am Ziel-Bahnhof wartet ein Rätsel, kein Tempospiel`);
      } else {
        assert(!station.goal, `${at}: nur die letzte Station ist der Ziel-Bahnhof`);
      }
    });
  });
  for (const area of AREAS) assert(perArea[area] === 2, `${where}: ${area} kommt ${perArea[area]}× vor statt 2×`);

  // Das Ausweichgleis: je Bereich ein Spiel desselben Bereichs, das nicht
  // schon als Hauptspiel an einer Station dieser Karte steht.
  for (const area of AREAS) {
    const alt = map.alt?.[area];
    assert(alt, `${where}: kein Ausweichgleis für ${area}`);
    const game = checkSpec(alt, `${where}, Ausweichgleis ${area}`, mapIndex);
    assert(game.area === area, `${where}: Ausweichgleis ${alt.game} gehört nicht zu ${area}`);
    map.stations.forEach((station, index) => {
      if (station.area !== area || station.choice) return;
      assert(station.game !== alt.game, `${where}, Station ${index + 1}: das Ausweichgleis ist dasselbe Spiel`);
    });
  }
});

for (const [id, n] of appearances) assert(n >= 2, `${id} kommt nur ${n}× vor – jedes Spiel mindestens zweimal`);

// --- Aufträge rechnen ---------------------------------------------------------
for (let nr = 1; nr <= STATION_COUNT; nr += 1) {
  const task = reise.taskFor(nr);
  assert(task, `Station ${nr}: kein Auftrag`);
  const tasks = task.choice ? task.choice : [task];
  for (const t of tasks) {
    assert(t.page && t.title && t.speech && t.label, `Station ${nr}: Auftrag unvollständig`);
    if (t.kind === "score") assert(t.target >= 3 && t.target <= t.gut, `Station ${nr}: Ziel ${t.target} ausserhalb 3…${t.gut}`);
  }
  const alt = reise.altTaskFor(nr);
  assert(alt && alt.viaAlt, `Station ${nr}: kein Ausweichgleis`);
  if (alt.kind === "score") {
    const main = tasks.find((t) => t.kind === "score");
    if (main && main.game === alt.game) assert(alt.target <= main.target, `Station ${nr}: das Ausweichgleis ist schwerer`);
  }
}
// Die Rechnung aus dem Konzept: Fischteich auf der Wiese fünf Fische, in der
// Nacht vierzehn.
assert(reise.taskFor(4, { game: "fishPond" }).target === 5, "Fischteich auf der Wiese muss 5 Fische verlangen");
assert(reise.taskFor(1).target === 3 && reise.taskFor(3).target === 15, "Wiese: Was fehlt? 3, Wo hält der Zug? 15");
assert(reise.taskFor(51).target === 8, "Nacht: Was fehlt? verlangt die ganze Schwelle");

// --- Belohnungen und Schlösser ----------------------------------------------------
for (const [part, entries] of Object.entries(LOCKS)) {
  for (const [value, id] of Object.entries(entries)) {
    assert(rewards.has(id), `LOCKS ${part}.${value}: Belohnung ${id} gibt es auf keiner Karte`);
  }
}
const artWin = load(["train-art.js"]);
const art = artWin.LernappTrainArt;
if (art) {
  assert(art.FLAG_PATTERNS.includes("rainbow") && art.FLAG_PATTERNS.includes("stars"), "train-art.js kennt die Wimpel der Reise nicht");
  assert(art.LAMP_SHAPES.includes("star"), "train-art.js kennt die Sternlampe nicht");
  assert(art.WHISTLES.includes("schiffshorn"), "train-art.js kennt das Schiffshorn nicht");
  assert(art.DRIVERS.some((d) => d.id === "squirrel") && art.DRIVERS.some((d) => d.id === "ibex"), "train-art.js kennt die Chauffeure der Reise nicht");
  for (const map of MAPS) assert(art.LANDMARKS[map.landmark], `Wahrzeichen ${map.landmark} fehlt in train-art.js`);
}
const kidsSource = fs.readFileSync(path.join(root, "kids.js"), "utf8");
assert(/schiffshorn: \[/.test(kidsSource), "kids.js kennt den Klang des Schiffshorns nicht");
const scenesWin = load(["train-art.js", "train-scenes.js"]);
assert(scenesWin.LernappScenes?.BY_ID?.savanne?.reward === "scene-savanne", "train-scenes.js: die Savanne fehlt oder ist keine Belohnung der Reise");
for (const map of MAPS) assert(scenesWin.LernappScenes.BY_ID[map.scene], `Landschaft ${map.scene} von Karte ${map.nr} fehlt`);

// --- Der Stand ---------------------------------------------------------------------
assert(reise.current() === 1, "ein frischer Stand beginnt bei Station 1");
reise.markDone(1, { stars: 2, game: "missingItem" });
assert(reise.current() === 2 && reise.isDone(1), "nach dem ersten Stempel ist Station 2 dran");
assert(reise.recordTry(2) === 1 && reise.recordTry(2) === 2, "Fehlversuche zählen hoch");
assert(reise.altTaskFor(2).viaAlt, "nach zwei Fehlversuchen gibt es ein Ausweichgleis");
reise.useAlt(2);
assert(reise.taskFor(2).viaAlt && reise.taskFor(2).game === MAPS[0].alt.geschwindigkeit.game, "das Ausweichgleis ersetzt den Auftrag");
reise.choose(4, "fishPond");
assert(reise.taskFor(4).game === "fishPond", "die Wahl an der Wahlstation gilt");
assert(!reise.hasReward("flag-rainbow"), "ohne fertige Karte keine Belohnung");
for (let nr = 1; nr <= 10; nr += 1) reise.markDone(nr, { stars: 3, game: "x" });
assert(reise.hasReward("flag-rainbow") && reise.finishedMaps() === 1, "die fertige erste Karte gibt den Wimpel");
assert(reise.lockFor("flag", "rainbow") === null && reise.lockFor("driver", "squirrel")?.nr === 2, "lockFor zeigt auf die Karte der Belohnung");
const merged = reise.merge({ done: { "3": { stars: 1 } }, tries: { "5": 2 } }, { done: { "3": { stars: 3 }, "4": { stars: 2 } }, tries: { "5": 1 } });
assert(merged.done["3"].stars === 3 && merged.done["4"].stars === 2 && merged.tries["5"] === 2, "das Zusammenführen behält das Bessere");
assert(reise.progressFor({ done: { "1": { stars: 3 } } }).station === 2, "progressFor rechnet mit einem fremden Kasten");

console.log(`Fahrplan geprüft: ${MAPS.length} Karten, ${STATION_COUNT} Stationen, ${Object.keys(GAMES).length} Spiele je mindestens zweimal, ${rewards.size} Belohnungen.`);
