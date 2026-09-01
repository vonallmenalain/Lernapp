/*
 * Prüft die Zeichnung des Zugs (train-art.js):
 * Lässt sich jede Bauteil-Variante bauen, wächst jeder Wagen über die elf
 * Stufen tatsächlich an, und tragen die Wagen ab Stufe 0 die Bereichsfarbe?
 *
 * Läuft ohne Browser: ein winziger DOM-Ersatz sammelt die erzeugten Elemente.
 * Das findet keine hässliche Zeichnung, aber jeden vertippten Formnamen und
 * jede Stufe, die nichts verändert – und beides passiert hier leicht.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// --- DOM-Ersatz -------------------------------------------------------------
// Nur so viel, wie train-art.js benutzt: createElementNS, setAttribute, append.
function makeNode(name) {
  return {
    nodeName: name,
    attrs: {},
    children: [],
    setAttribute(key, value) { this.attrs[key] = String(value); },
    append(...nodes) { this.children.push(...nodes); },
  };
}

function countNodes(node) {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

// Serialisiert einen Knoten samt Attributen. Elemente zu zählen reicht nicht:
// beim Kesselwagen steigt der Füllstand, ohne dass ein Element dazukommt – die
// Zeichnung ändert sich trotzdem sichtbar.
function serialize(node) {
  const attrs = Object.entries(node.attrs).sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`).join(" ");
  return `<${node.nodeName} ${attrs}>${node.children.map(serialize).join("")}`;
}

function collectAttr(node, key, into = []) {
  if (node.attrs[key] !== undefined) into.push(node.attrs[key]);
  node.children.forEach((child) => collectAttr(child, key, into));
  return into;
}

const windowStub = {};
const context = vm.createContext({
  window: windowStub,
  document: { createElementNS: (_ns, name) => makeNode(name) },
  console,
});
vm.runInContext(fs.readFileSync(path.join(root, "train-art.js"), "utf8"), context, { filename: "train-art.js" });

const art = windowStub.LernappTrainArt;
assert(art, "train-art.js hat window.LernappTrainArt nicht gesetzt");

// --- Wagen: jede Bauart über alle Stufen ------------------------------------
const AREA_COLOR = "#7C5CE6";

for (const type of art.WAGON_TYPES) {
  const shapes = [];
  let previousSize = 0;

  for (let stage = 0; stage <= 10; stage += 1) {
    const wagon = art.buildWagon(type, AREA_COLOR, stage);
    shapes.push(serialize(wagon));

    assert(wagon.attrs["data-wagon"] === type, `${type}: data-wagon fehlt oder stimmt nicht`);
    assert(wagon.attrs["data-stage"] === String(stage), `${type} Stufe ${stage}: data-stage stimmt nicht`);

    // Der Wagen darf über die Stufen nie Teile verlieren.
    const size = countNodes(wagon);
    assert(size >= previousSize, `${type}: Stufe ${stage} hat weniger Elemente als Stufe ${stage - 1}`);
    previousSize = size;
  }

  // Jede Stufe muss sichtbar etwas verändern – sonst wäre sie für ein Kind
  // keine Belohnung, sondern nur eine Zahl im Code.
  for (let stage = 1; stage <= 10; stage += 1) {
    assert(shapes[stage] !== shapes[stage - 1], `${type}: Stufe ${stage} sieht aus wie Stufe ${stage - 1}`);
  }

  // Und keine zwei Stufen dürfen gleich aussehen, auch nicht über Umwege.
  assert(new Set(shapes).size === 11, `${type}: nicht alle elf Stufen sehen unterschiedlich aus`);

  // Stufe 0 ist das nackte Fahrgestell, muss aber schon die Bereichsfarbe
  // tragen: sonst ist am Anfang nicht erkennbar, welcher Wagen wohin gehört.
  const bare = art.buildWagon(type, AREA_COLOR, 0);
  const colors = [...collectAttr(bare, "fill"), ...collectAttr(bare, "stroke")].map((c) => c.toLowerCase());
  assert(colors.includes(AREA_COLOR.toLowerCase()), `${type} Stufe 0 trägt die Bereichsfarbe nicht`);

  // Fertig heisst goldene Räder und Wimpel.
  const done = art.buildWagon(type, AREA_COLOR, 10);
  assert(done.attrs.class.includes("is-complete"), `${type} Stufe 10 ist nicht als fertig markiert`);
  const gold = [...collectAttr(done, "fill"), ...collectAttr(done, "stroke")].map((c) => c.toLowerCase());
  assert(gold.includes("#f0b429"), `${type} Stufe 10 hat keine goldenen Räder`);
}

// Ausserhalb des Bereichs 0..10 darf nichts kaputtgehen.
assert(art.buildWagon("boxcar", AREA_COLOR, -5).attrs["data-stage"] === "0", "negative Stufe wird nicht abgefangen");
assert(art.buildWagon("boxcar", AREA_COLOR, 99).attrs["data-stage"] === "10", "zu hohe Stufe wird nicht abgefangen");
assert(art.buildWagon("gibtsnicht", AREA_COLOR, 5).attrs["data-wagon"] === "boxcar", "unbekannte Bauart fällt nicht zurück");

// --- Lok: jede Variante jedes Bauteils --------------------------------------
const base = art.DEFAULT_LOCO;
const variants = [
  ...art.DRIVERS.map((d) => ({ ...base, driver: d.id })),
  ...art.PALETTE.map((c) => ({ ...base, body: c })),
  ...art.WHEEL_SHAPES.map((s) => ({ ...base, wheels: { ...base.wheels, shape: s } })),
  ...art.CHIMNEY_SHAPES.map((s) => ({ ...base, chimney: { ...base.chimney, shape: s } })),
  ...art.CAB_SHAPES.map((s) => ({ ...base, cab: { ...base.cab, shape: s } })),
  ...art.LAMP_SHAPES.map((s) => ({ ...base, lamp: { ...base.lamp, shape: s } })),
  ...art.FLAG_PATTERNS.map((p) => ({ ...base, flag: { ...base.flag, pattern: p } })),
  ...art.WHISTLES.map((w) => ({ ...base, whistle: w })),
];

const PARTS = ["frame", "cab", "driver", "body", "whistle", "chimney", "lamp", "plough", "flag", "wheels", "steam"];
for (const config of variants) {
  const loco = art.buildLoco(config);
  const present = collectAttr(loco, "data-part");
  for (const part of PARTS) {
    assert(present.includes(part), `Lok-Bauteil ${part} fehlt bei ${JSON.stringify(config).slice(0, 60)}`);
  }
}

// Eine leere Konfiguration muss dieselbe Lok geben wie die Vorgabe – sonst
// startet ein neues Kind mit einer halben Lok.
assert(countNodes(art.buildLoco()) === countNodes(art.buildLoco(art.DEFAULT_LOCO)), "leere Konfiguration weicht von der Vorgabe ab");

// Jedes Bauteil der Werkstatt braucht einen Ausschnitt, auf den gezoomt wird –
// sonst liesse es sich zwar antippen, aber nicht ansehen.
for (const part of art.LOCO_PARTS) {
  const focus = art.PART_FOCUS[part.id];
  assert(focus, `${part.id}: kein Zoom-Ausschnitt`);
  assert(focus.width > 0 && focus.height > 0, `${part.id}: Ausschnitt ohne Fläche`);
}
assert(art.PART_FOCUS.whole, "der Ausschnitt für die ganze Lok fehlt");

// Die Werkstatt braucht für jedes Bauteil eine Liste von Varianten.
assert(art.LOCO_PARTS.length >= 5, `die Lok braucht mindestens fünf Bauteile, hat ${art.LOCO_PARTS.length}`);
for (const part of art.LOCO_PARTS) {
  assert(part.id && part.label, "Bauteil ohne id oder Beschriftung");
  assert(Array.isArray(part.options) && part.options.length >= 2, `${part.id} hat keine Auswahl`);
}

// --- Gebäude ----------------------------------------------------------------
// Jedes Spiel des Zugs braucht sein eigenes Haus. Fehlt eines, fällt
// buildBuilding stumm auf das Memory-Haus zurück – zwei gleiche Häuser im
// selben Bereich, und niemand merkt es beim Lesen des Codes.
const progressContext = vm.createContext({
  window: { LernappTrainArt: art },
  document: { createElementNS: (_ns, name) => makeNode(name), addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  console,
});
vm.runInContext(fs.readFileSync(path.join(root, "train-progress.js"), "utf8"), progressContext, { filename: "train-progress.js" });
const spiele = progressContext.window.LernappTrain.AREAS.flatMap((area) => area.games.map((game) => game.id));
assert(spiele.length === 18, `erwartet 18 Spiele im Zug, gefunden ${spiele.length}`);

const gesehen = new Map();
for (const id of spiele) {
  assert(art.BUILDINGS[id], `${id} hat kein eigenes Gebäude in BUILDINGS`);
  const bild = serialize(art.buildBuilding(id, { label: id }));
  const zwilling = gesehen.get(bild);
  assert(!zwilling, `${id} und ${zwilling} sehen genau gleich aus`);
  gesehen.set(bild, id);
  assert(collectAttr(art.buildBuilding(id, { label: id, done: true }), "data-building").includes(id),
    `${id} verliert seine Kennung, sobald es fertig gespielt ist`);
}

// --- Ganzer Zug -------------------------------------------------------------
const areas = art.WAGON_TYPES.map((wagon, index) => ({ id: `a${index}`, wagon, color: AREA_COLOR, stage: index * 2 }));
const train = art.buildTrain(areas, base);
assert(train.nodeName === "svg", "buildTrain liefert kein svg");
const placed = collectAttr(train, "data-area");
assert(placed.length === 5, `erwartet 5 Wagen im Zug, gefunden ${placed.length}`);
const viewBox = train.attrs.viewBox.split(" ").map(Number);
assert(viewBox[2] > art.LOCO_W + 5 * art.WAGON_W, "der Zug ist schmaler als seine Teile");
assert(viewBox[3] === art.ART_H, "die Höhe des Zugs passt nicht zum Koordinatensystem");

console.log(`Zug-Zeichnung geprüft: ${art.WAGON_TYPES.length} Bauarten × 11 Stufen, ${variants.length} Lok-Varianten, ${art.DRIVERS.length} Tiere, ${spiele.length} Gebäude.`);
