/*
 * Prüft den Wechsel des Wagen-Sets – im Adminbereich und auf jedem Gerät.
 *
 * Der Wechsel ist der einzige Knopf der App, der alle Konten auf einmal
 * anfasst. Deshalb wird hier nicht nur geprüft, dass er umstellt, sondern
 * auch, was dabei mit wem passiert:
 *
 *   - Der Admin: jedes Konto wird zurückgesetzt, zuletzt das eigene, dann
 *     steht das neue Set in config/train – in dieser Reihenfolge.
 *   - Ein Gast-Gerät: liest das Dokument, räumt seinen alten Stand weg und
 *     merkt sich den Wechsel. Beim nächsten Öffnen räumt es nicht noch einmal.
 *   - Ein Kind mit Konto: dasselbe, und nichts vom alten Stand geht hoch.
 *   - Wer kein Admin ist, kann nicht umstellen. Ein kaputtes Dokument ändert
 *     nichts. Und die Regeln in firestore.rules lassen genau das zu, was die
 *     App braucht: lesen dürfen alle, schreiben nur der Admin.
 *
 * Läuft ohne Browser und ohne Netz: ein Firestore-Ersatz merkt sich alles in
 * einer Map, und jedes "Gerät" ist eine eigene Sandbox mit eigenem
 * localStorage, in der firebase.js und game-cloud.js frisch starten.
 *
 * Aufruf:  node scripts/validate-wagen-set.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }

// --- Firestore-Ersatz, für alle Geräte derselbe ------------------------------
const store = new Map();
const writes = [];
const deletes = [];
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

class CustomEventStub {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail ?? null; }
}

// Ein Gerät: eigener Speicher, eigenes Dokument, eigene Anmeldung – und
// derselbe Firestore-Ersatz wie alle anderen.
async function bootDevice({ localStorage = makeLocalStorage() } = {}) {
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

  let authCallback = null;
  const auth = () => ({
    currentUser: null,
    setPersistence: () => Promise.resolve(),
    onAuthStateChanged(callback) { authCallback = callback; callback(null); return () => {}; },
    signOut: () => authCallback(null),
  });
  auth.Auth = { Persistence: { LOCAL: "local" } };

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
    localStorage,
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

  // Anmeldung und das Lesen von config/train hängen an Promises: kurz warten.
  for (let i = 0; i < 4; i += 1) await new Promise((fertig) => setImmediate(fertig));
  assert(typeof authCallback === "function", "firebase.js hat sich nicht bei onAuthStateChanged angemeldet");

  const cloud = windowStub.LernappFirebase;
  const games = windowStub.LernappGameCloud;
  assert(cloud, "firebase.js hat window.LernappFirebase nicht gesetzt");
  const cards = games.register({ key: "lernapp.cardmatch", empty: { runs: 0, scores: [] }, merge: games.mergeScores(5) });

  return {
    cloud, games, cards, localStorage, events,
    signIn: (user) => authCallback(user),
    settle: async () => { for (let i = 0; i < 4; i += 1) await new Promise((fertig) => setImmediate(fertig)); },
  };
}

const ADMIN = { uid: "adminUid", email: "alain.sc2@gmail.com", emailVerified: true, providerData: [{ providerId: "google.com" }] };
const KIND = { uid: "kind1", email: "mia@lernapp.local", emailVerified: false, providerData: [{ providerId: "password" }] };
const LEVEL = { game: "sudoku", id: "S 1-1", levelName: "S 1-1", title: "S 1-1", difficulty: "easy" };

function seedAccount(uid, name) {
  store.set(`users/${uid}`, {
    username: name,
    stats: { totalSeconds: 1200, moves: 80, resets: 4, solvedLevels: 3, sessions: 9 },
    gameState: { "lernapp.cardmatch": { data: { runs: 7, scores: [52, 30] }, updatedAt: 111 } },
    trainSettings: { loco: { driver: "panda" }, scene: "wald", updatedAt: 1234 },
    group: { id: "familie", name: "Familie", displayName: name },
  });
  store.set(`users/${uid}/levelProgress/sudoku_S_1-1`, { game: "sudoku", levelId: "S 1-1", solved: true, timeSeconds: 90 });
  store.set(`users/${uid}/sessions/s1`, { game: "sudoku", solved: true, startedAt: 1 });
}

function seedLocalProgress(localStorage) {
  localStorage.setItem("lernapp.solved.sudoku.S 1-1", "1");
  localStorage.setItem("lernapp.stars.sudoku.S 1-1", "3");
  localStorage.setItem("lernapp.cardmatch", '{"runs":7,"scores":[52,30]}');
  localStorage.setItem("lernapp.train.gesehen", '{"set":"1","steps":{"gedaechtnis":4}}');
  localStorage.setItem("lernapp.train.gesehen.szenen", "3");
}

function seedLocalSettings(localStorage) {
  localStorage.setItem("lernapp.tts", "0");
  localStorage.setItem("lernapp.train.loco", '{"driver":"panda"}');
  localStorage.setItem("lernapp.train.scene", "wald");
  localStorage.setItem("lernapp.guest.id", "guest_abcdefgh");
}

function subDocs(uid) {
  return [...store.keys()].filter((key) => key.startsWith(`users/${uid}/`));
}

// ============================================================================
// 1. Der Admin stellt um
// ============================================================================
store.set("users/adminUid", { username: "Alain", stats: { totalSeconds: 10, moves: 1, resets: 0, solvedLevels: 1, sessions: 1 } });
store.set("users/adminUid/levelProgress/sudoku_S_1-1", { game: "sudoku", levelId: "S 1-1", solved: true });
seedAccount("kind1", "Mia");
seedAccount("kind2", "Ben");

const adminGeraet = await bootDevice();
seedLocalProgress(adminGeraet.localStorage);
seedLocalSettings(adminGeraet.localStorage);
adminGeraet.cards.write({ runs: 7, scores: [52, 30] });

// Ohne Dokument gilt das erste Set – und ohne Anmeldung lässt sich nichts umstellen.
assert(adminGeraet.cloud.getWagonSet().id === "1", "ohne config/train muss das erste Set gelten");
let abgelehnt = null;
await adminGeraet.cloud.switchWagonSet("2").catch((error) => { abgelehnt = error; });
assert(abgelehnt, "ohne Anmeldung darf niemand das Set umstellen");
assert(store.get("config/train") === undefined, "ohne Anmeldung wurde config/train trotzdem geschrieben");

await adminGeraet.signIn(ADMIN);
await adminGeraet.settle();
adminGeraet.cloud.registerLevels([LEVEL]);

const fortschritt = [];
writes.length = 0;
const ergebnis = await adminGeraet.cloud.switchWagonSet("2", { onProgress: (done, total) => fortschritt.push(`${done}/${total}`) });
await adminGeraet.settle();

assert(ergebnis.accounts === 3, `erwartet 3 zurückgesetzte Konten, gemeldet ${ergebnis.accounts}`);
assert(fortschritt.join(" ") === "1/3 2/3 3/3", `der Fortschritt wurde nicht Konto für Konto gemeldet: ${fortschritt.join(" ")}`);

const config = store.get("config/train");
assert(config && config.wagonSet === "2", `config/train sagt nicht Set 2: ${JSON.stringify(config)}`);
assert(typeof config.switchedAtMs === "number" && config.switchedAtMs === ergebnis.switchedAtMs, "der Zeitpunkt des Wechsels fehlt in config/train");
assert(config.switchedBy === "adminUid", "wer umgestellt hat, steht nicht im Dokument");

for (const uid of ["kind1", "kind2", "adminUid"]) {
  assert(subDocs(uid).length === 0, `${uid}: nach dem Wechsel liegen noch ${subDocs(uid).join(", ")} in der Cloud`);
  const doc = store.get(`users/${uid}`);
  assert(doc.stats.solvedLevels === 0 && doc.stats.totalSeconds === 0, `${uid}: stats stehen auf ${JSON.stringify(doc.stats)}`);
  assert(doc.gameState === undefined, `${uid}: die Spielstände stehen noch in der Cloud`);
  assert(typeof doc.progressReset?.atMs === "number", `${uid}: die Reset-Marke fehlt`);
}
assert(store.get("users/kind1").progressReset.by === "admin", "das fremde Konto trägt nicht die Admin-Marke");
assert(store.get("users/adminUid").progressReset.by === "self", "das eigene Konto trägt nicht die eigene Marke");
// Das Profil bleibt: Name, Lok, Landschaft, Gruppe.
assert(store.get("users/kind1").username === "Mia" && store.get("users/kind1").trainSettings?.scene === "wald"
  && store.get("users/kind1").group?.id === "familie", "der Wechsel hat das Profil eines Kindes mitgelöscht");

// Erst die Konten, dann das Dokument – ein Gerät, das den Wechsel sieht, soll
// in der Cloud schon leere Konten vorfinden.
const reihenfolge = writes.map((write) => write.path);
const konfigStelle = reihenfolge.indexOf("config/train");
assert(konfigStelle >= 0, "config/train wurde nicht geschrieben");
assert(reihenfolge.slice(konfigStelle + 1).every((p) => !p.startsWith("users/")), "nach config/train wurde noch an Konten geschrieben");
assert(["users/kind1", "users/kind2", "users/adminUid"].every((p) => reihenfolge.indexOf(p) < konfigStelle),
  "config/train wurde geschrieben, bevor alle Konten zurückgesetzt waren");
// Das eigene Konto zuletzt: es räumt auch dieses Gerät auf.
assert(reihenfolge.lastIndexOf("users/adminUid") > reihenfolge.lastIndexOf("users/kind2"), "das eigene Konto kam nicht zuletzt dran");

// Das Gerät des Admins: das neue Set gemerkt, der alte Stand weg, die
// Einstellungen da.
const adminLokal = JSON.parse(adminGeraet.localStorage.getItem("lernapp.train.set"));
assert(adminLokal.id === "2" && adminLokal.switchedAtMs === config.switchedAtMs, `das Gerät des Admins kennt den Wechsel nicht: ${JSON.stringify(adminLokal)}`);
assert(adminGeraet.cloud.getWagonSet().id === "2", "getWagonSet meldet nicht das neue Set");
for (const key of ["lernapp.solved.sudoku.S 1-1", "lernapp.stars.sudoku.S 1-1", "lernapp.train.gesehen", "lernapp.train.gesehen.szenen"]) {
  assert(adminGeraet.localStorage.getItem(key) === null, `${key} liegt nach dem Wechsel noch auf dem Gerät`);
}
assert(JSON.stringify(adminGeraet.cards.read()) === '{"runs":0,"scores":[]}', `der Spielstand steht noch auf ${JSON.stringify(adminGeraet.cards.read())}`);
for (const [key, value] of Object.entries({ "lernapp.tts": "0", "lernapp.train.loco": '{"driver":"panda"}', "lernapp.train.scene": "wald", "lernapp.guest.id": "guest_abcdefgh" })) {
  assert(adminGeraet.localStorage.getItem(key) === value, `${key} wurde mitgelöscht, ist aber eine Einstellung`);
}
assert(!adminGeraet.cloud.isLevelSolved(LEVEL), "ein gelöstes Level gilt im Speicher noch als gelöst");
assert(adminGeraet.events.some((event) => event.type === "lernapp:wagon-set" && event.detail?.id === "2"), "die Bühne erfährt nichts vom Wechsel");
assert(adminGeraet.events.some((event) => event.type === "lernapp:progress-changed"), "der Zug erfährt nichts vom Zurücksetzen");

// Wer kein Admin ist, kann nicht umstellen – auch angemeldet nicht.
const kindGeraet0 = await bootDevice();
await kindGeraet0.signIn(KIND);
await kindGeraet0.settle();
abgelehnt = null;
await kindGeraet0.cloud.switchWagonSet("1").catch((error) => { abgelehnt = error; });
assert(abgelehnt && String(abgelehnt.code).includes("permission-denied"), "ein Kind konnte das Set umstellen");
assert(store.get("config/train").wagonSet === "2", "das Dokument wurde von einem Kind geändert");

// ============================================================================
// 2. Ein Gast-Gerät erfährt vom Wechsel
// ============================================================================
const gastSpeicher = makeLocalStorage();
seedLocalProgress(gastSpeicher);
seedLocalSettings(gastSpeicher);

const gast = await bootDevice({ localStorage: gastSpeicher });
assert(gast.cloud.getWagonSet().id === "2", "das Gast-Gerät übernimmt das Set nicht aus config/train");
const gastLokal = JSON.parse(gastSpeicher.getItem("lernapp.train.set"));
assert(gastLokal.switchedAtMs === config.switchedAtMs, "das Gast-Gerät merkt sich den Zeitpunkt des Wechsels nicht");
assert(gastSpeicher.getItem("lernapp.solved.sudoku.S 1-1") === null, "der alte Stand liegt nach dem Wechsel noch auf dem Gast-Gerät");
assert(gastSpeicher.getItem("lernapp.train.gesehen") === null, "die gesehenen Wagenschritte sind noch da");
assert(gastSpeicher.getItem("lernapp.train.scene") === "wald", "die Landschaft wurde mitgelöscht");
assert(JSON.stringify(gast.cards.read()) === '{"runs":0,"scores":[]}', "der Spielstand des Gasts wurde nicht geleert");
assert(gast.events.some((event) => event.type === "lernapp:wagon-set"), "die Bühne des Gasts erfährt nichts vom Wechsel");

// Der Gast spielt weiter. Beim nächsten Öffnen darf das nicht weg sein: der
// Wechsel ist bekannt, und ein zweites Aufräumen wäre ein Verlust.
gastSpeicher.setItem("lernapp.solved.arukone.A 1-1", "1");
gast.cards.write({ runs: 1, scores: [8] });
const gastSpaeter = await bootDevice({ localStorage: gastSpeicher });
assert(gastSpeicher.getItem("lernapp.solved.arukone.A 1-1") === "1", "beim nächsten Öffnen wurde der neue Stand des Gasts weggeräumt");
assert(JSON.stringify(gastSpaeter.cards.read()) === '{"runs":1,"scores":[8]}', "der neue Spielstand des Gasts wurde beim nächsten Öffnen geleert");
assert(!gastSpaeter.events.some((event) => event.type === "lernapp:wagon-set"), "ein bekannter Wechsel wird noch einmal gemeldet");

// ============================================================================
// 3. Ein Kind mit Konto meldet sich nach dem Wechsel an
// ============================================================================
const kindSpeicher = makeLocalStorage();
seedLocalProgress(kindSpeicher);
seedLocalSettings(kindSpeicher);
const kind = await bootDevice({ localStorage: kindSpeicher });
await kind.signIn(KIND);
await kind.settle();
kind.cloud.registerLevels([LEVEL]);
await kind.settle();

assert(subDocs("kind1").length === 0, `beim Anmelden ging der alte Stand hoch: ${subDocs("kind1").join(", ")}`);
assert(kindSpeicher.getItem("lernapp.solved.sudoku.S 1-1") === null, "der alte Stand liegt noch auf dem Gerät des Kindes");
assert(!kind.cloud.isLevelSolved(LEVEL), "das Kind sieht sein altes Level noch als gelöst");
assert(kind.cloud.getWagonSet().id === "2", "das Gerät des Kindes kennt das neue Set nicht");

// Und jetzt spielt das Kind: das bleibt.
await kind.cloud.recordSolve(LEVEL, { timeSeconds: 20 });
assert(kind.cloud.isLevelSolved(LEVEL), "das frisch gelöste Level kommt nicht an");
const kindSpaeter = await bootDevice({ localStorage: kindSpeicher });
await kindSpaeter.signIn(KIND);
await kindSpaeter.settle();
assert(subDocs("kind1").filter((key) => key.includes("/levelProgress/")).length === 1, "der neue Fortschritt des Kindes wurde beim nächsten Anmelden weggeräumt");

// ============================================================================
// 4. Ein kaputtes Dokument ändert nichts; zurück auf Set 1 geht auch
// ============================================================================
store.set("config/train", { wagonSet: "", switchedAtMs: "bald" });
const kaputt = await bootDevice({ localStorage: gastSpeicher });
assert(kaputt.cloud.getWagonSet().id === "2", "ein kaputtes Dokument hat das gemerkte Set verdrängt");
assert(gastSpeicher.getItem("lernapp.solved.arukone.A 1-1") === "1", "ein kaputtes Dokument hat den Stand weggeräumt");

store.set("config/train", { wagonSet: "1", switchedAtMs: config.switchedAtMs + 1000, switchedBy: "adminUid" });
const zurueck = await bootDevice({ localStorage: gastSpeicher });
assert(zurueck.cloud.getWagonSet().id === "1", "der Wechsel zurück auf das erste Set kommt nicht an");
assert(gastSpeicher.getItem("lernapp.solved.arukone.A 1-1") === null, "der Wechsel zurück räumt den Stand nicht weg");

// ============================================================================
// 5. Die Regeln lassen genau das zu
// ============================================================================
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const konfig = rules.match(/match \/config\/\{[a-zA-Z]+\}\s*\{([^}]*)\}/);
assert(konfig, "firestore.rules kennt config/{docId} nicht – kein Gerät könnte das Set lesen");
assert(/allow read:\s*if true;/.test(konfig[1]), "config/train muss jeder lesen dürfen, auch ohne Konto");
assert(/allow write:\s*if isAdmin\(\);/.test(konfig[1]), "config/train darf nur der Admin schreiben");
assert(!/allow (write|create|update):\s*if (true|isSignedIn\(\));/.test(konfig[1]), "config/train ist für alle beschreibbar");

// Und die Doku sagt, dass es das Dokument gibt.
const doku = fs.readFileSync(path.join(root, "FIREBASE_SETUP.md"), "utf8");
assert(doku.includes("config/train"), "FIREBASE_SETUP.md erwähnt config/train nicht");

console.log("Wagen-Set geprüft: Wechsel durch den Admin, Gast-Gerät, Kind mit Konto, kaputtes Dokument, Regeln.");
