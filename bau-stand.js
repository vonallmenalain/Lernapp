/*
 * bau-stand.js – Der Stand der Bauecke: Häuser, Stockwerke, Zimmer, Dinge, Tiere.
 * ---------------------------------------------------------------------------
 * Ein Kasten je Konto (game-cloud.js, registerProKonto): angemeldet gehört er
 * dem Kind – auf dem Gerät und in der Cloud –, und meldet sich ein anderes
 * Kind an, kommt dessen Stand; nichts mischt sich. Ohne Anmeldung gilt ein
 * eigener Gast-Stand. "Fortschritt zurücksetzen" lässt ihn stehen.
 *
 *   {
 *     v: 6,                               // FORMAT – siehe unten
 *     gewaehlt: "spital",                 // mit welchem Haus das Kind begonnen hat
 *     volk: "tiere",                      // wer im Dorf wohnt: "tiere" oder "menschen"
 *     runde: 1,                           // das wievielte Dorf (Neustart zählt hoch)
 *     ziegelAb: 0,                        // Paletten, die einem früheren Dorf gehören
 *     rekord: 0,                          // die meisten Sterne, die dieses Dorf je hatte
 *     bonus: 0,                           // Sterne aus Spital, Hotel und Spielen
 *     warteliste: [{ a, n, seit }],       // gross gewordene Babys, die einziehen wollen
 *     bewertungen: [{ a, n, sterne, at }],// was die Feriengäste dem Hotel gaben
 *     ruhm: [{ nr, volk, sterne, bewohner, pokal, at, haeuser }],  // die früheren Dörfer
 *     album: { arten, figuren, jobs, raeume, dinge, gaeste, spiele, weh, babys, geheilt, gerettet },
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
 *                       w: [2], g: [1], b: [2], l: [1], // die Wünsche der Stufe, siehe unten
 *                       stufe: 1, fertig: 0,         // die Stufe (1 bis 3), alle geschafft
 *                       traum: "zentrum:bibliothek", // der Traumjob
 *                       baby: { a, n, seit },        // ein Baby, das mitwohnt
 *                       weh: { art, seit },          // ein Wehwehchen
 *                       wAt, neu }],
 *             gast,                        // Hotel: ein Feriengast { a, n, seed, kam, bis, w, ok }
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
 * wohnt; Spital, Dorf, Büro und Hotel ein Zimmer je Stockwerk – nur der
 * KiddyDome im Dorf ist so hoch wie zwei: Er gehört dem unteren Stockwerk, im
 * Zimmer reicht die Wand bis -GEO.STOCK hinauf, und das obere Stockwerk ist
 * frei. Statt Tieren können Menschen im Dorf wohnen (volk, beim Neustart
 * gewählt); im Code heissen alle Bewohner "tiere".
 *
 * Seit Oktober 2026 hat jeder Bewohner drei Stufen (Bronze, Silber, Gold).
 * Bronze: zwei gelbe Wünsche für die Wohnung, ein grüner für das Wohnhaus,
 * zwei blaue für die anderen Häuser und der Traumjob (sechs Sterne). Silber
 * und Gold bringen genaue Wünsche (eine Farbe, eine Anzahl, ein Ding neben
 * einem anderen), Wünsche an die Lage der Wohnung (lila) und Zimmer im Spital
 * und im Hotel. Ein Zimmer, das sich jemand wünscht, zählt erst, wenn darin
 * Platz ist: so viele Bewohner, wie es verschiedene passende Dinge hat.
 * Ob ein Wunsch erfüllt ist und wo ein Tier gerade arbeitet, wird jedes Mal
 * aus den Häusern ausgerechnet: Was das Kind wegräumt, ist auch nicht mehr
 * erfüllt. Nur eine geschaffte Stufe bleibt geschafft.
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
  // Fassung 5 erlaubt vierzig Stockwerke statt zwanzig (STOCK_MAX): Eine
  // ältere App schnitte die oberen beim Aufräumen ab. Ein Kasten der Fassung 4
  // gilt unverändert.
  // Fassung 6 bringt das Hotel (ein fünftes Haus, Feriengäste), Menschen,
  // seltene Tiere, die drei Stufen der Bewohner mit neuen Wunscharten, Babys,
  // Wehwehchen, den Neustart (runde, ruhm) und das Sammelalbum. Ein Bewohner
  // aus Fassung 5, dessen fünf Wünsche alle erfüllt sind, hat Bronze
  // geschafft (hebeAn) – so verliert niemand, was er schon hatte.
  const FORMAT = 6;

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

  // So hoch wird ein Haus höchstens. Seit Oktober 2026 vierzig statt zwanzig
  // (Rückmeldung: Im Dorf ging es nicht mehr weiter). Ganz ohne Grenze geht es
  // nicht: Der Kasten liegt im Kontodokument (1 MiB für alles) neben allen
  // Spielen – validate-bau.mjs rechnet nach, dass er auch voll hineinpasst.
  const STOCK_MAX = 40;
  const STOCK_OHNE_KAUF = 4;         // ohne Kauf: bis zum vierten Stockwerk
  const DINGE_MAX = 40;              // so viele Dinge passen in ein ganzes Zimmer
  const DINGE_MAX_HALB = 20;         // und in eines, halb so breit
  const TIERE_MAX = 3;               // so viele Tiere wohnen in einer Wohnung
  const ARBEIT_MAX = 3;              // so viele Tiere arbeiten im selben Zimmer
  const ZUZUG_MS = 10 * 60 * 1000;   // so lange, bis in eine Wohnung das nächste Tier zieht
  const TIER_KOMMT_MS = 40000;       // so bald kommt nach dem Hinausschicken ein neues
  const SLOT_MS = 15 * 60 * 1000;    // in Viertelstunden: wo ein Tier gerade ist
  const PLATZ_MAX = 12;              // so viele Bewohner braucht ein Zimmer höchstens
  const BABY_MS = 2 * 24 * 3600 * 1000;   // so lange bleibt ein Baby ein Baby
  const WEH_MS = 24 * 3600 * 1000;        // so lange dauert ein Wehwehchen höchstens
  const GAST_MS = 20 * 3600 * 1000;       // so lange bleibt ein Feriengast höchstens
  const GAST_FROH_MS = 90 * 1000;         // ein ganz zufriedener Gast reist bald ab
  const TRAGEN_MS = 10 * 60 * 1000;       // so lange bleibt ein getragenes Tier, wo es ist
  const HAUS_IDS = ["wohnhaus", "spital", "zentrum", "buero", "hotel"];
  const ARBEITS_HAEUSER = ["spital", "zentrum", "buero", "hotel"];
  // Womit ein Haus beginnt: das Wohnhaus mit drei leeren Wohnungen, die
  // anderen mit einem leeren Zimmer.
  const START = { wohnhaus: 3, spital: 1, zentrum: 1, buero: 1, hotel: 1 };
  const ALBUM_LISTEN = ["arten", "figuren", "jobs", "raeume", "dinge", "gaeste", "spiele", "weh"];
  const ALBUM_ZAHLEN = ["babys", "geheilt", "gerettet"];

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

  function leeresAlbum() {
    const album = {};
    ALBUM_LISTEN.forEach((k) => { album[k] = []; });
    ALBUM_ZAHLEN.forEach((k) => { album[k] = 0; });
    return album;
  }

  function leererStand() {
    const haeuser = {};
    HAUS_IDS.forEach((id) => {
      const haus = K()?.HAUS?.[id] || {};
      haeuser[id] = { fassade: haus.fassade || "weiss", dach: haus.dach || "rot", at: 0, stock: startStockwerke(id) };
    });
    return { v: FORMAT, gewaehlt: "", volk: "tiere", runde: 1, ziegelAb: 0, rekord: 0, bonus: 0, warteliste: [], bewertungen: [], ruhm: [], album: leeresAlbum(), haeuser };
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

  const liste = (wert, n) => (Array.isArray(wert) ? wert.filter((w) => typeof w === "string" && w.length < 80).slice(0, n) : []);
  function sauberesTier(roh) {
    const t = obj(roh);
    const art = K()?.TIERE?.[t.a];
    if (!art) return null;
    const traum = typeof t.traum === "string" && K()?.RAEUME?.[t.traum.split(":")[1]]?.job ? t.traum : "";
    // Die Stufe: 1 bis 3. Ein Tier aus Fassung 5 hat noch keine (0) – hebeAn
    // stuft es ein, sobald der ganze Stand da ist.
    // Die 0 bleibt beim zweiten Aufräumen eine 0 (sonst wäre normalize nicht
    // wiederholbar).
    const stufe = t.stufe === undefined || Number(t.stufe) === 0 ? 0 : zahl(t.stufe, 1, 3, 1);
    const out = {
      a: t.a,
      n: text(t.n, 24, art.namen[0]),
      seed: text(t.seed, 24, kennung("t")),
      seit: Number(t.seit) || 0,
      w: liste(t.w, 2),
      g: liste(t.g, 1),
      b: liste(t.b, 2),
      l: liste(t.l, 1),
      stufe,
      fertig: t.fertig ? 1 : 0,
      traum,
      wAt: Number(t.wAt) || 0,
      neu: Number.isInteger(t.neu) ? t.neu : -1,
    };
    const baby = obj(t.baby);
    if (K()?.TIERE?.[baby.a] || String(baby.a) === "m_baby") {
      out.baby = { a: baby.a, n: text(baby.n, 24, "Baby"), seit: Number(baby.seit) || 0, w: liste(baby.w, 3) };
    }
    const weh = obj(t.weh);
    if (K()?.WEH?.[weh.art]) out.weh = { art: weh.art, seit: Number(weh.seit) || 0 };
    return out;
  }

  // Ein Feriengast im Hotel (in einem Gästezimmer, einem Familienzimmer oder
  // der Suite).
  function sauberGast(roh) {
    const g = obj(roh);
    if (!K()?.TIERE?.[g.a]) return null;
    return {
      a: g.a,
      n: text(g.n, 24, K().TIERE[g.a].namen[0]),
      seed: text(g.seed, 24, kennung("g")),
      kam: Number(g.kam) || 0,
      bis: Number(g.bis) || 0,
      w: liste(g.w, 6),
      ok: Number(g.ok) || 0,
    };
  }

  // Wünschen sich zwei Tiere einer Wohnung verschiedene Wandfarben, lässt
  // sich nie beides erfüllen (bis Oktober 2026 kam das vor). Dann behält eines
  // den Wunsch – das, dessen Farbe schon an der Wand ist, sonst das erste –,
  // die anderen wünschen sich ihre Farbe für den Boden; und wo auch dort zwei
  // verschiedene stünden, ihr Lieblingsding. Gleich auf jedem Gerät.
  function eineFarbeJeWohnung(tiere, z) {
    const familie = (id) => K()?.FARBE?.[id]?.familie || "";
    for (const [typ, feld] of [["farbe", "wand"], ["boden", "bodenFarbe"]]) {
      const mit = tiere.filter((t) => t.w.some((w) => w.startsWith(`${typ}:`)));
      const farben = new Set(mit.map((t) => t.w.find((w) => w.startsWith(`${typ}:`))));
      if (farben.size < 2) continue;
      const da = `${typ}:${familie(z?.[feld])}`;
      const bleibt = mit.find((t) => t.w.includes(da)) || mit[0];
      const behalten = bleibt.w.find((w) => w.startsWith(`${typ}:`));
      mit.forEach((t) => {
        const alt = t.w.find((w) => w.startsWith(`${typ}:`));
        if (alt === behalten) return;
        const fam = alt.split(":")[1];
        const ding = `ding:${magVon(t).ding}`;
        const neu = typ === "farbe" ? `boden:${fam}` : ding;
        t.w = t.w.map((w) => (w === alt ? (t.w.includes(neu) || !neu.split(":")[1] ? "" : neu) : w)).filter(Boolean);
      });
    }
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
    if (tiere.length > 1) eineFarbeJeWohnung(tiere, zimmer[0]);
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
    if (hausId === "hotel" && K()?.RAEUME?.[zimmer[0]?.raum]?.gast) {
      const gast = sauberGast(s.gast);
      if (gast) out.gast = gast;
    }
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
          const tiere = K()?.TIERE?.[s.tier?.a] ? [{ ...s.tier, ...wuenscheFuer(s.tier, s.raum, []), stufe: 1, traum: traumAus(String(s.tier.seed)) }] : [];
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

  // Das Sammelalbum: Listen von Kennungen und ein paar Zahlen.
  function sauberesAlbum(roh) {
    const a = obj(roh);
    const album = leeresAlbum();
    ALBUM_LISTEN.forEach((k) => {
      album[k] = [...new Set((Array.isArray(a[k]) ? a[k] : []).filter((x) => typeof x === "string" && x.length < 40))].slice(0, 2000);
    });
    ALBUM_ZAHLEN.forEach((k) => { album[k] = Math.max(0, Math.floor(Number(a[k]) || 0)); });
    return album;
  }
  // Ein früheres Dorf in der Ruhmeshalle.
  function sauberRuhm(roh) {
    const r = obj(roh);
    const nr = Math.floor(Number(r.nr));
    if (!(nr >= 1)) return null;
    const haeuser = {};
    HAUS_IDS.forEach((id) => {
      const h = obj(obj(r.haeuser)[id]);
      haeuser[id] = { stockwerke: zahl(h.stockwerke, 0, STOCK_MAX * 2, 0), eingerichtet: zahl(h.eingerichtet, 0, STOCK_MAX * 2, 0), fassade: K()?.FARBE?.[h.fassade] ? h.fassade : "", dach: K()?.FARBE?.[h.dach] ? h.dach : "" };
    });
    return {
      nr,
      volk: r.volk === "menschen" ? "menschen" : "tiere",
      sterne: zahl(r.sterne, 0, 100000, 0),
      bewohner: zahl(r.bewohner, 0, 1000, 0),
      pokal: (K()?.POKALE || []).some((p) => p.id === r.pokal) ? r.pokal : "",
      at: Number(r.at) || 0,
      haeuser,
    };
  }

  function normalize(roh) {
    let r = obj(roh);
    // Vor Fassung 4 waren die Zimmer 240 hoch: Wanddinge rechnen um.
    const umrechnen = (Number(r.v) || 0) < 4;
    if (Number(r.v) === 1) r = ausFassung1(r);
    const leer = leererStand();
    const out = {
      v: FORMAT,
      gewaehlt: HAUS_IDS.includes(r.gewaehlt) ? r.gewaehlt : "",
      volk: r.volk === "menschen" ? "menschen" : "tiere",
      runde: zahl(r.runde, 1, 100000, 1),
      ziegelAb: Math.round(zahl(r.ziegelAb, -1000, 1000000, 0)),
      rekord: Math.floor(zahl(r.rekord, 0, 1000000, 0)),
      bonus: Math.floor(zahl(r.bonus, 0, 1000000, 0)),
      warteliste: (Array.isArray(r.warteliste) ? r.warteliste : []).map((w) => obj(w)).filter((w) => K()?.TIERE?.[w.a]).slice(0, 6)
        .map((w) => ({ a: w.a, n: text(w.n, 24, K().TIERE[w.a].namen[0]), seit: Number(w.seit) || 0 })),
      bewertungen: (Array.isArray(r.bewertungen) ? r.bewertungen : []).map((b) => obj(b)).filter((b) => K()?.TIERE?.[b.a]).slice(-12)
        .map((b) => ({ a: b.a, n: text(b.n, 24, ""), sterne: zahl(b.sterne, 1, 5, 3), at: Number(b.at) || 0 })),
      ruhm: (Array.isArray(r.ruhm) ? r.ruhm : []).map(sauberRuhm).filter(Boolean).sort((a, b) => a.nr - b.nr)
        .filter((x, i, alle) => !i || alle[i - 1].nr !== x.nr).slice(-100),
      album: sauberesAlbum(r.album),
      haeuser: {},
    };
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
    // Was über ein Dorf hinaus bleibt: das Album und die Ruhmeshalle – von
    // beiden Seiten alles.
    const album = albumVereint(A.album, B.album);
    const ruhm = [...A.ruhm, ...B.ruhm.filter((x) => !A.ruhm.some((y) => y.nr === x.nr))].sort((x, y) => x.nr - y.nr);
    // Ein Gerät hat schon ein neues Dorf gegründet: Das alte Dorf kommt nicht
    // zurück – es gilt die höhere Runde, ganz.
    if (A.runde !== B.runde) {
      const neu = clone(A.runde > B.runde ? A : B);
      return { ...neu, album, ruhm };
    }
    const out = {
      v: FORMAT,
      gewaehlt: A.gewaehlt || B.gewaehlt,
      volk: A.volk,
      runde: A.runde,
      ziegelAb: Math.max(A.ziegelAb, B.ziegelAb),
      rekord: Math.max(A.rekord, B.rekord),
      bonus: Math.max(A.bonus, B.bonus),
      warteliste: (A.warteliste.length >= B.warteliste.length ? A : B).warteliste,
      bewertungen: [...A.bewertungen, ...B.bewertungen.filter((x) => !A.bewertungen.some((y) => y.at === x.at && y.n === x.n))].sort((x, y) => x.at - y.at).slice(-12),
      ruhm,
      album,
      haeuser: {},
    };
    if (A.volk !== B.volk) out.volk = A.volk < B.volk ? A.volk : B.volk;
    if (A.gewaehlt && B.gewaehlt && A.gewaehlt !== B.gewaehlt) out.gewaehlt = A.gewaehlt < B.gewaehlt ? A.gewaehlt : B.gewaehlt;
    HAUS_IDS.forEach((id) => {
      const ha = A.haeuser[id];
      const hb = B.haeuser[id];
      const kopf = neuer({ at: ha.at, fassade: ha.fassade, dach: ha.dach }, { at: hb.at, fassade: hb.fassade, dach: hb.dach });
      out.haeuser[id] = { fassade: kopf.fassade, dach: kopf.dach, at: kopf.at, stock: mergeStock(id, ha.stock, hb.stock) };
    });
    return out;
  }

  function albumVereint(a, b) {
    const album = leeresAlbum();
    ALBUM_LISTEN.forEach((k) => { album[k] = [...new Set([...(a?.[k] || []), ...(b?.[k] || [])])]; });
    ALBUM_ZAHLEN.forEach((k) => { album[k] = Math.max(Number(a?.[k]) || 0, Number(b?.[k]) || 0); });
    return album;
  }

  // Ob sich ein Gast-Stand für ein neues Konto lohnt: Ist schon etwas gebaut?
  function istLeer(roh) {
    if (zuNeu(roh)) return true;
    const s = normalize(roh);
    if (s.runde > 1 || s.ruhm.length) return false;
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
    // Über eine Kopie: Wer sich beim Zuhören neu anmeldet (die Bauecke zeichnet
    // sich nach einem Neustart neu), käme sonst gleich noch einmal dran – ohne
    // Ende.
    [...zuhoerer].forEach((fn) => { try { fn(grund); } catch { /* ein Zuhörer hält die anderen nicht auf */ } });
    if (grund !== "konto" && grund !== "neuer") sammleBald();
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
      if (hebeAn()) speichern();
      melde("konto");
      return;
    }
    if (zuNeu(data)) {
      if (!neuere) { neuere = true; melde("neuer"); }
      return;
    }
    const vorher = JSON.stringify(stand);
    const rundeVorher = stand.runde;
    stand = merge(stand, data);
    hebeAn();
    if (stand.runde !== rundeVorher) { melde("neustart"); return; }
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
  // Was ein früheres Dorf verbaut hat, gehört ihm (ziegelAb, beim Neustart
  // gesetzt – unverbaute Paletten und das Geschenk des Pokals kommen mit).
  function paletten() { return Math.max(0, verdient() - (Number(stand.ziegelAb) || 0) - verbaut()); }

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
  // Seit Oktober 2026 genauso: der Rettungshelikopter, die Wehwehchen, die
  // Babys und die Feriengäste – wann sie kommen, weiss jedes Gerät für sich.
  const ERSTER_HELI_MS = 7 * 60 * 1000;
  const ERSTES_WEH_MS = 5 * 60 * 1000;
  const WEH_PAUSE_MS = 25 * 60 * 1000;
  const ERSTES_BABY_MS = 8 * 60 * 1000;
  const BABY_PAUSE_MS = 40 * 60 * 1000;
  const ERSTER_GAST_MS = 2 * 60 * 1000;
  const GAST_PAUSE_MS = 12 * 60 * 1000;
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
  // Dazu zählen die Wünsche der Babys und die Sterne aus Spital, Hotel und
  // den Spielen (bonus). Der höchste Stand steht seit Fassung 6 im Kasten
  // (rekord) und gilt so auf allen Geräten; was ein Gerät von früher weiss
  // (lernapp.bau.ueberraschung), zählt für das erste Dorf mit.
  function dorfSterne() {
    return alleTiere().reduce((n, e) => n + sterne(e.tier.seed).anzahl + babyWuensche(e.tier.seed).filter((w) => w.erfuellt).length, 0) + (Number(stand.bonus) || 0);
  }
  function sternenleiter() {
    const stufen = (K()?.LEITER || []).map((stufe) => stufe.sterne);
    const jetzt = dorfSterne();
    const u = ueberraschung();
    const lokal = (Number(u.rekordRunde) || 1) === stand.runde ? Math.max(0, Math.floor(Number(u.rekord) || 0)) : 0;
    if (jetzt > (stand.rekord || 0) && !neuere) { stand.rekord = jetzt; speichern(); }
    const rekord = Math.max(jetzt, stand.rekord || 0, lokal);
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
        const mit = st.tiere.filter((_, j) => j < i);
        if ((tier.stufe || 1) <= 1) Object.assign(tier, gelbeWuensche(tier, raumId, mit));
        else tier.w = gelbFuerStufe(tier, tier.stufe, raumId, mit);
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
  // Was ein Bewohner besonders mag: eine Buchfigur, was sie im Buch mag; ein
  // Mensch, was zu ihm passt (aus magListe, auf jedem Gerät gleich); sonst das
  // seiner Tierart.
  function magVon(tier) {
    const figur = figurVon(tier);
    if (figur) return figur.mag;
    const art = K()?.TIERE?.[tier?.a];
    if (art?.mensch) {
      const liste = art.magListe || [];
      const farben = K().MENSCH_FARBEN || [];
      return {
        ding: liste[hash(`${tier.seed}:mag`) % Math.max(1, liste.length)] || "",
        farbe: farben[hash(`${tier.seed}:farbe`) % Math.max(1, farben.length)] || "",
      };
    }
    return art?.mag || { ding: "", farbe: "" };
  }
  const istMensch = (tier) => Boolean(K()?.TIERE?.[tier?.a]?.mensch);
  function volk() { return stand.volk === "menschen" ? "menschen" : "tiere"; }

  // Ein seltenes Tier zieht nur ein, wenn das Dorf hat, was es braucht
  // (bau-katalog.js, TIERE.selten).
  function seltenDa(art) {
    const bedingung = K()?.TIERE?.[art]?.selten;
    if (bedingung === "hoch") return (stand.haeuser.wohnhaus?.stock?.length || 0) >= 10;
    if (bedingung === "hallenbad") return zimmerIn("zentrum", "hallenbad");
    if (bedingung === "keller") return zimmerIn("wohnhaus", "keller");
    if (bedingung === "musik") return zimmerIn("zentrum", "musik");
    if (bedingung === "wellness") return zimmerIn("hotel", "wellness");
    return false;
  }

  // Ein neuer Bewohner. Zuerst ein gross gewordenes Baby, das eine eigene
  // Wohnung sucht. Im Dorf der Menschen ein Mensch – ins Kinderzimmer vor
  // allem Kinder. Bei den Tieren zuerst die Figuren aus den Büchern, die noch
  // nirgends wohnen (die kennen die Kinder); dann ab und zu ein seltenes Tier,
  // wenn das Dorf hat, was es braucht; sonst eines, dessen Art in der Wohnung
  // und im Haus noch fehlt (und nicht die eben hinausgeschickte), mit einem
  // Namen, den noch keines trägt.
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
    const freierName = (art) => {
      const freie = katalog.TIERE[art].namen.filter((n) => !namen.has(n));
      const auswahl = freie.length ? freie : katalog.TIERE[art].namen;
      return auswahl[Math.floor(Math.random() * auswahl.length)];
    };
    let art;
    let name;
    const menschen = volk() === "menschen";
    const wartet = (stand.warteliste || []).findIndex((w) => katalog.TIERE[w.a] && Boolean(katalog.TIERE[w.a].mensch) === menschen);
    if (wartet >= 0) {
      const [w] = stand.warteliste.splice(wartet, 1);
      art = w.a;
      name = w.n;
    } else if (menschen) {
      const kinder = s.zimmer[0]?.raum === "kinderzimmer";
      const gewicht = { kind: kinder ? 6 : 1, gross: kinder ? 2 : 5, alt: kinder ? 1 : 2 };
      const arten = besteArten(katalog.MENSCH_IDS).flatMap((id) => Array(gewicht[katalog.TIERE[id].alter] || 1).fill(id));
      art = arten[Math.floor(Math.random() * arten.length)];
      name = freierName(art);
    } else {
      const wohnen = new Set(alle.map((e) => figurVon(e.tier)?.id).filter(Boolean));
      const figuren = (katalog.FIGUREN || []).filter((f) => katalog.TIERE[f.a] && !wohnen.has(f.id) && !namen.has(f.n) && !ausser.includes(f.a));
      const selten = (katalog.SELTEN_IDS || []).filter((a) => seltenDa(a) && !alle.some((e) => e.tier.a === a) && !ausser.includes(a));
      if (figuren.length) {
        const arten = besteArten([...new Set(figuren.map((f) => f.a))]);
        const passend = figuren.filter((f) => arten.includes(f.a));
        const figur = passend[Math.floor(Math.random() * passend.length)];
        art = figur.a;
        name = figur.n;
      } else if (selten.length && Math.random() < 0.35) {
        art = selten[Math.floor(Math.random() * selten.length)];
        name = freierName(art);
      } else {
        let arten = besteArten(katalog.TIER_IDS.filter((a) => !ausser.includes(a)));
        if (!arten.length) arten = katalog.TIER_IDS.slice();
        art = arten[Math.floor(Math.random() * arten.length)];
        name = freierName(art);
      }
    }
    // Eine Buchfigur träumt vom Job aus ihrer Geschichte.
    const figurTraum = figurVon({ a: art, n: name })?.traum;
    const traum = figurTraum && alleJobs().includes(figurTraum) ? figurTraum : traumFuer();
    const tier = { a: art, n: name, seed: kennung("t"), seit: Date.now(), w: [], g: [], b: [], l: [], stufe: 1, fertig: 0, traum, wAt: Date.now(), neu: -1 };
    Object.assign(tier, wuenscheStufe(tier, 1, s.zimmer[0]?.raum, s.tiere));
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

  // ---------------------------------------------------------------------------
  // Wünsche ausdenken
  // ---------------------------------------------------------------------------
  // Was in der Schublade eines Zimmers liegt, mit den Dingen für überall.
  function schublade(raumId) {
    const ids = [...(K()?.dingeFuer?.(raumId) || []), ...(M()?.UEBERALL || [])];
    return ids.map((id) => M()?.DINGE?.[id]).filter(Boolean);
  }
  const mitTag = (dinge, tag) => dinge.filter((d) => d.tags?.includes(tag));
  const zieheEins = (liste, rnd) => (liste.length ? liste[Math.floor(rnd() * liste.length)] : "");

  // Ob sich zwei Dinge so stellen lassen, wie es ein Wunsch will: auf (ein
  // kleines Ding auf die Fläche des anderen), über (was an der Wand hängt,
  // über etwas, das steht), neben (zwei Dinge auf dem Boden).
  function ortMoeglich(raumId, [a, rel, b]) {
    const dinge = schublade(raumId);
    const da = mitTag(dinge, a);
    const dort = mitTag(dinge, b);
    if (!da.length || !dort.length || !K()?.DING_WUENSCHE?.[a] || !K()?.DING_WUENSCHE?.[b]) return false;
    if (rel === "auf") return da.some((d) => d.klein && d.art === "boden") && dort.some((d) => typeof d.flaeche === "number" && d.art === "boden");
    if (rel === "ueber") return da.some((d) => d.art === "wand") && dort.some((d) => d.art === "boden");
    return da.some((d) => d.art === "boden") && dort.some((d) => d.art === "boden");
  }

  // Ein genauer Wunsch: eine Farbe (farbig), eine Anzahl (anzahl) oder ein
  // Ort (ort). tags: woraus gewählt wird (sonst die Wünsche der Zimmerart),
  // orte: welche Orte in Frage kommen. Was schon gewünscht ist (schon), kommt
  // nicht noch einmal.
  function genauerWunsch(art, raumId, rnd, schon, { tags = null, orte = null } = {}) {
    const frei = (w) => w && !schon.has(w);
    if (art === "ort") {
      const kandidaten = (orte || K()?.ORT_WUENSCHE?.[raumId] || []).filter((o) => ortMoeglich(raumId, o)).map((o) => `ort:${o.join(":")}`);
      return mische(kandidaten, rnd).find(frei) || "";
    }
    const dinge = schublade(raumId);
    const liste = (tags || K()?.RAEUME?.[raumId]?.wuensche || []).filter((t) => K()?.DING_WUENSCHE?.[t] && mitTag(dinge, t).length);
    if (art === "farbig") {
      const familien = Object.keys(K().FAMILIEN);
      return mische(liste.filter((t) => mitTag(dinge, t).some((d) => d.farbe)), rnd).map((t) => `farbig:${t}:${zieheEins(familien, rnd)}`).find(frei) || "";
    }
    // Mehrere davon: nur, was klein ist oder an der Wand hängt – drei Kissen
    // ja, drei Betten nein.
    if (art === "anzahl") return mische(liste.filter((t) => mitTag(dinge, t).some((d) => d.klein || d.art === "wand" || d.w <= 70)), rnd).map((t) => `anzahl:${t}:${2 + Math.floor(rnd() * 2)}`).find(frei) || "";
    return "";
  }

  // Die Jahreszeit: bau-wetter.js weiss sie, sonst der Monat.
  function jahreszeit(jetzt = Date.now()) {
    const zeit = window.LernappBauWetter?.heute?.(new Date(jetzt))?.jahreszeit;
    if (K()?.JAHRESZEITEN?.[zeit]) return zeit;
    const m = new Date(jetzt).getMonth();
    return m <= 1 || m === 11 ? "winter" : m <= 4 ? "fruehling" : m <= 7 ? "sommer" : "herbst";
  }
  // Ein Wunsch nach einem Ding der Jahreszeit (die Schublade «Jahreszeit»).
  function zeitWunsch(rnd, schon, jetzt = Date.now()) {
    const zeit = jahreszeit(jetzt);
    const tags = (M()?.SAISON?.[zeit] || []).map((id) => M().DINGE[id]?.tags?.[0]).filter((t) => t && K()?.DING_WUENSCHE?.[t]);
    return mische([...new Set(tags)], rnd).map((t) => `zeit:${t}:${zeit}`).find((w) => !schon.has(w)) || "";
  }

  // Ein blauer Wunsch: zuerst das Haus (FREMD_GEWICHT, oder haus), dann ein
  // Zimmer dort. ohne: Häuser, in die schon ein Wunsch geht.
  function blauerWunsch(rnd, schon, { haus = "", ohne = [] } = {}) {
    const katalog = K();
    const alle = (katalog.FREMD_WUENSCHE.wohnhaus || []).map((f) => ({ ...f, id: `fremd:${f.haus}:${f.raum}` }))
      .filter((f) => !schon.has(f.id) && katalog.RAEUME[f.raum]?.haus === f.haus);
    if (!alle.length) return "";
    let h = haus;
    if (!h) {
      const gewichte = Object.entries(katalog.FREMD_GEWICHT || {}).filter(([id]) => !ohne.includes(id) && alle.some((f) => f.haus === id));
      let r = rnd() * gewichte.reduce((n, [, g]) => n + g, 0);
      h = gewichte.find(([, g]) => (r -= g) < 0)?.[0] || gewichte[0]?.[0] || "";
    }
    const imHaus = alle.filter((f) => f.haus === h);
    return (imHaus.length ? zieheEins(imHaus, rnd) : zieheEins(alle, rnd)).id;
  }

  // Ein Wunsch an die Lage der Wohnung (lila): ganz oben, unten, ruhig oder
  // ein Zimmer gleich daneben. ohne: was es schon war.
  function stockWunsch(tier, raumId, rnd, ohne = []) {
    const katalog = K();
    const vorliebe = katalog.LAGE_VORLIEBE || {};
    const kandidaten = [];
    if ((vorliebe.oben || []).includes(tier.a)) kandidaten.push("stock:oben");
    if ((vorliebe.unten || []).includes(tier.a)) kandidaten.push("stock:unten");
    if (raumId !== "kinderzimmer") kandidaten.push("stock:ruhig");
    mische(katalog.LAGE_RAEUME || [], rnd).slice(0, 2).forEach((r) => kandidaten.push(`stock:neben:${r}`));
    return mische(kandidaten.filter((k) => !ohne.includes(k)), rnd)[0] || "stock:neben:kueche";
  }
  // Ein Freund in einer anderen Wohnung – auf jedem Gerät derselbe.
  function freundWunsch(tier) {
    const andere = alleTiere().filter((e) => e.hausId === "wohnhaus" && e.tier.seed !== tier.seed && !e.stock.tiere.some((t) => t.seed === tier.seed));
    if (!andere.length) return "";
    andere.sort((x, y) => hash(`${tier.seed}:${x.tier.seed}`) - hash(`${tier.seed}:${y.tier.seed}`));
    return `freund:${andere[0].tier.seed}`;
  }

  // Die gelben Wünsche für Bronze: eines ist das, was das Tier besonders mag
  // (ein Ding oder die Wandfarbe – eine Buchfigur, was sie im Buch mag), das
  // andere passt zur Zimmerart und soll oft eine bestimmte Farbe haben. Was
  // ein Mitbewohner schon wünscht, kommt nicht noch einmal. Höchstens ein Tier
  // je Wohnung wünscht sich eine Wandfarbe und höchstens eines eine
  // Bodenfarbe: Zwei verschiedene liessen sich nie zugleich erfüllen. Wer
  // danach kommt, wünscht sich seine Farbe für den Boden – oder sein
  // Lieblingsding.
  function gelbeWuensche(tier, raumId, mitbewohner = []) {
    const katalog = K();
    const raum = katalog.RAEUME[raumId];
    if (!raum) return { w: [] };
    const rnd = zufall(`${tier.seed}:${raumId}`);
    const schon = new Set(mitbewohner.flatMap((t) => t.w || []));
    const mag = magVon(tier);
    const ding = `ding:${mag.ding}`;
    const farbe = `farbe:${mag.farbe}`;
    const boden = `boden:${mag.farbe}`;
    const vergeben = (typ) => [...schon].some((w) => w.startsWith(`${typ}:`));
    let lieblings = rnd() < 0.5 ? ding : farbe;
    if (lieblings === farbe && vergeben("farbe")) lieblings = vergeben("boden") ? ding : boden;
    if (schon.has(lieblings) && lieblings === ding) lieblings = !vergeben("farbe") ? farbe : !vergeben("boden") ? boden : ding;
    const gelb = [lieblings];
    const kandidaten = mische(raum.wuensche || [], rnd).map((t) => `ding:${t}`).filter((w) => w !== lieblings);
    let zweiter = kandidaten.find((w) => !schon.has(w)) || kandidaten[0];
    // Seit Oktober 2026 schwerer: Oft soll das Ding eine bestimmte Farbe haben.
    if (zweiter && rnd() < 0.5) {
      const tag = zweiter.split(":")[1];
      if (schublade(raumId).some((d) => d.tags?.includes(tag) && d.farbe)) zweiter = `farbig:${tag}:${zieheEins(Object.keys(katalog.FAMILIEN), rnd)}`;
    }
    gelb.push(zweiter);
    return { w: gelb.filter(Boolean) };
  }

  // Die gelben Wünsche einer Stufe. Silber und Gold: ein Ding an einem
  // bestimmten Ort und eines mit Farbe oder Anzahl – bei Gold manchmal ein
  // Ding der Jahreszeit.
  function gelbFuerStufe(tier, stufe, raumId, mitbewohner = []) {
    if (stufe <= 1) return gelbeWuensche(tier, raumId, mitbewohner).w;
    const rnd = zufall(`${tier.seed}:gelb${stufe}:${raumId}`);
    const schon = new Set([...mitbewohner.filter((t) => t.seed !== tier.seed).flatMap((t) => t.w || []), ...(tier.w || [])]);
    const ort = genauerWunsch("ort", raumId, rnd, schon);
    if (ort) schon.add(ort);
    let zweiter = stufe >= 3 && rnd() < 0.4 ? zeitWunsch(rnd, schon) : "";
    if (!zweiter) zweiter = genauerWunsch(rnd() < 0.5 ? "farbig" : "anzahl", raumId, rnd, schon) || genauerWunsch("farbig", raumId, rnd, schon) || genauerWunsch("anzahl", raumId, rnd, schon);
    return [ort, zweiter].filter(Boolean);
  }

  // Alle Wünsche einer Stufe.
  //   Bronze  zwei gelbe (Wohnung), ein grüner (Wohnhaus), zwei blaue in zwei
  //           verschiedene Häuser – eine Buchfigur wünscht sich zuerst das
  //           Zimmer aus ihrer Geschichte – und der Traumjob (gold, ohne Liste)
  //   Silber  zwei genaue gelbe, ein anderer grüner, ein blauer im Spital und
  //           ein lila Wunsch an die Lage der Wohnung
  //   Gold    zwei genaue gelbe, ein blauer im Hotel, einer im Dorf und ein
  //           lila: neben einem Freund wohnen (oder eine andere Lage)
  function wuenscheStufe(tier, stufe, raumId, mitbewohner = []) {
    const katalog = K();
    if (stufe <= 1) {
      const gruen = ziehe(katalog.HAUS_WUENSCHE.wohnhaus || [], 1, zufall(`${tier.seed}:haus`)).map((r) => `raum:${r}`);
      const eigen = eigenerWunsch(tier);
      const blau = eigen ? [eigen] : [];
      const rnd = zufall(`${tier.seed}:blau`);
      while (blau.length < 2) {
        const w = blauerWunsch(rnd, new Set(blau), { ohne: blau.map((x) => x.split(":")[1]) });
        if (!w) break;
        blau.push(w);
      }
      return { ...gelbeWuensche(tier, raumId, mitbewohner), g: gruen, b: blau, l: [] };
    }
    const rnd = zufall(`${tier.seed}:stufe${stufe}`);
    const gelb = gelbFuerStufe(tier, stufe, raumId, mitbewohner);
    if (stufe === 2) {
      const vorher = new Set(tier.g || []);
      const gruen = mische((katalog.HAUS_WUENSCHE.wohnhaus || []).map((r) => `raum:${r}`).filter((r) => !vorher.has(r)), rnd).slice(0, 1);
      const blau = [blauerWunsch(rnd, new Set(tier.b || []), { haus: "spital" })].filter(Boolean);
      return { w: gelb, g: gruen, b: blau, l: [stockWunsch(tier, raumId, rnd)] };
    }
    const blau = [blauerWunsch(rnd, new Set(), { haus: "hotel" }), blauerWunsch(rnd, new Set(), { haus: "zentrum" })].filter(Boolean);
    return { w: gelb, g: [], b: blau, l: [freundWunsch(tier) || stockWunsch(tier, raumId, rnd, tier.l || [])] };
  }
  // Wie bisher: die Wünsche eines neuen Tiers (Bronze).
  function wuenscheFuer(tier, raumId, mitbewohner = []) { return wuenscheStufe(tier, 1, raumId, mitbewohner); }
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
  const dingeMit = (z, tag) => (z?.dinge || []).filter((d) => M()?.DINGE?.[d.i]?.tags?.includes(tag));

  // Die Farbfamilie eines Dings: wie es angemalt ist – oder seine Grundfarbe
  // (die nächste Farbe der Palette). Was sich nicht anmalen lässt, hat keine.
  const grundFamilie = new Map();
  function familieVon(d) {
    if (d.c) return K()?.FARBE?.[d.c]?.familie || "";
    const ding = M()?.DINGE?.[d.i];
    if (!ding?.farbe) return "";
    if (!grundFamilie.has(ding.id)) grundFamilie.set(ding.id, naechsteFamilie(ding.farbe));
    return grundFamilie.get(ding.id);
  }
  function naechsteFamilie(hex) {
    const rgb = (h) => { const n = parseInt(String(h).replace("#", ""), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const [r, g, b] = rgb(hex);
    let beste = "";
    let abstand = Infinity;
    (K()?.FARBEN || []).forEach((f) => {
      const [r2, g2, b2] = rgb(f.hex);
      const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
      if (d < abstand) { abstand = d; beste = f.familie; }
    });
    return beste;
  }

  // Wo zwei Dinge zueinander stehen (Zimmer-Einheiten, wie in train-bau.js).
  function umrissVon(d) { return M()?.umriss?.(d.i, d.s || 1) || { x0: 0, x1: 0, y0: 0, y1: 0 }; }
  function flaecheVon(u) {
    const ding = M()?.DINGE?.[u.i];
    if (!ding || typeof ding.flaeche !== "number" || ding.art !== "boden") return null;
    const k = M().massVon(u.i) * (u.s || 1);
    let [a, b] = ding.fx || [-ding.w / 2, ding.w / 2];
    if (u.f) [a, b] = [-b, -a];
    return { y: u.y + ding.flaeche * k, x0: u.x + a * k, x1: u.x + b * k };
  }
  function liegtAuf(d, u) {
    const fl = flaecheVon(u);
    return Boolean(fl) && Math.abs(d.y - fl.y) < 2.5 && d.x >= fl.x0 - 2 && d.x <= fl.x1 + 2;
  }
  function ortErfuellt(z, a, rel, b) {
    const da = dingeMit(z, a);
    const dort = dingeMit(z, b);
    return da.some((d) => dort.some((u) => {
      if (u.k === d.k) return false;
      if (rel === "auf") return liegtAuf(d, u);
      const ud = umrissVon(d);
      const uu = umrissVon(u);
      if (rel === "ueber") return d.x >= u.x + uu.x0 - 12 && d.x <= u.x + uu.x1 + 12 && d.y + ud.y1 <= u.y + uu.y0 + 6;
      // neben: nicht weiter auseinander als die halben Breiten und eine Handbreit
      return !liegtAuf(d, u) && !liegtAuf(u, d) && Math.abs(d.x - u.x) <= (ud.x1 - ud.x0) / 2 + (uu.x1 - uu.x0) / 2 + 40;
    }));
  }

  // Was ein Wunsch im Zimmer selbst verlangt: ein Ding, eine Farbe, eine
  // Anzahl, einen Ort.
  function zimmerErfuellt(z, wunsch) {
    const [typ, a, b, c] = String(wunsch).split(":");
    if (typ === "ding" || typ === "zeit") return hatDing(z, a);
    if (typ === "farbe") return K()?.FARBE?.[z?.wand]?.familie === a;
    if (typ === "boden") return K()?.FARBE?.[z?.bodenFarbe]?.familie === a;
    if (typ === "farbig") return dingeMit(z, a).some((d) => familieVon(d) === b);
    if (typ === "anzahl") return dingeMit(z, a).length >= Number(b);
    if (typ === "ort") return ortErfuellt(z, a, b, c);
    return false;
  }

  // Die Lage der Wohnung im Wohnhaus: über und unter ihr die Nachbarn.
  function nachbarn(index) {
    const st = stand.haeuser.wohnhaus.stock;
    return [st[index - 1], st[index + 1]].filter(Boolean);
  }
  function stockErfuellt(ref, art, raumId) {
    if (ref.hausId !== "wohnhaus") return false;
    const anzahl = stand.haeuser.wohnhaus.stock.length;
    if (art === "oben") return ref.index >= anzahl - 3;
    if (art === "unten") return ref.index <= 2;
    if (art === "ruhig") return !nachbarn(ref.index).some((s) => s.art === "wohnung" && s.zimmer[0]?.raum === "kinderzimmer");
    if (art === "neben") return nachbarn(ref.index).some((s) => s.zimmer.some((z) => z.raum === raumId));
    return false;
  }
  function freundErfuellt(ref, seed) {
    const f = findeTier(seed);
    return Boolean(f) && f.hausId === ref.hausId && Math.abs(f.index - ref.index) <= 1;
  }

  function erfuellt(seed, wunsch, ref = findeTier(seed)) {
    if (!ref) return false;
    const [typ, a, b] = String(wunsch).split(":");
    if (typ === "raum" || typ === "fremd") return hatPlatz(seed, wunsch);
    if (typ === "stock") return stockErfuellt(ref, a, b);
    if (typ === "freund") return freundErfuellt(ref, a);
    return zimmerErfuellt(ref.stock.zimmer[0], wunsch);
  }

  // ---------------------------------------------------------------------------
  // Platz in den Zimmern
  // ---------------------------------------------------------------------------
  // Ein Zimmer hat Platz für so viele Bewohner, wie verschiedene passende
  // Dinge darin stehen – höchstens PLATZ_MAX. Ein leeres Zimmer zählt noch
  // nicht, und eine Bäckerei für alle braucht viele Dinge oder eine zweite.
  function platzVon(z) {
    const eigene = new Set(M()?.RAUM_DINGE?.[z?.raum] || []);
    return Math.min(PLATZ_MAX, new Set((z?.dinge || []).map((d) => d.i).filter((i) => eigene.has(i))).size);
  }
  // Welche Wünsche eines Bewohners einen Platz in einem Zimmer brauchen: der
  // grüne, die blauen, die des Babys.
  function raumWuensche(tier) {
    const liste = [];
    (tier.g || []).forEach((w) => { const [typ, r] = w.split(":"); if (typ === "raum") liste.push({ w, haus: "wohnhaus", raum: r }); });
    [...(tier.b || []), ...(tier.baby?.w || [])].forEach((w) => { const [typ, h, r] = w.split(":"); if (typ === "fremd") liste.push({ w, haus: h, raum: r }); });
    return liste;
  }
  // Wer einen Platz bekommt: wer zuerst eingezogen ist, zuerst – auf jedem
  // Gerät gleich. zimmer: je Zimmerart die Zimmer mit Platz und Belegung.
  let platzCache = { version: -1, karte: new Map(), zimmer: new Map() };
  function platzKarte() {
    if (platzCache.version === version) return platzCache;
    const zimmer = new Map();
    HAUS_IDS.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s) => s.zimmer.forEach((z, slot) => {
      if (!z.raum) return;
      const key = `${hausId}:${z.raum}`;
      if (!zimmer.has(key)) zimmer.set(key, []);
      zimmer.get(key).push({ stockId: s.id, slot, platz: platzVon(z), belegt: 0 });
    })));
    const karte = new Map();
    alleTiere().map((e) => e.tier).sort((a, b) => (a.seit - b.seit) || (a.seed < b.seed ? -1 : 1)).forEach((tier) => {
      raumWuensche(tier).forEach(({ w, haus: h, raum }) => {
        if (karte.has(`${tier.seed}|${w}`)) return;
        const z = (zimmer.get(`${h}:${raum}`) || []).find((x) => x.belegt < x.platz);
        if (!z) return;
        z.belegt += 1;
        karte.set(`${tier.seed}|${w}`, true);
      });
    });
    platzCache = { version, karte, zimmer };
    return platzCache;
  }
  function hatPlatz(seed, w) { return platzKarte().karte.has(`${seed}|${w}`); }
  // Wie es um eine Zimmerart in einem Haus steht: wie viele Zimmer, Plätze,
  // belegte Plätze.
  function platzInfo(hausId, raumId) {
    const liste = platzKarte().zimmer.get(`${hausId}:${raumId}`) || [];
    return { anzahl: liste.length, platz: liste.reduce((n, z) => n + z.platz, 0), belegt: liste.reduce((n, z) => n + z.belegt, 0) };
  }
  // Platz und Belegung eines bestimmten Zimmers (für den Zimmerkopf).
  function platzZimmer(hausId, index, slot = 0) {
    const s = stock(hausId, index);
    const z = s?.zimmer?.[slot];
    if (!z?.raum) return null;
    const eintrag = (platzKarte().zimmer.get(`${hausId}:${z.raum}`) || []).find((x) => x.stockId === s.id && x.slot === slot);
    return eintrag ? { platz: eintrag.platz, belegt: eintrag.belegt, max: PLATZ_MAX } : null;
  }

  // Wie ein Wunsch heisst, und was "Zeig mir" tun soll.
  function dativ(der) {
    const [artikel, ...rest] = String(der).split(" ");
    return `${artikel === "die" ? "der" : "dem"} ${rest.join(" ")}`;
  }
  function beschreibe(wunsch, tier = null) {
    const katalog = K();
    const [typ, a, b, c] = String(wunsch).split(":");
    const ding = (tag) => katalog.DING_WUENSCHE[tag] || { ein: tag, zeige: "" };
    const kurzVon = (info) => gross(String(info.ein).replace(/^(ein|eine|einen) /, ""));
    if (typ === "ding") {
      const info = ding(a);
      return { typ, text: `Ich hätte gerne ${info.ein}.`, kurz: kurzVon(info), zeige: info.zeige, tag: a };
    }
    if (typ === "farbig") {
      const info = ding(a);
      const fam = katalog.FAMILIEN[b] || { name: b, zeige: b };
      return { typ, text: `Ich hätte gerne ${info.ein}. Am liebsten in ${fam.name}!`, kurz: `${kurzVon(info)} in ${fam.name}`, zeige: info.zeige, tag: a, familie: b, farbe: fam.zeige };
    }
    if (typ === "anzahl") {
      const info = ding(a);
      return { typ, text: `Ich hätte gerne ${info.ein}. Ich brauche ${b} davon.`, kurz: `${b} × ${kurzVon(info)}`, zeige: info.zeige, tag: a, anzahl: Number(b) };
    }
    if (typ === "ort") {
      const info = ding(a);
      const dort = ding(c);
      const wo = `${katalog.ORT_WORT?.[b] || b} ${dativ(M()?.DINGE?.[dort.zeige]?.der || `das ${kurzVon(dort)}`)}`;
      return { typ, text: `Ich hätte gerne ${info.ein}. Am liebsten ${wo}.`, kurz: `${kurzVon(info)} ${wo}`, zeige: info.zeige, tag: a, ort: b, dort: c, dortZeige: dort.zeige };
    }
    if (typ === "zeit") {
      const info = ding(a);
      return { typ, text: `${katalog.JAHRESZEITEN?.[b]?.satz || ""} Ich hätte gerne ${info.ein}.`.trim(), kurz: kurzVon(info), zeige: info.zeige, tag: a, jahreszeit: b };
    }
    if (typ === "farbe") {
      const fam = katalog.FAMILIEN[a] || { name: a, wort: a, zeige: a };
      return { typ, text: `Ich mag ${fam.name}. Malst du die Wand ${fam.wort} an?`, kurz: `Wand ${fam.wort}`, farbe: fam.zeige, familie: a };
    }
    if (typ === "boden") {
      const fam = katalog.FAMILIEN[a] || { name: a, wort: a, zeige: a };
      return { typ, text: `Ich mag ${fam.name}. Malst du den Boden ${fam.wort} an?`, kurz: `Boden ${fam.wort}`, farbe: fam.zeige, familie: a };
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
    if (typ === "stock") {
      if (a === "neben") {
        const raum = katalog.RAEUME[b];
        return { typ, text: `Neben meiner Wohnung wünsche ich mir ${raum?.ein || b}.`, kurz: `${raum?.name || b} daneben`, lage: a, haus: "wohnhaus", raum: b, icon: raum?.icon };
      }
      const lage = katalog.LAGE?.[a] || { text: "", kurz: a };
      return { typ, text: lage.text, kurz: lage.kurz, lage: a };
    }
    if (typ === "freund") {
      const f = findeTier(a)?.tier || null;
      return { typ, text: `Ich möchte gleich neben ${f?.n || "meinem Freund"} wohnen.`, kurz: `Neben ${f?.n || "einem Freund"}`, freund: a, freundTier: f };
    }
    return { typ: "", text: "", kurz: "" };
  }

  // Die Wünsche der Stufe, mit Stern-Farbe und ob sie erfüllt sind. Wer alle
  // Stufen geschafft hat, wünscht sich nichts mehr.
  function wuensche(seed) {
    const ref = findeTier(seed);
    if (!ref || ref.tier.fertig) return [];
    const t = ref.tier;
    const liste = [];
    const dazu = (w, stern, i = -1) => liste.push({ id: w, stern, neu: i >= 0 && t.neu === i, ...beschreibe(w, t), erfuellt: erfuellt(seed, w, ref) });
    t.w.forEach((w, i) => dazu(w, "gelb", i));
    t.g.forEach((w) => dazu(w, "gruen"));
    t.b.forEach((w) => dazu(w, "blau"));
    (t.l || []).forEach((w) => dazu(w, "lila"));
    return liste;
  }
  // Was ein Baby braucht (rosa Sterne): Jeder erfüllte Wunsch ist ein Stern
  // für das Dorf.
  function babyWuensche(seed) {
    const ref = findeTier(seed);
    const baby = ref?.tier?.baby;
    if (!baby) return [];
    return (baby.w || []).map((w) => ({ id: w, stern: "rosa", ...beschreibe(w, ref.tier), erfuellt: erfuellt(seed, w, ref) }));
  }

  // Die Sterne eines Bewohners: die der Stufe (gelb, grün, blau, lila und bei
  // Bronze der Traumjob in Gold), dazu alle der geschafften Stufen.
  //   stufe, fertig          wo es steht
  //   stufeAnzahl, stufeTotal die Sterne der Stufe
  //   anzahl, total          alle Sterne über alle Stufen
  function sterne(seed) {
    const leer = { stufe: 1, fertig: false, gelb: [], gruen: [], blau: [], lila: [], gold: [], anzahl: 0, total: 0, stufeAnzahl: 0, stufeTotal: 0 };
    const ref = findeTier(seed);
    if (!ref) return leer;
    const t = ref.tier;
    const stufen = (K()?.STUFEN || []).map((x) => x.sterne);
    const total = stufen.reduce((a, b) => a + b, 0);
    if (t.fertig) {
      const n = stufen[stufen.length - 1] || 5;
      return { ...leer, stufe: stufen.length, fertig: true, gelb: [true, true], blau: [true, true], lila: [true], anzahl: total, total, stufeAnzahl: n, stufeTotal: n };
    }
    const stufe = Math.max(1, t.stufe || 1);
    const liste = wuensche(seed);
    const farbe = (f) => liste.filter((w) => w.stern === f).map((w) => w.erfuellt);
    const gold = stufe === 1 && t.traum ? [hatTraumjob(seed)] : [];
    const stufeAnzahl = liste.filter((w) => w.erfuellt).length + gold.filter(Boolean).length;
    const stufeTotal = liste.length + gold.length;
    const vorher = stufen.slice(0, stufe - 1).reduce((a, b) => a + b, 0);
    return { stufe, fertig: false, gelb: farbe("gelb"), gruen: farbe("gruen"), blau: farbe("blau"), lila: farbe("lila"), gold, anzahl: vorher + stufeAnzahl, total, stufeAnzahl, stufeTotal };
  }

  // Die Sterne eines Stockwerks: je Tier eine Reihe.
  function sterneStock(hausId, index) {
    const s = stock(hausId, index);
    const tiere = (s?.tiere || []).map((t) => ({ seed: t.seed, a: t.a, n: t.n, ...sterne(t.seed) }));
    return { tiere, anzahl: tiere.reduce((n, t) => n + t.anzahl, 0), total: tiere.reduce((n, t) => n + t.total, 0), fertig: tiere.length > 0 && tiere.every((t) => t.fertig) };
  }

  // Wie zufrieden ein Tier ist. Nie traurig: Wünsche dürfen offen bleiben, es
  // gibt nur weniger Sterne (Entscheid 6). Wer eine Stufe weiter ist, fühlt
  // sich schon wohler.
  function laune(seed) {
    const ref = findeTier(seed);
    if (!ref) return { stufe: 0, emoji: "", text: "" };
    const st = sterne(seed);
    const name = ref.tier.n;
    if (st.fertig) return { stufe: 3, emoji: "🤩", text: `${name} ist überglücklich!` };
    const anteil = st.stufeTotal ? st.stufeAnzahl / st.stufeTotal : 0;
    if (anteil >= 0.6 || (st.stufe >= 3 && anteil >= 0.3)) return { stufe: 2, emoji: "😊", text: `${name} fühlt sich wohl.` };
    if (anteil >= 0.3 || st.stufe >= 2) return { stufe: 1, emoji: "🙂", text: `${name} ist zufrieden.` };
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
  // Bei Regen und Schnee (bau-wetter.js) bleibt man lieber drinnen: Auf den
  // Spielplatz geht dann kaum jemand; bei Sonne umso mehr.
  const DRAUSSEN = ["spielplatz"];
  function besuchsziele(tier, jetzt = Date.now()) {
    const liste = [];
    const blau = tier.b.map((w) => w.split(":"));
    const wetter = window.LernappBauWetter?.heute?.(new Date(jetzt)) || null;
    ARBEITS_HAEUSER.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s, index) => {
      s.zimmer.forEach((z, slot) => {
        if (!z.raum) return;
        const raum = K()?.RAEUME?.[z.raum];
        const gewuenscht = blau.some((t) => t[1] === hausId && t[2] === z.raum);
        let gewicht = gewuenscht ? 4 : raum?.ausflug ? 2 : 1;
        if (DRAUSSEN.includes(z.raum) && wetter) gewicht = wetter.drinnen ? 0 : wetter.wetter === "sonne" ? gewicht * 2 : gewicht;
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
    // Hat das Kind das Tier irgendwohin getragen, bleibt es eine Weile dort.
    const hin = getragen(seed, jetzt);
    if (hin) return hin.haus === ref.hausId && hin.index === ref.index ? daheim : { wo: "besuch", ...hin };
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
    const ziele = besuchsziele(ref.tier, jetzt);
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
  // Was die Zeit tut
  // ---------------------------------------------------------------------------
  // Läuft, solange die Bauecke offen ist (train-bau.js, alle paar Sekunden).
  // Zurück kommen Ereignisse, die die Ansicht zeigt:
  //   stufe    ein Bewohner hat eine Stufe geschafft (stufe: die neue, fertig)
  //   gross    ein Baby ist gross geworden und zieht bald selbst ein
  //   abreise  ein Feriengast reist ab und gibt dem Hotel Sterne
  // Dazu: Wünsche, die nicht mehr gehen (ein Freund ist ausgezogen, die
  // Jahreszeit ist vorbei), werden ersetzt; ein Wehwehchen vergeht nach einem
  // Tag von selbst. Wer einzieht, entscheidet die Ansicht (zuzugFaellig,
  // ziehtEin) – damit das Kind den Einzug sieht.
  function tick(jetzt = Date.now()) {
    const ereignisse = [];
    if (neuere) return ereignisse;
    if (hebeAn()) { speichern(); melde("stufe"); }
    const zeit = jahreszeit(jetzt);
    alleTiere().forEach(({ hausId, index, tier, stock: s }) => {
      const raumId = s.zimmer[0]?.raum;
      const finde = (st) => st.tiere.find((x) => x.seed === tier.seed);
      if (!tier.fertig) {
        const st = sterne(tier.seed);
        if (st.stufeTotal > 0 && st.stufeAnzahl === st.stufeTotal) {
          const fertig = st.stufe >= 3;
          const neu = Math.min(3, st.stufe + 1);
          aendereStock(hausId, index, (stx) => {
            const t = finde(stx);
            if (!t) return;
            if (fertig) t.fertig = 1;
            else { Object.assign(t, wuenscheStufe(t, neu, raumId, stx.tiere)); t.stufe = neu; }
            t.wAt = jetzt;
            t.neu = -1;
          }, "stufe");
          ereignisse.push({ typ: "stufe", hausId, index, seed: tier.seed, stufe: fertig ? 3 : neu, fertig });
          return;
        }
      }
      const ersetzen = (tier.l || []).some((w) => w.startsWith("freund:") && !findeTier(w.split(":")[1]))
        || (tier.w || []).some((w) => w.startsWith("zeit:") && w.split(":")[2] !== zeit);
      if (ersetzen && !tier.fertig) {
        aendereStock(hausId, index, (stx) => {
          const t = finde(stx);
          if (!t) return;
          const rnd = zufall(`${t.seed}:${tag(jetzt)}`);
          t.l = (t.l || []).map((w) => (w.startsWith("freund:") && !findeTier(w.split(":")[1]) ? (freundWunsch(t) || stockWunsch(t, raumId, rnd)) : w));
          const schon = new Set(t.w);
          t.w = t.w.map((w) => (w.startsWith("zeit:") && w.split(":")[2] !== zeit ? (genauerWunsch("farbig", raumId, rnd, schon) || genauerWunsch("anzahl", raumId, rnd, schon) || w) : w));
        }, "wunsch");
      }
      if (tier.baby && jetzt - tier.baby.seit > BABY_MS) {
        const baby = tier.baby;
        const art = baby.a === "m_baby" ? (hash(`${tier.seed}:${baby.n}`) % 2 ? "m_maedchen" : "m_bub") : baby.a;
        aendereStock(hausId, index, (stx) => { const t = finde(stx); if (t) delete t.baby; }, "baby");
        if (K()?.TIERE?.[art]) stand.warteliste = [...(stand.warteliste || []), { a: art, n: baby.n, seit: jetzt }].slice(-6);
        speichern();
        ereignisse.push({ typ: "gross", hausId, index, seed: tier.seed, n: baby.n });
      }
      if (tier.weh && jetzt - tier.weh.seit > WEH_MS) aendereStock(hausId, index, (stx) => { const t = finde(stx); if (t) delete t.weh; }, "weh");
    });
    gastZimmer().forEach(({ s, index }) => {
      const g = s.gast;
      if (!g) return;
      const liste = g.w.map((w) => gastErfuellt(s, w));
      const alle = liste.length > 0 && liste.every(Boolean);
      if (alle !== Boolean(g.ok)) {
        aendereStock("hotel", index, (st) => { if (st.gast) st.gast.ok = alle ? jetzt : 0; }, "gast");
        return;
      }
      if ((g.ok && jetzt - g.ok > GAST_FROH_MS) || jetzt >= g.bis) {
        const sterneZahl = Math.max(1, Math.round((5 * liste.filter(Boolean).length) / Math.max(1, liste.length)));
        stand.bewertungen = [...(stand.bewertungen || []), { a: g.a, n: g.n, sterne: sterneZahl, at: jetzt }].slice(-12);
        if (sterneZahl === 5) stand.bonus = (Number(stand.bonus) || 0) + 1;
        if (!stand.album.gaeste.includes(g.a)) stand.album.gaeste.push(g.a);
        aendereStock("hotel", index, (st) => { delete st.gast; }, "gast");
        ereignisse.push({ typ: "abreise", hausId: "hotel", index, n: g.n, a: g.a, sterne: sterneZahl });
      }
    });
    return ereignisse;
  }

  // Bewohner aus Fassung 5 einstufen: Wer alle fünf Wünsche von damals erfüllt
  // hat (ein gewünschtes Zimmer zählte, sobald es das gab), hat Bronze
  // geschafft und bekommt die Wünsche für Silber; alle anderen beginnen mit
  // Bronze und behalten ihre Wünsche. Auf jedem Gerät gleich.
  function hebeAn() {
    if (neuere) return false;
    let geaendert = false;
    alleTiere().forEach(({ tier, stock: s }) => {
      if (tier.stufe) return;
      const alt = [...tier.w, ...tier.g, ...tier.b];
      const fertig = alt.length > 0 && alt.every((w) => {
        const [typ, a, b] = w.split(":");
        if (typ === "raum") return zimmerIn("wohnhaus", a);
        if (typ === "fremd") return zimmerIn(a, b);
        return zimmerErfuellt(s.zimmer[0], w);
      });
      if (!tier.l) tier.l = [];
      if (fertig) Object.assign(tier, wuenscheStufe(tier, 2, s.zimmer[0]?.raum, s.tiere));
      tier.stufe = fertig ? 2 : 1;
      geaendert = true;
    });
    if (geaendert) version += 1;
    return geaendert;
  }

  // ---------------------------------------------------------------------------
  // Babys
  // ---------------------------------------------------------------------------
  // Ab und zu kommt in einer Wohnung ein Baby zur Welt – in der
  // Geburtsabteilung im Spital. Es wohnt bei seinem Elternteil, wünscht sich
  // ein Bettchen, die Kinderabteilung und die Kita, und nach zwei Tagen ist es
  // gross und zieht selbst ein (warteliste). Ein Baby bringt dem Dorf einen
  // Stern.
  const geburtDa = () => platzInfo("spital", "geburt").platz > 0;
  // Ist es Zeit? Zurück: { seed, hausId, index } – oder { fehlt: "geburt" },
  // wenn es im Spital (noch) keine Geburtsabteilung mit Platz gibt.
  function babyFaellig(jetzt = Date.now()) {
    if (neuere || !faellig("baby", ERSTES_BABY_MS, jetzt)) return null;
    const kandidaten = alleTiere().filter(({ hausId, tier, stock: s }) => hausId === "wohnhaus" && !s.tiere.some((t) => t.baby)
      && (!istMensch(tier) || K().TIERE[tier.a].alter === "gross") && jetzt - (tier.seit || 0) > SLOT_MS);
    if (!kandidaten.length) return null;
    if (!geburtDa()) { merkeUeberraschung({ baby: jetzt + BABY_PAUSE_MS }); return { fehlt: "geburt" }; }
    const e = kandidaten[Math.floor(Math.random() * kandidaten.length)];
    return { seed: e.tier.seed, hausId: e.hausId, index: e.index };
  }
  function bekommtBaby(seed, jetzt = Date.now()) {
    const ref = findeTier(seed);
    if (!ref || ref.tier.baby || neuere) return null;
    const namen = new Set(alleTiere().flatMap((e) => [e.tier.n, e.tier.baby?.n]).filter(Boolean));
    const liste = K().BABY_NAMEN?.[volk()] || ["Baby"];
    const freie = liste.filter((n) => !namen.has(n));
    const auswahl = freie.length ? freie : liste;
    const baby = { a: istMensch(ref.tier) ? "m_baby" : ref.tier.a, n: auswahl[Math.floor(Math.random() * auswahl.length)], seit: jetzt, w: ["ding:babybett", "fremd:spital:paediatrie", "fremd:zentrum:kita"] };
    stand.bonus = (Number(stand.bonus) || 0) + 1;
    stand.album.babys += 1;
    merkeUeberraschung({ baby: jetzt + BABY_PAUSE_MS });
    aendereStock(ref.hausId, ref.index, (st) => { const t = st.tiere.find((x) => x.seed === seed); if (t) t.baby = baby; }, "baby");
    return baby;
  }

  // ---------------------------------------------------------------------------
  // Wehwehchen
  // ---------------------------------------------------------------------------
  // Ab und zu hat ein Bewohner ein Wehwehchen (bau-katalog.js, WEH) – höchstens
  // zwei auf einmal. Bringt das Kind ihn in die richtige Abteilung, ist er
  // geheilt, und das Dorf bekommt einen Stern. Sonst ist es nach einem Tag von
  // selbst vorbei.
  function wehFaellig(jetzt = Date.now()) {
    if (neuere || !faellig("weh", ERSTES_WEH_MS, jetzt)) return null;
    merkeUeberraschung({ weh: jetzt + WEH_PAUSE_MS });
    const alle = alleTiere();
    const kandidaten = alle.filter((e) => !e.tier.weh && jetzt - (e.tier.seit || 0) > SLOT_MS);
    if (!kandidaten.length || alle.filter((e) => e.tier.weh).length >= 2) return null;
    const e = kandidaten[Math.floor(Math.random() * kandidaten.length)];
    const arten = Object.keys(K().WEH || {});
    const art = arten[Math.floor(Math.random() * arten.length)];
    aendereStock(e.hausId, e.index, (st) => { const t = st.tiere.find((x) => x.seed === e.tier.seed); if (t) t.weh = { art, seit: jetzt }; }, "weh");
    return { seed: e.tier.seed, art };
  }
  // Ein Bewohner kommt in eine Abteilung. Zurück: "geheilt"; "falsch" (dort
  // hilft man dabei nicht); "fehlt" (richtig, aber im Spital gibt es diese
  // Abteilung noch nicht – oder sie ist noch leer).
  function heile(seed, raumId) {
    const ref = findeTier(seed);
    const weh = ref?.tier?.weh;
    if (!weh) return "";
    const richtig = K().WEH?.[weh.art]?.raum;
    if (raumId !== richtig) return "falsch";
    if (!(platzInfo("spital", richtig).platz > 0)) return "fehlt";
    stand.bonus = (Number(stand.bonus) || 0) + 1;
    stand.album.geheilt += 1;
    if (!stand.album.weh.includes(weh.art)) stand.album.weh.push(weh.art);
    aendereStock(ref.hausId, ref.index, (st) => { const t = st.tiere.find((x) => x.seed === seed); if (t) delete t.weh; }, "weh");
    return "geheilt";
  }

  // ---------------------------------------------------------------------------
  // Der Rettungshelikopter
  // ---------------------------------------------------------------------------
  // Etwa jede halbe Stunde fliegt er über das Dorf. Wer ihn antippt und im
  // Spital einen Notfall hat, hilft ihm landen – ein Stern für das Dorf.
  function heliFaellig(jetzt = Date.now()) { return !neuere && faellig("heli", ERSTER_HELI_MS, jetzt); }
  function heliVorbei(angetippt, jetzt = Date.now()) {
    merkeUeberraschung({ heli: jetzt + (angetippt ? UEBERRASCHUNG_MS : NOCHMAL_MS * 2) });
    if (!angetippt || neuere) return { gerettet: false, notfall: false };
    const notfall = platzInfo("spital", "notfall").platz > 0;
    if (notfall) {
      stand.bonus = (Number(stand.bonus) || 0) + 1;
      stand.album.gerettet += 1;
      speichern();
      melde("bonus");
    }
    return { gerettet: notfall, notfall };
  }

  // ---------------------------------------------------------------------------
  // Feriengäste im Hotel
  // ---------------------------------------------------------------------------
  // In ein Gästezimmer, Familienzimmer oder die Suite mit einem Bett kommt ab
  // und zu ein Feriengast – wenn es eine Rezeption gibt. Er hat sechs genaue
  // Wünsche an sein Zimmer und das Hotel. Sind alle erfüllt, reist er bald
  // zufrieden ab, sonst nach knapp einem Tag; er gibt dem Hotel ein bis fünf
  // Sterne. Fünf Sterne bringen dem Dorf einen Stern.
  function gastZimmer() {
    return (stand.haeuser.hotel?.stock || []).map((s, index) => ({ s, index })).filter(({ s }) => K()?.RAEUME?.[s.zimmer[0]?.raum]?.gast);
  }
  const rezeptionDa = () => platzInfo("hotel", "rezeption").platz > 0;
  // Ist es Zeit für einen Gast? Zurück: { hausId, index } – oder
  // { fehlt: "rezeption" }.
  function gastFaellig(jetzt = Date.now()) {
    if (neuere || !faellig("gast", ERSTER_GAST_MS, jetzt)) return null;
    const frei = gastZimmer().filter(({ s }) => !s.gast && hatDing(s.zimmer[0], "bett"));
    if (!frei.length) return null;
    if (!rezeptionDa()) { merkeUeberraschung({ gast: jetzt + GAST_PAUSE_MS }); return { fehlt: "rezeption" }; }
    return { hausId: "hotel", index: frei[0].index };
  }
  // Wo ein Gast etwas genau so haben will: die Orte für ein Hotelzimmer.
  const GAST_ORTE = [["lampe", "neben", "bett"], ["bild", "ueber", "bett"], ["nachttisch", "neben", "bett"], ["pflanze", "neben", "bett"],
    ["lampe", "auf", "nachttisch"], ["koffer", "neben", "schrank"], ["blumen", "auf", "tisch"], ["pflanze", "neben", "sofa"], ["uhr", "ueber", "tisch"]];
  function gastWuensche(gast, raumId) {
    const rnd = zufall(`${gast.seed}:${raumId}`);
    const schon = new Set([`fremd:hotel:${raumId}`]);
    const nimm = (w) => { if (!w || schon.has(w)) return ""; schon.add(w); return w; };
    const dinge = schublade(raumId);
    const tags = [...new Set(dinge.flatMap((d) => d.tags || []))].filter((t) => K()?.DING_WUENSCHE?.[t]);
    // Was ein Hotelzimmer besonders macht: die Dinge, die es nur im Hotel gibt.
    const hotelTags = [...new Set((M()?.RAUM_DINGE?.[raumId] || []).filter((id) => id.startsWith("o_")).flatMap((id) => M().DINGE[id]?.tags || []))].filter((t) => K()?.DING_WUENSCHE?.[t]);
    const liste = [
      nimm(genauerWunsch("farbig", raumId, rnd, schon, { tags })),
      nimm(genauerWunsch("anzahl", raumId, rnd, schon, { tags })),
      nimm(genauerWunsch("ort", raumId, rnd, schon, { orte: GAST_ORTE })),
      nimm(hotelTags.length ? `ding:${zieheEins(mische(hotelTags, rnd), rnd)}` : ""),
      nimm(`farbe:${zieheEins(Object.keys(K().FAMILIEN), rnd)}`),
      nimm(blauerWunsch(rnd, schon, { haus: "hotel" })),
    ];
    return liste.filter(Boolean);
  }
  function gastKommt(index, jetzt = Date.now()) {
    const s = stock("hotel", index);
    if (!s || s.gast || !K()?.RAEUME?.[s.zimmer[0]?.raum]?.gast || neuere) return null;
    const katalog = K();
    let art;
    if (volk() === "menschen") art = katalog.MENSCH_IDS[Math.floor(Math.random() * katalog.MENSCH_IDS.length)];
    else {
      // Feriengäste kommen von weit her – oft ein seltenes Tier.
      const liste = Math.random() < 0.45 ? katalog.SELTEN_IDS : katalog.TIER_IDS;
      art = liste[Math.floor(Math.random() * liste.length)];
    }
    const namen = katalog.TIERE[art].namen;
    const gast = { a: art, n: namen[Math.floor(Math.random() * namen.length)], seed: kennung("g"), kam: jetzt, bis: jetzt + GAST_MS, w: [], ok: 0 };
    gast.w = gastWuensche(gast, s.zimmer[0].raum);
    merkeUeberraschung({ gast: jetzt + GAST_PAUSE_MS });
    aendereStock("hotel", index, (st) => { st.gast = gast; }, "gast");
    return gast;
  }
  // Ob ein Wunsch eines Gasts erfüllt ist: im Zimmer – oder im Hotel gibt es
  // das gewünschte Zimmer (mit mindestens einem passenden Ding).
  function gastErfuellt(s, wunsch) {
    const [typ, a, b] = String(wunsch).split(":");
    if (typ === "fremd") return platzInfo(a, b).platz > 0;
    return zimmerErfuellt(s.zimmer[0], wunsch);
  }
  function gastWunschListe(index) {
    const s = stock("hotel", index);
    if (!s?.gast) return [];
    return s.gast.w.map((w) => ({ id: w, stern: w.startsWith("fremd:") ? "blau" : "gelb", ...beschreibe(w, null), erfuellt: gastErfuellt(s, w) }));
  }
  function gastSterne(index) {
    const liste = gastWunschListe(index);
    return { anzahl: liste.filter((w) => w.erfuellt).length, total: liste.length };
  }
  // Wo ein Gast wohnt: über seine Kennung.
  function findeGast(seed) {
    const e = gastZimmer().find(({ s }) => s.gast?.seed === seed);
    return e ? { index: e.index, gast: e.s.gast, stock: e.s } : null;
  }
  // Wie gut das Hotel ist: der Schnitt der letzten zehn Bewertungen (0 bis 5).
  function hotelRuf() {
    const liste = (stand.bewertungen || []).slice(-10);
    return liste.length ? Math.round(liste.reduce((n, b) => n + b.sterne, 0) / liste.length) : 0;
  }

  // ---------------------------------------------------------------------------
  // Spiele in den Zimmern, Tragen
  // ---------------------------------------------------------------------------
  // Ein Spiel (bau-spiele.js) zum ersten Mal geschafft: ein Stern für das
  // Dorf und ein Bild im Album.
  function spielGeschafft(raumId) {
    if (neuere || !raumId) return false;
    if (stand.album.spiele.includes(raumId)) return false;
    stand.album.spiele.push(raumId);
    stand.bonus = (Number(stand.bonus) || 0) + 1;
    speichern();
    melde("bonus");
    return true;
  }

  // Das Kind trägt ein Tier in ein anderes Zimmer: Dort bleibt es eine Weile
  // (TRAGEN_MS). Das merkt sich jedes Gerät für sich, nicht im Kasten.
  const TRAGEN_KEY = "lernapp.bau.tragen";
  // Kurz gemerkt: Beim Zeichnen fragt jedes Zimmer nach jedem Bewohner.
  let tragenPuffer = { at: 0, karte: {} };
  function tragenKarte() {
    const jetzt = Date.now();
    if (jetzt - tragenPuffer.at < 1500) return tragenPuffer.karte;
    let karte = {};
    try { karte = obj(JSON.parse(localStorage.getItem(TRAGEN_KEY) || "{}")); } catch { karte = {}; }
    tragenPuffer = { at: jetzt, karte };
    return karte;
  }
  function trage(seed, hausId, index, slot = 0, jetzt = Date.now()) {
    const s = stock(hausId, index);
    if (!s?.zimmer?.[slot]?.raum || !findeTier(seed)) return false;
    const karte = tragenKarte();
    const meine = obj(karte[besitzer]);
    Object.keys(meine).forEach((k) => { if (!(Number(meine[k]?.bis) > jetzt)) delete meine[k]; });
    meine[seed] = { haus: hausId, stockId: s.id, slot, bis: jetzt + TRAGEN_MS };
    karte[besitzer] = meine;
    try { localStorage.setItem(TRAGEN_KEY, JSON.stringify(karte)); } catch { /* privater Modus */ }
    tragenPuffer = { at: Date.now(), karte };
    melde("tragen");
    return true;
  }
  function getragen(seed, jetzt = Date.now()) {
    const e = obj(obj(tragenKarte()[besitzer])[seed]);
    if (!(Number(e.bis) > jetzt) || !HAUS_IDS.includes(e.haus)) return null;
    const index = indexVon(e.haus, e.stockId);
    const slot = Number(e.slot) || 0;
    if (index < 0 || !zimmer(e.haus, index, slot)?.raum) return null;
    return { haus: e.haus, index, slot };
  }

  // ---------------------------------------------------------------------------
  // Das Sammelalbum
  // ---------------------------------------------------------------------------
  // Was es schon gab, kommt ins Album – und bleibt, auch nach einem Neustart:
  // die Bewohner (Arten und Buchfiguren), die geschafften Traumjobs, die
  // eingerichteten Zimmer, die Dinge. Gäste, Spiele, Heilungen und Babys
  // trägt ein, wer sie erlebt.
  function sammle() {
    if (neuere) return false;
    const a = stand.album;
    let neu = false;
    const dazu = (k, id) => { if (id && !a[k].includes(id)) { a[k].push(id); neu = true; } };
    alleTiere().forEach(({ tier }) => {
      dazu("arten", tier.a);
      dazu("figuren", figurVon(tier)?.id);
      const job = jobVon(tier.seed);
      if (job?.traum) dazu("jobs", job.raum);
    });
    HAUS_IDS.forEach((hausId) => stand.haeuser[hausId].stock.forEach((s) => s.zimmer.forEach((z) => {
      if (z.raum && platzVon(z) > 0) dazu("raeume", z.raum);
      z.dinge.forEach((d) => dazu("dinge", d.i));
    })));
    return neu;
  }
  let sammelUhr = 0;
  function sammleBald() {
    if (sammelUhr) return;
    sammelUhr = window.setTimeout(() => { sammelUhr = 0; if (sammle()) speichern(); }, 900);
  }

  // ---------------------------------------------------------------------------
  // Neustart: ein neues Dorf gründen
  // ---------------------------------------------------------------------------
  // Der Pokal für so viele Sterne (bau-katalog.js, POKALE) – oder null.
  function pokalFuer(anzahl) { return [...(K()?.POKALE || [])].reverse().find((p) => anzahl >= p.sterne) || null; }
  // Was ein Neustart jetzt brächte.
  function neustartVorschau() {
    const l = sternenleiter();
    return { nr: stand.runde, volk: volk(), sterne: l.rekord, pokal: pokalFuer(l.rekord), uebrig: paletten(), bewohner: alleTiere().length };
  }
  // Das alte Dorf kommt in die Ruhmeshalle, das neue beginnt leer – mit den
  // unverbauten Paletten und dem Geschenk des Pokals. Album und Ruhmeshalle
  // bleiben. Lässt sich nicht rückgängig machen.
  function neustart({ volk: neuesVolk = "tiere" } = {}) {
    if (neuere) return null;
    const v = neustartVorschau();
    const eintrag = { nr: stand.runde, volk: volk(), sterne: v.sterne, bewohner: v.bewohner, pokal: v.pokal?.id || "", at: Date.now(), haeuser: {} };
    fortschritt().forEach((f) => { eintrag.haeuser[f.id] = { stockwerke: f.stockwerke, eingerichtet: f.eingerichtet, fassade: f.fassade, dach: f.dach }; });
    sammle();
    const neu = leererStand();
    neu.volk = neuesVolk === "menschen" ? "menschen" : "tiere";
    neu.runde = stand.runde + 1;
    neu.ruhm = [...stand.ruhm, eintrag];
    neu.album = stand.album;
    neu.ziegelAb = verdient() - v.uebrig - (v.pokal?.paletten || 0);
    stand = neu;
    version += 1;
    merkeUeberraschung({ rekord: 0, rekordRunde: neu.runde });
    try { localStorage.removeItem(TRAGEN_KEY); } catch { /* privater Modus */ }
    tragenPuffer = { at: 0, karte: {} };
    speichern(true);
    melde("neustart");
    return { eintrag, pokal: v.pokal };
  }
  // Was frühere Dörfer freigeschaltet haben: die goldenen Möbel (ab Silber)
  // und das Denkmal vor dem Wohnhaus (Gold – das neueste).
  const pokalVon = (r) => (K()?.POKALE || []).find((p) => p.id === r.pokal) || null;
  function schaetzeFrei() { return stand.ruhm.some((r) => pokalVon(r)?.schaetze); }
  function denkmal() { return [...stand.ruhm].reverse().find((r) => pokalVon(r)?.denkmal) || null; }

  function onChange(fn) { zuhoerer.add(fn); return () => zuhoerer.delete(fn); }

  // Ein Kasten aus Fassung 5: jetzt einstufen, wo alles da ist.
  if (hebeAn()) speichern();

  window.LernappBauStand = {
    KEY, FORMAT, GEO, STOCK_MAX, STOCK_OHNE_KAUF, DINGE_MAX, DINGE_MAX_HALB, dingeMax, TIERE_MAX, ARBEIT_MAX, ZUZUG_MS, TIER_KOMMT_MS, HAUS_IDS, START, PLATZ_MAX,
    normalize, merge, leererStand, neuereFassung: () => neuere, besitzer: () => besitzer, breiteVon, istDoppel, obenVon, hoeheVon,
    lesen, haus, stock, zimmer, raumVon, indexVon, volk,
    verdient, verbaut, paletten, gezeigt, merkeGezeigt, neueLieferung,
    UEBERRASCHUNG_KEY, UEBERRASCHUNG_MS, NOCHMAL_MS, ueberraschung, blitzzugFaellig, blitzzugVorbei, sternFaellig, sternGefunden, bonusPalette, sternVerstecke,
    dorfSterne, sternenleiter,
    kannBauen, baueStockwerk, doppelPlatz, waehleArt, waehleRaum, verschiebe, setzeGewaehlt,
    aendereStock, aendereZimmer, aendereHaus, speichern,
    alleTiere, findeTier, figurVon, magVon, istMensch, seltenDa, neuesTier, wuenscheFuer, wuenscheStufe, zuzugFaellig, ziehtEin, hinausschicken,
    erfuellt, wuensche, babyWuensche, sterne, sterneStock, laune, fortschritt, beschreibe, jahreszeit,
    platzVon, platzInfo, platzZimmer, hatPlatz,
    arbeitsplaetze, jobVon, hatTraumjob, traumjobsStock, zimmerTiere, jobText, aufenthalt, besucher, imRaum, woText,
    babyFaellig, bekommtBaby, wehFaellig, heile, heliFaellig, heliVorbei,
    gastFaellig, gastKommt, gastWunschListe, gastSterne, findeGast, hotelRuf, gastZimmer,
    spielGeschafft, trage, getragen, sammle,
    pokalFuer, neustartVorschau, neustart, schaetzeFrei, denkmal,
    tick, hebeAn, onChange, kennung, hash,
  };
})();
