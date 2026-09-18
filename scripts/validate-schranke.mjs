/*
 * Rechnet die Schranke richtig – und kennt sie dieselben Spiele wie der Zug?
 * ---------------------------------------------------------------------------
 * entitlement.js entscheidet, was ohne Kauf frei ist: die ersten zehn
 * Stationen der Reise, und von jedem Spiel eine einzige Runde. Dafür trägt
 * es eine eigene Tabelle der Bereiche, weil die Spielseiten train-progress.js
 * nicht laden. Diese Prüfung hält die beiden Tabellen gleich und spielt die
 * Rechnung für jede Sorte Konto durch: Gast, Konto ohne Kauf, Konto mit
 * Kauf, Kind aus der Zeit vor dem Kauf. Dazu die Schnupperrunden: Zählt eine
 * Runde? Zählt sie nur einmal? Lässt die Reise sie in Ruhe? Und: Jede
 * Spielseite und die Startseite laden entitlement.js, und der Service Worker
 * hält es vor.
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
function sandbox({ suche = "", pfad = "/index.html" } = {}) {
  const store = new Map();
  const elementStub = {
    style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    dataset: {},
    setAttribute() {}, removeAttribute() {}, append() {}, prepend() {}, remove() {},
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
    insertBefore() {}, after() {},
  };
  const windowStub = {
    addEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    // Die Schranke liest hier ab, ob gerade eine Station der Reise läuft.
    location: { search: suche, pathname: pfad },
  };
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
      dispatchEvent() { return true; },
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
    // rundeBeendet meldet sich mit einem Ereignis; ohne Browser reicht eine
    // Attrappe, die den Namen und die Angaben behält.
    CustomEvent: class { constructor(type, init = {}) { this.type = type; this.detail = init.detail ?? null; } },
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

// --- 2. Die Rechnung je Konto ----------------------------------------------
function rechne(konto, optionen = {}) {
  const { context, windowStub } = sandbox(optionen);
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
  // Neues Modell: Jedes Spiel ist offen, bis es einmal gespielt wurde.
  pruefe(e.gameFree("backpack.html") && e.gameFree("memory.html") && e.gameFree("kakuro.html") && e.gameFree("faesser.html"), "Gast: ein noch nie gespieltes Spiel ist zu");
  pruefe(e.gameFree("memory") && e.gameFree("runner") && e.gameFree("spatial"), "Gast: Kennung oder ownProgress werden nicht erkannt");
  pruefe(e.gameFree("train-test.html") && e.gameFree("index.html") && e.gameFree(""), "Gast: eine Seite ohne Bereich ist zu");
  pruefe(e.targetFree("arukone.html?station=10") && !e.targetFree("kakuro.html?station=11"), "Gast: mit Station entscheidet nicht die Station");
  pruefe(e.targetFree("backpack.html") && e.targetFree("memory.html"), "Gast: ohne Station entscheidet nicht das Spiel");
  pruefe(e.levelFree({ game: "letterPuzzle", difficulty: "easy" }) && e.levelFree({ game: "letterPuzzle", difficulty: "medium" }) && e.levelFree({ game: "kakuro", difficulty: "hard" }), "Gast: die Welten sind einzeln gesperrt – es soll nur das Spiel zählen");
  pruefe(!e.levelFree(null), "Gast: ein fehlendes Level ist frei");
  pruefe(!e.gameGespielt("memory.html") && e.gespielteRunden("memory.html") === 0, "Gast: eine Runde gilt als gespielt, bevor etwas gespielt wurde");
}
// Ein Konto ohne Kauf (die Eltern haben noch nicht gekauft): wie der Gast.
{
  const e = rechne(konto({ rolle: "child", eltern: "eltern1" }));
  pruefe(e.reason() === "offen", `Kind ohne Kauf: Grund ${e.reason()}, erwartet offen`);
  pruefe(!e.isFree() && !e.stationFree(11) && e.gameFree("memory.html"), "Kind ohne Kauf: Station 11 offen oder die erste Runde zu");
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
  // Wer gekauft hat, verbraucht nichts: Die Runden werden gar nicht gezählt.
  e.rundeBeendet("memory");
  e.rundeBeendet("memory");
  pruefe(e.gameFree("memory.html") && !e.gameGespielt("memory.html") && e.gespielteRunden("memory.html") === 0, "Kind mit Kauf: die Runden werden mitgezählt");
  const z = rechne(konto({ rolle: "parent", kauf: { active: false } }));
  pruefe(z.reason() === "offen" && !z.isFree(), "ein zurückerstatteter Kauf schaltet noch frei");
}
// --- 3. Die Schnupperrunden -------------------------------------------------
// Eine Runde je Spiel. Danach liegt ein Schloss auf dem Haus, und zwar nur auf
// diesem: Die anderen vierundzwanzig Spiele bleiben offen.
{
  const e = rechne(konto({ rolle: "child", eltern: "eltern1" }));
  pruefe(e.GRATIS_RUNDEN === 1, `GRATIS_RUNDEN ist ${e.GRATIS_RUNDEN}, erwartet 1`);
  pruefe(e.gameFree("memory.html"), "vor der ersten Runde ist Memory zu");
  e.rundeBeendet("memory");
  pruefe(e.gespielteRunden("memory.html") === 1, `nach einer Runde stehen ${e.gespielteRunden("memory.html")} Runden`);
  pruefe(!e.gameFree("memory.html") && e.gameGespielt("memory.html"), "nach der Runde ist Memory noch offen");
  pruefe(!e.targetFree("memory.html") && !e.levelFree({ game: "memory", difficulty: "easy" }), "nach der Runde führen Ziel und Level noch hinein");
  // Nur dieses eine Spiel.
  pruefe(e.gameFree("kakuro.html") && e.gameFree("backpack.html") && !e.gameGespielt("kakuro.html"), "die Runde in Memory sperrt andere Spiele mit");
  // Ein zweites Mal zählt nicht weiter: Der Stand bleibt bei eins.
  e.rundeBeendet("memory");
  pruefe(e.gespielteRunden("memory.html") === 1, "die Runde wird über das Gratis-Mass hinaus weitergezählt");
  // Über die Seite statt über die Kennung, und über den eigenen Fortschritt.
  e.rundeBeendet("kakuro.html");
  pruefe(!e.gameFree("kakuro.html"), "rundeBeendet erkennt die Seite nicht");
  e.rundeBeendet("runner");
  pruefe(!e.gameFree("tiersprung.html"), "rundeBeendet erkennt die Kennung aus ownProgress nicht");
  // Eine Seite, die zu keinem Spiel gehört, zählt nichts hoch.
  e.rundeBeendet("train-test.html");
  pruefe(e.gameFree("train-test.html"), "eine fremde Seite wird gesperrt");
  // Die Reise bleibt die Reise: Ihre ersten zehn Stationen sind frei, auch
  // wenn das Spiel dahinter seine Runde schon verbraucht hat.
  pruefe(e.targetFree("memory.html?station=3") && e.stationFree(10) && !e.stationFree(11), "die verbrauchte Runde schließt die freien Stationen");
}
// Auf der Reise zählt keine Runde: Die Adresse trägt eine Station.
{
  const e = rechne(konto({ rolle: "child", eltern: "eltern1" }), { suche: "?station=4", pfad: "/memory.html" });
  e.rundeBeendet("memory");
  pruefe(e.gespielteRunden("memory.html") === 0 && e.gameFree("memory.html"), "eine Runde auf der Reise verbraucht die Schnupperrunde");
}
// Ohne Speicher (privates Fenster): nichts wird gezählt, alles bleibt offen.
{
  const { context, windowStub } = sandbox();
  windowStub.LernappFirebase = konto({ rolle: "child", eltern: "eltern1" });
  vm.runInContext("localStorage.getItem = () => { throw new Error('kein Speicher'); }; localStorage.setItem = () => { throw new Error('kein Speicher'); };", context);
  vm.runInContext(lies("entitlement.js"), context, { filename: "entitlement.js" });
  const e = windowStub.LernappEntitlement;
  e.rundeBeendet("memory");
  pruefe(e.gameFree("memory.html") && e.gespielteRunden("memory.html") === 0, "ohne Speicher sperrt die Schranke");
}

// --- 4. Wo die Runde gemeldet wird -------------------------------------------
// Eine Runde zählt nur, wenn sie gemeldet wird. Drei Stellen melden, und jede
// hat ihren Grund: die Bühne, wenn das Ergebnis dasteht; die Levelwahl, wenn
// ein Level geschafft ist; Tier-Sprung, weil es seine Runden selbst zählt.
// Nimmt jemand einen Aufruf heraus, ist das Spiel still unbegrenzt gratis.
{
  const shell = lies("game-shell.js");
  pruefe(/window\.LernappEntitlement\?\.rundeBeendet\?\.\(\)/.test(shell), "game-shell.js meldet die Runde nicht (rundeBeendet fehlt in showResult)");
  const app = lies("app.js");
  pruefe(/window\.LernappEntitlement\?\.rundeBeendet\?\.\(level\.game\)/.test(app), "app.js meldet die Runde nicht (rundeBeendet fehlt in markSolved)");
  const sprung = lies("tiersprung.js");
  pruefe(/window\.LernappEntitlement\?\.rundeBeendet\?\.\("tiersprung"\)/.test(sprung), "tiersprung.js meldet die Runde nicht");
  // Und der Weg zurück ins Spiel geht über die Schranke: Beide Neu-Knöpfe der
  // Bühne rufen nochEinmal(), nicht onRestart() – sonst spielt ein Kind nach
  // der Gratis-Runde einfach weiter.
  pruefe(/function nochEinmal\(\)/.test(shell), "game-shell.js hat kein nochEinmal()");
  const neuKnoepfe = shell.split("\n").filter((zeile) => zeile.includes('iconButton("again"'));
  pruefe(neuKnoepfe.length === 2, `game-shell.js hat ${neuKnoepfe.length} Neu-Knöpfe, erwartet 2`);
  neuKnoepfe.forEach((knopf) => {
    pruefe(/nochEinmal\(\)/.test(knopf), `ein Neu-Knopf geht an der Schranke vorbei: ${knopf.trim().slice(0, 90)}`);
  });
  // Die Bühne zeichnet sich neu, wenn ein Schloss dazukommt oder wegfällt.
  pruefe(/lernapp:entitlement-changed[\s\S]{0,60}render\(\)/.test(lies("train-home.js")), "train-home.js zeichnet die Bühne nicht neu, wenn sich die Schranke bewegt");
}

// --- 5. Der Gründer ---------------------------------------------------------
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
