/*
 * Prüft Weichen-Wirrwarr aus weichen.js, ohne Browser.
 *
 * Die zehn Level stehen als Tabelle in der Datei; das Streckennetz wird für
 * jede Farbzahl gerechnet. Beides muss stimmen, sonst steht ein Kind vor einem
 * Haus, das es gar nicht erreichen kann.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "weichen.js"), "utf8");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// Die Datei steigt ohne die passende Seite sofort aus – also eine geben.
const windowStub = {};
const context = vm.createContext({
  window: windowStub,
  document: {
    body: { dataset: { page: "trackrouter" } },
    querySelector: (sel) => (sel === "#tr-stage" ? { style: { setProperty() {} }, dataset: {}, innerHTML: "", append() {} } : null),
    createElement: () => ({ className: "", style: {}, setAttribute() {}, append() {}, addEventListener() {} }),
    addEventListener() {},
  },
  performance: { now: () => 0 },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  console,
});
windowStub.LernappGameShell = {
  mount: () => ({
    play: { append() {}, innerHTML: "" },
    el: () => ({ style: { setProperty() {} }, setAttribute() {}, append() {}, addEventListener() {}, classList: { add() {} } }),
    setPhase() {}, setCount() {}, clear() {}, closeOverlay() {}, showResult() {}, startClock() {}, stopClock() {},
  }),
};
windowStub.LernappTrainArt = { shade: (hex) => hex };
windowStub.addEventListener = () => {};
vm.runInContext(source, context);

const api = windowStub.LernappWeichen;
assert(api, "weichen.js hat window.LernappWeichen nicht gesetzt");

// --- Die Tabelle der zehn Level ---------------------------------------------
// Genau so, wie sie bestellt wurde. Eine Zahl, die sich unbemerkt verschiebt,
// macht aus dem Einstiegslevel ein Level für Fortgeschrittene.
const SOLL = [
  [3, 15], [4, 15], [5, 20], [5, 25], [6, 25],
  [6, 30], [7, 30], [8, 30], [8, 35], [9, 35],
];

assert(api.LEVELS.length === 10, `erwartet 10 Level, gefunden ${api.LEVELS.length}`);
api.LEVELS.forEach((level, index) => {
  const [farben, zuege] = SOLL[index];
  assert(level.nr === index + 1, `Level an Stelle ${index + 1} heisst ${level.nr}`);
  assert(level.farben === farben, `Level ${level.nr}: ${level.farben} Farben statt ${farben}`);
  assert(level.zuege === zuege, `Level ${level.nr}: ${level.zuege} Züge statt ${zuege}`);
  assert(level.tempo > 0 && level.takt > 0, `Level ${level.nr}: Tempo oder Takt fehlt`);
  assert(level.gleichzeitig >= 1 && level.gleichzeitig <= 6, `Level ${level.nr}: ${level.gleichzeitig} Züge gleichzeitig sind unsinnig`);
});

// Ab Level 4 zieht das Tempo an, und es fällt danach nie wieder ab.
assert(api.LEVELS[3].tempo > api.LEVELS[2].tempo, "ab Level 4 sollte es schneller werden");
api.LEVELS.forEach((level, index) => {
  if (index === 0) return;
  assert(level.tempo >= api.LEVELS[index - 1].tempo, `Level ${level.nr} ist langsamer als das davor`);
  assert(level.takt <= api.LEVELS[index - 1].takt, `Level ${level.nr} lässt mehr Zeit zwischen den Zügen als das davor`);
});

// Genug Farben für das schwerste Level, und jede mit eigenem Zeichen.
const maxFarben = Math.max(...api.LEVELS.map((level) => level.farben));
assert(api.FARBEN.length >= maxFarben, `${api.FARBEN.length} Farben reichen nicht für ${maxFarben} Häuser`);
const zeichen = api.FARBEN.slice(0, maxFarben).map((f) => f.symbol);
assert(new Set(zeichen).size === zeichen.length, `doppelte Zeichen: ${zeichen.join(" ")}`);
const farbwerte = api.FARBEN.slice(0, maxFarben).map((f) => f.color);
assert(new Set(farbwerte).size === farbwerte.length, "zwei Häuser haben dieselbe Farbe");

// --- Das Streckennetz -------------------------------------------------------
for (let count = 2; count <= maxFarben; count += 1) {
  const net = buildAndCheck(count);
  assert(net.switches === count - 1, `${count} Häuser brauchen ${count - 1} Weichen, gebaut wurden ${net.switches}`);
}

function buildAndCheck(count) {
  const net = api.buildNet(count);
  const byId = Object.fromEntries(net.nodes.map((node) => [node.id, node]));
  const out = (id) => net.edges.filter(([from]) => from === id).map(([, to]) => to);

  const stations = net.nodes.filter((node) => node.type === "station");
  const switches = net.nodes.filter((node) => node.type === "switch");
  const spawns = net.nodes.filter((node) => node.type === "spawn");
  assert(stations.length === count, `${count} Farben, aber ${stations.length} Häuser`);
  assert(spawns.length === 1, `erwartet genau einen Tunnel, gefunden ${spawns.length}`);

  // Jede Weiche hat genau zwei Äste – eine mit einem wäre keine Weiche, eine
  // mit dreien liesse sich nicht durch Antippen umstellen.
  switches.forEach((node) => {
    assert(out(node.id).length === 2, `${node.id} hat ${out(node.id).length} Äste statt 2`);
  });

  // Von der Einfahrt aus muss jedes Haus genau einen Weg haben: erreichbar,
  // und ohne zweite Route, die dieselbe Weiche mehrdeutig machte.
  const wege = {};
  (function walk(id, tiefe) {
    assert(tiefe < 40, "das Netz hat einen Kreis");
    const node = byId[id];
    assert(node, `Kante zeigt auf ein Nichts: ${id}`);
    if (node.type === "station") { wege[id] = (wege[id] || 0) + 1; return; }
    const kinder = out(id);
    assert(kinder.length > 0, `${id} ist eine Sackgasse`);
    kinder.forEach((child) => walk(child, tiefe + 1));
  }("start", 0));

  stations.forEach((node) => {
    assert(wege[node.id] === 1, `${node.id} ist ${wege[node.id] || 0}-mal erreichbar statt genau einmal`);
  });

  // Nichts darf ausserhalb der Fläche liegen, und die Häuser stehen rechts.
  net.nodes.forEach((node) => {
    assert(node.x >= 0 && node.x <= 1 && node.y >= 0 && node.y <= 1, `${node.id} liegt bei ${node.x}/${node.y}`);
  });
  stations.forEach((node) => assert(node.x > 0.85, `${node.id} steht nicht rechts (x = ${node.x})`));
  switches.forEach((node) => assert(node.x >= api.FIRST_SWITCH_X - 1e-9 && node.x < 0.85, `${node.id} liegt bei x = ${node.x}`));

  // Die Strecke aus dem Tunnel bis zur ersten Weiche ist die Bedenkzeit. Sie
  // muss deutlich länger sein als ein Gleisstück dahinter – sonst steht das
  // Kind vor der ersten Weiche, bevor es die Farbe gelesen hat.
  const anlauf = api.FIRST_SWITCH_X - spawns[0].x;
  assert(anlauf > 0.25, `nur ${anlauf.toFixed(2)} Bildbreiten Anlauf bis zur ersten Weiche`);
  const tiefsteWeiche = Math.max(...switches.map((node) => node.x));
  assert(anlauf > (tiefsteWeiche - api.FIRST_SWITCH_X) / Math.max(1, switches.length - 1) || switches.length === 1,
    "der Anlauf ist kürzer als der Abstand zwischen zwei Weichen");

  // Die Häuser dürfen sich nicht überlappen: bei neun übereinander ist der
  // Abstand am knappsten.
  const ys = stations.map((node) => node.y).sort((a, b) => a - b);
  for (let i = 1; i < ys.length; i += 1) {
    assert(ys[i] - ys[i - 1] > 0.7 / count, `zwei Häuser liegen zu dicht: ${ys[i - 1]} und ${ys[i]}`);
  }

  return { switches: switches.length };
}

// --- Die Sternregel ---------------------------------------------------------
// Fehlerlos drei, bis vier verfahrene zwei, darüber einer.
assert(api.starsFor(0) === 3, "fehlerlos muss drei Sterne geben");
[1, 2, 3, 4].forEach((n) => assert(api.starsFor(n) === 2, `${n} verfahrene Züge müssen zwei Sterne geben`));
[5, 9, 30].forEach((n) => assert(api.starsFor(n) === 1, `${n} verfahrene Züge müssen einen Stern geben`));
assert(api.LEVELS_FOR_DONE === 5, `erwartet 5 Level bis zum fertigen Wagen, gefunden ${api.LEVELS_FOR_DONE}`);

console.log(`Weichen-Wirrwarr geprüft: 10 Level, ${maxFarben} Farben, Netze für 2–${maxFarben} Häuser ohne Sackgasse.`);
