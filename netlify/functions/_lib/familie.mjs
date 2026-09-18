/*
 * Die Familie als Gruppe: Geschwister sehen die Züge der anderen.
 * ---------------------------------------------------------------------------
 * Auf dem Startbild stehen die Züge aller, die dieselbe group.id tragen –
 * das gab es schon für Schulklassen, die der Admin zusammenstellt. Eine
 * Familie soll das ohne Zutun haben: Wer zu einem Elternkonto gehört, gehört
 * zu dessen Gruppe.
 *
 * Die Kennung ist die uid der Eltern, nicht ihr Name: Zwei Familien Müller
 * bekämen sonst dieselbe Gruppe und sähen gegenseitig ihre Kinder.
 *
 * Geschrieben wird das hier, nicht im Client: firestore.rules lässt group
 * niemanden am eigenen Konto ändern (ownerMayNotTouch) – sonst schriebe sich
 * jedes Kind in jede Gruppe. Der Server darf es, weil er am Token sieht, wer
 * zu wem gehört.
 *
 * familieVerbinden räumt jedes Mal die ganze Familie auf, nicht nur das neue
 * Kind: Konten aus der Zeit vor dieser Datei haben noch keine Gruppe, und
 * niemand soll dafür etwas von Hand tun müssen.
 */

import { db, FieldValue } from "./firebase.mjs";
import { sauberName } from "./kind.mjs";

export const gruppenId = (elternUid) => `familie-${elternUid}`;

export function kinderVon(daten) {
  const liste = Array.isArray(daten?.children) ? daten.children : [];
  return liste
    .map((kind) => (typeof kind === "string" ? { uid: kind, name: "" } : { uid: kind?.uid, name: sauberName(kind?.name) }))
    .filter((kind) => typeof kind.uid === "string" && kind.uid);
}

function gruppeFuer(elternUid, elternDaten, anzeigeName) {
  return {
    id: gruppenId(elternUid),
    name: sauberName(elternDaten?.username || elternDaten?.displayName) || "Familie",
    displayName: anzeigeName || "",
    updatedAt: Date.now(),
  };
}

// Setzt die Gruppe bei allen Kindern eines Elternkontos. Gibt zurück, wie
// viele es sind und ob sich etwas geändert hat – der Aufrufer sagt dem
// Client damit, ob er sein Startbild neu laden soll.
export async function familieVerbinden(elternUid) {
  const elternRef = db().collection("users").doc(elternUid);
  const elternDoc = await elternRef.get();
  const kinder = kinderVon(elternDoc.data());
  if (!kinder.length) return { id: null, kinder: 0, geaendert: 0 };

  const id = gruppenId(elternUid);
  const stapel = db().batch();
  let geaendert = 0;

  for (const kind of kinder) {
    const ref = db().collection("users").doc(kind.uid);
    const doc = await ref.get();
    if (!doc.exists) continue;
    const daten = doc.data() || {};
    const anzeige = sauberName(daten.username || daten.displayName) || kind.name;
    if (daten.group?.id === id && daten.group?.displayName === anzeige) continue;
    stapel.set(ref, { group: gruppeFuer(elternUid, elternDoc.data(), anzeige), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    geaendert += 1;
  }

  if (geaendert) await stapel.commit();
  return { id, kinder: kinder.length, geaendert };
}

// Zu welcher Familie gehört, wer gerade anruft? Eltern zu ihrer eigenen, ein
// Kind zu der seiner Eltern. Wer zu keiner gehört (ein Gründer-Kind ohne
// Elternkonto, der Admin), bekommt null – und keine Gruppe.
export async function familieVon(wer) {
  if (wer.istEltern) return wer.uid;
  const doc = await db().collection("users").doc(wer.uid).get();
  const parentUid = doc.data()?.parentUid;
  return typeof parentUid === "string" && parentUid ? parentUid : null;
}
