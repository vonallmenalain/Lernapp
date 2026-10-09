/*
 * app-stimme.js – Was die App sagt, als Aufnahme mit einer Stimme von Google
 * (Chirp 3 HD, de-DE-Chirp3-HD-Sulafat).
 *
 * Wie bau-stimme.js für die Bauecke, hier für alle Seiten mit kids.js: Gibt
 * es zu einem Satz eine Aufnahme, spielt kids.js sie (aufnahmeStuecke), sonst
 * spricht die Gerätestimme. Kommt nach lesen-stimme.js und ergänzt dessen
 * Verzeichnis; wo beide denselben Satz kennen, gilt dieser.
 * Welche Sätze dazugehören, steht in scripts/stimme-app-texte.mjs.
 *
 * Nicht von Hand ändern: scripts/stimme-google.mjs schreibt diese Datei.
 */
window.LernappStimmeDateien = Object.assign(window.LernappStimmeDateien || {}, {});
