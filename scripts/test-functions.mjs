/*
 * Tun die Netlify-Funktionen, was sie sollen – ohne Netz, ohne Geheimnis?
 * ---------------------------------------------------------------------------
 * Die Funktionen unter netlify/functions/ sind der Server hinter dem Kauf:
 * Sie legen Kinderkonten an, schicken die Eltern an die Kasse von Stripe und
 * schalten frei, wenn Stripe die Zahlung meldet. Alles davon läuft hier gegen
 * den Auth- und den Firestore-Emulator; Stripe wird nachgebaut, wo es die
 * Kasse betrifft, und mit einer echten Unterschrift geprüft, wo es den
 * Webhook betrifft (die Unterschrift rechnet die Stripe-Bibliothek selbst,
 * ohne Netz).
 *
 * Geprüft wird:
 *   - Client und Server rechnen aus demselben Namen dieselbe Adresse und aus
 *     demselben Passwort dasselbe Firebase-Passwort. Sonst könnte sich ein
 *     Kind, das der Server anlegt, nie anmelden.
 *   - Ein Elternkonto legt ein Kind an; das Kind kann sich anmelden; die
 *     Zuordnung steht an beiden Enden; ein Kind mit gleichem Namen scheitert;
 *     mehr als vier Kinder scheitern.
 *   - Die Kasse bekommt uid, Preis, Rückkehr-Adressen und die Zustimmung zum
 *     sofortigen Start; wer schon gekauft hat, wird nicht noch einmal geschickt.
 *   - Der Webhook schaltet Eltern und Kinder frei, genau einmal je Session;
 *     ein später angelegtes Kind bekommt den Kauf mit; eine Rückerstattung
 *     nimmt ihn allen wieder; eine falsche Unterschrift wird abgewiesen.
 *   - Eltern setzen das Passwort ihres Kindes neu, nicht das eines fremden.
 *   - Eltern löschen ihr eigenes Kind ganz – Konto, Fortschritt, Anmeldung –
 *     und kein fremdes.
 *   - Der Admin schaltet eine Familie gratis frei und nimmt es zurück; ein
 *     bezahlter Kauf bleibt dabei unberührt, und niemand sonst darf das.
 *   - Ohne Anmeldung 401, als Kind 403, als Eltern 200.
 *   - Die Post: Die Begrüssung geht einmal raus und kein zweites Mal; die
 *     Passwortmail nur an Adressen mit Konto und nicht im Sekundentakt; der
 *     Eingang nimmt ohne Geheimnis nichts an und leitet dieselbe Mail nicht
 *     zweimal weiter; die Bestellbestätigung hängt am Kauf und lässt ihn
 *     stehen, wenn sie scheitert. Resend wird dabei abgefangen, nicht
 *     angerufen.
 *
 *   npm run test:functions        oder        node scripts/test-functions.mjs
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import path from "node:path";
import vm from "node:vm";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, "..");
const PROJEKT = "demo-gripszug-fn";

function wegwerfSchluessel() {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    type: "service_account",
    project_id: PROJEKT,
    private_key_id: "attrappe",
    private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
    client_email: `attrappe@${PROJEKT}.iam.gserviceaccount.com`,
    client_id: "0",
    token_uri: "https://oauth2.googleapis.com/token",
  };
}

// ---------------------------------------------------------------------------
// Aussen: Emulatoren starten und sich selbst darin aufrufen
// ---------------------------------------------------------------------------
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  const java = spawnSync("java", ["-version"], { stdio: "ignore" });
  if (java.error || java.status !== 0) {
    console.error("Java fehlt – ohne Java starten die Firebase-Emulatoren nicht.");
    process.exit(2);
  }
  const firebase = path.join(WURZEL, "node_modules", ".bin", "firebase");
  if (!existsSync(firebase)) { console.error("firebase-tools fehlt – einmalig `npm install`."); process.exit(2); }
  const innen = `${JSON.stringify(process.execPath)} ${JSON.stringify(fileURLToPath(import.meta.url))}`;
  const lauf = spawnSync(firebase, ["emulators:exec", "--only", "auth,firestore", "--project", PROJEKT, innen], {
    cwd: WURZEL,
    stdio: "inherit",
    env: {
      ...process.env,
      GCLOUD_PROJECT: PROJEKT,
      // Ein Wegwerf-Schlüssel, damit das Admin-SDK ein Zertifikat hat.
      // Gegen den Emulator wird damit nie etwas unterschrieben, das ein
      // echter Dienst prüfen würde – er nimmt alles.
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify(wegwerfSchluessel()),
      STRIPE_SECRET_KEY: "attrappe-geheimer-schluessel",
      STRIPE_WEBHOOK_SECRET: "attrappe-webhook-geheimnis",
      STRIPE_PRICE_ID: "attrappe-preis",
      SITE_URL: "https://kids.alae.app",
    },
  });
  process.exit(lauf.status ?? 1);
}

// ---------------------------------------------------------------------------
// Innen
// ---------------------------------------------------------------------------
const befunde = [];
let geprueft = 0;
const ok = (bedingung, was) => { geprueft += 1; if (!bedingung) befunde.push(was); };
const wirft = async (fn, code, was) => {
  geprueft += 1;
  try { await fn(); befunde.push(`${was}: ging durch, sollte ${code} werfen`); }
  catch (fehler) { if (fehler?.code !== code) befunde.push(`${was}: warf ${fehler?.code || fehler?.message}, erwartet ${code}`); }
};

const { auth, db, FieldValue } = await import("../netlify/functions/_lib/firebase.mjs");
const kind = await import("../netlify/functions/_lib/kind.mjs");
const { anrufer, elternAnrufer, adminAnrufer, istAdminAdresse, ADMIN_ADRESSEN } = await import("../netlify/functions/_lib/anfrage.mjs");
const { kindAnlegen, default: kindAnlegenHandler } = await import("../netlify/functions/kind-anlegen.mjs");
const { kindPasswortSetzen } = await import("../netlify/functions/kind-passwort.mjs");
const { kindLoeschen, default: kindLoeschenHandler } = await import("../netlify/functions/kind-loeschen.mjs");
const { freischalten, default: freischaltenHandler } = await import("../netlify/functions/freischalten.mjs");
const { kasseErstellen } = await import("../netlify/functions/checkout.mjs");
const { kaufVerbuchen, rueckerstattungVerbuchen, default: webhookHandler } = await import("../netlify/functions/stripe-webhook.mjs");
const { default: statusHandler } = await import("../netlify/functions/status.mjs");
const { default: familieHandler } = await import("../netlify/functions/familie.mjs");
const { familieVerbinden, gruppenId } = await import("../netlify/functions/_lib/familie.mjs");
const { default: statusTiefHandler, pruefungenLaufen } = await import("../netlify/functions/status-tief.mjs");
const Stripe = (await import("stripe")).default;

// --- 1. Client und Server rechnen gleich ------------------------------------
{
  const stub = { firebase: undefined, addEventListener() {}, removeEventListener() {}, setInterval: () => 1, clearInterval() {}, setTimeout: () => 1, clearTimeout() {}, matchMedia: () => ({ matches: false, addEventListener() {} }), location: { href: "http://localhost/", origin: "http://localhost", search: "", pathname: "/" } };
  const element = () => ({ className: "", hidden: false, dataset: {}, style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, children: [], set innerHTML(v) {}, get innerHTML() { return ""; }, set textContent(v) {}, get textContent() { return ""; }, setAttribute() {}, getAttribute: () => null, append() {}, prepend() {}, remove() {}, focus() {}, addEventListener() {}, removeEventListener() {}, querySelector: () => element(), querySelectorAll: () => [], closest: () => null });
  const context = vm.createContext({
    window: stub, document: { body: element(), documentElement: element(), createElement: element, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, dispatchEvent: () => true, visibilityState: "visible" },
    navigator: { onLine: true, userAgent: "node" }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    CustomEvent: class { constructor(t, i = {}) { this.type = t; this.detail = i.detail; } }, console: { ...console, warn() {}, error() {} },
    setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, Promise, Date, Math, JSON, Object, Number, String, Boolean, Array, Map, Set, isNaN, parseInt, parseFloat, structuredClone,
  });
  context.globalThis = context;
  vm.runInContext(readFileSync(path.join(WURZEL, "firebase.js"), "utf8"), context, { filename: "firebase.js" });
  const client = stub.LernappFirebase?.kontoSchema;
  ok(client, "firebase.js exportiert kontoSchema nicht");
  if (client) {
    const namen = ["Anna", "  Anna  ", "Anna Lena", "Jérôme", "Zoë-Marie", "Müller Max", "ÄÖÜ äöü", "Ben 2", "李小龙", "!!!", "O'Neil", "anna", "ANNA"];
    for (const name of namen) {
      let c = null; try { c = client.technicalEmailFromName(name); } catch { c = null; }
      const s = kind.technischeAdresse(name);
      ok(c === s, `Adresse für "${name}": Client ${c}, Server ${s}`);
    }
    for (const pw of ["1234", "abc", "geheim", "pass wort", "ä!§$", ""]) {
      let c = null; try { c = client.childPassword(pw); } catch { c = null; }
      const s = kind.kindPasswort(pw);
      ok(c === s, `Passwort für "${pw}": Client ${JSON.stringify(c)}, Server ${JSON.stringify(s)}`);
    }
    ok(client.isTechnicalEmail("anna@lernapp.local") === kind.istTechnischeAdresse("anna@lernapp.local"), "isTechnicalEmail uneinig");
    ok(client.isTechnicalEmail("mama@example.com") === kind.istTechnischeAdresse("mama@example.com"), "isTechnicalEmail uneinig (echt)");
  }
}

// --- Helfer für den Auth-Emulator -------------------------------------------
const AUTH = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
async function anmelden(email, password) {
  const r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=attrappe`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const j = await r.json();
  return r.ok ? j.idToken : null;
}
const bearer = (token) => new Request("http://x/api", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: "{}" });
const postJson = (token, body) => new Request("http://x/api", { method: "POST", headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), "content-type": "application/json" }, body: JSON.stringify(body) });

// --- 2. Ein Elternkonto, ein Kind ---------------------------------------------
const mama = await auth().createUser({ email: "mama@example.com", password: "elternpasswort", displayName: "Mama" });
await db().collection("users").doc(mama.uid).set({ username: "Mama", email: "mama@example.com", role: "parent" });
const mamaToken = await anmelden("mama@example.com", "elternpasswort");
ok(mamaToken, "Elternkonto bekommt kein ID-Token vom Auth-Emulator");
const eltern = { uid: mama.uid, email: "mama@example.com", istEltern: true };

const kind1 = await kindAnlegen({ eltern, name: "  Lina  ", passwort: "1234" });
ok(kind1.name === "Lina", `Name nicht bereinigt: ${kind1.name}`);
ok(kind1.kauf === false, "Kind bekommt Kauf, obwohl die Eltern nicht gekauft haben");
const kind1Auth = await auth().getUser(kind1.uid);
ok(kind1Auth.email === "lina@lernapp.local", `technische Adresse: ${kind1Auth.email}`);
const kind1Doc = (await db().collection("users").doc(kind1.uid).get()).data();
ok(kind1Doc?.parentUid === mama.uid, "parentUid fehlt am Kind");
ok(kind1Doc?.role === "child", `role am Kind: ${kind1Doc?.role}`);
ok(kind1Doc?.stats?.solvedLevels === 0, "stats fehlen am Kind");
// Ohne Angabe die Mitte – dort, wo journey-plan.js die Stufe liest.
ok(kind1Doc?.gameState?.["lernapp.reise"]?.data?.stufe === "mittel" && Number.isFinite(kind1Doc?.gameState?.["lernapp.reise"]?.data?.stufeAt), `Stufe am Kind ohne Angabe: ${JSON.stringify(kind1Doc?.gameState)}`);
ok(kind1.stufe === "mittel", `die Antwort nennt die Stufe nicht: ${kind1.stufe}`);
const mamaDoc = (await db().collection("users").doc(mama.uid).get()).data();
ok(Array.isArray(mamaDoc?.children) && mamaDoc.children.some((k) => k.uid === kind1.uid && k.name === "Lina"), "Kind steht nicht in children[] der Eltern");
ok(await anmelden("lina@lernapp.local", "1234::lernapp"), "das angelegte Kind kann sich nicht anmelden");
ok(!(await anmelden("lina@lernapp.local", "1234")), "das Kind kann sich mit dem rohen Passwort anmelden (Endung fehlt?)");
ok(!(await db().collection("entitlements").doc(kind1.uid).get()).exists, "Kind hat Entitlement vor dem Kauf");

await wirft(() => kindAnlegen({ eltern, name: "Lina", passwort: "9999" }), "name-taken", "gleicher Name noch einmal");
await wirft(() => kindAnlegen({ eltern, name: "lina", passwort: "9999" }), "name-taken", "gleicher Name in anderer Schreibweise");
await wirft(() => kindAnlegen({ eltern, name: "Noa", passwort: "12" }), "short-password", "zu kurzes Passwort");
await wirft(() => kindAnlegen({ eltern, name: "   ", passwort: "1234" }), "missing-name", "leerer Name");
await wirft(() => kindAnlegen({ eltern, name: "!!!", passwort: "1234" }), "missing-name", "Name ohne Buchstaben");

// --- 3. Die Kasse ---------------------------------------------------------------
let empfangen = null;
const stripeAttrappe = { checkout: { sessions: { create: async (params) => { empfangen = params; return { id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" }; } } } };
const kasse = await kasseErstellen({ eltern, stripeClient: stripeAttrappe, price: "attrappe-preis", site: "https://kids.alae.app" });

// Wer die Produkt-Kennung einträgt statt der des Preises (prod_ statt price_,
// im Dashboard leicht verwechselt), soll trotzdem an die Kasse kommen.
{
  const gesehen = [];
  const mitProdukt = {
    ...stripeAttrappe,
    products: { retrieve: async (id, optionen) => { gesehen.push([id, optionen?.expand?.[0]]); return { id, default_price: { id: "preis-aus-produkt" } }; } },
  };
  await kasseErstellen({ eltern, stripeClient: mitProdukt, price: "prod_attrappe", site: "https://kids.alae.app" });
  ok(gesehen[0]?.[0] === "prod_attrappe" && gesehen[0]?.[1] === "default_price", `Produkt nicht mit Standardpreis geholt: ${JSON.stringify(gesehen)}`);
  ok(empfangen?.line_items?.[0]?.price === "preis-aus-produkt", `die Kasse bekommt nicht den Standardpreis: ${JSON.stringify(empfangen?.line_items)}`);

  // Ein Produkt ohne Standardpreis: Die Meldung muss sagen, was zu tun ist.
  geprueft += 1;
  const ohneStandard = { ...stripeAttrappe, products: { retrieve: async (id) => ({ id, default_price: null }) } };
  try {
    await kasseErstellen({ eltern, stripeClient: ohneStandard, price: "prod_leer", site: "https://kids.alae.app" });
    befunde.push("Produkt ohne Standardpreis: ging durch, sollte scheitern");
  } catch (fehler) {
    if (!/keinen Standardpreis/.test(String(fehler?.message))) befunde.push(`Produkt ohne Standardpreis: unklare Meldung – ${fehler?.message}`);
  }

  // Und eine echte Preis-Kennung wird nicht angefasst.
  const nichtAngefasst = { ...stripeAttrappe, products: { retrieve: async () => { throw new Error("hätte nicht gefragt werden dürfen"); } } };
  await kasseErstellen({ eltern, stripeClient: nichtAngefasst, price: "price_echt", site: "https://kids.alae.app" });
  ok(empfangen?.line_items?.[0]?.price === "price_echt", `eine price_-Kennung wird verändert: ${JSON.stringify(empfangen?.line_items)}`);
}
// Danach wieder der gewöhnliche Fall, damit die Prüfungen unten darauf zeigen.
await kasseErstellen({ eltern, stripeClient: stripeAttrappe, price: "attrappe-preis", site: "https://kids.alae.app" });
ok(kasse.url?.startsWith("https://checkout.stripe.com/"), "Kasse liefert keine Stripe-URL");
ok(empfangen?.mode === "payment", `mode: ${empfangen?.mode} – ein Abo wäre "subscription"`);
ok(empfangen?.client_reference_id === mama.uid, "client_reference_id ist nicht die uid der Eltern");
ok(empfangen?.customer_email === "mama@example.com", "Mailadresse nicht vorbefüllt");
ok(empfangen?.line_items?.[0]?.price === "attrappe-preis" && empfangen.line_items[0].quantity === 1, "Preis oder Menge falsch");
ok(empfangen?.success_url === "https://kids.alae.app/?kauf=erfolg&session_id={CHECKOUT_SESSION_ID}", `success_url: ${empfangen?.success_url}`);
ok(empfangen?.cancel_url === "https://kids.alae.app/?kauf=abbruch", `cancel_url: ${empfangen?.cancel_url}`);
ok(empfangen?.consent_collection?.terms_of_service === "required", "Zustimmung zum sofortigen Start fehlt");
ok(/Widerrufsrecht/.test(empfangen?.custom_text?.terms_of_service_acceptance?.message || ""), "Der Hinweis auf das Widerrufsrecht fehlt an der Kasse");
// Und keine Zusage, die den AGB widerspricht: Der Kauf ist verbindlich
// (agb.html, Abschnitt 4), eine Rückgabe gibt es nicht.
ok(!/zurück|erstatt|30 Tage/i.test(empfangen?.custom_text?.terms_of_service_acceptance?.message || ""), `An der Kasse steht ein Rückgabeversprechen: "${empfangen?.custom_text?.terms_of_service_acceptance?.message}"`);

// --- 4. Der Webhook -------------------------------------------------------------
const session = { id: "cs_test_1", payment_status: "paid", client_reference_id: mama.uid, payment_intent: "pi_test_1", customer: "cus_test_1", customer_details: { email: "mama@example.com" }, amount_total: 3000, currency: "chf" };
const erst = await kaufVerbuchen(session);
ok(erst.verbucht === true && erst.kinder === 1, `erster Kauf: ${JSON.stringify(erst)}`);
const mamaKauf = (await db().collection("entitlements").doc(mama.uid).get()).data();
ok(mamaKauf?.active === true && mamaKauf.plan === "familie" && mamaKauf.stripePaymentIntent === "pi_test_1" && mamaKauf.amountTotal === 3000, `Kauf der Eltern: ${JSON.stringify(mamaKauf)}`);
const kind1Kauf = (await db().collection("entitlements").doc(kind1.uid).get()).data();
ok(kind1Kauf?.active === true && kind1Kauf.via === mama.uid, `Kauf des Kindes: ${JSON.stringify(kind1Kauf)}`);
const zweit = await kaufVerbuchen(session);
ok(zweit.verbucht === false && /schon/.test(zweit.grund), `dieselbe Session noch einmal: ${JSON.stringify(zweit)}`);
const unbezahlt = await kaufVerbuchen({ ...session, id: "cs_test_2", payment_status: "unpaid" });
ok(unbezahlt.verbucht === false, "unbezahlte Session wurde verbucht");
// Ein Gutschein über 100 %: Stripe meldet "no_payment_required" – gekauft ist gekauft.
const oma = await auth().createUser({ email: "oma@example.com", password: "elternpasswort" });
await db().collection("users").doc(oma.uid).set({ username: "Oma", role: "parent" });
const gratis = await kaufVerbuchen({ id: "cs_test_gratis", payment_status: "no_payment_required", client_reference_id: oma.uid, payment_intent: null, amount_total: 0, currency: "chf" });
ok(gratis.verbucht === true, `Gutschein über 100 %: ${JSON.stringify(gratis)}`);
ok((await db().collection("entitlements").doc(oma.uid).get()).data()?.active === true, "Kauf per Gutschein fehlt");
await wirft(() => kasseErstellen({ eltern, stripeClient: stripeAttrappe, price: "p", site: "s" }), "already-owned", "Kasse nach dem Kauf");

// Ein Kind, das nach dem Kauf dazukommt, bekommt ihn mit.
const kind2 = await kindAnlegen({ eltern, name: "Noa", passwort: "5678", stufe: "leicht" });
{
  const kind2Doc = (await db().collection("users").doc(kind2.uid).get()).data();
  ok(kind2Doc?.gameState?.["lernapp.reise"]?.data?.stufe === "leicht" && kind2.stufe === "leicht", `Stufe leicht kommt nicht am Kind an: ${JSON.stringify(kind2Doc?.gameState)}`);
}
ok(kind2.kauf === true, "Kind nach dem Kauf bekommt keinen Kauf mit");
ok((await db().collection("entitlements").doc(kind2.uid).get()).data()?.via === mama.uid, "Kauf des zweiten Kindes fehlt");

// Der HTTP-Weg mit echter Unterschrift.
const geheimnis = process.env.STRIPE_WEBHOOK_SECRET;
const nutzlast = JSON.stringify({ id: "evt_1", object: "event", type: "checkout.session.completed", data: { object: { ...session, id: "cs_test_3" } } });
const kopf = Stripe.webhooks.generateTestHeaderString({ payload: nutzlast, secret: geheimnis });
const gut = await webhookHandler(new Request("http://x/api/stripe-webhook", { method: "POST", headers: { "stripe-signature": kopf }, body: nutzlast }));
ok(gut.status === 200, `Webhook mit gültiger Unterschrift: ${gut.status}`);
const schlecht = await webhookHandler(new Request("http://x/api/stripe-webhook", { method: "POST", headers: { "stripe-signature": "t=1,v1=falsch" }, body: nutzlast }));
ok(schlecht.status === 400, `Webhook mit falscher Unterschrift: ${schlecht.status}, erwartet 400`);
const ohne = await webhookHandler(new Request("http://x/api/stripe-webhook", { method: "POST", body: nutzlast }));
ok(ohne.status === 400, `Webhook ohne Unterschrift: ${ohne.status}, erwartet 400`);

// --- 5. Bis zu vier Kinder ------------------------------------------------------
{
  // Eine unbekannte Stufe ist keine Absage – sie wird zur Mitte.
  const kind3 = await kindAnlegen({ eltern, name: "Kind Drei", passwort: "1234", stufe: "extrem" });
  const kind3Doc = (await db().collection("users").doc(kind3.uid).get()).data();
  ok(kind3Doc?.gameState?.["lernapp.reise"]?.data?.stufe === "mittel" && kind3.stufe === "mittel", `unbekannte Stufe: ${JSON.stringify(kind3Doc?.gameState)}`);
}
await kindAnlegen({ eltern, name: "Kind Vier", passwort: "1234" });
await wirft(() => kindAnlegen({ eltern, name: "Kind Fünf", passwort: "1234" }), "too-many-children", "fünftes Kind");
// Der abgelehnte Versuch hinterlässt kein Auth-Konto – sonst wäre der Name belegt, ohne dass es das Kind gäbe.
await wirft(() => auth().getUserByEmail("kind-funf@lernapp.local"), "auth/user-not-found", "verwaistes Auth-Konto nach dem fünften Kind");

// Zwei Kinder gleichzeitig, ein Platz: Die Transaktion lässt genau eines durch.
const opa = await auth().createUser({ email: "opa@example.com", password: "elternpasswort" });
const opaEltern = { uid: opa.uid, email: "opa@example.com", istEltern: true };
await db().collection("users").doc(opa.uid).set({ username: "Opa", role: "parent" });
for (const n of ["Opa Eins", "Opa Zwei", "Opa Drei"]) await kindAnlegen({ eltern: opaEltern, name: n, passwort: "1234" });
const gleichzeitig = await Promise.allSettled([
  kindAnlegen({ eltern: opaEltern, name: "Opa Vier", passwort: "1234" }),
  kindAnlegen({ eltern: opaEltern, name: "Opa Fuenf", passwort: "1234" }),
]);
const gelungen = gleichzeitig.filter((r) => r.status === "fulfilled").length;
ok(gelungen === 1, `zwei Kinder gleichzeitig auf den letzten Platz: ${gelungen} angelegt, erwartet 1`);
const opaKinder = (await db().collection("users").doc(opa.uid).get()).data()?.children || [];
ok(opaKinder.length === 4, `Opa hat ${opaKinder.length} Kinder, erwartet 4`);
const abgewiesen = gleichzeitig.find((r) => r.status === "rejected");
ok(abgewiesen?.reason?.code === "too-many-children", `Absage beim gleichzeitigen Anlegen: ${abgewiesen?.reason?.code || "keine"}`);
for (const adresse of ["opa-vier@lernapp.local", "opa-fuenf@lernapp.local"]) {
  const daDoc = opaKinder.some((k) => k.name === (adresse.startsWith("opa-vier") ? "Opa Vier" : "Opa Fuenf"));
  let daAuth = true; try { await auth().getUserByEmail(adresse); } catch { daAuth = false; }
  ok(daDoc === daAuth, `${adresse}: Auth-Konto ${daAuth ? "da" : "weg"}, Kontodokument ${daDoc ? "da" : "weg"} – beides oder keines`);
}

// --- 6. Passwort eines Kindes ---------------------------------------------------
await kindPasswortSetzen({ eltern, uid: kind1.uid, passwort: "neu1" });
ok(await anmelden("lina@lernapp.local", "neu1::lernapp"), "Kind kann sich mit dem neuen Passwort nicht anmelden");
ok(!(await anmelden("lina@lernapp.local", "1234::lernapp")), "das alte Passwort gilt noch");
const papa = await auth().createUser({ email: "papa@example.com", password: "elternpasswort" });
await db().collection("users").doc(papa.uid).set({ username: "Papa", role: "parent" });
await wirft(() => kindPasswortSetzen({ eltern: { uid: papa.uid, email: "papa@example.com", istEltern: true }, uid: kind1.uid, passwort: "hack" }), "not-your-child", "fremdes Elternkonto setzt Passwort");
await wirft(() => kindPasswortSetzen({ eltern, uid: kind1.uid, passwort: "ab" }), "short-password", "zu kurzes Kind-Passwort");

// --- 7. Die Rückerstattung --------------------------------------------------------
const zurueck = await rueckerstattungVerbuchen({ payment_intent: "pi_test_1", refunded: true });
ok(zurueck.verbucht === true && zurueck.eintraege === 5, `Rückerstattung: ${JSON.stringify(zurueck)} (Eltern + 4 Kinder = 5)`);
for (const uid of [mama.uid, kind1.uid, kind2.uid]) {
  ok((await db().collection("entitlements").doc(uid).get()).data()?.active === false, `nach Rückerstattung noch aktiv: ${uid}`);
}
const teil = await rueckerstattungVerbuchen({ payment_intent: "pi_test_1", refunded: false });
ok(teil.verbucht === false, "Teilrückerstattung nimmt den Kauf");

// --- 8. Wer darf anrufen ---------------------------------------------------------
await wirft(() => anrufer(new Request("http://x/api", { method: "POST" })), "not-signed-in", "ohne Token");
await wirft(() => anrufer(bearer("kaputt")), "bad-token", "kaputtes Token");
const linaToken = await anmelden("lina@lernapp.local", "neu1::lernapp");
const werLina = await anrufer(bearer(linaToken));
ok(werLina.uid === kind1.uid && werLina.istEltern === false, "Kind wird als Eltern erkannt");
await wirft(() => elternAnrufer(bearer(linaToken)), "parents-only", "Kind ruft eine Eltern-Funktion");
const werMama = await elternAnrufer(bearer(mamaToken));
ok(werMama.uid === mama.uid && werMama.istEltern === true, "Eltern werden nicht als Eltern erkannt");

const r401 = await kindAnlegenHandler(postJson(null, { name: "X", passwort: "1234" }));
ok(r401.status === 401, `kind-anlegen ohne Token: ${r401.status}`);
const r403 = await kindAnlegenHandler(postJson(linaToken, { name: "X", passwort: "1234" }));
ok(r403.status === 403, `kind-anlegen als Kind: ${r403.status}`);
const r405 = await kindAnlegenHandler(new Request("http://x/api", { method: "GET", headers: { authorization: `Bearer ${mamaToken}` } }));
ok(r405.status === 405, `kind-anlegen per GET: ${r405.status}`);
const papaToken = await anmelden("papa@example.com", "elternpasswort");
const r200 = await kindAnlegenHandler(postJson(papaToken, { name: "Papas Kind", passwort: "1234" }));
ok(r200.status === 200, `kind-anlegen als Eltern: ${r200.status} ${await r200.text().catch(() => "")}`);
const r400 = await kindAnlegenHandler(new Request("http://x/api", { method: "POST", headers: { authorization: `Bearer ${papaToken}` }, body: "{kaputt" }));
ok(r400.status === 400, `kind-anlegen mit kaputtem JSON: ${r400.status}`);

// --- 8b. Die Familie als Gruppe ------------------------------------------------
// Auf dem Startbild stehen die Züge aller mit derselben group.id. Eine
// Familie soll das ohne Zutun haben – und zwar auch die Kinder, die es vor
// dieser Funktion schon gab.
{
  const gruppe = gruppenId(mama.uid);
  const lina = (await db().collection("users").doc(kind1.uid).get()).data();
  ok(lina?.group?.id === gruppe, `Kind bekommt beim Anlegen keine Gruppe: ${JSON.stringify(lina?.group)}`);
  ok(lina?.group?.displayName === "Lina", `im Zug steht nicht der Name des Kindes: ${JSON.stringify(lina?.group)}`);
  const noa = (await db().collection("users").doc(kind2.uid).get()).data();
  ok(noa?.group?.id === gruppe, "das zweite Kind ist in einer anderen Gruppe");

  // Zwei Familien mit demselben Nachnamen dürfen sich nicht sehen.
  ok(gruppenId("eltern-a") !== gruppenId("eltern-b"), "zwei Elternkonten teilen sich eine Gruppenkennung");

  // Ein Kind aus der Zeit davor: Gruppe von Hand entfernt, dann nachgeholt.
  await db().collection("users").doc(kind1.uid).set({ group: FieldValue.delete() }, { merge: true });
  ok(!(await db().collection("users").doc(kind1.uid).get()).data()?.group, "die Gruppe liess sich nicht entfernen (Aufbau der Prüfung)");
  const nachgeholt = await familieVerbinden(mama.uid);
  ok(nachgeholt.geaendert === 1, `nachgeholt: ${JSON.stringify(nachgeholt)} – erwartet genau ein geändertes Kind`);
  ok((await db().collection("users").doc(kind1.uid).get()).data()?.group?.id === gruppe, "die Gruppe kam nicht zurück");
  ok((await familieVerbinden(mama.uid)).geaendert === 0, "ein zweiter Lauf schreibt noch einmal, obwohl nichts fehlt");

  // Über den Weg von aussen, als Kind: Es darf seine eigene Familie verbinden.
  const linaToken2 = await anmelden("lina@lernapp.local", "neu1::lernapp");
  const alsKind = await familieHandler(new Request("http://x/api/familie", { method: "POST", headers: { authorization: `Bearer ${linaToken2}` } }));
  const kindDaten = await alsKind.json();
  ok(alsKind.status === 200 && kindDaten.gruppe?.id === gruppe, `Kind verbindet die Familie nicht: ${alsKind.status} ${JSON.stringify(kindDaten)}`);

  // Als Eltern: Die Kinder werden verbunden – und das Elternkonto mit. Bis
  // hierher blieb es aussen vor, damit auf keinem Kinderbild ein leerer
  // Elternzug stünde. Seit dem Elternbereich spielen Eltern aber selbst und
  // sehen ihre eigenen Zahlen; auf dem Startbild sollen die Züge ALLER
  // Familienmitglieder stehen, nicht nur die der Geschwister.
  const alsEltern = await familieHandler(new Request("http://x/api/familie", { method: "POST", headers: { authorization: `Bearer ${mamaToken}` } }));
  const elternDaten = await alsEltern.json();
  ok(elternDaten.kinder >= 2, `Eltern sehen ${elternDaten.kinder} Kinder`);
  ok(elternDaten.gruppe?.id === gruppe, `das Elternkonto ist nicht in der Familiengruppe: ${JSON.stringify(elternDaten.gruppe)}`);
  ok((await db().collection("users").doc(mama.uid).get()).data()?.group?.id === gruppe, "das Elternkonto hat keine Gruppe bekommen");

  // Eine Gruppe, die der Admin von Hand gesetzt hat, überlebt jede Anmeldung.
  // Ohne diese Marke schriebe familieVerbinden sie bei jedem Anruf wieder weg –
  // und eine übergreifende Gruppe (zwei Familien, eine Klasse) hielte keinen Tag.
  await db().collection("users").doc(kind2.uid).set({ group: { id: "nachbarschaft", name: "Nachbarschaft", by: "admin", updatedAt: 1 } }, { merge: true });
  await familieVerbinden(mama.uid);
  ok((await db().collection("users").doc(kind2.uid).get()).data()?.group?.id === "nachbarschaft", "die Familie hat die Gruppe des Admins überschrieben");
  // Und zurück, damit die Prüfungen danach von der Familiengruppe ausgehen.
  await db().collection("users").doc(kind2.uid).set({ group: FieldValue.delete() }, { merge: true });
  await familieVerbinden(mama.uid);
  ok((await db().collection("users").doc(kind2.uid).get()).data()?.group?.id === gruppe, "die Familiengruppe kam nicht zurück");

  // Ohne Token: nichts.
  const ohne = await familieHandler(new Request("http://x/api/familie", { method: "POST" }));
  ok(ohne.status === 401, `familie ohne Token: ${ohne.status}`);
  // Ein Gründer-Kind ohne Elternkonto gehört zu keiner Familie.
  const einsam = await auth().createUser({ email: "einsam@lernapp.local", password: "1234::lernapp", displayName: "Einsam" });
  await db().collection("users").doc(einsam.uid).set({ username: "Einsam", role: "child" });
  const einsamToken = await anmelden("einsam@lernapp.local", "1234::lernapp");
  const einsamAntwort = await (await familieHandler(new Request("http://x/api/familie", { method: "POST", headers: { authorization: `Bearer ${einsamToken}` } }))).json();
  ok(!einsamAntwort.gruppe && einsamAntwort.kinder === 0, `Gründer-Kind bekommt eine Gruppe: ${JSON.stringify(einsamAntwort)}`);
}

// --- 8c. Ein Kind wieder entfernen ------------------------------------------------
// Das Gegenstück zum Anlegen, und es muss dasselbe rückwärts tun: Auth-Konto,
// Kontodokument samt Unterkollektionen, Kaufeintrag, children[] der Eltern.
// Bliebe eines davon stehen, wäre der Name für immer belegt, stünde ein Zug
// ohne Kind in der Familiengruppe, oder zählte ein Kind mit, das es nicht mehr
// gibt – und damit die Grenze von vier.
{
  const weg = await kindAnlegen({ eltern: { uid: papa.uid, email: "papa@example.com", istEltern: true }, name: "Weg", passwort: "1234" });
  await db().collection("users").doc(weg.uid).collection("levelProgress").doc("a").set({ solved: true });
  await db().collection("users").doc(weg.uid).collection("sessions").doc("s").set({ startedAt: 1 });
  await db().collection("entitlements").doc(weg.uid).set({ plan: "familie", active: true, via: papa.uid });

  const papaEltern2 = { uid: papa.uid, email: "papa@example.com", istEltern: true };
  await wirft(() => kindLoeschen({ eltern, uid: weg.uid }), "not-your-child", "fremdes Elternkonto löscht ein Kind");
  await wirft(() => kindLoeschen({ eltern: papaEltern2, uid: papa.uid }), "not-your-child", "Elternkonto löscht sich selbst");
  await wirft(() => kindLoeschen({ eltern: papaEltern2, uid: "" }), "missing-uid", "löschen ohne Kennung");

  const ergebnis = await kindLoeschen({ eltern: papaEltern2, uid: weg.uid });
  ok(ergebnis.geloescht.level === 1 && ergebnis.geloescht.sitzungen === 1, `gelöscht: ${JSON.stringify(ergebnis.geloescht)}`);
  ok(!(await db().collection("users").doc(weg.uid).get()).exists, "das Kontodokument steht noch da");
  ok((await db().collection("users").doc(weg.uid).collection("levelProgress").get()).empty, "die Level stehen noch da");
  ok((await db().collection("users").doc(weg.uid).collection("sessions").get()).empty, "die Sitzungen stehen noch da");
  ok(!(await db().collection("entitlements").doc(weg.uid).get()).exists, "der Kaufeintrag steht noch da");
  const papaDoc = (await db().collection("users").doc(papa.uid).get()).data();
  ok(!(papaDoc?.children || []).some((k) => (typeof k === "string" ? k : k.uid) === weg.uid), "das Kind steht noch in children[]");
  ok(!(await auth().getUser(weg.uid).catch(() => null)), "die Anmeldung gibt es noch");
  // Und der Name ist wieder frei: genau das ist der Grund, warum das
  // Auth-Konto mit weg muss.
  const neuerWeg = await kindAnlegen({ eltern: papaEltern2, name: "Weg", passwort: "1234" });
  ok(neuerWeg.uid && neuerWeg.uid !== weg.uid, "der Name blieb belegt");
  await kindLoeschen({ eltern: papaEltern2, uid: neuerWeg.uid });

  // Bricht es nach der Anmeldung ab, muss derselbe Knopf zu Ende aufräumen
  // können. Nachgestellt wird das, indem die Anmeldung schon weg ist, das
  // Kind aber noch in children[] steht – genau der Zustand nach einem
  // Abbruch. Ginge es andersherum (Daten zuerst), stünde das Kind nicht mehr
  // in children[], der zweite Versuch scheiterte an "not-your-child", und das
  // Auth-Konto bliebe für immer: ein Kind ohne Eltern, das in entitlement.js
  // als "Gründer" dauerhaft frei wäre.
  const halb = await kindAnlegen({ eltern: papaEltern2, name: "Halb", passwort: "1234" });
  await auth().deleteUser(halb.uid);
  const zuEnde = await kindLoeschen({ eltern: papaEltern2, uid: halb.uid });
  ok(zuEnde.uid === halb.uid, "ein abgebrochenes Löschen lässt sich nicht zu Ende bringen");
  ok(!(await db().collection("users").doc(halb.uid).get()).exists, "beim zweiten Versuch blieb das Kontodokument stehen");
  const papaNachHalb = (await db().collection("users").doc(papa.uid).get()).data();
  ok(!(papaNachHalb?.children || []).some((k) => (typeof k === "string" ? k : k.uid) === halb.uid), "beim zweiten Versuch blieb das Kind in children[]");

  // Über den Weg von aussen: ohne Token 401, als Kind 403.
  const ohne = await kindLoeschenHandler(postJson(null, { uid: kind1.uid }));
  ok(ohne.status === 401, `kind-loeschen ohne Token: ${ohne.status}`);
  const alsKind = await kindLoeschenHandler(postJson(await anmelden("lina@lernapp.local", "neu1::lernapp"), { uid: kind1.uid }));
  ok(alsKind.status === 403, `kind-loeschen als Kind: ${alsKind.status}`);
}

// --- 8c2. Das Wagen-Set der Familie erbt sich ------------------------------------
// Wählen die Eltern eigene Wagen, steht das Set an jedem Konto der Familie.
// Ein später angelegtes Kind muss es mitbekommen – sonst führe das jüngste
// Geschwister als einziges einen anderen Zug.
{
  const oma3 = await auth().createUser({ email: "oma3@example.com", password: "elternpasswort" });
  await db().collection("users").doc(oma3.uid).set({ username: "Oma drei", role: "parent" });
  const omaEltern3 = { uid: oma3.uid, email: "oma3@example.com", istEltern: true };
  const erstes = await kindAnlegen({ eltern: omaEltern3, name: "Erstes", passwort: "1234" });
  ok(!(await db().collection("users").doc(erstes.uid).get()).data()?.wagonSet, "ein Kind bekommt ein Wagen-Set, das niemand gewählt hat");

  // So, wie es firebase.js (switchFamilyWagonSet) schreibt: an jedes Konto.
  const wahl = { id: "2", switchedAtMs: 1700000500000, switchedBy: oma3.uid };
  await db().collection("users").doc(oma3.uid).set({ wagonSet: wahl }, { merge: true });
  await db().collection("users").doc(erstes.uid).set({ wagonSet: wahl }, { merge: true });

  const spaeter = await kindAnlegen({ eltern: omaEltern3, name: "Spaeter", passwort: "1234" });
  const spaeterDoc = (await db().collection("users").doc(spaeter.uid).get()).data();
  ok(spaeterDoc?.wagonSet?.id === "2", `das später angelegte Kind fährt ${JSON.stringify(spaeterDoc?.wagonSet)} statt Set 2 der Familie`);
}

// --- 8d. Gratis freischalten -------------------------------------------------------
// entitlements/{uid} darf kein Client schreiben – auch der Admin nicht
// (firestore.rules: write: if false). Wenn der Adminbereich ein Konto per Klick
// freischaltet, geht das deshalb über diese Funktion, und sie prüft am Token,
// wer anruft. Wer das umgehen könnte, könnte sich einen Kauf schreiben.
{
  // Der eine Administrator. Dieselbe Adresse wie in firestore.rules – und das
  // wird hier nicht geglaubt, sondern nachgelesen: Laufen die beiden
  // auseinander, kommt der Admin an der einen Stelle durch und an der anderen
  // nicht, und niemand merkt, an welcher.
  const regeln = readFileSync(path.join(WURZEL, "firestore.rules"), "utf8");
  ADMIN_ADRESSEN.forEach((adresse) => {
    ok(regeln.toLowerCase().includes(adresse), `firestore.rules kennt die Admin-Adresse ${adresse} nicht`);
  });
  ok(istAdminAdresse("  ALAIN.SC2@Gmail.com "), "die Admin-Adresse wird nicht normalisiert erkannt");
  ok(!istAdminAdresse("alain.sc2@gmail.com.example.org"), "eine ähnliche Adresse gilt als Admin");

  const chef = await auth().createUser({ email: ADMIN_ADRESSEN[0], password: "adminpasswort", emailVerified: true });
  await db().collection("users").doc(chef.uid).set({ username: "Chef", role: "admin" });
  const chefToken = await anmelden(ADMIN_ADRESSEN[0], "adminpasswort");
  const werChef = await adminAnrufer(bearer(chefToken));
  ok(werChef.uid === chef.uid && werChef.istAdmin === true, "der Admin wird nicht als Admin erkannt");
  await wirft(() => adminAnrufer(bearer(mamaToken)), "admin-only", "ein gewöhnliches Elternkonto ruft die Admin-Funktion");

  // Eine unbestätigte Adresse reicht nicht – sonst genügte es, ein Konto mit
  // dieser Adresse anzulegen. Dieselbe Bedingung wie in firestore.rules.
  const falsch = await auth().createUser({ email: "admin-attrappe@example.com", password: "adminpasswort", emailVerified: false });
  await db().collection("users").doc(falsch.uid).set({ username: "Attrappe" });
  ok(!istAdminAdresse("admin-attrappe@example.com"), "eine fremde Adresse gilt als Admin");

  // Freischalten trifft die ganze Familie, wie ein Kauf: ein freigeschaltetes
  // Kind neben gesperrten Geschwistern wäre kein Geschenk, sondern ein Rätsel.
  const oma2 = await auth().createUser({ email: "oma2@example.com", password: "elternpasswort" });
  await db().collection("users").doc(oma2.uid).set({ username: "Oma zwei", role: "parent" });
  const omaEltern = { uid: oma2.uid, email: "oma2@example.com", istEltern: true };
  const enkel = await kindAnlegen({ eltern: omaEltern, name: "Enkel", passwort: "1234" });

  const geschenkt = await freischalten({ admin: werChef, uid: oma2.uid, frei: true });
  ok(geschenkt.konten === 2, `freigeschaltet: ${JSON.stringify(geschenkt)} – erwartet Elternkonto und Kind`);
  const omaKauf = (await db().collection("entitlements").doc(oma2.uid).get()).data();
  ok(omaKauf?.active === true && omaKauf?.source === "admin", `Eintrag am Elternkonto: ${JSON.stringify(omaKauf)}`);
  ok(omaKauf?.grantedBy === chef.uid, "im Eintrag steht nicht, wer freigeschaltet hat");
  const enkelKauf = (await db().collection("entitlements").doc(enkel.uid).get()).data();
  ok(enkelKauf?.active === true && enkelKauf?.via === oma2.uid, `Eintrag am Kind: ${JSON.stringify(enkelKauf)}`);

  // Ein Kind anzuklicken schaltet trotzdem die Familie frei – der Server
  // sucht das Elternkonto über parentUid.
  await freischalten({ admin: werChef, uid: enkel.uid, frei: false });
  const nochmal = await freischalten({ admin: werChef, uid: enkel.uid, frei: true });
  ok(nochmal.konten === 2, `über das Kind freigeschaltet: ${JSON.stringify(nochmal)}`);
  ok((await db().collection("entitlements").doc(oma2.uid).get()).data()?.active === true, "das Elternkonto blieb aussen vor");

  // Ein später angelegtes Geschwisterkind erbt die Freischaltung, genau wie
  // bei einem Kauf – das rechnet kind-anlegen.mjs, nicht diese Funktion.
  const enkel2 = await kindAnlegen({ eltern: omaEltern, name: "Enkel zwei", passwort: "1234" });
  ok((await db().collection("entitlements").doc(enkel2.uid).get()).data()?.active === true, "das zweite Kind erbt die Freischaltung nicht");

  // Zurücknehmen: alles weg.
  const zurueckgenommen = await freischalten({ admin: werChef, uid: oma2.uid, frei: false });
  ok(zurueckgenommen.konten === 3, `zurückgenommen: ${JSON.stringify(zurueckgenommen)}`);
  for (const uid of [oma2.uid, enkel.uid, enkel2.uid]) {
    ok(!(await db().collection("entitlements").doc(uid).get()).exists, `der Eintrag steht noch da: ${uid}`);
  }

  // Ein bezahlter Kauf wird hier NICHT zurückgenommen. Sonst verlöre eine
  // Familie ihren Kauf durch einen Fehlgriff in einer Liste – zurückerstattet
  // wird bei Stripe, und der Webhook trägt es ein.
  await db().collection("entitlements").doc(oma2.uid).set({ plan: "familie", active: true, source: "stripe" });
  await wirft(() => freischalten({ admin: werChef, uid: oma2.uid, frei: false }), "paid-not-gift", "ein bezahlter Kauf wird per Klick zurückgenommen");
  ok((await db().collection("entitlements").doc(oma2.uid).get()).data()?.active === true, "der bezahlte Kauf ist weg");

  // Und ein bezahlter Kauf wird auch nicht ÜBERSCHRIEBEN. Der Adminbereich
  // zeigt den Knopf bei bezahlten Konten nicht – aber die Liste ist einen
  // Moment alt, und wer in genau diesem Moment an der Kasse war, bekäme sonst
  // ein Geschenk über seinen Kauf geschrieben. Danach stünde dort
  // source: "admin", und ein Zurücknehmen löschte den bezahlten Zugang.
  await wirft(() => freischalten({ admin: werChef, uid: oma2.uid, frei: true }), "already-paid", "ein bezahlter Kauf wird mit einem Geschenk überschrieben");
  const nochBezahlt = (await db().collection("entitlements").doc(oma2.uid).get()).data();
  ok(nochBezahlt?.source === "stripe" && nochBezahlt?.active === true, `der bezahlte Kauf wurde angefasst: ${JSON.stringify(nochBezahlt)}`);

  await wirft(() => freischalten({ admin: werChef, uid: "gibtesnicht" }), "no-account", "ein Konto, das es nicht gibt");
  await wirft(() => freischalten({ admin: werChef, uid: "" }), "missing-uid", "freischalten ohne Kennung");

  // Und von aussen: ohne Token 401, als Eltern 403, als Admin 200.
  const ohne = await freischaltenHandler(postJson(null, { uid: oma2.uid }));
  ok(ohne.status === 401, `freischalten ohne Token: ${ohne.status}`);
  const alsEltern = await freischaltenHandler(postJson(mamaToken, { uid: oma2.uid }));
  ok(alsEltern.status === 403, `freischalten als Elternkonto: ${alsEltern.status}`);
  // Für den 200er ein Konto ohne Kauf: Die Familie von oma2 trägt inzwischen
  // einen bezahlten Eintrag, und der wird zu Recht abgelehnt.
  const frisch = await auth().createUser({ email: "frisch@example.com", password: "elternpasswort" });
  await db().collection("users").doc(frisch.uid).set({ username: "Frisch", role: "parent" });
  const alsAdmin = await freischaltenHandler(postJson(chefToken, { uid: frisch.uid, frei: true }));
  ok(alsAdmin.status === 200, `freischalten als Admin: ${alsAdmin.status} ${await alsAdmin.clone().text().catch(() => "")}`);
  ok((await db().collection("entitlements").doc(frisch.uid).get()).data()?.source === "admin", "der Weg von aussen schreibt keinen Eintrag");
  const perGet = await freischaltenHandler(new Request("http://x/api", { method: "GET", headers: { authorization: `Bearer ${chefToken}` } }));
  ok(perGet.status === 405, `freischalten per GET: ${perGet.status}`);
}

// --- 8e. Ein Konto restlos entfernen -----------------------------------------------
// Der einzige Knopf, der auch die Anmeldung mitnimmt – und deshalb der, bei
// dem am meisten übrig bleiben kann. Geprüft wird, dass nichts übrig bleibt,
// und dass die drei Schranken halten.
{
  const chefToken = await anmelden(ADMIN_ADRESSEN[0], "adminpasswort");
  const werChef = await adminAnrufer(bearer(chefToken));
  const { kontoLoeschen, default: loeschenHandler } = await import("../netlify/functions/konto-loeschen.mjs");

  // Eine ganze Familie: Elternkonto, zwei Kinder, Fortschritt, Kauf, Mails.
  const grossvater = await auth().createUser({ email: "grossvater@example.com", password: "elternpasswort" });
  await db().collection("users").doc(grossvater.uid).set({ username: "Grossvater", email: "grossvater@example.com", role: "parent" });
  const grossvaterEltern = { uid: grossvater.uid, email: "grossvater@example.com", istEltern: true };
  const testkind1 = await kindAnlegen({ eltern: grossvaterEltern, name: "Testkind eins", passwort: "1234" });
  const testkind2 = await kindAnlegen({ eltern: grossvaterEltern, name: "Testkind zwei", passwort: "1234" });
  await db().collection("users").doc(testkind1.uid).collection("levelProgress").doc("arukone.A1-1").set({ solved: true });
  await db().collection("users").doc(testkind1.uid).collection("sessions").doc("s1").set({ startedAt: 1 });
  await db().collection("entitlements").doc(grossvater.uid).set({ plan: "familie", active: true, source: "stripe" });
  await db().collection("mails").doc(`willkommen-${grossvater.uid}`).set({ richtung: "aus", art: "willkommen", uid: grossvater.uid, zeitMs: 1 });

  // Ohne auchKinder geht es nicht: Ein Kind ohne Elternkonto gilt als Gründer
  // und wäre dauerhaft frei – aus dem Aufräumen würde ein Geschenk.
  await wirft(() => kontoLoeschen({ admin: werChef, uid: grossvater.uid }), "has-children", "ein Elternkonto mit Kindern ohne auchKinder");
  ok((await auth().getUser(grossvater.uid).catch(() => null)) !== null, "das abgelehnte Löschen hat die Anmeldung trotzdem genommen");

  // Und die drei Schranken.
  await wirft(() => kontoLoeschen({ admin: werChef, uid: werChef.uid }), "not-yourself", "der Admin löscht sich selbst");
  await wirft(() => kontoLoeschen({ admin: werChef, uid: "gibtesnicht" }), "no-account", "ein Konto, das es nicht gibt");
  await wirft(() => kontoLoeschen({ admin: werChef, uid: "" }), "missing-uid", "löschen ohne Kennung");

  // Jetzt richtig: die ganze Familie.
  const weg = await kontoLoeschen({ admin: werChef, uid: grossvater.uid, auchKinder: true });
  ok(weg.konten === 3, `gelöscht: ${JSON.stringify(weg)} – erwartet Elternkonto und zwei Kinder`);
  ok(weg.level === 1 && weg.sitzungen === 1, `Unterkollektionen: ${JSON.stringify(weg)}`);
  ok(weg.mails === 1, `Mails: ${weg.mails}`);

  // Und wirklich nichts übrig – an allen fünf Orten.
  for (const [name, uid] of [["Elternkonto", grossvater.uid], ["Kind 1", testkind1.uid], ["Kind 2", testkind2.uid]]) {
    ok((await auth().getUser(uid).catch(() => null)) === null, `${name}: die Anmeldung steht noch`);
    ok(!(await db().collection("users").doc(uid).get()).exists, `${name}: das Profil steht noch`);
    ok(!(await db().collection("entitlements").doc(uid).get()).exists, `${name}: der Kaufeintrag steht noch`);
  }
  ok((await db().collection("users").doc(testkind1.uid).collection("levelProgress").get()).empty, "die Level des Kindes stehen noch");
  ok((await db().collection("users").doc(testkind1.uid).collection("sessions").get()).empty, "die Sitzungen des Kindes stehen noch");
  ok(!(await db().collection("mails").doc(`willkommen-${grossvater.uid}`).get()).exists, "die Mail an das Konto steht noch");

  // Die Adresse ist wieder frei – das ist der ganze Zweck.
  const nochmal = await auth().createUser({ email: "grossvater@example.com", password: "elternpasswort" });
  ok(Boolean(nochmal.uid), "die Adresse ist nach dem Löschen noch belegt");
  await auth().deleteUser(nochmal.uid);

  // Ein einzelnes Kind: Es muss auch aus children[] der Eltern verschwinden,
  // sonst zählt es weiter gegen die Grenze von vier.
  const testtante = await auth().createUser({ email: "testtante@example.com", password: "elternpasswort" });
  await db().collection("users").doc(testtante.uid).set({ username: "Testtante", email: "testtante@example.com", role: "parent" });
  const testnichte = await kindAnlegen({ eltern: { uid: testtante.uid, email: "testtante@example.com", istEltern: true }, name: "Testtestnichte", passwort: "1234" });
  const einzeln = await kontoLoeschen({ admin: werChef, uid: testnichte.uid });
  ok(einzeln.konten === 1, `ein Kind allein: ${JSON.stringify(einzeln)}`);
  const testtanteDanach = (await db().collection("users").doc(testtante.uid).get()).data();
  ok((testtanteDanach?.children || []).length === 0, `das Kind steht noch in children[]: ${JSON.stringify(testtanteDanach?.children)}`);
  ok((await db().collection("users").doc(testtante.uid).get()).exists, "das Elternkonto wurde mitgelöscht");

  // Ein Admin-Konto bleibt, auch wenn ein anderer Admin es versucht.
  const zweiterChef = { uid: "fremd", email: ADMIN_ADRESSEN[0], istEltern: true, istAdmin: true };
  await wirft(() => kontoLoeschen({ admin: zweiterChef, uid: werChef.uid }), "admin-account", "ein Admin-Konto wird gelöscht");

  // Von aussen: ohne Token 401, als Eltern 403, als Admin 200.
  ok((await loeschenHandler(postJson(null, { uid: testtante.uid }))).status === 401, "löschen ohne Token");
  ok((await loeschenHandler(postJson(mamaToken, { uid: testtante.uid }))).status === 403, "löschen als Elternkonto");
  const alsAdminWeg = await loeschenHandler(postJson(chefToken, { uid: testtante.uid }));
  ok(alsAdminWeg.status === 200, `löschen als Admin: ${alsAdminWeg.status} ${await alsAdminWeg.clone().text().catch(() => "")}`);
  ok((await auth().getUser(testtante.uid).catch(() => null)) === null, "der Weg von aussen nimmt die Anmeldung nicht mit");
  ok((await loeschenHandler(new Request("http://x/api", { method: "GET", headers: { authorization: `Bearer ${chefToken}` } }))).status === 405, "löschen per GET");
}

// --- 9. Die Statusseite -----------------------------------------------------------
// Sie ist die einzige Funktion, die auch dann antworten muss, wenn sonst
// nichts geht – deshalb lädt sie beim Start nichts Schweres.
{
  const flach = await statusHandler(new Request("http://x/api/status"));
  ok(flach.status === 200, `status flach: ${flach.status}`);
  const daten = await flach.json();
  ok(daten.node === process.version, `status nennt die falsche Node-Fassung: ${daten.node}`);
  ok(daten.umgebung?.FIREBASE_SERVICE_ACCOUNT === true, "status sieht FIREBASE_SERVICE_ACCOUNT nicht");
  ok(daten.umgebung?.STRIPE_SECRET_KEY === true, "status sieht STRIPE_SECRET_KEY nicht");
  // Und nie der Inhalt, nur das Ob.
  const roh = JSON.stringify(daten);
  for (const name of ["FIREBASE_SERVICE_ACCOUNT", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]) {
    const wert = process.env[name];
    ok(!wert || !roh.includes(wert), `status gibt den Inhalt von ${name} preis`);
  }

  // Und sie lädt nichts: keine import-Zeile in der Datei. Sonst zöge der
  // Bündler firebase-admin mit hinein, und die Seite fiele mit allem
  // anderen zusammen aus – genau dann, wenn man sie braucht.
  const quelle = readFileSync(path.join(WURZEL, "netlify/functions/status.mjs"), "utf8");
  ok(!/^\s*import[\s{]/m.test(quelle), "status.mjs importiert etwas – dann ist sie nicht mehr die Funktion, die immer antwortet");

  // Die Tiefenprüfung mit nachgebautem Stripe: Der echte liegt im Netz, und
  // eine Prüfung, die ohne Netz sechs Sekunden wartet, prüft nichts.
  const stripeStatus = { prices: { retrieve: async (id) => ({ id, unit_amount: 3000, currency: "chf", type: "one_time" }) } };
  const daten2 = await pruefungenLaufen({ stripeClient: stripeStatus });
  const firestore = (daten2.pruefungen || []).find((p) => p.name === "Firestore lesen");
  ok(firestore?.ok === true, `Firestore antwortet der Tiefenprüfung nicht: ${JSON.stringify(firestore)}`);
  const authPruefung = (daten2.pruefungen || []).find((p) => p.name === "Firebase Auth");
  ok(authPruefung?.ok === true, `Firebase Auth antwortet der Tiefenprüfung nicht: ${JSON.stringify(authPruefung)}`);
  const stripePruefung = (daten2.pruefungen || []).find((p) => p.name === "Stripe");
  ok(stripePruefung?.ok === true, `Stripe-Prüfung: ${JSON.stringify(stripePruefung)}`);
  ok(/30 CHF/.test(stripePruefung?.info || ""), `der gefundene Preis steht nicht in der Antwort: ${stripePruefung?.info}`);

  // Trägt jemand die Produkt-Kennung ein, sagt die Antwort, woher der Preis kommt.
  const preisVorherTief = process.env.STRIPE_PRICE_ID;
  process.env.STRIPE_PRICE_ID = "prod_attrappe";
  const mitProduktStatus = {
    ...stripeStatus,
    products: { retrieve: async (id) => ({ id, default_price: { id: "preis-aus-produkt" } }) },
  };
  const ueberProdukt = await pruefungenLaufen({ stripeClient: mitProduktStatus });
  const stripeProdukt = (ueberProdukt.pruefungen || []).find((p) => p.name === "Stripe");
  ok(stripeProdukt?.ok === true && /Standardpreis des Produkts prod_attrappe/.test(stripeProdukt?.info || ""), `Produkt-Kennung nicht erklärt: ${JSON.stringify(stripeProdukt)}`);
  process.env.STRIPE_PRICE_ID = preisVorherTief;
  ok(daten2.ok === true, `Tiefenprüfung insgesamt: ${JSON.stringify(daten2.pruefungen)}`);

  // Fehlt eine Angabe, die die Kasse braucht, ist das kein "alles gut".
  const preisVorher = process.env.STRIPE_PRICE_ID;
  delete process.env.STRIPE_PRICE_ID;
  const ohnePreis = await pruefungenLaufen({ stripeClient: stripeStatus });
  ok(ohnePreis.ok === false, "ohne STRIPE_PRICE_ID meldet die Tiefenprüfung trotzdem 'alles gut'");
  ok(/PRICE_ID/.test((ohnePreis.pruefungen.find((p) => p.name === "Stripe") || {}).text || ""), "die Meldung sagt nicht, welche Angabe fehlt");
  const schluesselVorher = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  ok((await pruefungenLaufen()).ok === false, "ohne STRIPE_SECRET_KEY meldet die Tiefenprüfung trotzdem 'alles gut'");
  process.env.STRIPE_PRICE_ID = preisVorher;
  process.env.STRIPE_SECRET_KEY = schluesselVorher;

  // Und über den Weg von aussen: eine Antwort, danach die gemerkte.
  const tief = await statusTiefHandler(new Request("http://x/api/status-tief"));
  ok(tief.status === 200 || tief.status === 503, `status-tief: ${tief.status}`);
  const wieder = await (await statusTiefHandler(new Request("http://x/api/status-tief"))).json();
  ok(typeof wieder.gemessenVorSekunden === "number", "die zweite Anfrage misst noch einmal nach, statt das Ergebnis zu merken");

  const roh2 = JSON.stringify(daten2) + JSON.stringify(wieder);
  for (const name of ["FIREBASE_SERVICE_ACCOUNT", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]) {
    const wert = process.env[name];
    ok(!wert || !roh2.includes(wert), `die Tiefenprüfung gibt den Inhalt von ${name} preis`);
  }
}

// --- 10. Die Post -----------------------------------------------------------------
// Gripszug schreibt seine Mails selbst und verschickt sie über Resend. Resend
// liegt im Netz; hier wird es abgefangen – alles an api.resend.com landet in
// einer Liste, alles andere geht weiter an den Emulator.
//
// Geprüft wird das, was schiefgehen kann, ohne dass es jemand merkt: dass eine
// Mail zweimal rausgeht, dass ein Fremder über "Passwort vergessen" beliebig
// viele Mails auslösen kann, dass der Eingang ohne Geheimnis offen steht.
{
  const echtesFetch = globalThis.fetch;
  let verschickt = [];
  globalThis.fetch = async (ziel, optionen) => {
    const adresse = String(ziel?.url || ziel);
    if (adresse.startsWith("https://api.resend.com/")) {
      let inhalt = {};
      try { inhalt = JSON.parse(optionen?.body || "{}"); } catch { inhalt = {}; }
      verschickt.push({ adresse, inhalt, schluessel: optionen?.headers?.Authorization || "" });
      return new Response(JSON.stringify({ id: `resend-${verschickt.length}` }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return echtesFetch(ziel, optionen);
  };

  const { sendeMail, einstellungen, mailBereit } = await import("../netlify/functions/_lib/mail.mjs");
  const vorlagen = await import("../netlify/functions/_lib/mail-vorlagen.mjs");
  const { default: willkommenHandler, willkommenSchicken } = await import("../netlify/functions/willkommen.mjs");
  const { default: passwortHandler, passwortMailSchicken } = await import("../netlify/functions/passwort-mail.mjs");
  const { default: eingangHandler, eingangVerarbeiten } = await import("../netlify/functions/mail-eingang.mjs");
  const { default: einstellungenHandler } = await import("../netlify/functions/mail-einstellungen.mjs");

  // Ohne Schlüssel geht nichts raus – aber es stürzt auch nichts ab, und im
  // Archiv steht, warum. Sonst suchte man eine Mail, die es nie gab.
  ok(mailBereit() === false, "ohne RESEND_API_KEY hält sich der Versand für bereit");
  const ohneSchluessel = await sendeMail({ an: "wer@example.com", betreff: "Ohne", html: "<p>x</p>", text: "x", art: "test", id: "ohne-schluessel" });
  ok(ohneSchluessel.gesendet === false, "ohne Schlüssel gilt die Mail als verschickt");
  ok(verschickt.length === 0, "ohne Schlüssel wurde Resend trotzdem angerufen");
  const ohneDoc = (await db().collection("mails").doc("ohne-schluessel").get()).data();
  ok(ohneDoc?.status === "fehler" && /RESEND_API_KEY/.test(ohneDoc?.fehler || ""), `im Archiv steht nicht, warum nichts ging: ${JSON.stringify(ohneDoc)}`);

  process.env.RESEND_API_KEY = "re_attrappe";
  process.env.MAIL_WEBHOOK_SECRET = "geheimnis-attrappe";
  ok(mailBereit() === true, "mit RESEND_API_KEY hält sich der Versand für nicht bereit");

  // --- Die Begrüssung -------------------------------------------------------
  verschickt = [];
  const begruessung = await willkommenSchicken({ uid: mama.uid, email: "mama@example.com" });
  ok(begruessung.gesendet === true, `Begrüssung: ${JSON.stringify(begruessung)}`);
  ok(verschickt.length === 1, `Begrüssung rief Resend ${verschickt.length}-mal an`);
  const erste = verschickt[0]?.inhalt || {};
  ok(/kids@alae\.app/.test(erste.from || ""), `Absender: ${erste.from}`);
  ok((erste.to || [])[0] === "mama@example.com", `Empfänger: ${JSON.stringify(erste.to)}`);
  ok(erste.subject === "Willkommen bei Gripszug", `Betreff: ${erste.subject}`);
  // Eine Mail ohne Textteil gilt manchem Spamfilter schon als verdächtig.
  ok(typeof erste.text === "string" && erste.text.length > 50, "die Begrüssung hat keinen Textteil");
  ok(/<table/.test(erste.html || ""), "die Begrüssung hat keine HTML-Fassung");
  // Keine HTML-Schnipsel im Betreff, keine doppelt maskierten Umlaute im Text.
  ok(!/[<>]|&[a-z]+;/.test(erste.subject || ""), `im Betreff steckt Auszeichnung: ${erste.subject}`);
  ok(!/&(amp|uuml|auml|ouml);/.test(erste.text || ""), "in der Textfassung stehen HTML-Entities");
  // Kein Bestätigungslink mehr, und das ist Absicht: Kein Teil der App fragt
  // nach einer bestätigten Adresse, und ein Angebot, das man im selben Atemzug
  // als verzichtbar bezeichnet, gehört nicht in eine Mail von vier Zeilen.
  ok(!/verifyEmail|bestätig/i.test(erste.html || ""), "in der Begrüssung steht wieder ein Bestätigungslink");

  // Und genau einmal: Der Client ruft beim Anlegen an und bei der ersten
  // Google-Anmeldung noch einmal.
  const nochmalBegruessung = await willkommenSchicken({ uid: mama.uid, email: "mama@example.com" });
  ok(nochmalBegruessung.gesendet === false, "die Begrüssung ging ein zweites Mal raus");
  ok(verschickt.length === 1, `nach dem zweiten Anlauf ${verschickt.length} Mails`);

  ok((await willkommenHandler(bearer(mamaToken))).status === 200, "die Begrüssung ist für ein Elternkonto nicht zu haben");
  ok((await willkommenHandler(new Request("http://x/api", { method: "POST" }))).status === 401, "die Begrüssung geht auch ohne Anmeldung");
  // Ein eigenes Kinderkonto: Das aus Abschnitt 2 hat unterwegs ein neues
  // Passwort bekommen, und ein Token, das gar nicht erst zustande kommt,
  // prüfte hier nur die Anmeldung und nicht die Rolle.
  await auth().createUser({ email: "postkind@lernapp.local", password: kind.kindPasswort("1234") });
  const kindToken = await anmelden("postkind@lernapp.local", kind.kindPasswort("1234"));
  ok(Boolean(kindToken), "das Kinderkonto für die Postprüfung bekommt kein Token");
  ok((await willkommenHandler(bearer(kindToken))).status === 403, "ein Kinderkonto löst eine Begrüssung aus");

  // --- Passwort vergessen ---------------------------------------------------
  // Der einzige Weg, ohne Anmeldung eine Mail auszulösen. Deshalb: nur an
  // Adressen mit Konto, nur an echte, und nicht im Sekundentakt.
  verschickt = [];
  const reset = await passwortMailSchicken("mama@example.com");
  ok(reset.gesendet === true, `Passwortmail: ${JSON.stringify(reset)}`);
  ok(verschickt[0]?.inhalt?.subject === "Neues Passwort für Gripszug", `Betreff: ${verschickt[0]?.inhalt?.subject}`);
  ok(/https?:\/\//.test(verschickt[0]?.inhalt?.text || ""), "in der Passwortmail steht kein Link");

  const sofortNochmal = await passwortMailSchicken("mama@example.com");
  ok(sofortNochmal.gesendet === false, "zwei Passwortmails im selben Moment");
  ok(verschickt.length === 1, `die Bremse liess ${verschickt.length} Mails durch`);

  verschickt = [];
  ok((await passwortMailSchicken("gibtesnicht@example.com")).gesendet === false, "eine Adresse ohne Konto bekommt eine Mail");
  ok((await passwortMailSchicken("lina@lernapp.local")).gesendet === false, "eine technische Kinderadresse bekommt eine Mail");
  ok((await passwortMailSchicken("keine-adresse")).gesendet === false, "eine krumme Adresse bekommt eine Mail");
  ok(verschickt.length === 0, `an Adressen ohne Konto gingen ${verschickt.length} Mails`);
  // Nach aussen sieht alles gleich aus: Wer hier eine Auskunft bekäme, hätte
  // eine Liste aller Kundinnen und Kunden.
  const fremdeAntwort = await passwortHandler(postJson(null, { email: "gibtesnicht@example.com" }));
  const fremdeDaten = await fremdeAntwort.json();
  ok(fremdeAntwort.status === 200 && fremdeDaten.ok === true, "die Antwort verrät, ob es ein Konto gibt");
  const eigeneAntwort = await (await passwortHandler(postJson(null, { email: "mama@example.com" }))).json();
  ok(JSON.stringify(fremdeDaten) === JSON.stringify(eigeneAntwort),
    `die Antwort unterscheidet Adressen mit und ohne Konto: ${JSON.stringify(fremdeDaten)} vs ${JSON.stringify(eigeneAntwort)}`);
  ok(fremdeDaten.versand === true, "eine Adresse ohne Konto lässt den Client auf Firebase zurückfallen – dort gäbe es genauso wenig ein Konto");

  // Und andersherum: Lehnt Resend ab, MUSS der Client auf Firebase
  // zurückfallen. Sonst bekäme niemand mehr ein neues Passwort, solange die
  // Störung dauert – genau dann, wenn er es braucht.
  const heilesFetch = globalThis.fetch;
  globalThis.fetch = async (ziel, optionen) => {
    if (String(ziel?.url || ziel).startsWith("https://api.resend.com/")) return new Response(JSON.stringify({ message: "Domain is not verified" }), { status: 403 });
    return echtesFetch(ziel, optionen);
  };
  // Die Bremse steht der Prüfung im Weg – deshalb eine zweite Adresse.
  await auth().createUser({ email: "bremse-frei@example.com", password: "elternpasswort" });
  const beiStoerung = await (await passwortHandler(postJson(null, { email: "bremse-frei@example.com" }))).json();
  ok(beiStoerung.ok === true, "bei einer Störung antwortet der Server nicht mehr mit ok");
  ok(beiStoerung.versand === false, "bei einer Störung meldet der Server trotzdem Versand – der Client fiele nicht auf Firebase zurück");
  globalThis.fetch = heilesFetch;

  // --- Der Eingang ----------------------------------------------------------
  verschickt = [];
  const ohneGeheimnis = await eingangHandler(postJson(null, { von: "wer@example.com", betreff: "Hallo" }));
  ok(ohneGeheimnis.status === 401, `der Eingang nimmt ohne Geheimnis an: ${ohneGeheimnis.status}`);
  const mitFalschem = await eingangHandler(new Request("http://x/api", {
    method: "POST", headers: { "content-type": "application/json", "x-mail-geheimnis": "falsch" }, body: JSON.stringify({ von: "wer@example.com" }),
  }));
  ok(mitFalschem.status === 401, `der Eingang nimmt ein falsches Geheimnis an: ${mitFalschem.status}`);
  ok(verschickt.length === 0, "eine abgewiesene Mail wurde trotzdem weitergeleitet");

  const post = {
    von: "Mutter@Example.com", an: "kids@alae.app", betreff: "Frage zur Lizenz",
    text: "Gibt es das auch für eine Schulklasse?", messageId: "<abc@example.com>",
    empfangenAmMs: 1700000000000, pruefung: { spf: "pass", dkim: "pass" },
  };
  const angekommen = await eingangVerarbeiten(post);
  ok(angekommen.ok === true && angekommen.weitergeleitet === true, `Eingang: ${JSON.stringify(angekommen)}`);
  const eingangDoc = (await db().collection("mails").doc(angekommen.id).get()).data();
  ok(eingangDoc?.richtung === "ein" && eingangDoc?.betreff === "Frage zur Lizenz", `im Archiv: ${JSON.stringify(eingangDoc)}`);
  ok(eingangDoc?.von === "mutter@example.com", `die Absenderadresse steht nicht klein geschrieben da: ${eingangDoc?.von}`);
  const weiter = verschickt[verschickt.length - 1]?.inhalt || {};
  ok((weiter.to || [])[0] === "vonallmenalain@gmail.com", `weitergeleitet an ${JSON.stringify(weiter.to)}`);
  // Ein "Antworten" im Postfach muss beim Schreiber landen, nicht bei uns.
  ok(weiter.reply_to === "mutter@example.com", `Antwortadresse: ${weiter.reply_to}`);
  ok(/Schulklasse/.test(weiter.text || ""), "der weitergeleitete Text fehlt");

  ok(angekommen.erledigt === true, "eine zugestellte Mail gilt dem Worker nicht als erledigt");

  // Cloudflare versucht es bei einem Fehler noch einmal – dieselbe Mail darf
  // dann nicht ein zweites Mal im Postfach landen, und der Worker soll sie
  // trotzdem als erledigt ansehen.
  const anzahlVorher = verschickt.length;
  const nochmalEingang = await eingangVerarbeiten(post);
  ok(nochmalEingang.weitergeleitet === false, "dieselbe Mail wurde zweimal weitergeleitet");
  ok(nochmalEingang.erledigt === true, "die Wiederholung gilt als nicht erledigt – der Worker leitete ein zweites Mal weiter");
  ok(verschickt.length === anzahlVorher, `die Wiederholung schickte ${verschickt.length - anzahlVorher} Mails`);

  // Und der Fall, an dem alles hängt: Gripszug nimmt die Mail an, kann sie
  // aber nicht zustellen. Dann muss der Worker es erfahren – sonst liegt die
  // Mail im Archiv und in keinem Postfach.
  const heilesFetch2 = globalThis.fetch;
  globalThis.fetch = async (ziel, optionen) => {
    if (String(ziel?.url || ziel).startsWith("https://api.resend.com/")) return new Response(JSON.stringify({ message: "Domain is not verified" }), { status: 403 });
    return echtesFetch(ziel, optionen);
  };
  const misslungen = await eingangHandler(new Request("http://x/api", {
    method: "POST",
    headers: { "content-type": "application/json", "x-mail-geheimnis": "geheimnis-attrappe" },
    body: JSON.stringify({ ...post, messageId: "<dritte@example.com>" }),
  }));
  const misslungenDaten = await misslungen.json();
  ok(misslungen.status === 502, `eine nicht zugestellte Mail wird mit ${misslungen.status} quittiert – der Worker hielte sie für zugestellt`);
  ok(misslungenDaten.erledigt === false, `erledigt: ${JSON.stringify(misslungenDaten)}`);
  ok((await db().collection("mails").doc(misslungenDaten.id).get()).exists, "die nicht zugestellte Mail steht nicht einmal im Archiv");
  globalThis.fetch = heilesFetch2;

  // Anhänge kommen in der weitergeleiteten Mail nicht mit – deshalb steht
  // wenigstens dabei, dass es welche gibt.
  verschickt = [];
  const mitAnhang = await eingangVerarbeiten({ ...post, messageId: "<vierte@example.com>", anhaenge: ["fehler.png"] });
  ok(mitAnhang.erledigt === true, `Mail mit Anhang: ${JSON.stringify(mitAnhang)}`);
  ok(/fehler\.png/.test(verschickt[0]?.inhalt?.text || ""), "der Name des Anhangs fehlt in der Weiterleitung");
  ok(/Original/.test(verschickt[0]?.inhalt?.text || ""), "es steht nicht dabei, dass das Original noch kommt");
  ok((await db().collection("mails").doc(mitAnhang.id).get()).data()?.anhaenge?.[0] === "fehler.png", "der Anhang steht nicht im Archiv");

  // --- Die Einstellungen ----------------------------------------------------
  const chefToken2 = await anmelden(ADMIN_ADRESSEN[0], "adminpasswort");
  ok((await einstellungenHandler(postJson(mamaToken, { aktion: "lesen" }))).status === 403, "ein Elternkonto liest die Mail-Einstellungen");
  ok((await einstellungenHandler(postJson(null, { aktion: "lesen" }))).status === 401, "die Mail-Einstellungen sind ohne Anmeldung zu haben");

  const gelesen = await (await einstellungenHandler(postJson(chefToken2, { aktion: "lesen" }))).json();
  ok(gelesen.weiterleitungAn === "vonallmenalain@gmail.com", `Weiterleitung: ${JSON.stringify(gelesen)}`);
  ok(gelesen.absender === "kids@alae.app" && gelesen.bereit === true, `Stand: ${JSON.stringify(gelesen)}`);

  const krumm = await einstellungenHandler(postJson(chefToken2, { aktion: "speichern", weiterleitungAn: "keine adresse" }));
  ok(krumm.status === 400, `eine krumme Adresse wurde gespeichert: ${krumm.status}`);
  const gespeichert = await (await einstellungenHandler(postJson(chefToken2, { aktion: "speichern", weiterleitungAn: "Post@Example.com", weiterleitungAktiv: true }))).json();
  ok(gespeichert.weiterleitungAn === "post@example.com", `gespeichert: ${JSON.stringify(gespeichert)}`);
  ok((await einstellungen()).weiterleitungAn === "post@example.com", "die neue Adresse steht nicht in der Datenbank");

  verschickt = [];
  const testAntwort = await einstellungenHandler(postJson(chefToken2, { aktion: "test" }));
  ok(testAntwort.status === 200, `Testmail: ${testAntwort.status}`);
  ok((verschickt[0]?.inhalt?.to || [])[0] === "post@example.com", `die Testmail ging an ${JSON.stringify(verschickt[0]?.inhalt?.to)}`);

  // Aus heisst aus: Die Mail steht im Archiv, geht aber nirgends hin.
  await einstellungenHandler(postJson(chefToken2, { aktion: "speichern", weiterleitungAn: "post@example.com", weiterleitungAktiv: false }));
  verschickt = [];
  const stillerEingang = await eingangVerarbeiten({ ...post, messageId: "<zweite@example.com>" });
  ok(stillerEingang.weitergeleitet === false, "die ausgeschaltete Weiterleitung leitet weiter");
  // Aus ist aus: Dann soll auch der Worker nicht weiterleiten, sonst hiesse
  // der Schalter im Adminbereich nichts.
  ok(stillerEingang.erledigt === true, "bei ausgeschalteter Weiterleitung leitet der Worker ersatzweise weiter");
  ok(verschickt.length === 0, "die ausgeschaltete Weiterleitung rief Resend an");
  ok((await db().collection("mails").doc(stillerEingang.id).get()).exists, "ohne Weiterleitung steht die Mail nicht im Archiv");

  // --- Die Bestellbestätigung -----------------------------------------------
  // Sie hängt am Kauf, nicht am Klick: Erst wenn Stripe die Zahlung meldet,
  // geht sie raus – und dann genau einmal je Kasse, auch wenn Stripe dasselbe
  // Ereignis dreimal schickt.
  verschickt = [];
  const kaeufer = await auth().createUser({ email: "kaeufer@example.com", password: "elternpasswort" });
  await db().collection("users").doc(kaeufer.uid).set({ username: "Käufer", email: "kaeufer@example.com", role: "parent" });
  const kasse = {
    id: "cs_test_mail_1", client_reference_id: kaeufer.uid, payment_status: "paid",
    payment_intent: "pi_mail_1", customer: "cus_mail_1",
    customer_details: { email: "kaeufer@example.com" }, amount_total: 3000, currency: "chf",
  };
  const verbucht = await kaufVerbuchen(kasse);
  ok(verbucht.verbucht === true && verbucht.bestaetigung === true, `Kauf verbucht: ${JSON.stringify(verbucht)}`);
  const bestellung = verschickt[verschickt.length - 1]?.inhalt || {};
  ok(bestellung.subject === "Deine Bestellung bei Gripszug", `Betreff: ${bestellung.subject}`);
  ok(/CHF/.test(bestellung.text || "") && /30/.test(bestellung.text || ""), `der Betrag fehlt: ${(bestellung.text || "").slice(0, 200)}`);
  const bestellDoc = (await db().collection("mails").doc("bestellung-cs_test_mail_1").get()).data();
  ok(bestellDoc?.status === "gesendet", `Archiv der Bestellung: ${JSON.stringify(bestellDoc)}`);

  const anzahlNachKauf = verschickt.length;
  await kaufVerbuchen({ ...kasse, id: "cs_test_mail_1" });
  ok(verschickt.length === anzahlNachKauf, "derselbe Kauf schickte eine zweite Bestätigung");

  // Ein Kauf bleibt ein Kauf, auch wenn Resend nicht mag.
  verschickt = [];
  const kaputtesFetch = globalThis.fetch;
  globalThis.fetch = async (ziel, optionen) => {
    if (String(ziel?.url || ziel).startsWith("https://api.resend.com/")) return new Response(JSON.stringify({ message: "Domain is not verified" }), { status: 403 });
    return echtesFetch(ziel, optionen);
  };
  const trotzdem = await kaufVerbuchen({ ...kasse, id: "cs_test_mail_2", payment_intent: "pi_mail_2" });
  ok(trotzdem.verbucht === true && trotzdem.bestaetigung === false, `Kauf ohne Mail: ${JSON.stringify(trotzdem)}`);
  ok((await db().collection("entitlements").doc(kaeufer.uid).get()).data()?.active === true, "der Kauf ging verloren, weil die Mail scheiterte");
  const kaputtDoc = (await db().collection("mails").doc("bestellung-cs_test_mail_2").get()).data();
  ok(kaputtDoc?.status === "fehler" && /not verified/i.test(kaputtDoc?.fehler || ""), `im Archiv fehlt der Grund: ${JSON.stringify(kaputtDoc)}`);
  globalThis.fetch = kaputtesFetch;

  // --- Die Vorlagen ---------------------------------------------------------
  // Was in escape() läuft, darf keine HTML-Entities enthalten – sonst stünde
  // "f&uuml;r" im Betreff und in der Überschrift.
  for (const [name, gebaut] of Object.entries({
    willkommen: vorlagen.willkommenMail({ email: "a@b.ch" }),
    bestellung: vorlagen.bestellMail({ email: "a@b.ch", betragText: "CHF 30.00", datumText: "1. Januar 2026" }),
    freischaltung: vorlagen.freischaltMail({ email: "a@b.ch" }),
    passwort: vorlagen.passwortMail({ email: "a@b.ch", link: "https://x.test/y" }),
    test: vorlagen.testMail({ an: "a@b.ch" }),
    weiterleitung: vorlagen.weiterleitungsMail({ von: "c@d.ch", an: "kids@alae.app", betreff: "Hallo", text: "Ein ganz gewöhnlicher Satz." }),
  })) {
    ok(!/&[a-z]+;|[<>]/.test(gebaut.betreff), `${name}: im Betreff steckt Auszeichnung – ${gebaut.betreff}`);
    ok(!/&amp;[a-z]+;/.test(gebaut.html), `${name}: doppelt maskierte Zeichen im HTML`);
    ok(gebaut.text.length > 40 && !/<[a-z]/.test(gebaut.text), `${name}: die Textfassung enthält HTML oder ist leer`);
    // Nicht mehr die Kontaktadresse: Die stand einmal in der Fusszeile jeder
    // Mail ("Fragen? Einfach auf diese Mail antworten") und ist dort bewusst
    // weg – geantwortet wird trotzdem an sie, dafür sorgt reply_to. Was bleiben
    // muss, ist der Weg zurück: die Seite und das Impressum.
    ok(/kids\.alae\.app/.test(gebaut.html), `${name}: der Link zur Seite fehlt in der Mail`);
    ok(/impressum\.html/.test(gebaut.html), `${name}: das Impressum fehlt in der Fusszeile`);
  }
  // Kurz bleiben sie nur, wenn es jemand nachhält. Die Grenze ist grosszügig
  // gesetzt – sie fängt das Zuwachsen, nicht den einzelnen Nebensatz.
  for (const [name, gebaut] of Object.entries({
    willkommen: vorlagen.willkommenMail({ email: "a@b.ch" }),
    bestellung: vorlagen.bestellMail({ email: "a@b.ch", betragText: "CHF 30.00", datumText: "1. Januar 2026" }),
    freischaltung: vorlagen.freischaltMail({ email: "a@b.ch" }),
    passwort: vorlagen.passwortMail({ email: "a@b.ch", link: "https://x.test/y" }),
  })) {
    const woerter = gebaut.text.split(/\s+/).filter(Boolean).length;
    ok(woerter <= 60, `${name}: ${woerter} Wörter – die Mail ist wieder zugewachsen`);
  }

  // Fremder Text wird maskiert, nicht eingebaut.
  const boese = vorlagen.weiterleitungsMail({ von: "c@d.ch", an: "kids@alae.app", betreff: "Hallo", text: "<script>alert(1)</script>" });
  ok(!/<script>/.test(boese.html), "fremder Text landet unmaskiert in der Mail");
  ok(/&lt;script&gt;/.test(boese.html), "fremder Text steht nicht maskiert in der Mail");

  // --- Der Briefträger bei Cloudflare ---------------------------------------
  // Der Worker läuft nicht hier, sondern bei Cloudflare – seine Rechnerei aber
  // schon: Wie aus einer rohen Mail lesbarer Text wird, entscheidet sich in
  // reinen Funktionen, und die lassen sich prüfen.
  //
  // Der Fall, um den es geht: quoted-printable und base64 ergeben BYTES. Wer
  // jedes Byte einzeln zu einem Zeichen macht, bekommt aus "Gr=C3=BCsse" ein
  // "GrÃ¼sse" – und das stünde dann im Archiv und in der Weiterleitung.
  {
    const worker = await import("../cloudflare/kids-mail-worker.js");
    ok(worker.quotedPrintable("Gr=C3=BCsse aus Oberburg") === "Grüsse aus Oberburg",
      `quoted-printable: ${worker.quotedPrintable("Gr=C3=BCsse aus Oberburg")}`);
    ok(worker.quotedPrintable("Ein sehr langer Satz, der =\r\numgebrochen wurde") === "Ein sehr langer Satz, der umgebrochen wurde",
      "der weiche Zeilenumbruch von quoted-printable bleibt stehen");
    const b64 = Buffer.from("Grüsse aus Oberburg", "utf8").toString("base64");
    ok(worker.base64Text(b64) === "Grüsse aus Oberburg", `base64: ${worker.base64Text(b64)}`);
    // Ein Zeichensatz, den niemand kennt, darf nichts umwerfen.
    ok(typeof worker.quotedPrintable("Hallo", "erfunden-8") === "string", "ein unbekannter Zeichensatz wirft");

    // Betreffzeilen mit Umlauten stehen als =?UTF-8?Q?…?= da (RFC 2047).
    ok(worker.dekodiereKopf("=?UTF-8?Q?Gr=C3=BCsse_aus_Oberburg?=") === "Grüsse aus Oberburg",
      `Betreff Q: ${worker.dekodiereKopf("=?UTF-8?Q?Gr=C3=BCsse_aus_Oberburg?=")}`);
    ok(worker.dekodiereKopf(`=?UTF-8?B?${Buffer.from("Frage zur Lizenz für Schulen", "utf8").toString("base64")}?=`) === "Frage zur Lizenz für Schulen",
      "Betreff in base64 wird nicht entschlüsselt");
    ok(worker.dekodiereKopf("Ganz gewöhnlicher Betreff") === "Ganz gewöhnlicher Betreff", "ein Betreff ohne Kodierung wird verändert");

    // Eine ganze Mail, wie sie wirklich ankommt: mehrteilig, mit Anhang.
    const grenze = "----grenze1234";
    const rohmail = [
      "From: Sandra <sandra@example.com>",
      "To: kids@alae.app",
      "Subject: =?UTF-8?Q?Gr=C3=BCsse?=",
      `Content-Type: multipart/mixed; boundary="${grenze}"`,
      "",
      `--${grenze}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: quoted-printable",
      "",
      "Gr=C3=BCezi mitenand",
      "",
      "Sch=C3=B6ne App!",
      `--${grenze}`,
      "Content-Type: image/png; name=\"fehler.png\"",
      "Content-Disposition: attachment; filename=\"fehler.png\"",
      "Content-Transfer-Encoding: base64",
      "",
      "iVBORw0KGgo=",
      `--${grenze}--`,
      "",
    ].join("\r\n");

    const text = worker.textAusRoh(rohmail);
    ok(text.startsWith("Grüezi mitenand"), `der Text der Mail: ${JSON.stringify(text.slice(0, 60))}`);
    ok(text.includes("Schöne App!"), "der zweite Absatz fehlt oder ist verstümmelt");
    ok(!text.includes("fehler.png"), "der Anhang steht im Text");
    ok(!/Ã/.test(text), `im Text stehen falsch übersetzte Umlaute: ${JSON.stringify(text)}`);

    const anhaenge = worker.anhaengeAusRoh(rohmail);
    ok(anhaenge.length === 1 && anhaenge[0] === "fehler.png", `Anhänge: ${JSON.stringify(anhaenge)}`);
    ok(worker.anhaengeAusRoh("Subject: ohne\r\n\r\nNur Text").length === 0, "eine Mail ohne Anhang bekommt einen");

    // Eine einteilige Mail ohne Kodierung.
    ok(worker.textAusRoh("From: a@b.ch\r\nSubject: x\r\n\r\nNur ein Satz.") === "Nur ein Satz.", "die einfachste Mail wird nicht gelesen");
  }

  globalThis.fetch = echtesFetch;
  delete process.env.RESEND_API_KEY;
  delete process.env.MAIL_WEBHOOK_SECRET;
}

// --- 11. Was der Emulator nie anfasst: die Signaturprüfung echter Token -------------
// firebase-admin holt dafür die öffentlichen Schlüssel von Google und rechnet
// sie mit jwks-rsa um – und jwks-rsa ist CommonJS und macht require("jose").
// Gegen den Emulator läuft das nie: Der überspringt die Signaturprüfung, und
// deshalb fiel es hier nicht auf, sondern erst auf kids.alae.app, mit 502.
//
// jose 6 ist reines ESM. Node kann seit 20.19/22.12 ESM auch requiren – die
// Lambda bei Netlify aber nicht, sie antwortet mit ERR_REQUIRE_ESM. Deshalb
// liegt unter jwks-rsa jose 5 (package.json, overrides), das CommonJS kann.
// Geprüft wird mit abgeschaltetem require(esm), also so, wie es dort läuft.
{
  const utils = path.join(WURZEL, "node_modules/jwks-rsa/src/utils.js");
  ok(existsSync(utils), "jwks-rsa/src/utils.js fehlt – hat firebase-admin die Abhängigkeit gewechselt?");
  const probe = `
    const { retrieveSigningKeys } = require(${JSON.stringify(utils)});
    const { generateKeyPairSync } = require("node:crypto");
    const { publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const jwk = publicKey.export({ format: "jwk" });
    retrieveSigningKeys([{ ...jwk, kid: "probe", alg: "RS256", use: "sig" }])
      .then((keys) => console.log(keys.length === 1 && keys[0].publicKey ? "GEHT" : "LEER"))
      .catch((fehler) => console.log("FEHLER " + fehler.code + " " + fehler.message.split("\\n")[0]));
  `;
  const lauf = spawnSync(process.execPath, ["--no-experimental-require-module", "-e", probe], { encoding: "utf8" });
  const ausgabe = `${lauf.stdout || ""}${lauf.stderr || ""}`.trim();
  ok(/GEHT/.test(ausgabe), `jwks-rsa lädt ohne require(esm) nicht oder rechnet nicht: ${ausgabe.split("\n")[0].slice(0, 180)}`);
}

console.log(`\n${geprueft} Prüfungen.`);
if (befunde.length) {
  console.error(`\n${befunde.length} Befund${befunde.length === 1 ? "" : "e"}:`);
  befunde.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}
console.log("Die Funktionen tun, was sie sollen.");
process.exit(0);
