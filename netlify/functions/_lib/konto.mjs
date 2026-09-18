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
 * dort steht sie ausführlich. Kurz: Was danach liegen bleibt, räumt derselbe
 * Knopf beim nächsten Tippen zu Ende auf.
 *
 * Was das Löschen NICHT sofort tut: ein ID-Token entwerten, das schon in
 * einem offenen Browser liegt. Ein solches Token ist ein JWT und gilt eine
 * Stunde; Firebase prüft beim Ausstellen, nicht beim Benutzen. Zwei Dinge
 * folgen daraus, und beide sind hier berücksichtigt:
 *
 *   Am Server  verifyIdToken prüft auf Widerruf (_lib/anfrage.mjs,
 *              checkRevoked). Damit ist ab dem Löschen Schluss – kein
 *              Kinderanlegen, kein Gang zur Kasse, keine Mail.
 *   In Firestore  bleibt das alte Token gültig, bis es abläuft. Die Regeln
 *              kennen nur den Inhalt des Tokens, nicht den Stand der
 *              Benutzerliste; und eine Regel, die auf das Kontodokument
 *              prüfte, machte das Anlegen eines Kontos unmöglich – dann gibt
 *              es das Dokument ja noch nicht. Ein offener Browser kann also
 *              bis zu einer Stunde lang seinen eigenen Fortschritt
 *              zurückschreiben. Er taucht dann wieder in der Kontenliste auf,
 *              ohne Anmeldung und ohne Kauf; derselbe Knopf räumt ihn weg.
 *
 * revokeRefreshTokens vor dem Löschen sorgt dafür, dass sich daraus kein
 * neues Token mehr ergibt, auch wenn das Löschen danach abbricht.
 */

import { auth, db } from "./firebase.mjs";

// Wer gelöscht wurde, bleibt gelöscht – auch wenn Stripe Tage später ein
// Ereignis wiederholt. Ohne diese Marke legte kaufVerbuchen den Kaufeintrag
// neu an (die Prüfung "schon verbucht" hängt an genau dem Eintrag, den das
// Löschen entfernt hat) und schickte eine Bestellbestätigung an eine Adresse,
// deren Konto es nicht mehr gibt.
//
// Die Marke bleibt für immer stehen. Sie ist ein Dokument mit drei Feldern,
// und Firebase vergibt eine uid nie zweimal.
export const GRABSTEIN = "geloeschteKonten";

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
//
// adresse: die Anmeldeadresse, VOR dem Löschen gelesen. Sie wird für die
// Mails gebraucht – und danach gibt es sie nicht mehr zu lesen.
export async function kontoTilgen(uid, adresse = "") {
  // Erst die Ausweise entwerten, dann die Anmeldung. Bricht es dazwischen ab,
  // ist wenigstens kein neues Token mehr zu holen.
  try { await auth().revokeRefreshTokens(uid); } catch { /* gibt es schon nicht mehr */ }

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

  // Zweimal nach Mails suchen, und das hat einen Grund: Die meisten tragen
  // die Kennung des Kontos, die Mail zum Zurücksetzen des Passworts aber
  // nicht – sie geht an jemanden, der gerade NICHT angemeldet ist, und der
  // Server kennt dort nur die Adresse (passwort-mail.mjs).
  //
  // Gesucht wird nur nach dem Empfänger, nicht nach dem Absender: Post AN
  // kids@alae.app ist Korrespondenz und gehört nicht diesem Konto, auch wenn
  // sie von derselben Adresse kam.
  let mails = await unterkollektionLeeren(db().collection("mails").where("uid", "==", uid));
  if (adresse) mails += await unterkollektionLeeren(db().collection("mails").where("an", "==", adresse));

  const stapel = db().batch();
  stapel.delete(kontoRef);
  stapel.delete(db().collection("entitlements").doc(uid));
  // Und der Grabstein, der bleibt.
  stapel.set(db().collection(GRABSTEIN).doc(uid), {
    zeitMs: Date.now(),
    adresse: adresse || null,
  });
  await stapel.commit();

  return { uid, anmeldung, level, sitzungen, mails };
}

// Steht dieses Konto auf dem Friedhof? Der Stripe-Webhook fragt danach,
// bevor er einen Kauf verbucht.
export async function istGeloescht(uid) {
  try {
    return (await db().collection(GRABSTEIN).doc(uid).get()).exists;
  } catch {
    // Nicht nachsehen zu können ist kein Grund, einen Kauf zu verwerfen.
    return false;
  }
}
