/*
 * Das Startbild mit zwei Gleisen, im Browser.
 * ---------------------------------------------------------------------------
 *   Zwei Züge   Unten der Gripszug, oben der Lernzug mit Lernlok, Lese-,
 *               Rechen- und Englischwagen – auf vier Bildschirmen. Die Lernwagen sind so
 *               breit wie die Wagen des Gripszugs (gleicher Massstab), stehen
 *               auf einem Gleis, ganz im Bild, über dem Gripszug, und keiner
 *               deckt einen anderen Knopf zu.
 *   Bauen       Ohne Runde steht der Lesewagen als Fahrgestell da – aber mit
 *               Schild und Maskottchen (ABC, 123, Hello). Mit Runden wächst er; bei 15 Schritten
 *               hat er goldene Räder.
 *   Feier       Ist ein Lernwagen seit dem letzten Blick gewachsen, feiert das
 *               Startbild das (einmal).
 *   Gruppe      Ohne Gruppe kein Knopf. Mit Gruppe steht er ganz rechts, zeigt
 *               die Zahl der anderen und einen Punkt, wenn jemand
 *               weitergekommen ist; die Liste zeigt beide Züge je Kind, und ein
 *               Tipp auf ein Kind öffnet seinen Zug. Danach ist der Punkt weg.
 *   Lernlok     fährt in den Wagen, in dem das Kind zuletzt war.
 *
 * Aufruf:  node scripts/check-startbild.mjs
 * Nötig:   Playwright. Der lokale Server wird selbst gestartet und beendet.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4231);
const BASIS = `http://127.0.0.1:${PORT}`;

let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { console.error("Playwright fehlt – ohne Browser lässt sich das Startbild nicht prüfen."); process.exit(2); }

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

// Eine Gruppe mit zwei anderen Kindern. Mia liest viel.
const GRUPPE = [
  { id: "u-mia", name: "Mia", eigen: false, loco: null, solved: [], levels: [],
    gameState: { "lernapp.lesen": { data: { spiele: { silbenzug: { runden: 12 } } }, updatedAt: 1 } } },
  { id: "u-ben", name: "Ben", eigen: true, loco: null, gameState: {}, solved: [], levels: [] },
  { id: "u-lea", name: "Lea", eigen: false, loco: null, gameState: {}, solved: [], levels: [] },
];

async function neueSeite(browser, viewport, vorher = null) {
  const kontext = await browser.newContext({ viewport });
  await kontext.route("**/*gstatic.com/**", (route) => route.abort());
  if (vorher) await kontext.addInitScript(vorher.fn, vorher.arg);
  const seite = await kontext.newPage();
  const fehler = [];
  seite.on("pageerror", (e) => fehler.push(e.message));
  await seite.goto(`${BASIS}/index.html`);
  await seite.waitForTimeout(900);
  await seite.mouse.click(4, viewport.height - 4);
  await seite.waitForTimeout(3200);
  return { kontext, seite, fehler };
}

const masse = (seite) => seite.evaluate(() => {
  const box = (e) => { if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return b.width ? { x: b.left, y: b.top, w: b.width, h: b.height, r: b.right, u: b.bottom } : null; };
  const wagen = [...document.querySelectorAll(".train-band [data-area]")].map((g) => box(g)).filter(Boolean);
  return {
    vw: innerWidth, vh: innerHeight,
    lesen: box(document.querySelector(".lesewagen-knopf")),
    rechnen: box(document.querySelector(".rechenwagen-knopf")),
    englisch: box(document.querySelector(".englischwagen-knopf")),
    franzoesisch: box(document.querySelector(".franzoesischwagen-knopf")),
    lok: box(document.querySelector(".lernlok-knopf")),
    // Ohne das Wippen beim ersten Start gemessen: das hebt die Wagen kurz an.
    gripsWagen: wagen,
    gripsLok: box(document.querySelector(".train-band [data-loco]")),
    gruppe: box(document.querySelector(".gruppe-knopf:not([hidden])")),
    platziert: [...document.querySelectorAll(".lernzug-knopf")].map((k) => k.dataset.placed).join(""),
    knoepfe: [...document.querySelectorAll(".train-stage button, .train-stage [role=button]")]
      .filter((b) => !b.hidden && b.getClientRects().length && getComputedStyle(b).visibility !== "hidden" && Number(getComputedStyle(b).opacity) > 0.05 && b.dataset.placed !== "0")
      .map((b) => ({ name: String(b.getAttribute("class") || b.tagName).slice(0, 40), lern: b.classList.contains("lernzug-knopf"), ...box(b) })).filter((b) => b.w),
  };
});
const ueberlappen = (a, b, rand = 2) => a.x < b.x + b.w - rand && b.x < a.x + a.w - rand && a.y < b.y + b.h - rand && b.y < a.y + a.h - rand;

async function main() {
  if (!(await warteAufServer())) { console.error("Der lokale Server startet nicht."); process.exit(2); }
  const browser = await playwright.chromium.launch();
  try {
    // --- Zwei Züge auf vier Bildschirmen, ohne Gruppe ------------------------
    for (const [name, viewport] of [["Laptop", { width: 1280, height: 800 }], ["Tablet quer", { width: 1024, height: 768 }], ["Tablet hoch", { width: 768, height: 1024 }], ["Handy quer", { width: 844, height: 390 }]]) {
      const { kontext, seite, fehler } = await neueSeite(browser, viewport);
      await seite.waitForTimeout(6000);
      const m = await masse(seite);
      if (!m.lesen || !m.rechnen || !m.englisch || !m.franzoesisch || !m.lok || m.platziert !== "11111") fehlt(`${name}: Der Lernzug steht nicht ganz da (${m.platziert})`);
      else {
        const gripsBreite = m.gripsWagen[0]?.w || 0;
        // Gleich gross wie der Gripszug – ausser er muss vor dessen Lok halten
        // (vier Lernwagen und die Lernlok sind fast so lang wie der
        // Gripszug): dann höchstens ein Zehntel kleiner.
        const vorDerLok = m.gripsLok && m.lok.r <= m.gripsLok.x + 1;
        const gleichGross = (w) => Math.abs(w - gripsBreite) <= Math.max(3, gripsBreite * 0.04) || (vorDerLok && w < gripsBreite && w >= gripsBreite * 0.9);
        if (!gleichGross(m.lesen.w)) fehlt(`${name}: Der Lesewagen ist ${Math.round(m.lesen.w)} breit, ein Wagen des Gripszugs ${Math.round(gripsBreite)}`);
        if (!gleichGross(m.englisch.w)) fehlt(`${name}: Der Englischwagen ist ${Math.round(m.englisch.w)} breit, ein Wagen des Gripszugs ${Math.round(gripsBreite)}`);
        if (m.gripsLok && m.lok.r > m.gripsLok.x + 1) fehlt(`${name}: Die Lernlok reicht über die Lok des Gripszugs`);
        if (Math.abs(m.franzoesisch.w - m.englisch.w) > 1) fehlt(`${name}: Der Französischwagen ist anders breit als der Englischwagen`);
        if ([m.rechnen, m.englisch, m.franzoesisch, m.lok].some((t) => Math.abs(m.lesen.u - t.u) > 2)) fehlt(`${name}: Lernlok, Lese-, Rechen-, Englisch- und Französischwagen stehen nicht auf demselben Gleis`);
        if (!(m.franzoesisch.r <= m.englisch.x + 1 && m.englisch.r <= m.rechnen.x + 1 && m.rechnen.r <= m.lesen.x + 1 && m.lesen.r <= m.lok.x + 1)) fehlt(`${name}: Die Reihenfolge stimmt nicht (Französischwagen, Englischwagen, Rechenwagen, Lesewagen, Lok)`);
        const gripsOben = Math.min(...m.gripsWagen.map((w) => w.y));
        if (m.lesen.u > gripsOben + 2) fehlt(`${name}: Der Lernzug steht nicht über dem Gripszug`);
        for (const teil of [m.lesen, m.rechnen, m.englisch, m.franzoesisch, m.lok]) if (teil.x < 0 || teil.y < 0 || teil.r > m.vw + 1 || teil.u > m.vh) fehlt(`${name}: Der Lernzug ragt aus dem Bild`);
        for (const k of m.knoepfe.filter((b) => b.lern)) {
          for (const anderer of m.knoepfe.filter((b) => !b.lern)) if (ueberlappen(k, anderer)) fehlt(`${name}: ${k.name} deckt ${anderer.name} zu`);
        }
        if (m.gruppe) fehlt(`${name}: Ohne Gruppe steht ein Knopf für die Gruppe da`);
      }
      // Ohne Runde: ein Fahrgestell mit Schild und Maskottchen.
      const nackt = await seite.evaluate(() => {
        const w = document.querySelector('.lesewagen-knopf [data-lernwagen="lesen"]');
        return { stufe: w?.dataset.stufe, schild: w?.querySelector(".lernwagen-schild text")?.textContent, tier: Boolean(w?.querySelector(".lernwagen-tier")), rechenSchild: document.querySelector('.rechenwagen-knopf .lernwagen-schild text')?.textContent, englischSchild: document.querySelector('.englischwagen-knopf .lernwagen-schild text')?.textContent, franzSchild: document.querySelector('.franzoesischwagen-knopf .lernwagen-schild text')?.textContent };
      });
      if (nackt.stufe !== "0" || nackt.schild !== "ABC" || !nackt.tier || nackt.rechenSchild !== "123" || nackt.englischSchild !== "Hello" || nackt.franzSchild !== "Bonjour") fehlt(`${name}: Ohne Runde fehlt am Fahrgestell Schild oder Maskottchen (${JSON.stringify(nackt)})`);
      if (fehler.length) fehlt(`${name}: Fehler auf der Seite: ${fehler.join(" | ")}`);
      await kontext.close();
    }

    // --- Bauen und Feier --------------------------------------------------------
    {
      const vorher = {
        arg: null,
        // Nur beim ersten Laden – addInitScript läuft auch beim Neuladen.
        fn: () => {
          if (sessionStorage.getItem("pruefung-gesetzt")) return;
          sessionStorage.setItem("pruefung-gesetzt", "1");
          localStorage.setItem("lernapp.lesen", JSON.stringify({ spiele: { silbenzug: { runden: 60 } }, buecher: {} }));
          localStorage.setItem("lernapp.lernzug.gesehen", JSON.stringify({ lesen: 13, rechnen: 0 }));
        },
      };
      const { kontext, seite, fehler } = await neueSeite(browser, { width: 1280, height: 800 }, vorher);
      await seite.waitForTimeout(1200);
      const feier = await seite.evaluate(() => ({
        da: Boolean(document.querySelector(".lernwagen-reward")),
        titel: document.querySelector(".lernwagen-reward .wagon-reward-title")?.textContent,
        stufe: document.querySelector(".lesewagen-knopf [data-lernwagen]")?.dataset.stufe,
        gold: document.querySelector(".lesewagen-knopf .lernwagen.is-complete") !== null,
      }));
      if (!feier.da || feier.titel !== "Der Lesewagen") fehlt(`Feier: Der gewachsene Lesewagen wird nicht gefeiert (${JSON.stringify(feier)})`);
      if (feier.stufe !== "15" || !feier.gold) fehlt(`Bauen: Nach 60 Runden ist der Lesewagen nicht fertig (${feier.stufe})`);
      await seite.waitForTimeout(4500);
      await seite.mouse.click(640, 400);
      await seite.waitForTimeout(500);
      await seite.reload();
      await seite.waitForTimeout(900);
      await seite.mouse.click(4, 796);
      await seite.waitForTimeout(4200);
      if (await seite.$(".lernwagen-reward")) fehlt("Feier: Derselbe Schritt wird ein zweites Mal gefeiert");
      if (fehler.length) fehlt(`Feier: Fehler auf der Seite: ${fehler.join(" | ")}`);
      await kontext.close();
    }

    // --- Die Gruppe ---------------------------------------------------------------
    for (const [name, viewport] of [["Laptop", { width: 1280, height: 800 }], ["Handy quer", { width: 844, height: 390 }]]) {
      const vorher = { arg: null, fn: () => localStorage.setItem("lernapp.gruppe.gesehen", JSON.stringify({ "u-mia": 1, "u-lea": 0 })) };
      const { kontext, seite, fehler } = await neueSeite(browser, viewport, vorher);
      await seite.evaluate((gruppe) => {
        window.LernappFirebase = window.LernappFirebase || {};
        window.LernappFirebase.getGroup = () => ({ id: "pruefung", name: "Prüfung", displayName: "Ben" });
        window.LernappFirebase.loadGroupMembers = async () => gruppe;
        window.LernappFirebase.loadGroupTrains = async () => gruppe.filter((eintrag) => !eintrag.eigen);
        document.dispatchEvent(new CustomEvent("lernapp:group-changed", { detail: { id: "pruefung" } }));
      }, GRUPPE);
      await seite.waitForTimeout(900);
      const m = await masse(seite);
      const knopf = await seite.evaluate(() => {
        const k = document.querySelector(".gruppe-knopf");
        return { zahl: k?.querySelector(".gruppe-knopf-zahl")?.textContent, neu: k?.dataset.neu, placed: k?.dataset.placed };
      });
      if (!m.gruppe || knopf.placed !== "1") fehlt(`Gruppe ${name}: Der Knopf steht nicht da`);
      else {
        if (m.gruppe.r < m.vw - 40) fehlt(`Gruppe ${name}: Der Knopf steht nicht ganz rechts`);
        if (m.lok && (m.gruppe.y > m.lok.u || m.gruppe.u < m.lok.y - m.lok.h)) fehlt(`Gruppe ${name}: Der Knopf steht nicht auf der Höhe der Züge`);
        for (const anderer of m.knoepfe.filter((b) => !/gruppe-knopf/.test(b.name))) if (ueberlappen(m.gruppe, anderer)) fehlt(`Gruppe ${name}: Der Knopf deckt ${anderer.name} zu`);
        if (knopf.zahl !== "2") fehlt(`Gruppe ${name}: Am Knopf steht ${knopf.zahl} statt 2`);
        if (knopf.neu !== "1") fehlt(`Gruppe ${name}: Mia ist weitergekommen, aber am Knopf ist kein Punkt`);
      }
      if (await seite.$(".train-stage > .friend-train, .train-friends")) fehlt(`Gruppe ${name}: Auf der Bühne stehen noch fremde Züge`);
      await seite.click(".gruppe-knopf");
      await seite.waitForTimeout(500);
      const liste = await seite.evaluate(() => ({
        zeilen: [...document.querySelectorAll(".gruppe-liste .friend-train")].map((z) => z.dataset.friend),
        neu: [...document.querySelectorAll(".gruppe-liste .friend-train.is-neu")].map((z) => z.dataset.friend),
        lernzuege: document.querySelectorAll(".gruppe-liste .gruppe-lernzug").length,
        miaLesen: document.querySelector('.gruppe-liste [data-friend="u-mia"] .gruppe-lernzug [data-lernwagen="lesen"]')?.dataset.stufe,
        punkt: document.querySelector(".gruppe-knopf")?.dataset.neu,
      }));
      if (liste.zeilen.join(",") !== "u-mia,u-lea") fehlt(`Gruppe ${name}: In der Liste stehen ${liste.zeilen.join(",")}`);
      if (liste.neu.join(",") !== "u-mia") fehlt(`Gruppe ${name}: Als weitergekommen markiert: ${liste.neu.join(",")}`);
      if (liste.lernzuege !== 2 || liste.miaLesen !== "6") fehlt(`Gruppe ${name}: Die Lernzüge der anderen stimmen nicht (${liste.lernzuege}, Mia ${liste.miaLesen})`);
      if (liste.punkt !== "0") fehlt(`Gruppe ${name}: Nach dem Öffnen bleibt der Punkt`);
      await seite.click('.gruppe-liste [data-friend="u-mia"]');
      await seite.waitForTimeout(800);
      const ansicht = await seite.evaluate(() => ({ view: document.querySelector(".train-stage")?.dataset.view, liste: Boolean(document.querySelector(".gruppe-liste")) }));
      if (ansicht.view !== "friend" || ansicht.liste) fehlt(`Gruppe ${name}: Ein Tipp auf Mia öffnet ihren Zug nicht (${JSON.stringify(ansicht)})`);
      if (fehler.length) fehlt(`Gruppe ${name}: Fehler auf der Seite: ${fehler.join(" | ")}`);
      await kontext.close();
    }

    // --- Die Lernlok -------------------------------------------------------------
    {
      const vorher = { arg: null, fn: () => localStorage.setItem("lernapp.lernzug.zuletzt", "rechnen") };
      const { kontext, seite } = await neueSeite(browser, { width: 1280, height: 800 }, vorher);
      if ((await seite.evaluate(() => document.querySelector(".lernlok-knopf")?.dataset.fahrer)) !== "rechnen") fehlt("Lernlok: Im Führerhaus sitzt nicht der Drache, obwohl das Kind zuletzt im Rechenwagen war");
      await seite.click(".lernlok-knopf");
      await seite.waitForTimeout(1500);
      if ((await seite.evaluate(() => document.querySelector(".train-stage")?.dataset.view)) !== "rechnen") fehlt("Lernlok: Ein Tipp fährt nicht in den Rechenwagen");
      await kontext.close();
    }
  } finally {
    await browser.close();
    halt();
  }
  if (befunde.length) {
    console.error(`Das Startbild stimmt nicht:\n  - ${befunde.join("\n  - ")}`);
    process.exit(1);
  }
  console.log("Startbild geprüft: Gripszug und Lernzug gleich gross auf vier Bildschirmen, nichts verdeckt, Lernwagen mit Schild ab dem Fahrgestell, wachsen bis zu goldenen Rädern, Feier einmal, Gruppe hinter dem Knopf mit Punkt, Liste mit beiden Zügen, Lernlok fährt in den letzten Wagen.");
}

main().catch((e) => { console.error(e); halt(); process.exit(1); });
