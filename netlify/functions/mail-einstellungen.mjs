/*
 * Der Reiter E-Mail im Adminbereich, von der Serverseite.
 * ---------------------------------------------------------------------------
 *   POST /api/mail-einstellungen   { aktion }   mit Bearer-Token des Admins
 *
 *   aktion "lesen"      → der aktuelle Stand
 *   aktion "speichern"  → { weiterleitungAn, weiterleitungAktiv } setzen
 *   aktion "test"       → eine Testmail an die Weiterleitungsadresse
 *
 * Gelesen werden die Einstellungen auch direkt aus Firestore (der Admin darf
 * das, firestore.rules) – geschrieben aber nicht: Eine Adresse, an die alle
 * Post geht, soll geprüft sein, bevor sie dasteht, und geprüft wird auf dem
 * Server. Eine krumme Adresse im Feld hiesse sonst: Post kommt an, Post geht
 * nirgends hin, und niemand merkt es.
 *
 * Die Testmail ist der Grund, warum es "test" gibt: Ob Schlüssel, Domain und
 * Absender zusammenpassen, weiss man erst, wenn eine Mail angekommen ist.
 */

import { antwort, fehlerAntwort, liesJson, adminAnrufer, nurMethode, AnfrageFehler } from "./_lib/anfrage.mjs";
import { einstellungen, speichereEinstellungen, sendeMail, mailBereit, istAdresse, ABSENDER_ADRESSE } from "./_lib/mail.mjs";
import { testMail } from "./_lib/mail-vorlagen.mjs";

async function stand() {
  const werte = await einstellungen();
  return { ...werte, absender: ABSENDER_ADRESSE(), bereit: mailBereit(), eingangBereit: Boolean(process.env.MAIL_WEBHOOK_SECRET) };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const admin = await adminAnrufer(request);
    const { aktion = "lesen", weiterleitungAn, weiterleitungAktiv } = await liesJson(request);

    if (aktion === "speichern") {
      const gespeichert = await speichereEinstellungen({ weiterleitungAn, weiterleitungAktiv, von: admin.email });
      if (!gespeichert.ok) throw new AnfrageFehler(400, "bad-address", "Das ist keine gültige E-Mail-Adresse.");
      return antwort(await stand());
    }

    if (aktion === "test") {
      const werte = await einstellungen();
      const ziel = istAdresse(weiterleitungAn) ? weiterleitungAn : werte.weiterleitungAn;
      if (!mailBereit()) throw new AnfrageFehler(503, "no-key", "RESEND_API_KEY fehlt – es kann nichts verschickt werden.");
      const vorlage = testMail({ an: ziel });
      const ergebnis = await sendeMail({
        an: ziel,
        betreff: vorlage.betreff,
        html: vorlage.html,
        text: vorlage.text,
        art: "test",
        meta: { ausgeloestVon: admin.email },
      });
      if (!ergebnis.gesendet) throw new AnfrageFehler(502, "send-failed", ergebnis.grund || "Die Testmail ging nicht raus.");
      return antwort({ ...(await stand()), test: ergebnis });
    }

    return antwort(await stand());
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/mail-einstellungen" };
