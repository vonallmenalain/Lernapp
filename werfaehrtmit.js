/*
 * werfaehrtmit.js – Wer fährt mit? Ein Wort auf der Fahrkarte.
 *
 * Auf der Fahrkarte steht ein Wort, «Hase». Am Bahnsteig warten vier: Hase,
 * Hose, Nase, Hut. Nur wer auf der Fahrkarte steht, darf einsteigen – das Kind
 * tippt ihn an, und er steigt in den Wagen. Vorgelesen wird das Wort erst
 * nach der Antwort: Hier liest das Kind selbst.
 *
 * Die Wartenden sehen dem Wort ähnlich (gleicher Anfang, ähnliche Länge,
 * wenige Buchstaben anders) – so zählt genaues Lesen, nicht der erste
 * Buchstabe. Die Wörter kommen aus den Kuppel-Wörtern der eigenen Stufe:
 * lautgetreu, nur Laute, die das Kind kennen kann (lesen-inhalte.js).
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "werfaehrtmit") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "werfaehrtmit";
  const RUNDE = 8;
  const SILBENFARBEN = ["#2f6fd0", "#e8543f"];

  const HELP = [
    "Wer fährt mit? Lies das Wort auf der Fahrkarte.",
    "Dann tippe auf das Bild, das dazu passt – es darf einsteigen.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";

  function wortListe() {
    const gruppen = inhalte.KUPPELN_JE_STUFE[stufe()] || [1, 2];
    return inhalte.KUPPEL_WOERTER.filter((w) => gruppen.includes(w.stufe));
  }

  // Wie weit zwei Wörter auseinander sind: Buchstaben, die man ändern,
  // einfügen oder streichen muss (Levenshtein).
  function abstand(a, b) {
    const x = a.toLowerCase();
    const y = b.toLowerCase();
    const zeile = Array.from({ length: y.length + 1 }, (_, i) => i);
    for (let i = 1; i <= x.length; i += 1) {
      let vorher = zeile[0];
      zeile[0] = i;
      for (let j = 1; j <= y.length; j += 1) {
        const merk = zeile[j];
        zeile[j] = Math.min(zeile[j] + 1, zeile[j - 1] + 1, vorher + (x[i - 1] === y[j - 1] ? 0 : 1));
        vorher = merk;
      }
    }
    return zeile[y.length];
  }

  // Je ähnlicher, desto höher: wenig Abstand, gleicher Anfang, gleiche Länge.
  function aehnlichkeit(ziel, anderes) {
    let wert = -abstand(ziel, anderes);
    if (ziel[0].toLowerCase() === anderes[0].toLowerCase()) wert += 1.5;
    if (Math.abs(ziel.length - anderes.length) <= 1) wert += 0.5;
    return wert;
  }

  // Drei, die ähnlich aussehen – aus den sechs ähnlichsten zufällig, damit
  // nicht immer dieselben warten. Alle mit Bild, keines doppelt.
  function aufgabe(eintrag, pool = inhalte.bildWoerter()) {
    const anzahl = stufe() === "leicht" ? 2 : 3;
    const kandidaten = pool
      .filter((w) => w.wort !== eintrag.wort && w.bild !== eintrag.bild)
      .map((w) => ({ ...w, wert: aehnlichkeit(eintrag.wort, w.wort) + Math.random() * 0.3 }))
      .sort((a, b) => b.wert - a.wert)
      .slice(0, 6);
    const andere = [];
    for (const w of spiel.mische(kandidaten)) {
      if (andere.length >= anzahl) break;
      if (andere.some((x) => x.bild === w.bild)) continue;
      andere.push(w);
    }
    return { wort: eintrag, wahl: spiel.mische([eintrag, ...andere.map(({ wort, bild }) => ({ wort, bild }))]) };
  }

  const state = { nr: 0, punkte: 0, fehler: 0, phase: "intro", aufgabe: null, runde: [] };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const karte = shell.el("div", "wm-karte");
    karte.setAttribute("aria-live", "polite");
    const wahl = shell.el("div", "wm-bahnsteig");
    const zug = shell.el("div", "wm-zug");
    const lok = spiel.eigeneLok();
    const wagen = shell.el("div", "wm-wagen");
    wagen.append(art.buildLautWagen("", { farbe: "#00a5b5", breite: 150 }));
    if (lok) zug.append(lok);
    zug.append(wagen);
    shell.play.append(karte, wahl, zug);
    el = { karte, wahl, zug, wagen };
  }

  // Das Wort in Silbenfarben, wie in Laute kuppeln.
  function zeigeWort(eintrag) {
    el.karte.innerHTML = "";
    const stempel = shell.el("span", "wm-stempel", "🎫");
    stempel.setAttribute("aria-hidden", "true");
    const wort = shell.el("span", "wm-wort");
    eintrag.silben.forEach((silbe, i) => {
      const teil = shell.el("span", "wm-silbe", stand?.zeige?.(silbe) ?? silbe);
      teil.style.color = SILBENFARBEN[i % 2];
      wort.append(teil);
    });
    wort.setAttribute("aria-label", "Das Wort auf der Fahrkarte");
    el.karte.append(stempel, wort);
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
        naechste();
      },
    });
  }

  function naechste() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.aufgabe = aufgabe(state.runde[state.nr]);
    state.fehler = 0;
    state.phase = "waehlen";
    const a = state.aufgabe;
    el.zug.classList.remove("faehrt-ab");
    el.wagen.querySelector(".wm-fahrgast")?.remove();
    zeigeWort(a.wort);
    el.karte.classList.remove("ist-neu");
    void el.karte.offsetWidth;
    el.karte.classList.add("ist-neu");
    el.wahl.innerHTML = "";
    a.wahl.forEach((eintrag) => {
      const knopf = shell.el("button", "lese-bild wm-bild");
      knopf.type = "button";
      knopf.textContent = eintrag.bild;
      knopf.setAttribute("aria-label", "Ein Fahrgast");
      if (eintrag === a.wort) knopf.dataset.richtig = "1";
      knopf.addEventListener("click", () => waehle(eintrag, knopf));
      el.wahl.append(knopf);
    });
  }

  async function waehle(eintrag, knopf) {
    if (state.phase !== "waehlen" || knopf.classList.contains("ist-falsch")) return;
    const a = state.aufgabe;
    if (eintrag !== a.wort) {
      state.fehler += 1;
      knopf.classList.remove("wackelt");
      void knopf.offsetWidth;
      knopf.classList.add("wackelt", "ist-falsch");
      kids()?.playJingle?.("retry");
      // Gesagt wird, wer das war – nicht, was auf der Karte steht.
      ton.sprich(eintrag.wort, { rate: 0.85 });
      if (state.fehler >= 2) el.wahl.querySelector('[data-richtig="1"]')?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "einsteigen";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig", "steigt-ein");
    const gast = shell.el("span", "wm-fahrgast", eintrag.bild);
    gast.setAttribute("aria-hidden", "true");
    el.wagen.append(gast);
    kids()?.playJingle?.("correct");
    await ton.sprich(a.wort.wort, { rate: 0.85 });
    await ton.pause(300);
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
      woerter: state.runde.length,
      label: "Wer fährt mit?",
      detail: `${state.punkte} von ${state.runde.length} Fahrkarten gleich richtig gelesen`,
      speech: state.punkte === state.runde.length
        ? "Du hast jede Fahrkarte gleich richtig gelesen!"
        : `Du hast ${state.punkte} von ${state.runde.length} Fahrkarten gleich richtig gelesen.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Wer fährt mit?", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappWerFaehrtMit = { RUNDE, wortListe, aufgabe, abstand, jetzt: () => state.aufgabe, nr: () => state.nr };
})();
