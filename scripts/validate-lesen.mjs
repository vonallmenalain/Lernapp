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
 *               sind dieselben wie in der Schranke. Kapitelbücher haben drei
 *               bis fünf Kapitel mit Überschrift, jedes mindestens zwei
 *               Seiten lang, und eine halbe Buchseite (30 bis 65 Wörter) je
 *               Seite; ein Wahrzeichen im Bild gibt es auf der Reise.
 *   Lesestand   Zusammenführen ist das Maximum, in beide Richtungen gleich;
 *               ein Laut sitzt erst nach drei Treffern an zwei Tagen; der
 *               Lesewurm wächst je zwanzig Wörter; die Eltern-Einstellung
 *               fällt bei Unsinn auf «auto» zurück; ein Spiel wächst nach
 *               zwei Runden mit drei Sternen eine Stufe mit, nach zwei
 *               schwachen zurück, und zwischen Geräten gilt der neuere Schritt.
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

// --- 2b. Reime, Anlaute, Blitzwörter (Etappe 2) ---------------------------------
{
  // Reime: jede Gruppe mindestens zwei Wörter mit Bild, kein Wort in zwei
  // Gruppen – sonst reimte sich ein «falscher» Wagen doch.
  const alleReime = inhalte.REIME.flatMap((g) => g.woerter.map((w) => w.wort));
  pruefe(inhalte.REIME.length >= 12, `Reime: nur ${inhalte.REIME.length} Gruppen`);
  pruefe(new Set(alleReime).size === alleReime.length, "Reime: ein Wort steht in zwei Gruppen");
  pruefe(new Set(inhalte.REIME.map((g) => g.endung)).size === inhalte.REIME.length, "Reime: zwei Gruppen mit derselben Endung");
  inhalte.REIME.forEach((g) => {
    pruefe(g.woerter.length >= 2, `Reime ${g.endung}: weniger als zwei Wörter`);
    g.woerter.forEach((w) => pruefe(w.wort && w.bild && /^[A-ZÄÖÜ]/.test(w.wort), `Reime ${g.endung}: «${w.wort}» ohne Bild oder klein geschrieben`));
  });
  // Anlaute: nach dem Ohr, nicht nach der Schrift.
  pruefe(inhalte.anlautVon("Stern") === "sch" && inhalte.anlautVon("Spinne") === "sch" && inhalte.anlautVon("Vogel") === "f" && inhalte.anlautVon("Vase") === "w" && inhalte.anlautVon("Maus") === "m" && inhalte.anlautVon("Eis") === "ei",
    "anlautVon: Stern, Spinne, Vogel, Vase, Maus oder Eis fangen falsch an");
  const alleBildWoerter = inhalte.bildWoerter().map((w) => w.wort);
  inhalte.MEHRDEUTIG.forEach((wort) => pruefe(alleBildWoerter.includes(wort), `MEHRDEUTIG: «${wort}» kommt in keiner Liste vor`));
  const eindeutig = inhalte.bildWoerter({ eindeutig: true });
  pruefe(eindeutig.every((w) => !inhalte.MEHRDEUTIG.has(w.wort)), "bildWoerter({ eindeutig }): ein mehrdeutiges Bild ist dabei");
  const nachLaut = {};
  eindeutig.forEach((w) => { (nachLaut[inhalte.anlautVon(w.wort)] ||= []).push(w.wort); });
  const genug = Object.values(nachLaut).filter((liste) => liste.length >= 2).length;
  pruefe(genug >= 10, `Anlaut-Lauscher: nur ${genug} Anfangslaute mit zwei eindeutigen Bildern – eine Runde braucht acht, und Abwechslung mehr`);
  const bilder = eindeutig.map((w) => w.bild);
  pruefe(new Set(bilder).size === bilder.length, `bildWoerter: ein Bild steht für zwei Wörter (${bilder.filter((b, i) => bilder.indexOf(b) !== i).join(" ")})`);
  // Blitzwörter: drei ähnliche, alle verschieden, keines das Wort selbst.
  const blitz = inhalte.BLITZWOERTER.map((b) => b.wort);
  pruefe(new Set(blitz).size === blitz.length, "Blitzwörter: ein Wort steht doppelt");
  inhalte.BLITZWOERTER.forEach((b) => {
    const wahl = [b.wort, ...b.aehnlich];
    pruefe(b.aehnlich.length === 3 && new Set(wahl).size === 4, `Blitzwort «${b.wort}»: nicht drei verschiedene ähnliche`);
    pruefe(wahl.every((w) => /^[A-Za-zÄÖÜäöü]{1,6}$/.test(w)), `Blitzwort «${b.wort}»: ein Wort ist kein kurzes Wort`);
    pruefe([1, 2].includes(b.stufe), `Blitzwort «${b.wort}»: Stufe ${b.stufe}`);
  });
  for (const [stufe, gruppen] of Object.entries(inhalte.BLITZ_JE_STUFE)) {
    const anzahl = inhalte.BLITZWOERTER.filter((b) => gruppen.includes(b.stufe)).length;
    pruefe(anzahl >= 10, `Blitzwörter ${stufe}: nur ${anzahl} – eine Runde hat zehn`);
  }
}

// --- 2c. Wie die Buchstaben geschrieben werden (Buchstabengleis) ------------------
{
  // Ein Weg aus M, L, C und Q – abgetastet, wie es der Browser auch tut.
  function abtasten(d) {
    const teile = String(d).match(/[A-Za-z]|-?\d+(?:\.\d+)?/g) || [];
    const punkte = [];
    let i = 0;
    let befehl = "";
    let jetzt = null;
    const zahl = () => Number(teile[i++]);
    while (i < teile.length) {
      if (/[A-Za-z]/.test(teile[i])) befehl = teile[i++];
      if (!/^[MLCQ]$/.test(befehl)) return { fehler: `unbekannter Befehl ${befehl}` };
      if (befehl === "M") { jetzt = { x: zahl(), y: zahl() }; punkte.push(jetzt); continue; }
      if (!jetzt) return { fehler: "beginnt nicht mit M" };
      if (befehl === "L") { jetzt = { x: zahl(), y: zahl() }; punkte.push(jetzt); continue; }
      const kontrolle = befehl === "C" ? [{ x: zahl(), y: zahl() }, { x: zahl(), y: zahl() }] : [{ x: zahl(), y: zahl() }];
      const ziel = { x: zahl(), y: zahl() };
      const a = jetzt;
      for (let t = 1; t <= 20; t += 1) {
        const u = t / 20;
        const v = 1 - u;
        punkte.push(befehl === "C"
          ? { x: v ** 3 * a.x + 3 * v * v * u * kontrolle[0].x + 3 * v * u * u * kontrolle[1].x + u ** 3 * ziel.x, y: v ** 3 * a.y + 3 * v * v * u * kontrolle[0].y + 3 * v * u * u * kontrolle[1].y + u ** 3 * ziel.y }
          : { x: v * v * a.x + 2 * v * u * kontrolle[0].x + u * u * ziel.x, y: v * v * a.y + 2 * v * u * kontrolle[0].y + u * u * ziel.y });
      }
      jetzt = ziel;
    }
    let laenge = 0;
    for (let k = 1; k < punkte.length; k += 1) laenge += Math.hypot(punkte[k].x - punkte[k - 1].x, punkte[k].y - punkte[k - 1].y);
    return { punkte, laenge };
  }
  const MIT_PUNKT = new Set(["i", "j", "ä", "ö", "ü", "Ä", "Ö", "Ü"]);
  inhalte.LAUTE.filter((laut) => laut.id.length === 1).forEach((laut) => {
    [laut.gross, laut.klein].forEach((zeichen) => {
      const striche = inhalte.GLEISE[zeichen];
      const wo = `Buchstabengleis ${zeichen}`;
      if (!Array.isArray(striche) || !striche.length) { fehler.push(`${wo}: kein Weg`); return; }
      let punkte = 0;
      striche.forEach((d, n) => {
        const weg = abtasten(d);
        if (weg.fehler) { fehler.push(`${wo}, Strich ${n + 1}: ${weg.fehler}`); return; }
        weg.punkte.forEach((p) => pruefe(p.x >= -10 && p.x <= 110 && p.y >= -20 && p.y <= 145, `${wo}, Strich ${n + 1}: (${p.x}, ${p.y}) liegt ausserhalb`));
        if (weg.laenge < 4) { punkte += 1; return; }
        pruefe(weg.laenge >= 20, `${wo}, Strich ${n + 1}: nur ${Math.round(weg.laenge)} lang`);
        // Ein einzelner gerader Strich geht senkrecht von oben nach unten und
        // waagrecht von links nach rechts – so wird geschrieben.
        const gerade = /^M\s*-?[\d.]+\s+-?[\d.]+\s+L\s*-?[\d.]+\s+-?[\d.]+$/.test(d.trim());
        if (gerade) {
          const [a, b] = [weg.punkte[0], weg.punkte[weg.punkte.length - 1]];
          if (a.x === b.x) pruefe(b.y > a.y, `${wo}, Strich ${n + 1}: senkrecht von unten nach oben`);
          if (a.y === b.y) pruefe(b.x > a.x, `${wo}, Strich ${n + 1}: waagrecht von rechts nach links`);
        }
      });
      pruefe(MIT_PUNKT.has(zeichen) ? punkte >= 1 : punkte === 0, `${wo}: ${punkte} Punkte zum Antippen`);
    });
  });
}

// --- 2d. Wer bin ich? und die Wortbaustelle (Etappe 4) --------------------------------
// Emoji, die erst ab Unicode 12 kommen, zeigen ältere Geräte als leeres
// Kästchen – in neuen Inhalten haben sie nichts zu suchen.
const SPAETE_EMOJI = [[0x1fa70, 0x1faff], [0x1f7e0, 0x1f7eb], [0x1f9c3, 0x1f9ca], [0x1f9a5, 0x1f9aa], [0x1f9ae, 0x1f9af], [0x1f9ba, 0x1f9bf], [0x1f9cd, 0x1f9cf],
  [0x1f90c, 0x1f90f], [0x1f6d5, 0x1f6d7], [0x1f6fa, 0x1f6fc], [0x1f971, 0x1f972], [0x1f977, 0x1f978]];
const spaet = (text) => [...String(text || "")].some((z) => { const c = z.codePointAt(0); return SPAETE_EMOJI.some(([a, b]) => c >= a && c <= b); });
{
  const raetsel = inhalte.RAETSEL || [];
  pruefe(raetsel.length >= 20, `Wer bin ich?: nur ${raetsel.length} Rätsel`);
  pruefe(new Set(raetsel.map((r) => r.id)).size === raetsel.length && new Set(raetsel.map((r) => r.bild)).size === raetsel.length, "Wer bin ich?: ein Rätsel oder ein Bild kommt doppelt vor");
  raetsel.forEach((r) => {
    const wo = `Wer bin ich? ${r.id}`;
    pruefe(/^(der|die|das) \S/.test(r.wer || ""), `${wo}: «wer» braucht den Artikel (${r.wer})`);
    pruefe(Array.isArray(r.hinweise) && r.hinweise.length >= 4 && r.hinweise.length <= 5, `${wo}: ${r.hinweise?.length} Hinweise statt 4 oder 5`);
    (r.hinweise || []).forEach((h) => {
      pruefe(/^[A-ZÄÖÜ].*[.!]$/.test(h) && h.split(/\s+/).length <= 9, `${wo}: «${h}» ist kein kurzer Satz`);
      const wort = (r.wer || "").split(" ").pop();
      pruefe(!h.includes(wort), `${wo}: «${h}» verrät die Antwort`);
    });
    pruefe(Array.isArray(r.andere) && r.andere.length === 3 && new Set([r.bild, ...r.andere]).size === 4, `${wo}: drei andere Bilder, keines doppelt`);
    pruefe(![r.bild, ...(r.andere || [])].some(spaet), `${wo}: ein Bild ist zu neu für ältere Geräte`);
  });
  const bau = inhalte.BAUSTELLE || [];
  pruefe(bau.length >= 16, `Wortbaustelle: nur ${bau.length} Wörter`);
  const ganze = new Set(bau.map((b) => b.wort));
  pruefe(ganze.size === bau.length, "Wortbaustelle: ein Wort kommt doppelt vor");
  bau.forEach((b) => {
    const wo = `Wortbaustelle ${b.wort}`;
    const [a, z] = b.teile || [];
    pruefe(Boolean(a && z) && b.wort === a + z.charAt(0).toLowerCase() + z.slice(1), `${wo}: ist nicht ${a} + ${z} (ohne Fugen)`);
    pruefe(Array.isArray(b.bilder) && b.bilder.length === 2, `${wo}: zwei Bilder für die Teile (oder null)`);
    pruefe(Array.isArray(b.falsch) && b.falsch.length === 2, `${wo}: zwei falsche Teile`);
    (b.falsch || []).forEach(([wort, bild]) => {
      pruefe(wort !== z && /^[A-ZÄÖÜ][a-zäöü]+$/.test(wort), `${wo}: falscher Teil «${wort}»`);
      pruefe(!ganze.has(a + wort.charAt(0).toLowerCase() + wort.slice(1)), `${wo}: «${a}» und «${wort}» ergeben ein Wort dieser Liste`);
      pruefe(!spaet(bild), `${wo}: das Bild zu «${wort}» ist zu neu für ältere Geräte`);
    });
    pruefe(![...(b.bilder || []), b.bild].some(spaet), `${wo}: ein Bild ist zu neu für ältere Geräte`);
  });
}

// --- 2e. Steckbriefe, Detektivfälle, Postkarten (lesen-detektive.js) ------------------------
// Steht die Antwort, wo die Frage hinzeigt? Mindestens ein Wort der richtigen
// Antwort (vier Buchstaben und mehr) steht in der Zeile.
const steht = (antwort, text) => String(antwort).toLowerCase().replace(/[.,!?«»]/g, "").split(/\s+/).filter((w) => w.length >= 4 || /^\d+$/.test(w))
  .some((w) => String(text).toLowerCase().includes(w));
{
  const { windowStub: d } = lade("lesen-detektive.js");
  const det = d.LernappLeseDetektive;
  pruefe(Boolean(det), "lesen-detektive.js legt nichts an");
  const TIERE_DER_APP = [...FIGUREN];
  const felder = ["wohnt", "frisst", "gross", "besonders"];
  (det?.STECKBRIEFE || []).forEach((b) => {
    const wo = `Steckbrief ${b.id}`;
    pruefe(TIERE_DER_APP.includes(b.tier), `${wo}: das Tier ${b.tier} gibt es nicht in train-art.js`);
    felder.forEach((f) => pruefe(typeof b[f] === "string" && b[f].length > 3, `${wo}: «${f}» fehlt`));
    pruefe(/[.!]$/.test(b.staunen || ""), `${wo}: die Zahl zum Staunen ist kein Satz`);
    pruefe(Array.isArray(b.fragen) && b.fragen.length === 3, `${wo}: ${b.fragen?.length} Fragen statt 3`);
    (b.fragen || []).forEach((f) => {
      pruefe(/\?$/.test(f.frage) && f.antworten?.length === 3 && new Set(f.antworten).size === 3 && f.richtig === 0, `${wo}: Frage «${f.frage}» – drei verschiedene Antworten, die richtige vorne`);
      const zeile = f.zeile === "staunen" ? b.staunen : b[f.zeile];
      pruefe(Boolean(zeile) && steht(f.antworten[f.richtig], zeile), `${wo}: «${f.antworten[f.richtig]}» steht nicht in der Zeile ${f.zeile}`);
    });
  });
  pruefe((det?.STECKBRIEFE || []).length >= 8, "Steckbriefe: weniger als acht");
  (det?.FAELLE || []).forEach((f) => {
    const wo = `Detektivfall ${f.id}`;
    pruefe(/\?$/.test(f.titel), `${wo}: der Titel ist keine Frage`);
    pruefe(Array.isArray(f.saetze) && f.saetze.length >= 4 && f.saetze.length <= 7 && f.saetze.every((x) => /[.!?]$/.test(x)), `${wo}: vier bis sieben Sätze`);
    const tiere = (f.verdaechtige || []).map(([tier]) => tier);
    pruefe(tiere.length === 3 && new Set(tiere).size === 3 && tiere.every((t) => TIERE_DER_APP.includes(t)), `${wo}: drei verschiedene Verdächtige aus train-art.js`);
    pruefe(tiere.includes(f.taeter), `${wo}: der Täter steht nicht unter den Verdächtigen`);
    pruefe(Number.isInteger(f.beweis) && f.saetze[f.beweis], `${wo}: der Beweis zeigt auf keinen Satz`);
    const name = (f.verdaechtige || []).find(([tier]) => tier === f.taeter)?.[1] || "";
    pruefe(!(f.saetze[f.beweis] || "").includes(name), `${wo}: der Beweis nennt den Täter beim Namen – zu leicht`);
    pruefe(/[.!]$/.test(f.aufloesung || "") && (f.aufloesung || "").includes(name), `${wo}: die Auflösung nennt den Täter nicht`);
  });
  pruefe((det?.FAELLE || []).length >= 6, "Detektivfälle: weniger als sechs");
  // Postkarten: je Karte der Reise eine, vom Fahrgast dieser Karte.
  const maps = lade("journey-plan.js").windowStub.LernappReise?.MAPS || [];
  const karten = maps.map((m) => m.id);
  const fahrgaeste = Object.fromEntries(maps.map((m) => [m.id, m.passenger]));
  const post = det?.POSTKARTEN || [];
  pruefe(karten.length >= 13 && post.length === karten.length, `Postkarten: ${post.length} Karten für ${karten.length} Karten der Reise`);
  karten.forEach((k) => pruefe(post.filter((p) => p.karte === k).length === 1, `Postkarten: zur Karte ${k} nicht genau eine`));
  post.forEach((p) => {
    const wo = `Postkarte ${p.karte}`;
    pruefe(fahrgaeste[p.karte] === p.tier, `${wo}: geschrieben von ${p.tier}, gefahren ist ${fahrgaeste[p.karte]}`);
    pruefe(Array.isArray(p.text) && p.text.length >= 2 && p.text.length <= 4 && p.text.every((x) => /[.!?]$/.test(x)), `${wo}: zwei bis vier Sätze`);
    pruefe((p.gruss || "").endsWith(p.von), `${wo}: der Gruss ist nicht von ${p.von}`);
    const f = p.frage || {};
    pruefe(/\?$/.test(f.frage || "") && f.antworten?.length === 3 && f.richtig === 0 && steht(f.antworten[0], p.text.join(" ")), `${wo}: die Antwort steht nicht auf der Karte`);
  });
}

// --- 3. Bücher ------------------------------------------------------------------
const GRATIS_SCHRANKE = (lies("entitlement.js").match(/const GRATIS_BUECHER = \[([^\]]*)\]/)?.[1] || "")
  .split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
// Was lesen-bilder.js zeichnen kann – aus der Quelle gelesen, damit kein Buch eine
// Zeichnung verlangt, die es nicht gibt.
const ZEICHNUNGEN = [...(lies("lesen-bilder.js").match(/const ZEICHNUNGEN = \{[\s\S]*?\n {2}\};/)?.[0] || "").matchAll(/^ {4}([a-z]+): \(/gm)].map((m) => m[1]);
pruefe(ZEICHNUNGEN.includes("fenster") && ZEICHNUNGEN.includes("schneemann"), `lesen-bilder.js: die Zeichnungen wurden nicht gefunden (${ZEICHNUNGEN.join(", ")})`);
// Die Wahrzeichen der Reise, die ein Bild zeigen kann (train-art.js, LANDMARKS).
const WAHRZEICHEN = (() => {
  const quelle = lies("train-art.js");
  const block = quelle.match(/const LANDMARKS = \{[\s\S]*?\n {2}\};/)?.[0] || "";
  return [...block.matchAll(/^ {4}([a-z]+)\(\) \{/gm), ...quelle.matchAll(/LANDMARKS\.([a-z]+) = /g)].map((m) => m[1]);
})();
pruefe(WAHRZEICHEN.includes("lighthouse") && WAHRZEICHEN.includes("baobab"), `train-art.js: die Wahrzeichen wurden nicht gefunden (${WAHRZEICHEN.join(", ")})`);
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
      // Kapitelbücher: eine halbe Buchseite – genug, um zu lesen, und auf dem
      // Handy noch lesbar gross (scripts/check-handy.mjs misst die längste).
      if (buch.stufe === "kapitel") {
        const zahl = bib.woerter(seite.text).filter((t) => bib.nurWort(t)).length;
        pruefe(zahl >= 30 && zahl <= 65, `${wo}: ${zahl} Wörter – eine Seite im Kapitelbuch hat 30 bis 65`);
        saetze.forEach((satz) => pruefe(bib.woerter(satz).length <= 22, `${wo}: «${satz.slice(0, 40)}…» ist zu lang`));
      }
      const bild = seite.bild || {};
      pruefe((bild.figuren || []).length + (bild.dinge || []).length + (bild.zeichnungen || []).length > 0 || bild.landschaft, `${wo}: das Bild ist leer`);
      (bild.figuren || []).forEach((f) => {
        pruefe(FIGUREN.has(f.id), `${wo}: die Figur ${f.id} gibt es nicht`);
        pruefe(f.x >= 0 && f.x <= 240 && (f.y === undefined || (f.y > 0 && f.y <= 152)), `${wo}: ${f.id} steht ausserhalb des Bildes`);
      });
      (bild.dinge || []).forEach((d) => pruefe(d.e && d.x >= 0 && d.x <= 240 && d.y >= 0 && d.y <= 152 && d.s > 4, `${wo}: ein Ding (${d.e}) liegt ausserhalb oder hat keine Grösse`));
      (bild.zeichnungen || []).forEach((z) => {
        pruefe(ZEICHNUNGEN.includes(z.z), `${wo}: unbekannte Zeichnung ${z.z}`);
        if (z.z === "wahrzeichen") pruefe(WAHRZEICHEN.includes(z.id), `${wo}: das Wahrzeichen ${z.id} gibt es nicht`);
      });
      if (bild.landschaft) pruefe(LANDSCHAFTEN.has(bild.landschaft), `${wo}: die Landschaft ${bild.landschaft} gibt es nicht`);
    });

    // Kapitel: Ein Kapitelbuch beginnt mit einer Überschrift, hat drei bis
    // fünf Kapitel zu mindestens zwei Seiten und vier Fragen; andere Bücher
    // haben keine Kapitel.
    const anfaenge = buch.seiten.map((seite, i) => (seite.kapitel !== undefined ? i : -1)).filter((i) => i >= 0);
    if (buch.stufe === "kapitel") {
      pruefe(buch.seiten.length >= 8, `${name}: ${buch.seiten.length} Seiten – ein Kapitelbuch hat mindestens acht`);
      pruefe(anfaenge[0] === 0, `${name}: die erste Seite hat keine Kapitelüberschrift`);
      pruefe(anfaenge.length >= 3 && anfaenge.length <= 5, `${name}: ${anfaenge.length} Kapitel statt drei bis fünf`);
      anfaenge.forEach((anfang, k) => {
        const laenge = (anfaenge[k + 1] ?? buch.seiten.length) - anfang;
        pruefe(laenge >= 2, `${name}: das Kapitel «${buch.seiten[anfang].kapitel}» hat nur ${laenge} Seite`);
      });
      const koepfe = anfaenge.map((i) => buch.seiten[i].kapitel);
      pruefe(new Set(koepfe).size === koepfe.length, `${name}: eine Kapitelüberschrift steht doppelt`);
      koepfe.forEach((kopf) => pruefe(typeof kopf === "string" && kopf.length >= 3 && kopf.length <= 30 && !/[.,;:–]$/.test(kopf),
        `${name}: die Überschrift «${kopf}» ist zu kurz, zu lang oder endet mit einem Satzzeichen`));
      pruefe(bib.wortZahl(buch) >= 350, `${name}: nur ${bib.wortZahl(buch)} Wörter – zu kurz für ein Kapitelbuch`);
      pruefe(buch.fragen.length === 4, `${name}: ${buch.fragen.length} Fragen – ein Kapitelbuch hat vier`);
    } else {
      pruefe(anfaenge.length === 0, `${name}: Kapitelüberschriften gibt es nur in Kapitelbüchern`);
    }

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

// --- 3b. Die gemalten Bilder der Bücher --------------------------------------------
// Ein Buch mit «bilder» hat in seinem Ordner genau dies: einen Umschlag und ein
// Bild je Seite (1200 × 760, wie die Zeichnung 240 × 152 gross, nur feiner) und
// einen kleinen Umschlag fürs Regal (480 × 304) – alle WebP und so klein, dass
// ein Buch am Handy schnell da ist. Der Service Worker legt sie in einen Cache,
// der ein Update übersteht.
function webpMasse(daten) {
  if (daten.length < 30 || daten.toString("ascii", 0, 4) !== "RIFF" || daten.toString("ascii", 8, 12) !== "WEBP") return null;
  const art = daten.toString("ascii", 12, 16);
  if (art === "VP8 ") return { breite: daten.readUInt16LE(26) & 0x3fff, hoehe: daten.readUInt16LE(28) & 0x3fff };
  if (art === "VP8L") { const bits = daten.readUInt32LE(21); return { breite: (bits & 0x3fff) + 1, hoehe: ((bits >> 14) & 0x3fff) + 1 }; }
  if (art === "VP8X") return { breite: daten.readUIntLE(24, 3) + 1, hoehe: daten.readUIntLE(27, 3) + 1 };
  return null;
}
let gemalteBuecher = 0;
{
  const GROSS = { breite: 1200, hoehe: 760, kb: 160 };
  const KLEIN = { breite: 480, hoehe: 304, kb: 40 };
  bib.BUECHER.filter((buch) => buch.bilder !== undefined).forEach((buch) => {
    const wo = `Bilder von «${buch.titel}»`;
    pruefe(buch.bilder === `bilder/buecher/${buch.id}`, `${wo}: der Ordner heisst ${buch.bilder}, nicht bilder/buecher/${buch.id}`);
    const ordner = path.join(root, buch.bilder);
    if (!fs.existsSync(ordner)) { pruefe(false, `${wo}: der Ordner ${buch.bilder} fehlt`); return; }
    gemalteBuecher += 1;
    const soll = new Map([["umschlag.webp", GROSS], ["umschlag-klein.webp", KLEIN]]);
    buch.seiten.forEach((_, nr) => soll.set(`seite-${String(nr + 1).padStart(2, "0")}.webp`, GROSS));
    const da = fs.readdirSync(ordner);
    da.filter((name) => !soll.has(name)).forEach((name) => pruefe(false, `${wo}: ${name} gehört zu keiner Seite`));
    let summe = 0;
    soll.forEach((mass, name) => {
      const datei = path.join(ordner, name);
      if (!fs.existsSync(datei)) { pruefe(false, `${wo}: ${name} fehlt`); return; }
      const daten = fs.readFileSync(datei);
      summe += daten.length;
      const masse = webpMasse(daten);
      pruefe(masse, `${wo}: ${name} ist kein WebP`);
      if (masse) pruefe(masse.breite === mass.breite && masse.hoehe === mass.hoehe, `${wo}: ${name} ist ${masse.breite} × ${masse.hoehe} statt ${mass.breite} × ${mass.hoehe}`);
      pruefe(daten.length <= mass.kb * 1024, `${wo}: ${name} hat ${Math.round(daten.length / 1024)} KB, erlaubt sind ${mass.kb}`);
    });
    pruefe(summe <= 1.6 * 1024 * 1024, `${wo}: zusammen ${Math.round(summe / 1024)} KB – mehr als 1,6 MB lädt am Handy zu lange`);
  });
  const sw = lies("service-worker.js");
  pruefe(/const BUCHBILDER_CACHE = "lernapp-buchbilder-\d+";/.test(sw), "service-worker.js: der Cache der Buchbilder (BUCHBILDER_CACHE) fehlt");
  pruefe(sw.includes('requestUrl.pathname.includes("/bilder/buecher/")') && sw.includes("cacheFirst(event, BUCHBILDER_CACHE"), "service-worker.js: die Buchbilder gehen nicht in ihren eigenen Cache");
  pruefe(!sw.includes('startsWith("lernapp-buchbilder-") && key !== CACHE_NAME'), "service-worker.js: ein Update würde die Buchbilder löschen");
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
    // Schriftgrösse und Wort-Hilfe: ohne Einstellung normal und an, Unsinn ebenso.
    pruefe(stand.schriftGroesse() === "normal" && stand.wortHilfe() === true, "Lesestand: ohne Einstellung ist die Schrift nicht normal oder die Wort-Hilfe aus");
    const quer = stand.elternSauber({ groesse: "riesig", hilfe: "vielleicht" });
    pruefe(quer.groesse === "normal" && quer.hilfe === "an", `Lesestand: elternSauber lässt Unsinn bei Schriftgrösse oder Wort-Hilfe durch: ${JSON.stringify(quer)}`);
    store.set(stand.ELTERN_KEY, JSON.stringify({ startpunkt: "auto", schrift: "auto", groesse: "sehr-gross", hilfe: "aus", at: 7 }));
    pruefe(stand.schriftGroesse() === "sehr-gross" && stand.wortHilfe() === false, "Lesestand: die Schriftgrösse oder die Wort-Hilfe der Eltern gilt nicht");
    store.set(stand.ELTERN_KEY, JSON.stringify({ startpunkt: "auto", schrift: "auto", at: 8 }));

    // Die Runde auf Zeit: Sie zählt als Runde, ihr Ergebnis ist ein eigener
    // Bestwert (zeit) neben dem der gewöhnlichen Runde (best) – und eine
    // gewöhnliche Runde danach lässt ihn stehen.
    stand.zeitRunde("stimmtdas", { punkte: 11 });
    stand.zeitRunde("stimmtdas", { punkte: 7 });
    stand.spielRunde("stimmtdas", { punkte: 6 });
    const nachZeit = stand.stand().spiele.stimmtdas;
    pruefe(nachZeit.runden === 3 && nachZeit.zeit === 11 && nachZeit.best === 6, `Lesestand: die Runde auf Zeit wird falsch eingetragen: ${JSON.stringify(nachZeit)}`);
    const z1 = { spiele: { stimmtdas: { runden: 2, best: 7, zeit: 9, zuletzt: 1 } } };
    const z2 = { spiele: { stimmtdas: { runden: 3, best: 5, zuletzt: 2 }, silbenzug: { runden: 1, best: 4, zuletzt: 1 } } };
    const mz = stand.merge(z1, z2);
    pruefe(mz.spiele.stimmtdas.zeit === 9 && mz.spiele.stimmtdas.best === 7 && mz.spiele.stimmtdas.runden === 3 && !("zeit" in mz.spiele.silbenzug),
      `Lesestand: der Bestwert auf Zeit wird nicht richtig zusammengeführt: ${JSON.stringify(mz.spiele)}`);
    const sortiert = (x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sortiert(x[k])])) : x);
    pruefe(JSON.stringify(sortiert(mz)) === JSON.stringify(sortiert(stand.merge(z2, z1))), "Lesestand: mit Bestwert auf Zeit ist merge(a, b) nicht dasselbe wie merge(b, a)");

    // Mitwachsen: Zwei Runden mit drei Sternen hintereinander machen ein Spiel
    // eine Stufe schwerer, zwei schwache eine leichter, zwei Sterne beginnen
    // die Serie neu – nie über «schwer», nie unter «leicht». In der Sandbox
    // gibt es keine Reise: Die Stufe des Kindes ist «mittel».
    const sb = () => stand.stufe("silbenbahn");
    const runde = (sterne) => stand.spielRunde("silbenbahn", { punkte: 5, sterne });
    pruefe(stand.grundstufe() === "mittel" && sb() === "mittel", `Mitwachsen: ohne Runden steht die Silbenbahn auf ${sb()}`);
    runde(3);
    pruefe(sb() === "mittel", "Mitwachsen: schon nach einer Runde mit drei Sternen schwerer");
    runde(3);
    pruefe(sb() === "schwer" && stand.stufe() === "mittel" && stand.stufe("silbenzug") === "mittel", `Mitwachsen: nach zwei Runden mit drei Sternen ${sb()}, das Kind ${stand.stufe()}`);
    runde(3);
    runde(3);
    pruefe(sb() === "schwer" && stand.stand().spiele.silbenbahn.schritt === 1, `Mitwachsen: über «schwer» hinaus (${JSON.stringify(stand.stand().spiele.silbenbahn)})`);
    runde(1);
    runde(2);
    runde(1);
    pruefe(sb() === "schwer", "Mitwachsen: zwei Sterne dazwischen beginnen die Serie nicht neu");
    runde(1);
    pruefe(sb() === "mittel", `Mitwachsen: nach zwei schwachen Runden noch ${sb()}`);
    runde(1);
    runde(1);
    runde(1);
    runde(1);
    pruefe(sb() === "leicht" && stand.stand().spiele.silbenbahn.schritt === -1, `Mitwachsen: unter «leicht» (${JSON.stringify(stand.stand().spiele.silbenbahn)})`);
    stand.spielRunde("buchprobe", { punkte: 3 });
    stand.spielRunde("buchprobe", { punkte: 3 });
    pruefe(!("schritt" in stand.stand().spiele.buchprobe), "Mitwachsen: eine Runde ohne Sterne (ein Buch) bekommt eine Stufe");
    // Zwischen zwei Geräten gilt der Schritt des Geräts, das zuletzt gespielt
    // hat – auch wenn er kleiner ist.
    const frueher = { spiele: { silbenbahn: { runden: 3, best: 8, zuletzt: 10, schritt: 1, serie: 0 } } };
    const spaeter = { spiele: { silbenbahn: { runden: 5, best: 6, zuletzt: 20, schritt: -1, serie: -1 } } };
    const mw = stand.merge(frueher, spaeter);
    pruefe(mw.spiele.silbenbahn.schritt === -1 && mw.spiele.silbenbahn.serie === -1 && mw.spiele.silbenbahn.runden === 5 && mw.spiele.silbenbahn.best === 8,
      `Mitwachsen: zusammengeführt steht ${JSON.stringify(mw.spiele.silbenbahn)}`);
    pruefe(JSON.stringify(sortiert(mw)) === JSON.stringify(sortiert(stand.merge(spaeter, frueher))) && JSON.stringify(sortiert(stand.merge(mw, mw))) === JSON.stringify(sortiert(mw)),
      "Mitwachsen: das Zusammenführen ist nicht in beide Richtungen gleich oder nicht stabil");
    // Was keine Stufen kennt, wächst nicht mit – und die Liste stimmt mit der
    // Quelle: Ein Spiel fragt nach seiner Stufe (stufe?.(ID)) genau dann,
    // wenn es nicht ohneStufe heisst.
    stand.spielRunde("buchstabengleis", { punkte: 6, sterne: 3 });
    stand.spielRunde("buchstabengleis", { punkte: 6, sterne: 3 });
    pruefe(!("schritt" in stand.stand().spiele.buchstabengleis), "Mitwachsen: das Buchstabengleis hat keine Stufen und wächst trotzdem");
    Object.entries(stand.SPIELE).forEach(([id, spiel]) => {
      const datei = spiel.page.replace(/\.html.*$/, ".js");
      const fragt = fs.existsSync(path.join(root, datei)) && lies(datei).includes("stand?.stufe?.(ID)");
      pruefe(fragt === !spiel.ohneStufe, `Mitwachsen: ${id} ${fragt ? "fragt nach seiner Stufe, heisst aber ohneStufe" : "fragt nicht nach seiner Stufe, wächst aber mit"}`);
    });
    const angepasst = stand.bericht({ spiele: { silbenbahn: { runden: 4, schritt: 1 }, stimmtdas: { runden: 2, schritt: -1 }, silbenzug: { runden: 1, schritt: 0 } } }).angepasst;
    pruefe(angepasst.map((a) => `${a.titel}:${a.richtung}`).join(",") === "Silbenbahn:schwerer,Stimmt das?:leichter", `Mitwachsen: im Bericht ${JSON.stringify(angepasst)}`);
    // Was als Nächstes dran ist, gibt es auch.
    for (const [stufe, liste] of Object.entries(stand.AUSWAHL)) {
      pruefe(stand.STARTPUNKTE.includes(stufe), `Lesestand: AUSWAHL kennt die Stufe ${stufe} nicht`);
      liste.forEach((id) => pruefe(stand.SPIELE[id] && fs.existsSync(path.join(root, stand.SPIELE[id].page.split("?")[0])), `Lesestand: das Spiel ${id} hat keine Seite`));
    }
    pruefe(Boolean(stand.SPIELE[stand.naechstes().id]), "Lesestand: naechstes() führt ins Leere");
    // Jedes Spiel steht hinter einem Ding im Zimmer, und die Schranke kennt
    // jedes – ausser dem Bücherregal, das keine Runden hat.
    const ORTE = ["silben", "buchstaben", "woerter", "saetze", "buecher", "detektiv"];
    const gesperrt = new Set([...(lies("entitlement.js").match(/const LESEECKE = \{[\s\S]*?\] \};/)?.[0] || "").matchAll(/page: "([a-z]+\.html)"/g)].map((m) => m[1]));
    Object.entries(stand.SPIELE).forEach(([id, spiel]) => {
      pruefe(ORTE.includes(spiel.ort), `Lesestand: ${id} steht an keinem Ort im Zimmer (${spiel.ort})`);
      pruefe(Boolean(spiel.bild && spiel.titel), `Lesestand: ${id} ohne Bild oder Titel`);
      if (id !== "buecher") pruefe(gesperrt.has(spiel.page), `entitlement.js: LESEECKE kennt ${spiel.page} nicht – das Spiel wäre unbegrenzt frei`);
    });
    gesperrt.forEach((page) => pruefe(Object.values(stand.SPIELE).some((spiel) => spiel.page === page), `entitlement.js: ${page} steht in LESEECKE, aber nicht im Katalog`));
    // Blitzwörter: dieselbe Regel wie bei den Lauten.
    const b1 = stand.merge({ blitz: { und: { r: 1, f: 2, tage: ["2026-10-01"] } } }, { blitz: { und: { r: 3, f: 0, tage: ["2026-10-02"] } } });
    pruefe(b1.blitz.und.r === 3 && b1.blitz.und.f === 2 && b1.blitz.und.tage.length === 2 && stand.blitzSitzt("und", b1), `Lesestand: Blitzwörter werden nicht zusammengeführt: ${JSON.stringify(b1.blitz)}`);
    stand.blitzGeuebt("ist", true);
    stand.blitzGeuebt("ist", false);
    const ist = stand.stand().blitz.ist;
    pruefe(ist?.r === 1 && ist?.f === 1, `Lesestand: blitzGeuebt zählt nicht: ${JSON.stringify(ist)}`);

    // Die Buchstaben der Schule: aufgeräumt, leer heisst «nichts abgehakt».
    const schule = stand.elternSauber({ bekannt: ["M", "a", "a", "sch", "x1", "", 7, "<b>"] });
    pruefe(JSON.stringify(schule.bekannt) === JSON.stringify(["m", "a", "sch"]), `Lesestand: elternSauber räumt die Buchstaben nicht auf: ${JSON.stringify(schule.bekannt)}`);
    pruefe(stand.elternSauber({ bekannt: [] }).bekannt === null && stand.elternSauber({}).bekannt === null && stand.elternSauber({ bekannt: "m" }).bekannt === null,
      "Lesestand: eine leere oder kaputte Liste der Buchstaben gilt nicht als «nichts abgehakt»");
    pruefe(stand.bekannteLaute() === null, "Lesestand: ohne Haken kennt das Kind trotzdem Buchstaben");
    store.set(stand.ELTERN_KEY, JSON.stringify({ startpunkt: "auto", schrift: "auto", bekannt: ["m", "a", "l"], at: 7 }));
    const bekannt = stand.bekannteLaute();
    pruefe(typeof bekannt?.has === "function" && bekannt.has("l") && bekannt.size === 3, "Lesestand: bekannteLaute() gibt die abgehakten Laute nicht zurück");

    // Der Name des Lesewurms: aufgeräumt, die neuere Taufe gilt, in beide
    // Richtungen gleich.
    pruefe(stand.nameSauber("  anna-lena ") === "Anna-Lena" && stand.nameSauber("mia3") === "Mia" && stand.nameSauber("123") === "" && stand.nameSauber("x".repeat(30)).length === 16,
      `Lesestand: nameSauber räumt nicht auf (${stand.nameSauber("  anna-lena ")}, ${stand.nameSauber("mia3")})`);
    const t1 = { wurm: { name: "Moli", at: 5 } };
    const t2 = { wurm: { name: "Tika", at: 9 } };
    pruefe(stand.merge(t1, t2).wurm?.name === "Tika" && stand.merge(t2, t1).wurm?.name === "Tika", "Lesestand: beim Zusammenführen gilt nicht die neuere Taufe");
    const gleichzeitig = [{ wurm: { name: "Moli", at: 5 } }, { wurm: { name: "Bodo", at: 5 } }];
    pruefe(JSON.stringify(stand.merge(...gleichzeitig).wurm) === JSON.stringify(stand.merge(...gleichzeitig.reverse()).wurm), "Lesestand: zwei Taufen zur selben Zeit ergeben je nach Richtung einen anderen Namen");
    pruefe(stand.merge({ wurm: { name: "<>", at: 99 } }, t1).wurm?.name === "Moli", "Lesestand: ein Name ohne Buchstaben verdrängt den richtigen");
    pruefe(stand.wurmName() === "", "Lesestand: der Lesewurm hat einen Namen, bevor ihn jemand getauft hat");
    stand.wurmTaufen("wumpi");
    pruefe(stand.wurmName() === "Wumpi" && stand.stand().wurm?.at > 0, `Lesestand: wurmTaufen tauft nicht (${stand.wurmName()})`);

    // Verwechslungen: als Paar gezählt, egal in welcher Richtung; Unsinn
    // fällt weg, und beim Zusammenführen gilt das Maximum je Paar.
    stand.verwechselt("d", "b");
    stand.verwechselt("b", "d");
    stand.verwechselt("m", "m");
    stand.verwechselt("<x>", "b");
    pruefe(JSON.stringify(stand.stand().verwechselt) === JSON.stringify({ "b|d": 2 }), `Lesestand: verwechselt zählt nicht paarweise: ${JSON.stringify(stand.stand().verwechselt)}`);
    const v = stand.merge({ verwechselt: { "b|d": 2, "m|n": 1, "Quatsch": 5 } }, { verwechselt: { "b|d": 3, "a|o": 1 } });
    pruefe(JSON.stringify(v.verwechselt) === JSON.stringify(stand.merge({ verwechselt: { "b|d": 3, "a|o": 1 } }, { verwechselt: { "b|d": 2, "m|n": 1, "Quatsch": 5 } }).verwechselt)
      && v.verwechselt["b|d"] === 3 && v.verwechselt["m|n"] === 1 && !("Quatsch" in v.verwechselt), `Lesestand: Verwechslungen werden nicht zusammengeführt: ${JSON.stringify(v.verwechselt)}`);
    const viele = {};
    for (let i = 0; i < 40; i += 1) viele[`a|${"bcdefghijklmnopqrstuvwxyz"[i % 25]}${i >= 25 ? "h" : ""}`] = i + 1;
    pruefe(Object.keys(stand.merge({ verwechselt: viele }, {}).verwechselt).length <= 24, "Lesestand: die Verwechslungen wachsen ohne Grenze");

    // Der Lesewagen: fünfzehn Dinge, eines je Schwelle an gelesenen Stücken
    // (Runden und Bücher), nie mehr, nie weniger.
    pruefe(stand.WAGEN_SCHRITTE.length === 15 && stand.WAGEN_SCHRITTE.every((x, i, a) => i === 0 || x > a[i - 1]), "Lesestand: WAGEN_SCHRITTE sind nicht fünfzehn steigende Schwellen");
    const mit = (runden, buecher = 0) => ({ spiele: { silbenzug: { runden } }, buecher: buecher ? { x: { mal: buecher } } : {} });
    pruefe(stand.wagenStufe(mit(0)) === 0 && stand.wagenStufe(mit(1)) === 1 && stand.wagenStufe(mit(3, 1)) === 3 && stand.wagenStufe(mit(stand.WAGEN_SCHRITTE[14] - 1)) === 14 && stand.wagenStufe(mit(500, 9)) === 15,
      "Lesestand: wagenStufe zählt Runden und Bücher nicht nach den Schwellen");

    // Der Bericht für die Eltern.
    const br = stand.bericht({
      woerter: 340,
      laute: { m: { r: 4, f: 0, tage: ["2026-10-01", "2026-10-03"] }, a: { r: 3, f: 1, tage: ["2026-10-02", "2026-10-04"] }, b: { r: 1, f: 2, tage: ["2026-10-04"] }, s: { r: 1, f: 0, tage: ["2026-10-04"] } },
      buecher: { y: { mal: 2, sterne: 3 }, z: { mal: 1, sterne: 2 } },
      spiele: { silbenzug: { runden: 5 }, buchstabenhaus: { runden: 2 }, reimkupplung: { runden: 0 }, stolperwoerter: { runden: 0, zeit: 8 } },
      blitz: { und: { r: 3, tage: ["2026-10-01", "2026-10-02"] } },
      verwechselt: { "b|d": 3, "m|n": 1 },
    });
    pruefe(br.woerter === 340 && br.buecher === 2 && br.buecherGold === 1 && br.runden === 7 && br.wagen === 5 && br.blitzSicher === 1,
      `Lesestand: der Bericht zählt falsch: ${JSON.stringify(br)}`);
    pruefe(br.sicher.join(",") === "m,a" && br.wackelig.join(",") === "b", `Lesestand: sichere ${br.sicher} oder wackelige Laute ${br.wackelig} falsch (s ist nur geübt)`);
    pruefe(br.verwechslungen.length === 1 && br.verwechslungen[0].paar.join("|") === "b|d" && br.verwechslungen[0].mal === 3, `Lesestand: Verwechslungen im Bericht: ${JSON.stringify(br.verwechslungen)}`);
    pruefe(br.spiele.map((x) => `${x.id}:${x.runden}`).join(",") === "silbenzug:5,buchstabenhaus:2" && br.spiele[0].titel === "Silbenzug", `Lesestand: Spiele im Bericht: ${JSON.stringify(br.spiele)}`);
    pruefe(br.zeit.length === 1 && br.zeit[0].titel === "Stolperwörter" && br.zeit[0].best === 8, `Lesestand: der Bestwert auf Zeit im Bericht: ${JSON.stringify(br.zeit)}`);
    pruefe(stand.bericht({}).woerter === 0 && stand.bericht(null).sicher.length === 0, "Lesestand: ein leerer Kasten gibt keinen leeren Bericht");
  }
}

// --- 4b. Was ein Kind mit den Buchstaben der Schule lesen kann ---------------------
{
  // Der Elternbereich führt eine Kopie der Reihenfolge (firebase.js): Sie
  // muss dieselbe sein wie LAUTE, sonst fehlt ein Haken oder einer zielt ins
  // Leere.
  const kopie = lies("firebase.js").match(/const LESEN_LAUTE = \[([\s\S]*?)\];/)?.[1] || "";
  const ids = [...kopie.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  pruefe(JSON.stringify(ids) === JSON.stringify(inhalte.LAUTE.map((l) => l.id)),
    `firebase.js: LESEN_LAUTE ist nicht dieselbe Reihenfolge wie LAUTE (${ids.join(" ")})`);

  const menge = (...liste) => new Set(liste);
  // Was alle Laute lesen kann, liest jedes Wort; ohne Haken bleibt die Liste.
  const alle = menge(...inhalte.LAUTE.map((l) => l.id));
  pruefe(inhalte.lesbare(inhalte.KUPPEL_WOERTER, alle, 6).length === inhalte.KUPPEL_WOERTER.length, "lesbare: mit allen Lauten fehlen Kuppel-Wörter");
  pruefe(inhalte.lesbare(inhalte.KUPPEL_WOERTER, null, 6) === inhalte.KUPPEL_WOERTER, "lesbare: ohne Haken ändert sich die Liste");
  // Die ersten zehn der Reihe: nur Wörter aus diesen Lauten.
  const zehn = menge(...inhalte.LAUTE.slice(0, 10).map((l) => l.id));
  const lesbar = inhalte.lesbare(inhalte.KUPPEL_WOERTER, zehn, 5);
  pruefe(lesbar.length >= 5, `lesbare: mit den ersten zehn Lauten nur ${lesbar.length} Kuppel-Wörter`);
  lesbar.forEach((w) => pruefe(inhalte.fehlendeLaute(w.silben, zehn).length === 0, `lesbare: «${w.wort}» braucht ${inhalte.fehlendeLaute(w.silben, zehn).join(", ")}`));
  // Zu wenig bekannt: aufgefüllt mit denen, denen am wenigsten fehlt.
  const zwei = inhalte.lesbare(inhalte.KUPPEL_WOERTER, menge("m", "a"), 6);
  pruefe(zwei.length === 6, `lesbare: mit M und A ist die Runde nicht aufgefüllt (${zwei.length} Wörter)`);
  const fehlen = zwei.map((w) => inhalte.fehlendeLaute(w.silben, menge("m", "a")).length);
  pruefe(fehlen.every((n, i) => i === 0 || n >= fehlen[i - 1]), `lesbare: aufgefüllt wird nicht mit den nächstliegenden Wörtern (${fehlen.join(", ")})`);
  // Das Buchstabenhaus: genau die bekannten, in der festen Reihenfolge, aber
  // mindestens vier.
  const haus = inhalte.hausLaute(menge("s", "m", "ei", "o", "r"), 3).map((l) => l.id);
  pruefe(JSON.stringify(haus) === JSON.stringify(["m", "o", "s", "r", "ei"]), `hausLaute: ${haus.join(" ")} statt m o s r ei`);
  const wenig = inhalte.hausLaute(menge("sch"), 3).map((l) => l.id);
  pruefe(wenig.length === 4 && wenig.includes("sch") && wenig[0] === "m", `hausLaute: mit nur Sch wohnen ${wenig.join(" ")} im Haus`);
  pruefe(inhalte.hausLaute(null, 3).length === inhalte.lauteBisGruppe(3).length, "hausLaute: ohne Haken gilt die Reihenfolge nach der Stufe nicht");
}

// --- 5. Die Seiten ------------------------------------------------------------------
{
  const GEMEINSAM = ["entitlement.js", "kids.js", "train-art.js", "train-scenes.js", "game-cloud.js", "lesen-inhalte.js", "lesen-stand.js", "lesen-laute.js", "lesen-ton.js", "lesen-art.js", "game-shell.js", "lesen-spiel.js"];
  const SEITEN = {
    silbenzug: [], buchstabenhaus: [], lautekuppeln: [], stimmtdas: [], buecher: ["lesen-buecher.js", "lesen-bilder.js"],
    reimkupplung: [], anlautlauscher: [], werfaehrtmit: [], woerterbauen: [], silbenbahn: [], blitzwoerter: [],
    meinname: [], lueckensaetze: [], buchstabengleis: [],
    satzkuppeln: [], quatschsaetze: [], stolperwoerter: ["lesen-buecher.js"], quatschwoerter: [],
    lautposition: [], buchstabensignal: [], liesundtu: [],
    geschichtenzug: ["lesen-buecher.js", "lesen-bilder.js"],
    werbinich: [], wortbaustelle: [],
    steckbriefe: ["lesen-detektive.js"], detektivfaelle: ["lesen-detektive.js"], postkarten: ["lesen-detektive.js", "lesen-bilder.js"],
  };
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
    "./lesen-ton.js${", "./lesen-art.js${", "./lesen-spiel.js${", "./lesen-buecher.js${", "./lesen-bilder.js${", "./lesen-detektive.js${", "./train-leseecke.js${"].forEach((eintrag) => {
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

// --- 6b. Eigene Namen für die Klassen -------------------------------------------------
// Jedes Spiel hat ein Kürzel für seine Klassen. Benutzt ein anderes Spiel
// dasselbe, greifen die Regeln des einen beim anderen: «Wer fährt mit?» hatte
// einmal wf- wie «Was fehlt?», und dessen Startknopf rutschte aus dem Bild.
{
  const KUERZEL = { "lesen-spiel.js": "lese", "buchstabenhaus.js": "bh", "lautekuppeln.js": "kp", "stimmtdas.js": "sd", "buecher.js": "bu",
    "reimkupplung.js": "rk", "anlautlauscher.js": "al", "werfaehrtmit.js": "wm", "woerterbauen.js": "wb", "silbenbahn.js": "sb", "blitzwoerter.js": "bw",
    "meinname.js": "mn", "lueckensaetze.js": "ls", "buchstabengleis.js": "bg",
    "satzkuppeln.js": "sk", "quatschsaetze.js": "qs", "stolperwoerter.js": "sw", "quatschwoerter.js": "qw",
    "lautposition.js": "lp", "buchstabensignal.js": "bsg", "liesundtu.js": "lt",
    "geschichtenzug.js": "gz", "werbinich.js": "wi", "wortbaustelle.js": "ws",
    "steckbriefe.js": "stb", "detektivfaelle.js": "df", "postkarten.js": "pk" };
  const eigene = new Set(Object.keys(KUERZEL));
  const fremde = fs.readdirSync(root).filter((name) => name.endsWith(".js") && !eigene.has(name) && !name.startsWith("lesen-") && name !== "train-leseecke.js" && name !== "laute-aufnehmen.js" && name !== "silbenzug.js");
  Object.entries(KUERZEL).forEach(([datei, kuerzel]) => {
    pruefe(new RegExp(`["' ]${kuerzel}-[a-z]`).test(lies(datei)), `${datei}: benutzt das Kürzel ${kuerzel}- nicht – stimmt die Liste?`);
    const muster = new RegExp(`["'. ]${kuerzel}-[a-z]`);
    fremde.forEach((fremd) => pruefe(!muster.test(lies(fremd)), `${fremd} benutzt Klassen mit ${kuerzel}- – wie ${datei}; die Regeln des einen greifen beim anderen`));
  });
}

// --- 7. Schweizer Rechtschreibung ----------------------------------------------------
{
  const dateien = ["lesen-inhalte.js", "lesen-buecher.js", "lesen-stand.js", "lesen-ton.js", "lesen-art.js", "lesen-spiel.js", "lesen-laute.js", "train-leseecke.js",
    "silbenzug.js", "buchstabenhaus.js", "lautekuppeln.js", "stimmtdas.js", "buecher.js",
    "silbenzug.html", "buchstabenhaus.html", "lautekuppeln.html", "stimmtdas.html", "buecher.html",
    "reimkupplung.js", "anlautlauscher.js", "werfaehrtmit.js", "woerterbauen.js", "silbenbahn.js", "blitzwoerter.js",
    "reimkupplung.html", "anlautlauscher.html", "werfaehrtmit.html", "woerterbauen.html", "silbenbahn.html", "blitzwoerter.html",
    "meinname.js", "meinname.html", "lueckensaetze.js", "lueckensaetze.html", "buchstabengleis.js", "buchstabengleis.html",
    "satzkuppeln.js", "satzkuppeln.html", "quatschsaetze.js", "quatschsaetze.html", "stolperwoerter.js", "stolperwoerter.html", "quatschwoerter.js", "quatschwoerter.html",
    "lautposition.js", "lautposition.html", "buchstabensignal.js", "buchstabensignal.html", "liesundtu.js", "liesundtu.html",
    "geschichtenzug.js", "geschichtenzug.html", "lesen-bilder.js",
    "werbinich.js", "werbinich.html", "wortbaustelle.js", "wortbaustelle.html",
    "lesen-detektive.js", "steckbriefe.js", "steckbriefe.html", "detektivfaelle.js", "detektivfaelle.html", "postkarten.js", "postkarten.html",
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
console.log(`Die Leseecke stimmt: ${inhalte.LAUTE.length} Laute (${aufgenommen} aufgenommen), ${inhalte.SILBEN_WOERTER.length + inhalte.KUPPEL_WOERTER.length} Wörter, ${bib.BUECHER.length} Bücher mit ${bib.BUECHER.reduce((n, b) => n + b.fragen.length, 0)} Fragen (${gemalteBuecher} mit gemalten Bildern), der Lesestand, die Seiten und die Aufnahmeseite.`);
