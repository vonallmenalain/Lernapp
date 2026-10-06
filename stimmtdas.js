/*
 * stimmtdas.js – Satz lesen, Bild ansehen: Stimmt das?
 *
 * Ein Bild: ein Tisch, ein Baum, ein Haus, und Tiere darauf, darunter oder
 * daneben. Darunter ein Satz. Das Kind liest ihn und sagt mit dem Daumen, ob
 * er zum Bild passt. Oft hängt es an einem kleinen Wort – auf, unter, neben –
 * oder an der Zahl: Genau lesen lohnt sich.
 *
 * Bild und Satz werden gewürfelt. Gezeichnet wird immer die Wahrheit; der Satz
 * stimmt mit ihr überein oder weicht in genau einem Stück ab (Tier, Ding,
 * Lage, Zahl). Nach der Antwort steht, wie es richtig heisst.
 *
 * Auf der Stufe «leicht» liest die Stimme den Satz vor: Dann ist es ein
 * Hörspiel, und Kinder, die noch nicht lesen, üben dasselbe Verstehen.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "stimmtdas") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  const zugArt = window.LernappTrainArt;
  if (!host || !spiel || !inhalte || !ton || !art || !zugArt) return;

  const kids = () => window.LernappKids || null;

  const ID = "stimmtdas";
  const RUNDE = 8;
  // Wie viele Tiere wo Platz haben, steht beim Bild (lesen-art.js, buildSzene).
  const PLAETZE = art.SZENE_PLAETZE;

  function stufe() { return stand?.stufe?.() || "mittel"; }

  // ---------------------------------------------------------------------------
  // Würfeln
  // ---------------------------------------------------------------------------
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];

  const maxAnzahl = (dingId, wo) => art.platzFuer(dingId, wo);

  function passt(lage) {
    const ding = inhalte.DINGE.find((d) => d.id === lage.ding);
    return Boolean(ding?.wo.includes(lage.wo)) && lage.anzahl <= maxAnzahl(lage.ding, lage.wo);
  }

  function wuerfleLage() {
    const ding = zufall(inhalte.DINGE);
    const wo = zufall(ding.wo);
    const mehrere = stufe() === "schwer";
    const anzahl = mehrere ? 1 + Math.floor(Math.random() * maxAnzahl(ding.id, wo)) : 1;
    return { tier: zufall(inhalte.TIERE).id, ding: ding.id, wo, anzahl };
  }

  // Eine Abweichung in genau einem Stück, die wieder eine mögliche Lage ist.
  function weiche(lage) {
    const arten = stufe() === "leicht" ? ["tier", "ding"] : stufe() === "schwer" ? ["tier", "ding", "wo", "anzahl", "wo"] : ["tier", "ding", "wo", "wo"];
    for (let versuch = 0; versuch < 40; versuch += 1) {
      const art_ = zufall(arten);
      const neu = { ...lage };
      if (art_ === "tier") neu.tier = zufall(inhalte.TIERE.filter((t) => t.id !== lage.tier)).id;
      if (art_ === "ding") neu.ding = zufall(inhalte.DINGE.filter((d) => d.id !== lage.ding && d.wo.includes(lage.wo))).id;
      if (art_ === "wo") neu.wo = zufall(inhalte.DINGE.find((d) => d.id === lage.ding).wo.filter((w) => w !== lage.wo) || [lage.wo]);
      if (art_ === "anzahl") neu.anzahl = zufall([1, 2, 3].filter((n) => n !== lage.anzahl));
      if (neu.ding && passt({ ...neu, anzahl: 1 }) && JSON.stringify(neu) !== JSON.stringify(lage)) return neu;
    }
    return { ...lage, tier: inhalte.TIERE.find((t) => t.id !== lage.tier).id };
  }

  // Hier stehen die Tiere immer: Es geht um auf, unter, neben und wie viele.
  const satz = (lage) => inhalte.satzZurLage({ ...lage, tun: "steht" });

  function aufgabe() {
    const wahr = wuerfleLage();
    const stimmt = Math.random() < 0.5;
    const gesagt = stimmt ? wahr : weiche(wahr);
    return { wahr, stimmt, text: satz(gesagt), richtig: satz(wahr) };
  }

  // Das Bild: dasselbe wie in den Lückensätzen (lesen-art.js, buildSzene).
  const bild = (lage) => art.buildSzene(lage, { klasse: "sd-bild-svg" });

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  const HELP = [
    "Stimmt das? Lies den Satz unter dem Bild.",
    "Passt er zum Bild, tippe auf den Daumen nach oben. Passt er nicht, auf den Daumen nach unten.",
    "Schau genau: auf, unter oder neben – und wie viele?",
  ].join(" ");
  const HELP_LEICHT = [
    "Stimmt das? Hör gut zu, was die Stimme sagt, und schau aufs Bild.",
    "Passt es, tippe auf den Daumen nach oben. Passt es nicht, auf den Daumen nach unten.",
    "Ein Tipp auf den Satz sagt ihn noch einmal.",
  ].join(" ");

  const state = { nr: 0, punkte: 0, woerter: 0, aufgabe: null, phase: "intro" };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const bildHost = shell.el("div", "sd-bild");
    const satzZeile = shell.el("button", "sd-satz");
    satzZeile.type = "button";
    satzZeile.addEventListener("click", () => { if (stufe() === "leicht" && state.aufgabe) ton.sprich(state.aufgabe.text, { rate: 0.85 }); });
    const unten = shell.el("div", "sd-unten");
    const ja = shell.el("button", "sd-daumen sd-ja");
    ja.type = "button";
    ja.setAttribute("aria-label", "Stimmt");
    ja.textContent = "👍";
    const nein = shell.el("button", "sd-daumen sd-nein");
    nein.type = "button";
    nein.setAttribute("aria-label", "Stimmt nicht");
    nein.textContent = "👎";
    ja.addEventListener("click", () => antworte(true, ja));
    nein.addEventListener("click", () => antworte(false, nein));
    const loesung = shell.el("p", "sd-loesung");
    loesung.hidden = true;
    unten.append(ja, nein);
    const rechts = shell.el("div", "sd-rechts");
    rechts.append(satzZeile, loesung, unten);
    const reihe = shell.el("div", "sd-reihe");
    reihe.append(bildHost, rechts);
    shell.play.append(reihe);
    el = { bildHost, satzZeile, ja, nein, loesung };
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    shell.setCount(0);
    shell.closeOverlay();
    kids()?.setHelp?.(stufe() === "leicht" ? HELP_LEICHT : HELP);
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
    state.aufgabe = aufgabe();
    state.phase = "lesen";
    el.bildHost.innerHTML = "";
    el.bildHost.append(bild(state.aufgabe.wahr));
    el.satzZeile.textContent = stand?.zeige?.(state.aufgabe.text) ?? state.aufgabe.text;
    el.satzZeile.classList.toggle("ist-hoerbar", stufe() === "leicht");
    el.loesung.hidden = true;
    [el.ja, el.nein].forEach((k) => { k.disabled = false; k.classList.remove("ist-richtig", "ist-falsch", "wackelt"); });
    if (stufe() === "leicht") ton.sprich(state.aufgabe.text, { rate: 0.85 });
  }

  async function antworte(sagtStimmt, knopf) {
    if (state.phase !== "lesen") return;
    state.phase = "zeigen";
    [el.ja, el.nein].forEach((k) => { k.disabled = true; });
    const richtig = sagtStimmt === state.aufgabe.stimmt;
    state.woerter += state.aufgabe.text.split(/\s+/).length;
    if (richtig) {
      state.punkte += 1;
      shell.setCount(state.punkte);
      knopf.classList.add("ist-richtig");
      kids()?.playJingle?.("correct");
    } else {
      knopf.classList.add("ist-falsch", "wackelt");
      kids()?.playJingle?.("retry");
    }
    // Wie es richtig heisst – geschrieben und gesagt, wenn der Satz nicht
    // stimmte oder das Kind danebenlag.
    if (!state.aufgabe.stimmt || !richtig) {
      el.loesung.hidden = false;
      el.loesung.textContent = state.aufgabe.stimmt ? "Der Satz stimmt." : `So stimmt es: ${stand?.zeige?.(state.aufgabe.richtig) ?? state.aufgabe.richtig}`;
      await ton.sprich(state.aufgabe.stimmt ? "Der Satz stimmt." : `So stimmt es: ${state.aufgabe.richtig}`, { rate: 0.9 });
      await ton.pause(700);
    } else {
      await ton.pause(900);
    }
    state.nr += 1;
    naechstes();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: RUNDE,
      woerter: state.woerter,
      label: "Stimmt das?",
      detail: `${state.punkte} von ${RUNDE} Sätzen richtig geprüft`,
      speech: state.punkte === RUNDE
        ? "Du hast jeden Satz richtig geprüft. Genau gelesen!"
        : `Du hast ${state.punkte} von ${RUNDE} Sätzen richtig geprüft.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Stimmt das?", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs): die Würfel und die Aufgabe, die gerade dran ist.
  window.LernappStimmtDas = { RUNDE, aufgabe, satz, weiche, wuerfleLage, passt, PLAETZE, jetzt: () => state.aufgabe };
})();
