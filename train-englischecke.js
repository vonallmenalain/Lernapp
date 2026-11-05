/*
 * train-englischecke.js – Der Englischwagen: Rocco, der Waschbär, spricht
 * amerikanisches Englisch (Puck, englisch-stimme.js).
 *
 * Gebaut wird der Wagen im gemeinsamen Kern (sprachwagen.js); hier steht nur,
 * was am Englischwagen eigen ist: Inhalt (englisch-inhalt.js), Zeichnungen
 * (englisch-art.js …), Stand (englisch-stand.js), Spiele (englisch-spiele.js
 * …) und die Ids der Schranke (entitlement.js, ENGLISCHECKE).
 */
(() => {
  "use strict";

  // Die Spiele für die Schranke (entitlement.js, ENGLISCHECKE): Der Bauernhof
  // und die erste Geschichte sind immer frei, sonst je eine Runde.
  const SPIEL = {
    entdecken: "en-entdecken", hearfind: "en-hearfind", geschichte: "en-geschichten",
    // Etappe 2
    memory: "en-memory", janein: "en-janein", roccosays: "en-roccosays", farbenzug: "en-farbenzug",
    zaehlen: "en-zaehlen", fuettern: "en-fuettern", verse: "en-verse", buch: "en-buecher",
    // Etappe 3 (die Post ist ein Geschenk und immer offen)
    whatsmissing: "en-whatsmissing", dressup: "en-dressup", geschichtenzug: "en-geschichtenzug", diner: "en-diner",
    telefon: "en-telefon", echo: "en-echo",
    // Etappe 4
    monster: "en-monster", wokatze: "en-wokatze", gegenteile: "en-gegenteile", wortbild: "en-wortbild",
  };
  const IMMER_FREI = { entdecken: ["farm"], geschichte: ["ball"], verse: ["hello"], buch: ["hase-rueebli"] };

  const erzeuge = window.LernappSprachwagen?.erzeuge;
  if (!erzeuge) return;
  window.LernappEnglischecke = erzeuge({
    id: "englisch",
    sprache: "en",
    spracheName: "Englisch",
    art: () => window.LernappEnglischArt,
    stand: () => window.LernappEnglischStand,
    inhalt: () => window.LernappEnglischInhalt,
    spiele: () => window.LernappEnglischSpiele,
    SPIEL,
    IMMER_FREI,
    KOPF: { entdecken: "LOOKOUT", spiele: "TOYS", verse: "JUKEBOX", telefon: "PHONE" },
    GANZE_GESCHICHTE: "Whole story",
    gesehenKey: "lernapp.englisch.gesehen",
  });
})();
