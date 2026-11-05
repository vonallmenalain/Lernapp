/*
 * franzoesisch-stand.js – Was ein Kind im Französischwagen schon kann.
 *
 * Derselbe Stand wie im Englischwagen (englisch-stand.js,
 * window.LernappSprachStand.erzeuge), mit eigenem Kasten im Spielstand
 * (lernapp.franzoesisch) und eigener Einstellung der Eltern
 * (lernapp.franzoesisch.eltern: Schrift und Tempo der französischen Stimme).
 */
(() => {
  "use strict";
  if (!window.LernappSprachStand?.erzeuge) return;
  // Was in der Romandie anders heisst als in Frankreich (für den Bericht):
  // nur Wörter, die im Wagen vorkommen.
  window.LernappFranzoesischStand = window.LernappSprachStand.erzeuge({
    key: "lernapp.franzoesisch",
    elternKey: "lernapp.franzoesisch.eltern",
    inhalt: () => window.LernappFranzoesischInhalt,
    ereignis: "lernapp:franzoesisch-einstellungen",
    varianten: [
      ["backpack", "le sac d'école (in Frankreich: le cartable)"],
      ["schoolbus", "le car scolaire (in der Romandie auch: le bus scolaire)"],
      ["sneakers", "les baskets (in der Romandie auch: les espadrilles)"],
    ],
  });
})();
