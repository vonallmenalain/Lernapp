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
 * Zwei Dinge macht diese Funktion, die der Client nicht könnte:
 *
 *   1. Sie verschickt über Resend, mit kids@alae.app als Absender. Der
 *      Schlüssel dafür darf nicht in den Browser.
 *   2. Sie rechnet den Bestätigungslink selbst aus
 *      (generateEmailVerificationLink im Admin-SDK). Es ist derselbe Link,
 *      den Firebase in seine Mail gesetzt hätte – nur steht er jetzt in
 *      unserer. Firebase verschickt dabei nichts; es gibt nur die Adresse
 *      zurück.
 *
 * Bestätigen MUSS niemand: Kein Teil der App fragt danach – ausser dem
 * Adminbereich, und der ist eine Adresse, keine Familie. Der Link ist ein
 * Angebot, kein Tor.
 *
 * Die Mail geht genau einmal je Konto raus. Dafür sorgt die feste Kennung im
 * Archiv ("willkommen-<uid>"): Ein zweiter Anruf – der Client versucht es
 * beim Anlegen und noch einmal bei der ersten Google-Anmeldung – sieht, dass
 * sie schon draussen ist, und schweigt.
 */

import { auth } from "./_lib/firebase.mjs";
import { antwort, fehlerAntwort, elternAnrufer, nurMethode } from "./_lib/anfrage.mjs";
import { sendeMail } from "./_lib/mail.mjs";
import { willkommenMail, SEITE } from "./_lib/mail-vorlagen.mjs";

// Der Link, den Firebase sonst selbst verschickt hätte. Wohin es nach dem
// Klick weitergeht, steht in actionCodeSettings – und diese Adresse muss
// unter Authentication → Settings → Authorized domains stehen. Tut sie es
// nicht, lehnt Firebase ab; dann lieber ein Link ohne Rücksprung als gar
// keine Mail.
async function bestaetigungsLink(email) {
  try {
    return await auth().generateEmailVerificationLink(email, { url: `${SEITE}/index.html`, handleCodeInApp: false });
  } catch (fehler) {
    try {
      return await auth().generateEmailVerificationLink(email);
    } catch {
      console.warn("Bestätigungslink nicht erzeugbar:", fehler?.message || fehler);
      return "";
    }
  }
}

export async function willkommenSchicken({ uid, email, bestaetigt = false }) {
  if (!email) return { gesendet: false, grund: "keine Adresse" };
  // Wer über Google kommt, hat seine Adresse bei Google bewiesen – dem noch
  // einen Bestätigungslink hinzuhalten wäre eine Frage, die schon beantwortet
  // ist.
  const link = bestaetigt ? "" : await bestaetigungsLink(email);
  const vorlage = willkommenMail({ email, bestaetigungsLink: link });
  const ergebnis = await sendeMail({
    an: email,
    betreff: vorlage.betreff,
    html: vorlage.html,
    text: vorlage.text,
    art: "willkommen",
    id: `willkommen-${uid}`,
    uid,
  });
  return { ...ergebnis, bestaetigung: Boolean(link) };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const wer = await elternAnrufer(request);
    const nutzer = await auth().getUser(wer.uid).catch(() => null);
    const ergebnis = await willkommenSchicken({
      uid: wer.uid,
      email: wer.email || nutzer?.email || "",
      bestaetigt: Boolean(nutzer?.emailVerified),
    });
    return antwort(ergebnis);
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/willkommen" };
