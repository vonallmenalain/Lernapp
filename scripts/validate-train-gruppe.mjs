/*
 * Prüft die Gruppe: mehrere Konten, deren Züge auf dem Startbild übereinander
 * auf ihren Gleisen stehen.
 *
 * Drei Dinge müssen stimmen, sonst zeigt das Startbild den falschen Stand oder
 * gibt Fortschritt heraus, der niemanden angeht:
 *
 *   1. Der Zug eines anderen wird mit derselben Rechnung gebaut wie der eigene,
 *      aber aus dessen Daten – und die eigene Quelle bleibt danach unberührt.
 *   2. firebase.js liefert genau die anderen Konten der Gruppe, mit gelösten
 *      Leveln und Spielständen, und nach dem Abmelden gar keine mehr.
 *   3. Der Admin schreibt beim Zuordnen nur das eine Feld, das firestore.rules
 *      ihm erlaubt – und die Regeln lassen ein Kind sich nicht selbst in eine
 *      fremde Gruppe eintragen.
 *
 * Läuft ohne Browser und ohne Netz: ein Firestore-Ersatz merkt sich alles in
 * einer Map und kann filtern, ein schmaler DOM-Ersatz hält firebase.js bei
 * Laune.
 *
 * Aufruf:  node scripts/validate-train-gruppe.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }

// ============================================================================
// 1. train-progress.js rechnet fremde Konten
// ============================================================================
// Dieselbe Sandbox wie in validate-train-progress.mjs: app.js liefert den
// Levelkatalog, train-progress.js rechnet, und der localStorage-Ersatz ist das
// "eigene Gerät".
const store = new Map();
const localStorageStub = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

const elementStub = {
  style: { setProperty() {}, removeProperty() {} },
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  dataset: {},
  setAttribute() {}, removeAttribute() {}, append() {}, prepend() {}, remove() {},
  addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
  insertBefore() {}, after() {},
};

const progressWindow = { addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
const progressContext = vm.createContext({
  window: progressWindow,
  document: {
    body: { dataset: {}, classList: elementStub.classList, append() {} },
    documentElement: elementStub,
    createElement: () => ({ ...elementStub }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    readyState: "complete",
  },
  localStorage: localStorageStub,
  navigator: {},
  console,
  performance: { now: () => 0 },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  structuredClone: (value) => JSON.parse(JSON.stringify(value)),
});

for (const file of ["spatial-puzzles.js", "app.js", "train-progress.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), progressContext, { filename: file });
}

const train = progressWindow.LernappTrain;
const catalog = progressWindow.LernappLevelCatalog;
assert(train, "train-progress.js hat window.LernappTrain nicht gesetzt");
assert(typeof train.areasForAccount === "function", "areasForAccount fehlt – der fremde Zug liesse sich nicht rechnen");
assert(typeof train.trainProgressForAccount === "function", "trainProgressForAccount fehlt");

// Auf dem eigenen Gerät steht ein bisschen Fortschritt in Problemlösen.
const arukone = catalog.arukone.slice(0, 8);
assert(arukone.length === 8, "der Katalog hat weniger Arukone-Level als erwartet");
arukone.forEach((level) => localStorageStub.setItem(`lernapp.solved.arukone.${level.id}`, "1"));

const eigen = train.allAreas();
const eigenesProblem = eigen.find((area) => area.id === "problemloesen");
assert(eigenesProblem.stage > 0, "der eigene Wagen wächst nicht, obwohl auf dem Gerät Level gelöst sind");

// Ein fremdes Konto: andere Level, anderer Stand. Gerechnet wird aber gleich.
const fremdesKonto = {
  id: "kind2",
  solved: catalog.bimaru.slice(0, 20).map((level) => `bimaru.${level.id}`),
  gameState: {
    "lernapp.cardmatch": { data: { runs: 5, scores: [52, 40, 30, 20, 10] }, updatedAt: 1 },
  },
};

const fremd = train.areasForAccount(fremdesKonto);
assert(fremd.length === 5, `der fremde Zug hat ${fremd.length} Wagen statt 5`);

const fremdesProblem = fremd.find((area) => area.id === "problemloesen");
const fremdesArukone = fremdesProblem.games.find((game) => game.id === "arukone");
const fremdesBimaru = fremdesProblem.games.find((game) => game.id === "bimaru");
assert(fremdesArukone.solved === 0, "der fremde Zug zählt Level, die auf diesem Gerät gelöst wurden");
assert(fremdesBimaru.solved === 5, `Battleships steht beim fremden Konto auf ${fremdesBimaru.solved} statt 5`);

// Spiele mit eigenem Konto lesen den Kasten aus der Cloud des anderen, nicht
// den localStorage dieses Geräts.
const fremdesTempo = fremd.find((area) => area.id === "geschwindigkeit");
const fremderMerker = fremdesTempo.games.find((game) => game.id === "cardMatch");
assert(fremderMerker.solved === 5, `der Karten-Merker steht beim fremden Konto auf ${fremderMerker.solved} statt 5`);
assert(fremderMerker.stars > 0, "die Sterne aus dem fremden Spielstand fehlen");

// Sterne der Katalog-Spiele stehen nur auf dem Gerät, das sie vergeben hat.
// Für ein fremdes Konto gibt es sie deshalb nicht – erfunden werden sie auch
// nicht.
progressWindow.LernappKids = { getStars: () => 3 };
assert(train.areasForAccount(fremdesKonto).find((area) => area.id === "problemloesen").games
  .find((game) => game.id === "bimaru").stars === 0,
  "der fremde Zug bekommt Sterne von diesem Gerät angerechnet");
assert(train.allAreas().find((area) => area.id === "problemloesen").games
  .find((game) => game.id === "arukone").stars > 0,
  "der eigene Zug bekommt seine Sterne nicht mehr");
delete progressWindow.LernappKids;

// Nach der fremden Rechnung gilt wieder das eigene Gerät. Arukone zählt fünf
// Level für den fertigen Wagen, mehr als fünf gelöste heben den Stand nicht.
const nachher = train.allAreas().find((area) => area.id === "problemloesen");
assert(nachher.games.find((game) => game.id === "arukone").solved === 5,
  "nach dem fremden Zug rechnet der eigene mit fremden Daten weiter");
assert(nachher.stage === eigenesProblem.stage, "der eigene Wagen hat seine Stufe verloren");

// Ein leeres Konto ist ein leerer Zug, kein Fehler.
const leer = train.areasForAccount({ id: "neu" });
assert(leer.every((area) => area.stage === 0), "ein Konto ohne Fortschritt bekommt schon gebaute Wagen");
assert(train.trainProgressForAccount({ id: "neu" }).builtWagons === 0,
  "ein Konto ohne Fortschritt hat gebaute Wagen");

// ============================================================================
// 2. firebase.js liefert die Züge der Gruppe
// ============================================================================
const cloudStore = new Map();
const writes = [];
const SERVER = "__server";
const DELETE = "__delete";

function resolveValue(value) {
  if (value && value.__marker === SERVER) return 1700000000000;
  if (Array.isArray(value)) return value.map(resolveValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveValue(entry)]));
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
      : resolveValue(value);
  }
  return out;
}

function fieldValue(data, field) {
  return String(field).split(".").reduce((entry, key) => (entry == null ? entry : entry[key]), data);
}

function docRef(docPath) {
  return {
    path: docPath,
    id: docPath.split("/").pop(),
    async get() {
      const data = cloudStore.get(docPath);
      return { exists: data !== undefined, id: docPath.split("/").pop(), data: () => data && structuredClone(data) };
    },
    async set(payload, options) {
      writes.push({ path: docPath, payload: structuredClone(payload), merge: Boolean(options?.merge) });
      cloudStore.set(docPath, options?.merge ? mergeInto(cloudStore.get(docPath), payload) : resolveValue(payload));
    },
    async delete() { cloudStore.delete(docPath); },
    collection: (name) => collectionRef(`${docPath}/${name}`),
  };
}

// Anders als in den übrigen Prüfskripten filtert where() hier wirklich: die
// Gruppe wird über genau diese Abfrage gefunden, und ein where(), das alles
// durchlässt, prüfte nichts.
function collectionRef(collectionPath, filters = []) {
  const query = {
    orderBy: () => query,
    limit: () => query,
    where: (field, op, value) => collectionRef(collectionPath, [...filters, { field, op, value }]),
    async get() {
      const docs = [];
      cloudStore.forEach((data, key) => {
        if (!key.startsWith(`${collectionPath}/`)) return;
        const rest = key.slice(collectionPath.length + 1);
        if (rest.includes("/")) return;
        const passes = filters.every(({ field, op, value }) => {
          assert(op === "==", `der Firestore-Ersatz kennt nur ==, gefragt wurde ${op}`);
          return fieldValue(data, field) === value;
        });
        if (passes) docs.push({ id: rest, data: () => structuredClone(data) });
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
      set(ref, payload, options) { ops.push(["set", ref, payload, options]); return this; },
      delete(ref) { ops.push(["delete", ref]); return this; },
      async commit() {
        for (const [kind, ref, payload, options] of ops) {
          if (kind === "delete") await ref.delete();
          else await ref.set(payload, options);
        }
      },
    };
  },
});
firestore.FieldValue = {
  serverTimestamp: () => ({ __marker: SERVER }),
  increment: (by) => by,
  delete: () => ({ __marker: DELETE }),
};

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
    closest: () => null,
    contains: () => false,
  };
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

const cloudWindow = {
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

const cloudLocalStorage = {
  store: new Map(),
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; },
  setItem(key, value) { this.store.set(key, String(value)); },
  removeItem(key) { this.store.delete(key); },
  key(index) { return [...this.store.keys()][index] ?? null; },
  get length() { return this.store.size; },
};

const cloudContext = vm.createContext({
  window: cloudWindow,
  document: documentStub,
  navigator: { onLine: true, userAgent: "node" },
  localStorage: cloudLocalStorage,
  CustomEvent: CustomEventStub,
  Event: CustomEventStub,
  console: { ...console, warn() {}, error() {} },
  setInterval: cloudWindow.setInterval,
  clearInterval: cloudWindow.clearInterval,
  setTimeout: (fn) => { if (typeof fn === "function") fn(); return 1; },
  clearTimeout() {},
  structuredClone,
  Promise, Date, Math, JSON, Object, Number, String, Boolean, Array, Map, Set,
  isNaN, parseInt, parseFloat,
});
cloudContext.globalThis = cloudContext;
cloudContext.self = cloudContext;
vm.runInContext(fs.readFileSync(path.join(root, "firebase.js"), "utf8"), cloudContext, { filename: "firebase.js" });

const cloud = cloudWindow.LernappFirebase;
assert(cloud, "firebase.js hat window.LernappFirebase nicht gesetzt");
for (const name of ["getGroup", "loadGroupTrains", "setUserGroup"]) {
  assert(typeof cloud[name] === "function", `${name} fehlt in window.LernappFirebase`);
}

const KIND = (uid, email = "kind@lernapp.local") => ({
  uid, email, displayName: "Kind", emailVerified: false, providerData: [{ providerId: "password" }],
});
const ADMIN = {
  uid: "adminUid", email: "alain.sc2@gmail.com", displayName: "Alain", emailVerified: true,
  providerData: [{ providerId: "google.com" }],
};

const groupEvents = () => events.filter((event) => event.type === "lernapp:group-changed");

// firebase.js meldet sich erst bei der Anmeldung an, nachdem setPersistence
// durch ist – eine Kette aus Promises. Einmal die Warteschlange leeren lassen,
// sonst gibt es hier noch keinen Rückruf.
await new Promise((resolve) => setImmediate(resolve));
assert(typeof authCallback === "function", "firebase.js hat sich nicht bei der Anmeldung angemeldet");

// Eine Familie mit drei Kindern; eines davon ist angemeldet.
cloudStore.set("users/kind1", {
  username: "Mia",
  group: { id: "familie", name: "Familie", displayName: "Mia" },
  trainSettings: { loco: { driver: "panda" }, scene: "wald", updatedAt: 20 },
});
cloudStore.set("users/kind2", {
  username: "Nino",
  group: { id: "familie", name: "Familie", displayName: "Der Schnellste" },
  trainSettings: { loco: { driver: "igel" }, scene: "berge", updatedAt: 30 },
  gameState: { "lernapp.cardmatch": { data: { runs: 4, scores: [30] }, updatedAt: 7 } },
});
// Die Kennung kommt aus dem Katalog, nicht aus dem Kopf: firebase.js legt sie
// so ab, und train-progress.js sucht sie so wieder. Ständen hier erfundene
// Kennungen, prüfte dieses Skript zwei Hälften, die nie zusammenpassen müssen.
const bimaruLevel = catalog.bimaru[0];
cloudStore.set(`users/kind2/levelProgress/bimaru_${bimaruLevel.id}`,
  { game: "bimaru", levelId: bimaruLevel.id, solved: true });
cloudStore.set(`users/kind2/levelProgress/bimaru_${catalog.bimaru[1].id}`,
  { game: "bimaru", levelId: catalog.bimaru[1].id, solved: false });
// Ohne eigenen Anzeigenamen zählt der Name des Kontos.
cloudStore.set("users/kind3", { username: "Alva", group: { id: "familie", name: "Familie" } });
cloudStore.set("users/kind3/levelProgress/arukone_A_1-1", { game: "arukone", levelId: "A 1-1", solved: true });
// Ein Kind aus einer anderen Gruppe und eines ganz ohne.
cloudStore.set("users/fremd", { username: "Ben", group: { id: "klasse-3b", name: "Klasse 3b" } });
cloudStore.set("users/allein", { username: "Sam" });

await authCallback(KIND("kind1"));

const gemeldet = groupEvents().at(-1);
assert(gemeldet, "beim Anmelden wird lernapp:group-changed nicht gemeldet");
assert(gemeldet.detail?.id === "familie", `gemeldet wurde ${JSON.stringify(gemeldet.detail)}`);
assert(cloud.getGroup().displayName === "Mia", "der eigene Anzeigename in der Gruppe fehlt");

const kopie = cloud.getGroup();
kopie.id = "andere";
assert(cloud.getGroup().id === "familie", "getGroup gibt den inneren Zustand heraus");

const gruppe = await cloud.loadGroupTrains();
assert(gruppe.length === 2, `erwartet 2 fremde Züge, gefunden ${gruppe.length}: ${gruppe.map((t) => t.id).join(", ")}`);
assert(!gruppe.some((entry) => entry.id === "kind1"), "der eigene Zug steht in der Liste der anderen");
assert(!gruppe.some((entry) => entry.id === "fremd" || entry.id === "allein"),
  "ein Konto ausserhalb der Gruppe ist in der Liste gelandet");
assert(gruppe[0].name === "Alva" && gruppe[1].name === "Der Schnellste",
  `die Reihenfolge ist ${gruppe.map((entry) => entry.name).join(", ")} statt alphabetisch`);

const nino = gruppe.find((entry) => entry.id === "kind2");
assert(nino.name === "Der Schnellste", "der vom Admin vergebene Anzeigename gilt nicht");
assert(nino.loco?.driver === "igel", "die Lok des anderen fehlt");
assert(nino.solved.length === 1 && nino.solved[0] === `bimaru.${bimaruLevel.id}`,
  `gelöste Level kommen als ${JSON.stringify(nino.solved)} an – ein ungelöstes ist mitgekommen oder die Kennung passt nicht`);
assert(nino.gameState["lernapp.cardmatch"]?.data.runs === 4, "der Spielstand des anderen fehlt");

const alva = gruppe.find((entry) => entry.id === "kind3");
assert(alva.name === "Alva", "ohne eigenen Anzeigenamen gilt der Name des Kontos nicht");

// Was firebase.js liefert, muss train-progress.js rechnen können: die beiden
// Hälften der Funktion stehen in verschiedenen Dateien und dürfen nicht
// auseinanderlaufen.
const ninoAreas = train.areasForAccount(nino);
assert(ninoAreas.find((area) => area.id === "problemloesen").games
  .find((game) => game.id === "bimaru").solved === 1,
  "der gelöste Level aus der Cloud kommt im fremden Wagen nicht an");
assert(ninoAreas.find((area) => area.id === "geschwindigkeit").games
  .find((game) => game.id === "cardMatch").solved === 4,
  "der Spielstand aus der Cloud kommt im fremden Wagen nicht an");

// Abmelden: keine Gruppe, keine fremden Züge.
await authCallback(null);
assert(groupEvents().at(-1).detail === null, "beim Abmelden wird die Gruppe nicht abgeräumt");
assert(cloud.getGroup() === null, "nach dem Abmelden hängt die Gruppe noch im Zustand");
assert((await cloud.loadGroupTrains()).length === 0, "nach dem Abmelden kommen noch fremde Züge");

// Ein Konto ohne Gruppe steht allein da.
await authCallback(KIND("allein"));
assert(cloud.getGroup() === null, "ein Konto ohne Gruppe bekommt eine");
assert((await cloud.loadGroupTrains()).length === 0, "ohne Gruppe kommen fremde Züge");

// ============================================================================
// 3. Der Admin ordnet zu – und schreibt dabei nur das Gruppenfeld
// ============================================================================
await authCallback(ADMIN);
writes.length = 0;

assert(await cloud.setUserGroup("allein", { name: "Familie", displayName: "Sam" }) === true,
  "der Admin kann kein Konto zuordnen");

const zuordnung = writes.filter((write) => write.path === "users/allein");
assert(zuordnung.length === 1, `erwartet ein Schreibvorgang, gefunden ${zuordnung.length}`);
assert(zuordnung[0].merge === true, "ohne merge würde das ganze fremde Profil überschrieben");
const erlaubt = new Set(["group", "updatedAt"]);
const geschrieben = Object.keys(zuordnung[0].payload);
assert(geschrieben.every((key) => erlaubt.has(key)),
  `beim Zuordnen wird ${geschrieben.filter((key) => !erlaubt.has(key)).join(", ")} geschrieben – firestore.rules lässt nur ${[...erlaubt].join(", ")} zu`);

const zugeordnet = cloudStore.get("users/allein");
assert(zugeordnet.group.id === "familie", `die Gruppe steht auf ${zugeordnet.group.id} statt familie`);
assert(zugeordnet.group.displayName === "Sam", "der Anzeigename des Zugs fehlt");
assert(zugeordnet.username === "Sam", "das Zuordnen hat das Profil verändert");

// Derselbe Name, anders geschrieben, ist dieselbe Gruppe – sonst machte ein
// Tippfehler heimlich eine zweite auf.
await cloud.setUserGroup("fremd", { name: "  FAMILIE  ", displayName: "Ben" });
assert(cloudStore.get("users/fremd").group.id === "familie",
  `"FAMILIE" landet in ${cloudStore.get("users/fremd").group.id} statt in familie`);
assert(cloudStore.get("users/fremd").group.name === "FAMILIE", "der geschriebene Name geht verloren");

// Ein leeres Feld nimmt das Konto heraus – und lässt sonst alles stehen.
writes.length = 0;
await cloud.setUserGroup("fremd", { name: "" });
assert(cloudStore.get("users/fremd").group === undefined, "das Konto hängt noch in der Gruppe");
assert(cloudStore.get("users/fremd").username === "Ben", "beim Herausnehmen ging das Profil mit");
assert(Object.keys(writes.at(-1).payload).every((key) => erlaubt.has(key)),
  "beim Herausnehmen wird mehr als das Gruppenfeld geschrieben");

// Der Admin sieht seine eigene Gruppe sofort, ohne sich neu anzumelden.
const vorher = groupEvents().length;
await cloud.setUserGroup("adminUid", { name: "Familie", displayName: "Papa" });
assert(groupEvents().length > vorher, "die eigene Gruppe wird nach dem Zuordnen nicht gemeldet");
assert(cloud.getGroup()?.id === "familie", "die eigene Gruppe steht nach dem Zuordnen nicht im Zustand");

// Die Karte im Admin-Bereich ist an das Fenster angeschlossen. Ohne DOM lässt
// sich das nicht klicken, also wird geprüft, dass sie überhaupt gebaut und
// gebunden wird – eine Karte, die niemand rendert, fiele sonst nicht auf.
const quelle = fs.readFileSync(path.join(root, "firebase.js"), "utf8");
assert(/\$\{isGuest \? "" : renderAdminGroupBlock\(detail\.id, userData\)\}/.test(quelle),
  "die Gruppen-Karte steht in keiner Detailansicht – der Admin könnte niemanden zuordnen");
assert(/bindAdminGroupCard\(root\);/.test(quelle),
  "die Gruppen-Karte wird nicht gebunden – ihre Knöpfe täten nichts");
assert(quelle.includes("data-admin-group-name") && quelle.includes("data-admin-group-display"),
  "der Karte fehlt ein Feld: Gruppe oder Name des Zugs");

// ============================================================================
// 4. firestore.rules erlauben genau das – nicht mehr
// ============================================================================
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");

assert(rules.includes("function isGroupChange()"),
  "firestore.rules kennt isGroupChange nicht – der Admin könnte niemanden zuordnen");
assert(/allow update: if isAdmin\(\) && \(isProgressReset\(\) \|\| isGroupChange\(\)\);/.test(rules),
  "der Admin darf die Gruppe nicht schreiben – die Zuordnung im Profilfenster liefe ins Leere");
assert(rules.includes('hasOnly(["group", "updatedAt"])'),
  "isGroupChange erlaubt mehr als das Gruppenfeld");
assert(/allow update: if isOwner\(userId\)\s*\n\s*&& !request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasAny\(\["group"\]\);/.test(rules),
  "ein Kind darf sein eigenes Gruppenfeld schreiben – damit läse es fremden Fortschritt mit");
assert(rules.includes('!("group" in request.resource.data)'),
  "ein neues Konto darf sich mit einer Gruppe anlegen");
assert(/match \/levelProgress\/\{levelId\} \{\s*\n\s*allow read: if sharesGroupWith\(userId\);/.test(rules),
  "die Gruppe darf die gelösten Level der anderen nicht lesen – die fremden Wagen blieben leer");
assert(!/match \/sessions\/\{[^}]*\} \{[^}]*sharesGroupWith/.test(rules),
  "die Gruppe darf fremde Sitzungen lesen – geteilt werden nur gelöste Level");

// ============================================================================
// 5. Die Bühne baut die fremden Züge
// ============================================================================
// Kein DOM-Test: geprüft wird, dass train-home.js die Teile benutzt, auf denen
// alles andere hier steht. Fällt eine davon weg, stünde das Startbild still da
// und niemand merkte es.
const home = fs.readFileSync(path.join(root, "train-home.js"), "utf8");
for (const [teil, warum] of [
  ["loadGroupMembers", "die Bühne holt die Konten der Gruppe nicht"],
  ["areasForAccount", "die Bühne rechnet den fremden Stand nicht"],
  ["lernapp:group-changed", "eine Änderung des Admins käme nie an"],
  ["train-friends", "die Ebene für die fremden Züge fehlt"],
  ["friend-name", "die Züge stünden ohne Namen da"],
]) {
  assert(home.includes(teil), `train-home.js: ${warum} (${teil} fehlt)`);
}

const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
assert(/\.train-stage:not\(\[data-view="home"\]\) \.train-friends \{ display: none; \}/.test(css),
  "die fremden Züge stehen auch auf den anderen Bühnen – dort gehören sie nicht hin");
assert(css.includes('.train-stage[data-view="friend"] .train-band'),
  "in der Ansicht eines fremden Zugs steht der eigene noch im Bild");

console.log("Gruppe geprüft: fremder Fortschritt gerechnet, Gruppe geladen, Zuordnung nur durch den Admin, Regeln passen.");
