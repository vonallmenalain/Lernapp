/*
 * train-progress.js – Der Fortschritt des Zugs.
 *
 * Rechnet aus, wie weit jeder der fünf Bereiche ist, und übersetzt das in die
 * Ausbaustufe des zugehörigen Wagens. Enthält keinerlei Grafik: train-art.js
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
  // Jeder Bereich hat eine Farbe, ein Symbol und eine eigene Wagenbauart. Die
  // Bauart ist wichtig: Farbe allein trennt fünf Wagen zu schwach – besonders
  // für farbenblinde Kinder –, die Silhouette trennt sie immer.
  //
  // Reihenfolge = Reihenfolge im Zug von links nach rechts. Die Lok steht rechts
  // davor, Zahl & Buchstabe hängt also direkt an ihr.
  const AREAS = [
    {
      id: "gedaechtnis",
      label: "Gedächtnis",
      color: "#7C5CE6",
      icon: "brain",
      wagon: "boxcar",
      games: [
        { id: "backpack", title: "Rucksack packen", page: "backpack.html", ownProgress: "backpack" },
        { id: "memory", title: "Memory", page: "memory.html", ownProgress: "memory" },
        { id: "beachTreasure", title: "Strand-Schätze", page: "strandschatz.html", ownProgress: "beachTreasure" },
        { id: "tileMemory", title: "Kacheln-Knobeln", page: "kacheln.html", ownProgress: "tileMemory" },
      ],
    },
    {
      id: "konzentration",
      label: "Konzentration",
      color: "#00A5B5",
      icon: "target",
      wagon: "tank",
      games: [
        { id: "flanker", title: "Schwarm-Fokus", page: "schwarmfokus.html", ownProgress: "flanker" },
        { id: "trackRouter", title: "Weichen-Wirrwarr", page: "weichen.html", ownProgress: "trackRouter" },
        { id: "fishPond", title: "Fischteich", page: "fischteich.html", ownProgress: "fishPond" },
      ],
    },
    {
      id: "geschwindigkeit",
      label: "Geschwindigkeit",
      color: "#F5A623",
      icon: "bolt",
      wagon: "flat",
      games: [
        { id: "tiersprung", title: "Tier-Sprung", page: "tiersprung.html", ownProgress: "runner" },
        { id: "cardMatch", title: "Karten-Merker", page: "kartenmerker.html", ownProgress: "cardMatch" },
      ],
    },
    {
      id: "problemloesen",
      label: "Problemlösen",
      color: "#3FA34D",
      icon: "puzzle",
      wagon: "crane",
      games: [
        { id: "spatialPuzzle", title: "Raumdetektiv", page: "raumdetektiv.html", ownProgress: "spatial" },
        { id: "arukone", title: "Arukone", page: "arukone.html", ownProgress: "fuenfLevel" },
        { id: "bimaru", title: "Battleships", page: "bimaru.html", ownProgress: "fuenfLevel" },
        { id: "shikaku", title: "Tiergehege", page: "shikaku.html", ownProgress: "fuenfLevel" },
      ],
    },
    {
      id: "zahlbuchstabe",
      label: "Zahl und Buchstabe",
      color: "#E8543F",
      icon: "abc",
      wagon: "mail",
      games: [
        { id: "letterPuzzle", title: "Buchstabenjagd", page: "buchstaben.html" },
        { id: "readingPuzzle", title: "Wortdetektiv", page: "wortdetektiv.html" },
        { id: "kakuro", title: "Kakuro", page: "kakuro.html" },
        { id: "hidoku", title: "Hidoku", page: "hidoku.html" },
      ],
    },
  ];

  const AREA_BY_ID = Object.fromEntries(AREAS.map((area) => [area.id, area]));
  const AREA_BY_GAME = {};
  AREAS.forEach((area) => area.games.forEach((game) => { AREA_BY_GAME[game.id] = area; }));

  // ---------------------------------------------------------------------------
  // Ausbaustufen
  // ---------------------------------------------------------------------------
  // Elf Stufen: 0 ist der blosse Rohbau, 1–5 bauen den Wagen auf, 6–10 beladen
  // ihn. Vorne liegen die Schwellen dicht beieinander, damit sich schon nach
  // wenigen gelösten Levels sichtbar etwas tut – für ein Kind ist ein Zug, der
  // sich nicht bewegt, kein Ziel.
  //
  // Stufe 1 hängt nicht an einer Schwelle, sondern am ersten gelösten Level
  // überhaupt: der erste Erfolg muss den Zug verändern.
  const STAGE_COUNT = 10;
  const BUILT_STAGE = 5;           // ab hier steht der Wagen, danach wird geladen
  const STAGE_THRESHOLDS = [0, 0.08, 0.16, 0.26, 0.38, 0.52, 0.66, 0.78, 0.90, 1];

  function stageFor(ratio, anySolved) {
    if (!anySolved) return 0;
    let stage = 1;
    STAGE_THRESHOLDS.forEach((threshold, index) => {
      if (index > 0 && ratio >= threshold) stage = index + 1;
    });
    return Math.min(STAGE_COUNT, stage);
  }

  // ---------------------------------------------------------------------------
  // Fortschritt lesen
  // ---------------------------------------------------------------------------
  // Dieselben Quellen wie app.js: angemeldet aus der Cloud, sonst lokal. Der
  // lokale Schlüssel bleibt kompatibel, damit bestehender Fortschritt zählt.
  const LOCAL_SOLVED_PREFIX = "lernapp.solved.";
  const RUNNER_KEY = "lernapp.tiersprung.progress";
  const RUNNER_LEVEL_COUNT = 10;
  // Fünf geschaffte Level bauen den Wagen – welche fünf, ist gleich. Zehn zu
  // verlangen hiesse: das schwerste Tier entscheidet über den ganzen Wagen.
  const RUNNER_FOR_DONE = 5;
  const CARDMATCH_KEY = "lernapp.cardmatch";
  const BEACH_KEY = "lernapp.beachtreasure";
  const FLANKER_KEY = "lernapp.flanker";
  const TRACK_KEY = "lernapp.trackrouter";
  const BACKPACK_KEY = "lernapp.backpack";
  const MEMORY_KEY = "lernapp.memory";
  const RAUM_KEY = "lernapp.raumdetektiv";
  const TILE_KEY = "lernapp.kacheln";
  const POND_KEY = "lernapp.fischteich";
  // Weichen-Wirrwarr hat zehn Level, aber fünf davon reichen für den Wagen.
  const TRACK_LEVELS_FOR_DONE = 5;
  // Beide Bestenlisten-Spiele gelten nach fünf gespielten Runden als geschafft.
  const RUNS_FOR_DONE = 5;

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

  function isSolved(level) {
    if (cloud()?.isSignedIn?.()) return Boolean(cloud()?.isLevelSolved?.(level));
    try {
      const id = level.id || level.levelName;
      return localStorage.getItem(`${LOCAL_SOLVED_PREFIX}${level.game}.${id}`) === "1";
    } catch { return false; }
  }

  function levelStars(level) {
    return kids()?.getStars?.(level.game, level.id || level.levelName) || 0;
  }

  // Tier-Sprung führt sein eigenes Konto: zehn Level, keine Welten, eigener
  // Speicherschlüssel. Dieser Adapter bringt es auf dieselbe Form wie die
  // Katalog-Spiele, damit der Wagen nichts von der Sonderrolle wissen muss.
  function runnerProgress(game) {
    const stored = readJSON(RUNNER_KEY, null) || {};
    const best = stored.best && typeof stored.best === "object" ? stored.best : {};
    const worlds = [];
    let solved = 0;
    let stars = 0;

    for (let id = 1; id <= RUNNER_LEVEL_COUNT; id += 1) {
      const entry = best[id] || best[String(id)] || null;
      const levelStarCount = Math.max(0, Math.min(3, Number(entry?.stars) || 0));
      if (entry) solved += 1;
      stars += levelStarCount;
      worlds.push({
        key: `level-${id}`,
        solved: entry ? 1 : 0,
        total: 1,
        stars: levelStarCount,
        maxStars: 3,
        ratio: entry ? 1 : 0,
      });
    }

    // Für den Wagen zählen die besten fünf: ein sechstes Level darf den Stand
    // nicht drücken, und wer fünf schafft, ist fertig.
    const besteFuenf = worlds
      .map((world) => world.stars)
      .filter((value) => value > 0)
      .sort((a, b) => b - a)
      .slice(0, RUNNER_FOR_DONE);

    return {
      id: game.id,
      title: game.title,
      page: game.page,
      solved: Math.min(RUNNER_FOR_DONE, solved),
      total: RUNNER_FOR_DONE,
      ratio: Math.min(1, solved / RUNNER_FOR_DONE),
      stars: besteFuenf.reduce((sum, value) => sum + value, 0),
      maxStars: RUNNER_FOR_DONE * 3,
      unit: LEVEL_UNIT,
      worlds: worlds.slice(0, RUNNER_FOR_DONE),
    };
  }

  // Fortschritt eines Katalog-Spiels, aufgeschlüsselt nach Welten. Die Welten
  // ergeben sich aus dem Katalog selbst, damit hier keine zweite Liste der
  // Schwierigkeitsgrade gepflegt werden muss.
  function catalogProgress(game) {
    const levels = catalog()[game.id] || [];
    const groups = new Map();

    levels.forEach((level) => {
      const key = level.difficulty || "easy";
      if (!groups.has(key)) groups.set(key, { key, solved: 0, total: 0, stars: 0, maxStars: 0, ratio: 0 });
      const group = groups.get(key);
      group.total += 1;
      group.maxStars += 3;
      if (isSolved(level)) group.solved += 1;
      group.stars += levelStars(level);
    });

    const worlds = [...groups.values()];
    worlds.forEach((group) => { group.ratio = group.total ? group.solved / group.total : 0; });

    const solved = worlds.reduce((sum, group) => sum + group.solved, 0);
    const total = worlds.reduce((sum, group) => sum + group.total, 0);
    const stars = worlds.reduce((sum, group) => sum + group.stars, 0);

    return {
      id: game.id,
      title: game.title,
      page: game.page,
      solved,
      total,
      ratio: total ? solved / total : 0,
      stars,
      maxStars: total * 3,
      unit: LEVEL_UNIT,
      worlds,
    };
  }

  // Karten-Merker und Strand-Schätze laufen nicht über Level, sondern über
  // Runden mit einer Bestenliste. "Fertig" sind sie nach fünf gespielten
  // Runden, unabhängig davon, wie viele Punkte dabei herauskamen – wer übt,
  // kommt voran, und wer einen schlechten Tag hat, auch. Die Sterne kommen aus
  // den besten Ergebnissen, damit die Bestenliste im Wagen sichtbar wird.
  //
  // gut = ab wie vielen Punkten eine Runde drei Sterne wert ist. Der
  // Karten-Merker zählt zwei Punkte je Karte, Strand-Schätze einen je Schatz –
  // dieselbe Schwelle wäre für das eine geschenkt und für das andere unerreichbar.
  function runsProgress(key, gut) {
    return (game) => {
      const stored = readJSON(key, null) || {};
      const runs = Math.max(0, Math.min(RUNS_FOR_DONE, Number(stored.runs) || 0));
      const scores = Array.isArray(stored.scores) ? stored.scores.filter((n) => Number.isFinite(n)) : [];
      const worlds = [];
      let stars = 0;

      for (let i = 0; i < RUNS_FOR_DONE; i += 1) {
        const done = i < runs;
        const runStars = done ? starsForScore(scores[i], gut) : 0;
        stars += runStars;
        worlds.push({ key: `runde-${i + 1}`, solved: done ? 1 : 0, total: 1, stars: runStars, maxStars: 3, ratio: done ? 1 : 0 });
      }

      return {
        id: game.id,
        title: game.title,
        page: game.page,
        solved: runs,
        total: RUNS_FOR_DONE,
        ratio: runs / RUNS_FOR_DONE,
        stars,
        maxStars: RUNS_FOR_DONE * 3,
        unit: ROUND_UNIT,
        worlds,
      };
    };
  }

  function starsForScore(score, gut) {
    const points = Number(score) || 0;
    if (points >= gut) return 3;
    if (points >= gut / 2) return 2;
    return 1;
  }

  // Fünf abgeschlossene Level bauen den Wagen – welche fünf, ist gleich. Bei
  // vierzig Leveln je Spiel hiesse alles zu verlangen: ein Wagen, den kein Kind
  // je fertig sieht.
  const LEVELS_FOR_DONE = 5;

  function fuenfLevelProgress(game) {
    const levels = catalog()[game.id] || [];
    const geschafft = levels.filter(isSolved);
    const beste = geschafft
      .map(levelStars)
      .sort((a, b) => b - a)
      .slice(0, LEVELS_FOR_DONE);
    const solved = Math.min(LEVELS_FOR_DONE, geschafft.length);
    const worlds = [];
    for (let i = 0; i < LEVELS_FOR_DONE; i += 1) {
      const stars = beste[i] || 0;
      const done = i < solved;
      worlds.push({ key: `level-${i + 1}`, solved: done ? 1 : 0, total: 1, stars, maxStars: 3, ratio: done ? 1 : 0 });
    }
    return {
      id: game.id,
      title: game.title,
      page: game.page,
      solved,
      total: LEVELS_FOR_DONE,
      ratio: solved / LEVELS_FOR_DONE,
      stars: beste.reduce((sum, value) => sum + value, 0),
      maxStars: LEVELS_FOR_DONE * 3,
      unit: LEVEL_UNIT,
      worlds,
    };
  }

  const OWN_PROGRESS = {
    fuenfLevel: fuenfLevelProgress,
    runner: runnerProgress,
    cardMatch: runsProgress(CARDMATCH_KEY, 40),
    beachTreasure: runsProgress(BEACH_KEY, 12),
    flanker: runsProgress(FLANKER_KEY, 30),
    backpack: runsProgress(BACKPACK_KEY, 12),
    trackRouter: trackProgress,
    // Memory zählt geschaffte Kartenzahlen statt Level: fünf Grössen stehen zur
    // Wahl, und wer alle fünf einmal geschafft hat, hat den Wagen gebaut.
    // Bewertet wird nichts – geschafft ist geschafft, also drei Sterne.
    memory: levelSetProgress(MEMORY_KEY, [8, 12, 16, 20, 24]),
    // Raumdetektiv legt keine Punktzahl ab, sondern die Sterne der Runde: die
    // Bewertung steht schon fest, wenn die zehn Aufgaben durch sind. Drei
    // Sterne sind damit die "gute" Runde.
    spatial: runsProgress(RAUM_KEY, 3),
    // Beide zählen wie die Strand-Schätze einen Punkt je Kachel bzw. Fisch –
    // die Sternschwelle liegt deshalb in derselben Grössenordnung.
    tileMemory: runsProgress(TILE_KEY, 14),
    fishPond: runsProgress(POND_KEY, 14),
  };

  // Ein Spiel, das eine feste Liste von Aufgaben führt und jede nur als
  // geschafft oder nicht kennt.
  function levelSetProgress(key, ids) {
    return (game) => {
      const best = readJSON(key, null)?.best || {};
      const worlds = ids.map((id) => {
        const stars = Math.max(0, Math.min(3, Number(best[id]?.stars) || 0));
        return { key: `teil-${id}`, solved: stars ? 1 : 0, total: 1, stars, maxStars: 3, ratio: stars ? 1 : 0 };
      });
      const solved = worlds.filter((world) => world.solved).length;
      return {
        id: game.id,
        title: game.title,
        page: game.page,
        solved,
        total: ids.length,
        ratio: solved / ids.length,
        stars: worlds.reduce((sum, world) => sum + world.stars, 0),
        maxStars: ids.length * 3,
        unit: LEVEL_UNIT,
        worlds,
      };
    };
  }

  // Weichen-Wirrwarr zählt abgeschlossene Level, nicht Runden: zehn stehen zur
  // Wahl, fünf beliebige bauen den Wagen fertig. Wer die leichten fünf fährt,
  // kommt genauso an wie wer die schweren fährt – die Sterne unterscheiden das.
  function trackProgress(game) {
    const stored = readJSON(TRACK_KEY, null) || {};
    const best = stored.best && typeof stored.best === "object" ? stored.best : {};
    // Die besten fünf zählen, damit ein sechstes Level den Stand nicht drückt.
    const sterne = Object.values(best)
      .map((entry) => Math.max(0, Math.min(3, Number(entry?.stars) || 0)))
      .filter((value) => value > 0)
      .sort((a, b) => b - a)
      .slice(0, TRACK_LEVELS_FOR_DONE);

    const worlds = [];
    for (let i = 0; i < TRACK_LEVELS_FOR_DONE; i += 1) {
      const stars = sterne[i] || 0;
      worlds.push({ key: `level-${i + 1}`, solved: stars ? 1 : 0, total: 1, stars, maxStars: 3, ratio: stars ? 1 : 0 });
    }

    return {
      id: game.id,
      title: game.title,
      page: game.page,
      solved: sterne.length,
      total: TRACK_LEVELS_FOR_DONE,
      ratio: sterne.length / TRACK_LEVELS_FOR_DONE,
      stars: sterne.reduce((sum, value) => sum + value, 0),
      maxStars: TRACK_LEVELS_FOR_DONE * 3,
      unit: LEVEL_UNIT,
      worlds,
    };
  }

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
    cloudGames.register({ key: MEMORY_KEY, empty: { best: {} }, merge: cloudGames.mergeLevels }).onChange(redraw);
    [CARDMATCH_KEY, BEACH_KEY, FLANKER_KEY, BACKPACK_KEY, RAUM_KEY, TILE_KEY, POND_KEY].forEach((key) => {
      cloudGames.register({ key, empty: { runs: 0, scores: [] }, merge: cloudGames.mergeScores(RUNS_FOR_DONE) }).onChange(redraw);
    });
  }

  function gameProgress(gameId) {
    const area = AREA_BY_GAME[gameId];
    const game = area?.games.find((entry) => entry.id === gameId);
    if (!game) return null;
    const own = OWN_PROGRESS[game.ownProgress];
    return own ? own(game) : catalogProgress(game);
  }

  // Bereichsfortschritt: Mittelwert über die Spiele, nicht über die Levels.
  //
  // Der Unterschied ist gewollt. Problemlösen hat 160 Levels, Konzentration 24 –
  // ein reiner Levelanteil liesse den einen Wagen fast siebenmal schneller
  // wachsen als den anderen. Über den Mittelwert zählt jedes Spiel gleich viel,
  // und ein Wagen wächst nur, wenn das Kind alle Spiele seines Bereichs anfasst.
  // Der Wagen steht für den Bereich, nicht für ein einzelnes Spiel.
  function areaProgress(areaId) {
    const area = AREA_BY_ID[areaId];
    if (!area) return null;

    const games = area.games.map((game) => gameProgress(game.id)).filter(Boolean);
    const playable = games.filter((game) => game.total > 0);
    const ratio = playable.length
      ? playable.reduce((sum, game) => sum + game.ratio, 0) / playable.length
      : 0;

    const solved = games.reduce((sum, game) => sum + game.solved, 0);
    const total = games.reduce((sum, game) => sum + game.total, 0);
    const stars = games.reduce((sum, game) => sum + game.stars, 0);
    const maxStars = games.reduce((sum, game) => sum + game.maxStars, 0);
    const stage = stageFor(ratio, solved > 0);

    return {
      id: area.id,
      label: area.label,
      color: area.color,
      icon: area.icon,
      wagon: area.wagon,
      games,
      solved,
      total,
      ratio,
      stars,
      maxStars,
      stage,
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
      areas,
      ratio: areas.reduce((sum, area) => sum + area.ratio, 0) / areas.length,
      builtWagons: areas.filter((area) => area.built).length,
      completeWagons: areas.filter((area) => area.complete).length,
    };
  }

  window.LernappTrain = {
    AREAS,
    AREA_BY_ID,
    STAGE_COUNT,
    BUILT_STAGE,
    STAGE_THRESHOLDS,
    areaForGame: (gameId) => AREA_BY_GAME[gameId] || null,
    stageFor,
    isSolved,
    levelStars,
    gameProgress,
    areaProgress,
    allAreas,
    trainProgress,
  };
})();
