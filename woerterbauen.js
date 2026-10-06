/*
 * woerterbauen.js – Aus Laut-Steinen ein Wort legen.
 *
 * Oben ein Bild, darunter so viele leere Felder, wie das Wort Laute hat, und
 * die Laut-Steine durcheinander. Das Kind legt Stein für Stein; ist das letzte
 * Feld voll, liest die Stimme, was daliegt – auch «Sfoa». So hört es selbst,
 * was nicht stimmt, und niemand muss «falsch» sagen. Was schon am richtigen
 * Platz liegt, bleibt liegen; die anderen Steine springen zurück.
 *
 * Ein Tipp auf das Bild sagt das Wort, ein Tipp auf ein volles Feld nimmt den
 * Stein wieder heraus. Sch, Ei, Au und ihre Geschwister sind je ein Stein:
 * Ein Laut, ein Stein (lesen-inhalte.js, steine).
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "woerterbauen") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton) return;

  const kids = () => window.LernappKids || null;

  const ID = "woerterbauen";
  const RUNDE = 6;
  const MAX_STEINE = { leicht: 4, mittel: 5, schwer: 6 };

  const HELP = [
    "Wörter bauen. Schau das Bild an und lege das Wort aus den Steinen.",
    "Tippe die Steine der Reihe nach an. Ein Tipp auf das Bild sagt das Wort,",
    "ein Tipp auf ein volles Feld nimmt den Stein wieder heraus.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";

  // Nach der Stufe – oder nach den Buchstaben, die die Eltern abgehakt haben.
  // Länger als die Stufe erlaubt wird ein Wort so oder so nicht.
  function wortListe() {
    const max = MAX_STEINE[stufe()] || 5;
    const kurz = inhalte.KUPPEL_WOERTER.filter((w) => inhalte.steineDerSilben(w.silben).flat().length <= max);
    const bekannt = stand?.bekannteLaute?.() || null;
    if (bekannt) return inhalte.lesbare(kurz, bekannt, RUNDE);
    const gruppen = inhalte.KUPPELN_JE_STUFE[stufe()] || [1, 2];
    return kurz.filter((w) => gruppen.includes(w.stufe));
  }

  // Die Steine eines Wortes, gemischt – aber nie schon in der richtigen
  // Reihenfolge, sonst gäbe es nichts zu legen.
  function gemischt(steine) {
    if (steine.length < 2) return steine.map((text, i) => ({ text, nr: i }));
    let liste;
    let versuch = 0;
    do {
      liste = spiel.mische(steine.map((text, i) => ({ text, nr: i })));
      versuch += 1;
    } while (liste.every((stein, i) => stein.text === steine[i]) && versuch < 20);
    return liste;
  }

  const state = { nr: 0, punkte: 0, fehler: 0, phase: "intro", wort: null, steine: [], felder: [], runde: [] };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const bild = shell.el("button", "lese-bild wb-bild");
    bild.type = "button";
    bild.addEventListener("click", () => { if (state.wort) ton.sprich(state.wort.wort, { rate: 0.85 }); });
    const felder = shell.el("div", "wb-felder");
    const steine = shell.el("div", "wb-steine");
    shell.play.append(bild, felder, steine);
    el = { bild, felder, steine };
  }

  function zeichne() {
    el.felder.innerHTML = "";
    state.felder.forEach((stein, i) => {
      const feld = shell.el("button", `wb-feld${stein ? " ist-voll" : ""}${stein?.fest ? " ist-fest" : ""}`);
      feld.type = "button";
      feld.dataset.nr = String(i);
      feld.setAttribute("aria-label", stein ? `Stein ${stein.text}, antippen zum Herausnehmen` : `Feld ${i + 1}, leer`);
      feld.textContent = stein ? stand?.zeige?.(stein.text) ?? stein.text : "";
      feld.addEventListener("click", () => herausnehmen(i));
      el.felder.append(feld);
    });
    el.steine.innerHTML = "";
    state.steine.forEach((stein) => {
      const knopf = shell.el("button", "wb-stein");
      knopf.type = "button";
      knopf.textContent = stand?.zeige?.(stein.text) ?? stein.text;
      knopf.setAttribute("aria-label", `Stein ${stein.text}`);
      knopf.hidden = Boolean(stein.liegt);
      knopf.addEventListener("click", () => legen(stein));
      el.steine.append(knopf);
    });
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    shell.setCount(0);
    shell.closeOverlay();
    state.runde = spiel.ziehe(wortListe(), RUNDE);
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechstes();
      },
    });
  }

  function naechstes() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.wort = state.runde[state.nr];
    const steine = inhalte.steineDerSilben(state.wort.silben).flat();
    state.richtig = steine;
    state.steine = gemischt(steine).map((stein) => ({ ...stein, liegt: false }));
    state.felder = steine.map(() => null);
    state.fehler = 0;
    state.phase = "legen";
    el.bild.textContent = state.wort.bild;
    el.bild.setAttribute("aria-label", "Das Bild. Antippen, um das Wort zu hören.");
    el.bild.classList.remove("ist-neu");
    void el.bild.offsetWidth;
    el.bild.classList.add("ist-neu");
    el.felder.classList.remove("ist-richtig", "wackelt");
    zeichne();
  }

  function legen(stein) {
    if (state.phase !== "legen" || stein.liegt) return;
    const frei = state.felder.findIndex((f) => !f);
    if (frei < 0) return;
    state.felder[frei] = stein;
    stein.liegt = true;
    kids()?.vibrate?.(8);
    ton.klopf(380 + frei * 40);
    zeichne();
    if (state.felder.every(Boolean)) pruefe();
  }

  function herausnehmen(i) {
    if (state.phase !== "legen") return;
    const stein = state.felder[i];
    if (!stein || stein.fest) return;
    state.felder[i] = null;
    stein.liegt = false;
    zeichne();
  }

  async function pruefe() {
    state.phase = "lesen";
    const gelegt = state.felder.map((stein) => stein.text).join("");
    // Was daliegt, wird vorgelesen – so, wie es dasteht.
    const vorlesen = gelegt.charAt(0).toUpperCase() + gelegt.slice(1).toLowerCase();
    await ton.sprich(vorlesen, { rate: 0.8 });
    if (gelegt === state.wort.wort) {
      if (state.fehler === 0) {
        state.punkte += 1;
        shell.setCount(state.punkte);
      }
      el.felder.classList.add("ist-richtig");
      kids()?.playJingle?.("correct");
      await ton.pause(900);
      state.nr += 1;
      naechstes();
      return;
    }
    state.fehler += 1;
    kids()?.playJingle?.("retry");
    el.felder.classList.remove("wackelt");
    void el.felder.offsetWidth;
    el.felder.classList.add("wackelt");
    await ton.pause(500);
    // Was am richtigen Platz liegt, bleibt; der Rest springt zurück. Nach dem
    // zweiten Versuch liegt auch der nächste Stein schon richtig.
    state.felder = state.felder.map((stein, i) => {
      if (stein && stein.text === state.richtig[i]) return { ...stein, fest: true };
      if (stein) stein.liegt = false;
      return null;
    });
    if (state.fehler >= 2) {
      const luecke = state.felder.findIndex((f) => !f);
      const passend = state.steine.find((stein) => !stein.liegt && stein.text === state.richtig[luecke]);
      if (luecke >= 0 && passend) {
        passend.liegt = true;
        state.felder[luecke] = { ...passend, fest: true };
      }
    }
    // Feste Steine sind gelegt; die gemischten Steine wissen davon.
    state.steine.forEach((stein) => { stein.liegt = state.felder.some((f) => f && f.nr === stein.nr); });
    state.phase = "legen";
    zeichne();
    if (state.felder.every(Boolean)) pruefe();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: state.runde.length,
      woerter: state.runde.length,
      label: "Wörter bauen",
      detail: `${state.punkte} von ${state.runde.length} Wörtern gleich richtig gelegt`,
      speech: state.punkte === state.runde.length
        ? "Du hast jedes Wort gleich richtig gelegt!"
        : `Du hast ${state.punkte} von ${state.runde.length} Wörtern gleich richtig gelegt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Wörter bauen", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappWoerterBauen = { RUNDE, wortListe, gemischt, jetzt: () => state.wort, richtig: () => state.richtig, nr: () => state.nr };
})();
