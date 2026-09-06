/*
 * Prüft "Doppelt gleich" aus doppelt.js, ohne Browser.
 *
 * Zwei Karten, genau ein gemeinsames Bild – das ist die ganze Regel, und sie
 * hängt am Würfeln. Zwei gemeinsame Bilder, und ein Kind tippt das "falsche"
 * richtige an; keines, und es sucht vergebens. Deshalb wird hier ein paar
 * hundert Mal gewürfelt und nachgezählt.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }

// Die Datei steigt ohne die passende Seite sofort aus – also eine geben. Die
// Bilder kommen aus dem echten strand-art.js, damit die Zahl stimmt.
const stubNode = () => ({
  style: { setProperty() {} }, dataset: {}, innerHTML: "", textContent: "",
  classList: { add() {}, remove() {}, toggle() {} },
  setAttribute() {}, append() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
});
const windowStub = { setTimeout: () => 1, clearTimeout() {}, addEventListener() {} };
const context = vm.createContext({
  window: windowStub,
  document: {
    body: { dataset: { page: "twins" } },
    querySelector: (sel) => (sel === "#dg-stage" ? stubNode() : null),
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
vm.runInContext(fs.readFileSync(path.join(root, "doppelt.js"), "utf8"), context, { filename: "doppelt.js" });

const api = windowStub.LernappDoppelt;
const strand = windowStub.LernappStrandArt;
assert(api, "doppelt.js hat window.LernappDoppelt nicht gesetzt");
const alle = new Set(strand.TREASURES.map((item) => item.id));

// --- Wie viele Bilder --------------------------------------------------------
assert(api.ROUND_MS === 45000, "eine Runde dauert fünfundvierzig Sekunden wie die anderen Tempospiele");
assert(api.bilderFuer(0) === api.BILDER_MIN && api.BILDER_MIN === 3, "die ersten Karten tragen drei Bilder");
assert(api.BILDER_MAX === 6 && api.bilderFuer(1000) === 6, "mehr als sechs Bilder passen nicht auf eine Karte");
for (let t = 1; t < 40; t += 1) {
  assert(api.bilderFuer(t) >= api.bilderFuer(t - 1) && api.bilderFuer(t) - api.bilderFuer(t - 1) <= 1, `bei ${t} Treffern springt die Bilderzahl`);
}
assert(api.bilderFuer(api.TREFFER_JE_STUFE) === 4, `nach ${api.TREFFER_JE_STUFE} Treffern kommt das vierte Bild`);
assert(2 * api.BILDER_MAX - 1 <= alle.size, "für zwei volle Karten gibt es nicht genug verschiedene Bilder");

// --- Die Karten ---------------------------------------------------------------
for (let i = 0; i < 400; i += 1) {
  const n = api.BILDER_MIN + (i % (api.BILDER_MAX - api.BILDER_MIN + 1));
  const { a, b, gemeinsam } = api.paarFuer(n);
  assert(a.length === n && b.length === n, `Karten mit ${a.length} und ${b.length} statt ${n} Bildern`);
  assert(new Set(a).size === n && new Set(b).size === n, "ein Bild liegt zweimal auf derselben Karte");
  const beide = a.filter((id) => b.includes(id));
  assert(beide.length === 1 && beide[0] === gemeinsam, `${beide.length} gemeinsame Bilder statt genau einem`);
  [...a, ...b].forEach((id) => assert(alle.has(id), `unbekanntes Bild ${id}`));
}

// Das gemeinsame Bild liegt nicht immer an derselben Stelle.
const stellen = new Set();
for (let i = 0; i < 200; i += 1) {
  const { a, gemeinsam } = api.paarFuer(3);
  stellen.add(a.indexOf(gemeinsam));
}
assert(stellen.size === 3, "das gemeinsame Bild liegt immer an derselben Stelle der Karte");

// --- Die Plätze ---------------------------------------------------------------
// Jedes Bild liegt ganz auf der Karte, gedreht und in eigener Grösse.
for (let n = api.BILDER_MIN; n <= api.BILDER_MAX; n += 1) {
  for (let i = 0; i < 50; i += 1) {
    const plaetze = api.plaetzeFuer(n);
    assert(plaetze.length === n, `${plaetze.length} Plätze für ${n} Bilder`);
    plaetze.forEach((p) => {
      // Die Karte ist rund: was zählt, ist der Abstand von der Mitte plus die
      // halbe Bildgrösse – zusammen weniger als der halbe Durchmesser.
      const aussen = Math.hypot(p.x - 0.5, p.y - 0.5) + p.groesse / 2;
      assert(aussen <= 0.49, `ein Bild ragt über die Karte hinaus (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.groesse.toFixed(2)})`);
      assert(Math.abs(p.drehung) <= 45, `Drehung ${p.drehung} – mehr als 45 Grad macht ein Bild unkenntlich`);
      assert(p.groesse >= 0.16 && p.groesse <= 0.42, `Bildgrösse ${p.groesse} passt nicht`);
    });
    // Und keine zwei Tippflächen berühren sich: die Knöpfe sind Quadrate,
    // die nicht mitgedreht werden – also müssen sie sich in einer Richtung
    // um mehr als die halbe Summe ihrer Seiten verfehlen.
    for (let k = 0; k < n; k += 1) {
      for (let m = k + 1; m < n; m += 1) {
        const dx = Math.abs(plaetze[k].x - plaetze[m].x);
        const dy = Math.abs(plaetze[k].y - plaetze[m].y);
        const mindest = (plaetze[k].groesse + plaetze[m].groesse) / 2;
        assert(Math.max(dx, dy) >= mindest, `zwei Tippflächen überschneiden sich (${dx.toFixed(2)}, ${dy.toFixed(2)} bei ${mindest.toFixed(2)})`);
      }
    }
  }
}

console.log(`Doppelt gleich geprüft: ${api.BILDER_MIN} bis ${api.BILDER_MAX} Bilder je Karte, ${alle.size} Bilder zur Wahl.`);
