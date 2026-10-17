/*
 * bau-schmuck.js – Schmuck und Zeichen der Bauecke: Pokal, Medaille,
 * Denkmal, Storch, Rettungshelikopter, kleine Wehwehchen, Hotelschild und
 * Ruhmeshalle.
 * ---------------------------------------------------------------------------
 * Alles als SVG-Text im Stil von bau-art.js: flache Farben, runde Ecken,
 * freundlich. Keine ids, kein <defs>, kein <text> (Namen schreibt die App
 * selbst darüber) und keine Zufallszahlen – auf jedem Gerät dieselbe
 * Zeichnung. Was funkelt, liegt in den Gruppen bau-glitzer-a/b, die
 * train-bau.js abwechselnd aufleuchten lässt.
 *
 * Was es gibt (window.LernappBauSchmuck), mit Nullpunkt und Grösse:
 *
 *   pokal(stufe)       "bronze" | "silber" | "gold" (sonst gold). Unten Mitte,
 *                      gut 60 breit (die Henkel bis x ±32), bis y = -80; das
 *                      Funkeln reicht bis etwa -88. Die Plakette am Sockel
 *                      bleibt leer.
 *   medaille(stufe)    1 Bronze, 2 Silber, 3 Gold – ein Stern auf der
 *                      Medaille, oben das Band. Um (0, 0), 28 × 36
 *                      (x ±14, y -18 bis 18). Neben den Sternen eines Bewohners.
 *   denkmal()          Sockel mit Tafel und goldenem Stern obendrauf. Unten
 *                      Mitte, 90 breit (x ±45), bis y = -150. Die Tafel für
 *                      den Namen ist leer: Schreibfläche mit Mitte (0, -50),
 *                      40 × 18 (der goldene Rand darum 46 × 24).
 *   storch()           ein Storch fliegt nach rechts und trägt im Schnabel
 *                      ein Tuch mit einem Baby. Um (0, 0), etwa 140 × 90
 *                      (x -66 bis 74, y -46 bis 28). Der Flügel liegt in
 *                      <g class="bau-fluegel">; er schlägt um die Schulter,
 *                      Drehpunkt (2, -4) – z. B. rotate(-25 2 -4) bis
 *                      rotate(20 2 -4).
 *   helikopter()       ein Rettungshelikopter fliegt nach rechts, weiss-rot
 *                      mit blauem H-Schild (kein rotes Kreuz). Um (0, 0),
 *                      etwa 220 × 110 (x -114 bis 106, y -46 bis 46). Der
 *                      Rotor liegt in <g class="bau-rotor">, Mitte (0, -41):
 *                      scaleX um diesen Punkt (translate(0 -41) scale(s 1)
 *                      translate(0 41)) lässt ihn drehen. Der Heckrotor liegt
 *                      in <g class="bau-heckrotor">, Mitte (-106, -6).
 *   weh(art, opt)      ein kleines Zeichen für ein Wehwehchen, gezeichnet auf
 *                      ein Tier von etwa 100 Höhe mit Nullpunkt zwischen den
 *                      Füssen (wie in bau-tiere.js, nach oben negativ):
 *                        gips         Gips am Unterschenkel, x 0..10, y -17..-3
 *                        pflaster     zwei Pflaster über Kreuz, Stirn (-9, -75)
 *                        schnupfen    rote Nase und Taschentuch; die Nase liegt
 *                                     bei opt.nase = [x, y], sonst [12, -58]
 *                                     (beim Fuchs mit der langen Schnauze
 *                                     passt [25, -57])
 *                        augen        Schwindel-Spirale über dem Kopf (0, -115)
 *                        bauchweh     Bettflasche am Bauch (2, -28)
 *                        muede        graue Wolke über dem Kopf (0, -120)
 *                        kratzer      zwei rote Kratzer am Arm (15, -36)
 *                        muskelkater  Kühlbeutel auf der Schulter (15, -45)
 *                      Unbekannte Art: leerer Text.
 *   hotelSchild(n)     Schild mit Bett und Schlüssel, darunter fünf Plätze für
 *                      Sterne, n (0..5) davon golden. Unten Mitte, 160 breit
 *                      (x ±80), bis y = -80.
 *   ruhmeshalle()      ein kleiner Tempel für die Strasse: Säulen, goldener
 *                      Stern im Giebel, drinnen ein Pokal. Unten Mitte,
 *                      160 breit (x ±80), bis y = -150.
 *
 * Nur Zeichnen, kein Verhalten.
 */
(() => {
  "use strict";

  // Gerundet auf eine Stelle, damit berechnete Punkte kurz bleiben.
  const n = (v) => Math.round(v * 10) / 10;

  // Kleine Bausteine wie in bau-moebel.js.
  const R = (x, y, w, h, fill, rx = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ""} fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const C = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const E = (cx, cy, rx, ry, fill, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const P = (d, fill, extra = "") => `<path d="${d}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const S = (d, stroke, width, extra = "") => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra ? ` ${extra}` : ""}/>`;
  const rand = (farbe, breite) => `stroke="${farbe}" stroke-width="${breite}" stroke-linejoin="round"`;
  const G = (inhalt, transform) => `<g transform="${transform}">${inhalt}</g>`;

  const WEISS = "#ffffff";
  const TINTE = "#243047";
  const SCHEIN = "#fff3a0";
  const STEIN = "#b8c2cf";
  const STEIN_D = "#9aa5b1";
  const STEIN_H = "#dbe2ea";
  const ROT = "#e53935";
  const BLAU = "#2f6fd6";

  // Die Metalle: Fläche, Glanz, Schatten, Rand und die Farbe des Funkelns.
  const METALL = {
    gold: { f: "#ffc93c", h: "#ffe27a", d: "#e0a400", r: "#a86b00", glanz: SCHEIN },
    silber: { f: "#cfd8e3", h: "#f4f7fb", d: "#9aa7b6", r: "#64748b", glanz: WEISS },
    bronze: { f: "#e0945a", h: "#f6bf8e", d: "#b8693a", r: "#7a4320", glanz: "#ffe6cc" },
  };
  const GOLD = METALL.gold;

  // Ein Stern mit fünf Zacken um (cx, cy), als Pfad – wie in bau-art.js.
  function sternPfad(cx, cy, r, innen = 0.45) {
    let d = "";
    for (let i = 0; i < 10; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * innen : r;
      d += `${i ? "L" : "M"}${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)}`;
    }
    return `${d}Z`;
  }
  // Ein Funkeln mit vier Spitzen um (x, y).
  function funkeln(x, y, r, farbe = SCHEIN) {
    const k = n(r * 0.28);
    return P(`M${x} ${n(y - r)}L${n(x + k)} ${n(y - k)}L${n(x + r)} ${y}L${n(x + k)} ${n(y + k)}L${x} ${n(y + r)}L${n(x - k)} ${n(y + k)}L${n(x - r)} ${y}L${n(x - k)} ${n(y - k)}Z`, farbe);
  }
  const glitzer = (a, b) => `<g class="bau-glitzer-a">${a}</g><g class="bau-glitzer-b">${b}</g>`;
  // Ein goldener Stern mit Rand und hellem Kern.
  const goldStern = (x, y, r, breite = 2) => P(sternPfad(x, y, r, 0.47), GOLD.f, rand(GOLD.r, breite)) + P(sternPfad(n(x - r * 0.1), n(y - r * 0.1), n(r * 0.5), 0.47), GOLD.h);
  // Ein Lorbeerblatt, schräg gestellt.
  const blatt = (x, y, winkel, f = "#5cb85c") => E(x, y, 3.4, 1.6, f, `transform="rotate(${winkel} ${x} ${y})"`);

  // ---------------------------------------------------------------------------
  // Pokal: unten Mitte, 60 × 80
  // ---------------------------------------------------------------------------
  function pokal(stufe = "gold") {
    const m = METALL[stufe] || GOLD;
    return R(-20, -14, 40, 14, "#8a5734", 3) + R(-20, -14, 40, 3, "#a46c43", 1.5) + R(-11, -10, 22, 6, m.h, 1.5, rand(m.r, 0.8)) +
      P("M-14 -13h28l-4-5h-20z", m.d) + R(-3.5, -32, 7, 15, m.f) + R(-2.5, -31, 2, 13, m.h, 1) + E(0, -25, 6.5, 2.6, m.d) +
      S("M-19 -68q-11 0-11 9t13 13M19 -68q11 0 11 9t-13 13", m.d, 4.4) + S("M-19 -68q-11 0-11 9t13 13M19 -68q11 0 11 9t-13 13", m.h, 1.2, `opacity="0.7"`) +
      P("M-21 -74h42q0 30-21 41q-21-11-21-41z", m.f, rand(m.r, 1.6)) +
      S("M-15 -68q0 18 9 28", m.h, 3, `opacity="0.9"`) + S("M15 -66q-1 14-8 24", m.d, 2, `opacity="0.6"`) +
      E(0, -74, 22, 5, m.h, rand(m.r, 1.4)) + E(0, -74, 17.5, 3, m.d) +
      P(sternPfad(0, -55, 8, 0.47), m.h, rand(m.r, 1.2)) +
      glitzer(funkeln(-24, -82, 6, m.glanz) + funkeln(27, -40, 4.5, m.glanz), funkeln(25, -84, 5, m.glanz) + funkeln(-27, -44, 4, m.glanz));
  }

  // ---------------------------------------------------------------------------
  // Medaille: um (0, 0), 28 × 36; Stufe 1 Bronze, 2 Silber, 3 Gold
  // ---------------------------------------------------------------------------
  function medaille(stufe = 1) {
    const m = [METALL.bronze, METALL.bronze, METALL.silber, METALL.gold][Math.max(0, Math.min(3, Math.round(Number(stufe) || 1)))];
    const funkelt = m === GOLD ? glitzer(funkeln(11, -1, 3.4, WEISS), funkeln(-10, 14, 2.8, WEISS)) : "";
    return P("M-11 -18h7l7 15h-7z", "#3a6fd8") + P("M11 -18h-7l-7 15h7z", "#4f8ef7") + P("M1.5 -18h2.6l-5 11h-2.6z", WEISS, `opacity="0.8"`) +
      R(-5, -5, 10, 4, m.d, 1.5) +
      C(0, 6, 11.5, m.f, rand(m.r, 1.6)) + C(0, 6, 8.4, "none", rand(m.h, 1.2)) +
      P(sternPfad(0, 6.6, 6.2, 0.47), m.h, rand(m.r, 0.9)) + S("M-7 1q2-4 6-5", WEISS, 1.4, `opacity="0.7"`) + funkelt;
  }

  // ---------------------------------------------------------------------------
  // Denkmal: unten Mitte, 90 × 150; leere Tafel (0, -50), Schreibfläche 40 × 18
  // ---------------------------------------------------------------------------
  function denkmal() {
    const lorbeer = [[-13, -96, -70], [-19, -102, -50], [-24, -110, -30], [-26, -119, -5], [-25, -128, 20]]
      .map(([x, y, g]) => blatt(x, y, g) + blatt(-x, y, -g)).join("");
    return R(-45, -10, 90, 10, STEIN_D, 2) + R(-45, -10, 90, 2.5, STEIN, 1.2) +
      R(-38, -20, 76, 11, "#a9b4c0", 2) + R(-38, -20, 76, 2.5, "#c3ccd6", 1.2) +
      R(-30, -82, 60, 63, "#c9d1da") + R(-30, -82, 9, 63, "#d9dfe6") + R(21, -82, 9, 63, "#b3bdc8") +
      R(-35, -90, 70, 9, STEIN_D, 2) + R(-35, -90, 70, 2.5, STEIN, 1.2) +
      R(-23, -62, 46, 24, GOLD.h, 3, rand(GOLD.r, 1.6)) + R(-20, -59, 40, 18, "#fff6d6", 2) +
      R(-8, -97, 16, 8, STEIN_D, 2) +
      C(0, -117, 34, SCHEIN, `opacity="0.4"`) +
      S("M-6 -92q-22-10-19-40M6 -92q22-10 19-40", "#3f8f3a", 1.6) + lorbeer +
      P(sternPfad(0, -116, 28, 0.48), GOLD.f, rand(GOLD.r, 3)) + P(sternPfad(-3, -119, 15, 0.48), GOLD.h) +
      C(-6.5, -116, 2.6, "#7a4d00") + C(6.5, -116, 2.6, "#7a4d00") + C(-5.8, -117, 0.9, WEISS) + C(7.2, -117, 0.9, WEISS) +
      S("M-6 -109q6 5 12 0", "#7a4d00", 2.2) + C(-11, -110, 2.4, "#ff8fab", `opacity="0.7"`) + C(11, -110, 2.4, "#ff8fab", `opacity="0.7"`) +
      glitzer(funkeln(-32, -140, 7) + funkeln(30, -96, 5), funkeln(32, -142, 6) + funkeln(-31, -94, 5));
  }

  // ---------------------------------------------------------------------------
  // Storch: um (0, 0), etwa 140 × 90, fliegt nach rechts
  // ---------------------------------------------------------------------------
  function storch() {
    const tuch = "#bfe3f7";
    const tuchD = "#8ec9ea";
    const beine = S("M-26 5L-60 10M-25 8L-58 16", "#ff8a3d", 2.4) + S("M-60 10l-5-3M-60 10l-5 2M-58 16l-5-2M-58 16l-4 3", "#ff8a3d", 1.6);
    const schwanz = P("M-30 -6L-48 -6L-44 0L-50 4L-30 6z", WEISS, rand("#d3dce6", 1.2)) + P("M-46 -6h-2l4 6-6 4h3l5-4z", "#e2e8f0");
    const koerper = E(-6, 0, 28, 12, WEISS, rand("#d3dce6", 1.4)) + P("M-30 4q20 10 44 4q-20 2-44-4z", "#e2e8f0") +
      P("M14 -6q10-7 19-9l4 8q-9 2-17 10z", WEISS) + S("M14 -6q10-7 19-9M20 3q8-8 17-10", "#d3dce6", 1.2) +
      C(37, -10, 7.5, WEISS, rand("#d3dce6", 1.2)) + C(39, -12, 1.8, TINTE) + C(39.6, -12.7, 0.6, WEISS) + C(35, -7, 1.8, "#ff9fb5", `opacity="0.7"`) +
      P("M43 -13l24 7-1.4 1.4-23 0.4z", "#ff6f3c") + P("M43 -8.6l22.6-0.6 1.4-1.4-24 3z", "#e8552a");
    // Das Tuch mit dem Baby hängt am Knoten unter der Schnabelspitze.
    const buendel = S("M60 -6v6", tuchD, 1.6) + P("M55 -6l5 4 5-4-3 7h-4z", tuch, rand(tuchD, 1)) +
      P("M45 13q-1-14 15-14t15 14q0 13-15 13t-15-13z", tuch, rand(tuchD, 1.2)) +
      C(52, 18, 1.2, WEISS) + C(67, 20, 1.2, WEISS) + C(62, 23, 1.2, WEISS) +
      E(60, 8, 7.6, 6.6, "#ffe0c2", rand("#e8b98f", 1)) + S("M57 3.4q3-3 5 0", "#c98d55", 1.2) +
      S("M56.5 7.6q1.4 1.4 2.8 0M61 7.6q1.4 1.4 2.8 0", TINTE, 1) + S("M58.6 11q1.4 1.2 2.8 0", "#d9734e", 1) +
      C(55.6, 10, 1.3, "#ff9fb5", `opacity="0.8"`) + C(64.4, 10, 1.3, "#ff9fb5", `opacity="0.8"`) +
      P("M50 6q10 6 20 0l1 4q-11 6-22 0z", tuch);
    const fluegel = `<g class="bau-fluegel">` +
      P("M4 -6C-4 -28 -22 -42 -48 -44L-42 -38L-50 -34L-42 -30L-48 -24L-38 -22C-30 -12 -20 -4 -12 2Z", "#2d3748") +
      P("M4 -6C-4 -26 -20 -38 -40 -40C-34 -28 -24 -14 -8 -1Z", WEISS, rand("#d3dce6", 1)) +
      S("M-4 -12q-10-10-22-18M-12 -6q-8-6-18-10", "#d3dce6", 1.1) + `</g>`;
    return beine + schwanz + koerper + buendel + fluegel;
  }

  // ---------------------------------------------------------------------------
  // Rettungshelikopter: um (0, 0), etwa 220 × 110, fliegt nach rechts
  // ---------------------------------------------------------------------------
  function helikopter() {
    const kufen = S("M-26 30v12M36 30v12", "#6b7280", 3) + S("M-42 42H54q8 0 10-6", "#6b7280", 3.4);
    const heck = P("M-40 -16L-104 -8v9L-40 12z", WEISS, rand("#c3cfdc", 1.6)) + P("M-40 0L-104 -1.6v4.4L-40 7z", ROT) +
      P("M-102 -6L-112 -32h9L-94 -6z", ROT) + C(-108, -33, 2.2, "#ff8a80") +
      `<g class="bau-heckrotor">${C(-106, -6, 10, "#cbd5e0", `opacity="0.45"`)}${S("M-106 -16v20", "#4a5568", 2.4)}</g>` + C(-106, -6, 2.4, "#4a5568");
    const rumpf = P("M-46 -12Q-46 -32 -26 -32H24Q48 -32 62 -10Q68 0 66 12Q64 26 50 26H-30Q-46 26 -46 10Z", WEISS, rand("#c3cfdc", 2)) +
      P("M-46 4H66.5Q66.6 9 65.6 14H-45.6Z", ROT) + P("M-45 18H63.5Q60 24 50 25H-30Q-42 25 -45 18Z", "#e9eef4") +
      P("M28 -27h-2v24h40q-2-12-12-20q-10-5-26-4z", "#8cc8f5", rand("#5b9bd5", 1.2)) + S("M34 -22q12 0 20 10", WEISS, 2, `opacity="0.8"`) +
      R(-4, -25, 24, 19, "#8cc8f5", 4, rand("#5b9bd5", 1.2)) + S("M0 -21l8 10", WEISS, 2, `opacity="0.7"`) +
      S("M-10 -28v40", "#d3dce6", 1.4) + R(-14, -6, 3, 6, "#9aa5b1", 1.5) +
      C(-28, -10, 11, BLAU, rand("#1f4fa8", 1.2)) + R(-33.5, -16, 3.4, 12, WEISS, 1) + R(-25.9, -16, 3.4, 12, WEISS, 1) + R(-30.6, -11.7, 5, 3.4, WEISS, 0.6) +
      C(64, 16, 2.2, "#fff6c2") + C(-44, 16, 1.8, "#ff8a80");
    const haube = P("M-24 -31q4-8 14-8h22q10 0 14 8z", "#e2e8f0", rand("#c3cfdc", 1.2)) + R(-4, -42, 8, 5, "#6b7280", 2);
    const rotor = E(0, -41, 102, 3.4, "#cbd5e0", `opacity="0.35"`) +
      `<g class="bau-rotor">${R(-104, -43, 208, 4, "#4a5568", 2)}${R(-104, -43, 10, 4, "#ffd166", 2)}${R(94, -43, 10, 4, "#ffd166", 2)}</g>` + C(0, -41, 4, "#2d3748");
    return kufen + heck + rumpf + haube + rotor;
  }

  // ---------------------------------------------------------------------------
  // Wehwehchen: auf einem Tier von etwa 100 Höhe, Nullpunkt zwischen den Füssen
  // ---------------------------------------------------------------------------
  const WEH = {
    gips: () => R(-0.5, -17, 10, 14, WEISS, 4, rand("#c3cfdc", 1.2)) + S("M1.2 -13.5h6.6M1.2 -10h6.6M1.2 -6.5h6.6", "#e2e8f0", 1) +
      P("M4.5 -8.4l-2.2-2.2a1.3 1.3 0 0 1 2.2-1.6a1.3 1.3 0 0 1 2.2 1.6z", "#ff7aa2"),
    pflaster: () => {
      const streifen = (g) => G(R(-7.5, -2.3, 15, 4.6, "#f4c99a", 2.3, rand("#e0ac74", 0.6)) + R(-2.3, -2.3, 4.6, 4.6, "#fbe6cf", 0.8) +
        C(-5, -0.8, 0.45, "#d99a5e") + C(-5, 0.8, 0.45, "#d99a5e") + C(5, -0.8, 0.45, "#d99a5e") + C(5, 0.8, 0.45, "#d99a5e"), `rotate(${g})`);
      return G(streifen(35) + streifen(-35), "translate(-9 -75)");
    },
    schnupfen: ({ nase = [12, -58] } = {}) => {
      const [x, y] = nase;
      return C(x, y, 4, "#ff4d5e", `opacity="0.75"`) + C(n(x - 1.2), n(y - 1.3), 1.1, WEISS, `opacity="0.7"`) +
        G(P("M-5 -4q2-3 5-1q3-3 5 1q2 3 0 6q-2 4-5 2q-3 3-5-1q-3-3 0-7z", WEISS, rand("#c3cfdc", 1)) + S("M-2 -1l2 2M1 -2l1 3", "#d3dce6", 0.8), `translate(${n(x + 8)} ${n(y + 8)})`);
    },
    augen: () => {
      let d = "";
      for (let i = 0; i <= 36; i += 1) {
        const t = (i / 36) * Math.PI * 4.2;
        const r = 0.6 + t * 0.52;
        d += `${i ? "L" : "M"}${n(Math.cos(t) * r)} ${n(-115 + Math.sin(t) * r * 0.75)}`;
      }
      return E(0, -115, 11, 8.5, WEISS, `opacity="0.85" ${rand("#d6ccf5", 1)}`) + S(d, "#7c5ce6", 1.6) +
        funkeln(13, -121, 2.6, "#b9a6f5") + funkeln(-13, -110, 2.2, "#b9a6f5");
    },
    bauchweh: () => G(R(-7, -8, 14, 16, "#ff7a7a", 5, rand("#e0504f", 1)) + R(-2.6, -12, 5.2, 5, "#ef5350", 1.4) + R(-3.4, -14, 6.8, 3, "#c0392b", 1.2) +
      S("M-4 -3h8M-4 0.5h8M-4 4h8", "#ffb3b3", 1.1) + S("M-11 -8q-2-3 0-6M11 -6q2-3 0-6", "#ffb347", 1.3), "translate(2 -28) rotate(-12)"),
    muede: () => G(C(-6, 0, 5, "#c9d1da") + C(0, -3, 6.4, "#c9d1da") + C(6.5, 0, 5, "#c9d1da") + R(-11, -1, 22.5, 6, "#c9d1da", 3) +
      C(-1, -4.4, 3.4, "#e2e8f0") + S("M10 -10h4l-4 4h4M15 -15h3l-3 3h3", "#7c8796", 1.2), "translate(0 -120)"),
    kratzer: () => S("M12 -40l6 4M11.5 -36l6 4", "#ffd0d0", 3) + S("M12 -40l6 4M11.5 -36l6 4", "#e53935", 1.3),
    muskelkater: () => G(R(-7, -5, 14, 10, "#a8ddf0", 4, rand("#6cc3d5", 1)) + R(-8, -6.5, 16, 2.6, "#6cc3d5", 1.3) +
      R(-4.6, -2.4, 3.8, 3.8, WEISS, 0.8, `opacity="0.9"`) + R(0.6, -1.4, 3.8, 3.8, WEISS, 0.8, `opacity="0.9"`) +
      funkeln(8.5, -6, 2.4, WEISS), "translate(15 -45) rotate(15)"),
  };
  function weh(art, opt = {}) {
    const zeichne = WEH[art];
    return zeichne ? zeichne(opt || {}) : "";
  }

  // ---------------------------------------------------------------------------
  // Hotelschild: unten Mitte, 160 × 80, n von 5 Sternen golden
  // ---------------------------------------------------------------------------
  function hotelSchild(sterne = 0) {
    const anzahl = Math.max(0, Math.min(5, Math.round(Number(sterne) || 0)));
    const bett = R(-46, -70, 5, 22, WEISS, 2) + R(-6, -62, 4.5, 14, WEISS, 2) + R(-42, -56, 37, 7, WEISS, 2) +
      R(-40, -62, 10, 6, WEISS, 3) + R(-29, -61, 24, 6, GOLD.f, 2.5) + R(-42, -50, 3, 4, WEISS, 1) + R(-8, -50, 3, 4, WEISS, 1);
    const schluessel = C(17, -58, 6, "none", rand(GOLD.f, 3.6)) + R(22.5, -59.8, 24, 3.6, GOLD.f, 1.6) + R(38, -57, 3, 5, GOLD.f, 1) + R(43, -57, 3, 3.6, GOLD.f, 1);
    let reihe = "";
    for (let k = 0; k < 5; k += 1) {
      const x = -44 + k * 22;
      reihe += k < anzahl ? P(sternPfad(x, -30, 8.5, 0.47), GOLD.f, rand(GOLD.r, 1.4)) + P(sternPfad(x - 1, -31, 4, 0.47), GOLD.h)
        : P(sternPfad(x, -30, 8, 0.47), "#3b5797", `${rand("#7d93c9", 1.2)} stroke-dasharray="2.4 1.8"`);
    }
    const funkelt = anzahl ? glitzer(funkeln(-44 + (anzahl - 1) * 22 + 10, -40, 4.4), funkeln(-54, -22, 3.6) + funkeln(70, -70, 4)) : "";
    return R(-56, -18, 6, 18, "#6b7280", 2) + R(50, -18, 6, 18, "#6b7280", 2) +
      R(-80, -80, 160, 64, "#2f4a8a", 10, rand(GOLD.r, 2)) + R(-75, -75, 150, 54, "none", 7, rand(GOLD.f, 2)) +
      R(-62, -43, 124, 1.6, "#4a66a8", 0.8) + bett + schluessel + reihe + funkelt;
  }

  // ---------------------------------------------------------------------------
  // Ruhmeshalle: unten Mitte, 160 × 150
  // ---------------------------------------------------------------------------
  function ruhmeshalle() {
    const saeule = (x) => R(x - 6, -96, 12, 72, "#f4f6f9", 0, rand("#d3dce6", 1)) + S(`M${x - 2.5} -92v64M${x + 2.5} -92v64`, "#dfe5ec", 1.2) +
      R(x - 8.5, -102, 17, 6, STEIN_H, 2, rand("#c3cfdc", 1)) + R(x - 8.5, -28, 17, 6, STEIN_H, 2, rand("#c3cfdc", 1));
    const fahne = (x) => P(`M${x - 6} -96h12v22l-6-4-6 4z`, ROT) + P(sternPfad(x, -86, 3.6, 0.47), GOLD.f);
    return R(-80, -8, 160, 8, "#c3ccd6", 2) + R(-72, -16, 144, 8, "#d3dae2", 2) + R(-64, -22, 128, 6, "#e3e8ee", 2) +
      R(-58, -98, 116, 76, "#f6e7c1") + R(-58, -98, 116, 10, "#efdcae") +
      P("M-14 -22h28l8 22h-44z", ROT) + R(-14, -22, 28, 2, "#c62828") +
      C(0, -62, 26, SCHEIN, `opacity="0.5"`) + R(-13, -30, 26, 8, STEIN, 2) + G(pokal("gold"), "translate(0 -30) scale(0.6)") +
      fahne(-23) + fahne(23) + saeule(-56) + saeule(-34) + saeule(34) + saeule(56) +
      R(-70, -110, 140, 10, STEIN_H, 2, rand("#c3cfdc", 1)) + R(-70, -110, 140, 3, "#eef2f6", 1.5) +
      P("M-76 -110L0 -144L76 -110Z", "#eef2f6", rand("#c3cfdc", 2)) + P("M-56 -114L0 -139L56 -114Z", STEIN_H) +
      C(0, -124, 14, SCHEIN, `opacity="0.55"`) + goldStern(0, -124, 11, 1.8) + C(0, -146, 3.4, GOLD.f, rand(GOLD.r, 1)) +
      glitzer(funkeln(-20, -134, 5) + funkeln(18, -74, 4), funkeln(20, -136, 4.6) + funkeln(-18, -70, 4));
  }

  window.LernappBauSchmuck = { pokal, medaille, denkmal, storch, helikopter, weh, hotelSchild, ruhmeshalle };
})();
