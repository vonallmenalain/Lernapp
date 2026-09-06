/*
 * Passt alles aufs Handy?
 * ---------------------------------------------------------------------------
 * Die App läuft im Querformat auf Handys, und dort darf nichts scrollen: kein
 * Bildschirm, kein Kasten darin, und kein Knopf darf halb unter dem Rand
 * liegen. Ob das stimmt, entscheidet sich erst im Browser – eine Regel weiter
 * unten im Stylesheet kann eine weiter oben aufheben, ein Titel kann auf einem
 * schmalen Gerät über einen Knopf laufen. Deshalb fährt diese Prüfung jede
 * Seite in mehreren Handy-Grössen wirklich an, tippt sich Bildschirm um
 * Bildschirm hinein und misst.
 *
 * Gemessen wird je Bildschirm:
 *   - scrollt die Seite selbst (Dokument höher oder breiter als das Fenster)?
 *   - gibt es einen Kasten mit Rollbalken (overflow: auto, Inhalt zu gross)?
 *   - liegt ein Knopf halb ausserhalb des Fensters?
 *   - überlappen sich zwei Knöpfe oder der Titel und ein Knopf?
 *
 * Aufruf:  node scripts/check-handy.mjs [--bilder ORDNER] [--nur SEITE,...]
 *                                        [--geraete NAME,...]
 *   --bilder   legt je Bildschirm ein Bildschirmfoto ab
 *   --nur      nur diese Seiten (z. B. index,memory)
 *   --geraete  nur diese Gerätegrössen (z. B. handy-klein)
 *
 * Nötig:   Playwright (npm i -D playwright). Fehlt es, sagt das Skript das und
 *          hört auf. Der lokale Server wird selbst gestartet und beendet.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4181);
const BASIS = `http://127.0.0.1:${PORT}`;

// --- Aufrufparameter ---------------------------------------------------------
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}
const BILDER = option("--bilder");
const NUR = option("--nur")?.split(",").map((s) => s.trim()).filter(Boolean) || null;
const GERAETE_WAHL = option("--geraete")?.split(",").map((s) => s.trim()).filter(Boolean) || null;

// Die Handys, auf denen es passen muss. Alle quer: hochkant zeigt die App nur
// den Dreh-Hinweis. Die kleinste Grösse ist ein altes Android-Handy, die
// flachste dasselbe Handy im Browser mit Adressleiste.
const GERAETE = [
  { name: "handy-klein", width: 640, height: 360 },
  { name: "handy-browser", width: 700, height: 320 },
  { name: "handy-lang", width: 800, height: 360 },
  { name: "iphone", width: 844, height: 390 },
  { name: "pixel", width: 914, height: 412 },
  { name: "tablet", width: 1024, height: 768 },
].filter((geraet) => !GERAETE_WAHL || GERAETE_WAHL.includes(geraet.name));

// Im Browser ausgeführt: was passt nicht?
function messen() {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const beschreibe = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const klasse = typeof el.className === "string" && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
      : (el.getAttribute("class") ? `.${String(el.getAttribute("class")).trim().split(/\s+/)[0]}` : "");
    const label = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 24) || "";
    return `${el.tagName.toLowerCase()}${id}${klasse}${label ? ` „${label}“` : ""}`;
  };
  const sichtbar = (el) => {
    if (el.closest("[hidden]")) return false;
    const stil = getComputedStyle(el);
    if (stil.display === "none" || stil.visibility === "hidden" || Number(stil.opacity) < 0.05) return false;
    // Ein Vorfahr, der ausgeblendet ist, blendet auch das Kind aus.
    for (let p = el.parentElement; p; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.display === "none" || ps.visibility === "hidden" || Number(ps.opacity) < 0.05) return false;
    }
    return true;
  };

  const seite = {
    vw, vh,
    hoehe: Math.max(de.scrollHeight, document.body.scrollHeight),
    breite: Math.max(de.scrollWidth, document.body.scrollWidth),
  };
  const dokumentStil = getComputedStyle(de);
  const bodyStil = getComputedStyle(document.body);
  const seiteFest = /hidden|clip/.test(dokumentStil.overflowY) || /hidden|clip/.test(bodyStil.overflowY);
  seite.scrolltHoch = !seiteFest && seite.hoehe > vh + 1;
  seite.scrolltQuer = !(/hidden|clip/.test(dokumentStil.overflowX) || /hidden|clip/.test(bodyStil.overflowX)) && seite.breite > vw + 1;

  const kaesten = [];
  document.querySelectorAll("*").forEach((el) => {
    const stil = getComputedStyle(el);
    const y = /auto|scroll/.test(stil.overflowY);
    const x = /auto|scroll/.test(stil.overflowX);
    if (!y && !x) return;
    if (!sichtbar(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (y && el.scrollHeight > el.clientHeight + 2) kaesten.push(`${beschreibe(el)} hoch ${el.clientHeight}/${el.scrollHeight}`);
    else if (x && el.scrollWidth > el.clientWidth + 2) kaesten.push(`${beschreibe(el)} quer ${el.clientWidth}/${el.scrollWidth}`);
  });

  // Was unter einem Überzug liegt – die Karte hinter dem Ergebnis, der Zug
  // hinter der Landschaftswahl –, ist nicht zu treffen und zählt nicht.
  // Geprüft wird in der Mitte des sichtbaren Teils: liegt dort etwas anderes
  // obenauf, ist der Knopf verdeckt.
  const verdeckt = (el, r) => {
    const links = Math.max(0, r.left);
    const oben = Math.max(0, r.top);
    const rechts = Math.min(vw, r.right);
    const unten = Math.min(vh, r.bottom);
    if (rechts - links < 1 || unten - oben < 1) return false;
    const oberstes = document.elementFromPoint((links + rechts) / 2, (oben + unten) / 2);
    if (!oberstes) return false;
    return !(oberstes === el || el.contains(oberstes) || oberstes.contains(el));
  };

  // Die Knöpfe im Zug-Bild sind SVG-Gruppen mit einer eigenen, unsichtbaren
  // Trefferfläche; nur die zählt. Der Kasten der ganzen Gruppe wäre grösser –
  // beim Hinweispunkt der Werkstatt etwa ragt der Lichthof über das Feld.
  const trefferflaeche = (el) => el.querySelector(":scope > .train-gate-hit, :scope > .train-building-hit, :scope > .train-wagon-hit, :scope > .loco-hotspot-hit") || el;

  const angeschnitten = [];
  const draussen = [];
  const knoepfe = [...document.querySelectorAll("button, a[href], [role=\"button\"]")]
    .filter((el) => sichtbar(el))
    .map((el) => ({ el, r: trefferflaeche(el).getBoundingClientRect() }))
    .filter(({ r }) => r.width >= 2 && r.height >= 2)
    .filter(({ el, r }) => {
      const ganzDraussen = r.right <= 0 || r.bottom <= 0 || r.left >= vw || r.top >= vh;
      if (ganzDraussen) {
        draussen.push(`${beschreibe(el)} [${Math.round(r.left)},${Math.round(r.top)}–${Math.round(r.right)},${Math.round(r.bottom)}]`);
        return false;
      }
      return !verdeckt(el, r);
    });

  knoepfe.forEach(({ el, r }) => {
    const teils = r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1;
    const wo = `[${Math.round(r.left)},${Math.round(r.top)}–${Math.round(r.right)},${Math.round(r.bottom)}]`;
    if (teils) angeschnitten.push(`${beschreibe(el)} ${wo}`);
  });

  // Überlappungen: Knopf über Knopf, oder ein Titel über einem Knopf.
  const ueberlappt = [];
  const titel = [...document.querySelectorAll(".cm-title, #puzzle-title, .cm-prompt, .wagon-reward-title")]
    .filter((el) => sichtbar(el))
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ el, r }) => r.width >= 2 && r.height >= 2 && !verdeckt(el, r));
  const alle = [...knoepfe, ...titel];
  for (let i = 0; i < alle.length; i += 1) {
    for (let j = i + 1; j < alle.length; j += 1) {
      const a = alle[i];
      const b = alle[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      // Die Fische im Teich kreuzen sich absichtlich – das ist die Aufgabe.
      if (a.el.classList.contains("ft-fisch") && b.el.classList.contains("ft-fisch")) continue;
      const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (x > 4 && y > 4) ueberlappt.push(`${beschreibe(a.el)} × ${beschreibe(b.el)} (${Math.round(x)}×${Math.round(y)})`);
    }
  }

  return { seite, kaesten, angeschnitten, draussen, ueberlappt };
}

// --- Playwright --------------------------------------------------------------
let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich das Layout nicht messen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  console.error("Oder eine vorhandene Installation über NODE_PATH bekannt machen.");
  process.exit(2);
}

const server = spawn(process.execPath, [path.join(HIER, "local-pwa-server.cjs"), String(PORT)], {
  cwd: WURZEL,
  stdio: "ignore",
});
const halt = () => { if (!server.killed) server.kill(); };
process.on("exit", halt);
process.on("SIGINT", () => { halt(); process.exit(130); });

async function warteAufServer() {
  for (let versuch = 0; versuch < 50; versuch += 1) {
    try {
      const antwort = await fetch(`${BASIS}/index.html`);
      if (antwort.ok) return true;
    } catch { /* noch nicht da */ }
    await new Promise((weiter) => setTimeout(weiter, 100));
  }
  return false;
}

if (!await warteAufServer()) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

// --- Hilfen für die Szenarien ------------------------------------------------
const pause = (blatt, ms) => blatt.waitForTimeout(ms);

// Klick per Ereignis statt per Mauszeiger: die Wagen und die Lok liegen als
// SVG-Gruppen klein unten links, teils hinter anderen Flächen – ein echter
// Klick auf ihre Mitte träfe je nach Gerät etwas anderes.
async function tippe(blatt, auswahl) {
  const ok = await blatt.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  }, auswahl);
  if (!ok) throw new Error(`nicht gefunden: ${auswahl}`);
}

// Wo hält der Zug?: die Lok an einen Anteil des Gleises setzen – ein Tipp auf
// das Gleis ist schon die Antwort.
async function zugSchieben(blatt, anteil) {
  const ok = await blatt.evaluate((p) => {
    const gleis = document.querySelector(".zg-gleis");
    if (!gleis) return false;
    const box = gleis.getBoundingClientRect();
    const rand = parseFloat(getComputedStyle(gleis).getPropertyValue("--zg-rand")) || 0;
    const x = box.left + rand + p * (box.width - 2 * rand);
    const y = box.top + box.height / 2;
    gleis.dispatchEvent(new PointerEvent("pointerdown", { clientX: x, clientY: y, pointerId: 1, bubbles: true }));
    gleis.dispatchEvent(new PointerEvent("pointerup", { clientX: x, clientY: y, pointerId: 1, bubbles: true }));
    return true;
  }, anteil);
  if (!ok) throw new Error("kein Gleis gefunden");
}

// Der Zug wartet beim ersten Laden am linken Rand auf die erste Berührung.
async function zugHereinholen(blatt) {
  await blatt.evaluate(() => document.dispatchEvent(new Event("pointerdown")));
  await pause(blatt, 2200);
}

// Ein Stand, bei dem beim Öffnen des Startbilds gefeiert wird: der Wagen
// Gedächtnis wächst von Schritt 2 auf Schritt 6, und damit wird die dritte
// Landschaft frei.
const FEIER_SPEICHER = {
  "lernapp.train.gesehen": JSON.stringify({ set: "1", steps: { gedaechtnis: 2, konzentration: 0, geschwindigkeit: 0, problemloesen: 0, zahlbuchstabe: 0 } }),
  "lernapp.train.gesehen.szenen": "2",
  "lernapp.backpack": JSON.stringify({ runs: 5, scores: [12, 10, 8, 6, 4] }),
  "lernapp.memory": JSON.stringify({ best: { 8: { stars: 3 }, 12: { stars: 3 }, 16: { stars: 3 }, 20: { stars: 3 }, 24: { stars: 3 } } }),
};

async function memoryLoesen(blatt) {
  const bekannt = new Map();
  for (let runde = 0; runde < 80; runde += 1) {
    const karten = await blatt.$$eval(".me-karte", (els) => els.map((el, i) => ({
      // Ein gefundenes Paar bleibt "offen" und ist zugleich "weg" – offen im
      // Sinn von "liegt gerade aufgedeckt da" ist nur, was noch da ist.
      i, weg: el.classList.contains("is-weg"),
      offen: el.classList.contains("is-offen") && !el.classList.contains("is-weg"),
      label: el.getAttribute("aria-label"),
    })));
    const rest = karten.filter((k) => !k.weg);
    if (!rest.length) return true;
    if (karten.some((k) => k.offen)) { await pause(blatt, 300); continue; }
    // Ein bekanntes Paar?
    const paare = new Map();
    for (const [i, label] of bekannt) {
      if (karten[i]?.weg) { bekannt.delete(i); continue; }
      if (!paare.has(label)) paare.set(label, []);
      paare.get(label).push(i);
    }
    const paar = [...paare.values()].find((liste) => liste.length === 2);
    if (paar) {
      await blatt.locator(".me-karte").nth(paar[0]).click();
      await blatt.locator(".me-karte").nth(paar[1]).click();
      await pause(blatt, 900);
      continue;
    }
    const unbekannt = rest.filter((k) => !bekannt.has(k.i));
    if (!unbekannt.length) return false;
    const a = unbekannt[0].i;
    await blatt.locator(".me-karte").nth(a).click();
    const labelA = await blatt.locator(".me-karte").nth(a).getAttribute("aria-label");
    bekannt.set(a, labelA);
    const partner = [...bekannt].find(([i, label]) => i !== a && label === labelA);
    if (partner) {
      await blatt.locator(".me-karte").nth(partner[0]).click();
      await pause(blatt, 900);
      continue;
    }
    const b = unbekannt[1]?.i;
    if (b === undefined) return false;
    await blatt.locator(".me-karte").nth(b).click();
    const labelB = await blatt.locator(".me-karte").nth(b).getAttribute("aria-label");
    bekannt.set(b, labelB);
    await pause(blatt, labelA === labelB ? 900 : 1300);
  }
  return false;
}

// --- Die Szenarien -----------------------------------------------------------
// Jede Seite: eine Folge von Bildschirmen. „tun“ führt dorthin, danach wird
// gemessen. Ein Schritt, der scheitert, bricht nur diese Seite ab.
const RAETSEL = ["arukone", "bimaru", "hidoku", "kakuro", "shikaku", "buchstaben", "wortdetektiv", "raumdetektiv"];
const UHR_SPIELE = ["kartenmerker", "schwarmfokus", "blaetter", "signal", "doppelt"];

function raetselSzenario(seite) {
  const schritte = [
    { name: "Weltwahl", tun: async () => {} },
    { name: "Levelwahl", tun: async (blatt) => { await blatt.click("#level-grid button:not([disabled])"); await pause(blatt, 400); } },
    { name: "Rätsel", tun: async (blatt) => {
      // Raumdetektiv hat keine Welt-Stufe: der erste Tipp startet schon das Level.
      if (seite !== "raumdetektiv") await blatt.click("#level-grid button:not([disabled])");
      await pause(blatt, 700);
    } },
  ];
  if (seite === "kakuro") {
    schritte.push({ name: "Zahlenfeld", tun: async (blatt) => { await blatt.click(".kakuro-entry"); await pause(blatt, 400); } });
  }
  schritte.push({ name: "Geschafft", tun: async (blatt) => {
    await blatt.evaluate(() => { handleWin(); });
    await pause(blatt, 1400);
  } });
  return { seite, schritte };
}

function uhrSzenario(seite) {
  return {
    seite,
    uhr: true,
    schritte: [
      { name: "Start", tun: async () => {} },
      { name: "Spiel", tun: async (blatt) => { await blatt.click(".cm-start"); await blatt.clock.runFor(1500); await pause(blatt, 300); } },
      { name: "Ergebnis", tun: async (blatt) => { await blatt.clock.runFor(47000); await pause(blatt, 600); } },
    ],
  };
}

// Der Gegenstand, den Rucksack packen zuletzt gezeigt hat – für den falschen
// Tipp im Schritt danach.
let gemerkt = null;

const SZENARIEN = [
  {
    seite: "index",
    schritte: [
      { name: "Startbild", tun: zugHereinholen },
      { name: "Bereiche", tun: async (blatt) => { await blatt.click(".train-start"); await pause(blatt, 1100); } },
      { name: "Spiele", tun: async (blatt) => { await blatt.click('[data-gate="problemloesen"]'); await pause(blatt, 2600); } },
      { name: "Wagen", tun: async (blatt) => { await tippe(blatt, '[data-area="problemloesen"]'); await pause(blatt, 700); } },
      { name: "Werkstatt", tun: async (blatt) => { await blatt.click(".stage-back"); await pause(blatt, 300); await tippe(blatt, "[data-loco]"); await pause(blatt, 800); } },
      { name: "Werkstatt Räder", tun: async (blatt) => { await tippe(blatt, '.loco-hotspot[data-hot="wheels"]'); await pause(blatt, 800); } },
      { name: "Werkstatt Chauffeur", tun: async (blatt) => { await blatt.click(".stage-back"); await pause(blatt, 400); await tippe(blatt, '.loco-hotspot[data-hot="driver"]'); await pause(blatt, 800); } },
      { name: "Landschaften", tun: async (blatt) => {
        await blatt.goto(`${BASIS}/index.html`, { waitUntil: "load" });
        await zugHereinholen(blatt);
        await blatt.click(".scene-button");
        await pause(blatt, 500);
      } },
    ],
  },
  {
    seite: "index",
    titel: "index-feier",
    speicher: FEIER_SPEICHER,
    schritte: [
      { name: "Wagen wächst", tun: async (blatt) => { await pause(blatt, 600); } },
      { name: "Wagen wächst (nach Neuzeichnen)", tun: async (blatt) => {
        // So meldet sich Firebase nach dem Laden: die Bühne wird neu gebaut.
        await blatt.evaluate(() => document.dispatchEvent(new CustomEvent("lernapp:progress-changed")));
        await pause(blatt, 400);
      } },
      { name: "Wagen fertig gewachsen", tun: async (blatt) => { await pause(blatt, 3600); } },
      { name: "Neue Landschaft", tun: async (blatt) => {
        await blatt.evaluate(() => document.querySelector(".wagon-reward")?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
        await pause(blatt, 300);
        await blatt.evaluate(() => document.querySelector(".wagon-reward")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
        await pause(blatt, 900);
      } },
    ],
  },
  ...RAETSEL.map(raetselSzenario),
  ...UHR_SPIELE.map(uhrSzenario),
  {
    seite: "backpack",
    schritte: [
      { name: "Wahl", tun: async () => {} },
      { name: "Aussuchen", tun: async (blatt) => { await blatt.click('.rs-stufe[data-anzahl="6"]'); await pause(blatt, 400); } },
      // Nach dem Aussuchen steht der Gegenstand eine Sekunde allein da, fliegt
      // dann in den Rucksack, und der wird ausgeleert – erst danach wird
      // gepackt. Der Gegenstand wird gemerkt, solange er allein dasteht.
      { name: "Packen", tun: async (blatt) => {
        await blatt.click(".rs-item");
        await pause(blatt, 300);
        gemerkt = await blatt.evaluate(() => document.querySelector(".rs-item.is-solo .rs-item-bild")?.textContent?.trim());
        await pause(blatt, 2600);
      } },
      { name: "Ergebnis", tun: async (blatt) => {
        const falsch = await blatt.evaluate((emoji) => {
          const el = [...document.querySelectorAll(".rs-item")].find((k) => k.textContent.trim() !== emoji);
          el?.click();
          return Boolean(el);
        }, gemerkt);
        if (!falsch) throw new Error("kein falscher Gegenstand gefunden");
        await pause(blatt, 1200);
      } },
    ],
  },
  {
    seite: "memory",
    schritte: [
      { name: "Wahl", tun: async () => {} },
      { name: "Spiel 24", tun: async (blatt) => { await blatt.click('.me-groesse[data-karten="24"]'); await pause(blatt, 400); } },
      { name: "Spiel 8", tun: async (blatt) => { await blatt.click(".cm-icon-back"); await pause(blatt, 300); await blatt.click('.me-groesse[data-karten="8"]'); await pause(blatt, 400); } },
      { name: "Ergebnis", tun: async (blatt) => {
        if (!await memoryLoesen(blatt)) throw new Error("Memory nicht gelöst");
        await pause(blatt, 1200);
      } },
    ],
  },
  {
    seite: "strandschatz",
    schritte: [
      { name: "Spiel", tun: async (blatt) => { await pause(blatt, 300); } },
      { name: "Ergebnis", tun: async (blatt) => {
        const erster = await blatt.getAttribute(".st-item", "aria-label");
        await blatt.click(".st-item");
        await pause(blatt, 800);
        await blatt.click(`.st-item[aria-label="${erster}"]`);
        await pause(blatt, 1300);
      } },
    ],
  },
  {
    seite: "kacheln",
    schritte: [
      { name: "Merken", tun: async (blatt) => { await pause(blatt, 300); } },
      { name: "Tippen", tun: async (blatt) => {
        blatt.__muster = await blatt.$$eval(".kk-kachel", (els) => els.map((el) => el.classList.contains("is-muster")));
        await pause(blatt, 2600);
      } },
      { name: "Ergebnis", tun: async (blatt) => {
        const daneben = blatt.__muster.findIndex((m) => !m);
        await blatt.locator(".kk-kachel").nth(daneben).click();
        await pause(blatt, 1400);
      } },
    ],
  },
  {
    seite: "fischteich",
    schritte: [
      { name: "Spiel", tun: async (blatt) => { await pause(blatt, 400); } },
      { name: "Ergebnis", tun: async (blatt) => {
        await tippe(blatt, ".ft-fisch");
        await pause(blatt, 200);
        await tippe(blatt, ".ft-fisch");
        await pause(blatt, 1300);
      } },
    ],
  },
  {
    seite: "freiefahrt",
    schritte: [
      { name: "Levelwahl", tun: async () => {} },
      // Ein mittleres Level: das volle Feld mit der Anzeige daneben ist der
      // Bildschirm, auf dem es eng wird.
      { name: "Spiel", tun: async (blatt) => { await blatt.locator(".ff-level").nth(4).click(); await pause(blatt, 400); } },
      { name: "Ergebnis", tun: async (blatt) => {
        // Wirklich gelöst, nicht nachgestellt: der Löser aus freiefahrt.js
        // liefert den Weg, und der wird über die Pfeiltasten gefahren. So steht
        // im Schlussbild dieselbe Zugzahl, die ein Kind auch sähe.
        await blatt.evaluate(async () => {
          const api = window.LernappFreieFahrt;
          const warte = (ms) => new Promise((r) => setTimeout(r, ms));
          for (const zug of api.suche(api.stellung()).weg) {
            const node = document.querySelector(`.ff-wagen[data-id="${zug.wagen}"]`);
            const wagen = api.stellung().find((eintrag) => eintrag.id === zug.wagen);
            const quer = wagen.richtung === "waagerecht";
            const jetzt = quer ? wagen.spalte : wagen.reihe;
            const taste = zug.ziel > jetzt ? (quer ? "ArrowRight" : "ArrowDown") : (quer ? "ArrowLeft" : "ArrowUp");
            for (let i = 0; i < Math.abs(zug.ziel - jetzt); i += 1) {
              node.dispatchEvent(new KeyboardEvent("keydown", { key: taste, bubbles: true, cancelable: true }));
              await warte(5);
            }
          }
        });
        await pause(blatt, 1600);
      } },
    ],
  },
  {
    seite: "turmbau",
    schritte: [
      { name: "Bereit", tun: async (blatt) => { await pause(blatt, 400); } },
      // Zwei Blöcke stapeln, dann so lange daneben tippen, bis der Turm
      // fertig ist. Wohin der schwingende Block gerade zeigt, weiss die
      // Prüfung nicht – deshalb wird der Zustand direkt gesetzt.
      { name: "Turm", tun: async (blatt) => {
        await tippe(blatt, ".tb-feld");
        await pause(blatt, 600);
        await tippe(blatt, ".tb-feld");
        await pause(blatt, 600);
      } },
      { name: "Ergebnis", tun: async (blatt) => {
        await blatt.evaluate(() => {
          const spiel = window.LernappTurmbau;
          // Eine ganze Weltbreite daneben: die Welt ist je nach Bildschirm
          // verschieden breit, ein fester Abstand träfe mal daneben, mal nicht.
          if (spiel?.state?.schweber) spiel.state.schweber.x += spiel.welt.w;
        });
        await tippe(blatt, ".tb-feld");
        await pause(blatt, 1600);
      } },
    ],
  },
  {
    seite: "zahlengleis",
    schritte: [
      { name: "Stufenwahl", tun: async (blatt) => { await pause(blatt, 400); } },
      { name: "Aufgabe", tun: async (blatt) => { await blatt.click('.zg-stufe[data-stufe="4"]'); await pause(blatt, 400); } },
      { name: "Antwort", tun: async (blatt) => { await zugSchieben(blatt, 0.5); await pause(blatt, 500); } },
      { name: "Ergebnis", tun: async (blatt) => {
        for (let i = 0; i < 9; i += 1) { await pause(blatt, 1700); await zugSchieben(blatt, 0.5); }
        await pause(blatt, 2000);
      } },
    ],
  },
  {
    seite: "wasfehlt",
    schritte: [
      { name: "Merken", tun: async (blatt) => { await pause(blatt, 400); } },
      { name: "Wahl", tun: async (blatt) => { await pause(blatt, 2500 + 900 + 500); } },
      { name: "Ergebnis", tun: async (blatt) => {
        const falsch = await blatt.evaluate(() => {
          const fehlt = window.LernappWasFehlt.state.fehlt;
          const el = [...document.querySelectorAll(".wf-knopf")].find((k) => k.dataset.id !== fehlt);
          el?.click();
          return Boolean(el);
        });
        if (!falsch) throw new Error("kein falsches Stück gefunden");
        await pause(blatt, 1900);
      } },
    ],
  },
  {
    seite: "faesser",
    schritte: [
      { name: "Levelwahl", tun: async () => {} },
      { name: "Spiel", tun: async (blatt) => {
        await blatt.locator(".fs-level").first().click();
        await pause(blatt, 400);
        await tippe(blatt, '[data-gleis="0"]');
        await pause(blatt, 300);
      } },
      // Level 1 in seinen vier Zügen: 3 nach rechts, 1 nach links, 2 nach
      // rechts, 1 nach rechts – je ein Tipp zum Heben und einer zum Stellen.
      { name: "Ergebnis", tun: async (blatt) => {
        for (const gleis of [2, 1, 0, 1, 2, 0, 2]) { await tippe(blatt, `[data-gleis="${gleis}"]`); await pause(blatt, 420); }
        await pause(blatt, 1500);
      } },
    ],
  },
  {
    seite: "weichen",
    uhr: true,
    schritte: [
      { name: "Levelwahl", tun: async () => {} },
      { name: "Spiel", tun: async (blatt) => { await blatt.locator(".tr-level").nth(9).click(); await blatt.clock.runFor(4000); await pause(blatt, 300); } },
      { name: "Ergebnis", tun: async (blatt) => { await blatt.clock.runFor(150000); await pause(blatt, 600); } },
    ],
  },
  {
    seite: "tiersprung",
    schritte: [
      { name: "Karte", tun: async () => {} },
      { name: "Spiel", tun: async (blatt) => { await blatt.click(".cm-start"); await pause(blatt, 900); } },
      { name: "Pause", tun: async (blatt) => { await blatt.click("#runner-pause"); await pause(blatt, 500); } },
      { name: "Geschafft (Vorschau)", tun: async (blatt) => {
        // Denselben Dialog zeigen, den finishRun baut – ohne das Level zu laufen.
        await blatt.evaluate(() => {
          const overlay = document.getElementById("runner-overlay");
          overlay.innerHTML = `<div class="runner-dialog" role="dialog"><p class="runner-dialog-eyebrow">Level 1 geschafft</p><h2>Maus im Ziel! 🐭</h2><div class="runner-stars"><span class="runner-star filled">★</span><span class="runner-star filled">★</span><span class="runner-star">★</span></div><p class="runner-dialog-sub">12 von 15 Käse 🧀</p><p class="runner-grow">Du wirst grösser: <strong>Frosch 🐸</strong></p><div class="runner-dialog-actions"><button type="button" class="runner-primary">Weiter zu Frosch 🐸</button><button type="button" class="runner-secondary">Nochmal ↻</button><button type="button" class="runner-secondary">Zur Karte</button></div></div>`;
          overlay.hidden = false;
        });
        await pause(blatt, 400);
      } },
      { name: "Verloren", tun: async (blatt) => {
        await blatt.evaluate(() => { const o = document.getElementById("runner-overlay"); o.hidden = true; o.innerHTML = ""; });
        await blatt.click("#runner-pause");
        await pause(blatt, 300);
        await blatt.click("#runner-pause");
        for (let i = 0; i < 40; i += 1) {
          await pause(blatt, 500);
          if (await blatt.$(".runner-dialog")) break;
        }
        if (!await blatt.$(".runner-dialog")) throw new Error("kein Verloren-Dialog");
        await pause(blatt, 400);
      } },
    ],
  },
].filter((szenario) => !NUR || NUR.includes(szenario.titel || szenario.seite));

// --- Der Lauf ------------------------------------------------------------------
const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROMIUM_PFAD || undefined,
  args: ["--no-sandbox"],
});

const befunde = [];
const warnungen = [];
let bildschirme = 0;

function melde(geraet, szenario, schritt, mess) {
  const wo = `${geraet.name.padEnd(13)} ${(szenario.titel || szenario.seite).padEnd(13)} ${schritt.padEnd(30)}`;
  const probleme = [];
  if (mess.seite.scrolltHoch) probleme.push(`Seite scrollt hoch (${mess.seite.hoehe} > ${mess.seite.vh})`);
  if (mess.seite.scrolltQuer) probleme.push(`Seite scrollt quer (${mess.seite.breite} > ${mess.seite.vw})`);
  mess.kaesten.forEach((k) => probleme.push(`Rollbalken: ${k}`));
  mess.angeschnitten.forEach((k) => probleme.push(`angeschnitten: ${k}`));
  mess.ueberlappt.forEach((k) => probleme.push(`überlappt: ${k}`));
  mess.draussen.forEach((k) => warnungen.push(`${wo} ausserhalb: ${k}`));
  console.log(`  ${probleme.length ? "!!" : "ok"}  ${wo}${probleme.length ? `\n${probleme.map((p) => `        - ${p}`).join("\n")}` : ""}`);
  probleme.forEach((p) => befunde.push(`${wo} ${p}`));
}

async function laufFuerGeraet(geraet) {
  const sitzung = await browser.newContext({
    viewport: { width: geraet.width, height: geraet.height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  // Firebase liegt auf einem fremden Server. Ohne Netz bleibt die App stumm –
  // hier soll sie das auch, damit der Lauf schnell und gleich bleibt.
  await sitzung.route("**/*gstatic.com/**", (route) => route.abort());
  const zeilen = [];
  const log = console.log;

  for (const szenario of SZENARIEN) {
    const blatt = await sitzung.newPage();
    if (szenario.speicher) {
      await blatt.addInitScript((speicher) => {
        Object.entries(speicher).forEach(([key, value]) => localStorage.setItem(key, value));
      }, szenario.speicher);
    } else {
      await blatt.addInitScript(() => localStorage.clear());
    }
    if (szenario.uhr) await blatt.clock.install({ time: Date.now() });
    try {
      await blatt.goto(`${BASIS}/${szenario.seite}.html`, { waitUntil: "load" });
      await pause(blatt, 900);
      let nummer = 0;
      for (const schritt of szenario.schritte) {
        nummer += 1;
        try {
          await schritt.tun(blatt);
        } catch (error) {
          zeilen.push(() => log(`  ??  ${geraet.name.padEnd(13)} ${(szenario.titel || szenario.seite).padEnd(13)} ${schritt.name.padEnd(30)} nicht erreicht: ${String(error.message || error).split("\n")[0]}`));
          break;
        }
        const mess = await blatt.evaluate(messen);
        bildschirme += 1;
        zeilen.push(() => melde(geraet, szenario, schritt.name, mess));
        if (BILDER) {
          const ordner = path.join(BILDER, geraet.name);
          fs.mkdirSync(ordner, { recursive: true });
          const datei = `${szenario.titel || szenario.seite}-${String(nummer).padStart(2, "0")}-${schritt.name.replace(/[^\wäöü]+/gi, "_")}.png`;
          await blatt.screenshot({ path: path.join(ordner, datei) }).catch(() => {});
        }
      }
    } catch (error) {
      zeilen.push(() => log(`  ??  ${geraet.name.padEnd(13)} ${(szenario.titel || szenario.seite).padEnd(13)} Seite nicht geladen: ${error.message}`));
    }
    await blatt.close();
  }
  await sitzung.close();
  return zeilen;
}

// Alle Geräte gleichzeitig, jedes in seinem eigenen Fenster; ausgegeben wird
// gesammelt je Gerät, damit die Zeilen nicht durcheinander laufen.
const ergebnisse = await Promise.all(GERAETE.map(laufFuerGeraet));
ergebnisse.forEach((zeilen, index) => {
  console.log(`\n${GERAETE[index].name} (${GERAETE[index].width}×${GERAETE[index].height}):`);
  zeilen.forEach((zeile) => zeile());
});

await browser.close();
halt();

if (warnungen.length) {
  console.log(`\nHinweise (Knöpfe ganz ausserhalb des Bilds – meist absichtlich, z. B. der wartende Zug):`);
  warnungen.forEach((w) => console.log(`  - ${w}`));
}
console.log(`\n${bildschirme} Bildschirme gemessen.`);
if (befunde.length) {
  console.error(`${befunde.length} Befund(e):`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Auf jedem Gerät passt alles aufs Bild.");
