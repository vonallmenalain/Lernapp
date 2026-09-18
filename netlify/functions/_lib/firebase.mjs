/*
 * Firebase Admin für die Netlify-Funktionen.
 * ---------------------------------------------------------------------------
 * Das Admin-SDK schreibt an firestore.rules vorbei – genau dafür ist es hier:
 * entitlements/{uid} und die Familienfelder darf kein Client schreiben, nur
 * der Server. Der Schlüssel dafür liegt als Umgebungsvariable bei Netlify,
 * FIREBASE_SERVICE_ACCOUNT, als JSON im Klartext (dasselbe Format wie das
 * Secret des Deploy-Workflows, aber ein eigenes Konto mit eigenen Rechten:
 * Cloud Datastore User und Firebase Authentication Admin, nicht Rules Admin).
 *
 * Gegen den Emulator braucht es keinen Schlüssel: Sind FIRESTORE_EMULATOR_HOST
 * und FIREBASE_AUTH_EMULATOR_HOST gesetzt, reicht die Projekt-ID. So laufen
 * die Prüfskripte ohne Netz und ohne Geheimnis.
 */

import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const PROJEKT_ID = process.env.FIREBASE_PROJECT_ID || "lernapp-8d944";

function app() {
  if (getApps().length) return getApp();
  const imEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);
  const roh = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!roh) {
    if (!imEmulator) throw new Error("FIREBASE_SERVICE_ACCOUNT fehlt – der Server kann nicht mit Firebase reden.");
    // Gegen den Emulator ohne Schlüssel: Der Emulator nimmt "owner" als
    // Zugangs-Token. Für die Auth-API reicht das; Firestore verlangt aber ein
    // Zertifikat, deshalb geben die Prüfskripte einen Wegwerf-Schlüssel mit
    // (scripts/test-functions.mjs) und landen im Zweig darunter.
    const attrappe = { getAccessToken: async () => ({ access_token: "owner", expires_in: 3600 }) };
    return initializeApp({ projectId: process.env.GCLOUD_PROJECT || PROJEKT_ID, credential: attrappe });
  }

  let schluessel;
  try { schluessel = JSON.parse(roh); } catch { throw new Error("FIREBASE_SERVICE_ACCOUNT ist kein gültiges JSON (base64 statt Klartext?)."); }
  if (schluessel.type !== "service_account") throw new Error("FIREBASE_SERVICE_ACCOUNT ist kein Dienstkonto-Schlüssel.");
  // Im Emulator gilt die Projekt-ID des Emulators, nicht die im Schlüssel:
  // sonst schriebe der Test in ein Projekt, das der Emulator nicht kennt.
  const projectId = imEmulator ? (process.env.GCLOUD_PROJECT || PROJEKT_ID) : (schluessel.project_id || PROJEKT_ID);
  return initializeApp({ credential: cert(schluessel), projectId });
}

export const auth = () => getAuth(app());
export const db = () => getFirestore(app());
export { FieldValue };
