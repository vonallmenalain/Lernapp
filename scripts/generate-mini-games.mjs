/*
 * Die Seiten unter mini-games/ – erzeugt, nicht getippt.
 * ---------------------------------------------------------------------------
 * Ein Mini-Game ist kein zweites Spiel, sondern dasselbe Spiel unter einer
 * anderen Adresse: mini-games/turmbau.html lädt turmbau.js, game-shell.js und
 * den ganzen Rest genau wie turmbau.html. Der Unterschied sind drei Dinge:
 *
 *   data-mini="1"              schaltet den Mini-Modus ein. Daran hängen die
 *                              Schranke (entitlement.js: nichts gesperrt,
 *                              nichts verbraucht), die Ablage (game-cloud.js:
 *                              nichts geschrieben) und die Bühne
 *                              (game-shell.js: andere Knöpfe, andere Liste).
 *   data-mini-spiel="towerStack"  welches Spiel das hier ist.
 *   mini-games.js              die Knöpfe, das Fenster, die Bestenliste.
 *
 * Diese Dateien von Hand zu pflegen hiesse, dreizehn Skriptlisten parallel
 * aktuell zu halten. Beim ersten vergessenen Eintrag lädt ein Mini-Game eine
 * Datei nicht, die es braucht – und es fällt niemandem auf, weil niemand
 * dreizehn Seiten durchklickt. Deshalb entstehen sie hier aus der Seite der
 * App, und scripts/validate-mini-games.mjs prüft, dass sie es noch tun.
 *
 *   node scripts/generate-mini-games.mjs             schreibt die Seiten
 *   node scripts/generate-mini-games.mjs --pruefen   sagt nur, ob sie stimmen
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const ZIEL = path.join(WURZEL, "mini-games");

// Welche Spiele es als Mini-Game gibt, steht in mini-games.js – einmal, für
// die App und für dieses Skript. Gelesen wird die Tabelle aus der Datei statt
// sie hier zu wiederholen: Zwei Listen liefen auseinander.
export function spieleAusModul() {
  const quelle = fs.readFileSync(path.join(WURZEL, "mini-games.js"), "utf8");
  const block = quelle.match(/const SPIELE = \[([\s\S]*?)\n  \];/);
  if (!block) throw new Error("In mini-games.js ist die Tabelle SPIELE nicht zu finden.");
  const spiele = [...block[1].matchAll(/\{\s*id:\s*"([^"]+)",\s*seite:\s*"([^"]+)"\s*\}/g)]
    .map(([, id, seite]) => ({ id, seite }));
  if (!spiele.length) throw new Error("In mini-games.js steht kein einziges Mini-Game.");
  return spiele;
}

// Die Seite der App, aus der die Mini-Seite wird: entitlement.js weiss, welche
// Datei zu welchem Spiel gehört. Auch das wird gelesen und nicht wiederholt.
export function seitenAusSchranke() {
  const quelle = fs.readFileSync(path.join(WURZEL, "entitlement.js"), "utf8");
  const seiten = new Map();
  [...quelle.matchAll(/\{\s*id:\s*"([^"]+)",\s*page:\s*"([^"]+)"/g)]
    .forEach(([, id, page]) => { if (!seiten.has(id)) seiten.set(id, page); });
  if (!seiten.size) throw new Error("In entitlement.js sind keine Spielseiten zu finden.");
  return seiten;
}

// Aus turmbau.html wird mini-games/turmbau.html.
export function baueSeite({ id, seite }, appSeite, quelle) {
  const titel = (quelle.match(/<title>([^<]*)<\/title>/) || [, "Gripszug"])[1].split("·")[0].trim();
  let html = quelle;

  // 1. Der Name oben im Tab sagt, wo man ist.
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${titel} · Mini-Games</title>`);

  // 2. Das Manifest gehört zur App, nicht hierher: Ein Mini-Game soll sich
  //    nicht auf den Startbildschirm legen lassen, als wäre es Gripszug.
  html = html.replace(/\n *<link rel="manifest"[^>]*>/g, "");

  // 3. Eine Ebene tiefer: styles.css liegt über uns, nicht neben uns.
  html = html.replace(/(href|src)="(?!https?:|\/|\.\.\/|#)([^"]+)"/g, (_treffer, was, wert) => `${was}="../${wert}"`);

  // 4. Der Schalter, an dem alles hängt.
  html = html.replace(/<body([^>]*)>/, (_treffer, rest) => `<body${rest} data-mini="1" data-mini-spiel="${id}">`);

  // 5. Die Skripte: pwa.js bleibt draussen (kein Service Worker für eine Seite,
  //    die niemand installiert), mini-games.js kommt direkt hinter firebase.js –
  //    es braucht dessen Daten und muss vor game-shell.js dastehen.
  html = html.replace(/\n *<script defer src="\.\.\/pwa\.js[^"]*"><\/script>/g, "");
  const version = (quelle.match(/firebase\.js\?v=([0-9a-z-]+)/) || [, ""])[1];
  const miniZeile = `    <script defer src="../mini-games.js${version ? `?v=${version}` : ""}"></script>`;
  html = html.replace(/( *<script defer src="\.\.\/firebase\.js[^"]*"><\/script>)/, `$1\n${miniZeile}`);

  // 6. Und der Hinweis, dass hier niemand von Hand arbeiten soll.
  const kopf = [
    "<!--",
    `  Erzeugt aus ${appSeite} von scripts/generate-mini-games.mjs.`,
    "  Nicht von Hand ändern: Was hier steht, muss dieselben Dateien laden wie",
    "  die Seite in der App – sonst spielt das Mini-Game ein anderes Spiel.",
    "  Ändern heisst: die Seite der App ändern, dann das Skript laufen lassen.",
    "-->",
  ].join("\n");
  html = html.replace(/<!doctype html>\n/i, `<!doctype html>\n${kopf}\n`);

  return html;
}

export function alleSeiten() {
  const spiele = spieleAusModul();
  const seiten = seitenAusSchranke();
  return spiele.map((spiel) => {
    const appSeite = seiten.get(spiel.id);
    if (!appSeite) throw new Error(`entitlement.js kennt das Spiel "${spiel.id}" nicht.`);
    const erwartet = `${spiel.seite}.html`;
    if (appSeite !== erwartet) {
      throw new Error(`mini-games.js sagt "${spiel.seite}", entitlement.js sagt "${appSeite}" für ${spiel.id}.`);
    }
    const quelle = fs.readFileSync(path.join(WURZEL, appSeite), "utf8");
    return { spiel, appSeite, datei: path.join(ZIEL, erwartet), html: baueSeite(spiel, appSeite, quelle) };
  });
}

// ---------------------------------------------------------------------------
// Aufruf von der Kommandozeile
// ---------------------------------------------------------------------------
const direkt = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direkt) {
  const nurPruefen = process.argv.includes("--pruefen");
  const seiten = alleSeiten();
  fs.mkdirSync(ZIEL, { recursive: true });

  const abweichungen = [];
  for (const { datei, html, appSeite } of seiten) {
    const vorhanden = fs.existsSync(datei) ? fs.readFileSync(datei, "utf8") : null;
    if (vorhanden === html) continue;
    abweichungen.push(`${path.relative(WURZEL, datei)} ${vorhanden === null ? "fehlt" : `weicht von ${appSeite} ab`}`);
    if (!nurPruefen) fs.writeFileSync(datei, html);
  }

  // Und keine Seite zu viel: Ein Spiel, das kein Mini-Game mehr ist, lässt
  // sonst eine Adresse zurück, die noch funktioniert.
  const erlaubt = new Set([...seiten.map(({ datei }) => path.basename(datei)), "index.html"]);
  const zuviel = fs.readdirSync(ZIEL).filter((name) => name.endsWith(".html") && !erlaubt.has(name));
  zuviel.forEach((name) => {
    abweichungen.push(`mini-games/${name} gehört zu keinem Mini-Game mehr`);
    if (!nurPruefen) fs.unlinkSync(path.join(ZIEL, name));
  });

  if (nurPruefen) {
    if (abweichungen.length) {
      console.error(`${abweichungen.length} Abweichung${abweichungen.length === 1 ? "" : "en"}:`);
      abweichungen.forEach((zeile) => console.error(`  - ${zeile}`));
      console.error("\nnode scripts/generate-mini-games.mjs schreibt sie neu.");
      process.exit(1);
    }
    console.log(`${seiten.length} Mini-Seiten stimmen mit den Seiten der App überein.`);
  } else {
    console.log(abweichungen.length
      ? `${seiten.length} Mini-Seiten geschrieben, ${abweichungen.length} davon geändert.`
      : `${seiten.length} Mini-Seiten waren schon aktuell.`);
  }
}
