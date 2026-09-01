/*
 * Prüft Weichen-Wirrwarr aus brain-games.js: Sind alle Level vollständig
 * konfiguriert, ist jedes Haus von jedem Start aus erreichbar, und wachsen die
 * Level sinnvoll an?
 *
 * Läuft ohne Browser: die Datei wird in einer kleinen Sandbox ausgeführt.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "brain-games.js"), "utf8");
const difficulties = ["easy", "medium", "hard", "extreme"];

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

const windowStub = {};
const context = vm.createContext({
  window: windowStub,
  document: {
    createElement: () => ({ style: { setProperty() {} }, classList: { add() {}, remove() {} }, setAttribute() {}, append() {}, querySelector: () => null }),
    readyState: "complete",
    addEventListener() {},
  },
  console,
  performance: { now: () => 0 },
  ResizeObserver: undefined,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
});
vm.runInContext(source, context);

const api = windowStub.LernappBrainGames;
assert(api, "brain-games.js hat window.LernappBrainGames nicht gesetzt");

const GAMES = ["trackRouter"];
for (const game of GAMES) {
  assert(api.configs[game], `${game} fehlt in configs`);
  assert(api.pages[game]?.endsWith(".html"), `${game} hat keine Seite`);
  const config = api.configs[game];
  assert(config.title && config.subtitle && config.success, `${game}: Titel, Untertitel oder Erfolgstext fehlt`);
  assert(Array.isArray(config.rules) && config.rules.length >= 3, `${game} braucht mindestens drei Regeln fürs Tutorial`);
  assert(fs.existsSync(path.join(root, api.pages[game])), `${api.pages[game]} existiert nicht`);
}

// Level-Codes müssen eindeutig sein, sonst kollidieren die Levelnamen.
const codes = GAMES.map((game) => api.configs[game].code);
assert(new Set(codes).size === codes.length, `Level-Codes doppelt: ${codes.join(", ")}`);

const makeLevel = (game, difficulty, index, data) => ({
  ...data, game, difficulty, id: `${game}-${difficulty}-${index}`, levelName: `${game} ${difficulty}-${index}`,
});
const levels = api.buildLevels(makeLevel);

for (const game of GAMES) {
  const list = levels[game];
  assert(Array.isArray(list) && list.length >= 8, `${game} sollte mindestens acht Level haben, hat ${list?.length}`);
  for (const difficulty of difficulties) {
    const forDifficulty = list.filter((level) => level.difficulty === difficulty);
    assert(forDifficulty.length >= 2, `${game} ${difficulty} braucht mindestens zwei Level`);
    assert(forDifficulty.length <= 10, `${game} ${difficulty} hat mehr als zehn Level – app.js schneidet ab`);
    forDifficulty.forEach((level) => {
      assert(level.rule, `${level.id} hat keine Regel`);
      assert(level.badge, `${level.id} hat kein Abzeichen`);
      assert(level.description, `${level.id} hat keine Beschreibung`);
    });
  }
}


// --- Weichen-Wirrwarr ------------------------------------------------------
// Für jedes Layout muss gelten: von jedem Startpunkt aus ist jedes Haus
// erreichbar, sonst könnte ein Wagen unmöglich ankommen.
const layouts = (source.match(/const TRACK_LAYOUTS = ([\s\S]*?)\n  };/) || [])[1];
assert(layouts, "TRACK_LAYOUTS nicht gefunden");
const TRACK_LAYOUTS = Function(`"use strict"; return (${layouts.replace(/;$/, "")}});`)();

function reachableLines(layout, id, seen = new Set()) {
  if (seen.has(id)) return [];
  seen.add(id);
  const node = layout.nodes.find((entry) => entry.id === id);
  if (!node) return [];
  if (node.type === "station") return [node.line];
  return layout.edges.filter(([from]) => from === id).flatMap(([, to]) => reachableLines(layout, to, seen));
}

Object.entries(TRACK_LAYOUTS).forEach(([name, layout]) => {
  const stations = layout.nodes.filter((node) => node.type === "station");
  const lines = stations.map((node) => node.line).sort((a, b) => a - b);
  assert(lines.join(",") === lines.map((_, i) => i).join(","), `${name}: Linien sind nicht lückenlos von 0 nummeriert`);
  layout.nodes.filter((node) => node.type === "spawn").forEach((spawn) => {
    const found = reachableLines(layout, spawn.id).sort((a, b) => a - b);
    assert(found.join(",") === lines.join(","),
      `${name}: von ${spawn.id} sind nur die Häuser ${found.join(",")} erreichbar, nötig wären ${lines.join(",")}`);
  });
  layout.nodes.filter((node) => node.type === "switch").forEach((node) => {
    const outs = layout.edges.filter(([from]) => from === node.id);
    assert(outs.length === 2, `${name}: Weiche ${node.id} hat ${outs.length} Ausgänge statt zwei`);
  });
  layout.nodes.forEach((node) => {
    assert(node.x >= 0 && node.x <= 1 && node.y >= 0 && node.y <= 1, `${name}: ${node.id} liegt ausserhalb der Leinwand`);
  });
});

levels.trackRouter.forEach((level) => {
  const { layout, lines, deliveries, speed, spawnMs, maxCars } = level.rule;
  const definition = TRACK_LAYOUTS[layout];
  assert(definition, `${level.id}: unbekanntes Layout ${layout}`);
  const stations = definition.nodes.filter((node) => node.type === "station").length;
  assert(lines === stations, `${level.id}: ${lines} Farben, aber ${stations} Häuser – jedes Haus braucht eine Farbe`);
  assert(deliveries >= 4 && deliveries <= 20, `${level.id}: ${deliveries} Wagen sind ausserhalb der sinnvollen Spanne`);
  // speed ist der Anteil eines Gleisstücks pro Sekunde.
  assert(speed >= 0.3 && speed <= 1, `${level.id}: Tempo ${speed} ergibt eine unspielbare Fahrzeit`);
  assert(spawnMs >= 1200 && spawnMs <= 4000, `${level.id}: ${spawnMs} ms zwischen den Wagen passen nicht`);
  assert(maxCars >= 1 && maxCars <= 6, `${level.id}: ${maxCars} gleichzeitige Wagen passen nicht`);
});

// Die Schwierigkeit muss über die Welten hinweg wirklich steigen.
function averageBy(game, difficulty, pick) {
  const list = levels[game].filter((level) => level.difficulty === difficulty);
  return list.reduce((sum, level) => sum + pick(level.rule), 0) / list.length;
}

assert(averageBy("trackRouter", "easy", (r) => r.speed) < averageBy("trackRouter", "extreme", (r) => r.speed),
  "Weichen-Wirrwarr: das Tempo steigt nicht");

console.log("Brain-Games-Validierung bestanden.");
