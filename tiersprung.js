/*
 * tiersprung.js – "Tier-Sprung": ein Auto-Runner für Kinder.
 *
 * Zehn Level, zehn Tiere: Man startet als winzige Maus und wird mit jedem
 * geschafften Level ein grösseres Tier. Gelaufen wird von allein, ein
 * Tipp (oder Leertaste) lässt springen – länger drücken springt höher.
 *
 * Alles wird prozedural auf ein 2D-Canvas gezeichnet: keine Bild- oder
 * Sounddateien, damit die Seite so klein bleibt wie der Rest der Lernapp
 * und der vorhandene Service-Worker sie komplett offline halten kann.
 */
(() => {
  "use strict";

  const kids = window.LernappKids;
  if (!kids || document.body.dataset.page !== "runner") return;

  const host = document.querySelector("#ts-stage");
  let shell = null;
  const stage = document.getElementById("runner-stage");
  const canvas = document.getElementById("runner-canvas");
  if (!host || !stage || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const TAU = Math.PI * 2;
  const clamp = (value, min, max) => (value < min ? min : value > max ? max : value);

  // ---------------------------------------------------------------------------
  // Tiere – Bauplan für die prozedurale Zeichnung
  // ---------------------------------------------------------------------------
  // size = Gesamthöhe in Weltpixeln; das Tier wächst von Level zu Level.
  const ANIMALS = {
    mouse: {
      name: "Maus", emoji: "🐭", plan: "quad", size: 54,
      fur: "#bcc2ce", furDark: "#9aa2b1", belly: "#f2e6ea",
      ear: "round", earSize: 0.34, earInner: "#f7c7d2",
      tail: "thin", tailColor: "#d7b3ba", nose: "#e8869b", headR: 0.25,
    },
    frog: {
      name: "Frosch", emoji: "🐸", plan: "quad", size: 58, squat: true,
      fur: "#6ec46a", furDark: "#4fa34d", belly: "#d9f2b8",
      ear: "none", eyesOnTop: true, headR: 0.30,
      tail: "none", nose: "#3f7d3d",
    },
    chick: {
      name: "Küken", emoji: "🐥", plan: "biped", size: 60,
      fur: "#ffd45e", furDark: "#f0b93a", belly: "#fff0bd",
      ear: "none", beak: "#ff9f1c", feet: "#ff9f1c", wing: "#f7c53f",
      tail: "none", headR: 0.24,
    },
    rabbit: {
      name: "Hase", emoji: "🐰", plan: "quad", size: 66,
      fur: "#f4ece4", furDark: "#ddd0c4", belly: "#ffffff",
      ear: "long", earSize: 0.46, earInner: "#ffc6d2",
      tail: "puff", tailColor: "#ffffff", nose: "#f090a6", headR: 0.24,
    },
    fox: {
      name: "Fuchs", emoji: "🦊", plan: "quad", size: 72,
      fur: "#f5933f", furDark: "#dd7526", belly: "#fff3e6",
      ear: "pointy", earSize: 0.34, earInner: "#3a2412",
      tail: "bushy", tailColor: "#f5933f", tailTip: "#fff3e6",
      nose: "#3a2412", headR: 0.25, socks: "#3a2412",
    },
    penguin: {
      name: "Pinguin", emoji: "🐧", plan: "biped", size: 78,
      fur: "#2f3b52", furDark: "#1f2839", belly: "#ffffff",
      ear: "none", beak: "#ffa62b", feet: "#ffa62b", wing: "#26314a",
      faceMask: "#ffffff", tail: "none", headR: 0.23,
    },
    panda: {
      name: "Panda", emoji: "🐼", plan: "quad", size: 86,
      fur: "#f7f5f2", furDark: "#e0dbd4", belly: "#ffffff",
      ear: "round", earSize: 0.26, earInner: "#2b2b31", earColor: "#2b2b31",
      tail: "short", tailColor: "#f7f5f2", nose: "#2b2b31", headR: 0.26,
      socks: "#2b2b31", eyePatch: "#2b2b31",
    },
    bear: {
      name: "Bär", emoji: "🐻", plan: "quad", size: 92,
      fur: "#a9703f", furDark: "#8b5729", belly: "#e3c39b",
      ear: "round", earSize: 0.24, earInner: "#7d4d24",
      tail: "short", tailColor: "#8b5729", nose: "#3a2412", headR: 0.26, snout: "#e3c39b",
    },
    lion: {
      name: "Löwe", emoji: "🦁", plan: "quad", size: 98,
      fur: "#f0b64a", furDark: "#d3982f", belly: "#ffe3a8",
      ear: "round", earSize: 0.20, earInner: "#c98a2c",
      tail: "tuft", tailColor: "#f0b64a", tailTip: "#a2661d",
      mane: "#e08a2c", nose: "#7a4a19", headR: 0.24, snout: "#ffe3a8",
    },
    elephant: {
      name: "Elefant", emoji: "🐘", plan: "quad", size: 108,
      fur: "#9aa4b8", furDark: "#7d879b", belly: "#c3cbdb",
      ear: "big", earSize: 0.42, earInner: "#b3aabb",
      tail: "tuft", tailColor: "#7d879b", tailTip: "#5d6577",
      trunk: true, nose: "#5d6577", headR: 0.26,
    },
  };

  // ---------------------------------------------------------------------------
  // Landschaften – Farbpaletten pro Level
  // ---------------------------------------------------------------------------
  const SCENES = {
    wiese: {
      sky: ["#8fd6ff", "#dff3ff"], sun: "#fff0a8",
      hillFar: "#a8dda0", hillNear: "#6fbf73",
      ground: "#5aa85f", groundDark: "#478c4c", soil: "#8a5a3b",
      deco: "tree", decoColor: "#3f8f4a", decoTrunk: "#8a5a3b",
      obstacles: ["bush", "rock", "mushroom"],
    },
    teich: {
      sky: ["#7fd0d8", "#e2fbf7"], sun: "#fff6c4",
      hillFar: "#9ad9c8", hillNear: "#5fb9a4",
      ground: "#4fa78f", groundDark: "#3d8b76", soil: "#6b7a58",
      deco: "reed", decoColor: "#3f8f6a", decoTrunk: "#5c8a54",
      obstacles: ["reed", "rock", "log"],
    },
    kornfeld: {
      sky: ["#9fd8ff", "#fff3d6"], sun: "#ffe9a3",
      hillFar: "#f0d493", hillNear: "#e0bb63",
      ground: "#d9ae4e", groundDark: "#bd9339", soil: "#9a7331",
      deco: "wheat", decoColor: "#e8c55f", decoTrunk: "#c19b3c",
      obstacles: ["bale", "rock", "bush"],
    },
    garten: {
      sky: ["#a5e4ff", "#eaffe6"], sun: "#fff2ad",
      hillFar: "#b7e3a2", hillNear: "#7fc96f",
      ground: "#6cb85e", groundDark: "#559a49", soil: "#7a5334",
      deco: "tree", decoColor: "#4fa04f", decoTrunk: "#7a5334",
      obstacles: ["bush", "crate", "mushroom"],
    },
    herbstwald: {
      sky: ["#ffc98a", "#ffeed6"], sun: "#fff0b8",
      hillFar: "#e8a765", hillNear: "#cf7f3f",
      ground: "#b4713d", groundDark: "#96592d", soil: "#7a4726",
      deco: "tree", decoColor: "#e0762f", decoTrunk: "#6f4526",
      obstacles: ["stump", "rock", "mushroom"],
    },
    eis: {
      sky: ["#a9dcff", "#f2fbff"], sun: "#ffffff",
      hillFar: "#d6ecff", hillNear: "#a9d4f0",
      ground: "#e8f4fb", groundDark: "#c7e0ef", soil: "#9dc0d6",
      deco: "pine", decoColor: "#4c7f74", decoTrunk: "#5c6b74",
      obstacles: ["ice", "rock", "pine"],
    },
    bambus: {
      sky: ["#b6ead3", "#f0fff6"], sun: "#fff4bd",
      hillFar: "#8fd6ae", hillNear: "#5bb98a",
      ground: "#4fa574", groundDark: "#3d8a5f", soil: "#6d7a4a",
      deco: "bamboo", decoColor: "#7cc45c", decoTrunk: "#96b74e",
      obstacles: ["bamboo", "rock", "bush"],
    },
    wald: {
      sky: ["#86c9f0", "#dff0ff"], sun: "#fff0a8",
      hillFar: "#7fb98c", hillNear: "#4e9463",
      ground: "#3f8a55", groundDark: "#317045", soil: "#6b4a2e",
      deco: "pine", decoColor: "#2f7346", decoTrunk: "#6b4a2e",
      obstacles: ["stump", "log", "rock"],
    },
    savanne: {
      sky: ["#ffd08a", "#fff1cf"], sun: "#ffdf7a",
      hillFar: "#e8c078", hillNear: "#d1a052",
      ground: "#cf9f4f", groundDark: "#b3853c", soil: "#8f6a2f",
      deco: "acacia", decoColor: "#7f9a48", decoTrunk: "#7d5a2e",
      obstacles: ["rock", "bush", "crate"],
    },
    dschungel: {
      sky: ["#ff9e6d", "#ffd9a8"], sun: "#fff0bb",
      hillFar: "#5f9e6b", hillNear: "#3d7a52",
      ground: "#357048", groundDark: "#295a3a", soil: "#5f4327",
      deco: "palm", decoColor: "#3f8f56", decoTrunk: "#7a5334",
      obstacles: ["log", "rock", "bamboo"],
    },
  };

  // ---------------------------------------------------------------------------
  // Level – zehn Stufen, jede mit eigenem Tier, Leckerbissen und Landschaft
  // ---------------------------------------------------------------------------
  // speed/speedEnd = Weltpixel pro Sekunde am Anfang/Ende des Levels.
  // gap = Abstand zwischen Hindernissen in Sekunden (skaliert also mit Tempo).
  const LEVELS = [
    { animal: "mouse",    scene: "wiese",      treat: "🧀", treatName: "Käse",     speed: 200, speedEnd: 235, gap: [1.60, 2.10], height: [30, 40], length: 5200,   doubles: 0,    label: "Auf der Wiese" },
    { animal: "frog",     scene: "teich",      treat: "🪰", treatName: "Fliegen",  speed: 215, speedEnd: 255, gap: [1.50, 1.95], height: [32, 44], length: 5600,  doubles: 0,    label: "Am Teich" },
    { animal: "chick",    scene: "kornfeld",   treat: "🌾", treatName: "Körner",   speed: 230, speedEnd: 275, gap: [1.42, 1.85], height: [34, 48], length: 6000,  doubles: 0.08, label: "Im Kornfeld" },
    { animal: "rabbit",   scene: "garten",     treat: "🥕", treatName: "Karotten", speed: 248, speedEnd: 295, gap: [1.34, 1.76], height: [36, 52], length: 6400,  doubles: 0.14, label: "Im Garten" },
    { animal: "fox",      scene: "herbstwald", treat: "🫐", treatName: "Beeren",   speed: 266, speedEnd: 315, gap: [1.26, 1.66], height: [38, 56], length: 6800,  doubles: 0.20, label: "Im Herbstwald" },
    { animal: "penguin",  scene: "eis",        treat: "🐟", treatName: "Fische",   speed: 284, speedEnd: 335, gap: [1.20, 1.58], height: [40, 58], length: 7200,  doubles: 0.26, label: "Auf dem Eis" },
    { animal: "panda",    scene: "bambus",     treat: "🎋", treatName: "Bambus",   speed: 300, speedEnd: 352, gap: [1.14, 1.50], height: [42, 62], length: 7600,  doubles: 0.32, label: "Im Bambuswald" },
    { animal: "bear",     scene: "wald",       treat: "🍯", treatName: "Honig",    speed: 316, speedEnd: 368, gap: [1.08, 1.44], height: [44, 66], length: 8000,  doubles: 0.38, label: "Im tiefen Wald" },
    { animal: "lion",     scene: "savanne",    treat: "🍖", treatName: "Fleisch",  speed: 332, speedEnd: 385, gap: [1.02, 1.36], height: [46, 70], length: 8400,  doubles: 0.44, label: "In der Savanne" },
    { animal: "elephant", scene: "dschungel",  treat: "🥜", treatName: "Erdnüsse", speed: 348, speedEnd: 400, gap: [0.96, 1.28], height: [48, 74], length: 9000,  doubles: 0.50, label: "Im Dschungel" },
  ].map((level, index) => ({ ...level, id: index + 1 }));

  const LEVEL_COUNT = LEVELS.length;

  // ---------------------------------------------------------------------------
  // Fortschritt
  // ---------------------------------------------------------------------------
  const PROGRESS_KEY = "lernapp.tiersprung.progress";

  function loadProgress() {
    const stored = kids.readJSON(PROGRESS_KEY, null);
    const progress = { unlocked: 1, best: {} };
    if (!stored || typeof stored !== "object") return progress;
    const unlocked = Number(stored.unlocked);
    if (Number.isFinite(unlocked)) progress.unlocked = clamp(Math.round(unlocked), 1, LEVEL_COUNT);
    if (stored.best && typeof stored.best === "object") {
      LEVELS.forEach((level) => {
        const entry = stored.best[level.id];
        if (!entry || typeof entry !== "object") return;
        progress.best[level.id] = {
          stars: clamp(Math.round(Number(entry.stars) || 0), 0, 3),
          treats: Math.max(0, Math.round(Number(entry.treats) || 0)),
          total: Math.max(0, Math.round(Number(entry.total) || 0)),
        };
      });
    }
    return progress;
  }

  // Der Fortschritt folgt dem Kind auf jedes Gerät. Zusammengeführt wird
  // vereinigend: je Level das bessere Ergebnis, freigeschaltet bleibt, was auf
  // irgendeinem Gerät freigeschaltet war. Ohne Konto bleibt alles auf dem
  // Gerät, wie bisher.
  const cloudStore = window.LernappGameCloud?.register({
    key: PROGRESS_KEY,
    empty: { unlocked: 1, best: {} },
    merge: window.LernappGameCloud.mergeLevels,
  }) || null;

  function saveProgress(progress) {
    if (cloudStore) cloudStore.write(progress);
    else kids.writeJSON(PROGRESS_KEY, progress);
  }

  let progress = loadProgress();

  // Kommt der Stand später aus der Cloud, wird die Karte neu gezeichnet – sonst
  // stünden dort die Level dieses Geräts, während die Cloud längst weiter ist.
  cloudStore?.onChange(() => {
    progress = loadProgress();
    if (typeof renderMap === "function") renderMap();
  });

  function bestFor(levelId) { return progress.best[levelId] || null; }
  function isUnlocked(levelId) { return levelId <= progress.unlocked; }
  function totalStars() {
    return LEVELS.reduce((sum, level) => sum + (bestFor(level.id)?.stars || 0), 0);
  }

  // ---------------------------------------------------------------------------
  // Zeichen-Helfer
  // ---------------------------------------------------------------------------
  // Ellipse ohne ctx.ellipse: Pfad im skalierten Raum bauen, Transform vor dem
  // Füllen zurücksetzen – so bleiben Linienbreiten überall korrekt.
  function oval(g, x, y, rx, ry, rot, color) {
    g.save();
    g.translate(x, y);
    if (rot) g.rotate(rot);
    g.scale(Math.max(0.0001, rx), Math.max(0.0001, ry));
    g.beginPath();
    g.arc(0, 0, 1, 0, TAU);
    g.restore();
    g.fillStyle = color;
    g.fill();
  }

  function dot(g, x, y, r, color) {
    g.beginPath();
    g.arc(x, y, Math.max(0.0001, r), 0, TAU);
    g.fillStyle = color;
    g.fill();
  }

  function limb(g, x1, y1, x2, y2, width, color) {
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.lineWidth = width;
    g.lineCap = "round";
    g.strokeStyle = color;
    g.stroke();
  }

  function curve(g, x1, y1, cx, cy, x2, y2, width, color) {
    g.beginPath();
    g.moveTo(x1, y1);
    g.quadraticCurveTo(cx, cy, x2, y2);
    g.lineWidth = width;
    g.lineCap = "round";
    g.strokeStyle = color;
    g.stroke();
  }

  function triangle(g, ax, ay, bx, by, cx, cy, color) {
    g.beginPath();
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    g.lineTo(cx, cy);
    g.closePath();
    g.fillStyle = color;
    g.fill();
  }

  function roundRect(g, x, y, w, h, r, color) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    g.beginPath();
    g.moveTo(x + radius, y);
    g.lineTo(x + w - radius, y);
    g.quadraticCurveTo(x + w, y, x + w, y + radius);
    g.lineTo(x + w, y + h - radius);
    g.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    g.lineTo(x + radius, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - radius);
    g.lineTo(x, y + radius);
    g.quadraticCurveTo(x, y, x + radius, y);
    g.closePath();
    g.fillStyle = color;
    g.fill();
  }

  const mix = (a, b, t) => a + (b - a) * t;

  // ---------------------------------------------------------------------------
  // Tier zeichnen – Ursprung liegt zwischen den Pfoten auf dem Boden
  // ---------------------------------------------------------------------------
  function footPosition(hipX, legLen, phase, air) {
    const swing = Math.sin(phase);
    const lift = Math.max(0, swing);
    const groundX = hipX + swing * legLen * 0.55;
    const groundY = -lift * legLen * 0.5;
    const airX = hipX + legLen * 0.34;
    const airY = -legLen * 0.6;
    return { x: mix(groundX, airX, air), y: mix(groundY, airY, air) };
  }

  function drawEye(g, x, y, r, dark, blink) {
    if (blink > 0.5) {
      limb(g, x - r * 0.9, y, x + r * 0.9, y, r * 0.45, dark);
      return;
    }
    dot(g, x, y, r, "#ffffff");
    dot(g, x + r * 0.18, y + r * 0.04, r * 0.58, dark);
    dot(g, x + r * 0.42, y - r * 0.34, r * 0.22, "#ffffff");
  }

  function drawEars(g, a, s, headX, headY, headR, layer) {
    const type = a.ear || "none";
    if (type === "none") return;
    const size = s * (a.earSize || 0.28);
    const shell = a.earColor || a.fur;
    const shellBack = a.earColor || a.furDark;
    const inner = a.earInner || "#ffffff";

    if (type === "round") {
      if (layer === "back") {
        dot(g, headX - headR * 0.62, headY - headR * 0.68, size * 0.5, shellBack);
      } else {
        dot(g, headX + headR * 0.24, headY - headR * 0.92, size * 0.5, shell);
        dot(g, headX + headR * 0.24, headY - headR * 0.92, size * 0.26, inner);
      }
      return;
    }
    if (type === "long") {
      if (layer === "back") {
        oval(g, headX - headR * 0.34, headY - headR * 0.62 - size * 0.42, size * 0.16, size * 0.5, -0.34, shellBack);
      } else {
        oval(g, headX + headR * 0.14, headY - headR * 0.78 - size * 0.44, size * 0.17, size * 0.52, -0.14, shell);
        oval(g, headX + headR * 0.14, headY - headR * 0.78 - size * 0.44, size * 0.08, size * 0.34, -0.14, inner);
      }
      return;
    }
    if (type === "pointy") {
      if (layer === "back") {
        triangle(g,
          headX - headR * 0.86, headY - headR * 0.42,
          headX - headR * 0.24, headY - headR * 0.74,
          headX - headR * 0.72, headY - headR * 0.52 - size, shellBack);
      } else {
        triangle(g,
          headX - headR * 0.10, headY - headR * 0.66,
          headX + headR * 0.60, headY - headR * 0.52,
          headX + headR * 0.10, headY - headR * 0.62 - size, shell);
        triangle(g,
          headX + headR * 0.02, headY - headR * 0.66,
          headX + headR * 0.42, headY - headR * 0.58,
          headX + headR * 0.12, headY - headR * 0.58 - size * 0.62, inner);
      }
      return;
    }
    if (type === "big" && layer === "front") {
      oval(g, headX - headR * 0.30, headY - headR * 0.02, size * 0.62, size * 0.80, 0.12, shell);
      oval(g, headX - headR * 0.30, headY + headR * 0.04, size * 0.40, size * 0.56, 0.12, inner);
    }
  }

  function drawTail(g, a, s, bodyX, bodyY, bodyRX, bodyRY, wag) {
    const type = a.tail || "none";
    if (type === "none") return;
    const baseX = bodyX - bodyRX * 0.92;
    const baseY = bodyY + bodyRY * 0.05;
    const color = a.tailColor || a.furDark;

    if (type === "thin") {
      curve(g, baseX, baseY,
        baseX - s * 0.26, baseY - s * 0.02 + wag * s * 0.06,
        baseX - s * 0.30, baseY - s * 0.20 + wag * s * 0.05,
        s * 0.032, color);
      return;
    }
    if (type === "puff") {
      dot(g, baseX - s * 0.05, baseY + s * 0.02, s * 0.105, color);
      return;
    }
    if (type === "short") {
      dot(g, baseX - s * 0.01, baseY - s * 0.02, s * 0.065, color);
      return;
    }
    if (type === "bushy") {
      const tip = a.tailTip || color;
      for (let i = 0; i <= 6; i += 1) {
        const t = i / 6;
        const x = baseX - s * 0.30 * t;
        const y = baseY - s * 0.26 * t * t + wag * s * 0.05 * t;
        dot(g, x, y, s * (0.115 - 0.035 * t), i >= 5 ? tip : color);
      }
      return;
    }
    if (type === "tuft") {
      const tipX = baseX - s * 0.20;
      const tipY = baseY - s * 0.16 + wag * s * 0.05;
      curve(g, baseX, baseY, baseX - s * 0.20, baseY + s * 0.04, tipX, tipY, s * 0.03, color);
      dot(g, tipX, tipY - s * 0.02, s * 0.055, a.tailTip || color);
    }
  }

  function drawQuadAnimal(g, a, s, p) {
    const legLen = s * (a.squat ? 0.15 : 0.22);
    const bodyRY = s * (a.squat ? 0.29 : 0.26);
    const bodyRX = s * (a.squat ? 0.46 : 0.40);
    const bodyY = -(legLen + bodyRY);
    const headR = s * (a.headR || 0.25);
    const headX = bodyRX * (a.squat ? 0.50 : 0.80);
    const headY = bodyY - bodyRY * (a.squat ? 0.40 : 0.64);
    const legW = s * 0.085;
    const hipY = bodyY + bodyRY * 0.5;
    const wag = Math.sin(p.run * 0.5);

    const legs = [
      { x: -bodyRX * 0.58, ph: 0, far: true },
      { x: -bodyRX * 0.34, ph: Math.PI, far: false },
      { x: bodyRX * 0.28, ph: Math.PI, far: true },
      { x: bodyRX * 0.56, ph: 0, far: false },
    ];

    function paintLeg(spot) {
      const color = spot.far ? a.furDark : a.fur;
      const foot = footPosition(spot.x, legLen, p.run + spot.ph, p.air);
      limb(g, spot.x, hipY, foot.x, foot.y, legW, color);
      if (a.socks) {
        limb(g, mix(spot.x, foot.x, 0.5), mix(hipY, foot.y, 0.5), foot.x, foot.y, legW, a.socks);
      }
    }

    drawTail(g, a, s, 0, bodyY, bodyRX, bodyRY, wag);
    legs.filter((l) => l.far).forEach(paintLeg);

    // Rumpf
    oval(g, 0, bodyY, bodyRX, bodyRY, -0.05, a.fur);
    oval(g, bodyRX * 0.05, bodyY + bodyRY * 0.36, bodyRX * 0.66, bodyRY * 0.5, -0.03, a.belly);

    legs.filter((l) => !l.far).forEach(paintLeg);

    drawEars(g, a, s, headX, headY, headR, "back");
    if (a.mane) {
      for (let i = 0; i < 11; i += 1) {
        const angle = (i / 11) * TAU;
        dot(g, headX + Math.cos(angle) * headR * 0.95, headY + Math.sin(angle) * headR * 0.95, headR * 0.44, a.mane);
      }
    }

    // Kopf
    dot(g, headX, headY, headR, a.fur);
    drawEars(g, a, s, headX, headY, headR, "front");

    if (a.snout) {
      oval(g, headX + headR * 0.55, headY + headR * 0.34, headR * 0.52, headR * 0.36, 0, a.snout);
    }
    if (a.trunk) {
      const tx = headX + headR * 0.70;
      const ty = headY + headR * 0.20;
      for (let i = 0; i <= 7; i += 1) {
        const t = i / 7;
        const x = tx + headR * (0.16 + 0.62 * t);
        const y = ty + headR * (0.55 * t + 0.85 * t * t) - Math.sin(p.run) * headR * 0.06 * t;
        dot(g, x, y, headR * (0.30 - 0.16 * t), t > 0.82 ? a.furDark : a.fur);
      }
    }

    if (a.eyesOnTop) {
      dot(g, headX - headR * 0.28, headY - headR * 0.80, headR * 0.38, a.fur);
      dot(g, headX + headR * 0.40, headY - headR * 0.88, headR * 0.38, a.fur);
      drawEye(g, headX - headR * 0.26, headY - headR * 0.82, headR * 0.22, "#22303a", p.blink);
      drawEye(g, headX + headR * 0.42, headY - headR * 0.90, headR * 0.22, "#22303a", p.blink);
      curve(g, headX + headR * 0.20, headY + headR * 0.40, headX + headR * 0.62, headY + headR * 0.62,
        headX + headR * 0.92, headY + headR * 0.20, headR * 0.14, a.furDark);
    } else {
      if (a.eyePatch) {
        oval(g, headX + headR * 0.34, headY - headR * 0.16, headR * 0.34, headR * 0.42, 0.3, a.eyePatch);
      }
      drawEye(g, headX + headR * 0.38, headY - headR * 0.12, headR * 0.26, "#2c1c12", p.blink);
      dot(g, headX + headR * (a.snout ? 0.92 : 0.86), headY + headR * (a.snout ? 0.22 : 0.16), headR * 0.15, a.nose || "#3a2412");
      curve(g, headX + headR * 0.62, headY + headR * 0.48, headX + headR * 0.78, headY + headR * 0.62,
        headX + headR * 0.92, headY + headR * 0.44, headR * 0.09, a.nose || "#3a2412");
    }
    if (!a.eyePatch && !a.eyesOnTop && !a.flat) {
      dot(g, headX - headR * 0.14, headY + headR * 0.30, headR * 0.20, "rgba(255,150,150,0.35)");
    }
  }

  function drawBipedAnimal(g, a, s, p) {
    const legLen = s * 0.17;
    const bodyRY = s * 0.33;
    const bodyRX = s * 0.27;
    const bodyY = -(legLen + bodyRY);
    const headR = s * (a.headR || 0.23);
    const headX = bodyRX * 0.16;
    const headY = bodyY - bodyRY * 0.84;
    const legW = s * 0.045;
    const hipY = bodyY + bodyRY * 0.72;
    const feetColor = a.feet || "#ff9f1c";

    const legs = [
      { x: -bodyRX * 0.26, ph: 0 },
      { x: bodyRX * 0.30, ph: Math.PI },
    ];
    legs.forEach((spot) => {
      const foot = footPosition(spot.x, legLen, p.run + spot.ph, p.air);
      limb(g, spot.x, hipY, foot.x, foot.y, legW, feetColor);
      triangle(g, foot.x - legLen * 0.16, foot.y, foot.x + legLen * 0.42, foot.y,
        foot.x - legLen * 0.05, foot.y - legLen * 0.16, feetColor);
    });

    // Rumpf + Bauch
    oval(g, 0, bodyY, bodyRX, bodyRY, -0.04, a.fur);
    oval(g, bodyRX * 0.16, bodyY + bodyRY * 0.10, bodyRX * 0.66, bodyRY * 0.74, -0.02, a.belly);

    // Kopf
    dot(g, headX, headY, headR, a.fur);
    if (a.faceMask) {
      oval(g, headX + headR * 0.30, headY + headR * 0.12, headR * 0.62, headR * 0.72, 0.1, a.faceMask);
    }
    drawEye(g, headX + headR * 0.42, headY - headR * 0.10, headR * 0.24, "#2c1c12", p.blink);
    const beak = a.beak || "#ff9f1c";
    triangle(g,
      headX + headR * 0.70, headY + headR * 0.06,
      headX + headR * 1.42, headY + headR * 0.26,
      headX + headR * 0.72, headY + headR * 0.48, beak);

    // Flügel / Flosse – schlägt im Lauftakt
    const flap = Math.sin(p.run) * 0.5 + p.air * 0.7;
    oval(g, bodyRX * 0.44, bodyY + bodyRY * 0.06, bodyRX * 0.42, bodyRY * 0.54, -0.3 - flap, a.wing || a.furDark);
    drawEars(g, a, s, headX, headY, headR, "front");
  }

  function drawAnimal(g, animal, size, pose) {
    const p = {
      run: pose.run || 0,
      air: clamp(pose.air || 0, 0, 1),
      squash: pose.squash || 0,
      blink: pose.blink || 0,
    };
    g.save();
    // Squash & Stretch um die Standfläche herum.
    g.scale(1 - p.squash * 0.16, 1 + p.squash * 0.20);
    if (pose.tilt) g.rotate(pose.tilt);
    if (animal.plan === "biped") drawBipedAnimal(g, animal, size, p);
    else drawQuadAnimal(g, animal, size, p);
    g.restore();
  }

  // ---------------------------------------------------------------------------
  // Hindernisse
  // ---------------------------------------------------------------------------
  // ratio = Breite/Höhe, scale dämpft die Höhe für flache Hindernisse.
  const OBSTACLES = {
    bush:     { ratio: 1.55, scale: 0.86 },
    rock:     { ratio: 1.15, scale: 0.92 },
    mushroom: { ratio: 1.00, scale: 0.90 },
    log:      { ratio: 2.10, scale: 0.70 },
    stump:    { ratio: 1.10, scale: 0.88 },
    reed:     { ratio: 0.75, scale: 1.05 },
    ice:      { ratio: 1.05, scale: 0.95 },
    bale:     { ratio: 1.20, scale: 0.90 },
    crate:    { ratio: 1.00, scale: 0.92 },
    pine:     { ratio: 0.95, scale: 1.05 },
    bamboo:   { ratio: 0.55, scale: 1.10 },
  };

  // Jede Zeichenfunktion arbeitet vom Bodenpunkt aus: y = 0 ist der Boden,
  // negative y sind oben.
  const OBSTACLE_ART = {
    bush(g, w, h, scene) {
      const r = h * 0.52;
      dot(g, -w * 0.28, -r * 0.9, r * 0.86, scene.hillNear);
      dot(g, w * 0.28, -r * 0.86, r * 0.8, scene.hillNear);
      dot(g, 0, -h + r * 0.72, r * 0.98, scene.decoColor);
      oval(g, 0, -r * 0.3, w * 0.5, r * 0.55, 0, scene.decoColor);
      dot(g, -w * 0.16, -h * 0.72, h * 0.07, "rgba(255,255,255,0.4)");
    },
    rock(g, w, h, scene) {
      g.beginPath();
      g.moveTo(-w * 0.5, 0);
      g.lineTo(-w * 0.36, -h * 0.62);
      g.lineTo(-w * 0.04, -h);
      g.lineTo(w * 0.32, -h * 0.7);
      g.lineTo(w * 0.5, 0);
      g.closePath();
      g.fillStyle = "#9aa2ad";
      g.fill();
      g.beginPath();
      g.moveTo(-w * 0.04, -h);
      g.lineTo(w * 0.32, -h * 0.7);
      g.lineTo(w * 0.5, 0);
      g.lineTo(w * 0.06, -h * 0.16);
      g.closePath();
      g.fillStyle = "#7d8590";
      g.fill();
      dot(g, -w * 0.2, -h * 0.55, h * 0.08, "rgba(255,255,255,0.35)");
    },
    mushroom(g, w, h, scene) {
      roundRect(g, -w * 0.14, -h * 0.62, w * 0.28, h * 0.62, w * 0.1, "#f4ead8");
      g.beginPath();
      g.moveTo(-w * 0.5, -h * 0.55);
      g.quadraticCurveTo(0, -h * 1.24, w * 0.5, -h * 0.55);
      g.closePath();
      g.fillStyle = "#e0563f";
      g.fill();
      dot(g, -w * 0.16, -h * 0.74, w * 0.09, "#fff2e6");
      dot(g, w * 0.18, -h * 0.68, w * 0.07, "#fff2e6");
      dot(g, w * 0.02, -h * 0.92, w * 0.06, "#fff2e6");
    },
    log(g, w, h, scene) {
      roundRect(g, -w * 0.5, -h, w, h, h * 0.42, "#8a5a3b");
      oval(g, -w * 0.44, -h * 0.5, h * 0.2, h * 0.44, 0, "#b7825c");
      oval(g, -w * 0.44, -h * 0.5, h * 0.1, h * 0.24, 0, "#7a4a2c");
      limb(g, -w * 0.1, -h * 0.72, w * 0.34, -h * 0.68, h * 0.08, "#7a4a2c");
    },
    stump(g, w, h, scene) {
      roundRect(g, -w * 0.42, -h, w * 0.84, h, w * 0.12, "#8a5a3b");
      oval(g, 0, -h, w * 0.42, h * 0.16, 0, "#c08c60");
      oval(g, 0, -h, w * 0.2, h * 0.08, 0, "#9c6b42");
      dot(g, w * 0.44, -h * 0.3, w * 0.14, scene.decoColor);
    },
    reed(g, w, h, scene) {
      for (let i = -1; i <= 1; i += 1) {
        const x = i * w * 0.3;
        curve(g, x, 0, x + i * w * 0.16, -h * 0.6, x + i * w * 0.24, -h, w * 0.11, scene.decoColor);
        oval(g, x + i * w * 0.24, -h * 0.94, w * 0.12, h * 0.13, 0, "#8a6a3f");
      }
    },
    ice(g, w, h, scene) {
      g.beginPath();
      g.moveTo(-w * 0.46, 0);
      g.lineTo(-w * 0.3, -h * 0.9);
      g.lineTo(w * 0.1, -h);
      g.lineTo(w * 0.46, -h * 0.5);
      g.lineTo(w * 0.42, 0);
      g.closePath();
      g.fillStyle = "#bfe6fb";
      g.fill();
      g.beginPath();
      g.moveTo(w * 0.1, -h);
      g.lineTo(w * 0.46, -h * 0.5);
      g.lineTo(w * 0.42, 0);
      g.lineTo(w * 0.06, -h * 0.2);
      g.closePath();
      g.fillStyle = "#93cdea";
      g.fill();
      limb(g, -w * 0.2, -h * 0.72, w * 0.02, -h * 0.34, w * 0.06, "rgba(255,255,255,0.75)");
    },
    bale(g, w, h, scene) {
      roundRect(g, -w * 0.5, -h, w, h, h * 0.24, "#e0bb63");
      for (let i = 0; i < 3; i += 1) {
        limb(g, -w * 0.5, -h * (0.25 + i * 0.25), w * 0.5, -h * (0.25 + i * 0.25), h * 0.045, "#c19b3c");
      }
      limb(g, -w * 0.18, -h, -w * 0.18, 0, h * 0.05, "#a9832f");
    },
    crate(g, w, h, scene) {
      roundRect(g, -w * 0.5, -h, w, h, w * 0.08, "#c08c52");
      limb(g, -w * 0.44, -h * 0.94, w * 0.44, -h * 0.06, h * 0.07, "#9c6b3c");
      limb(g, w * 0.44, -h * 0.94, -w * 0.44, -h * 0.06, h * 0.07, "#9c6b3c");
      roundRect(g, -w * 0.5, -h, w, h * 0.14, w * 0.05, "#9c6b3c");
    },
    pine(g, w, h, scene) {
      roundRect(g, -w * 0.09, -h * 0.3, w * 0.18, h * 0.3, w * 0.05, "#7a5334");
      for (let i = 0; i < 3; i += 1) {
        const t = i / 3;
        const cy = -h * (0.28 + t * 0.52);
        const cw = w * (0.5 - t * 0.13);
        triangle(g, -cw, cy, cw, cy, 0, cy - h * 0.34, i === 2 ? scene.decoColor : "#3f7d52");
      }
      dot(g, 0, -h * 0.96, w * 0.06, "#ffffff");
    },
    bamboo(g, w, h, scene) {
      roundRect(g, -w * 0.3, -h, w * 0.6, h, w * 0.24, "#7cc45c");
      for (let i = 1; i < 4; i += 1) {
        limb(g, -w * 0.3, -h * (i / 4), w * 0.3, -h * (i / 4), h * 0.035, "#5da33f");
      }
      oval(g, w * 0.42, -h * 0.78, w * 0.36, w * 0.12, -0.4, "#8fd06a");
      oval(g, -w * 0.42, -h * 0.56, w * 0.34, w * 0.11, 0.4, "#8fd06a");
    },
  };

  // ---------------------------------------------------------------------------
  // Level-Aufbau (deterministisch – jedes Level sieht immer gleich aus,
  // damit Kinder es lernen und üben können)
  // ---------------------------------------------------------------------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function random() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const GRAVITY = 2300;
  const JUMP_SPEED = 800;
  const JUMP_CUT = 0.46;      // Loslassen bremst den Sprung ab
  const JUMP_APEX = (JUMP_SPEED * JUMP_SPEED) / (2 * GRAVITY);
  const AIR_TIME = (2 * JUMP_SPEED) / GRAVITY;
  const RUN_IN = 820;         // Anlauf ohne Hindernisse
  const RUN_OUT = 640;        // Auslauf vor der Ziellinie

  function speedAt(level, x) {
    const t = clamp(x / level.length, 0, 1);
    return mix(level.speed, level.speedEnd, t);
  }

  function buildLevel(level) {
    const random = mulberry32(level.id * 7919 + 13);
    const scene = SCENES[level.scene];
    const obstacles = [];
    const treats = [];
    const pick = (list) => list[Math.floor(random() * list.length) % list.length];
    const between = (lo, hi) => lo + random() * (hi - lo);

    function makeObstacle(heightScale) {
      const type = pick(scene.obstacles);
      const spec = OBSTACLES[type] || OBSTACLES.rock;
      const h = between(level.height[0], level.height[1]) * spec.scale * (heightScale || 1);
      return { type, h, w: h * spec.ratio };
    }
    // Hindernisse werden über ihre linke Kante gesetzt, damit Lücken wirklich
    // Lücken sind und nicht von breiten Hindernissen aufgefressen werden.
    function place(shape, leftEdge) {
      const obstacle = { x: leftEdge + shape.w / 2, w: shape.w, h: shape.h, type: shape.type };
      obstacles.push(obstacle);
      return obstacle;
    }

    // Bogen aus Leckerbissen über einem Hindernis: hoch genug zum Drüberfliegen,
    // seitlich nur so weit, dass er im Sprung noch erreichbar ist und nicht im
    // Hindernis steckt.
    function addArc(centerX, peak, blockW, blockH, speed) {
      const lift = Math.max(peak, blockH + 42);
      const reach = AIR_TIME * speed * 0.36;
      const spread = Math.min(reach, Math.max(58, blockW * 0.5 + 26));
      treats.push({ x: centerX, y: lift, taken: false });
      if (spread > blockW * 0.5 + 18) {
        treats.push({ x: centerX - spread, y: lift - 26, taken: false });
        treats.push({ x: centerX + spread, y: lift - 26, taken: false });
      }
    }

    let cursor = RUN_IN;                     // linke Kante des nächsten Hindernisses
    const finish = level.length - RUN_OUT;
    let sinceTreatLine = 0;

    while (cursor < finish) {
      const speed = speedAt(level, cursor);
      const airSpan = AIR_TIME * speed;      // Weite eines vollen Sprungs
      const wantsDouble = random() < level.doubles && cursor < finish - 400;
      // Doppelhindernisse sind bewusst flacher – zwei niedrige Hürden bleiben
      // in einem Sprung schaffbar, zwei hohe nicht.
      const blockStart = cursor;
      const first = place(makeObstacle(wantsDouble ? 0.66 : 1), cursor);
      let blockEnd = first.x + first.w / 2;
      let blockHeight = first.h;

      if (wantsDouble) {
        const shape = makeObstacle(0.66);
        const inner = between(26, 50);
        const blockWidth = (blockEnd + inner + shape.w) - blockStart;
        // Nur setzen, wenn der ganze Block in einen Sprung passt.
        if (blockWidth * 0.78 + 64 <= airSpan * 0.8) {
          const second = place(shape, blockEnd + inner);
          blockEnd = second.x + second.w / 2;
          blockHeight = Math.max(blockHeight, second.h);
        }
      }

      if (random() < 0.62) {
        addArc((blockStart + blockEnd) / 2, JUMP_APEX * between(0.62, 0.85),
          blockEnd - blockStart, blockHeight, speed);
      }

      // Die Lücke zählt von Kante zu Kante. Die Untergrenze lässt immer genug
      // Bodenzeit, um wieder abspringen zu können.
      const gapSeconds = between(level.gap[0], level.gap[1]) * (blockEnd > first.x + first.w / 2 ? 1.15 : 1);
      const gapDistance = Math.max(airSpan * 1.25, gapSeconds * speed);

      // Leckerbissen auf Laufhöhe mittig in die freie Lücke legen.
      sinceTreatLine += 1;
      const from = blockEnd + 46;
      const to = blockEnd + gapDistance - 120;
      const span = to - from;
      if (sinceTreatLine >= 2 && span > 60 && random() < 0.72) {
        sinceTreatLine = 0;
        const count = clamp(Math.floor(span / 54) + 1, 2, 5);
        const startX = from + (span - (count - 1) * 54) / 2;
        for (let i = 0; i < count; i += 1) {
          treats.push({ x: startX + i * 54, y: 26, taken: false });
        }
      }

      cursor = blockEnd + gapDistance;
    }

    // Ein paar Leckerbissen im Anlauf, damit sofort etwas zu holen ist.
    for (let i = 0; i < 4; i += 1) {
      treats.push({ x: 300 + i * 56, y: 26, taken: false });
    }

    treats.sort((a, b) => a.x - b.x);
    obstacles.sort((a, b) => a.x - b.x);
    return { obstacles, treats, scene, finish: level.length };
  }

  // ---------------------------------------------------------------------------
  // Ansicht: Canvas füllt den Bildschirm, die Welt hat eine feste Breite,
  // damit das Spiel auf jedem Gerät gleich schwer ist.
  // ---------------------------------------------------------------------------
  const VIEW_W = 460;   // gewünschte sichtbare Weltbreite
  // Vertikal muss immer Platz für Boden + Sprunghöhe + Tier bleiben, sonst
  // springt man im Querformat oben aus dem Bild.
  const MIN_VIEW_H = 380;
  const view = { w: VIEW_W, h: MIN_VIEW_H, groundY: 250, scale: 1, dpr: 1 };
  const playerX = () => view.w * 0.26;

  function resizeCanvas() {
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
    const cssW = Math.max(240, stage.clientWidth || window.innerWidth);
    const cssH = Math.max(200, stage.clientHeight || window.innerHeight);
    const scale = Math.max(0.05, Math.min(cssW / VIEW_W, cssH / MIN_VIEW_H));

    view.scale = scale;
    view.dpr = dpr;
    view.w = cssW / scale;
    view.h = cssH / scale;
    view.groundY = view.h - clamp(view.h * 0.26, 86, 210);

    const pixelW = Math.round(cssW * dpr);
    const pixelH = Math.round(cssH * dpr);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
  }

  function applyWorldTransform(g) {
    const factor = view.scale * view.dpr;
    g.setTransform(factor, 0, 0, factor, 0, 0);
  }

  // ---------------------------------------------------------------------------
  // Landschaft
  // ---------------------------------------------------------------------------
  function hash01(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function drawCloud(g, x, y, r) {
    g.fillStyle = "rgba(255, 255, 255, 0.85)";
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.arc(x + r * 0.85, y - r * 0.28, r * 0.76, 0, TAU);
    g.arc(x + r * 1.7, y + r * 0.06, r * 0.6, 0, TAU);
    g.arc(x + r * 0.8, y + r * 0.4, r * 0.7, 0, TAU);
    g.fill();
  }

  const DECO_ART = {
    tree(g, x, baseY, s, scene) {
      roundRect(g, x - s * 0.07, baseY - s * 0.42, s * 0.14, s * 0.42, s * 0.05, scene.decoTrunk);
      dot(g, x, baseY - s * 0.62, s * 0.3, scene.decoColor);
      dot(g, x - s * 0.24, baseY - s * 0.48, s * 0.22, scene.decoColor);
      dot(g, x + s * 0.24, baseY - s * 0.5, s * 0.23, scene.decoColor);
    },
    pine(g, x, baseY, s, scene) {
      roundRect(g, x - s * 0.05, baseY - s * 0.22, s * 0.1, s * 0.22, s * 0.03, scene.decoTrunk);
      for (let i = 0; i < 3; i += 1) {
        const t = i / 3;
        const cy = baseY - s * (0.2 + t * 0.42);
        const cw = s * (0.28 - t * 0.07);
        triangle(g, x - cw, cy, x + cw, cy, x, cy - s * 0.3, scene.decoColor);
      }
    },
    bamboo(g, x, baseY, s, scene) {
      for (let i = -1; i <= 1; i += 1) {
        const bx = x + i * s * 0.14;
        const bh = s * (0.6 + hash01(x + i) * 0.3);
        roundRect(g, bx - s * 0.035, baseY - bh, s * 0.07, bh, s * 0.03, scene.decoColor);
        oval(g, bx + s * 0.12, baseY - bh * 0.82, s * 0.13, s * 0.035, -0.4, scene.decoTrunk);
      }
    },
    reed(g, x, baseY, s, scene) {
      for (let i = -1; i <= 1; i += 1) {
        curve(g, x + i * s * 0.1, baseY, x + i * s * 0.16, baseY - s * 0.3,
          x + i * s * 0.24, baseY - s * 0.52, s * 0.045, scene.decoColor);
      }
    },
    wheat(g, x, baseY, s, scene) {
      for (let i = -1; i <= 1; i += 1) {
        const bx = x + i * s * 0.11;
        limb(g, bx, baseY, bx + i * s * 0.05, baseY - s * 0.4, s * 0.03, scene.decoTrunk);
        oval(g, bx + i * s * 0.05, baseY - s * 0.46, s * 0.05, s * 0.11, i * 0.16, scene.decoColor);
      }
    },
    acacia(g, x, baseY, s, scene) {
      limb(g, x, baseY, x, baseY - s * 0.4, s * 0.06, scene.decoTrunk);
      limb(g, x, baseY - s * 0.34, x - s * 0.16, baseY - s * 0.48, s * 0.04, scene.decoTrunk);
      limb(g, x, baseY - s * 0.34, x + s * 0.16, baseY - s * 0.48, s * 0.04, scene.decoTrunk);
      oval(g, x, baseY - s * 0.54, s * 0.34, s * 0.12, 0, scene.decoColor);
      oval(g, x - s * 0.18, baseY - s * 0.46, s * 0.16, s * 0.08, 0, scene.decoColor);
    },
    palm(g, x, baseY, s, scene) {
      curve(g, x, baseY, x + s * 0.06, baseY - s * 0.3, x + s * 0.12, baseY - s * 0.56, s * 0.06, scene.decoTrunk);
      const top = { x: x + s * 0.12, y: baseY - s * 0.56 };
      for (let i = -2; i <= 2; i += 1) {
        oval(g, top.x + i * s * 0.11, top.y - s * 0.03 + Math.abs(i) * s * 0.03,
          s * 0.17, s * 0.05, i * 0.3, scene.decoColor);
      }
      dot(g, top.x, top.y + s * 0.04, s * 0.035, "#8a5a3b");
    },
  };

  function drawScenery(g, scene, scroll, reduced) {
    const { w, h, groundY } = view;
    const skyH = groundY;
    const bandH = h - groundY;

    const sky = g.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, scene.sky[0]);
    sky.addColorStop(1, scene.sky[1]);
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);

    // Sonne
    const sunX = w * 0.74;
    const sunY = clamp(skyH * 0.16, 38, 150);
    const sunR = clamp(skyH * 0.085, 18, 38);
    g.fillStyle = "rgba(255, 255, 255, 0.26)";
    g.beginPath();
    g.arc(sunX, sunY, sunR * 1.75, 0, TAU);
    g.fill();
    dot(g, sunX, sunY, sunR, scene.sun);

    // Wolken – bei hohem Himmel (Hochformat) in zwei Bändern, damit oben
    // nicht nur leere Fläche steht.
    const cloudRows = skyH > 420 ? 2 : 1;
    const cloudSpacing = 260;
    const cloudCount = Math.ceil(w / cloudSpacing) + 3;
    for (let row = 0; row < cloudRows; row += 1) {
      const cloudScroll = scroll * (0.06 + row * 0.03);
      const first = Math.floor(cloudScroll / cloudSpacing) - 1;
      const top = row === 0 ? 0.05 : 0.42;
      for (let i = first; i < first + cloudCount; i += 1) {
        const seed = i * 3.1 + row * 17.3;
        const x = i * cloudSpacing - cloudScroll + hash01(seed) * 120;
        const y = skyH * (top + hash01(seed + 1.9) * 0.3);
        drawCloud(g, x, y, 18 + hash01(seed + 4.4) * 22);
      }
    }

    // Ferne Hügel – wachsen mit der Himmelshöhe mit.
    const farAmp = clamp(skyH * 0.22, 36, 170);
    g.beginPath();
    g.moveTo(0, groundY + 2);
    for (let x = 0; x <= w + 8; x += 8) {
      const wx = x + scroll * 0.2;
      const y = groundY - (farAmp * 0.5 + Math.sin(wx * 0.0042) * farAmp * 0.24
        + Math.sin(wx * 0.0011) * farAmp * 0.34);
      g.lineTo(x, y);
    }
    g.lineTo(w, groundY + 2);
    g.closePath();
    g.fillStyle = scene.hillFar;
    g.fill();

    // Bäume & Co. stehen auf der Hügellinie, nicht in der Laufbahn.
    const nearAmp = clamp(skyH * 0.15, 34, 96);
    const decoArt = DECO_ART[scene.deco] || DECO_ART.tree;
    const decoBase = groundY - nearAmp * 0.33;
    const decoSize = clamp(skyH * 0.17, 72, 168);
    const decoSpacing = 170;
    const decoScroll = scroll * 0.36;
    const decoStart = Math.floor(decoScroll / decoSpacing) - 1;
    const decoCount = Math.ceil(w / decoSpacing) + 3;
    g.save();
    g.globalAlpha = 0.88;
    for (let i = decoStart; i < decoStart + decoCount; i += 1) {
      const x = i * decoSpacing - decoScroll + hash01(i * 1.7) * 80;
      decoArt(g, x, decoBase, decoSize * (0.8 + hash01(i * 9.2) * 0.4), scene);
    }
    g.restore();

    // Nahe Hügel verdecken die Baumstämme – so wirkt der Hintergrund tief.
    g.beginPath();
    g.moveTo(0, groundY + 2);
    for (let x = 0; x <= w + 8; x += 8) {
      const wx = x + scroll * 0.42;
      const y = groundY - (nearAmp * 0.68 + Math.sin(wx * 0.0068 + 1.3) * nearAmp * 0.16
        + Math.sin(wx * 0.0021) * nearAmp * 0.16);
      g.lineTo(x, y);
    }
    g.lineTo(w, groundY + 2);
    g.closePath();
    g.fillStyle = scene.hillNear;
    g.fill();

    // Bodenband: oben Wiese, unten Erde.
    g.fillStyle = scene.ground;
    g.fillRect(0, groundY, w, bandH);
    g.fillStyle = scene.groundDark;
    g.fillRect(0, groundY + bandH * 0.4, w, bandH * 0.6);
    g.fillStyle = scene.soil;
    g.fillRect(0, groundY + bandH * 0.68, w, bandH * 0.32);
    g.fillStyle = "rgba(255, 255, 255, 0.2)";
    g.fillRect(0, groundY, w, 3);

    // Grasbüschel, Kiesel und Erdsprenkel
    const tuftSpacing = 42;
    const tuftStart = Math.floor(scroll / tuftSpacing) - 1;
    const tuftCount = Math.ceil(w / tuftSpacing) + 3;
    for (let i = tuftStart; i < tuftStart + tuftCount; i += 1) {
      const x = i * tuftSpacing - scroll + hash01(i * 2.3) * 28;
      const r = hash01(i * 4.9);
      if (r < 0.44) {
        for (let k = -1; k <= 1; k += 1) {
          limb(g, x, groundY + 5, x + k * 4, groundY - 5 - hash01(i + k) * 5, 2.2, scene.hillNear);
        }
      } else if (r < 0.62) {
        oval(g, x, groundY + bandH * 0.2, 5, 2.2, 0, scene.groundDark);
      }
      if (r > 0.7) {
        oval(g, x + 12, groundY + bandH * (0.5 + hash01(i * 6.1) * 0.32), 7, 2.4, 0, "rgba(0, 0, 0, 0.08)");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Töne (respektiert den globalen Ton-Schalter der Lernapp)
  // ---------------------------------------------------------------------------
  const AUDIO_KEY = "lernapp.audioFeedback";
  let audioContext = null;

  function audioAllowed() {
    try {
      const setting = localStorage.getItem(AUDIO_KEY);
      return setting !== "0" && setting !== "false" && setting !== "off";
    } catch { return true; }
  }

  function ensureAudio() {
    if (!audioAllowed()) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      if (!audioContext) audioContext = new AC();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      return audioContext;
    } catch { return null; }
  }

  function tone(freq, delay, duration, type = "triangle", volume = 0.05, endFreq = 0) {
    const ac = ensureAudio();
    if (!ac) return;
    try {
      const start = ac.currentTime + delay;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + duration + 0.04);
    } catch { /* ignore */ }
  }

  const soundJump = () => tone(360, 0, 0.16, "triangle", 0.045, 720);
  const soundLand = () => tone(180, 0, 0.08, "sine", 0.03);
  const soundTreat = (combo) => tone(620 + Math.min(combo, 9) * 62, 0, 0.14, "triangle", 0.05);
  const soundHit = () => { tone(200, 0, 0.22, "sawtooth", 0.045, 90); tone(120, 0.03, 0.22, "square", 0.03, 60); };
  const soundFinish = () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.24, "triangle", 0.055));
  const soundFail = () => [420, 340, 260].forEach((f, i) => tone(f, i * 0.14, 0.24, "sine", 0.045));

  // ---------------------------------------------------------------------------
  // Spielzustand
  // ---------------------------------------------------------------------------
  const COYOTE_TIME = 0.1;
  const JUMP_BUFFER = 0.15;
  const INVULN_TIME = 1.15;
  const STUMBLE_TIME = 0.42;
  const MAX_HEARTS = 3;
  const STEP = 1 / 120;

  const game = {
    running: false, paused: false, over: false,
    level: null, animal: null, world: null,
    dist: 0, y: 0, vy: 0, onGround: true,
    coyote: 0, buffer: 0, holding: false,
    run: 0, squash: 0, blink: 0, blinkTimer: 2,
    hearts: MAX_HEARTS, invuln: 0, stumble: 0,
    treats: 0, treatTotal: 0, combo: 0, bestCombo: 0,
    particles: [], floats: [], shake: 0, speed: 0,
    accumulator: 0, lastFrame: 0, raf: 0, reduced: false,
  };

  function spawnParticles(x, y, count, color, spread, kind) {
    if (game.reduced) return;
    for (let i = 0; i < count; i += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const speed = 40 + Math.random() * 130;
      game.particles.push({
        x, y,
        vx: Math.cos(angle) * speed - (kind === "dust" ? 60 : 0),
        vy: Math.sin(angle) * speed,
        life: 0, max: 0.4 + Math.random() * 0.4,
        r: 2 + Math.random() * 3.5,
        color, kind: kind || "spark",
      });
    }
  }

  function addFloat(x, y, text, color) {
    game.floats.push({ x, y, text, color, life: 0, max: 0.8 });
  }

  function resetRun(level) {
    const animal = ANIMALS[level.animal];
    game.level = level;
    game.animal = animal;
    game.world = buildLevel(level);
    game.dist = 0;
    game.y = 0;
    game.vy = 0;
    game.onGround = true;
    game.coyote = COYOTE_TIME;
    game.buffer = 0;
    game.holding = false;
    game.run = 0;
    game.squash = 0;
    game.blink = 0;
    game.blinkTimer = 1.5 + Math.random() * 2;
    game.hearts = MAX_HEARTS;
    game.invuln = 0;
    game.stumble = 0;
    game.treats = 0;
    game.treatTotal = game.world.treats.length;
    game.combo = 0;
    game.bestCombo = 0;
    game.particles = [];
    game.floats = [];
    game.shake = 0;
    game.speed = level.speed;
    game.over = false;
    game.paused = false;
    game.accumulator = 0;
    game.reduced = kids.prefersReducedMotion();
  }

  function requestJump() {
    if (!game.running || game.paused || game.over) return;
    game.buffer = JUMP_BUFFER;
    game.holding = true;
  }

  function releaseJump() { game.holding = false; }

  function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function takeHit() {
    game.hearts -= 1;
    game.invuln = INVULN_TIME;
    game.stumble = STUMBLE_TIME;
    game.combo = 0;
    game.shake = 0.32;
    soundHit();
    kids.vibrate([50, 40, 50]);
    const size = game.animal.size;
    spawnParticles(playerX(), view.groundY - game.y - size * 0.5, 12, "#ff8fa3", 3.2, "spark");
    addFloat(playerX(), view.groundY - game.y - size * 0.9, "Autsch!", "#ff5d7a");
    if (game.hearts <= 0) finishRun(false);
  }

  function step(dt) {
    const level = game.level;
    const animal = game.animal;

    game.speed = speedAt(level, game.dist) * (game.stumble > 0 ? 0.55 : 1);
    game.dist += game.speed * dt;

    // Sprung-Eingabe mit Coyote-Zeit und Puffer – verzeiht zu frühes
    // und zu spätes Tippen.
    game.buffer = Math.max(0, game.buffer - dt);
    game.coyote = game.onGround ? COYOTE_TIME : Math.max(0, game.coyote - dt);
    if (game.buffer > 0 && game.coyote > 0) {
      game.vy = JUMP_SPEED;
      game.onGround = false;
      game.coyote = 0;
      game.buffer = 0;
      game.squash = 0.4;
      soundJump();
      spawnParticles(playerX(), view.groundY, 6, "rgba(255,255,255,0.75)", 1.6, "dust");
    }

    if (!game.onGround) {
      if (!game.holding && game.vy > JUMP_SPEED * JUMP_CUT) game.vy = JUMP_SPEED * JUMP_CUT;
      game.vy -= GRAVITY * dt;
      game.y += game.vy * dt;
      if (game.y <= 0) {
        game.y = 0;
        game.vy = 0;
        game.onGround = true;
        game.squash = -0.42;
        soundLand();
        spawnParticles(playerX(), view.groundY, 7, "rgba(255,255,255,0.7)", 2.4, "dust");
      }
    }

    game.run += (game.speed / 70) * TAU * dt;
    game.squash += (0 - game.squash) * Math.min(1, dt * 11);
    game.invuln = Math.max(0, game.invuln - dt);
    game.stumble = Math.max(0, game.stumble - dt);
    game.shake = Math.max(0, game.shake - dt);

    game.blinkTimer -= dt;
    if (game.blinkTimer <= 0) { game.blink = 1; game.blinkTimer = 1.8 + Math.random() * 3; }
    if (game.blink > 0) game.blink = Math.max(0, game.blink - dt * 7);

    // Kollisionen – Trefferflächen sind bewusst kleiner als die Grafik.
    const size = animal.size;
    const halfW = size * 0.28;
    const bodyBottom = game.y + size * 0.1;
    const bodyTop = game.y + size * 0.78;
    if (game.invuln <= 0) {
      for (const obstacle of game.world.obstacles) {
        if (obstacle.x + obstacle.w < game.dist - 200) continue;
        if (obstacle.x - obstacle.w > game.dist + 200) break;
        const ow = obstacle.w * 0.78;
        if (overlaps(game.dist - halfW, bodyBottom, halfW * 2, bodyTop - bodyBottom,
          obstacle.x - ow / 2, 0, ow, obstacle.h * 0.86)) {
          takeHit();
          break;
        }
      }
    }

    // Leckerbissen einsammeln
    const reach = size * 0.42 + 20;
    const centerY = game.y + size * 0.45;
    for (const treat of game.world.treats) {
      if (treat.taken) continue;
      if (treat.x < game.dist - reach) continue;
      if (treat.x > game.dist + reach) break;
      if (Math.hypot(treat.x - game.dist, treat.y - centerY) <= reach) {
        treat.taken = true;
        game.treats += 1;
        game.combo += 1;
        game.bestCombo = Math.max(game.bestCombo, game.combo);
        soundTreat(game.combo);
        spawnParticles(playerX() + (treat.x - game.dist), view.groundY - treat.y, 5, "#ffd166", 2.6, "spark");
        if (game.combo > 0 && game.combo % 5 === 0) {
          addFloat(playerX(), view.groundY - treat.y - 24, `${game.combo}x!`, "#ff9f1c");
        }
      }
    }

    // Partikel & Zahlen
    for (let i = game.particles.length - 1; i >= 0; i -= 1) {
      const p = game.particles[i];
      p.life += dt;
      if (p.life >= p.max) { game.particles.splice(i, 1); continue; }
      p.x += (p.vx - game.speed * (p.kind === "dust" ? 1 : 0.35)) * dt;
      p.y += p.vy * dt;
      p.vy += (p.kind === "dust" ? 90 : 320) * dt;
    }
    for (let i = game.floats.length - 1; i >= 0; i -= 1) {
      const f = game.floats[i];
      f.life += dt;
      if (f.life >= f.max) game.floats.splice(i, 1);
      else f.y -= 42 * dt;
    }

    if (game.dist >= level.length) finishRun(true);
  }

  // ---------------------------------------------------------------------------
  // Rendern
  // ---------------------------------------------------------------------------
  const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", system-ui, sans-serif';

  function drawTreat(g, x, y, emoji, time) {
    const bob = Math.sin(time * 3.2 + x * 0.02) * 3;
    const cy = y + bob;
    g.save();
    g.globalAlpha = 0.35;
    dot(g, x, cy, 17, "#fff3c4");
    g.globalAlpha = 0.9;
    dot(g, x, cy, 13, "#ffe9a3");
    g.restore();
    g.font = `20px ${EMOJI_FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#7a5320";
    g.fillText(emoji, x, cy + 1);
  }

  function drawFinishLine(g, x, groundY) {
    const height = 118;
    limb(g, x - 34, groundY, x - 34, groundY - height, 6, "#ffffff");
    limb(g, x + 34, groundY, x + 34, groundY - height, 6, "#ffffff");
    const bannerH = 34;
    const bannerY = groundY - height;
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        g.fillStyle = (row + col) % 2 === 0 ? "#2f3b52" : "#ffffff";
        g.fillRect(x - 36 + col * 12, bannerY + row * (bannerH / 2), 12, bannerH / 2);
      }
    }
    g.font = "700 15px Inter, system-ui, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#2f3b52";
    g.fillText("ZIEL", x, bannerY + bannerH + 16);
  }

  function drawPlayer(g, screenX, groundY) {
    const animal = game.animal;
    const size = animal.size;
    const heightFactor = clamp(1 - game.y / 260, 0.32, 1);
    g.save();
    g.globalAlpha = 0.2 * heightFactor;
    oval(g, screenX, groundY + 4, size * 0.34 * heightFactor, size * 0.1 * heightFactor, 0, "#1d2b3a");
    g.restore();

    g.save();
    g.translate(screenX, groundY - game.y);
    if (game.invuln > 0 && Math.floor(game.invuln * 14) % 2 === 0) g.globalAlpha = 0.4;
    drawAnimal(g, animal, size, {
      run: game.run,
      air: game.onGround ? 0 : 1,
      squash: game.squash,
      blink: game.blink,
      tilt: clamp(-game.vy / 5200, -0.14, 0.14),
    });
    g.restore();
  }

  function render() {
    const g = ctx;
    const world = game.world;
    if (!world) return;
    applyWorldTransform(g);

    g.save();
    if (game.shake > 0 && !game.reduced) {
      g.translate((Math.random() - 0.5) * game.shake * 20, (Math.random() - 0.5) * game.shake * 14);
    }

    const scene = world.scene;
    const groundY = view.groundY;
    drawScenery(g, scene, game.dist, game.reduced);

    const offset = playerX() - game.dist;
    const leftEdge = game.dist - playerX() - 80;
    const rightEdge = game.dist + view.w;

    for (const obstacle of world.obstacles) {
      if (obstacle.x + obstacle.w < leftEdge) continue;
      if (obstacle.x - obstacle.w > rightEdge) break;
      const sx = obstacle.x + offset;
      g.save();
      g.globalAlpha = 0.18;
      oval(g, sx, groundY + 4, obstacle.w * 0.44, obstacle.h * 0.1, 0, "#1d2b3a");
      g.restore();
      g.save();
      g.translate(sx, groundY);
      (OBSTACLE_ART[obstacle.type] || OBSTACLE_ART.rock)(g, obstacle.w, obstacle.h, scene);
      g.restore();
    }

    for (const treat of world.treats) {
      if (treat.taken) continue;
      if (treat.x < leftEdge) continue;
      if (treat.x > rightEdge) break;
      drawTreat(g, treat.x + offset, groundY - treat.y, game.level.treat, game.run * 0.2);
    }

    if (game.level.length + offset < view.w + 80) {
      drawFinishLine(g, game.level.length + offset, groundY);
    }

    drawPlayer(g, playerX(), groundY);

    for (const p of game.particles) {
      const t = 1 - p.life / p.max;
      g.save();
      g.globalAlpha = clamp(t, 0, 1);
      dot(g, p.x, p.y, p.r * t, p.color);
      g.restore();
    }

    g.font = "800 17px Inter, system-ui, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const f of game.floats) {
      const t = 1 - f.life / f.max;
      g.save();
      g.globalAlpha = clamp(t, 0, 1);
      g.fillStyle = "#ffffff";
      g.lineWidth = 4;
      g.strokeStyle = "rgba(45, 30, 20, 0.45)";
      g.strokeText(f.text, f.x, f.y);
      g.fillStyle = f.color;
      g.fillText(f.text, f.x, f.y);
      g.restore();
    }

    g.restore();
  }

  // ---------------------------------------------------------------------------
  // Schleife
  // ---------------------------------------------------------------------------
  function frame(timestamp) {
    game.raf = window.requestAnimationFrame(frame);
    if (!game.running) return;

    const last = game.lastFrame || timestamp;
    game.lastFrame = timestamp;
    if (game.paused || game.over) { render(); syncHud(); return; }

    // Bei Tab-Wechseln nicht mehrere Sekunden auf einmal simulieren.
    const delta = Math.min(0.1, (timestamp - last) / 1000);
    game.accumulator += delta;
    let guard = 0;
    while (game.accumulator >= STEP && guard < 24) {
      game.accumulator -= STEP;
      guard += 1;
      step(STEP);
      if (game.over) break;
    }
    render();
    syncHud();
  }

  function startLoop() {
    if (game.raf) return;
    game.lastFrame = 0;
    game.raf = window.requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (!game.raf) return;
    window.cancelAnimationFrame(game.raf);
    game.raf = 0;
  }

  // ---------------------------------------------------------------------------
  // HUD
  // ---------------------------------------------------------------------------
  const hud = {
    hearts: document.getElementById("runner-hearts"),
    treatIcon: document.getElementById("runner-treat-icon"),
    treatCount: document.getElementById("runner-treat-count"),
    progressFill: document.getElementById("runner-progress-fill"),
    progressMarker: document.getElementById("runner-progress-marker"),
    levelLabel: document.getElementById("runner-level-label"),
    overlay: document.getElementById("runner-overlay"),
    pauseButton: document.getElementById("runner-pause"),
    fullscreenButton: document.getElementById("runner-fullscreen"),
    quitButton: document.getElementById("runner-quit"),
  };

  let shownHearts = -1;
  let shownTreats = -1;

  function syncHud() {
    if (game.hearts !== shownHearts && hud.hearts) {
      shownHearts = game.hearts;
      hud.hearts.innerHTML = "";
      for (let i = 0; i < MAX_HEARTS; i += 1) {
        const heart = document.createElement("span");
        heart.className = `runner-heart${i < game.hearts ? "" : " lost"}`;
        heart.textContent = i < game.hearts ? "❤️" : "🤍";
        hud.hearts.append(heart);
      }
      hud.hearts.setAttribute("aria-label", `${game.hearts} von ${MAX_HEARTS} Leben`);
    }
    if (game.treats !== shownTreats && hud.treatCount) {
      shownTreats = game.treats;
      hud.treatCount.textContent = `${game.treats}`;
    }
    if (hud.progressFill) {
      const pct = clamp((game.dist / game.level.length) * 100, 0, 100);
      hud.progressFill.style.width = `${pct}%`;
      if (hud.progressMarker) hud.progressMarker.style.left = `${pct}%`;
    }
  }

  // ---------------------------------------------------------------------------
  // Vollbild & Bildschirm-Wachhalten (beides nur "wenn es geht")
  // ---------------------------------------------------------------------------
  let wakeLock = null;

  async function requestWakeLock() {
    try {
      if (!("wakeLock" in navigator) || wakeLock) return;
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => { wakeLock = null; });
    } catch { wakeLock = null; }
  }

  function releaseWakeLock() {
    try { wakeLock?.release?.(); } catch { /* ignore */ }
    wakeLock = null;
  }

  function fullscreenActive() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function toggleFullscreen() {
    try {
      if (fullscreenActive()) {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      } else {
        const el = document.documentElement;
        (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
      }
    } catch { /* ignore */ }
  }

  function updateFullscreenButton() {
    if (!hud.fullscreenButton) return;
    const active = fullscreenActive();
    hud.fullscreenButton.textContent = active ? "⤡" : "⛶";
    hud.fullscreenButton.setAttribute("aria-label", active ? "Vollbild verlassen" : "Vollbild");
    hud.fullscreenButton.title = active ? "Vollbild verlassen" : "Vollbild";
  }

  // ---------------------------------------------------------------------------
  // Overlays im Spiel (Pause, geschafft, verloren)
  // ---------------------------------------------------------------------------
  function starRow(stars) {
    return `<div class="runner-stars" aria-label="${stars} von 3 Sternen">${
      [0, 1, 2].map((i) => `<span class="runner-star${i < stars ? " filled" : ""}" style="--i:${i}">★</span>`).join("")
    }</div>`;
  }

  function closeOverlay() {
    if (!hud.overlay) return;
    hud.overlay.hidden = true;
    hud.overlay.innerHTML = "";
  }

  function showOverlay(html, wire) {
    if (!hud.overlay) return;
    hud.overlay.innerHTML = `<div class="runner-dialog" role="dialog" aria-modal="true">${html}</div>`;
    hud.overlay.hidden = false;
    const dialog = hud.overlay.querySelector(".runner-dialog");
    // Nur ein Tipp neben den Dialog setzt fort – Tipps auf den Text nicht.
    dialog?.addEventListener("pointerdown", (event) => event.stopPropagation());
    if (typeof wire === "function") wire(hud.overlay);
    dialog?.querySelector("button")?.focus?.({ preventScroll: true });
  }

  function pauseGame() {
    if (!game.running || game.over || game.paused) return;
    game.paused = true;
    game.holding = false;
    releaseWakeLock();
    setStageHelp("Pause. Tippe auf Weiter spielen, um dranzubleiben, auf Nochmal für einen neuen Versuch oder auf Zur Karte, um das Level zu verlassen.");
    showOverlay(`
      <h2>Pause</h2>
      <p class="runner-dialog-sub">${game.level.label}</p>
      <div class="runner-dialog-actions">
        <button type="button" class="runner-primary" data-action="resume">Weiter spielen ▶</button>
        <button type="button" class="runner-secondary" data-action="restart">Nochmal ↻</button>
        <button type="button" class="runner-secondary" data-action="map">Zur Karte</button>
      </div>`, wireDialog);
  }

  function resumeGame() {
    if (!game.paused) return;
    game.paused = false;
    game.lastFrame = 0;
    game.accumulator = 0;
    closeOverlay();
    requestWakeLock();
    setPlayHelp(game.level);
  }

  function wireDialog(overlay) {
    overlay.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const action = button.dataset.action;
        if (action === "resume") resumeGame();
        else if (action === "restart") startLevel(game.level.id);
        else if (action === "map") leaveStage();
        else if (action === "next") startLevel(Math.min(LEVEL_COUNT, game.level.id + 1));
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Level beenden
  // ---------------------------------------------------------------------------
  function starsForRun() {
    const ratio = game.treatTotal ? game.treats / game.treatTotal : 1;
    let stars = 1;
    if (game.hearts >= MAX_HEARTS) stars += 1;
    if (ratio >= 0.8) stars += 1;
    return clamp(stars, 1, 3);
  }

  function finishRun(success) {
    if (game.over) return;
    game.over = true;
    game.holding = false;
    releaseWakeLock();

    if (!success) {
      soundFail();
      kids.vibrate([90, 60, 90]);
      setStageHelp(`Diesmal hat es nicht gereicht. Du hast ${game.treats} ${game.level.treatName} gesammelt. Tippe auf Nochmal für einen neuen Versuch oder auf Zur Karte, um ein anderes Level zu wählen.`);
      showOverlay(`
        <div class="runner-mascot sad">${kids.mascotSVG("sad")}</div>
        <h2>Fast geschafft!</h2>
        <p class="runner-dialog-sub">Du hast ${game.treats} ${game.level.treatName} gesammelt. Probier es gleich nochmal!</p>
        <div class="runner-dialog-actions">
          <button type="button" class="runner-primary" data-action="restart">Nochmal ↻</button>
          <button type="button" class="runner-secondary" data-action="map">Zur Karte</button>
        </div>`, wireDialog);
      return;
    }

    const level = game.level;
    const stars = starsForRun();
    const previous = bestFor(level.id);

    progress.best[level.id] = {
      stars: Math.max(stars, previous?.stars || 0),
      treats: Math.max(game.treats, previous?.treats || 0),
      total: game.treatTotal,
    };
    const unlockedNext = level.id === progress.unlocked && level.id < LEVEL_COUNT;
    if (unlockedNext) progress.unlocked = level.id + 1;
    saveProgress(progress);

    soundFinish();
    kids.vibrate([40, 40, 90]);
    renderMap();

    const nextLevel = LEVELS[level.id] || null;
    const nextAnimal = nextLevel ? ANIMALS[nextLevel.animal] : null;
    const growLine = nextAnimal && unlockedNext
      ? `<p class="runner-grow">Du wirst grösser: <strong>${nextAnimal.name} ${nextAnimal.emoji}</strong></p>`
      : (!nextLevel ? `<p class="runner-grow">Du hast alle ${LEVEL_COUNT} Tiere geschafft! 🏆</p>` : "");
    showOverlay(`
      <p class="runner-dialog-eyebrow">Level ${level.id} geschafft</p>
      <h2>${game.animal.name} im Ziel! ${game.animal.emoji}</h2>
      ${starRow(stars)}
      <p class="runner-dialog-sub">${game.treats} von ${game.treatTotal} ${level.treatName} ${level.treat}</p>
      ${growLine}
      <div class="runner-dialog-actions">
        ${nextLevel ? `<button type="button" class="runner-primary" data-action="next">Weiter zu ${nextAnimal.name} ${nextAnimal.emoji}</button>` : ""}
        <button type="button" class="runner-secondary" data-action="restart">Nochmal ↻</button>
        <button type="button" class="runner-secondary" data-action="map">Zur Karte</button>
      </div>`, wireDialog);

    const dialog = hud.overlay?.querySelector(".runner-dialog");
    if (dialog) kids.burstConfetti(dialog, stars >= 3 ? 60 : 38);
    setStageHelp(`Level ${level.id} geschafft! Du hast ${stars} von 3 Sternen und ${game.treats} ${level.treatName} gesammelt. ${nextLevel ? `Tippe auf Weiter, um mit dem ${nextAnimal.name} weiterzuspielen.` : "Du hast alle Tiere geschafft."} Mit Nochmal spielst du dieses Level erneut, mit Zur Karte kommst du zurück zur Übersicht.`);
  }

  // ---------------------------------------------------------------------------
  // Levelkarte
  // ---------------------------------------------------------------------------
  const SILHOUETTE_KEYS = ["fur", "furDark", "belly", "earInner", "earColor", "tailColor",
    "tailTip", "nose", "snout", "mane", "socks", "eyePatch", "beak", "feet", "wing", "faceMask"];

  function asSilhouette(animal) {
    const flat = "#c8ccd8";
    const copy = { ...animal, flat: true };
    SILHOUETTE_KEYS.forEach((key) => { if (copy[key]) copy[key] = flat; });
    return copy;
  }

  const PREVIEW_W = 96;
  const PREVIEW_H = 84;

  function drawAnimalPreview(target, animal, locked) {
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
    target.width = Math.round(PREVIEW_W * dpr);
    target.height = Math.round(PREVIEW_H * dpr);
    target.style.width = `${PREVIEW_W}px`;
    target.style.height = `${PREVIEW_H}px`;
    const g = target.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
    // Grössen bleiben relativ zueinander – man sieht, dass die Tiere wachsen.
    const size = 34 + (animal.size / ANIMALS.elephant.size) * 40;
    g.save();
    g.translate(PREVIEW_W / 2, PREVIEW_H - 10);
    drawAnimal(g, locked ? asSilhouette(animal) : animal, size, { run: 0.9, air: 0, squash: 0, blink: locked ? 1 : 0 });
    g.restore();
  }

  // Die Levelwahl: zehn Tiere, ein Startknopf – und sonst nichts. Jede Zeile
  // Text daneben müsste ein Kind erst lesen; das Tier und die Sterne sagen
  // alles, was es zu entscheiden gibt.
  function renderMap() {
    if (!shell) return;
    shell.setCount(LEVELS.filter((level) => bestFor(level.id)).length);
    shell.clear();

    const mapRoot = shell.el("div", "runner-map");
    mapRoot.setAttribute("aria-label", "Level auswählen");
    shell.play.append(mapRoot);

    LEVELS.forEach((level) => {
      const animal = ANIMALS[level.animal];
      const unlocked = isUnlocked(level.id);
      const best = bestFor(level.id);
      const card = document.createElement(unlocked ? "button" : "div");
      card.className = "runner-level";
      if (!unlocked) card.classList.add("locked");
      if (unlocked && !best) card.classList.add("fresh");

      const stars = best?.stars || 0;
      const starHtml = [0, 1, 2].map((i) => `<span class="runner-level-star${i < stars ? " filled" : ""}">★</span>`).join("");
      card.innerHTML = `
        <span class="runner-level-badge">${level.id}</span>
        <span class="runner-level-art-slot"></span>
        <span class="runner-level-stars" aria-hidden="true">${unlocked ? starHtml : "🔒"}</span>`;

      const art = document.createElement("canvas");
      art.className = "runner-level-art";
      art.setAttribute("aria-hidden", "true");
      card.querySelector(".runner-level-art-slot").append(art);
      drawAnimalPreview(art, animal, !unlocked);

      if (unlocked) {
        card.type = "button";
        card.setAttribute("aria-label",
          `Level ${level.id}, ${animal.name}, ${level.label}. ${best ? `${stars} von 3 Sternen.` : "Noch nicht gespielt."}`);
        card.addEventListener("click", () => startLevel(level.id));
      } else {
        card.setAttribute("aria-label", `Level ${level.id} ist noch verschlossen`);
      }
      mapRoot.append(card);
    });

    // Der eine Startknopf: er führt in das Level, das gerade dran ist.
    const naechstes = LEVELS[progress.unlocked - 1];
    if (naechstes) {
      const start = shell.el("button", "cm-start", "Starten");
      start.type = "button";
      start.setAttribute("aria-label", `Level ${naechstes.id} als ${ANIMALS[naechstes.animal].name} starten`);
      start.addEventListener("click", () => startLevel(naechstes.id));
      shell.play.append(start);
    }
    shell.play.append(shell.el("p", "cm-runs", levelsText(LEVELS.filter((level) => bestFor(level.id)).length)));
  }

  // Fünf geschaffte Level bauen den Wagen – welche fünf, ist gleich.
  const LEVELS_FUER_WAGEN = 5;
  function levelsText(fertig) {
    const left = LEVELS_FUER_WAGEN - fertig;
    if (left <= 0) return "Dieses Spiel ist geschafft – der Wagen ist gebaut.";
    return left === 1
      ? "Noch ein Level bis zum fertigen Wagen."
      : `Noch ${left} Level bis zum fertigen Wagen.`;
  }

  // ---------------------------------------------------------------------------
  // Hilfe-Lautsprecher
  // ---------------------------------------------------------------------------
  // Jede Ansicht meldet an, was gerade zu tun ist. Vorgelesen wird erst auf
  // Tipp des Kindes.
  function setStageHelp(text) { kids.setHelp?.(text); }
  function setMapHelp() {
    const animal = ANIMALS[LEVELS[progress.unlocked - 1]?.animal];
    setStageHelp(`Tier-Sprung. Tippe auf Starten oder wähle ein Tier aus.${animal ? ` Gerade spielst du als ${animal.name}.` : ""} Im Spiel tippst du auf den Bildschirm, damit dein Tier springt. Halte länger gedrückt, dann springt es höher. Du hast drei Leben pro Level. Ein Schloss heisst: dieses Tier kommt, wenn du das Level davor geschafft hast.`);
  }
  function setPlayHelp(level) {
    setStageHelp(`Level ${level.id}, ${level.label}. Tippe auf den Bildschirm, damit dein Tier springt. Länger gedrückt halten springt höher. Sammle möglichst viele ${level.treatName} und weiche den Hindernissen aus. Du hast drei Leben.`);
  }

  // ---------------------------------------------------------------------------
  // Spielfläche betreten / verlassen
  // ---------------------------------------------------------------------------
  function enterStage() {
    stage.hidden = false;
    document.body.classList.add("runner-playing");
    resizeCanvas();
    updateFullscreenButton();
    // Ohne das bliebe der Fokus auf dem Startknopf und die Leertaste würde
    // ihn erneut auslösen, statt zu springen.
    stage.focus({ preventScroll: true });
  }

  function leaveStage() {
    game.running = false;
    game.over = true;
    game.paused = false;
    stopLoop();
    closeOverlay();
    stage.hidden = true;
    document.body.classList.remove("runner-playing");
    releaseWakeLock();
    if (fullscreenActive()) {
      try { (document.exitFullscreen || document.webkitExitFullscreen)?.call(document); } catch { /* ignore */ }
    }
    renderMap();
    setMapHelp();
    host.querySelector(".cm-start")?.focus?.({ preventScroll: true });
  }

  function startLevel(levelId) {
    const level = LEVELS[levelId - 1];
    if (!level || !isUnlocked(level.id)) return;
    closeOverlay();
    enterStage();
    resetRun(level);
    shownHearts = -1;
    shownTreats = -1;
    if (hud.treatIcon) hud.treatIcon.textContent = level.treat;
    if (hud.levelLabel) hud.levelLabel.textContent = `${level.id}. ${level.label}`;
    if (hud.progressMarker) hud.progressMarker.textContent = ANIMALS[level.animal].emoji;
    resizeCanvas();
    game.running = true;
    game.lastFrame = 0;
    syncHud();
    startLoop();
    requestWakeLock();
    ensureAudio();
    setPlayHelp(level);
  }

  // ---------------------------------------------------------------------------
  // Eingaben
  // ---------------------------------------------------------------------------
  function isControl(target) {
    return Boolean(target && target.closest && target.closest("button, a, input, select"));
  }

  stage.addEventListener("pointerdown", (event) => {
    if (isControl(event.target)) return;
    event.preventDefault();
    if (game.paused) { resumeGame(); return; }
    requestJump();
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
    stage.addEventListener(type, releaseJump);
  });
  stage.addEventListener("contextmenu", (event) => event.preventDefault());

  window.addEventListener("keydown", (event) => {
    if (!game.running) return;
    if (event.code === "Escape") {
      event.preventDefault();
      if (game.paused) resumeGame(); else pauseGame();
      return;
    }
    if (event.code !== "Space" && event.code !== "ArrowUp" && event.code !== "KeyW") return;
    if (isControl(event.target)) return;
    event.preventDefault();
    if (event.repeat) return;
    if (game.paused) { resumeGame(); return; }
    requestJump();
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") releaseJump();
  });

  hud.pauseButton?.addEventListener("click", () => { if (game.paused) resumeGame(); else pauseGame(); });
  hud.quitButton?.addEventListener("click", () => leaveStage());
  hud.fullscreenButton?.addEventListener("click", () => toggleFullscreen());
  document.addEventListener("fullscreenchange", () => { updateFullscreenButton(); resizeCanvas(); });
  document.addEventListener("webkitfullscreenchange", () => { updateFullscreenButton(); resizeCanvas(); });

  let resizeTimer = 0;
  function scheduleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { if (!stage.hidden) resizeCanvas(); }, 80);
  }
  window.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", scheduleResize);
  window.visualViewport?.addEventListener("resize", scheduleResize);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") pauseGame();
    else if (game.running && !game.paused && !game.over) requestWakeLock();
  });
  window.addEventListener("blur", () => pauseGame());
  window.addEventListener("pagehide", () => { stopLoop(); releaseWakeLock(); });

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  // Die Bühne ist dieselbe wie in den anderen Spielen: Landschaft, Lautsprecher
  // und dieselben drei Knöpfe oben links. Die Uhr braucht dieses Spiel nicht –
  // die Zeit läuft im Level, nicht in der Auswahl.
  shell = window.LernappGameShell.mount({
    host,
    title: "Tier-Sprung",
    area: "geschwindigkeit",
    accent: "#F5A623",
    accentDark: "#b9741a",
    help: "",
    clock: false,
    onRestart: () => { renderMap(); setMapHelp(); },
  });

  renderMap();
  setMapHelp();
})();
