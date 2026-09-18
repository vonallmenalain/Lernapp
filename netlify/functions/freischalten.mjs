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
 */

import { db, FieldValue } from "./_lib/firebase.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, liesJson, adminAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { kinderVon } from "./_lib/familie.mjs";

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

export async function freischalten({ admin, uid, frei = true }) {
  if (typeof uid !== "string" || !uid) throw new AnfrageFehler(400, "missing-uid", "Welches Konto?");
  const konten = await familieUm(uid);
  const stapel = db().batch();
  const jetzt = FieldValue.serverTimestamp();
  const kopf = konten[0];

  if (frei) {
    const eintrag = {
      plan: GESCHENK_PLAN,
      active: true,
      source: GESCHENK_QUELLE,
      grantedAtMs: Date.now(),
      grantedAt: jetzt,
      grantedBy: admin.uid,
    };
    konten.forEach((kontoUid) => {
      stapel.set(db().collection("entitlements").doc(kontoUid), kontoUid === kopf ? eintrag : { ...eintrag, via: kopf });
    });
    await stapel.commit();
    return { uid, frei: true, konten: konten.length };
  }

  // Zurücknehmen: erst nachsehen, ob wirklich alles vom Haus ist.
  const staende = await Promise.all(konten.map((kontoUid) => db().collection("entitlements").doc(kontoUid).get()));
  const bezahlt = staende.find((doc) => doc.exists && doc.data()?.source && doc.data().source !== GESCHENK_QUELLE);
  if (bezahlt) {
    throw new AnfrageFehler(409, "paid-not-gift", "Diese Familie hat bezahlt. Ein Kauf wird bei Stripe zurückerstattet, nicht hier.");
  }
  let entfernt = 0;
  staende.forEach((doc) => {
    if (!doc.exists) return;
    stapel.delete(doc.ref);
    entfernt += 1;
  });
  if (entfernt) await stapel.commit();
  return { uid, frei: false, konten: entfernt };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const admin = await adminAnrufer(request);
    const { uid, frei } = await liesJson(request);
    return antwort(await freischalten({ admin, uid, frei: frei !== false }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/freischalten" };
