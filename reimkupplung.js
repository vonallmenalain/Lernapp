/*
 * reimkupplung.js – Was reimt sich? Nur das kuppelt an.
 *
 * Auf dem Gleis steht die eigene Lok mit einem Wagen, darauf ein Bild, und die
 * Stimme sagt das Wort: «Was reimt sich auf Maus?» Daneben warten Wagen mit
 * anderen Bildern. Nur der, der sich reimt, lässt sich ankuppeln: «Haus» rollt
 * heran und kuppelt, «Hund» stösst an und rollt zurück. Bei jedem Tipp sagt die
 * Stimme beide Wörter – «Maus – Haus» –, so hört das Kind den Reim, auch wenn
 * es danebenlag.
 *
 * Lesen muss niemand: Reime hören ist eine der ersten Stufen der
 * phonologischen Bewusstheit, im Kindergarten mit Versen und Liedern geübt.
 * Die falschen Wagen kommen aus anderen Reimgruppen (lesen-inhalte.js, REIME):
 * Zufällig reimt sich nie auch ein falscher.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "reimkupplung") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "reimkupplung";
  const RUNDE = 6;
  const FARBEN = ["#f5a623", "#3fa34d", "#00a5b5", "#7c5ce6", "#ef6fa8"];

  const HELP = [
    "Reimkupplung. Hör gut zu: Was reimt sich auf das Wort am Zug?",
    "Tippe auf den Wagen, der sich reimt – nur der lässt sich ankuppeln.",
    "Ein Tipp auf den Wagen am Zug sagt das Wort noch einmal.",
  ].join(" ");

  // Auf «leicht» zwei Wagen zur Wahl, sonst drei.
  function anzahlWahl() {
    return (stand?.stufe?.(ID) || "mittel") === "leicht" ? 2 : 3;
  }

  const state = { nr: 0, punkte: 0, fehler: 0, phase: "intro", aufgabe: null, runde: [] };
  let shell = null;
  let el = {};

  // Eine Aufgabe: ein Wort am Zug, sein Reim und Wagen aus anderen Gruppen.
  function aufgabe(gruppe) {
    const [ziel, reim] = spiel.mische(gruppe.woerter);
    const andere = spiel.ziehe(inhalte.REIME.filter((g) => g !== gruppe), anzahlWahl() - 1)
      .map((g) => spiel.ziehe(g.woerter, 1)[0]);
    return { ziel, reim, wahl: spiel.mische([reim, ...andere]) };
  }

  function wagen(eintrag, farbe) {
    return art.buildLautWagen(eintrag.bild, { farbe, breite: 120 });
  }

  // ---------------------------------------------------------------------------
  // Aufbau
  // ---------------------------------------------------------------------------
  function buehne() {
    shell.clear();
    const gleis = shell.el("div", "rk-gleis");
    const zug = shell.el("div", "rk-zug");
    const lok = spiel.eigeneLok();
    const ziel = shell.el("button", "rk-wagen rk-ziel");
    ziel.type = "button";
    ziel.addEventListener("click", () => { if (state.aufgabe) ton.sprich(state.aufgabe.ziel.wort, { rate: 0.85 }); });
    if (lok) zug.append(lok);
    zug.append(ziel);
    gleis.append(zug, shell.el("div", "silben-schiene"));
    const wahl = shell.el("div", "rk-wahl");
    shell.play.append(gleis, wahl);
    el = { gleis, zug, ziel, wahl };
  }

  function zeigeAufgabe() {
    const a = state.aufgabe;
    el.zug.classList.remove("faehrt-ab");
    el.zug.querySelectorAll(".rk-angekuppelt").forEach((w) => w.remove());
    el.ziel.innerHTML = "";
    el.ziel.append(wagen(a.ziel, FARBEN[state.nr % FARBEN.length]));
    el.ziel.setAttribute("aria-label", `Am Zug: ${a.ziel.wort}. Antippen, um es noch einmal zu hören.`);
    el.wahl.innerHTML = "";
    a.wahl.forEach((eintrag, i) => {
      const knopf = shell.el("button", "rk-wagen rk-kandidat");
      knopf.type = "button";
      knopf.setAttribute("aria-label", "Ein Wagen");
      knopf.append(wagen(eintrag, FARBEN[(state.nr + i + 1) % FARBEN.length]));
      if (eintrag === a.reim) knopf.dataset.reim = "1";
      knopf.addEventListener("click", () => kuppeln(eintrag, knopf));
      el.wahl.append(knopf);
    });
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  function start() {
    state.nr = 0;
    state.punkte = 0;
    shell.setCount(0);
    shell.closeOverlay();
    state.runde = spiel.ziehe(inhalte.REIME, RUNDE);
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechste();
      },
    });
  }

  async function naechste() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.aufgabe = aufgabe(state.runde[state.nr]);
    state.fehler = 0;
    state.phase = "waehlen";
    zeigeAufgabe();
    await ton.pause(250);
    if (state.phase === "waehlen") ton.sprich(`Was reimt sich auf ${state.aufgabe.ziel.wort}?`, { rate: 0.85 });
  }

  async function kuppeln(eintrag, knopf) {
    if (state.phase !== "waehlen" || knopf.classList.contains("ist-falsch")) return;
    const a = state.aufgabe;
    state.phase = "pruefen";
    if (eintrag !== a.reim) {
      state.fehler += 1;
      knopf.classList.remove("stoesst");
      void knopf.offsetWidth;
      knopf.classList.add("stoesst", "ist-falsch");
      kids()?.playJingle?.("retry");
      await ton.sprich(`${a.ziel.wort} – ${eintrag.wort}`, { rate: 0.85 });
      if (state.fehler >= 2) el.wahl.querySelector('[data-reim="1"]')?.classList.add("zeigt-hin");
      state.phase = "waehlen";
      return;
    }
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    // Der Reim rollt an und kuppelt hinten an.
    knopf.classList.add("kuppelt");
    const angekuppelt = shell.el("span", "rk-wagen rk-angekuppelt");
    angekuppelt.append(wagen(eintrag, "#3fbf74"));
    el.zug.append(angekuppelt);
    knopf.classList.add("ist-weg");
    kids()?.playJingle?.("correct");
    await ton.sprich(`${a.ziel.wort} – ${eintrag.wort}!`, { rate: 0.85 });
    await ton.pause(350);
    kids()?.playHorn?.({ chuffs: 2 });
    el.zug.classList.add("faehrt-ab");
    await ton.pause(850);
    state.nr += 1;
    naechste();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: state.runde.length,
      woerter: state.runde.length * 2,
      label: "Reimkupplung",
      detail: `${state.punkte} von ${state.runde.length} Reimen gleich gefunden`,
      speech: state.punkte === state.runde.length
        ? "Du hast jeden Reim gleich gefunden. Du hast gute Ohren!"
        : `Du hast ${state.punkte} von ${state.runde.length} Reimen gleich gefunden.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Reimkupplung", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs): die Aufgabe, die gerade dran ist.
  window.LernappReimkupplung = { RUNDE, aufgabe, jetzt: () => state.aufgabe, nr: () => state.nr };
})();
