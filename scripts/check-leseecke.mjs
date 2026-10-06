/*
 * Die Leseecke im Browser: einsteigen, spielen, lesen, aussteigen.
 * ---------------------------------------------------------------------------
 * Was validate-lesen.mjs an den Listen nachrechnet, zeigt sich hier am
 * Bildschirm. Geprüft wird als Gast (Firebase ist umgeleitet) und mit einer
 * Sprachausgabe, die sich merkt, was gesagt wird, und sofort fertig ist:
 *
 *   Startbild     Der Lesewagen steht auf jedem Bildschirm im Bild, gross
 *                 genug zum Antippen, und deckt keinen anderen Knopf zu.
 *                 Ein Tipp öffnet das Zimmer mit seinen sechs Orten.
 *   Die Orte      Jeder führt auf seine Seite; dort steht die Bühne, der Pfeil
 *                 zurück führt in den Lesewagen (index.html?lesen=1).
 *   Silbenzug     Eine ganze Runde, für jede Silbe ein Schlag: sechs von
 *                 sechs, drei Sterne, und die Schnupperrunde ist verbraucht.
 *   Laute kuppeln Die Stimme sagt Laute und halbe Silben, aber nie das ganze
 *                 Wort, bevor das Kind das Bild gewählt hat.
 *   Buchstabenhaus Entdecken öffnet ein Fenster, das Suchspiel zählt Treffer
 *                 im Lesestand.
 *   Stimmt das?   Der Würfel: Ein Satz, der stimmen soll, beschreibt das Bild;
 *                 einer, der nicht stimmen soll, weicht ab – auf jeder Stufe.
 *   Bücher        Das Hörbuch liest von selbst vor; im Zusammen-Modus liest
 *                 die Stimme den Satz des Kindes nicht; nach den Fragen stehen
 *                 Sterne da, das Buch ist gelesen, und der Lesewurm ist
 *                 gewachsen. Ein Buch, das zum Kauf gehört, zeigt das Tor;
 *                 der Lesewurm im Sessel öffnet ein passendes Buch.
 *
 * Aufruf:  node scripts/check-leseecke.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4197);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich die Leseecke nicht prüfen."); process.exit(2); }

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

// Eine Sprachausgabe, die sofort fertig ist und sich merkt, was sie sagen
// sollte. Läuft vor jedem Skript der Seite.
function stimmeErsatz() {
  window.__gesagt = [];
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [],
    speak(aeusserung) {
      window.__gesagt.push(String(aeusserung.text));
      setTimeout(() => aeusserung.dispatchEvent(new Event("end")), 10);
    },
    cancel() {}, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
}

if (!(await warteAufServer())) { console.error("Server antwortet nicht."); process.exit(2); }
const browser = await playwright.chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1024, height: 640 }, serviceWorkers: "block", reducedMotion: "reduce" });
  context.setDefaultTimeout(8000);
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  await context.addInitScript(stimmeErsatz);
  const page = await context.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(`${page.url().replace(BASIS, "")}: ${e.message}`));
  const gesagt = () => page.evaluate(() => window.__gesagt || []);
  const vergiss = () => page.evaluate(() => { window.__gesagt = []; });
  const oeffne = async (pfad, bereit = "window.LernappLeseStand") => {
    await page.goto(`${BASIS}/${pfad}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(bereit, null, { timeout: 10000 });
    await page.waitForTimeout(300);
  };

  // --- 1. Der Lesewagen auf dem Startbild ---------------------------------------
  for (const [breite, hoehe] of [[844, 390], [1024, 640], [1180, 820], [1366, 768]]) {
    await page.setViewportSize({ width: breite, height: hoehe });
    await oeffne("index.html", "document.querySelector('.lesewagen-knopf')");
    await page.waitForFunction(() => document.querySelector(".lesewagen-knopf")?.dataset.placed === "1", null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(900);
    const wagen = await page.evaluate(() => {
      const knopf = document.querySelector(".lesewagen-knopf");
      const r = knopf.getBoundingClientRect();
      const stil = getComputedStyle(knopf);
      const sichtbar = (x) => { const s = getComputedStyle(x); const b = x.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) > 0.05 && b.width > 0 && b.height > 0; };
      const ueber = [...document.querySelectorAll("button, a, [role=button]")]
        .filter((x) => x !== knopf && !knopf.contains(x) && !x.contains(knopf) && sichtbar(x))
        .filter((x) => { const b = x.getBoundingClientRect(); return b.left < r.right - 4 && b.right > r.left + 4 && b.top < r.bottom - 4 && b.bottom > r.top + 4; })
        .map((x) => String(x.className || x.id || x.tagName).slice(0, 40));
      return { platziert: knopf.dataset.placed, sichtbar: sichtbar(knopf), l: r.left, t: r.top, b: r.width, h: r.height, vw: innerWidth, vh: innerHeight, ueber, deckkraft: stil.opacity };
    });
    const wo = `Startbild ${breite}×${hoehe}`;
    if (wagen.platziert !== "1" || !wagen.sichtbar) fehlt(`${wo}: der Lesewagen ist nicht zu sehen`);
    else {
      if (wagen.h < 44 || wagen.b < 60) fehlt(`${wo}: der Lesewagen ist nur ${Math.round(wagen.b)}×${Math.round(wagen.h)} gross`);
      if (wagen.l < 0 || wagen.t < 0 || wagen.l + wagen.b > wagen.vw || wagen.t + wagen.h > wagen.vh) fehlt(`${wo}: der Lesewagen ragt aus dem Bild`);
      if (wagen.ueber.length) fehlt(`${wo}: der Lesewagen liegt über ${wagen.ueber.join(", ")}`);
    }
  }

  // Einsteigen: das Zimmer mit sechs Orten, der Lesewurm im Sessel.
  await page.setViewportSize({ width: 1024, height: 640 });
  await oeffne("index.html", "document.querySelector('.lesewagen-knopf')");
  await page.waitForFunction(() => document.querySelector(".lesewagen-knopf")?.dataset.placed === "1", null, { timeout: 8000 }).catch(() => {});
  await page.locator(".lesewagen-knopf").click();
  await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen" && document.querySelector(".lesezimmer-svg"), null, { timeout: 8000 }).catch(() => {});
  const zimmer = await page.evaluate(() => ({
    ansicht: document.querySelector(".train-stage")?.dataset.view,
    orte: [...document.querySelectorAll(".lesezimmer-svg [data-ort]")].map((o) => o.dataset.ort).sort().join(","),
    wurm: Boolean(document.querySelector(".lese-ort-weiter .lesewurm")),
    hilfe: window.LernappKids?.currentHelp?.() || "",
    zurueck: (() => { const k = document.querySelector(".stage-back"); return Boolean(k && !k.hidden && k.getBoundingClientRect().width > 20); })(),
  }));
  if (zimmer.ansicht !== "lesen") fehlt(`Lesewagen: nach dem Tipp ist die Ansicht ${zimmer.ansicht}, nicht lesen`);
  if (zimmer.orte !== "buchstaben,buecher,saetze,silben,weiter,woerter") fehlt(`Lesewagen: die Orte sind ${zimmer.orte}`);
  if (!zimmer.wurm) fehlt("Lesewagen: der Lesewurm sitzt nicht im Sessel");
  if (!zimmer.zurueck) fehlt("Lesewagen: kein Pfeil zurück an den Zug");
  if (zimmer.hilfe && !/Lesewagen/.test(zimmer.hilfe)) fehlt(`Lesewagen: der Lautsprecher sagt etwas anderes: ${zimmer.hilfe.slice(0, 60)}`);
  await page.locator(".stage-back").click();
  await page.waitForTimeout(500);
  if ((await page.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) === "lesen") fehlt("Lesewagen: der Pfeil führt nicht hinaus");

  // --- 2. Jeder Ort führt auf seine Seite, und von dort zurück --------------------
  const ORTE = { silben: "silbenzug.html", buchstaben: "buchstabenhaus.html", woerter: "lautekuppeln.html", saetze: "stimmtdas.html", buecher: "buecher.html" };
  for (const [ort, seite] of Object.entries(ORTE)) {
    await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
    await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen", null, { timeout: 8000 }).catch(() => {});
    await page.locator(`.lesezimmer-svg [data-ort="${ort}"]`).click({ force: true });
    await page.waitForURL(`**/${seite}*`, { timeout: 8000 }).catch(() => {});
    if (!page.url().includes(seite)) { fehlt(`Ort ${ort}: führt nicht auf ${seite}, sondern auf ${page.url()}`); continue; }
    await page.waitForFunction(() => document.querySelector("#lese-stage .cm-play"), null, { timeout: 8000 }).catch(() => {});
    const buehne = await page.evaluate(() => ({ spiel: Boolean(document.querySelector("#lese-stage .cm-play")), schrift: getComputedStyle(document.querySelector("#lese-stage .cm-play") || document.body).fontFamily }));
    if (!buehne.spiel) fehlt(`${seite}: keine Bühne`);
    if (!/Andika/.test(buehne.schrift)) fehlt(`${seite}: gelesen wird nicht in Andika (${buehne.schrift})`);
    await page.locator(".cm-icon-back").first().click();
    await page.waitForURL("**/index.html?lesen=1", { timeout: 8000 }).catch(() => {});
    await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen", null, { timeout: 8000 }).catch(() => {});
    if ((await page.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) !== "lesen") fehlt(`${seite}: der Pfeil zurück führt nicht in den Lesewagen`);
  }

  // Der Lesewurm im Sessel wählt etwas, das es gibt.
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  await page.locator('.lesezimmer-svg [data-ort="weiter"]').click({ force: true });
  await page.waitForURL(/(silbenzug|buchstabenhaus|lautekuppeln|stimmtdas|buecher)\.html/, { timeout: 8000 }).catch(() => {});
  if (!/(silbenzug|buchstabenhaus|lautekuppeln|stimmtdas|buecher)\.html/.test(page.url())) fehlt(`Lesewurm im Sessel: führt nach ${page.url()}`);

  // --- 3. Silbenzug: eine ganze Runde ----------------------------------------------
  await oeffne("silbenzug.html", "window.LernappSilbenzug");
  await page.locator(".lese-los-knopf").click();
  for (let i = 0; i < 6; i += 1) {
    await page.waitForFunction(() => window.LernappSilbenzug.wort() && !document.querySelector(".silben-abfahrt")?.disabled, null, { timeout: 8000 }).catch(() => {});
    const silben = await page.evaluate(() => window.LernappSilbenzug.wort()?.silben.length || 0);
    for (let s = 0; s < silben; s += 1) await page.locator(".silben-trommel").dispatchEvent("pointerdown");
    const wagen = await page.locator(".silben-ein-wagen").count();
    if (wagen !== silben) fehlt(`Silbenzug: ${silben} Schläge, aber ${wagen} Wagen`);
    await page.locator(".silben-abfahrt").click();
    await page.waitForTimeout(150);
  }
  await page.waitForSelector(".cm-overlay", { timeout: 15000 }).catch(() => {});
  const silbenzug = await page.evaluate(() => ({
    sterne: document.querySelectorAll(".cm-overlay .cm-result-star.is-on").length,
    stand: window.LernappLeseStand.stand().spiele.silbenzug,
    gespielt: window.LernappEntitlement.gameGespielt("silbenzug.html"),
  }));
  if (silbenzug.sterne !== 3) fehlt(`Silbenzug: nach sechs richtigen Zügen ${silbenzug.sterne} Sterne`);
  if (silbenzug.stand?.runden !== 1 || silbenzug.stand?.best !== 6) fehlt(`Silbenzug: im Lesestand steht ${JSON.stringify(silbenzug.stand)}`);
  if (!silbenzug.gespielt) fehlt("Silbenzug: die Schnupperrunde ist nach der Runde nicht verbraucht");
  // Die Runde ist verbraucht: Wer noch einmal will, steht vor dem Tor.
  await page.locator(".cm-overlay .cm-icon-again").click();
  await page.waitForSelector(".tor-overlay", { timeout: 8000 }).catch(() => {});
  if (!(await page.locator(".tor-overlay").count())) fehlt("Silbenzug: nach der Schnupperrunde kommt kein Tor");

  // --- 4. Laute kuppeln: nie das ganze Wort vor dem Bild ---------------------------
  await oeffne("lautekuppeln.html", "window.LernappLauteKuppeln");
  await page.locator(".lese-los-knopf").click();
  for (let i = 0; i < 3; i += 1) {
    await page.waitForFunction(() => window.LernappLauteKuppeln.wort() && document.querySelector(".kp-wagen.ist-dran"), null, { timeout: 8000 }).catch(() => {});
    const wort = await page.evaluate(() => window.LernappLauteKuppeln.wort());
    await vergiss();
    const anzahl = await page.locator(".kp-wagen").count();
    for (let k = 0; k < anzahl; k += 1) {
      await page.waitForFunction((nr) => document.querySelectorAll(".kp-wagen")[nr]?.classList.contains("ist-dran"), k, { timeout: 8000 }).catch(() => {});
      await page.locator(".kp-wagen").nth(k).click();
    }
    await page.waitForSelector(".kp-bilder:not([hidden]) .kp-bild", { timeout: 8000 }).catch(() => {});
    const vorher = await gesagt();
    if (vorher.some((t) => t.toLowerCase() === wort.wort.toLowerCase())) fehlt(`Laute kuppeln: die Stimme sagt «${wort.wort}», bevor das Kind das Bild gewählt hat`);
    const bilder = await page.locator(".kp-bild").allTextContents();
    if (bilder.length !== 3 || !bilder.includes(wort.bild)) fehlt(`Laute kuppeln ${wort.wort}: die Bilder sind ${bilder.join(" ")}`);
    await page.locator(".kp-bild", { hasText: wort.bild }).first().click();
    await page.waitForFunction((w) => window.LernappLauteKuppeln.wort() !== w || document.querySelector(".cm-overlay"), wort.wort, { timeout: 8000 }).catch(() => {});
    if (!(await gesagt()).some((t) => t === wort.wort)) fehlt(`Laute kuppeln: nach dem richtigen Bild sagt die Stimme «${wort.wort}» nicht`);
  }

  // --- 5. Buchstabenhaus: entdecken und suchen -------------------------------------
  await oeffne("buchstabenhaus.html", "window.LernappBuchstabenhaus");
  const fenster = await page.locator(".bh-fenster").count();
  if (fenster < 6) fehlt(`Buchstabenhaus: nur ${fenster} Fenster`);
  await page.locator(".bh-fenster").first().click();
  await page.waitForSelector(".bh-karte", { timeout: 5000 }).catch(() => {});
  if (!(await page.locator(".bh-karte mark").count())) fehlt("Buchstabenhaus: das Fenster zeigt den Laut im Wort nicht hervorgehoben");
  await page.locator(".bh-karte-zu").click();
  await page.locator(".bh-lupe").click();
  for (let i = 0; i < 3; i += 1) {
    await page.waitForFunction(() => window.LernappBuchstabenhaus.ziel(), null, { timeout: 8000 }).catch(() => {});
    const ziel = await page.evaluate(() => window.LernappBuchstabenhaus.ziel());
    await page.locator(`.bh-fenster[data-laut="${ziel}"]`).click();
    // Die nächste Frage kommt, wenn die Stimme den Laut gesagt hat.
    await page.waitForFunction((nr) => window.LernappBuchstabenhaus.nr() > nr, i, { timeout: 8000 }).catch(() => {});
  }
  const laute = await page.evaluate(() => window.LernappLeseStand.stand().laute);
  const treffer = Object.values(laute || {}).reduce((n, e) => n + (Number(e.r) || 0), 0);
  if (treffer !== 3) fehlt(`Buchstabenhaus: nach drei Treffern stehen ${treffer} im Lesestand`);

  // --- 6. Stimmt das?: der Würfel ------------------------------------------------------
  await oeffne("stimmtdas.html", "window.LernappStimmtDas");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const wuerfel = await page.evaluate((s) => {
      window.LernappLeseStand.stufe = () => s;
      const d = window.LernappStimmtDas;
      const probleme = [];
      let stimmt = 0;
      for (let i = 0; i < 400; i += 1) {
        const a = d.aufgabe();
        if (!d.passt(a.wahr)) probleme.push(`unmögliches Bild ${JSON.stringify(a.wahr)}`);
        if (a.stimmt && a.text !== a.richtig) probleme.push(`soll stimmen, tut es nicht: ${a.text} / ${a.richtig}`);
        if (!a.stimmt && a.text === a.richtig) probleme.push(`soll nicht stimmen, tut es: ${a.text}`);
        if (!/^[A-ZÄÖÜ][^.]* (steht|stehen) (auf|unter|neben) (dem|der) [A-ZÄÖÜ][a-zäöü]+\.$/.test(a.text)) probleme.push(`seltsamer Satz: ${a.text}`);
        if (s !== "schwer" && a.wahr.anzahl !== 1) probleme.push(`auf ${s} mehrere Tiere`);
        if (a.stimmt) stimmt += 1;
      }
      return { probleme: [...new Set(probleme)].slice(0, 4), stimmt };
    }, stufe);
    wuerfel.probleme.forEach((p) => fehlt(`Stimmt das? (${stufe}): ${p}`));
    if (wuerfel.stimmt < 120 || wuerfel.stimmt > 280) fehlt(`Stimmt das? (${stufe}): ${wuerfel.stimmt} von 400 Sätzen stimmen – der Würfel ist schief`);
  }
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".sd-daumen", { timeout: 5000 }).catch(() => {});
  const aufgabe = await page.evaluate(() => window.LernappStimmtDas.jetzt());
  await page.locator(aufgabe?.stimmt ? ".sd-ja" : ".sd-nein").click();
  await page.waitForTimeout(200);
  if ((await page.evaluate(() => document.querySelector(".cm-count-value")?.textContent)) !== "1") fehlt("Stimmt das?: die richtige Antwort zählt nicht");

  // --- 7. Das Bücherregal ------------------------------------------------------------------
  await oeffne("buecher.html", "window.LernappBuecher");
  await page.waitForTimeout(300);
  const regal = await page.evaluate(() => ({
    buecher: document.querySelectorAll(".bu-umschlag").length,
    gesperrt: [...document.querySelectorAll(".bu-umschlag.is-locked")].map((b) => b.dataset.buch),
  }));
  if (regal.buecher < 6) fehlt(`Bücherregal: nur ${regal.buecher} Bücher`);
  if (regal.gesperrt.includes("hase-rueebli") || regal.gesperrt.includes("leo-melone")) fehlt("Bücherregal: ein freies Buch trägt ein Schloss");
  if (!regal.gesperrt.includes("sepp-gewitter")) fehlt("Bücherregal: ein Buch, das zum Kauf gehört, ist für den Gast offen");
  await page.locator('.bu-umschlag[data-buch="sepp-gewitter"]').click();
  await page.waitForSelector(".tor-overlay", { timeout: 5000 }).catch(() => {});
  if (!(await page.locator(".tor-overlay").count())) fehlt("Bücherregal: ein gesperrtes Buch zeigt kein Tor");
  if ((await page.locator(".bu-titelseite").count())) fehlt("Bücherregal: ein gesperrtes Buch geht trotzdem auf");

  // Das Hörbuch, ganz: Es liest von selbst, und die Fragen haben Bilder.
  const woerterVorher = await page.evaluate(() => window.LernappLeseStand.stand().woerter);
  await oeffne("buecher.html?buch=hase-rueebli", "document.querySelector('.bu-titelseite')");
  await vergiss();
  await page.locator(".bu-modus").first().click();
  await page.waitForTimeout(700);
  const hoerbuch = await gesagt();
  if (!hoerbuch.some((t) => t.startsWith("Das ist Hoppel"))) fehlt(`Hörbuch: die erste Seite wird nicht vorgelesen (gesagt: ${hoerbuch.slice(0, 3).join(" | ")})`);
  const seiten = await page.evaluate(() => window.LernappLeseBuecher.BY_ID["hase-rueebli"].seiten.length);
  for (let i = 0; i < seiten; i += 1) await page.locator(".bu-weiter").click();
  for (let i = 0; i < 3; i += 1) {
    await page.waitForSelector(".bu-antwort", { timeout: 5000 }).catch(() => {});
    const richtig = await page.evaluate(() => { const b = window.LernappBuecher.state; return b.buch.fragen[b.frage].richtig; });
    if (i === 0) {
      // Erst daneben: «Im Buch nachsehen» erscheint und führt auf die Seite.
      const falsch = (richtig + 1) % 3;
      await page.locator(`.bu-antwort[data-nr="${falsch}"]`).click();
      await page.locator(".bu-nachsehen").click();
      const seite = await page.evaluate(() => ({ nr: window.LernappBuecher.state.seite, ansicht: window.LernappBuecher.state.ansicht }));
      if (seite.ansicht !== "seite" || seite.nr !== 1) fehlt(`Hörbuch: «Im Buch nachsehen» führt auf ${JSON.stringify(seite)} statt Seite 2`);
      await page.locator(".bu-weiter").click();
    }
    await page.waitForSelector(".bu-antwort", { timeout: 5000 }).catch(() => {});
    await page.locator(`.bu-antwort[data-nr="${richtig}"]`).click();
    // Die nächste Frage kommt erst, wenn die Stimme die Antwort gesagt hat.
    await page.waitForFunction((nr) => window.LernappBuecher.state.frage > nr || window.LernappBuecher.state.ansicht === "ende", i, { timeout: 8000 }).catch(() => {});
  }
  await page.waitForSelector(".cm-overlay", { timeout: 10000 }).catch(() => {});
  const nachher = await page.evaluate(() => ({
    sterne: document.querySelectorAll(".cm-overlay .cm-result-star.is-on").length,
    buch: window.LernappLeseStand.stand().buecher["hase-rueebli"],
    woerter: window.LernappLeseStand.stand().woerter,
    soll: window.LernappLeseBuecher.wortZahl(window.LernappLeseBuecher.BY_ID["hase-rueebli"]),
    runden: JSON.parse(localStorage.getItem("lernapp.gratis.runden") || "{}"),
  }));
  if (nachher.sterne !== 2) fehlt(`Hörbuch: mit einem Fehler ${nachher.sterne} Sterne statt 2`);
  if (!nachher.buch || nachher.buch.mal !== 1 || nachher.buch.sterne !== 2) fehlt(`Hörbuch: im Lesestand steht ${JSON.stringify(nachher.buch)}`);
  if (nachher.woerter - woerterVorher !== nachher.soll) fehlt(`Hörbuch: der Lesewurm wuchs um ${nachher.woerter - woerterVorher} Wörter statt ${nachher.soll}`);
  if (Object.keys(nachher.runden).some((k) => /buch/i.test(k))) fehlt(`Hörbuch: ein Buch verbraucht eine Schnupperrunde (${JSON.stringify(nachher.runden)})`);
  // Zurück ans Regal: Das Buch trägt jetzt Sterne.
  await page.locator(".cm-overlay .cm-icon-back").click();
  await page.waitForSelector(".bu-regal", { timeout: 5000 }).catch(() => {});
  if (!(await page.locator('.bu-umschlag[data-buch="hase-rueebli"] .bu-stern.is-on').count())) fehlt("Bücherregal: das gelesene Buch trägt keine Sterne");

  // Zusammen lesen: Den Satz des Kindes liest die Stimme nicht.
  await oeffne("buecher.html?buch=leo-melone", "document.querySelector('.bu-titelseite')");
  await page.locator('.bu-modus[data-modus="zusammen"]').click();
  await page.waitForTimeout(500);
  await vergiss();
  await page.locator(".bu-weiter").click();
  await page.waitForTimeout(500);
  const zusammen = await page.evaluate(() => ({
    kind: document.querySelector(".bu-satz.du-bist-dran")?.textContent || "",
    gesagt: window.__gesagt,
  }));
  if (!/Leo mag Melonen/i.test(zusammen.kind)) fehlt(`Zusammen lesen: auf Seite 2 leuchtet nicht der Satz des Kindes (${zusammen.kind})`);
  if (zusammen.gesagt.some((t) => /Leo mag Melonen/.test(t))) fehlt("Zusammen lesen: die Stimme liest den Satz des Kindes vor");
  // Ein Wort antippen sagt dieses Wort.
  await vergiss();
  await page.locator(".bu-wort", { hasText: "Melonen" }).first().click();
  await page.waitForTimeout(150);
  if (!(await gesagt()).includes("Melonen")) fehlt("Bücher: ein Tipp auf ein Wort sagt es nicht");

  // Der Lesewurm im Sessel: ein passendes Buch, das noch nicht gelesen ist.
  await oeffne("buecher.html?weiter=1", "window.LernappBuecher");
  await page.waitForSelector(".bu-titelseite", { timeout: 5000 }).catch(() => {});
  const weiter = await page.evaluate(() => window.LernappBuecher.state.buch?.id || null);
  if (!weiter) fehlt("Bücher ?weiter=1: es geht kein Buch auf");
  else if (weiter === "hase-rueebli") fehlt("Bücher ?weiter=1: es geht das Buch auf, das eben gelesen wurde");

  // --- 8. Der Lesewurm ist gewachsen ---------------------------------------------------
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  const wurm = await page.evaluate(() => ({
    glieder: Number(document.querySelector(".lese-ort-weiter .lesewurm")?.dataset.glieder || 0),
    gewachsen: Boolean(document.querySelector(".lesewurm.is-gewachsen")),
    soll: window.LernappLeseStand.wurmGlieder(),
  }));
  if (wurm.glieder !== wurm.soll || wurm.glieder < 2) fehlt(`Lesewurm: ${wurm.glieder} Glieder gezeichnet, ${wurm.soll} im Lesestand`);
  if (!wurm.gewachsen) fehlt("Lesewurm: nach dem Buch zeigt das Zimmer nicht, dass er gewachsen ist");

  if (fehler.length) fehlt(`Fehler auf den Seiten: ${[...new Set(fehler)].slice(0, 5).join(" | ")}`);
} finally {
  await browser.close();
  halt();
}

if (befunde.length) {
  console.error("Die Leseecke stimmt im Browser nicht:");
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Leseecke läuft: Lesewagen, Zimmer, fünf Seiten hin und zurück, eine Runde Silbenzug bis zum Tor, Laute kuppeln ohne verratenes Wort, Buchstabenhaus, der Würfel von «Stimmt das?», Hörbuch mit Nachsehen, Zusammen lesen, und der Lesewurm wächst.");
