/*
 * journey-plan.js – Der Fahrplan der Reise.
 *
 * Reise 1: sechs Karten, zehn Stationen je Karte, sechzig Stationen. Jede
 * Station ist ein Spiel mit genau einem Auftrag: ein bestimmtes Level, eine
 * Kartenzahl oder eine Runde mit Zielpunktzahl. Welche Station welches Spiel
 * ist, steht hier fest und ist für alle Kinder gleich – so lässt es sich
 * prüfen (scripts/validate-reise.mjs), und in der Gruppe heisst "Station 23"
 * für alle dasselbe. Reise 2 hängt hinten dran: eine Weltraum-Karte mit
 * eigenem Fahrplan, dann die Savanne und die bekannten Karten noch einmal,
 * mit denselben Stationen und schwereren Aufträgen (Stationen 61–130).
 *
 * Dazu die Regeln, die nicht zeichnen: der Fahrgast je Karte, die
 * Streckenbesonderheit, die Schiebelok nach fünf Fehlversuchen und das
 * Reisetempo, das der Admin je Konto auf "langsam" stellen kann.
 *
 * Die Datei rechnet und speichert, zeichnet aber nichts: die Karte baut
 * train-journey.js, das Startbild verdrahtet train-home.js, und die Spiele
 * lesen hier nur ihren Auftrag. Sie wird deshalb auf jeder Seite geladen,
 * nach game-cloud.js (für den Kasten) und vor allem, was einen Auftrag
 * braucht.
 *
 * Der Stand liegt in einem Kasten von game-cloud.js (lernapp.reise): lokal
 * zuerst, angemeldet auch in der Cloud, zusammengeführt wie Bestenlisten –
 * was auf irgendeinem Gerät gestempelt war, bleibt gestempelt.
 */
(() => {
  "use strict";

  const KEY = "lernapp.reise";
  // Was die Karte zuletzt gezeigt hat – damit sie beim nächsten Öffnen nur
  // feiert, was seither dazugekommen ist. Wie lernapp.train.gesehen.
  const SEEN_KEY = "lernapp.reise.gesehen";
  const STATIONS_PER_MAP = 10;

  // ---------------------------------------------------------------------------
  // Die Spiele
  // ---------------------------------------------------------------------------
  // kind sagt, was ein Auftrag verlangt:
  //   score    eine Runde mit Zielpunktzahl (gut × Faktor der Karte)
  //   level    ein bestimmtes Level, mit mindestens einem Stern beendet
  //   size     Memory: eine Kartenzahl
  //   catalog  ein Level aus dem Levelkatalog (app.js), gelöst
  //
  // gut ist die Drei-Sterne-Schwelle einer Runde – dieselbe Zahl wie in
  // train-progress.js (OWN_PROGRESS); das Prüfskript hält beide gleich.
  // einheit/auftrag formen den Satz, den der Lautsprecher sagt.
  const GAMES = {
    // Gedächtnis
    backpack: { title: "Rucksack packen", area: "gedaechtnis", page: "backpack.html", kind: "score", gut: 12, einheit: "Punkte", auftrag: (n) => `Hol ${n} Punkte.` },
    memory: { title: "Memory", area: "gedaechtnis", page: "memory.html", kind: "size", auftrag: (n) => `Finde alle Paare bei ${n} Karten.` },
    beachTreasure: { title: "Strand-Schätze", area: "gedaechtnis", page: "strandschatz.html", kind: "score", gut: 12, einheit: "Schätze", auftrag: (n) => `Finde ${n} Schätze.` },
    tileMemory: { title: "Kacheln-Knobeln", area: "gedaechtnis", page: "kacheln.html", kind: "score", gut: 14, einheit: "Kacheln", auftrag: (n) => `Merk dir ${n} Kacheln.` },
    missingItem: { title: "Was fehlt?", area: "gedaechtnis", page: "wasfehlt.html", kind: "score", gut: 8, einheit: "Wagen", auftrag: (n) => `Kontrolliere ${n} Wagen richtig.` },
    // Konzentration
    flanker: { title: "Schwarm-Fokus", area: "konzentration", page: "schwarmfokus.html", kind: "score", gut: 30, einheit: "Punkte", auftrag: (n) => `Hol ${n} Punkte.` },
    trackRouter: { title: "Weichen-Wirrwarr", area: "konzentration", page: "weichen.html", kind: "level", auftrag: (n) => `Schaff Level ${n}.` },
    fishPond: { title: "Fischteich", area: "konzentration", page: "fischteich.html", kind: "score", gut: 14, einheit: "Fische", auftrag: (n) => `Fang ${n} Fische.` },
    gridlock: { title: "Freie Fahrt", area: "konzentration", page: "freiefahrt.html", kind: "level", auftrag: (n) => `Räum Bahnhof ${n} frei.` },
    goSignal: { title: "Halt am Signal", area: "konzentration", page: "signal.html", kind: "score", gut: 22, einheit: "Punkte", auftrag: (n) => `Hol ${n} Punkte.` },
    // Geschwindigkeit
    tiersprung: { title: "Tier-Sprung", area: "geschwindigkeit", page: "tiersprung.html", kind: "level", auftrag: (n) => `Bring Tier ${n} ins Ziel.` },
    cardMatch: { title: "Karten-Merker", area: "geschwindigkeit", page: "kartenmerker.html", kind: "score", gut: 40, einheit: "Punkte", auftrag: (n) => `Hol ${n} Punkte.` },
    leafFlow: { title: "Blätter im Strom", area: "geschwindigkeit", page: "blaetter.html", kind: "score", gut: 16, einheit: "Blätter", auftrag: (n) => `Wisch ${n} Blätter richtig.` },
    towerStack: { title: "Turmbau", area: "geschwindigkeit", page: "turmbau.html", kind: "score", gut: 14, einheit: "Blöcke", auftrag: (n) => `Bau ${n} Blöcke hoch.` },
    twinSpot: { title: "Doppelt gleich", area: "geschwindigkeit", page: "doppelt.html", kind: "score", gut: 20, einheit: "Paare", auftrag: (n) => `Finde ${n} Paare.` },
    // Problemlösen
    spatialPuzzle: { title: "Raumdetektiv", area: "problemloesen", page: "raumdetektiv.html", kind: "catalog", auftrag: (w) => `Löse die Aufgaben der Welt ${w}.` },
    arukone: { title: "Arukone", area: "problemloesen", page: "arukone.html", kind: "catalog", auftrag: (w) => `Löse Rätsel ${w}.` },
    bimaru: { title: "Battleships", area: "problemloesen", page: "bimaru.html", kind: "catalog", auftrag: (w) => `Finde die Schiffe in Rätsel ${w}.` },
    shikaku: { title: "Tiergehege", area: "problemloesen", page: "shikaku.html", kind: "catalog", auftrag: (w) => `Baue die Gehege in Rätsel ${w}.` },
    craneStack: { title: "Fässer stapeln", area: "problemloesen", page: "faesser.html", kind: "level", auftrag: (n) => `Schaff Level ${n}.` },
    // Zahl und Buchstabe
    letterPuzzle: { title: "Buchstabenjagd", area: "zahlbuchstabe", page: "buchstaben.html", kind: "catalog", auftrag: (w) => `Finde die Buchstaben in Level ${w}.` },
    readingPuzzle: { title: "Wortdetektiv", area: "zahlbuchstabe", page: "wortdetektiv.html", kind: "catalog", auftrag: (w) => `Lies die Wörter in Level ${w}.` },
    kakuro: { title: "Kakuro", area: "zahlbuchstabe", page: "kakuro.html", kind: "catalog", auftrag: (w) => `Löse Rätsel ${w}.` },
    hidoku: { title: "Hidoku", area: "zahlbuchstabe", page: "hidoku.html", kind: "catalog", auftrag: (w) => `Finde die Zahlenkette in Rätsel ${w}.` },
    numberLine: { title: "Wo hält der Zug?", area: "zahlbuchstabe", page: "zahlengleis.html", kind: "score", gut: 42, einheit: "Punkte", auftrag: (n) => `Hol ${n} Punkte.` },
  };

  const AREAS = {
    gedaechtnis: { label: "Gedächtnis", color: "#7C5CE6" },
    konzentration: { label: "Konzentration", color: "#00A5B5" },
    geschwindigkeit: { label: "Geschwindigkeit", color: "#F5A623" },
    problemloesen: { label: "Problemlösen", color: "#3FA34D" },
    zahlbuchstabe: { label: "Zahl und Buchstabe", color: "#E8543F" },
  };

  // Die Welten der Katalog-Spiele, wie app.js sie nennt.
  const WORLDS = { easy: "Wiese", medium: "Wald", hard: "Meer", extreme: "Weltall" };

  // Rucksack packen und Wo hält der Zug? haben vier Stufen zur Wahl. Auf der
  // Reise wählt die Karte: die ersten beiden Karten die leichteste, danach
  // Stufe um Stufe hinauf; Reise 2 fährt die oberste.
  const STUFE_BY_TIER = [0, 0, 1, 1, 2, 3];
  const STUFE_MAX = 3;
  // Wie viele Level die Level-Spiele haben (das Prüfskript zählt in den
  // Spieldateien nach), welche Kartenzahlen Memory kennt und wie viele Level
  // je Welt die Katalog-Spiele haben: zehn, der Raumdetektiv eins.
  const LEVEL_MAX = { trackRouter: 10, gridlock: 12, craneStack: 10, tiersprung: 10 };
  const MEMORY_SIZES = [8, 12, 16, 20, 24];
  const CATALOG_PER_WORLD = { spatialPuzzle: 1 };
  const WORLD_ORDER = ["easy", "medium", "hard", "extreme"];

  // ---------------------------------------------------------------------------
  // Die sechs Karten
  // ---------------------------------------------------------------------------
  // factor: welcher Anteil von "gut" eine Runde erreichen muss. Auf der Wiese
  // gut ein Drittel, in der Nacht die ganze Drei-Sterne-Schwelle.
  //
  // Jede Karte fährt jeden Bereich genau zweimal an, nie zweimal hintereinander
  // denselben, und kein Spiel kommt zweimal auf einer Karte vor. Station 4 und
  // 8 sind Wahlstationen (zwei Spiele desselben Bereichs), Station 10 ist der
  // Ziel-Bahnhof mit einem Rätsel, das Zeit haben darf. Die ersten beiden
  // Stationen jeder Karte verlangen nichts, was ein Kind lesen müsste.
  //
  // alt: das Ausweichgleis je Bereich – ein zweites Spiel mit etwas leichterem
  // Auftrag, das sich nach zwei Fehlversuchen an einer Station öffnet.
  //
  // passenger: das Tier, das an Station 1 auf dem Bahnsteig wartet, mitfährt
  // und am Ziel aussteigt (ein Kopf aus train-art.js, DRIVERS). Auf zwei
  // Karten ist es zugleich die Belohnung: Eichhörnchen und Steinbock dürfen
  // danach die Lok fahren.
  // feature: die Streckenbesonderheit, die train-journey.js zeichnet.
  const FIRST_LAP = [
    {
      id: "wiese", nr: 1, lap: 1, name: "Wiese", scene: "wiese", factor: 0.35, landmark: "windmill", passenger: "rabbit", feature: "cows",
      reward: { id: "flag-rainbow", label: "Wimpel Regenbogen", part: "flag" },
      stations: [
        { area: "gedaechtnis", game: "missingItem" },
        { area: "geschwindigkeit", game: "tiersprung", level: 1 },
        { area: "zahlbuchstabe", game: "numberLine" },
        { area: "konzentration", choice: [{ game: "goSignal" }, { game: "fishPond" }] },
        { area: "problemloesen", game: "craneStack", level: 1 },
        { area: "gedaechtnis", game: "memory", size: 8 },
        { area: "konzentration", game: "trackRouter", level: 1 },
        { area: "geschwindigkeit", choice: [{ game: "towerStack" }, { game: "twinSpot" }] },
        { area: "zahlbuchstabe", game: "letterPuzzle", world: "easy", pos: 1 },
        { area: "problemloesen", game: "shikaku", world: "easy", pos: 1, goal: true },
      ],
      alt: {
        gedaechtnis: { game: "backpack" },
        konzentration: { game: "flanker" },
        geschwindigkeit: { game: "cardMatch" },
        problemloesen: { game: "arukone", world: "easy", pos: 1 },
        zahlbuchstabe: { game: "hidoku", world: "easy", pos: 1 },
      },
    },
    {
      id: "wald", nr: 2, lap: 1, name: "Wald", scene: "wald", factor: 0.45, landmark: "treehouse", passenger: "squirrel", feature: "brook",
      reward: { id: "driver-squirrel", label: "Chauffeur Eichhörnchen", part: "driver" },
      stations: [
        { area: "konzentration", game: "flanker" },
        { area: "gedaechtnis", game: "tileMemory" },
        { area: "geschwindigkeit", game: "leafFlow" },
        { area: "problemloesen", choice: [{ game: "arukone", world: "easy", pos: 4 }, { game: "craneStack", level: 2 }] },
        { area: "zahlbuchstabe", game: "hidoku", world: "easy", pos: 4 },
        { area: "konzentration", game: "gridlock", level: 3 },
        { area: "geschwindigkeit", game: "cardMatch" },
        { area: "gedaechtnis", choice: [{ game: "backpack" }, { game: "beachTreasure" }] },
        { area: "problemloesen", game: "bimaru", world: "easy", pos: 5 },
        { area: "zahlbuchstabe", game: "readingPuzzle", world: "easy", pos: 5, goal: true },
      ],
      alt: {
        gedaechtnis: { game: "missingItem" },
        konzentration: { game: "goSignal" },
        geschwindigkeit: { game: "twinSpot" },
        problemloesen: { game: "shikaku", world: "easy", pos: 3 },
        zahlbuchstabe: { game: "numberLine" },
      },
    },
    {
      id: "see", nr: 3, lap: 1, name: "See", scene: "see", factor: 0.55, landmark: "lighthouse", passenger: "penguin", feature: "ferry",
      reward: { id: "whistle-schiffshorn", label: "Pfeife Schiffshorn", part: "whistle" },
      stations: [
        { area: "geschwindigkeit", game: "twinSpot" },
        { area: "konzentration", game: "goSignal" },
        { area: "gedaechtnis", game: "missingItem" },
        { area: "zahlbuchstabe", choice: [{ game: "numberLine" }, { game: "letterPuzzle", world: "easy", pos: 9 }] },
        { area: "problemloesen", game: "spatialPuzzle", world: "medium", pos: 1 },
        { area: "geschwindigkeit", game: "tiersprung", level: 4 },
        { area: "zahlbuchstabe", game: "kakuro", world: "easy", pos: 8 },
        { area: "konzentration", choice: [{ game: "fishPond" }, { game: "trackRouter", level: 4 }] },
        { area: "gedaechtnis", game: "memory", size: 12 },
        { area: "problemloesen", game: "shikaku", world: "medium", pos: 2, goal: true },
      ],
      alt: {
        gedaechtnis: { game: "tileMemory" },
        konzentration: { game: "flanker" },
        geschwindigkeit: { game: "leafFlow" },
        problemloesen: { game: "craneStack", level: 2 },
        zahlbuchstabe: { game: "hidoku", world: "easy", pos: 7 },
      },
    },
    {
      id: "dschungel", nr: 4, lap: 1, name: "Dschungel", scene: "dschungel", factor: 0.65, landmark: "temple", passenger: "panda", feature: "liana",
      reward: { id: "scene-savanne", label: "Landschaft Savanne", part: "scene" },
      stations: [
        { area: "zahlbuchstabe", game: "numberLine" },
        { area: "problemloesen", game: "craneStack", level: 5 },
        { area: "konzentration", game: "flanker" },
        { area: "gedaechtnis", choice: [{ game: "tileMemory" }, { game: "beachTreasure" }] },
        { area: "geschwindigkeit", game: "towerStack" },
        { area: "zahlbuchstabe", game: "hidoku", world: "medium", pos: 4 },
        { area: "gedaechtnis", game: "backpack" },
        { area: "problemloesen", choice: [{ game: "arukone", world: "medium", pos: 5 }, { game: "bimaru", world: "medium", pos: 3 }] },
        { area: "konzentration", game: "gridlock", level: 7 },
        { area: "geschwindigkeit", game: "tiersprung", level: 6, goal: true },
      ],
      alt: {
        gedaechtnis: { game: "memory", size: 12 },
        konzentration: { game: "goSignal" },
        geschwindigkeit: { game: "twinSpot" },
        problemloesen: { game: "shikaku", world: "medium", pos: 2 },
        zahlbuchstabe: { game: "letterPuzzle", world: "medium", pos: 2 },
      },
    },
    {
      id: "berge", nr: 5, lap: 1, name: "Berge", scene: "berge", factor: 0.8, landmark: "hut", passenger: "ibex", feature: "rack",
      reward: { id: "driver-ibex", label: "Chauffeur Steinbock", part: "driver" },
      stations: [
        { area: "problemloesen", game: "craneStack", level: 7 },
        { area: "zahlbuchstabe", game: "numberLine" },
        { area: "geschwindigkeit", game: "leafFlow" },
        { area: "konzentration", choice: [{ game: "goSignal" }, { game: "trackRouter", level: 8 }] },
        { area: "gedaechtnis", game: "beachTreasure" },
        { area: "problemloesen", game: "spatialPuzzle", world: "hard", pos: 1 },
        { area: "konzentration", game: "fishPond" },
        { area: "zahlbuchstabe", choice: [{ game: "kakuro", world: "medium", pos: 9 }, { game: "readingPuzzle", world: "medium", pos: 8 }] },
        { area: "geschwindigkeit", game: "cardMatch" },
        { area: "gedaechtnis", game: "memory", size: 20, goal: true },
      ],
      alt: {
        gedaechtnis: { game: "missingItem" },
        konzentration: { game: "flanker" },
        geschwindigkeit: { game: "towerStack" },
        problemloesen: { game: "arukone", world: "medium", pos: 6 },
        zahlbuchstabe: { game: "hidoku", world: "medium", pos: 7 },
      },
    },
    {
      id: "nacht", nr: 6, lap: 1, name: "Nacht", scene: "nacht", factor: 1, landmark: "observatory", passenger: "owl", feature: "night",
      reward: { id: "starloco", label: "Sternenlok", part: "loco" },
      stations: [
        { area: "gedaechtnis", game: "missingItem" },
        { area: "konzentration", game: "gridlock", level: 11 },
        { area: "problemloesen", game: "bimaru", world: "hard", pos: 5 },
        { area: "geschwindigkeit", choice: [{ game: "twinSpot" }, { game: "towerStack" }] },
        { area: "zahlbuchstabe", game: "letterPuzzle", world: "hard", pos: 4 },
        { area: "gedaechtnis", game: "tileMemory" },
        { area: "geschwindigkeit", game: "tiersprung", level: 9 },
        { area: "konzentration", choice: [{ game: "flanker" }, { game: "goSignal" }] },
        { area: "problemloesen", game: "arukone", world: "hard", pos: 6 },
        { area: "zahlbuchstabe", game: "kakuro", world: "hard", pos: 5, goal: true },
      ],
      alt: {
        gedaechtnis: { game: "backpack" },
        konzentration: { game: "fishPond" },
        geschwindigkeit: { game: "leafFlow" },
        problemloesen: { game: "shikaku", world: "hard", pos: 3 },
        zahlbuchstabe: { game: "numberLine" },
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Reise 2
  // ---------------------------------------------------------------------------
  // Nach der Sternwarte geht es weiter: zuerst im Weltraum, mit einem eigenen
  // Fahrplan aus Weltall-Leveln und den obersten Leveln, dann durch die
  // Savanne und noch einmal durch die bekannten Landschaften. Diese sechs
  // Karten fahren dieselben Stationen wie in Reise 1, nur schwerer (boost,
  // siehe shiftSpec): Weltall-Level, drei Level höher, grössere Memorys, die
  // ganze Drei-Sterne-Schwelle und die oberste Stufe. Belohnung je Karte: ein
  // goldener Stern auf dem Reise-Schild der Lok – und im Fahrplan der goldene
  // Rahmen. Die Weltraum-Karte selbst gibt die Landschaft Weltraum.
  const WELTRAUM = {
    id: "weltraum", nr: 7, lap: 2, name: "Weltraum", scene: "weltraum", factor: 1, landmark: "rocket", passenger: "mouse", feature: "moon",
    reward: { id: "scene-weltraum", label: "Landschaft Weltraum", part: "scene" },
    stations: [
      { area: "gedaechtnis", game: "memory", size: 24 },
      { area: "geschwindigkeit", game: "tiersprung", level: 10 },
      { area: "konzentration", game: "trackRouter", level: 10 },
      { area: "zahlbuchstabe", choice: [{ game: "numberLine" }, { game: "letterPuzzle", world: "extreme", pos: 2 }] },
      { area: "problemloesen", game: "bimaru", world: "extreme", pos: 3 },
      { area: "gedaechtnis", game: "tileMemory" },
      { area: "konzentration", game: "gridlock", level: 12 },
      { area: "problemloesen", choice: [{ game: "shikaku", world: "extreme", pos: 4 }, { game: "craneStack", level: 10 }] },
      { area: "geschwindigkeit", game: "cardMatch" },
      { area: "zahlbuchstabe", game: "hidoku", world: "extreme", pos: 5, goal: true },
    ],
    alt: {
      gedaechtnis: { game: "backpack" },
      konzentration: { game: "fishPond" },
      geschwindigkeit: { game: "twinSpot" },
      problemloesen: { game: "arukone", world: "extreme", pos: 2 },
      zahlbuchstabe: { game: "kakuro", world: "extreme", pos: 1 },
    },
  };
  // Die Savanne fährt die Stationen der Wiese – mit Baobab, Löwe und
  // Elefanten –, die übrigen fünf ihre eigenen von damals.
  const SECOND_LAP_SCENES = [
    { id: "savanne", name: "Savanne", scene: "savanne", landmark: "baobab", passenger: "lion", feature: "elephants", from: "wiese" },
    { id: "wald-2", name: "Wald", scene: "wald", from: "wald" },
    { id: "see-2", name: "See", scene: "see", from: "see" },
    { id: "dschungel-2", name: "Dschungel", scene: "dschungel", from: "dschungel" },
    { id: "berge-2", name: "Berge", scene: "berge", from: "berge" },
    { id: "nacht-2", name: "Nacht", scene: "nacht", from: "nacht" },
  ];
  const SECOND_LAP = SECOND_LAP_SCENES.map((entry, k) => {
    const source = FIRST_LAP.find((map) => map.id === entry.from);
    return {
      id: entry.id, nr: FIRST_LAP.length + 2 + k, lap: 2, name: entry.name, scene: entry.scene, factor: 1,
      landmark: entry.landmark || source.landmark, passenger: entry.passenger || source.passenger, feature: entry.feature || source.feature,
      reward: { id: `gold-star-${k + 1}`, label: "Goldener Stern", part: "plate", star: k + 1 },
      stations: source.stations, alt: source.alt, boost: true, from: source.id,
    };
  });
  const MAPS = [...FIRST_LAP, WELTRAUM, ...SECOND_LAP];

  const STATION_COUNT = MAPS.length * STATIONS_PER_MAP;

  // Die beiden Reisen: wo sie anfangen und aufhören.
  const LAPS = [
    { nr: 1, name: "Reise 1", maps: FIRST_LAP.length },
    { nr: 2, name: "Reise 2", maps: 1 + SECOND_LAP.length },
  ];
  LAPS.reduce((offset, lap) => {
    lap.firstMap = offset;
    lap.first = offset * STATIONS_PER_MAP + 1;
    lap.total = lap.maps * STATIONS_PER_MAP;
    lap.last = lap.first + lap.total - 1;
    return offset + lap.maps;
  }, 0);
  function lapOf(nr) { return LAPS.find((lap) => nr >= lap.first && nr <= lap.last) || LAPS[LAPS.length - 1]; }

  // Was die Reise freischaltet, und wo es in der Werkstatt hängt. Gesperrt
  // ist eine Variante, bis die Karte mit ihrer Belohnung fertig ist.
  const LOCKS = {
    flag: { rainbow: "flag-rainbow", stars: "starloco", sun: "gold-2" },
    driver: { squirrel: "driver-squirrel", ibex: "driver-ibex" },
    whistle: { schiffshorn: "whistle-schiffshorn" },
    lamp: { star: "starloco" },
    wheels: { sun: "gold-1" },
    scene: { savanne: "scene-savanne", weltraum: "scene-weltraum" },
  };

  // Der Bonus für zehn goldene Stempel auf einer Karte. Er steht in keinem
  // Schaufenster – eine Überraschung für Kinder, die eine fertige Karte noch
  // einmal fahren: nach der ersten ganz goldenen Karte das Sonnenrad, nach
  // der zweiten der Sonnen-Wimpel.
  const BONUSES = [
    { id: "gold-1", after: 1, label: "Räder Sonnenrad", part: "wheels", text: "eine Karte mit zehn goldenen Stempeln" },
    { id: "gold-2", after: 2, label: "Wimpel Sonne", part: "flag", text: "zwei Karten mit zehn goldenen Stempeln" },
  ];

  // ---------------------------------------------------------------------------
  // Der Kasten
  // ---------------------------------------------------------------------------
  // done:   je gestempelter Station das beste Ergebnis; pushed: true heisst,
  //         die Schiebelok hat den Zug hier weitergeschoben (kein Stempel)
  // tries:  Fehlversuche an einer offenen Station (Ausweichgleis, Schiebelok)
  // choice: was an einer Wahlstation gewählt wurde
  // alt:    an welchen Stationen das Ausweichgleis genommen wurde
  // tempo:  das Reisetempo ("normal" oder "langsam"), vom Admin gesetzt, mit
  //         tempoAt als Zeitmarke – beim Zusammenführen gewinnt das neuere
  const EMPTY = { done: {}, tries: {}, choice: {}, alt: {} };

  function clone(value) { try { return JSON.parse(JSON.stringify(value)); } catch { return value; } }
  function obj(value) { return value && typeof value === "object" ? value : {}; }

  // Zusammenführen wie mergeLevels: derselbe Stand kommt mehrfach an, vom
  // Gerät in die Cloud und zurück. Ein Stempel bleibt ein Stempel, die bessere
  // Sternzahl gewinnt, Fehlversuche das Maximum, und eine Wahl, die irgendwo
  // getroffen wurde, gilt.
  function merge(a, b) {
    const done = {};
    [obj(a.done), obj(b.done)].forEach((source) => {
      Object.keys(source).forEach((nr) => {
        const entry = source[nr];
        if (!entry || typeof entry !== "object") return;
        const known = done[nr];
        if (!known || (Number(entry.stars) || 0) > (Number(known.stars) || 0)) done[nr] = entry;
      });
    });
    const tries = {};
    [obj(a.tries), obj(b.tries)].forEach((source) => {
      Object.keys(source).forEach((nr) => { tries[nr] = Math.max(Number(tries[nr]) || 0, Number(source[nr]) || 0); });
    });
    const out = { done, tries, choice: { ...obj(b.choice), ...obj(a.choice) }, alt: { ...obj(b.alt), ...obj(a.alt) } };
    const atA = Number(a.tempoAt) || 0;
    const atB = Number(b.tempoAt) || 0;
    const source = atB > atA ? b : a;
    if (source.tempo !== undefined && source.tempo !== null) {
      out.tempo = source.tempo === "langsam" ? "langsam" : "normal";
      out.tempoAt = Math.max(atA, atB);
    }
    return out;
  }

  function readLocal() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      return raw && typeof raw === "object" ? merge(raw, EMPTY) : clone(EMPTY);
    } catch { return clone(EMPTY); }
  }

  // Ohne game-cloud.js (die Prüfseite, ein Test) bleibt der Stand auf dem
  // Gerät – dieselbe Form, nur ohne Cloud.
  const cloudGames = window.LernappGameCloud;
  const store = cloudGames
    ? cloudGames.register({ key: KEY, empty: clone(EMPTY), merge })
    : {
      read() { return readLocal(); },
      update(fn) {
        const next = fn(this.read());
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* privater Modus */ }
        return next;
      },
      onChange() { return () => {}; },
    };

  function read() { return merge(obj(store.read()), EMPTY); }

  // ---------------------------------------------------------------------------
  // Stationen und Aufträge
  // ---------------------------------------------------------------------------
  function mapIndexOf(nr) { return Math.floor((nr - 1) / STATIONS_PER_MAP); }

  // Die feste Beschreibung einer Station, ohne den Stand des Kindes.
  function stationAt(nr) {
    const mapIndex = mapIndexOf(nr);
    const map = MAPS[mapIndex];
    if (!map) return null;
    const index = (nr - 1) % STATIONS_PER_MAP;
    const spec = map.stations[index];
    return { nr, mapIndex, map, index, area: spec.area, spec, goal: Boolean(spec.goal), choice: spec.choice || null, alt: map.alt[spec.area] || null };
  }

  // Memory kennt nur fünf Kartenzahlen: die nächstkleinere, die es gibt.
  function memorySize(size) {
    let best = MEMORY_SIZES[0];
    MEMORY_SIZES.forEach((entry) => { if (entry <= size) best = entry; });
    return best;
  }
  // Ein Katalog-Level als eine Zahl über alle Welten: Wiese 1 … Weltall 10.
  // So lässt sich "drei Level leichter" auch über eine Weltgrenze rechnen.
  function catalogIndex(gameId, world, pos) {
    const per = CATALOG_PER_WORLD[gameId] || 10;
    return Math.max(0, WORLD_ORDER.indexOf(world)) * per + Math.max(1, Math.min(per, Number(pos) || 1));
  }
  function catalogAt(gameId, index) {
    const per = CATALOG_PER_WORLD[gameId] || 10;
    const i = Math.max(1, Math.min(per * WORLD_ORDER.length, index));
    return { world: WORLD_ORDER[Math.floor((i - 1) / per)], pos: ((i - 1) % per) + 1 };
  }

  // Reise 2 fährt die Stationen von Reise 1 schwerer (boost): drei Level
  // höher, das Memory um acht Karten grösser, Katalog-Level aus dem Weltall.
  // Das Reisetempo "langsam" (slow) nimmt von jeder Karte wieder etwas weg:
  // zwei Level, vier Karten, drei Katalog-Level – für Vier- bis Fünfjährige,
  // ohne dass ein Kind je "leicht" wählen muss.
  function shiftSpec(game, spec, { boost = false, slow = false } = {}) {
    if (!boost && !slow) return spec;
    const out = { ...spec };
    if (game.kind === "level") {
      const max = LEVEL_MAX[spec.game] || 10;
      let level = Number(spec.level) || 1;
      if (boost) level = Math.min(max, level + 3);
      if (slow) level = Math.max(1, level - 2);
      out.level = level;
    } else if (game.kind === "size") {
      let size = Number(spec.size) || 8;
      if (boost) size = Math.min(MEMORY_SIZES[MEMORY_SIZES.length - 1], size + 8);
      if (slow) size = Math.max(MEMORY_SIZES[0], size - 4);
      out.size = memorySize(size);
    } else if (game.kind === "catalog") {
      let at = { world: spec.world || "easy", pos: Number(spec.pos) || 1 };
      if (boost) at = { world: "extreme", pos: at.pos };
      if (slow) at = catalogAt(spec.game, catalogIndex(spec.game, at.world, at.pos) - 3);
      out.world = at.world;
      out.pos = at.pos;
    }
    return out;
  }

  // Der Faktor der Karte davor – für das Reisetempo "langsam": Karte 2
  // verlangt dann die Zielpunktzahlen von Karte 1, Karte 1 noch weniger.
  function previousFactor(mapIndex) {
    return mapIndex > 0 ? MAPS[mapIndex - 1].factor : 0.25;
  }

  // Aus einer Spielangabe wird der Auftrag: welches Level, welche Kartenzahl,
  // wie viele Punkte. Zielpunktzahlen sind keine Handarbeit, sondern
  // gut × Faktor, aufgerundet, mindestens 3. Das Ausweichgleis rechnet mit
  // einem Zehntel weniger. Reise 2 und das Reisetempo verschieben die
  // Angabe vorher (shiftSpec).
  function buildTask(station, spec, { easier = false } = {}) {
    const game = GAMES[spec.game];
    if (!game) return null;
    const map = station.map;
    const tier = station.mapIndex;
    const slow = tempoIn(read()) === "langsam";
    const shifted = shiftSpec(game, spec, { boost: Boolean(map.boost), slow });
    const task = {
      nr: station.nr, mapIndex: station.mapIndex, index: station.index, mapNr: map.nr, mapName: map.name, lap: map.lap || 1,
      area: game.area, areaLabel: AREAS[game.area].label, color: AREAS[game.area].color,
      game: spec.game, title: game.title, page: game.page, kind: game.kind, goal: station.goal,
    };
    if (game.kind === "score") {
      const base = slow ? previousFactor(station.mapIndex) : map.factor;
      const factor = Math.max(0.2, base - (easier ? 0.1 : 0));
      task.gut = game.gut;
      task.target = Math.max(3, Math.ceil(game.gut * factor));
      const stufe = map.lap === 2 ? STUFE_MAX : (STUFE_BY_TIER[tier] || 0);
      task.stufe = Math.max(0, stufe - (slow ? 1 : 0));
      task.label = `${task.target} ${game.einheit}`;
      task.speech = game.auftrag(task.target);
    } else if (game.kind === "level") {
      task.level = Number(shifted.level) || 1;
      task.label = `Level ${task.level}`;
      task.speech = game.auftrag(task.level);
    } else if (game.kind === "size") {
      task.size = Number(shifted.size) || 8;
      task.label = `${task.size} Karten`;
      task.speech = game.auftrag(task.size);
    } else {
      task.world = shifted.world || "easy";
      task.pos = Number(shifted.pos) || 1;
      task.worldLabel = WORLDS[task.world] || task.world;
      task.label = `${task.worldLabel} ${task.pos}`;
      task.speech = game.auftrag(`${task.worldLabel} ${task.pos}`);
    }
    return task;
  }

  // Der Auftrag einer Station, so wie er jetzt gilt: an einer Wahlstation die
  // getroffene Wahl, auf dem Ausweichgleis das Ausweichspiel. Ist an einer
  // Wahlstation noch nichts gewählt, kommt statt eines Spiels die Wahl zurück
  // (task.choice), ausser game sagt, welche gemeint ist.
  function taskFor(nr, options = {}) {
    const station = stationAt(nr);
    if (!station) return null;
    const state = read();
    if (state.alt[nr] && station.alt) {
      const task = buildTask(station, station.alt, { easier: true });
      if (task) { task.viaAlt = true; return task; }
    }
    if (station.choice) {
      const wanted = options.game || state.choice[nr];
      const spec = station.choice.find((entry) => entry.game === wanted);
      if (spec) return buildTask(station, spec);
      return {
        nr, mapIndex: station.mapIndex, index: station.index, mapNr: station.map.nr, mapName: station.map.name,
        area: station.area, areaLabel: AREAS[station.area].label, color: AREAS[station.area].color,
        goal: station.goal, choice: station.choice.map((entry) => buildTask(station, entry)).filter(Boolean),
      };
    }
    return buildTask(station, station.spec);
  }

  // Das Ausweichgleis einer Station, als Auftrag – für die Karte, die es neben
  // die Station zeichnet.
  function altTaskFor(nr) {
    const station = stationAt(nr);
    if (!station?.alt) return null;
    const task = buildTask(station, station.alt, { easier: true });
    if (task) task.viaAlt = true;
    return task;
  }

  // Nach so vielen Fehlversuchen stellt sich die Weiche zum Ausweichgleis.
  const TRIES_FOR_ALT = 2;
  // Und nach so vielen (das Ausweichgleis eingerechnet) kommt die Schiebelok
  // und schiebt den Zug zur nächsten Station – ohne Stempel. Niemand bleibt
  // für immer vor Kakuro stehen.
  const TRIES_FOR_PUSH = 5;

  // ---------------------------------------------------------------------------
  // Der Stand
  // ---------------------------------------------------------------------------
  function isDoneIn(state, nr) { return Boolean(obj(state.done)[String(nr)]); }

  // Die nächste offene Station: die kleinste ohne Stempel. Nach der letzten
  // Station ist es STATION_COUNT + 1 – die Reise ist geschafft.
  function currentIn(state) {
    for (let nr = 1; nr <= STATION_COUNT; nr += 1) if (!isDoneIn(state, nr)) return nr;
    return STATION_COUNT + 1;
  }

  function mapFinishedIn(state, mapIndex) {
    for (let i = 1; i <= STATIONS_PER_MAP; i += 1) {
      if (!isDoneIn(state, mapIndex * STATIONS_PER_MAP + i)) return false;
    }
    return true;
  }

  function finishedMapsIn(state) {
    let count = 0;
    MAPS.forEach((_, index) => { if (mapFinishedIn(state, index)) count += 1; });
    return count;
  }

  // Ganz golden: alle zehn Stationen einer Karte mit drei Sternen.
  function mapGoldenIn(state, mapIndex) {
    for (let i = 1; i <= STATIONS_PER_MAP; i += 1) {
      const info = obj(state.done)[String(mapIndex * STATIONS_PER_MAP + i)];
      if (!info || (Number(info.stars) || 0) < 3) return false;
    }
    return true;
  }

  function goldenMapsIn(state) {
    let count = 0;
    MAPS.forEach((_, index) => { if (mapGoldenIn(state, index)) count += 1; });
    return count;
  }

  // Das Reise-Schild an der Lok: ein Stern je fertiger Karte der ersten
  // Reise, und je fertiger Karte der zweiten wird einer davon zum Goldstern.
  function plateStarsIn(state) {
    let stars = 0;
    let gold = 0;
    MAPS.forEach((map, index) => {
      if (!mapFinishedIn(state, index)) return;
      if (map.lap === 1) stars += 1;
      else if (map.reward?.part === "plate") gold += 1;
    });
    return { stars, gold };
  }

  function tempoIn(state) { return state?.tempo === "langsam" ? "langsam" : "normal"; }

  function rewardsIn(state) {
    const list = MAPS.filter((_, index) => mapFinishedIn(state, index)).map((map) => map.reward.id);
    const golden = goldenMapsIn(state);
    BONUSES.forEach((bonus) => { if (golden >= bonus.after) list.push(bonus.id); });
    return list;
  }

  // Für Adminbereich und Gruppe: derselbe Stand, aus einem fremden Kasten.
  function progressFor(raw) {
    const state = merge(obj(raw), EMPTY);
    const current = currentIn(state);
    const lap = lapOf(Math.min(current, STATION_COUNT));
    const entries = Object.values(state.done);
    const plate = plateStarsIn(state);
    return {
      station: current,
      lap: lap.nr,
      lapFirst: lap.first,
      lapTotal: lap.total,
      lapStation: Math.min(lap.total + 1, current - lap.first + 1),
      done: entries.length,
      finishedMaps: finishedMapsIn(state),
      goldenMaps: goldenMapsIn(state),
      golden: entries.filter((entry) => (Number(entry?.stars) || 0) >= 3).length,
      pushed: entries.filter((entry) => entry?.pushed).length,
      stars: plate.stars,
      goldStars: plate.gold,
      tempo: tempoIn(state),
      firstLapComplete: current > LAPS[0].last,
      complete: current > STATION_COUNT,
    };
  }

  function current() { return currentIn(read()); }
  function plateStars() { return plateStarsIn(read()); }
  function tempo() { return tempoIn(read()); }
  // Das Reisetempo umstellen – auf dem eigenen Gerät; der Admin schreibt es
  // für ein fremdes Konto direkt in dessen Kasten (firebase.js).
  function setTempo(value) {
    store.update((old) => {
      const state = merge(obj(old), EMPTY);
      state.tempo = value === "langsam" ? "langsam" : "normal";
      state.tempoAt = Date.now();
      return state;
    });
  }
  function isDone(nr) { return isDoneIn(read(), nr); }
  function doneInfo(nr) { return obj(read().done)[String(nr)] || null; }
  function triesFor(nr) { return Number(obj(read().tries)[String(nr)]) || 0; }
  function hasReward(id) { return rewardsIn(read()).includes(id); }
  function finishedMaps() { return finishedMapsIn(read()); }
  function goldenMaps() { return goldenMapsIn(read()); }
  function mapFinished(mapIndex) { return mapFinishedIn(read(), mapIndex); }
  function mapGolden(mapIndex) { return mapGoldenIn(read(), mapIndex); }
  // Alle Stationen mit goldenem Stempel.
  function goldenStations() {
    const done = obj(read().done);
    return Object.keys(done).map(Number).filter((nr) => (Number(done[nr]?.stars) || 0) >= 3).sort((a, b) => a - b);
  }

  // Ob eine Variante der Werkstatt (oder eine Landschaft) noch gesperrt ist.
  // Zurück kommt, was sie freischaltet – die Karte oder der Bonus, mit einem
  // Satz für die Beschriftung –, oder null, wenn sie frei ist.
  function lockFor(part, value) {
    const id = LOCKS[part]?.[value];
    if (!id || hasReward(id)) return null;
    const map = MAPS.find((entry) => entry.reward.id === id);
    if (map) return { nr: map.nr, name: map.name, text: `Karte ${map.nr}: ${map.name}`, map };
    const bonus = BONUSES.find((entry) => entry.id === id);
    return bonus ? { nr: null, name: bonus.label, text: bonus.text, bonus } : null;
  }

  // Der Stempel. Zurück kommt, ob er neu ist und ob er golden ist – die Karte
  // feiert das eine anders als das andere.
  function markDone(nr, result = {}) {
    const stars = Math.max(1, Math.min(3, Math.round(Number(result.stars) || 1)));
    let first = false;
    let improved = false;
    store.update((old) => {
      const state = merge(obj(old), EMPTY);
      const known = state.done[String(nr)];
      first = !known;
      improved = !known || stars > (Number(known.stars) || 0);
      state.done[String(nr)] = {
        stars: Math.max(stars, Number(known?.stars) || 0),
        game: String(result.game || known?.game || ""),
        at: Date.now(),
      };
      delete state.tries[String(nr)];
      return state;
    });
    return { first, improved, gold: stars >= 3 };
  }

  // Die Schiebelok: ob sie an dieser Station fällig ist, und der Schub selbst.
  // Die Station gilt danach als gefahren, nicht als geschafft – kein Gold,
  // aber die Karte kann fertig werden, und die Station lässt sich später
  // noch einmal spielen; ein echter Stempel ersetzt den Schub.
  function needsPush(nr) { return !isDone(nr) && triesFor(nr) >= TRIES_FOR_PUSH; }
  function pushThrough(nr) {
    let pushed = false;
    store.update((old) => {
      const state = merge(obj(old), EMPTY);
      if (state.done[String(nr)]) return state;
      state.done[String(nr)] = { stars: 0, pushed: true, game: "", at: Date.now() };
      delete state.tries[String(nr)];
      pushed = true;
      return state;
    });
    return pushed;
  }

  function recordTry(nr) {
    let count = 0;
    store.update((old) => {
      const state = merge(obj(old), EMPTY);
      if (state.done[String(nr)]) return state;
      count = (Number(state.tries[String(nr)]) || 0) + 1;
      state.tries[String(nr)] = count;
      return state;
    });
    return count;
  }

  function choose(nr, game) {
    store.update((old) => {
      const state = merge(obj(old), EMPTY);
      state.choice[String(nr)] = String(game);
      return state;
    });
  }

  function useAlt(nr) {
    store.update((old) => {
      const state = merge(obj(old), EMPTY);
      state.alt[String(nr)] = true;
      return state;
    });
  }

  // ---------------------------------------------------------------------------
  // Gesehen: was die Karte zuletzt gezeigt hat
  // ---------------------------------------------------------------------------
  function readSeen() {
    try {
      const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || "null");
      if (!raw || typeof raw !== "object") return null;
      return {
        station: Number(raw.station) || 1,
        gold: Array.isArray(raw.gold) ? raw.gold.map(Number) : [],
        goldenMaps: Number(raw.goldenMaps) || 0,
        pushed: Array.isArray(raw.pushed) ? raw.pushed.map(Number) : [],
      };
    } catch { return null; }
  }

  function writeSeen(seen) {
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify({
        station: seen.station, gold: seen.gold || [], goldenMaps: Number(seen.goldenMaps) || 0, pushed: seen.pushed || [],
      }));
    } catch { /* privater Modus */ }
  }

  // ---------------------------------------------------------------------------
  // Adressen
  // ---------------------------------------------------------------------------
  // Karte → Spiel: die Station hängt an der Adresse. Spiel → Karte: zurück
  // aufs Startbild mit der Bitte, gleich die Karte zu zeigen.
  function urlFor(task) { return `${task.page}?station=${encodeURIComponent(task.nr)}`; }
  function mapUrl(nr = null) { return nr ? `index.html?reise=1&station=${encodeURIComponent(nr)}` : "index.html?reise=1"; }

  // Der Auftrag, mit dem diese Spielseite geöffnet wurde – oder null. Geprüft
  // wird, dass die Station wirklich zu dieser Seite gehört: ein verirrter
  // Parameter darf kein fremdes Spiel in die Reise ziehen.
  function fromLocation() {
    let nr = 0;
    try { nr = Number(new URLSearchParams(window.location.search).get("station")); } catch { nr = 0; }
    if (!Number.isInteger(nr) || nr < 1 || nr > STATION_COUNT) return null;
    const task = taskFor(nr);
    if (!task || task.choice) return null;
    let page = "";
    try { page = window.location.pathname.split("/").pop() || "index.html"; } catch { page = ""; }
    if (page && task.page !== page) return null;
    return task;
  }

  // Der Satz für den Lautsprecher, wenn ein Spiel mit Auftrag öffnet.
  function describe(task) {
    if (!task) return "";
    return `Reise${(task.lap || lapOf(task.nr).nr) === 2 ? " 2" : ""}, Station ${task.nr}: ${task.title}. ${task.speech}`;
  }

  window.LernappReise = {
    KEY, SEEN_KEY, MAPS, LAPS, GAMES, AREAS, WORLDS, LOCKS, BONUSES, STATION_COUNT, STATIONS_PER_MAP,
    TRIES_FOR_ALT, TRIES_FOR_PUSH, LEVEL_MAX, MEMORY_SIZES, CATALOG_PER_WORLD,
    stationAt, taskFor, altTaskFor, mapIndexOf, lapOf,
    read, current, isDone, doneInfo, triesFor, markDone, recordTry, choose, useAlt, needsPush, pushThrough,
    tempo, setTempo, plateStars,
    hasReward, lockFor, finishedMaps, mapFinished, goldenMaps, mapGolden, goldenStations, progressFor, merge,
    readSeen, writeSeen, urlFor, mapUrl, fromLocation, describe,
    onChange: (fn) => store.onChange(fn),
  };
})();
