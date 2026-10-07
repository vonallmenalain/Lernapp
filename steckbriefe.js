/*
 * steckbriefe.js – Steckbriefe: kurze Sachtexte über die Tiere der Reise.
 *
 * Ein Steckbrief hängt an der Pinnwand: wo das Tier wohnt, was es frisst, wie
 * gross es ist, was besonders ist – und eine Zahl zum Staunen. Das Kind liest
 * ihn (ein Tipp auf eine Zeile liest sie vor) und beantwortet dann drei
 * Fragen. Die Antwort steht immer im Steckbrief; wer danebentippt, sieht die
 * Zeile leuchten, in der sie steht.
 *
 * Eine Runde sind zwei Steckbriefe mit je drei Fragen. Die Texte stehen in
 * lesen-detektive.js (STECKBRIEFE).
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "steckbriefe") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const det = window.LernappLeseDetektive;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const zugArt = window.LernappTrainArt;
  const bilder = window.LernappLeseBilder;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !det || !ton || !art || !zugArt) return;

  const kids = () => window.LernappKids || null;

  const ID = "steckbriefe";
  const RUNDE = 2;
  const ZEILEN = ["wohnt", "frisst", "gross", "besonders"];

  const HELP = [
    "Steckbriefe. Lies, was über das Tier auf dem Steckbrief steht – ein Tipp auf eine Zeile liest sie vor.",
    "Dann kommen drei Fragen. Die Antwort steht im Steckbrief.",
  ].join(" ");

  const zeige = (text) => stand?.zeige?.(text) ?? text;

  function runde() {
    return spiel.ziehe(det.STECKBRIEFE, RUNDE);
  }

  const state = { nr: 0, frage: 0, punkte: 0, fehler: 0, woerter: 0, phase: "intro", runde: [], brief: null };
  let shell = null;
  let el = {};

  // Das Tier aus dem Zug – und darüber das gemalte Bild des echten Tieres
  // (bilder/steckbriefe/<id>.webp, 520 × 600). Lädt es nicht, bleibt die
  // Zeichnung.
  function figur(b) {
    const svg = art.el("svg", { viewBox: "-26 -56 52 60", class: "stb-figur", "aria-hidden": "true" }, [zugArt.buildPassenger(b.tier)]);
    bilder?.mitFoto(svg, `bilder/steckbriefe/${b.id}.webp`, { x: -26, y: -56, w: 52, h: 60 });
    return svg;
  }

  function buehne() {
    shell.clear();
    const mitte = shell.el("div", "stb-mitte");
    const brief = shell.el("div", "stb-brief");
    const seite = shell.el("div", "stb-seite");
    mitte.append(brief, seite);
    shell.play.append(mitte);
    el = { brief, seite };
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

  // Der Steckbrief: Kopf mit Name, dann die vier Zeilen und die Zahl zum Staunen.
  function zeigeBrief(b) {
    el.brief.innerHTML = "";
    el.brief.append(shell.el("p", "stb-name", zeige(b.name)));
    const liste = shell.el("div", "stb-zeilen");
    ZEILEN.forEach((feld) => {
      const zeile = shell.el("div", "stb-zeile");
      zeile.dataset.zeile = feld;
      const knopf = shell.el("button", "stb-text");
      knopf.type = "button";
      knopf.append(shell.el("span", "stb-feld", `${det.FELDER[feld]}:`), document.createTextNode(` ${zeige(b[feld])}`));
      knopf.addEventListener("click", () => ton.sprich(`${det.FELDER[feld]}: ${b[feld]}`, { rate: 0.9 }));
      zeile.append(knopf);
      liste.append(zeile);
    });
    const staunen = shell.el("div", "stb-zeile stb-staunen");
    staunen.dataset.zeile = "staunen";
    const knopf = shell.el("button", "stb-text");
    knopf.type = "button";
    knopf.append(shell.el("span", "stb-feld", "Zum Staunen:"), document.createTextNode(` ${zeige(b.staunen)}`));
    knopf.addEventListener("click", () => ton.sprich(b.staunen, { rate: 0.9 }));
    staunen.append(knopf);
    liste.append(staunen);
    el.brief.append(liste);
  }

  function naechster() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    const b = state.runde[state.nr];
    state.brief = b;
    state.frage = 0;
    state.phase = "lesen";
    zeigeBrief(b);
    el.seite.innerHTML = "";
    const bild = shell.el("div", "stb-bild");
    bild.append(figur(b));
    const weiter = shell.el("button", "stb-weiter");
    weiter.type = "button";
    weiter.append(shell.el("span", "stb-weiter-bild", "❓"), shell.el("span", "stb-weiter-text", "Zu den Fragen"));
    weiter.addEventListener("click", () => { if (state.phase === "lesen") naechsteFrage(); });
    el.seite.append(bild, weiter);
    state.woerter += [b.wohnt, b.frisst, b.gross, b.besonders, b.staunen].join(" ").split(/\s+/).length;
  }

  function naechsteFrage() {
    const b = state.brief;
    if (state.frage >= b.fragen.length) {
      state.nr += 1;
      naechster();
      return;
    }
    const f = b.fragen[state.frage];
    state.fehler = 0;
    state.phase = "fragen";
    el.brief.querySelectorAll(".stb-zeile").forEach((z) => z.classList.remove("zeigt-hin"));
    el.seite.innerHTML = "";
    const frage = shell.el("button", "stb-frage", zeige(f.frage));
    frage.type = "button";
    frage.addEventListener("click", () => ton.sprich(f.frage, { rate: 0.9 }));
    const antworten = shell.el("div", "stb-antworten");
    // Die richtige Antwort steht in den Daten vorne – gezeigt wird gemischt.
    spiel.mische(f.antworten.map((text, i) => ({ text, i }))).forEach(({ text, i }) => {
      const knopf = shell.el("button", "stb-antwort", zeige(text));
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      if (i === f.richtig) knopf.dataset.richtig = "1";
      knopf.addEventListener("click", () => antworte(i, knopf));
      antworten.append(knopf);
    });
    el.seite.append(frage, antworten);
  }

  async function antworte(i, knopf) {
    if (state.phase !== "fragen" || knopf.disabled) return;
    const f = state.brief.fragen[state.frage];
    if (i !== f.richtig) {
      state.fehler += 1;
      knopf.disabled = true;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      // Nachsehen: Die Zeile, in der die Antwort steht, leuchtet.
      el.brief.querySelector(`[data-zeile="${f.zeile}"]`)?.classList.add("zeigt-hin");
      ton.sprich("Schau im Steckbrief nach.", { rate: 0.95 });
      return;
    }
    state.phase = "richtig";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich(f.antworten[f.richtig], { rate: 0.9 });
    await ton.pause(450);
    state.frage += 1;
    naechsteFrage();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.reduce((summe, b) => summe + b.fragen.length, 0);
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Steckbriefe",
      detail: `${state.punkte} von ${von} Fragen gleich richtig beantwortet`,
      speech: state.punkte === von
        ? "Jede Frage gleich richtig. Du liest wie ein Forscher!"
        : `Du hast ${state.punkte} von ${von} Fragen gleich richtig beantwortet.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Steckbriefe", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappSteckbriefe = {
    RUNDE, runde,
    jetzt: () => state.brief, frage: () => state.frage, nr: () => state.nr, phase: () => state.phase,
  };
})();
