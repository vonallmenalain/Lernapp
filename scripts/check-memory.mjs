/*
 * Memory: aufgedeckte Karten sind ganz da, gefundene Paare melden sich.
 * ---------------------------------------------------------------------------
 * Eine aufgedeckte Karte ist ein abgeschalteter Knopf – sonst liesse sie sich
 * ein zweites Mal antippen. Die App blendet abgeschaltete Knöpfe aber auf
 * knapp die Hälfte aus (button:disabled in styles.css), und genau das ist
 * einer Karte einmal passiert: das Bild lag blass da, und erst das gefundene
 * Paar sah kräftig aus, weil dessen Animation die Deckkraft zurücksetzte.
 *
 * Wie eine Karte wirklich gezeichnet wird, entscheidet sich erst im Browser –
 * eine Regel weiter unten im Stylesheet kann eine weiter oben aufheben.
 * Deshalb fährt diese Prüfung die Seite an und misst, statt im Quelltext zu
 * raten: die Deckkraft der offenen Karte, und ob ein gefundenes Paar sein
 * Zeichen bekommt.
 *
 * Aufruf:  node scripts/check-memory.mjs
 * Nötig:   Playwright (npm i -D playwright). Fehlt es, sagt das Skript das und
 *          hört auf. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4183);
const BASIS = `http://127.0.0.1:${PORT}`;

const befunde = [];
function pruefe(bedingung, text) {
  console.log(`  ${bedingung ? "ok  " : "FEHLER"}  ${text}`);
  if (!bedingung) befunde.push(text);
}

let playwright;
try {
  playwright = await import("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich das Aussehen nicht messen.");
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
      const antwort = await fetch(`${BASIS}/memory.html`);
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

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROMIUM_PFAD || undefined,
  args: ["--no-sandbox"],
});
const sitzung = await browser.newContext({ viewport: { width: 914, height: 411 }, isMobile: true, hasTouch: true });
const blatt = await sitzung.newPage();
// Ohne Netz kommen die Firebase-Skripte nicht; sie sollen nicht warten lassen.
await blatt.route("**/*gstatic.com/**", (route) => route.abort());
await blatt.goto(`${BASIS}/memory.html`, { waitUntil: "load" });
await blatt.waitForTimeout(1400);
await blatt.click('.me-groesse[data-karten="8"]');
await blatt.waitForTimeout(400);

// --- Eine aufgedeckte Karte --------------------------------------------------
console.log("Eine aufgedeckte Karte:");
const offen = await blatt.evaluate(async () => {
  const karten = [...document.querySelectorAll(".me-karte")];
  const zu = getComputedStyle(karten[0]);
  const zuHintergrund = zu.backgroundImage;
  karten[0].click();
  await new Promise((r) => setTimeout(r, 300));
  const auf = getComputedStyle(karten[0]);
  return {
    deckkraft: Number(auf.opacity),
    abgeschaltet: karten[0].disabled,
    klasse: karten[0].className,
    hintergrundZu: zuHintergrund,
    hintergrundAuf: auf.backgroundImage,
    ring: auf.boxShadow,
    bild: karten[0].querySelector(".me-karte-bild")?.textContent || "",
  };
});

pruefe(offen.abgeschaltet, "sie lässt sich nicht noch einmal antippen");
pruefe(offen.klasse.includes("is-offen"), "sie ist als offen markiert");
pruefe(offen.bild.length > 0, "sie zeigt ihr Bild");
pruefe(offen.deckkraft === 1, `sie ist ganz da, nicht blass (Deckkraft ${offen.deckkraft})`);
pruefe(offen.hintergrundAuf !== "none" && offen.hintergrundAuf !== offen.hintergrundZu,
  "sie hat eine eigene Vorderseite, nicht bloss das Bild auf der Tafel");
pruefe(/inset/.test(offen.ring), "die Vorderseite trägt einen Ring in der Farbe des Bereichs");

// --- Ein gefundenes Paar -----------------------------------------------------
// Karte 0 liegt offen; ihre Partnerin wird gesucht, indem eine nach der anderen
// dazu aufgedeckt wird. Passt sie nicht, drehen sich beide zurück.
console.log("\nEin gefundenes Paar:");
const paar = await blatt.evaluate(async () => {
  const w = (ms) => new Promise((r) => setTimeout(r, ms));
  const karten = [...document.querySelectorAll(".me-karte")];
  const gesucht = karten[0].getAttribute("aria-label");
  for (let i = 1; i < karten.length; i += 1) {
    karten[i].click();
    await w(120);
    if (karten[i].getAttribute("aria-label") === gesucht) {
      const a = getComputedStyle(karten[0]);
      const zwischen = {
        klasse: karten[0].className,
        deckkraft: Number(a.opacity),
        hintergrund: a.backgroundImage,
        ring: a.boxShadow,
        animation: a.animationName,
        dauer: a.animationDuration,
        beideMarkiert: karten[0].classList.contains("is-paar") && karten[i].classList.contains("is-paar"),
        nochDa: !karten[0].classList.contains("is-weg"),
      };
      // Und danach sind sie weg.
      await w(1200);
      return { ...zwischen, danachWeg: karten[0].classList.contains("is-weg") };
    }
    await w(1300);
    karten[0].click();
    await w(120);
  }
  return null;
});

if (!paar) {
  pruefe(false, "kein Paar gefunden – die Prüfung konnte nichts messen");
} else {
  pruefe(paar.beideMarkiert, "beide Karten des Paars sind markiert");
  pruefe(paar.nochDa, "sie sind im Moment des Funds noch da – das Zeichen kommt vor dem Verschwinden");
  pruefe(paar.animation === "me-paar", `sie pulsieren einmal (Animation ${paar.animation})`);
  pruefe(parseFloat(paar.dauer) > 0 && parseFloat(paar.dauer) <= 0.8,
    `das Pulsieren ist kurz (${paar.dauer})`);
  pruefe(paar.deckkraft === 1, `sie sind dabei ganz da (Deckkraft ${paar.deckkraft})`);
  pruefe(paar.hintergrund !== offen.hintergrundAuf, "sie sehen anders aus als eine einzelne offene Karte");
  pruefe(paar.danachWeg, "danach sind sie weg");
}

await browser.close();
halt();

if (befunde.length > 0) {
  console.error(`\n${befunde.length} Befund(e):`);
  befunde.forEach((eintrag) => console.error(`  - ${eintrag}`));
  process.exit(1);
}
console.log("\nMemory zeigt jede aufgedeckte Karte ganz und meldet jedes Paar.");
