/*
 * Stripe für die Netlify-Funktionen.
 * ---------------------------------------------------------------------------
 * Drei Umgebungsvariablen bei Netlify, alle aus dem Stripe-Dashboard:
 *
 *   STRIPE_SECRET_KEY       der geheime Schlüssel aus dem Stripe-Dashboard (Test- oder Live-Schlüssel)
 *   STRIPE_WEBHOOK_SECRET   das Signiergeheimnis des Webhook-Endpunkts
 *                           aus dem Stripe-Dashboard, damit niemand uns Zahlungen vorspielt
 *   STRIPE_PRICE_ID         die Kennung des Preises für den Einmalkauf
 *
 * Dazu SITE_URL, damit Stripe nach dem Bezahlen zurück in die App leitet –
 * bei Netlify steht sie als URL ohnehin bereit.
 */

import Stripe from "stripe";

let instanz = null;

export function stripe() {
  if (instanz) return instanz;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt – ohne Schlüssel kein Kauf.");
  instanz = new Stripe(key, { apiVersion: "2025-08-27.basil", typescript: false });
  return instanz;
}

export function preisId() {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error("STRIPE_PRICE_ID fehlt – welcher Preis?");
  return id;
}

// Die Kasse will die Kennung eines Preises (price_…). Im Dashboard steht
// aber zuerst das Produkt (prod_…), und die beiden sehen sich zum
// Verwechseln ähnlich – ein Produkt kann mehrere Preise haben, deshalb sind
// es zwei Dinge. Wer das Produkt einträgt, bekommt hier seinen Standardpreis
// statt einer Absage; hat es keinen, sagt die Meldung genau das.
export async function preisAufloesen(stripeClient, id) {
  const kennung = String(id || "");
  if (!kennung.startsWith("prod_")) return kennung;
  const produkt = await stripeClient.products.retrieve(kennung, { expand: ["default_price"] });
  const standard = produkt?.default_price;
  const preis = typeof standard === "string" ? standard : standard?.id;
  if (!preis) {
    throw new Error(`STRIPE_PRICE_ID zeigt auf das Produkt ${kennung}, und das hat keinen Standardpreis. Im Stripe-Dashboard beim Produkt einen Preis anlegen – oder gleich dessen Kennung (price_…) eintragen.`);
  }
  return preis;
}

export function webhookGeheimnis() {
  const geheimnis = process.env.STRIPE_WEBHOOK_SECRET;
  if (!geheimnis) throw new Error("STRIPE_WEBHOOK_SECRET fehlt – die Unterschrift lässt sich nicht prüfen.");
  return geheimnis;
}

export function seitenUrl() {
  return String(process.env.SITE_URL || process.env.URL || "https://kids.alae.app").replace(/\/+$/, "");
}
