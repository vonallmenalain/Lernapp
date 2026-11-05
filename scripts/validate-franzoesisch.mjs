/*
 * Stimmt die Französischecke – ohne Browser?
 * ---------------------------------------------------------------------------
 *   Inhalt     Dieselbe Form wie der Englischwagen (franzoesisch-inhalt.js):
 *              jede Welt ist eine Welt des Englischwagens, jedes Wort hat
 *              Französisch und Deutsch, Satz und Frage, mit Artikel; keine Id
 *              doppelt; französische Typografie (ein Leerzeichen vor ? ! : ;,
 *              keines vor . und ,); jede Geschichte vier Bilder.
 *   Bilder     Zu jedem Wort gibt es die Zeichnung, den Ort im Wimmelbild und
 *              den Sticker des Englischwagens; jede Geschichte hat ihre
 *              Zeichnung, und was ihr Satz antippbar macht, ist darin; der
 *              Bistrowagen hat alle Wege und alle 15 Stücke Einrichtung;
 *              Margot steht, wo im Englischwagen Rocco steht.
 *   Spiele     Jedes Spiel hat seine Funktion; was gezeichnet werden muss, ist
 *              gezeichnet; die Bücher haben so viele Seiten wie im Lesewagen;
 *              was ein Spiel zusammensetzt, steht in paare().
 *   Stand      Ein eigener Kasten (lernapp.franzoesisch) und eine eigene
 *              Einstellung der Eltern; was der Stand zählt, sind die Wörter
 *              des Französischwagens.
 *   Stimme     Jeder französische Text hat seine Aufnahme (stimme/franzoesisch/,
 *              franzoesisch-stimme.js) und ist so lang, wie der Text es
 *              verlangt; jeder deutsche Text des Knopfs DE hat eine Aufnahme
 *              der App-Stimme.
 *   Gemälde    Jede Geschichte ist mit Margot gemalt (franzoesisch-gemalt.js,
 *              bilder/franzoesisch/), und im Gemälde lässt sich antippen, was
 *              in der Zeichnung antippbar ist; Margot hat ihren Sticker.
 *   Einbau     Startseite und Service Worker laden die Dateien, die Schranke
 *              kennt die Spiele, kids.js spricht Französisch.
 *   Sprache    kein scharfes S.
 *
 * Aufruf:  node scripts/validate-franzoesisch.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { passtZumText, sekundenVon, saetzeVon } from "./stimme-bau-texte.mjs";
import * as fr from "./stimme-franzoesisch-texte.mjs";
import * as app from "./stimme-app-texte.mjs";
import { sprechText } from "./stimme-texte.mjs";

const root = path.resolve(import.meta.dirname, "..");
const fehler = [];
const pruefe = (bedingung, meldung) => { if (!bedingung) fehler.push(meldung); };
const lies = (name) => fs.readFileSync(path.join(root, name), "utf8");

// --- Sandbox: wie die Seite, mit dem Französischwagen als offenem Wagen ---------
function sandbox() {
  const store = new Map();
  const windowStub = {
    LernappReise: { stufe: () => "mittel" },
    LernappBauMenschen: { tier: (art) => `<g data-mensch="${art}"/>` },
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
  };
  const context = vm.createContext({
    window: windowStub,
    document: { addEventListener() {}, dispatchEvent() { return true; } },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    Date, Math, JSON, Number, String, Set, Map, Object, Array,
  });
  for (const datei of ["englisch-inhalt.js", "englisch-stand.js", "englisch-art.js", "englisch-art-2.js", "englisch-spiele.js", "englisch-art-3.js", "englisch-spiele-3.js", "englisch-art-4.js", "englisch-gemalt.js", "englisch-spiele-4.js",
    "franzoesisch-inhalt.js", "franzoesisch-stand.js", "franzoesisch-art.js", "franzoesisch-gemalt.js"]) vm.runInContext(lies(datei), context, { filename: datei });
  return { w: windowStub, I: windowStub.LernappFranzoesischInhalt, E: windowStub.LernappEnglischInhalt, s: windowStub.LernappFranzoesischStand, a: windowStub.LernappFranzoesischArt, sp: windowStub.LernappEnglischSpiele, store };
}
const { w, I, E, s, a, sp } = sandbox();
pruefe(I && s && a, "franzoesisch-inhalt.js, franzoesisch-stand.js oder franzoesisch-art.js meldet sich nicht an");
if (!I || !s || !a) { console.error(fehler.join("\n")); process.exit(1); }
// Der Französischwagen ist offen: Die Zeichnungen zeigen Margot, die
// Geschichten Margots Gemälde (wie sprachwagen.js es beim Einsteigen setzt).
w.LernappSprachwagen = { aktiv: { id: "franzoesisch", maskottchen: a.MASKOTTCHEN, art: () => a, inhalt: () => I, gemalt: () => w.LernappFranzoesischGemalt } };

// --- 1. Inhalt ------------------------------------------------------------------
const GROSS = /^[A-ZÀÂÄÇÉÈÊËÎÏÔŒÙÛÜ]/;
const ids = new Set();
const alleWoerter = [...I.WELTEN.flatMap((x) => x.woerter), ...I.EXTRA_WOERTER];
const englischeWelten = new Map(E.WELTEN.map((x) => [x.id, x]));
const englischeWoerter = new Set([...E.WELTEN.flatMap((x) => x.woerter), ...E.EXTRA_WOERTER].map((x) => x.id));
pruefe(I.WELTEN.length >= 11, `nur ${I.WELTEN.length} Welten`);
for (const welt of I.WELTEN) {
  pruefe(englischeWelten.has(welt.id), `${welt.id}: keine Welt des Englischwagens (es gäbe kein Bild)`);
  pruefe(welt.woerter.length === 13, `${welt.id}: nicht 13 Wörter`);
  pruefe(Array.isArray(welt.titel) && welt.titel.length === 2 && welt.titel.every(Boolean), `${welt.id}: Titel braucht Französisch und Deutsch`);
  pruefe(Array.isArray(welt.intro) && welt.intro.length === 2 && welt.intro.every(Boolean), `${welt.id}: Einleitung braucht Französisch und Deutsch`);
  const en = englischeWelten.get(welt.id);
  if (en) pruefe(welt.woerter.map((x) => x.id).join() === en.woerter.map((x) => x.id).join(), `${welt.id}: andere Wörter als im Englischwagen (das Wimmelbild hat dieselben)`);
}
for (const x of alleWoerter) {
  pruefe(!ids.has(x.id), `Wort ${x.id} doppelt`);
  ids.add(x.id);
  pruefe(englischeWoerter.has(x.id), `Wort ${x.id}: gibt es im Englischwagen nicht (keine Zeichnung)`);
  for (const feld of ["en", "satz", "frage", "de", "deSatz", "deFrage"]) {
    pruefe(typeof x[feld] === "string" && GROSS.test(x[feld]) && /[.!?]$/.test(x[feld]), `${x.id}.${feld}: «${x[feld]}» – gross am Anfang, Satzzeichen am Schluss`);
  }
  pruefe(/ \?$/.test(x.frage) && /\S\?$/.test(x.deFrage), `${x.id}: die Frage endet mit « ?» (deutsch mit «?»)`);
  // Jedes Wort mit seinem Artikel – ausser Maman und Papa.
  pruefe(["mom", "dad"].includes(x.id) || /^(Un|Une|Des|Du|De la|De l'|Le|La|Les|L')\s?/.test(x.en), `${x.id}: «${x.en}» ohne Artikel`);
  pruefe(/^Où (est|sont) /.test(x.frage), `${x.id}: die Frage beginnt nicht mit «Où est»`);
}
for (const g of I.GESCHICHTEN) {
  pruefe(g.bilder.length === 4, `Geschichte ${g.id}: nicht vier Bilder`);
  pruefe(I.WELTEN.some((x) => x.id === g.welt), `Geschichte ${g.id}: unbekannte Welt ${g.welt}`);
  pruefe(a.GESCHICHTEN_BILDER[g.id]?.length === 4, `Geschichte ${g.id}: keine Zeichnung (GESCHICHTEN_BILDER)`);
  g.bilder.forEach((b, i) => {
    pruefe(b.en && b.de, `Geschichte ${g.id}, Bild ${i + 1}: Französisch und Deutsch`);
    (b.woerter || []).forEach((id) => pruefe(ids.has(id), `Geschichte ${g.id}, Bild ${i + 1}: unbekanntes Wort ${id}`));
    pruefe(!/Rocco/.test(b.en + b.de), `Geschichte ${g.id}, Bild ${i + 1}: Rocco statt Margot`);
  });
}
pruefe(I.EINRICHTUNG.length === s.WAGEN_SCHRITTE.length, `Einrichtung: ${I.EINRICHTUNG.length} Stücke, aber ${s.WAGEN_SCHRITTE.length} Schritte`);
Object.entries(I.SAETZE).forEach(([k, p]) => pruefe(Array.isArray(p) && p.length === 2 && p.every(Boolean), `SAETZE.${k}: braucht Französisch und Deutsch`));
Object.keys(E.SAETZE).filter((k) => !/^(diner|dinerZu|post|keinePost)$/.test(k)).forEach((k) => pruefe(I.SAETZE[k], `SAETZE.${k} fehlt (der Englischwagen hat ihn)`));
I.LOB.forEach((p, i) => pruefe(p.length === 2 && p.every(Boolean), `LOB ${i}: braucht Französisch und Deutsch`));
Object.keys(E.HILFE).filter((k) => !/^(diner|post)$/.test(k)).forEach((k) => pruefe(I.HILFE[k], `HILFE.${k} fehlt`));
// Französische Typografie und keine Spur des Englischwagens.
const PAARE = I.paare();
for (const p of PAARE) {
  pruefe(!/\S[?!:;]/.test(p.en.replace(/https?:/g, "")), `${p.wo}: «${p.en}» – vor ? ! : ; steht ein Leerzeichen`);
  pruefe(!/ [.,]/.test(p.en), `${p.wo}: «${p.en}» – vor . und , kein Leerzeichen`);
  pruefe(!/ [?!:;.,]/.test(p.de), `${p.wo}: «${p.de}» – im Deutschen kein Leerzeichen vor dem Satzzeichen`);
  pruefe(!/Rocco|Ruby|\bthe\b|\bplease\b/i.test(p.en), `${p.wo}: «${p.en}» – Englisch oder Rocco im Französischwagen`);
  pruefe(!/Rocco/.test(p.de), `${p.wo}: «${p.de}» – Rocco im Französischwagen`);
}
Object.values(I.HILFE).forEach((t) => pruefe(!/Rocco|Englisch/.test(t), `HILFE: «${t.slice(0, 50)}…» – Rocco oder Englisch im Französischwagen`));

// --- 2. Bilder ------------------------------------------------------------------
for (const welt of I.WELTEN) {
  const bild = a.szene(welt.id);
  for (const x of welt.woerter) {
    pruefe(bild.includes(`data-ding="${x.id}"`), `Wimmelbild ${welt.id}: kein Ding ${x.id}`);
    pruefe(a.STICKER[x.id], `kein Sticker für ${x.id}`);
  }
}
for (const g of I.GESCHICHTEN) {
  pruefe(a.geschichtsTitelbild(g.id).includes("<svg"), `Geschichte ${g.id}: kein Titelbild`);
  g.bilder.forEach((b, i) => {
    const bild = a.geschichtsBild(g.id, i);
    (b.woerter || []).forEach((id) => pruefe(bild.includes(`data-wort="${id}"`), `Geschichte ${g.id}, Bild ${i + 1}: ${id} ist im Bild nicht antippbar`));
  });
}
{
  // Margot statt Rocco: in rocco(), roccoKopf() und in den Geschichten.
  const margot = a.margot("steh", "froh");
  pruefe(a.rocco("steh", "froh") === margot && w.LernappEnglischArt.rocco("steh", "froh") === margot, "rocco() zeichnet im Französischwagen nicht Margot");
  pruefe(w.LernappEnglischArt.roccoKopf("froh") === a.margotKopf("froh"), "roccoKopf() zeichnet im Französischwagen nicht Margots Kopf");
  pruefe(a.geschichtsBild("ball", 0, { gezeichnet: true }).includes(a.margotKopf("froh")), "die Geschichte vom Ball zeigt nicht Margot");
  // Die Kleider des Englischwagens: der Kopf an derselben Stelle (ohne Béret ersetzbar).
  pruefe(margot.includes(a.margotKopf("froh")), "Margots Kopf steckt nicht in ihrer ganzen Zeichnung (ohneMuetze geht nicht)");
  pruefe(a.margotKopf("froh", { muetze: false }) !== a.margotKopf("froh"), "Margots Béret lässt sich nicht abnehmen");
  ["froh", "freude", "hoch", "traurig"].forEach((l) => ["steh", "wirf", "wink", "jubel"].forEach((p) => pruefe(a.margot(p, l).length > 500, `Margot ${p}/${l}: keine Zeichnung`)));
  w.LernappSprachwagen.aktiv = null;
  pruefe(w.LernappEnglischArt.rocco("steh", "froh") !== margot, "rocco() zeichnet auch im Englischwagen Margot");
  w.LernappSprachwagen.aktiv = { id: "franzoesisch", maskottchen: a.MASKOTTCHEN, art: () => a, inhalt: () => I, gemalt: () => w.LernappFranzoesischGemalt };
}
const zimmer = a.zimmer({ ausbau: 15, neuAb: 15, karte: { titel: "La ferme", bild: "" }, aufnaeher: s.aufnaeher(), jukebox: true, telefon: true });
["tuer", "regal", "buch", "rocco", "karte", "kiste", "jukebox", "ausguck", "aufnaeher", "telefon"].forEach((ort) => pruefe(zimmer.includes(`data-ort="${ort}"`), `Bistrowagen: kein Weg ${ort}`));
I.EINRICHTUNG.forEach((d) => pruefe(zimmer.includes(`data-ausbau="${d.id}"`), `Bistrowagen: Einrichtung ${d.id} ist nicht gezeichnet`));
pruefe(!a.zimmer({ ausbau: 0, neuAb: 0, karte: null, aufnaeher: [] }).includes("data-ausbau="), "Bistrowagen: ohne Runden steht schon Einrichtung da");
pruefe(zimmer.includes(a.margot("steh", "froh")) && !/LOOKOUT|PATCHES|I have an idea/.test(zimmer), "Bistrowagen: nicht Margot, oder Englisch an der Wand");
{
  // Für jede Runde ein neues Stück, keines an zwei Stellen.
  for (let n = 1; n <= 15; n += 1) {
    const z = a.zimmer({ ausbau: n, neuAb: n - 1, karte: null, aufnaeher: [] });
    const da = new Set([...z.matchAll(/data-ausbau="([^"]+)"/g)].map((m) => m[1]));
    pruefe(da.size === n && da.has(I.EINRICHTUNG[n - 1].id), `Bistrowagen: nach Schritt ${n} stehen ${da.size} Stücke da (${[...da]})`);
  }
}

// --- 3. Spiele, Verse, Bücher ---------------------------------------------------------
(I.SPIELE || []).forEach((spiel) => {
  pruefe(spiel.id === "hearfind" || typeof sp?.[spiel.id] === "function", `Spiel ${spiel.id}: keine Funktion in englisch-spiele*.js`);
  pruefe(sp?.spielBild?.(spiel.id)?.includes("<svg"), `Spiel ${spiel.id}: kein Bild für den Spielkorb`);
  pruefe((I.SPIEL_GRUPPEN || []).some((g) => g.id === spiel.gruppe), `Spiel ${spiel.id}: ohne Gruppe`);
});
(I.TELEFON_SPIELE || []).forEach((spiel) => pruefe(typeof sp?.[spiel.id] === "function", `Spiel ${spiel.id}: keine Funktion`));
pruefe(!I.SPIELE.some((x) => x.id === "diner") && !I.POSTKARTEN, "Diner oder Post im Französischwagen – sie haben noch keine französischen Bilder");
pruefe(I.FARBEN?.length === 10 && I.ZAHLEN?.length === 10, "Farben oder Zahlen fehlen");
pruefe(I.FARBEN.map((f) => f.id).join() === E.FARBEN.map((f) => f.id).join(), "die Farben haben andere Ids als im Englischwagen");
(I.ESSEN || []).forEach((e) => pruefe(ids.has(e.id) && a.DING[e.id], `Le goûter : ${e.id} ist kein gezeichnetes Wort`));
(I.ZAEHLDINGE || []).forEach((d) => pruefe(["star", "balloon"].includes(d.id) || a.DING[d.id], `Compte : ${d.id} ist nicht gezeichnet`));
(I.KLEIDER || []).forEach((x) => pruefe(s.wortVon(x.id) && a.ROCCO_KLEIDER?.[x.id], `Habille Margot : ${x.id} lässt sich nicht anziehen`));
(I.TELEFON || []).forEach((t) => { if (t.art === "tier") t.antworten.forEach((x) => pruefe(a.STICKER[x.id], `Telefon: kein Sticker für ${x.id}`)); });
for (const x of I.WO_KATZE) pruefe(a.WO_KATZE?.(x.wo, x.ding)?.length > 100, `Où est le chat ? : kein Bild für ${x.wo} ${x.ding}`);
for (const g of I.GEGENTEILE) g.paar.forEach((id) => pruefe(a.GEGENTEILE?.[id]?.().length > 50, `Les contraires : kein Bild für ${id}`));
I.WELTEN.forEach((x) => pruefe(I.AUFTRAEGE?.[x.id], `Aufträge für die Familie: nichts für ${x.id}`));
(I.VERSE || []).forEach((v) => {
  pruefe(v.zeilen.length >= 4 && v.titel?.length === 2, `Vers ${v.id}: zu kurz oder ohne Titel`);
  v.zeilen.forEach((z, i) => (z.bild || []).forEach((b) => pruefe(["rocco", "star", "balloon"].includes(b) || a.DING[b], `Vers ${v.id}, Zeile ${i + 1}: kein Bild ${b}`)));
});
{
  const fenster = {};
  vm.runInContext(lies("lesen-buecher.js"), vm.createContext({ window: fenster }), { filename: "lesen-buecher.js" });
  const lese = fenster.LernappLeseBuecher?.BY_ID || {};
  (I.BUECHER || []).forEach((b) => pruefe(lese[b.id]?.seiten.length === b.seiten.length, `Buch ${b.id}: ${b.seiten.length} französische Seiten, im Lesewagen ${lese[b.id]?.seiten.length}`));
}
{
  const gesagt = new Set(PAARE.map((p) => p.en));
  for (const f of I.FARBEN) for (const g of [null, "big", "small"]) pruefe(gesagt.has(I.tippeBallon(f, g)[0]), `fehlt in paare(): ${I.tippeBallon(f, g)[0]}`);
  for (const x of I.WELTEN.flatMap((y) => y.woerter)) pruefe(gesagt.has(I.istDas(x)[0]), `fehlt in paare(): ${I.istDas(x)[0]}`);
  for (const d of I.ZAEHLDINGE) for (let n = 1; n <= 10; n += 1) pruefe(gesagt.has(I.soViele(d, n)[0]), `fehlt in paare(): ${I.soViele(d, n)[0]}`);
  pruefe(I.wieViele(I.ZAEHLDINGE.find((d) => d.id === "bird"))[0] === "Combien d'oiseaux ?", "Combien d'… vor einem Vokal");
  pruefe(I.lesewort(I.WELTEN[0].woerter.find((x) => x.id === "tree")) === "l'arbre", "die Wortbild-Memory zeigt das Wort nicht mit Artikel");
  pruefe(I.schrift("Où est la vache ?") === 'Où est <span class="fr-la">la</span> vache ?', "die Schrift färbt den Artikel nicht oder bricht vor «?» um");
}

// --- 4. Stand --------------------------------------------------------------------
pruefe(s.KEY === "lernapp.franzoesisch" && s.ELTERN_KEY === "lernapp.franzoesisch.eltern", "der Französischwagen schreibt nicht in seinen eigenen Kasten");
pruefe(w.LernappEnglischStand.KEY === "lernapp.englisch", "der Englischwagen hat seinen Kasten verloren");
pruefe(s.wortVon("cow")?.en === "Une vache." && w.LernappEnglischStand.wortVon("cow")?.en === "A cow.", "die Stände kennen nicht ihre eigenen Wörter");
s.gehoert("cow");
pruefe(s.wortStand("cow") === "gehoert" && w.LernappEnglischStand.wortStand("cow") === "zu", "ein Wort im Französischwagen zählt auch im Englischwagen");
{
  const b = s.bericht(s.stand());
  pruefe(b.von === I.WELTEN.reduce((n, x) => n + x.woerter.length, 0) && b.gehoert === 1, "Bericht: die Wörter stimmen nicht");
  pruefe(Array.isArray(b.usUk), "Bericht: die Schweizer Wörter fehlen");
}

// --- 5. Stimme -------------------------------------------------------------------
{
  const da = fr.verzeichnis();
  pruefe(da, "franzoesisch-stimme.js fehlt oder lässt sich nicht lesen");
  const texte = await fr.franzoesischTexte();
  const ohne = texte.filter((t) => !da?.[t.text]);
  pruefe(!ohne.length, `${ohne.length} französische Texte ohne Aufnahme, z. B. ${ohne.slice(0, 3).map((t) => `«${t.text}»`).join(", ")} – node scripts/stimme-google.mjs vertonen --bereich franzoesisch`);
  for (const t of texte) {
    const datei = da?.[t.text];
    if (!datei) continue;
    pruefe(datei.startsWith(`${fr.ORDNER}/`), `«${t.text}»: Aufnahme nicht in ${fr.ORDNER}/`);
    const voll = path.join(root, datei);
    if (!fs.existsSync(voll)) { fehler.push(`«${t.text}»: ${datei} fehlt`); continue; }
    const sekunden = sekundenVon(fs.readFileSync(voll));
    pruefe(passtZumText(sekunden, t.text), `«${t.text}»: ${sekunden.toFixed(2)} s passen nicht zum Text`);
  }
  const gesagt = new Set(texte.map((t) => t.text));
  const fremd = Object.keys(da || {}).filter((t) => !gesagt.has(t));
  pruefe(!fremd.length, `${fremd.length} Aufnahmen in franzoesisch-stimme.js, die niemand sagt, z. B. «${fremd[0]}» – node scripts/stimme-google.mjs aufraeumen --bereich franzoesisch`);
  const ordner = path.join(root, fr.ORDNER);
  const belegt = new Set(Object.values(da || {}));
  const lose = fs.existsSync(ordner) ? fs.readdirSync(ordner).filter((n) => !belegt.has(`${fr.ORDNER}/${n}`)) : [];
  pruefe(!lose.length, `${lose.length} lose Dateien in ${fr.ORDNER}/`);
  const appDa = app.verzeichnis() || {};
  const deutsch = [...PAARE.map((p) => p.de), ...Object.values(I.HILFE)];
  const deOhne = deutsch.filter((text) => !appDa[sprechText(text)] && !saetzeVon(sprechText(text)).every((satz) => appDa[satz]));
  pruefe(!deOhne.length, `${deOhne.length} deutsche Texte der Französischecke ohne Aufnahme, z. B. «${deOhne[0]}» – node scripts/stimme-google.mjs vertonen --bereich app`);
}

// --- 6. Gemälde ------------------------------------------------------------------
{
  const G = w.LernappFranzoesischGemalt || {};
  pruefe(G.ordner === "bilder/franzoesisch", "franzoesisch-gemalt.js: die Gemälde liegen nicht in bilder/franzoesisch/");
  const da = (name) => fs.existsSync(path.join(root, "bilder/franzoesisch", `${name}.webp`));
  const imBild = (r) => Array.isArray(r) && r.every(Number.isFinite) && r[2] > 4 && r[3] > 4 && r[0] >= -1 && r[1] >= -1 && r[0] + r[2] <= 473 && r[1] + r[3] <= 205;
  for (const g of I.GESCHICHTEN) {
    const bilder = G.geschichten?.[g.id];
    pruefe(bilder && bilder.length === g.bilder.length, `Geschichte ${g.id}: nicht mit Margot gemalt (franzoesisch-gemalt.js)`);
    if (!bilder) continue;
    pruefe(da(`geschichte-${g.id}-${(a.TITELBILD[g.id] ?? 0) + 1}-klein`), `Geschichte ${g.id}: kein kleines Titelbild`);
    bilder.forEach((b, i) => {
      pruefe(da(`geschichte-${g.id}-${i + 1}`), `Geschichte ${g.id}, Bild ${i + 1}: bilder/franzoesisch/geschichte-${g.id}-${i + 1}.webp fehlt`);
      const gezeichnet = [...new Set([...a.geschichtsBild(g.id, i, { gezeichnet: true }).matchAll(/data-wort="([^"]+)"/g)].map((m) => m[1]))].sort();
      pruefe(gezeichnet.join() === Object.keys(b.woerter || {}).sort().join(), `Geschichte ${g.id}, Bild ${i + 1}: im Gemälde lässt sich anderes antippen als in der Zeichnung`);
      Object.entries(b.woerter || {}).forEach(([wort, rr]) => rr.forEach((r) => pruefe(imBild(r), `Geschichte ${g.id}, Bild ${i + 1}, ${wort}: der Rahmen liegt nicht im Bild`)));
      pruefe(a.geschichtsBild(g.id, i).includes(`bilder/franzoesisch/geschichte-${g.id}-${i + 1}.webp`), `Geschichte ${g.id}, Bild ${i + 1}: zeigt nicht Margots Gemälde`);
    });
  }
  const st = a.sticker("raccoon", 0, 0, 30, "gehoert");
  pruefe(fs.existsSync(path.join(root, a.MASKOTTCHEN.sticker.raccoon)) && st.includes(a.MASKOTTCHEN.sticker.raccoon), "Margot hat keinen gemalten Sticker im Wörterbuch");
  pruefe(a.sticker("cow", 0, 0, 30, "gehoert").includes("bilder/englisch/sticker/cow.webp"), "die übrigen Sticker kommen nicht aus dem Englischwagen");
}

// --- 7. Einbau -------------------------------------------------------------------
{
  const index = lies("index.html");
  const sw = lies("service-worker.js");
  const reihe = ["englisch-inhalt.js", "englisch-stand.js", "englisch-art.js", "englisch-gemalt.js", "englisch-spiele-4.js", "franzoesisch-inhalt.js", "franzoesisch-stand.js", "franzoesisch-art.js", "franzoesisch-gemalt.js", "franzoesisch-stimme.js", "sprachwagen.js", "train-englischecke.js", "train-franzoesischecke.js", "train-home.js"];
  const stellen = reihe.map((d) => index.indexOf(`src="${d}`));
  stellen.forEach((st, i) => pruefe(st > 0, `index.html lädt ${reihe[i]} nicht`));
  pruefe(stellen.every((st, i) => i === 0 || st > stellen[i - 1]), `index.html lädt die Französischecke nicht in der Reihenfolge ${reihe.join(" → ")}`);
  reihe.filter((d) => /franzoesisch/.test(d)).forEach((d) => pruefe(sw.includes(`./${d}`), `service-worker.js hält ${d} nicht vor`));
  pruefe(sw.includes('"/bilder/franzoesisch/"'), "service-worker.js legt Margots Gemälde nicht in den Cache der Buchbilder");
  const ent = lies("entitlement.js");
  const tor = lies("train-franzoesischecke.js");
  const gemeldet = [...(/const SPIEL = \{([\s\S]*?)\};/.exec(tor)?.[1] || "").matchAll(/"(fr-[a-z]+)"/g)].map((m) => m[1]);
  pruefe(gemeldet.length >= 20, `train-franzoesischecke.js meldet nur ${gemeldet.length} Spiele`);
  gemeldet.forEach((id) => pruefe(ent.includes(`"${id}"`), `entitlement.js kennt das Spiel ${id} nicht`));
  pruefe(/FRANZOESISCHECKE\]/.test(ent), "entitlement.js zählt die Französischecke nicht zu den Bereichen");
  pruefe(lies("firebase.js").includes('"lernapp.franzoesisch.eltern"'), "firebase.js behält die Einstellung der Eltern beim Zurücksetzen nicht");
  pruefe(/\bfr: \{ dateien: \(\) => window\.LernappFranzoesischDateien/.test(lies("kids.js")), "kids.js spricht kein Französisch");
  pruefe(/"franzoesisch"/.test(lies("train-home.js")) && /franzoesischwagen-knopf/.test(lies("train-home.js")), "train-home.js hängt den Französischwagen nicht an den Lernzug");
  pruefe(/franzoesisch: \{ name: "Französischwagen"/.test(lies("lernzug-art.js")), "lernzug-art.js zeichnet den Französischwagen nicht");
}

// --- 8. Sprache ------------------------------------------------------------------
for (const datei of ["franzoesisch-inhalt.js", "franzoesisch-stand.js", "franzoesisch-art.js", "franzoesisch-gemalt.js", "train-franzoesischecke.js", "docs/FRANZOESISCHECKE-KONZEPT.md"]) {
  pruefe(!lies(datei).includes("ß"), `${datei}: scharfes S`);
}

if (fehler.length) {
  console.error(`Die Französischecke stimmt nicht (${fehler.length}):\n${fehler.slice(0, 80).map((f) => `  - ${f}`).join("\n")}${fehler.length > 80 ? `\n  … und ${fehler.length - 80} weitere` : ""}`);
  process.exit(1);
}
console.log(`Die Französischecke stimmt: ${I.WELTEN.length} Welten, ${alleWoerter.length} Wörter, ${I.GESCHICHTEN.length} Geschichten, ${(await fr.franzoesischTexte()).length} französische Aufnahmen.`);
