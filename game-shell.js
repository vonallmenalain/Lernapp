/*
 * game-shell.js – Die gemeinsame Bühne der Tempospiele.
 *
 * Landschaft der Startseite als Hintergrund, drei Knöpfe und ein Lautsprecher
 * oben links, ein Zähler oben rechts, ein Zeitbalken darunter, und am Schluss
 * eine Bestenliste. Alles, was ein Spiel auf Zeit gleich braucht – und nichts
 * vom Spiel selbst.
 *
 * Das Spiel bekommt eine Fläche in der Mitte und ein paar Handgriffe:
 *   setCount(n)      Zähler oben rechts
 *   startClock(ms)   Uhr starten; sie meldet sich, wenn die Zeit um ist
 *   showResult(...)  Bestenliste mit "nochmal" und "zurück"
 *
 * Die Uhr läuft nach der Wanduhr, nicht nach Zeitgeber-Schritten. Ein Tab im
 * Hintergrund bekommt seine Zeitgeber gedrosselt oder gar nicht mehr; wer beim
 * Zurückkommen weiterrechnete, sässe in einer Runde ohne Ende.
 */
(() => {
  "use strict";

  const art = () => window.LernappTrainArt || null;
  const scenes = () => window.LernappScenes || null;
  const kids = () => window.LernappKids || null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svg(children, extra = {}) {
    return art().el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", ...extra }, children);
  }

  const ICONS = {
    home: () => [art().el("path", {
      d: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z",
      fill: "none", stroke: "currentColor", "stroke-width": 2.2, "stroke-linejoin": "round",
    })],
    back: () => [art().el("path", {
      d: "M15 5 8 12l7 7", fill: "none", stroke: "currentColor",
      "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round",
    })],
    again: () => [
      art().el("path", {
        d: "M19 12a7 7 0 1 1-2.4-5.3", fill: "none", stroke: "currentColor",
        "stroke-width": 2.4, "stroke-linecap": "round",
      }),
      art().el("polygon", { points: "19,3 19.6,8.2 14.4,7.4", fill: "currentColor" }),
    ],
    tick: () => [art().el("path", {
      d: "M5 13l4.5 4.5L19 7", fill: "none", stroke: "currentColor",
      "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round",
    })],
  };

  function iconButton(name, label, paths, onClick, extraClass = "") {
    const button = el("button", `cm-icon cm-icon-${name} ${extraClass}`.trim());
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.append(svg(paths));
    button.addEventListener("click", onClick);
    return button;
  }

  /*
   * Baut die Bühne.
   *
   *   host      das Element, in dem alles landet
   *   title     Name des Spiels – das Einzige, was oben steht
   *   area      Bereich des Zugs, für Farbe und Rückweg
   *   help      Text, den der Lautsprecher vorliest
   *   onRestart was der Neu-Knopf tut
   */
  function mount({ host, title, area, accent, accentDark, help, onRestart }) {
    host.style.setProperty("--cm-accent", accent);
    host.style.setProperty("--cm-accent-dark", accentDark);
    host.innerHTML = "";
    host.dataset.phase = "intro";

    // --- Hintergrund: die Landschaft der Startseite --------------------------
    if (scenes()) host.append(scenes().buildScene(scenes().savedScene()));

    // --- Der Lautsprecher oben links ----------------------------------------
    // Derselbe wie in den anderen Spielen: er kennt schon den Ton-Schalter, das
    // Vorlesen und die Sprechblase für Kinder, die mitlesen wollen.
    kids()?.mountHelpButton?.();
    if (help) kids()?.setHelp?.(help);

    // --- Leiste oben ---------------------------------------------------------
    const bar = el("div", "cm-bar");
    const left = el("div", "cm-bar-left");
    left.append(iconButton("home", "Zur Startseite", ICONS.home(), () => {
      stopClock();
      window.location.href = "index.html";
    }));
    // Zurück führt nicht auf das Startbild, sondern dorthin, wo das Kind
    // hergekommen ist: in die Spielauswahl seines Bereichs.
    left.append(iconButton("back", "Zurück zur Auswahl", ICONS.back(), () => {
      stopClock();
      window.location.href = `index.html?bereich=${encodeURIComponent(area)}`;
    }));
    left.append(iconButton("again", "Neu starten", ICONS.again(), () => { stopClock(); onRestart(); }));
    bar.append(left, el("h1", "cm-title", title));

    // Dezent oben rechts: wie viel bisher richtig war. Die Punkte kommen am
    // Schluss – eine Zahl, die während des Spiels fallen kann, würde mitten im
    // Tempo entmutigen.
    const count = el("div", "cm-count");
    count.setAttribute("role", "status");
    count.setAttribute("aria-live", "polite");
    count.append(svg(ICONS.tick(), { class: "cm-count-tick" }));
    const countValue = el("span", "cm-count-value", "0");
    count.append(countValue);
    bar.append(count);
    host.append(bar);

    // --- Zeitbalken ----------------------------------------------------------
    const time = el("div", "cm-time");
    time.setAttribute("aria-hidden", "true");
    const timeFill = el("span", "cm-time-fill");
    time.append(timeFill);
    host.append(time);

    // --- Die Fläche für das Spiel -------------------------------------------
    const play = el("div", "cm-play");
    host.append(play);

    // --- Uhr ------------------------------------------------------------------
    let ticker = null;
    let endsAt = 0;
    let duration = 0;
    let onTimeUp = null;

    function paintClock() {
      const left_ = Math.max(0, endsAt - Date.now());
      timeFill.style.transform = `scaleX(${duration ? left_ / duration : 1})`;
      return left_;
    }

    function tick() {
      if (paintClock() > 0) return;
      stopClock();
      onTimeUp?.();
    }

    function startClock(ms, callback) {
      stopClock();
      duration = ms;
      endsAt = Date.now() + ms;
      onTimeUp = callback;
      paintClock();
      ticker = window.setInterval(tick, 100);
    }

    function stopClock() {
      if (ticker) { window.clearInterval(ticker); ticker = null; }
    }

    // Zurück aus dem Hintergrund: sofort nachziehen. Der Browser drosselt
    // Zeitgeber in verborgenen Tabs oder hält sie ganz an – ohne dieses
    // Nachziehen liefe die Runde weiter, obwohl die Zeit längst um ist.
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && ticker) tick();
    });
    window.addEventListener("pagehide", stopClock);

    // --- Der Überzug für das Ergebnis ---------------------------------------
    let overlay = null;

    function closeOverlay() {
      overlay?.remove();
      overlay = null;
    }

    function panel(children) {
      closeOverlay();
      overlay = el("div", "cm-overlay");
      const box = el("div", "cm-panel");
      children.forEach((child) => box.append(child));
      overlay.append(box);
      host.append(overlay);
      return box;
    }

    /*
     * Die Bestenliste am Schluss. store = { scores: [...] }, punkte = der
     * frische Lauf, note = eine Zeile darunter (oder nichts).
     */
    function showResult({ points, detail, scores, note, top = 5 }) {
      host.dataset.phase = "over";
      timeFill.style.transform = "scaleX(0)";
      const parts = [
        el("p", "cm-result-label", "Deine Punkte"),
        el("p", "cm-result-score", String(points)),
      ];
      if (detail) parts.push(el("p", "cm-result-detail", detail));

      // Der frische Lauf ist hervorgehoben – ohne die Markierung müsste ein
      // Kind seine eigene Zahl suchen. Markiert wird genau einer, sonst
      // leuchteten bei gleichem Ergebnis mehrere.
      const list = el("ol", "cm-scores");
      let marked = false;
      scores.forEach((value, index) => {
        const item = el("li", "cm-score-item");
        if (!marked && value === points) { item.classList.add("is-new"); marked = true; }
        item.append(el("span", "cm-score-rank", `${index + 1}.`), el("span", "cm-score-value", String(value)));
        list.append(item);
      });
      for (let i = scores.length; i < top; i += 1) {
        const item = el("li", "cm-score-item is-empty");
        item.append(el("span", "cm-score-rank", `${i + 1}.`), el("span", "cm-score-value", "–"));
        list.append(item);
      }
      parts.push(list);
      if (note) parts.push(el("p", `cm-runs${note.done ? " is-done" : ""}`, note.text));

      const actions = el("div", "cm-actions");
      actions.append(iconButton("again", "Noch einmal", ICONS.again(), () => { closeOverlay(); onRestart(); }, "big"));
      actions.append(iconButton("back", "Zurück zur Auswahl", ICONS.back(), () => {
        stopClock();
        window.location.href = `index.html?bereich=${encodeURIComponent(area)}`;
      }, "big"));
      parts.push(actions);
      panel(parts);
    }

    return {
      play,
      el,
      icon: iconButton,
      setPhase(phase) { host.dataset.phase = phase; },
      setCount(value) { countValue.textContent = String(value); },
      startClock,
      stopClock,
      showResult,
      closeOverlay,
      clear() { play.innerHTML = ""; },
    };
  }

  window.LernappGameShell = { mount, ICONS };
})();
