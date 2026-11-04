/*
 * englisch-spiele.js – Die Spiele der Englischecke ab Etappe 2, und was sie
 * zeichnen.
 *
 * Jedes Spiel ist eine Funktion (kern, optionen), die train-englischecke.js
 * aufruft (starteSpiel). Der Kern gibt, was alle brauchen: sage (Englisch
 * sprechen, Deutsch auf DE), setzeBild (die Bühne, 1000 × 560), die Leiste
 * mit rundeFertig und leistenKnopf, die Schranke, den Stand.
 *
 *   memory     Memory Bild–Ton: ein Bild und eine Karte, die das Wort sagt
 *   janein     Yes or no?: «Is this a cow?» – Daumen hoch oder runter
 *   roccosays  Rocco says: «Tap the red balloon!» (auf «schwer» mit gross/klein)
 *   farbenzug  Farben-Zug: «A blue wagon, please!»
 *   zaehlen    Count with Rocco: «How many ducks?», Rocco zählt mit
 *   fuettern   Feed Rocco: «Rocco wants a banana.»
 *   verse      Die Jukebox: Sprechverse Zeile für Zeile
 *   buch       Bekannte Bücher aus dem Lesewagen, einfach auf Englisch
 *
 * Wie in Etappe 1 gilt: Jeder Text lässt sich antippen, der Knopf DE sagt das
 * zuletzt Gesagte auf Deutsch und dann noch einmal auf Englisch, und ein
 * Spiel läuft nach DE weiter (sage mit danach). Kein Minus, keine Uhr: Ein
 * falscher Tipp sagt, was es war, und fragt noch einmal.
 */
(() => {
  "use strict";

  const A = () => window.LernappEnglischArt;
  const mische = (liste) => liste.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];
  const DUNKEL = "#2b2f38";
  const SCHRIFT = "Baloo 2, Nunito, sans-serif";

  // ===========================================================================
  // Zeichnungen
  // ===========================================================================
  // Ein Ding aus englisch-art.js, so gross wie ein Sticker mit Radius r.
  function dingBild(id, x, y, r = 36) {
    const a = A();
    if (id === "star") return a.stern(x, y, r * 0.8);
    if (id === "balloon") return ballon("#e63946", x, y + r * 0.2, r * 0.75);
    if (id === "rocco") return `<g transform="translate(${x} ${y + r * 0.9}) scale(${(r / 52).toFixed(3)})">${a.rocco("jubel", "freude")}</g>`;
    const [m, dy] = a.STICKER[id] || [0.4, 0];
    const f = m * (r / 36);
    const bild = id === "apple" ? a.DING.apple(true) : a.DING[id] ? a.DING[id]() : "";
    return `<g transform="translate(${x} ${(y + dy * f).toFixed(1)}) scale(${f.toFixed(3)})">${bild}</g>`;
  }
  // Ein Luftballon, Mitte (x, y), Radius r.
  function ballon(farbe, x, y, r) {
    const rand = farbe === "#ffffff" ? ` stroke="#c3c7cf" stroke-width="${(r / 18).toFixed(1)}"` : "";
    return `<path d="M${x} ${y + r * 1.12} q${-r * 0.3} ${r * 0.6} ${r * 0.1} ${r * 1.2}" stroke="#8a8f99" stroke-width="2" fill="none"/>
      <ellipse cx="${x}" cy="${y}" rx="${r * 0.86}" ry="${r}" fill="${farbe}"${rand}/>
      <path d="M${x - r * 0.12} ${y + r * 0.98} l${r * 0.12} ${r * 0.16} l${r * 0.12} ${-r * 0.16} Z" fill="${farbe}"${rand}/>
      <ellipse cx="${x - r * 0.32}" cy="${y - r * 0.38}" rx="${r * 0.16}" ry="${r * 0.26}" fill="#ffffff" opacity="0.45"/>`;
  }
  // Ein Wagen des Farben-Zugs, links unten bei (x, y), 120 breit.
  function farbWagen(farbe, x, y, b = 120) {
    const rand = farbe === "#ffffff" ? ` stroke="#c3c7cf" stroke-width="3"` : "";
    const h = b * 0.55;
    return `<rect x="${x}" y="${y - h}" width="${b}" height="${h}" rx="${b * 0.08}" fill="${farbe}"${rand}/>
      <rect x="${x + b * 0.12}" y="${y - h * 0.78}" width="${b * 0.32}" height="${h * 0.36}" rx="4" fill="#ffffff" opacity="${farbe === "#ffffff" ? 0 : 0.35}"/>
      <rect x="${x + b * 0.56}" y="${y - h * 0.78}" width="${b * 0.32}" height="${h * 0.36}" rx="4" fill="#ffffff" opacity="${farbe === "#ffffff" ? 0 : 0.35}"/>
      <rect x="${x - b * 0.06}" y="${y - 6}" width="${b * 1.12}" height="8" rx="3" fill="${DUNKEL}"/>
      <circle cx="${x + b * 0.24}" cy="${y + 10}" r="${b * 0.12}" fill="${DUNKEL}"/><circle cx="${x + b * 0.24}" cy="${y + 10}" r="${b * 0.05}" fill="#c3c7cf"/>
      <circle cx="${x + b * 0.76}" cy="${y + 10}" r="${b * 0.12}" fill="${DUNKEL}"/><circle cx="${x + b * 0.76}" cy="${y + 10}" r="${b * 0.05}" fill="#c3c7cf"/>`;
  }
  // Roccos kleine Lok, links unten bei (x, y).
  function roccoLok(x, y) {
    return `<rect x="${x + 70}" y="${y - 120}" width="18" height="36" rx="4" fill="${DUNKEL}"/>
      <rect x="${x}" y="${y - 110}" width="66" height="100" rx="10" fill="#6c5ce7"/><rect x="${x + 10}" y="${y - 100}" width="46" height="40" rx="8" fill="#cfeefa"/>
      <g transform="translate(${x + 33} ${y - 76}) scale(0.55)">${A().roccoKopf("froh")}</g>
      <rect x="${x + 60}" y="${y - 74}" width="80" height="64" rx="18" fill="#8e7cf0"/><circle cx="${x + 140}" cy="${y - 44}" r="12" fill="#ffd166"/>
      <rect x="${x - 4}" y="${y - 12}" width="150" height="10" rx="4" fill="${DUNKEL}"/>
      ${[x + 22, x + 72, x + 118].map((cx) => `<circle cx="${cx}" cy="${y + 8}" r="16" fill="${DUNKEL}"/><circle cx="${cx}" cy="${y + 8}" r="6" fill="#ffd166"/>`).join("")}`;
  }
  // Ein Daumen: hoch (ja) oder runter (nein), in einem Knopf.
  function daumen(hoch, x, y) {
    const farbe = hoch ? "#3fbf74" : "#e8543f";
    const hand = `<path d="M-26 -4 h14 v40 h-14 z" fill="#ffffff"/><path d="M-8 -6 q10 -14 12 -34 q2 -10 10 -8 q10 4 6 22 l-4 16 h26 q12 0 10 12 l-6 30 q-2 8 -12 8 h-42 z" fill="#ffffff"/>`;
    return `<circle cx="${x}" cy="${y}" r="74" fill="${farbe}"/><circle cx="${x}" cy="${y}" r="66" fill="${farbe}" stroke="#ffffff" stroke-width="3" opacity="0.6"/>
      <g transform="translate(${x + 4} ${y + (hoch ? 2 : -2)}) ${hoch ? "" : "rotate(180)"} scale(1.05)">${hand}</g>`;
  }
  // Der Lautsprecher (Memory, Bücher).
  const lautsprecher = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -12 h14 l18 -16 v56 l-18 -16 h-14 z" fill="#3a7bd5"/><path d="M12 -12 a18 18 0 0 1 0 24 M20 -22 a30 30 0 0 1 0 44" stroke="#3a7bd5" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  // Ein Knopf im Bild: <g data-…> mit einer unsichtbaren Fläche, die der Finger trifft.
  const flaeche = (x, y, b, h) => `<rect x="${x}" y="${y}" width="${b}" height="${h}" rx="18" fill="transparent"/>`;

  // Bilder für die Kacheln der Spielzeugkiste und der Jukebox (200 × 112).
  function spielBild(id) {
    const a = A();
    const bild = {
      hearfind: () => `<rect width="200" height="112" fill="#cdeefb"/>${dingBild("cow", 92, 64, 38)}<circle cx="160" cy="34" r="20" fill="#ffffff"/><text x="160" y="43" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="26" fill="#3a7bd5">?</text>`,
      memory: () => `<rect width="200" height="112" fill="#fff4dc"/><rect x="34" y="16" width="58" height="80" rx="10" fill="#ffffff" stroke="#e1d9c6" stroke-width="3"/>${dingBild("duck", 63, 56, 26)}
        <rect x="108" y="16" width="58" height="80" rx="10" fill="#ffffff" stroke="#e1d9c6" stroke-width="3"/>${lautsprecher(140, 54, 0.8)}`,
      janein: () => `<rect width="200" height="112" fill="#eef7ea"/><g transform="translate(58 56) scale(0.42)">${daumen(true, 0, 0)}</g><g transform="translate(142 56) scale(0.42)">${daumen(false, 0, 0)}</g>`,
      roccosays: () => `<rect width="200" height="112" fill="#e3f5fb"/>${ballon("#e63946", 56, 46, 26)}${ballon("#3a7bd5", 100, 40, 30)}${ballon("#ffd23f", 146, 48, 24)}`,
      farbenzug: () => `<rect width="200" height="112" fill="#fdf1e2"/><g transform="translate(8 30) scale(0.42)">${roccoLok(0, 150)}</g>${farbWagen("#e63946", 80, 88, 50)}${farbWagen("#3fbf74", 140, 88, 50)}`,
      zaehlen: () => `<rect width="200" height="112" fill="#e9f4ff"/>${[38, 80, 122].map((x) => dingBild("duck", x, 50, 20)).join("")}<circle cx="168" cy="72" r="20" fill="#6c5ce7"/><text x="168" y="81" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="24" fill="#ffffff">3</text>`,
      fuettern: () => `<rect width="200" height="112" fill="#fff4dc"/><g transform="translate(62 104) scale(0.62)">${a.rocco("steh", "freude")}</g>${dingBild("banana", 140, 52, 28)}`,
    }[id] || SPIEL_BILDER[id];
    return bild ? `<svg viewBox="0 0 200 112" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${bild()}</svg>` : "";
  }
  // Weitere Kachelbilder legen spätere Spiele hier dazu.
  const SPIEL_BILDER = {};
  function versBild(id) {
    const a = A();
    const bild = {
      hello: () => `<rect width="200" height="112" fill="#e3f5fb"/><g transform="translate(100 108) scale(0.66)">${a.rocco("jubel", "freude")}</g>`,
      colors: () => `<rect width="200" height="112" fill="#fff8e6"/>${dingBild("apple", 46, 60, 26)}${dingBild("sun", 100, 54, 28)}${dingBild("tree", 154, 58, 28)}`,
      count: () => `<rect width="200" height="112" fill="#e9f4ff"/>${[34, 67, 100, 133, 166].map((x) => dingBild("duck", x, 60, 17)).join("")}`,
      head: () => `<rect width="200" height="112" fill="#f3ecff"/><g transform="translate(100 108) scale(0.66)">${a.rocco("steh", "froh")}</g>`,
      macdonald: () => `<rect width="200" height="112" fill="#eef7ea"/>${dingBild("barn", 64, 56, 34)}${dingBild("cow", 140, 62, 32)}`,
    }[id];
    return bild ? `<svg viewBox="0 0 200 112" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${bild()}</svg>` : "";
  }

  // Farben und Zahlen als Sticker im Wörterbuch.
  function farbenUndZahlenZeichnen() {
    const a = A();
    const I = window.LernappEnglischInhalt;
    if (!a || !I?.FARBEN) return;
    I.FARBEN.forEach((f) => {
      a.DING[f.id] = () => ballon(f.hex, 0, -10, 40);
      a.STICKER[f.id] = [0.62, 0];
    });
    I.ZAHLEN.forEach((n) => {
      a.DING[n.id] = () => `<text x="0" y="22" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="64" fill="#6c5ce7">${n.n}</text>`;
      a.STICKER[n.id] = [0.62, 0];
    });
    a.spielBild = spielBild;
    a.versBild = versBild;
  }

  // ===========================================================================
  // Gemeinsames
  // ===========================================================================
  // Punkte unten in der Leiste: wie weit die Runde ist.
  function punkte(k, von) {
    const z = k.el("span", "en-zaehler en-runde");
    const zeige = (i) => { z.innerHTML = `${Array.from({ length: von }, (_, j) => `<i class="${j < i ? "an" : ""}"></i>`).join("")}<b>${Math.min(i, von)} / ${von}</b>`; };
    zeige(0);
    k.offen().extra.append(z);
    return zeige;
  }
  const lobPaar = (k) => zufall(k.inhalt().LOB);
  const svgVon = (inhalt, klasse) => `<svg viewBox="0 0 1000 560" class="en-spiel-svg ${klasse}" xmlns="http://www.w3.org/2000/svg">${window.LernappBauTiere?.defs?.() ? `<defs>${window.LernappBauTiere.defs()}</defs>` : ""}${inhalt}</svg>`;
  const nochAktiv = (k, runde) => k.offen()?.runde === runde;

  // ===========================================================================
  // Memory Bild–Ton
  // ===========================================================================
  // wortbild: die zweite Karte zeigt das englische Wort geschrieben statt
  // eines Lautsprechers (Wortbild-Memory für Lesende, Etappe 4).
  function memory(k, { wortbild = false } = {}) {
    const I = k.inhalt();
    const o = k.offen();
    const spiel = wortbild ? "wortbild" : "memory";
    o.ansicht = spiel;
    const paare = { leicht: 3, mittel: 4, schwer: 6 }[k.stufe()] || 4;
    const woerter = k.spielWoerter(paare);
    const karten = mische([...woerter.map((w) => ({ w, art: "bild" })), ...woerter.map((w) => ({ w, art: "ton" }))]);
    const spalten = paare === 6 ? 4 : paare;
    const reihen = karten.length / spalten;
    const b = Math.min(200, (940 - (spalten - 1) * 20) / spalten);
    const h = Math.min(232, (520 - (reihen - 1) * 18) / reihen);
    const x0 = (1000 - (spalten * b + (spalten - 1) * 20)) / 2;
    const y0 = (560 - (reihen * h + (reihen - 1) * 18)) / 2;
    let s = `<rect width="1000" height="560" fill="#fff4dc"/>`;
    karten.forEach((kk, i) => {
      const x = x0 + (i % spalten) * (b + 20);
      const y = y0 + Math.floor(i / spalten) * (h + 18);
      // Das geschriebene Wort ohne Artikel: «cow», «teddy bear».
      const wort = kk.w.en.replace(/[.!?]$/, "").replace(/^(A|An|The) /, "").toLowerCase();
      const vorne = kk.art === "bild" ? dingBild(kk.w.id, x + b / 2, y + h / 2, Math.min(b, h) * 0.36)
        : wortbild ? `<text x="${x + b / 2}" y="${y + h / 2 + 12}" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="${Math.min(40, (b * 1.7) / Math.max(4, wort.length))}" fill="#243047">${wort}</text>`
          : lautsprecher(x + b / 2, y + h / 2, Math.min(b, h) / 110);
      s += `<g class="en-karte" data-karte="${i}" data-wort="${kk.w.id}" data-art="${kk.art}" tabindex="0" role="button" aria-label="Karte ${i + 1}">
        <g class="en-karte-zu"><rect x="${x}" y="${y}" width="${b}" height="${h}" rx="18" fill="#3a7bd5"/><rect x="${x + 8}" y="${y + 8}" width="${b - 16}" height="${h - 16}" rx="12" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.6"/>${A().stern(x + b / 2, y + h / 2, Math.min(b, h) * 0.16)}</g>
        <g class="en-karte-auf" style="display:none"><rect x="${x}" y="${y}" width="${b}" height="${h}" rx="18" fill="#ffffff" stroke="#e1d9c6" stroke-width="4"/>${vorne}</g>
        <rect class="en-karte-rand" x="${x}" y="${y}" width="${b}" height="${h}" rx="18" fill="none" stroke="#3fbf74" stroke-width="7" style="display:none"/>
      </g>`;
    });
    const svg = k.setzeBild(svgVon(s, "en-memory-svg"));
    k.hilfe(spiel);
    const runde = { offen: [], gefunden: 0, sperre: false };
    o.runde = runde;
    const zeige = punkte(k, paare);
    k.sage(wortbild ? I.SAETZE.wortbild : I.SAETZE.memory);
    const knoten = [...svg.querySelectorAll("[data-karte]")];
    const dreh = (i, auf) => {
      knoten[i].querySelector(".en-karte-zu").style.display = auf ? "none" : "";
      knoten[i].querySelector(".en-karte-auf").style.display = auf ? "" : "none";
    };
    knoten.forEach((kn, i) => k.antippbar(kn, () => {
      const kk = karten[i];
      if (!nochAktiv(k, runde) || kk.weg) {
        if (kk.weg) k.sage([kk.w.en, kk.w.de]);
        return;
      }
      if (runde.sperre || runde.offen.includes(i)) return;
      dreh(i, true);
      k.animiere(kn, "en-huepf", 400);
      runde.offen.push(i);
      if (kk.art === "ton" && !wortbild) k.sage([kk.w.en, kk.w.de]);
      else k.kids()?.playStarSound?.(0);
      if (runde.offen.length < 2) return;
      const [p, q] = runde.offen.map((j) => karten[j]);
      if (p.w.id === q.w.id && p.art !== q.art) {
        p.weg = true;
        q.weg = true;
        runde.offen.forEach((j) => { knoten[j].querySelector(".en-karte-rand").style.display = ""; });
        runde.offen = [];
        runde.gefunden += 1;
        zeige(runde.gefunden);
        k.stand().gehoert(p.w.id);
        k.kids()?.playJingle?.("correct");
        const fertig = runde.gefunden >= paare;
        k.sage([I.SAETZE.paar, [p.w.en, p.w.de]], { danach: () => {
          if (!fertig || !nochAktiv(k, runde)) return;
          runde.vorbei = true;
          k.rundeFertig(spiel, { satz: I.SAETZE.allePaare, nochmal: () => memory(k, { wortbild }) });
        } });
        return;
      }
      runde.sperre = true;
      window.setTimeout(() => {
        if (!nochAktiv(k, runde)) return;
        runde.offen.forEach((j) => dreh(j, false));
        runde.offen = [];
        runde.sperre = false;
      }, 1500);
    }));
  }

  // ===========================================================================
  // Yes or no?
  // ===========================================================================
  function janein(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "janein";
    const anzahl = k.stufe() === "leicht" ? 6 : 8;
    const pool = k.spielWoerter(Math.max(anzahl + 4, 12));
    const fragen = Array.from({ length: anzahl }, (_, i) => {
      const w = pool[i % pool.length];
      const stimmt = Math.random() < 0.5;
      const gezeigt = stimmt ? w : zufall(pool.filter((x) => x.id !== w.id));
      return { w, gezeigt, stimmt };
    });
    const runde = { i: 0, ersterVersuch: true };
    o.runde = runde;
    k.hilfe("janein");
    const zeige = punkte(k, anzahl);
    const zeichne = () => {
      const f = fragen[runde.i];
      const s = `<rect width="1000" height="560" fill="#eef7ea"/>
        <rect x="330" y="40" width="340" height="340" rx="30" fill="#ffffff" stroke="#e1d9c6" stroke-width="4"/>
        <g class="en-janein-bild" data-bild="1" data-gezeigt="${f.gezeigt.id}" tabindex="0" role="button">${flaeche(330, 40, 340, 340)}${dingBild(f.gezeigt.id, 500, 210, 120)}</g>
        <g class="en-janein-knopf" data-antwort="ja" tabindex="0" role="button" aria-label="Yes – Ja">${daumen(true, 260, 450)}</g>
        <g class="en-janein-knopf" data-antwort="nein" tabindex="0" role="button" aria-label="No – Nein">${daumen(false, 740, 450)}</g>`;
      const svg = k.setzeBild(svgVon(s, "en-janein-svg"));
      o.extra.append(zeigeKnoten);
      runde.ersterVersuch = true;
      const frage = I.istDas(f.w);
      k.sage(frage);
      svg.querySelector("[data-bild]")?.addEventListener("click", () => k.sage(frage));
      svg.querySelectorAll("[data-antwort]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei) return;
        const ja = kn.dataset.antwort === "ja";
        if (ja === f.stimmt) {
          k.animiere(kn, "en-huepf");
          if (f.stimmt) k.stand().erkannt(f.w.id, runde.ersterVersuch);
          else k.stand().gehoert(f.gezeigt.id);
          k.kids()?.playJingle?.("correct");
          runde.i += 1;
          zeige(runde.i);
          k.sage([f.stimmt ? I.SAETZE.ja : I.SAETZE.nein, [f.gezeigt.en, f.gezeigt.de]], { danach: () => {
            if (!nochAktiv(k, runde)) return;
            if (runde.i < fragen.length) { zeichne(); return; }
            runde.vorbei = true;
            k.rundeFertig("janein", { nochmal: () => janein(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          if (f.stimmt && runde.ersterVersuch) k.stand().erkannt(f.w.id, false);
          runde.ersterVersuch = false;
          k.kids()?.playJingle?.("retry");
          k.sage([[f.gezeigt.en, f.gezeigt.de], frage]);
        }
      }));
    };
    // Die Punkte bleiben über alle Fragen dieselben.
    const zeigeKnoten = o.extra.lastChild;
    zeichne();
  }

  // ===========================================================================
  // Rocco says: Ballone nach Farbe (und Grösse)
  // ===========================================================================
  function roccosays(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "roccosays";
    const st = k.stufe();
    const anzahl = st === "leicht" ? 4 : 6;
    const mitGroesse = st === "schwer";
    const runde = { i: 0, ersterVersuch: true };
    o.runde = runde;
    k.hilfe("roccosays");
    const zeige = punkte(k, anzahl);
    const zeigeKnoten = o.extra.lastChild;
    const zeichne = () => {
      const farben = mische(I.FARBEN).slice(0, mitGroesse ? 3 : st === "leicht" ? 4 : 5);
      let ballone = farben.map((f) => ({ f, g: null }));
      if (mitGroesse) ballone = mische(farben.flatMap((f) => [{ f, g: "big" }, { f, g: "small" }]));
      const ziel = zufall(ballone);
      const n = ballone.length;
      let s = `<rect width="1000" height="560" fill="#e3f5fb"/><path d="M0 470 Q250 440 500 466 T1000 460 L1000 560 L0 560 Z" fill="#94cd60"/>`;
      ballone.forEach((bl, i) => {
        const x = 120 + i * (760 / Math.max(1, n - 1));
        const r = bl.g === "small" ? 46 : bl.g === "big" ? 82 : 66;
        const y = 230 + (i % 2) * 40;
        s += `<g class="en-ballon" data-ballon="${i}" tabindex="0" role="button" aria-label="${bl.g ? `${bl.g} ` : ""}${bl.f.id}">${flaeche(x - 90, y - 110, 180, 300)}${ballon(bl.f.hex, x, y, r)}</g>`;
      });
      s += `<g transform="translate(500 548) scale(0.8)">${A().rocco("steh", "froh")}</g>`;
      const svg = k.setzeBild(svgVon(s, "en-ballon-svg"));
      o.extra.append(zeigeKnoten);
      runde.ersterVersuch = true;
      const auftrag = I.tippeBallon(ziel.f, ziel.g);
      k.sage(auftrag);
      svg.querySelectorAll("[data-ballon]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei) return;
        const bl = ballone[Number(kn.dataset.ballon)];
        if (bl === ziel || (bl.f === ziel.f && bl.g === ziel.g)) {
          kn.classList.add("en-steigt");
          k.stand().erkannt(ziel.f.id, runde.ersterVersuch);
          k.kids()?.playJingle?.("correct");
          runde.i += 1;
          zeige(runde.i);
          k.sage([lobPaar(k), [ziel.f.en, ziel.f.de]], { danach: () => {
            if (!nochAktiv(k, runde)) return;
            if (runde.i < anzahl) { zeichne(); return; }
            runde.vorbei = true;
            k.rundeFertig("roccosays", { nochmal: () => roccosays(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          if (runde.ersterVersuch) k.stand().erkannt(ziel.f.id, false);
          runde.ersterVersuch = false;
          k.kids()?.playJingle?.("retry");
          k.stand().gehoert(bl.f.id);
          k.sage([[bl.f.en, bl.f.de], auftrag]);
        }
      }));
    };
    k.sage(I.SAETZE.roccosays, { danach: zeichne });
  }

  // ===========================================================================
  // Farben-Zug
  // ===========================================================================
  function farbenzug(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "farbenzug";
    const st = k.stufe();
    const anzahl = st === "leicht" ? 4 : 5;
    const auswahl = mische(I.FARBEN).slice(0, st === "leicht" ? 5 : st === "schwer" ? 8 : 6);
    const runde = { zug: [], ersterVersuch: true };
    o.runde = runde;
    k.hilfe("farbenzug");
    const zeige = punkte(k, anzahl);
    let ziel = null;
    const zeichne = (fahrt = false) => {
      const frei = auswahl.filter((f) => !runde.zug.includes(f));
      let s = `<rect width="1000" height="560" fill="#fdf1e2"/><rect x="0" y="262" width="1000" height="10" fill="#8a8f99"/>${Array.from({ length: 25 }, (_, i) => `<rect x="${i * 42}" y="272" width="22" height="8" fill="#b07a45"/>`).join("")}
        <rect x="0" y="486" width="1000" height="74" fill="#e9c48f"/>`;
      s += `<g class="en-zug${fahrt ? " en-zug-faehrt" : ""}">${roccoLok(40, 250)}${runde.zug.map((f, i) => farbWagen(f.hex, 210 + i * 140, 250)).join("")}</g>`;
      frei.forEach((f, i) => {
        const b = 100;
        const x = 1000 / 2 - (frei.length * 130) / 2 + i * 130 + 15;
        s += `<g class="en-farbwagen" data-farbe="${f.id}" tabindex="0" role="button" aria-label="${f.id}">${flaeche(x - 10, 380, b + 20, 130)}${farbWagen(f.hex, x, 470, b)}</g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-farbenzug-svg"));
      o.extra.append(zeigeKnoten);
      return svg;
    };
    const naechster = () => {
      const frei = auswahl.filter((f) => !runde.zug.includes(f));
      ziel = zufall(frei);
      runde.ersterVersuch = true;
      const svg = zeichne();
      const bitte = I.wagenBitte(ziel);
      k.sage(bitte);
      svg.querySelectorAll("[data-farbe]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei) return;
        const f = I.FARBEN.find((x) => x.id === kn.dataset.farbe);
        if (f === ziel) {
          k.stand().erkannt(f.id, runde.ersterVersuch);
          runde.zug.push(f);
          zeige(runde.zug.length);
          k.kids()?.playJingle?.("correct");
          zeichne();
          k.sage([I.LOB[1], [f.en, f.de]], { danach: () => {
            if (!nochAktiv(k, runde)) return;
            if (runde.zug.length < anzahl) { naechster(); return; }
            runde.vorbei = true;
            zeichne(true);
            k.rundeFertig("farbenzug", { satz: I.SAETZE.zugFertig, nochmal: () => farbenzug(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          if (runde.ersterVersuch) k.stand().erkannt(ziel.id, false);
          runde.ersterVersuch = false;
          k.stand().gehoert(f.id);
          k.kids()?.playJingle?.("retry");
          k.sage([[f.en, f.de], bitte]);
        }
      }));
    };
    const zeigeKnoten = o.extra.lastChild;
    zeichne();
    k.sage(I.SAETZE.farbenzug, { danach: naechster });
  }

  // ===========================================================================
  // Count with Rocco
  // ===========================================================================
  function zaehlen(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "zaehlen";
    const st = k.stufe();
    const bis = st === "leicht" ? 5 : st === "schwer" ? 10 : 8;
    const anzahl = 5;
    const runde = { i: 0, ersterVersuch: true };
    o.runde = runde;
    k.hilfe("zaehlen");
    const zeige = punkte(k, anzahl);
    const zeigeKnoten = o.extra.lastChild;
    const dinge = I.ZAEHLDINGE.filter((d) => d.id === "star" || d.id === "balloon" || A().DING[d.id]);
    let vorher = 0;
    const frage = () => {
      const d = zufall(dinge);
      let n = 1 + Math.floor(Math.random() * bis);
      if (n === vorher) n = (n % bis) + 1;
      vorher = n;
      runde.ersterVersuch = true;
      const andere = mische(Array.from({ length: bis }, (_, i) => i + 1).filter((x) => x !== n)).slice(0, 2);
      const zahlen = mische([n, ...andere]);
      // Die Dinge in einem Raster, ein wenig verschoben.
      const spalten = n > 6 ? 5 : n > 3 ? 3 : n;
      const reihen = Math.ceil(n / spalten);
      const zb = 150;
      const zh = Math.min(130, 300 / reihen);
      let s = `<rect width="1000" height="560" fill="#e9f4ff"/><rect x="60" y="24" width="880" height="350" rx="30" fill="#ffffff" stroke="#d6e6f5" stroke-width="4"/>`;
      for (let i = 0; i < n; i += 1) {
        const x = 500 - ((spalten - 1) * zb) / 2 + (i % spalten) * zb + ((Math.floor(i / spalten) % 2) ? 20 : -10);
        const y = 200 - ((reihen - 1) * zh) / 2 + Math.floor(i / spalten) * zh;
        s += `<g class="en-zaehlding" data-nr="${i}">${dingBild(d.id, x, y, Math.min(52, zh * 0.42))}<g class="en-zaehlnr" style="display:none"><circle cx="${x + 42}" cy="${y - 42}" r="20" fill="#6c5ce7"/><text x="${x + 42}" y="${y - 34}" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="22" fill="#ffffff">${i + 1}</text></g></g>`;
      }
      zahlen.forEach((z, i) => {
        const x = 260 + i * 240;
        s += `<g class="en-zahlknopf" data-zahl="${z}" tabindex="0" role="button" aria-label="${z}"><circle cx="${x}" cy="466" r="62" fill="#6c5ce7"/><circle cx="${x}" cy="466" r="54" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.5"/><text x="${x}" y="490" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="68" fill="#ffffff">${z}</text></g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-zaehlen-svg"));
      o.extra.append(zeigeKnoten);
      const wieViele = I.wieViele(d);
      k.sage(wieViele);
      const nummern = [...svg.querySelectorAll("[data-nr]")];
      // Rocco zählt mit: jedes Ding bekommt seine Zahl.
      const zaehleMit = (danach) => {
        const paare = I.ZAHLEN.slice(0, n).map((z) => [z.en, z.de]);
        nummern.forEach((kn) => { kn.querySelector(".en-zaehlnr").style.display = "none"; });
        k.sage([...paare, I.soViele(d, n)], {
          beiJedem: (_, j) => {
            if (j < n) {
              nummern[j].querySelector(".en-zaehlnr").style.display = "";
              k.animiere(nummern[j], "en-huepf", 500);
              k.stand().gehoert(I.ZAHLEN[j].id);
            }
          },
          danach,
        });
      };
      svg.querySelectorAll("[data-zahl]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei || runde.zaehlt) return;
        const z = Number(kn.dataset.zahl);
        if (z === n) {
          k.animiere(kn, "en-huepf");
          k.stand().erkannt(I.ZAHLEN[n - 1].id, runde.ersterVersuch);
          k.kids()?.playJingle?.("correct");
          runde.i += 1;
          zeige(runde.i);
          runde.zaehlt = true;
          zaehleMit(() => {
            runde.zaehlt = false;
            if (!nochAktiv(k, runde)) return;
            if (runde.i < anzahl) { frage(); return; }
            runde.vorbei = true;
            k.rundeFertig("zaehlen", { nochmal: () => zaehlen(k) });
          });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          if (runde.ersterVersuch) k.stand().erkannt(I.ZAHLEN[n - 1].id, false);
          runde.ersterVersuch = false;
          k.kids()?.playJingle?.("retry");
          const falsch = I.ZAHLEN[z - 1];
          runde.zaehlt = true;
          k.sage([[falsch.en, falsch.de], I.SAETZE.zaehlenMit], { danach: () => zaehleMit(() => {
            runde.zaehlt = false;
            if (nochAktiv(k, runde)) k.sage(wieViele);
          }) });
        }
      }));
    };
    k.sage(I.SAETZE.zaehlen, { danach: frage });
  }

  // ===========================================================================
  // Feed Rocco
  // ===========================================================================
  function fuettern(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "fuettern";
    const st = k.stufe();
    const anzahl = st === "leicht" ? 4 : 5;
    const proTisch = st === "leicht" ? 3 : 4;
    const essen = I.ESSEN.filter((e) => A().DING[e.id]);
    const runde = { i: 0, ersterVersuch: true };
    o.runde = runde;
    k.hilfe("fuettern");
    const zeige = punkte(k, anzahl);
    const zeigeKnoten = o.extra.lastChild;
    let vorher = null;
    const naechster = (laune = "froh") => {
      const ziel = zufall(essen.filter((e) => e !== vorher));
      vorher = ziel;
      const tisch = mische([ziel, ...mische(essen.filter((e) => e !== ziel)).slice(0, proTisch - 1)]);
      runde.ersterVersuch = true;
      let s = `<rect width="1000" height="560" fill="#fff4dc"/><rect y="400" width="1000" height="160" fill="#e9c48f"/>
        <g class="en-rocco-isst"><g transform="translate(210 470) scale(1.55)">${A().rocco("steh", laune)}</g></g>
        <rect x="400" y="350" width="560" height="22" rx="8" fill="#e8543f"/><rect x="420" y="372" width="16" height="150" fill="#b23a34"/><rect x="924" y="372" width="16" height="150" fill="#b23a34"/>`;
      tisch.forEach((e, i) => {
        const x = 470 + i * (420 / Math.max(1, proTisch - 1));
        s += `<g class="en-essen" data-essen="${e.id}" tabindex="0" role="button" aria-label="${e.id}">${flaeche(x - 64, 200, 128, 150)}<ellipse cx="${x}" cy="346" rx="58" ry="10" fill="#ffffff" opacity="0.7"/>${dingBild(e.id, x, 280, 56)}</g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-fuettern-svg"));
      o.extra.append(zeigeKnoten);
      k.sage(ziel.will);
      svg.querySelectorAll("[data-essen]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei) return;
        const e = I.ESSEN.find((x) => x.id === kn.dataset.essen);
        const w = k.stand().wortVon(e.id);
        if (e === ziel) {
          kn.classList.add("en-zu-rocco");
          k.stand().erkannt(e.id, runde.ersterVersuch);
          k.kids()?.playJingle?.("correct");
          runde.i += 1;
          zeige(runde.i);
          k.sage([I.SAETZE.lecker, [w.en, w.de]], { danach: () => {
            if (!nochAktiv(k, runde)) return;
            if (runde.i < anzahl) { naechster("freude"); return; }
            runde.vorbei = true;
            k.rundeFertig("fuettern", { satz: I.SAETZE.satt, nochmal: () => fuettern(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          if (runde.ersterVersuch) k.stand().erkannt(ziel.id, false);
          runde.ersterVersuch = false;
          k.stand().gehoert(e.id);
          k.kids()?.playJingle?.("retry");
          k.sage([[w.en, w.de], I.SAETZE.neinDanke, ziel.will]);
        }
      }));
    };
    k.sage(I.SAETZE.fuettern, { danach: () => naechster() });
  }

  // ===========================================================================
  // Die Jukebox: ein Vers
  // ===========================================================================
  function verse(k, { vers: id } = {}) {
    const I = k.inhalt();
    const o = k.offen();
    const v = I.VERSE.find((x) => x.id === id) || I.VERSE[0];
    o.ansicht = "verse";
    const runde = { gehoert: new Set(), gezaehlt: false };
    o.runde = runde;
    const schrift = Boolean(k.stand().schriftZeigen?.());
    const zeilenH = Math.min(104, 470 / v.zeilen.length);
    let s = `<rect width="1000" height="560" fill="#f3ecff"/>
      <g class="en-vers-titel" data-verstitel="1" tabindex="0" role="button"><rect x="250" y="16" width="500" height="54" rx="27" fill="#6c5ce7"/><text x="500" y="52" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="${v.titel[0].length > 26 ? 22 : 28}" fill="#ffffff">${v.titel[0]}</text></g>`;
    v.zeilen.forEach((zl, i) => {
      const y = 84 + i * zeilenH;
      const bilder = zl.bild.length ? zl.bild : ["rocco"];
      const r = Math.min(48, zeilenH * 0.5);
      s += `<g class="en-zeile" data-zeile="${i}" tabindex="0" role="button" aria-label="${zl.en}">
        <rect x="40" y="${y}" width="920" height="${zeilenH - 10}" rx="20" fill="#ffffff" stroke="#e2d8fb" stroke-width="3"/>
        <g class="en-zeile-bild">${bilder.slice(0, 5).map((b, j) => dingBild(b, 96 + j * (r * 1.5), y + (zeilenH - 10) / 2, r)).join("")}</g>
        <text x="${120 + Math.min(5, bilder.length) * r * 1.5}" y="${y + (zeilenH - 10) / 2 + 9}" font-family="${SCHRIFT}" font-weight="800" font-size="${zl.en.length > 44 ? 22 : 26}" fill="${schrift ? "#243047" : "#a8a0c4"}">${schrift ? zl.en : "♪ ♪ ♪"}</text>
      </g>`;
    });
    const svg = k.setzeBild(svgVon(s, "en-vers-svg"));
    k.hilfe("vers");
    const zeilen = [...svg.querySelectorAll("[data-zeile]")];
    const markiere = (i) => zeilen.forEach((z, j) => z.classList.toggle("ist-aktiv", j === i));
    const zaehle = () => {
      if (runde.gezaehlt || runde.gehoert.size < v.zeilen.length) return;
      runde.gezaehlt = true;
      k.stand().runde("verse");
      k.rundeZaehlt("verse", v.id);
    };
    svg.querySelector("[data-verstitel]")?.addEventListener("click", () => k.sage(v.titel));
    zeilen.forEach((kn, i) => k.antippbar(kn, () => {
      markiere(i);
      k.animiere(kn.querySelector(".en-zeile-bild"), "en-huepf", 600);
      k.sage([v.zeilen[i].en, v.zeilen[i].de], { danach: () => { runde.gehoert.add(i); zaehle(); } });
    }));
    const ganz = () => {
      const paare = [v.titel, ...v.zeilen.map((zl) => [zl.en, zl.de])];
      k.sage(paare, {
        beiJedem: (_, j) => { if (j >= 1) { markiere(j - 1); k.animiere(zeilen[j - 1].querySelector(".en-zeile-bild"), "en-huepf", 600); } },
        danach: () => { v.zeilen.forEach((_, i) => runde.gehoert.add(i)); zaehle(); markiere(-1); k.kids()?.playJingle?.("unlock"); },
      });
    };
    k.leistenKnopf([v.titel[0], v.titel[1]], ganz);
    ganz();
  }

  // ===========================================================================
  // Ein Buch aus dem Lesewagen, auf Englisch
  // ===========================================================================
  function buch(k, { buch: id } = {}) {
    const I = k.inhalt();
    const o = k.offen();
    const b = I.BUECHER.find((x) => x.id === id) || I.BUECHER[0];
    o.ansicht = "buch";
    const runde = { seite: 0, gehoert: new Set(), gezaehlt: false };
    o.runde = runde;
    const schrift = Boolean(k.stand().schriftZeigen?.());
    k.hilfe("buch");
    const zaehle = () => {
      if (runde.gezaehlt || runde.gehoert.size < b.seiten.length) return;
      runde.gezaehlt = true;
      k.stand().buchGehoert(b.id);
      k.rundeZaehlt("buch", b.id);
      k.kids()?.playJingle?.("unlock");
    };
    const zeichne = () => {
      const i = runde.seite;
      const [en] = b.seiten[i];
      const nr = String(i + 1).padStart(2, "0");
      const s = `<rect width="1000" height="560" fill="#fff6e6"/>
        <g class="en-buchseite" data-seite="${i}" tabindex="0" role="button" aria-label="${en}">
          <rect x="142" y="14" width="716" height="456" rx="20" fill="#ffffff" stroke="#e1d9c6" stroke-width="3"/>
          <image href="bilder/buecher/${b.id}/seite-${nr}.webp" x="150" y="22" width="700" height="440" preserveAspectRatio="xMidYMid slice"/>
        </g>
        <text x="500" y="514" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="${en.length > 48 ? 21 : 26}" fill="${schrift ? "#243047" : "#9aa0ab"}">${schrift ? en : "♪ ♪ ♪"}</text>
        <g class="en-seitenpunkte">${b.seiten.map((_, j) => `<circle cx="${500 - (b.seiten.length - 1) * 11 + j * 22}" cy="546" r="6" fill="${j === i ? "#3a7bd5" : "#d9d2c3"}"/>`).join("")}</g>
        ${i > 0 ? `<g class="en-blaettern" data-blaettern="-1" tabindex="0" role="button" aria-label="Zurückblättern"><circle cx="70" cy="244" r="50" fill="#3a7bd5"/><path d="M84 214 L54 244 L84 274" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` : ""}
        ${i < b.seiten.length - 1 ? `<g class="en-blaettern" data-blaettern="1" tabindex="0" role="button" aria-label="Weiterblättern"><circle cx="930" cy="244" r="50" fill="#3a7bd5"/><path d="M916 214 L946 244 L916 274" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` : ""}`;
      const svg = k.setzeBild(svgVon(s, "en-buch-svg"), { weiter: true });
      o.extra.append(knopf);
      const seite = () => k.sage(b.seiten[runde.seite], { danach: () => { runde.gehoert.add(runde.seite); zaehle(); } });
      svg.querySelector("[data-seite]")?.addEventListener("click", seite);
      svg.querySelectorAll("[data-blaettern]").forEach((kn) => k.antippbar(kn, () => {
        runde.seite = Math.max(0, Math.min(b.seiten.length - 1, runde.seite + Number(kn.dataset.blaettern)));
        k.kids()?.playStarSound?.(1);
        zeichne();
        seite();
      }));
      return seite;
    };
    // Das ganze Buch: Seite für Seite, und es blättert mit.
    const ganz = () => {
      runde.seite = 0;
      zeichne();
      k.sage([b.titel, ...b.seiten], {
        beiJedem: (_, j) => { if (j >= 1 && j - 1 !== runde.seite) { runde.seite = j - 1; zeichne(); } },
        danach: () => { b.seiten.forEach((_, j) => runde.gehoert.add(j)); zaehle(); },
      });
    };
    k.leistenKnopf(I.SAETZE.ganzesBuch, ganz);
    const knopf = o.extra.lastChild;
    zeichne();
    k.sage([I.SAETZE.buch, b.titel], { danach: () => k.sage(b.seiten[0], { danach: () => { runde.gehoert.add(0); zaehle(); } }) });
  }

  window.LernappEnglischSpiele = {
    memory, janein, roccosays, farbenzug, zaehlen, fuettern, verse, buch, spielBild, versBild, ballon, dingBild,
    // Für weitere Spiele (englisch-spiele-3.js …)
    SPIEL_BILDER,
    hilfen: { mische, zufall, dingBild, ballon, farbWagen, roccoLok, daumen, lautsprecher, flaeche, punkte, lobPaar, svgVon, nochAktiv, SCHRIFT, DUNKEL },
  };
  farbenUndZahlenZeichnen();
})();
