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

const noises = [];

class FakeContext {
  constructor() {
    this.state = "running";
    this.sampleRate = 48000;
    this.destination = { kind: "destination" };
  }
  get currentTime() { return now; }
  createGain() { return { gain: makeParam(), connect() {}, context: this }; }
  createOscillator() {
    const osc = { type: "sine", frequency: makeParam(), connect() {}, start() {}, stop() {} };
    osc.frequency.setValueAtTime = (freq, at) => { played.push({ freq, at }); return osc.frequency; };
    return osc;
  }
  // Für die Dampfpfeife: Rauschen durch ein Filter ist der Dampf. Ohne ihn
  // klänge das Horn nach Orgel statt nach Lok.
  createBuffer(channels, length, sampleRate) {
    return { length, sampleRate, numberOfChannels: channels, getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    const src = { buffer: null, loop: false, connect() {}, start(at) { src.startedAt = at; }, stop() {} };
    return src;
  }
  createBiquadFilter() {
    const filter = { type: "lowpass", frequency: makeParam(), Q: { value: 1 }, connect() {} };
    filter.frequency.setValueAtTime = (freq, at) => { noises.push({ freq, at, type: filter.type }); return filter.frequency; };
    return filter;
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
  // Ein echter Speicher, kein Leerlauf: der Ton-Schalter merkt sich seinen
  // Zustand dort, und ohne Gedächtnis liesse sich "aus" gar nicht prüfen.
  localStorage: {
    store: new Map(),
    getItem(key) { return this.store.has(key) ? this.store.get(key) : null; },
    setItem(key, value) { this.store.set(key, String(value)); },
    removeItem(key) { this.store.delete(key); },
    key(index) { return [...this.store.keys()][index] ?? null; },
    get length() { return this.store.size; },
  },
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

// --- Das Horn der Dampflok ---------------------------------------------------
// Zwei Stösse, jeder ein Moll-Dreiklang aus doppelt besetzten Rohren, dazu
// Dampf und danach die Auspuffschläge. Ein Piepser hätte einen Ton; wenn hier
// einer fehlt, klingt es nicht mehr nach Lok.
assert(typeof kids.playHorn === "function", "playHorn fehlt");
const musicNotes = played.length;
played.length = 0;
noises.length = 0;
now = 100;
kids.playHorn({ chuffs: 5 });

// Je Stimme werden zwei Tonhöhen gesetzt: der Ton selbst und das Nachlassen am
// Ende. Zwei Stösse zu drei Rohren zu zwei Stimmen ergeben also 24 Einträge zu
// vier Zeitpunkten.
const voices = played.filter((n) => n.at >= 100);
assert(voices.length === 24, `zwei Stösse zu drei Rohren mit je zwei Stimmen sind 24 Einträge, gefunden ${voices.length}`);

const times = [...new Set(voices.map((n) => Math.round(n.at * 1000) / 1000))].sort((a, b) => a - b);
assert(times.length === 4, `erwartet vier Zeitpunkte (Anfang und Nachlassen je Stoss), gefunden ${times.length}`);
const starts = [times[0], times[2]];
assert(starts[1] - starts[0] > 0.2 && starts[1] - starts[0] < 0.9,
  `zwischen den Stössen liegen ${(starts[1] - starts[0]).toFixed(2)} s – das ist kein "tüüt tüüt"`);
// Der zweite Stoss ist der lange: kurz, dann lang, wie beim Abfahrtssignal.
assert((times[3] - times[2]) > (times[1] - times[0]),
  "der zweite Stoss ist nicht länger als der erste");

// Ein Dreiklang, kein Einzelton: mindestens drei deutlich verschiedene Höhen.
const hornPitches = new Set(voices.map((n) => Math.round(n.freq / 5)));
assert(hornPitches.size >= 3, `das Horn hat nur ${hornPitches.size} Tonhöhen – ein Rohr statt eines Akkords`);
const hornLow = Math.min(...voices.map((n) => n.freq));
const hornHigh = Math.max(...voices.map((n) => n.freq));
assert(hornLow > 180 && hornLow < 400, `tiefstes Rohr ${hornLow.toFixed(0)} Hz passt nicht zu einer Dampflok`);
assert(hornHigh < 900, `höchstes Rohr ${hornHigh.toFixed(0)} Hz klingt nach Trillerpfeife`);

// Dampf: gefiltertes Rauschen zu jedem Stoss und zu jedem Auspuffschlag.
assert(noises.length >= 2 + 5 * 2, `zu wenig Rauschen (${noises.length}) – ohne Dampf klingt das Horn nach Orgel`);
const chuffTimes = noises.filter((n) => n.at > starts[1] + 0.6).map((n) => n.at).sort((a, b) => a - b);
assert(chuffTimes.length >= 5, `erwartet mindestens 5 Auspuffschläge, gefunden ${chuffTimes.length}`);

// Die Schläge müssen zusammenrücken – die Maschine kommt in Fahrt.
const gaps = [];
for (let i = 2; i < chuffTimes.length; i += 2) gaps.push(chuffTimes[i] - chuffTimes[i - 2]);
assert(gaps.length >= 2, "zu wenige Abstände zwischen den Schlägen");
assert(gaps[gaps.length - 1] < gaps[0], `die Auspuffschläge werden nicht schneller (${gaps[0].toFixed(2)} -> ${gaps[gaps.length - 1].toFixed(2)})`);

// Ohne Ton bleibt auch das Horn still.
kids.setAudioEnabled(false);
played.length = 0;
noises.length = 0;
kids.playHorn({ chuffs: 3 });
assert(played.length === 0 && noises.length === 0, "das Horn tönt trotz ausgeschaltetem Ton");
kids.setAudioEnabled(true);

console.log(`Menü-Musik geprüft: ${musicNotes} Töne über zwei Strophen, ${distinct} verschiedene Tonhöhen, ${lowest.toFixed(0)}–${highest.toFixed(0)} Hz.`);
console.log(`Dampfhorn geprüft: 2 Stösse × 3 Rohre × 2 Stimmen, ${hornLow.toFixed(0)}–${hornHigh.toFixed(0)} Hz, ${chuffTimes.length / 2} Auspuffschläge, die zusammenrücken.`);
