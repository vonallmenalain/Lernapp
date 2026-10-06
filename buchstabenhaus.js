/*
 * buchstabenhaus.js – Jeder Laut wohnt hinter seinem Fenster.
 *
 * Die Anlauttabelle als Haus. Zwei Arten zu spielen:
 *
 *   Entdecken   Jedes Fenster lässt sich öffnen: gross der Buchstabe, dazu
 *               das Bild und das Wort (M wie Maus), und der Laut ist zu hören.
 *   Suchen      Eine Runde mit acht Fragen: «Wo wohnt dieser Laut?» Die Stimme
 *               spielt den Laut – oder, wo es noch keine Aufnahme gibt, nennt
 *               sie das Wort und fragt nach seinem Anfang. In den Fenstern
 *               stehen dann nur die Buchstaben, keine Bilder: sonst fände man
 *               die Maus, ohne das M zu kennen.
 *
 * Was richtig erkannt wird, zählt im Lesestand für diesen Laut. Sitzt er
 * (dreimal richtig, an zwei Tagen), bekommt sein Fenster einen goldenen
 * Rahmen.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "buchstabenhaus") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton) return;

  const kids = () => window.LernappKids || null;

  const ID = "buchstabenhaus";
  const RUNDE = 8;

  const HELP_HAUS = [
    "Das Buchstabenhaus. Hinter jedem Fenster wohnt ein Laut.",
    "Tippe ein Fenster an, und du hörst, wer dort wohnt.",
    "Mit der Lupe beginnt das Suchspiel.",
  ].join(" ");
  const HELP_SUCHEN = [
    "Das Suchspiel. Hör genau hin: Wo wohnt dieser Laut?",
    "Tippe auf sein Fenster. Ein Tipp auf den Lautsprecher in der Blase sagt es noch einmal.",
  ].join(" ");

  // Wie viele Laute im Haus wohnen, hängt an der Lesestufe.
  const GRUPPE_JE_LESESTUFE = { hoeren: 1, buchstaben: 3, woerter: 4, saetze: 6, geschichten: 6 };

  function bewohner() {
    const gruppe = GRUPPE_JE_LESESTUFE[stand?.lesestufe?.() || "buchstaben"] || 3;
    return inhalte.lauteBisGruppe(gruppe);
  }

  function zeichen(laut) {
    return stand?.nurGross?.() ? laut.gross : `${laut.gross} ${laut.klein}`;
  }

  const state = { modus: "haus", nr: 0, punkte: 0, ziel: null, fehler: 0, runde: [], gesperrt: false };
  let shell = null;
  let el = {};

  // ---------------------------------------------------------------------------
  // Das Haus
  // ---------------------------------------------------------------------------
  function buehne() {
    shell.clear();
    const laute = bewohner();
    const s = stand?.stand?.();
    const blase = shell.el("div", "bh-blase");
    blase.hidden = true;
    const haus = shell.el("div", "bh-haus");
    const dach = shell.el("div", "bh-dach");
    dach.setAttribute("aria-hidden", "true");
    const fassade = shell.el("div", "bh-fassade");
    const reihen = laute.length <= 6 ? 1 : laute.length > 24 ? 4 : 3;
    const spalten = Math.ceil(laute.length / reihen);
    fassade.style.setProperty("--bh-spalten", spalten);
    fassade.style.setProperty("--bh-reihen", reihen);
    const fenster = {};
    laute.forEach((laut) => {
      const knopf = shell.el("button", "bh-fenster");
      knopf.type = "button";
      knopf.dataset.laut = laut.id;
      knopf.setAttribute("aria-label", `${laut.gross} wie ${laut.wort}`);
      if (s && stand.lautSitzt(laut.id, s)) knopf.classList.add("sitzt");
      knopf.append(shell.el("span", "bh-zeichen", zeichen(laut)));
      knopf.append(shell.el("span", "bh-bildchen", laut.bild));
      knopf.addEventListener("click", () => tippe(laut, knopf));
      fassade.append(knopf);
      fenster[laut.id] = knopf;
    });
    haus.append(dach, fassade);

    const leiste = shell.el("div", "bh-leiste");
    const lupe = shell.el("button", "bh-lupe");
    lupe.type = "button";
    lupe.setAttribute("aria-label", "Suchspiel beginnen");
    lupe.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#2f6fd0"/><circle cx="21" cy="21" r="9" fill="none" stroke="#fff" stroke-width="4"/><path d="M28 28 L36 36" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`;
    lupe.addEventListener("click", startSuchen);
    leiste.append(lupe);

    shell.play.append(blase, haus, leiste);
    el = { blase, haus, fassade, fenster, lupe, leiste };
    zeigeHaus();
  }

  function zeigeHaus() {
    state.modus = "haus";
    shell.setPhase("intro");
    host.dataset.modus = "haus";
    el.blase.hidden = true;
    el.leiste.hidden = false;
    kids()?.setHelp?.(HELP_HAUS);
  }

  // ---------------------------------------------------------------------------
  // Entdecken: ein Fenster öffnet sich
  // ---------------------------------------------------------------------------
  async function oeffne(laut) {
    const karte = shell.el("div", "bh-karte");
    karte.setAttribute("role", "dialog");
    karte.setAttribute("aria-label", `${laut.gross} wie ${laut.wort}`);
    const gross = shell.el("p", "bh-karte-zeichen", zeichen(laut));
    const bild = shell.el("p", "bh-karte-bild", laut.bild);
    // Das Wort, der Laut darin hervorgehoben: M wie Maus, ch wie Buch.
    const wort = shell.el("p", "bh-karte-wort");
    const anzeige = stand?.zeige?.(laut.wort) ?? laut.wort;
    const stelle = anzeige.toLowerCase().indexOf(laut.klein.toLowerCase());
    if (stelle >= 0) {
      wort.append(document.createTextNode(anzeige.slice(0, stelle)));
      wort.append(shell.el("mark", "", anzeige.slice(stelle, stelle + laut.klein.length)));
      wort.append(document.createTextNode(anzeige.slice(stelle + laut.klein.length)));
    } else wort.textContent = anzeige;
    const zu = shell.el("button", "bh-karte-zu");
    zu.type = "button";
    zu.setAttribute("aria-label", "Fenster schliessen");
    zu.textContent = "✓";
    karte.append(gross, bild, wort, zu);
    const huelle = shell.el("div", "bh-karte-huelle");
    huelle.append(karte);
    const schliessen = () => { ton.stop(); huelle.remove(); };
    huelle.addEventListener("click", (ereignis) => { if (ereignis.target === huelle) schliessen(); });
    zu.addEventListener("click", schliessen);
    karte.addEventListener("click", (ereignis) => { if (ereignis.target !== zu) sageLaut(laut); });
    shell.play.append(huelle);
    await sageLaut(laut);
  }

  // Der Laut, dann das Wort. Ohne Aufnahme (und kein Selbstlaut) nur das Wort:
  // Die Sprachausgabe sagte sonst «Em» statt «mmm».
  async function sageLaut(laut) {
    const gehoert = await ton.laut(laut.id);
    if (gehoert) await ton.pause(350);
    await ton.sprich(laut.wort, { rate: 0.85 });
  }

  function tippe(laut, knopf) {
    if (state.modus === "haus") { oeffne(laut); return; }
    rate(laut, knopf);
  }

  // ---------------------------------------------------------------------------
  // Suchen
  // ---------------------------------------------------------------------------
  // Gefragt wird, was noch nicht sitzt und lange nicht dran war – und nur
  // Laute, nach denen sich fragen lässt: hörbar (Aufnahme, Selbstlaut) oder
  // mit einem Wort, das mit ihnen beginnt.
  function frageListe() {
    const s = stand?.stand?.() || { laute: {} };
    const fragbar = bewohner().filter((laut) => ton.lautHoerbar(laut.id) || !laut.innen);
    const gewicht = (laut) => {
      const e = s.laute?.[laut.id] || {};
      const sitzt = stand?.lautSitzt?.(laut.id, s) ? 1 : 0;
      return sitzt * 4 + (Number(e.r) || 0) - (Number(e.f) || 0) * 0.5 + Math.random() * 2.5;
    };
    const sortiert = [...fragbar].sort((a, b) => gewicht(a) - gewicht(b));
    const auswahl = sortiert.slice(0, RUNDE);
    while (auswahl.length < RUNDE && fragbar.length) auswahl.push(fragbar[auswahl.length % fragbar.length]);
    return spiel.mische(auswahl);
  }

  function startSuchen() {
    state.modus = "suchen";
    host.dataset.modus = "suchen";
    state.nr = 0;
    state.punkte = 0;
    state.runde = frageListe();
    shell.setPhase("play");
    shell.setCount(0);
    el.leiste.hidden = true;
    kids()?.setHelp?.(HELP_SUCHEN);
    frage();
  }

  async function frage() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.ziel = state.runde[state.nr];
    state.fehler = 0;
    state.gesperrt = false;
    Object.values(el.fenster).forEach((f) => f.classList.remove("ist-richtig", "ist-falsch", "zeigt-hin"));
    const laut = state.ziel;
    const hoerbar = ton.lautHoerbar(laut.id);
    el.blase.hidden = false;
    el.blase.innerHTML = "";
    const nochmal = shell.el("button", "bh-blase-ton");
    nochmal.type = "button";
    nochmal.setAttribute("aria-label", "Noch einmal hören");
    nochmal.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.3 5.7a9 9 0 0 1 0 12.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    nochmal.addEventListener("click", () => sageFrage(laut, hoerbar));
    el.blase.append(nochmal);
    if (!hoerbar) el.blase.append(shell.el("span", "bh-blase-bild", laut.bild));
    el.blase.append(shell.el("span", "bh-blase-text", hoerbar ? "Wo wohnt dieser Laut?" : `Wo wohnt der Anfang von ${laut.wort}?`));
    await sageFrage(laut, hoerbar);
  }

  async function sageFrage(laut, hoerbar) {
    if (hoerbar) {
      await ton.sprich("Wo wohnt dieser Laut?", { rate: 0.95 });
      await ton.pause(200);
      await ton.laut(laut.id);
    } else {
      await ton.sprich(`Wo wohnt der Anfang von ${laut.wort}?`, { rate: 0.9 });
    }
  }

  async function rate(laut, knopf) {
    if (state.gesperrt || !state.ziel) return;
    if (laut.id === state.ziel.id) {
      state.gesperrt = true;
      const ohneHilfe = state.fehler < 2;
      if (ohneHilfe) {
        state.punkte += 1;
        shell.setCount(state.punkte);
      }
      // Gezählt wird nur der Treffer ohne Fehlgriff – der Fehlgriff steht
      // schon im Lesestand (unten).
      if (state.fehler === 0) stand?.lautGeuebt?.(laut.id, true);
      knopf.classList.add("ist-richtig");
      if (stand?.lautSitzt?.(laut.id)) knopf.classList.add("sitzt");
      kids()?.playJingle?.("correct");
      await sageLaut(laut);
      await ton.pause(300);
      state.nr += 1;
      frage();
      return;
    }
    // Daneben: Das Fenster wackelt, nach dem zweiten Fehlgriff zeigt das
    // richtige auf sich.
    state.fehler += 1;
    if (state.fehler === 1) stand?.lautGeuebt?.(state.ziel.id, false);
    knopf.classList.remove("ist-falsch");
    void knopf.offsetWidth;
    knopf.classList.add("ist-falsch");
    kids()?.playJingle?.("retry");
    if (state.fehler >= 2) el.fenster[state.ziel.id]?.classList.add("zeigt-hin");
  }

  function fertig() {
    state.modus = "over";
    el.blase.hidden = true;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: state.runde.length,
      woerter: state.punkte,
      label: "Buchstabenhaus",
      detail: `${state.punkte} von ${state.runde.length} Lauten gleich gefunden`,
      speech: state.punkte === state.runde.length
        ? "Du hast jeden Laut gefunden. Toll!"
        : `Du hast ${state.punkte} von ${state.runde.length} Lauten gefunden.`,
    });
  }

  function start() {
    shell.closeOverlay();
    buehne();
  }

  shell = spiel.mount({ host, id: ID, title: "Buchstabenhaus", help: HELP_HAUS, onRestart: () => { start(); startSuchen(); } });
  start();

  // Für die Prüfung (check-leseecke.mjs): wonach gerade gefragt wird.
  window.LernappBuchstabenhaus = { RUNDE, bewohner, frageListe, ziel: () => state.ziel?.id || null, nr: () => state.nr };
})();
