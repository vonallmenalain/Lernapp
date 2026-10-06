/*
 * wortbaustelle.js – Die Wortbaustelle: lange Wörter bauen und zerlegen.
 *
 * Bauen: Am Kran hängt ein Wortteil – «Schnee» mit seinem Bild. Unten liegen
 * drei Teile; nur einer ergibt mit ihm ein echtes Wort. Das Kind tippt ihn
 * an, der Kran setzt die Teile zusammen, und die Stimme liest: «Schnee und
 * Mann: Schneemann.» Ein falscher Teil wird auch vorgelesen – «Schneefisch?
 * Das gibt es nicht.» –, damit man hört, warum er nicht passt.
 *
 * Zerlegen: Am Kran hängt ein langes Wort, «Regenwurm». Wo fängt das zweite
 * Wort an? Das Kind tippt den Buchstaben an, und das Wort bricht dort
 * auseinander: Regen und Wurm.
 *
 * Auf «leicht» wird nur gebaut, auf «mittel» abwechselnd gebaut und zerlegt,
 * auf «schwer» nur zerlegt. Die Wörter stehen in lesen-inhalte.js
 * (BAUSTELLE): zwei Teile ohne Fugen-s oder -n, und die falschen Teile
 * ergeben mit dem ersten kein Wort.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "wortbaustelle") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art || !inhalte.BAUSTELLE) return;

  const kids = () => window.LernappKids || null;

  const ID = "wortbaustelle";
  const RUNDE = 8;

  const HELP = [
    "Die Wortbaustelle.",
    "Bauen: Welcher Teil passt an den Kran, damit ein echtes Wort entsteht? Tippe ihn an.",
    "Zerlegen: Wo fängt im langen Wort das zweite Wort an? Tippe auf diesen Buchstaben.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";
  const zeige = (text) => stand?.zeige?.(text) ?? text;
  // So steht der zweite Teil im langen Wort: «Mann» in «Schneemann».
  const klein = (teil) => teil.charAt(0).toLowerCase() + teil.slice(1);

  // Die Aufgaben einer Runde: welche Wörter, und ob gebaut oder zerlegt wird.
  function aufgaben() {
    const woerter = spiel.ziehe(inhalte.BAUSTELLE, RUNDE);
    return woerter.map((eintrag, i) => {
      let artDerAufgabe = "bauen";
      if (stufe() === "schwer") artDerAufgabe = "zerlegen";
      else if (stufe() === "mittel" && i % 2 === 1) artDerAufgabe = "zerlegen";
      const teile = artDerAufgabe === "bauen"
        ? spiel.mische([{ wort: eintrag.teile[1], bild: eintrag.bilder[1], richtig: true }, ...eintrag.falsch.map(([wort, bild]) => ({ wort, bild, richtig: false }))])
        : null;
      return { ...eintrag, art: artDerAufgabe, schnitt: eintrag.teile[0].length, wahl: teile };
    });
  }

  const state = { nr: 0, punkte: 0, fehler: 0, woerter: 0, phase: "intro", runde: [], aufgabe: null };
  let shell = null;
  let el = {};

  // Der Kran: ein Mast, ein Ausleger und das Seil, an dem die Last hängt.
  function kran() {
    return art.el("svg", { viewBox: "0 0 120 140", class: "ws-kran", "aria-hidden": "true" }, [
      art.el("rect", { x: 14, y: 20, width: 12, height: 116, fill: "#f5a623" }),
      ...[30, 52, 74, 96, 118].map((y) => art.el("path", { d: `M14 ${y} L26 ${y - 20}`, stroke: "#c47f12", "stroke-width": 3 })),
      art.el("rect", { x: 6, y: 14, width: 114, height: 10, fill: "#f5a623" }),
      art.el("path", { d: "M20 14 L32 0 L44 14", fill: "none", stroke: "#c47f12", "stroke-width": 3 }),
      art.el("rect", { x: 2, y: 132, width: 36, height: 8, rx: 2, fill: "#5b6070" }),
      art.el("path", { d: "M112 24 L112 140", stroke: "#3a4250", "stroke-width": 2.5 }),
    ]);
  }

  function teilKarte(wort, bild, klasse) {
    const karte = shell.el("span", klasse);
    if (bild) karte.append(shell.el("span", "ws-bild", bild));
    karte.append(shell.el("span", "ws-wort", zeige(wort)));
    return karte;
  }

  function buehne() {
    shell.clear();
    const oben = shell.el("div", "ws-oben");
    const last = shell.el("div", "ws-last");
    oben.append(kran(), last);
    const frage = shell.el("p", "ws-frage");
    const unten = shell.el("div", "ws-unten");
    shell.play.append(oben, frage, unten);
    el = { oben, last, frage, unten };
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    state.runde = aufgaben();
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
    const a = state.runde[state.nr];
    state.aufgabe = a;
    state.fehler = 0;
    state.phase = "bauen";
    host.dataset.aufgabe = a.art;
    el.last.innerHTML = "";
    el.unten.innerHTML = "";
    el.last.classList.remove("ist-fertig");
    if (a.art === "bauen") zeigeBauen(a);
    else zeigeZerlegen(a);
  }

  // --- Bauen ----------------------------------------------------------------
  function zeigeBauen(a) {
    el.frage.textContent = "Welcher Teil passt dazu?";
    el.last.append(teilKarte(a.teile[0], a.bilder[0], "ws-teil ws-erster"));
    a.wahl.forEach((teil, i) => {
      const knopf = shell.el("button", "ws-teil ws-wahl");
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      if (teil.richtig) knopf.dataset.richtig = "1";
      if (teil.bild) knopf.append(shell.el("span", "ws-bild", teil.bild));
      knopf.append(shell.el("span", "ws-wort", zeige(teil.wort)));
      knopf.setAttribute("aria-label", teil.wort);
      knopf.addEventListener("click", () => baue(teil, knopf));
      el.unten.append(knopf);
    });
    if (stufe() === "leicht") ton.sprich(`${a.teile[0]}. Welcher Teil passt dazu?`, { rate: 0.9 });
  }

  async function baue(teil, knopf) {
    if (state.phase !== "bauen" || knopf.disabled) return;
    const a = state.aufgabe;
    if (!teil.richtig) {
      state.fehler += 1;
      knopf.disabled = true;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      ton.sprich(`${a.teile[0]}${klein(teil.wort)}? Das gibt es nicht.`, { rate: 0.9 });
      if (state.fehler >= 2) el.unten.querySelector('[data-richtig="1"]')?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "fertig";
    knopf.classList.add("ist-richtig");
    await geschafft(a);
  }

  // --- Zerlegen ---------------------------------------------------------------
  function zeigeZerlegen(a) {
    el.frage.textContent = "Wo fängt das zweite Wort an?";
    const wagen = shell.el("div", "ws-langwort");
    [...zeige(a.wort)].forEach((zeichen, i) => {
      const knopf = shell.el("button", "ws-buchstabe", zeichen);
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      knopf.setAttribute("aria-label", `Buchstabe ${zeichen}`);
      // Vor dem ersten Buchstaben fängt kein zweites Wort an.
      if (i === 0) knopf.disabled = true;
      knopf.addEventListener("click", () => zerlege(i, knopf));
      wagen.append(knopf);
    });
    el.last.append(wagen);
    el.wagen = wagen;
    if (stufe() !== "schwer") ton.sprich(a.wort, { rate: 0.85 });
  }

  async function zerlege(i, knopf) {
    if (state.phase !== "bauen" || knopf.disabled) return;
    const a = state.aufgabe;
    if (i !== a.schnitt) {
      state.fehler += 1;
      knopf.classList.remove("ist-falsch");
      void knopf.offsetWidth;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      if (state.fehler >= 2) el.wagen.querySelector(`[data-nr="${a.schnitt}"]`)?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "fertig";
    // Das Wort bricht auseinander: zwei Teile mit ihren Bildern.
    el.last.innerHTML = "";
    el.last.append(teilKarte(a.teile[0], a.bilder[0], "ws-teil ws-erster"), teilKarte(a.teile[1], a.bilder[1], "ws-teil ws-zweiter"));
    await geschafft(a);
  }

  // --- Gemeinsam ----------------------------------------------------------------
  async function geschafft(a) {
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    state.woerter += 3;
    kids()?.playJingle?.("correct");
    el.unten.innerHTML = "";
    const ganz = shell.el("p", "ws-ganz");
    if (a.bild) ganz.append(shell.el("span", "ws-bild", a.bild));
    ganz.append(shell.el("span", "ws-wort", zeige(a.wort)));
    el.unten.append(ganz);
    el.last.classList.add("ist-fertig");
    await ton.sprich(`${a.teile[0]} und ${a.teile[1]}: ${a.wort}.`, { rate: 0.9 });
    await ton.pause(600);
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
      woerter: state.woerter,
      label: "Wortbaustelle",
      detail: `${state.punkte} von ${von} Wörtern gleich richtig gebaut oder zerlegt`,
      speech: state.punkte === von
        ? "Jedes Wort gleich richtig – du bist ein Wortbaumeister!"
        : `Du hast ${state.punkte} von ${von} Wörtern gleich richtig gebaut oder zerlegt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Wortbaustelle", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappWortbaustelle = {
    RUNDE, aufgaben,
    jetzt: () => state.aufgabe, nr: () => state.nr, phase: () => state.phase,
    // Ein bestimmtes Wort zeigen – für check-handy.mjs, das längste.
    uebe: (wort, artDerAufgabe = "zerlegen") => {
      const eintrag = inhalte.BAUSTELLE.find((b) => b.wort === wort);
      if (!eintrag || state.phase === "intro") return false;
      state.runde[state.nr] = { ...eintrag, art: artDerAufgabe, schnitt: eintrag.teile[0].length, wahl: artDerAufgabe === "bauen" ? [{ wort: eintrag.teile[1], bild: eintrag.bilder[1], richtig: true }, ...eintrag.falsch.map(([w, b]) => ({ wort: w, bild: b, richtig: false }))] : null };
      naechste();
      return true;
    },
  };
})();
