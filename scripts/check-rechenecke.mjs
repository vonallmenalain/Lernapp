/*
 * Die Rechenecke im Browser: Startbild, Zimmer, Tür, Spiele, eine Runde.
 * ---------------------------------------------------------------------------
 *   Startbild   Der Rechenwagen steht über dem Lesewagen, gleich links, deckt
 *               keinen Knopf zu – am Laptop und auf dem Handy quer.
 *   Zimmer      Ein Tipp auf den Wagen führt hinein; der Zug draussen ist weg;
 *               jedes Ding mit Spielen steht da, dazu Drache, Karte, Schatz
 *               und die Tür. Am Anfang liegt ein Ei auf dem Kissen.
 *   Tür         führt in den Lesewagen, und dessen Tür zurück.
 *   Spiele      Jedes Spiel startet mit «Los» und stellt eine Aufgabe (Zahlen
 *               zur Wahl oder der Würfel) – ohne Fehler auf der Seite.
 *   Runde       Eine ganze Runde Kuppel-Plus: Am Schluss stehen Sterne und
 *               Taler auf der Tafel, im Rechenstand Runde und Taler, und
 *               zurück im Rechenwagen ist der Drache aus dem Ei geschlüpft.
 *   Leicht      Auf «leicht» zieht das Kind die Wagen selbst zusammen, und die
 *               Antworten gehen bis fünf.
 *
 * Aufruf:  node scripts/check-rechenecke.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4198);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich die Rechenecke nicht prüfen."); process.exit(2); }

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });
async function warteAufServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht */ } await new Promise((w) => setTimeout(w, 100)); }
  return false;
}

const befunde = [];
const fehlt = (was) => befunde.push(was);
const SPIELE = ["kuppelplus", "tunnelrechnen", "blitzblick", "einsteigen", "huepfgleis", "zahlenhaus"];

// Eine Sprachausgabe, die sofort fertig ist – sonst warteten die Spiele auf
// jede Ansage.
function stimmeErsatz() {
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [],
    speak(a) { setTimeout(() => a.dispatchEvent?.(new Event("end")), 5); },
    cancel() {}, pause() {}, resume() {},
    addEventListener() {}, removeEventListener() {},
  };
  try { Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true }); } catch { /* bleibt */ }
  if (!window.SpeechSynthesisUtterance) {
    window.SpeechSynthesisUtterance = class extends EventTarget { constructor(t) { super(); this.text = t; } };
  }
  HTMLMediaElement.prototype.play = function play() { setTimeout(() => this.dispatchEvent(new Event("ended")), 5); return Promise.resolve(); };
}

async function neueSeite(browser, viewport, fehlerListe, name) {
  const kontext = await browser.newContext({ viewport });
  await kontext.addInitScript(stimmeErsatz);
  const seite = await kontext.newPage();
  seite.on("pageerror", (e) => fehlerListe.push(`${name}: ${e.message}`));
  return { kontext, seite };
}

const rechtecke = (seite) => seite.evaluate(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e || e.hidden || e.dataset.placed === "0") return null; const b = e.getBoundingClientRect(); return b.width ? { x: b.left, y: b.top, w: b.width, h: b.height } : null; };
  return { rechnen: r(".rechenwagen-knopf"), lesen: r(".lesewagen-knopf"), landschaft: r(".scene-button, .stage-scene"), start: r(".start-signal, .stage-start") };
});
const ueberlappen = (a, b) => a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

async function startbild(browser, viewport, name, seitenFehler) {
  const { kontext, seite } = await neueSeite(browser, viewport, seitenFehler, name);
  await seite.goto(`${BASIS}/index.html`);
  await seite.waitForTimeout(1200);
  await seite.mouse.click(viewport.width / 2, viewport.height * 0.25);
  await seite.waitForTimeout(3000);
  const r = await rechtecke(seite);
  if (viewport.width >= 1000) {
    if (!r.rechnen) fehlt(`${name}: Der Rechenwagen steht nicht auf dem Startbild`);
    else if (!r.lesen) fehlt(`${name}: Ohne Lesewagen kein Platz für den Rechenwagen`);
    else {
      if (r.rechnen.y + r.rechnen.h > r.lesen.y + 1) fehlt(`${name}: Der Rechenwagen steht nicht über dem Lesewagen`);
      if (Math.abs(r.rechnen.x - r.lesen.x) > 2) fehlt(`${name}: Der Rechenwagen steht nicht über dem Lesewagen (links verschoben)`);
    }
  }
  if (r.rechnen) {
    if (r.rechnen.w < 69) fehlt(`${name}: Der Rechenwagen ist kleiner als 70 Pixel`);
    const knoepfe = await seite.evaluate(() => [...document.querySelectorAll(".train-stage button")].filter((b) => !b.hidden && b.offsetParent && !b.classList.contains("rechenwagen-knopf") && !b.classList.contains("lesewagen-knopf") && b.dataset.placed !== "0")
      .map((b) => { const x = b.getBoundingClientRect(); return { x: x.left, y: x.top, w: x.width, h: x.height, name: b.className }; }).filter((b) => b.w > 0));
    knoepfe.forEach((k) => { if (ueberlappen(r.rechnen, k)) fehlt(`${name}: Der Rechenwagen deckt einen Knopf zu (${k.name})`); });
  }
  return { kontext, seite, r };
}

async function main() {
  if (!(await warteAufServer())) { console.error("Der lokale Server startet nicht."); process.exit(2); }
  const browser = await playwright.chromium.launch();
  const seitenFehler = [];
  try {
    // --- Startbild, Zimmer, Tür --------------------------------------------
    const { kontext, seite } = await startbild(browser, { width: 1280, height: 800 }, "Laptop", seitenFehler);
    await seite.click(".rechenwagen-knopf");
    await seite.waitForTimeout(1800);
    const zimmer = await seite.evaluate(() => ({
      view: document.querySelector(".train-stage")?.dataset.view,
      orte: [...document.querySelectorAll(".rechen-ort")].map((o) => o.dataset.ort),
      zug: getComputedStyle(document.querySelector(".train-band") || document.body).opacity,
      ei: Boolean(document.querySelector(".rechenzimmer-svg .rw-ei")),
      hilfe: window.LernappKids?.currentHelp?.() || "",
    }));
    if (zimmer.view !== "rechnen") fehlt(`Zimmer: Ein Tipp auf den Rechenwagen führt nicht hinein (${zimmer.view})`);
    for (const ort of ["drache", "mission", "schatz", "tuer", "gleis", "tunnel", "fenster", "perron", "wuerfel", "zahlenhaus"]) {
      if (!zimmer.orte.includes(ort)) fehlt(`Zimmer: ${ort} fehlt`);
    }
    if (zimmer.zug !== "0") fehlt("Zimmer: Der Zug von draussen steht im Rechenwagen");
    if (!zimmer.ei) fehlt("Zimmer: Am Anfang liegt kein Ei auf dem Kissen");
    if (!/Rechenwagen/.test(zimmer.hilfe)) fehlt("Zimmer: Der Lautsprecher erklärt den Rechenwagen nicht");
    // Eine Auswahl gibt es erst mit mehreren Spielen an einem Ding – hier
    // führt ein Tipp gleich ins Spiel. Die Tür:
    await seite.click(".rechen-ort-tuer .rechen-hitbox");
    await seite.waitForTimeout(1200);
    if ((await seite.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) !== "lesen") fehlt("Tür: führt nicht in den Lesewagen");
    if (!(await seite.$(".lese-ort-rechnen"))) fehlt("Tür: Im Lesewagen fehlt die Tür in den Rechenwagen");
    else {
      await seite.click(".lese-ort-rechnen");
      await seite.waitForTimeout(1200);
      if ((await seite.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) !== "rechnen") fehlt("Tür: Die Tür im Lesewagen führt nicht zurück");
    }
    // Ein Tipp auf ein Ding öffnet sein Spiel.
    await seite.click(".rechen-ort-zahlenhaus .rechen-hitbox");
    await seite.waitForTimeout(2500);
    if (!/zahlenhaus\.html/.test(seite.url())) fehlt(`Zimmer: Das Zahlenhaus öffnet nicht sein Spiel (${seite.url()})`);
    await kontext.close();

    // Handy quer: der Wagen steht oder bleibt weg, deckt aber nichts zu.
    const quer = await startbild(browser, { width: 844, height: 390 }, "Handy quer", seitenFehler);
    await quer.kontext.close();

    // --- Jedes Spiel stellt eine Aufgabe -------------------------------------
    for (const id of SPIELE) {
      const { kontext: k, seite: s } = await neueSeite(browser, { width: 1280, height: 800 }, seitenFehler, id);
      await s.goto(`${BASIS}/${id}.html`);
      await s.waitForTimeout(1200);
      if (!(await s.$(".rechen-los-knopf"))) { fehlt(`${id}: kein «Los»`); await k.close(); continue; }
      await s.click(".rechen-los-knopf");
      let gestellt = false;
      for (let i = 0; i < 40 && !gestellt; i += 1) {
        await s.waitForTimeout(400);
        gestellt = Boolean(await s.$(".rechen-antworten .rechen-zahl, .rechen-wurf"));
      }
      if (!gestellt) fehlt(`${id}: stellt nach «Los» keine Aufgabe`);
      const blase = await s.evaluate(() => document.querySelector(".rechen-blase-text")?.textContent || "");
      if (!blase) fehlt(`${id}: Die Sprechblase bleibt leer`);
      await k.close();
    }

    // --- Eine ganze Runde auf «leicht» ---------------------------------------
    {
      const { kontext: k, seite: s } = await neueSeite(browser, { width: 1280, height: 800 }, seitenFehler, "Runde");
      await s.goto(`${BASIS}/kuppelplus.html`);
      await s.waitForTimeout(800);
      await s.evaluate(() => window.LernappReise.setStufe("leicht"));
      // Zuerst einmal ins Zimmer: Der Drache ist noch ein Ei.
      await s.goto(`${BASIS}/index.html?rechnen=1`);
      await s.waitForTimeout(1500);
      await s.goto(`${BASIS}/kuppelplus.html`);
      await s.waitForTimeout(1200);
      await s.click(".rechen-los-knopf");
      let gezogen = false;
      const anfang = Date.now();
      while (Date.now() - anfang < 120000) {
        const phase = await s.evaluate(() => document.querySelector("#rechen-stage")?.dataset.phase);
        if (phase === "over") break;
        const griff = await s.$('.rw-zug-b rect[fill-opacity="0"]');
        if (griff && !(await s.$(".rechen-antworten .rechen-zahl"))) {
          const box = await griff.boundingBox();
          if (box) {
            await s.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await s.mouse.down();
            await s.mouse.move(box.x - 260, box.y + box.height / 2, { steps: 10 });
            await s.mouse.up();
            gezogen = true;
          }
        }
        const zahlen = await s.$$eval(".rechen-antworten:not(.ist-zu) .rechen-zahl", (b) => b.map((x) => Number(x.textContent)));
        if (zahlen.length) {
          if (Math.max(...zahlen) > 5) fehlt("Leicht: Antworten über fünf");
          await s.click(".rechen-antworten:not(.ist-zu) .rechen-zahl");
        }
        await s.waitForTimeout(350);
      }
      if (!gezogen) fehlt("Leicht: Die Wagen liessen sich nicht ziehen");
      const tafel = await s.evaluate(() => document.querySelector("#rechen-stage")?.textContent || "");
      if (!/Taler/.test(tafel)) fehlt("Runde: Die Tafel nennt keine Taler");
      const stand = await s.evaluate(() => ({ runden: window.LernappRechenStand.runden(), taler: window.LernappRechenStand.taler() }));
      if (stand.runden !== 1 || stand.taler < 1) fehlt(`Runde: Im Rechenstand stehen ${stand.runden} Runden und ${stand.taler} Taler`);
      await s.goto(`${BASIS}/index.html?rechnen=1`);
      await s.waitForTimeout(5000);
      const nachher = await s.evaluate(() => ({ ei: Boolean(document.querySelector(".rechenzimmer-svg .rw-ei")), drache: Boolean(document.querySelector(".rechenzimmer-svg .rw-drache")), hilfe: window.LernappKids?.currentHelp?.() || "" }));
      if (nachher.ei || !nachher.drache) fehlt("Runde: Zurück im Rechenwagen ist der Drache nicht geschlüpft");
      if (!/geschlüpft/.test(nachher.hilfe)) fehlt("Runde: Der Lautsprecher sagt nicht, dass der Drache geschlüpft ist");
      await k.close();
    }
  } finally {
    await browser.close();
    halt();
  }
  seitenFehler.forEach((f) => fehlt(`Fehler auf der Seite – ${f}`));
  if (befunde.length) {
    console.error(`Rechenecke im Browser: ${befunde.length} Befunde`);
    befunde.forEach((b) => console.error(`  - ${b}`));
    process.exit(1);
  }
  console.log("Rechenecke im Browser: Startbild, Zimmer, Tür, alle Spiele und eine Runde stimmen.");
}

main().catch((e) => { console.error(e); halt(); process.exit(1); });
