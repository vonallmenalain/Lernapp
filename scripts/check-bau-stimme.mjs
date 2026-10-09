/*
 * Spricht die Bauecke überall mit der Google-Stimme?
 * ---------------------------------------------------------------------------
 * Die Bauecke sagt bei jedem Tipp etwas. Jeder Satz soll als Aufnahme kommen
 * (bau-stimme.js, docs/STIMME-GOOGLE.md) – nicht zwischendurch plötzlich mit
 * der Stimme des Geräts. Dieser Rundgang legt einen vollen Stand an (alle vier
 * Häuser mit Zimmern, Wohnungen mit einem, zwei und drei Tieren, Traumjobs,
 * Wünsche) und tippt in jeder Ansicht an, was spricht: Häuser, Stockwerke,
 * Zimmer, Schublade, Dinge, Farben, die Tafel jedes Tiers mit allen Texten,
 * alle Bewohner, die Sternenleiter, das Umstellen, die Wahl-Fenster mit allen
 * Karten, das Bauen. Gemeldet wird jeder Satz, den die Bauecke dabei mit der
 * Gerätestimme sagt, und wo.
 *
 *   node scripts/check-bau-stimme.mjs
 *
 * Fehlt ein Satz, gehört er in scripts/stimme-bau-texte.mjs – oder die
 * Bauecke sagt ihn in Stücken, die sich aufnehmen lassen (je Satz höchstens
 * ein Name oder eine Zahl). Danach: node scripts/stimme-google.mjs vertonen.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4199);
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

// Eine Sprachausgabe und Aufnahmen, die gleich fertig sind. Was die Bauecke
// mit der Gerätestimme zu Ende sagt, meldet __geraetSagt; was als Aufnahme
// spielt, zählt __aufnahmen.
function stimmeErsatz() {
  window.__aufnahmen = 0;
  HTMLMediaElement.prototype.play = function play() {
    const quelle = String(this.src);
    const lauf = (this.__lauf = (this.__lauf || 0) + 1);
    setTimeout(() => {
      if (this.__lauf !== lauf || String(this.src) !== quelle) return;
      if (quelle.includes("/stimme/")) window.__aufnahmen += 1;
      this.dispatchEvent(new Event("ended"));
    }, 3);
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
        if (document.querySelector('.train-stage[data-view="bau"]')) window.__geraetSagt?.(String(aeusserung.text));
        aeusserung.dispatchEvent(new Event("end"));
      }, 3);
    },
    cancel() { abbruch += 1; }, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  try { localStorage.setItem("lernapp.tts", "1"); } catch { /* egal */ }
}

const geraet = new Map();   // Satz → wo er fiel
let schritt = "";
const ausnahmen = [];

// Ein voller Stand: Wohnungen mit 3, 2 und 1 Tier, zwei Stockwerke mit je zwei
// Zimmern, in den anderen Häusern Arbeitsplätze, die sich die Tiere wünschen
// oder wo sie ihren Traumjob haben.
function vollerStand() {
  const S = window.LernappBauStand;
  const E = window.LernappEntitlement;
  if (E) E.isFree = () => true;
  S.merkeGezeigt();
  S.setzeGewaehlt("wohnhaus");
  for (let i = 0; i < 40; i += 1) S.bonusPalette();
  S.merkeGezeigt();
  const ziehen = (i, n) => {
    for (let k = 0; k < n; k += 1) { S.aendereStock("wohnhaus", i, (st) => { st.zuzug = 0; }); S.ziehtEin("wohnhaus", i); }
    S.aendereStock("wohnhaus", i, (st) => { st.tiere.forEach((t) => { t.seit = Date.now() - 86400000; }); st.zuzug = Date.now() + 86400000; });
  };
  // Das Wohnhaus: die drei Stockwerke vom Anfang und vier dazu.
  for (let i = 0; i < 9; i += 1) S.baueStockwerk("wohnhaus");
  const plan = [["wohnung", ["kinderzimmer"], 3], ["wohnung", ["schlafzimmer"], 2], ["wohnung", ["kinderzimmer"], 1],
    ["zwei", ["kueche", "bad"]], ["zwei", ["wohnzimmer", "waschzimmer"]], ["zwei", ["bastelzimmer", ""]], ["wohnung", ["schlafzimmer"], 3],
    ["wohnung", ["kinderzimmer"], 3], ["wohnung", ["schlafzimmer"], 3], ["wohnung", ["kinderzimmer"], 3], ["wohnung", ["schlafzimmer"], 3], ["zwei", ["eingang", "terrasse"]]];
  plan.forEach(([art, raeume, tiere], i) => {
    S.waehleArt("wohnhaus", i, art);
    raeume.forEach((r, slot) => { if (r) S.waehleRaum("wohnhaus", i, slot, r); });
    if (tiere) ziehen(i, tiere - 1);
  });
  // Die anderen Häuser: je vier Zimmer, das Dorf mit dem KiddyDome.
  const arbeit = { spital: ["notfall", "augen", "spitalcafeteria", "labor"], zentrum: ["bibliothek", "baeckerei", "kiddydome", "kino"], buero: ["grossraum", "atelier", "cafeteria", "fitness"] };
  Object.entries(arbeit).forEach(([h, raeume]) => {
    for (let i = 0; i < 5; i += 1) S.baueStockwerk(h);
    let i = 0;
    raeume.forEach((r) => { S.waehleRaum(h, i, 0, r); i += r === "kiddydome" ? 2 : 1; });
  });
  // Traumjobs und Wünsche: einige haben ihn, mehrere wünschen sich dasselbe Zimmer.
  const orte = ["spital:notfall", "spital:augen", "zentrum:bibliothek", "zentrum:baeckerei", "buero:grossraum", "buero:atelier"];
  let n = 0;
  S.alleTiere().forEach(({ index }) => {
    S.aendereStock("wohnhaus", index, (st) => {
      st.tiere.forEach((t) => {
        t.traum = orte[n % orte.length];
        t.b = [`fremd:${orte[(n + 1) % orte.length]}`, `fremd:${orte[(n + 2) % orte.length]}`];
        t.w = ["ding:bett", "ding:ball"];
        t.wAt = Date.now();
        n += 1;
      });
    });
  });
  S.speichern(true);
  return S.alleTiere().length;
}

async function neueSeite(browser) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await context.route("**/*gstatic.com/**", (route) => route.abort());
  await context.route("**/fonts.googleapis.com/**", (route) => route.abort());
  await context.exposeBinding("__geraetSagt", (_quelle, text) => { if (!geraet.has(text)) geraet.set(text, schritt); });
  await context.addInitScript(stimmeErsatz);
  await context.addInitScript(() => {
    try {
      if (!localStorage.getItem("lernapp.bau.ueberraschung")) localStorage.setItem("lernapp.bau.ueberraschung", JSON.stringify({ "": { zug: Date.now() + 864e5, stern: Date.now() + 864e5, rekord: 999 } }));
    } catch { /* privater Modus */ }
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => ausnahmen.push(`${schritt}: ${e.message}`));
  return { context, page };
}

const pause = (page, ms = 120) => page.waitForTimeout(ms);
const sichtbar = (page, sel) => page.locator(sel).first().isVisible().catch(() => false);

// Alle Elemente zu einem Selektor antippen, die gerade zu sehen sind.
async function tippeAlle(page, sel, { max = 60, warte = 140, nachher = null } = {}) {
  const n = await page.locator(sel).count();
  for (let i = 0; i < Math.min(n, max); i += 1) {
    const e = page.locator(sel).nth(i);
    if (!(await e.isVisible().catch(() => false))) continue;
    await e.click({ timeout: 2000, force: true }).catch(() => {});
    await pause(page, warte);
    if (nachher) await nachher(page);
  }
}

// Der Lautsprecher oben: liest die Hilfe dieser Ansicht vor (kids.js, speakHelp).
async function hilfe(page) {
  const k = page.locator(".help-voice-button");
  if (!(await k.first().isVisible().catch(() => false))) return;
  await k.first().click({ force: true }).catch(() => {});
  await pause(page, 160);
  // Läuft sie noch (der Knopf ist grün), hält ein zweiter Tipp sie an.
  if (await page.locator(".help-voice-button.speaking, .help-voice.speaking").count()) await k.first().click({ force: true }).catch(() => {});
}

// Alle Texte antippen, die die Bauecke auf Tipp vorliest (train-bau.js, liesText).
async function liesAlle(page, wo) {
  await tippeAlle(page, `${wo} .bau-lies, ${wo} p, ${wo} h2, ${wo} h3`, { max: 80, warte: 110 });
}

async function schliesseOverlays(page) {
  for (let k = 0; k < 4; k += 1) {
    if (await sichtbar(page, ".bau-tafel:not([hidden]) .bau-tafel-zu")) { await page.locator(".bau-tafel:not([hidden]) .bau-tafel-zu").first().click({ force: true }).catch(() => {}); await pause(page, 300); continue; }
    if (await sichtbar(page, ".bau-uebersicht:not([hidden]) .bau-uebersicht-zu")) { await page.locator(".bau-uebersicht:not([hidden]) .bau-uebersicht-zu").first().click({ force: true }).catch(() => {}); await pause(page, 300); continue; }
    if (await sichtbar(page, ".bau-abbrechen")) { await page.locator(".bau-abbrechen").first().click({ force: true }).catch(() => {}); await pause(page, 300); continue; }
    break;
  }
}

// Die Tafel eines Tiers: alle Texte, die Wünsche, die Mitbewohner, ausziehen? nein.
async function tafelRunde(page, wer) {
  schritt = `Tafel ${wer}`;
  await hilfe(page);
  await liesAlle(page, ".bau-tafel:not([hidden])");
  await tippeAlle(page, ".bau-tafel:not([hidden]) .bau-wunsch-text", { warte: 160 });
  if (await sichtbar(page, ".bau-tafel:not([hidden]) .bau-hinaus")) {
    schritt = `Tafel ${wer}: ausziehen?`;
    await page.locator(".bau-tafel:not([hidden]) .bau-hinaus").first().click({ force: true }).catch(() => {});
    await pause(page, 250);
    await liesAlle(page, ".bau-tafel:not([hidden])");
    const nein = page.locator(".bau-tafel:not([hidden]) .bau-knopf-klein", { hasText: "Nein" });
    if (await nein.count()) { await nein.first().click({ force: true }).catch(() => {}); await pause(page, 250); }
  }
}

// «Zeig mir» auf der Tafel: jeder Pfeil führt hin und sagt, was zu tun ist.
async function zeigRunde(page, wer, oeffne) {
  const n = await page.locator(".bau-tafel:not([hidden]) .bau-zeig").count();
  for (let i = 0; i < n; i += 1) {
    schritt = `Tafel ${wer}: Zeig mir ${i + 1}`;
    if (!(await sichtbar(page, ".bau-tafel:not([hidden])"))) await oeffne();
    await page.locator(".bau-tafel:not([hidden]) .bau-zeig").nth(i).click({ force: true }).catch(() => {});
    await pause(page, 1500);
    await schliesseOverlays(page);
    if (await page.locator(".bauecke.ist-zimmer").count()) { await page.evaluate(() => window.LernappBau.zurueck()); await pause(page, 1200); }
  }
}

// Ein Wahl-Fenster: jede Karte, alle Texte, dann abbrechen.
async function wahlRunde(page, was) {
  schritt = `Wahl ${was}`;
  await hilfe(page);
  await liesAlle(page, ".bau-wahl");
  await tippeAlle(page, ".bau-wahl .bau-wahl-feld", { warte: 160 });
  if (await sichtbar(page, ".bau-dazu")) { /* der KiddyDome bietet an, dazuzubauen – nicht nötig */ }
}

async function zimmerRunde(page, wo) {
  schritt = `Zimmer ${wo}: Hilfe`;
  await hilfe(page);
  schritt = `Zimmer ${wo}: Kopf`;
  // Die Tiere oben im Zimmer: ein Tipp sagt, wer es ist, und öffnet die Tafel.
  const kopf = await page.locator(".bau-zimmertier:not(.is-mehr)").count();
  for (let i = 0; i < kopf; i += 1) {
    schritt = `Zimmer ${wo}: Tier ${i + 1}`;
    await page.locator(".bau-zimmertier:not(.is-mehr)").nth(i).click({ force: true }).catch(() => {});
    await pause(page, 400);
    if (await sichtbar(page, ".bau-tafel:not([hidden])")) {
      await tafelRunde(page, `${wo}, Tier ${i + 1}`);
      // Die Mitbewohner oben in der Tafel.
      schritt = `Zimmer ${wo}: Mitbewohner`;
      await tippeAlle(page, ".bau-tafel:not([hidden]) .bau-tafel-wechsel", { warte: 300, nachher: (p) => liesAlle(p, ".bau-tafel:not([hidden])") });
      await schliesseOverlays(page);
    }
  }
  schritt = `Zimmer ${wo}: Name`;
  await tippeAlle(page, ".bau-zimmername", { warte: 300 });
  await schliesseOverlays(page);
  // Die Schublade: jeder Reiter, die ersten Dinge, Farben, Muster, Böden.
  const reiter = await page.locator(".bau-reiter-knopf").count();
  for (let r = 0; r < reiter; r += 1) {
    schritt = `Zimmer ${wo}: Reiter ${r + 1}`;
    await page.locator(".bau-reiter-knopf").nth(r).click({ force: true }).catch(() => {});
    await pause(page, 200);
    await tippeAlle(page, ".bau-inhalt .bau-ding-knopf", { max: 4, warte: 260 });
    await tippeAlle(page, ".bau-inhalt button:not(.bau-ding-knopf)", { max: 6, warte: 160 });
  }
  // Ein Ding im Zimmer: auswählen, dann alles, was man damit tun kann.
  schritt = `Zimmer ${wo}: Ding`;
  const ding = page.locator(".bau-zimmer-svg [data-k]").first();
  if (await ding.count()) {
    await ding.click({ force: true }).catch(() => {});
    await pause(page, 250);
    await tippeAlle(page, ".bau-aktion", { max: 8, warte: 220 });
  }
  schritt = `Zimmer ${wo}: Knöpfe`;
  await tippeAlle(page, ".bauecke .bau-rund:not(.bau-stiftknopf)", { max: 6, warte: 200 });
  await schliesseOverlays(page);
  if (await sichtbar(page, ".bau-stiftknopf")) {
    schritt = `Zimmer ${wo}: Zimmerart ändern`;
    await page.locator(".bau-stiftknopf").first().click({ force: true }).catch(() => {});
    await pause(page, 400);
    if (await sichtbar(page, ".bau-wahl")) await wahlRunde(page, `Zimmerart ${wo}`);
    await schliesseOverlays(page);
  }
}

async function hausRunde(page, hausId) {
  schritt = `Haus ${hausId}: Reiter`;
  await page.locator(`.bau-tab[data-haus="${hausId}"]`).first().click({ force: true }).catch(() => {});
  await pause(page, 1300);
  await schliesseOverlays(page);
  schritt = `Haus ${hausId}: Hilfe`;
  await hilfe(page);
  const raeume = await page.locator(".bau-welt .bau-raum").count();
  for (let i = 0; i < raeume; i += 1) {
    const r = page.locator(".bau-welt .bau-raum").nth(i);
    const wo = `${hausId} ${await r.getAttribute("data-stock")}/${await r.getAttribute("data-slot")}`;
    schritt = `Haus ${hausId}: Stockwerk ${wo}`;
    await r.scrollIntoViewIfNeeded().catch(() => {});
    await r.click({ force: true }).catch(() => {});
    await pause(page, 1300);
    if (await sichtbar(page, ".bau-wahl")) { await wahlRunde(page, `Stockwerk ${wo}`); await schliesseOverlays(page); continue; }
    if (await sichtbar(page, ".bau-tafel:not([hidden])")) { await tafelRunde(page, wo); await schliesseOverlays(page); continue; }
    if (await page.locator(".bauecke.ist-zimmer").count()) {
      await zimmerRunde(page, wo);
      schritt = `Haus ${hausId}: zurück aus ${wo}`;
      await page.evaluate(() => window.LernappBau.zurueck());
      await pause(page, 1300);
      await schliesseOverlays(page);
    }
  }
  // Die Sterne am Lift (Wohnhaus) öffnen die Tafel.
  schritt = `Haus ${hausId}: Sterne am Lift`;
  const lift = await page.locator(".bau-welt .bau-liftsterne, .bau-welt [data-ziel='sterne']").count();
  for (let i = 0; i < lift; i += 1) {
    await page.locator(".bau-welt .bau-liftsterne, .bau-welt [data-ziel='sterne']").nth(i).click({ force: true }).catch(() => {});
    await pause(page, 500);
    if (await sichtbar(page, ".bau-tafel:not([hidden])")) await tafelRunde(page, `${hausId} Lift ${i + 1}`);
    await schliesseOverlays(page);
  }
  // Umstellen: jedes Stockwerk sagt, wie es heisst.
  schritt = `Haus ${hausId}: Umstellen`;
  if (await sichtbar(page, ".bau-ordnenknopf")) {
    await page.locator(".bau-ordnenknopf").click({ force: true }).catch(() => {});
    await pause(page, 500);
    await tippeAlle(page, ".bau-welt .bau-raum", { warte: 200 });
    await page.locator(".bau-ordnenknopf").click({ force: true }).catch(() => {});
    await pause(page, 500);
  }
  // Das Haus anmalen.
  schritt = `Haus ${hausId}: anmalen`;
  if (await sichtbar(page, ".bau-fassadeknopf")) {
    await page.locator(".bau-fassadeknopf").click({ force: true }).catch(() => {});
    await pause(page, 400);
    await liesAlle(page, ".bau-wahl");
    await tippeAlle(page, ".bau-farbe", { max: 30, warte: 120 });
    await schliesseOverlays(page);
    await page.keyboard.press("Escape").catch(() => {});
  }
  // Ein neues Stockwerk: das Plus, dann jede Karte der Wahl.
  schritt = `Haus ${hausId}: bauen`;
  if (await sichtbar(page, ".bau-naechster .bau-plus")) {
    await page.locator(".bau-naechster .bau-plus").first().click({ force: true }).catch(() => {});
    await pause(page, 2400);
    if (await sichtbar(page, ".bau-wahl")) {
      await wahlRunde(page, `neues Stockwerk ${hausId}`);
      if (hausId === "wohnhaus") {
        // Zwei Zimmer wählen, dann die Zimmerwahl eines der beiden.
        await page.locator(".bau-wahl .bau-wahl-feld", { hasText: "Zwei Zimmer" }).first().click({ force: true }).catch(() => {});
        await pause(page, 200);
        await page.locator(".bau-wahl .bau-ok").first().click({ force: true }).catch(() => {});
        await pause(page, 900);
      } else await schliesseOverlays(page);
    }
    await schliesseOverlays(page);
  }
}

if (!(await warteAufServer())) { console.error("Der Testserver startet nicht."); process.exit(2); }
const browser = await playwright.chromium.launch();
const { context, page } = await neueSeite(browser);
try {
  schritt = "Start";
  await page.goto(`${BASIS}/index.html`, { waitUntil: "load" });
  await pause(page, 600);
  const tiere = await page.evaluate(vollerStand);
  await page.goto(`${BASIS}/index.html?bau=1`, { waitUntil: "load" });
  await pause(page, 1800);
  await page.mouse.click(5, 300);
  await pause(page, 300);
  await schliesseOverlays(page);
  for (const hausId of ["wohnhaus", "spital", "zentrum", "buero"]) await hausRunde(page, hausId);
  // Alle Bewohner: die Texte, jedes Tier mit seiner Tafel.
  schritt = "Alle Bewohner";
  await page.locator('.bau-tab[data-haus="wohnhaus"]').first().click({ force: true }).catch(() => {});
  await pause(page, 1200);
  await page.locator(".bau-bewohnerknopf").click({ force: true }).catch(() => {});
  await pause(page, 500);
  await hilfe(page);
  await liesAlle(page, ".bau-uebersicht:not([hidden])");
  const bewohner = await page.locator(".bau-uebersicht:not([hidden]) .bau-bewohner").count();
  for (let i = 0; i < bewohner; i += 1) {
    schritt = `Alle Bewohner: Tier ${i + 1}`;
    await page.locator(".bau-uebersicht:not([hidden]) .bau-bewohner").nth(i).click({ force: true }).catch(() => {});
    await pause(page, 500);
    if (await sichtbar(page, ".bau-tafel:not([hidden])")) await tafelRunde(page, `Bewohner ${i + 1}`);
    // Zurück führt in die Übersicht.
    if (await sichtbar(page, ".bau-tafel:not([hidden]) .bau-tafel-zu")) { await page.locator(".bau-tafel:not([hidden]) .bau-tafel-zu").first().click({ force: true }).catch(() => {}); await pause(page, 400); }
  }
  await schliesseOverlays(page);
  // «Zeig mir» bei jedem Tier: aus der Übersicht seine Tafel, dann die Pfeile.
  for (let i = 0; i < Math.min(bewohner, 12); i += 1) {
    const oeffne = async () => {
      await schliesseOverlays(page);
      if (!(await sichtbar(page, ".bau-uebersicht:not([hidden])"))) { await page.locator(".bau-bewohnerknopf").click({ force: true }).catch(() => {}); await pause(page, 500); }
      await page.locator(".bau-uebersicht:not([hidden]) .bau-bewohner").nth(i).click({ force: true }).catch(() => {});
      await pause(page, 500);
    };
    await oeffne();
    await zeigRunde(page, `Bewohner ${i + 1}`, oeffne);
    await schliesseOverlays(page);
  }
  // Die Sternenleiter.
  schritt = "Sternenleiter";
  await page.locator(".bau-leiterknopf").click({ force: true }).catch(() => {});
  await pause(page, 500);
  await hilfe(page);
  await liesAlle(page, ".bau-leiter:not([hidden])");
  await schliesseOverlays(page);
  // Die Knöpfe im Haus: Ziegel, Ansicht, Tag und Nacht.
  schritt = "Knöpfe im Haus";
  for (const sel of [".bau-ziegel", ".bau-ansichtknopf", ".bau-ansichtknopf", ".bau-nachtknopf", ".bau-nachtknopf", ".bau-bewohnerknopf"]) {
    if (await sichtbar(page, sel)) { await page.locator(sel).first().click({ force: true }).catch(() => {}); await pause(page, 600); }
    await schliesseOverlays(page);
  }
  console.log(`Rundgang mit ${tiere} Tieren; ${await page.evaluate(() => window.__aufnahmen)} Aufnahmen gespielt.`);
} catch (fehler) {
  ausnahmen.push(`${schritt}: ${fehler.message.split("\n")[0]}`);
}
await context.close();
await browser.close();
halt();

if (ausnahmen.length) console.error(`Fehler im Browser:\n${ausnahmen.map((a) => `  - ${a}`).join("\n")}`);
if (geraet.size) {
  console.error(`Die Bauecke sagt ${geraet.size} Sätze mit der Gerätestimme statt als Aufnahme:`);
  geraet.forEach((wo, satz) => console.error(`  - «${satz}» (${wo})`));
  process.exit(1);
}
if (ausnahmen.length) process.exit(1);
console.log("Die Bauecke spricht überall mit der Google-Stimme.");
