/*
 * anlautlauscher.js – Was fängt gleich an?
 *
 * Die Stimme sagt ein Wort, «Mond», und das Bild dazu steht oben. Darunter
 * drei Bilder: Welches fängt gleich an? Maus – ja, Hund und Sonne – nein. Ist
 * der Laut aufgenommen (lesen-laute.js), ist er auch allein zu hören: «mmm».
 *
 * Gezählt wird, was man hört, nicht was man schreibt: Stern und Schaf fangen
 * beide mit «sch» an, Vogel und Fisch mit «f» (lesen-inhalte.js, anlautVon).
 * Auf «leicht» stehen Laute, die junge Ohren leicht verwechseln – m und n, b
 * und p –, nie zusammen zur Wahl.
 *
 * Nur Bilder, die jedes Kind hier gleich nennt: ⚽ ist für viele der
 * «Fussball», 🐴 das «Ross» – solche bleiben weg (MEHRDEUTIG).
 *
 * Lesen muss niemand. Anlaute hören ist der Schritt vor den Buchstaben: Wer
 * hört, dass Mond und Maus gleich anfangen, findet bald das M dazu.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "anlautlauscher") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton) return;

  const kids = () => window.LernappKids || null;

  const ID = "anlautlauscher";
  const RUNDE = 8;

  const HELP = [
    "Anlaut-Lauscher. Hör gut zu, wie das Wort oben anfängt.",
    "Dann tippe auf das Bild, das gleich anfängt.",
    "Ein Tipp auf das Bild oben sagt das Wort noch einmal.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";

  // Die Wörter nach ihrem ersten Laut, nur Laute mit mindestens zwei Wörtern.
  function gruppen() {
    const nachLaut = {};
    inhalte.bildWoerter({ eindeutig: true }).forEach((eintrag) => {
      const laut = inhalte.anlautVon(eintrag.wort);
      (nachLaut[laut] ||= []).push(eintrag);
    });
    return nachLaut;
  }

  function aehnlich(a, b) {
    return inhalte.AEHNLICHE_ANLAUTE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  }

  // Eine Aufgabe: Ziel und Treffer mit demselben Laut, dazu Bilder mit lauter
  // verschiedenen anderen Lauten.
  function aufgabe(laut, alle = gruppen()) {
    const [ziel, treffer] = spiel.mische(alle[laut]);
    const anzahl = stufe() === "leicht" ? 1 : 2;
    const andereLaute = spiel.mische(Object.keys(alle).filter((l) => l !== laut && !(stufe() === "leicht" && aehnlich(l, laut))));
    const gewaehlt = [];
    for (const l of andereLaute) {
      if (gewaehlt.length >= anzahl) break;
      if (gewaehlt.some((g) => aehnlich(g, l) && stufe() === "leicht")) continue;
      gewaehlt.push(l);
    }
    const andere = gewaehlt.map((l) => spiel.ziehe(alle[l], 1)[0]);
    return { laut, ziel, treffer, wahl: spiel.mische([treffer, ...andere]) };
  }

  const state = { nr: 0, punkte: 0, fehler: 0, phase: "intro", aufgabe: null, runde: [] };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const oben = shell.el("div", "al-oben");
    const ohr = shell.el("span", "al-ohr", "👂");
    ohr.setAttribute("aria-hidden", "true");
    const ziel = shell.el("button", "lese-bild al-ziel");
    ziel.type = "button";
    ziel.addEventListener("click", () => { if (state.aufgabe) frage(); });
    oben.append(ohr, ziel);
    const wahl = shell.el("div", "al-wahl");
    shell.play.append(oben, wahl);
    el = { ziel, wahl };
  }

  async function frage() {
    const a = state.aufgabe;
    await ton.sprich(`Hör gut: ${a.ziel.wort}.`, { rate: 0.85 });
    if (ton.hatAufnahme(a.laut)) {
      await ton.pause(150);
      await ton.laut(a.laut);
      await ton.pause(150);
    }
    if (state.aufgabe === a && state.phase === "waehlen") await ton.sprich("Was fängt gleich an?", { rate: 0.9 });
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    shell.setCount(0);
    shell.closeOverlay();
    const alle = gruppen();
    const laute = Object.keys(alle).filter((laut) => alle[laut].length >= 2);
    state.runde = spiel.ziehe(laute, RUNDE);
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
    const a = state.aufgabe;
    el.ziel.textContent = a.ziel.bild;
    el.ziel.setAttribute("aria-label", `${a.ziel.wort}. Antippen, um es noch einmal zu hören.`);
    el.ziel.classList.remove("ist-neu");
    void el.ziel.offsetWidth;
    el.ziel.classList.add("ist-neu");
    el.wahl.innerHTML = "";
    a.wahl.forEach((eintrag) => {
      const knopf = shell.el("button", "lese-bild al-bild");
      knopf.type = "button";
      knopf.textContent = eintrag.bild;
      knopf.setAttribute("aria-label", "Ein Bild");
      if (eintrag === a.treffer) knopf.dataset.treffer = "1";
      knopf.addEventListener("click", () => waehle(eintrag, knopf));
      el.wahl.append(knopf);
    });
    await ton.pause(300);
    if (state.aufgabe === a) frage();
  }

  async function waehle(eintrag, knopf) {
    if (state.phase !== "waehlen" || knopf.classList.contains("ist-falsch")) return;
    const a = state.aufgabe;
    if (eintrag !== a.treffer) {
      state.fehler += 1;
      knopf.classList.remove("wackelt");
      void knopf.offsetWidth;
      knopf.classList.add("wackelt", "ist-falsch");
      kids()?.playJingle?.("retry");
      state.phase = "hoeren";
      await ton.sprich(`${a.ziel.wort} – ${eintrag.wort}.`, { rate: 0.85 });
      if (state.fehler >= 2) el.wahl.querySelector('[data-treffer="1"]')?.classList.add("zeigt-hin");
      state.phase = "waehlen";
      return;
    }
    state.phase = "richtig";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich(`${a.ziel.wort} – ${eintrag.wort}. Die fangen gleich an!`, { rate: 0.85 });
    if (ton.hatAufnahme(a.laut)) await ton.laut(a.laut);
    await ton.pause(500);
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
      label: "Anlaut-Lauscher",
      detail: `${state.punkte} von ${state.runde.length} Anfängen gleich gehört`,
      speech: state.punkte === state.runde.length
        ? "Du hast jeden Anfang gleich gehört. Super gelauscht!"
        : `Du hast ${state.punkte} von ${state.runde.length} Anfängen gleich gehört.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Anlaut-Lauscher", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappAnlautLauscher = { RUNDE, gruppen, aufgabe, jetzt: () => state.aufgabe, nr: () => state.nr };
})();
