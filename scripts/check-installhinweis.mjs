/*
 * Kommt der Hinweis "auf den Startbildschirm" – und nur dann, wenn er soll?
 * ---------------------------------------------------------------------------
 * Nach dem ersten Wagenschritt bekommen die Eltern einmal den Vorschlag, die
 * App zu installieren. Was sie sehen, hängt am Gerät (pwa.js): Chrome kann den
 * Dialog des Browsers selbst aufrufen, Safari auf dem iPhone braucht die
 * Anleitung mit Teilen und "Zum Home-Bildschirm", der eingebaute Browser von
 * Instagram kann gar nichts – dort heisst es zuerst "in Safari öffnen". Eine
 * installierte App bekommt keinen Hinweis, und wer ihn einmal weggedrückt hat,
 * sieht ihn nicht wieder.
 *
 * Geprüft wird je Gerät:
 *   1. Erster Besuch merkt sich den Stand, feiert nichts.
 *   2. Ein gelöstes Level lässt den Wagen wachsen: Feier, dann der Hinweis.
 *   3. Der Hinweis zeigt die richtige Fassung und die richtigen Knöpfe.
 *   4. Nach dem Wegdrücken steht die Marke im Speicher, und ein weiteres
 *      Wachstum bringt ihn nicht zurück.
 *
 * Aufruf:  node scripts/check-installhinweis.mjs
 * Nötig:   Playwright (npm i -D playwright). Fehlt es, sagt das Skript das und
 *          hört auf. Der lokale Server wird selbst gestartet und beendet.
 *          Mit SCREENSHOTS=1 landen Bilder der Dialoge unter /tmp.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4187);
const BASIS = `http://127.0.0.1:${PORT}`;
const SCREENSHOTS = process.env.SCREENSHOTS === "1";

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich der Dialog nicht prüfen.");
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

const UA = {
  iphoneSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iphoneInstagram: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0.0.0",
  androidChrome: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
};

const GERAETE = [
  {
    name: "iPhone, Safari",
    userAgent: UA.iphoneSafari,
    erwartet: { fassung: "ios-safari", knopf: "Verstanden", schritte: 2, textEnthaelt: "richtige App", spaeter: false },
  },
  {
    name: "iPhone, im Instagram-Browser",
    userAgent: UA.iphoneInstagram,
    erwartet: { fassung: "ios-inapp", knopf: "Verstanden", schritte: 2, textEnthaelt: "Safari", spaeter: false, knopfImBild: true },
  },
  {
    name: "Android, Chrome mit beforeinstallprompt",
    userAgent: UA.androidChrome,
    // Chrome meldet die Installierbarkeit als Ereignis. Hier kommt es aus der
    // Hand, samt prompt() und userChoice, damit der Knopf etwas zu tun hat.
    init: () => {
      window.addEventListener("load", () => {
        const ev = new Event("beforeinstallprompt");
        ev.prompt = () => { window.__promptCalls = (window.__promptCalls || 0) + 1; };
        ev.userChoice = Promise.resolve({ outcome: "accepted" });
        window.dispatchEvent(ev);
      });
    },
    erwartet: { fassung: "prompt", knopf: "Installieren", schritte: 0, textEnthaelt: "Vollbild", spaeter: true, promptAufrufe: 1 },
  },
  {
    name: "iPhone, schon installiert",
    userAgent: UA.iphoneSafari,
    init: () => { Object.defineProperty(navigator, "standalone", { get: () => true }); },
    erwartet: { keinHinweis: true },
  },
];

const befunde = [];
const fehlt = (wo, was) => befunde.push(`${wo}: ${was}`);

// Lädt das Startbild. Die Feiern kommen ohne Berührung – sie hängen am
// Aufbau, nicht an der Einfahrt des Zugs. Ein blinder Tipp in die Ecke träfe
// eine Feier und schlösse sie, bevor der Test sie sieht; deshalb wird nur
// getippt, wenn nichts über der Bühne liegt.
async function starte(page) {
  await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.LernappLevelCatalog && window.LernappInstall), null, { timeout: 10000 });
  await page.waitForTimeout(500);
  if (!(await page.locator(".wagon-reward").count())) await page.mouse.click(4, 4);
  await page.waitForTimeout(400);
}

// Schliesst die Wagen-Feier, sofern eine da ist, und meldet, ob eine da war.
async function feierSchliessen(page) {
  const feier = page.locator(".wagon-reward:not(.install-hint)").first();
  const da = await feier.waitFor({ state: "visible", timeout: 3000 }).then(() => true).catch(() => false);
  if (!da) return false;
  await page.waitForTimeout(300);
  await feier.click({ position: { x: 8, y: 8 }, timeout: 2000 }).catch(() => {});
  await page.waitForTimeout(400);
  return true;
}

// Ein weiteres Level derselben Art lösen – im Set 1 wächst der Wagen nach 1,
// 3 und 5 Leveln, zwei gelöste sind also noch kein neuer Schritt; deshalb
// wird hier je Aufruf bis zum nächsten Schritt aufgefüllt.
async function loeseLevel(page, anzahl) {
  await page.evaluate((n) => {
    const levels = window.LernappLevelCatalog?.arukone || [];
    for (let i = 0; i < n && i < levels.length; i += 1) {
      const id = levels[i].id || levels[i].levelName;
      localStorage.setItem(`lernapp.solved.arukone.${id}`, "1");
    }
  }, anzahl);
}

async function pruefe(browser, geraet) {
  // Ohne Service Worker: der würde das Firebase-SDK von einem fremden Server
  // in seinen Cache holen, an jeder Umleitung dieses Tests vorbei – und ohne
  // Netz bliebe die Seite daran hängen.
  const context = await browser.newContext({
    userAgent: geraet.userAgent,
    viewport: { width: 844, height: 390 },
    reducedMotion: "reduce",
    hasTouch: true,
    isMobile: true,
    serviceWorkers: "block",
  });
  if (geraet.init) await context.addInitScript(geraet.init);
  // Das Firebase-SDK kommt von einem fremden Server. Ohne Netz bliebe die
  // Seite daran hängen – und gebraucht wird es hier nicht: geprüft wird der
  // Gast ohne Konto, dessen Stand auf dem Gerät liegt.
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  await context.route("**/*googleapis.com/**", (route) => route.abort());
  const page = await context.newPage();
  const wo = geraet.name;
  const e = geraet.erwartet;

  const schritt = (s) => { if (process.env.DEBUG) console.log(`   [${wo}] ${s}`); };
  try {
    // 1. Erster Besuch: nur merken.
    schritt("erster Besuch");
    await starte(page);
    if (await page.locator(".wagon-reward").count()) fehlt(wo, "beim ersten Besuch wird schon gefeiert");

    // 2. Ein Level lösen, neu laden: Feier, dann der Hinweis.
    await loeseLevel(page, 1);
    schritt("Level gelöst, neu laden");
    await starte(page);
    if (!(await feierSchliessen(page))) fehlt(wo, "nach dem gelösten Level kommt keine Wagen-Feier");

    const hint = page.locator(".install-hint");
    if (e.keinHinweis) {
      await page.waitForTimeout(600);
      if (await hint.count()) fehlt(wo, "installierte App bekommt trotzdem den Hinweis");
      const marke = await page.evaluate(() => localStorage.getItem("lernapp.install.hinweis"));
      if (marke) fehlt(wo, `Marke gesetzt, obwohl nichts gezeigt wurde: ${marke}`);
      return;
    }

    schritt("warte auf den Hinweis");
    await hint.waitFor({ state: "visible", timeout: 5000 }).catch(() => fehlt(wo, "der Hinweis erscheint nicht nach der Feier"));
    if (!(await hint.count())) return;

    if (SCREENSHOTS) await page.screenshot({ path: path.join("/tmp", `installhinweis-${e.fassung}.png`) });

    // 3. Die richtige Fassung.
    const fassung = await page.evaluate(() => window.LernappInstall?.platform());
    if (fassung !== e.fassung) fehlt(wo, `Fassung ${fassung}, erwartet ${e.fassung}`);
    const titel = await hint.locator(".install-hint-title").textContent();
    if (!/Gripszug auf den Startbildschirm/.test(titel || "")) fehlt(wo, `Titel: ${titel}`);
    const text = (await hint.locator(".install-hint-text").textContent()) || "";
    if (!text.includes(e.textEnthaelt)) fehlt(wo, `Text nennt nicht "${e.textEnthaelt}": ${text}`);
    const schritte = await hint.locator(".install-hint-step").count();
    if (schritte !== e.schritte) fehlt(wo, `${schritte} Schritte, erwartet ${e.schritte}`);
    const primary = hint.locator(".install-hint-primary");
    if ((await primary.textContent())?.trim() !== e.knopf) fehlt(wo, `Knopf heisst "${await primary.textContent()}", erwartet "${e.knopf}"`);
    const spaeter = await hint.locator(".install-hint-later").count();
    if (Boolean(spaeter) !== e.spaeter) fehlt(wo, `"Später"-Knopf ${spaeter ? "da" : "fehlt"}, erwartet ${e.spaeter ? "da" : "keiner"}`);
    if (/Lernapp/.test(await hint.textContent() || "")) fehlt(wo, "im Hinweis steht noch Lernapp");

    // Passt die Tafel samt Knopf ins Bild? Im Querformat eines Handys ist
    // wenig Höhe – ein Knopf unter dem Rand wäre ohne Blättern unerreichbar.
    const knopfBox = await primary.boundingBox();
    const bild = page.viewportSize();
    if (!knopfBox || knopfBox.y + knopfBox.height > bild.height + 1) fehlt(wo, `der Knopf ragt unter den Rand (${knopfBox ? Math.round(knopfBox.y + knopfBox.height) : "?"} > ${bild.height})`);

    // Ein Tipp neben die Tafel schliesst nichts – Eltern lesen.
    await page.mouse.click(6, 6);
    await page.waitForTimeout(200);
    if (!(await hint.count())) fehlt(wo, "ein Tipp neben die Tafel hat den Hinweis geschlossen");

    // 4. Wegdrücken: Marke gesetzt, Hinweis weg, kommt nicht wieder.
    await primary.click();
    await page.waitForTimeout(400);
    if (await hint.count()) fehlt(wo, "der Hinweis bleibt nach dem Knopf stehen");
    if (e.promptAufrufe !== undefined) {
      const calls = await page.evaluate(() => window.__promptCalls || 0);
      if (calls !== e.promptAufrufe) fehlt(wo, `prompt() ${calls}× aufgerufen, erwartet ${e.promptAufrufe}×`);
    }
    const marke = await page.evaluate(() => localStorage.getItem("lernapp.install.hinweis"));
    if (marke !== "gezeigt") fehlt(wo, `Marke nach dem Wegdrücken: ${marke}`);

    await loeseLevel(page, 3);
    await starte(page);
    if (!(await feierSchliessen(page))) fehlt(wo, "nach drei gelösten Leveln kommt kein zweiter Schritt");
    await page.waitForTimeout(600);
    if (await hint.count()) fehlt(wo, "der Hinweis kommt beim nächsten Wachstum wieder");
  } finally {
    await context.close();
  }
}

if (!(await warteAufServer())) {
  console.error(`Der lokale Server auf ${BASIS} antwortet nicht.`);
  process.exit(2);
}

const browser = await playwright.chromium.launch();
try {
  for (const geraet of GERAETE) {
    await pruefe(browser, geraet);
    console.log(`${befunde.some((b) => b.startsWith(geraet.name)) ? "✘" : "✔"} ${geraet.name}`);
  }
} finally {
  await browser.close();
  halt();
}

if (befunde.length) {
  console.error("\nBefunde:");
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("\nDer Hinweis kommt, wo er soll – und nur dort.");
