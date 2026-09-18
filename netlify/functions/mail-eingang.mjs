/*
 * Post an kids@alae.app kommt hier an.
 * ---------------------------------------------------------------------------
 *   POST /api/mail-eingang   { von, an, betreff, text, html, ... }
 *   Kopf:  x-mail-geheimnis: <MAIL_WEBHOOK_SECRET>
 *   → { ok, id, weitergeleitet }
 *
 * Wer hier anruft, ist nicht ein Browser, sondern Cloudflare: Für die Domain
 * alae.app läuft dort Email Routing, und für kids@alae.app ein kleiner Worker
 * (cloudflare/kids-mail-worker.js), der jede eintreffende Mail an diese
 * Adresse schickt. Warum der Umweg, wo Cloudflare auch direkt weiterleiten
 * kann:
 *
 *   - Die Mail landet im Archiv und damit im Adminbereich (Reiter E-Mail).
 *     Ohne das wüsste die App nichts von der Post an sie selbst.
 *   - Die Weiterleitungsadresse steht in der Datenbank und lässt sich im
 *     Adminbereich ändern. Bei Cloudflare müsste jede neue Adresse erst dort
 *     bestätigt werden.
 *
 * Weitergeleitet wird über Resend, mit Antwortadresse des ursprünglichen
 * Absenders: Ein "Antworten" im Postfach geht dann an den, der geschrieben
 * hat, nicht an uns selbst.
 *
 * In der Antwort steht "erledigt": Sie ist das Zeichen für den Worker, dass er
 * nichts mehr tun muss. Nicht der Status-Code allein – die Mail kann
 * angekommen und archiviert sein und trotzdem nirgends zugestellt, weil Resend
 * den Schlüssel ablehnt. Stünde dann 200 ohne weiteres da, hielte der Worker
 * die Sache für erledigt, liesse seine eigene Weiterleitung aus, und die Mail
 * wäre im Archiv und sonst nirgends. Deshalb: erledigt ist sie, wenn sie
 * weitergeleitet wurde – oder wenn die Weiterleitung absichtlich aus ist.
 * Sonst 502, und der Worker übernimmt.
 *
 * Das Geheimnis im Kopf ist die ganze Anmeldung – es gibt hier kein Konto und
 * keinen Anrufer. Verglichen wird es zeitunabhängig (timingSafeEqual): Ein
 * gewöhnlicher Vergleich bricht beim ersten falschen Zeichen ab und verrät
 * damit, wie viele Zeichen stimmten.
 *
 * Und: Cloudflare versucht es bei einem Fehler noch einmal. Dieselbe Mail darf
 * deshalb nicht zweimal im Archiv stehen und nicht zweimal weitergeleitet
 * werden – beides hängt an einer festen Kennung aus der Message-ID.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { antwort, fehlerAntwort, liesJson, nurMethode, AnfrageFehler } from "./_lib/anfrage.mjs";
import { archiviere, sendeMail, einstellungen, istAdresse, sauberAdresse, ABSENDER_ADRESSE } from "./_lib/mail.mjs";
import { weiterleitungsMail } from "./_lib/mail-vorlagen.mjs";

function geheimnisStimmt(request) {
  const erwartet = process.env.MAIL_WEBHOOK_SECRET || "";
  if (!erwartet) throw new AnfrageFehler(503, "no-secret", "MAIL_WEBHOOK_SECRET fehlt – der Eingang ist nicht eingerichtet.");
  const gegeben = request.headers.get("x-mail-geheimnis") || request.headers.get("x-mail-secret") || "";
  // Erst durch einen Hash, dann vergleichen: timingSafeEqual verlangt gleich
  // lange Puffer, und die Länge des Geheimnisses soll nicht die Antwort sein.
  const a = createHash("sha256").update(gegeben).digest();
  const b = createHash("sha256").update(erwartet).digest();
  return timingSafeEqual(a, b);
}

const kennung = (messageId, von, betreff) =>
  `ein-${createHash("sha256").update(String(messageId || `${von}|${betreff}|${Date.now()}`)).digest("hex").slice(0, 24)}`;

function datumText(ms) {
  if (!ms) return "";
  try {
    return new Intl.DateTimeFormat("de-CH", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Zurich" }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString();
  }
}

export async function eingangVerarbeiten(nachricht) {
  const von = sauberAdresse(nachricht.von);
  const an = sauberAdresse(nachricht.an) || ABSENDER_ADRESSE();
  const betreff = String(nachricht.betreff || "").slice(0, 400);
  const text = String(nachricht.text || "");
  const empfangenMs = Number(nachricht.empfangenAmMs) || Date.now();
  const id = kennung(nachricht.messageId, von, betreff);

  await archiviere(id, {
    richtung: "ein",
    art: "eingang",
    status: "empfangen",
    von,
    an,
    betreff,
    text,
    html: String(nachricht.html || ""),
    zeitMs: empfangenMs,
    messageId: nachricht.messageId || null,
    // Was Cloudflare über die Echtheit des Absenders sagt. Steht im
    // Adminbereich dabei: Eine Mail, die weder SPF noch DKIM besteht, ist mit
    // grosser Wahrscheinlichkeit gefälscht.
    pruefung: nachricht.pruefung || null,
    groesse: Number(nachricht.groesse) || 0,
    // Was drangehangen hat. Weitergeleitet wird von hier aus nur der Text –
    // das Original mit dem Anhang schickt der Worker zusätzlich selbst.
    anhaenge: Array.isArray(nachricht.anhaenge) ? nachricht.anhaenge.slice(0, 20).map((name) => String(name).slice(0, 200)) : [],
  });

  const stand = await einstellungen();
  if (!stand.weiterleitungAktiv || !istAdresse(stand.weiterleitungAn)) {
    // Aus ist aus: Dann soll auch der Worker nicht weiterleiten, sonst hiesse
    // der Schalter im Adminbereich nichts. Also erledigt.
    return { ok: true, id, weitergeleitet: false, erledigt: true, grund: "Weiterleitung aus" };
  }

  const anhaenge = Array.isArray(nachricht.anhaenge) ? nachricht.anhaenge : [];
  const vorlage = weiterleitungsMail({ von, an, betreff, text, empfangenText: datumText(empfangenMs), anhaenge });
  const ergebnis = await sendeMail({
    an: stand.weiterleitungAn,
    betreff: vorlage.betreff,
    html: vorlage.html,
    text: vorlage.text,
    art: "weiterleitung",
    id: id.replace(/^ein-/, "weiter-"),
    antwortAn: istAdresse(von) ? von : "",
    meta: { quelle: id },
  });
  // "Schon gesendet" ist auch erledigt: Cloudflare hat es dann nur zweimal
  // versucht, und die Mail liegt längst im Postfach.
  const erledigt = Boolean(ergebnis.gesendet) || ergebnis.grund === "schon gesendet";
  return { ok: true, id, weitergeleitet: Boolean(ergebnis.gesendet), erledigt, grund: ergebnis.grund || "" };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    if (!geheimnisStimmt(request)) throw new AnfrageFehler(401, "bad-secret", "Falsches Geheimnis.");
    const nachricht = await liesJson(request);
    if (!nachricht || typeof nachricht !== "object") throw new AnfrageFehler(400, "bad-body", "Keine Nachricht.");
    const ergebnis = await eingangVerarbeiten(nachricht);
    // 502, wenn die Weiterleitung versucht wurde und misslang: Die Mail ist
    // archiviert (deshalb steht die Kennung in der Antwort), aber sie liegt in
    // keinem Postfach. Der Worker leitet dann selbst weiter.
    return antwort(ergebnis, ergebnis.erledigt ? 200 : 502);
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/mail-eingang" };
