/*
 * Stripe für die Netlify-Funktionen.
 * ---------------------------------------------------------------------------
 * Drei Umgebungsvariablen bei Netlify, alle aus dem Stripe-Dashboard:
 *
 *   STRIPE_SECRET_KEY       der geheime Schlüssel (sk_live_… oder sk_test_…)
 *   STRIPE_WEBHOOK_SECRET   das Signiergeheimnis des Webhook-Endpunkts
 *                           (whsec_…), damit niemand uns Zahlungen vorspielt
 *   STRIPE_PRICE_ID         der Preis des Einmalkaufs (price_…)
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

export function webhookGeheimnis() {
  const geheimnis = process.env.STRIPE_WEBHOOK_SECRET;
  if (!geheimnis) throw new Error("STRIPE_WEBHOOK_SECRET fehlt – die Unterschrift lässt sich nicht prüfen.");
  return geheimnis;
}

export function seitenUrl() {
  return String(process.env.SITE_URL || process.env.URL || "https://kids.alae.app").replace(/\/+$/, "");
}
