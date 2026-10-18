/*
 * bau-leiter.js – Die Sternenleiter geht weiter: zehn Stufen über 200 Sternen.
 * ---------------------------------------------------------------------------
 * Zeichnungen im Stil von bau-art.js (Schloss, Riesenrad, Windmühle, Ballon):
 * flach, rund, freundlich – SVG als Text, ohne ids, <defs> und <text>.
 *
 * Masse in Haus-Einheiten wie in bau-art.js: Der Boden der Strasse ist y = 0,
 * nach oben negativ; das Haus steht von x = 0 bis 678 (HB). Die Hausansicht
 * zeigt die Welt von x = -440 bis HB + 440 (train-bau.js, WX0/WX1).
 *
 * Jede Zeichnung steht mit der Mitte bei x = 0 auf dem Boden (y = 0). Was am
 * Himmel ist (Polarlicht, Ballonfest, Krone), liegt mit der Mitte bei (0, 0).
 * Was auf der Wiese unter dem Gleis liegt (Wasserfall, Brücke), zeichnet wie
 * teich() gleich dort: y 110 bis 190.
 *
 * BILDER[id]:
 *   zeichne() – das Markup
 *   platz     – wo es in der Hausansicht steht: teil "hinten" (hinter den
 *               Bäumen) oder "strasse" (vor den Bäumen, auf der Wiese);
 *               translate(x y) scale(s). zuhinterst: vor allem anderen
 *               Schmuck seines Teils zeichnen (Polarlicht, Seilbahn,
 *               Sternwarte – in dieser Reihenfolge), sonst danach.
 *   viewBox   – der Ausschnitt für das Bild in der Leiter
 *   bild()    – nur wo nötig (Polarlicht): das Bild für die Leiter, wenn es
 *               anders aussehen soll als zeichne()
 *
 * Der Regenbogen (Stufe 30, durchscheinend) sieht am besten aus, wenn er
 * gleich nach dem Polarlicht kommt, noch vor dem Berg der Seilbahn: Sonst
 * färbt er den Berg (und das Schloss) blass.
 *
 * Wer glitzern soll, steckt in bau-glitzer-a/b: train-bau.js lässt die zwei
 * Gruppen abwechselnd aufleuchten (beim Leuchtturm dreht so das Licht).
 */
(() => {
  "use strict";

  const HB = 678;

  // Auf eine Stelle nach dem Komma – das Markup bleibt kurz.
  const z = (n) => Math.round(n * 10) / 10;

  // Ein Stern mit fünf Zacken um (cx, cy), als Pfad (wie sternPfad).
  function stern(cx, cy, r, innen = 0.45) {
    let d = "";
    for (let i = 0; i < 10; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * innen : r;
      d += `${i ? "L" : "M"}${z(cx + Math.cos(a) * rr)} ${z(cy + Math.sin(a) * rr)}`;
    }
    return `${d}Z`;
  }
  // Ein Funkeln mit vier Spitzen um (x, y) (wie funkeln in bau-art.js).
  function funkeln(x, y, r, farbe = "#fff3a0") {
    const k = z(r * 0.28);
    return `<path d="M${x} ${z(y - r)}L${z(x + k)} ${z(y - k)}L${z(x + r)} ${y}L${z(x + k)} ${z(y + k)}L${x} ${z(y + r)}L${z(x - k)} ${z(y + k)}L${z(x - r)} ${y}L${z(x - k)} ${z(y - k)}Z" fill="${farbe}"/>`;
  }
  // Ein grüner Hügel, b breit nach jeder Seite und h hoch, mit hellem Schwung
  // (wie der Hügel unter dem Schloss).
  function huegel(b, h, farbe = "#8fd17a", hell = "#a8de95") {
    return `<path d="M${-b} 0Q${z(-b * 0.65)} ${z(-h * 0.96)} 0 ${-h}Q${z(b * 0.65)} ${z(-h * 0.96)} ${b} 0z" fill="${farbe}"/>` +
      `<path d="M${z(-b * 0.74)} ${z(-h * 0.36)}Q${z(-b * 0.3)} ${z(-h * 0.8)} ${z(b * 0.2)} ${z(-h * 0.86)}" fill="none" stroke="${hell}" stroke-width="${z(Math.max(4, h * 0.1))}" stroke-linecap="round"/>`;
  }
  // Wie hoch der Hügel huegel(b, h) bei x ist (für Masten und Mauern).
  function huegelY(b, h, x) {
    const q = Math.min(1, Math.abs(x) / b);
    // x(u) = -b (u² + 1.3 u (1 - u)), u = 1 - t  →  0.3 u² - 1.3 u + q = 0
    const u = (1.3 - Math.sqrt(1.69 - 1.2 * q)) / 0.6;
    const t = 1 - u;
    return z(-h * (1.92 * t * u + t * t));
  }
  // Eine Wimpelkette von (x0, y0) nach (x1, y1), in der Mitte durchhängend.
  const WIMPEL = ["#ef5350", "#ffd166", "#4cc46b", "#4f8ef7", "#b28dff", "#ff8a65"];
  function kette(x0, y0, x1, y1, anzahl, durch = 10, start = 0) {
    let s = `<path d="M${x0} ${y0}Q${z((x0 + x1) / 2)} ${z((y0 + y1) / 2 + 2 * durch)} ${x1} ${y1}" fill="none" stroke="#6b7280" stroke-width="1.8"/>`;
    for (let k = 0; k < anzahl; k += 1) {
      const t = (k + 0.5) / anzahl;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t + 4 * durch * t * (1 - t);
      s += `<path d="M${z(x - 6)} ${z(y)}L${z(x + 6)} ${z(y)}L${z(x)} ${z(y + 13)}z" fill="${WIMPEL[(k + start) % WIMPEL.length]}"/>`;
    }
    return s;
  }
  // Eine geglättete Linie durch die Punkte (Mitte zu Mitte, mit Q).
  function glatt(punkte, anfang = "M", r = z) {
    let d = `${anfang}${r(punkte[0][0])} ${r(punkte[0][1])}`;
    for (let i = 1; i < punkte.length - 1; i += 1) {
      const [x, y] = punkte[i];
      const [nx, ny] = punkte[i + 1];
      d += `Q${r(x)} ${r(y)} ${r((x + nx) / 2)} ${r((y + ny) / 2)}`;
    }
    const [lx, ly] = punkte[punkte.length - 1];
    return `${d}L${r(lx)} ${r(ly)}`;
  }

  // ---------------------------------------------------------------------------
  // 1. Ein Leuchtturm auf einem kleinen Hügel, rot-weiss gestreift. Das Licht
  //    strahlt abwechselnd nach links und nach rechts (bau-glitzer-a/b) – so
  //    sieht es aus, als drehe es sich.
  // ---------------------------------------------------------------------------
  function leuchtturm() {
    const unten = -36;
    const oben = -214;
    const bu = 25;
    const bo = 16;
    const halb = (y) => bu + ((bo - bu) * (unten - y)) / (unten - oben);
    const ly = -238;
    const strahl = (r) => `<path d="M${r * 8} ${ly - 5}L${r * 150} ${ly - 32}Q${r * 160} ${ly} ${r * 150} ${ly + 32}L${r * 8} ${ly + 5}z" fill="#fff6c2" opacity="0.75"/>`;
    let s = huegel(84, 44);
    s += `<g class="bau-glitzer-a">${strahl(-1)}${funkeln(-128, ly - 46, 8)}${funkeln(-92, ly + 40, 5)}</g>` +
      `<g class="bau-glitzer-b">${strahl(1)}${funkeln(126, ly - 44, 7)}${funkeln(94, ly + 42, 5)}</g>` +
      `<circle cx="0" cy="${ly}" r="34" fill="#fff3a0" opacity="0.55"/>`;
    // Der Turm: sechs Streifen, unten rot.
    s += `<path d="M${-bu} ${unten}L${-bo} ${oben}H${bo}L${bu} ${unten}z" fill="#ffffff"/>`;
    const n = 6;
    for (let k = 0; k < n; k += 2) {
      const y0 = unten + ((oben - unten) * k) / n;
      const y1 = unten + ((oben - unten) * (k + 1)) / n;
      s += `<path d="M${z(-halb(y0))} ${z(y0)}L${z(-halb(y1))} ${z(y1)}H${z(halb(y1))}L${z(halb(y0))} ${z(y0)}z" fill="#ef5350"/>`;
    }
    s += `<path d="M${-bu} ${unten}L${-bo} ${oben}H${bo}L${bu} ${unten}z" fill="none" stroke="#c3cad5" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="M-8 ${unten}v-17a8 8 0 0 1 16 0v17z" fill="#8a5734"/>`;
    [-80.8, -140.2].forEach((y) => { s += `<rect x="-5" y="${z(y - 7)}" width="10" height="14" rx="5" fill="#4a5568"/>`; });
    // Galerie, Laterne und Dach.
    s += `<rect x="-27" y="${oben - 8}" width="54" height="9" rx="3" fill="#4a5568"/>` +
      `<path d="M-23 ${oben - 8}v-12M-11.5 ${oben - 8}v-12M0 ${oben - 8}v-12M11.5 ${oben - 8}v-12M23 ${oben - 8}v-12M-25 ${oben - 20}h50" stroke="#4a5568" stroke-width="2.4" stroke-linecap="round"/>` +
      `<rect x="-14" y="-252" width="28" height="30" rx="4" fill="#fff3a0" stroke="#4a5568" stroke-width="3"/>` +
      `<circle cx="0" cy="${ly}" r="7" fill="#ffb703"/><path d="M0 -252v30" stroke="#4a5568" stroke-width="2"/>` +
      `<path d="M-20 -251Q-18 -270 0 -278Q18 -270 20 -251z" fill="#e53935"/><circle cx="0" cy="-281" r="4.5" fill="#4a5568"/>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 2. Eine Seilbahn: ein grosser Berg mit Schnee, unten die Talstation, oben
  //    die Bergstation mit Schweizer Fahne, dazwischen das Seil und eine rote
  //    Gondel. Der Berg steht weit hinten, hinter allem anderen.
  // ---------------------------------------------------------------------------
  function seilbahn() {
    const tanne = (x, y, k = 1) => `<path d="M${x} ${z(y - 30 * k)}L${z(x + 11 * k)} ${y}H${z(x - 11 * k)}z" fill="#4f9a5f"/>`;
    // Der Berg mit Schnee auf dem Gipfel und auf der Schulter rechts.
    let s = `<path d="M-180 0L-22 -512Q-10 -534 4 -514L104 -362L138 -392Q148 -402 158 -390L220 0z" fill="#93a9c8"/>` +
      `<path d="M-10 -524Q-2 -528 4 -514L104 -362L138 -392Q148 -402 158 -390L220 0H72L26 -250z" fill="#7d95b8"/>` +
      `<path d="M-44 -446L-22 -512Q-10 -534 4 -514L42 -456L26 -448L12 -470L-2 -440L-20 -462z" fill="#ffffff"/>` +
      `<path d="M128 -380L138 -392Q148 -402 158 -390L168 -362L154 -370L144 -358L136 -374z" fill="#ffffff"/>`;
    // Links davor eine grüne Alp – oben ist Platz (für die Sternwarte).
    s += `<path d="M-220 0C-218 -190 -200 -298 -150 -300C-100 -298 -70 -190 -40 0z" fill="#8fd17a"/>` +
      `<path d="M-200 -150Q-190 -262 -150 -282" fill="none" stroke="#a8de95" stroke-width="10" stroke-linecap="round"/>`;
    s += tanne(-196, -84, 0.9) + tanne(-178, -40, 1.1) + tanne(-84, -96, 0.9) + tanne(-70, -40, 1.1) + tanne(150, 0, 1) + tanne(172, -2, 1.2) + tanne(196, 0, 0.9);
    // Talstation unten, Bergstation unter dem Gipfel, die Schweizer Fahne zuoberst.
    const tal = [-140, -46];
    const berg = [-30, -470];
    s += `<rect x="-172" y="-40" width="52" height="40" rx="4" fill="#f3e3c3" stroke="#c9b28f" stroke-width="2.5"/><path d="M-178 -38L-146 -60L-114 -38z" fill="#ef5350"/>` +
      `<rect x="-162" y="-26" width="12" height="12" rx="2" fill="#cfeaff"/><rect x="-142" y="-26" width="12" height="26" rx="2" fill="#8a5734"/>`;
    s += `<rect x="-48" y="-472" width="38" height="28" rx="4" fill="#f3e3c3" stroke="#c9b28f" stroke-width="2.5"/><path d="M-54 -470L-29 -488L-4 -470z" fill="#ef5350"/>` +
      `<rect x="-39" y="-463" width="10" height="10" rx="2" fill="#cfeaff"/>`;
    s += `<path d="M-8 -526V-568" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/><rect x="-7" y="-569" width="26" height="24" rx="2" fill="#e53935"/>` +
      `<path d="M3.5 -563h5v5h5v5h-5v5h-5v-5h-5v-5h5z" fill="#ffffff"/>`;
    // Zwei Seile und die rote Gondel.
    s += `<path d="M${tal[0]} ${tal[1]}L${berg[0]} ${berg[1]}M${tal[0] + 10} ${tal[1] + 1}L${berg[0] + 10} ${berg[1] + 1}" stroke="#4a5568" stroke-width="2.4"/>`;
    const t = 0.7;
    const gx = z(tal[0] + (berg[0] - tal[0]) * t + 5);
    const gy = z(tal[1] + (berg[1] - tal[1]) * t + 0.5);
    s += `<g transform="translate(${gx} ${gy})"><circle r="4.5" fill="#4a5568"/><path d="M0 0v15" stroke="#4a5568" stroke-width="3"/>` +
      `<rect x="-17" y="13" width="34" height="7" rx="3.5" fill="#4a5568"/>` +
      `<rect x="-25" y="18" width="50" height="40" rx="9" fill="#e53935" stroke="#b71c1c" stroke-width="2.4"/>` +
      `<rect x="-19" y="24" width="16" height="14" rx="3" fill="#e6f4ff"/><rect x="3" y="24" width="16" height="14" rx="3" fill="#e6f4ff"/>` +
      `<path d="M-2.5 42h5v4h4v5h-4v4h-5v-4h-4v-5h4z" fill="#ffffff"/></g>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 3. Eine Sternwarte auf einem Hügel: ein runder Bau mit Kuppel, durch den
  //    Spalt schaut das Fernrohr zu den Sternen (die funkeln).
  // ---------------------------------------------------------------------------
  function sternwarte() {
    const h = 64;
    let s = huegel(112, h);
    // Die Sterne, zu denen das Fernrohr schaut.
    s += `<g class="bau-glitzer-a"><path d="${stern(84, -214, 11)}" fill="#ffd34d"/>${funkeln(48, -236, 7)}</g>` +
      `<g class="bau-glitzer-b"><path d="${stern(110, -180, 8)}" fill="#ffd34d"/>${funkeln(70, -168, 6)}</g>`;
    // Das Fernrohr (hinter der Kuppel, schaut durch den Spalt).
    s += `<g transform="rotate(-38 6 -150)"><path d="M0 -156L62 -161V-139L0 -144z" fill="#9aa5b1" stroke="#6b7280" stroke-width="2" stroke-linejoin="round"/>` +
      `<rect x="58" y="-164" width="14" height="28" rx="4" fill="#4f8ef7" stroke="#2f5fb3" stroke-width="2"/><rect x="24" y="-158" width="8" height="16" rx="2" fill="#4f8ef7"/></g>`;
    // Der Bau.
    s += `<rect x="-44" y="-132" width="88" height="${132 - h + 6}" rx="3" fill="#f1f4f9" stroke="#a8b3c4" stroke-width="2.5"/>` +
      `<path d="M-12 ${-h + 4}v-26a12 12 0 0 1 24 0v26z" fill="#5b6b82"/>` +
      `<rect x="-36" y="-110" width="14" height="14" rx="7" fill="#cfeaff" stroke="#a8b3c4" stroke-width="2"/><rect x="22" y="-110" width="14" height="14" rx="7" fill="#cfeaff" stroke="#a8b3c4" stroke-width="2"/>` +
      `<rect x="-50" y="-138" width="100" height="10" rx="4" fill="#c9d3e0" stroke="#a8b3c4" stroke-width="2"/>`;
    // Die Kuppel mit dem Spalt.
    s += `<path d="M-46 -137A46 46 0 0 1 46 -137z" fill="#d6dee9" stroke="#8a9bb0" stroke-width="2.5"/>` +
      `<path d="M-28 -142Q-30 -166 -10 -176" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>` +
      `<path d="M2 -183Q10 -183 17 -180L13 -138H1z" fill="#3a4a63"/>` +
      `<circle cx="0" cy="-185" r="5" fill="#ffd166" stroke="#d68f00" stroke-width="1.5"/>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 4. Ein buntes Zirkuszelt auf einem Hügel, mit Wimpeln und Fahne.
  // ---------------------------------------------------------------------------
  function zirkus() {
    const b = 140;
    const h = 66;
    const fuss = -46;      // wo die Wand unten aufhört
    const rand = -128;     // wo das Dach beginnt
    const spitze = -228;
    let s = huegel(b, h);
    // Die Wimpel hinter dem Zelt: von der Spitze zu zwei Masten.
    const mast = 118;
    const mastOben = -150;
    s += kette(0, spitze - 12, -mast, mastOben, 6, 9) + kette(0, spitze - 12, mast, mastOben, 6, 9, 3);
    [-mast, mast].forEach((x) => {
      s += `<path d="M${x} ${huegelY(b, h, x) + 4}V${mastOben}" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${mastOben - 3}" r="4.5" fill="#ffd166" stroke="#d68f00" stroke-width="1.5"/>`;
    });
    // Die Wand: rot und gelb gestreift.
    const wand = ["#ef5350", "#ffd166"];
    for (let k = 0; k < 8; k += 1) s += `<rect x="${-80 + k * 20}" y="${rand}" width="20" height="${fuss - rand}" fill="${wand[k % 2]}"/>`;
    s += `<rect x="-80" y="${rand}" width="160" height="${fuss - rand}" fill="none" stroke="#c0392b" stroke-width="2"/>`;
    // Der Eingang mit zurückgebundenem Vorhang.
    s += `<path d="M-20 ${fuss}V-96Q0 -116 20 -96V${fuss}z" fill="#4a2c5e"/>` +
      `<path d="M-22 -100Q-4 -94 -10 ${fuss}H-22z" fill="#c62828"/><path d="M22 -100Q4 -94 10 ${fuss}H22z" fill="#c62828"/>` +
      `<circle cx="-14" cy="-72" r="3" fill="#ffd166"/><circle cx="14" cy="-72" r="3" fill="#ffd166"/>`;
    // Das Dach: rot-weiss, unten ein Rand aus blauen und grünen Bögen.
    const dach = ["#ef5350", "#ffffff"];
    for (let k = 0; k < 8; k += 1) s += `<path d="M0 ${spitze}L${-96 + k * 24} ${rand}h24z" fill="${dach[k % 2]}" stroke="#e2c6c6" stroke-width="0.8" stroke-linejoin="round"/>`;
    const bogen = ["#4f8ef7", "#4cc46b"];
    for (let k = 0; k < 8; k += 1) s += `<path d="M${-96 + k * 24} ${rand}a12 11 0 0 0 24 0z" fill="${bogen[k % 2]}"/>`;
    s += `<path d="${stern(0, -164, 13)}" fill="#ffd34d" stroke="#d68f00" stroke-width="1.6" stroke-linejoin="round"/>`;
    // Die Fahne oben.
    s += `<path d="M0 ${spitze}V${spitze - 30}" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/><path d="M1.5 ${spitze - 30}l28 8-28 8z" fill="#4cc46b"/>` +
      `<circle cx="0" cy="${spitze - 32}" r="4" fill="#ffd166" stroke="#d68f00" stroke-width="1.4"/>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 5. Ein Wasserfall auf der Wiese unter dem Gleis (y 110 bis 190, wie
  //    teich()): Aus einem Felsen fällt das Wasser in ein kleines Becken.
  // ---------------------------------------------------------------------------
  function wasserfall() {
    let s = `<ellipse cx="14" cy="167" rx="78" ry="18" fill="#4f9fd8"/><ellipse cx="10" cy="164" rx="64" ry="12" fill="#7fc8f8"/>`;
    // Der Felsen, oben etwas Gras.
    s += `<path d="M-86 170Q-92 134 -70 119Q-48 108 -22 112Q2 116 4 140L4 170z" fill="#9aa5b1"/>` +
      `<path d="M-80 160Q-82 136 -66 124Q-56 118 -48 120Q-64 132 -64 162z" fill="#b8c2cf"/>` +
      `<path d="M-14 120Q2 124 4 146L4 170H-8Q-4 140 -14 120z" fill="#7d8796"/>` +
      `<path d="M-70 122q4-8 9-1q4-7 9 0q5-6 9 1" fill="none" stroke="#4aa34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    // Das fallende Wasser mit weissen Streifen.
    s += `<path d="M-52 119q14-5 30 0q4 2 4 6v38h-38v-38q0-4 4-6z" fill="#7fc8f8"/>` +
      `<path d="M-48 124v34M-38 120v42M-28 122v38" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="9 6" opacity="0.9"/>` +
      `<path d="M-52 120q14-5 30 0" fill="none" stroke="#cfeaff" stroke-width="3" stroke-linecap="round"/>`;
    // Gischt unten, Wellen im Becken.
    s += `<circle cx="-48" cy="163" r="6" fill="#ffffff"/><circle cx="-36" cy="165" r="7.5" fill="#ffffff"/><circle cx="-24" cy="163" r="5.5" fill="#ffffff"/>` +
      `<circle cx="-56" cy="155" r="2.4" fill="#ffffff"/><circle cx="-16" cy="153" r="2.4" fill="#ffffff"/><circle cx="-12" cy="160" r="1.8" fill="#ffffff"/>` +
      `<path d="M8 168q14-5 28 0M44 162q12-4 24 0M-2 176q12-4 24 0" stroke="#cfeaff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    // Steine und Schilf am Rand.
    s += `<ellipse cx="88" cy="170" rx="9" ry="6" fill="#b8c2cf"/><ellipse cx="76" cy="180" rx="6" ry="4" fill="#9aa5b1"/><ellipse cx="-70" cy="178" rx="8" ry="5" fill="#b8c2cf"/>` +
      `<path d="M96 168v-26M103 170v-20M110 168v-24" stroke="#3f8f3a" stroke-width="3" stroke-linecap="round"/>` +
      `<ellipse cx="96" cy="140" rx="3" ry="8" fill="#8a5734"/><ellipse cx="110" cy="142" rx="3" ry="8" fill="#8a5734"/>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 6. Ein Polarlicht: weiche grüne und violette Vorhänge am Himmel, sehr gross
  //    und durchscheinend, mit ein paar Sternen. Steht hinter allem.
  // ---------------------------------------------------------------------------
  function polarlicht() {
    const r = Math.round;
    // Ein Vorhang von x0 bis x1: unten ein welliger, heller Saum, darüber
    // Strahlen, die nach oben ausbleichen (zwei Schichten übereinander). An
    // den Enden läuft er spitz aus.
    const vorhang = (x0, x1, y0, hoch, welle, phase, farbe, deckt, schichten = [1, 0.55]) => {
      const n = Math.max(6, Math.round((x1 - x0) / 70));
      const xs = Array.from({ length: n + 1 }, (_, k) => x0 + ((x1 - x0) * k) / n);
      const huelle = (x) => Math.sin((Math.PI * (x - x0)) / (x1 - x0)) ** 0.6;
      const unten = xs.map((x) => [x, y0 + welle * Math.sin(x / 150 + phase) + welle * 0.4 * Math.sin(x / 70 + phase * 2)]);
      let s = "";
      schichten.forEach((f, j) => {
        const oben = unten.map(([x, y]) => [x, y - hoch * f * huelle(x) * (0.8 + 0.2 * Math.sin(x / 60 + phase * 3 + j * 2))]).reverse();
        s += `<path d="${glatt(unten, "M", r)}${glatt(oben, "L", r)}z" fill="${farbe}" opacity="${deckt}"/>`;
      });
      const innen = unten.slice(1, -1);
      s += `<path d="${innen.map(([x, y]) => `M${r(x)} ${r(y - 8)}v${r(-hoch * 0.8 * huelle(x))}`).join("")}" stroke="#d2ffe9" stroke-width="9" stroke-linecap="round" opacity="0.2"/>`;
      return s + `<path d="${glatt(innen, "M", r)}" fill="none" stroke="#c4ffe1" stroke-width="6" stroke-linecap="round" opacity="0.45"/>`;
    };
    let s = vorhang(-740, 520, 45, 210, 30, 1.3, "#a97bff", 0.16) +
      vorhang(120, 720, 25, 150, 24, 3, "#ff8fd0", 0.13, [1]) +
      vorhang(-700, 260, 175, 250, 40, 0.2, "#3ee69b", 0.2) +
      vorhang(-160, 740, 125, 210, 36, 2.1, "#3ee69b", 0.18);
    // Ein paar Sterne.
    const sterne = [[-560, -115, 10], [-330, -195, 8], [-90, -165, 11], [170, -215, 9], [430, -155, 10], [650, -195, 8]];
    const gruppe = (rest) => sterne.filter((_, k) => k % 2 === rest).map(([x, y, rr]) => `<path d="${stern(x, y, rr)}" fill="#fff6c2" stroke="#e8c45a" stroke-width="1.2" stroke-linejoin="round"/>`).join("");
    s += `<g class="bau-glitzer-a">${gruppe(0)}${funkeln(-210, -85, 9, "#ffffff")}${funkeln(300, -105, 8, "#ffffff")}</g>` +
      `<g class="bau-glitzer-b">${gruppe(1)}${funkeln(30, -75, 8, "#ffffff")}${funkeln(560, -75, 9, "#ffffff")}</g>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 7. Eine Rakete auf der Startrampe, freundlich wie in «Die Reise zum Mond»:
  //    rot-weiss, runde Fenster, daneben der Turm; unten dampft es schon.
  // ---------------------------------------------------------------------------
  function rakete() {
    // Die Rampe und der Turm.
    let s = `<rect x="-66" y="-24" width="132" height="10" rx="4" fill="#b8c2cf"/><rect x="-58" y="-16" width="116" height="16" rx="4" fill="#9aa5b1"/>` +
      `<path d="M-36 -24l10-22M36 -24l-10-22" stroke="#6b7280" stroke-width="5" stroke-linecap="round"/>`;
    let gitter = "";
    for (let y = -24; y > -246; y -= 24) gitter += `M50 ${y}L72 ${y - 24}M72 ${y}L50 ${y - 24}`;
    s += `<path d="${gitter}" stroke="#ffb15c" stroke-width="2.4"/>` +
      `<path d="M50 -22V-262M72 -22V-262M46 -262H76M26 -196H50M26 -150H50" stroke="#ff9f43" stroke-width="4.5" stroke-linecap="round"/>` +
      `<circle cx="61" cy="-268" r="6" fill="#ef5350"/>`;
    // Die Rakete: Düse, Flossen, Rumpf, Spitze.
    s += `<path d="M-13 -46h26l7 18h-40z" fill="#6b7280"/>` +
      `<path d="M-24 -112Q-50 -92 -52 -42Q-40 -52 -24 -54z" fill="#ef5350" stroke="#c62828" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M24 -112Q50 -92 52 -42Q40 -52 24 -54z" fill="#ef5350" stroke="#c62828" stroke-width="2" stroke-linejoin="round"/>` +
      `<rect x="-26" y="-228" width="52" height="184" rx="16" fill="#f4f6fa" stroke="#b8c2cf" stroke-width="2.5"/>` +
      `<path d="M-25 -214Q-23 -262 0 -296Q23 -262 25 -214Q0 -206 -25 -214z" fill="#ef5350" stroke="#c62828" stroke-width="2" stroke-linejoin="round"/>` +
      `<rect x="-26" y="-92" width="52" height="16" fill="#ef5350"/><rect x="-5" y="-96" width="10" height="58" rx="4" fill="#c62828"/>` +
      `<path d="M-18 -224Q-20 -170 -16 -112" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
    // Runde Fenster und ein Stern.
    s += `<circle cx="0" cy="-176" r="14" fill="#7fc8f8" stroke="#4a5568" stroke-width="4"/><circle cx="-4" cy="-180" r="4" fill="#ffffff" opacity="0.85"/>` +
      `<circle cx="0" cy="-134" r="9" fill="#7fc8f8" stroke="#4a5568" stroke-width="3.5"/><circle cx="-2.5" cy="-136.5" r="2.6" fill="#ffffff" opacity="0.85"/>` +
      `<path d="${stern(0, -106, 8)}" fill="#ffd34d"/>`;
    // Dampf unten, Funkeln oben.
    s += `<g fill="#ffffff" stroke="#dfe6ee" stroke-width="1.5"><circle cx="-46" cy="-30" r="10"/><circle cx="-32" cy="-22" r="12"/><circle cx="-60" cy="-20" r="8"/><circle cx="34" cy="-24" r="10"/><circle cx="20" cy="-20" r="8"/></g>` +
      `<g class="bau-glitzer-a">${funkeln(-38, -270, 8)}${funkeln(30, -224, 5)}</g><g class="bau-glitzer-b">${funkeln(34, -292, 7)}${funkeln(-40, -228, 5)}</g>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 8. Eine Regenbogenbrücke über einen Bach, auf der Wiese unter dem Gleis
  //    (y 110 bis 190, wie teich()). Der Bach kommt von hinten nach vorn.
  // ---------------------------------------------------------------------------
  function regenbogenbruecke() {
    let s = `<path d="M-12 112Q-22 150 -44 190H44Q22 150 12 112z" fill="#4f9fd8"/>` +
      `<path d="M-6 112Q-14 150 -30 190H30Q14 150 6 112z" fill="#7fc8f8"/>` +
      `<path d="M-6 132q6-3 12 0M-14 156q8-3 16 0M2 176q10-4 20 0M-24 182q6-2 12 0" stroke="#cfeaff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    // Steine am Ufer.
    s += `<ellipse cx="-50" cy="184" rx="9" ry="5" fill="#b8c2cf"/><ellipse cx="54" cy="182" rx="7" ry="4.5" fill="#9aa5b1"/><ellipse cx="-24" cy="126" rx="5" ry="3" fill="#b8c2cf"/>`;
    // Die Brücke: sechs Farben als Bogen, darauf Weg und Geländer.
    const farben = ["#ef5350", "#ff9f43", "#ffd166", "#4cc46b", "#4f8ef7", "#9b6bd8"];
    const cy = 175;
    farben.forEach((c, k) => {
      const rx = 86 - k * 5;
      const ry = 44 - k * 5;
      s += `<path d="M${-rx} ${cy}A${rx} ${ry} 0 0 1 ${rx} ${cy}" fill="none" stroke="${c}" stroke-width="5.5"/>`;
    });
    s += `<path d="M-90 ${cy}A90 48 0 0 1 90 ${cy}" fill="none" stroke="#fffdf4" stroke-width="3.5"/>`;
    // Geländer: Pfosten auf dem Bogen, oben ein Handlauf.
    let pfosten = "";
    for (let k = 1; k < 8; k += 1) {
      const a = Math.PI - (k * Math.PI) / 8;
      const x = Math.cos(a) * 90;
      const y = cy - Math.sin(a) * 48;
      pfosten += `M${z(x)} ${z(y)}v-12`;
    }
    s += `<path d="${pfosten}" stroke="#fffdf4" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M-84 ${cy - 26}A84 46 0 0 1 84 ${cy - 26}" fill="none" stroke="#fffdf4" stroke-width="3" transform="translate(0 6)"/>`;
    // Die Füsse der Brücke.
    s += `<rect x="-100" y="${cy - 4}" width="22" height="12" rx="5" fill="#b8c2cf"/><rect x="78" y="${cy - 4}" width="22" height="12" rx="5" fill="#b8c2cf"/>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // 9. Ein Ballonfest: vier kleine Heissluftballone in verschiedenen Farben,
  //    verschieden hoch. Kleiner als der grosse Ballon (Stufe 20) und mit
  //    eigenen Mustern: Schweizer Kreuz, Gelb-Orange, Stern, Bänder.
  // ---------------------------------------------------------------------------
  function ballonfest() {
    // Die Hülle: oben ein Kreis (r 28 um 0, -40), unten schmal bis zum Ring.
    const huelle = "M-7 -2C-18 -12 -28 -26 -28 -40A28 28 0 0 1 28 -40C28 -26 18 -12 7 -2z";
    const korb = `<path d="M-7 -2l1 8M7 -2l-1 8" stroke="#8a5734" stroke-width="1.4"/><rect x="-8" y="-5" width="16" height="4" rx="2" fill="#8a5734"/>` +
      `<rect x="-8" y="6" width="16" height="11" rx="2.5" fill="#c88c5c" stroke="#8a5734" stroke-width="1.5"/>`;
    const glanz = `<path d="M-18 -50Q-14 -62 -4 -65" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
    // Ein waagrechtes Band im Kreis zwischen y1 und y2 (y relativ zur Mitte).
    const band = (y1, y2, farbe) => {
      const w1 = z(Math.sqrt(28 * 28 - y1 * y1));
      const w2 = z(Math.sqrt(28 * 28 - y2 * y2));
      return `<path d="M${-w1} ${-40 + y1}A28 28 0 0 0 ${-w2} ${-40 + y2}H${w2}A28 28 0 0 0 ${w1} ${-40 + y1}z" fill="${farbe}"/>`;
    };
    const muster = [
      // Rot mit Schweizer Kreuz
      `<path d="${huelle}" fill="#e53935"/><path d="M-4 -53h8v9h9v8h-9v9h-8v-9h-9v-8h9z" fill="#ffffff"/>`,
      // Gelb mit orangen Bahnen
      `<path d="${huelle}" fill="#ffd166"/><ellipse cx="0" cy="-40" rx="17" ry="28" fill="#ff9f43"/><ellipse cx="0" cy="-40" rx="7" ry="28" fill="#ffd166"/>` +
        `<path d="M-4 -2C-10 -12 -17 -26 -17 -40H17C17 -26 10 -12 4 -2z" fill="#ff9f43"/><path d="M-2 -2C-4 -12 -7 -26 -7 -40H7C7 -26 4 -12 2 -2z" fill="#ffd166"/>`,
      // Türkis mit goldenem Stern
      `<path d="${huelle}" fill="#4fc3f7"/>${band(-4, 8, "#ffffff")}<path d="${stern(0, -44, 13)}" fill="#ffd34d" stroke="#d68f00" stroke-width="1.5" stroke-linejoin="round"/>`,
      // Violett mit rosa Bändern
      `<path d="${huelle}" fill="#9b6bd8"/>${band(-22, -14, "#ff8fc8")}${band(-3, 5, "#ff8fc8")}${band(14, 21, "#ff8fc8")}`,
    ];
    // Wo die vier fliegen (Mitte, Grösse), von links nach rechts.
    const orte = [[-118, -30, 1], [-38, 46, 0.8], [48, -62, 1.12], [128, 14, 0.74]];
    return orte.map(([x, y, k], i) => `<g transform="translate(${x} ${y}) scale(${k})">${korb}${muster[i]}<path d="${huelle}" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.5"/>${glanz}</g>`).join("");
  }

  // ---------------------------------------------------------------------------
  // 10. Die Krone des Dorfs: eine grosse goldene Krone schwebt am Himmel, mit
  //     Edelsteinen, Schein und Funkeln (bau-glitzer-a/b).
  // ---------------------------------------------------------------------------
  function dorfkrone() {
    let s = `<ellipse cx="0" cy="-16" rx="124" ry="84" fill="#fff3a0" opacity="0.4"/><ellipse cx="0" cy="-8" rx="98" ry="64" fill="#fff8cf" opacity="0.5"/>`;
    s += `<path d="M-78 36L-92 -42L-44 -2L0 -66L44 -2L92 -42L78 36z" fill="#ffc93c" stroke="#a86b00" stroke-width="4" stroke-linejoin="round"/>` +
      `<path d="M-70 26L-80 -24L-44 8L0 -48L-8 8L-60 26z" fill="#ffe27a"/>` +
      `<rect x="-84" y="22" width="168" height="26" rx="8" fill="#f5a300" stroke="#a86b00" stroke-width="3.5"/>` +
      `<path d="M-76 28h152" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>`;
    // Edelsteine auf dem Band und Perlen auf den Spitzen.
    const steine = [[-56, "#ef5350"], [-28, "#4cc46b"], [0, "#4f8ef7"], [28, "#4cc46b"], [56, "#ef5350"]];
    s += steine.map(([x, c], k) => (k % 2 ? `<circle cx="${x}" cy="35" r="6" fill="${c}" stroke="#a86b00" stroke-width="1.5"/>`
      : `<path d="M${x} 26l8 9-8 9-8-9z" fill="${c}" stroke="#a86b00" stroke-width="1.5" stroke-linejoin="round"/>`)).join("") +
      steine.map(([x]) => `<circle cx="${x - 2}" cy="32" r="1.8" fill="#ffffff" opacity="0.9"/>`).join("");
    s += `<circle cx="-92" cy="-48" r="9" fill="#ff7aa2" stroke="#a86b00" stroke-width="2"/><circle cx="92" cy="-48" r="9" fill="#4cc46b" stroke="#a86b00" stroke-width="2"/>` +
      `<circle cx="-44" cy="-6" r="6" fill="#fff8e7" stroke="#a86b00" stroke-width="1.5"/><circle cx="44" cy="-6" r="6" fill="#fff8e7" stroke="#a86b00" stroke-width="1.5"/>` +
      `<path d="${stern(0, -82, 17, 0.47)}" fill="#ffe27a" stroke="#a86b00" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M-6 -2Q0 -10 6 -2Q0 6 -6 -2z" fill="#4f8ef7" stroke="#a86b00" stroke-width="1.5"/>`;
    s += `<g class="bau-glitzer-a">${funkeln(-112, -66, 11)}${funkeln(70, -88, 9)}${funkeln(108, 30, 8)}${funkeln(-30, -40, 6, "#ffffff")}</g>` +
      `<g class="bau-glitzer-b">${funkeln(112, -70, 10)}${funkeln(-72, -90, 8)}${funkeln(-108, 32, 8)}${funkeln(34, -36, 6, "#ffffff")}</g>`;
    return s;
  }

  // ---------------------------------------------------------------------------
  // Die Bilder mit ihrem Platz in der Hausansicht und dem Ausschnitt für die
  // Leiter.
  // ---------------------------------------------------------------------------
  // Die Reihenfolge hier ist die zum Zeichnen (von hinten nach vorn), nicht
  // die der Leiter.
  const BILDER = {
    // Hinter allem, über dem Dach.
    polarlicht: {
      zeichne: polarlicht,
      // Für die Leiter: auf einem Stück Nachthimmel, sonst sieht man es kaum.
      bild: () => `<rect x="-440" y="-230" width="880" height="470" rx="70" fill="#27336a"/>${polarlicht()}`,
      platz: { teil: "hinten", x: HB / 2, y: -840, s: 1, zuhinterst: true },
      viewBox: "-440 -230 880 470",
    },
    // Der Berg füllt den Hintergrund links, hinter Schloss und Windmühle.
    seilbahn: { zeichne: seilbahn, platz: { teil: "hinten", x: -220, y: 0, s: 1, zuhinterst: true }, viewBox: "-226 -574 452 578" },
    // Auf der grünen Alp der Seilbahn (oben bei x -370, y -300): nach der
    // Seilbahn zeichnen und mit ihr verschieben.
    sternwarte: { zeichne: sternwarte, platz: { teil: "hinten", x: -372, y: -296, s: 0.55, zuhinterst: true }, viewBox: "-118 -248 236 252" },
    // Links neben dem Haus, zwischen Schloss und Haus; das Licht strahlt über
    // das Schloss.
    leuchtturm: { zeichne: leuchtturm, platz: { teil: "hinten", x: -78, y: 0, s: 1 }, viewBox: "-160 -292 320 296" },
    // Rechts neben dem Haus, unter dem grossen Ballon.
    rakete: { zeichne: rakete, platz: { teil: "hinten", x: HB + 52, y: 0, s: 0.95 }, viewBox: "-72 -304 152 308" },
    // Hoch rechts, über dem blauen Drachen.
    ballonfest: { zeichne: ballonfest, platz: { teil: "hinten", x: HB + 222, y: -850, s: 1 }, viewBox: "-152 -142 310 210" },
    // Rechts am Himmel, zwischen Haus, grossem Ballon und blauem Drachen.
    dorfkrone: { zeichne: dorfkrone, platz: { teil: "hinten", x: HB + 97, y: -690, s: 0.8 }, viewBox: "-128 -106 256 178" },
    // Auf der Wiese unter dem Haus.
    wasserfall: { zeichne: wasserfall, platz: { teil: "strasse", x: 100, y: 0, s: 1 }, viewBox: "-96 102 216 86" },
    regenbogenbruecke: { zeichne: regenbogenbruecke, platz: { teil: "strasse", x: 480, y: 0, s: 1 }, viewBox: "-106 106 212 88" },
    // Rechts zwischen Karussell und Denkmal, vor dem Riesenrad – wie an der
    // Chilbi; vorne, damit die Speichen nicht über das Zelt laufen.
    zirkus: { zeichne: zirkus, platz: { teil: "strasse", x: HB + 307, y: 0, s: 0.52 }, viewBox: "-146 -268 292 272" },
  };

  window.LernappBauLeiter = { BILDER };
})();
