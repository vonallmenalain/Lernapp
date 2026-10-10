/*
 * stolperwoerter.js – Ein Stein liegt auf dem Gleis.
 *
 * Die Wörter eines Satzes liegen wie Steine auf einem Gleis, und einer gehört
 * nicht dazu: «Der Hund bellt Tasse laut.» Das Kind liest den Satz, findet
 * den Stolperstein und tippt ihn vom Gleis – dann liest die Stimme den Satz,
 * wie er sein soll. Wer flüssig und mit Sinn liest, stolpert sofort.
 *
 * Der Lautsprecher über den Wörtern liest den Satz vor, so wie er daliegt –
 * mit dem Stolperstein. Auf «leicht» tut die Stimme das bei jedem Satz von
 * selbst, und der Lautsprecher sagt ihn noch einmal; auf «mittel» und
 * «schwer» liest sie nur, wenn das Kind darauf tippt.
 *
 * Die Sätze kommen aus lesen-inhalte.js (SINN_SAETZE, nur die mit Sinn), auf
 * «schwer» auch aus den Büchern (lesen-buecher.js); die Stolpersteine sind
 * Dinge, die in keinen davon gehören (STOLPERSTEINE). Der Stein liegt nie
 * am Anfang und nie am Ende: Der Satz fängt richtig an und hört richtig auf.
 *
 * Auf «schwer» gibt es neben «Los» die Runde auf Zeit: 45 Sekunden, so viele
 * Sätze wie möglich. Die Stimme schweigt dann, der Lautsprecher fehlt, und
 * jeder gefundene Stein zählt – ein Fehlgriff kostet nur Zeit. Zehn sind
 * drei Sterne.
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
  // Auf Zeit: so viele gefundene Steine sind drei Sterne.
  const ZEIT_ZIEL = 10;

  const HELP = [
    "Stolperwörter. Auf dem Gleis liegt ein Wort, das nicht in den Satz gehört.",
    "Lies den Satz und tippe den Stolperstein an, dann fährt er vom Gleis.",
  ].join(" ");

  const HELP_VORLESEN = "Der Lautsprecher über den Wörtern liest dir den Satz vor.";
  const HELP_ZEIT = "Mit der Uhr spielst du auf Zeit: 45 Sekunden, so viele Sätze wie möglich.";

  // Gezeichnet wie der Lautsprecher im Bücherregal (buecher.js), die beiden
  // Schallwellen einzeln: Solange er vorliest, wandern sie.
  const LAUTSPRECHER = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="sw-vorlesen-rund" cx="24" cy="24" r="22" fill="#ffffff"/><path d="M12 20 h6 l8 -7 v22 l-8 -7 h-6 z" fill="#243047"/><path class="sw-welle" d="M30 18 q4 6 0 12" fill="none" stroke="#243047" stroke-width="3" stroke-linecap="round"/><path class="sw-welle sw-welle-weit" d="M33 14 q8 10 0 20" fill="none" stroke="#243047" stroke-width="3" stroke-linecap="round"/></svg>`;

  const stufe = () => stand?.stufe?.(ID) || "mittel";

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
  // Je Satz gibt es VARIANTEN feste Fassungen, gewählt nach dem Satz selbst –
  // so liegt jeder Satz, den der Lautsprecher mit dem Stein vorliest, als
  // Aufnahme bereit (scripts/stimme-app/leseecke-b.mjs).
  const VARIANTEN = 3;
  function zahlVon(text) {
    let h = 2166136261;
    for (const z of text) h = Math.imul(h ^ z.codePointAt(0), 16777619) >>> 0;
    return h;
  }
  function aufgabe(satz, variante = Math.floor(Math.random() * VARIANTEN)) {
    const woerter = satz.split(/\s+/);
    const drin = new Set(woerter.map((w) => w.replace(/[.,!?]/g, "").toLowerCase()));
    const steine = inhalte.STOLPERSTEINE.filter((w) => !drin.has(w.toLowerCase()));
    const h = zahlVon(`${satz}|${variante}`);
    const stein = steine[h % steine.length];
    const stelle = 1 + (Math.floor(h / steine.length) % (woerter.length - 1));
    const mit = [...woerter.slice(0, stelle), stein, ...woerter.slice(stelle)];
    return { satz, stein, stelle, woerter: mit };
  }

  const state = { nr: 0, punkte: 0, fehler: 0, woerter: 0, phase: "intro", runde: [], aufgabe: null, zeit: false };
  let shell = null;
  let el = {};
  // Jedes Vorlesen bekommt eine Nummer: Nur das jüngste macht den
  // Lautsprecher wieder still, wenn es fertig ist.
  let vorgelesen = 0;

  function buehne() {
    shell.clear();
    const gleis = shell.el("div", "sw-gleis");
    const reihe = shell.el("div", "sw-reihe");
    gleis.append(reihe, shell.el("div", "silben-schiene"));
    const oben = shell.el("div", "sw-oben");
    const hinweis = shell.el("p", "sw-hinweis", "Welches Wort gehört nicht hinein?");
    // Auf Zeit schweigt die Stimme: dann ohne Lautsprecher.
    let vorlesen = null;
    if (!state.zeit) {
      vorlesen = shell.el("button", "sw-vorlesen");
      vorlesen.type = "button";
      vorlesen.setAttribute("aria-label", "Den Satz vorlesen");
      vorlesen.innerHTML = LAUTSPRECHER;
      vorlesen.addEventListener("click", lesVor);
      oben.append(vorlesen);
    }
    oben.append(hinweis);
    shell.play.append(oben, gleis);
    el = { reihe, hinweis, vorlesen };
  }

  // Der Satz, wie er auf dem Gleis liegt – mit dem Stolperstein. Nur solange
  // gesucht wird: Danach liest die Stimme ihn ohne den Stein.
  async function lesVor() {
    if (state.phase !== "suchen" || state.zeit) return;
    const nr = ++vorgelesen;
    const knopf = el.vorlesen;
    knopf?.classList.add("spricht");
    await ton.sprich(state.aufgabe.woerter.join(" "), { rate: 0.85 });
    if (nr === vorgelesen) knopf?.classList.remove("spricht");
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    state.zeit = false;
    state.phase = "intro";
    delete host.dataset.zeit;
    shell.stopClock?.();
    state.runde = spiel.ziehe(saetze(), RUNDE).map((satz) => aufgabe(satz));
    shell.setCount(0);
    shell.closeOverlay();
    kids()?.setHelp?.(stufe() === "schwer" ? `${HELP} ${HELP_VORLESEN} ${HELP_ZEIT}` : `${HELP} ${HELP_VORLESEN}`);
    spiel.losKnopf(shell, {
      onLos: () => los(false),
      zeit: stufe() === "schwer" ? { onLos: () => los(true) } : null,
    });
  }

  //   zeit  die Runde auf Zeit: alle Sätze gemischt, bis die Uhr abläuft
  function los(zeit) {
    state.zeit = zeit;
    if (zeit) {
      host.dataset.zeit = "1";
      state.runde = spiel.mische(saetze()).map((satz) => aufgabe(satz));
      // Auf Zeit gibt es keinen Lautsprecher – die Hilfe verspricht keinen.
      kids()?.setHelp?.(`${HELP} ${HELP_ZEIT}`);
    }
    shell.setPhase("play");
    buehne();
    if (zeit) shell.startClock(spiel.ZEIT_MS, zeitUm);
    naechster();
  }

  function zeitUm() {
    if (state.phase === "over") return;
    fertig();
  }

  function naechster() {
    if (state.phase === "over") return;
    // Auf Zeit gehen die Sätze nicht aus: Sind alle durch, kommen sie neu gemischt.
    if (state.zeit && state.nr >= state.runde.length) state.runde.push(...spiel.mische(saetze()).map(aufgabe));
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
    if (stufe() === "leicht") lesVor();
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
    if (state.fehler === 0 || state.zeit) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    state.woerter += a.woerter.length - 1;
    knopf.classList.add("fliegt-weg");
    el.reihe.classList.add("ist-frei");
    kids()?.playJingle?.("correct");
    // Auf Zeit: kein Vorlesen, gleich der nächste Satz.
    if (state.zeit) {
      await ton.pause(380);
      if (state.phase === "over") return;
      state.nr += 1;
      naechster();
      return;
    }
    await ton.pause(450);
    knopf.remove();
    await ton.sprich(a.satz, { rate: 0.9 });
    await ton.pause(600);
    state.nr += 1;
    naechster();
  }

  function fertig() {
    state.phase = "over";
    if (state.zeit) {
      shell.stopClock?.();
      const bisher = spiel.zeitBest(ID);
      spiel.ergebnis(shell, {
        id: ID,
        punkte: state.punkte,
        von: ZEIT_ZIEL,
        woerter: state.woerter,
        zeit: true,
        label: "Stolperwörter – auf Zeit",
        detail: `${state.punkte} Stolpersteine in ${spiel.ZEIT_MS / 1000} Sekunden gefunden${bisher ? ` · Bestwert bisher ${bisher}` : ""}`,
        speech: `Die Zeit ist um. Du hast ${state.punkte} ${state.punkte === 1 ? "Stolperstein" : "Stolpersteine"} gefunden.`,
      });
      return;
    }
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

  shell = spiel.mount({ host, id: ID, title: "Stolperwörter", help: HELP, onRestart: start, clock: true });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappStolperwoerter = {
    RUNDE, ZEIT_ZIEL, saetze, aufgabe,
    jetzt: () => state.aufgabe, nr: () => state.nr, phase: () => state.phase, punkte: () => state.punkte, zeit: () => state.zeit,
    // Die Uhr vorstellen, damit die Prüfung nicht 45 Sekunden wartet.
    zeitUm,
  };
})();
