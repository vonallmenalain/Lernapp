/*
 * Die Mini-Games im Browser: geht der Weg, den ein Fremder geht?
 * ---------------------------------------------------------------------------
 * validate-mini-games.mjs liest Dateien. Das hier spielt: Es öffnet
 * /mini-games/turmbau so, wie es jemand öffnet, dem der Link geschickt wurde,
 * spielt eine Runde zu Ende, trägt einen Namen ein und schaut nach, ob er in
 * der Liste steht. Danach dasselbe auf der Übersicht.
 *
 * Firestore wird dabei NICHT angefasst: firebase.js wird im Browser durch
 * eine Attrappe ersetzt, die dieselben Auskünfte gibt und die Einträge im
 * Speicher hält. Ein Prüfskript, das in die Produktionsdatenbank schreibt,
 * wäre ein Prüfskript, das man nicht laufen lässt.
 *
 * Geprüft wird dabei auch das Gegenstück: Die Seite derselben App
 * (turmbau.html) muss aussehen wie vorher – Haus, Rückweg, Runden für den
 * Wagen. Der Mini-Modus darf nur dort etwas ändern, wo er eingeschaltet ist.
 *
 * Aufruf:  node scripts/check-mini-games.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4191);
const BASIS = `http://127.0.0.1:${PORT}`;

const befunde = [];
const fehlt = (was) => befunde.push(was);
let geprueft = 0;
const pruefe = (bedingung, was) => { geprueft += 1; if (!bedingung) fehlt(was); };

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich der Weg nicht gehen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], { cwd: WURZEL, stdio: "ignore" });
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });

async function warteAufServer() {
  for (let versuch = 0; versuch < 50; versuch += 1) {
    try { if ((await fetch(`${BASIS}/index.html`)).ok) return true; } catch { /* noch nicht da */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}
if (!(await warteAufServer())) { console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`); process.exit(2); }

// ---------------------------------------------------------------------------
// Die Attrappe: firebase.js, ohne Firebase
// ---------------------------------------------------------------------------
// Sie gibt genau das, was die Mini-Games fragen, und merkt sich die Einträge
// im Speicher der Seite. Zwei Spiele sind freigegeben, und in einem steht
// schon jemand – sonst liesse sich "Platz 2" nicht prüfen.
const ATTRAPPE = `
(() => {
  const spiele = ["towerStack", "fishPond"];
  // Die Einträge überleben ein Neuladen der Seite: Ein echter Server vergisst
  // sie auch nicht, und "die zweite Runde zählt weiter" liesse sich sonst
  // nicht prüfen.
  const LAGER = "__mini_attrappe";
  const anfang = [
    ["towerStack_mini_vorherdagewesen", { id: "towerStack_mini_vorherdagewesen", game: "towerStack", spieler: "mini_vorherdagewesen", name: "Grosi", punkte: 99, versuche: 4, updatedAtMs: 1000 }],
    ["fishPond_mini_vorherdagewesen", { id: "fishPond_mini_vorherdagewesen", game: "fishPond", spieler: "mini_vorherdagewesen", name: "Grosi", punkte: 12, versuche: 2, updatedAtMs: 1000 }],
  ];
  let gemerkt = null;
  try { gemerkt = JSON.parse(localStorage.getItem(LAGER) || "null"); } catch { gemerkt = null; }
  const eintraege = new Map(Array.isArray(gemerkt) ? gemerkt : anfang);
  const sichern = () => { try { localStorage.setItem(LAGER, JSON.stringify([...eintraege])); } catch {} };
  window.__miniEintraege = eintraege;
  window.LernappFirebase = {
    isSignedIn: () => false,
    isAccountReady: () => true,
    isEntitlementLoaded: () => true,
    getEntitlement: () => null,
    getRole: () => null,
    getParentUid: () => null,
    getUser: () => null,
    getFreieSpiele: () => [],
    isFreieSpieleLoaded: () => true,
    getMiniSpiele: () => [...spiele],
    isMiniSpieleLoaded: () => true,
    miniErgebnisse: async () => [...eintraege.values()].map((e) => ({ ...e })),
    miniSpeichern: async ({ game, spieler, name, punkte }) => {
      const id = game + "_" + spieler;
      const alt = eintraege.get(id);
      if (!alt) {
        eintraege.set(id, { id, game, spieler, name, punkte, versuche: 1, updatedAtMs: Date.now() });
        sichern();
        return { rekord: true, punkte, versuche: 1 };
      }
      const rekord = punkte > alt.punkte;
      eintraege.set(id, { ...alt, name, punkte: rekord ? punkte : alt.punkte, versuche: alt.versuche + 1, updatedAtMs: Date.now() });
      sichern();
      return { rekord, punkte: rekord ? punkte : alt.punkte, versuche: alt.versuche + 1 };
    },
    saveGameState: () => {},
    getGameState: () => null,
    getTrainSettings: () => ({}),
    getWagonSet: () => ({ id: "1", switchedAtMs: 0 }),
    registerLevels: () => {},
  };
  document.dispatchEvent(new CustomEvent("lernapp:mini-spiele", { detail: { spiele } }));
})();
`;

// Normalerweise findet Playwright seinen Browser selbst. Wo eine fertige
// Chromium-Installation danebensteht – in manchen CI-Abbildern –, sagt
// CHROMIUM, wo sie liegt.
const browser = await playwright.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const fehlerAufSeite = [];

async function neueSeite() {
  const kontext = await browser.newContext({ viewport: { width: 420, height: 820 } });
  const seite = await kontext.newPage();
  await seite.route("**/firebase.js*", (route) => route.fulfill({ contentType: "text/javascript; charset=utf-8", body: ATTRAPPE }));
  // Das SDK von gstatic braucht hier niemand: firebase.js ist ersetzt. So
  // läuft die Prüfung auch ohne Netz – und ohne dass ein Ladefehler von
  // aussen als Befund erscheint.
  await seite.route("https://www.gstatic.com/firebasejs/**", (route) => route.fulfill({ contentType: "text/javascript; charset=utf-8", body: "/* in der Prüfung nicht gebraucht */" }));
  seite.on("pageerror", (fehler) => fehlerAufSeite.push(String(fehler.message || fehler)));
  seite.on("console", (nachricht) => { if (nachricht.type() === "error") fehlerAufSeite.push(nachricht.text()); });
  return { kontext, seite };
}

// Eine Runde Turmbau zu Ende spielen: tippen, bis die Tafel steht. Irgendwann
// trifft ein Block daneben – das ist das Ende der Runde, und genau darauf
// wartet der Block mit der Bestenliste.
async function spieleZuEnde(seite) {
  for (let tipp = 0; tipp < 120; tipp += 1) {
    if (await seite.locator(".cm-panel").count()) return true;
    await seite.mouse.click(210, 500);
    await seite.waitForTimeout(120);
  }
  return Boolean(await seite.locator(".cm-panel").count());
}

try {
  // --- 1. Das Mini-Game selbst ------------------------------------------------
  {
    const { kontext, seite } = await neueSeite();
    await seite.goto(`${BASIS}/mini-games/turmbau`, { waitUntil: "load" });
    await seite.waitForSelector(".cm-bar", { timeout: 8000 });

    const leiste = await seite.locator(".cm-bar-left").innerText();
    pruefe(leiste.includes("Zur App"), `Oben links fehlt "Zur App" (steht: ${JSON.stringify(leiste)}).`);
    pruefe(leiste.includes("Mini Games"), `Oben links fehlt "Mini Games" (steht: ${JSON.stringify(leiste)}).`);
    pruefe(await seite.locator(".cm-icon-home").count() === 0, "Das Haus führte auf ein Startbild, das dem Spieler nicht gehört – es darf hier nicht stehen.");
    pruefe(await seite.locator(".account-button:visible").count() === 0, "Der Konto-Knopf ist im Mini-Modus sichtbar – hier gibt es kein Konto.");
    pruefe(await seite.locator(".cm-icon-again").count() === 1, "Der Knopf zum Neustarten fehlt.");
    pruefe(await seite.getAttribute("body", "data-mini") === "1", "Am body fehlt data-mini.");
    const zurApp = await seite.getAttribute(".cm-bar-left a", "href");
    pruefe(zurApp === "/", `"Zur App" zeigt auf ${zurApp} statt auf /.`);

    // Das Fenster mit allen Mini-Games.
    await seite.click(".cm-bar-left button.mini-knopf");
    await seite.waitForSelector(".mini-fenster", { timeout: 4000 });
    const fenster = await seite.locator(".mini-tafel").innerText();
    pruefe(fenster.includes("Turmbau"), "Im Fenster fehlt Turmbau.");
    pruefe(fenster.includes("Fischteich"), "Im Fenster fehlt das zweite freigegebene Spiel.");
    pruefe(!fenster.includes("Memory"), "Im Fenster steht ein Spiel, das gar nicht freigegeben ist.");
    await seite.waitForSelector(".mini-fenster .mini-zeile", { timeout: 4000 });
    pruefe((await seite.locator(".mini-fenster .mini-zeile").first().innerText()).includes("Grosi"),
      "Im Fenster steht die bestehende Bestenliste nicht.");
    const spielen = await seite.getAttribute(".mini-tafel-aktionen a", "href");
    pruefe(spielen === "/mini-games/turmbau", `"Spielen" zeigt auf ${spielen} statt auf /mini-games/turmbau.`);
    await seite.keyboard.press("Escape");
    pruefe(await seite.locator(".mini-fenster").count() === 0, "Escape schliesst das Fenster nicht.");

    // Eine Runde, und danach der Name.
    pruefe(await spieleZuEnde(seite), "Die Runde kam nicht zu einem Ergebnis.");
    await seite.waitForSelector(".mini-ergebnis", { timeout: 4000 });
    pruefe(await seite.locator(".cm-scores").count() === 0, "Im Mini-Modus steht die eigene Fünferliste da – gemeint ist die Liste aller.");
    pruefe(await seite.locator(".cm-runs").count() === 0, "Im Mini-Modus steht der Satz über den Wagen da – hier gibt es keinen Wagen.");
    pruefe(await seite.locator(".mini-namensfeld input").count() === 1, "Ohne Namen fehlt das Namensfeld.");
    pruefe(await seite.locator(".cm-icon-cup").count() === 1, "Unter dem Ergebnis fehlt der Weg zu den anderen Mini-Games.");

    await seite.fill(".mini-namensfeld input", "Testkind");
    await seite.click(".mini-namensfeld button");
    await seite.waitForSelector(".mini-ergebnis .mini-zeile", { timeout: 5000 });
    const liste = await seite.locator(".mini-ergebnis").innerText();
    pruefe(liste.includes("Testkind"), `Der eingetragene Name steht nicht in der Liste:\n      ${liste.replace(/\n/g, " | ")}`);
    pruefe(liste.includes("Grosi"), "In der Liste fehlen die anderen Spieler.");
    pruefe(await seite.locator(".mini-zeile.ist-ich").count() === 1, "Die eigene Zeile ist nicht hervorgehoben.");
    const gemerkt = await seite.evaluate(() => localStorage.getItem("lernapp.mini.name"));
    pruefe(gemerkt === "Testkind", `Der Name wurde nicht auf dem Gerät gemerkt (steht: ${gemerkt}).`);
    const kennung = await seite.evaluate(() => localStorage.getItem("lernapp.mini.id"));
    pruefe(/^mini_[A-Za-z0-9_-]{8,48}$/.test(kennung || ""), `Die Kennung des Geräts sieht falsch aus: ${kennung}`);
    // Der eigene Bestwert wird gemerkt – sonst riefe das Spiel bei jedem
    // Neuladen "Neuer Rekord!", und der Ruf wäre nichts mehr wert.
    const best = await seite.evaluate(() => localStorage.getItem("lernapp.mini.best"));
    pruefe(/"towerStack":\s*\d+/.test(best || ""), `Der eigene Bestwert wurde nicht gemerkt (steht: ${best}).`);
    // Und die eigene Zeile steht in der Liste, auch wenn sie weit hinten liegt.
    pruefe(await seite.locator(".mini-ergebnis .mini-zeile.ist-ich").count() === 1,
      "Die eigene Zeile fehlt in der Liste – gerade der, der hinten steht, will wissen, wo er steht.");
    // Und nichts von der App angefasst: keine verbrauchte Schnupperrunde,
    // kein Spielstand im Speicher des Geräts.
    const reste = await seite.evaluate(() => ({
      runden: localStorage.getItem("lernapp.gratis.runden"),
      turmbau: localStorage.getItem("lernapp.turmbau"),
    }));

    pruefe(!reste.runden, `Die Runde hat eine Schnupperrunde der App verbraucht: ${reste.runden}`);
    pruefe(!reste.turmbau, `Die Runde hat in den Spielstand der App geschrieben: ${reste.turmbau}`);

    // Beim zweiten Mal steht der Name schon da und die Runde wird gleich
    // gemeldet – genau dafür merkt das Gerät ihn sich.
    await seite.reload({ waitUntil: "load" });
    await seite.waitForSelector(".cm-bar", { timeout: 8000 });
    pruefe(await spieleZuEnde(seite), "Die zweite Runde kam nicht zu einem Ergebnis.");
    await seite.waitForSelector(".mini-ergebnis .mini-zeile", { timeout: 6000 });
    pruefe(await seite.locator(".mini-namensfeld").count() === 0, "Beim zweiten Mal steht das Namensfeld wieder da.");
    pruefe((await seite.locator(".mini-name-steht").innerText()).includes("Testkind"), "Beim zweiten Mal fehlt der gemerkte Name.");
    const versuche = await seite.evaluate(() => [...window.__miniEintraege.values()].filter((e) => e.game === "towerStack" && e.name === "Testkind")[0]?.versuche);
    pruefe(versuche === 2, `Nach zwei Runden stehen ${versuche} Versuche in der Liste.`);

    await kontext.close();
  }

  // --- 2. Die Übersicht --------------------------------------------------------
  {
    const { kontext, seite } = await neueSeite();
    await seite.goto(`${BASIS}/mini-games`, { waitUntil: "load" });
    await seite.waitForSelector(".mini-karte", { timeout: 8000 });
    const text = await seite.locator(".mini-seite").innerText();
    pruefe(text.includes("Mini-Games"), "Auf der Übersicht steht nicht, wo man ist.");
    pruefe(await seite.locator(".mini-karte").count() === 2, `Auf der Übersicht stehen ${await seite.locator(".mini-karte").count()} Spiele statt zwei.`);
    pruefe(text.includes("Grosi"), "Auf der Übersicht fehlen die Spieler.");
    pruefe(await seite.locator(".mini-tabelle tbody tr").count() >= 1, "Die Auswertung der Spieler fehlt.");
    const kopfzeilen = await seite.locator(".mini-tabelle th").allInnerTexts();
    pruefe(kopfzeilen.some((z) => /rang/i.test(z)), `In der Auswertung fehlt der Durchschnittsrang (Spalten: ${kopfzeilen.join(", ")}).`);
    const zurApp = await seite.getAttribute(".mini-kopf a", "href");
    pruefe(zurApp === "/", `"Zur App" zeigt auf ${zurApp} statt auf /.`);
    const spielen = await seite.getAttribute(".mini-karte-aktionen a", "href");
    pruefe(spielen?.startsWith("/mini-games/"), `Ein Spiel-Link zeigt auf ${spielen}.`);
    pruefe(await seite.locator(".account-button:visible").count() === 0, "Auf der Übersicht steht der Konto-Knopf.");
    // Nichts darf seitwärts über den Rand stehen: Das Handy ist der Normalfall.
    const ueberstand = await seite.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    pruefe(ueberstand <= 1, `Die Übersicht steht ${ueberstand} px über den rechten Rand.`);
    await kontext.close();
  }

  // --- 3. Die App ist unverändert ---------------------------------------------
  {
    const { kontext, seite } = await neueSeite();
    await seite.goto(`${BASIS}/turmbau.html`, { waitUntil: "load" });
    await seite.waitForSelector(".cm-bar", { timeout: 8000 });
    pruefe(await seite.locator(".cm-icon-home").count() === 1, "In der App fehlt plötzlich das Haus.");
    pruefe(await seite.locator(".cm-icon-back").count() === 1, "In der App fehlt plötzlich der Rückweg.");
    pruefe(await seite.locator(".cm-bar-left .mini-knopf").count() === 0, "Die Mini-Knöpfe stehen in der App.");
    pruefe(await spieleZuEnde(seite), "In der App kam die Runde nicht zu einem Ergebnis.");
    pruefe(await seite.locator(".cm-scores").count() === 1, "In der App fehlt die eigene Bestenliste.");
    pruefe(await seite.locator(".mini-ergebnis").count() === 0, "In der App steht der Mini-Block unter dem Ergebnis.");
    const stand = await seite.evaluate(() => localStorage.getItem("lernapp.turmbau"));
    pruefe(Boolean(stand), "In der App wurde der Spielstand nicht gespeichert.");
    await kontext.close();
  }
} finally {
  await browser.close();
  halt();
}

if (fehlerAufSeite.length) {
  // Fehler im Browser sind immer ein Befund: Eine Seite, die in der Konsole
  // schreit, tut es auch beim Besucher.
  [...new Set(fehlerAufSeite)].forEach((text) => fehlt(`Fehler im Browser: ${text}`));
}

console.log(`${geprueft} Prüfungen im Browser.`);
if (befunde.length) {
  console.error(`\n${befunde.length} Befund${befunde.length === 1 ? "" : "e"}:`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Mini-Games tun, was sie sollen.");
