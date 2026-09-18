/*
 * Der Postausgang: Gripszug schreibt selbst, über Resend.
 * ---------------------------------------------------------------------------
 * Bis hierher verschickte Firebase die Mails: eine Bestätigung der Adresse und
 * das Zurücksetzen des Passworts, beides im Werkszustand – Absender
 * "noreply@lernapp-8d944.firebaseapp.com", Betreff "Verify your email for
 * project-123146993935", darunter ein nackter Link. Wer so etwas bekommt,
 * glaubt an Betrug, nicht an eine Kinder-App.
 *
 * Jetzt kommt jede Mail von hier, mit demselben Absender wie die Adresse, an
 * die man antworten kann: kids@alae.app. Verschickt wird über Resend – dieselbe
 * Domain alae.app, die dort für die anderen Apps schon eingerichtet ist (DKIM
 * und SPF stehen im DNS, siehe FIREBASE_SETUP.md, Abschnitt 10). Für Gripszug
 * braucht es deshalb keinen einzigen neuen DNS-Eintrag, nur einen Schlüssel.
 *
 * Kein Paket, nur fetch: Die Resend-Bibliothek kann nichts, was ein POST nicht
 * auch kann, und jedes Paket mehr ist ein Paket mehr, das die Lambda laden
 * muss (netlify.toml, node_bundler = nft).
 *
 * Jede verschickte und jede empfangene Mail landet ausserdem in der Sammlung
 * "mails" – das ist der Reiter E-Mail im Adminbereich. Lesen darf sie nur der
 * Admin, schreiben niemand ausser dem Server (firestore.rules).
 *
 * Und: Verschicken kann schiefgehen, ohne dass deshalb etwas anderes
 * schiefgehen darf. Kein Aufrufer bricht ab, weil eine Mail nicht rausging –
 * ein Kauf ist verbucht, auch wenn die Bestätigung hängt. Deshalb wirft
 * sendeMail nicht, sondern gibt zurück, was passiert ist; wer es wissen muss,
 * schaut nach.
 */

import { db, FieldValue } from "./firebase.mjs";

export const MAIL_SAMMLUNG = "mails";
export const MAIL_EINSTELLUNGEN = "mailConfig/einstellungen";

const RESEND_URL = "https://api.resend.com/emails";

// Absender und Antwortadresse. Beides lässt sich per Umgebungsvariable
// umstellen, falls die Adresse einmal eine andere wird – der Vorgabewert ist
// die, die überall in der App steht.
export const ABSENDER_ADRESSE = () => (process.env.MAIL_ABSENDER || "kids@alae.app").trim();
export const ABSENDER_NAME = () => (process.env.MAIL_ABSENDER_NAME || "Gripszug").trim();
export const ABSENDER = () => `${ABSENDER_NAME()} <${ABSENDER_ADRESSE()}>`;

// Ohne Schlüssel wird nichts verschickt – aber es stürzt auch nichts ab.
// Gripszug lief vor diesen Mails, und es läuft ohne sie weiter.
export const mailBereit = () => Boolean(process.env.RESEND_API_KEY);

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const istAdresse = (wert) => EMAIL_MUSTER.test(String(wert || "").trim());
export const sauberAdresse = (wert) => String(wert || "").trim().toLowerCase();

// Firestore nimmt bis zu einem Megabyte je Dokument. Eine Mail mit Anhang
// oder eine Werbemail voller Bilder sprengt das – und der Adminbereich will
// ohnehin nur lesen können, was drinsteht, nicht das Original aufbewahren.
const MAX_TEXT = 40000;
const MAX_HTML = 120000;
const kuerze = (wert, grenze) => {
  const text = typeof wert === "string" ? wert : "";
  return text.length > grenze ? `${text.slice(0, grenze)}\n[…gekürzt]` : text;
};

// ---------------------------------------------------------------------------
// Die Einstellungen
// ---------------------------------------------------------------------------
// Wohin die Post an kids@alae.app weitergeleitet wird, steht nicht im Code,
// sondern in einem Dokument: So lässt es sich im Adminbereich ändern, ohne
// dass jemand deployen muss.
export const VORGABE_WEITERLEITUNG = "vonallmenalain@gmail.com";

export async function einstellungen() {
  const [sammlung, id] = MAIL_EINSTELLUNGEN.split("/");
  let daten = {};
  try {
    const doc = await db().collection(sammlung).doc(id).get();
    daten = doc.exists ? (doc.data() || {}) : {};
  } catch {
    // Keine Einstellungen zu lesen ist kein Grund, keine Mail zu verschicken.
    daten = {};
  }
  const an = sauberAdresse(daten.weiterleitungAn) || VORGABE_WEITERLEITUNG;
  return {
    weiterleitungAn: istAdresse(an) ? an : VORGABE_WEITERLEITUNG,
    weiterleitungAktiv: daten.weiterleitungAktiv !== false,
    // Nur zur Anzeige im Adminbereich: wer zuletzt daran war.
    geaendertAmMs: Number(daten.geaendertAmMs) || 0,
  };
}

export async function speichereEinstellungen({ weiterleitungAn, weiterleitungAktiv, von }) {
  const [sammlung, id] = MAIL_EINSTELLUNGEN.split("/");
  const an = sauberAdresse(weiterleitungAn);
  if (!istAdresse(an)) return { ok: false, grund: "keine gültige Adresse" };
  await db().collection(sammlung).doc(id).set({
    weiterleitungAn: an,
    weiterleitungAktiv: weiterleitungAktiv !== false,
    geaendertAmMs: Date.now(),
    geaendertAm: FieldValue.serverTimestamp(),
    geaendertVon: von || null,
  }, { merge: true });
  return { ok: true, weiterleitungAn: an, weiterleitungAktiv: weiterleitungAktiv !== false };
}

// ---------------------------------------------------------------------------
// Das Archiv
// ---------------------------------------------------------------------------
// Ein Eintrag je Mail, ein und aus. Die Kennung darf der Aufrufer vorgeben –
// und tut es überall dort, wo dieselbe Mail zweimal ausgelöst werden kann:
// "willkommen-<uid>", "bestellung-<stripe-session>". Stripe schickt sein
// Ereignis gern mehrmals; mit fester Kennung sieht der zweite Anlauf, dass
// die Mail schon draussen ist, und schweigt.
export async function archiviere(id, eintrag) {
  const sammlung = db().collection(MAIL_SAMMLUNG);
  const ref = id ? sammlung.doc(id) : sammlung.doc();
  await ref.set({
    ...eintrag,
    zeitMs: eintrag.zeitMs || Date.now(),
    zeit: FieldValue.serverTimestamp(),
  }, { merge: true });
  return ref.id;
}

async function schonGesendet(id) {
  if (!id) return false;
  try {
    const doc = await db().collection(MAIL_SAMMLUNG).doc(id).get();
    return doc.exists && doc.data()?.status === "gesendet";
  } catch {
    // Wer nicht nachsehen kann, verschickt lieber zweimal als gar nicht.
    return false;
  }
}

// ---------------------------------------------------------------------------
// Verschicken
// ---------------------------------------------------------------------------
// an        Empfänger (eine Adresse)
// betreff   Betreffzeile
// html/text beides – wer HTML nicht mag, liest den Text. Ohne text baut
//           Resend keinen; eine Mail ohne Textteil landet eher im Spam.
// art       wofür (willkommen, bestellung, passwort, weiterleitung, test)
// id        feste Kennung im Archiv, wenn die Mail nur einmal rausdarf
// antwortAn abweichende Antwortadresse (die Weiterleitung antwortet an den
//           ursprünglichen Absender, nicht an uns selbst)
export async function sendeMail({ an, betreff, html, text, art = "sonstige", id = "", uid = "", antwortAn = "", meta = {} }) {
  const empfaenger = sauberAdresse(an);
  if (!istAdresse(empfaenger)) return { gesendet: false, grund: "keine gültige Empfängeradresse" };
  if (await schonGesendet(id)) return { gesendet: false, grund: "schon gesendet", id };

  const grunddaten = {
    richtung: "aus",
    art,
    an: empfaenger,
    von: ABSENDER_ADRESSE(),
    betreff: String(betreff || "").slice(0, 400),
    text: kuerze(text, MAX_TEXT),
    html: kuerze(html, MAX_HTML),
    uid: uid || null,
    ...meta,
  };

  if (!mailBereit()) {
    // Kein Schlüssel: Die Mail steht im Archiv, mit dem Grund. So sieht der
    // Adminbereich, dass etwas fehlt – und nicht, dass nichts passiert ist.
    await archiviere(id, { ...grunddaten, status: "fehler", fehler: "RESEND_API_KEY fehlt" });
    return { gesendet: false, grund: "RESEND_API_KEY fehlt" };
  }

  let antwort;
  let daten = {};
  try {
    antwort = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ABSENDER(),
        to: [empfaenger],
        subject: grunddaten.betreff,
        html,
        text,
        reply_to: antwortAn && istAdresse(antwortAn) ? antwortAn : ABSENDER_ADRESSE(),
      }),
    });
    try { daten = await antwort.json(); } catch { daten = {}; }
  } catch (fehler) {
    await archiviere(id, { ...grunddaten, status: "fehler", fehler: `Resend nicht erreichbar: ${fehler.message}` });
    return { gesendet: false, grund: "Resend nicht erreichbar" };
  }

  if (!antwort.ok) {
    const grund = daten?.message || daten?.name || `HTTP ${antwort.status}`;
    await archiviere(id, { ...grunddaten, status: "fehler", fehler: String(grund).slice(0, 500) });
    return { gesendet: false, grund: String(grund) };
  }

  await archiviere(id, { ...grunddaten, status: "gesendet", resendId: daten?.id || null, fehler: null });
  return { gesendet: true, resendId: daten?.id || null, an: empfaenger };
}
