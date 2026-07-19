/* abenteuer.js – Abenteuer-Modus: eine bunte Rätselreise aus gemischten Mini-Aufgaben.
   Nutzt die Aufgaben-Generatoren aus app.js (window.LernappTasks). */
(() => {
  "use strict";
  const kids = window.LernappKids;
  const root = document.getElementById("adventure-root");
  if (!kids || !root || document.body.dataset.page !== "adventure") return;

  const STATION_COUNT = 8;
  const STATION_SCENES = ["🌱", "🌳", "🌻", "🏞️", "🌊", "⛰️", "🌙", "🚀"];

  function tasksApi() { return window.LernappTasks || null; }

  const TASK_TYPES = [
    { key: "count", make: (d) => tasksApi().count(d) },
    { key: "math", make: (d) => tasksApi().math(d) },
    { key: "letter", make: (d) => tasksApi().letter(d) },
    { key: "sequence", make: (d) => tasksApi().sequence(d) },
    { key: "shape", make: (d) => tasksApi().shape(d) },
    { key: "oddOneOut", make: (d) => tasksApi().oddOneOut(d) },
  ];

  const state = { station: 0, attempts: 0, task: null, lastType: null, answered: false, stars: 3 };

  function stationDifficulty(index) {
    if (kids.isYoung && kids.isYoung()) return "easy";
    return index < 4 ? "easy" : "medium";
  }
  function pickType() {
    let type;
    do {
      type = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
    } while (TASK_TYPES.length > 1 && type.key === state.lastType);
    state.lastType = type.key;
    return type;
  }
  function nextTask() {
    const api = tasksApi();
    if (!api) return null;
    const type = pickType();
    try {
      const task = type.make(stationDifficulty(state.station));
      task.__type = type.key;
      return task;
    } catch (error) {
      return null;
    }
  }

  function spokenFor(task) {
    switch (task.__type) {
      case "count": return "Wie viele siehst du?";
      case "math": return (task.questionText || "").replace(/\+/g, " plus ").replace(/[-−]/g, " minus ").replace(/=/g, " gleich ").replace(/\?/g, " wie viel") + "?";
      case "letter": return task.questionText || "Welcher Buchstabe?";
      case "sequence": return "Wie geht die Zahlenreihe weiter?";
      case "shape": return "Welche Figur kommt als Nächstes?";
      case "oddOneOut": return "Welches Bild passt nicht?";
      default: return "";
    }
  }

  function renderPrompt(task) {
    const wrap = document.createElement("div");
    wrap.className = `adventure-prompt prompt-${task.__type}`;
    if (task.__type === "math") {
      const eq = document.createElement("div");
      eq.className = "adventure-equation";
      eq.textContent = task.questionText;
      wrap.append(eq);
    } else if (task.__type === "count") {
      const q = document.createElement("p");
      q.className = "adventure-question";
      q.textContent = "Wie viele?";
      const grid = document.createElement("div");
      grid.className = "count-objects";
      grid.style.setProperty("--count", task.count);
      task.items.forEach((em) => {
        const span = document.createElement("span");
        span.className = "count-object";
        span.setAttribute("aria-hidden", "true");
        span.textContent = em;
        grid.append(span);
      });
      wrap.append(q, grid);
    } else if (task.__type === "letter") {
      const emoji = document.createElement("div");
      emoji.className = "letter-image";
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = task.item.emoji;
      const word = document.createElement("p");
      word.className = "letter-word";
      word.textContent = task.item.word;
      const q = document.createElement("p");
      q.className = "adventure-question";
      q.textContent = task.questionText;
      wrap.append(emoji, word, q);
    } else if (task.__type === "sequence" || task.__type === "shape") {
      const q = document.createElement("p");
      q.className = "adventure-question";
      q.textContent = task.__type === "sequence" ? "Wie geht es weiter?" : "Welche Figur fehlt?";
      const display = document.createElement("div");
      display.className = "sequence-display";
      (task.sequence || []).forEach((value) => {
        const span = document.createElement("span");
        span.className = value === null ? "sequence-gap" : (task.__type === "sequence" ? "sequence-num" : "sequence-shape");
        span.textContent = value === null ? "?" : value;
        display.append(span);
      });
      wrap.append(q, display);
    } else if (task.__type === "oddOneOut") {
      const q = document.createElement("p");
      q.className = "adventure-question";
      q.textContent = "Welches Bild passt nicht?";
      wrap.append(q);
    }
    return wrap;
  }

  function renderOptions(task, onPick) {
    const options = document.createElement("div");
    const isImage = task.__type === "oddOneOut" || task.__type === "shape";
    options.className = "adventure-options" + (isImage ? " image-options" : "");
    options.style.setProperty("--option-count", Math.min(task.options.length, 4));
    const dimTarget = state.attempts >= 3 ? 2 : state.attempts >= 2 ? 1 : 0;
    let dimmed = 0;
    task.options.forEach((option) => {
      const isCorrect = String(option) === String(task.correctAnswer);
      const button = document.createElement("button");
      button.type = "button";
      let className = "adventure-option" + (isImage ? " image-option" : "");
      if (!isCorrect && dimmed < dimTarget) { className += " dimmed"; button.disabled = true; dimmed += 1; }
      else if (isCorrect && state.attempts >= 3) className += " hint";
      button.className = className;
      button.textContent = option;
      button.addEventListener("click", () => onPick(option, button));
      options.append(button);
    });
    return options;
  }

  function renderPath() {
    const path = document.createElement("div");
    path.className = "adventure-path";
    const avatar = (kids.getProfile && kids.getProfile()?.avatar) || "🦊";
    for (let i = 0; i < STATION_COUNT; i += 1) {
      const marker = document.createElement("span");
      marker.className = "adventure-marker" + (i < state.station ? " done" : i === state.station ? " current" : "");
      marker.textContent = i < state.station ? "⭐" : i === state.station ? avatar : STATION_SCENES[i];
      path.append(marker);
    }
    return path;
  }

  function handlePick(option, button) {
    if (state.answered) return;
    const task = state.task;
    if (String(option) === String(task.correctAnswer)) {
      state.answered = true;
      button.classList.add("correct");
      kids.playStarSound(0);
      kids.vibrate(30);
      kids.speak(kids.prefersReducedMotion() ? "Richtig!" : "Super!");
      window.setTimeout(() => {
        state.station += 1;
        state.attempts = 0;
        state.answered = false;
        if (state.station >= STATION_COUNT) finishJourney();
        else renderStation();
      }, 750);
    } else {
      state.attempts += 1;
      if (state.attempts === 1) state.stars = 2;
      if (state.attempts >= 3) state.stars = 1;
      button.classList.add("wrong");
      kids.speak("Fast! Versuch es nochmal.");
      renderStation(true);
    }
  }

  function renderStation(keepTask) {
    if (!keepTask) {
      state.task = nextTask();
    }
    if (!state.task) {
      root.innerHTML = "<p class=\"adventure-error\">Das Abenteuer ist gerade nicht verfügbar. Bitte lade die Seite neu.</p>";
      return;
    }
    const task = state.task;
    root.innerHTML = "";
    const card = document.createElement("section");
    card.className = "adventure-card";

    card.append(renderPath());

    const head = document.createElement("div");
    head.className = "adventure-head";
    const step = document.createElement("span");
    step.className = "adventure-step";
    step.textContent = `Station ${state.station + 1} von ${STATION_COUNT}`;
    head.append(step);
    if (kids.ttsSupported && kids.ttsSupported()) {
      const speaker = document.createElement("button");
      speaker.type = "button";
      speaker.className = "task-speaker";
      speaker.setAttribute("aria-label", "Aufgabe vorlesen");
      speaker.textContent = "🔊";
      speaker.addEventListener("click", () => kids.speak(spokenFor(task)));
      head.append(speaker);
    }
    card.append(head);

    const mascot = document.createElement("div");
    mascot.className = "adventure-mascot";
    mascot.setAttribute("aria-hidden", "true");
    mascot.innerHTML = kids.mascotSVG("happy");
    card.append(mascot);

    card.append(renderPrompt(task));
    card.append(renderOptions(task, handlePick));

    const feedback = document.createElement("p");
    feedback.className = "adventure-feedback" + (state.attempts > 0 ? " visible" : "");
    if (state.attempts > 0) feedback.textContent = state.attempts >= 3 ? "Tipp: Der richtige Weg blinkt!" : "Fast! Schau nochmal genau hin.";
    card.append(feedback);

    root.append(card);

    if (kids.isYoung && kids.isYoung() && !keepTask) kids.speak(spokenFor(task));
  }

  function finishJourney() {
    const journeys = (kids.readJSON(kids.KEYS.adventure, { done: 0 }).done || 0) + 1;
    kids.writeJSON(kids.KEYS.adventure, { done: journeys });
    const daily = kids.recordDailySolve ? kids.recordDailySolve() : null;
    const newStickers = kids.addStarsToZoo ? kids.addStarsToZoo(state.stars, { threeStar: state.stars >= 3 }) : [];

    root.innerHTML = "";
    const card = document.createElement("section");
    card.className = "adventure-card adventure-finish";
    const mascot = document.createElement("div");
    mascot.className = "adventure-mascot big";
    mascot.setAttribute("aria-hidden", "true");
    mascot.innerHTML = kids.mascotSVG("cheer");
    card.append(mascot);

    const title = document.createElement("h2");
    title.textContent = "Geschafft! Die Reise ist vorbei! 🎉";
    card.append(title);

    const starRow = document.createElement("div");
    starRow.className = "star-row";
    for (let i = 0; i < 3; i += 1) {
      const star = document.createElement("span");
      star.className = "star " + (i < state.stars ? "filled" : "empty");
      star.textContent = i < state.stars ? "★" : "☆";
      starRow.append(star);
    }
    card.append(starRow);

    if (daily) {
      const dailyLine = document.createElement("p");
      dailyLine.className = "adventure-daily";
      dailyLine.textContent = daily.done ? "Tagesziel geschafft! 🎉" : `Heute: ${daily.count} von ${daily.goal} Rätseln`;
      card.append(dailyLine);
    }
    if (newStickers && newStickers.length) {
      const reward = document.createElement("a");
      reward.className = "adventure-reward";
      reward.href = "album.html";
      reward.innerHTML = `<span aria-hidden="true">${newStickers.map((s) => s.emoji).join(" ")}</span> Neues Tier im Zoo! Tippe hier.`;
      card.append(reward);
    }

    const actions = document.createElement("div");
    actions.className = "kids-modal-actions";
    const again = document.createElement("button");
    again.type = "button";
    again.className = "kids-modal-primary";
    again.textContent = "Neue Reise 🚀";
    again.addEventListener("click", startJourney);
    const home = document.createElement("a");
    home.className = "kids-modal-secondary";
    home.href = "index.html";
    home.textContent = "Nach Hause";
    actions.append(again, home);
    card.append(actions);

    root.append(card);
    kids.playChime();
    kids.burstConfetti(card);
    kids.vibrate([40, 40, 90]);
    kids.speak("Super! Du hast die ganze Rätselreise geschafft!");
  }

  function startJourney() {
    state.station = 0;
    state.attempts = 0;
    state.answered = false;
    state.lastType = null;
    state.stars = 3;
    renderStation();
  }

  if (!tasksApi()) {
    root.innerHTML = "<p class=\"adventure-error\">Das Abenteuer lädt … Bitte lade die Seite neu, falls nichts erscheint.</p>";
    return;
  }
  startJourney();
})();
