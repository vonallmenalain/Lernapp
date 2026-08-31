/*
 * brain-games.js – Vier Gehirntrainer für die Lernapp.
 *
 * Karten-Merker (Arbeitsgedächtnis, 1-Back), Schwarm-Fokus (selektive
 * Aufmerksamkeit, Flanker-Aufgabe), Strand-Schätze (visuelles Gedächtnis) und
 * Weichen-Wirrwarr (geteilte Aufmerksamkeit, vorausschauendes Planen).
 *
 * Die Spiele bringen keine eigene Hülle mit: sie melden sich bei app.js an und
 * benutzen dieselbe Weltenwahl, Levelauswahl, Sternewertung, Erfolgsfeier und
 * denselben Hilfe-Lautsprecher wie alle anderen Rätsel. Diese Datei wird vor
 * app.js geladen und setzt window.LernappBrainGames.
 *
 * Gemeinsame Grundsätze (bewusst kindgerecht):
 *   - Kein "Game Over". Fehler kosten Sterne, nie den Spielstand.
 *   - Kein rotes X und keine Minuspunkte; Rückmeldung ist freundlich.
 *   - Grosse Tippflächen (mindestens 56 px), feste Knopfpositionen.
 *   - Kurze Runden (rund 60–90 Sekunden).
 *   - Sanft mitwachsende Schwierigkeit innerhalb einer Runde.
 */
(() => {
  "use strict";

  // ===========================================================================
  // Spielbeschreibungen (fliessen in GAME_CONFIGS von app.js)
  // ===========================================================================
  const configs = {
    cardMatch: {
      title: "Karten-Merker", eyebrow: "Merken & vergleichen", code: "N",
      subtitle: "Ist die Karte gleich wie die Karte davor?",
      success: "Stark gemerkt! Du hast die Karten gut im Kopf behalten.",
      rules: [
        "Du siehst immer nur eine Karte.",
        "Vergleiche sie mit der Karte, die du davor gesehen hast.",
        "Tippe auf Gleich, wenn beide gleich sind, sonst auf Anders.",
      ],
    },
    flanker: {
      title: "Schwarm-Fokus", eyebrow: "Nur die Mitte zählt", code: "E",
      subtitle: "In welche Richtung schwimmt der mittlere Fisch?",
      success: "Super konzentriert! Du hast dich nicht ablenken lassen.",
      rules: [
        "Schau nur auf den Fisch in der Mitte.",
        "Die anderen Fische wollen dich austricksen.",
        "Tippe auf den Pfeil, in dessen Richtung der mittlere Fisch schwimmt.",
      ],
    },
    beachTreasure: {
      title: "Strand-Schätze", eyebrow: "Neues entdecken", code: "T",
      subtitle: "Finde in jeder Runde den Schatz, den du noch nie gesammelt hast.",
      success: "Toll gesammelt! Deine Schatzkiste ist voll.",
      rules: [
        "Alle Schätze aus deiner Kiste liegen wieder am Strand.",
        "In jeder Runde ist genau ein Schatz neu.",
        "Tippe auf den neuen Schatz – achte auf Form, Farbe und Muster.",
      ],
    },
    trackRouter: {
      title: "Weichen-Wirrwarr", eyebrow: "Vorausschauend planen", code: "Y",
      subtitle: "Stelle die Weichen, damit jeder Wagen zum passenden Haus fährt.",
      success: "Alles angekommen! Du hast die Weichen im Griff.",
      rules: [
        "Jeder Wagen muss zum Haus mit seiner Farbe und seinem Zeichen fahren.",
        "Tippe auf eine Weiche, um sie umzustellen – am besten früh genug.",
        "Auf den Wagen selbst tippst du nie.",
      ],
    },
  };

  const pages = {
    cardMatch: "kartenmerker.html",
    flanker: "schwarmfokus.html",
    beachTreasure: "strandschatz.html",
    trackRouter: "weichen.html",
  };

  // ===========================================================================
  // Level-Daten
  // ===========================================================================
  // Jedes Level ist reine Konfiguration – die Schwierigkeitskurve lässt sich
  // hier verändern, ohne die Spiellogik anzufassen.

  const DIFFICULTY_ORDER = ["easy", "medium", "hard", "extreme"];

  // --- Karten-Merker ---------------------------------------------------------
  // showMs = 0 bedeutet: so lange Zeit wie das Kind braucht.
  const CARD_MATCH_LEVELS = {
    easy: [
      { cards: 10, poolSize: 3, answerMs: 0, matchRate: 0.45, mode: "symbol" },
      { cards: 12, poolSize: 4, answerMs: 0, matchRate: 0.45, mode: "symbol" },
      { cards: 12, poolSize: 4, answerMs: 7000, matchRate: 0.4, mode: "symbol" },
    ],
    medium: [
      { cards: 14, poolSize: 5, answerMs: 6000, matchRate: 0.4, mode: "symbol" },
      { cards: 14, poolSize: 6, answerMs: 5000, matchRate: 0.4, mode: "symbol" },
      { cards: 16, poolSize: 6, answerMs: 4500, matchRate: 0.4, mode: "symbol" },
    ],
    hard: [
      { cards: 16, poolSize: 7, answerMs: 4000, matchRate: 0.4, mode: "symbol" },
      { cards: 16, poolSize: 8, answerMs: 3500, matchRate: 0.4, mode: "symbol" },
      { cards: 18, poolSize: 5, answerMs: 4500, matchRate: 0.4, mode: "symbolColor" },
    ],
    extreme: [
      { cards: 18, poolSize: 6, answerMs: 4000, matchRate: 0.4, mode: "symbolColor" },
      { cards: 20, poolSize: 7, answerMs: 3500, matchRate: 0.4, mode: "symbolColor" },
      { cards: 20, poolSize: 8, answerMs: 3000, matchRate: 0.4, mode: "symbolColor" },
    ],
  };

  // --- Schwarm-Fokus ---------------------------------------------------------
  const FLANKER_LEVELS = {
    easy: [
      { trials: 10, flankers: 1, incongruent: 0.2, directions: 2, showMs: 0, answerMs: 0 },
      { trials: 12, flankers: 1, incongruent: 0.35, directions: 2, showMs: 0, answerMs: 0 },
      { trials: 12, flankers: 2, incongruent: 0.4, directions: 2, showMs: 0, answerMs: 0 },
    ],
    medium: [
      { trials: 14, flankers: 2, incongruent: 0.45, directions: 2, showMs: 2600, answerMs: 3600 },
      { trials: 14, flankers: 2, incongruent: 0.5, directions: 4, showMs: 2400, answerMs: 3400 },
      { trials: 16, flankers: 2, incongruent: 0.55, directions: 4, showMs: 2000, answerMs: 3200 },
    ],
    hard: [
      { trials: 16, flankers: 3, incongruent: 0.55, directions: 4, showMs: 1600, answerMs: 2800 },
      { trials: 18, flankers: 3, incongruent: 0.6, directions: 4, showMs: 1300, answerMs: 2600 },
      { trials: 18, flankers: 3, incongruent: 0.65, directions: 4, showMs: 1100, answerMs: 2400 },
    ],
    extreme: [
      { trials: 20, flankers: 3, incongruent: 0.65, directions: 4, showMs: 900, answerMs: 2200 },
      { trials: 20, flankers: 4, incongruent: 0.7, directions: 4, showMs: 750, answerMs: 2000 },
      { trials: 22, flankers: 4, incongruent: 0.75, directions: 4, showMs: 650, answerMs: 1800 },
    ],
  };

  // --- Strand-Schätze --------------------------------------------------------
  // vary bestimmt, worin sich die Schätze unterscheiden dürfen. Je weniger
  // Merkmale, desto ähnlicher sehen sie aus.
  const TREASURE_LEVELS = {
    easy: [
      { rounds: 6, shapes: ["shell"], colorCount: 8, patterns: ["plain"], similar: false },
      { rounds: 7, shapes: ["shell", "star"], colorCount: 8, patterns: ["plain"], similar: false },
    ],
    medium: [
      { rounds: 8, shapes: ["shell", "star", "snail"], colorCount: 8, patterns: ["plain"], similar: false },
      { rounds: 9, shapes: ["shell", "star", "snail", "stone"], colorCount: 8, patterns: ["plain", "dots"], similar: false },
    ],
    hard: [
      { rounds: 10, shapes: ["shell", "star", "snail", "stone"], colorCount: 8, patterns: ["plain", "dots", "stripes"], similar: true },
      { rounds: 11, shapes: ["shell", "star", "snail", "stone"], colorCount: 8, patterns: ["plain", "dots", "stripes", "rings"], similar: true },
    ],
    extreme: [
      { rounds: 12, shapes: ["shell", "snail"], colorCount: 8, patterns: ["plain", "dots", "stripes", "rings"], similar: true },
      { rounds: 14, shapes: ["shell"], colorCount: 8, patterns: ["plain", "dots", "stripes", "rings"], similar: true },
    ],
  };

  // --- Weichen-Wirrwarr ------------------------------------------------------
  // speed = Anteil eines Gleisstücks pro Sekunde. 0.4 heisst also: zweieinhalb
  // Sekunden von einem Knoten zum nächsten – genug Zeit, um die Weiche zu
  // stellen, aber nicht so viel, dass es langweilig wird.
  const TRACK_LEVELS = {
    easy: [
      { layout: "split2", lines: 2, deliveries: 5, speed: 0.38, spawnMs: 2200, maxCars: 1 },
      { layout: "split2", lines: 2, deliveries: 6, speed: 0.44, spawnMs: 2100, maxCars: 2 },
      { layout: "split3", lines: 3, deliveries: 6, speed: 0.42, spawnMs: 2200, maxCars: 2 },
    ],
    medium: [
      { layout: "split3", lines: 3, deliveries: 8, speed: 0.5, spawnMs: 2000, maxCars: 2 },
      { layout: "tree4", lines: 4, deliveries: 8, speed: 0.5, spawnMs: 2000, maxCars: 3 },
      { layout: "tree4", lines: 4, deliveries: 9, speed: 0.56, spawnMs: 1800, maxCars: 3 },
    ],
    hard: [
      { layout: "tree4", lines: 4, deliveries: 10, speed: 0.62, spawnMs: 2000, maxCars: 3 },
      { layout: "cross4", lines: 4, deliveries: 10, speed: 0.6, spawnMs: 2000, maxCars: 4 },
      { layout: "cross4", lines: 4, deliveries: 12, speed: 0.68, spawnMs: 1800, maxCars: 4 },
    ],
    extreme: [
      { layout: "tree5", lines: 5, deliveries: 12, speed: 0.7, spawnMs: 1700, maxCars: 4 },
      { layout: "tree5", lines: 5, deliveries: 14, speed: 0.78, spawnMs: 1500, maxCars: 5 },
      { layout: "cross4", lines: 4, deliveries: 14, speed: 0.88, spawnMs: 1400, maxCars: 5 },
    ],
  };

  const LEVEL_DESCRIPTIONS = {
    cardMatch: {
      easy: "Wenige Bilder, alle Zeit der Welt.",
      medium: "Mehr Bilder – und die Karte bleibt kürzer liegen.",
      hard: "Viele Bilder, und zum Schluss zählt auch die Farbe.",
      extreme: "Form und Farbe gleichzeitig merken, im Tempo.",
    },
    flanker: {
      easy: "Ein Fisch links und rechts, du hast so viel Zeit du magst.",
      medium: "Mehr Fische und ein kurzer Blick auf den Schwarm.",
      hard: "Vier Richtungen und viele Ablenker.",
      extreme: "Ein Wimpernschlag, dann musst du dich entscheiden.",
    },
    beachTreasure: {
      easy: "Muscheln in klaren Farben – der neue Schatz sticht heraus.",
      medium: "Verschiedene Formen kommen dazu.",
      hard: "Jetzt zählen auch die Muster auf den Schätzen.",
      extreme: "Fast gleiche Schätze: nur ein Merkmal ist anders.",
    },
    trackRouter: {
      easy: "Eine Weiche, zwei Häuser – in Ruhe planen.",
      medium: "Mehrere Weichen hintereinander und mehr Wagen unterwegs.",
      hard: "Viel los auf der Strecke: früh umstellen lohnt sich.",
      extreme: "Fünf Farben, volles Tempo, kein Zögern.",
    },
  };

  const BADGE = {
    cardMatch: (rule) => `${rule.cards} Karten`,
    flanker: (rule) => `${rule.trials} Runden`,
    beachTreasure: (rule) => `${rule.rounds} Schätze`,
    trackRouter: (rule) => `${rule.deliveries} Wagen`,
  };

  const LEVEL_RULES = {
    cardMatch: CARD_MATCH_LEVELS,
    flanker: FLANKER_LEVELS,
    beachTreasure: TREASURE_LEVELS,
    trackRouter: TRACK_LEVELS,
  };

  // Baut aus den Regel-Tabellen die Level-Objekte, die app.js erwartet.
  function buildLevels(makeLevel) {
    const result = {};
    Object.entries(LEVEL_RULES).forEach(([game, byDifficulty]) => {
      result[game] = DIFFICULTY_ORDER.flatMap((difficulty) =>
        (byDifficulty[difficulty] || []).map((rule, index) => makeLevel(game, difficulty, index + 1, {
          rule,
          badge: BADGE[game](rule),
          description: LEVEL_DESCRIPTIONS[game][difficulty],
        })));
    });
    return result;
  }

  // ===========================================================================
  // Gemeinsame Helfer
  // ===========================================================================
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const shuffle = (items) => {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  // Sterne aus einer Trefferquote. Bewusst grosszügig: auch eine Runde mit
  // ein paar Fehlern soll sich nach Erfolg anfühlen.
  function starsFromAccuracy(correct, total, thresholds = [0.88, 0.66]) {
    if (!total) return 1;
    const ratio = correct / total;
    if (ratio >= thresholds[0]) return 3;
    if (ratio >= thresholds[1]) return 2;
    return 1;
  }
  function starsFromMistakes(mistakes, twoStarLimit = 2) {
    if (mistakes === 0) return 3;
    if (mistakes <= twoStarLimit) return 2;
    return 1;
  }

  // Sanfte Anpassung innerhalb einer Runde: nach vier richtigen Antworten wird
  // es ein Stück schneller, nach einem Fehler bekommt das Kind wieder Luft.
  function createPacer(options = {}) {
    const min = options.min ?? 0.72;
    const max = options.max ?? 1.35;
    let factor = 1;
    let streak = 0;
    return {
      get factor() { return factor; },
      correct() {
        streak += 1;
        if (streak >= 4) { streak = 0; factor = clamp(factor - 0.08, min, max); }
      },
      wrong() {
        streak = 0;
        factor = clamp(factor + 0.16, min, max);
      },
    };
  }

  // Fortschrittspunkte, die alle vier Spiele oben anzeigen.
  function renderDots(done, total, extraClass = "") {
    const row = el("div", `brain-dots ${extraClass}`.trim());
    row.setAttribute("aria-label", `Aufgabe ${Math.min(done + 1, total)} von ${total}`);
    for (let i = 0; i < total; i += 1) {
      row.append(el("span", `brain-dot${i < done ? " done" : i === done ? " current" : ""}`));
    }
    return row;
  }

  // Kopfzeile mit Fortschritt und einem kleinen Zähler rechts.
  function renderHead(done, total, note) {
    const head = el("div", "brain-head");
    head.append(renderDots(done, total));
    if (note) head.append(el("span", "brain-note", note));
    return head;
  }

  // Ein Zeitbalken, der leerläuft. Rein visuell – die Logik steckt im Timer.
  function renderTimeBar(durationMs) {
    const wrap = el("div", "brain-timebar");
    wrap.setAttribute("aria-hidden", "true");
    const fill = el("span", "brain-timebar-fill");
    fill.style.animationDuration = `${Math.max(200, durationMs)}ms`;
    wrap.append(fill);
    return wrap;
  }

  // Kleiner Timer-Helfer, der sich sauber abräumen lässt.
  function createTimers() {
    let ids = [];
    return {
      after(ms, callback) {
        const id = window.setTimeout(() => {
          ids = ids.filter((entry) => entry !== id);
          callback();
        }, ms);
        ids.push(id);
        return id;
      },
      clear() {
        ids.forEach((id) => window.clearTimeout(id));
        ids = [];
      },
    };
  }

  // Farbpalette für Karten, Schätze und Wagen. Bewusst gut unterscheidbar und
  // jeweils mit eigenem Zeichen, damit Farbe nie das einzige Merkmal ist.
  const PALETTE = [
    { id: "red", name: "rot", color: "#ef476f", ink: "#7a1029", symbol: "★" },
    { id: "orange", name: "orange", color: "#ff9f1c", ink: "#7c4600", symbol: "▲" },
    { id: "yellow", name: "gelb", color: "#ffd166", ink: "#7a5800", symbol: "●" },
    { id: "green", name: "grün", color: "#06d6a0", ink: "#03614a", symbol: "■" },
    { id: "teal", name: "türkis", color: "#2ec4d6", ink: "#0a5a66", symbol: "◆" },
    { id: "blue", name: "blau", color: "#4285f4", ink: "#123a80", symbol: "♥" },
    { id: "violet", name: "lila", color: "#8338ec", ink: "#3b1273", symbol: "✚" },
    { id: "pink", name: "pink", color: "#ff5da2", ink: "#7d1348", symbol: "⬟" },
  ];

  // ===========================================================================
  // Spiel 1: Karten-Merker (1-Back)
  // ===========================================================================
  // Die Karten kommen einzeln. Das Kind entscheidet jedes Mal, ob die aktuelle
  // Karte mit der Karte davor übereinstimmt. Im Modus "symbolColor" zählen Form
  // und Farbe gemeinsam.
  const CARD_SYMBOLS = ["🍎", "🐸", "⭐", "🚗", "🌻", "🐟", "🎈", "🍌", "🐝", "⚽"];

  function createCardMatch(api) {
    const timers = createTimers();
    let s = null;

    function sameCard(a, b) {
      if (!a || !b) return false;
      return a.mode === "symbol" ? a.symbol === b.symbol : a.symbol === b.symbol && a.color === b.color;
    }

    // Zieht die nächste Karte. matchRate steuert, wie oft sie der vorherigen
    // gleicht; die Nicht-Treffer unterscheiden sich absichtlich mal in der Form
    // und mal nur in der Farbe.
    function nextCard(rule, previous) {
      const symbols = CARD_SYMBOLS.slice(0, rule.poolSize);
      const colors = rule.mode === "symbolColor" ? PALETTE.slice(0, Math.max(3, Math.min(5, rule.poolSize))) : [PALETTE[6]];
      const make = (symbol, color) => ({ symbol, color: color.id, colorValue: color.color, mode: rule.mode });
      if (!previous) return make(pick(symbols), pick(colors));
      if (Math.random() < rule.matchRate) return make(previous.symbol, colors.find((c) => c.id === previous.color) || colors[0]);
      if (rule.mode === "symbolColor" && Math.random() < 0.45) {
        const others = colors.filter((c) => c.id !== previous.color);
        if (others.length) return make(previous.symbol, pick(others));
      }
      const others = symbols.filter((symbol) => symbol !== previous.symbol);
      return make(pick(others.length ? others : symbols), pick(colors));
    }

    function answerWindow() {
      const base = s.rule.answerMs;
      return base ? Math.round(base * s.pacer.factor) : 0;
    }

    function armTimeout() {
      timers.clear();
      const window_ = answerWindow();
      if (!window_ || s.done) return;
      timers.after(window_, () => {
        if (s.done || s.phase !== "answer") return;
        s.missed += 1;
        s.answered += 1;
        s.pacer.wrong();
        s.feedback = "missed";
        api.playJingle("retry");
        advance();
      });
    }

    function advance() {
      timers.clear();
      if (s.answered >= s.rule.cards) {
        s.done = true;
        api.render();
        api.handleWin();
        return;
      }
      s.previous = s.current;
      s.current = nextCard(s.rule, s.previous);
      s.phase = "answer";
      api.render();
      armTimeout();
    }

    function answer(saysMatch) {
      if (!s || s.done || s.phase !== "answer") return;
      timers.clear();
      const correct = sameCard(s.current, s.previous) === saysMatch;
      s.answered += 1;
      if (correct) {
        s.correct += 1;
        s.streak += 1;
        s.pacer.correct();
        s.feedback = "correct";
        api.playJingle("correct");
        api.kids()?.vibrate?.(18);
      } else {
        s.streak = 0;
        s.pacer.wrong();
        s.feedback = "wrong";
        api.playJingle("retry");
      }
      s.phase = "feedback";
      api.render();
      timers.after(s.feedback === "correct" ? 380 : 900, () => {
        if (!s || s.done) return;
        advance();
      });
    }

    function start() {
      s.phase = "answer";
      s.previous = s.first;
      s.current = nextCard(s.rule, s.previous);
      api.render();
      armTimeout();
    }

    function cardFace(card, extraClass = "") {
      const face = el("div", `cardmatch-card ${extraClass}`.trim());
      if (card) {
        face.style.setProperty("--card-color", card.colorValue);
        face.append(el("span", "cardmatch-symbol", card.symbol));
      } else {
        face.classList.add("empty");
        face.append(el("span", "cardmatch-symbol", "?"));
      }
      return face;
    }

    return {
      stop() { timers.clear(); },
      resetState(level) {
        timers.clear();
        const rule = level.rule;
        s = {
          rule,
          first: nextCard(rule, null),
          previous: null,
          current: null,
          phase: "intro",
          answered: 0,
          correct: 0,
          missed: 0,
          streak: 0,
          feedback: null,
          done: false,
          pacer: createPacer(),
        };
        api.setStatus("Merk dir die erste Karte.");
      },
      checkWin() { return Boolean(s?.done); },
      solveResult() { return { correct: s?.correct || 0, answered: s?.answered || 0, missed: s?.missed || 0 }; },
      stars() { return starsFromAccuracy(s?.correct || 0, s?.answered || 0); },
      helpText(level) {
        if (!s || s.phase === "intro") return "Zuerst siehst du eine Karte zum Merken. Tippe dann auf Weiter.";
        return `Vergleiche die Karte mit der Karte davor. Tippe auf Gleich oder auf Anders. Noch ${Math.max(0, level.rule.cards - s.answered)} Karten.`;
      },
      render(level) {
        const board = api.board;
        board.innerHTML = "";
        board.className = "board task-board brain-board cardmatch-board";
        board.style.setProperty("--size", 1);
        board.append(renderHead(s.answered, s.rule.cards, s.rule.mode === "symbolColor" ? "Form + Farbe" : "Form"));

        if (s.phase === "intro") {
          board.append(el("p", "brain-prompt", "Merk dir diese Karte!"));
          board.append(cardFace(s.first, "big"));
          const go = el("button", "brain-primary-button", "Weiter ▶");
          go.type = "button";
          go.addEventListener("click", start);
          board.append(go);
          return;
        }

        board.append(el("p", "brain-prompt", "Gleich wie die Karte davor?"));
        const stage = el("div", "cardmatch-stage");
        stage.append(cardFace(s.current, `big${s.feedback && s.phase === "feedback" ? ` ${s.feedback}` : ""}`));
        board.append(stage);

        const window_ = answerWindow();
        if (window_ && s.phase === "answer") board.append(renderTimeBar(window_));

        const choices = el("div", "cardmatch-choices");
        [
          { label: "Gleich", match: true, hint: "🟪🟪", cls: "same" },
          { label: "Anders", match: false, hint: "🟪🟨", cls: "different" },
        ].forEach((choice) => {
          const button = el("button", `cardmatch-choice ${choice.cls}`);
          button.type = "button";
          button.disabled = s.phase !== "answer";
          button.append(el("span", "cardmatch-choice-hint", choice.hint));
          button.append(el("span", "cardmatch-choice-label", choice.label));
          button.addEventListener("click", () => answer(choice.match));
          choices.append(button);
        });
        board.append(choices);

        const feedback = el("div", `brain-feedback${s.phase === "feedback" || s.feedback === "missed" ? " visible" : ""}`);
        if (s.phase === "feedback" && s.feedback === "correct") {
          const badge = el("span", "correct-badge", "✓");
          badge.setAttribute("role", "img");
          badge.setAttribute("aria-label", "Richtig");
          feedback.append(badge);
        } else if (s.phase === "feedback" && s.feedback === "wrong") {
          feedback.append(el("p", null, sameCard(s.current, s.previous) ? "Die beiden waren gleich." : "Die beiden waren verschieden."));
          feedback.append(cardFace(s.previous, "mini"));
        } else if (s.feedback === "missed") {
          feedback.append(el("p", null, "Kein Problem – die nächste kommt."));
        }
        board.append(feedback);
      },
    };
  }

  // ===========================================================================
  // Spiel 2: Schwarm-Fokus (Flanker-Aufgabe)
  // ===========================================================================
  // Nur der mittlere Fisch zählt. Die Nachbarn zeigen mal in dieselbe Richtung
  // (leicht) und mal in eine andere (schwer, weil sie ablenken).
  // Nach links wird gespiegelt statt gedreht – ein um 180 Grad gedrehter Fisch
  // läge auf dem Rücken.
  const DIRECTIONS = {
    right: { transform: "none", label: "rechts", arrow: "→" },
    down: { transform: "rotate(90deg)", label: "unten", arrow: "↓" },
    left: { transform: "scaleX(-1)", label: "links", arrow: "←" },
    up: { transform: "rotate(-90deg)", label: "oben", arrow: "↑" },
  };
  const DIRECTION_SETS = { 2: ["left", "right"], 4: ["left", "right", "up", "down"] };

  // Ein Fisch als Inline-SVG. Zeigt von Haus aus nach rechts und wird gedreht –
  // Emojis wären hier unbrauchbar, weil ihre Blickrichtung je nach Gerät
  // wechselt.
  function fishSVG(direction, highlighted) {
    return `
      <svg class="flanker-fish${highlighted ? " target" : ""}" viewBox="0 0 64 48" role="img"
           aria-label="Fisch schaut nach ${DIRECTIONS[direction].label}"
           style="transform: ${DIRECTIONS[direction].transform}">
        <path class="flanker-tail" d="M6 24 L20 12 L20 36 Z"/>
        <ellipse class="flanker-body" cx="36" cy="24" rx="22" ry="14"/>
        <path class="flanker-fin" d="M34 10 Q38 2 44 10 Z"/>
        <circle class="flanker-eye-white" cx="49" cy="20" r="4.6"/>
        <circle class="flanker-eye" cx="50.5" cy="20" r="2.4"/>
      </svg>`;
  }

  function createFlanker(api) {
    const timers = createTimers();
    let s = null;

    function makeTrial(rule) {
      const dirs = DIRECTION_SETS[rule.directions] || DIRECTION_SETS[2];
      const target = pick(dirs);
      const incongruent = Math.random() < rule.incongruent;
      const others = dirs.filter((d) => d !== target);
      const flankerDir = incongruent && others.length ? pick(others) : target;
      return { target, flankerDir, incongruent, dirs };
    }

    function showMs() {
      const base = s.rule.showMs;
      return base ? Math.round(base * s.pacer.factor) : 0;
    }
    function answerMs() {
      const base = s.rule.answerMs;
      return base ? Math.round(base * s.pacer.factor) : 0;
    }

    function armTrialTimers() {
      timers.clear();
      const hideAfter = showMs();
      if (!hideAfter) return; // Einsteiger-Level: der Schwarm bleibt stehen.
      timers.after(hideAfter, () => {
        if (!s || s.done || s.phase !== "answer") return;
        s.hidden = true;
        api.render();
        const window_ = answerMs();
        if (!window_) return;
        timers.after(window_, () => {
          if (!s || s.done || s.phase !== "answer") return;
          s.missed += 1;
          s.answered += 1;
          s.pacer.wrong();
          s.feedback = "missed";
          api.playJingle("retry");
          s.phase = "feedback";
          api.render();
          timers.after(800, nextTrial);
        });
      });
    }

    function nextTrial() {
      timers.clear();
      if (!s || s.done) return;
      if (s.answered >= s.rule.trials) {
        s.done = true;
        api.render();
        api.handleWin();
        return;
      }
      s.trial = makeTrial(s.rule);
      s.hidden = false;
      s.feedback = null;
      s.phase = "answer";
      api.render();
      armTrialTimers();
    }

    function answer(direction) {
      if (!s || s.done || s.phase !== "answer") return;
      timers.clear();
      const correct = direction === s.trial.target;
      s.answered += 1;
      if (correct) {
        s.correct += 1;
        s.pacer.correct();
        s.feedback = "correct";
        api.playJingle("correct");
        api.kids()?.vibrate?.(18);
      } else {
        s.pacer.wrong();
        s.feedback = "wrong";
        api.playJingle("retry");
      }
      s.phase = "feedback";
      api.render();
      timers.after(correct ? 340 : 850, nextTrial);
    }

    return {
      stop() { timers.clear(); },
      resetState(level) {
        timers.clear();
        s = {
          rule: level.rule,
          trial: null,
          hidden: false,
          phase: "intro",
          answered: 0,
          correct: 0,
          missed: 0,
          feedback: null,
          done: false,
          pacer: createPacer({ min: 0.8, max: 1.4 }),
        };
        api.setStatus("Schau nur auf den Fisch in der Mitte.");
      },
      checkWin() { return Boolean(s?.done); },
      solveResult() { return { correct: s?.correct || 0, answered: s?.answered || 0, missed: s?.missed || 0 }; },
      stars() { return starsFromAccuracy(s?.correct || 0, s?.answered || 0, [0.85, 0.62]); },
      helpText(level) {
        if (!s || s.phase === "intro") return "Tippe auf Los geht's, dann erscheint der Schwarm.";
        const dirs = (DIRECTION_SETS[level.rule.directions] || DIRECTION_SETS[2]).map((d) => DIRECTIONS[d].label).join(", ");
        return `Schau nur auf den Fisch in der Mitte, der grösser und heller ist. Tippe dann auf den Pfeil für seine Richtung: ${dirs}. Noch ${Math.max(0, level.rule.trials - s.answered)} Runden.`;
      },
      render(level) {
        const board = api.board;
        board.innerHTML = "";
        board.className = "board task-board brain-board flanker-board";
        board.style.setProperty("--size", 1);
        board.append(renderHead(s.answered, s.rule.trials, s.rule.showMs ? "kurzer Blick" : "in Ruhe"));

        if (s.phase === "intro") {
          board.append(el("p", "brain-prompt", "Wohin schwimmt der Fisch in der Mitte?"));
          const demo = el("div", "flanker-row demo");
          demo.innerHTML = [fishSVG("left", false), fishSVG("right", true), fishSVG("left", false)]
            .map((svg) => `<span class="flanker-slot">${svg}</span>`).join("");
          board.append(demo);
          board.append(el("p", "brain-hint", "Die Fische aussen wollen dich austricksen."));
          const go = el("button", "brain-primary-button", "Los geht's! 🐟");
          go.type = "button";
          go.addEventListener("click", nextTrial);
          board.append(go);
          return;
        }

        const row = el("div", "flanker-row");
        if (s.hidden) {
          row.classList.add("hidden-swarm");
          row.append(el("span", "flanker-memory", "Welche Richtung war es?"));
        } else {
          const count = s.rule.flankers;
          const slots = [];
          for (let i = 0; i < count; i += 1) slots.push(fishSVG(s.trial.flankerDir, false));
          slots.push(fishSVG(s.trial.target, true));
          for (let i = 0; i < count; i += 1) slots.push(fishSVG(s.trial.flankerDir, false));
          row.style.setProperty("--fish-count", slots.length);
          row.innerHTML = slots.map((svg, index) => `<span class="flanker-slot${index === count ? " target-slot" : ""}">${svg}</span>`).join("");
        }
        board.append(row);

        if (!s.hidden && s.rule.showMs && s.phase === "answer") board.append(renderTimeBar(showMs()));
        if (s.hidden && s.rule.answerMs && s.phase === "answer") board.append(renderTimeBar(answerMs()));

        const dirs = DIRECTION_SETS[s.rule.directions] || DIRECTION_SETS[2];
        const pad = el("div", `flanker-pad${dirs.length === 4 ? " cross" : " row"}`);
        dirs.forEach((direction) => {
          const button = el("button", `flanker-key key-${direction}`);
          button.type = "button";
          button.disabled = s.phase !== "answer";
          button.setAttribute("aria-label", `Nach ${DIRECTIONS[direction].label}`);
          button.append(el("span", "flanker-key-arrow", DIRECTIONS[direction].arrow));
          button.addEventListener("click", () => answer(direction));
          pad.append(button);
        });
        board.append(pad);

        const feedback = el("div", `brain-feedback${s.phase === "feedback" ? " visible" : ""}`);
        if (s.feedback === "correct") {
          const badge = el("span", "correct-badge", "✓");
          badge.setAttribute("role", "img");
          badge.setAttribute("aria-label", "Richtig");
          feedback.append(badge);
        } else if (s.feedback === "wrong") {
          feedback.append(el("p", null, `Der mittlere Fisch schwamm nach ${DIRECTIONS[s.trial.target].label}.`));
        } else if (s.feedback === "missed") {
          feedback.append(el("p", null, "Kein Problem – die nächste Runde kommt."));
        }
        board.append(feedback);
      },
    };
  }

  // ===========================================================================
  // Spiel 3: Strand-Schätze
  // ===========================================================================
  // Jede Runde liegen alle bereits gesammelten Schätze wieder am Strand – plus
  // genau ein neuer. Gesucht ist der neue. Die Schätze bestehen aus Form,
  // Farbe und Muster; in den schweren Leveln unterscheiden sich neue Schätze
  // absichtlich nur in einem einzigen Merkmal.
  const TREASURE_SHAPES = {
    shell: { name: "Muschel", path: "M32 56 C12 44 8 24 20 12 C26 6 38 6 44 12 C56 24 52 44 32 56 Z", lines: ["M32 56 L22 14", "M32 56 L32 12", "M32 56 L42 14"] },
    star: { name: "Seestern", path: "M32 6 L40 24 L60 26 L45 39 L50 58 L32 48 L14 58 L19 39 L4 26 L24 24 Z", lines: [] },
    snail: { name: "Schnecke", path: "M32 58 C14 58 4 44 8 30 C12 16 28 10 40 16 C50 21 52 34 44 40 C37 45 28 42 27 35 C26 29 31 25 36 27", lines: [] },
    stone: { name: "Stein", path: "M32 56 C14 56 6 44 10 30 C14 16 26 8 38 10 C52 12 60 26 56 40 C53 51 44 56 32 56 Z", lines: [] },
  };
  const TREASURE_PATTERNS = ["plain", "dots", "stripes", "rings"];
  const PATTERN_NAMES = { plain: "einfarbig", dots: "gepunktet", stripes: "gestreift", rings: "geringelt" };

  function treasureSVG(item) {
    const shape = TREASURE_SHAPES[item.shape];
    const color = PALETTE.find((entry) => entry.id === item.color) || PALETTE[0];
    const patternId = `pat-${item.shape}-${item.color}-${item.pattern}`;
    let defs = "";
    let fill = color.color;
    if (item.pattern === "dots") {
      defs = `<pattern id="${patternId}" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="10" height="10" fill="${color.color}"/>
                <circle cx="5" cy="5" r="2.4" fill="${color.ink}" opacity="0.55"/>
              </pattern>`;
      fill = `url(#${patternId})`;
    } else if (item.pattern === "stripes") {
      defs = `<pattern id="${patternId}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <rect width="10" height="10" fill="${color.color}"/>
                <rect width="4" height="10" fill="${color.ink}" opacity="0.5"/>
              </pattern>`;
      fill = `url(#${patternId})`;
    } else if (item.pattern === "rings") {
      defs = `<pattern id="${patternId}" width="14" height="14" patternUnits="userSpaceOnUse">
                <rect width="14" height="14" fill="${color.color}"/>
                <circle cx="7" cy="7" r="5" fill="none" stroke="${color.ink}" stroke-width="2.6" opacity="0.5"/>
              </pattern>`;
      fill = `url(#${patternId})`;
    }
    const lines = shape.lines.map((d) => `<path d="${d}" fill="none" stroke="${color.ink}" stroke-width="2" opacity="0.45" stroke-linecap="round"/>`).join("");
    return `<svg class="treasure-svg" viewBox="0 0 64 64" role="img" aria-label="${TREASURE_SHAPES[item.shape].name}, ${color.name}, ${PATTERN_NAMES[item.pattern]}">
      <defs>${defs}</defs>
      <path d="${shape.path}" fill="${fill}" stroke="${color.ink}" stroke-width="2.6" stroke-linejoin="round"/>
      ${lines}
    </svg>`;
  }

  function createBeachTreasure(api) {
    const timers = createTimers();
    let s = null;

    const keyOf = (item) => `${item.shape}|${item.color}|${item.pattern}`;

    function allVariants(rule) {
      const colors = PALETTE.slice(0, rule.colorCount).map((entry) => entry.id);
      const variants = [];
      rule.shapes.forEach((shape) => colors.forEach((color) => rule.patterns.forEach((pattern) => {
        variants.push({ shape, color, pattern });
      })));
      return variants;
    }

    // Wählt den nächsten neuen Schatz. In den schweren Leveln bevorzugt einen,
    // der sich von einem gesammelten nur in einem Merkmal unterscheidet.
    function pickNext(rule, taken) {
      const free = allVariants(rule).filter((item) => !taken.has(keyOf(item)));
      if (!free.length) return null;
      if (!rule.similar || !taken.size) return pick(free);
      const collected = s.collected;
      const nearly = free.filter((item) => collected.some((old) => {
        let differences = 0;
        if (old.shape !== item.shape) differences += 1;
        if (old.color !== item.color) differences += 1;
        if (old.pattern !== item.pattern) differences += 1;
        return differences === 1;
      }));
      return pick(nearly.length ? nearly : free);
    }

    function startRound(silent) {
      const taken = new Set(s.collected.map(keyOf));
      const fresh = pickNext(s.rule, taken);
      if (!fresh) { finish(); return; }
      s.fresh = fresh;
      s.order = shuffle([...s.collected, fresh]);
      s.wrongKey = null;
      if (!silent) api.render();
    }

    function finish() {
      s.done = true;
      api.render();
      api.handleWin();
    }

    function tap(item) {
      if (!s || s.done) return;
      if (keyOf(item) === keyOf(s.fresh)) {
        s.collected = [...s.collected, s.fresh];
        s.wrongKey = null;
        api.playJingle(s.collected.length >= s.rule.rounds ? "win" : "correct");
        api.kids()?.vibrate?.(18);
        if (s.collected.length >= s.rule.rounds) { finish(); return; }
        api.render();
        timers.after(420, startRound);
        return;
      }
      s.mistakes += 1;
      s.wrongKey = keyOf(item);
      api.playJingle("retry");
      api.render();
    }

    return {
      stop() { timers.clear(); },
      resetState(level) {
        timers.clear();
        s = { rule: level.rule, collected: [], fresh: null, order: [], mistakes: 0, wrongKey: null, done: false };
        startRound(true);
        api.setStatus("Welcher Schatz ist neu?");
      },
      checkWin() { return Boolean(s?.done); },
      solveResult() { return { mistakes: s?.mistakes || 0, collected: s?.collected.length || 0 }; },
      stars() { return starsFromMistakes(s?.mistakes || 0, 2); },
      helpText(level) {
        const left = Math.max(0, level.rule.rounds - (s?.collected.length || 0));
        return `Alle Schätze aus deiner Kiste liegen wieder da. Genau einer ist neu – tippe ihn an. Achte auf Form, Farbe und Muster. Noch ${left} ${left === 1 ? "Schatz" : "Schätze"} bis zum Ziel.`;
      },
      render(level) {
        const board = api.board;
        board.innerHTML = "";
        board.className = "board task-board brain-board treasure-board";
        board.style.setProperty("--size", 1);
        board.append(renderHead(s.collected.length, s.rule.rounds, s.mistakes ? `${s.mistakes} daneben` : "fehlerfrei"));
        board.append(el("p", "brain-prompt", "Welcher Schatz ist neu?"));

        const grid = el("div", "treasure-grid");
        grid.style.setProperty("--treasure-count", s.order.length);
        s.order.forEach((item) => {
          const key = keyOf(item);
          const button = el("button", `treasure-tile${s.wrongKey === key ? " known" : ""}`);
          button.type = "button";
          button.disabled = s.done;
          button.innerHTML = treasureSVG(item);
          if (s.wrongKey === key) button.append(el("span", "treasure-known-mark", "schon dabei"));
          button.addEventListener("click", () => tap(item));
          grid.append(button);
        });
        board.append(grid);

        const chest = el("div", "treasure-chest");
        chest.append(el("span", "treasure-chest-icon", s.collected.length >= s.rule.rounds ? "🧰" : "🧳"));
        chest.append(el("span", "treasure-chest-count", `${s.collected.length} von ${s.rule.rounds}`));
        board.append(chest);

        const feedback = el("div", `brain-feedback${s.wrongKey ? " visible" : ""}`);
        if (s.wrongKey) feedback.append(el("p", null, "Den hattest du schon. Schau nochmal genau hin."));
        board.append(feedback);
      },
    };
  }

  // ===========================================================================
  // Spiel 4: Weichen-Wirrwarr
  // ===========================================================================
  // Das einzige Echtzeitspiel der vier. Das Streckennetz ist ein Graph aus
  // Knoten (Start, Weiche, Haus) und Kanten (Gleisstücke). Wagen fahren mit
  // festem Tempo entlang der Kanten; an einer Weiche nehmen sie den Ast, der
  // gerade eingestellt ist. Angetippt wird immer nur die Weiche, nie der Wagen.
  //
  // Koordinaten sind auf 0–1 normiert und werden auf die Leinwand skaliert.
  const TRACK_LAYOUTS = {
    // Eine Weiche, zwei Häuser.
    split2: {
      nodes: [
        { id: "start", type: "spawn", x: 0.06, y: 0.5 },
        { id: "w1", type: "switch", x: 0.46, y: 0.5 },
        { id: "h0", type: "station", x: 0.9, y: 0.22, line: 0 },
        { id: "h1", type: "station", x: 0.9, y: 0.78, line: 1 },
      ],
      edges: [["start", "w1"], ["w1", "h0"], ["w1", "h1"]],
    },
    // Zwei Weichen hintereinander, drei Häuser.
    split3: {
      nodes: [
        { id: "start", type: "spawn", x: 0.05, y: 0.5 },
        { id: "w1", type: "switch", x: 0.34, y: 0.5 },
        { id: "w2", type: "switch", x: 0.63, y: 0.7 },
        { id: "h0", type: "station", x: 0.92, y: 0.16, line: 0 },
        { id: "h1", type: "station", x: 0.92, y: 0.55, line: 1 },
        { id: "h2", type: "station", x: 0.92, y: 0.88, line: 2 },
      ],
      edges: [["start", "w1"], ["w1", "h0"], ["w1", "w2"], ["w2", "h1"], ["w2", "h2"]],
    },
    // Vollständiger Baum: drei Weichen, vier Häuser.
    tree4: {
      nodes: [
        { id: "start", type: "spawn", x: 0.04, y: 0.5 },
        { id: "w1", type: "switch", x: 0.3, y: 0.5 },
        { id: "w2", type: "switch", x: 0.6, y: 0.26 },
        { id: "w3", type: "switch", x: 0.6, y: 0.74 },
        { id: "h0", type: "station", x: 0.93, y: 0.1, line: 0 },
        { id: "h1", type: "station", x: 0.93, y: 0.38, line: 1 },
        { id: "h2", type: "station", x: 0.93, y: 0.64, line: 2 },
        { id: "h3", type: "station", x: 0.93, y: 0.92, line: 3 },
      ],
      edges: [["start", "w1"], ["w1", "w2"], ["w1", "w3"], ["w2", "h0"], ["w2", "h1"], ["w3", "h2"], ["w3", "h3"]],
    },
    // Zwei Startpunkte, die sich eine Weichenstrasse teilen.
    cross4: {
      nodes: [
        { id: "startA", type: "spawn", x: 0.04, y: 0.24 },
        { id: "startB", type: "spawn", x: 0.04, y: 0.76 },
        { id: "j1", type: "join", x: 0.26, y: 0.5 },
        { id: "w1", type: "switch", x: 0.46, y: 0.5 },
        { id: "w2", type: "switch", x: 0.7, y: 0.26 },
        { id: "w3", type: "switch", x: 0.7, y: 0.74 },
        { id: "h0", type: "station", x: 0.94, y: 0.1, line: 0 },
        { id: "h1", type: "station", x: 0.94, y: 0.38, line: 1 },
        { id: "h2", type: "station", x: 0.94, y: 0.64, line: 2 },
        { id: "h3", type: "station", x: 0.94, y: 0.92, line: 3 },
      ],
      edges: [["startA", "j1"], ["startB", "j1"], ["j1", "w1"], ["w1", "w2"], ["w1", "w3"],
        ["w2", "h0"], ["w2", "h1"], ["w3", "h2"], ["w3", "h3"]],
    },
    // Vier Weichen, fünf Häuser – die längste Strecke.
    tree5: {
      nodes: [
        { id: "start", type: "spawn", x: 0.03, y: 0.5 },
        { id: "w1", type: "switch", x: 0.24, y: 0.5 },
        { id: "w2", type: "switch", x: 0.5, y: 0.24 },
        { id: "w3", type: "switch", x: 0.5, y: 0.76 },
        { id: "w4", type: "switch", x: 0.73, y: 0.6 },
        { id: "h0", type: "station", x: 0.94, y: 0.08, line: 0 },
        { id: "h1", type: "station", x: 0.94, y: 0.3, line: 1 },
        { id: "h2", type: "station", x: 0.94, y: 0.52, line: 2 },
        { id: "h3", type: "station", x: 0.94, y: 0.74, line: 3 },
        { id: "h4", type: "station", x: 0.94, y: 0.94, line: 4 },
      ],
      edges: [["start", "w1"], ["w1", "w2"], ["w1", "w3"], ["w2", "h0"], ["w2", "h1"],
        ["w3", "w4"], ["w3", "h4"], ["w4", "h2"], ["w4", "h3"]],
    },
  };

  const TRACK_CANVAS_RATIO = 0.76; // Höhe im Verhältnis zur Breite

  function createTrackRouter(api) {
    let s = null;
    let frame = 0;
    let canvas = null;
    let ctx = null;
    let hud = null;

    // Die Leinwand zeichnet sich selbst; die Kopfzeile ist normales DOM und
    // muss deshalb von Hand nachgeführt werden.
    function syncHud() {
      if (!hud || !s) return;
      if (hud.delivered === s.delivered && hud.missed === s.missed) return;
      hud.delivered = s.delivered;
      hud.missed = s.missed;
      Array.from(hud.dots.children).forEach((dot, index) => {
        dot.className = `brain-dot${index < s.delivered ? " done" : index === s.delivered ? " current" : ""}`;
      });
      hud.note.textContent = s.missed ? `${s.missed} verfahren` : "alles richtig";
    }

    function roundRect(x, y, width, height, radius) {
      if (typeof ctx.roundRect === "function") { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); return; }
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    }
    function layout() { return TRACK_LAYOUTS[s.rule.layout] || TRACK_LAYOUTS.split2; }
    function nodeById(id) { return layout().nodes.find((node) => node.id === id); }
    function outgoing(id) { return layout().edges.filter(([from]) => from === id).map(([, to]) => to); }
    function spawnNodes() { return layout().nodes.filter((node) => node.type === "spawn"); }

    // Welche Häuser sind von diesem Knoten aus überhaupt erreichbar? Damit
    // bekommt jede Weiche eine sinnvolle Beschriftung und der Spawn weiss,
    // welche Farben er ausgeben darf.
    function reachable(id, seen = new Set()) {
      if (seen.has(id)) return [];
      seen.add(id);
      const node = nodeById(id);
      if (!node) return [];
      if (node.type === "station") return [node.line];
      return outgoing(id).flatMap((next) => reachable(next, seen));
    }

    function stop() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    }

    function activeLines() {
      return layout().nodes.filter((node) => node.type === "station" && node.line < s.rule.lines).map((node) => node.line);
    }

    function spawnCar() {
      if (s.cars.length >= s.rule.maxCars) return;
      const from = pick(spawnNodes());
      const options = reachable(from.id).filter((line) => line < s.rule.lines);
      if (!options.length) return;
      s.cars.push({
        line: pick(options),
        from: from.id,
        to: outgoing(from.id)[0],
        t: 0,
        id: s.nextCarId++,
      });
    }

    function switchTarget(nodeId) {
      const outs = outgoing(nodeId);
      const index = s.switches[nodeId] || 0;
      return outs[index % outs.length];
    }

    function advanceCar(car, delta) {
      car.t += s.rule.speed * delta * s.pace;
      while (car.t >= 1) {
        car.t -= 1;
        const arrived = nodeById(car.to);
        if (!arrived) { car.done = true; return; }
        if (arrived.type === "station") {
          car.done = true;
          if (arrived.line === car.line) {
            s.delivered += 1;
            s.flash = { nodeId: arrived.id, until: performance.now() + 420, ok: true };
            api.playJingle("correct");
            api.kids()?.vibrate?.(16);
          } else {
            s.missed += 1;
            s.flash = { nodeId: arrived.id, until: performance.now() + 520, ok: false };
            // Erholungsphase: nach einem Fehler wird es kurz ruhiger.
            s.pace = 0.82;
            s.nextSpawnAt = performance.now() + s.rule.spawnMs * 1.4;
            api.playJingle("retry");
          }
          return;
        }
        const next = arrived.type === "switch" ? switchTarget(arrived.id) : outgoing(arrived.id)[0];
        if (!next) { car.done = true; return; }
        car.from = arrived.id;
        car.to = next;
      }
    }

    function tick(now) {
      frame = 0;
      if (!s || s.done) return;
      const delta = Math.min(0.05, (now - s.lastFrame) / 1000 || 0);
      s.lastFrame = now;
      s.cars.forEach((car) => advanceCar(car, delta));
      s.cars = s.cars.filter((car) => !car.done);
      if (s.pace < 1) s.pace = Math.min(1, s.pace + delta * 0.25);
      if (now >= s.nextSpawnAt) {
        spawnCar();
        s.nextSpawnAt = now + s.rule.spawnMs / Math.max(0.6, s.pace);
      }
      draw();
      syncHud();
      if (s.delivered >= s.rule.deliveries) {
        s.done = true;
        api.render();
        api.handleWin();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    }

    function resizeCanvas() {
      if (!canvas) return;
      const width = canvas.clientWidth || 320;
      const height = Math.round(width * TRACK_CANVAS_RATIO);
      if (s.size && s.size.width === width && s.size.height === height && ctx) return;
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.size = { width, height };
    }

    const px = (node) => ({ x: node.x * (s.size.width - 56) + 28, y: node.y * (s.size.height - 56) + 28 });
    // Auf kleinen Leinwänden – und bei fünf Häusern übereinander – wird alles
    // etwas kleiner gezeichnet, damit nichts überlappt.
    function drawScale() {
      const stations = layout().nodes.filter((node) => node.type === "station").length;
      const room = (s.size.height - 56) / Math.max(2, stations);
      return clamp(room / 58, 0.62, 1);
    }
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    function drawTrack() {
      const { edges } = layout();
      edges.forEach(([fromId, toId]) => {
        const from = px(nodeById(fromId));
        const to = px(nodeById(toId));
        const fromNode = nodeById(fromId);
        const chosen = fromNode.type !== "switch" || switchTarget(fromId) === toId;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#d7dbe8";
        ctx.lineWidth = 16;
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        ctx.strokeStyle = chosen ? "#7a8299" : "#e7e9f2";
        ctx.lineWidth = chosen ? 8 : 5;
        ctx.setLineDash(chosen ? [] : [10, 9]);
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function drawStation(node) {
      const pos = px(node);
      const palette = PALETTE[node.line % PALETTE.length];
      const flash = s.flash && s.flash.nodeId === node.id && performance.now() < s.flash.until;
      const dim = node.line >= s.rule.lines;
      ctx.save();
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.translate(pos.x, pos.y);
      ctx.scale(drawScale(), drawScale());
      if (flash) {
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = s.flash.ok ? "rgba(6,214,160,0.35)" : "rgba(255,159,28,0.35)";
        ctx.fill();
      }
      // Haus: Körper plus Dach.
      ctx.fillStyle = palette.color;
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 2.5;
      roundRect(-19, -6, 38, 26, 6);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-23, -6); ctx.lineTo(0, -24); ctx.lineTo(23, -6); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = palette.ink;
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(palette.symbol, 0, 8);
      ctx.restore();
    }

    function drawSwitch(node) {
      const pos = px(node);
      const target = nodeById(switchTarget(node.id));
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.scale(drawScale(), drawScale());
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#6c5ce7";
      ctx.lineWidth = 4;
      ctx.fill(); ctx.stroke();
      if (target) {
        const to = px(target);
        const angle = Math.atan2(to.y - pos.y, to.x - pos.x);
        // Der Winkel stammt aus den echten Koordinaten, nicht aus dem
        // skalierten System – deshalb erst jetzt drehen.
        ctx.rotate(angle);
        ctx.strokeStyle = "#6c5ce7";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(9, 0); ctx.lineTo(2, 6); ctx.stroke();
      }
      ctx.restore();
    }

    function drawCar(car) {
      const from = nodeById(car.from);
      const to = nodeById(car.to);
      if (!from || !to) return;
      const pos = lerp(px(from), px(to), car.t);
      const palette = PALETTE[car.line % PALETTE.length];
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.scale(drawScale(), drawScale());
      ctx.fillStyle = palette.color;
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 2.5;
      roundRect(-16, -12, 32, 24, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = palette.ink;
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(palette.symbol, 0, 1);
      ctx.restore();
    }

    function draw() {
      if (!ctx || !s.size) return;
      ctx.clearRect(0, 0, s.size.width, s.size.height);
      drawTrack();
      layout().nodes.forEach((node) => {
        if (node.type === "station") drawStation(node);
        else if (node.type === "switch") drawSwitch(node);
      });
      s.cars.forEach(drawCar);
    }

    function handleTap(event) {
      if (!s || s.done || !canvas || s.phase !== "playing") return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = layout().nodes
        .filter((node) => node.type === "switch")
        .map((node) => ({ node, pos: px(node) }))
        .find(({ pos }) => Math.hypot(pos.x - x, pos.y - y) <= Math.max(30, 34 * drawScale()));
      if (!hit) return;
      const outs = outgoing(hit.node.id);
      s.switches[hit.node.id] = ((s.switches[hit.node.id] || 0) + 1) % outs.length;
      api.playJingle("star");
      api.kids()?.vibrate?.(12);
      draw();
    }

    function startLoop() {
      stop();
      s.lastFrame = performance.now();
      s.nextSpawnAt = s.lastFrame + 900;
      frame = window.requestAnimationFrame(tick);
    }

    function beginRound() {
      s.phase = "playing";
      api.render();
    }

    // Fenstergrösse ändert sich (Drehen, Tastatur) – Leinwand nachziehen.
    function watchSize(node) {
      if (typeof ResizeObserver !== "function") return;
      const observer = new ResizeObserver(() => {
        if (!node.isConnected) { observer.disconnect(); return; }
        resizeCanvas();
        draw();
      });
      observer.observe(node);
    }

    return {
      stop,
      resetState(level) {
        stop();
        s = {
          rule: level.rule,
          switches: {},
          cars: [],
          nextCarId: 1,
          delivered: 0,
          missed: 0,
          pace: 1,
          lastFrame: 0,
          nextSpawnAt: 0,
          flash: null,
          size: null,
          phase: "intro",
          done: false,
        };
        api.setStatus("Stelle die Weichen, bevor der Wagen ankommt.");
      },
      checkWin() { return Boolean(s?.done); },
      solveResult() { return { delivered: s?.delivered || 0, missed: s?.missed || 0 }; },
      stars() { return starsFromMistakes(s?.missed || 0, 2); },
      helpText(level) {
        const lines = activeLines().map((line) => PALETTE[line % PALETTE.length].name).join(", ");
        if (s?.phase === "intro") return "Tippe auf Los geht's, dann rollen die ersten Wagen los.";
        return `Jeder Wagen muss zum Haus mit derselben Farbe fahren. Die Farben sind ${lines}. Tippe auf die lila Kreise, das sind die Weichen. Noch ${Math.max(0, level.rule.deliveries - (s?.delivered || 0))} Wagen bis zum Ziel.`;
      },
      render(level) {
        const board = api.board;
        const running = Boolean(frame);
        board.innerHTML = "";
        board.className = "board task-board brain-board track-board";
        board.style.setProperty("--size", 1);
        const head = renderHead(s.delivered, s.rule.deliveries, s.missed ? `${s.missed} verfahren` : "alles richtig");
        board.append(head);
        hud = {
          dots: head.querySelector(".brain-dots"),
          note: head.querySelector(".brain-note"),
          delivered: s.delivered,
          missed: s.missed,
        };

        canvas = el("canvas", "track-canvas");
        canvas.setAttribute("aria-label", "Gleisnetz mit Weichen");
        board.append(canvas);

        if (s.phase === "intro") {
          const legend = el("div", "track-legend");
          activeLines().forEach((line) => {
            const palette = PALETTE[line % PALETTE.length];
            const chip = el("span", "track-legend-chip");
            chip.style.setProperty("--chip-color", palette.color);
            chip.style.setProperty("--chip-ink", palette.ink);
            chip.append(el("span", "track-legend-symbol", palette.symbol));
            chip.append(el("span", null, palette.name));
            legend.append(chip);
          });
          board.append(legend);
          const go = el("button", "brain-primary-button", "Los geht's! 🚃");
          go.type = "button";
          go.addEventListener("click", beginRound);
          board.append(go);
        } else {
          board.append(el("p", "brain-hint", "Tippe auf die Weichen – nie auf die Wagen."));
        }

        // Nach dem Anhängen steht erst die Breite fest.
        s.size = null;
        window.requestAnimationFrame(() => {
          if (!canvas?.isConnected) return;
          resizeCanvas();
          draw();
          if (!running && !s.done && s.phase === "playing") startLoop();
        });
        canvas.addEventListener("pointerdown", handleTap);
        watchSize(canvas);
      },
    };
  }

  // ===========================================================================
  // Anmeldung bei app.js
  // ===========================================================================
  function createHandlers(api) {
    return {
      cardMatch: createCardMatch(api),
      flanker: createFlanker(api),
      beachTreasure: createBeachTreasure(api),
      trackRouter: createTrackRouter(api),
    };
  }

  window.LernappBrainGames = { configs, pages, buildLevels, createHandlers };
})();
