/*
 * Prüft die Landschaften (train-scenes.js):
 * Hat jede Szene alle vier Ebenen und ein Vorschaubild, sind die Farben
 * gültig, und schaltet der Fortschritt sie in der erwarteten Reihenfolge frei?
 *
 * Läuft ohne Browser mit demselben winzigen DOM-Ersatz wie die Zug-Zeichnung.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

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
for (const file of ["train-art.js", "train-scenes.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const scenes = windowStub.LernappScenes;
assert(scenes, "train-scenes.js hat window.LernappScenes nicht gesetzt");
assert(scenes.SCENES.length >= 4, `erwartet mindestens vier Landschaften, gefunden ${scenes.SCENES.length}`);

const LAYERS = ["clouds", "far", "mid", "near"];
const seen = new Set();

for (const scene of scenes.SCENES) {
  assert(scene.id && scene.label, "Landschaft ohne id oder Namen");
  assert(!seen.has(scene.id), `${scene.id} kommt doppelt vor`);
  seen.add(scene.id);

  assert(Array.isArray(scene.sky) && scene.sky.length === 2, `${scene.id}: der Himmel braucht zwei Farben`);
  for (const color of [...scene.sky, scene.ground, scene.groundDark, scene.light?.color]) {
    assert(/^#[0-9A-Fa-f]{6}$/.test(String(color)), `${scene.id}: ${color} ist keine Farbe`);
  }

  // Jede Ebene muss zeichnen. Eine leere Ebene fiele im Bild nicht auf, würde
  // aber ein Loch in die Tiefenstaffelung reissen.
  for (const layer of LAYERS) {
    assert(typeof scene.layers[layer] === "function", `${scene.id}: Ebene ${layer} fehlt`);
    const tile = scene.layers[layer]();
    assert(tile.nodeName === "svg", `${scene.id}/${layer}: liefert kein svg`);
    assert(countNodes(tile) > 2, `${scene.id}/${layer}: zeichnet nichts`);
    assert(tile.attrs.viewBox === `0 0 ${scenes.W} ${scenes.H}`, `${scene.id}/${layer}: falscher Ausschnitt`);
    // Ohne preserveAspectRatio="none" liesse sich die Kachel nicht auf die
    // Bandhöhe ziehen und die Schleife bekäme Lücken.
    assert(tile.attrs.preserveAspectRatio === "none", `${scene.id}/${layer}: Kachel wird nicht gestreckt`);
  }

  // Das Vorschaubild ist das Einzige, woran ein Kind die Landschaft in der
  // Auswahl erkennt – ein leeres wäre so gut wie keins.
  assert(typeof scene.thumb === "function", `${scene.id}: kein Vorschaubild`);
  const thumb = scene.thumb();
  assert(Array.isArray(thumb) && thumb.length >= 2, `${scene.id}: Vorschaubild ist zu leer`);
}

// Zwei Landschaften müssen von Anfang an da sein, sonst hätte ein neues Kind
// gar keine Wahl.
const free = scenes.SCENES.filter((scene) => scene.free).length;
assert(free >= 2, `erwartet mindestens zwei freie Landschaften, gefunden ${free}`);
assert(scenes.SCENES.slice(0, free).every((scene) => scene.free), "die freien Landschaften müssen vorne stehen");

assert(scenes.unlockedCount(0) === free, "ohne fertigen Wagen dürfen nur die freien Landschaften offen sein");
assert(scenes.unlockedCount(1) === free + 1, "ein fertiger Wagen muss genau eine Landschaft freischalten");
assert(scenes.unlockedCount(99) === scenes.SCENES.length, "mit allen Wagen müssen alle Landschaften offen sein");
assert(scenes.isUnlocked(scenes.SCENES[0].id, 0), "die erste Landschaft muss immer offen sein");
assert(!scenes.isUnlocked(scenes.SCENES.at(-1).id, 0), "die letzte Landschaft darf nicht von Anfang an offen sein");
assert(!scenes.isUnlocked("gibtsnicht", 99), "eine unbekannte Landschaft darf nicht als offen gelten");

// Die Vorschaubilder müssen sich unterscheiden – sechs Hügel mit Sonne wären
// in der Auswahl nicht auseinanderzuhalten.
const shapes = scenes.SCENES.map((scene) => JSON.stringify(scene.thumb().map((node) => [node.nodeName, node.attrs])));
assert(new Set(shapes).size === scenes.SCENES.length, "mindestens zwei Vorschaubilder sehen gleich aus");

const colors = new Set(scenes.SCENES.map((scene) => scene.sky[0]));
assert(colors.size === scenes.SCENES.length, "mindestens zwei Landschaften haben denselben Himmel");

console.log(`Landschaften geprüft: ${scenes.SCENES.length} Szenen × ${LAYERS.length} Ebenen, ${free} von Anfang an frei.`);
