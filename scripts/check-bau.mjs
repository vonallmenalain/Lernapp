/*
 * Die Bauecke im Browser: hinein, einziehen, einrichten, umstellen, bauen.
 * ---------------------------------------------------------------------------
 * Was validate-bau.mjs an den Listen nachrechnet, zeigt sich hier am
 * Bildschirm – auf dem Tablet (1600 × 1000) und dem Handy im Querformat
 * (812 × 375). Geprüft wird als Gast (Firebase ist umgeleitet) und mit einer
 * Sprachausgabe, die sich merkt, was gesagt wird:
 *
 *   Startbild     Der Bauplatz steht rechts oben, gross genug zum Antippen,
 *                 und deckt keinen anderen Knopf zu. Neben dem Ton-Knopf
 *                 steht der Vorlesen-Schalter.
 *   Hauswahl      Beim ersten Mal fragt die Bauecke, welches Haus zuerst; oben
 *                 sind Wohnhaus, Spital, Dorf und Büro immer erreichbar.
 *   Einzug        Das Wohnhaus hat drei leere Wohnungen. Ein Tipp fragt nur:
 *                 Schlafzimmer oder Kinderzimmer? Dann kommt ein Tier die
 *                 Strasse entlang, fährt mit dem Lift hinauf, und ein
 *                 Feuerwerk begrüsst es.
 *   Zimmer        Die Schublade hat die eigenen Dinge des Zimmers (im
 *                 Kinderzimmer kein WC, in der Küche kein Bett), dazu Licht,
 *                 Bilder, Pflanzen. Antippen, Ziehen, Stapeln, Rückgängig,
 *                 Wand anmalen; der Stift ändert die Zimmerart.
 *   Tier-Tafel    Fünf Wünsche in drei Farben, wo das Tier gerade ist (mit
 *                 "Hingehen"), der Traumjob – und kein Plaudern mehr. Ist das
 *                 Vorlesen an, liest ein Tipp auf einen Text ihn vor.
 *   Umstellen     Die Pfeile tauschen Stockwerke.
 *   Ziegel        Der Rätsel-Knopf öffnet ein Rätsel mit bau=1; ein gelöstes
 *                 Rätsel bringt eine Palette, der Zug liefert sie. Das Plus
 *                 baut ein Stockwerk, im Wohnhaus mit der Frage "Wohnung oder
 *                 zwei Zimmer?". Nach dem Neuladen ist alles da.
 *   Vorlesen aus  Mit ausgeschaltetem Vorlesen bleibt die Bauecke still.
 *   Unterwegs     Später zieht ein zweites Tier ein – mit Feuerwerk. Ein Tier
 *                 bei der Arbeit: "Hingehen" führt ins richtige Haus.
 *   Wieder hinein Hinaus und wieder hinein: Zimmer und Tier-Tafel gehen auch
 *                 beim zweiten Besuch auf derselben Seite auf.
 *   Neuer Kasten  Hat ein anderes Gerät die Bauecke schon mit einer neueren
 *                 Fassung gespeichert, bleibt der Kasten unberührt, und die
 *                 Bauecke wartet auf die neue Fassung, statt zu löschen.
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

// Wartet, bis die Bedingung im Browser gilt (oder die Zeit um ist).
async function bis(page, fn, arg, ms = 12000) {
  try { await page.waitForFunction(fn, arg, { timeout: ms, polling: 100 }); return true; } catch { return false; }
}

// In einer Wahl (Karten) eine Karte und dann den Haken – auf dem Handy rollt
// die Karte dafür ins Bild.
async function waehle(page, text) {
  const karte = page.locator(".bau-wahl .bau-wahl-feld", { hasText: text }).first();
  await karte.scrollIntoViewIfNeeded();
  await karte.click();
  await page.waitForTimeout(200);
  const ok = page.locator(".bau-wahl .bau-ok");
  await ok.scrollIntoViewIfNeeded();
  await ok.click();
}

// Ein Feuerwerk ist zu sehen: Es braucht nur kurz einmal da zu sein.
function feuerwerkWache(page) {
  return page.evaluate(() => {
    window.__feuerwerk = 0;
    const blick = new MutationObserver(() => { window.__feuerwerk = Math.max(window.__feuerwerk, document.querySelectorAll(".bau-feuerwerk").length); });
    blick.observe(document.body, { childList: true, subtree: true });
  });
}

async function pruefeGeraet(browser, name, viewport) {
  const { context, page, ausnahmen } = await neueSeite(browser, viewport);
  const S = (fn, arg) => page.evaluate(fn, arg);
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
    const namen = await page.locator(".bau-wahl-feld > span").allTextContents();
    pruefe(namen.join("|") === "Wohnhaus|Spital|Dorf|Büro", `${name}: die Häuser heissen ${namen.join(", ")}`);
    await page.locator(".bau-wahl-feld").nth(0).click();
    await page.waitForTimeout(150);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Im Wohnhaus wohnen die Tiere"), `${name}: die Hauswahl liest das Wohnhaus nicht vor`);
    await page.locator(".bau-ok").click();
    await page.waitForTimeout(1000);
    pruefe(await page.locator(".bau-tab").count() === 4 && await page.locator(".bau-tab.is-aktiv[data-haus='wohnhaus']").count() === 1, `${name}: der Umschalter zeigt nicht das Wohnhaus`);
    for (const teil of [".bau-tab", ".bau-raetsel", ".bau-ziegel", ".bau-ordnenknopf"]) {
      const box = await page.locator(teil).first().boundingBox();
      pruefe(box && box.y >= 0 && box.y + box.height <= viewport.height && box.height >= 40, `${name}: ${teil} ist nicht ganz im Bild oder zu klein`);
    }
    pruefe(await page.locator(".bau-raum[data-ziel='wohnungwahl']").count() === 3, `${name}: das Wohnhaus beginnt nicht mit drei leeren Wohnungen`);

    // --- Eine Wohnung: Kinderzimmer, und es zieht jemand ein ------------------
    await feuerwerkWache(page);
    await tippe(page, ".bau-raum[data-stock='0']");
    await page.waitForTimeout(500);
    const karten = await page.locator(".bau-wahl.is-raumwahl .bau-wahl-feld").allTextContents();
    pruefe(karten.join("|") === "Schlafzimmer|Kinderzimmer", `${name}: eine leere Wohnung fragt nach ${karten.join(", ")}`);
    await waehle(page, "Kinderzimmer");
    pruefe(await bis(page, () => document.querySelector(".bau-einzuglage")?.children.length > 0), `${name}: niemand kommt die Strasse entlang`);
    pruefe(await bis(page, () => document.querySelector(".bau-zimmeransicht:not([hidden])")), `${name}: nach dem Einzug öffnet das Zimmer nicht`);
    const tier = await S(() => window.LernappBauStand.stock("wohnhaus", 0).tiere[0]);
    pruefe(tier && tier.w.length === 2 && tier.g.length === 1 && tier.b.length === 2 && tier.traum, `${name}: kein Tier mit fünf Wünschen und Traumjob eingezogen`);
    pruefe(await page.evaluate(() => window.__feuerwerk) >= 3, `${name}: kein Feuerwerk beim Einzug`);
    const gesagt = await page.evaluate(() => window.__gesagt.join(" | "));
    pruefe(/zieht ein/.test(gesagt) && /Willkommen/.test(gesagt), `${name}: der Einzug wird nicht angesagt`);

    // --- Das Zimmer -----------------------------------------------------------
    const svg = await page.locator(".bau-zimmer-svg").boundingBox();
    pruefe(svg && svg.width >= viewport.width * 0.55, `${name}: das Zimmer ist nicht gross (${Math.round(svg?.width || 0)} px breit)`);
    for (const fest of [".sound-toggle:not(.tts-toggle)", ".tts-toggle", ".account-button"]) {
      for (const teil of await page.locator(".bau-kopfzeile button").all()) {
        pruefe(!ueberlappen(await teil.boundingBox(), await page.locator(fest).boundingBox()), `${name}: ein Knopf im Zimmerkopf liegt unter ${fest}`);
      }
    }
    const reiter = await page.locator(".bau-reiter-knopf").evaluateAll((b) => b.map((x) => x.dataset.reiter));
    pruefe(reiter.join() === "zimmer,tiere,ueberall,wand,boden", `${name}: die Schubladen der Wohnung sind ${reiter.join(", ")}`);
    const schublade = await page.locator(".bau-schublade [data-ding]").evaluateAll((b) => b.map((x) => x.dataset.ding));
    pruefe(schublade.includes("w_spielzelt") && !schublade.some((id) => ["wc", "dusche", "kochherd", "doppelbett"].includes(id)), `${name}: in der Schublade des Kinderzimmers liegt Fremdes oder fehlt das Eigene`);
    pruefe(await page.locator(".bau-stiftknopf[aria-label='Zimmerart ändern']").count() === 1, `${name}: kein Stift zum Ändern der Zimmerart`);
    // Antippen stellt hinein.
    const zaehle = () => S(() => window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge.length);
    await page.locator('.bau-ding-knopf[data-ding="w_spielzelt"]').scrollIntoViewIfNeeded();
    await page.locator('.bau-ding-knopf[data-ding="w_spielzelt"]').click();
    await page.waitForTimeout(700);
    pruefe(await zaehle() === 1, `${name}: Antippen stellt kein Ding ins Zimmer`);
    // Ziehen an eine Stelle: der Tisch.
    await page.locator('.bau-ding-knopf[data-ding="tisch"]').scrollIntoViewIfNeeded();
    const knopfBox = await page.locator('.bau-ding-knopf[data-ding="tisch"]').boundingBox();
    const ziel = { x: svg.x + svg.width * 0.7, y: svg.y + svg.height * 0.92 };
    await ziehe(page, { x: knopfBox.x + knopfBox.width / 2, y: knopfBox.y + knopfBox.height / 2 }, ziel);
    await page.waitForTimeout(800);
    const tisch = await S(() => window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge.find((d) => d.i === "tisch"));
    pruefe(tisch && Math.abs(tisch.x - 0.7 * 560) < 40, `${name}: das gezogene Ding steht nicht dort, wo es losgelassen wurde (${tisch ? Math.round(tisch.x) : "fehlt"})`);
    const menueAmTisch = await page.locator(".bau-bearbeiten:not([hidden])").boundingBox().catch(() => null);
    pruefe(!ueberlappen(menueAmTisch, await page.locator(".bau-schublade").boundingBox().catch(() => null)), `${name}: das Menü am Ding deckt die Schublade zu`);
    // Ein kleines Ding auf den Tisch.
    const klein = await S(() => window.LernappBauKatalog.dingeFuer("kinderzimmer").find((id) => window.LernappBauMoebel.DINGE[id].klein));
    await page.locator(`.bau-ding-knopf[data-ding="${klein}"]`).scrollIntoViewIfNeeded();
    const kleinBox = await page.locator(`.bau-ding-knopf[data-ding="${klein}"]`).boundingBox();
    const ueberTisch = await S(() => {
      const d = window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge.find((x) => x.i === "tisch");
      const s = document.querySelector(".bau-zimmer-svg");
      const p = s.createSVGPoint();
      p.x = d.x; p.y = d.y - 80;
      const q = p.matrixTransform(s.getScreenCTM());
      return { x: q.x, y: q.y };
    });
    await ziehe(page, { x: kleinBox.x + kleinBox.width / 2, y: kleinBox.y + kleinBox.height / 2 }, ueberTisch);
    await page.waitForTimeout(900);
    const lage = await S((k) => {
      const dinge = window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge;
      return { t: dinge.find((x) => x.i === "tisch"), m: dinge.find((x) => x.i === k), flaeche: window.LernappBauMoebel.DINGE.tisch.flaeche * window.LernappBauMoebel.MASS };
    }, klein);
    pruefe(lage.m && Math.abs(lage.m.y - (lage.t.y + lage.flaeche)) < 1.5, `${name}: ${klein} steht nicht auf dem Tisch`);
    // Den Tisch verschieben: was darauf steht, wandert mit – auch wenn mitten
    // im Ziehen gespeichert wird.
    const tischKnoten = await page.locator(`.bau-ding[data-k="${lage.t.k}"]`).boundingBox();
    const tischVon = { x: tischKnoten.x + tischKnoten.width / 2, y: tischKnoten.y + tischKnoten.height * 0.8 };
    const tischNach = { x: tischVon.x - svg.width * 0.2, y: tischVon.y };
    await page.mouse.move(tischVon.x, tischVon.y);
    await page.mouse.down();
    await page.mouse.move(tischVon.x, tischVon.y - 30, { steps: 3 });
    await page.mouse.move((tischVon.x + tischNach.x) / 2, tischNach.y, { steps: 4 });
    await page.evaluate(() => window.LernappBauStand.speichern(true));
    await page.mouse.move(tischNach.x, tischNach.y, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(700);
    const danach = await S((k) => {
      const dinge = window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge;
      return { t: dinge.find((x) => x.i === "tisch"), m: dinge.find((x) => x.i === k) };
    }, klein);
    pruefe(Math.abs(danach.m.x - danach.t.x - (lage.m.x - lage.t.x)) < 2 && danach.t.x < lage.t.x - 40, `${name}: was auf dem Tisch steht, wandert nicht mit`);
    // Rückgängig
    await page.locator('.bau-werkzeug button[aria-label="Rückgängig"]').click();
    await page.waitForTimeout(400);
    const zurueck = await S(() => window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge.find((x) => x.i === "tisch").x);
    pruefe(Math.abs(zurueck - lage.t.x) < 1, `${name}: Rückgängig holt den Tisch nicht zurück`);
    // Wand anmalen und Muster
    await page.locator('.bau-reiter-knopf[data-reiter="wand"]').click();
    await page.waitForTimeout(200);
    await page.locator('.bau-farbe[aria-label="Rosa"]').first().click();
    await page.waitForTimeout(700);
    await page.locator('.bau-muster[aria-label="Punkte"]').click();
    await page.waitForTimeout(300);
    const wand = await S(() => { const z = window.LernappBauStand.zimmer("wohnhaus", 0, 0); return `${z.wand}/${z.muster}`; });
    pruefe(wand === "rosa/punkte", `${name}: die Wand ist nicht angemalt (${wand})`);
    // Ein Ding antippen: das Menü steht ganz im Bild.
    const zelt = await S(() => window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge.find((x) => x.i === "w_spielzelt").k);
    await tippe(page, `.bau-ding[data-k="${zelt}"]`);
    await page.waitForTimeout(300);
    const menue = await page.locator(".bau-bearbeiten:not([hidden])").boundingBox();
    pruefe(menue && menue.x >= 0 && menue.y >= 0 && menue.x + menue.width <= viewport.width && menue.y + menue.height <= viewport.height, `${name}: das Menü am Ding ragt aus dem Bild`);
    await page.locator('.bau-bearbeiten button[aria-label="Grösser"]').click();
    await page.waitForTimeout(250);
    pruefe(await S((k) => window.LernappBauStand.zimmer("wohnhaus", 0, 0).dinge.find((x) => x.k === k).s > 1, zelt), `${name}: Grösser macht nicht grösser`);

    // --- Die Tier-Tafel -----------------------------------------------------
    await page.locator(".bau-zimmertier").first().click();
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-wunsch").count() === 5, `${name}: die Tafel zeigt nicht fünf Wünsche`);
    for (const farbe of ["gelb", "gruen", "blau"]) pruefe(await page.locator(`.bau-wunsch.is-${farbe}`).count() > 0, `${name}: keine ${farbe}en Wünsche auf der Tafel`);
    pruefe(await page.locator(".bau-tafel .bau-hingehen").count() === 1 && await page.locator(".bau-tafel .bau-traum").count() === 1, `${name}: auf der Tafel fehlen "Hingehen" oder der Traumjob`);
    pruefe(await page.locator(".bau-tafel .bau-frage, .bau-tafel .bau-plaudern").count() === 0, `${name}: auf der Tafel kann man noch plaudern`);
    const vorher = await page.evaluate(() => window.__gesagt.length);
    await page.locator(".bau-tafel-wo p").click();
    await page.waitForTimeout(200);
    pruefe((await page.evaluate((n) => window.__gesagt.slice(n).join(" "), vorher)).includes("ist zu Hause"), `${name}: ein Tipp auf den Text liest ihn nicht vor`);
    const karte = await page.locator(".bau-tafel-karte").boundingBox();
    pruefe(karte && karte.y >= 50, `${name}: die Tafel liegt unter den Knöpfen oben`);
    await page.locator(".bau-tafel-zu").click();
    await page.waitForTimeout(200);

    // --- Zurück ins Haus, Stockwerke umstellen ----------------------------------
    await page.locator(".stage-back").click();
    await page.waitForTimeout(900);
    pruefe(await page.locator(".bau-zimmeransicht[hidden]").count() === 1, `${name}: Zurück schliesst das Zimmer nicht`);
    pruefe(await page.evaluate(() => JSON.parse(localStorage.getItem("lernapp.bau")).haeuser.wohnhaus.stock[0].zimmer[0].dinge.length) === 3, `${name}: das Zimmer ist nicht gespeichert`);
    await page.locator(".bau-ordnenknopf").click();
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-ordnenpfeil").count() === 4, `${name}: beim Umstellen fehlen die Pfeile`);
    await tippe(page, '.bau-ordnenpfeil[data-ziel="hoch"][data-stock="0"]');
    await page.waitForTimeout(700);
    pruefe(await S(() => window.LernappBauStand.zimmer("wohnhaus", 1, 0).raum) === "kinderzimmer", `${name}: der Pfeil stellt das Kinderzimmer nicht nach oben`);
    await page.locator(".bau-ordnenknopf").click();
    await page.waitForTimeout(400);
    pruefe(await page.locator(".bau-ordnenpfeil").count() === 0, `${name}: nach dem Umstellen bleiben die Pfeile`);

    // --- Der Rätsel-Knopf ------------------------------------------------------
    const [nav] = await Promise.all([
      page.waitForURL(/\?station=\d+&bau=1&spiel=/, { timeout: 8000 }).then(() => true).catch(() => false),
      page.locator(".bau-raetsel").click(),
    ]);
    pruefe(nav, `${name}: der Rätsel-Knopf öffnet kein Rätsel`);
    if (nav) {
      await page.waitForTimeout(1200);
      const aufSeite = await page.evaluate(() => ({ task: window.LernappReise?.fromLocation?.(), bau: Boolean(document.querySelector(".cm-icon-bau, #bau-anders-button")), zurueck: document.querySelector(".cm-icon-bau, #back-button")?.getAttribute("aria-label") || "" }));
      pruefe(aufSeite.task?.bau && aufSeite.bau && /Bauecke/.test(aufSeite.zurueck), `${name}: die Spielseite kennt das Rätsel aus der Bauecke nicht (${JSON.stringify(aufSeite.zurueck)})`);
      await page.evaluate(() => window.LernappReise.bauGeschafft());
    }
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(6200);
    pruefe(await page.locator(".bauecke").count() === 1, `${name}: zurück aus dem Rätsel steht man nicht in der Bauecke`);
    pruefe(await page.locator(".bau-ziegel-zahl").textContent() === "1", `${name}: der Zug hat keine Palette gebracht`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Zug bringt Ziegel"), `${name}: die Lieferung wird nicht angesagt`);

    // --- Bauen: Wohnung oder zwei Zimmer? -----------------------------------------
    const plus = await page.locator(".bau-naechster").boundingBox();
    pruefe(plus && plus.y >= 0 && plus.y < viewport.height, `${name}: nach der Lieferung ist das Plus nicht im Bild`);
    await tippe(page, ".bau-naechster .bau-plus");
    await page.waitForTimeout(2200);
    pruefe(await S(() => window.LernappBauStand.haus("wohnhaus").stock.length) === 4, `${name}: das Plus baut kein Stockwerk`);
    pruefe(await page.locator(".bau-wahl.is-artwahl .bau-wahl-feld").count() === 2, `${name}: nach dem Bauen kommt nicht die Frage "Wohnung oder zwei Zimmer?"`);
    await waehle(page, "Zwei Zimmer");
    await page.waitForTimeout(800);
    pruefe(await page.locator('.bau-raum[data-stock="3"][data-ziel="leer"]').count() === 2, `${name}: das neue Stockwerk hat nicht zwei leere Zimmer`);
    await tippe(page, '.bau-raum[data-stock="3"][data-slot="0"]');
    await page.waitForTimeout(500);
    const raeume = await page.locator(".bau-wahl.is-raumwahl .bau-wahl-feld").allTextContents();
    pruefe(raeume.length >= 8 && !raeume.some((r) => /Schlafzimmer|Kinderzimmer/.test(r)) && raeume.some((r) => /Küche/.test(r)), `${name}: die Zimmerwahl im Wohnhaus zeigt ${raeume.join(", ")}`);
    await page.locator(".bau-wahl .bau-wahl-feld", { hasText: "Küche" }).first().click();
    await page.waitForTimeout(150);
    pruefe((await page.evaluate(() => window.__gesagt.at(-1) || "")).includes("In der Küche wird gekocht"), `${name}: die Küche wird nicht erklärt`);
    await waehle(page, "Küche");
    pruefe(await bis(page, () => document.querySelector(".bau-zimmeransicht:not([hidden])")), `${name}: die Küche öffnet nicht`);
    await page.waitForTimeout(900);
    const kueche = await page.locator(".bau-schublade [data-ding]").evaluateAll((b) => b.map((x) => x.dataset.ding));
    pruefe(kueche.includes("kochherd") && !kueche.some((id) => ["bett", "wc", "w_spielzelt"].includes(id)), `${name}: in der Schublade der Küche liegt Fremdes oder fehlt der Kochherd`);
    const halb = await page.locator(".bau-zimmer-svg").boundingBox();
    pruefe(halb && halb.height >= viewport.height * 0.4, `${name}: das halbe Zimmer ist zu klein (${Math.round(halb?.height || 0)} px hoch)`);
    pruefe(await page.locator(".bau-ziegel-zahl").textContent() === "0", `${name}: die Palette ist nach dem Bauen nicht verbraucht`);

    // --- Neu laden: alles noch da ----------------------------------------------
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(800);
    const nachLaden = await S(() => {
      const h = window.LernappBauStand.haus("wohnhaus");
      return { n: h.stock.length, kinder: h.stock[1].zimmer[0].dinge.length, tier: h.stock[1].tiere[0]?.a, kueche: h.stock[3].zimmer[0].raum };
    });
    pruefe(nachLaden.n === 4 && nachLaden.kinder === 3 && nachLaden.tier === tier.a && nachLaden.kueche === "kueche", `${name}: nach dem Neuladen fehlt etwas (${JSON.stringify(nachLaden)})`);

    // --- Vorlesen aus: die Bauecke bleibt still ----------------------------------
    await page.mouse.click(5, 300);
    await page.waitForTimeout(1800);
    await page.locator(".tts-toggle").click();
    pruefe(await page.evaluate(() => localStorage.getItem("lernapp.tts")) === "0", `${name}: der Vorlesen-Schalter schaltet nicht aus`);
    await tippe(page, ".bauplatz-knopf");
    await page.waitForTimeout(900);
    const stillVorher = await page.evaluate(() => window.__gesagt.length);
    await page.locator('.bau-tab[data-haus="spital"]').click();
    await page.waitForTimeout(900);
    await tippe(page, '.bau-raum[data-stock="0"][data-slot="0"]');
    await page.waitForTimeout(400);
    await page.locator(".bau-wahl-feld", { hasText: "Radiologie" }).first().click();
    await page.waitForTimeout(200);
    await page.locator(".bau-wahl-text").click();
    await page.waitForTimeout(200);
    pruefe(await page.evaluate((n) => window.__gesagt.length === n, stillVorher), `${name}: mit ausgeschaltetem Vorlesen wird trotzdem gesprochen`);
  } catch (fehler) {
    const zeilen = fehler.message.split("\n");
    const wo = zeilen.find((z) => /waiting for/.test(z))?.trim() || "";
    fehlt(`${name}: ${zeilen[0]}${wo ? ` (${wo})` : ""}`);
  }
  ausnahmen.forEach((a) => fehlt(`${name}: Ausnahme im Browser: ${a}`));
  await context.close();
}

// Neben dem Weg: ein zweites Tier zieht später ein, ein Tier bei der Arbeit,
// der zweite Besuch auf derselben Seite, und ein Kasten, den ein anderes
// Gerät schon mit einer neueren Fassung gespeichert hat.
async function pruefeSonderfaelle(browser, name, viewport) {
  const { context, page, ausnahmen } = await neueSeite(browser, viewport);
  try {
    await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
    await page.evaluate(() => {
      const S = window.LernappBauStand;
      S.setzeGewaehlt("wohnhaus");
      S.waehleRaum("wohnhaus", 0, 0, "schlafzimmer");
      S.waehleRaum("zentrum", 0, 0, "bibliothek");
      S.waehleRaum("spital", 0, 1, "radiologie");
      S.speichern(true);
    });
    // --- Später zieht ein zweites Tier ein: mit Lift und Feuerwerk ------------
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await feuerwerkWache(page);
    await page.evaluate(() => window.LernappBauStand.aendereStock("wohnhaus", 0, (st) => { st.zuzug = Date.now() - 1000; }));
    pruefe(await bis(page, () => window.LernappBauStand.stock("wohnhaus", 0).tiere.length === 2, null, 9000), `${name}: mit der Zeit zieht kein zweites Tier ein`);
    pruefe(await bis(page, () => window.__feuerwerk >= 3, null, 12000), `${name}: beim zweiten Einzug kein Feuerwerk`);
    await page.waitForTimeout(1500);
    // Die Sterne am Lift: eine Reihe je Tier, und die Tafel wechselt zwischen ihnen.
    await tippe(page, '.bau-tafelknopf[data-stock="0"]');
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-tafel-wechsel").count() === 2, `${name}: die Tafel zeigt die Mitbewohner nicht`);
    await page.locator(".bau-tafel-wechsel").nth(1).click();
    await page.waitForTimeout(300);
    pruefe(await page.locator(".bau-tafel-wechsel.is-aktiv").nth(0).textContent() === await page.locator(".bau-tafel-wechsel").nth(1).textContent(), `${name}: der Wechsel zum Mitbewohner geht nicht`);
    await page.locator(".bau-tafel-zu").click();
    await page.waitForTimeout(200);

    // --- Ein Tier bei der Arbeit: "Hingehen" führt ins richtige Haus -----------
    const arbeit = await page.evaluate(() => {
      const S = window.LernappBauStand;
      const seed = S.stock("wohnhaus", 0).tiere[0].seed;
      const job = S.jobVon(seed);
      if (!job) return null;
      for (let t = Date.now() + 3600000; t < Date.now() + 30 * 86400000; t += 15 * 60000) {
        const wo = S.aufenthalt(seed, t);
        if (wo.wo === "arbeit") { const echt = Date.now; Date.now = () => t + (echt() - echt()); window.__uhr = t; return { seed, haus: wo.haus }; }
      }
      return null;
    });
    pruefe(arbeit, `${name}: kein Tier hat Arbeit, obwohl es Arbeitsplätze gibt`);
    if (arbeit) {
      await tippe(page, '.bau-tafelknopf[data-stock="0"]');
      await page.waitForTimeout(500);
      const wo = await page.locator(".bau-tafel-wo p").textContent();
      pruefe(/arbeitet/.test(wo), `${name}: die Tafel sagt nicht, wo das Tier arbeitet (${wo})`);
      await page.locator(".bau-hingehen").click();
      pruefe(await bis(page, (haus) => document.querySelector(`.bau-tab.is-aktiv[data-haus="${haus}"]`), arbeit.haus, 6000), `${name}: "Hingehen" führt nicht ins Haus, in dem das Tier arbeitet`);
      await page.waitForTimeout(900);
      pruefe(await page.locator(`.bau-tier[data-seed="${arbeit.seed}"]`).count() === 1, `${name}: das Tier ist an seinem Arbeitsplatz nicht zu sehen`);
    }

    // --- Wieder hinein: Zimmer und Tafel gehen auch beim zweiten Mal auf -------
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.locator('.bau-tab[data-haus="wohnhaus"]').click();
    await page.waitForTimeout(900);
    const tafelAuf = async () => {
      await tippe(page, '.bau-raum[data-stock="0"]');
      await page.waitForTimeout(1600);
      await page.locator(".bau-zimmertier").first().click();
      await page.waitForTimeout(500);
      const karte = await page.locator(".bau-tafel-karte").boundingBox().catch(() => null);
      return Boolean(karte && karte.width > 100) && await page.locator(".bau-tafel:not([hidden]) .bau-wunsch").count() === 5;
    };
    pruefe(await tafelAuf(), `${name}: beim ersten Besuch geht die Tier-Tafel nicht auf`);
    await page.locator(".bau-tafel-zu").click();
    await page.waitForTimeout(300);
    await page.locator(".stage-back").click();
    await page.waitForTimeout(1200);
    await page.locator(".stage-back").click();
    await page.waitForTimeout(1500);
    pruefe(await page.locator(".bauecke").count() === 0, `${name}: Zurück führt nicht aus der Bauecke`);
    await tippe(page, ".bauplatz-knopf");
    await page.waitForTimeout(1500);
    pruefe(await tafelAuf(), `${name}: beim zweiten Besuch geht die Tier-Tafel nicht auf`);

    // --- Ein Kasten aus einer neueren Fassung bleibt unberührt -----------------
    const neuer = JSON.stringify({ v: 99, gewaehlt: "wohnhaus", haeuser: { wohnhaus: { stock: [{ id: "s1", art: "turm", zimmer: [{ raum: "sternwarte", dinge: [{ k: "d1", i: "teleskop", x: 100, y: 230 }] }] }] } } });
    await page.evaluate((kasten) => localStorage.setItem("lernapp.bau", kasten), neuer);
    await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
    await page.waitForTimeout(400);
    await page.mouse.click(5, 300);
    await page.waitForTimeout(2200);
    pruefe(await page.locator(".bauplatz-knopf").getAttribute("data-placed") === "0", `${name}: neuere Fassung: der Bauplatz zeigt leere Häuser`);
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    pruefe(await page.locator(".bau-neuer").isVisible().catch(() => false), `${name}: neuere Fassung: die Bauecke sagt nicht, dass sie sich erneuert`);
    pruefe(await page.evaluate(() => !window.LernappBusy()), `${name}: neuere Fassung: die Bauecke hält das Neuladen auf`);
    pruefe(await page.evaluate(() => localStorage.getItem("lernapp.bau")) === neuer, `${name}: neuere Fassung: der Kasten wird verändert`);
  } catch (fehler) {
    const zeilen = fehler.message.split("\n");
    const wo = zeilen.find((z) => /waiting for/.test(z))?.trim() || "";
    fehlt(`${name}: ${zeilen[0]}${wo ? ` (${wo})` : ""}`);
  }
  ausnahmen.forEach((a) => fehlt(`${name}: Ausnahme im Browser: ${a}`));
  await context.close();
}

if (!(await warteAufServer())) { console.error("Der Testserver startet nicht."); process.exit(2); }
const browser = await playwright.chromium.launch();
await pruefeGeraet(browser, "Tablet", { width: 1600, height: 1000 });
await pruefeGeraet(browser, "Handy", { width: 812, height: 375 });
await pruefeSonderfaelle(browser, "Tablet", { width: 1600, height: 1000 });
await browser.close();
halt();

if (befunde.length) {
  console.error(`Die Bauecke hat ${befunde.length} Befunde:`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Bauecke läuft: Bauplatz, Hauswahl, Einzug mit Feuerwerk, Zimmer mit eigenen Dingen, Tier-Tafel mit Hingehen, Umstellen, Rätsel, Lieferung, Bauen, Vorlesen per Tipp – auf Tablet und Handy.");
