/*
 * Stripe meldet, was an der Kasse passiert ist.
 * ---------------------------------------------------------------------------
 *   POST /api/stripe-webhook   (von Stripe, mit Unterschrift im Kopf)
 *
 * Erst hier wird freigeschaltet – nicht beim Klick auf "Kaufen", nicht bei
 * der Rückkehr in die App. Die Unterschrift beweist, dass die Nachricht von
 * Stripe kommt; ohne sie könnte jeder mit einem POST einen Kauf vortäuschen.
 *
 *   checkout.session.completed   bezahlt → entitlements/{uid} für die Eltern
 *                                und jedes Kind in ihrer Liste
 *   checkout.session.async_payment_succeeded
 *                                dasselbe für Zahlarten, die erst später
 *                                bestätigt werden (completed kommt dann mit
 *                                payment_status "unpaid" und wartet)
 *   charge.refunded              Geld zurück → active: false, für alle
 *
 * Stripe schickt dasselbe Ereignis gern mehrmals (und im Zweifel noch
 * einmal). Deshalb: Was schon steht, wird nicht noch einmal geschrieben –
 * die Session-ID am Eintrag sagt, ob dieser Kauf schon verbucht ist. Und
 * geantwortet wird mit 200, sobald die Nachricht verstanden ist; alles
 * andere liesse Stripe tagelang wiederholen.
 */

import { db, FieldValue } from "./_lib/firebase.mjs";
import { stripe, webhookGeheimnis } from "./_lib/stripe.mjs";
import { antwort } from "./_lib/anfrage.mjs";
import { kinderVon } from "./_lib/familie.mjs";
import { sendeMail } from "./_lib/mail.mjs";
import { bestellMail } from "./_lib/mail-vorlagen.mjs";

const BEZAHLT = new Set(["paid", "no_payment_required"]);

// Was auf der Bestellbestätigung steht. amount_total kommt in Rappen bzw.
// Cents; eine Währung ohne Nachkommastellen (JPY) gibt es bei uns nicht, aber
// Intl rechnet sie ohnehin richtig.
function betragText(amountTotal, currency) {
  const betrag = Number(amountTotal);
  if (!Number.isFinite(betrag) || betrag <= 0) return "";
  const waehrung = String(currency || "chf").toUpperCase();
  try {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: waehrung }).format(betrag / 100);
  } catch {
    return `${waehrung} ${(betrag / 100).toFixed(2)}`;
  }
}

function datumText(ms) {
  try {
    return new Intl.DateTimeFormat("de-CH", { dateStyle: "long", timeZone: "Europe/Zurich" }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(0, 10);
  }
}

// Die Bestellbestätigung. Sie darf nichts aufhalten: Der Kauf ist verbucht,
// bevor sie losgeht, und wenn sie scheitert, bleibt er verbucht. Deshalb
// steht der Aufruf hinter dem commit und in einem try.
//
// Die Kennung im Archiv ist die Stripe-Session – Stripe schickt dasselbe
// Ereignis gern mehrmals, und eine zweite Bestätigung für denselben Kauf
// sieht aus wie eine zweite Abbuchung.
export async function bestellbestaetigung({ session, eintrag, elternDaten, kinder }) {
  const email = eintrag.email || elternDaten?.email || elternDaten?.authEmail || "";
  if (!email) return { gesendet: false, grund: "keine Adresse" };
  const vorlage = bestellMail({
    email,
    betragText: betragText(eintrag.amountTotal, eintrag.currency),
    datumText: datumText(eintrag.grantedAtMs || Date.now()),
    kinder,
  });
  return sendeMail({
    an: email,
    betreff: vorlage.betreff,
    html: vorlage.html,
    text: vorlage.text,
    art: "bestellung",
    id: `bestellung-${session.id}`,
    uid: session.client_reference_id || session.metadata?.uid || "",
    meta: { stripeSessionId: session.id },
  });
}



export async function kaufVerbuchen(session) {
  const uid = session.client_reference_id || session.metadata?.uid;
  if (!uid) return { verbucht: false, grund: "keine uid" };
  // Bezahlt – oder nichts zu bezahlen: Ein Gutschein über 100 % (die Kasse
  // erlaubt Gutscheincodes) ergibt eine fertige Kasse mit dem Stand
  // "no_payment_required". Alles andere (unpaid: eine verzögerte Zahlung,
  // die noch aussteht) wartet auf das nächste Ereignis.
  if (session.payment_status && !BEZAHLT.has(session.payment_status)) return { verbucht: false, grund: `payment_status ${session.payment_status}` };

  const ref = db().collection("entitlements").doc(uid);
  const vorhanden = await ref.get();
  if (vorhanden.exists && vorhanden.data()?.stripeSessionId === session.id) return { verbucht: false, grund: "schon verbucht" };

  const eltern = await db().collection("users").doc(uid).get();
  const jetzt = FieldValue.serverTimestamp();
  const eintrag = {
    plan: "familie",
    active: true,
    source: "stripe",
    stripeSessionId: session.id,
    stripePaymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id || null),
    stripeCustomerId: typeof session.customer === "string" ? session.customer : (session.customer?.id || null),
    email: session.customer_details?.email || session.customer_email || null,
    amountTotal: Number(session.amount_total) || 0,
    currency: session.currency || null,
    grantedAtMs: Date.now(),
    grantedAt: jetzt,
  };

  const stapel = db().batch();
  stapel.set(ref, eintrag);
  const kinder = kinderVon(eltern.data()).map((kind) => kind.uid);
  kinder.forEach((kindUid) => {
    stapel.set(db().collection("entitlements").doc(kindUid), { ...eintrag, via: uid });
  });
  await stapel.commit();

  // Erst jetzt die Mail: Was verbucht ist, ist verbucht – auch wenn Resend
  // gerade nicht mag.
  let bestaetigung = { gesendet: false, grund: "nicht versucht" };
  try {
    bestaetigung = await bestellbestaetigung({ session, eintrag, elternDaten: eltern.data(), kinder: kinder.length });
  } catch (fehler) {
    console.error("Bestellbestätigung nicht verschickt:", fehler?.message || fehler);
  }
  return { verbucht: true, uid, kinder: kinder.length, bestaetigung: Boolean(bestaetigung.gesendet) };
}

export async function rueckerstattungVerbuchen(charge) {
  const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntent) return { verbucht: false, grund: "kein payment_intent" };
  // Nur ganz zurück nimmt den Kauf. Eine Teilrückerstattung – etwa aus
  // Kulanz – lässt die Freischaltung stehen.
  if (!charge.refunded) return { verbucht: false, grund: "nicht ganz zurückerstattet" };

  const treffer = await db().collection("entitlements").where("stripePaymentIntent", "==", paymentIntent).get();
  if (treffer.empty) return { verbucht: false, grund: "kein Kauf zu diesem payment_intent" };
  const stapel = db().batch();
  treffer.docs.forEach((doc) => {
    stapel.set(doc.ref, { active: false, refundedAtMs: Date.now(), refundedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
  await stapel.commit();
  return { verbucht: true, eintraege: treffer.size };
}

export async function ereignisVerarbeiten(event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return kaufVerbuchen(event.data.object);
    case "charge.refunded":
      return rueckerstattungVerbuchen(event.data.object);
    default:
      return { verbucht: false, grund: `ignoriert: ${event.type}` };
  }
}

export default async (request) => {
  if (request.method !== "POST") return antwort({ error: "method" }, 405);
  const unterschrift = request.headers.get("stripe-signature") || "";
  const roh = await request.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(roh, unterschrift, webhookGeheimnis());
  } catch (fehler) {
    return antwort({ error: "bad-signature", message: fehler.message }, 400);
  }
  try {
    const ergebnis = await ereignisVerarbeiten(event);
    return antwort({ received: true, ...ergebnis });
  } catch (fehler) {
    console.error(fehler);
    // 500 lässt Stripe wiederholen – bei einem echten Serverfehler ist das
    // richtig: Der Kauf soll nicht verlorengehen.
    return antwort({ error: "server" }, 500);
  }
};

export const config = { path: "/api/stripe-webhook" };
