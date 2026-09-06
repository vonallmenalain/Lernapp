/*
 * Prüft die Zeichnung des Zugs (train-art.js):
 * Lässt sich jede Bauteil-Variante bauen, wächst jeder Wagen über die fünfzehn
 * Schritte tatsächlich an, hängt jeder Schritt in seiner eigenen Gruppe, und
 * tragen die Wagen ab Stufe 0 die Bereichsfarbe?
 *
 * Läuft ohne Browser: ein winziger DOM-Ersatz sammelt die erzeugten Elemente.
 * Das findet keine hässliche Zeichnung, aber jeden vertippten Formnamen und
 * jeden Schritt, der nichts verändert – und beides passiert hier leicht.
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

// Alle Gruppen mit data-step, samt der Zahl ihrer gezeichneten Teile.
function stepGroups(node, into = []) {
  if (node.attrs["data-step"] !== undefined) into.push({ step: Number(node.attrs["data-step"]), size: countNodes(node) - 1 });
  node.children.forEach((child) => stepGroups(child, into));
  return into;
}

// Wie hoch ein Wagen hinaufreicht: die kleinste y-Koordinate aller Teile. Nur
// grob – Pfade werden nicht ausgerechnet –, aber genau genug für die Frage,
// ob ein Horn oder eine Antenne aus dem Bild ragt.
function minY(node, into = { y: Infinity }, offset = 0) {
  // Verschobene Gruppen (Räder, angehobene Gestalten) zählen mit ihrem
  // Versatz; gedrehte Teile bleiben aussen vor – ihre Lage ist so nicht zu
  // rechnen, und sie sind nie das höchste Teil.
  const transform = node.attrs.transform || "";
  const shift = transform.match(/translate\(\s*-?[\d.]+\s*[, ]\s*(-?[\d.]+)\s*\)/);
  if (transform && !shift) return into.y;
  const dy = offset + (shift ? Number(shift[1]) : 0);
  ["y", "cy", "y1", "y2"].forEach((key) => {
    if (node.attrs[key] !== undefined) into.y = Math.min(into.y, Number(node.attrs[key]) + dy);
  });
  if (node.attrs.points) {
    node.attrs.points.split(/\s+/).forEach((pair) => {
      const y = Number(pair.split(",")[1]);
      if (Number.isFinite(y)) into.y = Math.min(into.y, y + dy);
    });
  }
  if (node.attrs.d) into.y = Math.min(into.y, pathMinY(node.attrs.d) + dy);
  node.children.forEach((child) => minY(child, into, dy));
  return into.y;
}

// Der höchste Punkt eines Pfads: End- und Kontrollpunkte, absolute wie
// relative Befehle. Eine Kurve verlässt die Hülle ihrer Kontrollpunkte nie –
// die Schranke ist also eher zu streng als zu lasch.
function pathMinY(d) {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
  let cmd = "M";
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let min = Infinity;
  let i = 0;
  const num = () => Number(tokens[i++]);
  const see = (py) => { if (Number.isFinite(py)) min = Math.min(min, py); };
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) {
      cmd = tokens[i];
      i += 1;
      if (cmd.toUpperCase() === "Z") { x = sx; y = sy; continue; }
      if (i >= tokens.length) break;
    }
    const rel = cmd !== cmd.toUpperCase();
    const C = cmd.toUpperCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    if (C === "M" || C === "L" || C === "T") {
      x = ox + num(); y = oy + num(); see(y);
      if (C === "M") { sx = x; sy = y; cmd = rel ? "l" : "L"; }
    } else if (C === "H") { x = ox + num(); }
    else if (C === "V") { y = oy + num(); see(y); }
    else if (C === "C") { num(); see(oy + num()); num(); see(oy + num()); x = ox + num(); y = oy + num(); see(y); }
    else if (C === "S" || C === "Q") { num(); see(oy + num()); x = ox + num(); y = oy + num(); see(y); }
    else if (C === "A") { num(); num(); num(); num(); num(); x = ox + num(); y = oy + num(); see(y); }
    else { i += 1; }
  }
  return min;
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

// --- Wagen: jede Bauart über alle Schritte ------------------------------------
const AREA_COLOR = "#7C5CE6";
const STAGES = art.WAGON_STAGES;
assert(STAGES === 15, `ein Wagen hat fünfzehn Schritte, gefunden ${STAGES}`);
assert(art.WAGON_TYPES.length === 10, `zwei Sets zu fünf Wagen sind zehn Bauarten, gefunden ${art.WAGON_TYPES.length}`);

for (const type of art.WAGON_TYPES) {
  const shapes = [];

  for (let stage = 0; stage <= STAGES; stage += 1) {
    const wagon = art.buildWagon(type, AREA_COLOR, stage);
    shapes.push(serialize(wagon));

    assert(wagon.attrs["data-wagon"] === type, `${type}: data-wagon fehlt oder stimmt nicht`);
    assert(wagon.attrs["data-stage"] === String(stage), `${type} Stufe ${stage}: data-stage stimmt nicht`);
    assert(wagon.attrs["data-steps"] === String(STAGES), `${type} Stufe ${stage}: data-steps fehlt`);

    // Jeder gebaute Schritt hängt in seiner eigenen Gruppe – genau die Schritte
    // 1..stage, keiner doppelt vergessen, keiner aus der Zukunft. Und der
    // letzte Schritt zeichnet immer etwas: er ist der, der gerade gefeiert wird.
    const groups = stepGroups(wagon);
    const steps = new Set(groups.map((entry) => entry.step));
    assert(steps.size === stage, `${type} Stufe ${stage}: ${steps.size} Schritt-Gruppen statt ${stage}`);
    for (let s = 1; s <= stage; s += 1) assert(steps.has(s), `${type} Stufe ${stage}: Schritt ${s} hat keine Gruppe`);
    assert(groups.every((entry) => entry.step >= 1 && entry.step <= stage), `${type} Stufe ${stage}: eine Gruppe trägt einen Schritt jenseits der Stufe`);
    if (stage > 0) {
      const latest = groups.filter((entry) => entry.step === stage).reduce((sum, entry) => sum + entry.size, 0);
      assert(latest > 0, `${type} Stufe ${stage}: der neue Schritt zeichnet nichts`);
    }

    // Nichts darf oben aus dem Ausschnitt ragen, in dem der Wagen gross gezeigt wird.
    assert(minY(wagon) >= art.WAGON_VIEW.y, `${type} Stufe ${stage}: ragt über den Ausschnitt hinaus (y ${minY(wagon)} < ${art.WAGON_VIEW.y})`);
  }

  // Jeder Schritt muss sichtbar etwas verändern – sonst wäre er für ein Kind
  // keine Belohnung, sondern nur eine Zahl im Code.
  for (let stage = 1; stage <= STAGES; stage += 1) {
    assert(shapes[stage] !== shapes[stage - 1], `${type}: Stufe ${stage} sieht aus wie Stufe ${stage - 1}`);
  }

  // Und keine zwei Stufen dürfen gleich aussehen, auch nicht über Umwege.
  assert(new Set(shapes).size === STAGES + 1, `${type}: nicht alle ${STAGES + 1} Stufen sehen unterschiedlich aus`);

  // Stufe 0 ist das nackte Fahrgestell, muss aber schon die Bereichsfarbe
  // tragen: sonst ist am Anfang nicht erkennbar, welcher Wagen wohin gehört.
  const bare = art.buildWagon(type, AREA_COLOR, 0);
  const colors = [...collectAttr(bare, "fill"), ...collectAttr(bare, "stroke")].map((c) => c.toLowerCase());
  assert(colors.includes(AREA_COLOR.toLowerCase()), `${type} Stufe 0 trägt die Bereichsfarbe nicht`);
  assert(stepGroups(bare).length === 0, `${type} Stufe 0 hat schon Schritte`);

  // Fertig heisst goldene Räder.
  const done = art.buildWagon(type, AREA_COLOR, STAGES);
  assert(done.attrs.class.includes("is-complete"), `${type} Stufe ${STAGES} ist nicht als fertig markiert`);
  const gold = [...collectAttr(done, "fill"), ...collectAttr(done, "stroke")].map((c) => c.toLowerCase());
  assert(gold.includes("#f0b429"), `${type} Stufe ${STAGES} hat keine goldenen Räder`);
  assert(!art.buildWagon(type, AREA_COLOR, STAGES - 1).attrs.class.includes("is-complete"), `${type} gilt schon vor dem letzten Schritt als fertig`);
}

// Die Gestalten des zweiten Sets bewegen sich, wenn sie fertig sind – jede
// mindestens an einer Stelle, und nur über Klassen, die styles.css kennt.
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const classes = new Set();
for (const type of ["unicorn", "whale", "robot", "dragon", "ship"]) {
  const done = art.buildWagon(type, AREA_COLOR, STAGES);
  const moving = collectAttr(done, "class").filter((value) => /\bwa-/.test(value));
  assert(moving.length > 0, `${type}: fertig, aber nichts bewegt sich`);
  moving.forEach((value) => value.split(/\s+/).filter((name) => name.startsWith("wa-")).forEach((name) => classes.add(name)));
}
for (const name of classes) {
  assert(css.includes(`.${name}`), `styles.css kennt die Bewegung .${name} nicht`);
}
assert(/prefers-reduced-motion[^}]*\{[^}]*\.wa\b[^}]*animation:\s*none/s.test(css), "styles.css hält die Gestalten bei weniger Bewegung nicht still");

// Ausserhalb des Bereichs 0..15 darf nichts kaputtgehen.
assert(art.buildWagon("boxcar", AREA_COLOR, -5).attrs["data-stage"] === "0", "negative Stufe wird nicht abgefangen");
assert(art.buildWagon("boxcar", AREA_COLOR, 99).attrs["data-stage"] === String(STAGES), "zu hohe Stufe wird nicht abgefangen");
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
const train = progressContext.window.LernappTrain;
const spiele = train.AREAS.flatMap((area) => area.games.map((game) => game.id));
assert(spiele.length === 25, `erwartet 25 Spiele im Zug, gefunden ${spiele.length}`);

// Jedes Set nennt für jeden Bereich eine Bauart, die es auch gibt – und die
// zehn Wagen der zwei Sets sind zehn verschiedene.
const bauarten = new Set();
for (const set of train.SETS) {
  for (const area of train.AREAS) {
    const wagon = set.wagons[area.id];
    assert(art.WAGON_TYPES.includes(wagon), `Set ${set.id}: ${area.id} hat die unbekannte Bauart ${wagon}`);
    assert(!bauarten.has(wagon), `Set ${set.id}: ${wagon} kommt zweimal vor`);
    bauarten.add(wagon);
  }
}
assert(train.STAGE_COUNT === STAGES, "train-progress.js und train-art.js zählen verschieden viele Schritte");

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
for (const set of train.SETS) {
  const areas = train.AREAS.map((area, index) => ({ id: area.id, wagon: set.wagons[area.id], color: area.color, stage: index * 3 }));
  const zug = art.buildTrain(areas, base);
  assert(zug.nodeName === "svg", "buildTrain liefert kein svg");
  const placed = collectAttr(zug, "data-area");
  assert(placed.length === 5, `erwartet 5 Wagen im Zug, gefunden ${placed.length}`);
  const viewBox = zug.attrs.viewBox.split(" ").map(Number);
  assert(viewBox[2] > art.LOCO_W + 5 * art.WAGON_W, "der Zug ist schmaler als seine Teile");
  assert(viewBox[3] === art.ART_H, "die Höhe des Zugs passt nicht zum Koordinatensystem");
}

console.log(`Zug-Zeichnung geprüft: ${art.WAGON_TYPES.length} Bauarten × ${STAGES + 1} Stufen, ${variants.length} Lok-Varianten, ${art.DRIVERS.length} Tiere, ${spiele.length} Gebäude, ${classes.size} Bewegungen.`);
