/*
 * quatschwoerter.js – Wie heisst das Monster?
 *
 * Ein kleines Monster stellt sich vor: «Ich heisse Lomu.» Drei Schilder
 * stehen da: Lomu, Lumo, Loma. Welches ist seins? Weil es das Wort nicht
 * gibt, hilft kein Raten und kein Kennen – nur genaues Lesen, Buchstabe für
 * Buchstabe. Ein Tipp auf das Monster, und es sagt seinen Namen noch einmal;
 * ein falsches Schild liest die Stimme vor, damit das Kind den Unterschied
 * hört.
 *
 * Die Namen sind aus Silben gebaut, Mitlaut und Selbstlaut: auf «leicht»
 * zwei Silben aus den ersten Lauten, auf «mittel» zwei, auf «schwer» drei
 * oder zwei mit einem Mitlaut am Schluss. Haben die Eltern die Buchstaben
 * der Schule abgehakt, nur aus diesen. Ein Name, den es als Wort gibt
 * (Lama, Sofa …), wird neu gewürfelt.
 *
 * Das Monster ist gemalt (bilder/monster/, eines je Farbe); darunter liegt
 * seine Zeichnung, die zum Vorschein kommt, wenn das Bild nicht lädt.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "quatschwoerter") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "quatschwoerter";
  const RUNDE = 8;
  const SELBSTLAUTE = ["a", "e", "i", "o", "u"];
  const MITLAUTE = {
    leicht: ["m", "l", "s", "n", "f", "r"],
    mittel: ["m", "l", "s", "n", "f", "r", "w", "h", "d", "t", "b", "k", "p", "g"],
    schwer: ["m", "l", "s", "n", "f", "r", "w", "h", "d", "t", "b", "k", "p", "g", "z"],
  };
  const FARBEN = ["#7c5ce6", "#3fa34d", "#00a5b5", "#ef6fa8", "#f5a623", "#e8543f"];

  const HELP = [
    "Quatschwörter. Das Monster sagt dir seinen Namen.",
    "Lies die Schilder genau und tippe auf das, auf dem sein Name steht. Ein Tipp auf das Monster, und es sagt ihn noch einmal.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];
  const vorne = (wort) => wort.charAt(0).toUpperCase() + wort.slice(1);

  // Wörter, die es gibt – so heisst kein Monster.
  const ECHTE = new Set([
    ...inhalte.bildWoerter().map((w) => w.wort.toLowerCase()),
    ...inhalte.BLITZWOERTER.map((w) => w.wort.toLowerCase()),
    "mama", "papa", "oma", "opa", "lama", "sofa", "kino", "auto", "radio", "foto", "pizza", "nudel", "salat", "tomate", "rose",
    "nase", "dose", "hose", "vase", "hase", "rabe", "rabe", "lupe", "kuh", "uhu", "emu", "boot", "hut", "mut", "gut", "rot",
  ]);

  function mitlaute() {
    const liste = MITLAUTE[stufe()] || MITLAUTE.mittel;
    const bekannt = stand?.bekannteLaute?.() || null;
    if (!bekannt) return liste;
    const schule = liste.filter((id) => bekannt.has(id));
    return schule.length >= 3 ? schule : liste;
  }

  // Ein Name aus Silben: Mitlaut und Selbstlaut, auf «schwer» drei Silben
  // oder ein Mitlaut am Schluss.
  function name() {
    const m = mitlaute();
    for (let versuch = 0; versuch < 50; versuch += 1) {
      const silben = stufe() === "schwer" && Math.random() < 0.5 ? 3 : 2;
      let wort = "";
      for (let i = 0; i < silben; i += 1) wort += zufall(m) + zufall(SELBSTLAUTE);
      if (stufe() === "schwer" && silben === 2) wort += zufall(m);
      if (!ECHTE.has(wort) && !/(.)\1/.test(wort)) return wort;
    }
    return "lomu";
  }

  // Schilder, die fast gleich aussehen: die Selbstlaute getauscht (Lomu –
  // Lumo), ein Selbstlaut anders (Loma), die Mitlaute getauscht (Molu), ein
  // Mitlaut anders (Lonu).
  function aehnliche(wort) {
    const buchstaben = wort.split("");
    const selbst = buchstaben.map((b, i) => (SELBSTLAUTE.includes(b) ? i : -1)).filter((i) => i >= 0);
    const mit = buchstaben.map((b, i) => (!SELBSTLAUTE.includes(b) ? i : -1)).filter((i) => i >= 0);
    const tausche = (stellen) => {
      if (stellen.length < 2) return null;
      const [a, b] = stellen;
      if (buchstaben[a] === buchstaben[b]) return null;
      const neu = [...buchstaben];
      [neu[a], neu[b]] = [neu[b], neu[a]];
      return neu.join("");
    };
    const ersetze = (stellen, vorrat) => {
      const i = zufall(stellen);
      const andere = vorrat.filter((x) => x !== buchstaben[i]);
      const neu = [...buchstaben];
      neu[i] = zufall(andere);
      return neu.join("");
    };
    const kandidaten = [tausche(selbst), ersetze(selbst, SELBSTLAUTE), tausche(mit), ersetze(mit, mitlaute())]
      .filter((w) => w && w !== wort && !ECHTE.has(w));
    return [...new Set(kandidaten)];
  }

  function aufgabe() {
    const anzahl = stufe() === "leicht" ? 1 : 2;
    let wort = name();
    let andere = aehnliche(wort);
    for (let versuch = 0; versuch < 10 && andere.length < anzahl; versuch += 1) {
      wort = name();
      andere = aehnliche(wort);
    }
    andere = spiel.mische(andere).slice(0, anzahl);
    return { wort, wahl: spiel.mische([wort, ...andere]), farbe: zufall(FARBEN), augen: 1 + Math.floor(Math.random() * 3) };
  }

  // ---------------------------------------------------------------------------
  // Das Monster
  // ---------------------------------------------------------------------------
  function monster(a) {
    const svg = art.el("svg", { viewBox: "-70 -90 140 120", class: "qw-monster-svg", "aria-hidden": "true" });
    const dunkel = art.shade(a.farbe, -0.25);
    svg.append(art.el("ellipse", { cx: 0, cy: 26, rx: 44, ry: 7, fill: "#000000", opacity: "0.12" }));
    // Hörner und Füsse
    svg.append(art.el("path", { d: "M-30 -48 L-40 -78 L-16 -56 Z M30 -48 L40 -78 L16 -56 Z", fill: dunkel }));
    svg.append(art.el("ellipse", { cx: -22, cy: 22, rx: 14, ry: 8, fill: dunkel }), art.el("ellipse", { cx: 22, cy: 22, rx: 14, ry: 8, fill: dunkel }));
    svg.append(art.el("path", { d: "M-46 10 C-52 -40 -30 -66 0 -66 C30 -66 52 -40 46 10 C40 26 -40 26 -46 10 Z", fill: a.farbe }));
    // Arme
    svg.append(art.el("path", { d: "M-44 -6 Q-62 -12 -64 -30 M44 -6 Q62 -12 64 -30", stroke: a.farbe, "stroke-width": 9, fill: "none", "stroke-linecap": "round" }));
    // Bauch
    svg.append(art.el("ellipse", { cx: 0, cy: -2, rx: 26, ry: 20, fill: "#ffffff", opacity: "0.35" }));
    // Augen: eins, zwei oder drei
    const xs = { 1: [0], 2: [-15, 15], 3: [-20, 0, 20] }[a.augen];
    xs.forEach((x, i) => {
      const r = a.augen === 1 ? 14 : 10;
      const y = -36 + (a.augen === 3 && i === 1 ? -8 : 0);
      svg.append(art.el("circle", { cx: x, cy: y, r, fill: "#ffffff" }), art.el("circle", { cx: x + 2, cy: y + 2, r: r * 0.45, fill: "#243047", class: "qw-pupille" }));
    });
    // Mund mit Zähnchen
    svg.append(art.el("path", { d: "M-16 -14 Q0 2 16 -14 Z", fill: "#5b2333" }));
    svg.append(art.el("path", { d: "M-9 -13 L-6 -8 L-3 -12 M3 -12 L6 -8 L9 -13", stroke: "#ffffff", "stroke-width": 2, fill: "none" }));
    // Darüber das gemalte Monster seiner Farbe (bilder/monster/, freigestellt).
    // Ist es da, tritt die Zeichnung zurück – nur der Schatten bleibt; lädt es
    // nicht, bleibt sie (data-foto: laedt, da, fehlt).
    const foto = art.el("image", { href: monsterBild(a.farbe), x: -70, y: -90, width: 140, height: 120, preserveAspectRatio: "xMidYMax meet", class: "qw-foto" });
    svg.dataset.foto = "laedt";
    foto.addEventListener("load", () => { svg.dataset.foto = "da"; });
    foto.addEventListener("error", () => {
      svg.dataset.foto = "fehlt";
      foto.remove();
    });
    svg.append(foto);
    return svg;
  }

  // Je Farbe ein gemaltes Monster: monster-1.webp … monster-6.webp, in der
  // Reihenfolge von FARBEN. Gleich beim Laden geholt, damit jedes sofort dasteht.
  const monsterBild = (farbe) => `bilder/monster/monster-${FARBEN.indexOf(farbe) + 1}.webp`;
  FARBEN.forEach((farbe) => {
    const bild = new Image();
    bild.decoding = "async";
    bild.src = monsterBild(farbe);
  });

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  const state = { nr: 0, punkte: 0, fehler: 0, phase: "intro", aufgabe: null };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const oben = shell.el("div", "qw-oben");
    const figur = shell.el("button", "qw-monster");
    figur.type = "button";
    figur.setAttribute("aria-label", "Das Monster. Antippen, und es sagt seinen Namen.");
    figur.addEventListener("click", () => { if (state.aufgabe) stellDichVor(); });
    const blase = shell.el("span", "qw-blase", "🔊");
    blase.setAttribute("aria-hidden", "true");
    oben.append(figur, blase);
    const schilder = shell.el("div", "qw-schilder");
    shell.play.append(oben, schilder);
    el = { figur, schilder };
  }

  const stellDichVor = () => ton.sprich(`Ich heisse ${vorne(state.aufgabe.wort)}.`, { rate: 0.8 });

  function start() {
    state.nr = 0;
    state.punkte = 0;
    shell.setCount(0);
    shell.closeOverlay();
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechstes();
      },
    });
  }

  function naechstes() {
    if (state.nr >= RUNDE) { fertig(); return; }
    state.aufgabe = aufgabe();
    state.fehler = 0;
    state.phase = "lesen";
    const a = state.aufgabe;
    el.figur.innerHTML = "";
    el.figur.append(monster(a));
    el.figur.classList.remove("ist-froh", "schuettelt");
    void el.figur.offsetWidth;
    el.figur.classList.add("kommt");
    el.schilder.innerHTML = "";
    a.wahl.forEach((wort) => {
      const schild = shell.el("button", "qw-schild", stand?.zeige?.(vorne(wort)) ?? vorne(wort));
      schild.type = "button";
      schild.dataset.wort = wort;
      if (wort === a.wort) schild.dataset.richtig = "1";
      schild.addEventListener("click", () => waehle(wort, schild));
      el.schilder.append(schild);
    });
    stellDichVor();
  }

  async function waehle(wort, schild) {
    if (state.phase !== "lesen" || schild.disabled) return;
    const a = state.aufgabe;
    if (wort !== a.wort) {
      state.fehler += 1;
      schild.disabled = true;
      schild.classList.add("ist-falsch");
      el.figur.classList.remove("schuettelt");
      void el.figur.offsetWidth;
      el.figur.classList.add("schuettelt");
      kids()?.playJingle?.("retry");
      if (state.fehler >= 2) el.schilder.querySelector('[data-richtig="1"]')?.classList.add("zeigt-hin");
      // Das falsche Schild, vorgelesen – und gleich danach der richtige Name.
      await ton.sprich(`${vorne(wort)}? Nein.`, { rate: 0.8 });
      if (state.aufgabe === a) stellDichVor();
      return;
    }
    state.phase = "froh";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    schild.classList.add("ist-richtig");
    el.figur.classList.add("ist-froh");
    kids()?.playJingle?.("correct");
    await ton.sprich(`Ja! Ich bin ${vorne(a.wort)}!`, { rate: 0.85 });
    await ton.pause(500);
    state.nr += 1;
    naechstes();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: RUNDE,
      woerter: RUNDE,
      label: "Quatschwörter",
      detail: `${state.punkte} von ${RUNDE} Monstern gleich richtig benannt`,
      speech: state.punkte === RUNDE
        ? "Jedes Monster gleich richtig benannt. Genau gelesen!"
        : `Du hast ${state.punkte} von ${RUNDE} Monstern gleich richtig benannt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Quatschwörter", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappQuatschwoerter = { RUNDE, name, aehnliche, aufgabe, ECHTE, jetzt: () => state.aufgabe, nr: () => state.nr, phase: () => state.phase };
})();
