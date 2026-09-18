/*
 * Die Familie verbinden, damit Geschwister die Züge der anderen sehen.
 * ---------------------------------------------------------------------------
 *   POST /api/familie   {}   mit Bearer-Token eines Kontos der Familie
 *   → { gruppe, kinder, geaendert }
 *
 * Der Client ruft das von selbst an, wenn ein Konto zu einer Familie gehört,
 * aber noch keine Gruppe trägt – bei Konten aus der Zeit vor dieser Funktion
 * also genau einmal. Neue Kinder bekommen die Gruppe schon beim Anlegen.
 *
 * Anrufen darf jedes Konto der Familie, auch ein Kind: Es kann damit nichts
 * erreichen, was die Eltern nicht ohnehin wollen – die Gruppe steht fest
 * (familie-<uid der Eltern>), und wer nicht dazugehört, kommt nicht hinein.
 */

import { anrufer, antwort, fehlerAntwort, nurMethode } from "./_lib/anfrage.mjs";
import { db } from "./_lib/firebase.mjs";
import { familieVerbinden, familieVon } from "./_lib/familie.mjs";

export default async (request) => {
  try {
    nurMethode(request, "POST");
    const wer = await anrufer(request);
    const elternUid = await familieVon(wer);
    if (!elternUid) return antwort({ gruppe: null, kinder: 0, geaendert: 0, grund: "keine Familie" });
    const ergebnis = await familieVerbinden(elternUid);
    // Die eigene Gruppe zurückgeben, frisch gelesen: Der Client setzt sie
    // damit sofort und lädt die Züge der Geschwister, ohne sich neu
    // anzumelden. Ein Elternkonto ist nicht in der Gruppe und bekommt null.
    const eigen = (await db().collection("users").doc(wer.uid).get()).data()?.group || null;
    return antwort({ gruppe: eigen, kinder: ergebnis.kinder, geaendert: ergebnis.geaendert });
  } catch (fehler) {
    return fehlerAntwort(fehler);
  }
};

export const config = { path: "/api/familie" };
