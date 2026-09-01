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
  const { el, group, shade } = art;

  const LOCO_KEY = "lernapp.train.loco";
  const LAST_AREA_KEY = "lernapp.train.lastArea";
  const SCENE_KEY = "lernapp.train.scene";
  const SAVED_AT_KEY = "lernapp.train.savedAt";

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------------
  // Szene
  // ---------------------------------------------------------------------------
  // Die Landschaften stehen in train-scenes.js; hier wird nur gebaut. Bewegt
  // wird der Hintergrund, nicht der Zug – so bleibt die Lok an ihrem Platz und
  // muss nicht bei jedem Bild neu gezeichnet werden.
  const scenes = () => window.LernappScenes || null;
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

  // Gebaut wird die Landschaft in train-scenes.js – die Spielseiten brauchen
  // dieselbe, und zwei Kopien derselben Ebenen gingen beim nächsten Umbau
  // auseinander.
  const buildScene = (scene) => scenes().buildScene(scene);

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

  // ---------------------------------------------------------------------------
  // Lok und Landschaft in der Cloud
  // ---------------------------------------------------------------------------
  // Gespeichert wird immer zuerst auf dem Gerät: die Lok muss auch dann stehen,
  // wenn niemand angemeldet ist oder das Netz weg ist. Angemeldet geht dieselbe
  // Fassung zusätzlich nach Firestore, an dasselbe Dokument wie der
  // Fortschritt. Wer neuer ist, entscheidet der Zeitstempel.
  const cloud = () => window.LernappFirebase || null;

  let locoConfig = null;

  function localSavedAt() {
    return Number(recall(SAVED_AT_KEY)) || 0;
  }

  function localSettings(at = localSavedAt()) {
    return { loco: locoConfig || readLoco(), scene: recall(SCENE_KEY) || null, updatedAt: at };
  }

  // Speichert eine Änderung des Kindes: lokal, mit frischem Zeitstempel, und
  // von dort weiter in die Cloud.
  function saveSettings(changes) {
    const at = Date.now();
    if (changes.loco) {
      locoConfig = changes.loco;
      remember(LOCO_KEY, JSON.stringify(changes.loco));
    }
    if (changes.scene) remember(SCENE_KEY, changes.scene);
    remember(SAVED_AT_KEY, String(at));
    cloud()?.saveTrainSettings?.(localSettings(at));
  }

  function saveLoco(config) { saveSettings({ loco: config }); }
  function saveScene(sceneId) { saveSettings({ scene: sceneId }); }

  // Was aus der Cloud kommt, gilt nur, wenn es neuer ist als das, was hier
  // steht. Ist das Gerät neuer – etwa weil das Kind vor dem Anmelden gebaut
  // hat –, wandert die hiesige Fassung nach oben.
  let pendingCloud = null;

  function applyCloudSettings(settings) {
    if (!settings) return;
    const localAt = localSavedAt();
    if (!(settings.updatedAt > localAt)) {
      if (localAt > (settings.updatedAt || 0)) cloud()?.saveTrainSettings?.(localSettings());
      return;
    }
    // Mitten im Umbauen darf die Lok nicht unter den Händen wechseln.
    if (view.name === "loco") { pendingCloud = settings; return; }

    if (settings.loco) {
      locoConfig = { ...art.DEFAULT_LOCO, ...settings.loco };
      remember(LOCO_KEY, JSON.stringify(settings.loco));
    }
    if (settings.scene) remember(SCENE_KEY, settings.scene);
    remember(SAVED_AT_KEY, String(settings.updatedAt));
    render();
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
  // Auf welcher Höhe die Schienenoberkante liegt. Für alle Ansichten dieselbe:
  // so steht der Zug überall gleich hoch und muss beim Wechsel nicht springen.
  const RAIL_Y = 512;
  // Wie weit das Gleis über den Bildrand hinausgezeichnet wird. Der Ausschnitt
  // des SVG wird eingepasst, nicht beschnitten – bei einem sehr breiten Fenster
  // bliebe sonst links und rechts ein Stück Gleis fehlend.
  const RAIL_BLEED = 400;

  // Ein Stück Gleis. Es liegt fest im Bild und nicht mehr am Zug: nur so fährt
  // der Zug wirklich, statt sein Gleis mitzunehmen.
  function stageRail(y = RAIL_Y, from = -RAIL_BLEED, to = LAYER_W + RAIL_BLEED) {
    const parts = [];
    for (let x = from; x < to; x += 46) {
      parts.push(el("rect", { x, y: y + 14, width: 8, height: 15, rx: 3, fill: "#7b5c3a", opacity: "0.5" }));
    }
    parts.push(el("rect", { class: "stage-rail", x: from, y, width: to - from, height: 9, rx: 4, fill: "#8c93a1" }));
    parts.push(el("rect", { x: from, y: y + 9, width: to - from, height: 5, fill: "#6a7180", opacity: "0.7" }));
    return group({ class: "stage-track", "aria-hidden": "true" }, parts);
  }

  // Ein abzweigendes Gleis. Zwei Stücke: eine kurze Weiche, die waagrecht aus
  // der Hauptstrecke herausführt, und danach eine schnurgerade Rampe zum Tor.
  //
  // Die Gerade ist kein Schönheitsentscheid. Der Zug fährt später auf diesem
  // Gleis, und er kann sich nur geradlinig verschieben. Auf einer durchgehenden
  // Kurve schnitte er die Ecke und schwebte in der Mitte über den Schienen.
  // Mit Weiche und Gerade fährt er erst waagrecht bis zur Weiche und dann die
  // Rampe hinauf – auf dem Gleis, so wie es eine echte Lok täte.
  const SWITCH_RUN = 88;

  function branchGeometry(switchX, endX, endY) {
    // Wo die Weiche endet und die Gerade anfängt: auf der Verbindung vom Ende
    // der Weiche zum Tor, ein Stück weit hinein. So geht die Kurve ohne Knick
    // in die Gerade über.
    const fromX = switchX + SWITCH_RUN;
    const t = 0.22;
    return {
      fromX,
      beginX: fromX + (endX - fromX) * t,
      beginY: RAIL_Y + (endY - RAIL_Y) * t,
    };
  }

  function branchRail(switchX, endX, endY) {
    const g = branchGeometry(switchX, endX, endY);
    const d = "M" + switchX + " " + RAIL_Y
      + " Q" + g.fromX + " " + RAIL_Y + " " + g.beginX + " " + g.beginY
      + " L" + endX + " " + endY;
    return [
      el("path", { d, fill: "none", stroke: "#7b5c3a", "stroke-width": 17, "stroke-linecap": "round", opacity: "0.4" }),
      el("path", { d, fill: "none", stroke: "#8c93a1", "stroke-width": 9, "stroke-linecap": "round" }),
      el("path", { d, fill: "none", stroke: "#dfe4ec", "stroke-width": 3, "stroke-linecap": "round", opacity: "0.85" }),
    ];
  }

  function layerSvg(children, label) {
    return el("svg", {
      class: "stage-svg",
      viewBox: `0 0 ${LAYER_W} ${LAYER_H}`,
      // Unten ausgerichtet: das Gleis gehört an den unteren Bildrand. Mittig
      // eingepasst schwebte es auf einem hohen Bildschirm in der Luft, und
      // darunter bliebe ein leeres Feld.
      preserveAspectRatio: "xMidYMax meet",
      role: "group",
      "aria-label": label,
    }, children);
  }

  // Wo die fünf Tore stehen und wo ihr Gleis endet. Der Zug wartet links auf
  // der Hauptstrecke; von ihr zweigen fünf Gleise ab und steigen gestaffelt
  // nach rechts oben – fünf Stationen einen Hang hinauf. Nebeneinander
  // aufgereiht sähen die Tore aus wie eine Liste, und genau das nicht.
  const GATE_SCALE = 0.78;
  const AREA_STOPS = [
    { x: 412, y: 502 },
    { x: 598, y: 410 },
    { x: 778, y: 318 },
    { x: 946, y: 226 },
    { x: 1098, y: 134 },
  ];

  function areaStop(index) {
    return AREA_STOPS[Math.min(index, AREA_STOPS.length - 1)];
  }

  function buildAreasLayer(areas) {
    const gateW = art.GATE_W * GATE_SCALE;
    const gateH = art.GATE_H * GATE_SCALE;
    const rails = [];
    const gates = [];

    areas.forEach((area, index) => {
      const stop = areaStop(index);
      // Jedes Gleis verlässt die Hauptstrecke an einer eigenen Weiche. Alle aus
      // demselben Punkt hiesse: ein Knoten, aus dem fünf Striche stechen.
      //
      // Das Gleis zum höchsten Tor zweigt zuerst ab, das zum untersten zuletzt.
      // Andersherum müsste jedes höhere Gleis die tieferen kreuzen – wie in
      // einem Bahnhofsvorfeld, in dem die Weichen falsch herum liegen.
      const switchX = 126 + (areas.length - 1 - index) * 56;
      rails.push(...branchRail(switchX, stop.x, stop.y));
      // Unsichtbare Marke am Anfang der Rampe. Der Zug muss wissen, wo er von
      // der Hauptstrecke abbiegt, und ausrechnen lässt sich das nicht: das
      // Bühnen-SVG wird ins Fenster eingepasst, sein Massstab hängt am
      // Seitenverhältnis. Also wird die Stelle gemessen.
      const g = branchGeometry(switchX, stop.x, stop.y);
      rails.push(el("rect", {
        "data-switch": area.id, x: g.beginX - 1, y: g.beginY - 1, width: 2, height: 2, fill: "none",
      }));
      const gate = art.buildGate(area, { label: describeArea(area) });
      gates.push(group({
        "data-stop": area.id,
        transform: "translate(" + (stop.x - gateW / 2) + "," + (stop.y - gateH) + ") scale(" + GATE_SCALE + ")",
      }, [gate]));
    });

    return layerSvg([
      group({ "aria-hidden": "true" }, rails),
      stageRail(),
      ...gates,
    ], "Wohin soll der Zug fahren?");
  }

  // Wohin sich der Zug schieben muss, um in einem Tor zu stehen – in Pixeln.
  // Gemessen statt gerechnet: das Bühnen-SVG wird ins Fenster eingepasst, sein
  // Massstab hängt also vom Seitenverhältnis ab. In der CSS-Regel steht
  // translate() vor scale(), die Verschiebung wird also nicht mitverkleinert –
  // gemessene Bildschirmpixel passen damit unverändert hinein.
  function driveTo(areaId) {
    const gate = layerHost?.querySelector('[data-stop="' + areaId + '"]');
    const mark = layerHost?.querySelector('[data-switch="' + areaId + '"]');
    const loco = stage.querySelector("[data-loco]");
    if (!gate || !mark || !loco) return null;
    const target = gate.getBoundingClientRect();
    const turn = mark.getBoundingClientRect();
    const front = loco.getBoundingClientRect();
    if (!front.width || !target.width) return null;
    const cx = front.left + front.width * 0.5;
    return {
      // Erst waagrecht bis zum Anfang der Rampe …
      turnX: turn.left - cx,
      turnY: turn.top - front.bottom,
      // … dann die Rampe hinauf bis in die Halle.
      x: (target.left + target.width * 0.5) - cx,
      y: (target.bottom - 10) - front.bottom,
    };
  }

  // Die Gebäude eines Bereichs, aufgereiht an einem Gleis. Ein Motiv je Spiel.
  // Links steht der Zug, rechts davon die Häuser. Der Platz dazwischen ist
  // fest: der Zug ist auf dieser Bühne 42 Prozent breit, und Häuser hinter ihm
  // wären halb verdeckt. Passen die Häuser nicht in den Rest, werden sie
  // kleiner – lieber vier kleine Häuser nebeneinander als eins hinter dem Zug.
  const TRAIN_ROOM = 545;

  function buildGamesLayer(area) {
    const games = area.games;
    const gap = games.length > 2 ? 46 : 110;
    const room = LAYER_W - TRAIN_ROOM - 36;
    const full = games.length * art.BUILD_W + (games.length - 1) * gap;
    const scale = Math.min(1, room / full);
    const w = art.BUILD_W * scale;
    const span = games.length * w + (games.length - 1) * gap * scale;
    const startX = TRAIN_ROOM + (room - span) / 2;
    const baseY = RAIL_Y - 4;
    const groundOffset = baseY - art.GROUND * scale;

    const houses = games.map((game, index) => {
      const x = startX + index * (w + gap * scale);
      const node = art.buildBuilding(game.id, {
        done: game.total > 0 && game.solved === game.total,
        label: describeGame(game),
      });
      node.dataset.page = game.page;
      return group({ transform: `translate(${x},${groundOffset}) scale(${scale})` }, [node]);
    });

    return layerSvg([stageRail(), ...houses], `Spiele im Bereich ${area.label}`);
  }

  // Der Zug und die Gebäude sollen auf einem Gleis stehen. Beide liegen in
  // eigenen Koordinatensystemen, die je nach Bildschirmverhältnis anders
  // skaliert werden – der Versatz lässt sich deshalb nicht ausrechnen, sondern
  // nur messen. Das Ergebnis geht als Pixelwert ins CSS.
  function alignTrainToRail() {
    const rail = layerHost?.querySelector(".stage-rail");
    const band = stage.querySelector(".train-band");
    if (!rail || !band || !band.offsetHeight) {
      stage.style.removeProperty("--train-lift");
      positionStart();
      return;
    }
    // Gemessen wird das Band in seiner ungestreckten Lage – offsetTop und
    // offsetHeight kennen keine Transformation. Am Zug selbst zu messen wäre
    // mitten in einer Überblendung die Messung von gestern, und der Wert, den
    // sie ergäbe, verschöbe den Zug beim nächsten Mal noch einmal.
    //
    // Der Drehpunkt des Bandes liegt auf der Schienenoberkante des Zugs, also
    // gilt: Schiene auf dem Bildschirm = ungestreckte Lage plus Ausgleich,
    // unabhängig davon, wie stark gerade verkleinert wird.
    const stageTop = stage.getBoundingClientRect().top;
    const railLine = stageTop + band.offsetTop + band.offsetHeight * (art.GROUND / art.ART_H);
    const lift = rail.getBoundingClientRect().top - railLine;
    stage.style.setProperty("--train-lift", `${Math.round(lift)}px`);
    positionStart();
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
        //
        // Angetippt wird das ganze Feld, der Punkt sitzt aber daneben – in der
        // Mitte läge er beim Chauffeur mitten im Gesicht. Wo kein Ort
        // eingetragen ist, bleibt es bei der Mitte.
        const dot = art.PART_DOT[spec.id] || { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const hot = el("g", {
          class: "loco-hotspot", "data-hot": spec.id,
          role: "button", tabindex: "0", "aria-label": `${spec.label} ändern`,
        }, [
          el("rect", { ...box, rx: 7, fill: "transparent", class: "loco-hotspot-hit" }),
          el("circle", { cx: dot.x, cy: dot.y, r: 5.5, class: "loco-hotspot-halo", fill: "#ffffff", opacity: "0.28" }),
          el("circle", { cx: dot.x, cy: dot.y, r: 3.2, class: "loco-hotspot-dot", fill: "#ffffff", stroke: "#6c5ce7", "stroke-width": 1.4 }),
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
  let thumbUid = 0;
  function sceneThumb(scene) {
    const list = scenes();
    const skyId = `sky-${scene.id}-${thumbUid += 1}`;
    return el("svg", { viewBox: `0 0 ${list.TW} ${list.TH}`, class: "scene-thumb-art", "aria-hidden": "true" }, [
      el("defs", {}, [
        el("linearGradient", { id: skyId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
          el("stop", { offset: "0", "stop-color": scene.sky[0] }),
          el("stop", { offset: "1", "stop-color": scene.sky[1] }),
        ]),
      ]),
      el("rect", { x: 0, y: 0, width: list.TW, height: list.TH, fill: `url(#${skyId})` }),
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
        saveScene(scene.id);
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

  // Oben links, wo früher der Vorlese-Knopf stand. Im Knopf steckt die
  // Landschaft selbst als kleines Bild – wer ihn sieht, weiss ohne ein Wort,
  // worum es geht. Die zwei Pfeile daneben sagen: das lässt sich wechseln.
  function buildSceneButton(scene) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scene-button";
    button.setAttribute("aria-label", `Landschaft wechseln. Jetzt: ${scene.label}.`);

    // Der Ausschnitt sitzt auf dem Horizont: im Vorschaubild ist die obere
    // Hälfte Himmel, und in einem 58-Pixel-Kreis bliebe davon nur ein blasser
    // Fleck. So füllen Hügel, Sonne und Bäume den Knopf.
    const picture = sceneThumb(scene);
    picture.setAttribute("viewBox", "36 8 68 68");
    picture.setAttribute("preserveAspectRatio", "xMidYMid slice");

    const porthole = document.createElement("span");
    porthole.className = "scene-button-view";
    porthole.setAttribute("aria-hidden", "true");
    porthole.append(picture);

    const badge = document.createElement("span");
    badge.className = "scene-button-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.append(el("svg", { viewBox: "0 0 24 24" }, [
      el("path", {
        d: "M4 9h13l-3.2-3.2M20 15H7l3.2 3.2",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 2.6,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ]));

    button.append(porthole, badge);
    button.addEventListener("click", () => { if (!busy) showScenePicker(); });
    return button;
  }


  // Das Startsignal schwebt vor der Lok, statt auf dem Gleis zu stehen. Das
  // Gleis liegt jetzt fest im Bild; ein Signal darauf wäre ein Hindernis, das
  // der Zug beim Losfahren umfahren müsste. Als eigener Knopf lässt es sich
  // ausserdem genau vor die Lok setzen, egal wie breit das Fenster ist.
  function buildStartButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "train-start";
    button.setAttribute("aria-label", "Losfahren");
    button.append(el("svg", { viewBox: "0 0 48 48", "aria-hidden": "true" }, [
      el("circle", { cx: 24, cy: 24, r: 21, class: "train-start-ring", fill: "none", stroke: "#3fbf74", "stroke-width": 4, opacity: "0.5" }),
      el("circle", { cx: 24, cy: 24, r: 18, fill: shade("#3fbf74", -0.35) }),
      el("circle", { cx: 24, cy: 24, r: 15, class: "train-start-lamp", fill: "#3fbf74" }),
      el("polygon", { points: "19,16 33,24 19,32", fill: "#ffffff" }),
    ]));
    button.addEventListener("click", start);
    return button;
  }

  // Setzt den Knopf vor die Lok und knapp über das Gleis. Beides wird gemessen:
  // wie breit der Zug im Bild steht, hängt am Seitenverhältnis des Fensters.
  function positionStart() {
    if (!startButton) return;
    const loco = stage.querySelector("[data-loco]");
    const rail = layerHost?.querySelector(".stage-rail");
    const host = stage.getBoundingClientRect();
    const box = loco?.getBoundingClientRect();
    if (!box?.width || !host.width) return;
    const size = startButton.offsetWidth || 74;
    const gap = Math.min(70, host.width * 0.05);
    const left = Math.min(box.right - host.left + gap, host.width - size - 18);
    const railTop = rail ? rail.getBoundingClientRect().top - host.top : host.height * 0.82;
    startButton.style.left = `${Math.round(left)}px`;
    startButton.style.top = `${Math.round(railTop - size - 16)}px`;
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
  let sceneButton = null;
  let startButton = null;
  let busy = false;

  function setView(name, areaId = null) {
    view.name = name;
    view.areaId = areaId;
    stage.dataset.view = name;
    if (backButton) backButton.hidden = name === "home";
    // Die Landschaft wechselt man auf dem Startbild. Unterwegs wäre der Knopf
    // nur eine zweite Möglichkeit, sich zu verfahren.
    if (sceneButton) sceneButton.hidden = name !== "home";
    if (startButton) startButton.hidden = name !== "home";
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
    renderLayer(layerSvg([stageRail()], "Das Gleis"));
    window.requestAnimationFrame(alignTrainToRail);
  }

  function showAreas() {
    setView("areas");
    const layer = buildAreasLayer(progress.allAreas());
    layer.querySelectorAll("[data-gate]").forEach((gate) => {
      const id = gate.getAttribute("data-gate");
      activate(gate, () => enterArea(id));
    });
    renderLayer(layer);
    window.requestAnimationFrame(alignTrainToRail);
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
  // Das Horn der Dampflok. Es tönt bei jeder Abfahrt: beim Erscheinen, beim
  // Startsignal, vor der Fahrt in einen Bereich und vor dem Spiel. Immer
  // dasselbe Zeichen für dasselbe – "jetzt geht es los".
  function toot(chuffs = 4) {
    kids()?.playHorn?.({ chuffs });
  }

  async function start() {
    if (busy || view.name !== "home") return;
    busy = true;
    toot(5);
    showAreas();          // der Zug schrumpft und rückt nach links (CSS)
    await after(760);
    busy = false;
  }

  // Der Zug fährt auf seinem Gleis zum gewählten Tor und hinein. Danach kommt
  // er im Bereich von links wieder herein. Das Gleis bleibt dabei stehen: es
  // liegt in der Bühnenebene und nicht mehr am Zug.
  async function enterArea(areaId) {
    if (busy) return;
    busy = true;
    toot(6);

    // Zwei Abschnitte, wie eine echte Lok fährt: anrollen bis zur Weiche, dann
    // die Rampe hinauf in die Halle. In einem Zug schnitte der Zug die Ecke und
    // schwebte in der Mitte über den Schienen.
    const to = driveTo(areaId);
    if (to) {
      stage.style.setProperty("--drive-x", `${Math.round(to.turnX)}px`);
      stage.style.setProperty("--drive-y", `${Math.round(to.turnY)}px`);
      stage.dataset.driving = "1";
      await after(520);
      stage.style.setProperty("--drive-x", `${Math.round(to.x)}px`);
      stage.style.setProperty("--drive-y", `${Math.round(to.y)}px`);
      stage.dataset.driving = "2";
      await after(980);
      delete stage.dataset.driving;
      stage.style.removeProperty("--drive-x");
      stage.style.removeProperty("--drive-y");
    } else {
      stage.dataset.moving = "out";
      await after(620);
    }

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
    // Falls die Seite doch nicht wechselt – ein blockierter Link, ein
    // abgebrochener Ladevorgang –, darf die Bühne nicht gesperrt bleiben.
    window.setTimeout(() => { if (busy && view.name === "games") resetStage(); }, 4000);
    // Die Musik gehört ins Menü. Ausblenden statt abschneiden: ein abrupt
    // endender Ton klingt nach Fehler.
    toot(3);
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
    if (pendingCloud && view.name !== "loco") {
      const waiting = pendingCloud;
      pendingCloud = null;
      applyCloudSettings(waiting);
      return;
    }
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
    // Nach jeder Überblendung neu ausrichten. Gemessen wird die Lok, und
    // mitten in der Bewegung steht sie noch halb in der alten Ansicht: der
    // Startknopf landete dann in der Bildmitte hinter den Wagen, wo ihn
    // niemand mehr fand.
    band.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform" && event.target === band) alignTrainToRail();
    });
    // Ohne Gleis: das liegt jetzt fest in der Bühnenebene, damit es beim
    // Losfahren stehen bleibt. Der Nachlauf rechts ist der Platz, auf dem das
    // Startsignal vor der Lok schwebt.
    const svg = art.buildTrain(areas, loco, { pad: 4, gap: 4, trailing: 120, withTrack: false });
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
    sceneButton = scene ? buildSceneButton(scene) : null;
    startButton = buildStartButton();

    stage.append(band, layerHost, backButton, startButton);
    if (sceneButton) stage.append(sceneButton);

    if (previous === "games" && previousArea) showGames(previousArea);
    else if (previous === "areas") showAreas();
    else if (previous === "loco") showWorkshop(view.part);
    else if (previous === "wagon" && previousArea) showWagon(previousArea);
    else showHome();
  }

  render();

  // Die Einfahrt. Zuerst stehen nur Landschaft und Gleis da, dann kommt der Zug
  // von links herein und meldet sich mit dem Horn. Ohne Bewegung entfällt das:
  // wer Animationen abgeschaltet hat, soll den Zug einfach vorfinden.
  function parkOutside() {
    if (reduced()) return false;
    stage.dataset.entering = "1";
    return true;
  }

  function rollIn() {
    if (!parkOutside()) return;
    // Zwei Bilder warten: der Browser muss die Ausgangslage einmal gezeichnet
    // haben, sonst überspringt er die Überblendung und der Zug steht einfach da.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        stage.dataset.entering = "0";
        window.setTimeout(() => toot(4), 780);
        window.setTimeout(() => {
          delete stage.dataset.entering;
          alignTrainToRail();
        }, 1660);
      });
    });
  }

  // Beim allerersten Laden wartet der Zug am linken Rand auf die erste
  // Berührung. Das ist keine Spielerei: ohne eine Geste lässt kein Browser Ton
  // zu, und ein Zug, der stumm einfährt, hat seinen Auftritt verschenkt.
  //
  // Berührt niemand den Bildschirm, fährt er nach ein paar Sekunden trotzdem
  // ein – auf eine leere Wiese zu starren soll niemand müssen.
  function rollInOnFirstTouch() {
    if (!parkOutside()) return;
    let done = false;
    const events = ["pointerdown", "keydown", "touchstart"];
    const go = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      events.forEach((type) => document.removeEventListener(type, go));
      rollIn();
    };
    events.forEach((type) => document.addEventListener(type, go, { passive: true }));
    const timer = window.setTimeout(go, 6000);
  }

  // Aus einem Spiel führt der Zurück-Knopf nicht auf das Startbild, sondern
  // dorthin, wo das Kind hergekommen ist: in die Spielauswahl seines Bereichs.
  // Das Spiel hängt den Bereich an die Adresse; hier wird er eingelöst und die
  // Adresse gleich wieder sauber gemacht, damit ein Neuladen aufs Startbild
  // führt.
  function openRequestedArea() {
    let wanted = null;
    try { wanted = new URLSearchParams(window.location.search).get("bereich"); } catch { wanted = null; }
    if (!wanted || !progress.areaProgress(wanted)) return false;
    try { window.history.replaceState(null, "", window.location.pathname); } catch { /* ohne Verlauf */ }
    showGames(wanted);
    // Der Zug kommt von links hereingefahren, wie sonst auch beim Wechsel in
    // einen Bereich.
    stage.dataset.moving = "in";
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        delete stage.dataset.moving;
        alignTrainToRail();
      });
    });
    return true;
  }

  if (!openRequestedArea()) rollInOnFirstTouch();


  window.addEventListener("resize", () => {
    if (view.name !== "loco" && view.name !== "wagon") window.requestAnimationFrame(alignTrainToRail);
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


  // Die Anmeldung braucht einen Moment. Kommen Lok und Landschaft aus der
  // Cloud, wird der Zug neu gezeichnet – kommt der Fortschritt, ebenso: die
  // Wagen zeigen sonst weiter den Stand dieses Geräts.
  document.addEventListener("lernapp:train-settings", (event) => applyCloudSettings(event.detail));
  document.addEventListener("lernapp:progress-changed", () => render());

  // Falls die Anmeldung ausnahmsweise schon durch ist, bevor diese Seite
  // zuhört: einmal von Hand nachfragen.
  applyCloudSettings(cloud()?.getTrainSettings?.() || null);

  // Nach einem Spiel kommt das Kind hierher zurück – der Fortschritt hat sich
  // dann geändert. Beim Zurückspringen im Verlauf liefert der Browser die Seite
  // aus dem Cache; ohne dieses Neuzeichnen stünde der alte Zug da.
  // Zurück aus einem Spiel: der Browser holt die Seite aus dem Vor-Zurück-
  // Speicher, ohne ein Skript neu zu starten. Dann steht busy noch auf true und
  // die Bühne noch auf "ausgefahren" – der Zug wäre aus dem Bild geschoben und
  // kein Tipp käme mehr an. Beim pageshow wird deshalb alles zurückgesetzt und
  // wieder das Startbild gezeigt: nach einem Spiel soll das Kind ohnehin
  // seinen ganzen Zug sehen.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    resetStage();
    kids()?.startMusic?.();
    // Beim Zurückkommen aus einem Spiel ist der Ton längst freigegeben – hier
    // muss der Zug auf nichts mehr warten.
    rollIn();
  });

  function resetStage() {
    busy = false;
    delete stage.dataset.moving;
    stage.querySelector(".scene-picker")?.remove();
    view.name = "home";
    view.areaId = null;
    view.part = "whole";
    render();
  }
})();
