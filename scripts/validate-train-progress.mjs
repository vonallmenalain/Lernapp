/*
 * Prüft die Fortschrittslogik des Zugs (train-progress.js):
 * Passen die fünf Bereiche zum Level-Katalog, gibt jedes Spiel seine drei
 * Schritte zur richtigen Zeit frei, zählt der Wagen sie zu fünfzehn zusammen –
 * und rechnet das zweite Wagen-Set langsamer, ohne sonst etwas zu ändern?
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
function near(a, b) { return Math.abs(a - b) < 1e-9; }

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

function solve(gameId, count) {
  (catalog[gameId] || []).slice(0, count).forEach((level) => {
    store.set(`lernapp.solved.${gameId}.${level.id}`, "1");
  });
}

function useSet(id) {
  if (id === null) store.delete("lernapp.train.set");
  else store.set("lernapp.train.set", JSON.stringify({ id, switchedAtMs: 1 }));
}

// --- Bereiche und Spiele ----------------------------------------------------
assert(train.AREAS.length === 5, `erwartet 5 Bereiche, gefunden ${train.AREAS.length}`);

const seen = new Set();
for (const area of train.AREAS) {
  assert(area.id && area.label && area.color && area.icon, `${area.id}: unvollständige Bereichsdaten`);
  assert(/^#[0-9A-Fa-f]{6}$/.test(area.color), `${area.id}: ${area.color} ist keine Farbe`);
  assert(area.games.length === 5, `${area.id} hat ${area.games.length} Spiele statt 5 – drei Schritte je Spiel geben nur mit fünf Spielen fünfzehn`);

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

const colors = new Set(train.AREAS.map((area) => area.color));
assert(colors.size === 5, "jeder Bereich braucht eine eigene Farbe");

// --- Die Sets ---------------------------------------------------------------
assert(train.SETS.length === 2, `erwartet 2 Wagen-Sets, gefunden ${train.SETS.length}`);
assert(train.STAGE_COUNT === 15 && train.STEPS_PER_GAME === 3, "fünfzehn Schritte je Wagen, drei je Spiel");
assert(train.BUILT_STAGE > 0 && train.BUILT_STAGE < train.STAGE_COUNT, "die Marke für den stehenden Wagen muss zwischen 0 und 15 liegen");

const wagons = new Set();
for (const set of train.SETS) {
  assert(set.id && set.label, "ein Set ohne Kennung oder Namen");
  assert(set.stepAt.length === 3, `Set ${set.id}: drei Schwellen je Spiel, gefunden ${set.stepAt.length}`);
  for (let i = 0; i < set.stepAt.length; i += 1) {
    assert(Number.isInteger(set.stepAt[i]) && set.stepAt[i] > 0, `Set ${set.id}: Schwelle ${set.stepAt[i]} ist keine Rundenzahl`);
    if (i) assert(set.stepAt[i] > set.stepAt[i - 1], `Set ${set.id}: Schwellen müssen streng steigen`);
  }
  for (const area of train.AREAS) {
    const wagon = set.wagons[area.id];
    assert(typeof wagon === "string" && wagon, `Set ${set.id}: ${area.id} hat keine Wagenbauart`);
    assert(!wagons.has(wagon), `Set ${set.id}: ${wagon} kommt schon in einem anderen Set vor`);
    wagons.add(wagon);
  }
}
assert(train.SET_BY_ID["1"].stepAt.join(",") === "1,3,5", "das erste Set gibt Schritte nach 1, 3 und 5 Runden");
assert(train.SET_BY_ID["2"].stepAt.join(",") === "3,6,9", "das zweite Set gibt Schritte nach 3, 6 und 9 Runden");
// Das zweite Set braucht fast doppelt so viele Runden wie das erste.
const runden = (set) => set.stepAt[set.stepAt.length - 1] * 5;
assert(runden(train.SET_BY_ID["2"]) >= runden(train.SET_BY_ID["1"]) * 1.8, "das zweite Set ist nicht deutlich langsamer als das erste");

// Die Spielseiten kennen die Zahl je Set aus kids.js – sie muss dieselbe sein
// wie hier, sonst sagt der Lautsprecher im Spiel "noch eine Runde", und der
// Wagen wächst trotzdem nicht.
const kidsQuelle = fs.readFileSync(path.join(root, "kids.js"), "utf8");
const tabelle = kidsQuelle.match(/const WAGON_ROUNDS = (\{[^}]*\});/);
assert(tabelle, "kids.js kennt die Rundenzahl je Wagen-Set nicht (WAGON_ROUNDS)");
const rundenJeSet = JSON.parse(tabelle[1].replace(/(\w+):/g, '"$1":'));
for (const set of train.SETS) {
  const ziel = set.stepAt[set.stepAt.length - 1];
  assert(rundenJeSet[set.id] === ziel, `kids.js sagt für Set ${set.id} ${rundenJeSet[set.id]} Runden, train-progress.js ${ziel}`);
}
assert(Object.keys(rundenJeSet).length === train.SETS.length, "kids.js kennt andere Sets als train-progress.js");

// Ohne Eintrag gilt das erste Set; ein unbekannter Eintrag ebenfalls.
useSet(null);
assert(train.activeSet().id === "1", "ohne Eintrag muss das erste Set gelten");
useSet("99");
assert(train.activeSet().id === "1", "ein unbekanntes Set muss auf das erste zurückfallen");
useSet("2");
assert(train.activeSet().id === "2", "das gespeicherte Set gilt nicht");
assert(train.wagonFor("gedaechtnis") === "unicorn", "im zweiten Set fährt Gedächtnis kein Einhorn");
useSet(null);
assert(train.wagonFor("gedaechtnis") === "boxcar", "im ersten Set fährt Gedächtnis kein Kastenwagen");

// --- Aus Runden werden Schritte ---------------------------------------------
const erwartet1 = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 9: 3, 40: 3 };
for (const [plays, steps] of Object.entries(erwartet1)) {
  assert(train.stepsFor(Number(plays), [1, 3, 5]) === steps, `Set 1: ${plays} Runden müssen ${steps} Schritte geben, geben ${train.stepsFor(Number(plays), [1, 3, 5])}`);
}
const erwartet2 = { 0: 0, 1: 0, 2: 0, 3: 1, 5: 1, 6: 2, 8: 2, 9: 3, 12: 3 };
for (const [plays, steps] of Object.entries(erwartet2)) {
  assert(train.stepsFor(Number(plays), [3, 6, 9]) === steps, `Set 2: ${plays} Runden müssen ${steps} Schritte geben, geben ${train.stepsFor(Number(plays), [3, 6, 9])}`);
}

// --- Der Wagen zählt die Schritte seiner fünf Spiele zusammen ----------------
store.clear();
for (const area of train.allAreas()) {
  assert(area.stage === 0 && area.steps === 0 && !area.built && !area.complete, `${area.id} ohne Fortschritt hat schon Schritte`);
  assert(area.games.length === 5, `${area.id}: ${area.games.length} Spiele im Fortschritt`);
  assert(area.set === "1", `${area.id}: der Bereich nennt nicht das Set`);
  for (const game of area.games) {
    assert(game.steps === 0 && game.solved === 0, `${game.id} ohne Fortschritt hat schon Schritte`);
    assert(game.total === 5, `${game.id}: im ersten Set sind fünf Runden das Ziel, nicht ${game.total}`);
    assert(game.worlds.length === 3, `${game.id} braucht ein Band je Schritt`);
    assert(game.stepAt.join(",") === "1,3,5", `${game.id} trägt die falschen Schwellen`);
  }
}

// Eine einzige gelöste Aufgabe muss den Wagen sichtbar verändern: der erste
// Erfolg ist im ersten Set der erste Schritt.
store.set("lernapp.memory", JSON.stringify({ best: { 8: { stars: 3 } } }));
assert(train.areaProgress("gedaechtnis").stage === 1, "eine gelöste Aufgabe muss den ersten Schritt geben");
assert(train.areaProgress("konzentration").stage === 0, "andere Bereiche dürfen davon nichts merken");

// Ein Spiel ganz gespielt: drei Schritte, kein vierter. Der Wagen steht nicht.
store.clear();
store.set("lernapp.memory", JSON.stringify({
  best: { 8: { stars: 3 }, 12: { stars: 3 }, 16: { stars: 3 }, 20: { stars: 3 }, 24: { stars: 3 } },
}));
const oneGame = train.areaProgress("gedaechtnis");
assert(oneGame.stage === 3, `ein volles Spiel muss drei Schritte geben, gibt ${oneGame.stage}`);
assert(near(oneGame.ratio, 0.2), `ein volles Spiel von fünf ist ein Fünftel, ist ${oneGame.ratio}`);
assert(!oneGame.built, "ein einzelnes Spiel darf den Wagen nicht hinstellen");

// Zwei volle Spiele: sechs Schritte – der Wagen steht.
store.set("lernapp.backpack", JSON.stringify({ runs: 5, scores: [14, 12, 9, 6, 3] }));
const twoGames = train.areaProgress("gedaechtnis");
assert(twoGames.stage === 6 && twoGames.built && !twoGames.complete, `zwei volle Spiele müssen sechs Schritte geben und den Wagen hinstellen (${twoGames.stage})`);

// Vier volle Spiele: zwölf Schritte – aber noch nicht fertig, das fünfte fehlt.
store.set("lernapp.beachtreasure", JSON.stringify({ runs: 5, scores: [12, 10, 8, 6, 4] }));
store.set("lernapp.kacheln", JSON.stringify({ runs: 7, scores: [14, 10, 8, 6, 4] }));
const vierSpiele = train.areaProgress("gedaechtnis");
assert(vierSpiele.stage === 12 && !vierSpiele.complete, `vier volle Spiele sind zwölf Schritte, nicht fertig (${vierSpiele.stage})`);

// Alle fünf: fünfzehn Schritte, fertig.
store.set("lernapp.wasfehlt", JSON.stringify({ runs: 5, scores: [9, 8, 6, 4, 2] }));
const full = train.areaProgress("gedaechtnis");
assert(full.stage === 15 && full.complete, `fünf volle Spiele müssen fünfzehn Schritte geben (${full.stage})`);
assert(near(full.ratio, 1), `voller Bereich muss 100 % geben, ist ${full.ratio}`);
assert(full.solved === 25 && full.total === 25, `voller Bereich zählt ${full.solved} von ${full.total} Runden statt 25 von 25`);

// Halb voll auf fünf Spiele verteilt: je zwei Runden sind je ein Schritt – der
// Wagen wächst nur, wenn alle Spiele angefasst werden, nicht schneller, wenn
// eines ganz durchgespielt wird.
store.clear();
["lernapp.backpack", "lernapp.beachtreasure", "lernapp.kacheln", "lernapp.wasfehlt"].forEach((key) => store.set(key, JSON.stringify({ runs: 2, scores: [5, 3] })));
store.set("lernapp.memory", JSON.stringify({ best: { 8: { stars: 3 }, 12: { stars: 3 } } }));
const verteilt = train.areaProgress("gedaechtnis");
assert(verteilt.stage === 5, `fünfmal zwei Runden sind fünf Schritte, gefunden ${verteilt.stage}`);
assert(near(verteilt.ratio, 0.4), `fünfmal zwei von fünf Runden sind 40 %, gefunden ${verteilt.ratio}`);

// Der Anteil ist der Mittelwert über die Spiele – nicht über die Aufgaben:
// Kakuro hat vierzig Level, der Karten-Merker gar keine.
for (const area of train.allAreas()) {
  const spielbar = area.games.filter((game) => game.total > 0);
  const mittel = spielbar.reduce((sum, game) => sum + game.ratio, 0) / spielbar.length;
  assert(near(area.ratio, mittel), `${area.id}: Anteil ${area.ratio} ist nicht der Mittelwert ${mittel} über die Spiele`);
  assert(area.stage === area.games.reduce((sum, game) => sum + game.steps, 0), `${area.id}: die Schritte sind nicht die Summe der Spiele`);
}

// Die drei Bänder eines Spiels: eines je Schritt, gefüllt bis zum nächsten.
store.clear();
store.set("lernapp.turmbau", JSON.stringify({ runs: 2, scores: [20, 10] }));
const baender = train.gameProgress("towerStack").worlds;
assert(baender.length === 3, "drei Bänder je Spiel");
assert(baender[0].solved === 1 && near(baender[0].ratio, 1), "nach der ersten Runde ist das erste Band voll");
assert(baender[1].solved === 0 && near(baender[1].ratio, 0.5), `nach zwei Runden ist das zweite Band halb voll, ist ${baender[1].ratio}`);
assert(baender[2].solved === 0 && near(baender[2].ratio, 0), "das dritte Band ist noch leer");

// --- Tier-Sprung ------------------------------------------------------------
// Zehn Level, keine Welten, eigener Speicher. Fünf beliebige bauen im ersten
// Set das Spiel fertig; ein sechstes drückt den Stand nicht.
store.clear();
const leer = train.areaProgress("geschwindigkeit");
assert(leer.total === 25, `Geschwindigkeit muss fünfmal 5 Runden melden, meldet ${leer.total}`);
assert(leer.stage === 0, "Geschwindigkeit ohne Fortschritt muss Schritt 0 geben");

store.set("lernapp.tiersprung.progress", JSON.stringify({
  unlocked: 6,
  best: { 1: { stars: 3 }, 2: { stars: 2 }, 3: { stars: 3 }, 4: { stars: 1 }, 5: { stars: 2 } },
}));
const runner = train.gameProgress("tiersprung");
assert(runner.solved === 5 && runner.steps === 3 && runner.ratio === 1, `fünf Level müssen Tier-Sprung abschliessen (${runner.solved}, ${runner.steps})`);
assert(runner.stars === 11, `Tier-Sprung muss 11 Sterne melden, meldet ${runner.stars}`);
assert(runner.unit.plural === "Level", "Tier-Sprung zählt Level");
store.set("lernapp.tiersprung.progress", JSON.stringify({
  unlocked: 10,
  best: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((i) => [i, { stars: i <= 5 ? 3 : 1 }])),
}));
const vollerLaeufer = train.gameProgress("tiersprung");
assert(vollerLaeufer.solved === 5 && vollerLaeufer.ratio === 1, "acht Level dürfen nicht über 100 % gehen");
assert(vollerLaeufer.stars === 15, `die besten fünf geben 15 Sterne, gefunden ${vollerLaeufer.stars}`);
assert(near(train.areaProgress("geschwindigkeit").ratio, 0.2), "fertiger Tier-Sprung neben vier leeren Spielen ist ein Fünftel");

// --- Weichen-Wirrwarr, Freie Fahrt und Fässer stapeln ------------------------
for (const [spielId, key, name] of [["trackRouter", "lernapp.trackrouter", "Weichen-Wirrwarr"], ["gridlock", "lernapp.freiefahrt", "Freie Fahrt"], ["craneStack", "lernapp.faesser", "Fässer stapeln"]]) {
  store.clear();
  assert(train.gameProgress(spielId).solved === 0, `${name}: ohne Level darf nichts gelöst sein`);
  store.set(key, JSON.stringify({ best: { 1: { stars: 3 }, 2: { stars: 2 } } }));
  const zwei = train.gameProgress(spielId);
  assert(zwei.solved === 2 && zwei.steps === 1, `${name}: zwei Level sind ein Schritt (${zwei.solved}, ${zwei.steps})`);
  assert(zwei.stars === 5, `${name}: 3 + 2 Sterne sind 5, gefunden ${zwei.stars}`);
  store.set(key, JSON.stringify({ best: { 6: { stars: 1 }, 7: { stars: 1 }, 8: { stars: 1 }, 9: { stars: 1 }, 10: { stars: 1 }, 3: { stars: 3 } } }));
  const voll = train.gameProgress(spielId);
  assert(voll.solved === 5 && voll.steps === 3, `${name}: fünf schwere Level müssen genauso abschliessen wie fünf leichte`);
  assert(voll.stars === 7, `${name}: die besten fünf geben 3 + 4 = 7 Sterne, gefunden ${voll.stars}`);
}
// Der eine Kasten darf nichts vom anderen abbekommen.
store.clear();
store.set("lernapp.freiefahrt", JSON.stringify({ best: { 1: { stars: 3 } } }));
assert(train.gameProgress("trackRouter").solved === 0, "Freie Fahrt schreibt in den Kasten von Weichen-Wirrwarr");

// --- Die Spiele mit Bestenliste ---------------------------------------------
// Gespielte Runden zählen, die Punktzahl entscheidet nur über die Sterne. Die
// Schwelle für drei Sterne ist je Spiel eine andere: der Karten-Merker gibt
// zwei Punkte je Karte, Strand-Schätze einen je Schatz.
const RUNDEN_SPIELE = [
  { id: "cardMatch", key: "lernapp.cardmatch", name: "Karten-Merker", drei: 40, einer: 8 },
  { id: "beachTreasure", key: "lernapp.beachtreasure", name: "Strand-Schätze", drei: 12, einer: 2 },
  { id: "flanker", key: "lernapp.flanker", name: "Schwarm-Fokus", drei: 30, einer: 6 },
  { id: "backpack", key: "lernapp.backpack", name: "Rucksack packen", drei: 12, einer: 2 },
  { id: "tileMemory", key: "lernapp.kacheln", name: "Kacheln-Knobeln", drei: 14, einer: 3 },
  { id: "fishPond", key: "lernapp.fischteich", name: "Fischteich", drei: 14, einer: 3 },
  { id: "leafFlow", key: "lernapp.blaetter", name: "Blätter im Strom", drei: 16, einer: 3 },
  { id: "towerStack", key: "lernapp.turmbau", name: "Turmbau", drei: 14, einer: 3 },
  { id: "spatialPuzzle", key: "lernapp.raumdetektiv", name: "Raumdetektiv", drei: 3, einer: 1 },
  { id: "missingItem", key: "lernapp.wasfehlt", name: "Was fehlt?", drei: 8, einer: 2 },
  { id: "goSignal", key: "lernapp.signal", name: "Halt am Signal", drei: 22, einer: 4 },
  { id: "twinSpot", key: "lernapp.doppelt", name: "Doppelt gleich", drei: 20, einer: 4 },
  { id: "numberLine", key: "lernapp.zahlengleis", name: "Wo hält der Zug?", drei: 25, einer: 5 },
];
for (const spiel of RUNDEN_SPIELE) {
  store.clear();
  const nichts = train.gameProgress(spiel.id);
  assert(nichts.total === 5 && nichts.solved === 0, `${spiel.name}: fünf Runden sind das Ziel, keine gespielt`);
  assert(nichts.unit.plural === "Runden", `${spiel.name} zählt Runden, nicht Level`);

  store.set(spiel.key, JSON.stringify({ runs: 2, scores: [spiel.drei + 6, spiel.einer] }));
  const zwei = train.gameProgress(spiel.id);
  assert(zwei.solved === 2 && zwei.steps === 1, `${spiel.name}: zwei Runden sind ein Schritt (${zwei.solved}, ${zwei.steps})`);
  assert(zwei.stars === 4, `${spiel.name}: eine starke und eine schwache Runde geben 3 + 1 Sterne, gefunden ${zwei.stars}`);

  store.set(spiel.key, JSON.stringify({ runs: 5, scores: [0, 0, 0, 0, 0] }));
  const fertig = train.gameProgress(spiel.id);
  assert(fertig.steps === 3 && fertig.ratio === 1, `${spiel.name}: fünf Runden müssen abschliessen, egal mit wie vielen Punkten`);
  assert(fertig.stars === 5, `${spiel.name}: fünf schwache Runden geben je einen Stern, gefunden ${fertig.stars}`);

  store.set(spiel.key, JSON.stringify({ runs: 12, scores: [spiel.drei, spiel.drei, 1, 1, 1] }));
  assert(train.gameProgress(spiel.id).solved === 5, `${spiel.name}: mehr als fünf Runden dürfen nicht über das Ziel hinaus zählen`);
}
store.clear();
store.set("lernapp.cardmatch", JSON.stringify({ runs: 1, scores: [12] }));
store.set("lernapp.beachtreasure", JSON.stringify({ runs: 1, scores: [12] }));
assert(train.gameProgress("cardMatch").stars === 1, "12 Punkte sind im Karten-Merker eine schwache Runde");
assert(train.gameProgress("beachTreasure").stars === 3, "12 Schätze sind am Strand eine starke Runde");

// --- Die Katalog-Spiele -----------------------------------------------------
// Arukone, Battleships, Tiergehege, Buchstabenjagd, Wortdetektiv, Kakuro und
// Hidoku haben je vierzig Level; fünf beliebige geben alle drei Schritte.
// Alles zu verlangen hiesse: ein Wagen, den kein Kind je fertig sieht.
for (const spielId of ["arukone", "bimaru", "shikaku", "letterPuzzle", "readingPuzzle", "kakuro", "hidoku"]) {
  store.clear();
  assert(catalog[spielId].length >= 20, `${spielId} hat nur ${catalog[spielId].length} Level – die Probe sagt nichts aus`);
  assert(train.gameProgress(spielId).solved === 0, `${spielId}: ohne Level darf nichts gelöst sein`);
  solve(spielId, 2);
  const zwei = train.gameProgress(spielId);
  assert(zwei.solved === 2 && zwei.steps === 1, `${spielId}: zwei Level sind ein Schritt (${zwei.solved}, ${zwei.steps})`);
  solve(spielId, catalog[spielId].length);
  const voll = train.gameProgress(spielId);
  assert(voll.solved === 5 && voll.steps === 3 && voll.ratio === 1, `${spielId}: alle Level dürfen nicht über das Ziel hinaus zählen (${voll.solved})`);
}

// Zahl und Buchstabe zählt wie alle anderen: fünf Spiele, drei Schritte je
// Spiel – vier aus dem Katalog und eines mit Runden.
store.clear();
for (const game of train.AREA_BY_ID.zahlbuchstabe.games) solve(game.id, 5);
store.set("lernapp.zahlengleis", JSON.stringify({ runs: 5, scores: [30, 26, 20, 12, 8] }));
const zb = train.areaProgress("zahlbuchstabe");
assert(zb.stage === 15 && zb.complete && zb.solved === 25, `Zahl und Buchstabe: fünfmal fünf sind der fertige Wagen (${zb.stage}, ${zb.solved})`);

// --- Memory -----------------------------------------------------------------
// Gespielte Runden zählen – und für Stände von früher die geschafften
// Kartenzahlen, als das Spiel noch keine Runden zählte.
store.clear();
store.set("lernapp.memory", JSON.stringify({ best: { 8: { stars: 3 }, 16: { stars: 3 } } }));
const memAlt = train.gameProgress("memory");
assert(memAlt.solved === 2 && memAlt.steps === 1, `Memory: zwei geschaffte Grössen von früher sind zwei Runden (${memAlt.solved})`);
assert(memAlt.stars === 6, `geschafft gibt je drei Sterne, erwartet 6, gefunden ${memAlt.stars}`);
store.set("lernapp.memory", JSON.stringify({ runs: 5, best: { 8: { stars: 3 } } }));
const memRunden = train.gameProgress("memory");
assert(memRunden.solved === 5 && memRunden.steps === 3, `Memory: fünf Runden derselben Grösse schliessen ab (${memRunden.solved})`);
store.set("lernapp.memory", JSON.stringify({ runs: 1, best: { 8: { stars: 3 }, 12: { stars: 3 }, 16: { stars: 3 } } }));
assert(train.gameProgress("memory").solved === 3, "Memory: von Runden und Grössen zählt die höhere Zahl");

// --- Das zweite Set ---------------------------------------------------------
// Dieselben Spiele, dasselbe Zählen – nur die Schwellen liegen höher: ein
// Schritt nach drei Runden, das Spiel nach neun.
store.clear();
useSet("2");
for (const area of train.allAreas()) {
  assert(area.set === "2", `${area.id}: der Bereich nennt nicht das zweite Set`);
  assert(area.wagon === train.SET_BY_ID["2"].wagons[area.id], `${area.id}: falscher Wagen im zweiten Set`);
  for (const game of area.games) {
    assert(game.total === 9, `${game.id}: im zweiten Set sind neun Runden das Ziel, nicht ${game.total}`);
    assert(game.stepAt.join(",") === "3,6,9", `${game.id} trägt im zweiten Set die falschen Schwellen`);
  }
}
store.set("lernapp.fischteich", JSON.stringify({ runs: 2, scores: [5, 3] }));
assert(train.gameProgress("fishPond").steps === 0, "im zweiten Set sind zwei Runden noch kein Schritt");
assert(train.areaProgress("konzentration").stage === 0, "im zweiten Set darf der Wagen nach zwei Runden nicht wachsen");
store.set("lernapp.fischteich", JSON.stringify({ runs: 3, scores: [5, 3, 2] }));
assert(train.gameProgress("fishPond").steps === 1, "im zweiten Set sind drei Runden der erste Schritt");
store.set("lernapp.fischteich", JSON.stringify({ runs: 9, scores: [5, 3, 2, 2, 1] }));
const teichVoll = train.gameProgress("fishPond");
assert(teichVoll.steps === 3 && teichVoll.solved === 9 && teichVoll.ratio === 1, `im zweiten Set schliessen neun Runden ab (${teichVoll.solved}, ${teichVoll.steps})`);
store.set("lernapp.fischteich", JSON.stringify({ runs: 14, scores: [5, 3, 2, 2, 1] }));
assert(train.gameProgress("fishPond").solved === 9, "im zweiten Set dürfen mehr als neun Runden nicht über das Ziel hinaus zählen");

solve("arukone", 5);
assert(train.gameProgress("arukone").steps === 1, "im zweiten Set sind fünf Level erst ein Schritt");
solve("arukone", 9);
assert(train.gameProgress("arukone").steps === 3, "im zweiten Set sind neun Level alle drei Schritte");
store.set("lernapp.tiersprung.progress", JSON.stringify({
  unlocked: 10, best: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => [i, { stars: 2 }])),
}));
assert(train.gameProgress("tiersprung").steps === 3, "im zweiten Set bauen neun Tier-Sprung-Level das Spiel fertig");
store.set("lernapp.memory", JSON.stringify({ runs: 6, best: { 8: { stars: 3 } } }));
assert(train.gameProgress("memory").steps === 2, "im zweiten Set sind sechs Memory-Runden zwei Schritte");

// Ein ganzer Wagen im zweiten Set: 45 Runden.
store.clear();
useSet("2");
["lernapp.backpack", "lernapp.beachtreasure", "lernapp.kacheln", "lernapp.wasfehlt"].forEach((key) => store.set(key, JSON.stringify({ runs: 9, scores: [5, 3] })));
store.set("lernapp.memory", JSON.stringify({ runs: 9, best: { 8: { stars: 3 } } }));
const zwei = train.areaProgress("gedaechtnis");
assert(zwei.stage === 15 && zwei.complete && zwei.total === 45 && zwei.solved === 45, `im zweiten Set sind 45 Runden der fertige Wagen (${zwei.stage}, ${zwei.solved}/${zwei.total})`);
assert(train.trainProgress().set === "2" && train.trainProgress().completeWagons === 1, "der Gesamtfortschritt nennt Set und fertige Wagen nicht");

// Der fremde Zug rechnet mit demselben Set.
const fremd = train.areasForAccount({
  solved: catalog.arukone.slice(0, 6).map((level) => `arukone.${level.id}`),
  gameState: { "lernapp.cardmatch": { data: { runs: 3, scores: [52] }, updatedAt: 1 } },
});
assert(fremd.find((area) => area.id === "problemloesen").stage === 2, "der fremde Zug rechnet nicht mit den Schwellen des zweiten Sets");
assert(fremd.find((area) => area.id === "geschwindigkeit").stage === 1, "der fremde Zug zählt Runden im zweiten Set falsch");
assert(fremd.find((area) => area.id === "gedaechtnis").stage === 0, "der fremde Zug bekommt den Stand dieses Geräts angerechnet");
// Danach gilt wieder das eigene Gerät.
assert(train.areaProgress("gedaechtnis").stage === 15, "nach dem fremden Zug rechnet der eigene mit fremden Daten weiter");

useSet(null);
store.clear();

console.log(`Zug-Fortschritt geprüft: 5 Bereiche, ${seen.size} Spiele, ${train.SETS.length} Sets, 15 Schritte je Wagen.`);
