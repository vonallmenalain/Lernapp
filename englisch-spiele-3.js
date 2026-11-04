/*
 * englisch-spiele-3.js – Die Spiele der Englischecke aus Etappe 3.
 *
 * Wie englisch-spiele.js: jede Funktion (kern, optionen), aufgerufen von
 * train-englischecke.js (starteSpiel); sie legen sich zu
 * window.LernappEnglischSpiele dazu.
 *
 *   whatsmissing    What's missing?: ein Wimmelbild, ein Ding verschwindet
 *   dressup         Dress up: «Put on the scarf!» – Rocco anziehen
 *   geschichtenzug  Story train: die Bilder einer Geschichte der Reihe nach
 *   diner           Roccos Diner: Gäste bestellen, das Kind serviert
 *   telefon         Das Hello-Telefon: Rocco ruft an, das Kind antwortet
 *   echo            Echo: ein Wort hören, selbst sagen, sich anhören – die
 *                   Aufnahme bleibt im Gerät, nichts wird gespeichert
 *   post            Post aus Amerika: Postkarten von Cousine Ruby
 *
 * Kein Minus, keine Uhr; ein falscher Tipp sagt, was es war, und fragt noch
 * einmal. DE sagt das zuletzt Gesagte auf Deutsch, dann noch einmal Englisch.
 */
(() => {
  "use strict";

  const S = window.LernappEnglischSpiele;
  if (!S?.hilfen) return;
  const { mische, zufall, dingBild, roccoLok, flaeche, punkte, lobPaar, svgVon, nochAktiv, SCHRIFT } = S.hilfen;
  const A = () => window.LernappEnglischArt;
  const POST_KEY = "lernapp.englisch.post";
  const lies = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } };
  const merke = (key, wert) => { try { localStorage.setItem(key, JSON.stringify(wert)); } catch { /* privater Modus */ } };
  const wortVon = (k, id) => k.stand().wortVon(id);

  // Eine Welt, deren Wörter das Kind schon kennt (sonst die erste).
  function bekannteWelt(k) {
    const s = k.stand();
    const welten = k.inhalt().WELTEN;
    const bekannt = welten.filter((w) => w.woerter.filter((x) => s.wortStand(x.id) !== "zu").length >= 4);
    return zufall(bekannt.length ? bekannt : welten.slice(0, 3));
  }

  // ===========================================================================
  // What's missing?
  // ===========================================================================
  function whatsmissing(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "whatsmissing";
    const welt = bekannteWelt(k);
    const anzahl = 4;
    const runde = { i: 0, ersterVersuch: true, schon: new Set() };
    o.runde = runde;
    k.hilfe("whatsmissing");
    const zeige = punkte(k, anzahl);
    const zeigeKnoten = o.extra.lastChild;
    const frage = () => {
      const ziel = zufall(welt.woerter.filter((w) => !runde.schon.has(w.id)));
      runde.schon.add(ziel.id);
      runde.ersterVersuch = true;
      const andere = mische(welt.woerter.filter((w) => w.id !== ziel.id)).slice(0, 2);
      const wahl = mische([ziel, ...andere]);
      const szene = A().szene(welt.id).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
      let s = `${szene}<rect class="en-vorhang" width="1000" height="560" fill="#243047" opacity="0" pointer-events="none"/>
        <g class="en-fehlt-wahl" style="display:none"><rect x="230" y="420" width="540" height="132" rx="26" fill="#ffffff" opacity="0.96" stroke="#e1d9c6" stroke-width="3"/>`;
      wahl.forEach((w, i) => {
        const x = 330 + i * 170;
        s += `<g class="en-fehlt-option" data-option="${w.id}" tabindex="0" role="button" aria-label="${w.en} – ${w.de}">${flaeche(x - 70, 424, 140, 124)}${A().sticker(w.id, x, 486, 52, "gehoert")}</g>`;
      });
      s += `</g>`;
      const svg = k.setzeBild(svgVon(s, "en-szene-svg en-fehlt-svg"));
      o.extra.append(zeigeKnoten);
      // Im Bild darf man tippen und hören, solange alles da ist.
      svg.querySelectorAll("[data-ding]").forEach((kn) => k.antippbar(kn, () => {
        const w = welt.woerter.find((x) => x.id === kn.dataset.ding);
        if (w && !runde.versteckt) { k.animiere(kn, "en-wackel"); k.sage([w.en, w.de]); }
      }));
      const vorhang = svg.querySelector(".en-vorhang");
      const optionen = svg.querySelector(".en-fehlt-wahl");
      const verstecke = () => {
        if (!nochAktiv(k, runde)) return;
        k.sage(I.SAETZE.augenZu, { danach: () => {
          if (!nochAktiv(k, runde)) return;
          vorhang.setAttribute("opacity", "1");
          window.setTimeout(() => {
            if (!nochAktiv(k, runde)) return;
            runde.versteckt = true;
            svg.querySelector(`[data-ding="${ziel.id}"]`)?.setAttribute("style", "display:none");
            vorhang.setAttribute("opacity", "0");
            optionen.style.display = "";
            k.sage(I.SAETZE.wasFehlt);
          }, 900);
        } });
      };
      runde.versteckt = false;
      k.sage(I.SAETZE.schauGut, { danach: () => window.setTimeout(verstecke, 2600) });
      svg.querySelectorAll("[data-option]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || !runde.versteckt || runde.vorbei) return;
        const w = wortVon(k, kn.dataset.option);
        if (w.id === ziel.id) {
          svg.querySelector(`[data-ding="${ziel.id}"]`)?.removeAttribute("style");
          k.animiere(svg.querySelector(`[data-ding="${ziel.id}"]`), "en-huepf");
          k.stand().erkannt(ziel.id, runde.ersterVersuch);
          k.kids()?.playJingle?.("correct");
          runde.i += 1;
          zeige(runde.i);
          k.sage([lobPaar(k), [ziel.en, ziel.de]], { danach: () => {
            if (!nochAktiv(k, runde)) return;
            if (runde.i < anzahl) { window.setTimeout(frage, 700); return; }
            runde.vorbei = true;
            k.rundeFertig("whatsmissing", { nochmal: () => whatsmissing(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          if (runde.ersterVersuch) k.stand().erkannt(ziel.id, false);
          runde.ersterVersuch = false;
          k.kids()?.playJingle?.("retry");
          k.sage([[w.en, w.de], I.SAETZE.wasFehlt]);
        }
      }));
    };
    frage();
  }

  // ===========================================================================
  // Dress up
  // ===========================================================================
  function dressup(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "dressup";
    const kleider = (A().ROCCO_KLEIDER || {});
    // Hut oder Partyhut – beide zusammen stapeln sich nur.
    const ohneHut = mische(["hat", "partyhat"])[0];
    const alle = mische(I.KLEIDER.filter((x) => kleider[x.id] && wortVon(k, x.id) && x.id !== ohneHut));
    // Angezogen wird von unten nach oben: so liegt die Sonnenbrille unter dem Hut.
    const SCHICHT = ["boots", "scarf", "bowtie", "sunglasses", "hat", "partyhat"];
    const anzahl = Math.min(alle.length, k.stufe() === "leicht" ? 4 : alle.length);
    const runde = { an: [], ersterVersuch: true };
    o.runde = runde;
    k.hilfe("dressup");
    const zeige = punkte(k, anzahl);
    const zeigeKnoten = o.extra.lastChild;
    let ziel = null;
    const zeichne = () => {
      const roccoBild = `${A().rocco("steh", runde.an.length ? "freude" : "froh")}${[...runde.an].sort((p, q) => SCHICHT.indexOf(p.id) - SCHICHT.indexOf(q.id)).map((x) => kleider[x.id]()).join("")}`;
      let s = `<rect width="1000" height="560" fill="#f3ecff"/><rect y="470" width="1000" height="90" fill="#d9cbb4"/>
        <ellipse cx="290" cy="520" rx="140" ry="20" fill="#000000" opacity="0.08"/>
        <g class="en-rocco-gross" data-rocco="1"><g transform="translate(290 520) scale(2.5)">${roccoBild}</g></g>
        <rect x="560" y="60" width="400" height="12" rx="6" fill="#8a5a35"/><rect x="566" y="72" width="10" height="398" fill="#8a5a35"/><rect x="944" y="72" width="10" height="398" fill="#8a5a35"/>`;
      alle.slice(0, anzahl).forEach((x, i) => {
        if (runde.an.includes(x)) return;
        const cx = 660 + (i % 2) * 200;
        const cy = 150 + Math.floor(i / 2) * 120;
        s += `<g class="en-kleid" data-kleid="${x.id}" tabindex="0" role="button" aria-label="${wortVon(k, x.id).en}">${flaeche(cx - 80, cy - 55, 160, 110)}<path d="M${cx} ${cy - 56} l0 -10" stroke="#8a5a35" stroke-width="3"/>${dingBild(x.id, cx, cy, 46)}</g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-dressup-svg"));
      o.extra.append(zeigeKnoten);
      svg.querySelector("[data-rocco]")?.addEventListener("click", () => { if (ziel) k.sage(ziel.anziehen); });
      svg.querySelectorAll("[data-kleid]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei || !ziel) return;
        const x = I.KLEIDER.find((y) => y.id === kn.dataset.kleid);
        const w = wortVon(k, x.id);
        if (x === ziel) {
          k.stand().erkannt(x.id, runde.ersterVersuch);
          runde.an.push(x);
          zeige(runde.an.length);
          k.kids()?.playJingle?.("correct");
          zeichne();
          k.sage([lobPaar(k), [w.en, w.de]], { danach: () => {
            if (!nochAktiv(k, runde)) return;
            if (runde.an.length < anzahl) { naechster(); return; }
            runde.vorbei = true;
            k.rundeFertig("dressup", { satz: I.SAETZE.schick, nochmal: () => dressup(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          if (runde.ersterVersuch) k.stand().erkannt(ziel.id, false);
          runde.ersterVersuch = false;
          k.stand().gehoert(x.id);
          k.kids()?.playJingle?.("retry");
          k.sage([[w.en, w.de], ziel.anziehen]);
        }
      }));
    };
    const naechster = () => {
      ziel = zufall(alle.slice(0, anzahl).filter((x) => !runde.an.includes(x)));
      runde.ersterVersuch = true;
      k.sage(ziel.anziehen);
    };
    zeichne();
    k.sage(I.SAETZE.anziehen, { danach: naechster });
  }

  // ===========================================================================
  // Story train: die Bilder einer Geschichte in die richtige Reihenfolge
  // ===========================================================================
  function geschichtenzug(k, { geschichte: id = null } = {}) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "geschichtenzug";
    const gehoert = k.stand().stand().geschichten || {};
    const bekannt = I.GESCHICHTEN.filter((g) => gehoert[g.id]);
    const g = I.GESCHICHTEN.find((x) => x.id === id) || zufall(bekannt.length ? bekannt : I.GESCHICHTEN);
    const reihe = mische(g.bilder.map((_, i) => i));
    if (reihe.every((x, i) => x === i)) reihe.reverse();
    const runde = { naechstes: 0, ersterVersuch: true };
    o.runde = runde;
    k.hilfe("geschichtenzug");
    const zeige = punkte(k, g.bilder.length);
    const zeigeKnoten = o.extra.lastChild;
    const panel = (i, x, y, b) => `<g transform="translate(${x} ${y}) scale(${(b / 472).toFixed(4)})"><rect width="472" height="204" rx="18" fill="#ffffff"/>${A().geschichtsBild(g.id, i)}<rect width="472" height="204" rx="18" fill="none" stroke="#e1d9c6" stroke-width="6"/></g>`;
    const zeichne = (fahrt = false) => {
      const b = 176;
      let s = `<rect width="1000" height="560" fill="#fdf1e2"/><rect x="0" y="262" width="1000" height="10" fill="#8a8f99"/>
        <g class="en-zug${fahrt ? " en-zug-faehrt" : ""}"><g transform="translate(0 6) scale(0.92)">${roccoLok(8, 270)}</g>`;
      for (let i = 0; i < g.bilder.length; i += 1) {
        const x = 160 + i * (b + 30);
        s += `<rect x="${x - 6}" y="160" width="${b + 12}" height="88" rx="12" fill="${i < runde.naechstes ? "#6c5ce7" : "#ffffff"}" stroke="#c9bfe8" stroke-width="3" stroke-dasharray="${i < runde.naechstes ? "0" : "8 6"}"/>
          <circle cx="${x + 30}" cy="258" r="12" fill="#2b2f38"/><circle cx="${x + b - 30}" cy="258" r="12" fill="#2b2f38"/>`;
        if (i < runde.naechstes) s += panel(i, x, 166, b);
      }
      s += `</g>`;
      reihe.forEach((i, j) => {
        if (i < runde.naechstes) return;
        const x = 40 + j * 240;
        s += `<g class="en-bildwagen" data-bild="${i}" tabindex="0" role="button" aria-label="${g.bilder[i].en}">${flaeche(x - 6, 324, 232, 112)}${panel(i, x, 330, 220)}</g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-geschichtenzug-svg"));
      o.extra.append(zeigeKnoten);
      svg.querySelectorAll("[data-bild]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei) return;
        const i = Number(kn.dataset.bild);
        if (i === runde.naechstes) {
          k.kids()?.playJingle?.("correct");
          runde.naechstes += 1;
          zeige(runde.naechstes);
          zeichne();
          k.sage([g.bilder[i].en, g.bilder[i].de], { danach: () => {
            if (!nochAktiv(k, runde) || runde.naechstes < g.bilder.length) return;
            runde.vorbei = true;
            zeichne(true);
            k.rundeFertig("geschichtenzug", { nochmal: () => geschichtenzug(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          k.kids()?.playJingle?.("retry");
          k.sage([[g.bilder[i].en, g.bilder[i].de], I.SAETZE.wasDann]);
        }
      }));
    };
    zeichne();
    k.sage([I.SAETZE.ordnen, g.titel]);
  }

  // ===========================================================================
  // Roccos Diner
  // ===========================================================================
  function diner(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "diner";
    const st = k.stufe();
    const anzahl = st === "leicht" ? 4 : 5;
    const gaeste = mische(I.DINER_GAESTE.filter((id) => A().DING[id]));
    const essen = I.DINER_ESSEN.filter((id) => A().DING[id] && wortVon(k, id));
    const paare = I.DINER_PAARE.filter(([p, q]) => essen.includes(p) && essen.includes(q));
    const runde = { i: 0, ersterVersuch: true };
    o.runde = runde;
    k.hilfe("diner");
    const zeige = punkte(k, anzahl);
    const zeigeKnoten = o.extra.lastChild;
    const naechster = () => {
      const gast = gaeste[runde.i % gaeste.length];
      const zwei = st === "schwer" || (st === "mittel" && runde.i % 2 === 1);
      const bestellt = zwei && paare.length ? zufall(paare) : [zufall(essen)];
      const satz = bestellt.length === 2 ? I.dinerPaar(...bestellt) : [I.bitte(wortVon(k, bestellt[0]).en), I.deBitte(wortVon(k, bestellt[0]).de)];
      const theke = mische([...bestellt, ...mische(essen.filter((id) => !bestellt.includes(id))).slice(0, 5 - bestellt.length)]);
      const tablett = [];
      runde.ersterVersuch = true;
      const zeichne = () => {
        let s = `<rect width="1000" height="560" fill="#e9f7f6"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 100}" y="0" width="50" height="40" fill="#e8543f"/><rect x="${i * 100 + 50}" y="0" width="50" height="40" fill="#ffffff"/>`).join("")}
          <rect x="0" y="300" width="1000" height="260" fill="#c8423b"/><rect x="0" y="292" width="1000" height="18" rx="6" fill="#d6dbe3"/>
          <g transform="translate(150 300) scale(1.2)">${A().rocco("steh", "froh")}</g>
          <g class="en-gast" data-gast="1"><g transform="translate(830 250) scale(1.25)">${A().DING[gast]()}</g></g>
          <rect x="690" y="300" width="270" height="20" rx="8" fill="#b0b7c3"/>${tablett.map((id, i) => dingBild(id, 760 + i * 120, 262, 40)).join("")}`;
        theke.forEach((id, i) => {
          if (tablett.includes(id)) return;
          const x = 300 + i * 92;
          s += `<g class="en-essen" data-essen="${id}" tabindex="0" role="button" aria-label="${wortVon(k, id).en}">${flaeche(x - 44, 380, 88, 120)}<ellipse cx="${x}" cy="486" rx="40" ry="8" fill="#ffffff" opacity="0.7"/>${dingBild(id, x, 436, 40)}</g>`;
        });
        const svg = k.setzeBild(svgVon(s, "en-diner-svg"), { weiter: true });
        o.extra.append(zeigeKnoten);
        svg.querySelector("[data-gast]")?.addEventListener("click", () => k.sage(satz));
        svg.querySelectorAll("[data-essen]").forEach((kn) => k.antippbar(kn, () => {
          if (!nochAktiv(k, runde) || runde.vorbei) return;
          const id = kn.dataset.essen;
          const w = wortVon(k, id);
          if (bestellt.includes(id) && !tablett.includes(id)) {
            tablett.push(id);
            k.stand().erkannt(id, runde.ersterVersuch);
            k.kids()?.playStarSound?.(tablett.length);
            zeichne();
            if (tablett.length < bestellt.length) { k.sage([w.en, w.de]); return; }
            runde.i += 1;
            zeige(runde.i);
            k.kids()?.playJingle?.("correct");
            k.sage([[w.en, w.de], I.SAETZE.danke, I.SAETZE.gernGeschehen], { danach: () => {
              if (!nochAktiv(k, runde)) return;
              if (runde.i < anzahl) { naechster(); return; }
              runde.vorbei = true;
              k.rundeFertig("diner", { satz: I.SAETZE.dinerZu, nochmal: () => diner(k) });
            } });
          } else {
            k.animiere(kn, "en-schuettel", 500);
            runde.ersterVersuch = false;
            k.stand().gehoert(id);
            k.kids()?.playJingle?.("retry");
            k.sage([[w.en, w.de], satz]);
          }
        }));
      };
      zeichne();
      k.sage(satz);
    };
    k.sage(I.SAETZE.diner, { danach: naechster });
  }

  // ===========================================================================
  // Das Hello-Telefon
  // ===========================================================================
  function gesicht(art, x, y, r = 46) {
    const augen = art === "muede"
      ? `<path d="M${x - r * 0.42} ${y - r * 0.12} q${r * 0.16} ${r * 0.14} ${r * 0.32} 0 M${x + r * 0.1} ${y - r * 0.12} q${r * 0.16} ${r * 0.14} ${r * 0.32} 0" stroke="#2b2f38" stroke-width="${r * 0.08}" fill="none" stroke-linecap="round"/>`
      : `<circle cx="${x - r * 0.3}" cy="${y - r * 0.15}" r="${r * 0.09}" fill="#2b2f38"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.15}" r="${r * 0.09}" fill="#2b2f38"/>`;
    const mund = art === "froh" ? `<path d="M${x - r * 0.38} ${y + r * 0.2} q${r * 0.38} ${r * 0.4} ${r * 0.76} 0" stroke="#2b2f38" stroke-width="${r * 0.09}" fill="none" stroke-linecap="round"/>`
      : art === "traurig" ? `<path d="M${x - r * 0.32} ${y + r * 0.42} q${r * 0.32} ${-r * 0.3} ${r * 0.64} 0" stroke="#2b2f38" stroke-width="${r * 0.09}" fill="none" stroke-linecap="round"/><ellipse cx="${x + r * 0.42}" cy="${y + r * 0.1}" rx="${r * 0.07}" ry="${r * 0.13}" fill="#4fc3f7"/>`
        : `<ellipse cx="${x}" cy="${y + r * 0.3}" rx="${r * 0.14}" ry="${r * 0.1}" fill="#2b2f38"/><text x="${x + r * 0.6}" y="${y - r * 0.5}" font-family="${SCHRIFT}" font-weight="800" font-size="${r * 0.5}" fill="#6c5ce7">z</text>`;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd23f"/>${augen}${mund}`;
  }
  function antwortBild(art, x, y, id) {
    if (art === "gefuehl") return gesicht(id, x, y, 46);
    if (art === "zahl") return `<circle cx="${x}" cy="${y}" r="46" fill="#6c5ce7"/><text x="${x}" y="${y + 20}" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="56" fill="#ffffff">${id.slice(1)}</text>`;
    if (art === "farbe") return S.ballon(window.LernappEnglischInhalt.FARBEN.find((f) => f.id === id)?.hex || "#cccccc", x, y - 6, 40);
    if (art === "tier") return A().sticker(id, x, y, 46, "gehoert");
    return `<g transform="translate(${x} ${y + 60}) scale(0.62)">${A().rocco("wink", "freude")}</g>`;
  }
  function telefon(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "telefon";
    const runde = { schritt: 0 };
    o.runde = runde;
    k.hilfe("telefon");
    const zeige = punkte(k, I.TELEFON.length);
    const zeigeKnoten = o.extra.lastChild;
    const schritt = () => {
      const t = I.TELEFON[runde.schritt];
      const n = t.antworten.length;
      const spalten = n > 3 ? 3 : n;
      let s = `<rect width="1000" height="560" fill="#e9f4ff"/>
        <rect x="40" y="60" width="300" height="430" rx="30" fill="#ffffff" stroke="#d6e6f5" stroke-width="4"/>
        <g transform="translate(190 430) scale(1.5)">${A().rocco("steh", "froh")}</g>
        <g transform="translate(232 250)"><rect x="-10" y="-34" width="22" height="68" rx="10" fill="#e8543f" transform="rotate(-18)"/></g>
        <path d="M340 140 q30 -16 60 0 M350 116 q40 -24 80 0" stroke="#3a7bd5" stroke-width="6" fill="none" stroke-linecap="round" class="en-klingel"/>`;
      t.antworten.forEach((x, i) => {
        const cx = 520 + (i % spalten) * 160 + (spalten < 3 ? 80 * (3 - spalten) : 0);
        const cy = 170 + Math.floor(i / spalten) * 170;
        s += `<g class="en-antwort" data-antwort="${x.id}" tabindex="0" role="button" aria-label="${x.satz[0]} – ${x.satz[1]}">
          <rect x="${cx - 70}" y="${cy - 70}" width="140" height="140" rx="26" fill="#ffffff" stroke="#d6e6f5" stroke-width="4"/>${antwortBild(t.art, cx, cy, x.id)}</g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-telefon-svg"));
      o.extra.append(zeigeKnoten);
      k.sage(t.frage);
      svg.querySelectorAll("[data-antwort]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei || runde.spricht) return;
        const x = t.antworten.find((y) => y.id === kn.dataset.antwort);
        if (t.art === "farbe") k.stand().gehoert(x.id);
        if (t.art === "tier") k.stand().gehoert(x.id);
        k.animiere(kn, "en-huepf");
        runde.spricht = true;
        // Erst das Vorbild («I'm fine, thank you!»), dann «Now you say it!»,
        // eine kleine Pause zum Nachsprechen, dann Roccos Antwort.
        k.sage([x.satz, I.SAETZE.jetztDu], { danach: () => window.setTimeout(() => {
          if (!nochAktiv(k, runde)) return;
          k.sage(x.antwort || I.SAETZE.danke, { danach: () => {
            runde.spricht = false;
            if (!nochAktiv(k, runde)) return;
            runde.schritt += 1;
            zeige(runde.schritt);
            if (runde.schritt < I.TELEFON.length) { schritt(); return; }
            runde.vorbei = true;
            k.stand().runde("telefon");
            k.rundeZaehlt("telefon");
            k.kids()?.playJingle?.("unlock");
            k.leistenKnopf(I.SAETZE.nochmal, () => k.starteSpiel?.("telefon"), { symbol: "nochmal" });
          } });
        }, 1800) });
      }));
    };
    schritt();
  }

  // ===========================================================================
  // Echo: hören, nachsprechen, sich selbst anhören
  // ===========================================================================
  function echo(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "echo";
    const woerter = k.spielWoerter(5);
    const runde = { i: 0, gezaehlt: false };
    o.runde = runde;
    k.hilfe("echo");
    const zeige = punkte(k, woerter.length);
    const zeigeKnoten = o.extra.lastChild;
    const kannAufnehmen = () => Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
    let strom = null;
    const aufraeumen = () => { try { strom?.getTracks().forEach((t) => t.stop()); } catch { /* egal */ } strom = null; };
    const wort = () => {
      const w = woerter[runde.i];
      const s = `<rect width="1000" height="560" fill="#fff4dc"/>
        <rect x="300" y="30" width="400" height="330" rx="30" fill="#ffffff" stroke="#e1d9c6" stroke-width="4"/>
        <g class="en-echo-bild" data-bild="1" tabindex="0" role="button" aria-label="${w.en}">${flaeche(300, 30, 400, 330)}${dingBild(w.id, 500, 195, 110)}</g>
        <g class="en-mikrofon" data-mikrofon="1" tabindex="0" role="button" aria-label="Mikrofon: selbst sagen">
          <circle cx="500" cy="462" r="66" fill="#e8543f"/><rect x="482" y="420" width="36" height="58" rx="18" fill="#ffffff"/>
          <path d="M466 462 a34 34 0 0 0 68 0 M500 496 v18 M482 516 h36" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round"/></g>
        <g class="en-blaettern" data-weiter="1" tabindex="0" role="button" aria-label="Nächstes Wort"><circle cx="880" cy="462" r="50" fill="#3a7bd5"/><path d="M866 432 L896 462 L866 492" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      const svg = k.setzeBild(svgVon(s, "en-echo-svg"));
      o.extra.append(zeigeKnoten);
      k.stand().gehoert(w.id);
      k.sage([w.en, w.de]);
      svg.querySelector("[data-bild]")?.addEventListener("click", () => k.sage([w.en, w.de]));
      const mikro = svg.querySelector("[data-mikrofon]");
      k.antippbar(mikro, async () => {
        if (!nochAktiv(k, runde) || runde.nimmtAuf) return;
        if (!kannAufnehmen()) { k.sage(I.SAETZE.mikrofonAus); return; }
        runde.nimmtAuf = true;
        k.still();
        try {
          strom = await navigator.mediaDevices.getUserMedia({ audio: true });
          const teile = [];
          const rec = new MediaRecorder(strom);
          rec.ondataavailable = (e) => { if (e.data?.size) teile.push(e.data); };
          rec.onstop = () => {
            aufraeumen();
            runde.nimmtAuf = false;
            mikro.classList.remove("ist-aufnahme");
            if (!nochAktiv(k, runde) || !teile.length) return;
            const url = URL.createObjectURL(new Blob(teile, { type: rec.mimeType || "audio/webm" }));
            k.sage(I.SAETZE.echoHoer, { danach: () => {
              const ton = new Audio(url);
              const fertig = () => { URL.revokeObjectURL(url); if (nochAktiv(k, runde)) k.sage([w.en, w.de]); };
              ton.addEventListener("ended", fertig, { once: true });
              ton.addEventListener("error", fertig, { once: true });
              ton.play().catch(fertig);
            } });
          };
          mikro.classList.add("ist-aufnahme");
          rec.start();
          window.setTimeout(() => { try { if (rec.state !== "inactive") rec.stop(); } catch { aufraeumen(); } }, 2200);
        } catch {
          aufraeumen();
          runde.nimmtAuf = false;
          k.sage(I.SAETZE.mikrofonAus);
        }
      });
      k.antippbar(svg.querySelector("[data-weiter]"), () => {
        if (!nochAktiv(k, runde) || runde.nimmtAuf) return;
        runde.i += 1;
        zeige(runde.i);
        if (runde.i < woerter.length) { wort(); return; }
        if (runde.gezaehlt) return;
        runde.gezaehlt = true;
        k.rundeFertig("echo", { nochmal: () => echo(k) });
      });
    };
    k.sage(I.SAETZE.echo, { danach: wort });
  }

  // ===========================================================================
  // Post aus Amerika
  // ===========================================================================
  // Welche Karten schon da sind: eine neue alle paar Runden (POSTKARTEN.ab).
  function postDa(k) {
    const n = k.stand().runden();
    return k.inhalt().POSTKARTEN.filter((p) => n >= p.ab && A().POSTKARTEN?.[p.id]);
  }
  function postNeu(k) {
    const gelesen = lies(POST_KEY, []);
    return postDa(k).some((p) => !gelesen.includes(p.id));
  }
  function post(k, { karte: id = null } = {}) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "post";
    o.runde = { post: true };
    k.hilfe("post");
    const da = postDa(k);
    if (!da.length) { k.sage(I.SAETZE.keinePost); return; }
    const gelesen = lies(POST_KEY, []);
    const karte = da.find((p) => p.id === id) || da.find((p) => !gelesen.includes(p.id)) || da[da.length - 1];
    merke(POST_KEY, [...new Set([...gelesen, karte.id])]);
    const schrift = Boolean(k.stand().schriftZeigen?.());
    const zeilen = [];
    if (schrift) {
      // Der Text auf der Rückseite, in kurzen Zeilen.
      let zeile = "";
      karte.text[0].split(" ").forEach((wortStueck) => {
        if ((zeile + wortStueck).length > 22) { zeilen.push(zeile.trim()); zeile = ""; }
        zeile += `${wortStueck} `;
      });
      if (zeile.trim()) zeilen.push(zeile.trim());
    }
    let s = `<rect width="1000" height="560" fill="#dff1fb"/>
      <g class="en-postkarte" data-postkarte="1" tabindex="0" role="button" aria-label="${karte.text[0]}">
        <g transform="translate(30 50) rotate(-2)"><rect width="580" height="368" rx="10" fill="#ffffff" stroke="#d6dbe3" stroke-width="3"/>
          <g transform="translate(10 10) scale(${(560 / 600).toFixed(4)})">${A().POSTKARTEN[karte.id]()}</g></g>
        <g transform="translate(600 60) rotate(2)"><rect width="370" height="350" rx="10" fill="#fffaf0" stroke="#d6dbe3" stroke-width="3"/>
          <rect x="280" y="16" width="70" height="80" rx="4" fill="#ffffff" stroke="#e8543f" stroke-width="3" stroke-dasharray="6 4"/>${A().ruby ? `<g transform="translate(315 92) scale(0.4)">${A().ruby("steh", "froh")}</g>` : ""}
          <path d="M190 120 v200" stroke="#d6dbe3" stroke-width="2"/>
          ${schrift ? zeilen.map((z, i) => `<text x="18" y="${140 + i * 30}" font-family="${SCHRIFT}" font-weight="700" font-size="19" fill="#243047">${z}</text>`).join("") : `<text x="90" y="200" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="26" fill="#9aa0ab">♪ ♪ ♪</text>`}
        </g>
      </g>`;
    // Unten: alle Karten, die schon da sind, und Platz für die nächsten.
    I.POSTKARTEN.forEach((p, i) => {
      const x = 250 + i * 110;
      const hier = da.includes(p);
      s += `<g class="en-postwahl${p === karte ? " ist-aktiv" : ""}" ${hier ? `data-karte="${p.id}" tabindex="0" role="button" aria-label="${p.id}"` : ""}>
        <rect x="${x}" y="456" width="92" height="62" rx="8" fill="${hier ? "#ffffff" : "#e9edf2"}" stroke="${p === karte ? "#f4b400" : "#d6dbe3"}" stroke-width="${p === karte ? 5 : 2}"/>
        ${hier ? `<g transform="translate(${x + 4} 460) scale(${(84 / 600).toFixed(4)})">${A().POSTKARTEN[p.id]()}</g>` : `<text x="${x + 46}" y="496" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="24" fill="#b7bfcb">?</text>`}</g>`;
    });
    const svg = k.setzeBild(svgVon(s, "en-post-svg"));
    svg.querySelector("[data-postkarte]")?.addEventListener("click", () => k.sage(karte.text));
    svg.querySelectorAll("[data-karte]").forEach((kn) => k.antippbar(kn, () => post(k, { karte: kn.dataset.karte })));
    k.sage([I.SAETZE.post, karte.text]);
  }

  // Bilder für die Kacheln der Spielzeugkiste und des Telefons.
  Object.assign(S.SPIEL_BILDER || {}, {
    whatsmissing: () => `<rect width="200" height="112" fill="#e3f5fb"/>${dingBild("cow", 56, 60, 28)}<circle cx="104" cy="58" r="22" fill="none" stroke="#9aa0ab" stroke-width="3" stroke-dasharray="5 5"/>${dingBild("pig", 152, 62, 26)}<text x="104" y="67" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="24" fill="#3a7bd5">?</text>`,
    dressup: () => `<rect width="200" height="112" fill="#f3ecff"/><g transform="translate(100 104) scale(0.6)">${A().rocco("steh", "freude")}${A().ROCCO_KLEIDER?.partyhat?.() || ""}${A().ROCCO_KLEIDER?.bowtie?.() || ""}</g>`,
    geschichtenzug: () => `<rect width="200" height="112" fill="#fdf1e2"/><g transform="translate(4 30) scale(0.38)">${roccoLok(0, 150)}</g><rect x="72" y="52" width="56" height="34" rx="6" fill="#ffffff" stroke="#c9bfe8" stroke-width="2"/><rect x="134" y="52" width="56" height="34" rx="6" fill="#ffffff" stroke="#c9bfe8" stroke-width="2"/><text x="100" y="76" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="20" fill="#6c5ce7">1</text><text x="162" y="76" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="20" fill="#6c5ce7">2</text>`,
    diner: () => `<rect width="200" height="112" fill="#e9f7f6"/><rect y="70" width="200" height="42" fill="#c8423b"/>${dingBild("pancakes", 70, 56, 26)}${dingBild("juice", 132, 52, 24)}`,
    telefon: () => `<rect width="200" height="112" fill="#e9f4ff"/><g transform="translate(70 104) scale(0.55)">${A().rocco("wink", "freude")}</g>${gesicht("froh", 148, 54, 30)}`,
    echo: () => `<rect width="200" height="112" fill="#fff4dc"/>${dingBild("cat", 64, 56, 30)}<circle cx="146" cy="58" r="30" fill="#e8543f"/><rect x="138" y="40" width="16" height="26" rx="8" fill="#ffffff"/><path d="M130 58 a16 16 0 0 0 32 0" stroke="#ffffff" stroke-width="4" fill="none"/>`,
  });

  Object.assign(S, { whatsmissing, dressup, geschichtenzug, diner, telefon, echo, post, postNeu });
})();
