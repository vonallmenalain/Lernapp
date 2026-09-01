/*
 * kartenmerker.js – Karten-Merker als Spiel auf Zeit.
 *
 * Ein einziges Level: 45 Sekunden lang kommt Karte um Karte, und jedes Mal
 * lautet die Frage, ob sie dieselbe ist wie die davor. Kein Schwierigkeitsgrad,
 * keine Welten, kein Levelende – nur die Uhr. Was zählt, ist die Punktzahl am
 * Schluss, und die steht in einer Bestenliste.
 *
 * Die Seite baut ihre Oberfläche selbst, statt die Spielhülle aus app.js zu
 * benutzen. Der Grund ist der Zuschnitt: die Hülle bringt Levelauswahl,
 * Welten, Sterne und einen Erfolgsdialog mit, und von alldem hat dieses Spiel
 * nichts. Übrig bliebe eine Hülle, die man an jeder Stelle umgeht.
 *
 * Der Hintergrund ist die Landschaft der Startseite (train-scenes.js): beim
 * Wechsel ins Spiel soll das Kind nicht die Welt wechseln.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "cardmatch") return;

  const stage = document.querySelector("#cm-stage");
  const art = window.LernappTrainArt;
  const scenes = window.LernappScenes;
  if (!stage || !art) return;

  const kids = () => window.LernappKids || null;
  const { el } = art;

  // ---------------------------------------------------------------------------
  // Regeln
  // ---------------------------------------------------------------------------
  const ROUND_MS = 45000;
  // Falsch kostet mehr, als richtig einbringt. Ohne dieses Gefälle wäre blindes
  // Draufhauen die beste Taktik: bei zwei Knöpfen trifft man die Hälfte.
  const POINTS_RIGHT = 2;
  const POINTS_WRONG = -3;

  // Jedes Bild hat seine feste Farbe. Sonst müsste ein Kind unter Zeitdruck
  // raten, ob "gleich" die Form oder auch die Farbe meint.
  const CARDS = [
    { symbol: "🍎", color: "#ef476f" },
    { symbol: "⭐", color: "#ffd166" },
    { symbol: "🐸", color: "#06d6a0" },
    { symbol: "🚗", color: "#4285f4" },
    { symbol: "🌻", color: "#ff9f1c" },
    { symbol: "🐟", color: "#2ec4d6" },
    { symbol: "🎈", color: "#ff5da2" },
    { symbol: "🐝", color: "#8338ec" },
  ];
  const MATCH_RATE = 0.4;

  // Fünf gespielte Runden, und der Wagen im Bereich Geschwindigkeit ist für
  // dieses Spiel fertig – unabhängig von der Punktzahl. Wer übt, kommt voran;
  // wer einen schlechten Tag hat, auch.
  const STORE_KEY = "lernapp.cardmatch";
  const RUNS_FOR_DONE = 5;
  const TOP_COUNT = 5;

  const AREA_COLOR = "#F5A623";   // Geschwindigkeit – dorthin gehört das Spiel
  const AREA_DARK = "#b9741a";

  // ---------------------------------------------------------------------------
  // Speicher
  // ---------------------------------------------------------------------------
  function readStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!raw || typeof raw !== "object") return { runs: 0, scores: [] };
      return {
        runs: Math.max(0, Number(raw.runs) || 0),
        scores: Array.isArray(raw.scores) ? raw.scores.filter((n) => Number.isFinite(n)).slice(0, TOP_COUNT) : [],
      };
    } catch { return { runs: 0, scores: [] }; }
  }

  function recordRun(score) {
    const store = readStore();
    const scores = [...store.scores, score].sort((a, b) => b - a).slice(0, TOP_COUNT);
    const next = { runs: store.runs + 1, scores };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* privater Modus */ }
    return next;
  }

  // ---------------------------------------------------------------------------
  // Kartenlogik
  // ---------------------------------------------------------------------------
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function nextCard(previous) {
    if (!previous) return pick(CARDS);
    if (Math.random() < MATCH_RATE) return previous;
    const others = CARDS.filter((card) => card.symbol !== previous.symbol);
    return pick(others);
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = {
    phase: "start",     // start | play | over
    previous: null,
    current: null,
    right: 0,
    wrong: 0,
    endsAt: 0,
    locked: false,
  };
  let tickTimer = null;
  let stepTimer = null;
  let scoreLabel = null;
  let timeFill = null;
  let cardHost = null;

  function score() {
    return Math.max(0, state.right * POINTS_RIGHT + state.wrong * POINTS_WRONG);
  }

  function clearTimers() {
    if (tickTimer) { window.clearInterval(tickTimer); tickTimer = null; }
    if (stepTimer) { window.clearTimeout(stepTimer); stepTimer = null; }
  }

  // ---------------------------------------------------------------------------
  // Bausteine
  // ---------------------------------------------------------------------------
  function iconButton(name, label, path, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `cm-icon cm-icon-${name}`;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.append(el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, path));
    button.addEventListener("click", onClick);
    return button;
  }

  const ICONS = {
    home: () => [el("path", {
      d: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z",
      fill: "none", stroke: "currentColor", "stroke-width": 2.2, "stroke-linejoin": "round",
    })],
    back: () => [el("path", {
      d: "M15 5 8 12l7 7", fill: "none", stroke: "currentColor",
      "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round",
    })],
    again: () => [
      el("path", {
        d: "M19 12a7 7 0 1 1-2.4-5.3", fill: "none", stroke: "currentColor",
        "stroke-width": 2.4, "stroke-linecap": "round",
      }),
      el("polygon", { points: "19,3 19.6,8.2 14.4,7.4", fill: "currentColor" }),
    ],
  };

  function cardFace(card, extra = "") {
    const face = document.createElement("div");
    face.className = `cm-card ${extra}`.trim();
    if (card) {
      face.style.setProperty("--card-color", card.color);
      face.append(el2("span", "cm-card-symbol", card.symbol));
    } else {
      face.classList.add("is-empty");
      face.append(el2("span", "cm-card-symbol", "?"));
    }
    return face;
  }

  // Kleiner Helfer für HTML-Elemente; el() aus train-art.js baut SVG.
  function el2(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // ---------------------------------------------------------------------------
  // Wege hinaus
  // ---------------------------------------------------------------------------
  function goHome() {
    clearTimers();
    window.location.href = "index.html";
  }

  // Zurück führt nicht auf das Startbild, sondern dorthin, wo das Kind
  // hergekommen ist: in die Spielauswahl des Bereichs Geschwindigkeit.
  function goBack() {
    clearTimers();
    window.location.href = "index.html?bereich=geschwindigkeit";
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  function beginRound() {
    clearTimers();
    state.phase = "play";
    state.right = 0;
    state.wrong = 0;
    state.locked = false;
    state.previous = nextCard(null);
    state.current = nextCard(state.previous);
    state.endsAt = Date.now() + ROUND_MS;
    render();
    tickTimer = window.setInterval(tick, 100);
  }

  function tick() {
    const left = state.endsAt - Date.now();
    if (timeFill) timeFill.style.transform = `scaleX(${Math.max(0, left / ROUND_MS)})`;
    if (left <= 0) finish();
  }

  function finish() {
    clearTimers();
    state.phase = "over";
    const store = recordRun(score());
    kids()?.playJingle?.("win");
    render(store);
  }

  function answer(saysMatch) {
    if (state.phase !== "play" || state.locked) return;
    const correct = (state.current.symbol === state.previous.symbol) === saysMatch;
    state.locked = true;
    if (correct) {
      state.right += 1;
      kids()?.playJingle?.("correct");
      kids()?.vibrate?.(16);
    } else {
      state.wrong += 1;
      kids()?.playJingle?.("retry");
    }
    if (scoreLabel) scoreLabel.textContent = String(state.right);
    flash(correct ? "is-right" : "is-wrong");
    // Kurz zeigen, ob es gestimmt hat, dann sofort die nächste Karte. Es geht
    // um Tempo: eine Erklärung würde von den 45 Sekunden abziehen.
    stepTimer = window.setTimeout(nextRound, correct ? 260 : 460);
  }

  function flash(cls) {
    const card = cardHost?.querySelector(".cm-card");
    if (card) card.classList.add(cls);
  }

  function nextRound() {
    if (state.phase !== "play") return;
    state.previous = state.current;
    state.current = nextCard(state.previous);
    state.locked = false;
    drawCard();
  }

  function drawCard() {
    if (!cardHost) return;
    cardHost.innerHTML = "";
    cardHost.append(cardFace(state.current));
  }

  // ---------------------------------------------------------------------------
  // Aufbau
  // ---------------------------------------------------------------------------
  function render(store = null) {
    stage.innerHTML = "";
    stage.dataset.phase = state.phase;

    if (scenes) {
      const scene = scenes.savedScene();
      stage.append(scenes.buildScene(scene));
    }

    // --- Leiste oben ---
    const bar = el2("div", "cm-bar");
    const left = el2("div", "cm-bar-left");
    left.append(iconButton("home", "Zur Startseite", ICONS.home(), goHome));
    left.append(iconButton("back", "Zurück zur Auswahl", ICONS.back(), goBack));
    left.append(iconButton("again", "Neu starten", ICONS.again(), beginRound));
    bar.append(left);
    bar.append(el2("h1", "cm-title", "Karten-Merker"));

    // Dezent oben rechts: wie viele Karten bisher richtig waren. Die Punkte
    // kommen am Schluss – eine Zahl, die während des Spiels fallen kann, würde
    // mitten im Tempo entmutigen.
    const counter = el2("div", "cm-count");
    counter.setAttribute("role", "status");
    counter.setAttribute("aria-live", "polite");
    counter.append(el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", class: "cm-count-tick" }, [
      el("path", { d: "M5 13l4.5 4.5L19 7", fill: "none", stroke: "currentColor", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    ]));
    scoreLabel = el2("span", "cm-count-value", String(state.right));
    counter.append(scoreLabel);
    bar.append(counter);
    stage.append(bar);

    // --- Zeitbalken ---
    const time = el2("div", "cm-time");
    time.setAttribute("aria-hidden", "true");
    timeFill = el2("span", "cm-time-fill");
    time.append(timeFill);
    stage.append(time);

    if (state.phase === "play") renderPlay();
    else if (state.phase === "over") renderResult(store || readStore());
    else renderStart();
  }

  function renderPlay() {
    const play = el2("div", "cm-play");
    play.append(el2("p", "cm-prompt", "Gleich wie die Karte davor?"));

    cardHost = el2("div", "cm-card-host");
    play.append(cardHost);
    drawCard();

    const choices = el2("div", "cm-choices");
    [
      { label: "Gleich", match: true, cls: "is-same" },
      { label: "Anders", match: false, cls: "is-other" },
    ].forEach((choice) => {
      const button = el2("button", `cm-choice ${choice.cls}`, choice.label);
      button.type = "button";
      button.addEventListener("click", () => answer(choice.match));
      choices.append(button);
    });
    play.append(choices);
    stage.append(play);
    tick();
  }

  function runsLeftText(runs) {
    const left = RUNS_FOR_DONE - runs;
    return left === 1
      ? "Noch eine Runde bis zum fertigen Wagen."
      : `Noch ${left} Runden bis zum fertigen Wagen.`;
  }

  function renderStart() {
    if (timeFill) timeFill.style.transform = "scaleX(1)";
    const box = el2("div", "cm-overlay");
    const panel = el2("div", "cm-panel");
    panel.append(el2("p", "cm-lead", "45 Sekunden. Ist die Karte gleich wie die Karte davor?"));

    // Zwei Karten als Beispiel: eine gleiche und eine andere. Das erklärt die
    // Aufgabe schneller als jeder Satz.
    const demo = el2("div", "cm-demo");
    const same = el2("div", "cm-demo-pair");
    same.append(cardFace(CARDS[0], "mini"), cardFace(CARDS[0], "mini"), el2("span", "cm-demo-label is-same", "Gleich"));
    const other = el2("div", "cm-demo-pair");
    other.append(cardFace(CARDS[0], "mini"), cardFace(CARDS[2], "mini"), el2("span", "cm-demo-label is-other", "Anders"));
    demo.append(same, other);
    panel.append(demo);

    const start = el2("button", "cm-start", "Starten");
    start.type = "button";
    start.addEventListener("click", beginRound);
    panel.append(start);

    const store = readStore();
    if (store.runs) {
      panel.append(el2("p", "cm-runs", store.runs >= RUNS_FOR_DONE
        ? "Dieses Spiel ist geschafft – der Wagen ist gebaut."
        : runsLeftText(store.runs)));
    }

    box.append(panel);
    stage.append(box);
  }

  function renderResult(store) {
    if (timeFill) timeFill.style.transform = "scaleX(0)";
    const points = score();
    const box = el2("div", "cm-overlay");
    const panel = el2("div", "cm-panel");

    panel.append(el2("p", "cm-result-label", "Deine Punkte"));
    panel.append(el2("p", "cm-result-score", String(points)));
    panel.append(el2("p", "cm-result-detail",
      `${state.right} richtig · ${state.wrong} falsch`));

    // Bestenliste: die fünf besten Läufe, der frische hervorgehoben. Markiert
    // wird genau ein Eintrag, sonst leuchteten bei gleichem Ergebnis mehrere.
    const list = el2("ol", "cm-scores");
    let marked = false;
    store.scores.forEach((value, index) => {
      const item = el2("li", "cm-score-item");
      if (!marked && value === points) { item.classList.add("is-new"); marked = true; }
      item.append(el2("span", "cm-score-rank", `${index + 1}.`));
      item.append(el2("span", "cm-score-value", String(value)));
      list.append(item);
    });
    for (let i = store.scores.length; i < TOP_COUNT; i += 1) {
      const item = el2("li", "cm-score-item is-empty");
      item.append(el2("span", "cm-score-rank", `${i + 1}.`));
      item.append(el2("span", "cm-score-value", "–"));
      list.append(item);
    }
    panel.append(list);

    if (store.runs < RUNS_FOR_DONE) {
      panel.append(el2("p", "cm-runs", runsLeftText(store.runs)));
    } else if (store.runs === RUNS_FOR_DONE) {
      panel.append(el2("p", "cm-runs is-done", "Geschafft! Der Wagen ist gebaut."));
    }

    const actions = el2("div", "cm-actions");
    actions.append(iconButton("again big", "Noch einmal", ICONS.again(), beginRound));
    actions.append(iconButton("back big", "Zurück zur Auswahl", ICONS.back(), goBack));
    panel.append(actions);

    box.append(panel);
    stage.append(box);
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  stage.style.setProperty("--cm-accent", AREA_COLOR);
  stage.style.setProperty("--cm-accent-dark", AREA_DARK);
  render();

  // Tastatur: links und rechts wie die beiden Knöpfe, Leertaste startet.
  document.addEventListener("keydown", (event) => {
    if (state.phase === "play") {
      if (event.key === "ArrowLeft") { event.preventDefault(); answer(true); }
      if (event.key === "ArrowRight") { event.preventDefault(); answer(false); }
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      if (document.activeElement?.tagName === "BUTTON") return;
      event.preventDefault();
      beginRound();
    }
  });

  // Wer die Seite verlässt, soll keinen Zeitgeber zurücklassen.
  window.addEventListener("pagehide", clearTimers);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.phase === "play") clearTimers();
  });
})();
