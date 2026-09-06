/*
 * Prüft "Was fehlt?" aus wasfehlt.js, ohne Browser.
 *
 * Die Auswahl unten darf nie ein Stück zeigen, das noch auf dem Wagen liegt –
 * sonst liesse sich die Antwort durch Vergleichen finden statt durch
 * Erinnern –, und das fehlende Stück muss genau einmal darin liegen. Beides
 * hängt am Würfeln, deshalb wird hier ein paar hundert Mal gewürfelt.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// Die Datei steigt ohne die passende Seite sofort aus – also eine geben. Die
// Gegenstände kommen aus dem echten strand-art.js, damit die Zahl stimmt.
const stubNode = () => ({
  style: { setProperty() {} }, dataset: {}, innerHTML: "", textContent: "", disabled: false,
  classList: { add() {}, remove() {}, toggle() {} },
  setAttribute() {}, append() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
});
const windowStub = { setTimeout: () => 1, clearTimeout() {}, addEventListener() {} };
const context = vm.createContext({
  window: windowStub,
  document: {
    body: { dataset: { page: "missing" } },
    querySelector: (sel) => (sel === "#wf-stage" ? stubNode() : null),
    createElement: stubNode,
    createElementNS: stubNode,
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
windowStub.LernappTrainArt = { el: stubNode, group: stubNode, shade: (hex) => hex };
vm.runInContext(fs.readFileSync(path.join(root, "strand-art.js"), "utf8"), context, { filename: "strand-art.js" });
vm.runInContext(fs.readFileSync(path.join(root, "wasfehlt.js"), "utf8"), context, { filename: "wasfehlt.js" });

const api = windowStub.LernappWasFehlt;
const strand = windowStub.LernappStrandArt;
assert(api, "wasfehlt.js hat window.LernappWasFehlt nicht gesetzt");
assert(strand?.TREASURES?.length >= 20, "strand-art.js liefert zu wenige Gegenstände");
const alle = new Set(strand.TREASURES.map((item) => item.id));

// --- Die Stufen ---------------------------------------------------------------
assert(api.STUFEN.length >= 6, `mindestens sechs Stufen, gefunden ${api.STUFEN.length}`);
api.STUFEN.forEach((stufe, i) => {
  assert(stufe.stuecke >= 3 && stufe.auswahl >= 3, `Stufe ${i + 1}: unter drei Stücken oder drei zur Wahl ist es kein Spiel`);
  assert(stufe.stuecke + stufe.auswahl - 1 <= alle.size, `Stufe ${i + 1}: mehr Stücke nötig, als es gibt`);
  if (i) {
    assert(stufe.stuecke === api.STUFEN[i - 1].stuecke + 1, `Stufe ${i + 1}: je Wagen kommt genau ein Stück dazu`);
    assert(stufe.auswahl >= api.STUFEN[i - 1].auswahl, `Stufe ${i + 1}: die Auswahl darf nicht kleiner werden`);
  }
});
assert(api.STUFEN[0].stuecke === 3, "der erste Wagen trägt drei Stücke");
assert(api.stufeFuer(999) === api.STUFEN[api.STUFEN.length - 1], "über der letzten Stufe gilt die letzte weiter");

// Länger hinschauen bei mehr Fracht – nie kürzer als zweieinhalb Sekunden.
let vorher = 0;
api.STUFEN.forEach((stufe) => {
  const ms = api.zeigenMs(stufe.stuecke);
  assert(ms >= api.ZEIGEN_MIN_MS && ms >= vorher, `${stufe.stuecke} Stücke: ${ms} ms zum Merken sind zu wenig`);
  vorher = ms;
});
assert(api.zeigenMs(10) >= 6000, "zehn Stücke brauchen mindestens sechs Sekunden");

// --- Würfeln ------------------------------------------------------------------
for (let i = 0; i < 400; i += 1) {
  const stufe = api.STUFEN[i % api.STUFEN.length];
  const ladung = api.ladungFuer(stufe);
  assert(ladung.length === stufe.stuecke, `Ladung mit ${ladung.length} statt ${stufe.stuecke} Stücken`);
  assert(new Set(ladung).size === ladung.length, "ein Stück liegt zweimal auf dem Wagen");
  ladung.forEach((id) => assert(alle.has(id), `unbekanntes Stück ${id}`));

  const fehlt = ladung[i % ladung.length];
  const auswahl = api.auswahlFuer(ladung, fehlt, stufe.auswahl);
  assert(auswahl.length === stufe.auswahl, `Auswahl mit ${auswahl.length} statt ${stufe.auswahl} Stücken`);
  assert(new Set(auswahl).size === auswahl.length, "ein Stück liegt zweimal in der Auswahl");
  assert(auswahl.filter((id) => id === fehlt).length === 1, "das fehlende Stück liegt nicht genau einmal in der Auswahl");
  auswahl.forEach((id) => {
    if (id !== fehlt) assert(!ladung.includes(id), `${id} liegt noch auf dem Wagen und trotzdem in der Auswahl`);
  });
}

// Die Antwort steht nicht immer an derselben Stelle.
const stellen = new Set();
for (let i = 0; i < 200; i += 1) {
  const ladung = api.ladungFuer(api.STUFEN[0]);
  stellen.add(api.auswahlFuer(ladung, ladung[0], 3).indexOf(ladung[0]));
}
assert(stellen.size === 3, "das fehlende Stück liegt immer an derselben Stelle der Auswahl");

console.log(`Was fehlt? geprüft: ${api.STUFEN.length} Stufen von ${api.STUFEN[0].stuecke} bis ${api.STUFEN[api.STUFEN.length - 1].stuecke} Stücken, ${alle.size} Gegenstände.`);
