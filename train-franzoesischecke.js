/*
 * train-franzoesischecke.js – Der Französischwagen: Margot, la marmotte,
 * spricht Französisch (Aoede, franzoesisch-stimme.js).
 *
 * Gebaut wird der Wagen im gemeinsamen Kern (sprachwagen.js), wie der
 * Englischwagen; hier steht nur, was am Französischwagen eigen ist: Inhalt
 * (franzoesisch-inhalt.js), Margot und der Panorama-Bistrowagen
 * (franzoesisch-art.js, sonst die Zeichnungen des Englischwagens), Margots
 * gemalte Geschichten (franzoesisch-gemalt.js), der Stand
 * (franzoesisch-stand.js) und die Ids der Schranke (entitlement.js,
 * FRANZOESISCHECKE). Die Spiele sind dieselben (englisch-spiele*.js).
 */
(() => {
  "use strict";

  // Die Spiele für die Schranke (entitlement.js, FRANZOESISCHECKE): der
  // Bauernhof, die erste Geschichte, der erste Vers und das erste Buch sind
  // immer frei, sonst je eine Runde. Die Post von Lou ist ein Geschenk und
  // immer offen.
  const SPIEL = {
    entdecken: "fr-entdecken", hearfind: "fr-hearfind", geschichte: "fr-geschichten",
    memory: "fr-memory", janein: "fr-janein", roccosays: "fr-jacquesadit", farbenzug: "fr-farbenzug",
    zaehlen: "fr-zaehlen", fuettern: "fr-gouter", verse: "fr-verse", buch: "fr-buecher",
    whatsmissing: "fr-wasfehlt", dressup: "fr-habille", geschichtenzug: "fr-geschichtenzug", diner: "fr-boulangerie",
    telefon: "fr-telefon", echo: "fr-echo",
    monster: "fr-monster", wokatze: "fr-wokatze", gegenteile: "fr-contraires", wortbild: "fr-wortbild",
  };
  const IMMER_FREI = { entdecken: ["farm"], geschichte: ["ball"], verse: ["bonjour"], buch: ["hase-rueebli"] };

  const erzeuge = window.LernappSprachwagen?.erzeuge;
  if (!erzeuge || !window.LernappFranzoesischArt) return;
  window.LernappFranzoesischecke = erzeuge({
    id: "franzoesisch",
    sprache: "fr",
    spracheName: "Französisch",
    art: () => window.LernappFranzoesischArt,
    stand: () => window.LernappFranzoesischStand,
    inhalt: () => window.LernappFranzoesischInhalt,
    spiele: () => window.LernappEnglischSpiele,
    SPIEL,
    IMMER_FREI,
    KOPF: { entdecken: "PANORAMA", spiele: "JOUETS", verse: "COMPTINES", telefon: "ALLÔ" },
    GANZE_GESCHICHTE: "Toute l'histoire",
    gesehenKey: "lernapp.franzoesisch.gesehen",
    maskottchen: window.LernappFranzoesischArt.MASKOTTCHEN,
    gemalt: () => window.LernappFranzoesischGemalt || null,
    schrift: (text) => window.LernappFranzoesischInhalt?.schrift?.(text) ?? text,
  });
})();
