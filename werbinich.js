/*
 * werbinich.js – Wer bin ich? Ein Rätsel in Häppchen.
 *
 * Auf dem Zettel steht der erste Hinweis: «Ich bin ein Tier.» Daneben vier
 * Bilder. Wer schon weiss, wer gemeint ist, tippt das Bild an; wer noch
 * nicht sicher ist, holt sich mit der Lupe den nächsten Hinweis. Je weniger
 * Hinweise es gebraucht hat, desto mehr Punkte: drei nach höchstens zwei
 * Hinweisen, zwei nach drei, sonst einer. Ein falsches Bild wird
 * durchgestrichen, und der nächste Hinweis kommt von selbst.
 *
 * Die Rätsel stehen in lesen-inhalte.js (RAETSEL): Die Hinweise gehen vom
 * Allgemeinen zum Genauen, und die anderen Bilder passen zu den ersten
 * Hinweisen auch – zu früh raten lohnt sich nicht immer. Auf «leicht» sind es
 * drei Bilder, und die Stimme liest jeden Hinweis vor; sonst liest sie ihn
 * auf Tipp.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "werbinich") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !inhalte.RAETSEL) return;

  const kids = () => window.LernappKids || null;

  const ID = "werbinich";
  const RUNDE = 6;
  const PUNKTE_MAX = 3;

  const HELP = [
    "Wer bin ich? Lies den Hinweis auf dem Zettel.",
    "Weisst du, wer gemeint ist? Dann tippe auf das Bild. Sonst holt dir die Lupe einen Hinweis mehr.",
    "Je weniger Hinweise du brauchst, desto mehr Punkte gibt es.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";
  const zeige = (text) => stand?.zeige?.(text) ?? text;
  // Punkte für ein gelöstes Rätsel, nach der Zahl der gelesenen Hinweise.
  const punkteFuer = (hinweise) => (hinweise <= 2 ? 3 : (hinweise === 3 ? 2 : 1));

  function runde() {
    return spiel.ziehe(inhalte.RAETSEL, RUNDE);
  }

  const state = { nr: 0, punkte: 0, woerter: 0, phase: "intro", runde: [], raetsel: null, gezeigt: 0, bilder: [] };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const zettel = shell.el("div", "wi-zettel");
    const liste = shell.el("ol", "wi-hinweise");
    const mehr = shell.el("button", "wi-mehr");
    mehr.type = "button";
    mehr.append(shell.el("span", "wi-mehr-bild", "🔎"), shell.el("span", "wi-mehr-text", "Noch ein Hinweis"));
    mehr.addEventListener("click", () => { if (state.phase === "raten") hinweis({ vorlesen: true }); });
    zettel.append(liste, mehr);
    const bilder = shell.el("div", "wi-bilder");
    // Links der Zettel, rechts die Bilder.
    const mitte = shell.el("div", "wi-mitte");
    mitte.append(zettel, bilder);
    shell.play.append(mitte);
    el = { zettel, liste, mehr, bilder };
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    state.runde = runde();
    shell.setCount(0);
    shell.closeOverlay();
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
    const r = state.runde[state.nr];
    state.raetsel = r;
    state.gezeigt = 0;
    state.phase = "raten";
    const andere = spiel.mische(r.andere).slice(0, stufe() === "leicht" ? 2 : 3);
    state.bilder = spiel.mische([r.bild, ...andere]);
    el.liste.innerHTML = "";
    el.bilder.innerHTML = "";
    el.bilder.dataset.anzahl = String(state.bilder.length);
    state.bilder.forEach((bild) => {
      const knopf = shell.el("button", "wi-bild", bild);
      knopf.type = "button";
      knopf.dataset.bild = bild;
      if (bild === r.bild) knopf.dataset.richtig = "1";
      knopf.setAttribute("aria-label", "Ein Bild – bin ich das?");
      knopf.addEventListener("click", () => rate(bild, knopf));
      el.bilder.append(knopf);
    });
    hinweis({ vorlesen: stufe() === "leicht" });
  }

  // Der nächste Hinweis kommt auf den Zettel.
  function hinweis({ vorlesen = false } = {}) {
    const r = state.raetsel;
    if (!r || state.gezeigt >= r.hinweise.length) return;
    const text = r.hinweise[state.gezeigt];
    state.gezeigt += 1;
    const zeile = shell.el("li", "wi-zeile");
    const knopf = shell.el("button", "wi-hinweis", zeige(text));
    knopf.type = "button";
    knopf.addEventListener("click", () => ton.sprich(text, { rate: 0.85 }));
    zeile.append(knopf);
    el.liste.append(zeile);
    el.liste.querySelectorAll(".wi-hinweis").forEach((k) => k.classList.toggle("ist-neu", k === knopf));
    el.mehr.disabled = state.gezeigt >= r.hinweise.length;
    if (vorlesen) ton.sprich(text, { rate: 0.85 });
  }

  async function rate(bild, knopf) {
    if (state.phase !== "raten" || knopf.disabled) return;
    const r = state.raetsel;
    if (bild !== r.bild) {
      knopf.disabled = true;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      // Ein falscher Tipp kostet einen Hinweis: der nächste kommt von selbst.
      hinweis({ vorlesen: true });
      return;
    }
    state.phase = "geloest";
    const punkte = punkteFuer(state.gezeigt);
    state.punkte += punkte;
    state.woerter += r.hinweise.slice(0, state.gezeigt).join(" ").split(/\s+/).length;
    shell.setCount(state.punkte);
    knopf.classList.add("ist-richtig");
    el.bilder.querySelectorAll(".wi-bild").forEach((k) => { if (k !== knopf) k.classList.add("ist-weg"); });
    el.mehr.disabled = true;
    kids()?.playJingle?.("correct");
    const lob = punkte === PUNKTE_MAX ? "Schon erraten!" : "Richtig!";
    await ton.sprich(`${lob} Ich bin ${r.wer}.`, { rate: 0.9 });
    await ton.pause(500);
    state.nr += 1;
    naechstes();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length * PUNKTE_MAX;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Wer bin ich?",
      detail: `${state.punkte} von ${von} Punkten – ${state.runde.length} Rätsel gelöst`,
      speech: state.punkte === von
        ? "Jedes Rätsel schon nach zwei Hinweisen gelöst. Du bist ein echter Lesedetektiv!"
        : `Du hast ${state.punkte} von ${von} Punkten.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Wer bin ich?", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappWerBinIch = {
    RUNDE, PUNKTE_MAX, punkteFuer, runde,
    jetzt: () => state.raetsel, gezeigt: () => state.gezeigt, bilder: () => state.bilder.slice(),
    nr: () => state.nr, punkte: () => state.punkte, phase: () => state.phase,
  };
})();
