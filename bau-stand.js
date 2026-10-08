/*
 * bau-stand.js – Der Stand der Bauecke: Häuser, Stockwerke, Zimmer, Dinge, Tiere.
 * ---------------------------------------------------------------------------
 * Ein Kasten je Konto (game-cloud.js, registerProKonto): angemeldet gehört er
 * dem Kind – auf dem Gerät und in der Cloud –, und meldet sich ein anderes
 * Kind an, kommt dessen Stand; nichts mischt sich. Ohne Anmeldung gilt ein
 * eigener Gast-Stand. "Fortschritt zurücksetzen" lässt ihn stehen.
 *
 *   {
 *     v: 4,                               // FORMAT – siehe unten
 *     gewaehlt: "spital",                 // mit welchem Haus das Kind begonnen hat
 *     haeuser: {
 *       wohnhaus: {
 *         fassade: "pfirsich", dach: "rot", at,
 *         stock: [                         // von unten nach oben (nach pos)
 *           { id, seit, pos,               // Kennung, wann gebaut, Platz im Haus
 *             art: "wohnung",              // Wohnhaus: "wohnung", "zwei" oder "" (Rohbau);
 *                                          // Spital, Dorf, Büro: "eins" – oder "oben": das
 *                                          // obere Stockwerk eines Zimmers über zwei
 *                                          // Stockwerke (der KiddyDome), dann mit
 *             zu,                          // der Kennung des Stockwerks darunter
 *             zimmer: [                    // wohnung, eins: eines; zwei: zwei; Rohbau, oben: keines
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
 * erste Tier ein, mit der Zeit kommen bis zu zwei weitere. Die übrigen
 * Stockwerke des Wohnhauses haben zwei Zimmer nebeneinander, in denen niemand
 * wohnt; Spital, Dorf und Büro ein Zimmer je Stockwerk – nur der KiddyDome im
 * Dorf ist so hoch wie zwei: Er gehört dem unteren Stockwerk, im Zimmer reicht
 * die Wand bis -GEO.STOCK hinauf, und das obere Stockwerk ist frei. Jedes Tier hat fünf
 * Wünsche – zwei gelbe für
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
  // Fassung 3 bringt den KiddyDome (ein Zimmer über zwei Stockwerke, die Art
  // "oben") und seine Dinge; ein Kasten der Fassung 2 gilt unverändert.
  // Fassung 4 macht die Zimmer niedriger (siehe GEO): Was an der Wand hängt,
  // rückt beim Lesen eines älteren Kastens anteilig auf die kürzere Wand.
  const FORMAT = 4;

  // --- Ein Zimmer, in Zimmer-Einheiten --------------------------------------
  // Eine Wohnung und ein Zimmer in Spital, Dorf und Büro sind so breit wie das
  // Stockwerk (W), die zwei Zimmer eines Stockwerks im Wohnhaus halb so breit
  // (HALB). Die Wand reicht bis WAND_UNTEN, darunter
  // liegt der Boden; was steht, steht zwischen STAND_HINTEN und STAND_VORNE
  // (weiter vorn heisst weiter unten im Bild und davor gezeichnet). Der Boden
  // liegt bei H. Oben ist y = OBEN: Seit Fassung 4 ist ein Zimmer 160 hoch
  // statt 240 – die Wand beginnt tiefer, der Boden bleibt, wo er war. Der
  // KiddyDome behält seine Höhe: oben y = -STOCK, ein altes Stockwerk samt
  // Decke höher.
  const GEO = {
    W: 560,
    HALB: 280,
    H: 240,
    OBEN: 80,
    STOCK: 256,
    WAND_UNTEN: 216,
    STAND_HINTEN: 224,
    STAND_VORNE: 236,
    STAND: 230,
  };

  const STOCK_MAX = 20;              // so hoch wird ein Haus höchstens
  const STOCK_OHNE_KAUF = 4;         // ohne Kauf: bis zum vierten Stockwerk
  const DINGE_MAX = 40;              // so viele Dinge passen in ein ganzes Zimmer
  const DINGE_MAX_HALB = 20;         // und in eines, halb so breit
  const TIERE_MAX = 3;               // so viele Tiere wohnen in einer Wohnung
  const ARBEIT_MAX = 3;              // so viele Tiere arbeiten im selben Zimmer
  const ZUZUG_MS = 10 * 60 * 1000;   // so lange, bis in eine Wohnung das nächste Tier zieht
  const TIER_KOMMT_MS = 40000;       // so bald kommt nach dem Hinausschicken ein neues
  const SLOT_MS = 15 * 60 * 1000;    // in Viertelstunden: wo ein Tier gerade ist
  const HAUS_IDS = ["wohnhaus", "spital", "zentrum", "buero"];
  const ARBEITS_HAEUSER = ["spital", "zentrum", "buero"];
  // Womit ein Haus beginnt: das Wohnhaus mit drei leeren Wohnungen, die
  // anderen mit einem leeren Zimmer.
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
    const zimmer = art === "zwei" ? [leeresZimmer("", at), leeresZimmer("", at)] : art ? [leeresZimmer("", at)] : [];
    return { id, seit, pos, art, zimmer, tiere: [], zuzug: 0, tierWegArt: "", at };
  }

  function startStockwerke(hausId) {
    const art = hausId === "wohnhaus" ? "wohnung" : "eins";
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
  const breiteVon = (s) => (s?.art === "zwei" ? GEO.HALB : GEO.W);
  // Wie viele Dinge in ein Zimmer dieser Breite passen. Die Grenze hält auch
  // den Kasten klein: Er liegt im Kontodokument neben allen Spielen.
  const dingeMax = (breite) => (breite >= GEO.W ? DINGE_MAX : DINGE_MAX_HALB);
  // Ein Zimmer über zwei Stockwerke (der KiddyDome) gehört dem unteren
  // Stockwerk; das obere hat die Art "oben" und zeigt mit zu auf das untere.
  const istDoppelRaum = (raumId) => Boolean(K()?.RAEUME?.[raumId]?.doppel);
  const istDoppel = (s) => s?.art === "eins" && istDoppelRaum(s.zimmer?.[0]?.raum);
  // Wo die Wand eines Zimmers oben endet (Zimmer-Einheiten) und wie hoch es ist.
  const obenVon = (s) => (istDoppel(s) ? -GEO.STOCK : GEO.OBEN);
  const hoeheVon = (s) => GEO.H - obenVon(s);

  // ---------------------------------------------------------------------------
  // Aufräumen: was aus dem Speicher oder der Cloud kommt, in sichere Form
  // ---------------------------------------------------------------------------
  // oben: wo die Wand endet – GEO.OBEN, im KiddyDome -GEO.STOCK.
  // umrechnen: ein Zimmer aus einer Fassung vor 4 (240 hoch, oben y = 0) –
  // was an der Wand hängt, rückt anteilig auf die kürzere Wand, damit es
  // dort hängt, wo das Kind es hingehängt hat.
  function sauberesDing(roh, breite, oben = GEO.OBEN, umrechnen = false) {
    const d = obj(roh);
    const ding = M()?.DINGE?.[d.i];
    if (!ding) return null;
    const farbe = typeof d.c === "string" && K()?.FARBE?.[d.c] ? d.c : "";
    const s = zahl(d.s, 0.6, 1.6, 1);
    let x = zahl(d.x, 0, breite, breite / 2);
    let roheY = Number(d.y);
    if (umrechnen && ding.art === "wand" && oben === GEO.OBEN && Number.isFinite(roheY)) {
      roheY = GEO.OBEN + roheY * ((GEO.WAND_UNTEN - GEO.OBEN) / GEO.WAND_UNTEN);
    }
    let y = zahl(roheY, oben, GEO.H, GEO.STAND);
    if (ding.art === "decke") y = oben;
    if (ding.art === "flach") y = zahl(d.y, GEO.STAND_HINTEN, GEO.STAND_VORNE, GEO.STAND);
    // Was an der Wand hängt, hängt ganz an der Wand (wie beim Ziehen).
    if (ding.art === "wand" && M()?.umriss) {
      const u = M().umriss(d.i, s);
      const lo = oben - u.y0 + 4;
      const hi = GEO.WAND_UNTEN - u.y1 - 2;
      y = hi >= lo ? Math.min(hi, Math.max(lo, y)) : (lo + hi) / 2;
    }
    x = Math.round(x * 10) / 10;
    y = Math.round(y * 10) / 10;
    return { k: text(d.k, 16, kennung("d")), i: d.i, x, y, c: farbe, f: d.f ? 1 : 0, s: Math.round(s * 100) / 100 };
  }

  function sauberesZimmer(roh, breite, passt, oben = GEO.OBEN, umrechnen = false) {
    const z = obj(roh);
    const raum = K()?.RAEUME?.[z.raum];
    const gilt = Boolean(raum) && passt(raum);
    const farben = K()?.FARBE || {};
    const dinge = (Array.isArray(z.dinge) ? z.dinge : []).map((d) => sauberesDing(d, breite, oben, umrechnen)).filter(Boolean).slice(0, dingeMax(breite));
    // Eine Kennung je Ding, auch nach dem Zusammenführen zweier Stände.
    const gesehen = new Set();
    dinge.forEach((ding) => { if (gesehen.has(ding.k)) ding.k = kennung("d"); gesehen.add(ding.k); });
    setzeAufFlaechen(dinge);
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

  // Ein kleines Ding steht auf dem Boden oder auf einer Fläche (Tisch,
  // Regal, Theke). Seit die Dinge halb so gross sind (Oktober 2026), liegen die
  // Flächen tiefer – ein Ding von früher schwebte darüber. Es setzt sich auf
  // die nächste Fläche darunter, sonst auf den Boden. Steht es schon auf
  // einer, bleibt es, wo es ist: Zweimal aufräumen ändert nichts mehr.
  function setzeAufFlaechen(dinge) {
    const moebel = M();
    if (!moebel?.DINGE || !moebel.massVon) return;
    const flaechen = dinge.map((u) => {
      const ding = moebel.DINGE[u.i];
      if (!ding || ding.art !== "boden" || typeof ding.flaeche !== "number") return null;
      const k = moebel.massVon(u.i) * (u.s || 1);
      let [a, b] = ding.fx || [-ding.w / 2, ding.w / 2];
      if (u.f) [a, b] = [-b, -a];
      return { k: u.k, y: u.y + ding.flaeche * k, x0: u.x + a * k - 2, x1: u.x + b * k + 2 };
    }).filter(Boolean);
    dinge.forEach((d) => {
      const ding = moebel.DINGE[d.i];
      if (!ding?.klein || ding.art !== "boden" || d.y >= GEO.STAND_HINTEN - 2) return;
      const drunter = flaechen.filter((f) => f.k !== d.k && d.x >= f.x0 && d.x <= f.x1 && f.y >= d.y - 2.5);
      if (drunter.some((f) => Math.abs(f.y - d.y) < 2.5)) return;
      drunter.sort((p, q) => p.y - q.y);
      d.y = Math.round((drunter.length ? drunter[0].y : GEO.STAND) * 10) / 10;
    });
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

  function sauberesStockwerk(roh, hausId, index, umrechnen = false) {
    const s = obj(roh);
    // Im Wohnhaus: Wohnung, zwei Zimmer oder Rohbau; sonst ein Zimmer – oder
    // das obere Stockwerk eines KiddyDome.
    let art = ["wohnung", "zwei", "eins", "oben"].includes(s.art) ? s.art : "";
    if (hausId !== "wohnhaus") art = art === "oben" ? "oben" : "eins";
    else if (art === "eins" || art === "oben") art = "zwei";
    const roheZimmer = Array.isArray(s.zimmer) ? s.zimmer : [];
    const breite = art === "zwei" ? GEO.HALB : GEO.W;
    // Ein Zimmer über zwei Stockwerke nur, wo das Stockwerk ein ganzes Zimmer hat.
    const passt = (raum) => raum.haus === hausId && (art === "wohnung" ? Boolean(raum.wohnen) : !raum.wohnen) && (art === "eins" || !raum.doppel);
    const anzahl = art === "zwei" ? 2 : art === "wohnung" || art === "eins" ? 1 : 0;
    const raum0 = K()?.RAEUME?.[obj(roheZimmer[0]).raum];
    const oben = art === "eins" && raum0?.doppel && passt(raum0) ? -GEO.STOCK : GEO.OBEN;
    const zimmer = Array.from({ length: anzahl }, (_, i) => sauberesZimmer(roheZimmer[i], breite, passt, i === 0 ? oben : GEO.OBEN, umrechnen));
    const tiere = art === "wohnung" && zimmer[0].raum
      ? (Array.isArray(s.tiere) ? s.tiere : []).map(sauberesTier).filter(Boolean).slice(0, TIERE_MAX)
      : [];
    const seeds = new Set();
    tiere.forEach((t) => { if (seeds.has(t.seed)) t.seed = kennung("t"); seeds.add(t.seed); });
    const out = {
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
    if (art === "oben") out.zu = text(s.zu, 24, "");
    return out;
  }

  // Ein Zimmer über zwei Stockwerke hält zusammen: Gleich über dem unteren
  // Stockwerk steht das obere. Ein oberes ohne sein unteres wird wieder ein
  // leeres Stockwerk. Fehlt einem unteren das obere (zwei Geräte haben
  // gleichzeitig verschieden gebaut), kommt eines dazu – mit einer Kennung,
  // die auf jedem Gerät dieselbe ist. Die Reihenfolge sonst bleibt.
  function paare(stock) {
    const unten = new Set(stock.filter(istDoppel).map((s) => s.id));
    const partner = new Map();
    const rest = [];
    stock.forEach((s) => {
      if (s.art !== "oben") { rest.push(s); return; }
      if (unten.has(s.zu) && !partner.has(s.zu)) { partner.set(s.zu, s); return; }
      const { zu: _zu, ...frei } = s;
      rest.push({ ...frei, art: "eins", zimmer: [leeresZimmer("", s.at)] });
    });
    const out = [];
    rest.forEach((s) => {
      out.push(s);
      if (!istDoppel(s)) return;
      // Die Kennung bleibt kurz genug, dass sie das Aufräumen übersteht (24 Zeichen).
      out.push(partner.get(s.id) || { id: `${s.id.slice(0, 23)}^`, seit: s.seit, pos: s.pos, art: "oben", zimmer: [], tiere: [], zuzug: 0, tierWegArt: "", at: s.at, zu: s.id });
    });
    stock.splice(0, stock.length, ...out);
    return stock;
  }

  // Höchstens STOCK_MAX Stockwerke – ein KiddyDome ganz oben wird dabei nicht
  // halbiert (dann ist es eines mehr).
  function kappe(stock) {
    let n = Math.min(stock.length, STOCK_MAX);
    if (n > 0 && istDoppel(stock[n - 1]) && stock[n]?.art === "oben") n += 1;
    return stock.slice(0, n);
  }

  // Fassung 1: ein Zimmer je Stockwerk, ein Tier darin. Schlaf- und
  // Kinderzimmer werden Wohnungen (das Tier bleibt und bekommt die Wünsche
  // der neuen Fassung); die anderen Zimmer des Wohnhauses stehen links auf
  // einem Stockwerk für zwei – halb so breit, also rücken die Dinge zusammen.
  // In Spital, Dorf und Büro bleibt alles, wie es war (ohne Tier).
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
        } else if (raum && raum.haus === hausId && hausId === "wohnhaus") {
          const halb = { ...zimmer, dinge: (Array.isArray(s.dinge) ? s.dinge : []).map((d) => ({ ...d, x: (Number(d?.x) || 0) / 2 })) };
          andere.push({ id: s.id, seit: s.seit, art: "zwei", zimmer: [halb, {}], at: s.at });
        } else if (raum && raum.haus === hausId) {
          andere.push({ id: s.id, seit: s.seit, art: "eins", zimmer: [zimmer], at: s.at });
        } else if (s.seit) {
          // Ein gebautes, noch leeres Stockwerk: Es hat einen Ziegel gekostet.
          andere.push({ id: s.id, seit: s.seit, art: hausId === "wohnhaus" ? "" : "eins", zimmer: [], at: s.at });
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
    // Vor Fassung 4 waren die Zimmer 240 hoch: Wanddinge rechnen um.
    const umrechnen = (Number(r.v) || 0) < 4;
    if (Number(r.v) === 1) r = ausFassung1(r);
    const leer = leererStand();
    const out = { v: FORMAT, gewaehlt: HAUS_IDS.includes(r.gewaehlt) ? r.gewaehlt : "", haeuser: {} };
    HAUS_IDS.forEach((id) => {
      const h = obj(obj(r.haeuser)[id]);
      const farben = K()?.FARBE || {};
      let stock = (Array.isArray(h.stock) ? h.stock : []).slice(0, STOCK_MAX * 2).map((s, i) => sauberesStockwerk(s, id, i, umrechnen));
      // Eine Kennung je Stockwerk – das Zusammenführen hält sich an sie.
      const gesehen = new Set();
      stock.forEach((s) => {
        let n = 2;
        const basis = s.id;
        while (gesehen.has(s.id)) { s.id = `${basis}~${n}`; n += 1; }
        gesehen.add(s.id);
      });
      if (!stock.length) stock = leer.haeuser[id].stock;
      stock = kappe(paare(ordne(stock)));
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

  const hatInhalt = (s) => s.art === "oben" || s.zimmer.some((z) => z.raum || z.dinge.length) || s.tiere.length > 0;

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
    return kappe(paare(ordne(alle, platz)));
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
  // Überraschungen: der Blitzzug und der Glücksstern
  // ---------------------------------------------------------------------------
  // Etwa alle halbe Stunde rast ein Blitzzug mit einer Palette vorbei, und ein
  // Glücksstern versteckt sich im Dorf; wer sie antippt, bekommt die Palette.
  // Wann die nächsten kommen, merkt sich jedes Gerät für jedes Kind – wie das
  // Gezeigte der Lieferung, nicht im Kasten (keine neue Fassung). Die Palette
  // selbst geht wie ein gelöstes Rätsel an journey-plan.js (bauBonus) und
  // reist so mit dem Konto auf die anderen Geräte.
  const UEBERRASCHUNG_KEY = "lernapp.bau.ueberraschung";
  const UEBERRASCHUNG_MS = 30 * 60 * 1000;   // so oft ein Blitzzug, so oft ein Glücksstern
  const NOCHMAL_MS = 5 * 60 * 1000;          // ein verpasster Blitzzug kommt so bald wieder
  const ERSTER_ZUG_MS = 2 * 60 * 1000;       // beim ersten Besuch: bald der erste Zug …
  const ERSTER_STERN_MS = 4 * 60 * 1000;     // … und bald der erste Glücksstern
  function ueberraschungKarte() {
    try { return obj(JSON.parse(localStorage.getItem(UEBERRASCHUNG_KEY) || "{}")); } catch { return {}; }
  }
  function ueberraschung() { return obj(ueberraschungKarte()[besitzer]); }
  function merkeUeberraschung(teil) {
    const karte = ueberraschungKarte();
    karte[besitzer] = { ...obj(karte[besitzer]), ...teil };
    try { localStorage.setItem(UEBERRASCHUNG_KEY, JSON.stringify(karte)); } catch { /* privater Modus */ }
  }
  // Ist es Zeit? Beim allerersten Mal wird die Uhr erst gestellt.
  function faellig(was, erstes, jetzt) {
    const wann = Number(ueberraschung()[was]);
    if (!Number.isFinite(wann) || wann <= 0) { merkeUeberraschung({ [was]: jetzt + erstes }); return false; }
    return jetzt >= wann;
  }
  function blitzzugFaellig(jetzt = Date.now()) { return !neuere && faellig("zug", ERSTER_ZUG_MS, jetzt); }
  function blitzzugVorbei(gefangen, jetzt = Date.now()) { merkeUeberraschung({ zug: jetzt + (gefangen ? UEBERRASCHUNG_MS : NOCHMAL_MS) }); }
  function sternFaellig(jetzt = Date.now()) { return !neuere && faellig("stern", ERSTER_STERN_MS, jetzt); }
  function sternGefunden(jetzt = Date.now()) { merkeUeberraschung({ stern: jetzt + UEBERRASCHUNG_MS }); }

  // Eine Palette als Lohn. Die Lieferung soll sie nicht noch einmal bringen:
  // Sie gilt gleich als gezeigt (eine noch offene Lieferung bleibt offen).
  function bonusPalette() {
    if (neuere || typeof reise()?.bauBonus !== "function") return false;
    merkeGezeigt(gezeigt() + 1);
    reise().bauBonus();
    return true;
  }

  // Wo sich ein Glücksstern verstecken kann: in jedem Zimmer, das schon
  // etwas ist (beim KiddyDome im unteren Stockwerk).
  function sternVerstecke() {
    const liste = [];
    HAUS_IDS.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      if (s.art === "oben") return;
      s.zimmer.forEach((z, slot) => { if (z.raum) liste.push({ haus: hausId, index, slot, stockId: s.id }); });
    }));
    return liste;
  }

  // ---------------------------------------------------------------------------
  // Die Sternenleiter des Dorfs
  // ---------------------------------------------------------------------------
  // Alle Sterne aller Tiere zusammen. Auf der Leiter zählt der höchste Stand,
  // den das Dorf je hatte (je Gerät und Kind gemerkt): Was einmal erreicht
  // ist – der Brunnen, der Ballon … –, bleibt, auch wenn ein Wunsch wechselt.
  function dorfSterne() { return alleTiere().reduce((n, e) => n + sterne(e.tier.seed).anzahl, 0); }
  function sternenleiter() {
    const stufen = (K()?.LEITER || []).map((stufe) => stufe.sterne);
    const jetzt = dorfSterne();
    const gemerkt = Math.max(0, Math.floor(Number(ueberraschung().rekord) || 0));
    if (jetzt > gemerkt && !neuere) merkeUeberraschung({ rekord: jetzt });
    const rekord = Math.max(jetzt, gemerkt);
    const erreicht = stufen.filter((n) => n <= rekord).length;
    return { jetzt, rekord, erreicht, naechste: stufen[erreicht] ?? null, stufen };
  }

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
  // dort jemand wohnt (waehleArt); sonst hat es gleich ein leeres Zimmer.
  // ueber: gleich über diesem Stockwerk statt obendrauf (für den KiddyDome,
  // der zwei übereinander braucht) – die darüber rücken eins hinauf.
  function baueStockwerk(hausId, { ueber = -1 } = {}) {
    if (!kannBauen(hausId).ok) return -1;
    const h = haus(hausId);
    const jetzt = Date.now();
    const pos = h.stock.reduce((m, s) => Math.max(m, s.pos), -1) + 1;
    const neu = neuesStockwerk(hausId === "wohnhaus" ? "" : "eins", { seit: jetzt, pos, at: jetzt });
    let index = h.stock.length;
    if (ueber >= 0 && ueber < h.stock.length - 1) {
      // Über einem KiddyDome hinein ginge nicht: Er bleibt beisammen.
      index = istDoppel(h.stock[ueber]) ? ueber + 2 : ueber + 1;
      h.stock.splice(index, 0, neu);
      h.stock.forEach((s, i) => { if (s.pos !== i) { s.pos = i; s.at = jetzt; } });
    } else h.stock.push(neu);
    h.at = jetzt;
    speichern(true);
    melde("gebaut");
    return index;
  }

  // Wo ein Zimmer über zwei Stockwerke hinkann, wenn das Kind es für dieses
  // Stockwerk wählt: Es braucht ein freies Stockwerk gleich darüber – oder,
  // ist dieses noch ganz leer, eines gleich darunter. Zurück kommen die
  // beiden Stockwerke ({ unten, oben }) oder null.
  function doppelPlatz(hausId, index) {
    const h = haus(hausId);
    const s = h?.stock?.[index];
    if (!s || s.art !== "eins" || hausId === "wohnhaus") return null;
    if (istDoppel(s)) return { unten: index, oben: index + 1 };
    const frei = (x) => x?.art === "eins" && !x.zimmer[0]?.raum && !x.zimmer[0]?.dinge?.length;
    if (frei(h.stock[index + 1])) return { unten: index, oben: index + 1 };
    if (frei(s) && frei(h.stock[index - 1])) return { unten: index - 1, oben: index };
    return null;
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
    if (raum.doppel) return waehleDoppel(hausId, index, raumId);
    // Aus einem KiddyDome wird ein gewöhnliches Zimmer: Das obere Stockwerk
    // ist wieder frei, und was oben hing, kommt herunter.
    if (istDoppel(s)) gibObenFrei(hausId, index);
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

  // Der KiddyDome: Das untere Stockwerk bekommt das Zimmer, das obere wird
  // "oben". Geht es nicht (kein freies Stockwerk daneben), kommt null zurück
  // – die Ansicht sagt dann, dass es zwei Stockwerke braucht.
  function waehleDoppel(hausId, index, raumId) {
    const platz = doppelPlatz(hausId, index);
    if (!platz) return null;
    const raum = K().RAEUME[raumId];
    const h = haus(hausId);
    const u = h.stock[platz.unten];
    const o = h.stock[platz.oben];
    const jetzt = Date.now();
    // Stockwerke vom Anfang bekommen eine eigene Kennung (siehe mergeStock).
    if (istStartId(hausId, u.id)) u.id = kennung("s");
    if (istStartId(hausId, o.id)) o.id = kennung("s");
    const z = u.zimmer[0];
    if (!z.raum) {
      z.wand = raum.wand;
      z.muster = raum.muster || "keine";
      z.boden = raum.boden || "parkett";
      z.bodenFarbe = "";
    }
    z.raum = raumId;
    z.at = jetzt;
    u.at = jetzt;
    o.art = "oben";
    o.zu = u.id;
    o.zimmer = [];
    o.tiere = [];
    o.at = jetzt;
    paare(h.stock);
    speichern();
    melde("raum");
    return { unten: platz.unten, oben: platz.oben };
  }

  // Ein KiddyDome wird ein anderes Zimmer: Das obere Stockwerk ist wieder ein
  // leeres; was über der Decke des unteren stand oder hing, kommt herunter.
  function gibObenFrei(hausId, index) {
    const h = haus(hausId);
    const u = h.stock[index];
    const o = h.stock[index + 1];
    const jetzt = Date.now();
    if (o?.art === "oben" && o.zu === u.id) {
      delete o.zu;
      o.art = "eins";
      o.zimmer = [leeresZimmer("", jetzt)];
      o.at = jetzt;
    }
    const z = u.zimmer[0];
    z.dinge = z.dinge.map((d) => sauberesDing(d, GEO.W, GEO.OBEN)).filter(Boolean);
  }

  // Ein Stockwerk eins nach oben (+1) oder unten (-1): Es tauscht den Platz
  // mit dem Nachbarn – so kommt der Eingang nach unten. Ein KiddyDome wandert
  // mit beiden Stockwerken, und wer an ihm vorbeiwandert, springt über beide.
  // Zurück kommt, wo das Stockwerk jetzt steht.
  function verschiebe(hausId, index, richtung) {
    const h = haus(hausId);
    if (!h || !h.stock[index]) return index;
    const bloecke = [];
    for (let i = 0; i < h.stock.length; i += 1) {
      if (istDoppel(h.stock[i]) && h.stock[i + 1]?.art === "oben") { bloecke.push([h.stock[i], h.stock[i + 1]]); i += 1; }
      else bloecke.push([h.stock[i]]);
    }
    const wer = h.stock[index];
    const b = bloecke.findIndex((block) => block.includes(wer));
    const c = b + (richtung > 0 ? 1 : -1);
    if (b < 0 || c < 0 || c >= bloecke.length) return index;
    [bloecke[b], bloecke[c]] = [bloecke[c], bloecke[b]];
    const jetzt = Date.now();
    h.stock.splice(0, h.stock.length, ...bloecke.flat());
    // Ein Platz je Stockwerk, wie es jetzt steht (nach dem Zusammenführen
    // können zwei denselben gehabt haben).
    h.stock.forEach((s, i) => { if (s.pos !== i) { s.pos = i; s.at = jetzt; } });
    speichern();
    melde("ordnen");
    return h.stock.indexOf(wer);
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

  // Die Figuren aus den Büchern der Leseecke (bau-katalog.js, FIGUREN): Ein
  // Tier ist eine, wenn Art und Name stimmen – so ist auch ein Leo, der schon
  // früher eingezogen ist, Leo aus dem Buch.
  function figurVon(tier) {
    if (!tier) return null;
    return (K()?.FIGUREN || []).find((f) => f.a === tier.a && (f.n === tier.n || (f.auch || []).includes(tier.n))) || null;
  }
  // Was ein Tier besonders mag: eine Buchfigur, was sie im Buch mag, sonst
  // das ihrer Tierart.
  function magVon(tier) { return figurVon(tier)?.mag || K()?.TIERE?.[tier?.a]?.mag || { ding: "", farbe: "" }; }

  // Ein neues Tier. Zuerst ziehen die Figuren aus den Büchern ein, die noch
  // nirgends wohnen – die kennen die Kinder. Sonst eines, dessen Art in der
  // Wohnung und im Haus noch fehlt (und nicht die eben hinausgeschickte), mit
  // einem Namen, den noch keines trägt.
  function neuesTier(hausId, index, { im = null } = {}) {
    const katalog = K();
    const s = im || stock(hausId, index);
    const alle = alleTiere();
    const inWohnung = new Set(s.tiere.map((t) => t.a));
    const imHaus = new Set(alle.filter((e) => e.hausId === hausId).map((e) => e.tier.a));
    const namen = new Set(alle.map((e) => e.tier.n));
    const ausser = s.tierWegArt ? [s.tierWegArt] : [];
    // Am liebsten eine Art, die es in der Wohnung und im Haus noch nicht gibt.
    const besteArten = (liste) => {
      const neu = liste.filter((a) => !inWohnung.has(a));
      const ganzNeu = neu.filter((a) => !imHaus.has(a));
      return ganzNeu.length ? ganzNeu : neu.length ? neu : liste;
    };
    const wohnen = new Set(alle.map((e) => figurVon(e.tier)?.id).filter(Boolean));
    const figuren = (katalog.FIGUREN || []).filter((f) => katalog.TIERE[f.a] && !wohnen.has(f.id) && !namen.has(f.n) && !ausser.includes(f.a));
    let art;
    let name;
    if (figuren.length) {
      const arten = besteArten([...new Set(figuren.map((f) => f.a))]);
      const passend = figuren.filter((f) => arten.includes(f.a));
      const figur = passend[Math.floor(Math.random() * passend.length)];
      art = figur.a;
      name = figur.n;
    } else {
      let arten = besteArten(katalog.TIER_IDS.filter((a) => !ausser.includes(a)));
      if (!arten.length) arten = katalog.TIER_IDS.slice();
      art = arten[Math.floor(Math.random() * arten.length)];
      const freieNamen = katalog.TIERE[art].namen.filter((n) => !namen.has(n));
      const auswahl = freieNamen.length ? freieNamen : katalog.TIERE[art].namen;
      name = auswahl[Math.floor(Math.random() * auswahl.length)];
    }
    // Eine Buchfigur träumt vom Job aus ihrer Geschichte.
    const figurTraum = figurVon({ a: art, n: name })?.traum;
    const traum = figurTraum && alleJobs().includes(figurTraum) ? figurTraum : traumFuer();
    const tier = { a: art, n: name, seed: kennung("t"), seit: Date.now(), w: [], g: [], b: [], traum, wAt: Date.now(), neu: -1 };
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

  // Die gelben Wünsche für die Wohnung: eines ist das, was das Tier besonders
  // mag (ein Ding oder die Wandfarbe – eine Buchfigur, was sie im Buch mag),
  // das andere passt zur Zimmerart. Was ein Mitbewohner schon wünscht, kommt
  // nicht noch einmal.
  function gelbeWuensche(tier, raumId, mitbewohner = []) {
    const katalog = K();
    const raum = katalog.RAEUME[raumId];
    if (!raum) return { w: [] };
    const rnd = zufall(`${tier.seed}:${raumId}`);
    const schon = new Set(mitbewohner.flatMap((t) => t.w || []));
    const mag = magVon(tier);
    const ding = `ding:${mag.ding}`;
    const farbe = `farbe:${mag.farbe}`;
    let lieblings = rnd() < 0.5 ? ding : farbe;
    if (schon.has(lieblings)) lieblings = lieblings === ding ? farbe : ding;
    const gelb = [lieblings];
    const kandidaten = mische(raum.wuensche || [], rnd).map((t) => `ding:${t}`).filter((w) => w !== lieblings);
    gelb.push(kandidaten.find((w) => !schon.has(w)) || kandidaten[0]);
    return { w: gelb.filter(Boolean) };
  }

  // Alle Wünsche eines Tiers: zwei gelbe (Wohnung), ein grüner (Wohnhaus),
  // zwei blaue (die anderen Häuser). Eine Buchfigur wünscht sich zuerst das
  // Zimmer aus ihrer Geschichte.
  function wuenscheFuer(tier, raumId, mitbewohner = []) {
    const katalog = K();
    const rnd = zufall(`${tier.seed}:haus`);
    const gruen = ziehe(katalog.HAUS_WUENSCHE.wohnhaus || [], 1, rnd).map((r) => `raum:${r}`);
    const eigen = eigenerWunsch(tier);
    const blau = eigen ? [eigen] : [];
    const rest = (katalog.FREMD_WUENSCHE.wohnhaus || []).map((f) => `fremd:${f.haus}:${f.raum}`).filter((w) => w !== eigen);
    blau.push(...ziehe(rest, 2 - blau.length, rnd));
    return { ...gelbeWuensche(tier, raumId, mitbewohner), g: gruen, b: blau };
  }
  // Der blaue Wunsch einer Buchfigur, wenn es ihr Zimmer gibt.
  function eigenerWunsch(tier) {
    const w = figurVon(tier)?.wunsch;
    return w && K()?.RAEUME?.[w.raum]?.haus === w.haus && w.haus !== "wohnhaus" ? `fremd:${w.haus}:${w.raum}` : "";
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
  function beschreibe(wunsch, tier = null) {
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
      // Warum: eine Buchfigur sagt es mit ihrer Geschichte.
      const eigen = figurVon(tier)?.wunsch;
      const warum = (eigen?.haus === a && eigen.raum === b ? eigen.warum : "") || (katalog.FREMD_WUENSCHE.wohnhaus || []).find((f) => f.haus === a && f.raum === b)?.warum || "";
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
    t.w.forEach((w, i) => liste.push({ id: w, stern: "gelb", neu: t.neu === i, ...beschreibe(w, t), erfuellt: erfuellt(seed, w) }));
    t.g.forEach((w) => liste.push({ id: w, stern: "gruen", ...beschreibe(w, t), erfuellt: erfuellt(seed, w) }));
    t.b.forEach((w) => liste.push({ id: w, stern: "blau", ...beschreibe(w, t), erfuellt: erfuellt(seed, w) }));
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
  function hatTraumjob(seed) { return Boolean(jobVon(seed)?.traum); }

  // Wie viele Bewohner einer Wohnung ihren Traumjob haben (0 bis 3) – das
  // Stockwerk zeigt es von aussen, in drei Stufen.
  function traumjobsStock(hausId, index) {
    const st = stock(hausId, index);
    return (st?.tiere || []).filter((t) => hatTraumjob(t.seed)).length;
  }

  // Wer zu einem Zimmer in Spital, Dorf oder Büro gehört: wer hier seinen
  // Traumjob hat, und wer sich dieses Zimmer wünscht (ein blauer Wunsch). Wer
  // hier nur irgendeine Arbeit hat, gehört nicht dazu.
  function zimmerTiere(hausId, index, slot = 0) {
    const st = stock(hausId, index);
    const raumId = st?.zimmer?.[slot]?.raum;
    if (!raumId || !ARBEITS_HAEUSER.includes(hausId)) return [];
    const liste = [];
    alleTiere().forEach(({ tier }) => {
      const job = jobVon(tier.seed);
      const traumHier = Boolean(job?.traum && job.haus === hausId && job.stockId === st.id && job.slot === slot);
      const wunsch = tier.b.includes(`fremd:${hausId}:${raumId}`);
      if (traumHier || wunsch) liste.push({ tier, traumHier, wunsch });
    });
    // Die mit dem Traumjob zuerst, dann wer zuerst eingezogen ist.
    return liste.sort((a, b) => (Number(b.traumHier) - Number(a.traumHier)) || (a.tier.seit - b.tier.seit) || (a.tier.seed < b.tier.seed ? -1 : 1));
  }

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

  // Wohin die Tiere aus den Kinderzimmern am liebsten gehen: in jeden
  // KiddyDome (die Zimmer mit kinder im Katalog).
  function kinderZiele() {
    const liste = [];
    ARBEITS_HAEUSER.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      s.zimmer.forEach((z, slot) => { if (K()?.RAEUME?.[z.raum]?.kinder) liste.push({ haus: hausId, index, slot }); });
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
    const job = () => {
      const j = jobVon(seed);
      return j ? { wo: "arbeit", haus: j.haus, index: j.index, slot: j.slot } : daheim;
    };
    // Wer im Kinderzimmer wohnt, geht sehr oft in den KiddyDome – ganz
    // gleich, was es sich wünscht: gut jede dritte Viertelstunde am Tag.
    const dome = ref.stock.zimmer[0]?.raum === "kinderzimmer" ? kinderZiele() : [];
    if (dome.length) {
      if (wurf < 40) return daheim;
      if (wurf < 55) return job();
      if (wurf < 92) return { wo: "besuch", ...dome[hash(`${seed}:${nr}:dome`) % dome.length] };
    } else {
      if (wurf < 55) return daheim;
      if (wurf < 80) return job();
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
    normalize, merge, leererStand, neuereFassung: () => neuere, besitzer: () => besitzer, breiteVon, istDoppel, obenVon, hoeheVon,
    lesen, haus, stock, zimmer, raumVon, indexVon,
    verdient, verbaut, paletten, gezeigt, merkeGezeigt, neueLieferung,
    UEBERRASCHUNG_KEY, UEBERRASCHUNG_MS, NOCHMAL_MS, ueberraschung, blitzzugFaellig, blitzzugVorbei, sternFaellig, sternGefunden, bonusPalette, sternVerstecke,
    dorfSterne, sternenleiter,
    kannBauen, baueStockwerk, doppelPlatz, waehleArt, waehleRaum, verschiebe, setzeGewaehlt,
    aendereStock, aendereZimmer, aendereHaus, speichern,
    alleTiere, findeTier, figurVon, magVon, neuesTier, wuenscheFuer, zuzugFaellig, ziehtEin, hinausschicken,
    erfuellt, wuensche, sterne, sterneStock, laune, fortschritt, beschreibe,
    arbeitsplaetze, jobVon, hatTraumjob, traumjobsStock, zimmerTiere, jobText, aufenthalt, besucher, imRaum, woText,
    tick, onChange, kennung, hash,
  };
})();
