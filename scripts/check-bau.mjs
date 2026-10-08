/*
 * Die Bauecke im Browser: hinein, bauen, einrichten, plaudern, Ziegel holen.
 * ---------------------------------------------------------------------------
 * Was validate-bau.mjs an den Listen nachrechnet, zeigt sich hier am
 * Bildschirm – auf dem Tablet (1600 × 1000) und dem Handy im Querformat
 * (812 × 375). Geprüft wird als Gast (Firebase ist umgeleitet) und mit einer
 * Sprachausgabe, die sich merkt, was gesagt wird:
 *
 *   Startbild     Der Bauplatz steht rechts oben, gross genug zum Antippen,
 *                 und deckt keinen anderen Knopf zu. Neben dem Ton-Knopf
 *                 steht der Vorlesen-Schalter.
 *   Hauswahl      Beim ersten Mal fragt die Bauecke, welches Haus zuerst; die
 *                 vier Häuser sind oben immer erreichbar.
 *   Zimmer        Ein Tipp auf das leere Stockwerk fragt nach der Zimmerart
 *                 und liest vor, was dort geschieht; danach zieht ein Tier
 *                 ein, und das Zimmer füllt den Bildschirm.
 *   Einrichten    Antippen stellt ein Ding hinein, Ziehen aus der Schublade
 *                 an die Stelle, wo man loslässt; ein kleines Ding landet auf
 *                 dem Tisch darunter; Wand und Boden lassen sich anmalen;
 *                 Rückgängig nimmt den letzten Schritt zurück.
 *   Tier-Tafel    Acht Wünsche in drei Farben, eine Antwort auf jede Frage.
 *   Ziegel        Der Rätsel-Knopf öffnet ein Rätsel mit bau=1; auf der
 *                 Spielseite führt der Weg zurück in die Bauecke. Ein gelöstes
 *                 Rätsel bringt eine Palette, der Zug liefert sie, und das
 *                 Plus baut ein Stockwerk. Nach dem Neuladen ist alles da.
 *   Vorlesen aus  Mit ausgeschaltetem Vorlesen bleibt die Bauecke still.
 *   Fehler        Keine einzige Ausnahme im Browser.
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
catch { console.error("Playwright fehlt – ohne Browser lässt sich die Bauecke nicht prüfen."); process.exit(2); }

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
const pruefe = (bedingung, was) => { if (!bedingung) fehlt(was); };

// Eine Sprachausgabe, die sofort fertig ist und sich merkt, was gesagt wurde.
function stimmeErsatz() {
  window.__gesagt = [];
  HTMLMediaElement.prototype.play = function play() { setTimeout(() => this.dispatchEvent(new Event("ended")), 5); return Promise.resolve(); };
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [],
    speak(aeusserung) { window.__gesagt.push(String(aeusserung.text)); setTimeout(() => aeusserung.dispatchEvent(new Event("end")), 5); },
    cancel() {}, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
}

function ueberlappen(a, b) {
  return a && b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function neueSeite(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 900 });
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  await context.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await context.addInitScript(stimmeErsatz);
  const page = await context.newPage();
  const ausnahmen = [];
  page.on("pageerror", (e) => ausnahmen.push(e.message));
  return { context, page, ausnahmen };
}

// Mitte eines Elements antippen (Maus genügt, die Bühne hört auf Pointer).
async function tippe(page, selektor) {
  const box = await page.locator(selektor).first().boundingBox();
  if (!box) throw new Error(`${selektor} ist nicht im Bild`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function ziehe(page, von, nach, schritte = 10) {
  await page.mouse.move(von.x, von.y);
  await page.mouse.down();
  await page.mouse.move(von.x, von.y - 30, { steps: 3 });
  await page.mouse.move(nach.x, nach.y, { steps: schritte });
  await page.mouse.up();
}

async function startbild(page) {
  await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
  await page.waitForTimeout(400);
  await page.mouse.click(5, 300);
  await page.waitForTimeout(2200);
}

async function pruefeGeraet(browser, name, viewport) {
  const { context, page, ausnahmen } = await neueSeite(browser, viewport);
  try {
    await startbild(page);
    // --- Startbild ---------------------------------------------------------
    const platz = await page.locator(".bauplatz-knopf").boundingBox();
    const gesetzt = await page.locator(".bauplatz-knopf").getAttribute("data-placed");
    pruefe(platz && gesetzt === "1", `${name}: kein Bauplatz auf dem Startbild`);
    if (platz) {
      pruefe(platz.width >= 70 && platz.height >= 18, `${name}: der Bauplatz ist zu klein (${Math.round(platz.width)} × ${Math.round(platz.height)})`);
      pruefe(platz.x + platz.width / 2 > viewport.width / 2, `${name}: der Bauplatz steht nicht rechts`);
      for (const andere of [".sound-toggle:not(.tts-toggle)", ".tts-toggle", ".account-button", ".scene-button", ".lesewagen-knopf", ".train-start", "[data-loco]"]) {
        const box = await page.locator(andere).first().boundingBox().catch(() => null);
        pruefe(!ueberlappen(platz, box), `${name}: der Bauplatz deckt ${andere} zu`);
      }
    }
    const tts = await page.locator(".tts-toggle").boundingBox();
    const ton = await page.locator(".sound-toggle:not(.tts-toggle)").boundingBox();
    pruefe(tts && ton && Math.abs(tts.y - ton.y) < 2 && tts.x < ton.x && !ueberlappen(tts, ton), `${name}: der Vorlesen-Schalter steht nicht neben dem Ton`);

    // --- Hinein und das erste Haus wählen ----------------------------------
    await tippe(page, ".bauplatz-knopf");
    await page.waitForTimeout(900);
    pruefe(await page.locator(".bau-wahl.is-hauswahl").count() === 1, `${name}: beim ersten Mal fehlt die Hauswahl`);
    pruefe(await page.locator(".bau-wahl-feld").count() === 4, `${name}: die Hauswahl zeigt nicht vier Häuser`);
    await page.locator(".bau-wahl-feld").nth(1).click();
    await page.waitForTimeout(150);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Im Spital wird geholfen"), `${name}: die Hauswahl liest das Spital nicht vor`);
    await page.locator(".bau-ok").click();
    await page.waitForTimeout(1000);
    pruefe(await page.locator(".bau-tab").count() === 4 && await page.locator(".bau-tab.is-aktiv[data-haus='spital']").count() === 1, `${name}: der Umschalter zeigt nicht das Spital`);
    for (const teil of [".bau-tab", ".bau-raetsel", ".bau-ziegel"]) {
      const box = await page.locator(teil).first().boundingBox();
      pruefe(box && box.y >= 0 && box.y + box.height <= viewport.height && box.height >= 40, `${name}: ${teil} ist nicht ganz im Bild oder zu klein`);
    }

    // --- Zimmerart wählen ---------------------------------------------------
    await tippe(page, '.bau-stock[data-stock="0"]');
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-wahl.is-raumwahl .bau-wahl-feld").count() >= 10, `${name}: die Zimmerwahl im Spital hat zu wenig Abteilungen`);
    await page.locator(".bau-wahl-feld", { hasText: "Radiologie" }).click();
    await page.waitForTimeout(150);
    pruefe((await page.evaluate(() => window.__gesagt.at(-1) || "")).includes("Bilder vom Inneren des Körpers"), `${name}: die Radiologie wird nicht erklärt`);
    await page.locator(".bau-ok").click();
    await page.waitForTimeout(1900);
    pruefe(await page.locator(".bau-zimmeransicht:not([hidden])").count() === 1, `${name}: nach der Wahl öffnet das Zimmer nicht`);
    const tier = await page.evaluate(() => window.LernappBauStand.stock("spital", 0).tier);
    pruefe(tier && tier.w.length === 5 && tier.g.length === 2 && tier.b.length === 1, `${name}: kein Tier mit acht Wünschen eingezogen`);
    const svg = await page.locator(".bau-zimmer-svg").boundingBox();
    pruefe(svg && svg.width >= viewport.width * 0.55, `${name}: das Zimmer ist nicht gross (${Math.round(svg?.width || 0)} px breit)`);
    const kopf = await page.locator(".bau-kopfzeile").boundingBox();
    for (const fest of [".sound-toggle:not(.tts-toggle)", ".tts-toggle", ".account-button"]) {
      for (const teil of await page.locator(".bau-kopfzeile button").all()) {
        const a = await teil.boundingBox();
        const b = await page.locator(fest).boundingBox();
        pruefe(!ueberlappen(a, b), `${name}: ein Knopf im Zimmerkopf liegt unter ${fest}`);
      }
    }
    pruefe(kopf, `${name}: kein Zimmerkopf`);

    // --- Einrichten ---------------------------------------------------------
    const zaehle = () => page.evaluate(() => window.LernappBauStand.stock("spital", 0).dinge.length);
    await page.locator('.bau-ding-knopf[data-ding="roentgen"]').click();
    await page.waitForTimeout(700);
    pruefe(await zaehle() === 1, `${name}: Antippen stellt kein Ding ins Zimmer`);
    // Ziehen aus der Schublade an eine Stelle
    await page.locator('.bau-reiter-knopf[aria-label="Tische und Schränke"]').click();
    await page.waitForTimeout(250);
    const knopfBox = await page.locator('.bau-ding-knopf[data-ding="tisch"]').boundingBox();
    const ziel = { x: svg.x + svg.width * 0.75, y: svg.y + svg.height * 0.92 };
    await ziehe(page, { x: knopfBox.x + knopfBox.width / 2, y: knopfBox.y + knopfBox.height / 2 }, ziel);
    await page.waitForTimeout(800);
    const tisch = await page.evaluate(() => window.LernappBauStand.stock("spital", 0).dinge.find((d) => d.i === "tisch"));
    pruefe(tisch && Math.abs(tisch.x - 0.75 * 560) < 40, `${name}: das gezogene Ding steht nicht dort, wo es losgelassen wurde (${tisch ? Math.round(tisch.x) : "fehlt"})`);
    // Ein kleines Ding auf den Tisch
    await page.locator('.bau-reiter-knopf[aria-label="Spital"]').click();
    await page.waitForTimeout(250);
    const mikro = await page.locator('.bau-ding-knopf[data-ding="mikroskop"]').boundingBox();
    const ueberTisch = await page.evaluate(() => {
      const d = window.LernappBauStand.stock("spital", 0).dinge.find((x) => x.i === "tisch");
      const s = document.querySelector(".bau-zimmer-svg");
      const p = s.createSVGPoint();
      p.x = d.x; p.y = d.y - 80;
      const q = p.matrixTransform(s.getScreenCTM());
      return { x: q.x, y: q.y };
    });
    await ziehe(page, { x: mikro.x + mikro.width / 2, y: mikro.y + mikro.height / 2 }, ueberTisch);
    await page.waitForTimeout(900);
    const lage = await page.evaluate(() => {
      const dinge = window.LernappBauStand.stock("spital", 0).dinge;
      const t = dinge.find((x) => x.i === "tisch");
      const m = dinge.find((x) => x.i === "mikroskop");
      return { t, m, flaeche: window.LernappBauMoebel.DINGE.tisch.flaeche * window.LernappBauMoebel.MASS };
    });
    pruefe(lage.m && Math.abs(lage.m.y - (lage.t.y + lage.flaeche)) < 1.5, `${name}: das Mikroskop steht nicht auf dem Tisch`);
    // Den Tisch verschieben: das Mikroskop wandert mit.
    const tischKnoten = await page.locator(`.bau-ding[data-k="${lage.t.k}"]`).boundingBox();
    await ziehe(page, { x: tischKnoten.x + tischKnoten.width / 2, y: tischKnoten.y + tischKnoten.height * 0.8 }, { x: tischKnoten.x + tischKnoten.width / 2 - svg.width * 0.2, y: tischKnoten.y + tischKnoten.height * 0.8 }, 8);
    await page.waitForTimeout(700);
    const danach = await page.evaluate(() => {
      const dinge = window.LernappBauStand.stock("spital", 0).dinge;
      return { t: dinge.find((x) => x.i === "tisch"), m: dinge.find((x) => x.i === "mikroskop") };
    });
    pruefe(Math.abs(danach.m.x - danach.t.x - (lage.m.x - lage.t.x)) < 2 && danach.t.x < lage.t.x - 40, `${name}: was auf dem Tisch steht, wandert nicht mit`);
    // Rückgängig
    await page.locator('.bau-werkzeug button[aria-label="Rückgängig"]').click();
    await page.waitForTimeout(400);
    const zurueck = await page.evaluate(() => window.LernappBauStand.stock("spital", 0).dinge.find((x) => x.i === "tisch").x);
    pruefe(Math.abs(zurueck - lage.t.x) < 1, `${name}: Rückgängig holt den Tisch nicht zurück`);
    // Wand anmalen und Muster
    await page.locator('.bau-reiter-knopf[aria-label="Wand anmalen"]').click();
    await page.waitForTimeout(200);
    await page.locator('.bau-farbe[aria-label="Rosa"]').first().click();
    await page.waitForTimeout(700);
    await page.locator('.bau-muster[aria-label="Punkte"]').click();
    await page.waitForTimeout(300);
    const wand = await page.evaluate(() => { const s = window.LernappBauStand.stock("spital", 0); return `${s.wand}/${s.muster}`; });
    pruefe(wand === "rosa/punkte", `${name}: die Wand ist nicht angemalt (${wand})`);
    pruefe((await page.evaluate(() => window.__gesagt.slice(-3).join(" "))).includes("Punkte"), `${name}: das Muster wird nicht vorgelesen`);
    // Ein Ding antippen: das Menü steht ganz im Bild.
    const roentgen = await page.evaluate(() => window.LernappBauStand.stock("spital", 0).dinge.find((x) => x.i === "roentgen").k);
    await tippe(page, `.bau-ding[data-k="${roentgen}"]`);
    await page.waitForTimeout(300);
    const menue = await page.locator(".bau-bearbeiten:not([hidden])").boundingBox();
    pruefe(menue && menue.x >= 0 && menue.y >= 0 && menue.x + menue.width <= viewport.width && menue.y + menue.height <= viewport.height, `${name}: das Menü am Ding ragt aus dem Bild`);
    await page.locator('.bau-bearbeiten button[aria-label="Grösser"]').click();
    await page.waitForTimeout(250);
    pruefe(await page.evaluate((k) => window.LernappBauStand.stock("spital", 0).dinge.find((x) => x.k === k).s > 1, roentgen), `${name}: Grösser macht nicht grösser`);

    // --- Die Tier-Tafel -----------------------------------------------------
    await page.locator(".bau-zimmertier").click();
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-wunsch").count() === 8, `${name}: die Tafel zeigt nicht acht Wünsche`);
    for (const farbe of ["gelb", "gruen", "blau"]) pruefe(await page.locator(`.bau-wunsch.is-${farbe}`).count() > 0, `${name}: keine ${farbe}en Wünsche auf der Tafel`);
    const vorher = await page.evaluate(() => window.__gesagt.length);
    await page.locator(".bau-frage").nth(5).click();
    await page.waitForTimeout(300);
    pruefe(await page.locator(".bau-sagt.is-tier").count() === 1, `${name}: das Tier antwortet nicht`);
    pruefe(await page.evaluate((n) => window.__gesagt.length > n, vorher), `${name}: die Antwort wird nicht vorgelesen`);
    const karte = await page.locator(".bau-tafel-karte").boundingBox();
    pruefe(karte && karte.y >= 50, `${name}: die Tafel liegt unter den Knöpfen oben`);
    await page.locator(".bau-tafel-zu").click();
    await page.waitForTimeout(200);

    // --- Zurück in die Hausansicht, dann der Rätsel-Knopf -----------------------
    await page.locator(".stage-back").click();
    await page.waitForTimeout(900);
    pruefe(await page.locator(".bau-zimmeransicht[hidden]").count() === 1, `${name}: Zurück schliesst das Zimmer nicht`);
    pruefe(await page.evaluate(() => JSON.parse(localStorage.getItem("lernapp.bau")).haeuser.spital.stock[0].dinge.length) === 3, `${name}: das Zimmer ist nicht gespeichert`);
    const [nav] = await Promise.all([
      page.waitForURL(/\?station=\d+&bau=1&spiel=/, { timeout: 8000 }).then(() => true).catch(() => false),
      page.locator(".bau-raetsel").click(),
    ]);
    pruefe(nav, `${name}: der Rätsel-Knopf öffnet kein Rätsel`);
    if (nav) {
      await page.waitForTimeout(1200);
      const aufSeite = await page.evaluate(() => ({ task: window.LernappReise?.fromLocation?.(), bau: Boolean(document.querySelector(".cm-icon-bau, #bau-anders-button")), zurueck: document.querySelector(".cm-icon-bau, #back-button")?.getAttribute("aria-label") || "" }));
      pruefe(aufSeite.task?.bau && aufSeite.bau && /Bauecke/.test(aufSeite.zurueck), `${name}: die Spielseite kennt das Rätsel aus der Bauecke nicht (${JSON.stringify(aufSeite.zurueck)})`);
      // Gelöst: eine Palette. (Das Spiel selbst prüfen die Spielskripte.)
      await page.evaluate(() => window.LernappReise.bauGeschafft());
    }
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(6200);
    pruefe(await page.locator(".bauecke").count() === 1, `${name}: zurück aus dem Rätsel steht man nicht in der Bauecke`);
    pruefe(await page.locator(".bau-ziegel-zahl").textContent() === "1", `${name}: der Zug hat keine Palette gebracht`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Zug bringt Ziegel"), `${name}: die Lieferung wird nicht angesagt`);
    // Bauen
    const plus = await page.locator(".bau-naechster").boundingBox();
    pruefe(plus && plus.y >= 0 && plus.y < viewport.height, `${name}: nach der Lieferung ist das Plus nicht im Bild`);
    await tippe(page, ".bau-naechster .bau-plus");
    await page.waitForTimeout(2200);
    pruefe(await page.evaluate(() => window.LernappBauStand.haus("spital").stock.length) === 2, `${name}: das Plus baut kein Stockwerk`);
    pruefe(await page.locator(".bau-wahl.is-raumwahl").count() === 1, `${name}: nach dem Bauen kommt keine Zimmerwahl`);
    await page.locator(".bau-abbrechen").click();
    await page.waitForTimeout(200);
    pruefe(await page.locator(".bau-ziegel-zahl").textContent() === "0", `${name}: die Palette ist nach dem Bauen nicht verbraucht`);

    // --- Neu laden: alles noch da ----------------------------------------------
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(800);
    const nachLaden = await page.evaluate(() => ({ n: window.LernappBauStand.haus("spital").stock.length, dinge: window.LernappBauStand.stock("spital", 0).dinge.length, tier: window.LernappBauStand.stock("spital", 0).tier?.a }));
    pruefe(nachLaden.n === 2 && nachLaden.dinge === 3 && nachLaden.tier === tier.a, `${name}: nach dem Neuladen fehlt etwas (${JSON.stringify(nachLaden)})`);

    // --- Vorlesen aus: die Bauecke bleibt still ----------------------------------
    await page.mouse.click(5, 300);
    await page.waitForTimeout(1800);
    await page.locator(".tts-toggle").click();
    pruefe(await page.evaluate(() => localStorage.getItem("lernapp.tts")) === "0", `${name}: der Vorlesen-Schalter schaltet nicht aus`);
    await tippe(page, ".bauplatz-knopf");
    await page.waitForTimeout(900);
    const stillVorher = await page.evaluate(() => window.__gesagt.length);
    await page.locator('.bau-tab[data-haus="wohnhaus"]').click();
    await page.waitForTimeout(900);
    await tippe(page, '.bau-stock[data-stock="0"]');
    await page.waitForTimeout(400);
    await page.locator(".bau-wahl-feld", { hasText: "Küche" }).click();
    await page.waitForTimeout(200);
    pruefe(await page.evaluate((n) => window.__gesagt.length === n, stillVorher), `${name}: mit ausgeschaltetem Vorlesen wird trotzdem gesprochen`);
  } catch (fehler) {
    fehlt(`${name}: ${fehler.message.split("\n")[0]}`);
  }
  ausnahmen.forEach((a) => fehlt(`${name}: Ausnahme im Browser: ${a}`));
  await context.close();
}

if (!(await warteAufServer())) { console.error("Der Testserver startet nicht."); process.exit(2); }
const browser = await playwright.chromium.launch();
await pruefeGeraet(browser, "Tablet", { width: 1600, height: 1000 });
await pruefeGeraet(browser, "Handy", { width: 812, height: 375 });
await browser.close();
halt();

if (befunde.length) {
  console.error(`Die Bauecke hat ${befunde.length} Befunde:`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Bauecke läuft: Bauplatz, Hauswahl, Zimmer, Einrichten, Tier-Tafel, Rätsel, Lieferung, Bauen und Vorlesen-Schalter – auf Tablet und Handy.");
