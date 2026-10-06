/*
 * blitzwoerter.js – Ein Wort blitzt auf: Welches war es?
 *
 * Ein Zug fährt vor, im Fenster blitzt ein kleines Wort auf – «und» – und ist
 * gleich wieder weg. Darunter vier, die ihm ähnlich sehen: und, um, uns, rund.
 * Welches war es?
 *
 * Die kleinen Wörter stehen in jedem Satz. Wer sie lautieren muss, kommt nie
 * in den Fluss; sie sollen auf einen Blick sitzen. Darum blitzt jedes nur
 * kurz: Am Anfang anderthalb Sekunden, nach jedem Treffer etwas kürzer, nach
 * einem Fehlgriff wieder länger. Dran ist, was noch nicht sitzt und am
 * längsten her ist – sitzt ein Wort (dreimal richtig an zwei Tagen,
 * lesen-stand.js), kommt es seltener.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "blitzwoerter") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton) return;

  const kids = () => window.LernappKids || null;

  const ID = "blitzwoerter";
  const RUNDE = 10;
  const DAUER_START = 1500;
  const DAUER_MIN = 600;
  const DAUER_MAX = 2200;

  const HELP = [
    "Blitzwörter. Schau genau ins Fenster: Ein Wort blitzt kurz auf.",
    "Dann tippe auf das Wort, das du gesehen hast.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";

  function wortListe() {
    const gruppen = inhalte.BLITZ_JE_STUFE[stufe()] || [1];
    return inhalte.BLITZWOERTER.filter((w) => gruppen.includes(w.stufe));
  }

  // Was noch nicht sitzt und am längsten her ist, kommt zuerst; ein wenig
  // Zufall, damit die Reihenfolge nicht jedes Mal gleich ist.
  function runde() {
    const s = stand?.stand?.() || { blitz: {} };
    const gewicht = (eintrag) => {
      const e = s.blitz?.[eintrag.wort] || {};
      const sitzt = stand?.blitzSitzt?.(eintrag.wort, s) ? 6 : 0;
      return sitzt + (Number(e.r) || 0) - (Number(e.f) || 0) * 0.7 + Math.random() * 2;
    };
    const sortiert = [...wortListe()].sort((a, b) => gewicht(a) - gewicht(b));
    return spiel.mische(sortiert.slice(0, RUNDE));
  }

  const state = { nr: 0, punkte: 0, phase: "intro", eintrag: null, dauer: DAUER_START, runde: [] };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const zug = shell.el("div", "bw-zug");
    const fenster = shell.el("div", "bw-fenster");
    const wort = shell.el("span", "bw-wort");
    fenster.append(wort);
    zug.append(fenster);
    const wahl = shell.el("div", "bw-wahl");
    shell.play.append(zug, wahl);
    el = { zug, fenster, wort, wahl };
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.dauer = DAUER_START;
    shell.setCount(0);
    shell.closeOverlay();
    state.runde = runde();
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechstes();
      },
    });
  }

  async function naechstes() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.eintrag = state.runde[state.nr];
    state.phase = "bereit";
    el.wahl.innerHTML = "";
    el.wort.textContent = "";
    el.fenster.classList.remove("blitzt", "ist-richtig", "ist-falsch");
    el.zug.classList.remove("faehrt-ein");
    void el.zug.offsetWidth;
    el.zug.classList.add("faehrt-ein");
    // Drei Punkte, dann der Blitz: Das Auge soll schon im Fenster sein.
    for (const punkte of ["•", "• •", "• • •"]) {
      el.wort.textContent = punkte;
      await ton.pause(280);
      if (state.phase !== "bereit") return;
    }
    const eintrag = state.eintrag;
    el.wort.textContent = stand?.zeige?.(eintrag.wort) ?? eintrag.wort;
    el.fenster.classList.add("blitzt");
    await ton.pause(state.dauer);
    if (state.eintrag !== eintrag) return;
    el.fenster.classList.remove("blitzt");
    el.wort.textContent = "?";
    zeigeWahl(eintrag);
  }

  function zeigeWahl(eintrag) {
    state.phase = "waehlen";
    const woerter = spiel.mische([eintrag.wort, ...eintrag.aehnlich]);
    woerter.forEach((wort) => {
      const knopf = shell.el("button", "bw-knopf", stand?.zeige?.(wort) ?? wort);
      knopf.type = "button";
      knopf.addEventListener("click", () => waehle(wort, knopf));
      el.wahl.append(knopf);
    });
  }

  async function waehle(wort, knopf) {
    if (state.phase !== "waehlen") return;
    state.phase = "zeigen";
    const eintrag = state.eintrag;
    const richtig = wort === eintrag.wort;
    stand?.blitzGeuebt?.(eintrag.wort, richtig);
    el.wort.textContent = stand?.zeige?.(eintrag.wort) ?? eintrag.wort;
    if (richtig) {
      state.punkte += 1;
      shell.setCount(state.punkte);
      knopf.classList.add("ist-richtig");
      el.fenster.classList.add("ist-richtig");
      kids()?.playJingle?.("correct");
      state.dauer = Math.max(DAUER_MIN, state.dauer - 100);
    } else {
      knopf.classList.add("ist-falsch", "wackelt");
      el.wahl.querySelectorAll(".bw-knopf").forEach((k) => { if (k.textContent === (stand?.zeige?.(eintrag.wort) ?? eintrag.wort)) k.classList.add("ist-richtig"); });
      el.fenster.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      state.dauer = Math.min(DAUER_MAX, state.dauer + 200);
    }
    // Zum Schluss sagt die Stimme das Wort – gelesen hat das Kind schon.
    await ton.sprich(eintrag.wort, { rate: 0.85 });
    await ton.pause(richtig ? 450 : 900);
    state.nr += 1;
    naechstes();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: state.runde.length,
      woerter: state.runde.length,
      label: "Blitzwörter",
      detail: `${state.punkte} von ${state.runde.length} Blitzwörtern erkannt`,
      speech: state.punkte === state.runde.length
        ? "Du hast jedes Blitzwort erkannt. Blitzschnell!"
        : `Du hast ${state.punkte} von ${state.runde.length} Blitzwörtern erkannt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Blitzwörter", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappBlitzwoerter = { RUNDE, wortListe, runde, jetzt: () => state.eintrag, phase: () => state.phase, nr: () => state.nr };
})();
