/*
 * Prüft "Wo hält der Zug?" aus zahlengleis.js, ohne Browser.
 *
 * Die drei Gleise, der Plan der zehn Zahlen und die Toleranzen stehen als
 * Tabellen in der Datei. Eine Zahl, die an einem Ende liegt, stünde schon
 * angeschrieben da; eine Toleranz, die grösser ist als das Gleis, gäbe jedem
 * Tipp drei Punkte. Beides fiele im Spiel erst auf, wenn ein Kind es merkt.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "zahlengleis.js"), "utf8");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// Die Datei steigt ohne die passende Seite sofort aus – also eine geben.
const stubNode = () => ({
  style: { setProperty() {} }, dataset: {}, innerHTML: "", textContent: "",
  classList: { add() {}, remove() {}, toggle() {} },
  setAttribute() {}, append() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
});
const windowStub = { setTimeout: () => 1, clearTimeout() {}, addEventListener() {} };
const context = vm.createContext({
  window: windowStub,
  document: {
    body: { dataset: { page: "numberline" } },
    querySelector: (sel) => (sel === "#zg-stage" ? stubNode() : null),
    createElement: stubNode,
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  console,
});
windowStub.LernappGameShell = {
  mount: () => ({
    play: stubNode(), el: stubNode,
    setPhase() {}, setCount() {}, clear() {}, closeOverlay() {}, showResult() {}, startClock() {}, stopClock() {},
  }),
};
windowStub.LernappTrainArt = { el: stubNode, buildLoco: stubNode, locoConfig: (c) => c, LOCO_W: 200, GROUND: 170 };
vm.runInContext(source, context);

const api = windowStub.LernappZahlengleis;
assert(api, "zahlengleis.js hat window.LernappZahlengleis nicht gesetzt");

// --- Die Gleise ---------------------------------------------------------------
assert(api.STUFEN.length === 3, `drei Gleise erwartet, gefunden ${api.STUFEN.length}`);
api.STUFEN.forEach((stufe, i) => {
  assert(Number.isInteger(stufe.bis) && stufe.bis >= 3, `Gleis ${i + 1}: bis ${stufe.bis} ist zu kurz`);
  assert(Number.isInteger(stufe.marken) && stufe.marken >= 1 && stufe.bis % stufe.marken === 0, `Gleis ${i + 1}: die Marken gehen nicht auf`);
  if (i) assert(stufe.bis > api.STUFEN[i - 1].bis, `Gleis ${i + 1} ist nicht länger als das davor`);
});
assert(api.STUFEN[0].marken === 1, "das kurze Gleis trägt an jeder Zahl eine Marke – hier wird gezählt");
assert(api.STUFEN[api.STUFEN.length - 1].bis === 20, "das lange Gleis geht bis zwanzig");

// --- Der Plan -----------------------------------------------------------------
assert(api.PLAN.length === api.ZAHLEN_JE_RUNDE && api.ZAHLEN_JE_RUNDE === 10, "zehn Zahlen je Runde");
api.PLAN.forEach((stufe, i) => {
  assert(Number.isInteger(stufe) && stufe >= 0 && stufe < api.STUFEN.length, `Zahl ${i + 1} liegt auf einem Gleis, das es nicht gibt`);
  if (i) assert(stufe >= api.PLAN[i - 1], `Zahl ${i + 1} fällt auf ein kürzeres Gleis zurück`);
});
assert(api.PLAN[0] === 0 && api.PLAN[api.PLAN.length - 1] === api.STUFEN.length - 1, "die Runde beginnt auf dem kurzen und endet auf dem langen Gleis");
api.STUFEN.forEach((_, s) => assert(api.PLAN.includes(s), `Gleis ${s + 1} kommt in keiner Runde vor`));

// --- Die Toleranzen -----------------------------------------------------------
api.TOLERANZ.forEach((t, i) => {
  assert(t.genau > 0 && t.genau < t.knapp && t.knapp < t.nah, `Gleis ${i + 1}: die Toleranzen müssen steigen`);
  assert(t.nah < api.STUFEN[i].bis / 2, `Gleis ${i + 1}: einen Punkt gäbe es noch für die halbe Strecke daneben`);
  // Ein Finger ist auf jedem Gleis gleich breit; in Zahlen gerechnet muss die
  // Toleranz mit dem Gleis wachsen.
  if (i) assert(t.genau >= api.TOLERANZ[i - 1].genau, `Gleis ${i + 1} ist strenger als das kürzere davor`);
});
assert(api.punkteFuer(0, 0) === 3 && api.punkteFuer(-0.3, 0) === 3, "genau getroffen gibt drei Punkte");
assert(api.punkteFuer(0.6, 0) === 2 && api.punkteFuer(1.2, 0) === 1 && api.punkteFuer(3, 0) === 0, "die Stufen zwei, eins, null stimmen nicht");
assert(api.punkteFuer(4.9, 2) === 1 && api.punkteFuer(5.1, 2) === 0, "auf dem langen Gleis gibt es bis fünf daneben noch einen Punkt");

// --- Die Zahlen ---------------------------------------------------------------
for (let s = 0; s < api.STUFEN.length; s += 1) {
  const gesehen = new Set();
  let vorher = null;
  for (let i = 0; i < 400; i += 1) {
    const zahl = api.zahlFuer(s, vorher);
    assert(Number.isInteger(zahl) && zahl >= 1 && zahl <= api.STUFEN[s].bis - 1, `Gleis ${s + 1}: ${zahl} liegt nicht zwischen den Bahnhöfen`);
    assert(zahl !== vorher, `Gleis ${s + 1}: ${zahl} kam zweimal hintereinander`);
    gesehen.add(zahl);
    vorher = zahl;
  }
  assert(gesehen.size === api.STUFEN[s].bis - 1, `Gleis ${s + 1}: nicht jede Zahl kommt dran (${gesehen.size} von ${api.STUFEN[s].bis - 1})`);
}

// --- Die Schwelle im Zug ------------------------------------------------------
// Höchstens dreissig Punkte je Runde; die gute Runde in train-progress.js muss
// darunter liegen, sonst gäbe es nie drei Sterne.
const max = api.ZAHLEN_JE_RUNDE * api.PUNKTE_JE_ZAHL;
assert(max === 30, `dreissig Punkte je Runde erwartet, gerechnet ${max}`);
const progress = fs.readFileSync(path.join(root, "train-progress.js"), "utf8");
const gut = Number((progress.match(/numberLine: runsProgress\(NUMBERLINE_KEY, (\d+)\)/) || [])[1]);
assert(gut > max / 2 && gut < max, `train-progress.js verlangt ${gut} Punkte für drei Sterne – bei höchstens ${max}`);

console.log(`Wo hält der Zug? geprüft: ${api.STUFEN.length} Gleise bis ${api.STUFEN.map((s) => s.bis).join("/")}, ${api.ZAHLEN_JE_RUNDE} Zahlen je Runde, gute Runde ab ${gut} von ${max}.`);
