/*
 * Prüft, dass Lok und Landschaft in der Cloud richtig ankommen und
 * zurückkommen – der Teil von firebase.js, der am selben Dokument hängt wie
 * der Fortschritt: users/<uid>.
 *
 * Hier geht es um die Regeln, nicht um das Bild:
 *   - Ohne Konto wird nichts geschrieben.
 *   - Beim Anmelden meldet die App, was in der Cloud steht.
 *   - Geschrieben wird zusammenführend, damit ein Feld den Fortschritt daneben
 *     nicht wegwirft.
 *   - Beim Abmelden meldet sie, dass nichts mehr gilt.
 *
 * Läuft ohne Browser und ohne Netz: ein Firestore-Ersatz merkt sich alles in
 * einer Map, ein schmaler DOM-Ersatz hält firebase.js bei Laune.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }

// --- Firestore-Ersatz -------------------------------------------------------
const store = new Map();
const writes = [];
const SERVER = "__server";

function resolve(value) {
  if (value && value.__marker === SERVER) return 1700000000000;
  if (Array.isArray(value)) return value.map(resolve);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolve(entry)]));
  }
  return value;
}

function mergeInto(target, patch) {
  const out = { ...(target || {}) };
  for (const [key, value] of Object.entries(patch)) {
    const plain = value && typeof value === "object" && !Array.isArray(value) && !value.__marker;
    out[key] = plain && out[key] && typeof out[key] === "object"
      ? mergeInto(out[key], value)
      : resolve(value);
  }
  return out;
}

function docRef(docPath) {
  return {
    path: docPath,
    id: docPath.split("/").pop(),
    async get() {
      const data = store.get(docPath);
      return { exists: data !== undefined, id: docPath.split("/").pop(), data: () => data && structuredClone(data) };
    },
    async set(payload, options) {
      writes.push({ path: docPath, payload: structuredClone(payload), merge: Boolean(options?.merge) });
      store.set(docPath, options?.merge ? mergeInto(store.get(docPath), payload) : resolve(payload));
    },
    collection: (name) => collectionRef(`${docPath}/${name}`),
  };
}

function collectionRef(collectionPath) {
  const query = {
    orderBy: () => query,
    limit: () => query,
    where: () => query,
    async get() {
      const docs = [];
      store.forEach((data, key) => {
        if (!key.startsWith(`${collectionPath}/`)) return;
        const rest = key.slice(collectionPath.length + 1);
        if (!rest.includes("/")) docs.push({ id: rest, data: () => structuredClone(data) });
      });
      return { docs, size: docs.length, forEach: (fn) => docs.forEach(fn) };
    },
    doc: (id) => docRef(`${collectionPath}/${id}`),
  };
  return query;
}

let authCallback = null;
const auth = () => ({
  currentUser: null,
  setPersistence: () => Promise.resolve(),
  onAuthStateChanged(callback) { authCallback = callback; callback(null); return () => {}; },
});
auth.Auth = { Persistence: { LOCAL: "local" } };

const firestore = () => ({
  collection: (name) => collectionRef(name),
  batch() {
    const ops = [];
    return {
      set(ref, payload, options) { ops.push([ref, payload, options]); return this; },
      async commit() { for (const [ref, payload, options] of ops) await ref.set(payload, options); },
    };
  },
});
firestore.FieldValue = { serverTimestamp: () => ({ __marker: SERVER }), increment: (by) => by };

// --- DOM-Ersatz -------------------------------------------------------------
function makeElement(tag = "div") {
  const node = {
    tagName: tag.toUpperCase(),
    className: "", title: "", type: "", hidden: false, disabled: false, value: "",
    dataset: {}, style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    children: [],
    set innerHTML(_value) {}, get innerHTML() { return ""; },
    set textContent(_value) {}, get textContent() { return ""; },
    setAttribute() {}, removeAttribute() {}, getAttribute: () => null,
    append(...nodes) { this.children.push(...nodes); },
    prepend() {}, remove() {}, focus() {}, click() {},
    addEventListener() {}, removeEventListener() {},
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    closest: () => null,
  };
  return node;
}

const events = [];
const documentStub = {
  body: makeElement("body"),
  documentElement: makeElement("html"),
  readyState: "complete",
  visibilityState: "visible",
  hidden: false,
  createElement: (tag) => makeElement(tag),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent(event) { events.push(event); return true; },
};

class CustomEventStub {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail ?? null; }
}

const windowStub = {
  firebase: { apps: [], initializeApp: () => ({}), app: () => ({}), auth, firestore },
  addEventListener() {},
  removeEventListener() {},
  setInterval: () => 1,
  clearInterval() {},
  setTimeout: () => 1,
  clearTimeout() {},
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  location: { href: "http://localhost/", origin: "http://localhost" },
};

const context = vm.createContext({
  window: windowStub,
  document: documentStub,
  navigator: { onLine: true, userAgent: "node" },
  localStorage: {
    store: new Map(),
    getItem(key) { return this.store.has(key) ? this.store.get(key) : null; },
    setItem(key, value) { this.store.set(key, String(value)); },
    removeItem(key) { this.store.delete(key); },
    key(index) { return [...this.store.keys()][index] ?? null; },
    get length() { return this.store.size; },
  },
  CustomEvent: CustomEventStub,
  Event: CustomEventStub,
  console: { ...console, warn() {}, error() {} },
  setInterval: windowStub.setInterval,
  clearInterval: windowStub.clearInterval,
  setTimeout: (fn) => { if (typeof fn === "function") fn(); return 1; },
  clearTimeout() {},
  structuredClone,
  Promise,
  Date,
  Math,
  JSON,
  Object,
  Number,
  String,
  Boolean,
  Array,
  Map,
  Set,
  isNaN,
  parseInt,
  parseFloat,
});
context.globalThis = context;
context.self = context;
vm.runInContext(fs.readFileSync(path.join(root, "firebase.js"), "utf8"), context, { filename: "firebase.js" });

const cloud = windowStub.LernappFirebase;
assert(cloud, "firebase.js hat window.LernappFirebase nicht gesetzt");
assert(typeof cloud.saveTrainSettings === "function", "saveTrainSettings fehlt");
assert(typeof cloud.getTrainSettings === "function", "getTrainSettings fehlt");

const LOCO = {
  driver: "panda", body: "#2f6f8f",
  cab: { shape: "peak", color: "#c9483a" },
  wheels: { shape: "star", color: "#f0b429" },
};

const settingsEvents = () => events.filter((event) => event.type === "lernapp:train-settings");

// --- Ohne Konto wird nichts geschrieben -------------------------------------
assert(cloud.getTrainSettings() === null, "ohne Anmeldung meldet die App schon Einstellungen");
assert(await cloud.saveTrainSettings({ loco: LOCO, scene: "wald", updatedAt: 5 }) === false,
  "ohne Anmeldung wird gespeichert");
assert(writes.length === 0, `ohne Anmeldung wurden ${writes.length} Schreibvorgänge ausgelöst`);

// --- Anmelden: was in der Cloud steht, wird gemeldet -------------------------
store.set("users/kind1", {
  username: "Kind",
  stats: { solvedLevels: 7 },
  trainSettings: { loco: LOCO, scene: "berge", updatedAt: 1234 },
});
await authCallback({ uid: "kind1", email: "kind@lernapp.local", displayName: "Kind", providerData: [{ providerId: "password" }] });

const arrived = settingsEvents().at(-1);
assert(arrived, "beim Anmelden wird lernapp:train-settings nicht gemeldet");
assert(arrived.detail?.loco?.driver === "panda", `gemeldet wurde ${JSON.stringify(arrived.detail)}`);
assert(arrived.detail.scene === "berge", "die Landschaft fehlt in der Meldung");
assert(arrived.detail.updatedAt === 1234, "der Zeitstempel kommt nicht mit");
assert(cloud.getTrainSettings().updatedAt === 1234, "getTrainSettings liefert etwas anderes");

// Eine fremde Kopie darf den Zustand nicht verändern.
const copy = cloud.getTrainSettings();
copy.scene = "nacht";
assert(cloud.getTrainSettings().scene === "berge", "getTrainSettings gibt den inneren Zustand heraus");

// --- Speichern: an dasselbe Dokument, zusammenführend ------------------------
writes.length = 0;
const saved = await cloud.saveTrainSettings({ loco: { ...LOCO, driver: "igel" }, scene: "see", updatedAt: 9999 });
assert(saved === true, "angemeldet wird nicht gespeichert");
assert(writes.length === 1, `erwartet ein Schreibvorgang, gefunden ${writes.length}`);
assert(writes[0].path === "users/kind1", `geschrieben wurde nach ${writes[0].path}`);
assert(writes[0].merge === true, "geschrieben wird ohne merge – das würde den Fortschritt daneben löschen");
assert(store.get("users/kind1").stats.solvedLevels === 7, "der Fortschritt am selben Dokument ist verloren gegangen");
assert(store.get("users/kind1").trainSettings.loco.driver === "igel", "die Lok steht nicht in der Cloud");
assert(store.get("users/kind1").trainSettings.updatedAt === 9999, "der Zeitstempel wurde nicht übernommen");

// --- Unfug wird abgewiesen, nicht gespeichert -------------------------------
writes.length = 0;
assert(await cloud.saveTrainSettings(null) === false, "null wird gespeichert");
assert(await cloud.saveTrainSettings("lok") === false, "eine Zeichenkette wird gespeichert");
assert(writes.length === 0, "für Unfug wurde geschrieben");

// Ohne Zeitstempel setzt die App selbst einen – sonst gewönne die Fassung nie.
await cloud.saveTrainSettings({ loco: LOCO, scene: "wiese" });
assert(store.get("users/kind1").trainSettings.updatedAt > 0, "ohne Zeitstempel bleibt updatedAt leer");

// Nur bekannte Felder gehen hinauf.
await cloud.saveTrainSettings({ loco: LOCO, scene: "wiese", updatedAt: 12, heimlich: "nein" });
assert(!("heimlich" in store.get("users/kind1").trainSettings), "unbekannte Felder wandern mit in die Cloud");

// --- Abmelden: nichts gilt mehr ---------------------------------------------
const before = settingsEvents().length;
await authCallback(null);
assert(settingsEvents().length === before + 1, "beim Abmelden wird nichts gemeldet");
assert(settingsEvents().at(-1).detail === null, "beim Abmelden wird nicht auf leer gemeldet");
assert(cloud.getTrainSettings() === null, "nach dem Abmelden hängt die Lok noch im Zustand");

writes.length = 0;
assert(await cloud.saveTrainSettings({ loco: LOCO, updatedAt: 1 }) === false, "nach dem Abmelden wird noch geschrieben");
assert(writes.length === 0, "nach dem Abmelden wurde geschrieben");

// --- Der Fortschritt meldet sich ebenfalls ----------------------------------
assert(events.some((event) => event.type === "lernapp:progress-changed"),
  "lernapp:progress-changed wird nie gemeldet – die Wagen blieben auf dem Stand des Geräts stehen");

// --- Spielstände ------------------------------------------------------------
// Bestenlisten und Rundenzahlen der Spiele mit eigenem Konto. Sie liegen als
// Feld gameState am selben Dokument; jedes Spiel hat darin seinen eigenen
// Kasten, und ein Schreibvorgang darf die anderen nicht mitnehmen.
assert(typeof cloud.getGameState === "function", "getGameState fehlt");
assert(typeof cloud.saveGameState === "function", "saveGameState fehlt");

store.clear();
writes.length = 0;
events.length = 0;
store.set("users/kind2", {
  username: "Kind",
  stats: { solvedLevels: 3 },
  gameState: {
    "lernapp.cardmatch": { data: { runs: 4, scores: [52, 30] }, updatedAt: 111 },
    "lernapp.tiersprung.progress": { data: { unlocked: 6, best: { 1: { stars: 3 } } }, updatedAt: 222 },
  },
});
await authCallback({ uid: "kind2", email: "kind@lernapp.local", displayName: "Kind", providerData: [{ providerId: "password" }] });

const stateEvents = events.filter((event) => event.type === "lernapp:game-state");
assert(stateEvents.length >= 1, "beim Anmelden wird lernapp:game-state nicht gemeldet");
const arrivedGames = stateEvents.at(-1).detail;
assert(arrivedGames["lernapp.cardmatch"].data.runs === 4, "die Rundenzahl kommt nicht an");
assert(arrivedGames["lernapp.tiersprung.progress"].data.unlocked === 6, "der Levelstand kommt nicht an");
assert(cloud.getGameState("lernapp.cardmatch").updatedAt === 111, "der Zeitstempel des Spielstands fehlt");
assert(cloud.getGameState("gibtesnicht") === null, "ein unbekanntes Spiel liefert etwas");

// Eine fremde Kopie darf den Zustand nicht verändern.
const gameCopy = cloud.getGameState("lernapp.cardmatch");
gameCopy.data.runs = 99;
assert(cloud.getGameState("lernapp.cardmatch").data.runs === 4, "getGameState gibt den inneren Zustand heraus");

// Schreiben: nur der eigene Kasten, zusammenführend, am selben Dokument.
writes.length = 0;
assert(await cloud.saveGameState("lernapp.cardmatch", { runs: 5, scores: [52, 30, 18] }) === true,
  "angemeldet wird der Spielstand nicht gespeichert");
assert(writes.length === 1, `erwartet ein Schreibvorgang, gefunden ${writes.length}`);
assert(writes[0].path === "users/kind2", `geschrieben wurde nach ${writes[0].path}`);
assert(writes[0].merge === true, "ohne merge würde der Fortschritt am selben Dokument gelöscht");
assert(Object.keys(writes[0].payload.gameState).length === 1,
  "geschrieben wird der ganze Kasten – ein zweites Gerät verlöre damit seine anderen Spiele");

const doc = store.get("users/kind2");
assert(doc.stats.solvedLevels === 3, "der Fortschritt am selben Dokument ist verloren gegangen");
assert(doc.gameState["lernapp.cardmatch"].data.runs === 5, "der neue Stand steht nicht in der Cloud");
assert(doc.gameState["lernapp.tiersprung.progress"].data.unlocked === 6,
  "der Stand des anderen Spiels wurde mitgeschrieben und ist weg");

// Unfug wird abgewiesen.
writes.length = 0;
assert(await cloud.saveGameState("", { a: 1 }) === false, "ein Spielstand ohne Schlüssel wird gespeichert");
assert(await cloud.saveGameState("lernapp.cardmatch", null) === false, "null wird gespeichert");
assert(writes.length === 0, "für Unfug wurde geschrieben");

// Abmelden: nichts gilt mehr, und geschrieben wird auch nicht mehr.
await authCallback(null);
assert(cloud.getGameState() === null, "nach dem Abmelden hängen die Spielstände noch im Zustand");
assert(await cloud.saveGameState("lernapp.cardmatch", { runs: 1 }) === false,
  "nach dem Abmelden wird noch geschrieben");

console.log(`Cloud-Einstellungen geprüft: users/<uid>.trainSettings und .gameState, zusammenführendes Schreiben je Spiel, ohne Konto stumm.`);
