/*
 * bau-wetter.js – Jahreszeiten, Wetter und Feste in der Bauecke.
 * ---------------------------------------------------------------------------
 * Was draussen ist, sieht man am Himmel, an den Bäumen, auf dem Dach und an
 * der Strasse:
 *
 *   Jahreszeit  nach dem Datum des Geräts: Frühling (März–Mai), Sommer
 *               (Juni–August), Herbst (September–November), Winter
 *               (Dezember–Februar).
 *   Wetter      Sonne, Wolken, Regen, Schnee oder Wind – je drei Stunden
 *               gleich und ausgerechnet aus dem Datum und der Tageszeit, ohne
 *               Zufall: Alle Geräte sehen dasselbe Wetter. Schnee fällt im
 *               Winter (selten Ende November und Anfang März), Wind weht vor
 *               allem im Herbst, im Sommer scheint meist die Sonne. Nach einem
 *               Regen kommt mit der Sonne ein Regenbogen.
 *   Feste       Ostern, 1. August, Halloween, Räbeliechtli, Samichlaus und
 *               Weihnachten, je mit etwas Schmuck an der Strasse.
 *
 * Bei Regen und Schnee bleiben die Tiere lieber drinnen (heute().drinnen).
 *
 * Der Himmel (himmel) ist HTML hinter dem Haus: Wolken und Regenbogen im
 * Himmel, darüber eine einzige bewegte Ebene, in der Regen, Schnee und
 * Blätter mit CSS fallen (bau-wetter.css) – der Behälter wandert als Ganzes,
 * die Teilchen darin stehen still. Bäume, Schnee auf dem Dach und der
 * Schmuck an der Strasse sind SVG wie in bau-art.js und bewegen sich nicht
 * (Konzept 7.2 und 7.3).
 *
 * Koordinaten wie in bau-art.js: Haus-Einheiten, die Strasse bei y = 0, nach
 * oben negativ, das Haus von x = 0 bis HB = 678.
 *
 * Gesprochen wird nur aus einer festen Liste (saetze), denn die Sätze sind
 * aufgenommen. heute().text ist immer «Jahreszeit. Wetter.» – zwei Sätze, die
 * kids.js einzeln abspielt.
 *
 * Einbau (train-bau.js), nach bau-art.js geladen, bau-wetter.css nach bau.css:
 *   const z = W.heute();
 *   W.anwenden(host, els.himmel, els.welt, z);   // Klassen, Wolken, Regen …
 *   hausInhalt: W.baum(x, gross, z.jahreszeit, nr) statt art.baum(x, gross);
 *               nach Bäumen und Laternen W.deko(z.jahreszeit, z.fest);
 *               nach dem Dach, wenn z.schneeLiegt, W.dachSchnee(form, dachY).
 *   passeBoden: wenn z.schneeLiegt, `${W.bodenSchnee(u)}, ${A().bodenStil(u, phase)}`.
 *   Alle drei Stunden (oder beim Öffnen) neu: heute() ändert sich nur dann.
 */
(() => {
  "use strict";

  const HB = 678;
  const JAHRESZEITEN = ["fruehling", "sommer", "herbst", "winter"];
  const WETTER = ["sonne", "wolken", "regen", "schnee", "wind"];
  const FESTE = ["ostern", "augustfeier", "halloween", "raebeliechtli", "samichlaus", "weihnachten"];
  // Alle Klassen, die klasse() setzen kann – zum Entfernen vor dem Wechsel.
  const KLASSEN = [...JAHRESZEITEN, ...WETTER].map((k) => `is-${k}`);

  // ---------------------------------------------------------------------------
  // Zufall ohne Zufall: eine Zahl aus einem Text
  // ---------------------------------------------------------------------------
  function hash(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  }
  const zahl = (text) => hash(text) / 4294967296;   // 0 ≤ zahl < 1
  const zwei = (n) => String(n).padStart(2, "0");
  const r1 = (n) => Math.round(n * 10) / 10;

  // ---------------------------------------------------------------------------
  // Kalender
  // ---------------------------------------------------------------------------
  function jahreszeitVon(monat) {
    if (monat >= 2 && monat <= 4) return "fruehling";
    if (monat >= 5 && monat <= 7) return "sommer";
    if (monat >= 8 && monat <= 10) return "herbst";
    return "winter";
  }

  // Ostersonntag nach dem gregorianischen Kalender (Meeus, Jones, Butcher).
  function ostersonntag(jahr) {
    const a = jahr % 19;
    const b = Math.floor(jahr / 100);
    const c = jahr % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = h + l - 7 * m + 114;
    return new Date(jahr, Math.floor(n / 31) - 1, (n % 31) + 1);
  }
  const tagNummer = (j, m, t) => Math.round(Date.UTC(j, m, t) / 864e5);

  // Welches Fest gerade ist. Halloween und Räbeliechtli berühren sich Anfang
  // November: bis zum 3. ist Halloween, danach bis zum 14. Räbeliechtli.
  function festVon(j, m, t) {
    const o = ostersonntag(j);
    if (Math.abs(tagNummer(j, m, t) - tagNummer(j, o.getMonth(), o.getDate())) <= 7) return "ostern";
    if ((m === 6 && t === 31) || (m === 7 && t === 1)) return "augustfeier";
    if ((m === 9 && t >= 28) || (m === 10 && t <= 3)) return "halloween";
    if (m === 10 && t <= 14) return "raebeliechtli";
    if (m === 11 && t >= 4 && t <= 8) return "samichlaus";
    if (m === 11 && t >= 18) return "weihnachten";
    return "";
  }

  // ---------------------------------------------------------------------------
  // Das Wetter
  // ---------------------------------------------------------------------------
  // Wie oft welches Wetter ist, in Prozent, je nach Jahreszeit.
  function verteilung(m, t) {
    const zeit = jahreszeitVon(m);
    const g = zeit === "sommer" ? { sonne: 60, wolken: 20, regen: 15, schnee: 0, wind: 5 }
      : zeit === "herbst" ? { sonne: 26, wolken: 26, regen: 22, schnee: 0, wind: 26 }
        : zeit === "winter" ? { sonne: 28, wolken: 25, regen: 7, schnee: 33, wind: 7 }
          : { sonne: 40, wolken: 26, regen: 24, schnee: 0, wind: 10 };
    // Ende November und Anfang März: ab und zu ein Schneetag statt Regen.
    if ((m === 10 && t >= 20) || (m === 2 && t <= 10)) { g.schnee = 7; g.regen -= 7; }
    return g;
  }
  function ziehe(g, r) {
    const summe = WETTER.reduce((s, w) => s + g[w], 0);
    let x = r * summe;
    for (const w of WETTER) {
      if (x < g[w]) return w;
      x -= g[w];
    }
    return "sonne";
  }
  // Ein Tag hat ein Grundwetter; in sieben von zehn Blöcken zu drei Stunden
  // bleibt es dabei, sonst wechselt es – so wechselt es nicht ständig.
  function wetterAm(j, m, t, block) {
    const tag = `${j}-${zwei(m + 1)}-${zwei(t)}`;
    const g = verteilung(m, t);
    if (zahl(`${tag}#${block}`) < 0.7) return ziehe(g, zahl(`${tag}#tag`));
    return ziehe(g, zahl(`${tag}#${block}#wetter`));
  }

  // ---------------------------------------------------------------------------
  // Die Sätze (alle aufgenommen – nur diese)
  // ---------------------------------------------------------------------------
  const SATZ_ZEIT = {
    fruehling: "Es ist Frühling.",
    sommer: "Es ist Sommer.",
    herbst: "Es ist Herbst.",
    winter: "Es ist Winter.",
  };
  const SATZ_WETTER = {
    sonne: {
      fruehling: "Heute scheint die Sonne, und die Blumen blühen.",
      sommer: "Heute ist es sonnig und warm.",
      herbst: "Heute scheint die Sonne.",
      winter: "Heute scheint die Sonne, aber es ist kalt.",
    },
    nachRegen: "Der Regen ist vorbei, und die Sonne scheint wieder.",
    wolken: "Heute hat es viele Wolken am Himmel.",
    regen: "Heute regnet es, darum bleiben alle lieber drinnen.",
    schnee: "Heute schneit es, und drinnen ist es schön warm.",
    wind: "Heute weht ein starker Wind.",
    windHerbst: "Heute weht ein starker Wind, und die Blätter fliegen.",
  };
  const SATZ_FEST = {
    ostern: "Es ist Osterzeit – im Gras sind bunte Eier versteckt!",
    augustfeierMorgen: "Morgen ist der 1. August – der Geburtstag der Schweiz!",
    augustfeier: "Heute ist der 1. August – der Geburtstag der Schweiz!",
    halloween: "Es ist Halloween – die Kürbisse haben lustige Gesichter!",
    raebeliechtli: "Es ist Räbeliechtli-Zeit – die Räben leuchten!",
    samichlaus: "Der Samichlaus kommt und füllt die Stiefel mit Mandarinen und Nüssen!",
    weihnachten: "Bald ist Weihnachten – die Lichter leuchten!",
    weihnachtenFest: "Frohe Weihnachten!",
    weihnachtenNeujahr: "Bald beginnt das neue Jahr!",
  };

  function wetterSatz(zeit, wetter, regenbogen) {
    if (wetter === "sonne") return regenbogen ? SATZ_WETTER.nachRegen : SATZ_WETTER.sonne[zeit];
    if (wetter === "wind") return zeit === "herbst" ? SATZ_WETTER.windHerbst : SATZ_WETTER.wind;
    return SATZ_WETTER[wetter];
  }

  // Ein kurzer Satz zum Fest. datum wählt, wo es zählt, den passenden
  // (31. Juli: «Morgen ist der 1. August», ab dem 24. Dezember «Frohe
  // Weihnachten»).
  function festText(fest, datum = new Date()) {
    if (!fest || !FESTE.includes(fest)) return "";
    const m = datum.getMonth();
    const t = datum.getDate();
    if (fest === "augustfeier") return m === 6 ? SATZ_FEST.augustfeierMorgen : SATZ_FEST.augustfeier;
    if (fest === "weihnachten") {
      if (m === 11 && t >= 27) return SATZ_FEST.weihnachtenNeujahr;
      if (m === 11 && t >= 24) return SATZ_FEST.weihnachtenFest;
      return SATZ_FEST.weihnachten;
    }
    return SATZ_FEST[fest];
  }

  // Jeder Satz, den heute().text und festText() sagen können – einzeln, so
  // wie kids.js sie aufnimmt und abspielt.
  function saetze() {
    const liste = [
      ...Object.values(SATZ_ZEIT),
      ...Object.values(SATZ_WETTER.sonne),
      ...Object.entries(SATZ_WETTER).filter(([k]) => k !== "sonne").map(([, s]) => s),
      ...Object.values(SATZ_FEST),
    ];
    return [...new Set(liste)];
  }

  // ---------------------------------------------------------------------------
  // Heute
  // ---------------------------------------------------------------------------
  function heute(datum = new Date()) {
    const d = datum instanceof Date ? datum : new Date(datum);
    const j = d.getFullYear();
    const m = d.getMonth();
    const t = d.getDate();
    const block = Math.floor(d.getHours() / 3);
    const jahreszeit = jahreszeitVon(m);
    const wetter = wetterAm(j, m, t, block);
    // Drei Stunden vorher (um Mitternacht: der letzte Block von gestern).
    const vorher = block > 0 ? wetterAm(j, m, t, block - 1) : (() => {
      const g = new Date(j, m, t - 1);
      return wetterAm(g.getFullYear(), g.getMonth(), g.getDate(), 7);
    })();
    const regenbogen = wetter === "sonne" && vorher === "regen";
    const fest = festVon(j, m, t);
    return {
      datum: `${j}-${zwei(m + 1)}-${zwei(t)}`,
      block,
      jahreszeit,
      wetter,
      fest,
      drinnen: wetter === "regen" || wetter === "schnee",
      regenbogen,
      // Schnee liegt: auf Dächern, Bäumen und Strasse (im Winter immer).
      schneeLiegt: jahreszeit === "winter" || wetter === "schnee",
      text: `${SATZ_ZEIT[jahreszeit]} ${wetterSatz(jahreszeit, wetter, regenbogen)}`,
      festText: festText(fest, d),
    };
  }

  // Klassen für die Bauecke (das Element mit .bauecke): Sie tönen den Himmel
  // (bau-wetter.css), auch zusammen mit .is-nacht.
  function klasse(z = heute()) {
    return `is-${z.jahreszeit} is-${z.wetter}`;
  }

  // ---------------------------------------------------------------------------
  // Der Himmel: HTML in zwei Teilen
  // ---------------------------------------------------------------------------
  //   hinten  Wolken und Regenbogen, still: in den Himmel (.bau-himmel).
  //   vorne   was fällt und weht, eine einzige bewegte Ebene: NACH dem Boden
  //           (.bau-gelaende) und vor dem Haus (.bau-welt) einfügen. Läge sie
  //           im Himmel, unter dem Boden, müsste der Browser den riesigen
  //           Boden (40000 Bildpunkte breit) als eigene Ebene über sie legen
  //           – gemessen: 781 Bildschirme gross statt 2.
  //
  // Die bewegte Schicht ist um eine Kachel grösser als der Himmel (eine halbe
  // Bildschirmhöhe beim Fallen, eine halbe Breite beim Wehen) und wandert in
  // einer Runde um genau diese Kachel. Jedes Teilchen steht dreimal darin, je
  // eine Kachel versetzt – so ist das Ende der Runde wie ihr Anfang.
  const KACHEL = 100 / 3;   // eine Kachel in Prozent der Schicht
  const SINKT = { wehen: 10, sanft: 24 };   // wie bau-wetter.css (@keyframes)
  const VARIANTE = ["a", "b", "c"];
  // Wie gross ein Teilchen höchstens ist, in Prozent der Schicht [breit, hoch]
  // (bau-wetter.css). Jedes liegt ganz in der Schicht: Was über ihren Rand
  // hinausragt, oder ein gedrehtes Teilchen, legt Chromium auf eine eigene
  // Ebene – gemessen. Darum malt ein Kästchen mehrere Tropfen oder Flocken
  // als Hintergrund, und Blätter zeigen ihre Richtung mit border-radius.
  const GROESSE = {
    fall: { tropfen: [8, 12], flocke: [8, 12] },
    quer: { flocke: [5, 14], blatt: [1.6, 4], bluete: [1.2, 3], strich: [13, 6] },
  };
  function schicht(art, teile, sinkt = 0, extra = "") {
    let s = "";
    teile.forEach(([typ, n]) => {
      const [w, h] = GROESSE[art][typ];
      for (let i = 0; i < n; i += 1) {
        const zx = (i + 0.1 + zahl(`${typ}x${i}`) * 0.8) / n;
        const zy = zahl(`${typ}y${i}`);
        const v = VARIANTE[i % 3];
        const teil = (x, y) => `<i class="${typ} ${v}" style="left:${r1(x)}%;top:${r1(y)}%"></i>`;
        for (let k = 0; k < 3; k += 1) {
          if (art === "fall") s += teil(zx * (100 - w), zy * (KACHEL - h) + k * KACHEL);
          else s += teil(zx * (KACHEL - w) + k * KACHEL, 3 + zy * (94 - h - 2 * sinkt) + k * sinkt);
        }
      }
    });
    return `<div class="bau-wetter-schicht bau-wetter-${art}${extra}">${s}</div>`;
  }
  function wolken(art, n) {
    let s = "";
    for (let k = 1; k <= n; k += 1) s += `<div class="bau-wetter-wolke k${k}"></div>`;
    return `<div class="bau-wetter-wolkenfeld ${art}">${s}</div>`;
  }

  // teil: "hinten", "vorne" oder "alles" (beides in einem, nur für Bilder
  // ohne den Boden der Bauecke). Höchstens 39 Teilchen; ein Kästchen Regen
  // oder Schnee malt drei Tropfen oder Flocken (bau-wetter.css).
  function himmel(z = heute(), teil = "alles") {
    const { jahreszeit: zeit, wetter } = z;
    let hinten = "";
    let vorne = "";
    if (z.regenbogen) hinten += `<div class="bau-wetter-regenbogen"></div>`;
    if (wetter === "regen") hinten += wolken("dunkel", 4);
    else if (wetter === "schnee") hinten += wolken("grau", 3);
    else if (wetter === "wolken") hinten += wolken("hell", 4);
    else if (wetter === "wind") hinten += wolken("hell", 2);
    if (wetter === "regen") vorne = schicht("fall", [["tropfen", 12]], 0, " regen");
    else if (wetter === "schnee") vorne = schicht("fall", [["flocke", 12]], 0, " schnee");
    else if (wetter === "wind") {
      const typ = { fruehling: "bluete", sommer: "blatt", herbst: "blatt", winter: "flocke" }[zeit];
      vorne = schicht("quer", [["strich", 3], [typ, 10]], SINKT.wehen);
    } else if (zeit === "herbst") {
      // Im Herbst segeln auch ohne Wind ein paar Blätter vorbei.
      vorne = schicht("quer", [["blatt", 5]], SINKT.sanft, " sanft");
    }
    const huelle = (inhalt, wo) => (inhalt ? `<div class="bau-wetter bau-wetter-${wo} bau-wetter-${wetter} bau-wetter-${zeit}" aria-hidden="true">${inhalt}</div>` : "");
    if (teil === "hinten") return huelle(hinten, "hinten");
    if (teil === "vorne") return huelle(vorne, "vorne");
    return huelle(hinten + vorne, "alles");
  }

  // Setzt alles auf einmal und ersetzt, was vorher war: host ist die Bauecke
  // (.bauecke), himmelEl der Himmel (.bau-himmel), vorEl das Element, vor dem
  // die bewegte Ebene steht – die Welt mit dem Haus (.bau-welt).
  function anwenden(host, himmelEl, vorEl, z = heute()) {
    host?.classList.remove(...KLASSEN);
    host?.classList.add(...klasse(z).split(" "));
    host?.querySelectorAll(".bau-wetter").forEach((alt) => alt.remove());
    himmelEl?.insertAdjacentHTML("beforeend", himmel(z, "hinten"));
    vorEl?.insertAdjacentHTML("beforebegin", himmel(z, "vorne"));
    return z;
  }

  // ---------------------------------------------------------------------------
  // Kleine Zeichenhelfer (SVG)
  // ---------------------------------------------------------------------------
  // Viele Kreise in einem Pfad: [[x, y, r], …].
  function kreisPfad(liste) {
    return liste.map(([x, y, r]) => `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r1(2 * r)} 0a${r} ${r} 0 1 0 ${r1(-2 * r)} 0`).join("");
  }
  // Ein Blatt (Linse) um (x, y), lang l, gedreht um a (Bogenmass).
  function blattPfad(x, y, l, a, b = 0.32) {
    const ux = Math.cos(a) * l / 2;
    const uy = Math.sin(a) * l / 2;
    const nx = -uy * b * 2;
    const ny = ux * b * 2;
    return `M${r1(x - ux)} ${r1(y - uy)}Q${r1(x + nx)} ${r1(y + ny)} ${r1(x + ux)} ${r1(y + uy)}Q${r1(x - nx)} ${r1(y - ny)} ${r1(x - ux)} ${r1(y - uy)}Z`;
  }
  function sternPfad(cx, cy, r, innen = 0.45) {
    let d = "";
    for (let i = 0; i < 10; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * innen : r;
      d += `${i ? "L" : "M"}${r1(cx + Math.cos(a) * rr)} ${r1(cy + Math.sin(a) * rr)}`;
    }
    return `${d}Z`;
  }

  // ---------------------------------------------------------------------------
  // Bäume je Jahreszeit
  // ---------------------------------------------------------------------------
  // Wie bau-art.js baum(): Stamm 12 × 60, die Krone aus drei Kreisen; (0, 0)
  // ist der Fuss des Stamms auf der Strasse. nr ändert das Bild ein wenig.
  const KRONE = [[0, -86, 38], [-22, -70, 24], [22, -72, 26]];
  const KRONEN_FARBEN = {
    sommer: [["#5cb85c", "#4aa34a", "#6cc76a"]],
    fruehling: [["#7dcc6a", "#68b958", "#93d97f"]],
    herbst: [["#f2a03d", "#e0603a", "#f7c84a"], ["#ef8a34", "#f4c04a", "#d4513a"], ["#f6b443", "#e8763a", "#c8452f"]],
  };
  // Plätze in der Krone für Blüten, Äpfel und bunte Blätter.
  const PLAETZE = [[-14, -106], [12, -112], [28, -96], [-30, -88], [2, -92], [18, -80], [-8, -76], [36, -70], [-36, -66], [-20, -56], [12, -60], [30, -56], [-2, -118], [-24, -102]];
  function plaetze(nr, anzahl, versatz, spiegel) {
    const liste = [];
    for (let i = 0; i < anzahl; i += 1) {
      const [x, y] = PLAETZE[(versatz + i * 3 + nr * 5) % PLAETZE.length];
      liste.push([x * spiegel, y]);
    }
    return liste;
  }
  const STAMM = `<rect x="-6" y="-60" width="12" height="60" rx="4" fill="#8a5734"/>`;

  function baum(x, gross = 1, jahreszeit = "sommer", nr = 0) {
    const n = Math.abs(Math.round(Number(nr) || 0));
    const sp = n % 2 ? -1 : 1;
    const g = (inhalt) => `<g transform="translate(${x} 0)${gross !== 1 ? ` scale(${gross})` : ""}">${inhalt}</g>`;
    if (jahreszeit === "winter") return g(winterBaum(n, sp));
    const satz = KRONEN_FARBEN[jahreszeit] || KRONEN_FARBEN.sommer;
    const farben = satz[n % satz.length];
    let s = STAMM + KRONE.map(([cx, cy, r], k) => `<circle cx="${cx * sp}" cy="${cy}" r="${r}" fill="${farben[k]}"/>`).join("");
    if (jahreszeit === "fruehling") {
      const p = plaetze(n, 10, 0, sp);
      s += `<path d="${kreisPfad(p.filter((_, i) => (i + n) % 3).map(([px, py]) => [px, py, 4.4]))}" fill="#ffb6cf"/>`;
      s += `<path d="${kreisPfad(p.filter((_, i) => !((i + n) % 3)).map(([px, py]) => [px, py, 4.4]))}" fill="#ffffff"/>`;
      s += `<path d="${kreisPfad(p.map(([px, py]) => [px, py, 1.5]))}" fill="#f5a623"/>`;
    } else if (jahreszeit === "herbst") {
      const bunt = ["#f7c84a", "#c8452f", "#e8763a"][(n + 1) % 3];
      s += `<path d="${plaetze(n, 7, 1, sp).map(([px, py], i) => blattPfad(px, py, 11, i * 1.3 + n)).join("")}" fill="${bunt}"/>`;
      // Ein paar Blätter sind schon gefallen.
      s += `<path d="${blattPfad(-20 * sp, -2, 10, 0.3)}${blattPfad(24 * sp, -1.5, 9, -0.4)}" fill="${farben[1]}"/><path d="${blattPfad(-31 * sp, -1.5, 9, -0.2)}${blattPfad(14 * sp, -2, 8, 0.6)}" fill="${farben[2]}"/>`;
    } else if (n % 2) {
      // Sommer: Jeder zweite Baum trägt Äpfel.
      const p = plaetze(n, 5, 2, sp);
      s += `<path d="${kreisPfad(p.map(([px, py]) => [px, py, 4.6]))}" fill="#e5483b"/><path d="${kreisPfad(p.map(([px, py]) => [px - 1.5, py - 1.6, 1.3]))}" fill="#ffffff" opacity="0.7"/>`;
    }
    return g(s);
  }

  // Der Winterbaum: kahle Äste, auf den flachen Stücken und an den Spitzen
  // liegt Schnee, unten ein Schneehaufen.
  function winterBaum(n, sp) {
    const m = (pfad) => pfad.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, a, b) => `${r1(Number(a) * sp)} ${b}`);
    const kurz = n % 3 === 2;   // ab und zu ein Baum mit kürzerem linkem Ast
    const aeste = m(`M0 -64Q-16 -68 ${kurz ? "-27 -82" : "-32 -88"}M0 -72Q18 -76 34 -96M0 -90Q-11 -97 -19 -113M0 -96Q10 -103 16 -119`);
    const zweige = m(`M-18 -70Q-30 -70 -42 -76M19 -79Q31 -79 43 -84M-24 -78Q-28 -88 -25 -97M27 -88Q31 -98 28 -107`);
    const schnee = m(`M-3 -68Q-10 -70 -16 -72.5M-21 -74Q-30 -74 -40 -80M3 -76Q11 -78 18 -81.5M22 -83Q31 -83 41 -88`);
    const spitzen = [[kurz ? -27 : -32, kurz ? -83 : -89, 3.4], [34, -97, 3.4], [-19, -114, 3.2], [16, -120, 3.2], [-25, -98, 3], [28, -108, 3], [0, -113, 3.8], [-42, -77, 2.8], [43, -85, 2.8]]
      .map(([x, y, r]) => [x * sp, y, r]);
    return `<ellipse cx="0" cy="-1" rx="24" ry="5" fill="#ffffff"/>` + STAMM +
      `<path d="M-5 -58L-2.2 -112h4.4L5 -58z" fill="#8a5734"/>` +
      `<path d="${aeste}" fill="none" stroke="#8a5734" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="${zweige}" fill="none" stroke="#8a5734" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path d="${schnee}" fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path d="${kreisPfad(spitzen)}" fill="#ffffff"/>`;
  }

  // ---------------------------------------------------------------------------
  // Schnee auf dem Dach (nur im Winter)
  // ---------------------------------------------------------------------------
  // Ein Schneestreifen auf einer Kante aus Punkten [[x, y], …], von links nach
  // rechts: oben etwas über der Kante, unten mit runden Bögen. An einem Knick
  // (dem First) treffen sich die Ränder auf Gehrung.
  function zug(punkte, dicke = 9) {
    const seg = punkte.slice(1).map(([bx, by], i) => {
      const [ax, ay] = punkte[i];
      const len = Math.hypot(bx - ax, by - ay) || 1;
      return { len, nx: (by - ay) / len, ny: -(bx - ax) / len };   // Normale nach aussen (oben)
    });
    const ecke = (i, d) => {   // Punkt am Knoten i, um d nach aussen (d < 0: nach innen)
      const a = seg[Math.max(0, i - 1)];
      const b = seg[Math.min(seg.length - 1, i)];
      let mx = a.nx + b.nx;
      let my = a.ny + b.ny;
      const ml = Math.hypot(mx, my) || 1;
      mx /= ml; my /= ml;
      const k = d / (mx * a.nx + my * a.ny);
      return [punkte[i][0] + mx * k, punkte[i][1] + my * k];
    };
    const xy = ([x, y]) => `${r1(x)} ${r1(y)}`;
    const letzter = punkte.length - 1;
    let d = `M${punkte.map((_, i) => xy(ecke(i, 3.5))).join("L")}L${xy(ecke(letzter, -dicke))}`;
    for (let i = letzter - 1; i >= 0; i -= 1) {
      const [px, py] = ecke(i + 1, -dicke);
      const [qx, qy] = ecke(i, -dicke);
      const { nx, ny } = seg[i];
      const boegen = Math.max(2, Math.round(seg[i].len / 30));
      for (let k = boegen - 1; k >= 0; k -= 1) {
        const t = 1 - (k + 0.5) / boegen;
        const tief = k % 2 ? 9 : 6;
        const e = 1 - k / boegen;
        d += `Q${xy([px + (qx - px) * t - nx * tief, py + (qy - py) * t - ny * tief])} ${xy([px + (qx - px) * e, py + (qy - py) * e])}`;
      }
    }
    return `${d}Z`;
  }
  const kante = (ax, ay, bx, by, dicke) => zug([[ax, ay], [bx, by]], dicke);
  // Ein Schneestreifen wie im Dach, als Pfad mit Rand.
  const schneeFlaeche = (d) => `<path d="${d}" fill="#ffffff" stroke="#cbd9e8" stroke-width="1.5" stroke-linejoin="round"/>`;

  // form: giebel, heli, turm, flach, hotel (wie flach, aber ohne die Kappen
  // auf den Sonnenkollektoren); y: Oberkante der obersten Decke.
  function dachSchnee(form, y) {
    let d = "";
    let extra = "";
    if (form === "giebel") {
      const firstX = HB / 2;
      const rechts = (x) => y - 120 + ((x - firstX) * 120) / (HB / 2 + 24);
      d += zug([[-24, y], [firstX, y - 120], [466, rechts(466)]], 10);
      d += kante(517, rechts(517), HB + 24, y, 10);
      d += kante(HB * 0.7 - 6, y - 124, HB * 0.7 + 40, y - 124, 5);   // Kamin
    } else if (form === "heli") {
      const hx = HB * 0.42;
      d += kante(-10, y - 22, hx - 150, y - 22, 7) + kante(hx + 150, y - 22, HB + 10, y - 22, 7);
      d += kante(HB * 0.8, y - 70, HB * 0.8 + 58, y - 70, 5);          // Schild
      // Der Helikopter: Schnee auf dem Dach, auf dem Rotor und dem Heck.
      extra = `<g transform="translate(${r1(hx)} ${y - 34})">` +
        schneeFlaeche("M-41 -21Q-42 -33 -30 -34H12Q25 -34 25 -23Q20 -27 14 -25Q8 -22 2 -26Q-4 -22 -10 -26Q-16 -22 -22 -26Q-28 -22 -34 -25Q-39 -25 -41 -21Z") +
        `<path d="M-67 -39.5H37M29 -22H63" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/></g>`;
    } else if (form === "turm") {
      const tx = HB * 0.5;
      d += kante(-10, y - 20, 40, y - 20, 7) + kante(160, y - 20, tx - 50, y - 20, 7) + kante(tx + 50, y - 20, HB - 160, y - 20, 7) + kante(HB - 40, y - 20, HB + 10, y - 20, 7);
      d += kante(40, y - 50, 160, y - 50, 6) + kante(HB - 160, y - 50, HB - 40, y - 50, 6);
      d += zug([[tx - 62, y - 110], [tx, y - 160], [tx + 62, y - 110]], 8);
    } else {
      d += kante(-10, y - 20, HB + 10, y - 20, 8);
      if (form !== "hotel") [70, 200, 330].forEach((x) => { d += kante(x + 12, y - 66, x + 98, y - 66, 4); });
    }
    return `<g class="bau-dachschnee" pointer-events="none">${schneeFlaeche(d)}${extra}</g>`;
  }

  // ---------------------------------------------------------------------------
  // Schmuck an der Strasse
  // ---------------------------------------------------------------------------
  // Plätze (x in Haus-Einheiten) zwischen Bäumen (-260, -120, HB+110, HB+260)
  // und Laternen (-40, HB+40).
  const PLATZ = { L1: -340, L2: -190, L3: -80, R1: HB + 75, R2: HB + 188, R3: HB + 345 };
  const um = (x, y, inhalt, k = 1) => `<g transform="translate(${r1(x)} ${r1(y)})${k !== 1 ? ` scale(${k})` : ""}">${inhalt}</g>`;

  function tulpe(x, yb, farbe) {
    return `<path d="M${x - 5} ${yb - 11}l2.5 3 2.5-4 2.5 4 2.5-3v6q0 5-5 5t-5-5z" fill="${farbe}"/>`;
  }
  function blumentopf() {
    return `<path d="M-6 -27Q-9 -38 -11 -47M0 -27V-52M6 -27Q9 -37 11 -45" fill="none" stroke="#3f8f3a" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M-1 -33q-9-1-11-9q8 0 11 6zM1 -31q9-1 10-8q-7 0-10 5z" fill="#5cb85c"/>` +
      tulpe(-11, -47, "#ff6f91") + tulpe(0, -52, "#ffd166") + tulpe(11, -45, "#ff8a65") +
      `<path d="M-13 -22h26l-4 22h-18z" fill="#d9744a"/><rect x="-15" y="-27" width="30" height="7" rx="2" fill="#c4613a"/>`;
  }
  function sonnenschirm() {
    const rand = [-58, -38.7, -19.3, 0, 19.3, 38.7, 58].map((x) => [x, -84 + Math.abs(x) * 0.08]);
    const bahn = (k) => {
      const [ax, ay] = rand[k];
      const [bx, by] = rand[k + 1];
      return `M0 -120L${r1(ax)} ${r1(ay)}Q${r1((ax + bx) / 2)} ${r1((ay + by) / 2 + 7)} ${r1(bx)} ${r1(by)}Z`;
    };
    const ball = `<circle r="10" fill="#ffffff" stroke="#c9d2dc" stroke-width="1.2"/>` +
      `<path d="M0 0L0 -10A10 10 0 0 1 8.7 -5Z" fill="#ef5350"/><path d="M0 0L8.7 5A10 10 0 0 1 0 10Z" fill="#4f8ef7"/><path d="M0 0L-8.7 5A10 10 0 0 1 -8.7 -5Z" fill="#ffd166"/>`;
    return `<ellipse cx="0" cy="0" rx="36" ry="5" fill="#000000" opacity="0.1"/><path d="M0 0V-118" stroke="#9aa5b1" stroke-width="3.5"/>` +
      `<path d="${[0, 2, 4].map(bahn).join("")}" fill="#ef5350"/><path d="${[1, 3, 5].map(bahn).join("")}" fill="#ffffff"/>` +
      `<circle cx="0" cy="-121" r="3.5" fill="#9aa5b1"/>` + um(46, -10, ball);
  }
  function kuerbis(geschnitzt = false) {
    return (geschnitzt ? `<ellipse cx="0" cy="-12" rx="25" ry="18" fill="#ffd166" opacity="0.28"/>` : "") +
      `<ellipse cx="0" cy="-12" rx="17" ry="12" fill="#f28c28"/><path d="M-7 -23q-5 11 0 22M7 -23q5 11 0 22M0 -24v24" fill="none" stroke="#d9701c" stroke-width="1.8"/>` +
      `<path d="M0 -23q1-7 5-9" fill="none" stroke="#4f8a3a" stroke-width="3.5" stroke-linecap="round"/>` +
      (geschnitzt ? `<path d="M-10 -14l4-7 4 7zM2 -14l4-7 4 7zM-10 -9q10 8 20 0q-2 3-4 3l-1.5-2-2 2.5-2.5-2.5-2.5 2.5-2-2.5-1.5 2q-2 0-4-3z" fill="#ffe27a" stroke="#b5531a" stroke-width="1" stroke-linejoin="round"/>` : "");
  }
  function laubhaufen() {
    const blaetter = [[-28, -8, 0.4], [-14, -18, -0.6], [0, -24, 0.9], [14, -20, -0.3], [27, -9, 0.7], [-4, -12, -1], [10, -7, 0.2], [-20, -3, 0.8], [22, -3, -0.5]];
    const farben = ["#f7c84a", "#e0603a", "#c8452f"];
    return `<path d="M-40 0q3-18 20-22q10-12 26-6q18 0 26 28z" fill="#d98a35"/>` +
      farben.map((f, k) => `<path d="${blaetter.filter((_, i) => i % 3 === k).map(([x, y, a]) => blattPfad(x, y, 12, a, 0.36)).join("")}" fill="${f}"/>`).join("");
  }
  function schneemann() {
    return `<ellipse cx="0" cy="0" rx="25" ry="4" fill="#9fb4c8" opacity="0.35"/>` +
      `<path d="M-13 -56l-17-9M-24 -62l-4-6M13 -56l17-11M24 -63l5-5" fill="none" stroke="#8a5734" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="${kreisPfad([[0, -20, 21], [0, -52, 15], [0, -77, 11]])}" fill="#ffffff" stroke="#d3e0ec" stroke-width="1.6"/>` +
      `<path d="M-11 -68q11 5 22 0v5q-11 5-22 0zM5 -64l2 14 5-1-1-13z" fill="#ef5350"/>` +
      `<path d="${kreisPfad([[-4, -80, 1.6], [4, -80, 1.6], [0, -57, 1.8], [0, -50, 1.8], [0, -43, 1.8]])}" fill="#243047"/>` +
      `<path d="M0 -77l11 2.5-11 2.5z" fill="#ff8a1f"/><path d="M-5 -72.5q5 3.5 10 0" fill="none" stroke="#243047" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M-10 -87q1-13 10-13t10 13z" fill="#4f8ef7"/><rect x="-12" y="-90" width="24" height="5" rx="2.5" fill="#3a74d6"/><circle cx="0" cy="-102" r="3.5" fill="#ffffff"/>`;
  }
  // Ein Davoser Schlitten.
  function schlitten() {
    return `<path d="M-32 -2h50q12 0 14-12" fill="none" stroke="#7a4d2e" stroke-width="3.5" stroke-linecap="round"/>` +
      `<path d="M-26 -2v-11M-4 -2v-11M16 -2v-11" stroke="#7a4d2e" stroke-width="3"/>` +
      `<rect x="-32" y="-19" width="54" height="7" rx="2.5" fill="#c88c5c"/><path d="M-32 -15.5h54" stroke="#a46c43" stroke-width="1.2"/>` +
      `<path d="M-31 -19q4-5 9-2q5-4 10-1q6-4 11 0q5-4 10 0q5-3 9 1z" fill="#ffffff"/>`;
  }
  function fahne() {
    // Die Schweizer Fahne: ein weisses Kreuz auf Rot.
    return `<path d="M0 0V-118" stroke="#9aa5b1" stroke-width="3"/><circle cx="0" cy="-120" r="3.2" fill="#ffd166"/>` +
      `<g transform="translate(1.5 -116)"><rect width="32" height="32" fill="#da291c"/><path d="M13 6h6v7h7v6h-7v7h-6v-7h-7v-6h7z" fill="#ffffff"/></g>`;
  }
  function ei(x, y, farbe, dreh = 0) {
    return `<g transform="translate(${x} ${y}) rotate(${dreh})"><ellipse cx="0" cy="-7" rx="5.5" ry="7" fill="${farbe}"/><path d="M-5 -7l2.5-2 2.5 2 2.5-2 2.5 2" fill="none" stroke="#ffffff" stroke-width="1.4"/></g>`;
  }
  function osternest() {
    return ei(-10, 1, "#ff7aa2", -12) + ei(1, -1, "#4fc3f7") + ei(12, 1, "#ffd166", 14) +
      `<path d="M-19 4q2-8 4-10q0 6-1 10zM-7 5q1-7 3-9q0 5 0 9zM6 5q2-8 5-9q-1 6-2 9zM17 4q1-7 4-8q-1 5-1 8z" fill="#4f9d3f"/>`;
  }
  function osterkorb() {
    return `<path d="M-15 -14q15-26 30 0" fill="none" stroke="#a0693f" stroke-width="3"/>` +
      ei(-8, -12, "#b28dff", -15) + ei(2, -14, "#ff8a65") + ei(11, -12, "#4cc46b", 15) +
      `<path d="M-17 -14q4-5 8-1q4-5 8-1q4-5 8-1q4-5 9 1z" fill="#8fcf5a"/>` +
      `<path d="M-18 -14h36l-4 14h-28z" fill="#c48a4a"/><path d="M-16.5 -9h33M-15 -4h30" stroke="#a0693f" stroke-width="1.4"/>`;
  }
  function stiefel() {
    const einer = (x, farbe) => um(x, 0, `<path d="M-8 0h22q4 0 4-4q0-5-7-6l-7-2v-20h-12z" fill="${farbe}"/>` +
      `<path d="${kreisPfad([[-4, -38, 4.6], [3, -40, 4.6]])}" fill="#ff9f1c"/><ellipse cx="-1" cy="-35" rx="5" ry="3" fill="#d9b77e"/>` +
      `<rect x="-10" y="-36" width="16" height="7" rx="3.5" fill="#ffffff"/>`);
    return einer(-11, "#c62828") + einer(11, "#b71c1c");
  }
  function chlaussack() {
    return `<path d="${kreisPfad([[-6, -37, 5], [5, -38, 5], [24, -5, 5], [32, -4, 4.4]])}" fill="#ff9f1c"/>` +
      `<path d="M-1 -41q-2-4 1-6M22 -10q0-3 2-4" fill="none" stroke="#3f8f3a" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M-17 0q-7-18 3-30l-3-5h34l-3 5q10 12 3 30z" fill="#c9a66b"/><path d="M-13 -31q13 4 26 0" fill="none" stroke="#8a5734" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M-6 -16q6-3 12 0" fill="none" stroke="#a88650" stroke-width="1.4"/>` +
      `<ellipse cx="-24" cy="-3" rx="5" ry="3" fill="#d9b77e"/><ellipse cx="40" cy="-3" rx="4.5" ry="2.8" fill="#d9b77e"/>`;
  }
  // Eine Lichterkette, die sich um den Mast einer Laterne windet.
  function lichterkette(lx) {
    const farben = ["#ef5350", "#ffd166", "#4cc46b", "#4f8ef7"];
    const birnen = farben.map(() => []);
    let draht = `M${lx} -4`;
    for (let k = 0, y = -12; y > -114; k += 1, y -= 12) {
      const x = lx + (k % 2 ? 5 : -5);
      draht += `L${x} ${y}`;
      birnen[k % 4].push([x, y + 2.5, 3]);
    }
    return `<path d="${draht}" fill="none" stroke="#2f5d3a" stroke-width="1.4"/>` +
      farben.map((f, i) => `<path d="${kreisPfad(birnen[i])}" fill="${f}"/>`).join("");
  }
  function taennli() {
    return `<rect x="-4" y="-13" width="8" height="13" fill="#8a5734"/>` +
      `<path d="M-24 -12L0 -38L24 -12zM-19 -30L0 -54L19 -30zM-13 -47L0 -68L13 -47z" fill="#2f8f4e"/>` +
      `<path d="M-23 -12q5.75-4 11.5 0t11.5 0t11.5 0t11.5 0M-18 -30q4.5-4 9-0t9 0t9 0t9 0M-12 -47q3-3 6 0t6 0t6 0t6 0" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="${kreisPfad([[-10, -18, 3], [8, -36, 3], [-4, -51, 2.6]])}" fill="#ef5350"/><path d="${kreisPfad([[11, -17, 3], [-8, -36, 3], [5, -56, 2.6]])}" fill="#ffd166"/>` +
      `<path d="${sternPfad(0, -71, 7.5)}" fill="#ffd34d" stroke="#e0a400" stroke-width="1.2" stroke-linejoin="round"/>`;
  }
  // Eine Kette, die von (x0, y0) nach (x1, y1) durchhängt, mit n Dingen daran.
  function kette(x0, y0, x1, y1, n, ding) {
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2 + 40;
    let s = `<path d="M${x0} ${y0}Q${r1(cx)} ${r1(cy)} ${x1} ${y1}" fill="none" stroke="#6b5a48" stroke-width="1.6"/>`;
    for (let k = 0; k < n; k += 1) {
      const t = (k + 1) / (n + 1);
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      s += um(x, y, ding(k));
    }
    return s;
  }
  // Ein Räbeliechtli: eine ausgehöhlte Räbe mit Stern, Mond oder Herz.
  function raebe(k) {
    const motiv = [
      `<path d="${sternPfad(0, 15, 4.6, 0.5)}"/>`,
      `<path d="M1.5 10a5 5 0 1 0 0 10a4 4 0 1 1 0-10z"/>`,
      `<path d="M0 19l-4-4a2.5 2.5 0 0 1 4-3a2.5 2.5 0 0 1 4 3z"/>`,
    ][k % 3];
    return `<circle cx="0" cy="14" r="15" fill="#ffd27a" opacity="0.3"/><path d="M-5 6Q0 -1 5 6" fill="none" stroke="#6b5a48" stroke-width="1.2"/>` +
      `<ellipse cx="0" cy="14" rx="9" ry="9.5" fill="#fde7b4" stroke="#d9a650" stroke-width="1.2"/>` +
      `<path d="M-6.5 7.5q6.5-3 13 0" fill="none" stroke="#a678b8" stroke-width="2.6" stroke-linecap="round"/>` +
      `<g fill="#f57c00">${motiv}</g>`;
  }
  // Ein Lampion zum 1. August: rot mit Schweizer Kreuz, gelb oder orange.
  function lampion(k) {
    const farbe = ["#e53935", "#ffd166", "#ff9f43"][k % 3];
    return `<path d="M-4 4.5Q0 -1 4 4.5" fill="none" stroke="#6b5a48" stroke-width="1.2"/>` +
      `<ellipse cx="0" cy="13" rx="10" ry="8.5" fill="${farbe}"/><path d="M-9 10q9 3 18 0M-9.6 15.5q9.6 3 19.2 0" fill="none" stroke="#000000" stroke-width="1" opacity="0.18"/>` +
      `<path d="M-4 3.5h8v2.5h-8zM-4 20.5h8v2.5h-8z" fill="#6b5a48"/>` +
      (k % 3 === 0 ? `<path d="M-1.5 8h3v3.5h3.5v3h-3.5v3.5h-3v-3.5h-3.5v-3h3.5z" fill="#ffffff"/>` : "");
  }
  // Ketten von der Laterne zum nächsten Baum, links und rechts vom Haus.
  const ketten = (ding) => kette(-40, -100, -114, -50, 3, (k) => um(0, 0, ding(k), 1.3)) + kette(HB + 40, -100, HB + 104, -52, 2, (k) => um(0, 0, ding(k + 1), 1.3));

  // Was zu welcher Jahreszeit und zu welchem Fest an der Strasse steht: je
  // Platz ein Ding; ein Fest ersetzt den Schmuck der Jahreszeit am selben Platz.
  const SCHMUCK_ZEIT = {
    fruehling: { L3: [PLATZ.L3, 0, () => um(0, 0, blumentopf(), 1.2)], R1: [PLATZ.R1, 0, () => um(0, 0, blumentopf(), 1.2)] },
    sommer: { R2: [PLATZ.R2, 0, sonnenschirm] },
    herbst: { L2: [PLATZ.L2, 0, () => um(-12, 0, kuerbis(), 1.4) + um(18, 2, kuerbis(), 1)], R2: [PLATZ.R2, 0, laubhaufen] },
    winter: { L2: [PLATZ.L2, 6, schneemann], R2: [PLATZ.R2, 2, schlitten] },
  };
  const SCHMUCK_FEST = {
    ostern: { L2: [PLATZ.L2, 0, () => um(0, 0, osterkorb(), 1.3)], WL: [-88, 148, () => um(0, 0, osternest(), 1.6)], WR: [HB + 84, 152, () => um(0, 0, osternest(), 1.6)] },
    augustfeier: { L2: [PLATZ.L2, 0, fahne], R3: [PLATZ.R3, 0, fahne], K: [0, 0, () => ketten(lampion)] },
    halloween: { L2: [PLATZ.L2, 0, () => um(-12, 0, kuerbis(true), 1.4) + um(19, 2, kuerbis(true), 1)], R1: [PLATZ.R1, 2, () => um(0, 0, kuerbis(true), 1.2)] },
    raebeliechtli: { K: [0, 0, () => ketten(raebe)] },
    samichlaus: { L3: [PLATZ.L3, 0, () => um(0, 0, chlaussack(), 1.15)], R1: [PLATZ.R1 - 3, 0, () => um(0, 0, stiefel(), 1.05)] },
    weihnachten: { LAT: [0, 0, () => lichterkette(-40) + lichterkette(HB + 40)], L1: [PLATZ.L1, 0, taennli] },
  };

  // SVG für den Hintergrund des Hauses, nach den Bäumen und Laternen.
  function deko(jahreszeit, fest = "") {
    const plaetzeMap = { ...(SCHMUCK_ZEIT[jahreszeit] || {}), ...(SCHMUCK_FEST[fest] || {}) };
    const teile = Object.values(plaetzeMap).map(([x, y, zeichne]) => (x || y ? um(x, y, zeichne()) : zeichne()));
    return teile.length ? `<g class="bau-wetter-deko" pointer-events="none">${teile.join("")}</g>` : "";
  }

  // ---------------------------------------------------------------------------
  // Schnee auf Gehsteig und Wiese
  // ---------------------------------------------------------------------------
  // CSS-Hintergrund wie bau-art.js bodenStil (u: Bildpunkte je Einheit, die
  // Oberkante ist die Strasse). Gehört VOR bodenStil, damit er darüber liegt:
  //   band.style.background = `${W.bodenSchnee(u)}, ${A().bodenStil(u, phase)}`;
  function bodenSchnee(u = 1) {
    const p = (n) => `${(n * u).toFixed(2)}px`;
    return [
      `linear-gradient(to bottom, #ffffff 0 ${p(4)}, transparent ${p(4)})`,
      `radial-gradient(closest-side, #ffffff 0 80%, transparent 100%) 0 ${p(1)} / ${p(56)} ${p(12)} repeat-x`,
      `linear-gradient(to bottom, transparent ${p(110)}, #e6eef5 ${p(110)}, #f5f8fb ${p(140)})`,
    ].join(", ");
  }

  window.LernappBauWetter = {
    JAHRESZEITEN, WETTER, FESTE, KLASSEN,
    heute, saetze, festText, klasse, himmel, anwenden,
    baum, dachSchnee, deko, bodenSchnee,
    ostersonntag, wetterAm, festVon, jahreszeitVon,
  };
})();
