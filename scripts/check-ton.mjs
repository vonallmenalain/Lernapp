/*
 * Der Ton-Knopf oben rechts, im Browser.
 * ---------------------------------------------------------------------------
 *   Anfang      Ohne Einstellung steht er auf «Ton ohne Musik»: Die Musik des
 *               Startbilds spielt nicht, Klänge und Stimme schon.
 *   Auswahl     Ein Tipp öffnet die Auswahl mit drei Möglichkeiten (Ton und
 *               Musik, Ton ohne Musik, Alles stumm), die gewählte ist
 *               angehakt; Escape und ein Tipp daneben schliessen sie.
 *   Musik       «Ton und Musik» lässt die Musik spielen und bleibt nach dem
 *               Neuladen; «Ton ohne Musik» hält sie an, ohne die Töne
 *               auszuschalten; «Alles stumm» schaltet alles ab – auch die
 *               Stimme –, und der Knopf zeigt es.
 *   Lage        Die Auswahl liegt ganz im Bild und deckt den Knopf nicht zu –
 *               am Laptop und auf dem Handy quer – und auch auf einer
 *               Spielseite.
 *
 * Aufruf:  node scripts/check-ton.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4251);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich der Ton-Knopf nicht prüfen."); process.exit(2); }

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
async function warteAufServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht */ } await new Promise((w) => setTimeout(w, 100)); }
  return false;
}
const befunde = [];
const fehlt = (was) => befunde.push(was);
const warte = (ms) => new Promise((w) => setTimeout(w, ms));
const KNOPF = ".sound-toggle:not(.tts-toggle)";

try {
  if (!(await warteAufServer())) throw new Error("Der lokale Server startet nicht.");
  const browser = await playwright.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  for (const [name, viewport] of [["Laptop", { width: 1280, height: 800 }], ["Handy", { width: 844, height: 390 }]]) {
    const kontext = await browser.newContext({ viewport });
    await kontext.route("**/*gstatic.com/**", (r) => r.abort());
    const seite = await kontext.newPage();
    const fehler = [];
    seite.on("pageerror", (e) => fehler.push(e.message));
    await seite.goto(`${BASIS}/index.html`);
    await seite.waitForSelector(KNOPF);
    await seite.mouse.click(viewport.width / 2, viewport.height - 6);
    await warte(1500);
    const zustand = () => seite.evaluate(() => ({ modus: window.LernappKids.tonModus(), musik: window.LernappKids.musicPlaying(), ton: window.LernappKids.audioEnabled() }));
    let z = await zustand();
    if (z.modus !== "ton" || z.musik || !z.ton) fehlt(`${name}: Am Anfang nicht «Ton ohne Musik» (${JSON.stringify(z)})`);
    // Die Auswahl
    await seite.click(KNOPF);
    await warte(250);
    const menue = await seite.evaluate((sel) => {
      const m = document.querySelector(".ton-menue");
      if (!m || m.hidden) return null;
      const r = m.getBoundingClientRect();
      const k = document.querySelector(sel).getBoundingClientRect();
      return {
        modi: [...m.querySelectorAll("[data-ton-modus]")].map((b) => b.dataset.tonModus),
        an: m.querySelector('[aria-checked="true"]')?.dataset.tonModus,
        drin: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
        deckt: r.top < k.bottom - 1,
        expanded: document.querySelector(sel).getAttribute("aria-expanded"),
      };
    }, KNOPF);
    if (!menue) fehlt(`${name}: Ein Tipp auf den Knopf öffnet keine Auswahl`);
    else {
      if (menue.modi.join() !== "musik,ton,stumm") fehlt(`${name}: Die Auswahl bietet nicht Ton und Musik, Ton ohne Musik, Alles stumm (${menue.modi})`);
      if (menue.an !== "ton") fehlt(`${name}: Angehakt ist ${menue.an} statt «Ton ohne Musik»`);
      if (!menue.drin) fehlt(`${name}: Die Auswahl ragt aus dem Bild`);
      if (menue.deckt) fehlt(`${name}: Die Auswahl deckt den Knopf zu`);
      if (menue.expanded !== "true") fehlt(`${name}: Der Knopf meldet nicht, dass die Auswahl offen ist`);
    }
    await seite.keyboard.press("Escape");
    await warte(100);
    if (await seite.evaluate(() => !document.querySelector(".ton-menue")?.hidden)) fehlt(`${name}: Escape schliesst die Auswahl nicht`);
    // Ton und Musik
    await seite.click(KNOPF);
    await seite.click('.ton-menue [data-ton-modus="musik"]');
    await warte(1200);
    z = await zustand();
    if (z.modus !== "musik" || !z.musik) fehlt(`${name}: «Ton und Musik» lässt die Musik nicht spielen (${JSON.stringify(z)})`);
    if (!(await seite.evaluate((sel) => document.querySelector(sel).classList.contains("music-on"), KNOPF))) fehlt(`${name}: Der Knopf zeigt nicht, dass die Musik an ist`);
    await seite.reload();
    await seite.waitForSelector(KNOPF);
    await seite.mouse.click(viewport.width / 2, viewport.height - 6);
    await warte(1500);
    z = await zustand();
    if (z.modus !== "musik" || !z.musik) fehlt(`${name}: Nach dem Neuladen spielt die gewählte Musik nicht (${JSON.stringify(z)})`);
    // Ton ohne Musik
    await seite.click(KNOPF);
    await seite.click('.ton-menue [data-ton-modus="ton"]');
    await warte(600);
    z = await zustand();
    if (z.musik || !z.ton) fehlt(`${name}: «Ton ohne Musik» hält die Musik nicht an oder schaltet den Ton ab (${JSON.stringify(z)})`);
    // Alles stumm, und ein Tipp daneben schliesst
    await seite.click(KNOPF);
    await seite.click('.ton-menue [data-ton-modus="stumm"]');
    await warte(300);
    z = await zustand();
    if (z.ton || z.musik) fehlt(`${name}: «Alles stumm» lässt etwas klingen (${JSON.stringify(z)})`);
    if (!(await seite.evaluate((sel) => document.querySelector(sel).classList.contains("muted"), KNOPF))) fehlt(`${name}: Der Knopf zeigt «stumm» nicht`);
    const stimme = await seite.evaluate(() => new Promise((fertig) => {
      let gespielt = false;
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () { gespielt = true; return play.call(this); };
      const synth = window.speechSynthesis;
      const sprach = synth?.speak?.bind(synth);
      if (synth) synth.speak = () => { gespielt = true; };
      window.LernappKids.speak("Hallo.", { onEnd: () => fertig({ gespielt, gleich: true }) });
      setTimeout(() => { if (synth && sprach) synth.speak = sprach; fertig({ gespielt, gleich: false }); }, 400);
    }));
    if (stimme.gespielt || !stimme.gleich) fehlt(`${name}: Bei «Alles stumm» spricht die Stimme noch (${JSON.stringify(stimme)})`);
    await seite.click(KNOPF);
    await seite.mouse.click(30, viewport.height / 2);
    await warte(150);
    if (await seite.evaluate(() => !document.querySelector(".ton-menue")?.hidden)) fehlt(`${name}: Ein Tipp daneben schliesst die Auswahl nicht`);
    // Auf einer Spielseite
    await seite.goto(`${BASIS}/memory.html`);
    await seite.waitForSelector(KNOPF, { timeout: 8000 }).catch(() => fehlt(`${name}: Auf einer Spielseite fehlt der Ton-Knopf`));
    await seite.click(KNOPF).catch(() => {});
    await warte(200);
    if (!(await seite.evaluate(() => document.querySelector('.ton-menue [aria-checked="true"]')?.dataset.tonModus === "stumm"))) fehlt(`${name}: Auf der Spielseite steht die Auswahl nicht auf «Alles stumm»`);
    if (fehler.length) fehlt(`${name}: Fehler auf der Seite – ${fehler.join(" | ")}`);
    await kontext.close();
  }
  await browser.close();
} catch (e) {
  fehlt(`Abbruch: ${e.message}`);
}
halt();
if (befunde.length) {
  console.error(`Der Ton-Knopf stimmt nicht (${befunde.length}):\n${befunde.map((b) => `  - ${b}`).join("\n")}`);
  process.exit(1);
}
console.log("Der Ton-Knopf stimmt: am Anfang Ton ohne Musik, eine Auswahl mit drei Möglichkeiten, Musik erst auf Wunsch (und nach dem Neuladen), stumm ist stumm – am Laptop, auf dem Handy und auf einer Spielseite.");
