/*
 * Tun die Firestore-Regeln, was sie sagen?
 * ---------------------------------------------------------------------------
 * firestore.rules ist die einzige Schranke vor den Daten: Was hier durchgeht,
 * geht in der Datenbank durch. Und die Regeln lügen leicht – ein rekursiver
 * Platzhalter, der auf ein Pfadstück mehr passt als gedacht, öffnet still,
 * was drei Zeilen darüber ausdrücklich zu ist. Genau das war hier der Fall:
 * Ein Kind konnte sich in jede Gruppe schreiben, obwohl die Regel es verbot.
 *
 * Deshalb wird nicht gelesen, sondern probiert. Der Firestore-Emulator lädt
 * die Regeln, und für jede Rolle wird versucht, was sie darf und was nicht:
 *
 *   Kind         das eigene Konto, die eigenen Level, fremde Konten
 *   Gruppe       Konto und Level eines Mitglieds lesen, sonst nichts
 *   Fremde       nichts
 *   Admin        alles lesen, zurücksetzen, Gruppen setzen – nicht mehr
 *   Gast         nur den eigenen Gastkasten, nur ohne Anmeldung
 *
 * Läuft ohne Netz und ohne Zugangsdaten. Braucht Java (für den Emulator) und
 * einmalig `npm install`. Startet den Emulator selbst und beendet ihn.
 *
 *   npm run test:rules          oder          node scripts/test-rules.mjs
 *
 * Der Emulator nimmt übrigens auch Regeln mit Syntaxfehlern an, ohne zu
 * klagen – er verweigert dann einfach alles. Das fängt dieser Test mit: Die
 * "darf"-Fälle schlagen fehl, und die Ursache steht in firestore-debug.log.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PROJEKT = "demo-gripszug-rules";

// ---------------------------------------------------------------------------
// Aussen: den Emulator starten und sich selbst darin noch einmal aufrufen
// ---------------------------------------------------------------------------
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  const java = spawnSync("java", ["-version"], { stdio: "ignore" });
  if (java.error || java.status !== 0) {
    console.error("Java fehlt – ohne Java startet der Firestore-Emulator nicht.");
    console.error("Einmalig einrichten: https://adoptium.net (Temurin 17 oder neuer).");
    process.exit(2);
  }
  const firebase = path.join(WURZEL, "node_modules", ".bin", "firebase");
  if (!existsSync(firebase)) {
    console.error("firebase-tools fehlt – einmalig `npm install` im Wurzelverzeichnis.");
    process.exit(2);
  }
  const innen = `${JSON.stringify(process.execPath)} ${JSON.stringify(fileURLToPath(import.meta.url))}`;
  const lauf = spawnSync(firebase, ["emulators:exec", "--only", "firestore", "--project", PROJEKT, innen], {
    cwd: WURZEL,
    stdio: "inherit",
    env: { ...process.env, RULES_TEST_INNEN: "1", RULES_DATEI: process.env.RULES_DATEI || "" },
  });
  process.exit(lauf.status ?? 1);
}

// ---------------------------------------------------------------------------
// Innen: die Prüfungen
// ---------------------------------------------------------------------------
const { initializeTestEnvironment } = await import("@firebase/rules-unit-testing");
// Das SDK meldet jede Ablehnung als Fehler auf der Konsole. Hier ist jede
// Ablehnung Absicht – und das Rauschen verdeckte die Befunde.
try { (await import("firebase/firestore")).setLogLevel("silent"); } catch { /* dann eben laut */ }

// RULES_DATEI zeigt auf eine andere Fassung – etwa, um zu zeigen, dass die
// alte die Lücke hatte:  git show main~5:firestore.rules > /tmp/alt.rules
const RULES_DATEI = process.env.RULES_DATEI ? path.resolve(process.env.RULES_DATEI) : path.join(WURZEL, "firestore.rules");
const rules = readFileSync(RULES_DATEI, "utf8");
console.log(`Regeln: ${path.relative(WURZEL, RULES_DATEI) || RULES_DATEI}`);
const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":");
const env = await initializeTestEnvironment({
  projectId: PROJEKT,
  firestore: { rules, host, port: Number(port) },
});

const befunde = [];
let geprueft = 0;

async function darf(was, tun) {
  geprueft += 1;
  try { await tun(); }
  catch (fehler) { befunde.push(`DARF NICHT, sollte aber: ${was}\n      ${kurz(fehler)}`); }
}
async function darfNicht(was, tun) {
  geprueft += 1;
  try { await tun(); befunde.push(`DARF, sollte aber nicht: ${was}`); }
  catch (fehler) {
    // Nur eine Ablehnung durch die Regeln zählt – ein Netzfehler oder ein
    // Tippfehler im Test wäre auch eine Ausnahme, aber kein Beweis.
    if (!/PERMISSION_DENIED|permission-denied|insufficient permissions/i.test(String(fehler))) {
      befunde.push(`Fehler statt Ablehnung: ${was}\n      ${kurz(fehler)}`);
    }
  }
}
const kurz = (f) => String(f && f.message || f).split("\n")[0].slice(0, 160);

// Rollen. Die Kinder melden sich mit einer technischen Adresse an; der Admin
// mit seiner echten, und die muss verifiziert sein.
const ADMIN_MAIL = "alain.sc2@gmail.com";
const als = (uid, token) => env.authenticatedContext(uid, token).firestore();
const anna = () => als("anna", { email: "anna@lernapp.local", email_verified: false });
const bert = () => als("bert", { email: "bert@lernapp.local", email_verified: false });
const carl = () => als("carl", { email: "carl@lernapp.local", email_verified: false });
const dora = () => als("dora", { email: "dora@lernapp.local", email_verified: false });
const neu = () => als("neu", { email: "neu@lernapp.local", email_verified: false });
const admin = () => als("admin", { email: ADMIN_MAIL, email_verified: true });
const adminOhneVerifikation = () => als("admin2", { email: ADMIN_MAIL, email_verified: false });
const gast = () => env.unauthenticatedContext().firestore();
const GAST_ID = "guest_abcdefghijkl";

// Ausgangslage, an den Regeln vorbei: vier Kinder, zwei davon in einer
// Gruppe, eines in einer anderen, eines in keiner. Dazu das Wagen-Set.
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await db.doc("users/anna").set({ username: "Anna", group: { id: "familie", name: "Familie" }, stats: { solved: 3 } });
  await db.doc("users/bert").set({ username: "Bert", group: { id: "familie", name: "Familie" } });
  await db.doc("users/carl").set({ username: "Carl" });
  await db.doc("users/dora").set({ username: "Dora", group: { id: "andere", name: "Andere" } });
  await db.doc("users/anna/levelProgress/arukone.A1-1").set({ solved: true });
  await db.doc("users/anna/sessions/s1").set({ startedAt: 1, solved: true });
  await db.doc("config/train").set({ wagonSet: "1", switchedAtMs: 1 });
  await db.doc(`guests/${GAST_ID}`).set({ type: "guest", guestId: GAST_ID });
});

try {
  // --- Das eigene Konto ------------------------------------------------------
  await darf("Kind liest eigenes Konto", () => anna().doc("users/anna").get());
  await darf("Kind ändert eigenen Namen", () => anna().doc("users/anna").update({ username: "Anni" }));
  await darf("Kind schreibt Spielstand und Einstellungen", () => anna().doc("users/anna").set({ gameState: { memory: { best: {} } }, trainSettings: { loco: "rot" } }, { merge: true }));
  await darf("Kind legt neues Konto an", () => neu().doc("users/neu").set({ username: "Neu" }));
  await darf("Kind löscht eigenes Konto", () => neu().doc("users/neu").delete());
  await darfNicht("Kind legt Konto unter fremder Kennung an", () => carl().doc("users/carl2").set({ username: "Carl" }));

  // Die Lücke von früher: group gehört dem Admin. Drei Wege, sie zu setzen –
  // alle drei müssen zu sein.
  await darfNicht("Kind schreibt sich per update in eine Gruppe", () => anna().doc("users/anna").update({ group: { id: "andere" } }));
  await darfNicht("Kind schreibt sich per set+merge in eine Gruppe", () => anna().doc("users/anna").set({ group: { id: "andere" } }, { merge: true }));
  await darfNicht("Kind legt Konto samt Gruppe an", () => neu().doc("users/neu").set({ username: "N", group: { id: "familie" } }));
  await darfNicht("Kind nimmt sich aus der Gruppe", () => anna().doc("users/anna").update({ group: null }));

  // --- Fremde Konten ---------------------------------------------------------
  await darfNicht("Fremdes Kind liest Konto", () => carl().doc("users/anna").get());
  await darfNicht("Fremdes Kind schreibt Konto", () => carl().doc("users/anna").update({ username: "X" }));
  await darfNicht("Fremdes Kind löscht Konto", () => carl().doc("users/anna").delete());
  await darfNicht("Fremdes Kind liest Level", () => carl().doc("users/anna/levelProgress/arukone.A1-1").get());
  await darfNicht("Fremdes Kind schreibt Level", () => carl().doc("users/anna/levelProgress/x").set({ solved: true }));
  await darfNicht("Fremdes Kind liest Sitzung", () => carl().doc("users/anna/sessions/s1").get());
  await darfNicht("Fremdes Kind listet alle Konten", () => carl().collection("users").get());

  // --- Die Gruppe ------------------------------------------------------------
  // Die Ausgangslage noch einmal herstellen: Wären die Schreibversuche oben
  // durchgegangen (bei einer Fassung der Regeln mit Lücke), stünde Anna jetzt
  // ohne Gruppe da – und jeder Befund hier unten wäre nur ein Echo davon.
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc("users/anna").set({ group: { id: "familie", name: "Familie" } }, { merge: true });
  });
  await darf("Gruppenmitglied liest Konto", () => bert().doc("users/anna").get());
  await darf("Gruppenmitglied liest Level", () => bert().doc("users/anna/levelProgress/arukone.A1-1").get());
  await darf("Gruppenmitglied listet Level", () => bert().collection("users/anna/levelProgress").get());
  await darfNicht("Gruppenmitglied liest Sitzung", () => bert().doc("users/anna/sessions/s1").get());
  await darfNicht("Gruppenmitglied schreibt Konto", () => bert().doc("users/anna").update({ username: "X" }));
  await darfNicht("Gruppenmitglied schreibt Level", () => bert().doc("users/anna/levelProgress/x").set({ solved: true }));
  await darfNicht("Andere Gruppe liest Konto", () => dora().doc("users/anna").get());
  await darfNicht("Andere Gruppe liest Level", () => dora().doc("users/anna/levelProgress/arukone.A1-1").get());
  // Ohne Gruppe ist niemand mit niemandem in derselben – auch nicht zwei
  // Konten, die beide keine haben.
  await darfNicht("Kind ohne Gruppe liest anderes Kind ohne Gruppe", () => carl().doc("users/carl").get().then(() => carl().doc("users/dora").get()));

  // --- Eigene Level und Sitzungen --------------------------------------------
  await darf("Kind schreibt eigenes Level", () => anna().doc("users/anna/levelProgress/kakuro.K1-1").set({ solved: true }));
  await darf("Kind schreibt eigene Sitzung", () => anna().doc("users/anna/sessions/s2").set({ startedAt: 2 }));
  await darf("Kind liest eigene Level", () => anna().collection("users/anna/levelProgress").get());
  await darfNicht("Kind schreibt in eine erfundene Unterkollektion", () => anna().doc("users/anna/geheim/x").set({ a: 1 }));
  await darfNicht("Kind liest eine erfundene Unterkollektion", () => anna().doc("users/anna/geheim/x").get());

  // --- Der Admin ---------------------------------------------------------------
  await darf("Admin liest fremdes Konto", () => admin().doc("users/anna").get());
  await darf("Admin listet alle Konten", () => admin().collection("users").get());
  await darf("Admin liest fremde Level", () => admin().collection("users/anna/levelProgress").get());
  await darf("Admin liest fremde Sitzungen", () => admin().collection("users/anna/sessions").get());
  await darf("Admin setzt Fortschritt zurück (stats, gameState, progressReset)", () => admin().doc("users/anna").update({ stats: {}, gameState: {}, progressReset: { atMs: 1, by: "admin" }, updatedAt: 1 }));
  await darf("Admin löscht fremde Level", () => admin().doc("users/anna/levelProgress/arukone.A1-1").delete());
  await darf("Admin löscht fremde Sitzungen", () => admin().doc("users/anna/sessions/s1").delete());
  await darf("Admin setzt Gruppe", () => admin().doc("users/carl").update({ group: { id: "familie", name: "Familie" }, updatedAt: 1 }));
  await darf("Admin nimmt aus der Gruppe", () => admin().doc("users/carl").update({ group: null, updatedAt: 1 }));
  await darfNicht("Admin ändert fremden Namen", () => admin().doc("users/anna").update({ username: "X" }));
  await darfNicht("Admin ändert fremde Lok", () => admin().doc("users/anna").update({ trainSettings: { loco: "x" } }));
  await darfNicht("Admin schaltet fremde Level frei", () => admin().doc("users/anna").update({ levelAccess: { unlockAllLevels: true } }));
  await darfNicht("Admin erfindet fremde Level", () => admin().doc("users/anna/levelProgress/neu").set({ solved: true }));
  await darfNicht("Admin erfindet fremde Sitzungen", () => admin().doc("users/anna/sessions/neu").set({ solved: true }));
  await darfNicht("Admin mischt Reset mit Namensänderung", () => admin().doc("users/anna").update({ stats: {}, username: "X" }));
  await darfNicht("Admin löscht fremdes Konto", () => admin().doc("users/anna").delete());
  await darfNicht("Admin ohne verifizierte Adresse liest fremdes Konto", () => adminOhneVerifikation().doc("users/anna").get());
  await darfNicht("Admin ohne verifizierte Adresse setzt Gruppe", () => adminOhneVerifikation().doc("users/carl").update({ group: { id: "x" }, updatedAt: 1 }));

  // --- Das Wagen-Set -----------------------------------------------------------
  await darf("Gast liest config/train", () => gast().doc("config/train").get());
  await darf("Kind liest config/train", () => anna().doc("config/train").get());
  await darf("Admin schreibt config/train", () => admin().doc("config/train").set({ wagonSet: "2", switchedAtMs: 2 }));
  await darfNicht("Kind schreibt config/train", () => anna().doc("config/train").set({ wagonSet: "1" }));
  await darfNicht("Gast schreibt config/train", () => gast().doc("config/train").set({ wagonSet: "1" }));

  // --- Gäste -------------------------------------------------------------------
  await darf("Gast legt Gastkasten an", () => gast().doc("guests/guest_neuerkasten1").set({ type: "guest" }));
  await darf("Gast schreibt seinen Kasten", () => gast().doc(`guests/${GAST_ID}`).set({ type: "guest", stats: { solved: 1 } }, { merge: true }));
  await darf("Gast schreibt eigenes Level", () => gast().doc(`guests/${GAST_ID}/levelProgress/x`).set({ solved: true }));
  await darf("Gast schreibt eigene Sitzung", () => gast().doc(`guests/${GAST_ID}/sessions/s`).set({ startedAt: 1 }));
  await darf("Admin liest Gastkasten", () => admin().doc(`guests/${GAST_ID}`).get());
  await darf("Admin liest Gast-Level", () => admin().collection(`guests/${GAST_ID}/levelProgress`).get());
  await darfNicht("Gast legt Kasten ohne type an", () => gast().doc("guests/guest_ohnetype123").set({ stats: {} }));
  await darfNicht("Gast legt Kasten mit falscher Kennung an", () => gast().doc("guests/hacker").set({ type: "guest" }));
  await darfNicht("Gast liest seinen eigenen Kasten", () => gast().doc(`guests/${GAST_ID}`).get());
  await darfNicht("Gast liest fremde Gastkästen", () => gast().collection("guests").get());
  await darfNicht("Gast löscht seinen Kasten", () => gast().doc(`guests/${GAST_ID}`).delete());
  await darfNicht("Gast löscht sein Level", () => gast().doc(`guests/${GAST_ID}/levelProgress/x`).delete());
  await darfNicht("Angemeldetes Kind schreibt einen Gastkasten", () => anna().doc("guests/guest_vonkind12345").set({ type: "guest" }));
  await darfNicht("Angemeldetes Kind liest einen Gastkasten", () => anna().doc(`guests/${GAST_ID}`).get());
  await darfNicht("Gast schreibt in erfundene Unterkollektion", () => gast().doc(`guests/${GAST_ID}/geheim/x`).set({ a: 1 }));
  await darfNicht("Admin schreibt Gastkasten", () => admin().doc(`guests/${GAST_ID}`).set({ type: "guest", x: 1 }, { merge: true }));

  // --- Alles andere ------------------------------------------------------------
  await darfNicht("Kind schreibt in fremde Kollektion", () => anna().doc("irgendwas/x").set({ a: 1 }));
  await darfNicht("Admin liest fremde Kollektion", () => admin().doc("irgendwas/x").get());
  await darfNicht("Gast liest users", () => gast().doc("users/anna").get());
} finally {
  await env.cleanup();
}

console.log(`\n${geprueft} Zugriffe probiert.`);
if (befunde.length) {
  console.error(`\n${befunde.length} Befund${befunde.length === 1 ? "" : "e"}:`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Regeln tun, was sie sagen.");
