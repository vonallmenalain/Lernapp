/*
 * Reise, Lesewagen, Werkstatt und Rätselseiten: Sätze mit Wechselndem,
 * ausgerechnet über die echten Karten, Stationen, Spiele und Listen.
 * Dateien: train-journey.js, journey-plan.js (describe), train-leseecke.js,
 * lesen-wurm.js (sagt), train-home.js (Werkstatt), app.js und von
 * firebase.js nur die drei Hilfetexte des Kontofensters.
 *
 * Hinter einer Zahl mit Punkt teilt kids.js nicht («mit der 3. Du kannst
 * …») – solche Sätze tragen das Wechselnde des nächsten mit. Hinter einem
 * Doppelpunkt teilt es schon: Wo zwei Wechselnde in einem Satz stünden
 * («Karte 3, See: 4 von 10 Stationen gestempelt.»), steht jedes Stück
 * eigens hier, wie in stimme-bau-texte.mjs.
 * Ändert sich ein Satzmuster in diesen Dateien, gehört es hier mitgeändert
 * (zugText bildet speakState nach).
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { WURZEL } from "../stimme-texte.mjs";
import { saetzeVon } from "../stimme-bau-texte.mjs";

// Die Zeile, in der ein Stück Code steht – für «wo».
function zeileIn(datei, merkmal) {
  try {
    const quelle = fs.readFileSync(path.join(WURZEL, datei), "utf8");
    const stelle = quelle.indexOf(merkmal);
    return stelle < 0 ? datei : `${datei}:${quelle.slice(0, stelle).split("\n").length}`;
  } catch { return datei; }
}

// Wie kids.js (saetzeVon): auch hinter einem Doppelpunkt geteilt.
function stueckeVon(text) {
  const teile = [];
  const muster = /(?:[.!?…]+[»"]?|:)(?=\s)/g;
  let anfang = 0;
  let treffer;
  while ((treffer = muster.exec(text))) {
    if (treffer[0] === "." && /\d$/.test(text.slice(anfang, treffer.index))) continue;
    const ende = treffer.index + treffer[0].length;
    teile.push(text.slice(anfang, ende).trim());
    anfang = ende;
  }
  teile.push(text.slice(anfang).trim());
  return teile.filter(Boolean);
}

// Ein Stück Quelltext ab «kopf»: eine Zeile, die mit ; endet, oder alles bis
// zur schliessenden Klammer mit derselben Einrückung.
function stueck(quelle, kopf, datei) {
  const anfang = quelle.indexOf(kopf);
  if (anfang < 0) throw new Error(`${datei}: «${kopf}» nicht gefunden`);
  const zeilenAnfang = quelle.lastIndexOf("\n", anfang) + 1;
  const einzug = quelle.slice(zeilenAnfang, anfang);
  const zeilenEnde = quelle.indexOf("\n", anfang);
  const zeile = quelle.slice(anfang, zeilenEnde);
  if (/;\s*$/.test(zeile) || /^function .*\}\s*$/.test(zeile)) return zeile;
  const schluss = new RegExp(`\\n${einzug}[}\\]]\\)?;?(?=\\n)`, "g");
  schluss.lastIndex = anfang;
  const m = schluss.exec(quelle);
  if (!m) throw new Error(`${datei}: Ende von «${kopf}» nicht gefunden`);
  return quelle.slice(anfang, m.index + m[0].length);
}

// Mehrere Stücke einer Datei zusammen ausgeführt; zurück kommen die Namen.
function auswerten(d, datei, koepfe, namen) {
  const quelle = d.quelle(datei);
  const code = `${koepfe.map((kopf) => stueck(quelle, kopf, datei)).join("\n")}\n;({ ${namen.join(", ")} })`;
  return vm.runInContext(code, vm.createContext({ console }), { filename: datei });
}

// Ein eigener Fahrplan der Reise, dessen Stand sich stellen lässt: die
// Schwierigkeitsstufe und, für die Werkstatt, alles gestempelt.
function reiseLaden(d) {
  let zustand = null;
  const speicher = {
    getItem: (key) => (key === "lernapp.reise" && zustand ? JSON.stringify(zustand) : null),
    setItem() {}, removeItem() {},
  };
  const fenster = { addEventListener() {}, removeEventListener() {}, location: { search: "", pathname: "/", hash: "" }, localStorage: speicher };
  fenster.window = fenster;
  const ctx = vm.createContext({ window: fenster, document: { addEventListener() {} }, localStorage: speicher, console });
  vm.runInContext(d.quelle("journey-plan.js"), ctx, { filename: "journey-plan.js" });
  const R = fenster.LernappReise;
  return {
    R,
    stufe(stufe) { zustand = { done: {}, tries: {}, choice: {}, alt: {}, stufe }; },
    allesGestempelt() {
      const done = {};
      for (let nr = 1; nr <= R.STATION_COUNT; nr += 1) done[nr] = { stars: 3 };
      zustand = { done, tries: {}, choice: {}, alt: {} };
    },
  };
}

// Was an einer Station stehen kann: die offene Wahl, jedes gewählte Spiel,
// das Ausweichgleis – so, wie taskFor und altTaskFor sie liefern.
function varianten(R, nr) {
  const station = R.stationAt(nr);
  const liste = [R.taskFor(nr)];
  if (station.choice) station.choice.forEach((c) => liste.push(R.taskFor(nr, { game: c.game })));
  const alt = R.altTaskFor(nr);
  if (alt) liste.push(alt);
  return liste.filter(Boolean);
}

const endetMitZahl = (satz) => /\d\.$/.test(satz);

export default function texte(d) {
  const aus = [];
  const dazu = (text, wo) => { if (text) aus.push({ text, wo }); };
  const stuecke = (text, wo) => stueckeVon(text).forEach((s) => dazu(s, wo));
  const { R, stufe: stelleStufe, allesGestempelt } = reiseLaden(d);
  const STUFEN = R.STUFEN;

  // --- app.js: die Rätselseiten ---------------------------------------------
  const app = auswerten(d, "app.js", [
    "const DIFFICULTIES = {", "const DIFFICULTY_KEYS =", "const STARTER_GAMES =", "const GAME_CONFIGS = {", "const FLAT_LEVEL_GAMES =",
    "function sentence(", "function wordItem(", "const READING_WORD_ITEMS = [", "const READING_DIFFICULTY_RANK =", "const READING_TASK_TYPES = {",
    "function titleCaseWord(", "const LAUT_STEINE =", "function lautSteine(", "function stummesH(", "function einzelLautIndexe(",
    "function anfangHoerbar(", "function endeHoerbar(", "function wordsForReadingDifficulty(", "function missingLetterIndexes(",
    "const LETTER_ITEMS = [", "const LETTER_MODES = {", "const lastLetterOf =", "function letterGapIndexes(", "function letterItemFits(",
    "const SPATIAL_TASKS_PER_LEVEL =", "function readingSpokenText(",
  ], [
    "DIFFICULTIES", "DIFFICULTY_KEYS", "STARTER_GAMES", "GAME_CONFIGS", "FLAT_LEVEL_GAMES", "sentence", "READING_WORD_ITEMS", "READING_TASK_TYPES",
    "titleCaseWord", "wordsForReadingDifficulty", "missingLetterIndexes", "LETTER_ITEMS", "LETTER_MODES", "lastLetterOf", "letterItemFits",
    "SPATIAL_TASKS_PER_LEVEL", "readingSpokenText",
  ]);
  const { GAME_CONFIGS, DIFFICULTIES, sentence } = app;
  const appQuelle = d.quelle("app.js");
  const woApp = (merkmal) => zeileIn("app.js", merkmal);

  // boardHelpText: «Titel.» und die Regeln; die Übungsspiele hängen «Deine
  // Aufgabe: …» an, der Raumdetektiv seinen Stand.
  const regeln = (c) => (Array.isArray(c.rules) && c.rules.length ? c.rules.join(" ") : c.subtitle || "");
  const woBrett = woApp("function boardHelpText(");
  Object.values(GAME_CONFIGS).forEach((c) => dazu(`${sentence(c.title)} ${regeln(c)}`, woBrett));

  // Buchstaben-Jagd: die Frage je Art und Wort (generateLetterTask).
  const woBuchstabe = woApp("const question = mode === \"gap\"");
  const arten = new Set(Object.values(app.LETTER_MODES).flatMap((welten) => Object.values(welten).flat()));
  arten.forEach((art) => {
    app.LETTER_ITEMS.filter((item) => app.letterItemFits(item, art)).forEach((item) => {
      const wort = item.word.toUpperCase();
      const frage = art === "wordStart" ? `Welches Wort beginnt mit ${wort[0]}?`
        : art === "wordEnd" ? `Welches Wort endet mit ${app.lastLetterOf(wort)}?`
          : art === "gap" ? `Welcher Buchstabe fehlt im Wort ${item.word}?`
            : art === "end" ? `Womit endet ${item.word}?` : `Womit beginnt ${item.word}?`;
      dazu(`Deine Aufgabe: ${frage}`, woBuchstabe);
    });
  });

  // Wortdetektiv: die Frage je Aufgabenart, bei fehlendem Buchstaben oder
  // fehlender Silbe dazu «Das Wort heisst …» (readingSpokenText).
  const woLesen = woApp("function readingSpokenText(");
  const fragen = Object.fromEntries([...appQuelle.matchAll(/taskType: "(\w+)",\s*imageKey: [^,]+,\s*prompt: "([^"]+)"/g)].map((m) => [m[1], m[2]]));
  const lesenArten = new Set(Object.values(app.READING_TASK_TYPES).flatMap((welten) => Object.values(welten).flat()));
  const lesenWoerter = { missingLetter: new Set(), missingSyllable: new Set() };
  Object.entries(app.READING_TASK_TYPES).forEach(([stufe, welten]) => Object.entries(welten).forEach(([welt, liste]) => {
    if (liste.includes("missingLetter")) {
      app.wordsForReadingDifficulty(welt, stufe)
        .filter((item) => item.allowedTaskTypes.includes("missingLetter"))
        .filter((item) => welt !== "easy" || stufe === "schwer" || item.word.length <= 5)
        .filter((item) => app.missingLetterIndexes(item, welt, stufe).length > 0)
        .forEach((item) => lesenWoerter.missingLetter.add(item.word));
    }
  }));
  app.wordsForReadingDifficulty("hard")
    .filter((item) => item.allowedTaskTypes.includes("missingSyllable") && item.syllables.length > 1)
    .forEach((item) => lesenWoerter.missingSyllable.add(item.word));
  lesenArten.forEach((art) => {
    const prompt = fragen[art];
    if (!prompt) throw new Error(`app.js: keine Frage für ${art}`);
    const woerter = lesenWoerter[art];
    if (!woerter) { dazu(`Deine Aufgabe: ${app.readingSpokenText({ prompt, taskType: art })}`, woLesen); return; }
    woerter.forEach((wort) => dazu(`Deine Aufgabe: ${app.readingSpokenText({ prompt, taskType: art, fullText: wort })}`, woLesen));
  });

  // Raumdetektiv: ein Level je Welt, so viele Aufgaben, wie es dort gibt.
  const raum = { SPATIAL_PUZZLES: [] };
  vm.runInContext(d.quelle("spatial-puzzles.js"), vm.createContext({ window: raum, console }), { filename: "spatial-puzzles.js" });
  const woRaum = woApp("Aufgaben nacheinander, Zeit hast du");
  const raumTitel = sentence(GAME_CONFIGS.spatialPuzzle.title);
  new Set(app.DIFFICULTY_KEYS.map((welt) => raum.SPATIAL_PUZZLES.filter((t) => t.difficulty === welt).slice(0, app.SPATIAL_TASKS_PER_LEVEL).length)).forEach((n) => {
    for (let k = 1; k <= n; k += 1) {
      dazu(`${raumTitel} ${regeln(GAME_CONFIGS.spatialPuzzle)} ${n} Aufgaben nacheinander, Zeit hast du so viel du willst. Du bist bei Aufgabe ${k} von ${n}. Wer keine einzige daneben tippt, bekommt drei Sterne.`, woRaum);
    }
  });

  // Welt- und Levelwahl.
  Object.entries(GAME_CONFIGS).forEach(([spiel, c]) => {
    if (app.FLAT_LEVEL_GAMES.has(spiel)) {
      dazu(`${sentence(c.title)} ${c.subtitle} Such dir eine Welt aus: Leicht, Mittel, Schwer oder Extrem. Jede ist eine Runde über zehn Aufgaben. Je weiter rechts, desto kniffliger.`, woApp("Such dir eine Welt aus: Leicht"));
      return;
    }
    const welten = app.STARTER_GAMES.has(spiel) ? [["starter", ...app.DIFFICULTY_KEYS], app.DIFFICULTY_KEYS] : [app.DIFFICULTY_KEYS];
    welten.forEach((liste) => dazu(`${sentence(c.title)} ${c.subtitle} Wähle zuerst deine Welt: ${liste.map((w) => DIFFICULTIES[w].label).join(", ")}. Je weiter rechts, desto kniffliger.`, woApp("Wähle zuerst deine Welt:")));
    welten[0].forEach((w) => dazu(`${c.title}, Welt ${DIFFICULTIES[w].label}. Such dir ein Level aus und tippe darauf. Kacheln mit Sternen hast du schon geschafft. Eine Kachel mit Schloss wird frei, sobald du das Level davor gelöst hast.`, woApp(", Welt ${difficulty.label}.")));
  });

  // Geschafft-Tafel (showSuccess).
  const woGeschafft = woApp("Geschafft! Du hast ${stars} von 3 Sternen. Der Zug bringt");
  for (let stars = 1; stars <= 3; stars += 1) {
    dazu(`Geschafft! Du hast ${stars} von 3 Sternen. Der Zug bringt dir Ziegel für ein neues Stockwerk. Tippe auf Zur Bauecke.`, woGeschafft);
    ["drei", "zwei"].forEach((need) => dazu(`Geschafft! Du hast ${stars} von 3 Sternen. Für den Stempel brauchst du aber ${need}. Tippe auf Nochmal und versuch es gleich noch einmal – oder auf Zur Karte.`, woGeschafft));
    ["Ein goldener Stempel!", "Der Stempel wartet auf der Karte."].forEach((stempel) => dazu(`Geschafft! Du hast ${stars} von 3 Sternen. ${stempel} Tippe auf Zur Karte, und der Zug fährt weiter – oder auf Nochmal, um dieses Level noch einmal zu spielen.`, woGeschafft));
    ["Tippe auf Weiter für das nächste Level", "Tippe auf Fertig für die Levelauswahl"].forEach((weiter) => dazu(`Geschafft! Du hast ${stars} von 3 Sternen. ${weiter} oder auf Nochmal, um dieses Level noch einmal zu spielen.`, woGeschafft));
  }

  // --- journey-plan.js: describe(task) ---------------------------------------
  // Beim Öffnen eines Spiels sagt der Lautsprecher den Auftrag und gleich
  // danach die Hilfe des Spiels (app.js showGame, game-shell.js). Endet der
  // Auftrag mit einer Zahl («Löse Rätsel Wiese 1.»), hängt der erste Satz
  // der Hilfe daran.
  const woDescribe = zeileIn("journey-plan.js", "function describe(task)");
  const hilfeAnfang = new Map();
  const ersterHilfeSatz = (task) => {
    if (!hilfeAnfang.has(task.game)) {
      let satz = "";
      if (GAME_CONFIGS[task.game]) satz = sentence(GAME_CONFIGS[task.game].title);
      else {
        // Die Spielseite lädt ihr Skript gleich nach game-shell.js; dessen
        // help ist HELP.
        const skripte = [...d.quelle(task.page).matchAll(/src="([\w-]+\.js)/g)].map((m) => m[1]);
        const datei = skripte[skripte.indexOf("game-shell.js") + 1];
        const quelle = datei ? d.quelle(datei) : "";
        const liste = /const HELP = \[([\s\S]*?)\]\.join\(" "\);/.exec(quelle);
        const einzeln = /const HELP = ("(?:[^"\\]|\\.)*");/.exec(quelle);
        const teile = liste ? [...liste[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)) : einzeln ? [JSON.parse(einzeln[1])] : [];
        satz = saetzeVon(teile.join(" "))[0] || "";
      }
      hilfeAnfang.set(task.game, satz);
    }
    return hilfeAnfang.get(task.game);
  };
  const auftraege = [];
  STUFEN.forEach((stufe) => {
    stelleStufe(stufe);
    for (let nr = 1; nr <= R.STATION_COUNT; nr += 1) {
      const station = R.stationAt(nr);
      varianten(R, nr).filter((t) => !t.choice).forEach((t) => auftraege.push(t));
      // Dieselbe Station als Rätsel der Bauecke (bauTaskFor), auf «leicht»
      // ohne die Lesespiele (bauKandidaten).
      const specs = [...(station.choice || [station.spec]).map((spec) => ({ spiel: spec.game, alt: false })), ...(station.alt ? [{ spiel: station.alt.game, alt: true }] : [])];
      specs.forEach(({ spiel, alt }) => {
        if (stufe === "leicht" && ["letterPuzzle", "readingPuzzle", "kakuro"].includes(spiel)) return;
        const t = R.bauTaskFor(nr, spiel, alt);
        if (t) auftraege.push(t);
      });
    }
  });
  // «Reise, Station 23:» und «Memory.» je eigens: 130 Stationen mal ihre
  // Spiele gäbe dreimal so viele Sätze.
  auftraege.forEach((t) => {
    const satz = R.describe(t);
    saetzeVon(endetMitZahl(satz) ? `${satz} ${ersterHilfeSatz(t)}` : satz).forEach((s) => {
      if (/^Reise( 2)?, Station \d+: /.test(s)) stuecke(s, woDescribe);
      else dazu(s, woDescribe);
    });
  });

  // --- train-journey.js -------------------------------------------------------
  const zug = auswerten(d, "train-journey.js", ["const PASSENGER_NAMES = {", "const LANDMARK_HOMES = {", "function passengerName(", "function passengerPronoun("],
    ["PASSENGER_NAMES", "LANDMARK_HOMES", "passengerName", "passengerPronoun"]);
  const woZug = (merkmal) => zeileIn("train-journey.js", merkmal);
  const woSprechen = woZug("function speakState()");
  const N = R.STATIONS_PER_MAP;
  const lapPrefix = (map) => (map.lap === 2 ? "Reise 2, " : "");

  // speakState: Zu Besuch auf einer fertigen Karte – einer vor der
  // aktuellen, also nie auf der letzten.
  R.MAPS.slice(0, -1).forEach((map) => dazu(`${lapPrefix(map)}Karte ${map.nr}, ${map.name} – fertig. Tippe auf eine Station, um sie noch einmal zu spielen: mit drei Sternen wird der Stempel golden. Mit dem Pfeil oben links kommst du zurück zu deiner Karte.`, woSprechen));

  // speakState: die Karte, die erste offene Station (i), die zweite (j), das
  // Ausweichgleis, die Schiebelok, der Fahrgast und das Ziel. Jeder Stand, den
  // es geben kann, wird einmal zusammengesetzt wie im Code; geteilt wird
  // danach in Sätze und, wo zwei Stationen in einem Satz stehen, am
  // Doppelpunkt.
  //
  // Hinter «Zahl.» teilt kids.js nicht («der 3. Stock»). Darum endet kein
  // Auftrag mit «Level 3.» (sondern «Level 3!»), und die Station heisst
  // «Tippe auf die 5 im grünen Kreis.» – sonst klebten Auftrag, Station und
  // zweite Station zu einem Satz zusammen. Bleibt doch eine solche Kette,
  // steht sie in zugKetten und fällt hier auf.
  const zugSaetze = new Set();
  const zugStuecke = new Set();
  const zugKetten = new Set();
  const zugText = ({ map, i, task, altTask, zweite, j, geschoben }) => {
    let text = `${lapPrefix(map)}Karte ${map.nr}, ${map.name}. Station ${i + 1} von ${N}. `;
    if (geschoben) text += "Die Schiebelok hat den Zug zur nächsten Station geschoben. Die Station davor hat noch keinen Stempel – du kannst sie später noch einmal spielen. ";
    if (i === 0 && map.passenger) text += `Auf dem Bahnsteig wartet ${zug.passengerName(map.passenger)}: ${zug.passengerPronoun(map.passenger).toLowerCase()} fährt mit. `;
    if (task.choice) {
      text += `Wahlstation: ${task.choice.map((c) => c.title).join(" oder ")}. Tippe eines an.`;
    } else {
      text += `Als Nächstes: ${task.title}. ${task.speech} Tippe auf die ${i + 1} im grünen Kreis.`;
      if (altTask) text += ` Oder nimm das Ausweichgleis: ${altTask.title}.`;
    }
    if (zweite) {
      text += zweite.choice
        ? ` Du kannst sie auch überspringen und Station ${j} spielen: ${zweite.choice.map((c) => c.title).join(" oder ")}.`
        : ` Du kannst sie auch überspringen und Station ${j} spielen: ${zweite.title || ""}. ${zweite.speech || ""}`;
    }
    const left = N - i;
    text += ` Am Ziel wartet: ${map.reward.label}${left > 1 ? `, noch ${left} Stationen` : ", die nächste Station"}.`;
    return text;
  };
  const kette = /\d\. Tippe auf die \d+ im grünen Kreis\./;
  const amDoppelpunkt = /Am Ziel wartet: |^Du kannst sie auch überspringen und Station \d+ spielen: /;
  STUFEN.forEach((stufe) => {
    stelleStufe(stufe);
    R.MAPS.forEach((map, k) => {
      const nrOf = (i) => k * N + i + 1;
      const jeStation = Array.from({ length: N }, (_, i) => varianten(R, nrOf(i)));
      for (let i = 0; i < N; i += 1) {
        jeStation[i].forEach((task) => {
          const alt = !task.choice && !task.viaAlt ? R.altTaskFor(nrOf(i)) : null;
          [null, alt].forEach((altTask, a) => {
            if (a && !altTask) return;
            const zweiten = [{ zweite: null, j: 0 }];
            for (let b = i + 1; b < N; b += 1) jeStation[b].forEach((zweite) => zweiten.push({ zweite, j: b + 1 }));
            zweiten.forEach(({ zweite, j }) => [false, true].forEach((geschoben) => {
              saetzeVon(zugText({ map, i, task, altTask, zweite, j, geschoben })).forEach((satz) => {
                if (kette.test(satz)) zugKetten.add(satz);
                else if (amDoppelpunkt.test(satz)) stueckeVon(satz).forEach((s) => zugStuecke.add(s));
                else zugSaetze.add(satz);
              });
            }));
          });
        });
      }
    });
  });
  if (zugKetten.size) throw new Error(`zug.mjs: ${zugKetten.size} Sätze kleben hinter «Zahl.» zusammen, z. B. «${[...zugKetten][0]}» – den Auftrag nicht mit «Zahl.» enden lassen`);
  zugSaetze.forEach((s) => dazu(s, woSprechen));
  zugStuecke.forEach((s) => dazu(s, woSprechen));

  // Die Feier-Tafeln (showReward): eine fertige Karte, der Bonus.
  const woTafel = woZug("Tippe auf den Haken, um weiterzufahren.");
  const ersteReise = R.LAPS[0];
  R.MAPS.forEach((map, mapIndex) => {
    const lastOfFirst = mapIndex === ersteReise.firstMap + ersteReise.maps - 1;
    const lastOfAll = mapIndex === R.MAPS.length - 1;
    const home = map.passenger
      ? ` ${zug.passengerName(map.passenger).replace(/^\w/, (c) => c.toUpperCase())} ist zu Hause: ${zug.LANDMARK_HOMES[map.landmark] || "am Ziel"} geht ein Licht an.`
      : "";
    const where = map.reward.part === "scene" ? "Du kannst sie oben links auswählen."
      : map.reward.part === "plate" ? "Er leuchtet auf dem Reise-Schild deiner Lok – auch für die Gruppe zu sehen."
        : "Du findest es in der Werkstatt an deiner Lok.";
    const onward = lastOfAll ? " Beide Reisen sind geschafft – alle hundertdreissig Stationen!"
      : lastOfFirst ? " Die ganze erste Reise ist geschafft – und weiter geht es: Reise 2 beginnt im Weltraum!" : "";
    const title = lastOfAll ? "Beide Reisen geschafft!" : `Karte ${map.nr} geschafft!`;
    const note = `Neu für deinen Zug: ${map.reward.part === "plate" ? "ein goldener Stern" : map.reward.label}. ${where}${home}${onward}`;
    dazu(`${title} ${note} Tippe auf den Haken, um weiterzufahren.`, woTafel);
  });
  R.BONUSES.forEach((bonus) => dazu(`Zehn goldene Stempel! Neu für deinen Zug: ${bonus.label}. Du findest es in der Werkstatt an deiner Lok. Tippe auf den Haken, um weiterzufahren.`, woTafel));

  // Der Fahrplan (showPlan): je Karte «Karte 3, See: …» – Name und Stand am
  // Doppelpunkt geteilt.
  const woPlan = woZug("const release = kids()?.pushHelp?.(`Der Fahrplan");
  dazu("Der Fahrplan: sechs Karten.", woPlan);
  dazu("Der Fahrplan: Reise 1 und Reise 2.", woPlan);
  dazu("Reise 2:", woPlan);
  R.MAPS.forEach((map, k) => {
    dazu(`Karte ${map.nr}, ${map.name}:`, woPlan);
    dazu(`Karte ${map.nr}, ${map.name}: fertig, alle Stempel golden.`, woPlan);
    // Im Nebel liegt eine Karte hinter der aktuellen – nie die erste einer
    // Reise: Die zweite Reihe steht erst da, wenn die erste fertig ist.
    if (k > R.LAPS.find((lap) => k >= lap.firstMap && k < lap.firstMap + lap.maps).firstMap) dazu(`Karte ${map.nr}, ${map.name}: noch im Nebel.`, woPlan);
  });
  for (let gold = 0; gold < N; gold += 1) {
    for (let geschoben = 0; geschoben <= N - gold; geschoben += 1) dazu(`fertig, ${gold} von ${N} Stempeln golden${geschoben ? `, ${geschoben} geschoben` : ""}.`, woPlan);
    dazu(`${gold} von ${N} Stationen gestempelt.`, woPlan);
  }
  dazu("Tippe auf eine fertige Karte, um sie noch einmal zu fahren.", woPlan);
  // Der Stand der Reise, in Sätzen mit je einer Zahl.
  const woStand = zeileIn("train-journey.js", "const standSatz = ");
  R.LAPS.forEach((lap) => {
    for (let n = 0; n <= lap.total; n += 1) {
      dazu(`${lap.nr === 2 ? "Reise 2: " : ""}${n} von ${lap.total} Stationen gestempelt.`, woStand);
      dazu(n === 1 ? "Ein Stempel ist golden." : `${n} Stempel sind golden.`, woStand);
    }
  });

  // --- train-home.js: die Werkstatt ------------------------------------------
  const teileQuelle = stueck(d.quelle("train-art.js"), "const LOCO_PARTS = [", "train-art.js");
  const LOCO_PARTS = [...teileQuelle.matchAll(/\{ id: "(\w+)", label: "([^"]+)"/g)].map((m) => ({ id: m[1], label: m[2] }));
  const woWerkstatt = (merkmal) => zeileIn("train-home.js", merkmal);
  allesGestempelt();
  const neu = R.unlockedParts().filter((entry) => LOCO_PARTS.some((spec) => spec.id === entry.part));
  // Neues kommt Satz für Satz: «Neu an deiner Lok:», dann je Teil «Label.».
  LOCO_PARTS.forEach((teil) => {
    dazu(`${teil.label} ändern. Tippe eine Form oder eine Farbe an.`, woWerkstatt("ändern. Tippe eine Form"));
    dazu(`${teil.label} ändern. Neu und golden umrandet:`, woWerkstatt("Neu und golden umrandet:"));
  });
  const woLok = woWerkstatt("Neu an deiner Lok:");
  dazu("Neu an deiner Lok:", woLok);
  new Set(neu.map((entry) => entry.label)).forEach((label) => dazu(`${label}.`, woLok));
  dazu("Tippe auf den goldenen Stern, um es anzuschauen.", woLok);
  dazu("Tippe darauf, um es an deine Lok zu bauen.", woWerkstatt("Neu und golden umrandet:"));

  // --- train-leseecke.js und lesen-wurm.js: der Lesewagen --------------------
  const woLese = (merkmal) => zeileIn("train-leseecke.js", merkmal);
  const ORTE = auswerten(d, "train-leseecke.js", ["const ORTE = {"], ["ORTE"]).ORTE;
  const SPIELE = d.stand.SPIELE;
  Object.entries(ORTE).forEach(([ort, titel]) => {
    const spiele = Object.values(SPIELE).filter((spiel) => spiel.ort === ort);
    dazu(`${titel}. Tippe auf ein Spiel: ${spiele.map((spiel) => spiel.titel).join(", ")}.`, woLese("Tippe auf ein Spiel:"));
  });
  // missionSatz: was der Lesewurm vorschlägt (naechstes), ohne Namen.
  const woMission = woLese("hat eine Idee:");
  const vorschlaege = new Set(Object.values(d.stand.AUSWAHL).flat());
  vorschlaege.forEach((id) => {
    const sagt = id === "buecher" ? "ein Buch" : SPIELE[id].titel;
    dazu(`Dein Lesewurm hat eine Idee: ${sagt}! Tippe auf ihn, und es geht los.`, woMission);
  });
  const bedarf = [...d.stand.WURM_BEDARF, d.stand.WURM_WECHSEL];
  for (let rest = 1; rest <= Math.max(...bedarf); rest += 1) dazu(`Noch ${rest} ${rest === 1 ? "Buchstabe" : "Buchstaben"} bis zur nächsten Überraschung.`, woLese("bis zur nächsten Überraschung."));
  // Neue Buchstaben seit dem letzten Besuch: weniger, als die Stufe braucht.
  for (let dazuGekommen = 1; dazuGekommen < Math.max(...bedarf); dazuGekommen += 1) {
    dazu(`${dazuGekommen === 1 ? "Ein neuer Buchstabe" : `${dazuGekommen} neue Buchstaben`} für deinen Lesewurm!`, woLese("neue Buchstaben`} für"));
  }
  // Die Verwandlung: «Überraschung!» und was der Wurm sagt (lesen-wurm.js,
  // sagt – gesagt wird immer «Dein Lesewurm»).
  const woSagt = zeileIn("lesen-wurm.js", "function sagt(leben, stufe");
  d.wurm.LEBEN.forEach((leben, l) => leben.stufen.forEach((stufe, s) => {
    dazu(`Überraschung! ${d.wurm.sagt(l, s + 1)}`, woSagt);
  }));
  // Neu im Lesewagen: «Neu im Lesewagen:», dann je Ding ein Satz.
  const AUSBAU = [...stueck(d.quelle("lesen-art.js"), "const AUSBAU = [", "lesen-art.js").matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
  const woAusbau = woLese("Neu im Lesewagen:");
  dazu("Neu im Lesewagen:", woAusbau);
  AUSBAU.forEach((ding) => dazu(`${ding.charAt(0).toUpperCase()}${ding.slice(1)}!`, woAusbau));

  // --- firebase.js: die Hilfe des Kontofensters ------------------------------
  const woKonto = zeileIn("firebase.js", "function fensterHilfeSetzen()");
  const konto = stueck(d.quelle("firebase.js"), "function fensterHilfeSetzen()", "firebase.js");
  [...konto.matchAll(/"(Das ist (?:[^"\\]|\\.)*)"/g)].forEach((m) => dazu(JSON.parse(`"${m[1]}"`), woKonto));

  return aus;
}

export const NICHT = [
  { wo: zeileIn("kids.js", "function stimmeProbe("), warum: "die Stimmprobe im Elternbereich (firebase.js) spricht absichtlich mit der Gerätestimme: Eltern vergleichen damit die Stimmen des Geräts" },
];
