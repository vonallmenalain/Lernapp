/*
 * Alains Stimme für feste Texte: was dazugehört, was noch fehlt – und die
 * erzeugten Aufnahmen ins Repo holen.
 * ---------------------------------------------------------------------------
 *   node scripts/stimme-vertonen.mjs texte [--fehlend] [--json]
 *       Die Texte (scripts/stimme-texte.mjs) mit ihrer Zeichenzahl und ob es
 *       schon eine Aufnahme gibt. --fehlend: nur die ohne. --json: als Liste
 *       für die Erzeugung.
 *
 *   node scripts/stimme-vertonen.mjs holen <auftraege.json>
 *       Holt erzeugte Aufnahmen ab. auftraege.json: [{ "text": "…", "url":
 *       "https://…mp3" }, …] – die result_url aus Higgsfield. Jede wird
 *       geladen, auf mono, 24 kHz und 32 kbit/s gebracht, die Stille vorne
 *       und hinten bis auf einen Hauch gekürzt, auf ihre Länge geprüft und als
 *       stimme/alain/<hash>.mp3 abgelegt. Dann schreibt das Skript
 *       lesen-stimme.js neu.
 *
 * Erzeugt werden die Aufnahmen auf Higgsfield mit Alains Stimmprofil (das
 * Voice-Element «Alain», list_voices): model "text2speech_v2", variant
 * "elevenlabs", voice_type "element". Vorher die Kosten mit get_cost: true
 * abfragen – rund 0,45 Credits für 120 Zeichen.
 *
 * Wird ein Text neu gesprochen, behält seine Datei den Namen. Damit die Geräte
 * die neue holen, braucht der Cache der Aufnahmen im Service Worker eine neue
 * Nummer (STIMME_CACHE).
 *
 * Nötig: curl, ffmpeg und ffprobe.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { WURZEL, ORDNER, texte, verzeichnis, schreibeVerzeichnis, dateiFuer, sprechText } from "./stimme-texte.mjs";

const [befehl, ...rest] = process.argv.slice(2);

function zeigeTexte() {
  const da = verzeichnis() || {};
  let liste = texte().map((e) => ({ ...e, zeichen: e.text.length, datei: da[e.text] || null }));
  if (rest.includes("--fehlend")) liste = liste.filter((e) => !e.datei);
  if (rest.includes("--json")) {
    console.log(JSON.stringify(liste.map(({ text, wo }) => ({ text, wo })), null, 2));
    return;
  }
  liste.forEach((e) => console.log(`${e.datei ? "✓" : "·"} ${String(e.zeichen).padStart(4)}  ${e.wo}: ${e.text}`));
  const zeichen = liste.reduce((n, e) => n + e.zeichen, 0);
  const offen = liste.filter((e) => !e.datei);
  console.log(`\n${liste.length} Texte, ${zeichen} Zeichen; ohne Aufnahme ${offen.length} (${offen.reduce((n, e) => n + e.zeichen, 0)} Zeichen).`);
}

function sekunden(datei) {
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", datei], { encoding: "utf8" }).trim());
}

function holen() {
  const quelle = rest[0];
  if (!quelle) throw new Error("Welche Aufträge? node scripts/stimme-vertonen.mjs holen <auftraege.json>");
  const roh = JSON.parse(fs.readFileSync(quelle, "utf8"));
  const auftraege = Array.isArray(roh) ? roh : Object.entries(roh).map(([text, url]) => ({ text, url }));
  const bekannt = new Map(texte().map((e) => [e.text, e]));
  const da = { ...(verzeichnis() || {}) };
  const arbeit = fs.mkdtempSync(path.join(os.tmpdir(), "lernapp-stimme-"));
  const neu = [];
  try {
    auftraege.forEach(({ text, url }, nr) => {
      const t = sprechText(text);
      if (!bekannt.has(t)) throw new Error(`«${t}» gehört zu keinem Text in scripts/stimme-texte.mjs`);
      // file:// zum Ausprobieren mit einer Datei auf dem Rechner.
      if (!/^(https|file):\/\//.test(String(url || ""))) throw new Error(`«${t}»: keine https-Adresse (${url})`);
      const geladen = path.join(arbeit, `roh-${nr}.mp3`);
      const fertig = path.join(arbeit, `fertig-${nr}.mp3`);
      execFileSync("curl", ["--fail", "--location", "--silent", "--show-error", "--max-time", "120", "--output", geladen, url]);
      // Mono, 24 kHz, 32 kbit/s: für eine Stimme genug, und ein Satz ist nur
      // wenige Kilobyte gross. Die Stille vorne und hinten wird bis auf
      // 80 ms gekürzt: Zwischen zwei Sätzen macht das Buch selbst Pause.
      const stille = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08";
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", geladen, "-af", `${stille},areverse,${stille},areverse`,
        "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "32k", "-map_metadata", "-1", "-id3v2_version", "0", fertig]);
      const vorher = sekunden(geladen);
      const nachher = sekunden(fertig);
      // Rund 14 Zeichen in der Sekunde. Viel kürzer: abgeschnitten; viel
      // länger: etwas anderes als der Text.
      const jeZeichen = nachher / t.length;
      if (!(nachher >= 0.3) || jeZeichen < 0.025 || jeZeichen > 0.2) {
        throw new Error(`«${t}»: ${nachher.toFixed(2)} s für ${t.length} Zeichen (vor dem Kürzen ${vorher.toFixed(2)} s) – passt nicht zum Text`);
      }
      const ziel = dateiFuer(t);
      fs.mkdirSync(path.join(WURZEL, ORDNER), { recursive: true });
      fs.copyFileSync(fertig, path.join(WURZEL, ziel));
      da[t] = ziel;
      neu.push({ text: t, ziel, vorher, nachher, kb: fs.statSync(fertig).size / 1024 });
    });
  } finally {
    fs.rmSync(arbeit, { recursive: true, force: true });
  }
  // In der Reihenfolge, in der man die Texte hört.
  const geordnet = {};
  texte().forEach((e) => { if (da[e.text]) geordnet[e.text] = da[e.text]; });
  schreibeVerzeichnis(geordnet);
  neu.forEach((n) => console.log(`${n.ziel}  ${n.vorher.toFixed(2)} s → ${n.nachher.toFixed(2)} s, ${n.kb.toFixed(1)} KB  ${n.text.slice(0, 60)}`));
  console.log(`\n${neu.length} Aufnahmen geholt; lesen-stimme.js kennt jetzt ${Object.keys(geordnet).length}.`);
}

try {
  if (befehl === "texte") zeigeTexte();
  else if (befehl === "holen") holen();
  else {
    console.error("Aufruf: node scripts/stimme-vertonen.mjs texte [--fehlend] [--json] | holen <auftraege.json>");
    process.exit(2);
  }
} catch (fehler) {
  console.error(fehler.message);
  process.exit(1);
}
