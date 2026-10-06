/*
 * lueckensaetze.js – Ein Wort fehlt. Welches passt zum Bild?
 *
 * Dasselbe Bild wie bei «Stimmt das?» – ein Tisch, ein Baum, ein Haus, und
 * Tiere darauf, darunter oder daneben –, aber jetzt tun sie etwas: Sie
 * schlafen, lesen, singen, hüpfen. Darunter der Satz mit einer Lücke:
 *
 *   «Der Fuchs ___ auf dem Tisch.»    schläft · liest · singt
 *   «Die Eule singt ___ dem Baum.»    auf · unter · neben
 *
 * Das Kind wählt ein Wort, es rutscht in die Lücke, und die Stimme liest den
 * ganzen Satz – auch den falschen: «Die Eule singt unter dem Baum» klingt
 * richtig, aber das Bild sagt etwas anderes. So hängt alles am Lesen und
 * am Hinschauen, und niemand muss «falsch» sagen.
 *
 * Gefragt wird nach den kleinen Wörtern (auf, unter, neben), den Tunwörtern
 * und auf «schwer» nach der Zahl; dazwischen nach Tier und Ding. Auf «leicht»
 * nur nach Tier und Ding, mit Bildchen auf den Knöpfen, und die Stimme liest
 * den Satz vor: ein Hörspiel für die, die noch nicht lesen.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "lueckensaetze") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  const zugArt = window.LernappTrainArt;
  if (!host || !spiel || !inhalte || !ton || !art || !zugArt) return;

  const kids = () => window.LernappKids || null;

  const ID = "lueckensaetze";
  const RUNDE = 8;
  // Wonach gefragt wird, je Stufe: eine Runde, gemischt.
  const FRAGEN = {
    leicht: ["tier", "ding", "tier", "ding", "tier", "ding", "tier", "ding"],
    mittel: ["wo", "tun", "wo", "tun", "tier", "ding", "wo", "tun"],
    schwer: ["wo", "tun", "anzahl", "ding", "tun", "wo", "anzahl", "tier"],
  };
  const WO = ["auf", "unter", "neben"];
  // Wie viel von einem Ding das Bildchen auf dem Knopf zeigt.
  const AUSSCHNITT = {
    tisch: "-120 -106 240 116", stuhl: "-60 -160 120 170", bett: "-160 -120 320 130",
    kiste: "-80 -110 160 120", baum: "-140 -340 280 350", haus: "-130 -240 260 250",
  };

  const HELP = [
    "Lückensätze. Im Satz fehlt ein Wort.",
    "Schau das Bild an und tippe auf das Wort, das in die Lücke passt. Die Stimme liest dann den ganzen Satz.",
  ].join(" ");
  const HELP_LEICHT = [
    "Lückensätze. Hör gut zu: Im Satz fehlt ein Wort.",
    "Schau das Bild an und tippe auf das Bild, das in die Lücke passt. Ein Tipp auf den Satz sagt ihn noch einmal.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];
  const zeige = (text) => stand?.zeige?.(text) ?? text;

  // ---------------------------------------------------------------------------
  // Würfeln
  // ---------------------------------------------------------------------------
  // Eine Lage, die zur Frage passt: Wer nach der Zahl fragt, braucht mehrere
  // Tiere; wer schläft, liegt allein.
  function wuerfleLage(rolle) {
    for (let versuch = 0; versuch < 60; versuch += 1) {
      const ding = zufall(inhalte.DINGE);
      const wo = zufall(ding.wo);
      // Nach dem Tunwort gefragt, tun sie etwas Sichtbares; sonst auch mal stehen.
      const tun = rolle === "tun" || Math.random() < 0.7 ? zufall(inhalte.TUN.filter((t) => t.id !== "steht")).id : "steht";
      if (!art.szenePasst({ ding: ding.id, wo, tun })) continue;
      const platz = art.platzFuer(ding.id, wo, tun);
      let anzahl = 1;
      if (rolle === "anzahl") {
        if (platz < 2) continue;
        anzahl = 2 + Math.floor(Math.random() * (platz - 1));
      } else if (stufe() === "schwer") {
        anzahl = 1 + Math.floor(Math.random() * platz);
      }
      return { tier: zufall(inhalte.TIERE).id, ding: ding.id, wo, anzahl, tun };
    }
    return { tier: "fox", ding: "tisch", wo: "neben", anzahl: rolle === "anzahl" ? 2 : 1, tun: "singt" };
  }

  // Die falschen Wörter zu einer Lücke: Sie passen in den Satz, aber nicht
  // zum Bild.
  function andere(rolle, lage, richtig) {
    const mehrere = (Number(lage.anzahl) || 1) > 1;
    let vorrat = [];
    if (rolle === "wo") vorrat = WO;
    if (rolle === "anzahl") vorrat = ["Zwei", "Drei", "Vier"];
    if (rolle === "ding") vorrat = inhalte.DINGE.map((d) => d.dativ);
    if (rolle === "tun") {
      // «steht» ist nie falsch genug: Wer singt, steht ja auch.
      vorrat = inhalte.TUN.filter((t) => t.id !== "steht").map((t) => (mehrere ? t.mehrzahl : t.einzahl));
    }
    if (rolle === "tier") {
      // Mit «Der» davor nur Tiere, die «der» heissen.
      const artikel = inhalte.TIERE.find((t) => t.id === lage.tier)?.der.split(" ")[0];
      vorrat = mehrere
        ? inhalte.TIERE.map((t) => t.viele)
        : inhalte.TIERE.filter((t) => t.der.split(" ")[0] === artikel).map((t) => t.der.split(" ").slice(1).join(" "));
    }
    return spiel.mische(vorrat.filter((wort) => wort !== richtig));
  }

  // Ein Bildchen für die Knöpfe auf «leicht»: das Tier oder das Ding.
  function bildchen(rolle, wort, lage) {
    if (rolle === "tier") {
      const tier = inhalte.TIERE.find((t) => t.der.endsWith(` ${wort}`) || t.viele === wort);
      if (!tier) return null;
      return art.el("svg", { viewBox: "-24 -52 48 56", class: "ls-bildchen", "aria-hidden": "true" }, [zugArt.buildPassenger(tier.id)]);
    }
    if (rolle === "ding") {
      const ding = inhalte.DINGE.find((d) => d.dativ === wort);
      if (!ding) return null;
      return art.el("svg", { viewBox: AUSSCHNITT[ding.id] || "-160 -250 320 260", class: "ls-bildchen", "aria-hidden": "true" }, [art.buildDing(ding.id)]);
    }
    return null;
  }

  function aufgabe(rolle) {
    const lage = wuerfleLage(rolle);
    const teile = inhalte.satzTeile(lage);
    const stelle = teile.findIndex((teil) => teil.rolle === rolle);
    const richtig = teile[stelle].text;
    const anzahl = stufe() === "leicht" ? 1 : 2;
    const wahl = spiel.mische([richtig, ...andere(rolle, lage, richtig).slice(0, anzahl)]);
    return { lage, teile, stelle, rolle, richtig, wahl, satz: inhalte.satzZurLage(lage) };
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  const state = { nr: 0, punkte: 0, woerter: 0, fehler: 0, aufgabe: null, phase: "intro", fragen: [] };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const bildHost = shell.el("div", "ls-bild");
    const satz = shell.el("p", "ls-satz");
    satz.addEventListener("click", () => { if (stufe() === "leicht" && state.phase === "waehlen") lesVor(); });
    const wahl = shell.el("div", "ls-wahl");
    const rechts = shell.el("div", "ls-rechts");
    rechts.append(satz, wahl);
    const reihe = shell.el("div", "ls-reihe");
    reihe.append(bildHost, rechts);
    shell.play.append(reihe);
    el = { bildHost, satz, wahl };
  }

  // Der Satz mit der Lücke – oder mit einem Wort darin.
  function zeigeSatz(wort = null, { richtig = false } = {}) {
    const a = state.aufgabe;
    el.satz.innerHTML = "";
    a.teile.forEach((teil, i) => {
      if (i) el.satz.append(document.createTextNode(" "));
      if (i !== a.stelle) { el.satz.append(document.createTextNode(zeige(teil.text))); return; }
      const luecke = shell.el("span", `ls-luecke${wort ? " ist-voll" : ""}${richtig ? " ist-richtig" : ""}`, wort ? zeige(wort) : "");
      luecke.setAttribute("aria-label", wort ? wort : "Lücke");
      el.satz.append(luecke);
    });
    el.satz.append(document.createTextNode("."));
  }

  // Auf «leicht» liest die Stimme den Satz, und wo die Lücke ist, schweigt sie
  // einen Atemzug lang.
  function lesVor() {
    const a = state.aufgabe;
    const vor = a.teile.slice(0, a.stelle).map((t) => t.text).join(" ");
    const nach = a.teile.slice(a.stelle + 1).map((t) => t.text).join(" ");
    return ton.sprichFolge([vor, `${nach}.`].filter((teil) => teil && teil !== "."), { abstand: 900, rate: 0.85 });
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    state.fragen = spiel.mische(FRAGEN[stufe()] || FRAGEN.mittel).slice(0, RUNDE);
    shell.setCount(0);
    shell.closeOverlay();
    kids()?.setHelp?.(stufe() === "leicht" ? HELP_LEICHT : HELP);
    spiel.losKnopf(shell, {
      onLos: () => {
        shell.setPhase("play");
        buehne();
        naechste();
      },
    });
  }

  function naechste() {
    if (state.nr >= state.fragen.length) { fertig(); return; }
    state.aufgabe = aufgabe(state.fragen[state.nr]);
    state.fehler = 0;
    state.phase = "waehlen";
    const a = state.aufgabe;
    el.bildHost.innerHTML = "";
    el.bildHost.append(art.buildSzene(a.lage, { klasse: "ls-bild-svg" }));
    el.satz.classList.toggle("ist-hoerbar", stufe() === "leicht");
    zeigeSatz();
    el.wahl.innerHTML = "";
    a.wahl.forEach((wort) => {
      const knopf = shell.el("button", "ls-wort");
      knopf.type = "button";
      knopf.dataset.wort = wort;
      if (wort === a.richtig) knopf.dataset.richtig = "1";
      const bild = stufe() === "leicht" ? bildchen(a.rolle, wort, a.lage) : null;
      if (bild) knopf.append(bild);
      knopf.append(shell.el("span", "ls-wort-text", zeige(wort)));
      knopf.addEventListener("click", () => waehle(wort, knopf));
      el.wahl.append(knopf);
    });
    if (stufe() === "leicht") lesVor();
  }

  async function waehle(wort, knopf) {
    if (state.phase !== "waehlen" || knopf.disabled) return;
    const a = state.aufgabe;
    state.phase = "lesen";
    const richtig = wort === a.richtig;
    zeigeSatz(wort, { richtig });
    // Gelesen wird, was dasteht – auch, wenn es nicht stimmt.
    const gesagt = a.teile.map((teil, i) => (i === a.stelle ? wort : teil.text)).join(" ");
    if (richtig) {
      if (state.fehler === 0) {
        state.punkte += 1;
        shell.setCount(state.punkte);
      }
      state.woerter += a.teile.length + 1;
      knopf.classList.add("ist-richtig");
      kids()?.playJingle?.("correct");
      await ton.sprich(`${gesagt}.`, { rate: 0.9 });
      await ton.pause(600);
      state.nr += 1;
      naechste();
      return;
    }
    state.fehler += 1;
    kids()?.playJingle?.("retry");
    await ton.sprich(`${gesagt}?`, { rate: 0.9 });
    knopf.disabled = true;
    knopf.classList.add("ist-falsch");
    knopf.classList.remove("wackelt");
    void knopf.offsetWidth;
    knopf.classList.add("wackelt");
    zeigeSatz();
    if (state.fehler >= 2) el.wahl.querySelector('[data-richtig="1"]')?.classList.add("zeigt-hin");
    state.phase = "waehlen";
  }

  function fertig() {
    state.phase = "over";
    const von = state.fragen.length;
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Lückensätze",
      detail: `${state.punkte} von ${von} Lücken gleich richtig gefüllt`,
      speech: state.punkte === von
        ? "Jede Lücke gleich richtig gefüllt. Genau gelesen!"
        : `Du hast ${state.punkte} von ${von} Lücken gleich richtig gefüllt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Lückensätze", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappLueckensaetze = { RUNDE, FRAGEN, aufgabe, andere, wuerfleLage, jetzt: () => state.aufgabe, nr: () => state.nr, phase: () => state.phase };
})();
