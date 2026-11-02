/*
 * Die Rechenecke, Etappe 2: die Sätze mit wechselnden Zahlen aus
 * rechnen-spiele-2.js, so wie der Code sie sagt (siehe rechenecke.mjs).
 * kids.js liest Satz für Satz; hier stehen deshalb oft nur die Stücke,
 * die wechseln («Der Zug hat 7 Wagen.»), nicht jede Verbindung.
 */
const von = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
function muss(d, datei, stueck) {
  if (!d.quelle(datei).includes(stueck)) throw new Error(`stimme-app/rechenecke-2.mjs: ${datei} hat sich geändert – «${stueck}» fehlt`);
  return datei;
}
const NAMEN = ["Fino", "Hoppel", "Mia", "Bruno", "Pippa", "Ella", "Pino", "Leo", "Fred", "Tim"];
const WAREN = ["eine Glace", "ein Rüebli", "einen Apfel", "eine Brezel", "einen Saft", "eine Banane"];
const DINGE = ["Kühe", "Schafe", "Bäume", "Häuser", "Vögel"];
const wagenWort = (n) => (n === 1 ? "1 Wagen" : `${n} Wagen`);

export default function texte(d) {
  const aus = [];
  const e2 = "rechnen-spiele-2.js";
  try { d.quelle(e2); } catch { return aus; }
  const add = (text) => aus.push({ text, wo: e2 });
  // Rechnungen, wie viele Spiele sie sagen: bis zwanzig.
  muss(d, e2, "`Genau! ${a} und ${b} sind ${a + b}.`");
  for (const a of von(0, 20)) for (const b of von(0, 20)) if (a + b <= 30) add(`Genau! ${a} und ${b} sind ${a + b}.`);
  for (const a of von(0, 20)) for (const b of von(0, a)) add(`Genau! ${a} minus ${b} sind ${a - b}.`);
  for (const n of von(0, 30)) { add(`${n}.`); add(`Schau: Es sind ${n}.`); }
  // Fahrplan-Lücke, Countdown, Ziffern-Gleis, Wagen ordnen
  muss(d, e2, "Es fehlte die ${richtig}.");
  for (const n of von(0, 20)) { add(`Es fehlte die ${n}.`); add(`Jetzt kommt die ${n}.`); add(`Zuerst kommt die ${n}.`); }
  for (const h of [5, ...von(10, 20)]) add(`Zähl rückwärts von ${h}!`);
  for (const z of von(0, 9)) add(`Das ist die ${z}!`);
  // Zahlen-Paare
  muss(d, e2, "`Ja! Beide zeigen ${x.dataset.n}.`");
  for (const n of von(1, 10)) add(`Ja! Beide zeigen ${n}.`);
  for (const x of von(1, 10)) for (const y of von(1, 10)) if (x !== y) add(`Nicht ganz: Das eine zeigt ${x}, das andere ${y}.`);
  for (const p of von(3, 5)) add(`Alle ${p} Paare gefunden!`);
  // Finger-Zahlen
  muss(d, e2, "`Zeig ${n} mit den Fingern!`");
  for (const n of von(1, 10)) { add(`Zeig ${n} mit den Fingern!`); add(`Genau, ${n}!`); add(`Schau: So sind es ${n}.`); }
  for (const m of von(1, 5)) add(`Eine ganze Hand und noch ${m}.`);
  // Alle einsteigen!
  for (const n of von(1, 10)) { add(`Genau! Die letzte Zahl sagt es: ${n}.`); add(`Schau: Du hast bis ${n} gezählt. Die letzte Zahl sagt, wie viele: ${n}.`); }
  // Wer hat mehr?
  for (const a of von(1, 20)) add(`Beide haben ${a}. Gleich viel!`);
  for (const x of von(1, 20)) for (const y of von(1, x - 1)) add(`${x} ist mehr als ${y}.`);
  // Zähl-Fenster
  for (const w of DINGE) {
    add(`Wie viele ${w} siehst du?`);
    for (const n of von(1, 15)) { add(`Genau, ${n} ${w}!`); add(`Schau: ${n} ${w}.`); }
  }
  // Muster
  for (const s of [2, 3]) { add(`Genau! Immer ${s} mehr.`); for (const n of von(5, 25)) add(`Schau: Immer ${s} mehr – also ${n}.`); }
  for (const f of ["rot", "blau", "gelb", "grün"]) add(`Schau: Es kommt ${f}.`);
  // Hüpf-Lok
  muss(d, e2, "Die Lok steht bei ${a}. Hüpf ${b} weiter:");
  for (const a of von(0, 20)) {
    add(`Die Lok steht bei ${a}.`);
    for (const b of von(1, 5)) add(`Die Lok steht bei ${a} und hüpft ${b} weiter. Wo landet sie?`);
  }
  for (const b of von(1, 5)) add(`Hüpf ${b} weiter: Tippe ${b === 1 ? "einmal" : `${b} Mal`} auf die Lok!`);
  // Tunnel-Versteck, Abkuppeln
  for (const n of von(1, 10)) {
    add(`Der Zug hat ${n} Wagen.`);
    add(`${n === 1 ? "1 Wagen siehst du" : `${n} Wagen siehst du`}.`);
    add(`Schau: Im Tunnel waren ${n}.`);
    add(`Der Zug hat ${wagenWort(n)}.`);
    add(`${n === 1 ? "1 Wagen rollt" : `${n} Wagen rollen`} weg.`);
    add(`${n === 1 ? "1 Wagen rollt" : `${n} Wagen rollen`} aufs Abstellgleis.`);
  }
  for (const a of von(0, 10)) for (const b of von(0, a)) add(`${a} minus ${b}. Wie viel ist das?`);
  // Aussteigen bitte!
  for (const b of von(1, 5)) { add(`${b === 1 ? "1 Tier steigt" : `${b} Tiere steigen`} aus.`); add(`${b === 1 ? "1 Tier steigt" : `${b} Tiere steigen`} ein.`); }
  for (const n of von(0, 10)) add(`Schau: Es fahren ${n} Tiere mit.`);
  // Ballon-Wagen
  for (const a of von(3, 10)) add(`${a} Ballone.`);
  for (const b of von(1, 9)) add(`Lass ${b} platzen!`);
  // Kiosk: ein Ding
  muss(d, e2, "möchte ${satzWare}. Bezahl genau!");
  for (const name of NAMEN) for (const w of WAREN) for (const p of von(1, 5)) add(`${name} möchte ${w} für ${p} Franken.`);
  for (const s of von(1, 10)) { add(`Genau ${s} Franken.`); add(`Es kostet ${s}.`); }
  for (const g of von(1, 20)) add(`${g} Franken.`);
  return aus;
}
