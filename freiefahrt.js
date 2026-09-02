/*
 * freiefahrt.js – Freie Fahrt: die rote Lok aus dem vollen Bahnhof schieben.
 *
 * Auf einem Feld von sechs mal sechs stehen Wagen kreuz und quer. Jeder fährt
 * nur in seine eigene Richtung – quer stehende nach links und rechts, hochkant
 * stehende nach oben und unten –, und keiner fährt durch einen anderen
 * hindurch. Rechts in der dritten Reihe ist das Tor; die rote Lok muss
 * hinaus. Das ist die ganze Regel.
 *
 * Ein Zug ist eine Bewegung eines Wagens, egal über wie viele Felder. Genau so
 * zählt auch der Löser weiter unten, und nur deshalb stimmt die Zahl, die dem
 * Kind als Bestmarke angezeigt wird ("3 von 8"): sie ist nicht geschätzt,
 * sondern mit einer Breitensuche über alle erreichbaren Stellungen ausgerechnet
 * und mit scripts/validate-freiefahrt.mjs für jedes ausgelieferte Level
 * nachgerechnet.
 *
 * Die Level stehen fertig in dieser Datei. Zufällig gewürfelte Stellungen
 * ergeben zuverlässig leichte Rätsel, aber fast nie schwere – deshalb sind sie
 * einmalig vorab gesucht worden (scripts/generate-freiefahrt.mjs: Zufallsstart,
 * dann Bergsteigen auf die Zugzahl) und liegen hier als geprüfte Tabelle. Ein
 * Kinderhandy soll keine Sekunden mit Suchen verbringen, und ein Level, das
 * erst auf dem Gerät entsteht, hätte niemand vorher gesehen.
 *
 * Bühne, Knöpfe und Schlussbild kommen aus game-shell.js; hier steht nur das
 * Feld, das Schieben und die Bewertung.
 */
(() => {
  "use strict";

  const N = 6;              // Kantenlänge des Felds
  const TOR_REIHE = 2;      // In dieser Reihe liegt das Tor, rechts aussen
  const LEVELS_FOR_DONE = 5;

  // ---------------------------------------------------------------------------
  // Die vier Stufen
  // ---------------------------------------------------------------------------
  // Schwer wird ein Level nicht durch mehr Wagen, sondern durch die Zahl der
  // Züge, die zur Lösung nötig sind – ein volles Feld kann in fünf Zügen frei
  // sein, ein halb leeres in dreissig. Deshalb ist die Mindestzugzahl das Mass
  // der Stufe; die Wagenzahl ergibt sich beim Suchen von selbst.
  const STUFEN = [
    { id: "leicht", label: "Leicht", farbe: "#3fbf74" },
    { id: "mittel", label: "Mittel", farbe: "#00A5B5" },
    { id: "schwer", label: "Schwer", farbe: "#e8a13c" },
    { id: "knifflig", label: "Knifflig", farbe: "#d9534f" },
  ];

  // ---------------------------------------------------------------------------
  // Die Level
  // ---------------------------------------------------------------------------
  // Ein Feld steht so da, wie es aussieht: sechs Zeilen zu sechs Zeichen.
  // "." ist ein freies Feld, "R" die rote Lok, jeder andere Buchstabe ein
  // Wagen. Gleiche Buchstaben nebeneinander ergeben einen waagerechten Wagen,
  // untereinander einen senkrechten – die Länge steht nicht dabei, sie wird
  // gezählt.
  //
  // "zuege" ist die ausgerechnete Mindestzugzahl. Sie wird nicht gepflegt,
  // sondern geprüft: das Prüfskript löst jedes Feld neu und vergleicht.
  const FELDER = [
    ["leicht", 8, [
      "AA..B.",
      "....B.",
      "..RRBC",
      "DDEE.C",
      "F.G...",
      "F.GHHH",
    ]],
    ["leicht", 10, [
      "A.....",
      "A.BBCC",
      "RRDE.F",
      "..DE.F",
      "..DGGG",
      "HH....",
    ]],
    ["leicht", 12, [
      "AA....",
      ".....B",
      "CRRD.B",
      "C.ED.B",
      ".FEDGG",
      ".F..HH",
    ]],
    ["mittel", 13, [
      "A.BBCC",
      "A.DDE.",
      "..RREF",
      "..GGGF",
      "HHI..F",
      "..IJJJ",
    ]],
    ["mittel", 15, [
      "ABBCC.",
      "A.DDE.",
      "..RREF",
      "GGHHHF",
      "..I..F",
      "..IJJJ",
    ]],
    ["mittel", 18, [
      "ABBCCC",
      "A..D..",
      "ARRD..",
      "EFFGGH",
      "EI...H",
      ".IJJ.H",
    ]],
    ["schwer", 19, [
      "ABCDDD",
      "ABC..E",
      "FRR.GE",
      "FHIIG.",
      "FHJJJK",
      ".H...K",
    ]],
    ["schwer", 22, [
      "A.BCC.",
      "A.B.D.",
      ".RR.DE",
      "FFF.DE",
      "GHIIIE",
      "GHJJKK",
    ]],
    ["schwer", 26, [
      "ABBCCC",
      "A.DEEE",
      "RRDF..",
      ".GGF.H",
      "III..H",
      ".JJKKK",
    ]],
    ["knifflig", 27, [
      ".AAA.B",
      "CCDE.B",
      "RRDEFB",
      ".GG.F.",
      "HIIJJJ",
      "HKKKLL",
    ]],
    ["knifflig", 31, [
      ".AAABC",
      "DDEFBC",
      "RREF.C",
      "G.HH..",
      "GIIJJJ",
      "KKKLL.",
    ]],
    ["knifflig", 35, [
      "ABBC.D",
      "AE.C.D",
      "AERRFD",
      "GGHIF.",
      "..HIJJ",
      ".KKKLL",
    ]],
  ];

  const LEVELS = FELDER.map(([stufe, zuege, feld], index) => ({
    nr: index + 1,
    stufe,
    // Nummer innerhalb der Stufe – das ist die Zahl, die auf dem Knopf steht.
    platz: FELDER.slice(0, index + 1).filter(([s]) => s === stufe).length,
    zuege,
    feld,
  }));

  // ---------------------------------------------------------------------------
  // Feld lesen
  // ---------------------------------------------------------------------------
  // Aus den sechs Zeilen werden Wagen: je Buchstabe alle seine Felder suchen,
  // daraus Ecke, Länge und Richtung ableiten. Ein Buchstabe mit Lücke oder
  // Knick wäre kein Wagen – das fängt die Prüfung ab, hier wird nur gelesen.
  function leseFeld(zeilen) {
    const felder = new Map();
    zeilen.forEach((zeile, reihe) => {
      [...zeile].forEach((zeichen, spalte) => {
        if (zeichen === ".") return;
        if (!felder.has(zeichen)) felder.set(zeichen, []);
        felder.get(zeichen).push({ reihe, spalte });
      });
    });
    return [...felder.entries()].map(([id, teile]) => {
      const reihen = teile.map((t) => t.reihe);
      const spalten = teile.map((t) => t.spalte);
      const waagerecht = new Set(reihen).size === 1;
      return {
        id,
        reihe: Math.min(...reihen),
        spalte: Math.min(...spalten),
        laenge: teile.length,
        richtung: waagerecht ? "waagerecht" : "senkrecht",
        lok: id === "R",
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Der Löser
  // ---------------------------------------------------------------------------
  // Breitensuche über die Stellungen. Nur die Breitensuche liefert wirklich das
  // Minimum – ein Tiefenlauf fände irgendeine Lösung, und die angezeigte
  // Bestmarke wäre eine Behauptung statt einer Zahl.
  //
  // Eine Stellung ist die Liste der beweglichen Koordinaten: bei einem
  // waagerechten Wagen die Spalte, bei einem senkrechten die Reihe. Alles
  // andere an einem Wagen ändert sich nie.
  //
  // Zurück kommt die Zugzahl und der Weg dorthin. Der Weg wird nicht gespielt –
  // die App löst nichts von selbst –, aber das Prüfskript spielt ihn nach: eine
  // Zahl, die aus derselben Suche stammt, prüft sich sonst selbst.
  function suche(wagen, deckel = 200) {
    const leer = { zuege: -1, weg: null };
    const lok = wagen.findIndex((w) => w.lok);
    if (lok < 0) return leer;
    const start = wagen.map((w) => (w.richtung === "waagerecht" ? w.spalte : w.reihe));
    const draussen = (stellung) => stellung[lok] + wagen[lok].laenge === N;
    if (draussen(start)) return { zuege: 0, weg: [] };

    // Je Stellung, wie man hierhergekommen ist: nur so lässt sich der Weg am
    // Schluss rückwärts auflesen.
    const woher = new Map([[start.join(","), null]]);
    let rand = [start];
    let tiefe = 0;

    const weg = (schluessel) => {
      const schritte = [];
      let hier = schluessel;
      while (woher.get(hier)) {
        const { vorher, wagen: index, ziel } = woher.get(hier);
        schritte.push({ wagen: wagen[index].id, ziel });
        hier = vorher;
      }
      return schritte.reverse();
    };

    while (rand.length && tiefe < deckel) {
      tiefe += 1;
      const naechste = [];
      for (const stellung of rand) {
        const vorher = stellung.join(",");
        // Belegung dieser Stellung einmal aufbauen; jeder Wagen fragt sie ab.
        const raster = new Int8Array(N * N).fill(-1);
        for (let i = 0; i < wagen.length; i += 1) {
          const w = wagen[i];
          for (let k = 0; k < w.laenge; k += 1) {
            const reihe = w.richtung === "waagerecht" ? w.reihe : stellung[i] + k;
            const spalte = w.richtung === "waagerecht" ? stellung[i] + k : w.spalte;
            raster[reihe * N + spalte] = i;
          }
        }

        for (let i = 0; i < wagen.length; i += 1) {
          const w = wagen[i];
          for (const richtung of [-1, 1]) {
            for (let schritt = 1; schritt < N; schritt += 1) {
              const ziel = stellung[i] + richtung * schritt;
              if (ziel < 0 || ziel + w.laenge > N) break;
              // Nur das neu betretene Feld prüfen: der Rest war schon belegt.
              const kante = richtung < 0 ? ziel : ziel + w.laenge - 1;
              const reihe = w.richtung === "waagerecht" ? w.reihe : kante;
              const spalte = w.richtung === "waagerecht" ? kante : w.spalte;
              if (raster[reihe * N + spalte] !== -1) break;
              const nachher = stellung.slice();
              nachher[i] = ziel;
              const schluessel = nachher.join(",");
              if (woher.has(schluessel)) continue;
              woher.set(schluessel, { vorher, wagen: i, ziel });
              if (draussen(nachher)) return { zuege: tiefe, weg: weg(schluessel) };
              naechste.push(nachher);
            }
          }
        }
      }
      rand = naechste;
    }
    return leer;
  }

  // Die Mindestzugzahl allein – das ist die Zahl, die im Spiel angezeigt wird.
  function loesen(wagen, deckel = 200) { return suche(wagen, deckel).zuege; }

  // ---------------------------------------------------------------------------
  // Sterne
  // ---------------------------------------------------------------------------
  // Drei Sterne für die kürzeste Lösung. Darüber bleibt reichlich Luft: wer ein
  // Level mit dreissig nötigen Zügen in vierzig schafft, hat es verstanden –
  // ein Stern weniger wäre eine Strafe fürs Ausprobieren. Weniger als ein Stern
  // gibt es nicht, geschafft ist geschafft.
  function starsFor(zuege, ziel) {
    if (zuege <= ziel) return 3;
    if (zuege <= ziel + Math.max(2, Math.ceil(ziel / 3))) return 2;
    return 1;
  }

  const HELP = [
    "Freie Fahrt. Auf dem Bahnhof stehen Wagen kreuz und quer im Weg.",
    "Die rote Lok will nach rechts hinaus, dort ist das Tor.",
    "Jeder Wagen fährt nur in seine eigene Richtung: die quer stehenden nach links und rechts, die hochkant stehenden nach oben und unten.",
    "Zieh einen Wagen mit dem Finger. Oder tippe ihn an, dann leuchtet sein Gleis auf, und du tippst auf die Stelle, wohin er soll.",
    "Durch einen anderen Wagen hindurch geht es nie.",
    "Ein Zug ist ein Wagen, den du in eine Richtung schiebst – egal über wie viele Felder.",
    "Schieb so lange, bis die rote Lok freie Fahrt hat.",
    "Oben steht, wie viele Züge du gebraucht hast und wie wenige es mindestens braucht.",
    "Zeit hast du so viel du willst.",
  ].join(" ");

  // Farben der Wagen. Die Lok ist rot und bleibt es – kein anderer Wagen darf
  // rot sein, sonst sucht ein Kind die falsche Reihe.
  const FARBEN = [
    "#4a90d9", "#f0b429", "#5fb87a", "#9a6fd0", "#3fb8b8", "#ef8f3c",
    "#7d9bb5", "#a8cf5c", "#ef86a8", "#b1854f", "#6c8ae4", "#c9a227",
    "#4fb0a5", "#c98fd0", "#8d9aa8", "#d0a25c",
  ];
  const LOK_FARBE = "#e04b3c";

  // Diese Datei wird auch ohne Browser geladen: das Prüfskript rechnet mit
  // demselben Löser und derselben Tabelle nach, mit der die App spielt. Alles
  // ab hier braucht eine Seite.
  const api = { N, TOR_REIHE, LEVELS, STUFEN, LEVELS_FOR_DONE, leseFeld, loesen, suche, starsFor, FARBEN };
  if (typeof window !== "undefined") window.LernappFreieFahrt = api;
  if (typeof document === "undefined" || document.body?.dataset?.page !== "gridlock") return;

  const host = document.querySelector("#ff-stage");
  const shellApi = window.LernappGameShell;
  const cloudApi = window.LernappGameCloud;
  const art = window.LernappTrainArt;
  if (!host || !shellApi || !art) return;

  const kids = () => window.LernappKids || null;
  const ruhig = () => Boolean(kids()?.prefersReducedMotion?.());

  // ---------------------------------------------------------------------------
  // Fortschritt – lokal und in der Cloud
  // ---------------------------------------------------------------------------
  const store = cloudApi
    ? cloudApi.register({ key: "lernapp.freiefahrt", empty: { best: {} }, merge: cloudApi.mergeLevels })
    : {
      read: () => ({ best: {} }),
      write(data) { return data; },
      update(fn) { return fn(this.read()); },
      onChange() { return () => {}; },
    };

  const bestStars = (nr) => Number(store.read().best?.[nr]?.stars) || 0;
  const doneCount = () => Object.values(store.read().best || {}).filter((e) => (Number(e?.stars) || 0) > 0).length;

  function recordLevel(nr, stars) {
    return store.update((old) => {
      const best = { ...(old.best || {}) };
      if ((Number(best[nr]?.stars) || 0) < stars) best[nr] = { stars };
      return { ...old, best };
    });
  }

  function levelsText(fertig) {
    const offen = LEVELS_FOR_DONE - fertig;
    if (offen <= 0) return "Dieses Spiel ist geschafft – der Wagen ist gebaut.";
    return offen === 1
      ? "Noch ein Level bis zum fertigen Wagen."
      : `Noch ${offen} Level bis zum fertigen Wagen.`;
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = { phase: "menu", level: null };
  let shell = null;
  let platz = null;       // die Fläche, in der das Feld zentriert steht
  let brett = null;       // das Feld
  let zellePx = 0;        // Kantenlänge einer Zelle in Pixeln
  let spur = null;        // das aufleuchtende Gleis des angefassten Wagens
  let uhr = null;         // Zeitgeber für die Anzeige
  let beobachter = null;  // ResizeObserver auf dem Feld
  let run = null;

  const stufeVon = (id) => STUFEN.find((s) => s.id === id) || STUFEN[0];
  const achse = (w) => (w.richtung === "waagerecht" ? w.spalte : w.reihe);

  function setzeAchse(w, wert) {
    if (w.richtung === "waagerecht") w.spalte = wert; else w.reihe = wert;
  }

  // Index der k-ten Zelle eines Wagens, wenn er an der Stelle "pos" steht.
  function zelle(w, pos, k) {
    return w.richtung === "waagerecht"
      ? w.reihe * N + pos + k
      : (pos + k) * N + w.spalte;
  }

  // Wie weit dieser Wagen zurück und wie weit vor kann. Beides in Feldern der
  // eigenen Achse, nicht in Pixeln – das Umrechnen passiert erst beim Ziehen.
  function grenzen(w) {
    const belegt = new Array(N * N).fill(false);
    run.wagen.forEach((andere) => {
      if (andere === w) return;
      for (let k = 0; k < andere.laenge; k += 1) belegt[zelle(andere, achse(andere), k)] = true;
    });
    const hier = achse(w);
    let min = hier;
    while (min > 0 && !belegt[zelle(w, min - 1, 0)]) min -= 1;
    let max = hier;
    while (max + w.laenge < N && !belegt[zelle(w, max + w.laenge, 0)]) max += 1;
    return { min, max };
  }

  // ---------------------------------------------------------------------------
  // Wagen als Bild
  // ---------------------------------------------------------------------------
  // Von oben gesehen, damit sich dieselbe Zeichnung für beide Richtungen
  // verwenden lässt: die senkrechten sind die um eine Vierteldrehung gekippten
  // waagerechten. Von der Seite gezeichnet ginge das nicht – ein Wagen, der auf
  // dem Kopf steht, sieht nach Unfall aus.
  function wagenBild(w, farbe) {
    const lang = w.laenge * 100;
    const dunkel = art.shade(farbe, -0.32);
    const hell = art.shade(farbe, 0.28);
    const teile = [];

    // Drehgestelle: sie schauen oben und unten aus dem Kasten heraus und zeigen
    // damit, in welche Richtung der Wagen rollt.
    [26, lang - 26].forEach((x) => {
      teile.push(art.el("rect", { x: x - 13, y: 8, width: 26, height: 84, rx: 7, fill: "#46505f" }));
    });

    if (w.lok) {
      // Die Lok hat eine runde Nase nach rechts – dorthin, wo das Tor ist.
      teile.push(art.el("path", {
        d: `M14 20 H${lang - 46} a30 30 0 0 1 30 30 a30 30 0 0 1 -30 30 H14 a6 6 0 0 1 -6 -6 V26 a6 6 0 0 1 6 -6 Z`,
        fill: farbe, stroke: dunkel, "stroke-width": 5, "stroke-linejoin": "round",
      }));
      teile.push(art.el("rect", { x: 22, y: 28, width: 54, height: 44, rx: 10, fill: dunkel }));
      teile.push(art.el("rect", { x: 30, y: 36, width: 38, height: 28, rx: 7, fill: "#eaf2f8" }));
      teile.push(art.el("circle", { cx: lang - 52, cy: 50, r: 13, fill: dunkel }));
      teile.push(art.el("circle", { cx: lang - 52, cy: 50, r: 6, fill: hell }));
    } else {
      teile.push(art.el("rect", {
        x: 12, y: 18, width: lang - 24, height: 64, rx: 14,
        fill: farbe, stroke: dunkel, "stroke-width": 5,
      }));
      // Ein heller Streifen als Dachkante und zwei Luken: ohne sie wäre der
      // Wagen ein Farbklotz, und zwei nebeneinander sähen aus wie einer.
      teile.push(art.el("rect", { x: 22, y: 26, width: lang - 44, height: 12, rx: 6, fill: hell, opacity: "0.85" }));
      const luken = w.laenge === 3 ? [0.28, 0.5, 0.72] : [0.35, 0.65];
      luken.forEach((anteil) => {
        teile.push(art.el("rect", { x: lang * anteil - 13, y: 46, width: 26, height: 24, rx: 6, fill: dunkel, opacity: "0.55" }));
      });
    }

    const senkrecht = w.richtung === "senkrecht";
    const svg = art.el("svg", {
      viewBox: senkrecht ? `0 0 100 ${lang}` : `0 0 ${lang} 100`,
      "aria-hidden": "true",
      focusable: "false",
    }, [
      // Eine Vierteldrehung um den Ursprung, dann um eine Zellenbreite zurück
      // ins Bild geschoben: aus dem liegenden Wagen wird der stehende.
      art.el("g", senkrecht ? { transform: "translate(100 0) rotate(90)" } : {}, teile),
    ]);
    return svg;
  }

  function wagenName(w) {
    if (w.lok) return "Rote Lok";
    const laenge = w.laenge === 3 ? "langer Wagen" : "Wagen";
    return `${laenge}, ${w.richtung}`;
  }

  // ---------------------------------------------------------------------------
  // Das Feld aufbauen
  // ---------------------------------------------------------------------------
  function setzePosition(w) {
    w.node.style.setProperty("--ff-reihe", w.reihe);
    w.node.style.setProperty("--ff-spalte", w.spalte);
    w.node.setAttribute("aria-label", `${wagenName(w)}, Reihe ${w.reihe + 1}, Spalte ${w.spalte + 1}`);
  }

  function baueBrett() {
    shell.clear();

    const tisch = shell.el("div", "ff-tisch");
    tisch.append(baueHud());

    platz = shell.el("div", "ff-platz");
    brett = shell.el("div", "ff-brett");
    brett.setAttribute("role", "group");
    brett.setAttribute("aria-label", `Bahnhof mit ${N} mal ${N} Feldern, Tor rechts in Reihe ${TOR_REIHE + 1}`);

    // Das Tor: ein karierter Durchlass in der Mauer, davor ein Pfeil nach
    // draussen. Es steht immer da – es ist das Ziel, nicht ein Hinweis, der
    // wieder verschwindet.
    const tor = shell.el("div", "ff-tor");
    tor.setAttribute("aria-hidden", "true");
    tor.append(art.el("svg", { viewBox: "0 0 24 24", class: "ff-tor-pfeil" }, [
      art.el("path", {
        d: "M8 4l8 8-8 8", fill: "none", stroke: "currentColor",
        "stroke-width": 3.4, "stroke-linecap": "round", "stroke-linejoin": "round",
      }),
    ]));
    brett.append(tor);

    spur = shell.el("div", "ff-spur");
    spur.setAttribute("aria-hidden", "true");
    brett.append(spur);

    run.wagen.forEach((w, index) => {
      const farbe = w.lok ? LOK_FARBE : FARBEN[index % FARBEN.length];
      const node = shell.el("div", `ff-wagen is-${w.richtung}${w.lok ? " is-lok" : ""}`);
      node.dataset.id = w.id;
      node.tabIndex = 0;
      node.setAttribute("role", "button");
      node.style.setProperty("--ff-breite", w.richtung === "waagerecht" ? w.laenge : 1);
      node.style.setProperty("--ff-hoehe", w.richtung === "waagerecht" ? 1 : w.laenge);
      node.append(wagenBild(w, farbe));
      node.addEventListener("pointerdown", greifen);
      node.addEventListener("keydown", tastatur);
      w.node = node;
      setzePosition(w);
      brett.append(node);
    });

    // Ein Tipp auf das Feld: liegt er auf dem Gleis des gewählten Wagens, fährt
    // der dorthin – sonst hebt er die Auswahl auf. Ohne das Zweite bliebe ein
    // Gleis leuchten, obwohl das Kind längst woanders hinschaut.
    brett.addEventListener("pointerdown", (event) => {
      // Was auf einem Wagen landet, macht der Wagen selbst ab.
      if (event.target.closest(".ff-wagen")) return;
      if (!feldGetippt(event)) waehle(null);
    });

    platz.append(brett);
    tisch.append(platz);
    shell.play.append(tisch);

    // Die Zellengrösse steht in einer einzigen Variablen: alles andere – Breite,
    // Höhe, Verschiebung – rechnet der Browser daraus. Beim Drehen des Geräts
    // muss deshalb nur diese eine Zahl neu gesetzt werden, und kein Wagen wird
    // neu positioniert.
    messen();
    beobachter?.disconnect();
    if (window.ResizeObserver) {
      beobachter = new ResizeObserver(messen);
      beobachter.observe(platz);
    }
  }

  // Das Feld ist immer quadratisch, und es muss ganz auf den Schirm passen –
  // quer auf dem Handy ist die Höhe knapp, auf dem Tablet die Breite nicht.
  // Deshalb entscheidet die kleinere der beiden Seiten. Rechts bleibt gut eine
  // Zelle frei: dort steht das Tor, und dort fährt die Lok am Schluss hinaus.
  function messen() {
    if (!platz?.isConnected) return;
    const breite = platz.clientWidth - 8;
    const hoehe = platz.clientHeight - 8;
    if (breite <= 0 || hoehe <= 0) return;
    zellePx = Math.max(18, Math.min(breite / (N + 1.2), hoehe / N));
    platz.style.setProperty("--ff-zelle", `${zellePx}px`);
  }

  // ---------------------------------------------------------------------------
  // Die Anzeige neben dem Feld
  // ---------------------------------------------------------------------------
  // Links vom Feld, nicht darüber: quer auf dem Handy ist die Höhe knapp und
  // die Breite reichlich. Und rechts bleibt frei, damit die Lok am Schluss
  // sichtbar aus dem Bild fahren kann.
  function baueHud() {
    const stufe = stufeVon(state.level.stufe);
    const hud = shell.el("div", "ff-hud");
    hud.style.setProperty("--ff-stufe-farbe", stufe.farbe);
    hud.append(shell.el("p", "ff-hud-level", `${stufe.label} ${state.level.platz}`));

    const zuege = shell.el("div", "ff-hud-wert");
    zuege.append(shell.el("span", "ff-hud-name", "Züge"));
    run.zaehler = shell.el("span", "ff-hud-zahl");
    run.zaehler.setAttribute("role", "status");
    run.zaehler.setAttribute("aria-live", "polite");
    zuege.append(run.zaehler);
    hud.append(zuege);

    const zeit = shell.el("div", "ff-hud-wert");
    zeit.append(shell.el("span", "ff-hud-name", "Zeit"));
    run.zeigerZeit = shell.el("span", "ff-hud-zahl", "00:00");
    zeit.append(run.zeigerZeit);
    hud.append(zeit);

    zeigeZuege();
    return hud;
  }

  function zeigeZuege() {
    if (!run?.zaehler) return;
    run.zaehler.textContent = `${run.zuege}/${state.level.zuege}`;
    run.zaehler.classList.toggle("is-drueber", run.zuege > state.level.zuege);
    run.zaehler.setAttribute("aria-label", `${run.zuege} von mindestens ${state.level.zuege} Zügen`);
  }

  function zeitText(ms) {
    const gesamt = Math.min(99 * 60 + 59, Math.floor(ms / 1000));
    const min = String(Math.floor(gesamt / 60)).padStart(2, "0");
    const sek = String(gesamt % 60).padStart(2, "0");
    return `${min}:${sek}`;
  }

  // Nach der Wanduhr, nicht nach Zeitgeber-Schritten: ein Tab im Hintergrund
  // bekommt seine Zeitgeber gedrosselt, und die Zeit liefe zu langsam.
  function starteUhr() {
    stoppeUhr();
    run.begonnen = Date.now();
    uhr = window.setInterval(() => {
      if (run?.zeigerZeit) run.zeigerZeit.textContent = zeitText(Date.now() - run.begonnen);
    }, 500);
  }

  function stoppeUhr() {
    if (uhr) { window.clearInterval(uhr); uhr = null; }
  }

  // ---------------------------------------------------------------------------
  // Auswählen und Schieben
  // ---------------------------------------------------------------------------
  function zeigeSpur(w, min, max) {
    if (!spur) return;
    const waagerecht = w.richtung === "waagerecht";
    spur.style.setProperty("--ff-spur-reihe", waagerecht ? w.reihe : min);
    spur.style.setProperty("--ff-spur-spalte", waagerecht ? min : w.spalte);
    spur.style.setProperty("--ff-spur-breite", waagerecht ? max - min + w.laenge : 1);
    spur.style.setProperty("--ff-spur-hoehe", waagerecht ? 1 : max - min + w.laenge);
    spur.classList.add("is-da");
  }

  function versteckeSpur() {
    spur?.classList.remove("is-da");
  }

  // Ausgewählt ist höchstens einer. Das ist der Weg für Kinder, denen das
  // Ziehen noch schwerfällt: erst den Wagen antippen, dann die Stelle auf dem
  // hell gewordenen Gleis.
  function waehle(w) {
    if (run.gewaehlt === w) w = null;
    run.wagen.forEach((andere) => andere.node?.classList.toggle("is-gewaehlt", andere === w));
    run.gewaehlt = w || null;
    if (!w) { versteckeSpur(); return; }
    const { min, max } = grenzen(w);
    if (min === max) { versteckeSpur(); anschlag(w); run.gewaehlt = null; w.node.classList.remove("is-gewaehlt"); return; }
    zeigeSpur(w, min, max);
  }

  // Ein Wagen, der nicht kann: ein kurzer Ruck an Ort und Stelle. Ohne diese
  // Antwort wirkt der Tipp, als wäre er gar nicht angekommen.
  function anschlag(w) {
    if (!w.node || ruhig()) return;
    w.node.classList.remove("is-anschlag");
    // Neu anstossen: ohne den erzwungenen Umbruch läuft die Bewegung beim
    // zweiten Mal nicht noch einmal los.
    void w.node.offsetWidth;
    w.node.classList.add("is-anschlag");
    window.setTimeout(() => w.node?.classList.remove("is-anschlag"), 340);
  }

  function greifen(event) {
    if (state.phase !== "spiel" || event.button > 0) return;
    const node = event.currentTarget;
    const w = run.wagen.find((eintrag) => eintrag.id === node.dataset.id);
    if (!w) return;
    event.preventDefault();

    const { min, max } = grenzen(w);
    const start = achse(w);
    // Ein eingeklemmter Wagen bekommt kein Gleis zu sehen: ein Leuchtstreifen
    // genau in seiner eigenen Grösse verspräche einen Weg, den es nicht gibt.
    // Die bisherige Auswahl fällt trotzdem weg – sonst leuchtete kein Gleis
    // mehr, ein anderer Wagen wäre aber immer noch gewählt und führe beim
    // nächsten Tipp aufs Feld unerwartet los.
    if (min === max) { waehle(null); anschlag(w); return; }
    zeigeSpur(w, min, max);
    node.focus?.({ preventScroll: true });

    const griff = {
      x: event.clientX, y: event.clientY, start, min, max,
      waagerecht: w.richtung === "waagerecht",
      gezogen: false, geknallt: false, schub: 0,
    };
    try { node.setPointerCapture(event.pointerId); } catch { /* Maus ohne Zeigerfang */ }

    function bewegen(ev) {
      const roh = griff.waagerecht ? ev.clientX - griff.x : ev.clientY - griff.y;
      if (!griff.gezogen && Math.abs(roh) < 4) return;
      if (!griff.gezogen) { griff.gezogen = true; node.classList.add("is-zieht"); }
      const gross = zellePx;
      const unten = (griff.min - griff.start) * gross;
      const oben = (griff.max - griff.start) * gross;
      griff.schub = Math.max(unten, Math.min(oben, roh));
      // Deutlich über den Anschlag hinaus: einmal rückmelden, dass hier Schluss
      // ist. Danach nicht mehr – ein dauernd zuckender Wagen wäre lästig.
      if (!griff.geknallt && (roh < unten - gross * 0.3 || roh > oben + gross * 0.3)) {
        griff.geknallt = true;
        anschlag(w);
        kids()?.vibrate?.(10);
      }
      node.style.setProperty(griff.waagerecht ? "--ff-schub" : "--ff-hub", `${griff.schub}px`);
    }

    function loslassen(ev) {
      node.removeEventListener("pointermove", bewegen);
      node.removeEventListener("pointerup", loslassen);
      node.removeEventListener("pointercancel", loslassen);
      try { node.releasePointerCapture(ev.pointerId); } catch { /* egal */ }
      node.classList.remove("is-zieht");
      node.style.removeProperty("--ff-schub");
      node.style.removeProperty("--ff-hub");

      if (!griff.gezogen) { waehle(w); return; }

      const gross = zellePx || 1;
      const ziel = Math.max(griff.min, Math.min(griff.max, Math.round(griff.start + griff.schub / gross)));
      if (ziel === griff.start) { versteckeSpur(); return; }
      schiebe(w, ziel);
    }

    node.addEventListener("pointermove", bewegen);
    node.addEventListener("pointerup", loslassen);
    node.addEventListener("pointercancel", loslassen);
  }

  // Ein Tipp auf das Feld, während ein Wagen gewählt ist: er fährt mit seinem
  // näheren Ende bis auf das getippte Feld. Getippt werden darf die ganze
  // Reihe bzw. Spalte, nicht nur das leuchtende Stück – wer weiter zeigt, als
  // es geht, meint "so weit du kannst" und nicht "gar nicht".
  //
  // Zurück kommt, ob der Tipp zu diesem Wagen gehörte. Tat er es nicht, hebt
  // der Aufrufer die Auswahl auf.
  function feldGetippt(event) {
    const w = run.gewaehlt;
    if (state.phase !== "spiel" || !w || !brett) return false;
    const rand = brett.getBoundingClientRect();
    const gross = zellePx || 1;
    const feldX = Math.floor((event.clientX - rand.left) / gross);
    const feldY = Math.floor((event.clientY - rand.top) / gross);
    const aufAchse = w.richtung === "waagerecht" ? feldY === w.reihe : feldX === w.spalte;
    if (!aufAchse) return false;
    event.preventDefault();
    const getippt = w.richtung === "waagerecht" ? feldX : feldY;
    const { min, max } = grenzen(w);
    const roh = getippt > achse(w) ? getippt - w.laenge + 1 : getippt;
    const ziel = Math.max(min, Math.min(max, roh));
    if (ziel === achse(w)) { anschlag(w); return true; }
    schiebe(w, ziel);
    return true;
  }

  function tastatur(event) {
    if (state.phase !== "spiel") return;
    const w = run.wagen.find((eintrag) => eintrag.id === event.currentTarget.dataset.id);
    if (!w) return;
    const schritte = {
      ArrowLeft: ["waagerecht", -1], ArrowRight: ["waagerecht", 1],
      ArrowUp: ["senkrecht", -1], ArrowDown: ["senkrecht", 1],
    };
    if (event.key === " " || event.key === "Enter") { event.preventDefault(); waehle(w); return; }
    const schritt = schritte[event.key];
    if (!schritt) return;
    event.preventDefault();
    if (schritt[0] !== w.richtung) { anschlag(w); return; }
    const { min, max } = grenzen(w);
    const ziel = Math.max(min, Math.min(max, achse(w) + schritt[1]));
    if (ziel === achse(w)) { anschlag(w); return; }
    schiebe(w, ziel);
  }

  // Ein Zug ist ein Wagen, den man in eine Richtung schiebt – egal über wie
  // viele Felder und egal, in wie vielen Griffen. Wer denselben Wagen zweimal
  // hintereinander weiter in dieselbe Richtung schiebt, hat ihn einmal
  // geschoben; genau so zählt auch der Löser, und nur so ist die angezeigte
  // Bestmarke ein faires Mass. Sonst zahlte drauf, wer sich vortastet, statt
  // gleich durchzuziehen – und mit der Tastatur, die Feld für Feld geht, wäre
  // die Bestmarke gar nicht zu erreichen.
  function schiebe(w, ziel) {
    const richtung = Math.sign(ziel - achse(w));
    const weiter = run.letzter && run.letzter.id === w.id && run.letzter.richtung === richtung;
    run.letzter = { id: w.id, richtung };

    setzeAchse(w, ziel);
    setzePosition(w);
    versteckeSpur();
    waehle(null);
    if (!weiter) run.zuege += 1;
    zeigeZuege();
    kids()?.playJingle?.("star");
    kids()?.vibrate?.(8);
    if (w.lok && w.spalte + w.laenge === N) gewonnen(w);
  }

  // ---------------------------------------------------------------------------
  // Geschafft
  // ---------------------------------------------------------------------------
  function gewonnen(lok) {
    state.phase = "aus";
    stoppeUhr();
    const dauer = Date.now() - run.begonnen;
    if (run.zeigerZeit) run.zeigerZeit.textContent = zeitText(dauer);

    // Die Lok fährt sichtbar durch das Tor aus dem Bild. Erst danach kommt die
    // Tafel – sonst verdeckte sie genau den Moment, auf den alles hinauslief.
    lok.node.classList.add("is-abfahrt");
    lok.node.style.setProperty("--ff-spalte", N + 2);
    kids()?.playWhistle?.("hoch");

    const stars = starsFor(run.zuege, state.level.zuege);
    window.setTimeout(() => {
      if (state.phase !== "aus") return;
      kids()?.playJingle?.("win");
      kids()?.vibrate?.([12, 60, 12]);
      recordLevel(state.level.nr, stars);
      const fertig = doneCount();
      shell.setCount(fertig);
      shell.showResult({
        label: `${stufeVon(state.level.stufe).label} ${state.level.platz} geschafft`,
        stars,
        detail: `${run.zuege} ${run.zuege === 1 ? "Zug" : "Züge"} · ${zeitText(dauer)}`,
        note: { text: levelsText(fertig), done: fertig >= LEVELS_FOR_DONE },
        speech: schlussSatz(stars, fertig),
        onBack: showMenu,
      });
      const tafel = host.querySelector(".cm-panel");
      if (tafel) kids()?.burstConfetti?.(tafel, stars >= 3 ? 56 : 36);
    }, ruhig() ? 120 : 900);
  }

  function schlussSatz(stars, fertig) {
    const sterne = stars === 1 ? "einen Stern" : `${stars} Sterne`;
    const zuege = run.zuege === state.level.zuege
      ? "Das war der kürzeste Weg."
      : `Du hast ${run.zuege} Züge gebraucht, am kürzesten geht es in ${state.level.zuege}.`;
    return `Die Lok ist draussen. Du hast ${sterne}. ${zuege} ${levelsText(fertig)}`;
  }

  // ---------------------------------------------------------------------------
  // Levelwahl
  // ---------------------------------------------------------------------------
  function showMenu() {
    stoppeUhr();
    beobachter?.disconnect();
    beobachter = null;
    platz = null;
    brett = null;
    spur = null;
    run = null;
    state.phase = "menu";
    shell.closeOverlay();
    shell.setPhase("menu");
    shell.setCount(doneCount());

    shell.clear();
    shell.play.append(shell.el("p", "cm-prompt", "Welchen Bahnhof möchtest du räumen?"));

    const reihen = shell.el("div", "ff-stufen");
    STUFEN.forEach((stufe) => {
      const spalte = shell.el("div", "ff-stufe");
      spalte.style.setProperty("--ff-stufe-farbe", stufe.farbe);
      spalte.append(shell.el("p", "ff-stufe-name", stufe.label));
      const liste = shell.el("div", "ff-stufe-level");
      LEVELS.filter((level) => level.stufe === stufe.id).forEach((level) => {
        liste.append(levelKnopf(level, stufe));
      });
      spalte.append(liste);
      reihen.append(spalte);
    });
    shell.play.append(reihen);
  }

  function levelKnopf(level, stufe) {
    const knopf = shell.el("button", "ff-level");
    knopf.type = "button";
    const stars = bestStars(level.nr);
    knopf.setAttribute("aria-label",
      `${stufe.label} ${level.platz}: mindestens ${level.zuege} Züge. ${stars ? `${stars} von 3 Sternen.` : "Noch nicht gespielt."}`);
    knopf.append(shell.el("span", "ff-level-nr", String(level.platz)));
    // Die Mindestzugzahl steht schon auf dem Knopf: sie ist das Mass, an dem
    // sich ein Level messen lässt, und wer sich eines aussucht, soll wissen,
    // worauf es hinausläuft.
    const ziel = shell.el("span", "ff-level-ziel");
    ziel.append(shell.el("span", "ff-level-ziel-zahl", String(level.zuege)));
    ziel.append(shell.el("span", "ff-level-ziel-wort", "Züge"));
    knopf.append(ziel);
    const sterne = shell.el("span", "ff-level-sterne");
    for (let i = 0; i < 3; i += 1) sterne.append(shell.el("span", `ff-level-stern${i < stars ? " is-on" : ""}`, "★"));
    knopf.append(sterne);
    knopf.addEventListener("click", () => startLevel(level));
    return knopf;
  }

  // ---------------------------------------------------------------------------
  // Ein Level
  // ---------------------------------------------------------------------------
  function startLevel(level) {
    stoppeUhr();
    state.phase = "spiel";
    state.level = level;
    shell.closeOverlay();
    shell.setPhase("play");
    shell.setCount(doneCount());

    run = { wagen: leseFeld(level.feld), zuege: 0, gewaehlt: null, letzter: null, begonnen: Date.now() };
    baueBrett();
    starteUhr();
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  shell = shellApi.mount({
    host,
    title: "Freie Fahrt",
    area: "konzentration",
    accent: "#00A5B5",
    accentDark: "#00707c",
    help: HELP,
    clock: false,
    onRestart: () => (state.phase === "menu" ? showMenu() : startLevel(state.level)),
    // Zurück aus einem Level führt in die Levelwahl, nicht gleich aus dem Spiel
    // heraus. Erst von dort geht es in die Bereichsauswahl.
    onBack: () => {
      if (state.phase === "menu") return false;
      showMenu();
      return true;
    },
  });

  showMenu();

  window.addEventListener("resize", messen);
  window.addEventListener("orientationchange", messen);
  window.addEventListener("pagehide", stoppeUhr);

  // Für die Prüfskripte: die Stellung auf dem Brett, als Kopie.
  api.stellung = () => (run ? run.wagen.map(({ node, ...rest }) => rest) : []);
  api.zuege = () => (run ? run.zuege : 0);
})();
