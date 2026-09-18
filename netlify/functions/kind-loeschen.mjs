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
 * Reihenfolge: erst die Daten, dann das Auth-Konto. Bricht es unterwegs ab,
 * ist ein Kind ohne Daten übrig, das sich noch anmelden kann – unschön, aber
 * harmlos. Andersherum bliebe ein Konto ohne Anmeldung mit allen Daten stehen,
 * und niemand käme mehr heran, um sie wegzuräumen.
 */

import { auth, db, FieldValue } from "./_lib/firebase.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, liesJson, elternAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { kinderVon } from "./_lib/familie.mjs";

// Firestore löscht keine Kollektion, nur Dokumente – und ein Stapel fasst 500.
// Vierzig Level mal acht Spiele plus Sitzungen kommen da durchaus hin.
async function unterkollektionLeeren(ref) {
  const schnappschuss = await ref.get();
  const docs = schnappschuss.docs;
  for (let von = 0; von < docs.length; von += 400) {
    const stapel = db().batch();
    docs.slice(von, von + 400).forEach((doc) => stapel.delete(doc.ref));
    await stapel.commit();
  }
  return docs.length;
}

export async function kindLoeschen({ eltern, uid }) {
  if (typeof uid !== "string" || !uid) throw new AnfrageFehler(400, "missing-uid", "Welches Kind?");
  if (uid === eltern.uid) throw new AnfrageFehler(400, "not-your-child", "Das eigene Konto löschst du nicht hier.");
  const elternRef = db().collection("users").doc(eltern.uid);
  const kinder = kinderVon((await elternRef.get()).data());
  const kind = kinder.find((eintrag) => eintrag.uid === uid);
  if (!kind) throw new AnfrageFehler(403, "not-your-child", "Dieses Kind gehört nicht zu deinem Konto.");

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

  // Zum Schluss die Anmeldung. Gibt es sie nicht mehr, ist das kein Fehler:
  // Das Ziel ist erreicht.
  try {
    await auth().deleteUser(uid);
  } catch (fehler) {
    if (fehler?.code !== "auth/user-not-found") throw fehler;
  }

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
