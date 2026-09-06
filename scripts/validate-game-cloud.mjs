/*
 * Prüft die Spielstände aus game-cloud.js, ohne Browser und ohne Netz.
 *
 * Der Kern ist die Zusammenführung: derselbe Stand geht vom Gerät in die
 * Cloud und kommt von dort zurück – bei jedem Abgleich. Dabei darf kein
 * Ergebnis der Bestenliste doppelt werden und keine Runde doppelt zählen.
 * Genau das war einmal kaputt: zwei Runden, und die Bestenliste zeigte
 * viermal dieselbe 29. Hier wird der Weg nachgestellt: Runde spielen,
 * speichern, Echo aus der Cloud, noch ein Echo – und nachgezählt.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// --- Sandbox: Gerät, Dokument und eine Cloud, die alles zurückspielt ---------
const geraet = new Map();
const listeners = {};
const cloudDoc = {};
const gespeichert = [];

const windowStub = {
  LernappFirebase: {
    isSignedIn: () => true,
    getGameState: (key) => (cloudDoc[key] ? JSON.parse(JSON.stringify(cloudDoc[key])) : null),
    saveGameState(key, data) {
      cloudDoc[key] = { data: JSON.parse(JSON.stringify(data)), updatedAt: gespeichert.length + 1 };
      gespeichert.push({ key, data: JSON.parse(JSON.stringify(data)) });
      return Promise.resolve(true);
    },
  },
};
const context = vm.createContext({
  window: windowStub,
  document: {
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    dispatchEvent() { return true; },
  },
  localStorage: {
    getItem: (key) => (geraet.has(key) ? geraet.get(key) : null),
    setItem: (key, value) => geraet.set(key, String(value)),
    removeItem: (key) => geraet.delete(key),
  },
  console,
});
vm.runInContext(fs.readFileSync(path.join(root, "game-cloud.js"), "utf8"), context, { filename: "game-cloud.js" });

const api = windowStub.LernappGameCloud;
assert(api, "game-cloud.js hat window.LernappGameCloud nicht gesetzt");

// So meldet firebase.js, was in der Cloud steht.
function echo() {
  const all = Object.fromEntries(Object.entries(cloudDoc).map(([key, entry]) => [key, JSON.parse(JSON.stringify(entry))]));
  (listeners["lernapp:game-state"] || []).forEach((fn) => fn({ detail: all }));
}

// --- Die Zusammenführung für sich --------------------------------------------
const merge = api.mergeScores(5);

// Dasselbe Ergebnis auf beiden Seiten ist dasselbe Ergebnis.
assert(gleich(merge({ runs: 1, scores: [29] }, { runs: 1, scores: [29] }), { runs: 1, scores: [29] }), "das Echo derselben Runde macht aus einer 29 zwei");
// Zwei echte Runden mit derselben Zahl auf einem Gerät bleiben zwei.
assert(gleich(merge({ runs: 2, scores: [29, 29] }, { runs: 2, scores: [29, 29] }), { runs: 2, scores: [29, 29] }), "zwei echte 29er werden zu einer");
assert(gleich(merge({ runs: 2, scores: [29, 29] }, { runs: 1, scores: [29] }), { runs: 2, scores: [29, 29] }), "die Seite mit zwei 29ern hat recht");
// Verschiedene Ergebnisse werden vereinigt und sortiert.
assert(gleich(merge({ runs: 1, scores: [20] }, { runs: 1, scores: [30] }), { runs: 1, scores: [30, 20] }), "verschiedene Ergebnisse müssen zusammenkommen");
// Höchstens fünf, die besten.
assert(gleich(merge({ runs: 4, scores: [9, 8, 7, 6] }, { runs: 3, scores: [10, 5, 4] }).scores, [10, 9, 8, 7, 6]), "die Liste muss bei fünf enden, mit den besten");
// Der Zähler nimmt das Maximum, nie die Summe.
assert(merge({ runs: 3, scores: [] }, { runs: 2, scores: [] }).runs === 3, "der Zähler muss das Maximum nehmen");
// Unsinn in der Liste fällt weg.
assert(gleich(merge({ runs: 2, scores: [29, null, "x", NaN] }, { runs: 2, scores: [Infinity, 12] }).scores, [29, 12]), "nur Zahlen gehören in die Bestenliste");
assert(gleich(merge({}, {}), { runs: 0, scores: [] }), "leer plus leer ist leer");

// Ein Stand aus der Zeit des Aneinanderhängens: zwei Runden, viermal 29 und
// einmal 28. Die Doppelten fallen weg, bis die Liste zu den Runden passt.
const kaputt = { runs: 2, scores: [29, 29, 29, 29, 28] };
assert(gleich(merge(kaputt, kaputt), { runs: 2, scores: [29, 28] }), `ein alter Stand mit Doppelten heilt nicht: ${JSON.stringify(merge(kaputt, kaputt))}`);
const zwei = merge({ runs: 3, scores: [30, 30, 30, 20, 20] }, { runs: 3, scores: [30, 30, 30, 20, 20] });
assert(zwei.scores.length === 3 && zwei.scores[0] === 30 && zwei.scores.includes(20), `Doppelte fallen zuerst beim häufigsten Wert weg: ${JSON.stringify(zwei.scores)}`);
// Lauter verschiedene Ergebnisse bleiben, auch wenn der Zähler kleiner ist:
// zwei Geräte, auf jedem wurde gespielt, der Zähler wird nicht summiert.
assert(gleich(merge({ runs: 3, scores: [30, 20, 10] }, { runs: 2, scores: [25, 15] }), { runs: 3, scores: [30, 25, 20, 15, 10] }), "verschiedene Ergebnisse von zwei Geräten dürfen nicht wegfallen");

// --- Der ganze Weg: Runde, Cloud, Echo ------------------------------------------
const KEY = "lernapp.probe";
const store = api.register({ key: KEY, empty: { runs: 0, scores: [] }, merge: api.mergeScores(5) });
const spiele = (punkte) => store.update((old) => ({
  runs: (Number(old.runs) || 0) + 1,
  scores: [...(old.scores || []), punkte].sort((a, b) => b - a).slice(0, 5),
}));

spiele(29);
assert(gleich(store.read(), { runs: 1, scores: [29] }), "eine Runde, ein Ergebnis");
assert(gespeichert.length === 1 && gleich(gespeichert[0].data, { runs: 1, scores: [29] }), "die Runde ging nicht in die Cloud");
echo();
echo();
assert(gleich(store.read(), { runs: 1, scores: [29] }), `nach dem Echo aus der Cloud steht die 29 mehrfach da: ${JSON.stringify(store.read())}`);
assert(gespeichert.length === 1, "ein unverändertes Echo darf nicht noch einmal gespeichert werden");

spiele(28);
echo();
assert(gleich(store.read(), { runs: 2, scores: [29, 28] }), `zwei Runden, zwei Ergebnisse – gefunden ${JSON.stringify(store.read())}`);
assert(gleich(JSON.parse(geraet.get(KEY)), { runs: 2, scores: [29, 28] }), "auf dem Gerät steht etwas anderes als im Konto");

// Dieselbe Punktzahl noch einmal ehrlich erspielt: sie bleibt zweimal.
spiele(29);
echo();
assert(gleich(store.read(), { runs: 3, scores: [29, 29, 28] }), `eine zweite echte 29 fehlt: ${JSON.stringify(store.read())}`);

// Ein Gerät, das noch den alten, aufgeblähten Stand trägt, wird beim Abgleich
// repariert – und der reparierte Stand geht in die Cloud.
const vorher = gespeichert.length;
geraet.set("lernapp.alt", JSON.stringify({ runs: 2, scores: [29, 29, 29, 29, 28] }));
cloudDoc["lernapp.alt"] = { data: { runs: 2, scores: [29, 29, 29, 29, 28] }, updatedAt: 1 };
const alt = api.register({ key: "lernapp.alt", empty: { runs: 0, scores: [] }, merge: api.mergeScores(5) });
assert(gleich(alt.read(), { runs: 2, scores: [29, 28] }), `der alte Stand heilt beim Anmelden nicht: ${JSON.stringify(alt.read())}`);
assert(gespeichert.length === vorher + 1 && gleich(gespeichert[gespeichert.length - 1].data, { runs: 2, scores: [29, 28] }), "der reparierte Stand ging nicht in die Cloud");

// --- Level mit Sternen: je Level das Beste, Runden als Maximum ----------------
const levels = api.mergeLevels({ best: { 1: { stars: 2 } }, runs: 3, unlocked: 2 }, { best: { 1: { stars: 3 }, 2: { stars: 1 } }, runs: 5, unlocked: 1 });
assert(levels.best[1].stars === 3 && levels.best[2].stars === 1, "je Level muss das bessere Ergebnis bleiben");
assert(levels.runs === 5 && levels.unlocked === 2, "Runden und Freischaltung nehmen das Maximum");

console.log("Spielstände geprüft: Bestenlisten vereinigen sich ohne Doppelte, Echo aus der Cloud ändert nichts, alte Doppelte heilen.");
