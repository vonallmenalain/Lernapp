/*
 * Ein Konto restlos entfernen.
 * ---------------------------------------------------------------------------
 * Ein Konto liegt an fünf Orten, und keiner davon räumt die anderen mit auf:
 *
 *   Firebase Auth          die Anmeldung. Adresse und Passwort. NUR hier –
 *                          Firestore weiss davon nichts.
 *   users/{uid}            das Profil: Name, Rolle, Lok, Gruppe, Zahlen.
 *   users/{uid}/…          gelöste Level und Sitzungen, zwei Unterkollektionen.
 *   entitlements/{uid}     ob gekauft wurde.
 *   mails                  was an dieses Konto geschickt wurde.
 *
 * Das ist der Grund, warum das Löschen eines Dokuments in der Firebase-Console
 * die Adresse nicht freigibt: Gelöscht ist dann das Profil, nicht die
 * Anmeldung. Wer sich danach neu anmeldet, legt sich ein frisches Profil an –
 * und wer sich neu registrieren will, hört "diese Adresse gibt es schon".
 *
 * Reihenfolge: ERST die Anmeldung. Das ist die einzige, die einen Abbruch
 * mittendrin übersteht – dieselbe Überlegung wie in kind-loeschen.mjs, und
 * dort steht sie ausführlich. Kurz: Ab dem ersten Schritt kommt niemand mehr
 * in das Konto, und was danach liegen bleibt, räumt derselbe Knopf beim
 * nächsten Tippen zu Ende auf.
 */

import { auth, db } from "./firebase.mjs";

// Firestore löscht keine Kollektion, nur Dokumente – und ein Stapel fasst 500.
// Vierzig Level mal acht Spiele plus Sitzungen kommen da durchaus hin.
export async function unterkollektionLeeren(ref) {
  const schnappschuss = await ref.get();
  const docs = schnappschuss.docs;
  for (let von = 0; von < docs.length; von += 400) {
    const stapel = db().batch();
    docs.slice(von, von + 400).forEach((doc) => stapel.delete(doc.ref));
    await stapel.commit();
  }
  return docs.length;
}

// Alles zu einem Konto, ausser dem Eintrag in children[] der Eltern – der
// gehört der Familie und wird vom Aufrufer gepflegt, der weiss, ob es die
// Eltern überhaupt noch gibt.
export async function kontoTilgen(uid) {
  // Gibt es die Anmeldung schon nicht mehr – ein zweiter Versuch nach einem
  // Abbruch –, ist das kein Fehler, sondern das Ziel.
  let anmeldung = false;
  try {
    await auth().deleteUser(uid);
    anmeldung = true;
  } catch (fehler) {
    if (fehler?.code !== "auth/user-not-found") throw fehler;
  }

  const kontoRef = db().collection("users").doc(uid);
  const level = await unterkollektionLeeren(kontoRef.collection("levelProgress"));
  const sitzungen = await unterkollektionLeeren(kontoRef.collection("sessions"));
  const mails = await unterkollektionLeeren(db().collection("mails").where("uid", "==", uid));

  const stapel = db().batch();
  stapel.delete(kontoRef);
  stapel.delete(db().collection("entitlements").doc(uid));
  await stapel.commit();

  return { uid, anmeldung, level, sitzungen, mails };
}
