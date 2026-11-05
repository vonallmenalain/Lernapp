/*
 * Die Französischecke im Browser: Französischwagen, Bistro, Entdecken,
 * Écoute et trouve, Geschichte, Wörterbuch, Spielkorb, Tür – und der Knopf
 * DE überall.
 * ---------------------------------------------------------------------------
 *   Startbild   Der Französischwagen hängt ganz hinten am Lernzug (Schild
 *               «Bonjour»); ein Tipp führt hinein, Margot grüsst auf
 *               Französisch.
 *   Sprechen    Margot spricht Französisch mit den Aufnahmen aus
 *               stimme/franzoesisch/; DE sagt das Letzte auf Deutsch und
 *               danach noch einmal auf Französisch.
 *   Zimmer      Das Bistro hat alle Wege; Margot sitzt auf dem Stuhl.
 *   Entdecken   Erster Tipp das Wort mit Artikel («Une vache.»), zweiter der
 *               Satz; alle angetippt zählt eine Runde – im eigenen Stand, nicht
 *               in dem des Englischwagens.
 *   Écoute      Margot fragt «Où est … ?»; fünf gefunden zählt eine Runde.
 *   Geschichte  Margots Gemälde stehen von Anfang an da (keine Zeichnung blitzt
 *               auf), vier Bilder gehört zählt die Geschichte.
 *   Wörterbuch  Margot ist ihr eigener Sticker (gemalt), die übrigen sind die
 *               des Englischwagens.
 *   Spielkorb   Alle Spiele, ohne Diner und Post; «Oui ou non ?» spielt eine
 *               Runde.
 *   Schrift     «Immer zeigen» stellt den Text mit eingefärbten Artikeln dazu.
 *   Tür         Die Tür führt in den Englischwagen – dort ist wieder Rocco.
 *   Les fêtes   Die eigene Welt steht gemalt da, mit allen 13 Dingen.
 *   Handy       Quer auf dem Handy ragt nichts über den Rand.
 *
 * Aufruf:  node scripts/check-franzoesischecke.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4202);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich die Französischecke nicht prüfen."); process.exit(2); }

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
const ansicht = (seite) => seite.evaluate(() => window.LernappFranzoesischecke?.ansicht?.() || null);
const bisAnsicht = async (seite, ziel, ms = 3000) => {
  await seite.waitForFunction((z) => window.LernappFranzoesischecke?.ansicht?.() === z, ziel, { timeout: ms }).catch(() => {});
  return ansicht(seite);
};
const stand = (seite) => seite.evaluate(() => window.LernappFranzoesischStand.stand());
const tippe = async (seite, wahl) => { await seite.locator(wahl).first().dispatchEvent("click"); await warte(80); };

async function deUeberall(seite, wo) {
  const knopf = seite.locator(".en-de-knopf");
  if (!(await knopf.isVisible())) { fehlt(`${wo}: der Knopf DE ist nicht zu sehen`); return; }
  await warte(60);
  await gesagt(seite);
  await knopf.click();
  await warte(200);
  const g = await gesagt(seite);
  const ersterFr = g.findIndex((x) => x.sprache === "fr");
  if (ersterFr < 1 || g.slice(0, ersterFr).some((x) => x.sprache !== "de")) fehlt(`${wo}: DE sagt nicht zuerst Deutsch und dann Französisch (${JSON.stringify(g)})`);
}

try {
  if (!(await warteAufServer())) throw new Error("Der lokale Server startet nicht.");
  const browser = await playwright.chromium.launch();
  const seitenFehler = [];

  // --- Startbild → Französischwagen --------------------------------------------
  {
    const { kontext, seite } = await neueSeite(browser, { width: 1280, height: 800 }, seitenFehler, "Startbild");
    await seite.goto(`${BASIS}/index.html`);
    await seite.waitForFunction(() => window.LernappKids && window.LernappFranzoesischecke);
    await mitschreiben(seite);
    const knopf = seite.locator(".franzoesischwagen-knopf");
    await knopf.waitFor({ state: "visible", timeout: 8000 }).catch(() => fehlt("Startbild: kein Französischwagen"));
    const schild = await seite.evaluate(() => [...document.querySelectorAll(".franzoesischwagen-knopf text")].map((t) => t.textContent).join(" "));
    if (!/Bonjour/.test(schild)) fehlt(`Startbild: der Französischwagen trägt kein Schild «Bonjour» (${schild})`);
    await seite.waitForFunction(() => !document.querySelector(".train-stage")?.dataset.entering, null, { timeout: 8000 }).catch(() => {});
    await warte(400);
    await knopf.click({ force: true });
    await seite.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "franzoesisch", null, { timeout: 5000 }).catch(() => fehlt("Startbild: der Französischwagen führt nicht hinein"));
    await warte(500);
    if ((await ansicht(seite)) !== "zimmer") fehlt(`Französischwagen: zuerst nicht das Zimmer (${await ansicht(seite)})`);
    const g = await gesagt(seite);
    if (!g.some((x) => x.sprache === "fr" && /^Bonjour ! Je suis Margot/.test(x.text))) fehlt(`Französischwagen: Margot grüsst nicht auf Französisch (${JSON.stringify(g)})`);
    await seite.evaluate(() => { window.__gespielt = []; window.__echtSpeak("Une vache.", { sprache: "fr" }); });
    await warte(1200);
    const fr = await seite.evaluate(() => window.__gespielt.splice(0));
    if (!fr.some((src) => /\/stimme\/franzoesisch\/[0-9a-f]{12}\.mp3/.test(src))) fehlt(`Stimme: «Une vache.» spielt keine Aufnahme aus stimme/franzoesisch/ (${fr.join(", ") || "nichts"})`);
    // Zurück: und dann in den Englischwagen – dort ist Rocco.
    await seite.locator(".stage-back").click();
    await warte(500);
    if ((await seite.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) !== "home") fehlt("Französischwagen: Zurück führt nicht aufs Startbild");
    await kontext.close();
  }

  // --- Ein Durchgang ------------------------------------------------------------
  for (const [viewport, name] of [[{ width: 1280, height: 800 }, "Laptop"], [{ width: 844, height: 390 }, "Handy"]]) {
    const { kontext, seite } = await neueSeite(browser, viewport, seitenFehler, name);
    await seite.goto(`${BASIS}/index.html?franzoesisch=1`);
    await seite.waitForFunction(() => document.querySelector(".train-stage")?.dataset.view === "franzoesisch" && window.LernappFranzoesischecke?.ansicht?.() === "zimmer", null, { timeout: 8000 })
      .catch(() => fehlt(`${name}: ?franzoesisch=1 öffnet den Französischwagen nicht`));
    await mitschreiben(seite);
    await warte(300);
    await deUeberall(seite, `${name}, Zimmer`);
    for (const ort of ["tuer", "regal", "buch", "rocco", "karte", "kiste", "ausguck", "aufnaeher", "jukebox", "telefon"]) {
      if (!(await seite.locator(`.en-bild [data-ort="${ort}"]`).count())) fehlt(`${name}: im Bistro fehlt ${ort}`);
    }
    if (await seite.locator('.en-bild [data-ort="briefkasten"]').count()) fehlt(`${name}: im Bistro steht ein Briefkasten (die Post aus Amerika gehört in den Englischwagen)`);
    const margot = await seite.evaluate(() => document.querySelector('.en-bild [data-ort="rocco"]')?.innerHTML.includes("#b98552"));
    if (!margot) fehlt(`${name}: auf dem Stuhl sitzt nicht Margot`);
    const rand = await seite.evaluate(() => {
      const r = document.querySelector(".en-leiste").getBoundingClientRect();
      return { unten: r.bottom, rechts: r.right, breit: document.documentElement.scrollWidth, fenster: [innerWidth, innerHeight] };
    });
    if (rand.unten > rand.fenster[1] + 1 || rand.rechts > rand.fenster[0] + 1 || rand.breit > rand.fenster[0] + 1) fehlt(`${name}: die Leiste ragt über den Rand (${JSON.stringify(rand)})`);

    // Entdecken auf dem Bauernhof.
    await tippe(seite, '.en-bild [data-ort="ausguck"]');
    await warte(150);
    const weltenZahl = await seite.evaluate(() => window.LernappFranzoesischInhalt.WELTEN.length);
    if ((await seite.locator(".en-wahl-kachel").count()) !== weltenZahl) fehlt(`${name}: das Panoramafenster bietet nicht alle ${weltenZahl} Welten an`);
    await tippe(seite, '.en-wahl-kachel[data-wahl="farm"]');
    if ((await bisAnsicht(seite, "entdecken")) !== "entdecken") fehlt(`${name}: der Bauernhof öffnet nicht zum Entdecken`);
    await gesagt(seite);
    await tippe(seite, '.en-bild [data-ding="cow"]');
    let g = await gesagt(seite);
    if (!g.some((x) => x.sprache === "fr" && x.text === "Une vache.")) fehlt(`${name}: der erste Tipp auf die Kuh sagt nicht «Une vache.» (${JSON.stringify(g)})`);
    await tippe(seite, '.en-bild [data-ding="cow"]');
    g = await gesagt(seite);
    if (!g.some((x) => x.text === "La vache dit meuh.")) fehlt(`${name}: der zweite Tipp sagt nicht den Satz`);
    await seite.locator(".en-de-knopf").click();
    await warte(150);
    g = await gesagt(seite);
    if (JSON.stringify(g.map((x) => x.text)) !== JSON.stringify(["Die Kuh macht muh.", "La vache dit meuh."])) fehlt(`${name}: DE sagt nicht genau das Letzte auf Deutsch und dann Französisch (${JSON.stringify(g)})`);
    const farm = await seite.evaluate(() => window.LernappFranzoesischInhalt.WELTEN.find((w) => w.id === "farm").woerter.map((w) => w.id));
    for (const id of farm) await tippe(seite, `.en-bild [data-ding="${id}"]`);
    let st = await stand(seite);
    if (st.runden.entdecken !== 1) fehlt(`${name}: alle Dinge angetippt zählt keine Runde (${JSON.stringify(st.runden)})`);
    const englisch = await seite.evaluate(() => window.LernappEnglischStand.stand());
    if (englisch.woerter.cow || englisch.runden.entdecken) fehlt(`${name}: Der Französischwagen zählt im Stand des Englischwagens`);

    // Écoute et trouve.
    await seite.locator(".stage-back").click();
    await warte(200);
    await tippe(seite, '.en-bild [data-ort="kiste"]');
    if (await seite.locator('.en-wahl-kachel[data-wahl="hearfind"]').count()) await tippe(seite, '.en-wahl-kachel[data-wahl="hearfind"]');
    await tippe(seite, '.en-wahl-kachel[data-wahl="farm"]');
    await warte(300);
    if ((await bisAnsicht(seite, "hearfind")) !== "hearfind") fehlt(`${name}: der Spielkorb startet Écoute et trouve nicht`);
    for (let runde = 0; runde < 5; runde += 1) {
      await warte(150);
      const frage = await seite.evaluate(() => {
        const f = [...window.__alles].reverse().find((x) => x.sprache === "fr" && /^Où (est|sont)/.test(x.text));
        return f ? window.LernappFranzoesischInhalt.WELTEN[0].woerter.find((x) => x.frage === f.text)?.id || null : null;
      });
      if (!frage) { fehlt(`${name}: Écoute et trouve fragt nicht «Où est … ?» (Runde ${runde + 1})`); break; }
      await gesagt(seite);
      await tippe(seite, `.en-bild [data-ding="${frage}"]`);
      await warte(150);
    }
    await warte(200);
    st = await stand(seite);
    if (st.runden.hearfind !== 1) fehlt(`${name}: fünf gefunden zählt keine Runde (${JSON.stringify(st.runden)})`);

    // Eine Geschichte, mit Margot gemalt.
    await seite.locator(".stage-back").click();
    await warte(200);
    await tippe(seite, '.en-bild [data-ort="regal"]');
    await tippe(seite, '.en-wahl-kachel[data-wahl="ball"]');
    if ((await bisAnsicht(seite, "geschichte")) !== "geschichte") fehlt(`${name}: das Regal öffnet die Geschichte nicht`);
    {
      const b = await seite.evaluate(() => {
        const A = window.LernappFranzoesischArt;
        const bilder = A.gemaeldeVon("geschichte", "ball");
        return {
          bilder, geladen: bilder.length > 0 && A.istGeladen(bilder),
          margot: [...document.querySelectorAll(".en-bild .en-gemaelde")].map((e) => e.getAttribute("href")),
          ersatz: [...document.querySelectorAll(".en-bild .en-ersatz")].filter((e) => getComputedStyle(e).display !== "none").length,
        };
      });
      if (!b.geladen || b.margot.length !== 4 || !b.margot.every((h) => h.startsWith("bilder/franzoesisch/")) || b.ersatz) fehlt(`${name}: die Geschichte steht nicht gemalt mit Margot da (${JSON.stringify(b)})`);
    }
    await gesagt(seite);
    for (let i = 0; i < 4; i += 1) { await tippe(seite, `.en-bild [data-panel="${i}"]`); await warte(120); }
    g = await gesagt(seite);
    if (!g.some((x) => x.sprache === "fr" && /^Voici Margot/.test(x.text))) fehlt(`${name}: die Geschichte erzählt nicht auf Französisch (${JSON.stringify(g.slice(0, 2))})`);
    st = await stand(seite);
    if (st.geschichten.ball !== 1) fehlt(`${name}: alle vier Bilder gehört zählt die Geschichte nicht`);
    await deUeberall(seite, `${name}, Geschichte`);

    // Das Wörterbuch: Margot ist ihr eigener Sticker.
    await seite.locator(".stage-back").click();
    await warte(200);
    await seite.evaluate(() => window.LernappFranzoesischStand.gehoert("raccoon"));
    await tippe(seite, '.en-bild [data-ort="buch"]');
    await warte(500);
    const sticker = await seite.evaluate(() => [...document.querySelectorAll(".en-bild .en-gemaelde")].map((e) => e.getAttribute("href")));
    if (!sticker.some((h) => /sticker-margot\.webp/.test(h))) fehlt(`${name}: im Wörterbuch fehlt Margots Sticker`);
    if (sticker.some((h) => /sticker\/raccoon\.webp/.test(h))) fehlt(`${name}: im Wörterbuch steht Roccos Sticker`);
    await deUeberall(seite, `${name}, Wörterbuch`);

    // Der Spielkorb: alle Spiele, und «Oui ou non ?» eine Runde.
    await seite.locator(".stage-back").click();
    await warte(200);
    await tippe(seite, '.en-bild [data-ort="kiste"]');
    await warte(200);
    const spiele = await seite.evaluate(() => [...document.querySelectorAll(".en-wahl-kachel")].map((k) => k.dataset.wahl));
    const erwartet = await seite.evaluate(() => window.LernappFranzoesischInhalt.SPIELE.map((s) => s.id));
    if (erwartet.some((id) => !spiele.includes(id)) || spiele.includes("diner")) fehlt(`${name}: der Spielkorb zeigt nicht alle Spiele (${spiele.join(", ")})`);
    await tippe(seite, '.en-wahl-kachel[data-wahl="janein"]');
    await warte(400);
    if ((await ansicht(seite)) !== "janein") fehlt(`${name}: «Oui ou non ?» startet nicht (${await ansicht(seite)})`);
    g = await seite.evaluate(() => window.__alles.filter((x) => x.sprache === "fr").map((x) => x.text));
    if (!g.some((t) => /^(C'est|Ce sont) .+ \?$/.test(t))) fehlt(`${name}: «Oui ou non ?» fragt nicht «C'est … ?» (${g.slice(-3).join(" | ")})`);

    // Schrift: «Immer zeigen» – eingefärbte Artikel, kein Umbruch vor «?».
    await seite.evaluate(() => { localStorage.setItem("lernapp.franzoesisch.eltern", JSON.stringify({ schrift: "an", tempo: "normal", at: Date.now() })); });
    await seite.goto(`${BASIS}/index.html?franzoesisch=1`);
    await seite.waitForFunction(() => window.LernappFranzoesischecke?.ansicht?.() === "zimmer", null, { timeout: 8000 }).catch(() => fehlt(`${name}: der Französischwagen geht nach dem Neuladen nicht auf`));
    await mitschreiben(seite);
    await tippe(seite, '.en-bild [data-ort="ausguck"]');
    await tippe(seite, '.en-wahl-kachel[data-wahl="farm"]');
    await bisAnsicht(seite, "entdecken");
    await tippe(seite, '.en-bild [data-ding="sheep"]');
    await warte(150);
    const text = await seite.evaluate(() => document.querySelector(".en-text")?.innerHTML || "");
    if (!/<span class="fr-le">Un<\/span> mouton\./.test(text)) fehlt(`${name}: die Schrift färbt den Artikel nicht ein (${text})`);

    // Die Tür: in den Englischwagen, dort wieder Rocco.
    await seite.locator(".stage-back").click();
    await warte(200);
    await tippe(seite, '.en-bild [data-ort="tuer"]');
    await warte(900);
    const drueben = await seite.evaluate(() => ({ view: document.querySelector(".train-stage")?.dataset.view, rocco: window.LernappEnglischArt.rocco("steh", "froh").includes("#9aa0ab") }));
    if (drueben.view !== "englisch" || !drueben.rocco) fehlt(`${name}: die Tür führt nicht in den Englischwagen zu Rocco (${JSON.stringify(drueben)})`);
    await kontext.close();
  }

  // --- Les fêtes: die eigene Welt, gemalt ----------------------------------------
  {
    const { kontext, seite } = await neueSeite(browser, { width: 1280, height: 800 }, seitenFehler, "Les fêtes");
    await seite.goto(`${BASIS}/index.html?franzoesisch=1`);
    await seite.waitForFunction(() => window.LernappFranzoesischecke?.ansicht?.() === "zimmer", null, { timeout: 8000 }).catch(() => fehlt("Les fêtes: der Französischwagen geht nicht auf"));
    await mitschreiben(seite);
    await tippe(seite, '.en-bild [data-ort="ausguck"]');
    await tippe(seite, '.en-wahl-kachel[data-wahl="fetes"]');
    if ((await bisAnsicht(seite, "entdecken")) !== "entdecken") fehlt("Les fêtes: die Welt geht nicht auf");
    const b = await seite.evaluate(() => {
      const A = window.LernappFranzoesischArt;
      const bilder = A.gemaeldeVon("welt", "fetes");
      return { geladen: bilder.length === 1 && A.istGeladen(bilder), dinge: document.querySelectorAll(".en-bild [data-ding]").length };
    });
    if (!b.geladen || b.dinge !== 13) fehlt(`Les fêtes: nicht gemalt oder nicht alle 13 Dinge (${JSON.stringify(b)})`);
    await gesagt(seite);
    await tippe(seite, '.en-bild [data-ding="santa"]');
    const g = await gesagt(seite);
    if (!g.some((x) => x.sprache === "fr" && x.text === "Le Père Noël.")) fehlt(`Les fêtes: der Père Noël sagt sich nicht (${JSON.stringify(g)})`);
    await kontext.close();
  }

  await browser.close();
  if (seitenFehler.length) fehlt(`Fehler auf der Seite: ${[...new Set(seitenFehler)].join(" | ")}`);
} catch (e) {
  fehlt(`Abbruch: ${e.message}`);
}
halt();
if (befunde.length) {
  console.error(`Die Französischecke im Browser stimmt nicht (${befunde.length}):\n${befunde.map((b) => `  - ${b}`).join("\n")}`);
  process.exit(1);
}
console.log("Die Französischecke im Browser stimmt: Startbild, Bistro, Entdecken, Écoute et trouve, Geschichte mit Margot, Wörterbuch, Spielkorb, Schrift, Tür, DE überall.");
