/*
 * bau-spiele.js – Kleine Spiele in einzelnen Zimmern der Bauecke.
 * ---------------------------------------------------------------------------
 * In manchen Zimmern gibt es etwas zu tun: in der Bäckerei Brot backen, beim
 * Coiffeur Haare schneiden, in der Radiologie den gebrochenen Knochen finden …
 * Jedes Spiel dauert eine halbe bis anderthalb Minuten, hat keine Zeitnot und
 * kein Verlieren: Ein falscher Tipp bekommt einen freundlichen Hinweis und
 * einen leisen Ton, dann geht es weiter.
 *
 * Was es gibt (window.LernappBauSpiele):
 *   SPIELE        { raumId: { id, name, text } } – welches Zimmer welches Spiel
 *                 hat; text ist ein Satz, der das Spiel erklärt (gesprochen)
 *   hat(raumId)   ob das Zimmer ein Spiel hat
 *   starte({ host, raumId, sag, klang, figur, fertig, geschlossen })
 *                 öffnet das Spiel als Ebene über host und gibt schliessen()
 *                 zurück. figur ({ art, variante }) ist ein Bewohner, der im
 *                 Zimmer ist: Er ist der Kunde, der Gast, der Patient.
 *                 fertig({ spiel }) kommt einmal je geschaffte Runde,
 *                 geschlossen() (freiwillig), wenn das Spiel zugeht.
 *   saetze()      alle Sätze, die ein Spiel je sagen kann – für die Aufnahmen
 *
 * Gesprochen wird nur, was in saetze() steht: Jeder Satz ist aufgenommen. Ein
 * Satz hat höchstens ein Wechselndes (eine Zahl, eine Ware, eine Farbe). Wo
 * mehrere Sätze hintereinander kommen, gehen sie in einem Aufruf von sag()
 * hinaus, mit je einem Leerzeichen dazwischen – kids.js teilt sie wieder an den
 * Satzenden (saetzeVon). Kein Satz, auf den noch einer folgt, endet mit einer
 * Zahl: Hinter «7.» teilt kids.js nicht.
 *
 * Gezeichnet wird auf einer festen Fläche (MASS: «normal» fürs Tablet, «breit»
 * fürs Handy im Querformat), die als Ganzes in die Bühne skaliert wird. So
 * stimmen die Abstände auf jedem Gerät, und alles Bewegte sind HTML-Elemente
 * oder kleine SVG-Bilder, die über transform und opacity wandern.
 */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const kids = () => window.LernappKids || null;
  const reduced = () => Boolean(kids()?.prefersReducedMotion?.()) || Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  // ---------------------------------------------------------------------------
  // Kleine Helfer (wie in train-bau.js)
  // ---------------------------------------------------------------------------
  function el(tag, cls = "", attrs = {}) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else node.setAttribute(key, value);
    });
    return node;
  }
  function knopf(cls, label, inhalt, onClick) {
    const b = el("button", cls, { type: "button", "aria-label": label, title: label });
    if (inhalt) b.innerHTML = inhalt;
    if (onClick) b.addEventListener("click", onClick);
    return b;
  }
  function svgVon(markup, viewBox, cls = "", extra = "") {
    return `<svg xmlns="${NS}" viewBox="${viewBox}"${cls ? ` class="${cls}"` : ""}${extra ? ` ${extra}` : ""} aria-hidden="true" focusable="false">${markup}</svg>`;
  }
  const zufall = (n) => Math.floor(Math.random() * n);
  const mischen = (liste) => {
    const a = [...liste];
    for (let i = a.length - 1; i > 0; i -= 1) { const j = zufall(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const r1 = (v) => Math.round(v * 10) / 10;
  // Eine Stelle auf der Spielfläche (in ihren Massen).
  function platz(node, x, y, w = null, h = null) {
    node.style.left = `${Math.round(x)}px`;
    node.style.top = `${Math.round(y)}px`;
    if (w !== null) node.style.width = `${Math.round(w)}px`;
    if (h !== null) node.style.height = `${Math.round(h)}px`;
    return node;
  }
  // Eine CSS-Animation noch einmal von vorn.
  function anstossen(node, cls) {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }
  function dunkler(hex, menge) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    if (!Number.isFinite(n)) return hex;
    const m = (c) => Math.max(0, Math.min(255, Math.round(menge >= 0 ? c * (1 - menge) : c + (255 - c) * -menge)));
    return `#${((1 << 24) | (m((n >> 16) & 255) << 16) | (m((n >> 8) & 255) << 8) | m(n & 255)).toString(16).slice(1)}`;
  }

  // ---------------------------------------------------------------------------
  // Welches Zimmer welches Spiel hat
  // ---------------------------------------------------------------------------
  const SPIELE = {
    baeckerei: { id: "brot", name: "Brot backen", text: "Wähle eine Form, knete den Teig und backe ihn im Ofen." },
    coiffeur: { id: "haare", name: "Haare schneiden", text: "Schneide die langen Haare und mach eine schöne Frisur." },
    radiologie: { id: "roentgen", name: "Röntgenbild", text: "Finde auf dem Röntgenbild den gebrochenen Knochen." },
    lebensmittel: { id: "einkaufen", name: "Einkaufen", text: "Kaufe ein, was auf dem Zettel steht, und bezahle mit Franken." },
    augen: { id: "sehtest", name: "Sehtest", text: "Schau genau, wohin der Haken zeigt, und tippe auf den gleichen Pfeil." },
    blumen: { id: "strauss", name: "Blumenstrauss", text: "Binde einen Blumenstrauss mit genau den richtigen Blumen." },
    musik: { id: "melodie", name: "Melodie nachspielen", text: "Hör gut zu und spiel die Melodie nach." },
    rezeption: { id: "schluessel", name: "Zimmerschlüssel", text: "Gib jedem Gast den Schlüssel für sein Zimmer." },
    notfall: { id: "pflaster", name: "Pflaster kleben", text: "Klebe Pflaster auf die Kratzer, damit sie schnell heilen." },
  };
  const hat = (raumId) => Object.prototype.hasOwnProperty.call(SPIELE, String(raumId || ""));

  // ---------------------------------------------------------------------------
  // Die Sätze – jeder einzeln, so wie er aufgenommen wird
  // ---------------------------------------------------------------------------
  const ZAHLWORT = ["", "Eins!", "Zwei!", "Drei!", "Vier!", "Fünf!"];
  const T = {
    brot: {
      was: "Was möchtest du backen?",
      form: { zopf: "Einen Zopf!", gipfeli: "Gipfeli!", brot: "Ein Brot!" },
      kneten: "Tippe fünfmal auf den Teig.",
      zuerst: "Zuerst kneten wir den Teig.",
      ofenJetzt: "Jetzt ab in den Ofen!",
      ofen: "Tippe auf den Ofen.",
      backt: "Jetzt wird gebacken.",
      moment: "Noch einen Moment!",
      ding: "Ding!",
      raus: "Hol es aus dem Ofen.",
      fertig: "Mmh, fertig gebacken!",
    },
    haare: {
      schneiden: "Schneide die langen Haare mit der Schere.",
      wie: "Tippe auf die Strähnen oder wische darüber.",
      schnipp: "Schnipp!",
      nurHaare: "Schneide nur die langen Haare.",
      super: "Super!",
      masche: "Welche Masche möchtest du?",
      maschen: { rot: "Eine rote Masche!", blau: "Eine blaue Masche!", gelb: "Eine gelbe Masche!", rosa: "Eine rosa Masche!" },
      spiegel: "Schau in den Spiegel.",
      schick: "Schick!",
    },
    roe: {
      schau: "Schau dir das Röntgenbild an.",
      typ: { pfote: "Das ist eine Pfote.", arm: "Das ist ein Arm.", bein: "Das ist ein Bein." },
      wo: "Wo ist der Knochen gebrochen?",
      hier: "Hier ist der Knochen gebrochen.",
      gips: "Jetzt bekommt er einen Gips.",
      ganz: "Dieser Knochen ist ganz.",
      weiter: "Such weiter!",
      ende: "Super, alle Knochen haben einen Gips!",
    },
    kauf: {
      zettel: "Hol alles, was auf dem Einkaufszettel steht.",
      nicht: "Das steht nicht auf dem Zettel.",
      alles: "Alles im Korb!",
      muenzen: "Tippe auf die Münzen.",
      zuViel: "Das ist zu viel.",
      zurueck: "Nimm eine Münze zurück.",
      ende: "Genau richtig, danke für den Einkauf!",
    },
    seh: {
      frage: "Wohin zeigt der Haken?",
      pfeil: "Tippe auf den gleichen Pfeil.",
      richtung: { oben: "Nach oben!", unten: "Nach unten!", links: "Nach links!", rechts: "Nach rechts!" },
      nochmal: "Schau noch einmal genau hin.",
      kleiner: "Jetzt wird der Haken kleiner.",
      undJetzt: "Und jetzt?",
      ende: "Super, deine Augen sehen sehr gut!",
    },
    blume: {
      tippe: "Tippe auf die Blumen in den Eimern.",
      fertig: "Jetzt tippe auf Fertig.",
      ende: "Ein wunderschöner Strauss!",
    },
    mel: {
      hoer: "Hör gut zu.",
      du: "Jetzt du!",
      richtig: "Richtig!",
      dazu: "Jetzt kommt ein Ton dazu.",
      nochmal: "Hör noch einmal zu.",
      ende: "Super, du hast die ganze Melodie gespielt!",
    },
    schl: {
      tag: "Guten Tag!",
      danke: "Danke!",
      ende: "Alle Gäste haben ihren Schlüssel!",
    },
    pfl: {
      aua: "Aua!",
      zieh: "Zieh die Pflaster auf die roten Kratzer.",
      gut: "Gut so!",
      noch: "Noch ein Kratzer!",
      genau: "Klebe das Pflaster genau auf einen roten Kratzer.",
      ende: "Gute Besserung!",
    },
  };
  // Sätze mit einem Wechselnden
  const satzFranken = (n) => (n === 1 ? "Ein Franken." : `${n} Franken.`);
  const satzPreis = (n) => `Das kostet ${n} Franken.`;
  const satzZimmer = (n) => `Zimmer ${n}, bitte.`;
  const satzFalscherSchluessel = (n) => `Die ${n} passt nicht.`;
  const satzWare = (w) => `${w.wort}.`;
  const satzWunsch = (n, f, erste) => (erste
    ? (n === 1 ? `Wir brauchen eine ${f.adj} Blume.` : `Wir brauchen ${n} ${f.adj} Blumen.`)
    : (n === 1 ? `Und eine ${f.adj} Blume.` : `Und ${n} ${f.adj} Blumen.`));
  const satzKeine = (f) => `Wir brauchen keine ${f.adjN} Blumen.`;
  const satzGenug = (f) => `Wir haben schon genug ${f.adj} Blumen.`;
  const satzFehlen = (f) => `Es fehlen noch ${f.adj} Blumen.`;

  const PREIS_MIN = 2;
  const PREIS_MAX = 9;
  const ZIMMER_MAX = 20;

  // Wie kids.js (saetzeVon): geteilt hinter . ! ? … und einem Doppelpunkt, wo
  // ein Leerzeichen folgt – nicht hinter einer Zahl mit Punkt.
  function saetzeVon(text) {
    const teile = [];
    const muster = /(?:[.!?…]+[»"]?|:)(?=\s)/g;
    let anfang = 0;
    let treffer;
    while ((treffer = muster.exec(text))) {
      if (treffer[0] === "." && /\d$/.test(text.slice(anfang, treffer.index))) continue;
      const ende = treffer.index + treffer[0].length;
      teile.push(text.slice(anfang, ende).trim());
      anfang = ende;
    }
    teile.push(text.slice(anfang).trim());
    return teile.filter(Boolean);
  }

  // ---------------------------------------------------------------------------
  // Dinge aus der Bauecke, Tiere und Menschen
  // ---------------------------------------------------------------------------
  // Ein Ding aus bau-moebel*.js als kleines Bild (Nullpunkt unten in der Mitte).
  function dingSvg(id, cls = "bsp-bild") {
    const M = window.LernappBauMoebel;
    const d = M?.DINGE?.[id];
    const markup = d ? M.zeichne(id) : "";
    if (!markup) return svgVon('<circle cx="0" cy="-14" r="12" fill="#cbd5e0"/>', "-20 -30 40 32", cls);
    return svgVon(markup, `${r1(-d.w / 2 - 3)} ${r1(-d.h - 3)} ${d.w + 6} ${d.h + 6}`, cls);
  }

  const BOX_STANDARD = { x0: -30, y0: -106, x1: 34, y1: 0 };
  // Ein freundliches Gesicht, wenn es keinen Zeichner gibt.
  const GESICHT = '<ellipse cx="0" cy="0" rx="20" ry="4" fill="#000" opacity=".12"/>' +
    '<path d="M-20 0v-30q0-14 20-14t20 14v30z" fill="#7cc0e8" stroke="#4f97c4" stroke-width="1.5"/>' +
    '<circle cx="0" cy="-66" r="27" fill="#ffd9b8" stroke="#e7b48c" stroke-width="1.5"/>' +
    '<circle cx="-9" cy="-70" r="3.2" fill="#2b201d"/><circle cx="9" cy="-70" r="3.2" fill="#2b201d"/>' +
    '<circle cx="-15" cy="-60" r="4" fill="#ff9f9f" opacity=".6"/><circle cx="15" cy="-60" r="4" fill="#ff9f9f" opacity=".6"/>' +
    '<path d="M-8 -57q8 7 16 0" fill="none" stroke="#2b201d" stroke-width="2" stroke-linecap="round"/>';
  // Wo der Kopf sitzt, wenn er nicht dort ist, wo fast alle ihn haben.
  // s: wie gross die Frisur ist (beim Kleinkind kleiner).
  const KOPF = { giraffe: { dx: 4, dy: -42 }, flamingo: { dx: 8, dy: -16 } };

  function figurZeichnung(figur, ersatzArt = "fox") {
    const art = String(figur?.art || ersatzArt);
    const variante = Number.isFinite(Number(figur?.variante)) ? Math.trunc(Number(figur.variante)) : 0;
    const menschen = window.LernappBauMenschen;
    if (art.startsWith("m_") && typeof menschen?.tier === "function") {
      try {
        const svg = menschen.tier(art, { variante });
        const box = (typeof menschen.box === "function" && menschen.box(art)) || BOX_STANDARD;
        // Ein Mensch ist grösser als ein Tier: Kopf oben am Kasten, alles
        // andere (Hals, Arme, Beine) mit seiner Höhe gestreckt.
        if (svg) return { svg, box, art, mensch: true, hoehe: -box.y0 / 96, breite: Math.min(1, (box.x1 - box.x0) / 54), kopf: { dx: 0, dy: box.y0 + 10 + 86, s: box.y0 > -80 ? 0.62 : 0.86 } };
      } catch { /* dann ein Tier */ }
    }
    const tiere = window.LernappBauTiere;
    if (typeof tiere?.tier === "function") {
      const a = (tiere.ARTEN || []).includes(art) ? art : ersatzArt;
      const fig = figur?.figur ? String(figur.figur) : "";
      try {
        return { svg: tiere.tier(a, { variante, figur: fig }), box: tiere.box?.(a, { figur: fig }) || BOX_STANDARD, art: a, mensch: false, hoehe: 1, breite: 1, kopf: KOPF[a] || { dx: 0, dy: 0 } };
      } catch { /* dann das Gesicht */ }
    }
    return { svg: GESICHT, box: { x0: -30, y0: -96, x1: 30, y1: 0 }, art: "", mensch: false, hoehe: 1, breite: 1, kopf: { dx: 0, dy: 0 } };
  }
  // Eine Figur in einen Bereich (w × h), mit den Füssen unten.
  function figurBild(info, w, h, cls = "bsp-bild") {
    const b = info.box;
    const k = Math.min((w - 2) / (b.x1 - b.x0), (h - 3) / (b.y1 - b.y0));
    const x = w / 2 - ((b.x0 + b.x1) / 2) * k;
    return svgVon(`<g transform="translate(${r1(x)} ${h - 2}) scale(${k.toFixed(3)})">${info.svg}</g>`, `0 0 ${w} ${h}`, cls);
  }
  // Ein Rahmen, in den eine Zeichnung (viewBox vb) mit «meet» gelegt wird,
  // unten bündig: Wo ein Punkt der Zeichnung auf der Spielfläche liegt.
  function rahmen(bereich, vb) {
    const [bx, by, bw, bh] = bereich;
    const [vx, vy, vw, vh] = vb;
    const s = Math.min(bw / vw, bh / vh);
    const ox = bx + (bw - vw * s) / 2;
    const oy = by + (bh - vh * s);
    return { s, ab: (u, v) => ({ x: ox + (u - vx) * s, y: oy + (v - vy) * s }) };
  }

  // ---------------------------------------------------------------------------
  // Töne für das Musikzimmer (eigener AudioContext; der Ton-Schalter von
  // kids.js gilt auch hier)
  // ---------------------------------------------------------------------------
  let audio = null;
  function tonAn() {
    const k = kids();
    if (typeof k?.audioEnabled === "function") return k.audioEnabled() !== false;
    if (typeof k?.isMuted === "function") return !k.isMuted();
    return true;
  }
  function spieleTon(freq, dauer = 0.5, laut = 0.12) {
    if (!tonAn()) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!audio) audio = new AC();
      if (audio.state === "suspended") audio.resume().catch(() => {});
      const t = audio.currentTime + 0.01;
      [[freq, "triangle", laut], [freq * 2, "sine", laut * 0.3]].forEach(([f, typ, vol]) => {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = typ;
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
        o.connect(g);
        g.connect(audio.destination);
        o.start(t);
        o.stop(t + dauer + 0.05);
      });
    } catch { /* ohne Ton */ }
  }

  // ---------------------------------------------------------------------------
  // Ziehen oder Antippen (Einkaufen, Pflaster)
  // ---------------------------------------------------------------------------
  // Ein kurzer Tipp ruft tipp(); wer zieht, zieht einen «Geist» mit, und beim
  // Loslassen kommt los(punkt) – der Punkt in Massen der Spielfläche.
  function ziehbar(ctx, node, { geist, tipp, los }) {
    // Mit der Tastatur (Enter, Leertaste) zählt es als Tipp.
    node.addEventListener("click", (e) => { if (e.detail === 0 && ctx.darf()) tipp?.(); });
    node.addEventListener("pointerdown", (e) => {
      if ((e.button || 0) > 0 || !ctx.darf()) return;
      e.preventDefault();
      const id = e.pointerId;
      const p0 = ctx.punkt(e);
      let g = null;
      try { node.setPointerCapture(id); } catch { /* alter Browser */ }
      const setze = (p) => { g.style.transform = `translate(${r1(p.x - g._w / 2)}px, ${r1(p.y - g._h / 2)}px)`; };
      const weg = () => {
        node.removeEventListener("pointermove", zieht);
        node.removeEventListener("pointerup", ende);
        node.removeEventListener("pointercancel", abbruch);
      };
      const zieht = (ev) => {
        if (ev.pointerId !== id) return;
        const p = ctx.punkt(ev);
        if (!g && Math.hypot(p.x - p0.x, p.y - p0.y) > 10) {
          g = geist();
          if (!g) return;
          g.classList.add("bsp-geist");
          ctx.szene.append(g);
          node.classList.add("is-gezogen");
        }
        if (g) setze(p);
      };
      const ende = (ev) => {
        if (ev.pointerId !== id) return;
        weg();
        if (!g) { tipp?.(); return; }
        g.remove();
        node.classList.remove("is-gezogen");
        los?.(ctx.punkt(ev));
      };
      const abbruch = (ev) => {
        if (ev.pointerId !== id) return;
        weg();
        g?.remove();
        node.classList.remove("is-gezogen");
      };
      node.addEventListener("pointermove", zieht);
      node.addEventListener("pointerup", ende);
      node.addEventListener("pointercancel", abbruch);
    });
  }

  // Ein Bild fliegt von einem Ort zum anderen (Massen der Spielfläche).
  function fliege(ctx, markup, von, nach, { dauer = 480, cls = "" } = {}) {
    return new Promise((ok) => {
      if (reduced()) { ok(); return; }
      const f = el("div", `bsp-flieger ${cls}`, { html: markup });
      platz(f, von.x, von.y, von.w, von.h);
      ctx.szene.append(f);
      const dx = nach.x + nach.w / 2 - (von.x + von.w / 2);
      const dy = nach.y + nach.h / 2 - (von.y + von.h / 2);
      const s = Math.max(0.2, Math.min(nach.w / von.w, nach.h / von.h));
      f.style.transition = `transform ${dauer}ms cubic-bezier(.4,.1,.3,1), opacity ${dauer}ms ease`;
      requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transform = `translate(${r1(dx)}px, ${r1(dy)}px) scale(${s.toFixed(3)})`; }));
      ctx.nach(dauer + 30, () => { f.remove(); ok(); });
    });
  }

  // ---------------------------------------------------------------------------
  // Zeichnungen
  // ---------------------------------------------------------------------------
  const TEIG = {
    roh: { a: "#f8e6c4", b: "#efd5a6", s: "#d6b47e", l: "#fff6e3" },
    gebacken: { a: "#dc9a52", b: "#c7843c", s: "#93592a", l: "#f3c58a" },
  };
  // Zopf, Gipfeli und Brot – in -64 -44 128 88.
  function formSvg(form, gebacken = true) {
    const f = gebacken ? TEIG.gebacken : TEIG.roh;
    if (form === "zopf") {
      // Zwei Reihen schräger Wülste, ineinander geflochten
      let s = '<ellipse cx="0" cy="30" rx="58" ry="6" fill="#000" opacity=".1"/>';
      const n = 7;
      for (let i = 0; i < n; i += 1) {
        const k = i === 0 || i === n - 1 ? 0.8 : 1;
        [[-48 + i * 15.6, -7, -40], [-40 + i * 15.6, 7, 40]].forEach(([x, y, rot], j) => {
          s += `<g transform="translate(${r1(x)} ${y}) rotate(${rot}) scale(${k})"><ellipse rx="14.5" ry="9.6" fill="${j ? f.a : f.b}" stroke="${f.s}" stroke-width="2.1"/><ellipse cx="-3" cy="-3.4" rx="5.4" ry="2.4" fill="${f.l}" opacity=".75"/></g>`;
        });
      }
      return s;
    }
    if (form === "gipfeli") {
      const teile = [[-44, 20, 7, 8, -55], [44, 20, 7, 8, 55], [-34, 9, 10, 12, -38], [34, 9, 10, 12, 38], [-19, 0, 13, 16, -18], [19, 0, 13, 16, 18], [0, -3, 15, 19, 0]];
      let s = '<ellipse cx="0" cy="30" rx="54" ry="6" fill="#000" opacity=".1"/>';
      teile.forEach(([x, y, rx, ry, rot], i) => {
        s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${i % 2 ? f.a : f.b}" stroke="${f.s}" stroke-width="2.2"/>`;
      });
      s += `<path d="M-6 -16q6 10 0 24M6 -16q-6 10 0 24M-24 -8q4 8 0 18M24 -8q-4 8 0 18" fill="none" stroke="${f.s}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
      s += `<ellipse cx="-4" cy="-12" rx="5" ry="2.6" fill="${f.l}" opacity=".7"/>`;
      return s;
    }
    // Brot
    return '<ellipse cx="0" cy="30" rx="58" ry="6" fill="#000" opacity=".1"/>' +
      `<path d="M-54 26q-6-50 54-52q60 2 54 52z" fill="${f.a}" stroke="${f.s}" stroke-width="2.4"/>` +
      `<path d="M-30 4l14-16M-6 0l14-18M18 4l14-14" fill="none" stroke="${f.l}" stroke-width="6" stroke-linecap="round"/>` +
      `<path d="M-30 4l14-16M-6 0l14-18M18 4l14-14" fill="none" stroke="${f.s}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>` +
      `<ellipse cx="-20" cy="-16" rx="14" ry="5" fill="${f.l}" opacity=".55"/>`;
  }
  function teigSvg() {
    const f = TEIG.roh;
    return svgVon('<ellipse cx="0" cy="34" rx="70" ry="8" fill="#000" opacity=".1"/>' +
      `<path d="M-72 30q-6-52 72-54q78 2 72 54q-2 6-72 6t-72-6z" fill="${f.a}" stroke="${f.s}" stroke-width="3"/>` +
      `<ellipse cx="-26" cy="-8" rx="22" ry="9" fill="${f.l}" opacity=".8"/>` +
      `<path d="M-30 14q14 8 30 0M8 22q14 6 28-2" fill="none" stroke="${f.s}" stroke-width="2" stroke-linecap="round" opacity=".6"/>` +
      '<circle cx="34" cy="-4" r="2" fill="#fff"/><circle cx="-44" cy="16" r="1.6" fill="#fff"/><circle cx="10" cy="-14" r="1.8" fill="#fff"/>',
    "-80 -30 160 76", "bsp-bild");
  }
  function ofenSvg({ glut = false, inhalt = "", gebacken = false, licht = false } = {}) {
    const innen = inhalt ? `<g transform="translate(100 150) scale(0.78)">${formSvg(inhalt, gebacken)}</g>` : "";
    return svgVon(
      '<defs><radialGradient id="bsp-glut" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#ffd27a"/><stop offset=".6" stop-color="#ff9a3c"/><stop offset="1" stop-color="#c8501e"/></radialGradient></defs>' +
      '<rect x="6" y="10" width="188" height="232" rx="22" fill="#d4dbe3" stroke="#8f9aa7" stroke-width="4"/>' +
      '<path d="M6 32a22 22 0 0 1 22-22h144a22 22 0 0 1 22 22v28h-188z" fill="#4a5568"/>' +
      '<circle cx="38" cy="36" r="11" fill="#e2e8f0"/><path d="M38 28v8" stroke="#4a5568" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="76" cy="36" r="11" fill="#e2e8f0"/><path d="M76 36l6-5" stroke="#4a5568" stroke-width="3" stroke-linecap="round"/>' +
      `<circle cx="160" cy="36" r="8" fill="${licht ? "#ff6b4a" : "#718096"}"/>` +
      '<rect x="22" y="76" width="156" height="150" rx="16" fill="#b4bfca" stroke="#8f9aa7" stroke-width="3"/>' +
      `<rect x="38" y="92" width="124" height="100" rx="12" fill="${glut ? "url(#bsp-glut)" : "#2d3748"}"/>` +
      '<path d="M44 170h112" stroke="#718096" stroke-width="3" opacity=".8"/>' +
      innen +
      '<path d="M46 100l18-6M46 112l10-4" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".25"/>' +
      '<rect x="52" y="202" width="96" height="11" rx="5.5" fill="#718096"/>',
      "0 0 200 250", "bsp-bild");
  }

  // Bluete in -30 -30 60 60
  function bluete(hex, r = 26) {
    const rand = hex === "#ffffff" ? "#c3ccd8" : dunkler(hex, 0.2);
    let s = "";
    for (let i = 0; i < 6; i += 1) s += `<ellipse cx="0" cy="${r1(-r * 0.56)}" rx="${r1(r * 0.36)}" ry="${r1(r * 0.52)}" transform="rotate(${i * 60})" fill="${hex}" stroke="${rand}" stroke-width="1.6"/>`;
    return s + `<circle r="${r1(r * 0.3)}" fill="${hex === "#ffd23f" ? "#f08a24" : "#ffd23f"}" stroke="#d99a00" stroke-width="1.2"/>`;
  }
  function blumeSvg(hex) {
    return svgVon(`<path d="M0 14v40" stroke="#4f9d55" stroke-width="5" stroke-linecap="round"/><path d="M0 40q12-12 20-8q-8 12-20 12z" fill="#6cc070"/>${bluete(hex)}`, "-30 -30 60 86", "bsp-bild");
  }
  function eimerSvg(hex) {
    const k = [[-26, -112, 0.82], [26, -116, 0.82], [-4, -146, 0.9], [8, -84, 0.84]];
    let s = "";
    k.forEach(([x, y]) => { s += `<path d="M${x} ${y}Q${r1(x * 0.4)} ${-60} 0 -44" fill="none" stroke="#4f9d55" stroke-width="4" stroke-linecap="round"/>`; });
    s += '<path d="M-6 -70q-14-10-18-2q8 8 18 6zM6 -64q14-12 18-4q-8 8-18 8z" fill="#6cc070"/>';
    k.forEach(([x, y, sk]) => { s += `<g transform="translate(${x} ${y}) scale(${sk})">${bluete(hex)}</g>`; });
    s += '<path d="M-38 -46h76l-9 46h-58z" fill="#b8c4cf" stroke="#8795a3" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<rect x="-41" y="-50" width="82" height="9" rx="4.5" fill="#d5dde5" stroke="#8795a3" stroke-width="2.5"/>' +
      '<path d="M-30 -30h60M-27 -16h54" stroke="#9aa7b4" stroke-width="2" opacity=".7"/>';
    return svgVon(s, "-50 -174 100 178", "bsp-bild");
  }

  function schluesselSvg(n) {
    return svgVon(
      '<circle cx="50" cy="10" r="7" fill="#c9a227" stroke="#8a6d12" stroke-width="2"/>' +
      '<path d="M50 14v14" stroke="#8a6d12" stroke-width="2.5"/>' +
      '<rect x="12" y="26" width="76" height="62" rx="16" fill="#fffaf0" stroke="#d9b56b" stroke-width="3"/>' +
      `<text x="50" y="72" text-anchor="middle" font-size="42" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#243047">${n}</text>` +
      '<path d="M50 88v8" stroke="#8a6d12" stroke-width="2.5"/>' +
      '<circle cx="50" cy="114" r="17" fill="#f2c14e" stroke="#b8860b" stroke-width="3"/><circle cx="50" cy="114" r="7" fill="#fdf3e7" stroke="#b8860b" stroke-width="2"/>' +
      '<rect x="45" y="128" width="10" height="50" rx="3" fill="#f2c14e" stroke="#b8860b" stroke-width="2.5"/>' +
      '<path d="M55 152h12v8h-12M55 166h9v8h-9" fill="#f2c14e" stroke="#b8860b" stroke-width="2.5" stroke-linejoin="round"/>',
      "0 0 100 186", "bsp-bild");
  }
  function muenzeSvg(wert) {
    return svgVon(
      '<circle r="47" fill="#d7dce2" stroke="#9aa3ae" stroke-width="3"/>' +
      '<circle r="43" fill="none" stroke="#b5bcc6" stroke-width="3" stroke-dasharray="2 3"/>' +
      '<circle r="36" fill="#e6eaef" stroke="#bfc6cf" stroke-width="2"/>' +
      '<path d="M-24 -24a34 34 0 0 1 30-10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>' +
      `<text x="0" y="14" text-anchor="middle" font-size="40" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#4a5568">${wert}</text>` +
      `<text x="0" y="31" text-anchor="middle" font-size="13" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#6b7280">Fr.</text>`,
      "-50 -50 100 100", "bsp-bild");
  }
  // Der Korb; was drin ist, schaut über den Rand (ids aus bau-moebel*.js).
  function korbSvg(drin = []) {
    const M = window.LernappBauMoebel;
    const schritt = 52;
    const waren = drin.map((id, i) => {
      const d = M?.DINGE?.[id];
      const markup = d ? M.zeichne(id) : "";
      if (!markup) return "";
      const x = 100 - ((drin.length - 1) * schritt) / 2 + i * schritt - 32;
      return `<svg x="${r1(x)}" y="4" width="64" height="62" viewBox="${r1(-d.w / 2 - 3)} ${r1(-d.h - 3)} ${d.w + 6} ${d.h + 6}" preserveAspectRatio="xMidYMax meet" overflow="visible">${markup}</svg>`;
    }).join("");
    return svgVon(
      '<path d="M40 40q60-70 120 0" fill="none" stroke="#a0662f" stroke-width="10" stroke-linecap="round"/>' + waren +
      '<path d="M8 50h184l-18 82a12 12 0 0 1-12 10h-124a12 12 0 0 1-12-10z" fill="#d9a066" stroke="#a0662f" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M16 76h168M22 102h156M28 126h144" stroke="#b97c41" stroke-width="4" opacity=".75"/>' +
      '<path d="M60 52l-8 88M100 52v88M140 52l8 88" stroke="#b97c41" stroke-width="4" opacity=".75"/>' +
      '<rect x="2" y="44" width="196" height="14" rx="7" fill="#c98a4f" stroke="#a0662f" stroke-width="4"/>',
      "0 0 200 146", "bsp-bild");
  }
  function scherenSvg() {
    return svgVon(
      '<path d="M50 50L86 10" stroke="#9aa5b1" stroke-width="9" stroke-linecap="round"/><path d="M50 50L86 10" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M50 50L90 46" stroke="#9aa5b1" stroke-width="9" stroke-linecap="round"/><path d="M50 50L90 46" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="34" cy="66" r="14" fill="none" stroke="#e8505b" stroke-width="8"/><circle cx="26" cy="40" r="14" fill="none" stroke="#e8505b" stroke-width="8"/>' +
      '<circle cx="50" cy="50" r="4" fill="#4a5568"/>',
      "0 0 100 100", "bsp-bild");
  }
  function sternSvg(fill = "#ffc93c") {
    return svgVon(`<path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" fill="${fill}" stroke="#e0a100" stroke-width="1.2" stroke-linejoin="round"/>`, "0 0 24 24", "bsp-bild");
  }
  function pflasterSvg() {
    return svgVon(
      '<rect x="2" y="2" width="116" height="40" rx="20" fill="#f4c095" stroke="#d9996a" stroke-width="2.5"/>' +
      '<rect x="40" y="6" width="40" height="32" rx="7" fill="#fdebd8" stroke="#e6b48a" stroke-width="1.5"/>' +
      '<g fill="#d9996a"><circle cx="16" cy="15" r="1.8"/><circle cx="26" cy="22" r="1.8"/><circle cx="16" cy="29" r="1.8"/><circle cx="94" cy="15" r="1.8"/><circle cx="104" cy="22" r="1.8"/><circle cx="94" cy="29" r="1.8"/></g>',
      "0 0 120 44", "bsp-bild");
  }
  function kratzerSvg() {
    return svgVon('<g stroke="#e53e3e" stroke-width="4.5" stroke-linecap="round"><path d="M10 14l26-6"/><path d="M8 24l30-7"/><path d="M12 33l22-5"/></g>', "0 0 46 40", "bsp-bild");
  }
  function eSvg(richtung) {
    const grad = { rechts: 0, unten: 90, links: 180, oben: 270 }[richtung] || 0;
    return svgVon(`<path d="M0 0H5V1H1V2H5V3H1V4H5V5H0Z" transform="rotate(${grad} 2.5 2.5)" fill="#1a202c"/>`, "0 0 5 5", "bsp-bild");
  }
  function pfeilSvg(richtung) {
    const grad = { rechts: 0, unten: 90, links: 180, oben: 270 }[richtung] || 0;
    return svgVon(`<g transform="rotate(${grad} 50 50)"><path d="M20 50H72M54 30l20 20-20 20" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></g>`, "0 0 100 100", "bsp-bild");
  }
  function maschenSvg(hex) {
    const d = dunkler(hex, 0.25);
    return `<path d="M0 0L-22 -13Q-27 0 -22 13Z" fill="${hex}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M0 0L22 -13Q27 0 22 13Z" fill="${hex}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>` +
      `<circle r="6" fill="${d}"/>`;
  }

  // ---------------------------------------------------------------------------
  // Die Spiele. Jedes bekommt ctx (siehe starte) und gibt { start, render }
  // zurück: start beginnt eine Runde, render zeichnet den Stand neu (auch,
  // wenn das Handy sich dreht und die Fläche wechselt).
  // ---------------------------------------------------------------------------

  // --- 1. Bäckerei: Brot backen ---------------------------------------------
  function spielBrot(ctx) {
    const FORMEN = [
      { id: "zopf", name: "Zopf" },
      { id: "gipfeli", name: "Gipfeli" },
      { id: "brot", name: "Brot" },
    ];
    let z = null;
    const L = () => (ctx.modus === "breit"
      ? { karte: { w: 236, h: 270, gap: 40, y: 18 }, brett: [40, 214, 440, 66], teig: [90, 40, 340, 190], punkte: [120, 262, 280, 40], ofen: [610, 6, 250, 270], uhr: [618, 282, 234, 20] }
      : { karte: { w: 260, h: 320, gap: 46, y: 150 }, brett: [40, 420, 480, 110], teig: [80, 150, 400, 290], punkte: [130, 548, 300, 50], ofen: [590, 50, 340, 440], uhr: [600, 510, 320, 30] });

    function start() {
      z = { phase: "form", form: "", knet: 0 };
      ctx.punkte(0, 0);
      render();
      ctx.auftrag(T.brot.was);
    }
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      if (z.phase === "form") {
        const x0 = (ctx.W - (3 * l.karte.w + 2 * l.karte.gap)) / 2;
        FORMEN.forEach((f, i) => {
          const b = knopf("bsp-wahlkarte", f.name, `${svgVon(formSvg(f.id, true), "-64 -44 128 88", "bsp-bild")}<span>${f.name}</span>`, () => waehle(f));
          b.dataset.form = f.id;
          S.append(platz(b, x0 + i * (l.karte.w + l.karte.gap), l.karte.y, l.karte.w, l.karte.h));
        });
        return;
      }
      S.append(platz(el("div", "bsp-brett"), ...l.brett));
      // Der Teig, das Blech oder das fertige Brot
      const teig = knopf("bsp-teig", "Teig", "", tippeTeig);
      if (z.phase === "kneten") teig.innerHTML = teigSvg();
      else if (z.phase === "ofen") teig.innerHTML = svgVon(`<rect x="-78" y="18" width="156" height="14" rx="5" fill="#5a6472"/><rect x="-74" y="14" width="148" height="8" rx="4" fill="#8794a3"/><g transform="translate(0 -6) scale(0.95)">${formSvg(z.form, false)}</g>`, "-80 -40 160 76", "bsp-bild");
      else if (z.phase === "fertig") teig.innerHTML = svgVon(`<g class="bsp-dampf" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M-24 -44q-6-8 0-16t0-16"/><path d="M0 -50q-6-8 0-16t0-16"/><path d="M24 -44q-6-8 0-16t0-16"/></g><g transform="translate(0 -4) scale(1.05)">${formSvg(z.form, true)}</g>`, "-80 -84 160 120", "bsp-bild");
      else teig.classList.add("is-leer");
      teig.disabled = !["kneten", "ofen"].includes(z.phase);
      S.append(platz(teig, ...l.teig));
      // Zählpunkte beim Kneten
      if (z.phase === "kneten") {
        const p = el("div", "bsp-zaehler");
        for (let i = 0; i < 5; i += 1) p.append(el("span", i < z.knet ? "is-voll" : ""));
        S.append(platz(p, ...l.punkte));
      }
      // Der Ofen
      const glut = z.phase === "backen" || z.phase === "raus";
      const ofen = knopf(`bsp-ofen${glut ? " is-an" : ""}${z.phase === "raus" ? " is-bereit" : ""}`, "Ofen",
        ofenSvg({ glut, licht: z.phase === "backen", inhalt: glut ? z.form : "", gebacken: z.phase === "raus" }), tippeOfen);
      S.append(platz(ofen, ...l.ofen));
      const uhr = el("div", `bsp-uhr${z.phase === "raus" ? " is-voll" : ""}`, { html: "<i></i>" });
      if (!["backen", "raus"].includes(z.phase)) uhr.classList.add("is-aus");
      S.append(platz(uhr, ...l.uhr));
    }
    function waehle(f) {
      if (!ctx.darf() || z.phase !== "form") return;
      z.form = f.id;
      z.phase = "kneten";
      ctx.klang("correct");
      render();
      ctx.auftrag(T.brot.kneten, T.brot.form[f.id]);
    }
    const teigKnopf = () => ctx.szene.querySelector(".bsp-teig");
    function tippeTeig() {
      if (!ctx.darf()) return;
      if (z.phase === "kneten") {
        z.knet += 1;
        const svg = ctx.szene.querySelector(".bsp-teig .bsp-bild");
        anstossen(svg, "is-knet");
        ctx.szene.querySelectorAll(".bsp-zaehler span").forEach((s, i) => s.classList.toggle("is-voll", i < z.knet));
        ctx.sag(ZAHLWORT[z.knet]);
        if (z.knet >= 5) {
          z.phase = "geformt";
          teigKnopf()?.setAttribute("disabled", "");
          ctx.nach(650, () => {
            z.phase = "ofen";
            ctx.klang("correct");
            render();
            anstossen(ctx.szene.querySelector(".bsp-teig"), "bsp-plopp");
            ctx.auftrag(T.brot.ofen, T.brot.ofenJetzt);
          });
        }
        return;
      }
      if (z.phase === "ofen") einschieben();
    }
    function tippeOfen() {
      if (!ctx.darf()) return;
      if (z.phase === "kneten") { ctx.falsch(T.brot.zuerst, ctx.szene.querySelector(".bsp-ofen")); return; }
      if (z.phase === "ofen") { einschieben(); return; }
      if (z.phase === "backen") { ctx.sag(T.brot.moment); return; }
      if (z.phase === "raus") herausnehmen();
    }
    async function einschieben() {
      z.phase = "rein";
      const l = L();
      const teig = ctx.szene.querySelector(".bsp-teig");
      const von = ctx.rechteck(teig);
      teig.style.visibility = "hidden";
      const [ox, oy, ow, oh] = l.ofen;
      await fliege(ctx, teig.innerHTML, von, { x: ox + ow * 0.2, y: oy + oh * 0.38, w: ow * 0.6, h: oh * 0.36 }, { dauer: 520 });
      if (!ctx.lebt()) return;
      z.phase = "backen";
      render();
      ctx.sag(T.brot.backt);
      ctx.zeigeAuftrag(T.brot.backt);
      const i = ctx.szene.querySelector(".bsp-uhr i");
      requestAnimationFrame(() => requestAnimationFrame(() => i?.classList.add("is-laeuft")));
      ctx.nach(3000, () => {
        z.phase = "raus";
        render();
        ctx.klang("unlock");
        anstossen(ctx.szene.querySelector(".bsp-ofen"), "bsp-plopp");
        ctx.auftrag(T.brot.raus, T.brot.ding);
      });
    }
    async function herausnehmen() {
      z.phase = "holen";
      const l = L();
      const [ox, oy, ow, oh] = l.ofen;
      const ziel = ctx.rechteck(ctx.szene.querySelector(".bsp-teig"));
      await fliege(ctx, svgVon(formSvg(z.form, true), "-64 -44 128 88", "bsp-bild"), { x: ox + ow * 0.22, y: oy + oh * 0.42, w: ow * 0.56, h: oh * 0.3 }, ziel, { dauer: 520 });
      if (!ctx.lebt()) return;
      z.phase = "fertig";
      render();
      anstossen(ctx.szene.querySelector(".bsp-teig"), "bsp-plopp");
      ctx.geschafft(T.brot.fertig);
    }
    return { start, render };
  }

  // --- 2. Coiffeur: Haare schneiden -------------------------------------------
  function spielHaare(ctx) {
    const MASCHEN = [
      { id: "rot", hex: "#e63946" },
      { id: "blau", hex: "#3a86ff" },
      { id: "gelb", hex: "#ffd23f" },
      { id: "rosa", hex: "#ff8fc7" },
    ];
    const HAAR = "#f2b53a";
    const HAAR_D = "#a8691c";
    let z = null;
    let info = null;
    const L = () => (ctx.modus === "breit"
      ? { kunde: [230, 0, 400, 310], seite: [670, 14, 310, 282], masche: 128, mGap: 14 }
      : { kunde: [40, 6, 580, 608], seite: [650, 90, 320, 440], masche: 146, mGap: 20 });
    // Die Strähnen: drei links, drei rechts, je vom Scheitel hinunter
    // In eigenen Massen: der Scheitel bei (0, -86) wie bei fast allen Tieren;
    // frisur() setzt sie auf den Kopf der Figur.
    function straehnen() {
      const ko = -86;
      return [0, 1, 2, 3, 4, 5].map((i) => {
        const s = i < 3 ? -1 : 1;
        const j = i % 3;
        const sx = s * (4 + j * 8);
        const sy = ko + 1 + j * 4;
        const ex = s * (31 + j * 7);
        const ey = ko + 50 + j * 9;
        return {
          lang: `M${sx} ${sy}C${sx + s * 22} ${sy - 6} ${ex + s * 8} ${ey - 40} ${ex} ${ey}q${-s * 3} 7 ${s * 2} 12`,
          kurz: `M${sx} ${sy}q${s * 9} -3 ${s * 13} 9`,
        };
      });
    }
    function start() {
      info = figurZeichnung(ctx.figur);
      z = { phase: "schneiden", ab: [false, false, false, false, false, false], masche: "" };
      ctx.punkte(0, 6);
      render();
      ctx.auftrag(T.haare.schneiden, "", `${T.haare.schneiden} ${T.haare.wie}`);
    }
    function frisur() {
      const k = info.kopf;
      return `translate(${k.dx} ${k.dy}) translate(0 -86) scale(${k.s || 1}) translate(0 86)`;
    }
    function kundeMarkup() {
      const ko = -86;
      const st = straehnen();
      const masche = MASCHEN.find((m) => m.id === z.masche);
      let s = "";
      // Umhang (bis über die Knie) mit Kragen
      const hals = info.mensch ? info.box.y0 * 0.6 : -46;
      s += `<g transform="scale(1 ${r1(hals / -46)})">` +
        '<path d="M-15 -46q15 6 30 0q14 18 15 36q-30 8-60 0q1-18 15-36z" fill="#ffffff" stroke="#c9d3de" stroke-width="1.8" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
        '<path d="M-8 -40l-8 30M0 -40v32M8 -40l8 30" stroke="#a9d1ff" stroke-width="2.6" opacity=".8" vector-effect="non-scaling-stroke"/>' +
        '<path d="M-15 -46q15 7 30 0" fill="none" stroke="#8b5cf6" stroke-width="3.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></g>';
      // Haaransatz über dem Kopf, dann die Strähnen
      s += `<g class="bsp-frisur" transform="${frisur()}">`;
      s += `<path d="M-22 ${ko + 9}q2-17 22-18q20 1 22 18q-10-7-22-6q-12-1-22 6z" fill="${HAAR}" stroke="${HAAR_D}" stroke-width="2" stroke-linejoin="round"/>`;
      st.forEach((p, i) => {
        const d = z.ab[i] ? p.kurz : p.lang;
        s += `<g class="bsp-straehne${z.ab[i] ? " is-ab" : ""}" data-i="${i}"><path d="${d}" fill="none" stroke="${HAAR_D}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${HAAR}" stroke-width="6" stroke-linecap="round"/>` +
          `${z.ab[i] ? "" : `<path class="bsp-treffer" data-i="${i}" d="${p.lang}" fill="none" stroke="transparent" stroke-width="20" stroke-linecap="round"/>`}</g>`;
      });
      if (masche) s += `<g class="bsp-masche" transform="translate(12 ${ko - 1}) rotate(-14) scale(0.62)">${maschenSvg(masche.hex)}</g>`;
      return `${s}</g>`;
    }
    function vb() {
      const b = info.box;
      const oben = Math.min(b.y0, -86 + info.kopf.dy - 22) - 6;
      return [-55 + info.kopf.dx * 0.5, oben, 110, -oben + 6];
    }
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      const v = vb();
      const kunde = el("div", "bsp-kunde", { html: svgVon(`<g class="bsp-figur">${info.svg}</g>${kundeMarkup()}`, v.join(" "), "bsp-bild", 'preserveAspectRatio="xMidYMax meet"') });
      platz(kunde, ...l.kunde);
      S.append(kunde);
      if (z.phase === "spiegel" || z.phase === "fertig") {
        const r = rahmen(l.kunde, v);
        const a = r.ab(v[0] + 6, v[1] - 2);
        const b = r.ab(v[0] + v[2] - 6, v[1] + v[3] + 2);
        const oben = Math.max(4, a.y - 8);
        const unten = Math.min(ctx.H - 4, b.y - 4);
        S.append(platz(el("div", `bsp-spiegel${z.phase === "fertig" ? " is-fertig" : ""}`), a.x - 18, oben, b.x - a.x + 36, unten - oben));
      }
      const seite = el("div", "bsp-seite");
      platz(seite, ...l.seite);
      if (z.phase === "schneiden") {
        seite.classList.add("is-schere");
        seite.innerHTML = `<div class="bsp-schere-gross">${scherenSvg()}</div><div class="bsp-zaehler">${z.ab.map((a) => `<span class="${a ? "is-voll" : ""}"></span>`).join("")}</div>`;
      } else {
        seite.classList.add("is-maschen");
        const raster = el("div", "bsp-maschen");
        MASCHEN.forEach((m) => {
          const b = knopf(`bsp-masche-knopf${z.masche === m.id ? " is-aktiv" : ""}`, T.haare.maschen[m.id].replace("!", ""), svgVon(maschenSvg(m.hex), "-30 -20 60 40", "bsp-bild"), () => waehleMasche(m));
          b.dataset.farbe = m.id;
          b.style.width = `${l.masche}px`;
          b.style.height = `${l.masche}px`;
          b.disabled = z.phase !== "masche";
          raster.append(b);
        });
        raster.style.gap = `${l.mGap}px`;
        seite.append(raster);
      }
      S.append(seite);
      kundeEreignisse(kunde);
      const zeiger = el("div", "bsp-schere-zeiger", { html: scherenSvg() });
      zeiger.hidden = true;
      S.append(zeiger);
    }
    function kundeEreignisse(kunde) {
      let unten = null;
      const zeiger = () => ctx.szene.querySelector(".bsp-schere-zeiger");
      const zeige = (e) => {
        const p = ctx.punkt(e);
        const zg = zeiger();
        if (!zg) return;
        zg.hidden = false;
        zg.style.transform = `translate(${r1(p.x - 10)}px, ${r1(p.y - 70)}px)`;
      };
      const trifft = (e) => {
        let t = e.target?.closest?.(".bsp-treffer");
        if (!t || !kunde.contains(t)) {
          const hier = document.elementFromPoint(e.clientX, e.clientY);
          t = hier?.closest?.(".bsp-treffer") || null;
        }
        if (t && kunde.contains(t)) schneide(Number(t.dataset.i));
        return Boolean(t);
      };
      kunde.addEventListener("pointerdown", (e) => {
        if ((e.button || 0) > 0 || !ctx.darf() || z.phase !== "schneiden") return;
        e.preventDefault();
        try { kunde.setPointerCapture(e.pointerId); } catch { /* alt */ }
        unten = { id: e.pointerId, p: ctx.punkt(e), geschnitten: trifft(e), weit: false };
        zeige(e);
      });
      kunde.addEventListener("pointermove", (e) => {
        if (!unten || e.pointerId !== unten.id) return;
        const p = ctx.punkt(e);
        if (Math.hypot(p.x - unten.p.x, p.y - unten.p.y) > 12) unten.weit = true;
        zeige(e);
        if (z.phase === "schneiden" && trifft(e)) unten.geschnitten = true;
      });
      const los = (e) => {
        if (!unten || e.pointerId !== unten.id) return;
        const war = unten;
        unten = null;
        const zg = zeiger();
        if (zg) zg.hidden = true;
        if (e.type === "pointerup" && !war.geschnitten && !war.weit && z.phase === "schneiden") ctx.falsch(T.haare.nurHaare);
      };
      kunde.addEventListener("pointerup", los);
      kunde.addEventListener("pointercancel", los);
    }
    function schneide(i) {
      if (!Number.isInteger(i) || z.ab[i] || z.phase !== "schneiden") return;
      const g = ctx.szene.querySelector(`.bsp-straehne[data-i="${i}"]`);
      // Das abgeschnittene Stück fällt hinunter.
      if (g && !reduced()) {
        const r = ctx.rechteck(g);
        const pfad = g.querySelector("path");
        try {
          const bb = pfad.getBBox();
          const stueck = el("div", "bsp-fall", { html: svgVon(`<path d="${straehnen()[i].lang}" fill="none" stroke="${HAAR}" stroke-width="6" stroke-linecap="round"/>`, `${r1(bb.x - 5)} ${r1(bb.y - 5)} ${r1(bb.width + 10)} ${r1(bb.height + 10)}`, "bsp-bild") });
          platz(stueck, r.x - 4, r.y - 4, r.w + 8, r.h + 8);
          ctx.szene.append(stueck);
          ctx.nach(950, () => stueck.remove());
        } catch { /* ohne Fallen */ }
      }
      z.ab[i] = true;
      const st = straehnen()[i];
      if (g) {
        g.classList.add("is-ab");
        g.querySelectorAll("path").forEach((p) => { if (p.classList.contains("bsp-treffer")) p.remove(); else p.setAttribute("d", st.kurz); });
      }
      const n = z.ab.filter(Boolean).length;
      ctx.punkte(n, 6);
      ctx.szene.querySelectorAll(".bsp-seite .bsp-zaehler span").forEach((s, k) => s.classList.toggle("is-voll", k < n));
      spieleTon(1900, 0.08, 0.06);
      ctx.sag(T.haare.schnipp);
      if (n >= 6) {
        z.phase = "fertigGeschnitten";
        ctx.nach(700, () => {
          z.phase = "masche";
          render();
          ctx.klang("correct");
          ctx.auftrag(T.haare.masche, T.haare.super);
        });
      }
    }
    function waehleMasche(m) {
      if (!ctx.darf() || z.phase !== "masche") return;
      z.masche = m.id;
      z.phase = "gewaehlt";
      render();
      ctx.sag(T.haare.maschen[m.id]);
      ctx.nach(1300, () => {
        z.phase = "spiegel";
        render();
        ctx.nach(400, () => {
          z.phase = "fertig";
          render();
          ctx.geschafft(`${T.haare.spiegel} ${T.haare.schick}`, T.haare.schick);
        });
      });
    }
    return { start, render };
  }

  // --- 3. Radiologie: das Röntgenbild -----------------------------------------
  function spielRoentgen(ctx) {
    // Knochen als Strecken (x1 y1 x2 y2, Dicke d, kann brechen b) in 0 0 400 200.
    const BILDER = {
      arm: {
        name: "ARM",
        weich: [[10, 100, 176, 100, 100], [186, 100, 306, 100, 92], [322, 100, 384, 98, 86]],
        knochen: [
          { p: [20, 100, 170, 100], d: 34, b: true },
          { p: [192, 80, 302, 76], d: 22, b: true },
          { p: [192, 120, 302, 124], d: 22, b: true },
          { p: [336, 70, 384, 58], d: 12 }, { p: [338, 90, 394, 86], d: 12 }, { p: [338, 110, 392, 114], d: 12 }, { p: [336, 130, 380, 142], d: 12 },
        ],
        klein: [[316, 86, 9], [316, 112, 9], [328, 99, 8]],
      },
      bein: {
        name: "BEIN",
        weich: [[10, 98, 184, 100, 112], [196, 104, 330, 106, 92], [342, 104, 372, 56, 64]],
        knochen: [
          { p: [20, 96, 174, 100], d: 40, b: true },
          { p: [202, 96, 330, 98], d: 30, b: true },
          { p: [206, 132, 326, 130], d: 16, b: true },
          { p: [348, 98, 362, 50], d: 13 }, { p: [360, 106, 384, 62], d: 12 }, { p: [368, 116, 396, 82], d: 11 },
        ],
        klein: [[188, 74, 12], [342, 120, 10]],
      },
      pfote: {
        name: "PFOTE",
        weich: [[8, 100, 70, 100, 92], [90, 100, 236, 100, 144], [236, 44, 300, 34, 40], [236, 80, 306, 76, 40], [236, 120, 306, 124, 40], [236, 156, 300, 166, 40]],
        knochen: [
          { p: [6, 86, 56, 90], d: 15 }, { p: [6, 114, 56, 110], d: 15 },
          { p: [96, 66, 226, 46], d: 20, b: true },
          { p: [98, 88, 232, 82], d: 20, b: true },
          { p: [98, 112, 232, 118], d: 20, b: true },
          { p: [96, 134, 226, 154], d: 20, b: true },
          { p: [242, 44, 298, 34], d: 14 }, { p: [246, 80, 306, 76], d: 14 }, { p: [246, 120, 306, 124], d: 14 }, { p: [242, 156, 298, 166], d: 14 },
        ],
        klein: [[74, 84, 10], [74, 106, 10], [80, 126, 9], [84, 64, 8]],
      },
    };
    let z = null;
    const L = () => (ctx.modus === "breit"
      ? { tafel: [10, 6, 650, 298], patient: [690, 34, 290, 272] }
      : { tafel: [16, 70, 750, 470], patient: [790, 170, 190, 380] });

    function start() {
      z = { reihe: mischen(Object.keys(BILDER)), i: 0, bruch: -1, t: 0.5, phase: "suchen" };
      neueRunde(true);
    }
    function neueRunde(erste) {
      const bild = BILDER[z.reihe[z.i]];
      const kandidaten = bild.knochen.map((k, i) => (k.b ? i : -1)).filter((i) => i >= 0);
      z.bruch = kandidaten[zufall(kandidaten.length)];
      z.t = 0.36 + Math.random() * 0.28;
      z.phase = "suchen";
      ctx.punkte(z.i, 3);
      render();
      ctx.auftrag(T.roe.wo, `${erste ? `${T.roe.schau} ` : ""}${T.roe.typ[z.reihe[z.i]]}`);
    }
    function knochenMarkup(k, i) {
      const [x1, y1, x2, y2] = k.p;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const grad = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      const d = k.d;
      const kn = d * 0.5;
      const kr = d * 0.38;
      const form = `<rect x="${r1(kn * 0.4)}" y="${r1(-d * 0.28)}" width="${r1(len - kn * 0.8)}" height="${r1(d * 0.56)}" rx="${r1(d * 0.2)}"/>` +
        `<circle cx="${r1(kn * 0.5)}" cy="${r1(-d * 0.26)}" r="${r1(kr)}"/><circle cx="${r1(kn * 0.5)}" cy="${r1(d * 0.26)}" r="${r1(kr)}"/>` +
        `<circle cx="${r1(len - kn * 0.5)}" cy="${r1(-d * 0.26)}" r="${r1(kr)}"/><circle cx="${r1(len - kn * 0.5)}" cy="${r1(d * 0.26)}" r="${r1(kr)}"/>`;
      let s = `<g class="bsp-knochen" data-i="${i}"${i === z.bruch ? ' data-bruch="1"' : ""} transform="translate(${x1} ${y1}) rotate(${r1(grad)})">` +
        `<g fill="#ffffff" opacity=".16" stroke="#ffffff" stroke-width="6">${form}</g>` +
        `<g fill="#e4eefc" stroke="#b9cff0" stroke-width="1.4">${form}</g>` +
        `<rect x="${r1(kn)}" y="${r1(-d * 0.08)}" width="${r1(Math.max(0, len - kn * 2))}" height="${r1(d * 0.12)}" rx="${r1(d * 0.06)}" fill="#c4d6f2" opacity=".6"/>`;
      if (i === z.bruch) {
        const x = len * z.t;
        const h = d * 0.5 + 4;
        const riss = `M${r1(x - 3)} ${r1(-h)}L${r1(x + 4)} ${r1(-h * 0.4)}L${r1(x - 4)} ${r1(h * 0.15)}L${r1(x + 4)} ${r1(h * 0.6)}L${r1(x)} ${r1(h)}`;
        s += `<path d="${riss}" fill="none" stroke="#0e2240" stroke-width="${d > 18 ? 4.6 : 3.6}" stroke-linejoin="round" stroke-linecap="round"/>`;
        if (z.phase !== "suchen") {
          const lang = Math.min(len * 0.66, 120);
          const a = Math.max(-4, Math.min(len - lang + 4, x - lang / 2));
          const gh = d + 18;
          let w = "";
          for (let q = a + 10; q < a + lang - 6; q += 12) w += `M${r1(q)} ${r1(-gh / 2 + 2)}l-7 ${r1(gh - 4)}`;
          s += `<g class="bsp-gips"><rect x="${r1(a)}" y="${r1(-gh / 2)}" width="${r1(lang)}" height="${r1(gh)}" rx="${r1(gh * 0.4)}" fill="#fbfaf4" stroke="#d6d3c4" stroke-width="2"/><path d="${w}" stroke="#e6e2d2" stroke-width="2.5" fill="none"/></g>`;
        }
      }
      return `${s}</g>`;
    }
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      const bild = BILDER[z.reihe[z.i]];
      let weich = "";
      bild.weich.forEach(([x1, y1, x2, y2, w]) => { weich += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#2f5b93" stroke-width="${w}" stroke-linecap="round" opacity=".55"/>`; });
      const klein = bild.klein.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#dbe7fa" stroke="#b9cff0" stroke-width="1.2"/>`).join("");
      const knochen = bild.knochen.map(knochenMarkup).join("");
      const tafel = el("div", "bsp-roentgen");
      tafel.innerHTML = `<span class="bsp-roentgen-name">${bild.name}</span>` +
        svgVon(`<g>${weich}</g><g>${klein}</g>${knochen}`, "0 14 400 172", "bsp-roentgen-bild", 'preserveAspectRatio="xMidYMid meet"');
      platz(tafel, ...l.tafel);
      S.append(tafel);
      const svg = tafel.querySelector("svg");
      svg.addEventListener("pointerdown", (e) => tippe(e, svg));
      const p = el("div", "bsp-patient", { html: figurBild(figurZeichnung(ctx.figur), 200, 260) });
      S.append(platz(p, ...l.patient));
    }
    function tippe(e, svg) {
      if (!ctx.darf() || z.phase !== "suchen") return;
      e.preventDefault();
      const m = svg.getScreenCTM?.();
      if (!m) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const q = pt.matrixTransform(m.inverse());
      const bild = BILDER[z.reihe[z.i]];
      let best = -1;
      let weit = Infinity;
      bild.knochen.forEach((k, i) => {
        const [x1, y1, x2, y2] = k.p;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const t = Math.max(0, Math.min(1, ((q.x - x1) * dx + (q.y - y1) * dy) / (dx * dx + dy * dy)));
        const a = Math.hypot(q.x - (x1 + t * dx), q.y - (y1 + t * dy)) - k.d / 2;
        if (a < weit) { weit = a; best = i; }
      });
      if (best < 0 || weit > 24) return;
      if (best === z.bruch) {
        z.phase = "gips";
        ctx.klang("correct");
        render();
        anstossen(ctx.szene.querySelector(".bsp-gips"), "bsp-gips-ein");
        ctx.sag(`${T.roe.hier} ${T.roe.gips}`);
        ctx.zeigeAuftrag(T.roe.gips);
        ctx.nach(4200, () => {
          z.i += 1;
          ctx.punkte(z.i, 3);
          if (z.i >= z.reihe.length) { z.phase = "fertig"; ctx.geschafft(T.roe.ende); return; }
          neueRunde(false);
        });
        return;
      }
      const g = svg.querySelector(`.bsp-knochen[data-i="${best}"]`);
      ctx.falsch(`${T.roe.ganz} ${T.roe.weiter}`);
      if (g && !reduced()) {
        g.classList.remove("is-falsch");
        void g.getBBox(); // neu messen, damit die Animation wieder von vorn beginnt
        g.classList.add("is-falsch");
        ctx.nach(700, () => g.classList.remove("is-falsch"));
      }
    }
    return { start, render };
  }

  // --- 4. Lebensmittelladen: Einkaufen ---------------------------------------
  const WAREN = [
    { id: "milch", wort: "Milch", ding: "milch" },
    { id: "kaese", wort: "Käse", ding: "kaese" },
    { id: "aepfel", wort: "Äpfel", ding: "aepfel" },
    { id: "rueebli", wort: "Rüebli", ding: "rueebli" },
    { id: "brot", wort: "Brot", ding: "d_brot" },
    { id: "zopf", wort: "Zopf", ding: "zopf" },
    { id: "gipfeli", wort: "Gipfeli", ding: "gipfeli" },
    { id: "honig", wort: "Honig", ding: "honig" },
    { id: "melone", wort: "Melone", ding: "melone" },
    { id: "beeren", wort: "Beeren", ding: "beeren" },
    { id: "fisch", wort: "Fisch", ding: "fisch" },
    { id: "nuesse", wort: "Nüsse", ding: "nuesse" },
    { id: "konfi", wort: "Konfitüre", ding: "h_konfi" },
    { id: "kuchen", wort: "Kuchen", ding: "kuchen" },
  ];
  function spielEinkaufen(ctx) {
    let z = null;
    const L = () => (ctx.modus === "breit"
      ? { zettel: [8, 6, 196, 298], regal: [222, 6, 476, 298], ware: [150, 132], korb: [722, 64, 266, 220],
        preis: [16, 20, 210, 120], kasseKorb: [16, 160, 210, 140], teller: [246, 12, 408, 200], summe: [246, 222, 408, 76], muenzen: [672, 40, 316, 240], mGross: [88, 96, 108], tMuenze: 62 }
      : { zettel: [16, 20, 240, 400], regal: [282, 20, 700, 400], ware: [210, 170], korb: [370, 432, 260, 180],
        preis: [40, 40, 300, 160], kasseKorb: [40, 250, 300, 220], teller: [370, 40, 590, 300], summe: [370, 360, 590, 90], muenzen: [370, 470, 590, 140], mGross: [112, 122, 136], tMuenze: 84 });

    function start() {
      const liste = mischen(WAREN).slice(0, 3);
      const andere = mischen(WAREN.filter((w) => !liste.includes(w))).slice(0, 3);
      z = { phase: "kaufen", liste, regal: mischen([...liste, ...andere]), korb: [], preis: PREIS_MIN + zufall(PREIS_MAX - PREIS_MIN + 1), muenzen: [] };
      ctx.punkte(0, 3);
      render();
      ctx.auftrag(T.kauf.zettel, "", [T.kauf.zettel, ...liste.map(satzWare)].join(" "));
    }
    const summe = () => z.muenzen.reduce((a, b) => a + b, 0);
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      if (z.phase === "kaufen" || z.phase === "fertigGekauft") renderKaufen(S, l);
      else renderZahlen(S, l);
    }
    function renderKaufen(S, l) {
      // Der Zettel
      const zettel = el("div", "bsp-zettel");
      zettel.append(el("b", "", { text: "Einkaufszettel" }));
      z.liste.forEach((w) => {
        const drin = z.korb.includes(w);
        const e = knopf(`bsp-zettel-eintrag${drin ? " is-drin" : ""}`, w.wort, `${dingSvg(w.ding)}<span>${w.wort}</span>`, () => ctx.sag(satzWare(w)));
        e.dataset.id = w.id;
        zettel.append(e);
      });
      S.append(platz(zettel, ...l.zettel));
      // Das Regal
      const regal = el("div", "bsp-regal");
      platz(regal, ...l.regal);
      S.append(regal);
      const [rx, ry, rw, rh] = l.regal;
      const [ww, wh] = l.ware;
      const spalten = 3;
      const gx = (rw - spalten * ww) / (spalten + 1);
      const gy = (rh - 2 * wh) / 3;
      z.regal.forEach((w, i) => {
        const x = rx + gx + (i % spalten) * (ww + gx);
        const y = ry + gy + Math.floor(i / spalten) * (wh + gy);
        if (i % spalten === 0) S.append(platz(el("div", "bsp-regalbrett"), rx + 8, y + wh - 6, rw - 16, 14));
        if (z.korb.includes(w)) return;
        const b = el("button", "bsp-ware", { type: "button", "aria-label": w.wort, title: w.wort, html: `${dingSvg(w.ding)}<span>${w.wort}</span>` });
        b.dataset.id = w.id;
        platz(b, x, y, ww, wh - 10);
        ziehbar(ctx, b, {
          geist: () => { const g = el("div", "bsp-ware is-geist", { html: dingSvg(w.ding) }); g._w = ww * 0.8; g._h = wh * 0.7; g.style.width = `${g._w}px`; g.style.height = `${g._h}px`; return g; },
          tipp: () => nimm(w, b, true),
          los: (p) => {
            const k = l.korb;
            if (p.x > k[0] - 30 && p.x < k[0] + k[2] + 30 && p.y > k[1] - 40 && p.y < k[1] + k[3] + 30) nimm(w, b, false);
            else if (!z.liste.includes(w)) ctx.falsch(T.kauf.nicht, b);
          },
        });
        S.append(b);
      });
      // Der Korb
      const korb = el("div", "bsp-korb");
      korb.innerHTML = korbSvg(z.korb.map((w) => w.ding));
      platz(korb, ...l.korb);
      S.append(korb);
    }
    async function nimm(w, b, fliegt) {
      if (!ctx.darf() || z.phase !== "kaufen") return;
      if (!z.liste.includes(w)) { ctx.falsch(T.kauf.nicht, b); return; }
      if (z.korb.includes(w)) return;
      z.korb.push(w);
      ctx.klang("correct");
      ctx.sag(satzWare(w));
      ctx.punkte(z.korb.length, 3);
      if (z.korb.length >= 3) z.phase = "fertigGekauft";
      if (fliegt) {
        const von = ctx.rechteck(b);
        b.style.visibility = "hidden";
        const k = L().korb;
        await fliege(ctx, dingSvg(w.ding), von, { x: k[0] + k[2] * 0.3, y: k[1] + k[3] * 0.2, w: k[2] * 0.4, h: k[3] * 0.3 });
        if (!ctx.lebt()) return;
      }
      render();
      anstossen(ctx.szene.querySelector(".bsp-korb"), "bsp-plopp");
      if (z.korb.length >= 3) {
        ctx.nach(1100, () => {
          z.phase = "zahlen";
          render();
          ctx.auftrag(`${satzPreis(z.preis)} ${T.kauf.muenzen}`, T.kauf.alles);
        });
      }
    }
    function renderZahlen(S, l) {
      const preis = el("div", "bsp-preis", { html: `<small>Preis</small><b>${z.preis} Fr.</b>` });
      preis.dataset.preis = String(z.preis);
      S.append(platz(preis, ...l.preis));
      const korb = el("div", "bsp-korb is-klein", { html: korbSvg(z.korb.map((w) => w.ding)) });
      S.append(platz(korb, ...l.kasseKorb));
      // Der Teller mit den gegebenen Münzen
      const teller = el("div", "bsp-teller");
      platz(teller, ...l.teller);
      if (!z.muenzen.length) teller.append(el("span", "bsp-teller-leer", { text: "Hier hinein bezahlen" }));
      z.muenzen.forEach((wert, i) => {
        const m = knopf("bsp-muenze", `${wert} Franken zurücknehmen`, muenzeSvg(wert), () => zurueck(i));
        m.dataset.wert = String(wert);
        m.style.width = `${l.tMuenze}px`;
        m.style.height = `${l.tMuenze}px`;
        m.disabled = z.phase !== "zahlen";
        teller.append(m);
      });
      S.append(teller);
      const s = summe();
      const sm = el("div", `bsp-summe${s > z.preis ? " is-zuviel" : s === z.preis ? " is-genau" : ""}`, { html: `Bezahlt: <b>${s} Fr.</b>` });
      S.append(platz(sm, ...l.summe));
      // Die Münzen zum Bezahlen
      const reihe = el("div", "bsp-muenzen");
      platz(reihe, ...l.muenzen);
      [1, 2, 5].forEach((wert, i) => {
        const m = knopf("bsp-muenze-knopf", `${wert} Franken`, muenzeSvg(wert), () => gib(wert, m));
        m.dataset.wert = String(wert);
        m.style.width = `${l.mGross[i]}px`;
        m.style.height = `${l.mGross[i]}px`;
        m.disabled = z.phase !== "zahlen";
        reihe.append(m);
      });
      S.append(reihe);
    }
    function pruefe() {
      const s = summe();
      if (s === z.preis) {
        z.phase = "bezahlt";
        render();
        ctx.geschafft(T.kauf.ende);
        return true;
      }
      return false;
    }
    async function gib(wert, knopfEl) {
      if (!ctx.darf() || z.phase !== "zahlen") return;
      if (summe() > z.preis) { ctx.falsch(`${T.kauf.zuViel} ${T.kauf.zurueck}`, ctx.szene.querySelector(".bsp-teller")); return; }
      const von = ctx.rechteck(knopfEl);
      z.muenzen.push(wert);
      if (pruefe()) return;
      render();
      if (summe() > z.preis) ctx.falsch(`${T.kauf.zuViel} ${T.kauf.zurueck}`, ctx.szene.querySelector(".bsp-teller"));
      else ctx.sag(satzFranken(summe()));
      // Die Münze fliegt auf den Teller.
      const alle = ctx.szene.querySelectorAll(".bsp-teller .bsp-muenze");
      const neu = alle[alle.length - 1];
      if (!neu || reduced()) return;
      neu.style.visibility = "hidden";
      await fliege(ctx, muenzeSvg(wert), von, ctx.rechteck(neu), { dauer: 320 });
      neu.style.visibility = "";
    }
    function zurueck(i) {
      if (!ctx.darf() || z.phase !== "zahlen") return;
      z.muenzen.splice(i, 1);
      if (pruefe()) return;
      render();
      if (summe() > 0) ctx.sag(satzFranken(summe()));
    }
    return { start, render };
  }

  // --- 5. Augenabteilung: Sehtest ---------------------------------------------
  function spielSehtest(ctx) {
    const RICHTUNGEN = ["oben", "rechts", "unten", "links"];
    let z = null;
    const L = () => (ctx.modus === "breit"
      ? { tafel: [150, 12, 330, 286], groessen: [220, 170, 128, 96, 70], pfeil: 92, mitte: [740, 155], figur: [80, 88] }
      : { tafel: [60, 20, 470, 580], groessen: [300, 226, 168, 120, 84], pfeil: 136, mitte: [770, 310], figur: [118, 130] });
    function start() {
      z = { runde: 0, richtung: RICHTUNGEN[zufall(4)], phase: "frage" };
      ctx.punkte(0, 5);
      render();
      ctx.auftrag(`${T.seh.frage} ${T.seh.pfeil}`);
    }
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      const tafel = el("div", "bsp-sehtafel");
      platz(tafel, ...l.tafel);
      const gr = l.groessen[Math.min(z.runde, 4)];
      const e = el("div", "bsp-e", { html: eSvg(z.richtung) });
      e.dataset.richtung = z.richtung;
      e.style.width = `${gr}px`;
      e.style.height = `${gr}px`;
      tafel.append(e);
      const reihe = el("div", "bsp-sehtafel-reihe");
      ["rechts", "oben", "links", "unten", "rechts"].forEach((r) => reihe.append(el("span", "", { html: eSvg(r) })));
      tafel.append(reihe);
      S.append(tafel);
      const [mx, my] = l.mitte;
      const p = l.pfeil;
      const ab = p * 1.08;
      const ort = { oben: [mx - p / 2, my - p / 2 - ab], unten: [mx - p / 2, my - p / 2 + ab], links: [mx - p / 2 - ab, my - p / 2], rechts: [mx - p / 2 + ab, my - p / 2] };
      RICHTUNGEN.forEach((r) => {
        const b = knopf("bsp-pfeil", T.seh.richtung[r].replace("!", ""), `${pfeilSvg(r)}<i>${eSvg(r)}</i>`, () => antwort(r, b));
        b.dataset.richtung = r;
        b.disabled = z.phase !== "frage";
        S.append(platz(b, ort[r][0], ort[r][1], p, p));
      });
      const f = el("div", "bsp-sehfigur", { html: figurBild(figurZeichnung(ctx.figur), 100, 120) });
      S.append(platz(f, mx - l.figur[0] / 2, my - l.figur[1] / 2, l.figur[0], l.figur[1]));
    }
    function antwort(r, b) {
      if (!ctx.darf() || z.phase !== "frage") return;
      if (r !== z.richtung) { ctx.falsch(T.seh.nochmal, b); return; }
      z.phase = "richtig";
      ctx.klang("correct");
      ctx.sag(T.seh.richtung[r]);
      b.classList.add("is-richtig");
      ctx.szene.querySelectorAll(".bsp-pfeil").forEach((x) => { x.disabled = true; });
      ctx.nach(1200, () => {
        z.runde += 1;
        ctx.punkte(z.runde, 5);
        if (z.runde >= 5) { z.phase = "fertig"; ctx.geschafft(T.seh.ende); return; }
        const vorher = z.richtung;
        z.richtung = mischen(RICHTUNGEN.filter((x) => x !== vorher))[0];
        z.phase = "frage";
        render();
        anstossen(ctx.szene.querySelector(".bsp-e"), "bsp-plopp");
        ctx.auftrag(z.runde === 1 ? `${T.seh.kleiner} ${T.seh.frage}` : T.seh.undJetzt, "", z.runde === 1 ? `${T.seh.kleiner} ${T.seh.frage}` : T.seh.undJetzt);
      });
    }
    return { start, render };
  }

  // --- 6. Blumenladen: Blumenstrauss ------------------------------------------
  const FARBEN = [
    { id: "rot", hex: "#e63946", adj: "rote", adjN: "roten" },
    { id: "gelb", hex: "#ffd23f", adj: "gelbe", adjN: "gelben" },
    { id: "blau", hex: "#4895ef", adj: "blaue", adjN: "blauen" },
    { id: "rosa", hex: "#ff8fc7", adj: "rosa", adjN: "rosa" },
    { id: "weiss", hex: "#ffffff", adj: "weisse", adjN: "weissen" },
    { id: "violett", hex: "#9b5de5", adj: "violette", adjN: "violetten" },
  ];
  function spielStrauss(ctx) {
    let z = null;
    const L = () => (ctx.modus === "breit"
      ? { figur: [4, 96, 96, 210], blase: [100, 8, 240, 156], fertig: [132, 210, 180, 70], strauss: [350, 4, 250, 302], blume: 62, eimer: [614, 14, 378, 290] }
      : { figur: [20, 300, 190, 300], blase: [18, 26, 334, 236], fertig: [410, 528, 220, 76], strauss: [366, 60, 310, 456], blume: 78, eimer: [694, 20, 288, 580] });
    function start() {
      const [a, b] = mischen(FARBEN).slice(0, 2);
      const andere = mischen(FARBEN.filter((f) => f !== a && f !== b)).slice(0, 2);
      z = { wunsch: [{ f: a, n: 1 + zufall(4) }, { f: b, n: 1 + zufall(4) }], eimer: mischen([a, b, ...andere]), strauss: [], phase: "binden" };
      ctx.punkte(0, 0);
      render();
      const w = z.wunsch;
      ctx.auftrag(T.blume.tippe, `${satzWunsch(w[0].n, w[0].f, true)} ${satzWunsch(w[1].n, w[1].f, false)}`);
    }
    const anzahl = (f) => z.strauss.filter((x) => x === f).length;
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      S.append(platz(el("div", "bsp-kundin", { html: figurBild(figurZeichnung(ctx.figur, "rabbit"), 110, 236) }), ...l.figur));
      const blase = el("div", "bsp-blase bsp-bestellung");
      blase.dataset.wunsch = z.wunsch.map((w) => `${w.f.id}:${w.n}`).join(",");
      z.wunsch.forEach((w) => {
        const zeile = el("div", `bsp-bestellzeile${anzahl(w.f) >= w.n ? " is-ok" : ""}`);
        zeile.append(el("b", "", { text: String(w.n) }));
        const reihe = el("span", "");
        for (let i = 0; i < w.n; i += 1) reihe.append(el("i", i < anzahl(w.f) ? "is-da" : "", { html: svgVon(bluete(w.f.hex), "-31 -31 62 62", "bsp-bild") }));
        zeile.append(reihe);
        blase.append(zeile);
      });
      S.append(platz(blase, ...l.blase));
      const fertig = knopf(`bsp-ok bsp-strauss-fertig${istFertig() ? " is-bereit" : ""}`, "Fertig", "Fertig ✓", pruefe);
      fertig.disabled = z.phase !== "binden";
      S.append(platz(fertig, ...l.fertig));
      // Der Strauss
      const [sx, sy, sw, sh] = l.strauss;
      const huelle = el("div", "bsp-huelle", { html: svgVon(`${z.strauss.map((_, i) => { const p = strauss(i, l); return `<path d="M${r1(p.x - sx)} ${r1(p.y - sy + l.blume * 0.3)}Q${r1(sw / 2 + (p.x - sx - sw / 2) * 0.3)} ${r1(sh * 0.6)} ${r1(sw / 2)} ${r1(sh * 0.86)}" stroke="#4f9d55" stroke-width="4" fill="none"/>`; }).join("")}` +
        `<path d="M${r1(sw * 0.16)} ${r1(sh * 0.56)}L${r1(sw * 0.84)} ${r1(sh * 0.56)}L${r1(sw * 0.56)} ${r1(sh * 0.99)}L${r1(sw * 0.44)} ${r1(sh * 0.99)}Z" fill="#e9c58f" stroke="#b98a4f" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M${r1(sw * 0.3)} ${r1(sh * 0.56)}L${r1(sw * 0.47)} ${r1(sh * 0.99)}M${r1(sw * 0.7)} ${r1(sh * 0.56)}L${r1(sw * 0.53)} ${r1(sh * 0.99)}" stroke="#d4ac70" stroke-width="2.5"/>` +
        `<path d="M${r1(sw * 0.42)} ${r1(sh * 0.78)}q${r1(sw * 0.08)} ${r1(sh * 0.05)} ${r1(sw * 0.16)} 0l${r1(-sw * 0.03)} ${r1(sh * 0.06)}l${r1(-sw * 0.05)} ${r1(-sh * 0.03)}l${r1(-sw * 0.05)} ${r1(sh * 0.03)}z" fill="#e63980"/>`,
      `0 0 ${sw} ${sh}`, "bsp-bild") });
      S.append(platz(huelle, ...l.strauss));
      z.strauss.forEach((f, i) => {
        const p = strauss(i, l);
        const b = knopf("bsp-strauss-blume", "Blume wegnehmen", svgVon(bluete(f.hex), "-30 -30 60 60", "bsp-bild"), () => wegnehmen(i));
        b.dataset.farbe = f.id;
        b.disabled = z.phase !== "binden";
        S.append(platz(b, p.x - l.blume / 2, p.y - l.blume / 2, l.blume, l.blume));
      });
      // Die Eimer
      const [ex, ey, ew, eh] = l.eimer;
      const breit = ctx.modus === "breit";
      const spalten = breit ? 4 : 2;
      const zeilen = breit ? 1 : 2;
      const gap = breit ? 10 : 20;
      const bw = (ew - (spalten - 1) * gap) / spalten;
      const bh = (eh - (zeilen - 1) * gap) / zeilen;
      z.eimer.forEach((f, i) => {
        const b = knopf("bsp-eimer", `${f.adj} Blumen`, eimerSvg(f.hex), () => nimm(f, b));
        b.dataset.farbe = f.id;
        b.disabled = z.phase !== "binden";
        S.append(platz(b, ex + (i % spalten) * (bw + gap), ey + Math.floor(i / spalten) * (bh + gap), bw, bh));
      });
    }
    // Wo die i-te Blume im Strauss steht: zwei Bögen über der Hülle.
    // Vorne bis vier Blumen, dahinter (höher) der Rest – beide Reihen mittig.
    function strauss(i, l) {
      const [sx, sy, sw, sh] = l.strauss;
      const n = z.strauss.length;
      const reihe = i < 4 ? 0 : 1;
      const k = i % 4;
      const inReihe = reihe ? n - 4 : Math.min(n, 4);
      const b = l.blume * 0.98;
      const versatz = k - (inReihe - 1) / 2;
      const x = sx + sw / 2 + versatz * b;
      const y = sy + sh * 0.5 - (reihe ? b * 1.02 : b * 0.18) + Math.abs(versatz) * b * 0.14;
      return { x, y };
    }
    const istFertig = () => z.wunsch.every((w) => anzahl(w.f) === w.n) && z.strauss.length === z.wunsch.reduce((a, w) => a + w.n, 0);
    function nimm(f, b) {
      if (!ctx.darf() || z.phase !== "binden") return;
      const w = z.wunsch.find((x) => x.f === f);
      if (!w) { ctx.falsch(satzKeine(f), b); return; }
      if (anzahl(f) >= w.n) { ctx.falsch(satzGenug(f), b); return; }
      z.strauss.push(f);
      render();
      const neu = ctx.szene.querySelectorAll(".bsp-strauss-blume");
      anstossen(neu[neu.length - 1], "bsp-plopp");
      if (istFertig()) {
        ctx.klang("correct");
        ctx.sag(`${ZAHLWORT[anzahl(f)]} ${T.blume.fertig}`);
        ctx.zeigeAuftrag(T.blume.fertig);
      } else ctx.sag(ZAHLWORT[anzahl(f)]);
    }
    function wegnehmen(i) {
      if (!ctx.darf() || z.phase !== "binden") return;
      z.strauss.splice(i, 1);
      render();
    }
    function pruefe() {
      if (!ctx.darf() || z.phase !== "binden") return;
      const fehlt = z.wunsch.find((w) => anzahl(w.f) < w.n);
      if (fehlt) { ctx.falsch(satzFehlen(fehlt.f), ctx.szene.querySelector(".bsp-bestellung")); return; }
      z.phase = "fertig";
      render();
      anstossen(ctx.szene.querySelector(".bsp-huelle"), "bsp-plopp");
      ctx.geschafft(T.blume.ende);
    }
    return { start, render };
  }

  // --- 7. Musikzimmer: Melodie nachspielen ------------------------------------
  function spielMelodie(ctx) {
    const TASTEN = [
      { id: "rot", hex: "#ef476f", f: 523.25 },
      { id: "gelb", hex: "#ffc43d", f: 659.25 },
      { id: "gruen", hex: "#1bbf8a", f: 783.99 },
      { id: "blau", hex: "#2f8fd8", f: 1046.5 },
    ];
    const TAKT = 680;
    let z = null;
    const L = () => (ctx.modus === "breit"
      ? { rahmen: [230, 10, 740, 292], x0: 264, w: 156, gap: 16, y: 26, h: [262, 238, 214, 190], zeichen: [20, 60, 190, 190] }
      : { rahmen: [90, 150, 820, 450], x0: 130, w: 170, gap: 22, y: 172, h: [410, 372, 334, 296], zeichen: [380, 10, 240, 130] });
    const neuerTon = (vorher = -1) => { let t; do { t = zufall(4); } while (t === vorher); return t; };
    function start() {
      const a = neuerTon();
      z = { folge: [a, neuerTon(a)], runde: 0, eingabe: 0, phase: "hoeren" };
      ctx.punkte(0, 3);
      render();
      vorspielen();
    }
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      S.append(platz(el("div", "bsp-xylo"), ...l.rahmen));
      TASTEN.forEach((t, i) => {
        const b = el("button", "bsp-taste", { type: "button", "aria-label": `Ton ${i + 1}`, title: `Ton ${i + 1}` });
        b.dataset.i = String(i);
        b.style.setProperty("--farbe", t.hex);
        b.style.setProperty("--dunkel", dunkler(t.hex, 0.22));
        b.addEventListener("pointerdown", (e) => { e.preventDefault(); druecke(i); });
        b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); druecke(i); } });
        S.append(platz(b, l.x0 + i * (l.w + l.gap), l.y + (l.h[0] - l.h[i]) / 2, l.w, l.h[i]));
      });
      const zeichen = el("div", `bsp-zeichen${z.phase === "du" ? " is-du" : ""}`, { html: z.phase === "du" ? '<span>👆</span><b>Jetzt du!</b>' : '<span>👂</span><b>Hör gut zu</b>' });
      S.append(platz(zeichen, ...l.zeichen));
    }
    function leuchte(i, ms = 420) {
      const b = ctx.szene.querySelector(`.bsp-taste[data-i="${i}"]`);
      if (!b) return;
      b.classList.add("is-an");
      ctx.nach(ms, () => b.classList.remove("is-an"));
    }
    function vorspielen() {
      z.phase = "hoeren";
      render();
      ctx.auftrag(T.mel.hoer);
      z.folge.forEach((t, k) => {
        ctx.nach(1200 + k * TAKT, () => { spieleTon(TASTEN[t].f, 0.5); leuchte(t); });
      });
      ctx.nach(1200 + z.folge.length * TAKT + 150, () => {
        z.phase = "du";
        z.eingabe = 0;
        render();
        ctx.auftrag(T.mel.du);
      });
    }
    function druecke(i) {
      if (!ctx.darf()) return;
      if (z.phase !== "du") return;
      spieleTon(TASTEN[i].f, 0.45);
      leuchte(i, 300);
      if (i !== z.folge[z.eingabe]) {
        z.phase = "pause";
        ctx.falsch(T.mel.nochmal);
        ctx.nach(1900, vorspielen);
        return;
      }
      z.eingabe += 1;
      if (z.eingabe < z.folge.length) return;
      z.phase = "pause";
      z.runde += 1;
      ctx.punkte(z.runde, 3);
      if (z.runde >= 3) { ctx.nach(450, () => { z.phase = "fertig"; ctx.geschafft(T.mel.ende); }); return; }
      ctx.nach(350, () => { ctx.klang("correct"); ctx.sag(`${T.mel.richtig} ${T.mel.dazu}`); ctx.zeigeAuftrag(T.mel.dazu); });
      z.folge.push(neuerTon(z.folge[z.folge.length - 1]));
      ctx.nach(2900, vorspielen);
    }
    return { start, render };
  }

  // --- 8. Hotel-Rezeption: Zimmerschlüssel -------------------------------------
  function spielSchluessel(ctx) {
    let z = null;
    const L = () => (ctx.modus === "breit"
      ? { gast: [20, 70, 150, 236], theke: [0, 236, 330, 74], blase: [160, 10, 150, 110], brett: [350, 6, 640, 298], key: [92, 270] }
      : { gast: [40, 200, 250, 330], theke: [0, 470, 430, 150], blase: [230, 60, 190, 150], brett: [450, 20, 530, 580], key: [140, 250] });
    function start() {
      const zahlen = mischen(Array.from({ length: ZIMMER_MAX }, (_, i) => i + 1));
      const haken = zahlen.slice(0, 6);
      const tiere = window.LernappBauTiere?.ARTEN || ["fox"];
      const gaeste = [];
      if (ctx.figur) gaeste.push(ctx.figur);
      mischen(tiere.filter((a) => a !== ctx.figur?.art)).slice(0, 4).forEach((art) => gaeste.push({ art, variante: zufall(4) }));
      z = { gast: 0, haken, rest: zahlen.slice(6), wunsch: haken[zufall(6)], gaeste, phase: "frage", kommt: true };
      ctx.punkte(0, 4);
      render();
      frage();
    }
    function frage() {
      ctx.auftrag(satzZimmer(z.wunsch), T.schl.tag);
    }
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      const gast = el("div", `bsp-gast${z.kommt ? " is-kommt" : ""}${z.phase === "geht" ? " is-geht" : ""}`, { html: figurBild(figurZeichnung(z.gaeste[z.gast] || null), 150, 236) });
      z.kommt = false;
      S.append(platz(gast, ...l.gast));
      S.append(platz(el("div", "bsp-theke", { html: `<i>${dingSvg("d_tischglocke")}</i>` }), ...l.theke));
      if (z.phase === "frage") {
        const blase = el("div", "bsp-blase bsp-zimmerblase", { html: `<span>Zimmer</span><b>${z.wunsch}</b>` });
        blase.dataset.nummer = String(z.wunsch);
        S.append(platz(blase, ...l.blase));
      }
      const brett = el("div", "bsp-brett-holz");
      S.append(platz(brett, ...l.brett));
      const [bx, by, bw, bh] = l.brett;
      const breit = ctx.modus === "breit";
      const spalten = breit ? 6 : 3;
      const zeilen = breit ? 1 : 2;
      const [kw, kh] = l.key;
      const gx = (bw - spalten * kw) / (spalten + 1);
      const gy = (bh - zeilen * kh) / (zeilen + 1);
      z.haken.forEach((n, i) => {
        const x = bx + gx + (i % spalten) * (kw + gx);
        const y = by + gy + Math.floor(i / spalten) * (kh + gy);
        if (n === null) { S.append(platz(el("i", "bsp-haken"), x + kw / 2 - 8, y - 1, 16, 16)); return; }
        const b = knopf("bsp-schluessel", `Zimmer ${n}`, schluesselSvg(n), () => waehle(n, b));
        b.dataset.nummer = String(n);
        b.disabled = z.phase !== "frage";
        S.append(platz(b, x, y, kw, kh));
      });
    }
    async function waehle(n, b) {
      if (!ctx.darf() || z.phase !== "frage") return;
      if (n !== z.wunsch) { ctx.falsch(`${satzFalscherSchluessel(n)} ${satzZimmer(z.wunsch)}`, b); return; }
      z.phase = "gegeben";
      ctx.klang("correct");
      ctx.sag(T.schl.danke);
      const l = L();
      const von = ctx.rechteck(b);
      const i = z.haken.indexOf(n);
      z.haken[i] = null;
      b.style.visibility = "hidden";
      ctx.szene.querySelector(".bsp-zimmerblase")?.remove();
      await fliege(ctx, schluesselSvg(n), von, { x: l.gast[0] + l.gast[2] * 0.55, y: l.gast[1] + l.gast[3] * 0.45, w: l.gast[2] * 0.3, h: l.gast[3] * 0.3 }, { dauer: 560 });
      if (!ctx.lebt()) return;
      z.phase = "geht";
      render();
      ctx.nach(reduced() ? 300 : 800, () => {
        z.gast += 1;
        ctx.punkte(z.gast, 4);
        if (z.gast >= 4) { z.phase = "fertig"; render(); ctx.geschafft(T.schl.ende); return; }
        z.haken[i] = z.rest.shift();
        const frei = z.haken.filter((x) => x !== null);
        z.wunsch = frei[zufall(frei.length)];
        z.phase = "frage";
        z.kommt = true;
        render();
        frage();
      });
    }
    return { start, render };
  }

  // --- 9. Notfall: Pflaster kleben ------------------------------------------
  function spielPflaster(ctx) {
    // Wo ein Kratzer sein kann (Masse der Tiere): Arme, Beine, Bauch, Stirn.
    const STELLEN = [[-19, -36], [19, -34], [-8, -10], [8, -10], [0, -24], [-11, -79], [12, -80]];
    // Wer anders gebaut ist: der Flamingo auf dünnen Beinen.
    const STELLEN_ART = { flamingo: [[-5, -14], [5, -26], [-16, -58], [0, -50], [7, -78]] };
    let z = null;
    let info = null;
    const L = () => (ctx.modus === "breit"
      ? { figur: [300, 0, 340, 310], dose: [700, 14, 280, 284], pfl: [164, 60], radius: 60 }
      : { figur: [230, 10, 440, 600], dose: [720, 110, 250, 400], pfl: [200, 74], radius: 74 });
    function start() {
      info = figurZeichnung(ctx.figur);
      const k = info.kopf;
      const stellen = info.mensch
        ? STELLEN.map(([x, y]) => [x * info.breite, y < -60 ? info.box.y0 + 22 : y * info.hoehe])
        : STELLEN_ART[info.art] || (k.dy ? STELLEN.slice(0, 5) : STELLEN).map(([x, y]) => [x + (y < -60 ? k.dx : 0), y + (y < -60 ? k.dy : 0)]);
      z = { kratzer: mischen(stellen).slice(0, 3).map(([x, y]) => ({ x, y, heil: false, dreh: -18 + zufall(36) })), phase: "kleben" };
      ctx.punkte(0, 3);
      render();
      ctx.auftrag(T.pfl.zieh, T.pfl.aua);
    }
    function vb() {
      const b = info.box;
      return [Math.min(b.x0, -36) - 6, b.y0 - 6, Math.max(b.x1, 36) - Math.min(b.x0, -36) + 12, -b.y0 + 10];
    }
    function render() {
      const S = ctx.szene;
      S.replaceChildren();
      const l = L();
      const v = vb();
      S.append(platz(el("div", "bsp-patient-gross", { html: svgVon(info.svg, v.join(" "), "bsp-bild", 'preserveAspectRatio="xMidYMax meet"') }), ...l.figur));
      const r = rahmen(l.figur, v);
      const kw = Math.max(34, r.s * 13);
      const kt = Math.max(60, r.s * 18);
      z.kratzer.forEach((k, i) => {
        const p = r.ab(k.x, k.y);
        if (k.heil) {
          const pf = el("div", "bsp-pflaster is-klebt", { html: pflasterSvg() });
          pf.style.transform = `rotate(${k.dreh}deg)`;
          S.append(platz(pf, p.x - kw * 0.95, p.y - kw * 0.36, kw * 1.9, kw * 0.72));
          return;
        }
        const kr = el("div", "bsp-kratzer", { html: kratzerSvg() });
        kr.dataset.i = String(i);
        kr.addEventListener("click", () => klebe(i));
        kr.style.setProperty("--bild", `${Math.round((kw / kt) * 100)}%`);
        S.append(platz(kr, p.x - kt / 2, p.y - kt / 2, kt, kt));
      });
      const dose = el("div", "bsp-dose");
      dose.append(el("b", "", { text: "Pflaster" }));
      S.append(platz(dose, ...l.dose));
      const rest = z.kratzer.filter((k) => !k.heil).length;
      const [dx, dy, dw, dh] = l.dose;
      const [pw, ph] = l.pfl;
      for (let i = 0; i < rest; i += 1) {
        const pf = el("button", "bsp-pflaster bsp-pflaster-ziehbar", { type: "button", "aria-label": "Pflaster", title: "Pflaster", html: pflasterSvg() });
        const oben = dy + Math.max(44, dh * 0.16);
        const schritt = (dy + dh - 12 - ph - oben) / 2;
        platz(pf, dx + (dw - pw) / 2, oben + i * schritt, pw, ph);
        ziehbar(ctx, pf, {
          geist: () => { const g = el("div", "bsp-pflaster", { html: pflasterSvg() }); g._w = pw; g._h = ph; g.style.width = `${pw}px`; g.style.height = `${ph}px`; return g; },
          tipp: () => { anstossen(pf, "bsp-wackel"); ctx.sag(T.pfl.zieh); },
          los: (p) => {
            let best = -1;
            let weit = Infinity;
            z.kratzer.forEach((k, j) => {
              if (k.heil) return;
              const q = r.ab(k.x, k.y);
              const a = Math.hypot(q.x - p.x, q.y - p.y);
              if (a < weit) { weit = a; best = j; }
            });
            if (best >= 0 && weit <= l.radius) klebe(best);
            else ctx.falsch(T.pfl.genau);
          },
        });
        S.append(pf);
      }
    }
    function klebe(i) {
      if (!ctx.darf() || z.phase !== "kleben") return;
      const k = z.kratzer[i];
      if (!k || k.heil) return;
      k.heil = true;
      ctx.klang("correct");
      render();
      const alle = ctx.szene.querySelectorAll(".bsp-pflaster.is-klebt");
      anstossen(alle[alle.length - 1], "bsp-plopp");
      const n = z.kratzer.filter((x) => x.heil).length;
      ctx.punkte(n, 3);
      if (n >= 3) { z.phase = "fertig"; ctx.geschafft(T.pfl.ende); return; }
      ctx.sag(n === 1 ? T.pfl.gut : T.pfl.noch);
    }
    return { start, render };
  }

  const MACHER = {
    baeckerei: spielBrot,
    coiffeur: spielHaare,
    radiologie: spielRoentgen,
    lebensmittel: spielEinkaufen,
    augen: spielSehtest,
    blumen: spielStrauss,
    musik: spielMelodie,
    rezeption: spielSchluessel,
    notfall: spielPflaster,
  };

  // ---------------------------------------------------------------------------
  // Die Ebene über dem Zimmer
  // ---------------------------------------------------------------------------
  // Die Fläche, auf der gezeichnet wird: fürs Tablet und fürs Handy quer.
  const MASS = { normal: { w: 1000, h: 620 }, breit: { w: 1000, h: 310 } };
  let offen = null;

  function starte({ host, raumId, sag = null, klang = null, figur = null, fertig = null, geschlossen = null } = {}) {
    if (!host || !hat(raumId)) return () => {};
    offen?.();
    const spiel = SPIELE[raumId];
    const timer = new Set();
    let lebt = true;
    let fest = false;
    let auftragText = "";
    let gemeldet = false;

    if (window.getComputedStyle?.(host).position === "static") host.style.position = "relative";
    const ebene = el("div", "bsp-ebene", { role: "dialog", "aria-modal": "true", "aria-label": spiel.name, tabindex: "-1" });
    const karte = el("div", `bsp-karte is-${raumId}`);
    const kopf = el("div", "bsp-kopf");
    const titel = el("h2", "bsp-titel", { text: spiel.name });
    const auftrag = knopf("bsp-auftrag", "Noch einmal hören", "", () => { if (auftragText) sprich(auftragText); });
    auftrag.innerHTML = `${svgVon('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5q2 3.5 0 7M18.5 6q4 6 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', "0 0 24 24", "bsp-auftrag-zeichen")}<span></span>`;
    const punkte = el("div", "bsp-punkte");
    const zu = knopf("bsp-zu", "Schliessen", svgVon('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>', "0 0 24 24"), () => schliessen());
    kopf.append(titel, auftrag, punkte, zu);
    const buehne = el("div", `bsp-buehne is-${raumId}`);
    const szene = el("div", "bsp-szene");
    buehne.append(szene);
    karte.append(kopf, buehne);
    ebene.append(karte);
    // Die Verläufe der Tiere, falls sie noch nicht im Dokument sind.
    const tierDefs = window.LernappBauTiere?.defs?.();
    if (tierDefs && !document.getElementById("bt-licht")) ebene.append(el("div", "bsp-tierdefs", { "aria-hidden": "true", html: `<svg xmlns="${NS}" width="0" height="0" focusable="false"><defs>${tierDefs}</defs></svg>` }));

    function sprich(text) { if (lebt && text) { try { sag?.(text); } catch { /* still */ } } }
    function ton(name) { if (lebt) { try { klang?.(name); } catch { /* still */ } } }

    const ctx = {
      szene,
      modus: "normal",
      W: MASS.normal.w,
      H: MASS.normal.h,
      k: 1,
      figur: figur && typeof figur === "object" ? figur : null,
      sag: sprich,
      klang: ton,
      lebt: () => lebt,
      // Ob gerade getippt werden darf (nicht während des Festes).
      darf: () => lebt && !fest,
      nach(ms, fn) {
        const id = window.setTimeout(() => { timer.delete(id); if (lebt) fn(); }, ms);
        timer.add(id);
        return id;
      },
      // Die Aufgabe oben anzeigen und sagen; vorher kommt davor (gesprochen,
      // nicht angezeigt), gesprochen ersetzt das Gesprochene ganz.
      auftrag(text, vorher = "", gesprochen = "") {
        ctx.zeigeAuftrag(text, gesprochen || text);
        sprich(gesprochen || (vorher ? `${vorher} ${text}` : text));
      },
      zeigeAuftrag(text, hoeren = text) {
        auftragText = hoeren;
        auftrag.querySelector("span").textContent = text;
        auftrag.hidden = !text;
      },
      punkte(n, von) {
        punkte.replaceChildren();
        for (let i = 0; i < von; i += 1) punkte.append(el("i", i < n ? "is-voll" : ""));
        punkte.hidden = !von;
      },
      falsch(text, node = null) {
        ton("wrong");
        if (text) sprich(text);
        if (node) anstossen(node, "bsp-wackel");
      },
      geschafft(text, zeigen = text) {
        fest = true;
        ctx.zeigeAuftrag(zeigen, text);
        ton("win");
        sprich(text);
        if (!gemeldet) {
          gemeldet = true;
          try { fertig?.({ spiel: raumId }); } catch (fehler) { window.setTimeout(() => { throw fehler; }); }
        }
        ctx.nach(1500, zeigeFest);
      },
      punkt(e) {
        const r = szene.getBoundingClientRect();
        return { x: (e.clientX - r.left) / ctx.k, y: (e.clientY - r.top) / ctx.k };
      },
      rechteck(node) {
        const r = node.getBoundingClientRect();
        const s = szene.getBoundingClientRect();
        return { x: (r.left - s.left) / ctx.k, y: (r.top - s.top) / ctx.k, w: r.width / ctx.k, h: r.height / ctx.k };
      },
    };
    const spielZug = MACHER[raumId](ctx);

    function messen(neuZeichnen = true) {
      const w = buehne.clientWidth;
      const h = buehne.clientHeight;
      if (!w || !h) return;
      const modus = w / h > 2.2 ? "breit" : "normal";
      const m = MASS[modus];
      ctx.k = Math.min(w / m.w, h / m.h);
      szene.style.width = `${m.w}px`;
      szene.style.height = `${m.h}px`;
      szene.style.transform = `translate(${r1((w - m.w * ctx.k) / 2)}px, ${r1((h - m.h * ctx.k) / 2)}px) scale(${ctx.k.toFixed(4)})`;
      szene.classList.toggle("is-breit", modus === "breit");
      if (modus !== ctx.modus) {
        ctx.modus = modus;
        ctx.W = m.w;
        ctx.H = m.h;
        if (neuZeichnen) spielZug.render();
      }
    }

    function zeigeFest() {
      if (!lebt) return;
      buehne.querySelector(".bsp-fest")?.remove();
      const f = el("div", "bsp-fest");
      const k = el("div", "bsp-fest-karte");
      k.innerHTML = `<div class="bsp-fest-sterne">${sternSvg()}${sternSvg()}${sternSvg()}</div><p>Super gemacht!</p>`;
      const reihe = el("div", "bsp-fest-knoepfe");
      const nochmal = knopf("bsp-nochmal", "Nochmal", `${svgVon('<path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v4.5h-4.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', "0 0 24 24")}<span>Nochmal</span>`, () => neu());
      const ende = knopf("bsp-ok bsp-fertig", "Fertig", "Fertig ✓", () => schliessen());
      reihe.append(nochmal, ende);
      k.append(reihe);
      f.append(k);
      if (!reduced()) {
        const farben = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#8338ec", "#ff9f1c"];
        for (let i = 0; i < 26; i += 1) {
          const c = el("i", "bsp-konfetti");
          const winkel = (Math.random() * 150 - 75) * (Math.PI / 180);
          const weit = 140 + Math.random() * 200;
          c.style.setProperty("--dx", `${Math.round(Math.sin(winkel) * weit)}px`);
          c.style.setProperty("--dy", `${Math.round(-Math.abs(Math.cos(winkel)) * weit - 30)}px`);
          c.style.setProperty("--dreh", `${Math.round(Math.random() * 600 - 300)}deg`);
          c.style.animationDelay = `${(Math.random() * 0.2).toFixed(2)}s`;
          c.style.background = farben[i % farben.length];
          f.append(c);
        }
      }
      buehne.append(f);
      try { ende.focus({ preventScroll: true }); } catch { /* alt */ }
    }

    function stopTimer() { timer.forEach((id) => window.clearTimeout(id)); timer.clear(); }
    function neu() {
      if (!lebt) return;
      stopTimer();
      fest = false;
      gemeldet = false;
      buehne.querySelector(".bsp-fest")?.remove();
      szene.replaceChildren();
      spielZug.start();
    }

    // Was in der Ebene geschieht, bleibt in der Ebene: Das Zimmer darunter
    // soll weder Tipps noch Tasten bekommen.
    ["pointerdown", "pointerup", "click", "dblclick", "wheel", "touchstart", "contextmenu"].forEach((typ) => {
      ebene.addEventListener(typ, (e) => { e.stopPropagation(); if (typ === "contextmenu") e.preventDefault(); }, { passive: typ !== "contextmenu" });
    });
    ebene.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") { e.preventDefault(); schliessen(); }
    });
    // Ein Tipp neben die Karte schliesst nicht – ein Kind tippt schnell daneben.

    let beobachter = null;
    const beiGroesse = () => messen(true);
    function schliessen() {
      if (!lebt) return;
      lebt = false;
      stopTimer();
      beobachter?.disconnect();
      window.removeEventListener("resize", beiGroesse);
      ebene.remove();
      if (offen === schliessen) offen = null;
      try { geschlossen?.(); } catch (fehler) { window.setTimeout(() => { throw fehler; }); }
    }

    host.append(ebene);
    offen = schliessen;
    messen(false);
    if (typeof window.ResizeObserver === "function") {
      beobachter = new ResizeObserver(() => { if (lebt) messen(true); });
      beobachter.observe(buehne);
    } else window.addEventListener("resize", beiGroesse);
    try { ebene.focus({ preventScroll: true }); } catch { /* alt */ }
    spielZug.start();
    return schliessen;
  }

  // ---------------------------------------------------------------------------
  // Alle Sätze, die ein Spiel sagen kann
  // ---------------------------------------------------------------------------
  function saetze() {
    const alle = [];
    const dazu = (x) => {
      if (typeof x === "string") alle.push(...saetzeVon(x));
      else if (Array.isArray(x)) x.forEach(dazu);
      else if (x && typeof x === "object") Object.values(x).forEach(dazu);
    };
    Object.values(SPIELE).forEach((s) => dazu(s.text));
    dazu(T);
    for (let n = 1; n <= 5; n += 1) dazu(ZAHLWORT[n]);
    // Einkaufen: die Waren, die Preise und was schon bezahlt ist (bis zum
    // Preis plus die grösste Münze).
    WAREN.forEach((w) => dazu(satzWare(w)));
    for (let n = PREIS_MIN; n <= PREIS_MAX; n += 1) dazu(satzPreis(n));
    for (let n = 1; n < PREIS_MAX + 5; n += 1) dazu(satzFranken(n));
    // Blumen
    FARBEN.forEach((f) => {
      for (let n = 1; n <= 4; n += 1) { dazu(satzWunsch(n, f, true)); dazu(satzWunsch(n, f, false)); }
      dazu([satzKeine(f), satzGenug(f), satzFehlen(f)]);
    });
    // Rezeption
    for (let n = 1; n <= ZIMMER_MAX; n += 1) dazu([satzZimmer(n), satzFalscherSchluessel(n)]);
    return [...new Set(alle)];
  }

  window.LernappBauSpiele = { SPIELE, hat, starte, saetze };
})();
