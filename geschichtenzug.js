/*
 * geschichtenzug.js – Der Geschichtenzug: Was kommt zuerst?
 *
 * Aus einem Buch im Regal stehen vier Seiten als Wagen bereit, durcheinander:
 * ihr Bild und – wer schon liest – ein Satz daraus. Das Kind kuppelt sie in
 * der Reihenfolge an die Lok, in der die Geschichte geht. Vorne, gleich hinter
 * der Lok, fängt sie an. Passt ein Wagen noch nicht, stösst er an und rollt
 * zurück. Ist die Geschichte ganz, fährt der Zug ab, und das nächste Buch
 * kommt.
 *
 * Die Bücher kommen aus dem Fach, das zur Lesestufe passt (lesen-buecher.js),
 * gelesene zuerst – deren Geschichte kennt das Kind schon. Die Seiten sind
 * über das Buch verteilt: die erste und dann solche, die einen Satz haben,
 * der für sich allein verständlich ist (keine Antwort auf eine Frage, die
 * nicht dasteht). Auf «leicht» sind es drei Wagen, nur mit Bildern; liest das
 * Kind Sätze und spielt auf «schwer», stehen nur noch die Sätze da.
 *
 * Die Bilder zeichnet lesen-bilder.js, wie im Bücherregal.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "geschichtenzug") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const bib = window.LernappLeseBuecher;
  const bilder = window.LernappLeseBilder;
  const ton = window.LernappLeseTon;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !bib || !bilder || !ton) return;

  const kids = () => window.LernappKids || null;

  const ID = "geschichtenzug";
  const RUNDE = 4;
  const FARBEN = ["#2f6fd0", "#e8543f", "#3fa34d", "#f5a623"];
  // Aus welchen Fächern die Bücher kommen, je Lesestufe – das erste zuerst.
  const FAECHER = {
    hoeren: ["hoerbuch"],
    buchstaben: ["hoerbuch"],
    woerter: ["erste", "hoerbuch"],
    saetze: ["klein", "erste"],
    geschichten: ["geschichte", "klein"],
  };

  const HELP = [
    "Der Geschichtenzug. Die Wagen sind Seiten aus einem Buch, aber durcheinander.",
    "Kupple sie so an die Lok, wie die Geschichte geht: vorne, was zuerst kommt, hinten das Ende.",
    "Ein Tipp auf das Buch oben sagt seinen Namen.",
  ].join(" ");

  const stufe = () => stand?.stufe?.() || "mittel";
  const lesestufe = () => stand?.lesestufe?.() || "buchstaben";
  const zeige = (text) => stand?.zeige?.(text) ?? text;

  // Sätze stehen auf den Wagen, wenn das Kind schon Wörter liest; Bilder,
  // ausser es liest Sätze und spielt auf «schwer».
  const zeigtText = (buch) => buch.stufe !== "hoerbuch" && ["woerter", "saetze", "geschichten"].includes(lesestufe());
  const zeigtBild = () => !(stufe() === "schwer" && ["saetze", "geschichten"].includes(lesestufe()));
  const anzahlWagen = () => (stufe() === "leicht" ? 3 : 4);

  // ---------------------------------------------------------------------------
  // Würfeln
  // ---------------------------------------------------------------------------
  // Die Bücher für eine Runde: gelesene zuerst, dann die aus dem ersten Fach,
  // dann die anderen – jede Gruppe gemischt.
  function buecherListe() {
    const faecher = FAECHER[lesestufe()] || FAECHER.buchstaben;
    const gelesen = stand?.stand?.().buecher || {};
    const alle = bib.BUECHER.filter((b) => faecher.includes(b.stufe) && b.seiten.length >= 4);
    const istGelesen = (b) => Number(gelesen[b.id]?.mal) > 0;
    return [
      ...spiel.mische(alle.filter(istGelesen)),
      ...spiel.mische(alle.filter((b) => !istGelesen(b) && b.stufe === faecher[0])),
      ...spiel.mische(alle.filter((b) => !istGelesen(b) && b.stufe !== faecher[0])),
    ];
  }

  // Ein Satz, der für die Seite steht: der erste, der keine wörtliche Rede
  // ist – ist er kurz («Es ist Herbst.»), mit dem nächsten zusammen. Ohne
  // solchen Satz der Anfang der Seite; dann gilt er als schwach.
  function satzVon(seite) {
    const saetze = String(seite.text || "").split(/(?<=[.!?»…])\s+(?=[«A-ZÄÖÜ])/).filter(Boolean);
    const ab = saetze.findIndex((s) => !s.startsWith("«"));
    const von = ab >= 0 ? ab : 0;
    const teile = [];
    let woerter = 0;
    for (let i = von; i < saetze.length && teile.length < 2; i += 1) {
      teile.push(saetze[i]);
      woerter += saetze[i].split(/\s+/).length;
      if (woerter >= 4) break;
    }
    const text = teile.join(" ");
    const anzahl = text.split(/\s+/).length;
    return { text, gut: ab >= 0 && anzahl >= 3 && anzahl <= 13 };
  }

  // Gleichmässig verteilt n aus einer Liste, das letzte immer dabei.
  function verteilt(liste, n) {
    if (liste.length <= n) return liste.slice();
    return Array.from({ length: n }, (_, i) => liste[Math.round((i * (liste.length - 1)) / Math.max(1, n - 1))]);
  }

  // Die Seiten für den Zug: die erste und dann über das Buch verteilt solche
  // mit einem guten Satz. Reichen die nicht, kommen die anderen dazu.
  function seitenFuer(buch, n = anzahlWagen()) {
    const nummern = buch.seiten.map((_, i) => i);
    const gute = nummern.slice(1).filter((i) => satzVon(buch.seiten[i]).gut);
    let rest = verteilt(gute, n - 1);
    if (rest.length < n - 1) {
      const andere = nummern.slice(1).filter((i) => !rest.includes(i));
      rest = [...rest, ...verteilt(andere, n - 1 - rest.length)];
    }
    return [0, ...rest].sort((a, b) => a - b);
  }

  function aufgabe(buch) {
    const text = zeigtText(buch);
    const bild = zeigtBild() || !text;
    const wagen = seitenFuer(buch).map((nr, reihe) => ({ nr, reihe, seite: buch.seiten[nr], satz: satzVon(buch.seiten[nr]).text }));
    return { buch, wagen, text, bild };
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  const state = { nr: 0, punkte: 0, fehler: 0, fehlgriffe: 0, dran: 0, woerter: 0, phase: "intro", buecher: [], aufgabe: null };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const titel = shell.el("button", "gz-titel");
    titel.type = "button";
    titel.addEventListener("click", () => { if (state.aufgabe) ton.sprich(state.aufgabe.buch.titel, { rate: 0.9 }); });
    const gleis = shell.el("div", "gz-gleis");
    const zug = shell.el("div", "gz-zug");
    const lok = spiel.eigeneLok();
    const angekuppelt = shell.el("div", "gz-angekuppelt");
    if (lok) zug.append(lok);
    zug.append(angekuppelt);
    gleis.append(zug, shell.el("div", "silben-schiene"));
    // Oben das Gleis mit dem Zug und rechts das Buch, darunter die Wagen.
    const oben = shell.el("div", "gz-oben");
    oben.append(gleis, titel);
    const neben = shell.el("div", "gz-neben");
    shell.play.append(oben, neben);
    el = { titel, zug, angekuppelt, neben };
  }

  // Ein Wagen: das Bild der Seite und, wer liest, der Satz.
  function wagenInhalt(w, a) {
    const teile = [];
    if (a.bild) {
      const bild = shell.el("span", "gz-bild");
      bild.append(bilder.buchBild(a.buch, w.seite));
      teile.push(bild);
    }
    if (a.text) teile.push(shell.el("span", "gz-satz", zeige(w.satz)));
    return teile;
  }

  function start() {
    state.nr = 0;
    state.punkte = 0;
    state.woerter = 0;
    state.buecher = buecherListe();
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
    if (state.nr >= RUNDE || !state.buecher.length) { fertig(); return; }
    const buch = state.buecher[state.nr % state.buecher.length];
    state.aufgabe = aufgabe(buch);
    state.dran = 0;
    state.fehler = 0;
    state.fehlgriffe = 0;
    state.phase = "kuppeln";
    const a = state.aufgabe;
    host.dataset.art = a.text && !a.bild ? "saetze" : (a.text ? "beides" : "bilder");
    shell.play.style.setProperty("--gz-n", String(a.wagen.length));
    el.zug.classList.remove("faehrt-ab", "kommt-an");
    if (state.nr > 0) {
      void el.zug.offsetWidth;
      el.zug.classList.add("kommt-an");
    }
    el.angekuppelt.innerHTML = "";
    el.titel.innerHTML = "";
    const deckel = shell.el("span", "gz-deckel");
    deckel.append(bilder.umschlagBild(buch));
    el.titel.append(deckel, shell.el("span", "gz-titel-text", zeige(buch.titel)));
    el.titel.setAttribute("aria-label", `Das Buch: ${buch.titel}`);
    // Gemischt, nie schon in der richtigen Reihenfolge.
    let gemischt;
    let versuch = 0;
    do { gemischt = spiel.mische(a.wagen); versuch += 1; } while (gemischt.every((w, i) => w.reihe === i) && versuch < 20);
    el.neben.innerHTML = "";
    gemischt.forEach((w) => {
      const knopf = shell.el("button", "gz-wagen");
      knopf.type = "button";
      knopf.dataset.reihe = String(w.reihe);
      knopf.style.setProperty("--gz-farbe", FARBEN[w.reihe % FARBEN.length]);
      knopf.setAttribute("aria-label", a.text ? `Wagen: ${w.satz}` : `Wagen mit einem Bild aus dem Buch`);
      knopf.append(...wagenInhalt(w, a), shell.el("span", "gz-raeder"));
      knopf.addEventListener("click", () => kuppeln(w, knopf));
      el.neben.append(knopf);
    });
    if (stufe() === "leicht") ton.sprich(`${buch.titel}. Was kommt zuerst?`, { rate: 0.9 });
  }

  async function kuppeln(w, knopf) {
    if (state.phase !== "kuppeln") return;
    const a = state.aufgabe;
    if (w.reihe !== state.dran) {
      state.fehler += 1;
      state.fehlgriffe += 1;
      knopf.classList.remove("stoesst");
      void knopf.offsetWidth;
      knopf.classList.add("stoesst");
      kids()?.playJingle?.("retry");
      if (state.fehlgriffe >= 2) el.neben.querySelector(`[data-reihe="${state.dran}"]`)?.classList.add("zeigt-hin");
      return;
    }
    state.phase = "rollt";
    knopf.remove();
    el.neben.querySelectorAll(".zeigt-hin").forEach((k) => k.classList.remove("zeigt-hin"));
    const angehaengt = shell.el("span", "gz-wagen gz-dran");
    angehaengt.style.setProperty("--gz-farbe", FARBEN[w.reihe % FARBEN.length]);
    angehaengt.append(...wagenInhalt(w, a), shell.el("span", "gz-raeder"));
    el.angekuppelt.append(angehaengt);
    state.dran += 1;
    state.fehlgriffe = 0;
    kids()?.vibrate?.(10);
    ton.klopf(420 + w.reihe * 60);
    // Was auf dem Wagen steht, liest die Stimme – ohne Sätze die ganze Seite:
    // So erzählt sich die Geschichte, während der Zug wächst.
    if (a.text) state.woerter += w.satz.split(/\s+/).length;
    await ton.sprich(a.text ? w.satz : w.seite.text, { rate: 0.9 });
    if (state.dran < a.wagen.length) { state.phase = "kuppeln"; return; }
    // Die ganze Geschichte.
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    kids()?.playJingle?.("correct");
    await ton.pause(250);
    kids()?.playHorn?.({ chuffs: 2 });
    el.zug.classList.add("faehrt-ab");
    await ton.pause(900);
    state.nr += 1;
    naechste();
  }

  function fertig() {
    state.phase = "over";
    const von = Math.min(RUNDE, Math.max(1, state.nr));
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Geschichtenzug",
      detail: `${state.punkte} von ${von} Geschichten gleich richtig gekuppelt`,
      speech: state.punkte === von
        ? "Jede Geschichte gleich richtig gekuppelt!"
        : `Du hast ${state.punkte} von ${von} Geschichten gleich richtig gekuppelt.`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Geschichtenzug", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappGeschichtenzug = {
    RUNDE, FAECHER, buecherListe, satzVon, seitenFuer, aufgabe,
    jetzt: () => state.aufgabe, dran: () => state.dran, nr: () => state.nr, phase: () => state.phase,
  };
})();
