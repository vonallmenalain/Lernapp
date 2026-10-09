/*
 * Leseecke, Gruppe B – was diese Spiele mit Wechselndem sagen: Wörter und
 * Silben aus den Listen, Sätze aus Bausteinen, «Du hast 5 von 8 …», und im
 * Bücherregal Titel, Kapitel, angetippte Wörter, Fragen und Antworten.
 * Feste Sätze findet stimme-app-texte.mjs selbst; hier steht nur, was die
 * Spiele zur Laufzeit zusammensetzen – genau so, wie der Code es tut.
 *
 * Dateien: quatschsaetze, quatschwoerter, reimkupplung, satzkuppeln,
 * silbenbahn, silbenzug, steckbriefe, stimmtdas, stolperwoerter, werbinich,
 * werfaehrtmit, woerterbauen, wortbaustelle, buecher.
 *
 * Grosse, aber endliche Mengen (Quatschtiere, Sätze mit mehreren Tieren)
 * lassen sich mit AUCH einzeln ausschalten; was dann fehlt, steht in NICHT,
 * mit seiner Grösse.
 */
import vm from "node:vm";

// Grosse Mengen: true nimmt sie in die Liste auf (Zeichen etwa, Stand der
// Daten beim Schreiben). Ausgeschaltet stehen sie in NICHT.
export const AUCH = {
  quatschtiere: true,          // silbenbahn: 917 «Und das ist eine Bamate!», ~23 000 Zeichen
  satzkuppelnSchwer: true,     // satzkuppeln, «schwer»: 570 Sätze mit 2–3 Tieren, ~19 000 Zeichen
};

const STUFEN = ["leicht", "mittel", "schwer"];

// Eine Konstante aus dem Quelltext eines Spiels: const NAME = …;
function konstante(d, datei, name) {
  const treffer = d.quelle(datei).match(new RegExp(`const ${name} = ([^;]+);`));
  if (!treffer) throw new Error(`leseecke-b: ${name} nicht gefunden in ${datei}`);
  return vm.runInNewContext(`(${treffer[1]})`);
}

// Die Zeile, in der ein Stück Code steht – für «wo».
function zeile(d, datei, stueck) {
  const nr = d.quelle(datei).split("\n").findIndex((z) => z.includes(stueck));
  return nr < 0 ? datei : `${datei}:${nr + 1}`;
}

// Die Zeichnungen der Leseecke (szenePasst, platzFuer für die Bildsätze).
function leseArt(d) {
  const knoten = () => ({ setAttribute() {}, append() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, toggle() {} } });
  const fenster = { addEventListener() {} };
  fenster.window = fenster;
  const dokument = { addEventListener() {}, createElementNS: knoten, createElement: knoten, querySelector: () => null, querySelectorAll: () => [] };
  vm.runInContext(d.quelle("lesen-art.js"), vm.createContext({ window: fenster, document: dokument, console }), { filename: "lesen-art.js" });
  return fenster.LernappLeseArt;
}

// Wie viele Aufgaben eine Runde hat, wenn sie aus einer Liste gezogen wird
// (spiel.ziehe): RUNDE, ausser die Liste ist kürzer.
const rundeVon = (runde, ...laengen) => [...new Set(laengen.map((n) => Math.min(runde, n)))];

// Alle Anordnungen einer Liste von Steinen (verschiedene als Text).
function anordnungen(steine) {
  const aus = new Set();
  const weiter = (rest, bisher) => {
    if (!rest.length) { aus.add(bisher); return; }
    rest.forEach((s, i) => weiter([...rest.slice(0, i), ...rest.slice(i + 1)], bisher + s));
  };
  weiter(steine, "");
  return aus;
}

export default function texte(d) {
  const I = d.inhalte;
  const bib = d.buecher;
  const art = leseArt(d);
  // Jeder Text einmal, mit der ersten Stelle, die ihn sagt.
  const aus = new Map();
  const sag = (text, wo) => { if (!aus.has(text)) aus.set(text, { text, wo }); };
  // «Du hast 3 von 8 …» für jede Punktzahl unter dem Ganzen (alles richtig
  // hat einen eigenen festen Satz).
  const ergebnis = (vonListe, satz, wo, ab = 0) => {
    for (const von of vonListe) for (let p = ab; p < von; p += 1) sag(satz(p, von), wo);
  };
  const aufZeit = (satz, wo) => { for (let p = 0; p <= 60; p += 1) sag(satz(p), wo); };

  // --- quatschsaetze.js ------------------------------------------------------
  {
    const f = "quatschsaetze.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const LAENGE = konstante(d, f, "LAENGE");
    const laengen = Object.values(LAENGE).map((max) => {
      const passend = I.SINN_SAETZE.filter((s) => s.satz.split(/\s+/).length <= max);
      return Math.min(RUNDE / 2, passend.filter((s) => s.sinn).length) + Math.min(RUNDE / 2, passend.filter((s) => !s.sinn).length);
    });
    // Der Satz selbst und «Das kann sein.» / «Das ist Quatsch!» stehen fest im Code.
    ergebnis([...new Set(laengen)], (p, von) => `Du hast ${p} von ${von} Sätzen richtig eingeordnet.`, zeile(d, f, "Sätzen richtig eingeordnet."));
  }

  // --- quatschwoerter.js -----------------------------------------------------
  {
    const f = "quatschwoerter.js";
    const RUNDE = konstante(d, f, "RUNDE");
    ergebnis([RUNDE], (p, von) => `Du hast ${p} von ${von} Monstern gleich richtig benannt.`, zeile(d, f, "Monstern gleich richtig benannt."));
    // Die Namen sind je Stufe eine feste Auswahl, die Schilder daneben je
    // Name immer dieselben – ausgerechnet mit namen() und aehnliche() aus dem
    // Spiel selbst. Gesagt wird «Ich heisse Lomu.», «Lumo? Nein.» (geteilt in
    // «Lumo?» und «Nein.») und «Ja! Ich bin Lomu!».
    const quelle = d.quelle(f);
    const stueck = (muster, was) => {
      const m = muster.exec(quelle);
      if (!m) throw new Error(`leseecke-b: ${was} nicht gefunden in ${f}`);
      return m[0];
    };
    const funktion = (name) => stueck(new RegExp(`\n  function ${name}\\([\\s\\S]*?\n  \\}\n`), `function ${name}`);
    const vorne = (wort) => wort.charAt(0).toUpperCase() + wort.slice(1);
    for (const stufe of STUFEN) {
      const spielfeld = vm.runInNewContext(`(() => {
        const stufe = () => ${JSON.stringify(stufe)};
        const SELBSTLAUTE = ${JSON.stringify(konstante(d, f, "SELBSTLAUTE"))};
        const MITLAUTE = ${JSON.stringify(konstante(d, f, "MITLAUTE"))};
        const NAMEN_JE_STUFE = ${konstante(d, f, "NAMEN_JE_STUFE")};
        const NAMEN_FRUEH = ${konstante(d, f, "NAMEN_FRUEH")};
        const NAMEN = {};
        const mitlaute = () => MITLAUTE[stufe()] || MITLAUTE.mittel;
        ${stueck(/\n {2}const ECHTE = new Set\(\[[\s\S]*?\]\);\n/, "ECHTE")}
        ${funktion("zahlVon")} ${funktion("namen")} ${funktion("bekannt")} ${funktion("aehnliche")}
        return { namen, aehnliche };
      })()`, { inhalte: I });
      for (const name of spielfeld.namen(stufe)) {
        sag(`Ich heisse ${vorne(name)}.`, zeile(d, f, "Ich heisse ${"));
        sag(`Ja! Ich bin ${vorne(name)}!`, zeile(d, f, "Ja! Ich bin ${"));
        for (const anders of spielfeld.aehnliche(name)) sag(`${vorne(anders)}? Nein.`, zeile(d, f, "? Nein.`"));
      }
    }
  }

  // --- reimkupplung.js -------------------------------------------------------
  {
    const f = "reimkupplung.js";
    const RUNDE = konstante(d, f, "RUNDE");
    for (const gruppe of I.REIME) {
      for (const ziel of gruppe.woerter) {
        // Allein: angetippt, und beim falschen Wagen mit dem anderen Wort
        // nacheinander (sprichFolge).
        sag(ziel.wort, zeile(d, f, "ton.sprich(state.aufgabe.ziel.wort"));
        sag(`Was reimt sich auf ${ziel.wort}?`, zeile(d, f, "Was reimt sich auf ${"));
        for (const reim of gruppe.woerter) if (reim !== ziel) sag(`${ziel.wort} – ${reim.wort}!`, zeile(d, f, "${eintrag.wort}!`"));
      }
    }
    ergebnis(rundeVon(RUNDE, I.REIME.length), (p, von) => `Du hast ${p} von ${von} Reimen gleich gefunden.`, zeile(d, f, "Reimen gleich gefunden.`"));
  }

  // --- satzkuppeln.js und stimmtdas.js: Sätze zum Bild -----------------------
  // Alle Lagen, die die Spiele würfeln können: Ding, wo, was die Tiere tun
  // (nur wenn es ins Bild passt) und wie viele Platz haben.
  const lagen = [];
  for (const ding of I.DINGE) for (const wo of ding.wo) for (const tun of I.TUN) {
    if (!art.szenePasst({ ding: ding.id, wo, tun: tun.id })) continue;
    for (const tier of I.TIERE) for (let anzahl = 1; anzahl <= art.platzFuer(ding.id, wo, tun.id); anzahl += 1) {
      lagen.push({ tier: tier.id, ding: ding.id, wo, anzahl, tun: tun.id });
    }
  }
  {
    const f = "satzkuppeln.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const wo = zeile(d, f, "await ton.sprich(a.satz");
    const woWort = zeile(d, f, "a.woerter[i].replace");
    // Wie woerter(lage): auf «leicht» nur wer und was er tut.
    const woerter = (lage, stufe) => {
      const teile = I.satzTeile(lage);
      const kurz = stufe === "leicht" ? teile.filter((t) => ["artikel", "anzahl", "tier", "tun"].includes(t.rolle)) : teile;
      const liste = kurz.flatMap((t) => t.text.split(" "));
      liste[liste.length - 1] += ".";
      return liste;
    };
    for (const stufe of STUFEN) {
      for (const lage of lagen) {
        if (stufe !== "schwer" && lage.anzahl > 1) continue;
        const liste = woerter(lage, stufe);
        // Ein Wagen, der nicht passt: sein Wort ohne Punkt.
        liste.forEach((w) => sag(w.replace(/\.$/, ""), woWort));
        // Der ganze Satz. Mit mehreren Tieren nur die, die stehen (auch
        // «So stimmt es:» in Stimmt das?), sonst nur mit AUCH.
        if (stufe === "schwer" && lage.anzahl > 1 && lage.tun !== "steht" && !AUCH.satzkuppelnSchwer) continue;
        sag(liste.join(" "), wo);
      }
    }
    ergebnis([RUNDE], (p, von) => `Du hast ${p} von ${von} Sätzen gleich richtig gekuppelt.`, zeile(d, f, "Sätzen gleich richtig gekuppelt.`"));
  }
  {
    const f = "stimmtdas.js";
    const RUNDE = konstante(d, f, "RUNDE");
    // Hier stehen die Tiere immer. «leicht» liest den gesagten Satz vor (eine
    // Lage mit einem Tier, ein Stück darf abweichen – wieder eine mögliche
    // Lage); «So stimmt es:» sagt auf jeder Stufe die Wahrheit, auf «schwer»
    // mit bis zu so vielen Tieren, wie Platz haben.
    sag("So stimmt es:", zeile(d, f, "`So stimmt es: ${state.aufgabe.richtig}`"));
    for (const ding of I.DINGE) for (const wo of ding.wo) for (const tier of I.TIERE) {
      for (let anzahl = 1; anzahl <= art.platzFuer(ding.id, wo); anzahl += 1) {
        sag(I.satzZurLage({ tier: tier.id, ding: ding.id, wo, anzahl, tun: "steht" }), zeile(d, f, anzahl > 1 ? "`So stimmt es: ${state.aufgabe.richtig}`" : "ton.sprich(state.aufgabe.text"));
      }
    }
    ergebnis([RUNDE], (p, von) => `Du hast ${p} von ${von} Sätzen richtig geprüft.`, zeile(d, f, "Sätzen richtig geprüft.`"));
    aufZeit((p) => `Die Zeit ist um. Du hast ${p} ${p === 1 ? "Satz" : "Sätze"} richtig geprüft.`, zeile(d, f, "Die Zeit ist um."));
  }

  // --- silbenbahn.js ---------------------------------------------------------
  {
    const f = "silbenbahn.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const SILBEN = konstante(d, f, "SILBEN");
    const listen = STUFEN.map((s) => I.SILBEN_WOERTER.filter((w) => w.silben.length >= SILBEN[s][0] && w.silben.length <= SILBEN[s][1]));
    for (const w of new Set(listen.flat())) {
      sag(w.wort, zeile(d, f, "ton.sprich(state.wort.wort"));
      w.silben.forEach((silbe) => sag(silbe.toLowerCase(), zeile(d, f, "ton.sprich(silbe.toLowerCase()")));
    }
    if (AUCH.quatschtiere) {
      // Wie quatsch(a, b): die erste Silbe des einen, der Rest des anderen –
      // aus zwei Wörtern derselben Runde (derselben Liste).
      const quatsch = (a, b) => {
        if (a.silben.length < 2 || b.silben.length < 2) return null;
        const wort = `${a.silben[0]}${b.silben.slice(1).join("").toLowerCase()}`;
        return wort === a.wort || wort === b.wort ? null : wort;
      };
      for (const liste of listen) for (const a of liste) for (const b of liste) {
        if (a === b) continue;
        const tier = quatsch(a, b) || quatsch(b, a);
        if (tier) sag(`Und das ist eine ${tier}!`, zeile(d, f, "Und das ist eine ${"));
      }
    }
    ergebnis(rundeVon(RUNDE, ...listen.map((l) => l.length)), (p, von) => `Du hast ${p} von ${von} Wörtern gleich richtig gekuppelt.`, zeile(d, f, "Wörtern gleich richtig gekuppelt.`"));
  }

  // --- silbenzug.js ----------------------------------------------------------
  {
    const f = "silbenzug.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const ZAHL = konstante(d, f, "ZAHL");
    const woerter = new Set(STUFEN.flatMap((s) => {
      const [min, max] = I.SILBEN_JE_STUFE[s] || [1, 4];
      return I.SILBEN_WOERTER.filter((w) => w.silben.length >= min && w.silben.length <= max);
    }));
    for (const w of woerter) {
      sag(w.wort, zeile(d, f, "ton.sprich(state.wort.wort"));
      // Die Silben, wie sie in der Liste stehen (nicht klein geschrieben).
      w.silben.forEach((silbe) => sag(silbe, zeile(d, f, "ton.sprich(silben[i]")));
      sag(`${w.wort} hat ${ZAHL[w.silben.length]} ${w.silben.length === 1 ? "Silbe" : "Silben"}.`, zeile(d, f, " hat ${ZAHL["));
    }
    ergebnis([RUNDE], (p, von) => `${p} von ${von} Zügen hatten genau richtig viele Wagen.`, zeile(d, f, "Zügen hatten genau richtig viele Wagen.`"));
  }

  // --- steckbriefe.js --------------------------------------------------------
  {
    const f = "steckbriefe.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const ZEILEN = konstante(d, f, "ZEILEN");
    const det = d.detektive;
    for (const b of det.STECKBRIEFE) {
      // «Wohnt: in Bambuswäldern …» – kids.js sucht zuerst die ganze Zeile,
      // dann teilt es am Doppelpunkt. Ist der Text ein ganzer Satz (fest in
      // den Daten), reicht «Besonders:» allein.
      ZEILEN.forEach((feld) => {
        const kopf = `${det.FELDER[feld]}:`;
        const ganzerSatz = /^[A-ZÄÖÜ]/.test(b[feld]) && /[.!?…]$/.test(b[feld]);
        sag(ganzerSatz ? kopf : `${kopf} ${b[feld]}`, zeile(d, f, "ton.sprich(`${det.FELDER[feld]}: ${b[feld]}`"));
      });
      b.fragen.forEach((frage) => sag(frage.antworten[frage.richtig], zeile(d, f, "ton.sprich(f.antworten[f.richtig]")));
    }
    // Zwei Steckbriefe, zusammen so viele Fragen, wie sie haben.
    const fragen = det.STECKBRIEFE.map((b) => b.fragen.length);
    const von = new Set();
    fragen.forEach((a, i) => fragen.forEach((b, j) => { if (i !== j) von.add(a + b); }));
    if (RUNDE !== 2) throw new Error("leseecke-b: steckbriefe RUNDE ist nicht mehr 2");
    ergebnis([...von], (p, n) => `Du hast ${p} von ${n} Fragen gleich richtig beantwortet.`, zeile(d, f, "Fragen gleich richtig beantwortet.`"));
  }

  // --- stolperwoerter.js -----------------------------------------------------
  {
    const f = "stolperwoerter.js";
    const RUNDE = konstante(d, f, "RUNDE");
    // Der Satz ohne Stein (danach) steht fest in SINN_SAETZE oder im Buch.
    // Den Satz mit Stein liest der Lautsprecher: je Satz VARIANTEN feste
    // Fassungen – ausgerechnet mit saetze() und aufgabe() aus dem Spiel selbst.
    const sinn = I.SINN_SAETZE.filter((s) => s.sinn).length;
    const quelle = d.quelle(f);
    const stueck = (name) => {
      const m = new RegExp(`\n  function ${name}\\([\\s\\S]*?\n  \\}\n`).exec(quelle);
      if (!m) throw new Error(`leseecke-b: function ${name} nicht gefunden in ${f}`);
      return m[0];
    };
    const lesVorWo = zeile(d, f, "await ton.sprich(state.aufgabe.woerter.join");
    for (const stufe of STUFEN) {
      const spielfeld = vm.runInNewContext(`(() => {
        const stufe = () => ${JSON.stringify(stufe)};
        const VARIANTEN = ${konstante(d, f, "VARIANTEN")};
        ${stueck("saetze")} ${stueck("zahlVon")} ${stueck("aufgabe")}
        return { saetze, aufgabe, VARIANTEN };
      })()`, { inhalte: I, window: { LernappLeseBuecher: d.buecher } });
      for (const satz of spielfeld.saetze()) {
        for (let v = 0; v < spielfeld.VARIANTEN; v += 1) sag(spielfeld.aufgabe(satz, v).woerter.join(" "), lesVorWo);
      }
    }
    ergebnis(rundeVon(RUNDE, sinn), (p, von) => `Du hast ${p} von ${von} Stolpersteinen gleich gefunden.`, zeile(d, f, "Stolpersteinen gleich gefunden.`"));
    aufZeit((p) => `Die Zeit ist um. Du hast ${p} ${p === 1 ? "Stolperstein" : "Stolpersteine"} gefunden.`, zeile(d, f, "Stolpersteine\"} gefunden.`"));
  }

  // --- werbinich.js ----------------------------------------------------------
  {
    const f = "werbinich.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const PUNKTE_MAX = konstante(d, f, "PUNKTE_MAX");
    I.RAETSEL.forEach((r) => sag(`Ich bin ${r.wer}.`, zeile(d, f, "Ich bin ${r.wer}.")));
    // Jedes gelöste Rätsel bringt mindestens einen Punkt.
    const n = Math.min(RUNDE, I.RAETSEL.length);
    ergebnis([n * PUNKTE_MAX], (p, von) => `Du hast ${p} von ${von} Punkten.`, zeile(d, f, "Punkten.`"), n);
  }

  // --- werfaehrtmit.js -------------------------------------------------------
  {
    const f = "werfaehrtmit.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const listen = [...STUFEN.map((s) => I.KUPPEL_WOERTER.filter((w) => (I.KUPPELN_JE_STUFE[s] || [1, 2]).includes(w.stufe))), I.KUPPEL_WOERTER];
    // Das Wort der Fahrkarte (nach der richtigen Wahl).
    I.KUPPEL_WOERTER.forEach((w) => sag(w.wort, zeile(d, f, "ton.sprich(a.wort.wort")));
    // Wer falsch einsteigen wollte: einer der sechs ähnlichsten (mit bis zu
    // 0.3 Zufall) – jeder, vor dem nicht schon sechs sicher liegen.
    const pool = I.bildWoerter();
    const abstand = (a, b) => {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
      const z = Array.from({ length: y.length + 1 }, (_, i) => i);
      for (let i = 1; i <= x.length; i += 1) {
        let vorher = z[0];
        z[0] = i;
        for (let j = 1; j <= y.length; j += 1) {
          const merk = z[j];
          z[j] = Math.min(z[j] + 1, z[j - 1] + 1, vorher + (x[i - 1] === y[j - 1] ? 0 : 1));
          vorher = merk;
        }
      }
      return z[y.length];
    };
    const aehnlich = (ziel, anderes) => -abstand(ziel, anderes) + (ziel[0].toLowerCase() === anderes[0].toLowerCase() ? 1.5 : 0) + (Math.abs(ziel.length - anderes.length) <= 1 ? 0.5 : 0);
    const falsch = new Set();
    for (const ziel of I.KUPPEL_WOERTER) {
      const kandidaten = pool.filter((w) => w.wort !== ziel.wort && w.bild !== ziel.bild).map((w) => ({ wort: w.wort, wert: aehnlich(ziel.wort, w.wort) }));
      for (const k of kandidaten) if (kandidaten.filter((o) => o.wert >= k.wert + 0.3).length < 6) falsch.add(k.wort);
    }
    falsch.forEach((w) => sag(w, zeile(d, f, "ton.sprich(eintrag.wort")));
    ergebnis(rundeVon(RUNDE, ...listen.map((l) => l.length)), (p, von) => `Du hast ${p} von ${von} Fahrkarten gleich richtig gelesen.`, zeile(d, f, "Fahrkarten gleich richtig gelesen.`"));
  }

  // --- woerterbauen.js -------------------------------------------------------
  {
    const f = "woerterbauen.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const MAX_STEINE = konstante(d, f, "MAX_STEINE");
    // Was daliegt, wie pruefe() es vorliest: vorne gross, sonst klein.
    const vorlesen = (gelegt) => gelegt.charAt(0).toUpperCase() + gelegt.slice(1).toLowerCase();
    const steine = (w) => I.steineDerSilben(w.silben).flat();
    const kurz = (s) => I.KUPPEL_WOERTER.filter((w) => steine(w).length <= (MAX_STEINE[s] || 5));
    // Ohne abgehakte Buchstaben die Gruppen der Stufe; mit ihnen alle
    // kurzen Wörter der Stufe (lesbare).
    const laengen = STUFEN.flatMap((s) => [kurz(s).filter((w) => (I.KUPPELN_JE_STUFE[s] || [1, 2]).includes(w.stufe)).length, kurz(s).length]);
    for (const w of new Set(STUFEN.flatMap(kurz))) {
      sag(w.wort, zeile(d, f, "ton.sprich(state.wort.wort"));
      sag(vorlesen(steine(w).join("")), zeile(d, f, "await ton.sprich(vorlesen"));
      // Jede Anordnung der Steine («Sfoa»): bis 6 Steine gut 3800 kurze Wörter.
      for (const gelegt of anordnungen(steine(w))) sag(vorlesen(gelegt), zeile(d, f, "await ton.sprich(vorlesen"));
    }
    ergebnis(rundeVon(RUNDE, ...laengen), (p, von) => `Du hast ${p} von ${von} Wörtern gleich richtig gelegt.`, zeile(d, f, "Wörtern gleich richtig gelegt.`"));
  }

  // --- wortbaustelle.js ------------------------------------------------------
  {
    const f = "wortbaustelle.js";
    const RUNDE = konstante(d, f, "RUNDE");
    const klein = (teil) => teil.charAt(0).toLowerCase() + teil.slice(1);
    for (const b of I.BAUSTELLE) {
      // «leicht»: «Schnee. Welcher Teil passt dazu?»
      sag(`${b.teile[0]}.`, zeile(d, f, ". Welcher Teil passt dazu?`"));
      // Ein falscher Teil: «Schneefisch? Das gibt es nicht.»
      b.falsch.forEach(([wort]) => sag(`${b.teile[0]}${klein(wort)}?`, zeile(d, f, "? Das gibt es nicht.`")));
      // Zerlegen auf «mittel»: das lange Wort.
      sag(b.wort, zeile(d, f, "ton.sprich(a.wort"));
      sag(`${b.teile[0]} und ${b.teile[1]}: ${b.wort}.`, zeile(d, f, " und ${a.teile[1]}: ${a.wort}.`"));
    }
    ergebnis(rundeVon(RUNDE, I.BAUSTELLE.length), (p, von) => `Du hast ${p} von ${von} Wörtern gleich richtig gebaut oder zerlegt.`, zeile(d, f, "Wörtern gleich richtig gebaut oder zerlegt.`"));
  }

  // --- buecher.js ------------------------------------------------------------
  {
    const f = "buecher.js";
    const HELP_SEITE = konstante(d, f, "HELP_SEITE");
    const HELP_SEITE_OHNE = konstante(d, f, "HELP_SEITE_OHNE");
    // Beim Nachsehen aus den Fragen: «Hier steht es. … Der Pfeil führt zurück zur Frage.»
    for (const hilfe of new Set([...Object.values(HELP_SEITE), ...Object.values(HELP_SEITE_OHNE)])) {
      sag(`Hier steht es. ${hilfe} Der Pfeil führt zurück zur Frage.`, zeile(d, f, "`Hier steht es. ${hilfe}"));
    }
    for (const buch of bib.BUECHER) {
      sag(buch.titel, zeile(d, f, "ton.sprich(buch.titel"));
      let kapitel = 0;
      for (const seite of buch.seiten) {
        // «Kapitel 2. Der Sturm.» – eine Frage bleibt eine Frage.
        if (seite.kapitel) {
          kapitel += 1;
          sag(`Kapitel ${kapitel}. ${seite.kapitel}${/[.!?]$/.test(seite.kapitel) ? "" : "."}`, zeile(d, f, "return `Kapitel ${"));
        }
        // Satz für Satz, wie bib.saetze teilt (nur vor einem grossen
        // Anfang); kids.js teilt feiner – das Verzeichnis zerlegt jeden wie
        // kids.js, so kommen auch Stücke wie «sagt der Hase.» dazu.
        for (const satz of bib.saetze(seite.text)) {
          sag(satz, zeile(d, f, "return ton.sprich(satz"));
          // Ein angetipptes Wort: ohne Satzzeichen, gross oder klein wie im Text.
          bib.woerter(satz).forEach((token) => { const wort = bib.nurWort(token); if (wort) sag(wort, zeile(d, f, "ton.sprich(knopf.dataset.wort")); });
        }
      }
      for (const frage of buch.fragen) {
        // Beim Vorlesen und im Hörbuch: «Was mag Leo? Bananen, Melonen oder Rüebli?»
        if (frage.antworten.every((a) => !a.bild && !a.figur)) {
          const teile = frage.antworten.map((a) => a.text.replace(/[.!?]$/, ""));
          sag(`${frage.frage} ${teile.slice(0, -1).join(", ")} oder ${teile[teile.length - 1]}?`, zeile(d, f, "oder ${teile[teile.length - 1]}?`"));
        }
        sag(frage.antworten[frage.richtig].text, zeile(d, f, "await ton.sprich(frage.antworten[i].text"));
      }
      // «Du hast das Buch angehört: Titel. 2 von 3 Fragen waren gleich richtig.»
      // Ein Hörbuch wird nur vorgelesen (angehört).
      const wo = zeile(d, f, "Du hast das Buch angehört");
      // Ein Titel mit Fragezeichen bekommt keinen Punkt dazu.
      const titel = `${buch.titel}${/[.!?…]$/.test(buch.titel) ? "" : "."}`;
      sag(`Du hast das Buch angehört: ${titel}`, wo);
      if (buch.stufe !== "hoerbuch") sag(`Du hast das Buch gelesen: ${titel}`, wo);
      for (let p = 0; p < buch.fragen.length; p += 1) sag(`${p} von ${buch.fragen.length} Fragen waren gleich richtig.`, wo);
    }
  }

  return [...aus.values()];
}

// Was sich nicht vorher aufnehmen lässt – oder was hier zu viel wäre.
export const NICHT = [
  ...(AUCH.satzkuppelnSchwer ? [] : [{
    wo: "satzkuppeln.js:192",
    warum: "Auf «schwer» der fertige Satz mit 2–3 Tieren, die nicht stehen («Drei Pandas singen auf dem Bett.»): 570 Sätze (~19 000 Zeichen) – nur mit AUCH.satzkuppelnSchwer.",
  }]),
  ...(AUCH.quatschtiere ? [] : [{
    wo: "silbenbahn.js:188",
    warum: "Das Quatschtier «Und das ist eine Bamate!» aus zwei Wörtern der Runde: 917 Tiere (~23 000 Zeichen) – nur mit AUCH.quatschtiere.",
  }]),
];
