/*
 * Prüft "Halt am Signal" aus signal.js, ohne Browser.
 *
 * Das Spiel steht und fällt mit seiner Punktregel: wer immer tippt, darf
 * damit nicht gut abschneiden, sonst übt niemand das Warten. Hier wird mit den
 * Zahlen aus der Datei durchgerechnet, was die drei Strategien – immer
 * tippen, nie tippen, alles richtig – in einer Runde ergeben, und ob die
 * Schwelle für drei Sterne in train-progress.js dazu passt.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "signal.js"), "utf8");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// Die Datei steigt ohne die passende Seite sofort aus – also eine geben.
const stubNode = () => ({
  style: { setProperty() {} }, dataset: {}, innerHTML: "", textContent: "", className: "",
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  setAttribute() {}, append() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
});
const windowStub = { setTimeout: () => 1, clearTimeout() {}, addEventListener() {} };
const context = vm.createContext({
  window: windowStub,
  document: {
    body: { dataset: { page: "signal" } },
    querySelector: (sel) => (sel === "#sg-stage" ? stubNode() : null),
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

const api = windowStub.LernappSignal;
assert(api, "signal.js hat window.LernappSignal nicht gesetzt");

// --- Die Regel ----------------------------------------------------------------
assert(api.ROUND_MS === 45000, "eine Runde dauert fünfundvierzig Sekunden wie die anderen Tempospiele");
assert(api.GRUEN_ANTEIL >= 0.65 && api.GRUEN_ANTEIL <= 0.85, `Grün bei ${api.GRUEN_ANTEIL}: das Tippen wird nur zur Gewohnheit, wenn Grün klar überwiegt`);
assert(api.FEHLER_KOSTEN >= 2, "ein Tipp bei Rot muss mehr kosten als ein Treffer bringt");
assert(api.NACHLAUF_MS > 0 && api.NACHLAUF_MS < api.FAHRT_MS, "der Nachlauf ist eine Gnadenfrist, keine zweite Fahrt");
assert(api.FEHLER_MS > api.WEITER_MS, "ein Fehler muss länger aufhalten als ein Treffer");

assert(api.punkteFuer({ durch: 5, gewartet: 2, beiRot: 0 }) === 7, "Treffer und Warten zählen je einen Punkt");
assert(api.punkteFuer({ durch: 5, gewartet: 2, beiRot: 1 }) === 7 - api.FEHLER_KOSTEN, "ein Tipp bei Rot kostet");
assert(api.punkteFuer({ durch: 0, gewartet: 0, beiRot: 4 }) === 0, "unter null geht es nicht");
assert(api.punkteFuer({}) === 0, "ohne Züge gibt es keine Punkte");

// --- Die drei Strategien ------------------------------------------------------
// So viele Züge kommen in einer Runde ungefähr: jeder braucht die Fahrt, den
// Nachlauf und die Weiterfahrt.
const zuege = Math.floor(api.ROUND_MS / (api.FAHRT_MS + api.NACHLAUF_MS + api.WEITER_MS));
const gruen = Math.round(zuege * api.GRUEN_ANTEIL);
const rot = zuege - gruen;
const perfekt = api.punkteFuer({ durch: gruen, gewartet: rot, beiRot: 0 });
const immerTippen = api.punkteFuer({ durch: gruen, gewartet: 0, beiRot: rot });
const nieTippen = api.punkteFuer({ durch: 0, gewartet: rot, beiRot: 0 });

const progress = fs.readFileSync(path.join(root, "train-progress.js"), "utf8");
const gut = Number((progress.match(/goSignal: runsProgress\(SIGNAL_KEY, (\d+)\)/) || [])[1]);
assert(gut > 0, "train-progress.js nennt keine Schwelle für Halt am Signal");
assert(perfekt >= gut, `alles richtig gibt ${perfekt} Punkte, drei Sterne verlangen ${gut}`);
assert(immerTippen < gut / 2, `immer tippen gibt ${immerTippen} Punkte – das wären zwei Sterne (ab ${gut / 2})`);
assert(nieTippen < gut / 2, `nie tippen gibt ${nieTippen} Punkte – das wären zwei Sterne (ab ${gut / 2})`);
// Und wer fast alles richtig macht und einmal bei Rot tippt, hat trotzdem
// drei Sterne verdient.
const fastAlles = api.punkteFuer({ durch: gruen - 1, gewartet: rot - 1, beiRot: 1 });
assert(fastAlles >= gut, `einmal bei Rot getippt und sonst fast alles richtig gibt ${fastAlles} – drei Sterne verlangen ${gut}`);

console.log(`Halt am Signal geprüft: rund ${zuege} Züge je Runde, alles richtig ${perfekt}, immer tippen ${immerTippen}, nie tippen ${nieTippen}, drei Sterne ab ${gut}.`);
