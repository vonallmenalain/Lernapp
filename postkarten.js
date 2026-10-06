/*
 * postkarten.js – Postkarten von der Reise.
 *
 * Bringt das Kind auf der Reise einen Fahrgast nach Hause (eine Karte ganz
 * gefahren, journey-plan.js mapFinished), schreibt er eine Postkarte. Sie
 * hängt hier an der Pinnwand: vorne die Landschaft mit dem Wahrzeichen und
 * dem Tier, daneben ein paar Sätze und ein Gruss. Das Kind liest sie – auf
 * «leicht» liest die Stimme vor, sonst ein Tipp auf einen Satz – und
 * beantwortet eine Frage dazu.
 *
 * Eine Karte ist immer da: Fino erklärt, wie die Post kommt. Eine Runde sind
 * bis zu drei Karten, ungelesene zuerst; gelesen heisst gemerkt auf dem
 * Gerät. Am Schluss steht, von wem die nächste Karte kommt.
 *
 * Die Texte stehen in lesen-detektive.js (POSTKARTEN), die Bilder zeichnen
 * lesen-bilder.js (Landschaft, Tier) und train-art.js (Wahrzeichen).
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "postkarten") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const det = window.LernappLeseDetektive;
  const bilder = window.LernappLeseBilder;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const zugArt = window.LernappTrainArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !det || !bilder || !ton || !art || !zugArt) return;

  const kids = () => window.LernappKids || null;
  const reise = () => window.LernappReise || null;

  const ID = "postkarten";
  const RUNDE = 3;
  const GELESEN_KEY = "lernapp.lesen.postkarten";

  // Die Karte, die immer da ist: Fino erklärt, wie die Post kommt.
  const WILLKOMMEN = {
    karte: null, tier: "fox", von: "Fino", gruss: "Liebe Grüsse, dein Fino",
    text: ["Hallo! Ich bin Fino, der Fuchs.", "Wenn du mit deinem Zug einen Fahrgast nach Hause bringst, schreibt er dir eine Postkarte.", "Alle Karten hängen hier an der Pinnwand."],
    frage: { frage: "Wer schreibt dir Postkarten?", antworten: ["die Fahrgäste", "der Kran", "niemand"], richtig: 0 },
  };

  const HELP = [
    "Postkarten von der Reise. Lies, was dir der Fahrgast schreibt – ein Tipp auf einen Satz liest ihn vor.",
    "Dann kommt eine Frage zur Karte.",
    "Neue Karten kommen, wenn du auf der Reise einen Fahrgast nach Hause bringst.",
  ].join(" ");

  const stufe = () => stand?.stufe?.(ID) || "mittel";
  const zeige = (text) => stand?.zeige?.(text) ?? text;
  const idVon = (k) => k.karte || "willkommen";

  function gelesen() {
    try { return new Set(JSON.parse(localStorage.getItem(GELESEN_KEY) || "[]")); } catch { return new Set(); }
  }
  function merkeGelesen(id) {
    const liste = gelesen();
    liste.add(id);
    try { localStorage.setItem(GELESEN_KEY, JSON.stringify([...liste])); } catch { /* privater Modus */ }
  }

  // Die Karte der Reise zu einer Postkarte (MAPS), mit ihrer Nummer.
  function karteDerReise(k) {
    const maps = reise()?.MAPS || [];
    const i = maps.findIndex((m) => m.id === k.karte);
    return i >= 0 ? { map: maps[i], index: i } : null;
  }

  // Welche Postkarten angekommen sind: Fino immer, die anderen, wenn ihre
  // Karte ganz gefahren ist.
  function angekommen() {
    const r = reise();
    return [WILLKOMMEN, ...det.POSTKARTEN.filter((k) => {
      const ort = karteDerReise(k);
      return Boolean(ort && r?.mapFinished?.(ort.index));
    })];
  }

  // Die nächste, die noch unterwegs ist – in der Reihenfolge der Reise.
  function naechstePost() {
    const da = new Set(angekommen().map(idVon));
    return det.POSTKARTEN.find((k) => !da.has(idVon(k))) || null;
  }

  function runde() {
    const da = angekommen();
    const schon = gelesen();
    const neu = da.filter((k) => !schon.has(idVon(k)));
    const alt = spiel.mische(da.filter((k) => schon.has(idVon(k))));
    return [...neu, ...alt].slice(0, RUNDE);
  }

  // Die Vorderseite: Landschaft, Wahrzeichen mit Licht, das Tier winkt.
  function vorderseite(k) {
    const ort = karteDerReise(k);
    const map = ort?.map || null;
    const svg = bilder.buchBild({ landschaft: map?.scene || "wiese" }, {
      bild: { figuren: [{ id: k.tier, x: map ? 66 : 120, s: 1.7, winkt: true }], dinge: map ? [] : [{ e: "📮", x: 190, y: 112, s: 44 }] },
    });
    if (map) {
      const wahrzeichen = zugArt.buildLandmark(map.landmark);
      wahrzeichen.classList.add("is-lit");
      svg.append(art.group({ transform: "translate(176 136) scale(0.95)" }, [wahrzeichen]));
    }
    return svg;
  }

  const state = { nr: 0, punkte: 0, fehler: 0, woerter: 0, phase: "intro", runde: [], postkarte: null };
  let shell = null;
  let el = {};

  function buehne() {
    shell.clear();
    const zaehler = shell.el("p", "pk-zaehler");
    const karte = shell.el("div", "pk-karte");
    const vorne = shell.el("div", "pk-vorne");
    const hinten = shell.el("div", "pk-hinten");
    karte.append(vorne, hinten);
    const unten = shell.el("div", "pk-unten");
    shell.play.append(zaehler, karte, unten);
    el = { zaehler, vorne, hinten, unten };
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
        naechste();
      },
    });
  }

  function naechste() {
    if (state.nr >= state.runde.length) { fertig(); return; }
    const k = state.runde[state.nr];
    state.postkarte = k;
    state.fehler = 0;
    state.phase = "lesen";
    const da = angekommen().length;
    el.zaehler.textContent = `📬 ${da} von ${det.POSTKARTEN.length + 1} Postkarten`;
    el.vorne.innerHTML = "";
    el.vorne.append(vorderseite(k));
    el.hinten.innerHTML = "";
    el.hinten.append(shell.el("span", "pk-marke", "⭐"));
    const zeilen = shell.el("div", "pk-text");
    [...k.text, k.gruss].forEach((satz, i) => {
      const knopf = shell.el("button", `pk-satz${i === k.text.length ? " pk-gruss" : ""}`, zeige(satz));
      knopf.type = "button";
      knopf.addEventListener("click", () => ton.sprich(satz, { rate: 0.9 }));
      zeilen.append(knopf);
    });
    el.hinten.append(zeilen);
    el.unten.innerHTML = "";
    const weiter = shell.el("button", "pk-weiter");
    weiter.type = "button";
    weiter.append(shell.el("span", "pk-weiter-bild", "❓"), shell.el("span", "pk-weiter-text", "Zur Frage"));
    weiter.addEventListener("click", () => { if (state.phase === "lesen") zeigeFrage(); });
    el.unten.append(weiter);
    state.woerter += k.text.join(" ").split(/\s+/).length;
    merkeGelesen(idVon(k));
    if (stufe() === "leicht") ton.sprich([...k.text, k.gruss].join(" "), { rate: 0.9 });
  }

  // Die Frage kommt auf die Bildseite der Karte; der Text bleibt daneben
  // stehen – dort steht die Antwort.
  function zeigeFrage() {
    const k = state.postkarte;
    const f = k.frage;
    state.phase = "frage";
    el.unten.innerHTML = "";
    el.vorne.innerHTML = "";
    const frage = shell.el("button", "pk-frage", zeige(f.frage));
    frage.type = "button";
    frage.addEventListener("click", () => ton.sprich(f.frage, { rate: 0.9 }));
    const antworten = shell.el("div", "pk-antworten");
    spiel.mische(f.antworten.map((text, i) => ({ text, i }))).forEach(({ text, i }) => {
      const knopf = shell.el("button", "pk-antwort", zeige(text));
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      if (i === f.richtig) knopf.dataset.richtig = "1";
      knopf.addEventListener("click", () => antworte(i, knopf));
      antworten.append(knopf);
    });
    el.vorne.append(frage, antworten);
    if (stufe() === "leicht") ton.sprich(f.frage, { rate: 0.9 });
  }

  async function antworte(i, knopf) {
    if (state.phase !== "frage" || knopf.disabled) return;
    const f = state.postkarte.frage;
    if (i !== f.richtig) {
      state.fehler += 1;
      knopf.disabled = true;
      knopf.classList.add("ist-falsch");
      kids()?.playJingle?.("retry");
      ton.sprich("Lies die Karte noch einmal.", { rate: 0.95 });
      return;
    }
    state.phase = "richtig";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    knopf.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich(f.antworten[f.richtig], { rate: 0.9 });
    await ton.pause(500);
    state.nr += 1;
    naechste();
  }

  function fertig() {
    state.phase = "over";
    const von = state.runde.length;
    const naechst = naechstePost();
    const ort = naechst ? karteDerReise(naechst) : null;
    const hinweis = naechst && ort ? ` Die nächste Karte schreibt ${naechst.von}, wenn du die Karte «${ort.map.name}» bis zum Ziel fährst.` : "";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: state.woerter,
      label: "Postkarten",
      detail: `${state.punkte} von ${von} Fragen gleich richtig.${hinweis}`,
      speech: `${state.punkte === von ? "Alles richtig gelesen!" : `Du hast ${state.punkte} von ${von} Fragen gleich richtig.`}${hinweis}`,
    });
  }

  shell = spiel.mount({ host, id: ID, title: "Postkarten", help: HELP, onRestart: start });
  start();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappPostkarten = {
    RUNDE, WILLKOMMEN, angekommen, naechstePost, runde, karteDerReise,
    jetzt: () => state.postkarte, nr: () => state.nr, phase: () => state.phase,
  };
})();
