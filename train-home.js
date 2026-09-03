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
  // Gezeigt wird, was gewählt ist – ob die Landschaft nach dem Stand dieses
  // Geräts gerade frei wäre, spielt hier keine Rolle. Die Sperre gehört in die
  // Auswahl: dort lässt sich Gesperrtes nicht antippen. Beim Anzeigen wäre sie
  // nur ein Fehler: gleich nach dem Laden ist der Fortschritt aus der Cloud
  // noch unterwegs, und die gewählte Landschaft galt als gesperrt – die Wiese
  // stand da, und einen Augenblick später sprang das Bild um. Und nach einem
  // Zurücksetzen des Fortschritts sollen Lok und Landschaft ausdrücklich
  // bleiben. Dieselbe Regel gilt auf den Spielseiten (train-scenes.js).
  function currentScene() {
    const list = scenes();
    if (!list) return null;
    return list.BY_ID[recall(SCENE_KEY)] || list.SCENES[0];
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
  function describeTrain(areas, title = "Dein Zug.") {
    const done = areas.filter((a) => a.complete);
    const started = areas.filter((a) => a.stage > 0 && !a.complete);
    const empty = areas.filter((a) => a.stage === 0);
    const parts = [title];
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

  // Was der Vorlese-Knopf und die Bildschirmleser über ein Gebäude sagen. Die
  // Einheit kommt vom Spiel: die meisten zählen Level, die beiden Spiele mit
  // Bestenliste zählen Runden.
  function describeGame(game) {
    if (!game.total) return game.title;
    // "alle 5 Runden" gegen "von 5 Runden": das eine steht im Nominativ, das
    // andere im Dativ. Beim Level fallen die beiden auseinander.
    const { plural, dative } = game.unit || { plural: "Level", dative: "Leveln" };
    if (game.solved === 0) return `${game.title}: noch nicht gespielt.`;
    if (game.solved >= game.total) return `${game.title}: geschafft, alle ${game.total} ${plural} gespielt.`;
    return `${game.title}: ${game.solved} von ${game.total} ${dative} gespielt.`;
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
  //
  // Die Tore stehen in gleichem Abstand und sind schmaler als dieser Abstand:
  // so überlappt keines das nächste, und ein Tipp auf eine Ecke trifft immer
  // das Tor, das gemeint war.
  const GATE_SCALE = 0.72;
  const AREA_STOPS = [
    { x: 400, y: 502 },
    { x: 578, y: 410 },
    { x: 756, y: 318 },
    { x: 934, y: 226 },
    { x: 1112, y: 134 },
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
      // In der Farbe des Bereichs, wie der Wagen und das Tor: die Häuser
      // gehören sichtbar zusammen, und die Farbe sagt, wo man ist.
      const node = art.buildBuilding(game.id, {
        done: game.total > 0 && game.solved >= game.total,
        ratio: game.ratio,
        label: describeGame(game),
        hue: area.color,
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
      layoutFriends();
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
    layoutFriends();
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

    // Jede Kiste ist ein Knopf: von hier aus geht es direkt ins Spiel. Wer
    // sieht, wo noch etwas fehlt, will meist gleich dorthin – und nicht erst
    // zurück, in den Bereich und dann auf das Haus.
    area.games.forEach((game) => {
      const crate = document.createElement("button");
      crate.type = "button";
      crate.className = "wagon-crate";
      crate.dataset.page = game.page;
      crate.dataset.game = game.id;
      crate.setAttribute("aria-label", `${describeGame(game)} Antippen zum Spielen.`);
      crate.addEventListener("click", () => enterGame(game.page));
      crate.append(...crateParts(game, area.color));
      shelf.append(crate);
    });

    wrap.append(shelf);
    return wrap;
  }

  // Der Inhalt einer Kiste: das Bild des Spiels als Deckel und darunter ein
  // Band je Welt. Zweimal gebraucht – am eigenen Wagen zum Antippen, am Zug
  // eines anderen zum Anschauen. Einmal gebaut, damit beide dasselbe zeigen.
  function crateParts(game, color) {
    // Das Bild des Spiels als Deckel der Kiste: so ist die Verbindung zur
    // Spielauswahl sofort da, ohne dass irgendwo ein Name stehen muss.
    // In der Farbe des Bereichs, genau wie auf der Bühne. Ohne die Angabe
    // nähme jedes Bild die Farbe seines eigenen Bereichs – das stimmt nur
    // zufällig mit dem Wagen überein, an dem die Kiste hängt.
    const icon = art.buildBuilding(game.id, { label: game.title, hue: color });
    icon.removeAttribute("role");
    icon.removeAttribute("tabindex");
    icon.classList.remove("train-building");
    const iconSvg = el("svg", {
      viewBox: `0 ${art.GROUND - art.BUILD_H} ${art.BUILD_W} ${art.BUILD_H + 2}`,
      class: "crate-icon", "aria-hidden": "true",
    }, [icon]);

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
      fill.style.background = color;
      if (world.ratio >= 1) band.classList.add("is-full");
      band.append(fill);
      bands.append(band);
    });

    return [iconSvg, bands];
  }

  // ---------------------------------------------------------------------------
  // Die Züge der Gruppe
  // ---------------------------------------------------------------------------
  // Wer vom Admin in eine Gruppe gelegt wurde, sieht auf dem Startbild über
  // seinem eigenen Zug die Züge der anderen – jeder auf seinem eigenen Gleis,
  // mit seinem Namen davor. Gerechnet wird ihr Stand mit derselben Rechnung
  // wie der eigene (train-progress.js), gezeichnet mit derselben Zeichnung
  // (train-art.js): nur so heisst ein Wagen auf jedem Gleis dasselbe.
  //
  // Nur auf dem Startbild. Unterwegs zu den Toren und vor den Gebäuden geht es
  // um den eigenen Weg, und fünf Züge übereinander wären dort nur Gedränge.
  let friends = [];
  let friendsHost = null;
  // Zählt die Abfragen. Eine langsame Antwort von vorhin darf eine neuere
  // nicht überschreiben – etwa wenn der Admin die Gruppe gerade geändert hat.
  let friendsToken = 0;

  async function loadFriends() {
    const token = friendsToken += 1;
    let accounts = [];
    try {
      accounts = (await cloud()?.loadGroupTrains?.()) || [];
    } catch (error) {
      // Ohne Gruppe, ohne Netz, ohne Recht: dann steht eben nur der eigene Zug
      // da. Das Startbild darf daran nicht hängenbleiben.
      console.warn("Die Züge der Gruppe konnten nicht geladen werden", error);
      accounts = [];
    }
    if (token !== friendsToken) return;

    friends = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      loco: { ...art.DEFAULT_LOCO, ...(account.loco || {}) },
      areas: progress.areasForAccount(account),
    }));

    // Steht gerade der Zug eines Kindes offen, das nicht mehr dazugehört, führt
    // der Weg zurück auf das Startbild – sonst bliebe eine Ansicht stehen, zu
    // der es keinen Zug mehr gibt.
    if (view.name === "friend" && !friends.some((entry) => entry.id === view.friendId)) {
      view.friendId = null;
      view.name = "home";
      render();
      return;
    }

    renderFriends();
  }

  function renderFriends() {
    if (!friendsHost) return;
    friendsHost.innerHTML = "";
    friendsHost.dataset.ready = "0";
    friendsHost.hidden = friends.length === 0;
    if (!friends.length) return;
    friends.forEach((friend) => friendsHost.append(buildFriendTrain(friend)));
    window.requestAnimationFrame(layoutFriends);
  }

  function buildFriendTrain(friend) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "friend-train";
    row.dataset.friend = friend.id;
    row.setAttribute("aria-label", `${describeTrain(friend.areas, `Zug von ${friend.name}.`)} Antippen für Einzelheiten.`);

    const name = document.createElement("span");
    name.className = "friend-name";
    name.textContent = friend.name;

    // Mit eigenem Gleis: gezeichnet im selben Koordinatensystem wie der Zug,
    // also immer genau unter den Rädern. Ein Strich im CSS müsste dafür auf
    // Prozentwerte vertrauen, die bei jedem Seitenverhältnis anders liegen.
    const svg = art.buildTrain(friend.areas, friend.loco, { pad: 4, gap: 4, withTrack: true });
    svg.setAttribute("class", "train-svg friend-svg");
    svg.setAttribute("aria-hidden", "true");
    svg.removeAttribute("role");

    row.append(name, svg);
    row.addEventListener("click", () => { if (!busy) showFriend(friend.id); });
    return row;
  }

  // Der Platz zwischen dem oberen Bildrand und dem eigenen Zug, aufgeteilt auf
  // die Züge der Gruppe. Gemessen statt gerechnet: wie hoch der eigene Zug
  // steht, hängt am Seitenverhältnis des Fensters, und wie viele Züge oben
  // stehen, weiss erst die Gruppe.
  function layoutFriends() {
    if (!friendsHost || !friends.length) return;
    const band = stage.querySelector(".train-band");
    const host = stage.getBoundingClientRect();
    if (!band || !host.height) return;

    // Unter den Knöpfen anfangen: Landschaftswechsel links, Konto rechts. Ein
    // Zug darunter wäre halb verdeckt und nicht anzutippen.
    const guard = sceneButton && !sceneButton.hidden
      ? sceneButton.getBoundingClientRect().bottom - host.top
      : 84;
    const top = Math.max(guard + 10, host.height * 0.04);
    // Die Oberkante des eigenen Zugs – die, auf die er zufährt, nicht die, an
    // der er gerade vorbeigleitet. Das Band wird mit einer Überblendung an
    // seinen Platz geschoben; ein getBoundingClientRect() mitten darin misst
    // den Weg und nicht das Ziel, und die fremden Züge stünden danach ein
    // Stück zu tief. offsetTop kennt keine Transformation, der Höhenausgleich
    // steht in der Variablen: zusammen ergibt das den Platz von nachher.
    const lift = parseFloat(window.getComputedStyle(stage).getPropertyValue("--train-lift")) || 0;
    const room = band.offsetTop + lift - top;

    const rows = friends.length;
    const gap = Math.max(4, Math.round(host.height * 0.012));
    // Bleibt kein Platz – ein sehr flaches Fenster, eine Bühne, die noch nicht
    // steht –, bleiben die fremden Züge weg. Nicht entfernt: beim nächsten
    // Drehen des Geräts ist wieder Platz, und dann sollen sie ohne Neuladen
    // dastehen.
    if (room <= 0) {
      friendsHost.dataset.ready = "0";
      return;
    }
    // Unter dieser Höhe ist ein Zug kein Bild mehr, sondern ein Strich. Bei
    // einer grossen Gruppe wächst der Stapel dann lieber nach oben aus seinem
    // Platz heraus, als dass jeder Zug unkenntlich wird.
    const perRow = Math.max(16, (room - gap * (rows + 1)) / rows);

    // Das Seitenverhältnis steht im Ausschnitt des SVG – abgelesen statt
    // ausgerechnet, damit ein Umbau am Zug hier nichts nachzuziehen lässt.
    const first = friendsHost.querySelector(".friend-svg");
    const box = (first?.getAttribute("viewBox") || "0 0 928 200").split(/\s+/).map(Number);
    const aspect = box[2] && box[3] ? box[2] / box[3] : 4.64;

    // Nie so breit wie der eigene Zug: der steht ganz unten und ist der, um den
    // es geht. Der Rest der Breite bleibt für den Namen daneben.
    const maxWidth = host.width * 0.66;
    const width = Math.min(perRow * aspect, maxWidth);

    friendsHost.style.top = `${Math.round(top)}px`;
    friendsHost.style.height = `${Math.round(room)}px`;
    friendsHost.style.gap = `${gap}px`;
    friendsHost.querySelectorAll(".friend-svg").forEach((node) => {
      node.style.width = `${Math.round(width)}px`;
    });
    friendsHost.dataset.ready = "1";
  }

  // Der Zug eines anderen, gross: oben der Zug selbst als Auswahl, darunter die
  // Spiele des angetippten Wagens mit ihren Bändern. Dasselbe Bild wie bei den
  // eigenen Wagen – nur ohne Knöpfe, denn hier ist nichts zu spielen.
  function buildFriendDetail(friend, areaId) {
    const areas = friend.areas;
    // Ohne gewählten Wagen der weiteste: wer den Zug eines anderen antippt,
    // will sehen, was der geschafft hat. Der erste Wagen ist bei vielen leer,
    // und ein leeres Regal beim ersten Blick sähe aus wie ein Fehler.
    const active = areas.find((entry) => entry.id === areaId)
      || [...areas].sort((a, b) => b.stage - a.stage || b.ratio - a.ratio)[0];
    view.friendArea = active.id;

    const wrap = document.createElement("div");
    wrap.className = "friend-detail";

    const name = document.createElement("p");
    name.className = "friend-detail-name";
    name.textContent = friend.name;

    const trainBox = document.createElement("div");
    trainBox.className = "friend-detail-train";
    const svg = art.buildTrain(areas, friend.loco, { pad: 4, gap: 4, withTrack: true });
    // Als Gruppe, nicht als Bild: in einem Bild gelten alle Kinder als
    // Dekoration, und die Wagen sind hier die Auswahl. Ein Bildschirmleser
    // käme sonst an keinen von ihnen heran.
    svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", describeTrain(areas, `Zug von ${friend.name}.`));
    svg.querySelectorAll("[data-area]").forEach((node) => {
      const id = node.getAttribute("data-area");
      const area = areas.find((entry) => entry.id === id);
      if (!area) return;
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-pressed", id === active.id ? "true" : "false");
      node.setAttribute("aria-label", `${describeArea(area)} Antippen für die Spiele.`);
      node.classList.toggle("is-current", id === active.id);
      activate(node, () => showFriend(friend.id, id));
    });
    trainBox.append(svg);

    const shelf = document.createElement("div");
    shelf.className = "wagon-shelf";
    // Kisten ohne Knopf: der Weg ins Spiel führt über den eigenen Zug, nicht
    // über den eines anderen. Dafür steht hier die Zahl – wer vergleicht, will
    // wissen, wie viele es sind, und nicht nur, wie voll ein Band aussieht.
    active.games.forEach((game) => {
      const crate = document.createElement("div");
      crate.className = "wagon-crate is-static";
      crate.setAttribute("role", "group");
      crate.setAttribute("aria-label", describeGame(game));
      crate.append(...crateParts(game, active.color));
      const count = document.createElement("span");
      count.className = "crate-count";
      count.textContent = `${game.solved}/${game.total}`;
      crate.append(count);
      shelf.append(crate);
    });

    wrap.append(name, trainBox, shelf);
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
    const gap = Math.min(70, host.width * 0.03);
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
  // from = die Bühne, von der aus Werkstatt oder Wagen-Ansicht geöffnet wurden.
  const view = { name: "home", areaId: null, part: "whole", from: null, friendId: null, friendArea: null };
  let layerHost = null;
  let backButton = null;
  let sceneButton = null;
  let startButton = null;
  let busy = false;

  // Auf welchen Bühnen der Zug selbst antippbar ist. Klein unten links vor den
  // Gebäuden bleibt er der kürzeste Weg zu seinem Wagen und zur Werkstatt –
  // ein Kind muss dafür nicht erst wieder ganz nach vorn. Vor den Toren aber
  // nicht: dort wartet er genau unter dem ersten Tor, und ein Tipp auf das Tor
  // traf die Lok und landete in der Werkstatt statt im Bereich. In der
  // Werkstatt und in der Wagen-Grossansicht ist er ausgeblendet.
  const TRAIN_TAPPABLE = new Set(["home", "games"]);

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
    view.from = fromView();
    setView("wagon", areaId);
    renderLayer(buildWagonDetail(area));
  }

  function showWorkshop(part = "whole") {
    if (view.name !== "loco") view.from = fromView();
    view.part = part;
    setView("loco");
    renderLayer(buildWorkshop(locoConfig, part));
  }

  // Der Zug eines anderen aus der Gruppe. Angetippt wird er nur auf dem
  // Startbild, also führt der Rückweg von hier immer dorthin.
  function showFriend(friendId, areaId = null) {
    const friend = friends.find((entry) => entry.id === friendId);
    if (!friend) { showHome(); return; }
    view.friendId = friendId;
    view.from = null;
    setView("friend");
    renderLayer(buildFriendDetail(friend, areaId));
  }

  // Die Bühne, auf die der Rückweg führt: die, von der aus angetippt wurde.
  // Wer den Zug aus der Gebäudewahl heraus antippt, will danach wieder vor
  // seinen Gebäuden stehen und nicht am Anfang.
  function fromView() {
    return view.name === "areas" || view.name === "games" ? { name: view.name, areaId: view.areaId } : null;
  }

  // Zurück aus Werkstatt und Wagen-Ansicht. Ohne gemerkte Herkunft geht es auf
  // das Startbild – so war es immer, und dorthin führt auch der Weg von dort.
  function backFromDetail() {
    const from = view.from;
    view.from = null;
    view.part = "whole";
    if (from?.name === "games" && from.areaId) { showGames(from.areaId); return; }
    if (from?.name === "areas") { showAreas(); return; }
    view.name = "home";
    render();
  }

  // Wartet, bis die Fahranimation durch ist. Ohne Bewegung wird nicht gewartet:
  // dann soll der Wechsel sofort passieren, nicht künstlich verzögert.
  function after(ms) {
    return new Promise((resolve) => { window.setTimeout(resolve, reduced() ? 0 : ms); });
  }

  // Ob die Bühne schon einmal gezeichnet wurde, und ob die nächste Ebene ohne
  // Auftritt erscheinen soll (siehe render()).
  let rendered = false;
  let quietLayer = false;

  function renderLayer(node) {
    layerHost.innerHTML = "";
    layerHost.classList.toggle("is-quiet", quietLayer);
    quietLayer = false;
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

  // Zählt die Seitenwechsel. Die Notbremse unten darf nur den Wechsel abräumen,
  // den sie selbst scharf gemacht hat: kommt die Seite aus dem Vor-Zurück-
  // Speicher, läuft ihr alter Zeitgeber weiter und riss sonst mitten in einer
  // ganz anderen Fahrt die Bühne zurück auf das Startbild.
  let leaveToken = 0;

  async function enterGame(page) {
    if (busy || !page) return;
    const from = view.name;
    const token = leaveToken += 1;
    busy = true;
    // Falls die Seite doch nicht wechselt – ein blockierter Link, ein
    // abgebrochener Ladevorgang –, darf die Bühne nicht gesperrt bleiben.
    window.setTimeout(() => { if (busy && leaveToken === token) resetStage(); }, 4000);
    // Die Musik gehört ins Menü. Ausblenden statt abschneiden: ein abrupt
    // endender Ton klingt nach Fehler.
    toot(3);
    kids()?.stopMusic?.({ fade: 0.45 });
    // Nur wo der Zug zu sehen ist, fährt er auch los. Aus der Wagen-Ansicht
    // heraus wäre die halbe Sekunde nur eine Pause vor nichts.
    if (from === "games") {
      stage.dataset.moving = "out";
      await after(560);
    }
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
    if (view.name === "wagon") { backFromDetail(); return; }
    if (view.name === "friend") { view.friendId = null; backFromDetail(); return; }
    if (view.name === "loco") {
      // Erst aus dem Bauteil heraus zur ganzen Lok, dann zum Zug. Zwei Stufen
      // zurück auf einmal wäre für ein Kind ein Sprung ins Nichts.
      if (view.part !== "whole") { showWorkshop("whole"); return; }
      // Zurück zum Zug heisst neu zeichnen: die Lok am Zug muss zeigen, was in
      // der Werkstatt gebaut wurde.
      backFromDetail();
    }
  }

  // ---------------------------------------------------------------------------
  // Der Wagen wächst
  // ---------------------------------------------------------------------------
  // Nach einem geschafften Level soll das Kind sehen, was es davon hat. Die
  // Spielseiten wissen davon nichts: sie speichern nur ihren Fortschritt und
  // gehen zurück. Hier wird verglichen, wie weit ein Bereich beim letzten Mal
  // war und wie weit er jetzt ist – und was gewachsen ist, wird gezeigt.
  //
  // Über den Vergleich statt über eine Nachricht vom Spiel: so stimmt es auch,
  // wenn der Fortschritt aus der Cloud kommt, wenn zwei Level hintereinander
  // gespielt wurden oder wenn die Seite dazwischen neu geladen wurde.
  const SEEN_KEY = "lernapp.train.gesehen";
  const SEEN_SCENES_KEY = "lernapp.train.gesehen.szenen";
  // Die Feier dauert gut drei Sekunden: der Balken füllt sich, die Bauart
  // springt Stufe um Stufe nach. Danach bleibt das Bild stehen, bis das Kind
  // tippt – eine Feier, die von selbst wieder verschwindet, sieht niemand
  // richtig. Während sie läuft, tut ein Tipp nichts: sie soll zu Ende gehen.
  const REWARD_FILL_MS = 2400;    // so lange füllt sich der Balken
  const REWARD_STEPS_FROM = 500;  // die erste Stufe springt hier …
  const REWARD_STEPS_TO = 2600;   // … und die letzte hier
  const REWARD_DONE_MS = 3100;    // ab hier ist die Feier zum Antippen
  const SCENE_REWARD_DONE_MS = 900;

  function readSeen() {
    try {
      const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || "null");
      return raw && typeof raw === "object" ? raw : null;
    } catch { return null; }
  }

  // Gemerkt wird je Bereich der höchste Stand, der je gesehen wurde – nie ein
  // niedrigerer. Die Bühne wird beim Laden mehrmals gezeichnet, und dazwischen
  // kann der Stand kurz einbrechen: die Anmeldung ist durch, aber der Stand
  // aus der Cloud noch nicht da, und für einen Augenblick zählt nichts als
  // gelöst. Wer diesen Einbruch als "gesehen" merkte, feierte gleich darauf
  // den alten Stand als Wachstum – ein zweiter Wagen, eine Landschaft, die
  // längst frei war. Sinken kann der Stand ehrlich nur beim Zurücksetzen, und
  // dann ist ein ausgebliebenes Fest das kleinere Übel.
  function writeSeen(areas) {
    const seen = readSeen() || {};
    const next = { ...seen };
    areas.forEach((area) => {
      const before = Number(seen[area.id]);
      const now = Math.round(area.ratio * 1000) / 1000;
      next[area.id] = Number.isFinite(before) ? Math.max(before, now) : now;
    });
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch { /* privater Modus */ }
  }

  // Welcher Bereich ist gewachsen? Beim allerersten Start gibt es nichts zu
  // vergleichen – dann wird nur gemerkt, nicht gefeiert.
  function grownArea(areas) {
    const seen = readSeen();
    writeSeen(areas);
    if (!seen) return null;
    let best = null;
    areas.forEach((area) => {
      const before = Number(seen[area.id]);
      if (!Number.isFinite(before) || area.ratio <= before + 0.0005) return;
      const gain = area.ratio - before;
      if (!best || gain > best.gain) best = { area, before, gain };
    });
    return best;
  }

  function stageFor(ratio) {
    return progress.stageFor(ratio, ratio > 0);
  }

  // Der Knopf, mit dem eine Feier zu Ende geht. Er erscheint erst, wenn die
  // Feier durch ist – vorher gibt es nichts zu tippen, und ein Knopf, der
  // nichts tut, verwirrt mehr als keiner.
  function rewardButton(label = "Weiter") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wagon-reward-next";
    button.setAttribute("aria-label", label);
    button.append(el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [
      el("path", {
        d: "M5 13l4.5 4.5L19 7", fill: "none", stroke: "currentColor",
        "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round",
      }),
    ]));
    return button;
  }

  // Die Feier: der Wagen gross, sein Balken füllt sich von damals bis jetzt,
  // und die Bauart wächst mit. Danach bleibt der Wagen stehen, bis das Kind
  // tippt; done läuft, wenn die Feier zugemacht wurde.
  function showWagonReward(grown, done) {
    const { area, before } = grown;
    const overlay = document.createElement("div");
    overlay.className = "wagon-reward";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", `${area.label}: dein Wagen wächst`);

    const card = document.createElement("div");
    card.className = "wagon-reward-card";
    card.style.setProperty("--reward-color", area.color);
    card.style.setProperty("--reward-fill", `${REWARD_FILL_MS}ms`);

    const title = document.createElement("p");
    title.className = "wagon-reward-title";
    title.textContent = area.label;

    const stageFrom = stageFor(before);
    const bühne = document.createElement("div");
    bühne.className = "wagon-reward-stage";

    const zeichne = (stage) => {
      bühne.innerHTML = "";
      bühne.append(el("svg", {
        viewBox: `-6 ${art.GROUND - 132} ${art.WAGON_W + 12} 150`,
        class: "wagon-reward-svg", role: "img",
        "aria-label": `${area.label}, Stufe ${stage} von ${progress.STAGE_COUNT}`,
      }, [art.buildWagon(area.wagon, area.color, stage)]));
    };
    zeichne(stageFrom);

    const bar = document.createElement("div");
    bar.className = "wagon-reward-bar";
    const fill = document.createElement("span");
    fill.className = "wagon-reward-fill";
    fill.style.width = `${Math.round(before * 100)}%`;
    bar.append(fill);

    const note = document.createElement("p");
    note.className = "wagon-reward-note";
    note.textContent = area.built ? "Dein Wagen ist gebaut!" : "Dein Wagen wächst.";

    const weiter = rewardButton();
    card.append(title, bühne, bar, note, weiter);
    overlay.append(card);
    stage.append(overlay);

    kids()?.playJingle?.("wagon");
    kids()?.vibrate?.([12, 60, 18]);

    // Der Balken läuft los, sobald er im Bild steht; die Bauart springt
    // nacheinander auf jede Stufe dazwischen, gleichmässig über die Feier
    // verteilt – ob eine Stufe dazukam oder vier.
    const stufen = [];
    for (let s = stageFrom + 1; s <= area.stage; s += 1) stufen.push(s);
    const timers = [];
    const zeigeStufe = (s) => {
      zeichne(s);
      bühne.classList.remove("is-pop");
      void bühne.offsetWidth;
      bühne.classList.add("is-pop");
      kids()?.playJingle?.("star");
    };

    let fertig = false;
    const abschliessen = () => {
      if (fertig) return;
      fertig = true;
      timers.forEach((id) => window.clearTimeout(id));
      zeichne(area.stage);
      fill.style.width = `${Math.round(area.ratio * 100)}%`;
      overlay.classList.add("is-done");
    };

    if (reduced()) {
      // Ohne Bewegung steht gleich das Ergebnis da, samt Knopf.
      abschliessen();
    } else {
      window.requestAnimationFrame(() => {
        fill.style.width = `${Math.round(area.ratio * 100)}%`;
      });
      stufen.forEach((s, index) => {
        const at = REWARD_STEPS_FROM + ((index + 1) / stufen.length) * (REWARD_STEPS_TO - REWARD_STEPS_FROM);
        timers.push(window.setTimeout(() => zeigeStufe(s), Math.round(at)));
      });
      timers.push(window.setTimeout(abschliessen, REWARD_DONE_MS));
    }

    // Zugemacht wird erst nach der Feier – ein Tipp mittendrin tut nichts.
    let closed = false;
    const close = () => {
      if (!fertig || closed) return;
      closed = true;
      overlay.remove();
      done?.();
    };
    overlay.addEventListener("click", close);
    return close;
  }

  // ---------------------------------------------------------------------------
  // Eine neue Landschaft ist frei
  // ---------------------------------------------------------------------------
  // Freigeschaltet wird über fertig gebaute Wagen. Ohne Hinweis merkt das
  // niemand: der Knopf oben links sieht gleich aus, und im Auswahlbild fällt
  // bloss ein Schloss weniger auf.
  function newlyUnlockedScene(built) {
    const list = scenes();
    if (!list) return null;
    const frei = list.unlockedCount(built);
    // Nichts im Speicher heisst: erster Start. Number(null) wäre 0, und dann
    // meldete sich beim allerersten Öffnen gleich eine "neue" Landschaft.
    let roh = null;
    try { roh = localStorage.getItem(SEEN_SCENES_KEY); } catch { roh = null; }
    const gesehen = roh === null ? null : Number(roh);
    // Auch hier nur aufwärts: bricht der Stand beim Laden kurz ein, bleibt
    // die höhere Zahl stehen – sonst würde die Landschaft, die längst frei
    // war, beim nächsten Bild noch einmal als neu gefeiert.
    const merken = Math.max(Number.isFinite(gesehen) ? gesehen : 0, frei);
    try { localStorage.setItem(SEEN_SCENES_KEY, String(merken)); } catch { /* privater Modus */ }
    if (roh === null) return null;
    if (!Number.isFinite(gesehen) || frei <= gesehen) return null;
    // Die zuletzt dazugekommene: mehrere auf einmal gibt es nicht, aber falls
    // doch, ist die neueste die interessanteste.
    return list.SCENES[frei - 1] || null;
  }

  function showSceneReward(scene, done) {
    const overlay = document.createElement("div");
    overlay.className = "wagon-reward scene-reward";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", `Neue Landschaft frei: ${scene.label}`);

    const card = document.createElement("div");
    card.className = "wagon-reward-card";
    card.style.setProperty("--reward-color", "#2f9e44");

    const title = document.createElement("p");
    title.className = "wagon-reward-title";
    title.textContent = "Neue Landschaft!";
    card.append(title);

    const bild = document.createElement("div");
    bild.className = "scene-reward-thumb";
    bild.append(sceneThumb(scene));
    card.append(bild);

    const note = document.createElement("p");
    note.className = "wagon-reward-note";
    note.textContent = `${scene.label} – du kannst sie oben links auswählen.`;
    card.append(note);

    const weiter = rewardButton();
    card.append(weiter);

    overlay.append(card);
    stage.append(overlay);
    kids()?.playJingle?.("wagon");

    // Auch dieses Bild bleibt stehen, bis das Kind tippt. Der Knopf kommt,
    // sobald die Landschaft ins Bild geflogen ist.
    let fertig = false;
    const abschliessen = () => { fertig = true; overlay.classList.add("is-done"); };
    if (reduced()) abschliessen();
    else window.setTimeout(abschliessen, SCENE_REWARD_DONE_MS);

    let closed = false;
    const close = () => {
      if (!fertig || closed) return;
      closed = true;
      overlay.remove();
      done?.();
    };
    overlay.addEventListener("click", close);
  }

  // Die Feiern stehen an, eine nach der anderen. Die Bühne wird nach dem Laden
  // mehrmals neu gezeichnet – etwa wenn Firebase sich meldet oder ein Stand
  // aus der Cloud kommt –, und jedes Neuzeichnen kann etwas zu feiern finden.
  // Zwei Feiern übereinander wären ein Durcheinander; hier wartet die zweite,
  // bis die erste zugemacht ist.
  const feiern = [];
  let feierLaeuft = false;

  function feiere(zeigen) {
    feiern.push(zeigen);
    naechsteFeier();
  }

  function naechsteFeier() {
    if (feierLaeuft) return;
    const zeigen = feiern.shift();
    if (!zeigen) return;
    feierLaeuft = true;
    zeigen(() => {
      feierLaeuft = false;
      naechsteFeier();
    });
  }

  // Prüft nach jedem Aufbau, ob es etwas zu feiern gibt. Kommen beide zusammen,
  // kommt erst der Wagen und dann die Landschaft – die Landschaft ist die
  // Folge, nicht die Ursache.
  function maybeCelebrate(areas) {
    const grown = grownArea(areas);
    const built = areas.filter((area) => area.built).length;
    const scene = newlyUnlockedScene(built);
    if (grown) feiere((done) => showWagonReward(grown, done));
    if (scene) feiere((done) => showSceneReward(scene, done));
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

    // Eine laufende Feier überlebt das Neuzeichnen. Die Bühne wird auch dann
    // neu gebaut, wenn Firebase sich nach dem Laden meldet – und das tut es
    // jedes Mal, mit oder ohne Konto. Ohne diesen Handgriff war die Feier
    // nach einem Wimpernschlag wieder weg, samt Wagen und Balken.
    const laufendeFeiern = [...stage.querySelectorAll(".wagon-reward")];

    // Die Landschaft bleibt stehen, solange es dieselbe ist. Neu gebaut fingen
    // Wolken, Hügel und Gras wieder am Anfang an – ein Ruck durch das ganze
    // Bild bei jedem Neuzeichnen. Und neu gezeichnet wird nach dem Laden noch
    // zwei-, dreimal, sobald Firebase Einstellungen und Fortschritt meldet:
    // das sah aus, als würde der Hintergrund mehrmals hintereinander geladen.
    const scene = currentScene();
    const standing = stage.querySelector(":scope > .scene");
    const keepScene = standing && scene && standing.dataset.scene === scene.id ? standing : null;
    [...stage.children].forEach((child) => { if (child !== keepScene) child.remove(); });
    if (scene && !keepScene) stage.prepend(buildScene(scene));
    // Beim Neuzeichnen derselben Ansicht soll die Ebene nicht noch einmal
    // hereinschweben: das Bild steht schon, es bekommt nur frische Zahlen.
    quietLayer = rendered;
    rendered = true;

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
    const svg = art.buildTrain(areas, loco, { pad: 4, gap: 4, trailing: 160, withTrack: false });
    svg.setAttribute("aria-label", describeTrain(areas));

    svg.querySelectorAll("[data-area]").forEach((node) => {
      const id = node.getAttribute("data-area");
      const area = areas.find((entry) => entry.id === id);
      if (!area) return;
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-label", `${describeArea(area)} Antippen für Einzelheiten.`);
      activate(node, () => { if (TRAIN_TAPPABLE.has(view.name) && !busy) showWagon(id); });
    });
    svg.querySelector("[data-loco]")?.setAttribute("aria-label", "Deine Lokomotive");


    // Ein Tipp auf die Lok führt in die Werkstatt.
    const locoNode = svg.querySelector("[data-loco]");
    if (locoNode) {
      locoNode.setAttribute("role", "button");
      locoNode.setAttribute("tabindex", "0");
      locoNode.setAttribute("aria-label", "Deine Lokomotive umbauen");
      activate(locoNode, () => { if (TRAIN_TAPPABLE.has(view.name) && !busy) showWorkshop("whole"); });
    }

    band.append(svg);

    layerHost = document.createElement("div");
    layerHost.className = "stage-layer";

    backButton = buildBackButton();
    backButton.hidden = true;
    sceneButton = scene ? buildSceneButton(scene) : null;
    startButton = buildStartButton();

    friendsHost = document.createElement("div");
    friendsHost.className = "train-friends";
    friendsHost.hidden = true;

    stage.append(friendsHost, band, layerHost, backButton, startButton);
    if (sceneButton) stage.append(sceneButton);
    laufendeFeiern.forEach((overlay) => stage.append(overlay));

    renderFriends();

    if (previous === "games" && previousArea) showGames(previousArea);
    else if (previous === "areas") showAreas();
    else if (previous === "loco") showWorkshop(view.part);
    else if (previous === "wagon" && previousArea) showWagon(previousArea);
    else if (previous === "friend" && view.friendId) showFriend(view.friendId, view.friendArea);
    else showHome();

    // Ganz zum Schluss: hat sich seit dem letzten Mal ein Wagen weiterentwickelt,
    // wird das gefeiert. Nach dem Aufbau, damit die Feier über der fertigen
    // Bühne liegt und nicht über einem halben Bild.
    maybeCelebrate(areas);
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

  // Die Gruppe kommt erst mit der Anmeldung – und sie kann sich ändern, wenn
  // der Admin jemanden dazunimmt oder herausnimmt. Beides führt hierher.
  document.addEventListener("lernapp:group-changed", () => loadFriends());

  // Falls die Anmeldung ausnahmsweise schon durch ist, bevor diese Seite
  // zuhört: einmal von Hand nachfragen.
  applyCloudSettings(cloud()?.getTrainSettings?.() || null);
  if (cloud()?.getGroup?.()) loadFriends();

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
    // Die anderen haben inzwischen vielleicht gespielt.
    loadFriends();
    kids()?.startMusic?.();
    // Beim Zurückkommen aus einem Spiel ist der Ton längst freigegeben – hier
    // muss der Zug auf nichts mehr warten.
    rollIn();
  });

  function resetStage() {
    // Alles, was noch auf einen Seitenwechsel wartet, ist damit hinfällig.
    leaveToken += 1;
    busy = false;
    delete stage.dataset.moving;
    stage.querySelector(".scene-picker")?.remove();
    view.name = "home";
    view.areaId = null;
    view.part = "whole";
    view.from = null;
    view.friendId = null;
    view.friendArea = null;
    render();
  }
})();
