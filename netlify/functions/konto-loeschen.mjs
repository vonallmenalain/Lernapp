/*
 * Der Administrator entfernt ein Konto restlos – Anmeldung eingeschlossen.
 * ---------------------------------------------------------------------------
 *   POST /api/konto-loeschen   { uid, auchKinder }   mit Bearer-Token des Admins
 *   → { geloescht: [{uid, name, rolle}], konten, level, sitzungen, mails }
 *
 * Wozu: Ein Testkonto wegräumen. In der Firebase-Console geht das nur halb –
 * wer dort users/{uid} löscht, löscht das Profil, nicht die Anmeldung. Die
 * Adresse bleibt belegt, und beim nächsten Registrieren steht da "diese
 * Adresse hat schon ein Konto". Was wo liegt, steht in _lib/konto.mjs.
 *
 * Drei Schranken, und jede hat ihren Grund:
 *
 *   Kein Admin-Konto. Wer sein eigenes löscht, sperrt sich aus dem
 *   Adminbereich aus – und niemand könnte ihn wieder hereinlassen, denn der
 *   Zugang hängt an der Adresse (firestore.rules, isAdmin).
 *
 *   Ein Elternkonto mit Kindern nur mit auchKinder. Sonst blieben die Kinder
 *   als Konten ohne Eltern zurück: Die zählen in entitlement.js als "Gründer"
 *   und wären damit dauerhaft frei – aus einem Aufräumen würde ein Geschenk.
 *   Der Adminbereich fragt deshalb mit der Zahl der Kinder nach.
 *
 *   Und nichts davon geht ohne Admin-Token. Geprüft wird das hier, nicht in
 *   den Regeln: Löschen tut das Admin-SDK, und das steht über den Regeln.
 *
 * Gelöscht wird Konto für Konto, Kinder zuerst. Bricht es mittendrin ab,
 * bleibt ein Rest stehen, den derselbe Knopf beim nächsten Tippen zu Ende
 * räumt – das Elternkonto ist dann noch da und führt die übrigen Kinder.
 */

import { auth, db, FieldValue } from "./_lib/firebase.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, liesJson, adminAnrufer, nurMethode, istAdminAdresse } from "./_lib/anfrage.mjs";
import { kinderVon } from "./_lib/familie.mjs";
import { kontoTilgen } from "./_lib/konto.mjs";

async function adresseVon(uid) {
  const nutzer = await auth().getUser(uid).catch(() => null);
  return String(nutzer?.email || "").toLowerCase();
}

export async function kontoLoeschen({ admin, uid, auchKinder = false }) {
  if (typeof uid !== "string" || !uid) throw new AnfrageFehler(400, "missing-uid", "Welches Konto?");
  if (uid === admin.uid) throw new AnfrageFehler(400, "not-yourself", "Dein eigenes Konto löschst du nicht hier.");

  const doc = await db().collection("users").doc(uid).get();
  const daten = doc.data() || {};
  const adresse = await adresseVon(uid);
  if (!doc.exists && !adresse) throw new AnfrageFehler(404, "no-account", "Dieses Konto gibt es nicht (mehr).");
  if (istAdminAdresse(adresse)) throw new AnfrageFehler(403, "admin-account", "Ein Admin-Konto wird hier nicht gelöscht.");

  const kinder = kinderVon(daten);
  if (kinder.length && !auchKinder) {
    throw new AnfrageFehler(409, "has-children", `Dieses Elternkonto führt ${kinder.length} ${kinder.length === 1 ? "Kind" : "Kinder"}. Ohne sie geht es nicht.`);
  }

  // Kinder zuerst: Bricht es danach ab, steht das Elternkonto noch da und
  // führt den Rest – ein zweiter Anlauf räumt zu Ende auf.
  const reihe = [...kinder.map((kind) => ({ uid: kind.uid, name: kind.name, rolle: "kind" })),
                 { uid, name: daten.username || daten.displayName || adresse || uid, rolle: kinder.length ? "eltern" : (daten.parentUid ? "kind" : "eltern") }];

  const geloescht = [];
  const summe = { level: 0, sitzungen: 0, mails: 0 };
  for (const eintrag of reihe) {
    const ergebnis = await kontoTilgen(eintrag.uid);
    summe.level += ergebnis.level;
    summe.sitzungen += ergebnis.sitzungen;
    summe.mails += ergebnis.mails;
    geloescht.push({ ...eintrag, anmeldung: ergebnis.anmeldung });
  }

  // War es ein Kind, steht es noch in children[] seiner Eltern. Gelesen und
  // gefiltert zurückgeschrieben, nicht mit arrayRemove: Der Eintrag steht
  // dort in zwei Formen – als blosse Kennung (alte Konten) und als
  // {uid, name} –, und arrayRemove trifft nur, was Feld für Feld gleich ist.
  const elternUid = typeof daten.parentUid === "string" ? daten.parentUid : "";
  if (elternUid) {
    const elternRef = db().collection("users").doc(elternUid);
    await db().runTransaction(async (transaktion) => {
      const elternDoc = await transaktion.get(elternRef);
      if (!elternDoc.exists) return;
      const roh = Array.isArray(elternDoc.data()?.children) ? elternDoc.data().children : [];
      const bleiben = roh.filter((eintrag) => (typeof eintrag === "string" ? eintrag : eintrag?.uid) !== uid);
      if (bleiben.length === roh.length) return;
      transaktion.set(elternRef, { children: bleiben, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    });
  }

  return { geloescht, konten: geloescht.length, ...summe };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const admin = await adminAnrufer(request);
    const { uid, auchKinder } = await liesJson(request);
    return antwort(await kontoLoeschen({ admin, uid, auchKinder: auchKinder === true }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/konto-loeschen" };
