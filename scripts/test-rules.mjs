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
 *   Eltern       das eigene Kind lesen, zurücksetzen, sein Wagen-Set setzen –
 *                nicht seinen Namen, nicht seine Gruppe, und kein fremdes Kind
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
const mama = () => als("mama", { email: "mama@example.com", email_verified: true });
const kind1 = () => als("kind1", { email: "kind1@lernapp.local", email_verified: false });
// Eine zweite Familie: ohne sie liesse sich nicht zeigen, dass ein
// Elternkonto nur an die EIGENEN Kinder darf.
const papa = () => als("papa", { email: "papa@example.com", email_verified: true });
const kind2 = () => als("kind2", { email: "kind2@lernapp.local", email_verified: false });
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
  // Ein Elternkonto (echte Adresse) mit einem Kind, und der Kauf dazu.
  await db.doc("users/mama").set({ username: "Mama", email: "mama@example.com", role: "parent", children: ["kind1"] });
  await db.doc("users/kind1").set({ username: "Kind 1", parentUid: "mama" });
  await db.doc("entitlements/mama").set({ plan: "familie", active: true });
  await db.doc("entitlements/kind1").set({ plan: "familie", active: true, via: "mama" });
  await db.doc("users/kind1/levelProgress/arukone.A1-1").set({ solved: true });
  await db.doc("users/kind1/sessions/s1").set({ startedAt: 1, solved: true });
  // Die zweite Familie. papa hat ein Kind, mama darf davon nichts wissen.
  await db.doc("users/papa").set({ username: "Papa", email: "papa@example.com", role: "parent", children: [{ uid: "kind2", name: "Kind 2" }] });
  await db.doc("users/kind2").set({ username: "Kind 2", parentUid: "papa" });
  await db.doc(`guests/${GAST_ID}`).set({ type: "guest", guestId: GAST_ID });
  // Die Post: eine verschickte Mail und die Weiterleitungsadresse.
  await db.doc("mails/willkommen-mama").set({ richtung: "aus", art: "willkommen", an: "mama@example.com", betreff: "Willkommen", zeitMs: 1 });
  await db.doc("mailConfig/einstellungen").set({ weiterleitungAn: "post@example.com", weiterleitungAktiv: true });
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

  // --- Eltern und ihre eigenen Kinder --------------------------------------------
  // Der Elternbereich zeigt Zug, Level und Sitzungen der eigenen Kinder und
  // lässt sie zurücksetzen. Die Grenze ist "eigen": Ein Elternkonto, das ein
  // fremdes Kind läse, läse eine fremde Familie.
  await darf("Eltern lesen das Konto ihres Kindes", () => mama().doc("users/kind1").get());
  await darf("Eltern lesen die Level ihres Kindes", () => mama().collection("users/kind1/levelProgress").get());
  await darf("Eltern lesen die Sitzungen ihres Kindes", () => mama().collection("users/kind1/sessions").get());
  await darf("Eltern setzen den Fortschritt ihres Kindes zurück", () => mama().doc("users/kind1").update({ stats: {}, gameState: {}, progressReset: { atMs: 1, by: "admin" }, updatedAt: 1 }));
  await darf("Eltern löschen die Level ihres Kindes", () => mama().doc("users/kind1/levelProgress/arukone.A1-1").delete());
  await darf("Eltern löschen die Sitzungen ihres Kindes", () => mama().doc("users/kind1/sessions/s1").delete());
  await darfNicht("Eltern ändern den Namen ihres Kindes", () => mama().doc("users/kind1").update({ username: "X" }));
  await darfNicht("Eltern setzen die Gruppe ihres Kindes", () => mama().doc("users/kind1").update({ group: { id: "fremd", name: "Fremd" }, updatedAt: 1 }));
  await darfNicht("Eltern setzen ihre eigene Gruppe", () => mama().doc("users/mama").update({ group: { id: "fremd", name: "Fremd" }, updatedAt: 1 }));
  await darfNicht("Eltern hängen sich ein fremdes Kind an", () => mama().doc("users/kind2").update({ parentUid: "mama", updatedAt: 1 }));
  await darfNicht("Eltern erfinden Level bei ihrem Kind", () => mama().doc("users/kind1/levelProgress/neu").set({ solved: true }));
  await darfNicht("Eltern löschen das Konto ihres Kindes", () => mama().doc("users/kind1").delete());
  await darfNicht("Eltern lesen ein fremdes Kind", () => papa().doc("users/kind1").get());
  await darfNicht("Eltern lesen die Level eines fremden Kindes", () => papa().collection("users/kind1/levelProgress").get());
  await darfNicht("Eltern setzen ein fremdes Kind zurück", () => papa().doc("users/kind1").update({ stats: {}, updatedAt: 1 }));
  await darfNicht("Eltern löschen die Level eines fremden Kindes", () => papa().doc("users/kind1/levelProgress/arukone.A1-1").delete());
  await darfNicht("Elternkonto listet alle Konten", () => mama().collection("users").get());

  // --- Das Wagen-Set einer Familie ------------------------------------------------
  // users/<uid>.wagonSet gilt für ein Konto und schlägt config/train, wenn es
  // neuer ist. Setzen darf es ein Elternkonto (für sich und seine Kinder) und
  // der Admin – nie das Kind selbst: Ein Wechsel setzt allen Fortschritt auf 0.
  //
  // Die "darf nicht"-Fälle stehen zuerst, und das ist kein Zufall: Sobald an
  // einem Konto ein Wagen-Set steht, ändert ein Schreiben desselben Werts
  // nichts – affectedKeys ist dann leer, und JEDE Regel lässt es durch. Ein
  // solcher Test wäre grün, ohne etwas über die Regel zu sagen. Also erst
  // schreiben lassen, was nicht dasteht.
  await darfNicht("Kind setzt sich selbst ein Wagen-Set", () => anna().doc("users/anna").update({ wagonSet: { id: "2", switchedAtMs: 9 } }));
  await darfNicht("Kind setzt sich per set+merge ein Wagen-Set", () => anna().doc("users/anna").set({ wagonSet: { id: "2", switchedAtMs: 8 } }, { merge: true }));
  await darfNicht("Kind mit Elternkonto setzt sich ein Wagen-Set", () => kind1().doc("users/kind1").update({ wagonSet: { id: "2", switchedAtMs: 9 } }));
  await darfNicht("Konto ohne Kinder setzt sich ein Wagen-Set", () => carl().doc("users/carl").update({ wagonSet: { id: "2", switchedAtMs: 9 }, updatedAt: 1 }));
  await darfNicht("Eltern setzen das Wagen-Set eines fremden Kindes", () => papa().doc("users/kind1").update({ wagonSet: { id: "2", switchedAtMs: 9 }, updatedAt: 1 }));
  await darfNicht("Eltern mischen Wagen-Set mit Namensänderung", () => mama().doc("users/kind1").update({ wagonSet: { id: "2", switchedAtMs: 7 }, username: "X" }));
  await darf("Eltern setzen das Wagen-Set ihres Kindes", () => mama().doc("users/kind1").update({ wagonSet: { id: "2", switchedAtMs: 9 }, updatedAt: 1 }));
  await darf("Eltern setzen ihr eigenes Wagen-Set", () => mama().doc("users/mama").update({ wagonSet: { id: "2", switchedAtMs: 9 }, updatedAt: 1 }));
  await darf("Eltern nehmen das Wagen-Set wieder weg", () => mama().doc("users/kind1").update({ wagonSet: null, updatedAt: 1 }));
  await darf("Admin setzt ein Wagen-Set", () => admin().doc("users/anna").update({ wagonSet: { id: "2", switchedAtMs: 9 }, updatedAt: 1 }));

  // --- Der Kauf ----------------------------------------------------------------
  await darf("Elternkonto liest eigenen Kauf", () => mama().doc("entitlements/mama").get());
  await darf("Kind liest eigenen Kauf", () => kind1().doc("entitlements/kind1").get());
  await darf("Kind ohne Kauf liest seinen (leeren) Eintrag", () => anna().doc("entitlements/anna").get());
  await darf("Admin liest fremden Kauf", () => admin().doc("entitlements/mama").get());
  await darf("Admin listet alle Käufe", () => admin().collection("entitlements").get());
  await darfNicht("Kind schreibt sich selbst einen Kauf", () => anna().doc("entitlements/anna").set({ plan: "familie", active: true }));
  await darfNicht("Elternkonto ändert eigenen Kauf", () => mama().doc("entitlements/mama").update({ active: true, plan: "lebenslang" }));
  await darfNicht("Elternkonto löscht eigenen Kauf", () => mama().doc("entitlements/mama").delete());
  await darfNicht("Kind liest fremden Kauf", () => anna().doc("entitlements/mama").get());
  await darfNicht("Kind liest den Kauf seines Elternkontos", () => kind1().doc("entitlements/mama").get());
  await darfNicht("Gast liest einen Kauf", () => gast().doc("entitlements/mama").get());
  await darfNicht("Admin schreibt einen Kauf von Hand", () => admin().doc("entitlements/anna").set({ plan: "familie", active: true }));
  // Auch die Gratis-Freischaltung nicht: Sie kommt über /api/freischalten,
  // also über das Admin-SDK an diesen Regeln vorbei. Was ein Client schreiben
  // könnte, wäre keine Schranke mehr.
  await darfNicht("Admin schenkt einen Zugang von Hand", () => admin().doc("entitlements/anna").set({ plan: "geschenk", active: true, source: "admin" }));
  await darfNicht("Elternkonto schenkt seinem Kind einen Zugang", () => mama().doc("entitlements/kind1").set({ plan: "geschenk", active: true }));
  await darfNicht("Admin löscht einen Kauf", () => admin().doc("entitlements/mama").delete());

  // --- Die Familie ---------------------------------------------------------------
  // parentUid und children schreibt der Server (oder der Admin) – nie das
  // Konto selbst: Wer sich einem fremden Elternkonto zuordnen könnte, erbte
  // dessen Kauf.
  await darfNicht("Kind ordnet sich per update einem Elternkonto zu", () => anna().doc("users/anna").update({ parentUid: "mama" }));
  await darfNicht("Kind ordnet sich per set+merge einem Elternkonto zu", () => anna().doc("users/anna").set({ parentUid: "mama" }, { merge: true }));
  await darfNicht("Neues Konto legt sich mit parentUid an", () => neu().doc("users/neu").set({ username: "N", parentUid: "mama" }));
  await darfNicht("Kind löst sich vom Elternkonto", () => kind1().doc("users/kind1").update({ parentUid: null }));
  await darfNicht("Konto trägt sich selbst Kinder ein", () => anna().doc("users/anna").update({ children: ["kind1"] }));
  await darfNicht("Elternkonto ändert seine Kinderliste selbst", () => mama().doc("users/mama").update({ children: ["kind1", "anna"] }));
  await darfNicht("Neues Konto legt sich mit children an", () => neu().doc("users/neu").set({ username: "N", children: ["anna"] }));
  await darf("Elternkonto ändert seinen Namen (children bleibt unberührt)", () => mama().doc("users/mama").update({ username: "Mami" }));
  await darf("Kind mit Elternkonto schreibt seinen Spielstand", () => kind1().doc("users/kind1").set({ gameState: { x: 1 } }, { merge: true }));
  await darf("Kind mit Elternkonto schreibt eigenes Level", () => kind1().doc("users/kind1/levelProgress/a").set({ solved: true }));
  // Lesen dürfen sie es seit dem Elternbereich – das steht oben bei "Eltern
  // und ihre eigenen Kinder". Schreiben weiterhin nicht, ausser den beiden
  // Feldern, die dort geprüft sind.
  await darfNicht("Elternkonto schreibt das Konto seines Kindes", () => mama().doc("users/kind1").update({ username: "X" }));
  await darf("Admin ordnet ein Kind einem Elternkonto zu", () => admin().doc("users/anna").update({ parentUid: "mama", updatedAt: 1 }));
  await darf("Admin schreibt die Kinderliste", () => admin().doc("users/mama").update({ children: ["kind1", "anna"], updatedAt: 1 }));
  await darfNicht("Admin mischt Zuordnung mit Namensänderung", () => admin().doc("users/anna").update({ parentUid: "mama", username: "X" }));
  await darfNicht("Admin ohne verifizierte Adresse ordnet zu", () => adminOhneVerifikation().doc("users/anna").update({ parentUid: "mama", updatedAt: 1 }));

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

  // --- Die Post ----------------------------------------------------------------
  // Der Adminbereich liest sie, sonst niemand – und geschrieben wird sie nur
  // vom Server. Auch der Admin darf hier nichts ändern: Ein Postausgang, in
  // dem sich Einträge nachträglich ändern lassen, beweist nichts mehr.
  await darf("Admin liest eine Mail", () => admin().doc("mails/willkommen-mama").get());
  await darf("Admin listet die Post", () => admin().collection("mails").get());
  await darf("Admin liest die Weiterleitungsadresse", () => admin().doc("mailConfig/einstellungen").get());
  await darfNicht("Elternkonto liest die eigene Post", () => mama().doc("mails/willkommen-mama").get());
  await darfNicht("Elternkonto listet die Post", () => mama().collection("mails").get());
  await darfNicht("Kind liest die Post", () => anna().doc("mails/willkommen-mama").get());
  await darfNicht("Gast liest die Post", () => gast().doc("mails/willkommen-mama").get());
  await darfNicht("Gast liest die Weiterleitungsadresse", () => gast().doc("mailConfig/einstellungen").get());
  await darfNicht("Elternkonto liest die Weiterleitungsadresse", () => mama().doc("mailConfig/einstellungen").get());
  await darfNicht("Admin schreibt eine Mail von Hand", () => admin().doc("mails/erfunden").set({ richtung: "aus", betreff: "X" }));
  await darfNicht("Admin ändert eine Mail", () => admin().doc("mails/willkommen-mama").update({ betreff: "Anders" }));
  await darfNicht("Admin löscht eine Mail", () => admin().doc("mails/willkommen-mama").delete());
  await darfNicht("Admin setzt die Weiterleitung von Hand", () => admin().doc("mailConfig/einstellungen").set({ weiterleitungAn: "fremd@example.com" }, { merge: true }));
  await darfNicht("Kind schreibt sich eine Mail", () => anna().doc("mails/erfunden").set({ richtung: "ein" }));
  // Die Bremse für "Passwort vergessen" gehört ganz dem Server: Wer sie lesen
  // könnte, wüsste, welche Adressen ein Konto haben.
  await darfNicht("Admin liest die Versandbremse", () => admin().doc("mailBremse/irgendwas").get());
  await darfNicht("Gast schreibt die Versandbremse", () => gast().doc("mailBremse/irgendwas").set({ zuletztMs: 0 }));

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
