/*
 * Der Elternbereich im Profilfenster: kaufen, Kinder, Kaufstand.
 * ---------------------------------------------------------------------------
 * Das Elternkonto sieht im Profilfenster zwei Karten, die es sonst nirgends
 * gibt: den Kauf und die Kinder. Ein Kind sieht nur, ob seine Eltern gekauft
 * haben; ein Konto aus der Zeit vor dem Kauf ist frei und erfährt das. Und
 * wer von der Kasse zurückkommt, bekommt das Fenster von selbst geöffnet –
 * mit einem Satz dazu, ob bezahlt wurde.
 *
 * Firebase kommt nicht aus dem Netz: vor allen Skripten der Seite wird ein
 * Ersatz eingehängt, der Anmeldung und Firestore im Speicher nachbildet – wie
 * in check-adminbereich.mjs, dazu onSnapshot, damit der Kauf-Eintrag wie im
 * Ernstfall von selbst ankommt. Den Server unter /api/ spielt Playwright: Er
 * antwortet, was der echte antworten würde, und merkt sich, was er gefragt
 * wurde – mit welchem Token, mit welchem Namen.
 *
 * Gemessen wird:
 *   - Eltern ohne Kauf: die Kaufkarte mit Preis, die Kinderkarte "0 von 4"
 *   - Kind anlegen: Formular, Aufruf mit Token und Name, danach in der Liste
 *   - ein Kind aufklappen: Zug, probierte Level, Sitzungen – die Sicht, die
 *     der Adminbereich für alle hat, hier für die eigene Familie; dazu die
 *     Leseecke mit dem Lesebericht (Wörter, Bücher, Laute, Verwechslungen,
 *     Bestwert auf Zeit, was von selbst schwerer wurde), Schriftgrösse und
 *     Wort-Hilfe
 *   - Passwort neu: Formular an der Zeile, Aufruf mit der uid des Kindes
 *   - Fortschritt zurücksetzen: Rückfrage, danach sind Level und Sitzungen weg
 *   - Konto löschen: Rückfrage, Aufruf von /api/kind-loeschen, danach weg
 *   - Wagen der Familie: umstellen schreibt das Set an JEDES Konto der Familie
 *     und an kein fremdes – das ist der ganze Unterschied zum Adminbereich
 *   - der Server lehnt ab: die Meldung steht da, nichts stürzt
 *   - Jetzt kaufen: Aufruf der Kasse, Weiterleitung, Rückkehr mit Hinweis
 *   - Eltern mit Kauf: Haken statt Knopf
 *   - Kind mit Elternkonto: keine Kinderkarte, "noch nicht freigeschaltet" –
 *     und wenn der Kauf eintrifft, schaltet die Karte von selbst um
 *   - Gründer-Kind ohne Eltern: frei, und es steht da
 *   - Rückkehr mit ?kauf=erfolg: Fenster offen, Adresse sauber, und die
 *     Freischaltung kommt nach
 *   - Die ganze App gratis (der grosse Haken im Adminbereich): keine
 *     Kaufkarte, kein Preis, kein Angebot hinter dem Elterntor, zurKasse()
 *     ruft den Server nicht an; der Haken fällt bei offenem Fenster, und nur
 *     die Kaufkarte zeichnet sich neu – der halb eingetippte Name bleibt.
 *     Das Kind ohne Kauf liest nicht "noch nicht freigeschaltet", die
 *     Familie mit Kauf behält ihren Haken
 *
 * Aufruf:  node scripts/check-elternbereich.mjs
 *          BILDER=/ein/ordner node scripts/check-elternbereich.mjs  legt
 *          dort Bildschirmfotos der Stationen ab, zum Anschauen.
 * Nötig:   Playwright (npm i -D playwright), oder NODE_PATH auf eine
 *          vorhandene Installation.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PORT = Number(process.env.PORT || 4191);
const BASIS = `http://127.0.0.1:${PORT}`;
const BILDER = process.env.BILDER || "";

let playwright;
try {
  playwright = createRequire(import.meta.url)("playwright");
} catch {
  console.error("Playwright fehlt – ohne Browser lässt sich der Elternbereich nicht prüfen.");
  console.error("Einmalig einrichten:  npm i -D playwright && npx playwright install chromium");
  console.error("Oder eine vorhandene Installation über NODE_PATH bekannt machen.");
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

// --- Die Konten ---------------------------------------------------------------
const STATS = { totalSeconds: 60, moves: 5, resets: 0, solvedLevels: 0, sessions: 1 };
const ELTERN = { uid: "eltern1", email: "eltern@example.com", emailVerified: true, displayName: "Familie Muster", providerData: [{ providerId: "password" }] };
const MIA = { uid: "kind-mia", email: "mia@lernapp.local", emailVerified: false, displayName: "Mia", providerData: [{ providerId: "password" }] };
const BEN = { uid: "kind-ben", email: "ben@lernapp.local", emailVerified: false, displayName: "Ben", providerData: [{ providerId: "password" }] };

const elternDoc = (children = []) => ({ authEmail: ELTERN.email, email: ELTERN.email, username: "Familie Muster", displayName: "Familie Muster", role: "parent", children, stats: STATS });
const kindDoc = (name, parentUid) => ({ authEmail: `${name.toLowerCase()}@lernapp.local`, email: null, username: name, displayName: name, role: "child", ...(parentUid ? { parentUid } : {}), stats: STATS });
const KAUF = { plan: "familie", active: true, grantedAtMs: 1700000000000, source: "stripe" };

// --- Der Ersatz für Firebase ----------------------------------------------------
// Läuft im Browser, vor allen Skripten der Seite. addInitScript reicht genau
// einen Wert hinein, deshalb kommen Daten und Nutzer in einem Paket.
function firebaseErsatz({ daten, nutzer }) {
  const laden = new Map(Object.entries(daten));
  const lauscher = new Map();
  const SERVER = "__serverTimestamp";
  const DELETE = "__deleteField";

  const aufloesen = (wert) => {
    if (wert && wert.__marker === SERVER) return 1700000000000;
    if (Array.isArray(wert)) return wert.map(aufloesen);
    if (wert && typeof wert === "object") return Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, aufloesen(v)]));
    return wert;
  };
  const mischen = (ziel, patch) => {
    const raus = { ...(ziel || {}) };
    for (const [key, wert] of Object.entries(patch)) {
      if (wert && wert.__marker === DELETE) { delete raus[key]; continue; }
      const einfach = wert && typeof wert === "object" && !Array.isArray(wert) && !wert.__marker;
      raus[key] = einfach && raus[key] && typeof raus[key] === "object" ? mischen(raus[key], wert) : aufloesen(wert);
    }
    return raus;
  };
  const feld = (doc, pfad) => String(pfad).split(".").reduce((eintrag, key) => (eintrag == null ? eintrag : eintrag[key]), doc);
  const schnappschuss = (pfad) => {
    const doc = laden.get(pfad);
    return { exists: doc !== undefined, id: pfad.split("/").pop(), data: () => doc && JSON.parse(JSON.stringify(doc)) };
  };
  // Wer auf ein Dokument lauscht, erfährt jede Änderung – so kommt der Kauf
  // an, den der Webhook auf dem Server schreibt.
  const melden = (pfad) => (lauscher.get(pfad) || []).forEach((rueckruf) => setTimeout(() => rueckruf(schnappschuss(pfad)), 0));

  const docRef = (pfad) => ({
    path: pfad,
    id: pfad.split("/").pop(),
    async get() { return schnappschuss(pfad); },
    async set(payload, optionen) { laden.set(pfad, optionen?.merge ? mischen(laden.get(pfad), payload) : aufloesen(payload)); melden(pfad); },
    async update(payload) { laden.set(pfad, mischen(laden.get(pfad), payload)); melden(pfad); },
    async delete() { laden.delete(pfad); melden(pfad); },
    onSnapshot(rueckruf) {
      if (!lauscher.has(pfad)) lauscher.set(pfad, new Set());
      lauscher.get(pfad).add(rueckruf);
      setTimeout(() => rueckruf(schnappschuss(pfad)), 0);
      return () => lauscher.get(pfad)?.delete(rueckruf);
    },
    collection: (name) => collectionRef(`${pfad}/${name}`),
  });

  function collectionRef(pfad, filter = []) {
    const abfrage = {
      orderBy: () => abfrage,
      limit: () => abfrage,
      where: (f, op, wert) => collectionRef(pfad, [...filter, { f, op, wert }]),
      async get() {
        const docs = [];
        laden.forEach((doc, key) => {
          if (!key.startsWith(`${pfad}/`)) return;
          const rest = key.slice(pfad.length + 1);
          if (rest.includes("/")) return;
          if (!filter.every(({ f, wert }) => feld(doc, f) === wert)) return;
          // ref gehört dazu: Das echte SDK gibt jedem Treffer einer Abfrage
          // eine Referenz mit, und firebase.js löscht darüber (deleteAllDocs,
          // batch.delete(doc.ref)). Ohne ref liefe jedes Zurücksetzen hier in
          // einen Fehler, den es im Ernstfall nicht gibt.
          docs.push({ id: rest, ref: docRef(key), data: () => JSON.parse(JSON.stringify(doc)) });
        });
        return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn) => docs.forEach(fn) };
      },
      doc: (id) => docRef(`${pfad}/${id}`),
    };
    return abfrage;
  }

  const user = {
    ...nutzer,
    updateProfile: async () => {},
    reload: async () => {},
    // Das Token, mit dem der Client beim Server anruft. Der Ersatz-Server
    // unten schaut nach, ob es mitkommt.
    getIdToken: async () => "token-attrappe",
  };
  const auth = () => ({
    currentUser: user,
    setPersistence: () => Promise.resolve(),
    onAuthStateChanged(rueckruf) { setTimeout(() => rueckruf(user), 0); return () => {}; },
    signOut: async () => {},
  });
  auth.Auth = { Persistence: { LOCAL: "local" } };
  auth.GoogleAuthProvider = function GoogleAuthProvider() {};

  const firestore = () => ({
    collection: (name) => collectionRef(name),
    batch() {
      const schritte = [];
      return {
        set(ref, payload, optionen) { schritte.push(["set", ref, payload, optionen]); return this; },
        update(ref, payload) { schritte.push(["update", ref, payload]); return this; },
        delete(ref) { schritte.push(["delete", ref]); return this; },
        async commit() {
          for (const [art, ref, payload, optionen] of schritte) {
            if (art === "delete") await ref.delete();
            else if (art === "update") await ref.update(payload);
            else await ref.set(payload, optionen);
          }
        },
      };
    },
  });
  firestore.FieldValue = {
    serverTimestamp: () => ({ __marker: SERVER }),
    increment: (um) => um,
    delete: () => ({ __marker: DELETE }),
  };

  window.firebase = { apps: [], initializeApp: () => ({}), app: () => ({}), auth, firestore };
  // Die Hintertür der Prüfung: was der Webhook auf dem Server schriebe.
  window.__ersatz = {
    setze: (pfad, doc) => { laden.set(pfad, doc); melden(pfad); },
    // Zum Nachsehen, was die Seite geschrieben hat: Ein Zurücksetzen, das
    // nur so aussieht, fiele sonst nicht auf.
    lies: (pfad) => { const doc = laden.get(pfad); return doc === undefined ? null : JSON.parse(JSON.stringify(doc)); },
  };
}

// --- Der Ersatz für den Server --------------------------------------------------
// Jede Antwort ist eine Funktion der Anfrage; wer nichts sagt, bekommt 404.
function serverErsatz(page, antworten) {
  const anfragen = [];
  page.route("**/api/**", async (route) => {
    const request = route.request();
    const pfad = new URL(request.url()).pathname.replace(/^\/api\//, "");
    let body = null;
    try { body = request.postDataJSON(); } catch { body = null; }
    const anfrage = { pfad, methode: request.method(), token: request.headers().authorization || "", body };
    anfragen.push(anfrage);
    const antwort = antworten[pfad] ? antworten[pfad](anfrage) : { status: 404, body: { error: "unbekannt", message: "Kein solcher Pfad." } };
    await route.fulfill({ status: antwort.status || 200, contentType: "application/json", body: JSON.stringify(antwort.body) });
  });
  return anfragen;
}

const befunde = [];
function pruefe(bedingung, meldung) { if (!bedingung) befunde.push(meldung); }

if (!(await warteAufServer())) {
  console.error(`Der lokale Server auf ${BASIS} kam nicht hoch.`);
  process.exit(2);
}

const browser = await playwright.chromium.launch({ executablePath: process.env.CHROMIUM_PFAD || undefined, args: ["--no-sandbox"] });
const fehler = [];

async function starteSeite({ daten, nutzer, antworten = {}, adresse = "/index.html" }) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 800 }, serviceWorkers: "block", reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (e) => fehler.push(`${nutzer.uid}: ${e.message}`));
  // Das echte SDK liegt auf einem fremden Server und wird hier nicht gebraucht.
  await page.route("https://www.gstatic.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(firebaseErsatz, { daten, nutzer });
  const anfragen = serverErsatz(page, antworten);
  await page.goto(`${BASIS}${adresse}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.LernappFirebase), null, { timeout: 10000 });
  return { page, context, anfragen };
}

async function oeffneProfil(page) {
  await page.locator(".account-button").click({ timeout: 5000 });
  await page.locator("[data-kauf-karte]").waitFor({ state: "visible", timeout: 10000 });
}

const text = async (locator) => ((await locator.textContent()) || "").replace(/\s+/g, " ").trim();
const knips = async (page, name) => { if (BILDER) await page.screenshot({ path: path.join(BILDER, `${name}.png`), fullPage: true }); };
// Die Rückmeldung steht in der Karte, nicht am Ende des Fensters.
const kinderStatus = (page) => page.locator("[data-kinder-karte] .karten-status");

try {
  // --- 1) Eltern ohne Kauf, ohne Kinder ------------------------------------------
  {
    let kinderAngelegt = 0;
    const { page, context, anfragen } = await starteSeite({
      daten: { "users/eltern1": elternDoc() },
      nutzer: ELTERN,
      antworten: {
        "kind-anlegen": ({ body }) => {
          if (body?.name === "Mia") return { status: 409, body: { error: "name-taken", message: "Diesen Namen gibt es schon." } };
          kinderAngelegt += 1;
          return { body: { uid: `kind-${kinderAngelegt}`, name: body?.name, loginName: body?.name, kauf: false } };
        },
        "kind-passwort": () => ({ body: { ok: true } }),
        "checkout": () => ({ body: { url: `${BASIS}/index.html?kauf=abbruch` } }),
      },
    });
    await oeffneProfil(page);

    const kaufKarte = page.locator("[data-kauf-karte]");
    pruefe((await text(kaufKarte)).includes("Gripszug Familie"), "Eltern ohne Kauf: die Kaufkarte fehlt oder heisst anders");
    pruefe((await text(page.locator("[data-kaufen]"))).includes("CHF 30"), "Eltern ohne Kauf: der Preis steht nicht auf dem Knopf");
    pruefe(!(await text(kaufKarte)).includes("✓"), "Eltern ohne Kauf: die Karte zeigt einen Haken");
    pruefe(await page.locator(".kauf-hinweis").count() === 0, "Eltern ohne Kauf: ein Kassen-Hinweis, obwohl niemand an der Kasse war");

    const kinderKarte = page.locator("[data-kinder-karte]");
    pruefe(await kinderKarte.count() === 1, "Eltern: die Kinderkarte fehlt");
    pruefe((await text(kinderKarte.locator(".kinder-kopf"))).includes("0 von 4"), "Eltern ohne Kinder: der Kopf zählt nicht 0 von 4");
    pruefe(await page.locator(".kind-leer").count() === 1, "Eltern ohne Kinder: der Satz für die leere Liste fehlt");
    // Ohne Kinder keine Wagenkarte: Die Wagen gelten für eine Familie, und
    // eine gibt es noch nicht. Stünde die Karte trotzdem da, setzte ein Tipp
    // darauf erst den eigenen Fortschritt zurück und liefe dann in ein
    // permission-denied – firestore.rules lässt das eigene wagonSet nur durch,
    // wenn children[] nicht leer ist.
    pruefe(await page.locator("[data-wagen-karte]").count() === 0, "Eltern ohne Kinder: die Wagenkarte steht da, obwohl es keine Familie gibt");
    await knips(page, "1-eltern-ohne-kauf");

    // Kind anlegen – erst lehnt der Server ab, dann klappt es.
    await page.locator("[data-kind-neu]").click({ timeout: 5000 });
    const form = page.locator("[data-kind-neu-form]");
    pruefe(await form.count() === 1, "Kind anlegen: kein Formular nach dem Tipp auf 'Kind hinzufügen'");
    await form.locator("input[name=name]").fill("Mia");
    await form.locator("input[name=passwort]").fill("1234");
    await form.locator("button[type=submit]").click({ timeout: 5000 });
    await page.waitForFunction(() => /Namen gibt es schon/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 5000 }).catch(() => {});
    pruefe((await text(kinderStatus(page))).includes("Diesen Namen gibt es schon"), "Kind anlegen: die Absage des Servers (name-taken) steht nicht in der Karte");
    pruefe(await page.locator("[data-kinder-karte] .karten-status.is-ok").count() === 0, "Kind anlegen: die Absage ist grün");
    pruefe(await page.locator("[data-kind-neu-form]").count() === 1, "Kind anlegen: nach der Absage ist das Formular weg – die Eingabe wäre verloren");
    await knips(page, "2-kind-anlegen-absage");

    await form.locator("input[name=name]").fill("Lina");
    // Die Altersgruppe: drei Knöpfe, die Mitte vorgewählt; hier die Kleinsten.
    pruefe(await form.locator(".kind-stufe-wahl input[name=stufe]").count() === 3, "Kind anlegen: die drei Altersgruppen fehlen im Formular");
    pruefe(await form.locator('input[name=stufe][value="mittel"]').isChecked(), "Kind anlegen: die Mitte ist nicht vorgewählt");
    await form.locator('.kind-stufe-wahl label:has(input[value="leicht"])').click({ timeout: 5000 });
    pruefe(await form.locator('input[name=stufe][value="leicht"]').isChecked(), "Kind anlegen: der Tipp auf «Leicht» wählt die Stufe nicht");
    await form.locator("button[type=submit]").click({ timeout: 5000 });
    await page.locator("[data-kind-uid='kind-1']").waitFor({ timeout: 5000 }).catch(() => {});
    pruefe(await page.locator("[data-kind-uid='kind-1']").count() === 1, "Kind anlegen: Lina steht nach dem Anlegen nicht in der Liste");
    pruefe((await text(page.locator("[data-kind-uid='kind-1'] .kind-name"))).includes("Lina"), "Kind anlegen: der Name in der Zeile stimmt nicht");
    pruefe((await text(page.locator("[data-kinder-karte] .kinder-kopf"))).includes("1 von 4"), "Kind anlegen: der Kopf zählt nicht 1 von 4");
    pruefe((await text(kinderStatus(page))).includes("Lina kann sich jetzt"), "Kind anlegen: die Bestätigung fehlt in der Karte");
    pruefe(await page.locator("[data-wagen-karte]").count() === 1, "Mit dem ersten Kind muss die Wagenkarte erscheinen");
    pruefe(await page.locator("[data-kinder-karte] .karten-status.is-ok").count() === 1, "Kind anlegen: die Bestätigung ist nicht grün");
    const anlegen = anfragen.filter((a) => a.pfad === "kind-anlegen");
    pruefe(anlegen.length === 2, `Kind anlegen: ${anlegen.length} Aufrufe statt 2`);
    pruefe(anlegen.every((a) => a.token === "Bearer token-attrappe"), "Kind anlegen: der Aufruf trägt nicht das Token des Kontos");
    pruefe(anlegen.every((a) => a.methode === "POST"), "Kind anlegen: kein POST");
    pruefe(anlegen[1]?.body?.name === "Lina" && anlegen[1]?.body?.passwort === "1234", "Kind anlegen: Name oder Passwort kommen nicht so beim Server an, wie sie eingegeben wurden");
    pruefe(anlegen[1]?.body?.stufe === "leicht", `Kind anlegen: die Altersgruppe kommt nicht beim Server an (${anlegen[1]?.body?.stufe})`);

    // Ein Kind aufklappen: Dahinter steht dieselbe Sicht wie im Adminbereich,
    // nur für das eigene Kind – und dahinter liegen auch die Knöpfe. Zugeklappt
    // steht in der Zeile nur der Name; bei vier Kindern wäre alles andere keine
    // Übersicht mehr.
    // Lina hat schon in der Leseecke gelesen: Ihr Kasten liegt am Konto, wie
    // ihn das Gerät hinaufschreibt (lesen-stand.js).
    await page.evaluate(() => {
      const doc = window.__ersatz.lies("users/kind-1") || {};
      doc.gameState = { ...(doc.gameState || {}), "lernapp.lesen": { updatedAt: Date.now(), data: {
        woerter: 340,
        laute: { m: { r: 4, f: 0, tage: ["2026-10-01", "2026-10-03"] }, a: { r: 3, f: 1, tage: ["2026-10-02", "2026-10-04"] }, b: { r: 1, f: 2, tage: ["2026-10-04"] } },
        buecher: { "hase-rueebli": { mal: 2, sterne: 3, at: 1 }, "leo-melone": { mal: 1, sterne: 2, at: 1 } },
        spiele: { silbenzug: { runden: 5, best: 6, zuletzt: 1 }, buchstabenhaus: { runden: 2, best: 5, zuletzt: 1 }, stimmtdas: { runden: 1, best: 0, zeit: 11, schritt: 1, serie: 0, zuletzt: 1 } },
        blitz: {},
        verwechselt: { "b|d": 3, "m|n": 1 },
      } } };
      window.__ersatz.setze("users/kind-1", doc);
    });
    await page.locator("[data-kind-auf='kind-1']").click({ timeout: 5000 });
    await page.locator("[data-kind-uid='kind-1'] .kind-detail").waitFor({ timeout: 10000 }).catch(() => {});
    const detail = page.locator("[data-kind-uid='kind-1'] .kind-detail");
    pruefe(await detail.count() === 1, "Kind aufklappen: keine Detailansicht");
    pruefe(await detail.locator(".admin-train-detail").count() === 1, "Kind aufklappen: der Zug des Kindes fehlt");
    pruefe(await detail.locator(".admin-abdeckung").count() === 1, "Kind aufklappen: die probierten Level fehlen");
    pruefe(await detail.locator(".admin-stufe").count() === 1, "Kind aufklappen: die Schwierigkeitsstufe fehlt");
    pruefe(await detail.locator("[data-kind-stufe]").count() === 3, "Kind aufklappen: die drei Stufen fehlen");
    // Die Gruppe gehört dem Admin. Ein Elternkonto, das sie setzen könnte,
    // schriebe sein Kind in eine fremde Familie – firestore.rules lässt das
    // nicht zu, und hier darf der Knopf deshalb gar nicht erst stehen.
    pruefe(await detail.locator(".admin-group").count() === 0, "Kind aufklappen: Eltern bekommen die Gruppen-Karte, die dem Admin gehört");
    // Und die Stufe lässt sich umstellen.
    await detail.locator('[data-kind-stufe="schwer"]').click({ timeout: 5000 });
    await page.waitForFunction(() => /Schwierigkeitsstufe auf/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 10000 }).catch(() => {});
    pruefe((await text(kinderStatus(page))).includes("Schwer"), "Schwierigkeitsstufe: die Bestätigung fehlt");
    const stufeStand = await page.evaluate(() => window.__ersatz.lies("users/kind-1")?.gameState?.["lernapp.reise"]?.data);
    pruefe(stufeStand?.stufe === "schwer" && Number.isFinite(stufeStand?.stufeAt), `Schwierigkeitsstufe: am Konto steht ${JSON.stringify(stufeStand)} statt schwer`);
    pruefe(await page.locator('[data-kind-uid="kind-1"] [data-kind-stufe="schwer"][aria-pressed="true"]').count() === 1, "Schwierigkeitsstufe: der gewählte Knopf ist nicht als gewählt markiert");
    // Die Leseecke: wo sie beginnt und welche Schrift sie zeigt. Ein eigener
    // Kasten im gameState mit Zeitmarke, den das Gerät des Kindes übernimmt.
    const lesenKarte = page.locator('[data-kind-uid="kind-1"] .admin-lesen');
    pruefe(await lesenKarte.count() === 1, "Kind aufklappen: die Karte der Leseecke fehlt");
    pruefe(await lesenKarte.locator('[data-kind-lesen^="startpunkt:"]').count() === 6 && await lesenKarte.locator('[data-kind-lesen^="schrift:"]').count() === 3
      && await lesenKarte.locator('[data-kind-lesen^="groesse:"]').count() === 3 && await lesenKarte.locator('[data-kind-lesen^="hilfe:"]').count() === 2,
      "Leseecke: sechs Startpunkte, drei Schriften, drei Schriftgrössen und zwei Arten Wort-Hilfe erwartet");
    pruefe(await lesenKarte.locator('[data-kind-lesen="startpunkt:auto"][aria-pressed="true"]').count() === 1, "Leseecke: ohne Einstellung ist nicht «Nach Alter» gewählt");
    pruefe(await lesenKarte.locator('[data-kind-lesen="groesse:normal"][aria-pressed="true"]').count() === 1 && await lesenKarte.locator('[data-kind-lesen="hilfe:an"][aria-pressed="true"]').count() === 1,
      "Leseecke: ohne Einstellung ist nicht die normale Schrift mit Wort-Hilfe gewählt");
    // Der Lesebericht: Zähler aus Linas Kasten, nicht mehr. Ein Laut sitzt
    // nach drei Treffern an zwei Tagen (M, A), wackelt mit Fehlern (B); eine
    // einzelne Verwechslung (m und n) ist noch keine.
    const bericht = await lesenKarte.locator(".lesebericht-zeile").evaluateAll((zeilen) => Object.fromEntries(zeilen.map((z) => [z.querySelector("span").textContent, z.querySelector("strong").textContent])));
    const berichtSoll = {
      "Gelesene oder gehörte Wörter": "340",
      "Bücher gelesen": "2, davon 1 mit allen Fragen richtig",
      "Runden in den Lesespielen": "8",
      "Lesewagen eingerichtet": "5 von 15",
      // 8 Runden sind 8 Buchstaben: Stufe 5 des ersten Lebens (1 + 2 + 2 + 3).
      "Lesewurm": "Lesefalter, Stufe 5 von 15",
      "Laute, die sitzen": "M · A",
      "Laute, die noch wackeln": "B",
      "Oft verwechselt": "b und d (3×)",
      "Am meisten gespielt": "Silbenzug (5), Buchstabenhaus (2), Stimmt das? (1)",
      "Bestwert auf Zeit (45 Sekunden)": "Stimmt das?: 11",
      "Von selbst angepasst": "Stimmt das? (schwerer)",
    };
    Object.entries(berichtSoll).forEach(([frage, soll]) => pruefe(bericht[frage] === soll, `Lesebericht: «${frage}» zeigt ${JSON.stringify(bericht[frage])} statt ${soll}`));
    pruefe(Object.keys(bericht).length === Object.keys(berichtSoll).length, `Lesebericht: ${Object.keys(bericht).join(", ")}`);
    await lesenKarte.locator('[data-kind-lesen="startpunkt:woerter"]').click({ timeout: 5000 });
    await page.waitForFunction(() => /Leseecke ist eingestellt/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 10000 }).catch(() => {});
    await page.locator('[data-kind-uid="kind-1"] .admin-lesen [data-kind-lesen="schrift:gross"]').click({ timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('[data-kind-uid="kind-1"] [data-kind-lesen="schrift:gross"]')?.getAttribute("aria-pressed") === "true", null, { timeout: 10000 }).catch(() => {});
    // Die Schrift in den Büchern und die Wort-Hilfe: dieselbe Art Knopf, derselbe Kasten.
    await page.locator('[data-kind-uid="kind-1"] .admin-lesen [data-kind-lesen="groesse:gross"]').click({ timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('[data-kind-uid="kind-1"] [data-kind-lesen="groesse:gross"]')?.getAttribute("aria-pressed") === "true", null, { timeout: 10000 }).catch(() => {});
    await page.locator('[data-kind-uid="kind-1"] .admin-lesen [data-kind-lesen="hilfe:aus"]').click({ timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('[data-kind-uid="kind-1"] [data-kind-lesen="hilfe:aus"]')?.getAttribute("aria-pressed") === "true", null, { timeout: 10000 }).catch(() => {});
    const lesenStand = await page.evaluate(() => window.__ersatz.lies("users/kind-1")?.gameState?.["lernapp.lesen.eltern"]);
    pruefe(lesenStand?.data?.startpunkt === "woerter" && lesenStand?.data?.schrift === "gross" && lesenStand?.data?.groesse === "gross" && lesenStand?.data?.hilfe === "aus"
      && Number.isFinite(lesenStand?.data?.at) && Number.isFinite(lesenStand?.updatedAt),
      `Leseecke: am Konto steht ${JSON.stringify(lesenStand)} statt Wörter, Grossbuchstaben, grosse Schrift und keine Wort-Hilfe`);
    pruefe((await page.evaluate(() => window.__ersatz.lies("users/kind-1")?.gameState?.["lernapp.reise"]?.data?.stufe)) === "schwer",
      "Leseecke: das Einstellen hat die Schwierigkeitsstufe überschrieben");
    // Die Buchstaben der Schule: abhaken ist noch kein Schreiben, erst
    // «Speichern» – und «Nach Reihenfolge» nimmt die Haken wieder weg.
    const lauteKarte = () => page.locator('[data-kind-uid="kind-1"] .admin-lesen');
    pruefe(await lauteKarte().locator('[data-kind-laute="reihe"][aria-pressed="true"]').count() === 1, "Buchstaben der Schule: ohne Haken ist nicht «Nach Reihenfolge» gewählt");
    await lauteKarte().locator('[data-kind-laute="abhaken"]').click({ timeout: 5000 });
    const chips = lauteKarte().locator("[data-kind-laut]");
    pruefe(await chips.count() === 36, `Buchstaben der Schule: ${await chips.count()} Knöpfe statt 36`);
    pruefe(await lauteKarte().locator('[data-kind-laut][aria-pressed="true"]').count() === 6, "Buchstaben der Schule: vorgeschlagen sind nicht die ersten sechs");
    await lauteKarte().locator('[data-kind-laut="s"]').click({ timeout: 5000 });
    await lauteKarte().locator('[data-kind-laut="e"]').click({ timeout: 5000 });
    await lauteKarte().locator('[data-kind-laut="sch"]').click({ timeout: 5000 });
    pruefe(await lauteKarte().locator('[data-kind-laut="sch"][aria-pressed="true"]').count() === 1 && await lauteKarte().locator('[data-kind-laut="s"][aria-pressed="false"]').count() === 1,
      "Buchstaben der Schule: ein Tipp hakt nicht ab oder nicht aus");
    pruefe(!(await page.evaluate(() => window.__ersatz.lies("users/kind-1")?.gameState?.["lernapp.lesen.eltern"]?.data?.bekannt)),
      "Buchstaben der Schule: schon ein Haken wird geschrieben, nicht erst «Speichern»");
    await page.waitForTimeout(300);
    await knips(page, "3a-buchstaben-abhaken");
    // Die Karte ist lang: Je nach Höhe des Leseberichts darüber sprang der
    // Dialog zwischen Zielen und Tippen der Maus weiter, und der Klick traf
    // einen anderen Knopf («Gross und klein»). Mit der Tastatur – Knopf
    // fokussieren, Enter – wirkt «Speichern» genauso, ohne Mausweg. Ginge
    // nichts in die Cloud, meldete es die Prüfung unten.
    await lauteKarte().locator("[data-kind-laute-speichern]").press("Enter", { timeout: 5000 });
    await page.waitForFunction(() => /Buchstaben abgehakt/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 10000 }).catch(() => {});
    const schule = await page.evaluate(() => window.__ersatz.lies("users/kind-1")?.gameState?.["lernapp.lesen.eltern"]?.data);
    pruefe(JSON.stringify(schule?.bekannt) === JSON.stringify(["m", "a", "l", "i", "o", "e", "sch"]) && schule?.startpunkt === "woerter" && schule?.schrift === "gross"
      && schule?.groesse === "gross" && schule?.hilfe === "aus",
      `Buchstaben der Schule: am Konto steht ${JSON.stringify(schule)} statt M A L I O E Sch (und Wörter, Grossbuchstaben, grosse Schrift, ohne Wort-Hilfe)`);
    pruefe(/Abgehakt: M · A · L · I · O · E · Sch/.test(await text(lauteKarte())), "Buchstaben der Schule: die abgehakten stehen nicht auf der Karte");
    await knips(page, "3a-buchstaben-der-schule");
    await lauteKarte().locator('[data-kind-laute="reihe"]').click({ timeout: 5000 });
    await page.waitForFunction(() => /festen Reihenfolge/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 10000 }).catch(() => {});
    const reihe = await page.evaluate(() => window.__ersatz.lies("users/kind-1")?.gameState?.["lernapp.lesen.eltern"]?.data);
    pruefe(reihe && reihe.bekannt === null && reihe.startpunkt === "woerter", `Buchstaben der Schule: «Nach Reihenfolge» lässt ${JSON.stringify(reihe)} stehen`);
    // Dieses Kind hat noch nichts gespielt. Früher stand deshalb ein Raster
    // aus 300 grauen Kästchen da, dazu eine Liste mit 15-mal "nie gespielt" –
    // viel Fläche für die Aussage "nichts". Jetzt steht ein Satz da.
    //
    // Die gefüllte Liste prüft check-adminbereich.mjs an Mia; hier zählt der
    // leere Fall, weil nur er hier vorkommt.
    const abdeckungEltern = await text(detail.locator(".admin-abdeckung"));
    pruefe(/Noch kein Spiel gespielt/.test(abdeckungEltern),
      `Kind aufklappen: der leere Fall steht nicht als Satz da: ${abdeckungEltern.slice(0, 200)}`);
    pruefe(!/nie gespielt/.test(abdeckungEltern) && !(await detail.locator(".abdeckung-punkte").count()),
      "Kind aufklappen: das alte Raster oder die «nie gespielt»-Liste steht noch da");
    await knips(page, "3a-kind-aufgeklappt");

    // Passwort neu setzen.
    await page.locator("[data-kind-passwort='kind-1']").click({ timeout: 5000 });
    const pwForm = page.locator("[data-kind-passwort-form]");
    pruefe(await pwForm.count() === 1, "Passwort neu: kein Formular an der Zeile");
    await knips(page, "3-passwort-neu");
    await pwForm.locator("input[name=passwort]").fill("5678");
    await pwForm.locator("button[type=submit]").click({ timeout: 5000 });
    await page.waitForFunction(() => /gilt ab sofort/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 5000 }).catch(() => {});
    pruefe((await text(kinderStatus(page))).includes("gilt ab sofort"), "Passwort neu: die Bestätigung fehlt in der Karte");
    pruefe(await page.locator("[data-kind-passwort-form]").count() === 0, "Passwort neu: das Formular bleibt nach dem Speichern stehen");
    const pw = anfragen.find((a) => a.pfad === "kind-passwort");
    pruefe(pw?.body?.uid === "kind-1" && pw?.body?.passwort === "5678" && pw?.token === "Bearer token-attrappe", "Passwort neu: der Aufruf trägt nicht uid, Passwort und Token");

    // Jetzt kaufen: der Server nennt die Kasse, die Seite geht hin – hier
    // zurück auf die Startseite mit ?kauf=abbruch, als hätte jemand die Kasse
    // geschlossen.
    await page.locator("[data-kaufen]").click({ timeout: 5000 });
    await page.locator(".kauf-hinweis").waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    pruefe(anfragen.some((a) => a.pfad === "checkout" && a.token === "Bearer token-attrappe"), "Jetzt kaufen: die Kasse wurde nicht mit Token angerufen");
    pruefe((await text(page.locator(".kauf-hinweis"))).includes("nichts abgebucht"), "Rückkehr nach Abbruch: der Hinweis fehlt oder sagt etwas anderes");
    pruefe(await page.locator(".kauf-hinweis.is-ok").count() === 0, "Rückkehr nach Abbruch: der Hinweis ist grün, als wäre bezahlt");
    pruefe(!(await page.evaluate(() => window.location.search)).includes("kauf"), "Rückkehr: ?kauf= bleibt in der Adresse stehen – ein Neuladen zeigte den Hinweis noch einmal");
    pruefe(await page.locator("[data-kaufen]").count() === 1, "Rückkehr nach Abbruch: der Kaufknopf ist weg, obwohl nicht gekauft wurde");
    await knips(page, "4-rueckkehr-abbruch");

    // --- Der Verkaufsbildschirm hinter dem Elterntor ----------------------------
    // Dorthin führt die Schranke eines Kindes, wenn ein Erwachsener die
    // Rechenaufgabe gelöst hat (entitlement.js → firebase.js, openKauf). Für
    // ein angemeldetes Elternkonto steht dort kein Formular mehr, sondern der
    // Preis und ein Knopf, der an die Kasse führt.
    const vorher = anfragen.filter((a) => a.pfad === "checkout").length;
    await page.evaluate(() => window.LernappFirebase.openKauf());
    await page.locator(".kauf-seite").waitFor({ timeout: 5000 });
    const kaufSeite = page.locator(".kauf-seite");
    pruefe((await text(kaufSeite)).includes("CHF 30"), "Verkaufsbildschirm: der Preis steht nicht da");
    pruefe((await text(kaufSeite)).includes("Familie"), "Verkaufsbildschirm: es steht nicht da, dass der Kauf für die Familie gilt");
    pruefe(await kaufSeite.locator(".kauf-vorteile li").count() === 5, `Verkaufsbildschirm: ${await kaufSeite.locator(".kauf-vorteile li").count()} Punkte statt 5`);
    pruefe(await kaufSeite.locator("[data-kauf-form]").count() === 0, "Verkaufsbildschirm: ein angemeldetes Elternkonto bekommt trotzdem das Anmeldeformular");
    pruefe(await kaufSeite.locator(".auth-tabs").count() === 0, "Verkaufsbildschirm: die Reiter Kind/Eltern stehen da");
    pruefe(await kaufSeite.locator('[href="agb.html"]').count() === 1, "Verkaufsbildschirm: die AGB sind nicht verlinkt");
    await knips(page, "5-verkaufsbildschirm");
    await kaufSeite.locator("[data-kaufen]").click({ timeout: 5000 });
    await page.waitForTimeout(600);
    pruefe(anfragen.filter((a) => a.pfad === "checkout").length === vorher + 1, "Verkaufsbildschirm: der Kaufknopf ruft die Kasse nicht an");
    await context.close();
  }

  // --- 1b) Zurücksetzen, Löschen und die Wagen der Familie -----------------------
  // Der Kern der Sache: Was Eltern hier tun, gilt für ihre Familie – und für
  // niemanden sonst. Deshalb steht neben jedem Konto der Familie ein fremdes
  // Konto in denselben Daten, und nach jedem Schritt wird nachgesehen, dass es
  // unberührt geblieben ist.
  {
    let geloescht = null;
    const { page, context, anfragen } = await starteSeite({
      daten: {
        "users/eltern1": elternDoc([{ uid: "kind-mia", name: "Mia" }, { uid: "kind-ben", name: "Ben" }]),
        "users/kind-mia": kindDoc("Mia", "eltern1"),
        "users/kind-ben": kindDoc("Ben", "eltern1"),
        // Eine fremde Familie, die nichts davon mitbekommen darf.
        "users/fremd": kindDoc("Fremd", "fremde-eltern"),
        "users/kind-mia/levelProgress/arukone_a1": { game: "arukone", levelId: "a1", levelName: "Rätsel eins", solved: true, attempts: 2, timeSeconds: 90 },
        "users/kind-mia/sessions/s1": { game: "arukone", levelId: "a1", startedAt: 1, solved: true, durationSeconds: 90 },
        "users/fremd/levelProgress/arukone_a1": { game: "arukone", levelId: "a1", solved: true, attempts: 1, timeSeconds: 30 },
      },
      nutzer: ELTERN,
      antworten: {
        "kind-loeschen": ({ body }) => { geloescht = body?.uid; return { body: { uid: body?.uid, name: "Ben", geloescht: { level: 0, sitzungen: 0 } } }; },
      },
    });
    await oeffneProfil(page);

    // Zurücksetzen: die Rückfrage nennt den Namen, und erst danach passiert es.
    await page.locator("[data-kind-auf='kind-mia']").click({ timeout: 5000 });
    await page.locator("[data-kind-reset='kind-mia']").click({ timeout: 10000 });
    const frage = page.locator("[data-kind-uid='kind-mia'] .admin-reset.is-confirming");
    pruefe(await frage.count() === 1, "Zurücksetzen: keine Rückfrage");
    pruefe((await text(frage)).includes("Mia"), "Zurücksetzen: die Rückfrage nennt das Kind nicht beim Namen");
    await page.locator("[data-kind-reset-ja='kind-mia']").click({ timeout: 5000 });
    await page.waitForFunction(() => /Zug beginnt wieder/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 15000 }).catch(() => {});
    const nachReset = await page.evaluate(() => ({
      mia: window.__ersatz.lies("users/kind-mia/levelProgress/arukone_a1"),
      miaSitzung: window.__ersatz.lies("users/kind-mia/sessions/s1"),
      miaMarke: Boolean(window.__ersatz.lies("users/kind-mia")?.progressReset),
      fremd: window.__ersatz.lies("users/fremd/levelProgress/arukone_a1"),
      ben: window.__ersatz.lies("users/kind-ben"),
    }));
    pruefe(!nachReset.mia, "Zurücksetzen: die Level des Kindes stehen noch da");
    pruefe(!nachReset.miaSitzung, "Zurücksetzen: die Sitzungen des Kindes stehen noch da");
    pruefe(nachReset.miaMarke, "Zurücksetzen: die Marke am Konto fehlt – das Gerät des Kindes schöbe seinen alten Stand wieder hoch");
    pruefe(Boolean(nachReset.fremd), "Zurücksetzen: es hat ein fremdes Konto getroffen");
    pruefe(!nachReset.ben?.progressReset, "Zurücksetzen: es hat das Geschwisterkind mitgetroffen");
    await knips(page, "3b-zuruecksetzen");

    // Löschen: Rückfrage, dann der Aufruf an den Server.
    await page.locator("[data-kind-auf='kind-ben']").click({ timeout: 5000 });
    await page.locator("[data-kind-weg='kind-ben']").click({ timeout: 10000 });
    pruefe((await text(page.locator("[data-kind-uid='kind-ben'] .admin-reset.is-confirming"))).includes("Ben"), "Löschen: keine Rückfrage mit Namen");
    await page.locator("[data-kind-weg-ja='kind-ben']").click({ timeout: 5000 });
    // Auf die FERTIGE Meldung warten, nicht auf "wird gelöscht": Die beiden
    // unterscheiden sich nur am Ende des Satzes, und wer auf das Wort
    // "gelöscht" wartet, misst den Stand vor dem Serveraufruf.
    await page.waitForFunction(() => /wieder frei/.test(document.querySelector("[data-kinder-karte] .karten-status")?.textContent || ""), null, { timeout: 10000 }).catch(() => {});
    pruefe(geloescht === "kind-ben", `Löschen: der Server wurde mit ${geloescht} statt kind-ben angerufen`);
    pruefe(anfragen.some((a) => a.pfad === "kind-loeschen" && a.token === "Bearer token-attrappe"), "Löschen: der Aufruf trägt nicht das Token des Kontos");
    pruefe(await page.locator("[data-kind-uid='kind-ben']").count() === 0, "Löschen: das Kind steht noch in der Liste");
    pruefe((await text(page.locator(".kinder-kopf"))).includes("1 von 4"), "Löschen: der Kopf zählt das gelöschte Kind noch mit");

    // Die Wagen der Familie: umstellen schreibt das Set an jedes Konto der
    // Familie – und an keines ausserhalb. Das ist der ganze Unterschied zum
    // Adminbereich, wo derselbe Wechsel für alle gilt.
    const wagen = page.locator("[data-wagen-karte]");
    pruefe(await wagen.count() === 1, "Wagen: die Karte der Familie fehlt");
    pruefe((await text(wagen)).includes("wie bei allen"), "Wagen: ohne eigene Wahl steht nicht da, dass das Set für alle gilt");
    await wagen.locator("[data-wagen-set='2']").click({ timeout: 5000 });
    pruefe(await page.locator("[data-wagen-ja='2']").count() === 1, "Wagen: keine Rückfrage vor dem Wechsel");
    pruefe((await text(page.locator(".admin-set-confirm"))).includes("deiner Familie"), "Wagen: die Rückfrage sagt nicht, dass es die eigene Familie trifft");
    await page.locator("[data-wagen-ja='2']").click({ timeout: 5000 });
    await page.waitForFunction(() => /eigene Wahl/.test(document.querySelector("[data-wagen-karte]")?.textContent || ""), null, { timeout: 20000 }).catch(() => {});
    const nachWechsel = await page.evaluate(() => ({
      eltern: window.__ersatz.lies("users/eltern1")?.wagonSet?.id,
      mia: window.__ersatz.lies("users/kind-mia")?.wagonSet?.id,
      fremd: window.__ersatz.lies("users/fremd")?.wagonSet,
      global: window.__ersatz.lies("config/train"),
    }));
    pruefe(nachWechsel.eltern === "2", `Wagen: das Elternkonto steht auf ${nachWechsel.eltern} statt 2`);
    pruefe(nachWechsel.mia === "2", `Wagen: das Kind steht auf ${nachWechsel.mia} statt 2`);
    pruefe(!nachWechsel.fremd, "Wagen: ein fremdes Konto hat das Set der Familie bekommen");
    pruefe(!nachWechsel.global, "Wagen: die Familie hat config/train umgestellt – das gilt für alle");
    pruefe((await text(wagen)).includes("eigene Wahl"), "Wagen: nach dem Wechsel steht nicht da, dass die Familie eine eigene Wahl hat");
    await knips(page, "3c-wagen-der-familie");
    await context.close();
  }

  // --- 2) Eltern mit Kauf und einem Kind -----------------------------------------
  {
    const { page, context } = await starteSeite({
      daten: { "users/eltern1": elternDoc([{ uid: "kind-mia", name: "Mia" }]), "entitlements/eltern1": KAUF },
      nutzer: ELTERN,
    });
    await oeffneProfil(page);
    const karte = await text(page.locator("[data-kauf-karte]"));
    pruefe(karte.includes("✓"), "Eltern mit Kauf: kein Haken auf der Kaufkarte");
    pruefe(karte.includes("Alle Kinder unten sind freigeschaltet"), "Eltern mit Kauf: der Satz zu den Kindern fehlt");
    pruefe(await page.locator("[data-kaufen]").count() === 0, "Eltern mit Kauf: es gibt noch einen Kaufknopf");
    pruefe((await text(page.locator(".kinder-kopf"))).includes("1 von 4 · alle freigeschaltet"), "Eltern mit Kauf: der Kopf der Kinderkarte sagt nicht 'alle freigeschaltet'");
    pruefe((await text(page.locator("[data-kind-uid='kind-mia'] .kind-name"))) === "Mia", "Eltern mit Kauf: Mia fehlt in der Liste");
    await knips(page, "5-eltern-mit-kauf");
    await context.close();
  }

  // --- 3) Kind mit Elternkonto, der Kauf kommt nach --------------------------------
  {
    const { page, context } = await starteSeite({
      daten: { "users/kind-mia": kindDoc("Mia", "eltern1"), "users/eltern1": elternDoc([{ uid: "kind-mia", name: "Mia" }]) },
      nutzer: MIA,
    });
    await oeffneProfil(page);
    pruefe((await text(page.locator("[data-kauf-karte]"))).includes("Noch nicht freigeschaltet"), "Kind ohne Kauf: die Karte sagt nicht 'Noch nicht freigeschaltet'");
    pruefe(await page.locator("[data-kaufen]").count() === 0, "Kind: ein Kaufknopf – kaufen können nur die Eltern");
    pruefe(await page.locator("[data-kinder-karte]").count() === 0, "Kind: eine Kinderkarte, obwohl nur Eltern Kinder haben");
    // Der Webhook schreibt den Kauf – die Karte muss von selbst umschalten.
    await page.evaluate((kauf) => window.__ersatz.setze("entitlements/kind-mia", { ...kauf, via: "eltern1" }), KAUF);
    await page.waitForFunction(() => /✓/.test(document.querySelector("[data-kauf-karte]")?.textContent || ""), null, { timeout: 8000 }).catch(() => {});
    const nachher = await text(page.locator("[data-kauf-karte]"));
    pruefe(nachher.includes("✓"), "Kind: der Kauf kam an, aber die Karte zeigt keinen Haken");
    pruefe(nachher.includes("durch dein Elternkonto"), "Kind: die Karte sagt nicht, dass die Eltern freigeschaltet haben");
    pruefe(await page.evaluate(() => window.LernappFirebase.getEntitlement()?.active === true), "Kind: getEntitlement() meldet den Kauf nicht");
    await knips(page, "6-kind-nach-kauf");
    await context.close();
  }

  // --- 4) Gründer-Kind ohne Eltern ----------------------------------------------
  {
    const { page, context } = await starteSeite({ daten: { "users/kind-ben": kindDoc("Ben") }, nutzer: BEN });
    await oeffneProfil(page);
    pruefe((await text(page.locator("[data-kauf-karte]"))).includes("Gründer-Zugang"), "Gründer-Kind: die Karte sagt nicht 'Gründer-Zugang'");
    await knips(page, "7-gruender-kind");
    pruefe(await page.locator("[data-kaufen]").count() === 0, "Gründer-Kind: ein Kaufknopf");
    await context.close();
  }

  // --- 5) Zurück von der Kasse mit Erfolg ----------------------------------------
  {
    const { page, context } = await starteSeite({
      daten: { "users/eltern1": elternDoc() },
      nutzer: ELTERN,
      adresse: "/index.html?kauf=erfolg&session_id=cs_attrappe_123",
    });
    await page.locator(".kauf-hinweis").waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    pruefe(await page.locator(".kauf-hinweis.is-ok").count() === 1, "Rückkehr mit Erfolg: das Fenster öffnet sich nicht von selbst mit dem grünen Hinweis");
    pruefe((await text(page.locator(".kauf-hinweis"))).includes("in wenigen Sekunden"), "Rückkehr mit Erfolg, Kauf noch nicht da: der Hinweis verspricht nicht, dass die Freischaltung nachkommt");
    const adresse = await page.evaluate(() => window.location.search);
    pruefe(!adresse.includes("kauf") && !adresse.includes("session_id"), `Rückkehr mit Erfolg: die Adresse ist nicht sauber (${adresse})`);
    await page.evaluate((kauf) => window.__ersatz.setze("entitlements/eltern1", kauf), KAUF);
    await page.waitForFunction(() => /✓/.test(document.querySelector("[data-kauf-karte]")?.textContent || ""), null, { timeout: 8000 }).catch(() => {});
    pruefe((await text(page.locator("[data-kauf-karte]"))).includes("✓"), "Rückkehr mit Erfolg: der Kauf kam an, die Karte zeigt keinen Haken");
    pruefe((await text(page.locator(".kauf-hinweis"))).includes("ist freigeschaltet"), "Rückkehr mit Erfolg: der Hinweis bleibt beim 'kommt gleich', obwohl der Kauf da ist");
    await knips(page, "8-rueckkehr-erfolg");
    await context.close();
  }

  // --- 6) Die ganze App gratis ---------------------------------------------------
  // Der grosse Haken im Adminbereich (config/gratisSpiele, ganzeApp). Dann steht
  // im Profilfenster nirgends ein Preis: keine Kaufkarte, kein Kaufknopf, kein
  // Angebot hinter dem Elterntor, und auch direkt gerufen kein Weg zur Kasse.
  //
  // Und der Haken kann fallen, während das Fenster offen ist und jemand darin
  // tippt: Dann zeichnet sich nur die Kaufkarte neu, und der halb eingetippte
  // Name eines Kindes bleibt stehen.
  {
    // Die Kasse antwortet hier mit einem Fehler statt mit einer Adresse: Kommt
    // doch ein Aufruf durch, soll die Seite nicht wegnavigieren und die
    // Prüfung mitnehmen, sondern der Befund unten dastehen.
    const { page, context, anfragen } = await starteSeite({
      daten: { "users/eltern1": elternDoc(), "config/gratisSpiele": { spiele: [], ganzeApp: true } },
      nutzer: ELTERN,
      antworten: { "checkout": () => ({ status: 500, body: { error: "500", message: "Diese Prüfung lässt niemanden an die Kasse." } }) },
    });
    const fenster = page.locator(".account-modal:not(.hidden)");
    await page.locator(".account-button").click({ timeout: 5000 });
    await page.locator("[data-kinder-karte]").waitFor({ state: "visible", timeout: 10000 });
    pruefe(await page.locator("[data-kauf-karte]").count() === 0, "Ganze App gratis: die Kaufkarte steht noch da");
    pruefe(await page.locator("[data-kaufen]").count() === 0, "Ganze App gratis: es gibt noch einen Kaufknopf");
    const fensterText = await text(fenster);
    pruefe(!/CHF|kauf|Kasse|bezahl|Zahlung/i.test(fensterText),
      `Ganze App gratis: im Profilfenster steht noch etwas vom Kaufen: "${(fensterText.match(/.{0,40}(CHF|kauf|Kasse|bezahl|Zahlung).{0,40}/i) || [""])[0]}"`);
    pruefe(await page.locator("[data-kinder-karte]").count() === 1, "Ganze App gratis: die Kinderkarte fehlt – Kinder anlegen geht auch ohne Kauf");
    await knips(page, "9-ganze-app-gratis");

    // Hinter dem Elterntor: kein Angebot, sondern dass alles offen ist.
    await page.evaluate(() => window.LernappFirebase.openKauf());
    await page.locator(".kauf-seite").waitFor({ timeout: 5000 });
    const seiteText = await text(page.locator(".kauf-seite"));
    pruefe(/Alles ist offen/.test(seiteText), `Ganze App gratis: der Verkaufsbildschirm sagt nicht, dass alles offen ist: "${seiteText.slice(0, 120)}"`);
    pruefe(!/CHF|kaufen|bezahl|Kasse/i.test(seiteText), `Ganze App gratis: der Verkaufsbildschirm nennt Preis oder Kasse: "${seiteText.slice(0, 160)}"`);
    pruefe(await page.locator(".kauf-seite [data-kaufen], .kauf-seite [data-kauf-form]").count() === 0, "Ganze App gratis: der Verkaufsbildschirm hat einen Kaufknopf oder ein Kaufformular");
    const hilfe = () => page.evaluate(() => window.LernappKids?.currentHelp?.() || "");
    pruefe(/offen/.test(await hilfe()) && !/kostet/.test(await hilfe()), `Ganze App gratis: der Lautsprecher sagt zum Verkaufsbildschirm: "${await hilfe()}"`);
    await knips(page, "9b-alles-offen");
    // Die Kasse selbst, direkt gerufen: kein Weg zu Stripe, kein Aufruf beim Server.
    const kasse = await page.evaluate(() => window.LernappFirebase.zurKasse().then(() => "offen", (e) => e?.code || "fehler"));
    pruefe(kasse === "lernapp/app-gratis", `Ganze App gratis: zurKasse() lässt durch oder scheitert anders (${kasse})`);
    pruefe(!anfragen.some((a) => a.pfad === "checkout"), "Ganze App gratis: die Kasse wurde trotzdem beim Server angerufen");
    // Der Haken fällt, während der Verkaufsbildschirm offen ist: Die Seite und
    // der Satz des Lautsprechers wechseln mit – in beide Richtungen. Sonst läse
    // er den Preis weiter vor, während die Seite schon "Alles ist offen" zeigt.
    await page.evaluate(() => window.__ersatz.setze("config/gratisSpiele", { spiele: [], ganzeApp: false }));
    await page.waitForFunction(() => /CHF 30/.test(document.querySelector(".kauf-seite")?.textContent || ""), null, { timeout: 5000 }).catch(() => {});
    pruefe(/CHF 30/.test(await text(page.locator(".kauf-seite"))), "Haken weg bei offenem Verkaufsbildschirm: das Angebot kommt nicht zurück");
    pruefe(/kostet/.test(await hilfe()), `Haken weg bei offenem Verkaufsbildschirm: der Lautsprecher sagt nicht, was es kostet: "${await hilfe()}"`);
    await page.evaluate(() => window.__ersatz.setze("config/gratisSpiele", { spiele: [], ganzeApp: true }));
    await page.waitForFunction(() => /Alles ist offen/.test(document.querySelector(".kauf-seite")?.textContent || ""), null, { timeout: 5000 }).catch(() => {});
    pruefe(/Alles ist offen/.test(await text(page.locator(".kauf-seite"))), "Haken wieder an bei offenem Verkaufsbildschirm: das Angebot bleibt stehen");
    pruefe(!/kostet/.test(await hilfe()), `Haken wieder an bei offenem Verkaufsbildschirm: der Lautsprecher liest weiter den Preis vor: "${await hilfe()}"`);
    if (await page.locator("[data-kauf-fertig]").count()) await page.locator("[data-kauf-fertig]").click({ timeout: 5000 });
    else await page.locator(".account-close").click({ timeout: 5000 });

    // Der Haken fällt, während jemand im Fenster tippt.
    await page.locator(".account-button").click({ timeout: 5000 });
    await page.locator("[data-kind-neu]").click({ timeout: 10000 });
    const kindName = page.locator('[data-kind-neu-form] input[name="name"]');
    await kindName.fill("Lina");
    await page.evaluate(() => window.__ersatz.setze("config/gratisSpiele", { spiele: [], ganzeApp: false }));
    await page.waitForFunction(() => Boolean(document.querySelector("[data-kaufen]")), null, { timeout: 5000 }).catch(() => {});
    pruefe((await text(page.locator("[data-kaufen]"))).includes("CHF 30"), "Haken weg bei offenem Fenster: die Kaufkarte kommt nicht zurück");
    pruefe(await kindName.inputValue().catch(() => "") === "Lina", "Haken weg bei offenem Fenster: das ganze Fenster wurde neu gezeichnet – der eingetippte Name ist weg");
    // Und wieder an: Die Karte geht, der Name bleibt.
    await page.evaluate(() => window.__ersatz.setze("config/gratisSpiele", { spiele: [], ganzeApp: true }));
    await page.waitForFunction(() => !document.querySelector("[data-kauf-karte]"), null, { timeout: 5000 }).catch(() => {});
    pruefe(await page.locator("[data-kauf-karte]").count() === 0, "Haken wieder an bei offenem Fenster: die Kaufkarte bleibt stehen");
    pruefe(await kindName.inputValue().catch(() => "") === "Lina", "Haken wieder an bei offenem Fenster: der eingetippte Name ist weg");
    await context.close();
  }
  // Das Kind ohne Kauf: kein "noch nicht freigeschaltet", denn es ist frei.
  {
    const { page, context } = await starteSeite({
      daten: { "users/kind-mia": kindDoc("Mia", "eltern1"), "config/gratisSpiele": { ganzeApp: true } },
      nutzer: MIA,
    });
    await page.locator(".account-button").click({ timeout: 5000 });
    await page.locator(".profile-summary").waitFor({ state: "visible", timeout: 10000 });
    await page.waitForTimeout(300);
    pruefe(await page.locator("[data-kauf-karte]").count() === 0, "Ganze App gratis: das Kind ohne Kauf sieht eine Kaufkarte");
    pruefe(!(await text(page.locator(".account-modal:not(.hidden)"))).includes("Noch nicht freigeschaltet"), "Ganze App gratis: das Kind liest «Noch nicht freigeschaltet»");
    pruefe(await page.evaluate(() => window.LernappEntitlement?.isFree?.() === true), "Ganze App gratis: das Kind ohne Kauf ist für die Schranke nicht frei");
    await context.close();
  }
  // Die Familie mit Kauf behält ihren Haken: Das ist kein Angebot, sondern ihr
  // Stand – und der gilt auch, wenn der grosse Haken wieder weg ist.
  {
    const { page, context } = await starteSeite({
      daten: { "users/eltern1": elternDoc([{ uid: "kind-mia", name: "Mia" }]), "entitlements/eltern1": KAUF, "config/gratisSpiele": { ganzeApp: true } },
      nutzer: ELTERN,
    });
    await oeffneProfil(page);
    pruefe((await text(page.locator("[data-kauf-karte]"))).includes("✓"), "Ganze App gratis: die Familie mit Kauf sieht ihren Haken nicht mehr");
    pruefe(await page.locator("[data-kaufen]").count() === 0, "Ganze App gratis: die Familie mit Kauf hat einen Kaufknopf");
    await context.close();
  }
} finally {
  await browser.close();
  halt();
}

if (fehler.length) befunde.push(...fehler.map((f) => `Fehler auf der Seite: ${f}`));
if (befunde.length) {
  console.error("Der Elternbereich stimmt nicht:");
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Der Elternbereich tut, was er soll: kaufen, Kinder anlegen, aufklappen, Passwort neu, Schwierigkeitsstufe, Leseecke mit Lesebericht, zurücksetzen, löschen, die Wagen der Familie, der Verkaufsbildschirm – und nichts davon trifft eine fremde Familie.");
