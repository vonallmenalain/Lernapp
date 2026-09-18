/*
 * Ein Elternkonto löscht eines seiner Kinderprofile.
 * ---------------------------------------------------------------------------
 *   POST /api/kind-loeschen   { uid }   mit Bearer-Token der Eltern
 *   → { uid, geloescht: { level, sitzungen } }
 *
 * Das Gegenstück zu kind-anlegen.mjs, und es muss dasselbe rückwärts tun:
 * das Auth-Konto, das Kontodokument samt Unterkollektionen, der Kaufeintrag
 * und der Eintrag in children[] der Eltern. Bliebe eines davon stehen, wäre
 * der Name für immer belegt (Auth), stünde ein Zug ohne Kind in der
 * Familiengruppe (users) oder zählte ein Kind mit, das es nicht mehr gibt
 * (children[], und damit die Grenze von vier).
 *
 * Warum der Server: Ein Kind löscht sein Konto selbst (firestore.rules,
 * allow delete: if isOwner) – aber die Eltern können sich nicht als ihr Kind
 * anmelden, und das Auth-Konto löscht ohnehin nur das Admin-SDK. Geprüft wird
 * am Token und an children[] der Eltern: Die Liste am Elternkonto ist die
 * Wahrheit, nicht parentUid am Kind. Dieselbe Prüfung wie bei kind-passwort.
 *
 * Reihenfolge: ERST die Anmeldung, dann die Daten. Das ist die einzige, die
 * einen Abbruch mittendrin übersteht, und der Grund dafür ist children[]:
 *
 *   Daten zuerst – das Kind ist schon aus children[] gestrichen, und dann
 *   scheitert auth().deleteUser(). Ein zweiter Versuch prallt an der Prüfung
 *   "gehört dieses Kind zu dir?" ab, denn es steht nicht mehr in der Liste.
 *   Die Anmeldung bleibt bestehen; meldet sich das Kind an, legt der Client
 *   sein Kontodokument neu an – ohne parentUid, denn die darf er nicht
 *   schreiben. Damit ist aus dem Kind ein Konto ohne Eltern geworden, und
 *   das gilt in entitlement.js als "Gründer": dauerhaft frei. Der Name bleibt
 *   obendrein belegt.
 *
 *   Anmeldung zuerst – scheitert danach das Aufräumen, steht das Kind noch in
 *   children[], und derselbe Knopf räumt beim nächsten Tippen zu Ende auf.
 *   Anmelden kann sich in der Zwischenzeit niemand mehr.
 *
 * Deshalb erst löschen, was den Weg zurück versperrt, und dann aufräumen.
 */

import { auth, db, FieldValue } from "./_lib/firebase.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, liesJson, elternAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { kinderVon } from "./_lib/familie.mjs";
import { unterkollektionLeeren } from "./_lib/konto.mjs";

export async function kindLoeschen({ eltern, uid }) {
  if (typeof uid !== "string" || !uid) throw new AnfrageFehler(400, "missing-uid", "Welches Kind?");
  if (uid === eltern.uid) throw new AnfrageFehler(400, "not-your-child", "Das eigene Konto löschst du nicht hier.");
  const elternRef = db().collection("users").doc(eltern.uid);
  const kinder = kinderVon((await elternRef.get()).data());
  const kind = kinder.find((eintrag) => eintrag.uid === uid);
  if (!kind) throw new AnfrageFehler(403, "not-your-child", "Dieses Kind gehört nicht zu deinem Konto.");

  // Zuerst die Anmeldung: Ab hier kommt niemand mehr in dieses Konto, und
  // der Name ist wieder frei. Gibt es sie schon nicht mehr – ein zweiter
  // Versuch nach einem Abbruch –, ist das kein Fehler, sondern das Ziel.
  try {
    await auth().deleteUser(uid);
  } catch (fehler) {
    if (fehler?.code !== "auth/user-not-found") throw fehler;
  }

  const kindRef = db().collection("users").doc(uid);
  const level = await unterkollektionLeeren(kindRef.collection("levelProgress"));
  const sitzungen = await unterkollektionLeeren(kindRef.collection("sessions"));

  // children[] wird gelesen und gefiltert zurückgeschrieben, nicht mit
  // arrayRemove bearbeitet: Der Eintrag steht dort in zwei Formen – als blosse
  // Kennung (alte Konten) und als {uid, name} –, und arrayRemove trifft nur,
  // was Feld für Feld gleich ist. In einer Transaktion, damit zwei Löschungen
  // zugleich sich nicht gegenseitig überschreiben.
  await db().runTransaction(async (transaktion) => {
    const elternDoc = await transaktion.get(elternRef);
    const roh = Array.isArray(elternDoc.data()?.children) ? elternDoc.data().children : [];
    const bleiben = roh.filter((eintrag) => (typeof eintrag === "string" ? eintrag : eintrag?.uid) !== uid);
    transaktion.delete(kindRef);
    transaktion.delete(db().collection("entitlements").doc(uid));
    transaktion.set(elternRef, { children: bleiben, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });

  return { uid, name: kind.name, geloescht: { level, sitzungen } };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const eltern = await elternAnrufer(request);
    const { uid } = await liesJson(request);
    return antwort(await kindLoeschen({ eltern, uid }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/kind-loeschen" };
