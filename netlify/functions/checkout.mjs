/*
 * Ein Elternkonto kauft Gripszug.
 * ---------------------------------------------------------------------------
 *   POST /api/checkout   {}   mit Bearer-Token der Eltern
 *   → { url }             die Kasse bei Stripe, dorthin leitet der Client
 *
 * Der Kauf ist ein Einmalkauf: ein Preis, eine Zahlung, kein Abo. Stripe
 * zeigt die Kasse, nimmt die Karte, und meldet sich danach per Webhook
 * (stripe-webhook.mjs) – erst DER schaltet frei. Die Rückkehr-URL hier ist
 * nur für den Menschen; ob bezahlt wurde, sagt der Webhook, nicht die URL.
 *
 * client_reference_id trägt die uid, damit der Webhook weiss, wer gekauft
 * hat. Die Mailadresse kommt vorbefüllt aus dem Konto: Die Quittung von
 * Stripe geht dorthin.
 */

import { db } from "./_lib/firebase.mjs";
import { stripe, preisId, preisAufloesen, seitenUrl } from "./_lib/stripe.mjs";
import { AnfrageFehler, antwort, fehlerAntwort, elternAnrufer, nurMethode } from "./_lib/anfrage.mjs";

export async function kasseErstellen({ eltern, stripeClient = stripe(), price = preisId(), site = seitenUrl() }) {
  const vorhanden = await db().collection("entitlements").doc(eltern.uid).get();
  if (vorhanden.exists && vorhanden.data()?.active) {
    throw new AnfrageFehler(409, "already-owned", "Dieses Konto hat Gripszug schon gekauft.");
  }

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: await preisAufloesen(stripeClient, price), quantity: 1 }],
    client_reference_id: eltern.uid,
    customer_email: eltern.email || undefined,
    metadata: { uid: eltern.uid, produkt: "gripszug-familie" },
    locale: "de",
    // Bei digitalen Inhalten erlischt das Widerrufsrecht, wenn der Kunde
    // ausdrücklich zustimmt, dass es sofort losgeht. Das steht hier an der
    // Kasse – und in den AGB, die Stripe verlinkt (terms_of_service, die URL
    // dazu wird im Stripe-Dashboard eingetragen).
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message: "Ich stimme zu, dass Gripszug sofort freigeschaltet wird, und weiss, dass damit das Widerrufsrecht erlischt und der Kauf verbindlich ist.",
      },
    },
    allow_promotion_codes: true,
    success_url: `${site}/?kauf=erfolg&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/?kauf=abbruch`,
  });

  return { url: session.url, id: session.id };
}

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const eltern = await elternAnrufer(request);
    return antwort(await kasseErstellen({ eltern }));
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/checkout" };
