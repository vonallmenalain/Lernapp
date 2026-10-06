/*
 * lesen-stand.js – Was ein Kind in der Leseecke schon kann.
 *
 * Ein Kasten im Speicher, der dem Kind folgt (game-cloud.js), wie der Kasten
 * der Reise. Darin steht, wie sicher jeder Laut sitzt, wie viele Wörter das
 * Kind gelesen oder gehört hat, welche Bücher gelesen sind und wann welches
 * Spiel zuletzt dran war. Vom Gespielten lebt der Lesewurm: Jede fertige
 * Runde ist ein Buchstabe für ihn, die Runde, die er selbst vorschlägt, zwei
 * (wurmStand).
 *
 * Bewusst Zähler, kein Protokoll: Alle Kästen eines Kindes liegen in einem
 * Firestore-Dokument, das Eltern und Gruppe lesen können. Ein Protokoll jeder
 * Antwort würde es füllen und mehr erzählen als nötig.
 *
 *   lernapp.lesen
 *   {
 *     woerter: 240,                 // gelesen oder gehört – für die Eltern
 *     laute:   { m: { r: 4, f: 1, tage: ["2026-10-06", …], zuletzt: … } },
 *     blitz:   { und: { r: 2, f: 0, tage: [...], zuletzt: … } },
 *     buecher: { "hase-rueebli": { mal: 2, sterne: 3, at: … } },
 *     spiele:  { silbenzug: { runden: 3, best: 6, zuletzt: … },
 *                stimmtdas: { runden: 5, best: 8, zeit: 14, schritt: 1, serie: 0, zuletzt: … } },
 *                                   // zeit: Bestwert der Runde auf Zeit;
 *                                   // schritt, serie: das Spiel wächst mit
 *                                   // (siehe mitwachsen)
 *     missionen: 4,                 // Runden, die der Lesewurm vorschlug
 *                                   // (je ein Buchstabe mehr)
 *     wurm:    { name: "Moli", at: … },   // so hat das Kind ihn getauft
 *     verwechselt: { "b|d": 3 },          // wie oft b für d genommen wurde
 *   }                                     // oder d für b – für die Eltern
 *
 * Daneben die Einstellungen der Eltern (lernapp.lesen.eltern): wo die
 * Leseecke beginnt, ob nur Grossbuchstaben stehen, welche Buchstaben die
 * Schule schon eingeführt hat, wie gross die Schrift in den Büchern ist und
 * ob ein Tipp auf ein Wort es vorliest. Die schreibt nur der
 * Elternbereich (firebase.js); hier werden sie gelesen. Sie sind kein
 * Fortschritt und überleben deshalb jedes Zurücksetzen – wie die Stufe.
 */
(() => {
  "use strict";

  const KEY = "lernapp.lesen";
  const ELTERN_KEY = "lernapp.lesen.eltern";
  const EMPTY = { woerter: 0, laute: {}, buecher: {}, spiele: {}, blitz: {}, missionen: 0, wurm: null, verwechselt: {} };

  // Je so viele Wörter ein Glied: So wuchs der Lesewurm, bis er Stufen bekam.
  // Gezählt wird weiter (für den Bericht und wer es noch braucht).
  const WOERTER_JE_GLIED = 20;
  const GLIEDER_MAX = 60;

  // Der Lesewurm lebt drei Leben (lesen-wurm.js zeichnet sie): Zuerst wird er
  // ein Lesefalter, dann ein neuer Wurm der Lesewurm-Express, zuletzt ein
  // dritter der Lesezauberer. Jedes Leben hat fünfzehn Stufen. Sein Futter
  // sind Buchstaben: jede fertige Runde einer – auch ein gelesenes Buch ist
  // eine Runde des Bücherregals –, die Runde, die der Wurm vorschlägt, einer
  // mehr. So viele braucht es von einer Stufe zur nächsten, am Anfang wenige:
  const WURM_BEDARF = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8];
  // Nach Stufe 15 noch so viele, dann zieht der fertige aufs Regal und ein
  // neuer Wurm schlüpft. Nach dem dritten Leben ist Schluss: Er bleibt der
  // Lesezauberer, und der Wurm schlägt nur noch vor, was dran ist.
  const WURM_WECHSEL = 8;
  const WURM_LEBEN = ["falter", "express", "zauberer"];
  const WURM_NAMEN = { falter: "Lesefalter", express: "Lesewurm-Express", zauberer: "Lesezauberer" };
  const WURM_STUFEN = 15;
  // Hat das Kind auf den Wurm getippt, gilt sein Vorschlag so lange – auf
  // diesem Gerät. Wird dieses Spiel in der Zeit fertig gespielt, gibt es den
  // Buchstaben mehr (missionErfuellt).
  const MISSION_KEY = "lernapp.lesen.mission";
  const MISSION_GILT_MS = 3 * 60 * 60 * 1000;

  // Ein Laut sitzt, wenn er dreimal richtig erkannt wurde, und zwar an zwei
  // verschiedenen Tagen: Einmal Glück und dreimal hintereinander am selben
  // Nachmittag ist noch kein Wissen.
  const SITZT_RICHTIG = 3;
  const SITZT_TAGE = 2;
  const TAGE_MERKEN = 6;

  // Der Lesewagen wird gemütlich: Nach so vielen gelesenen Stücken – Runden
  // in den Spielen und Bücher – kommt je ein Ding der Einrichtung dazu
  // (lesen-art.js, AUSBAU). Am Anfang schnell, dann gemächlicher.
  const WAGEN_SCHRITTE = [1, 2, 4, 6, 9, 12, 15, 19, 23, 28, 33, 39, 45, 52, 60];

  // Verwechslungen merkt sich der Kasten nur paarweise und nur so viele.
  const VERWECHSLUNGEN_MAX = 24;

  // Die Stufen, in denen ein Spiel mitwächst, und wie viele Runden
  // hintereinander dafür nötig sind.
  const STUFEN_REIHE = ["leicht", "mittel", "schwer"];
  const SERIE_FUER_SCHRITT = 2;

  // ---------------------------------------------------------------------------
  // Zusammenführen
  // ---------------------------------------------------------------------------
  // Wie überall bei game-cloud: in beide Richtungen gleich, und derselbe Stand
  // darf mehrfach ankommen, ohne dass etwas doppelt zählt. Deshalb das Maximum,
  // nie die Summe.
  const zahl = (wert) => (Number.isFinite(Number(wert)) ? Number(wert) : 0);

  //   wahlweise  Felder, die nur manche Einträge haben (der Bestwert auf
  //              Zeit): Sie kommen nur dazu, wo eine Seite sie kennt.
  function mergeEintraege(a = {}, b = {}, felder, wahlweise = []) {
    const out = {};
    new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach((id) => {
      const x = (a || {})[id] || {};
      const y = (b || {})[id] || {};
      const eintrag = {};
      felder.forEach((feld) => { eintrag[feld] = Math.max(zahl(x[feld]), zahl(y[feld])); });
      wahlweise.forEach((feld) => { if (feld in x || feld in y) eintrag[feld] = Math.max(zahl(x[feld]), zahl(y[feld])); });
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

  // Ein Paar von Lauten, immer gleich geschrieben: «b|d», nie «d|b».
  const PAAR = /^[a-zäöü]{1,3}\|[a-zäöü]{1,3}$/;
  function verwechseltSauber(liste) {
    const out = {};
    Object.entries(liste && typeof liste === "object" ? liste : {}).forEach(([paar, mal]) => {
      if (PAAR.test(paar) && zahl(mal) > 0) out[paar] = zahl(mal);
    });
    return out;
  }
  // Die häufigsten bleiben, wenn es zu viele werden – und die Paare stehen
  // immer in derselben Reihenfolge, gleich aus welcher Richtung gemischt wird.
  function verwechseltKuerzen(liste) {
    const eintraege = Object.entries(liste)
      .sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))
      .slice(0, VERWECHSLUNGEN_MAX);
    return Object.fromEntries(eintraege.sort((x, y) => (x[0] < y[0] ? -1 : 1)));
  }

  // Bei den Spielen kommen Schritt und Serie vom Gerät, das zuletzt gespielt
  // hat: Ein Maximum wäre falsch, ein Spiel kann auch wieder leichter werden.
  // Gleich alt: der grössere Wert, damit beide Richtungen dasselbe ergeben.
  function mergeSpiele(a = {}, b = {}) {
    const out = mergeEintraege(a, b, ["runden", "best", "zuletzt"], ["zeit"]);
    Object.keys(out).forEach((id) => {
      const x = (a || {})[id] || {};
      const y = (b || {})[id] || {};
      if (!("schritt" in x) && !("schritt" in y)) return;
      const zx = zahl(x.zuletzt);
      const zy = zahl(y.zuletzt);
      const neuer = zx > zy ? x : zy > zx ? y : null;
      out[id].schritt = neuer ? zahl(neuer.schritt) : Math.max(zahl(x.schritt), zahl(y.schritt));
      out[id].serie = neuer ? zahl(neuer.serie) : Math.max(zahl(x.serie), zahl(y.serie));
    });
    return out;
  }

  function merge(a = EMPTY, b = EMPTY) {
    const x = verwechseltSauber(a?.verwechselt);
    const y = verwechseltSauber(b?.verwechselt);
    const verwechselt = {};
    new Set([...Object.keys(x), ...Object.keys(y)]).forEach((paar) => { verwechselt[paar] = Math.max(zahl(x[paar]), zahl(y[paar])); });
    return {
      woerter: Math.max(zahl(a.woerter), zahl(b.woerter)),
      missionen: Math.max(zahl(a.missionen), zahl(b.missionen)),
      laute: mergeEintraege(a.laute, b.laute, ["r", "f", "zuletzt"]),
      blitz: mergeEintraege(a.blitz, b.blitz, ["r", "f", "zuletzt"]),
      buecher: mergeEintraege(a.buecher, b.buecher, ["mal", "sterne", "at"]),
      spiele: mergeSpiele(a.spiele, b.spiele),
      wurm: neuereTaufe(a?.wurm, b?.wurm),
      verwechselt: verwechseltKuerzen(verwechselt),
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
    return { ...EMPTY, ...s, laute: s.laute || {}, buecher: s.buecher || {}, spiele: s.spiele || {}, blitz: s.blitz || {}, wurm: wurmSauber(s.wurm), verwechselt: verwechseltSauber(s.verwechselt) };
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

  //   sterne  wie die Runde ausging (1 bis 3) – davon wächst das Spiel mit;
  //           ohne Sterne (ein Buch) bleibt die Stufe, wie sie ist
  function spielRunde(id, { punkte = 0, sterne = null } = {}) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const spiele = { ...(s.spiele || {}) };
      const vorher = spiele[id] || {};
      spiele[id] = { runden: zahl(vorher.runden) + 1, best: Math.max(zahl(vorher.best), zahl(punkte)), zuletzt: Date.now() };
      // Der Bestwert auf Zeit bleibt stehen.
      if ("zeit" in vorher) spiele[id].zeit = zahl(vorher.zeit);
      // Mit wächst nur, was Stufen hat (SPIELE, ohneStufe).
      Object.assign(spiele[id], mitwachsen(vorher, SPIELE[id]?.ohneStufe ? null : sterne));
      return { ...s, spiele };
    });
  }

  // Mitwachsen in kleinen Schritten: Zwei Runden mit drei Sternen
  // hintereinander machen ein Spiel eine Stufe schwerer, zwei schwache (ein
  // Stern) eine leichter – ohne dass es jemand ansagt. Zwei Sterne beginnen
  // die Serie neu, und jeder Schritt auch. Der Schritt gilt relativ zur Stufe
  // des Kindes und bleibt in den drei Stufen: über «schwer» hinaus geht es
  // nicht, unter «leicht» auch nicht.
  function mitwachsen(vorher, sterne) {
    if (sterne === null && !("schritt" in vorher)) return {};
    const basis = Math.max(0, STUFEN_REIHE.indexOf(grundstufe()));
    const unten = -basis;
    const oben = STUFEN_REIHE.length - 1 - basis;
    let schritt = Math.max(unten, Math.min(oben, zahl(vorher.schritt)));
    let serie = zahl(vorher.serie);
    if (sterne === 3) serie = Math.max(serie, 0) + 1;
    else if (sterne === 1) serie = Math.min(serie, 0) - 1;
    else if (sterne === 2) serie = 0;
    if (serie >= SERIE_FUER_SCHRITT) { schritt = Math.min(oben, schritt + 1); serie = 0; }
    if (serie <= -SERIE_FUER_SCHRITT) { schritt = Math.max(unten, schritt - 1); serie = 0; }
    return { schritt, serie };
  }

  // Eine Runde auf Zeit (45 Sekunden, so viele wie möglich): Sie zählt als
  // Runde, ihr Ergebnis aber als eigener Bestwert – mit den acht Aufgaben
  // einer gewöhnlichen Runde ist es nicht zu vergleichen.
  function zeitRunde(id, { punkte = 0 } = {}) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const spiele = { ...(s.spiele || {}) };
      const vorher = spiele[id] || {};
      spiele[id] = { runden: zahl(vorher.runden) + 1, best: zahl(vorher.best), zeit: Math.max(zahl(vorher.zeit), zahl(punkte)), zuletzt: Date.now() };
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

  // Ein Buchstabe wurde für einen anderen genommen: ein n, wo ein m gesucht
  // war (Buchstaben-Signal, Buchstabenhaus). Gezählt wird das Paar, egal in
  // welcher Richtung – für den Bericht an die Eltern.
  function verwechselt(gesucht, genommen) {
    const a = String(gesucht || "").toLowerCase();
    const b = String(genommen || "").toLowerCase();
    if (!a || !b || a === b) return stand();
    const paar = [a, b].sort().join("|");
    if (!PAAR.test(paar)) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const liste = verwechseltSauber(s.verwechselt);
      liste[paar] = zahl(liste[paar]) + 1;
      return { ...s, verwechselt: verwechseltKuerzen(liste) };
    });
  }

  // Wie viele Stücke das Kind gelesen hat: fertige Runden und Bücher.
  function lesestuecke(s = stand()) {
    const runden = Object.values(s.spiele || {}).reduce((summe, e) => summe + zahl(e?.runden), 0);
    const buecher = Object.values(s.buecher || {}).reduce((summe, e) => summe + zahl(e?.mal), 0);
    return runden + buecher;
  }

  // Wie viele Dinge der Einrichtung schon im Lesewagen stehen (0 bis 15).
  function wagenStufe(s = stand()) {
    const n = lesestuecke(s);
    return WAGEN_SCHRITTE.filter((ab) => n >= ab).length;
  }

  // ---------------------------------------------------------------------------
  // Der Lesewurm: Buchstaben, Leben und Stufen
  // ---------------------------------------------------------------------------
  // Wie viele Buchstaben der Wurm bekommen hat: jede fertige Runde einen – ein
  // Buch zählt als Runde des Bücherregals, nicht noch einmal als Buch –, und
  // jede Runde, die er vorgeschlagen hat, einen mehr.
  function buchstaben(s = stand()) {
    const runden = Object.values(s?.spiele || {}).reduce((summe, e) => summe + zahl(e?.runden), 0);
    return runden + zahl(s?.missionen);
  }

  // Wo der Wurm steht:
  //   leben    0 Lesefalter, 1 Lesewurm-Express, 2 Lesezauberer
  //   id       dasselbe als Name (WURM_LEBEN)
  //   stufe    1 bis 15
  //   nr       alle Stufen der drei Leben durchgezählt, 1 bis 45
  //   hat      so viele Buchstaben liegen schon in der Leiste
  //   braucht  so viele braucht es bis zur nächsten Stufe (nach Stufe 15:
  //            bis zum neuen Wurm); 0, wenn alles geschafft ist
  //   fertig   das dritte Leben ist ganz durch
  //   regal    so viele fertige Würmer stehen auf dem Regal (0 bis 2)
  function wurmStand(s = stand()) {
    return wurmAus(buchstaben(s));
  }

  // Dasselbe aus einer Zahl von Buchstaben: Das Zimmer rechnet damit nach, wo
  // der Wurm beim letzten Besuch stand.
  function wurmAus(anzahl) {
    let rest = Math.max(0, Math.floor(zahl(anzahl)));
    for (let leben = 0; leben < WURM_LEBEN.length; leben += 1) {
      const letztes = leben === WURM_LEBEN.length - 1;
      for (let stufe = 1; stufe <= WURM_STUFEN; stufe += 1) {
        const braucht = stufe < WURM_STUFEN ? WURM_BEDARF[stufe - 1] : letztes ? 0 : WURM_WECHSEL;
        const ort = { leben, id: WURM_LEBEN[leben], stufe, nr: leben * WURM_STUFEN + stufe, regal: leben };
        if (!braucht) return { ...ort, hat: 0, braucht: 0, fertig: true };
        if (rest < braucht) return { ...ort, hat: rest, braucht, fertig: false };
        rest -= braucht;
      }
    }
    return { leben: 2, id: WURM_LEBEN[2], stufe: WURM_STUFEN, nr: WURM_LEBEN.length * WURM_STUFEN, regal: 2, hat: 0, braucht: 0, fertig: true };
  }

  // Das Kind hat auf den Wurm getippt: Sein Vorschlag gilt jetzt als Mission.
  function missionStarten(id) {
    if (!id) return;
    try { localStorage.setItem(MISSION_KEY, JSON.stringify({ id, at: Date.now() })); } catch { /* privater Modus */ }
  }

  // Eine Runde ist fertig. War es die, die der Wurm vorgeschlagen hat, gibt es
  // einen Buchstaben mehr – einmal je Tipp auf den Wurm.
  function missionErfuellt(id) {
    let mission = null;
    try { mission = JSON.parse(localStorage.getItem(MISSION_KEY) || "null"); } catch { mission = null; }
    if (!id || !mission || mission.id !== id || Date.now() - zahl(mission.at) > MISSION_GILT_MS) return false;
    try { localStorage.removeItem(MISSION_KEY); } catch { /* privater Modus */ }
    box.update((alt) => ({ ...EMPTY, ...alt, missionen: zahl(alt?.missionen) + 1 }));
    return true;
  }

  // Der Bericht für die Eltern (firebase.js, Karte «Leseecke»): nur Zahlen
  // und Listen, die Worte macht der Elternbereich. Laute in der Reihenfolge
  // des Buchstabenhauses, wenn lesen-inhalte.js geladen ist.
  function bericht(daten = stand()) {
    const s = { ...EMPTY, ...(daten || {}) };
    const reihe = (window.LernappLeseInhalte?.LAUTE || []).map((l) => l.id);
    const ordne = (ids) => ids.sort((x, y) => {
      const a = reihe.indexOf(x);
      const b = reihe.indexOf(y);
      return (a < 0 ? 999 : a) - (b < 0 ? 999 : b) || (x < y ? -1 : 1);
    });
    const laute = Object.entries(s.laute || {});
    const sicher = ordne(laute.filter(([, e]) => sitzt(e)).map(([id]) => id));
    // Wackelig: schon geübt, sitzt noch nicht, und es ging schon daneben.
    const wackelig = ordne(laute.filter(([, e]) => !sitzt(e) && zahl(e?.f) > 0).map(([id]) => id));
    const buecher = Object.entries(s.buecher || {}).filter(([, e]) => zahl(e?.mal) > 0);
    const spiele = Object.entries(s.spiele || {})
      .filter(([, e]) => zahl(e?.runden) > 0)
      .map(([id, e]) => ({ id, titel: SPIELE[id]?.titel || id, runden: zahl(e.runden) }))
      .sort((x, y) => y.runden - x.runden || (x.titel < y.titel ? -1 : 1));
    // Was von selbst schwerer oder leichter geworden ist.
    const angepasst = Object.entries(s.spiele || {})
      .filter(([, e]) => zahl(e?.schritt) !== 0)
      .map(([id, e]) => ({ id, titel: SPIELE[id]?.titel || id, richtung: zahl(e.schritt) > 0 ? "schwerer" : "leichter" }))
      .sort((x, y) => (x.titel < y.titel ? -1 : 1));
    // Die Bestwerte auf Zeit: so viele Aufgaben in 45 Sekunden.
    const zeit = Object.entries(s.spiele || {})
      .filter(([, e]) => zahl(e?.zeit) > 0)
      .map(([id, e]) => ({ id, titel: SPIELE[id]?.titel || id, best: zahl(e.zeit) }))
      .sort((x, y) => (x.titel < y.titel ? -1 : 1));
    const verwechslungen = Object.entries(verwechseltSauber(s.verwechselt))
      .filter(([, mal]) => mal >= 2)
      .sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))
      .slice(0, 5)
      .map(([paar, mal]) => ({ paar: paar.split("|"), mal }));
    return {
      woerter: zahl(s.woerter),
      glieder: wurmGlieder(s),
      wurm: wurmStand(s),
      runden: spiele.reduce((summe, e) => summe + e.runden, 0),
      spiele,
      zeit,
      angepasst,
      buecher: buecher.length,
      buecherGold: buecher.filter(([, e]) => zahl(e?.sterne) >= 3).length,
      buecherIds: buecher.map(([id]) => id),
      sicher,
      wackelig,
      verwechslungen,
      blitzSicher: Object.entries(s.blitz || {}).filter(([, e]) => sitzt(e)).length,
      wagen: wagenStufe(s),
      wagenVon: WAGEN_SCHRITTE.length,
    };
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
  //   groesse     die Schrift in den Büchern: "normal", "gross", "sehr-gross"
  //   hilfe       "an": ein Tipp auf ein Wort liest es vor, auch beim
  //               Selberlesen; "aus" für Ältere, die sich nicht auf die
  //               Stimme verlassen sollen
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
  const GROESSEN = ["normal", "gross", "sehr-gross"];
  const HILFEN = ["an", "aus"];
  const ELTERN_LEER = { startpunkt: "auto", schrift: "auto", bekannt: null, groesse: "normal", hilfe: "an", at: 0 };

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
      groesse: GROESSEN.includes(d.groesse) ? d.groesse : "normal",
      hilfe: HILFEN.includes(d.hilfe) ? d.hilfe : "an",
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
  function grundstufe() {
    try { return window.LernappReise?.stufe?.() || "mittel"; } catch { return "mittel"; }
  }

  // Die Stufe für ein Spiel: die des Kindes, verschoben um die Schritte, die
  // das Spiel mitgewachsen ist. Ohne Spiel die des Kindes.
  function stufe(id = null, daten = null) {
    const grund = grundstufe();
    if (!id) return grund;
    const schritt = zahl((daten || stand()).spiele?.[id]?.schritt);
    const basis = STUFEN_REIHE.indexOf(grund);
    if (basis < 0 || !schritt) return grund;
    return STUFEN_REIHE[Math.max(0, Math.min(STUFEN_REIHE.length - 1, basis + schritt))];
  }

  // Wo die Leseecke beginnt: von den Eltern gewählt oder nach der Stufe des
  // Kindes – nicht nach einem Spiel, das mitgewachsen ist.
  function lesestufe() {
    const { startpunkt } = einstellungen();
    if (STARTPUNKTE.includes(startpunkt)) return startpunkt;
    return { leicht: "hoeren", mittel: "buchstaben", schwer: "saetze" }[grundstufe()] || "buchstaben";
  }

  // Nur Grossbuchstaben? Auf "auto" für die Jüngsten ja: Im Kindergarten
  // kommen zuerst die grossen.
  function nurGross() {
    const { schrift } = einstellungen();
    if (schrift === "gross") return true;
    if (schrift === "gemischt") return false;
    return lesestufe() === "hoeren";
  }

  // Wie gross die Schrift in den Büchern steht, und ob ein Tipp auf ein Wort
  // es vorliest (buecher.js).
  function schriftGroesse() {
    return einstellungen().groesse;
  }

  function wortHilfe() {
    return einstellungen().hilfe !== "aus";
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
  //   ohneStufe  das Spiel kennt keine Stufen – es wächst nicht mit
  //              (validate-lesen.mjs prüft das an der Quelle des Spiels)
  const SPIELE = {
    silbenzug: { page: "silbenzug.html", titel: "Silbenzug", ort: "silben", bild: "🥁" },
    lautposition: { page: "lautposition.html", titel: "Laut-Position", ort: "silben", bild: "🔎" },
    reimkupplung: { page: "reimkupplung.html", titel: "Reimkupplung", ort: "silben", bild: "🎶" },
    anlautlauscher: { page: "anlautlauscher.html", titel: "Anlaut-Lauscher", ort: "silben", bild: "👂" },
    buchstabenhaus: { page: "buchstabenhaus.html", titel: "Buchstabenhaus", ort: "buchstaben", bild: "🏠" },
    meinname: { page: "meinname.html", titel: "Mein Name", ort: "buchstaben", bild: "🏷️", ohneStufe: true },
    buchstabengleis: { page: "buchstabengleis.html", titel: "Buchstabengleis", ort: "buchstaben", bild: "🛤️", ohneStufe: true },
    buchstabensignal: { page: "buchstabensignal.html", titel: "Buchstaben-Signal", ort: "buchstaben", bild: "🚦" },
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
    liesundtu: { page: "liesundtu.html", titel: "Lies und tu!", ort: "saetze", bild: "🖍️" },
    buecher: { page: "buecher.html", titel: "Bücherregal", ort: "buecher", bild: "📚", weiter: "buecher.html?weiter=1", ohneStufe: true },
    geschichtenzug: { page: "geschichtenzug.html", titel: "Geschichtenzug", ort: "buecher", bild: "🖼️" },
    werbinich: { page: "werbinich.html", titel: "Wer bin ich?", ort: "detektiv", bild: "❓" },
    detektivfaelle: { page: "detektivfaelle.html", titel: "Detektivfälle", ort: "detektiv", bild: "🕵️", ohneStufe: true },
    steckbriefe: { page: "steckbriefe.html", titel: "Steckbriefe", ort: "detektiv", bild: "📋", ohneStufe: true },
    postkarten: { page: "postkarten.html", titel: "Postkarten", ort: "detektiv", bild: "📮" },
    wortbaustelle: { page: "wortbaustelle.html", titel: "Wortbaustelle", ort: "detektiv", bild: "🏗️" },
  };
  // Was der Lesewurm im Sessel je Lesestufe aussucht.
  const AUSWAHL = {
    hoeren: ["silbenzug", "reimkupplung", "anlautlauscher", "buecher", "buchstabenhaus", "buchstabengleis"],
    buchstaben: ["buchstabenhaus", "meinname", "buchstabengleis", "buchstabensignal", "lautposition", "anlautlauscher", "lautekuppeln", "silbenzug", "reimkupplung", "buecher"],
    woerter: ["lautekuppeln", "werfaehrtmit", "woerterbauen", "buchstabenhaus", "silbenbahn", "quatschwoerter", "buecher"],
    saetze: ["stimmtdas", "lueckensaetze", "satzkuppeln", "quatschsaetze", "liesundtu", "geschichtenzug", "werbinich", "postkarten", "blitzwoerter", "quatschwoerter", "wortbaustelle", "silbenbahn", "buecher"],
    geschichten: ["buecher", "geschichtenzug", "werbinich", "detektivfaelle", "steckbriefe", "postkarten", "wortbaustelle", "stolperwoerter", "liesundtu", "quatschsaetze", "lueckensaetze", "satzkuppeln", "stimmtdas", "blitzwoerter"],
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
    KEY, ELTERN_KEY, EMPTY, WOERTER_JE_GLIED, GLIEDER_MAX, SITZT_RICHTIG, SITZT_TAGE, STUFEN_REIHE, SERIE_FUER_SCHRITT,
    WURM_BEDARF, WURM_WECHSEL, WURM_LEBEN, WURM_NAMEN, WURM_STUFEN, MISSION_KEY, buchstaben, wurmStand, wurmAus, missionStarten, missionErfuellt,
    STARTPUNKTE, STARTPUNKT_INFO, SCHRIFTEN, GROESSEN, HILFEN, SPIELE, AUSWAHL,
    merge, stand, onChange: (fn) => box.onChange(fn),
    lautGeuebt, lautSitzt, sitzendeLaute, blitzGeuebt, blitzSitzt, woerterGelesen, buchGelesen, spielRunde, zeitRunde, spielGeoeffnet, wurmGlieder,
    WAGEN_SCHRITTE, lesestuecke, wagenStufe, verwechselt, bericht,
    nameSauber, wurmName, wurmTaufen,
    einstellungen, elternSauber, bekannteLaute, schriftGroesse, wortHilfe, grundstufe, stufe, mitwachsen, lesestufe, nurGross, zeige, naechstes,
  };
})();
