/*
 * Die Begrüssung für ein neues Elternkonto.
 * ---------------------------------------------------------------------------
 *   POST /api/willkommen   { }   mit Bearer-Token des Elternkontos
 *   → { gesendet, bestaetigung }
 *
 * Bis hierher schickte Firebase von selbst eine Mail, sobald ein Elternkonto
 * angelegt war: "Verify your email for project-123146993935", Absender
 * noreply@lernapp-8d944.firebaseapp.com. Das ist jetzt weg (firebase.js,
 * signUpParent), und stattdessen ruft der Client hier an.
 *
 * Was diese Funktion macht, das der Client nicht könnte: Sie verschickt über
 * Resend, mit kids@alae.app als Absender. Der Schlüssel dafür darf nicht in
 * den Browser.
 *
 * Bestätigen muss niemand seine Adresse, und angeboten wird es auch nicht
 * mehr: Kein Teil der App fragt danach. Die einzige Ausnahme ist der
 * Adminbereich – er verlangt eine bestätigte Adresse (firestore.rules,
 * isAdmin), und die kommt dort von der Anmeldung über Google, wo Google sie
 * bewiesen hat. Deshalb steht hier kein generateEmailVerificationLink mehr.
 *
 * Die Mail geht genau einmal je Konto raus. Dafür sorgt die feste Kennung im
 * Archiv ("willkommen-<uid>"): Ein zweiter Anruf – der Client versucht es
 * beim Anlegen und noch einmal bei der ersten Google-Anmeldung – sieht, dass
 * sie schon draussen ist, und schweigt.
 */

import { auth } from "./_lib/firebase.mjs";
import { antwort, fehlerAntwort, elternAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { sendeMail } from "./_lib/mail.mjs";
import { willkommenMail } from "./_lib/mail-vorlagen.mjs";

export async function willkommenSchicken({ uid, email }) {
  if (!email) return { gesendet: false, grund: "keine Adresse" };
  const vorlage = willkommenMail({ email });
  return sendeMail({
    an: email,
    betreff: vorlage.betreff,
    html: vorlage.html,
    text: vorlage.text,
    art: "willkommen",
    id: `willkommen-${uid}`,
    uid,
  });
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const wer = await elternAnrufer(request);
    // Die Adresse steht im Token; nur falls dort keine ist, wird nachgefragt.
    const email = wer.email || (await auth().getUser(wer.uid).catch(() => null))?.email || "";
    return antwort(await willkommenSchicken({ uid: wer.uid, email }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/willkommen" };
