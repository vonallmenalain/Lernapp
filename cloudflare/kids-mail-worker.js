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
 *   2. Geht das schief, leitet er selbst weiter, an die Adresse in
 *      WEITERLEITUNG. Post darf nicht verlorengehen, nur weil eine Funktion
 *      hustet.
 *
 * "Schiefgehen" heisst dabei mehr als "Netlify antwortet nicht": Auch eine
 * Antwort mit 200 kann bedeuten, dass die Mail nirgends angekommen ist – etwa
 * weil Resend den Schlüssel ablehnt. Gripszug sagt das in der Antwort
 * (erledigt: false), und erst wenn dort erledigt: true steht, hält dieser
 * Worker die Sache für erledigt. Ohne das wäre die Mail archiviert und
 * trotzdem weg.
 *
 * Anhänge sind der zweite Sonderfall. Weitergeleitet wird über Gripszug als
 * neue Mail mit dem Text der alten – ein Bild oder ein PDF kann darin nicht
 * mitkommen (das Original läge bei Cloudflare, und Megabyte durch eine
 * Netlify-Funktion zu schieben wäre der falsche Weg). Deshalb: Hat die Mail
 * Anhänge, leitet der Worker sie ZUSÄTZLICH im Original weiter. Man bekommt
 * dann zwei Mails – die lesbare aus Gripszug und das Original mit dem Anhang.
 * Zwei Mails sind besser als ein verlorenes Foto vom Fehler, den jemand
 * melden wollte.
 *
 * Eingerichtet wird er einmal von Hand; wie, steht in FIREBASE_SETUP.md,
 * Abschnitt 10. Diese Datei liegt im Repository, damit nachlesbar ist, was
 * dort läuft – deployt wird sie von hier aus nicht.
 *
 * Zwei Variablen braucht er (Cloudflare: Worker → Settings → Variables):
 *   GRIPSZUG_EINGANG   https://kids.alae.app/api/mail-eingang
 *   MAIL_GEHEIMNIS     dasselbe wie MAIL_WEBHOOK_SECRET bei Netlify (Secret!)
 * Und eine Konstante, die hier stehen darf, weil sie kein Geheimnis ist.
 * Sie muss bei Cloudflare als Destination address bestätigt sein – anders
 * leitet Email Routing nirgendwohin:
 */
export const WEITERLEITUNG = "vonallmenalain@gmail.com";

// Wie viel Text mitgeschickt wird. Eine Mail mit Anhängen kann Megabyte gross
// sein; für das Archiv zählt, was jemand geschrieben hat, nicht das Foto
// darunter.
const MAX_ZEICHEN = 60000;

// ---------------------------------------------------------------------------
// MIME, so weit es hier nötig ist
// ---------------------------------------------------------------------------
// Bewusst kein vollständiger Parser: Der Worker soll nichts können, was
// schiefgehen kann. Er schneidet den Kopf ab, nimmt bei einer mehrteiligen
// Mail den ersten Textteil und rechnet die Kodierung zurück – mehr nicht.
//
// Das Zurückrechnen ist der Teil, an dem es leicht falsch wird: Sowohl
// quoted-printable als auch base64 ergeben BYTES, nicht Zeichen. Wer jedes
// Byte einzeln zu einem Zeichen macht, bekommt aus "Gr=C3=BCsse" ein
// "GrÃ¼sse" – die zwei Bytes des ü als zwei Zeichen. Deshalb sammelt alles
// hier erst Bytes und übergibt sie am Ende einem TextDecoder mit dem Zeichensatz,
// den die Mail nennt.

function decoder(zeichensatz) {
  try {
    return new TextDecoder(zeichensatz || "utf-8", { fatal: false });
  } catch {
    // Ein Zeichensatz, den niemand kennt: Dann lieber UTF-8 als gar nichts.
    return new TextDecoder("utf-8", { fatal: false });
  }
}

export function quotedPrintable(text, zeichensatz = "utf-8") {
  const ohneWeicheUmbrueche = String(text).replace(/=\r?\n/g, "");
  const bytes = [];
  for (let i = 0; i < ohneWeicheUmbrueche.length; i += 1) {
    const zeichen = ohneWeicheUmbrueche[i];
    const hex = ohneWeicheUmbrueche.slice(i + 1, i + 3);
    if (zeichen === "=" && /^[0-9A-Fa-f]{2}$/.test(hex)) {
      bytes.push(parseInt(hex, 16));
      i += 2;
    } else {
      bytes.push(zeichen.charCodeAt(0) & 0xff);
    }
  }
  return decoder(zeichensatz).decode(new Uint8Array(bytes));
}

export function base64Text(text, zeichensatz = "utf-8") {
  try {
    const roh = atob(String(text).replace(/\s+/g, ""));
    const bytes = new Uint8Array(roh.length);
    for (let i = 0; i < roh.length; i += 1) bytes[i] = roh.charCodeAt(i) & 0xff;
    return decoder(zeichensatz).decode(bytes);
  } catch {
    return String(text);
  }
}

// Betreffzeilen mit Umlauten stehen nicht im Klartext da, sondern als
// "=?UTF-8?Q?Gr=C3=BCsse?=" (RFC 2047). Ohne das hier stünde genau das im
// Adminbereich – und bei einer deutschen Mail ist das eher die Regel als die
// Ausnahme.
export function dekodiereKopf(wert) {
  return String(wert || "").replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (ganz, satz, art, inhalt) => {
    try {
      if (art.toUpperCase() === "B") return base64Text(inhalt, satz);
      // In Q-Kodierung steht der Unterstrich für das Leerzeichen.
      return quotedPrintable(inhalt.replace(/_/g, " "), satz);
    } catch {
      return ganz;
    }
  }).replace(/\?=\s+=\?/g, "?==?");
}

const kopfVon = (roh) => {
  const trenner = roh.indexOf("\r\n\r\n") >= 0 ? "\r\n\r\n" : "\n\n";
  const ende = roh.indexOf(trenner);
  return ende < 0 ? roh : roh.slice(0, ende);
};

const koerperVon = (roh) => {
  const trenner = roh.indexOf("\r\n\r\n") >= 0 ? "\r\n\r\n" : "\n\n";
  const ende = roh.indexOf(trenner);
  return ende < 0 ? "" : roh.slice(ende + trenner.length);
};

const zeichensatzVon = (kopf) => (/charset="?([^";\r\n]+)"?/i.exec(kopf)?.[1] || "utf-8").trim();

function entpacke(kopf, koerper) {
  const satz = zeichensatzVon(kopf);
  if (/content-transfer-encoding:\s*quoted-printable/i.test(kopf)) return quotedPrintable(koerper, satz);
  if (/content-transfer-encoding:\s*base64/i.test(kopf)) return base64Text(koerper, satz);
  return koerper;
}

// Der lesbare Teil der Mail.
export function textAusRoh(roh) {
  const kopf = kopfVon(roh);
  const grenze = /boundary="?([^";\r\n]+)"?/i.exec(kopf)?.[1];
  let text;

  if (grenze) {
    const teile = koerperVon(roh).split(`--${grenze}`);
    const gesucht = teile.find((teil) => /content-type:\s*text\/plain/i.test(teil))
      || teile.find((teil) => /content-type:\s*text\//i.test(teil))
      || "";
    text = entpacke(kopfVon(gesucht), koerperVon(gesucht));
  } else {
    text = entpacke(kopf, koerperVon(roh));
  }

  return String(text).replace(/\r\n/g, "\n").trim().slice(0, MAX_ZEICHEN);
}

// Hängt etwas dran? Gesucht wird nach Teilen, die sich selbst als Anhang
// ausweisen – daran entscheidet sich, ob das Original zusätzlich weitergeleitet
// wird.
export function anhaengeAusRoh(roh) {
  const grenze = /boundary="?([^";\r\n]+)"?/i.exec(kopfVon(roh))?.[1];
  if (!grenze) return [];
  return koerperVon(roh)
    .split(`--${grenze}`)
    .filter((teil) => /content-disposition:\s*attachment/i.test(teil))
    .map((teil) => {
      const name = /filename\*?="?([^";\r\n]+)"?/i.exec(teil)?.[1] || "";
      return dekodiereKopf(name) || "Anhang";
    })
    .slice(0, 20);
}

export default {
  async email(message, env) {
    const roh = await new Response(message.raw).text();
    const anhaenge = anhaengeAusRoh(roh);
    let erledigt = false;

    try {
      const antwort = await fetch(env.GRIPSZUG_EINGANG, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mail-geheimnis": env.MAIL_GEHEIMNIS,
        },
        body: JSON.stringify({
          von: message.from,
          an: message.to,
          betreff: dekodiereKopf(message.headers.get("subject") || ""),
          text: textAusRoh(roh),
          messageId: message.headers.get("message-id") || "",
          empfangenAmMs: Date.now(),
          groesse: message.rawSize || roh.length,
          anhaenge,
          // Was Cloudflare über die Echtheit des Absenders sagt. Steht im
          // Adminbereich dabei – eine Mail, die weder SPF noch DKIM besteht,
          // ist mit grosser Wahrscheinlichkeit gefälscht.
          pruefung: {
            spf: message.headers.get("received-spf") || "",
            dkim: message.headers.get("authentication-results") || "",
          },
        }),
      });
      // Nicht antwort.ok: Gripszug kann die Mail angenommen und trotzdem nicht
      // zugestellt haben. "erledigt" heisst weitergeleitet – oder die
      // Weiterleitung ist absichtlich aus.
      const ergebnis = await antwort.json().catch(() => ({}));
      erledigt = antwort.ok && ergebnis?.erledigt === true;
      if (!erledigt) console.error("Gripszug hat nicht zugestellt:", antwort.status, ergebnis?.grund || "");
    } catch (fehler) {
      console.error("Gripszug nicht erreichbar:", fehler);
    }

    // Das Original hinterher, wenn etwas dranhängt – die Mail aus Gripszug hat
    // nur den Text. Und die Reissleine, wenn Gripszug nicht zugestellt hat.
    if (!erledigt || anhaenge.length) {
      try {
        await message.forward(WEITERLEITUNG);
        return;
      } catch (fehler) {
        console.error("Auch die eigene Weiterleitung ging nicht:", fehler);
        // Nur wenn beides scheitert, wird zurückgewiesen: Wer schreibt,
        // bekommt dann eine Fehlermeldung und weiss, dass seine Mail nicht
        // angekommen ist. Hat Gripszug zugestellt, ist das Original nur ein
        // Nachschlag – dann bleibt es still.
        if (!erledigt) message.setReject("Die Mail konnte nicht zugestellt werden.");
      }
    }
  },
};
