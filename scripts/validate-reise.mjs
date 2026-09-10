/*
 * Prüft den Fahrplan der Reise (journey-plan.js):
 * Hat jede Karte zehn Stationen, jeden Bereich zweimal, nie denselben Bereich
 * hintereinander und kein Spiel zweimal? Sind Station 4 und 8 Wahlstationen,
 * ist Station 10 ein Rätsel und verlangen die ersten beiden nichts zu lesen?
 * Zeigt jeder Auftrag auf ein Level, das es gibt, und kommt jedes der 25
 * Spiele mindestens zweimal dran? Und stimmen die Drei-Sterne-Schwellen mit
 * train-progress.js überein, die Titel mit highscore.js?
 *
 * Dazu Reise 2 (Weltraum, Savanne, die bekannten Karten schwerer), das
 * Reisetempo, die Schiebelok und das Reise-Schild.
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

const { MAPS, LAPS, GAMES, STATIONS_PER_MAP, STATION_COUNT, LOCKS, BONUSES } = reise;
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
// Der Fahrplan rechnet mit denselben Zahlen (Reise 2 und Reisetempo
// verschieben Level) – sie dürfen nicht auseinanderlaufen.
for (const [id, max] of Object.entries(LEVEL_MAX)) assert(reise.LEVEL_MAX[id] === max, `LEVEL_MAX.${id} in journey-plan.js ist ${reise.LEVEL_MAX[id]}, die Spieldatei hat ${max}`);
const MEMORY_SIZES = [8, 12, 16, 20, 24];
const CATALOG_PER_WORLD = { spatialPuzzle: 1 };
assert(JSON.stringify(reise.MEMORY_SIZES) === JSON.stringify(MEMORY_SIZES) && JSON.stringify(reise.CATALOG_PER_WORLD) === JSON.stringify(CATALOG_PER_WORLD), "Kartenzahlen oder Katalog-Level in journey-plan.js weichen ab");
const artWin = load(["train-art.js"]);
const art = artWin.LernappTrainArt;

// --- Die Karten ---------------------------------------------------------------
// Reise 1: sechs Karten. Reise 2: der Weltraum mit eigenem Fahrplan, die
// Savanne mit den Stationen der Wiese, dann Wald bis Nacht noch einmal.
assert(Array.isArray(LAPS) && LAPS.length === 2, "erwartet zwei Reisen");
assert(LAPS[0].first === 1 && LAPS[0].last === 60 && LAPS[0].maps === 6 && LAPS[1].first === 61 && LAPS[1].last === 130 && LAPS[1].maps === 7, `Reisen unerwartet: ${JSON.stringify(LAPS)}`);
assert(MAPS.length === 13, `erwartet dreizehn Karten, gefunden ${MAPS.length}`);
assert(STATION_COUNT === 130 && STATIONS_PER_MAP === 10, "erwartet 130 Stationen zu je 10");
assert(MAPS[6].id === "weltraum" && MAPS[6].lap === 2 && !MAPS[6].boost, "Karte 7 ist der Weltraum mit eigenem Fahrplan");
assert(MAPS[7].id === "savanne" && MAPS[7].from === "wiese" && MAPS[7].landmark === "baobab" && MAPS[7].passenger === "lion", "Karte 8 ist die Savanne mit den Stationen der Wiese");
assert(MAPS[12].id === "nacht-2" && MAPS[12].from === "nacht", "Karte 13 ist die Nacht der zweiten Reise");
const appearances = new Map(Object.keys(GAMES).map((id) => [id, 0]));
const rewards = new Set();
const passengers = new Set();
let lastFactor = 0;

function checkSpec(spec, where, mapIndex, lap = 1) {
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
    if (lap === 1) {
      assert(spec.world !== "extreme", `${where}: Weltall-Level gehören noch nicht in die Reise`);
      assert(!(mapIndex < 2 && spec.world !== "easy"), `${where}: auf den ersten beiden Karten nur Wiese-Level`);
      assert(!(mapIndex < 4 && spec.world === "hard"), `${where}: Meer-Level erst ab Karte 5`);
    }
  } else {
    assert(!("level" in spec) && !("size" in spec), `${where}: ein Runden-Spiel braucht kein Level`);
  }
  return game;
}

MAPS.forEach((map, mapIndex) => {
  const where = `Karte ${map.nr} (${map.id})`;
  assert(map.nr === mapIndex + 1 && [1, 2].includes(map.lap), `${where}: Nummer oder Reise passt nicht`);
  assert(map.stations.length === STATIONS_PER_MAP, `${where}: ${map.stations.length} Stationen statt ${STATIONS_PER_MAP}`);
  if (map.lap === 1) {
    assert(map.factor > lastFactor && map.factor <= 1, `${where}: Faktor ${map.factor} steigt nicht`);
    lastFactor = map.factor;
  } else {
    // Reise 2 verlangt die ganze Drei-Sterne-Schwelle – nicht mehr, sonst
    // wäre ein Auftrag irgendwann nicht mehr zu schaffen.
    assert(map.factor === 1, `${where}: Reise 2 fährt mit Faktor 1, nicht ${map.factor}`);
  }
  if (map.boost) {
    const source = MAPS.find((entry) => entry.id === map.from);
    assert(source && source.lap === 1 && map.stations === source.stations && map.alt === source.alt, `${where}: fährt nicht die Stationen von ${map.from}`);
    assert(map.reward.part === "plate" && map.reward.star >= 1, `${where}: Reise 2 belohnt mit einem Goldstern auf dem Reise-Schild`);
  }
  assert(map.reward?.id && map.reward.label && map.reward.part, `${where}: Belohnung unvollständig`);
  assert(!rewards.has(map.reward.id), `${where}: Belohnung ${map.reward.id} doppelt`);
  rewards.add(map.reward.id);
  assert(typeof map.landmark === "string" && map.landmark, `${where}: kein Wahrzeichen`);
  assert(typeof map.scene === "string" && map.scene, `${where}: keine Landschaft`);
  // Der Fahrgast: ein Tier, das train-art.js zeichnen kann; in Reise 1 jedes
  // nur einmal, damit jede Karte ihre eigene Geschichte hat.
  assert(typeof map.passenger === "string" && (!art || art.DRIVERS.some((d) => d.id === map.passenger)), `${where}: Fahrgast ${map.passenger} fehlt in train-art.js`);
  if (map.lap === 1) { assert(!passengers.has(map.passenger), `${where}: Fahrgast ${map.passenger} fährt schon auf einer anderen Karte`); passengers.add(map.passenger); }
  assert(typeof map.feature === "string" && map.feature, `${where}: keine Streckenbesonderheit`);

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
      const game = checkSpec(spec, at, mapIndex, map.lap);
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
    const game = checkSpec(alt, `${where}, Ausweichgleis ${area}`, mapIndex, map.lap);
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
    // Auch nach dem Verschieben (Reise 2) muss jeder Auftrag auf ein Level
    // zeigen, das es gibt.
    if (t.kind === "level") assert(t.level >= 1 && t.level <= LEVEL_MAX[t.game], `Station ${nr}: Level ${t.level} gibt es bei ${t.game} nicht`);
    if (t.kind === "size") assert(MEMORY_SIZES.includes(t.size), `Station ${nr}: Kartenzahl ${t.size} gibt es nicht`);
    if (t.kind === "catalog") assert(WORLDS.includes(t.world) && t.pos >= 1 && t.pos <= (CATALOG_PER_WORLD[t.game] || 10), `Station ${nr}: ${t.worldLabel} ${t.pos} gibt es bei ${t.game} nicht`);
    assert(t.lap === reise.lapOf(nr).nr, `Station ${nr}: Reise ${t.lap} statt ${reise.lapOf(nr).nr}`);
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
// Der Bonus für ganz goldene Karten: zwei Stufen, beide an einem Bauteil.
assert(Array.isArray(BONUSES) && BONUSES.length === 2, "erwartet zwei Bonus-Stufen für goldene Karten");
BONUSES.forEach((bonus, index) => {
  assert(bonus.id && bonus.label && bonus.part && bonus.text, `Bonus ${index + 1} unvollständig`);
  assert(bonus.after === index + 1, `Bonus ${bonus.id} müsste nach ${index + 1} goldenen Karten kommen`);
  assert(!rewards.has(bonus.id), `Bonus ${bonus.id} ist zugleich eine Karten-Belohnung`);
});
const bonusIds = new Set(BONUSES.map((bonus) => bonus.id));
for (const [part, entries] of Object.entries(LOCKS)) {
  for (const [value, id] of Object.entries(entries)) {
    assert(rewards.has(id) || bonusIds.has(id), `LOCKS ${part}.${value}: Belohnung ${id} gibt es auf keiner Karte und als kein Bonus`);
  }
}
for (const bonus of BONUSES) {
  assert(Object.values(LOCKS[bonus.part] || {}).includes(bonus.id), `Bonus ${bonus.id} hängt an keiner Variante von ${bonus.part}`);
}
if (art) {
  assert(art.FLAG_PATTERNS.includes("rainbow") && art.FLAG_PATTERNS.includes("stars"), "train-art.js kennt die Wimpel der Reise nicht");
  assert(art.LAMP_SHAPES.includes("star"), "train-art.js kennt die Sternlampe nicht");
  assert(art.WHISTLES.includes("schiffshorn"), "train-art.js kennt das Schiffshorn nicht");
  assert(art.WHEEL_SHAPES.includes("sun") && art.FLAG_PATTERNS.includes("sun"), "train-art.js kennt Sonnenrad und Sonnen-Wimpel nicht");
  assert(art.DRIVERS.some((d) => d.id === "squirrel") && art.DRIVERS.some((d) => d.id === "ibex"), "train-art.js kennt die Chauffeure der Reise nicht");
  for (const map of MAPS) assert(art.LANDMARKS[map.landmark], `Wahrzeichen ${map.landmark} fehlt in train-art.js`);
  assert(art.LANDMARKS.rocket && art.LANDMARKS.baobab && typeof art.buildPassenger === "function" && typeof art.buildFerry === "function", "train-art.js kennt Rakete, Baobab, Fahrgast oder Fähre nicht");
}
const kidsSource = fs.readFileSync(path.join(root, "kids.js"), "utf8");
assert(/schiffshorn: \[/.test(kidsSource), "kids.js kennt den Klang des Schiffshorns nicht");
const scenesWin = load(["train-art.js", "train-scenes.js"]);
assert(scenesWin.LernappScenes?.BY_ID?.savanne?.reward === "scene-savanne", "train-scenes.js: die Savanne fehlt oder ist keine Belohnung der Reise");
assert(scenesWin.LernappScenes?.BY_ID?.weltraum?.reward === "scene-weltraum" && LOCKS.scene?.weltraum === "scene-weltraum", "train-scenes.js: der Weltraum fehlt oder hängt nicht an der Weltraum-Karte");
assert(/playRattle/.test(kidsSource), "kids.js kennt das Rattern der Zahnradstrecke nicht");
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
assert(reise.lockFor("driver", "squirrel")?.text === "Karte 2: Wald", "lockFor beschriftet die Karte");
// Zehn goldene Stempel auf Karte 1 (oben alle mit drei Sternen gestempelt): der erste Bonus.
assert(reise.goldenMaps() === 1 && reise.mapGolden(0) && !reise.mapGolden(1), "Karte 1 ist ganz golden, Karte 2 nicht");
assert(reise.hasReward("gold-1") && !reise.hasReward("gold-2"), "der erste Bonus ist frei, der zweite nicht");
assert(reise.lockFor("wheels", "sun") === null, "das Sonnenrad ist nach der ersten goldenen Karte frei");
assert(reise.lockFor("flag", "sun")?.bonus?.after === 2 && /zwei Karten/.test(reise.lockFor("flag", "sun").text), "der Sonnen-Wimpel wartet auf die zweite goldene Karte");
assert(reise.goldenStations().length === 10 && reise.goldenStations()[0] === 1, "goldenStations zählt die goldenen Stempel");
for (let nr = 11; nr <= 20; nr += 1) reise.markDone(nr, { stars: 3, game: "x" });
assert(reise.goldenMaps() === 2 && reise.hasReward("gold-2"), "zwei goldene Karten geben den zweiten Bonus");
assert(reise.progressFor(reise.read()).goldenMaps === 2, "progressFor zählt die goldenen Karten");
reise.writeSeen({ station: 21, gold: [1, 2], goldenMaps: 2 });
assert(reise.readSeen().goldenMaps === 2 && reise.readSeen().gold.length === 2, "gesehen merkt sich die goldenen Karten");
const merged = reise.merge({ done: { "3": { stars: 1 } }, tries: { "5": 2 } }, { done: { "3": { stars: 3 }, "4": { stars: 2 } }, tries: { "5": 1 } });
assert(merged.done["3"].stars === 3 && merged.done["4"].stars === 2 && merged.tries["5"] === 2, "das Zusammenführen behält das Bessere");
assert(reise.progressFor({ done: { "1": { stars: 3 } } }).station === 2, "progressFor rechnet mit einem fremden Kasten");

// --- Reise 2 -------------------------------------------------------------------------
assert(reise.taskFor(61).size === 24 && reise.taskFor(72).level === 4 && reise.taskFor(79).world === "extreme" && reise.taskFor(79).pos === 1, "Reise 2 fährt schwerer: grosses Memory, drei Level höher, Weltall-Level");
assert(reise.taskFor(71).stufe === 3 && reise.taskFor(71).target === 8 && reise.taskFor(71).lap === 2, "Reise 2: oberste Stufe, die ganze Schwelle");
assert(reise.taskFor(130).kind === "catalog" && reise.taskFor(130).world === "extreme" && reise.taskFor(130).goal, "die letzte Station ist ein Weltall-Rätsel am Ziel");
assert(/^Reise 2, Station 73/.test(reise.describe(reise.taskFor(73))), "describe nennt Reise 2");

// --- Das Reisetempo -----------------------------------------------------------------
assert(reise.tempo() === "normal", "ohne Eintrag gilt das normale Reisetempo");
const normal3 = reise.taskFor(3).target;
const normal23 = reise.taskFor(23).stufe;
reise.setTempo("langsam");
assert(reise.tempo() === "langsam" && reise.taskFor(3).target === 11 && reise.taskFor(3).target < normal3, "langsam: Wo hält der Zug? auf der Wiese verlangt weniger");
assert(reise.taskFor(72).level === 2 && reise.taskFor(27).label === "Wiese 5" && reise.taskFor(23).stufe === normal23 - 1, "langsam: zwei Level tiefer, drei Katalog-Level zurück, eine Stufe tiefer");
assert(reise.taskFor(12).target === Math.max(3, Math.ceil(GAMES.tileMemory.gut * MAPS[0].factor)), "langsam: Karte 2 verlangt die Zielpunktzahlen von Karte 1");
for (let nr = 1; nr <= STATION_COUNT; nr += 1) {
  const task = reise.taskFor(nr);
  (task.choice ? task.choice : [task]).forEach((t) => {
    if (t.kind === "level") assert(t.level >= 1, `langsam, Station ${nr}: Level ${t.level}`);
    if (t.kind === "size") assert(MEMORY_SIZES.includes(t.size), `langsam, Station ${nr}: Kartenzahl ${t.size}`);
    if (t.kind === "catalog") assert(t.pos >= 1 && WORLDS.includes(t.world), `langsam, Station ${nr}: ${t.world} ${t.pos}`);
    if (t.kind === "score") assert(t.target >= 3, `langsam, Station ${nr}: Ziel ${t.target}`);
  });
}
reise.setTempo("normal");
assert(reise.taskFor(3).target === normal3 && reise.taskFor(72).level === 4, "normal: alles wie vorher");
const tempoMerged = reise.merge({ tempo: "langsam", tempoAt: 5 }, { tempo: "normal", tempoAt: 9 });
assert(tempoMerged.tempo === "normal" && tempoMerged.tempoAt === 9 && reise.merge({ tempo: "langsam", tempoAt: 5 }, {}).tempo === "langsam", "beim Zusammenführen gewinnt das neuere Tempo");
assert(reise.progressFor({ tempo: "langsam", tempoAt: 1 }).tempo === "langsam", "progressFor nennt das Tempo");

// --- Die Schiebelok ---------------------------------------------------------------
assert(reise.TRIES_FOR_PUSH === 5 && reise.current() === 21, "Station 21 ist dran");
for (let i = 0; i < 5; i += 1) reise.recordTry(21);
assert(reise.needsPush(21) && !reise.needsPush(22), "nach fünf Fehlversuchen ist die Schiebelok fällig");
assert(reise.pushThrough(21) === true && reise.isDone(21) && reise.doneInfo(21).pushed && reise.current() === 22, "die Schiebelok schiebt zur nächsten Station");
assert(reise.pushThrough(21) === false && reise.triesFor(21) === 0 && !reise.needsPush(21), "einmal geschoben ist geschoben");
assert(reise.progressFor(reise.read()).pushed === 1 && !reise.goldenStations().includes(21), "geschoben zählt, aber nicht als golden");
reise.markDone(21, { stars: 2, game: "x" });
assert(!reise.doneInfo(21).pushed && reise.doneInfo(21).stars === 2, "ein echter Stempel ersetzt den Schub");
const pushedMerge = reise.merge({ done: { "9": { stars: 0, pushed: true } } }, { done: { "9": { stars: 1 } } });
assert(pushedMerge.done["9"].stars === 1 && !pushedMerge.done["9"].pushed, "beim Zusammenführen schlägt der Stempel den Schub");
reise.writeSeen({ station: 22, gold: [], goldenMaps: 2, pushed: [21] });
assert(reise.readSeen().pushed[0] === 21, "gesehen merkt sich geschobene Stationen");

// --- Das Reise-Schild -----------------------------------------------------------------
assert(reise.plateStars().stars === 2 && reise.plateStars().gold === 0, "zwei fertige Karten der ersten Reise: zwei Sterne");
for (let nr = 71; nr <= 80; nr += 1) reise.markDone(nr, { stars: 1, game: "x" });
assert(reise.plateStars().gold === 1 && reise.hasReward("gold-star-1") && reise.progressFor(reise.read()).goldStars === 1, "die fertige Savanne macht den ersten Stern golden");
assert(reise.lockFor("scene", "weltraum")?.nr === 7 && reise.lockFor("scene", "weltraum").text === "Karte 7: Weltraum", "die Landschaft Weltraum hängt an Karte 7");
const lap2 = reise.progressFor({ done: Object.fromEntries(Array.from({ length: 65 }, (_, i) => [String(i + 1), { stars: 1 }])) });
assert(lap2.lap === 2 && lap2.station === 66 && lap2.lapStation === 6 && lap2.lapTotal === 70 && lap2.lapFirst === 61 && lap2.firstLapComplete && !lap2.complete && lap2.stars === 6, "progressFor kennt die zweite Reise");
assert(reise.progressFor({ done: Object.fromEntries(Array.from({ length: 130 }, (_, i) => [String(i + 1), { stars: 3 }])) }).complete, "130 Stempel: beide Reisen geschafft");

console.log(`Fahrplan geprüft: ${MAPS.length} Karten (${LAPS[0].maps} + ${LAPS[1].maps}), ${STATION_COUNT} Stationen, ${Object.keys(GAMES).length} Spiele je mindestens zweimal, ${rewards.size} Belohnungen, Reisetempo und Schiebelok.`);
