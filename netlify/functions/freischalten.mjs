/*
 * Der Administrator schaltet eine Familie frei, ohne dass sie zahlt.
 * ---------------------------------------------------------------------------
 *   POST /api/freischalten   { uid, frei }   mit Bearer-Token des Admins
 *   → { uid, frei, konten }
 *
 * Wozu: Ein Gast legt ein Konto an, und es gibt einen Grund, ihm Gripszug zu
 * schenken – Freunde, Testfamilien, ein Gewinn. Bisher ging das nur über die
 * Kasse. Jetzt geht es per Klick im Adminbereich.
 *
 * Warum das ein Server und keine Regel ist: entitlements/{uid} darf KEIN
 * Client schreiben, auch der Admin nicht (firestore.rules: write: if false).
 * Sonst wäre die Schranke nur so gut wie das Passwort irgendeines Kontos –
 * und ein Kauf, den man sich selbst hinschreiben kann, ist keiner. Der Server
 * schreibt über das Admin-SDK an den Regeln vorbei und prüft vorher am Token,
 * wer anruft.
 *
 * Freigeschaltet wird immer die ganze Familie, genau wie beim Kauf: Ein Kind
 * ohne freigeschaltete Eltern hätte beim nächsten Anlegen eines Geschwisters
 * einen anderen Stand als dieses. Wer die Kennung eines Kindes schickt,
 * schaltet deshalb dessen Elternkonto und alle Geschwister mit frei.
 *
 * Zurücknehmen geht nur, was hier vergeben wurde (source: "admin"). Ein
 * bezahlter Kauf bleibt unberührt – den nimmt eine Rückerstattung bei Stripe
 * zurück, nicht ein Klick. Sonst verlöre eine Familie ihren Kauf durch einen
 * Fehlgriff in einer Liste.
 *
 * Aus demselben Grund schreibt auch das VERGEBEN nicht blind: Es sieht in
 * einer Transaktion nach, ob die Familie inzwischen bezahlt hat, und lehnt
 * dann ab. Der Adminbereich zeigt den Knopf bei bezahlten Konten zwar gar
 * nicht – aber die Liste ist einen Moment alt, und wer in genau diesem Moment
 * an der Kasse war, bekäme sonst ein Geschenk über seinen Kauf geschrieben.
 * Danach stünde dort source: "admin", und ein späteres Zurücknehmen löschte
 * den bezahlten Zugang samt der Stripe-Kennungen, an denen der Webhook eine
 * Rückerstattung wiedererkennt.
 */

import { db, FieldValue, auth } from "./_lib/firebase.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, liesJson, adminAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { kinderVon } from "./_lib/familie.mjs";
import { sendeMail } from "./_lib/mail.mjs";
import { freischaltMail } from "./_lib/mail-vorlagen.mjs";
import { istTechnischeAdresse } from "./_lib/kind.mjs";

export const GESCHENK_PLAN = "geschenk";
export const GESCHENK_QUELLE = "admin";

// Wer zur Familie dieses Kontos gehört: das Elternkonto und alle seine
// Kinder. Ein Konto ohne Familie steht für sich allein – ein Kind aus der
// Zeit vor den Elternkonten etwa.
async function familieUm(uid) {
  const doc = await db().collection("users").doc(uid).get();
  if (!doc.exists) throw new AnfrageFehler(404, "no-account", "Dieses Konto gibt es nicht.");
  const daten = doc.data() || {};
  const kopfUid = typeof daten.parentUid === "string" && daten.parentUid ? daten.parentUid : uid;
  const kopfDaten = kopfUid === uid ? daten : ((await db().collection("users").doc(kopfUid).get()).data() || {});
  const kinder = kinderVon(kopfDaten).map((kind) => kind.uid);
  // Die angefragte Kennung ist immer dabei, auch wenn die Kinderliste am
  // Elternkonto sie (noch) nicht führt: Der Klick galt diesem Konto.
  return [...new Set([kopfUid, ...kinder, uid])];
}

// Ein Eintrag, der nicht von hier stammt: ein Kauf bei Stripe. Den fasst
// weder das Vergeben noch das Zurücknehmen an.
function istBezahlterKauf(daten) {
  return Boolean(daten?.source) && daten.source !== GESCHENK_QUELLE;
}

// Wer etwas geschenkt bekommt, soll es erfahren. Die Mail geht an das
// Elternkonto der Familie – ein Kinderkonto hat nur eine technische Adresse,
// die niemand liest. Und sie geht nur beim Vergeben raus, nicht beim
// Zurücknehmen: "Dir wurde etwas weggenommen" ist keine Mail, die hilft.
//
// Einmal je Konto: die feste Kennung im Archiv sorgt dafür, dass ein zweiter
// Klick auf denselben Knopf keine zweite Mail schickt.
export async function freischaltungMelden(kopfUid) {
  const nutzer = await auth().getUser(kopfUid).catch(() => null);
  const email = String(nutzer?.email || "").toLowerCase();
  if (!email || istTechnischeAdresse(email)) return { gesendet: false, grund: "keine Elternadresse" };
  const vorlage = freischaltMail({ email });
  return sendeMail({
    an: email,
    betreff: vorlage.betreff,
    html: vorlage.html,
    text: vorlage.text,
    art: "freischaltung",
    id: `freischaltung-${kopfUid}`,
    uid: kopfUid,
  });
}

export async function freischalten({ admin, uid, frei = true }) {
  if (typeof uid !== "string" || !uid) throw new AnfrageFehler(400, "missing-uid", "Welches Konto?");
  const konten = await familieUm(uid);
  const refs = konten.map((kontoUid) => db().collection("entitlements").doc(kontoUid));
  const kopf = konten[0];

  // Lesen und Schreiben in einer Transaktion: Zwischen "ist noch nichts da"
  // und "dann schreibe ich" passt sonst genau eine Zahlung.
  return db().runTransaction(async (transaktion) => {
    const staende = await Promise.all(refs.map((ref) => transaktion.get(ref)));
    const bezahlt = staende.find((doc) => doc.exists && istBezahlterKauf(doc.data()));
    const jetzt = FieldValue.serverTimestamp();

    if (frei) {
      if (bezahlt) {
        throw new AnfrageFehler(409, "already-paid", "Diese Familie hat bezahlt – da ist nichts freizuschalten.");
      }
      const eintrag = {
        plan: GESCHENK_PLAN,
        active: true,
        source: GESCHENK_QUELLE,
        grantedAtMs: Date.now(),
        grantedAt: jetzt,
        grantedBy: admin.uid,
      };
      refs.forEach((ref, index) => {
        const kontoUid = konten[index];
        // merge: Was aus einer früheren Zahlung noch dasteht – etwa die
        // Stripe-Kennungen einer Rückerstattung – bleibt stehen. Gelöscht
        // wird hier nichts, überschrieben nur, was das Geschenk ausmacht.
        transaktion.set(ref, kontoUid === kopf ? eintrag : { ...eintrag, via: kopf }, { merge: true });
      });
      return { uid, frei: true, konten: konten.length, kopf };
    }

    if (bezahlt) {
      throw new AnfrageFehler(409, "paid-not-gift", "Diese Familie hat bezahlt. Ein Kauf wird bei Stripe zurückerstattet, nicht hier.");
    }
    let entfernt = 0;
    staende.forEach((doc, index) => {
      if (!doc.exists) return;
      transaktion.delete(refs[index]);
      entfernt += 1;
    });
    return { uid, frei: false, konten: entfernt, kopf };
  });
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const admin = await adminAnrufer(request);
    const { uid, frei } = await liesJson(request);
    const ergebnis = await freischalten({ admin, uid, frei: frei !== false });
    // Erst schenken, dann davon erzählen: Eine Mail, die nicht rausgeht, darf
    // die Freischaltung nicht rückgängig machen.
    let mail = { gesendet: false, grund: "nicht versucht" };
    if (ergebnis.frei) {
      try {
        mail = await freischaltungMelden(ergebnis.kopf || uid);
      } catch (fehler) {
        console.error("Freischaltungs-Mail nicht verschickt:", fehler?.message || fehler);
      }
    }
    return antwort({ ...ergebnis, mail: Boolean(mail.gesendet) });
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/freischalten" };
