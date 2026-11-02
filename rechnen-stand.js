/*
 * rechnen-stand.js – Was ein Kind in der Rechenecke schon kann.
 *
 * Ein Kasten im Speicher, der dem Kind folgt (game-cloud.js), wie der Kasten
 * der Leseecke. Darin steht, welches Spiel wie oft und mit wie vielen Sternen
 * gespielt wurde, welche Aufgaben (3+2, 6-2) schon sitzen und welche
 * Fehlerbilder vorkommen. Vom Gespielten lebt der Rechendrache: Jede Runde
 * bringt so viele Taler wie Sterne, die Runde, die er selbst vorschlägt,
 * doppelt (taler).
 *
 * Bewusst Zähler, kein Protokoll – alle Kästen eines Kindes liegen in einem
 * Firestore-Dokument, das Eltern und Gruppe lesen können.
 *
 *   lernapp.rechnen
 *   {
 *     spiele:   { kuppelplus: { runden: 4, best: 6, sterne: 10, zuletzt, schritt: 1, serie: 0 } },
 *                                   // sterne: alle Sterne zusammen – das sind
 *                                   // die Taler dieses Spiels
 *     aufgaben: { "3+2": { r: 5, f: 1, s: 3, tage: ["2026-11-02", …], zuletzt } },
 *                                   // r richtig, f falsch, s schnell und
 *                                   // richtig; tage: an denen s dazukam
 *     fehler:   { eins: 3, art: 1, dreher: 0 },   // Fehlerbilder (bericht)
 *     bonus:    6,                  // Taler mehr: die doppelten der Missionen
 *     drache:   { name: "Zacki", at },             // so hat das Kind ihn getauft
 *   }
 *
 * Daneben die Einstellungen der Eltern (lernapp.rechnen.eltern): wo die
 * Rechenecke beginnt, wie weit die Zahlen gehen und ob Minus schon dabei ist.
 * Die schreibt nur der Elternbereich (firebase.js); hier werden sie gelesen.
 * Sie sind kein Fortschritt und überleben jedes Zurücksetzen.
 */
(() => {
  "use strict";

  const KEY = "lernapp.rechnen";
  const ELTERN_KEY = "lernapp.rechnen.eltern";
  const EMPTY = { spiele: {}, aufgaben: {}, fehler: {}, bonus: 0, drache: null };

  // Der Drache lebt drei Leben zu je fünfzehn Stufen – wie der Lesewurm. Jede
  // Stufe ist eine Zacke auf seinem Rücken und kostet fünf Taler: Die Leiste
  // auf seiner Karte hat fünf Felder, eine Hand voll. Nach Stufe 15 noch zehn,
  // dann zieht der fertige aufs Regal und ein neues Ei liegt auf dem Kissen.
  const TALER_JE_ZACKE = 5;
  const TALER_WECHSEL = 10;
  const DRACHE_STUFEN = 15;
  const DRACHE_LEBEN = ["baby", "lok", "stern"];
  const DRACHE_NAMEN = { baby: "Drachenbaby", lok: "Lokdrache", stern: "Sternendrache" };
  const TALER_JE_LEBEN = (DRACHE_STUFEN - 1) * TALER_JE_ZACKE + TALER_WECHSEL;

  // Ein Tipp auf den Drachen macht seinen Vorschlag zur Mission – auf diesem
  // Gerät, so lange. Wird das Spiel in der Zeit fertig, gibt es doppelt Taler.
  const MISSION_KEY = "lernapp.rechnen.mission";
  const MISSION_GILT_MS = 3 * 60 * 60 * 1000;

  // Eine Aufgabe sitzt, wenn sie dreimal schnell und richtig kam, an zwei
  // verschiedenen Tagen. Schnell heisst: ohne lange zu zählen.
  const SITZT_SCHNELL = 3;
  const SITZT_TAGE = 2;
  const SCHNELL_MS = 3500;
  const TAGE_MERKEN = 6;
  // Gemerkt werden Aufgaben mit Zahlen bis zwanzig – die Plus-Tafel.
  const AUFGABEN_BIS = 20;

  // Der Rechenwagen wird gemütlich: nach so vielen Runden je ein Ding mehr.
  const WAGEN_SCHRITTE = [1, 2, 4, 6, 9, 12, 15, 19, 23, 28, 33, 39, 45, 52, 60];

  const STUFEN_REIHE = ["leicht", "mittel", "schwer"];
  const SERIE_FUER_SCHRITT = 2;

  // Die Sprossen der Rechenleiter (docs/RECHENECKE-KONZEPT.md, Abschnitt 4).
  const SPROSSEN = ["mengen", "zahlen", "plus", "plusminus", "bis20", "bis100"];
  const SPROSSE_INFO = {
    mengen: { titel: "Mengen sehen", detail: "bis 5 auf einen Blick, mehr und weniger", deckel: 5 },
    zahlen: { titel: "Zahlen bis 10", detail: "Menge und Ziffer, weiterzählen", deckel: 10 },
    plus: { titel: "Plus bis 10", detail: "dazukommen, zusammenlegen, zerlegen", deckel: 10 },
    plusminus: { titel: "Plus und Minus bis 10", detail: "wegnehmen, ergänzen", deckel: 10 },
    bis20: { titel: "Bis 20", detail: "Zwanzigerfeld, Verdoppeln, Zehnerübergang", deckel: 20 },
    bis100: { titel: "Bis 100", detail: "Zehner und Einer, Hundertertafel", deckel: 100 },
  };
  const ZAHLENRAEUME = [5, 10, 20, 100];

  // ---------------------------------------------------------------------------
  // Die Spiele: wo sie im Rechenwagen stehen und welche Sprosse sie üben.
  // ---------------------------------------------------------------------------
  //   ort    das Ding im Rechenwagen (train-rechenecke.js)
  //   bild   ihr Zeichen in der Auswahl
  //   minus  das Spiel rechnet (auch) Minus – fällt weg, wenn die Eltern
  //          Minus ausgeschaltet haben und es nichts anderes kann
  //   ohneStufe  kennt keine Stufen und wächst nicht mit
  const SPIELE = {
    kuppelplus: { page: "kuppelplus.html", titel: "Kuppel-Plus", ort: "gleis", bild: "🚃" },
    tunnelrechnen: { page: "tunnelrechnen.html", titel: "Tunnel-Rechnen", ort: "tunnel", bild: "⛰️" },
    blitzblick: { page: "blitzblick.html", titel: "Blitzblick", ort: "fenster", bild: "⚡" },
    einsteigen: { page: "einsteigen.html", titel: "Einsteigen bitte!", ort: "perron", bild: "🚉" },
    huepfgleis: { page: "huepfgleis.html", titel: "Hüpf-Gleis", ort: "wuerfel", bild: "🛤️" },
    zahlenhaus: { page: "zahlenhaus.html", titel: "Zahlenhaus", ort: "zahlenhaus", bild: "🏠" },
    fahrplanluecke: { page: "fahrplanluecke.html", titel: "Fahrplan-Lücke", ort: "teppich", bild: "🚉" },
    countdown: { page: "countdown.html", titel: "Countdown!", ort: "teppich", bild: "🚀" },
    huepflok: { page: "huepflok.html", titel: "Hüpf-Lok", ort: "teppich", bild: "🦘" },
    zahlenpaare: { page: "zahlenpaare.html", titel: "Zahlen-Paare", ort: "zaehlrahmen", bild: "🃏" },
    fingerzahlen: { page: "fingerzahlen.html", titel: "Finger-Zahlen", ort: "zaehlrahmen", bild: "✋" },
    ziffernpunkte: { page: "ziffernpunkte.html", titel: "Ziffern-Gleis", ort: "zaehlrahmen", bild: "✏️" },
    alleeinsteigen: { page: "alleeinsteigen.html", titel: "Alle einsteigen!", ort: "perron", bild: "👆" },
    aussteigen: { page: "aussteigen.html", titel: "Aussteigen bitte!", ort: "perron", bild: "👋", minus: true },
    plusoderminus: { page: "plusoderminus.html", titel: "Plus oder Minus?", ort: "perron", bild: "➕", minus: true },
    werhatmehr: { page: "werhatmehr.html", titel: "Wer hat mehr?", ort: "waage", bild: "⚖️" },
    zaehlfenster: { page: "zaehlfenster.html", titel: "Zähl-Fenster", ort: "fenster", bild: "🐄" },
    wagenordnen: { page: "wagenordnen.html", titel: "Wagen ordnen", ort: "gleis", bild: "🔢" },
    abkuppeln: { page: "abkuppeln.html", titel: "Abkuppeln", ort: "gleis", bild: "➖", minus: true },
    ballonwagen: { page: "ballonwagen.html", titel: "Ballon-Wagen", ort: "gleis", bild: "🎈", minus: true },
    musterzug: { page: "musterzug.html", titel: "Muster-Zug", ort: "kiste", bild: "🟥" },
    stolperwagen: { page: "stolperwagen.html", titel: "Stolperwagen", ort: "kiste", bild: "❗" },
    wuerfelplus: { page: "wuerfelplus.html", titel: "Würfel-Plus", ort: "wuerfel", bild: "🎲" },
    tunnelversteck: { page: "tunnelversteck.html", titel: "Tunnel-Versteck", ort: "tunnel", bild: "🙈" },
    kiosk: { page: "kiosk.html", titel: "Kiosk", ort: "kiosk", bild: "🍦" },
  };
  // Was der Drache je Sprosse vorschlägt (dran ist, was am längsten ruht).
  const AUSWAHL = {
    mengen: ["blitzblick", "alleeinsteigen", "werhatmehr", "zaehlfenster", "musterzug", "fingerzahlen", "huepfgleis", "zahlenpaare", "countdown", "kuppelplus", "einsteigen"],
    zahlen: ["fahrplanluecke", "countdown", "zahlenpaare", "fingerzahlen", "ziffernpunkte", "wagenordnen", "huepfgleis", "blitzblick", "alleeinsteigen", "zaehlfenster", "stolperwagen", "kuppelplus", "zahlenhaus"],
    plus: ["kuppelplus", "tunnelrechnen", "einsteigen", "huepflok", "wuerfelplus", "tunnelversteck", "zahlenhaus", "blitzblick", "huepfgleis", "kiosk", "fahrplanluecke", "musterzug", "zahlenpaare"],
    plusminus: ["tunnelrechnen", "abkuppeln", "aussteigen", "ballonwagen", "plusoderminus", "tunnelversteck", "zahlenhaus", "kiosk", "huepflok", "wuerfelplus", "einsteigen", "kuppelplus"],
    bis20: ["blitzblick", "tunnelrechnen", "wuerfelplus", "huepflok", "zahlenhaus", "kiosk", "wagenordnen", "werhatmehr", "aussteigen", "fahrplanluecke", "musterzug"],
    bis100: ["blitzblick", "tunnelrechnen", "wuerfelplus", "huepflok", "zahlenhaus", "kiosk", "wagenordnen", "werhatmehr", "aussteigen", "fahrplanluecke", "musterzug"],
  };

  // ---------------------------------------------------------------------------
  // Zusammenführen – in beide Richtungen gleich, das Maximum, nie die Summe.
  // ---------------------------------------------------------------------------
  const zahl = (wert) => (Number.isFinite(Number(wert)) ? Number(wert) : 0);

  function tageVereint(x = [], y = []) {
    return [...new Set([...(Array.isArray(x) ? x : []), ...(Array.isArray(y) ? y : [])])].sort().slice(-TAGE_MERKEN);
  }

  function mergeSpiele(a = {}, b = {}) {
    const out = {};
    new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach((id) => {
      const x = (a || {})[id] || {};
      const y = (b || {})[id] || {};
      const eintrag = {};
      ["runden", "best", "sterne", "zuletzt"].forEach((feld) => { eintrag[feld] = Math.max(zahl(x[feld]), zahl(y[feld])); });
      // Wie weit ein Spiel mitgewachsen ist, sagt das Gerät, das zuletzt
      // gespielt hat; bei gleicher Zeit der grössere Schritt.
      const neuer = zahl(x.zuletzt) === zahl(y.zuletzt) ? (zahl(x.schritt) >= zahl(y.schritt) ? x : y) : (zahl(x.zuletzt) > zahl(y.zuletzt) ? x : y);
      if ("schritt" in neuer || "serie" in neuer) { eintrag.schritt = zahl(neuer.schritt); eintrag.serie = zahl(neuer.serie); }
      out[id] = eintrag;
    });
    return out;
  }

  function mergeAufgaben(a = {}, b = {}) {
    const out = {};
    new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach((id) => {
      const x = (a || {})[id] || {};
      const y = (b || {})[id] || {};
      out[id] = {
        r: Math.max(zahl(x.r), zahl(y.r)),
        f: Math.max(zahl(x.f), zahl(y.f)),
        s: Math.max(zahl(x.s), zahl(y.s)),
        tage: tageVereint(x.tage, y.tage),
        zuletzt: Math.max(zahl(x.zuletzt), zahl(y.zuletzt)),
      };
    });
    return out;
  }

  function mergeZaehler(a = {}, b = {}) {
    const out = {};
    new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach((id) => { out[id] = Math.max(zahl((a || {})[id]), zahl((b || {})[id])); });
    return out;
  }

  // Ein Name: Buchstaben, Bindestrich, Apostroph und Leerschlag, höchstens
  // sechzehn Zeichen, jedes Wort vorne gross.
  function nameSauber(text) {
    const rein = String(text || "").normalize("NFC").replace(/[^\p{L}\-' ]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16).trim();
    if (!/\p{L}/u.test(rein)) return "";
    return rein.replace(/(^|[\s-])(\p{L})/gu, (_, vor, buchstabe) => vor + buchstabe.toUpperCase());
  }
  function dracheSauber(d) {
    const name = nameSauber(d?.name);
    return name ? { name, at: zahl(d?.at) } : null;
  }
  function neuereTaufe(x, y) {
    const a = dracheSauber(x);
    const b = dracheSauber(y);
    if (!a || !b) return a || b;
    if (a.at !== b.at) return a.at > b.at ? a : b;
    return a.name >= b.name ? a : b;
  }

  function merge(a, b) {
    return {
      spiele: mergeSpiele(a?.spiele, b?.spiele),
      aufgaben: mergeAufgaben(a?.aufgaben, b?.aufgaben),
      fehler: mergeZaehler(a?.fehler, b?.fehler),
      bonus: Math.max(zahl(a?.bonus), zahl(b?.bonus)),
      drache: neuereTaufe(a?.drache, b?.drache),
    };
  }

  // Ohne game-cloud.js ein Kasten nur auf dem Gerät.
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
    return { ...EMPTY, ...s, spiele: s.spiele || {}, aufgaben: s.aufgaben || {}, fehler: s.fehler || {}, bonus: zahl(s.bonus), drache: dracheSauber(s.drache) };
  }

  function heute() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ---------------------------------------------------------------------------
  // Eintragen
  // ---------------------------------------------------------------------------
  //   sterne  wie die Runde ausging (1 bis 3): so viele Taler, und davon
  //           wächst das Spiel mit
  function spielRunde(id, { punkte = 0, sterne = 1 } = {}) {
    if (!id) return stand();
    const n = Math.max(1, Math.min(3, Math.round(zahl(sterne)) || 1));
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const spiele = { ...(s.spiele || {}) };
      const vorher = spiele[id] || {};
      spiele[id] = {
        runden: zahl(vorher.runden) + 1,
        best: Math.max(zahl(vorher.best), zahl(punkte)),
        sterne: zahl(vorher.sterne) + n,
        zuletzt: Date.now(),
      };
      Object.assign(spiele[id], mitwachsen(vorher, SPIELE[id]?.ohneStufe ? null : n));
      return { ...s, spiele };
    });
  }

  // Zwei Runden mit drei Sternen machen ein Spiel eine Stufe schwerer, zwei
  // schwache eine leichter – ohne Ansage, nie über «schwer», nie unter
  // «leicht». Wie in der Leseecke.
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

  // Nur die Zeitmarke: Für den Vorschlag des Drachen zählt, was zuletzt
  // angefasst wurde.
  function spielGeoeffnet(id) {
    if (!id) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const spiele = { ...(s.spiele || {}) };
      spiele[id] = { runden: 0, best: 0, sterne: 0, ...(spiele[id] || {}), zuletzt: Date.now() };
      return { ...s, spiele };
    });
  }

  // Eine Aufgabe ist beantwortet. key: "3+2" oder "6-2"; ms: wie lange das
  // Kind gebraucht hat (von der Frage bis zum Tipp). Gemerkt wird nur, was
  // auf die Plus-Tafel gehört – Zahlen bis zwanzig.
  function aufgabeKey(a, op, b) {
    return `${Math.round(zahl(a))}${op === "-" ? "-" : "+"}${Math.round(zahl(b))}`;
  }
  function aufgabeGeuebt(key, richtig, ms = Infinity) {
    const m = /^(\d+)([+-])(\d+)$/.exec(String(key || ""));
    if (!m || Number(m[1]) > AUFGABEN_BIS || Number(m[3]) > AUFGABEN_BIS) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      const aufgaben = { ...(s.aufgaben || {}) };
      const e = { r: 0, f: 0, s: 0, tage: [], zuletzt: 0, ...(aufgaben[key] || {}) };
      if (richtig) {
        e.r = zahl(e.r) + 1;
        if (zahl(ms) <= SCHNELL_MS) {
          e.s = zahl(e.s) + 1;
          e.tage = tageVereint(e.tage, [heute()]);
        }
      } else {
        e.f = zahl(e.f) + 1;
      }
      e.zuletzt = Date.now();
      aufgaben[key] = e;
      return { ...s, aufgaben };
    });
  }

  // Ein Fehlerbild ist vorgekommen:
  //   eins    genau eins daneben beim Weiterzählen – die Startzahl mitgezählt
  //   art     Plus statt Minus oder umgekehrt
  //   dreher  12 statt 21
  const FEHLERBILDER = ["eins", "art", "dreher"];
  function fehlerbild(art) {
    if (!FEHLERBILDER.includes(art)) return stand();
    return box.update((alt) => {
      const s = { ...EMPTY, ...alt };
      return { ...s, fehler: { ...(s.fehler || {}), [art]: zahl(s.fehler?.[art]) + 1 } };
    });
  }

  // Woran ein falsches Ergebnis liegen könnte – nur eine Vermutung aus den
  // Zahlen, ohne die Antwort zu protokollieren.
  function fehlerVon({ a, b, op = "+", richtig, antwort }) {
    if (antwort === richtig || !Number.isFinite(antwort)) return null;
    const andere = op === "+" ? a - b : a + b;
    if (Number.isFinite(andere) && antwort === andere && andere !== richtig) return "art";
    const r = String(richtig);
    if (r.length === 2 && String(antwort) === r.split("").reverse().join("") && r[0] !== r[1]) return "dreher";
    if (Math.abs(antwort - richtig) === 1) return "eins";
    return null;
  }

  function sitzt(e) {
    return Boolean(e) && zahl(e.s) >= SITZT_SCHNELL && (e.tage || []).length >= SITZT_TAGE;
  }

  // ---------------------------------------------------------------------------
  // Taler und Drache
  // ---------------------------------------------------------------------------
  function taler(s = stand()) {
    let summe = zahl(s.bonus);
    Object.values(s.spiele || {}).forEach((spiel) => { summe += zahl(spiel?.sterne); });
    return summe;
  }

  function runden(s = stand()) {
    return Object.values(s.spiele || {}).reduce((summe, spiel) => summe + zahl(spiel?.runden), 0);
  }

  // Wo der Drache bei so vielen Talern steht:
  //   leben  0, 1, 2 (Drachenbaby, Lokdrache, Sternendrache)
  //   stufe  1 bis 15 – so viele Zacken
  //   nr     1 bis 45 über alle Leben
  //   hat, braucht  die Leiste bis zur nächsten Zacke (oder zum nächsten Leben)
  //   regal  so viele fertige Drachen stehen auf dem Regal
  function dracheAus(t) {
    const n = Math.max(0, Math.floor(zahl(t)));
    const letztes = DRACHE_LEBEN.length - 1;
    const leben = Math.min(letztes, Math.floor(n / TALER_JE_LEBEN));
    const rest = n - leben * TALER_JE_LEBEN;
    const bisZacke15 = (DRACHE_STUFEN - 1) * TALER_JE_ZACKE;
    const stufe = Math.min(DRACHE_STUFEN, 1 + Math.floor(rest / TALER_JE_ZACKE));
    const fertig = leben === letztes && rest >= bisZacke15 + TALER_WECHSEL;
    let hat = 0;
    let braucht = 0;
    if (fertig) { hat = 0; braucht = 0; }
    else if (stufe < DRACHE_STUFEN) { hat = rest % TALER_JE_ZACKE; braucht = TALER_JE_ZACKE; }
    else { hat = Math.min(TALER_WECHSEL, rest - bisZacke15); braucht = TALER_WECHSEL; }
    return { leben, id: DRACHE_LEBEN[leben], stufe: fertig ? DRACHE_STUFEN : stufe, nr: leben * DRACHE_STUFEN + stufe, hat, braucht, regal: leben, fertig, taler: n };
  }
  const drache = (s = stand()) => dracheAus(taler(s));

  function missionStarten(id) {
    if (!id) return;
    try { localStorage.setItem(MISSION_KEY, JSON.stringify({ id, at: Date.now() })); } catch { /* privater Modus */ }
  }

  // Eine Runde ist fertig. War es die Mission, gibt es die Taler noch einmal –
  // einmal je Tipp auf den Drachen. Gibt zurück, wie viele dazukamen.
  function missionErfuellt(id, sterne = 1) {
    let mission = null;
    try { mission = JSON.parse(localStorage.getItem(MISSION_KEY) || "null"); } catch { mission = null; }
    if (!id || !mission || mission.id !== id || Date.now() - zahl(mission.at) > MISSION_GILT_MS) return 0;
    try { localStorage.removeItem(MISSION_KEY); } catch { /* privater Modus */ }
    const extra = Math.max(1, Math.min(3, Math.round(zahl(sterne)) || 1));
    box.update((alt) => ({ ...EMPTY, ...alt, bonus: zahl(alt?.bonus) + extra }));
    return extra;
  }

  function dracheName(s = stand()) {
    return s.drache?.name || "";
  }
  function dracheTaufen(name) {
    const sauber = nameSauber(name);
    if (!sauber) return stand();
    return box.update((alt) => ({ ...EMPTY, ...alt, drache: { name: sauber, at: Date.now() } }));
  }

  // Wie viele Dinge der Einrichtung im Rechenwagen stehen.
  function wagenStufe(s = stand()) {
    const n = runden(s);
    return WAGEN_SCHRITTE.filter((schwelle) => n >= schwelle).length;
  }

  // ---------------------------------------------------------------------------
  // Einstellungen der Eltern
  // ---------------------------------------------------------------------------
  function elternSauber(roh) {
    const e = roh && typeof roh === "object" ? roh : {};
    const beginn = SPROSSEN.includes(e.beginn) ? e.beginn : "auto";
    const raum = ZAHLENRAEUME.includes(Number(e.zahlenraum)) ? Number(e.zahlenraum) : "auto";
    const minus = e.minus === "aus" ? "aus" : "an";
    return { beginn, zahlenraum: raum, minus, at: zahl(e.at) };
  }
  function elternLokal() {
    try { return elternSauber(JSON.parse(localStorage.getItem(ELTERN_KEY) || "null")); } catch { return elternSauber(null); }
  }
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
      document.dispatchEvent(new CustomEvent("lernapp:rechnen-einstellungen", { detail: einstellungen() }));
    }
  });
  try { elternUebernehmen(window.LernappFirebase?.getGameState?.(ELTERN_KEY)); } catch { /* ohne Konto */ }

  // Die Stufe des Kindes (leicht, mittel, schwer) steht im Kasten der Reise.
  function grundstufe() {
    try { return window.LernappReise?.stufe?.() || "mittel"; } catch { return "mittel"; }
  }

  // Die Stufe eines Spiels: die des Kindes, verschoben um die Schritte, die
  // es mitgewachsen ist.
  function stufe(id = null, daten = null) {
    const grund = grundstufe();
    if (!id) return grund;
    const schritt = zahl((daten || stand()).spiele?.[id]?.schritt);
    const basis = STUFEN_REIHE.indexOf(grund);
    if (basis < 0 || !schritt) return grund;
    return STUFEN_REIHE[Math.max(0, Math.min(STUFEN_REIHE.length - 1, basis + schritt))];
  }

  // Wo die Rechenecke beginnt: von den Eltern gewählt oder nach der Stufe.
  // Eine Fünfjährige auf «leicht» beginnt bei Plus bis 10 – die Spiele selbst
  // fangen trotzdem leicht an (bis 5).
  function sprosse() {
    const { beginn } = einstellungen();
    if (SPROSSEN.includes(beginn)) return beginn;
    return { leicht: "plus", mittel: "plusminus", schwer: "bis20" }[grundstufe()] || "plus";
  }

  // Wie weit die Zahlen höchstens gehen.
  function deckel() {
    const { zahlenraum } = einstellungen();
    if (ZAHLENRAEUME.includes(zahlenraum)) return zahlenraum;
    return 100;
  }

  function minusErlaubt() {
    return einstellungen().minus !== "aus";
  }

  // ---------------------------------------------------------------------------
  // Was ist als Nächstes dran?
  // ---------------------------------------------------------------------------
  // Ist ein Spiel gerade dabei? Spiele, die nur mit Minus gehen, fallen weg,
  // wenn die Eltern Minus ausgeschaltet haben.
  function aktiv(id) {
    const spiel = SPIELE[id];
    return Boolean(spiel) && (!spiel.minus || minusErlaubt());
  }

  function naechstes(s = stand()) {
    let liste = (AUSWAHL[sprosse()] || AUSWAHL.plus).filter(aktiv);
    if (!liste.length) liste = Object.keys(SPIELE).filter(aktiv);
    let beste = liste[0];
    let alter = Infinity;
    liste.forEach((id) => {
      const zuletzt = zahl(s.spiele?.[id]?.zuletzt);
      if (zuletzt < alter) { alter = zuletzt; beste = id; }
    });
    return { id: beste, ...SPIELE[beste] };
  }

  // ---------------------------------------------------------------------------
  // Der Bericht für die Eltern (firebase.js, Karte «Rechenecke»)
  // ---------------------------------------------------------------------------
  //   tafel  0+0 bis 10+10: "sitzt", "geuebt" oder "" (noch nicht vorgekommen)
  function bericht(daten = stand()) {
    const s = { ...EMPTY, ...(daten || {}) };
    const tafel = [];
    for (let a = 0; a <= 10; a += 1) {
      const zeile = [];
      for (let b = 0; b <= 10; b += 1) {
        const e = s.aufgaben?.[`${a}+${b}`];
        zeile.push(sitzt(e) ? "sitzt" : e ? "geuebt" : "");
      }
      tafel.push(zeile);
    }
    const alle = Object.entries(s.aufgaben || {});
    const sitzend = alle.filter(([, e]) => sitzt(e)).map(([k]) => k);
    const wackelig = alle.filter(([, e]) => !sitzt(e) && zahl(e.f) > 0).sort((x, y) => zahl(y[1].f) - zahl(x[1].f)).slice(0, 8).map(([k]) => k);
    const spiele = Object.entries(s.spiele || {}).filter(([, e]) => zahl(e.runden) > 0);
    const lieblinge = spiele.sort((x, y) => zahl(y[1].runden) - zahl(x[1].runden)).slice(0, 3).map(([id]) => SPIELE[id]?.titel || id);
    const gewachsen = Object.entries(s.spiele || {}).filter(([, e]) => zahl(e.schritt) !== 0).map(([id, e]) => ({ titel: SPIELE[id]?.titel || id, schritt: zahl(e.schritt) }));
    return {
      runden: runden(s),
      taler: taler(s),
      drache: dracheAus(taler(s)),
      einrichtung: wagenStufe(s),
      sprosse: sprosse(),
      tafel,
      sitzend,
      wackelig,
      fehler: { ...(s.fehler || {}) },
      lieblinge,
      gewachsen,
    };
  }

  window.LernappRechenStand = {
    KEY, ELTERN_KEY, EMPTY, SPIELE, AUSWAHL, SPROSSEN, SPROSSE_INFO, ZAHLENRAEUME, STUFEN_REIHE, FEHLERBILDER,
    TALER_JE_ZACKE, TALER_WECHSEL, TALER_JE_LEBEN, DRACHE_STUFEN, DRACHE_LEBEN, DRACHE_NAMEN, MISSION_KEY, WAGEN_SCHRITTE,
    SITZT_SCHNELL, SITZT_TAGE, SCHNELL_MS,
    merge, stand, onChange: (fn) => box.onChange(fn),
    spielRunde, spielGeoeffnet, mitwachsen, aufgabeKey, aufgabeGeuebt, fehlerbild, fehlerVon, sitzt,
    taler, runden, drache, dracheAus, missionStarten, missionErfuellt, dracheName, dracheTaufen, nameSauber, wagenStufe,
    einstellungen, elternSauber, grundstufe, stufe, sprosse, deckel, minusErlaubt, aktiv, naechstes, bericht,
  };
})();
