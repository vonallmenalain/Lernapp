/*
 * bau-stimme.js – Was die Bauecke sagt, als Aufnahme mit einer Stimme von
 * Google (Chirp 3 HD).
 *
 * Wie lesen-stimme.js, nur für die Bauecke: Gibt es zu einem Satz eine
 * Aufnahme, spielt kids.js sie (aufnahmeStuecke), sonst spricht die
 * Gerätestimme. Kommt nach lesen-stimme.js und ergänzt dessen Verzeichnis.
 * Welche Sätze dazugehören, steht in scripts/stimme-bau-texte.mjs.
 *
 * Nicht von Hand ändern: scripts/stimme-google.mjs schreibt diese Datei.
 */
window.LernappStimmeDateien = Object.assign(window.LernappStimmeDateien || {}, {});
