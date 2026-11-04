/*
 * englisch-spiele-4.js – Die Spiele der Englischecke aus Etappe 4.
 *
 * Wie englisch-spiele.js: jede Funktion (kern, optionen), aufgerufen von
 * train-englischecke.js (starteSpiel); sie legen sich zu
 * window.LernappEnglischSpiele dazu.
 *
 *   monster      Make a monster: «Make the monster green! Give the monster
 *                three eyes!» – das Kind baut das Monster nach Gehör
 *   wokatze      Where is the cat?: «The cat is under the table.» – das
 *                richtige von drei Bildern (in, on, under, behind, next to)
 *   gegenteile   Opposites: «Which one is big?» – zwei Bilder, eines tippen
 *   wortbild     Wortbild-Memory für Lesende (in englisch-spiele.js: memory
 *                mit { wortbild: true })
 *
 * Kein Minus, keine Uhr; ein falscher Tipp sagt, was es war, und fragt noch
 * einmal. DE sagt das zuletzt Gesagte auf Deutsch, dann noch einmal Englisch.
 */
(() => {
  "use strict";

  const S = window.LernappEnglischSpiele;
  if (!S?.hilfen) return;
  const { mische, zufall, flaeche, punkte, lobPaar, svgVon, nochAktiv, SCHRIFT } = S.hilfen;
  const A = () => window.LernappEnglischArt;

  // ===========================================================================
  // Make a monster
  // ===========================================================================
  function monster(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "monster";
    const runde = { schritt: 0, ersterVersuch: true };
    o.runde = runde;
    k.hilfe("monster");
    const st = k.stufe();
    // Vier Aufträge: eine Farbe, dann Augen, Arme und Beine in zufälliger Folge.
    const farbe = zufall(I.FARBEN);
    const teile = mische(["augen", "arme", "beine"]).map((teil) => zufall(I.MONSTER_TEILE.filter((t) => t.teil === teil && (st !== "leicht" || t.n <= 3))));
    const auftraege = [{ art: "farbe", farbe, satz: I.monsterFarbe(farbe) }, ...teile.map((t) => ({ art: t.teil, n: t.n, satz: t.satz }))];
    const bau = { farbe: "#e9ecef", augen: 0, arme: 0, beine: 0 };
    const zeige = punkte(k, auftraege.length);
    const zeigeKnoten = o.extra.lastChild;
    const zeichne = () => {
      const a = auftraege[runde.schritt];
      let s = `<rect width="1000" height="560" fill="#f3ecff"/><rect y="470" width="1000" height="90" fill="#e2d8fb"/>
        <g class="en-monster" data-monster="1"><g transform="translate(300 500) scale(1.35)">${A().MONSTER ? A().MONSTER(bau) : ""}</g></g>`;
      if (a) {
        if (a.art === "farbe") {
          const farben = mische([a.farbe, ...mische(I.FARBEN.filter((f) => f !== a.farbe)).slice(0, 3)]);
          farben.forEach((f, i) => {
            const x = 640 + (i % 2) * 170;
            const y = 170 + Math.floor(i / 2) * 170;
            s += `<g class="en-monsterwahl" data-farbe="${f.id}" tabindex="0" role="button" aria-label="${f.id}">${flaeche(x - 70, y - 80, 140, 160)}${S.ballon(f.hex, x, y - 10, 56)}</g>`;
          });
        } else {
          const bis = a.art === "augen" ? 5 : 4;
          const zahlen = mische([a.n, ...mische(Array.from({ length: bis }, (_, i) => i + 1).filter((n) => n !== a.n)).slice(0, 2)]).sort((p, q) => p - q);
          zahlen.forEach((n, i) => {
            const x = 620 + i * 140;
            s += `<g class="en-zahlknopf" data-zahl="${n}" tabindex="0" role="button" aria-label="${n}"><circle cx="${x}" cy="270" r="62" fill="#6c5ce7"/><text x="${x}" y="294" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="68" fill="#ffffff">${n}</text></g>`;
          });
        }
      }
      const svg = k.setzeBild(svgVon(s, "en-monster-svg"), { weiter: true });
      o.extra.append(zeigeKnoten);
      svg.querySelector("[data-monster]")?.addEventListener("click", () => { if (a) k.sage(a.satz); });
      const richtig = () => {
        k.kids()?.playJingle?.("correct");
        if (a.art === "farbe") { bau.farbe = a.farbe.hex; k.stand().erkannt(a.farbe.id, runde.ersterVersuch); } else { bau[a.art] = a.n; k.stand().erkannt(`n${a.n}`, runde.ersterVersuch); }
        runde.schritt += 1;
        zeige(runde.schritt);
        zeichne();
        k.sage(lobPaar(k), { danach: () => {
          if (!nochAktiv(k, runde)) return;
          if (runde.schritt < auftraege.length) { runde.ersterVersuch = true; k.sage(auftraege[runde.schritt].satz); return; }
          runde.vorbei = true;
          k.rundeFertig("monster", { satz: I.SAETZE.monsterFertig, nochmal: () => monster(k) });
        } });
      };
      const falsch = (kn, paar) => {
        k.animiere(kn, "en-schuettel", 500);
        if (runde.ersterVersuch) k.stand().erkannt(a.art === "farbe" ? a.farbe.id : `n${a.n}`, false);
        runde.ersterVersuch = false;
        k.kids()?.playJingle?.("retry");
        k.sage([paar, a.satz]);
      };
      svg.querySelectorAll("[data-farbe]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei || !a) return;
        const f = I.FARBEN.find((x) => x.id === kn.dataset.farbe);
        if (f === a.farbe) richtig(); else falsch(kn, [f.en, f.de]);
      }));
      svg.querySelectorAll("[data-zahl]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei || !a) return;
        const n = Number(kn.dataset.zahl);
        if (n === a.n) richtig(); else { const z = I.ZAHLEN[n - 1]; falsch(kn, [z.en, z.de]); }
      }));
    };
    zeichne();
    k.sage([I.SAETZE.monster, auftraege[0].satz]);
  }

  // ===========================================================================
  // Where is the cat?
  // ===========================================================================
  function wokatze(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "wokatze";
    const anzahl = 5;
    const runde = { i: 0, ersterVersuch: true, vorher: null };
    o.runde = runde;
    k.hilfe("wokatze");
    const zeige = punkte(k, anzahl);
    const zeigeKnoten = o.extra.lastChild;
    const frage = () => {
      // Drei Bilder mit demselben Ding, die Katze jedes Mal anderswo.
      const ziel = zufall(I.WO_KATZE.filter((x) => x !== runde.vorher));
      runde.vorher = ziel;
      runde.ersterVersuch = true;
      const andere = mische(I.WO_KATZE.filter((x) => x.ding === ziel.ding && x.wo !== ziel.wo));
      const bilder = mische([ziel, ...andere.slice(0, 2)]);
      let s = `<rect width="1000" height="560" fill="#fff6e6"/>`;
      bilder.forEach((x, i) => {
        const bx = 30 + i * 320;
        s += `<g class="en-katzenbild" data-bild="${x.wo}" tabindex="0" role="button" aria-label="${x.satz[0]}">
          <rect x="${bx}" y="110" width="300" height="260" rx="24" fill="#ffffff" stroke="#e1d9c6" stroke-width="4"/>
          <g transform="translate(${bx} 130)">${A().WO_KATZE ? A().WO_KATZE(x.wo, x.ding) : ""}</g></g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-wokatze-svg"));
      o.extra.append(zeigeKnoten);
      k.sage(ziel.satz);
      svg.querySelectorAll("[data-bild]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei) return;
        const x = bilder.find((b) => b.wo === kn.dataset.bild);
        if (x === ziel) {
          k.animiere(kn, "en-huepf");
          k.stand().gehoert("cat");
          k.kids()?.playJingle?.("correct");
          runde.i += 1;
          zeige(runde.i);
          k.sage([lobPaar(k), ziel.satz], { danach: () => {
            if (!nochAktiv(k, runde)) return;
            if (runde.i < anzahl) { frage(); return; }
            runde.vorbei = true;
            k.rundeFertig("wokatze", { nochmal: () => wokatze(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          runde.ersterVersuch = false;
          k.kids()?.playJingle?.("retry");
          k.sage([x.satz, ziel.satz]);
        }
      }));
    };
    k.sage(I.SAETZE.wokatze, { danach: frage });
  }

  // ===========================================================================
  // Opposites
  // ===========================================================================
  function gegenteile(k) {
    const I = k.inhalt();
    const o = k.offen();
    o.ansicht = "gegenteile";
    const paare = mische(I.GEGENTEILE.filter((g) => A().GEGENTEILE?.[g.paar[0]] && A().GEGENTEILE?.[g.paar[1]])).slice(0, 6);
    const runde = { i: 0 };
    o.runde = runde;
    k.hilfe("gegenteile");
    const zeige = punkte(k, paare.length);
    const zeigeKnoten = o.extra.lastChild;
    const frage = () => {
      const g = paare[runde.i];
      const gesucht = Math.random() < 0.5 ? 0 : 1;
      const reihe = mische([0, 1]);
      let s = `<rect width="1000" height="560" fill="#eef7ea"/>`;
      reihe.forEach((j, pos) => {
        const x = 110 + pos * 420;
        s += `<g class="en-gegenteil" data-gegenteil="${j}" tabindex="0" role="button" aria-label="${g.en[j]} – ${g.de[j]}">
          ${flaeche(x - 10, 70, 380, 330)}<g transform="translate(${x} 90) scale(1.6)">${A().GEGENTEILE[g.paar[j]]()}</g></g>`;
      });
      const svg = k.setzeBild(svgVon(s, "en-gegenteile-svg"));
      o.extra.append(zeigeKnoten);
      const frageSatz = I.gegenteilFrage(g, gesucht);
      k.sage(frageSatz);
      svg.querySelectorAll("[data-gegenteil]").forEach((kn) => k.antippbar(kn, () => {
        if (!nochAktiv(k, runde) || runde.vorbei || runde.spricht) return;
        const j = Number(kn.dataset.gegenteil);
        if (j === gesucht) {
          k.animiere(kn, "en-huepf");
          k.kids()?.playJingle?.("correct");
          runde.i += 1;
          zeige(runde.i);
          runde.spricht = true;
          k.sage(I.gegenteilAntwort(g, gesucht), { danach: () => {
            runde.spricht = false;
            if (!nochAktiv(k, runde)) return;
            if (runde.i < paare.length) { frage(); return; }
            runde.vorbei = true;
            k.rundeFertig("gegenteile", { nochmal: () => gegenteile(k) });
          } });
        } else {
          k.animiere(kn, "en-schuettel", 500);
          k.kids()?.playJingle?.("retry");
          k.sage([[g.en[j], g.de[j]], frageSatz]);
        }
      }));
    };
    k.sage(I.SAETZE.gegenteile, { danach: frage });
  }

  function wortbild(k) { S.memory(k, { wortbild: true }); }

  // Bilder für die Kacheln der Spielzeugkiste.
  Object.assign(S.SPIEL_BILDER || {}, {
    monster: () => `<rect width="200" height="112" fill="#f3ecff"/>${A().MONSTER ? `<g transform="translate(100 104) scale(0.3)">${A().MONSTER({ farbe: "#3fbf74", augen: 3, arme: 2, beine: 2 })}</g>` : ""}`,
    wokatze: () => `<rect width="200" height="112" fill="#fff6e6"/>${A().WO_KATZE ? `<g transform="translate(30 4) scale(0.48)">${A().WO_KATZE("in", "box")}</g>` : ""}`,
    gegenteile: () => `<rect width="200" height="112" fill="#eef7ea"/>${A().GEGENTEILE ? `<g transform="translate(6 20) scale(0.4)">${A().GEGENTEILE.big()}</g><g transform="translate(104 20) scale(0.4)">${A().GEGENTEILE.small()}</g>` : ""}`,
    wortbild: () => `<rect width="200" height="112" fill="#fff4dc"/><rect x="34" y="16" width="58" height="80" rx="10" fill="#ffffff" stroke="#e1d9c6" stroke-width="3"/>${S.dingBild("cat", 63, 56, 26)}
      <rect x="108" y="16" width="58" height="80" rx="10" fill="#ffffff" stroke="#e1d9c6" stroke-width="3"/><text x="137" y="64" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="20" fill="#243047">cat</text>`,
  });

  Object.assign(S, { monster, wokatze, gegenteile, wortbild });
})();
