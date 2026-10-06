/*
 * silbenbahn.js – Silben kuppeln: BA – NA – NE.
 *
 * Oben ein Bild, vorne die eigene Lok, und auf dem Nebengleis warten Wagen
 * mit Silben, durcheinander. Das Kind kuppelt sie der Reihe nach an: Passt die
 * Silbe als nächste, rollt der Wagen an die Lok, und die Stimme sagt sie; passt
 * sie nicht, stösst er an und rollt zurück – die Stimme sagt trotzdem, was
 * darauf steht. Ist das Wort ganz, sagt die Stimme es, und der Zug fährt ab.
 *
 * Und nach jedem dritten Wort ein Quatschtier zum Lachen: der Anfang des einen
 * Wortes und das Ende des anderen – aus Banane und Tomate wird die «Bamate».
 * Wiederholen ist nötig; Lachen macht es leicht.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "silbenbahn") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "silbenbahn";
  const RUNDE = 6;
  const SILBENFARBEN = ["#2f6fd0", "#e8543f", "#3fa34d", "#f5a623"];
  // Wie viele Silben je Stufe.
  const SILBEN = { leicht: [2, 2], mittel: [2, 3], schwer: [3, 5] };

  const HELP = [
    "Silbenbahn. Auf den Wagen stehen Silben.",
    "Kupple sie der Reihe nach an die Lok, damit das Wort zum Bild entsteht.",
    "Ein Tipp auf das Bild sagt das Wort.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";

  // Nach der Zahl der Silben, und wenn die Eltern Buchstaben abgehakt haben,
  // zuerst die Wörter, die sich damit lesen lassen.
  function wortListe() {
    const [min, max] = SILBEN[stufe()] || [2, 3];
    const liste = inhalte.SILBEN_WOERTER.filter((w) => w.silben.length >= min && w.silben.length <= max);
    return inhalte.lesbare(liste, stand?.bekannteLaute?.() || null, RUNDE);
  }

  // Das Quatschtier: die erste Silbe des einen, der Rest des anderen.
  function quatsch(a, b) {
    if (!a || !b || a.silben.length < 2 || b.silben.length < 2) return null;
    const wort = `${a.silben[0]}${b.silben.slice(1).join("").toLowerCase()}`;
    if (wort === a.wort || wort === b.wort) return null;
    return { wort, bilder: [a.bild, b.bild] };
  }

  const state = { nr: 0, punkte: 0, fehler: 0, dran: 0, phase: "intro", wort: null, vorher: null, runde: [] };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const bild = shell.el("button", "lese-bild sb-bild");
    bild.type = "button";
    bild.addEventListener("click", () => { if (state.wort) ton.sprich(state.wort.wort, { rate: 0.85 }); });
    const gleis = shell.el("div", "sb-gleis");
    const zug = shell.el("div", "sb-zug");
    const lok = spiel.eigeneLok();
    const angekuppelt = shell.el("div", "sb-angekuppelt");
    if (lok) zug.append(lok);
    zug.append(angekuppelt);
    gleis.append(zug, shell.el("div", "silben-schiene"));
    const neben = shell.el("div", "sb-neben");
    const quatschFeld = shell.el("div", "sb-quatsch");
    quatschFeld.hidden = true;
    shell.play.append(bild, gleis, neben, quatschFeld);
    el = { bild, zug, angekuppelt, neben, quatschFeld };
  }

  // Kurze Silben in grosser Schrift; erst ab vier Buchstaben wird sie kleiner,
  // damit der Wagen nicht zu lang wird.
  function wagenSvg(silbe, i) {
    return art.buildLautWagen(stand?.zeige?.(silbe) ?? silbe, { farbe: SILBENFARBEN[i % SILBENFARBEN.length], klein: silbe.length > 3 });
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.vorher = null;
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
    state.dran = 0;
    state.fehler = 0;
    state.phase = "kuppeln";
    el.zug.classList.remove("faehrt-ab");
    el.angekuppelt.innerHTML = "";
    el.quatschFeld.hidden = true;
    el.bild.textContent = state.wort.bild;
    el.bild.setAttribute("aria-label", "Das Bild. Antippen, um das Wort zu hören.");
    el.bild.classList.remove("ist-neu");
    void el.bild.offsetWidth;
    el.bild.classList.add("ist-neu");
    // Die Wagen gemischt – nie schon in der richtigen Reihenfolge.
    const silben = state.wort.silben.map((silbe, i) => ({ silbe, i }));
    let gemischt;
    let versuch = 0;
    do { gemischt = spiel.mische(silben); versuch += 1; } while (gemischt.every((s, i) => s.i === i) && versuch < 20);
    el.neben.innerHTML = "";
    gemischt.forEach(({ silbe, i }) => {
      const knopf = shell.el("button", "sb-wagen");
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      knopf.setAttribute("aria-label", `Silbe ${silbe}`);
      knopf.append(wagenSvg(silbe, i));
      knopf.addEventListener("click", () => kuppeln(i, silbe, knopf));
      el.neben.append(knopf);
    });
  }

  async function kuppeln(i, silbe, knopf) {
    if (state.phase !== "kuppeln") return;
    if (i !== state.dran && state.wort.silben[i] !== state.wort.silben[state.dran]) {
      state.fehler += 1;
      knopf.classList.remove("stoesst");
      void knopf.offsetWidth;
      knopf.classList.add("stoesst");
      kids()?.playJingle?.("retry");
      ton.sprich(silbe.toLowerCase(), { rate: 0.75 });
      if (state.fehler >= 2) el.neben.querySelector(`[data-nr="${state.dran}"]`)?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "rollt";
    knopf.remove();
    el.neben.querySelectorAll(".zeigt-hin").forEach((k) => k.classList.remove("zeigt-hin"));
    const wagen = shell.el("span", "sb-wagen sb-dran");
    wagen.append(wagenSvg(state.wort.silben[state.dran], state.dran));
    el.angekuppelt.append(wagen);
    kids()?.vibrate?.(10);
    await ton.sprich(state.wort.silben[state.dran].toLowerCase(), { rate: 0.75 });
    state.dran += 1;
    if (state.dran < state.wort.silben.length) { state.phase = "kuppeln"; return; }
    // Das ganze Wort.
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    kids()?.playJingle?.("correct");
    await ton.pause(200);
    await ton.sprich(state.wort.wort, { rate: 0.85 });
    await ton.pause(300);
    kids()?.playHorn?.({ chuffs: 2 });
    el.zug.classList.add("faehrt-ab");
    await ton.pause(850);
    const vorher = state.vorher;
    state.vorher = state.wort;
    state.nr += 1;
    if (state.nr % 3 === 0 && state.nr < state.runde.length) {
      const tier = quatsch(state.wort, vorher) || quatsch(vorher, state.wort);
      if (tier) { await zeigeQuatsch(tier); }
    }
    naechstes();
  }

  async function zeigeQuatsch(tier) {
    state.phase = "quatsch";
    el.quatschFeld.innerHTML = "";
    const bilder = shell.el("span", "sb-quatsch-bild");
    tier.bilder.forEach((b) => bilder.append(shell.el("span", "", b)));
    const wort = shell.el("span", "sb-quatsch-wort", stand?.zeige?.(tier.wort) ?? tier.wort);
    el.quatschFeld.append(bilder, wort);
    el.quatschFeld.hidden = false;
    kids()?.playJingle?.("star");
    await ton.sprich(`Und das ist eine ${tier.wort}!`, { rate: 0.85 });
    await ton.pause(900);
    el.quatschFeld.hidden = true;
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: state.runde.length,
      woerter: state.runde.length,
      label: "Silbenbahn",
      detail: `${state.punkte} von ${state.runde.length} Wörtern gleich richtig gekuppelt`,
      speech: state.punkte === state.runde.length
        ? "Du hast jedes Wort gleich richtig gekuppelt!"
        : `Du hast ${state.punkte} von ${state.runde.length} Wörtern gleich richtig gekuppelt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Silbenbahn", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappSilbenbahn = { RUNDE, wortListe, quatsch, jetzt: () => state.wort, dran: () => state.dran, nr: () => state.nr };
})();
