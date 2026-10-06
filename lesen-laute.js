/*
 * lesen-laute.js – Die aufgenommenen Laute der Leseecke.
 *
 * Noch leer: Die Laute spricht eine echte Stimme ein. Dafür kommen als
 * Nächstes eine Anleitung (docs/LAUTE-AUFNEHMEN.md) und eine Aufnahmeseite
 * (laute-aufnehmen.html), die genau diese Datei erzeugt – mit einem Eintrag
 * je Laut, als Daten-Adresse:
 *
 *   window.LernappLauteAufnahmen = { m: "data:audio/wav;base64,…", a: "…", … };
 *
 * Solange ein Laut fehlt, spricht lesen-ton.js die Selbstlaute mit der
 * Sprachausgabe und lässt die übrigen stumm, statt «Em» zu sagen.
 */
window.LernappLauteAufnahmen = window.LernappLauteAufnahmen || {};
