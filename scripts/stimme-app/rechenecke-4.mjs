/*
 * Die Rechenecke, Etappe 4: die Sätze mit wechselnden Zahlen aus
 * rechnen-spiele-4.js und dem Zimmer (Sammelalbum, Aufträge), so wie der
 * Code sie sagt (siehe rechenecke.mjs).
 */
const von = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

function uhrText(h, m) {
  const naechste = (h % 12) + 1;
  if (m === 0) return `${h} Uhr`;
  if (m === 30) return `halb ${naechste}`;
  if (m === 15) return `Viertel nach ${h}`;
  return `Viertel vor ${naechste}`;
}

export default function texte(d) {
  const aus = [];
  const e4 = "rechnen-spiele-4.js";
  let quelle = "";
  try { quelle = d.quelle(e4); } catch { return aus; }
  const muss = (stueck) => { if (!quelle.includes(stueck)) throw new Error(`stimme-app/rechenecke-4.mjs: ${e4} hat sich geändert – «${stueck}» fehlt`); };
  const add = (text, wo = e4) => aus.push({ text, wo });
  // Zahlenmauer, Türme, Hunderter
  for (const n of von(0, 30)) add(`Schau: Da gehört ${n} hin.`);
  muss("Jedes Mal ${t.schritt} mehr.");
  for (const s of von(1, 4)) { add(`Genau! Jedes Mal ${s} mehr.`); for (const n of von(2, 20)) add(`Schau: Jedes Mal ${s} mehr – also ${n}.`); }
  for (const a of von(1, 6)) for (const s of von(1, 4)) add(`${a}, ${a + s}, ${a + 2 * s} – wie viele Ziegel hat der nächste Turm?`);
  for (const n of von(1, 100)) {
    add(`Genau, das ist die ${n}!`);
    const z = Math.floor(n / 10);
    add(`Schau: ${n} – ${z === 1 ? "ein Zehner" : `${z} Zehner`} und ${n % 10} Einer.`);
  }
  // Uhr
  for (const h of von(1, 12)) for (const m of [0, 15, 30, 45]) { add(`Genau: ${uhrText(h, m)}!`); add(`Schau: Es ist ${uhrText(h, m)}.`); }
  // Rückgeld
  muss("Bezahlt wird mit ${gross} Franken.");
  for (const g of [5, 10, 20]) {
    for (const p of von(1, g - 1)) {
      add(`Es kostet ${p} Franken. Bezahlt wird mit ${g} Franken. Wie viel gibt es zurück?`);
      add(`Genau! ${p} und ${g - p} sind ${g}.`);
      add(`Schau: ${p} und ${g - p} sind ${g}. Zurück gibt es ${g - p} Franken.`);
    }
  }
  // Blitzrechnen
  for (const n of von(0, 40)) { add(`${n} richtig in 45 Sekunden!`); add(`${n} richtig in 45 Sekunden.`); }
  // Gerade, ungerade
  for (const n of von(2, 16)) {
    add(`${n} Fahrgäste. Sitzen alle zu zweit, oder sitzt einer allein?`);
    add(n % 2 ? `${n} ist ungerade: Einer sitzt allein.` : `${n} ist gerade: Alle sitzen zu zweit.`);
  }
  // Glücksrad
  for (const r of von(0, 10)) add(`${r} Mal rot, ${10 - r} Mal blau.`);
  add("Rot hat mehr Felder – darum kommt es meistens öfter.");
  add("Blau hat mehr Felder – darum kommt es meistens öfter.");
  // Postkarten: der Text zum Vorlesen
  const post = [...quelle.matchAll(/text: "([^"]+)", a: /g)].map((m) => m[1]);
  post.forEach((t) => add(t));
  // Zimmer: Album
  const zimmer = "train-rechenecke.js";
  const r = d.rechenecke || {};
  for (let n = 1; n <= (r.ALBUM || []).length; n += 1) add(r.albumSatz(n), zimmer);
  return aus;
}
