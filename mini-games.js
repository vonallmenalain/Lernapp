/*
 * mini-games.js – Die Spiele allein, für alle, ohne Konto.
 * ---------------------------------------------------------------------------
 * Gripszug ist ein Zug: Ein Kind spielt, sein Wagen wächst, die Reise geht
 * weiter. Das hier ist das Gegenteil davon – ein einzelnes Spiel, ein Link,
 * eine Bestenliste, auf der alle stehen:
 *
 *     https://kids.alae.app/mini-games/turmbau
 *
 * Gedacht ist das zum Weitergeben. Man schickt den Link einem Freund, einem
 * Grosi, einer Klasse, und wer ihn öffnet, spielt sofort: kein Konto, keine
 * Anmeldung, keine Schranke, kein Zug, keine Wagen. Nur das Spiel und die
 * Frage, wer die höchste Zahl schafft.
 *
 * Welche Spiele es hier gibt, entscheidet der Adminbereich (Reiter "Spiele",
 * Haken "Mini-Game"). Die Liste steht in config/miniGames und wird beobachtet
 * wie das Wagen-Set: Ein neu angehaktes Spiel taucht auf, ohne dass jemand
 * etwas neu lädt.
 *
 * Drei Dinge macht diese Datei:
 *
 *   1. Auf einer Spielseite im Mini-Modus (body[data-mini]) baut sie die
 *      beiden Knöpfe oben links – "Zur App" und "Mini Games" – und den Block
 *      unter dem Ergebnis: Namensfeld, eigener Platz, Bestenliste.
 *   2. Das Fenster "Mini Games": alle freigegebenen Spiele, ihre Ranglisten,
 *      und der Weg in jedes davon.
 *   3. Die Übersichtsseite /mini-games: dieselben Spiele als Karten, dazu die
 *      Auswertung über alle Namen – wer den besten Durchschnittsrang hat, wer
 *      wie oft gespielt hat, wer wie viele Spiele oben steht.
 *
 * Was hier NICHT passiert: Nichts von dem, was ein Kind in der App erarbeitet
 * hat, wird angefasst. Der Mini-Modus schreibt keinen Fortschritt auf das
 * Gerät (game-cloud.js), zählt keine Schnupperrunde (entitlement.js) und
 * meldet keinen Besuch (firebase.js). Wer über einen Mini-Link hereinkommt,
 * hat die App nicht geöffnet – und so soll es in den Zahlen auch aussehen.
 *
 * Der Name gehört dem Gerät, nicht einem Konto: Er steht im localStorage und
 * wird beim nächsten Spiel wieder vorgeschlagen. Dazu eine Kennung (mini_…),
 * die das Gerät sich selbst gibt – sie sorgt dafür, dass ein Spieler je Spiel
 * eine Zeile hat und nicht zehn. Gespeichert wird beides in miniScores,
 * lesbar für alle (firestore.rules).
 *
 * Geladen auf: den Seiten unter mini-games/, und im Adminbereich (dort nur
 * für die Liste, welche Spiele überhaupt Mini-Games sein können).
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Welche Spiele Mini-Games sein können
  // ---------------------------------------------------------------------------
  // Nicht alle 25. Ein Mini-Game braucht genau eine Zahl, die grösser besser
  // ist – sonst gäbe es nichts zu vergleichen, und "eine Bestenliste" wäre ein
  // Versprechen ohne Inhalt. Das sind die Spiele mit Punkten (highscore.js,
  // art: "punkte") und gemeinsamer Bühne (game-shell.js): eine Runde, ein
  // Ergebnis, fertig.
  //
  // Die Spiele mit Sternen je Level (Memory, Weichen-Wirrwarr, Fässer) und die
  // Rätsel aus dem Levelkatalog (Arukone, Kakuro) bleiben draussen: Bei ihnen
  // hätten am Ende alle drei Sterne, und die Liste sagte nichts mehr.
  //
  // seite ist die Datei unter mini-games/ – und zugleich das letzte Stück der
  // Adresse, die man weitergibt. scripts/validate-mini-games.mjs hält diese
  // Tabelle mit entitlement.js und den Seiten unter mini-games/ zusammen.
  const SPIELE = [
    { id: "backpack", seite: "backpack" },
    { id: "beachTreasure", seite: "strandschatz" },
    { id: "tileMemory", seite: "kacheln" },
    { id: "missingItem", seite: "wasfehlt" },
    { id: "flanker", seite: "schwarmfokus" },
    { id: "fishPond", seite: "fischteich" },
    { id: "goSignal", seite: "signal" },
    { id: "cardMatch", seite: "kartenmerker" },
    { id: "leafFlow", seite: "blaetter" },
    { id: "towerStack", seite: "turmbau" },
    { id: "twinSpot", seite: "doppelt" },
    { id: "numberLine", seite: "zahlengleis" },
  ];

  // Die Farbe des Bereichs, dieselbe wie am Wagen und auf der Bühne des Spiels
  // (train-progress.js, AREAS). Hier steht sie ein zweites Mal, weil die
  // Mini-Seiten train-progress.js nicht laden – dort gibt es keinen Zug.
  const FARBEN = {
    gedaechtnis: { hell: "#7C5CE6", dunkel: "#5a41b8" },
    konzentration: { hell: "#00A5B5", dunkel: "#00707c" },
    geschwindigkeit: { hell: "#F5A623", dunkel: "#b9741a" },
    problemloesen: { hell: "#3FA34D", dunkel: "#2c7337" },
    zahlbuchstabe: { hell: "#E8543F", dunkel: "#a8321f" },
  };

  const NACH_ID = new Map(SPIELE.map((s) => [s.id, s]));
  const NACH_SEITE = new Map(SPIELE.map((s) => [s.seite, s]));

  const NAME_KEY = "lernapp.mini.name";
  const ID_KEY = "lernapp.mini.id";
  // Der eigene Bestwert je Spiel – dasselbe, was in der Liste steht, nur auf
  // dem Gerät. Wozu doppelt? Weil das Spiel selbst ihn braucht, und zwar
  // sofort: Turmbau sagt "Neuer Rekord!", wenn die Runde besser war als die
  // bisher beste. Im Mini-Modus legt game-cloud.js nichts ab (die Runde eines
  // Besuchers gehört nicht in den Spielstand des Kindes, dem das Gerät
  // gehört) – ohne diesen Eintrag wäre also jede erste Runde ein Rekord, und
  // ein Rekord, den es umsonst gibt, ist keiner.
  const BEST_KEY = "lernapp.mini.best";
  const NAME_MAX = 24;

  const cloud = () => window.LernappFirebase || null;
  const hs = () => window.LernappHighscore || null;

  // ---------------------------------------------------------------------------
  // Wo sind wir?
  // ---------------------------------------------------------------------------
  const koerper = () => document.body || null;
  const aktiv = () => koerper()?.dataset?.mini === "1";
  const istUebersicht = () => koerper()?.dataset?.page === "mini-hub";

  // Welches Spiel diese Seite spielt. Es steht am body der Seite unter
  // mini-games/ – nicht aus der Adresse geraten: Die Adresse ist das, was
  // jemand weitergibt, und sie darf sich ändern, ohne dass die Seite rät.
  function spielId() {
    const id = koerper()?.dataset?.miniSpiel || "";
    return NACH_ID.has(id) ? id : "";
  }

  // Adressen ab der Wurzel, nicht relativ: Diese Seite liegt eine Ebene tief
  // (/mini-games/turmbau), die Übersicht je nach Aufruf auf /mini-games oder
  // /mini-games/ – und "turmbau" hiesse von der einen aus /turmbau und von der
  // anderen /mini-games/turmbau. Ab der Wurzel heisst es überall dasselbe.
  const appLink = () => "/";
  const uebersichtLink = () => "/mini-games/";
  const spielLink = (id) => `/mini-games/${NACH_ID.get(id)?.seite || ""}`;
  // Zum Weitergeben, mit allem davor: Das ist die Zeile, die im Adminbereich
  // steht und die jemand in eine Nachricht kopiert.
  function teilLink(id) {
    const ort = typeof window !== "undefined" ? window.location : null;
    const basis = ort?.origin && ort.origin !== "null" ? ort.origin : "https://kids.alae.app";
    return `${basis}${spielLink(id)}`;
  }

  // ---------------------------------------------------------------------------
  // Name und Kennung – beides auf dem Gerät
  // ---------------------------------------------------------------------------
  // Der Name ist das, was in der Liste steht; die Kennung sorgt dafür, dass
  // derselbe Spieler je Spiel eine Zeile hat. Ohne localStorage (privates
  // Fenster) gilt beides nur für diese Sitzung – dann steht der Name eben
  // beim nächsten Spiel wieder leer da. Das ist besser, als gar nicht
  // mitspielen zu können.
  let kennungMerker = "";

  function sauberName(wert) {
    return String(wert || "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
  }

  let merkName = "";

  function name() {
    try {
      const gemerkt = localStorage.getItem(NAME_KEY);
      if (gemerkt !== null) return sauberName(gemerkt);
    } catch { /* privates Fenster */ }
    return sauberName(merkName);
  }

  function setzeName(wert) {
    const sauber = sauberName(wert);
    merkName = sauber;
    try { localStorage.setItem(NAME_KEY, sauber); } catch { /* privater Modus */ }
    return sauber;
  }

  function neueKennung() {
    const zufall = new Uint8Array(12);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(zufall);
    else for (let i = 0; i < zufall.length; i += 1) zufall[i] = Math.floor(Math.random() * 256);
    const zeichen = "abcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    zufall.forEach((n) => { text += zeichen[n % zeichen.length]; });
    return `mini_${text}`;
  }

  const gueltigeKennung = (wert) => /^mini_[A-Za-z0-9_-]{8,48}$/.test(String(wert || ""));

  // Nur nachsehen, nicht anlegen: Wer bloss die Übersicht ansieht, braucht
  // keine Kennung – und bekommt auch keine.
  function kennungFallsDa() {
    try { return localStorage.getItem(ID_KEY) || ""; } catch { return kennungMerker; }
  }

  function kennung() {
    try {
      const gemerkt = localStorage.getItem(ID_KEY);
      if (gueltigeKennung(gemerkt)) return gemerkt;
      const frisch = neueKennung();
      localStorage.setItem(ID_KEY, frisch);
      return frisch;
    } catch {
      if (!gueltigeKennung(kennungMerker)) kennungMerker = neueKennung();
      return kennungMerker;
    }
  }

  function bestwerte() {
    try {
      const roh = JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
      return roh && typeof roh === "object" ? roh : {};
    } catch { return {}; }
  }

  function merkeBestwert(spiel, punkte) {
    const zahl = Math.max(0, Math.round(Number(punkte) || 0));
    if (!spiel || !zahl) return;
    const alle = bestwerte();
    if ((Number(alle[spiel]) || 0) >= zahl) return;
    alle[spiel] = zahl;
    try { localStorage.setItem(BEST_KEY, JSON.stringify(alle)); } catch { /* privater Modus */ }
  }

  // Der Startstand für game-cloud.js: Was das Spiel für seinen eigenen
  // Vergleich braucht, und nichts weiter. Kein Spiel ohne Punktzahl und kein
  // Spiel, das hier gar nicht läuft, bekommt etwas.
  function startStand(leer) {
    const spiel = spielId();
    if (!spiel || !leer || !Array.isArray(leer.scores)) return null;
    const best = Math.max(0, Math.round(Number(bestwerte()[spiel]) || 0));
    return best ? { ...leer, runs: 0, scores: [best] } : null;
  }

  // ---------------------------------------------------------------------------
  // Die Spiele, die gerade offen sind
  // ---------------------------------------------------------------------------
  // Was der Admin angehakt hat, geschnitten mit dem, was hier überhaupt
  // möglich ist. Die Reihenfolge ist die von SPIELE – also die der Bereiche im
  // Zug, damit die Liste überall gleich aussieht.
  function freigegeben() {
    const offen = new Set(cloud()?.getMiniSpiele?.() || []);
    return SPIELE.filter((spiel) => offen.has(spiel.id)).map((spiel) => spiel.id);
  }

  const geladen = () => Boolean(cloud()?.isMiniSpieleLoaded?.());

  function titel(id) {
    return hs()?.titel?.(id) || id;
  }

  function einheit(id) {
    return hs()?.spiel?.(id)?.einheit || "Punkte";
  }

  function farbe(id) {
    const bereich = hs()?.spiel?.(id)?.bereich || "geschwindigkeit";
    return FARBEN[bereich] || FARBEN.geschwindigkeit;
  }

  // ---------------------------------------------------------------------------
  // Die Ergebnisse
  // ---------------------------------------------------------------------------
  // Gefragt wird je Spiel, und nur nach den freigegebenen: firebase.js stellt
  // eine Abfrage je Spiel (ohne Sortierung, die bräuchte einen
  // zusammengesetzten Index) und legt die Antworten zusammen. Sortiert wird
  // hier. Ein Spiel, das der Admin herausgenommen hat, wird gar nicht erst
  // gelesen – seine Ergebnisse bleiben stehen, zählen aber nirgends mit,
  // solange es nicht dabei ist.
  let zwischenspeicher = null;
  let zwischenspeicherMs = 0;
  let zwischenspeicherFuer = "";
  const FRISCH_MS = 20000;

  async function alleErgebnisse({ neu = false } = {}) {
    const spiele = freigegeben();
    const schluessel = spiele.join(",");
    // Der Zwischenspeicher gilt nur für dieselbe Frage: Hakt der Admin ein
    // Spiel dazu, wäre eine Antwort von vorhin eine falsche.
    if (!neu && zwischenspeicher && zwischenspeicherFuer === schluessel
      && Date.now() - zwischenspeicherMs < FRISCH_MS) return zwischenspeicher;
    const daten = await (cloud()?.miniErgebnisse?.(spiele) || Promise.resolve([]));
    zwischenspeicher = Array.isArray(daten) ? daten : [];
    zwischenspeicherMs = Date.now();
    zwischenspeicherFuer = schluessel;
    return zwischenspeicher;
  }

  // Ein Ergebnis je Person und Spiel – genauso, wie die Bestenliste der Gruppe
  // in der App eine Zeile je Kind zeigt. Wer denselben Namen auf zwei Geräten
  // einträgt, steht trotzdem einmal da: Es zählt sein bestes Ergebnis, und
  // seine Versuche werden zusammengezählt.
  function verdichte(eintraege) {
    const nachName = new Map();
    // Wer bin ich in dieser Liste? Die Kennung dieses Geräts, und sonst der
    // Name, der hier eingetragen wurde – wer denselben Namen auf dem Handy
    // und am Tablet nimmt, soll sich auf beiden wiederfinden.
    const meineKennung = kennungFallsDa();
    const meinName = name().toLocaleLowerCase("de");
    eintraege.forEach((roh) => {
      const schluessel = sauberName(roh.name).toLocaleLowerCase("de");
      if (!schluessel) return;
      const eintrag = {
        ...roh,
        eigen: Boolean((meineKennung && roh.spieler === meineKennung) || (meinName && schluessel === meinName)),
      };
      const bisher = nachName.get(schluessel);
      if (!bisher) {
        nachName.set(schluessel, { ...eintrag, name: sauberName(eintrag.name) });
        return;
      }
      bisher.versuche += Math.max(0, Number(eintrag.versuche) || 0);
      if ((Number(eintrag.punkte) || 0) > (Number(bisher.punkte) || 0)) {
        bisher.punkte = Number(eintrag.punkte) || 0;
        bisher.updatedAtMs = Number(eintrag.updatedAtMs) || 0;
        bisher.name = sauberName(eintrag.name);
      }
      // Die eigene Zeile bleibt die eigene, auch wenn das bessere Ergebnis von
      // einem anderen Gerät desselben Namens kommt.
      bisher.eigen = bisher.eigen || eintrag.eigen;
    });
    return [...nachName.values()];
  }

  // Die Rangfolge eines Spiels. Gleiche Punktzahl heisst gleicher Platz – und
  // der nächste überspringt so viele Plätze, wie sich geteilt haben. Wer
  // früher dort war, steht bei Gleichstand oben: Die Zahl war zuerst da.
  function rangliste(eintraege) {
    const liste = verdichte(eintraege).sort((a, b) =>
      (Number(b.punkte) || 0) - (Number(a.punkte) || 0)
      || (Number(a.updatedAtMs) || 0) - (Number(b.updatedAtMs) || 0)
      || a.name.localeCompare(b.name, "de"));

    let platz = 0;
    let vorher = null;
    liste.forEach((eintrag, index) => {
      if (!vorher || (Number(eintrag.punkte) || 0) !== (Number(vorher.punkte) || 0)) platz = index + 1;
      eintrag.platz = platz;
      vorher = eintrag;
    });
    return liste;
  }

  async function listeFuer(spiel, optionen = {}) {
    const alle = await alleErgebnisse(optionen);
    return rangliste(alle.filter((eintrag) => eintrag.game === spiel));
  }

  // Eine Runde ist zu Ende. Geschrieben wird immer beides: die Punktzahl, wenn
  // sie besser ist als die bisherige, und ein Versuch mehr. Ohne Namen wird
  // noch nichts geschrieben – dann steht erst das Feld da, und der Eintrag
  // entsteht, wenn jemand ihn haben will.
  // Nur den Namen ändern, ohne dass eine Runde daraus wird. Gibt es noch
  // keinen Eintrag, gilt der neue Name ab der nächsten Runde von selbst.
  async function benenneUm(spiel) {
    const wie = name();
    if (!wie || !spiel) return null;
    const ergebnis = await cloud()?.miniNameAendern?.({ game: spiel, spieler: kennung(), name: wie });
    zwischenspeicher = null;
    return ergebnis || null;
  }

  async function melde(spiel, punkte) {
    const wie = name();
    if (!wie) return null;
    const ergebnis = await cloud()?.miniSpeichern?.({
      game: spiel,
      spieler: kennung(),
      name: wie,
      punkte: Math.max(0, Math.round(Number(punkte) || 0)),
    });
    zwischenspeicher = null;
    // Der Bestwert kommt vom Server zurück, nicht aus der eben gespielten
    // Runde: Er weiss, was vorher schon dastand.
    if (ergebnis) merkeBestwert(spiel, ergebnis.punkte);
    return ergebnis || null;
  }

  // ---------------------------------------------------------------------------
  // Bausteine
  // ---------------------------------------------------------------------------
  function el(tag, klasse, text) {
    const knoten = document.createElement(tag);
    if (klasse) knoten.className = klasse;
    if (text !== undefined) knoten.textContent = text;
    return knoten;
  }

  function knopf(text, klasse, beiKlick) {
    const node = el("button", `mini-knopf ${klasse || ""}`.trim(), text);
    node.type = "button";
    node.addEventListener("click", beiKlick);
    return node;
  }

  function verweis(text, ziel, klasse) {
    const node = el("a", `mini-knopf ${klasse || ""}`.trim(), text);
    node.href = ziel;
    return node;
  }

  function zahlWort(anzahl, eins, viele) {
    return `${anzahl} ${anzahl === 1 ? eins : viele}`;
  }

  // Die Rangliste als Liste: Platz, Name, Zahl. Der eigene Eintrag ist
  // hervorgehoben – ohne das sucht man seinen Namen.
  //
  // Und er steht immer da, auch wenn er weit hinten liegt: Eine Liste, die
  // nur die ersten fünf zeigt, lässt genau den ohne Antwort, der am meisten
  // wissen will, wo er steht – den Sechsten. Zwischen den Ersten und ihm
  // steht dann eine Zeile mit drei Punkten, damit niemand die Plätze
  // dazwischen für ausgelassen hält.
  function listeBauen(eintraege, spiel, { max = 0 } = {}) {
    const wrap = el("ol", "mini-liste");
    let gezeigt = max ? eintraege.slice(0, max) : eintraege;
    const eigen = eintraege.find((eintrag) => eintrag.eigen);
    const nachgestellt = eigen && !gezeigt.includes(eigen);
    if (nachgestellt) gezeigt = [...gezeigt, eigen];
    if (!gezeigt.length) {
      const leer = el("li", "mini-liste-leer", "Noch niemand. Sei der Erste.");
      wrap.append(leer);
      return wrap;
    }
    gezeigt.forEach((eintrag, stelle) => {
      if (nachgestellt && stelle === gezeigt.length - 1 && gezeigt.length > 1) {
        const luecke = el("li", "mini-luecke", "···");
        luecke.setAttribute("aria-hidden", "true");
        wrap.append(luecke);
      }
      const zeile = el("li", `mini-zeile${eintrag.eigen ? " ist-ich" : ""}${eintrag.platz === 1 ? " ist-erster" : ""}`);
      zeile.append(el("span", "mini-platz", `${eintrag.platz}.`));
      zeile.append(el("span", "mini-name", eintrag.name));
      const wert = el("span", "mini-wert", String(eintrag.punkte));
      wert.append(el("small", "mini-einheit", ` ${einheit(spiel)}`));
      zeile.append(wert);
      zeile.append(el("span", "mini-versuche", zahlWort(Math.max(1, Number(eintrag.versuche) || 1), "Runde", "Runden")));
      wrap.append(zeile);
    });
    return wrap;
  }

  // ---------------------------------------------------------------------------
  // Das Fenster "Mini Games"
  // ---------------------------------------------------------------------------
  // Links die Spiele, rechts die Rangliste des gewählten. Von hier führt ein
  // Knopf in jedes Spiel und einer auf die Übersicht.
  let fenster = null;

  function schliesseFenster() {
    fenster?.remove();
    fenster = null;
    document.removeEventListener("keydown", aufEscape);
  }

  function aufEscape(ereignis) {
    if (ereignis.key === "Escape") schliesseFenster();
  }

  function oeffneFenster(vorauswahl) {
    schliesseFenster();
    const offen = freigegeben();
    const gewaehlt = offen.includes(vorauswahl) ? vorauswahl : (offen.includes(spielId()) ? spielId() : offen[0] || "");

    fenster = el("div", "mini-fenster");
    fenster.setAttribute("role", "dialog");
    fenster.setAttribute("aria-modal", "true");
    fenster.setAttribute("aria-label", "Mini-Games");
    fenster.addEventListener("click", (ereignis) => { if (ereignis.target === fenster) schliesseFenster(); });

    const tafel = el("div", "mini-tafel");
    const kopf = el("header", "mini-tafel-kopf");
    const titelBlock = el("div");
    titelBlock.append(el("p", "mini-marke", "Gripszug"), el("h2", "", "Mini-Games"));
    kopf.append(titelBlock);
    const zu = knopf("Schliessen", "mini-knopf-still", schliesseFenster);
    zu.setAttribute("aria-label", "Fenster schliessen");
    kopf.append(zu);
    tafel.append(kopf);

    if (!offen.length) {
      tafel.append(el("p", "mini-hinweis", geladen()
        ? "Gerade ist kein Spiel freigegeben. Schau später wieder vorbei."
        : "Die Spiele werden geladen..."));
      tafel.append(verweis("Zur App", appLink(), "mini-knopf-hell"));
      fenster.append(tafel);
      document.body.append(fenster);
      document.addEventListener("keydown", aufEscape);
      return;
    }

    const wahl = el("div", "mini-wahl");
    const inhalt = el("div", "mini-inhalt");
    tafel.append(wahl, inhalt);

    function zeige(spiel) {
      wahl.querySelectorAll("button").forEach((b) => b.classList.toggle("ist-an", b.dataset.spiel === spiel));
      inhalt.innerHTML = "";
      const f = farbe(spiel);
      inhalt.style.setProperty("--mini-farbe", f.hell);
      inhalt.style.setProperty("--mini-farbe-dunkel", f.dunkel);
      inhalt.append(el("h3", "mini-spieltitel", titel(spiel)));
      const laedt = el("p", "mini-hinweis", "Die Rangliste wird geladen...");
      inhalt.append(laedt);
      const knoepfe = el("div", "mini-tafel-aktionen");
      knoepfe.append(verweis("Spielen", spielLink(spiel), "mini-knopf-voll"));
      knoepfe.append(verweis("Alle Ergebnisse", uebersichtLink(), "mini-knopf-still"));
      inhalt.append(knoepfe);

      listeFuer(spiel).then((liste) => {
        if (!fenster) return;
        laedt.replaceWith(listeBauen(liste, spiel, { max: 10 }));
      }).catch(() => {
        if (fenster) laedt.textContent = "Die Rangliste ist gerade nicht zu haben.";
      });
    }

    offen.forEach((spiel) => {
      const b = knopf(titel(spiel), "mini-knopf-still", () => zeige(spiel));
      b.dataset.spiel = spiel;
      const f = farbe(spiel);
      b.style.setProperty("--mini-farbe", f.hell);
      wahl.append(b);
    });

    fenster.append(tafel);
    document.body.append(fenster);
    document.addEventListener("keydown", aufEscape);
    if (gewaehlt) zeige(gewaehlt);
  }

  // ---------------------------------------------------------------------------
  // Die Knöpfe oben links
  // ---------------------------------------------------------------------------
  // In der App stehen dort das Haus und der Weg zurück in die Auswahl. Hier
  // gibt es beides nicht: kein Zug, keine Bereiche. Stattdessen der Weg in die
  // App – für den, der mehr will – und die Liste der Mini-Games.
  function leiste() {
    const zurApp = verweis("Zur App", appLink(), "mini-knopf-hell");
    zurApp.title = "Zur App: kids.alae.app";
    const liste = knopf("Mini Games", "mini-knopf-voll", () => oeffneFenster(spielId()));
    liste.title = "Alle Mini-Games und ihre Ranglisten";
    return [zurApp, liste];
  }

  // ---------------------------------------------------------------------------
  // Der Block unter dem Ergebnis
  // ---------------------------------------------------------------------------
  // Drei Zustände, und sie folgen dem, was gerade passiert ist:
  //
  //   noch kein Name   ein Feld und ein Knopf. Erst wer seinen Namen einträgt,
  //                    steht in der Liste – vorher ist nichts geschrieben.
  //   Name steht       die Runde wird gleich gemeldet, danach steht der eigene
  //                    Platz da und darunter die Liste.
  //   Rekord           dasselbe, nur mit einem Wort dazu: Das ist der Moment,
  //                    für den der Link verschickt wurde.
  function ergebnis({ punkte }) {
    const spiel = spielId();
    const block = el("div", "mini-ergebnis");
    // Ohne Spiel und ohne Zahl gibt es nichts einzutragen. Beides kann nur
    // passieren, wenn jemand ein Spiel freigibt, das gar keine Punktzahl hat –
    // dann steht hier lieber nichts als ein Feld, das ins Leere schreibt.
    if (!spiel || !Number.isFinite(Number(punkte))) return block;

    const meldung = el("p", "mini-meldung");
    const listenWirt = el("div", "mini-listen-wirt");
    block.append(meldung, listenWirt);

    function zeigeListe(hervor) {
      listeFuer(spiel, { neu: true }).then((liste) => {
        const eigen = liste.find((eintrag) => eintrag.eigen);
        listenWirt.innerHTML = "";
        listenWirt.append(listeBauen(liste, spiel, { max: 5 }));
        if (hervor && eigen) {
          meldung.textContent = eigen.platz === 1
            ? `${eigen.name}, du stehst auf Platz 1!`
            : `${eigen.name}: Platz ${eigen.platz} von ${liste.length}.`;
        }
      }).catch(() => {
        listenWirt.textContent = "Die Rangliste ist gerade nicht zu haben.";
      });
    }

    // Diese Runde wird genau einmal gemeldet. Danach ändert "Name ändern" nur
    // noch den Namen: Wer sich umbenennt, hat nicht noch einmal gespielt – und
    // ein zweiter Aufruf von melde() zählte ihm einen Versuch an, den es nie
    // gab.
    let schonGemeldet = false;

    function melden() {
      if (schonGemeldet) { benennen(); return; }
      schonGemeldet = true;
      meldung.textContent = "Wird eingetragen...";
      melde(spiel, punkte)
        .then((stand) => {
          if (stand?.rekord) meldung.textContent = "Neue Bestzahl – eingetragen!";
          else meldung.textContent = "Eingetragen.";
          zeigeListe(true);
        })
        .catch(() => {
          // Angekommen ist nichts – dann ist die Runde auch nicht gemeldet,
          // und der nächste Anlauf darf es wieder versuchen, statt nur noch
          // umbenennen zu wollen.
          schonGemeldet = false;
          meldung.textContent = "Das Eintragen hat nicht geklappt. Die Runde zählt trotzdem.";
          zeigeListe(false);
        });
    }

    function benennen() {
      meldung.textContent = "Wird geändert...";
      benenneUm(spiel)
        .then((stand) => {
          // Ohne Eintrag gibt es nichts umzubenennen – der Name gilt dann ab
          // der nächsten Runde, und das steht auch so da.
          meldung.textContent = stand ? "Geändert." : "Der Name gilt ab der nächsten Runde.";
          zeigeListe(Boolean(stand));
        })
        .catch(() => {
          meldung.textContent = "Der neue Name konnte nicht gespeichert werden.";
          zeigeListe(false);
        });
    }

    function frageNamen(text) {
      const form = el("form", "mini-namensfeld");
      const feld = el("input");
      feld.type = "text";
      feld.maxLength = NAME_MAX;
      feld.placeholder = "Dein Name";
      feld.value = name();
      feld.setAttribute("aria-label", "Dein Name für die Bestenliste");
      feld.autocomplete = "nickname";
      const ab = el("button", "mini-knopf mini-knopf-voll", "Eintragen");
      ab.type = "submit";
      form.append(feld, ab);
      form.addEventListener("submit", (ereignis) => {
        ereignis.preventDefault();
        const gewaehlt = setzeName(feld.value);
        if (!gewaehlt) { feld.focus(); return; }
        form.replaceWith(el("p", "mini-name-steht", `Du spielst als ${gewaehlt}.`));
        melden();
      });
      meldung.textContent = text;
      block.insertBefore(form, listenWirt);
      zeigeListe(false);
    }

    if (name()) {
      const zeile = el("p", "mini-name-steht");
      zeile.append(document.createTextNode(`Du spielst als ${name()}. `));
      const aendern = knopf("Name ändern", "mini-knopf-klein", () => {
        zeile.remove();
        frageNamen("Wie sollen die anderen dich nennen?");
      });
      zeile.append(aendern);
      block.insertBefore(zeile, listenWirt);
      melden();
    } else {
      frageNamen("Trag deinen Namen ein, dann stehst du in der Liste.");
    }

    return block;
  }

  // Was der Lautsprecher nach der Runde sagt. In der App steht dort, wie weit
  // es noch bis zum fertigen Wagen ist – hier gibt es keinen Wagen.
  function ergebnisSprache({ punkte, label }) {
    const wort = String(label || "Punkte").replace(/^Deine?\s+/i, "");
    return `${punkte} ${wort}. Trag deinen Namen ein, dann stehst du in der Bestenliste.`;
  }

  // ---------------------------------------------------------------------------
  // Die Übersicht: /mini-games
  // ---------------------------------------------------------------------------
  // Zwei Fragen, und die zweite ist die, für die sich am Ende alle
  // interessieren: Welche Spiele gibt es – und wer ist der beste Spieler über
  // alle Spiele hinweg?
  //
  // "Der beste" ist dabei der Durchschnittsrang: Wer in drei Spielen Zweiter
  // ist, steht über dem, der in einem Erster und in zweien Letzter ist. Die
  // Summe der Punkte wäre sinnlos – 40 Blöcke in Turmbau und 40 Fische im
  // Fischteich sind nicht dasselbe.
  function auswertung(alle, offen) {
    const spieler = new Map();
    offen.forEach((spiel) => {
      const liste = rangliste(alle.filter((eintrag) => eintrag.game === spiel));
      liste.forEach((eintrag) => {
        const schluessel = eintrag.name.toLocaleLowerCase("de");
        if (!spieler.has(schluessel)) spieler.set(schluessel, { name: eintrag.name, spiele: 0, versuche: 0, plaetze: [], siege: 0, bester: null });
        const person = spieler.get(schluessel);
        person.spiele += 1;
        person.versuche += Math.max(1, Number(eintrag.versuche) || 1);
        person.plaetze.push(eintrag.platz);
        if (eintrag.platz === 1) person.siege += 1;
        if (person.bester === null || eintrag.platz < person.bester) person.bester = eintrag.platz;
      });
    });

    return [...spieler.values()].map((person) => ({
      ...person,
      schnitt: person.plaetze.reduce((summe, p) => summe + p, 0) / (person.plaetze.length || 1),
    })).sort((a, b) =>
      a.schnitt - b.schnitt || b.spiele - a.spiele || a.name.localeCompare(b.name, "de"));
  }

  function spielKarte(spiel, liste) {
    const f = farbe(spiel);
    const karte = el("article", "mini-karte");
    karte.style.setProperty("--mini-farbe", f.hell);
    karte.style.setProperty("--mini-farbe-dunkel", f.dunkel);

    const kopf = el("header", "mini-karte-kopf");
    kopf.append(el("h3", "", titel(spiel)));
    kopf.append(el("span", "mini-karte-zahl", liste.length
      ? zahlWort(liste.length, "Spieler", "Spieler")
      : "noch frei"));
    karte.append(kopf);

    karte.append(listeBauen(liste, spiel, { max: 3 }));

    const aktionen = el("div", "mini-karte-aktionen");
    aktionen.append(verweis("Spielen", spielLink(spiel), "mini-knopf-voll"));
    aktionen.append(knopf("Ganze Liste", "mini-knopf-still", () => oeffneFenster(spiel)));
    karte.append(aktionen);
    return karte;
  }

  function spielerTabelle(personen) {
    if (!personen.length) return el("p", "mini-hinweis", "Noch hat niemand gespielt. Der erste Name, der hier steht, könnte deiner sein.");
    const tabelle = el("table", "mini-tabelle");
    const kopf = el("thead");
    const kopfZeile = el("tr");
    [["Spieler", ""], ["Spiele", "zahl"], ["Ø Rang", "zahl"], ["Bester", "zahl"], ["Siege", "zahl"], ["Runden", "zahl"]]
      .forEach(([text, klasse]) => kopfZeile.append(el("th", klasse, text)));
    kopf.append(kopfZeile);
    tabelle.append(kopf);

    const koerperTeil = el("tbody");
    personen.forEach((person, index) => {
      const zeile = el("tr", index === 0 ? "ist-erster" : "");
      const namensZelle = el("td", "mini-tabelle-name");
      namensZelle.append(el("span", "mini-rangzahl", `${index + 1}`), el("span", "", person.name));
      zeile.append(namensZelle);
      zeile.append(el("td", "zahl", String(person.spiele)));
      zeile.append(el("td", "zahl", person.schnitt.toFixed(1).replace(".", ",")));
      zeile.append(el("td", "zahl", String(person.bester ?? "–")));
      zeile.append(el("td", "zahl", String(person.siege)));
      zeile.append(el("td", "zahl", String(person.versuche)));
      koerperTeil.append(zeile);
    });
    tabelle.append(koerperTeil);
    return tabelle;
  }

  function streifen(zahlen) {
    const wrap = el("div", "mini-streifen");
    zahlen.forEach(([wert, wort]) => {
      const kasten = el("div");
      kasten.append(el("strong", "", String(wert)), el("span", "", wort));
      wrap.append(kasten);
    });
    return wrap;
  }

  async function baueUebersicht(wirt) {
    wirt.innerHTML = "";

    // Kein Werbesatz und kein Vorspann: Wer hier ankommt, hat einen Link
    // angeklickt und weiss, warum. Was er sucht, sind die Spiele und die
    // Liste – der Name des Orts genügt darüber, und er ist zugleich die
    // Überschrift der Seite.
    const kopf = el("header", "mini-kopf");
    const text = el("div");
    text.append(el("h1", "mini-marke", "Gripszug · Mini-Games"));
    kopf.append(text);
    kopf.append(verweis("Zur App", appLink(), "mini-knopf-hell"));
    wirt.append(kopf);

    const laedt = el("p", "mini-hinweis", "Die Ergebnisse werden geladen...");
    wirt.append(laedt);

    let alle = [];
    try { alle = await alleErgebnisse({ neu: true }); }
    catch { laedt.textContent = "Die Ergebnisse sind gerade nicht zu haben. Probier es später noch einmal."; return; }

    const offen = freigegeben();
    laedt.remove();

    if (!offen.length) {
      wirt.append(el("p", "mini-hinweis", "Gerade ist kein Mini-Game freigegeben. In der App warten alle 25 Spiele auf dich."));
      return;
    }

    // alle enthält nur noch die freigegebenen Spiele (alleErgebnisse fragt gar
    // nicht nach den anderen) – die Zahl oben zählt also dasselbe, was
    // darunter als Karte und als Spieler dasteht.
    const runden = alle.reduce((summe, eintrag) => summe + Math.max(1, Number(eintrag.versuche) || 1), 0);
    const personen = auswertung(alle, offen);
    wirt.append(streifen([
      [offen.length, offen.length === 1 ? "Spiel" : "Spiele"],
      [personen.length, personen.length === 1 ? "Spieler" : "Spieler"],
      [runden, runden === 1 ? "Runde" : "Runden"],
    ]));

    const spieleBlock = el("section", "mini-block");
    spieleBlock.append(el("h2", "", "Die Spiele"));
    const karten = el("div", "mini-karten");
    offen.forEach((spiel) => {
      const liste = rangliste(alle.filter((eintrag) => eintrag.game === spiel));
      karten.append(spielKarte(spiel, liste));
    });
    spieleBlock.append(karten);
    wirt.append(spieleBlock);

    const leuteBlock = el("section", "mini-block");
    leuteBlock.append(el("h2", "", "Die Spieler"));
    leuteBlock.append(el("p", "mini-lead mini-lead-klein", "Ø Rang ist der Durchschnitt aller Plätze – wer überall weit vorn steht, steht auch hier oben. Pro Name zählt ein Ergebnis je Spiel."));
    leuteBlock.append(spielerTabelle(personen));
    wirt.append(leuteBlock);

    const fuss = el("footer", "mini-fuss");
    fuss.append(document.createTextNode("Die Mini-Games sind ein Ausschnitt aus Gripszug – Rätsel und Gehirntraining für Kinder. "));
    const mehr = el("a", "", "Mehr über Gripszug");
    mehr.href = "/willkommen.html";
    fuss.append(mehr, document.createTextNode("."));
    wirt.append(fuss);
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  // Die Übersicht wartet, bis die Liste der freigegebenen Spiele da ist –
  // sonst stünde dort einen Wimpernschlag lang "kein Spiel freigegeben", und
  // das wäre eine Lüge mit Anlauf.
  function starteUebersicht() {
    const wirt = document.querySelector("[data-mini-uebersicht]");
    if (!wirt) return;
    if (geladen()) { baueUebersicht(wirt); return; }
    let fertig = false;
    const los = () => {
      if (fertig) return;
      fertig = true;
      document.removeEventListener("lernapp:mini-spiele", los);
      baueUebersicht(wirt);
    };
    document.addEventListener("lernapp:mini-spiele", los);
    window.setTimeout(los, 6000);
  }

  window.LernappMini = {
    SPIELE,
    FARBEN,
    aktiv,
    spielId,
    spielLink,
    teilLink,
    uebersichtLink,
    kannMini: (id) => NACH_ID.has(id),
    seiteVon: (id) => NACH_ID.get(id)?.seite || "",
    spielZuSeite: (seite) => NACH_SEITE.get(seite)?.id || "",
    freigegeben,
    name,
    setzeName,
    kennung,
    listeFuer,
    rangliste,
    startStand,
    auswertung,
    leiste,
    ergebnis,
    ergebnisSprache,
    oeffneFenster,
  };

  if (istUebersicht()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", starteUebersicht);
    else starteUebersicht();
  }
})();
