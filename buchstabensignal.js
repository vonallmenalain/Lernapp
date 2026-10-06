/*
 * buchstabensignal.js – Halt nur beim richtigen Buchstaben!
 *
 * Wagen rollen vorbei, auf jedem ein Buchstabe. Oben am Signal steht, auf
 * welchen es ankommt: m. Tippt das Kind einen Wagen mit m oder M an, hält er
 * an und leuchtet grün; ein n leuchtet rot und rollt weiter. Ein m, das
 * vorbeirollt, ohne dass es jemand erwischt, ist verpasst.
 *
 * Die Buchstaben kommen in Paaren, die sich zum Verwechseln ähnlich sehen:
 * m und n, b und d, u und n, a und o … – und gross und klein durcheinander,
 * ausser das Kind sieht nur Grossbuchstaben. Gesucht wird ein Buchstabe aus
 * dem Buchstabenhaus dieses Kindes. Auf «leicht» rollen die Wagen langsamer.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "buchstabensignal") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "buchstabensignal";
  const WAGEN = 14;
  // Was sich zum Verwechseln ähnlich sieht: gesucht, und der Doppelgänger.
  const PAARE = [["m", "n"], ["n", "m"], ["b", "d"], ["d", "b"], ["u", "n"], ["n", "u"], ["p", "b"], ["b", "p"], ["a", "o"], ["o", "a"], ["e", "a"], ["f", "t"], ["t", "f"], ["h", "n"], ["w", "v"], ["i", "l"], ["l", "i"]];
  // Wie lange ein Wagen durchs Bild braucht, je Stufe (Millisekunden).
  const DAUER = { leicht: 6200, mittel: 4800, schwer: 3800 };
  const FARBEN = ["#2f6fd0", "#e8543f", "#3fa34d", "#f5a623", "#7c5ce6", "#00a5b5"];

  const HELP = [
    "Buchstaben-Signal. Am Signal steht ein Buchstabe.",
    "Tippe jeden Wagen an, auf dem dieser Buchstabe steht – gross oder klein. Die anderen lässt du vorbeirollen.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];

  // Ein Paar, dessen gesuchter Buchstabe im Buchstabenhaus wohnt.
  function paar() {
    const gruppe = inhalte.GRUPPE_JE_LESESTUFE[stand?.lesestufe?.() || "buchstaben"] || 3;
    const haus = new Set(inhalte.hausLaute(stand?.bekannteLaute?.() || null, gruppe).map((l) => l.id));
    const passend = PAARE.filter(([gesucht]) => haus.has(gesucht));
    return zufall(passend.length ? passend : PAARE);
  }

  // Die Reihe der Wagen: knapp die Hälfte mit dem gesuchten Buchstaben, nie
  // mehr als zwei gleiche nacheinander.
  function reihe([gesucht, anders]) {
    const nurGross = stand?.nurGross?.() ?? false;
    const form = (b) => (nurGross || Math.random() < 0.5 ? b.toUpperCase() : b);
    const liste = [];
    while (liste.length < WAGEN) {
      const treffer = Math.random() < 0.45;
      const letzte = liste.slice(-2);
      const istTreffer = letzte.length === 2 && letzte.every((w) => w.treffer === treffer) ? !treffer : treffer;
      liste.push({ zeichen: form(istTreffer ? gesucht : anders), treffer: istTreffer });
    }
    if (!liste.some((w) => w.treffer)) liste[0] = { zeichen: form(gesucht), treffer: true };
    return liste;
  }

  // lauf: jede Runde eine neue Nummer – Wagen einer alten Runde fahren nicht mehr los.
  const state = { phase: "intro", paar: null, reihe: [], erwischt: 0, daneben: 0, verpasst: 0, unterwegs: 0, gesendet: 0, lauf: 0, timer: [], faktor: 1 };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const signal = shell.el("div", "bsg-signal");
    signal.setAttribute("aria-live", "polite");
    const mast = shell.el("span", "bsg-mast");
    mast.setAttribute("aria-hidden", "true");
    const tafel = shell.el("span", "bsg-tafel");
    signal.append(mast, tafel);
    const strecke = shell.el("div", "bsg-strecke");
    strecke.append(shell.el("div", "bsg-schiene"));
    const stand_ = shell.el("p", "bsg-stand");
    shell.play.append(signal, strecke, stand_);
    el = { signal, tafel, strecke, stand: stand_ };
  }

  function zeigeStand() {
    el.stand.textContent = `✓ ${state.erwischt}   ✗ ${state.daneben}`;
  }

  function start() {
    state.timer.forEach((t) => window.clearTimeout(t));
    state.timer = [];
    state.lauf += 1;
    state.unterwegs = 0;
    state.gesendet = 0;
    state.erwischt = 0;
    state.daneben = 0;
    state.verpasst = 0;
    state.paar = paar();
    state.reihe = reihe(state.paar);
    shell.setCount(0);
    shell.closeOverlay();
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        los();
      },
    });
  }

  async function los() {
    state.phase = "fahren";
    const [gesucht] = state.paar;
    const nurGross = stand?.nurGross?.() ?? false;
    el.tafel.textContent = nurGross ? gesucht.toUpperCase() : `${gesucht.toUpperCase()} ${gesucht}`;
    zeigeStand();
    const laut = inhalte.LAUT_BY_ID[gesucht];
    if (laut && ton.lautHoerbar(gesucht)) await ton.laut(gesucht);
    if (laut) await ton.sprich(`Halt bei jedem Wagen mit diesem Buchstaben – wie bei ${laut.wort}.`, { rate: 0.9 });
    const dauer = (DAUER[stufe()] || DAUER.mittel) * state.faktor;
    const abstand = dauer / 3.1;
    const lauf = state.lauf;
    state.reihe.forEach((wagen, i) => {
      state.timer.push(window.setTimeout(() => { if (lauf === state.lauf) schicke(wagen, i, dauer); }, 300 + i * abstand));
    });
  }

  // Ein Wagen rollt von rechts nach links durchs Bild.
  function schicke(wagen, i, dauer) {
    if (state.phase !== "fahren") return;
    const knopf = shell.el("button", "bsg-wagen");
    knopf.type = "button";
    knopf.dataset.zeichen = wagen.zeichen;
    if (wagen.treffer) knopf.dataset.treffer = "1";
    knopf.setAttribute("aria-label", `Wagen mit ${wagen.zeichen}`);
    knopf.style.setProperty("--bsg-dauer", `${dauer}ms`);
    knopf.append(art.buildLautWagen(wagen.zeichen, { farbe: FARBEN[i % FARBEN.length] }));
    state.unterwegs += 1;
    let getippt = false;
    let fort = false;
    // Der Wagen ist weg: durchgerollt oder angehalten und abgeholt. Der
    // letzte beendet die Runde.
    const weg = () => {
      if (fort) return;
      fort = true;
      if (wagen.treffer && !getippt) {
        state.verpasst += 1;
        el.signal.classList.remove("blinkt");
        void el.signal.offsetWidth;
        el.signal.classList.add("blinkt");
      }
      knopf.remove();
      state.unterwegs -= 1;
      if (state.unterwegs === 0 && state.gesendet === state.reihe.length) window.setTimeout(fertig, 300);
    };
    knopf.addEventListener("click", () => {
      if (getippt || state.phase !== "fahren") return;
      getippt = true;
      if (wagen.treffer) {
        state.erwischt += 1;
        shell.setCount(state.erwischt);
        knopf.classList.add("ist-richtig");
        kids()?.playJingle?.("correct");
        ton.klopf(660);
        // Ein erwischter Wagen hält an und wird abgeholt.
        window.setTimeout(weg, 900);
      } else {
        state.daneben += 1;
        // Für den Bericht an die Eltern: m und n verwechselt.
        if (state.daneben === 1) stand?.verwechselt?.(state.paar[0], state.paar[1]);
        knopf.classList.add("ist-falsch");
        kids()?.vibrate?.(30);
        ton.klopf(240);
      }
      zeigeStand();
    });
    knopf.addEventListener("animationend", (ereignis) => { if (ereignis.target === knopf) weg(); });
    el.strecke.append(knopf);
    state.gesendet += 1;
  }

  function fertig() {
    if (state.phase !== "fahren") return;
    state.phase = "over";
    const von = state.reihe.filter((w) => w.treffer).length;
    // Der Laut im Lesestand: Eine Runde ohne Fehlgriff zählt als Treffer,
    // eine mit Fehlgriff als Fehler; nur verpasst sagt nichts über das Lesen.
    if (state.daneben > 0) stand?.lautGeuebt?.(state.paar[0], false);
    else if (state.erwischt === von) stand?.lautGeuebt?.(state.paar[0], true);
    const punkte = Math.max(0, state.erwischt - state.daneben);
    spiel.ergebnis(shell, {
      id: ID,
      punkte,
      von,
      woerter: 0,
      label: "Buchstaben-Signal",
      detail: `${state.erwischt} von ${von} erwischt, ${state.daneben} daneben`,
      speech: state.erwischt === von && state.daneben === 0
        ? "Alle erwischt, und keiner daneben. Scharfe Augen!"
        : `Du hast ${state.erwischt} von ${von} erwischt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Buchstaben-Signal", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappBuchstabenSignal = {
    WAGEN, PAARE, DAUER, paar, reihe,
    // Die Prüfung lässt die Wagen schneller rollen.
    tempo: (faktor) => { state.faktor = faktor; },
    jetzt: () => ({ phase: state.phase, paar: state.paar, erwischt: state.erwischt, daneben: state.daneben, verpasst: state.verpasst, reihe: state.reihe }),
  };
})();
