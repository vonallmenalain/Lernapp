/*
 * Lebt der Server, und hat er, was er braucht?
 * ---------------------------------------------------------------------------
 *   GET /api/status          Node-Fassung und welche Umgebungsvariablen da sind
 *   GET /api/status?tief=1   dazu: antworten Firebase und Stripe wirklich?
 *
 * Wenn eine Funktion mit 502 antwortet, kommt der eigene Code gar nicht erst
 * dran: Dann fehlt eine Datei im Paket, die Node-Fassung passt nicht, oder
 * der Aufruf hat zu lange gedauert. Von aussen sieht das alles gleich aus.
 * Diese Funktion trennt es auf, weil sie beim Laden nichts mitbringt: kein
 * firebase-admin, kein Stripe, nur die eingebaute Antwort. Kommt hier 200,
 * läuft die Umgebung; kommt hier 502, liegt es nicht an unserem Code.
 *
 * Die schweren Pakete holt erst die Tiefenprüfung, und zwar einzeln: So sagt
 * die Antwort, welches nicht lädt, statt dass alles zusammen scheitert.
 *
 * Was hier NIE stehen darf: der Inhalt einer Umgebungsvariablen. Nur, ob sie
 * gesetzt ist. Die Seite ist offen – wer die Adresse kennt, ruft sie auf.
 */

const VARIABLEN = ["FIREBASE_SERVICE_ACCOUNT", "STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "STRIPE_WEBHOOK_SECRET", "SITE_URL", "URL"];

const antwort = (daten, status = 200) => new Response(JSON.stringify(daten, null, 2), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

// Jede Prüfung bekommt ihre eigene Uhr und ihre eigene Reissleine: Eine, die
// hängt, darf die anderen nicht mitnehmen – sonst steht am Ende wieder nur
// die Zeitüberschreitung da, die wir gerade erklären wollen.
async function pruefe(name, tun, frist = 6000) {
  const start = Date.now();
  try {
    const wert = await Promise.race([
      tun(),
      new Promise((_, ab) => setTimeout(() => ab(new Error(`nach ${frist} ms keine Antwort`)), frist)),
    ]);
    return { name, ok: true, ms: Date.now() - start, ...(wert ? { info: wert } : {}) };
  } catch (fehler) {
    return { name, ok: false, ms: Date.now() - start, fehler: String(fehler?.code || fehler?.errorInfo?.code || fehler?.name || "Fehler"), text: String(fehler?.message || fehler).slice(0, 200) };
  }
}

export default async (request) => {
  const grund = {
    ok: true,
    node: process.version,
    zeit: new Date().toISOString(),
    umgebung: Object.fromEntries(VARIABLEN.map((name) => [name, Boolean(process.env[name])])),
  };

  const tief = new URL(request.url).searchParams.get("tief");
  if (!tief) return antwort({ ...grund, hinweis: "Mit ?tief=1 werden Firebase und Stripe wirklich angefragt." });

  const pruefungen = [];

  pruefungen.push(await pruefe("firebase-admin laden", async () => {
    const { auth } = await import("./_lib/firebase.mjs");
    return typeof auth === "function" ? "geladen" : "seltsam";
  }));

  if (pruefungen[0].ok && process.env.FIREBASE_SERVICE_ACCOUNT) {
    const { auth, db } = await import("./_lib/firebase.mjs");
    // Ein Konto, das es nicht gibt: Die erwartete Absage beweist, dass der
    // Schlüssel gilt – und verrät nichts über echte Konten.
    pruefungen.push(await pruefe("Firebase Auth", async () => {
      try {
        await auth().getUserByEmail("gibt-es-nicht@lernapp.local");
        return "antwortet";
      } catch (fehler) {
        if (String(fehler?.code) === "auth/user-not-found") return "antwortet";
        throw fehler;
      }
    }));
    pruefungen.push(await pruefe("Firestore lesen", async () => {
      const doc = await db().collection("status").doc("ping").get();
      return doc.exists ? "gelesen" : "gelesen (leer)";
    }));
  }

  if (process.env.STRIPE_SECRET_KEY) {
    pruefungen.push(await pruefe("Stripe", async () => {
      const { stripe, preisId } = await import("./_lib/stripe.mjs");
      if (!process.env.STRIPE_PRICE_ID) { await stripe().balance.retrieve(); return "Schlüssel gilt (kein Preis gesetzt)"; }
      const preis = await stripe().prices.retrieve(preisId());
      return `Preis gefunden: ${(preis.unit_amount ?? 0) / 100} ${String(preis.currency || "").toUpperCase()}, ${preis.type}`;
    }));
  }

  const ok = pruefungen.every((p) => p.ok);
  return antwort({ ...grund, ok, pruefungen }, ok ? 200 : 503);
};

export const config = { path: "/api/status" };
