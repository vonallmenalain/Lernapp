/*
 * lautekuppeln.js – Aus Lauten wird ein Wort.
 *
 * Die Laute eines Wortes stehen auf einzelnen Wagen, mit Abstand. Das Kind
 * tippt sie von links nach rechts an, und jeder Wagen rollt an den vorigen
 * und kuppelt an. Dabei ist zu hören, wie die Laute ineinandergleiten: erst
 * der Laut allein, dann die halbe Silbe, dann die ganze – «R», «Ro», dann «s»,
 * «se». So machen es Kinder in der Schule mit dem Finger unter dem Wort
 * (Lautieren und Zusammenschleifen).
 *
 * Das ganze Wort sagt die Stimme erst, wenn das Kind es gelesen hat: Es tippt
 * auf das passende Bild unter drei. Stimmt es, kommt die eigene Lok, kuppelt
 * vorne an und fährt das Wort davon.
 *
 * Die Wagen tragen die Silben in zwei Farben, wie in vielen Erstlesebüchern:
 * Silbe für Silbe sieht man, wo man atmen darf.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "lautekuppeln") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "lautekuppeln";
  const RUNDE = 5;
  const SILBENFARBEN = ["#2f6fd0", "#e8543f"];

  const HELP = [
    "Laute kuppeln. Auf jedem Wagen steht ein Laut.",
    "Tippe die Wagen von links nach rechts an: Jeder rollt an den vorigen, und die Laute fahren zusammen.",
    "Wenn alle gekuppelt sind, tippe auf das Bild, das zum Wort passt.",
  ].join(" ");

  // Welche Wörter: nach der Stufe des Kindes (lesen-inhalte.js) – oder, wenn
  // die Eltern die Buchstaben der Schule abgehakt haben, alle, die sich damit
  // lesen lassen.
  function wortListe() {
    const bekannt = stand?.bekannteLaute?.() || null;
    if (bekannt) return inhalte.lesbare(inhalte.KUPPEL_WOERTER, bekannt, RUNDE);
    const stufe = stand?.stufe?.() || "mittel";
    const gruppen = inhalte.KUPPELN_JE_STUFE[stufe] || [1, 2];
    return inhalte.KUPPEL_WOERTER.filter((w) => gruppen.includes(w.stufe));
  }

  const state = { nr: 0, punkte: 0, wort: null, teile: [], dran: 0, phase: "intro", fehler: 0, runde: [] };
  let shell = null;
  let el = {};

  // Das Wort in Steine zerlegt, mit Silbe und Stelle: für «Rose»
  // [{ text: "R", silbe: 0, stelle: 0 }, { text: "o", silbe: 0, stelle: 1 }, …].
  function zerlege(wort) {
    const teile = [];
    inhalte.steineDerSilben(wort.silben).forEach((steine, silbe) => {
      steine.forEach((text, stelle) => teile.push({ text, silbe, stelle, letzte: stelle === steine.length - 1 }));
    });
    return teile;
  }

  // ---------------------------------------------------------------------------
  // Aufbau
  // ---------------------------------------------------------------------------
  function buehne() {
    shell.clear();
    const frage = shell.el("p", "kp-frage");
    frage.hidden = true;
    const gleis = shell.el("div", "kp-gleis");
    const zug = shell.el("div", "kp-zug");
    gleis.append(zug, shell.el("div", "silben-schiene"));
    const bilder = shell.el("div", "kp-bilder");
    bilder.hidden = true;
    shell.play.append(frage, gleis, bilder);
    el = { frage, gleis, zug, bilder };
  }

  function zeichneWort() {
    el.zug.innerHTML = "";
    el.zug.classList.remove("faehrt-ab");
    state.teile.forEach((teil, i) => {
      const knopf = shell.el("button", "kp-wagen");
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      knopf.setAttribute("aria-label", `Laut ${teil.text}`);
      const text = stand?.zeige?.(teil.text) ?? teil.text;
      knopf.append(art.buildLautWagen(text, { farbe: SILBENFARBEN[teil.silbe % 2], breite: Math.max(84, 46 + text.length * 30) }));
      knopf.addEventListener("click", () => kuppel(i));
      el.zug.append(knopf);
    });
    markiereDran();
  }

  function markiereDran() {
    [...el.zug.children].forEach((knopf, i) => {
      knopf.classList.toggle("ist-dran", i === state.dran && state.phase === "kuppeln");
      knopf.classList.toggle("gekuppelt", i < state.dran || (i === 0 && state.dran > 0));
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
    state.teile = zerlege(state.wort);
    state.dran = 0;
    state.fehler = 0;
    state.phase = "kuppeln";
    el.frage.hidden = true;
    el.bilder.hidden = true;
    el.bilder.innerHTML = "";
    zeichneWort();
  }

  async function kuppel(i) {
    if (state.phase !== "kuppeln") return;
    if (i !== state.dran) {
      // Nicht dieser – der, der leuchtet. Ein kurzes Wackeln zeigt es.
      const dran = el.zug.children[state.dran];
      dran?.classList.remove("wackelt");
      void dran?.offsetWidth;
      dran?.classList.add("wackelt");
      return;
    }
    state.phase = "hoeren";
    const teil = state.teile[i];
    state.dran = i + 1;
    markiereDran();
    kids()?.vibrate?.(10);
    const ganzesWort = state.dran === state.teile.length;
    if (teil.stelle === 0) {
      // Der erste Laut einer Silbe: allein, wenn er hörbar ist.
      const gehoert = await ton.laut(inhalte.lautId(teil.text));
      if (!gehoert) ton.klopf(420);
    } else {
      // Die halbe oder ganze Silbe: so weit, wie gekuppelt ist. Das ganze
      // Wort sagt die Stimme noch nicht – das liest das Kind selbst.
      const silbe = state.teile.filter((t) => t.silbe === teil.silbe && t.stelle <= teil.stelle).map((t) => t.text).join("");
      const istGanzesWort = ganzesWort && state.wort.silben.length === 1;
      if (istGanzesWort) ton.klopf(520);
      else await ton.sprich(silbe.toLowerCase(), { rate: 0.75 });
    }
    if (ganzesWort) { await ton.pause(250); zeigeBilder(); return; }
    state.phase = "kuppeln";
    markiereDran();
  }

  function zeigeBilder() {
    state.phase = "bild";
    markiereDran();
    el.frage.hidden = false;
    el.frage.textContent = "Was hast du gelesen?";
    const pool = wortListe().filter((w) => w.bild !== state.wort.bild && w.wort[0] !== state.wort.wort[0]);
    const andere = spiel.ziehe(pool, 2);
    const wahl = spiel.mische([state.wort, ...andere]);
    el.bilder.innerHTML = "";
    wahl.forEach((w) => {
      const knopf = shell.el("button", "lese-bild kp-bild");
      knopf.type = "button";
      knopf.textContent = w.bild;
      knopf.setAttribute("aria-label", "Ein Bild");
      knopf.addEventListener("click", () => waehle(w, knopf));
      el.bilder.append(knopf);
    });
    el.bilder.hidden = false;
    ton.sprich("Was hast du gelesen?", { rate: 0.95 });
  }

  async function waehle(w, knopf) {
    if (state.phase !== "bild") return;
    if (w !== state.wort) {
      state.fehler += 1;
      knopf.classList.remove("wackelt");
      void knopf.offsetWidth;
      knopf.classList.add("wackelt", "ist-falsch");
      kids()?.playJingle?.("retry");
      if (state.fehler >= 2) [...el.bilder.children].find((k) => k.textContent === state.wort.bild)?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "fahren";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich(state.wort.wort, { rate: 0.85 });
    // Die eigene Lok kommt, kuppelt vorne an und fährt das Wort davon.
    const lok = spiel.eigeneLok();
    if (lok) {
      lok.classList.add("kp-lok", "kommt-an");
      el.zug.append(lok);
      await ton.pause(650);
    }
    kids()?.playHorn?.({ chuffs: 3 });
    el.zug.classList.add("faehrt-ab");
    await ton.pause(950);
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
      label: "Laute kuppeln",
      detail: `${state.punkte} von ${state.runde.length} Wörtern gleich richtig gelesen`,
      speech: state.punkte === state.runde.length
        ? "Du hast jedes Wort gleich richtig gelesen. Super!"
        : `Du hast ${state.punkte} von ${state.runde.length} Wörtern gleich richtig gelesen.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Laute kuppeln", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs): das Wort, das gerade dran ist.
  window.LernappLauteKuppeln = { RUNDE, wortListe, zerlege, wort: () => state.wort };
})();
