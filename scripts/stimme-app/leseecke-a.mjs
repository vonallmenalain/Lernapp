/*
 * leseecke-a.mjs – Was ein Teil der Leseecke mit Wechselndem sagt.
 * ---------------------------------------------------------------------------
 * Anlaut-Lauscher, Blitzwörter, Buchstabengleis, Buchstabenhaus,
 * Buchstaben-Signal, Detektivfälle, Geschichtenzug, Laute kuppeln,
 * Laut-Position, Lies und tu!, Lückensätze, Mein Name, Postkarten – und was
 * lesen-spiel.js an jedes Ergebnis hängt (der Lesewurm).
 *
 * Die festen Sätze findet stimme-app-texte.mjs selbst. Hier stehen die
 * Vorlagen mit ${…}, ausgerechnet für alles, was ein Spiel daraus machen
 * kann, und was die Spiele aus ihren Listen vorlesen, oft ohne Satzzeichen
 * («und», «wie Maus», «ro»). Jede Vorlage wird im Quelltext gesucht, Listen
 * und kleine Funktionen werden aus ihm gelesen: Ändert sich dort etwas,
 * bricht diese Regel mit einer Meldung ab, statt alte Sätze aufzunehmen.
 *
 * Die Laute selbst (lesen-ton.js, laut) sind aufgenommen (lesen-laute.js).
 * Nur für einen Laut ohne Aufnahme spräche die Sprachausgabe seine «stimme».
 */
import vm from "node:vm";

// Die Lückensätze der Stufe «schwer» mit mehreren Tieren («Zwei Füchse
// stehen auf dem Tisch.»): 770 Sätze, knapp 26'000 Zeichen.
const MEHRZAHL = true;

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------
const fehler = (text) => new Error(`scripts/stimme-app/leseecke-a.mjs: ${text}`);
const einmal = (liste) => [...new Set(liste)];
// von, von + 1, …, bis
const reihe = (von, bis) => Array.from({ length: Math.max(0, bis - von + 1) }, (_, i) => von + i);

// Wo ein Stück im Quelltext steht: «datei.js:zeile».
function stelle(d, datei, stueck) {
  const quelle = d.quelle(datei);
  const i = quelle.indexOf(stueck);
  if (i < 0) throw fehler(`«${stueck}» steht nicht mehr in ${datei} – die Regel nachführen.`);
  return `${datei}:${quelle.slice(0, i).split("\n").length}`;
}

// Eine Vorlage, so wie sie im Code steht (ohne die Backticks). mit() setzt
// für jedes ${ausdruck} einen Wert ein.
function vorlage(d, datei, roh) {
  const wo = stelle(d, datei, `\`${roh}\``);
  const mit = (werte) => roh.replace(/\$\{([^{}]+)\}/g, (_, ausdruck) => {
    if (!(ausdruck in werte)) throw fehler(`kein Wert für \${${ausdruck}} (${wo})`);
    return String(werte[ausdruck]);
  });
  return { wo, mit, satz: (werte) => ({ text: mit(werte), wo }) };
}

// Ein kleiner Leser für JavaScript: Er findet die Klammer, die bei q[i]
// schliesst, und überspringt Zeichenketten, Vorlagen, Kommentare und
// reguläre Ausdrücke.
const ZU = { "(": ")", "[": "]", "{": "}" };
const VOR_AUSDRUCK = new Set(["return", "typeof", "case", "in", "of", "new", "delete", "void", "throw", "instanceof", "yield", "await", "else", "do"]);

function hinterText(q, i, zeichen) {
  let j = i + 1;
  while (j < q.length && q[j] !== zeichen) j += q[j] === "\\" ? 2 : 1;
  return j + 1;
}

function hinterVorlage(q, i) {
  let j = i + 1;
  while (j < q.length) {
    if (q[j] === "\\") { j += 2; continue; }
    if (q[j] === "`") return j + 1;
    if (q[j] === "$" && q[j + 1] === "{") { j = hinterKlammer(q, j + 1); continue; }
    j += 1;
  }
  return j;
}

function hinterRegex(q, i) {
  let j = i + 1;
  let klasse = false;
  while (j < q.length) {
    const c = q[j];
    if (c === "\\") { j += 2; continue; }
    if (c === "[") klasse = true;
    else if (c === "]") klasse = false;
    else if (c === "/" && !klasse) { j += 1; break; }
    j += 1;
  }
  while (j < q.length && /[a-z]/.test(q[j])) j += 1;
  return j;
}

function hinterKlammer(q, i) {
  const stapel = [];
  let vorher = "(";
  while (i < q.length) {
    const c = q[i];
    if (c === "/" && q[i + 1] === "/") { const e = q.indexOf("\n", i); i = e < 0 ? q.length : e; continue; }
    if (c === "/" && q[i + 1] === "*") { const e = q.indexOf("*/", i + 2); i = e < 0 ? q.length : e + 2; continue; }
    if (/\s/.test(c)) { i += 1; continue; }
    if (c === '"' || c === "'") { i = hinterText(q, i, c); vorher = "wert"; continue; }
    if (c === "`") { i = hinterVorlage(q, i); vorher = "wert"; continue; }
    if (c === "/" && (/^[(,=:[!&|?{};+\-*%<>~^]$/.test(vorher) || VOR_AUSDRUCK.has(vorher))) { i = hinterRegex(q, i); vorher = "wert"; continue; }
    if (/[\w$]/.test(c)) {
      let j = i;
      while (j < q.length && /[\w$]/.test(q[j])) j += 1;
      vorher = q.slice(i, j);
      i = j;
      continue;
    }
    if (ZU[c]) stapel.push(ZU[c]);
    else if (c === ")" || c === "]" || c === "}") {
      if (stapel.pop() !== c) throw fehler(`Klammern passen nicht (Stelle ${i})`);
      if (!stapel.length) return i + 1;
    }
    vorher = c;
    i += 1;
  }
  throw fehler("Klammer ohne Ende");
}

// const NAME = …; aus einem Skript – eine Zahl, eine Liste, ein Objekt.
function konstante(d, datei, name) {
  const quelle = d.quelle(datei);
  const treffer = new RegExp(`\\bconst ${name}\\s*=\\s*`).exec(quelle);
  if (!treffer) throw fehler(`const ${name} fehlt in ${datei}`);
  const anfang = treffer.index + treffer[0].length;
  const ende = ZU[quelle[anfang]] ? hinterKlammer(quelle, anfang) : quelle.indexOf(";", anfang);
  return vm.runInNewContext(`(${quelle.slice(anfang, ende)})`, {});
}

// Ein paar Funktionen aus einem Skript, lauffähig gemacht. umgebung: was
// sie aus ihrer Hülle brauchen (inhalte, Konstanten).
function funktionen(d, datei, namen, umgebung = {}) {
  const quelle = d.quelle(datei);
  const teile = namen.map((name) => {
    const treffer = new RegExp(`\\bfunction ${name}\\s*\\(`).exec(quelle);
    if (!treffer) throw fehler(`function ${name} fehlt in ${datei}`);
    const nachParametern = hinterKlammer(quelle, treffer.index + treffer[0].length - 1);
    return quelle.slice(treffer.index, hinterKlammer(quelle, quelle.indexOf("{", nachParametern)));
  });
  return vm.runInNewContext(`${teile.join("\n")}\n({ ${namen.join(", ")} })`, { ...umgebung });
}

// Ein Stück Code, das genau so dastehen muss; gibt die Gruppen zurück.
function muster(d, datei, ausdruck) {
  const treffer = ausdruck.exec(d.quelle(datei));
  if (!treffer) throw fehler(`${ausdruck} passt nicht mehr auf ${datei} – die Regel nachführen.`);
  return treffer;
}

// Welche Laute aufgenommen sind (lesen-laute.js: "m": "data:audio/…").
function aufgenommeneLaute(d) {
  return new Set([...d.quelle("lesen-laute.js").matchAll(/^\s*"([^"]+)":\s*"data:/gm)].map((m) => m[1]));
}

// Die Zeichnungen der Leseecke (lesen-art.js) – für szenePasst und platzFuer.
function leseArt(d) {
  const leer = () => ({ setAttribute() {}, append() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, toggle() {} } });
  const fenster = { addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  fenster.window = fenster;
  const dokument = { createElementNS: leer, createElement: leer, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] };
  vm.runInNewContext(d.quelle("lesen-art.js"), { window: fenster, document: dokument, console });
  if (!fenster.LernappLeseArt) throw fehler("lesen-art.js liefert LernappLeseArt nicht");
  return fenster.LernappLeseArt;
}

// Die Sätze am Ende einer Runde: für jede Rundenlänge «von» die Punkte 0 bis
// von - 1 – alles richtig hat meist einen eigenen, festen Satz – oder, mit
// voll, bis von.
function ergebnisse(v, laengen, werte, { voll = false } = {}) {
  return einmal(laengen).filter((von) => von > 0)
    .flatMap((von) => reihe(0, voll ? von : von - 1).map((punkte) => v.satz(werte(punkte, von))));
}

// Ein Text aus den Daten, wie er gesprochen wird.
const daten = (text, wo) => ({ text, wo, teil: "daten" });

// ---------------------------------------------------------------------------
// lesen-spiel.js: was an jedes Ergebnis kommt
// ---------------------------------------------------------------------------
// Der Lesewurm: gesagt wird immer «Dein Lesewurm» (sein Name steht nur auf
// der Tafel). «Neuer Rekord!» steht fest im Code.
function lesenSpiel(d) {
  const D = "lesen-spiel.js";
  const ueberraschung = vorlage(d, D, " ${wer} hat eine Überraschung für dich – schau im Lesewagen nach!");
  const buchstaben = vorlage(d, D, ' ${mission ? "Zwei Buchstaben" : "Ein Buchstabe"} für ${wen}!');
  stelle(d, D, 'wurm = satz("Dein Lesewurm", "deinen Lesewurm");');
  return [
    ueberraschung.satz({ wer: "Dein Lesewurm" }),
    ...["Zwei Buchstaben", "Ein Buchstabe"].map((menge) => buchstaben.satz({
      'mission ? "Zwei Buchstaben" : "Ein Buchstabe"': menge,
      wen: "deinen Lesewurm",
    })),
  ];
}

// lesen-ton.js, laut(): Ohne Aufnahme spricht die Sprachausgabe die
// «stimme» eines Lautes (Selbstlaute, Zwielaute). Heute sind alle aufgenommen.
function lautOhneAufnahme(d) {
  const aufgenommen = aufgenommeneLaute(d);
  const wo = stelle(d, "lesen-ton.js", "sprich(eintrag.stimme");
  return d.inhalte.LAUTE.filter((laut) => laut.stimme && !aufgenommen.has(laut.id)).map((laut) => daten(laut.stimme, wo));
}

// ---------------------------------------------------------------------------
// Anlaut-Lauscher
// ---------------------------------------------------------------------------
// Gefragt wird nach Lauten mit mindestens zwei eindeutigen Bildwörtern; Ziel
// und Treffer sind zwei davon. Beim falschen Bild kommen Ziel und Bild als
// zwei Wörter nacheinander (sprichFolge) – je Wort eine Aufnahme.
function anlautlauscher(d) {
  const D = "anlautlauscher.js";
  const { inhalte } = d;
  const runde = konstante(d, D, "RUNDE");
  stelle(d, D, "inhalte.bildWoerter({ eindeutig: true })");
  stelle(d, D, "alle[laut].length >= 2");
  const gruppen = {};
  inhalte.bildWoerter({ eindeutig: true }).forEach((eintrag) => (gruppen[inhalte.anlautVon(eintrag.wort)] ||= []).push(eintrag));
  const laute = Object.keys(gruppen).filter((laut) => gruppen[laut].length >= 2);
  const hoer = vorlage(d, D, "Hör gut: ${a.ziel.wort}.");
  const paar = vorlage(d, D, "${a.ziel.wort} – ${eintrag.wort}. Die fangen gleich an!");
  const falschWo = stelle(d, D, "ton.sprichFolge([a.ziel.wort, eintrag.wort]");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${state.runde.length} Anfängen gleich gehört.");
  const liste = [];
  for (const laut of laute) {
    for (const ziel of gruppen[laut]) {
      liste.push(hoer.satz({ "a.ziel.wort": ziel.wort }));
      for (const treffer of gruppen[laut]) {
        if (treffer !== ziel) liste.push(paar.satz({ "a.ziel.wort": ziel.wort, "eintrag.wort": treffer.wort }));
      }
    }
  }
  liste.push(...ergebnisse(ende, [Math.min(runde, laute.length)], (p, von) => ({ "state.punkte": p, "state.runde.length": von })));
  // Ein falsches Bild kann jedes eindeutige Bildwort sein.
  inhalte.bildWoerter({ eindeutig: true }).forEach((eintrag) => liste.push(daten(eintrag.wort, falschWo)));
  return liste;
}

// ---------------------------------------------------------------------------
// Blitzwörter
// ---------------------------------------------------------------------------
function blitzwoerter(d) {
  const D = "blitzwoerter.js";
  const { inhalte } = d;
  const runde = konstante(d, D, "RUNDE");
  stelle(d, D, "inhalte.BLITZWOERTER.filter((w) => gruppen.includes(w.stufe))");
  const listen = Object.values(inhalte.BLITZ_JE_STUFE).map((gruppen) => inhalte.BLITZWOERTER.filter((w) => gruppen.includes(w.stufe)));
  const wo = stelle(d, D, "ton.sprich(eintrag.wort");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${state.runde.length} Blitzwörtern erkannt.");
  return [
    ...einmal(listen.flat().map((w) => w.wort)).map((wort) => daten(wort, wo)),
    ...ergebnisse(ende, listen.map((liste) => Math.min(runde, liste.length)), (p, von) => ({ "state.punkte": p, "state.runde.length": von })),
  ];
}

// ---------------------------------------------------------------------------
// Buchstabengleis
// ---------------------------------------------------------------------------
// Die Buchstaben mit Gleis, das Wort ohne Satzzeichen. Eine Runde: so viele
// Buchstaben, wie im Haus wohnen (die Eltern können wenige abhaken), höchstens
// RUNDE – gross allein oder je gross und klein.
function buchstabengleis(d) {
  const D = "buchstabengleis.js";
  const { inhalte } = d;
  const runde = konstante(d, D, "RUNDE");
  stelle(d, D, "spiel.ziehe(buchstabenListe(), gross ? RUNDE : RUNDE / 2)");
  const mitGleis = inhalte.LAUTE.filter((laut) => inhalte.GLEISE[laut.gross] && inhalte.GLEISE[laut.klein]);
  const wo = stelle(d, D, "ton.sprich(laut.wort");
  const ende = vorlage(d, D, "Du hast ${von} Buchstaben gefahren, ${state.punkte} davon ohne zu entgleisen.");
  const laengen = [
    ...reihe(1, Math.min(runde, mitGleis.length)),
    ...reihe(1, Math.min(runde / 2, mitGleis.length)).map((n) => n * 2),
  ];
  return [
    ...einmal(mitGleis.map((laut) => laut.wort)).map((wort) => daten(wort, wo)),
    ...ergebnisse(ende, laengen, (p, von) => ({ "state.punkte": p, von })),
  ];
}

// ---------------------------------------------------------------------------
// Buchstabenhaus
// ---------------------------------------------------------------------------
// Im Haus kann jeder Laut wohnen (die Eltern haken ab). Nach dem Laut «wie
// Maus»; spielt die Aufnahme nicht, nur «Maus».
function buchstabenhaus(d) {
  const D = "buchstabenhaus.js";
  const { inhalte } = d;
  const runde = konstante(d, D, "RUNDE");
  stelle(d, D, "while (auswahl.length < RUNDE && fragbar.length)");
  const aufgenommen = aufgenommeneLaute(d);
  const hoerbar = (laut) => aufgenommen.has(laut.id) || Boolean(laut.stimme);
  const wie = vorlage(d, D, "wie ${laut.wort}");
  const anfang = vorlage(d, D, "Wo wohnt der Anfang von ${laut.wort}?");
  const wo = stelle(d, D, "gehoert ? `wie ${laut.wort}` : laut.wort");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${state.runde.length} Lauten gefunden.");
  return [
    ...inhalte.LAUTE.filter(hoerbar).map((laut) => wie.satz({ "laut.wort": laut.wort })),
    ...inhalte.LAUTE.map((laut) => daten(laut.wort, wo)),
    ...inhalte.LAUTE.filter((laut) => !hoerbar(laut) && !laut.innen).map((laut) => anfang.satz({ "laut.wort": laut.wort })),
    ...ergebnisse(ende, [runde], (p, von) => ({ "state.punkte": p, "state.runde.length": von })),
  ];
}

// ---------------------------------------------------------------------------
// Buchstaben-Signal
// ---------------------------------------------------------------------------
// Wie viele der WAGEN den gesuchten Buchstaben tragen: nie drei gleiche
// nacheinander, mindestens einer.
function trefferZahlen(wagen) {
  let stand = new Map([["-0", new Set([0])]]);
  for (let i = 0; i < wagen; i += 1) {
    const neu = new Map();
    for (const [schluessel, zahlen] of stand) {
      const letzte = schluessel[0];
      const lauf = Number(schluessel.slice(1));
      for (const art of ["T", "F"]) {
        const laenge = art === letzte ? lauf + 1 : 1;
        if (laenge > 2) continue;
        const ziel = `${art}${laenge}`;
        if (!neu.has(ziel)) neu.set(ziel, new Set());
        for (const zahl of zahlen) neu.get(ziel).add(zahl + (art === "T" ? 1 : 0));
      }
    }
    stand = neu;
  }
  return einmal([...stand.values()].flatMap((zahlen) => [...zahlen]).map((zahl) => Math.max(1, zahl))).sort((a, b) => a - b);
}

function buchstabensignal(d) {
  const D = "buchstabensignal.js";
  const { inhalte } = d;
  const paare = konstante(d, D, "PAARE");
  const wagen = konstante(d, D, "WAGEN");
  stelle(d, D, "letzte.every((w) => w.treffer === treffer) ? !treffer : treffer");
  const halt = vorlage(d, D, "Halt bei jedem Wagen mit diesem Buchstaben – wie bei ${laut.wort}.");
  const ende = vorlage(d, D, "Du hast ${state.erwischt} von ${von} erwischt.");
  const gesucht = einmal(paare.map(([id]) => id)).map((id) => inhalte.LAUT_BY_ID[id]).filter(Boolean);
  // Alle erwischt, aber einer daneben: auch dann die Vorlage – also bis von.
  return [
    ...gesucht.map((laut) => halt.satz({ "laut.wort": laut.wort })),
    ...ergebnisse(ende, trefferZahlen(wagen), (p, von) => ({ "state.erwischt": p, von }), { voll: true }),
  ];
}

// ---------------------------------------------------------------------------
// Detektivfälle
// ---------------------------------------------------------------------------
function detektivfaelle(d) {
  const D = "detektivfaelle.js";
  const runde = konstante(d, D, "RUNDE");
  stelle(d, D, "const von = state.runde.length * 2;");
  const faelle = d.detektive.FAELLE;
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${von} Punkten.");
  return [
    ...faelle.map((f) => daten(f.titel, stelle(d, D, "ton.sprich(state.fall.titel"))),
    ...faelle.flatMap((f) => f.saetze).map((satz) => daten(satz, stelle(d, D, "ton.sprich(f.saetze[i]"))),
    ...faelle.map((f) => daten(f.aufloesung, stelle(d, D, "ton.sprich(f.aufloesung"))),
    ...ergebnisse(ende, [Math.min(runde, faelle.length) * 2], (p, von) => ({ "state.punkte": p, von })),
  ];
}

// ---------------------------------------------------------------------------
// Geschichtenzug
// ---------------------------------------------------------------------------
// Die Bücher aus den Fächern jeder Lesestufe; je Wagen der Satz der Seite
// (satzVon) oder, im Hörbuch, die ganze Seite – für drei Wagen («leicht»)
// und für vier.
function geschichtenzug(d) {
  const D = "geschichtenzug.js";
  const runde = konstante(d, D, "RUNDE");
  const faecher = konstante(d, D, "FAECHER");
  const [, ohneText, textStufen] = muster(d, D, /const zeigtText = \(buch\) => buch\.stufe !== "([^"]+)" && (\[[^\]]*\])\.includes\(lesestufe\(\)\);/);
  const [, leicht, sonst] = muster(d, D, /const anzahlWagen = \(\) => \(stufe\(\) === "leicht" \? (\d+) : (\d+)\);/);
  stelle(d, D, "faecher.includes(b.stufe) && b.seiten.length >= 4");
  const { satzVon, seitenFuer } = funktionen(d, D, ["satzVon", "verteilt", "seitenFuer"], { anzahlWagen: () => Number(sonst) });
  const mitText = JSON.parse(textStufen);
  const titelWo = stelle(d, D, "ton.sprich(state.aufgabe.buch.titel");
  const wagenWo = stelle(d, D, "ton.sprich(a.text ? w.satz : w.seite.text");
  const punkt = '/[.!?…]$/.test(buch.titel) ? "" : "."';
  const zuerst = vorlage(d, D, `\${buch.titel}\${${punkt}} Was kommt zuerst?`);
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${von} Geschichten gleich richtig gekuppelt.");
  const liste = [];
  for (const [lesestufe, liste_] of Object.entries(faecher)) {
    for (const buch of d.buecher.BUECHER.filter((b) => liste_.includes(b.stufe) && b.seiten.length >= 4)) {
      liste.push(daten(buch.titel, titelWo), zuerst.satz({ "buch.titel": buch.titel, [punkt]: /[.!?…]$/.test(buch.titel) ? "" : "." }));
      const text = buch.stufe !== ohneText && mitText.includes(lesestufe);
      for (const n of [Number(leicht), Number(sonst)]) {
        for (const nr of seitenFuer(buch, n)) liste.push(daten(text ? satzVon(buch.seiten[nr]).text : buch.seiten[nr].text, wagenWo));
      }
    }
  }
  // Ohne ein einziges Buch endet die Runde gleich: 0 von 1.
  liste.push(...ergebnisse(ende, [runde, 1], (p, von) => ({ "state.punkte": p, von })));
  return liste;
}

// ---------------------------------------------------------------------------
// Laute kuppeln
// ---------------------------------------------------------------------------
// Jedes Wort kann dran sein (mit abgehakten Lauten alle). Gesprochen werden
// die halben und ganzen Silben, klein – nicht ein einsilbiges Wort als
// Ganzes (dort klopft es) –, und am Ende das Wort.
function lautekuppeln(d) {
  const D = "lautekuppeln.js";
  const { inhalte } = d;
  const runde = konstante(d, D, "RUNDE");
  stelle(d, D, "const istGanzesWort = ganzesWort && state.wort.silben.length === 1;");
  stelle(d, D, "else if (!/[aeiouäöüy]/i.test(silbe)) {");
  const { zerlege } = funktionen(d, D, ["zerlege"], { inhalte });
  const silbeWo = stelle(d, D, "ton.sprich(silbe.toLowerCase()");
  const wortWo = stelle(d, D, "ton.sprich(state.wort.wort");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${state.runde.length} Wörtern gleich richtig gelesen.");
  const liste = [];
  for (const wort of inhalte.KUPPEL_WOERTER) {
    const teile = zerlege(wort);
    teile.forEach((teil, i) => {
      if (teil.stelle === 0) return;
      if (i === teile.length - 1 && wort.silben.length === 1) return;
      const silbe = teile.filter((t) => t.silbe === teil.silbe && t.stelle <= teil.stelle).map((t) => t.text).join("");
      // Ohne Selbstlaut («br») klingt der Laut aus seiner Aufnahme.
      if (!/[aeiouäöüy]/i.test(silbe)) return;
      liste.push(daten(silbe.toLowerCase(), silbeWo));
    });
    liste.push(daten(wort.wort, wortWo));
  }
  const laengen = [
    ...Object.values(inhalte.KUPPELN_JE_STUFE).map((gruppen) => inhalte.KUPPEL_WOERTER.filter((w) => gruppen.includes(w.stufe)).length),
    inhalte.KUPPEL_WOERTER.length,
  ].map((n) => Math.min(runde, n));
  liste.push(...ergebnisse(ende, laengen, (p, von) => ({ "state.punkte": p, "state.runde.length": von })));
  return liste;
}

// ---------------------------------------------------------------------------
// Laut-Position
// ---------------------------------------------------------------------------
function lautposition(d) {
  const D = "lautposition.js";
  const { inhalte } = d;
  const runde = konstante(d, D, "RUNDE");
  const laute = konstante(d, D, "LAUTE");
  const stellen = konstante(d, D, "STELLEN");
  const leicht = JSON.parse(muster(d, D, /const stellen = stufe\(\) === "leicht" \? (\[[^\]]*\]) : STELLEN;/)[1]);
  const { aufgaben } = funktionen(d, D, ["stelleIn", "aufgaben"], { inhalte, LAUTE: laute });
  const alle = aufgaben();
  const wo = stelle(d, D, "ton.sprich(a.wort");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${von} Lauten gleich am richtigen Ort gehört.");
  const laenge = (liste) => {
    const je = Math.ceil(runde / liste.length);
    return Math.min(runde, liste.reduce((n, s) => n + Math.min(je, alle.filter((a) => a.stelle === s).length), 0));
  };
  return [
    ...einmal(alle.map((a) => a.wort)).map((wort) => daten(wort, wo)),
    ...ergebnisse(ende, [laenge(leicht), laenge(stellen)], (p, von) => ({ "state.punkte": p, von })),
  ];
}

// ---------------------------------------------------------------------------
// Lies und tu!
// ---------------------------------------------------------------------------
// Setzen: jedes Tier an jede Stelle jedes Dings, das Platz hat (BREITE).
// Malen: jedes Ding, jede Farbe, eins bis drei Stück, auf «schwer» gross
// oder klein.
function liesundtu(d) {
  const D = "liesundtu.js";
  const { inhalte } = d;
  const runde = konstante(d, D, "RUNDE");
  const breite = konstante(d, D, "BREITE");
  const farben = konstante(d, D, "FARBEN");
  const maldinge = konstante(d, D, "MALDINGE");
  const zahlen = konstante(d, D, "ZAHLEN");
  for (const stueck of [
    "const ids = Object.keys(BREITE);",
    "const zahl = 1 + Math.floor(Math.random() * 3);",
    'zufall(["gross", "klein"])',
    'const artikel = ding.art === "m" ? "einen" : "eine";',
    'const adjektiv = groesse ? `${groesse}${ding.art === "m" ? "en" : "e"} ` : "";',
    "menge = `${artikel} ${adjektiv}${ding.eins}`;",
    'menge = `${ZAHLEN[zahl]} ${groesse ? `${groesse}e ` : ""}${ding.viele}`;',
  ]) stelle(d, D, stueck);
  const setz = vorlage(d, D, "Setz ${tier.wen} ${wo} ${ziel.wohin}.");
  const mal = vorlage(d, D, "Male ${menge} ${farbe.id} an.");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${von} Aufträgen gleich richtig ausgeführt.");
  const liste = [];
  for (const id of Object.keys(breite)) {
    const ding = inhalte.DINGE.find((x) => x.id === id);
    for (const wo of ding.wo) for (const tier of inhalte.TIERE) liste.push(setz.satz({ "tier.wen": tier.wen, wo, "ziel.wohin": ding.wohin }));
  }
  for (const ding of maldinge) {
    for (const farbe of farben) {
      for (const zahl of [1, 2, 3]) {
        for (const groesse of [null, "gross", "klein"]) {
          let menge;
          if (zahl === 1) {
            const artikel = ding.art === "m" ? "einen" : "eine";
            const adjektiv = groesse ? `${groesse}${ding.art === "m" ? "en" : "e"} ` : "";
            menge = `${artikel} ${adjektiv}${ding.eins}`;
          } else {
            menge = `${zahlen[zahl]} ${groesse ? `${groesse}e ` : ""}${ding.viele}`;
          }
          liste.push(mal.satz({ menge, "farbe.id": farbe.id }));
        }
      }
    }
  }
  liste.push(...ergebnisse(ende, [runde], (p, von) => ({ "state.punkte": p, von })));
  return liste;
}

// ---------------------------------------------------------------------------
// Lückensätze
// ---------------------------------------------------------------------------
// Jede Lage, die ins Bild passt (lesen-art.js, szenePasst, platzFuer): Tier,
// Ding, wo, was es tut, wie viele. Gesprochen wird der ganze Satz, wenn das
// richtige Wort gewählt ist; auf «leicht» liest die Stimme vorher die Teile
// vor und nach der Lücke. Mehrere Tiere gibt es nur auf «schwer» (MEHRZAHL
// oben). Ein falsches Wort liest die Stimme mit, als Frage («Die Eule singt
// unter dem Baum?») – jedes, das andere() zu einer Lücke anbietet.
function lueckensaetze(d) {
  const D = "lueckensaetze.js";
  const { inhalte } = d;
  const art = leseArt(d);
  const runde = konstante(d, D, "RUNDE");
  const fragen = konstante(d, D, "FRAGEN");
  stelle(d, D, "if (!art.szenePasst({ ding: ding.id, wo, tun })) continue;");
  stelle(d, D, "anzahl = 1 + Math.floor(Math.random() * platz);");
  stelle(d, D, "const anzahl = stufe() === \"leicht\" ? 1 : 2;");
  const ganz = vorlage(d, D, "${gesagt}.");
  const teilWo = stelle(d, D, "return ton.sprichFolge([vor, `${nach}.`]");
  const nachLuecke = vorlage(d, D, "${nach}.");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${von} Lücken gleich richtig gefüllt.");
  const lagen = [];
  const dinge = [...new Map(inhalte.DINGE.map((ding) => [ding.id, ding])).values()];
  for (const ding of dinge) {
    for (const wo of ding.wo) {
      for (const tun of inhalte.TUN.map((t) => t.id)) {
        if (!art.szenePasst({ ding: ding.id, wo, tun })) continue;
        const platz = art.platzFuer(ding.id, wo, tun);
        for (const tier of inhalte.TIERE) {
          for (const anzahl of reihe(1, MEHRZAHL ? platz : 1)) lagen.push({ tier: tier.id, ding: ding.id, wo, tun, anzahl });
        }
      }
    }
  }
  const liste = lagen.map((lage) => ganz.satz({ gesagt: inhalte.satzTeile(lage).map((teil) => teil.text).join(" ") }));
  // «leicht»: vor der Lücke, eine Pause, nach der Lücke. Nur ein Tier.
  for (const rolle of einmal(fragen.leicht)) {
    for (const lage of lagen.filter((l) => l.anzahl === 1)) {
      const teile = inhalte.satzTeile(lage);
      const i = teile.findIndex((teil) => teil.rolle === rolle);
      if (i < 0) continue;
      const vor = teile.slice(0, i).map((t) => t.text).join(" ");
      const nach = teile.slice(i + 1).map((t) => t.text).join(" ");
      if (vor) liste.push({ text: vor, wo: teilWo });
      if (nach) liste.push(nachLuecke.satz({ nach }));
    }
  }
  // Mit dem falschen Wort, je Stufe nur die Lücken, nach denen sie fragt.
  const frageWo = stelle(d, D, "await ton.sprich(`${gesagt}?`");
  const { andere } = funktionen(d, D, ["andere"], { inhalte, WO: konstante(d, D, "WO"), spiel: { mische: (l) => l } });
  for (const [stufe, rollen] of Object.entries(fragen)) {
    for (const lage of lagen.filter((l) => l.anzahl === 1 || stufe === "schwer")) {
      const teile = inhalte.satzTeile(lage);
      for (const rolle of new Set(rollen)) {
        if (rolle === "tun" && lage.tun === "steht") continue;
        const i = teile.findIndex((teil) => teil.rolle === rolle);
        if (i < 0) continue;
        for (const wort of andere(rolle, lage, teile[i].text)) {
          liste.push({ text: `${teile.map((teil, j) => (j === i ? wort : teil.text)).join(" ")}?`, wo: frageWo });
        }
      }
    }
  }
  liste.push(...ergebnisse(ende, Object.values(fragen).map((f) => f.slice(0, runde).length), (p, von) => ({ "state.punkte": p, von })));
  return liste;
}

// ---------------------------------------------------------------------------
// Postkarten
// ---------------------------------------------------------------------------
// Finos Karte und die der Reise: Sätze, Gruss (ohne Satzzeichen), auf
// «leicht» alles am Stück, die Frage, die richtige Antwort. Am Ende: von
// wem die nächste Karte kommt.
function postkarten(d) {
  const D = "postkarten.js";
  const runde = konstante(d, D, "RUNDE");
  const willkommen = konstante(d, D, "WILLKOMMEN");
  const karten = [willkommen, ...d.detektive.POSTKARTEN];
  const maps = d.reise?.MAPS || [];
  const satzWo = stelle(d, D, "ton.sprich(satz,");
  const leichtWo = stelle(d, D, 'ton.sprich([...k.text, k.gruss].join(" ")');
  const frageWo = stelle(d, D, "ton.sprich(f.frage,");
  const antwortWo = stelle(d, D, "ton.sprich(f.antworten[f.richtig]");
  const ende = vorlage(d, D, "Du hast ${state.punkte} von ${von} Fragen gleich richtig.");
  const hinweis = vorlage(d, D, " Die nächste Karte schreibt ${naechst.von}, wenn du die Karte «${ort.map.name}» bis zum Ziel fährst.");
  const liste = [];
  for (const k of karten) {
    liste.push(...[...k.text, k.gruss].map((satz) => daten(satz, satzWo)));
    liste.push(daten([...k.text, k.gruss].join(" "), leichtWo));
    liste.push(daten(k.frage.frage, frageWo), daten(k.frage.antworten[k.frage.richtig], antwortWo));
  }
  liste.push(...ergebnisse(ende, reihe(1, Math.min(runde, karten.length)), (p, von) => ({ "state.punkte": p, von })));
  for (const k of d.detektive.POSTKARTEN) {
    const map = maps.find((m) => m.id === k.karte);
    if (map) liste.push(hinweis.satz({ "naechst.von": k.von, "ort.map.name": map.name }));
  }
  return liste;
}

// ---------------------------------------------------------------------------
// Mein Name: nur der Name des Kindes und der seines Wurms wechseln – NICHT.
// ---------------------------------------------------------------------------

export default function texte(d) {
  return [
    lesenSpiel, lautOhneAufnahme, anlautlauscher, blitzwoerter, buchstabengleis, buchstabenhaus, buchstabensignal,
    detektivfaelle, geschichtenzug, lautekuppeln, lautposition, liesundtu, lueckensaetze, postkarten,
  ].flatMap((regel) => regel(d));
}

export const NICHT = [
  { wo: "meinname.js:356", warum: "der Name des Kindes, aus dem Kinderkonto oder von Hand eingetippt" },
  { wo: "meinname.js:376", warum: "am Ende der Runde der Name des Kindes allein («So heisst du:» und «Dein Name ist dreimal gefahren.» stehen fest)" },
  {
    wo: "meinname.js:467",
    warum: "der Name des Lesewurms, Buchstabe für Buchstabe gelegt (bis 8 aus 13 bis 20 Tasten) oder gewürfelt (Silbe, Silbe, vielleicht ein Mitlaut: 14'400 bis 90'000 Namen)",
  },
  { wo: "meinname.js:512", warum: "«Ich heisse …» mit dem Namen, den das Kind dem Lesewurm gibt («Hallo!» steht fest)" },
];
