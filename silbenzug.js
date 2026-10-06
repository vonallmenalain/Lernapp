/*
 * silbenzug.js – Silben hören: für jede Silbe ein Wagen.
 *
 * Ein Bild, die Stimme sagt das Wort. Das Kind schlägt für jede Silbe einmal
 * auf die Trommel – und für jeden Schlag rollt ein Wagen an die Lok. Ein Tipp
 * auf das grüne Signal: Stimmt die Zahl, stehen die Silben auf den Wagen, die
 * Stimme sagt sie einzeln, und der Zug fährt ab. Stimmt sie nicht, ordnet
 * sich der Zug zur richtigen Zahl, und die Silben kommen trotzdem – so lernt
 * auch, wer daneben lag.
 *
 * Lesen muss hier niemand: Es geht ums Hören. Silben zu hören ist eine der
 * ersten Stufen der phonologischen Bewusstheit, im Kindergarten «Silben
 * schwingen» oder «klatschen».
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "silbenzug") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art) return;

  const kids = () => window.LernappKids || null;

  const ID = "silbenzug";
  const RUNDE = 6;
  const MAX_WAGEN = 5;
  const SILBENFARBEN = ["#2f6fd0", "#e8543f"];

  const HELP = [
    "Silbenzug.",
    "Hör dir das Wort an und schlage für jede Silbe einmal auf die Trommel.",
    "Für jeden Schlag kommt ein Wagen.",
    "Dann tippe auf das grüne Signal, und der Zug fährt los.",
    "Ein Tipp auf das Bild sagt das Wort noch einmal, ein Tipp auf einen Wagen nimmt ihn wieder weg.",
  ].join(" ");

  const ZAHL = ["keine", "eine", "zwei", "drei", "vier", "fünf"];

  // Wörter für die Stufe des Kindes: Die Jüngsten zählen bis drei Silben.
  function wortListe() {
    const stufe = stand?.stufe?.() || "mittel";
    const [min, max] = inhalte.SILBEN_JE_STUFE[stufe] || [1, 4];
    return inhalte.SILBEN_WOERTER.filter((w) => w.silben.length >= min && w.silben.length <= max);
  }

  const state = { nr: 0, punkte: 0, wort: null, wagen: 0, phase: "intro", runde: [] };
  let shell = null;
  let el = {};

  // ---------------------------------------------------------------------------
  // Aufbau
  // ---------------------------------------------------------------------------
  function buehne() {
    shell.clear();
    const oben = shell.el("div", "silben-oben");
    const bild = shell.el("button", "lese-bild silben-bild");
    bild.type = "button";
    bild.addEventListener("click", () => { if (state.wort) sageWort(); });
    oben.append(bild);

    const gleis = shell.el("div", "silben-gleis");
    const zug = shell.el("div", "silben-zug");
    const wagenReihe = shell.el("div", "silben-wagen");
    const lok = spiel.eigeneLok();
    zug.append(wagenReihe);
    if (lok) zug.append(lok);
    gleis.append(zug, shell.el("div", "silben-schiene"));

    const unten = shell.el("div", "silben-unten");
    const trommel = shell.el("button", "silben-trommel");
    trommel.type = "button";
    trommel.setAttribute("aria-label", "Auf die Trommel schlagen");
    trommel.append(art.buildTrommel());
    trommel.addEventListener("pointerdown", (ereignis) => { ereignis.preventDefault(); schlag(); });
    trommel.addEventListener("keydown", (ereignis) => { if (ereignis.key === "Enter" || ereignis.key === " ") { ereignis.preventDefault(); schlag(); } });
    const abfahrt = shell.el("button", "silben-abfahrt");
    abfahrt.type = "button";
    abfahrt.setAttribute("aria-label", "Abfahrt");
    abfahrt.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="20" y="22" width="8" height="24" rx="3" fill="#4a5568"/><rect x="10" y="2" width="28" height="26" rx="10" fill="#2f3542"/><circle cx="24" cy="15" r="9" fill="#3fbf74"/></svg>`;
    abfahrt.addEventListener("click", pruefe);
    unten.append(trommel, abfahrt);

    shell.play.append(oben, gleis, unten);
    el = { bild, zug, wagenReihe, trommel, abfahrt };
  }

  function zeichneWagen(silben = null) {
    el.wagenReihe.innerHTML = "";
    const anzahl = silben ? silben.length : state.wagen;
    for (let i = 0; i < anzahl; i += 1) {
      const text = silben ? stand?.zeige?.(silben[i]) ?? silben[i] : "";
      const wagen = art.buildLautWagen(text, { farbe: SILBENFARBEN[i % 2], breite: silben ? 0 : 96, klein: true });
      const knopf = shell.el("button", "silben-ein-wagen");
      knopf.type = "button";
      knopf.setAttribute("aria-label", silben ? `Silbe ${silben[i]}` : `Wagen ${i + 1}, antippen zum Wegnehmen`);
      knopf.append(wagen);
      if (!silben) knopf.addEventListener("click", wegnehmen);
      el.wagenReihe.append(knopf);
    }
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  function sageWort() {
    return ton.sprich(state.wort.wort, { rate: 0.85 });
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    shell.setCount(0);
    shell.closeOverlay();
    const liste = wortListe();
    // Verschieden lange Wörter: nicht sechsmal zwei Silben hintereinander.
    const nachLaenge = {};
    liste.forEach((w) => { (nachLaenge[w.silben.length] ||= []).push(w); });
    const laengen = Object.keys(nachLaenge);
    state.runde = Array.from({ length: RUNDE }, (_, i) => {
      const gruppe = nachLaenge[laengen[i % laengen.length]];
      return gruppe.splice(Math.floor(Math.random() * gruppe.length), 1)[0] || spiel.ziehe(liste, 1)[0];
    });
    state.runde = spiel.mische(state.runde);
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechstes();
      },
    });
  }

  function naechstes() {
    if (state.nr >= RUNDE) { fertig(); return; }
    state.wort = state.runde[state.nr];
    state.wagen = 0;
    state.phase = "klatschen";
    // Der abgefahrene Zug ist weg; der nächste rollt von links herein. Ohne
    // Überblendung zurück, sonst führe er rückwärts durchs Bild.
    el.zug.style.transition = "none";
    el.zug.classList.remove("faehrt-ab", "kommt-an");
    void el.zug.offsetWidth;
    el.zug.style.transition = "";
    if (state.nr > 0) el.zug.classList.add("kommt-an");
    el.bild.textContent = state.wort.bild;
    el.bild.setAttribute("aria-label", `Das Bild. Antippen, um das Wort zu hören.`);
    el.bild.classList.remove("ist-neu");
    void el.bild.offsetWidth;
    el.bild.classList.add("ist-neu");
    zeichneWagen();
    el.abfahrt.disabled = false;
    window.setTimeout(sageWort, 350);
  }

  function schlag() {
    if (state.phase !== "klatschen") return;
    el.trommel.classList.remove("schlag");
    void el.trommel.offsetWidth;
    el.trommel.classList.add("schlag");
    ton.klopf(150);
    kids()?.vibrate?.(12);
    if (state.wagen >= MAX_WAGEN) return;
    state.wagen += 1;
    zeichneWagen();
    el.wagenReihe.lastElementChild?.classList.add("rollt-an");
  }

  function wegnehmen() {
    if (state.phase !== "klatschen" || !state.wagen) return;
    state.wagen -= 1;
    zeichneWagen();
  }

  async function pruefe() {
    if (state.phase !== "klatschen") return;
    if (!state.wagen) {
      el.trommel.classList.remove("wackelt");
      void el.trommel.offsetWidth;
      el.trommel.classList.add("wackelt");
      return;
    }
    state.phase = "zeigen";
    el.abfahrt.disabled = true;
    const silben = state.wort.silben;
    const richtig = state.wagen === silben.length;
    if (richtig) {
      state.punkte += 1;
      shell.setCount(state.punkte);
      kids()?.playJingle?.("correct");
    } else {
      kids()?.playJingle?.("retry");
      el.zug.classList.add("wackelt");
      await ton.pause(450);
      el.zug.classList.remove("wackelt");
    }
    // Die Silben auf die Wagen, und die Stimme sagt sie einzeln – Wagen für
    // Wagen leuchtet mit.
    zeichneWagen(silben);
    const wagen = [...el.wagenReihe.children];
    for (let i = 0; i < silben.length; i += 1) {
      wagen.forEach((w, j) => w.classList.toggle("ist-dran", j === i));
      await ton.sprich(silben[i], { rate: 0.75 });
      await ton.pause(180);
    }
    wagen.forEach((w) => w.classList.remove("ist-dran"));
    if (!richtig) {
      await ton.sprich(`${state.wort.wort} hat ${ZAHL[silben.length]} ${silben.length === 1 ? "Silbe" : "Silben"}.`, { rate: 0.9 });
    }
    el.zug.classList.add("faehrt-ab");
    await ton.pause(900);
    state.nr += 1;
    naechstes();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: RUNDE,
      woerter: RUNDE,
      label: "Silbenzug",
      detail: `${state.punkte} von ${RUNDE} Zügen hatten genau richtig viele Wagen`,
      speech: state.punkte === RUNDE
        ? "Alle Züge hatten genau richtig viele Wagen. Super gehört!"
        : `${state.punkte} von ${RUNDE} Zügen hatten genau richtig viele Wagen.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Silbenzug", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs): das Wort, das gerade dran ist.
  window.LernappSilbenzug = { RUNDE, MAX_WAGEN, wortListe, wort: () => state.wort };
})();
