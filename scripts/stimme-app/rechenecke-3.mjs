/*
 * Die Rechenecke, Etappe 3: die Sätze mit wechselnden Zahlen aus
 * rechnen-spiele-3.js (siehe rechenecke.mjs). Viele Stücke («3 und 4 sind
 * 7.») kommen schon aus den Regeln der Etappen 1 und 2.
 */
const von = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
const zahlwort = (n, ein, mehr) => (n === 1 ? `1 ${ein}` : `${n} ${mehr}`);

export default function texte(d) {
  const aus = [];
  const e3 = "rechnen-spiele-3.js";
  let quelle = "";
  try { quelle = d.quelle(e3); } catch { return aus; }
  const muss = (stueck) => { if (!quelle.includes(stueck)) throw new Error(`stimme-app/rechenecke-3.mjs: ${e3} hat sich geändert – «${stueck}» fehlt`); };
  const add = (text) => aus.push({ text, wo: e3 });
  // Doppel-Express
  muss("und im Spiegel noch einmal ${a}.");
  for (const a of von(1, 10)) {
    add(`${zahlwort(a, "Wagen", "Wagen")} und im Spiegel noch einmal ${a}. Wie viele sind es zusammen?`);
    add(`Links ${zahlwort(a, "Wagen", "Wagen")}, rechts einer mehr. Wie viele sind es zusammen?`);
    add(`Genau! ${a} und ${a} sind ${2 * a}.`);
    add(`Schau: ${a} und ${a} sind ${2 * a}.`);
    add(`Genau! ${a} und ${a} sind ${2 * a}, und eins mehr: ${2 * a + 1}.`);
    add(`Schau: ${a} und ${a} sind ${2 * a}, und eins mehr: ${2 * a + 1}.`);
  }
  // Zehnerwagen füllen, Schüttelbecher
  for (const n of von(1, 9)) add(`Im Wagen ${n === 1 ? "sitzt 1 Tier" : `sitzen ${n} Tiere`}. Wie viele passen noch hinein?`);
  for (const n of von(3, 10)) for (const k of von(0, n)) add(`${n} Kugeln. Links ${zahlwort(k, "Kugel", "Kugeln")}. Wie viele sind unter dem Becher?`);
  // Waage
  muss("Wie viele müssen rechts noch dazu?");
  for (const a of von(2, 15)) {
    for (const b of von(0, a - 1)) add(`Links ${zahlwort(a, "Kugel", "Kugeln")}, rechts ${zahlwort(b, "Kugel", "Kugeln")}. Wie viele müssen rechts noch dazu?`);
    add(`Genau! Jetzt ist es gleich viel: ${a} und ${a}.`);
  }
  for (const n of von(1, 15)) add(`Schau: Es fehlten ${n}. Jetzt ist es gleich viel.`);
  // Zehner-Sprung
  muss("Zuerst machen wir den Zehnerwagen voll:");
  for (const a of von(6, 9)) {
    for (const b of von(11 - a, 9)) {
      const voll = 10 - a;
      add(`${a} plus ${b}. Zuerst machen wir den Zehnerwagen voll: Wie viele passen noch hinein?`);
      add(`${voll}. Dann bleiben von ${b} noch ${b - voll}. Wie viel ist ${a} plus ${b}?`);
      add(`Genau! 10 und ${b - voll} sind ${a + b}.`);
      add(`Schau: 10 und ${b - voll} sind ${a + b}.`);
    }
  }
  // Rechenkette
  muss("`Start bei ${start}! ${kette.map");
  for (const n of von(0, 20)) { add(`Start bei ${n}!`); add(`Genau! Der Zug kommt bei ${n} an.`); add(`Schau: Er kommt bei ${n} an.`); }
  for (const z of von(1, 4)) { add(`Plus ${z}!`); add(`Minus ${z}!`); }
  add("Wo kommt der Zug an?");
  // Drachenfutter
  muss("`Dein Drache möchte ${n} Beeren. ${k} hat er schon.");
  for (const n of von(3, 15)) {
    for (const k of von(1, n - 1)) {
      add(`Dein Drache möchte ${n} Beeren. ${k} hat er schon. Gib ihm, was fehlt!`);
      add(`Mmh, genau ${n}! ${k} und ${n - k} sind ${n}.`);
      add(`Es fehlten ${n - k}: ${k} und ${n - k} sind ${n}.`);
    }
  }
  // Rückwärts-Hüpfer, Wo hält der Zug?
  for (const a of von(1, 20)) {
    for (const b of von(1, 5)) if (b <= a) add(`Die Lok steht bei ${a} und hüpft ${b} zurück. Wo landet sie?`);
  }
  for (const n of von(1, 99)) { add(`Wo liegt die ${n}? Tippe aufs Gleis!`); add(`Die ${n} liegt hier – schau, wo das grüne Schild steht.`); }
  // Schlange
  for (const n of von(3, 12)) { add(`Genau, ${n} Wagen lang!`); add(`Schau: ${n} Wagen lang.`); }
  // Strichliste: das Ergebnis
  for (const r of von(1, 8)) for (const b of von(1, 8)) for (const g of von(1, 8)) {
    const z = [r, b, g];
    const top = Math.max(...z);
    if (z.filter((x) => x === top).length > 1) continue;
    const name = ["rote", "blaue", "gelbe"][z.indexOf(top)];
    add(`${r} rote, ${b} blaue, ${g} gelbe. Am meisten: ${name}.`);
  }
  // Formen
  for (const f of ["Kreis", "Dreieck", "Quadrat", "Rechteck", "Würfel", "Zylinder"]) { add(`Genau: ${f}!`); }
  add("Genau: Kugel!");
  add("Wohin gehört der Kreis?"); add("Wohin gehört das Dreieck?"); add("Wohin gehört das Quadrat?"); add("Wohin gehört das Rechteck?");
  add("Wohin gehört die Kugel?"); add("Wohin gehört der Würfel?"); add("Wohin gehört der Zylinder?");
  add("Schau: Das ist ein Kreis."); add("Schau: Das ist ein Dreieck."); add("Schau: Das ist ein Quadrat."); add("Schau: Das ist ein Rechteck.");
  add("Schau: Das ist eine Kugel."); add("Schau: Das ist ein Würfel."); add("Schau: Das ist ein Zylinder.");
  // Tangram-Lok
  for (const s of ["Bau eine Lok!", "Bau ein Haus!", "Bau einen Fisch!", "Bau eine Rakete!", "Fertig! Eine Lok!", "Fertig! Ein Haus!", "Fertig! Ein Fisch!", "Fertig! Eine Rakete!"]) add(s);
  // Der Sternenhimmel im Zimmer
  add("Ein Stern leuchtet.");
  for (const n of von(2, 29)) add(`${n} Sterne leuchten.`);
  return aus;
}
