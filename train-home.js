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
  const SCENE_KEY = "lernapp.train.scene";

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------------
  // Szene
  // ---------------------------------------------------------------------------
  // Die Landschaften stehen in train-scenes.js; hier wird nur gebaut. Bewegt
  // wird der Hintergrund, nicht der Zug – so bleibt die Lok an ihrem Platz und
  // muss nicht bei jedem Bild neu gezeichnet werden.
  const scenes = () => window.LernappScenes || null;
  const LAYER_SPEED = { clouds: 150, far: 96, mid: 54, near: 26 };

  function currentScene() {
    const list = scenes();
    if (!list) return null;
    const saved = recall(SCENE_KEY);
    const scene = list.BY_ID[saved];
    // Eine gewählte Szene kann gesperrt sein, wenn der Fortschritt auf einem
    // anderen Gerät steht. Dann lieber die erste als gar keine.
    if (scene && list.isUnlocked(scene.id, progress.trainProgress().builtWagons)) return scene;
    return list.SCENES[0];
  }

  function buildScene(scene) {
    const wrap = document.createElement("div");
    wrap.className = "scene";
    wrap.dataset.scene = scene.id;
    wrap.style.setProperty("--sky-top", scene.sky[0]);
    wrap.style.setProperty("--sky-bottom", scene.sky[1]);
    wrap.style.setProperty("--ground", scene.ground);
    wrap.style.setProperty("--ground-dark", scene.groundDark);

    const sun = document.createElement("div");
    sun.className = "scene-sun";
    sun.setAttribute("aria-hidden", "true");
    sun.append(el("svg", { viewBox: "0 0 100 100" }, [
      el("circle", { cx: 50, cy: 50, r: 42, fill: scene.light.color, opacity: String(scene.light.glow) }),
      el("circle", { cx: 50, cy: 50, r: 30, fill: scene.light.color }),
    ]));
    wrap.append(sun);

    ["clouds", "far", "mid", "near"].forEach((name) => {
      const bandEl = document.createElement("div");
      bandEl.className = `scene-layer scene-layer-${name}${name === "near" ? " is-front" : ""}`;
      bandEl.style.setProperty("--speed", `${LAYER_SPEED[name]}s`);
      const strip = document.createElement("div");
      strip.className = "scene-strip";
      strip.append(scene.layers[name](), scene.layers[name]());
      bandEl.append(strip);
      wrap.append(bandEl);
    });

    // Vögel gibt es nur, wo sie hingehören.
    if (scene.id !== "nacht") {
      const birds = document.createElement("div");
      birds.className = "scene-birds";
      birds.setAttribute("aria-hidden", "true");
      [1, 2, 3].forEach((i) => {
        const bird = document.createElement("div");
        bird.className = `scene-bird scene-bird-${i}`;
        bird.append(el("svg", { viewBox: "0 0 40 20" }, [
          el("path", { d: "M2 12 q8 -9 16 0 q8 -9 20 -2", fill: "none", stroke: scene.id === "berge" ? "#4a5b6b" : "#5a6b7a", "stroke-width": 2.4, "stroke-linecap": "round" }),
        ]));
        birds.append(bird);
      });
      wrap.append(birds);
    }

    // Ein Tipp auf die Landschaft öffnet die Szenenwahl. Bewusst kein eigener
    // Knopf: auf dem Startbild sollen nur der Zug und die beiden Knöpfe oben
    // rechts stehen.
    wrap.addEventListener("click", (event) => {
      if (view.name !== "home" || busy) return;
      if (event.target.closest(".train-band, .train-topbar, .stage-back")) return;
      showScenePicker();
    });

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

  function recall(key) {
    try { return localStorage.getItem(key); } catch { return null; }
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

  // ---------------------------------------------------------------------------
  // Wagen-Grossansicht
  // ---------------------------------------------------------------------------
  // Der Wagen gross, darunter für jedes Spiel des Bereichs eine Kiste mit einem
  // Band je Welt. Die Bänder füllen sich von unten – ein leeres Band heisst
  // "hier war ich noch nie", ein volles "hier ist alles gelöst". Ganz ohne
  // Wort, und trotzdem genauer als jede Prozentzahl.
  function buildWagonDetail(area) {
    const wrap = document.createElement("div");
    wrap.className = "wagon-detail";

    const top = document.createElement("div");
    top.className = "wagon-hero";
    const wagon = art.buildWagon(area.wagon, area.color, area.stage);
    const heroSvg = el("svg", {
      viewBox: `-6 ${art.GROUND - 130} ${art.WAGON_W + 12} 148`,
      class: "wagon-hero-svg", role: "img", "aria-label": describeArea(area),
    }, [wagon]);
    top.append(heroSvg);
    wrap.append(top);

    const shelf = document.createElement("div");
    shelf.className = "wagon-shelf";

    area.games.forEach((game) => {
      const crate = document.createElement("div");
      crate.className = "wagon-crate";
      crate.setAttribute("role", "img");
      crate.setAttribute("aria-label", describeGame(game));

      // Das Gebäude des Spiels als Deckel der Kiste: so ist die Verbindung zur
      // Gebäudewahl sofort da, ohne dass irgendwo ein Name stehen muss.
      const icon = art.buildBuilding(game.id, { label: game.title });
      icon.removeAttribute("role");
      icon.removeAttribute("tabindex");
      icon.classList.remove("train-building");
      const iconSvg = el("svg", {
        viewBox: `0 ${art.GROUND - 176} ${art.BUILD_W} 180`,
        class: "crate-icon", "aria-hidden": "true",
      }, [icon]);
      crate.append(iconSvg);

      const bands = document.createElement("div");
      bands.className = "crate-bands";
      // Von oben nach unten: die schwerste Welt oben, die leichteste unten –
      // dann wächst der Stapel von unten nach oben mit.
      [...game.worlds].reverse().forEach((world) => {
        const band = document.createElement("div");
        band.className = "crate-band";
        const fill = document.createElement("span");
        fill.className = "crate-fill";
        fill.style.width = `${Math.round(world.ratio * 100)}%`;
        fill.style.background = area.color;
        if (world.ratio >= 1) band.classList.add("is-full");
        band.append(fill);
        bands.append(band);
      });
      crate.append(bands);
      shelf.append(crate);
    });

    wrap.append(shelf);
    return wrap;
  }

  // ---------------------------------------------------------------------------
  // Szenenwahl
  // ---------------------------------------------------------------------------
  // Kleine Vorschaubilder derselben Landschaften. Gesperrte Szenen sind blass
  // und tragen ein Schloss – ein Zeichen, kein Text.
  function sceneThumb(scene) {
    const list = scenes();
    return el("svg", { viewBox: `0 0 ${list.TW} ${list.TH}`, class: "scene-thumb-art", "aria-hidden": "true" }, [
      el("defs", {}, [
        el("linearGradient", { id: `sky-${scene.id}`, x1: "0", y1: "0", x2: "0", y2: "1" }, [
          el("stop", { offset: "0", "stop-color": scene.sky[0] }),
          el("stop", { offset: "1", "stop-color": scene.sky[1] }),
        ]),
      ]),
      el("rect", { x: 0, y: 0, width: list.TW, height: list.TH, fill: `url(#sky-${scene.id})` }),
      el("circle", { cx: 98, cy: 16, r: 8, fill: scene.light.color }),
      ...scene.thumb(),
    ]);
  }

  function showScenePicker() {
    const list = scenes();
    if (!list) return;
    const built = progress.trainProgress().builtWagons;
    const active = currentScene()?.id;

    const overlay = document.createElement("div");
    overlay.className = "scene-picker";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Landschaft auswählen");

    const row = document.createElement("div");
    row.className = "scene-row";
    list.SCENES.forEach((scene) => {
      const unlocked = list.isUnlocked(scene.id, built);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `scene-choice${unlocked ? "" : " is-locked"}${scene.id === active ? " is-current" : ""}`;
      button.disabled = !unlocked;
      button.setAttribute("aria-label", unlocked
        ? `Landschaft ${scene.label}${scene.id === active ? ", ausgewählt" : ""}`
        : `Landschaft ${scene.label}, noch gesperrt. Baue einen Wagen fertig, um sie freizuschalten.`);
      button.append(sceneThumb(scene));
      if (!unlocked) {
        button.append(el("svg", { viewBox: "0 0 24 24", class: "scene-lock", "aria-hidden": "true" }, [
          el("path", { d: "M7 11V8a5 5 0 0 1 10 0v3", fill: "none", stroke: "currentColor", "stroke-width": 2.4, "stroke-linecap": "round" }),
          el("rect", { x: 5, y: 11, width: 14, height: 10, rx: 3, fill: "currentColor" }),
        ]));
      }
      button.addEventListener("click", () => {
        remember(SCENE_KEY, scene.id);
        overlay.remove();
        render();
      });
      row.append(button);
    });

    const close = document.createElement("button");
    close.type = "button";
    close.className = "scene-close";
    close.setAttribute("aria-label", "Schliessen");
    close.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    close.addEventListener("click", () => overlay.remove());

    overlay.append(row, close);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) overlay.remove(); });
    stage.append(overlay);
    row.querySelector(".scene-choice:not(:disabled)")?.focus();
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
  // Wagen gross ansehen. Wie die Werkstatt eine eigene Bühne, nur ohne Zoom –
  // hier gibt es nichts einzustellen, nur etwas anzuschauen.
  function showWagon(areaId) {
    const area = progress.areaProgress(areaId);
    if (!area) { showHome(); return; }
    setView("wagon", areaId);
    renderLayer(buildWagonDetail(area));
  }

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
    // Die Musik gehört ins Menü. Ausblenden statt abschneiden: ein abrupt
    // endender Ton klingt nach Fehler.
    kids()?.stopMusic?.({ fade: 0.45 });
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
    if (view.name === "wagon") { showHome(); return; }
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
    const scene = currentScene();
    if (scene) stage.append(buildScene(scene));

    const band = document.createElement("div");
    band.className = "train-band";
    const svg = art.buildTrain(areas, loco, { pad: 4, gap: 4, trailing: 116, startLabel: "Losfahren" });
    svg.setAttribute("aria-label", describeTrain(areas));

    svg.querySelectorAll("[data-area]").forEach((node) => {
      const id = node.getAttribute("data-area");
      const area = areas.find((entry) => entry.id === id);
      if (!area) return;
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-label", `${describeArea(area)} Antippen für Einzelheiten.`);
      activate(node, () => { if (view.name === "home" && !busy) showWagon(id); });
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
    else if (previous === "wagon" && previousArea) showWagon(previousArea);
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

  // ---------------------------------------------------------------------------
  // Musik
  // ---------------------------------------------------------------------------
  // Ein Versuch beim Laden – falls der Browser schon Ton erlaubt – und sonst
  // bei der ersten Berührung. Ohne Geste bleibt jeder Browser stumm.
  const wakeMusic = () => kids()?.startMusic?.();
  wakeMusic();
  ["pointerdown", "keydown"].forEach((type) => {
    document.addEventListener(type, wakeMusic, { once: true, passive: true });
  });
  window.addEventListener("pagehide", () => kids()?.stopMusic?.({ fade: 0.2 }));

  // Nach einem Spiel kommt das Kind hierher zurück – der Fortschritt hat sich
  // dann geändert. Beim Zurückspringen im Verlauf liefert der Browser die Seite
  // aus dem Cache; ohne dieses Neuzeichnen stünde der alte Zug da.
  window.addEventListener("pageshow", (event) => { if (event.persisted) render(); });
})();
