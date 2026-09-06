/*
 * Kommt man wirklich an die Bestenliste der Gruppe?
 * ---------------------------------------------------------------------------
 * Die Rechnung dahinter prüft validate-bestenliste.mjs ohne Browser. Hier geht
 * es um den Weg: Zug eines anderen antippen, Wagen antippen, Spiel antippen –
 * und steht dann die Liste da, mit allen aus der Gruppe und mit dem eigenen
 * Namen darin?
 *
 * Der Weg ist der Punkt. Eine Bestenliste, die nach jedem Level erscheint,
 * drängt einem Kind den Vergleich auf; eine, die man selbst öffnet, beantwortet
 * eine Frage, die es gestellt hat. Deshalb hängt sie am fremden Zug, und
 * deshalb wird hier geprüft, dass sie genau dort hängt.
 *
 * Die Gruppe kommt nicht aus Firestore: das Skript hängt sich an
 * LernappFirebase und liefert erfundene Konten. Geprüft wird die Bühne, nicht
 * die Anmeldung.
 *
 * Aufruf:  node scripts/check-bestenliste.mjs
 * Nötig:   Playwright (npm i -D playwright).
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4183);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich der Weg nicht abgehen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  console.error("Oder eine vorhandene Installation über NODE_PATH bekannt machen.");
  process.exit(2);
}

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], {
  cwd: WURZEL,
  stdio: "ignore",
});
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });

async function warteAufServer() {
  for (let versuch = 0; versuch < 50; versuch += 1) {
    try {
      const antwort = await fetch(`${BASIS}/index.html`);
      if (antwort.ok) return true;
    } catch { /* noch nicht da */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}

// Drei Konten: zwei andere und das eigene. Mia hat den besseren Turm, Ben ist
// das eigene Kind, Lea hat noch nichts gespielt und muss trotzdem in der Liste
// stehen.
const GRUPPE = [
  {
    id: "u-mia", name: "Mia", eigen: false, loco: null,
    gameState: { "lernapp.turmbau": { data: { runs: 4, scores: [21, 12] }, updatedAt: 1 } },
    solved: ["arukone.a1"],
    levels: [{ id: "arukone_a1", game: "arukone", levelId: "a1", levelName: "Rätsel eins", difficulty: "easy", solved: true, timeSeconds: 90, moves: 30, resets: 1, attempts: 2 }],
  },
  {
    id: "u-ben", name: "Ben", eigen: true, loco: null,
    gameState: { "lernapp.turmbau": { data: { runs: 9, scores: [14, 8] }, updatedAt: 1 } },
    solved: [],
    levels: [],
  },
  {
    id: "u-lea", name: "Lea", eigen: false, loco: null,
    gameState: {}, solved: [], levels: [],
  },
];

const befunde = [];
function pruefe(bedingung, meldung) { if (!bedingung) befunde.push(meldung); }

if (!(await warteAufServer())) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
await page.goto(`${BASIS}/index.html`, { waitUntil: "networkidle" });
// Der Zug wartet auf die erste Berührung, bevor er hereinfährt.
await page.mouse.click(4, 4);
await page.waitForTimeout(2800);

// Die Gruppe unterschieben und die Bühne davon in Kenntnis setzen – genau der
// Weg, den auch eine echte Anmeldung nimmt.
await page.evaluate((gruppe) => {
  window.LernappFirebase = window.LernappFirebase || {};
  window.LernappFirebase.getGroup = () => ({ id: "pruefung", name: "Prüfung", displayName: "Ben" });
  window.LernappFirebase.loadGroupMembers = async () => gruppe;
  window.LernappFirebase.loadGroupTrains = async () => gruppe.filter((eintrag) => !eintrag.eigen);
  document.dispatchEvent(new CustomEvent("lernapp:group-changed", { detail: { id: "pruefung" } }));
}, GRUPPE);
await page.waitForTimeout(900);

const zuege = await page.locator(".friend-train").count();
pruefe(zuege === 2, `Über dem eigenen Zug stehen ${zuege} fremde Züge, erwartet 2 (das eigene Konto gehört nicht aufs Gleis)`);

const namen = await page.locator(".friend-name").allTextContents();
pruefe(!namen.includes("Ben"), `Das eigene Kind steht als fremder Zug auf dem Gleis: ${namen.join(", ")}`);

// Zug von Mia antippen.
await page.locator('.friend-train[data-friend="u-mia"]').click();
await page.waitForTimeout(700);
pruefe(await page.locator(".friend-detail").count() === 1, "Der Zug von Mia geht nicht auf");

// Auf den Wagen "Geschwindigkeit" – dort liegt Turmbau.
await page.locator('.friend-detail-train [data-area="geschwindigkeit"]').click();
await page.waitForTimeout(500);

const kisten = await page.locator(".wagon-crate").count();
pruefe(kisten === 5, `Im Wagen stehen ${kisten} Kisten, erwartet 5`);

// Und auf Turmbau: hier muss die Bestenliste aufgehen.
await page.locator('.wagon-crate[data-game="towerStack"]').click();
await page.waitForTimeout(500);

pruefe(await page.locator(".highscore").count() === 1, "Die Bestenliste geht nicht auf");
const titel = await page.locator(".highscore-title").textContent().catch(() => "");
pruefe(titel?.trim() === "Turmbau", `Die Bestenliste zeigt "${titel?.trim()}", erwartet "Turmbau"`);

const zeilen = await page.locator(".highscore-row").count();
pruefe(zeilen === 3, `In der Bestenliste stehen ${zeilen} Zeilen, erwartet 3 – auch wer nichts gespielt hat, gehört dazu`);

const reihenfolge = await page.locator(".highscore-name").allTextContents();
pruefe(reihenfolge[0]?.trim() === "Mia", `Vorn steht "${reihenfolge[0]?.trim()}", erwartet Mia mit 21 Blöcken`);
pruefe(reihenfolge[1]?.trim() === "Ben (du)", `Auf Platz 2 steht "${reihenfolge[1]?.trim()}", erwartet "Ben (du)"`);
pruefe(reihenfolge[2]?.trim() === "Lea", `Am Ende steht "${reihenfolge[2]?.trim()}", erwartet Lea`);

const eigen = await page.locator(".highscore-row.is-me .highscore-name").textContent().catch(() => "");
pruefe(eigen?.includes("Ben"), "Die eigene Zeile ist nicht hervorgehoben");

const bester = await page.locator(".highscore-row").first().locator(".highscore-value strong").textContent();
pruefe(bester?.trim() === "21 Blöcke", `Der Bestwert steht als "${bester?.trim()}" da`);

// Zurück muss an den Zug von Mia führen, nicht auf das Startbild.
await page.locator(".stage-back").click();
await page.waitForTimeout(700);
pruefe(await page.locator(".friend-detail").count() === 1, "Zurück aus der Bestenliste führt nicht an den Zug zurück");

// Ein Spiel mit Leveln: die Auswahl muss da sein, und ein Level muss sich
// wählen lassen.
await page.locator('.friend-detail-train [data-area="problemloesen"]').click();
await page.waitForTimeout(500);
await page.locator('.wagon-crate[data-game="arukone"]').click();
await page.waitForTimeout(500);

const chips = await page.locator(".highscore-chip").allTextContents();
pruefe(chips.length === 2, `Die Level-Auswahl hat ${chips.length} Einträge, erwartet 2 (Gesamt und ein gespieltes Level)`);
pruefe(chips[0]?.trim() === "Gesamt", `Der erste Eintrag heisst "${chips[0]?.trim()}", erwartet "Gesamt"`);

if (chips.length > 1) {
  await page.locator(".highscore-chip").nth(1).click();
  await page.waitForTimeout(400);
  const zeit = await page.locator(".highscore-row").first().locator(".highscore-value strong").textContent();
  pruefe(zeit?.trim() === "1 min 30 s", `Im Level steht als Bestwert "${zeit?.trim()}", erwartet die gebrauchte Zeit "1 min 30 s"`);
}

// Auf dem eigenen Zug bleibt alles, wie es war: dort führt eine Kiste ins
// Spiel und nicht in die Bestenliste.
await page.locator(".stage-back").click();
await page.waitForTimeout(700);
await page.locator(".stage-back").click();
await page.waitForTimeout(900);
await page.locator('.train-band [data-area="geschwindigkeit"]').click();
await page.waitForTimeout(600);
const eigenerKnopf = await page.locator('.wagon-detail .wagon-crate[data-page="turmbau.html"]').count();
pruefe(eigenerKnopf === 1, "Am eigenen Wagen führt die Kiste nicht mehr ins Spiel");

await browser.close();
halt();

if (befunde.length) {
  console.error(`${befunde.length} Befund(e):`);
  befunde.forEach((zeile) => console.error(`  - ${zeile}`));
  process.exit(1);
}

console.log("Bestenliste geprüft: fremder Zug, Wagen, Spiel, Level – und der Rückweg stimmt.");
