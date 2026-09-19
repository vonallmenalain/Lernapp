/*
 * Packt die App für Netlify: nur die Dateien, die der Browser braucht.
 * ---------------------------------------------------------------------------
 * Die App sind die Dateien im Wurzelverzeichnis – daneben liegen aber auch
 * die Werkzeuge (scripts/, node_modules/, package.json), die Regeln der
 * Datenbank, die Doku und der Server (netlify/). Nichts davon gehört auf die
 * Site: node_modules allein sind nach dem Installieren der Server-Pakete gut
 * hundert Megabyte in tausenden Dateien, und ein Deploy, der das hochlädt,
 * bricht ab oder dauert Minuten.
 *
 * Deshalb kopiert dieses Skript, was die App ist, nach dist/ – und Netlify
 * veröffentlicht dist/. Gebaut wird dabei nichts: Es sind dieselben Dateien.
 *
 *   node netlify/build.mjs          (so steht es in netlify.toml)
 */

import { cpSync, mkdirSync, rmSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ZIEL = path.join(WURZEL, "dist");

// Was die App ist: die Seiten, ihre Skripte, das Stylesheet, das Manifest,
// die Icons. Alles im Wurzelverzeichnis, das so endet – und der Ordner icons.
const ENDUNGEN = new Set([".html", ".js", ".css", ".webmanifest"]);
// Und die Bilder der Willkommensseite – sowie die Mini-Games: Sie liegen in
// einem eigenen Ordner, weil ihre Adresse einer ist. kids.alae.app/mini-games
// führt auf mini-games/index.html, kids.alae.app/mini-games/turmbau auf
// mini-games/turmbau.html; beides liefert Netlify von sich aus aus, ohne eine
// einzige Weiterleitungsregel. Die Dateien selbst schreibt
// scripts/generate-mini-games.mjs.
const ORDNER = ["icons", "bilder", "mini-games"];
// Was nie mit soll, auch wenn es die Endung hätte.
const NIE = new Set(["netlify.toml", "package.json", "package-lock.json"]);

rmSync(ZIEL, { recursive: true, force: true });
mkdirSync(ZIEL, { recursive: true });

let dateien = 0;
for (const name of readdirSync(WURZEL)) {
  const quelle = path.join(WURZEL, name);
  if (NIE.has(name) || name.startsWith(".")) continue;
  if (statSync(quelle).isFile() && ENDUNGEN.has(path.extname(name))) {
    cpSync(quelle, path.join(ZIEL, name));
    dateien += 1;
  }
}
for (const ordner of ORDNER) {
  const quelle = path.join(WURZEL, ordner);
  if (!existsSync(quelle)) throw new Error(`Der Ordner ${ordner}/ fehlt.`);
  cpSync(quelle, path.join(ZIEL, ordner), { recursive: true });
  dateien += readdirSync(quelle).length;
}

// Ohne diese beiden ist es keine App: die Startseite und der Service Worker,
// der die installierte App am Laufen hält.
for (const pflicht of ["index.html", "service-worker.js", "app.webmanifest", "styles.css", "mini-games.js", "mini-games/index.html"]) {
  if (!existsSync(path.join(ZIEL, pflicht))) throw new Error(`${pflicht} fehlt in dist/ – die Site wäre kaputt.`);
}
// Und nichts, was nicht hingehört.
for (const verboten of ["node_modules", "scripts", "netlify", "docs", "cloudflare", "firestore.rules", "package.json"]) {
  if (existsSync(path.join(ZIEL, verboten))) throw new Error(`${verboten} ist in dist/ gelandet – das gehört nicht auf die Site.`);
}

console.log(`dist/: ${dateien} Dateien – die App, sonst nichts.`);
