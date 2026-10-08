/*
 * validate-bau.mjs – Rechnet die Bauecke ohne Browser nach.
 * ---------------------------------------------------------------------------
 * Was train-bau.js zeigt, hängt an drei Listen und einer Rechnung. Hier wird
 * geprüft, dass sie zusammenpassen und tun, was das Konzept verspricht
 * (docs/BAUECKE-KONZEPT.md):
 *
 *   Katalog      Vier Häuser, jedes mit seinen Zimmern; jedes Zimmer hat
 *                Beschreibung, Farben, Bild, passende Dinge und mindestens
 *                sechs Wünsche. Jeder Wunsch lässt sich mit einem Ding aus
 *                bau-moebel.js erfüllen, jedes Ding zeichnet sich.
 *   Tiere        Jede Tierart bekommt in jedem Zimmer fünf gelbe, zwei grüne
 *                und einen blauen Wunsch – alle erfüllbar, alle mit Satz.
 *                Erfüllt ist, was im Haus steht: Ding, Wandfarbe, Zimmer.
 *   Zeit         Ein neuer Wunsch frühestens am nächsten Kalendertag und nur,
 *                wenn alle gelben erfüllt sind. Ein hinausgeschicktes Tier
 *                wird bald ersetzt, durch eine andere Art.
 *   Ziegel       Eine Palette je gelöstem Rätsel, ein Stockwerk je Palette;
 *                ohne Kauf bis zum vierten Stockwerk, mit Kauf bis zwanzig.
 *   Cloud        Zusammenführen ist in beide Richtungen gleich und verliert
 *                kein Stockwerk; Häuser und Ziegel überleben das Zurücksetzen.
 *   Rätsel       Der Rätsel-Knopf zieht aus der aktuellen Karte und der davor,
 *                passend zur Stufe, ohne Kauf nur Freies, und die Adresse des
 *                Rätsels führt zum selben Auftrag zurück.
 *   Einbau       Startbild, Service Worker, Spielseiten und Zurücksetzen
 *                kennen die Bauecke.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const lies = (datei) => fs.readFileSync(path.join(root, datei), "utf8");

const fehler = [];
function pruefe(bedingung, text) { if (!bedingung) fehler.push(text); }

// Eine Umgebung wie im Browser, so weit die Dateien sie brauchen.
function umgebung({ extra = {}, suche = "", pfad = "/index.html", jetzt = null } = {}) {
  const speicher = new Map();
  const windowStub = {
    ...extra,
    location: { search: suche, pathname: pfad, href: `http://localhost${pfad}${suche}` },
    addEventListener() {},
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout() {},
  };
  const DateKlasse = jetzt === null ? Date : class extends Date {
    constructor(...args) { if (args.length) super(...args); else super(jetzt.wert); }
    static now() { return jetzt.wert; }
  };
  const context = vm.createContext({
    window: windowStub,
    localStorage: {
      getItem: (key) => (speicher.has(key) ? speicher.get(key) : null),
      setItem: (key, value) => speicher.set(key, String(value)),
      removeItem: (key) => speicher.delete(key),
    },
    document: { addEventListener() {}, dispatchEvent() {}, createElementNS: () => ({ setAttribute() {}, append() {} }), hidden: false },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    URLSearchParams,
    Date: DateKlasse,
    Math,
    JSON,
    console,
  });
  const lade = (datei) => vm.runInContext(lies(datei), context, { filename: datei });
  return { windowStub, context, lade, speicher };
}

// --- Katalog und Dinge --------------------------------------------------------
const basis = umgebung();
basis.lade("bau-moebel.js");
basis.lade("bau-katalog.js");
const M = basis.windowStub.LernappBauMoebel;
const K = basis.windowStub.LernappBauKatalog;
pruefe(M && K, "bau-moebel.js oder bau-katalog.js setzen ihr window-Objekt nicht");

const dinge = Object.values(M.DINGE);
pruefe(dinge.length >= 150, `nur ${dinge.length} Dinge – für eine Bauecke, die vom Einrichten lebt, zu wenige`);
const kategorien = new Set(M.KATEGORIEN.map((k) => k.id));
const tagDinge = new Map();
for (const ding of dinge) {
  pruefe(ding.name && ding.der && /^(der|die|das) /.test(ding.der), `${ding.id}: Name oder Artikel fehlt`);
  pruefe(kategorien.has(ding.kat), `${ding.id}: unbekannte Schublade ${ding.kat}`);
  pruefe(["boden", "wand", "decke", "flach"].includes(ding.art), `${ding.id}: unbekannte Art ${ding.art}`);
  pruefe(ding.w > 0 && ding.h > 0, `${ding.id}: ohne Grösse`);
  if (typeof ding.flaeche === "number") {
    pruefe(ding.art === "boden" && ding.flaeche < 0 && ding.flaeche >= -ding.h - 1, `${ding.id}: Fläche liegt nicht auf dem Ding`);
    pruefe(Array.isArray(ding.fx) && ding.fx[0] < ding.fx[1], `${ding.id}: Flächenbereich fehlt`);
  }
  if (ding.klein) pruefe(ding.art === "boden", `${ding.id}: klein, aber nicht stehend`);
  const zeichnungen = [M.zeichne(ding.id), ding.farbe ? M.zeichne(ding.id, "#123456") : ""];
  for (const svg of zeichnungen.filter(Boolean)) {
    pruefe(svg.length > 30, `${ding.id}: leere Zeichnung`);
    pruefe(!/undefined|NaN|null/.test(svg), `${ding.id}: Zeichnung enthält undefined/NaN`);
    const offen = (svg.match(/<g[\s>]/g) || []).length;
    const zu = (svg.match(/<\/g>/g) || []).length;
    pruefe(offen === zu, `${ding.id}: <g> nicht geschlossen (${offen}/${zu})`);
    pruefe((svg.match(/"/g) || []).length % 2 === 0, `${ding.id}: ungerade Zahl Anführungszeichen`);
  }
  if (ding.farbe) pruefe(M.zeichne(ding.id, "#123456").includes("#123456"), `${ding.id}: lässt sich umfärben, nimmt die Farbe aber nicht an`);
  for (const tag of ding.tags) {
    if (!tagDinge.has(tag)) tagDinge.set(tag, []);
    tagDinge.get(tag).push(ding.id);
  }
}

// Wünsche an Dinge: Jeder Wunsch hat ein Ding, und "Zeig mir" zeigt eines, das passt.
for (const [tag, wunsch] of Object.entries(K.DING_WUENSCHE)) {
  pruefe(tagDinge.has(tag), `Wunsch "${tag}": kein Ding erfüllt ihn`);
  pruefe(M.DINGE[wunsch.zeige]?.tags?.includes(tag), `Wunsch "${tag}": "Zeig mir" zeigt ${wunsch.zeige}, das ihn nicht erfüllt`);
  pruefe(/^(ein|eine|einen) |^[A-ZÄÖÜ]|^etwas /.test(wunsch.ein), `Wunsch "${tag}": "${wunsch.ein}" passt nicht in "Ich hätte gerne …"`);
}

// Häuser und Zimmer
pruefe(K.HAEUSER.map((h) => h.id).join() === "wohnhaus,spital,zentrum,buero", "die vier Häuser stimmen nicht");
const gesehen = new Set();
for (const haus of K.HAEUSER) {
  pruefe(haus.raeume.length >= 8, `${haus.id}: nur ${haus.raeume.length} Zimmerarten`);
  pruefe(K.FARBE[haus.fassade] && K.FARBE[haus.dach], `${haus.id}: Fassade oder Dach ohne Farbe`);
  pruefe(/^im /.test(haus.im) && haus.text.length > 20, `${haus.id}: "im …" oder Beschreibung fehlt`);
}
for (const raum of K.RAEUME_LISTE) {
  pruefe(!gesehen.has(raum.id), `Zimmer ${raum.id} doppelt`);
  gesehen.add(raum.id);
  pruefe(K.HAUS[raum.haus], `${raum.id}: unbekanntes Haus`);
  pruefe(/^(der|die|das) /.test(raum.der) && raum.ein, `${raum.id}: Artikel fehlt`);
  pruefe(raum.text.length >= 40 && /[.!?]$/.test(raum.text), `${raum.id}: Beschreibung zu kurz oder ohne Satzende`);
  pruefe(K.FARBE[raum.wand] && K.BODEN[raum.boden] && K.MUSTER.some((m) => m.id === raum.muster), `${raum.id}: Wand, Boden oder Muster unbekannt`);
  pruefe(M.DINGE[raum.icon], `${raum.id}: Bild ${raum.icon} fehlt`);
  pruefe(raum.passend.length >= 6 && raum.passend.every((id) => M.DINGE[id]), `${raum.id}: zu wenig oder unbekannte passende Dinge`);
  pruefe(raum.wuensche.length >= 6 && raum.wuensche.every((t) => K.DING_WUENSCHE[t]), `${raum.id}: zu wenig oder unbekannte Wünsche`);
  // Was sich ein Tier hier wünschen kann, liegt auch in "Passt hierher" oder
  // lässt sich dort über "Zeig mir" finden.
  for (const tag of raum.wuensche) pruefe(tagDinge.get(tag)?.length, `${raum.id}: Wunsch ${tag} ohne Ding`);
}
for (const [hausId, liste] of Object.entries(K.HAUS_WUENSCHE)) {
  for (const r of liste) pruefe(K.RAEUME[r]?.haus === hausId, `grüner Wunsch ${hausId}→${r}: Zimmer gehört nicht in dieses Haus`);
}
for (const [hausId, liste] of Object.entries(K.FREMD_WUENSCHE)) {
  for (const w of liste) {
    pruefe(w.haus !== hausId && K.RAEUME[w.raum]?.haus === w.haus, `blauer Wunsch ${hausId}→${w.haus}/${w.raum} stimmt nicht`);
    pruefe(w.warum && /[.!]$/.test(w.warum), `blauer Wunsch ${hausId}→${w.raum}: ohne Begründung`);
  }
}

// Tiere
pruefe(K.TIER_IDS.length >= 16, "weniger als 16 Tierarten");
const alleNamen = new Set();
for (const [id, tier] of Object.entries(K.TIERE)) {
  pruefe(/^(der|die|das) /.test(tier.der) && tier.coat && tier.inner && tier.ear, `${id}: Name, Farben oder Ohren fehlen`);
  pruefe(K.DING_WUENSCHE[tier.mag.ding] && K.FAMILIEN[tier.mag.farbe], `${id}: Lieblingsding oder -farbe unbekannt`);
  pruefe(tier.namen.length >= 4, `${id}: zu wenig Namen`);
  for (const n of tier.namen) { pruefe(!alleNamen.has(n), `Name ${n} doppelt`); alleNamen.add(n); }
  pruefe(tier.isst.length > 10 && tier.fakt.length > 20, `${id}: Steckbrief fehlt`);
}
for (const fam of Object.keys(K.FAMILIEN)) pruefe(K.FARBEN.some((f) => f.familie === fam), `Farbfamilie ${fam} ohne Farbe in der Palette`);

// Schweizer Rechtschreibung: kein ß in allem, was die Kinder hören oder sehen.
for (const datei of ["bau-moebel.js", "bau-katalog.js", "bau-stand.js", "bau-art.js", "train-bau.js", "bau.css"]) {
  pruefe(!lies(datei).includes("ß"), `${datei}: enthält ein ß`);
}

// --- Der Stand ---------------------------------------------------------------
// mitCloud: der Kasten läuft über game-cloud.js wie in der App, firebase steht
// für die Cloud (getGameState, saveGameState).
function standUmgebung({ paletten = 0, frei = false, jetzt = null, mitCloud = false, firebase = null } = {}) {
  const u = umgebung({ jetzt });
  let verdient = paletten;
  u.windowStub.LernappReise = { bauPaletten: () => verdient, onBauLieferung() {} };
  u.windowStub.LernappEntitlement = { isFree: () => frei };
  if (firebase) u.windowStub.LernappFirebase = firebase;
  if (mitCloud) u.lade("game-cloud.js");
  u.lade("bau-moebel.js");
  u.lade("bau-katalog.js");
  u.lade("bau-stand.js");
  return { S: u.windowStub.LernappBauStand, setzeVerdient: (n) => { verdient = n; }, u };
}

{
  const { S } = standUmgebung();
  const leer = S.lesen();
  pruefe(Object.keys(leer.haeuser).join() === "wohnhaus,spital,zentrum,buero", "leerer Stand: nicht vier Häuser");
  for (const h of Object.values(leer.haeuser)) pruefe(h.stock.length === 1 && !h.stock[0].raum, "leerer Stand: jedes Haus beginnt mit einem leeren Stockwerk");
  pruefe(S.paletten() === 0 && !S.kannBauen("wohnhaus").ok && S.kannBauen("wohnhaus").grund === "ziegel", "ohne Ziegel lässt sich bauen");
}

// Jede Tierart in jedem Zimmer: fünf, zwei, eins – erfüllbar, mit Satz.
{
  const { S } = standUmgebung();
  for (const raum of K.RAEUME_LISTE) {
    for (const art of K.TIER_IDS) {
      const tier = { a: art, seed: `${art}-${raum.id}` };
      const w = S.wuenscheFuer(tier, raum.haus, raum.id);
      pruefe(w.w.length === 5 && new Set(w.w).size === 5, `${art} in ${raum.id}: nicht fünf verschiedene gelbe Wünsche`);
      pruefe(w.g.length === 2 && new Set(w.g).size === 2 && !w.g.includes(`raum:${raum.id}`), `${art} in ${raum.id}: grüne Wünsche stimmen nicht`);
      pruefe(w.b.length === 1, `${art} in ${raum.id}: kein blauer Wunsch`);
      const mag = K.TIERE[art].mag;
      pruefe(w.w[0] === `ding:${mag.ding}` || w.w[0] === `farbe:${mag.farbe}`, `${art} in ${raum.id}: das Lieblingsding der Art fehlt`);
      for (const wunsch of [...w.w, ...w.g, ...w.b]) {
        const b = S.beschreibe(raum.haus, wunsch);
        pruefe(b.text && !/undefined/.test(b.text) && b.kurz, `${art} in ${raum.id}: Wunsch ${wunsch} ohne Satz`);
      }
    }
  }
}

// Erfüllt ist, was im Haus steht.
{
  const { S } = standUmgebung({ paletten: 3 });
  pruefe(S.waehleRaum("wohnhaus", 0, "schlafzimmer"), "Schlafzimmer lässt sich nicht wählen");
  const st = S.stock("wohnhaus", 0);
  pruefe(st.tier && K.TIERE[st.tier.a], "nach der Zimmerwahl zieht kein Tier ein");
  pruefe(st.wand === K.RAEUME.schlafzimmer.wand, "das neue Zimmer hat nicht die Farbe seiner Art");
  for (const w of S.wuensche("wohnhaus", 0)) {
    pruefe(!w.erfuellt || w.typ === "farbe", `Wunsch ${w.id} ist ohne Zutun erfüllt`);
  }
  // Gelb: Dinge und Farbe
  for (const w of S.wuensche("wohnhaus", 0).filter((x) => x.stern === "gelb")) {
    if (w.typ === "ding") S.aendereStock("wohnhaus", 0, (s) => s.dinge.push({ k: `z${s.dinge.length}`, i: w.zeige, x: 100, y: 230, c: "", f: 0, s: 1 }));
    if (w.typ === "farbe") S.aendereStock("wohnhaus", 0, (s) => { s.wand = K.FARBEN.find((f) => f.familie === w.familie).id; });
  }
  pruefe(S.sterne("wohnhaus", 0).gelb.every(Boolean), "alle gelben Wünsche erfüllt, aber nicht alle Sterne");
  // Grün: die gewünschten Zimmer im eigenen Haus
  for (const w of S.wuensche("wohnhaus", 0).filter((x) => x.stern === "gruen")) {
    const i = S.baueStockwerk("wohnhaus");
    pruefe(i > 0, "mit Ziegeln lässt sich kein Stockwerk bauen");
    S.waehleRaum("wohnhaus", i, w.raum);
  }
  pruefe(S.sterne("wohnhaus", 0).gruen.every(Boolean), "die grünen Wünsche gehen mit den Zimmern nicht in Erfüllung");
  // Blau: das Zimmer im anderen Haus (dort ist das Erdgeschoss noch frei)
  const blau = S.wuensche("wohnhaus", 0).find((x) => x.stern === "blau");
  S.waehleRaum(blau.haus, 0, blau.raum);
  const st8 = S.sterne("wohnhaus", 0);
  pruefe(st8.anzahl === 8 && st8.total === 8, `alle Wünsche erfüllt, aber ${st8.anzahl} von ${st8.total} Sternen`);
  pruefe(S.laune("wohnhaus", 0).stufe === 3, "alle Sterne, aber das Tier ist nicht überglücklich");
  // Wegräumen nimmt den Stern wieder weg.
  S.aendereStock("wohnhaus", 0, (s) => { s.dinge = []; });
  pruefe(S.sterne("wohnhaus", 0).anzahl < 8, "weggeräumt, aber der Stern bleibt");
  pruefe(S.laune("wohnhaus", 0).stufe >= 0 && S.laune("wohnhaus", 0).text, "ohne Sterne keine Laune");
  // Plaudern
  for (const f of K.PLAUDERN) {
    const a = S.antwort("wohnhaus", 0, f.id);
    pruefe(a && !/undefined|null/.test(a), `Plaudern "${f.id}": keine Antwort`);
  }
  // Ziegel: drei verdient, drei verbaut (zwei grüne, und keiner für den blauen)
  pruefe(S.verbaut() === 2 && S.paletten() === 1, `Ziegel: verbaut ${S.verbaut()}, übrig ${S.paletten()}`);
}

// Die Schranke: ohne Kauf bis zum vierten Stockwerk, mit Kauf bis zwanzig.
{
  const { S } = standUmgebung({ paletten: 40, frei: false });
  let gebaut = 0;
  while (S.kannBauen("spital").ok) { S.baueStockwerk("spital"); gebaut += 1; }
  pruefe(S.haus("spital").stock.length === S.STOCK_OHNE_KAUF && S.kannBauen("spital").grund === "schranke", `ohne Kauf: ${S.haus("spital").stock.length} Stockwerke, Grund ${S.kannBauen("spital").grund}`);
  pruefe(gebaut === S.STOCK_OHNE_KAUF - 1, "ohne Kauf: falsche Zahl gebauter Stockwerke");
  const mitKauf = standUmgebung({ paletten: 40, frei: true }).S;
  while (mitKauf.kannBauen("buero").ok) mitKauf.baueStockwerk("buero");
  pruefe(mitKauf.haus("buero").stock.length === mitKauf.STOCK_MAX && mitKauf.kannBauen("buero").grund === "voll", "mit Kauf: das Haus wächst nicht bis zur Höchstzahl");
}

// Die Zeit: neuer Wunsch frühestens am nächsten Tag, nur wenn alle gelben erfüllt sind.
{
  const jetzt = { wert: new Date(2026, 9, 8, 10, 0, 0).getTime() };
  const { S } = standUmgebung({ jetzt });
  S.waehleRaum("wohnhaus", 0, "kueche");
  const vorher = [...S.stock("wohnhaus", 0).tier.w];
  jetzt.wert += 26 * 3600 * 1000;
  pruefe(!S.tick(jetzt.wert).some((e) => e.typ === "neuerWunsch"), "neuer Wunsch, obwohl die gelben nicht erfüllt sind");
  for (const w of S.wuensche("wohnhaus", 0).filter((x) => x.stern === "gelb")) {
    if (w.typ === "ding") S.aendereStock("wohnhaus", 0, (s) => s.dinge.push({ k: `t${s.dinge.length}`, i: w.zeige, x: 100, y: 230, c: "", f: 0, s: 1 }));
    else S.aendereStock("wohnhaus", 0, (s) => { s.wand = K.FARBEN.find((f) => f.familie === w.familie).id; });
  }
  S.stock("wohnhaus", 0).tier.wAt = jetzt.wert;
  pruefe(!S.tick(jetzt.wert + 3600 * 1000).some((e) => e.typ === "neuerWunsch"), "neuer Wunsch noch am selben Tag");
  const e = S.tick(jetzt.wert + 24 * 3600 * 1000);
  const nachher = S.stock("wohnhaus", 0).tier.w;
  pruefe(e.some((x) => x.typ === "neuerWunsch"), "am nächsten Tag mit allen gelben Sternen kommt kein neuer Wunsch");
  pruefe(nachher[0] === vorher[0] && nachher.filter((w, i) => w !== vorher[i]).length === 1, "beim Wechsel ändert sich nicht genau ein Wunsch, oder das Lieblingsding fällt weg");
  const neu = nachher.find((w, i) => w !== vorher[i]);
  pruefe(K.RAEUME.kueche.wuensche.includes(neu.split(":")[1]), "der neue Wunsch passt nicht ins Zimmer");
  // Hinausschicken: bald kommt ein neues Tier, eine andere Art.
  const alt = S.stock("wohnhaus", 0).tier.a;
  S.hinausschicken("wohnhaus", 0);
  pruefe(!S.stock("wohnhaus", 0).tier, "hinausgeschickt, aber das Tier ist noch da");
  pruefe(!S.tick(jetzt.wert + 1000).some((x) => x.typ === "eingezogen"), "das neue Tier kommt sofort");
  jetzt.wert = Date.now();
  S.aendereStock("wohnhaus", 0, (s) => { s.tierWeg = jetzt.wert - S.TIER_KOMMT_MS - 1; });
  pruefe(S.tick(jetzt.wert).some((x) => x.typ === "eingezogen"), "nach der Wartezeit zieht kein neues Tier ein");
  pruefe(S.stock("wohnhaus", 0).tier && S.stock("wohnhaus", 0).tier.a !== alt, "das neue Tier ist dieselbe Art wie das hinausgeschickte");
}

// Unterwegs: nur Tiere aus dem Wohnhaus, etwa ein Drittel der Zeit, an gültige Orte.
{
  const { S } = standUmgebung({ paletten: 5, frei: true });
  S.waehleRaum("wohnhaus", 0, "schlafzimmer");
  S.waehleRaum("zentrum", 0, "bibliothek");
  S.waehleRaum("buero", 0, "grossraum");
  S.waehleRaum("spital", 0, "notfall");
  let weg = 0;
  const slots = 400;
  for (let i = 0; i < slots; i += 1) {
    const wo = S.aufenthalt("wohnhaus", 0, i * 15 * 60 * 1000);
    if (!wo) continue;
    weg += 1;
    const raum = K.RAEUME[S.stock(wo.haus, wo.index)?.raum];
    pruefe(wo.haus !== "wohnhaus" && raum && (raum.arbeit || raum.ausflug), `unterwegs an einen ungültigen Ort: ${JSON.stringify(wo)}`);
  }
  pruefe(weg > slots * 0.18 && weg < slots * 0.42, `unterwegs ${Math.round((weg / slots) * 100)} % der Zeit – erwartet etwa 30 %`);
  pruefe(S.aufenthalt("spital", 0, 0) === null, "Tiere im Spital gehen auf Ausflug");
  const t = 7 * 15 * 60 * 1000;
  pruefe(JSON.stringify(S.aufenthalt("wohnhaus", 0, t)) === JSON.stringify(S.aufenthalt("wohnhaus", 0, t + 1000)), "innerhalb derselben Viertelstunde wechselt der Ort");
}

// Der schlimmste Spielstand: alle Häuser bis oben, jedes Zimmer voll, die
// längsten Namen. Er muss bequem in das Kontodokument passen (1 MiB für alles).
{
  const { S } = standUmgebung({ paletten: 999, frei: true });
  const lang = Object.keys(M.DINGE).sort((a, b) => b.length - a.length);
  for (const hausId of S.HAUS_IDS) {
    while (S.kannBauen(hausId).ok) S.baueStockwerk(hausId);
    const raeume = K.HAUS[hausId].raeume;
    S.haus(hausId).stock.forEach((_, i) => {
      S.waehleRaum(hausId, i, raeume[i % raeume.length]);
      S.aendereStock(hausId, i, (s) => {
        for (let n = 0; n < S.DINGE_MAX; n += 1) s.dinge.push({ k: S.kennung("d"), i: lang[n % 5], x: 123.4, y: 229.6, c: "dunkelgruen", f: 1, s: 1.2 });
        s.bodenFarbe = "dunkelblau";
      });
    });
  }
  const bytes = JSON.stringify(S.lesen()).length;
  pruefe(bytes < 400000, `der volle Spielstand ist ${Math.round(bytes / 1000)} KB gross – zu viel fürs Kontodokument`);
}

// Zusammenführen: in beide Richtungen gleich, nichts geht verloren.
{
  const { S } = standUmgebung({ paletten: 9, frei: true });
  const a = S.normalize(null);
  const b = S.normalize(null);
  a.haeuser.wohnhaus.stock[0] = { ...a.haeuser.wohnhaus.stock[0], raum: "kueche", at: 100 };
  a.haeuser.wohnhaus.stock.push({ id: "a1", raum: "bad", dinge: [{ k: "x", i: "wanne", x: 100, y: 230 }], at: 120 });
  b.haeuser.wohnhaus.stock[0] = { ...b.haeuser.wohnhaus.stock[0], raum: "wohnzimmer", at: 200 };
  b.haeuser.spital.stock.push({ id: "b1", raum: "labor", at: 50 }, { id: "b2", raum: "", at: 60 });
  b.gewaehlt = "spital";
  const ab = S.merge(a, b);
  const ba = S.merge(b, a);
  pruefe(JSON.stringify(ab) === JSON.stringify(ba), "Zusammenführen ist nicht in beide Richtungen gleich");
  pruefe(ab.haeuser.wohnhaus.stock[0].raum === "wohnzimmer", "beim Zusammenführen gewinnt nicht das neuere Stockwerk");
  pruefe(ab.haeuser.wohnhaus.stock.length === 2 && ab.haeuser.spital.stock.length === 3, "beim Zusammenführen geht ein Stockwerk verloren");
  pruefe(JSON.stringify(S.merge(ab, ab)) === JSON.stringify(ab), "Zusammenführen mit sich selbst ändert etwas");
  pruefe(ab.gewaehlt === "spital", "die Wahl des ersten Hauses geht verloren");
  // Müll wird aufgeräumt statt übernommen.
  const muell = S.normalize({ haeuser: { wohnhaus: { stock: [{ raum: "notfall", dinge: [{ i: "gibtsnicht" }, { i: "bett", x: 99999, y: -5 }], wand: "lila" }] } } });
  const s0 = muell.haeuser.wohnhaus.stock[0];
  pruefe(s0.raum === "" && s0.dinge.length === 1 && s0.dinge[0].x <= S.GEO.W && K.FARBE[s0.wand], "ein kaputter Stand wird nicht aufgeräumt");
}

// Zwei Geräte – oder ein Gast vor der Anmeldung – bauen am selben Ort: Kein
// eingerichtetes Zimmer geht verloren, der Rohbau vom Anfang verdoppelt sich
// nicht, und es kommen keine Ziegel dazu.
{
  const geraet = () => standUmgebung({ paletten: 1, frei: true }).S;
  const A = geraet();
  A.waehleRaum("wohnhaus", 0, "kueche");
  A.aendereStock("wohnhaus", 0, (s) => s.dinge.push({ k: "herd", i: "kochherd", x: 120, y: 230, c: "", f: 0, s: 1 }));
  pruefe(A.stock("wohnhaus", 0).id !== "wohnhaus-0", "das erste Stockwerk behält mit der Zimmerwahl die gemeinsame Kennung");
  A.baueStockwerk("wohnhaus");
  A.waehleRaum("wohnhaus", 1, "schlafzimmer");
  const B = geraet();
  B.waehleRaum("wohnhaus", 0, "bad");
  const ab = A.merge(A.lesen(), B.lesen());
  const ba = A.merge(B.lesen(), A.lesen());
  pruefe(JSON.stringify(ab) === JSON.stringify(ba), "zwei Geräte am selben Ort: Zusammenführen ist nicht in beide Richtungen gleich");
  const raeume = ab.haeuser.wohnhaus.stock.map((s) => s.raum).sort().join();
  pruefe(raeume === "bad,kueche,schlafzimmer", `zwei Geräte am selben Ort: es bleiben ${raeume || "keine Zimmer"}`);
  pruefe(ab.haeuser.wohnhaus.stock.find((s) => s.raum === "kueche")?.dinge.length === 1, "zwei Geräte am selben Ort: der Herd in der Küche ist weg");
  pruefe(ab.haeuser.wohnhaus.stock.at(-1).raum === "schlafzimmer", "das zuletzt gebaute Stockwerk steht nicht zuoberst");
  pruefe(ab.haeuser.spital.stock.length === 1 && !ab.haeuser.spital.stock[0].raum, "der unberührte Rohbau verdoppelt sich beim Zusammenführen");
  pruefe(JSON.stringify(A.merge(ab, ab)) === JSON.stringify(ab), "Zusammenführen mit sich selbst ändert etwas");
  // Ein neues Gerät (alles Rohbau) bringt nichts dazu und nimmt nichts weg.
  const frisch = A.merge(A.normalize(null), A.lesen());
  pruefe(frisch.haeuser.wohnhaus.stock.map((s) => s.raum).join() === "kueche,schlafzimmer", "ein neues Gerät verändert das Haus beim Zusammenführen");
  // Mehr Stockwerke als Paletten: übrig bleibt null, nicht weniger.
  const C = standUmgebung({ paletten: 0, frei: true });
  C.u.speicher.set("lernapp.bau", JSON.stringify(ab));
  C.u.lade("bau-stand.js");
  const S2 = C.u.windowStub.LernappBauStand;
  pruefe(S2.haus("wohnhaus").stock.length === 3 && S2.paletten() === 0 && !S2.kannBauen("wohnhaus").ok, `mehr Stockwerke als Paletten: ${S2.paletten()} übrig`);
}

// Speichern lässt den Stand, wie er ist: Wer gerade einen Tisch mit einer
// Tasse zieht, hält beide noch in der Hand, wenn der Kasten gespeichert wird.
{
  const gespeichert = [];
  const { S } = standUmgebung({ mitCloud: true, firebase: { getGameState: () => null, saveGameState: (key, data) => gespeichert.push(key) } });
  S.waehleRaum("wohnhaus", 0, "kueche");
  S.aendereStock("wohnhaus", 0, (s) => s.dinge.push({ k: "tisch", i: "tisch", x: 200, y: 230, c: "", f: 0, s: 1 }));
  const st = S.stock("wohnhaus", 0);
  const tisch = st.dinge[0];
  S.speichern(true);
  pruefe(gespeichert.includes("lernapp.bau"), "der Kasten geht nicht in die Cloud");
  pruefe(S.stock("wohnhaus", 0) === st && S.stock("wohnhaus", 0).dinge[0] === tisch, "Speichern ersetzt den Stand – ein gezogener Stapel verliert, was darauf steht");
}

// Ein Kasten aus einer neueren Fassung der App (neue Dinge, Zimmer, Tiere …)
// bleibt unberührt: nichts wird aufgeräumt, nichts in die Cloud geschrieben.
{
  const { S: alt } = standUmgebung();
  const neuer = {
    v: alt.FORMAT + 1,
    gewaehlt: "wohnhaus",
    haeuser: {
      wohnhaus: { fassade: "regenbogen", dach: "rot", at: 5, stock: [{ id: "s1", seit: 0, raum: "sternwarte", dinge: [{ k: "d1", i: "teleskop", x: 100, y: 230, r: 45 }], tier: { a: "drache", n: "Fauchi" }, at: 5 }] },
      garage: { stock: [{ id: "g1", raum: "werkstatt" }] },
    },
  };
  const m1 = alt.merge(alt.lesen(), neuer);
  const m2 = alt.merge(neuer, alt.lesen());
  pruefe(JSON.stringify(m1) === JSON.stringify(neuer) && JSON.stringify(m2) === JSON.stringify(neuer), "ein Kasten einer neueren Fassung wird beim Zusammenführen verändert");
  const gespeichert = [];
  const { S, u } = standUmgebung({ mitCloud: true, firebase: { getGameState: (key) => (key === "lernapp.bau" ? { data: neuer } : null), saveGameState: (key) => gespeichert.push(key) } });
  pruefe(S.neuereFassung?.(), "der Kasten einer neueren Fassung wird nicht erkannt");
  S.waehleRaum("wohnhaus", 0, "kueche");
  S.tick(Date.now() + 9e7);
  S.speichern(true);
  pruefe(!gespeichert.includes("lernapp.bau"), "die ältere Fassung schreibt in die Cloud, was sie nicht kennt");
  pruefe(u.speicher.get("lernapp.bau") === JSON.stringify(neuer), "die ältere Fassung verändert den neueren Kasten auf dem Gerät");
}

// Der Katalog dieser Fassung. Ändert sich eine Kennung (ein neues Ding, ein
// neues Zimmer, ein neues Tier …) oder ein Feld des Kastens, muss FORMAT in
// bau-stand.js hoch – sonst löscht eine ältere App, die den neuen Kasten
// sieht, was sie nicht kennt. Danach hier den neuen Fingerabdruck eintragen.
{
  const FINGERABDRUCK = { 1: "ed99c8af13ceffa4" };
  const { S } = standUmgebung();
  S.waehleRaum("wohnhaus", 0, "kueche");
  S.aendereStock("wohnhaus", 0, (s) => s.dinge.push({ k: "x", i: "kochherd", x: 100, y: 230 }));
  const stand = S.normalize(S.lesen());
  const st = stand.haeuser.wohnhaus.stock[0];
  const felder = [stand, stand.haeuser.wohnhaus, st, st.dinge[0], st.tier].map((o) => Object.keys(o).sort().join(","));
  const kennungen = [
    ...Object.keys(M.DINGE).map((id) => `ding:${id}`),
    ...Object.keys(K.RAEUME).map((id) => `raum:${id}`),
    ...Object.keys(K.TIERE).map((id) => `tier:${id}`),
    ...Object.keys(K.FARBE).map((id) => `farbe:${id}`),
    ...K.MUSTER.map((m) => `muster:${m.id}`),
    ...Object.keys(K.BODEN).map((id) => `boden:${id}`),
    ...Object.keys(K.HAUS).map((id) => `haus:${id}`),
  ].sort();
  const abdruck = crypto.createHash("sha256").update([...felder, ...kennungen].join("|")).digest("hex").slice(0, 16);
  pruefe(FINGERABDRUCK[S.FORMAT] === abdruck, `Katalog oder Felder des Kastens haben sich geändert (Fingerabdruck ${abdruck}): FORMAT in bau-stand.js hochzählen und den Fingerabdruck in validate-bau.mjs eintragen`);
}

// --- Rätsel für die Bauecke (journey-plan.js) ---------------------------------
function reiseUmgebung({ stufe = "mittel", gestempelt = 0, frei = true, suche = "", pfad = "/index.html", cloud = null } = {}) {
  const extra = {
    LernappEntitlement: { stationFree: (nr) => frei || nr <= 10, isFree: () => frei },
  };
  if (cloud) extra.LernappGameCloud = cloud;
  const u = umgebung({ extra, suche, pfad });
  const done = {};
  for (let nr = 1; nr <= gestempelt; nr += 1) done[nr] = { stars: 2, game: "x", at: 1 };
  u.speicher.set("lernapp.reise", JSON.stringify({ done, tries: {}, choice: {}, alt: {}, stufe, stufeAt: 1 }));
  u.lade("journey-plan.js");
  return { R: u.windowStub.LernappReise, u };
}

const LESEN = new Set(["letterPuzzle", "readingPuzzle", "kakuro"]);
for (const stufe of ["leicht", "mittel", "schwer"]) {
  for (const gestempelt of [0, 24, 65, 130]) {
    const { R } = reiseUmgebung({ stufe, gestempelt });
    const liste = R.bauKandidaten();
    pruefe(liste.length >= 10, `${stufe}, ${gestempelt} gestempelt: nur ${liste.length} Rätsel`);
    for (const task of liste) {
      pruefe(task.bau && task.needStars === 1, `${stufe}: Rätsel ${task.game} ist kein Bauecke-Auftrag oder verlangt mehr als einen Stern`);
      if (stufe === "leicht") pruefe(!LESEN.has(task.game), `leicht: ${task.game} verlangt lesen`);
      const jetzt = Math.min(gestempelt + 1, R.STATION_COUNT);
      const karte = R.mapIndexOf(jetzt);
      pruefe(R.mapIndexOf(task.nr) === karte || R.mapIndexOf(task.nr) === karte - 1, `${stufe}: Rätsel von Station ${task.nr} passt nicht zur Karte ${karte + 1}`);
      if (task.kind === "score") pruefe(task.target < task.gut || stufe !== "schwer" || task.target <= task.gut, "Zielpunktzahl unsinnig");
    }
  }
}
{
  // Ohne Kauf nur, was frei ist – auch wer schon weiter wäre.
  const { R } = reiseUmgebung({ frei: false, gestempelt: 10 });
  const liste = R.bauKandidaten();
  pruefe(liste.length > 0 && liste.every((t) => t.nr <= 10), "ohne Kauf kommen Rätsel von gesperrten Stationen");
  // Nicht dasselbe noch einmal.
  const erstes = R.bauRaetsel();
  for (let i = 0; i < 20; i += 1) {
    const naechstes = R.bauRaetsel({ ausser: erstes });
    pruefe(R.bauSchluessel(naechstes) !== R.bauSchluessel(erstes), "Anderes Rätsel bringt dasselbe noch einmal");
  }
}
{
  // Die Adresse führt zum selben Auftrag zurück – auf der Spielseite.
  const { R } = reiseUmgebung({ gestempelt: 33 });
  for (const task of R.bauKandidaten()) {
    const url = R.bauUrlFor(task);
    const [seite, suche] = url.split("?");
    const spiel = reiseUmgebung({ gestempelt: 33, suche: `?${suche}`, pfad: `/${seite}` }).R;
    const zurueck = spiel.fromLocation();
    pruefe(zurueck && zurueck.bau && spiel.bauSchluessel(zurueck) === R.bauSchluessel(task), `${url}: führt nicht zum selben Rätsel`);
    pruefe(spiel.describe(zurueck).startsWith("Ein Rätsel für die Bauecke"), `${url}: der Lautsprecher nennt die Bauecke nicht`);
  }
  // Eine verirrte Adresse zieht kein fremdes Spiel herein.
  const falsch = reiseUmgebung({ suche: "?station=1&bau=1&spiel=memory", pfad: "/memory.html" }).R;
  pruefe(!falsch.fromLocation(), "ein Spiel, das an der Station nicht vorkommt, gilt als Rätsel");
}
{
  // Ziegel: je Seitenaufruf einmal, je Gerät gezählt, zusammengeführt ohne Doppel.
  const { R } = reiseUmgebung();
  pruefe(R.bauPaletten() === 0, "ohne Rätsel schon Ziegel");
  pruefe(R.bauGeschafft().neu && R.bauPaletten() === 1, "ein gelöstes Rätsel gibt keine Palette");
  pruefe(!R.bauGeschafft().neu && R.bauPaletten() === 1, "dasselbe Rätsel gibt zweimal Ziegel");
  const a = { geraete: { g1: 3, g2: 1 } };
  const b = { geraete: { g1: 2, g3: 4 } };
  pruefe(JSON.stringify(R.mergeLieferung(a, b)) === JSON.stringify({ geraete: { g1: 3, g2: 1, g3: 4 } }), "Ziegel zweier Geräte werden falsch zusammengeführt");
  pruefe(JSON.stringify(R.mergeLieferung(a, a)) === JSON.stringify(R.mergeLieferung(a, {})), "Ziegel verdoppeln sich beim Zusammenführen mit sich selbst");
}

// --- Der Einbau ----------------------------------------------------------------
{
  // Zurücksetzen: Häuser und Ziegel bleiben – auf dem Gerät und in der Cloud.
  const firebase = lies("firebase.js");
  pruefe(/BAU_KEEP_KEYS = \["lernapp\.bau", "lernapp\.bau\.lieferung"\]/.test(firebase), "firebase.js kennt die Kästen der Bauecke nicht");
  pruefe(/\.\.\.BAU_KEEP_KEYS/.test(firebase) && /BAU_KEEP_KEYS\.forEach/.test(firebase), "firebase.js behält die Bauecke beim Zurücksetzen nicht");
  const cloud = umgebung();
  cloud.lade("game-cloud.js");
  const gc = cloud.windowStub.LernappGameCloud;
  const bleibt = gc.register({ key: "test.bleibt", empty: { n: 0 }, keepOnReset: true });
  const geht = gc.register({ key: "test.geht", empty: { n: 0 } });
  bleibt.write({ n: 5 });
  geht.write({ n: 5 });
  gc.resetAll();
  pruefe(bleibt.read().n === 5 && geht.read().n === 0, "game-cloud.js: keepOnReset wirkt nicht");
  pruefe(/keepOnReset: true/.test(lies("bau-stand.js")) && /keepOnReset: true/.test(lies("journey-plan.js")), "die Bauecke meldet ihre Kästen nicht mit keepOnReset an");

  // Startbild: Stylesheet und Skripte, in der richtigen Reihenfolge.
  const index = lies("index.html");
  const reihe = ["game-cloud.js", "journey-plan.js", "bau-moebel.js", "bau-katalog.js", "bau-stand.js", "bau-art.js", "train-bau.js", "train-home.js"];
  const stellen = reihe.map((datei) => index.indexOf(`src="${datei}`));
  pruefe(stellen.every((x) => x > 0) && stellen.every((x, i) => i === 0 || x > stellen[i - 1]), "index.html lädt die Bauecke nicht in der richtigen Reihenfolge");
  pruefe(/href="bau\.css\?v=/.test(index), "index.html lädt bau.css nicht");
  const sw = lies("service-worker.js");
  for (const datei of ["bau.css", "bau-moebel.js", "bau-katalog.js", "bau-stand.js", "bau-art.js", "train-bau.js"]) {
    pruefe(sw.includes(`./${datei}\${ASSET_VERSION_QUERY}`), `service-worker.js legt ${datei} nicht in den Cache`);
  }
  // Die Spielseiten kennen das Rätsel aus der Bauecke.
  pruefe(/bauGeschafft/.test(lies("game-shell.js")) && /anderesRaetsel/.test(lies("game-shell.js")), "game-shell.js gibt keine Ziegel");
  pruefe(/bauGeschafft/.test(lies("app.js")) && /goToOtherBauPuzzle/.test(lies("app.js")), "app.js gibt keine Ziegel");
  pruefe(/bauGeschafft/.test(lies("tiersprung.js")) && /anderesRaetsel/.test(lies("tiersprung.js")), "tiersprung.js gibt keine Ziegel");
  pruefe(/!journeySolved && !journeyBau/.test(lies("app.js")), "app.js zählt beim Verlassen eines Bauecke-Rätsels einen Fehlversuch der Reise");
  // Startbild: Bauplatz, Ansicht und Rückweg.
  const home = lies("train-home.js");
  pruefe(/function buildBauButton/.test(home) && /function showBauecke/.test(home) && /bauWanted/.test(home), "train-home.js bindet die Bauecke nicht ein");
  pruefe(/view\.name === "bau"[\s\S]{0,80}zurueck/.test(home), "train-home.js fragt beim Zurück die Bauecke nicht zuerst");
  // Der Vorlesen-Schalter.
  const kidsJs = lies("kids.js");
  pruefe(/function mountTtsToggle/.test(kidsJs) && /mountTtsToggle\(\);/.test(kidsJs), "kids.js hat keinen Vorlesen-Schalter");
}

if (fehler.length) {
  console.error(`Die Bauecke stimmt nicht (${fehler.length}):`);
  fehler.slice(0, 60).forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`Die Bauecke stimmt: ${dinge.length} Dinge, ${K.RAEUME_LISTE.length} Zimmer in 4 Häusern, ${K.TIER_IDS.length} Tierarten, alle Wünsche erfüllbar.`);
