/*
 * Die Spiele mit Bühne (game-shell.js) und Tier-Sprung: die Sätze mit
 * Wechselndem – Ergebnis, Auftrag der Reise, Hilfe je Level, die gesuchte
 * Zahl in «Wo hält der Zug?» –, genau so, wie der Code sie zusammensetzt.
 * Jede Vorlage wird im Quelltext nachgeschlagen: Ändert sie sich dort, bricht
 * diese Datei ab, statt veraltete Sätze zu liefern.
 *
 * kids.js teilt nach einer Ziffer mit Punkt nicht («… bis 20. Schieb …» ist
 * ein Satz), wohl aber nach «:». Beides ist hier berücksichtigt. Offene
 * Zählungen gehen so weit, wie ein Kind realistisch kommt (BIS); der Rest
 * steht in NICHT.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { saetzeVon } from "../stimme-bau-texte.mjs";
import { WURZEL, sprechText } from "../stimme-texte.mjs";

// Wie weit offene Zählungen gehen.
const BIS = {
  blaetter: 40, blaetterDaneben: 25, // gut: 16 Blätter in 45 Sekunden
  doppelt: 40, doppeltDaneben: 25, // gut: 20 Paare
  schwarm: 60, schwarmDaneben: 25, // gut: 30 Fische
  kartenPunkte: 80, // gut: 40 Punkte
  signalPunkte: 45, signalRot: 15, // gut: 22 Punkte
  turm: 45, // gut: 14 Blöcke; ab 40 ist es Nacht
  wagen: 20, // gut: 8 Wagen; höchstens 10 Stücke je Wagen
  rucksack: 20, // gut: 12 Punkte
  fischTeiche: 7, // leer gefischte Teiche (4 + 5 + … + 10 = 49 Fische; gut: 14)
  kachelRunden: 7, // ganze Muster (3 + 4 + … + 9 = 42 Kacheln; gut: 14)
  faesserMal: 2, faesserPlus: 6, // Züge bis max(2 × Bestmarke, Bestmarke + 6)
};

const von = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

// ---------------------------------------------------------------------------
// Quelltext lesen
// ---------------------------------------------------------------------------
// Die Stelle einer Vorlage, als «datei.js:zeile». Fehlt sie, hat sich der
// Code geändert, und die Sätze hier stimmen nicht mehr.
function stelle(d, datei, stueck) {
  const q = d.quelle(datei);
  const i = q.indexOf(stueck);
  if (i < 0) throw new Error(`stimme-app/spiele.mjs: ${datei} hat sich geändert – «${stueck}» fehlt`);
  return `${datei}:${q.slice(0, i).split("\n").length}`;
}

// Liest Code ab Stelle i, bis ende(c, tiefe) zutrifft – Zeichenketten und
// Kommentare werden übersprungen. Gibt die Stelle des letzten Zeichens.
function lauf(q, i, ende) {
  let tiefe = 0;
  while (i < q.length) {
    const c = q[i];
    if (c === "/" && q[i + 1] === "/") { i = q.indexOf("\n", i); continue; }
    if (c === "/" && q[i + 1] === "*") { i = q.indexOf("*/", i) + 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < q.length && q[j] !== c) j += q[j] === "\\" ? 2 : 1;
      i = j + 1;
      continue;
    }
    if (c === "{" || c === "[" || c === "(") tiefe += 1;
    if (c === "}" || c === "]" || c === ")") tiefe -= 1;
    if (ende(c, tiefe)) return i;
    i += 1;
  }
  return -1;
}
// const NAME = …; als ganze Anweisung.
function konstanteQuelle(d, datei, name) {
  const q = d.quelle(datei);
  const start = q.indexOf(`const ${name} = `);
  const schluss = start < 0 ? -1 : lauf(q, start, (c, tiefe) => c === ";" && tiefe === 0);
  if (schluss < 0) throw new Error(`stimme-app/spiele.mjs: ${datei} – const ${name} fehlt`);
  return q.slice(start, schluss + 1);
}
// Der Wert einer Konstante aus Daten (Zahlen, Zeichenketten, Listen).
function konstante(d, datei, name) {
  return vm.runInNewContext(`${konstanteQuelle(d, datei, name)}\n${name};`);
}
// function name(…) { … } als Ganzes.
function funktionQuelle(d, datei, name) {
  const q = d.quelle(datei);
  const start = q.indexOf(`function ${name}(`);
  const klammer = start < 0 ? -1 : lauf(q, q.indexOf("(", start), (c, tiefe) => c === ")" && tiefe === 0);
  const rumpf = klammer < 0 ? -1 : q.indexOf("{", klammer);
  const schluss = rumpf < 0 ? -1 : lauf(q, rumpf, (c, tiefe) => c === "}" && tiefe === 0);
  if (schluss < 0) throw new Error(`stimme-app/spiele.mjs: ${datei} – function ${name} fehlt`);
  return q.slice(start, schluss + 1);
}

// Wie viele Runden oder Level bis zum fertigen Wagen: eine feste Zahl, oder
// das Wagen-Set (kids.js wagonRounds: fünf im ersten, neun im zweiten).
function wagenRunden(d, datei, name) {
  const q = d.quelle(datei);
  const fest = new RegExp(`const ${name} = (\\d+);`).exec(q);
  if (fest) return [Number(fest[1])];
  const set = new RegExp(`const ${name} = window\\.LernappKids\\?\\.wagonRounds\\?\\.\\(\\) \\|\\| (\\d+);`).exec(q);
  if (!set) throw new Error(`stimme-app/spiele.mjs: ${datei} – ${name} unbekannt`);
  const sets = (d.train?.SETS || []).map((s) => s.stepAt?.[s.stepAt.length - 1]).filter(Number.isFinite);
  return [...new Set([Number(set[1]), ...sets])];
}
// «Noch 3 Runden bis zum fertigen Wagen.» – runsText, levelsText, rundenText.
// Nach der ersten Runde fehlen höchstens max − 1.
function nochSaetze(d, datei, name, wort) {
  const wo = stelle(d, datei, `} ${wort} bis zum fertigen Wagen.\``);
  const max = Math.max(...wagenRunden(d, datei, name));
  return von(2, max - 1).map((n) => ({ text: `Noch ${n} ${wort} bis zum fertigen Wagen.`, wo }));
}

const sterneText = (n) => (n === 1 ? "einen Stern" : `${n} Sterne`);

// ---------------------------------------------------------------------------
// Die einzelnen Spiele
// ---------------------------------------------------------------------------
function blaetter(d) {
  const f = "blaetter.js";
  const wo = stelle(d, f, "`Du hast ${blaetter} richtig erwischt. ${daneben} ${runsText(runs)}`");
  const woFalsch = stelle(d, f, "`${state.falsch} waren daneben.`");
  return [
    ...[0, 1, ...von(2, BIS.blaetter)].map((n) => ({ text: `Du hast ${n === 1 ? "ein Blatt" : `${n} Blätter`} richtig erwischt.`, wo })),
    ...von(2, BIS.blaetterDaneben).map((n) => ({ text: `${n} waren daneben.`, wo: woFalsch })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

function doppelt(d) {
  const f = "doppelt.js";
  const wo = stelle(d, f, "`Du hast ${paare} gefunden. ${daneben} ${runsText(runs)}`");
  const woFalsch = stelle(d, f, "`${state.daneben} Tipps waren daneben.`");
  return [
    ...[0, 1, ...von(2, BIS.doppelt)].map((n) => ({ text: `Du hast ${n === 1 ? "ein Paar" : `${n} Paare`} gefunden.`, wo })),
    ...von(2, BIS.doppeltDaneben).map((n) => ({ text: `${n} Tipps waren daneben.`, wo: woFalsch })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

function faesser(d) {
  const f = "faesser.js";
  const wo = stelle(d, f, "`Level ${state.level.nr} geschafft, in ${zuege}. ${marke} Du hast ${sterne}. ${levelsText(offen)}`");
  const woMarke = stelle(d, f, "`Es geht in ${state.level.optimum} Zügen.`");
  const levels = konstante(d, f, "LEVELS");
  const liste = [];
  for (const { nr, optimum } of levels) {
    const bis = Math.max(BIS.faesserMal * optimum, optimum + BIS.faesserPlus);
    for (const z of von(optimum, bis)) liste.push({ text: `Level ${nr} geschafft, in ${z === 1 ? "einem Zug" : `${z} Zügen`}.`, wo });
    liste.push({ text: `Es geht in ${optimum} Zügen.`, wo: woMarke });
  }
  for (const s of [1, 2, 3]) liste.push({ text: `Du hast ${sterneText(s)}.`, wo });
  return [...liste, ...nochSaetze(d, f, "LEVELS_FOR_DONE", "Level")];
}

function fischteich(d) {
  const f = "fischteich.js";
  const wo = stelle(d, f, "`Du hast ${fische} gefangen und ${geschafft} leer gefischt. ${runsText(runs)}`");
  const teiche = konstante(d, f, "TEICHE").map((t) => t.fische);
  const fischeIn = (nr) => teiche[Math.min(nr, teiche.length - 1)];
  const liste = [];
  let vorher = 0;
  // Fertig ist die Runde mit dem zweiten Tipp auf einen Fisch: im Teich
  // nach «teich» leer gefischten, nach 0 bis alle − 1 gefangenen – auch mit
  // 0, wenn das letzte Häkchen noch dasteht und der Teich schon zählt.
  for (let teich = 0; teich <= BIS.fischTeiche; teich += 1) {
    for (let k = 0; k < fischeIn(teich); k += 1) {
      const punkte = vorher + k;
      if (!punkte) continue;
      const fische = punkte === 1 ? "einen Fisch" : `${punkte} Fische`;
      const geschafft = teich === 1 ? "einen Teich" : `${teich} Teiche`;
      liste.push({ text: `Du hast ${fische} gefangen und ${geschafft} leer gefischt.`, wo });
    }
    vorher += fischeIn(teich);
  }
  return [...liste, ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden")];
}

function freiefahrt(d) {
  const f = "freiefahrt.js";
  const wo = stelle(d, f, "`Die Lok ist draussen. Du hast ${sterne}. ${zuege} ${levelsText(fertig)}`");
  const woZuege = stelle(d, f, "`Du hast ${run.zuege} Züge gebraucht. Am kürzesten geht es in ${state.level.zuege} Zügen.`");
  // Wie viele Züge ein Kind braucht: bis zum Doppelten der Bestmarke, und
  // mindestens sechs mehr.
  const besten = [...d.quelle(f).matchAll(/\bzuege: (\d+)/g)].map((m) => Number(m[1]));
  if (!besten.length) throw new Error("stimme-app/spiele.mjs: freiefahrt.js – keine Level mit zuege gefunden");
  const bis = Math.max(...besten.map((z) => Math.max(z * BIS.faesserMal, z + BIS.faesserPlus)));
  return [
    ...[1, 2, 3].map((s) => ({ text: `Du hast ${sterneText(s)}.`, wo })),
    ...von(Math.min(...besten), bis).map((z) => ({ text: `Du hast ${z} Züge gebraucht.`, wo: woZuege })),
    ...[...new Set(besten)].map((z) => ({ text: `Am kürzesten geht es in ${z} Zügen.`, wo: woZuege })),
    ...nochSaetze(d, f, "LEVELS_FOR_DONE", "Level"),
  ];
}

function kacheln(d) {
  const f = "kacheln.js";
  const wo = stelle(d, f, "`Du hast ${kacheln} richtig getippt und ${geschafft} geschafft. ${runsText(runs)}`");
  const stufen = konstante(d, f, "STUFEN").map((s) => s.kacheln);
  const kachelnIn = (runde) => stufen[Math.min(runde, stufen.length - 1)];
  const liste = [];
  let vorher = 0;
  // Vorbei ist es mit dem ersten falschen Tipp: nach «runden» ganzen Mustern
  // und 0 bis alle − 1 Kacheln des nächsten.
  for (let runden = 0; runden <= BIS.kachelRunden; runden += 1) {
    for (let k = 0; k < kachelnIn(runden); k += 1) {
      const punkte = vorher + k;
      const kacheln = punkte === 1 ? "eine Kachel" : `${punkte} Kacheln`;
      const geschafft = runden === 0 ? "noch kein Muster" : runden === 1 ? "ein Muster" : `${runden} Muster`;
      liste.push({ text: `Du hast ${kacheln} richtig getippt und ${geschafft} geschafft.`, wo });
    }
    vorher += kachelnIn(runden);
  }
  return [...liste, ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden")];
}

function kartenmerker(d) {
  const f = "kartenmerker.js";
  const wo = stelle(d, f, "`Du hast ${punkte}. ${richtig} ${falsch} ${runsText(runs)}`");
  return [
    ...[0, 1, ...von(2, BIS.kartenPunkte)].map((n) => ({ text: `Du hast ${n === 1 ? "einen Punkt" : `${n} Punkte`}.`, wo })),
    ...[0, 1, ...von(2, BIS.kartenPunkte)].map((n) => ({ text: n === 0 ? "Keine Karte war richtig." : n === 1 ? "Eine Karte war richtig." : `${n} Karten waren richtig.`, wo })),
    ...[0, 1, ...von(2, BIS.doppeltDaneben)].map((n) => ({ text: n === 0 ? "Keine war falsch." : n === 1 ? "Eine war falsch." : `${n} waren falsch.`, wo })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

function memory(d) {
  const f = "memory.js";
  const wo = stelle(d, f, "`Geschafft! Du hast alle ${state.groesse / 2} Paare gefunden. ${rundenText(fertig)}`");
  return [
    ...konstante(d, f, "GROESSEN").map((g) => ({ text: `Du hast alle ${g / 2} Paare gefunden.`, wo })),
    ...nochSaetze(d, f, "RUNDEN_FUER_WAGEN", "Runden"),
  ];
}

function rucksack(d) {
  const f = "rucksack.js";
  const wo = stelle(d, f, "`Du hast ${sachen} gemerkt. Das gibt ${zahl}. ${runsText(runs)}`");
  // Nur die Stufen, die eine Schwierigkeitsstufe auch wählt.
  const anzahl = Object.values(konstante(d, f, "ANZAHL_JE_STUFE"));
  const stufen = konstante(d, f, "STUFEN").filter((s) => anzahl.includes(s.anzahl));
  const punkte = new Set();
  const liste = [];
  for (const n of von(0, BIS.rucksack)) {
    liste.push({ text: `Du hast ${n === 1 ? "einen Gegenstand" : `${n} Gegenstände`} gemerkt.`, wo });
    stufen.forEach((s) => punkte.add(Math.ceil(n * s.faktor)));
  }
  for (const p of [...punkte].sort((a, b) => a - b)) liste.push({ text: `Das gibt ${p === 1 ? "einen Punkt" : `${p} Punkte`}.`, wo });
  return [...liste, ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden")];
}

function schwarmfokus(d) {
  const f = "schwarmfokus.js";
  const wo = stelle(d, f, "`Du hast ${fische} richtig erkannt. ${daneben} ${runsText(runs)}`");
  const woFalsch = stelle(d, f, "`${state.wrong} waren daneben.`");
  return [
    ...[0, 1, ...von(2, BIS.schwarm)].map((n) => ({ text: `Du hast ${n === 1 ? "einen Fisch" : `${n} Fische`} richtig erkannt.`, wo })),
    ...von(2, BIS.schwarmDaneben).map((n) => ({ text: `${n} waren daneben.`, wo: woFalsch })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

function signal(d) {
  const f = "signal.js";
  const wo = stelle(d, f, "`Du hast ${punkte} ${punkte === 1 ? \"Punkt\" : \"Punkte\"}. ${durch} hast du durchgelassen. ${gewartet} hast du gewartet. ${rot} ${runsText(runs)}`");
  const woRot = stelle(d, f, "`${state.beiRot}-mal hast du bei Rot getippt.`");
  return [
    // Je Satz eine Zahl: Punkte, grüne Züge, rote.
    ...von(0, BIS.signalPunkte).map((n) => ({ text: `Du hast ${n} ${n === 1 ? "Punkt" : "Punkte"}.`, wo })),
    ...von(0, BIS.signalPunkte).map((n) => ({ text: `${n === 1 ? "Einen grünen Zug" : `${n} grüne Züge`} hast du durchgelassen.`, wo })),
    ...von(0, BIS.signalPunkte).map((n) => ({ text: `${n === 1 ? "Bei einem roten" : `Bei ${n} roten`} hast du gewartet.`, wo })),
    ...von(2, BIS.signalRot).map((n) => ({ text: `${n}-mal hast du bei Rot getippt.`, wo: woRot })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

// Die Schätze am Strand (strand-art.js): ihre Zahl und ihre Namen.
function schaetze(d) {
  return [...konstanteQuelle(d, "strand-art.js", "TREASURES").matchAll(/id: "[^"]+", name: "([^"]+)"/g)].map((m) => m[1]);
}

function strandschatz(d) {
  const f = "strandschatz.js";
  const wo = stelle(d, f, "`Du hast ${schaetze} gefunden. ${runsText(runs)}`");
  // Der erste Tipp trifft immer einen neuen: mindestens einer.
  return [
    ...[1, ...von(2, schaetze(d).length)].map((n) => ({ text: `Du hast ${n === 1 ? "einen Schatz" : `${n} Schätze`} gefunden.`, wo })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

function turmbau(d) {
  const f = "turmbau.js";
  const wo = stelle(d, f, "`Dein Turm hat ${punkte} Blöcke.`");
  const woBest = stelle(d, f, "`Dein bester Turm hat ${best} Blöcke.`");
  return [
    ...von(2, BIS.turm).map((n) => ({ text: `Dein Turm hat ${n} Blöcke.`, wo })),
    ...von(2, BIS.turm).map((n) => ({ text: `Dein bester Turm hat ${n} Blöcke.`, wo: woBest })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

function wasfehlt(d) {
  const f = "wasfehlt.js";
  const wo = stelle(d, f, "`${punkte} Wagen richtig kontrolliert.`");
  const woZuletzt = stelle(d, f, "` Zuletzt fehlte: ${fehlte}.`");
  return [
    ...von(2, BIS.wagen).map((n) => ({ text: `${n} Wagen richtig kontrolliert.`, wo })),
    ...schaetze(d).map((name) => ({ text: `Zuletzt fehlte: ${name}.`, wo: woZuletzt })),
    ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden"),
  ];
}

function weichen(d) {
  const f = "weichen.js";
  const wo = stelle(d, f, "`Level ${state.level.nr} geschafft. Du hast ${sterne}. ${fehler} ${levelsText(offen)}`");
  const woFehler = stelle(d, f, "`${run.verfahren} Züge sind falsch gefahren.`");
  const levels = konstante(d, f, "LEVELS");
  // Höchstens so viele, wie ein Level Züge hat.
  const maxFehler = Math.max(...levels.map((l) => l.zuege));
  return [
    ...levels.map((l) => ({ text: `Level ${l.nr} geschafft.`, wo })),
    ...[1, 2, 3].map((s) => ({ text: `Du hast ${sterneText(s)}.`, wo })),
    ...von(2, maxFehler).map((n) => ({ text: `${n} Züge sind falsch gefahren.`, wo: woFehler })),
    ...nochSaetze(d, f, "LEVELS_FOR_DONE", "Level"),
  ];
}

function zahlengleis(d) {
  const f = "zahlengleis.js";
  const woZahl = stelle(d, f, "`Wo liegt die ${state.zahl}? Das Gleis geht von null bis ${bis}. Schieb die Lok dorthin und lass los.`");
  const wo = stelle(d, f, "`Stufe ${state.stufe.nr}, Zahlen bis ${state.stufe.bis}: Du hast ${punkte} von ${ZAHLEN_JE_RUNDE * PUNKTE_JE_ZAHL} Punkten. ${treffer} hast du genau getroffen. ${runsText(runs)}`");
  const stufen = konstante(d, f, "STUFEN");
  const zahlen = konstante(d, f, "PLAN").length;
  const jeZahl = konstante(d, f, "PUNKTE_JE_ZAHL");
  const liste = [];
  // Die gesuchte Zahl: nie ein Ende des Gleises (zahlFuer). Die Frage «Wo
  // liegt die 37?» ist ein Satz für sich; nach «bis 50.» teilt kids.js nicht.
  const gleise = [...new Set(stufen.flatMap((s) => s.gleise.map((g) => g.bis)))].sort((a, b) => a - b);
  for (const n of von(1, Math.max(...gleise) - 1)) liste.push({ text: `Wo liegt die ${n}?`, wo: woZahl });
  for (const bis of gleise) liste.push({ text: `Das Gleis geht von null bis ${bis}. Schieb die Lok dorthin und lass los.`, wo: woZahl });
  // Das Ergebnis: kids.js teilt nach dem Doppelpunkt – Stufe, Punkte und
  // Treffer sind je ein Stück.
  for (const s of stufen) liste.push({ text: `Stufe ${s.nr}, Zahlen bis ${s.bis}:`, wo });
  for (const p of von(0, zahlen * jeZahl)) liste.push({ text: `Du hast ${p} von ${zahlen * jeZahl} Punkten.`, wo });
  for (const g of von(0, zahlen)) liste.push({ text: `${g === 0 ? "Keine Zahl" : g === 1 ? "Eine Zahl" : `${g} Zahlen`} hast du genau getroffen.`, wo });
  return [...liste, ...nochSaetze(d, f, "RUNS_FOR_DONE", "Runden")];
}

// Tier-Sprung: die Level mit ihrer Zahl Leckerbissen. Die Welt jedes Levels
// ist fest (mulberry32 mit der Levelnummer) – sie wird hier nachgebaut, mit
// den Funktionen aus tiersprung.js selbst.
function tierLevels(d) {
  const f = "tiersprung.js";
  const konst = ["clamp", "mix", "SCENES", "OBSTACLES", "LEVELS", "GRAVITY", "JUMP_SPEED", "JUMP_CUT", "JUMP_APEX", "AIR_TIME", "RUN_IN", "RUN_OUT"];
  const code = [
    ...konst.map((name) => konstanteQuelle(d, f, name)),
    ...["mulberry32", "speedAt", "buildLevel"].map((name) => funktionQuelle(d, f, name)),
    "LEVELS.map((level) => ({ ...level, gesamt: buildLevel(level).treats.length }));",
  ].join("\n");
  const levels = vm.runInNewContext(code);
  const tiere = konstante(d, f, "ANIMALS");
  return levels.map((level) => ({ ...level, tier: tiere[level.animal].name }));
}

function tiersprung(d) {
  const f = "tiersprung.js";
  const levels = tierLevels(d);
  const woPause = stelle(d, f, "`Pause. Tippe auf Weiter spielen, um dranzubleiben, auf Nochmal für einen neuen Versuch oder auf ${hinaus}, um das Level zu verlassen.`");
  const woFehl = stelle(d, f, "`Diesmal hat es nicht gereicht. Du hast ${game.treats} ${game.level.treatName} gesammelt. Tippe auf Nochmal für einen neuen Versuch oder auf Zur Karte, um ein anderes Level zu wählen.${pushHint}`");
  const woZiel = stelle(d, f, "`Level ${level.id} geschafft! Du hast ${stars} von 3 Sternen. Du hast ${game.treats} ${level.treatName} gesammelt.");
  const MIT = konstante(d, f, "MIT");
  const woZiegel = stelle(d, f, "`Level ${level.id} geschafft! Du hast ${stars} von 3 Sternen. Der Zug bringt dir Ziegel für ein neues Stockwerk. Tippe auf Zur Bauecke.`");
  const woKarte = stelle(d, f, "`Tier-Sprung. Tippe auf Starten oder wähle ein Tier aus.${animal ? ` Gerade spielst du als ${animal.name}.` : \"\"}");
  const woLevel = stelle(d, f, "`Level ${level.id}, ${level.label}. Tippe auf den Bildschirm, damit dein Tier springt.");
  const kartenHilfe = (tier) => `Tier-Sprung. Tippe auf Starten oder wähle ein Tier aus.${tier ? ` Gerade spielst du als ${tier}.` : ""} Im Spiel tippst du auf den Bildschirm, damit dein Tier springt. Halte länger gedrückt, dann springt es höher. Du hast drei Leben pro Level. Ein Schloss heisst: dieses Tier kommt, wenn du das Level davor geschafft hast.`;
  const liste = [
    ...["Zur Karte", "Zur Bauecke"].map((hinaus) => ({ text: `Pause. Tippe auf Weiter spielen, um dranzubleiben, auf Nochmal für einen neuen Versuch oder auf ${hinaus}, um das Level zu verlassen.`, wo: woPause })),
    { text: kartenHilfe(null), wo: woKarte },
    ...levels.map((l) => ({ text: kartenHilfe(l.tier), wo: woKarte })),
    // Der Satz nach «gesammelt.» klebt im Code am ${pushHint}: ganz, einmal
    // mit und einmal ohne Schiebelok.
    { text: "Tippe auf Nochmal für einen neuen Versuch oder auf Zur Karte, um ein anderes Level zu wählen.", wo: woFehl },
    { text: "Tippe auf Nochmal für einen neuen Versuch oder auf Zur Karte, um ein anderes Level zu wählen. Auf der Karte kommt jetzt die Schiebelok und schiebt deinen Zug zur nächsten Station.", wo: woFehl },
    { text: "Mit Nochmal spielst du dieses Level erneut, mit Zur Karte kommst du zurück zur Übersicht.", wo: woZiel },
    ...[1, 2, 3].map((s) => ({ text: `Du hast ${s} von 3 Sternen.`, wo: woZiel })),
  ];
  levels.forEach((l, i) => {
    liste.push({ text: `Level ${l.id}, ${l.label}. Tippe auf den Bildschirm, damit dein Tier springt. Länger gedrückt halten springt höher. Sammle möglichst viele ${l.treatName} und weiche den Hindernissen aus. Du hast drei Leben.`, wo: woLevel });
    // Nicht geschafft: so viele Leckerbissen, wie bis dahin eingesammelt.
    for (const t of von(0, l.gesamt)) liste.push({ text: `Du hast ${t} ${l.treatName} gesammelt.`, wo: woFehl });
    liste.push({ text: `Level ${l.id} geschafft!`, wo: woZiel });
    const naechstes = levels[i + 1];
    if (naechstes) liste.push({ text: `Tippe auf Weiter, um mit ${MIT[naechstes.animal] || `dem ${naechstes.tier}`} weiterzuspielen.`, wo: woZiel });
    for (const s of [1, 2, 3]) liste.push({ text: `Level ${l.id} geschafft! Du hast ${s} von 3 Sternen. Der Zug bringt dir Ziegel für ein neues Stockwerk. Tippe auf Zur Bauecke.`, wo: woZiegel });
  });
  return liste;
}

// ---------------------------------------------------------------------------
// Die Reise: was die Bühne zum Auftrag sagt (game-shell.js)
// ---------------------------------------------------------------------------
// journey-plan.js noch einmal geladen, diesmal mit einem Speicher, der sich
// etwas merkt: Die Aufträge hängen an der Schwierigkeitsstufe des Kindes.
function reiseMitSpeicher(d) {
  const werte = new Map();
  const speicher = {
    getItem: (k) => (werte.has(k) ? werte.get(k) : null),
    setItem: (k, v) => { werte.set(k, String(v)); },
    removeItem: (k) => { werte.delete(k); },
  };
  const fenster = {
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    location: { search: "", pathname: "/", hash: "" }, localStorage: speicher, sessionStorage: speicher, navigator: {},
  };
  fenster.window = fenster;
  const ctx = vm.createContext({ window: fenster, document: { addEventListener() {} }, localStorage: speicher, navigator: {}, console, URLSearchParams });
  vm.runInContext(d.quelle("journey-plan.js"), ctx, { filename: "journey-plan.js" });
  return fenster.LernappReise;
}

// Die Spielseiten mit Bühne aus dieser Gruppe, und wo ihr Hilfetext steht.
const SEITEN = {
  "backpack.html": "rucksack.js", "memory.html": "memory.js", "strandschatz.html": "strandschatz.js",
  "kacheln.html": "kacheln.js", "wasfehlt.html": "wasfehlt.js", "schwarmfokus.html": "schwarmfokus.js",
  "weichen.html": "weichen.js", "fischteich.html": "fischteich.js", "freiefahrt.html": "freiefahrt.js",
  "signal.html": "signal.js", "tiersprung.html": "tiersprung.js", "kartenmerker.html": "kartenmerker.js",
  "blaetter.html": "blaetter.js", "turmbau.html": "turmbau.js", "doppelt.html": "doppelt.js",
  "faesser.html": "faesser.js", "zahlengleis.html": "zahlengleis.js",
};

function hilfeVon(d, datei) {
  const m = /const HELP = \[([\s\S]*?)\]\.join\(" "\);/.exec(d.quelle(datei));
  if (!m) return "";
  return sprechText([...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => JSON.parse(`"${x[1]}"`)).join(" "));
}

function reise(d) {
  const f = "game-shell.js";
  const woNicht = stelle(d, f, "`Der Auftrag war ${journey.speech.replace(/\\.$/, \"\")} – diesmal noch nicht. Die Runde zählt trotzdem für deinen Wagen. ${weiter}`");
  const woKnapp = stelle(d, f, "`Geschafft – aber für den Stempel brauchst du ${sterne}. Die Runde zählt trotzdem für deinen Wagen. ${weiter}`");
  const woWeiter = stelle(d, f, "`Probier es noch einmal, oder nimm auf der Karte das Ausweichgleis: ${reise().satz?.(alt.title) ?? `${alt.title}.`}`");
  const woHilfe = stelle(d, f, "`${reise().describe(journey)} ${help || \"\"}`");
  const R = reiseMitSpeicher(d);
  // Nur Seiten mit Bühne – und auch dort nicht Tier-Sprung (es wertet selbst
  // aus) und Memory (wer es zu Ende spielt, hat den Auftrag geschafft).
  const mitBuehne = (task) => task && SEITEN[task.page] && d.quelle(task.page).includes("game-shell.js");
  const wertetBuehne = (task) => mitBuehne(task) && task.page !== "tiersprung.html" && task.kind !== "size";
  const liste = [{ text: "Probier es noch einmal.", wo: woWeiter }];
  const gesehen = new Set();
  const dazu = (text, wo) => { if (!gesehen.has(text)) { gesehen.add(text); liste.push({ text, wo }); } };

  for (const stufe of R.STUFEN) {
    R.setStufe(stufe);
    for (let nr = 1; nr <= R.STATION_COUNT; nr += 1) {
      const station = R.stationAt(nr);
      if (!station) continue;
      const spiele = (station.choice || [station.spec]).map((spec) => spec.game);
      const auftraege = spiele.map((game) => R.taskFor(nr, { game })).filter((t) => t && !t.choice);
      const alt = R.altTaskFor(nr);
      if (alt) auftraege.push(alt);
      const bau = [...spiele.map((game) => R.bauTaskFor(nr, game, false)), R.bauTaskFor(nr, null, true)].filter(Boolean);

      for (const task of auftraege.filter(wertetBuehne)) {
        // Nicht geschafft: eine Runde mit Zielpunktzahl unter dem Ziel …
        if (task.kind === "score") dazu(`Der Auftrag war ${task.speech.replace(/\.$/, "")} – diesmal noch nicht.`, woNicht);
        // … oder ein Level mit zu wenigen Sternen (nur auf der Stufe
        // "schwer": ein Level endet immer mit mindestens einem Stern).
        else if (task.needStars > 1) dazu(`Geschafft – aber für den Stempel brauchst du ${task.needStars === 3 ? "drei Sterne" : "zwei Sterne"}.`, woKnapp);
        // Nach zwei Fehlversuchen: das Ausweichgleis. Der Doppelpunkt teilt
        // in kids.js; der ganze Satz findet sich trotzdem.
        if (alt) dazu(`Probier es noch einmal, oder nimm auf der Karte das Ausweichgleis: ${R.satz(alt.title)}`, woWeiter);
      }

      // Der Lautsprecher sagt zuerst den Auftrag, dann die Regeln. Endet der
      // Auftrag mit einer Zahl und Punkt («Schaff Level 5.»), teilt kids.js
      // dort nicht: dieser Satz und der erste der Regeln sind ein Stück.
      // Nur diese Nahtstelle gehört hierher – den Auftrag selbst zählt die
      // Regel für describe().
      for (const task of [...auftraege, ...bau].filter(mitBuehne)) {
        const hilfe = hilfeVon(d, SEITEN[task.page]);
        if (!hilfe) continue;
        const vorn = saetzeVon(sprechText(R.describe(task)));
        const hinten = saetzeVon(hilfe);
        for (const satz of saetzeVon(sprechText(`${R.describe(task)} ${hilfe}`))) {
          if (!vorn.includes(satz) && !hinten.includes(satz)) dazu(satz, woHilfe);
        }
      }
    }
  }
  return liste;
}

// ---------------------------------------------------------------------------
export default function texte(d) {
  return [
    blaetter, doppelt, faesser, fischteich, freiefahrt, kacheln, kartenmerker, memory, rucksack,
    schwarmfokus, signal, strandschatz, tiersprung, turmbau, wasfehlt, weichen, zahlengleis, reise,
  ].flatMap((regel) => regel(d));
}

// Was sich nicht vorher aufnehmen lässt – oder nur mit zu vielen Sätzen.
// Gezählt in den Bereichen, die ein Kind realistisch erreicht.
function zeileIn(datei, stueck) {
  try {
    const q = fs.readFileSync(path.join(WURZEL, datei), "utf8");
    const i = q.indexOf(stueck);
    return i < 0 ? datei : `${datei}:${q.slice(0, i).split("\n").length}`;
  } catch { return datei; }
}

// Alles hier lässt sich aufnehmen: Wo zwei Zahlen in einem Satz standen,
// sagen die Spiele seit Oktober 2026 je Zahl einen Satz.
export const NICHT = [];
