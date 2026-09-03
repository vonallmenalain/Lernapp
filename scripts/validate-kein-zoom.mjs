/*
 * Lässt sich die App noch hineinziehen?
 * ---------------------------------------------------------------------------
 * Nein, und das muss so bleiben. Die App füllt das Bild und rechnet damit,
 * dass sie es ganz hat: der Zug wird auf die Fensterbreite gemessen, die
 * Spielfelder auf die Fensterhöhe. Ein Ausschnitt davon ist keine kleinere
 * App, sondern eine halbe – und ein Kind, das versehentlich hineingezogen hat,
 * findet allein nicht mehr heraus.
 *
 * Verhindert wird der Zoom an drei Stellen, weil keine allein auf jedem Gerät
 * greift. Diese Prüfung hält alle drei fest:
 *
 *   1. Jede Seite trägt ein <meta viewport> mit user-scalable=no und
 *      maximum-scale=1 – für Android und für die installierte App.
 *   2. Das Stylesheet setzt touch-action auf html und body: das nimmt das
 *      Auseinanderziehen weg und lässt das Wischen stehen.
 *   3. kids.js sagt die gesture-Ereignisse ab – der einzige Weg auf dem iPhone,
 *      wo Safari die beiden anderen ignoriert.
 *
 * Läuft ohne Browser: gelesen werden die Dateien selbst.
 *
 * Aufruf:  node scripts/validate-kein-zoom.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const fehler = [];
function pruefe(bedingung, meldung) { if (!bedingung) fehler.push(meldung); }

// --- 1. Jede Seite ----------------------------------------------------------
const seiten = fs.readdirSync(root).filter((name) => name.endsWith(".html")).sort();
pruefe(seiten.length > 10, `Nur ${seiten.length} Seiten gefunden – stimmt der Ordner?`);

seiten.forEach((name) => {
  const html = fs.readFileSync(path.join(root, name), "utf8");
  const treffer = html.match(/<meta\s+name="viewport"\s+content="([^"]*)"/i);
  if (!treffer) { fehler.push(`${name}: kein <meta viewport>`); return; }
  const inhalt = treffer[1].replace(/\s+/g, "");
  pruefe(inhalt.includes("user-scalable=no"), `${name}: viewport ohne user-scalable=no`);
  pruefe(inhalt.includes("maximum-scale=1"), `${name}: viewport ohne maximum-scale=1`);
  pruefe(inhalt.includes("width=device-width"), `${name}: viewport ohne width=device-width`);
});

// --- 2. Das Stylesheet ------------------------------------------------------
// Gesucht wird in den Regeln für html und body, nicht irgendwo: ein
// touch-action an einem Spielfeld weiter unten hilft dem Rest der Seite nicht.
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
["html", "body"].forEach((wahl) => {
  const block = css.match(new RegExp(`(^|\\n)${wahl}\\s*\\{([^}]*)\\}`));
  pruefe(Boolean(block), `styles.css: keine Regel für ${wahl}`);
  if (block) {
    const regeln = block[2].replace(/\s+/g, " ");
    pruefe(/touch-action:\s*pan-x pan-y/.test(regeln), `styles.css: ${wahl} ohne touch-action: pan-x pan-y`);
  }
});

// --- 3. Die gesture-Ereignisse ----------------------------------------------
const kids = fs.readFileSync(path.join(root, "kids.js"), "utf8");
["gesturestart", "gesturechange", "gestureend"].forEach((typ) => {
  pruefe(kids.includes(typ), `kids.js: ${typ} wird nicht abgefangen`);
});
pruefe(/blockZoom\s*\(\s*\)/.test(kids), "kids.js: blockZoom() wird nicht aufgerufen");
// Zwei Finger zieht man auseinander; einer wischt. Nur der zweite darf
// abgesagt werden, sonst steht in den Spielen jedes Ziehen still.
pruefe(/touches\.length\s*>\s*1/.test(kids), "kids.js: der Zwei-Finger-Fall fehlt");

if (fehler.length) {
  console.error(`${fehler.length} Befund(e):`);
  fehler.forEach((zeile) => console.error(`  - ${zeile}`));
  process.exit(1);
}

console.log(`Kein Zoom: ${seiten.length} Seiten, Stylesheet und kids.js halten dicht.`);
