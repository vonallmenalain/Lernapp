/*
 * Stimmt die Englischecke – ohne Browser?
 * ---------------------------------------------------------------------------
 *   Inhalt     Jede Welt hat ihre Wörter, jedes Wort Englisch und Deutsch,
 *              Satz und Frage; keine Id doppelt; jede Geschichte vier Bilder,
 *              was darin antippbar ist, ist ein bekanntes Wort; 15 Stücke
 *              Einrichtung zu den 15 Schritten des Wagens.
 *   Bilder     Zu jedem Wort eine Zeichnung, ein Ort im Wimmelbild und ein
 *              Sticker; jedes Geschichtenbild hat, was sein Satz antippbar
 *              macht; das Zimmer hat alle Wege.
 *   Stand      Zusammenführen ist in beide Richtungen gleich und zählt nichts
 *              doppelt; gehört → erkannt → sicher (zwei Tage); Aufnäher und
 *              Gold; Einrichtung nach Runden; was Rocco vorschlägt; der
 *              Bericht; die Einstellung der Eltern.
 *   Stimme     Jeder englische Text hat seine Aufnahme (stimme/englisch/,
 *              englisch-stimme.js), sie liegt da und ist so lang, wie der
 *              Text es verlangt; jeder deutsche Text des Knopfs DE hat eine
 *              Aufnahme der App-Stimme.
 *   Gemälde    Jedes Wimmelbild und Geschichtenbild ist gemalt, und für jedes
 *              Wort steht fest, wo es im Gemälde liegt (englisch-gemalt.js);
 *              jedes Wort hat einen gemalten Sticker, jede Welt ihren
 *              Aufnäher, das Wörterbuch sein Buch.
 *   Einbau     Startseite und Service Worker laden die Dateien, die Schranke
 *              kennt die drei Spiele, die Englischecke kennt dieselben Ids.
 *   Sprache    «Hear and find», nie «Hör & find»; kein scharfes S.
 *
 * Aufruf:  node scripts/validate-englisch.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { passtZumText, sekundenVon } from "./stimme-bau-texte.mjs";
import * as en from "./stimme-englisch-texte.mjs";
import * as app from "./stimme-app-texte.mjs";
import { sprechText } from "./stimme-texte.mjs";

const root = path.resolve(import.meta.dirname, "..");
const fehler = [];
const pruefe = (bedingung, meldung) => { if (!bedingung) fehler.push(meldung); };
const lies = (name) => fs.readFileSync(path.join(root, name), "utf8");
// JSON mit sortierten Schlüsseln: gleich ist gleich, egal in welcher Reihenfolge.
const kanonisch = (wert) => JSON.stringify(wert, (_, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([p], [q]) => p.localeCompare(q))) : v));

// --- Sandbox -----------------------------------------------------------------
function sandbox({ stufe = "mittel", eltern = null, heute = null } = {}) {
  const store = new Map();
  if (eltern) store.set("lernapp.englisch.eltern", JSON.stringify(eltern));
  const windowStub = {
    LernappReise: { stufe: () => stufe },
    LernappBauMenschen: { tier: (art) => `<g data-mensch="${art}"/>` },
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
  };
  const RealDate = Date;
  const FesterTag = heute
    ? class extends RealDate { constructor(...a) { super(...(a.length ? a : [`${heute()}T10:00:00`])); } static now() { return new RealDate(`${heute()}T10:00:00`).getTime(); } }
    : RealDate;
  const context = vm.createContext({
    window: windowStub,
    document: { addEventListener() {}, dispatchEvent() { return true; } },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    Date: FesterTag, Math, JSON, Number, String, Set, Map, Object, Array,
  });
  for (const datei of ["englisch-inhalt.js", "englisch-stand.js", "englisch-art.js", "englisch-art-2.js", "englisch-spiele.js", "englisch-art-3.js", "englisch-spiele-3.js", "englisch-art-4.js", "englisch-gemalt.js", "englisch-spiele-4.js"]) vm.runInContext(lies(datei), context, { filename: datei });
  return { I: windowStub.LernappEnglischInhalt, s: windowStub.LernappEnglischStand, a: windowStub.LernappEnglischArt, sp: windowStub.LernappEnglischSpiele, store };
}

const { I, s, a, sp } = sandbox();
pruefe(I && s && a, "englisch-inhalt.js, englisch-stand.js oder englisch-art.js meldet sich nicht an");
if (!I || !s || !a) { console.error(fehler.join("\n")); process.exit(1); }

// --- 1. Inhalt ------------------------------------------------------------------
const ids = new Set();
const alleWoerter = [...I.WELTEN.flatMap((w) => w.woerter), ...I.EXTRA_WOERTER];
pruefe(I.WELTEN.length >= 3, "weniger als drei Welten");
for (const welt of I.WELTEN) {
  pruefe(welt.woerter.length >= 10, `${welt.id}: weniger als zehn Wörter`);
  pruefe(Array.isArray(welt.titel) && welt.titel.length === 2 && welt.titel.every(Boolean), `${welt.id}: Titel braucht Englisch und Deutsch`);
  pruefe(Array.isArray(welt.intro) && welt.intro.length === 2 && welt.intro.every(Boolean), `${welt.id}: Einleitung braucht Englisch und Deutsch`);
}
for (const w of alleWoerter) {
  pruefe(!ids.has(w.id), `Wort ${w.id} doppelt`);
  ids.add(w.id);
  for (const feld of ["en", "satz", "frage", "de", "deSatz", "deFrage"]) {
    pruefe(typeof w[feld] === "string" && /^[A-ZÄÖÜ]/.test(w[feld]) && /[.!?]$/.test(w[feld]), `${w.id}.${feld}: «${w[feld]}» – gross am Anfang, Satzzeichen am Schluss`);
  }
  pruefe(/\?$/.test(w.frage) && /\?$/.test(w.deFrage), `${w.id}: die Frage endet mit einem Fragezeichen`);
}
for (const g of I.GESCHICHTEN) {
  pruefe(g.bilder.length === 4, `Geschichte ${g.id}: nicht vier Bilder`);
  pruefe(I.WELTEN.some((w) => w.id === g.welt), `Geschichte ${g.id}: unbekannte Welt ${g.welt}`);
  g.bilder.forEach((b, i) => {
    pruefe(b.en && b.de, `Geschichte ${g.id}, Bild ${i + 1}: Englisch und Deutsch`);
    (b.woerter || []).forEach((id) => pruefe(ids.has(id), `Geschichte ${g.id}, Bild ${i + 1}: unbekanntes Wort ${id}`));
  });
}
pruefe(I.EINRICHTUNG.length === s.WAGEN_SCHRITTE.length, `Einrichtung: ${I.EINRICHTUNG.length} Stücke, aber ${s.WAGEN_SCHRITTE.length} Schritte`);
pruefe(s.WAGEN_SCHRITTE.every((n, i) => i === 0 || n > s.WAGEN_SCHRITTE[i - 1]), "die Schritte des Wagens steigen nicht");
Object.entries(I.SAETZE).forEach(([k, p]) => pruefe(Array.isArray(p) && p.length === 2 && p.every(Boolean), `SAETZE.${k}: braucht Englisch und Deutsch`));
I.LOB.forEach((p, i) => pruefe(p.length === 2 && p.every(Boolean), `LOB ${i}: braucht Englisch und Deutsch`));
["zimmer", "wahl", "entdecken", "hearfind", "geschichte", "woerterbuch"].forEach((k) => pruefe(I.HILFE[k], `HILFE.${k} fehlt`));

// --- 2. Bilder ------------------------------------------------------------------
for (const welt of I.WELTEN) {
  const bild = a.szene(welt.id);
  for (const w of welt.woerter) {
    pruefe(bild.includes(`data-ding="${w.id}"`), `Wimmelbild ${welt.id}: kein Ding ${w.id}`);
    pruefe(a.markeAn(welt.id, w.id), `Wimmelbild ${welt.id}: kein Ort für ${w.id}`);
    pruefe(a.STICKER[w.id], `kein Sticker für ${w.id}`);
    const st = a.sticker(w.id, 50, 50, 40, "gehoert");
    pruefe(/<path|<rect|<circle|<ellipse|<g data-mensch/.test(st.replace(/^<circle[^>]*>/, "")), `Sticker ${w.id} ist leer`);
  }
  pruefe(a.weltBild(welt.id).includes("<svg"), `kein Bild der Welt ${welt.id} für die Auswahl`);
}
for (const g of I.GESCHICHTEN) {
  pruefe(a.geschichtsTitelbild(g.id).includes("<svg"), `Geschichte ${g.id}: kein Titelbild`);
  g.bilder.forEach((b, i) => {
    const bild = a.geschichtsBild(g.id, i);
    pruefe(bild && bild.length > 100, `Geschichte ${g.id}, Bild ${i + 1}: keine Zeichnung`);
    (b.woerter || []).forEach((id) => pruefe(bild.includes(`data-wort="${id}"`), `Geschichte ${g.id}, Bild ${i + 1}: ${id} ist im Bild nicht antippbar`));
  });
}
const zimmer = a.zimmer({ ausbau: 15, neuAb: 15, karte: { titel: "The Farm", bild: "" }, aufnaeher: s.aufnaeher(), jukebox: true });
["tuer", "regal", "buch", "rocco", "karte", "kiste", "jukebox", "ausguck", "aufnaeher"].forEach((ort) => pruefe(zimmer.includes(`data-ort="${ort}"`), `Zimmer: kein Weg ${ort}`));
I.EINRICHTUNG.forEach((d) => pruefe(zimmer.includes(`data-ausbau="${d.id}"`), `Zimmer: Einrichtung ${d.id} ist nicht gezeichnet`));
const leer = a.zimmer({ ausbau: 0, neuAb: 0, karte: { titel: "The Farm", bild: "" }, aufnaeher: s.aufnaeher() });
pruefe(!leer.includes("data-ausbau="), "Zimmer: ohne Runden steht schon Einrichtung da");

// --- 2b. Etappe 2: Spiele, Farben, Zahlen, Verse, Bücher ----------------------------
pruefe(sp, "englisch-spiele.js meldet sich nicht an (window.LernappEnglischSpiele)");
(I.SPIELE || []).forEach((spiel) => {
  pruefe(spiel.id === "hearfind" || typeof sp?.[spiel.id] === "function", `Spiel ${spiel.id}: keine Funktion in englisch-spiele.js`);
  pruefe(sp?.spielBild?.(spiel.id)?.includes("<svg"), `Spiel ${spiel.id}: kein Bild für die Spielzeugkiste`);
});
["verse", "buch"].forEach((id) => pruefe(typeof sp?.[id] === "function", `englisch-spiele.js: ${id} fehlt`));
pruefe(I.FARBEN?.length >= 8 && I.ZAHLEN?.length === 10, "Farben oder Zahlen fehlen");
[...(I.FARBEN || []), ...(I.ZAHLEN || [])].forEach((w) => {
  pruefe(!ids.has(w.id), `Farbe/Zahl ${w.id}: Id wie ein Wort`);
  pruefe(s.wortVon(w.id), `${w.id}: der Stand kennt das Wort nicht`);
  pruefe(a.DING[w.id] && a.STICKER[w.id], `${w.id}: kein Sticker`);
});
(I.FARBEN || []).forEach((f) => pruefe(/^#[0-9a-f]{6}$/.test(f.hex) && f.akk, `Farbe ${f.id}: Farbe oder deutsche Form fehlt`));
(I.ESSEN || []).forEach((e) => pruefe(ids.has(e.id) && a.DING[e.id], `Feed Rocco: ${e.id} ist kein gezeichnetes Wort`));
(I.ZAEHLDINGE || []).forEach((d) => pruefe(["star", "balloon"].includes(d.id) || a.DING[d.id], `Count with Rocco: ${d.id} ist nicht gezeichnet`));
(I.VERSE || []).forEach((v) => {
  pruefe(v.zeilen.length >= 3 && v.titel?.length === 2, `Vers ${v.id}: zu kurz oder ohne Titel`);
  pruefe(sp?.versBild?.(v.id)?.includes("<svg"), `Vers ${v.id}: kein Bild für die Jukebox`);
  v.zeilen.forEach((z, i) => {
    pruefe(z.en && z.de, `Vers ${v.id}, Zeile ${i + 1}: Englisch und Deutsch`);
    (z.bild || []).forEach((b) => pruefe(["rocco", "star", "balloon"].includes(b) || a.DING[b], `Vers ${v.id}, Zeile ${i + 1}: kein Bild ${b}`));
  });
});
{
  const fenster = {};
  vm.runInContext(lies("lesen-buecher.js"), vm.createContext({ window: fenster }), { filename: "lesen-buecher.js" });
  const lese = fenster.LernappLeseBuecher?.BY_ID || {};
  (I.BUECHER || []).forEach((b) => {
    const l = lese[b.id];
    pruefe(l, `Buch ${b.id}: gibt es im Lesewagen nicht`);
    if (!l) return;
    pruefe(l.seiten.length === b.seiten.length, `Buch ${b.id}: ${b.seiten.length} englische Seiten, im Lesewagen ${l.seiten.length}`);
    pruefe(l.bilder && fs.existsSync(path.join(root, l.bilder, "umschlag-klein.webp")), `Buch ${b.id}: kein Umschlagbild`);
    b.seiten.forEach(([en, de], i) => {
      pruefe(en && de, `Buch ${b.id}, Seite ${i + 1}: Englisch und Deutsch`);
      pruefe(fs.existsSync(path.join(root, `bilder/buecher/${b.id}/seite-${String(i + 1).padStart(2, "0")}.webp`)), `Buch ${b.id}, Seite ${i + 1}: kein gemaltes Bild`);
    });
  });
}
// Etappe 3: Kleider, Telefon, Diner, Post, die Spiele am Telefon.
(I.KLEIDER || []).forEach((x) => {
  pruefe(s.wortVon(x.id), `Dress up: ${x.id} ist kein Wort`);
  pruefe(a.ROCCO_KLEIDER?.[x.id], `Dress up: Rocco kann ${x.id} nicht anziehen (ROCCO_KLEIDER)`);
  pruefe(a.DING[x.id] && a.STICKER[x.id], `Dress up: ${x.id} hat keinen Sticker`);
});
(I.TELEFON || []).forEach((t, i) => {
  pruefe(t.frage?.length === 2 && t.antworten?.length, `Telefon, Schritt ${i + 1}: Frage oder Antworten fehlen`);
  t.antworten.forEach((x) => pruefe(x.satz?.length === 2, `Telefon ${x.id}: Antwort ohne Englisch und Deutsch`));
  if (t.art === "tier") t.antworten.forEach((x) => pruefe(a.STICKER[x.id], `Telefon: kein Sticker für ${x.id}`));
});
(I.DINER_GAESTE || []).forEach((id) => pruefe(a.DING[id], `Diner: Gast ${id} ist nicht gezeichnet`));
(I.DINER_ESSEN || []).forEach((id) => pruefe(ids.has(id) && a.DING[id], `Diner: ${id} ist kein gezeichnetes Wort`));
(I.DINER_PAARE || []).forEach(([p, q]) => pruefe(I.DINER_ESSEN.includes(p) && I.DINER_ESSEN.includes(q), `Diner: ${p} und ${q} stehen nicht auf der Karte`));
(I.POSTKARTEN || []).forEach((k) => {
  pruefe(a.POSTKARTEN?.[k.id]?.().length > 100, `Post: keine Zeichnung für ${k.id}`);
  pruefe(k.text?.length === 2, `Post ${k.id}: Englisch und Deutsch`);
});
pruefe(!I.POSTKARTEN?.length || (a.BRIEFKASTEN && a.ruby), "Post: Briefkasten oder Ruby fehlen");
[...(I.SPIELE || []), ...(I.TELEFON_SPIELE || [])].forEach((spiel) => pruefe(spiel.id === "hearfind" || typeof sp?.[spiel.id] === "function", `Spiel ${spiel.id}: keine Funktion`));
(I.TELEFON_SPIELE || []).forEach((spiel) => pruefe(sp?.spielBild?.(spiel.id)?.includes("<svg"), `Spiel ${spiel.id}: kein Bild am Telefon`));
pruefe(typeof sp?.post === "function" && typeof sp?.postNeu === "function", "englisch-spiele-3.js: post fehlt");
{
  const z = a.zimmer({ ausbau: 15, neuAb: 15, karte: { titel: "The Farm", bild: "" }, aufnaeher: s.aufnaeher(), jukebox: true, telefon: true, post: { neu: true } });
  ["telefon", "briefkasten"].forEach((ort) => pruefe(z.includes(`data-ort="${ort}"`), `Zimmer: kein Weg ${ort}`));
}
{
  const { s: langsam } = sandbox({ eltern: { schrift: "auto", tempo: "langsam", at: 1 } });
  pruefe(langsam.eltern().tempo === "langsam" && s.eltern().tempo === "normal", "Tempo: «Langsamer» der Eltern gilt nicht");
  pruefe(lies("kids.js").includes("aufnahmeTempo") && lies("kids.js").includes("preservesPitch"), "kids.js spielt Englisch nicht langsamer");
}

// Etappe 4: Monster, Where is the cat?, Opposites, Wortbild, Aufträge.
if (I.MONSTER_TEILE) {
  pruefe(typeof a.MONSTER === "function" && a.MONSTER({ farbe: "#3fbf74", augen: 3, arme: 2, beine: 2 }).length > 100, "Make a monster: keine Zeichnung (MONSTER)");
  for (const x of I.WO_KATZE) pruefe(a.WO_KATZE?.(x.wo, x.ding)?.length > 100, `Where is the cat?: kein Bild für ${x.wo} ${x.ding}`);
  for (const g of I.GEGENTEILE) g.paar.forEach((id) => pruefe(a.GEGENTEILE?.[id]?.().length > 50, `Opposites: kein Bild für ${id}`));
  ["monster", "wokatze", "gegenteile", "wortbild"].forEach((id) => pruefe(typeof sp?.[id] === "function", `englisch-spiele-4.js: ${id} fehlt`));
  I.WELTEN.forEach((w) => pruefe(I.AUFTRAEGE?.[w.id], `Aufträge für die Familie: nichts für ${w.id}`));
  pruefe((I.SPIELE || []).every((x) => (I.SPIEL_GRUPPEN || []).some((g) => g.id === x.gruppe)), "Spielzeugkiste: ein Spiel ohne Gruppe");
}

// Was die Spiele zusammensetzen, steht in der Liste der Aufnahmen.
{
  const englisch = new Set(I.paare().map((p) => p.en));
  for (const f of I.FARBEN || []) for (const g of [null, "big", "small"]) pruefe(englisch.has(I.tippeBallon(f, g)[0]), `fehlt in paare(): ${I.tippeBallon(f, g)[0]}`);
  for (const w of I.WELTEN.flatMap((x) => x.woerter)) pruefe(englisch.has(I.istDas(w)[0]), `fehlt in paare(): ${I.istDas(w)[0]}`);
  for (const d of I.ZAEHLDINGE || []) for (let n = 1; n <= 10; n += 1) pruefe(englisch.has(I.soViele(d, n)[0]), `fehlt in paare(): ${I.soViele(d, n)[0]}`);
}

// --- 3. Stand --------------------------------------------------------------------
{
  let tag = "2026-11-02";
  const { s: st } = sandbox({ heute: () => tag });
  pruefe(st.wortStand("cow") === "zu", "ein neues Wort ist nicht «zu»");
  pruefe(st.gehoert("cow") === true, "das erste Hören ist kein neuer Sticker");
  pruefe(st.gehoert("cow") === false, "das zweite Hören ist ein neuer Sticker");
  pruefe(st.gehoert("unbekannt") === false, "ein unbekanntes Wort zählt");
  pruefe(st.wortStand("cow") === "gehoert", "gehört ist nicht «gehoert»");
  st.erkannt("cow", false);
  pruefe(st.wortStand("cow") === "gehoert" && st.stand().woerter.cow.f === 1, "daneben getippt zählt nicht als Fehler");
  st.erkannt("cow", true);
  pruefe(st.wortStand("cow") === "erkannt", "beim ersten Versuch gefunden ist nicht «erkannt»");
  st.erkannt("cow", true);
  pruefe(st.wortStand("cow") === "erkannt", "zweimal am selben Tag ist schon «sicher»");
  tag = "2026-11-03";
  st.erkannt("cow", true);
  pruefe(st.wortStand("cow") === "sicher", "an zwei Tagen erkannt ist nicht «sicher»");
  // Aufnäher: alle Wörter einer Welt erkannt, Gold: alle sicher.
  const farm = I.WELTEN.find((w) => w.id === "farm");
  farm.woerter.forEach((w) => st.erkannt(w.id, true));
  pruefe(st.welt("farm").voll && !st.welt("farm").gold, "alle erkannt gibt keinen Aufnäher (oder schon Gold)");
  tag = "2026-11-04";
  farm.woerter.forEach((w) => st.erkannt(w.id, true));
  pruefe(st.welt("farm").gold, "alle sicher gibt keinen Goldrand");
  // Einrichtung nach Runden.
  pruefe(st.wagenStufe() === 0, "ohne Runden ist der Wagen schon eingerichtet");
  st.runde("entdecken");
  pruefe(st.wagenStufe() === 1, "nach der ersten Runde kein erstes Stück");
  for (let i = 0; i < 70; i += 1) st.runde("hearfind");
  pruefe(st.wagenStufe() === 15, "nach 71 Runden nicht ganz eingerichtet");
  st.geschichteGehoert("ball");
  pruefe(st.stand().geschichten.ball === 1 && st.stand().runden.geschichte === 1, "eine fertige Geschichte zählt nicht");
  // Hear and find: nie mehr als n, nur Wörter der Welt, Gehörtes zuerst.
  const { s: st2 } = sandbox({ heute: () => "2026-11-04" });
  ["bed", "tv", "mom"].forEach((id) => st2.gehoert(id));
  const runde = st2.hearfindWoerter("house", 5);
  pruefe(runde.length === 5 && new Set(runde).size === 5, "Hear and find: nicht fünf verschiedene Wörter");
  pruefe(["bed", "tv", "mom"].every((id) => runde.slice(0, 3).includes(id)), "Hear and find: Gehörtes kommt nicht zuerst");
  pruefe(runde.every((id) => I.WELTEN.find((w) => w.id === "house").woerter.some((w) => w.id === id)), "Hear and find: ein Wort aus einer anderen Welt");
}
{
  // Zusammenführen: gleich in beide Richtungen, nichts doppelt.
  const x = { woerter: { cow: { g: "2026-11-01", n: 3, e: ["2026-11-01"], f: 1 }, pig: { g: "2026-11-02", n: 1, e: [], f: 0 } }, runden: { entdecken: 2 }, geschichten: { ball: 1 } };
  const y = { woerter: { cow: { g: "2026-10-30", n: 2, e: ["2026-11-03"], f: 2 } }, runden: { entdecken: 1, hearfind: 4 }, geschichten: { cat: 2 } };
  const xy = s.merge(x, y);
  const yx = s.merge(y, x);
  pruefe(kanonisch(xy) === kanonisch(yx), "Zusammenführen ist nicht in beide Richtungen gleich");
  pruefe(xy.woerter.cow.g === "2026-10-30" && xy.woerter.cow.n === 3 && xy.woerter.cow.e.length === 2 && xy.woerter.cow.f === 2, "Zusammenführen eines Worts stimmt nicht");
  pruefe(xy.runden.entdecken === 2 && xy.runden.hearfind === 4 && xy.geschichten.ball === 1 && xy.geschichten.cat === 2, "Zusammenführen zählt Runden doppelt oder verliert sie");
  pruefe(kanonisch(s.merge(xy, xy)) === kanonisch(xy), "Zusammenführen mit sich selbst ändert etwas");
  const kaputt = s.merge({ woerter: { cow: { g: "gestern", n: -3, e: "x" } }, runden: { a: "viel" } }, null);
  pruefe(kaputt.woerter.cow.g === "" && kaputt.woerter.cow.n === 0 && Array.isArray(kaputt.woerter.cow.e) && !kaputt.runden.a, "Zusammenführen räumt Unsinn nicht weg");
}
{
  // Was Rocco vorschlägt.
  const { s: st } = sandbox({ heute: () => "2026-11-04" });
  let v = st.vorschlag();
  pruefe(v.art === "entdecken" && v.welt === "farm", `Vorschlag ganz am Anfang: ${JSON.stringify(v)} statt Entdecken auf dem Bauernhof`);
  ["sun", "barn", "tractor", "tree", "apple"].forEach((id) => st.gehoert(id));
  v = st.vorschlag();
  pruefe(v.art === "hearfind" && v.welt === "farm", `Vorschlag nach fünf Wörtern: ${JSON.stringify(v)} statt Hear and find`);
  I.WELTEN.find((w) => w.id === "farm").woerter.forEach((w) => st.erkannt(w.id, true));
  v = st.vorschlag();
  pruefe(v.art === "geschichte" && I.GESCHICHTEN.find((g) => g.id === v.geschichte)?.welt === "farm", `Vorschlag nach dem Bauernhof: ${JSON.stringify(v)} statt einer Geschichte vom Hof`);
  // Ein halb entdeckter Hof: Sind alle gehörten Wörter erkannt, gibt es dort
  // nichts mehr zu suchen (Hear and find fragt nur Gehörtes ab) – sonst bliebe
  // der Vorschlag stehen, so oft das Kind ihn spielt.
  const { s: halb } = sandbox({ heute: () => "2026-11-04" });
  const hof = I.WELTEN.find((w) => w.id === "farm").woerter.map((w) => w.id);
  hof.slice(0, 8).forEach((id) => { halb.gehoert(id); halb.erkannt(id, true); });
  const nachHalb = halb.vorschlag();
  pruefe(!(nachHalb.art === "hearfind" && nachHalb.welt === "farm"), `Vorschlag mit 8 von 13 Wörtern erkannt: wieder Hear and find auf dem Hof (${JSON.stringify(nachHalb)}), obwohl eine Runde dort nichts Neues mehr abfragt`);
  // Ein Kind, das immer den Vorschlag spielt (und alles beim ersten Mal
  // findet), kommt voran: nie mehr als dreimal derselbe Vorschlag, am ersten
  // Tag alle Welten erkannt, am zweiten alle sitzend – und Hear and find nur,
  // wo eine Runde etwas bewirkt.
  let tag = "2026-11-04";
  const { s: kind } = sandbox({ heute: () => tag });
  hof.slice(0, 7).forEach((id) => kind.gehoert(id));
  const folge = (runden) => {
    let alt = "", gleich = 0, meist = 0;
    for (let i = 0; i < runden; i += 1) {
      const v = kind.vorschlag();
      const k = `${v.art}:${v.welt || v.geschichte}`;
      gleich = k === alt ? gleich + 1 : 1; meist = Math.max(meist, gleich); alt = k;
      if (v.art === "hearfind") {
        const vorher = JSON.stringify(kind.welt(v.welt));
        kind.hearfindWoerter(v.welt, 5).forEach((id) => kind.erkannt(id, true));
        pruefe(JSON.stringify(kind.welt(v.welt)) !== vorher, `Vorschlag Hear and find in ${v.welt} (${tag}) bringt nichts weiter`);
      } else if (v.art === "entdecken") I.WELTEN.find((w) => w.id === v.welt).woerter.forEach((w) => kind.gehoert(w.id));
      else kind.geschichteGehoert(v.geschichte);
    }
    return meist;
  };
  const meist1 = folge(150);
  pruefe(meist1 <= 3 && kind.aufnaeher().every((w) => w.voll), `Vorschlag am ersten Tag: bis ${meist1}-mal derselbe, ${kind.aufnaeher().filter((w) => w.voll).length} von ${I.WELTEN.length} Welten erkannt`);
  tag = "2026-11-05";
  const meist2 = folge(150);
  pruefe(meist2 <= 3 && kind.aufnaeher().every((w) => w.gold), `Vorschlag am zweiten Tag: bis ${meist2}-mal derselbe, ${kind.aufnaeher().filter((w) => w.gold).length} von ${I.WELTEN.length} Welten sitzen`);
  // Bericht
  const b = st.bericht(st.stand());
  pruefe(b.gehoert === 13 && b.von === I.WELTEN.reduce((n, w) => n + w.woerter.length, 0), "Bericht: gehörte Wörter stimmen nicht");
  pruefe(b.welten.length === I.WELTEN.length && b.welten[0].voll, "Bericht: Welten stimmen nicht");
}
{
  // Schrift: automatisch ab «schwer», sonst wie die Eltern es wollen.
  pruefe(sandbox({ stufe: "leicht" }).s.schriftZeigen() === false, "Schrift: automatisch auf «leicht» sichtbar");
  pruefe(sandbox({ stufe: "schwer" }).s.schriftZeigen() === true, "Schrift: automatisch auf «schwer» nicht sichtbar");
  pruefe(sandbox({ stufe: "leicht", eltern: { schrift: "an", at: 1 } }).s.schriftZeigen() === true, "Schrift: «Immer zeigen» gilt nicht");
  pruefe(sandbox({ stufe: "schwer", eltern: { schrift: "aus", at: 1 } }).s.schriftZeigen() === false, "Schrift: «Nur hören» gilt nicht");
}

// --- 4. Stimme -------------------------------------------------------------------
{
  const da = en.verzeichnis();
  pruefe(da, "englisch-stimme.js fehlt oder lässt sich nicht lesen");
  const texte = await en.englischTexte();
  const ohne = texte.filter((t) => !da?.[t.text]);
  pruefe(!ohne.length, `${ohne.length} englische Texte ohne Aufnahme, z. B. ${ohne.slice(0, 3).map((t) => `«${t.text}»`).join(", ")} – node scripts/stimme-google.mjs vertonen --bereich englisch`);
  for (const t of texte) {
    const datei = da?.[t.text];
    if (!datei) continue;
    pruefe(datei.startsWith(`${en.ORDNER}/`), `«${t.text}»: Aufnahme nicht in ${en.ORDNER}/`);
    const voll = path.join(root, datei);
    if (!fs.existsSync(voll)) { fehler.push(`«${t.text}»: ${datei} fehlt`); continue; }
    const sekunden = sekundenVon(fs.readFileSync(voll));
    pruefe(passtZumText(sekunden, t.text), `«${t.text}»: ${sekunden.toFixed(2)} s passen nicht zum Text`);
  }
  const gesagt = new Set(texte.map((t) => t.text));
  const fremd = Object.keys(da || {}).filter((t) => !gesagt.has(t));
  pruefe(!fremd.length, `${fremd.length} Aufnahmen in englisch-stimme.js, die niemand sagt, z. B. «${fremd[0]}» – node scripts/stimme-google.mjs aufraeumen --bereich englisch`);
  const ordner = path.join(root, en.ORDNER);
  const belegt = new Set(Object.values(da || {}));
  const lose = fs.existsSync(ordner) ? fs.readdirSync(ordner).filter((n) => !belegt.has(`${en.ORDNER}/${n}`)) : [];
  pruefe(!lose.length, `${lose.length} lose Dateien in ${en.ORDNER}/`);
  // Die deutsche Seite: mit der Stimme der App.
  const appDa = app.verzeichnis() || {};
  const deutsch = [...en.paare(I).map((p) => p.de), ...Object.values(I.HILFE)];
  const { saetzeVon } = await import("./stimme-bau-texte.mjs");
  const deOhne = deutsch.filter((text) => !appDa[sprechText(text)] && !saetzeVon(sprechText(text)).every((satz) => appDa[satz]));
  pruefe(!deOhne.length, `${deOhne.length} deutsche Texte der Englischecke ohne Aufnahme, z. B. «${deOhne[0]}» – node scripts/stimme-google.mjs vertonen --bereich app`);
  // Kein englischer Satz mit der deutschen Stimme.
  const appTexte = await app.appTexte();
  const englischDeutsch = appTexte.filter((t) => gesagt.has(t.text) && !deutsch.includes(t.text) && /englisch/.test(t.wo));
  pruefe(!englischDeutsch.length, `englische Sätze in der deutschen Liste: ${englischDeutsch.slice(0, 3).map((t) => `«${t.text}» (${t.wo})`).join(", ")}`);
}

// --- Gemälde ---------------------------------------------------------------------
// Jedes Wimmelbild und jedes Geschichtenbild ist gemalt (bilder/englisch/), und
// englisch-gemalt.js sagt für jedes Wort, wo es im Gemälde steht.
{
  const G = a.GEMALT || {};
  const da = (name) => fs.existsSync(path.join(root, "bilder/englisch", `${name}.webp`));
  const imBild = (r, b, h) => Array.isArray(r) && r.every(Number.isFinite) && r[2] > 4 && r[3] > 4 && r[0] >= -1 && r[1] >= -1 && r[0] + r[2] <= b + 1 && r[1] + r[3] <= h + 1;
  for (const welt of I.WELTEN) {
    const g = G.welten?.[welt.id];
    pruefe(g, `${welt.id}: kein Gemälde in englisch-gemalt.js`);
    if (!g) continue;
    pruefe(da(`welt-${welt.id}`) && da(`welt-${welt.id}-klein`), `${welt.id}: bilder/englisch/welt-${welt.id}.webp oder -klein.webp fehlt`);
    for (const w of welt.woerter) {
      const o = g.orte?.[w.id];
      pruefe(o && o.length === 7 && o.every(Number.isFinite) && o[2] > 0, `${welt.id}/${w.id}: steht nicht im Gemälde`);
      if (o) pruefe(imBild(o.slice(3), 1000, 560), `${welt.id}/${w.id}: der Rahmen im Gemälde liegt nicht im Bild (${o.slice(3)})`);
    }
    const svg = a.szene(welt.id);
    pruefe(svg.includes(`welt-${welt.id}.webp`) && welt.woerter.every((w) => svg.includes(`data-ding="${w.id}"`)), `${welt.id}: die Szene zeigt das Gemälde nicht mit allen Dingen`);
    pruefe(!a.szene(welt.id, { gezeichnet: true }).includes(".webp"), `${welt.id}: die Zeichnung zeigt trotzdem das Gemälde`);
  }
  for (const g of I.GESCHICHTEN) {
    const bilder = G.geschichten?.[g.id];
    pruefe(bilder && bilder.length === g.bilder.length, `Geschichte ${g.id}: nicht jedes Bild ist gemalt`);
    if (!bilder) continue;
    const titel = a.TITELBILD[g.id] ?? 0;
    pruefe(da(`geschichte-${g.id}-${titel + 1}-klein`), `Geschichte ${g.id}: kein kleines Titelbild`);
    bilder.forEach((b, i) => {
      pruefe(da(`geschichte-${g.id}-${i + 1}`), `Geschichte ${g.id}, Bild ${i + 1}: bilder/englisch/geschichte-${g.id}-${i + 1}.webp fehlt`);
      const gezeichnet = [...a.geschichtsBild(g.id, i, { gezeichnet: true }).matchAll(/data-wort="([^"]+)"/g)].map((m) => m[1]);
      const gemalt = Object.keys(b.woerter || {});
      pruefe([...new Set(gezeichnet)].sort().join() === gemalt.sort().join(), `Geschichte ${g.id}, Bild ${i + 1}: im Gemälde lässt sich anderes antippen (${gemalt}) als in der Zeichnung (${[...new Set(gezeichnet)]})`);
      Object.entries(b.woerter || {}).forEach(([wort, rr]) => rr.forEach((r) => pruefe(imBild(r, 472, 204), `Geschichte ${g.id}, Bild ${i + 1}, ${wort}: der Rahmen liegt nicht im Bild`)));
      const svg = a.geschichtsBild(g.id, i);
      pruefe(svg.includes(`geschichte-${g.id}-${i + 1}.webp`), `Geschichte ${g.id}, Bild ${i + 1}: zeigt das Gemälde nicht`);
    });
  }
  // Sticker, Aufnäher und das Buch (scripts/englisch-sticker-schneiden.py)
  for (const w of [...alleWoerter, ...(I.FARBEN || []), ...(I.ZAHLEN || [])]) {
    pruefe(G.sticker?.has(w.id) && da(`sticker/${w.id}`), `${w.id}: kein gemalter Sticker (bilder/englisch/sticker/${w.id}.webp)`);
  }
  for (const welt of I.WELTEN) pruefe(G.aufnaeher?.has(welt.id) && da(`aufnaeher/${welt.id}`), `${welt.id}: kein gemalter Aufnäher`);
  pruefe(G.woerterbuch && da("woerterbuch"), "das Wörterbuch ist nicht gemalt (bilder/englisch/woerterbuch.webp)");
  pruefe(a.sticker("cow", 0, 0, 30, "gehoert").includes("sticker/cow.webp") && a.aufnaeher("farm", 0, 0, 30, { voll: true }).includes("aufnaeher/farm.webp") && a.woerterbuchBild().includes("woerterbuch.webp"), "Sticker, Aufnäher oder Buch zeigen das Gemälde nicht");
}

// --- 5. Einbau -------------------------------------------------------------------
{
  const index = lies("index.html");
  const sw = lies("service-worker.js");
  const reihe = ["englisch-inhalt.js", "englisch-stand.js", "englisch-art.js", "englisch-art-2.js", "englisch-spiele.js", "englisch-art-3.js", "englisch-spiele-3.js", "englisch-art-4.js", "englisch-gemalt.js", "englisch-spiele-4.js", "englisch-stimme.js", "sprachwagen.js", "train-englischecke.js", "train-home.js"];
  const stellen = reihe.map((d) => index.indexOf(`src="${d}`));
  stellen.forEach((st, i) => pruefe(st > 0, `index.html lädt ${reihe[i]} nicht`));
  pruefe(stellen.every((st, i) => i === 0 || st > stellen[i - 1]), `index.html lädt die Englischecke nicht in der Reihenfolge ${reihe.join(" → ")}`);
  pruefe(index.includes('src="bau-menschen.js'), "index.html lädt bau-menschen.js nicht (Mama und Papa der Englischecke)");
  pruefe(/href="englisch\.css/.test(index), "index.html lädt englisch.css nicht");
  [...reihe.slice(0, 13), "englisch.css"].forEach((d) => pruefe(sw.includes(`./${d}`), `service-worker.js hält ${d} nicht vor`));
  pruefe(sw.includes('"/bilder/englisch/"'), "service-worker.js legt die gemalten Bilder der Englischecke nicht in den Cache der Buchbilder");
  const ent = lies("entitlement.js");
  const tor = lies("train-englischecke.js");
  // Jedes Spiel, das die Englischecke der Schranke meldet, kennt entitlement.js.
  const gemeldet = [...(/const SPIEL = \{([\s\S]*?)\};/.exec(tor)?.[1] || "").matchAll(/"(en-[a-z]+)"/g)].map((m) => m[1]);
  pruefe(gemeldet.length >= 21, `train-englischecke.js meldet nur ${gemeldet.length} Spiele`);
  gemeldet.forEach((id) => pruefe(ent.includes(`"${id}"`), `entitlement.js kennt das Spiel ${id} nicht`));
  ["en-entdecken", "en-hearfind", "en-geschichten"].forEach((id) => {
    pruefe(ent.includes(`"${id}"`), `entitlement.js kennt das Spiel ${id} nicht`);
    pruefe(tor.includes(`"${id}"`), `train-englischecke.js kennt das Spiel ${id} nicht`);
  });
  pruefe(/ENGLISCHECKE/.test(ent) && /\[\.\.\.AREAS, LESEECKE, RECHENECKE, ENGLISCHECKE[\],]/.test(ent), "entitlement.js zählt die Englischecke nicht zu den Bereichen");
  pruefe(lies("firebase.js").includes('"lernapp.englisch.eltern"'), "firebase.js behält die Einstellung der Eltern beim Zurücksetzen nicht");
  pruefe(/\ben: \{ dateien: \(\) => window\.LernappEnglischDateien/.test(lies("kids.js")), "kids.js spricht kein Englisch");
}

// --- 6. Sprache ------------------------------------------------------------------
for (const datei of ["englisch-inhalt.js", "englisch-stand.js", "englisch-art.js", "englisch-art-2.js", "englisch-spiele.js", "englisch-art-3.js", "englisch-spiele-3.js", "englisch-art-4.js", "englisch-gemalt.js", "englisch-spiele-4.js", "sprachwagen.js", "train-englischecke.js", "englisch.css", "docs/ENGLISCHECKE-KONZEPT.md"]) {
  const text = lies(datei);
  // Nur im Konzept darf stehen, wovon es umbenannt wurde («statt …»).
  pruefe(!text.split("\n").some((zeile) => /H[öo]r\s*&\s*find/i.test(zeile) && !/statt/.test(zeile)), `${datei}: «Hör & find» – es heisst «Hear and find»`);
  pruefe(!text.includes("ß"), `${datei}: scharfes S`);
}

if (fehler.length) {
  console.error(`Die Englischecke stimmt nicht (${fehler.length}):\n${fehler.map((f) => `  - ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`Die Englischecke stimmt: ${I.WELTEN.length} Welten, ${alleWoerter.length} Wörter, ${I.GESCHICHTEN.length} Geschichten, ${(await en.englischTexte()).length} englische Aufnahmen.`);
