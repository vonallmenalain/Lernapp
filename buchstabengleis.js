/*
 * buchstabengleis.js – Der Buchstabe liegt als Gleis da.
 *
 * Das Kind fährt die eigene Lok mit dem Finger über das Gleis, Strich für
 * Strich und in Schreibrichtung: Wo der nächste Strich beginnt, wartet ein
 * grüner Punkt mit seiner Zahl, ein Pfeil zeigt, wohin es geht, am Ende
 * steht ein rotes Signal. Die Lok folgt dem Finger nur auf dem Gleis und nur
 * vorwärts – wer abkommt, setzt wieder bei der Lok an. Punkte (i, j, ä)
 * werden angetippt. Das Auge macht den Strich einmal vor.
 *
 * Ist der Buchstabe ganz gefahren, leuchtet er auf, und die Stimme sagt
 * seinen Laut und sein Wort. Eine Runde sind sechs Buchstaben aus dem
 * Buchstabenhaus dieses Kindes – sieht es auch kleine Buchstaben, je einer
 * gross und gleich danach klein. Wie ein Buchstabe geschrieben wird, steht
 * in lesen-inhalte.js (GLEISE).
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "buchstabengleis") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "buchstabengleis";
  const RUNDE = 6;
  const SCHRITT = 1.5;   // Abstand der Punkte, die auf einem Strich gemerkt werden
  const NAEHE = 18;      // so nah muss der Finger am Gleis sein, damit die Lok folgt
  const WEG = 40;        // weiter weg: entgleist
  const VORAUS = 36;     // so weit vor der Lok darf der Finger sein
  const PUNKT = 4;       // ein kürzerer Strich ist ein Punkt zum Antippen
  const RAND = 34;       // Platz um den Buchstaben herum (Gleisbett, Startpunkt, Zahl)

  const HELP = [
    "Buchstabengleis. Fahr mit dem Finger die Lok über das Gleis.",
    "Fang beim grünen Punkt an und fahr in Pfeilrichtung bis zum roten Signal. Einen Punkt tippst du an.",
    "Das Auge zeigt dir den Weg.",
  ].join(" ");

  // ---------------------------------------------------------------------------
  // Welche Buchstaben
  // ---------------------------------------------------------------------------
  function buchstabenListe() {
    const gruppe = inhalte.GRUPPE_JE_LESESTUFE[stand?.lesestufe?.() || "buchstaben"] || 3;
    return inhalte.hausLaute(stand?.bekannteLaute?.() || null, gruppe)
      .filter((laut) => inhalte.GLEISE[laut.gross] && inhalte.GLEISE[laut.klein]);
  }

  function neueRunde() {
    const gross = stand?.nurGross?.() ?? false;
    const laute = spiel.ziehe(buchstabenListe(), gross ? RUNDE : RUNDE / 2);
    return laute.flatMap((laut) => (gross
      ? [{ laut, zeichen: laut.gross }]
      : [{ laut, zeichen: laut.gross }, { laut, zeichen: laut.klein }]));
  }

  // ---------------------------------------------------------------------------
  // Ein Strich als Folge von Punkten
  // ---------------------------------------------------------------------------
  // Gemessen wird mit einem Pfad, der kurz im Dokument hängt: So kennt jeder
  // Browser seine Länge.
  let messer = null;
  function abtasten(d) {
    if (!messer) {
      messer = art.el("svg", { width: 0, height: 0, "aria-hidden": "true", style: "position:absolute;left:-9999px" });
      document.body.append(messer);
    }
    const pfad = art.el("path", { d });
    messer.append(pfad);
    const laenge = pfad.getTotalLength();
    const punkte = [];
    for (let s = 0; s < laenge; s += SCHRITT) {
      const p = pfad.getPointAtLength(s);
      punkte.push({ x: p.x, y: p.y, s });
    }
    const ende = pfad.getPointAtLength(laenge);
    punkte.push({ x: ende.x, y: ende.y, s: laenge });
    pfad.remove();
    return { d, laenge, punkte, punkt: laenge < PUNKT };
  }

  // Die Richtung eines Strichs an einer Stelle, in Grad.
  function richtung(strich, i) {
    const a = strich.punkte[Math.max(0, i - 3)];
    const b = strich.punkte[Math.min(strich.punkte.length - 1, i + 3)];
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  }

  const abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // ---------------------------------------------------------------------------
  // Zustand und Bühne
  // ---------------------------------------------------------------------------
  const state = {
    nr: 0, punkte: 0, phase: "intro", runde: [], aufgabe: null,
    striche: [], strich: 0, pos: 0, faehrt: false, entgleist: 0, zeigt: false,
  };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const brett = shell.el("div", "bg-brett");
    const seite = shell.el("div", "bg-seite");
    const zeichen = shell.el("p", "bg-zeichen");
    const wort = shell.el("p", "bg-wort");
    const zeig = shell.el("button", "bg-zeig", "👁️");
    zeig.type = "button";
    zeig.setAttribute("aria-label", "Den Weg zeigen");
    zeig.addEventListener("click", vormachen);
    seite.append(zeichen, wort, zeig);
    const reihe = shell.el("div", "bg-reihe");
    reihe.append(brett, seite);
    shell.play.append(reihe);
    el = { brett, zeichen, wort, zeig };
  }

  // Ein Gleis: Schotter, Schienen, Schwellen – und darin, grün, was schon
  // gefahren ist.
  function gleis(d, { fertig = false } = {}) {
    const rund = { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
    const gefahren = art.el("path", { d, ...rund, stroke: "#3fbf74", "stroke-width": 8, class: "bg-gefahren" });
    return {
      gruppe: art.group({ class: `bg-strich${fertig ? " ist-fertig" : ""}` }, [
        art.el("path", { d, ...rund, stroke: "#e7d7bb", "stroke-width": 26 }),
        art.el("path", { d, ...rund, stroke: "#4a5160", "stroke-width": 13 }),
        art.el("path", { d, ...rund, stroke: "#efe3cc", "stroke-width": 8 }),
        art.el("path", { d, fill: "none", stroke: "#a8794e", "stroke-width": 8, "stroke-dasharray": "2.2 5" }),
        gefahren,
      ]),
      gefahren,
    };
  }

  function zeichneBrett() {
    const a = state.aufgabe;
    const alle = state.striche.flatMap((s) => s.punkte);
    const xs = alle.map((p) => p.x);
    const ys = alle.map((p) => p.y);
    const x0 = Math.min(...xs) - RAND;
    const y0 = Math.min(...ys) - RAND;
    const breite = Math.max(...xs) - Math.min(...xs) + RAND * 2;
    const hoehe = Math.max(...ys) - Math.min(...ys) + RAND * 2;
    const svg = art.el("svg", { viewBox: `${x0} ${y0} ${breite} ${hoehe}`, class: "bg-svg", role: "img", "aria-label": `Der Buchstabe ${a.zeichen} als Gleis` });
    // Hilfslinien wie im Schulheft: Grundlinie, und für die Kleinen die Mittellänge.
    svg.append(art.el("line", { x1: x0, y1: 110, x2: x0 + breite, y2: 110, stroke: "#b8c4d4", "stroke-width": 1.5 }));
    svg.append(art.el("line", { x1: x0, y1: 50, x2: x0 + breite, y2: 50, stroke: "#dbe3ec", "stroke-width": 1.2, "stroke-dasharray": "4 4" }));
    const ebene = art.group({}, []);
    const marken = art.group({ class: "bg-marken" }, []);
    // Die eigene Lok: knapp ein Drittel so hoch wie der Buchstabe, höchstens
    // 30 – bei einem kleinen e deckte sie sonst die Hälfte zu. Aussen die
    // Stelle auf dem Gleis, innen das Wackeln – eine CSS-Bewegung am äusseren
    // Teil würde die Stelle überschreiben.
    const h = Math.round(Math.min(30, Math.max(20, (Math.max(...ys) - Math.min(...ys)) * 0.3)));
    const innen = art.group({ class: "bg-lok-innen" }, [art.el("circle", { cx: 0, cy: 0, r: Math.round(h * 0.8), class: "bg-halo" })]);
    const lok = art.group({ class: "bg-lok" }, [innen]);
    const eigene = spiel.eigeneLok();
    const zug = window.LernappTrainArt;
    if (eigene && zug) {
      const w = h * zug.LOCO_W / zug.ART_H;
      // Lage und Grösse als Attribute, nicht als CSS: Safari kennt die
      // CSS-Grösse einer Zeichnung in einer Zeichnung nicht, nahm die ganze
      // Tafel – und die Lok verdeckte den Buchstaben. Ohne die Klasse
      // lese-lok greift auch deren Höhe aus dem Stylesheet nicht.
      eigene.classList.remove("lese-lok");
      eigene.setAttribute("x", String(-w / 2));
      eigene.setAttribute("y", String(-h / 2 - 4));
      eigene.setAttribute("width", String(w));
      eigene.setAttribute("height", String(h));
      innen.append(eigene);
    } else {
      innen.append(art.el("circle", { cx: 0, cy: 0, r: 12, fill: "#c4553a", stroke: "#fff", "stroke-width": 3 }));
    }
    const geist = art.el("circle", { r: 9, fill: "#ffd166", stroke: "#ffffff", "stroke-width": 3, class: "bg-geist", opacity: "0" });
    svg.append(ebene, marken, geist, lok);
    state.striche.forEach((strich, i) => {
      if (strich.punkt) return;
      const g = gleis(strich.d, { fertig: i < state.strich });
      strich.gefahren = g.gefahren;
      strich.gefahren.setAttribute("stroke-dasharray", `${strich.laenge} ${strich.laenge + 10}`);
      strich.gefahren.setAttribute("stroke-dashoffset", i < state.strich ? "0" : String(strich.laenge));
      ebene.append(g.gruppe);
    });
    // Punkte liegen über den Gleisen.
    state.striche.forEach((strich, i) => {
      if (!strich.punkt) return;
      const p = strich.punkte[0];
      strich.knopf = art.el("circle", { cx: p.x, cy: p.y, r: 9, class: `bg-punkt${i < state.strich ? " ist-fertig" : ""}`, fill: i < state.strich ? "#3fbf74" : "#4a5160" });
      ebene.append(strich.knopf);
    });
    el.brett.innerHTML = "";
    el.brett.append(svg);
    el.svg = svg;
    el.marken = marken;
    el.lok = lok;
    el.lokInnen = innen;
    el.geist = geist;
    svg.addEventListener("pointerdown", druecken);
    svg.addEventListener("pointermove", ziehen);
    svg.addEventListener("pointerup", loslassen);
    svg.addEventListener("pointercancel", loslassen);
    zeichneMarken();
  }

  // Startpunkt mit Zahl, Pfeil und Signal – nur am Strich, der dran ist.
  function zeichneMarken() {
    el.marken.innerHTML = "";
    const strich = state.striche[state.strich];
    if (!strich) { el.lok.setAttribute("visibility", "hidden"); return; }
    const start = strich.punkte[0];
    if (strich.punkt) {
      el.lok.setAttribute("visibility", "hidden");
      el.marken.append(art.el("circle", { cx: start.x, cy: start.y, r: 14, fill: "none", stroke: "#3fbf74", "stroke-width": 4, class: "bg-tipp" }));
      return;
    }
    // Die Zahl steht vor dem Anfang, dort, wo die Lok herkommt – auf dem
    // Anfang selbst steht ja die Lok.
    const w = richtung(strich, 0) * Math.PI / 180;
    const nummer = { x: start.x - Math.cos(w) * 21, y: start.y - Math.sin(w) * 21 };
    const zahl = art.el("text", { x: nummer.x, y: nummer.y + 4.5, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#ffffff", "font-family": "Inter, system-ui, sans-serif" });
    zahl.textContent = String(state.strich + 1);
    const i = Math.min(strich.punkte.length - 1, Math.round(26 / SCHRITT));
    const pfeil = strich.punkte[i];
    const ende = strich.punkte[strich.punkte.length - 1];
    el.marken.append(
      art.el("circle", { cx: start.x, cy: start.y, r: 12, fill: "none", stroke: "#3fbf74", "stroke-width": 4 }),
      art.el("path", { d: "M-7 -6 L7 0 L-7 6 Z", fill: "#2f6fd0", transform: `translate(${pfeil.x} ${pfeil.y}) rotate(${richtung(strich, i)})` }),
      art.el("circle", { cx: ende.x, cy: ende.y, r: 7, fill: "#e8543f", stroke: "#ffffff", "stroke-width": 2.5 }),
      art.el("circle", { cx: nummer.x, cy: nummer.y, r: 9, fill: "#3fbf74", stroke: "#ffffff", "stroke-width": 2.5 }),
      zahl,
    );
    state.pos = 0;
    setzeLok();
  }

  function setzeLok() {
    const strich = state.striche[state.strich];
    if (!strich || strich.punkt) return;
    const p = strich.punkte[state.pos];
    // Fährt die Lok nach links, schaut sie nach links.
    const links = Math.abs(richtung(strich, state.pos)) > 100;
    el.lok.setAttribute("visibility", "visible");
    el.lok.setAttribute("transform", `translate(${p.x} ${p.y})${links ? " scale(-1 1)" : ""}`);
    strich.gefahren?.setAttribute("stroke-dashoffset", String(Math.max(0, strich.laenge - p.s)));
  }

  // ---------------------------------------------------------------------------
  // Fahren
  // ---------------------------------------------------------------------------
  function svgPunkt(ereignis) {
    const m = el.svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(ereignis.clientX, ereignis.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function druecken(ereignis) {
    if (state.phase !== "fahren") return;
    const strich = state.striche[state.strich];
    if (!strich) return;
    const p = svgPunkt(ereignis);
    if (strich.punkt) {
      if (abstand(p, strich.punkte[0]) <= 26) punktGetippt(strich);
      return;
    }
    if (abstand(p, strich.punkte[state.pos]) > 30) return;
    state.faehrt = true;
    el.svg.setPointerCapture?.(ereignis.pointerId);
    el.lok.classList.add("ist-dran");
    ereignis.preventDefault();
  }

  function ziehen(ereignis) {
    if (!state.faehrt || state.phase !== "fahren") return;
    const strich = state.striche[state.strich];
    const p = svgPunkt(ereignis);
    const bis = Math.min(strich.punkte.length - 1, state.pos + Math.round(VORAUS / SCHRITT));
    let beste = state.pos;
    let naechste = Infinity;
    for (let i = state.pos; i <= bis; i += 1) {
      const d = abstand(p, strich.punkte[i]);
      if (d < naechste) { naechste = d; beste = i; }
    }
    if (naechste <= NAEHE) {
      if (beste > state.pos) {
        state.pos = beste;
        setzeLok();
      }
      if (strich.laenge - strich.punkte[state.pos].s < 3) strichFertig();
      return;
    }
    if (naechste > WEG) entgleisen();
  }

  function loslassen() {
    if (!state.faehrt) return;
    state.faehrt = false;
    el.lok?.classList.remove("ist-dran");
  }

  function entgleisen() {
    state.faehrt = false;
    state.entgleist += 1;
    el.lok.classList.remove("ist-dran");
    el.lokInnen.classList.remove("wackelt");
    void el.lokInnen.getBoundingClientRect();
    el.lokInnen.classList.add("wackelt");
    ton.klopf(260);
    kids()?.vibrate?.(30);
  }

  function punktGetippt(strich) {
    strich.knopf?.setAttribute("fill", "#3fbf74");
    strich.knopf?.classList.add("ist-fertig");
    ton.klopf(620);
    naechsterStrich();
  }

  function strichFertig() {
    state.faehrt = false;
    el.lok.classList.remove("ist-dran");
    const strich = state.striche[state.strich];
    strich.gefahren?.setAttribute("stroke-dashoffset", "0");
    strich.gefahren?.parentNode?.classList.add("ist-fertig");
    ton.klopf(520 + state.strich * 60);
    kids()?.vibrate?.(12);
    naechsterStrich();
  }

  function naechsterStrich() {
    state.strich += 1;
    if (state.strich < state.striche.length) { zeichneMarken(); return; }
    buchstabeFertig();
  }

  async function buchstabeFertig() {
    state.phase = "fertig";
    el.lok.setAttribute("visibility", "hidden");
    el.marken.innerHTML = "";
    el.svg.classList.add("ist-fertig");
    if (state.entgleist === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    kids()?.playJingle?.("correct");
    const laut = state.aufgabe.laut;
    const gehoert = await ton.laut(laut.id);
    if (gehoert) await ton.pause(300);
    await ton.sprich(laut.wort, { rate: 0.85 });
    await ton.pause(700);
    state.nr += 1;
    naechster();
  }

  // Das Auge: ein gelber Punkt fährt den Strich einmal vor.
  function vormachen() {
    const strich = state.striche[state.strich];
    if (state.phase !== "fahren" || !strich || state.zeigt) return;
    if (strich.punkt) {
      el.marken.querySelector(".bg-tipp")?.classList.add("zeigt-hin");
      return;
    }
    state.zeigt = true;
    const ruhig = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const dauer = ruhig ? 1 : Math.max(700, strich.laenge * 9);
    const anfang = performance.now();
    const schritt = (jetzt) => {
      const anteil = Math.min(1, (jetzt - anfang) / dauer);
      const p = strich.punkte[Math.round(anteil * (strich.punkte.length - 1))];
      el.geist.setAttribute("cx", String(p.x));
      el.geist.setAttribute("cy", String(p.y));
      el.geist.setAttribute("opacity", anteil < 1 ? "0.95" : "0");
      if (anteil < 1 && state.strich === state.striche.indexOf(strich)) window.requestAnimationFrame(schritt);
      else { el.geist.setAttribute("opacity", "0"); state.zeigt = false; }
    };
    window.requestAnimationFrame(schritt);
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.runde = neueRunde();
    shell.setCount(0);
    shell.closeOverlay();
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechster();
      },
    });
  }

  function naechster() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.aufgabe = state.runde[state.nr];
    state.striche = (inhalte.GLEISE[state.aufgabe.zeichen] || []).map(abtasten);
    state.strich = 0;
    state.pos = 0;
    state.entgleist = 0;
    state.faehrt = false;
    state.phase = "fahren";
    const laut = state.aufgabe.laut;
    el.zeichen.textContent = state.aufgabe.zeichen;
    el.wort.innerHTML = "";
    el.wort.append(shell.el("span", "bg-bild", laut.bild), shell.el("span", "bg-wort-text", stand?.zeige?.(laut.wort) ?? laut.wort));
    zeichneBrett();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: von,
      label: "Buchstabengleis",
      detail: `${state.punkte} von ${von} Buchstaben ohne Entgleisen gefahren`,
      speech: state.punkte === von
        ? "Jeden Buchstaben gefahren, ohne zu entgleisen!"
        : `Du hast ${von} Buchstaben gefahren, ${state.punkte} davon ohne zu entgleisen.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Buchstabengleis", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs): die Punkte des Strichs, der dran
  // ist, in Bildschirmkoordinaten – so fährt die Prüfung mit der Maus.
  function bildschirmPunkte() {
    const strich = state.striche[state.strich];
    const m = el.svg?.getScreenCTM();
    if (!strich || !m) return [];
    return strich.punkte.map((p) => { const q = new DOMPoint(p.x, p.y).matrixTransform(m); return { x: q.x, y: q.y }; });
  }
  // Ein bestimmter Buchstabe, gleich auf dem Brett.
  function uebe(zeichen) {
    const laut = inhalte.LAUTE.find((l) => l.gross === zeichen || l.klein === zeichen);
    if (!laut || !inhalte.GLEISE[zeichen]) return false;
    state.runde = [{ laut, zeichen }];
    state.nr = 0;
    if (!el.brett) { shell.setPhase("play"); buehne(); }
    naechster();
    return true;
  }
  window.LernappBuchstabengleis = {
    RUNDE, buchstabenListe, neueRunde, bildschirmPunkte, uebe,
    jetzt: () => ({ zeichen: state.aufgabe?.zeichen, strich: state.strich, striche: state.striche.length, pos: state.pos, entgleist: state.entgleist, phase: state.phase, punkt: Boolean(state.striche[state.strich]?.punkt) }),
    nr: () => state.nr,
  };
})();
