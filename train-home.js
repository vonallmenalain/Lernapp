/*
 * train-home.js – Die Bühne: Startbild, Bereichswahl, Gebäudewahl.
 *
 * Drei Ansichten auf einer Seite. Der Zug ist dabei nur einmal da und wandert
 * per CSS-Transform zwischen den Ansichten: gross in der Mitte auf dem
 * Startbild, klein unten links, sobald es in die Bereiche geht. Ein zweiter
 * gezeichneter Zug wäre einfacher, würde aber genau die Bewegung zerstören,
 * um die es geht – das Bild soll sich verkleinern, nicht ausgetauscht werden.
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
  const LAST_AREA_KEY = "lernapp.train.lastArea";

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------------
  // Szene
  // ---------------------------------------------------------------------------
  // Landschaft aus Ebenen, die unterschiedlich schnell vorbeiziehen. Bewegt wird
  // der Hintergrund, nicht der Zug – so bleibt die Lok an ihrem Platz und muss
  // nicht bei jedem Bild neu gezeichnet werden. Die Kacheln sind so gebaut, dass
  // linke und rechte Kante gleich aussehen; nur dann läuft die Schleife ohne
  // sichtbaren Sprung.
  const TILE_W = 600;
  const TILE_H = 200;

  function tile(children) {
    return el("svg", { viewBox: `0 0 ${TILE_W} ${TILE_H}`, preserveAspectRatio: "none", "aria-hidden": "true" }, children);
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
    return el("path", { d: `M${x} ${y} q3 -${height / 2} 1 -${height}`, fill: "none", stroke: color, "stroke-width": 3, "stroke-linecap": "round" });
  }

  const SCENE = {
    sky: ["#a8ddf0", "#dff1f7"],
    ground: "#8fc45e",
    groundDark: "#6da645",
    sun: "#ffd166",
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
  };

  function buildScene() {
    const wrap = document.createElement("div");
    wrap.className = "scene";
    wrap.style.setProperty("--sky-top", SCENE.sky[0]);
    wrap.style.setProperty("--sky-bottom", SCENE.sky[1]);
    wrap.style.setProperty("--ground", SCENE.ground);
    wrap.style.setProperty("--ground-dark", SCENE.groundDark);

    const sun = document.createElement("div");
    sun.className = "scene-sun";
    sun.setAttribute("aria-hidden", "true");
    sun.append(el("svg", { viewBox: "0 0 100 100" }, [
      el("circle", { cx: 50, cy: 50, r: 42, fill: SCENE.sun, opacity: "0.35" }),
      el("circle", { cx: 50, cy: 50, r: 30, fill: SCENE.sun }),
    ]));
    wrap.append(sun);

    SCENE.layers.forEach((layer) => {
      const bandEl = document.createElement("div");
      bandEl.className = `scene-layer scene-layer-${layer.name}${layer.front ? " is-front" : ""}`;
      bandEl.style.setProperty("--speed", `${layer.speed}s`);
      const strip = document.createElement("div");
      strip.className = "scene-strip";
      strip.append(layer.build(), layer.build());
      bandEl.append(strip);
      wrap.append(bandEl);
    });

    const birds = document.createElement("div");
    birds.className = "scene-birds";
    birds.setAttribute("aria-hidden", "true");
    [1, 2, 3].forEach((i) => {
      const bird = document.createElement("div");
      bird.className = `scene-bird scene-bird-${i}`;
      bird.append(el("svg", { viewBox: "0 0 40 20" }, [
        el("path", { d: "M2 12 q8 -9 16 0 q8 -9 20 -2", fill: "none", stroke: "#5a6b7a", "stroke-width": 2.4, "stroke-linecap": "round" }),
      ]));
      birds.append(bird);
    });
    wrap.append(birds);
    return wrap;
  }

  // ---------------------------------------------------------------------------
  // Speicher
  // ---------------------------------------------------------------------------
  function readLoco() {
    try {
      const raw = localStorage.getItem(LOCO_KEY);
      return raw ? { ...art.DEFAULT_LOCO, ...JSON.parse(raw) } : { ...art.DEFAULT_LOCO };
    } catch { return { ...art.DEFAULT_LOCO }; }
  }

  function remember(key, value) {
    try { localStorage.setItem(key, value); } catch { /* privater Modus */ }
  }

  let locoConfig = null;
  function saveLoco(config) {
    locoConfig = config;
    remember(LOCO_KEY, JSON.stringify(config));
  }

  // ---------------------------------------------------------------------------
  // Beschriftungen
  // ---------------------------------------------------------------------------
  // Auf dem Bild steht kein Wort. Beschriftet ist trotzdem alles: nur so bleibt
  // die Bühne für ein Kind bedienbar, das nicht sieht.
  function describeTrain(areas) {
    const done = areas.filter((a) => a.complete);
    const started = areas.filter((a) => a.stage > 0 && !a.complete);
    const empty = areas.filter((a) => a.stage === 0);
    const parts = ["Dein Zug."];
    if (done.length) parts.push(`Fertig: ${done.map((a) => a.label).join(", ")}.`);
    if (started.length) parts.push(`Angefangen: ${started.map((a) => a.label).join(", ")}.`);
    if (empty.length) parts.push(`Noch nichts gemacht: ${empty.map((a) => a.label).join(", ")}.`);
    return parts.join(" ");
  }

  function describeArea(area) {
    if (area.complete) return `${area.label}: Wagen fertig gebaut und voll beladen.`;
    if (area.stage === 0) return `${area.label}: hier hast du noch nichts gelöst.`;
    if (area.stage < progress.BUILT_STAGE) return `${area.label}: Wagen wird gebaut, Stufe ${area.stage} von 10.`;
    return `${area.label}: Wagen fertig gebaut, wird beladen, Stufe ${area.stage} von 10.`;
  }

  function describeGame(game) {
    if (!game.total) return game.title;
    if (game.solved === 0) return `${game.title}: noch kein Level gelöst.`;
    if (game.solved === game.total) return `${game.title}: alle ${game.total} Level gelöst.`;
    return `${game.title}: ${game.solved} von ${game.total} Leveln gelöst.`;
  }

  // ---------------------------------------------------------------------------
  // Bühnenteile
  // ---------------------------------------------------------------------------
  const LAYER_W = 1200;
  const LAYER_H = 620;

  function layerSvg(children, label) {
    return el("svg", {
      class: "stage-svg",
      viewBox: `0 0 ${LAYER_W} ${LAYER_H}`,
      preserveAspectRatio: "xMidYMid meet",
      role: "group",
      "aria-label": label,
    }, children);
  }

  // Fünf Tore nebeneinander, davor ein Gleisfächer aus der Ecke, in der der Zug
  // steht. Der Fächer ist das, was "in fünf Richtungen fahren" zeigt – fünf
  // Tore allein sähen aus wie eine Liste.
  function buildAreasLayer(areas) {
    const gateScale = 0.86;
    const gateW = art.GATE_W * gateScale;
    const gap = (LAYER_W - 2 * 40 - 5 * gateW) / 4;
    const gateY = 62;
    const footY = gateY + art.GATE_H * gateScale;
    // Der Zug steht unten links und die Lok an seinem rechten Ende; von dort
    // gehen die Gleise weg. Der Wert ist auf die verkleinerte Lok abgestimmt.
    const originX = 452;
    const originY = LAYER_H + 6;

    const rails = [];
    const gates = [];

    areas.forEach((area, index) => {
      const x = 40 + index * (gateW + gap);
      const centre = x + gateW / 2;

      // Ein Gleis je Tor, aus derselben Ecke. Zwei Schienenstränge plus
      // Schwellen wären bei dieser Grösse Matsch – eine kräftige Linie mit
      // heller Innenlinie liest sich besser.
      const d = `M${originX} ${originY} C${originX + 10} ${originY - 200}, ${centre} ${footY + 250}, ${centre} ${footY}`;
      rails.push(el("path", { d, fill: "none", stroke: "#8c93a1", "stroke-width": 15, "stroke-linecap": "round", opacity: "0.9" }));
      rails.push(el("path", { d, fill: "none", stroke: "#dfe4ec", "stroke-width": 5, "stroke-linecap": "round" }));

      const gate = art.buildGate(area, { label: describeArea(area) });
      gates.push(group({ transform: `translate(${x},${gateY}) scale(${gateScale})` }, [gate]));
    });

    return layerSvg([group({ "aria-hidden": "true" }, rails), ...gates], "Wohin soll der Zug fahren?");
  }

  // Die Gebäude eines Bereichs, aufgereiht an einem Gleis. Ein Motiv je Spiel.
  function buildGamesLayer(area) {
    const games = area.games;
    const scale = games.length > 4 ? 0.8 : 1;
    const w = art.BUILD_W * scale;
    const gap = games.length > 2 ? 52 : 120;
    const span = games.length * w + (games.length - 1) * gap;
    const startX = (LAYER_W - span) / 2;
    const baseY = LAYER_H - 118;
    const groundOffset = baseY - art.GROUND * scale;

    const rail = [
      el("rect", { class: "stage-rail", x: 0, y: baseY + 4, width: LAYER_W, height: 9, rx: 4, fill: "#8c93a1" }),
      el("rect", { x: 0, y: baseY + 13, width: LAYER_W, height: 5, fill: "#6a7180", opacity: "0.7" }),
    ];
    for (let x = 12; x < LAYER_W; x += 46) {
      rail.push(el("rect", { x, y: baseY + 18, width: 8, height: 15, rx: 3, fill: "#7b5c3a", opacity: "0.5" }));
    }

    const houses = games.map((game, index) => {
      const x = startX + index * (w + gap);
      const node = art.buildBuilding(game.id, {
        done: game.total > 0 && game.solved === game.total,
        label: describeGame(game),
      });
      node.dataset.page = game.page;
      return group({ transform: `translate(${x},${groundOffset}) scale(${scale})` }, [node]);
    });

    return layerSvg([group({ "aria-hidden": "true" }, rail), ...houses], `Spiele im Bereich ${area.label}`);
  }

  // Der Zug und die Gebäude sollen auf einem Gleis stehen. Beide liegen in
  // eigenen Koordinatensystemen, die je nach Bildschirmverhältnis anders
  // skaliert werden – der Versatz lässt sich deshalb nicht ausrechnen, sondern
  // nur messen. Das Ergebnis geht als Pixelwert ins CSS.
  function alignTrainToRail() {
    const rail = layerHost?.querySelector(".stage-rail");
    const track = stage.querySelector(".train-track rect");
    if (!rail || !track) {
      stage.style.removeProperty("--train-lift");
      return;
    }
    const lift = rail.getBoundingClientRect().top - track.getBoundingClientRect().top;
    stage.style.setProperty("--train-lift", `${Math.round(lift)}px`);
  }

  // ---------------------------------------------------------------------------
  // Lok-Werkstatt
  // ---------------------------------------------------------------------------
  // Die Lok allein, gross. Ein Tipp auf ein Bauteil fährt die Kamera darauf zu
  // und blendet darunter die Varianten ein. Gezoomt wird nicht der Ausschnitt
  // des SVG – das liesse sich nicht weich überblenden –, sondern eine Gruppe
  // darin: eine Transformation, die der Browser flüssig animieren kann.
  // Der Ausschnitt des SVG wird auf das Seitenverhältnis der Bühne gezogen –
  // sonst bliebe rechts und links Platz ungenutzt und ein breites Bauteil wie
  // die Räder würde kaum grösser. Gezoomt wird danach die Gruppe darin.
  function applyCamera(svg, camera, part) {
    const rect = svg.getBoundingClientRect();
    const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 1.6;
    const vh = art.ART_H;
    const vw = Math.max(art.LOCO_W, vh * aspect);
    svg.setAttribute("viewBox", `0 0 ${vw.toFixed(1)} ${vh}`);

    const box = art.PART_FOCUS[part] || art.PART_FOCUS.whole;
    const scale = Math.min(vw / box.width, vh / box.height);
    const x = vw / 2 - scale * (box.x + box.width / 2);
    const y = vh / 2 - scale * (box.y + box.height / 2);
    camera.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(3)})`;
  }

  // Kleine Vorschau eines Bauteils: dieselbe Lok, nur auf das Teil beschnitten.
  // So sieht das Kind jede Variante genau so, wie sie an der Lok aussehen wird.
  function partPreview(part, config) {
    const box = art.PART_PREVIEW[part] || art.PART_FOCUS[part] || art.PART_FOCUS.whole;
    return el("svg", {
      viewBox: `${box.x} ${box.y} ${box.width} ${box.height}`,
      class: "part-preview", "aria-hidden": "true",
    }, [art.buildLoco(config)]);
  }

  // Eine Variante ändert immer nur ihr eigenes Bauteil.
  function withVariant(config, part, kind, value) {
    const next = { ...config };
    if (part === "driver") next.driver = value;
    else if (part === "body") next.body = value;
    else if (part === "whistle") next.whistle = value;
    else next[part] = { ...config[part], [kind]: value };
    return next;
  }

  // Welche Varianten ein Bauteil hat. Formen und Farben stehen getrennt, damit
  // das Kind nicht in einer Liste aus dreissig Kombinationen sucht.
  function variantsFor(part) {
    const spec = art.LOCO_PARTS.find((entry) => entry.id === part);
    if (!spec) return [];
    if (spec.kind === "driver") return [{ kind: "driver", values: spec.options }];
    if (spec.kind === "color") return [{ kind: "body", values: spec.options }];
    if (spec.kind === "sound") return [{ kind: "whistle", values: spec.options }];
    const colorKey = spec.colorKey || "color";
    return [
      { kind: "shape", values: spec.shapes },
      { kind: colorKey, values: spec.options },
    ];
  }

  function buildWorkshop(config, part) {
    const wrap = document.createElement("div");
    wrap.className = "loco-workshop";

    const stageBox = document.createElement("div");
    stageBox.className = "loco-view";
    const svg = el("svg", {
      viewBox: `0 0 ${art.LOCO_W} ${art.ART_H}`,
      class: "loco-svg",
      role: "group",
      "aria-label": part === "whole" ? "Deine Lokomotive. Tippe auf ein Teil, um es zu ändern." : `${art.LOCO_PARTS.find((e) => e.id === part)?.label || part} ändern`,
    });
    const camera = el("g", { class: "loco-camera" }, [art.buildLoco(config)]);
    svg.append(camera);
    stageBox.append(svg);
    // Erst wenn das SVG hängt, steht seine Grösse fest.
    window.requestAnimationFrame(() => applyCamera(svg, camera, part));

    // Nur in der Gesamtansicht sind die Bauteile anzutippen; im Zoom wählt man
    // unten aus, statt versehentlich in ein anderes Teil zu springen.
    //
    // Angetippt werden eigene Felder, nicht die Zeichnungen: die überlappen
    // sich, und ein Tipp auf die Mitte des Führerhauses träfe immer das Tier
    // darin. Ein schwacher Rahmen zeigt die Felder dauerhaft – sonst wüsste
    // ein Kind nicht, dass an der Lok überhaupt etwas zu holen ist.
    if (part === "whole") {
      const hotspots = el("g", { class: "loco-hotspots" });
      art.LOCO_PARTS.forEach((spec) => {
        const box = art.PART_HIT[spec.id];
        if (!box) return;
        // Ein kleiner Punkt statt eines Rahmens: acht gestrichelte Kästen über
        // der Lok sehen aus wie ein Bauplan und verdecken die Zeichnung. Der
        // Punkt sagt dasselbe und lässt die Lok Lok bleiben.
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const hot = el("g", {
          class: "loco-hotspot", "data-hot": spec.id,
          role: "button", tabindex: "0", "aria-label": `${spec.label} ändern`,
        }, [
          el("rect", { ...box, rx: 7, fill: "transparent", class: "loco-hotspot-hit" }),
          el("circle", { cx, cy, r: 8, class: "loco-hotspot-halo", fill: "#ffffff", opacity: "0.35" }),
          el("circle", { cx, cy, r: 5, class: "loco-hotspot-dot", fill: "#ffffff", stroke: "#6c5ce7", "stroke-width": 2 }),
        ]);
        activate(hot, () => showWorkshop(spec.id));
        hotspots.append(hot);
      });
      camera.append(hotspots);
    }

    wrap.append(stageBox);

    const rows = document.createElement("div");
    rows.className = "loco-choices";
    if (part !== "whole") {
      variantsFor(part).forEach((row) => {
        const strip = document.createElement("div");
        strip.className = "loco-row";
        row.values.forEach((value) => {
          const choice = withVariant(config, part, row.kind, value);
          const button = document.createElement("button");
          button.type = "button";
          button.className = "loco-choice";
          const current = row.kind === "driver" ? config.driver
            : row.kind === "body" ? config.body
            : row.kind === "whistle" ? config.whistle
            : config[part]?.[row.kind];
          if (current === value) button.classList.add("is-current");
          button.setAttribute("aria-label", `${art.LOCO_PARTS.find((e) => e.id === part)?.label}: Auswahl ${value}`);
          button.setAttribute("aria-pressed", current === value ? "true" : "false");
          button.append(partPreview(part, choice));
          button.addEventListener("click", () => {
            saveLoco(choice);
            if (part === "whistle") kids()?.playWhistle?.(value);
            showWorkshop(part);
          });
          strip.append(button);
        });
        rows.append(strip);
      });
    }
    wrap.append(rows);
    return wrap;
  }

  function buildTopbar() {
    const bar = document.createElement("div");
    bar.className = "train-topbar";
    const profile = document.createElement("button");
    profile.type = "button";
    profile.className = "train-profile";
    profile.setAttribute("aria-label", "Profil ändern");
    profile.innerHTML = `<span aria-hidden="true">${kids()?.getProfile?.()?.avatar || "🙂"}</span>`;
    profile.addEventListener("click", () => home()?.showProfileSetup?.());
    bar.append(profile);
    return bar;
  }

  function buildBackButton() {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "stage-back";
    back.setAttribute("aria-label", "Zurück");
    back.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    back.addEventListener("click", goBack);
    return back;
  }

  // ---------------------------------------------------------------------------
  // Ansichten
  // ---------------------------------------------------------------------------
  const view = { name: "home", areaId: null, part: "whole" };
  let layerHost = null;
  let backButton = null;
  let busy = false;

  function setView(name, areaId = null) {
    view.name = name;
    view.areaId = areaId;
    stage.dataset.view = name;
    if (backButton) backButton.hidden = name === "home";
    if (areaId) remember(LAST_AREA_KEY, areaId);
  }

  // Werkstatt: die Lok allein. part === "whole" zeigt sie ganz, sonst ist auf
  // ein Bauteil gezoomt.
  function showWorkshop(part = "whole") {
    view.part = part;
    setView("loco");
    renderLayer(buildWorkshop(locoConfig, part));
  }

  // Wartet, bis die Fahranimation durch ist. Ohne Bewegung wird nicht gewartet:
  // dann soll der Wechsel sofort passieren, nicht künstlich verzögert.
  function after(ms) {
    return new Promise((resolve) => { window.setTimeout(resolve, reduced() ? 0 : ms); });
  }

  function renderLayer(node) {
    layerHost.innerHTML = "";
    if (node) layerHost.append(node);
  }

  // Klick und Tastatur an einem SVG-Element: <g> ist kein Knopf, also muss
  // beides von Hand angebunden werden.
  function activate(node, action) {
    node.addEventListener("click", action);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
    });
  }

  function showHome() {
    setView("home");
    stage.style.removeProperty("--train-lift");
    renderLayer(null);
  }

  function showAreas() {
    setView("areas");
    stage.style.removeProperty("--train-lift");
    const layer = buildAreasLayer(progress.allAreas());
    layer.querySelectorAll("[data-gate]").forEach((gate) => {
      const id = gate.getAttribute("data-gate");
      activate(gate, () => enterArea(id));
    });
    renderLayer(layer);
  }

  function showGames(areaId) {
    const area = progress.areaProgress(areaId);
    if (!area) { showAreas(); return; }
    setView("games", areaId);
    const layer = buildGamesLayer(area);
    layer.querySelectorAll("[data-building]").forEach((house) => {
      activate(house, () => enterGame(house.dataset.page));
    });
    renderLayer(layer);
    // Erst nach dem Einhängen steht die Grösse fest.
    window.requestAnimationFrame(alignTrainToRail);
  }

  // ---------------------------------------------------------------------------
  // Fahrten
  // ---------------------------------------------------------------------------
  async function start() {
    if (busy || view.name !== "home") return;
    busy = true;
    showAreas();          // der Zug schrumpft und rückt nach links (CSS)
    await after(760);
    busy = false;
  }

  async function enterArea(areaId) {
    if (busy) return;
    busy = true;
    // Der Zug fährt nach rechts aus dem Bild, dann kommt er im Bereich von
    // links wieder herein. Dazwischen wechselt die Kulisse.
    stage.dataset.moving = "out";
    await after(620);
    showGames(areaId);
    stage.dataset.moving = "in";
    await after(40);
    delete stage.dataset.moving;
    await after(620);
    busy = false;
  }

  async function enterGame(page) {
    if (busy || !page) return;
    busy = true;
    stage.dataset.moving = "out";
    await after(560);
    window.location.href = page;
  }

  async function goBack() {
    if (busy) return;
    if (view.name === "games") {
      busy = true;
      stage.dataset.moving = "in";
      await after(40);
      showAreas();
      delete stage.dataset.moving;
      await after(560);
      busy = false;
      return;
    }
    if (view.name === "areas") { showHome(); return; }
    if (view.name === "loco") {
      // Erst aus dem Bauteil heraus zur ganzen Lok, dann zum Zug. Zwei Stufen
      // zurück auf einmal wäre für ein Kind ein Sprung ins Nichts.
      if (view.part !== "whole") { showWorkshop("whole"); return; }
      // Zurück zum Zug heisst neu zeichnen: die Lok am Zug muss zeigen, was in
      // der Werkstatt gebaut wurde.
      view.part = "whole";
      view.name = "home";
      render();
    }
  }

  // ---------------------------------------------------------------------------
  // Aufbau
  // ---------------------------------------------------------------------------
  function render() {
    const areas = progress.allAreas();
    if (!locoConfig) locoConfig = readLoco();
    const loco = locoConfig;
    const previous = view.name;
    const previousArea = view.areaId;

    stage.innerHTML = "";
    stage.append(buildScene());

    const band = document.createElement("div");
    band.className = "train-band";
    const svg = art.buildTrain(areas, loco, { pad: 4, gap: 4, trailing: 116, startLabel: "Losfahren" });
    svg.setAttribute("aria-label", describeTrain(areas));

    svg.querySelectorAll("[data-area]").forEach((node) => {
      const area = areas.find((entry) => entry.id === node.getAttribute("data-area"));
      if (!area) return;
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", describeArea(area));
    });
    svg.querySelector("[data-loco]")?.setAttribute("aria-label", "Deine Lokomotive");

    const signal = svg.querySelector(".train-start-signal");
    if (signal) activate(signal, start);

    // Ein Tipp auf die Lok führt in die Werkstatt – aber nur vom Startbild aus.
    const locoNode = svg.querySelector("[data-loco]");
    if (locoNode) {
      locoNode.setAttribute("role", "button");
      locoNode.setAttribute("tabindex", "0");
      locoNode.setAttribute("aria-label", "Deine Lokomotive umbauen");
      activate(locoNode, () => { if (view.name === "home" && !busy) showWorkshop("whole"); });
    }

    band.append(svg);

    layerHost = document.createElement("div");
    layerHost.className = "stage-layer";

    backButton = buildBackButton();
    backButton.hidden = true;

    stage.append(band, layerHost, buildTopbar(), backButton);

    if (previous === "games" && previousArea) showGames(previousArea);
    else if (previous === "areas") showAreas();
    else if (previous === "loco") showWorkshop(view.part);
    else showHome();
  }

  render();

  // Beim allerersten Start fragt die App, wer spielt. Das hing bisher an der
  // Spielliste in index.html; die gibt es nicht mehr, also fragt der Zug.
  if (!home()?.hasProfile?.()) home()?.showProfileSetup?.();

  window.addEventListener("resize", () => {
    if (view.name === "games") window.requestAnimationFrame(alignTrainToRail);
    if (view.name === "loco") {
      const svg = stage.querySelector(".loco-svg");
      const camera = stage.querySelector(".loco-camera");
      if (svg && camera) window.requestAnimationFrame(() => applyCamera(svg, camera, view.part));
    }
  });

  // Nach einem Spiel kommt das Kind hierher zurück – der Fortschritt hat sich
  // dann geändert. Beim Zurückspringen im Verlauf liefert der Browser die Seite
  // aus dem Cache; ohne dieses Neuzeichnen stünde der alte Zug da.
  window.addEventListener("pageshow", (event) => { if (event.persisted) render(); });
})();
