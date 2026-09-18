/*
 * Ein Elternkonto legt ein Kinderprofil an.
 * ---------------------------------------------------------------------------
 *   POST /api/kind-anlegen   { name, passwort, stufe }   mit Bearer-Token der Eltern
 *
 * Der Server tut, was der Client nicht darf: Er legt den Firebase-Auth-Nutzer
 * mit der technischen Adresse an, schreibt das Kontodokument mit parentUid,
 * trägt das Kind in children[] der Eltern ein – und wenn die Eltern schon
 * gekauft haben, bekommt das Kind den Kauf gleich mit. Ebenso das Wagen-Set
 * der Familie, falls die Eltern eines gewählt haben: Sonst führe das jüngste
 * Kind als einziges einen anderen Zug als seine Geschwister. Alles über das
 * Admin-SDK, an firestore.rules vorbei; genau deshalb prüfen die Regeln, dass
 * ein Client diese Felder nie selbst schreibt.
 *
 * stufe ist die Altersgruppe, die die Eltern beim Anlegen wählen – "leicht"
 * (3 bis 5), "mittel" (5 bis 7) oder "schwer" (7 bis 10). Sie wird zur
 * Schwierigkeitsstufe des Kindes und liegt dort, wo journey-plan.js sie
 * liest: im Kasten der Reise (gameState "lernapp.reise"), mit Zeitmarke, damit
 * beim Zusammenführen die neuere Einstellung gewinnt. Fehlt sie oder ist sie
 * unbekannt, gilt die Mitte – nichts, was ein Kind bestrafte.
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
import { gruppenId, familieVerbinden, kinderVon } from "./_lib/familie.mjs";

export const STUFEN = ["leicht", "mittel", "schwer"];
export const STUFE_DEFAULT = "mittel";
export const REISE_KASTEN = "lernapp.reise";

export async function kindAnlegen({ eltern, name, passwort, stufe }) {
  const anzeigeName = sauberName(name);
  const stufeWert = STUFEN.includes(stufe) ? stufe : STUFE_DEFAULT;
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
      // Das Wagen-Set der Familie, falls die Eltern eines gewählt haben. Es
      // steht an jedem Konto der Familie einzeln (firebase.js,
      // switchFamilyWagonSet), weil ein Kind das Konto seiner Eltern nicht
      // liest – ein Feld, das es nicht lesen darf, könnte es nicht befolgen.
      const familienSet = elternDoc.data()?.wagonSet?.id ? { wagonSet: elternDoc.data().wagonSet } : {};
      transaktion.set(db().collection("users").doc(nutzer.uid), {
        authEmail: adresse,
        email: null,
        username: anzeigeName,
        displayName: anzeigeName,
        role: "child",
        parentUid: eltern.uid,
        // Die Familie ist eine Gruppe: So stehen die Züge der Geschwister
        // auf dem Startbild nebeneinander (siehe _lib/familie.mjs).
        group: { id: gruppenId(eltern.uid), name: sauberName(elternDoc.data()?.username) || "Familie", displayName: anzeigeName, updatedAt: Date.now() },
        loginMethod: "name-password",
        providers: ["password"],
        localPersistence: true,
        createdAt: jetzt,
        updatedAt: jetzt,
        lastSeenAt: jetzt,
        stats: { totalSeconds: 0, moves: 0, resets: 0, solvedLevels: 0, sessions: 0 },
        // Die Schwierigkeitsstufe, in der Form, in der das Gerät des Kindes
        // sie aus der Cloud liest (game-cloud.js: data + updatedAt).
        gameState: { [REISE_KASTEN]: { data: { stufe: stufeWert, stufeAt: Date.now() }, updatedAt: Date.now() } },
        ...familienSet,
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
    // Und die Geschwister, die es schon gab, bekommen dieselbe Gruppe –
    // Konten aus der Zeit vor der Familiengruppe haben noch keine. Das darf
    // scheitern, ohne das Kind zu verlieren: Es ist angelegt, die Gruppe holt
    // /api/familie beim nächsten Anmelden nach.
    try { await familieVerbinden(eltern.uid); } catch (fehler) { console.error("Familie verbinden:", fehler); }

    return { uid: nutzer.uid, name: anzeigeName, loginName: anzeigeName, kauf, stufe: stufeWert };
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
    const { name, passwort, stufe } = await liesJson(request);
    return antwort(await kindAnlegen({ eltern, name, passwort, stufe }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/kind-anlegen" };
