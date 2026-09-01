/*
 * Prüft die Fortschrittslogik des Zugs (train-progress.js):
 * Passen die fünf Bereiche zum Level-Katalog, wächst der Wagen sinnvoll, und
 * rechnet der Bereichsfortschritt so, dass kein Wagen den anderen davonläuft?
 *
 * Läuft ohne Browser: app.js und train-progress.js laufen in einer Sandbox mit
 * einem localStorage-Stub, in den der Test gelöste Levels schreiben kann.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// --- Sandbox ----------------------------------------------------------------
const store = new Map();
const localStorageStub = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

const elementStub = {
  style: { setProperty() {}, removeProperty() {} },
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  dataset: {},
  setAttribute() {}, removeAttribute() {}, append() {}, prepend() {}, remove() {},
  addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
  insertBefore() {}, after() {},
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
  localStorage: localStorageStub,
  navigator: {},
  console,
  performance: { now: () => 0 },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  structuredClone: (value) => JSON.parse(JSON.stringify(value)),
});

for (const file of ["spatial-puzzles.js", "app.js", "train-progress.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const train = windowStub.LernappTrain;
const catalog = windowStub.LernappLevelCatalog;
assert(train, "train-progress.js hat window.LernappTrain nicht gesetzt");
assert(catalog, "app.js hat window.LernappLevelCatalog nicht gesetzt");

// --- Bereiche und Spiele ----------------------------------------------------
assert(train.AREAS.length === 5, `erwartet 5 Bereiche, gefunden ${train.AREAS.length}`);

const seen = new Set();
for (const area of train.AREAS) {
  assert(area.id && area.label && area.color && area.icon && area.wagon, `${area.id}: unvollständige Bereichsdaten`);
  assert(/^#[0-9A-Fa-f]{6}$/.test(area.color), `${area.id}: ${area.color} ist keine Farbe`);
  assert(area.games.length > 0, `${area.id} hat keine Spiele`);

  for (const game of area.games) {
    assert(!seen.has(game.id), `${game.id} ist mehr als einem Bereich zugeordnet`);
    seen.add(game.id);
    assert(fs.existsSync(path.join(root, game.page)), `${game.id}: ${game.page} existiert nicht`);
    if (!game.ownProgress) {
      assert(catalog[game.id], `${game.id} steht nicht im Level-Katalog`);
    }
  }
}

// Jedes Spiel aus dem Katalog muss einem Bereich gehören – sonst wäre es in der
// App vorhanden, aber mit dem Zug nicht mehr erreichbar.
for (const gameId of Object.keys(catalog)) {
  assert(seen.has(gameId), `${gameId} liegt im Katalog, gehört aber zu keinem Bereich`);
}

const wagons = new Set(train.AREAS.map((area) => area.wagon));
assert(wagons.size === 5, "jeder Bereich braucht eine eigene Wagenbauart");
const colors = new Set(train.AREAS.map((area) => area.color));
assert(colors.size === 5, "jeder Bereich braucht eine eigene Farbe");

// --- Ausbaustufen -----------------------------------------------------------
assert(train.STAGE_THRESHOLDS.length === train.STAGE_COUNT, "Schwellen und Stufenzahl passen nicht zusammen");
for (let i = 1; i < train.STAGE_THRESHOLDS.length; i += 1) {
  assert(train.STAGE_THRESHOLDS[i] > train.STAGE_THRESHOLDS[i - 1], "Schwellen müssen streng steigen");
}
assert(train.STAGE_THRESHOLDS.at(-1) === 1, "die letzte Schwelle muss 100 % sein");

assert(train.stageFor(0, false) === 0, "ohne gelöste Levels muss Stufe 0 stehen");
assert(train.stageFor(0.001, true) === 1, "das erste gelöste Level muss Stufe 1 auslösen");
assert(train.stageFor(1, true) === train.STAGE_COUNT, "voller Fortschritt muss die letzte Stufe geben");
assert(train.stageFor(train.STAGE_THRESHOLDS[4], true) === 5, "die fünfte Schwelle muss den Wagen fertig bauen");

// Die Stufe darf nie fallen, wenn der Fortschritt steigt.
let previous = 0;
for (let percent = 0; percent <= 100; percent += 1) {
  const stage = train.stageFor(percent / 100, percent > 0);
  assert(stage >= previous, `Stufe fällt bei ${percent} % von ${previous} auf ${stage}`);
  previous = stage;
}

// --- Fortschritt rechnen ----------------------------------------------------
// Spiele mit eigenem Konto stehen nicht im Katalog – dort tut solve nichts,
// und der Aufrufer setzt statt dessen ihren Speicher.
function solve(gameId, count) {
  (catalog[gameId] || []).slice(0, count).forEach((level) => {
    store.set(`lernapp.solved.${gameId}.${level.id || level.levelName}`, "1");
  });
}

store.clear();
for (const area of train.allAreas()) {
  assert(area.stage === 0, `${area.id} startet nicht bei Stufe 0`);
  assert(area.ratio === 0, `${area.id} startet nicht bei 0 Prozent`);
}

// Eine einzige gelöste Aufgabe muss den Wagen sichtbar verändern – das ist der
// Punkt der Sonderregel für Stufe 1.
store.set("lernapp.memory", JSON.stringify({ best: { 8: { stars: 3 } } }));
assert(train.areaProgress("gedaechtnis").stage === 1, "eine gelöste Aufgabe muss Stufe 1 geben");
assert(train.areaProgress("konzentration").stage === 0, "andere Bereiche dürfen davon nichts merken");

// Ein einzelnes Spiel komplett zu lösen darf den Wagen nicht fertig bauen:
// Gedächtnis hat drei Spiele, ein volles Spiel ist also ein Drittel.
store.clear();
store.set("lernapp.memory", JSON.stringify({
  best: { 8: { stars: 3 }, 12: { stars: 3 }, 16: { stars: 3 }, 20: { stars: 3 }, 24: { stars: 3 } },
}));
const oneGame = train.areaProgress("gedaechtnis");
const games = train.AREA_BY_ID.gedaechtnis.games.length;
assert(Math.abs(oneGame.ratio - 1 / games) < 1e-9, `ein volles Spiel von ${games} muss ${(100 / games).toFixed(0)} % geben, ist ${oneGame.ratio}`);
assert(!oneGame.built, "ein einzelnes Spiel darf den Wagen nicht fertig bauen");

// Alle Spiele eines Bereichs komplett: Wagen fertig beladen.
store.clear();
for (const game of train.AREA_BY_ID.zahlbuchstabe.games) solve(game.id, (catalog[game.id] || []).length);
const full = train.areaProgress("zahlbuchstabe");
assert(full.ratio === 1, `voller Bereich muss 100 % geben, ist ${full.ratio}`);
assert(full.stage === train.STAGE_COUNT, "voller Bereich muss die letzte Stufe geben");
assert(full.complete, "voller Bereich muss als fertig gelten");
assert(full.solved === 160, `Zahl und Buchstabe hat ${full.solved} statt 160 Levels`);

// Der Mittelwert über die Spiele soll die sehr unterschiedlichen Bereichsgrössen
// ausgleichen: gleich viel Anteil je Spiel führt zu gleichem Wagenfortschritt,
// obwohl Problemlösen zehnmal so viele Aufgaben hat wie Konzentration.
//
// Aufgebaut wird deshalb "die Hälfte der Spiele fertig": in Konzentration eines
// von zwei, in Problemlösen zwei von vier. Beide Wagen müssen gleich weit sein.
store.clear();
store.set("lernapp.flanker", JSON.stringify({ runs: 5, scores: [30, 20, 10, 8, 4] }));
solve("spatialPuzzle", catalog.spatialPuzzle.length);
solve("arukone", catalog.arukone.length);
const konzentration = train.areaProgress("konzentration");
const problemloesen = train.areaProgress("problemloesen");
assert(
  Math.abs(konzentration.ratio - problemloesen.ratio) < 1e-9,
  `gleich viele fertige Spiele müssen gleich weit sein: ${konzentration.ratio} vs ${problemloesen.ratio}`,
);
assert(Math.abs(konzentration.ratio - 0.5) < 1e-9, `ein fertiges von zwei Spielen sind 50 %, gefunden ${konzentration.ratio}`);
assert(problemloesen.total > konzentration.total * 4,
  `die Probe sagt nichts aus, wenn beide Bereiche gleich gross sind: ${konzentration.total} und ${problemloesen.total}`);

// Und allgemein: der Bereichsanteil ist der Mittelwert über seine Spiele –
// nicht über die Aufgaben.
for (const area of train.allAreas()) {
  const spielbar = area.games.filter((game) => game.total > 0);
  const mittel = spielbar.reduce((sum, game) => sum + game.ratio, 0) / spielbar.length;
  assert(Math.abs(area.ratio - mittel) < 1e-9,
    `${area.id}: Anteil ${area.ratio} ist nicht der Mittelwert ${mittel} über die Spiele`);
}

// --- Geschwindigkeit --------------------------------------------------------
// Der Bereich hängt nicht am Level-Katalog, sondern an den eigenen Speichern
// von Tier-Sprung und Karten-Merker. Die Adapter müssen sie auf dieselbe Form
// bringen wie ein Katalog-Spiel.
store.clear();
const leer = train.areaProgress("geschwindigkeit");
assert(leer.total === 10, `Geschwindigkeit muss 5 Level plus 5 Runden melden, meldet ${leer.total}`);
assert(leer.stage === 0, "Geschwindigkeit ohne Fortschritt muss Stufe 0 geben");

store.set("lernapp.tiersprung.progress", JSON.stringify({
  unlocked: 6,
  best: { 1: { stars: 3 }, 2: { stars: 2 }, 3: { stars: 3 }, 4: { stars: 1 }, 5: { stars: 2 } },
}));
const halb = train.areaProgress("geschwindigkeit");
const runner = halb.games.find((game) => game.id === "tiersprung");
// Fünf geschaffte Level bauen den Wagen – welche fünf, ist gleich.
assert(runner.solved === 5, `Tier-Sprung muss 5 gelöste Levels melden, meldet ${runner.solved}`);
assert(runner.ratio === 1, `fünf Level müssen Tier-Sprung abschliessen, steht bei ${runner.ratio}`);
assert(runner.stars === 11, `Tier-Sprung muss 11 Sterne melden, meldet ${runner.stars}`);
assert(runner.worlds.length === 5, "Tier-Sprung braucht ein Band je nötigem Level");

// Und mehr als fünf dürfen nicht darüber hinausschiessen.
store.set("lernapp.tiersprung.progress", JSON.stringify({
  unlocked: 10,
  best: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((i) => [i, { stars: i <= 5 ? 3 : 1 }])),
}));
const vollerLaeufer = train.gameProgress("tiersprung");
assert(vollerLaeufer.ratio === 1, "acht Level dürfen nicht über 100 % gehen");
assert(vollerLaeufer.stars === 15, `die besten fünf geben 15 Sterne, gefunden ${vollerLaeufer.stars}`);
store.set("lernapp.tiersprung.progress", JSON.stringify({
  unlocked: 6,
  best: { 1: { stars: 3 }, 2: { stars: 2 }, 3: { stars: 3 }, 4: { stars: 1 }, 5: { stars: 2 } },
}));
// Der Bereich zählt über die Spiele: Tier-Sprung fertig, Karten-Merker gar
// nicht – das ist die Hälfte, obwohl fünf von zehn Leveln gespielt sind.
assert(Math.abs(halb.ratio - 0.5) < 1e-9, `fertiger Tier-Sprung und leerer Karten-Merker sind 50 %, gefunden ${halb.ratio}`);

// --- Weichen-Wirrwarr -------------------------------------------------------
// Zehn Level zur Wahl, fünf beliebige bauen den Wagen fertig. Gezählt werden
// die besten fünf, damit ein sechstes Level den Stand nicht drückt.
store.clear();
const gleisLeer = train.gameProgress("trackRouter");
assert(gleisLeer.total === 5, `Weichen-Wirrwarr muss 5 Level melden, meldet ${gleisLeer.total}`);
assert(gleisLeer.solved === 0, "ohne gefahrenes Level darf nichts gelöst sein");

store.set("lernapp.trackrouter", JSON.stringify({ best: { 1: { stars: 3 }, 2: { stars: 2 } } }));
const gleisZwei = train.gameProgress("trackRouter");
assert(gleisZwei.solved === 2, `zwei Level müssen 2 ergeben, ergeben ${gleisZwei.solved}`);
assert(Math.abs(gleisZwei.ratio - 0.4) < 1e-9, `zwei von fünf Leveln sind 40 %, gefunden ${gleisZwei.ratio}`);
assert(gleisZwei.stars === 5, `3 + 2 Sterne sind 5, gefunden ${gleisZwei.stars}`);
assert(gleisZwei.worlds.length === 5, "Weichen-Wirrwarr braucht ein Band je Level");

// Welche fünf Level, ist gleich – und ein sechstes darf nicht schaden.
store.set("lernapp.trackrouter", JSON.stringify({
  best: { 6: { stars: 1 }, 7: { stars: 1 }, 8: { stars: 1 }, 9: { stars: 1 }, 10: { stars: 1 } },
}));
assert(train.gameProgress("trackRouter").ratio === 1, "fünf schwere Level müssen genauso abschliessen wie fünf leichte");
store.set("lernapp.trackrouter", JSON.stringify({
  best: { 1: { stars: 3 }, 2: { stars: 3 }, 3: { stars: 3 }, 4: { stars: 3 }, 5: { stars: 3 }, 6: { stars: 1 } },
}));
const gleisVoll = train.gameProgress("trackRouter");
assert(gleisVoll.ratio === 1, "sechs Level dürfen nicht über 100 % gehen");
assert(gleisVoll.stars === 15, `die besten fünf geben 15 Sterne, gefunden ${gleisVoll.stars}`);

// --- Die Spiele mit Bestenliste ---------------------------------------------
// Fünf gespielte Runden, dann ist das Spiel fertig – die Punktzahl entscheidet
// nur über die Sterne, nicht über den Fortschritt. Beide zählen anders: der
// Karten-Merker gibt zwei Punkte je Karte, Strand-Schätze einen je Schatz.
// Deshalb muss die Sternschwelle je Spiel eine andere sein.
const RUNDEN_SPIELE = [
  { id: "cardMatch", key: "lernapp.cardmatch", name: "Karten-Merker", drei: 40, einer: 8 },
  { id: "beachTreasure", key: "lernapp.beachtreasure", name: "Strand-Schätze", drei: 12, einer: 2 },
  { id: "flanker", key: "lernapp.flanker", name: "Schwarm-Fokus", drei: 30, einer: 6 },
  { id: "backpack", key: "lernapp.backpack", name: "Rucksack packen", drei: 12, einer: 2 },
];

// --- Die Logikspiele mit fünf nötigen Leveln --------------------------------
// Arukone, Battleships und Tiergehege haben je vierzig Level; fünf beliebige
// bauen den Wagen. Alles zu verlangen hiesse: ein Wagen, den kein Kind je
// fertig sieht.
for (const spielId of ["arukone", "bimaru", "shikaku"]) {
  store.clear();
  const leer = train.gameProgress(spielId);
  assert(leer.total === 5, `${spielId} muss 5 Level melden, meldet ${leer.total}`);
  assert(leer.solved === 0, `${spielId}: ohne Level darf nichts gelöst sein`);
  assert(catalog[spielId].length > 20, `${spielId} hat nur ${catalog[spielId].length} Level – die Probe sagt nichts aus`);

  solve(spielId, 2);
  const zwei = train.gameProgress(spielId);
  assert(zwei.solved === 2, `${spielId}: zwei Level müssen 2 ergeben, ergeben ${zwei.solved}`);
  assert(Math.abs(zwei.ratio - 0.4) < 1e-9, `${spielId}: zwei von fünf sind 40 %, gefunden ${zwei.ratio}`);
  assert(zwei.worlds.length === 5, `${spielId} braucht ein Band je nötigem Level`);

  solve(spielId, catalog[spielId].length);
  const voll = train.gameProgress(spielId);
  assert(voll.ratio === 1, `${spielId}: alle Level dürfen nicht über 100 % gehen`);
  assert(voll.solved === 5, `${spielId}: mehr als fünf dürfen nicht zählen, gezählt ${voll.solved}`);
}
store.clear();

// --- Memory -----------------------------------------------------------------
// Fünf Kartenzahlen zur Wahl, jede nur geschafft oder nicht. Wer alle fünf
// einmal geschafft hat, hat den Wagen gebaut.
store.clear();
const memLeer = train.gameProgress("memory");
assert(memLeer.total === 5, `Memory muss 5 Grössen melden, meldet ${memLeer.total}`);
assert(memLeer.solved === 0, "ohne gespielte Grösse darf nichts gelöst sein");

store.set("lernapp.memory", JSON.stringify({ best: { 8: { stars: 3 }, 16: { stars: 3 } } }));
const memZwei = train.gameProgress("memory");
assert(memZwei.solved === 2, `zwei Grössen müssen 2 ergeben, ergeben ${memZwei.solved}`);
assert(Math.abs(memZwei.ratio - 0.4) < 1e-9, `zwei von fünf sind 40 %, gefunden ${memZwei.ratio}`);
assert(memZwei.stars === 6, `geschafft gibt je drei Sterne, erwartet 6, gefunden ${memZwei.stars}`);
assert(memZwei.worlds.length === 5, "Memory braucht ein Band je Grösse");

// Eine Grösse zweimal spielen bringt nichts dazu – es geht um fünf verschiedene.
store.set("lernapp.memory", JSON.stringify({
  best: { 8: { stars: 3 }, 12: { stars: 3 }, 16: { stars: 3 }, 20: { stars: 3 }, 24: { stars: 3 } },
}));
assert(train.gameProgress("memory").ratio === 1, "alle fünf Grössen müssen das Spiel abschliessen");

for (const spiel of RUNDEN_SPIELE) {
  store.clear();
  const leer = train.gameProgress(spiel.id);
  assert(leer.total === 5, `${spiel.name} muss 5 Runden melden, meldet ${leer.total}`);
  assert(leer.solved === 0, `${spiel.name}: ohne Runde darf nichts gelöst sein`);

  store.set(spiel.key, JSON.stringify({ runs: 2, scores: [spiel.drei + 6, spiel.einer] }));
  const zwei = train.gameProgress(spiel.id);
  assert(zwei.solved === 2, `${spiel.name}: zwei Runden müssen 2 ergeben, ergeben ${zwei.solved}`);
  assert(Math.abs(zwei.ratio - 0.4) < 1e-9, `${spiel.name}: zwei von fünf Runden sind 40 %, gefunden ${zwei.ratio}`);
  assert(zwei.stars === 4, `${spiel.name}: eine starke und eine schwache Runde geben 3 + 1 Sterne, gefunden ${zwei.stars}`);
  assert(zwei.worlds.length === 5, `${spiel.name} braucht ein Band je Runde`);

  // Eine schwache Runde zählt genauso für den Wagen wie eine starke.
  store.set(spiel.key, JSON.stringify({ runs: 5, scores: [0, 0, 0, 0, 0] }));
  const fertig = train.gameProgress(spiel.id);
  assert(fertig.ratio === 1, `${spiel.name}: fünf Runden müssen abschliessen, egal mit wie vielen Punkten`);
  assert(fertig.stars === 5, `${spiel.name}: fünf schwache Runden geben je einen Stern, gefunden ${fertig.stars}`);

  // Mehr als fünf Runden dürfen nicht über 100 Prozent hinausschiessen.
  store.set(spiel.key, JSON.stringify({ runs: 12, scores: [spiel.drei, spiel.drei, 1, 1, 1] }));
  assert(train.gameProgress(spiel.id).ratio === 1, `${spiel.name}: mehr als fünf Runden dürfen nicht über 100 % gehen`);
}

// Die Schwelle muss wirklich je Spiel gelten: dieselbe Punktzahl darf nicht in
// beiden Spielen dieselben Sterne geben, sonst wäre die Trennung nur Zierde.
store.clear();
store.set("lernapp.cardmatch", JSON.stringify({ runs: 1, scores: [12] }));
store.set("lernapp.beachtreasure", JSON.stringify({ runs: 1, scores: [12] }));
assert(train.gameProgress("cardMatch").stars === 1, "12 Punkte sind im Karten-Merker eine schwache Runde");
assert(train.gameProgress("beachTreasure").stars === 3, "12 Schätze sind am Strand eine starke Runde");

// --- Welten je Spiel --------------------------------------------------------
// Aus dem Katalog gelesen statt hier aufgezählt: sonst fiele beim nächsten
// Umbau ein Spiel still aus der Prüfung.
const eigeneKonten = new Set(
  train.AREAS.flatMap((area) => area.games.filter((game) => game.ownProgress).map((game) => game.id)),
);
assert(eigeneKonten.size === 10, `erwartet 10 Spiele mit eigenem Konto, gefunden ${eigeneKonten.size}`);
store.clear();
for (const area of train.allAreas()) {
  for (const game of area.games) {
    // Die Spiele mit eigenem Konto haben keine vier Welten: Tier-Sprung zehn
    // Level, die beiden Bestenlisten-Spiele je fünf Runden.
    if (eigeneKonten.has(game.id)) continue;
    assert(game.worlds.length === 4, `${game.id} hat ${game.worlds.length} Welten statt 4`);
    const total = game.worlds.reduce((sum, world) => sum + world.total, 0);
    assert(total === game.total, `${game.id}: Welten summieren sich nicht auf ${game.total}`);
    assert(game.maxStars === game.total * 3, `${game.id}: Sternmaximum passt nicht zur Levelzahl`);
  }
}

const alle = train.trainProgress();
assert(alle.areas.length === 5, "trainProgress muss fünf Bereiche melden");
const gesamt = alle.areas.reduce((sum, area) => sum + area.total, 0);
assert(gesamt === 250, `erwartet 250 Aufgaben über alle Bereiche, gefunden ${gesamt}`);

console.log(`Zug-Fortschritt geprüft: 5 Bereiche, ${seen.size} Spiele, ${gesamt} Levels.`);
