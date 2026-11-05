/*
 * Die App mit einer Stimme von Google (Cloud Text-to-Speech, Chirp 3 HD):
 * Stimmen anhören, Sätze vertonen, ins Repo legen.
 * ---------------------------------------------------------------------------
 * Zwei Bereiche mit je eigener Liste und eigenem Verzeichnis, die Aufnahmen
 * im selben Ordner (stimme/google/, eine Datei je Text):
 *   --bereich bau   die Bauecke: scripts/stimme-bau-texte.mjs → bau-stimme.js
 *                   (ohne --bereich gilt bau)
 *   --bereich app   alles andere: scripts/stimme-app-texte.mjs → app-stimme.js
 *   --bereich englisch  Roccos Englisch in der Englischecke:
 *                   scripts/stimme-englisch-texte.mjs → englisch-stimme.js,
 *                   eigener Ordner stimme/englisch/ und eine feste Stimme
 *   --bereich franzoesisch  Margots Französisch im Französischwagen:
 *                   scripts/stimme-franzoesisch-texte.mjs → franzoesisch-stimme.js,
 *                   stimme/franzoesisch/, fr-FR-Chirp3-HD-Aoede
 *                   (en-US-Chirp3-HD-Puck, Tempo 0.9) – --stimme und --tempo
 *                   gelten hier nicht, die Einstellung der deutschen Stimme
 *                   bleibt, wie sie ist.
 *
 *   node scripts/stimme-google.mjs texte [--bereich app] [--teil kern|zahlen|namen] [--fehlend]
 *       Die Sätze des Bereichs: wie viele, wie viele Zeichen, wie viele
 *       schon eine Aufnahme haben.
 *
 *   node scripts/stimme-google.mjs stimmen [--sprache fr-FR]
 *       Die Chirp-3-HD-Stimmen, die Google anbietet (ohne --sprache die
 *       deutschen).
 *
 *   node scripts/stimme-google.mjs probe [--sprache fr-FR] [--stimmen Aoede,Charon] [--tempo 0.95] [--aus <ordner>]
 *       Je Stimme eine Hörprobe mit typischen Sätzen – auf Deutsch aus der
 *       Bauecke, mit --sprache fr-FR aus der geplanten Französischecke. Ohne
 *       --stimmen alle. Landet ausserhalb des Repos (Standard: im
 *       Temp-Ordner, lernapp-stimmprobe/).
 *
 *   node scripts/stimme-google.mjs vertonen [--bereich app] --stimme <name> [--tempo 0.95] [--teil kern] [--limit 200] [--trocken]
 *       Vertont, was noch fehlt: je Satz eine MP3 in stimme/google/ (mono,
 *       24 kHz, 32 kbit/s, Stille vorne und hinten gekürzt – wie
 *       stimme-vertonen.mjs), dann schreibt es das Verzeichnis des Bereichs
 *       neu. Liegt die Datei eines Satzes schon da (der andere Bereich sagt
 *       ihn auch), kommt sie ohne Anfrage dazu. Die Stimme steht danach in
 *       scripts/stimme-google.json; ein späterer Lauf nimmt dieselbe. Eine
 *       andere Stimme gibt es nur mit --alle-neu (dann wird alles neu
 *       gesprochen). --trocken zählt nur.
 *       --nochmal <datei>: nur die Sätze darin (einer je Zeile) neu sprechen,
 *       auch wenn sie eine Aufnahme haben – etwa nachdem eine Schreibweise
 *       für die Stimme dazukam. Die Datei behält ihren Namen; die alte
 *       Aufnahme bleibt, bis die neue passt. Danach gehören die Dateien in
 *       ERNEUERT_STIMME in service-worker.js, sonst spielt ein Gerät, das
 *       den Satz schon gehört hat, weiter die alte.
 *
 *   node scripts/stimme-google.mjs aussprache "<Satz>" [--sprache fr-FR]
 *       Was für diesen Satz an Google ginge (Schreibweisen nur für die
 *       Stimme, Zahlen mit Punkt als Wort).
 *
 *   node scripts/stimme-google.mjs aufraeumen [--bereich app]
 *       Löscht Aufnahmen von Sätzen, die der Bereich nicht mehr sagt, und
 *       Dateien, die keines der beiden Verzeichnisse kennt.
 *
 *   node scripts/stimme-google.mjs verbrauch
 *       Wie viele Zeichen in welchem Monat an Google gingen.
 *
 * Der Schlüssel: GOOGLE_TTS_API_KEY (ein API-Schlüssel des Google-Cloud-
 * Projekts, beschränkt auf die Cloud Text-to-Speech API). Er geht im Kopf der
 * Anfrage mit (X-Goog-Api-Key), nie in der Adresse und nie in der Ausgabe.
 * Anleitung: docs/STIMME-GOOGLE.md.
 *
 * Kosten: Chirp 3 HD ist bis 1 Million Zeichen im Monat gratis, darüber
 * kostet es (30 US$ je Million). Dieses Skript zählt jedes Zeichen, das es
 * schickt (scripts/stimme-google.json, verbrauch), und hört bei 900'000 im
 * Monat auf – es sei denn, man erlaubt es mit --kosten-ok.
 *
 * Nötig: curl und ffmpeg.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { WURZEL } from "./stimme-texte.mjs";
import * as bau from "./stimme-bau-texte.mjs";
import * as app from "./stimme-app-texte.mjs";
import * as en from "./stimme-englisch-texte.mjs";
import * as fr from "./stimme-franzoesisch-texte.mjs";
const { ORDNER, dateiFuer, passtZumText, sekundenVon } = bau;

const API = "https://texttospeech.googleapis.com/v1";
const EINSTELLUNG = path.join(WURZEL, "scripts", "stimme-google.json");
// Sonst bleibt das Skript unter dem Gratis-Kontingent (1 Million Zeichen im
// Monat). Im Oktober 2026 kam die grosse Erweiterung der Bauecke dazu; der
// Auftraggeber hat bis 1,5 Millionen Zeichen erlaubt (höchstens etwa 15
// US-Dollar über dem Gratis-Kontingent).
const GRENZE_MONAT = new Date().toISOString().slice(0, 7) === "2026-10" ? 1_500_000 : 900_000;
const RATE = 24000;

// Wo eine Stimme ein Wort falsch sagt, bekommt sie es hier anders
// geschrieben – nur in der Anfrage, Text und Dateiname bleiben.
const AUSSPRACHE = {
};

const [befehl, ...rest] = process.argv.slice(2);
const flag = (name) => rest.includes(`--${name}`);
const wert = (name, fallback = null) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] && !rest[i + 1].startsWith("--") ? rest[i + 1] : fallback;
};

// Welcher Bereich: seine Sätze und sein Verzeichnis.
const BEREICHE = {
  bau: { name: "die Bauecke", texte: async () => bau.bauTexte(), verzeichnis: bau.verzeichnis, schreibe: bau.schreibeVerzeichnis, datei: bau.VERZEICHNIS, ordner: ORDNER, dateiFuer },
  app: { name: "die App", texte: app.appTexte, verzeichnis: app.verzeichnis, schreibe: app.schreibeVerzeichnis, datei: app.VERZEICHNIS, ordner: ORDNER, dateiFuer },
  // Die Englischecke: eigener Ordner, feste Stimme.
  englisch: {
    name: "die Englischecke", texte: en.englischTexte, verzeichnis: en.verzeichnis, schreibe: en.schreibeVerzeichnis, datei: en.VERZEICHNIS,
    ordner: en.ORDNER, dateiFuer: en.dateiFuer, stimme: en.STIMME, tempo: en.TEMPO,
  },
  // Der Französischwagen genauso.
  franzoesisch: {
    name: "den Französischwagen", texte: fr.franzoesischTexte, verzeichnis: fr.verzeichnis, schreibe: fr.schreibeVerzeichnis, datei: fr.VERZEICHNIS,
    ordner: fr.ORDNER, dateiFuer: fr.dateiFuer, stimme: fr.STIMME, tempo: fr.TEMPO,
  },
};
const bereichName = wert("bereich", "bau");
const B = BEREICHE[bereichName];
if (!B) { console.error(`Unbekannter Bereich: ${bereichName} (bau, app, englisch oder franzoesisch)`); process.exit(2); }
// Bauecke und App teilen sich den Ordner stimme/google/.
const anderer = B.stimme ? null : BEREICHE[bereichName === "bau" ? "app" : "bau"];

// --- Einstellung und Verbrauch ----------------------------------------------
function einstellung() {
  try { return JSON.parse(fs.readFileSync(EINSTELLUNG, "utf8")); } catch { return { stimme: "", tempo: 1, verbrauch: {} }; }
}
function speichereEinstellung(e) {
  fs.writeFileSync(EINSTELLUNG, `${JSON.stringify(e, null, 2)}\n`);
}
const monat = () => new Date().toISOString().slice(0, 7);
function buche(zeichen) {
  const e = einstellung();
  e.verbrauch ||= {};
  e.verbrauch[monat()] = (e.verbrauch[monat()] || 0) + zeichen;
  speichereEinstellung(e);
}
const verbrauchtDiesenMonat = () => einstellung().verbrauch?.[monat()] || 0;

// --- Google ---------------------------------------------------------------------
// Über curl, nicht fetch: curl nimmt den Proxy der Umgebung (HTTPS_PROXY).
// Der Schlüssel geht über stdin an curl (--config -), damit er in keiner
// Prozessliste steht.
function anfrage({ methode = "GET", pfad, body = null }) {
  const arbeit = fs.mkdtempSync(path.join(os.tmpdir(), "lernapp-google-"));
  const antwort = path.join(arbeit, "antwort.json");
  const zeilen = [
    `url = "${API}${pfad}"`,
    `request = "${methode}"`,
    `output = "${antwort}"`,
    'write-out = "%{http_code}"',
    "silent", "show-error",
    "max-time = 90",
    'header = "Content-Type: application/json; charset=utf-8"',
  ];
  const schluessel = process.env.GOOGLE_TTS_API_KEY;
  if (schluessel) zeilen.push(`header = "X-Goog-Api-Key: ${schluessel.replace(/["\\\s]/g, "")}"`);
  if (body) {
    fs.writeFileSync(path.join(arbeit, "body.json"), JSON.stringify(body));
    zeilen.push(`data-binary = "@${path.join(arbeit, "body.json")}"`);
  }
  return new Promise((fertig) => {
    const curl = spawn("curl", ["--config", "-"], { stdio: ["pipe", "pipe", "pipe"] });
    let aus = "";
    let fehler = "";
    curl.stdout.on("data", (d) => { aus += d; });
    curl.stderr.on("data", (d) => { fehler += d; });
    curl.on("close", () => {
      let daten = null;
      try { daten = JSON.parse(fs.readFileSync(antwort, "utf8")); } catch { /* keine Antwort */ }
      fs.rmSync(arbeit, { recursive: true, force: true });
      fertig({ status: Number(aus.trim()) || 0, daten, netz: fehler.trim() });
    });
    curl.stdin.end(`${zeilen.join("\n")}\n`);
  });
}

function erklaereFehler({ status, daten, netz }) {
  const meldung = daten?.error?.message || netz || "keine Antwort";
  if (status === 0) return `Google ist nicht erreichbar (${meldung}).`;
  if (!process.env.GOOGLE_TTS_API_KEY && (status === 401 || status === 403)) return `Kein Schlüssel: GOOGLE_TTS_API_KEY ist nicht gesetzt (docs/STIMME-GOOGLE.md). Google sagt: ${meldung}`;
  if (status === 403) return `Google lehnt ab (403): ${meldung}\nIst die Cloud Text-to-Speech API im Projekt eingeschaltet und die Abrechnung verknüpft? Darf der Schlüssel diese API?`;
  if (status === 400) return `Google versteht die Anfrage nicht (400): ${meldung}`;
  return `Google antwortet ${status}: ${meldung}`;
}

//   sprache  «de» (alle deutschen) oder ein Code wie «fr-FR»
async function stimmenListe(sprache = "de") {
  const r = await anfrage({ pfad: "/voices" });
  if (r.status !== 200) throw new Error(erklaereFehler(r));
  return (r.daten?.voices || [])
    .filter((v) => /Chirp3-HD/.test(v.name) && v.languageCodes.some((l) => l === sprache || l.startsWith(`${sprache}-`)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Ganzer Name aus einem kurzen («Charon» → «de-DE-Chirp3-HD-Charon»).
function stimmeName(kurz, sprache = "de-DE") {
  return /Chirp3-HD/.test(kurz) ? kurz : `${sprache}-Chirp3-HD-${kurz}`;
}

// Was in der Anfrage an Google steht – Text und Dateiname bleiben, wie sie sind.
// stimme: der ganze Name der Stimme; Zahlen als Wort nur bei einer deutschen.
const auszusprechen = (text, stimme = "de-DE") => {
  if (AUSSPRACHE_GANZ[text]) return AUSSPRACHE_GANZ[text];
  const ersetzt = Object.entries(AUSSPRACHE).reduce((t, [wort, so]) => t.replaceAll(wort, so), text);
  return stimme.startsWith("de-") ? zahlenMitPunktAlsWort(ersetzt) : ersetzt;
};

// «Kapitel 3. Die Entscheidung.», «am Abend noch 3. Wie viele …», «Station 1
// von 10. Als Nächstes …», «17 ist mehr als 14.»: Eine Zahl mit Punkt dahinter
// liest die deutsche Stimme als Ordnungszahl («Kapitel dritte», «von zehnte»,
// «vierzehnte»). In der Anfrage steht sie darum als Wort («Kapitel drei.»).
// So bleibt sie nur, wo eine Ordnungszahl gemeint ist: «der 3. Stock», «am
// 1. August». Ein Punkt mitten in einer Zahl («2.50», «8.30») bleibt
// ebenfalls; «1'000.» wird zu «tausend.».
const ORDNUNGSZAHL_GEMEINT = /^ (Stock|Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b/;
function zahlenMitPunktAlsWort(text) {
  return text.replace(/(?<![\d'’.,])(\d{1,3}(?:['’]\d{3})+|\d{1,6})\.(?!\d)/g, (ganz, zahl, stelle, alles) => (
    ORDNUNGSZAHL_GEMEINT.test(alles.slice(stelle + ganz.length)) ? ganz : `${zahlwort(Number(zahl.replace(/['’]/g, "")))}.`
  ));
}
const EINER = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const ZEHNER = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
// Eine Zahl bis 999'999 als deutsches Zahlwort (21 → «einundzwanzig»,
// 100 → «hundert», 1'200 → «tausendzweihundert»).
function zahlwort(n) {
  const rest = (r) => (r ? zahlwort(r) : "");
  if (n < 20) return EINER[n];
  if (n < 100) return `${n % 10 ? `${n % 10 === 1 ? "ein" : EINER[n % 10]}und` : ""}${ZEHNER[Math.floor(n / 10)]}`;
  if (n < 1000) return `${n < 200 ? "" : EINER[Math.floor(n / 100)]}hundert${rest(n % 100)}`;
  const tausender = Math.floor(n / 1000);
  return `${tausender === 1 ? "" : tausender % 100 === 1 ? `${zahlwort(tausender).slice(0, -1)}` : zahlwort(tausender)}tausend${rest(n % 1000)}`;
}

// Ein ganzes, kurzes Stück, das die Stimme sonst stumm oder buchstabiert
// sagt: so in der Anfrage (Text und Dateiname bleiben).
const AUSSPRACHE_GANZ = {
  "Pssst!": "Psst!",
  ROOOAAAR: "Roooaaar!",
  // Französischwagen: «bêê» zieht Aoede sonst sekundenlang.
  "Le mouton dit bêê.": "Le mouton dit : bê.",
};
// Eine Silbe oder ein kurzes Wort ohne Satzzeichen («ge», «Ja») kommt von
// Chirp manchmal stumm zurück. Ein zweiter Versuch fragt nach «Ge.» – gross
// und mit Punkt klingt es gleich, nur vollständig.
const kurzVariante = (text) => (text.length <= 5 && !/[.!?…]$/.test(text) ? `${text.charAt(0).toUpperCase()}${text.slice(1)}.` : null);

// Ein Text als WAV (LINEAR16, 24 kHz) – erst danach wird daraus eine MP3,
// so geht nichts zweimal durch einen Encoder.
async function sprich(text, { stimme, tempo }, versuch = 1) {
  const audioConfig = { audioEncoding: "LINEAR16", sampleRateHertz: RATE };
  if (tempo && Number(tempo) !== 1) audioConfig.speakingRate = Number(tempo);
  const r = await anfrage({
    methode: "POST",
    pfad: "/text:synthesize",
    body: { input: { text: auszusprechen(text, stimme) }, voice: { languageCode: stimme.split("-").slice(0, 2).join("-"), name: stimme }, audioConfig },
  });
  if (r.status === 200 && r.daten?.audioContent) return Buffer.from(r.daten.audioContent, "base64");
  // Zu viele Anfragen oder ein Schluckauf bei Google: warten, nochmal.
  if ((r.status === 429 || r.status >= 500 || r.status === 0) && versuch < 6) {
    await new Promise((weiter) => setTimeout(weiter, 1000 * 2 ** versuch));
    return sprich(text, { stimme, tempo }, versuch + 1);
  }
  const fehler = new Error(erklaereFehler(r));
  fehler.endgueltig = r.status === 400 || r.status === 401 || r.status === 403;
  throw fehler;
}

// WAV → MP3 wie stimme-vertonen.mjs: mono, 24 kHz, 32 kbit/s, Stille vorne
// und hinten bis auf 80 ms gekürzt, dann 12 ms ein- und 25 ms ausgeblendet –
// so knackt es nicht, wo die Sprache gleich am Anfang beginnt.
function zuMp3(wav, ziel) {
  const arbeit = fs.mkdtempSync(path.join(os.tmpdir(), "lernapp-wav-"));
  const roh = path.join(arbeit, "roh.wav");
  fs.writeFileSync(roh, wav);
  const stille = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08";
  try {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", roh, "-af", `${stille},areverse,${stille},afade=t=in:d=0.025,areverse,afade=t=in:d=0.012`,
      "-ac", "1", "-ar", String(RATE), "-codec:a", "libmp3lame", "-b:a", "32k", "-map_metadata", "-1", "-id3v2_version", "0", ziel]);
  } finally {
    fs.rmSync(arbeit, { recursive: true, force: true });
  }
  return sekundenVon(fs.readFileSync(ziel));
}

// --- Befehle -------------------------------------------------------------------
async function zeigeTexte() {
  const da = B.verzeichnis() || {};
  const teil = wert("teil");
  let liste = (await B.texte()).filter((e) => !teil || e.teil === teil);
  if (flag("fehlend")) liste = liste.filter((e) => !da[e.text]);
  const je = {};
  liste.forEach((e) => {
    je[e.teil] ||= { saetze: 0, zeichen: 0, aufgenommen: 0 };
    je[e.teil].saetze += 1;
    je[e.teil].zeichen += e.text.length;
    if (da[e.text]) je[e.teil].aufgenommen += 1;
  });
  Object.entries(je).forEach(([t, s]) => console.log(`${t.padEnd(8)} ${String(s.saetze).padStart(5)} Sätze  ${String(s.zeichen).padStart(7)} Zeichen  ${s.aufgenommen} mit Aufnahme`));
  const zeichen = liste.reduce((n, e) => n + e.text.length, 0);
  console.log(`\nZusammen ${liste.length} Sätze, ${zeichen} Zeichen. Diesen Monat an Google geschickt: ${verbrauchtDiesenMonat()} von ${GRENZE_MONAT}.`);
}

async function zeigeStimmen() {
  const stimmen = await stimmenListe(wert("sprache", "de"));
  if (!stimmen.length) { console.log(`Google bietet keine Chirp-3-HD-Stimme für «${wert("sprache", "de")}» an.`); return; }
  stimmen.forEach((v) => console.log(`${v.name.padEnd(34)} ${String(v.ssmlGender || "").padEnd(7)} ${v.languageCodes.join(", ")}`));
  console.log(`\n${stimmen.length} Stimmen. Hörproben: node scripts/stimme-google.mjs probe --stimmen ${stimmen.slice(0, 3).map((v) => v.name.split("-").pop()).join(",")}`);
}

const PROBE = [
  "Willkommen in der Bauecke! Welches Haus baust du zuerst? Tippe auf ein Haus.",
  "Das Spital. Im Spital wird geholfen, wenn jemand krank ist oder sich verletzt hat.",
  "Der Kühlschrank. Das Velo. Die Plättli. Beim Coiffeur werden Haare geschnitten.",
  "Juhui! Flora hat alle Sterne! Flora ist überglücklich.",
  "Ich hätte gerne ein Rüebli. Malst du die Wand blau an?",
].join(" ");
// Die Hörprobe für die Französischecke: Begrüssung, Wörter mit Artikel
// (le/la/l'/un/une), Bindungen (les enfants, un éléphant), eine Frage, Zahlen,
// «Jacques a dit» und ein Lob.
const PROBE_FR = [
  "Bonjour ! Bienvenue dans le wagon français.",
  "Regarde : une vache, un cochon, l'arbre et une pomme rouge.",
  "Où est le chat ? Le chat est sous la table.",
  "Un éléphant, les enfants, les oiseaux. Un, deux, trois, quatre, cinq.",
  "Jacques a dit : touche ton nez ! Bravo, c'est super !",
].join(" ");
const PROBEN = { de: PROBE, "de-DE": PROBE, fr: PROBE_FR, "fr-FR": PROBE_FR, "fr-CA": PROBE_FR };

async function probe() {
  const aus = path.resolve(wert("aus", path.join(os.tmpdir(), "lernapp-stimmprobe")));
  fs.mkdirSync(aus, { recursive: true });
  const sprache = wert("sprache", "de");
  const text = PROBEN[sprache];
  if (!text) throw new Error(`Keine Hörprobe für «${sprache}» (es gibt: ${Object.keys(PROBEN).join(", ")}).`);
  const gewuenscht = wert("stimmen");
  const voll = sprache.includes("-") ? sprache : sprache === "fr" ? "fr-FR" : "de-DE";
  const stimmen = gewuenscht ? gewuenscht.split(",").map((s) => stimmeName(s.trim(), voll)) : (await stimmenListe(sprache)).map((v) => v.name);
  const tempo = wert("tempo", null);
  const zeichen = text.length * stimmen.length;
  if (!flag("kosten-ok") && verbrauchtDiesenMonat() + zeichen > GRENZE_MONAT) throw new Error(`Das wären ${zeichen} Zeichen – zusammen mit ${verbrauchtDiesenMonat()} diesen Monat mehr als ${GRENZE_MONAT}.`);
  for (const stimme of stimmen) {
    const wav = await sprich(text, { stimme, tempo });
    buche(text.length);
    const ziel = path.join(aus, `${stimme}${tempo ? `-tempo-${tempo}` : ""}.mp3`);
    const sekunden = zuMp3(wav, ziel);
    console.log(`${ziel}  ${sekunden.toFixed(1)} s`);
  }
  console.log(`\n${stimmen.length} Hörproben, ${zeichen} Zeichen. Diesen Monat an Google geschickt: ${verbrauchtDiesenMonat()}.`);
}

async function vertonen() {
  const e = einstellung();
  const gewuenscht = B.stimme || (wert("stimme") ? stimmeName(wert("stimme")) : e.stimme);
  if (!gewuenscht) throw new Error("Welche Stimme? --stimme Charon (die Namen: node scripts/stimme-google.mjs stimmen)");
  const tempo = B.stimme ? B.tempo : Number(wert("tempo", e.tempo || 1));
  let da = B.verzeichnis() || {};
  const wechsel = !B.stimme && e.stimme && Object.keys(da).length && (e.stimme !== gewuenscht || Number(e.tempo || 1) !== tempo);
  if (wechsel && !flag("alle-neu")) {
    throw new Error(`${B.name[0].toUpperCase()}${B.name.slice(1)} spricht schon mit ${e.stimme} (Tempo ${e.tempo || 1}). Für ${gewuenscht} (Tempo ${tempo}) alles neu: --alle-neu (danach auch den anderen Bereich)`);
  }
  if (wechsel && !flag("trocken")) {
    Object.values(da).forEach((datei) => fs.rmSync(path.join(WURZEL, datei), { force: true }));
    da = {};
  }
  const teil = wert("teil");
  const alle = await B.texte();
  // --nochmal: nur diese Sätze, und neu, auch wenn sie eine Aufnahme haben.
  const nochmal = new Set(wert("nochmal") ? fs.readFileSync(path.resolve(wert("nochmal")), "utf8").split("\n").map((z) => z.trim()).filter(Boolean) : []);
  const fremd = [...nochmal].filter((text) => !alle.some((t) => t.text === text));
  if (fremd.length) throw new Error(`--nochmal: ${fremd.length} Sätze sagt ${B.name} nicht, zum Beispiel «${fremd[0]}»`);
  let offen = alle.filter((t) => (!teil || t.teil === teil) && (nochmal.size ? nochmal.has(t.text) : !da[t.text]));
  // Was schon als Datei daliegt (der andere Bereich sagt denselben Satz),
  // kommt ohne Anfrage dazu.
  const schonDa = offen.filter((t) => {
    if (nochmal.has(t.text)) return false;
    const datei = path.join(WURZEL, B.dateiFuer(t.text));
    return !wechsel && fs.existsSync(datei) && passtZumText(sekundenVon(fs.readFileSync(datei)), t.text);
  });
  schonDa.forEach((t) => { da[t.text] = B.dateiFuer(t.text); });
  if (schonDa.length) console.log(`${schonDa.length} Sätze haben schon eine Datei (vom anderen Bereich).`);
  offen = offen.filter((t) => !da[t.text] || nochmal.has(t.text));
  const limit = Number(wert("limit", 0));
  if (limit > 0) offen = offen.slice(0, limit);
  const zeichen = offen.reduce((n, t) => n + t.text.length, 0);
  console.log(`${offen.length} Sätze ohne Aufnahme${nochmal.size ? ` oder neu zu sprechen (${nochmal.size})` : ""}, ${zeichen} Zeichen, Stimme ${gewuenscht}, Tempo ${tempo}. Diesen Monat schon geschickt: ${verbrauchtDiesenMonat()}.`);
  if (flag("trocken")) return;
  if (!offen.length) {
    if (schonDa.length) B.schreibe(Object.fromEntries(alle.filter((t) => da[t.text]).map((t) => [t.text, da[t.text]])), { stimme: `${gewuenscht}${tempo !== 1 ? `, Tempo ${tempo}` : ""}` });
    return;
  }
  if (!flag("kosten-ok") && verbrauchtDiesenMonat() + zeichen > GRENZE_MONAT) {
    throw new Error(`Das ginge über ${GRENZE_MONAT} Zeichen in diesem Monat – das Gratis-Kontingent ist 1 Million. Mit --limit weniger auf einmal, nächsten Monat weiter, oder --kosten-ok.`);
  }
  if (!B.stimme) speichereEinstellung({ ...einstellung(), stimme: gewuenscht, tempo });
  fs.mkdirSync(path.join(WURZEL, B.ordner), { recursive: true });

  const reihenfolge = new Map(alle.map((t, i) => [t.text, i]));
  const schreibe = () => {
    const geordnet = Object.fromEntries(Object.entries(da).sort(([a], [b]) => (reihenfolge.get(a) ?? 1e9) - (reihenfolge.get(b) ?? 1e9)));
    B.schreibe(geordnet, { stimme: `${gewuenscht}${tempo !== 1 ? `, Tempo ${tempo}` : ""}` });
  };
  const gleichzeitig = Math.max(1, Math.min(8, Number(wert("gleichzeitig", 4))));
  const unpassend = [];
  let fertig = 0;
  let abbruch = null;
  let naechster = 0;
  async function arbeiter() {
    while (!abbruch && naechster < offen.length) {
      const t = offen[naechster];
      naechster += 1;
      try {
        const wav = await sprich(t.text, { stimme: gewuenscht, tempo });
        buche(t.text.length);
        const ziel = B.dateiFuer(t.text);
        // Erst daneben ablegen: Eine Aufnahme, die neu gesprochen wird, bleibt
        // so liegen, bis die neue passt.
        const neu = path.join(WURZEL, `${ziel.slice(0, -4)}.neu.mp3`);
        let sekunden = zuMp3(wav, neu);
        const variante = !AUSSPRACHE_GANZ[t.text] && kurzVariante(t.text);
        if (!passtZumText(sekunden, t.text) && variante) {
          const zweiter = await sprich(variante, { stimme: gewuenscht, tempo });
          buche(variante.length);
          sekunden = zuMp3(zweiter, neu);
        }
        if (!passtZumText(sekunden, t.text)) {
          fs.rmSync(neu, { force: true });
          unpassend.push(`${sekunden.toFixed(2)} s für ${t.text.length} Zeichen: ${t.text}`);
          continue;
        }
        fs.renameSync(neu, path.join(WURZEL, ziel));
        da[t.text] = ziel;
        fertig += 1;
        if (fertig % 100 === 0) { schreibe(); console.log(`… ${fertig} von ${offen.length}`); }
      } catch (fehler) {
        if (fehler.endgueltig) abbruch = fehler;
        else unpassend.push(`${fehler.message}: ${t.text}`);
      }
    }
  }
  await Promise.all(Array.from({ length: gleichzeitig }, arbeiter));
  schreibe();
  console.log(`\n${fertig} Aufnahmen neu; ${B.datei} kennt jetzt ${Object.keys(da).length}. Diesen Monat an Google geschickt: ${verbrauchtDiesenMonat()}.`);
  if (unpassend.length) console.log(`\nNicht übernommen (${unpassend.length}) – beim nächsten Lauf neu versucht:\n${unpassend.slice(0, 30).join("\n")}`);
  if (abbruch) throw abbruch;
}

async function aufraeumen() {
  const da = B.verzeichnis();
  if (!da) { console.log(`Noch keine Aufnahmen (${B.datei} fehlt).`); return; }
  const gesagt = new Set((await B.texte()).map((t) => t.text));
  const weg = Object.keys(da).filter((text) => !gesagt.has(text));
  // Eine Datei, die der andere Bereich auch braucht, bleibt liegen.
  const dort = new Set(Object.values(anderer?.verzeichnis() || {}));
  weg.forEach((text) => { if (!dort.has(da[text])) fs.rmSync(path.join(WURZEL, da[text]), { force: true }); delete da[text]; });
  const belegt = new Set([...Object.values(da), ...dort]);
  const ordner = path.join(WURZEL, B.ordner);
  const lose = fs.existsSync(ordner) ? fs.readdirSync(ordner).filter((n) => !belegt.has(`${B.ordner}/${n}`)) : [];
  lose.forEach((n) => fs.rmSync(path.join(ordner, n), { force: true }));
  const e = B.stimme ? { stimme: B.stimme, tempo: B.tempo } : einstellung();
  B.schreibe(da, { stimme: `${e.stimme}${Number(e.tempo || 1) !== 1 ? `, Tempo ${e.tempo}` : ""}` });
  console.log(`${weg.length} Aufnahmen alter Sätze und ${lose.length} lose Dateien gelöscht; ${B.datei} kennt ${Object.keys(da).length}.`);
}

function zeigeAussprache() {
  const text = rest.filter((r, i) => !r.startsWith("--") && rest[i - 1] !== "--sprache").join(" ");
  if (!text) throw new Error('Welcher Satz? node scripts/stimme-google.mjs aussprache "Kapitel 3. Das Plakat."');
  console.log(auszusprechen(text, wert("sprache", "de-DE")));
}

function zeigeVerbrauch() {
  const e = einstellung();
  const v = e.verbrauch || {};
  if (!Object.keys(v).length) console.log("Noch nichts an Google geschickt.");
  Object.entries(v).forEach(([m, n]) => console.log(`${m}  ${String(n).padStart(9)} Zeichen${m === monat() ? `  (Grenze ${GRENZE_MONAT})` : ""}`));
  if (e.stimme) console.log(`\nStimme: ${e.stimme}, Tempo ${e.tempo || 1}`);
}

const BEFEHLE = { texte: zeigeTexte, stimmen: zeigeStimmen, probe, vertonen, aufraeumen, aussprache: zeigeAussprache, verbrauch: zeigeVerbrauch };
try {
  if (!BEFEHLE[befehl]) {
    console.error("Aufruf: node scripts/stimme-google.mjs texte | stimmen | probe | vertonen | aufraeumen | aussprache | verbrauch (Genaueres oben in der Datei)");
    process.exit(2);
  }
  await BEFEHLE[befehl]();
} catch (fehler) {
  console.error(fehler.message);
  process.exit(1);
}
