/*
 * Prüft, welche Stimme vorliest (kids.js, lesen-ton.js):
 *
 *   - Ohne Wahl nimmt die App die natürlichste deutsche Stimme des Geräts –
 *     in Edge die «Natural»-Stimmen statt der alten Systemstimmen, in Chrome
 *     «Google Deutsch», auf Android die deutsche des Geräts. Bei gleicher Güte
 *     eine Männerstimme wie die aufgenommenen Laute, dann eine aus der Schweiz.
 *   - Eine Wahl (Karte «Stimme auf diesem Gerät») gilt für den Lautsprecher
 *     und die Leseecke; gibt es die Stimme auf diesem Gerät nicht, gilt wieder
 *     die beste.
 *   - Keine künstlich höhere Stimme mehr (pitch 1), und die Sprache folgt der
 *     Stimme (de-CH für eine Schweizer).
 *   - Kommen die Stimmen erst später (voiceschanged), erfährt es die Karte.
 *
 * Läuft ohne Browser: ein Ersatz für die Sprachausgabe schreibt mit, was mit
 * welcher Stimme gesprochen würde.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }

const stimme = (name, lang, lokal = true) => ({ name, lang, localService: lokal, voiceURI: name, default: false });
const GERAETE = {
  edge: [
    stimme("Microsoft Hedda - German (Germany)", "de-DE"),
    stimme("Microsoft Katja - German (Germany)", "de-DE"),
    stimme("Microsoft Stefan - German (Germany)", "de-DE"),
    stimme("Microsoft Aria Online (Natural) - English (United States)", "en-US", false),
    stimme("Microsoft Katja Online (Natural) - German (Germany)", "de-DE", false),
    stimme("Microsoft Conrad Online (Natural) - German (Germany)", "de-DE", false),
    stimme("Microsoft Leni Online (Natural) - German (Switzerland)", "de-CH", false),
    stimme("Microsoft Jan Online (Natural) - German (Switzerland)", "de-CH", false),
  ],
  chrome: [
    stimme("Microsoft Hedda - German (Germany)", "de-DE"),
    stimme("Microsoft Stefan - German (Germany)", "de-DE"),
    stimme("Google US English", "en-US", false),
    stimme("Google Deutsch", "de-DE", false),
  ],
  android: [
    stimme("English United States", "en-US"),
    stimme("Deutsch Deutschland", "de-DE"),
  ],
  apple: [
    stimme("Anna", "de-DE"),
    stimme("Markus", "de-DE"),
    stimme("Anna (Erweitert)", "de-DE"),
  ],
};

// --- Ersatz für Browser und Sprachausgabe --------------------------------------
let stimmen = [];
const gesprochen = [];
const hoerer = {};
const synth = {
  speaking: false,
  pending: false,
  getVoices: () => stimmen,
  speak(u) {
    gesprochen.push({ text: u.text, stimme: u.voice?.name || null, lang: u.lang, pitch: u.pitch, rate: u.rate });
    // Fertig gesprochen – gleich danach, wie ein schneller Browser.
    Promise.resolve().then(() => (u.liste?.end || []).forEach((fn) => fn()));
  },
  cancel() {},
  addEventListener(typ, fn) { (hoerer[typ] ||= []).push(fn); },
};
class Aeusserung {
  constructor(text) { this.text = text; this.voice = null; this.lang = ""; this.pitch = 1; this.rate = 1; this.liste = {}; }
  addEventListener(typ, fn) { (this.liste[typ] ||= []).push(fn); }
}
const speicher = new Map();
const localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
  key: (i) => [...speicher.keys()][i] ?? null,
  get length() { return speicher.size; },
};
const element = () => ({
  style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  dataset: {}, setAttribute() {}, removeAttribute() {}, append() {}, prepend() {}, remove() {},
  addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], focus() {},
});
const windowStub = {
  speechSynthesis: synth,
  SpeechSynthesisUtterance: Aeusserung,
  setTimeout: () => 0,
  clearTimeout() {},
  setInterval: () => 0,
  clearInterval() {},
  addEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {} }),
};
const context = vm.createContext({
  window: windowStub,
  document: {
    documentElement: { dataset: {} },
    body: { append() {}, dataset: {}, classList: element().classList },
    // Die festen Knöpfe (Lautsprecher, Ton) baut kids.js gleich beim Laden.
    createElement: () => ({ ...element(), querySelector: () => element() }),
    querySelector: () => null,
    addEventListener() {},
    readyState: "complete",
    hidden: false,
  },
  localStorage,
  navigator: {},
  console,
  setTimeout: () => 0,
  clearTimeout() {},
  setInterval: () => 0,
  clearInterval() {},
});
for (const datei of ["kids.js", "lesen-ton.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, datei), "utf8"), context, { filename: datei });
}
const kids = windowStub.LernappKids;
const ton = windowStub.LernappLeseTon;
assert(kids && ton, "kids.js oder lesen-ton.js hat sich nicht gemeldet");
for (const name of ["deutscheStimmen", "pickGermanVoice", "stimmeId", "stimmeName", "gewaehlteStimme", "stimmeWaehlen", "stimmeProbe", "onStimmen"]) {
  assert(typeof kids[name] === "function", `kids.js: ${name} fehlt`);
}
assert(kids.STIMME_KEY === "lernapp.stimme", `kids.js: die Wahl liegt unter ${kids.STIMME_KEY}`);

// Neue Stimmen: so, als meldete der Browser sie (voiceschanged).
const geraet = (liste) => { stimmen = liste; (hoerer.voiceschanged || []).forEach((fn) => fn()); };

// --- 1. Ohne Stimmen: kein Absturz, kein Name -----------------------------------
let gemeldet = 0;
kids.onStimmen(() => { gemeldet += 1; });
assert(kids.pickGermanVoice() === null, "ohne Stimmen: es gibt trotzdem eine");
kids.speak("Hallo");
assert(gesprochen.at(-1)?.lang === "de-DE" && gesprochen.at(-1)?.stimme === null, `ohne Stimmen: ${JSON.stringify(gesprochen.at(-1))}`);

// --- 2. Die beste Stimme je Gerät -----------------------------------------------
const soll = {
  edge: "Microsoft Jan Online (Natural) - German (Switzerland)",
  chrome: "Google Deutsch",
  android: "Deutsch Deutschland",
  apple: "Anna (Erweitert)",
};
for (const [name, liste] of Object.entries(GERAETE)) {
  geraet(liste);
  const gewaehlt = kids.pickGermanVoice()?.name;
  assert(gewaehlt === soll[name], `${name}: es liest «${gewaehlt}» statt «${soll[name]}»`);
  assert(kids.deutscheStimmen().every((v) => /^de/i.test(v.lang)), `${name}: in der Auswahl steht eine Stimme, die nicht Deutsch spricht`);
}
assert(gemeldet === Object.keys(GERAETE).length, `die Karte erfuhr ${gemeldet}-mal von neuen Stimmen statt ${Object.keys(GERAETE).length}-mal`);

// Edge: natürliche zuerst, die alten Systemstimmen am Schluss; die Namen kurz.
geraet(GERAETE.edge);
const reihe = kids.deutscheStimmen().map((v) => kids.stimmeName(v));
assert(reihe.join(" | ") === "Jan (Schweiz, natürlich) | Conrad (Deutschland, natürlich) | Leni (Schweiz, natürlich) | Katja (Deutschland, natürlich) | Stefan (Deutschland) | Hedda (Deutschland) | Katja (Deutschland)",
  `Edge: die Auswahl lautet ${reihe.join(" | ")}`);

// --- 3. Gesprochen wird mit ihr, ohne künstliche Tonhöhe -----------------------
kids.speak("Der Lesewagen.");
let zuletzt = gesprochen.at(-1);
assert(zuletzt.stimme === soll.edge && zuletzt.lang === "de-CH" && zuletzt.pitch === 1, `Lautsprecher: ${JSON.stringify(zuletzt)}`);
await ton.sprich("Maus");
zuletzt = gesprochen.at(-1);
assert(zuletzt.stimme === soll.edge && zuletzt.lang === "de-CH" && zuletzt.pitch === 1, `Leseecke: ${JSON.stringify(zuletzt)}`);

// --- 4. Eine Wahl gilt für beide, auf diesem Gerät -------------------------------
const katja = "Microsoft Katja Online (Natural) - German (Germany)";
kids.stimmeWaehlen(katja);
assert(localStorage.getItem("lernapp.stimme") === katja, "die Wahl wurde nicht gemerkt");
kids.speak("Hallo");
assert(gesprochen.at(-1).stimme === katja && gesprochen.at(-1).lang === "de-DE", `nach der Wahl liest ${gesprochen.at(-1).stimme}`);
await ton.sprich("Haus");
assert(gesprochen.at(-1).stimme === katja, `die Leseecke liest nach der Wahl mit ${gesprochen.at(-1).stimme}`);
// Probehören: mit der Stimme, nach der gefragt ist – auch einer anderen.
kids.stimmeProbe("Microsoft Conrad Online (Natural) - German (Germany)");
assert(gesprochen.at(-1).stimme === "Microsoft Conrad Online (Natural) - German (Germany)", "Probe hören: falsche Stimme");
assert(kids.pickGermanVoice().name === katja, "Probe hören hat die Wahl geändert");

// --- 5. Auf einem Gerät ohne diese Stimme gilt wieder die beste -----------------
geraet(GERAETE.chrome);
assert(kids.pickGermanVoice()?.name === "Google Deutsch", `ohne die gewählte Stimme liest ${kids.pickGermanVoice()?.name}`);
assert(localStorage.getItem("lernapp.stimme") === katja, "die Wahl ging auf einem fremden Gerät verloren");

// --- 6. Automatisch heisst: keine Wahl ------------------------------------------
geraet(GERAETE.edge);
kids.stimmeWaehlen("");
assert(localStorage.getItem("lernapp.stimme") === null, "Automatisch liess die alte Wahl liegen");
assert(kids.pickGermanVoice()?.name === soll.edge, "nach «Automatisch» liest nicht die beste Stimme");

// --- 7. Die Wahl überlebt das Zurücksetzen (firebase.js, LOCAL_KEEP_KEYS) ------
const firebase = fs.readFileSync(path.join(root, "firebase.js"), "utf8");
const behalten = firebase.match(/const LOCAL_KEEP_KEYS = new Set\(\[([\s\S]*?)\]\);/)?.[1] || "";
assert(behalten.includes('"lernapp.stimme"'), "firebase.js: die gewählte Stimme gehört zu dem, was beim Zurücksetzen bleibt");
assert(/renderStimmeKarte\(\)/.test(firebase) && (firebase.match(/\$\{renderStimmeKarte\(\)\}/g) || []).length === 2,
  "firebase.js: die Karte «Stimme auf diesem Gerät» steht nicht im Profil mit und ohne Anmeldung");

console.log(`Stimme geprüft: die natürlichste deutsche je Gerät (Edge ${soll.edge.replace(/^Microsoft | Online.*$/g, "")}, Chrome Google Deutsch, Android, Apple), Wahl und Probehören, beides ohne künstliche Tonhöhe, und die Wahl bleibt beim Zurücksetzen.`);
