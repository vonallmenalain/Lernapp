/*
 * entitlement.js – Was frei ist, was gekauft werden muss, und das Tor davor.
 * ---------------------------------------------------------------------------
 * Gripszug ist zum Anfangen gratis und zum Weiterspielen gekauft. Die Grenze
 * liegt so, dass ein Kind alles einmal gesehen hat, bevor sie kommt:
 *
 *   frei     die erste Karte der Reise (Stationen 1 bis 10),
 *            und von jedem der 25 Spiele eine Runde.
 *   gekauft  alles andere – die Karten 2 bis 13, und jedes Spiel ab der
 *            zweiten Runde.
 *
 * Eine Runde ist gespielt, wenn sie zu Ende ist: bei den Spielen mit Bühne,
 * wenn das Ergebnis dasteht (game-shell.js), bei denen mit Levelwahl, wenn
 * ein Level geschafft ist (app.js). Wer abbricht, hat seine Runde noch. Und
 * was auf der Reise gespielt wird, zählt nicht mit: Die erste Karte ist frei,
 * und sie soll nicht die Schnupperrunden aufbrauchen.
 *
 * Gezählt wird auf dem Gerät (localStorage), nicht am Konto. Das ist Absicht:
 * Die Schranke ist eine für Eltern, nicht für Hacker – ein zweites Gerät gibt
 * einem Kind noch einmal 25 Runden, und wer bis dahin nicht gekauft hat,
 * kauft auch dann nicht.
 *
 * Wer frei ist, entscheidet firebase.js: Das Konto hat einen Kauf
 * (entitlements/{uid}, den der Server nach der Zahlung schreibt), oder es ist
 * ein Konto aus der Zeit vor dem Kauf – ein Kind ohne Elternkonto. Ein Gast
 * ohne Konto bekommt den freien Teil, mehr nicht.
 *
 * Die Schranke ist eine für Eltern, nicht für Hacker: Die Level liegen ohnehin
 * in der App. Deshalb prüft sie der Client, und der Server schützt nur den
 * Kauf selbst (kein Client kann sich einen schreiben). Wer die Konsole öffnet,
 * kommt durch – der hätte nie bezahlt.
 *
 * Und sie sperrt nie, bevor sie weiss, wen sie vor sich hat: Beim Laden einer
 * Seite holt Firebase die gespeicherte Anmeldung erst aus dem Speicher, und
 * bis dahin sieht jedes angemeldete Kind aus wie ein Gast. Wer in diesem
 * Moment sperrte, zeigte einem Kind mit Gründer-Zugang – dem alles gehört –
 * das Tor, und zwar bei jedem Öffnen. Deshalb fragt niemand targetFree()
 * direkt beim Laden, sondern targetLocked(): die Antwort kommt, sobald der
 * Kontostand feststeht (isLoaded). Und ein Tor, das trotzdem einmal steht,
 * geht von selbst wieder auf, sobald sein Ziel frei ist.
 *
 * Das Tor sieht das Kind, nicht den Preis: Der Zug steht vor einer Schranke,
 * und der Satz sagt, dass die Eltern sie öffnen. Dahinter liegt ein kleines
 * Rechenrätsel, das ein Kind mit vier Jahren nicht löst – und erst danach,
 * für den Erwachsenen, der es gelöst hat, der Preis: was Gripszug kostet, was
 * dazugehört, und der kürzeste Weg an die Kasse (firebase.js, openKauf).
 *
 * Wird nach firebase.js und train-progress.js geladen, vor app.js,
 * game-shell.js und train-home.js.
 */
(() => {
  "use strict";

  const STATIONS_FREE = 10;
  // Eine Runde je Spiel. Die Zahl steht hier, damit sie sich ändern lässt,
  // ohne den Rest zu lesen.
  const GRATIS_RUNDEN = 1;
  const RUNDEN_KEY = "lernapp.gratis.runden";

  const cloud = () => window.LernappFirebase || null;
  const kids = () => window.LernappKids || null;

  // Die Bereiche und ihre Spiele in der Reihenfolge der Häuser. Gebraucht
  // wird sie, um von einer Seite (memory.html) auf ein Spiel (memory) zu
  // kommen. Es ist dieselbe Tabelle wie AREAS in train-progress.js,
  // auf die Kennungen gekürzt – die Spielseiten laden train-progress.js
  // nicht, und die Schranke muss auch dort wissen, welches Spiel sie vor sich
  // hat.
  // scripts/validate-schranke.mjs hält beide Tabellen gleich.
  const AREAS = [
    { id: "gedaechtnis", games: [
      { id: "backpack", page: "backpack.html", ownProgress: "backpack" },
      { id: "memory", page: "memory.html", ownProgress: "memory" },
      { id: "beachTreasure", page: "strandschatz.html", ownProgress: "beachTreasure" },
      { id: "tileMemory", page: "kacheln.html", ownProgress: "tileMemory" },
      { id: "missingItem", page: "wasfehlt.html", ownProgress: "missingItem" },
    ] },
    { id: "konzentration", games: [
      { id: "flanker", page: "schwarmfokus.html", ownProgress: "flanker" },
      { id: "trackRouter", page: "weichen.html", ownProgress: "trackRouter" },
      { id: "fishPond", page: "fischteich.html", ownProgress: "fishPond" },
      { id: "gridlock", page: "freiefahrt.html", ownProgress: "gridlock" },
      { id: "goSignal", page: "signal.html", ownProgress: "goSignal" },
    ] },
    { id: "geschwindigkeit", games: [
      { id: "tiersprung", page: "tiersprung.html", ownProgress: "runner" },
      { id: "cardMatch", page: "kartenmerker.html", ownProgress: "cardMatch" },
      { id: "leafFlow", page: "blaetter.html", ownProgress: "leafFlow" },
      { id: "towerStack", page: "turmbau.html", ownProgress: "towerStack" },
      { id: "twinSpot", page: "doppelt.html", ownProgress: "twinSpot" },
    ] },
    { id: "problemloesen", games: [
      { id: "spatialPuzzle", page: "raumdetektiv.html", ownProgress: "spatial" },
      { id: "arukone", page: "arukone.html" },
      { id: "bimaru", page: "bimaru.html" },
      { id: "shikaku", page: "shikaku.html" },
      { id: "craneStack", page: "faesser.html", ownProgress: "craneStack" },
    ] },
    { id: "zahlbuchstabe", games: [
      { id: "letterPuzzle", page: "buchstaben.html" },
      { id: "readingPuzzle", page: "wortdetektiv.html" },
      { id: "kakuro", page: "kakuro.html" },
      { id: "hidoku", page: "hidoku.html" },
      { id: "numberLine", page: "zahlengleis.html", ownProgress: "numberLine" },
    ] },
  ];

  // ---------------------------------------------------------------------------
  // Wer ist frei?
  // ---------------------------------------------------------------------------
  // "gekauft"   das Konto hat einen aktiven Kauf
  // "gruender"  ein Kind ohne Elternkonto – von vor dem Kauf
  // "gast"      niemand angemeldet
  // "offen"     ein Konto ohne Kauf: die Eltern haben noch nicht gekauft, oder
  //             ein Elternkonto spielt selbst
  function reason() {
    const c = cloud();
    if (!c?.isSignedIn?.()) return "gast";
    const e = c.getEntitlement?.();
    if (e?.active) return "gekauft";
    if (c.getRole?.() === "child" && !c.getParentUid?.()) return "gruender";
    return "offen";
  }

  // Die Mini-Games (mini-games.js) liegen neben der App, nicht in ihr: ein
  // Link, den jemand weitergibt, eine Runde, eine offene Bestenliste. Dort gibt
  // es nichts zu kaufen und also auch nichts zu sperren – und eine
  // Schnupperrunde darf eine geteilte Runde schon gar nicht kosten: Wer den
  // Link anklickt, verbrauchte sonst die eine freie Runde, die er in der App
  // noch gar nicht gesehen hat.
  const istMini = () => document.body?.dataset?.mini === "1";

  function isFree() {
    if (istMini()) return true;
    const r = reason();
    return r === "gekauft" || r === "gruender";
  }

  // --- Spiele, die für alle offen stehen ---------------------------------------
  // Der Admin kann einzelne Spiele unbegrenzt freigeben (config/gratisSpiele,
  // Reiter "Spiele" im Adminbereich). Gedacht ist das für eine Werbeaktion:
  // ein Spiel als Challenge auf Social Media, ohne dass nach der ersten Runde
  // das Tor kommt.
  //
  // Es gilt nur für das angehakte Spiel und nur, solange der Haken steht.
  // Nimmt der Admin ihn weg, gilt wieder eine Runde – und zwar eine ganze:
  // Während der Aktion zählt rundeBeendet() für dieses Spiel nichts, genau wie
  // bei einem Kind, das gekauft hat. Andersherum wäre der Haken eine Falle:
  // Wer ihn wegnimmt, sperrte damit alle aus, die in der Aktion gespielt
  // haben.
  function freieSpiele() {
    try { return cloud()?.getFreieSpiele?.() || []; } catch { return []; }
  }

  function istGratisSpiel(pageOrId) {
    const eintrag = gameEntry(pageOrId);
    if (!eintrag) return false;
    return freieSpiele().includes(eintrag.game.id);
  }

  // Ob der Stand schon bekannt ist: die Anmeldung beantwortet, die Rolle
  // gelesen, der Kauf geladen. Ohne firebase.js entscheidet das Gerät allein,
  // dann steht der Stand sofort.
  function isLoaded() {
    const c = cloud();
    if (!c) return true;
    // Auch die Liste der freigegebenen Spiele gehört zum Stand. Fehlt die
    // Funktion (eine ältere Fassung aus dem Zwischenspeicher), gilt sie als
    // beantwortet – sonst wartete die Schranke auf etwas, das nie kommt.
    if (typeof c.isFreieSpieleLoaded === "function" && !c.isFreieSpieleLoaded()) return false;
    if (typeof c.isAccountReady === "function") return c.isAccountReady();
    // Eine ältere Fassung aus dem Zwischenspeicher: so gut es geht.
    if (!c.isSignedIn?.()) return true;
    return Boolean(c.isEntitlementLoaded?.());
  }

  // Wartet, bis der Stand feststeht – höchstens so lange. Kommt Firebase gar
  // nicht (kein Netz), gilt nach dem Zeitlimit, was das Gerät weiss: Dann
  // sperrt die Schranke wie bisher, statt für immer offen zu stehen.
  const WARTEZEIT_MS = 6000;
  function whenReady(ms = WARTEZEIT_MS) {
    if (isLoaded()) return Promise.resolve(true);
    return new Promise((fertig) => {
      let uhr = 0;
      const ab = onChange(() => {
        if (!isLoaded()) return;
        window.clearTimeout(uhr);
        ab();
        fertig(true);
      });
      uhr = window.setTimeout(() => { ab(); fertig(false); }, ms);
    });
  }

  // Ist dieses Ziel gesperrt? Dieselbe Frage wie !targetFree(), nur beantwortet
  // sie sich erst, wenn feststeht, wer spielt. Das ist die Frage, die jede
  // Seite beim Laden stellt.
  async function targetLocked(url, { ms = WARTEZEIT_MS } = {}) {
    await whenReady(ms);
    return !targetFree(url);
  }

  // ---------------------------------------------------------------------------
  // Die Schnupperrunden
  // ---------------------------------------------------------------------------
  // Wie oft ein Spiel schon zu Ende gespielt wurde, steht als { spiel: anzahl }
  // im Speicher des Geräts. Ohne Speicher (privates Fenster) zählt nichts –
  // dann bleibt alles frei, und das ist besser, als ein Kind auszusperren,
  // weil sein Browser nichts merkt.
  function runden() {
    try { return JSON.parse(localStorage.getItem(RUNDEN_KEY) || "{}") || {}; } catch { return {}; }
  }

  function rundenSchreiben(stand) {
    try { localStorage.setItem(RUNDEN_KEY, JSON.stringify(stand)); } catch { /* privater Modus */ }
  }

  function gespielteRunden(pageOrId) {
    const eintrag = gameEntry(pageOrId);
    if (!eintrag) return 0;
    return Number(runden()[eintrag.game.id]) || 0;
  }

  // Welche Station die Seite gerade spielt, falls sie eine spielt.
  function aktuelleStation() {
    try { return Number(new URLSearchParams(window.location.search).get("station")) || 0; } catch { return 0; }
  }

  // Eine Runde ist zu Ende. Rufen: game-shell.js (Ergebnis steht), app.js
  // (Level geschafft), tiersprung.js (eigenes Rundenende).
  function rundeBeendet(pageOrId) {
    if (isFree()) return;
    // Ein freigegebenes Spiel verbraucht nichts – siehe istGratisSpiel().
    if (istGratisSpiel(pageOrId || window.location.pathname)) return;
    // Auf der Reise zählt nichts: Die erste Karte ist frei, und sie soll die
    // Schnupperrunden nicht aufbrauchen.
    if (aktuelleStation()) return;
    const eintrag = gameEntry(pageOrId || window.location.pathname);
    if (!eintrag) return;
    const stand = runden();
    const vorher = Number(stand[eintrag.game.id]) || 0;
    if (vorher >= GRATIS_RUNDEN) return;
    stand[eintrag.game.id] = vorher + 1;
    rundenSchreiben(stand);
    // Das Startbild zeichnet die Häuser neu: Dieses trägt jetzt ein Schloss.
    document.dispatchEvent(new CustomEvent("lernapp:entitlement-changed", { detail: { grund: "runde", spiel: eintrag.game.id } }));
  }

  // ---------------------------------------------------------------------------
  // Was ist frei?
  // ---------------------------------------------------------------------------
  function stationFree(nr) {
    const n = Number(nr);
    if (!Number.isInteger(n) || n < 1) return true;
    return n <= STATIONS_FREE || isFree();
  }

  // Die Seite eines Spiels (memory.html), seine saubere Adresse (memory) oder
  // seine Kennung (towerStack).
  //
  // Die Endung muss weg, und das ist keine Kosmetik: Netlify liefert jede
  // Seite auch ohne .html aus, und genau so sieht eine Adresse aus, die man
  // weitergibt – kids.alae.app/turmbau. Wer so hereinkommt, landete hier
  // vorher bei null, denn "turmbau" ist weder "turmbau.html" noch die Kennung
  // "towerStack". Und null heisst weiter unten "unbekannte Seite, sperrt
  // niemand": Die Schranke stand offen, und rundeBeendet() zählte nichts, also
  // ging sie auch nie zu. Siebzehn der fünfundzwanzig Spiele waren über ihre
  // saubere Adresse unbegrenzt frei – alle, deren Kennung nicht zufällig so
  // heisst wie ihre Datei.
  //
  // scripts/validate-schranke.mjs prüft beide Schreibweisen für jedes Spiel.
  function gameEntry(pageOrId) {
    const ohneEndung = (wert) => String(wert || "").replace(/\.html$/i, "");
    const key = String(pageOrId || "").split("?")[0].split("#")[0].split("/").pop();
    if (!key) return null;
    const gesucht = ohneEndung(key);
    for (const area of AREAS) {
      const index = area.games.findIndex((g) =>
        g.page === key || ohneEndung(g.page) === gesucht || g.id === key || g.ownProgress === key);
      if (index >= 0) return { area, index, game: area.games[index] };
    }
    return null;
  }

  function gameFree(pageOrId) {
    if (isFree()) return true;
    const entry = gameEntry(pageOrId);
    // Unbekannte Seiten (die Werkstatt, die Startseite) sperrt niemand.
    if (!entry) return true;
    if (freieSpiele().includes(entry.game.id)) return true;
    return gespielteRunden(pageOrId) < GRATIS_RUNDEN;
  }

  // Ob die Schnupperrunde schon verbraucht ist – für das Schloss am Haus.
  // Unterschied zu !gameFree: Wer gekauft hat, hat nichts verbraucht.
  function gameGespielt(pageOrId) {
    if (isFree() || istGratisSpiel(pageOrId)) return false;
    return gespielteRunden(pageOrId) >= GRATIS_RUNDEN;
  }

  // Die Welten (Wiese, Wald, Meer, Weltall) sind nicht einzeln gesperrt: Die
  // eine freie Runde darf in jeder davon gespielt werden. Was zählt, ist das
  // Spiel.
  function levelFree(level) {
    if (!level) return false;
    if (isFree()) return true;
    return gameFree(level.game);
  }

  // Ein Ziel, wie enterGame es bekommt: "memory.html" oder
  // "arukone.html?station=15". Mit Station entscheidet die Station allein –
  // auf der Reise spielt ein Kind jedes Spiel, das die Station verlangt.
  function targetFree(url) {
    const text = String(url || "");
    let station = 0;
    try { station = Number(new URLSearchParams(text.split("?")[1] || "").get("station")) || 0; } catch { station = 0; }
    if (station) return stationFree(station);
    return gameFree(text);
  }

  // ---------------------------------------------------------------------------
  // Das Tor
  // ---------------------------------------------------------------------------
  // Eine Schranke vor dem Gleis, der Zug davor, und ein Satz für das Kind.
  // Der Knopf für die Eltern führt über das Rechenrätsel zum Preis.
  function el(tag, attrs = {}, children = []) {
    const ns = "http://www.w3.org/2000/svg";
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
    children.forEach((c) => node.append(c));
    return node;
  }

  function schrankeSvg() {
    const svg = el("svg", { viewBox: "0 0 240 120", class: "tor-bild-svg", role: "img", "aria-label": "Der Zug wartet vor einer Schranke" });
    // Himmel und Boden
    svg.append(el("rect", { x: 0, y: 0, width: 240, height: 120, rx: 14, fill: "#dff1fb" }));
    svg.append(el("rect", { x: 0, y: 92, width: 240, height: 28, fill: "#9fd68a" }));
    // Gleis
    svg.append(el("rect", { x: 0, y: 96, width: 240, height: 3, fill: "#7a6a5a" }));
    svg.append(el("rect", { x: 0, y: 104, width: 240, height: 3, fill: "#7a6a5a" }));
    for (let x = 6; x < 240; x += 16) svg.append(el("rect", { x, y: 94, width: 6, height: 15, fill: "#a58a6a" }));
    // Die Lok (wie das App-Icon)
    const lok = el("g", { transform: "translate(22 40)" });
    lok.append(el("rect", { x: 0, y: 22, width: 70, height: 30, rx: 8, fill: "#6c5ce7" }));
    lok.append(el("rect", { x: 46, y: 6, width: 26, height: 30, rx: 6, fill: "#6c5ce7" }));
    lok.append(el("rect", { x: 52, y: 12, width: 12, height: 10, rx: 3, fill: "#ffd166" }));
    lok.append(el("rect", { x: 8, y: 8, width: 12, height: 18, rx: 3, fill: "#6c5ce7" }));
    lok.append(el("circle", { cx: 4, cy: 4, r: 5, fill: "#c8c2f4" }));
    lok.append(el("circle", { cx: 12, cy: -3, r: 4, fill: "#c8c2f4", opacity: 0.8 }));
    [14, 36, 58].forEach((cx) => {
      lok.append(el("circle", { cx, cy: 54, r: 7, fill: "#fff", stroke: "#4c3fd6", "stroke-width": 3 }));
    });
    svg.append(lok);
    // Die Schranke: Pfosten und rot-weisser Balken, geschlossen
    svg.append(el("rect", { x: 150, y: 50, width: 10, height: 46, rx: 3, fill: "#5c6b7a" }));
    svg.append(el("circle", { cx: 155, cy: 56, r: 7, fill: "#ef476f" }));
    const balken = el("g", { transform: "translate(152 60)" });
    balken.append(el("rect", { x: 0, y: 0, width: 82, height: 10, rx: 5, fill: "#fff", stroke: "#3d4a57", "stroke-width": 2 }));
    [10, 30, 50, 70].forEach((x) => balken.append(el("rect", { x, y: 1, width: 10, height: 8, fill: "#ef476f" })));
    svg.append(balken);
    // Das Schloss am Balken
    svg.append(el("rect", { x: 196, y: 30, width: 20, height: 16, rx: 4, fill: "#ffd166", stroke: "#b8860b", "stroke-width": 2 }));
    svg.append(el("path", { d: "M200 30v-5a6 6 0 0 1 12 0v5", fill: "none", stroke: "#b8860b", "stroke-width": 3 }));
    return svg;
  }

  let offenesTor = null;
  // Wofür das Tor steht – damit es sich schliessen kann, sobald genau dieses
  // Ziel frei wird.
  let torZiel = null;

  // Der Satz im Tor. Er stand dreimal da – als Beschriftung, als Text und als
  // das, was vorgelesen wird. Dreimal derselbe Satz heisst: beim nächsten Mal
  // wird einer davon vergessen.
  const TOR_SATZ = "Nur ein Versuch pro Spiel kostenlos.";

  function closeGate() {
    if (!offenesTor) return;
    offenesTor.remove();
    offenesTor = null;
    torZiel = null;
    document.body.classList.remove("tor-offen");
  }

  // Zeigt das Tor. onBack läuft, wenn das Kind es zumacht; wer nichts angibt,
  // bekommt nur das Zumachen. ziel ist die Seite, vor der es steht – wird sie
  // frei, geht das Tor von selbst auf. Gibt eine Funktion zum Schliessen
  // zurück.
  function showGate({ onBack = null, host = document.body, ziel = null } = {}) {
    closeGate();
    const overlay = document.createElement("div");
    overlay.className = "tor-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", TOR_SATZ);

    const card = document.createElement("div");
    card.className = "tor-card";

    // Das Kreuz. Es steht ausserhalb von text und actions, und genau deshalb
    // gibt es es: Der Weg zurück führte bisher nur über den Pfeil – und den
    // blendet das Rechenrätsel aus. Wer sich auf "Für Eltern" vertippte, sass
    // in einer Aufgabe fest, die er nicht lösen wollte, ohne Ausweg ausser
    // Neuladen. Das Kreuz bleibt in jedem Zustand des Fensters sichtbar.
    const schliessen = document.createElement("button");
    schliessen.type = "button";
    schliessen.className = "tor-schliessen";
    schliessen.setAttribute("aria-label", "Schliessen");
    schliessen.append(el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [
      el("path", { d: "M7 7l10 10M17 7 7 17", fill: "none", stroke: "currentColor", "stroke-width": 2.6, "stroke-linecap": "round" }),
    ]));

    const bild = document.createElement("div");
    bild.className = "tor-bild";
    bild.append(schrankeSvg());

    const text = document.createElement("p");
    text.className = "tor-text";
    text.textContent = TOR_SATZ;

    const actions = document.createElement("div");
    actions.className = "tor-actions";
    const zurueck = document.createElement("button");
    zurueck.type = "button";
    zurueck.className = "tor-zurueck";
    zurueck.setAttribute("aria-label", "Zurück");
    zurueck.append(el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [
      el("path", { d: "M15 5 8 12l7 7", fill: "none", stroke: "currentColor", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    ]));
    const eltern = document.createElement("button");
    eltern.type = "button";
    eltern.className = "tor-eltern";
    eltern.textContent = "Für Eltern";
    actions.append(zurueck, eltern);

    card.append(schliessen, bild, text, actions);
    overlay.append(card);
    host.append(overlay);
    document.body.classList.add("tor-offen");
    offenesTor = overlay;
    // Wofür das Tor steht. Ohne Angabe: diese Seite, sofern sie überhaupt ein
    // Spiel ist.
    //
    // Das ist nicht Bequemlichkeit. Der Handler unten schliesst ein Tor, sobald
    // sein Ziel frei wird – ohne Ziel fiel er auf isFree() zurück, und das
    // bleibt bei einem Konto ohne Kauf false. Gibt der Admin mitten in einer
    // Aktion ein Spiel frei, stand dessen Tor also weiter da, obwohl das Spiel
    // längst offen war; die Levelwahl in app.js ruft showGate() ohne Ziel auf.
    //
    // Nur, wenn diese Seite ein Spiel ist: Auf dem Startbild steht das Tor vor
    // einem fremden Ziel (train-home.js gibt es mit), und index.html gälte als
    // unbekannte Seite – also als frei. Dann ginge dort jedes Tor sofort wieder
    // zu.
    const eigeneSeite = `${window.location.pathname}${window.location.search}`;
    torZiel = ziel || (gameEntry(window.location.pathname) ? eigeneSeite : null);
    kids()?.playChime?.();
    try { kids()?.speak?.(TOR_SATZ); } catch { /* ohne Ton */ }

    // Zumachen heisst immer dasselbe: Fenster zu, und zurück, wo das Kind
    // herkam. Drei Wege dorthin – der Pfeil, das Kreuz und die Escape-Taste.
    const zumachen = () => { closeGate(); onBack?.(); };
    zurueck.addEventListener("click", zumachen);
    schliessen.addEventListener("click", zumachen);
    overlay.addEventListener("keydown", (ereignis) => {
      if (ereignis.key === "Escape") { ereignis.preventDefault(); zumachen(); }
    });
    eltern.addEventListener("click", () => showParentGate(card, text, actions));
    zurueck.focus();
    return closeGate;
  }

  // Das Rechenrätsel. Zwei zweistellige Zahlen addieren – das kann ein Kind
  // von vier nicht, ein Erwachsener ohne Nachdenken. Drei Versuche, dann ist
  // das Tor wieder das Tor.
  function showParentGate(card, text, actions) {
    const a = 11 + Math.floor(Math.random() * 30);
    const b = 12 + Math.floor(Math.random() * 30);
    const form = document.createElement("form");
    form.className = "tor-gate";
    form.innerHTML = `
      <p class="tor-gate-text">Für Eltern: Wie viel ist <strong>${a} + ${b}</strong>?</p>
      <div class="tor-gate-row">
        <input name="antwort" type="number" inputmode="numeric" autocomplete="off" required aria-label="Antwort" />
        <button type="submit">Weiter</button>
      </div>
      <p class="tor-gate-status" role="status" aria-live="polite"></p>
    `;
    text.hidden = true;
    actions.hidden = true;
    card.append(form);
    const input = form.querySelector("input");
    const status = form.querySelector(".tor-gate-status");
    let versuche = 0;
    input.focus();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (Number(input.value) === a + b) {
        closeGate();
        // Der Verkaufsbildschirm. Ist firebase.js noch die alte Fassung (ein
        // Gerät mit altem Zwischenspeicher), bleibt es beim Profilfenster –
        // besser das zweitbeste Fenster als gar keines.
        const c = cloud();
        if (c?.openKauf) c.openKauf();
        else c?.openAccount?.();
        return;
      }
      versuche += 1;
      input.value = "";
      if (versuche >= 3) {
        form.remove();
        text.hidden = false;
        actions.hidden = false;
        return;
      }
      status.textContent = "Das stimmt nicht. Noch einmal?";
      input.focus();
    });
  }

  // ---------------------------------------------------------------------------
  // Änderungen weitergeben
  // ---------------------------------------------------------------------------
  const listeners = new Set();
  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  document.addEventListener("lernapp:entitlement-changed", () => {
    // Zuerst das Tor: Kommt der Kontostand erst jetzt an – ein Kind mit
    // Gründer-Zugang, eine Familie, die eben gekauft hat –, dann steht dort
    // eine Schranke, die nicht mehr gilt. Sie geht von selbst auf; niemand
    // soll ein Tor wegtippen müssen, das keines mehr ist.
    if (offenesTor && (torZiel ? targetFree(torZiel) : isFree())) closeGate();
    listeners.forEach((fn) => { try { fn(); } catch { /* ein Zuhörer, der stolpert, hält die anderen nicht auf */ } });
  });

  window.LernappEntitlement = {
    STATIONS_FREE,
    GRATIS_RUNDEN,
    AREAS,
    reason,
    isFree,
    isLoaded,
    stationFree,
    gameFree,
    levelFree,
    targetFree,
    targetLocked,
    whenReady,
    gameEntry,
    gameGespielt,
    istGratisSpiel,
    freieSpiele,
    gespielteRunden,
    rundeBeendet,
    showGate,
    closeGate,
    onChange,
  };
})();
