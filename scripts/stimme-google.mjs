/*
 * Die Bauecke mit einer Stimme von Google (Cloud Text-to-Speech, Chirp 3 HD):
 * Stimmen anhören, Sätze vertonen, ins Repo legen.
 * ---------------------------------------------------------------------------
 *   node scripts/stimme-google.mjs texte [--teil kern|zahlen|namen] [--fehlend]
 *       Die Sätze der Bauecke (scripts/stimme-bau-texte.mjs): wie viele, wie
 *       viele Zeichen, wie viele schon eine Aufnahme haben.
 *
 *   node scripts/stimme-google.mjs stimmen
 *       Die deutschen Chirp-3-HD-Stimmen, die Google anbietet.
 *
 *   node scripts/stimme-google.mjs probe [--stimmen Aoede,Charon] [--tempo 0.95] [--aus <ordner>]
 *       Je Stimme eine Hörprobe mit typischen Sätzen der Bauecke – ohne
 *       --stimmen alle. Landet ausserhalb des Repos (Standard: im
 *       Temp-Ordner, lernapp-stimmprobe/).
 *
 *   node scripts/stimme-google.mjs vertonen --stimme <name> [--tempo 0.95] [--teil kern] [--limit 200] [--trocken]
 *       Vertont, was noch fehlt: je Satz eine MP3 in stimme/google/ (mono,
 *       24 kHz, 32 kbit/s, Stille vorne und hinten gekürzt – wie
 *       stimme-vertonen.mjs), dann schreibt es bau-stimme.js neu. Die Stimme
 *       steht danach in scripts/stimme-google.json; ein späterer Lauf nimmt
 *       dieselbe. Eine andere Stimme gibt es nur mit --alle-neu (dann wird
 *       alles neu gesprochen). --trocken zählt nur.
 *
 *   node scripts/stimme-google.mjs aufraeumen
 *       Löscht Aufnahmen von Sätzen, die die Bauecke nicht mehr sagt.
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
 * Nötig: curl, ffmpeg und ffprobe.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { WURZEL } from "./stimme-texte.mjs";
import { ORDNER, bauTexte, dateiFuer, verzeichnis, schreibeVerzeichnis } from "./stimme-bau-texte.mjs";

const API = "https://texttospeech.googleapis.com/v1";
const EINSTELLUNG = path.join(WURZEL, "scripts", "stimme-google.json");
const GRENZE_MONAT = 900_000;
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

async function stimmenListe() {
  const r = await anfrage({ pfad: "/voices" });
  if (r.status !== 200) throw new Error(erklaereFehler(r));
  return (r.daten?.voices || [])
    .filter((v) => /Chirp3-HD/.test(v.name) && v.languageCodes.some((l) => /^de-/.test(l)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Ganzer Name aus einem kurzen («Charon» → «de-DE-Chirp3-HD-Charon»).
function stimmeName(kurz) {
  return /Chirp3-HD/.test(kurz) ? kurz : `de-DE-Chirp3-HD-${kurz}`;
}

const auszusprechen = (text) => Object.entries(AUSSPRACHE).reduce((t, [wort, so]) => t.replaceAll(wort, so), text);

// Ein Text als WAV (LINEAR16, 24 kHz) – erst danach wird daraus eine MP3,
// so geht nichts zweimal durch einen Encoder.
async function sprich(text, { stimme, tempo }, versuch = 1) {
  const audioConfig = { audioEncoding: "LINEAR16", sampleRateHertz: RATE };
  if (tempo && Number(tempo) !== 1) audioConfig.speakingRate = Number(tempo);
  const r = await anfrage({
    methode: "POST",
    pfad: "/text:synthesize",
    body: { input: { text: auszusprechen(text) }, voice: { languageCode: stimme.split("-").slice(0, 2).join("-"), name: stimme }, audioConfig },
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
// und hinten bis auf 80 ms gekürzt.
function zuMp3(wav, ziel) {
  const arbeit = fs.mkdtempSync(path.join(os.tmpdir(), "lernapp-wav-"));
  const roh = path.join(arbeit, "roh.wav");
  fs.writeFileSync(roh, wav);
  const stille = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08";
  try {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", roh, "-af", `${stille},areverse,${stille},areverse`,
      "-ac", "1", "-ar", String(RATE), "-codec:a", "libmp3lame", "-b:a", "32k", "-map_metadata", "-1", "-id3v2_version", "0", ziel]);
  } finally {
    fs.rmSync(arbeit, { recursive: true, force: true });
  }
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ziel], { encoding: "utf8" }).trim());
}

// Rund 14 Zeichen in der Sekunde; ein einzelnes Wort darf etwas länger sein.
function passtZumText(sekunden, text) {
  if (!(sekunden >= 0.25)) return false;
  if (sekunden > Math.max(1.6, text.length * 0.2)) return false;
  return text.length < 15 || sekunden >= text.length * 0.025;
}

// --- Befehle -------------------------------------------------------------------
function zeigeTexte() {
  const da = verzeichnis() || {};
  const teil = wert("teil");
  let liste = bauTexte().filter((e) => !teil || e.teil === teil);
  if (flag("fehlend")) liste = liste.filter((e) => !da[e.text]);
  const je = {};
  liste.forEach((e) => {
    je[e.teil] ||= { saetze: 0, zeichen: 0, aufgenommen: 0 };
    je[e.teil].saetze += 1;
    je[e.teil].zeichen += e.text.length;
    if (da[e.text]) je[e.teil].aufgenommen += 1;
  });
  Object.entries(je).forEach(([t, s]) => console.log(`${t.padEnd(7)} ${String(s.saetze).padStart(5)} Sätze  ${String(s.zeichen).padStart(7)} Zeichen  ${s.aufgenommen} mit Aufnahme`));
  const zeichen = liste.reduce((n, e) => n + e.text.length, 0);
  console.log(`\nZusammen ${liste.length} Sätze, ${zeichen} Zeichen. Diesen Monat an Google geschickt: ${verbrauchtDiesenMonat()} von ${GRENZE_MONAT}.`);
}

async function zeigeStimmen() {
  const stimmen = await stimmenListe();
  if (!stimmen.length) { console.log("Google bietet keine deutsche Chirp-3-HD-Stimme an."); return; }
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

async function probe() {
  const aus = path.resolve(wert("aus", path.join(os.tmpdir(), "lernapp-stimmprobe")));
  fs.mkdirSync(aus, { recursive: true });
  const gewuenscht = wert("stimmen");
  const stimmen = gewuenscht ? gewuenscht.split(",").map((s) => stimmeName(s.trim())) : (await stimmenListe()).map((v) => v.name);
  const tempo = wert("tempo", null);
  const zeichen = PROBE.length * stimmen.length;
  if (!flag("kosten-ok") && verbrauchtDiesenMonat() + zeichen > GRENZE_MONAT) throw new Error(`Das wären ${zeichen} Zeichen – zusammen mit ${verbrauchtDiesenMonat()} diesen Monat mehr als ${GRENZE_MONAT}.`);
  for (const stimme of stimmen) {
    const wav = await sprich(PROBE, { stimme, tempo });
    buche(PROBE.length);
    const ziel = path.join(aus, `${stimme}${tempo ? `-tempo-${tempo}` : ""}.mp3`);
    const sekunden = zuMp3(wav, ziel);
    console.log(`${ziel}  ${sekunden.toFixed(1)} s`);
  }
  console.log(`\n${stimmen.length} Hörproben, ${zeichen} Zeichen. Diesen Monat an Google geschickt: ${verbrauchtDiesenMonat()}.`);
}

async function vertonen() {
  const e = einstellung();
  const gewuenscht = wert("stimme") ? stimmeName(wert("stimme")) : e.stimme;
  if (!gewuenscht) throw new Error("Welche Stimme? --stimme Charon (die Namen: node scripts/stimme-google.mjs stimmen)");
  const tempo = Number(wert("tempo", e.tempo || 1));
  let da = verzeichnis() || {};
  const wechsel = e.stimme && Object.keys(da).length && (e.stimme !== gewuenscht || Number(e.tempo || 1) !== tempo);
  if (wechsel && !flag("alle-neu")) {
    throw new Error(`Die Bauecke spricht schon mit ${e.stimme} (Tempo ${e.tempo || 1}). Für ${gewuenscht} (Tempo ${tempo}) alles neu: --alle-neu`);
  }
  if (wechsel && !flag("trocken")) {
    Object.values(da).forEach((datei) => fs.rmSync(path.join(WURZEL, datei), { force: true }));
    da = {};
  }
  const teil = wert("teil");
  const alle = bauTexte();
  let offen = alle.filter((t) => (!teil || t.teil === teil) && !da[t.text]);
  const limit = Number(wert("limit", 0));
  if (limit > 0) offen = offen.slice(0, limit);
  const zeichen = offen.reduce((n, t) => n + t.text.length, 0);
  console.log(`${offen.length} Sätze ohne Aufnahme, ${zeichen} Zeichen, Stimme ${gewuenscht}, Tempo ${tempo}. Diesen Monat schon geschickt: ${verbrauchtDiesenMonat()}.`);
  if (flag("trocken") || !offen.length) return;
  if (!flag("kosten-ok") && verbrauchtDiesenMonat() + zeichen > GRENZE_MONAT) {
    throw new Error(`Das ginge über ${GRENZE_MONAT} Zeichen in diesem Monat – das Gratis-Kontingent ist 1 Million. Mit --limit weniger auf einmal, nächsten Monat weiter, oder --kosten-ok.`);
  }
  speichereEinstellung({ ...einstellung(), stimme: gewuenscht, tempo });
  fs.mkdirSync(path.join(WURZEL, ORDNER), { recursive: true });

  const reihenfolge = new Map(alle.map((t, i) => [t.text, i]));
  const schreibe = () => {
    const geordnet = Object.fromEntries(Object.entries(da).sort(([a], [b]) => (reihenfolge.get(a) ?? 1e9) - (reihenfolge.get(b) ?? 1e9)));
    schreibeVerzeichnis(geordnet, { stimme: `${gewuenscht}${tempo !== 1 ? `, Tempo ${tempo}` : ""}` });
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
        const ziel = dateiFuer(t.text);
        const sekunden = zuMp3(wav, path.join(WURZEL, ziel));
        if (!passtZumText(sekunden, t.text)) {
          fs.rmSync(path.join(WURZEL, ziel), { force: true });
          unpassend.push(`${sekunden.toFixed(2)} s für ${t.text.length} Zeichen: ${t.text}`);
          continue;
        }
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
  console.log(`\n${fertig} Aufnahmen neu; bau-stimme.js kennt jetzt ${Object.keys(da).length}. Diesen Monat an Google geschickt: ${verbrauchtDiesenMonat()}.`);
  if (unpassend.length) console.log(`\nNicht übernommen (${unpassend.length}) – beim nächsten Lauf neu versucht:\n${unpassend.slice(0, 30).join("\n")}`);
  if (abbruch) throw abbruch;
}

function aufraeumen() {
  const da = verzeichnis();
  if (!da) { console.log("Noch keine Aufnahmen (bau-stimme.js fehlt)."); return; }
  const gesagt = new Set(bauTexte().map((t) => t.text));
  const weg = Object.keys(da).filter((text) => !gesagt.has(text));
  weg.forEach((text) => { fs.rmSync(path.join(WURZEL, da[text]), { force: true }); delete da[text]; });
  const belegt = new Set(Object.values(da));
  const ordner = path.join(WURZEL, ORDNER);
  const lose = fs.existsSync(ordner) ? fs.readdirSync(ordner).filter((n) => !belegt.has(`${ORDNER}/${n}`)) : [];
  lose.forEach((n) => fs.rmSync(path.join(ordner, n), { force: true }));
  const e = einstellung();
  schreibeVerzeichnis(da, { stimme: `${e.stimme}${Number(e.tempo || 1) !== 1 ? `, Tempo ${e.tempo}` : ""}` });
  console.log(`${weg.length} Aufnahmen alter Sätze und ${lose.length} lose Dateien gelöscht; bau-stimme.js kennt ${Object.keys(da).length}.`);
}

function zeigeVerbrauch() {
  const e = einstellung();
  const v = e.verbrauch || {};
  if (!Object.keys(v).length) console.log("Noch nichts an Google geschickt.");
  Object.entries(v).forEach(([m, n]) => console.log(`${m}  ${String(n).padStart(9)} Zeichen${m === monat() ? `  (Grenze ${GRENZE_MONAT})` : ""}`));
  if (e.stimme) console.log(`\nStimme der Bauecke: ${e.stimme}, Tempo ${e.tempo || 1}`);
}

const BEFEHLE = { texte: zeigeTexte, stimmen: zeigeStimmen, probe, vertonen, aufraeumen, verbrauch: zeigeVerbrauch };
try {
  if (!BEFEHLE[befehl]) {
    console.error("Aufruf: node scripts/stimme-google.mjs texte | stimmen | probe | vertonen | aufraeumen | verbrauch (Genaueres oben in der Datei)");
    process.exit(2);
  }
  await BEFEHLE[befehl]();
} catch (fehler) {
  console.error(fehler.message);
  process.exit(1);
}
