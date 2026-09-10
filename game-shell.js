/*
 * game-shell.js – Die gemeinsame Bühne der Bestenlisten-Spiele.
 *
 * Landschaft der Startseite als Hintergrund, drei Knöpfe und ein Lautsprecher
 * oben links, ein Zähler oben rechts, wahlweise ein Zeitbalken darunter, und am
 * Schluss eine Bestenliste. Alles, was ein Spiel um einen Punktestand gleich
 * braucht – und nichts vom Spiel selbst.
 *
 * Das Spiel bekommt eine Fläche in der Mitte und ein paar Handgriffe:
 *   setCount(n)      Zähler oben rechts
 *   startClock(ms)   Uhr starten; sie meldet sich, wenn die Zeit um ist
 *   showResult(...)  Bestenliste mit "nochmal" und "zurück"
 *
 * Auf der Reise (journey-plan.js) öffnet ein Spiel mit ?station=: dann kennt
 * die Bühne den Auftrag – eine Zielpunktzahl, ein Level, eine Kartenzahl –,
 * zeigt ihn im Zähler, sagt ihn vor, wertet am Schluss aus, ob er geschafft
 * ist, und führt zurück auf die Karte statt in die Spielauswahl. Das Spiel
 * selbst muss dafür nur direkt im verlangten Level starten (shell.journey).
 *
 * Die Uhr ist wahlweise: Karten-Merker läuft gegen sie, Strand-Schätze läuft
 * ohne. Wo sie läuft, läuft sie nach der Wanduhr, nicht nach Zeitgeber-
 * Schritten. Ein Tab im Hintergrund bekommt seine Zeitgeber gedrosselt oder gar
 * nicht mehr; wer beim Zurückkommen weiterrechnete, sässe in einer Runde ohne
 * Ende.
 */
(() => {
  "use strict";

  const art = () => window.LernappTrainArt || null;
  const scenes = () => window.LernappScenes || null;
  const kids = () => window.LernappKids || null;
  const reise = () => window.LernappReise || null;

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
    star: () => [art().el("path", {
      d: "M12 3.2 14.7 9l6.3.8-4.6 4.3 1.2 6.2L12 17.4 6.4 20.3l1.2-6.2L3 9.8 9.3 9z",
      fill: "currentColor", stroke: "currentColor", "stroke-width": 1.4, "stroke-linejoin": "round",
    })],
    tick: () => [art().el("path", {
      d: "M5 13l4.5 4.5L19 7", fill: "none", stroke: "currentColor",
      "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round",
    })],
    // Das Fähnchen des Auftrags auf der Reise.
    flag: () => [
      art().el("rect", { x: 4, y: 3, width: 3, height: 18, rx: 1.2, fill: "currentColor" }),
      art().el("path", { d: "M7 4h11l-3 4 3 4H7z", fill: "currentColor", opacity: "0.85" }),
    ],
    // Die Karte: das Zeichen der Reise, für den Weg zurück.
    map: () => [
      art().el("path", { d: "M4 17 C8 17 8 7 12 7 S16 17 20 17", fill: "none", stroke: "currentColor", "stroke-width": 2.4, "stroke-linecap": "round" }),
      art().el("circle", { cx: 4, cy: 17, r: 2.4, fill: "currentColor" }),
      art().el("circle", { cx: 12, cy: 7, r: 2.4, fill: "currentColor" }),
      art().el("circle", { cx: 20, cy: 17, r: 2.4, fill: "currentColor" }),
    ],
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
  function mount({ host, title, area, accent, accentDark, help, onRestart, onBack, clock = true }) {
    host.style.setProperty("--cm-accent", accent);
    host.style.setProperty("--cm-accent-dark", accentDark);
    host.innerHTML = "";
    host.dataset.phase = "intro";

    // --- Der Auftrag der Reise -----------------------------------------------
    // Nur, wenn diese Seite mit einer Station geöffnet wurde, die zu ihr
    // gehört. Dann führt jeder Weg zurück auf die Karte.
    const journey = reise()?.fromLocation?.() || null;
    if (journey) host.dataset.journey = String(journey.nr);
    const mapHref = journey ? reise().mapUrl(journey.nr) : null;
    function toMap() {
      stopClock();
      window.location.href = mapHref;
    }

    // --- Hintergrund: die Landschaft der Startseite --------------------------
    if (scenes()) host.append(scenes().buildScene(scenes().savedScene()));

    // --- Der Lautsprecher oben links ----------------------------------------
    // Derselbe wie in den anderen Spielen: er kennt schon den Ton-Schalter, das
    // Vorlesen und die Sprechblase für Kinder, die mitlesen wollen.
    kids()?.mountHelpButton?.();
    // Auf der Reise sagt der Lautsprecher zuerst den Auftrag, dann die Regeln.
    const helpText = journey ? `${reise().describe(journey)} ${help || ""}`.trim() : help;
    if (helpText) kids()?.setHelp?.(helpText);

    // --- Leiste oben ---------------------------------------------------------
    const bar = el("div", "cm-bar");
    const left = el("div", "cm-bar-left");
    left.append(iconButton("home", "Zur Startseite", ICONS.home(), () => {
      stopClock();
      window.location.href = "index.html";
    }));
    // Zurück führt nicht auf das Startbild, sondern eine Stufe zurück: bei
    // einem Spiel mit Levelwahl erst dorthin, sonst gleich in die Spielauswahl
    // des Bereichs. onBack meldet mit true, dass es die Stufe selbst genommen
    // hat.
    left.append(iconButton(journey ? "map" : "back", journey ? "Zurück zur Karte" : "Zurück zur Auswahl", journey ? ICONS.map() : ICONS.back(), () => {
      stopClock();
      if (journey) { toMap(); return; }
      if (onBack?.()) return;
      window.location.href = `index.html?bereich=${encodeURIComponent(area)}`;
    }));
    left.append(iconButton("again", "Neu starten", ICONS.again(), () => { stopClock(); onRestart(); }));
    bar.append(left, el("h1", "cm-title", title));

    // Dezent oben rechts: wie viel bisher geschafft ist. Beim Karten-Merker ist
    // das nicht der Punktestand – eine Zahl, die während des Spiels auch fallen
    // kann, würde mitten im Tempo entmutigen.
    const count = el("div", "cm-count");
    count.setAttribute("role", "status");
    count.setAttribute("aria-live", "polite");
    // Auf der Reise mit Zielpunktzahl steht das Ziel dabei: "3 / 5", mit dem
    // Fähnchen des Auftrags statt des Hakens.
    const scoreTask = journey && journey.kind === "score";
    count.append(svg(scoreTask ? ICONS.flag() : ICONS.tick(), { class: "cm-count-tick" }));
    const countValue = el("span", "cm-count-value", "0");
    count.append(countValue);
    if (scoreTask) {
      count.classList.add("has-target");
      count.append(el("span", "cm-count-target", `/ ${journey.target}`));
    }
    bar.append(count);
    host.append(bar);

    // --- Zeitbalken ----------------------------------------------------------
    // Nicht jedes Spiel läuft gegen die Uhr. Ein Balken, der nie kleiner wird,
    // wäre schlimmer als keiner: er verspräche einen Zeitdruck, den es nicht
    // gibt.
    const time = el("div", "cm-time");
    time.setAttribute("aria-hidden", "true");
    const timeFill = el("span", "cm-time-fill");
    time.append(timeFill);
    if (clock) host.append(time);

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
    let releaseHelp = null;

    // Nur die Tafel wegnehmen: panel() baut gleich die nächste auf und meldet
    // ihren Vorlese-Text selbst an.
    function dropOverlay() {
      overlay?.remove();
      overlay = null;
    }

    // Zurück ins Spiel: Tafel weg, und der Lautsprecher sagt wieder die Regeln.
    function closeOverlay() {
      dropOverlay();
      releaseHelp?.();
      releaseHelp = null;
    }

    function panel(children) {
      dropOverlay();
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
    /*
     * stars   0–3: statt einer Punktzahl stehen Sterne da (Weichen-Wirrwarr)
     * scores  fehlt oder null: keine Bestenliste (bei Sternen wäre sie doppelt)
     * onBack  wohin der Zurück-Knopf führt; ohne das in die Spielauswahl
     */
    function showResult({ points, stars, detail, scores, note, speech, onBack, label = "Deine Punkte", top = 5 }) {
      host.dataset.phase = "over";
      timeFill.style.transform = "scaleX(0)";

      // --- Der Auftrag der Reise: geschafft oder nicht? ------------------------
      // Punkte gegen das Ziel, Level gegen "mindestens ein Stern". Geschafft
      // heisst Stempel – mit drei Sternen bzw. einer guten Runde ein goldener.
      // Nicht geschafft kostet nichts: die Runde hat für den Wagen gezählt, und
      // der Fehlversuch zählt für das Ausweichgleis.
      let journeyNote = null;
      if (journey) {
        const scored = typeof points === "number";
        const won = journey.kind === "score" ? scored && points >= journey.target : (Number(stars) || 0) >= 1;
        if (won) {
          const runStars = journey.kind === "score"
            ? (points >= journey.gut ? 3 : points >= journey.gut / 2 ? 2 : 1)
            : Math.max(1, Math.min(3, Number(stars) || 1));
          const result = reise().markDone(journey.nr, { stars: runStars, game: journey.game });
          journeyNote = {
            done: true,
            text: result.gold ? "Auftrag geschafft – ein goldener Stempel!" : "Auftrag geschafft – Stempel für die Karte!",
            speech: result.gold ? "Auftrag geschafft, ein goldener Stempel! Tippe auf die Karte, und der Zug fährt weiter." : "Auftrag geschafft, der Stempel wartet auf der Karte! Tippe auf die Karte, und der Zug fährt weiter.",
          };
          kids()?.playJingle?.(result.gold ? "unlock" : "correct");
        } else {
          const tries = reise().recordTry(journey.nr);
          const alt = tries >= reise().TRIES_FOR_ALT ? reise().altTaskFor(journey.nr) : null;
          journeyNote = {
            done: false,
            text: `Auftrag: ${journey.label} – noch nicht. Die Runde zählt trotzdem für den Wagen.`,
            speech: `Der Auftrag war ${journey.speech.replace(/\.$/, "")} – diesmal noch nicht. Die Runde zählt trotzdem für deinen Wagen. Probier es noch einmal${alt ? `, oder nimm auf der Karte das Ausweichgleis: ${alt.title}` : ""}.`,
          };
        }
      }

      // Der Lautsprecher oben links sagt jetzt das Ergebnis statt der Regeln.
      // Ein Kind, das die Zahlen nicht liest, erfährt so, wie es gelaufen ist
      // und wie weit es noch bis zum fertigen Wagen hat.
      releaseHelp?.();
      const fullSpeech = journeyNote ? `${speech || ""} ${journeyNote.speech}`.trim() : speech;
      releaseHelp = fullSpeech ? kids()?.pushHelp?.(fullSpeech) || null : null;
      const parts = [el("p", "cm-result-label", label)];
      if (typeof stars === "number") {
        // Drei Sterne, die leeren blass. Eine Zahl "2 von 3" müsste ein Kind
        // erst lesen; drei Bilder sieht es.
        const row = el("div", "cm-result-stars");
        row.setAttribute("aria-label", `${stars} von 3 Sternen`);
        for (let i = 0; i < 3; i += 1) {
          const star = el("span", `cm-result-star${i < stars ? " is-on" : ""}`);
          star.append(svg(ICONS.star()));
          row.append(star);
        }
        parts.push(row);
      } else {
        parts.push(el("p", "cm-result-score", String(points)));
      }
      if (detail) parts.push(el("p", "cm-result-detail", detail));

      // Der frische Lauf ist hervorgehoben – ohne die Markierung müsste ein
      // Kind seine eigene Zahl suchen. Markiert wird genau einer, sonst
      // leuchteten bei gleichem Ergebnis mehrere.
      const list = el("ol", "cm-scores");
      let marked = false;
      (scores || []).forEach((value, index) => {
        const item = el("li", "cm-score-item");
        if (!marked && value === points) { item.classList.add("is-new"); marked = true; }
        item.append(el("span", "cm-score-rank", `${index + 1}.`), el("span", "cm-score-value", String(value)));
        list.append(item);
      });
      if (scores) {
        for (let i = scores.length; i < top; i += 1) {
          const item = el("li", "cm-score-item is-empty");
          item.append(el("span", "cm-score-rank", `${i + 1}.`), el("span", "cm-score-value", "–"));
          list.append(item);
        }
        parts.push(list);
      }
      if (journeyNote) {
        const line = el("p", `cm-journey${journeyNote.done ? " is-done" : ""}`, journeyNote.text);
        line.prepend(svg(journeyNote.done ? ICONS.tick() : ICONS.flag(), { class: "cm-journey-icon" }));
        parts.push(line);
      }
      if (note) parts.push(el("p", `cm-runs${note.done ? " is-done" : ""}`, note.text));

      const actions = el("div", "cm-actions");
      actions.append(iconButton("again", "Noch einmal", ICONS.again(), () => { closeOverlay(); onRestart(); }, "big"));
      if (journey) {
        // Zurück auf die Karte – der Stempel wartet dort. Bei geschafftem
        // Auftrag ist das der Knopf, der pulst.
        actions.append(iconButton("map", "Zurück zur Karte", ICONS.map(), toMap, `big${journeyNote?.done ? " is-primary" : ""}`));
      } else {
        actions.append(iconButton("back", "Zurück zur Auswahl", ICONS.back(), () => {
          stopClock();
          if (onBack) { closeOverlay(); onBack(); return; }
          window.location.href = `index.html?bereich=${encodeURIComponent(area)}`;
        }, "big"));
      }
      parts.push(actions);
      panel(parts);
      if (journeyNote?.done && !kids()?.prefersReducedMotion?.()) {
        const box = host.querySelector(".cm-panel");
        if (box) kids()?.burstConfetti?.(box, 30);
      }
    }

    return {
      play,
      el,
      icon: iconButton,
      // Der Auftrag der Reise, oder null. Ein Spiel, das ihn kennt, startet
      // direkt im verlangten Level statt mit seinem Menü.
      journey,
      toMap,
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
