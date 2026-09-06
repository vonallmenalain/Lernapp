/*
 * train-progress.js – Der Fortschritt des Zugs.
 *
 * Rechnet aus, wie weit jeder der fünf Bereiche ist, und übersetzt das in die
 * Ausbauschritte des zugehörigen Wagens. Enthält keinerlei Grafik: train-art.js
 * zeichnet, train-home.js baut die Bühne, diese Datei rechnet nur.
 *
 * Wird nach app.js geladen und liest window.LernappLevelCatalog. Absichtlich
 * ohne Zugriff auf app.js-Interna, damit sich beide unabhängig ändern können.
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Die fünf Bereiche
  // ---------------------------------------------------------------------------
  // Jeder Bereich hat eine Farbe, ein Symbol und fünf Spiele. Welche Bauart
  // sein Wagen hat, sagt nicht der Bereich, sondern das Wagen-Set (unten):
  // derselbe Bereich hat im ersten Set einen Kastenwagen und im zweiten ein
  // Einhorn. Farbe und Symbol bleiben über die Sets gleich – das ist es, woran
  // ein Kind seinen Bereich wiedererkennt, wenn die Wagen wechseln.
  //
  // Reihenfolge = Reihenfolge im Zug von links nach rechts. Die Lok steht rechts
  // davor, Zahl & Buchstabe hängt also direkt an ihr.
  const AREAS = [
    {
      id: "gedaechtnis",
      label: "Gedächtnis",
      color: "#7C5CE6",
      icon: "brain",
      games: [
        { id: "backpack", title: "Rucksack packen", page: "backpack.html", ownProgress: "backpack" },
        { id: "memory", title: "Memory", page: "memory.html", ownProgress: "memory" },
        { id: "beachTreasure", title: "Strand-Schätze", page: "strandschatz.html", ownProgress: "beachTreasure" },
        { id: "tileMemory", title: "Kacheln-Knobeln", page: "kacheln.html", ownProgress: "tileMemory" },
        { id: "missingItem", title: "Was fehlt?", page: "wasfehlt.html", ownProgress: "missingItem" },
      ],
    },
    {
      id: "konzentration",
      label: "Konzentration",
      color: "#00A5B5",
      icon: "target",
      games: [
        { id: "flanker", title: "Schwarm-Fokus", page: "schwarmfokus.html", ownProgress: "flanker" },
        { id: "trackRouter", title: "Weichen-Wirrwarr", page: "weichen.html", ownProgress: "trackRouter" },
        { id: "fishPond", title: "Fischteich", page: "fischteich.html", ownProgress: "fishPond" },
        { id: "gridlock", title: "Freie Fahrt", page: "freiefahrt.html", ownProgress: "gridlock" },
        { id: "goSignal", title: "Halt am Signal", page: "signal.html", ownProgress: "goSignal" },
      ],
    },
    {
      id: "geschwindigkeit",
      label: "Geschwindigkeit",
      color: "#F5A623",
      icon: "bolt",
      games: [
        { id: "tiersprung", title: "Tier-Sprung", page: "tiersprung.html", ownProgress: "runner" },
        { id: "cardMatch", title: "Karten-Merker", page: "kartenmerker.html", ownProgress: "cardMatch" },
        { id: "leafFlow", title: "Blätter im Strom", page: "blaetter.html", ownProgress: "leafFlow" },
        { id: "towerStack", title: "Turmbau", page: "turmbau.html", ownProgress: "towerStack" },
        { id: "twinSpot", title: "Doppelt gleich", page: "doppelt.html", ownProgress: "twinSpot" },
      ],
    },
    {
      id: "problemloesen",
      label: "Problemlösen",
      color: "#3FA34D",
      icon: "puzzle",
      games: [
        { id: "spatialPuzzle", title: "Raumdetektiv", page: "raumdetektiv.html", ownProgress: "spatial" },
        { id: "arukone", title: "Arukone", page: "arukone.html" },
        { id: "bimaru", title: "Battleships", page: "bimaru.html" },
        { id: "shikaku", title: "Tiergehege", page: "shikaku.html" },
        { id: "craneStack", title: "Fässer stapeln", page: "faesser.html", ownProgress: "craneStack" },
      ],
    },
    {
      id: "zahlbuchstabe",
      label: "Zahl und Buchstabe",
      color: "#E8543F",
      icon: "abc",
      games: [
        { id: "letterPuzzle", title: "Buchstabenjagd", page: "buchstaben.html" },
        { id: "readingPuzzle", title: "Wortdetektiv", page: "wortdetektiv.html" },
        { id: "kakuro", title: "Kakuro", page: "kakuro.html" },
        { id: "hidoku", title: "Hidoku", page: "hidoku.html" },
        { id: "numberLine", title: "Wo hält der Zug?", page: "zahlengleis.html", ownProgress: "numberLine" },
      ],
    },
  ];

  const AREA_BY_ID = Object.fromEntries(AREAS.map((area) => [area.id, area]));
  const AREA_BY_GAME = {};
  AREAS.forEach((area) => area.games.forEach((game) => { AREA_BY_GAME[game.id] = area; }));

  // ---------------------------------------------------------------------------
  // Die Wagen-Sets
  // ---------------------------------------------------------------------------
  // Ein Set sagt zweierlei: wie die fünf Wagen aussehen, und wie schnell sie
  // wachsen. Beides gehört zusammen, weil beides zugleich wechselt – der Admin
  // stellt auf das nächste Set um, alle Wagen beginnen bei 0, und von da an
  // dauert es länger, bis einer fertig ist.
  //
  // stepAt: nach wie vielen gespielten Runden oder Leveln ein Spiel seinen
  // ersten, zweiten und dritten Schritt freigibt. Die letzte Zahl ist damit
  // auch, wie oft ein Spiel gespielt sein muss, bis es "geschafft" ist.
  //
  //   Set 1: 1, 3, 5 – der erste Erfolg verändert den Zug sofort, danach alle
  //          zwei Runden ein Schritt. Fünfundzwanzig Runden je Wagen.
  //   Set 2: 3, 6, 9 – jede dritte Runde ein Schritt, fünfundvierzig je
  //          Wagen. Fast doppelt so lang wie das erste, wie gewünscht.
  const SETS = [
    {
      id: "1",
      label: "Güterzug",
      stepAt: [1, 3, 5],
      wagons: {
        gedaechtnis: "boxcar",
        konzentration: "tank",
        geschwindigkeit: "flat",
        problemloesen: "crane",
        zahlbuchstabe: "mail",
      },
    },
    {
      id: "2",
      label: "Abenteuerzug",
      stepAt: [3, 6, 9],
      wagons: {
        gedaechtnis: "unicorn",
        konzentration: "whale",
        geschwindigkeit: "robot",
        problemloesen: "dragon",
        zahlbuchstabe: "ship",
      },
    },
  ];
  const SET_BY_ID = Object.fromEntries(SETS.map((set) => [set.id, set]));
  const DEFAULT_SET = SETS[0];

  // Welches Set gilt, steht auf dem Gerät. Hingeschrieben wird es von
  // firebase.js, das den Wechsel aus der Cloud erfährt – ohne Konto und ohne
  // Netz gilt, was zuletzt ankam, und ganz am Anfang das erste Set.
  const SET_KEY = "lernapp.train.set";

  function readActiveSetId() {
    try {
      const raw = JSON.parse(localStorage.getItem(SET_KEY) || "null");
      const id = raw && typeof raw === "object" ? String(raw.id || "") : String(raw || "");
      return SET_BY_ID[id] ? id : DEFAULT_SET.id;
    } catch { return DEFAULT_SET.id; }
  }

  function activeSet() { return SET_BY_ID[readActiveSetId()] || DEFAULT_SET; }

  function wagonFor(areaId, set = activeSet()) {
    return set.wagons[areaId] || DEFAULT_SET.wagons[areaId] || "boxcar";
  }

  // ---------------------------------------------------------------------------
  // Ausbauschritte
  // ---------------------------------------------------------------------------
  // Fünfzehn Schritte je Wagen, drei je Spiel: jeder Wagen hat fünf Spiele, und
  // jedes davon baut genau drei Teile an. So ist jeder Schritt einem Spiel
  // zuzuordnen, und ein Kind sieht nach dem Spielen genau, was dazugekommen
  // ist – nicht einen Balken, der ein bisschen voller wurde.
  //
  // Nach sechs Schritten steht der Wagen (zwei Spiele ganz gespielt): das ist
  // die Marke, an der eine neue Landschaft frei wird. Danach wird beladen bzw.
  // verwandelt; fertig ist er mit allen fünfzehn.
  const STEPS_PER_GAME = 3;
  const STAGE_COUNT = 15;
  const BUILT_STAGE = 6;

  // Wie viele Schritte ein Spiel mit so vielen gespielten Runden freigibt.
  function stepsFor(plays, stepAt = activeSet().stepAt) {
    let steps = 0;
    stepAt.forEach((at) => { if (plays >= at) steps += 1; });
    return Math.min(STEPS_PER_GAME, steps);
  }

  // ---------------------------------------------------------------------------
  // Fortschritt lesen
  // ---------------------------------------------------------------------------
  // Dieselben Quellen wie app.js: angemeldet aus der Cloud, sonst lokal. Der
  // lokale Schlüssel bleibt kompatibel, damit bestehender Fortschritt zählt.
  const LOCAL_SOLVED_PREFIX = "lernapp.solved.";
  const RUNNER_KEY = "lernapp.tiersprung.progress";
  const RUNNER_LEVEL_COUNT = 10;
  const CARDMATCH_KEY = "lernapp.cardmatch";
  const BEACH_KEY = "lernapp.beachtreasure";
  const FLANKER_KEY = "lernapp.flanker";
  const TRACK_KEY = "lernapp.trackrouter";
  const BACKPACK_KEY = "lernapp.backpack";
  const MEMORY_KEY = "lernapp.memory";
  const RAUM_KEY = "lernapp.raumdetektiv";
  const TILE_KEY = "lernapp.kacheln";
  const POND_KEY = "lernapp.fischteich";
  const LEAF_KEY = "lernapp.blaetter";
  const TOWER_KEY = "lernapp.turmbau";
  const GRIDLOCK_KEY = "lernapp.freiefahrt";
  const MISSING_KEY = "lernapp.wasfehlt";
  const SIGNAL_KEY = "lernapp.signal";
  const TWINS_KEY = "lernapp.doppelt";
  const BARRELS_KEY = "lernapp.faesser";
  const NUMBERLINE_KEY = "lernapp.zahlengleis";
  // Die Kartenzahlen, die Memory zur Wahl stellt.
  const MEMORY_SIZES = [8, 12, 16, 20, 24];
  // So viele Bestwerte behält eine Bestenliste – unabhängig davon, wie viele
  // Runden ein Set für den Wagen verlangt.
  const SCORES_KEPT = 5;

  // Wie ein Spiel zählt – für den Satz, den der Lautsprecher vorliest.
  const LEVEL_UNIT = { plural: "Level", dative: "Leveln" };
  const ROUND_UNIT = { plural: "Runden", dative: "Runden" };

  function cloud() { return window.LernappFirebase || null; }
  function kids() { return window.LernappKids || null; }
  function catalog() { return window.LernappLevelCatalog || {}; }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  // ---------------------------------------------------------------------------
  // Woher der Stand kommt
  // ---------------------------------------------------------------------------
  // Normalerweise vom eigenen Gerät und aus dem eigenen Konto. Auf dem
  // Startbild stehen aber auch die Züge der Gruppe, und deren Stand liegt
  // weder im localStorage noch im Fortschritt dieses Kontos.
  //
  // Statt jede Rechnung ein zweites Mal für fremde Konten zu schreiben, hängen
  // alle drei Zugriffe an einer austauschbaren Quelle: gelöst?, wie viele
  // Sterne?, und der Kasten eines Spiels mit eigenem Konto. Die Rechnung
  // darüber bleibt dieselbe – und damit auch das, was ein Wagen bedeutet.
  const LOCAL_SOURCE = {
    isSolved(level) {
      if (cloud()?.isSignedIn?.()) return Boolean(cloud()?.isLevelSolved?.(level));
      try {
        const id = level.id || level.levelName;
        return localStorage.getItem(`${LOCAL_SOLVED_PREFIX}${level.game}.${id}`) === "1";
      } catch { return false; }
    },
    stars(level) {
      return kids()?.getStars?.(level.game, level.id || level.levelName) || 0;
    },
    gameState(key) {
      return readJSON(key, null);
    },
  };

  let source = LOCAL_SOURCE;

  // Ein fremdes Konto, so wie firebase.js es liefert: eine Liste gelöster
  // Level als "spiel.levelId" und die Spielstände der Spiele mit eigenem Konto.
  //
  // Sterne fehlen mit Absicht. Sie stehen bei den Katalog-Spielen nur auf dem
  // Gerät, das sie vergeben hat, und wandern nicht in die Cloud – ein fremder
  // Zug hätte davon also nur eine erfundene Zahl. Für die Schritte eines
  // Wagens zählen ohnehin gespielte Level, nicht Sterne.
  function accountSource(account = {}) {
    const solved = new Set(Array.isArray(account.solved) ? account.solved : []);
    const states = account.gameState && typeof account.gameState === "object" ? account.gameState : {};
    return {
      isSolved: (level) => solved.has(`${level.game}.${level.id || level.levelName}`),
      stars: () => 0,
      gameState: (key) => {
        const entry = states[key];
        return entry && typeof entry === "object" && entry.data ? entry.data : null;
      },
    };
  }

  // Rechnet einen Block mit einer anderen Quelle. Danach gilt wieder die alte:
  // die Bühne fragt zwischen zwei fremden Zügen immer wieder den eigenen ab.
  function withSource(next, fn) {
    const previous = source;
    source = next || LOCAL_SOURCE;
    try { return fn(); } finally { source = previous; }
  }

  function isSolved(level) { return source.isSolved(level); }

  function levelStars(level) { return source.stars(level); }

  function gameState(key) { return source.gameState(key); }

  // ---------------------------------------------------------------------------
  // Aus gespielten Runden werden Schritte
  // ---------------------------------------------------------------------------
  // Alle fünfundzwanzig Spiele zählen am Ende dasselbe: wie oft wurde gespielt – ein
  // Level gelöst, eine Runde zu Ende gebracht, eine Kartenzahl geschafft. Wie
  // ein Spiel zu dieser Zahl kommt, steht bei ihm; was die Zahl bedeutet, steht
  // hier, einmal für alle. Sonst hiesse ein Schritt in jedem Spiel etwas
  // anderes.
  //
  // Die drei Bänder an der Kiste des Wagens sind die drei Schritte: jedes füllt
  // sich, bis sein Schritt steht, und dann füllt sich das nächste. So ist auch
  // ohne Zahl zu sehen, wie weit es bis zum nächsten Teil noch ist.
  function fromPlays(game, plays, { stars = [], unit = LEVEL_UNIT } = {}) {
    const stepAt = activeSet().stepAt;
    const total = stepAt[stepAt.length - 1];
    const solved = Math.max(0, Math.min(total, Math.floor(Number(plays) || 0)));
    const steps = stepsFor(solved, stepAt);

    const worlds = stepAt.map((at, index) => {
      const from = index ? stepAt[index - 1] : 0;
      const ratio = Math.max(0, Math.min(1, (solved - from) / (at - from)));
      return { key: `schritt-${index + 1}`, solved: solved >= at ? 1 : 0, total: 1, ratio };
    });

    // Sterne: die besten Ergebnisse der gezählten Runden. Für den Wagen zählen
    // sie nicht, aber die Bestenliste und der Adminbereich wollen sie kennen.
    const counted = [...stars]
      .map((value) => Math.max(0, Math.min(3, Number(value) || 0)))
      .sort((a, b) => b - a)
      .slice(0, solved);

    return {
      id: game.id,
      title: game.title,
      page: game.page,
      solved,
      total,
      ratio: total ? solved / total : 0,
      steps,
      stepAt: [...stepAt],
      stars: counted.reduce((sum, value) => sum + value, 0),
      maxStars: total * 3,
      unit,
      worlds,
    };
  }

  // Tier-Sprung führt sein eigenes Konto: zehn Level, keine Welten, eigener
  // Speicherschlüssel. Gezählt wird, wie viele davon geschafft sind – welche,
  // ist gleich: alle zehn zu verlangen hiesse, das schwerste Tier entscheidet
  // über den ganzen Wagen.
  function runnerProgress(game) {
    const stored = gameState(RUNNER_KEY) || {};
    const best = stored.best && typeof stored.best === "object" ? stored.best : {};
    const stars = [];
    for (let id = 1; id <= RUNNER_LEVEL_COUNT; id += 1) {
      const entry = best[id] || best[String(id)] || null;
      if (entry) stars.push(Number(entry.stars) || 1);
    }
    return fromPlays(game, stars.length, { stars });
  }

  // Ein Katalog-Spiel: gezählt werden gelöste Level, egal aus welcher Welt. Bei
  // vierzig Leveln je Spiel hiesse alles zu verlangen: ein Wagen, den kein Kind
  // je fertig sieht.
  function catalogProgress(game) {
    const levels = catalog()[game.id] || [];
    const geschafft = levels.filter(isSolved);
    return fromPlays(game, geschafft.length, { stars: geschafft.map(levelStars) });
  }

  // Karten-Merker, Strand-Schätze und die anderen Spiele mit Bestenliste laufen
  // nicht über Level, sondern über Runden. Gezählt wird jede zu Ende gespielte
  // Runde, unabhängig davon, wie viele Punkte dabei herauskamen – wer übt,
  // kommt voran, und wer einen schlechten Tag hat, auch. Die Sterne kommen aus
  // den besten Ergebnissen, damit die Bestenliste im Wagen sichtbar wird.
  //
  // gut = ab wie vielen Punkten eine Runde drei Sterne wert ist. Der
  // Karten-Merker zählt zwei Punkte je Karte, Strand-Schätze einen je Schatz –
  // dieselbe Schwelle wäre für das eine geschenkt und für das andere unerreichbar.
  function runsProgress(key, gut) {
    return (game) => {
      const stored = gameState(key) || {};
      const runs = Math.max(0, Number(stored.runs) || 0);
      const scores = Array.isArray(stored.scores) ? stored.scores.filter((n) => Number.isFinite(n)) : [];
      const stars = [];
      for (let i = 0; i < runs; i += 1) stars.push(starsForScore(scores[i], gut));
      return fromPlays(game, runs, { stars, unit: ROUND_UNIT });
    };
  }

  function starsForScore(score, gut) {
    const points = Number(score) || 0;
    if (points >= gut) return 3;
    if (points >= gut / 2) return 2;
    return 1;
  }

  // Memory zählt gespielte Runden – und, für Stände von früher, die geschafften
  // Kartenzahlen: bevor das Spiel Runden zählte, stand nur je Grösse "geschafft"
  // da, und dieser Stand soll nicht verloren gehen. Runden sind nie weniger als
  // geschaffte Grössen, also zählt das Grössere von beidem. Bewertet wird
  // nichts – geschafft ist geschafft, also drei Sterne.
  function memoryProgress(game) {
    const stored = gameState(MEMORY_KEY) || {};
    const best = stored.best && typeof stored.best === "object" ? stored.best : {};
    const sizes = MEMORY_SIZES.filter((size) => (Number(best[size]?.stars) || 0) > 0).length;
    const runs = Math.max(0, Number(stored.runs) || 0);
    const plays = Math.max(runs, sizes);
    return fromPlays(game, plays, { stars: Array.from({ length: plays }, () => 3) });
  }

  // Weichen-Wirrwarr, Freie Fahrt und Fässer stapeln zählen abgeschlossene
  // Level, nicht Runden: zehn bzw. zwölf stehen zur Wahl, und beliebige davon
  // bauen den Wagen. Wer die leichten spielt, kommt genauso an wie wer die
  // schweren spielt – die Sterne unterscheiden das.
  function bestenLevelProgress(key) {
    return (game) => {
      const stored = gameState(key) || {};
      const best = stored.best && typeof stored.best === "object" ? stored.best : {};
      const stars = Object.values(best)
        .map((entry) => Math.max(0, Math.min(3, Number(entry?.stars) || 0)))
        .filter((value) => value > 0);
      return fromPlays(game, stars.length, { stars });
    };
  }

  const OWN_PROGRESS = {
    runner: runnerProgress,
    cardMatch: runsProgress(CARDMATCH_KEY, 40),
    beachTreasure: runsProgress(BEACH_KEY, 12),
    flanker: runsProgress(FLANKER_KEY, 30),
    backpack: runsProgress(BACKPACK_KEY, 12),
    trackRouter: bestenLevelProgress(TRACK_KEY),
    gridlock: bestenLevelProgress(GRIDLOCK_KEY),
    craneStack: bestenLevelProgress(BARRELS_KEY),
    memory: memoryProgress,
    // Raumdetektiv legt keine Punktzahl ab, sondern die Sterne der Runde: die
    // Bewertung steht schon fest, wenn die zehn Aufgaben durch sind. Drei
    // Sterne sind damit die "gute" Runde.
    spatial: runsProgress(RAUM_KEY, 3),
    // Beide zählen wie die Strand-Schätze einen Punkt je Kachel bzw. Fisch –
    // die Sternschwelle liegt deshalb in derselben Grössenordnung.
    tileMemory: runsProgress(TILE_KEY, 14),
    fishPond: runsProgress(POND_KEY, 14),
    // Blätter im Strom zählt einen Punkt je richtig gewischter Welle. In
    // fünfundvierzig Sekunden geht Welle um Welle – sechzehn davon richtig ist
    // eine gute Runde, mehr schafft nur, wer die Regel im Schlaf umschaltet.
    leafFlow: runsProgress(LEAF_KEY, 16),
    // Turmbau zählt einen Punkt je gestapeltem Block. Vierzehn Blöcke sind eine
    // gute Runde: bis dahin schwingt der Block schon halb so lang wie am Anfang,
    // und mehr schafft nur, wer den Takt wirklich trifft.
    towerStack: runsProgress(TOWER_KEY, 14),
    // Was fehlt? zählt einen Punkt je richtig kontrolliertem Wagen. Acht sind
    // eine gute Runde: bis dahin liegen zehn Stücke Fracht auf dem Wagen.
    missingItem: runsProgress(MISSING_KEY, 8),
    // Halt am Signal zählt jeden richtig durchgelassenen und jeden richtig
    // abgewarteten Zug, ein Tipp bei Rot kostet zwei. In fünfundvierzig
    // Sekunden kommen gut fünfundzwanzig Züge; zweiundzwanzig Punkte heisst:
    // fast alle richtig und höchstens einmal bei Rot getippt. Wer immer tippt,
    // landet bei sechs (scripts/validate-signal.mjs rechnet das nach).
    goSignal: runsProgress(SIGNAL_KEY, 22),
    // Doppelt gleich zählt gefundene Paare in fünfundvierzig Sekunden. Zwanzig
    // heisst: alle gut zwei Sekunden eines, bei Karten mit bis zu sechs Bildern.
    twinSpot: runsProgress(TWINS_KEY, 20),
    // Wo hält der Zug? gibt je Zahl bis zu drei Punkte für die Nähe, zehn Zahlen
    // je Runde. Fünfundzwanzig von dreissig ist eine gute Runde.
    numberLine: runsProgress(NUMBERLINE_KEY, 25),
  };

  // Die Spiele mit eigenem Konto legen ihren Stand nicht im Levelkatalog ab,
  // sondern jedes in seinem eigenen Kasten. Damit der Zug sie auch auf
  // einem frischen Gerät kennt, werden die Kästen hier angemeldet: game-cloud.js
  // spiegelt sie in den lokalen Speicher, aus dem diese Datei liest, und meldet
  // sich, wenn aus der Cloud etwas Neues kommt.
  const cloudGames = window.LernappGameCloud;
  if (cloudGames) {
    const redraw = () => document.dispatchEvent(new CustomEvent("lernapp:progress-changed"));
    cloudGames.register({ key: RUNNER_KEY, empty: { unlocked: 1, best: {} }, merge: cloudGames.mergeLevels }).onChange(redraw);
    cloudGames.register({ key: TRACK_KEY, empty: { best: {} }, merge: cloudGames.mergeLevels }).onChange(redraw);
    cloudGames.register({ key: GRIDLOCK_KEY, empty: { best: {} }, merge: cloudGames.mergeLevels }).onChange(redraw);
    cloudGames.register({ key: BARRELS_KEY, empty: { best: {} }, merge: cloudGames.mergeLevels }).onChange(redraw);
    cloudGames.register({ key: MEMORY_KEY, empty: { best: {} }, merge: cloudGames.mergeLevels }).onChange(redraw);
    [CARDMATCH_KEY, BEACH_KEY, FLANKER_KEY, BACKPACK_KEY, RAUM_KEY, TILE_KEY, POND_KEY, LEAF_KEY, TOWER_KEY,
      MISSING_KEY, SIGNAL_KEY, TWINS_KEY, NUMBERLINE_KEY].forEach((key) => {
      cloudGames.register({ key, empty: { runs: 0, scores: [] }, merge: cloudGames.mergeScores(SCORES_KEPT) }).onChange(redraw);
    });
  }

  function gameProgress(gameId) {
    const area = AREA_BY_GAME[gameId];
    const game = area?.games.find((entry) => entry.id === gameId);
    if (!game) return null;
    const own = OWN_PROGRESS[game.ownProgress];
    return own ? own(game) : catalogProgress(game);
  }

  // Bereichsfortschritt: die Schritte der fünf Spiele zusammengezählt.
  //
  // Jedes Spiel zählt gleich viel, egal wie viele Level es hat: Kakuro hat
  // vierzig, der Karten-Merker gar keine. Über die Schritte wächst ein Wagen
  // nur, wenn das Kind alle Spiele seines Bereichs anfasst – der Wagen steht
  // für den Bereich, nicht für ein einzelnes Spiel.
  //
  // ratio ist feiner als die Schritte: der Mittelwert der Spielanteile. Daran
  // sieht der Adminbereich, ob bis zum nächsten Schritt eine Runde fehlt oder
  // drei, und danach sortiert das Startbild die Wagen eines fremden Zugs.
  function areaProgress(areaId) {
    const area = AREA_BY_ID[areaId];
    if (!area) return null;
    const set = activeSet();

    const games = area.games.map((game) => gameProgress(game.id)).filter(Boolean);
    const playable = games.filter((game) => game.total > 0);
    const ratio = playable.length
      ? playable.reduce((sum, game) => sum + game.ratio, 0) / playable.length
      : 0;

    const solved = games.reduce((sum, game) => sum + game.solved, 0);
    const total = games.reduce((sum, game) => sum + game.total, 0);
    const stars = games.reduce((sum, game) => sum + game.stars, 0);
    const maxStars = games.reduce((sum, game) => sum + game.maxStars, 0);
    const stage = Math.min(STAGE_COUNT, games.reduce((sum, game) => sum + game.steps, 0));

    return {
      id: area.id,
      label: area.label,
      color: area.color,
      icon: area.icon,
      wagon: wagonFor(area.id, set),
      set: set.id,
      games,
      solved,
      total,
      ratio,
      stars,
      maxStars,
      stage,
      steps: stage,
      built: stage >= BUILT_STAGE,
      complete: stage >= STAGE_COUNT,
    };
  }

  function allAreas() { return AREAS.map((area) => areaProgress(area.id)); }

  // Gesamtfortschritt über alle fünf Wagen – für die Szenen-Freischaltung und
  // als Kurzform in Vorlese-Texten.
  function trainProgress() {
    const areas = allAreas();
    return {
      set: activeSet().id,
      areas,
      ratio: areas.reduce((sum, area) => sum + area.ratio, 0) / areas.length,
      steps: areas.reduce((sum, area) => sum + area.stage, 0),
      builtWagons: areas.filter((area) => area.built).length,
      completeWagons: areas.filter((area) => area.complete).length,
    };
  }

  // Derselbe Zug, nur für ein fremdes Konto der Gruppe: gerechnet wird mit
  // dessen Daten, gerechnet wird aber genau gleich. Ein Wagen bedeutet auf dem
  // fremden Gleis dasselbe wie auf dem eigenen – sonst wäre der Vergleich
  // daneben keiner.
  function areasForAccount(account) {
    return withSource(accountSource(account), allAreas);
  }

  function trainProgressForAccount(account) {
    return withSource(accountSource(account), trainProgress);
  }

  window.LernappTrain = {
    AREAS,
    AREA_BY_ID,
    SETS,
    SET_BY_ID,
    SET_KEY,
    STAGE_COUNT,
    BUILT_STAGE,
    STEPS_PER_GAME,
    activeSet,
    wagonFor,
    stepsFor,
    areaForGame: (gameId) => AREA_BY_GAME[gameId] || null,
    isSolved,
    levelStars,
    gameProgress,
    areaProgress,
    allAreas,
    trainProgress,
    areasForAccount,
    trainProgressForAccount,
  };
})();
