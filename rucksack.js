/*
 * rucksack.js – Rucksack packen als wachsende Reihenfolge.
 *
 * Ein Gegenstand kommt in den Rucksack, dann muss die ganze Reihenfolge noch
 * einmal gepackt werden. Danach kommt einer dazu, und wieder die ganze Reihe.
 * Was zählt, ist die längste Reihe, die vollständig zurückkam.
 *
 * Vier Schwierigkeiten: wie viele Gegenstände bei jedem Schritt zur Wahl
 * stehen. Bei dreien ist ein geratener Tipp jeder dritte, bei sechsen jeder
 * sechste – deshalb ist ein gemerkter Gegenstand dort doppelt so viel wert.
 *
 * Bühne und Bestenliste kommen aus game-shell.js; hier steht nur die Regel.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "backpack") return;

  const host = document.querySelector("#rs-stage");
  const shellApi = window.LernappGameShell;
  const cloudApi = window.LernappGameCloud;
  if (!host || !shellApi) return;

  const kids = () => window.LernappKids || null;

  // ---------------------------------------------------------------------------
  // Regeln
  // ---------------------------------------------------------------------------
  // Die vier Stufen sind die Zahl der Karten, die bei jedem Schritt zur Wahl
  // stehen. Der Faktor gleicht aus, dass Raten bei drei Karten dreimal so oft
  // trifft wie bei sechsen. Gerundet wird aufwärts – eine halbe Punktzahl
  // müsste ein Kind erst deuten.
  const STUFEN = [
    { anzahl: 3, faktor: 1 },
    { anzahl: 4, faktor: 1.2 },
    { anzahl: 5, faktor: 1.5 },
    { anzahl: 6, faktor: 2 },
  ];

  const RUNS_FOR_DONE = 5;
  const TOP_COUNT = 5;
  // Wie lange der neue Gegenstand allein dasteht, bevor gepackt wird.
  const MERK_MS = 1000;

  const HELP = [
    "Rucksack packen. Such dir einen Gegenstand aus, er kommt in den Rucksack.",
    "Dann packst du alles noch einmal – in derselben Reihenfolge wie vorher.",
    "Stimmt die Reihe, kommt ein neuer Gegenstand dazu, und du packst wieder von vorn.",
    "Tippst du einmal daneben, ist die Runde vorbei.",
    "Gezählt wird die längste Reihe, die du ganz geschafft hast.",
    "Je mehr Karten zur Wahl stehen, desto mehr Punkte gibt jeder Gegenstand.",
    "Zeit hast du so viel du willst.",
  ].join(" ");

  const ITEMS = [
    { id: "apple", emoji: "🍎", label: "Apfel" },
    { id: "ball", emoji: "⚽", label: "Ball" },
    { id: "book", emoji: "📘", label: "Buch" },
    { id: "kite", emoji: "🪁", label: "Flugdrachen" },
    { id: "banana", emoji: "🍌", label: "Banane" },
    { id: "bear", emoji: "🧸", label: "Teddy" },
    { id: "pencil", emoji: "✏️", label: "Stift" },
    { id: "cookie", emoji: "🍪", label: "Keks" },
    { id: "car", emoji: "🚗", label: "Auto" },
    { id: "key", emoji: "🔑", label: "Schlüssel" },
    { id: "flower", emoji: "🌸", label: "Blume" },
    { id: "rocket", emoji: "🚀", label: "Rakete" },
    { id: "clock", emoji: "⏰", label: "Wecker" },
    { id: "shell", emoji: "🐚", label: "Muschel" },
    { id: "puzzle", emoji: "🧩", label: "Puzzle" },
    { id: "train", emoji: "🚂", label: "Zug" },
    { id: "umbrella", emoji: "☂️", label: "Schirm" },
    { id: "light", emoji: "💡", label: "Lampe" },
    { id: "hat", emoji: "🧢", label: "Kappe" },
    { id: "magnifier", emoji: "🔎", label: "Lupe" },
    { id: "dice", emoji: "🎲", label: "Würfel" },
    { id: "paint", emoji: "🎨", label: "Farbe" },
    { id: "map", emoji: "🗺️", label: "Karte" },
    { id: "medal", emoji: "🏅", label: "Medaille" },
    { id: "gift", emoji: "🎁", label: "Geschenk" },
    { id: "balloon", emoji: "🎈", label: "Ballon" },
    { id: "cup", emoji: "🥤", label: "Becher" },
    { id: "sandwich", emoji: "🥪", label: "Sandwich" },
    { id: "cheese", emoji: "🧀", label: "Käse" },
    { id: "grapes", emoji: "🍇", label: "Trauben" },
    { id: "carrot", emoji: "🥕", label: "Rüebli" },
    { id: "corn", emoji: "🌽", label: "Mais" },
    { id: "strawberry", emoji: "🍓", label: "Erdbeere" },
    { id: "chocolate", emoji: "🍫", label: "Schoggi" },
    { id: "lollipop", emoji: "🍭", label: "Lolli" },
    { id: "shoe", emoji: "👟", label: "Schuh" },
    { id: "sock", emoji: "🧦", label: "Socke" },
    { id: "glove", emoji: "🧤", label: "Handschuh" },
    { id: "scarf", emoji: "🧣", label: "Schal" },
    { id: "sunglasses", emoji: "🕶️", label: "Sonnenbrille" },
    { id: "camera", emoji: "📷", label: "Kamera" },
    { id: "phone", emoji: "📱", label: "Telefon" },
    { id: "headphones", emoji: "🎧", label: "Kopfhörer" },
    { id: "microphone", emoji: "🎤", label: "Mikrofon" },
    { id: "drum", emoji: "🥁", label: "Trommel" },
    { id: "guitar", emoji: "🎸", label: "Gitarre" },
    { id: "trumpet", emoji: "🎺", label: "Trompete" },
    { id: "violin", emoji: "🎻", label: "Geige" },
    { id: "crown", emoji: "👑", label: "Krone" },
    { id: "ring", emoji: "💍", label: "Ring" },
    { id: "gem", emoji: "💎", label: "Edelstein" },
    { id: "envelope", emoji: "✉️", label: "Brief" },
    { id: "mailbox", emoji: "📮", label: "Briefkasten" },
    { id: "paperclip", emoji: "📎", label: "Büroklammer" },
    { id: "scissors", emoji: "✂️", label: "Schere" },
    { id: "ruler", emoji: "📏", label: "Lineal" },
    { id: "calculator", emoji: "🧮", label: "Rechner" },
    { id: "laptop", emoji: "💻", label: "Laptop" },
    { id: "battery", emoji: "🔋", label: "Batterie" },
    { id: "flashlight", emoji: "🔦", label: "Taschenlampe" },
  ];

  // ---------------------------------------------------------------------------
  // Bestenliste – lokal und in der Cloud
  // ---------------------------------------------------------------------------
  const store = cloudApi
    ? cloudApi.register({ key: "lernapp.backpack", empty: { runs: 0, scores: [] }, merge: cloudApi.mergeScores(TOP_COUNT) })
    : {
      read: () => ({ runs: 0, scores: [] }),
      write(data) { return data; },
      update(fn) { return fn(this.read()); },
      onChange() { return () => {}; },
    };

  function recordRun(score) {
    return store.update((old) => ({
      runs: (Number(old.runs) || 0) + 1,
      scores: [...(old.scores || []), score].sort((a, b) => b - a).slice(0, TOP_COUNT),
    }));
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = { phase: "menu", stufe: null, reihe: [], schritt: 0, erinnert: 0, locked: false };
  let shell = null;
  let feld = null;
  let prompt = null;
  let stepTimer = null;

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function clearStep() {
    if (stepTimer) { window.clearTimeout(stepTimer); stepTimer = null; }
  }

  const punkte = (erinnert, stufe) => Math.ceil(erinnert * stufe.faktor);

  // ---------------------------------------------------------------------------
  // Die Wahl der Schwierigkeit
  // ---------------------------------------------------------------------------
  function showMenu() {
    clearStep();
    shell.closeOverlay();
    shell.setPhase("menu");
    state.phase = "menu";
    shell.setCount(0);

    shell.clear();
    prompt = shell.el("p", "cm-prompt", "Mit wie vielen Gegenständen willst du spielen?");
    shell.play.append(prompt);

    const reihe = shell.el("div", "rs-stufen");
    STUFEN.forEach((stufe) => {
      const button = shell.el("button", "rs-stufe");
      button.type = "button";
      button.dataset.anzahl = String(stufe.anzahl);
      button.setAttribute("aria-label",
        `${stufe.anzahl} Gegenstände zur Wahl. Jeder gemerkte gibt ${stufe.faktor} Punkte.`);
      button.append(shell.el("span", "rs-stufe-zahl", String(stufe.anzahl)));
      // Punkte je Gegenstand als kleine Zeile: so ist zu sehen, dass sich die
      // schwerere Wahl lohnt, ohne dass irgendwo "schwer" stehen muss.
      button.append(shell.el("span", "rs-stufe-wert", `× ${String(stufe.faktor).replace(".", ",")}`));
      button.addEventListener("click", () => startRun(stufe));
      reihe.append(button);
    });
    shell.play.append(reihe);
    shell.play.append(shell.el("p", "cm-runs", runsText(Number(store.read().runs) || 0)));
  }

  function runsText(runs) {
    const left = RUNS_FOR_DONE - runs;
    if (left <= 0) return "Dieses Spiel ist geschafft – der Wagen ist gebaut.";
    return left === 1
      ? "Noch eine Runde bis zum fertigen Wagen."
      : `Noch ${left} Runden bis zum fertigen Wagen.`;
  }

  // ---------------------------------------------------------------------------
  // Eine Runde
  // ---------------------------------------------------------------------------
  function startRun(stufe) {
    clearStep();
    shell.closeOverlay();
    shell.setPhase("play");
    state.phase = "waehlen";
    state.stufe = stufe;
    state.reihe = [];
    state.schritt = 0;
    state.erinnert = 0;
    state.locked = false;
    shell.setCount(0);

    shell.clear();
    prompt = shell.el("p", "cm-prompt", "Such dir einen Gegenstand aus.");
    shell.play.append(prompt);
    feld = shell.el("div", "rs-feld");
    shell.play.append(feld);
    zeigeWahl();
  }

  // Die Karten für einen Schritt: kein Rahmen, kein Kasten – nur die Sache
  // selbst. Ein Rahmen wäre eine zweite Form neben der, die zu merken ist.
  function karten(liste, onTap) {
    feld.innerHTML = "";
    feld.dataset.anzahl = String(liste.length);
    liste.forEach((item) => {
      const button = shell.el("button", "rs-item");
      button.type = "button";
      button.setAttribute("aria-label", item.label);
      button.append(shell.el("span", "rs-item-bild", item.emoji));
      button.addEventListener("click", () => onTap(item, button));
      feld.append(button);
    });
  }

  // --- Einen neuen Gegenstand wählen ---
  function zeigeWahl() {
    state.phase = "waehlen";
    state.locked = false;
    prompt.textContent = state.reihe.length ? "Such dir noch einen aus." : "Such dir einen Gegenstand aus.";
    const drin = new Set(state.reihe.map((item) => item.id));
    const frei = ITEMS.filter((item) => !drin.has(item.id));
    karten(shuffle(frei).slice(0, state.stufe.anzahl), (item) => {
      if (state.locked) return;
      state.locked = true;
      state.reihe.push(item);
      kids()?.playJingle?.("star");
      kids()?.vibrate?.(12);
      zeigeMerken(item);
    });
  }

  // --- Ihn kurz allein zeigen ---
  function zeigeMerken(item) {
    state.phase = "merken";
    prompt.textContent = "Merk ihn dir.";
    feld.innerHTML = "";
    feld.dataset.anzahl = "1";
    const bild = shell.el("div", "rs-item is-solo");
    bild.append(shell.el("span", "rs-item-bild", item.emoji));
    feld.append(bild);
    stepTimer = window.setTimeout(() => {
      if (state.phase === "merken") zeigePacken(0);
    }, MERK_MS);
  }

  // --- Die ganze Reihe noch einmal packen ---
  function zeigePacken(schritt) {
    state.phase = "packen";
    state.schritt = schritt;
    state.locked = false;
    const richtig = state.reihe[schritt];
    prompt.textContent = state.reihe.length === 1
      ? "Pack ihn ein."
      : `Was war Nummer ${schritt + 1}?`;
    const ablenker = shuffle(ITEMS.filter((item) => item.id !== richtig.id)).slice(0, state.stufe.anzahl - 1);
    karten(shuffle([richtig, ...ablenker]), (item, button) => {
      if (state.locked) return;
      state.locked = true;
      if (item.id === richtig.id) {
        button.classList.add("is-right");
        kids()?.playJingle?.("correct");
        kids()?.vibrate?.(14);
        stepTimer = window.setTimeout(() => {
          if (schritt + 1 < state.reihe.length) { zeigePacken(schritt + 1); return; }
          // Die ganze Reihe sass: das ist der neue Stand.
          state.erinnert = state.reihe.length;
          shell.setCount(state.erinnert);
          zeigeWahl();
        }, 320);
        return;
      }
      button.classList.add("is-wrong");
      kids()?.playJingle?.("retry");
      stepTimer = window.setTimeout(finish, 700);
    });
  }

  // ---------------------------------------------------------------------------
  // Schluss
  // ---------------------------------------------------------------------------
  function resultSpeech(points, runs) {
    const sachen = state.erinnert === 1 ? "einen Gegenstand" : `${state.erinnert} Gegenstände`;
    const zahl = points === 1 ? "einen Punkt" : `${points} Punkte`;
    return `Du hast ${sachen} gemerkt. Das gibt ${zahl}. ${runsText(runs)}`;
  }

  function finish() {
    clearStep();
    state.phase = "over";
    const points = punkte(state.erinnert, state.stufe);
    const next = recordRun(points);
    kids()?.playJingle?.("win");
    shell.showResult({
      label: "Deine Punkte",
      points,
      detail: `${state.erinnert} gemerkt · ${state.stufe.anzahl} zur Wahl`,
      scores: next.scores,
      top: TOP_COUNT,
      note: { text: runsText(next.runs), done: next.runs >= RUNS_FOR_DONE },
      speech: resultSpeech(points, next.runs),
      onBack: showMenu,
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  shell = shellApi.mount({
    host,
    title: "Rucksack packen",
    area: "gedaechtnis",
    accent: "#7C5CE6",
    accentDark: "#5a41b8",
    help: HELP,
    clock: false,
    onRestart: () => (state.phase === "menu" ? showMenu() : startRun(state.stufe)),
    // Zurück aus einer Runde führt in die Wahl der Schwierigkeit, nicht gleich
    // aus dem Spiel heraus.
    onBack: () => {
      if (state.phase === "menu") return false;
      showMenu();
      return true;
    },
  });

  showMenu();

  // Die Punkteformel nach aussen: das Prüfskript rechnet sie ohne Browser nach.
  window.LernappRucksack = { STUFEN, ITEMS, punkte, RUNS_FOR_DONE };

  window.addEventListener("pagehide", clearStep);
})();
