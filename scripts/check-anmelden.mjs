/*
 * Führt der Anmeldedialog Kind und Eltern getrennt?
 * ---------------------------------------------------------------------------
 * Zwei Reiter: das Kind mit Name und Passwort, die Eltern mit ihrer
 * E-Mail-Adresse. Geprüft wird ohne Firebase (das SDK ist umgeleitet): der
 * Aufbau, der Wechsel, die Felder, dass der zuletzt gewählte Reiter beim
 * nächsten Öffnen wieder vorn steht, und dass der Kind-Reiter kein "Neues
 * Konto" mehr hat – das legen die Eltern an.
 *
 * Aufruf:  node scripts/check-anmelden.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4188);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich der Dialog nicht prüfen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });

async function warteAufServer() {
  for (let versuch = 0; versuch < 50; versuch += 1) {
    try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}

const befunde = [];
const fehlt = (was) => befunde.push(was);

if (!(await warteAufServer())) { console.error("Server antwortet nicht."); process.exit(2); }
const browser = await playwright.chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1024, height: 700 }, serviceWorkers: "block", reducedMotion: "reduce" });
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  const page = await context.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(e.message));

  const oeffne = async () => {
    await page.goto(`${BASIS}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
    await page.locator(".account-button, [aria-label='Login und Profil öffnen']").first().click();
    await page.locator(".auth-tabs").waitFor({ state: "visible", timeout: 5000 });
  };

  await oeffne();
  const tabs = page.locator("[data-auth-tab]");
  if ((await tabs.count()) !== 2) fehlt(`${await tabs.count()} Reiter, erwartet 2`);
  if ((await tabs.nth(0).getAttribute("aria-selected")) !== "true") fehlt("beim ersten Öffnen ist nicht der Kind-Reiter vorn");
  if (!(await page.locator('[data-auth-pane="kind"]').isVisible())) fehlt("Kind-Formular nicht sichtbar");
  if (await page.locator('[data-auth-pane="eltern"]').isVisible()) fehlt("Eltern-Formular sichtbar, obwohl Kind gewählt");
  if (await page.locator('[data-auth-pane="kind"] [data-auth-register]').count()) fehlt("der Kind-Reiter hat noch einen Knopf für ein neues Konto");
  if (!(await page.locator('[data-auth-pane="kind"] input[name="loginName"]').count())) fehlt("Kind: Namensfeld fehlt");
  if ((await page.locator('[data-auth-pane="kind"] input[name="password"]').getAttribute("minlength")) !== "4") fehlt("Kind: Passwort-Mindestlänge ist nicht 4");

  // Wechsel zu den Eltern
  await tabs.nth(1).click();
  await page.waitForTimeout(150);
  if ((await tabs.nth(1).getAttribute("aria-selected")) !== "true") fehlt("Eltern-Reiter nach Klick nicht gewählt");
  if (!(await page.locator('[data-auth-pane="eltern"]').isVisible())) fehlt("Eltern-Formular nach Wechsel nicht sichtbar");
  if (await page.locator('[data-auth-pane="kind"]').isVisible()) fehlt("Kind-Formular nach Wechsel noch sichtbar");
  const email = page.locator('[data-auth-pane="eltern"] input[name="email"]');
  if ((await email.getAttribute("type")) !== "email") fehlt("Eltern: E-Mail-Feld ist kein type=email");
  if ((await page.locator('[data-auth-pane="eltern"] input[name="password"]').getAttribute("minlength")) !== "6") fehlt("Eltern: Passwort-Mindestlänge ist nicht 6");
  for (const [sel, name] of [["[data-auth-register]", "Neues Elternkonto"], ["[data-auth-reset]", "Passwort vergessen"], ["[data-auth-google]", "Google"]]) {
    if (!(await page.locator(`[data-auth-pane="eltern"] ${sel}`).count())) fehlt(`Eltern: Knopf "${name}" fehlt`);
  }
  const gemerkt = await page.evaluate(() => localStorage.getItem("lernapp.login.reiter"));
  if (gemerkt !== "eltern") fehlt(`Reiterwahl nicht gemerkt: ${gemerkt}`);

  // Ohne Firebase sagt jeder Versuch, dass Firebase fehlt – und stürzt nicht ab.
  await email.fill("mama@example.com");
  await page.locator('[data-auth-pane="eltern"] input[name="password"]').fill("geheim123");
  await page.locator('[data-auth-pane="eltern"] button[type="submit"]').click();
  await page.waitForTimeout(150);
  const status = (await page.locator(".auth-status").textContent()) || "";
  if (!/Firebase/.test(status)) fehlt(`ohne Firebase kommt keine klare Meldung: "${status}"`);

  // Der Link im Kind-Reiter führt zu den Eltern; und beim nächsten Öffnen
  // steht der gemerkte Reiter vorn.
  await oeffne();
  if ((await tabs.nth(1).getAttribute("aria-selected")) !== "true") fehlt("beim zweiten Öffnen steht nicht der gemerkte Eltern-Reiter vorn");
  await tabs.nth(0).click();
  await page.locator('[data-auth-switch="eltern"]').click();
  await page.waitForTimeout(150);
  if (!(await page.locator('[data-auth-pane="eltern"]').isVisible())) fehlt("der Hinweis-Link im Kind-Reiter führt nicht zu den Eltern");

  if (/Lernapp/.test((await page.locator(".account-content").textContent()) || "")) fehlt("im Dialog steht noch Lernapp");
  if (fehler.length) fehlt(`JavaScript-Fehler: ${fehler.join(" | ")}`);
  await context.close();
} finally {
  await browser.close();
  halt();
}

if (befunde.length) {
  console.error("Befunde:");
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Der Anmeldedialog führt Kind und Eltern getrennt.");
