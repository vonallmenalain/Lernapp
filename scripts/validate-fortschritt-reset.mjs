/*
 * Prüft "Fortschritt zurücksetzen" – im eigenen Profil und im Admin-Bereich.
 *
 * Zurücksetzen ist der einzige Knopf der App, der etwas endgültig wegnimmt.
 * Deshalb wird hier nicht nur geprüft, dass er löscht, sondern auch, dass er
 * genau das Richtige löscht und das Übrige stehen lässt:
 *
 *   - Weg: gelöste Level, Sitzungen, Gesamtzahlen, Spielstände, Sterne,
 *     Übungsstände und die gesehenen Wagenstufen.
 *   - Bleibt: Name, Lok, Landschaft, Levelmodus, Ton, Gastkennung.
 *
 * Die schwierige Hälfte ist das zweite Gerät. Der Stand des Kindes liegt auch
 * im localStorage, und beim Anmelden schiebt die App ihn in die Cloud. Wird
 * ein Konto vom Laptop des Admins geleert und das Kind meldet sich danach am
 * Tablet an, muss das Tablet erst aufräumen und dann hochschieben – sonst wäre
 * der gelöschte Fortschritt sofort wieder da. Dafür liegt eine Marke am Konto;
 * dieses Skript prüft beide Richtungen: einmal aufräumen ja, ein zweites Mal
 * (nach neuem Spielen) nein.
 *
 * Läuft ohne Browser und ohne Netz: ein Firestore-Ersatz merkt sich alles in
 * einer Map, ein schmaler DOM-Ersatz hält firebase.js und game-cloud.js bei
 * Laune. Der localStorage-Ersatz legt seine Schlüssel als eigene Felder ab –
 * firebase.js sucht mit Object.keys(localStorage) nach ihnen.
 *
 * Aufruf:  node scripts/validate-fortschritt-reset.mjs
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
const DELETE = "__delete";

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
    if (value && value.__marker === DELETE) { delete out[key]; continue; }
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
    path: collectionPath,
    orderBy: () => query,
    limit: () => query,
    where: () => query,
    async get() {
      const docs = [];
      store.forEach((data, key) => {
        if (!key.startsWith(`${collectionPath}/`)) return;
        const rest = key.slice(collectionPath.length + 1);
        if (!rest.includes("/")) docs.push({ id: rest, ref: docRef(key), data: () => structuredClone(data) });
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
  signOut: () => authCallback(null),
});
auth.Auth = { Persistence: { LOCAL: "local" } };

const deletes = [];
const firestore = () => ({
  collection: (name) => collectionRef(name),
  batch() {
    const ops = [];
    return {
      set(ref, payload, options) { ops.push(() => ref.set(payload, options)); return this; },
      delete(ref) { ops.push(() => { deletes.push(ref.path); store.delete(ref.path); }); return this; },
      async commit() { for (const op of ops) await op(); },
    };
  },
});
firestore.FieldValue = {
  serverTimestamp: () => ({ __marker: SERVER }),
  increment: (by) => by,
  delete: () => ({ __marker: DELETE }),
};

// --- localStorage-Ersatz ----------------------------------------------------
// Die Schlüssel liegen als eigene, aufzählbare Felder: firebase.js sucht den
// Fortschritt mit Object.keys(localStorage), ein Ersatz mit interner Map wäre
// für diese Prüfung wertlos.
function makeLocalStorage() {
  const api = {};
  Object.defineProperties(api, {
    getItem: { value(key) { return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : null; } },
    setItem: { value(key, value) { this[key] = String(value); } },
    removeItem: { value(key) { delete this[key]; } },
    clear: { value() { Object.keys(this).forEach((key) => delete this[key]); } },
    key: { value(index) { return Object.keys(this)[index] ?? null; } },
    length: { get() { return Object.keys(this).length; } },
  });
  return api;
}
const localStorageStub = makeLocalStorage();

// --- DOM-Ersatz -------------------------------------------------------------
function makeElement(tag = "div") {
  return {
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
    contains: () => false,
    closest: () => null,
  };
}

// Ein Dokument, das Meldungen wirklich zustellt: game-cloud.js hört auf
// lernapp:game-state, und ohne Zustellung liefe die halbe Prüfung ins Leere.
const events = [];
const listeners = new Map();
const documentStub = {
  body: makeElement("body"),
  documentElement: makeElement("html"),
  readyState: "complete",
  visibilityState: "visible",
  hidden: false,
  createElement: (tag) => makeElement(tag),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener(type, fn) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
  },
  removeEventListener() {},
  dispatchEvent(event) {
    events.push(event);
    (listeners.get(event.type) || []).forEach((fn) => fn(event));
    return true;
  },
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
  localStorage: localStorageStub,
  CustomEvent: CustomEventStub,
  Event: CustomEventStub,
  console: { ...console, warn() {}, error() {} },
  setInterval: windowStub.setInterval,
  clearInterval: windowStub.clearInterval,
  setTimeout: (fn) => { if (typeof fn === "function") fn(); return 1; },
  clearTimeout() {},
  structuredClone,
  Promise, Date, Math, JSON, Object, Number, String, Boolean, Array, Map, Set,
  isNaN, parseInt, parseFloat,
});
context.globalThis = context;
context.self = context;
vm.runInContext(fs.readFileSync(path.join(root, "firebase.js"), "utf8"), context, { filename: "firebase.js" });
vm.runInContext(fs.readFileSync(path.join(root, "game-cloud.js"), "utf8"), context, { filename: "game-cloud.js" });

// firebase.js hängt onAuthStateChanged an das .finally() von setPersistence –
// über zwei Zwischenglieder. Ohne diese Pause gäbe es keinen Rückruf, über den
// sich hier jemand anmelden könnte.
await new Promise((fertig) => setImmediate(fertig));
assert(typeof authCallback === "function", "firebase.js hat sich nicht bei onAuthStateChanged angemeldet");

const cloud = windowStub.LernappFirebase;
const games = windowStub.LernappGameCloud;
assert(cloud, "firebase.js hat window.LernappFirebase nicht gesetzt");
assert(typeof cloud.resetProgress === "function", "resetProgress fehlt");
assert(games && typeof games.resetAll === "function", "game-cloud.js kennt kein resetAll");

// Dieselben zwei Spielstände wie in train-progress.js: einer mit Leveln, einer
// mit Bestenliste. Beide müssen das Zurücksetzen mitbekommen.
const runner = games.register({ key: "lernapp.tiersprung.progress", empty: { unlocked: 1, best: {} }, merge: games.mergeLevels });
const cards = games.register({ key: "lernapp.cardmatch", empty: { runs: 0, scores: [] }, merge: games.mergeScores(5) });

const LEVEL = { game: "sudoku", id: "S 1-1", levelName: "S 1-1", title: "S 1-1", difficulty: "easy" };
const FULL_STATS = { totalSeconds: 1200, moves: 80, resets: 4, solvedLevels: 3, sessions: 9 };
const KIND = { uid: "kind1", email: "mia@lernapp.local", emailVerified: false, providerData: [{ providerId: "password" }] };
const ADMIN = { uid: "adminUid", email: "alain.sc2@gmail.com", emailVerified: true, providerData: [{ providerId: "google.com" }] };

function seedLocalProgress() {
  localStorageStub.setItem("lernapp.solved.sudoku.S 1-1", "1");
  localStorageStub.setItem("lernapp.solved.arukone.A 1-1", "1");
  localStorageStub.setItem("lernapp.stars.sudoku.S 1-1", "3");
  localStorageStub.setItem("lernapp.practice.readingPuzzle.W1", '{"solved":4}');
  localStorageStub.setItem("lernapp.train.gesehen", '{"knobeln":0.8}');
  localStorageStub.setItem("lernapp.train.gesehen.szenen", "3");
  localStorageStub.setItem("lernapp.lastPlayed", '{"game":"sudoku"}');
}

function seedLocalSettings() {
  localStorageStub.setItem("lernapp.tts", "0");
  localStorageStub.setItem("lernapp.audioFeedback", "0");
  localStorageStub.setItem("lernapp.train.loco", '{"driver":"panda"}');
  localStorageStub.setItem("lernapp.train.scene", "wald");
  localStorageStub.setItem("lernapp.train.savedAt", "5");
  localStorageStub.setItem("lernapp.guest.id", "guest_abcdefgh");
  localStorageStub.setItem("lernapp.guest.createdAt", "1");
}

function seedAccount(uid, name) {
  store.set(`users/${uid}`, {
    username: name,
    stats: { ...FULL_STATS },
    gameState: {
      "lernapp.cardmatch": { data: { runs: 7, scores: [52, 30] }, updatedAt: 111 },
      "lernapp.tiersprung.progress": { data: { unlocked: 6, best: { 1: { stars: 3 } } }, updatedAt: 222 },
    },
    levelAccess: { unlockAllLevels: true },
    trainSettings: { loco: { driver: "panda" }, scene: "wald", updatedAt: 1234 },
  });
  store.set(`users/${uid}/levelProgress/sudoku_S_1-1`, { game: "sudoku", levelId: "S 1-1", solved: true, timeSeconds: 90 });
  store.set(`users/${uid}/levelProgress/arukone_A_1-1`, { game: "arukone", levelId: "A 1-1", solved: true, timeSeconds: 40 });
  store.set(`users/${uid}/sessions/s1`, { game: "sudoku", solved: true, startedAt: 1 });
  store.set(`users/${uid}/sessions/s2`, { game: "arukone", solved: false, endedAt: 2, startedAt: 2 });
}

function subDocs(uid) {
  return [...store.keys()].filter((key) => key.startsWith(`users/${uid}/`));
}

// ============================================================================
// 1. Das eigene Konto zurücksetzen
// ============================================================================
seedAccount("kind1", "Mia");
seedLocalProgress();
seedLocalSettings();
localStorageStub.setItem("lernapp.tiersprung.progress", '{"unlocked":6,"best":{"1":{"stars":3}}}');
localStorageStub.setItem("lernapp.cardmatch", '{"runs":7,"scores":[52,30]}');

await authCallback(KIND);
cloud.registerLevels([LEVEL]);
assert(cloud.isLevelSolved(LEVEL), "der Fortschritt aus der Cloud kommt gar nicht erst an");

await cloud.resetProgress();

assert(subDocs("kind1").length === 0, `nach dem Zurücksetzen liegen noch ${subDocs("kind1").join(", ")} in der Cloud`);
assert(deletes.length === 4, `erwartet vier gelöschte Dokumente, gefunden ${deletes.length}`);
assert(!cloud.isLevelSolved(LEVEL), "ein gelöstes Level gilt noch als gelöst");

const doc = store.get("users/kind1");
assert(doc.stats.solvedLevels === 0 && doc.stats.totalSeconds === 0 && doc.stats.moves === 0
  && doc.stats.resets === 0 && doc.stats.sessions === 0, `stats stehen auf ${JSON.stringify(doc.stats)}`);
assert(doc.gameState === undefined, "die Spielstände stehen noch in der Cloud");
assert(typeof doc.progressReset?.atMs === "number" && doc.progressReset.by === "self",
  `die Marke fehlt oder ist falsch: ${JSON.stringify(doc.progressReset)}`);

// Das Profil ist kein Fortschritt und bleibt.
assert(doc.username === "Mia", "der Name wurde mitgelöscht");
assert(doc.trainSettings?.scene === "wald" && doc.trainSettings?.loco?.driver === "panda",
  "Lok und Landschaft wurden mitgelöscht – ein Kind, das von vorn anfängt, verlöre seinen Zug");
assert(doc.levelAccess?.unlockAllLevels === true, "der Levelmodus wurde mitgeändert");

// Das Gerät ebenfalls: sonst schöbe es den Stand beim nächsten Anmelden hoch.
for (const key of ["lernapp.solved.sudoku.S 1-1", "lernapp.solved.arukone.A 1-1", "lernapp.stars.sudoku.S 1-1",
  "lernapp.practice.readingPuzzle.W1", "lernapp.train.gesehen", "lernapp.train.gesehen.szenen", "lernapp.lastPlayed"]) {
  assert(localStorageStub.getItem(key) === null, `${key} liegt noch auf dem Gerät`);
}
for (const [key, value] of Object.entries({
  "lernapp.tts": "0", "lernapp.audioFeedback": "0", "lernapp.train.loco": '{"driver":"panda"}',
  "lernapp.train.scene": "wald", "lernapp.train.savedAt": "5",
  "lernapp.guest.id": "guest_abcdefgh", "lernapp.guest.createdAt": "1",
})) {
  assert(localStorageStub.getItem(key) === value, `${key} wurde mitgelöscht, ist aber eine Einstellung`);
}

assert(JSON.stringify(runner.read()) === '{"unlocked":1,"best":{}}', `Tier-Sprung steht auf ${JSON.stringify(runner.read())}`);
assert(JSON.stringify(cards.read()) === '{"runs":0,"scores":[]}', `Karten-Merker steht auf ${JSON.stringify(cards.read())}`);
assert(localStorageStub.getItem("lernapp.tiersprung.progress") === '{"unlocked":1,"best":{}}',
  "der Spielstand im Speicher ist leer, auf dem Gerät aber nicht");
assert(localStorageStub.getItem(`lernapp.reset.kind1`) === String(doc.progressReset.atMs),
  "die Marke wurde auf dem eigenen Gerät nicht gesetzt");
assert(events.some((event) => event.type === "lernapp:progress-changed"),
  "der Zug erfährt nichts vom Zurücksetzen und bliebe stehen");

// ============================================================================
// 2. Zweites Gerät: aufräumen, bevor etwas hochgeht
// ============================================================================
await authCallback(null);
store.clear();
deletes.length = 0;
localStorageStub.clear();

const resetAt = Date.now() - 60000;
store.set("users/kind1", {
  username: "Mia",
  stats: { totalSeconds: 0, moves: 0, resets: 0, solvedLevels: 0, sessions: 0 },
  progressReset: { atMs: resetAt, at: resetAt, by: "admin", byUid: "adminUid" },
});
seedLocalProgress();
seedLocalSettings();
runner.write({ unlocked: 6, best: { 1: { stars: 3 } } });

writes.length = 0;
await authCallback(KIND);

assert(subDocs("kind1").length === 0,
  `beim Anmelden wurde der alte Stand wieder hochgeschoben: ${subDocs("kind1").join(", ")}`);
assert(localStorageStub.getItem("lernapp.solved.sudoku.S 1-1") === null, "der alte Stand liegt noch auf dem Gerät");
assert(localStorageStub.getItem("lernapp.train.gesehen") === null, "die gesehenen Wagenstufen sind noch da");
assert(localStorageStub.getItem("lernapp.tts") === "0", "die Ton-Einstellung wurde mitgelöscht");
assert(JSON.stringify(runner.read()) === '{"unlocked":1,"best":{}}', "der Spielstand wurde auf dem zweiten Gerät nicht geleert");
assert(localStorageStub.getItem("lernapp.reset.kind1") === String(resetAt), "die Marke wurde nicht übernommen");

// Und jetzt spielt das Kind wieder. Das darf beim nächsten Anmelden nicht ein
// zweites Mal weggeräumt werden – die Marke gilt einmal, nicht immer.
await cloud.recordSolve(LEVEL, { timeSeconds: 20 });
assert(cloud.isLevelSolved(LEVEL), "das frisch gelöste Level kommt nicht an");

await authCallback(null);
await authCallback(KIND);
assert(cloud.isLevelSolved(LEVEL), "der Fortschritt nach dem Zurücksetzen wird beim nächsten Anmelden erneut gelöscht");
assert(subDocs("kind1").filter((key) => key.includes("/levelProgress/")).length === 1,
  "das gelöste Level ist beim nächsten Anmelden verschwunden");

// ============================================================================
// 3. Der Admin setzt ein fremdes Konto zurück
// ============================================================================
await authCallback(null);
store.clear();
deletes.length = 0;
localStorageStub.clear();

store.set("users/adminUid", { username: "Alain", stats: { totalSeconds: 10, moves: 1, resets: 0, solvedLevels: 1, sessions: 1 } });
store.set("users/adminUid/levelProgress/sudoku_S_1-1", { game: "sudoku", levelId: "S 1-1", solved: true, timeSeconds: 10 });
seedAccount("kind3", "Nino");
// Auf dem Gerät des Admins liegt sein eigener Stand. Der geht niemanden an.
localStorageStub.setItem("lernapp.solved.sudoku.S 1-1", "1");
localStorageStub.setItem("lernapp.stars.sudoku.S 1-1", "2");

await authCallback(ADMIN);
await cloud.resetProgress("kind3");

assert(subDocs("kind3").length === 0, `beim fremden Konto blieben ${subDocs("kind3").join(", ")} stehen`);
const fremd = store.get("users/kind3");
assert(fremd.stats.solvedLevels === 0 && fremd.stats.totalSeconds === 0, `fremde stats stehen auf ${JSON.stringify(fremd.stats)}`);
assert(fremd.gameState === undefined, "die Spielstände des fremden Kontos stehen noch in der Cloud");
assert(fremd.progressReset?.by === "admin" && fremd.progressReset?.byUid === "adminUid",
  `die Marke sagt nicht, wer zurückgesetzt hat: ${JSON.stringify(fremd.progressReset)}`);
assert(fremd.username === "Nino" && fremd.trainSettings?.scene === "wald", "das fremde Profil wurde mitgeändert");

// Der Admin schreibt nur Felder, die firestore.rules ihm am fremden Konto
// erlaubt. Steht hier ein weiteres Feld, weist Firestore den ganzen Vorgang ab.
const fremdeSchreibvorgaenge = writes.filter((write) => write.path === "users/kind3");
assert(fremdeSchreibvorgaenge.length === 1, `erwartet ein Schreibvorgang, gefunden ${fremdeSchreibvorgaenge.length}`);
assert(fremdeSchreibvorgaenge[0].merge === true, "ohne merge würde das ganze fremde Profil überschrieben");
const erlaubt = new Set(["stats", "gameState", "progressReset", "updatedAt"]);
const geschrieben = Object.keys(fremdeSchreibvorgaenge[0].payload);
assert(geschrieben.every((key) => erlaubt.has(key)),
  `am fremden Konto wird ${geschrieben.filter((key) => !erlaubt.has(key)).join(", ")} geschrieben – firestore.rules lässt nur ${[...erlaubt].join(", ")} zu`);

// Das eigene Konto und das eigene Gerät des Admins bleiben unberührt.
const eigen = store.get("users/adminUid");
assert(eigen.stats.solvedLevels === 1 && eigen.progressReset === undefined, "das Admin-Konto wurde mit zurückgesetzt");
assert(store.has("users/adminUid/levelProgress/sudoku_S_1-1"), "der Fortschritt des Admins wurde mitgelöscht");
assert(localStorageStub.getItem("lernapp.solved.sudoku.S 1-1") === "1",
  "das Gerät des Admins wurde aufgeräumt, obwohl ein fremdes Konto gemeint war");
assert(localStorageStub.getItem("lernapp.stars.sudoku.S 1-1") === "2", "die Sterne des Admins sind weg");
assert(localStorageStub.getItem("lernapp.reset.kind3") === null,
  "die Marke eines fremden Kontos liegt auf dem Gerät des Admins – dessen nächste Anmeldung räumte grundlos auf");

console.log("Zurücksetzen geprüft: eigenes Konto, fremdes Konto durch den Admin, zweites Gerät beim nächsten Anmelden.");
