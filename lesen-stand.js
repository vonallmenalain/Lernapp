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
 *     blitz:   { und: { r: 2, f: 0, tage: [...], zuletzt: … } },
 *     buecher: { "hase-rueebli": { mal: 2, sterne: 3, at: … } },
 *     spiele:  { silbenzug: { runden: 3, best: 6, zuletzt: … } },
 *     wurm:    { name: "Moli", at: … },   // so hat das Kind ihn getauft
 *   }
 *
 * Daneben die Einstellungen der Eltern (lernapp.lesen.eltern): wo die
 * Leseecke beginnt, ob nur Grossbuchstaben stehen und welche Buchstaben die
 * Schule schon eingeführt hat. Die schreibt nur der
 * Elternbereich (firebase.js); hier werden sie gelesen. Sie sind kein
 * Fortschritt und überleben deshalb jedes Zurücksetzen – wie die Stufe.
 */
(() => {
  "use strict";

  const KEY = "lernapp.lesen";
  const ELTERN_KEY = "lernapp.lesen.eltern";
  const EMPTY = { woerter: 0, laute: {}, buecher: {}, spiele: {}, blitz: {}, wurm: null };

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

  // Ein Name: Buchstaben, dazu Bindestrich, Apostroph und Leerschlag,
  // höchstens sechzehn Zeichen, jedes Wort vorne gross. Was sonst darin
  // steht, fällt weg; bleibt kein Buchstabe übrig, ist es kein Name.
  function nameSauber(text) {
    const rein = String(text || "").normalize("NFC").replace(/[^\p{L}\-' ]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16).trim();
    if (!/\p{L}/u.test(rein)) return "";
    return rein.replace(/(^|[\s-])(\p{L})/gu, (_, vor, buchstabe) => vor + buchstabe.toUpperCase());
  }

  // Der Name des Lesewurms mit seiner Zeitmarke. Gilt die neuere Taufe; bei
  // gleicher Zeit der Name, der im Alphabet hinten steht – damit beide
  // Richtungen dasselbe ergeben.
  function wurmSauber(wurm) {
    const name = nameSauber(wurm?.name);
    return name ? { name, at: zahl(wurm?.at) } : null;
  }
  function neuereTaufe(x, y) {
    const a = wurmSauber(x);
    const b = wurmSauber(y);
    if (!a || !b) return a || b;
    if (a.at !== b.at) return a.at > b.at ? a : b;
    return a.name >= b.name ? a : b;
  }

  function merge(a = EMPTY, b = EMPTY) {
    return {
      woerter: Math.max(zahl(a.woerter), zahl(b.woerter)),
      laute: mergeEintraege(a.laute, b.laute, ["r", "f", "zuletzt"]),
      blitz: mergeEintraege(a.blitz, b.blitz, ["r", "f", "zuletzt"]),
      buecher: mergeEintraege(a.buecher, b.buecher, ["mal", "sterne", "at"]),
      spiele: mergeEintraege(a.spiele, b.spiele, ["runden", "best", "zuletzt"]),
      wurm: neuereTaufe(a?.wurm, b?.wurm),
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
    return { ...EMPTY, ...s, laute: s.laute || {}, buecher: s.buecher || {}, spiele: s.spiele || {}, blitz: s.blitz || {}, wurm: wurmSauber(s.wurm) };
  }

  function heute() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ---------------------------------------------------------------------------
  // Eintragen
  // ---------------------------------------------------------------------------
  // Ein Treffer oder ein Fehlgriff, bei einem Laut (laute) oder einem
  // Blitzwort (blitz). Dieselbe Regel für beide: Gezählt wird, und für jeden
  // Treffer der Tag.
  function geuebt(feld, id, richtig) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const liste = { ...(s[feld] || {}) };
      const eintrag = { r: 0, f: 0, tage: [], zuletzt: 0, ...(liste[id] || {}) };
      if (richtig) {
        eintrag.r = zahl(eintrag.r) + 1;
        eintrag.tage = [...new Set([...(eintrag.tage || []), heute()])].sort().slice(-TAGE_MERKEN);
      } else {
        eintrag.f = zahl(eintrag.f) + 1;
      }
      eintrag.zuletzt = Date.now();
      liste[id] = eintrag;
      return { ...s, [feld]: liste };
    });
  }

  function sitzt(eintrag) {
    if (!eintrag) return false;
    return zahl(eintrag.r) >= SITZT_RICHTIG && (eintrag.tage || []).length >= SITZT_TAGE;
  }

  const lautGeuebt = (id, richtig) => geuebt("laute", id, richtig);
  const blitzGeuebt = (wort, richtig) => geuebt("blitz", wort, richtig);
  const lautSitzt = (id, s = stand()) => sitzt(s.laute?.[id]);
  const blitzSitzt = (wort, s = stand()) => sitzt(s.blitz?.[wort]);

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

  // Wie der Lesewurm heisst – leer, solange ihn niemand getauft hat.
  function wurmName(s = stand()) {
    return wurmSauber(s.wurm)?.name || "";
  }

  // Das Kind gibt ihm einen Namen (meinname.js). Kein Fortschritt, aber ein
  // Teil des Kastens: So heisst er auf jedem Gerät gleich.
  function wurmTaufen(name) {
    const sauber = nameSauber(name);
    if (!sauber) return stand();
    return box.update((alt) => ({ ...EMPTY, ...alt, wurm: { name: sauber, at: Date.now() } }));
  }

  // ---------------------------------------------------------------------------
  // Die Einstellungen der Eltern
  // ---------------------------------------------------------------------------
  //   startpunkt  "auto" (nach der Stufe des Kindes) oder eine Lesestufe
  //   schrift     "auto", "gross" (nur Grossbuchstaben) oder "gemischt"
  //   bekannt     die Laute, die das Kind aus der Schule kennt – von den
  //               Eltern abgehakt –, oder null: dann gilt die feste
  //               Reihenfolge nach der Stufe (lesen-inhalte.js)
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
  const ELTERN_LEER = { startpunkt: "auto", schrift: "auto", bekannt: null, at: 0 };

  // Ein Laut ist ein bis drei kleine Buchstaben (m, ei, sch). Eine leere Liste
  // heisst dasselbe wie keine: nichts abgehakt, die feste Reihenfolge gilt.
  const LAUT_ID = /^[a-zäöü]{1,3}$/;
  function bekanntSauber(liste) {
    if (!Array.isArray(liste)) return null;
    const ids = [...new Set(liste.map((id) => String(id || "").toLowerCase()).filter((id) => LAUT_ID.test(id)))].slice(0, 60);
    return ids.length ? ids : null;
  }

  function elternSauber(daten) {
    const d = daten && typeof daten === "object" ? daten : {};
    return {
      startpunkt: d.startpunkt === "auto" || STARTPUNKTE.includes(d.startpunkt) ? d.startpunkt : "auto",
      schrift: SCHRIFTEN.includes(d.schrift) ? d.schrift : "auto",
      bekannt: bekanntSauber(d.bekannt),
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

  // Die Laute, die das Kind aus der Schule kennt, als Menge – oder null, wenn
  // die Eltern nichts abgehakt haben.
  function bekannteLaute() {
    const { bekannt } = einstellungen();
    return bekannt ? new Set(bekannt) : null;
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
  //   page   die Seite
  //   ort    das Ding im Lesewagen, hinter dem es steht (train-leseecke.js)
  //   bild   sein Zeichen in der Auswahl
  //   weiter wohin der Lesewurm führt, wenn er es aussucht
  const SPIELE = {
    silbenzug: { page: "silbenzug.html", titel: "Silbenzug", ort: "silben", bild: "🥁" },
    reimkupplung: { page: "reimkupplung.html", titel: "Reimkupplung", ort: "silben", bild: "🎶" },
    anlautlauscher: { page: "anlautlauscher.html", titel: "Anlaut-Lauscher", ort: "silben", bild: "👂" },
    buchstabenhaus: { page: "buchstabenhaus.html", titel: "Buchstabenhaus", ort: "buchstaben", bild: "🏠" },
    meinname: { page: "meinname.html", titel: "Mein Name", ort: "buchstaben", bild: "🏷️" },
    buchstabengleis: { page: "buchstabengleis.html", titel: "Buchstabengleis", ort: "buchstaben", bild: "🛤️" },
    lautekuppeln: { page: "lautekuppeln.html", titel: "Laute kuppeln", ort: "woerter", bild: "🚃" },
    werfaehrtmit: { page: "werfaehrtmit.html", titel: "Wer fährt mit?", ort: "woerter", bild: "🎫" },
    woerterbauen: { page: "woerterbauen.html", titel: "Wörter bauen", ort: "woerter", bild: "🧱" },
    silbenbahn: { page: "silbenbahn.html", titel: "Silbenbahn", ort: "woerter", bild: "🚂" },
    blitzwoerter: { page: "blitzwoerter.html", titel: "Blitzwörter", ort: "woerter", bild: "⚡" },
    quatschwoerter: { page: "quatschwoerter.html", titel: "Quatschwörter", ort: "woerter", bild: "👾" },
    stimmtdas: { page: "stimmtdas.html", titel: "Stimmt das?", ort: "saetze", bild: "👍" },
    lueckensaetze: { page: "lueckensaetze.html", titel: "Lückensätze", ort: "saetze", bild: "🧩" },
    satzkuppeln: { page: "satzkuppeln.html", titel: "Satz kuppeln", ort: "saetze", bild: "🚃" },
    quatschsaetze: { page: "quatschsaetze.html", titel: "Quatschsätze", ort: "saetze", bild: "🤪" },
    stolperwoerter: { page: "stolperwoerter.html", titel: "Stolperwörter", ort: "saetze", bild: "🪨" },
    buecher: { page: "buecher.html", titel: "Bücherregal", ort: "buecher", bild: "📚", weiter: "buecher.html?weiter=1" },
  };
  // Was der Lesewurm im Sessel je Lesestufe aussucht.
  const AUSWAHL = {
    hoeren: ["silbenzug", "reimkupplung", "anlautlauscher", "buecher", "buchstabenhaus", "buchstabengleis"],
    buchstaben: ["buchstabenhaus", "meinname", "buchstabengleis", "anlautlauscher", "lautekuppeln", "silbenzug", "reimkupplung", "buecher"],
    woerter: ["lautekuppeln", "werfaehrtmit", "woerterbauen", "buchstabenhaus", "silbenbahn", "quatschwoerter", "buecher"],
    saetze: ["stimmtdas", "lueckensaetze", "satzkuppeln", "quatschsaetze", "blitzwoerter", "quatschwoerter", "silbenbahn", "buecher"],
    geschichten: ["buecher", "stolperwoerter", "quatschsaetze", "lueckensaetze", "satzkuppeln", "stimmtdas", "blitzwoerter"],
  };

  function naechstes(s = stand()) {
    const liste = AUSWAHL[lesestufe()] || AUSWAHL.buchstaben;
    let beste = liste[0];
    let alter = Infinity;
    liste.forEach((id) => {
      const zuletzt = zahl(s.spiele?.[id]?.zuletzt);
      if (zuletzt < alter) { alter = zuletzt; beste = id; }
    });
    const spiel = SPIELE[beste];
    return { id: beste, ...spiel, page: spiel.weiter || spiel.page };
  }

  window.LernappLeseStand = {
    KEY, ELTERN_KEY, EMPTY, WOERTER_JE_GLIED, GLIEDER_MAX, SITZT_RICHTIG, SITZT_TAGE,
    STARTPUNKTE, STARTPUNKT_INFO, SCHRIFTEN, SPIELE, AUSWAHL,
    merge, stand, onChange: (fn) => box.onChange(fn),
    lautGeuebt, lautSitzt, sitzendeLaute, blitzGeuebt, blitzSitzt, woerterGelesen, buchGelesen, spielRunde, spielGeoeffnet, wurmGlieder,
    nameSauber, wurmName, wurmTaufen,
    einstellungen, elternSauber, bekannteLaute, stufe, lesestufe, nurGross, zeige, naechstes,
  };
})();
