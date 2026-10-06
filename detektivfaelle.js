/*
 * detektivfaelle.js – Detektivfälle: ein kurzer Krimi, und wer war es?
 *
 * Links steht der Fall in Sätzen («Oma Rosa hat einen Rüeblikuchen
 * gebacken …»), rechts stehen drei Verdächtige. Das Kind liest – ein Tipp auf
 * einen Satz liest ihn vor – und tippt auf den, der es war. Dann die zweite
 * Frage, die eines Detektivs: Welcher Satz beweist es? Das Kind tippt den
 * Satz an. Zum Schluss liest die Stimme die Auflösung.
 *
 * Je Fall zwei Punkte: einer für den Täter, einer für den Beweis, jeweils
 * nur beim ersten Versuch. Eine Runde sind drei Fälle. Die Fälle stehen in
 * lesen-detektive.js (FAELLE): Genau ein Satz beweist es, die anderen
 * Verdächtigen sind entlastet.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "detektivfaelle") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const det = window.LernappLeseDetektive;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const zugArt = window.LernappTrainArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !det || !ton || !art || !zugArt) return;

  const kids = () => window.LernappKids || null;

  const ID = "detektivfaelle";
  const RUNDE = 3;

  const HELP = [
    "Detektivfälle. Lies den Fall genau – ein Tipp auf einen Satz liest ihn vor.",
    "Wer war es? Tippe auf den Verdächtigen.",
    "Dann: Welcher Satz beweist es? Tippe auf diesen Satz.",
  ].join(" ");

  const zeige = (text) => stand?.zeige?.(text) ?? text;

  function runde() {
    return spiel.ziehe(det.FAELLE, RUNDE);
  }

  const state = { nr: 0, punkte: 0, fehler: 0, woerter: 0, phase: "intro", runde: [], fall: null };
  let shell = null;
  let el = {};

  function figur(tier) {
    return art.el("svg", { viewBox: "-26 -56 52 60", class: "df-figur", "aria-hidden": "true" }, [zugArt.buildPassenger(tier)]);
  }

  function buehne() {
    shell.clear();
    const titel = shell.el("button", "df-titel");
    titel.type = "button";
    titel.addEventListener("click", () => { if (state.fall) ton.sprich(state.fall.titel, { rate: 0.9 }); });
    const mitte = shell.el("div", "df-mitte");
    const akte = shell.el("ol", "df-akte");
    const seite = shell.el("div", "df-seite");
    const frage = shell.el("p", "df-frage");
    const verdaechtige = shell.el("div", "df-verdaechtige");
    seite.append(frage, verdaechtige);
    mitte.append(akte, seite);
    shell.play.append(titel, mitte);
    el = { titel, akte, frage, verdaechtige };
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    state.runde = runde();
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
    const f = state.runde[state.nr];
    state.fall = f;
    state.fehler = 0;
    state.phase = "wer";
    host.dataset.frage = "wer";
    el.titel.textContent = `🔎 ${zeige(f.titel)}`;
    el.akte.innerHTML = "";
    f.saetze.forEach((satz, i) => {
      const zeile = shell.el("li", "df-zeile");
      const knopf = shell.el("button", "df-satz", zeige(satz));
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      if (i === f.beweis) knopf.dataset.beweis = "1";
      knopf.addEventListener("click", () => satzGetippt(i, knopf));
      zeile.append(knopf);
      el.akte.append(zeile);
    });
    el.frage.textContent = "Wer war es?";
    el.verdaechtige.innerHTML = "";
    f.verdaechtige.forEach(([tier, name]) => {
      const knopf = shell.el("button", "df-wer");
      knopf.type = "button";
      knopf.dataset.tier = tier;
      if (tier === f.taeter) knopf.dataset.taeter = "1";
      knopf.setAttribute("aria-label", name);
      knopf.append(figur(tier), shell.el("span", "df-name", zeige(name)));
      knopf.addEventListener("click", () => verdaechtigt(tier, knopf));
      el.verdaechtige.append(knopf);
    });
    state.woerter += f.saetze.join(" ").split(/\s+/).length;
  }

  function verdaechtigt(tier, knopf) {
    if (state.phase !== "wer" || knopf.disabled) return;
    const f = state.fall;
    if (tier !== f.taeter) {
      state.fehler += 1;
      knopf.disabled = true;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      ton.sprich("Das kann nicht sein. Lies den Fall noch einmal genau.", { rate: 0.95 });
      return;
    }
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig");
    el.verdaechtige.querySelectorAll(".df-wer").forEach((k) => { k.disabled = true; });
    kids()?.playJingle?.("correct");
    // Die zweite Frage: der Beweis.
    state.fehler = 0;
    state.phase = "beweis";
    host.dataset.frage = "beweis";
    el.frage.textContent = "Welcher Satz beweist es? Tippe ihn an.";
    ton.sprich("Richtig! Und welcher Satz beweist es?", { rate: 0.95 });
  }

  async function satzGetippt(i, knopf) {
    const f = state.fall;
    if (state.phase !== "beweis") {
      // Beim Lesen: Ein Tipp liest den Satz vor.
      if (state.phase === "wer") ton.sprich(f.saetze[i], { rate: 0.9 });
      return;
    }
    if (i !== f.beweis) {
      state.fehler += 1;
      knopf.classList.remove("ist-falsch");
      void knopf.offsetWidth;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      if (state.fehler >= 2) el.akte.querySelector('[data-beweis="1"]')?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "geloest";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich(f.aufloesung, { rate: 0.9 });
    await ton.pause(600);
    state.nr += 1;
    naechster();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length * 2;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Detektivfälle",
      detail: `${state.punkte} von ${von} Punkten – Täter und Beweise`,
      speech: state.punkte === von
        ? "Jeden Fall gelöst und jeden Beweis gefunden. Ein Meisterdetektiv!"
        : `Du hast ${state.punkte} von ${von} Punkten.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Detektivfälle", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappDetektivfaelle = {
    RUNDE, runde,
    jetzt: () => state.fall, nr: () => state.nr, phase: () => state.phase,
  };
})();
