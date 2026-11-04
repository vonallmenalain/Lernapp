/*
 * Die Englischecke im Browser: Englischwagen, Zimmer, Entdecken, Hear and
 * find, Geschichte, Wörterbuch, Türen – und der Knopf DE überall.
 * ---------------------------------------------------------------------------
 *   Startbild   Der Englischwagen hängt am Lernzug (Schild «Hello»); ein Tipp
 *               führt hinein, Rocco grüsst auf Englisch.
 *   Sprechen    Rocco spricht Englisch mit den Aufnahmen aus stimme/englisch/;
 *               ein Tipp auf die Sprechblase oder den Lautsprecher sagt es
 *               noch einmal auf Englisch; DE sagt genau das auf Deutsch und
 *               danach noch einmal auf Englisch. Der Knopf DE ist in jeder
 *               Ansicht da und lässt sich antippen.
 *   Entdecken   Erster Tipp das Wort, zweiter der Satz; ein Stern am Ding;
 *               alle angetippt zählt eine Runde.
 *   Hear&find   Rocco fragt «Where is …?»; daneben getippt sagt er, was es
 *               war, und fragt noch einmal; fünf gefunden zählt eine Runde,
 *               und «Let's play again!» steht da.
 *   Geschichte  Vier Bilder, jedes antippbar; alle gehört zählt die Geschichte.
 *   Wörterbuch  Jedes gehörte Wort ist ein farbiger Sticker und sagt sich.
 *   Türen       Die Tür im Englischwagen führt in den Rechenwagen; dessen Tür
 *               bietet Englisch- und Lesewagen an.
 *   Schrift     «Immer zeigen» der Eltern stellt die Wörter geschrieben dazu.
 *   Handy       Quer auf dem Handy: nichts ragt über den Rand, die Leiste ist
 *               ganz zu sehen.
 *   Etappe 2    Die Spielzeugkiste zeigt alle Spiele; Memory, Yes or no?,
 *               Rocco says, Farben-Zug, Count with Rocco und Feed Rocco
 *               spielen je eine ganze Runde, mit DE mittendrin; die Jukebox
 *               sagt einen ganzen Vers; ein Buch aus dem Lesewagen zeigt
 *               seine gemalten Bilder, blättert und zählt; das Wörterbuch hat
 *               Reiter für Farben und Zahlen.
 *   Etappe 3    What's missing? versteckt ein Ding und findet es wieder;
 *               Dress up, Story train und das Diner spielen je eine Runde;
 *               das Telefon führt ein ganzes Gespräch mit «Now you say it!»;
 *               Echo geht auch ohne Mikrofon weiter; der Briefkasten zeigt
 *               die Postkarten, die schon da sind.
 *
 * Aufruf:  node scripts/check-englischecke.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4201);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich die Englischecke nicht prüfen."); process.exit(2); }

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
const warte = (ms) => new Promise((w) => setTimeout(w, ms));

// Aufnahmen spielen sofort fertig und merken sich, was gespielt wurde.
function tonErsatz() {
  window.__gespielt = [];
  HTMLMediaElement.prototype.play = function play() {
    window.__gespielt.push(this.src || this.currentSrc || "");
    setTimeout(() => this.dispatchEvent(new Event("ended")), 5);
    return Promise.resolve();
  };
}

async function neueSeite(browser, viewport, fehlerListe, name, vorher = null) {
  const kontext = await browser.newContext({ viewport });
  await kontext.route("**/*gstatic.com/**", (r) => r.abort());
  await kontext.route("**/*googleapis.com/**", (r) => r.abort());
  await kontext.addInitScript(tonErsatz);
  if (vorher) await kontext.addInitScript(vorher);
  const seite = await kontext.newPage();
  seite.on("pageerror", (e) => fehlerListe.push(`${name}: ${e.message}`));
  return { kontext, seite };
}

// Was gesagt wird: kids.speak wird mitgeschrieben und ist sofort fertig.
async function mitschreiben(seite) {
  await seite.evaluate(() => {
    window.__gesagt = [];
    window.__alles = [];
    const k = window.LernappKids;
    window.__echtSpeak = k.speak;
    k.speak = (text, o = {}) => {
      const eintrag = { text: String(text), sprache: o.sprache || "de" };
      window.__gesagt.push(eintrag);
      window.__alles.push(eintrag);
      setTimeout(() => o.onEnd?.(), 5);
    };
  });
}
const gesagt = (seite) => seite.evaluate(() => window.__gesagt.splice(0));
const ansicht = (seite) => seite.evaluate(() => window.LernappEnglischecke?.ansicht?.() || null);
const stand = (seite) => seite.evaluate(() => window.LernappEnglischStand.stand());
const tippe = async (seite, wahl) => { await seite.locator(wahl).first().dispatchEvent("click"); await warte(80); };

// Der Knopf DE: da, sichtbar, antippbar – und er sagt Deutsch, dann Englisch.
async function deUeberall(seite, wo) {
  const knopf = seite.locator(".en-de-knopf");
  if (!(await knopf.isVisible())) { fehlt(`${wo}: der Knopf DE ist nicht zu sehen`); return; }
  const box = await knopf.boundingBox();
  const oben = await seite.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest(".en-de-knopf") !== null, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  if (!oben) fehlt(`${wo}: über dem Knopf DE liegt etwas`);
  await warte(60);
  await gesagt(seite);
  await knopf.click();
  await warte(200);
  const g = await gesagt(seite);
  const de = g.filter((x) => x.sprache === "de");
  const en = g.filter((x) => x.sprache === "en");
  if (!de.length || !en.length) { fehlt(`${wo}: DE sagt nicht Deutsch und danach Englisch (${JSON.stringify(g)})`); return; }
  const ersterEn = g.findIndex((x) => x.sprache === "en");
  if (g.slice(0, ersterEn).some((x) => x.sprache !== "de") || ersterEn < 1) fehlt(`${wo}: DE sagt nicht zuerst Deutsch`);
}

try {
  if (!(await warteAufServer())) throw new Error("Der lokale Server startet nicht.");
  const browser = await playwright.chromium.launch();
  const seitenFehler = [];

  // --- Startbild → Englischwagen ------------------------------------------------
  {
    const { kontext, seite } = await neueSeite(browser, { width: 1280, height: 800 }, seitenFehler, "Startbild");
    await seite.goto(`${BASIS}/index.html`);
    await seite.waitForFunction(() => window.LernappKids && window.LernappEnglischecke);
    await mitschreiben(seite);
    const knopf = seite.locator(".englischwagen-knopf");
    await knopf.waitFor({ state: "visible", timeout: 8000 }).catch(() => fehlt("Startbild: kein Englischwagen"));
    const schild = await seite.evaluate(() => [...document.querySelectorAll(".englischwagen-knopf text")].map((t) => t.textContent).join(" "));
    if (!/Hello/.test(schild)) fehlt(`Startbild: der Englischwagen trägt kein Schild «Hello» (${schild})`);
    await seite.waitForFunction(() => !document.querySelector(".train-stage")?.dataset.entering, null, { timeout: 8000 }).catch(() => {});
    await warte(400);
    await knopf.click({ force: true });
    await seite.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "englisch", null, { timeout: 5000 }).catch(() => fehlt("Startbild: der Englischwagen führt nicht hinein"));
    await warte(500);
    if ((await ansicht(seite)) !== "zimmer") fehlt(`Englischwagen: zuerst nicht das Zimmer (${await ansicht(seite)})`);
    const g = await gesagt(seite);
    if (!g.some((x) => x.sprache === "en" && /^Hello! I am Rocco/.test(x.text))) fehlt(`Englischwagen: Rocco grüsst nicht auf Englisch (${JSON.stringify(g)})`);
    if (!(await seite.locator(".en-blase").isVisible())) fehlt("Englischwagen: keine Sprechblase");
    // Die echte Stimme: Englisch aus stimme/englisch/, Deutsch aus stimme/google/.
    await seite.evaluate(() => { window.__gespielt = []; window.__echtSpeak("A cow.", { sprache: "en" }); });
    await warte(1200);
    const en = await seite.evaluate(() => window.__gespielt.splice(0));
    if (!en.some((src) => /\/stimme\/englisch\/[0-9a-f]{12}\.mp3/.test(src))) fehlt(`Stimme: «A cow.» spielt keine Aufnahme aus stimme/englisch/ (${en.join(", ") || "nichts"})`);
    await seite.evaluate(() => { window.__echtSpeak("Eine Kuh."); });
    await warte(1200);
    const de = await seite.evaluate(() => window.__gespielt.splice(0));
    if (!de.some((src) => /\/stimme\/google\//.test(src))) fehlt(`Stimme: «Eine Kuh.» spielt keine Aufnahme der App-Stimme (${de.join(", ") || "nichts"})`);
    await kontext.close();
  }

  // --- Ein Durchgang durch alles ------------------------------------------------
  for (const [viewport, name] of [[{ width: 1280, height: 800 }, "Laptop"], [{ width: 844, height: 390 }, "Handy"]]) {
    const { kontext, seite } = await neueSeite(browser, viewport, seitenFehler, name);
    await seite.goto(`${BASIS}/index.html?englisch=1`);
    await seite.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "englisch" && window.LernappEnglischecke?.ansicht?.() === "zimmer", null, { timeout: 8000 })
      .catch(() => fehlt(`${name}: ?englisch=1 öffnet den Englischwagen nicht`));
    await mitschreiben(seite);
    await warte(300);
    await deUeberall(seite, `${name}, Zimmer`);
    // Sprechblase und Lautsprecher: noch einmal Englisch.
    await gesagt(seite);
    await tippe(seite, ".en-blase");
    await warte(100);
    let g = await gesagt(seite);
    if (!g.length || g.some((x) => x.sprache !== "en")) fehlt(`${name}: die Sprechblase sagt es nicht noch einmal auf Englisch (${JSON.stringify(g)})`);
    await tippe(seite, ".en-laut");
    await warte(100);
    g = await gesagt(seite);
    if (!g.length || g.some((x) => x.sprache !== "en")) fehlt(`${name}: der Lautsprecher sagt es nicht noch einmal auf Englisch`);
    // Die Wege im Zimmer.
    for (const ort of ["tuer", "regal", "buch", "rocco", "karte", "kiste", "ausguck", "aufnaeher"]) {
      if (!(await seite.locator(`.en-bild [data-ort="${ort}"]`).count())) fehlt(`${name}: im Zimmer fehlt ${ort}`);
    }
    // Handy: nichts über den Rand, die Leiste ganz da.
    const rand = await seite.evaluate(() => {
      const r = document.querySelector(".en-leiste").getBoundingClientRect();
      return { unten: r.bottom, rechts: r.right, breit: document.documentElement.scrollWidth, fenster: [innerWidth, innerHeight] };
    });
    if (rand.unten > rand.fenster[1] + 1 || rand.rechts > rand.fenster[0] + 1 || rand.breit > rand.fenster[0] + 1) fehlt(`${name}: die Leiste ragt über den Rand (${JSON.stringify(rand)})`);

    // Entdecken auf dem Bauernhof.
    await tippe(seite, '.en-bild [data-ort="ausguck"]');
    await warte(150);
    const weltenZahl = await seite.evaluate(() => window.LernappEnglischInhalt.WELTEN.length);
    if ((await seite.locator(".en-wahl-kachel").count()) !== weltenZahl) fehlt(`${name}: der Aussichtsturm bietet nicht alle ${weltenZahl} Welten an`);
    await deUeberall(seite, `${name}, Aussichtsturm`);
    await gesagt(seite);
    await tippe(seite, ".en-wahl-titel");
    g = await gesagt(seite);
    if (!g.some((x) => x.sprache === "en")) fehlt(`${name}: der Titel der Auswahl sagt sich nicht`);
    await tippe(seite, '.en-wahl-kachel[data-wahl="farm"]');
    await warte(150);
    if ((await ansicht(seite)) !== "entdecken") fehlt(`${name}: der Bauernhof öffnet nicht zum Entdecken`);
    await gesagt(seite);
    await tippe(seite, '.en-bild [data-ding="cow"]');
    g = await gesagt(seite);
    if (!g.some((x) => x.sprache === "en" && x.text === "A cow.")) fehlt(`${name}: der erste Tipp auf die Kuh sagt nicht «A cow.» (${JSON.stringify(g)})`);
    if (!(await seite.locator('.en-bild [data-ding="cow"] .en-marke *').count())) fehlt(`${name}: an der Kuh steht danach kein Stern`);
    await tippe(seite, '.en-bild [data-ding="cow"]');
    g = await gesagt(seite);
    if (!g.some((x) => x.text === "The cow says moo.")) fehlt(`${name}: der zweite Tipp sagt nicht den Satz`);
    await seite.locator(".en-de-knopf").click();
    await warte(150);
    g = await gesagt(seite);
    if (JSON.stringify(g.map((x) => x.text)) !== JSON.stringify(["Die Kuh macht muh.", "The cow says moo."])) fehlt(`${name}: DE sagt nicht genau das Letzte auf Deutsch und dann Englisch (${JSON.stringify(g)})`);
    const farm = await seite.evaluate(() => window.LernappEnglischInhalt.WELTEN.find((w) => w.id === "farm").woerter.map((w) => w.id));
    for (const id of farm) await tippe(seite, `.en-bild [data-ding="${id}"]`);
    let st = await stand(seite);
    if (st.runden.entdecken !== 1) fehlt(`${name}: alle Dinge angetippt zählt keine Runde (${JSON.stringify(st.runden)})`);
    if (farm.some((id) => !st.woerter[id]?.g)) fehlt(`${name}: nicht jedes angetippte Wort ist gehört`);
    await deUeberall(seite, `${name}, Entdecken`);

    // Hear and find auf dem Bauernhof.
    await seite.locator(".stage-back").click();
    await warte(200);
    if ((await ansicht(seite)) !== "zimmer") fehlt(`${name}: Zurück führt aus dem Entdecken nicht ins Zimmer`);
    await tippe(seite, '.en-bild [data-ort="kiste"]');
    if (await seite.locator('.en-wahl-kachel[data-wahl="hearfind"]').count()) await tippe(seite, '.en-wahl-kachel[data-wahl="hearfind"]');
    await tippe(seite, '.en-wahl-kachel[data-wahl="farm"]');
    await warte(300);
    if ((await ansicht(seite)) !== "hearfind") fehlt(`${name}: die Spielzeugkiste startet Hear and find nicht`);
    await deUeberall(seite, `${name}, Hear and find`);
    let falsch = false;
    for (let runde = 0; runde < 5; runde += 1) {
      await warte(150);
      const frage = await seite.evaluate(() => {
        const f = [...window.__alles].reverse().find((x) => x.sprache === "en" && /^Where is/.test(x.text));
        if (!f) return null;
        const w = window.LernappEnglischInhalt.WELTEN.find((x) => x.id === "farm").woerter.find((x) => x.frage === f.text);
        return w?.id || null;
      });
      if (!frage) { fehlt(`${name}: Hear and find fragt nicht «Where is …?» (Runde ${runde + 1})`); break; }
      await gesagt(seite);
      if (!falsch) {
        const anderes = farm.find((id) => id !== frage);
        await tippe(seite, `.en-bild [data-ding="${anderes}"]`);
        g = await gesagt(seite);
        const w = await seite.evaluate((id) => window.LernappEnglischInhalt.WELTEN[0].woerter.find((x) => x.id === id), anderes);
        if (!g.some((x) => x.text === w.en) || !g.some((x) => /^Where is/.test(x.text))) fehlt(`${name}: daneben getippt sagt nicht, was es war, und fragt nicht noch einmal (${JSON.stringify(g)})`);
        falsch = frage;
      }
      await tippe(seite, `.en-bild [data-ding="${frage}"]`);
      await warte(150);
    }
    await warte(200);
    st = await stand(seite);
    if (st.runden.hearfind !== 1) fehlt(`${name}: fünf gefunden zählt keine Runde Hear and find (${JSON.stringify(st.runden)})`);
    if (falsch && !(st.woerter[falsch]?.f >= 1)) fehlt(`${name}: der Fehlversuch ist nicht gezählt`);
    if (!(await seite.locator(".en-extra .en-go").count())) fehlt(`${name}: nach der Runde steht kein «Let's play again!»`);

    // Eine Geschichte.
    await seite.locator(".stage-back").click();
    await warte(200);
    await tippe(seite, '.en-bild [data-ort="regal"]');
    await tippe(seite, '.en-wahl-kachel[data-wahl="ball"]');
    await warte(200);
    if ((await ansicht(seite)) !== "geschichte") fehlt(`${name}: das Regal öffnet die Geschichte nicht`);
    const zurueck = await seite.locator(".stage-back").boundingBox();
    const panel = await seite.locator('.en-bild [data-panel="0"]').boundingBox();
    if (zurueck && panel && zurueck.x + zurueck.width > panel.x + 4 && zurueck.y + zurueck.height > panel.y + 4) fehlt(`${name}: der Zurück-Knopf liegt über dem ersten Bild der Geschichte`);
    for (let i = 0; i < 4; i += 1) { await tippe(seite, `.en-bild [data-panel="${i}"]`); await warte(120); }
    st = await stand(seite);
    if (st.geschichten.ball !== 1) fehlt(`${name}: alle vier Bilder gehört zählt die Geschichte nicht (${JSON.stringify(st.geschichten)})`);
    await deUeberall(seite, `${name}, Geschichte`);
    await gesagt(seite);
    await tippe(seite, ".en-extra .en-go");
    await warte(300);
    g = await gesagt(seite);
    if (g.filter((x) => x.sprache === "en").length < 6) fehlt(`${name}: «Whole story» erzählt nicht Titel, vier Bilder und «The end.» (${g.length})`);

    // Das Wörterbuch.
    await seite.locator(".stage-back").click();
    await warte(200);
    await tippe(seite, '.en-bild [data-ort="buch"]');
    await warte(200);
    if ((await ansicht(seite)) !== "woerterbuch") fehlt(`${name}: das Buch öffnet das Wörterbuch nicht`);
    await tippe(seite, '.en-bild [data-reiter="farm"]');
    await gesagt(seite);
    await tippe(seite, '.en-bild [data-sticker="cow"]');
    g = await gesagt(seite);
    if (!g.some((x) => x.text === "A cow.")) fehlt(`${name}: der Sticker der Kuh sagt nicht «A cow.» (${JSON.stringify(g)})`);
    await deUeberall(seite, `${name}, Wörterbuch`);

    // Die Tür in den Rechenwagen, und dessen Tür zurück.
    await seite.locator(".stage-back").click();
    await warte(200);
    await tippe(seite, '.en-bild [data-ort="tuer"]');
    await seite.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "rechnen", null, { timeout: 4000 }).catch(() => fehlt(`${name}: die Tür führt nicht in den Rechenwagen`));
    await warte(400);
    const tuer = seite.locator('.rechenecke [data-ort="tuer"], .rechenecke [data-ding="tuer"], .rechenecke .rechen-tuer').first();
    if (await tuer.count()) {
      await tuer.dispatchEvent("click");
      await warte(300);
      const wahl = seite.locator(".rechen-tueren [data-tuer], .rechen-tueren button");
      if (!(await wahl.count())) fehlt(`${name}: die Tür des Rechenwagens bietet keine Wahl an`);
      else {
        const englisch = seite.locator('.rechen-tueren [data-tuer="englisch"]');
        if (!(await englisch.count())) fehlt(`${name}: die Tür des Rechenwagens bietet den Englischwagen nicht an`);
        else {
          await englisch.dispatchEvent("click");
          await seite.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "englisch", null, { timeout: 4000 }).catch(() => fehlt(`${name}: die Tür des Rechenwagens führt nicht in den Englischwagen`));
        }
      }
    } else fehlt(`${name}: im Rechenwagen keine Tür gefunden`);
    // Zurück auf das Startbild.
    await warte(300);
    await seite.locator(".stage-back").click();
    await warte(400);
    const view = await seite.evaluate(() => document.querySelector(".train-stage")?.dataset.view);
    if (view !== "home") fehlt(`${name}: Zurück aus dem Zimmer führt nicht auf das Startbild (${view})`);
    await kontext.close();
  }

  // --- Etappe 2: die Spiele der Kiste, die Jukebox, ein Buch ----------------------
  for (const [viewport, name] of [[{ width: 1280, height: 800 }, "Laptop"], [{ width: 844, height: 390 }, "Handy"]]) {
    const { kontext, seite } = await neueSeite(browser, viewport, seitenFehler, `${name}, Etappe 2`);
    await seite.goto(`${BASIS}/index.html?englisch=1`);
    await seite.waitForFunction(() => window.LernappEnglischecke?.ansicht?.() === "zimmer", null, { timeout: 8000 }).catch(() => fehlt(`${name}: Englischwagen öffnet nicht`));
    await mitschreiben(seite);
    await warte(200);
    const I = await seite.evaluate(() => {
      const x = window.LernappEnglischInhalt;
      return { spiele: x.SPIELE.map((s) => s.id), essen: x.ESSEN, farben: x.FARBEN, woerter: x.WELTEN.flatMap((w) => w.woerter).map((w) => ({ id: w.id, ist: x.istDas(w)[0] })) };
    });
    const letztesEn = (muster) => seite.evaluate((m) => [...window.__alles].reverse().find((x) => x.sprache === "en" && new RegExp(m).test(x.text))?.text || null, muster);
    // Zurück ins Zimmer – aber nicht weiter hinaus an den Zug.
    const insZimmer = async () => {
      for (let i = 0; i < 3 && (await ansicht(seite)) !== "zimmer"; i += 1) { await seite.locator(".stage-back").click(); await warte(150); }
      await seite.evaluate(() => document.querySelector(".en-wahl")?.remove());
    };
    const spielStart = async (id) => {
      await insZimmer();
      await tippe(seite, '.en-bild [data-ort="kiste"]');
      await warte(100);
      if ((await seite.locator(".en-wahl-kachel").count()) !== I.spiele.length) fehlt(`${name}: die Spielzeugkiste zeigt nicht ${I.spiele.length} Spiele`);
      await tippe(seite, `.en-wahl-kachel[data-wahl="${id}"]`);
      await warte(200);
      if ((await ansicht(seite)) !== id) fehlt(`${name}: ${id} startet nicht aus der Spielzeugkiste (${await ansicht(seite)})`);
    };
    const runden = async () => (await stand(seite)).runden;
    // Memory: Paare über ihre Daten.
    await spielStart("memory");
    await deUeberall(seite, `${name}, Memory`);
    const karten = await seite.evaluate(() => [...document.querySelectorAll(".en-bild [data-karte]")].map((k) => ({ i: k.dataset.karte, w: k.dataset.wort, art: k.dataset.art })));
    const daneben = karten.find((k) => k.art === "bild");
    const falsch = karten.find((k) => k.art === "ton" && k.w !== daneben.w);
    await tippe(seite, `.en-bild [data-karte="${daneben.i}"]`);
    await tippe(seite, `.en-bild [data-karte="${falsch.i}"]`);
    await warte(1700);
    if (await seite.evaluate((i) => document.querySelector(`.en-bild [data-karte="${i}"] .en-karte-auf`).style.display !== "none", daneben.i)) fehlt(`${name}: Memory dreht zwei falsche Karten nicht zurück`);
    for (const w of [...new Set(karten.map((k) => k.w))]) {
      for (const k of karten.filter((x) => x.w === w)) await tippe(seite, `.en-bild [data-karte="${k.i}"]`);
      await warte(80);
    }
    await warte(200);
    if ((await runden()).memory !== 1) fehlt(`${name}: alle Paare zählen keine Runde Memory`);
    // Yes or no?
    await spielStart("janein");
    await deUeberall(seite, `${name}, Yes or no?`);
    for (let i = 0; i < 8; i += 1) {
      await warte(100);
      if ((await ansicht(seite)) !== "janein" || (await runden()).janein) break;
      const frage = await letztesEn("^(Is this|Are these)");
      const gezeigt = await seite.evaluate(() => document.querySelector(".en-bild [data-gezeigt]")?.dataset.gezeigt);
      const gefragt = I.woerter.find((w) => w.ist === frage)?.id;
      if (!frage || !gezeigt || !gefragt) { fehlt(`${name}: Yes or no? fragt nicht «Is this …?» (${frage})`); break; }
      await tippe(seite, `.en-bild [data-antwort="${gefragt === gezeigt ? "ja" : "nein"}"]`);
      await warte(120);
    }
    if ((await runden()).janein !== 1) fehlt(`${name}: Yes or no? zählt keine Runde`);
    // Rocco says
    await spielStart("roccosays");
    await deUeberall(seite, `${name}, Rocco says`);
    for (let i = 0; i < 8; i += 1) {
      await warte(120);
      if ((await runden()).roccosays) break;
      const auftrag = await letztesEn("^Tap the");
      const m = /^Tap the (?:(big|small) )?([a-z]+) balloon!$/.exec(auftrag || "");
      if (!m) { fehlt(`${name}: Rocco says sagt nicht «Tap the … balloon!» (${auftrag})`); break; }
      await tippe(seite, `.en-bild [data-ballon][aria-label="${m[1] ? `${m[1]} ` : ""}${m[2]}"]`);
    }
    if ((await runden()).roccosays !== 1) fehlt(`${name}: Rocco says zählt keine Runde`);
    // Farben-Zug
    await spielStart("farbenzug");
    await deUeberall(seite, `${name}, Farben-Zug`);
    for (let i = 0; i < 8; i += 1) {
      await warte(120);
      if ((await runden()).farbenzug) break;
      const bitte = await letztesEn("wagon, please!$");
      const m = /^An? ([a-z]+) wagon, please!$/.exec(bitte || "");
      if (!m) { fehlt(`${name}: der Farben-Zug sagt nicht «A … wagon, please!» (${bitte})`); break; }
      await tippe(seite, `.en-bild [data-farbe="${m[1]}"]`);
    }
    if ((await runden()).farbenzug !== 1) fehlt(`${name}: der Farben-Zug zählt keine Runde`);
    // Count with Rocco
    await spielStart("zaehlen");
    await deUeberall(seite, `${name}, Count with Rocco`);
    for (let i = 0; i < 8; i += 1) {
      await warte(150);
      if ((await runden()).zaehlen) break;
      const n = await seite.evaluate(() => document.querySelectorAll(".en-bild .en-zaehlding").length);
      if (!n) { fehlt(`${name}: Count with Rocco zeigt nichts zum Zählen`); break; }
      await tippe(seite, `.en-bild [data-zahl="${n}"]`);
      await warte(200);
    }
    if ((await runden()).zaehlen !== 1) fehlt(`${name}: Count with Rocco zählt keine Runde`);
    // Feed Rocco
    await spielStart("fuettern");
    await deUeberall(seite, `${name}, Feed Rocco`);
    for (let i = 0; i < 8; i += 1) {
      await warte(120);
      if ((await runden()).fuettern) break;
      const will = await letztesEn("^Rocco wants");
      const e = I.essen.find((x) => x.will[0] === will);
      if (!e) { fehlt(`${name}: Feed Rocco sagt nicht, was Rocco möchte (${will})`); break; }
      await tippe(seite, `.en-bild [data-essen="${e.id}"]`);
    }
    if ((await runden()).fuettern !== 1) fehlt(`${name}: Feed Rocco zählt keine Runde`);
    // Die Jukebox
    await insZimmer();
    await tippe(seite, '.en-bild [data-ort="jukebox"]');
    if ((await seite.locator(".en-wahl-kachel").count()) < 5) fehlt(`${name}: die Jukebox bietet keine fünf Verse an`);
    await tippe(seite, '.en-wahl-kachel[data-wahl="hello"]');
    await warte(300);
    if ((await ansicht(seite)) !== "verse") fehlt(`${name}: die Jukebox spielt keinen Vers`);
    if ((await runden()).verse !== 1) fehlt(`${name}: ein ganzer Vers zählt keine Runde`);
    await deUeberall(seite, `${name}, Jukebox`);
    // Ein Buch aus dem Lesewagen
    await insZimmer();
    await tippe(seite, '.en-bild [data-ort="regal"]');
    if (!(await seite.locator('.en-wahl-kachel[data-wahl="hase-rueebli"] img').count())) fehlt(`${name}: das Regal zeigt die Bücher nicht mit ihrem Umschlag`);
    await tippe(seite, '.en-wahl-kachel[data-wahl="hase-rueebli"]');
    await warte(300);
    if ((await ansicht(seite)) !== "buch") fehlt(`${name}: das Buch öffnet nicht`);
    const bild = await seite.evaluate(() => document.querySelector(".en-bild image")?.getAttribute("href"));
    if (!/bilder\/buecher\/hase-rueebli\/seite-01\.webp/.test(bild || "")) fehlt(`${name}: das Buch zeigt nicht das gemalte Bild (${bild})`);
    await tippe(seite, '.en-bild [data-blaettern="1"]');
    await warte(100);
    const zwei = await seite.evaluate(() => document.querySelector(".en-bild image")?.getAttribute("href"));
    if (!/seite-02/.test(zwei || "")) fehlt(`${name}: Weiterblättern geht nicht`);
    await deUeberall(seite, `${name}, Buch`);
    await tippe(seite, ".en-extra .en-go");
    await warte(400);
    if (!((await stand(seite)).geschichten["hase-rueebli"] >= 1)) fehlt(`${name}: das ganze Buch zählt nicht`);
    // Wörterbuch: Farben und Zahlen als Reiter.
    await insZimmer();
    await tippe(seite, '.en-bild [data-ort="buch"]');
    await tippe(seite, '.en-bild [data-reiter="farben"]');
    await warte(100);
    const farbSticker = await seite.locator(".en-bild [data-sticker]").count();
    if (farbSticker < I.farben.length) fehlt(`${name}: der Reiter Colors zeigt nicht alle Farben (${farbSticker})`);
    const st = await stand(seite);
    if (!I.farben.some((f) => ["erkannt", "sicher"].includes(st.woerter[f.id]?.e?.length ? "erkannt" : ""))) fehlt(`${name}: Rocco says und Farben-Zug machen keine Farbe «erkannt»`);

    // --- Etappe 3 ---------------------------------------------------------------
    const I3 = await seite.evaluate(() => {
      const x = window.LernappEnglischInhalt;
      if (!x.KLEIDER) return null;
      const w = (id) => x.WELTEN.flatMap((y) => y.woerter).concat(x.EXTRA_WOERTER).find((y) => y.id === id);
      return {
        kleider: x.KLEIDER,
        geschichten: x.GESCHICHTEN.map((g) => ({ id: g.id, bilder: g.bilder.map((b) => b.en) })),
        einzeln: x.DINER_ESSEN.map((id) => ({ id, satz: x.bitte(w(id).en) })),
        paare: x.DINER_PAARE.map(([p, q]) => ({ ids: [p, q], satz: x.dinerPaar(p, q)[0] })),
        woerter: x.WELTEN.flatMap((y) => y.woerter).map((y) => ({ id: y.id, en: y.en })),
      };
    });
    if (I3) {
      // What's missing?
      await spielStart("whatsmissing");
      for (let i = 0; i < 6; i += 1) {
        await seite.waitForFunction(() => { const g = document.querySelector(".en-bild .en-fehlt-wahl"); return g && g.style.display !== "none"; }, null, { timeout: 8000 }).catch(() => {});
        if ((await runden()).whatsmissing) break;
        const weg = await seite.evaluate(() => document.querySelector('.en-bild [data-ding][style*="none"]')?.dataset.ding);
        if (!weg) { fehlt(`${name}: What's missing? versteckt nichts`); break; }
        if (i === 0) await deUeberall(seite, `${name}, What's missing?`);
        await tippe(seite, `.en-bild [data-option="${weg}"]`);
        await warte(900);
      }
      if ((await runden()).whatsmissing !== 1) fehlt(`${name}: What's missing? zählt keine Runde`);
      // Dress up
      await spielStart("dressup");
      await deUeberall(seite, `${name}, Dress up`);
      for (let i = 0; i < 8; i += 1) {
        await warte(120);
        if ((await runden()).dressup) break;
        const auftrag = await letztesEn("^Put on the");
        const kleid = I3.kleider.find((x) => x.anziehen[0] === auftrag);
        if (!kleid) { fehlt(`${name}: Dress up sagt nicht «Put on the …!» (${auftrag})`); break; }
        await tippe(seite, `.en-bild [data-kleid="${kleid.id}"]`);
      }
      if ((await runden()).dressup !== 1) fehlt(`${name}: Dress up zählt keine Runde`);
      // Story train
      await spielStart("geschichtenzug");
      await deUeberall(seite, `${name}, Story train`);
      const falschesBild = await seite.evaluate(() => [...document.querySelectorAll(".en-bild [data-bild]")].map((k) => Number(k.dataset.bild)).find((i) => i !== 0));
      if (falschesBild !== undefined) {
        await gesagt(seite);
        await tippe(seite, `.en-bild [data-bild="${falschesBild}"]`);
        const g = await gesagt(seite);
        if (!g.some((x) => x.text === "What comes next?")) fehlt(`${name}: der Geschichtenzug sagt bei einem falschen Bild nicht «What comes next?»`);
      }
      for (let i = 0; i < 4; i += 1) { await tippe(seite, `.en-bild [data-bild="${i}"]`); await warte(120); }
      if ((await runden()).geschichtenzug !== 1) fehlt(`${name}: der Geschichtenzug zählt keine Runde`);
      // Diner
      await spielStart("diner");
      await deUeberall(seite, `${name}, Diner`);
      for (let i = 0; i < 8; i += 1) {
        await warte(150);
        if ((await runden()).diner) break;
        const satz = await letztesEn("please!$");
        const bestellung = I3.paare.find((x) => x.satz === satz)?.ids || [I3.einzeln.find((x) => x.satz === satz)?.id].filter(Boolean);
        if (!bestellung.length) { fehlt(`${name}: im Diner bestellt niemand (${satz})`); break; }
        for (const id of bestellung) { await tippe(seite, `.en-bild [data-essen="${id}"]`); await warte(60); }
      }
      if ((await runden()).diner !== 1) fehlt(`${name}: das Diner zählt keine Runde`);
      // Telefon
      await insZimmer();
      if (!(await seite.locator('.en-bild [data-ort="telefon"]').count())) fehlt(`${name}: im Zimmer hängt kein Telefon`);
      await tippe(seite, '.en-bild [data-ort="telefon"]');
      await tippe(seite, '.en-wahl-kachel[data-wahl="telefon"]');
      await warte(150);
      if ((await ansicht(seite)) !== "telefon") fehlt(`${name}: das Telefon klingelt nicht`);
      await deUeberall(seite, `${name}, Telefon`);
      for (let i = 0; i < 6; i += 1) {
        await seite.waitForFunction(() => document.querySelector(".en-bild [data-antwort]"), null, { timeout: 5000 }).catch(() => {});
        if ((await runden()).telefon) break;
        await tippe(seite, ".en-bild [data-antwort]");
        await warte(2300);
      }
      if ((await runden()).telefon !== 1) fehlt(`${name}: ein ganzes Telefongespräch zählt keine Runde`);
      if (!(await seite.evaluate(() => window.__alles.some((x) => x.text === "Now you say it!")))) fehlt(`${name}: am Telefon sagt Rocco nicht «Now you say it!»`);
      // Echo (im Test ohne Mikrofon)
      await insZimmer();
      await tippe(seite, '.en-bild [data-ort="telefon"]');
      await tippe(seite, '.en-wahl-kachel[data-wahl="echo"]');
      await warte(200);
      if ((await ansicht(seite)) !== "echo") fehlt(`${name}: Echo startet nicht`);
      await gesagt(seite);
      await tippe(seite, ".en-bild [data-mikrofon]");
      await warte(300);
      const mikro = await gesagt(seite);
      if (!mikro.length) fehlt(`${name}: das Mikrofon tut nichts`);
      for (let i = 0; i < 5; i += 1) { await tippe(seite, ".en-bild [data-weiter]"); await warte(120); }
      if ((await runden()).echo !== 1) fehlt(`${name}: Echo zählt keine Runde`);
      // Post aus Amerika
      await insZimmer();
      if (!(await seite.locator('.en-bild [data-ort="briefkasten"]').count())) fehlt(`${name}: im Zimmer steht kein Briefkasten`);
      await tippe(seite, '.en-bild [data-ort="briefkasten"]');
      await warte(200);
      if ((await ansicht(seite)) !== "post") fehlt(`${name}: der Briefkasten zeigt keine Post`);
      const karten = await seite.locator(".en-bild [data-karte]").count();
      if (karten < 2) fehlt(`${name}: nach vielen Runden ist nur ${karten} Postkarte da`);
      await deUeberall(seite, `${name}, Post`);
    }

    // --- Etappe 4 ---------------------------------------------------------------
    const I4 = await seite.evaluate(() => {
      const x = window.LernappEnglischInhalt;
      if (!x.MONSTER_TEILE) return null;
      return { teile: x.MONSTER_TEILE, farben: x.FARBEN.map((f) => ({ id: f.id, satz: x.monsterFarbe(f)[0] })), katze: x.WO_KATZE, gegen: x.GEGENTEILE.flatMap((g) => [0, 1].map((i) => ({ frage: x.gegenteilFrage(g, i)[0], i }))) };
    });
    if (I4) {
      // Make a monster
      await spielStart("monster");
      await deUeberall(seite, `${name}, Make a monster`);
      for (let i = 0; i < 6; i += 1) {
        await warte(150);
        if ((await runden()).monster) break;
        const auftrag = await letztesEn("^(Give the monster|Make the monster)");
        const f = I4.farben.find((x) => x.satz === auftrag);
        const t = I4.teile.find((x) => x.satz[0] === auftrag);
        if (f) await tippe(seite, `.en-bild [data-farbe="${f.id}"]`);
        else if (t) await tippe(seite, `.en-bild [data-zahl="${t.n}"]`);
        else { fehlt(`${name}: Make a monster gibt keinen Auftrag (${auftrag})`); break; }
      }
      if ((await runden()).monster !== 1) fehlt(`${name}: Make a monster zählt keine Runde`);
      // Where is the cat?
      await spielStart("wokatze");
      await deUeberall(seite, `${name}, Where is the cat?`);
      for (let i = 0; i < 7; i += 1) {
        await warte(150);
        if ((await runden()).wokatze) break;
        const satz = await letztesEn("^The cat is");
        const x = I4.katze.find((y) => y.satz[0] === satz);
        if (!x) { fehlt(`${name}: Where is the cat? sagt nicht, wo die Katze ist (${satz})`); break; }
        await tippe(seite, `.en-bild [data-bild="${x.wo}"]`);
      }
      if ((await runden()).wokatze !== 1) fehlt(`${name}: Where is the cat? zählt keine Runde`);
      // Opposites
      await spielStart("gegenteile");
      await deUeberall(seite, `${name}, Opposites`);
      for (let i = 0; i < 8; i += 1) {
        await warte(150);
        if ((await runden()).gegenteile) break;
        const frage = await letztesEn("^(Which one is|Where is the (day|night))");
        const x = I4.gegen.find((y) => y.frage === frage);
        if (!x) { fehlt(`${name}: Opposites fragt nicht (${frage})`); break; }
        await tippe(seite, `.en-bild [data-gegenteil="${x.i}"]`);
      }
      if ((await runden()).gegenteile !== 1) fehlt(`${name}: Opposites zählt keine Runde`);
      // Wortbild-Memory: die zweite Karte zeigt das Wort geschrieben.
      await spielStart("wortbild");
      const kartenW = await seite.evaluate(() => [...document.querySelectorAll(".en-bild [data-karte]")].map((k) => ({ i: k.dataset.karte, w: k.dataset.wort, art: k.dataset.art, text: k.querySelector(".en-karte-auf text")?.textContent || "" })));
      if (!kartenW.some((x) => x.art === "ton" && x.text)) fehlt(`${name}: Im Wortbild-Memory steht kein Wort auf den Karten`);
      for (const w of [...new Set(kartenW.map((x) => x.w))]) for (const kk of kartenW.filter((x) => x.w === w)) await tippe(seite, `.en-bild [data-karte="${kk.i}"]`);
      await warte(200);
      if ((await runden()).wortbild !== 1) fehlt(`${name}: das Wortbild-Memory zählt keine Runde`);
    }
    await kontext.close();
  }

  // --- Schrift: «Immer zeigen» --------------------------------------------------
  {
    const vorher = () => { localStorage.setItem("lernapp.englisch.eltern", JSON.stringify({ schrift: "an", at: Date.now() })); };
    const { kontext, seite } = await neueSeite(browser, { width: 1280, height: 800 }, seitenFehler, "Schrift", vorher);
    await seite.goto(`${BASIS}/index.html?englisch=1`);
    await seite.waitForFunction(() => window.LernappEnglischecke?.ansicht?.() === "zimmer", null, { timeout: 8000 }).catch(() => {});
    await warte(300);
    const text = await seite.locator(".en-text").textContent();
    if (!/Hello/.test(text || "")) fehlt(`Schrift: «Immer zeigen» zeigt den englischen Text nicht (${text})`);
    await kontext.close();
    const ohne = await neueSeite(browser, { width: 1280, height: 800 }, seitenFehler, "Ohne Schrift");
    await ohne.seite.goto(`${BASIS}/index.html?englisch=1`);
    await ohne.seite.waitForFunction(() => window.LernappEnglischecke?.ansicht?.() === "zimmer", null, { timeout: 8000 }).catch(() => {});
    await warte(300);
    const leer = await ohne.seite.locator(".en-text").textContent();
    if (leer) fehlt(`Schrift: ohne Einstellung steht auf Stufe «mittel» schon Text da (${leer})`);
    await ohne.kontext.close();
  }

  await browser.close();
  seitenFehler.forEach((f) => fehlt(`Fehler auf der Seite – ${f}`));
} catch (fehler) {
  fehlt(`Abbruch: ${fehler.message}`);
}
halt();
if (befunde.length) {
  console.error(`Die Englischecke stimmt im Browser nicht (${befunde.length}):\n${befunde.map((b) => `  - ${b}`).join("\n")}`);
  process.exit(1);
}
console.log("Die Englischecke stimmt im Browser: Startbild, Zimmer, Entdecken, Hear and find, Geschichte, Wörterbuch, Türen, Knopf DE und Schrift; Memory, Yes or no?, Rocco says, Farben-Zug, Count with Rocco, Feed Rocco, Jukebox und ein Buch; What's missing?, Dress up, Story train, Diner, Telefon, Echo und Post; Monster, Where is the cat?, Opposites und Wortbild-Memory – am Laptop und auf dem Handy.");
