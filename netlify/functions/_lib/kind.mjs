/*
 * Wie ein Kinderkonto heisst – dieselbe Rechnung wie im Client.
 * ---------------------------------------------------------------------------
 * Ein Kind meldet sich mit Name und Passwort an. Firebase kennt aber nur
 * E-Mail-Adressen und Passwörter ab sechs Zeichen. Deshalb macht der Client
 * (firebase.js) beim Anmelden aus dem Namen eine technische Adresse und
 * hängt ans Passwort eine feste Endung. Wer das Konto ANLEGT – jetzt der
 * Server –, muss genau dieselbe Adresse und dasselbe Passwort erzeugen,
 * sonst kann sich das Kind nie anmelden.
 *
 * Diese drei Funktionen sind deshalb Zeile für Zeile die aus firebase.js:
 * loginSlug, technicalEmailFromName, childPassword. scripts/test-functions.mjs
 * prüft, dass beide Seiten für dieselben Namen dasselbe ergeben.
 */

export const KIND_DOMAIN = "lernapp.local";
export const PASSWORT_ENDUNG = "::lernapp";
export const MIN_KIND_PASSWORT = 4;
export const MAX_KINDER = 4;

export function sauberName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function loginSlug(value) {
  return sauberName(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function technischeAdresse(name) {
  const slug = loginSlug(name);
  if (!slug) return null;
  return `${slug}@${KIND_DOMAIN}`;
}

export function kindPasswort(passwort) {
  const p = String(passwort || "");
  if (p.length < MIN_KIND_PASSWORT) return null;
  return `${p}${PASSWORT_ENDUNG}`;
}

export function istTechnischeAdresse(email) {
  return String(email || "").toLowerCase().endsWith(`@${KIND_DOMAIN}`);
}
