/*
 * Ein Besuch, gezählt – ohne IP-Adresse.
 * ---------------------------------------------------------------------------
 *   POST /api/besuch   { guestId, client: { sprache, zeitzone, bildschirm, installiert, seite } }
 *   → { ok: true }
 *
 * Bis hierher entstand ein Gastdokument erst, wenn jemand ein Level STARTETE
 * (firebase.js, recordLevelStart). Wer die App öffnete, sich umsah und wieder
 * ging, hinterliess nichts – und genau diese Leute fehlten in der Antwort auf
 * die Frage, wie viele Menschen die App überhaupt besuchen. Diese Funktion
 * schliesst die Lücke: Sie legt das Gastdokument beim ersten Öffnen an und
 * zählt jeden weiteren Besuch.
 *
 * Warum überhaupt der Umweg über den Server? Wegen des Standorts. Der Browser
 * weiss nicht, wo er steht, und soll es auch nicht ausrechnen müssen – aber
 * das Netlify-Edge weiss es: context.geo trägt Land, Region und Ort der
 * Anfrage bei sich, ohne dass jemand eine IP nachschlagen müsste. Was hier
 * ankommt, ist also die eine Angabe, die der Client gar nicht liefern kann.
 *
 * Und warum keine IP? Weil sie für die Frage nichts beiträgt. Gezählt werden
 * Geräte, und die unterscheidet die Gastkennung ohnehin; die IP sagt nur
 * zusätzlich, welcher Anschluss dahinter steht. Das ist bei einer App für
 * Kinder eine Personenangabe, die man dann aufbewahren, begründen und wieder
 * löschen muss – für einen Zähler ein schlechtes Geschäft. Gespeichert wird
 * deshalb Land, Region und Ort, und die Adresse selbst nie.
 *
 * Das Gerät wird aus dem User-Agent gelesen, aber nicht als solcher
 * gespeichert: In der Datenbank landen "Handy", "iOS", "Safari" – drei grobe
 * Angaben, die die Frage "auf welchem Gerät?" beantworten. Die vollständige
 * Kennung wäre ein Fingerabdruck und beantwortet dieselbe Frage nicht besser.
 *
 * Zwei Bremsen, und beide stehen aus gutem Grund da:
 *
 *   Je Gerät   Ein Neuladen ist kein zweiter Besuch. Innerhalb von 30 Minuten
 *              wird nur der Zeitstempel nachgeführt, der Zähler nicht.
 *
 *   Je Anschluss  Dieser Endpunkt ist offen – wie passwort-mail.mjs, und aus
 *              demselben Grund: Ein Gast hat kein Firebase-Token, es gibt also
 *              niemanden zu prüfen. Ohne Bremse könnte irgendwer in einer
 *              Schleife erfundene Gastkennungen schicken und die Datenbank mit
 *              Millionen Dokumenten füllen. Gezählt wird deshalb je Anschluss,
 *              und zwar über eine mit einem Serverschlüssel gesalzene
 *              Prüfsumme der Adresse: Die Bremse braucht Wiedererkennung,
 *              nicht die Adresse – gespeichert wird nur die Prüfsumme.
 */

import { createHash } from "node:crypto";
import { db, FieldValue } from "./_lib/firebase.mjs";
import { antwort, fehlerAntwort, liesJson, nurMethode, AnfrageFehler } from "./_lib/anfrage.mjs";

// Dasselbe Muster wie isGuestId() in firestore.rules und wie getGuestId() in
// firebase.js es erzeugt. Drei Stellen, dieselbe Form – test-rules.mjs und
// test-functions.mjs vergleichen sie.
export const GAST_MUSTER = /^guest_[A-Za-z0-9_-]{8,48}$/;

export const BREMSE_SAMMLUNG = "besuchBremse";
export const ZAEHL_ABSTAND_MS = 30 * 60 * 1000;
export const JE_ANSCHLUSS_AM_TAG = 240;

// Gesalzen, und das ist hier kein Zierrat: Ein blosser SHA-256 einer
// IPv4-Adresse ist keine Einbahnstrasse. Es gibt nur gut vier Milliarden
// davon – wer den Hash hat, rechnet sie alle durch und weiss, zu welcher
// Adresse er gehört. Erst ein Schlüssel, den nur der Server kennt, macht
// daraus eine Prüfsumme, die ohne ihn nichts verrät.
//
// Als Salz dient das Dienstkonto: Es liegt ohnehin als Umgebungsvariable
// bereit, ohne es läuft diese Funktion gar nicht, und es verlangt niemandem
// eine weitere Variable ab, die beim Einrichten vergessen werden könnte.
// Fehlt es (Emulator, Prüfskripte), reicht die Projekt-ID – dort gibt es
// nichts zu schützen.
const SALZ = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_PROJECT_ID || "lernapp";

const bremsSchluessel = (ip) => createHash("sha256").update(`besuch:${SALZ}:${ip}`).digest("hex").slice(0, 24);

// Der Anschluss, nur zum Bremsen. Netlify setzt x-nf-client-connection-ip;
// hinter einem weiteren Proxy steht die Adresse vorn in x-forwarded-for.
export function anschlussAus(request, context = {}) {
  const kopf = (name) => request.headers?.get?.(name) || "";
  const weitergeleitet = kopf("x-forwarded-for").split(",")[0].trim();
  return kopf("x-nf-client-connection-ip") || weitergeleitet || context.ip || "";
}

// --- Was für ein Gerät? ------------------------------------------------------
// Eine grobe Einteilung, und sie gibt sich auch als grobe aus: Der User-Agent
// ist seit Jahren ein Sammelsurium aus Rücksichtnahme auf alte Prüfungen –
// jeder Browser behauptet, mehrere andere zu sein. Für "Handy oder Computer?"
// reicht er trotzdem, und mehr wird hier nicht gefragt.
export function geraetAus(userAgent = "") {
  const ua = String(userAgent);
  if (!ua) return { geraet: "", system: "", browser: "" };

  const istTablet = /iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const istHandy = !istTablet && /Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua);
  const geraet = istTablet ? "Tablet" : istHandy ? "Handy" : "Computer";

  // iPadOS meldet sich seit Version 13 als "Macintosh". Die Reihenfolge fängt
  // das ab: iPad wird vor Mac geprüft, und der Tablet-Test oben kennt es auch.
  const system =
    /iPhone|iPad|iPod/i.test(ua) ? "iOS"
    : /Android/i.test(ua) ? "Android"
    : /Windows NT/i.test(ua) ? "Windows"
    : /Mac OS X/i.test(ua) ? "macOS"
    : /CrOS/i.test(ua) ? "ChromeOS"
    : /Linux/i.test(ua) ? "Linux"
    : "";

  // Von hinten nach vorn: Edge nennt sich Chrome, Chrome nennt sich Safari.
  // Wer zuerst auf Safari prüft, findet nie etwas anderes.
  const browser =
    /Edg\//i.test(ua) ? "Edge"
    : /OPR\/|Opera/i.test(ua) ? "Opera"
    : /SamsungBrowser/i.test(ua) ? "Samsung Internet"
    : /Firefox\/|FxiOS/i.test(ua) ? "Firefox"
    : /CriOS|Chrome\//i.test(ua) ? "Chrome"
    : /Safari\//i.test(ua) ? "Safari"
    : "";

  return { geraet, system, browser };
}

// --- Wo ungefähr? ------------------------------------------------------------
// context.geo kommt vom Netlify-Edge. Breite und Länge stehen dort auch – sie
// bleiben absichtlich liegen: Ein Punkt auf der Karte ist genauer als die
// Frage verlangt, und Genauigkeit, die niemand braucht, ist bei Kinderdaten
// kein Gewinn, sondern eine Pflicht mehr.
export function ortAus(geo = {}) {
  const ort = {
    land: String(geo?.country?.name || "").slice(0, 60),
    landCode: String(geo?.country?.code || "").slice(0, 4).toUpperCase(),
    region: String(geo?.subdivision?.name || "").slice(0, 60),
    stadt: String(geo?.city || "").slice(0, 60),
  };
  // Leere Felder gar nicht erst schreiben: Ein Dokument voller "" sieht im
  // Adminbereich aus wie eine Angabe, die es nicht gibt.
  Object.keys(ort).forEach((schluessel) => { if (!ort[schluessel]) delete ort[schluessel]; });
  return ort;
}

// --- Was der Browser von sich aus mitgeben kann ------------------------------
// Alles hier kommt vom Client und ist damit keine Tatsache, sondern eine
// Behauptung – jemand kann schicken, was er will. Für einen Zähler ist das
// hinnehmbar; gekappt wird trotzdem, damit niemand Romane in die Datenbank
// schreibt.
export function clientAus(roh = {}) {
  const text = (wert, laenge) => String(wert ?? "").trim().slice(0, laenge);
  const angaben = {
    sprache: text(roh.sprache, 12),
    zeitzone: text(roh.zeitzone, 60),
    bildschirm: /^\d{2,5}×\d{2,5}$/.test(text(roh.bildschirm, 12)) ? text(roh.bildschirm, 12) : "",
    seite: text(roh.seite, 40),
  };
  Object.keys(angaben).forEach((schluessel) => { if (!angaben[schluessel]) delete angaben[schluessel]; });
  if (roh.installiert === true) angaben.installiert = true;
  return angaben;
}

// Gibt zurück, ob dieser Anschluss noch zählen darf – und merkt sich den
// Versuch. In einer Transaktion, damit zwei gleichzeitige Anfragen nicht beide
// den alten Stand lesen. Dasselbe Muster wie darfSchicken() in
// passwort-mail.mjs.
export async function darfZaehlen(ip, jetzt = Date.now()) {
  if (!ip) return true;
  const ref = db().collection(BREMSE_SAMMLUNG).doc(bremsSchluessel(ip));
  try {
    return await db().runTransaction(async (transaktion) => {
      const doc = await transaktion.get(ref);
      const daten = doc.exists ? (doc.data() || {}) : {};
      const tag = new Date(jetzt).toISOString().slice(0, 10);
      const zaehler = daten.tag === tag ? Number(daten.amTag) || 0 : 0;
      if (zaehler >= JE_ANSCHLUSS_AM_TAG) return false;
      transaktion.set(ref, { tag, amTag: zaehler + 1, zuletzt: FieldValue.serverTimestamp() }, { merge: true });
      return true;
    });
  } catch (fehler) {
    // Keine Bremse lesbar: Dann lieber nicht zählen. Anders als bei der
    // Passwortmail sperrt das niemanden aus – es fehlt eine Zeile in einer
    // Statistik, und das ist der kleinere Schaden.
    console.warn("Besuchsbremse nicht lesbar:", fehler?.message || fehler);
    return false;
  }
}

export function gastName(guestId) {
  return `Gast ${String(guestId || "").slice(-6).toUpperCase()}`;
}

// Der eigentliche Eintrag. Läuft in einer Transaktion, weil der Zähler vom
// vorherigen Stand abhängt: Ohne sie zählten zwei Aufrufe im selben Moment
// beide als erster Besuch.
export async function besuchEintragen({ guestId, client = {}, ort = {}, geraet = {}, jetzt = Date.now() }) {
  const ref = db().collection("guests").doc(guestId);
  return db().runTransaction(async (transaktion) => {
    const doc = await transaktion.get(ref);
    const daten = doc.exists ? (doc.data() || {}) : {};
    const zuletzt = Number(daten.letzterBesuchMs) || 0;
    const zaehlt = !doc.exists || jetzt - zuletzt >= ZAEHL_ABSTAND_MS;

    const eintrag = {
      // type ist Pflicht: firestore.rules lässt ein Gastdokument ohne dieses
      // Feld nicht zu. Der Server schriebe zwar an den Regeln vorbei – aber
      // dann stünde hier ein Dokument, das der Client nie fortschreiben
      // dürfte, und beim nächsten gespielten Level ginge der Schreibversuch
      // ins Leere.
      type: "guest",
      guestId,
      displayName: daten.displayName || gastName(guestId),
      letzterBesuchAt: FieldValue.serverTimestamp(),
      // lastSeenAt führt der Client beim Spielen ohnehin – der Adminbereich
      // sortiert danach. Ein Besuch ist auch ein Gesehenwerden.
      lastSeenAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    // letzterBesuchMs ist der letzte GEZÄHLTE Besuch, nicht der letzte Aufruf –
    // und dieser Unterschied ist der ganze Punkt. Würde ihn auch ein nicht
    // gezählter Aufruf vorschieben, verlängerte jedes Neuladen die Sperrfrist:
    // Wer alle 29 Minuten neu lädt, käme nie wieder über die Schwelle und
    // bliebe für immer bei Besuch eins. Wann jemand zuletzt da war, steht in
    // letzterBesuchAt und lastSeenAt; die laufen bei jedem Aufruf mit.
    if (zaehlt) {
      eintrag.besuche = FieldValue.increment(1);
      eintrag.letzterBesuchMs = jetzt;
    }
    if (!doc.exists) {
      eintrag.ersterBesuchMs = jetzt;
      eintrag.ersterBesuchAt = FieldValue.serverTimestamp();
      eintrag.createdAtMs = jetzt;
      eintrag.localPersistence = true;
    }
    // Ort und Gerät werden bei jedem Besuch überschrieben, nicht nur beim
    // ersten: Wer in den Ferien spielt, soll dort auftauchen, und ein neues
    // Handy ist ein neues Gerät. Die Frage lautet "wo und womit zuletzt?".
    if (Object.keys(ort).length) eintrag.ort = ort;
    const geraetAngaben = { ...geraet, ...client };
    Object.keys(geraetAngaben).forEach((k) => { if (geraetAngaben[k] === "" || geraetAngaben[k] == null) delete geraetAngaben[k]; });
    if (Object.keys(geraetAngaben).length) eintrag.client = geraetAngaben;

    transaktion.set(ref, eintrag, { merge: true });
    return { neu: !doc.exists, gezaehlt: zaehlt };
  });
}

export default async (request, context = {}) => {
  try {
    nurMethode(request, "POST");
    const { guestId, client } = await liesJson(request);
    const kennung = String(guestId || "").trim();
    if (!GAST_MUSTER.test(kennung)) {
      throw new AnfrageFehler(400, "bad-guest-id", "Das ist keine Gastkennung.");
    }

    if (!(await darfZaehlen(anschlussAus(request, context)))) {
      // Kein Fehler für den Anrufer: Die App soll nicht merken, dass gebremst
      // wurde, und schon gar nicht deswegen etwas anders machen.
      return antwort({ ok: true, gezaehlt: false });
    }

    const ergebnis = await besuchEintragen({
      guestId: kennung,
      client: clientAus(client),
      ort: ortAus(context.geo),
      geraet: geraetAus(request.headers?.get?.("user-agent")),
    });
    return antwort({ ok: true, gezaehlt: ergebnis.gezaehlt });
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/besuch" };
