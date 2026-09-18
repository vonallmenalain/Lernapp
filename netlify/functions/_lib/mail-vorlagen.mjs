/*
 * Wie eine Mail von Gripszug aussieht.
 * ---------------------------------------------------------------------------
 * Eine Vorlage, fünf Anlässe. Der Rahmen ist überall derselbe – violettes
 * Band, weisse Karte, ein Satz zum Schluss, warum diese Mail kommt –, und
 * jeder Anlass füllt nur den Inhalt. So sehen alle Mails aus wie von derselben
 * App, und eine neue Mail ist ein Absatz Text, keine neue Gestaltung.
 *
 * Warum das so altmodisch aussieht (Tabellen, style= an jedem Element):
 * Mailprogramme sind keine Browser. Outlook rendert mit Word, Gmail wirft
 * <style>-Blöcke weg, und flex und grid kennt die Hälfte nicht. Was hier steht,
 * ist die Schnittmenge, die überall gleich ankommt. Dieselbe Datei baut
 * deshalb auch immer eine reine Textfassung: Wer HTML abgeschaltet hat, soll
 * dieselbe Mail lesen können, und eine Mail ohne Textteil gilt manchem
 * Spamfilter schon als verdächtig.
 *
 * Farben wie in der App (styles.css): --primary #6c5ce7, --ink #243047,
 * --bg #f7f3ff, --line #d9d6ee.
 */

export const SEITE = (process.env.SITE_URL || "https://kids.alae.app").replace(/\/+$/, "");
export const KONTAKT = () => (process.env.MAIL_ABSENDER || "kids@alae.app").trim();

export function escape(wert) {
  return String(wert ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SCHRIFT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif";

/*
 * rahmen({...}) baut die HTML-Fassung.
 *
 *   titel      die Überschrift in der Karte
 *   vorschau   die Zeile, die das Mailprogramm in der Liste zeigt. Sie steht
 *              unsichtbar zuoberst im Text – sonst nimmt das Programm den
 *              Anfang des Inhalts, und das ist selten der beste Satz.
 *   absaetze   Text, Absatz für Absatz (HTML erlaubt, wer escape() nutzt)
 *   knopf      {text, href} – der eine Klick, um den es geht. Höchstens einer:
 *              zwei gleich wichtige Knöpfe sind keiner.
 *   kasten     {titel, zeilen:[[links, rechts]]} – die kleine Tabelle für
 *              Zahlen, die man nachsehen will (Betrag, Datum, Adresse)
 *   fussnote   warum diese Mail kommt
 */
export function rahmen({ titel, vorschau = "", absaetze = [], knopf = null, kasten = null, fussnote = "" }) {
  const knopfHtml = knopf ? `
              <tr>
                <td style="padding: 8px 0 20px;">
                  <a href="${escape(knopf.href)}" style="display: inline-block; background: #6c5ce7; color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 999px;">${escape(knopf.text)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 20px; font-size: 13px; line-height: 20px; color: #667085;">
                  Falls der Knopf nicht geht, diese Adresse in den Browser kopieren:<br />
                  <span style="color: #5141c9; word-break: break-all;">${escape(knopf.href)}</span>
                </td>
              </tr>` : "";

  const kastenHtml = kasten ? `
              <tr>
                <td style="padding: 4px 0 20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f7f3ff; border: 1px solid #d9d6ee; border-radius: 14px;">
                    ${kasten.titel ? `<tr><td colspan="2" style="padding: 14px 18px 4px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #667085; font-weight: 700;">${escape(kasten.titel)}</td></tr>` : ""}
                    ${(kasten.zeilen || []).map(([links, rechts], i, alle) => `
                    <tr>
                      <td style="padding: ${i === 0 && !kasten.titel ? "14px" : "6px"} 8px 6px 18px; font-size: 14px; color: #667085; ${i === alle.length - 1 ? "padding-bottom: 14px;" : ""}">${escape(links)}</td>
                      <td style="padding: ${i === 0 && !kasten.titel ? "14px" : "6px"} 18px 6px 8px; font-size: 14px; color: #243047; font-weight: 700; text-align: right; ${i === alle.length - 1 ? "padding-bottom: 14px;" : ""}">${escape(rechts)}</td>
                    </tr>`).join("")}
                  </table>
                </td>
              </tr>` : "";

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escape(titel)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f7f3ff; font-family: ${SCHRIFT};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${escape(vorschau)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f7f3ff;">
      <tr>
        <td align="center" style="padding: 28px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px; background: #ffffff; border: 1px solid #d9d6ee; border-radius: 20px; overflow: hidden;">
            <tr>
              <td style="background: #6c5ce7; padding: 22px 28px;">
                <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">Gripszug</span>
                <span style="font-size: 20px;">&#128642;</span>
                <div style="font-size: 13px; color: #d7d0ff; padding-top: 2px;">R&auml;tsel und Gehirntraining f&uuml;r Kinder</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 28px 4px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0 0 12px; font-size: 22px; line-height: 30px; font-weight: 800; color: #243047;">${escape(titel)}</td>
                  </tr>
                  ${absaetze.map((absatz) => `
                  <tr>
                    <td style="padding: 0 0 16px; font-size: 16px; line-height: 25px; color: #243047;">${absatz}</td>
                  </tr>`).join("")}
                  ${kastenHtml}
                  ${knopfHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 28px 26px;">
                <div style="border-top: 1px solid #d9d6ee; padding-top: 16px; font-size: 13px; line-height: 21px; color: #667085;">
                  ${fussnote ? `${escape(fussnote)}<br /><br />` : ""}
                  Fragen? Einfach auf diese Mail antworten &#8211; sie geht an <a href="mailto:${escape(KONTAKT())}" style="color: #5141c9;">${escape(KONTAKT())}</a>.<br />
                  <a href="${SEITE}/willkommen.html" style="color: #5141c9;">kids.alae.app</a> &#183;
                  <a href="${SEITE}/impressum.html" style="color: #5141c9;">Impressum</a> &#183;
                  <a href="${SEITE}/datenschutz.html" style="color: #5141c9;">Datenschutz</a> &#183;
                  <a href="${SEITE}/agb.html" style="color: #5141c9;">AGB</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Dieselbe Mail ohne Gestaltung. Die Absätze kommen als HTML herein (sie
// stehen ja auch im Rahmen), deshalb fallen hier die Auszeichnungen wieder
// heraus – und aus einem <a href> wird die Adresse im Klartext, sonst führte
// der Satz "hier klicken" in der Textfassung nirgendwohin.
export function alsText({ titel, absaetze = [], knopf = null, kasten = null, fussnote = "" }) {
  const roh = (html) => String(html)
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `${text.replace(/<[^>]+>/g, "")} (${href})`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä").replace(/&Ouml;/g, "Ö").replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ss").replace(/&#8211;/g, "–").replace(/&#183;/g, "·")
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .trim();

  const teile = [titel, "", ...absaetze.map(roh)];
  if (kasten) {
    teile.push(kasten.titel ? `${kasten.titel}:` : "");
    (kasten.zeilen || []).forEach(([links, rechts]) => teile.push(`  ${links}: ${rechts}`));
    teile.push("");
  }
  if (knopf) teile.push(`${knopf.text}: ${knopf.href}`, "");
  if (fussnote) teile.push(fussnote, "");
  teile.push(`Fragen? Antworte auf diese Mail – sie geht an ${KONTAKT()}.`, `${SEITE}/willkommen.html`);
  return teile.join("\n").replace(/\n{3,}/g, "\n\n");
}

function fertig(teile) {
  return { betreff: teile.betreff, html: rahmen(teile), text: alsText(teile) };
}

// ---------------------------------------------------------------------------
// Die Anlässe
// ---------------------------------------------------------------------------

// 1. Ein Elternkonto ist da.
//
// Der Link zum Bestätigen der Adresse ist eine Einladung, keine Schranke: Wer
// ihn nicht anklickt, kann Gripszug trotzdem in vollem Umfang nutzen. Er steht
// da, weil eine bestätigte Adresse zweierlei wert ist – die Bestellbestätigung
// kommt sicher an, und "Passwort vergessen" führt zurück ins eigene Konto.
export function willkommenMail({ email, bestaetigungsLink = "" }) {
  const absaetze = [
    "Schön, dass du da bist. Das Elternkonto für Gripszug ist angelegt – ab jetzt kannst du Kinderprofile anlegen, den Fortschritt ansehen und den Zug für deine Familie einstellen.",
    `Angemeldet wird sich mit dieser Adresse: <strong>${escape(email)}</strong>. Die Kinder brauchen keine Adresse – sie melden sich mit ihrem Namen und einem eigenen Passwort an, das du vergibst.`,
  ];
  if (bestaetigungsLink) {
    absaetze.push("Ein Klick noch, wenn du magst: Bestätige kurz, dass diese Adresse dir gehört. Nötig ist das nicht – es sorgt nur dafür, dass Bestellbestätigung und „Passwort vergessen“ sicher bei dir ankommen.");
  }
  return fertig({
    betreff: "Willkommen bei Gripszug",
    titel: "Hallo!",
    vorschau: "Das Elternkonto ist angelegt – so geht es weiter.",
    absaetze,
    knopf: bestaetigungsLink ? { text: "Adresse bestätigen", href: bestaetigungsLink } : { text: "Zur App", href: `${SEITE}/index.html` },
    fussnote: "Diese Mail kommt, weil mit dieser Adresse ein Elternkonto bei Gripszug angelegt wurde. Warst du das nicht, ignoriere sie einfach – ohne das Passwort kommt niemand ins Konto.",
  });
}

// 2. Bezahlt.
export function bestellMail({ email, betragText = "", datumText = "", kinder = 0 }) {
  const zeilen = [
    ["Produkt", "Gripszug Familie – Einmalkauf"],
    ["Konto", email],
  ];
  if (betragText) zeilen.splice(1, 0, ["Betrag", betragText]);
  if (datumText) zeilen.push(["Datum", datumText]);
  return fertig({
    betreff: "Deine Bestellung bei Gripszug",
    titel: "Danke für deinen Kauf!",
    vorschau: "Gripszug ist freigeschaltet – für die ganze Familie.",
    absaetze: [
      "Die Zahlung ist angekommen. Gripszug ist jetzt freigeschaltet – alle Spiele, die ganze Reise, für bis zu vier Kinder. Auch für alles, was noch dazukommt: Einmal bezahlt ist bezahlt.",
      kinder > 0
        ? `${kinder === 1 ? "Das Kinderprofil, das schon da ist, ist" : `Die ${kinder} Kinderprofile, die schon da sind, sind`} mit freigeschaltet. Neue Profile bekommen den Kauf automatisch mit.`
        : "Als Nächstes: Leg im Elternbereich ein Profil für dein Kind an – Name und ein kurzes Passwort genügen. Jedes Kind bekommt dann seinen eigenen Zug.",
    ],
    kasten: { titel: "Bestellung", zeilen },
    knopf: { text: "Zur App", href: `${SEITE}/index.html` },
    fussnote: "Diese Mail ist deine Bestellbestätigung – heb sie auf. Die Quittung mit allen Zahlungsdetails kommt zusätzlich von Stripe, unserem Zahlungsdienstleister.",
  });
}

// 3. Freigeschaltet, ohne Zahlung – der Admin hat es geschenkt.
export function freischaltMail({ email }) {
  return fertig({
    betreff: "Gripszug ist für dich freigeschaltet",
    titel: "Gripszug ist freigeschaltet",
    vorschau: "Alle Spiele und die ganze Reise sind offen.",
    absaetze: [
      "Gripszug ist für dein Konto freigeschaltet – alle Spiele, die ganze Reise, für bis zu vier Kinder. Zu bezahlen ist nichts.",
      "Leg im Elternbereich ein Profil für dein Kind an, dann kann es losgehen.",
    ],
    kasten: { titel: "Konto", zeilen: [["Adresse", email], ["Freischaltung", "Geschenk"]] },
    knopf: { text: "Zur App", href: `${SEITE}/index.html` },
    fussnote: "Diese Mail kommt, weil Gripszug für dieses Konto freigeschaltet wurde.",
  });
}

// 4. Passwort vergessen.
//
// Der Link kommt vom Firebase-Admin-SDK (generatePasswordResetLink) – es ist
// derselbe, den Firebase auch selbst verschickt hätte, nur eben in unserer
// Mail statt in seiner.
export function passwortMail({ email, link }) {
  return fertig({
    betreff: "Neues Passwort für Gripszug",
    titel: "Passwort zurücksetzen",
    vorschau: "Ein Klick, und du vergibst ein neues Passwort.",
    absaetze: [
      `Für das Elternkonto <strong>${escape(email)}</strong> wurde ein neues Passwort angefordert. Mit dem Knopf unten vergibst du es.`,
      "Der Link gilt eine Stunde lang und nur ein einziges Mal.",
    ],
    knopf: { text: "Neues Passwort vergeben", href: link },
    fussnote: "Warst du das nicht, ignoriere diese Mail. Dein Passwort bleibt dann unverändert – ohne den Link ändert sich nichts.",
  });
}

// 5. Post an kids@alae.app, weitergeleitet.
//
// Keine Gestaltung um fremden Text: Was jemand geschrieben hat, steht hier so,
// wie er es geschrieben hat. Der Rahmen sagt nur, von wem es kam – und die
// Antwortadresse ist der ursprüngliche Absender, damit ein "Antworten" im
// Postfach beim Richtigen landet.
export function weiterleitungsMail({ von, an, betreff, text, empfangenText = "", anhaenge = [] }) {
  const zeilen = [["Von", von || "unbekannt"], ["An", an || KONTAKT()]];
  if (empfangenText) zeilen.push(["Empfangen", empfangenText]);
  if (anhaenge.length) zeilen.push([anhaenge.length === 1 ? "Anhang" : "Anhänge", anhaenge.join(", ")]);

  const absaetze = [`<span style="white-space: pre-wrap;">${escape(text || "(kein Textinhalt)")}</span>`];
  // Hier steht nur der Text der Mail – ein Bild oder ein PDF kann darin nicht
  // mitkommen. Der Worker bei Cloudflare schickt das Original deshalb
  // zusätzlich; dieser Satz sagt, dass es unterwegs ist, damit niemand nach
  // einem Anhang sucht, der nie in dieser Mail war.
  if (anhaenge.length) {
    absaetze.push(`<em style="color: #667085;">Diese Mail hat ${anhaenge.length === 1 ? "einen Anhang" : `${anhaenge.length} Anhänge`}. Hier steht nur der Text – das Original mit ${anhaenge.length === 1 ? "dem Anhang" : "den Anhängen"} kommt gleich noch einmal, direkt von Cloudflare.</em>`);
  }

  return fertig({
    betreff: `[kids] ${betreff || "(ohne Betreff)"}`,
    titel: betreff || "(ohne Betreff)",
    vorschau: `Post an ${an || KONTAKT()} von ${von || "unbekannt"}`,
    absaetze,
    kasten: { titel: "Weitergeleitet", zeilen },
    fussnote: "Diese Mail ging an kids@alae.app und wurde an dich weitergeleitet. Ein Antworten geht direkt an den ursprünglichen Absender.",
  });
}

// 6. Der Probelauf aus dem Adminbereich.
export function testMail({ an }) {
  return fertig({
    betreff: "Testmail von Gripszug",
    titel: "Der Postweg steht",
    vorschau: "Diese Mail kam über Resend von kids@alae.app.",
    absaetze: [
      "Wenn du das liest, funktioniert alles: Der Schlüssel stimmt, die Domain ist bestätigt, und der Absender ist der richtige.",
    ],
    kasten: { titel: "Probelauf", zeilen: [["An", an], ["Von", KONTAKT()], ["Ausgelöst", "Adminbereich, Reiter E-Mail"]] },
    fussnote: "Diese Mail wurde von Hand im Adminbereich ausgelöst.",
  });
}
