/*
 * Die Französischecke auf Deutsch: was der Knopf DE sagt (die deutsche Seite
 * jedes Paars aus franzoesisch-inhalt.js) und die Hilfe des Lautsprechers oben
 * links. Gesprochen mit der deutschen Stimme der App.
 *
 * Das Französische nimmt scripts/stimme-franzoesisch-texte.mjs auf (eigene,
 * französische Stimme). Darum stehen franzoesisch-*.js und
 * train-franzoesischecke.js nicht in der Liste der Dateien, deren
 * Zeichenketten deutsch gesprochen werden (stimme-app-texte.mjs,
 * NICHT_GESPROCHEN).
 */
import { franzoesischInhalt, paare } from "../stimme-franzoesisch-texte.mjs";

export default function texte() {
  const I = franzoesischInhalt();
  const aus = paare(I).map((p) => ({ text: p.de, wo: `franzoesisch-inhalt.js ${p.wo}`, teil: "daten" }));
  Object.entries(I.HILFE).forEach(([name, text]) => aus.push({ text, wo: `franzoesisch-inhalt.js HILFE.${name}`, teil: "daten" }));
  return aus;
}
