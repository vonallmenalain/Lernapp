/*
 * Rechnet die Schranke richtig – und kennt sie dieselben Spiele wie der Zug?
 * ---------------------------------------------------------------------------
 * entitlement.js entscheidet, was ohne Kauf frei ist: die ersten zehn
 * Stationen, das erste Spiel je Bereich, dort die Stufe Wiese. Dafür trägt
 * es eine eigene Tabelle der Bereiche, weil die Spielseiten train-progress.js
 * nicht laden. Diese Prüfung hält die beiden Tabellen gleich und spielt die
 * Rechnung für jede Sorte Konto durch: Gast, Konto ohne Kauf, Konto mit
 * Kauf, Kind aus der Zeit vor dem Kauf. Dazu: Jede Spielseite und die
 * Startseite laden entitlement.js, und der Service Worker hält es vor.
 *
 * Läuft ohne Browser: die Skripte laufen in einer Sandbox.
 *
 * Aufruf:  node scripts/validate-schranke.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const fehler = [];
function pruefe(bedingung, meldung) { if (!bedingung) fehler.push(meldung); }
const lies = (name) => fs.readFileSync(path.join(root, name), "utf8");

// --- Sandbox ----------------------------------------------------------------
function sandbox() {
  const store = new Map();
  const elementStub = {
    style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    dataset: {},
    setAttribute() {}, removeAttribute() {}, append() {}, prepend() {}, remove() {},
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
    insertBefore() {}, after() {},
  };
  const windowStub = { addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  const context = vm.createContext({
    window: windowStub,
    document: {
      body: { dataset: {}, classList: elementStub.classList, append() {} },
      documentElement: elementStub,
      createElement: () => ({ ...elementStub }),
      createElementNS: () => ({ ...elementStub }),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
      dispatchEvent() {},
      readyState: "complete",
    },
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    },
    navigator: {},
    console,
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    structuredClone: (value) => JSON.parse(JSON.stringify(value)),
    URLSearchParams,
  });
  return { context, windowStub };
}

// --- 1. Dieselben Spiele wie der Zug ---------------------------------------------
{
  const { context, windowStub } = sandbox();
  for (const file of ["spatial-puzzles.js", "app.js", "train-progress.js", "entitlement.js"]) {
    vm.runInContext(lies(file), context, { filename: file });
  }
  const zug = windowStub.LernappTrain?.AREAS;
  const schranke = windowStub.LernappEntitlement?.AREAS;
  pruefe(Array.isArray(zug) && zug.length === 5, "train-progress.js: AREAS fehlt oder hat nicht fünf Bereiche");
  pruefe(Array.isArray(schranke) && schranke.length === 5, "entitlement.js: AREAS fehlt oder hat nicht fünf Bereiche");
  if (zug && schranke) {
    const kurz = (areas) => areas.map((area) => ({
      id: area.id,
      games: area.games.map((game) => ({ id: game.id, page: game.page, ownProgress: game.ownProgress || null })),
    }));
    const a = JSON.stringify(kurz(zug));
    const b = JSON.stringify(kurz(schranke));
    pruefe(a === b, "entitlement.js kennt andere Bereiche oder Spiele als train-progress.js – die Tabelle in entitlement.js muss nachgeführt werden");
  }
  // Jede Seite eines Spiels gibt es, und jede lädt die Schranke.
  (schranke || []).forEach((area) => area.games.forEach((game) => {
    const datei = path.join(root, game.page);
    if (!fs.existsSync(datei)) { fehler.push(`${game.page}: Seite fehlt`); return; }
    pruefe(/<script defer src="entitlement\.js\?v=/.test(lies(game.page)), `${game.page}: lädt entitlement.js nicht`);
  }));
  pruefe(/<script defer src="entitlement\.js\?v=/.test(lies("index.html")), "index.html: lädt entitlement.js nicht");
  pruefe(/`\.\/entitlement\.js\$\{ASSET_VERSION_QUERY\}`/.test(lies("service-worker.js")), "service-worker.js: entitlement.js fehlt in CORE_ASSETS");
  // Auf der Startseite muss die Schranke vor dem Zug stehen, auf den Spielseiten
  // vor der Bühne: entitlement.js vor train-home.js, app.js und game-shell.js.
  const reihenfolge = (html, vor, nach) => {
    const a = html.indexOf(`src="${vor}?v=`);
    const b = html.indexOf(`src="${nach}?v=`);
    return a >= 0 && (b < 0 || a < b);
  };
  pruefe(reihenfolge(lies("index.html"), "entitlement.js", "train-home.js"), "index.html: entitlement.js steht nicht vor train-home.js");
  (schranke || []).forEach((area) => area.games.forEach((game) => {
    if (!fs.existsSync(path.join(root, game.page))) return;
    const html = lies(game.page);
    pruefe(reihenfolge(html, "entitlement.js", "game-shell.js") && reihenfolge(html, "entitlement.js", "app.js"), `${game.page}: entitlement.js steht nicht vor der Bühne`);
  }));
}

// --- 2. Die Rechnung je Konto --------------------------------------------------------
function rechne(konto) {
  const { context, windowStub } = sandbox();
  windowStub.LernappFirebase = konto;
  vm.runInContext(lies("entitlement.js"), context, { filename: "entitlement.js" });
  return windowStub.LernappEntitlement;
}
const konto = ({ angemeldet = true, kauf = null, rolle = "child", eltern = null, geladen = true } = {}) => ({
  isSignedIn: () => angemeldet,
  getEntitlement: () => kauf,
  getRole: () => rolle,
  getParentUid: () => eltern,
  isEntitlementLoaded: () => geladen,
});

// Der Gast: nur der Anfang.
{
  const e = rechne(null);
  pruefe(e.reason() === "gast", `ohne Firebase: Grund ${e.reason()}, erwartet gast`);
  pruefe(!e.isFree(), "ein Gast ist frei");
  pruefe(e.isLoaded(), "für den Gast gilt der Stand nicht als bekannt");
  pruefe(e.stationFree(1) && e.stationFree(10) && !e.stationFree(11) && !e.stationFree(130), "Gast: Stationen 1–10 frei, 11–130 zu – stimmt nicht");
  pruefe(e.stationFree(0) && e.stationFree("x"), "Gast: eine Fahrt ohne Station gilt als zu");
  pruefe(e.gameFree("backpack.html") && e.gameFree("schwarmfokus.html") && e.gameFree("tiersprung.html") && e.gameFree("raumdetektiv.html") && e.gameFree("buchstaben.html"), "Gast: das erste Spiel eines Bereichs ist zu");
  pruefe(!e.gameFree("memory.html") && !e.gameFree("kakuro.html") && !e.gameFree("faesser.html"), "Gast: ein späteres Spiel ist frei");
  pruefe(e.gameFree("memory") === false && e.gameFree("runner") === true && e.gameFree("spatial") === true, "Gast: Kennung oder ownProgress werden nicht erkannt");
  pruefe(e.gameFree("train-test.html") && e.gameFree("index.html") && e.gameFree(""), "Gast: eine Seite ohne Bereich ist zu");
  pruefe(e.targetFree("arukone.html?station=10") && !e.targetFree("kakuro.html?station=11") && !e.targetFree("backpack.html?station=11"), "Gast: mit Station entscheidet nicht die Station");
  pruefe(e.targetFree("backpack.html") && !e.targetFree("memory.html"), "Gast: ohne Station entscheidet nicht das Spiel");
  pruefe(e.levelFree({ game: "letterPuzzle", difficulty: "easy" }) && !e.levelFree({ game: "letterPuzzle", difficulty: "medium" }), "Gast: Wiese im ersten Spiel frei, Wald zu – stimmt nicht");
  pruefe(!e.levelFree({ game: "kakuro", difficulty: "easy" }), "Gast: Wiese im dritten Spiel ist frei");
  pruefe(!e.levelFree(null), "Gast: ein fehlendes Level ist frei");
}
// Ein Konto ohne Kauf (die Eltern haben noch nicht gekauft): wie der Gast.
{
  const e = rechne(konto({ rolle: "child", eltern: "eltern1" }));
  pruefe(e.reason() === "offen", `Kind ohne Kauf: Grund ${e.reason()}, erwartet offen`);
  pruefe(!e.isFree() && !e.stationFree(11) && !e.gameFree("memory.html"), "Kind ohne Kauf ist frei");
  const p = rechne(konto({ rolle: "parent" }));
  pruefe(p.reason() === "offen" && !p.isFree(), "Eltern ohne Kauf sind frei");
  const n = rechne(konto({ rolle: "child", eltern: "eltern1", geladen: false }));
  pruefe(!n.isLoaded() && !n.isFree(), "solange der Kauf nicht geladen ist, gilt nicht 'zu'");
}
// Mit Kauf: alles.
{
  const e = rechne(konto({ rolle: "child", eltern: "eltern1", kauf: { active: true } }));
  pruefe(e.reason() === "gekauft" && e.isFree(), "Kind mit Kauf ist nicht frei");
  pruefe(e.stationFree(130) && e.gameFree("kakuro.html") && e.levelFree({ game: "kakuro", difficulty: "hard" }) && e.targetFree("memory.html?station=99"), "Kind mit Kauf: etwas ist zu");
  const z = rechne(konto({ rolle: "parent", kauf: { active: false } }));
  pruefe(z.reason() === "offen" && !z.isFree(), "ein zurückerstatteter Kauf schaltet noch frei");
}
// Der Gründer: ein Kind ohne Elternkonto, aus der Zeit vor dem Kauf.
{
  const e = rechne(konto({ rolle: "child", eltern: null }));
  pruefe(e.reason() === "gruender" && e.isFree() && e.stationFree(130) && e.gameFree("kakuro.html"), "das Gründer-Kind ist nicht frei");
  const a = rechne(konto({ rolle: "admin", eltern: null }));
  pruefe(a.reason() === "offen", `der Admin ohne Kauf gilt als ${a.reason()} – Gründer sind nur Kinder ohne Eltern`);
}

if (fehler.length) {
  console.error("Die Schranke stimmt nicht:");
  fehler.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log("Die Schranke rechnet richtig und kennt dieselben Spiele wie der Zug.");
