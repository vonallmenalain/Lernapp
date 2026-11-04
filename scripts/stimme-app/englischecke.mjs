/*
 * Die Englischecke auf Deutsch: was der Knopf DE sagt (die deutsche Seite
 * jedes Paars aus englisch-inhalt.js) und die Hilfe des Lautsprechers oben
 * links. Gesprochen mit der deutschen Stimme der App.
 *
 * Das Englische nimmt scripts/stimme-englisch-texte.mjs auf (eigene,
 * amerikanische Stimme). Darum stehen englisch-*.js und train-englischecke.js
 * nicht in der Liste der Dateien, deren Zeichenketten deutsch gesprochen
 * werden (stimme-app-texte.mjs, NICHT_GESPROCHEN): Ein englischer Satz würde
 * sonst auch mit der deutschen Stimme aufgenommen.
 */
import { englischInhalt, paare } from "../stimme-englisch-texte.mjs";

export default function texte() {
  const I = englischInhalt();
  const aus = paare(I).map((p) => ({ text: p.de, wo: `englisch-inhalt.js ${p.wo}`, teil: "daten" }));
  Object.entries(I.HILFE).forEach(([name, text]) => aus.push({ text, wo: `englisch-inhalt.js HILFE.${name}`, teil: "daten" }));
  return aus;
}
