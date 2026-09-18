/*
 * Was jede Funktion braucht: den Anrufer kennen, JSON lesen, JSON antworten.
 * ---------------------------------------------------------------------------
 * Der Client schickt sein Firebase-ID-Token als "Authorization: Bearer …".
 * Das Admin-SDK prüft es – Unterschrift, Ablauf, Projekt – und sagt, wer da
 * ist. Ohne gültiges Token gibt es 401, und keine Funktion tut etwas.
 *
 * Nur Elternkonten dürfen kaufen und Kinder anlegen. Ob ein Konto eines ist,
 * entscheidet die Adresse: eine technische (@lernapp.local) gehört einem
 * Kind. Dieselbe Regel wie im Client (firebase.js, isTechnicalEmail).
 */

import { auth } from "./firebase.mjs";
import { istTechnischeAdresse } from "./kind.mjs";

export class AnfrageFehler extends Error {
  constructor(status, code, nachricht) {
    super(nachricht || code);
    this.status = status;
    this.code = code;
  }
}

export function antwort(daten, status = 200) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function fehlerAntwort(fehler) {
  if (fehler instanceof AnfrageFehler) return antwort({ error: fehler.code, message: fehler.message }, fehler.status);
  console.error(fehler);
  return antwort({ error: "server", message: "Auf dem Server ist etwas schiefgegangen." }, 500);
}

export async function liesJson(request) {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch {
    throw new AnfrageFehler(400, "bad-json", "Der Anfrage fehlt gültiges JSON.");
  }
}

// Wer ruft an? Gibt {uid, email, istEltern} zurück oder wirft 401.
export async function anrufer(request) {
  const kopf = request.headers.get("authorization") || "";
  const token = kopf.startsWith("Bearer ") ? kopf.slice(7).trim() : "";
  if (!token) throw new AnfrageFehler(401, "not-signed-in", "Nicht angemeldet.");
  let decoded;
  try {
    decoded = await auth().verifyIdToken(token);
  } catch {
    throw new AnfrageFehler(401, "bad-token", "Die Anmeldung ist abgelaufen. Bitte neu anmelden.");
  }
  const email = String(decoded.email || "").toLowerCase();
  return { uid: decoded.uid, email, istEltern: Boolean(email) && !istTechnischeAdresse(email) };
}

export async function elternAnrufer(request) {
  const wer = await anrufer(request);
  if (!wer.istEltern) throw new AnfrageFehler(403, "parents-only", "Das kann nur ein Elternkonto.");
  return wer;
}

export function nurMethode(request, methode) {
  if (request.method !== methode) throw new AnfrageFehler(405, "method", `Nur ${methode}.`);
}
