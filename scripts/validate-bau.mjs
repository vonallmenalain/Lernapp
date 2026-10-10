/*
 * validate-bau.mjs – Rechnet die Bauecke ohne Browser nach.
 * ---------------------------------------------------------------------------
 * Was train-bau.js zeigt, hängt an Listen und Rechnungen. Hier wird geprüft,
 * dass sie zusammenpassen und tun, was das Konzept verspricht
 * (docs/BAUECKE-KONZEPT.md):
 *
 *   Dinge        Jedes Ding zeichnet sich, auch umgefärbt; keine Kennung
 *                doppelt; das Bild an der Wand zeigt in jedem Zimmer sein
 *                eigenes Motiv.
 *   Zimmer       Vier Häuser: Wohnhaus, Spital, Dorf, Büro. Jedes Zimmer hat
 *                Beschreibung, Farben, Bild und mindestens zehn Dinge, die es
 *                nur dort gibt – im Eingang steht kein Bett, im Schlafzimmer
 *                kein WC. Gewohnt wird nur in Schlaf- und Kinderzimmern; jedes
 *                Zimmer der anderen Häuser ist ein Arbeitsplatz mit Job.
 *   Wohnungen    Das Wohnhaus beginnt mit drei leeren Wohnungen. Mit der Wahl
 *                zieht ein Tier ein, mit der Zeit bis zu drei. Jedes Tier hat
 *                zwei gelbe Wünsche (einer ist das Lieblingsding oder die
 *                Lieblingsfarbe), einen grünen und zwei blaue – alle erfüllbar
 *                mit dem, was in der Schublade liegt. Je Wohnung höchstens
 *                sechs gelbe, drei grüne und sechs blaue Sterne.
 *   Stockwerke   Im Wohnhaus wählt das Kind beim Bauen: Wohnung oder zwei
 *                Zimmer; Spital, Dorf und Büro haben ein Zimmer je Stockwerk.
 *                Die Reihenfolge lässt sich ändern und übersteht das
 *                Zusammenführen.
 *   KiddyDome    Braucht zwei Stockwerke übereinander (mit einem geht er
 *                nicht), bleibt beim Umstellen und Zusammenführen beisammen,
 *                gibt beim Ändern der Zimmerart das obere frei; die Tiere aus
 *                den Kinderzimmern gehen oft hin.
 *   Arbeit       Jedes Tier hat einen Traumjob. Gibt es das Zimmer und ist
 *                dort Platz, arbeitet es dort, sonst irgendwo; höchstens drei
 *                Tiere im selben Zimmer. Oben in einem Arbeitszimmer stehen
 *                nur, wer dort den Traumjob hat oder sich das Zimmer wünscht;
 *                jede Wohnung zählt, wie viele ihren Traumjob haben.
 *   Unterwegs    Meist daheim, manchmal bei der Arbeit oder zu Besuch, nachts
 *                alle daheim; eine Viertelstunde lang am selben Ort.
 *   Zeit         Ein neuer Wunsch frühestens am nächsten Kalendertag, nur wenn
 *                beide gelben erfüllt sind. Ein hinausgeschicktes Tier wird
 *                bald ersetzt, durch eine andere Art.
 *   Ziegel       Eine Palette je gelöstem Rätsel, ein Stockwerk je Palette;
 *                ohne Kauf bis zum vierten Stockwerk, mit Kauf bis zwanzig.
 *   Konten       Je Konto ein eigener Stand, auf dem Gerät und in der Cloud.
 *                Abmelden und mit einem anderen Konto anmelden zeigt nichts
 *                vom vorigen; ein Gast-Stand geht nur in ein Konto über, das
 *                noch keine Bauecke hat. Die Ziegel ebenso.
 *   Cloud        Zusammenführen ist in beide Richtungen gleich und verliert
 *                kein Stockwerk und kein Zimmer; ein Kasten einer neueren
 *                Fassung bleibt unberührt; die erste Fassung wird übertragen.
 *   Rätsel       Der Rätsel-Knopf zieht aus der aktuellen Karte und der davor,
 *                passend zur Stufe, ohne Kauf nur Freies, und die Adresse des
 *                Rätsels führt zum selben Auftrag zurück.
 *   Einbau       Startbild, Service Worker, Spielseiten und Zurücksetzen
 *                kennen die Bauecke.
 *   Stimme       Jede Aufnahme in bau-stimme.js gehört zu einem Satz, den die
 *                Bauecke sagt, heisst nach ihm, ist eine MP3 wie die anderen
 *                (mono, 24 kHz, 32 kbit/s) und so lang, wie der Satz es
 *                verlangt; keine Datei liegt ohne Satz herum, und die
 *                Leseecke behält Alains Stimme (docs/STIMME-GOOGLE.md).
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { sprechText, mp3Rahmen } from "./stimme-texte.mjs";
import { ORDNER as STIMME_ORDNER, bauTexte, dateiFuer, passtZumText, sekundenVon, verzeichnis as stimmeVerzeichnis } from "./stimme-bau-texte.mjs";
import { verzeichnis as appVerzeichnis } from "./stimme-app-texte.mjs";

const root = path.resolve(import.meta.dirname, "..");
const lies = (datei) => fs.readFileSync(path.join(root, datei), "utf8");

const fehler = [];
function pruefe(bedingung, text) { if (!bedingung) fehler.push(text); }

// Die Möbel der Zimmer, in der Reihenfolge, in der index.html sie lädt.
const GRUPPEN = ["wohnen", "haus", "spital", "station", "laeden", "dienste", "freizeit", "buero", "arbeit", "dome"];
const MOEBEL = ["bau-moebel.js", ...GRUPPEN.map((g) => `bau-moebel-${g}.js`)];

// Eine Umgebung wie im Browser, so weit die Dateien sie brauchen. jetzt: die
// Uhr ({ wert }), feuer(): ein Ereignis an document (die Anmeldung).
function umgebung({ extra = {}, suche = "", pfad = "/index.html", jetzt = null } = {}) {
  const speicher = new Map();
  const lauscher = new Map();
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
  const document = {
    addEventListener(typ, fn) { if (!lauscher.has(typ)) lauscher.set(typ, []); lauscher.get(typ).push(fn); },
    dispatchEvent(e) { (lauscher.get(e.type) || []).forEach((fn) => fn(e)); },
    createElementNS: () => ({ setAttribute() {}, append() {} }),
    hidden: false,
  };
  const context = vm.createContext({
    window: windowStub,
    localStorage: {
      getItem: (key) => (speicher.has(key) ? speicher.get(key) : null),
      setItem: (key, value) => speicher.set(key, String(value)),
      removeItem: (key) => speicher.delete(key),
    },
    document,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    URLSearchParams,
    Date: DateKlasse,
    Math,
    JSON,
    console,
  });
  const lade = (datei) => vm.runInContext(lies(datei), context, { filename: datei });
  const feuer = (typ, detail) => document.dispatchEvent({ type: typ, detail });
  return { windowStub, context, lade, speicher, feuer };
}

// --- Dinge -------------------------------------------------------------------
const basis = umgebung();
MOEBEL.forEach((datei) => basis.lade(datei));
basis.lade("bau-katalog.js");
const M = basis.windowStub.LernappBauMoebel;
const K = basis.windowStub.LernappBauKatalog;
pruefe(M && K, "bau-moebel.js oder bau-katalog.js setzen ihr window-Objekt nicht");

const dinge = Object.values(M.DINGE);
pruefe(dinge.length >= 600, `nur ${dinge.length} Dinge – jedes Zimmer braucht seine eigenen`);
pruefe(M.doppelt.length === 0, `Kennungen doppelt vergeben: ${M.doppelt.join(", ")}`);
const tagDinge = new Map();
for (const ding of dinge) {
  pruefe(ding.name && ding.der && /^(der|die|das) /.test(ding.der), `${ding.id}: Name oder Artikel fehlt`);
  pruefe(/^[a-z][a-z0-9_]*$/.test(ding.id), `${ding.id}: Kennung mit Umlaut oder Grossbuchstaben`);
  pruefe(["boden", "wand", "decke", "flach"].includes(ding.art), `${ding.id}: unbekannte Art ${ding.art}`);
  // Die Spielgeräte des KiddyDome (k_) dürfen über zwei Stockwerke reichen.
  const [wMax, hMax] = ding.id.startsWith("k_") ? [240, 380] : [200, 170];
  pruefe(ding.w > 0 && ding.h > 0 && ding.w <= wMax && ding.h <= hMax, `${ding.id}: Grösse ${ding.w} × ${ding.h} ausserhalb ${wMax} × ${hMax}`);
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
    pruefe(!/<defs|id=|url\(|<script|on[a-z]+=/i.test(svg), `${ding.id}: Zeichnung mit defs, id, url() oder Skript`);
  }
  if (ding.farbe) pruefe(M.zeichne(ding.id, "#123456").includes("#123456"), `${ding.id}: lässt sich umfärben, nimmt die Farbe aber nicht an`);
  for (const tag of ding.tags) {
    if (!tagDinge.has(tag)) tagDinge.set(tag, []);
    tagDinge.get(tag).push(ding.id);
  }
}
// Gleich auf jedem Gerät: keine Zufallszahlen in den Zeichnungen.
for (const ding of dinge) pruefe(M.zeichne(ding.id) === M.zeichne(ding.id), `${ding.id}: zeichnet sich jedes Mal anders`);

// Das Bild an der Wand: in jedem Zimmer sein eigenes Motiv.
{
  const motive = new Map();
  for (const raum of K.RAEUME_LISTE) {
    pruefe(typeof M.MOTIVE[raum.id] === "function", `${raum.id}: kein Bild-Motiv`);
    const bild = M.zeichne("bild", null, raum.id);
    pruefe(bild.length > 120 && !/undefined|NaN/.test(bild), `${raum.id}: das Bild an der Wand zeichnet sich nicht`);
    if (motive.has(bild)) fehler.push(`${raum.id}: dasselbe Bild an der Wand wie ${motive.get(bild)}`);
    motive.set(bild, raum.id);
  }
}

// Wünsche an Dinge: Jeder Wunsch hat ein Ding, und "Zeig mir" zeigt eines, das passt.
for (const [tag, wunsch] of Object.entries(K.DING_WUENSCHE)) {
  pruefe(tagDinge.has(tag), `Wunsch "${tag}": kein Ding erfüllt ihn`);
  pruefe(M.DINGE[wunsch.zeige]?.tags?.includes(tag), `Wunsch "${tag}": "Zeig mir" zeigt ${wunsch.zeige}, das ihn nicht erfüllt`);
  pruefe(/^(ein|eine|einen) |^[A-ZÄÖÜ]|^etwas /.test(wunsch.ein), `Wunsch "${tag}": "${wunsch.ein}" passt nicht in "Ich hätte gerne …"`);
}

// --- Häuser und Zimmer ----------------------------------------------------------
pruefe(K.HAEUSER.map((h) => h.id).join() === "wohnhaus,spital,zentrum,buero", "die vier Häuser stimmen nicht");
pruefe(K.HAUS.zentrum.name === "Dorf" && K.HAUS.buero.name === "Büro", `die Häuser heissen ${K.HAUS.zentrum.name} und ${K.HAUS.buero.name} statt Dorf und Büro`);
pruefe(!("PLAUDERN" in K) && !/plaudern|bau-fragen/i.test(lies("train-bau.js")), "das Plaudern mit dem Tier ist noch da");
pruefe(K.WOHNEN.join() === "schlafzimmer,kinderzimmer", "gewohnt wird nicht in Schlaf- und Kinderzimmern");
const gesehen = new Set();
for (const haus of K.HAEUSER) {
  pruefe(haus.raeume.length >= 8, `${haus.id}: nur ${haus.raeume.length} Zimmerarten`);
  pruefe(K.FARBE[haus.fassade] && K.FARBE[haus.dach], `${haus.id}: Fassade oder Dach ohne Farbe`);
  pruefe(/^im /.test(haus.im) && haus.text.length > 20, `${haus.id}: "im …" oder Beschreibung fehlt`);
}
// Wo ein Ding vorkommt – nur so viele Zimmer, wie es in ihren Listen steht.
const vorkommen = new Map();
for (const [raumId, ids] of Object.entries(M.RAUM_DINGE)) {
  pruefe(K.RAEUME[raumId], `RAUM_DINGE: unbekanntes Zimmer ${raumId}`);
  for (const id of ids) {
    pruefe(M.DINGE[id], `${raumId}: unbekanntes Ding ${id}`);
    pruefe(!M.UEBERALL.includes(id), `${raumId}: ${id} gibt es überall, es gehört nicht in die Liste`);
    if (!vorkommen.has(id)) vorkommen.set(id, new Set());
    vorkommen.get(id).add(raumId);
  }
}
for (const raum of K.RAEUME_LISTE) {
  pruefe(!gesehen.has(raum.id), `Zimmer ${raum.id} doppelt`);
  gesehen.add(raum.id);
  pruefe(K.HAUS[raum.haus], `${raum.id}: unbekanntes Haus`);
  pruefe(/^(der|die|das) /.test(raum.der) && raum.ein, `${raum.id}: Artikel fehlt`);
  pruefe(raum.text.length >= 40 && /[.!?]$/.test(raum.text), `${raum.id}: Beschreibung zu kurz oder ohne Satzende`);
  pruefe(K.FARBE[raum.wand] && K.BODEN[raum.boden] && K.MUSTER.some((m) => m.id === raum.muster), `${raum.id}: Wand, Boden oder Muster unbekannt`);
  pruefe(M.DINGE[raum.icon], `${raum.id}: Bild ${raum.icon} fehlt`);
  const eigene = M.RAUM_DINGE[raum.id] || [];
  const nurHier = eigene.filter((id) => vorkommen.get(id)?.size === 1);
  pruefe(eigene.length >= 12, `${raum.id}: nur ${eigene.length} Dinge in der Schublade`);
  pruefe(nurHier.length >= 10, `${raum.id}: nur ${nurHier.length} Dinge, die es nur hier gibt – das Zimmer ist nicht zu erkennen`);
  // Gewohnt wird nur in den Wohnungen; gearbeitet in den Zimmern der anderen Häuser.
  if (raum.haus === "wohnhaus") pruefe(!raum.job, `${raum.id}: ein Job im Wohnhaus`);
  else pruefe(raum.job && !raum.wohnen && !/[.!?]$/.test(raum.job), `${raum.id}: ohne Job`);
}
// Was nur in bestimmte Zimmer gehört: kein Bett im Eingang, kein WC im Schlafzimmer.
{
  const NUR = {
    bett: ["schlafzimmer"], doppelbett: ["schlafzimmer"], kinderbett: ["kinderzimmer"], hochbett: ["kinderzimmer"],
    wc: ["bad", "toiletten", "buerowc"], wanne: ["bad"], dusche: ["bad", "hallenbad", "turnhalle", "fitness", "toiletten", "buerowc"],
    kochherd: ["kueche", "restaurant", "cafe", "cafeteria", "spitalcafeteria", "kita", "schule"],
    waschmaschine: ["waschzimmer"], tumbler: ["waschzimmer"],
  };
  for (const [id, erlaubt] of Object.entries(NUR)) {
    for (const raumId of vorkommen.get(id) || []) pruefe(erlaubt.includes(raumId), `${id} gehört nicht in ${K.RAEUME[raumId]?.der || raumId}`);
  }
}
// Die Wohnungen: Jeder gelbe Wunsch lässt sich mit dem erfüllen, was in der
// Schublade liegt – den Dingen des Zimmers, den Lieblingsdingen, dem, was es
// überall gibt.
for (const raumId of K.WOHNEN) {
  const raum = K.RAEUME[raumId];
  const schublade = new Set([...K.dingeFuer(raumId), ...M.UEBERALL]);
  pruefe(raum.wuensche.length >= 6 && raum.wuensche.every((t) => K.DING_WUENSCHE[t]), `${raumId}: zu wenig oder unbekannte Wünsche`);
  for (const tag of raum.wuensche) pruefe([...schublade].some((id) => M.DINGE[id].tags.includes(tag)), `${raumId}: Wunsch "${tag}" – nichts in der Schublade erfüllt ihn`);
  for (const id of K.LIEBLINGS) pruefe(K.dingeFuer(raumId).includes(id), `${raumId}: das Lieblingsding ${id} fehlt in der Schublade`);
}
for (const r of K.HAUS_WUENSCHE.wohnhaus) pruefe(K.RAEUME[r]?.haus === "wohnhaus" && !K.RAEUME[r].wohnen, `grüner Wunsch ${r}: kein Zimmer des Wohnhauses für zwei`);
for (const w of K.FREMD_WUENSCHE.wohnhaus) {
  pruefe(w.haus !== "wohnhaus" && K.RAEUME[w.raum]?.haus === w.haus, `blauer Wunsch ${w.haus}/${w.raum} stimmt nicht`);
  pruefe(w.warum && /[.!]$/.test(w.warum), `blauer Wunsch ${w.raum}: ohne Begründung`);
}

// Tiere
pruefe(K.TIER_IDS.length >= 16, "weniger als 16 Tierarten");
const alleNamen = new Set();
for (const [id, tier] of Object.entries(K.TIERE)) {
  pruefe(/^(der|die|das) /.test(tier.der) && tier.coat && tier.inner && tier.ear, `${id}: Name, Farben oder Ohren fehlen`);
  pruefe(K.DING_WUENSCHE[tier.mag.ding] && K.FAMILIEN[tier.mag.farbe], `${id}: Lieblingsding oder -farbe unbekannt`);
  pruefe(K.LIEBLINGS.some((d) => M.DINGE[d]?.tags.includes(tier.mag.ding)), `${id}: das Lieblingsding liegt in keiner Wohnung`);
  pruefe(tier.namen.length >= 4, `${id}: zu wenig Namen`);
  for (const n of tier.namen) { pruefe(!alleNamen.has(n), `Name ${n} doppelt`); alleNamen.add(n); }
}
for (const fam of Object.keys(K.FAMILIEN)) pruefe(K.FARBEN.some((f) => f.familie === fam), `Farbfamilie ${fam} ohne Farbe in der Palette`);

// Die Figuren aus den Büchern der Leseecke: Art, Buch mit Umschlag, was sie
// mag (in jeder Wohnung zu haben), Wunsch und Traumjob aus ihrer Geschichte.
{
  const buecherJs = lies("lesen-buecher.js");
  const ids = new Set();
  const generisch = new Set(Object.values(K.TIERE).flatMap((t) => t.namen));
  pruefe(K.FIGUREN.length >= 12, `nur ${K.FIGUREN.length} Figuren aus den Büchern`);
  for (const f of K.FIGUREN) {
    pruefe(!ids.has(f.id) && /^[a-z]+$/.test(f.id), `Figur ${f.id}: Kennung doppelt oder ungültig`);
    ids.add(f.id);
    pruefe(K.TIERE[f.a] && f.n && f.ich && /[.!?]$/.test(f.ich) && !f.ich.includes("ß"), `Figur ${f.id}: Art, Name oder Satz fehlt`);
    pruefe(f.buecher.length >= 1 && f.buecher.every((b) => buecherJs.includes(`id: "${b.id}"`) && fs.existsSync(path.join(root, "bilder/buecher", b.id, "umschlag-klein.webp")) && b.titel), `Figur ${f.id}: ein Buch fehlt in der Leseecke`);
    pruefe(K.DING_WUENSCHE[f.mag.ding] && K.FAMILIEN[f.mag.farbe], `Figur ${f.id}: Lieblingsding oder -farbe unbekannt`);
    pruefe([...K.LIEBLINGS, ...M.UEBERALL].some((d) => M.DINGE[d]?.tags.includes(f.mag.ding)), `Figur ${f.id}: was sie mag, liegt in keiner Wohnung`);
    if (f.wunsch) pruefe(K.RAEUME[f.wunsch.raum]?.haus === f.wunsch.haus && f.wunsch.haus !== "wohnhaus" && /[.!]$/.test(f.wunsch.warum), `Figur ${f.id}: Wunsch ${f.wunsch.raum} stimmt nicht`);
    if (f.traum) { const [h, r] = f.traum.split(":"); pruefe(K.RAEUME[r]?.haus === h && K.RAEUME[r].job, `Figur ${f.id}: Traumjob ${f.traum} gibt es nicht`); }
    for (const n of [f.n, ...(f.auch || [])]) pruefe(!generisch.has(n), `Figur ${f.id}: ${n} heisst auch ein gewöhnliches Tier`);
  }
  pruefe(ids.has("leo") && K.FIGUREN.find((f) => f.id === "leo").mag.ding === "melone", "Leo mag keine Melonen");
}

// Schweizer Rechtschreibung: kein ß in allem, was die Kinder hören oder sehen.
for (const datei of [...MOEBEL, "bau-katalog.js", "bau-stand.js", "bau-tiere.js", "bau-art.js", "train-bau.js", "bau.css"]) {
  pruefe(!lies(datei).includes("ß"), `${datei}: enthält ein ß`);
}

// --- Der Stand ---------------------------------------------------------------
// mitCloud: der Kasten läuft über game-cloud.js wie in der App, firebase steht
// für die Cloud (getUser, getGameState, saveGameState). mitReise: die Ziegel
// kommen aus journey-plan.js statt aus einer festen Zahl.
function standUmgebung({ paletten = 0, frei = false, jetzt = null, mitCloud = false, firebase = null, mitReise = false, vorher = null } = {}) {
  const u = umgebung({ jetzt });
  let verdient = paletten;
  u.windowStub.LernappEntitlement = { isFree: () => frei, stationFree: () => frei };
  if (firebase) u.windowStub.LernappFirebase = firebase;
  if (vorher) vorher(u);
  if (mitCloud) u.lade("game-cloud.js");
  if (mitReise) u.lade("journey-plan.js");
  else u.windowStub.LernappReise = { bauPaletten: () => verdient, onBauLieferung() {} };
  MOEBEL.forEach((datei) => u.lade(datei));
  u.lade("bau-katalog.js");
  u.lade("bau-stand.js");
  return { S: u.windowStub.LernappBauStand, R: u.windowStub.LernappReise, setzeVerdient: (n) => { verdient = n; }, u };
}
const morgen10 = () => ({ wert: new Date(2026, 9, 8, 10, 0, 0).getTime() });
// Ein Ding mit dieser Eigenschaft, das in der Schublade dieses Zimmers liegt.
function dingMit(raumId, tag) {
  return [...K.dingeFuer(raumId), ...M.UEBERALL].find((id) => M.DINGE[id].tags.includes(tag));
}
// Alle gelben Wünsche einer Wohnung erfüllen.
function erfuelleGelbe(S, hausId, index) {
  const st = S.stock(hausId, index);
  for (const tier of st.tiere) {
    for (const w of S.wuensche(tier.seed).filter((x) => x.stern === "gelb" && !x.erfuellt)) {
      if (w.typ === "ding") S.aendereZimmer(hausId, index, 0, (z) => z.dinge.push({ k: `g${z.dinge.length}`, i: dingMit(st.zimmer[0].raum, w.tag), x: 100, y: 230, c: "", f: 0, s: 1 }));
      if (w.typ === "farbe") S.aendereZimmer(hausId, index, 0, (z) => { z.wand = K.FARBEN.find((f) => f.familie === w.familie).id; });
      if (w.typ === "boden") S.aendereZimmer(hausId, index, 0, (z) => { z.bodenFarbe = K.FARBEN.find((f) => f.familie === w.familie).id; });
    }
  }
  // Alle zugleich: Zwei Farbwünsche für dieselbe Wand gibt es nicht mehr.
  for (const tier of st.tiere) {
    pruefe(S.wuensche(tier.seed).filter((x) => x.stern === "gelb").every((x) => x.erfuellt), `${tier.n}: in der Wohnung lassen sich nicht alle gelben Wünsche zugleich erfüllen`);
  }
}

{
  const { S } = standUmgebung();
  const leer = S.lesen();
  pruefe(S.FORMAT === 4 && leer.v === 4, "der Kasten ist nicht Fassung 4");
  pruefe(Object.keys(leer.haeuser).join() === "wohnhaus,spital,zentrum,buero", "leerer Stand: nicht vier Häuser");
  const wh = leer.haeuser.wohnhaus.stock;
  pruefe(wh.length === 3 && wh.every((s) => s.art === "wohnung" && s.zimmer.length === 1 && !s.zimmer[0].raum && !s.tiere.length), "das Wohnhaus beginnt nicht mit drei leeren Wohnungen");
  for (const id of ["spital", "zentrum", "buero"]) {
    const st = leer.haeuser[id].stock;
    pruefe(st.length === 1 && st[0].art === "eins" && st[0].zimmer.length === 1 && !st[0].zimmer[0].raum, `${id} beginnt nicht mit einem leeren Zimmer`);
  }
  pruefe(S.paletten() === 0 && !S.kannBauen("wohnhaus").ok && S.kannBauen("wohnhaus").grund === "ziegel", "ohne Ziegel lässt sich bauen");
  pruefe(S.verbaut() === 0, "die Stockwerke vom Anfang kosten Ziegel");
}

// Die Wohnung: Schlafzimmer oder Kinderzimmer, und gleich zieht jemand ein.
{
  const jetzt = morgen10();
  const { S } = standUmgebung({ paletten: 3, frei: true, jetzt });
  pruefe(S.waehleRaum("wohnhaus", 0, 0, "kueche") === null, "in einer Wohnung lässt sich eine Küche wählen");
  pruefe(S.waehleRaum("spital", 0, 0, "schlafzimmer") === null, "im Spital lässt sich ein Schlafzimmer wählen");
  pruefe(S.waehleRaum("spital", 0, 0, "kueche") === null, "im Spital lässt sich eine Küche des Wohnhauses wählen");
  const erstes = S.waehleRaum("wohnhaus", 0, 0, "schlafzimmer");
  pruefe(erstes && typeof erstes === "object" && K.TIERE[erstes.a], "mit der Wahl der Wohnung zieht kein Tier ein");
  const st = S.stock("wohnhaus", 0);
  pruefe(st.zimmer[0].wand === K.RAEUME.schlafzimmer.wand, "die neue Wohnung hat nicht die Farbe ihrer Art");
  pruefe(st.id !== "wohnhaus-0", "die Wohnung behält mit der Wahl die gemeinsame Kennung vom Anfang");
  pruefe(erstes.w.length === 2 && erstes.g.length === 1 && erstes.b.length === 2, `das Tier hat ${erstes.w.length}/${erstes.g.length}/${erstes.b.length} statt 2/1/2 Wünsche`);
  const mag = S.magVon(erstes);
  pruefe(erstes.w[0] === `ding:${mag.ding}` || erstes.w[0] === `farbe:${mag.farbe}`, "unter den gelben Wünschen fehlt, was das Tier besonders mag");
  const [th, tr] = erstes.traum.split(":");
  pruefe(K.RAEUME[tr]?.haus === th && K.RAEUME[tr].job, `Traumjob ${erstes.traum} gibt es nicht`);
  for (const w of S.wuensche(erstes.seed)) {
    pruefe(w.text && !/undefined/.test(w.text) && w.kurz, `Wunsch ${w.id} ohne Satz`);
    pruefe(!w.erfuellt || w.typ === "farbe", `Wunsch ${w.id} ist ohne Zutun erfüllt`);
  }
  // Mit der Zeit kommen zwei weitere – nicht sofort, und nie mehr als drei.
  pruefe(!S.zuzugFaellig(jetzt.wert + 60000), "gleich nach dem ersten zieht schon das nächste Tier ein");
  jetzt.wert += S.ZUZUG_MS + 1000;
  pruefe(S.zuzugFaellig(jetzt.wert)?.index === 0, "nach der Wartezeit zieht niemand ein");
  const zweites = S.ziehtEin("wohnhaus", 0);
  pruefe(zweites && zweites.a !== erstes.a, "das zweite Tier fehlt oder ist dieselbe Art wie das erste");
  pruefe(!zweites.w.some((w) => erstes.w.includes(w)), "Mitbewohner wünschen sich dasselbe");
  pruefe(!S.zuzugFaellig(jetzt.wert + 1000), "gleich nach dem zweiten zieht schon das dritte ein");
  jetzt.wert += S.ZUZUG_MS + 1000;
  pruefe(S.ziehtEin("wohnhaus", 0), "das dritte Tier zieht nicht ein");
  jetzt.wert += S.ZUZUG_MS + 1000;
  pruefe(!S.zuzugFaellig(jetzt.wert) && !S.ziehtEin("wohnhaus", 0), "in eine Wohnung ziehen mehr als drei Tiere");
  pruefe(!S.zuzugFaellig(jetzt.wert + 1e9), "in eine leere Wohnung (ohne Zimmerart) zieht jemand ein");
  const sterne = S.sterneStock("wohnhaus", 0);
  const zaehle = (farbe) => sterne.tiere.reduce((n, t) => n + t[farbe].length, 0);
  pruefe(zaehle("gelb") === 6 && zaehle("gruen") === 3 && zaehle("blau") === 6 && sterne.total === 15, `drei Tiere: ${zaehle("gelb")} gelbe, ${zaehle("gruen")} grüne, ${zaehle("blau")} blaue Sterne`);
  // Die Art der Wohnung ändern: alles bleibt, die Wünsche passen sich an.
  pruefe(S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer") === true && S.stock("wohnhaus", 0).tiere.length === 3, "beim Wechsel zum Kinderzimmer ziehen die Tiere aus");
  for (const t of S.stock("wohnhaus", 0).tiere) {
    pruefe(t.w.every((w) => w.startsWith("farbe:") || w.startsWith("boden:") || w === `ding:${S.magVon(t).ding}` || K.RAEUME.kinderzimmer.wuensche.includes(w.split(":")[1])), `${t.n}: Wünsche passen nicht zum Kinderzimmer`);
  }
}

// Erfüllt ist, was im Haus steht – gelb in der Wohnung, grün im Wohnhaus,
// blau in den anderen Häusern.
{
  const { S } = standUmgebung({ paletten: 3, frei: true });
  const tier = S.waehleRaum("wohnhaus", 0, 0, "schlafzimmer");
  erfuelleGelbe(S, "wohnhaus", 0);
  pruefe(S.sterne(tier.seed).gelb.every(Boolean), "alle gelben Wünsche erfüllt, aber nicht alle Sterne");
  // Grün: ein Stockwerk für zwei Zimmer im Wohnhaus.
  const gruen = S.wuensche(tier.seed).find((w) => w.stern === "gruen");
  const i = S.baueStockwerk("wohnhaus");
  pruefe(i === 3 && S.stock("wohnhaus", i).art === "", "ein neues Stockwerk im Wohnhaus ist nicht zuerst ein Rohbau");
  pruefe(S.waehleArt("wohnhaus", i, "zwei") && S.stock("wohnhaus", i).zimmer.length === 2, "ein Stockwerk für zwei Zimmer hat nicht zwei Plätze");
  pruefe(!S.waehleArt("wohnhaus", i, "wohnung"), "die Art eines Stockwerks lässt sich zweimal wählen");
  pruefe(S.waehleRaum("wohnhaus", i, 0, "schlafzimmer") === null, "auf einem Stockwerk für zwei lässt sich eine Wohnung wählen");
  pruefe(S.waehleRaum("wohnhaus", i, 1, gruen.raum) === true, `${gruen.raum} lässt sich nicht wählen`);
  pruefe(S.stock("wohnhaus", i).tiere.length === 0, "in ein Zimmer für zwei zieht ein Tier ein");
  pruefe(S.sterne(tier.seed).gruen.every(Boolean), "der grüne Wunsch geht mit dem Zimmer nicht in Erfüllung");
  // Blau: die Zimmer in den anderen Häusern – im leeren Stockwerk vom Anfang,
  // sonst in einem neuen.
  let gebaut = 0;
  for (const w of S.wuensche(tier.seed).filter((x) => x.stern === "blau")) {
    const frei = S.haus(w.haus).stock.findIndex((x) => x.art === "eins" && !x.zimmer[0]?.raum);
    const j = frei >= 0 ? frei : S.baueStockwerk(w.haus);
    if (frei < 0) gebaut += 1;
    // Der KiddyDome braucht ein freies Stockwerk gleich darüber.
    if (K.RAEUME[w.raum]?.doppel && !S.doppelPlatz(w.haus, j)) { S.baueStockwerk(w.haus, { ueber: j }); gebaut += 1; }
    // waehleRaum gibt true (beim KiddyDome die beiden Stockwerke) oder null.
    pruefe(S.stock(w.haus, j).art === "eins" && Boolean(S.waehleRaum(w.haus, j, 0, w.raum)), `${w.raum}: im ${w.haus} lässt sich kein Zimmer einrichten`);
  }
  const st = S.sterne(tier.seed);
  pruefe(st.anzahl === 5 && st.total === 5, `alle Wünsche erfüllt, aber ${st.anzahl} von ${st.total} Sternen`);
  pruefe(S.laune(tier.seed).stufe === 3, "alle Sterne, aber das Tier ist nicht überglücklich");
  // Wegräumen nimmt den Stern wieder weg.
  S.aendereZimmer("wohnhaus", 0, 0, (z) => { z.dinge = []; z.wand = "creme"; });
  pruefe(S.sterne(tier.seed).anzahl < 5, "weggeräumt, aber der Stern bleibt");
  pruefe(S.laune(tier.seed).text, "ohne Sterne keine Laune");
  pruefe(S.verbaut() === 1 + gebaut, `Ziegel: ${S.verbaut()} verbaut statt ${1 + gebaut}`);
}

// Die Schranke: ohne Kauf bis zum vierten Stockwerk, mit Kauf bis zwanzig.
{
  const { S } = standUmgebung({ paletten: 40, frei: false });
  while (S.kannBauen("spital").ok) S.baueStockwerk("spital");
  pruefe(S.haus("spital").stock.length === S.STOCK_OHNE_KAUF && S.kannBauen("spital").grund === "schranke", `ohne Kauf: ${S.haus("spital").stock.length} Stockwerke im Spital, Grund ${S.kannBauen("spital").grund}`);
  S.baueStockwerk("wohnhaus");
  pruefe(S.haus("wohnhaus").stock.length === S.STOCK_OHNE_KAUF && !S.kannBauen("wohnhaus").ok, "ohne Kauf wächst das Wohnhaus über das vierte Stockwerk");
  pruefe(S.haus("spital").stock.every((x) => x.art === "eins" && x.zimmer.length === 1), "im Spital hat ein neues Stockwerk nicht ein Zimmer");
  pruefe(!S.waehleArt("spital", 1, "zwei"), "im Spital lässt sich ein Stockwerk für zwei Zimmer wählen");
  pruefe(S.waehleRaum("spital", 1, 1, "labor") === null && S.waehleRaum("spital", 1, 0, "labor") === true, "im Spital gibt es einen zweiten Platz im Stockwerk");
  const mitKauf = standUmgebung({ paletten: 40, frei: true }).S;
  while (mitKauf.kannBauen("buero").ok) mitKauf.baueStockwerk("buero");
  pruefe(mitKauf.haus("buero").stock.length === mitKauf.STOCK_MAX && mitKauf.kannBauen("buero").grund === "voll", "mit Kauf: das Haus wächst nicht bis zur Höchstzahl");
}

// Die Reihenfolge: Ein Stockwerk tauscht mit dem Nachbarn, und so bleibt es –
// auch nach dem Zusammenführen mit einem Gerät, das noch die alte kennt.
{
  const jetzt = morgen10();
  const { S } = standUmgebung({ paletten: 5, frei: true, jetzt });
  S.baueStockwerk("spital");
  S.baueStockwerk("spital");
  S.waehleRaum("spital", 2, 0, "notfall");
  const vorher = JSON.parse(JSON.stringify(S.lesen()));
  jetzt.wert += 60000;
  const ids = S.haus("spital").stock.map((s) => s.id);
  pruefe(S.verschiebe("spital", 2, -1) === 1 && S.verschiebe("spital", 1, -1) === 0, "ein Stockwerk lässt sich nicht nach unten stellen");
  const neu = S.haus("spital").stock.map((s) => s.id);
  pruefe(neu.join() === [ids[2], ids[0], ids[1]].join(), `nach dem Umstellen: ${neu.join()} statt ${[ids[2], ids[0], ids[1]].join()}`);
  pruefe(S.verschiebe("spital", 0, -1) === 0 && S.verschiebe("spital", 2, 1) === 2, "das unterste lässt sich nach unten oder das oberste nach oben stellen");
  pruefe(S.normalize(S.lesen()).haeuser.spital.stock.map((s) => s.id).join() === neu.join(), "die Reihenfolge übersteht das Aufräumen nicht");
  const ab = S.merge(S.lesen(), vorher);
  pruefe(ab.haeuser.spital.stock.map((s) => s.id).join() === neu.join(), "die neue Reihenfolge geht beim Zusammenführen mit einem älteren Stand verloren");
  pruefe(JSON.stringify(ab) === JSON.stringify(S.merge(vorher, S.lesen())), "Zusammenführen nach dem Umstellen ist nicht in beide Richtungen gleich");
}

// Die Zeit: neuer Wunsch frühestens am nächsten Tag, nur wenn beide gelben erfüllt sind.
{
  const jetzt = morgen10();
  const { S } = standUmgebung({ jetzt });
  const tier = S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
  const vorher = [...tier.w];
  jetzt.wert += 26 * 3600 * 1000;
  pruefe(!S.tick(jetzt.wert).some((e) => e.typ === "neuerWunsch"), "neuer Wunsch, obwohl die gelben nicht erfüllt sind");
  erfuelleGelbe(S, "wohnhaus", 0);
  S.stock("wohnhaus", 0).tiere[0].wAt = jetzt.wert;
  pruefe(!S.tick(jetzt.wert + 3600 * 1000).some((e) => e.typ === "neuerWunsch"), "neuer Wunsch noch am selben Tag");
  const e = S.tick(jetzt.wert + 24 * 3600 * 1000);
  const nachher = S.stock("wohnhaus", 0).tiere[0].w;
  pruefe(e.some((x) => x.typ === "neuerWunsch" && x.seed === tier.seed), "am nächsten Tag mit beiden gelben Sternen kommt kein neuer Wunsch");
  pruefe(nachher[0] === vorher[0] && nachher[1] !== vorher[1], "beim Wechsel fällt das Lieblingsding weg, oder der zweite Wunsch bleibt");
  pruefe(K.RAEUME.kinderzimmer.wuensche.includes(nachher[1].split(":")[1]), "der neue Wunsch passt nicht ins Zimmer");
  // Hinausschicken: bald kommt ein neues Tier, eine andere Art.
  const alt = tier.a;
  S.hinausschicken(tier.seed);
  pruefe(S.stock("wohnhaus", 0).tiere.length === 0, "hinausgeschickt, aber das Tier ist noch da");
  pruefe(!S.zuzugFaellig(jetzt.wert + 1000), "das neue Tier kommt sofort");
  jetzt.wert += S.TIER_KOMMT_MS + 1000;
  const fall = S.zuzugFaellig(jetzt.wert);
  const neu = fall && S.ziehtEin(fall.hausId, fall.index);
  pruefe(neu && neu.a !== alt, "nach der Wartezeit zieht kein neues Tier ein, oder dieselbe Art");
}

// Arbeit: Traumjob zuerst, sonst irgendein Job – höchstens drei im selben Zimmer.
{
  const jetzt = morgen10();
  const { S } = standUmgebung({ paletten: 9, frei: true, jetzt });
  for (let i = 0; i < 3; i += 1) {
    S.waehleRaum("wohnhaus", i, 0, i % 2 ? "kinderzimmer" : "schlafzimmer");
    for (let n = 0; n < 2; n += 1) { jetzt.wert += S.ZUZUG_MS + 1000; S.ziehtEin("wohnhaus", i); }
  }
  const alle = S.alleTiere();
  pruefe(alle.length === 9, `${alle.length} statt neun Tiere in drei Wohnungen`);
  pruefe(alle.every((e) => !S.jobVon(e.tier.seed)), "ohne Arbeitsplatz hat ein Tier einen Job");
  // Alle wünschen sich die Arbeit in der Bibliothek (und als blaue Wünsche
  // zwei Abteilungen des Spitals, die es nicht gibt).
  for (let i = 0; i < 3; i += 1) S.aendereStock("wohnhaus", i, (st) => st.tiere.forEach((t) => { t.traum = "zentrum:bibliothek"; t.b = ["fremd:spital:augen", "fremd:spital:apotheke"]; }));
  S.waehleRaum("zentrum", 0, 0, "bibliothek");
  S.waehleRaum("zentrum", S.baueStockwerk("zentrum"), 0, "baeckerei");
  const jobs = alle.map((e) => S.jobVon(e.tier.seed));
  const traum = jobs.filter((j) => j?.traum);
  pruefe(traum.length === 3 && traum.every((j) => j.raum === "bibliothek"), `${traum.length} statt drei Tiere im Traumjob`);
  pruefe(jobs.filter((j) => j && !j.traum).length === 3 && jobs.filter((j) => !j).length === 3, "die übrigen nehmen nicht irgendeinen Job, wo Platz ist");
  const proZimmer = new Map();
  jobs.filter(Boolean).forEach((j) => { const k = `${j.haus}:${j.index}:${j.slot}`; proZimmer.set(k, (proZimmer.get(k) || 0) + 1); });
  pruefe([...proZimmer.values()].every((n) => n <= S.ARBEIT_MAX), "mehr als drei Tiere im selben Zimmer bei der Arbeit");
  pruefe(/^Bücher ausleihen in der Bibliothek \(Dorf\)$/.test(S.jobText("bibliothek", "zentrum")), `Job heisst "${S.jobText("bibliothek", "zentrum")}"`);
  // Oben im Zimmer stehen nur, wer hier den Traumjob hat oder sich das
  // Zimmer wünscht – nicht, wer hier nur irgendeine Arbeit hat.
  const bib = S.zimmerTiere("zentrum", 0, 0);
  pruefe(bib.length === 3 && bib.every((e) => e.traumHier), `oben in der Bibliothek: ${bib.length} Tiere, ${bib.filter((e) => e.traumHier).length} mit Traumjob`);
  const baeckerei = S.haus("zentrum").stock.findIndex((x) => x.zimmer[0].raum === "baeckerei");
  pruefe(S.zimmerTiere("zentrum", baeckerei, 0).length === 0, "oben in der Bäckerei stehen Tiere, die dort nur irgendeine Arbeit haben");
  const wuenscher = alle.find((e) => !S.jobVon(e.tier.seed)).tier;
  S.aendereStock("wohnhaus", S.findeTier(wuenscher.seed).index, (st) => { st.tiere.find((t) => t.seed === wuenscher.seed).b[0] = "fremd:zentrum:baeckerei"; });
  const nachWunsch = S.zimmerTiere("zentrum", baeckerei, 0);
  pruefe(nachWunsch.length === 1 && nachWunsch[0].tier.seed === wuenscher.seed && nachWunsch[0].wunsch && !nachWunsch[0].traumHier, "wer sich die Bäckerei wünscht, steht oben in der Bäckerei nicht");
  pruefe(S.zimmerTiere("wohnhaus", 0, 0).length === 0, "in einer Wohnung zählt zimmerTiere Arbeitende");
  // Die Wohnung zeigt von aussen, wie viele ihren Traumjob haben.
  const stufen = [0, 1, 2].map((i) => S.traumjobsStock("wohnhaus", i));
  pruefe(stufen.reduce((a, b) => a + b, 0) === 3 && stufen.every((n) => n >= 0 && n <= 3), `Traumjobs je Wohnung: ${stufen.join("/")}`);
  pruefe(alle.filter((e) => S.hatTraumjob(e.tier.seed)).length === 3, "hatTraumjob stimmt nicht mit den Jobs überein");
  // Unterwegs: meist daheim, manchmal bei der Arbeit oder zu Besuch.
  const seed = alle.find((e) => S.jobVon(e.tier.seed)).tier.seed;
  const tag0 = new Date(2026, 9, 12, 0, 0, 0).getTime();
  const zahl = { daheim: 0, arbeit: 0, besuch: 0 };
  let proben = 0;
  for (let d = 0; d < 12; d += 1) {
    for (let q = 28; q < 80; q += 1) {
      const t = tag0 + d * 86400000 + q * 15 * 60000;
      const wo = S.aufenthalt(seed, t);
      zahl[wo.wo] += 1;
      proben += 1;
      if (wo.wo !== "daheim") {
        pruefe(wo.haus !== "wohnhaus" && S.zimmer(wo.haus, wo.index, wo.slot)?.raum, `unterwegs an einem Ort ohne Zimmer: ${JSON.stringify(wo)}`);
        pruefe(S.besucher(wo.haus, wo.index, wo.slot, t).some((b) => b.tier.seed === seed), "wer unterwegs ist, steht nicht in der Liste des Zimmers");
      }
      pruefe(JSON.stringify(S.aufenthalt(seed, t + 60000)) === JSON.stringify(wo), "innerhalb derselben Viertelstunde wechselt der Ort");
    }
  }
  const anteil = (n) => Math.round((n / proben) * 100);
  pruefe(anteil(zahl.daheim) >= 40 && anteil(zahl.daheim) <= 70, `daheim ${anteil(zahl.daheim)} % der Zeit – erwartet etwa 55 %`);
  pruefe(anteil(zahl.arbeit) >= 12 && anteil(zahl.besuch) >= 8, `bei der Arbeit ${anteil(zahl.arbeit)} %, zu Besuch ${anteil(zahl.besuch)} %`);
  for (const stunde of [21, 23, 3, 6]) pruefe(S.aufenthalt(seed, tag0 + 86400000 + stunde * 3600000).wo === "daheim", `um ${stunde} Uhr ist ein Tier nicht daheim`);
  pruefe(S.woText(seed, tag0 + 86400000 + 22 * 3600000) === "ist zu Hause", "nachts steht nicht \"ist zu Hause\"");
}

// Die Figuren aus den Büchern ziehen zuerst ein – jede nur einmal, mit
// ihrem Wunsch und ihrem Traumjob; ein Leo von früher ist Leo aus dem Buch.
{
  const jetzt = morgen10();
  const { S } = standUmgebung({ paletten: 9, frei: true, jetzt });
  const eingezogen = [];
  for (let i = 0; i < 3; i += 1) {
    eingezogen.push(S.waehleRaum("wohnhaus", i, 0, i === 1 ? "kinderzimmer" : "schlafzimmer"));
    for (let k = 0; k < 2; k += 1) { jetzt.wert += S.ZUZUG_MS + 1000; eingezogen.push(S.ziehtEin("wohnhaus", i)); }
  }
  const figuren = eingezogen.map((t) => S.figurVon(t));
  pruefe(figuren.every(Boolean), `nicht zuerst die Figuren aus den Büchern: ${eingezogen.map((t) => t.n).join(", ")}`);
  pruefe(new Set(figuren.map((f) => f?.id)).size === figuren.length, "eine Figur aus den Büchern zieht zweimal ein");
  for (const [n, t] of eingezogen.entries()) {
    const f = figuren[n];
    if (!f) continue;
    if (f.wunsch) pruefe(t.b[0] === `fremd:${f.wunsch.haus}:${f.wunsch.raum}` && S.wuensche(t.seed).find((w) => w.id === t.b[0])?.text.includes(f.wunsch.warum), `${f.n}: der blaue Wunsch kommt nicht aus der Geschichte`);
    if (f.traum) pruefe(t.traum === f.traum, `${f.n}: der Traumjob kommt nicht aus der Geschichte`);
    pruefe([`ding:${f.mag.ding}`, `farbe:${f.mag.farbe}`, `boden:${f.mag.farbe}`].includes(t.w[0]), `${f.n}: der gelbe Wunsch ist nicht, was sie im Buch mag`);
  }
  // Je Wohnung höchstens ein Wunsch nach einer Wandfarbe und einer nach
  // einer Bodenfarbe – zwei verschiedene liessen sich nie zugleich erfüllen.
  for (let i = 0; i < 3; i += 1) {
    const w = S.stock("wohnhaus", i).tiere.flatMap((t) => t.w);
    pruefe(w.filter((x) => x.startsWith("farbe:")).length <= 1 && w.filter((x) => x.startsWith("boden:")).length <= 1, `Wohnung ${i}: mehr als ein Farbwunsch für Wand oder Boden (${w.join(", ")})`);
  }
  // Ein älterer Stand mit zwei verschiedenen Wandfarben wird beim Lesen
  // geheilt: Wessen Farbe schon an der Wand ist, behält den Wunsch, das
  // andere Tier wünscht sich seine Farbe für den Boden.
  {
    const wand = K.FARBEN.find((f) => f.familie === "blau").id;
    const geheilt = S.normalize({ v: S.FORMAT, haeuser: { wohnhaus: { stock: [{ art: "wohnung", zimmer: [{ raum: "schlafzimmer", wand }], tiere: [
      { a: "fox", n: "Fino", seed: "h1", w: ["farbe:rot", "ding:ball"] },
      { a: "cat", n: "Mimi", seed: "h2", w: ["farbe:blau", "ding:buch"] },
      { a: "bear", n: "Bruno", seed: "h3", w: ["farbe:gruen", "ding:lampe"] },
    ] }] } } }).haeuser.wohnhaus.stock[0].tiere;
    const ww = geheilt.map((t) => t.w);
    pruefe(ww[1][0] === "farbe:blau" && ww[0][0] === "boden:rot" && !ww.flat().some((x) => x === "farbe:rot" || x === "farbe:gruen"), `zwei Wandfarben in einer Wohnung werden nicht geheilt (${JSON.stringify(ww)})`);
    pruefe(ww.flat().filter((x) => x.startsWith("boden:")).length === 1, `nach dem Heilen wünschen sich zwei Tiere eine Bodenfarbe (${JSON.stringify(ww)})`);
  }
  // Ein Leo, der schon früher eingezogen ist.
  const leo = S.normalize({ v: S.FORMAT, haeuser: { wohnhaus: { stock: [{ art: "wohnung", zimmer: [{ raum: "schlafzimmer" }], tiere: [{ a: "lion", n: "Leo", seed: "alt1" }] }] } } }).haeuser.wohnhaus.stock[0].tiere[0];
  pruefe(S.figurVon(leo)?.id === "leo" && S.magVon(leo).ding === "melone", "ein früher eingezogener Leo ist nicht Leo aus dem Buch");
  pruefe(S.figurVon({ a: "mouse", n: "Rosa" })?.id === "rosa" && !S.figurVon({ a: "fox", n: "Leo" }), "Figuren werden falsch erkannt");
  // Sind alle Figuren da, kommen gewöhnliche Tiere – mit Namen, die keine Figur trägt.
  const { S: V } = standUmgebung({ paletten: 99, frei: true, jetzt });
  const namen = new Set(K.FIGUREN.flatMap((f) => [f.n, ...(f.auch || [])]));
  let gewoehnlich = null;
  for (let i = 0; i < 12 && !gewoehnlich; i += 1) {
    const idx = i < 3 ? i : V.baueStockwerk("wohnhaus");
    if (i >= 3) V.waehleArt("wohnhaus", idx, "wohnung");
    const t = V.waehleRaum("wohnhaus", idx, 0, "schlafzimmer");
    for (const x of [t, ...[0, 1].map(() => { jetzt.wert += V.ZUZUG_MS + 1000; return V.ziehtEin("wohnhaus", idx); })]) if (x && !V.figurVon(x)) { gewoehnlich = x; break; }
  }
  pruefe(gewoehnlich && !namen.has(gewoehnlich.n), `nach allen Figuren kommt kein gewöhnliches Tier, oder es trägt den Namen einer Figur (${gewoehnlich?.n})`);
}

// Der KiddyDome: ein Zimmer über zwei Stockwerke.
{
  const jetzt = morgen10();
  const { S } = standUmgebung({ paletten: 6, frei: true, jetzt });
  const arten = () => S.haus("zentrum").stock.map((s) => `${s.art}${s.zimmer[0]?.raum ? `:${s.zimmer[0].raum}` : ""}`).join(" | ");
  pruefe(K.RAEUME.kiddydome?.doppel && K.RAEUME.kiddydome.haus === "zentrum" && K.RAEUME.kiddydome.kinder, "der KiddyDome fehlt im Dorf");
  // Mit nur einem Stockwerk geht er nicht – und nichts ändert sich.
  pruefe(S.doppelPlatz("zentrum", 0) === null && S.waehleRaum("zentrum", 0, 0, "kiddydome") === null, "der KiddyDome geht mit einem einzigen Stockwerk");
  pruefe(S.zimmer("zentrum", 0, 0).raum === "" && S.haus("zentrum").stock.length === 1, "die abgelehnte Wahl ändert das Stockwerk");
  // Mit einem zweiten, leeren Stockwerk geht er – auch vom oberen aus.
  S.baueStockwerk("zentrum");
  const wahl = S.waehleRaum("zentrum", 1, 0, "kiddydome");
  const st = S.haus("zentrum").stock;
  pruefe(wahl?.unten === 0 && wahl.oben === 1 && S.istDoppel(st[0]) && st[1].art === "oben" && st[1].zu === st[0].id && !st[1].zimmer.length, `der KiddyDome liegt nicht auf zwei Stockwerken: ${arten()}`);
  pruefe(st[0].id !== "zentrum-0" && S.obenVon(st[0]) === -S.GEO.STOCK && S.hoeheVon(st[0]) === S.GEO.H + S.GEO.STOCK, "der KiddyDome ist nicht doppelt so hoch oder behält die Kennung vom Anfang");
  pruefe(S.verbaut() === 1, "der KiddyDome kostet mehr Ziegel als das eine gebaute Stockwerk");
  // Was oben hängt, bleibt oben; normalize ändert nichts mehr.
  S.aendereZimmer("zentrum", 0, 0, (z) => z.dinge.push({ k: "o1", i: "bild", x: 200, y: -180, c: "", f: 0, s: 1 }, { k: "o2", i: "deckenlampe", x: 90, y: -256, c: "", f: 0, s: 1 }));
  const n1 = S.normalize(S.lesen());
  const dd = n1.haeuser.zentrum.stock[0].zimmer[0].dinge;
  pruefe(dd.find((d) => d.k === "o1")?.y === -180 && dd.find((d) => d.k === "o2")?.y === -256, "im KiddyDome rutscht beim Aufräumen, was oben hängt");
  pruefe(JSON.stringify(S.normalize(n1)) === JSON.stringify(n1), "normalize ist beim KiddyDome nicht stabil");
  // Umstellen: der KiddyDome wandert als Ganzes, andere springen über ihn.
  S.waehleRaum("zentrum", S.baueStockwerk("zentrum"), 0, "bibliothek");
  pruefe(S.verschiebe("zentrum", 0, 1) === 1 && arten() === "eins:bibliothek | eins:kiddydome | oben", `der KiddyDome wandert nicht als Ganzes: ${arten()}`);
  pruefe(S.verschiebe("zentrum", 0, 1) === 2 && arten() === "eins:kiddydome | oben | eins:bibliothek", `die Bibliothek springt nicht über den KiddyDome: ${arten()}`);
  pruefe(S.verschiebe("zentrum", 1, 1) === 2 && arten() === "eins:bibliothek | eins:kiddydome | oben", `vom oberen Stockwerk aus wandert der KiddyDome nicht: ${arten()}`);
  // Zusammenführen mit einem anderen Gerät: beisammen, in beide Richtungen gleich.
  const anderes = standUmgebung({ paletten: 6, frei: true }).S;
  anderes.baueStockwerk("zentrum");
  const ab = S.merge(S.lesen(), anderes.lesen());
  pruefe(JSON.stringify(ab) === JSON.stringify(S.merge(anderes.lesen(), S.lesen())), "KiddyDome: Zusammenführen ist nicht in beide Richtungen gleich");
  const zs = ab.haeuser.zentrum.stock;
  const di = zs.findIndex((s) => s.zimmer[0]?.raum === "kiddydome");
  pruefe(di >= 0 && zs[di + 1]?.art === "oben" && zs[di + 1].zu === zs[di].id, "beim Zusammenführen fällt der KiddyDome auseinander");
  // Ein oberes ohne sein unteres wird ein leeres Stockwerk; fehlt das obere, kommt es dazu.
  const kaputt = S.normalize({ v: 3, haeuser: { zentrum: { stock: [
    { id: "a", pos: 0, art: "eins", zimmer: [{ raum: "kiddydome" }] },
    { id: "b", pos: 1, art: "eins", zimmer: [{ raum: "post" }] },
    { id: "c", pos: 2, art: "oben", zu: "weg", zimmer: [] },
  ] } } }).haeuser.zentrum.stock.map((s) => `${s.id}:${s.art}`).join();
  pruefe(kaputt === "a:eins,a^:oben,b:eins,c:eins", `ein zerrissener KiddyDome wird nicht geflickt: ${kaputt}`);
  // Zimmerart ändern: das obere wird frei, nichts hängt mehr über der Decke.
  const unten = S.haus("zentrum").stock.findIndex((s) => S.istDoppel(s));
  S.waehleRaum("zentrum", unten, 0, "kino");
  const nach = S.haus("zentrum").stock;
  pruefe(nach[unten].zimmer[0].raum === "kino" && nach[unten + 1].art === "eins" && !nach[unten + 1].zimmer[0].raum && !("zu" in nach[unten + 1]), `aus dem KiddyDome wird kein gewöhnliches Zimmer: ${arten()}`);
  pruefe(nach[unten].zimmer[0].dinge.every((d) => d.y >= 0), "nach dem KiddyDome hängt etwas über der Decke");
  // Dazubauen gleich darüber, mitten im Haus.
  const { S: D } = standUmgebung({ paletten: 6, frei: true, jetzt });
  D.waehleRaum("zentrum", 0, 0, "post");
  D.waehleRaum("zentrum", D.baueStockwerk("zentrum"), 0, "kino");
  pruefe(D.doppelPlatz("zentrum", 0) === null, "über der Post ist das Kino, und trotzdem hat der KiddyDome Platz");
  pruefe(D.baueStockwerk("zentrum", { ueber: 0 }) === 1 && D.waehleRaum("zentrum", 0, 0, "kiddydome")?.unten === 0, "gleich darüber dazubauen gibt keinen KiddyDome");
  pruefe(D.haus("zentrum").stock.map((s) => s.art).join() === "eins,oben,eins" && D.zimmer("zentrum", 2, 0).raum === "kino", "das Kino ist beim Dazubauen nicht eins hinaufgerückt");
  // Die Tiere aus dem Kinderzimmer gehen oft in den KiddyDome, die anderen seltener.
  const kind = D.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
  const schlaf = D.waehleRaum("wohnhaus", 1, 0, "schlafzimmer");
  const imKiddy = (seed, zeit) => { const a = D.aufenthalt(seed, zeit); return a.wo === "besuch" && a.haus === "zentrum" && D.zimmer("zentrum", a.index, a.slot)?.raum === "kiddydome"; };
  let tage = 0;
  const imDome = { kind: 0, schlaf: 0 };
  for (let k = 0; k < 600; k += 1) {
    const zeit = jetzt.wert + 20 * 60 * 1000 + k * 15 * 60 * 1000;
    if (new Date(zeit).getHours() >= 20 || new Date(zeit).getHours() < 7) continue;
    tage += 1;
    if (imKiddy(kind.seed, zeit)) imDome.kind += 1;
    if (imKiddy(schlaf.seed, zeit)) imDome.schlaf += 1;
  }
  pruefe(imDome.kind / tage > 0.3, `ein Tier aus dem Kinderzimmer ist nur ${Math.round((imDome.kind / tage) * 100)} % des Tages im KiddyDome`);
  pruefe(imDome.schlaf < imDome.kind, "ein Tier aus dem Schlafzimmer ist öfter im KiddyDome als eines aus dem Kinderzimmer");
}

// Der schlimmste Spielstand: alle Häuser bis oben, jedes Zimmer voll, drei
// Tiere je Wohnung, die längsten Kennungen. Er muss bequem in das
// Kontodokument passen (1 MiB für alles).
{
  const jetzt = morgen10();
  const { S } = standUmgebung({ paletten: 999, frei: true, jetzt });
  const lang = Object.keys(M.DINGE).sort((a, b) => b.length - a.length);
  for (const hausId of S.HAUS_IDS) {
    while (S.kannBauen(hausId).ok) S.baueStockwerk(hausId);
    const raeume = K.HAUS[hausId].raeume.filter((r) => !K.RAEUME[r].wohnen);
    S.haus(hausId).stock.forEach((s, i) => {
      if (!s.art) S.waehleArt(hausId, i, i % 3 ? "zwei" : "wohnung");
      const st = S.stock(hausId, i);
      st.zimmer.forEach((_, slot) => {
        S.waehleRaum(hausId, i, slot, st.art === "wohnung" ? K.WOHNEN[i % 2] : raeume[(i * 2 + slot) % raeume.length]);
        S.aendereZimmer(hausId, i, slot, (z) => {
          for (let n = z.dinge.length; n < S.dingeMax(S.breiteVon(st)); n += 1) z.dinge.push({ k: S.kennung("d"), i: lang[n % 5], x: 123.4, y: 229.6, c: "dunkelgruen", f: 1, s: 1.2 });
          z.bodenFarbe = "dunkelblau";
        });
      });
      if (st.art === "wohnung") for (let n = 0; n < 2; n += 1) { jetzt.wert += S.ZUZUG_MS + 1000; S.ziehtEin(hausId, i); }
    });
  }
  const tiere = S.alleTiere().length;
  pruefe(tiere >= 20, `der volle Stand hat nur ${tiere} Tiere`);
  const bytes = JSON.stringify(S.lesen()).length;
  if (process.env.GROESSE) console.log(`voller Stand: ${Math.round(bytes / 1000)} KB`);
  pruefe(bytes < 400000, `der volle Spielstand ist ${Math.round(bytes / 1000)} KB gross – zu viel fürs Kontodokument`);
}

// Zusammenführen: in beide Richtungen gleich, nichts geht verloren.
{
  const geraet = () => standUmgebung({ paletten: 3, frei: true }).S;
  const A = geraet();
  const B = geraet();
  // Beide richten im Spital im Stockwerk vom Anfang ein Zimmer ein.
  A.waehleRaum("spital", 0, 0, "notfall");
  A.aendereZimmer("spital", 0, 0, (z) => z.dinge.push({ k: "x1", i: K.dingeFuer("notfall")[0], x: 100, y: 230 }));
  B.waehleRaum("spital", 0, 0, "labor");
  B.waehleRaum("wohnhaus", 1, 0, "kinderzimmer");
  const ab = A.merge(A.lesen(), B.lesen());
  const ba = A.merge(B.lesen(), A.lesen());
  pruefe(JSON.stringify(ab) === JSON.stringify(ba), "Zusammenführen ist nicht in beide Richtungen gleich");
  const spital = ab.haeuser.spital.stock.flatMap((s) => s.zimmer.map((z) => z.raum)).filter(Boolean).sort().join();
  pruefe(spital === "labor,notfall", `zwei Geräte im selben Stockwerk: es bleiben ${spital || "keine Zimmer"}`);
  pruefe(ab.haeuser.spital.stock.find((s) => s.zimmer[0].raum === "notfall")?.zimmer[0].dinge.length === 1, "zwei Geräte: das Ding im Notfall ist weg");
  pruefe(ab.haeuser.wohnhaus.stock.length === 3 && ab.haeuser.wohnhaus.stock.filter((s) => s.zimmer[0].raum).length === 1, "die Wohnungen vom Anfang verdoppeln sich oder gehen verloren");
  pruefe(ab.haeuser.wohnhaus.stock.find((s) => s.zimmer[0].raum)?.tiere.length === 1, "beim Zusammenführen geht das Tier verloren");
  pruefe(ab.haeuser.buero.stock.length === 1 && ab.haeuser.zentrum.stock.length === 1, "unberührte Stockwerke vom Anfang verdoppeln sich");
  pruefe(JSON.stringify(A.merge(ab, ab)) === JSON.stringify(ab), "Zusammenführen mit sich selbst ändert etwas");
  // Dasselbe Stockwerk für zwei Zimmer auf zwei Geräten: jedes Zimmer für sich.
  const C = geraet();
  const ci = C.baueStockwerk("wohnhaus");
  C.waehleArt("wohnhaus", ci, "zwei");
  C.waehleRaum("wohnhaus", ci, 0, "kueche");
  const geteilt = JSON.parse(JSON.stringify(C.lesen()));
  const sid = geteilt.haeuser.wohnhaus.stock[ci].id;
  const spaeter = geteilt.haeuser.wohnhaus.stock[ci].at + 1000;
  const links = C.merge(geteilt, {});
  const lst = links.haeuser.wohnhaus.stock.find((s) => s.id === sid);
  lst.zimmer[0].dinge.push({ k: "b1", i: K.dingeFuer("kueche")[0], x: 90, y: 230 });
  lst.zimmer[0].at = spaeter;
  const rechts = C.merge(geteilt, {});
  const rst = rechts.haeuser.wohnhaus.stock.find((s) => s.id === sid);
  rst.zimmer[1] = { ...rst.zimmer[1], raum: "bad", at: spaeter + 1000 };
  rst.at = spaeter + 1000;
  const lr = C.merge(links, rechts);
  const z0 = lr.haeuser.wohnhaus.stock.find((s) => s.id === sid);
  pruefe(z0 && z0.zimmer[0].dinge.length === 1 && z0.zimmer[1].raum === "bad", "dasselbe Stockwerk auf zwei Geräten: ein Zimmer überschreibt das andere");
  pruefe(JSON.stringify(lr) === JSON.stringify(C.merge(rechts, links)), "dasselbe Stockwerk: Zusammenführen ist nicht in beide Richtungen gleich");
  // Ein neues Gerät (alles leer) bringt nichts dazu und nimmt nichts weg.
  const frisch = A.merge(A.normalize(null), ab);
  pruefe(JSON.stringify(frisch) === JSON.stringify(A.merge(ab, A.normalize(null))) && frisch.haeuser.spital.stock.length === ab.haeuser.spital.stock.length, "ein neues Gerät verändert das Haus beim Zusammenführen");
  // Müll wird aufgeräumt statt übernommen.
  const muell = A.normalize({ v: 2, haeuser: { wohnhaus: { stock: [{ art: "wohnung", zimmer: [{ raum: "notfall", dinge: [{ i: "gibtsnicht" }, { i: "bett", x: 99999, y: -5 }], wand: "lila" }], tiere: [{ a: "drache" }] }] }, spital: { stock: [{ art: "wohnung", zimmer: [{ raum: "schlafzimmer" }] }] } } });
  const w0 = muell.haeuser.wohnhaus.stock[0];
  pruefe(w0.zimmer[0].raum === "" && w0.zimmer[0].dinge.length === 1 && w0.zimmer[0].dinge[0].x <= S_GEO_W() && K.FARBE[w0.zimmer[0].wand] && !w0.tiere.length, "ein kaputter Stand wird nicht aufgeräumt");
  pruefe(muell.haeuser.spital.stock[0].art === "eins" && !muell.haeuser.spital.stock[0].zimmer[0].raum, "eine Wohnung im Spital wird nicht aufgeräumt");
  const viele = () => Array.from({ length: 60 }, (_, n) => ({ k: `v${n}`, i: "bett", x: 50, y: 230 }));
  const voll = A.normalize({ v: 2, haeuser: { wohnhaus: { stock: [{ art: "zwei", zimmer: [{ raum: "kueche", dinge: viele() }, {}] }] }, spital: { stock: [{ art: "zwei", zimmer: [{ raum: "notfall", dinge: viele() }, { raum: "labor" }] }] } } });
  pruefe(voll.haeuser.wohnhaus.stock[0].zimmer[0].dinge.length === A.DINGE_MAX_HALB, "ein halbes Zimmer nimmt mehr Dinge auf als erlaubt");
  pruefe(voll.haeuser.spital.stock[0].zimmer.length === 1 && voll.haeuser.spital.stock[0].zimmer[0].dinge.length === A.DINGE_MAX, "im Spital wird ein Stockwerk für zwei nicht zu einem Zimmer");
}
function S_GEO_W() { return 560; }

// Ein Kasten aus einer neueren Fassung der App (neue Dinge, Zimmer, Tiere …)
// bleibt unberührt: nichts wird aufgeräumt, nichts in die Cloud geschrieben.
{
  const { S: alt } = standUmgebung();
  const neuer = {
    v: alt.FORMAT + 1,
    gewaehlt: "wohnhaus",
    haeuser: {
      wohnhaus: { fassade: "regenbogen", dach: "rot", at: 5, stock: [{ id: "s1", art: "turm", zimmer: [{ raum: "sternwarte", dinge: [{ k: "d1", i: "teleskop", x: 100, y: 230, r: 45 }] }], tiere: [{ a: "drache", n: "Fauchi" }], at: 5 }] },
      garage: { stock: [{ id: "g1", art: "zwei", zimmer: [{ raum: "werkstatt" }, {}] }] },
    },
  };
  const m1 = alt.merge(alt.lesen(), neuer);
  const m2 = alt.merge(neuer, alt.lesen());
  pruefe(JSON.stringify(m1) === JSON.stringify(neuer) && JSON.stringify(m2) === JSON.stringify(neuer), "ein Kasten einer neueren Fassung wird beim Zusammenführen verändert");
  const gespeichert = [];
  const firebase = { getUser: () => ({ uid: "kind" }), isAccountReady: () => true, getGameState: () => ({ "lernapp.bau": { data: neuer } }), saveGameState: (key) => gespeichert.push(key) };
  const { S, u } = standUmgebung({ mitCloud: true, firebase });
  pruefe(S.neuereFassung?.(), "der Kasten einer neueren Fassung wird nicht erkannt");
  S.waehleRaum("wohnhaus", 0, 0, "schlafzimmer");
  S.tick(Date.now() + 9e7);
  S.speichern(true);
  pruefe(!gespeichert.includes("lernapp.bau"), "die ältere Fassung schreibt in die Cloud, was sie nicht kennt");
  pruefe(JSON.parse(u.speicher.get("lernapp.bau.konten") || "{}").kind?.v === neuer.v, "die ältere Fassung verändert den neueren Kasten auf dem Gerät");
}

// Fassung 1 (ein Zimmer je Stockwerk, ein Tier darin) wird übertragen:
// Schlaf- und Kinderzimmer werden Wohnungen mit ihrem Tier, die anderen
// Zimmer stehen links auf einem Stockwerk für zwei.
{
  const { S } = standUmgebung();
  const v1 = {
    v: 1,
    gewaehlt: "wohnhaus",
    haeuser: {
      wohnhaus: { fassade: "pfirsich", dach: "rot", at: 5, stock: [
        { id: "a1", seit: 0, raum: "kueche", wand: "mint", dinge: [{ k: "d1", i: "kochherd", x: 400, y: 230 }], tier: { a: "cat", n: "Mia", seed: "t1" }, at: 5 },
        { id: "a2", seit: 10, raum: "schlafzimmer", wand: "flieder", dinge: [{ k: "d2", i: "bett", x: 200, y: 230 }], tier: { a: "fox", n: "Fino", seed: "t2", w: ["ding:bett"] }, at: 6 },
      ] },
      spital: { stock: [{ id: "spital-0", seit: 0, raum: "notfall", dinge: [{ k: "d3", i: "herzmonitor", x: 400, y: 230 }], tier: { a: "owl", n: "Uli", seed: "t3" }, at: 7 }] },
    },
  };
  const s2 = S.normalize(v1);
  const wh = s2.haeuser.wohnhaus.stock;
  pruefe(wh.length === 4 && wh[0].art === "wohnung" && wh[0].zimmer[0].raum === "schlafzimmer" && wh[0].zimmer[0].dinge.length === 1, "Fassung 1: das Schlafzimmer wird keine Wohnung");
  pruefe(wh[0].tiere.length === 1 && wh[0].tiere[0].n === "Fino" && wh[0].tiere[0].w.length === 2 && wh[0].tiere[0].g.length === 1 && wh[0].tiere[0].b.length === 2 && wh[0].tiere[0].traum, "Fassung 1: das Tier zieht nicht mit oder hat nicht die neuen Wünsche");
  pruefe(wh[1].art === "wohnung" && !wh[1].zimmer[0].raum && wh[2].art === "wohnung", "Fassung 1: die leeren Wohnungen vom Anfang fehlen");
  pruefe(wh[3].art === "zwei" && wh[3].zimmer[0].raum === "kueche" && wh[3].zimmer[0].dinge[0].x === 200 && !wh[3].tiere.length, "Fassung 1: die Küche steht nicht links auf einem Stockwerk für zwei");
  const sp = s2.haeuser.spital.stock;
  pruefe(sp.length === 1 && sp[0].art === "eins" && sp[0].zimmer[0].raum === "notfall" && sp[0].zimmer[0].dinge[0]?.x === 400 && !sp[0].tiere.length, "Fassung 1: der Notfall bleibt nicht, wie er war (ein Zimmer, ohne Tier)");
  pruefe(JSON.stringify(S.normalize(s2)) === JSON.stringify(s2), "Fassung 1: zweimal aufräumen ändert etwas");
}

// Je Konto ein Stand: Wer sich abmeldet und mit einem anderen Konto anmeldet,
// sieht nichts vom vorigen. Ein Gast-Stand geht nur in ein Konto über, das
// noch keine Bauecke hat. Die Ziegel gehören ebenso dem Konto.
{
  let user = null;
  const wolke = { A: {}, B: {} };
  const firebase = {
    getUser: () => user,
    isAccountReady: () => true,
    getGameState: () => (user ? wolke[user.uid] : null),
    saveGameState: (key, data) => { if (user) wolke[user.uid][key] = { data: JSON.parse(JSON.stringify(data)) }; },
  };
  const reise = (u) => u.speicher.set("lernapp.reise", JSON.stringify({ done: {}, tries: {}, choice: {}, alt: {}, stufe: "mittel", stufeAt: 1 }));
  const { S, R, u } = standUmgebung({ mitCloud: true, mitReise: true, firebase, frei: true, vorher: reise });
  const melde = () => u.feuer("lernapp:game-state", user ? wolke[user.uid] : null);
  const raeume = () => S.lesen().haeuser.wohnhaus.stock.map((s) => s.zimmer[0]?.raum || "-").join();
  // Als Gast: ein Schlafzimmer und ein gelöstes Rätsel.
  S.waehleRaum("wohnhaus", 0, 0, "schlafzimmer");
  R.bauGeschafft();
  S.speichern(true);
  pruefe(S.besitzer() === "" && R.bauPaletten() === 1, "als Gast: kein eigener Stand oder keine Palette");
  // Anmelden als A (noch ohne Bauecke): Der Gast-Stand geht über, die Ziegel nicht.
  user = { uid: "A" };
  melde();
  pruefe(S.besitzer() === "A" && raeume() === "schlafzimmer,-,-", `A übernimmt das Gast-Haus nicht (${raeume()})`);
  pruefe(wolke.A["lernapp.bau"]?.data?.haeuser?.wohnhaus, "das übernommene Haus geht nicht in die Cloud von A");
  pruefe(R.bauPaletten() === 0, "A bekommt die Ziegel des Gasts");
  S.waehleRaum("wohnhaus", 1, 0, "kinderzimmer");
  S.speichern(true);
  pruefe(wolke.A["lernapp.bau"].data.haeuser.wohnhaus.stock.filter((s) => s.zimmer[0].raum).length === 2, "A speichert nicht in die eigene Cloud");
  // Abmelden: der Gast-Stand ist leer (er ging an A), nichts von A bleibt.
  user = null;
  melde();
  pruefe(S.besitzer() === "" && raeume() === "-,-,-", `nach dem Abmelden ist noch etwas von A da (${raeume()})`);
  pruefe(R.bauPaletten() === 1, "nach dem Abmelden fehlen die Ziegel des Gasts");
  // B meldet sich an: nichts von A, nichts vom Gast.
  user = { uid: "B" };
  melde();
  pruefe(S.besitzer() === "B" && raeume() === "-,-,-", `B sieht das Haus von jemand anderem (${raeume()})`);
  pruefe(R.bauPaletten() === 0, "B sieht fremde Ziegel");
  pruefe(!wolke.B["lernapp.bau"], "ein leeres Konto bekommt ungefragt einen Stand in die Cloud");
  S.waehleRaum("wohnhaus", 2, 0, "schlafzimmer");
  S.speichern(true);
  // A wieder: genau das Haus von A.
  user = { uid: "A" };
  melde();
  pruefe(raeume() === "schlafzimmer,kinderzimmer,-", `A bekommt nicht das eigene Haus zurück (${raeume()})`);
  // Was beim Wechsel noch aufs Speichern wartete, landet beim richtigen Kind.
  pruefe(wolke.B["lernapp.bau"].data.haeuser.wohnhaus.stock[2].zimmer[0].raum === "schlafzimmer", "das Haus von B kommt nicht in die Cloud von B");
  // A auf einem zweiten Gerät: Der Stand kommt aus der Cloud.
  const zweites = standUmgebung({ mitCloud: true, firebase, frei: true, vorher: reise });
  pruefe(zweites.S.lesen().haeuser.wohnhaus.stock.map((s) => s.zimmer[0]?.raum || "-").join() === "schlafzimmer,kinderzimmer,-", "auf einem zweiten Gerät fehlt das Haus von A");
}

// Ein Gerät mit einem Stand von früher (als der Kasten allen am Gerät gehörte):
// Er geht einmal an das erste Konto, das sich anmeldet – zusammen mit dem, was
// dieses Konto schon in der Cloud hat –, und danach an niemanden mehr.
{
  let user = null;
  const wolke = { A: {}, B: {} };
  const firebase = {
    getUser: () => user,
    isAccountReady: () => true,
    getGameState: () => (user ? wolke[user.uid] : null),
    saveGameState: (key, data) => { if (user) wolke[user.uid][key] = { data: JSON.parse(JSON.stringify(data)) }; },
  };
  const vorlage = standUmgebung().S;
  const frueher = vorlage.normalize(null);
  frueher.haeuser.wohnhaus.stock[2].zimmer[0].raum = "schlafzimmer";
  frueher.haeuser.wohnhaus.stock[2].id = "alt1";
  const cloudA = vorlage.normalize(null);
  cloudA.haeuser.spital.stock[0].zimmer[0].raum = "notfall";
  cloudA.haeuser.spital.stock[0].id = "alt2";
  wolke.A["lernapp.bau"] = { data: cloudA };
  const { S, u } = standUmgebung({ mitCloud: true, firebase, vorher: (env) => env.speicher.set("lernapp.bau", JSON.stringify(frueher)) });
  const melde = () => u.feuer("lernapp:game-state", user ? wolke[user.uid] : null);
  user = { uid: "A" };
  melde();
  pruefe(S.zimmer("wohnhaus", 2, 0)?.raum === "schlafzimmer" && S.zimmer("spital", 0, 0)?.raum === "notfall", "der Stand von früher geht nicht an das erste Konto, oder dessen Cloud-Stand fehlt");
  user = null;
  melde();
  pruefe(!S.lesen().haeuser.wohnhaus.stock.some((s) => s.zimmer[0]?.raum), "nach dem Abmelden bleibt der Stand von früher beim Gast");
  user = { uid: "B" };
  melde();
  pruefe(!S.lesen().haeuser.wohnhaus.stock.some((s) => s.zimmer[0]?.raum) && !S.zimmer("spital", 0, 0)?.raum, "ein zweites Konto bekommt den Stand von früher");
  pruefe(u.speicher.get("lernapp.bau.getrennt") === "1", "das Gerät merkt sich nicht, dass der Stand von früher vergeben ist");
}

// Speichern lässt den Stand, wie er ist: Wer gerade einen Tisch mit einer
// Tasse zieht, hält beide noch in der Hand, wenn der Kasten gespeichert wird.
{
  const gespeichert = [];
  const firebase = { getUser: () => ({ uid: "kind" }), isAccountReady: () => true, getGameState: () => ({}), saveGameState: (key) => gespeichert.push(key) };
  const { S } = standUmgebung({ mitCloud: true, firebase });
  S.waehleRaum("zentrum", 0, 0, "cafe");
  S.aendereZimmer("zentrum", 0, 0, (z) => z.dinge.push({ k: "tisch", i: K.dingeFuer("cafe")[0], x: 120, y: 230, c: "", f: 0, s: 1 }));
  const z = S.zimmer("zentrum", 0, 0);
  const tisch = z.dinge[0];
  S.speichern(true);
  pruefe(gespeichert.includes("lernapp.bau"), "der Kasten geht nicht in die Cloud");
  pruefe(S.zimmer("zentrum", 0, 0) === z && S.zimmer("zentrum", 0, 0).dinge[0] === tisch, "Speichern ersetzt den Stand – ein gezogener Stapel verliert, was darauf steht");
}

// Halb so gross (Oktober 2026): Tiere und Dinge stehen mit MASS 0.6. Die
// grossen Geräte im KiddyDome behalten ihre Grösse und reichen weiter über
// beide Stockwerke. Was früher auf einem Tisch stand, setzt sich beim Laden
// auf die tiefere Fläche; was über keiner Fläche schwebt, auf den Boden.
{
  pruefe(M.MASS === 0.6 && M.massVon("bett") === 0.6, `Dinge und Tiere stehen nicht halb so gross (MASS ${M.MASS})`);
  const hoch = Object.entries(M.DINGE).filter(([, d]) => d.mass === 2).map(([id]) => id);
  pruefe(hoch.length === 11 && hoch.every((id) => id.startsWith("k_")), `nur die grossen Geräte im KiddyDome haben einen eigenen Massstab (${hoch.join(", ")})`);
  const { S } = standUmgebung();
  const GEO = S.GEO;
  hoch.forEach((id) => {
    const u = M.umriss(id);
    pruefe(u.y1 - u.y0 > GEO.STOCK, `${id} reicht nicht mehr über zwei Stockwerke (${Math.round(u.y1 - u.y0)})`);
  });
  const tisch = M.DINGE.tisch;
  const alt = 230 + tisch.flaeche * 1.2;
  const neu = 230 + tisch.flaeche * M.massVon("tisch");
  const roh = (dinge) => ({ v: S.FORMAT, haeuser: { zentrum: { stock: [{ id: "c", art: "eins", zimmer: [{ raum: "cafe", dinge }] }] } } });
  const nachher = (dinge) => S.normalize(roh(dinge)).haeuser.zentrum.stock[0].zimmer[0].dinge;
  const auf = nachher([
    { k: "t", i: "tisch", x: 200, y: 230, s: 1 },
    { k: "auf", i: "kaffeetasse", x: 200, y: alt, s: 1 },
    { k: "frei", i: "kaffeetasse", x: 450, y: alt, s: 1 },
    { k: "schon", i: "kaffeetasse", x: 210, y: neu, s: 1 },
  ]);
  const y = (k) => auf.find((d) => d.k === k)?.y;
  pruefe(Math.abs(y("auf") - neu) < 0.11, `ein Ding vom früheren Tisch setzt sich nicht auf die tiefere Fläche (${y("auf")} statt ${neu})`);
  pruefe(y("frei") === GEO.STAND, `ein schwebendes Ding ohne Fläche darunter fällt nicht auf den Boden (${y("frei")})`);
  pruefe(Math.abs(y("schon") - neu) < 0.11, `ein Ding, das schon auf der Fläche steht, wird verschoben (${y("schon")})`);
  const zweimal = S.normalize(S.normalize(roh(auf))).haeuser.zentrum.stock[0].zimmer[0].dinge.map((d) => `${d.k}:${d.y}`).join();
  pruefe(zweimal === auf.map((d) => `${d.k}:${d.y}`).join(), `zweimal aufräumen verschiebt die Dinge auf dem Tisch (${zweimal})`);
}

// Fassung 4: Ein Zimmer ist 160 hoch statt 240 – oben y = 80, der Boden
// bleibt bei 240. Der KiddyDome behält seine Höhe. Was in einem Kasten vor
// Fassung 4 an der Wand hing, rückt anteilig auf die kürzere Wand; was an der
// Decke hängt, hängt an der neuen Decke; was steht, steht, wo es stand.
{
  const { S } = standUmgebung();
  const GEO = S.GEO;
  const normal = S.normalize({ v: S.FORMAT, haeuser: { spital: { stock: [{ id: "s", art: "eins", zimmer: [{ raum: "radiologie" }] }] } } }).haeuser.spital.stock[0];
  pruefe(GEO.OBEN === 80 && S.obenVon(normal) === 80 && S.hoeheVon(normal) === 160, `ein Zimmer ist nicht 160 hoch (oben ${S.obenVon(normal)}, hoch ${S.hoeheVon(normal)})`);
  const dome = S.normalize({ v: S.FORMAT, haeuser: { zentrum: { stock: [{ id: "a", art: "eins", zimmer: [{ raum: "kiddydome" }] }, { id: "b", art: "oben", zu: "a", zimmer: [] }] } } }).haeuser.zentrum.stock[0];
  pruefe(S.obenVon(dome) === -256 && S.hoeheVon(dome) === 496, "der KiddyDome ist nicht mehr so hoch wie vorher");
  const alt = (v) => ({ v, haeuser: { spital: { stock: [{ id: "s", art: "eins", zimmer: [{ raum: "radiologie", dinge: [
    { k: "w1", i: "bild", x: 200, y: 108, s: 1 },
    { k: "w2", i: "bild", x: 300, y: 20, s: 1 },
    { k: "d1", i: "deckenlampe", x: 100, y: 0, s: 1 },
    { k: "b1", i: "bett", x: 400, y: 230, s: 1 },
  ] }] }] } } });
  const dinge = (roh) => S.normalize(roh).haeuser.spital.stock[0].zimmer[0].dinge;
  const vorher = dinge(alt(3));
  const y = (liste, k) => liste.find((d) => d.k === k)?.y;
  const erwartet = 80 + 108 * (136 / 216);
  pruefe(Math.abs(y(vorher, "w1") - erwartet) < 0.11, `ein Bild aus Fassung 3 rückt nicht anteilig auf die kürzere Wand (${y(vorher, "w1")} statt ${erwartet.toFixed(1)})`);
  const bild = M.umriss("bild");
  pruefe(y(vorher, "w2") >= 80 - bild.y0 + 4 - 0.11, `ein Bild oben an der Wand ragt nach dem Umrechnen über die Decke (${y(vorher, "w2")})`);
  pruefe(y(vorher, "d1") === 80 && y(vorher, "b1") === 230, `Deckenlampe oder Bett sind nach dem Umrechnen nicht an der neuen Decke bzw. am alten Platz (${y(vorher, "d1")}, ${y(vorher, "b1")})`);
  const zweimal = dinge(S.normalize(alt(3)));
  pruefe(vorher.map((d) => `${d.k}:${d.y}`).join() === zweimal.map((d) => `${d.k}:${d.y}`).join(), "ein Kasten der Fassung 4 rechnet die Wand noch einmal um");
  pruefe(Math.abs(y(dinge(alt(4)), "w1") - 108) < 0.11, `ein Bild der Fassung 4 wird verschoben (${y(dinge(alt(4)), "w1")})`);
  pruefe(Math.abs(y(dinge(alt(2)), "w1") - erwartet) < 0.11, "ein Kasten der Fassung 2 rechnet die Wand nicht um");
}

// Der Katalog dieser Fassung. Ändert sich eine Kennung (ein neues Ding, ein
// neues Zimmer, ein neues Tier …) oder ein Feld des Kastens, muss FORMAT in
// bau-stand.js hoch – sonst löscht eine ältere App, die den neuen Kasten
// sieht, was sie nicht kennt. Danach hier den neuen Fingerabdruck eintragen.
{
  // Fassung 4 hat dieselben Felder wie 3 – neu ist nur, wie hoch ein Zimmer ist.
  const FINGERABDRUCK = { 2: "0de7a8d925917fa6", 3: "7159476bf27e3fdb", 4: "7159476bf27e3fdb" };
  const { S } = standUmgebung();
  S.waehleRaum("wohnhaus", 0, 0, "schlafzimmer");
  S.aendereZimmer("wohnhaus", 0, 0, (z) => z.dinge.push({ k: "x", i: "bett", x: 100, y: 230 }));
  const stand = S.normalize(S.lesen());
  const st = stand.haeuser.wohnhaus.stock[0];
  // Dazu das obere Stockwerk eines KiddyDome (Fassung 3).
  const oben = S.normalize({ v: S.FORMAT, haeuser: { zentrum: { stock: [{ id: "a", art: "eins", zimmer: [{ raum: "kiddydome" }] }, { id: "b", art: "oben", zu: "a", zimmer: [] }] } } }).haeuser.zentrum.stock[1];
  const felder = [stand, stand.haeuser.wohnhaus, st, st.zimmer[0], st.zimmer[0].dinge[0], st.tiere[0], oben].map((o) => Object.keys(o).sort().join(","));
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

// --- Überraschungen und die Sternenleiter ---------------------------------------
{
  // Blitzzug und Glücksstern: Beim ersten Besuch stellt die Frage die Uhr;
  // dann etwa jede halbe Stunde, ein verpasster Blitzzug nach fünf Minuten.
  const jetzt = morgen10();
  const reise = (u) => u.speicher.set("lernapp.reise", JSON.stringify({ done: {}, tries: {}, choice: {}, alt: {}, stufe: "mittel", stufeAt: 1 }));
  const { S, R, u } = standUmgebung({ mitReise: true, frei: true, jetzt, vorher: reise });
  const t0 = jetzt.wert;
  const min = 60000;
  pruefe(!S.blitzzugFaellig(t0) && !S.sternFaellig(t0), "beim ersten Besuch kommt gleich eine Überraschung");
  pruefe(!S.blitzzugFaellig(t0 + min) && S.blitzzugFaellig(t0 + 2 * min), "der erste Blitzzug kommt nicht nach zwei Minuten");
  pruefe(!S.sternFaellig(t0 + 3 * min) && S.sternFaellig(t0 + 4 * min), "der erste Glücksstern kommt nicht nach vier Minuten");
  S.blitzzugVorbei(true, t0 + 2 * min);
  pruefe(!S.blitzzugFaellig(t0 + 31 * min) && S.blitzzugFaellig(t0 + 32 * min), "gefangen kommt der nächste Blitzzug nicht nach einer halben Stunde");
  S.blitzzugVorbei(false, t0 + 32 * min);
  pruefe(!S.blitzzugFaellig(t0 + 36 * min) && S.blitzzugFaellig(t0 + 37 * min), "verpasst kommt der Blitzzug nicht nach fünf Minuten wieder");
  S.sternGefunden(t0 + 5 * min);
  pruefe(!S.sternFaellig(t0 + 34 * min) && S.sternFaellig(t0 + 35 * min), "nach dem Glücksstern kommt der nächste nicht nach einer halben Stunde");
  // Die Palette als Lohn: gleich da, und der Lieferzug bringt sie nicht noch einmal.
  pruefe(S.gezeigt() === 0 && S.paletten() === 0, "ohne Rätsel schon Ziegel");
  R.bauGeschafft();
  pruefe(S.neueLieferung() === 1 && S.paletten() === 1, "ein gelöstes Rätsel wartet nicht auf den Lieferzug");
  pruefe(S.bonusPalette() && S.paletten() === 2 && S.neueLieferung() === 1, `die geschenkte Palette fehlt oder kommt mit dem Zug noch einmal (${S.paletten()}, ${S.neueLieferung()})`);
  S.merkeGezeigt();
  pruefe(S.neueLieferung() === 0 && S.paletten() === 2, "nach der Lieferung stimmen die Ziegel nicht");
  // Je Kind: Ein anderes Konto auf diesem Gerät hat seine eigene Uhr.
  const karte = JSON.parse(u.speicher.get(S.UEBERRASCHUNG_KEY) || "{}");
  pruefe(karte[""] && typeof karte[""].zug === "number", "die Uhr der Überraschungen ist nicht je Kind gemerkt");
  // Verstecke: nur Zimmer, die schon etwas sind; ein KiddyDome einmal (unten).
  pruefe(S.sternVerstecke().length === 0, "der Glücksstern versteckt sich in einem leeren Rohbau");
  S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
  S.waehleRaum("zentrum", 0, 0, "bibliothek");
  S.baueStockwerk("zentrum");
  S.baueStockwerk("zentrum");
  S.waehleRaum("zentrum", 1, 0, "kiddydome");
  const verstecke = S.sternVerstecke();
  pruefe(S.istDoppel(S.stock("zentrum", 1)) && verstecke.length === 3 && verstecke.some((v) => v.haus === "zentrum" && v.index === 1) && !verstecke.some((v) => v.haus === "zentrum" && v.index === 2),
    `der Glücksstern versteckt sich nicht in jedem fertigen Zimmer genau einmal (${JSON.stringify(verstecke)})`);
}
{
  // Die Sternenleiter: Stufen der Reihe nach, ohne Kauf ganz erreichbar; der
  // höchste Stand bleibt, auch wenn ein Wunsch wechselt.
  const stufen = K.LEITER;
  pruefe(stufen.length === 16 && stufen.at(-1).sterne === 200 && stufen.every((s, i) => s.id && s.name && s.text && (i === 0 || s.sterne > stufen[i - 1].sterne)), "die Stufen der Sternenleiter steigen nicht oder es fehlt ein Name");
  // Ohne Kauf (vier Wohnungen, je drei Tiere mit fünf Sternen) bis 60 – die
  // ersten acht Stufen; mit Kauf (20 Stockwerke) bis 300, also alle.
  pruefe(stufen.filter((s) => s.sterne <= 4 * 3 * 5).length === 8, "ohne Kauf sind nicht genau die ersten acht Stufen erreichbar");
  pruefe(stufen[stufen.length - 1].sterne <= 20 * 3 * 5, "die letzte Stufe ist auch mit Kauf (20 Stockwerke, je drei Tiere mit fünf Sternen) nicht erreichbar");
  for (const id of ["riesenrad", "teich", "drachen", "windmuehle", "garten", "zeppelin", "schloss", "feuerwerk"]) pruefe(stufen.some((s) => s.id === id), `die Sternenleiter hat kein ${id}`);
  const jetzt = morgen10();
  const { S } = standUmgebung({ paletten: 3, frei: true, jetzt });
  S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
  S.waehleRaum("zentrum", 0, 0, "bibliothek");
  const fam = K.FARBE[S.zimmer("wohnhaus", 0, 0).wand].familie;
  // Ein Tier mit fünf erfüllten Wünschen: die erste Stufe.
  S.aendereStock("wohnhaus", 0, (st) => Object.assign(st.tiere[0], { w: [`farbe:${fam}`, `farbe:${fam}`], g: ["raum:kinderzimmer", "raum:kinderzimmer"], b: ["fremd:zentrum:bibliothek"] }));
  let l = S.sternenleiter();
  pruefe(l.jetzt === 5 && l.rekord === 5 && l.erreicht === 1 && l.naechste === stufen[1].sterne, `fünf Sterne geben nicht die erste Stufe (${JSON.stringify(l)})`);
  // Ein Wunsch wechselt: weniger Sterne, die Stufe bleibt.
  S.aendereStock("wohnhaus", 0, (st) => { st.tiere[0].w = ["ding:ball", `farbe:${fam}`]; });
  l = S.sternenleiter();
  pruefe(l.jetzt === 4 && l.rekord === 5 && l.erreicht === 1, `die erreichte Stufe geht verloren, wenn ein Wunsch wechselt (${JSON.stringify(l)})`);
  // Jede Stufe hat ihr Bild, und der Dachstern sitzt auf jedem Dach.
  const art = umgebung();
  MOEBEL.forEach((datei) => art.lade(datei));
  art.lade("bau-katalog.js");
  art.lade("bau-art.js");
  const A = art.windowStub.LernappBauArt;
  for (const s of stufen) {
    const bild = A.leiterBild(s.id);
    pruefe(bild.markup.length > 200 && /^-?\d+ -?\d+ \d+ \d+$/.test(bild.viewBox), `Sternenleiter: ${s.id} hat kein Bild`);
  }
  for (const form of ["giebel", "heli", "turm", "flach"]) {
    const [x, y] = A.dachsternOrt(form, -500);
    // Über dem Dach; wo das Plus fürs nächste Stockwerk darüber steht, unter ihm.
    const unterPlus = x + 30 < A.WAND || x - 30 > A.WAND + A.ZW || y - 30 >= -500 - A.DACH_H[form] - 40 - 4;
    pruefe(x > 0 && x < A.HB && y < -500 - 60 && unterPlus, `Dachstern: sitzt auf dem Dach «${form}» nicht zwischen Dach und Plus (${x}, ${y})`);
  }
  for (const teil of [A.blitzzug(), A.gluecksstern(), A.krone(), A.sternRahmen(0)]) pruefe(teil.length > 200 && !teil.includes("NaN") && !teil.includes("undefined"), "eine Zeichnung der Überraschungen ist leer oder kaputt");
  pruefe(A.blitzzug().includes("bau-blitz-griff") && A.blitzzug().includes("bau-palette"), "der Blitzzug hat keine Palette oder keine Fläche zum Antippen");
  // Die Stockwerke: 160 hoch, die zwei des KiddyDome 240 – darin das Zimmer
  // mit dem Boden auf dem Boden und der Decke unter der nächsten Decke.
  A.hoehenVon(() => [160, 240, 240, 160]);
  pruefe(A.ZH === 160 && A.ZH_HOCH === 240 && A.OBEN_Y === 80 && A.BODEN_Y === 240, "die Masse der Stockwerke stimmen nicht");
  pruefe(A.unten(1) === -14 - 176 && A.oben(1) === A.unten(1) - 240 && A.unten(2) === A.oben(1) - 16 && A.unten(3) === A.oben(2) - 16 && A.oben(3) === A.unten(3) - 160, "unten() und oben() folgen den Höhen der Stockwerke nicht");
  pruefe(A.unten(1) - A.BODEN_Y + (-256) === A.oben(2), "der KiddyDome reicht nicht genau bis unter die Decke seines oberen Stockwerks");
  A.hoehenVon(null);
  pruefe(A.oben(2) === -14 - 2 * 176 - 160, "ohne Höhen sind nicht alle Stockwerke 160 hoch");
}

// --- Der Einbau ----------------------------------------------------------------
{
  // Zurücksetzen: Häuser und Ziegel bleiben – auf dem Gerät und in der Cloud.
  const firebase = lies("firebase.js");
  pruefe(/BAU_KEEP_KEYS = \["lernapp\.bau", "lernapp\.bau\.lieferung"\]/.test(firebase), "firebase.js kennt die Kästen der Bauecke nicht");
  pruefe(/\.\.\.BAU_KEEP_KEYS/.test(firebase) && /BAU_KEEP_KEYS\.forEach/.test(firebase), "firebase.js behält die Bauecke beim Zurücksetzen nicht");
  for (const key of ["lernapp.bau.konten", "lernapp.bau.wer", "lernapp.bau.getrennt", "lernapp.bau.lieferung.konten", "lernapp.bau.lieferung.wer", "lernapp.bau.lieferung.getrennt", "lernapp.bau.gezeigt"]) {
    pruefe(firebase.includes(`"${key}"`), `firebase.js lässt ${key} beim Zurücksetzen nicht stehen`);
  }
  const cloud = umgebung();
  cloud.lade("game-cloud.js");
  const gc = cloud.windowStub.LernappGameCloud;
  pruefe(typeof gc.registerProKonto === "function", "game-cloud.js kennt keinen Kasten je Konto");
  const bleibt = gc.register({ key: "test.bleibt", empty: { n: 0 }, keepOnReset: true });
  const geht = gc.register({ key: "test.geht", empty: { n: 0 } });
  const konto = gc.registerProKonto({ key: "test.konto", empty: { n: 0 } });
  bleibt.write({ n: 5 });
  geht.write({ n: 5 });
  konto.write({ n: 5 });
  gc.resetAll();
  pruefe(bleibt.read().n === 5 && geht.read().n === 0 && konto.read().n === 5, "game-cloud.js: Zurücksetzen trifft die falschen Kästen");
  pruefe(/registerProKonto\(\{ key: KEY/.test(lies("bau-stand.js")) && /registerProKonto\(\{ key: BAU_LIEFERUNG_KEY/.test(lies("journey-plan.js")), "die Bauecke meldet ihre Kästen nicht je Konto an");

  // Startbild: Stylesheet und Skripte, in der richtigen Reihenfolge.
  const index = lies("index.html");
  const reihe = ["game-cloud.js", "journey-plan.js", ...MOEBEL, "bau-katalog.js", "bau-stand.js", "bau-tiere.js", "bau-art.js", "train-bau.js", "train-home.js"];
  const stellen = reihe.map((datei) => index.indexOf(`src="${datei}?`));
  pruefe(stellen.every((x) => x > 0) && stellen.every((x, i) => i === 0 || x > stellen[i - 1]), "index.html lädt die Bauecke nicht vollständig oder nicht in der richtigen Reihenfolge");
  pruefe(/href="bau\.css\?v=/.test(index), "index.html lädt bau.css nicht");
  const sw = lies("service-worker.js");
  for (const datei of ["bau.css", ...MOEBEL, "bau-katalog.js", "bau-stand.js", "bau-tiere.js", "bau-art.js", "train-bau.js"]) {
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
  // Der Vorlesen-Schalter, und ein Tipp auf einen Text liest ihn vor.
  const kidsJs = lies("kids.js");
  pruefe(/function mountTtsToggle/.test(kidsJs) && /mountTtsToggle\(\);/.test(kidsJs), "kids.js hat keinen Vorlesen-Schalter");
  pruefe(/function liesText/.test(lies("train-bau.js")) && /ttsEnabled/.test(lies("train-bau.js")), "train-bau.js liest angetippte Texte nicht vor");
}

// --- Stimme: was die Bauecke als Aufnahme sagt (bau-stimme.js) --------------
// Geschrieben von scripts/stimme-google.mjs. Ändert sich ein Satz in
// train-bau.js oder im Katalog, spielte seine alte Aufnahme nie mehr – dann
// meldet sich das hier (node scripts/stimme-google.mjs aufraeumen, vertonen).
let aufnahmen = 0;
{
  const dateien = stimmeVerzeichnis();
  pruefe(dateien && typeof dateien === "object" && !Array.isArray(dateien), "bau-stimme.js fehlt oder legt kein Verzeichnis an");
  const gesagt = new Set(bauTexte().map((t) => t.text));
  // Im selben Ordner liegen die Aufnahmen der übrigen App (app-stimme.js,
  // geprüft von validate-app-stimme.mjs).
  const belegt = new Set(Object.values(appVerzeichnis() || {}));
  Object.entries(dateien || {}).forEach(([text, datei]) => {
    const wo = `Aufnahme «${text.length > 50 ? `${text.slice(0, 50)}…` : text}»`;
    pruefe(text === sprechText(text), `${wo}: der Text steht nicht so da, wie die App ihn nachschlägt (Leerräume)`);
    pruefe(gesagt.has(text), `${wo}: die Bauecke sagt diesen Satz nicht mehr so – node scripts/stimme-google.mjs aufraeumen`);
    pruefe(datei === dateiFuer(text), `${wo}: die Datei heisst ${datei}, nach ihrem Text ${dateiFuer(text)}`);
    belegt.add(datei);
    const pfad = path.join(root, datei);
    if (!fs.existsSync(pfad)) { pruefe(false, `${wo}: ${datei} fehlt`); return; }
    const daten = fs.readFileSync(pfad);
    pruefe(daten.length <= 100 * 1024, `${wo}: ${Math.round(daten.length / 1024)} KB – mehr als 100 KB für einen Satz`);
    const rahmen = mp3Rahmen(daten);
    if (!rahmen) { pruefe(false, `${wo}: ${datei} ist keine MP3`); return; }
    // Der erste Rahmen kann der Kopf des Encoders sein (mit eigener Bitrate).
    pruefe(rahmen.every((r) => r.version === 2 && r.rate === 24000 && r.kanaele === 1) && rahmen.slice(1).every((r) => r.kbit === 32),
      `${wo}: nicht mono, 24 kHz, 32 kbit/s (${JSON.stringify(rahmen[1] || rahmen[0])})`);
    const sekunden = sekundenVon(daten);
    pruefe(passtZumText(sekunden, text), `${wo}: ${sekunden.toFixed(2)} s für ${text.length} Zeichen – passt nicht zum Satz`);
    aufnahmen += 1;
  });
  const ordner = path.join(root, STIMME_ORDNER);
  if (fs.existsSync(ordner)) {
    fs.readdirSync(ordner).filter((name) => !name.startsWith(".")).forEach((name) => {
      pruefe(belegt.has(`${STIMME_ORDNER}/${name}`), `${STIMME_ORDNER}/${name}: zu dieser Datei steht kein Satz in bau-stimme.js oder app-stimme.js`);
    });
  }
  // Das Startbild lädt das Verzeichnis nach lesen-stimme.js: Das setzt es
  // neu, bau-stimme.js ergänzt es.
  const index = lies("index.html");
  const stelle = index.indexOf('src="bau-stimme.js?v=');
  pruefe(stelle >= 0, "index.html lädt bau-stimme.js nicht");
  pruefe(stelle < 0 || stelle > index.indexOf('src="lesen-stimme.js?v='), "index.html: bau-stimme.js steht vor lesen-stimme.js");
  pruefe(lies("service-worker.js").includes("./bau-stimme.js${ASSET_VERSION_QUERY}"), "service-worker.js legt bau-stimme.js nicht in den Cache");
}

if (fehler.length) {
  console.error(`Die Bauecke stimmt nicht (${fehler.length}):`);
  fehler.slice(0, 80).forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`Die Bauecke stimmt: ${dinge.length} Dinge, ${K.RAEUME_LISTE.length} Zimmer in 4 Häusern (je mindestens 10 eigene Dinge), ${K.TIER_IDS.length} Tierarten, alle Wünsche erfüllbar, ${aufnahmen} Sätze mit der Google-Stimme.`);
