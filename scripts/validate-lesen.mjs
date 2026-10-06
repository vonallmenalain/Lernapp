/*
 * Stimmt, was die Leseecke zu lesen gibt?
 * ---------------------------------------------------------------------------
 * Die Leseecke lebt von ihren Listen: Laute, Wörter, Bücher. Ein Fehler darin
 * fällt beim Spielen kaum auf – ein Wort mit einem Laut, den das Kind noch
 * nicht kennt, eine Frage, deren Antwort nicht im Buch steht, ein ß in einer
 * Schweizer App. Deshalb rechnet diese Prüfung alles nach:
 *
 *   Laute       eindeutig, gross und klein passen, das Anlautwort beginnt
 *               mit dem Laut (oder enthält ihn, wo er nur innen vorkommt),
 *               und gesprochen wird ein Laut nur, wenn die Sprachausgabe ihn
 *               kann: Selbstlaute und Zwielaute, nie ein einzelner Mitlaut.
 *   Wörter      die Silben ergeben das Wort, jedes hat ein Bild, und die
 *               Kuppel-Wörter brauchen nur Laute ihrer Gruppe: auf Stufe 1
 *               nur Dauer- und Selbstlaute, auf Stufe 2 dazu die Stopplaute.
 *   Bücher      Stufe, Figur und Landschaft gibt es; jede Seite hat Text und
 *               ein Bild; die erste Lesestufe ist lautgetreu (keine Laute aus
 *               den Gruppen 5 und 6), kurz und hat höchstens zwei Sätze je
 *               Seite; jede Frage hat eine richtige Antwort, die auf der
 *               genannten Seite steht (bei Hörbüchern und ersten Sätzen
 *               wörtlich); Hörbücher fragen nur mit Bildern; die freien Bücher
 *               sind dieselben wie in der Schranke.
 *   Lesestand   Zusammenführen ist das Maximum, in beide Richtungen gleich;
 *               ein Laut sitzt erst nach drei Treffern an zwei Tagen; der
 *               Lesewurm wächst je zwanzig Wörter; die Eltern-Einstellung
 *               fällt bei Unsinn auf «auto» zurück.
 *   Seiten      Jedes Spiel hat seine Seite, und sie lädt, was es braucht,
 *               in der richtigen Reihenfolge. Nirgends steht ß.
 *
 * Läuft ohne Browser: die Skripte laufen in einer Sandbox. Was nur im Browser
 * geht – Bild und Ablauf –, prüft check-leseecke.mjs.
 *
 * Aufruf:  node scripts/validate-lesen.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const fehler = [];
function pruefe(bedingung, meldung) { if (!bedingung) fehler.push(meldung); }
const lies = (name) => fs.readFileSync(path.join(root, name), "utf8");

// --- Sandbox ----------------------------------------------------------------
function sandbox() {
  const store = new Map();
  const windowStub = { addEventListener() {}, location: { search: "", pathname: "/index.html" } };
  const context = vm.createContext({
    window: windowStub,
    document: { addEventListener() {}, dispatchEvent() { return true; }, querySelector: () => null, body: { dataset: {} } },
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    },
    CustomEvent: class { constructor(type, init = {}) { this.type = type; this.detail = init.detail ?? null; } },
    console,
    Date,
  });
  return { context, windowStub, store };
}

function lade(...dateien) {
  const box = sandbox();
  dateien.forEach((datei) => vm.runInContext(lies(datei), box.context, { filename: datei }));
  return box;
}

const { windowStub: w } = lade("lesen-inhalte.js", "lesen-buecher.js");
const inhalte = w.LernappLeseInhalte;
const bib = w.LernappLeseBuecher;
pruefe(inhalte && bib, "lesen-inhalte.js oder lesen-buecher.js legen nichts an");

// Die Figuren und Landschaften, die es gibt – aus den Quellen gelesen.
const FIGUREN = new Set([...(lies("train-art.js").match(/const DRIVERS = \[[\s\S]*?\n {2}\];/)?.[0] || "").matchAll(/\{ id: "([a-z]+)"/g)].map((m) => m[1]));
const LANDSCHAFTEN = new Set([...lies("train-scenes.js").matchAll(/^ {6}id: "([a-z]+)",$/gm)].map((m) => m[1]));
pruefe(FIGUREN.size >= 10 && FIGUREN.has("fox"), `train-art.js: die Figuren wurden nicht gefunden (${[...FIGUREN].join(", ")})`);
pruefe(LANDSCHAFTEN.size >= 6 && LANDSCHAFTEN.has("wiese"), `train-scenes.js: die Landschaften wurden nicht gefunden (${[...LANDSCHAFTEN].join(", ")})`);

// --- 1. Laute -------------------------------------------------------------------
const LAUT = inhalte.LAUT_BY_ID;
{
  const ids = inhalte.LAUTE.map((l) => l.id);
  pruefe(new Set(ids).size === ids.length, "LAUTE: eine Kennung steht doppelt");
  pruefe(ids.length >= 30, `LAUTE: nur ${ids.length} Laute`);
  inhalte.LAUTE.forEach((laut) => {
    const name = `Laut ${laut.id}`;
    pruefe(laut.klein === laut.id && laut.gross.toLowerCase() === laut.id && laut.gross[0] === laut.gross[0].toUpperCase(), `${name}: gross/klein passen nicht zur Kennung`);
    pruefe(["vokal", "dauer", "stopp", "mehr"].includes(laut.art), `${name}: unbekannte Art ${laut.art}`);
    pruefe(Number.isInteger(laut.gruppe) && laut.gruppe >= 1 && laut.gruppe <= 6, `${name}: Gruppe ${laut.gruppe}`);
    pruefe(laut.bild && laut.wort, `${name}: Bild oder Anlautwort fehlt`);
    const wort = laut.wort.toLowerCase();
    if (laut.innen) pruefe(wort.includes(laut.id) && !wort.startsWith(laut.id), `${name}: «${laut.wort}» enthält den Laut nicht innen`);
    else pruefe(inhalte.steine(laut.wort)[0].toLowerCase() === laut.id, `${name}: «${laut.wort}» beginnt nicht mit dem Laut ${laut.id}`);
    // Die Sprachausgabe sagt bei einem einzelnen Mitlaut seinen Namen («Em»).
    if (laut.stimme) pruefe(laut.art === "vokal" || laut.art === "mehr" && /^[aeiouäöü]+$/.test(laut.stimme), `${name}: Die Sprachausgabe soll ihn sprechen, kann aber keinen Mitlaut allein`);
    if (laut.art === "vokal") pruefe(Boolean(laut.stimme), `${name}: ein Selbstlaut ohne Stimme bliebe stumm`);
  });
  // Die Reihenfolge: zuerst die Dauerlaute und Selbstlaute.
  const erste = inhalte.LAUTE.filter((l) => l.gruppe === 1);
  pruefe(erste.every((l) => l.art === "vokal" || l.art === "dauer"), "Gruppe 1: es sind nicht nur Dauer- und Selbstlaute");
  pruefe(inhalte.LAUTE.every((l, i, alle) => i === 0 || alle[i - 1].gruppe <= l.gruppe), "LAUTE: die Gruppen stehen nicht aufsteigend");
}

// Die Gruppe eines Wortes: der späteste Laut darin. null, wenn ein Stein
// keiner der bekannten Laute ist (c, q, x, y, ß …).
function gruppeVon(teile) {
  let hoechste = 0;
  for (const stein of teile) {
    const laut = LAUT[inhalte.lautId(stein)];
    if (!laut) return { gruppe: null, stein };
    hoechste = Math.max(hoechste, laut.gruppe);
  }
  return { gruppe: hoechste, stein: null };
}

// --- 2. Wörter ------------------------------------------------------------------
{
  const doppelt = (liste) => liste.map((w) => w.wort).filter((wort, i, alle) => alle.indexOf(wort) !== i);
  pruefe(doppelt(inhalte.SILBEN_WOERTER).length === 0, `SILBEN_WOERTER doppelt: ${doppelt(inhalte.SILBEN_WOERTER).join(", ")}`);
  pruefe(doppelt(inhalte.KUPPEL_WOERTER).length === 0, `KUPPEL_WOERTER doppelt: ${doppelt(inhalte.KUPPEL_WOERTER).join(", ")}`);
  inhalte.SILBEN_WOERTER.forEach((w) => {
    pruefe(w.silben.join("") === w.wort, `Silbenzug ${w.wort}: die Silben ergeben ${w.silben.join("")}`);
    pruefe(w.silben.length >= 1 && w.silben.length <= 5, `Silbenzug ${w.wort}: ${w.silben.length} Silben`);
    pruefe(Boolean(w.bild), `Silbenzug ${w.wort}: kein Bild`);
  });
  for (const [stufe, [min, max]] of Object.entries(inhalte.SILBEN_JE_STUFE)) {
    const passend = inhalte.SILBEN_WOERTER.filter((w) => w.silben.length >= min && w.silben.length <= max);
    const laengen = new Set(passend.map((w) => w.silben.length));
    pruefe(passend.length >= 12 && laengen.size >= 2, `Silbenzug ${stufe}: nur ${passend.length} Wörter, ${laengen.size} Längen`);
  }
  const ERLAUBT = { 1: ["vokal", "dauer"], 2: ["vokal", "dauer", "stopp"] };
  inhalte.KUPPEL_WOERTER.forEach((w) => {
    const name = `Laute kuppeln ${w.wort}`;
    pruefe(w.silben.join("") === w.wort, `${name}: die Silben ergeben ${w.silben.join("")}`);
    pruefe(Boolean(w.bild), `${name}: kein Bild`);
    pruefe([1, 2, 3].includes(w.stufe), `${name}: Stufe ${w.stufe}`);
    const teile = inhalte.steineDerSilben(w.silben).flat();
    const { gruppe, stein } = gruppeVon(teile);
    pruefe(gruppe !== null, `${name}: «${stein}» ist kein Laut der Leseecke`);
    if (ERLAUBT[w.stufe]) {
      const fremd = teile.filter((t) => !ERLAUBT[w.stufe].includes(LAUT[inhalte.lautId(t)]?.art));
      pruefe(fremd.length === 0, `${name}: Stufe ${w.stufe} erlaubt nur ${ERLAUBT[w.stufe].join(", ")}, aber da ist ${fremd.join(", ")}`);
    }
  });
  // Drei Bilder zur Wahl: Je Stufe braucht es genug Wörter mit verschiedenen
  // Anfangsbuchstaben, sonst findet das Spiel keine zwei anderen.
  for (const [stufe, gruppen] of Object.entries(inhalte.KUPPELN_JE_STUFE)) {
    const liste = inhalte.KUPPEL_WOERTER.filter((w) => gruppen.includes(w.stufe));
    const anfaenge = new Set(liste.map((w) => w.wort[0]));
    pruefe(liste.length >= 8 && anfaenge.size >= 4, `Laute kuppeln ${stufe}: ${liste.length} Wörter, ${anfaenge.size} Anfänge`);
  }
  // Stimmt das?: Tiere und Dinge, aus denen Sätze werden.
  inhalte.TIERE.forEach((t) => {
    pruefe(FIGUREN.has(t.id), `Stimmt das?: das Tier ${t.id} gibt es in train-art.js nicht`);
    pruefe(/^(Der|Die|Das) [A-ZÄÖÜ]/.test(t.der) && t.viele && t.viele[0] === t.viele[0].toUpperCase(), `Stimmt das?: ${t.id} hat keinen sauberen Artikel oder keine Mehrzahl`);
  });
  inhalte.DINGE.forEach((d) => {
    pruefe(/^(dem|der) [A-ZÄÖÜ]/.test(d.dativ), `Stimmt das?: ${d.id} steht nicht im Dativ`);
    pruefe(d.wo.length >= 2 && d.wo.every((wo) => ["auf", "unter", "neben"].includes(wo)), `Stimmt das?: ${d.id} hat unbekannte Stellen`);
    pruefe(new RegExp(`\\b${d.id}: \\{`).test(lies("lesen-art.js")), `Stimmt das?: lesen-art.js zeichnet ${d.id} nicht`);
  });
}

// --- 3. Bücher ------------------------------------------------------------------
const GRATIS_SCHRANKE = (lies("entitlement.js").match(/const GRATIS_BUECHER = \[([^\]]*)\]/)?.[1] || "")
  .split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
const ZEICHNUNGEN = ["fenster", "hoehle"];
// Wörter, die ein Erstleser als Ganzes kennt, auch wenn ein Laut darin später
// kommt. Heute sind alle lautgetreu – die Liste steht hier, damit eine
// Ausnahme bewusst geschieht.
const LERNWOERTER = new Set([]);
const KLEINE_WOERTER = new Set(["der", "die", "das", "ein", "eine", "einen", "einem", "dem", "den", "mit", "auf", "aus", "zu", "sie", "es", "er", "in", "im", "am"]);

function lautgetreu(wort) {
  const sauber = bib.nurWort(wort);
  if (!sauber || LERNWOERTER.has(sauber.toLowerCase())) return true;
  const { gruppe, stein } = gruppeVon(inhalte.steine(sauber));
  if (gruppe === null) return `«${sauber}»: ${stein} ist kein Laut der Leseecke`;
  if (gruppe > 4) return `«${sauber}» braucht einen Laut der Gruppe ${gruppe}`;
  return true;
}

{
  const ids = bib.BUECHER.map((b) => b.id);
  pruefe(new Set(ids).size === ids.length, "Bücher: eine Kennung steht doppelt");
  pruefe(bib.BUECHER.length >= 6, `Bücher: nur ${bib.BUECHER.length}`);
  const stufen = bib.STUFEN.map((s) => s.id);
  pruefe(GRATIS_SCHRANKE.length === 2, `entitlement.js: GRATIS_BUECHER nicht gefunden oder nicht zwei (${GRATIS_SCHRANKE.join(", ")})`);
  const gratis = bib.BUECHER.filter((b) => b.gratis).map((b) => b.id);
  pruefe(gratis.join(",") === GRATIS_SCHRANKE.join(","), `Bücher: frei sind ${gratis.join(", ")}, die Schranke sagt ${GRATIS_SCHRANKE.join(", ")}`);
  GRATIS_SCHRANKE.forEach((id) => pruefe(ids.includes(id), `entitlement.js: das freie Buch ${id} gibt es nicht`));
  // Frei ist je ein Buch zum Hören und eines zum Selberlesen.
  pruefe(gratis.some((id) => bib.BY_ID[id]?.stufe === "hoerbuch") && gratis.some((id) => bib.BY_ID[id]?.stufe !== "hoerbuch"),
    "Bücher: frei sind nicht ein Hörbuch und ein Buch zum Selberlesen");

  bib.BUECHER.forEach((buch) => {
    const name = `Buch ${buch.id}`;
    pruefe(stufen.includes(buch.stufe), `${name}: unbekannte Stufe ${buch.stufe}`);
    pruefe(FIGUREN.has(buch.figur), `${name}: die Figur ${buch.figur} gibt es nicht`);
    pruefe(LANDSCHAFTEN.has(buch.landschaft), `${name}: die Landschaft ${buch.landschaft} gibt es nicht`);
    pruefe(/^#[0-9a-f]{6}$/i.test(buch.farbe || ""), `${name}: keine Farbe`);
    pruefe(buch.titel && buch.titel.length <= 34, `${name}: Titel fehlt oder ist zu lang für den Umschlag`);
    pruefe(buch.seiten.length >= 5 && buch.seiten.length <= 12, `${name}: ${buch.seiten.length} Seiten`);
    pruefe(bib.wortZahl(buch) >= 20, `${name}: nur ${bib.wortZahl(buch)} Wörter`);

    buch.seiten.forEach((seite, i) => {
      const wo = `${name}, Seite ${i + 1}`;
      const saetze = bib.saetze(seite.text);
      pruefe(saetze.length >= 1, `${wo}: kein Text`);
      pruefe(saetze.join(" ") === seite.text.trim().replace(/\s+/g, " "), `${wo}: die Sätze ergeben nicht den Text`);
      saetze.forEach((satz) => pruefe(/[.!?…]»?$/.test(satz), `${wo}: «${satz}» endet ohne Satzzeichen`));
      pruefe(!/\s[,.!?]/.test(seite.text) && !/ {2}/.test(seite.text), `${wo}: Leerzeichen vor einem Satzzeichen oder doppelt`);
      if (buch.stufe === "erste") {
        pruefe(saetze.length <= 2, `${wo}: ${saetze.length} Sätze – erste Sätze haben höchstens zwei je Seite`);
        saetze.forEach((satz) => pruefe(bib.woerter(satz).length <= 7, `${wo}: «${satz}» hat mehr als sieben Wörter`));
        bib.woerter(seite.text).forEach((wort) => { const ok = lautgetreu(wort); pruefe(ok === true, `${wo}: ${ok}`); });
      }
      if (buch.stufe === "hoerbuch" || buch.stufe === "klein") {
        saetze.forEach((satz) => pruefe(bib.woerter(satz).length <= 18, `${wo}: «${satz.slice(0, 40)}…» ist für diese Stufe zu lang`));
      }
      const bild = seite.bild || {};
      pruefe((bild.figuren || []).length + (bild.dinge || []).length + (bild.zeichnungen || []).length > 0 || bild.landschaft, `${wo}: das Bild ist leer`);
      (bild.figuren || []).forEach((f) => {
        pruefe(FIGUREN.has(f.id), `${wo}: die Figur ${f.id} gibt es nicht`);
        pruefe(f.x >= 0 && f.x <= 240 && (f.y === undefined || (f.y > 0 && f.y <= 152)), `${wo}: ${f.id} steht ausserhalb des Bildes`);
      });
      (bild.dinge || []).forEach((d) => pruefe(d.e && d.x >= 0 && d.x <= 240 && d.y >= 0 && d.y <= 152 && d.s > 4, `${wo}: ein Ding (${d.e}) liegt ausserhalb oder hat keine Grösse`));
      (bild.zeichnungen || []).forEach((z) => pruefe(ZEICHNUNGEN.includes(z.z), `${wo}: unbekannte Zeichnung ${z.z}`));
      if (bild.landschaft) pruefe(LANDSCHAFTEN.has(bild.landschaft), `${wo}: die Landschaft ${bild.landschaft} gibt es nicht`);
    });

    pruefe(buch.fragen.length >= 2 && buch.fragen.length <= 4, `${name}: ${buch.fragen.length} Fragen`);
    buch.fragen.forEach((frage, i) => {
      const wo = `${name}, Frage ${i + 1}`;
      pruefe(/\?$/.test(frage.frage), `${wo}: «${frage.frage}» endet nicht mit ?`);
      pruefe(frage.antworten.length >= 2 && frage.antworten.length <= 4, `${wo}: ${frage.antworten.length} Antworten`);
      pruefe(Number.isInteger(frage.richtig) && frage.richtig >= 0 && frage.richtig < frage.antworten.length, `${wo}: keine richtige Antwort`);
      pruefe(Number.isInteger(frage.seite) && frage.seite >= 1 && frage.seite <= buch.seiten.length, `${wo}: Seite ${frage.seite} gibt es nicht`);
      const texte = frage.antworten.map((a) => a.text);
      pruefe(texte.every(Boolean) && new Set(texte).size === texte.length, `${wo}: eine Antwort ohne Text oder doppelt`);
      frage.antworten.forEach((a) => { if (a.figur) pruefe(FIGUREN.has(a.figur), `${wo}: die Figur ${a.figur} gibt es nicht`); });
      // Wer noch nicht liest, antwortet mit Bildern.
      if (buch.stufe === "hoerbuch") pruefe(frage.antworten.every((a) => a.bild || a.figur), `${wo}: ein Hörbuch fragt mit einer Antwort ohne Bild`);
      // Eine Antwort, die nur aus Text besteht, muss sich lesen lassen – in
      // den ersten Sätzen also lautgetreu, wie die Frage selbst.
      if (buch.stufe === "erste") {
        bib.woerter(frage.frage).forEach((wort) => { const ok = lautgetreu(wort); pruefe(ok === true, `${wo}: ${ok}`); });
        frage.antworten.filter((a) => !a.bild && !a.figur).forEach((a) => bib.woerter(a.text).forEach((wort) => {
          const ok = lautgetreu(wort);
          pruefe(ok === true, `${wo}: ${ok}`);
        }));
      }
      // Bei Hörbüchern und ersten Sätzen steht die Antwort wörtlich auf der
      // Seite, auf die «Im Buch nachsehen» führt. Ab den kleinen Geschichten
      // darf eine Frage auch zum Nachdenken sein.
      const seite = buch.seiten[frage.seite - 1];
      if (seite && (buch.stufe === "hoerbuch" || buch.stufe === "erste")) {
        const text = seite.text.toLowerCase();
        const richtig = frage.antworten[frage.richtig]?.text || "";
        const kern = bib.woerter(richtig).map((t) => bib.nurWort(t).toLowerCase()).filter((t) => t.length >= 3 && !KLEINE_WOERTER.has(t));
        pruefe(kern.some((t) => text.includes(t.slice(0, Math.max(3, t.length - 1)))), `${wo}: «${richtig}» steht nicht auf Seite ${frage.seite}`);
      }
    });
  });
}

// --- 4. Der Lesestand -------------------------------------------------------------
{
  const { windowStub: s, store } = lade("lesen-inhalte.js", "lesen-stand.js");
  const stand = s.LernappLeseStand;
  pruefe(Boolean(stand), "lesen-stand.js legt nichts an");
  if (stand) {
    const a = { woerter: 40, laute: { m: { r: 2, f: 1, tage: ["2026-10-01"], zuletzt: 5 } }, buecher: { x: { mal: 1, sterne: 2, at: 3 } }, spiele: {} };
    const b = { woerter: 30, laute: { m: { r: 1, f: 4, tage: ["2026-10-02"], zuletzt: 9 }, a: { r: 3, f: 0, tage: ["2026-10-02"], zuletzt: 1 } }, buecher: { x: { mal: 2, sterne: 1, at: 1 } }, spiele: { silbenzug: { runden: 1, best: 4, zuletzt: 2 } } };
    const ab = JSON.stringify(stand.merge(a, b));
    pruefe(ab === JSON.stringify(stand.merge(b, a)) || JSON.stringify(JSON.parse(ab)) === JSON.stringify(stand.merge(b, a)), "Lesestand: merge(a, b) ist nicht dasselbe wie merge(b, a)");
    const m = stand.merge(a, b);
    pruefe(m.woerter === 40 && m.laute.m.r === 2 && m.laute.m.f === 4 && m.laute.m.tage.length === 2 && m.buecher.x.mal === 2 && m.buecher.x.sterne === 2,
      `Lesestand: merge nimmt nicht das Maximum: ${JSON.stringify(m)}`);
    pruefe(JSON.stringify(stand.merge(m, m)) === JSON.stringify(m), "Lesestand: derselbe Stand zweimal ändert etwas");
    // Ein Laut sitzt erst nach drei Treffern an zwei Tagen.
    pruefe(!stand.lautSitzt("m", { laute: { m: { r: 5, tage: ["2026-10-01"] } } }), "Lesestand: ein Laut sitzt nach einem einzigen Tag");
    pruefe(!stand.lautSitzt("m", { laute: { m: { r: 2, tage: ["2026-10-01", "2026-10-02"] } } }), "Lesestand: ein Laut sitzt nach zwei Treffern");
    pruefe(stand.lautSitzt("m", { laute: { m: { r: 3, tage: ["2026-10-01", "2026-10-02"] } } }), "Lesestand: drei Treffer an zwei Tagen sitzen nicht");
    // Der Lesewurm: ein Glied je zwanzig Wörter, höchstens sechzig.
    pruefe(stand.wurmGlieder({ woerter: 0 }) === 1 && stand.wurmGlieder({ woerter: 39 }) === 2 && stand.wurmGlieder({ woerter: 40 }) === 3 && stand.wurmGlieder({ woerter: 99999 }) === stand.GLIEDER_MAX,
      "Lesestand: der Lesewurm wächst nicht je zwanzig Wörter");
    stand.woerterGelesen(25);
    stand.buchGelesen("hase-rueebli", { sterne: 2 });
    stand.buchGelesen("hase-rueebli", { sterne: 1 });
    const jetzt = stand.stand();
    pruefe(jetzt.woerter === 25 && jetzt.buecher["hase-rueebli"].mal === 2 && jetzt.buecher["hase-rueebli"].sterne === 2, `Lesestand: Eintragen geht nicht: ${JSON.stringify(jetzt)}`);
    // Die Einstellung der Eltern: Unsinn wird zu «auto».
    const sauber = stand.elternSauber({ startpunkt: "fliegen", schrift: 7, at: "x" });
    pruefe(sauber.startpunkt === "auto" && sauber.schrift === "auto" && sauber.at === 0, `Lesestand: elternSauber lässt Unsinn durch: ${JSON.stringify(sauber)}`);
    store.set(stand.ELTERN_KEY, JSON.stringify({ startpunkt: "woerter", schrift: "gross", at: 5 }));
    pruefe(stand.lesestufe() === "woerter" && stand.nurGross() && stand.zeige("Rose") === "ROSE", "Lesestand: die Einstellung der Eltern gilt nicht");
    store.set(stand.ELTERN_KEY, JSON.stringify({ startpunkt: "auto", schrift: "auto", at: 6 }));
    pruefe(stand.lesestufe() === "buchstaben" && !stand.nurGross(), `Lesestand: ohne Einstellung und ohne Stufe beginnt die Leseecke bei ${stand.lesestufe()}`);
    // Was als Nächstes dran ist, gibt es auch.
    for (const [stufe, liste] of Object.entries(stand.AUSWAHL)) {
      pruefe(stand.STARTPUNKTE.includes(stufe), `Lesestand: AUSWAHL kennt die Stufe ${stufe} nicht`);
      liste.forEach((id) => pruefe(stand.SPIELE[id] && fs.existsSync(path.join(root, stand.SPIELE[id].page.split("?")[0])), `Lesestand: das Spiel ${id} hat keine Seite`));
    }
    pruefe(Boolean(stand.SPIELE[stand.naechstes().id]), "Lesestand: naechstes() führt ins Leere");
  }
}

// --- 5. Die Seiten ------------------------------------------------------------------
{
  const GEMEINSAM = ["entitlement.js", "kids.js", "train-art.js", "train-scenes.js", "game-cloud.js", "lesen-inhalte.js", "lesen-stand.js", "lesen-laute.js", "lesen-ton.js", "lesen-art.js", "game-shell.js", "lesen-spiel.js"];
  const SEITEN = { silbenzug: [], buchstabenhaus: [], lautekuppeln: [], stimmtdas: [], buecher: ["lesen-buecher.js"] };
  const stand = lies("lesen-stand.js");
  for (const [seite, extra] of Object.entries(SEITEN)) {
    const datei = `${seite}.html`;
    if (!fs.existsSync(path.join(root, datei))) { fehler.push(`${datei}: Seite fehlt`); continue; }
    const html = lies(datei);
    pruefe(html.includes(`<body data-page="${seite}">`), `${datei}: body trägt nicht data-page="${seite}"`);
    pruefe(/<div id="lese-stage"/.test(html), `${datei}: die Bühne #lese-stage fehlt`);
    pruefe(/href="leseschrift\.css\?v=/.test(html), `${datei}: die Leseschrift fehlt`);
    const reihe = [...GEMEINSAM, ...extra, `${seite}.js`];
    let vorher = -1;
    reihe.forEach((skript) => {
      const stelle = html.indexOf(`src="${skript}?v=`);
      pruefe(stelle >= 0, `${datei}: lädt ${skript} nicht`);
      if (stelle >= 0 && ["lesen-inhalte.js", "game-shell.js", "lesen-spiel.js", `${seite}.js`].includes(skript)) {
        pruefe(stelle > vorher, `${datei}: ${skript} steht zu früh`);
        vorher = stelle;
      }
    });
    pruefe(stand.includes(`"${datei}`), `lesen-stand.js: SPIELE kennt ${datei} nicht`);
  }
  const index = lies("index.html");
  ["lesen-inhalte.js", "lesen-stand.js", "lesen-art.js", "train-leseecke.js"].forEach((skript) => {
    const stelle = index.indexOf(`src="${skript}?v=`);
    pruefe(stelle >= 0 && stelle < index.indexOf('src="train-home.js?v='), `index.html: ${skript} fehlt oder steht nach train-home.js`);
  });
  const sw = lies("service-worker.js");
  [...Object.keys(SEITEN).flatMap((s) => [`./${s}.html"`, `./${s}.js\${`]), "./leseschrift.css${", "./lesen-inhalte.js${", "./lesen-stand.js${", "./lesen-laute.js${",
    "./lesen-ton.js${", "./lesen-art.js${", "./lesen-spiel.js${", "./lesen-buecher.js${", "./train-leseecke.js${"].forEach((eintrag) => {
    pruefe(sw.includes(eintrag), `service-worker.js: ${eintrag.replace(/["${]/g, "")} fehlt in CORE_ASSETS`);
  });
  // Die Schrift liegt in der Datei selbst: Der Build kopiert keine Ordner
  // ausser icons/ und bilder/.
  const schrift = lies("leseschrift.css");
  pruefe(/font-family: "Andika"/.test(schrift) && (schrift.match(/url\(data:font\/woff2;base64,/g) || []).length === 2, "leseschrift.css: Andika ist nicht zweimal eingebettet (normal und fett)");
  pruefe(/SIL Open Font\s+(?:\*\s+)?License/.test(schrift), "leseschrift.css: der Hinweis auf die Lizenz fehlt");
}

// --- 6. Die Aufnahmen der Laute ----------------------------------------------------------
// lesen-laute.js entsteht auf laute-aufnehmen.html und kommt von Hand ins Repo.
// Darum wird hier jede Aufnahme aufgemacht: Laut der Leseecke, WAV, 16 kHz,
// 16 Bit, mono, nicht zu kurz und nicht zu lang. Und die Bearbeitung der
// Aufnahmeseite wird an künstlichen Tönen nachgerechnet.
{
  const { windowStub: l } = lade("lesen-laute.js");
  const aufnahmen = l.LernappLauteAufnahmen;
  pruefe(aufnahmen && typeof aufnahmen === "object", "lesen-laute.js legt window.LernappLauteAufnahmen nicht an");
  const groesse = fs.statSync(path.join(root, "lesen-laute.js")).size;
  pruefe(groesse < 1.6 * 1024 * 1024, `lesen-laute.js ist ${Math.round(groesse / 1024)} KB gross – mehr als 1,6 MB lädt jede Seite der Leseecke zu lange`);
  Object.entries(aufnahmen || {}).forEach(([id, quelle]) => {
    const name = `Aufnahme ${id}`;
    pruefe(Boolean(LAUT[id]), `${name}: diesen Laut gibt es in lesen-inhalte.js nicht`);
    const treffer = /^data:audio\/wav;base64,([A-Za-z0-9+/=]+)$/.exec(String(quelle || ""));
    if (!treffer) { fehler.push(`${name}: keine WAV-Daten-Adresse`); return; }
    const bytes = Buffer.from(treffer[1], "base64");
    const text = (stelle, laenge) => bytes.toString("latin1", stelle, stelle + laenge);
    const ok = bytes.length > 44 && text(0, 4) === "RIFF" && text(8, 4) === "WAVE" && text(12, 4) === "fmt " && text(36, 4) === "data";
    if (!ok) { fehler.push(`${name}: kein gültiger WAV-Kopf`); return; }
    const format = bytes.readUInt16LE(20);
    const kanaele = bytes.readUInt16LE(22);
    const rate = bytes.readUInt32LE(24);
    const bits = bytes.readUInt16LE(34);
    const daten = bytes.readUInt32LE(40);
    pruefe(format === 1 && kanaele === 1 && rate === 16000 && bits === 16, `${name}: ${format === 1 ? "PCM" : `Format ${format}`}, ${kanaele} Kanäle, ${rate} Hz, ${bits} Bit – erwartet PCM, mono, 16000 Hz, 16 Bit`);
    pruefe(daten === bytes.length - 44, `${name}: die Länge im Kopf stimmt nicht`);
    const sekunden = daten / 2 / (rate || 1);
    pruefe(sekunden >= 0.04 && sekunden <= 1.3, `${name}: ${sekunden.toFixed(2)} s lang`);
  });

  const box = sandbox();
  box.context.document.body.dataset.page = "anderswo";
  vm.runInContext(lies("laute-aufnehmen.js"), box.context, { filename: "laute-aufnehmen.js" });
  const auf = box.windowStub.LernappLauteAufnehmen;
  pruefe(Boolean(auf), "laute-aufnehmen.js legt seine Werkzeuge nicht an");
  if (auf) {
    inhalte.LAUTE.forEach((laut) => pruefe(/«[^»]+»/.test(auf.HINWEISE?.[laut.id] || ""), `laute-aufnehmen.js: kein Hinweis, wie «${laut.gross}» klingt`));
    const R = 48000;
    const ton = (sekunden, freq, amp, pause = 0.3) => {
      const n = Math.round((sekunden + 2 * pause) * R);
      const a = new Float32Array(n);
      for (let i = Math.round(pause * R); i < n - Math.round(pause * R); i += 1) a[i] = amp * Math.sin(2 * Math.PI * freq * i / R);
      return a;
    };
    // Zuschneiden: eine halbe Sekunde Ton zwischen Stille – übrig bleiben der
    // Ton und ein kleiner Rand (40 ms vorne, 80 ms hinten).
    const geschnitten = auf.zuschneiden(ton(0.5, 440, 0.3), R);
    const dauer = (geschnitten?.length || 0) / R;
    pruefe(dauer > 0.6 && dauer < 0.64, `Aufnahme: Zuschneiden lässt ${dauer.toFixed(3)} s statt rund 0,62 s`);
    pruefe(auf.zuschneiden(new Float32Array(R), R) === null, "Aufnahme: Stille wird nicht als «nichts gehört» erkannt");
    // Umrechnen auf 16 kHz: ein Ton von 440 Hz bleibt, wie er ist; einer von
    // 12 kHz – über der neuen Grenze von 8 kHz – verschwindet, statt als
    // falscher Ton bei 4 kHz wiederzukommen.
    const rms = (a, von = 0, bis = a.length) => { let s = 0; for (let i = von; i < bis; i += 1) s += a[i] * a[i]; return Math.sqrt(s / Math.max(1, bis - von)); };
    const tief = auf.umrechnen(ton(0.5, 440, 0.3, 0), R, 16000);
    pruefe(Math.abs(tief.length - 8000) <= 1, `Aufnahme: aus 0,5 s bei 48 kHz werden ${tief.length} statt 8000 Werte`);
    const mitte = rms(tief, 1000, 7000);
    pruefe(Math.abs(mitte - 0.3 / Math.SQRT2) < 0.01, `Aufnahme: 440 Hz kommt mit ${mitte.toFixed(3)} statt ${(0.3 / Math.SQRT2).toFixed(3)} an`);
    const hoch = auf.umrechnen(ton(0.5, 12000, 0.3, 0), R, 16000);
    pruefe(rms(hoch, 1000, 7000) < 0.3 / Math.SQRT2 * 0.02, `Aufnahme: 12 kHz klirrt nach dem Umrechnen mit ${rms(hoch, 1000, 7000).toFixed(4)} weiter`);
    // Glätten: Spitze bei 90 %, Anfang und Ende bei null.
    const glatt = auf.glaetten(tief, 16000);
    const spitze = glatt.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    pruefe(Math.abs(spitze - 0.9) < 0.01 && Math.abs(glatt[0]) < 1e-6 && Math.abs(glatt[glatt.length - 1]) < 1e-6, `Aufnahme: nach dem Glätten Spitze ${spitze.toFixed(3)}, Rand ${glatt[0]}, ${glatt[glatt.length - 1]}`);
    // Und die Datei: 44 Bytes Kopf, zwei je Wert.
    const datei = auf.wav(glatt, 16000);
    pruefe(datei.length === 44 + glatt.length * 2 && Buffer.from(datei).toString("latin1", 0, 4) === "RIFF", "Aufnahme: die WAV-Datei hat die falsche Länge oder keinen Kopf");
  }
  const seite = lies("laute-aufnehmen.html");
  pruefe(/<body data-page="laute-aufnehmen">/.test(seite) && /<meta name="robots" content="noindex"/.test(seite), "laute-aufnehmen.html: data-page oder noindex fehlt");
  ["lesen-inhalte.js", "lesen-laute.js", "laute-aufnehmen.js"].forEach((skript) => pruefe(seite.includes(`src="${skript}?v=`), `laute-aufnehmen.html: lädt ${skript} nicht`));
}

// --- 7. Schweizer Rechtschreibung ----------------------------------------------------
{
  const dateien = ["lesen-inhalte.js", "lesen-buecher.js", "lesen-stand.js", "lesen-ton.js", "lesen-art.js", "lesen-spiel.js", "lesen-laute.js", "train-leseecke.js",
    "silbenzug.js", "buchstabenhaus.js", "lautekuppeln.js", "stimmtdas.js", "buecher.js",
    "silbenzug.html", "buchstabenhaus.html", "lautekuppeln.html", "stimmtdas.html", "buecher.html",
    "laute-aufnehmen.html", "laute-aufnehmen.js"];
  dateien.forEach((datei) => {
    if (!fs.existsSync(path.join(root, datei))) return;
    const zeilen = lies(datei).split("\n");
    zeilen.forEach((zeile, i) => pruefe(!zeile.includes("ß"), `${datei}:${i + 1}: ß statt ss`));
  });
}

if (fehler.length) {
  console.error("Die Leseecke stimmt nicht:");
  fehler.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
const aufgenommen = Object.keys(lade("lesen-laute.js").windowStub.LernappLauteAufnahmen || {}).length;
console.log(`Die Leseecke stimmt: ${inhalte.LAUTE.length} Laute (${aufgenommen} aufgenommen), ${inhalte.SILBEN_WOERTER.length + inhalte.KUPPEL_WOERTER.length} Wörter, ${bib.BUECHER.length} Bücher mit ${bib.BUECHER.reduce((n, b) => n + b.fragen.length, 0)} Fragen, der Lesestand, die Seiten und die Aufnahmeseite.`);
