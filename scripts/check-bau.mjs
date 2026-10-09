/*
 * Die Bauecke im Browser: hinein, einziehen, einrichten, umstellen, bauen.
 * ---------------------------------------------------------------------------
 * Was validate-bau.mjs an den Listen nachrechnet, zeigt sich hier am
 * Bildschirm – auf dem Tablet (1600 × 1000) und dem Handy im Querformat
 * (812 × 375). Geprüft wird als Gast (Firebase ist umgeleitet) und mit einer
 * Sprachausgabe, die sich merkt, was gesagt wird – von der Gerätestimme oder
 * als Aufnahme mit der Google-Stimme:
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
 *                 zwei Zimmer?" (Spital, Dorf und Büro haben ein Zimmer je
 *                 Stockwerk). Nach dem Neuladen ist alles da.
 *   Vorlesen aus  Mit ausgeschaltetem Vorlesen bleibt die Bauecke still.
 *   Unterwegs     Später zieht ein zweites Tier ein – mit Feuerwerk. Ein Tier
 *                 bei der Arbeit: "Hingehen" führt ins richtige Haus.
 *   Traumjob      Hat ein Bewohner seinen Traumjob, zeigt die Wohnung es von
 *                 aussen (Rahmen und Schild, Stufe 1 bis 3). Oben in einem
 *                 Arbeitszimmer stehen nur, wer dort den Traumjob hat oder
 *                 sich das Zimmer wünscht – ohne die Sterne der Wohnung.
 *   Nach vorne    «Nach vorne» und «Nach hinten» wirken auch, wenn zwei Dinge
 *                 verschieden tief stehen oder eines höher ist als das Zimmer.
 *   KiddyDome     Mit nur einem freien Stockwerk sagt die Wahl, dass er zwei
 *                 braucht, und bietet an, eines dazuzubauen; dann steht er über
 *                 zwei Stockwerke (ohne Decke dazwischen), im Zoom doppelt so
 *                 hoch, was an der Decke hängt, hängt ganz oben. Er wandert
 *                 beim Umstellen als Ganzes, und ein Tier aus dem Kinderzimmer
 *                 ist dort zu Besuch.
 *   Bewohner      Der Knopf links (im Haus und im Zimmer, das ihm Platz lässt)
 *                 öffnet alle Bewohner: je Wohnung die Tiere mit Sternen,
 *                 Traumjob (golden, wenn geschafft) und Wünschen. Ein Tipp
 *                 öffnet die gewohnte Tafel, die zurück zur Übersicht führt.
 *   Sterne        Offene Sterne sind hohl; wer alle hat, ist in der Übersicht
 *                 golden, hat auf der Tafel eine grosse goldene Kachel und am
 *                 Lift eine goldene Reihe. Das Buch steht unten. Kommt der
 *                 letzte Stern, erscheint ein goldenes Band und wieder weg.
 *   Leiter        Links unter den Bewohnern zählt die Sternenleiter alle Sterne
 *                 des Dorfs; ihre Stufen zeigen, was schon da ist und was als
 *                 Nächstes kommt. Eine neue Stufe bringt ein Band, eine Ansage
 *                 und Neues ins Bild. Um eine Wohnung, in der alle alle Sterne
 *                 haben, glitzert ein goldener Rahmen (im Zoom glänzt das
 *                 Zimmer), und über jedem Tier mit allen Sternen eine Krone.
 *   Blitzzug      Angetippt bringt er eine Palette, und der nächste kommt in
 *                 einer halben Stunde; verpasst kommt er nach ein paar Minuten.
 *   Glücksstern   Im Haus wie im Zimmer: angetippt eine Palette, dann erst in
 *                 einer halben Stunde wieder.
 *   Blasen        Eine Sprechblase ist niedriger als ihr Tier (halb so gross).
 *   Ansicht       Oben Sterne nur beim Wohnhaus. Unten links statt der
 *                 Nachbar-Häuser der Ansicht-Knopf: ein hohes Haus ganz auf
 *                 einem Bildschirm (Zimmer öffnen geht auch so) und zurück.
 *                 Zwei Finger zoomen bis zum ganzen Haus und zurück; danach
 *                 zieht ein Finger wieder. Der Lieferzug fährt auf einer
 *                 eigenen Ebene, und das Haus wird dabei nicht neu gezeichnet.
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

// Eine Sprachausgabe, die gleich fertig ist und sich merkt, was zu hören war:
// ein Satz zählt erst, wenn er zu Ende gesprochen ist – was vorher abgebrochen
// wird (cancel), war nicht zu hören. Ebenso die Aufnahmen mit der
// Google-Stimme (bau-stimme.js): Ihr Satz zählt, wenn sie zu Ende gespielt
// hat, nicht wenn sie vorher angehalten wurde; __gespielt merkt sich die
// Dateien, die angefangen haben.
function stimmeErsatz() {
  window.__gesagt = [];
  window.__gespielt = [];
  HTMLMediaElement.prototype.play = function play() {
    const quelle = String(this.src);
    const dateien = window.LernappStimmeDateien || {};
    const text = Object.keys(dateien).find((t) => quelle.endsWith(`/${dateien[t]}`));
    if (text) window.__gespielt.push(quelle);
    const lauf = (this.__lauf = (this.__lauf || 0) + 1);
    setTimeout(() => {
      if (this.__lauf !== lauf || String(this.src) !== quelle) return;
      if (text) window.__gesagt.push(text);
      this.dispatchEvent(new Event("ended"));
    }, 5);
    return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function pause() { this.__lauf = (this.__lauf || 0) + 1; };
  let abbruch = 0;
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [],
    speak(aeusserung) {
      const meins = abbruch;
      setTimeout(() => {
        if (meins !== abbruch) return;
        window.__gesagt.push(String(aeusserung.text));
        // Spricht die Bauecke selbst mit der Gerätestimme, fehlt eine Aufnahme.
        if (document.querySelector('.train-stage[data-view="bau"]')) window.__geraetSagt?.(String(aeusserung.text));
        aeusserung.dispatchEvent(new Event("end"));
      }, 5);
    },
    cancel() { abbruch += 1; }, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
}

function ueberlappen(a, b) {
  return a && b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

// Was die Bauecke mit der Gerätestimme sagte statt als Aufnahme.
const geraetSaetze = new Map();

async function neueSeite(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 900 });
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  await context.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await context.exposeBinding("__geraetSagt", (_quelle, text) => { if (!geraetSaetze.has(text)) geraetSaetze.set(text, viewport.width); });
  await context.addInitScript(stimmeErsatz);
  // Blitzzug und Glücksstern kommen nur, wenn ein Test sie ruft; die
  // Sternenleiter ist schon ganz oben, damit keine Feier dazwischenkommt.
  // Ein Test, der sie braucht, setzt den Schlüssel selbst.
  await context.addInitScript(() => {
    try {
      if (!localStorage.getItem("lernapp.bau.ueberraschung")) localStorage.setItem("lernapp.bau.ueberraschung", JSON.stringify({ "": { zug: Date.now() + 864e5, stern: Date.now() + 864e5, rekord: 999 } }));
    } catch { /* privater Modus */ }
  });
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
    pruefe(await page.evaluate(() => window.__gespielt.some((q) => q.includes("/stimme/google/"))), `${name}: die Hauswahl spielt keine Aufnahme mit der Google-Stimme (bau-stimme.js)`);
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
    // Zuerst kommen die Figuren aus den Büchern – mit ihrem Buch angesagt.
    pruefe(/aus dem Buch «/.test(gesagt), `${name}: das erste Tier ist keine Figur aus den Büchern, oder ihr Buch wird nicht genannt`);

    // --- Das Zimmer -----------------------------------------------------------
    // Die Tiere laufen im Zimmer herum. Steht eines gerade vor dem Ding, das
    // angetippt oder gezogen wird, nähme es den Tipp – für die Prüfung der
    // Dinge lassen sie ihn durch.
    await page.addStyleTag({ content: ".bau-zimmeransicht .bau-tier { pointer-events: none !important; }" });
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
    // Die Erklärung kann in Stücken kommen: Sätze mit Aufnahme, dazwischen die Gerätestimme.
    const vorKueche = await page.evaluate(() => window.__gesagt.length);
    await page.locator(".bau-wahl .bau-wahl-feld", { hasText: "Küche" }).first().click();
    pruefe(await bis(page, (n) => window.__gesagt.slice(n).join(" ").includes("In der Küche wird gekocht"), vorKueche, 2000), `${name}: die Küche wird nicht erklärt`);
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
    pruefe(await page.locator('.bau-raum[data-stock="0"]').count() === 1, `${name}: im Spital hat ein Stockwerk nicht genau ein Zimmer`);
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
      S.waehleRaum("spital", 0, 0, "radiologie");
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

    // --- Traumjob: von aussen am Stockwerk, oben im Zimmer ---------------------
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const S = window.LernappBauStand;
      S.aendereStock("wohnhaus", 0, (st) => st.tiere.forEach((t, k) => { t.traum = k === 0 ? "zentrum:bibliothek" : "spital:augen"; t.b = ["fremd:spital:augen", "fremd:zentrum:bibliothek"]; }));
      S.speichern(true);
    });
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.locator('.bau-tab[data-haus="wohnhaus"]').click();
    await page.waitForTimeout(900);
    pruefe(await page.locator('.bau-traummarke[data-stock="0"][data-stufe="1"]').count() === 1, `${name}: die Wohnung zeigt von aussen nicht, dass eines den Traumjob hat`);
    await page.locator('.bau-tab[data-haus="zentrum"]').click();
    await page.waitForTimeout(900);
    const vorZimmer = await page.evaluate(() => window.__gesagt.length);
    await tippe(page, '.bau-raum[data-stock="0"]');
    await page.waitForTimeout(1600);
    const kopf = await page.locator(".bau-zimmertier").evaluateAll((b) => b.map((x) => ({ traum: x.classList.contains("is-traum"), stern: Boolean(x.querySelector(".bau-stern.is-blau")), reihe: Boolean(x.querySelector(".bau-sternreihe")) })));
    pruefe(kopf.length === 2 && kopf[0].traum && !kopf[1].traum && kopf[1].stern && !kopf.some((k) => k.reihe), `${name}: oben in der Bibliothek stehen nicht nur, wer dort den Traumjob hat oder sie sich wünscht (${JSON.stringify(kopf)})`);
    pruefe(await bis(page, (n) => window.__gesagt.slice(n).join(" ").includes("hier den Traumjob"), vorZimmer, 2000), `${name}: das Zimmer sagt nicht, wer hier den Traumjob hat`);
    await page.locator(".stage-back").click();
    await page.waitForTimeout(1000);

    // --- Wieder hinein: Zimmer und Tafel gehen auch beim zweiten Mal auf -------
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.locator('.bau-tab[data-haus="wohnhaus"]').click();
    await page.waitForTimeout(900);
    // Die Tiere laufen in der Wohnung herum; steht eines gerade in der Mitte,
    // nähme es den Tipp (und öffnete seine Tafel statt des Zimmers).
    await page.addStyleTag({ content: ".bau-welt .bau-tier { pointer-events: none !important; }" });
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

// Alle Bewohner: der Knopf links, im Haus und im Zimmer; je Wohnung die Tiere
// mit Sternen, Traumjob und Wünschen; ein Tipp öffnet die Tafel, und von dort
// geht es zurück in die Übersicht.
async function pruefeBewohner(browser, name, viewport) {
  const { context, page, ausnahmen } = await neueSeite(browser, viewport);
  try {
    await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
    const erwartet = await page.evaluate(() => {
      const S = window.LernappBauStand;
      S.setzeGewaehlt("wohnhaus");
      S.merkeGezeigt();
      S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
      S.waehleRaum("wohnhaus", 1, 0, "schlafzimmer");
      // Mit dem Zimmer zieht das erste Tier ein; dazu im Erdgeschoss zwei, im 1. Stock eines.
      [[0, 2], [1, 1]].forEach(([i, n]) => {
        for (let k = 0; k < n; k += 1) { S.aendereStock("wohnhaus", i, (st) => { st.zuzug = 0; }); S.ziehtEin("wohnhaus", i); }
        // Seit gestern da und alle schon ausgepackt; danach zieht niemand mehr ein.
        S.aendereStock("wohnhaus", i, (st) => { st.tiere.forEach((t) => { t.seit = Date.now() - 86400000; }); st.zuzug = Date.now() + 86400000; });
      });
      // Das erste Tier bekommt seinen Traumjob: in der Bibliothek im Dorf.
      S.aendereStock("wohnhaus", 0, (st) => { st.tiere[0].traum = "zentrum:bibliothek"; });
      S.waehleRaum("zentrum", 0, 0, "bibliothek");
      // Das zweite Tier hat alle Sterne; dem ersten fehlt nur noch ein Ball.
      const fam = window.LernappBauKatalog.FARBE[S.zimmer("wohnhaus", 0, 0).wand].familie;
      S.aendereStock("wohnhaus", 0, (st) => {
        st.tiere.forEach((t) => { t.wAt = Date.now(); });
        Object.assign(st.tiere[0], { w: [`farbe:${fam}`, "ding:ball"], g: ["raum:kinderzimmer"], b: ["fremd:zentrum:bibliothek"] });
        Object.assign(st.tiere[1], { w: [`farbe:${fam}`], g: ["raum:kinderzimmer"], b: ["fremd:zentrum:bibliothek"] });
      });
      S.speichern(true);
      const alle = S.alleTiere();
      return {
        n: alle.length, hatTraum: S.hatTraumjob(alle[0].tier.seed), traumjobs: alle.filter((e) => S.hatTraumjob(e.tier.seed)).length, erstes: alle[0].tier.n, zweites: alle[1].tier.n,
        sterne: alle.slice(0, 2).map((e) => `${S.sterne(e.tier.seed).anzahl}/${S.sterne(e.tier.seed).total}`).join(" "), zweitesWuensche: S.wuensche(alle[1].tier.seed).length,
        erfuellt: alle.reduce((n, e) => n + S.sterne(e.tier.seed).anzahl, 0), wuensche: alle.reduce((n, e) => n + S.wuensche(e.tier.seed).length, 0),
      };
    });
    pruefe(erwartet.n === 5 && erwartet.hatTraum && erwartet.sterne === "3/4 3/3", `${name}: Bewohner: der Test hat nicht fünf Tiere mit einem Traumjob und den Sternen 3/4 und 3/3 (${erwartet.n}, ${erwartet.sterne})`);
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1600);
    // Der Knopf: links, ganz im Bild, neben den anderen, mit der Zahl.
    const knopf = await page.locator(".bau-bewohnerknopf").boundingBox();
    pruefe(knopf && knopf.x < 40 && knopf.y >= 0 && knopf.y + knopf.height <= viewport.height && knopf.width >= 60, `${name}: Bewohner: der Knopf steht nicht links im Bild`);
    for (const andere of [".stage-back", ".bau-ansichtknopf", ".bau-umschalter", ".tts-toggle"]) {
      const box = await page.locator(andere).first().boundingBox().catch(() => null);
      pruefe(!ueberlappen(knopf, box), `${name}: Bewohner: der Knopf deckt ${andere} zu`);
    }
    pruefe((await page.locator(".bau-bewohnerknopf-zahl").textContent().catch(() => "")) === "5", `${name}: Bewohner: am Knopf steht nicht, wie viele Tiere da sind`);
    await tippe(page, ".bau-bewohnerknopf");
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-uebersicht:not([hidden])").count() === 1, `${name}: Bewohner: die Übersicht geht nicht auf`);
    const karte = await page.locator(".bau-uebersicht-karte").boundingBox();
    pruefe(karte && karte.y >= 50 && karte.y + karte.height <= viewport.height, `${name}: Bewohner: die Übersicht liegt nicht ganz im Bild`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("5 Tiere wohnen im Wohnhaus"), `${name}: Bewohner: die Übersicht sagt nicht, wie viele hier wohnen`);
    const inhalt = await page.evaluate(() => {
      const karten = [...document.querySelectorAll(".bau-uebersicht .bau-bewohner")];
      return {
        karten: karten.length,
        wohnungen: [...document.querySelectorAll(".bau-uebersicht-stock")].map((h) => h.textContent.trim()),
        sterne: karten.every((k) => k.querySelector(".bau-bewohner-sterne .bau-stern")),
        traum: karten.every((k) => /Traumjob:/.test(k.querySelector(".bau-bewohner-traum")?.textContent || "")),
        wuensche: document.querySelectorAll(".bau-uebersicht .bau-bewohner-wunsch").length,
        erfuellt: document.querySelectorAll(".bau-uebersicht .bau-bewohner-wunsch.is-erfuellt").length,
        goldig: document.querySelectorAll(".bau-uebersicht .bau-bewohner.is-traum").length,
        alle: karten.map((k, i) => (k.classList.contains("is-alle") && /Alle Sterne/.test(k.querySelector(".bau-bewohner-alle")?.textContent || "") ? i : -1)).filter((i) => i >= 0),
        hohl: karten[0]?.querySelectorAll(".bau-stern:not(.is-voll)").length,
      };
    });
    pruefe(inhalt.karten === 5, `${name}: Bewohner: die Übersicht zeigt ${inhalt.karten} statt 5 Tiere`);
    pruefe(inhalt.wohnungen.length === 2 && /Erdgeschoss.*Kinderzimmer/.test(inhalt.wohnungen[0]) && /1\. Stock.*Schlafzimmer/.test(inhalt.wohnungen[1]), `${name}: Bewohner: die Wohnungen stimmen nicht (${inhalt.wohnungen.join(", ")})`);
    pruefe(inhalt.sterne && inhalt.traum, `${name}: Bewohner: bei einem Tier fehlen die Sterne oder der Traumjob`);
    pruefe(inhalt.wuensche === erwartet.wuensche && inhalt.erfuellt === erwartet.erfuellt, `${name}: Bewohner: die Wünsche stimmen nicht (${inhalt.wuensche}/${inhalt.erfuellt} statt ${erwartet.wuensche}/${erwartet.erfuellt})`);
    pruefe(inhalt.goldig === erwartet.traumjobs, `${name}: Bewohner: ${inhalt.goldig} statt ${erwartet.traumjobs} Traumjobs golden markiert`);
    pruefe(inhalt.alle.join() === "1" && inhalt.hohl === 1, `${name}: Bewohner: «Alle Sterne» ist nicht beim zweiten Tier, oder der offene Stern ist nicht hohl (${inhalt.alle.join()}, ${inhalt.hohl})`);
    // Ein Tipp aufs zweite Tier: seine Tafel, mit dem Weg zurück.
    await page.locator(".bau-uebersicht .bau-bewohner").nth(1).click();
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-uebersicht:not([hidden])").count() === 0 && await page.locator(".bau-tafel:not([hidden])").count() === 1, `${name}: Bewohner: ein Tipp aufs Tier öffnet seine Tafel nicht`);
    pruefe((await page.locator(".bau-tafel-wer h2").textContent().catch(() => "")).trim().startsWith(erwartet.zweites), `${name}: Bewohner: die Tafel zeigt nicht ${erwartet.zweites}`);
    pruefe(await page.locator(".bau-tafel .bau-wunsch").count() === erwartet.zweitesWuensche, `${name}: Bewohner: die Tafel aus der Übersicht ist nicht die gewohnte`);
    pruefe(await page.locator('.bau-tafel-zu[aria-label="Zurück zu allen Bewohnern"]').count() === 1, `${name}: Bewohner: die Tafel führt nicht zurück zur Übersicht`);
    // Die Sterne als grosse Kachel – golden bei allen Sternen; das Buch ganz unten.
    const kachel = await page.evaluate(() => {
      const k = document.querySelector(".bau-tafel:not([hidden]) .bau-sternkachel");
      const karte = document.querySelector(".bau-tafel:not([hidden]) .bau-tafel-karte");
      const r = k?.getBoundingClientRect();
      return {
        alle: Boolean(k?.classList.contains("is-alle")), voll: k?.querySelectorAll(".bau-stern-gross.is-voll").length || 0, text: k?.textContent || "",
        gross: r ? Math.round(r.height) : 0,
        unten: karte?.lastElementChild?.classList.contains("bau-tafel-fuss") && Boolean(karte.lastElementChild.querySelector(".bau-hinaus")),
        buchOben: karte ? karte.querySelectorAll(":scope > .bau-tafel-buch").length : -1,
      };
    });
    pruefe(kachel.alle && kachel.voll === 3 && /Alle Sterne!/.test(kachel.text) && kachel.gross >= 40, `${name}: Bewohner: die Sterne-Kachel zeigt «Alle Sterne» nicht gross und golden (${JSON.stringify(kachel)})`);
    pruefe(kachel.unten && kachel.buchOben === 0, `${name}: Bewohner: das Buch und «Ausziehen lassen» stehen nicht ganz unten`);
    await page.locator(".bau-tafel-zu").click();
    await page.waitForTimeout(400);
    pruefe(await page.locator(".bau-uebersicht:not([hidden])").count() === 1 && await page.locator(".bau-tafel:not([hidden])").count() === 0, `${name}: Bewohner: nach der Tafel ist die Übersicht nicht wieder da`);
    await page.locator(".bau-uebersicht-zu").click();
    await page.waitForTimeout(300);
    pruefe(await page.locator(".bau-uebersicht:not([hidden])").count() === 0, `${name}: Bewohner: die Übersicht geht nicht zu`);
    // Direkt im Haus angetippt, ist die Tafel wie immer: das Kreuz schliesst sie.
    await tippe(page, '.bau-tafelknopf[data-stock="0"]');
    await page.waitForTimeout(400);
    pruefe(await page.locator('.bau-tafel-zu[aria-label="Schliessen"]').count() === 1, `${name}: Bewohner: die Tafel aus dem Haus hat kein Kreuz`);
    await page.locator(".bau-tafel-zu").click();
    await page.waitForTimeout(300);
    pruefe(await page.locator(".bau-tafel:not([hidden]), .bau-uebersicht:not([hidden])").count() === 0, `${name}: Bewohner: das Kreuz der Tafel öffnet die Übersicht`);
    // Am Lift liegt die Reihe des Tiers mit allen Sternen auf Gold.
    pruefe(await page.locator('.bau-tafelknopf[data-stock="0"] .bau-sternzeile-gold').count() === 1, `${name}: Bewohner: am Lift ist die Reihe mit allen Sternen nicht golden`);
    // Der letzte Stern (ein Ball fürs erste Tier): ein goldenes Band, und die Bauecke sagt es.
    await page.evaluate(() => window.LernappBauStand.aendereZimmer("wohnhaus", 0, 0, (z) => { z.dinge.push({ k: "ballfest", i: "ball", x: 300, y: 234, c: "", f: 0, s: 1 }); }));
    pruefe(await bis(page, (n) => (document.querySelector(".bau-sternband")?.textContent || "").includes(n), erwartet.erstes, 4000), `${name}: Bewohner: beim letzten Stern kommt kein goldenes Band`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes(`${erwartet.erstes} hat alle Sterne`), `${name}: Bewohner: die Bauecke sagt nicht, dass ${erwartet.erstes} alle Sterne hat`);
    pruefe(await bis(page, () => !document.querySelector(".bau-sternband"), null, 7000), `${name}: Bewohner: das goldene Band geht nicht wieder weg`);
    // Beim Einrichten: der Knopf ist da, und das Zimmer lässt ihm Platz.
    await page.addStyleTag({ content: ".bau-welt .bau-tier { pointer-events: none !important; }" });
    await tippe(page, '.bau-raum[data-stock="0"]');
    pruefe(await bis(page, () => document.querySelector(".bauecke.ist-zimmer .bau-zimmer-svg"), null, 5000), `${name}: Bewohner: das Zimmer geht nicht auf`);
    await page.waitForTimeout(900);
    const lage = await page.evaluate(() => {
      const k = document.querySelector(".bau-bewohnerknopf").getBoundingClientRect();
      const z = document.querySelector(".bau-zimmer-svg").getBoundingClientRect();
      return { sichtbar: k.width > 0 && getComputedStyle(document.querySelector(".bau-bewohnerknopf")).visibility === "visible", frei: k.right <= z.left || k.bottom <= z.top };
    });
    pruefe(lage.sichtbar && lage.frei, `${name}: Bewohner: im Zimmer fehlt der Knopf oder er deckt das Zimmer zu`);
    await tippe(page, ".bau-bewohnerknopf");
    await page.waitForTimeout(500);
    pruefe(await page.locator(".bau-uebersicht:not([hidden]) .bau-bewohner").count() === 5, `${name}: Bewohner: im Zimmer geht die Übersicht nicht auf`);
    // Zurück (der Knopf der Bühne) schliesst zuerst die Übersicht, dann das Zimmer.
    await page.evaluate(() => window.LernappBau.zurueck());
    await page.waitForTimeout(300);
    pruefe(await page.locator(".bau-uebersicht:not([hidden])").count() === 0 && await page.locator(".bauecke.ist-zimmer").count() === 1, `${name}: Bewohner: Zurück schliesst nicht zuerst die Übersicht`);
  } catch (fehler) {
    const zeilen = fehler.message.split("\n");
    const wo = zeilen.find((z) => /waiting for/.test(z))?.trim() || "";
    fehlt(`${name}: ${zeilen[0]}${wo ? ` (${wo})` : ""}`);
  }
  ausnahmen.forEach((a) => fehlt(`${name}: Ausnahme im Browser: ${a}`));
  await context.close();
}

// Blitzzug, Glücksstern, Sternenleiter, Krone und Sternenrahmen; dazu die
// halb so grossen Sprechblasen.
async function pruefeUeberraschungen(browser, name, viewport) {
  const { context, page, ausnahmen } = await neueSeite(browser, viewport);
  try {
    await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
    const vorher = await page.evaluate(() => {
      const S = window.LernappBauStand;
      S.setzeGewaehlt("wohnhaus");
      S.merkeGezeigt();
      S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
      S.waehleRaum("wohnhaus", 1, 0, "schlafzimmer");
      [[0, 2], [1, 1]].forEach(([i, n]) => {
        for (let k = 0; k < n; k += 1) { S.aendereStock("wohnhaus", i, (st) => { st.zuzug = 0; }); S.ziehtEin("wohnhaus", i); }
        // Eben eingezogen: Die erste Viertelstunde sind alle daheim (bau-stand.js, aufenthalt).
        S.aendereStock("wohnhaus", i, (st) => { st.tiere.forEach((t) => { t.seit = Date.now(); t.wAt = Date.now(); }); st.zuzug = Date.now() + 86400000; });
      });
      S.waehleRaum("zentrum", 0, 0, "bibliothek");
      // Im Erdgeschoss haben alle drei alle Sterne (je drei), im 1. Stock
      // wünschen sich beide einen Ball und ein Bett: zusammen 9 Sterne.
      const fam = window.LernappBauKatalog.FARBE[S.zimmer("wohnhaus", 0, 0).wand].familie;
      S.aendereStock("wohnhaus", 0, (st) => st.tiere.forEach((t) => Object.assign(t, { w: [`farbe:${fam}`], g: ["raum:kinderzimmer"], b: ["fremd:zentrum:bibliothek"] })));
      S.aendereStock("wohnhaus", 1, (st) => st.tiere.forEach((t) => Object.assign(t, { w: ["ding:ball", "ding:bett"], g: [], b: [] })));
      S.speichern(true);
      // Überraschungen erst auf Abruf; noch keine Stufe gefeiert.
      localStorage.setItem("lernapp.bau.ueberraschung", JSON.stringify({ [S.besitzer()]: { zug: Date.now() + 3600000, stern: Date.now() + 3600000, rekord: 0 } }));
      return { sterne: S.sternenleiter().jetzt, erste: S.stock("wohnhaus", 0).tiere.map((t) => t.seed), zweite: S.stock("wohnhaus", 1).tiere.map((t) => t.seed) };
    });
    pruefe(vorher.sterne === 9, `${name}: Überraschungen: der Test beginnt nicht mit 9 Sternen im Dorf (${vorher.sterne})`);
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1600);
    // Der Sternenzähler: links unter den Bewohnern, mit Zahl und Ziel.
    const knopf = await page.locator(".bau-leiterknopf").boundingBox();
    const bewohner = await page.locator(".bau-bewohnerknopf").boundingBox();
    pruefe(knopf && bewohner && knopf.x < 40 && knopf.y >= bewohner.y + bewohner.height && knopf.y + knopf.height <= viewport.height, `${name}: Sternenleiter: der Zähler steht nicht links unter den Bewohnern`);
    for (const andere of [".stage-back", ".bau-ansichtknopf", ".bau-umschalter", ".bau-bewohnerknopf"]) {
      const box = await page.locator(andere).first().boundingBox().catch(() => null);
      pruefe(!ueberlappen(knopf, box), `${name}: Sternenleiter: der Zähler deckt ${andere} zu`);
    }
    const zaehler = await page.locator(".bau-leiterknopf").textContent();
    pruefe(/9/.test(zaehler) && /bis 10/.test(zaehler), `${name}: Sternenleiter: der Zähler zeigt nicht 9 Sterne bis 10 (${zaehler})`);
    // Das Dorf hat die erste Stufe (5 Sterne): Blumen an der Strasse.
    pruefe(await page.locator(".bau-haus-svg .bau-schmuck").count() >= 1, `${name}: Sternenleiter: die Blumen der ersten Stufe fehlen`);
    // Alle im Erdgeschoss haben alle Sterne: der goldene Rahmen, nur dort.
    pruefe(await page.locator('.bau-sternrahmen[data-stock="0"]').count() === 1 && await page.locator('.bau-sternrahmen[data-stock="1"]').count() === 0, `${name}: Sternenrahmen: der goldene Rahmen ist nicht (nur) um die Wohnung mit allen Sternen`);
    // Er glitzert: die Sterne leuchten abwechselnd (gut zwei Sekunden lang beobachtet).
    const glanz = await page.evaluate(async () => {
      const gesehen = new Set();
      for (let n = 0; n < 22; n += 1) {
        gesehen.add(document.querySelector(".bau-sternrahmen .bau-glitzer-a")?.getAttribute("opacity") || "");
        await new Promise((ok) => setTimeout(ok, 100));
      }
      return [...gesehen];
    });
    pruefe(glanz.filter(Boolean).length >= 2, `${name}: Sternenrahmen: die Sterne glitzern nicht (${glanz.join(", ")})`);
    // Die Krone: über jedem Tier mit allen Sternen, bei den anderen nicht.
    const kronen = await page.evaluate(({ erste, zweite }) => [...document.querySelectorAll(".bau-haus-svg .bau-tier")].map((g) => ({
      seed: g.getAttribute("data-seed"), sichtbar: g.querySelector(".bau-krone")?.style.display !== "none",
    })).map((t) => ({ ...t, soll: erste.includes(t.seed) ? true : zweite.includes(t.seed) ? false : null })), vorher);
    pruefe(kronen.some((t) => t.soll === true) && kronen.every((t) => t.soll === null || t.sichtbar === t.soll), `${name}: Krone: nicht genau die Tiere mit allen Sternen tragen eine Krone (${JSON.stringify(kronen)})`);
    // Die Leiter: acht Stufen, die erste geschafft, die zweite als nächste.
    await tippe(page, ".bau-leiterknopf");
    await page.waitForTimeout(600);
    const leiter = await page.evaluate(() => ({
      offen: Boolean(document.querySelector(".bau-leiter:not([hidden])")),
      stufen: document.querySelectorAll(".bau-leiter .bau-leiter-stufe").length,
      erreicht: document.querySelectorAll(".bau-leiter .bau-leiter-stufe.is-erreicht").length,
      naechste: document.querySelector(".bau-leiter .bau-leiter-stufe.is-naechste .bau-leiter-text b")?.textContent || "",
      bilder: [...document.querySelectorAll(".bau-leiter .bau-leiter-bild svg")].filter((s) => s.innerHTML.length > 50).length,
    }));
    pruefe(leiter.offen && leiter.stufen === 8 && leiter.erreicht === 1 && leiter.naechste === "Wimpelketten" && leiter.bilder === 8, `${name}: Sternenleiter: die Stufen stimmen nicht (${JSON.stringify(leiter)})`);
    const karte = await page.locator(".bau-leiter .bau-uebersicht-karte").boundingBox();
    pruefe(karte && karte.y >= 50 && karte.y + karte.height <= viewport.height, `${name}: Sternenleiter: die Leiter liegt nicht ganz im Bild`);
    pruefe(await bis(page, () => window.__gesagt.join(" ").includes("Alle Tiere zusammen haben 9 Sterne. Noch ein Stern bis zur nächsten Stufe: Wimpelketten."), null, 2000), `${name}: Sternenleiter: die Bauecke sagt nicht, wie viele Sterne noch fehlen`);
    await page.locator(".bau-leiter .bau-uebersicht-zu").click();
    await page.waitForTimeout(300);
    pruefe(await page.locator(".bau-leiter:not([hidden])").count() === 0, `${name}: Sternenleiter: das Kreuz schliesst die Leiter nicht`);
    // Ein Ball im 1. Stock: zwei Sterne mehr, die zweite Stufe – ein Band, die Ansage, die Wimpel.
    const schmuckVorher = await page.locator(".bau-haus-svg .bau-schmuck").count();
    await page.evaluate(() => window.LernappBauStand.aendereZimmer("wohnhaus", 1, 0, (z) => { z.dinge.push({ k: "ballfest", i: "ball", x: 300, y: 234, c: "", f: 0, s: 1 }); }));
    pruefe(await bis(page, () => /Wimpelketten/.test(document.querySelector(".bau-leiterband")?.textContent || ""), null, 9000), `${name}: Sternenleiter: bei der neuen Stufe kommt kein Band`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Das Dorf hat 10 Sterne"), `${name}: Sternenleiter: die Bauecke sagt die neue Stufe nicht an`);
    pruefe(await page.locator(".bau-haus-svg .bau-schmuck").count() > schmuckVorher, `${name}: Sternenleiter: die Wimpel der neuen Stufe fehlen im Bild`);
    pruefe(/11/.test(await page.locator(".bau-leiterknopf").textContent()), `${name}: Sternenleiter: der Zähler zählt die neuen Sterne nicht`);
    pruefe(await bis(page, () => !document.querySelector(".bau-leiterband"), null, 8000), `${name}: Sternenleiter: das Band geht nicht wieder weg`);

    // Der Blitzzug: gefangen gibt er eine Palette.
    const paletten = () => page.evaluate(() => window.LernappBauStand.paletten());
    const p0 = await paletten();
    pruefe(await page.evaluate(() => window.LernappBau.blitzzug()) === true, `${name}: Blitzzug: er fährt nicht los`);
    pruefe(await bis(page, () => document.querySelector(".bau-blitz"), null, 2000), `${name}: Blitzzug: er ist nicht zu sehen`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Achtung, der Blitzzug!"), `${name}: Blitzzug: die Bauecke kündigt ihn nicht an`);
    await page.waitForTimeout(1500);
    const zug = await page.locator(".bau-blitz .bau-blitz-griff").boundingBox();
    pruefe(zug && zug.x + zug.width > 0 && zug.x < viewport.width, `${name}: Blitzzug: er fährt nicht durchs Bild (${JSON.stringify(zug)})`);
    if (zug) {
      const x = Math.max(8, Math.min(viewport.width - 8, zug.x + zug.width / 2));
      await page.mouse.click(x, zug.y + zug.height * 0.6);
    }
    pruefe(await bis(page, (n) => window.LernappBauStand.paletten() === n + 1, p0, 3000), `${name}: Blitzzug: angetippt gibt er keine Palette`);
    pruefe(await bis(page, () => window.__gesagt.join(" | ").includes("Gefangen!"), null, 2000), `${name}: Blitzzug: die Bauecke freut sich nicht`);
    const naechsterZug = await page.evaluate(() => window.LernappBauStand.ueberraschung().zug - Date.now());
    pruefe(naechsterZug > 25 * 60000 && naechsterZug <= 30 * 60000, `${name}: Blitzzug: der nächste kommt nicht in einer halben Stunde (${Math.round(naechsterZug / 60000)} min)`);
    pruefe(await bis(page, () => !document.querySelector(".bau-blitz"), null, 7000), `${name}: Blitzzug: er fährt nicht weiter`);
    // Verpasst: keine Palette, und er kommt bald wieder.
    await page.evaluate(() => window.LernappBau.blitzzug());
    pruefe(await bis(page, () => !document.querySelector(".bau-blitz"), null, 8000), `${name}: Blitzzug: verpasst fährt er nicht weg`);
    pruefe(await paletten() === p0 + 1, `${name}: Blitzzug: verpasst gibt er trotzdem eine Palette`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Schade, der Blitzzug war zu schnell"), `${name}: Blitzzug: die Bauecke sagt nicht, dass er weg ist`);
    const baldWieder = await page.evaluate(() => window.LernappBauStand.ueberraschung().zug - Date.now());
    pruefe(baldWieder > 3 * 60000 && baldWieder <= 5 * 60000, `${name}: Blitzzug: verpasst kommt er nicht nach ein paar Minuten wieder (${Math.round(baldWieder / 60000)} min)`);

    // Der Glücksstern im Haus: angetippt gibt er eine Palette.
    await page.evaluate(() => window.LernappBau.gluecksstern({ haus: "wohnhaus", index: 0, slot: 0, x: 150, y: 150 }));
    pruefe(await bis(page, () => document.querySelector(".bau-haus-svg .bau-gluecksstern"), null, 2000), `${name}: Glücksstern: er ist im Haus nicht zu sehen`);
    pruefe(await bis(page, () => window.__gesagt.join(" | ").includes("Glücksstern versteckt"), null, 2000), `${name}: Glücksstern: die Bauecke verrät nicht, dass er sich versteckt hat`);
    const stern = await page.locator(".bau-haus-svg .bau-gluecksstern").boundingBox();
    pruefe(stern && stern.width >= 14 && stern.y > 0 && stern.y + stern.height < viewport.height, `${name}: Glücksstern: er ist nicht im Bild oder zu klein (${JSON.stringify(stern)})`);
    if (stern) await page.mouse.click(stern.x + stern.width / 2, stern.y + stern.height / 2);
    pruefe(await bis(page, (n) => window.LernappBauStand.paletten() === n + 2, p0, 3000), `${name}: Glücksstern: gefunden gibt er keine Palette`);
    pruefe(await bis(page, () => window.__gesagt.join(" | ").includes("Du hast den Glücksstern gefunden!"), null, 2000), `${name}: Glücksstern: die Bauecke freut sich nicht`);
    pruefe(await bis(page, () => !document.querySelector(".bau-gluecksstern"), null, 3000), `${name}: Glücksstern: er bleibt nach dem Finden da`);
    const naechsterStern = await page.evaluate(() => window.LernappBauStand.ueberraschung().stern - Date.now());
    pruefe(naechsterStern > 25 * 60000 && naechsterStern <= 30 * 60000, `${name}: Glücksstern: der nächste kommt nicht in einer halben Stunde`);

    // Im Zimmer: der Glücksstern auch hier, und eine Wohnung voller Sterne glänzt golden.
    await page.addStyleTag({ content: ".bau-welt .bau-tier { pointer-events: none !important; }" });
    await tippe(page, '.bau-raum[data-stock="0"]');
    pruefe(await bis(page, () => document.querySelector(".bauecke.ist-zimmer .bau-zimmer-svg"), null, 5000), `${name}: Glücksstern: das Zimmer geht nicht auf`);
    await page.waitForTimeout(900);
    pruefe(await page.locator(".bau-zimmer-svg.is-strahlt").count() === 1, `${name}: Sternenrahmen: das Zimmer mit allen Sternen glänzt nicht golden`);
    pruefe(await page.locator(".bau-zimmerbuehne .bau-krone").evaluateAll((k) => k.filter((n) => n.style.display !== "none").length) >= 1, `${name}: Krone: im Zimmer trägt niemand eine Krone`);
    await page.evaluate(() => window.LernappBau.gluecksstern({ haus: "wohnhaus", index: 0, slot: 0, x: 300, y: 130 }));
    pruefe(await bis(page, () => document.querySelector(".bau-zimmerbuehne .bau-gluecksstern"), null, 2000), `${name}: Glücksstern: er ist im Zimmer nicht zu sehen`);
    await tippe(page, ".bau-zimmerbuehne .bau-gluecksstern");
    pruefe(await bis(page, (n) => window.LernappBauStand.paletten() === n + 3, p0, 3000), `${name}: Glücksstern: im Zimmer gefunden gibt er keine Palette`);
    pruefe(await page.locator(".bau-zimmerbuehne .bau-gluecksstern").count() === 0 || await bis(page, () => !document.querySelector(".bau-zimmerbuehne .bau-gluecksstern"), null, 2000), `${name}: Glücksstern: er bleibt im Zimmer da`);
    // Die Sprechblasen sind halb so gross wie früher: niedriger als das Tier.
    await page.evaluate(() => window.LernappBau.zurueck());
    await page.waitForTimeout(1200);
    await tippe(page, '.bau-raum[data-stock="1"]');
    pruefe(await bis(page, () => document.querySelector(".bauecke.ist-zimmer .bau-zimmer-svg"), null, 5000), `${name}: Sprechblasen: das Zimmer geht nicht auf`);
    await page.waitForTimeout(900);
    // Der Dank für einen erfüllten Wunsch (das Bett aus der Schublade) kommt als Blase.
    const bett = page.locator(".bau-schublade .bau-ding-knopf.is-gewuenscht").first();
    await bett.scrollIntoViewIfNeeded();
    await bett.click();
    const blase = await page.evaluate(async () => {
      const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
      for (let n = 0; n < 30; n += 1) {
        const b = document.querySelector(".bau-zimmerbuehne .bau-blase");
        if (b) {
          const r = b.getBoundingClientRect();
          const t = b.closest(".bau-tier")?.querySelector(".bau-tier-dreh")?.getBoundingClientRect();
          return { blase: r.height, tier: t?.height || 0 };
        }
        await warte(100);
      }
      return null;
    });
    pruefe(blase && blase.tier > 0 && blase.blase < blase.tier, `${name}: Sprechblasen: eine Blase ist höher als ihr Tier (${JSON.stringify(blase)})`);
  } catch (fehler) {
    const zeilen = fehler.message.split("\n");
    const wo = zeilen.find((z) => /waiting for/.test(z))?.trim() || "";
    fehlt(`${name}: ${zeilen[0]}${wo ? ` (${wo})` : ""}`);
  }
  ausnahmen.forEach((a) => fehlt(`${name}: Ausnahme im Browser: ${a}`));
  await context.close();
}

// Oben die Sterne nur beim Wohnhaus; unten links statt der Nachbarn der
// Ansicht-Knopf (gross – ganzes Haus); zwei Finger zoomen; der Lieferzug fährt
// auf seiner eigenen Ebene, ohne dass das Haus neu gezeichnet wird.
async function pruefeAnsicht(browser, name, viewport) {
  const { context, page, ausnahmen } = await neueSeite(browser, viewport);
  try {
    await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
    // Ein Wohnhaus mit acht Stockwerken (mit offener Schranke gebaut), das auf
    // keinen Bildschirm ganz passt; eine Palette wartet auf den Lieferzug.
    await page.evaluate(() => {
      const S = window.LernappBauStand;
      window.LernappEntitlement.isFree = () => true;
      for (let n = 0; n < 6; n += 1) window.LernappReise.bauBonus();
      S.setzeGewaehlt("wohnhaus");
      S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
      S.waehleRaum("wohnhaus", 1, 0, "schlafzimmer");
      S.waehleRaum("wohnhaus", 2, 0, "kinderzimmer");
      for (let i = 3; i < 8; i += 1) { S.baueStockwerk("wohnhaus"); S.waehleArt("wohnhaus", i, "wohnung"); S.waehleRaum("wohnhaus", i, 0, i % 2 ? "schlafzimmer" : "kinderzimmer"); }
      S.haus("wohnhaus").stock.forEach((_, i) => S.aendereStock("wohnhaus", i, (st) => { st.tiere.forEach((t) => { t.seit = Date.now(); }); st.zuzug = Date.now() + 86400000; }));
      S.speichern(true);
      localStorage.setItem("lernapp.bau.gezeigt", JSON.stringify({ [S.besitzer()]: S.verdient() - 1 }));
    });
    // Was während der Lieferung geschieht: ob der Zug eine eigene Ebene hat
    // und ob das Haus-SVG dabei ersetzt wird.
    // Die Änderungen der Reihe nach: Kommt ein neues Haus-SVG, während ein Zug
    // auf seiner Ebene fährt?
    await context.addInitScript(() => {
      window.__lieferung = { ebene: 0, hausNeu: 0, faehrt: false };
      new MutationObserver((liste) => {
        for (const m of liste) {
          m.removedNodes.forEach((n) => { if (n.nodeType === 1 && n.classList.contains("bau-zugebene")) window.__lieferung.faehrt = false; });
          m.addedNodes.forEach((n) => {
            if (n.nodeType !== 1) return;
            if (n.classList.contains("bau-zugebene")) { window.__lieferung.ebene += 1; window.__lieferung.faehrt = true; }
            if (n.classList.contains("bau-haus-svg") && window.__lieferung.faehrt) window.__lieferung.hausNeu += 1;
          });
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    pruefe(await bis(page, () => window.__lieferung.ebene > 0, null, 6000), `${name}: Lieferzug: er fährt nicht auf einer eigenen Ebene`);
    pruefe(await bis(page, () => !document.querySelector(".bau-zugebene") && document.querySelector(".bau-naechster"), null, 9000), `${name}: Lieferzug: nach der Lieferung fehlt das Plus`);
    const lieferung = await page.evaluate(() => window.__lieferung);
    pruefe(lieferung.hausNeu === 0, `${name}: Lieferzug: während der Fahrt wurde das ganze Haus neu gezeichnet (${lieferung.hausNeu})`);
    await page.waitForTimeout(1200);

    // Oben: Sterne nur beim Wohnhaus.
    const tabs = await page.evaluate(() => [...document.querySelectorAll(".bau-tab")].map((t) => ({ haus: t.dataset.haus, sterne: Boolean(t.querySelector(".bau-tab-sterne")), label: t.getAttribute("aria-label") })));
    pruefe(tabs.length === 4 && tabs.every((t) => t.sterne === (t.haus === "wohnhaus")) && tabs.every((t) => /Sterne/.test(t.label) === (t.haus === "wohnhaus")), `${name}: Umschalter: Sterne nicht nur beim Wohnhaus (${JSON.stringify(tabs)})`);
    // Unten links der Ansicht-Knopf, keine Nachbar-Häuser mehr.
    pruefe(await page.locator(".bau-nachbar").count() === 0, `${name}: Ansicht: unten stehen noch die Nachbar-Häuser`);
    const knopf = await page.locator(".bau-ansichtknopf").boundingBox();
    pruefe(knopf && knopf.x < 40 && knopf.y + knopf.height > viewport.height - 40 && knopf.width >= 44, `${name}: Ansicht: der Knopf steht nicht unten links (${JSON.stringify(knopf)})`);
    for (const andere of [".bau-bewohnerknopf", ".bau-leiterknopf", ".stage-back"]) {
      const box = await page.locator(andere).first().boundingBox().catch(() => null);
      pruefe(!ueberlappen(knopf, box), `${name}: Ansicht: der Knopf deckt ${andere} zu`);
    }
    const kopf = viewport.height < 520 ? 64 : 84;
    const lage = () => page.evaluate(() => {
      const r = (sel) => document.querySelector(sel)?.getBoundingClientRect();
      const svg = r(".bau-haus-svg");
      return { svgH: Math.round(svg.height), dach: Math.round(r(".bau-dach").top), plus: Math.round(r(".bau-naechster")?.top ?? -1), erdgeschoss: Math.round(r('.bau-raum[data-stock="0"]').bottom), weit: document.querySelector(".bau-ansichtknopf").classList.contains("is-weit") };
    });
    const standard = await lage();
    pruefe(await page.evaluate(() => window.LernappBauStand.haus("wohnhaus").stock.length) === 8, `${name}: Ansicht: der Test hat kein Haus mit acht Stockwerken`);
    pruefe((standard.dach < kopf || standard.erdgeschoss > viewport.height) && !standard.weit, `${name}: Ansicht: das Haus mit acht Stockwerken passt schon gross ganz ins Bild (${JSON.stringify(standard)})`);
    // Ganzes Haus: vom Plus bis zum Erdgeschoss im Bild, unter der Kopfzeile.
    await tippe(page, ".bau-ansichtknopf");
    await page.waitForTimeout(900);
    const ganz = await lage();
    pruefe(ganz.weit && ganz.svgH < standard.svgH && ganz.plus >= kopf - 2 && ganz.dach >= kopf && ganz.erdgeschoss <= viewport.height, `${name}: Ansicht: das ganze Haus ist nicht auf einem Bildschirm (${JSON.stringify(ganz)})`);
    pruefe((await page.evaluate(() => window.__gesagt.join(" | "))).includes("Das ganze Haus."), `${name}: Ansicht: die Bauecke sagt die Ansicht nicht an`);
    // Auch klein lässt sich ein Zimmer öffnen; zurück bleibt das ganze Haus.
    await page.addStyleTag({ content: ".bau-welt .bau-tier { pointer-events: none !important; }" });
    {
      const r = await page.locator('.bau-raum[data-stock="2"]').boundingBox();
      await page.mouse.click(r.x + 12, r.y + 6);
    }
    pruefe(await bis(page, () => document.querySelector(".bauecke.ist-zimmer .bau-zimmer-svg"), null, 5000), `${name}: Ansicht: im ganzen Haus geht kein Zimmer auf`);
    await page.waitForTimeout(700);
    await page.evaluate(() => window.LernappBau.zurueck());
    await page.waitForTimeout(1400);
    pruefe((await lage()).weit, `${name}: Ansicht: nach dem Zimmer ist das ganze Haus wieder gross`);
    // Zurück zur grossen Ansicht.
    await tippe(page, ".bau-ansichtknopf");
    await page.waitForTimeout(900);
    const wieder = await lage();
    pruefe(!wieder.weit && Math.abs(wieder.svgH - standard.svgH) <= 2, `${name}: Ansicht: der Knopf führt nicht zurück zur grossen Ansicht (${JSON.stringify(wieder)})`);
    // Zwei Finger: zusammen weiter weg (bis zum ganzen Haus), auseinander näher heran.
    const finger = (von, nach) => page.evaluate(([v, n, vp]) => {
      const welt = document.querySelector(".bau-welt");
      const cx = vp.width / 2;
      const cy = vp.height / 2;
      const ev = (typ, id, x, y) => welt.dispatchEvent(new PointerEvent(typ, { pointerId: id, pointerType: "touch", isPrimary: id === 21, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: typ === "pointerup" ? 0 : 1 }));
      ev("pointerdown", 21, cx, cy - v);
      ev("pointerdown", 22, cx, cy + v);
      for (let i = 1; i <= 12; i += 1) { const d = v + ((n - v) * i) / 12; ev("pointermove", 21, cx, cy - d); ev("pointermove", 22, cx, cy + d); }
      ev("pointerup", 21, cx, cy - n);
      ev("pointerup", 22, cx, cy + n);
    }, [von, nach, viewport]);
    await finger(Math.min(150, viewport.height * 0.35), 30);
    await page.waitForTimeout(700);
    const weg = await lage();
    pruefe(weg.weit && weg.svgH < standard.svgH && Math.abs(weg.svgH - ganz.svgH) <= 3, `${name}: Zwei Finger: zusammen zoomt nicht bis zum ganzen Haus (${JSON.stringify(weg)}, ganz ${ganz.svgH})`);
    await finger(30, Math.min(170, viewport.height * 0.42));
    await page.waitForTimeout(700);
    const nah = await lage();
    pruefe(nah.svgH > weg.svgH && nah.svgH <= standard.svgH + 2, `${name}: Zwei Finger: auseinander zoomt nicht näher heran (${JSON.stringify(nah)})`);
    // Ein Finger zieht das Haus weiterhin hinauf und hinunter.
    const vorher = await page.evaluate(() => document.querySelector(".bau-welt").style.transform);
    await ziehe(page, { x: viewport.width * 0.3, y: viewport.height * 0.3 }, { x: viewport.width * 0.3, y: viewport.height * 0.7 });
    await page.waitForTimeout(900);
    pruefe(await page.evaluate(() => document.querySelector(".bau-welt").style.transform) !== vorher, `${name}: Zwei Finger: danach lässt sich das Haus nicht mehr ziehen`);
  } catch (fehler) {
    const zeilen = fehler.message.split("\n");
    const wo = zeilen.find((z) => /waiting for/.test(z))?.trim() || "";
    fehlt(`${name}: ${zeilen[0]}${wo ? ` (${wo})` : ""}`);
  }
  ausnahmen.forEach((a) => fehlt(`${name}: Ausnahme im Browser: ${a}`));
  await context.close();
}

// Der KiddyDome: braucht zwei Stockwerke, steht über beide, wandert als Ganzes.
async function pruefeKiddyDome(browser, name, viewport) {
  const { context, page, ausnahmen } = await neueSeite(browser, viewport);
  try {
    await page.addInitScript(() => { try { if (!localStorage.getItem("lernapp.bau.lieferung")) localStorage.setItem("lernapp.bau.lieferung", JSON.stringify({ geraete: { pruefung: 4 } })); } catch { /* egal */ } });
    await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
    await page.evaluate(() => {
      const S = window.LernappBauStand;
      S.setzeGewaehlt("zentrum");
      S.waehleRaum("zentrum", 0, 0, "bibliothek");
      S.waehleRaum("wohnhaus", 0, 0, "kinderzimmer");
      S.merkeGezeigt();
      S.speichern(true);
    });
    await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
    await page.waitForTimeout(1600);
    pruefe(await page.evaluate(() => window.LernappBauStand.paletten()) >= 2, `${name}: KiddyDome: keine Ziegel für den Test`);
    // Das Plus über dem Dach ins Bild holen (auf dem Handy liegt es oberhalb).
    for (let n = 0; n < 8; n += 1) {
      const r = await page.locator(".bau-naechster .bau-plus").boundingBox();
      if (r && r.y > 60 && r.y + r.height < viewport.height - 10) break;
      await ziehe(page, { x: viewport.width * 0.2, y: viewport.height * 0.35 }, { x: viewport.width * 0.2, y: viewport.height * 0.75 }, 6);
      await page.waitForTimeout(700);
    }
    await tippe(page, ".bau-naechster .bau-plus");
    pruefe(await bis(page, () => document.querySelector(".bau-wahl.is-raumwahl"), null, 6000), `${name}: KiddyDome: nach dem Bauen kommt keine Zimmerwahl`);
    const karte = page.locator('.bau-wahl-feld[aria-label="KiddyDome"]');
    await karte.scrollIntoViewIfNeeded();
    const vorDome = await page.evaluate(() => window.__gesagt.length);
    await karte.click();
    await page.waitForTimeout(300);
    const wahl = await page.evaluate(() => {
      const h = document.querySelector(".bau-wahl-hinweis");
      const dazu = document.querySelector(".bau-dazu");
      const r = h?.getBoundingClientRect();
      return {
        text: h?.textContent || "", warnung: h?.classList.contains("is-warnung"), sichtbar: Boolean(r && r.height > 0 && r.bottom <= window.innerHeight && r.top >= 0),
        haken: [...document.querySelectorAll(".bau-wahl .bau-ok")].every((b) => b.hidden || b.disabled), dazu: Boolean(dazu && !dazu.hidden),
      };
    });
    pruefe(/zwei Stockwerke/.test(wahl.text) && wahl.warnung && wahl.sichtbar, `${name}: KiddyDome: die Wahl sagt nicht sichtbar, dass er zwei Stockwerke braucht (${JSON.stringify(wahl)})`);
    pruefe(wahl.haken && wahl.dazu, `${name}: KiddyDome mit einem Stockwerk: der Haken ist an oder "Stockwerk dazubauen" fehlt`);
    pruefe(await bis(page, (n) => /zwei Stockwerke/.test(window.__gesagt.slice(n).join(" ")), vorDome, 2000), `${name}: KiddyDome: der Hinweis wird nicht vorgelesen`);
    await page.locator(".bau-dazu").click();
    pruefe(await bis(page, () => document.querySelector(".bau-zimmer-svg")?.getAttribute("viewBox")?.startsWith("0 -256"), null, 9000), `${name}: KiddyDome: nach dem Dazubauen geht kein doppelt hohes Zimmer auf`);
    const stock = await page.evaluate(() => window.LernappBauStand.haus("zentrum").stock.map((s) => `${s.art}:${s.zimmer[0]?.raum || ""}`).join("|"));
    pruefe(stock === "eins:bibliothek|eins:kiddydome|oben:", `${name}: KiddyDome: die Stockwerke stimmen nicht (${stock})`);
    // Was an der Decke hängt, hängt ganz oben.
    const decke = await page.evaluate(() => window.LernappBauKatalog.dingeFuer("kiddydome").find((id) => window.LernappBauMoebel.DINGE[id]?.art === "decke"));
    if (decke) {
      const knopfEl = page.locator(`.bau-schublade [data-ding="${decke}"]`);
      await knopfEl.scrollIntoViewIfNeeded();
      await knopfEl.click();
      await page.waitForTimeout(600);
      const y = await page.evaluate(() => window.LernappBauStand.zimmer("zentrum", 1, 0).dinge.at(-1)?.y);
      pruefe(y === -256, `${name}: KiddyDome: ${decke} hängt nicht an der Decke ganz oben (y ${y})`);
    } else fehlt(`${name}: KiddyDome: in der Schublade hängt nichts an der Decke`);
    // Nach vorne und nach hinten – auch wenn die Dinge verschieden tief stehen
    // (der Kletterturm vorn, das Bällebad dahinter).
    await page.evaluate(() => {
      window.LernappBauStand.aendereZimmer("zentrum", 1, 0, (z) => { z.dinge.push({ k: "turm", i: "k_kletterturm", x: 160, y: 234, c: "", f: 0, s: 1 }, { k: "bad", i: "k_baellebad", x: 230, y: 228, c: "", f: 0, s: 1 }); });
      window.LernappBau.auffrischen();
    });
    await page.waitForTimeout(400);
    const reihe = () => page.evaluate(() => [...document.querySelectorAll(".bau-zimmer-svg .bau-ding")].map((g) => g.dataset.k).filter((k) => k === "turm" || k === "bad").join("<"));
    const waehleDing = async (k) => {
      const r = await page.locator(`.bau-zimmer-svg .bau-ding[data-k="${k}"] .bau-griff`).boundingBox();
      await page.mouse.click(r.x + r.width / 2, r.y + r.height - Math.min(14, r.height * 0.06));
      await page.waitForTimeout(300);
    };
    pruefe(await reihe() === "bad<turm", `${name}: Nach vorne/hinten: der Anfang stimmt nicht (${await reihe()})`);
    await waehleDing("turm");
    await page.locator('.bau-bearbeiten [aria-label="Nach hinten"]').click();
    await page.waitForTimeout(400);
    pruefe(await reihe() === "turm<bad", `${name}: «Nach hinten» bringt den Kletterturm nicht hinter das Bällebad (${await reihe()})`);
    // Der Kletterturm bleibt gewählt – gleich wieder nach vorne.
    await page.locator('.bau-bearbeiten [aria-label="Nach vorne"]').click();
    await page.waitForTimeout(400);
    pruefe(await reihe() === "bad<turm", `${name}: «Nach vorne» bringt den Kletterturm nicht wieder vor das Bällebad (${await reihe()})`);
    // Vergrössert ist der Kletterturm höher als das Zimmer und darf nicht
    // weiter nach hinten – dann rückt das Bällebad ein wenig vor.
    await page.locator('.bau-bearbeiten [aria-label="Grösser"]').click();
    await page.waitForTimeout(400);
    await page.locator('.bau-bearbeiten [aria-label="Nach hinten"]').click();
    await page.waitForTimeout(400);
    pruefe(await reihe() === "turm<bad", `${name}: «Nach hinten» bringt den grossen Kletterturm nicht hinter das Bällebad (${await reihe()})`);
    await page.locator(".stage-back").click();
    await page.waitForTimeout(1200);
    const haus = await page.evaluate(() => ({
      clip: document.querySelector('.bau-raum[data-stock="1"]')?.getAttribute("clip-path") || "",
      oben: document.querySelectorAll('.bau-raum[data-stock="2"]').length,
    }));
    pruefe(haus.clip.includes("bau-clip-doppel") && haus.oben === 0, `${name}: KiddyDome: im Haus nicht über zwei Stockwerke gezeichnet (${JSON.stringify(haus)})`);
    // Umstellen: ein Rahmen und ein Pfeil für beide Stockwerke.
    await page.locator(".bau-ordnenknopf").click();
    await page.waitForTimeout(500);
    const pfeile = await page.evaluate(() => [...document.querySelectorAll(".bau-ordnenpfeil")].map((p) => `${p.dataset.ziel}${p.dataset.stock}`).sort().join());
    pruefe(pfeile === "hoch0,runter1", `${name}: KiddyDome: die Pfeile zum Umstellen stimmen nicht (${pfeile})`);
    await tippe(page, '.bau-ordnenpfeil[data-ziel="runter"][data-stock="1"]');
    await page.waitForTimeout(800);
    const umgestellt = await page.evaluate(() => window.LernappBauStand.haus("zentrum").stock.map((s) => `${s.art}:${s.zimmer[0]?.raum || ""}`).join("|"));
    pruefe(umgestellt === "eins:kiddydome|oben:|eins:bibliothek", `${name}: KiddyDome wandert nicht als Ganzes (${umgestellt})`);
    await page.locator(".bau-ordnenknopf").click();
    await page.waitForTimeout(400);
    // Ein Tier aus dem Kinderzimmer ist im KiddyDome zu Besuch.
    const besuch = await page.evaluate(() => {
      const S = window.LernappBauStand;
      const tier = S.stock("wohnhaus", 0).tiere[0];
      for (let t = Date.now() + 3600000; t < Date.now() + 10 * 86400000; t += 15 * 60000) {
        const wo = S.aufenthalt(tier.seed, t);
        if (wo.wo === "besuch" && wo.haus === "zentrum" && S.zimmer("zentrum", wo.index, wo.slot)?.raum === "kiddydome") {
          const echt = Date.now;
          const versatz = t - echt();
          Date.now = () => echt() + versatz;
          return tier.seed;
        }
      }
      return "";
    });
    pruefe(besuch, `${name}: KiddyDome: das Tier aus dem Kinderzimmer geht nie hin`);
    if (besuch) {
      // Neu zeichnen – über das Spital, denn im Wohnhaus zöge gleich jemand ein.
      await page.locator('.bau-tab[data-haus="spital"]').click();
      await page.waitForTimeout(900);
      await page.locator('.bau-tab[data-haus="zentrum"]').click();
      await page.waitForTimeout(1200);
      pruefe(await page.locator(`.bau-raum[data-stock="0"] .bau-tier[data-seed="${besuch}"]`).count() === 1, `${name}: KiddyDome: das Tier aus dem Kinderzimmer ist dort nicht zu sehen`);
    }
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
await pruefeKiddyDome(browser, "Tablet", { width: 1600, height: 1000 });
await pruefeKiddyDome(browser, "Handy", { width: 812, height: 375 });
await pruefeBewohner(browser, "Tablet", { width: 1600, height: 1000 });
await pruefeBewohner(browser, "Handy", { width: 812, height: 375 });
await pruefeUeberraschungen(browser, "Tablet", { width: 1600, height: 1000 });
await pruefeUeberraschungen(browser, "Handy", { width: 812, height: 375 });
await pruefeAnsicht(browser, "Tablet", { width: 1600, height: 1000 });
await pruefeAnsicht(browser, "Handy", { width: 812, height: 375 });
await browser.close();
halt();
// Alles, was die Bauecke sagt, kommt als Aufnahme (bau-stimme.js) – nie
// zwischendurch die Gerätestimme (docs/STIMME-GOOGLE.md).
geraetSaetze.forEach((breite, satz) => fehlt(`${breite < 900 ? "Handy" : "Tablet"}: mit der Gerätestimme statt als Aufnahme: «${satz}»`));

if (befunde.length) {
  console.error(`Die Bauecke hat ${befunde.length} Befunde:`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Bauecke läuft: Bauplatz, Hauswahl, Einzug mit Feuerwerk, Zimmer mit eigenen Dingen, Tier-Tafel mit Hingehen, Traumjob von aussen und im Zimmer, KiddyDome über zwei Stockwerke, alle Bewohner auf einen Blick, Sternenleiter mit Krone und goldenem Rahmen, Blitzzug, Glücksstern, ganzes Haus und Zoom, Umstellen, Rätsel, Lieferung, Bauen, Vorlesen per Tipp – auf Tablet und Handy.");
