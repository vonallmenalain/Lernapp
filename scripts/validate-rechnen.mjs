/*
 * Stimmt die Rechenecke – ohne Browser?
 * ---------------------------------------------------------------------------
 *   Katalog      Jedes Spiel in rechnen-stand.js (SPIELE) hat seine Seite, die
 *                Seite lädt, was sie braucht, in der richtigen Reihenfolge
 *                (Schranke vor der Bühne), trägt die richtige data-page, und
 *                ein Spiele-Paket meldet genau dieses Spiel an.
 *   Schranke     entitlement.js kennt dieselben Spiele (RECHENECKE) – sonst
 *                wäre eines unbegrenzt frei oder gar nicht zu öffnen.
 *   Vorrat       Der Service Worker hält alle Seiten und Dateien vor, die
 *                Startseite lädt Stand, Zeichnungen und Zimmer vor train-home.js.
 *   Stand        Zusammenführen ist in beide Richtungen gleich und zählt nichts
 *                doppelt; Taler und Drache (drei Leben zu je 15 Stufen, fünf
 *                Taler je Zacke); Mitwachsen; Aufgaben, die sitzen;
 *                Fehlerbilder; der Bericht; die Einstellungen der Eltern; was
 *                der Drache vorschlägt.
 *   Sprache      kein scharfes S in den Dateien der Rechenecke.
 *
 * Aufruf:  node scripts/validate-rechnen.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const fehler = [];
const pruefe = (bedingung, meldung) => { if (!bedingung) fehler.push(meldung); };
const lies = (name) => fs.readFileSync(path.join(root, name), "utf8");

// --- Sandbox -----------------------------------------------------------------
function sandbox({ stufe = "mittel", eltern = null } = {}) {
  const store = new Map();
  if (eltern) store.set("lernapp.rechnen.eltern", JSON.stringify(eltern));
  const windowStub = {
    LernappReise: { stufe: () => stufe },
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
  };
  const context = vm.createContext({
    window: windowStub,
    document: { addEventListener() {}, dispatchEvent() { return true; } },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    Date, Math, JSON, Number, String, Set, Map, Object, Array,
  });
  vm.runInContext(lies("rechnen-stand.js"), context, { filename: "rechnen-stand.js" });
  return { s: windowStub.LernappRechenStand, store };
}

// --- 1. Katalog, Seiten, Schranke, Vorrat -------------------------------------
const { s } = sandbox();
pruefe(s && s.SPIELE, "rechnen-stand.js meldet sich nicht an (window.LernappRechenStand)");
const spiele = Object.entries(s?.SPIELE || {});
pruefe(spiele.length >= 6, "der Katalog der Rechenecke hat weniger als sechs Spiele");

const pakete = fs.readdirSync(root).filter((n) => /^rechnen-spiele-\d+\.js$/.test(n));
pruefe(pakete.length >= 1, "kein Spiele-Paket (rechnen-spiele-1.js …)");
const paketText = Object.fromEntries(pakete.map((n) => [n, lies(n)]));
const ORTE = ["gleis", "tunnel", "fenster", "perron", "wuerfel", "zahlenhaus", "teppich", "zaehlrahmen", "kiosk", "kiste", "waage", "uhr"];

const entitlement = lies("entitlement.js");
const rechenecke = (entitlement.match(/const RECHENECKE = \{[\s\S]*?\] \};/) || [""])[0];
const gesperrt = [...rechenecke.matchAll(/\{ id: "([a-z0-9]+)", page: "([a-z0-9]+\.html)" \}/g)].map((m) => ({ id: m[1], page: m[2] }));
pruefe(gesperrt.length > 0, "entitlement.js: RECHENECKE fehlt");
pruefe(/\[\.\.\.AREAS, LESEECKE, RECHENECKE\]/.test(entitlement), "entitlement.js: gameEntry sucht nicht in RECHENECKE");

const sw = lies("service-worker.js");
const index = lies("index.html");
for (const [id, spiel] of spiele) {
  pruefe(spiel.page === `${id}.html`, `${id}: die Seite heisst nicht ${id}.html`);
  pruefe(ORTE.includes(spiel.ort), `${id}: unbekannter Ort «${spiel.ort}» – im Rechenwagen gibt es ihn nicht`);
  pruefe(spiel.titel && spiel.bild, `${id}: Titel oder Bild fehlt`);
  pruefe(gesperrt.some((g) => g.id === id && g.page === spiel.page), `entitlement.js: RECHENECKE kennt ${spiel.page} nicht – das Spiel wäre unbegrenzt frei`);
  const meldet = pakete.filter((n) => paketText[n].includes(`id: "${id}",`));
  pruefe(meldet.length === 1, `${id}: ${meldet.length ? "mehr als ein" : "kein"} Spiele-Paket meldet das Spiel an`);
  pruefe(sw.includes(`"./${spiel.page}",`), `service-worker.js: ${spiel.page} fehlt in CORE_ASSETS`);
  const datei = path.join(root, spiel.page);
  if (!fs.existsSync(datei)) { fehler.push(`${spiel.page}: Seite fehlt`); continue; }
  const html = lies(spiel.page);
  pruefe(html.includes(`<body data-page="${id}">`), `${spiel.page}: data-page ist nicht ${id}`);
  pruefe(html.includes('id="rechen-stage"'), `${spiel.page}: die Bühne #rechen-stage fehlt`);
  const reihe = ["entitlement.js", "kids.js", "game-cloud.js", "journey-plan.js", "rechnen-stand.js", "rechnen-art.js", "game-shell.js", "rechnen-spiel.js", meldet[0] || "rechnen-spiele-1.js"];
  let vorher = -1;
  for (const datei2 of reihe) {
    const stelle = html.indexOf(`src="${datei2}?v=`);
    pruefe(stelle >= 0, `${spiel.page}: lädt ${datei2} nicht`);
    pruefe(stelle > vorher, `${spiel.page}: ${datei2} steht an der falschen Stelle`);
    vorher = Math.max(vorher, stelle);
  }
  pruefe(html.includes('href="rechnen.css?v='), `${spiel.page}: rechnen.css fehlt`);
}
gesperrt.forEach((g) => pruefe(s?.SPIELE?.[g.id], `entitlement.js: ${g.page} steht in RECHENECKE, aber nicht im Katalog`));
for (const datei of ["rechnen.css", "rechnen-stand.js", "rechnen-art.js", "rechnen-spiel.js", "train-rechenecke.js", ...pakete]) {
  pruefe(sw.includes(`\`./${datei}\${ASSET_VERSION_QUERY}\``), `service-worker.js: ${datei} fehlt in CORE_ASSETS`);
}
const vor = (a, b) => { const x = index.indexOf(`src="${a}?v=`); const y = index.indexOf(`src="${b}?v=`); return x >= 0 && y >= 0 && x < y; };
for (const datei of ["rechnen-stand.js", "rechnen-art.js", "train-rechenecke.js"]) pruefe(vor(datei, "train-home.js"), `index.html: ${datei} fehlt oder steht nach train-home.js`);
pruefe(index.includes('href="rechnen.css?v='), "index.html: rechnen.css fehlt");
// Alle Seiten auf derselben Fassung wie der Service Worker.
const version = (sw.match(/const APP_VERSION = "([^"]+)"/) || [])[1];
for (const [, spiel] of spiele) {
  if (!fs.existsSync(path.join(root, spiel.page))) continue;
  const html = lies(spiel.page);
  const fremd = [...html.matchAll(/\?v=([0-9-]+)"/g)].map((m) => m[1]).filter((v) => v !== version);
  pruefe(!fremd.length, `${spiel.page}: Dateiversion ${fremd[0]} statt ${version}`);
}

// --- 2. Der Stand ---------------------------------------------------------------
{
  const a = { spiele: { kuppelplus: { runden: 3, best: 5, sterne: 7, zuletzt: 10, schritt: 1, serie: 0 } }, aufgaben: { "3+2": { r: 2, f: 1, s: 2, tage: ["2026-11-01"], zuletzt: 5 } }, fehler: { eins: 2 }, bonus: 3, drache: { name: "Zacki", at: 1 } };
  const b = { spiele: { kuppelplus: { runden: 2, best: 6, sterne: 5, zuletzt: 20, schritt: 0, serie: 1 }, blitzblick: { runden: 1, best: 4, sterne: 2, zuletzt: 3 } }, aufgaben: { "3+2": { r: 3, f: 0, s: 1, tage: ["2026-11-02"], zuletzt: 9 } }, fehler: { eins: 1, art: 1 }, bonus: 1, drache: { name: "Funki", at: 2 } };
  const ab = JSON.stringify(s.merge(a, b));
  const ba = JSON.stringify(s.merge(b, a));
  pruefe(ab === ba, "merge: in beide Richtungen nicht gleich");
  const zweimal = JSON.stringify(s.merge(s.merge(a, b), b));
  pruefe(zweimal === ab, "merge: derselbe Stand zweimal zählt doppelt");
  const m = s.merge(a, b);
  pruefe(m.spiele.kuppelplus.sterne === 7 && m.spiele.kuppelplus.runden === 3, "merge: Sterne oder Runden nicht als Maximum");
  pruefe(m.spiele.kuppelplus.schritt === 0 && m.spiele.kuppelplus.serie === 1, "merge: das Mitwachsen kommt nicht vom Gerät, das zuletzt gespielt hat");
  pruefe(m.aufgaben["3+2"].tage.length === 2 && m.aufgaben["3+2"].r === 3, "merge: Aufgaben nicht vereint");
  pruefe(m.drache.name === "Funki", "merge: die neuere Taufe gilt nicht");
  pruefe(s.taler(m) === 7 + 2 + 3, `taler: ${s.taler(m)} statt 12`);
}
{
  const d = s.dracheAus;
  pruefe(d(0).stufe === 1 && d(0).leben === 0 && d(0).braucht === 5, "Drache: am Anfang Stufe 1 mit fünf Talern bis zur nächsten Zacke");
  pruefe(d(4).stufe === 1 && d(4).hat === 4 && d(5).stufe === 2, "Drache: fünf Taler je Zacke");
  pruefe(d(70).stufe === 15 && d(70).braucht === 10 && d(79).hat === 9, "Drache: nach Stufe 15 zehn Taler bis zum nächsten Leben");
  pruefe(d(80).leben === 1 && d(80).stufe === 1 && d(80).regal === 1, "Drache: mit 80 Talern beginnt das zweite Leben");
  pruefe(d(160).leben === 2 && d(160).nr === 31, "Drache: mit 160 Talern beginnt das dritte Leben");
  pruefe(d(240).fertig && d(239).fertig === false && d(999).fertig && d(999).stufe === 15, "Drache: nach dem dritten Leben ist er fertig");
  for (let t = 1; t <= 260; t += 1) pruefe(d(t).nr >= d(t - 1).nr, `Drache: wird bei ${t} Talern kleiner`);
}
{
  const { s: k } = sandbox({ stufe: "mittel" });
  let v = {};
  v = { ...v, ...k.mitwachsen(v, 3) };
  v = { ...v, ...k.mitwachsen(v, 3) };
  pruefe(v.schritt === 1, "Mitwachsen: zwei Runden mit drei Sternen machen es nicht schwerer");
  v = { ...v, ...k.mitwachsen(v, 3) }; v = { ...v, ...k.mitwachsen(v, 3) };
  pruefe(v.schritt === 1, "Mitwachsen: über «schwer» hinaus");
  v = { ...v, ...k.mitwachsen(v, 1) }; v = { ...v, ...k.mitwachsen(v, 1) };
  pruefe(v.schritt === 0, "Mitwachsen: zwei schwache Runden machen es nicht leichter");
  k.spielRunde("kuppelplus", { punkte: 6, sterne: 3 });
  k.spielRunde("kuppelplus", { punkte: 6, sterne: 3 });
  pruefe(k.stufe("kuppelplus") === "schwer", "Mitwachsen: das Spiel spielt nicht eine Stufe höher");
  pruefe(k.taler() === 6 && k.runden() === 2, "spielRunde: Taler oder Runden falsch gezählt");
  // Mission: doppelt Taler, nur einmal je Tipp.
  k.missionStarten("blitzblick");
  pruefe(k.missionErfuellt("kuppelplus", 3) === 0, "Mission: ein anderes Spiel gilt als Mission");
  pruefe(k.missionErfuellt("blitzblick", 2) === 2, "Mission: der Vorschlag bringt nicht die Taler noch einmal");
  pruefe(k.missionErfuellt("blitzblick", 2) === 0, "Mission: gilt zweimal");
  pruefe(k.taler() === 8, `Mission: ${k.taler()} Taler statt 8`);
  // Aufgaben: sitzt nach drei schnellen Treffern an zwei Tagen.
  k.aufgabeGeuebt("3+2", true, 1000);
  k.aufgabeGeuebt("3+2", true, 1000);
  k.aufgabeGeuebt("3+2", true, 9000);
  pruefe(!k.sitzt(k.stand().aufgaben["3+2"]), "Aufgabe: sitzt nach zwei schnellen Treffern");
  const e = k.stand().aufgaben["3+2"];
  pruefe(e.r === 3 && e.s === 2 && e.tage.length === 1, "Aufgabe: falsch gezählt");
  pruefe(k.sitzt({ r: 3, s: 3, f: 0, tage: ["2026-11-01", "2026-11-02"] }), "Aufgabe: sitzt nicht nach drei schnellen Treffern an zwei Tagen");
  k.aufgabeGeuebt("25+3", true, 500);
  pruefe(!k.stand().aufgaben["25+3"], "Aufgabe: Zahlen über zwanzig landen in der Plus-Tafel");
  pruefe(k.aufgabeKey(3, "-", 1) === "3-1" && k.aufgabeKey(3, "+", 1) === "3+1", "aufgabeKey: falsch");
  // Fehlerbilder
  pruefe(k.fehlerVon({ a: 3, b: 2, op: "+", richtig: 5, antwort: 4 }) === "eins", "Fehlerbild: eins daneben nicht erkannt");
  pruefe(k.fehlerVon({ a: 6, b: 2, op: "-", richtig: 4, antwort: 8 }) === "art", "Fehlerbild: Plus statt Minus nicht erkannt");
  pruefe(k.fehlerVon({ a: 9, b: 3, op: "+", richtig: 12, antwort: 21 }) === "dreher", "Fehlerbild: Zahlendreher nicht erkannt");
  pruefe(k.fehlerVon({ a: 3, b: 2, op: "+", richtig: 5, antwort: 5 }) === null, "Fehlerbild: eine richtige Antwort ist ein Fehler");
  k.fehlerbild("eins"); k.fehlerbild("gibtsnicht");
  pruefe(k.stand().fehler.eins === 1 && !("gibtsnicht" in k.stand().fehler), "Fehlerbild: falsch gezählt");
  // Bericht
  const b = k.bericht();
  pruefe(b.tafel.length === 11 && b.tafel.every((r) => r.length === 11), "Bericht: die Plus-Tafel ist nicht 11 × 11");
  pruefe(b.tafel[3][2] === "geuebt", "Bericht: geübte Aufgabe nicht auf der Tafel");
  pruefe(b.runden === 2 && b.taler === 8 && b.lieblinge[0] === "Kuppel-Plus", "Bericht: Zahlen falsch");
  // Taufe
  k.dracheTaufen("  zacki  der 2. ");
  pruefe(k.dracheName() === "Zacki Der", `Taufe: «${k.dracheName()}» statt «Zacki Der»`);
}
{
  // Einstellungen der Eltern
  const { s: a } = sandbox({ stufe: "leicht" });
  pruefe(a.sprosse() === "plus" && a.deckel() === 100 && a.minusErlaubt(), "Einstellungen: ohne Eltern nicht nach der Stufe");
  const { s: b } = sandbox({ stufe: "leicht", eltern: { beginn: "mengen", zahlenraum: 5, minus: "aus", at: 1 } });
  pruefe(b.sprosse() === "mengen" && b.deckel() === 5 && !b.minusErlaubt(), "Einstellungen: die der Eltern gelten nicht");
  const { s: c } = sandbox({ eltern: { beginn: "quatsch", zahlenraum: 7, minus: "vielleicht" } });
  pruefe(c.sprosse() === "plusminus" && c.deckel() === 100 && c.minusErlaubt(), "Einstellungen: Unsinn wird nicht verworfen");
  for (const sprosse of a.SPROSSEN) {
    pruefe(Array.isArray(a.AUSWAHL[sprosse]) && a.AUSWAHL[sprosse].every((id) => a.SPIELE[id]), `AUSWAHL: ${sprosse} schlägt ein Spiel vor, das es nicht gibt`);
    pruefe(a.SPROSSE_INFO[sprosse]?.titel, `SPROSSE_INFO: ${sprosse} fehlt`);
  }
  // Vorschlag: was am längsten ruht.
  const { s: v } = sandbox({ stufe: "leicht" });
  const liste = v.AUSWAHL.plus;
  liste.forEach((id, i) => { if (i) v.spielGeoeffnet(id); });
  pruefe(v.naechstes().id === liste[0], "Vorschlag: nicht das Spiel, das am längsten ruht");
}

// --- 3. Sprache -------------------------------------------------------------------
for (const datei of ["rechnen-stand.js", "rechnen-art.js", "rechnen-spiel.js", "train-rechenecke.js", "rechnen.css", ...pakete, ...spiele.map(([, sp]) => sp.page)]) {
  if (!fs.existsSync(path.join(root, datei))) continue;
  pruefe(!lies(datei).includes("ß"), `${datei}: scharfes S`);
}

if (fehler.length) {
  console.error(`Rechenecke: ${fehler.length} Fehler`);
  fehler.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`Rechenecke: ${spiele.length} Spiele, Schranke, Seiten, Vorrat und Stand stimmen.`);
