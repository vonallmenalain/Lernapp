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

  // Einsteigen: das Zimmer mit sechs Orten und dem Schild, der Lesewurm im Sessel.
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
  if (zimmer.orte !== "buchstaben,buecher,saetze,silben,weiter,woerter,wurmname") fehlt(`Lesewagen: die Orte sind ${zimmer.orte}`);
  if (!zimmer.wurm) fehlt("Lesewagen: der Lesewurm sitzt nicht im Sessel");
  if (!zimmer.zurueck) fehlt("Lesewagen: kein Pfeil zurück an den Zug");
  if (zimmer.hilfe && !/Lesewagen/.test(zimmer.hilfe)) fehlt(`Lesewagen: der Lautsprecher sagt etwas anderes: ${zimmer.hilfe.slice(0, 60)}`);
  await page.locator(".stage-back").click();
  await page.waitForTimeout(500);
  if ((await page.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) === "lesen") fehlt("Lesewagen: der Pfeil führt nicht hinaus");

  // --- 2. Jeder Ort führt auf seine Seite, und von dort zurück --------------------
  // Steht hinter einem Ding nur ein Spiel, geht es gleich los; stehen mehrere
  // dahinter, kommt die Auswahl – und jede Karte darin führt auf ihre Seite.
  const katalog = await page.evaluate(() => Object.entries(window.LernappLeseStand.SPIELE).map(([id, s]) => ({ id, page: s.page, ort: s.ort })));
  const ORTE = ["silben", "buchstaben", "woerter", "saetze", "buecher"];
  const zumOrt = async (ort) => {
    await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
    await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen", null, { timeout: 8000 }).catch(() => {});
    await page.locator(`.lesezimmer-svg [data-ort="${ort}"]`).click({ force: true });
  };
  for (const ort of ORTE) {
    const spiele = katalog.filter((s) => s.ort === ort);
    if (!spiele.length) { fehlt(`Ort ${ort}: kein Spiel im Katalog`); continue; }
    for (const [nr, spiel] of spiele.entries()) {
      await zumOrt(ort);
      if (spiele.length > 1) {
        await page.waitForSelector(".lese-wahl .lese-wahl-spiel", { timeout: 5000 }).catch(() => {});
        const karten = await page.locator(".lese-wahl .lese-wahl-spiel").evaluateAll((k) => k.map((x) => x.dataset.spiel));
        if (nr === 0 && karten.join(",") !== spiele.map((s) => s.id).join(",")) fehlt(`Ort ${ort}: die Auswahl zeigt ${karten.join(", ")} statt ${spiele.map((s) => s.id).join(", ")}`);
        await page.locator(`.lese-wahl .lese-wahl-spiel[data-spiel="${spiel.id}"]`).click();
      }
      await page.waitForURL(`**/${spiel.page}*`, { timeout: 8000 }).catch(() => {});
      if (!page.url().includes(spiel.page)) { fehlt(`Ort ${ort}: ${spiel.id} führt nicht auf ${spiel.page}, sondern auf ${page.url()}`); continue; }
      await page.waitForFunction(() => document.querySelector("#lese-stage .cm-play"), null, { timeout: 8000 }).catch(() => {});
      const buehne = await page.evaluate(() => ({ spiel: Boolean(document.querySelector("#lese-stage .cm-play")), schrift: getComputedStyle(document.querySelector("#lese-stage .cm-play") || document.body).fontFamily }));
      if (!buehne.spiel) fehlt(`${spiel.page}: keine Bühne`);
      if (!/Andika/.test(buehne.schrift)) fehlt(`${spiel.page}: gelesen wird nicht in Andika (${buehne.schrift})`);
      await page.locator(".cm-icon-back").first().click();
      await page.waitForURL("**/index.html?lesen=1", { timeout: 8000 }).catch(() => {});
      await page.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "lesen", null, { timeout: 8000 }).catch(() => {});
      if ((await page.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) !== "lesen") fehlt(`${spiel.page}: der Pfeil zurück führt nicht in den Lesewagen`);
    }
  }
  // Die Auswahl geht auch wieder zu, ohne dass etwas aufgeht.
  await zumOrt("woerter");
  await page.waitForSelector(".lese-wahl", { timeout: 5000 }).catch(() => {});
  await page.locator(".lese-wahl-zu").click();
  if (await page.locator(".lese-wahl").count()) fehlt("Auswahl im Lesewagen: das Kreuz schliesst sie nicht");
  if (!page.url().includes("index.html")) fehlt("Auswahl im Lesewagen: das Kreuz öffnet ein Spiel");

  // Der Lesewurm im Sessel wählt etwas, das es gibt.
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  await page.locator('.lesezimmer-svg [data-ort="weiter"]').click({ force: true });
  const spielSeiten = new RegExp(`(${katalog.map((s) => s.page.replace(".html", "")).join("|")})\\.html`);
  await page.waitForURL(spielSeiten, { timeout: 8000 }).catch(() => {});
  if (!spielSeiten.test(page.url())) fehlt(`Lesewurm im Sessel: führt nach ${page.url()}`);

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

  // --- 6b. Die Spiele aus Etappe 2: je eine Aufgabe -------------------------------------
  const zaehler = () => page.evaluate(() => document.querySelector(".cm-count-value")?.textContent);
  const los = async (seite, api) => {
    await oeffne(seite, `window.${api}`);
    await vergiss();
    await page.locator(".lese-los-knopf").click();
  };

  // Reimkupplung: Gefragt wird nach dem Reim auf das Wort am Zug; nur der Reim kuppelt.
  await los("reimkupplung.html", "LernappReimkupplung");
  await page.waitForSelector(".rk-kandidat", { timeout: 8000 }).catch(() => {});
  await page.waitForFunction(() => (window.__gesagt || []).some((t) => /^Was reimt sich auf /.test(t)), null, { timeout: 5000 }).catch(() => {});
  const reim = await page.evaluate(() => window.LernappReimkupplung.jetzt());
  if (!(await gesagt()).includes(`Was reimt sich auf ${reim?.ziel?.wort}?`)) fehlt("Reimkupplung: die Frage nach dem Reim wird nicht gestellt");
  const reimWahl = await page.evaluate(() => window.LernappReimkupplung.jetzt().wahl.map((w) => w.wort));
  if (!reimWahl.includes(reim.reim.wort) || reimWahl.length !== 3) fehlt(`Reimkupplung: zur Wahl stehen ${reimWahl.join(", ")}`);
  await page.locator('.rk-kandidat:not([data-reim="1"])').first().click();
  await page.waitForTimeout(300);
  await page.locator('.rk-kandidat[data-reim="1"]').click();
  await page.waitForFunction(() => window.LernappReimkupplung.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "0") fehlt("Reimkupplung: nach einem Fehlgriff zählt der Reim trotzdem");
  if (!(await gesagt()).some((t) => t.startsWith(`${reim.ziel.wort} – ${reim.reim.wort}`))) fehlt("Reimkupplung: die Stimme sagt die beiden Reimwörter nicht");

  // Anlaut-Lauscher: Das Bild mit demselben ersten Laut zählt.
  await los("anlautlauscher.html", "LernappAnlautLauscher");
  await page.waitForSelector(".al-bild", { timeout: 8000 }).catch(() => {});
  const anlaut = await page.evaluate(() => {
    const a = window.LernappAnlautLauscher.jetzt();
    const I = window.LernappLeseInhalte;
    return { laut: a.laut, ziel: I.anlautVon(a.ziel.wort), treffer: I.anlautVon(a.treffer.wort), andere: a.wahl.filter((w) => w !== a.treffer).map((w) => I.anlautVon(w.wort)), mehrdeutig: a.wahl.some((w) => I.MEHRDEUTIG.has(w.wort)) };
  });
  if (anlaut.ziel !== anlaut.laut || anlaut.treffer !== anlaut.laut || anlaut.andere.includes(anlaut.laut)) fehlt(`Anlaut-Lauscher: die Aufgabe stimmt nicht: ${JSON.stringify(anlaut)}`);
  if (anlaut.mehrdeutig) fehlt("Anlaut-Lauscher: ein mehrdeutiges Bild steht zur Wahl");
  await page.locator('.al-bild[data-treffer="1"]').click();
  await page.waitForFunction(() => window.LernappAnlautLauscher.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Anlaut-Lauscher: der richtige Anfang zählt nicht");

  // Wer fährt mit?: Das Wort sagt die Stimme erst nach der Antwort.
  await los("werfaehrtmit.html", "LernappWerFaehrtMit");
  await page.waitForSelector(".wm-bild", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(400);
  const fahrkarte = await page.evaluate(() => window.LernappWerFaehrtMit.jetzt().wort.wort);
  if ((await gesagt()).some((t) => t === fahrkarte)) fehlt(`Wer fährt mit?: die Stimme verrät «${fahrkarte}», bevor das Kind gewählt hat`);
  if ((await page.locator(".wm-wort").textContent()) !== fahrkarte) fehlt("Wer fährt mit?: auf der Fahrkarte steht ein anderes Wort");
  await page.locator('.wm-bild[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappWerFaehrtMit.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Wer fährt mit?: der richtige Fahrgast zählt nicht");
  if (!(await gesagt()).includes(fahrkarte)) fehlt("Wer fährt mit?: nach der Antwort sagt die Stimme das Wort nicht");

  // Wörter bauen: Was daliegt, wird vorgelesen – auch falsch. Richtige Steine bleiben liegen.
  await los("woerterbauen.html", "LernappWoerterBauen");
  await page.waitForSelector(".wb-stein", { timeout: 8000 }).catch(() => {});
  const bau = await page.evaluate(() => ({ wort: window.LernappWoerterBauen.jetzt().wort, richtig: window.LernappWoerterBauen.richtig() }));
  const legeSteine = async (reihe) => {
    for (const text of reihe) {
      const index = await page.locator(".wb-stein:not([hidden])").evaluateAll((alle, t) => alle.findIndex((k) => k.getAttribute("aria-label") === `Stein ${t}`), text);
      if (index < 0) return false;
      await page.locator(".wb-stein:not([hidden])").nth(index).click();
    }
    return true;
  };
  const verkehrt = [...bau.richtig].reverse();
  if (verkehrt.join("") !== bau.wort) {
    await vergiss();
    await legeSteine(verkehrt);
    await page.waitForFunction(() => document.querySelectorAll(".wb-feld.ist-voll").length < document.querySelectorAll(".wb-feld").length || window.LernappWoerterBauen.nr() > 0, null, { timeout: 8000 }).catch(() => {});
    const vorgelesen = (await gesagt()).map((t) => t.toLowerCase());
    if (!vorgelesen.includes(verkehrt.join("").toLowerCase())) fehlt(`Wörter bauen: «${verkehrt.join("")}» wird nicht vorgelesen (gesagt: ${vorgelesen.join(" | ")})`);
    const fest = await page.locator(".wb-feld.ist-fest").count();
    const sollFest = verkehrt.filter((t, i) => t === bau.richtig[i]).length;
    if (fest !== sollFest) fehlt(`Wörter bauen: ${fest} Steine bleiben liegen, richtig lagen ${sollFest}`);
    const offen = await page.locator(".wb-feld:not(.ist-fest)").evaluateAll((f) => f.map((x) => Number(x.dataset.nr)));
    await legeSteine(offen.map((i) => bau.richtig[i]));
  } else {
    await legeSteine(bau.richtig);
  }
  await page.waitForFunction(() => window.LernappWoerterBauen.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await page.evaluate(() => window.LernappWoerterBauen.nr())) !== 1) fehlt("Wörter bauen: nach dem richtigen Wort geht es nicht weiter");

  // Silbenbahn: Die Silben der Reihe nach angekuppelt ergeben das Wort.
  await los("silbenbahn.html", "LernappSilbenbahn");
  await page.waitForSelector(".sb-neben .sb-wagen", { timeout: 8000 }).catch(() => {});
  const bahn = await page.evaluate(() => window.LernappSilbenbahn.jetzt());
  for (let i = 0; i < bahn.silben.length; i += 1) {
    await page.waitForFunction((n) => window.LernappSilbenbahn.dran() === n, i, { timeout: 8000 }).catch(() => {});
    await page.locator(`.sb-neben .sb-wagen[data-nr="${i}"]`).click();
  }
  await page.waitForFunction(() => window.LernappSilbenbahn.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  if ((await zaehler()) !== "1") fehlt("Silbenbahn: das richtig gekuppelte Wort zählt nicht");
  if (!(await gesagt()).includes(bahn.wort)) fehlt("Silbenbahn: am Schluss sagt die Stimme das Wort nicht");

  // Blitzwörter: erst blitzen, dann wählen; der Treffer steht im Lesestand.
  await los("blitzwoerter.html", "LernappBlitzwoerter");
  await page.waitForFunction(() => window.LernappBlitzwoerter.phase() === "waehlen", null, { timeout: 10000 }).catch(() => {});
  const blitz = await page.evaluate(() => window.LernappBlitzwoerter.jetzt().wort);
  if ((await page.locator(".bw-knopf").count()) !== 4) fehlt("Blitzwörter: es stehen nicht vier Wörter zur Wahl");
  if ((await page.locator(".bw-wort").textContent()) === blitz) fehlt("Blitzwörter: das Wort steht noch im Fenster, während gewählt wird");
  await page.locator(".bw-knopf", { hasText: new RegExp(`^${blitz}$`) }).click();
  await page.waitForFunction(() => window.LernappBlitzwoerter.nr() === 1, null, { timeout: 8000 }).catch(() => {});
  const blitzStand = await page.evaluate((w) => window.LernappLeseStand.stand().blitz[w], blitz);
  if ((await zaehler()) !== "1" || blitzStand?.r !== 1) fehlt(`Blitzwörter: der Treffer zählt nicht (${JSON.stringify(blitzStand)})`);

  // --- 6c. Mein Name und der Name des Lesewurms ---------------------------------------
  // Ohne Konto fragt das Spiel nach dem Namen; er bleibt auf dem Gerät und
  // geht nicht in den Spielstand. Drei Fahrten, in der dritten zwei fremde
  // Wagen; ein Fehlgriff kostet den Punkt dieser Fahrt.
  await oeffne("meinname.html", "window.LernappMeinName");
  if (!(await page.locator(".mn-eingabe input").count())) fehlt("Mein Name: ohne Konto fragt niemand nach dem Namen");
  await page.fill(".mn-eingabe input", "  noah ");
  await page.locator(".mn-eingabe-ok").click();
  await page.waitForSelector(".mn-schild", { timeout: 5000 }).catch(() => {});
  const schildText = await page.evaluate(() => document.querySelector(".mn-schild")?.textContent);
  if (schildText !== "Noah") fehlt(`Mein Name: auf dem Schild steht «${schildText}» statt «Noah»`);
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  const naechsterWagen = () => page.evaluate(() => {
    const j = window.LernappMeinName.jetzt();
    return j.phase === "kuppeln" ? [...j.name][j.dran].toLowerCase() : null;
  });
  for (let fahrt = 0; fahrt < 3; fahrt += 1) {
    await page.waitForFunction((f) => window.LernappMeinName.jetzt().fahrt === f && window.LernappMeinName.jetzt().phase === "kuppeln", fahrt, { timeout: 8000 }).catch(() => {});
    const anzahl = await page.locator(".mn-neben .mn-wagen").count();
    const fremde = await page.locator('.mn-neben .mn-wagen[data-fremd="1"]').count();
    if (fahrt === 0 && (await page.locator(".mn-platz.ist-leer").count()) !== 4) fehlt("Mein Name: hinter der Lok stehen nicht vier leere Plätze für Noah");
    if (anzahl !== 4 + (fahrt === 2 ? 2 : 0) || fremde !== (fahrt === 2 ? 2 : 0)) fehlt(`Mein Name, Fahrt ${fahrt + 1}: ${anzahl} Wagen, davon ${fremde} fremde`);
    if (fahrt === 2 && !(await page.locator(".mn-schild.ist-zu").count())) fehlt("Mein Name: in der dritten Fahrt ist das Schild nicht zugedeckt");
    for (let i = 0; i < 4; i += 1) {
      await page.waitForFunction(() => window.LernappMeinName.jetzt().phase === "kuppeln", null, { timeout: 5000 }).catch(() => {});
      const b = await naechsterWagen();
      if (!b) break;
      if (fahrt === 1 && i === 2) {
        await page.locator(`.mn-neben .mn-wagen:not([data-zeichen="${b}"])`).first().click();
        await page.waitForTimeout(150);
      }
      await page.locator(`.mn-neben .mn-wagen[data-zeichen="${b}"]`).first().click();
    }
  }
  await page.waitForFunction(() => window.LernappMeinName.jetzt().phase === "over", null, { timeout: 8000 }).catch(() => {});
  const nameStand = await page.evaluate(() => ({
    j: window.LernappMeinName.jetzt(),
    runden: window.LernappLeseStand.stand().spiele?.meinname?.runden || 0,
    lokal: localStorage.getItem("lernapp.lesen.meinname"),
    box: localStorage.getItem("lernapp.lesen") || "",
  }));
  if (nameStand.j.punkte !== 2 || nameStand.j.fahrt !== 3) fehlt(`Mein Name: nach drei Fahrten mit einem Fehlgriff ${nameStand.j.punkte} Punkte (Fahrt ${nameStand.j.fahrt})`);
  if (nameStand.runden !== 1) fehlt("Mein Name: die Runde steht nicht im Lesestand");
  if (nameStand.lokal !== "Noah") fehlt(`Mein Name: auf dem Gerät steht ${nameStand.lokal} statt Noah`);
  if (/Noah/.test(nameStand.box)) fehlt("Mein Name: der eingetippte Name steht im Spielstand, der in die Cloud geht");
  if (!(await gesagt()).includes("Noah")) fehlt("Mein Name: die Stimme sagt den fertigen Namen nicht");

  // Der Lesewurm bekommt einen Namen: über das Schild im Zimmer, immer frei.
  const frei = await page.evaluate(() => window.LernappEntitlement?.targetFree?.("meinname.html?wurm=1"));
  if (frei !== true) fehlt("Lesewurm taufen: meinname.html?wurm=1 ist nicht frei");
  await oeffne("index.html?lesen=1", "document.querySelector('.lesezimmer-svg')");
  if ((await page.evaluate(() => document.querySelector('[data-ort="wurmname"] .lese-wurmname')?.textContent)) !== "?") fehlt("Lesewurm taufen: auf dem Schild steht nicht «?», solange er keinen Namen hat");
  await page.locator('.lesezimmer-svg [data-ort="wurmname"]').click({ force: true });
  await page.waitForURL("**/meinname.html?wurm=1", { timeout: 8000 }).catch(() => {});
  await page.waitForFunction(() => window.LernappMeinName && document.querySelector(".mn-taste"), null, { timeout: 8000 }).catch(() => {});
  if (!(await page.locator(".mn-taste").count())) fehlt("Lesewurm taufen: das Schild führt nicht zu den Buchstaben");
  else {
    await vergiss();
    for (const b of ["b", "o", "d", "o"]) await page.locator(`.mn-taste[data-laut="${b}"]`).click();
    const vorgelesen = await gesagt();
    if (!vorgelesen.includes("Bodo") || vorgelesen.includes("B")) fehlt(`Lesewurm taufen: vorgelesen wird ${vorgelesen.join(" | ")}`);
    await page.locator(".mn-weg").click();
    if ((await page.evaluate(() => document.querySelector(".mn-wurmschild")?.textContent)) !== "Bod") fehlt("Lesewurm taufen: der Pfeil nimmt den letzten Buchstaben nicht weg");
    await page.locator('.mn-taste[data-laut="o"]').click();
    await page.locator(".mn-fertig").click();
    await page.waitForURL("**/index.html*", { timeout: 8000 }).catch(() => {});
    await page.waitForFunction(() => document.querySelector(".lesezimmer-svg"), null, { timeout: 8000 }).catch(() => {});
    const getauft = await page.evaluate(() => ({ name: window.LernappLeseStand.wurmName(), schild: document.querySelector('[data-ort="wurmname"] .lese-wurmname')?.textContent }));
    if (getauft.name !== "Bodo" || getauft.schild !== "Bodo") fehlt(`Lesewurm taufen: er heisst ${getauft.name}, auf dem Schild steht ${getauft.schild}`);
  }
  // Vor jeder Runde steht der Name unter dem Wurm.
  await oeffne("silbenzug.html", "window.LernappLeseStand");
  if ((await page.evaluate(() => document.querySelector(".lese-los-wurmname")?.textContent)) !== "Bodo") fehlt("Lesewurm: vor der Runde steht sein Name nicht unter ihm");

  // --- 6e. Lückensätze ---------------------------------------------------------------------
  // Der Würfel: Das richtige Wort steht zur Wahl, jedes falsche macht einen
  // anderen Satz, das Bild passt in den Rahmen, und jede Stufe fragt nach dem,
  // was zu ihr gehört. Dann eine Aufgabe: erst daneben, dann richtig.
  await oeffne("lueckensaetze.html", "window.LernappLueckensaetze");
  for (const stufe of ["leicht", "mittel", "schwer"]) {
    const wuerfel = await page.evaluate((s) => {
      window.LernappLeseStand.stufe = () => s;
      const d = window.LernappLueckensaetze;
      const inhalte = window.LernappLeseInhalte;
      const art = window.LernappLeseArt;
      const probleme = [];
      const rollen = new Set();
      for (let i = 0; i < 300; i += 1) {
        const rolle = d.FRAGEN[s][i % d.FRAGEN[s].length];
        const a = d.aufgabe(rolle);
        rollen.add(a.rolle);
        if (!art.szenePasst(a.lage)) probleme.push(`das Bild passt nicht in den Rahmen: ${a.satz}`);
        if (a.lage.anzahl > art.platzFuer(a.lage.ding, a.lage.wo, a.lage.tun)) probleme.push(`mehr Tiere als Platz: ${a.satz}`);
        if (!a.wahl.includes(a.richtig)) probleme.push(`das richtige Wort fehlt: ${a.satz}`);
        if (new Set(a.wahl).size !== a.wahl.length || a.wahl.length !== (s === "leicht" ? 2 : 3)) probleme.push(`Wahl ${a.wahl.join("/")}`);
        if (`${a.teile.map((t) => t.text).join(" ")}.` !== a.satz || a.satz !== inhalte.satzZurLage(a.lage)) probleme.push(`der Satz stimmt nicht mit dem Bild: ${a.satz}`);
        a.wahl.filter((w) => w !== a.richtig).forEach((w) => {
          const anders = a.teile.map((t, j) => (j === a.stelle ? w : t.text)).join(" ");
          if (`${anders}.` === a.satz) probleme.push(`ein falsches Wort ergibt denselben Satz: ${a.satz}`);
          if (a.rolle === "tun" && /^(steht|stehen)$/.test(w)) probleme.push(`«${w}» ist nie falsch genug: ${a.satz}`);
        });
        if (!/^[A-ZÄÖÜ][a-zäöü]+ [A-ZÄÖÜ][a-zäöü]+ (steht|stehen|schläft|schlafen|liest|lesen|singt|singen|hüpft|hüpfen) (auf|unter|neben) (dem|der) [A-ZÄÖÜ][a-zäöü]+\.$/.test(a.satz)) probleme.push(`seltsamer Satz: ${a.satz}`);
        if (a.lage.tun === "schlaeft" && a.lage.anzahl !== 1) probleme.push(`mehrere schlafen: ${a.satz}`);
      }
      return { probleme: [...new Set(probleme)].slice(0, 4), rollen: [...rollen].sort().join(",") };
    }, stufe);
    wuerfel.probleme.forEach((p) => fehlt(`Lückensätze (${stufe}): ${p}`));
    const soll = { leicht: "ding,tier", mittel: "ding,tier,tun,wo", schwer: "anzahl,ding,tier,tun,wo" }[stufe];
    if (wuerfel.rollen !== soll) fehlt(`Lückensätze (${stufe}): gefragt wird nach ${wuerfel.rollen} statt ${soll}`);
  }
  await oeffne("lueckensaetze.html", "window.LernappLueckensaetze");
  await vergiss();
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".ls-wort", { timeout: 5000 }).catch(() => {});
  const luecke = await page.evaluate(() => { const a = window.LernappLueckensaetze.jetzt(); return { satz: a.satz, richtig: a.richtig, teile: a.teile.map((t) => t.text), stelle: a.stelle }; });
  if (!(await page.locator(".ls-satz .ls-luecke").count())) fehlt("Lückensätze: im Satz ist keine Lücke");
  const falschesWort = await page.locator('.ls-wort:not([data-richtig="1"])').first().getAttribute("data-wort");
  await page.locator('.ls-wort:not([data-richtig="1"])').first().click();
  await page.waitForFunction(() => window.LernappLueckensaetze.phase() === "waehlen", null, { timeout: 5000 }).catch(() => {});
  const falschGesagt = `${luecke.teile.map((t, i) => (i === luecke.stelle ? falschesWort : t)).join(" ")}?`;
  if (!(await gesagt()).includes(falschGesagt)) fehlt(`Lückensätze: der falsche Satz wird nicht vorgelesen (${falschGesagt})`);
  if (!(await page.locator('.ls-wort[disabled]').count())) fehlt("Lückensätze: das falsche Wort lässt sich nochmals wählen");
  await page.locator('.ls-wort[data-richtig="1"]').click();
  await page.waitForFunction(() => window.LernappLueckensaetze.nr() === 1, null, { timeout: 5000 }).catch(() => {});
  if (!(await gesagt()).includes(luecke.satz)) fehlt(`Lückensätze: der richtige Satz wird nicht vorgelesen (${luecke.satz})`);
  if ((await zaehler()) !== "0") fehlt("Lückensätze: nach einem Fehlgriff zählt die Lücke trotzdem");

  // --- 6f. Buchstabengleis -------------------------------------------------------------
  // Mit der Maus über das Gleis, Strich für Strich: Die Lok folgt nur auf dem
  // Gleis und nur vorwärts; wer weit abkommt, entgleist. Punkte werden
  // angetippt. Ist der Buchstabe fertig, sagt die Stimme sein Wort.
  await oeffne("buchstabengleis.html", "window.LernappBuchstabengleis");
  const gleisListe = await page.evaluate(() => window.LernappBuchstabengleis.buchstabenListe().map((l) => l.id).join(","));
  if (gleisListe !== "m,a,l,i,o,s,e,r,n,u,f,w,h,d,t,b,k,p,g") fehlt(`Buchstabengleis: zur Wahl stehen ${gleisListe}`);
  await page.locator(".lese-los-knopf").click();
  await page.waitForSelector(".bg-svg", { timeout: 5000 }).catch(() => {});
  const fahreStrich = async ({ weit = false } = {}) => {
    const pts = await page.evaluate(() => window.LernappBuchstabengleis.bildschirmPunkte());
    if (!pts.length) return;
    await page.mouse.move(pts[0].x, pts[0].y);
    await page.mouse.down();
    if (weit) {
      await page.mouse.move(pts[0].x + 150, pts[0].y + 150, { steps: 6 });
    } else {
      for (let i = 0; i < pts.length; i += 4) await page.mouse.move(pts[i].x + 2, pts[i].y + 2);
      await page.mouse.move(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    await page.mouse.up();
  };
  for (const [zeichen, striche] of [["E", 4], ["i", 2]]) {
    await page.evaluate((z) => window.LernappBuchstabengleis.uebe(z), zeichen);
    await vergiss();
    // Erst daneben: Die Lok bleibt, wo sie war, und es zählt als Entgleisen.
    if (zeichen === "E") {
      await fahreStrich({ weit: true });
      const nachher = await page.evaluate(() => window.LernappBuchstabengleis.jetzt());
      if (nachher.entgleist !== 1 || nachher.strich !== 0 || nachher.pos > 20) fehlt(`Buchstabengleis: weit daneben fährt die Lok mit (${JSON.stringify(nachher)})`);
    }
    for (let n = 0; n < striche; n += 1) {
      const j = await page.evaluate(() => window.LernappBuchstabengleis.jetzt());
      if (j.phase !== "fahren") break;
      if (j.punkt) {
        const [p0] = await page.evaluate(() => window.LernappBuchstabengleis.bildschirmPunkte());
        await page.mouse.click(p0.x, p0.y);
      } else await fahreStrich();
      await page.waitForTimeout(60);
    }
    const fertig = await page.evaluate(() => window.LernappBuchstabengleis.jetzt());
    if (fertig.phase !== "fertig" && fertig.phase !== "over") fehlt(`Buchstabengleis ${zeichen}: nach ${striche} Strichen ist der Buchstabe nicht fertig (${JSON.stringify(fertig)})`);
    await page.waitForFunction(() => window.LernappBuchstabengleis.jetzt().phase !== "fahren", null, { timeout: 3000 }).catch(() => {});
    await page.waitForFunction((w) => (window.__gesagt || []).includes(w), zeichen === "E" ? "Ente" : "Igel", { timeout: 5000 }).catch(() => {});
    if (!(await gesagt()).includes(zeichen === "E" ? "Ente" : "Igel")) fehlt(`Buchstabengleis ${zeichen}: die Stimme sagt das Wort nicht`);
  }

  // --- 6d. Die Buchstaben der Schule --------------------------------------------------
  // Haben die Eltern abgehakt, wohnen genau diese Laute im Buchstabenhaus, und
  // Laute kuppeln nimmt nur Wörter, die sich damit lesen lassen.
  await page.evaluate(() => localStorage.setItem("lernapp.lesen.eltern", JSON.stringify({ startpunkt: "auto", schrift: "auto", bekannt: ["m", "a", "l", "i", "o", "s", "e", "r", "n", "u"], at: Date.now() })));
  await oeffne("buchstabenhaus.html", "window.LernappBuchstabenhaus");
  const schulHaus = await page.evaluate(() => [...document.querySelectorAll(".bh-fenster")].map((f) => f.dataset.laut).join(","));
  if (schulHaus !== "m,a,l,i,o,s,e,r,n,u") fehlt(`Buchstaben der Schule: im Buchstabenhaus wohnen ${schulHaus}`);
  for (const [seite, api] of [["lautekuppeln.html", "LernappLauteKuppeln"], ["werfaehrtmit.html", "LernappWerFaehrtMit"], ["woerterbauen.html", "LernappWoerterBauen"]]) {
    await oeffne(seite, `window.${api}`);
    const unlesbar = await page.evaluate((name) => {
      const bekannt = window.LernappLeseStand.bekannteLaute();
      return window[name].wortListe().filter((w) => window.LernappLeseInhalte.fehlendeLaute(w.silben, bekannt).length).map((w) => w.wort);
    }, api);
    if (unlesbar.length) fehlt(`Buchstaben der Schule: ${seite} nimmt ${unlesbar.join(", ")}`);
  }
  await page.evaluate(() => localStorage.removeItem("lernapp.lesen.eltern"));

  // --- 7. Das Bücherregal ------------------------------------------------------------------
  await oeffne("buecher.html", "window.LernappBuecher");
  await page.waitForTimeout(300);
  const regal = await page.evaluate(() => ({
    buecher: document.querySelectorAll(".bu-umschlag").length,
    gesperrt: [...document.querySelectorAll(".bu-umschlag.is-locked")].map((b) => b.dataset.buch),
    reiter: [...document.querySelectorAll(".bu-reiter")].map((r) => r.dataset.stufe).join(","),
    offen: document.querySelector(".bu-reiter.is-offen")?.dataset.stufe,
    sichtbar: [...document.querySelectorAll(".bu-fach:not([hidden]) .bu-umschlag")].map((b) => b.dataset.buch),
    soll: window.LernappLeseBuecher.BUECHER.filter((b) => b.stufe === "hoerbuch").map((b) => b.id),
  }));
  if (regal.buecher < 16) fehlt(`Bücherregal: nur ${regal.buecher} Bücher`);
  if (regal.gesperrt.includes("hase-rueebli") || regal.gesperrt.includes("leo-melone")) fehlt("Bücherregal: ein freies Buch trägt ein Schloss");
  if (!regal.gesperrt.includes("sepp-gewitter")) fehlt("Bücherregal: ein Buch, das zum Kauf gehört, ist für den Gast offen");
  // Ein Fach je Stufe: Ohne Einstellung (Lesestufe Buchstaben) ist das Fach
  // zum Zuhören offen, und nur seine Bücher stehen da.
  if (regal.reiter !== "hoerbuch,erste,klein,geschichte") fehlt(`Bücherregal: die Reiter sind ${regal.reiter}`);
  if (regal.offen !== "hoerbuch" || regal.sichtbar.join(",") !== regal.soll.join(",")) fehlt(`Bücherregal: offen ist ${regal.offen} mit ${regal.sichtbar.join(", ")}`);
  await page.locator('.bu-reiter[data-stufe="geschichte"]').click();
  const geschichten = await page.evaluate(() => [...document.querySelectorAll(".bu-fach:not([hidden]) .bu-umschlag")].map((b) => b.dataset.buch));
  if (!geschichten.includes("sepp-gewitter") || geschichten.includes("hase-rueebli")) fehlt(`Bücherregal: das Fach Geschichten zeigt ${geschichten.join(", ")}`);
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
console.log("Die Leseecke läuft: Lesewagen, Zimmer mit Auswahl, alle Spiele hin und zurück, eine Runde Silbenzug bis zum Tor, Laute kuppeln ohne verratenes Wort, Buchstabenhaus, der Würfel von «Stimmt das?», Reimkupplung, Anlaut-Lauscher, Wer fährt mit?, Wörter bauen, Silbenbahn, Blitzwörter, Mein Name, der Lesewurm bekommt seinen Namen, Lückensätze, Buchstabengleis, die Buchstaben der Schule, Hörbuch mit Nachsehen, Zusammen lesen, und der Lesewurm wächst.");
