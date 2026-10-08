/*
 * bau-stand.js – Der Stand der Bauecke: Häuser, Stockwerke, Zimmer, Dinge, Tiere.
 * ---------------------------------------------------------------------------
 * Ein Kasten je Konto (game-cloud.js, registerProKonto): angemeldet gehört er
 * dem Kind – auf dem Gerät und in der Cloud –, und meldet sich ein anderes
 * Kind an, kommt dessen Stand; nichts mischt sich. Ohne Anmeldung gilt ein
 * eigener Gast-Stand. "Fortschritt zurücksetzen" lässt ihn stehen.
 *
 *   {
 *     v: 2,                               // FORMAT – siehe unten
 *     gewaehlt: "spital",                 // mit welchem Haus das Kind begonnen hat
 *     haeuser: {
 *       wohnhaus: {
 *         fassade: "pfirsich", dach: "rot", at,
 *         stock: [                         // von unten nach oben (nach pos)
 *           { id, seit, pos,               // Kennung, wann gebaut, Platz im Haus
 *             art: "wohnung",              // "wohnung" (nur Wohnhaus), "zwei", "" (Rohbau)
 *             zimmer: [                    // wohnung: eines; zwei: zwei; Rohbau: keines
 *               { raum: "schlafzimmer",    // "" ist noch nicht gewählt
 *                 wand, muster, boden, bodenFarbe, licht,
 *                 dinge: [{ k, i: "bett", x, y, c: "", f: 0, s: 1 }],
 *                 at } ],                  // zuletzt geändert (dieses Zimmer)
 *             tiere: [{ a: "fox", n: "Fino", seed, seit,
 *                       w: [2], g: [1], b: [2],      // die Wünsche, siehe unten
 *                       traum: "zentrum:bibliothek", // der Traumjob
 *                       wAt, neu }],
 *             zuzug,                       // ab wann das nächste Tier einziehen darf
 *             tierWegArt,                  // wer zuletzt hinausgeschickt wurde
 *             at },                        // zuletzt geändert (das Stockwerk selbst)
 *         ],
 *       },
 *       …
 *     },
 *   }
 *
 * Gewohnt wird im Wohnhaus, in den Wohnungen: Es beginnt mit drei leeren
 * Schlafzimmern; mit der Wahl (Schlafzimmer oder Kinderzimmer) zieht das
 * erste Tier ein, mit der Zeit kommen bis zu zwei weitere. Alle anderen
 * Stockwerke haben zwei Zimmer. Jedes Tier hat fünf Wünsche – zwei gelbe für
 * seine Wohnung, einen grünen für das Wohnhaus, zwei blaue für die anderen
 * Häuser – und einen Traumjob in einem Zimmer der anderen Häuser. Ob ein
 * Wunsch erfüllt ist und wo ein Tier gerade arbeitet, wird jedes Mal aus den
 * Häusern ausgerechnet: Was das Kind wegräumt, ist auch nicht mehr erfüllt.
 *
 * Ziegel zählt dieser Kasten nicht. Die verdienten Paletten stehen in
 * journey-plan.js (lernapp.bau.lieferung); verbaut ist jedes Stockwerk über
 * denen, mit denen ein Haus beginnt. Was übrig ist, ist die Differenz.
 */
(() => {
  "use strict";

  const KEY = "lernapp.bau";
  const GEZEIGT_KEY = "lernapp.bau.gezeigt";
  const K = () => window.LernappBauKatalog;
  const M = () => window.LernappBauMoebel;
  const reise = () => window.LernappReise || null;
  const schranke = () => window.LernappEntitlement || null;

  // Welche Fassung des Kastens diese App versteht. Bringt eine neuere Fassung
  // neue Dinge, Zimmer, Tiere, Farben, Muster, Böden, Häuser oder Felder,
  // zählt sie FORMAT hoch (validate-bau.mjs erinnert daran, sobald sich der
  // Katalog ändert). Eine ältere App, die so einen Kasten sieht, räumt ihn
  // nicht auf – sie würde löschen, was sie nicht kennt, und das Gelöschte in
  // die Cloud schreiben. Sie lässt ihn stehen und zeigt die Bauecke erst
  // wieder, wenn sie sich selbst erneuert hat (pwa.js lädt die neue Fassung).
  // Fassung 1 (ein Zimmer je Stockwerk, ein Tier) wird beim Lesen übertragen.
  const FORMAT = 2;

  // --- Ein Zimmer, in Zimmer-Einheiten --------------------------------------
  // Eine Wohnung ist so breit wie das Stockwerk (W), die Zimmer der anderen
  // Stockwerke halb so breit (HALB). Die Wand reicht bis WAND_UNTEN, darunter
  // liegt der Boden; was steht, steht zwischen STAND_HINTEN und STAND_VORNE
  // (weiter vorn heisst weiter unten im Bild und davor gezeichnet).
  const GEO = {
    W: 560,
    HALB: 280,
    H: 240,
    WAND_UNTEN: 216,
    STAND_HINTEN: 224,
    STAND_VORNE: 236,
    STAND: 230,
  };

  const STOCK_MAX = 20;              // so hoch wird ein Haus höchstens
  const STOCK_OHNE_KAUF = 4;         // ohne Kauf: bis zum vierten Stockwerk
  const DINGE_MAX = 40;              // so viele Dinge passen in eine Wohnung
  const DINGE_MAX_HALB = 20;         // und in ein Zimmer, halb so breit
  const TIERE_MAX = 3;               // so viele Tiere wohnen in einer Wohnung
  const ARBEIT_MAX = 3;              // so viele Tiere arbeiten im selben Zimmer
  const ZUZUG_MS = 10 * 60 * 1000;   // so lange, bis in eine Wohnung das nächste Tier zieht
  const TIER_KOMMT_MS = 40000;       // so bald kommt nach dem Hinausschicken ein neues
  const SLOT_MS = 15 * 60 * 1000;    // in Viertelstunden: wo ein Tier gerade ist
  const HAUS_IDS = ["wohnhaus", "spital", "zentrum", "buero"];
  const ARBEITS_HAEUSER = ["spital", "zentrum", "buero"];
  // Womit ein Haus beginnt: das Wohnhaus mit drei leeren Schlafzimmern, die
  // anderen mit einem Stockwerk für zwei Zimmer.
  const START = { wohnhaus: 3, spital: 1, zentrum: 1, buero: 1 };

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
  function text(value, max, fallback = "") { return typeof value === "string" && value ? value.slice(0, max) : fallback; }
  function kennung(prefix = "") { return `${prefix}${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 7)}`; }

  // Ein Hash und ein kleiner Zufallsgenerator mit Startwert: Dasselbe Tier hat
  // auf jedem Gerät dieselben Wünsche und ist zur selben Zeit am selben Ort.
  function hash(value) {
    let h = 2166136261;
    const s = String(value);
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
  const gross = (wort) => (wort ? wort.charAt(0).toUpperCase() + wort.slice(1) : "");

  // ---------------------------------------------------------------------------
  // Leerer Stand
  // ---------------------------------------------------------------------------
  const startId = (hausId, i) => `${hausId}-${i}`;
  const istStartId = (hausId, id) => {
    const m = String(id).match(/^([a-z]+)-(\d+)$/);
    return Boolean(m) && m[1] === hausId && Number(m[2]) < (START[hausId] || 0);
  };

  function leeresZimmer(raumId = "", at = 0) {
    const raum = K()?.RAEUME?.[raumId];
    return {
      raum: raum ? raumId : "",
      wand: raum?.wand || "creme",
      muster: raum?.muster || "keine",
      boden: raum?.boden || "parkett",
      bodenFarbe: "",
      licht: 1,
      dinge: [],
      at,
    };
  }

  function neuesStockwerk(art, { id = kennung("s"), seit = 0, pos = 0, at = 0 } = {}) {
    const zimmer = art === "wohnung" ? [leeresZimmer("", at)] : art === "zwei" ? [leeresZimmer("", at), leeresZimmer("", at)] : [];
    return { id, seit, pos, art, zimmer, tiere: [], zuzug: 0, tierWegArt: "", at };
  }

  function startStockwerke(hausId) {
    const art = hausId === "wohnhaus" ? "wohnung" : "zwei";
    return Array.from({ length: START[hausId] || 1 }, (_, i) => neuesStockwerk(art, { id: startId(hausId, i), pos: i }));
  }

  function leererStand() {
    const haeuser = {};
    HAUS_IDS.forEach((id) => {
      const haus = K()?.HAUS?.[id] || {};
      haeuser[id] = { fassade: haus.fassade || "weiss", dach: haus.dach || "rot", at: 0, stock: startStockwerke(id) };
    });
    return { v: FORMAT, gewaehlt: "", haeuser };
  }

  const zuNeu = (roh) => Number(obj(roh).v) > FORMAT;
  const breiteVon = (s) => (s?.art === "wohnung" ? GEO.W : GEO.HALB);
  // Wie viele Dinge in ein Zimmer dieser Breite passen. Die Grenze hält auch
  // den Kasten klein: Er liegt im Kontodokument neben allen Spielen.
  const dingeMax = (breite) => (breite >= GEO.W ? DINGE_MAX : DINGE_MAX_HALB);

  // ---------------------------------------------------------------------------
  // Aufräumen: was aus dem Speicher oder der Cloud kommt, in sichere Form
  // ---------------------------------------------------------------------------
  function sauberesDing(roh, breite) {
    const d = obj(roh);
    const ding = M()?.DINGE?.[d.i];
    if (!ding) return null;
    const farbe = typeof d.c === "string" && K()?.FARBE?.[d.c] ? d.c : "";
    const s = zahl(d.s, 0.6, 1.6, 1);
    let x = zahl(d.x, 0, breite, breite / 2);
    let y = zahl(d.y, 0, GEO.H, GEO.STAND);
    if (ding.art === "decke") y = 0;
    if (ding.art === "flach") y = zahl(d.y, GEO.STAND_HINTEN, GEO.STAND_VORNE, GEO.STAND);
    x = Math.round(x * 10) / 10;
    y = Math.round(y * 10) / 10;
    return { k: text(d.k, 16, kennung("d")), i: d.i, x, y, c: farbe, f: d.f ? 1 : 0, s: Math.round(s * 100) / 100 };
  }

  function sauberesZimmer(roh, breite, passt) {
    const z = obj(roh);
    const raum = K()?.RAEUME?.[z.raum];
    const gilt = Boolean(raum) && passt(raum);
    const farben = K()?.FARBE || {};
    const dinge = (Array.isArray(z.dinge) ? z.dinge : []).map((d) => sauberesDing(d, breite)).filter(Boolean).slice(0, dingeMax(breite));
    // Eine Kennung je Ding, auch nach dem Zusammenführen zweier Stände.
    const gesehen = new Set();
    dinge.forEach((ding) => { if (gesehen.has(ding.k)) ding.k = kennung("d"); gesehen.add(ding.k); });
    return {
      raum: gilt ? z.raum : "",
      wand: farben[z.wand] ? z.wand : (gilt ? raum.wand : "creme"),
      muster: K()?.MUSTER?.some((m) => m.id === z.muster) ? z.muster : (gilt ? raum.muster || "keine" : "keine"),
      boden: K()?.BODEN?.[z.boden] ? z.boden : (gilt ? raum.boden || "parkett" : "parkett"),
      bodenFarbe: farben[z.bodenFarbe] ? z.bodenFarbe : "",
      licht: z.licht === 0 ? 0 : 1,
      dinge,
      at: Number(z.at) || 0,
    };
  }

  function sauberesTier(roh) {
    const t = obj(roh);
    const art = K()?.TIERE?.[t.a];
    if (!art) return null;
    const liste = (wert, n) => (Array.isArray(wert) ? wert.filter((w) => typeof w === "string").slice(0, n) : []);
    const traum = typeof t.traum === "string" && K()?.RAEUME?.[t.traum.split(":")[1]]?.job ? t.traum : "";
    return {
      a: t.a,
      n: text(t.n, 24, art.namen[0]),
      seed: text(t.seed, 24, kennung("t")),
      seit: Number(t.seit) || 0,
      w: liste(t.w, 2),
      g: liste(t.g, 1),
      b: liste(t.b, 2),
      traum,
      wAt: Number(t.wAt) || 0,
      neu: Number.isInteger(t.neu) ? t.neu : -1,
    };
  }

  function sauberesStockwerk(roh, hausId, index) {
    const s = obj(roh);
    let art = s.art === "wohnung" || s.art === "zwei" ? s.art : "";
    if (art === "wohnung" && hausId !== "wohnhaus") art = "zwei";
    if (art === "" && hausId !== "wohnhaus") art = "zwei";
    const roheZimmer = Array.isArray(s.zimmer) ? s.zimmer : [];
    const breite = art === "wohnung" ? GEO.W : GEO.HALB;
    const passt = (raum) => raum.haus === hausId && (art === "wohnung" ? Boolean(raum.wohnen) : !raum.wohnen);
    const anzahl = art === "wohnung" ? 1 : art === "zwei" ? 2 : 0;
    const zimmer = Array.from({ length: anzahl }, (_, i) => sauberesZimmer(roheZimmer[i], breite, passt));
    const tiere = art === "wohnung" && zimmer[0].raum
      ? (Array.isArray(s.tiere) ? s.tiere : []).map(sauberesTier).filter(Boolean).slice(0, TIERE_MAX)
      : [];
    const seeds = new Set();
    tiere.forEach((t) => { if (seeds.has(t.seed)) t.seed = kennung("t"); seeds.add(t.seed); });
    return {
      id: text(s.id, 24, startId(hausId, index)),
      seit: Number(s.seit) || 0,
      pos: Number.isFinite(Number(s.pos)) ? Number(s.pos) : index,
      art,
      zimmer,
      tiere,
      zuzug: Number(s.zuzug) || 0,
      tierWegArt: K()?.TIERE?.[s.tierWegArt] ? s.tierWegArt : "",
      at: Number(s.at) || 0,
    };
  }

  // Fassung 1: ein Zimmer je Stockwerk, ein Tier darin. Schlaf- und
  // Kinderzimmer werden Wohnungen (das Tier bleibt und bekommt die Wünsche
  // der neuen Fassung), alle anderen Zimmer stehen links auf einem Stockwerk
  // für zwei – halb so breit, also rücken die Dinge zusammen.
  function ausFassung1(roh) {
    const r = obj(roh);
    const out = { v: FORMAT, gewaehlt: r.gewaehlt, haeuser: {} };
    HAUS_IDS.forEach((hausId) => {
      const h = obj(obj(r.haeuser)[hausId]);
      const alt = Array.isArray(h.stock) ? h.stock : [];
      const wohnungen = [];
      const andere = [];
      alt.forEach((roh1) => {
        const s = obj(roh1);
        const raum = K()?.RAEUME?.[s.raum];
        const zimmer = { raum: s.raum, wand: s.wand, muster: s.muster, boden: s.boden, bodenFarbe: s.bodenFarbe, licht: s.licht, dinge: s.dinge, at: s.at };
        if (raum?.wohnen && hausId === "wohnhaus") {
          const tiere = K()?.TIERE?.[s.tier?.a] ? [{ ...s.tier, ...wuenscheFuer(s.tier, s.raum, []), traum: traumAus(String(s.tier.seed)) }] : [];
          wohnungen.push({ id: s.id, seit: s.seit, art: "wohnung", zimmer: [zimmer], tiere, at: s.at });
        } else if (raum && raum.haus === hausId) {
          const halb = { ...zimmer, dinge: (Array.isArray(s.dinge) ? s.dinge : []).map((d) => ({ ...d, x: (Number(d?.x) || 0) / 2 })) };
          andere.push({ id: s.id, seit: s.seit, art: "zwei", zimmer: [halb, {}], at: s.at });
        } else if (s.seit) {
          // Ein gebautes, noch leeres Stockwerk: Es hat einen Ziegel gekostet.
          andere.push({ id: s.id, seit: s.seit, art: hausId === "wohnhaus" ? "" : "zwei", zimmer: [], at: s.at });
        }
      });
      const start = startStockwerke(hausId);
      let stock;
      if (hausId === "wohnhaus") {
        stock = start.map((s, i) => wohnungen[i] || s).concat(wohnungen.slice(start.length), andere);
      } else {
        stock = andere.length ? andere : start;
      }
      out.haeuser[hausId] = { fassade: h.fassade, dach: h.dach, at: h.at, stock: stock.map((s, i) => ({ ...s, pos: i })) };
    });
    return out;
  }

  function normalize(roh) {
    let r = obj(roh);
    if (Number(r.v) === 1) r = ausFassung1(r);
    const leer = leererStand();
    const out = { v: FORMAT, gewaehlt: HAUS_IDS.includes(r.gewaehlt) ? r.gewaehlt : "", haeuser: {} };
    HAUS_IDS.forEach((id) => {
      const h = obj(obj(r.haeuser)[id]);
      const farben = K()?.FARBE || {};
      let stock = (Array.isArray(h.stock) ? h.stock : []).slice(0, STOCK_MAX).map((s, i) => sauberesStockwerk(s, id, i));
      // Eine Kennung je Stockwerk – das Zusammenführen hält sich an sie.
      const gesehen = new Set();
      stock.forEach((s) => {
        let n = 2;
        const basis = s.id;
        while (gesehen.has(s.id)) { s.id = `${basis}~${n}`; n += 1; }
        gesehen.add(s.id);
      });
      if (!stock.length) stock = leer.haeuser[id].stock;
      ordne(stock);
      out.haeuser[id] = {
        fassade: farben[h.fassade] ? h.fassade : leer.haeuser[id].fassade,
        dach: farben[h.dach] ? h.dach : leer.haeuser[id].dach,
        at: Number(h.at) || 0,
        stock,
      };
    });
    return out;
  }

  // Die Reihenfolge im Haus: nach pos (das Kind kann sie ändern), dann nach
  // Baujahr und Kennung – auf jedem Gerät gleich.
  function ordne(stock, platz = null) {
    stock.sort((x, y) => (x.pos - y.pos) || (x.seit - y.seit) || ((platz?.get(x.id) ?? 0) - (platz?.get(y.id) ?? 0)) || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
    return stock;
  }

  // ---------------------------------------------------------------------------
  // Zusammenführen
  // ---------------------------------------------------------------------------
  // Bei gleicher Zeit entscheidet der Text, damit beide Richtungen dasselbe
  // ergeben.
  function neuer(a, b) {
    const ta = Number(a?.at) || 0;
    const tb = Number(b?.at) || 0;
    if (ta !== tb) return ta > tb ? a : b;
    return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
  }

  // Dasselbe Stockwerk auf zwei Seiten: Was das Stockwerk selbst betrifft
  // (Art, Platz, Tiere), nimmt die neuere Seite; jedes Zimmer für sich die
  // Seite, auf der es zuletzt eingerichtet wurde.
  function mergeStockwerk(a, b) {
    const kopf = clone(neuer(a, b));
    if (a.art !== b.art || a.zimmer.length !== b.zimmer.length) return kopf;
    kopf.zimmer = a.zimmer.map((za, i) => clone(neuer(za, b.zimmer[i])));
    return kopf;
  }

  const hatInhalt = (s) => s.zimmer.some((z) => z.raum || z.dinge.length) || s.tiere.length > 0;

  // Die Stockwerke zweier Stände: Jedes, das eine Seite kennt, bleibt – so
  // geht nie ein eingerichtetes Zimmer verloren, auch wenn zwei Geräte (oder
  // ein Gast vor der Anmeldung) am selben Ort gebaut haben. Nur ein
  // unberührtes Stockwerk vom Anfang fällt weg, wo die andere Seite es schon
  // ausgebaut hat (es bekommt dabei eine eigene Kennung, siehe waehleRaum).
  // Abreissen gibt es nicht; käme es, bräuchte es hier eine Spur.
  function mergeStock(hausId, sa, sb) {
    const ma = new Map(sa.map((s, i) => [s.id, { s, i }]));
    const mb = new Map(sb.map((s, i) => [s.id, { s, i }]));
    const alle = [];
    const platz = new Map();
    new Set([...ma.keys(), ...mb.keys()]).forEach((id) => {
      const a = ma.get(id);
      const b = mb.get(id);
      const s = a && b ? mergeStockwerk(a.s, b.s) : clone((a || b).s);
      if (!(a && b) && istStartId(hausId, id) && !hatInhalt(s)) return;
      platz.set(id, Math.min(a ? a.i : Infinity, b ? b.i : Infinity));
      alle.push(s);
    });
    return ordne(alle, platz).slice(0, STOCK_MAX);
  }

  function merge(a, b) {
    // Ein Kasten aus einer neueren Fassung bleibt, wie er ist (siehe FORMAT).
    if (zuNeu(a) || zuNeu(b)) {
      const va = Number(obj(a).v) || 0;
      const vb = Number(obj(b).v) || 0;
      if (va !== vb) return clone(va > vb ? a : b);
      return clone(JSON.stringify(a) >= JSON.stringify(b) ? a : b);
    }
    const A = normalize(a);
    const B = normalize(b);
    const out = { v: FORMAT, gewaehlt: A.gewaehlt || B.gewaehlt, haeuser: {} };
    if (A.gewaehlt && B.gewaehlt && A.gewaehlt !== B.gewaehlt) out.gewaehlt = A.gewaehlt < B.gewaehlt ? A.gewaehlt : B.gewaehlt;
    HAUS_IDS.forEach((id) => {
      const ha = A.haeuser[id];
      const hb = B.haeuser[id];
      const kopf = neuer({ at: ha.at, fassade: ha.fassade, dach: ha.dach }, { at: hb.at, fassade: hb.fassade, dach: hb.dach });
      out.haeuser[id] = { fassade: kopf.fassade, dach: kopf.dach, at: kopf.at, stock: mergeStock(id, ha.stock, hb.stock) };
    });
    return out;
  }

  // Ob sich ein Gast-Stand für ein neues Konto lohnt: Ist schon etwas gebaut?
  function istLeer(roh) {
    if (zuNeu(roh)) return true;
    const s = normalize(roh);
    return HAUS_IDS.every((id) => s.haeuser[id].stock.length <= (START[id] || 1) && !s.haeuser[id].stock.some(hatInhalt));
  }

  // ---------------------------------------------------------------------------
  // Der Kasten
  // ---------------------------------------------------------------------------
  const cloudGames = window.LernappGameCloud;
  const store = cloudGames?.registerProKonto
    ? cloudGames.registerProKonto({ key: KEY, empty: leererStand(), merge, uebernehmen: (gast) => !istLeer(gast) })
    : {
      read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } },
      write(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* privater Modus */ } return data; },
      besitzer() { return ""; },
      onChange() { return () => {}; },
    };

  // Liegt schon ein Kasten einer neueren Fassung da, bleibt er unberührt
  // (siehe FORMAT): Der Stand hier ist dann nur ein leerer Platzhalter, und
  // gespeichert wird nichts.
  let besitzer = store.besitzer();
  let neuere = zuNeu(store.read());
  let stand = neuere ? leererStand() : normalize(store.read());
  let version = 0;
  const zuhoerer = new Set();
  function melde(grund) {
    version += 1;
    zuhoerer.forEach((fn) => { try { fn(grund); } catch { /* ein Zuhörer hält die anderen nicht auf */ } });
  }

  // Gespeichert wird gebündelt: Ein Kind schiebt ein Sofa zehnmal hin und her,
  // und jedes Mal den ganzen Kasten in die Cloud zu schicken, wäre zu viel.
  // Gespeichert wird für das Kind, dem der Stand gehört (besitzer) – auch wenn
  // inzwischen ein anderes angemeldet ist.
  let speicherUhr = 0;
  function speichern(sofort = false) {
    if (speicherUhr) { window.clearTimeout(speicherUhr); speicherUhr = 0; }
    if (neuere) return;
    const jetzt = () => {
      speicherUhr = 0;
      if (!neuere) store.write(clone(stand), besitzer);
    };
    if (sofort) jetzt();
    else speicherUhr = window.setTimeout(jetzt, 1200);
  }
  window.addEventListener("pagehide", () => { if (speicherUhr) speichern(true); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && speicherUhr) speichern(true); });

  // Ein anderes Kind meldet sich an (oder ab): Was noch aufs Speichern wartet,
  // geht an das bisherige; dann gilt der Stand des neuen – ganz, ohne etwas
  // vom vorigen. Aus der Cloud wird mit dem eigenen Stand zusammengeführt,
  // nicht übernommen: Eine Änderung, die hier noch wartet, ist neuer.
  store.onChange((data, grund) => {
    if (grund === "konto") {
      if (speicherUhr) speichern(true);
      besitzer = store.besitzer();
      neuere = zuNeu(data);
      stand = neuere ? leererStand() : normalize(data);
      melde("konto");
      return;
    }
    if (zuNeu(data)) {
      if (!neuere) { neuere = true; melde("neuer"); }
      return;
    }
    const vorher = JSON.stringify(stand);
    stand = merge(stand, data);
    if (JSON.stringify(stand) !== vorher) melde("cloud");
  });
  // Neue verdiente Ziegel (ein Rätsel auf einem anderen Gerät).
  reise()?.onBauLieferung?.(() => melde("ziegel"));

  // Jede Änderung läuft durch eine dieser drei: Sie stempeln die Zeit (fürs
  // Zusammenführen), speichern und melden sich.
  function aendereStock(hausId, index, fn, grund = "stock") {
    const s = stock(hausId, index);
    if (!s) return null;
    const ergebnis = fn(s);
    s.at = Date.now();
    speichern();
    melde(grund);
    return ergebnis;
  }

  function aendereZimmer(hausId, index, slot, fn, grund = "zimmer") {
    const z = zimmer(hausId, index, slot);
    if (!z) return null;
    const ergebnis = fn(z, stock(hausId, index));
    z.at = Date.now();
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
  function zimmer(hausId, index, slot = 0) { return stock(hausId, index)?.zimmer?.[slot] || null; }
  function raumVon(hausId, index, slot = 0) { return K()?.RAEUME?.[zimmer(hausId, index, slot)?.raum] || null; }
  function indexVon(hausId, stockId) { return (stand.haeuser[hausId]?.stock || []).findIndex((s) => s.id === stockId); }

  // ---------------------------------------------------------------------------
  // Ziegel
  // ---------------------------------------------------------------------------
  function verdient() { return Number(reise()?.bauPaletten?.()) || 0; }
  function verbaut() { return HAUS_IDS.reduce((summe, id) => summe + Math.max(0, (stand.haeuser[id]?.stock?.length || 0) - (START[id] || 1)), 0); }
  function paletten() { return Math.max(0, verdient() - verbaut()); }

  // Was die Lieferung schon gezeigt hat – je Gerät und je Kind. Kennt dieses
  // Gerät ein Kind noch nicht, gilt alles als gezeigt (sonst brächte der Zug
  // beim ersten Besuch alle Ziegel eines anderen Geräts noch einmal).
  function gezeigtKarte() {
    try {
      const roh = JSON.parse(localStorage.getItem(GEZEIGT_KEY) || "{}");
      return roh && typeof roh === "object" && !Array.isArray(roh) ? roh : {};
    } catch { return {}; }
  }
  function merkeGezeigt(n = verdient()) {
    const karte = gezeigtKarte();
    karte[besitzer] = Math.max(0, Math.floor(n));
    try { localStorage.setItem(GEZEIGT_KEY, JSON.stringify(karte)); } catch { /* privater Modus */ }
  }
  function gezeigt() {
    const n = Number(gezeigtKarte()[besitzer]);
    if (Number.isFinite(n)) return Math.max(0, n);
    merkeGezeigt(verdient());
    return verdient();
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

  // Ein neues Stockwerk obendrauf. Im Wohnhaus wählt das Kind danach, ob
  // dort jemand wohnt (waehleArt); sonst hat es gleich zwei leere Zimmer.
  function baueStockwerk(hausId) {
    if (!kannBauen(hausId).ok) return -1;
    const h = haus(hausId);
    const jetzt = Date.now();
    const pos = h.stock.reduce((m, s) => Math.max(m, s.pos), -1) + 1;
    h.stock.push(neuesStockwerk(hausId === "wohnhaus" ? "" : "zwei", { seit: jetzt, pos, at: jetzt }));
    h.at = jetzt;
    speichern(true);
    melde("gebaut");
    return h.stock.length - 1;
  }

  // Im Wohnhaus: wohnt hier jemand ("wohnung") oder kommen zwei Zimmer hin ("zwei")?
  function waehleArt(hausId, index, art) {
    const s = stock(hausId, index);
    if (!s || s.art || hausId !== "wohnhaus" || !["wohnung", "zwei"].includes(art)) return false;
    aendereStock(hausId, index, (st) => {
      const jetzt = Date.now();
      st.art = art;
      st.zimmer = neuesStockwerk(art, { at: jetzt }).zimmer;
      st.tiere = [];
    }, "art");
    return true;
  }

  // Die Zimmerart wählen. Ein leeres Zimmer bekommt die Farben seiner Art; in
  // eine Wohnung zieht gleich das erste Tier ein (zurück kommt es, damit die
  // Ansicht seinen Einzug zeigt). Wird die Art später geändert, bleibt alles
  // stehen, und die Tiere bekommen Wünsche, die zur neuen Art passen.
  function waehleRaum(hausId, index, slot, raumId) {
    const s = stock(hausId, index);
    const raum = K()?.RAEUME?.[raumId];
    if (!s || !raum || raum.haus !== hausId || !s.zimmer[slot]) return null;
    if (s.art === "wohnung" ? !raum.wohnen : raum.wohnen) return null;
    let eingezogen = null;
    const jetzt = Date.now();
    aendereStock(hausId, index, (st) => {
      // Ein Stockwerk vom Anfang wird hier zu diesem Zimmer – mit eigener
      // Kennung (siehe mergeStock).
      if (istStartId(hausId, st.id)) st.id = kennung("s");
      const z = st.zimmer[slot];
      const warLeer = !z.raum;
      z.raum = raumId;
      if (warLeer) {
        z.wand = raum.wand;
        z.muster = raum.muster || "keine";
        z.boden = raum.boden || "parkett";
        z.bodenFarbe = "";
      }
      z.at = jetzt;
      if (st.art !== "wohnung") return;
      st.tiere.forEach((tier, i) => {
        Object.assign(tier, gelbeWuensche(tier, raumId, st.tiere.filter((_, j) => j < i)));
        tier.wAt = jetzt;
        tier.neu = -1;
      });
      if (!st.tiere.length) {
        eingezogen = neuesTier(hausId, index, { im: st });
        st.tiere.push(eingezogen);
        st.zuzug = jetzt + ZUZUG_MS;
      }
    }, "raum");
    return eingezogen || true;
  }

  // Ein Stockwerk eins nach oben (+1) oder unten (-1): Es tauscht den Platz
  // mit dem Nachbarn – so kommt der Eingang nach unten.
  function verschiebe(hausId, index, richtung) {
    const h = haus(hausId);
    const j = index + (richtung > 0 ? 1 : -1);
    if (!h || !h.stock[index] || !h.stock[j]) return index;
    const jetzt = Date.now();
    // Erst ein Platz je Stockwerk (nach dem Zusammenführen können zwei denselben haben).
    h.stock.forEach((s, i) => { if (s.pos !== i) { s.pos = i; s.at = jetzt; } });
    const a = h.stock[index];
    const b = h.stock[j];
    [a.pos, b.pos] = [b.pos, a.pos];
    a.at = jetzt;
    b.at = jetzt;
    ordne(h.stock);
    speichern();
    melde("ordnen");
    return j;
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
  // Alle Bewohner mit ihrem Zuhause.
  function alleTiere() {
    const liste = [];
    HAUS_IDS.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      s.tiere.forEach((tier) => liste.push({ hausId, index, tier, stock: s }));
    }));
    return liste;
  }
  function findeTier(seed) { return alleTiere().find((eintrag) => eintrag.tier.seed === seed) || null; }

  // Ein neues Tier: möglichst eine Art, die in der Wohnung und im Haus noch
  // fehlt (und nicht die eben hinausgeschickte), und ein Name, den noch keines trägt.
  function neuesTier(hausId, index, { im = null } = {}) {
    const katalog = K();
    const s = im || stock(hausId, index);
    const alle = alleTiere();
    const inWohnung = new Set(s.tiere.map((t) => t.a));
    const imHaus = new Set(alle.filter((e) => e.hausId === hausId).map((e) => e.tier.a));
    const namen = new Set(alle.map((e) => e.tier.n));
    const ausser = s.tierWegArt ? [s.tierWegArt] : [];
    let arten = katalog.TIER_IDS.filter((a) => !inWohnung.has(a) && !ausser.includes(a));
    const ganzNeu = arten.filter((a) => !imHaus.has(a));
    if (ganzNeu.length) arten = ganzNeu;
    if (!arten.length) arten = katalog.TIER_IDS.slice();
    const art = arten[Math.floor(Math.random() * arten.length)];
    const freieNamen = katalog.TIERE[art].namen.filter((n) => !namen.has(n));
    const auswahl = freieNamen.length ? freieNamen : katalog.TIERE[art].namen;
    const tier = { a: art, n: auswahl[Math.floor(Math.random() * auswahl.length)], seed: kennung("t"), seit: Date.now(), w: [], g: [], b: [], traum: traumFuer(), wAt: Date.now(), neu: -1 };
    Object.assign(tier, wuenscheFuer(tier, s.zimmer[0]?.raum, s.tiere));
    return tier;
  }

  // Ein Traumjob: am liebsten einer, den sich noch keines wünscht.
  const alleJobs = () => K().RAEUME_LISTE.filter((raum) => raum.job && ARBEITS_HAEUSER.includes(raum.haus)).map((raum) => `${raum.haus}:${raum.id}`);
  function traumFuer() {
    const alle = alleJobs();
    const vergeben = new Set(alleTiere().map((e) => e.tier.traum));
    const frei = alle.filter((t) => !vergeben.has(t));
    const liste = frei.length ? frei : alle;
    return liste[Math.floor(Math.random() * liste.length)] || "";
  }
  // Für Tiere aus Fassung 1: auf jedem Gerät derselbe.
  function traumAus(seed) {
    const alle = alleJobs();
    return alle.length ? alle[hash(`${seed}:traum`) % alle.length] : "";
  }

  // Die gelben Wünsche für die Wohnung: eines ist das, was die Tierart besonders
  // mag (ein Ding oder die Wandfarbe), das andere passt zur Zimmerart. Was ein
  // Mitbewohner schon wünscht, kommt nicht noch einmal.
  function gelbeWuensche(tier, raumId, mitbewohner = []) {
    const katalog = K();
    const raum = katalog.RAEUME[raumId];
    if (!raum) return { w: [] };
    const rnd = zufall(`${tier.seed}:${raumId}`);
    const schon = new Set(mitbewohner.flatMap((t) => t.w || []));
    const art = katalog.TIERE[tier.a];
    const ding = `ding:${art.mag.ding}`;
    const farbe = `farbe:${art.mag.farbe}`;
    let lieblings = rnd() < 0.5 ? ding : farbe;
    if (schon.has(lieblings)) lieblings = lieblings === ding ? farbe : ding;
    const gelb = [lieblings];
    const kandidaten = mische(raum.wuensche || [], rnd).map((t) => `ding:${t}`).filter((w) => w !== lieblings);
    gelb.push(kandidaten.find((w) => !schon.has(w)) || kandidaten[0]);
    return { w: gelb.filter(Boolean) };
  }

  // Alle Wünsche eines Tiers: zwei gelbe (Wohnung), ein grüner (Wohnhaus),
  // zwei blaue (die anderen Häuser).
  function wuenscheFuer(tier, raumId, mitbewohner = []) {
    const katalog = K();
    const rnd = zufall(`${tier.seed}:haus`);
    const gruen = ziehe(katalog.HAUS_WUENSCHE.wohnhaus || [], 1, rnd).map((r) => `raum:${r}`);
    const blau = ziehe(katalog.FREMD_WUENSCHE.wohnhaus || [], 2, rnd).map((f) => `fremd:${f.haus}:${f.raum}`);
    return { ...gelbeWuensche(tier, raumId, mitbewohner), g: gruen, b: blau };
  }

  // Wer zieht als Nächstes ein? Eine Wohnung mit Platz, deren Wartezeit um ist.
  function zuzugFaellig(jetzt = Date.now()) {
    if (neuere) return null;
    const h = stand.haeuser.wohnhaus;
    const index = h.stock.findIndex((s) => s.art === "wohnung" && s.zimmer[0]?.raum && s.tiere.length < TIERE_MAX && jetzt >= (s.zuzug || 0));
    return index >= 0 ? { hausId: "wohnhaus", index } : null;
  }

  // Ein Tier zieht ein. Zurück kommt es – die Ansicht zeigt den Einzug.
  function ziehtEin(hausId, index) {
    const s = stock(hausId, index);
    if (!s || s.art !== "wohnung" || !s.zimmer[0]?.raum || s.tiere.length >= TIERE_MAX) return null;
    let tier = null;
    aendereStock(hausId, index, (st) => {
      tier = neuesTier(hausId, index, { im: st });
      st.tiere.push(tier);
      st.zuzug = Date.now() + ZUZUG_MS;
      st.tierWegArt = "";
    }, "tier");
    return tier;
  }

  // Hinausschicken: Bald zieht ein anderes ein (Entscheid 7).
  function hinausschicken(seed) {
    const ref = findeTier(seed);
    if (!ref) return "";
    aendereStock(ref.hausId, ref.index, (st) => {
      st.tiere = st.tiere.filter((t) => t.seed !== seed);
      st.tierWegArt = ref.tier.a;
      st.zuzug = Date.now() + TIER_KOMMT_MS;
    }, "tier");
    return ref.tier.a;
  }

  // ---------------------------------------------------------------------------
  // Wünsche auswerten
  // ---------------------------------------------------------------------------
  function hatDing(z, tagId) {
    const dinge = M()?.DINGE || {};
    return Boolean(z?.dinge?.some((d) => dinge[d.i]?.tags?.includes(tagId)));
  }
  function zimmerIn(hausId, raumId) {
    return Boolean(stand.haeuser[hausId]?.stock?.some((s) => s.zimmer.some((z) => z.raum === raumId)));
  }

  function erfuellt(seed, wunsch) {
    const ref = findeTier(seed);
    if (!ref) return false;
    const z = ref.stock.zimmer[0];
    const [typ, a, b] = String(wunsch).split(":");
    if (typ === "ding") return hatDing(z, a);
    if (typ === "farbe") return K()?.FARBE?.[z?.wand]?.familie === a;
    if (typ === "raum") return zimmerIn("wohnhaus", a);
    if (typ === "fremd") return zimmerIn(a, b);
    return false;
  }

  // Wie ein Wunsch heisst, und was "Zeig mir" tun soll.
  function beschreibe(wunsch) {
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
      return { typ, text: `${gross(katalog.HAUS.wohnhaus.im)} wünsche ich mir ${raum?.ein || a}.`, kurz: raum?.name || a, haus: "wohnhaus", raum: a, icon: raum?.icon };
    }
    if (typ === "fremd") {
      const raum = katalog.RAEUME[b];
      const warum = (katalog.FREMD_WUENSCHE.wohnhaus || []).find((f) => f.haus === a && f.raum === b)?.warum || "";
      return { typ, text: `${gross(katalog.HAUS[a]?.im || "")} wünsche ich mir ${raum?.ein || b}. ${warum}`.trim(), kurz: `${raum?.name || b} (${katalog.HAUS[a]?.name || a})`, haus: a, raum: b, icon: raum?.icon };
    }
    return { typ: "", text: "", kurz: "" };
  }

  // Die Wünsche eines Tiers, mit Stern-Farbe und ob sie erfüllt sind.
  function wuensche(seed) {
    const ref = findeTier(seed);
    if (!ref) return [];
    const t = ref.tier;
    const liste = [];
    t.w.forEach((w, i) => liste.push({ id: w, stern: "gelb", neu: t.neu === i, ...beschreibe(w), erfuellt: erfuellt(seed, w) }));
    t.g.forEach((w) => liste.push({ id: w, stern: "gruen", ...beschreibe(w), erfuellt: erfuellt(seed, w) }));
    t.b.forEach((w) => liste.push({ id: w, stern: "blau", ...beschreibe(w), erfuellt: erfuellt(seed, w) }));
    return liste;
  }

  function sterne(seed) {
    const liste = wuensche(seed);
    const farbe = (f) => liste.filter((w) => w.stern === f).map((w) => w.erfuellt);
    return { gelb: farbe("gelb"), gruen: farbe("gruen"), blau: farbe("blau"), anzahl: liste.filter((w) => w.erfuellt).length, total: liste.length };
  }

  // Die Sterne eines Stockwerks: je Tier eine Reihe.
  function sterneStock(hausId, index) {
    const s = stock(hausId, index);
    const tiere = (s?.tiere || []).map((t) => ({ seed: t.seed, a: t.a, n: t.n, ...sterne(t.seed) }));
    return { tiere, anzahl: tiere.reduce((n, t) => n + t.anzahl, 0), total: tiere.reduce((n, t) => n + t.total, 0) };
  }

  // Wie zufrieden ein Tier ist. Nie traurig: Wünsche dürfen offen bleiben, es
  // gibt nur weniger Sterne (Entscheid 6).
  function laune(seed) {
    const ref = findeTier(seed);
    if (!ref) return { stufe: 0, emoji: "", text: "" };
    const st = sterne(seed);
    const name = ref.tier.n;
    const anteil = st.total ? st.anzahl / st.total : 0;
    if (st.total && st.anzahl === st.total) return { stufe: 3, emoji: "🤩", text: `${name} ist überglücklich!` };
    if (anteil >= 0.6) return { stufe: 2, emoji: "😊", text: `${name} fühlt sich wohl.` };
    if (anteil >= 0.3) return { stufe: 1, emoji: "🙂", text: `${name} ist zufrieden.` };
    return { stufe: 0, emoji: "😐", text: `${name} findet es noch ein bisschen leer.` };
  }

  // Der Stand der Häuser für das Startbild und den Umschalter.
  function fortschritt() {
    return HAUS_IDS.map((id) => {
      const h = stand.haeuser[id];
      let anzahl = 0;
      let total = 0;
      let bewohnt = 0;
      h.stock.forEach((s) => s.tiere.forEach((t) => {
        bewohnt += 1;
        const st = sterne(t.seed);
        anzahl += st.anzahl;
        total += st.total;
      }));
      const eingerichtet = h.stock.reduce((n, s) => n + s.zimmer.filter((z) => z.raum).length, 0);
      return { id, stockwerke: h.stock.length, eingerichtet, bewohnt, sterne: anzahl, maxSterne: total, fassade: h.fassade, dach: h.dach };
    });
  }

  // ---------------------------------------------------------------------------
  // Arbeit: Traumjob und Job
  // ---------------------------------------------------------------------------
  // Die Arbeitsplätze: jedes eingerichtete Zimmer der anderen Häuser.
  function arbeitsplaetze() {
    const liste = [];
    ARBEITS_HAEUSER.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      s.zimmer.forEach((z, slot) => {
        if (z.raum && K()?.RAEUME?.[z.raum]?.job) liste.push({ haus: hausId, index, slot, raum: z.raum, stockId: s.id });
      });
    }));
    return liste;
  }

  // Wer arbeitet wo: Zuerst bekommt jedes Tier seinen Traumjob, wenn es das
  // Zimmer gibt und dort noch Platz ist (höchstens drei); dann nehmen die
  // übrigen irgendeine Arbeit, wo Platz ist. Wer zuerst eingezogen ist, wählt
  // zuerst – auf jedem Gerät gleich.
  let jobsCache = { version: -1, karte: new Map() };
  function jobs() {
    if (jobsCache.version === version) return jobsCache.karte;
    const plaetze = arbeitsplaetze();
    const karte = new Map();
    const belegt = new Map();
    const schluessel = (p) => `${p.haus}:${p.stockId}:${p.slot}`;
    const nimm = (seed, p, traum) => {
      karte.set(seed, { ...p, traum });
      belegt.set(schluessel(p), (belegt.get(schluessel(p)) || 0) + 1);
    };
    const tiere = alleTiere().map((e) => e.tier).sort((a, b) => (a.seit - b.seit) || (a.seed < b.seed ? -1 : 1));
    tiere.forEach((tier) => {
      const [h, r] = String(tier.traum).split(":");
      const p = plaetze.find((q) => q.haus === h && q.raum === r && (belegt.get(schluessel(q)) || 0) < ARBEIT_MAX);
      if (p) nimm(tier.seed, p, true);
    });
    tiere.forEach((tier) => {
      if (karte.has(tier.seed)) return;
      const frei = plaetze.filter((q) => (belegt.get(schluessel(q)) || 0) < ARBEIT_MAX);
      if (!frei.length) return;
      frei.sort((a, b) => hash(`${tier.seed}:${schluessel(a)}`) - hash(`${tier.seed}:${schluessel(b)}`));
      nimm(tier.seed, frei[0], false);
    });
    jobsCache = { version, karte };
    return karte;
  }
  function jobVon(seed) { return jobs().get(seed) || null; }

  // Wie ein Job heisst: "Brot backen in der Bäckerei (Dorf)".
  function jobText(raumId, hausId) {
    const raum = K()?.RAEUME?.[raumId];
    if (!raum?.job) return "";
    return `${gross(raum.job)} ${imRaum(raumId)} (${K().HAUS[hausId]?.name || hausId})`;
  }

  // ---------------------------------------------------------------------------
  // Wo ein Tier gerade ist
  // ---------------------------------------------------------------------------
  // In Viertelstunden gerechnet, für alle Geräte gleich: meist zu Hause,
  // manchmal bei der Arbeit, ab und zu zu Besuch in einem anderen Haus – am
  // liebsten dort, wo es sich ein Zimmer gewünscht hat. In der Nacht sind
  // alle daheim.
  function besuchsziele(tier) {
    const liste = [];
    const blau = tier.b.map((w) => w.split(":"));
    ARBEITS_HAEUSER.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      s.zimmer.forEach((z, slot) => {
        if (!z.raum) return;
        const raum = K()?.RAEUME?.[z.raum];
        const gewuenscht = blau.some((t) => t[1] === hausId && t[2] === z.raum);
        const gewicht = gewuenscht ? 4 : raum?.ausflug ? 2 : 1;
        for (let i = 0; i < gewicht; i += 1) liste.push({ haus: hausId, index, slot });
      });
    }));
    return liste;
  }

  function aufenthalt(seed, jetzt = Date.now()) {
    const ref = findeTier(seed);
    if (!ref) return null;
    const daheim = { wo: "daheim", haus: ref.hausId, index: ref.index, slot: 0 };
    const stunde = new Date(jetzt).getHours();
    if (stunde >= 20 || stunde < 7) return daheim;
    // Wer eben eingezogen ist, packt zuerst aus.
    if (jetzt - (ref.tier.seit || 0) < SLOT_MS) return daheim;
    const nr = Math.floor(jetzt / SLOT_MS);
    const wurf = hash(`${seed}:${nr}`) % 100;
    if (wurf < 55) return daheim;
    if (wurf < 80) {
      const job = jobVon(seed);
      return job ? { wo: "arbeit", haus: job.haus, index: job.index, slot: job.slot } : daheim;
    }
    const ziele = besuchsziele(ref.tier);
    if (!ziele.length) return daheim;
    return { wo: "besuch", ...ziele[hash(`${seed}:${nr}:ziel`) % ziele.length] };
  }

  // Wer gerade in diesem Zimmer ist und nicht hier wohnt.
  function besucher(hausId, index, slot = 0, jetzt = Date.now()) {
    const liste = [];
    alleTiere().forEach(({ tier }) => {
      const wo = aufenthalt(tier.seed, jetzt);
      if (wo && wo.wo !== "daheim" && wo.haus === hausId && wo.index === index && wo.slot === slot) liste.push({ tier, grund: wo.wo });
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

  // Wo ein Tier ist, als Satz: "ist zu Hause", "arbeitet in der Bibliothek im
  // Dorf", "besucht den Spielplatz im Dorf".
  function woText(seed, jetzt = Date.now()) {
    const wo = aufenthalt(seed, jetzt);
    if (!wo || wo.wo === "daheim") return "ist zu Hause";
    const z = zimmer(wo.haus, wo.index, wo.slot);
    const raum = K()?.RAEUME?.[z?.raum];
    const imHaus = K()?.HAUS?.[wo.haus]?.im || "";
    if (!raum) return "ist unterwegs";
    if (wo.wo === "arbeit") return `arbeitet ${imRaum(z.raum)} ${imHaus}`;
    return `besucht ${raum.der.replace(/^der /, "den ")} ${imHaus}`;
  }

  // ---------------------------------------------------------------------------
  // Was die Zeit tut: Wünsche ändern sich
  // ---------------------------------------------------------------------------
  // Läuft, solange die Bauecke offen ist (train-bau.js). Ein neuer gelber
  // Wunsch frühestens am nächsten Kalendertag, und nur, wenn beide gelben
  // erfüllt sind: Das Lieblingsding bleibt, das andere wechselt. Wer
  // einzieht, entscheidet die Ansicht (zuzugFaellig, ziehtEin) – damit das
  // Kind den Einzug sieht.
  function tick(jetzt = Date.now()) {
    const ereignisse = [];
    if (neuere) return ereignisse;
    alleTiere().forEach(({ hausId, index, tier, stock: s }) => {
      if (tag(jetzt) <= tag(tier.wAt)) return;
      if (!tier.w.length || !tier.w.every((w) => erfuellt(tier.seed, w))) return;
      const raum = K()?.RAEUME?.[s.zimmer[0]?.raum];
      if (!raum) return;
      const rnd = zufall(`${tier.seed}:${tag(jetzt)}`);
      const schon = new Set(s.tiere.flatMap((t) => t.w));
      const kandidaten = mische((raum.wuensche || []).map((t) => `ding:${t}`).filter((w) => !schon.has(w)), rnd);
      if (!kandidaten.length || tier.w.length < 2) return;
      aendereStock(hausId, index, (st) => {
        const t = st.tiere.find((x) => x.seed === tier.seed);
        if (!t) return;
        t.w[1] = kandidaten[0];
        t.wAt = jetzt;
        t.neu = 1;
      }, "wunsch");
      ereignisse.push({ typ: "neuerWunsch", hausId, index, seed: tier.seed });
    });
    return ereignisse;
  }

  function onChange(fn) { zuhoerer.add(fn); return () => zuhoerer.delete(fn); }

  window.LernappBauStand = {
    KEY, FORMAT, GEO, STOCK_MAX, STOCK_OHNE_KAUF, DINGE_MAX, DINGE_MAX_HALB, dingeMax, TIERE_MAX, ARBEIT_MAX, ZUZUG_MS, TIER_KOMMT_MS, HAUS_IDS, START,
    normalize, merge, leererStand, neuereFassung: () => neuere, besitzer: () => besitzer, breiteVon,
    lesen, haus, stock, zimmer, raumVon, indexVon,
    verdient, verbaut, paletten, gezeigt, merkeGezeigt, neueLieferung,
    kannBauen, baueStockwerk, waehleArt, waehleRaum, verschiebe, setzeGewaehlt,
    aendereStock, aendereZimmer, aendereHaus, speichern,
    alleTiere, findeTier, neuesTier, wuenscheFuer, zuzugFaellig, ziehtEin, hinausschicken,
    erfuellt, wuensche, sterne, sterneStock, laune, fortschritt, beschreibe,
    arbeitsplaetze, jobVon, jobText, aufenthalt, besucher, imRaum, woText,
    tick, onChange, kennung, hash,
  };
})();
