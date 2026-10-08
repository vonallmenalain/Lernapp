/*
 * bau-stand.js – Der Stand der Bauecke: Häuser, Stockwerke, Dinge, Tiere.
 * ---------------------------------------------------------------------------
 * Ein Kasten von game-cloud.js (lernapp.bau): zuerst auf dem Gerät, angemeldet
 * auch in der Cloud. Er überlebt "Fortschritt zurücksetzen" (keepOnReset):
 * Häuser und Ziegel gehen nicht verloren.
 *
 *   {
 *     v: 1,
 *     gewaehlt: "spital",            // mit welchem Haus das Kind begonnen hat
 *     haeuser: {
 *       wohnhaus: {
 *         fassade: "pfirsich", dach: "rot", at,
 *         stock: [                    // von unten nach oben, [0] ist das Erdgeschoss
 *           { id, raum: "kueche",     // "" ist der Rohbau: noch keine Zimmerart
 *             wand: "mint", muster: "kacheln", boden: "plaettli", bodenFarbe: "",
 *             licht: 1,
 *             dinge: [{ k, i: "kochherd", x, y, c: "", f: 0, s: 1 }],
 *             tier: { a: "fox", n: "Fino", seed, seit, w: [5], g: [2], b: [1], wAt, neu },
 *             tierWeg: 0,             // wann das letzte Tier hinausgeschickt wurde
 *             at },                   // zuletzt geändert – beim Zusammenführen gewinnt das neuere
 *         ],
 *       },
 *       …
 *     },
 *   }
 *
 * Ziegel zählt dieser Kasten nicht. Die verdienten Paletten stehen in
 * journey-plan.js (lernapp.bau.lieferung, je Gerät gezählt); verbaut ist jedes
 * Stockwerk über dem ersten. Was übrig ist, ist die Differenz – so kann beim
 * Zusammenführen zweier Geräte nichts doppelt zählen.
 *
 * Die Wünsche stehen nur als Liste im Tier ("ding:bett", "farbe:blau",
 * "raum:bad", "fremd:zentrum:spielplatz"). Ob sie erfüllt sind, wird jedes Mal
 * aus dem Haus ausgerechnet: Was das Kind wegräumt, ist auch nicht mehr erfüllt,
 * und nichts kann auseinanderlaufen.
 */
(() => {
  "use strict";

  const KEY = "lernapp.bau";
  const GEZEIGT_KEY = "lernapp.bau.gezeigt";
  const K = () => window.LernappBauKatalog;
  const M = () => window.LernappBauMoebel;
  const reise = () => window.LernappReise || null;
  const schranke = () => window.LernappEntitlement || null;

  // --- Das Zimmer, in Zimmer-Einheiten ----------------------------------------
  // Breit wie ein Bildschirm im Querformat. Die Wand reicht bis WAND_UNTEN,
  // darunter liegt der Boden; was steht, steht zwischen STAND_HINTEN und
  // STAND_VORNE (weiter vorn heisst weiter unten im Bild und davor gezeichnet).
  const GEO = {
    W: 560,
    H: 240,
    WAND_UNTEN: 216,
    STAND_HINTEN: 224,
    STAND_VORNE: 236,
    STAND: 230,
  };

  const STOCK_MAX = 20;             // so hoch wird ein Haus höchstens
  const STOCK_OHNE_KAUF = 4;        // ohne Kauf: bis zum vierten Stockwerk
  const DINGE_MAX = 40;             // so viele Dinge passen in ein Zimmer
  const TIER_KOMMT_MS = 40000;      // so bald kommt nach dem Hinausschicken ein neues
  const AUSFLUG_SLOT_MS = 15 * 60 * 1000;
  const AUSFLUG_ANTEIL = 30;        // Prozent der Zeit, die ein Tier aus dem Wohnhaus unterwegs ist
  const HAUS_IDS = ["wohnhaus", "spital", "zentrum", "buero"];

  // ---------------------------------------------------------------------------
  // Kleine Helfer
  // ---------------------------------------------------------------------------
  function clone(value) { try { return JSON.parse(JSON.stringify(value)); } catch { return value; } }
  function obj(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function zahl(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }
  function kennung(prefix = "") { return `${prefix}${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 7)}`; }

  // Ein Hash und ein kleiner Zufallsgenerator mit Startwert: Dasselbe Tier hat
  // auf jedem Gerät dieselben Wünsche, ohne dass sie einzeln gespeichert
  // werden müssten, wo sie sich ausrechnen lassen.
  function hash(text) {
    let h = 2166136261;
    const s = String(text);
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function zufall(seed) {
    let a = hash(seed) || 1;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mische(liste, rnd) {
    const out = liste.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  // Gewichtet ziehen: die vorderen Einträge einer Liste öfter.
  function ziehe(liste, anzahl, rnd) {
    const rest = liste.slice();
    const out = [];
    while (out.length < anzahl && rest.length) {
      const gewichte = rest.map((_, i) => rest.length - i);
      let r = rnd() * gewichte.reduce((a, b) => a + b, 0);
      let index = 0;
      while (index < rest.length - 1 && r >= gewichte[index]) { r -= gewichte[index]; index += 1; }
      out.push(rest.splice(index, 1)[0]);
    }
    return out;
  }
  // Der Kalendertag (lokal) – für "frühestens am nächsten Tag".
  function tag(ms) {
    const d = new Date(Number(ms) || 0);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  const gross = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : "");

  // ---------------------------------------------------------------------------
  // Leerer Stand und Aufräumen
  // ---------------------------------------------------------------------------
  function rohbau(at = 0) {
    return { id: kennung("s"), raum: "", wand: "creme", muster: "keine", boden: "parkett", bodenFarbe: "", licht: 1, dinge: [], tier: null, tierWeg: 0, tierWegArt: "", at };
  }

  function leererStand() {
    const haeuser = {};
    HAUS_IDS.forEach((id) => {
      const haus = K()?.HAUS?.[id] || {};
      haeuser[id] = { fassade: haus.fassade || "weiss", dach: haus.dach || "rot", at: 0, stock: [{ ...rohbau(0), id: `${id}-0` }] };
    });
    return { v: 1, gewaehlt: "", haeuser };
  }

  function sauberesDing(roh) {
    const d = obj(roh);
    const ding = M()?.DINGE?.[d.i];
    if (!ding) return null;
    const farbe = typeof d.c === "string" && K()?.FARBE?.[d.c] ? d.c : "";
    const s = zahl(d.s, 0.6, 1.6, 1);
    let x = zahl(d.x, 0, GEO.W, GEO.W / 2);
    let y = zahl(d.y, 0, GEO.H, GEO.STAND);
    if (ding.art === "decke") y = 0;
    if (ding.art === "flach") y = zahl(d.y, GEO.STAND_HINTEN, GEO.STAND_VORNE, GEO.STAND);
    x = Math.round(x * 10) / 10;
    y = Math.round(y * 10) / 10;
    return { k: typeof d.k === "string" && d.k ? d.k.slice(0, 16) : kennung("d"), i: d.i, x, y, c: farbe, f: d.f ? 1 : 0, s: Math.round(s * 100) / 100 };
  }

  function sauberesTier(roh) {
    const t = obj(roh);
    if (!K()?.TIERE?.[t.a]) return null;
    const liste = (wert) => (Array.isArray(wert) ? wert.filter((w) => typeof w === "string").slice(0, 8) : []);
    return {
      a: t.a,
      n: typeof t.n === "string" && t.n ? t.n.slice(0, 24) : K().TIERE[t.a].namen[0],
      seed: typeof t.seed === "string" && t.seed ? t.seed.slice(0, 24) : kennung("t"),
      seit: Number(t.seit) || 0,
      w: liste(t.w),
      g: liste(t.g),
      b: liste(t.b),
      wAt: Number(t.wAt) || 0,
      neu: Number.isInteger(t.neu) ? t.neu : -1,
    };
  }

  function sauberesStockwerk(roh, hausId, index) {
    const s = obj(roh);
    const raum = K()?.RAEUME?.[s.raum];
    const passt = raum && raum.haus === hausId;
    const farben = K()?.FARBE || {};
    const dinge = (Array.isArray(s.dinge) ? s.dinge : []).map(sauberesDing).filter(Boolean).slice(0, DINGE_MAX);
    // Eine Kennung je Ding, auch nach dem Zusammenführen zweier Stände.
    const gesehen = new Set();
    dinge.forEach((ding) => { if (gesehen.has(ding.k)) ding.k = kennung("d"); gesehen.add(ding.k); });
    return {
      id: typeof s.id === "string" && s.id ? s.id.slice(0, 24) : `${hausId}-${index}`,
      raum: passt ? s.raum : "",
      wand: farben[s.wand] ? s.wand : (passt ? raum.wand : "creme"),
      muster: K()?.MUSTER?.some((m) => m.id === s.muster) ? s.muster : (passt ? raum.muster : "keine"),
      boden: K()?.BODEN?.[s.boden] ? s.boden : (passt ? raum.boden : "parkett"),
      bodenFarbe: farben[s.bodenFarbe] ? s.bodenFarbe : "",
      licht: s.licht === 0 ? 0 : 1,
      dinge,
      tier: passt ? sauberesTier(s.tier) : null,
      tierWeg: Number(s.tierWeg) || 0,
      tierWegArt: K()?.TIERE?.[s.tierWegArt] ? s.tierWegArt : "",
      at: Number(s.at) || 0,
    };
  }

  function normalize(roh) {
    const leer = leererStand();
    const r = obj(roh);
    const out = { v: 1, gewaehlt: HAUS_IDS.includes(r.gewaehlt) ? r.gewaehlt : "", haeuser: {} };
    HAUS_IDS.forEach((id) => {
      const h = obj(obj(r.haeuser)[id]);
      const farben = K()?.FARBE || {};
      const stock = (Array.isArray(h.stock) ? h.stock : []).slice(0, STOCK_MAX).map((s, i) => sauberesStockwerk(s, id, i));
      out.haeuser[id] = {
        fassade: farben[h.fassade] ? h.fassade : leer.haeuser[id].fassade,
        dach: farben[h.dach] ? h.dach : leer.haeuser[id].dach,
        at: Number(h.at) || 0,
        stock: stock.length ? stock : leer.haeuser[id].stock,
      };
    });
    return out;
  }

  // ---------------------------------------------------------------------------
  // Zusammenführen
  // ---------------------------------------------------------------------------
  // Je Stockwerk gewinnt, was zuletzt geändert wurde; bei gleicher Zeit
  // entscheidet der Text, damit beide Richtungen dasselbe ergeben. Ein Haus ist
  // so hoch wie das höhere der beiden.
  function neuer(a, b) {
    const ta = Number(a?.at) || 0;
    const tb = Number(b?.at) || 0;
    if (ta !== tb) return ta > tb ? a : b;
    return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
  }

  function merge(a, b) {
    const A = normalize(a);
    const B = normalize(b);
    const out = { v: 1, gewaehlt: A.gewaehlt || B.gewaehlt, haeuser: {} };
    if (A.gewaehlt && B.gewaehlt && A.gewaehlt !== B.gewaehlt) out.gewaehlt = A.gewaehlt < B.gewaehlt ? A.gewaehlt : B.gewaehlt;
    HAUS_IDS.forEach((id) => {
      const ha = A.haeuser[id];
      const hb = B.haeuser[id];
      const kopf = neuer({ at: ha.at, fassade: ha.fassade, dach: ha.dach }, { at: hb.at, fassade: hb.fassade, dach: hb.dach });
      const laenge = Math.max(ha.stock.length, hb.stock.length);
      const stock = [];
      for (let i = 0; i < laenge; i += 1) {
        const sa = ha.stock[i];
        const sb = hb.stock[i];
        stock.push(clone(sa && sb ? neuer(sa, sb) : sa || sb));
      }
      out.haeuser[id] = { fassade: kopf.fassade, dach: kopf.dach, at: kopf.at, stock };
    });
    return out;
  }

  // ---------------------------------------------------------------------------
  // Der Kasten
  // ---------------------------------------------------------------------------
  const cloudGames = window.LernappGameCloud;
  const store = cloudGames
    ? cloudGames.register({ key: KEY, empty: leererStand(), merge, keepOnReset: true })
    : {
      read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } },
      write(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* privater Modus */ } return data; },
      onChange() { return () => {}; },
    };

  let stand = normalize(store.read());
  const zuhoerer = new Set();
  function melde(grund) { zuhoerer.forEach((fn) => { try { fn(grund); } catch { /* ein Zuhörer hält die anderen nicht auf */ } }); }

  // Was aus der Cloud kommt, wird mit dem eigenen Stand zusammengeführt – nicht
  // übernommen: Eine Änderung, die hier noch auf das Speichern wartet, ist
  // neuer und gewinnt.
  store.onChange((neu) => {
    const vorher = JSON.stringify(stand);
    stand = merge(stand, neu);
    if (JSON.stringify(stand) !== vorher) melde("cloud");
  });
  // Neue verdiente Ziegel (ein Rätsel auf einem anderen Gerät).
  reise()?.onBauLieferung?.(() => melde("ziegel"));

  // Gespeichert wird gebündelt: Ein Kind schiebt ein Sofa zehnmal hin und her,
  // und jedes Mal den ganzen Kasten in die Cloud zu schicken, wäre zu viel.
  let speicherUhr = 0;
  function speichern(sofort = false) {
    if (speicherUhr) { window.clearTimeout(speicherUhr); speicherUhr = 0; }
    const jetzt = () => { speicherUhr = 0; store.write(clone(stand)); };
    if (sofort) jetzt();
    else speicherUhr = window.setTimeout(jetzt, 1200);
  }
  window.addEventListener("pagehide", () => { if (speicherUhr) speichern(true); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && speicherUhr) speichern(true); });

  // Jede Änderung an einem Stockwerk läuft hier durch: sie stempelt die Zeit
  // (fürs Zusammenführen), speichert und meldet sich.
  function aendereStock(hausId, index, fn, grund = "zimmer") {
    const s = stock(hausId, index);
    if (!s) return null;
    const ergebnis = fn(s);
    s.at = Date.now();
    speichern();
    melde(grund);
    return ergebnis;
  }

  function aendereHaus(hausId, fn, grund = "haus") {
    const h = stand.haeuser[hausId];
    if (!h) return;
    fn(h);
    h.at = Date.now();
    speichern();
    melde(grund);
  }

  // ---------------------------------------------------------------------------
  // Lesen
  // ---------------------------------------------------------------------------
  function lesen() { return stand; }
  function haus(id) { return stand.haeuser[id] || null; }
  function stock(hausId, index) { return stand.haeuser[hausId]?.stock?.[index] || null; }
  function raumVon(hausId, index) { return K()?.RAEUME?.[stock(hausId, index)?.raum] || null; }

  // ---------------------------------------------------------------------------
  // Ziegel
  // ---------------------------------------------------------------------------
  function verdient() { return Number(reise()?.bauPaletten?.()) || 0; }
  function verbaut() { return HAUS_IDS.reduce((summe, id) => summe + Math.max(0, (stand.haeuser[id]?.stock?.length || 1) - 1), 0); }
  function paletten() { return Math.max(0, verdient() - verbaut()); }

  // Was die Lieferung schon gezeigt hat (nur dieses Gerät).
  function gezeigt() {
    try { return Math.max(0, Number(localStorage.getItem(GEZEIGT_KEY)) || 0); } catch { return 0; }
  }
  function merkeGezeigt(n = verdient()) {
    try { localStorage.setItem(GEZEIGT_KEY, String(Math.max(0, Math.floor(n)))); } catch { /* privater Modus */ }
  }
  function neueLieferung() { return Math.max(0, verdient() - gezeigt()); }

  // ---------------------------------------------------------------------------
  // Bauen
  // ---------------------------------------------------------------------------
  function frei() { return Boolean(schranke()?.isFree?.()) || !schranke(); }

  // Darf hier noch ein Stockwerk hin? Antwort mit Grund, damit die Ansicht das
  // Richtige zeigt: Ziegel holen, die Schranke, oder "das Haus ist fertig".
  function kannBauen(hausId) {
    const h = haus(hausId);
    if (!h) return { ok: false, grund: "fehlt" };
    if (h.stock.length >= STOCK_MAX) return { ok: false, grund: "voll" };
    if (h.stock.length >= STOCK_OHNE_KAUF && !frei()) return { ok: false, grund: "schranke" };
    if (paletten() < 1) return { ok: false, grund: "ziegel" };
    return { ok: true, grund: "" };
  }

  function baueStockwerk(hausId) {
    if (!kannBauen(hausId).ok) return -1;
    const h = haus(hausId);
    const neu = rohbau(Date.now());
    h.stock.push(neu);
    h.at = Date.now();
    speichern(true);
    melde("gebaut");
    return h.stock.length - 1;
  }

  // ---------------------------------------------------------------------------
  // Zimmer
  // ---------------------------------------------------------------------------
  // Die Zimmerart wählen. Im Rohbau bekommt das Zimmer die Farben seiner Art,
  // und ein Tier zieht ein. Wird die Art später geändert, bleibt alles stehen,
  // und das Tier bekommt neue Wünsche, die zur neuen Art passen.
  function waehleRaum(hausId, index, raumId) {
    const raum = K()?.RAEUME?.[raumId];
    if (!raum || raum.haus !== hausId) return false;
    aendereStock(hausId, index, (s) => {
      const warRohbau = !s.raum;
      s.raum = raumId;
      if (warRohbau) {
        s.wand = raum.wand;
        s.muster = raum.muster || "keine";
        s.boden = raum.boden || "parkett";
        s.bodenFarbe = "";
      }
      if (s.tier) {
        Object.assign(s.tier, wuenscheFuer(s.tier, hausId, raumId));
        s.tier.wAt = Date.now();
        s.tier.neu = -1;
      } else {
        s.tier = neuesTier(hausId, index);
        s.tierWeg = 0;
      }
    }, "raum");
    return true;
  }

  function setzeGewaehlt(hausId) {
    if (!HAUS_IDS.includes(hausId)) return;
    stand.gewaehlt = hausId;
    speichern();
    melde("gewaehlt");
  }

  // ---------------------------------------------------------------------------
  // Tiere
  // ---------------------------------------------------------------------------
  function alleTiere() {
    const liste = [];
    HAUS_IDS.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      if (s.tier) liste.push({ hausId, index, tier: s.tier });
    }));
    return liste;
  }

  // Ein neues Tier: möglichst eine Art, die im Haus noch fehlt, und ein Name,
  // den noch keines trägt.
  function neuesTier(hausId, index, { ausser = [] } = {}) {
    const katalog = K();
    const imHaus = new Set(stand.haeuser[hausId].stock.map((s) => s.tier?.a).filter(Boolean));
    const alle = alleTiere();
    const ueberall = new Set(alle.map((eintrag) => eintrag.tier.a));
    const namen = new Set(alle.map((eintrag) => eintrag.tier.n));
    let arten = katalog.TIER_IDS.filter((a) => !ausser.includes(a) && !imHaus.has(a));
    const ganzNeu = arten.filter((a) => !ueberall.has(a));
    if (ganzNeu.length) arten = ganzNeu;
    if (!arten.length) arten = katalog.TIER_IDS.filter((a) => !ausser.includes(a));
    if (!arten.length) arten = katalog.TIER_IDS.slice();
    const art = arten[Math.floor(Math.random() * arten.length)];
    const freieNamen = katalog.TIERE[art].namen.filter((n) => !namen.has(n));
    const name = (freieNamen.length ? freieNamen : katalog.TIERE[art].namen)[Math.floor(Math.random() * (freieNamen.length || katalog.TIERE[art].namen.length))];
    const tier = { a: art, n: name, seed: kennung("t"), seit: Date.now(), w: [], g: [], b: [], wAt: Date.now(), neu: -1 };
    const raumId = stock(hausId, index)?.raum;
    Object.assign(tier, wuenscheFuer(tier, hausId, raumId));
    return tier;
  }

  // Die Wünsche eines Tiers in einem Zimmer: fünf gelbe (eines davon das, was
  // diese Tierart besonders mag), zwei grüne, ein blauer.
  function wuenscheFuer(tier, hausId, raumId) {
    const katalog = K();
    const raum = katalog.RAEUME[raumId];
    if (!raum) return { w: [], g: [], b: [] };
    const rnd = zufall(`${tier.seed}:${raumId}`);
    const art = katalog.TIERE[tier.a];
    const lieblings = rnd() < 0.5 ? `ding:${art.mag.ding}` : `farbe:${art.mag.farbe}`;
    const gelb = [lieblings];
    mische(raum.wuensche, rnd).forEach((tagId) => {
      const w = `ding:${tagId}`;
      if (gelb.length < 5 && !gelb.includes(w)) gelb.push(w);
    });
    const gruen = ziehe(katalog.HAUS_WUENSCHE[hausId].filter((r) => r !== raumId), 2, rnd).map((r) => `raum:${r}`);
    const blau = ziehe(katalog.FREMD_WUENSCHE[hausId], 1, rnd).map((f) => `fremd:${f.haus}:${f.raum}`);
    return { w: gelb, g: gruen, b: blau };
  }

  function hinausschicken(hausId, index) {
    let art = "";
    aendereStock(hausId, index, (s) => {
      art = s.tier?.a || "";
      s.tier = null;
      s.tierWeg = Date.now();
      s.tierWegArt = art;
    }, "tier");
    return art;
  }

  // ---------------------------------------------------------------------------
  // Wünsche auswerten
  // ---------------------------------------------------------------------------
  function hatDing(s, tagId) {
    const dinge = M()?.DINGE || {};
    return s.dinge.some((d) => dinge[d.i]?.tags?.includes(tagId));
  }

  function erfuellt(hausId, index, wunsch) {
    const s = stock(hausId, index);
    if (!s) return false;
    const [typ, a, b] = String(wunsch).split(":");
    if (typ === "ding") return hatDing(s, a);
    if (typ === "farbe") return K()?.FARBE?.[s.wand]?.familie === a;
    if (typ === "raum") return stand.haeuser[hausId].stock.some((anders, i) => i !== index && anders.raum === a);
    if (typ === "fremd") return Boolean(stand.haeuser[a]?.stock?.some((anders) => anders.raum === b));
    return false;
  }

  // Wie ein Wunsch heisst, und was "Zeig mir" tun soll.
  function beschreibe(hausId, wunsch) {
    const katalog = K();
    const [typ, a, b] = String(wunsch).split(":");
    if (typ === "ding") {
      const info = katalog.DING_WUENSCHE[a] || { ein: a, zeige: "" };
      return { typ, text: `Ich hätte gerne ${info.ein}.`, kurz: gross(info.ein.replace(/^(ein|eine|einen) /, "")), zeige: info.zeige, tag: a };
    }
    if (typ === "farbe") {
      const fam = katalog.FAMILIEN[a] || { name: a, wort: a, zeige: a };
      return { typ, text: `Ich mag ${fam.name}. Malst du die Wand ${fam.wort} an?`, kurz: `Wand ${fam.wort}`, farbe: fam.zeige, familie: a };
    }
    if (typ === "raum") {
      const raum = katalog.RAEUME[a];
      return { typ, text: `${gross(katalog.HAUS[hausId].im)} wünsche ich mir ${raum?.ein || a}.`, kurz: raum?.name || a, haus: hausId, raum: a, icon: raum?.icon };
    }
    if (typ === "fremd") {
      const raum = katalog.RAEUME[b];
      const warum = (katalog.FREMD_WUENSCHE[hausId] || []).find((f) => f.haus === a && f.raum === b)?.warum || "";
      return { typ, text: `${gross(katalog.HAUS[a]?.im || "")} wünsche ich mir ${raum?.ein || b}. ${warum}`.trim(), kurz: `${raum?.name || b} (${katalog.HAUS[a]?.name || a})`, haus: a, raum: b, icon: raum?.icon };
    }
    return { typ: "", text: "", kurz: "" };
  }

  // Alle Wünsche eines Stockwerks, mit Stern-Farbe und ob sie erfüllt sind.
  function wuensche(hausId, index) {
    const s = stock(hausId, index);
    if (!s?.tier) return [];
    const liste = [];
    s.tier.w.forEach((w, i) => liste.push({ id: w, stern: "gelb", neu: s.tier.neu === i, ...beschreibe(hausId, w), erfuellt: erfuellt(hausId, index, w) }));
    s.tier.g.forEach((w) => liste.push({ id: w, stern: "gruen", ...beschreibe(hausId, w), erfuellt: erfuellt(hausId, index, w) }));
    s.tier.b.forEach((w) => liste.push({ id: w, stern: "blau", ...beschreibe(hausId, w), erfuellt: erfuellt(hausId, index, w) }));
    return liste;
  }

  function sterne(hausId, index) {
    const liste = wuensche(hausId, index);
    const zaehle = (farbe) => liste.filter((w) => w.stern === farbe);
    const gelb = zaehle("gelb");
    const gruen = zaehle("gruen");
    const blau = zaehle("blau");
    return {
      gelb: gelb.map((w) => w.erfuellt),
      gruen: gruen.map((w) => w.erfuellt),
      blau: blau.map((w) => w.erfuellt),
      anzahl: liste.filter((w) => w.erfuellt).length,
      total: liste.length,
    };
  }

  // Wie zufrieden ein Tier ist. Nie traurig: Wünsche dürfen offen bleiben, es
  // gibt nur weniger Sterne (Entscheid 6).
  function laune(hausId, index) {
    const s = stock(hausId, index);
    const st = sterne(hausId, index);
    const name = s?.tier?.n || "";
    if (!s?.tier) return { stufe: 0, emoji: "", text: "" };
    const anteil = st.total ? st.anzahl / st.total : 0;
    if (st.total && st.anzahl === st.total) return { stufe: 3, emoji: "🤩", text: `${name} ist überglücklich!` };
    if (anteil >= 0.6) return { stufe: 2, emoji: "😊", text: `${name} fühlt sich wohl.` };
    if (anteil >= 0.3) return { stufe: 1, emoji: "🙂", text: `${name} ist zufrieden.` };
    return { stufe: 0, emoji: "😐", text: `${name} findet es noch ein bisschen leer.` };
  }

  // Der Stand eines Hauses für das Startbild und den Umschalter.
  function fortschritt() {
    return HAUS_IDS.map((id) => {
      const h = stand.haeuser[id];
      let anzahl = 0;
      let total = 0;
      let bewohnt = 0;
      h.stock.forEach((s, index) => {
        if (!s.tier) return;
        bewohnt += 1;
        const st = sterne(id, index);
        anzahl += st.anzahl;
        total += st.total;
      });
      return { id, stockwerke: h.stock.length, eingerichtet: h.stock.filter((s) => s.raum).length, bewohnt, sterne: anzahl, maxSterne: total, fassade: h.fassade, dach: h.dach };
    });
  }

  // ---------------------------------------------------------------------------
  // Unterwegs: Tiere aus dem Wohnhaus bei der Arbeit oder auf einem Ausflug
  // ---------------------------------------------------------------------------
  // In Viertelstunden gerechnet, für alle Geräte gleich: Ist ein Tier in dieser
  // Viertelstunde unterwegs, und wohin? Ziele sind Zimmer in den anderen
  // Häusern, in denen man arbeitet (arbeit) oder die Freizeit verbringt
  // (ausflug) – am liebsten das, das es sich selbst gewünscht hat.
  function aufenthalt(hausId, index, jetzt = Date.now()) {
    if (hausId !== "wohnhaus") return null;
    const s = stock(hausId, index);
    if (!s?.tier) return null;
    const slot = Math.floor(jetzt / AUSFLUG_SLOT_MS);
    if (hash(`${s.tier.seed}:${slot}`) % 100 >= AUSFLUG_ANTEIL) return null;
    const ziele = [];
    const blau = s.tier.b.map((w) => w.split(":")).filter((teile) => teile[0] === "fremd");
    ["spital", "zentrum", "buero"].forEach((zielHaus) => {
      stand.haeuser[zielHaus].stock.forEach((ziel, zielIndex) => {
        const raum = K()?.RAEUME?.[ziel.raum];
        if (!raum || !(raum.arbeit || raum.ausflug)) return;
        const gewuenscht = blau.some((teile) => teile[1] === zielHaus && teile[2] === ziel.raum);
        const grund = gewuenscht || (raum.ausflug && !raum.arbeit) ? "ausflug" : "arbeit";
        const gewicht = gewuenscht ? 4 : 1;
        for (let i = 0; i < gewicht; i += 1) ziele.push({ haus: zielHaus, index: zielIndex, grund });
      });
    });
    if (!ziele.length) return null;
    return ziele[hash(`${s.tier.seed}:${slot}:ziel`) % ziele.length];
  }

  // Wer gerade zu Besuch in diesem Stockwerk ist.
  function besucher(hausId, index, jetzt = Date.now()) {
    if (hausId === "wohnhaus") return [];
    const liste = [];
    stand.haeuser.wohnhaus.stock.forEach((s, i) => {
      const wo = aufenthalt("wohnhaus", i, jetzt);
      if (wo && wo.haus === hausId && wo.index === index) liste.push({ haus: "wohnhaus", index: i, tier: s.tier, grund: wo.grund });
    });
    return liste;
  }

  // Wo ein Zimmer im Satz steht: "in der Radiologie", "im Notfall".
  function imRaum(raumId) {
    const raum = K()?.RAEUME?.[raumId];
    if (!raum) return "";
    if (raumId === "toiletten") return "in den Toiletten";
    const [artikel, ...rest] = raum.der.split(" ");
    const name = rest.join(" ");
    return artikel === "die" ? `in der ${name}` : `im ${name}`;
  }

  // ---------------------------------------------------------------------------
  // Was die Zeit tut: neue Tiere kommen, Wünsche ändern sich
  // ---------------------------------------------------------------------------
  // Läuft, solange die Bauecke offen ist (train-bau.js). Zurück kommt, was
  // passiert ist, damit die Ansicht es zeigen kann.
  function tick(jetzt = Date.now()) {
    const ereignisse = [];
    HAUS_IDS.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      if (!s.raum) return;
      // Ein neues Tier, wenn das alte hinausgeschickt wurde – bald danach.
      if (!s.tier && (!s.tierWeg || jetzt - s.tierWeg >= TIER_KOMMT_MS)) {
        const ausser = s.tierWegArt ? [s.tierWegArt] : [];
        aendereStock(hausId, index, (st) => {
          st.tier = neuesTier(hausId, index, { ausser });
          st.tierWeg = 0;
          st.tierWegArt = "";
        }, "tier");
        ereignisse.push({ typ: "eingezogen", hausId, index });
        return;
      }
      // Ein neuer Wunsch: frühestens am nächsten Kalendertag, und nur, wenn
      // alle gelben erfüllt sind. Dann fällt einer weg, und ein neuer kommt.
      if (s.tier && tag(jetzt) > tag(s.tier.wAt)) {
        const gelb = s.tier.w;
        const alleErfuellt = gelb.length && gelb.every((w) => erfuellt(hausId, index, w));
        if (!alleErfuellt) return;
        const raum = K().RAEUME[s.raum];
        const rnd = zufall(`${s.tier.seed}:${tag(jetzt)}`);
        const kandidaten = mische(raum.wuensche.map((t) => `ding:${t}`).filter((w) => !gelb.includes(w)), rnd);
        if (!kandidaten.length) return;
        // Das Lieblingsding der Art bleibt; einer der anderen geht.
        const austauschbar = gelb.map((w, i) => i).filter((i) => i > 0);
        const weg = austauschbar[Math.floor(rnd() * austauschbar.length)];
        aendereStock(hausId, index, (st) => {
          st.tier.w[weg] = kandidaten[0];
          st.tier.wAt = jetzt;
          st.tier.neu = weg;
        }, "wunsch");
        ereignisse.push({ typ: "neuerWunsch", hausId, index });
      }
    }));
    return ereignisse;
  }

  // ---------------------------------------------------------------------------
  // Plaudern
  // ---------------------------------------------------------------------------
  function waehle(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

  function antwort(hausId, index, frageId, jetzt = new Date()) {
    const katalog = K();
    const s = stock(hausId, index);
    if (!s?.tier) return "";
    const tier = s.tier;
    const art = katalog.TIERE[tier.a];
    const offen = wuensche(hausId, index).filter((w) => !w.erfuellt);
    const offenGelb = offen.filter((w) => w.stern === "gelb");
    const st = sterne(hausId, index);
    const gelbErfuellt = st.gelb.filter(Boolean).length;
    const stunde = jetzt.getHours();
    const raum = katalog.RAEUME[s.raum];
    const ohneFrage = (w) => w.text.replace(/\?$/, ".");
    switch (frageId) {
      case "hallo":
        return waehle([`Grüezi! Ich bin ${tier.n}.`, `Hoi! Schön, dass du mich besuchst.`, `Hallo! Ich bin ${tier.n}, ${art.der}.`]);
      case "geht":
        if (st.total && st.anzahl === st.total) return "Mir geht es wunderbar! Alle meine Wünsche sind erfüllt.";
        if (offen.length <= 3) return `Gut! ${ohneFrage(offen[0])}`;
        return `Es geht so. ${ohneFrage(offen[0])}`;
      case "wunsch":
        return offen.length ? offen[0].text : "Ich habe alles, was ich mir wünsche. Danke!";
      case "zimmer":
        if (gelbErfuellt >= 5) return "Ja, sehr! Mein Zimmer ist perfekt.";
        if (gelbErfuellt >= 3) {
          const naechster = offenGelb[0];
          if (naechster?.typ === "ding") return `Ja! Und ich hätte noch gerne ${katalog.DING_WUENSCHE[naechster.tag]?.ein || "etwas"}.`;
          return naechster ? `Ja! ${naechster.text}` : "Ja!";
        }
        return "Es ist noch ein bisschen leer. Hilfst du mir beim Einrichten?";
      case "hunger":
        return art.isst;
      case "erzaehl":
        return art.fakt;
      case "arbeit":
        if (hausId === "wohnhaus") {
          const wo = aufenthalt(hausId, index, jetzt.getTime());
          if (wo) return `Ich bin gerade ${imRaum(stand.haeuser[wo.haus].stock[wo.index].raum)} ${katalog.HAUS[wo.haus].im}.`;
          return `Ich wohne hier ${imRaum(s.raum)}. Manchmal gehe ich arbeiten oder einen Ausflug machen.`;
        }
        return `Ich arbeite hier ${imRaum(s.raum)}. ${raum?.text || ""}`.trim();
      case "muede":
        if (tier.a === "owl") return stunde >= 7 && stunde < 19 ? "Ein bisschen. Eulen sind in der Nacht wach – am Tag döse ich gern." : "Nein! In der Nacht bin ich hellwach.";
        if (stunde >= 19 || stunde < 7) return "Ja, gähn! Bald gehe ich schlafen.";
        if (tier.a === "lion" || tier.a === "cat") return "Ein bisschen. Ich döse so gern!";
        return "Nein, ich bin hellwach!";
      case "witz":
        return waehle(katalog.WITZE);
      case "lied":
        return waehle(katalog.LIEDER);
      case "gern":
        return waehle(["Ich dich auch! 💛", "Du bist super! 💛", "Danke! Ich bin so froh, dass ich hier wohne."]);
      default:
        return "";
    }
  }

  function onChange(fn) { zuhoerer.add(fn); return () => zuhoerer.delete(fn); }

  window.LernappBauStand = {
    KEY, GEO, STOCK_MAX, STOCK_OHNE_KAUF, DINGE_MAX, TIER_KOMMT_MS, HAUS_IDS,
    normalize, merge, leererStand,
    lesen, haus, stock, raumVon,
    verdient, verbaut, paletten, gezeigt, merkeGezeigt, neueLieferung,
    kannBauen, baueStockwerk, waehleRaum, setzeGewaehlt,
    aendereStock, aendereHaus, speichern,
    neuesTier, wuenscheFuer, hinausschicken, alleTiere,
    erfuellt, wuensche, sterne, laune, fortschritt, beschreibe,
    aufenthalt, besucher, imRaum,
    tick, antwort, onChange, kennung, hash,
  };
})();
