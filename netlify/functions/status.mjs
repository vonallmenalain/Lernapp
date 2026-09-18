/*
 * Lebt der Server, und hat er, was er braucht?
 * ---------------------------------------------------------------------------
 *   GET /api/status        Node-Fassung und welche Umgebungsvariablen da sind
 *   GET /api/status-tief   antworten Firebase und Stripe wirklich? (status-tief.mjs)
 *
 * Wenn eine Funktion mit 502 antwortet, kommt der eigene Code gar nicht erst
 * dran: Dann fehlt eine Datei im Paket, die Node-Fassung passt nicht, oder
 * der Aufruf hat zu lange gedauert. Von aussen sieht das alles gleich aus.
 *
 * Diese Funktion trennt es auf, indem sie NICHTS lädt – keine einzige
 * import-Zeile, auch keine eigene. Das ist Absicht und muss so bleiben: Der
 * Bündler zieht importierte Nachbardateien in die Funktion hinein, und damit
 * käme firebase-admin durch die Hintertür doch mit. Kommt hier 200, läuft die
 * Umgebung; kommt hier 502, liegt es nicht an unserem Code. Was dann noch
 * fehlt, sagt /api/status-tief – die darf schwer sein.
 *
 * Was hier NIE stehen darf: der Inhalt einer Umgebungsvariablen. Nur, ob sie
 * gesetzt ist. Die Seite ist offen – wer die Adresse kennt, ruft sie auf.
 */

const VARIABLEN = [
  "FIREBASE_SERVICE_ACCOUNT", "STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "STRIPE_WEBHOOK_SECRET", "SITE_URL", "URL",
  // Die Post: ohne RESEND_API_KEY verschickt Gripszug nichts, ohne
  // MAIL_WEBHOOK_SECRET nimmt es nichts an. Beides ist kein Grund, dass etwas
  // anderes nicht liefe – deshalb steht es hier und nicht als Fehler.
  "RESEND_API_KEY", "MAIL_WEBHOOK_SECRET", "MAIL_ABSENDER",
];

export default async () => {
  const daten = {
    ok: true,
    node: process.version,
    zeit: new Date().toISOString(),
    umgebung: Object.fromEntries(VARIABLEN.map((name) => [name, Boolean(process.env[name])])),
    hinweis: "Fehlt nichts und der Kauf klemmt trotzdem? /api/status-tief fragt Firebase und Stripe wirklich an.",
  };
  return new Response(JSON.stringify(daten, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
};

export const config = { path: "/api/status" };
