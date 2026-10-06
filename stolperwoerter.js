/*
 * stolperwoerter.js – Ein Stein liegt auf dem Gleis.
 *
 * Die Wörter eines Satzes liegen wie Steine auf einem Gleis, und einer gehört
 * nicht dazu: «Der Hund bellt Tasse laut.» Das Kind liest den Satz, findet
 * den Stolperstein und tippt ihn vom Gleis – dann liest die Stimme den Satz,
 * wie er sein soll. Wer flüssig und mit Sinn liest, stolpert sofort.
 *
 * Die Sätze kommen aus lesen-inhalte.js (SINN_SAETZE, nur die mit Sinn), auf
 * «schwer» auch aus den Büchern (lesen-buecher.js); die Stolpersteine sind
 * Dinge, die in keinen davon gehören (STOLPERSTEINE). Der Stein liegt nie
 * am Anfang und nie am Ende: Der Satz fängt richtig an und hört richtig auf.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "stolperwoerter") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton) return;

  const kids = () => window.LernappKids || null;

  const ID = "stolperwoerter";
  const RUNDE = 8;

  const HELP = [
    "Stolperwörter. Auf dem Gleis liegt ein Wort, das nicht in den Satz gehört.",
    "Lies den Satz und tippe den Stolperstein an, dann fährt er vom Gleis.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";

  // Die Sätze: aus der Liste mit Sinn, auf «schwer» dazu kurze Sätze aus den
  // Büchern ohne wörtliche Rede.
  function saetze() {
    const liste = inhalte.SINN_SAETZE.filter((s) => s.sinn).map((s) => s.satz);
    const bib = window.LernappLeseBuecher;
    if (stufe() === "schwer" && bib) {
      bib.BUECHER.filter((b) => b.stufe === "klein" || b.stufe === "geschichte").forEach((buch) => {
        buch.seiten.forEach((seite) => bib.saetze(seite.text).forEach((satz) => {
          const n = satz.split(/\s+/).length;
          if (n >= 5 && n <= 10 && !/[«»"–:]/.test(satz) && /\.$/.test(satz)) liste.push(satz);
        }));
      });
    }
    return [...new Set(liste)];
  }

  // Ein Stolperstein an einer Stelle zwischen dem ersten und dem letzten Wort.
  function aufgabe(satz) {
    const woerter = satz.split(/\s+/);
    const drin = new Set(woerter.map((w) => w.replace(/[.,!?]/g, "").toLowerCase()));
    const stein = spiel.mische(inhalte.STOLPERSTEINE).find((w) => !drin.has(w.toLowerCase()));
    const stelle = 1 + Math.floor(Math.random() * (woerter.length - 1));
    const mit = [...woerter.slice(0, stelle), stein, ...woerter.slice(stelle)];
    return { satz, stein, stelle, woerter: mit };
  }

  const state = { nr: 0, punkte: 0, fehler: 0, woerter: 0, phase: "intro", runde: [], aufgabe: null };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const gleis = shell.el("div", "sw-gleis");
    const reihe = shell.el("div", "sw-reihe");
    gleis.append(reihe, shell.el("div", "silben-schiene"));
    const hinweis = shell.el("p", "sw-hinweis", "Welches Wort gehört nicht hinein?");
    shell.play.append(hinweis, gleis);
    el = { reihe, hinweis };
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    state.runde = spiel.ziehe(saetze(), RUNDE).map(aufgabe);
    shell.setCount(0);
    shell.closeOverlay();
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechster();
      },
    });
  }

  function naechster() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.aufgabe = state.runde[state.nr];
    state.fehler = 0;
    state.phase = "suchen";
    const a = state.aufgabe;
    el.reihe.innerHTML = "";
    el.reihe.classList.remove("ist-frei");
    a.woerter.forEach((wort, i) => {
      const knopf = shell.el("button", "sw-wort", stand?.zeige?.(wort) ?? wort);
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      if (i === a.stelle) knopf.dataset.stein = "1";
      knopf.addEventListener("click", () => tippe(i, knopf));
      el.reihe.append(knopf);
    });
    if (stufe() === "leicht") ton.sprich(a.woerter.join(" "), { rate: 0.85 });
  }

  async function tippe(i, knopf) {
    if (state.phase !== "suchen" || knopf.classList.contains("ist-falsch")) return;
    const a = state.aufgabe;
    if (i !== a.stelle) {
      state.fehler += 1;
      knopf.classList.remove("wackelt");
      void knopf.offsetWidth;
      knopf.classList.add("wackelt", "ist-falsch");
      kids()?.playJingle?.("retry");
      if (state.fehler >= 2) el.reihe.querySelector('[data-stein="1"]')?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "frei";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    state.woerter += a.woerter.length - 1;
    knopf.classList.add("fliegt-weg");
    el.reihe.classList.add("ist-frei");
    kids()?.playJingle?.("correct");
    await ton.pause(450);
    knopf.remove();
    await ton.sprich(a.satz, { rate: 0.9 });
    await ton.pause(600);
    state.nr += 1;
    naechster();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Stolperwörter",
      detail: `${state.punkte} von ${von} Stolpersteinen gleich gefunden`,
      speech: state.punkte === von
        ? "Jeden Stolperstein gleich gefunden!"
        : `Du hast ${state.punkte} von ${von} Stolpersteinen gleich gefunden.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Stolperwörter", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappStolperwoerter = { RUNDE, saetze, aufgabe, jetzt: () => state.aufgabe, nr: () => state.nr, phase: () => state.phase };
})();
