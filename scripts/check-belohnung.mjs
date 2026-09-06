/*
 * Die Feier nach einem geschafften Level – und der Weg danach.
 * ---------------------------------------------------------------------------
 * Nach einem Spiel kommt das Kind auf das Startbild zurück, und wenn ein Wagen
 * gewachsen ist, wird das gefeiert: der Wagen gross, der Balken füllt sich,
 * die Bauart springt nach. Diese Feier hat drei Regeln, und jede davon war
 * schon einmal kaputt:
 *
 *   1. Sie überlebt das Neuzeichnen der Bühne. Firebase meldet sich nach dem
 *      Laden immer, mit oder ohne Konto, und die Bühne wird dann neu gebaut.
 *      Ohne Schutz war die Feier nach einem Wimpernschlag wieder weg.
 *   2. Sie dauert gut drei Sekunden, und ein Tipp mittendrin bricht sie nicht
 *      ab – sie soll gesehen werden.
 *   3. Danach bleibt sie stehen, bis das Kind tippt. Dann erst kommt, falls
 *      fällig, die Nachricht über eine neue Landschaft – und die Bühne ist
 *      wieder frei bedienbar.
 *
 * Aufruf:  node scripts/check-belohnung.mjs
 * Nötig:   Playwright (npm i -D playwright). Fehlt es, sagt das Skript das und
 *          hört auf. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4186);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich der Ablauf nicht prüfen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
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

if (!await warteAufServer()) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

// Ein Stand, bei dem beim Öffnen gefeiert wird: der Wagen Gedächtnis wächst
// von Schritt 2 auf Schritt 6 (Rucksack fünfmal gespielt, Memory in allen fünf
// Grössen geschafft – je drei Schritte), und damit wird die dritte Landschaft
// frei. Vier neue Schritte: die Feier zeigt sie einzeln, 600 ms je Schritt.
function speicherVorbereiten() {
  localStorage.clear();
  localStorage.setItem("lernapp.train.gesehen", JSON.stringify({
    set: "1",
    steps: { gedaechtnis: 2, konzentration: 0, geschwindigkeit: 0, problemloesen: 0, zahlbuchstabe: 0 },
  }));
  localStorage.setItem("lernapp.train.gesehen.szenen", "2");
  localStorage.setItem("lernapp.backpack", JSON.stringify({ runs: 5, scores: [12, 10, 8, 6, 4] }));
  localStorage.setItem("lernapp.memory", JSON.stringify({
    best: { 8: { stars: 3 }, 12: { stars: 3 }, 16: { stars: 3 }, 20: { stars: 3 }, 24: { stars: 3 } },
  }));
  // Zeitpunkte der Feier aufzeichnen: wann sie erscheint, wann sie fertig ist –
  // und jeden gezeichneten Wagen dazwischen: welche Stufe, welches Teil neu.
  window.__feier = { schritte: [] };
  new MutationObserver((aenderungen) => {
    aenderungen.forEach((aenderung) => {
      aenderung.addedNodes.forEach((knoten) => {
        if (knoten.classList?.contains("wagon-reward") && !window.__feier.start) window.__feier.start = performance.now();
        if (knoten.classList?.contains("wagon-reward-svg")) {
          window.__feier.schritte.push({
            at: Math.round(performance.now() - (window.__feier.start || 0)),
            stufe: knoten.querySelector(".train-wagon")?.dataset.stage,
            neu: [...knoten.querySelectorAll(".wagon-step.is-new")].map((node) => node.dataset.step).join(","),
          });
        }
      });
      const ziel = aenderung.target;
      if (aenderung.type === "attributes" && ziel.classList?.contains("wagon-reward") && ziel.classList.contains("is-done") && !window.__feier.fertig) {
        window.__feier.fertig = performance.now();
      }
    });
  }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
}

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROMIUM_PFAD || undefined,
  args: ["--no-sandbox"],
});

const probleme = [];
function pruefe(bedingung, text) {
  console.log(`  ${bedingung ? "ok  " : "FEHL"}  ${text}`);
  if (!bedingung) probleme.push(text);
}
const pause = (blatt, ms) => blatt.waitForTimeout(ms);
const ansicht = (blatt) => blatt.evaluate(() => document.querySelector("#train-stage")?.dataset.view);

async function neueSitzung(optionen = {}) {
  const sitzung = await browser.newContext({
    viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, ...optionen,
  });
  // Firebase liegt auf einem fremden Server; hier bleibt die App bewusst ohne
  // Netz. Das Neuzeichnen, das Firebase auslöst, wird unten von Hand angestossen.
  await sitzung.route("**/*gstatic.com/**", (route) => route.abort());
  return sitzung;
}

// --- Rückkehr aus einem Spiel, mit Feier ------------------------------------
console.log("Rückkehr aus einem Spiel in den Bereich Gedächtnis:");
const sitzung = await neueSitzung();
const blatt = await sitzung.newPage();
const seitenfehler = [];
blatt.on("pageerror", (fehler) => seitenfehler.push(fehler.message));
await blatt.addInitScript(speicherVorbereiten);
await blatt.goto(`${BASIS}/index.html?bereich=gedaechtnis`, { waitUntil: "load" });
await pause(blatt, 700);

pruefe(await ansicht(blatt) === "games", "landet in der Spielauswahl des Bereichs");
pruefe(await blatt.evaluate(() => location.search) === "", "die Adresse ist wieder sauber");
pruefe(await blatt.$(".wagon-reward") !== null, "die Feier erscheint");
pruefe(await blatt.evaluate(() => !document.querySelector(".wagon-reward")?.classList.contains("is-done")), "sie ist noch nicht zum Antippen");

// So meldet sich Firebase nach dem Laden: die Bühne wird neu gebaut.
await blatt.evaluate(() => document.dispatchEvent(new CustomEvent("lernapp:progress-changed")));
await pause(blatt, 300);
pruefe(await blatt.$(".wagon-reward") !== null, "sie überlebt das Neuzeichnen der Bühne");

await blatt.evaluate(() => document.querySelector(".wagon-reward")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await pause(blatt, 200);
pruefe(await blatt.$(".wagon-reward") !== null, "ein Tipp mittendrin bricht sie nicht ab");

await blatt.waitForSelector(".wagon-reward.is-done", { timeout: 6000 }).catch(() => {});
const dauer = await blatt.evaluate(() => Math.round((window.__feier.fertig || 0) - (window.__feier.start || 0)));
pruefe(dauer >= 3300 && dauer <= 3900, `vier Schritte dauern gut dreieinhalb Sekunden (${dauer} ms)`);

// Die Schritte kamen einzeln: erst der alte Wagen, dann Teil 3, 4, 5 und 6 –
// jedes als neu markiert, keines übersprungen, in gleichmässigem Abstand.
const schritte = await blatt.evaluate(() => window.__feier.schritte);
const folge = schritte.map((s) => `${s.stufe}${s.neu ? `+${s.neu}` : ""}`).join(" ");
// Der alte Wagen steht schon, bevor die Feier ins Bild kommt, und wird hier
// deshalb nicht gezählt – danach kommen die vier Schritte, jeder mit seiner
// Marke, und zum Schluss der fertige Wagen ohne Marke.
pruefe(/^(2 )*3\+3 4\+4 5\+5 6\+6 6$/.test(folge), `jeder Schritt einzeln, jeder als neu markiert (${folge})`);
const abstaende = schritte.filter((s) => s.neu).map((s, i, all) => (i ? s.at - all[i - 1].at : null)).filter((n) => n !== null);
pruefe(abstaende.every((n) => n >= 480 && n <= 760), `gleichmässig alle 600 ms (${abstaende.join(", ")} ms)`);
await pause(blatt, 450);
pruefe(await blatt.evaluate(() => getComputedStyle(document.querySelector(".wagon-reward-next")).opacity) === "1", "danach steht der Weiter-Knopf da");
pruefe(await blatt.evaluate(() => document.querySelector(".wagon-reward-svg")?.getAttribute("aria-label")) === "Gedächtnis, Schritt 6 von 15", "der Wagen zeigt den neuen Schritt");
pruefe(await blatt.evaluate(() => document.querySelectorAll(".wagon-reward .reward-dot.is-done").length) === 6, "sechs von fünfzehn Punkten sind voll");
pruefe(await blatt.evaluate(() => document.querySelectorAll(".wagon-reward .train-wagon .wagon-step").length) === 6, "der Wagen trägt seine sechs Schritte");
await pause(blatt, 3000);
pruefe(await blatt.$(".wagon-reward") !== null, "ohne Tipp bleibt sie stehen");

await blatt.click(".wagon-reward-next");
await pause(blatt, 400);
pruefe(await blatt.$(".scene-reward") !== null, "nach dem Tipp kommt die neue Landschaft");
await pause(blatt, 1200);
await blatt.click(".wagon-reward.is-done");
await pause(blatt, 400);
pruefe(await blatt.$(".wagon-reward") === null, "auch sie schliesst per Tipp");
pruefe(await blatt.evaluate(() => localStorage.getItem("lernapp.train.gesehen.szenen")) === "3", "die gesehene Landschaft ist gemerkt");

console.log("Die Bühne danach:");
await blatt.click(".stage-back");
await pause(blatt, 800);
pruefe(await ansicht(blatt) === "areas", "zurück führt zu den Toren");
await blatt.click('[data-gate="konzentration"]');
await pause(blatt, 2600);
pruefe(await ansicht(blatt) === "games", "ein Tor führt in seinen Bereich");
pruefe(await blatt.evaluate(() => document.querySelectorAll("[data-building]").length) === 5, "mit seinen fünf Häusern");
await blatt.click(".stage-back"); await pause(blatt, 800);
await blatt.click(".stage-back"); await pause(blatt, 400);
await blatt.click(".scene-button"); await pause(blatt, 400);
pruefe(await blatt.evaluate(() => [...document.querySelectorAll(".scene-choice")].filter((b) => !b.disabled).length) === 3, "drei Landschaften sind frei");
await blatt.locator(".scene-choice:not(:disabled)").nth(2).click();
await pause(blatt, 600);
pruefe(await blatt.evaluate(() => document.querySelector(".scene")?.dataset.scene) === "dschungel", "die dritte lässt sich wählen");
pruefe(seitenfehler.length === 0, `keine Skriptfehler${seitenfehler.length ? `: ${seitenfehler.join(" | ")}` : ""}`);
await sitzung.close();

// --- Ohne Bewegung -----------------------------------------------------------
console.log("Mit abgeschalteten Animationen:");
const stille = await neueSitzung({ reducedMotion: "reduce" });
const blatt2 = await stille.newPage();
await blatt2.addInitScript(() => {
  localStorage.clear();
  localStorage.setItem("lernapp.train.gesehen", JSON.stringify({
    set: "1",
    steps: { gedaechtnis: 0, konzentration: 0, geschwindigkeit: 0, problemloesen: 0, zahlbuchstabe: 0 },
  }));
  localStorage.setItem("lernapp.train.gesehen.szenen", "2");
  localStorage.setItem("lernapp.fischteich", JSON.stringify({ runs: 2, scores: [5, 3] }));
});
await blatt2.goto(`${BASIS}/index.html`, { waitUntil: "load" });
await pause(blatt2, 500);
pruefe(await blatt2.evaluate(() => document.querySelector(".wagon-reward")?.classList.contains("is-done")) === true, "die Feier steht sofort mit Knopf da");
await blatt2.click(".wagon-reward-next");
await pause(blatt2, 300);
pruefe(await blatt2.$(".wagon-reward") === null, "und schliesst per Knopf");

// Ein zweites Blatt im selben Speicher, ohne neuen Fortschritt.
const blatt3 = await stille.newPage();
await blatt3.goto(`${BASIS}/index.html`, { waitUntil: "load" });
await pause(blatt3, 500);
pruefe(await blatt3.$(".wagon-reward") === null, "ohne neuen Fortschritt gibt es keine Feier");
await stille.close();

// --- Ein anderes Set, ein alter Speicher -------------------------------------
// Nach einem Set-Wechsel gilt der alte Stand nicht mehr: gemerkt wird neu,
// gefeiert wird nichts. Und ein Speicher von früher – nur Anteile, ohne
// Schritte – zählt wie gar keiner.
console.log("Nach einem Set-Wechsel und mit altem Speicher:");
const wechsel = await neueSitzung();
const blatt4 = await wechsel.newPage();
await blatt4.addInitScript(() => {
  localStorage.clear();
  localStorage.setItem("lernapp.train.set", JSON.stringify({ id: "2", switchedAtMs: 5 }));
  localStorage.setItem("lernapp.train.gesehen", JSON.stringify({
    set: "1",
    steps: { gedaechtnis: 0, konzentration: 0, geschwindigkeit: 0, problemloesen: 0, zahlbuchstabe: 0 },
  }));
  localStorage.setItem("lernapp.fischteich", JSON.stringify({ runs: 3, scores: [5, 3, 2] }));
});
await blatt4.goto(`${BASIS}/index.html`, { waitUntil: "load" });
await pause(blatt4, 600);
pruefe(await blatt4.$(".wagon-reward") === null, "nach dem Set-Wechsel wird der alte Stand nicht gefeiert");
pruefe(await blatt4.evaluate(() => document.querySelector('[data-area="konzentration"]')?.dataset.wagon) === "whale", "der Wagen ist jetzt der Wal");
pruefe(await blatt4.evaluate(() => JSON.parse(localStorage.getItem("lernapp.train.gesehen")).set) === "2", "gemerkt wird für das neue Set");
pruefe(await blatt4.evaluate(() => JSON.parse(localStorage.getItem("lernapp.train.gesehen")).steps.konzentration) === 1, "drei Runden Fischteich sind im zweiten Set ein Schritt");

const blatt5 = await wechsel.newPage();
await blatt5.addInitScript(() => {
  localStorage.setItem("lernapp.fischteich", JSON.stringify({ runs: 6, scores: [5, 3, 2, 2, 1] }));
});
await blatt5.goto(`${BASIS}/index.html`, { waitUntil: "load" });
await pause(blatt5, 600);
pruefe(await blatt5.$(".wagon-reward") !== null, "drei weitere Runden werden im neuen Set gefeiert");
pruefe(await blatt5.evaluate(() => document.querySelector(".wagon-reward .train-wagon")?.dataset.wagon) === "whale", "gefeiert wird der Wal");
await wechsel.close();

const alt = await neueSitzung();
const blatt6 = await alt.newPage();
await blatt6.addInitScript(() => {
  localStorage.clear();
  localStorage.setItem("lernapp.train.gesehen", JSON.stringify({ gedaechtnis: 0.15, konzentration: 0 }));
  localStorage.setItem("lernapp.fischteich", JSON.stringify({ runs: 3, scores: [5, 3, 2] }));
});
await blatt6.goto(`${BASIS}/index.html`, { waitUntil: "load" });
await pause(blatt6, 600);
pruefe(await blatt6.$(".wagon-reward") === null, "ein Speicher von früher löst keine Feier aus");
pruefe(await blatt6.evaluate(() => JSON.parse(localStorage.getItem("lernapp.train.gesehen")).steps?.konzentration) === 2, "er wird in Schritte übersetzt");
await alt.close();

await browser.close();
halt();

if (probleme.length) {
  console.error(`\n${probleme.length} Problem(e):`);
  probleme.forEach((problem) => console.error(`  - ${problem}`));
  process.exit(1);
}
console.log("\nDie Feier läuft, wie sie soll.");
