/*
 * lesen-stand.js – Was ein Kind in der Leseecke schon kann.
 *
 * Ein Kasten im Speicher, der dem Kind folgt (game-cloud.js), wie der Kasten
 * der Reise. Darin steht, wie sicher jeder Laut sitzt, wie viele Wörter das
 * Kind gelesen oder gehört hat – davon lebt der Lesewurm –, welche Bücher
 * gelesen sind und wann welches Spiel zuletzt dran war.
 *
 * Bewusst Zähler, kein Protokoll: Alle Kästen eines Kindes liegen in einem
 * Firestore-Dokument, das Eltern und Gruppe lesen können. Ein Protokoll jeder
 * Antwort würde es füllen und mehr erzählen als nötig.
 *
 *   lernapp.lesen
 *   {
 *     woerter: 240,                 // gelesen oder gehört – der Lesewurm
 *     laute:   { m: { r: 4, f: 1, tage: ["2026-10-06", …], zuletzt: … } },
 *     buecher: { "hase-rueebli": { mal: 2, sterne: 3, at: … } },
 *     spiele:  { silbenzug: { runden: 3, best: 6, zuletzt: … } },
 *   }
 *
 * Daneben die Einstellungen der Eltern (lernapp.lesen.eltern): wo die
 * Leseecke beginnt und ob nur Grossbuchstaben stehen. Die schreibt nur der
 * Elternbereich (firebase.js); hier werden sie gelesen. Sie sind kein
 * Fortschritt und überleben deshalb jedes Zurücksetzen – wie die Stufe.
 */
(() => {
  "use strict";

  const KEY = "lernapp.lesen";
  const ELTERN_KEY = "lernapp.lesen.eltern";
  const EMPTY = { woerter: 0, laute: {}, buecher: {}, spiele: {} };

  // Je so viele Wörter wächst der Lesewurm um ein Glied.
  const WOERTER_JE_GLIED = 20;
  // Mehr Glieder zeichnet niemand: Er rollt sich dann ein, statt den Wagen zu
  // sprengen. Gezählt wird trotzdem weiter.
  const GLIEDER_MAX = 60;

  // Ein Laut sitzt, wenn er dreimal richtig erkannt wurde, und zwar an zwei
  // verschiedenen Tagen: Einmal Glück und dreimal hintereinander am selben
  // Nachmittag ist noch kein Wissen.
  const SITZT_RICHTIG = 3;
  const SITZT_TAGE = 2;
  const TAGE_MERKEN = 6;

  // ---------------------------------------------------------------------------
  // Zusammenführen
  // ---------------------------------------------------------------------------
  // Wie überall bei game-cloud: in beide Richtungen gleich, und derselbe Stand
  // darf mehrfach ankommen, ohne dass etwas doppelt zählt. Deshalb das Maximum,
  // nie die Summe.
  const zahl = (wert) => (Number.isFinite(Number(wert)) ? Number(wert) : 0);

  function mergeEintraege(a = {}, b = {}, felder) {
    const out = {};
    new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach((id) => {
      const x = (a || {})[id] || {};
      const y = (b || {})[id] || {};
      const eintrag = {};
      felder.forEach((feld) => { eintrag[feld] = Math.max(zahl(x[feld]), zahl(y[feld])); });
      if ("tage" in x || "tage" in y) {
        eintrag.tage = [...new Set([...(x.tage || []), ...(y.tage || [])])].sort().slice(-TAGE_MERKEN);
      }
      out[id] = eintrag;
    });
    return out;
  }

  function merge(a = EMPTY, b = EMPTY) {
    return {
      woerter: Math.max(zahl(a.woerter), zahl(b.woerter)),
      laute: mergeEintraege(a.laute, b.laute, ["r", "f", "zuletzt"]),
      buecher: mergeEintraege(a.buecher, b.buecher, ["mal", "sterne", "at"]),
      spiele: mergeEintraege(a.spiele, b.spiele, ["runden", "best", "zuletzt"]),
    };
  }

  // Ohne game-cloud.js (eine Seite, die es nicht lädt) ein Kasten nur auf dem
  // Gerät – der Stand bleibt trotzdem stehen.
  const cloudApi = window.LernappGameCloud;
  const box = cloudApi
    ? cloudApi.register({ key: KEY, empty: EMPTY, merge })
    : (() => {
      let current = (() => { try { return JSON.parse(localStorage.getItem(KEY) || "null") || EMPTY; } catch { return EMPTY; } })();
      const listeners = [];
      return {
        read: () => current,
        write(data) {
          current = data;
          try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* privater Modus */ }
          listeners.forEach((fn) => fn(current));
          return current;
        },
        update(fn) { return this.write(fn(current)); },
        onChange(fn) { listeners.push(fn); return () => {}; },
      };
    })();

  function stand() {
    const s = box.read() || EMPTY;
    return { ...EMPTY, ...s, laute: s.laute || {}, buecher: s.buecher || {}, spiele: s.spiele || {} };
  }

  function heute() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ---------------------------------------------------------------------------
  // Eintragen
  // ---------------------------------------------------------------------------
  function lautGeuebt(id, richtig) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const laute = { ...(s.laute || {}) };
      const eintrag = { r: 0, f: 0, tage: [], zuletzt: 0, ...(laute[id] || {}) };
      if (richtig) {
        eintrag.r = zahl(eintrag.r) + 1;
        eintrag.tage = [...new Set([...(eintrag.tage || []), heute()])].sort().slice(-TAGE_MERKEN);
      } else {
        eintrag.f = zahl(eintrag.f) + 1;
      }
      eintrag.zuletzt = Date.now();
      laute[id] = eintrag;
      return { ...s, laute };
    });
  }

  function lautSitzt(id, s = stand()) {
    const eintrag = s.laute?.[id];
    if (!eintrag) return false;
    return zahl(eintrag.r) >= SITZT_RICHTIG && (eintrag.tage || []).length >= SITZT_TAGE;
  }

  function sitzendeLaute(s = stand()) {
    return Object.keys(s.laute || {}).filter((id) => lautSitzt(id, s));
  }

  function woerterGelesen(anzahl) {
    const n = Math.max(0, Math.round(zahl(anzahl)));
    if (!n) return stand();
    return box.update((alt) => ({ ...EMPTY, ...alt, woerter: zahl(alt?.woerter) + n }));
  }

  function buchGelesen(id, { sterne = 1 } = {}) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const buecher = { ...(s.buecher || {}) };
      const vorher = buecher[id] || {};
      buecher[id] = { mal: zahl(vorher.mal) + 1, sterne: Math.max(zahl(vorher.sterne), zahl(sterne)), at: Date.now() };
      return { ...s, buecher };
    });
  }

  function spielRunde(id, { punkte = 0 } = {}) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const spiele = { ...(s.spiele || {}) };
      const vorher = spiele[id] || {};
      spiele[id] = { runden: zahl(vorher.runden) + 1, best: Math.max(zahl(vorher.best), zahl(punkte)), zuletzt: Date.now() };
      return { ...s, spiele };
    });
  }

  // Nur die Zeitmarke: ein Spiel ist geöffnet worden. Für "was ist als
  // Nächstes dran" zählt, was zuletzt angefasst wurde, nicht nur, was fertig
  // gespielt ist.
  function spielGeoeffnet(id) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const spiele = { ...(s.spiele || {}) };
      spiele[id] = { runden: 0, best: 0, ...(spiele[id] || {}), zuletzt: Date.now() };
      return { ...s, spiele };
    });
  }

  function wurmGlieder(s = stand()) {
    return Math.min(GLIEDER_MAX, 1 + Math.floor(zahl(s.woerter) / WOERTER_JE_GLIED));
  }

  // ---------------------------------------------------------------------------
  // Die Einstellungen der Eltern
  // ---------------------------------------------------------------------------
  //   startpunkt  "auto" (nach der Stufe des Kindes) oder eine Lesestufe
  //   schrift     "auto", "gross" (nur Grossbuchstaben) oder "gemischt"
  const STARTPUNKTE = ["hoeren", "buchstaben", "woerter", "saetze", "geschichten"];
  const STARTPUNKT_INFO = {
    auto: { label: "Nach Alter" },
    hoeren: { label: "Hören" },
    buchstaben: { label: "Buchstaben" },
    woerter: { label: "Wörter" },
    saetze: { label: "Sätze" },
    geschichten: { label: "Geschichten" },
  };
  const SCHRIFTEN = ["auto", "gross", "gemischt"];
  const ELTERN_LEER = { startpunkt: "auto", schrift: "auto", at: 0 };

  function elternSauber(daten) {
    const d = daten && typeof daten === "object" ? daten : {};
    return {
      startpunkt: d.startpunkt === "auto" || STARTPUNKTE.includes(d.startpunkt) ? d.startpunkt : "auto",
      schrift: SCHRIFTEN.includes(d.schrift) ? d.schrift : "auto",
      at: zahl(d.at),
    };
  }

  function elternLokal() {
    try { return elternSauber(JSON.parse(localStorage.getItem(ELTERN_KEY) || "null")); } catch { return { ...ELTERN_LEER }; }
  }

  // Die neuere Fassung gewinnt – die aus der Cloud, sobald die Eltern etwas
  // umgestellt haben. Geschrieben wird hier nur auf das Gerät.
  function elternUebernehmen(eintrag) {
    const aus = elternSauber(eintrag?.data);
    if (aus.at <= elternLokal().at) return false;
    try { localStorage.setItem(ELTERN_KEY, JSON.stringify(aus)); } catch { /* privater Modus */ }
    return true;
  }

  function einstellungen() {
    return elternLokal();
  }

  document.addEventListener("lernapp:game-state", (event) => {
    const alle = event.detail;
    if (alle && alle[ELTERN_KEY] && elternUebernehmen(alle[ELTERN_KEY])) {
      document.dispatchEvent(new CustomEvent("lernapp:lesen-einstellungen", { detail: einstellungen() }));
    }
  });
  try { elternUebernehmen(window.LernappFirebase?.getGameState?.(ELTERN_KEY)); } catch { /* ohne Konto */ }

  // Die Stufe des Kindes (leicht, mittel, schwer) steht im Kasten der Reise.
  function stufe() {
    try { return window.LernappReise?.stufe?.() || "mittel"; } catch { return "mittel"; }
  }

  // Wo die Leseecke beginnt: von den Eltern gewählt oder nach der Stufe.
  function lesestufe() {
    const { startpunkt } = einstellungen();
    if (STARTPUNKTE.includes(startpunkt)) return startpunkt;
    return { leicht: "hoeren", mittel: "buchstaben", schwer: "saetze" }[stufe()] || "buchstaben";
  }

  // Nur Grossbuchstaben? Auf "auto" für die Jüngsten ja: Im Kindergarten
  // kommen zuerst die grossen.
  function nurGross() {
    const { schrift } = einstellungen();
    if (schrift === "gross") return true;
    if (schrift === "gemischt") return false;
    return lesestufe() === "hoeren";
  }

  // Ein Wort so, wie es dieses Kind sehen soll.
  function zeige(text) {
    return nurGross() ? String(text || "").toUpperCase() : String(text || "");
  }

  // ---------------------------------------------------------------------------
  // Was ist als Nächstes dran?
  // ---------------------------------------------------------------------------
  // Der Lesewurm im Sessel sucht etwas aus. Je Lesestufe stehen ein paar Spiele
  // zur Wahl; dran ist das, was am längsten nicht mehr gespielt wurde – so
  // wechselt es von selbst ab, ohne dass jemand einen Plan führen muss.
  const SPIELE = {
    silbenzug: { page: "silbenzug.html", titel: "Silbenzug" },
    buchstabenhaus: { page: "buchstabenhaus.html", titel: "Buchstabenhaus" },
    lautekuppeln: { page: "lautekuppeln.html", titel: "Laute kuppeln" },
    stimmtdas: { page: "stimmtdas.html", titel: "Stimmt das?" },
    buecher: { page: "buecher.html?weiter=1", titel: "Bücherregal" },
  };
  const AUSWAHL = {
    hoeren: ["silbenzug", "buecher", "buchstabenhaus"],
    buchstaben: ["buchstabenhaus", "lautekuppeln", "silbenzug", "buecher"],
    woerter: ["lautekuppeln", "buchstabenhaus", "buecher", "stimmtdas"],
    saetze: ["stimmtdas", "lautekuppeln", "buecher"],
    geschichten: ["buecher", "stimmtdas", "lautekuppeln"],
  };

  function naechstes(s = stand()) {
    const liste = AUSWAHL[lesestufe()] || AUSWAHL.buchstaben;
    let beste = liste[0];
    let alter = Infinity;
    liste.forEach((id) => {
      const zuletzt = zahl(s.spiele?.[id]?.zuletzt);
      if (zuletzt < alter) { alter = zuletzt; beste = id; }
    });
    return { id: beste, ...SPIELE[beste] };
  }

  window.LernappLeseStand = {
    KEY, ELTERN_KEY, EMPTY, WOERTER_JE_GLIED, GLIEDER_MAX, SITZT_RICHTIG, SITZT_TAGE,
    STARTPUNKTE, STARTPUNKT_INFO, SCHRIFTEN, SPIELE, AUSWAHL,
    merge, stand, onChange: (fn) => box.onChange(fn),
    lautGeuebt, lautSitzt, sitzendeLaute, woerterGelesen, buchGelesen, spielRunde, spielGeoeffnet, wurmGlieder,
    einstellungen, elternSauber, stufe, lesestufe, nurGross, zeige, naechstes,
  };
})();
