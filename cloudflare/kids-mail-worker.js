/*
 * Der Briefträger für kids@alae.app.
 * ---------------------------------------------------------------------------
 * Das hier läuft NICHT bei Netlify, sondern bei Cloudflare: ein Email Worker.
 * Er hängt an Email Routing der Domain alae.app und bekommt jede Mail, die an
 * kids@alae.app geschickt wird, bevor sie irgendwohin geht.
 *
 * Er tut zwei Dinge:
 *
 *   1. Er schickt die Mail an /api/mail-eingang von Gripszug. Dort landet sie
 *      im Archiv (Reiter E-Mail im Adminbereich) und wird an die Adresse
 *      weitergeleitet, die dort eingestellt ist.
 *   2. Geht das schief – Netlify schläft, ein Deploy läuft gerade, das
 *      Geheimnis stimmt nicht –, leitet er selbst weiter, an die Adresse in
 *      WEITERLEITUNG. Post darf nicht verlorengehen, nur weil eine Funktion
 *      hustet.
 *
 * Eingerichtet wird er einmal von Hand; wie, steht in FIREBASE_SETUP.md,
 * Abschnitt 10. Diese Datei liegt im Repository, damit nachlesbar ist, was
 * dort läuft – deployt wird sie von hier aus nicht.
 *
 * Zwei Variablen braucht er (Cloudflare: Worker → Settings → Variables):
 *   GRIPSZUG_EINGANG   https://kids.alae.app/api/mail-eingang
 *   MAIL_GEHEIMNIS     dasselbe wie MAIL_WEBHOOK_SECRET bei Netlify (Secret!)
 * Und eine Konstante, die hier stehen darf, weil sie kein Geheimnis ist:
 */
const WEITERLEITUNG = "vonallmenalain@gmail.com";

// Wie viel Text mitgeschickt wird. Eine Mail mit Anhängen kann Megabyte gross
// sein; für das Archiv zählt, was jemand geschrieben hat, nicht das Foto
// darunter. Der Rest steht ohnehin im weitergeleiteten Original.
const MAX_ZEICHEN = 60000;

// Aus dem rohen RFC-822-Text den lesbaren Teil holen. Das ist bewusst kein
// vollständiger MIME-Parser: Der Worker soll nichts können, was schiefgehen
// kann – er schneidet den Kopf ab, nimmt bei einer mehrteiligen Mail den
// ersten Textteil und rechnet quoted-printable zurück, weil sonst jedes
// deutsche Wort mit Umlaut als "=C3=A4" im Adminbereich stünde.
function textAusRoh(roh) {
  const trenner = roh.indexOf("\r\n\r\n") >= 0 ? "\r\n\r\n" : "\n\n";
  const kopf = roh.slice(0, Math.max(0, roh.indexOf(trenner)));
  let koerper = roh.slice(roh.indexOf(trenner) + trenner.length);

  const grenze = /boundary="?([^";\r\n]+)"?/i.exec(kopf)?.[1];
  if (grenze) {
    const teile = koerper.split(`--${grenze}`);
    const text = teile.find((teil) => /content-type:\s*text\/plain/i.test(teil));
    const irgendeiner = text || teile.find((teil) => /content-type:\s*text\//i.test(teil)) || "";
    const abschnitt = irgendeiner.indexOf("\r\n\r\n") >= 0 ? "\r\n\r\n" : "\n\n";
    koerper = irgendeiner.slice(irgendeiner.indexOf(abschnitt) + abschnitt.length);
    if (/quoted-printable/i.test(irgendeiner)) koerper = quotedPrintable(koerper);
    else if (/base64/i.test(irgendeiner)) { try { koerper = atob(koerper.replace(/\s+/g, "")); } catch { /* dann eben roh */ } }
  } else if (/quoted-printable/i.test(kopf)) {
    koerper = quotedPrintable(koerper);
  }

  return koerper.replace(/\r\n/g, "\n").trim().slice(0, MAX_ZEICHEN);
}

function quotedPrintable(text) {
  return text
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export default {
  async email(message, env, ctx) {
    let gemeldet = false;

    try {
      const roh = await new Response(message.raw).text();
      const antwort = await fetch(env.GRIPSZUG_EINGANG, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mail-geheimnis": env.MAIL_GEHEIMNIS,
        },
        body: JSON.stringify({
          von: message.from,
          an: message.to,
          betreff: message.headers.get("subject") || "",
          text: textAusRoh(roh),
          messageId: message.headers.get("message-id") || "",
          empfangenAmMs: Date.now(),
          groesse: message.rawSize || roh.length,
          // Was Cloudflare über die Echtheit des Absenders sagt. Steht im
          // Adminbereich dabei – eine Mail, die weder SPF noch DKIM besteht,
          // ist mit grosser Wahrscheinlichkeit gefälscht.
          pruefung: {
            spf: message.headers.get("received-spf") || "",
            dkim: message.headers.get("authentication-results") || "",
          },
        }),
      });
      gemeldet = antwort.ok;
      if (!antwort.ok) console.error("Gripszug antwortet mit", antwort.status);
    } catch (fehler) {
      console.error("Gripszug nicht erreichbar:", fehler);
    }

    // Die Reissleine: Hat Gripszug die Mail nicht angenommen, leitet der
    // Worker selbst weiter. Sonst übernimmt das die App – mit der Adresse aus
    // dem Adminbereich, und nur einmal.
    if (!gemeldet) {
      try {
        await message.forward(WEITERLEITUNG);
      } catch (fehler) {
        console.error("Auch die Weiterleitung ging nicht:", fehler);
        // Jetzt lieber zurückweisen als schweigen: Wer schreibt, bekommt eine
        // Fehlermeldung und weiss, dass seine Mail nicht angekommen ist.
        message.setReject("Die Mail konnte nicht zugestellt werden.");
      }
    }
  },
};
