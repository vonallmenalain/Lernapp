/*
 * quatschsaetze.js – Quatsch aufs Abstellgleis.
 *
 * Ein Wagen fährt vor, auf ihm ein Satz. «Die Kuh frisst Gras.» – das kann
 * sein, der Wagen fährt weiter. «Die Kuh fliegt über das Haus.» – Quatsch!
 * Er kommt aufs Abstellgleis. Das Kind liest und entscheidet mit zwei
 * Knöpfen. Ob ein Satz Sinn hat, weiss es aus dem Alltag, nicht aus einem
 * Bild: Wer genau liest, merkt, dass Fische nicht klettern.
 *
 * Die Sätze stehen in lesen-inhalte.js (SINN_SAETZE). Auf «leicht» liest die
 * Stimme vor, und die Sätze sind kurz; nach jeder Antwort liest sie den Satz
 * und sagt, wohin er gehört.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "quatschsaetze") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton) return;

  const kids = () => window.LernappKids || null;

  const ID = "quatschsaetze";
  const RUNDE = 8;
  // So viele Wörter darf ein Satz je Stufe haben.
  const LAENGE = { leicht: 5, mittel: 6, schwer: 9 };

  const HELP = [
    "Quatschsätze. Lies den Satz auf dem Wagen.",
    "Kann das sein? Dann tippe auf den Daumen: Der Wagen fährt weiter. Ist es Quatsch, tippe auf das Abstellgleis.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";
  const wortZahl = (satz) => satz.split(/\s+/).length;

  // Eine Runde: halb Sinn, halb Quatsch, gemischt – und nie zweimal derselbe Satz.
  function runde() {
    const max = LAENGE[stufe()] || 6;
    const passend = inhalte.SINN_SAETZE.filter((s) => wortZahl(s.satz) <= max);
    const sinn = spiel.ziehe(passend.filter((s) => s.sinn), RUNDE / 2);
    const quatsch = spiel.ziehe(passend.filter((s) => !s.sinn), RUNDE / 2);
    return spiel.mische([...sinn, ...quatsch]);
  }

  const state = { nr: 0, punkte: 0, woerter: 0, phase: "intro", runde: [], satz: null };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const strecke = shell.el("div", "qs-strecke");
    const wagen = shell.el("button", "qs-wagen");
    wagen.type = "button";
    wagen.addEventListener("click", () => { if (state.satz && stufe() === "leicht") ton.sprich(state.satz.satz, { rate: 0.85 }); });
    const satz = shell.el("span", "qs-satz");
    wagen.append(satz, shell.el("span", "qs-raeder", ""));
    const schild = shell.el("p", "qs-ergebnis");
    schild.hidden = true;
    strecke.append(wagen, shell.el("div", "qs-schiene"));
    const knoepfe = shell.el("div", "qs-knoepfe");
    const ja = shell.el("button", "qs-knopf qs-ja");
    ja.type = "button";
    ja.dataset.sinn = "1";
    ja.append(shell.el("span", "qs-knopf-bild", "👍"), shell.el("span", "qs-knopf-text", "Kann sein"));
    const nein = shell.el("button", "qs-knopf qs-nein");
    nein.type = "button";
    nein.dataset.sinn = "0";
    nein.append(shell.el("span", "qs-knopf-bild", "🤪"), shell.el("span", "qs-knopf-text", "Quatsch"));
    ja.addEventListener("click", () => antworte(true, ja));
    nein.addEventListener("click", () => antworte(false, nein));
    knoepfe.append(ja, nein);
    shell.play.append(strecke, schild, knoepfe);
    el = { wagen, satz, schild, ja, nein };
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
    state.satz = state.runde[state.nr];
    state.phase = "lesen";
    el.satz.textContent = stand?.zeige?.(state.satz.satz) ?? state.satz.satz;
    el.wagen.classList.remove("faehrt-weiter", "faehrt-ab", "ist-richtig", "ist-falsch");
    el.wagen.classList.toggle("ist-hoerbar", stufe() === "leicht");
    void el.wagen.offsetWidth;
    el.wagen.classList.add("faehrt-ein");
    el.schild.hidden = true;
    [el.ja, el.nein].forEach((k) => { k.disabled = false; k.classList.remove("ist-richtig", "ist-falsch"); });
    if (stufe() === "leicht") ton.sprich(state.satz.satz, { rate: 0.85 });
  }

  async function antworte(sagtSinn, knopf) {
    if (state.phase !== "lesen") return;
    state.phase = "fahren";
    [el.ja, el.nein].forEach((k) => { k.disabled = true; });
    const s = state.satz;
    const richtig = sagtSinn === s.sinn;
    state.woerter += s.satz.split(/\s+/).length;
    if (richtig) {
      state.punkte += 1;
      shell.setCount(state.punkte);
      knopf.classList.add("ist-richtig");
      kids()?.playJingle?.("correct");
    } else {
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
    }
    // Wohin der Wagen gehört – egal, was getippt wurde.
    el.wagen.classList.remove("faehrt-ein");
    el.wagen.classList.add(s.sinn ? "faehrt-weiter" : "faehrt-ab");
    el.schild.hidden = false;
    el.schild.textContent = s.sinn ? "Das kann sein – weiter geht's!" : "Quatsch – aufs Abstellgleis!";
    el.schild.classList.toggle("ist-quatsch", !s.sinn);
    await ton.sprich(`${s.satz} ${s.sinn ? "Das kann sein." : "Das ist Quatsch!"}`, { rate: 0.9 });
    await ton.pause(richtig ? 400 : 900);
    state.nr += 1;
    naechster();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Quatschsätze",
      detail: `${state.punkte} von ${von} Sätzen richtig eingeordnet`,
      speech: state.punkte === von
        ? "Jeden Quatsch erkannt!"
        : `Du hast ${state.punkte} von ${von} Sätzen richtig eingeordnet.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Quatschsätze", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappQuatschsaetze = { RUNDE, LAENGE, runde, jetzt: () => state.satz, nr: () => state.nr, phase: () => state.phase };
})();
