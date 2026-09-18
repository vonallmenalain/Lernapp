/*
 * Ein Elternkonto legt ein Kinderprofil an.
 * ---------------------------------------------------------------------------
 *   POST /api/kind-anlegen   { name, passwort }   mit Bearer-Token der Eltern
 *
 * Der Server tut, was der Client nicht darf: Er legt den Firebase-Auth-Nutzer
 * mit der technischen Adresse an, schreibt das Kontodokument mit parentUid,
 * trägt das Kind in children[] der Eltern ein – und wenn die Eltern schon
 * gekauft haben, bekommt das Kind den Kauf gleich mit. Alles über das
 * Admin-SDK, an firestore.rules vorbei; genau deshalb prüfen die Regeln, dass
 * ein Client diese Felder nie selbst schreibt.
 *
 * Höchstens MAX_KINDER je Elternkonto – gezählt in einer Transaktion, damit
 * zwei gleichzeitige Anfragen nicht beide den letzten Platz bekommen. Der
 * Name ist die Adresse: Zwei Kinder mit demselben Namen gibt es nicht – auch
 * nicht bei zwei Familien. Das ist eine Grenze der Anmeldung mit Name statt
 * Adresse; die Meldung sagt es.
 *
 * Erst das Auth-Konto, dann Firestore. Scheitert Firestore – der Platz ist
 * doch schon weg, ein Aussetzer –, kommt das Auth-Konto wieder weg: Sonst
 * bliebe der Name für immer belegt, ohne dass es das Kind gäbe.
 */

import { auth, db, FieldValue } from "./_lib/firebase.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, liesJson, elternAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { sauberName, technischeAdresse, kindPasswort, MAX_KINDER, MIN_KIND_PASSWORT } from "./_lib/kind.mjs";

const kinderVon = (daten) => (Array.isArray(daten?.children) ? daten.children : []);

export async function kindAnlegen({ eltern, name, passwort }) {
  const anzeigeName = sauberName(name);
  const adresse = technischeAdresse(anzeigeName);
  if (!adresse) throw new AnfrageFehler(400, "missing-name", "Bitte gib einen Namen ein.");
  const pw = kindPasswort(passwort);
  if (!pw) throw new AnfrageFehler(400, "short-password", `Das Passwort muss mindestens ${MIN_KIND_PASSWORT} Zeichen haben.`);

  const elternRef = db().collection("users").doc(eltern.uid);
  const voll = () => new AnfrageFehler(409, "too-many-children", `Bis zu ${MAX_KINDER} Kinder je Elternkonto.`);
  // Ein erster Blick, bevor ein Auth-Konto entsteht: Wer schon voll ist,
  // bekommt die Absage ohne Umweg. Verbindlich zählt die Transaktion unten.
  if (kinderVon((await elternRef.get()).data()).length >= MAX_KINDER) throw voll();

  let nutzer;
  try {
    nutzer = await auth().createUser({ email: adresse, password: pw, displayName: anzeigeName });
  } catch (fehler) {
    if (fehler?.code === "auth/email-already-exists") {
      throw new AnfrageFehler(409, "name-taken", "Diesen Namen gibt es schon. Nimm einen anderen, zum Beispiel mit Nachnamen oder Zahl.");
    }
    throw fehler;
  }

  try {
    const kauf = await db().runTransaction(async (transaktion) => {
      const elternDoc = await transaktion.get(elternRef);
      if (kinderVon(elternDoc.data()).length >= MAX_KINDER) throw voll();
      const kaufDoc = await transaktion.get(db().collection("entitlements").doc(eltern.uid));
      const gekauft = Boolean(kaufDoc.exists && kaufDoc.data()?.active);
      const jetzt = FieldValue.serverTimestamp();
      transaktion.set(db().collection("users").doc(nutzer.uid), {
        authEmail: adresse,
        email: null,
        username: anzeigeName,
        displayName: anzeigeName,
        role: "child",
        parentUid: eltern.uid,
        loginMethod: "name-password",
        providers: ["password"],
        localPersistence: true,
        createdAt: jetzt,
        updatedAt: jetzt,
        lastSeenAt: jetzt,
        stats: { totalSeconds: 0, moves: 0, resets: 0, solvedLevels: 0, sessions: 0 },
      });
      transaktion.set(elternRef, {
        children: FieldValue.arrayUnion({ uid: nutzer.uid, name: anzeigeName }),
        updatedAt: jetzt,
      }, { merge: true });
      if (gekauft) {
        transaktion.set(db().collection("entitlements").doc(nutzer.uid), {
          ...kaufDoc.data(),
          via: eltern.uid,
          grantedAtMs: Date.now(),
          grantedAt: jetzt,
        });
      }
      return gekauft;
    });
    return { uid: nutzer.uid, name: anzeigeName, loginName: anzeigeName, kauf };
  } catch (fehler) {
    // Ohne Kontodokument gibt es das Kind nicht – dann darf auch der Name
    // nicht belegt bleiben. Klappt das Aufräumen nicht, meldet der nächste
    // Versuch "name-taken"; das ist die Ausnahme von der Ausnahme.
    try { await auth().deleteUser(nutzer.uid); } catch { /* siehe oben */ }
    throw fehler;
  }
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const eltern = await elternAnrufer(request);
    const { name, passwort } = await liesJson(request);
    return antwort(await kindAnlegen({ eltern, name, passwort }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/kind-anlegen" };
