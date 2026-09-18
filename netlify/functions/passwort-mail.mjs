/*
 * Passwort vergessen – die Mail kommt von uns, nicht von Firebase.
 * ---------------------------------------------------------------------------
 *   POST /api/passwort-mail   { email }
 *   → { ok: true }
 *
 * Diese Funktion ist die einzige ohne Anmeldung: Wer sein Passwort vergessen
 * hat, kann sich ja gerade nicht anmelden. Das macht sie zur einzigen, mit der
 * jemand von aussen einen Mailversand auslösen kann – und deshalb steht hier
 * mehr Vorsicht als in den anderen:
 *
 *   - Geschickt wird nur an Adressen, zu denen es ein Konto gibt. Firebase
 *     sagt uns das (generatePasswordResetLink wirft sonst).
 *   - Und nur an echte Elternadressen: Ein Kinderkonto hat eine technische
 *     Adresse (@lernapp.local), die niemand liest.
 *   - Höchstens eine Mail je 90 Sekunden und höchstens fünf am Tag je
 *     Adresse. Sonst wäre das hier ein Knopf, mit dem sich ein Fremder
 *     hundert Mails an eine fremde Adresse schicken lässt.
 *
 * Geantwortet wird IMMER mit ok. Ob es zu einer Adresse ein Konto gibt, ist
 * eine Auskunft, die niemand bekommt, der sie nicht ohnehin hat – sonst wäre
 * dieser Endpunkt eine Liste aller Kundinnen und Kunden.
 *
 * Ein einziges Feld steht noch in der Antwort: "versand". Es sagt, ob der
 * Versandweg diese Anfrage tragen konnte, und der Client fällt sonst auf die
 * Mail von Firebase zurück. Ohne das wäre ein Konto nicht mehr zu erreichen,
 * sobald Resend hustet – und ein vergessenes Passwort ist der schlechteste
 * Moment dafür.
 *
 * "versand" ist deshalb ausdrücklich NICHT dasselbe wie "eine Mail ging raus":
 *
 *   true   eine Mail ging raus – ODER es gab nichts zu verschicken, und zwar
 *          aus einem Grund, der nichts mit der Technik zu tun hat: kein Konto
 *          zu dieser Adresse, eine technische Kinderadresse, eine krumme
 *          Adresse, oder die Bremse. In all diesen Fällen brächte ein
 *          zweiter Anlauf über Firebase auch nichts.
 *   false  es wurde verschickt und ging schief – oder es ist gar kein
 *          Schlüssel hinterlegt. Nur dann übernimmt Firebase.
 *
 * Die Adresse verrät das nicht: Für ein Konto und für kein Konto steht
 * dieselbe Antwort da, solange der Versand läuft. Nur WÄHREND einer Störung
 * unterscheiden sich die beiden – ein enges Fenster, und der Preis dafür,
 * dass in genau diesem Fenster niemand aus seinem Konto ausgesperrt bleibt.
 *
 * Der Link stammt aus dem Admin-SDK (generatePasswordResetLink); Firebase
 * verschickt dabei selbst nichts.
 */

import { createHash } from "node:crypto";
import { auth, db, FieldValue } from "./_lib/firebase.mjs";
import { antwort, fehlerAntwort, liesJson, nurMethode } from "./_lib/anfrage.mjs";
import { istTechnischeAdresse } from "./_lib/kind.mjs";
import { sendeMail, istAdresse, sauberAdresse, mailBereit } from "./_lib/mail.mjs";
import { passwortMail, SEITE } from "./_lib/mail-vorlagen.mjs";

export const BREMSE_SAMMLUNG = "mailBremse";
export const ABSTAND_MS = 90 * 1000;
export const AM_TAG = 5;

const schluessel = (email) => createHash("sha256").update(`passwort:${email}`).digest("hex").slice(0, 24);

// Gibt zurück, ob geschickt werden darf – und merkt sich den Versuch. Beides
// in einer Transaktion: Zwei Anfragen im selben Moment sollen nicht beide
// durchkommen, weil beide den alten Stand gelesen haben.
export async function darfSchicken(email, jetzt = Date.now()) {
  const ref = db().collection(BREMSE_SAMMLUNG).doc(schluessel(email));
  try {
    return await db().runTransaction(async (transaktion) => {
      const doc = await transaktion.get(ref);
      const daten = doc.exists ? (doc.data() || {}) : {};
      const zuletzt = Number(daten.zuletztMs) || 0;
      const tag = new Date(jetzt).toISOString().slice(0, 10);
      const zaehler = daten.tag === tag ? Number(daten.amTag) || 0 : 0;
      if (jetzt - zuletzt < ABSTAND_MS) return { ok: false, grund: "zu schnell hintereinander" };
      if (zaehler >= AM_TAG) return { ok: false, grund: "heute schon genug" };
      transaktion.set(ref, { zuletztMs: jetzt, tag, amTag: zaehler + 1, zuletzt: FieldValue.serverTimestamp() }, { merge: true });
      return { ok: true };
    });
  } catch (fehler) {
    // Keine Bremse lesbar: Dann lieber verschicken als jemanden aussperren,
    // der sein Passwort wirklich vergessen hat.
    console.warn("Bremse nicht lesbar:", fehler?.message || fehler);
    return { ok: true };
  }
}

export async function passwortMailSchicken(rohAdresse) {
  const email = sauberAdresse(rohAdresse);
  // "nichtsZuTun": nichts ging raus, aber der Versandweg ist in Ordnung – ein
  // zweiter Anlauf über Firebase brächte nichts.
  if (!istAdresse(email) || istTechnischeAdresse(email)) return { gesendet: false, nichtsZuTun: true, grund: "keine Elternadresse" };

  const bremse = await darfSchicken(email);
  if (!bremse.ok) return { gesendet: false, nichtsZuTun: true, grund: bremse.grund };

  let link = "";
  try {
    link = await auth().generatePasswordResetLink(email, { url: `${SEITE}/index.html`, handleCodeInApp: false });
  } catch (fehler) {
    try {
      link = await auth().generatePasswordResetLink(email);
    } catch {
      // Kein Konto zu dieser Adresse – oder Firebase mag die Rücksprungadresse
      // nicht. Beides ist kein Fehler, den der Anrufer erfahren darf, und
      // beides bekäme Firebase auch nicht besser hin.
      return { gesendet: false, nichtsZuTun: true, grund: "kein Konto zu dieser Adresse" };
    }
  }

  const vorlage = passwortMail({ email, link });
  return sendeMail({
    an: email,
    betreff: vorlage.betreff,
    html: vorlage.html,
    text: vorlage.text,
    art: "passwort",
  });
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const { email } = await liesJson(request);
    const ergebnis = await passwortMailSchicken(email);
    // Immer ok: siehe oben. Was wirklich passiert ist, steht im Archiv und
    // damit im Adminbereich.
    if (!ergebnis.gesendet) console.info("passwort-mail:", ergebnis.grund);
    // Siehe oben: nicht "ging raus", sondern "der Weg trug diese Anfrage".
    const versand = mailBereit() && (ergebnis.gesendet || ergebnis.nichtsZuTun === true);
    return antwort({ ok: true, versand });
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/passwort-mail" };
