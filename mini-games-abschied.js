/*
 * Der Grabstein des alten Mini-Games-Service-Workers.
 * ---------------------------------------------------------------------------
 * Die Mini-Games sind ausgezogen: Sie stehen als eigene App unter
 * games.alae.app. Unter kids.alae.app/mini-games/ liegt nichts mehr – dort
 * leitet netlify.toml weiter.
 *
 * Eine Weiterleitung allein reicht aber nicht für den, der die Mini-Games
 * schon auf dem Startbildschirm hat. Auf seinem Gerät steht noch der alte
 * Service Worker, und der beantwortet jeden Aufruf von /mini-games/ aus
 * seinem eigenen Speicher: Er käme gar nicht bis zur Weiterleitung. Er
 * bliebe auch stehen – ein Service-Worker-Skript, das umgeleitet wird, gilt
 * dem Browser als Fehler, und bei einem Fehler behält er den alten.
 *
 * Deshalb wird er nicht gelöscht, sondern ersetzt: netlify.toml liefert
 * diese Datei unter seiner alten Adresse aus (status = 200, also ohne
 * Umleitung). Sie ist ein Service Worker, der genau eines tut – sich selbst
 * abräumen: seine Speicher leeren, die offenen Fenster wegschicken und sich
 * abmelden.
 *
 * Kein fetch-Ereignis: Ein Service Worker ohne fetch-Empfänger beantwortet
 * nichts, jeder Aufruf geht ans Netz – und damit in die Weiterleitung.
 *
 * Wenn sie eine Weile im Netz stand, kann sie weg. Sie kostet nichts, also
 * eilt es nicht.
 */
const CACHE_PRAEFIX = "lernapp-mini-";
// Die eigene alte Adresse, nicht die neue: Sie liegt auf demselben Server,
// und dort steht die Weiterleitung. Ein Fenster quer über die Adressgrenze zu
// schicken, ist nicht überall erlaubt – der Umweg über die Weiterleitung geht
// immer.
const HIER = "/mini-games/";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const namen = await caches.keys();
    await Promise.all(namen
      .filter((name) => name.startsWith(CACHE_PRAEFIX))
      .map((name) => caches.delete(name)));

    // Wer gerade davor sitzt, soll nicht auf eine leere Seite schauen.
    try { await self.clients.claim(); } catch { /* egal */ }
    const fenster = await self.clients.matchAll({ type: "window" });
    await Promise.all(fenster.map((f) => Promise.resolve()
      .then(() => f.navigate(HIER))
      .catch(() => { /* dann eben beim nächsten Laden */ })));

    // Zuletzt, damit das Aufräumen davor noch unter einer Anmeldung läuft.
    await self.registration.unregister();
  })());
});
