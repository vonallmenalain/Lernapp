/*
 * englisch-stand.js – Was ein Kind in der Englischecke schon kann.
 *
 * Ein Kasten im Spielstand wie der Lese- und der Rechenstand
 * (game-cloud.js): lernapp.englisch. Nur Zähler und Tage, kein Protokoll.
 *
 *   woerter      { id: { g: Tag, an dem es zuerst gehört wurde,
 *                        n: wie oft gehört,
 *                        e: Tage, an denen es in «Hear & find» beim ersten
 *                           Versuch erkannt wurde (die letzten sechs),
 *                        f: wie oft daneben getippt } }
 *   runden       { entdecken, hearfind, geschichte, memory, janein, roccosays,
 *                farbenzug, zaehlen, fuettern, verse, buch }: fertige Runden – davon
 *                wird der Caboose eingerichtet (15 Schritte wie Lese- und
 *                Rechenwagen)
 *   geschichten  { id: wie oft bis «The end.» gehört – auch die Bücher aus dem
 *                Lesewagen (ihre Id) }
 *
 * Farben (red …) und Zahlen (n1 … n10) sind Wörter wie die der Welten: Rocco
 * says, der Farben-Zug und Count with Rocco machen sie gehört und erkannt.
 *
 * Ein Wort hat drei Stände (Abschnitt 13 des Konzepts):
 *   gehoert  einmal angetippt oder gehört
 *   erkannt  in «Hear & find» beim ersten Versuch gefunden
 *   sicher   an zwei verschiedenen Tagen erkannt («sitzt»)
 *
 * Eine Welt bekommt ihren Aufnäher, wenn alle ihre Wörter erkannt sind, und
 * einen Goldrand, wenn alle sitzen.
 *
 * Die Eltern stellen ein (lernapp.englisch.eltern, wie die Rechenecke):
 *   schrift  "auto" (die englischen Wörter stehen da, wenn das Kind auf der
 *            Stufe «schwer» ist), "aus" oder "an"
 *   tempo    "normal" oder "langsam" (die Aufnahmen spielen mit 0.85)
 */
(() => {
  "use strict";

  const KEY = "lernapp.englisch";
  const ELTERN_KEY = "lernapp.englisch.eltern";
  const EMPTY = { woerter: {}, runden: {}, geschichten: {} };
  const WAGEN_SCHRITTE = [1, 2, 4, 6, 9, 12, 15, 19, 23, 28, 33, 39, 45, 52, 60];
  const SCHRIFTEN = ["auto", "aus", "an"];
  const inhalt = () => window.LernappEnglischInhalt || { WELTEN: [], EXTRA_WOERTER: [], GESCHICHTEN: [] };

  const zahl = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : 0);
  const tagSauber = (t) => (typeof t === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : "");
  function heute() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ---------------------------------------------------------------------------
  // Der Kasten
  // ---------------------------------------------------------------------------
  function wortSauber(w) {
    const tage = Array.isArray(w?.e) ? [...new Set(w.e.map(tagSauber).filter(Boolean))].sort().slice(-6) : [];
    return { g: tagSauber(w?.g), n: zahl(w?.n), e: tage, f: zahl(w?.f) };
  }
  function zaehlerSauber(z) {
    const aus = {};
    Object.entries(z && typeof z === "object" ? z : {}).forEach(([k, v]) => { if (zahl(v)) aus[k] = zahl(v); });
    return aus;
  }
  function sauber(s) {
    const woerter = {};
    Object.entries(s?.woerter && typeof s.woerter === "object" ? s.woerter : {}).forEach(([id, w]) => { woerter[id] = wortSauber(w); });
    return { woerter, runden: zaehlerSauber(s?.runden), geschichten: zaehlerSauber(s?.geschichten) };
  }
  // Zwei Geräte: von jedem Wort das Frühere (zuerst gehört) und das Mehr.
  function merge(a, b) {
    const x = sauber(a);
    const y = sauber(b);
    const woerter = { ...x.woerter };
    Object.entries(y.woerter).forEach(([id, w]) => {
      const v = woerter[id];
      if (!v) { woerter[id] = w; return; }
      const g = [v.g, w.g].filter(Boolean).sort()[0] || "";
      woerter[id] = { g, n: Math.max(v.n, w.n), e: [...new Set([...v.e, ...w.e])].sort().slice(-6), f: Math.max(v.f, w.f) };
    });
    const max = (p, q) => {
      const aus = { ...p };
      Object.entries(q).forEach(([k, v]) => { aus[k] = Math.max(aus[k] || 0, v); });
      return aus;
    };
    return { woerter, runden: max(x.runden, y.runden), geschichten: max(x.geschichten, y.geschichten) };
  }

  // Ohne game-cloud.js ein Kasten nur auf dem Gerät.
  const cloudApi = window.LernappGameCloud;
  const box = cloudApi
    ? cloudApi.register({ key: KEY, empty: EMPTY, merge })
    : (() => {
      let current = (() => { try { return JSON.parse(localStorage.getItem(KEY) || "null") || EMPTY; } catch { return EMPTY; } })();
      return {
        read: () => current,
        write(data) { current = data; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* privater Modus */ } return current; },
        update(fn) { return this.write(fn(current)); },
        onChange() { return () => {}; },
      };
    })();

  const stand = () => sauber(box.read() || EMPTY);
  const schreibe = (fn) => box.update((alt) => fn(sauber(alt || EMPTY)));

  // ---------------------------------------------------------------------------
  // Wörter
  // ---------------------------------------------------------------------------
  const welten = () => inhalt().WELTEN;
  function wortVon(id) {
    for (const welt of welten()) {
      const w = welt.woerter.find((x) => x.id === id);
      if (w) return w;
    }
    const I = inhalt();
    return I.EXTRA_WOERTER.find((x) => x.id === id) || (I.FARBEN || []).find((x) => x.id === id) || (I.ZAHLEN || []).find((x) => x.id === id) || null;
  }
  function weltVon(id) { return welten().find((w) => w.id === id) || null; }

  // Gehört: Gibt true zurück, wenn es das erste Mal war (ein neuer Sticker).
  function gehoert(id) {
    if (!wortVon(id)) return false;
    let neu = false;
    schreibe((s) => {
      const w = s.woerter[id] || wortSauber(null);
      neu = !w.g;
      s.woerter[id] = { ...w, g: w.g || heute(), n: w.n + 1 };
      return s;
    });
    return neu;
  }
  // Ein Tipp in «Hear & find»: beim ersten Versuch richtig (true) oder daneben.
  function erkannt(id, ok) {
    if (!wortVon(id)) return;
    schreibe((s) => {
      const w = s.woerter[id] || wortSauber(null);
      const e = ok ? [...new Set([...w.e, heute()])].sort().slice(-6) : w.e;
      s.woerter[id] = { ...w, g: w.g || heute(), n: w.n + (ok ? 1 : 0), e, f: w.f + (ok ? 0 : 1) };
      return s;
    });
  }
  function wortStand(id, s = stand()) {
    const w = s.woerter[id];
    if (!w || !w.g) return "zu";
    if (w.e.length >= 2) return "sicher";
    if (w.e.length) return "erkannt";
    return "gehoert";
  }

  // Wie weit eine Welt ist.
  function welt(id, s = stand()) {
    const w = weltVon(id);
    if (!w) return null;
    const ids = w.woerter.map((x) => x.id);
    const zaehle = (fn) => ids.filter((x) => fn(wortStand(x, s))).length;
    const gehoertN = zaehle((st) => st !== "zu");
    const erkanntN = zaehle((st) => st === "erkannt" || st === "sicher");
    const sicherN = zaehle((st) => st === "sicher");
    return {
      id, titel: w.titel, von: ids.length, gehoert: gehoertN, erkannt: erkanntN, sicher: sicherN,
      anteil: ids.length ? erkanntN / ids.length : 0, voll: erkanntN === ids.length, gold: sicherN === ids.length,
    };
  }
  const aufnaeher = (s = stand()) => welten().map((w) => welt(w.id, s));

  // Wörter für eine Runde «Hear & find» in einer Welt: zuerst, was gehört,
  // aber noch nicht sicher ist – das am längsten nicht erkannte vorn –, dann
  // der Rest. Nie ein Wort, das noch nie zu hören war, solange es genug
  // gehörte gibt.
  function hearfindWoerter(weltId, n = 5, s = stand()) {
    const w = weltVon(weltId);
    if (!w) return [];
    const mische = (liste) => liste.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const ids = w.woerter.map((x) => x.id);
    const letzter = (id) => s.woerter[id]?.e?.slice(-1)[0] || "";
    const gehoertNichtSicher = mische(ids.filter((id) => ["gehoert", "erkannt"].includes(wortStand(id, s)))).sort((a, b) => letzter(a).localeCompare(letzter(b)));
    const sicher = mische(ids.filter((id) => wortStand(id, s) === "sicher"));
    const neu = mische(ids.filter((id) => wortStand(id, s) === "zu"));
    return [...gehoertNichtSicher, ...sicher, ...neu].slice(0, n);
  }

  // ---------------------------------------------------------------------------
  // Runden und Einrichtung
  // ---------------------------------------------------------------------------
  function runde(art) {
    schreibe((s) => { s.runden[art] = (s.runden[art] || 0) + 1; return s; });
  }
  function geschichteGehoert(id) {
    schreibe((s) => { s.geschichten[id] = (s.geschichten[id] || 0) + 1; s.runden.geschichte = (s.runden.geschichte || 0) + 1; return s; });
  }
  // Ein Buch aus dem Lesewagen, auf Englisch bis zum Schluss gehört.
  function buchGehoert(id) {
    schreibe((s) => { s.geschichten[id] = (s.geschichten[id] || 0) + 1; s.runden.buch = (s.runden.buch || 0) + 1; return s; });
  }
  const runden = (s = stand()) => Object.values(s.runden).reduce((summe, n) => summe + zahl(n), 0);
  function wagenStufe(s = stand()) {
    const n = runden(sauber(s));
    return WAGEN_SCHRITTE.filter((ab) => n >= ab).length;
  }

  // ---------------------------------------------------------------------------
  // Was Rocco vorschlägt
  // ---------------------------------------------------------------------------
  // Erst entdecken, dann suchen, dann hören: In der ersten Welt, die noch nicht
  // ganz gehört ist, entdecken; ist eine Welt gehört, aber nicht erkannt,
  // «Hear & find» dort; sonst eine Geschichte, die noch nie zu Ende gehört
  // wurde; sonst Wörter festigen, die erkannt, aber noch nicht sicher sind.
  function vorschlag(s = stand()) {
    const alle = aufnaeher(s);
    const genug = (w) => w.gehoert >= Math.min(5, w.von);
    // Genug gehört, aber noch nicht alles erkannt: suchen.
    const zuSuchen = alle.find((w) => genug(w) && !w.voll);
    if (zuSuchen) return { art: "hearfind", welt: zuSuchen.id };
    // Eine Geschichte aus einer Welt, die das Kind kennt, noch nie zu Ende gehört.
    const geschichte = inhalt().GESCHICHTEN.find((g) => !s.geschichten[g.id] && genug(alle.find((w) => w.id === g.welt) || { gehoert: 0, von: 1 }));
    if (geschichte) return { art: "geschichte", geschichte: geschichte.id };
    // Eine Welt, in der noch etwas zu entdecken ist.
    const offen = alle.find((w) => w.gehoert < w.von);
    if (offen) return { art: "entdecken", welt: offen.id };
    // Alles entdeckt: festigen, was noch nicht sitzt.
    const festigen = alle.find((w) => !w.gold);
    if (festigen) return { art: "hearfind", welt: festigen.id };
    const g = inhalt().GESCHICHTEN;
    return g.length ? { art: "geschichte", geschichte: g[Math.floor(Math.random() * g.length)].id } : { art: "entdecken", welt: "farm" };
  }

  // ---------------------------------------------------------------------------
  // Einstellungen der Eltern
  // ---------------------------------------------------------------------------
  function elternSauber(roh) {
    const e = roh && typeof roh === "object" ? roh : {};
    return { schrift: SCHRIFTEN.includes(e.schrift) ? e.schrift : "auto", tempo: e.tempo === "langsam" ? "langsam" : "normal", at: zahl(e.at) };
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
  document.addEventListener("lernapp:game-state", (event) => {
    const alle = event.detail;
    if (alle && alle[ELTERN_KEY] && elternUebernehmen(alle[ELTERN_KEY])) {
      document.dispatchEvent(new CustomEvent("lernapp:englisch-einstellungen", { detail: elternLokal() }));
    }
  });
  try { elternUebernehmen(window.LernappFirebase?.getGameState?.(ELTERN_KEY)); } catch { /* ohne Konto */ }
  // Stehen die englischen Wörter geschrieben da? «Automatisch» heisst: für
  // Kinder auf der Stufe «schwer» (sie lesen schon), sonst nicht.
  function schriftZeigen() {
    const e = elternLokal();
    if (e.schrift === "an") return true;
    if (e.schrift === "aus") return false;
    try { return window.LernappReise?.stufe?.() === "schwer"; } catch { return false; }
  }

  // ---------------------------------------------------------------------------
  // Der Bericht für die Eltern (firebase.js, Karte «Englischecke»)
  // ---------------------------------------------------------------------------
  // Wörter, die im amerikanischen Englisch anders heissen als im britischen
  // Schulenglisch («Young World»).
  const US_UK = [
    ["mom", "mum"], ["cookie", "biscuit"], ["candy", "sweets"], ["pants", "trousers"], ["sweater", "jumper"],
    ["sneakers", "trainers"], ["eraser", "rubber"], ["truck", "lorry"], ["fries", "chips"], ["fall", "autumn"],
  ];
  function bericht(roh) {
    const s = sauber(roh);
    const ws = aufnaeher(s);
    const englisch = (id) => wortVon(id)?.en?.replace(/[.!?]$/, "") || id;
    const alleIds = welten().flatMap((w) => w.woerter.map((x) => x.id));
    const nach = (st) => alleIds.filter((id) => wortStand(id, s) === st).map(englisch);
    const titelVon = (id) => (inhalt().GESCHICHTEN.find((g) => g.id === id) || (inhalt().BUECHER || []).find((b) => b.id === id))?.titel?.[0]?.replace(/\.$/, "");
    const lieblinge = Object.entries(s.geschichten).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => titelVon(id)).filter(Boolean);
    const zaehle = (liste) => ({ gehoert: liste.filter((x) => wortStand(x.id, s) !== "zu").length, erkannt: liste.filter((x) => ["erkannt", "sicher"].includes(wortStand(x.id, s))).length, von: liste.length });
    return {
      runden: runden(s),
      einrichtung: wagenStufe(s),
      welten: ws.map((w) => ({ id: w.id, titel: w.titel, gehoert: w.gehoert, erkannt: w.erkannt, sicher: w.sicher, von: w.von, voll: w.voll, gold: w.gold })),
      gehoert: alleIds.filter((id) => wortStand(id, s) !== "zu").length,
      von: alleIds.length,
      sitzt: nach("sicher"),
      wackelig: alleIds.filter((id) => wortStand(id, s) === "erkannt" || (wortStand(id, s) === "gehoert" && s.woerter[id]?.f)).map(englisch),
      lieblinge,
      usUk: US_UK.filter(([us]) => alleIds.includes(us)).map(([us, uk]) => `${us} (britisch: ${uk})`),
      farben: zaehle(inhalt().FARBEN || []),
      zahlen: zaehle(inhalt().ZAHLEN || []),
      spiele: Object.fromEntries(Object.entries(s.runden).filter(([, n]) => n > 0)),
    };
  }

  window.LernappEnglischStand = {
    KEY, ELTERN_KEY, EMPTY, WAGEN_SCHRITTE, SCHRIFTEN,
    stand, merge, heute, wortVon, weltVon, gehoert, erkannt, wortStand, welt, aufnaeher, hearfindWoerter,
    runde, geschichteGehoert, buchGehoert, runden, wagenStufe, vorschlag,
    eltern: elternLokal, schriftZeigen, bericht,
    onChange: (fn) => box.onChange?.(fn),
  };
})();
