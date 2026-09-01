/*
 * Prüft die Menü-Musik in kids.js:
 * Klingt jeder geplante Ton – oder steckt irgendwo ein Notenname, den es in der
 * Tabelle nicht gibt? Ein Tippfehler dort ergibt keinen Fehler, sondern eine
 * stumme Stelle in der Melodie, und die hört man erst beim genauen Hinhören.
 *
 * Läuft ohne Browser: ein Web-Audio-Ersatz schreibt mit, was gespielt würde.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// --- Web-Audio-Ersatz -------------------------------------------------------
const played = [];
let now = 0;

function makeParam() {
  return {
    value: 1,
    setValueAtTime() { return this; },
    linearRampToValueAtTime() { return this; },
    exponentialRampToValueAtTime() { return this; },
    cancelScheduledValues() { return this; },
  };
}

class FakeContext {
  constructor() {
    this.state = "running";
    this.destination = { kind: "destination" };
  }
  get currentTime() { return now; }
  createGain() { return { gain: makeParam(), connect() {}, context: this }; }
  createOscillator() {
    const osc = { type: "sine", frequency: makeParam(), connect() {}, start() {}, stop() {} };
    osc.frequency.setValueAtTime = (freq, at) => { played.push({ freq, at }); return osc.frequency; };
    return osc;
  }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  addEventListener() {}
}

const timers = new Map();
let timerId = 0;
const windowStub = {
  AudioContext: FakeContext,
  setInterval: (fn) => { timerId += 1; timers.set(timerId, fn); return timerId; },
  clearInterval: (id) => { timers.delete(id); },
  setTimeout: () => 0,
  addEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {} }),
};

const elementStub = {
  style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  dataset: {}, hidden: false, disabled: false, title: "",
  setAttribute() {}, removeAttribute() {}, append() {}, prepend() {}, remove() {},
  addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
  focus() {}, set innerHTML(_v) {}, get innerHTML() { return ""; },
};

const context = vm.createContext({
  window: windowStub,
  document: {
    body: { append() {}, dataset: {}, classList: elementStub.classList },
    createElement: () => ({ ...elementStub, querySelector: () => ({ ...elementStub }) }),
    querySelector: () => null,
    addEventListener() {},
    readyState: "complete",
    hidden: false,
  },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  navigator: {},
  console,
  setInterval: windowStub.setInterval,
  clearInterval: windowStub.clearInterval,
  setTimeout: () => 0,
  speechSynthesis: undefined,
});
vm.runInContext(fs.readFileSync(path.join(root, "kids.js"), "utf8"), context, { filename: "kids.js" });

const kids = windowStub.LernappKids || context.window.LernappKids;
assert(kids, "kids.js hat window.LernappKids nicht gesetzt");
assert(typeof kids.startMusic === "function", "startMusic fehlt");
assert(typeof kids.stopMusic === "function", "stopMusic fehlt");

// --- Zwei volle Durchläufe planen -------------------------------------------
kids.startMusic();
assert(timers.size === 1, `erwartet einen Zeitgeber, gefunden ${timers.size}`);
assert(played.length > 0, "beim Start wird nichts geplant");

// Die Uhr weiterdrehen und den Zeitgeber laufen lassen, bis zwei Strophen
// durch sind. 96 Schläge zu 0,625 s sind zwei Runden zu je acht Takten.
for (let i = 0; i < 400 && now < 62; i += 1) {
  now += 0.2;
  timers.forEach((tick) => tick());
}

// Ein voller Durchlauf sind 48 Schritte: je ein Begleitton und, wo die Melodie
// eine Note hat, zwei weitere für den Glockenklang. Das ergibt rund 128 Töne
// je Runde – nach zwei Runden müssen also deutlich über 200 geplant sein.
assert(played.length > 200, `zwei Strophen ergeben mehr als 200 Töne, gefunden ${played.length}`);

// --- Jeder Ton muss eine echte Frequenz haben -------------------------------
// Genau hier schlägt ein vertippter Notenname zu: NOTES["G7"] ist undefined,
// und der Oszillator bliebe still.
const broken = played.filter((note) => !Number.isFinite(note.freq) || note.freq <= 0);
assert(broken.length === 0, `${broken.length} Töne ohne gültige Frequenz – vermutlich ein Notenname, den es nicht gibt`);

const lowest = Math.min(...played.map((n) => n.freq));
const highest = Math.max(...played.map((n) => n.freq));
assert(lowest > 100, `tiefster Ton ${lowest.toFixed(1)} Hz ist zu tief für kleine Lautsprecher`);
assert(highest < 3000, `höchster Ton ${highest.toFixed(1)} Hz ist zu schrill`);

// --- Die Töne müssen zeitlich vorwärts laufen -------------------------------
// Ein Ton, der in der Vergangenheit landet, spielt sofort – aus dem Walzer
// würde dann ein Stolpern.
const late = played.filter((note, i) => i > 0 && note.at < played[i - 1].at - 0.001);
assert(late.length === 0, `${late.length} Töne sind zeitlich rückwärts geplant`);

// --- Es muss abwechslungsreich bleiben --------------------------------------
const distinct = new Set(played.map((n) => Math.round(n.freq))).size;
assert(distinct >= 12, `nur ${distinct} verschiedene Töne – das klingt nach Tonleiter, nicht nach Lied`);

// --- Anhalten hält wirklich an ----------------------------------------------
kids.stopMusic();
const beforeStop = played.length;
assert(timers.size === 0, "stopMusic räumt den Zeitgeber nicht ab");
for (let i = 0; i < 20; i += 1) { now += 0.2; timers.forEach((tick) => tick()); }
assert(played.length === beforeStop, "nach stopMusic werden weiter Töne geplant");

console.log(`Menü-Musik geprüft: ${played.length} Töne über zwei Strophen, ${distinct} verschiedene Tonhöhen, ${lowest.toFixed(0)}–${highest.toFixed(0)} Hz.`);
