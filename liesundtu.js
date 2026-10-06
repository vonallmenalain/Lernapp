/*
 * liesundtu.js – Lies und tu!
 *
 * Ein Auftrag steht da, und das Kind tut, was dasteht. Zwei Arten:
 *
 *   Setzen  «Setz die Katze auf den Baum.» Unten warten Tiere, oben stehen
 *           ein oder zwei Dinge. Das Kind tippt ein Tier an und dann die
 *           Stelle – darauf, darunter, daneben.
 *   Malen   «Male zwei Ballone rot an.» Ein paar Ballone, Sterne, Fische oder
 *           Blumen, dazu vier Farben. Das Kind wählt eine Farbe, tippt an,
 *           was es anmalen will (noch einmal tippen macht es wieder weiss),
 *           und zeigt mit dem Haken, dass es fertig ist. Auf «schwer» kommt
 *           es auf gross und klein an.
 *
 * Gelesen wird der vierte Fall, wie im Schulbuch: den Hasen, die Katze, auf
 * den Tisch, auf das Haus (lesen-inhalte.js, wen und wohin). Auf «leicht»
 * liest die Stimme den Auftrag vor; sonst erst, wenn etwas nicht stimmt.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "liesundtu") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  const zugArt = window.LernappTrainArt;
  if (!host || !spiel || !inhalte || !ton || !art || !zugArt) return;

  const kids = () => window.LernappKids || null;

  const ID = "liesundtu";
  const RUNDE = 6;
  const TIER_GROESSE = 2.3;
  // Die Dinge, die nebeneinander Platz haben (das Bett ist zu breit), und
  // wie weit sie zu beiden Seiten reichen.
  const BREITE = { tisch: 110, stuhl: 46, kiste: 70, baum: 120, haus: 120 };
  const STELLEN_X = { eins: [-60], zwei: [-220, 130] };
  const FARBEN = [
    { id: "rot", wert: "#e8543f" },
    { id: "blau", wert: "#2f6fd0" },
    { id: "gelb", wert: "#f5c623" },
    { id: "grün", wert: "#3fa34d" },
  ];
  // Was es anzumalen gibt: Einzahl, Mehrzahl, Geschlecht (für «einen»/«eine»).
  const MALDINGE = [
    { id: "ballon", eins: "Ballon", viele: "Ballone", art: "m" },
    { id: "stern", eins: "Stern", viele: "Sterne", art: "m" },
    { id: "fisch", eins: "Fisch", viele: "Fische", art: "m" },
    { id: "blume", eins: "Blume", viele: "Blumen", art: "f" },
  ];
  const ZAHLEN = ["", "", "zwei", "drei"];

  const HELP = [
    "Lies und tu! Lies den Auftrag und tu, was dasteht.",
    "Zum Setzen: Tippe erst ein Tier an, dann die Stelle. Zum Malen: Wähle eine Farbe, tippe an, was du anmalen willst, und dann auf den Haken.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];
  const zeige = (text) => stand?.zeige?.(text) ?? text;

  // ---------------------------------------------------------------------------
  // Aufträge würfeln
  // ---------------------------------------------------------------------------
  function setzAuftrag() {
    const ids = Object.keys(BREITE);
    const anzahlDinge = stufe() === "leicht" ? 1 : 2;
    const dinge = spiel.ziehe(ids, anzahlDinge).map((id) => inhalte.DINGE.find((d) => d.id === id));
    const ziel = zufall(dinge);
    const wo = zufall(ziel.wo);
    const tiere = spiel.ziehe(inhalte.TIERE, stufe() === "leicht" ? 2 : 3);
    const tier = tiere[0];
    return {
      art: "setzen",
      dinge: dinge.map((d) => d.id),
      tiere: spiel.mische(tiere.map((t) => t.id)),
      ziel: { tier: tier.id, ding: ziel.id, wo },
      text: `Setz ${tier.wen} ${wo} ${ziel.wohin}.`,
    };
  }

  // «Male zwei Ballone rot an.» – auf «schwer» mit gross oder klein.
  function malAuftrag() {
    const ding = zufall(MALDINGE);
    const farbe = zufall(FARBEN);
    const zahl = 1 + Math.floor(Math.random() * 3);
    const groesse = stufe() === "schwer" ? zufall(["gross", "klein"]) : null;
    // Fünf Stück, gross und klein gemischt – von der verlangten Grösse
    // mindestens so viele, wie angemalt werden sollen.
    const stuecke = [];
    for (let i = 0; i < 5; i += 1) stuecke.push({ nr: i, gross: Math.random() < 0.5 });
    const passend = () => stuecke.filter((s) => !groesse || s.gross === (groesse === "gross")).length;
    while (passend() < zahl) stuecke[stuecke.findIndex((s) => s.gross !== (groesse === "gross"))].gross = groesse === "gross";
    let menge;
    if (zahl === 1) {
      const artikel = ding.art === "m" ? "einen" : "eine";
      const adjektiv = groesse ? `${groesse}${ding.art === "m" ? "en" : "e"} ` : "";
      menge = `${artikel} ${adjektiv}${ding.eins}`;
    } else {
      menge = `${ZAHLEN[zahl]} ${groesse ? `${groesse}e ` : ""}${ding.viele}`;
    }
    return {
      art: "malen",
      ding: ding.id,
      stuecke,
      ziel: { zahl, farbe: farbe.id, groesse },
      text: `Male ${menge} ${farbe.id} an.`,
    };
  }

  function runde() {
    const liste = [];
    for (let i = 0; i < RUNDE; i += 1) liste.push(i % 2 === 0 ? setzAuftrag() : malAuftrag());
    return liste;
  }

  // ---------------------------------------------------------------------------
  // Setzen: die Szene
  // ---------------------------------------------------------------------------
  function figur(tierId) {
    return art.group({ class: "lt-tier" }, [zugArt.buildPassenger(tierId)]);
  }

  function setzSzene(a) {
    const svg = art.el("svg", { viewBox: "-380 -345 760 385", class: "lt-szene", role: "img", "aria-label": "Die Szene" });
    svg.append(art.el("rect", { x: -376, y: -341, width: 752, height: 377, rx: 26, fill: "#eaf6fd" }));
    svg.append(art.el("rect", { x: -376, y: 0, width: 752, height: 36, fill: "#9fd68a" }));
    const xs = a.dinge.length === 1 ? STELLEN_X.eins : STELLEN_X.zwei;
    const ebene = art.group({ class: "lt-gesetzt" }, []);
    const zonen = art.group({ class: "lt-zonen" }, []);
    a.dinge.forEach((id, i) => {
      const x0 = xs[i];
      const info = art.DINGE[id];
      const ding = inhalte.DINGE.find((d) => d.id === id);
      svg.append(art.group({ transform: `translate(${x0} 0)` }, [art.buildDing(id)]));
      const breite = BREITE[id];
      const zone = (wo, x, y, w, h) => {
        const r = art.el("rect", { x, y, width: w, height: h, rx: 14, class: "lt-zone", "data-ding": id, "data-wo": wo, role: "button", "aria-label": `${wo} ${ding.wohin}` });
        r.addEventListener("click", () => setze(id, wo));
        zonen.append(r);
      };
      if (ding.wo.includes("auf")) zone("auf", x0 - breite, info.oben - 116, breite * 2, 112);
      if (ding.wo.includes("unter")) zone("unter", x0 - breite + 6, (id === "baum" ? -170 : info.oben + 18), breite * 2 - 12, id === "baum" ? 166 : -info.oben - 22);
      zone("neben", x0 + info.rechts - 46, -118, 92, 116);
    });
    svg.append(ebene, zonen);
    return { svg, ebene, xs };
  }

  // Wo ein Tier zu stehen kommt.
  function platz(dingId, wo, x0) {
    const info = art.DINGE[dingId];
    if (wo === "neben") return { x: x0 + info.rechts, y: 0 };
    const stelle = (art.SZENE_PLAETZE[dingId]?.[wo] || [[0]])[0][0];
    return { x: x0 + stelle, y: wo === "auf" ? info.oben : 0 };
  }

  // ---------------------------------------------------------------------------
  // Malen: die Bilder
  // ---------------------------------------------------------------------------
  function malBild(dingId, gross) {
    const s = gross ? 1 : 0.62;
    const teile = {
      ballon: () => [
        art.el("path", { d: `M0 ${34 * s} q-6 ${14 * s} 2 ${30 * s}`, stroke: "#6b7a90", "stroke-width": 2, fill: "none" }),
        art.el("ellipse", { cx: 0, cy: 0, rx: 26 * s, ry: 32 * s, class: "lt-farbe", fill: "#ffffff", stroke: "#243047", "stroke-width": 3 }),
        art.el("path", { d: `M-5 ${31 * s} L5 ${31 * s} L0 ${38 * s} Z`, class: "lt-farbe", fill: "#ffffff", stroke: "#243047", "stroke-width": 2 }),
      ],
      stern: () => {
        const r1 = 34 * s;
        const r2 = 15 * s;
        const punkte = [];
        for (let i = 0; i < 10; i += 1) {
          const w = (Math.PI / 5) * i - Math.PI / 2;
          const r = i % 2 ? r2 : r1;
          punkte.push(`${(Math.cos(w) * r).toFixed(1)},${(Math.sin(w) * r).toFixed(1)}`);
        }
        return [art.el("polygon", { points: punkte.join(" "), class: "lt-farbe", fill: "#ffffff", stroke: "#243047", "stroke-width": 3, "stroke-linejoin": "round" })];
      },
      fisch: () => [
        art.el("path", { d: `M${-30 * s} 0 Q0 ${-24 * s} ${22 * s} 0 Q0 ${24 * s} ${-30 * s} 0 Z M${18 * s} 0 L${36 * s} ${-14 * s} L${36 * s} ${14 * s} Z`, class: "lt-farbe", fill: "#ffffff", stroke: "#243047", "stroke-width": 3, "stroke-linejoin": "round" }),
        art.el("circle", { cx: -16 * s, cy: -4 * s, r: 3 * s + 1, fill: "#243047" }),
      ],
      blume: () => [
        art.el("path", { d: `M0 ${10 * s} L0 ${44 * s}`, stroke: "#3fa34d", "stroke-width": 4 }),
        ...[0, 72, 144, 216, 288].map((w) => art.el("ellipse", { cx: 0, cy: -16 * s, rx: 10 * s, ry: 15 * s, class: "lt-farbe", fill: "#ffffff", stroke: "#243047", "stroke-width": 2.5, transform: `rotate(${w})` })),
        art.el("circle", { cx: 0, cy: 0, r: 9 * s, fill: "#f5a623", stroke: "#243047", "stroke-width": 2 }),
      ],
    }[dingId]();
    return art.el("svg", { viewBox: "-42 -46 84 96", class: "lt-malbild", "aria-hidden": "true" }, teile);
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  const state = { nr: 0, punkte: 0, fehler: 0, woerter: 0, phase: "intro", runde: [], aufgabe: null, tier: null, gesetzt: null, pinsel: null, bemalt: {} };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const auftrag = shell.el("button", "lt-auftrag");
    auftrag.type = "button";
    auftrag.addEventListener("click", () => { if (state.aufgabe) ton.sprich(state.aufgabe.text, { rate: 0.85 }); });
    // Die Szene und darunter (auf flachen Bildschirmen daneben) die Tiere
    // oder die Farbtöpfe.
    const mitte = shell.el("div", "lt-mitte");
    const feld = shell.el("div", "lt-feld");
    const unten = shell.el("div", "lt-unten");
    mitte.append(feld, unten);
    shell.play.append(auftrag, mitte);
    el = { auftrag, feld, unten };
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
        naechster();
      },
    });
  }

  function naechster() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    state.aufgabe = state.runde[state.nr];
    state.fehler = 0;
    state.phase = "tun";
    const a = state.aufgabe;
    el.auftrag.textContent = zeige(a.text);
    el.feld.innerHTML = "";
    el.unten.innerHTML = "";
    host.dataset.auftrag = a.art;
    if (a.art === "setzen") zeigeSetzen(a);
    else zeigeMalen(a);
    if (stufe() === "leicht") ton.sprich(a.text, { rate: 0.85 });
  }

  // --- Setzen ---------------------------------------------------------------
  function zeigeSetzen(a) {
    state.tier = null;
    state.gesetzt = null;
    const szene = setzSzene(a);
    el.szene = szene;
    el.feld.append(szene.svg);
    el.tiere = {};
    a.tiere.forEach((id) => {
      const knopf = shell.el("button", "lt-wartet");
      knopf.type = "button";
      knopf.dataset.tier = id;
      knopf.setAttribute("aria-label", inhalte.TIERE.find((t) => t.id === id)?.der || id);
      knopf.append(art.el("svg", { viewBox: "-24 -52 48 56", "aria-hidden": "true" }, [zugArt.buildPassenger(id)]));
      knopf.addEventListener("click", () => waehleTier(id));
      el.unten.append(knopf);
      el.tiere[id] = knopf;
    });
  }

  function waehleTier(id) {
    if (state.phase !== "tun") return;
    state.tier = id;
    Object.entries(el.tiere).forEach(([tid, k]) => k.classList.toggle("ist-gewaehlt", tid === id));
    el.szene.svg.classList.add("ist-wahl");
    ton.klopf(520);
  }

  async function setze(dingId, wo) {
    if (state.phase !== "tun") return;
    if (!state.tier) {
      // Erst ein Tier: Die Wartenden hüpfen kurz.
      Object.values(el.tiere).forEach((k) => { k.classList.remove("wackelt"); void k.offsetWidth; k.classList.add("wackelt"); });
      return;
    }
    const a = state.aufgabe;
    state.phase = "pruefen";
    const x0 = el.szene.xs[a.dinge.indexOf(dingId)];
    const p = platz(dingId, wo, x0);
    const gesetzt = art.group({ transform: `translate(${p.x} ${p.y}) scale(${TIER_GROESSE})`, class: "lt-tier-gesetzt" }, [zugArt.buildPassenger(state.tier)]);
    if (wo === "unter" && dingId === "tisch") el.szene.svg.insertBefore(gesetzt, el.szene.svg.children[2]);
    else el.szene.ebene.append(gesetzt);
    el.tiere[state.tier].hidden = true;
    el.szene.svg.classList.remove("ist-wahl");
    const richtig = state.tier === a.ziel.tier && dingId === a.ziel.ding && wo === a.ziel.wo;
    await ton.pause(350);
    if (richtig) { geschafft(); return; }
    daneben();
    await ton.pause(600);
    gesetzt.remove();
    el.tiere[state.tier].hidden = false;
    el.tiere[state.tier].classList.remove("ist-gewaehlt");
    state.tier = null;
    state.phase = "tun";
  }

  // --- Malen ----------------------------------------------------------------
  function zeigeMalen(a) {
    state.pinsel = null;
    state.bemalt = {};
    const reihe = shell.el("div", "lt-malreihe");
    a.stuecke.forEach((stueck) => {
      const knopf = shell.el("button", `lt-stueck${stueck.gross ? " ist-gross" : ""}`);
      knopf.type = "button";
      knopf.dataset.nr = String(stueck.nr);
      knopf.setAttribute("aria-label", `${stueck.gross ? "gross" : "klein"}, weiss`);
      knopf.append(malBild(a.ding, stueck.gross));
      knopf.addEventListener("click", () => male(stueck, knopf));
      reihe.append(knopf);
    });
    el.feld.append(reihe);
    el.stuecke = reihe;
    const farben = shell.el("div", "lt-farben");
    FARBEN.forEach((farbe) => {
      const topf = shell.el("button", "lt-topf");
      topf.type = "button";
      topf.dataset.farbe = farbe.id;
      topf.style.setProperty("--lt-farbe", farbe.wert);
      topf.append(shell.el("span", "lt-topf-klecks"), shell.el("span", "lt-topf-name", zeige(farbe.id)));
      topf.addEventListener("click", () => {
        if (state.phase !== "tun") return;
        state.pinsel = farbe.id;
        farben.querySelectorAll(".lt-topf").forEach((t) => t.classList.toggle("ist-gewaehlt", t === topf));
      });
      farben.append(topf);
    });
    const fertigKnopf = shell.el("button", "lt-fertig", "✓");
    fertigKnopf.type = "button";
    fertigKnopf.setAttribute("aria-label", "Fertig");
    fertigKnopf.addEventListener("click", pruefeMalen);
    el.unten.append(farben, fertigKnopf);
  }

  function male(stueck, knopf) {
    if (state.phase !== "tun") return;
    if (!state.pinsel) {
      el.unten.querySelectorAll(".lt-topf").forEach((t) => { t.classList.remove("wackelt"); void t.offsetWidth; t.classList.add("wackelt"); });
      return;
    }
    // Dieselbe Farbe noch einmal: wieder weiss.
    const neu = state.bemalt[stueck.nr] === state.pinsel ? null : state.pinsel;
    if (neu) state.bemalt[stueck.nr] = neu; else delete state.bemalt[stueck.nr];
    const wert = FARBEN.find((f) => f.id === neu)?.wert || "#ffffff";
    knopf.querySelectorAll(".lt-farbe").forEach((teil) => teil.setAttribute("fill", wert));
    knopf.dataset.farbe = neu || "";
    knopf.setAttribute("aria-label", `${stueck.gross ? "gross" : "klein"}, ${neu || "weiss"}`);
    ton.klopf(neu ? 600 : 360);
  }

  function malenRichtig() {
    const a = state.aufgabe;
    const bemalt = Object.entries(state.bemalt);
    if (bemalt.length !== a.ziel.zahl) return false;
    return bemalt.every(([nr, farbe]) => {
      const stueck = a.stuecke[Number(nr)];
      return farbe === a.ziel.farbe && (!a.ziel.groesse || stueck.gross === (a.ziel.groesse === "gross"));
    });
  }

  async function pruefeMalen() {
    if (state.phase !== "tun") return;
    state.phase = "pruefen";
    if (malenRichtig()) { geschafft(); return; }
    daneben();
    await ton.pause(500);
    state.phase = "tun";
  }

  // --- Gemeinsam ------------------------------------------------------------
  async function geschafft() {
    const a = state.aufgabe;
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    state.woerter += a.text.split(/\s+/).length;
    el.auftrag.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich("Genau so!", { rate: 0.95 });
    await ton.pause(500);
    el.auftrag.classList.remove("ist-richtig");
    state.nr += 1;
    naechster();
  }

  function daneben() {
    state.fehler += 1;
    kids()?.playJingle?.("retry");
    el.auftrag.classList.remove("wackelt");
    void el.auftrag.offsetWidth;
    el.auftrag.classList.add("wackelt");
    // Was dasteht, noch einmal – vorgelesen.
    ton.sprich(state.aufgabe.text, { rate: 0.85 });
    if (state.fehler >= 2) zeigeHin();
  }

  function zeigeHin() {
    const a = state.aufgabe;
    if (a.art === "setzen") {
      el.tiere[a.ziel.tier]?.classList.add("zeigt-hin");
      el.szene.svg.querySelector(`.lt-zone[data-ding="${a.ziel.ding}"][data-wo="${a.ziel.wo}"]`)?.classList.add("zeigt-hin");
    } else {
      el.unten.querySelector(`.lt-topf[data-farbe="${a.ziel.farbe}"]`)?.classList.add("zeigt-hin");
    }
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Lies und tu!",
      detail: `${state.punkte} von ${von} Aufträgen gleich richtig ausgeführt`,
      speech: state.punkte === von
        ? "Jeden Auftrag gleich richtig ausgeführt!"
        : `Du hast ${state.punkte} von ${von} Aufträgen gleich richtig ausgeführt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Lies und tu!", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappLiesUndTu = { RUNDE, FARBEN, MALDINGE, setzAuftrag, malAuftrag, runde, jetzt: () => state.aufgabe, nr: () => state.nr, phase: () => state.phase };
})();
