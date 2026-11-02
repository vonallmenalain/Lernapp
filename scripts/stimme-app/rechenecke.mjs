/*
 * Die Rechenecke: die Sätze mit wechselnden Zahlen, genau so, wie der Code
 * sie zusammensetzt – für die Aufnahmen mit der Stimme von Google
 * (scripts/stimme-app-texte.mjs, docs/STIMME-GOOGLE.md).
 *
 * Jede Vorlage wird im Quelltext nachgeschlagen (muss): Ändert sie sich dort,
 * bricht diese Datei ab, statt Sätze zu liefern, die niemand mehr sagt. Die
 * Zahlen gehen so weit, wie die Spiele sie stellen (Zahlenraum bis 20, der
 * Schatz bis 300 Taler); was darüber hinausgeht, sagt die Gerätestimme.
 */
const von = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

function muss(d, datei, stueck) {
  if (!d.quelle(datei).includes(stueck)) throw new Error(`stimme-app/rechenecke.mjs: ${datei} hat sich geändert – «${stueck}» fehlt`);
  return datei;
}

const NAMEN = ["Fino", "Hoppel", "Mia", "Bruno", "Pippa", "Ella", "Pino", "Leo", "Fred", "Tim"];
const wagenWort = (n) => (n === 1 ? "1 Wagen" : `${n} Wagen`);
function fuenferSatz(n) {
  if (n <= 5) return "";
  if (n === 10) return " Fünf rote und fünf blaue.";
  if (n < 10) return ` Fünf rote und ${n - 5} ${n - 5 === 1 ? "blauer" : "blaue"}.`;
  return "";
}

export default function texte(d) {
  const aus = [];
  const add = (text, wo) => aus.push({ text, wo });

  // --- rechnen-spiel.js: das Ergebnis -----------------------------------------
  const spiel = muss(d, "rechnen-spiel.js", "`${punkte} von ${von} richtig.`");
  muss(d, "rechnen-spiel.js", "`${taler} Taler`} für deinen Drachen!");
  for (const v of von(1, 12)) for (const p of von(0, v)) add(`${p} von ${v} richtig.`, spiel);
  add("Ein Taler für deinen Drachen!", spiel);
  for (const t of von(2, 6)) add(`${t} Taler für deinen Drachen!`, spiel);

  // --- train-rechenecke.js: das Zimmer ----------------------------------------
  const zimmer = muss(d, "train-rechenecke.js", "Dein Drache hat eine Idee: ${m.name}!");
  const spiele = Object.values(d.rechnen?.SPIELE || {});
  for (const s of spiele) add(`Dein Drache hat eine Idee: ${s.titel}! Tippe auf ihn, und es geht los.`, zimmer);
  for (const n of von(1, 10)) {
    add(`Noch ${n} Taler bis zur nächsten Zacke.`, zimmer);
    add(`Noch ${n} Taler bis zur nächsten Überraschung.`, zimmer);
  }
  muss(d, "train-rechenecke.js", "`${mehr} neue Taler`} für deinen Drachen!");
  add("Ein neuer Taler für deinen Drachen!", zimmer);
  for (const n of von(2, 12)) add(`${n} neue Taler für deinen Drachen!`, zimmer);
  muss(d, "train-rechenecke.js", "Jetzt sind es ${d.stufe}.");
  for (const n of von(2, 15)) add(`Überraschung! Dein Drache hat eine neue Zacke. Jetzt sind es ${n}.`, zimmer);
  for (const n of von(10, 11)) add(`Überraschung! Dein Drache hat jetzt ${n} Zacken – und etwas Neues: schau genau hin!`, zimmer);
  for (const name of Object.values(d.rechnen?.DRACHE_NAMEN || {})) {
    add(`Überraschung! Dein Drache ist fertig gewachsen und sitzt jetzt auf dem Regal. Ein neuer Drache ist da: der ${name}!`, zimmer);
  }
  // Der Schatz, wie schatzSatz ihn sagt.
  muss(d, "train-rechenecke.js", "function schatzSatz(n)");
  const satzVomSchatz = d.rechenecke?.schatzSatz;
  if (satzVomSchatz) for (const n of von(0, 300)) add(satzVomSchatz(n), zimmer);
  // Die Auswahl hinter einem Ding mit mehreren Spielen (beim Schatz dazu
  // Sternenhimmel und Sammelalbum, ANSICHTEN).
  const orte = d.rechenecke?.ORTE || {};
  for (const [ort, titel] of Object.entries(orte)) {
    for (const ohneMinus of [false, true]) {
      const hier = [...spiele.filter((s) => s.ort === ort && !(ohneMinus && s.minus)), ...(d.rechenecke?.ANSICHTEN?.[ort] || [])];
      if (hier.length > 1) add(`${titel}. Tippe auf ein Spiel: ${hier.map((s) => s.titel).join(", ")}.`, zimmer);
    }
  }
  // Die Taufe
  if (d.quelle("train-rechenecke.js").includes("Dein Drache heisst jetzt ${sauber}!")) {
    for (const name of d.rechenecke?.NAMEN || []) { add(`Dein Drache heisst jetzt ${name}!`, zimmer); add(name, zimmer); }
  }

  // --- rechnen-spiele-1.js ------------------------------------------------------
  const e1 = "rechnen-spiele-1.js";
  muss(d, e1, "`${a} plus ${b}. Wie viel ist das?`");
  muss(d, e1, "`${wagenWort(a)} und ${wagenWort(b)}.");
  for (const a of von(1, 10)) {
    for (const b of von(1, 10)) {
      if (a + b > 10) continue;
      add(`${a} plus ${b}. Wie viel ist das?`, e1);
      add(`${wagenWort(a)} und ${wagenWort(b)}. Schieb sie zusammen!`, e1);
      add(`Ja! ${a} und ${b} sind ${a + b}.${fuenferSatz(a + b)}`, e1);
      add(`Schau: Es sind ${a + b} Wagen. ${a} und ${b} sind ${a + b}.${fuenferSatz(a + b)}`, e1);
      add(`Richtig! ${a} und ${b} sind ${a + b}.`, e1);
      add(`Genau! ${a} und ${b} sind ${a + b}.`, e1);
      add(`Schau: Es fahren ${a + b} Tiere mit. ${a} und ${b} sind ${a + b}.`, e1);
    }
  }
  // Tunnel: hinein, hinterher, wieder heraus, und Minus.
  muss(d, e1, "`Ein Zug mit ${wagenWort(a)} fährt in den Tunnel.`");
  for (const a of von(1, 10)) add(`Ein Zug mit ${wagenWort(a)} fährt in den Tunnel.`, e1);
  for (const b of von(1, 9)) {
    add(`${wagenWort(b)} ${b === 1 ? "rollt" : "rollen"} hinterher.`, e1);
    add(`${wagenWort(b)} ${b === 1 ? "rollt" : "rollen"} wieder heraus. Wie viele sind noch im Tunnel?`, e1);
  }
  for (const a of von(2, 10)) {
    for (const b of von(1, a - 1)) {
      add(`Richtig! ${a} minus ${b} sind ${a - b}.`, e1);
    }
  }
  // «Schau: Es sind 7 Wagen.» – danach die Rechnung als eigener Satz (die
  // Rechnungen bis 20 kommen aus rechenecke-2.mjs).
  muss(d, e1, "`Es sind ${richtig} Wagen`");
  add("Schau: Es ist 1 Wagen.", e1);
  for (const n of von(0, 40)) if (n !== 1) add(`Schau: Es sind ${n} Wagen.`, e1);
  // Kurze Stücke, die vor einem Satz ohne eigenen Anfang stehen
  // («Schau: 5 minus 2 sind 3.»), und die Null beim Zählen.
  add("Schau:", e1);
  add("0", e1);
  // Blitzblick
  muss(d, e1, "fünf oben und ${n - 5} unten.");
  for (const n of von(1, 4)) { add(`Genau! ${n}!`, e1); add(`Schau: ${n}!`, e1); add(`Genau! ${n} – alle oben.`, e1); add(`Schau: ${n} – alle oben.`, e1); }
  for (const n of von(6, 9)) { add(`Genau! ${n} – fünf oben und ${n - 5} unten.`, e1); add(`Schau: ${n} – fünf oben und ${n - 5} unten.`, e1); }
  for (const n of von(11, 19)) { add(`Genau! ${n} – ein voller Wagen und noch ${n - 10}.`, e1); add(`Schau: ${n} – ein voller Wagen und noch ${n - 10}.`, e1); }
  // Einsteigen bitte!
  muss(d, e1, "`sitzen ${a} Tiere`");
  add("Im Zug sitzt 1 Tier.", e1);
  for (const a of von(2, 10)) add(`Im Zug sitzen ${a} Tiere.`, e1);
  for (const x of NAMEN) {
    add(`${x} steigt ein.`, e1);
    for (const y of NAMEN) if (x !== y) add(`${x} und ${y} steigen ein.`, e1);
  }
  for (const b of von(3, 5)) add(`${b} Tiere steigen ein.`, e1);
  // Hüpf-Gleis
  muss(d, e1, "`Du hast ${wurfText}! Du stehst auf");
  add("Ein Auge! Tippe einmal auf deine Lok.", e1);
  for (const n of von(2, 6)) add(`${n} Augen! Tippe ${n} Mal auf deine Lok.`, e1);
  for (const n of von(1, 30)) add(`${n}`, e1);
  for (const w of von(1, 6)) add(`Du hast ${w}!`, e1);
  for (const w1 of von(1, 6)) for (const w2 of von(1, 6)) add(`Du hast ${w1} und ${w2}, zusammen ${w1 + w2}!`, e1);
  add("Du stehst auf Start. Wo landest du?", e1);
  for (const p of von(1, 30)) add(`Du stehst auf ${p}. Wo landest du?`, e1);
  for (const n of von(1, 12)) add(`Fino hüpft ${n} weiter.`, e1);
  for (const f of von(1, 12)) for (const r of von(0, f)) add(`Gewonnen! ${r} von ${f} Mal hast du richtig gesagt, wo du landest.`, e1);
  // Zahlenhaus
  muss(d, e1, "`Auf dem Dach steht ${zahl}.");
  for (const z of von(3, 10)) {
    add(`Auf dem Dach steht ${z}. In jedes Stockwerk ziehen zusammen ${z} Tiere.`, e1);
    add(`Das Haus ist voll! Alle Stockwerke sind zusammen ${z}.`, e1);
    for (const l of von(0, z)) {
      add(`Ja! ${l} und ${z - l} sind ${z}.`, e1);
      add(`Schau: ${z - l}. ${l} und ${z - l} sind ${z}.`, e1);
    }
  }
  add("Links wohnt 1 Tier. Wie viele ziehen rechts ein?", e1);
  for (const l of [0, ...von(2, 10)]) add(`Links wohnen ${l} Tiere. Wie viele ziehen rechts ein?`, e1);
  return aus;
}
