/*
 * Prüft "Wo hält der Zug?" aus zahlengleis.js, ohne Browser.
 *
 * Die vier Stufen mit ihren Gleisen, der Plan der zehn Zahlen und die
 * Toleranzen stehen als Tabellen in der Datei. Eine Zahl, die an einem Ende
 * liegt, stünde schon angeschrieben da; eine Toleranz, die grösser ist als
 * das Gleis, gäbe jedem Tipp drei Punkte; eine Stufe, die leichter ist als
 * die davor, hiesse "schwerer" und wäre es nicht. All das fiele im Spiel erst
 * auf, wenn ein Kind es merkt.
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

// Wie viele Marken ein Gleis trägt, die Bahnhöfe mitgezählt.
const markenAuf = (gleis) => Math.floor(gleis.bis / gleis.marken) + 1;

// --- Die Stufen ---------------------------------------------------------------
assert(api.STUFEN.length === 4, `vier Stufen erwartet, gefunden ${api.STUFEN.length}`);
api.STUFEN.forEach((stufe, i) => {
  assert(stufe.nr === i + 1, `Stufe an Stelle ${i + 1} heisst ${stufe.nr}`);
  assert(typeof stufe.name === "string" && stufe.name.length > 0, `Stufe ${stufe.nr} hat keinen Namen für den Lautsprecher`);
  assert(Number.isInteger(stufe.striche) && stufe.striche >= 0, `Stufe ${stufe.nr}: Striche auf dem Knopf fehlen`);
  assert(Array.isArray(stufe.gleise) && stufe.gleise.length === 3, `Stufe ${stufe.nr}: drei Gleise erwartet`);
  assert(stufe.bis === Math.max(...stufe.gleise.map((g) => g.bis)), `Stufe ${stufe.nr}: bis ${stufe.bis} ist nicht das längste Gleis`);
  stufe.gleise.forEach((gleis, k) => {
    assert(Number.isInteger(gleis.bis) && gleis.bis >= 3, `Stufe ${stufe.nr}, Gleis ${k + 1}: bis ${gleis.bis} ist zu kurz`);
    assert(Number.isInteger(gleis.marken) && gleis.marken >= 1 && gleis.bis % gleis.marken === 0, `Stufe ${stufe.nr}, Gleis ${k + 1}: die Marken gehen nicht auf`);
    if (k) assert(gleis.bis >= stufe.gleise[k - 1].bis, `Stufe ${stufe.nr}: Gleis ${k + 1} ist kürzer als das davor`);
    if (k && gleis.bis === stufe.gleise[k - 1].bis) {
      assert(markenAuf(gleis) < markenAuf(stufe.gleise[k - 1]), `Stufe ${stufe.nr}: Gleis ${k + 1} ist gleich lang wie das davor, aber nicht schwerer`);
    }
  });
  // Der Knopf zeigt die Striche der Stufe – nach rechts immer weniger.
  if (i) assert(stufe.striche < api.STUFEN[i - 1].striche, `Stufe ${stufe.nr}: der Knopf zeigt nicht weniger Striche als der davor`);
  // Schwerer heisst: grössere Zahlen oder weniger Marken – nie leichter.
  if (i) {
    const vorher = api.STUFEN[i - 1];
    assert(stufe.bis >= vorher.bis, `Stufe ${stufe.nr} geht weniger weit als Stufe ${vorher.nr}`);
    const dichte = (s) => s.gleise.reduce((sum, g) => sum + markenAuf(g), 0);
    assert(stufe.bis > vorher.bis || dichte(stufe) < dichte(vorher), `Stufe ${stufe.nr} ist nicht schwerer als Stufe ${vorher.nr}`);
  }
});
assert(api.STUFEN[0].gleise[0].marken === 1 && api.STUFEN[0].gleise[0].zahlen === true, "das allererste Gleis trägt an jeder Zahl eine Marke mit Zahl – hier wird gezählt");
assert(api.STUFEN[0].bis === 20, "die erste Stufe geht bis zwanzig");
assert(api.STUFEN[3].bis === 100, "die letzte Stufe geht bis hundert");
api.STUFEN[3].gleise.forEach((g, k) => assert(g.marken === g.bis, `Stufe 4, Gleis ${k + 1}: die letzte Stufe hat keine Marken zwischen den Bahnhöfen`));
api.STUFEN.slice(1).forEach((stufe) => stufe.gleise.forEach((g, k) => assert(!g.zahlen, `Stufe ${stufe.nr}, Gleis ${k + 1}: ab der zweiten Stufe stehen keine Zahlen an den Marken`)));

// --- Der Plan -----------------------------------------------------------------
assert(api.PLAN.length === api.ZAHLEN_JE_RUNDE && api.ZAHLEN_JE_RUNDE === 10, "zehn Zahlen je Runde");
api.PLAN.forEach((g, i) => {
  assert(Number.isInteger(g) && g >= 0 && g < 3, `Zahl ${i + 1} liegt auf einem Gleis, das es nicht gibt`);
  if (i) assert(g >= api.PLAN[i - 1], `Zahl ${i + 1} fällt auf ein kürzeres Gleis zurück`);
});
assert(api.PLAN[0] === 0 && api.PLAN[api.PLAN.length - 1] === 2, "die Runde beginnt auf dem kurzen und endet auf dem langen Gleis");
[0, 1, 2].forEach((g) => assert(api.PLAN.includes(g), `Gleis ${g + 1} kommt in keiner Runde vor`));
api.STUFEN.forEach((stufe) => {
  for (let i = 0; i < api.ZAHLEN_JE_RUNDE; i += 1) assert(api.gleisFuer(stufe, i) === stufe.gleise[api.PLAN[i]], `Stufe ${stufe.nr}: gleisFuer folgt dem Plan nicht`);
});

// --- Die Toleranzen -----------------------------------------------------------
// Fünf Stufen von innen nach aussen; jede weiter als die davor, die äusserste
// enger als die halbe Strecke – sonst gäbe es für die halbe Strecke daneben
// noch einen Punkt.
const RINGE = ["genau", "fast", "knapp", "nah", "weit"];
assert(api.WIE.length === 6 && api.WIE[5] === "genau" && api.WIE[0] === "daneben", "sechs Antworten von daneben bis genau");
const gleise = api.STUFEN.flatMap((s) => s.gleise);
gleise.forEach((gleis) => {
  const t = api.toleranzFuer(gleis.bis);
  RINGE.forEach((ring, i) => {
    assert(t[ring] > 0, `Gleis bis ${gleis.bis}: Toleranz "${ring}" fehlt`);
    if (i) assert(t[ring] > t[RINGE[i - 1]], `Gleis bis ${gleis.bis}: die Toleranzen müssen von "${RINGE[i - 1]}" zu "${ring}" steigen`);
  });
  assert(t.weit < gleis.bis / 2, `Gleis bis ${gleis.bis}: einen Punkt gäbe es noch für die halbe Strecke daneben`);
  // Ein Finger ist auf jedem Gleis gleich breit; in Zahlen gerechnet wächst
  // die Toleranz mit dem Gleis, im Verhältnis wird sie nie grosszügiger als
  // auf dem kurzen Gleis – und "genau" heisst wirklich genau.
  assert(t.genau <= Math.max(0.15, gleis.bis * 0.035) + 1e-9, `Gleis bis ${gleis.bis}: "genau" ist grosszügiger als dreieinhalb Prozent`);
});
for (let bis = 5; bis <= 100; bis += 1) {
  const a = api.toleranzFuer(bis);
  const b = api.toleranzFuer(bis + 1);
  RINGE.forEach((ring) => assert(a[ring] <= b[ring], `die Toleranz "${ring}" fällt zwischen ${bis} und ${bis + 1}`));
}
// Fünf Punkte für die Mitte auf der Zahl, dann eins weniger je Ring.
assert(api.punkteFuer(0, 5) === 5 && api.punkteFuer(-0.1, 5) === 5, "genau getroffen gibt fünf Punkte");
assert([0.3, 0.6, 1, 1.8, 2.2].map((d) => api.punkteFuer(d, 5)).join(",") === "4,3,2,1,0", `auf dem kurzen Gleis stimmen die Ringe nicht: ${[0.3, 0.6, 1, 1.8, 2.2].map((d) => api.punkteFuer(d, 5)).join(",")}`);
assert([0.3, 0.8, 1.5, 2.5, 4.9, 5.1].map((d) => api.punkteFuer(d, 20)).join(",") === "5,4,3,2,1,0", `auf dem Gleis bis zwanzig stimmen die Ringe nicht: ${[0.3, 0.8, 1.5, 2.5, 4.9, 5.1].map((d) => api.punkteFuer(d, 20)).join(",")}`);
assert([1.5, 4, 7, 12, 24, 26].map((d) => api.punkteFuer(d, 100)).join(",") === "5,4,3,2,1,0", `auf dem Gleis bis hundert stimmen die Ringe nicht: ${[1.5, 4, 7, 12, 24, 26].map((d) => api.punkteFuer(d, 100)).join(",")}`);
for (let bis = 5; bis <= 100; bis += 5) {
  let vorher = 5;
  for (let d = 0; d <= bis / 2; d += bis / 400) {
    const p = api.punkteFuer(d, bis);
    assert(p <= vorher, `Gleis bis ${bis}: weiter weg gibt mehr Punkte (${d})`);
    vorher = p;
  }
  assert(api.punkteFuer(bis / 2, bis) === 0, `Gleis bis ${bis}: die halbe Strecke daneben gibt noch Punkte`);
}

// --- Die Zahlen ---------------------------------------------------------------
gleise.forEach((gleis) => {
  const gesehen = new Set();
  let vorher = null;
  for (let i = 0; i < 4000; i += 1) {
    const zahl = api.zahlFuer(gleis, vorher);
    assert(Number.isInteger(zahl) && zahl >= 1 && zahl <= gleis.bis - 1, `Gleis bis ${gleis.bis}: ${zahl} liegt nicht zwischen den Bahnhöfen`);
    assert(zahl !== vorher, `Gleis bis ${gleis.bis}: ${zahl} kam zweimal hintereinander`);
    gesehen.add(zahl);
    vorher = zahl;
  }
  assert(gesehen.size === gleis.bis - 1, `Gleis bis ${gleis.bis}: nicht jede Zahl kommt dran (${gesehen.size} von ${gleis.bis - 1})`);
});

// --- Die Schwelle im Zug ------------------------------------------------------
// Höchstens fünfzig Punkte je Runde; die gute Runde in train-progress.js muss
// darunter liegen, sonst gäbe es nie drei Sterne.
const max = api.ZAHLEN_JE_RUNDE * api.PUNKTE_JE_ZAHL;
assert(max === 50, `fünfzig Punkte je Runde erwartet, gerechnet ${max}`);
const progress = fs.readFileSync(path.join(root, "train-progress.js"), "utf8");
const gut = Number((progress.match(/numberLine: runsProgress\(NUMBERLINE_KEY, (\d+)\)/) || [])[1]);
assert(gut > max / 2 && gut < max, `train-progress.js verlangt ${gut} Punkte für drei Sterne – bei höchstens ${max}`);

console.log(`Wo hält der Zug? geprüft: ${api.STUFEN.length} Stufen bis ${api.STUFEN.map((s) => s.bis).join("/")}, ${api.ZAHLEN_JE_RUNDE} Zahlen je Runde, gute Runde ab ${gut} von ${max}.`);
