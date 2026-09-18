/*
 * Ein Elternkonto setzt das Passwort eines seiner Kinder neu.
 * ---------------------------------------------------------------------------
 *   POST /api/kind-passwort   { uid, passwort }   mit Bearer-Token der Eltern
 *
 * Kinder haben keine Mailadresse, "Passwort vergessen" gibt es für sie nicht.
 * Dafür die Eltern: Das Kind muss in ihrer Kinderliste stehen – nicht nur
 * parentUid am Kind sagen, es gehöre dazu, denn das steht am Konto des
 * Kindes, und die Liste am Konto der Eltern ist die Wahrheit.
 */

import { auth, db } from "./_lib/firebase.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, liesJson, elternAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { kindPasswort, MIN_KIND_PASSWORT } from "./_lib/kind.mjs";
import { kinderVon } from "./_lib/familie.mjs";

export async function kindPasswortSetzen({ eltern, uid, passwort }) {
  const pw = kindPasswort(passwort);
  if (!pw) throw new AnfrageFehler(400, "short-password", `Das Passwort muss mindestens ${MIN_KIND_PASSWORT} Zeichen haben.`);
  const elternDoc = await db().collection("users").doc(eltern.uid).get();
  const meins = kinderVon(elternDoc.data()).some((kind) => kind.uid === uid);
  if (!meins) throw new AnfrageFehler(403, "not-your-child", "Dieses Kind gehört nicht zu deinem Konto.");
  await auth().updateUser(uid, { password: pw });
  return { ok: true };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const eltern = await elternAnrufer(request);
    const { uid, passwort } = await liesJson(request);
    if (typeof uid !== "string" || !uid) throw new AnfrageFehler(400, "missing-uid", "Welches Kind?");
    return antwort(await kindPasswortSetzen({ eltern, uid, passwort }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/kind-passwort" };
