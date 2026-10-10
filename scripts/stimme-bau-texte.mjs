/*
 * Was die Bauecke sagt – Satz für Satz, für die Aufnahmen mit einer Stimme von
 * Google (scripts/stimme-google.mjs, docs/STIMME-GOOGLE.md).
 * ---------------------------------------------------------------------------
 * Die Bauecke spricht bei jedem Tipp (train-bau.js, sag): den Namen eines
 * Dings, eines Zimmers, eine Farbe, einen Wunsch, die Hilfe. Fast alles davon
 * steht nicht wörtlich im Code, sondern entsteht aus dem Katalog
 * (bau-katalog.js, bau-moebel*.js) und ein paar Satzmustern. Hier werden
 * diese Muster nachgebaut und über den Katalog ausgerechnet.
 *
 * Gezählt wird in Sätzen, weil kids.js (aufnahmeStuecke) einen Text an den
 * Satzenden teilt und je Satz eine Aufnahme sucht: «Das Badezimmer. Hier wird
 * geduscht.» braucht keine eigene Aufnahme, wenn beide Sätze eine haben. Was
 * fehlt, spricht die Gerätestimme – eine Lücke hier ist also kein Fehler, nur
 * ein Satz ohne Aufnahme.
 *
 * Drei Teile:
 *   kern    feste Sätze und der Katalog: Dinge, Zimmer, Farben, Wünsche, Hilfe
 *   namen   Sätze mit genau einem Tiernamen («Willkommen, Flora!»)
 *   zahlen  Sätze mit einer Zahl (Ziegel, Sterne, Stockwerke)
 * Zwei Wechselnde in einem Satz («Flora und Benno», «8 von 22 Sternen») gäbe
 * es Hunderttausende Male. Darum sagt die Bauecke so etwas in Stücken mit je
 * einem Wechselnden («Hier wohnt Flora. Benno wohnt auch hier.»), und kids.js
 * teilt auch hinter einem Doppelpunkt («Flora:» und «Juhu, ein Bett!»). Ob die
 * Bauecke wirklich überall eine Aufnahme hat, prüft
 * scripts/check-bau-stimme.mjs im Browser.
 *
 * Ändert sich ein Satzmuster in train-bau.js, gehört es auch hier geändert.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { WURZEL, sprechText, mp3Rahmen, dateiFuer as dateiIn } from "./stimme-texte.mjs";

export const ORDNER = "stimme/google";
export const VERZEICHNIS = "bau-stimme.js";
export const dateiFuer = (text) => dateiIn(text, ORDNER);

const lies = (name) => fs.readFileSync(path.join(WURZEL, name), "utf8");

// Ob eine Aufnahme so lang ist, wie ihr Satz es verlangt: rund 14 Zeichen in
// der Sekunde; ein einzelnes Wort darf etwas länger sein. Beim Vertonen
// (stimme-google.mjs) und in der Prüfung (validate-bau.mjs).
export function passtZumText(sekunden, text) {
  // Eine Silbe («Ha», «he») darf kürzer sein als ein Satz.
  if (!(sekunden >= (text.length <= 3 ? 0.15 : 0.25))) return false;
  if (sekunden > Math.max(1.6, text.length * 0.2)) return false;
  return text.length < 15 || sekunden >= text.length * 0.025;
}

// Wie lang eine MP3 spielt, gezählt in ihren Rahmen – ohne den ersten, den
// Kopf des Encoders. Beim Vertonen und in der Prüfung gleich gemessen.
export function sekundenVon(daten) {
  const rahmen = mp3Rahmen(daten);
  return rahmen ? rahmen.slice(1).reduce((summe, r) => summe + (r.version === 3 ? 1152 : 576) / r.rate, 0) : 0;
}

// Wie kids.js (saetzeVon): geteilt hinter . ! ? … (und einem schliessenden
// Anführungszeichen), wo ein Leerzeichen folgt – nicht hinter einer Zahl
// («der 3. Stock»). Hinter einem Doppelpunkt teilt kids.js auch; aufgenommen
// werden hier aber ganze Sätze, und wo vorne ein Name steht («Flora:»), steht
// dieses Stück eigens in der Liste.
export function saetzeVon(text) {
  const teile = [];
  const muster = /[.!?…]+[»"]?(?=\s)/g;
  let anfang = 0;
  let treffer;
  while ((treffer = muster.exec(text))) {
    if (/\d$/.test(text.slice(anfang, treffer.index)) && treffer[0] === ".") continue;
    const ende = treffer.index + treffer[0].length;
    teile.push(text.slice(anfang, ende).trim());
    anfang = ende;
  }
  teile.push(text.slice(anfang).trim());
  return teile.filter(Boolean);
}

// Katalog und Dinge, wie index.html sie lädt.
const GRUPPEN = ["wohnen", "haus", "spital", "station", "laeden", "dienste", "freizeit", "buero", "arbeit", "dome"];
function katalog() {
  const fenster = { addEventListener() {}, location: { search: "" } };
  fenster.window = fenster;
  const ctx = vm.createContext({ window: fenster, document: { addEventListener() {} }, console });
  for (const datei of ["bau-moebel.js", ...GRUPPEN.map((g) => `bau-moebel-${g}.js`), "bau-katalog.js"]) {
    vm.runInContext(lies(datei), ctx, { filename: datei });
  }
  return { M: fenster.LernappBauMoebel, K: fenster.LernappBauKatalog };
}

const gross = (wort) => (wort ? wort.charAt(0).toUpperCase() + wort.slice(1) : "");
const den = (der) => der.replace(/^der /, "den ");
const pronomen = (der) => ({ der: "Er", die: "Sie", das: "Es" })[String(der).split(" ")[0]] || "Es";
const sterneWort = (n) => (n === 1 ? "einen Stern" : `${n} Sterne`);
const nochSterne = (n) => (n === 1 ? "ein Stern" : `${n} Sterne`);

// Die festen Sätze aus train-bau.js: Zeichenketten in Zeilen, die etwas
// sagen. Vorlagen in `…` fallen weg – die rechnen die Muster unten aus.
function festeSaetze(quelle) {
  const saetze = [];
  for (const zeile of quelle.split("\n")) {
    if (!/\bsag\(|\bhilfe\(|aendereDing\(|frage: |text: "/.test(zeile)) continue;
    const ohneVorlagen = zeile.replace(/`(?:[^`\\]|\\.)*`/g, "``");
    for (const m of ohneVorlagen.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      const s = JSON.parse(`"${m[1]}"`);
      if (/^[A-ZÄÖÜ]/.test(s) && /\s/.test(s) && /[.!?]$/.test(s) && !/[<>=]/.test(s)) saetze.push(s);
    }
  }
  return saetze;
}

// [{ text, wo, teil }] – jeder Satz einmal, beim ersten Vorkommen; ein Satz,
// der auch im Kern vorkommt, gehört zum Kern.
export function bauTexte() {
  const { M, K } = katalog();
  const liste = new Map();
  const RANG = { kern: 0, zahlen: 1, namen: 2 };
  const dazu = (text, teil, wo) => {
    for (const satz of saetzeVon(sprechText(text))) {
      const alt = liste.get(satz);
      if (!alt || RANG[teil] < RANG[alt.teil]) liste.set(satz, { text: satz, wo, teil });
    }
  };
  const imRaum = (id) => {
    const raum = K.RAEUME[id];
    if (!raum) return "";
    if (id === "toiletten") return "in den Toiletten";
    const [artikel, ...rest] = raum.der.split(" ");
    return artikel === "die" ? `in der ${rest.join(" ")}` : `im ${rest.join(" ")}`;
  };
  const jobText = (id) => {
    const raum = K.RAEUME[id];
    return raum?.job ? `${gross(raum.job)} ${imRaum(id)} (${K.HAUS[raum.haus].name})` : "";
  };

  // --- Kern: was train-bau.js wörtlich sagt
  festeSaetze(lies("train-bau.js")).forEach((s) => dazu(s, "kern", "train-bau.js"));
  ["Umgedreht.", "Kleiner.", "Grösser.", "Nach vorne.", "Nach hinten.", "Rückgängig.", "Abgebrochen.", "Schön!", "Licht an.", "Licht aus.",
    "Juhui!", "Da kommt jemand!", "Danke!", "Juhu, meine Lieblingsfarbe!", "Das Ding ist weg.", "Das ganze Haus.", "Wieder näher heran.",
    "Zwei Zimmer nebeneinander: zum Beispiel Küche und Bad, Wohnzimmer oder Waschküche.",
    "Bald zieht jemand Neues ein.", "Dann kommt bald ein neues Tier.", "Oben wechselst du zu den Mitbewohnern.",
    "Ist das Vorlesen an, liest ein Tipp auf einen Text ihn vor.", "Richte im Spital, im Dorf oder im Büro ein Zimmer ein!",
    "Dort ist gerade kein Platz frei.", "Das hast du schon erfüllt!", "Ein Tier wohnt im Wohnhaus.",
    "Noch wohnt niemand im Wohnhaus. Richte dort eine Wohnung ein – dann zieht bald jemand ein!",
    "Eines hat schon alle Sterne.", "Noch keines hat seinen Traumjob.", "Eines hat seinen Traumjob.",
    "Die ganze Sternenleiter ist geschafft – das Dorf funkelt!", "Sternenleiter des Dorfs", "Alle Bewohner",
    "Bunte Bilder: Das wünscht sich das Tier noch. Mit Haken: schon erfüllt. Gelb für die Wohnung, grün für das Wohnhaus, blau für die anderen Häuser.",
    "Gelbe Sterne: Wünsche für die Wohnung. Grüne: für das Wohnhaus. Blaue: für die anderen Häuser.",
    "Was Tiere mögen", "Licht, Bilder, Pflanzen", "Wand anmalen", "Boden", "Was wird das neue Stockwerk?",
    "Noch ein Wunsch – unten steht, welche.", ...[2, 3, 4, 5].map((n) => `Noch ${n} Wünsche – unten steht, welche.`),
    "Wohnung.", "Zwei Zimmer.", "Hauswand", "Dach", "Juhu, danke!", "Schau dir ihre Wohnung im Wohnhaus an!",
    "Ein Stern fehlt noch.", "Mehr gibt es gerade nicht.",
    "Alle vier Häuser.", "Tippe auf ein Haus, dann bist du dort.",
  ].forEach((s) => dazu(s, "kern", "train-bau.js"));

  // Die Häuser (hilfeHaus, Hauswahl, Reiter)
  K.HAEUSER.forEach((haus) => {
    const wohnen = haus.id === "wohnhaus" ? " In den Wohnungen wohnen die Tiere; tippe auf die Sterne am Lift, und du siehst, was sie sich wünschen." : "";
    dazu(`Das ist ${haus.der}. Tippe auf ein Zimmer, um es einzurichten.${wohnen} Für ein neues Stockwerk brauchst du Ziegel: Tippe auf den Rätsel-Knopf. Mit dem Pfeil-Knopf stellst du die Stockwerke um. Oben wechselst du zwischen den vier Häusern. Der Bewohner-Knopf links zeigt dir alle Tiere auf einen Blick.`, "kern", "Hilfe im Haus");
    dazu(haus.der, "kern", "Haus antippen");
    dazu(`${haus.der}. ${haus.text}`, "kern", "Hauswahl");
    dazu(`${haus.der}! Tippe auf ein Stockwerk und wähle, was es werden soll.`, "kern", "Hauswahl");
    dazu(`Ein neues Zimmer ${haus.im}`, "kern", "Zimmerwahl");
    dazu(`${haus.name} anmalen`, "kern", "Fassade");
  });
  // Zwei Zimmer auf einem Stockwerk des Wohnhauses (stockName): «Der 3.
  // Stock:» und dann beide Zimmer.
  const zweiZimmer = K.HAUS.wohnhaus.raeume.filter((id) => !K.RAEUME[id].wohnen).map((id) => K.RAEUME[id]);
  zweiZimmer.forEach((a) => zweiZimmer.forEach((b) => { if (a !== b) dazu(`${a.der} und ${b.der}.`, "kern", "Stockwerk"); }));

  // Die Zimmer
  K.RAEUME_LISTE.forEach((raum) => {
    const haus = K.HAUS[raum.haus];
    dazu(`${raum.der}. ${raum.text}${raum.job ? ` Hier kann man ${raum.job}.` : ""}`, "kern", "Zimmer");
    dazu(`${raum.der}!`, "kern", "Zimmer gewählt");
    dazu(`Das ist jetzt ${raum.der}.`, "kern", "Zimmer gewählt");
    dazu(`${raum.der} ${haus.im}.`, "kern", "Hingehen");
    dazu(`Dinge für ${den(raum.der)}`, "kern", "Schublade");
    dazu(`Hier ist noch Platz. Tippe auf das Plus und wähle ${den(raum.der)}.`, "kern", "Zeig mir");
    dazu(`Hier ist noch ein leeres Stockwerk. Tippe darauf, wähle zwei Zimmer und dann ${den(raum.der)}.`, "kern", "Zeig mir");
    if (raum.job) {
      dazu(`Traumjob: ${jobText(raum.id)}.`, "kern", "Tafel");
      dazu(`Dafür braucht es ${raum.ein} ${haus.im}.`, "kern", "Tafel");
      dazu(`Arbeit: ${jobText(raum.id)}.`, "kern", "Tafel");
    }
    if (raum.doppel) {
      const name = gross(raum.der);
      dazu(`${raum.der}! ${pronomen(raum.der)} ist zwei Stockwerke hoch.`, "kern", "KiddyDome");
      dazu(`Ein neues Stockwerk! ${name} ist jetzt zwei Stockwerke hoch.`, "kern", "KiddyDome");
      dazu(`${name} braucht zwei Stockwerke – im Fenster kannst du gleich noch eines dazubauen.`, "kern", "KiddyDome");
      ["dieses Stockwerk und das darüber", "dieses Stockwerk und das darunter"].forEach((wo) => dazu(`${name} ist so hoch wie zwei Stockwerke: ${pronomen(raum.der)} braucht ${wo}.`, "kern", "KiddyDome"));
      dazu(`${name} braucht zwei Stockwerke übereinander – hier ist nur eines frei.`, "kern", "KiddyDome");
    }
  });
  ["Baue gleich darüber noch eines dazu!", "Löse ein Rätsel für Ziegel, dann kannst du noch ein Stockwerk dazubauen.",
    "Für mehr Stockwerke müssen deine Eltern die Schranke öffnen.", "Dieses Haus ist schon ganz hoch – wähle ein anderes Zimmer."].forEach((s) => dazu(s, "kern", "KiddyDome"));

  // Die Dinge
  Object.values(M.DINGE).forEach((ding) => {
    if (!ding.der) return;
    dazu(ding.der, "kern", "Ding");
    dazu(`${ding.der} ist weg.`, "kern", "Ding weg");
  });

  // Farben, Muster, Böden, Fassade
  K.FARBEN.forEach((farbe) => {
    dazu(farbe.name, "kern", "Farbe");
    dazu(`Boden ${farbe.name}`, "kern", "Bodenfarbe");
    dazu(`Hauswand: ${farbe.name}`, "kern", "Fassade");
    dazu(`Dach: ${farbe.name}`, "kern", "Fassade");
  });
  K.MUSTER.forEach((muster) => dazu(muster.name, "kern", "Muster"));
  K.BOEDEN.forEach((boden) => dazu(boden.name, "kern", "Boden"));

  // Wünsche (bau-stand.js, wunschInfo) und der Dank dafür
  Object.values(K.DING_WUENSCHE).forEach((info) => {
    dazu(`Ich hätte gerne ${info.ein}.`, "kern", "Wunsch");
    dazu(`Juhu, ${info.ein}!`, "kern", "Dank");
  });
  Object.values(K.FAMILIEN).forEach((fam) => dazu(`Ich mag ${fam.name}. Malst du die Wand ${fam.wort} an?`, "kern", "Wunsch"));
  Object.values(K.FAMILIEN).forEach((fam) => dazu(`Ich mag ${fam.name}. Malst du den Boden ${fam.wort} an?`, "kern", "Wunsch"));
  K.HAUS_WUENSCHE.wohnhaus.forEach((id) => dazu(`${gross(K.HAUS.wohnhaus.im)} wünsche ich mir ${K.RAEUME[id]?.ein || id}.`, "kern", "Wunsch"));
  [...K.FREMD_WUENSCHE.wohnhaus, ...K.FIGUREN.filter((f) => f.wunsch).map((f) => f.wunsch)]
    .forEach((w) => dazu(`${gross(K.HAUS[w.haus].im)} wünsche ich mir ${K.RAEUME[w.raum]?.ein || w.raum}. ${w.warum}`, "kern", "Wunsch"));

  // Die Figuren aus den Büchern, die Tierarten auf der Tafel
  K.FIGUREN.forEach((f) => dazu(`${f.ich} Aus dem Buch «${f.buecher[0].titel}».`, "kern", "Tafel"));
  Object.values(K.TIERE).forEach((art) => K.WOHNEN.forEach((id) => dazu(`${gross(art.der)} · wohnt ${imRaum(id)} ${K.HAUS.wohnhaus.im}`, "kern", "Tafel")));

  // Die Sternenleiter
  K.LEITER.forEach((stufe) => {
    dazu(`Das Dorf hat ${stufe.sterne} Sterne. ${stufe.text}`, "kern", "Sternenleiter");
    dazu(`${stufe.sterne} Sterne: ${stufe.name}. ${stufe.text} Geschafft!`, "kern", "Sternenleiter");
  });

  // Der Rätsel-Knopf: der Titel des Spiels (journey-plan.js, GAMES)
  [...lies("journey-plan.js").matchAll(/^\s+\w+: \{ title: "([^"]+)"/gm)].forEach((m) => dazu(`Ein Rätsel für Ziegel: ${m[1]}!`, "kern", "Rätsel-Knopf"));

  // --- Zahlen
  for (let n = 2; n <= 99; n += 1) {
    dazu(`Du hast ${n} Paletten Ziegel.`, "zahlen", "Ziegel");
    dazu(`Der Zug hat ${n} Paletten Ziegel gebracht!`, "zahlen", "Ziegel");
    dazu(`${n} Paletten Ziegel sind da!`, "zahlen", "Ziegel");
  }
  // Höchstens 60 Tiere (20 Stockwerke mit je drei), jedes mit 5 Sternen.
  for (let n = 0; n <= 300; n += 1) {
    dazu(`Alle Tiere zusammen haben ${sterneWort(n)}.`, "zahlen", "Sternenleiter");
    dazu(`Zusammen haben sie ${sterneWort(n)}.`, "zahlen", "Alle Bewohner");
    if (n >= 2) dazu(`${n} fehlen noch.`, "zahlen", "Alle Bewohner");
  }
  for (let n = 2; n <= 60; n += 1) {
    dazu(`${n} Tiere wohnen im Wohnhaus.`, "zahlen", "Alle Bewohner");
    dazu(`${n} haben schon alle Sterne.`, "zahlen", "Alle Bewohner");
    dazu(`${n} haben ihren Traumjob.`, "zahlen", "Alle Bewohner");
  }
  K.LEITER.forEach((stufe, i) => {
    const vorher = K.LEITER[i - 1]?.sterne || 0;
    dazu(`${stufe.sterne} Sterne: ${stufe.name}. ${stufe.text}`, "zahlen", "Sternenleiter");
    for (let fehlt = 1; fehlt <= stufe.sterne - vorher; fehlt += 1) {
      dazu(`Noch ${nochSterne(fehlt)} bis zur nächsten Stufe: ${stufe.name}.`, "zahlen", "Sternenleiter");
      dazu(`Noch ${nochSterne(fehlt)}.`, "zahlen", "Sternenleiter");
    }
  });
  // Stockwerke (stockName): eines mit einem Zimmer, der KiddyDome über zwei.
  const stock = (i) => (i === 0 ? "das Erdgeschoss" : `der ${i}. Stock`);
  for (let i = 0; i < 20; i += 1) {
    dazu(`${gross(stock(i))}.`, "zahlen", "Stockwerk");
    dazu(`${gross(stock(i))}:`, "zahlen", "Stockwerk");
    if (i < 19) dazu(`${gross(stock(i))} und ${stock(i + 1)}:`, "zahlen", "Stockwerk");
    K.RAEUME_LISTE.forEach((raum) => {
      if (raum.doppel) { if (i < 19) dazu(`${gross(stock(i))} und ${stock(i + 1)}: ${raum.der}.`, "zahlen", "Stockwerk"); return; }
      dazu(`${gross(stock(i))}: ${raum.der}.`, "zahlen", "Stockwerk");
    });
    K.WOHNEN.forEach((id) => dazu(`${i === 0 ? "Erdgeschoss" : `${i}. Stock`}: ${K.RAEUME[id].der}.`, "zahlen", "Alle Bewohner"));
  }

  // --- Ein Tiername je Satz: die Namen der Tierarten und der Buchfiguren
  const tiere = [
    ...Object.entries(K.TIERE).flatMap(([a, art]) => art.namen.map((n) => ({ n, a, figur: null }))),
    ...K.FIGUREN.map((figur) => ({ n: figur.n, a: figur.a, figur })),
  ];
  tiere.forEach(({ n, a, figur }) => {
    const art = K.TIERE[a];
    [
      n, `${n}.`, `${n}, ${art.der}.`,
      `${n} hat alle Sterne!`, `${n} hat alle 5 Sterne!`, `${n} ist überglücklich.`, `${n} ist überglücklich!`,
      `${n} fühlt sich wohl.`, `${n} ist zufrieden.`, `${n} findet es noch ein bisschen leer.`,
      ...[0, 1, 2, 3, 4].map((k) => `${n} hat ${k} von 5 Sternen.`),
      `Willkommen, ${n}!`, `${n} wohnt jetzt hier.`, `Und ${n} hat schon den Traumjob!`, `Hier wohnt ${n}.`,
      figur ? `${n} aus dem Buch «${figur.buecher[0].titel}» zieht ein!` : `${n}, ${art.der}, zieht ein.`,
      `${n} hat hier den Traumjob.`, `${n} hat hier den Traumjob!`, `${n} hat sich dieses Zimmer gewünscht.`,
      `Tschüss, ${n}!`, `${n} bleibt.`, `Soll ${n} wirklich ausziehen?`,
      `Hier siehst du, was sich ${n} wünscht: Gelbe Sterne sind Wünsche für die Wohnung, grüne für das Wohnhaus, blaue für die anderen Häuser.`,
      `Dazu den Traumjob und wo ${n} gerade ist.`,
      `${n} ist zu Hause.`, `${n} ist unterwegs.`, `${n} arbeitet schon dort!`, `${n}: Sucht noch Arbeit.`,
      `${n}: Danke!`, `${n}: Juhu, meine Lieblingsfarbe!`,
      // Stücke, die kids.js zusammensetzt: «Flora:» vor dem Dank, je ein Name
      // je Satz, wo mehrere wohnen oder arbeiten (train-bau.js, zimmerSatz).
      `${n}:`, `${n} wohnt auch hier.`, `${n} hat hier auch den Traumjob!`, `${n} hat es sich auch gewünscht.`,
      `In der Wohnung von ${n} haben jetzt alle drei ihren Traumjob.`,
      // Die Karten der Zimmerwahl (werSatz).
      `${n} hätte hier den Traumjob!`, `${n} wünscht sich dieses Zimmer.`,
    ].forEach((s) => dazu(s, "namen", "Tiername"));
  });

  return [...liste.values()];
}

// Das Verzeichnis, wie es in bau-stimme.js steht: { text: datei } – oder
// null, wenn es die Datei noch nicht gibt.
export function verzeichnis() {
  const datei = path.join(WURZEL, VERZEICHNIS);
  if (!fs.existsSync(datei)) return null;
  const fenster = {};
  vm.runInContext(fs.readFileSync(datei, "utf8"), vm.createContext({ window: fenster }), { filename: VERZEICHNIS });
  return fenster.LernappStimmeDateien || {};
}

export function schreibeVerzeichnis(eintraege, { stimme = "" } = {}) {
  const zeilen = Object.entries(eintraege).map(([text, datei]) => `  ${JSON.stringify(text)}: ${JSON.stringify(datei)},`);
  const kopf = `/*
 * bau-stimme.js – Was die Bauecke sagt, als Aufnahme mit einer Stimme von
 * Google (Chirp 3 HD${stimme ? `, ${stimme}` : ""}).
 *
 * Wie lesen-stimme.js, nur für die Bauecke: Gibt es zu einem Satz eine
 * Aufnahme, spielt kids.js sie (aufnahmeStuecke), sonst spricht die
 * Gerätestimme. Kommt nach lesen-stimme.js und ergänzt dessen Verzeichnis.
 * Welche Sätze dazugehören, steht in scripts/stimme-bau-texte.mjs.
 *
 * Nicht von Hand ändern: scripts/stimme-google.mjs schreibt diese Datei.
 */
`;
  const inhalt = zeilen.length ? `{\n${zeilen.join("\n")}\n}` : "{}";
  fs.writeFileSync(path.join(WURZEL, VERZEICHNIS), `${kopf}window.LernappStimmeDateien = Object.assign(window.LernappStimmeDateien || {}, ${inhalt});\n`);
}
