/*
 * lautposition.js – Wo im Wort wohnt der Laut?
 *
 * Oben steht ein Buchstabe, daneben ein Bild, und die Stimme sagt das Wort:
 * «Lama». Hörst du das M vorne, in der Mitte oder hinten? Das Kind tippt auf
 * die Lok (vorne), den Wagen (Mitte) oder den Schlusswagen (hinten) – wie man
 * liest, von links nach rechts. Ist der Laut aufgenommen (lesen-laute.js),
 * ist er vorher auch allein zu hören.
 *
 * Die Wörter kommen aus den Bildwörtern der Leseecke; wo der Laut steht,
 * rechnen die Laut-Steine aus (lesen-inhalte.js). Gefragt wird nur nach
 * Lauten, die man dehnen kann, und nach Sch, und nur in Wörtern, in denen der
 * Laut genau einmal vorkommt. Auf «leicht» steht er nur vorne oder hinten.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "lautposition") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "lautposition";
  const RUNDE = 8;
  const LAUTE = ["m", "l", "n", "f", "s", "sch"];
  const STELLEN = ["vorne", "mitte", "hinten"];

  const HELP = [
    "Laut-Position. Hör gut zu: Wo im Wort hörst du den Laut?",
    "Vorne, dann tippe auf die Lok. In der Mitte: auf den Wagen. Hinten: auf den Schlusswagen.",
    "Ein Tipp auf das Bild sagt das Wort noch einmal.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";

  // Wo ein Laut im Wort steht – oder null, wenn er nicht oder mehrmals
  // vorkommt. Zwei gleiche Steine nacheinander (Tasse) sind ein Laut.
  function stelleIn(wort, laut) {
    const ids = inhalte.steine(wort).map(inhalte.lautId).filter((id, i, alle) => i === 0 || id !== alle[i - 1]);
    const treffer = ids.map((id, i) => (id === laut ? i : -1)).filter((i) => i >= 0);
    if (treffer.length !== 1) return null;
    if (treffer[0] === 0) return "vorne";
    if (treffer[0] === ids.length - 1) return "hinten";
    return "mitte";
  }

  // Alle Aufgaben, die es gibt: Laut, Wort, Stelle.
  function aufgaben() {
    const woerter = inhalte.bildWoerter({ eindeutig: true });
    const liste = [];
    LAUTE.forEach((laut) => woerter.forEach((w) => {
      const stelle = stelleIn(w.wort, laut);
      if (stelle) liste.push({ laut, wort: w.wort, bild: w.bild, stelle });
    }));
    return liste;
  }

  // Eine Runde: die Stellen gleichmässig verteilt, auf «leicht» ohne Mitte.
  function runde() {
    const alle = aufgaben();
    const stellen = stufe() === "leicht" ? ["vorne", "hinten"] : STELLEN;
    const je = Math.ceil(RUNDE / stellen.length);
    const gezogen = stellen.flatMap((stelle) => spiel.ziehe(alle.filter((a) => a.stelle === stelle), je));
    return spiel.mische(gezogen).slice(0, RUNDE);
  }

  const state = { nr: 0, punkte: 0, fehler: 0, phase: "intro", runde: [], aufgabe: null };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const oben = shell.el("div", "lp-oben");
    const zeichen = shell.el("p", "lp-zeichen");
    const bild = shell.el("button", "lese-bild lp-bild");
    bild.type = "button";
    bild.addEventListener("click", () => { if (state.aufgabe) frage(); });
    oben.append(zeichen, bild);
    const frageText = shell.el("p", "lp-frage");
    const zug = shell.el("div", "lp-zug");
    const teile = {};
    STELLEN.forEach((stelle) => {
      const knopf = shell.el("button", `lp-teil lp-${stelle}`);
      knopf.type = "button";
      knopf.dataset.stelle = stelle;
      knopf.setAttribute("aria-label", { vorne: "Vorne: die Lok", mitte: "In der Mitte: der Wagen", hinten: "Hinten: der Schlusswagen" }[stelle]);
      if (stelle === "vorne") {
        const lok = spiel.eigeneLok();
        if (lok) knopf.append(lok);
      } else {
        const wagen = art.buildLautWagen("", { farbe: stelle === "mitte" ? "#00a5b5" : "#7c5ce6" });
        if (stelle === "hinten") wagen.append(art.el("circle", { cx: 77, cy: 30, r: 6, fill: "#e8543f", stroke: "#ffffff", "stroke-width": 2 }));
        knopf.append(wagen);
      }
      knopf.append(shell.el("span", "lp-teil-text", { vorne: "vorne", mitte: "Mitte", hinten: "hinten" }[stelle]));
      knopf.addEventListener("click", () => antworte(stelle, knopf));
      zug.append(knopf);
      teile[stelle] = knopf;
    });
    shell.play.append(oben, frageText, zug);
    el = { zeichen, bild, frageText, teile };
  }

  async function frage() {
    const a = state.aufgabe;
    if (ton.lautHoerbar(a.laut)) {
      await ton.laut(a.laut);
      await ton.pause(250);
    }
    await ton.sprich(a.wort, { rate: 0.8 });
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.runde = runde();
    shell.setCount(0);
    shell.closeOverlay();
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechste();
      },
    });
  }

  function naechste() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.aufgabe = state.runde[state.nr];
    state.fehler = 0;
    state.phase = "hoeren";
    const a = state.aufgabe;
    const laut = inhalte.LAUT_BY_ID[a.laut];
    el.zeichen.textContent = stand?.nurGross?.() ? laut.gross : `${laut.gross} ${laut.klein}`;
    el.bild.textContent = a.bild;
    el.bild.setAttribute("aria-label", "Das Bild. Antippen, um das Wort zu hören.");
    el.bild.classList.remove("ist-neu");
    void el.bild.offsetWidth;
    el.bild.classList.add("ist-neu");
    el.frageText.textContent = `Wo hörst du ${stand?.nurGross?.() ? laut.gross : laut.klein}?`;
    Object.values(el.teile).forEach((k) => { k.disabled = false; k.classList.remove("ist-richtig", "ist-falsch", "zeigt-hin"); });
    el.teile.mitte.hidden = stufe() === "leicht";
    frage();
  }

  async function antworte(stelle, knopf) {
    if (state.phase !== "hoeren" || knopf.disabled) return;
    const a = state.aufgabe;
    if (stelle !== a.stelle) {
      state.fehler += 1;
      knopf.disabled = true;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      if (state.fehler >= 2 || stufe() === "leicht") el.teile[a.stelle].classList.add("zeigt-hin");
      ton.sprich(a.wort, { rate: 0.7 });
      return;
    }
    state.phase = "richtig";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich(a.wort, { rate: 0.8 });
    await ton.pause(500);
    state.nr += 1;
    naechste();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: von,
      label: "Laut-Position",
      detail: `${state.punkte} von ${von} Lauten gleich am richtigen Ort gehört`,
      speech: state.punkte === von
        ? "Du hast jeden Laut gleich am richtigen Ort gehört!"
        : `Du hast ${state.punkte} von ${von} Lauten gleich am richtigen Ort gehört.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Laut-Position", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappLautPosition = { RUNDE, LAUTE, stelleIn, aufgaben, runde, jetzt: () => state.aufgabe, nr: () => state.nr, phase: () => state.phase };
})();
