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
        { id: "backpack", title: "Rucksack packen", page: "backpack.html" },
        { id: "memory", title: "Memory", page: "memory.html" },
        { id: "beachTreasure", title: "Strand-Schätze", page: "strandschatz.html" },
      ],
    },
    {
      id: "konzentration",
      label: "Konzentration",
      color: "#00A5B5",
      icon: "target",
      wagon: "tank",
      games: [
        { id: "flanker", title: "Schwarm-Fokus", page: "schwarmfokus.html" },
        { id: "trackRouter", title: "Weichen-Wirrwarr", page: "weichen.html" },
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
        { id: "spatialPuzzle", title: "Raumdetektiv", page: "raumdetektiv.html" },
        { id: "arukone", title: "Arukone", page: "arukone.html" },
        { id: "bimaru", title: "Battleships", page: "bimaru.html" },
        { id: "shikaku", title: "Tiergehege", page: "shikaku.html" },
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
  const CARDMATCH_KEY = "lernapp.cardmatch";
  const CARDMATCH_RUNS = 5;

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

    return {
      id: game.id,
      title: game.title,
      page: game.page,
      solved,
      total: RUNNER_LEVEL_COUNT,
      ratio: solved / RUNNER_LEVEL_COUNT,
      stars,
      maxStars: RUNNER_LEVEL_COUNT * 3,
      worlds,
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
      worlds,
    };
  }

  // Karten-Merker läuft auf Zeit statt über Level: 45 Sekunden, dann eine
  // Punktzahl. "Fertig" ist es nach fünf gespielten Runden, unabhängig davon,
  // wie viele Punkte dabei herauskamen – wer übt, kommt voran, und wer einen
  // schlechten Tag hat, auch. Die Sterne kommen aus den besten Ergebnissen,
  // damit die Bestenliste im Wagen sichtbar wird.
  function cardMatchProgress(game) {
    const stored = readJSON(CARDMATCH_KEY, null) || {};
    const runs = Math.max(0, Math.min(CARDMATCH_RUNS, Number(stored.runs) || 0));
    const scores = Array.isArray(stored.scores) ? stored.scores.filter((n) => Number.isFinite(n)) : [];
    const worlds = [];
    let stars = 0;

    for (let i = 0; i < CARDMATCH_RUNS; i += 1) {
      const done = i < runs;
      const runStars = done ? starsForScore(scores[i]) : 0;
      stars += runStars;
      worlds.push({ key: `runde-${i + 1}`, solved: done ? 1 : 0, total: 1, stars: runStars, maxStars: 3, ratio: done ? 1 : 0 });
    }

    return {
      id: game.id,
      title: game.title,
      page: game.page,
      solved: runs,
      total: CARDMATCH_RUNS,
      ratio: runs / CARDMATCH_RUNS,
      stars,
      maxStars: CARDMATCH_RUNS * 3,
      worlds,
    };
  }

  function starsForScore(score) {
    const points = Number(score) || 0;
    if (points >= 40) return 3;
    if (points >= 20) return 2;
    return 1;
  }

  const OWN_PROGRESS = { runner: runnerProgress, cardMatch: cardMatchProgress };

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
