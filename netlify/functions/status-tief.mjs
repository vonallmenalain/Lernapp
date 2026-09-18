/*
 * Antworten Firebase und Stripe wirklich – und wie schnell?
 * ---------------------------------------------------------------------------
 *   GET /api/status-tief
 *
 * Die schwere Schwester von /api/status: Diese Funktion lädt dasselbe wie die
 * Kasse (firebase-admin, Stripe) und fragt beide an. Damit beantwortet sie
 * die zwei Fragen, die ein 502 offenlässt:
 *
 *   - Lädt das Paket überhaupt? Wenn schon diese Funktion mit 502 antwortet,
 *     während /api/status 200 gibt, liegt es an den Paketen, nicht an uns.
 *   - Stimmen die Schlüssel? Jede Prüfung sagt, wie lange sie gebraucht hat
 *     und woran sie sonst scheitert. Beim Stripe-Preis steht der gefundene
 *     Betrag dabei – so sieht man, ob Preis und Schlüssel zusammenpassen.
 *
 * Geprüft wird mit Anfragen, die nichts verraten und nichts ändern: ein Konto,
 * das es nicht gibt, ein Dokument, das leer sein darf, und der Preis, der
 * ohnehin auf der Kaufkarte steht. Inhalte von Schlüsseln stehen nie in der
 * Antwort.
 *
 * Offen ist die Seite trotzdem – wer die Adresse kennt, ruft sie auf, und
 * jeder Aufruf kostet drei Anfragen bei Google und Stripe. Deshalb misst sie
 * höchstens einmal pro Minute wirklich nach und gibt sonst das letzte
 * Ergebnis zurück, mit dem Alter dabei. Wer sie hämmert, bekommt dieselbe
 * Antwort aus dem Speicher.
 */

import { auth, db } from "./_lib/firebase.mjs";
import { stripe, preisId, preisAufloesen } from "./_lib/stripe.mjs";

const antwort = (daten, status) => new Response(JSON.stringify(daten, null, 2), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

// Jede Prüfung bekommt ihre eigene Uhr und ihre eigene Reissleine: Eine, die
// hängt, darf die anderen nicht mitnehmen – sonst steht am Ende wieder nur
// die Zeitüberschreitung da, die wir gerade erklären wollen.
async function pruefe(name, tun, frist = 6000) {
  const start = Date.now();
  try {
    const info = await Promise.race([
      tun(),
      new Promise((_, ab) => setTimeout(() => ab(new Error(`nach ${frist} ms keine Antwort`)), frist)),
    ]);
    return { name, ok: true, ms: Date.now() - start, ...(info ? { info } : {}) };
  } catch (fehler) {
    return {
      name,
      ok: false,
      ms: Date.now() - start,
      fehler: String(fehler?.code || fehler?.errorInfo?.code || fehler?.name || "Fehler"),
      text: String(fehler?.message || fehler).slice(0, 200),
    };
  }
}

// Der Preis gehört zur Kasse: Ohne ihn kann niemand kaufen, also ist "der
// Schlüssel gilt" allein kein gutes Zeichen.
export async function pruefungenLaufen({ stripeClient = null } = {}) {
  const pruefungen = [];

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
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
  } else {
    pruefungen.push({ name: "Firebase", ok: false, ms: 0, fehler: "fehlt", text: "FIREBASE_SERVICE_ACCOUNT ist nicht gesetzt." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    pruefungen.push({ name: "Stripe", ok: false, ms: 0, fehler: "fehlt", text: "STRIPE_SECRET_KEY ist nicht gesetzt." });
  } else if (!process.env.STRIPE_PRICE_ID) {
    pruefungen.push({ name: "Stripe", ok: false, ms: 0, fehler: "fehlt", text: "STRIPE_PRICE_ID ist nicht gesetzt – ohne Preis öffnet die Kasse nicht." });
  } else {
    pruefungen.push(await pruefe("Stripe", async () => {
      const client = stripeClient || stripe();
      const eingetragen = preisId();
      const kennung = await preisAufloesen(client, eingetragen);
      const preis = await client.prices.retrieve(kennung);
      const woher = kennung === eingetragen ? "" : ` (Standardpreis des Produkts ${eingetragen})`;
      return `Preis gefunden: ${(preis.unit_amount ?? 0) / 100} ${String(preis.currency || "").toUpperCase()}, ${preis.type}${woher}`;
    }));
  }

  return { ok: pruefungen.every((p) => p.ok), node: process.version, zeit: new Date().toISOString(), pruefungen };
}

// Das letzte Ergebnis, solange es frisch ist.
const FRISCHE_MS = 60000;
let letztes = null;

export default async () => {
  if (letztes && Date.now() - letztes.zeit < FRISCHE_MS) {
    const alter = Math.round((Date.now() - letztes.zeit) / 1000);
    return antwort({ ...letztes.daten, gemessenVorSekunden: alter }, letztes.daten.ok ? 200 : 503);
  }
  const daten = await pruefungenLaufen();
  letztes = { zeit: Date.now(), daten };
  return antwort(daten, daten.ok ? 200 : 503);
};

export const config = { path: "/api/status-tief" };
