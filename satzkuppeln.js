/*
 * satzkuppeln.js – Satz kuppeln: Wort für Wort an die Lok.
 *
 * Ein Bild, und darunter stehen die Wörter des Satzes auf Wagen, durcheinander.
 * Das Kind kuppelt sie an die Lok, in der Reihenfolge, in der man den Satz
 * liest: vorne das Wort mit dem grossen Anfang, hinten der Wagen mit dem
 * Punkt – er trägt das rote Schlusslicht. Passt ein Wort nicht als nächstes,
 * stösst der Wagen an und rollt zurück. Ist der Satz ganz, liest die Stimme
 * ihn, und der Zug fährt ab.
 *
 * Das Bild ist das aus «Stimmt das?» und den Lückensätzen (lesen-art.js,
 * buildSzene): Was im Satz steht, ist zu sehen. Auf «leicht» ist der Satz kurz
 * («Der Fuchs schläft.»), sonst ganz, auf «schwer» auch mit mehreren Tieren.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "satzkuppeln") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art || !window.LernappTrainArt) return;

  const kids = () => window.LernappKids || null;

  const ID = "satzkuppeln";
  const RUNDE = 6;
  const FARBEN = ["#2f6fd0", "#e8543f", "#3fa34d", "#f5a623", "#7c5ce6", "#00a5b5"];

  const HELP = [
    "Satz kuppeln. Schau das Bild an.",
    "Kupple die Wörter so an die Lok, dass der Satz dazu stimmt: vorne das Wort mit dem grossen Anfang, hinten das mit dem Punkt.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];
  const zeige = (text) => stand?.zeige?.(text) ?? text;

  // ---------------------------------------------------------------------------
  // Würfeln
  // ---------------------------------------------------------------------------
  function wuerfleLage() {
    for (let versuch = 0; versuch < 60; versuch += 1) {
      const ding = zufall(inhalte.DINGE);
      const wo = zufall(ding.wo);
      const tun = zufall(inhalte.TUN).id;
      if (!art.szenePasst({ ding: ding.id, wo, tun })) continue;
      const platz = art.platzFuer(ding.id, wo, tun);
      const anzahl = stufe() === "schwer" ? 1 + Math.floor(Math.random() * platz) : 1;
      return { tier: zufall(inhalte.TIERE).id, ding: ding.id, wo, anzahl, tun };
    }
    return { tier: "fox", ding: "tisch", wo: "auf", anzahl: 1, tun: "steht" };
  }

  // Die Wörter des Satzes, wie sie auf den Wagen stehen. Auf «leicht» nur
  // wer und was er tut.
  function woerter(lage) {
    const teile = inhalte.satzTeile(lage);
    const kurz = stufe() === "leicht" ? teile.filter((t) => ["artikel", "anzahl", "tier", "tun"].includes(t.rolle)) : teile;
    const liste = kurz.flatMap((t) => t.text.split(" "));
    liste[liste.length - 1] += ".";
    return liste;
  }

  function aufgabe() {
    const lage = wuerfleLage();
    const liste = woerter(lage);
    return { lage, woerter: liste, satz: liste.join(" ") };
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  const state = { nr: 0, punkte: 0, fehler: 0, fehlgriffe: 0, dran: 0, phase: "intro", aufgabe: null, woerter: 0 };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const bild = shell.el("div", "sk-bild");
    const gleis = shell.el("div", "sk-gleis");
    const zug = shell.el("div", "sk-zug");
    const lok = spiel.eigeneLok();
    const angekuppelt = shell.el("div", "sk-angekuppelt");
    if (lok) zug.append(lok);
    zug.append(angekuppelt);
    gleis.append(zug, shell.el("div", "silben-schiene"));
    const neben = shell.el("div", "sk-neben");
    shell.play.append(bild, gleis, neben);
    el = { bild, zug, angekuppelt, neben };
  }

  // Ein Wort-Wagen; der letzte trägt das Schlusslicht.
  function wagen(wort, i, { letzter = false } = {}) {
    const svg = art.buildLautWagen(zeige(wort), { farbe: FARBEN[i % FARBEN.length], klein: wort.length > 3 });
    if (letzter) {
      const w = Number(svg.getAttribute("width")) || 120;
      svg.append(art.el("circle", { cx: w - 7, cy: 30, r: 6, fill: "#e8543f", stroke: "#ffffff", "stroke-width": 2, class: "sk-schlusslicht" }));
    }
    return svg;
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    shell.setCount(0);
    shell.closeOverlay();
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechste();
      },
    });
  }

  function naechste() {
    if (state.nr >= RUNDE) { fertig(); return; }
    state.aufgabe = aufgabe();
    state.dran = 0;
    state.fehler = 0;
    state.fehlgriffe = 0;
    state.phase = "kuppeln";
    const a = state.aufgabe;
    // Die Lok vom letzten Satz ist links hinaus; die nächste kommt von rechts.
    el.zug.classList.remove("faehrt-ab", "kommt-an");
    if (state.nr > 0) {
      void el.zug.offsetWidth;
      el.zug.classList.add("kommt-an");
    }
    el.angekuppelt.innerHTML = "";
    el.bild.innerHTML = "";
    el.bild.append(art.buildSzene(a.lage, { klasse: "sk-bild-svg" }));
    shell.play.style.setProperty("--sk-n", String(a.woerter.length));
    // Gemischt, nie schon in der richtigen Reihenfolge.
    const reihe = a.woerter.map((wort, i) => ({ wort, i }));
    let gemischt;
    let versuch = 0;
    do { gemischt = spiel.mische(reihe); versuch += 1; } while (gemischt.every((w, i) => w.i === i) && versuch < 20);
    el.neben.innerHTML = "";
    gemischt.forEach(({ wort, i }) => {
      const knopf = shell.el("button", "sk-wagen");
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      knopf.setAttribute("aria-label", `Wagen ${wort}`);
      knopf.append(wagen(wort, i, { letzter: i === a.woerter.length - 1 }));
      knopf.addEventListener("click", () => kuppeln(i, knopf));
      el.neben.append(knopf);
    });
  }

  async function kuppeln(i, knopf) {
    if (state.phase !== "kuppeln") return;
    const a = state.aufgabe;
    // Dasselbe Wort zweimal (die, die) passt an beiden Stellen.
    if (i !== state.dran && a.woerter[i] !== a.woerter[state.dran]) {
      state.fehler += 1;
      state.fehlgriffe += 1;
      knopf.classList.remove("stoesst");
      void knopf.offsetWidth;
      knopf.classList.add("stoesst");
      kids()?.playJingle?.("retry");
      ton.sprich(a.woerter[i].replace(/\.$/, ""), { rate: 0.85 });
      if (state.fehlgriffe >= 2) el.neben.querySelector(`[data-nr="${state.dran}"]`)?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "rollt";
    const nr = state.dran;
    knopf.remove();
    el.neben.querySelectorAll(".zeigt-hin").forEach((k) => k.classList.remove("zeigt-hin"));
    const angehaengt = shell.el("span", "sk-wagen sk-dran");
    angehaengt.append(wagen(a.woerter[nr], nr, { letzter: nr === a.woerter.length - 1 }));
    el.angekuppelt.append(angehaengt);
    state.dran += 1;
    state.fehlgriffe = 0;
    kids()?.vibrate?.(10);
    ton.klopf(420 + nr * 50);
    if (state.dran < a.woerter.length) { state.phase = "kuppeln"; return; }
    // Der ganze Satz.
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    state.woerter += a.woerter.length;
    kids()?.playJingle?.("correct");
    await ton.pause(200);
    await ton.sprich(a.satz, { rate: 0.9 });
    await ton.pause(250);
    kids()?.playHorn?.({ chuffs: 2 });
    el.zug.classList.add("faehrt-ab");
    await ton.pause(900);
    state.nr += 1;
    naechste();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: RUNDE,
      woerter: state.woerter,
      label: "Satz kuppeln",
      detail: `${state.punkte} von ${RUNDE} Sätzen gleich richtig gekuppelt`,
      speech: state.punkte === RUNDE
        ? "Jeden Satz gleich richtig gekuppelt!"
        : `Du hast ${state.punkte} von ${RUNDE} Sätzen gleich richtig gekuppelt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Satz kuppeln", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappSatzKuppeln = { RUNDE, aufgabe, woerter, jetzt: () => state.aufgabe, dran: () => state.dran, nr: () => state.nr, phase: () => state.phase };
})();
