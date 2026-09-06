/*
 * Prüft Fässer stapeln aus faesser.js, ohne Browser.
 *
 * Die zehn Level stehen als Tabelle in der Datei, jedes mit seiner Bestmarke.
 * Die Bestmarke ist das, woran die Sterne hängen – steht dort eine Zahl, die
 * nicht stimmt, bekommt ein Kind für den kürzesten Weg nur zwei Sterne oder
 * für einen Umweg drei. Deshalb wird hier jede Stellung mit einer eigenen
 * Breitensuche nachgerechnet, unabhängig von der im Spiel.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "faesser.js"), "utf8");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// Die Datei steigt ohne die passende Seite sofort aus – also eine geben.
const stubNode = () => ({
  style: { setProperty() {} }, dataset: {}, innerHTML: "", classList: { add() {}, remove() {}, toggle() {} },
  setAttribute() {}, append() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
});
const windowStub = {};
const context = vm.createContext({
  window: windowStub,
  document: {
    body: { dataset: { page: "barrels" } },
    querySelector: (sel) => (sel === "#fs-stage" ? stubNode() : null),
    createElement: stubNode,
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  console,
});
windowStub.LernappGameShell = {
  mount: () => ({
    play: stubNode(), el: stubNode,
    setPhase() {}, setCount() {}, clear() {}, closeOverlay() {}, showResult() {}, startClock() {}, stopClock() {},
  }),
};
windowStub.LernappTrainArt = { el: stubNode };
windowStub.addEventListener = () => {};
vm.runInContext(source, context);

const api = windowStub.LernappFaesser;
assert(api, "faesser.js hat window.LernappFaesser nicht gesetzt");

// --- Eine eigene Breitensuche -------------------------------------------------
function key(st) { return st.map((gleis) => gleis.join(",")).join("|"); }
function kuerzester(level) {
  const goal = (st) => st[level.ziel].length === level.n;
  const seen = new Map([[key(level.start), 0]]);
  const queue = [level.start.map((g) => [...g])];
  while (queue.length) {
    const st = queue.shift();
    const d = seen.get(key(st));
    if (goal(st)) return d;
    for (let von = 0; von < 3; von += 1) {
      if (!st[von].length) continue;
      const fass = st[von][st[von].length - 1];
      for (let nach = 0; nach < 3; nach += 1) {
        if (nach === von) continue;
        const ziel = st[nach];
        if (ziel.length && ziel[ziel.length - 1] < fass) continue;
        const next = st.map((g) => [...g]);
        next[nach].push(next[von].pop());
        if (!seen.has(key(next))) { seen.set(key(next), d + 1); queue.push(next); }
      }
    }
  }
  return -1;
}

// --- Die Tabelle --------------------------------------------------------------
assert(api.LEVELS.length === 10, `erwartet 10 Level, gefunden ${api.LEVELS.length}`);
api.LEVELS.forEach((level, index) => {
  assert(level.nr === index + 1, `Level an Stelle ${index + 1} heisst ${level.nr}`);
  assert(level.n >= 3 && level.n <= 5, `Level ${level.nr}: ${level.n} Fässer – es gibt drei bis fünf`);
  assert(level.n <= api.FARBEN.length, `Level ${level.nr}: mehr Fässer als Farben`);
  assert(Array.isArray(level.start) && level.start.length === 3, `Level ${level.nr}: drei Gleise erwartet`);
  assert([0, 1, 2].includes(level.ziel), `Level ${level.nr}: Zielgleis ${level.ziel} gibt es nicht`);

  // Jede Grösse genau einmal, und auf jedem Gleis liegen sie von gross nach
  // klein – sonst beginnt das Level mit einer Stellung, die die Regel verbietet.
  const alle = level.start.flat().sort((a, b) => a - b);
  assert(alle.join(",") === Array.from({ length: level.n }, (_, k) => k + 1).join(","), `Level ${level.nr}: die Fässer sind nicht 1 bis ${level.n}`);
  level.start.forEach((gleis, i) => {
    for (let k = 1; k < gleis.length; k += 1) {
      assert(gleis[k] < gleis[k - 1], `Level ${level.nr}, Gleis ${i + 1}: ein grösseres Fass liegt auf einem kleineren`);
    }
  });
  assert(!api.geschafft(level.start, level), `Level ${level.nr} ist schon gelöst, bevor es losgeht`);

  // Die Bestmarke: Tabelle, Spiel und diese Prüfung müssen dieselbe Zahl nennen.
  const opt = kuerzester(level);
  assert(opt > 0, `Level ${level.nr} ist nicht lösbar`);
  assert(level.optimum === opt, `Level ${level.nr}: Bestmarke ${level.optimum} in der Tabelle, gerechnet ${opt}`);
  assert(api.optimum(level) === opt, `Level ${level.nr}: das Spiel rechnet ${api.optimum(level)} statt ${opt}`);
});

// Es wird nie leichter: die Bestmarke fällt von Level zu Level nicht.
api.LEVELS.forEach((level, index) => {
  if (index === 0) return;
  assert(level.optimum >= api.LEVELS[index - 1].optimum, `Level ${level.nr} ist kürzer als das davor`);
});
// Der klassische Turm aus drei braucht sieben Züge, der aus fünf einunddreissig.
assert(api.LEVELS.some((l) => l.n === 3 && l.optimum === 7), "der Turm aus drei Fässern (sieben Züge) fehlt");
assert(api.LEVELS[9].n === 5 && api.LEVELS[9].optimum === 31, "das letzte Level ist nicht der volle Turm aus fünf");

// --- Die Regel ----------------------------------------------------------------
assert(api.erlaubt([[3, 2], [1], []], 1, 0) === true, "das kleinste Fass darf auf jedes andere");
assert(api.erlaubt([[3], [2, 1], []], 1, 0) === true, "das kleine Fass darf auf das grosse");
assert(api.erlaubt([[3], [2, 1], []], 0, 1) === false, "das grosse Fass darf nicht auf das kleine");
assert(api.erlaubt([[3], [2, 1], []], 0, 2) === true, "auf ein leeres Gleis darf jedes Fass");
assert(api.erlaubt([[3], [], []], 1, 2) === false, "von einem leeren Gleis lässt sich nichts heben");
assert(api.erlaubt([[3], [], []], 0, 0) === false, "ein Fass zurückstellen ist kein Zug");

// --- Sterne -------------------------------------------------------------------
assert(api.starsFor(7, 7) === 3, "die Bestmarke gibt drei Sterne");
assert(api.starsFor(8, 7) === 2 && api.starsFor(11, 7) === 2, "bis anderthalb Bestmarke gibt es zwei Sterne");
assert(api.starsFor(12, 7) === 1 && api.starsFor(40, 7) === 1, "ein Umweg gibt einen Stern – geschafft ist geschafft");
assert(api.starsFor(3, 7) === 3, "schneller als die Bestmarke gibt es nicht, aber es dürfte nicht weniger Sterne geben");

console.log(`Fässer stapeln geprüft: ${api.LEVELS.length} Level, Bestmarken ${api.LEVELS.map((l) => l.optimum).join(", ")}.`);
