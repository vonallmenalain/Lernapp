/*
 * train-scenes.js – Die Landschaften, durch die der Zug fährt.
 *
 * Jede Szene hat dieselbe Tiefenstruktur: Wolken, ferne Hügel, Mittelgrund und
 * Vordergrund. Nur der Inhalt wechselt. Weil die Struktur gleich bleibt, liegt
 * die Geometrie der Ebenen im CSS und hier stehen ausschliesslich Farben und
 * Formen.
 *
 * Die Kacheln müssen an der linken und rechten Kante gleich aussehen, sonst
 * springt die Schleife sichtbar. Bei den Hügeln sorgt dafür eine gerade Anzahl
 * Segmente, bei allem anderen genügt Abstand zum Rand.
 */
(() => {
  "use strict";

  const art = window.LernappTrainArt;
  if (!art) return;
  const { el, group, shade } = art;

  const W = 600;
  const H = 200;

  function tile(children) {
    return el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none", "aria-hidden": "true" }, children);
  }

  // Wellenzug mit gerader Anzahl Segmente – nur so passt die Steigung an der
  // Nahtstelle wieder zusammen.
  function hills(top, amplitude, fill) {
    const step = W / 6;
    let d = `M0 ${H} L0 ${top} Q${step / 2} ${top - amplitude} ${step} ${top}`;
    for (let i = 2; i <= 6; i += 1) d += ` T${step * i} ${top}`;
    return el("path", { d: `${d} L${W} ${H} Z`, fill });
  }

  function tree(x, y, scale, trunk, crown) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("rect", { x: -5, y: -18, width: 10, height: 26, rx: 3, fill: trunk }),
      el("circle", { cx: 0, cy: -34, r: 24, fill: crown }),
      el("circle", { cx: -16, cy: -22, r: 16, fill: crown }),
      el("circle", { cx: 16, cy: -22, r: 16, fill: shade(crown, -0.1) }),
    ]);
  }

  function fir(x, y, scale, trunk, crown) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("rect", { x: -4, y: -14, width: 8, height: 20, rx: 2, fill: trunk }),
      el("polygon", { points: "0,-70 20,-34 -20,-34", fill: crown }),
      el("polygon", { points: "0,-54 25,-14 -25,-14", fill: shade(crown, -0.12) }),
    ]);
  }

  function palm(x, y, scale, trunk, leaf) {
    const fronds = [0, 1, 2, 3, 4].map((i) => {
      const angle = -160 + i * 40;
      return el("path", {
        d: "M0 0 q34 -14 62 4 q-30 -2 -62 8 z",
        fill: i % 2 ? shade(leaf, -0.12) : leaf,
        transform: `rotate(${angle})`,
      });
    });
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("path", { d: "M0 8 q-8 -34 4 -62", fill: "none", stroke: trunk, "stroke-width": 10, "stroke-linecap": "round" }),
      group({ transform: "translate(4,-62)" }, fronds),
    ]);
  }

  function bush(x, y, scale, color) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("circle", { cx: -12, cy: 0, r: 12, fill: color }),
      el("circle", { cx: 4, cy: -5, r: 15, fill: shade(color, 0.08) }),
      el("circle", { cx: 18, cy: 1, r: 11, fill: shade(color, -0.08) }),
    ]);
  }

  function grassTile(base, blade, accent, flowers) {
    const parts = [el("rect", { x: 0, y: 150, width: W, height: 50, fill: base })];
    for (let x = 6; x < W; x += 17) {
      const height = 16 + (x % 3) * 5;
      parts.push(el("path", {
        d: `M${x} 168 q3 -${height / 2} 1 -${height}`,
        fill: "none", stroke: x % 34 === 6 ? shade(blade, 0.2) : blade,
        "stroke-width": 3, "stroke-linecap": "round",
      }));
    }
    flowers.forEach((color, i) => {
      parts.push(el("circle", { cx: 60 + i * 122, cy: 158 - (i % 2) * 4, r: 5, fill: color }));
    });
    parts.push(bush(140, 162, 0.9, accent));
    parts.push(bush(410, 160, 1.05, shade(accent, 0.08)));
    return tile(parts);
  }

  function cloudTile(color, opacity = 0.9) {
    return tile([
      el("ellipse", { cx: 90, cy: 60, rx: 46, ry: 24, fill: color, opacity }),
      el("ellipse", { cx: 128, cy: 68, rx: 34, ry: 18, fill: color, opacity }),
      el("ellipse", { cx: 330, cy: 40, rx: 38, ry: 20, fill: color, opacity: opacity * 0.82 }),
      el("ellipse", { cx: 366, cy: 46, rx: 28, ry: 15, fill: color, opacity: opacity * 0.82 }),
      el("ellipse", { cx: 480, cy: 88, rx: 30, ry: 15, fill: color, opacity: opacity * 0.66 }),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Vorschaubilder
  // ---------------------------------------------------------------------------
  // Für die Szenenwahl. Ein Hügel mit Sonne sähe bei allen sechs gleich aus –
  // erst die typischen Formen machen den Unterschied erkennbar, und darauf
  // kommt es an, wenn kein Wort danebenstehen darf.
  const TW = 120;
  const TH = 76;

  function thumbHill(top, fill) {
    return el("path", { d: `M0 ${TH} L0 ${top} Q20 ${top - 12} 40 ${top} T80 ${top} T120 ${top} L120 ${TH} Z`, fill });
  }

  function thumbTree(x, y, scale, trunk, crown) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("rect", { x: -1.6, y: -6, width: 3.2, height: 8, fill: trunk }),
      el("circle", { cx: 0, cy: -11, r: 7.5, fill: crown }),
    ]);
  }

  function thumbFir(x, y, scale, trunk, crown) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("rect", { x: -1.4, y: -5, width: 2.8, height: 6, fill: trunk }),
      el("polygon", { points: "0,-22 7,-9 -7,-9", fill: crown }),
      el("polygon", { points: "0,-16 9,-4 -9,-4", fill: shade(crown, -0.12) }),
    ]);
  }

  function thumbPalm(x, y, scale, trunk, leaf) {
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("path", { d: "M0 2 q-3 -11 2 -19", fill: "none", stroke: trunk, "stroke-width": 3, "stroke-linecap": "round" }),
      el("path", { d: "M2 -18 q9 -6 15 0 q-8 -1 -15 3 z", fill: leaf }),
      el("path", { d: "M2 -18 q-9 -6 -15 0 q8 -1 15 3 z", fill: shade(leaf, -0.12) }),
      el("path", { d: "M2 -18 q2 -9 -3 -13 q-1 8 0 13 z", fill: shade(leaf, 0.1) }),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Die Szenen
  // ---------------------------------------------------------------------------
  const SCENES = [
    {
      id: "wiese",
      thumb: () => [
        thumbHill(46, "#9fc9a6"), thumbHill(54, "#8fc45e"),
        thumbTree(28, 62, 1, "#7b5c3a", "#4f9350"),
        thumbTree(90, 64, 0.8, "#7b5c3a", "#57a058"),
      ],
      label: "Wiese und Hügel",
      free: true,
      sky: ["#a8ddf0", "#dff1f7"],
      ground: "#8fc45e",
      groundDark: "#6da645",
      light: { color: "#ffd166", glow: 0.35 },
      layers: {
        clouds: () => cloudTile("#ffffff"),
        far: () => tile([hills(96, 54, "#9fc9a6"), hills(132, 34, "#86b98f")]),
        mid: () => tile([
          hills(150, 22, "#6faa6b"),
          tree(70, 176, 1, "#7b5c3a", "#4f9350"),
          tree(210, 182, 0.8, "#7b5c3a", "#57a058"),
          tree(360, 174, 1.1, "#6d5133", "#478a48"),
          tree(500, 180, 0.85, "#7b5c3a", "#4f9350"),
        ]),
        near: () => grassTile("#7ab455", "#68a047", "#5d9a4e", ["#ffd166", "#ff8fa3", "#ffffff", "#ffd166", "#c9a7f5"]),
      },
    },
    {
      id: "wald",
      thumb: () => [
        thumbHill(46, "#7fae87"), thumbHill(56, "#6f9e50"),
        thumbFir(22, 66, 1, "#5b4229", "#2f6b3b"),
        thumbFir(46, 70, 0.8, "#5b4229", "#377643"),
        thumbFir(78, 66, 1.05, "#4d3722", "#2a6236"),
        thumbFir(102, 70, 0.85, "#5b4229", "#347040"),
      ],
      label: "Wald",
      free: true,
      sky: ["#bfe3ea", "#e8f4ef"],
      ground: "#6f9e50",
      groundDark: "#537c3c",
      light: { color: "#fff0b8", glow: 0.28 },
      layers: {
        clouds: () => cloudTile("#f4fbf7", 0.7),
        far: () => tile([hills(104, 44, "#7fae87"), hills(140, 28, "#68986f")]),
        mid: () => tile([
          hills(156, 18, "#4e8250"),
          fir(50, 184, 1, "#5b4229", "#2f6b3b"),
          fir(130, 190, 0.78, "#5b4229", "#377643"),
          fir(250, 182, 1.15, "#4d3722", "#2a6236"),
          fir(360, 190, 0.85, "#5b4229", "#347040"),
          fir(470, 184, 1.05, "#4d3722", "#2f6b3b"),
          fir(552, 192, 0.72, "#5b4229", "#377643"),
        ]),
        near: () => grassTile("#5f9445", "#4e7f38", "#3f6f31", ["#ffffff", "#ffd166", "#e8b4ff", "#ffffff", "#ffd166"]),
      },
    },
    {
      id: "dschungel",
      thumb: () => [
        thumbHill(44, "#6fbd8f"), thumbHill(56, "#3f8f57"),
        thumbPalm(30, 68, 1.1, "#7b5c3a", "#2f7d4b"),
        thumbPalm(84, 70, 0.95, "#6d5133", "#368a54"),
        el("path", { d: "M60 0 q4 14 -2 24", fill: "none", stroke: "#3f8f57", "stroke-width": 2.5, "stroke-linecap": "round" }),
      ],
      label: "Dschungel",
      sky: ["#8fd6c2", "#dff4e6"],
      ground: "#3f8f57",
      groundDark: "#2e6f43",
      light: { color: "#ffe8a3", glow: 0.3 },
      layers: {
        clouds: () => tile([
          el("ellipse", { cx: 120, cy: 54, rx: 52, ry: 22, fill: "#ffffff", opacity: "0.55" }),
          el("ellipse", { cx: 380, cy: 44, rx: 44, ry: 18, fill: "#ffffff", opacity: "0.45" }),
          // Lianen, die von oben hereinhängen.
          el("path", { d: "M180 0 q10 40 -4 76", fill: "none", stroke: "#3f8f57", "stroke-width": 5, "stroke-linecap": "round", opacity: "0.7" }),
          el("path", { d: "M430 0 q-12 46 6 84", fill: "none", stroke: "#3f8f57", "stroke-width": 5, "stroke-linecap": "round", opacity: "0.6" }),
        ]),
        far: () => tile([hills(92, 58, "#6fbd8f"), hills(128, 36, "#55a475")]),
        mid: () => tile([
          hills(148, 24, "#3f8f57"),
          palm(80, 186, 1, "#7b5c3a", "#2f7d4b"),
          palm(230, 192, 0.82, "#6d5133", "#368a54"),
          palm(390, 184, 1.1, "#7b5c3a", "#2a7344"),
          palm(520, 190, 0.9, "#6d5133", "#368a54"),
        ]),
        near: () => {
          const parts = [el("rect", { x: 0, y: 150, width: W, height: 50, fill: "#3f8f57" })];
          for (let x = 0; x < W; x += 54) {
            parts.push(el("path", {
              d: `M${x} 176 q22 -34 46 -6 q-24 16 -46 6 z`,
              fill: x % 108 === 0 ? "#357c4a" : "#48a061",
            }));
          }
          parts.push(el("circle", { cx: 150, cy: 158, r: 6, fill: "#ff8fa3" }));
          parts.push(el("circle", { cx: 430, cy: 154, r: 6, fill: "#ffd166" }));
          return tile(parts);
        },
      },
    },
    {
      id: "berge",
      thumb: () => [
        el("polygon", { points: "0,76 22,30 44,76", fill: "#8fa6bd" }),
        el("polygon", { points: "30,76 60,18 90,76", fill: "#7d95ad" }),
        el("polygon", { points: "76,76 100,34 124,76", fill: "#8fa6bd" }),
        el("polygon", { points: "50,32 60,18 70,32 64,29 60,34 56,29", fill: "#f4f8fb" }),
        el("rect", { x: 0, y: 62, width: 120, height: 14, fill: "#8e9aa8" }),
      ],
      label: "Berge und Tunnel",
      sky: ["#9ec9e8", "#e6f1f8"],
      ground: "#8e9aa8",
      groundDark: "#6f7b89",
      light: { color: "#fff4d6", glow: 0.32 },
      layers: {
        clouds: () => cloudTile("#ffffff", 0.85),
        far: () => tile([
          el("polygon", { points: "0,200 90,64 180,200", fill: "#8fa6bd" }),
          el("polygon", { points: "60,200 190,40 320,200", fill: "#7d95ad" }),
          el("polygon", { points: "260,200 380,70 500,200", fill: "#8fa6bd" }),
          el("polygon", { points: "430,200 545,46 660,200", fill: "#7d95ad" }),
          el("polygon", { points: "160,90 190,40 220,90 205,84 190,94 175,84", fill: "#f4f8fb" }),
          el("polygon", { points: "518,92 545,46 572,92 559,86 545,96 531,86", fill: "#f4f8fb" }),
        ]),
        mid: () => tile([
          hills(150, 20, "#6f8496"),
          // Ein Tunnelmund im Mittelgrund: das Ziel jeder Bergstrecke.
          el("path", { d: "M300 200 L300 150 a34 34 0 0 1 68 0 L368 200 Z", fill: "#5a6b7a" }),
          el("path", { d: "M310 200 L310 154 a24 24 0 0 1 48 0 L358 200 Z", fill: "#2b3440" }),
          el("rect", { x: 292, y: 140, width: 84, height: 12, rx: 4, fill: "#7d8d9c" }),
        ]),
        near: () => {
          const parts = [el("rect", { x: 0, y: 150, width: W, height: 50, fill: "#8e9aa8" })];
          for (let x = 8; x < W; x += 26) {
            parts.push(el("ellipse", { cx: x, cy: 166 + (x % 3) * 3, rx: 9, ry: 5, fill: x % 52 === 8 ? "#9fabb8" : "#7f8b99" }));
          }
          parts.push(bush(180, 160, 0.8, "#5f7a5c"));
          parts.push(bush(440, 162, 0.9, "#54704f"));
          return tile(parts);
        },
      },
    },
    {
      id: "see",
      thumb: () => [
        thumbHill(40, "#8fb9c4"),
        el("rect", { x: 0, y: 46, width: 120, height: 20, fill: "#57b6d8" }),
        el("path", { d: "M0 52 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0", fill: "none", stroke: "#8fd8ee", "stroke-width": 2 }),
        group({ transform: "translate(46,46)" }, [
          el("polygon", { points: "0,0 0,-15 10,0", fill: "#ffffff" }),
          el("path", { d: "M-5 0 h17 l-3 4 h-11 z", fill: "#e2694f" }),
        ]),
        el("rect", { x: 0, y: 62, width: 120, height: 14, fill: "#e8d9a8" }),
      ],
      label: "See und Küste",
      sky: ["#a4dcf2", "#e4f4fb"],
      ground: "#e8d9a8",
      groundDark: "#cbb886",
      light: { color: "#ffd98a", glow: 0.34 },
      layers: {
        clouds: () => cloudTile("#ffffff", 0.8),
        far: () => tile([
          hills(104, 40, "#8fb9c4"),
          el("rect", { x: 0, y: 128, width: W, height: 72, fill: "#57b6d8" }),
          el("path", { d: "M0 140 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0", fill: "none", stroke: "#8fd8ee", "stroke-width": 4 }),
          // Zwei Segel: der See braucht etwas, das sich bewegt.
          group({ transform: "translate(180,128)" }, [
            el("polygon", { points: "0,0 0,-38 24,0", fill: "#ffffff" }),
            el("path", { d: "M-12 0 h40 l-6 8 h-28 z", fill: "#e2694f" }),
          ]),
          group({ transform: "translate(440,132) scale(0.8)" }, [
            el("polygon", { points: "0,0 0,-38 24,0", fill: "#f6f9fb" }),
            el("path", { d: "M-12 0 h40 l-6 8 h-28 z", fill: "#4a8fb0" }),
          ]),
        ]),
        mid: () => tile([
          el("path", { d: "M0 200 L0 158 q60 -14 120 -2 t120 4 t120 -6 t120 2 t120 6 L600 200 Z", fill: "#e8d9a8" }),
          el("path", { d: "M60 168 q6 -22 2 -34 M66 168 q10 -20 18 -30 M54 168 q-6 -18 -12 -26", fill: "none", stroke: "#8aa85f", "stroke-width": 3.5, "stroke-linecap": "round" }),
          el("path", { d: "M470 170 q6 -24 2 -36 M478 170 q12 -20 20 -28", fill: "none", stroke: "#8aa85f", "stroke-width": 3.5, "stroke-linecap": "round" }),
        ]),
        near: () => {
          const parts = [el("rect", { x: 0, y: 150, width: W, height: 50, fill: "#e8d9a8" })];
          for (let x = 12; x < W; x += 44) {
            parts.push(el("path", { d: `M${x} 174 a10 10 0 0 1 -10 -10 h20 a10 10 0 0 1 -10 10 z`, fill: x % 88 === 12 ? "#f6ede0" : "#f2dfc4" }));
          }
          parts.push(el("ellipse", { cx: 230, cy: 172, rx: 16, ry: 7, fill: "#d6c294" }));
          parts.push(el("ellipse", { cx: 520, cy: 168, rx: 12, ry: 6, fill: "#d6c294" }));
          return tile(parts);
        },
      },
    },
    {
      id: "nacht",
      thumb: () => [
        el("circle", { cx: 30, cy: 16, r: 1.6, fill: "#ffffff" }),
        el("circle", { cx: 52, cy: 28, r: 1.2, fill: "#ffffff", opacity: "0.8" }),
        el("circle", { cx: 70, cy: 12, r: 1.8, fill: "#ffffff" }),
        el("circle", { cx: 14, cy: 32, r: 1.2, fill: "#ffffff", opacity: "0.7" }),
        el("circle", { cx: 104, cy: 30, r: 1.4, fill: "#ffffff", opacity: "0.8" }),
        thumbHill(46, "#31456a"), thumbHill(56, "#2c3f5c"),
        thumbFir(26, 66, 1, "#16203a", "#1b2c47"),
        thumbFir(88, 68, 0.9, "#16203a", "#20334f"),
        el("circle", { cx: 66, cy: 62, r: 2, fill: "#ffe98a" }),
      ],
      label: "Nacht und Sterne",
      sky: ["#1b2a52", "#3c4f80"],
      ground: "#2c3f5c",
      groundDark: "#1d2c44",
      light: { color: "#f4f0d8", glow: 0.4 },
      layers: {
        clouds: () => {
          const parts = [];
          for (let i = 0; i < 26; i += 1) {
            const x = (i * 97) % W;
            const y = 12 + ((i * 53) % 110);
            const r = 1.6 + (i % 3);
            parts.push(el("circle", { cx: x, cy: y, r, fill: "#ffffff", opacity: String(0.5 + (i % 4) * 0.12) }));
          }
          parts.push(el("ellipse", { cx: 320, cy: 70, rx: 40, ry: 16, fill: "#5a6f9e", opacity: "0.45" }));
          return tile(parts);
        },
        far: () => tile([hills(96, 52, "#31456a"), hills(132, 32, "#293a5c")]),
        mid: () => tile([
          hills(150, 20, "#22314e"),
          fir(70, 184, 1, "#16203a", "#1b2c47"),
          fir(220, 190, 0.8, "#16203a", "#20334f"),
          fir(380, 182, 1.1, "#131c33", "#1b2c47"),
          fir(510, 190, 0.9, "#16203a", "#20334f"),
        ]),
        near: () => {
          const parts = [el("rect", { x: 0, y: 150, width: W, height: 50, fill: "#2c3f5c" })];
          for (let x = 6; x < W; x += 17) {
            parts.push(el("path", {
              d: `M${x} 168 q3 -8 1 -16`, fill: "none",
              stroke: x % 34 === 6 ? "#3d5578" : "#334764", "stroke-width": 3, "stroke-linecap": "round",
            }));
          }
          // Glühwürmchen statt Blumen.
          [80, 210, 340, 470, 560].forEach((x, i) => {
            parts.push(el("circle", { cx: x, cy: 150 - (i % 3) * 8, r: 4, fill: "#ffe98a", opacity: "0.85" }));
          });
          return tile(parts);
        },
      },
    },
  ];

  const BY_ID = Object.fromEntries(SCENES.map((scene) => [scene.id, scene]));

  // Freigeschaltet wird über fertig gebaute Wagen: zwei Szenen sind von Anfang
  // an da, jede weitere kostet einen Wagen, der mindestens fertig gebaut ist.
  // So lohnt es sich, alle fünf Bereiche anzufassen statt nur den liebsten.
  function unlockedCount(builtWagons) {
    const free = SCENES.filter((scene) => scene.free).length;
    return Math.min(SCENES.length, free + Math.max(0, builtWagons));
  }

  function isUnlocked(id, builtWagons) {
    const index = SCENES.findIndex((scene) => scene.id === id);
    return index >= 0 && index < unlockedCount(builtWagons);
  }

  window.LernappScenes = { SCENES, BY_ID, unlockedCount, isUnlocked, tile, hills, tree, fir, palm, bush, grassTile, cloudTile, W, H, TW, TH };
})();
