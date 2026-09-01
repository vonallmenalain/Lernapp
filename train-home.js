/*
 * train-home.js – Das Startbild.
 *
 * Setzt die Bühne zusammen: eine Landschaft aus mehreren Ebenen, die
 * unterschiedlich schnell vorbeiziehen, davor der Zug mit dem echten
 * Fortschritt, rechts das Startsignal. Oben rechts nur Profil und Ton.
 * Sonst nichts – kein Text, keine Kacheln, keine Liste.
 *
 * Holt die Zahlen bei train-progress.js und die Zeichnung bei train-art.js.
 * Läuft nur auf Seiten mit <body data-page="train">.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "train") return;

  const art = window.LernappTrainArt;
  const progress = window.LernappTrain;
  const stage = document.querySelector("#train-stage");
  if (!art || !progress || !stage) return;

  const kids = () => window.LernappKids || null;
  const home = () => window.LernappHome || null;
  const { el, group, shade } = art;

  const LOCO_KEY = "lernapp.train.loco";

  // ---------------------------------------------------------------------------
  // Szenen
  // ---------------------------------------------------------------------------
  // Eine Szene besteht aus Himmelsfarben und Ebenen, die unterschiedlich schnell
  // vorbeiziehen. Weil der Hintergrund wandert und nicht der Zug, bleibt die Lok
  // immer an derselben Stelle – sonst müsste sie bei jedem Bild neu gezeichnet
  // werden. Die Kacheln sind so gebaut, dass linke und rechte Kante gleich
  // aussehen; nur dann läuft die Schleife ohne sichtbaren Sprung.
  //
  // Etappe 6 macht die Szene wählbar. Bis dahin gibt es die eine.
  const TILE_W = 600;
  const TILE_H = 200;

  function tile(children, attrs = {}) {
    return el("svg", {
      viewBox: `0 0 ${TILE_W} ${TILE_H}`,
      preserveAspectRatio: "none",
      "aria-hidden": "true",
      ...attrs,
    }, children);
  }

  // Wellenzug mit gerader Anzahl Segmente – nur so passt die Steigung an der
  // Nahtstelle wieder zusammen.
  function hillPath(top, amplitude) {
    const step = TILE_W / 6;
    let d = `M0 ${TILE_H} L0 ${top} Q${step / 2} ${top - amplitude} ${step} ${top}`;
    for (let i = 2; i <= 6; i += 1) d += ` T${step * i} ${top}`;
    return `${d} L${TILE_W} ${TILE_H} Z`;
  }

  function tree(x, y, scale, trunk, crown) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("rect", { x: -5, y: -18, width: 10, height: 26, rx: 3, fill: trunk }),
      el("circle", { cx: 0, cy: -34, r: 24, fill: crown }),
      el("circle", { cx: -16, cy: -22, r: 16, fill: crown }),
      el("circle", { cx: 16, cy: -22, r: 16, fill: shade(crown, -0.1) }),
    ]);
  }

  function bush(x, y, scale, color) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("circle", { cx: -12, cy: 0, r: 12, fill: color }),
      el("circle", { cx: 4, cy: -5, r: 15, fill: shade(color, 0.08) }),
      el("circle", { cx: 18, cy: 1, r: 11, fill: shade(color, -0.08) }),
    ]);
  }

  function blade(x, y, height, color) {
    return el("path", {
      d: `M${x} ${y} q3 -${height / 2} 1 -${height}`,
      fill: "none", stroke: color, "stroke-width": 3, "stroke-linecap": "round",
    });
  }

  const SCENES = {
    wiese: {
      label: "Wiese und Hügel",
      sky: ["#a8ddf0", "#dff1f7"],
      ground: "#8fc45e",
      groundDark: "#6da645",
      layers: [
        {
          name: "clouds", speed: 150,
          build: () => tile([
            el("ellipse", { cx: 90, cy: 60, rx: 46, ry: 24, fill: "#ffffff", opacity: "0.9" }),
            el("ellipse", { cx: 128, cy: 68, rx: 34, ry: 18, fill: "#ffffff", opacity: "0.9" }),
            el("ellipse", { cx: 330, cy: 40, rx: 38, ry: 20, fill: "#ffffff", opacity: "0.75" }),
            el("ellipse", { cx: 366, cy: 46, rx: 28, ry: 15, fill: "#ffffff", opacity: "0.75" }),
            el("ellipse", { cx: 480, cy: 88, rx: 30, ry: 15, fill: "#ffffff", opacity: "0.6" }),
          ]),
        },
        {
          name: "far", speed: 96,
          build: () => tile([
            el("path", { d: hillPath(96, 54), fill: "#9fc9a6" }),
            el("path", { d: hillPath(132, 34), fill: "#86b98f" }),
          ]),
        },
        {
          name: "mid", speed: 54,
          build: () => tile([
            el("path", { d: hillPath(150, 22), fill: "#6faa6b" }),
            tree(70, 176, 1, "#7b5c3a", "#4f9350"),
            tree(210, 182, 0.8, "#7b5c3a", "#57a058"),
            tree(360, 174, 1.1, "#6d5133", "#478a48"),
            tree(500, 180, 0.85, "#7b5c3a", "#4f9350"),
          ]),
        },
        {
          name: "near", speed: 26, front: true,
          build: () => {
            const parts = [el("rect", { x: 0, y: 150, width: TILE_W, height: 50, fill: "#7ab455" })];
            for (let x = 6; x < TILE_W; x += 17) {
              parts.push(blade(x, 168, 16 + (x % 3) * 5, x % 34 === 6 ? "#8fc766" : "#68a047"));
            }
            [60, 190, 320, 455, 545].forEach((x, i) => {
              parts.push(el("circle", { cx: x, cy: 158 - (i % 2) * 4, r: 5, fill: ["#ffd166", "#ff8fa3", "#ffffff", "#ffd166", "#c9a7f5"][i] }));
            });
            parts.push(bush(140, 162, 0.9, "#5d9a4e"));
            parts.push(bush(410, 160, 1.05, "#6aa457"));
            return tile(parts);
          },
        },
      ],
      // Ein paar Vögel als eigene Ebene: sie ziehen schneller als alles andere
      // und machen den Himmel lebendig, ohne dass er voller wird.
      birds: true,
      sun: { cx: 512, cy: 70, r: 34, color: "#ffd166" },
    },
  };

  // ---------------------------------------------------------------------------
  // Lok-Konfiguration
  // ---------------------------------------------------------------------------
  function readLoco() {
    try {
      const raw = localStorage.getItem(LOCO_KEY);
      return raw ? { ...art.DEFAULT_LOCO, ...JSON.parse(raw) } : { ...art.DEFAULT_LOCO };
    } catch { return { ...art.DEFAULT_LOCO }; }
  }

  // ---------------------------------------------------------------------------
  // Bühne bauen
  // ---------------------------------------------------------------------------
  function buildScene(scene) {
    const wrap = document.createElement("div");
    wrap.className = "scene";
    wrap.style.setProperty("--sky-top", scene.sky[0]);
    wrap.style.setProperty("--sky-bottom", scene.sky[1]);
    wrap.style.setProperty("--ground", scene.ground);
    wrap.style.setProperty("--ground-dark", scene.groundDark);

    if (scene.sun) {
      const sun = document.createElement("div");
      sun.className = "scene-sun";
      sun.setAttribute("aria-hidden", "true");
      const svg = el("svg", { viewBox: "0 0 100 100" }, [
        el("circle", { cx: 50, cy: 50, r: 42, fill: scene.sun.color, opacity: "0.35" }),
        el("circle", { cx: 50, cy: 50, r: 30, fill: scene.sun.color }),
      ]);
      sun.append(svg);
      wrap.append(sun);
    }

    scene.layers.forEach((layer) => {
      const band = document.createElement("div");
      band.className = `scene-layer scene-layer-${layer.name}${layer.front ? " is-front" : ""}`;
      band.style.setProperty("--speed", `${layer.speed}s`);

      // Zwei gleiche Kacheln nebeneinander: die Schleife schiebt den Streifen um
      // genau eine Kachelbreite weiter und beginnt dann optisch von vorn.
      const strip = document.createElement("div");
      strip.className = "scene-strip";
      strip.append(layer.build(), layer.build());
      band.append(strip);
      wrap.append(band);
    });

    if (scene.birds) {
      const birds = document.createElement("div");
      birds.className = "scene-birds";
      birds.setAttribute("aria-hidden", "true");
      [0, 1, 2].forEach((i) => {
        const bird = document.createElement("div");
        bird.className = `scene-bird scene-bird-${i + 1}`;
        bird.append(el("svg", { viewBox: "0 0 40 20" }, [
          el("path", { d: "M2 12 q8 -9 16 0 q8 -9 20 -2", fill: "none", stroke: "#5a6b7a", "stroke-width": 2.4, "stroke-linecap": "round" }),
        ]));
        birds.append(bird);
      });
      wrap.append(birds);
    }

    return wrap;
  }

  function buildTopbar() {
    const bar = document.createElement("div");
    bar.className = "train-topbar";

    const profile = document.createElement("button");
    profile.type = "button";
    profile.className = "train-profile";
    profile.setAttribute("aria-label", "Profil ändern");
    profile.title = "Profil";
    const avatar = kids()?.getProfile?.()?.avatar || "🙂";
    profile.innerHTML = `<span aria-hidden="true">${avatar}</span>`;
    profile.addEventListener("click", () => home()?.showProfileSetup?.());

    bar.append(profile);
    return bar;
  }

  // Beschreibt den Zug in Worten – nicht auf dem Bild, sondern für den
  // Vorlese-Knopf und für Screenreader. Das Startbild bleibt textfrei, wird
  // dadurch aber nicht unbedienbar für ein Kind, das nicht sieht.
  function describe(areas) {
    const done = areas.filter((area) => area.complete);
    const started = areas.filter((area) => area.stage > 0 && !area.complete);
    const empty = areas.filter((area) => area.stage === 0);
    const parts = ["Das ist dein Zug."];
    if (done.length) parts.push(`Fertig gebaut und beladen: ${done.map((a) => a.label).join(", ")}.`);
    if (started.length) parts.push(`Angefangen: ${started.map((a) => a.label).join(", ")}.`);
    if (empty.length) parts.push(`Noch nichts gemacht: ${empty.map((a) => a.label).join(", ")}.`);
    parts.push("Tippe auf das grüne Signal rechts, um loszufahren.");
    return parts.join(" ");
  }

  function ariaForArea(area) {
    if (area.complete) return `${area.label}: Wagen fertig gebaut und voll beladen.`;
    if (area.stage === 0) return `${area.label}: hier hast du noch nichts gelöst.`;
    if (area.stage < progress.BUILT_STAGE) return `${area.label}: Wagen wird gebaut, Stufe ${area.stage} von 10.`;
    return `${area.label}: Wagen fertig gebaut, wird beladen, Stufe ${area.stage} von 10.`;
  }

  // ---------------------------------------------------------------------------
  // Zusammensetzen
  // ---------------------------------------------------------------------------
  const gameList = document.querySelector("#game-list");

  function showGameList() {
    if (!gameList) return;
    stage.hidden = true;
    gameList.hidden = false;
    document.body.classList.add("list-open");
    kids()?.setHelp?.("Such dir ein Spiel aus. Mit dem Zurück-Knopf oben kommst du wieder zu deinem Zug.");
    gameList.querySelector(".train-back")?.focus();
  }

  function showTrain() {
    if (gameList) gameList.hidden = true;
    stage.hidden = false;
    document.body.classList.remove("list-open");
    kids()?.setHelp?.(describe(progress.allAreas()));
  }

  function render() {
    const areas = progress.allAreas();
    const loco = readLoco();

    stage.innerHTML = "";
    stage.append(buildScene(SCENES.wiese));

    const band = document.createElement("div");
    band.className = "train-band";

    const svg = art.buildTrain(areas, loco, { pad: 4, gap: 4, trailing: 116, startLabel: "Losfahren" });
    svg.setAttribute("aria-label", describe(areas));

    // Jeder Wagen und die Lok werden anklickbar. Was beim Klick passiert, kommt
    // in Etappe 5 und 6; hier bekommen sie schon ihre Beschriftung, damit die
    // Bühne von Anfang an bedienbar beschrieben ist.
    svg.querySelectorAll("[data-area]").forEach((node) => {
      const area = areas.find((entry) => entry.id === node.getAttribute("data-area"));
      if (!area) return;
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", ariaForArea(area));
    });
    svg.querySelector("[data-loco]")?.setAttribute("aria-label", "Deine Lokomotive");

    const start = svg.querySelector(".train-start-signal");
    if (start) {
      const go = () => showGameList();
      start.addEventListener("click", go);
      start.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); go(); }
      });
    }

    band.append(svg);
    stage.append(band, buildTopbar());
    kids()?.setHelp?.(describe(areas));
  }

  // Zurück-Knopf in der (vorläufigen) Spielliste.
  if (gameList && !gameList.querySelector(".train-back")) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "train-back";
    back.setAttribute("aria-label", "Zurück zu deinem Zug");
    back.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    back.addEventListener("click", showTrain);
    gameList.prepend(back);
  }

  render();
  showTrain();

  // Kommt das Kind aus einem Spiel zurück, kann sich der Fortschritt geändert
  // haben. Beim Zurückspringen im Verlauf liefert der Browser die Seite aus dem
  // Cache – ohne dieses Neuzeichnen stünde dann der alte Zug da.
  window.addEventListener("pageshow", (event) => { if (event.persisted) render(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
})();
