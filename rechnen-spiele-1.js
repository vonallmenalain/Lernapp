/*
 * rechnen-spiele-1.js – Die Spiele der Etappe 1: der Plus-Start.
 *
 *   kuppelplus     zwei Züge zusammenschieben: 3 Wagen und 2 Wagen
 *   tunnelrechnen  ein Zug fährt in den Tunnel, Wagen rollen hinterher –
 *                  wie viele sind drin? Dann hebt sich der Tunnel.
 *   blitzblick     ein Wagen mit Tieren blitzt im Fenster auf: wie viele?
 *   einsteigen     Rechengeschichten am Perron: Tiere steigen ein
 *   huepfgleis     ein Brettspiel als gerades Gleis gegen Fino
 *   zahlenhaus     auf dem Dach eine Zahl, in jedem Stockwerk zwei Zimmer
 *
 * Jedes Spiel meldet sich bei rechnen-spiel.js an; nur das, dessen Seite
 * offen ist, startet. Gezeichnet wird mit rechnen-art.js. Die Fünfer-Farben
 * gelten überall: die ersten fünf rot, die nächsten blau.
 */
(() => {
  "use strict";

  const R = window.LernappRechenSpiel;
  if (!R) return;

  const SPUR = 448;
  const NAMEN = { fox: "Fino", rabbit: "Hoppel", mouse: "Mia", bear: "Bruno", panda: "Pippa", owl: "Ella", penguin: "Pino", lion: "Leo", frog: "Fred", cat: "Tim" };
  const TIER_IDS = Object.keys(NAMEN);
  const wagenWort = (n) => (n === 1 ? "1 Wagen" : `${n} Wagen`);

  // Der Zahlenraum eines Spiels: die Stufe, aber nie über dem Deckel der Eltern.
  const bis = (ctx, leicht = 5, mittel = 10, schwer = 10) => Math.max(3, Math.min({ leicht, mittel, schwer }[ctx.stufe] || mittel, ctx.deckel));

  // Ein Satz, der sagt, was beim Zählen herauskam – mit der Kraft der Fünf.
  function fuenferSatz(n) {
    if (n <= 5) return "";
    if (n === 10) return " Fünf rote und fünf blaue.";
    if (n < 10) return ` Fünf rote und ${n - 5} ${n - 5 === 1 ? "blauer" : "blaue"}.`;
    return "";
  }

  // ===========================================================================
  // Kuppel-Plus
  // ===========================================================================
  R.spiel({
    id: "kuppelplus",
    titel: "Kuppel-Plus",
    help: "Kuppel-Plus. Zwei Züge stehen auf dem Gleis. Schieb sie zusammen, dann sag, wie viele Wagen es jetzt sind. Tippe auf die richtige Zahl unten.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const t = ctx.ziehe(() => {
        const a = ctx.rnd(1, max - 1);
        const b = ctx.rnd(1, max - a);
        if (ctx.stufe === "mittel" && max > 5 && a + b < 4) return null;
        if (ctx.stufe === "schwer" && max > 5 && (a + b < 6 || a < 2)) return null;
        return { a, b, key: `${a}+${b}` };
      });
      const { a, b } = t;
      const ziel = 150 + 64 * a;
      const bStart = Math.max(ziel + 130, 970 - 64 * b);
      let zugA = A.lok(1, true);
      for (let i = 0; i < a; i += 1) zugA += A.wagen(116 + i * 64, A.fuenfer(i), 1, i);
      let zugB = "";
      for (let j = 0; j < b; j += 1) zugB += A.wagen(6 + j * 64, A.C.gelb, 1, a + j);
      if (ctx.stufe === "mittel") {
        zugA += A.schild(116 + (a * 64 - 6) / 2, -104, a);
        zugB += A.schild(6 + (b * 64 - 6) / 2, -104, b);
      }
      const versteckt = ctx.stufe === "schwer";
      const leicht = ctx.stufe === "leicht";
      ctx.zeichne(`${A.raum(SPUR)}
        ${versteckt ? `<text class="rw-rechnung" x="500" y="200" text-anchor="middle" font-size="104" ${A.FONT} fill="${A.C.ink}">${a} + ${b} = ?</text>` : ""}
        <g class="rw-zug-a" transform="translate(40 ${SPUR})" ${versteckt ? 'opacity="0"' : ""}>${zugA}</g>
        <g class="rw-zug-b${leicht ? " rw-ziehbar" : ""}" transform="translate(${bStart} ${SPUR})" ${versteckt ? 'opacity="0"' : ""}>${zugB}<rect x="-10" y="-74" width="${64 * b + 14}" height="88" fill="#000" fill-opacity="0"/></g>
        ${leicht ? `<g transform="translate(${bStart - 40} 360)"><g class="rw-schubs"><path d="M0 0 L24 -16 L24 -7 L56 -7 L56 7 L24 7 L24 16 Z" fill="${A.C.lila}"/></g></g>` : ""}`);
      const trA = ctx.q(".rw-zug-a");
      const trB = ctx.q(".rw-zug-b");
      let bx = bStart;
      const kuppeln = async (dauer) => {
        const von = bx;
        await ctx.tween(dauer, (p) => { bx = von + (ziel - von) * p; ctx.setPos(trB, bx, SPUR); });
        if (!ctx.lebt()) return;
        ctx.klack();
        await ctx.tween(160, (p) => ctx.setPos(trA, 40 - 4 * Math.sin(p * Math.PI), SPUR));
      };
      const zeigen = async (ok) => {
        const orte = [...ctx.wagenOrte(trA), ...ctx.wagenOrte(trB)];
        if (!(await ctx.zaehle(orte, leicht ? 340 : 230))) return;
        orte.forEach(({ w }, k) => w.querySelector(".wb")?.setAttribute("fill", A.fuenfer(k)));
        const n = a + b;
        await ctx.sage(ok ? `Ja! ${a} und ${b} sind ${n}.${fuenferSatz(n)}` : `Schau: Es sind ${n} Wagen. ${a} und ${b} sind ${n}.${fuenferSatz(n)}`);
      };

      if (versteckt) {
        ctx.sage(`${a} + ${b} = ?`, `${a} plus ${b}. Wie viel ist das?`);
        const { ok } = await ctx.frage({ lo: 1, hi: max, richtig: a + b, aufgabe: { a, op: "+", b } });
        if (!ctx.lebt()) return ok;
        const rechnung = ctx.q(".rw-rechnung");
        await ctx.tween(320, (p) => { trA.setAttribute("opacity", p); trB.setAttribute("opacity", p); rechnung?.setAttribute("opacity", 1 - p * 0.75); });
        await ctx.warte(250);
        await kuppeln(800);
        await zeigen(ok);
        return ok;
      }

      await ctx.sage(`${wagenWort(a)} und ${wagenWort(b)}.${leicht ? " Schieb sie zusammen!" : ""}`);
      if (!ctx.lebt()) return false;
      if (leicht) {
        await new Promise((fertig) => {
          let gekuppelt = false;
          let ziehen = false;
          let bewegt = false;
          let startX = 0;
          let startBx = 0;
          const svgX = (e) => {
            const p = ctx.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
            const m = ctx.svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()).x : 0;
          };
          const schluss = async (dauer) => {
            if (gekuppelt) return;
            gekuppelt = true; ziehen = false;
            ctx.q(".rw-schubs")?.parentNode.remove();
            trB.classList.remove("rw-ziehbar");
            await kuppeln(dauer);
            fertig();
          };
          trB.addEventListener("pointerdown", (e) => {
            if (gekuppelt || !ctx.lebt()) return;
            e.preventDefault();
            try { trB.setPointerCapture(e.pointerId); } catch { /* nichts */ }
            ziehen = true; bewegt = false; startX = svgX(e); startBx = bx;
          });
          trB.addEventListener("pointermove", (e) => {
            if (!ziehen || gekuppelt) return;
            const dx = svgX(e) - startX;
            if (Math.abs(dx) > 5) bewegt = true;
            bx = Math.max(ziel, Math.min(bStart, startBx + dx));
            ctx.setPos(trB, bx, SPUR);
            if (bx - ziel < 18) schluss(120);
          });
          // Loslassen rollt den Rest von selbst – ein Tipp genügt auch.
          const loslassen = () => {
            if (!ziehen || gekuppelt) return;
            ziehen = false;
            schluss(Math.max(bewegt ? 220 : 320, (bx - ziel) * 1.6));
          };
          trB.addEventListener("pointerup", loslassen);
          trB.addEventListener("pointercancel", () => { ziehen = false; });
          trB.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") schluss(400); });
          trB.setAttribute("tabindex", "0");
          trB.setAttribute("role", "button");
          trB.setAttribute("aria-label", "Die Wagen zum Zug schieben");
        });
      } else {
        await ctx.warte(900);
        if (!ctx.lebt()) return false;
        await kuppeln(800);
      }
      if (!ctx.lebt()) return false;
      ctx.sage("Wie viele Wagen sind es jetzt?");
      const { ok } = await ctx.frage({ lo: 1, hi: max, richtig: a + b, aufgabe: { a, op: "+", b } });
      if (!ctx.lebt()) return ok;
      await zeigen(ok);
      return ok;
    },
  });

  // ===========================================================================
  // Tunnel-Rechnen
  // ===========================================================================
  const TK = 0.72;
  const TS = 46;
  const VORNE = 888;
  function tunnelZug(A, n, mitLok, start, farbe = null) {
    let s = mitLok ? A.lok(TK, false) : "";
    for (let i = 0; i < n; i += 1) s += A.wagen(-(i + 1) * TS + 4, farbe || (mitLok ? A.fuenfer(i) : A.C.gelb), TK, start + i);
    return s;
  }
  R.spiel({
    id: "tunnelrechnen",
    titel: "Tunnel-Rechnen",
    help: "Tunnel-Rechnen. Ein Zug fährt in den Tunnel, dann rollen Wagen hinterher. Wie viele Wagen sind jetzt im Tunnel? Tippe auf die Zahl – dann hebt sich der Tunnel, und du siehst es.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const minus = ctx.stufe === "schwer" && ctx.minus && Math.random() < 0.5;
      const t = ctx.ziehe(() => {
        if (minus) { const a = ctx.rnd(3, Math.min(7, max)); const b = ctx.rnd(1, a - 1); return { a, b, key: `${a}-${b}` }; }
        const a = ctx.rnd(1, Math.min(7, max - 1));
        const b = ctx.rnd(1, Math.min(8, max - a));
        if (ctx.stufe !== "leicht" && max > 5 && a + b < 4) return null;
        return { a, b, key: `${a}+${b}` };
      });
      const { a, b } = t;
      let zugA = tunnelZug(A, a, true, 0);
      if (ctx.stufe === "mittel") zugA += A.schild((78 - a * TS + 4) / 2, -84, a);
      const startX = a * TS + 6;
      ctx.zeichne(`${A.raum(SPUR)}
        <g class="rw-zug-a" transform="translate(${startX} ${SPUR})">${zugA}</g>
        <g class="rw-zug-b-platz"></g>
        <g class="rw-berg">${A.tunnelBerg(410, SPUR)}</g>`);
      const trA = ctx.q(".rw-zug-a");
      const berg = ctx.q(".rw-berg");
      await ctx.sage(`Ein Zug mit ${wagenWort(a)} fährt in den Tunnel.`);
      if (!ctx.lebt()) return false;
      ctx.jingle("star");
      await ctx.tween(1900, (p) => ctx.setPos(trA, startX + (VORNE - startX) * p, SPUR));
      if (!ctx.lebt()) return false;
      await ctx.warte(300);

      let trB;
      const platz = ctx.q(".rw-zug-b-platz");
      if (!minus) {
        let zugB = tunnelZug(A, b, false, a);
        if (ctx.stufe === "mittel") zugB += A.schild(-(b * TS) / 2 + 2, -84, b);
        const bStart = b * TS + 2;
        platz.insertAdjacentHTML("afterend", `<g class="rw-zug-b" transform="translate(${bStart} ${SPUR})" opacity="0">${zugB}</g>`);
        trB = ctx.q(".rw-zug-b");
        await ctx.tween(300, (p) => trB.setAttribute("opacity", p));
        await ctx.sage(`${wagenWort(b)} ${b === 1 ? "rollt" : "rollen"} hinterher.`);
        if (!ctx.lebt()) return false;
        const ziel = VORNE - a * TS;
        await ctx.tween(1300, (p) => ctx.setPos(trB, bStart + (ziel - bStart) * p, SPUR));
        if (!ctx.lebt()) return false;
        ctx.klack();
        await ctx.warte(250);
        ctx.sage("Wie viele Wagen sind jetzt im Tunnel?");
      } else {
        // Die hinteren Wagen kuppeln sich im Tunnel ab und rollen hinaus.
        trA.querySelectorAll(".rw-wagen").forEach((w) => { if (Number(w.dataset.i) >= a - b) w.remove(); });
        let zugB = "";
        for (let j = 0; j < b; j += 1) zugB += A.wagen(-(j + 1) * TS + 4, A.fuenfer(a - b + j), TK, j);
        const von = VORNE - (a - b) * TS;
        const ziel = b * TS + 6;
        platz.insertAdjacentHTML("afterend", `<g class="rw-zug-b" transform="translate(${von} ${SPUR})">${zugB}</g>`);
        trB = ctx.q(".rw-zug-b");
        ctx.klack();
        await ctx.tween(1500, (p) => ctx.setPos(trB, von + (ziel - von) * p, SPUR));
        if (!ctx.lebt()) return false;
        ctx.sage(`${wagenWort(b)} ${b === 1 ? "rollt" : "rollen"} wieder heraus. Wie viele sind noch im Tunnel?`);
      }

      const richtig = minus ? a - b : a + b;
      const { ok } = await ctx.frage({ lo: minus ? 0 : 1, hi: max, richtig, aufgabe: { a, op: minus ? "-" : "+", b } });
      if (!ctx.lebt()) return ok;
      // Den Spielzeugtunnel hochheben.
      await ctx.tween(750, (p) => berg.setAttribute("transform", `translate(${(p * 30).toFixed(1)} ${(-p * 470).toFixed(1)}) rotate(${(p * 6).toFixed(1)} 700 ${SPUR})`));
      if (!ctx.lebt()) return ok;
      const orte = [...ctx.wagenOrte(trA), ...(minus ? [] : ctx.wagenOrte(trB))];
      if (!(await ctx.zaehle(orte, ctx.stufe === "leicht" ? 340 : 230))) return ok;
      if (!minus) orte.forEach(({ w }, k) => w.querySelector(".wb")?.setAttribute("fill", A.fuenfer(k)));
      const satz = minus ? `${a} minus ${b} sind ${richtig}.` : `${a} und ${b} sind ${richtig}.`;
      await ctx.sage(ok ? `Richtig! ${satz}` : `Schau: ${richtig === 1 ? "Es ist 1 Wagen" : `Es sind ${richtig} Wagen`}. ${satz}`);
      return ok;
    },
  });

  // ===========================================================================
  // Blitzblick
  // ===========================================================================
  R.spiel({
    id: "blitzblick",
    titel: "Blitzblick",
    help: "Blitzblick. Ein Wagen fährt am Fenster vorbei, Tiere schauen heraus – nur ganz kurz. Wie viele hast du gesehen? Die ersten fünf Fenster sind oben, die nächsten fünf unten.",
    async aufgabe(ctx) {
      const A = ctx.art;
      let stufe = ctx.stufe;
      if (stufe === "schwer" && ctx.deckel < 20) stufe = "mittel";
      if (stufe === "mittel" && ctx.deckel < 10) stufe = "leicht";
      const t = ctx.ziehe(() => {
        const n = stufe === "leicht" ? ctx.rnd(1, 5) : stufe === "mittel" ? ctx.rnd(2, 10) : ctx.rnd(11, 20);
        return { n, key: String(n) };
      });
      const n = t.n;
      const start = ctx.rnd(0, 9);
      let breite;
      let inhalt;
      let plaetze;
      if (stufe === "schwer") {
        const w1 = A.fensterWagen(10, 2, 400, A.TIERE, start);
        const w2 = A.fensterWagen(n - 10, 2, 400, A.TIERE, start + 10);
        breite = 816;
        inhalt = `${w1.svg}<rect x="400" y="-40" width="16" height="6" fill="${A.C.dunkel}"/><g transform="translate(416 0)">${w2.svg}</g>`;
        plaetze = [...w1.plaetze, ...w2.plaetze.map((p) => ({ ...p, x: p.x + 416 }))];
      } else {
        const w = A.fensterWagen(n, stufe === "leicht" ? 1 : 2, 440, A.TIERE, start);
        breite = 440; inhalt = w.svg; plaetze = w.plaetze;
      }
      ctx.zeichne(A.fensterBlick());
      const zug = ctx.q(".rw-fensterzug");
      const links = 50 - breite;
      const mitte = (1000 - breite) / 2;
      const rechts = 960;
      ctx.setPos(zug, links, 404);
      zug.innerHTML = inhalt;
      await ctx.sage("Schau gut hin!");
      if (!ctx.lebt()) return false;
      await ctx.warte(300);
      const zeit = Math.max(900, ({ leicht: 2000, mittel: 1600, schwer: 2200 }[stufe] || 1600) - ctx.lauf.richtig * 150);
      await ctx.tween(520, (p) => ctx.setPos(zug, links + (mitte - links) * p, 404), { roh: true });
      await ctx.warte(zeit);
      if (!ctx.lebt()) return false;
      await ctx.tween(520, (p) => ctx.setPos(zug, mitte + (rechts - mitte) * p, 404), { roh: true });
      if (!ctx.lebt()) return false;
      ctx.sage("Wie viele Tiere hast du gesehen?");
      const lo = stufe === "schwer" ? 11 : 1;
      const hi = stufe === "leicht" ? 5 : stufe === "mittel" ? 10 : 20;
      const { ok } = await ctx.frage({ lo, hi, richtig: n });
      if (!ctx.lebt()) return ok;
      ctx.setPos(zug, links, 404);
      await ctx.tween(600, (p) => ctx.setPos(zug, links + (mitte - links) * p, 404));
      if (!ctx.lebt()) return ok;
      if (!(await ctx.zaehle(plaetze.map((p) => ({ g: zug, x: p.x, y: p.y + 6 })), stufe === "leicht" ? 280 : 150))) return ok;
      let satz;
      if (stufe === "leicht") satz = n === 5 ? "Fünf – die Reihe ist voll!" : `${n}!`;
      else if (stufe === "mittel") satz = n < 5 ? `${n} – alle oben.` : n === 5 ? "Fünf – die obere Reihe ist voll." : n === 10 ? "Zehn – der Wagen ist voll!" : `${n} – fünf oben und ${n - 5} unten.`;
      else satz = n === 20 ? "Zwanzig – zwei volle Wagen!" : `${n} – ein voller Wagen und noch ${n - 10}.`;
      await ctx.sage(ok ? `Genau! ${satz}` : `Schau: ${satz}`);
      return ok;
    },
  });

  // ===========================================================================
  // Einsteigen bitte!
  // ===========================================================================
  // Ein Wagen steht am Perron, Tiere warten. «Im Zug sitzen 4 Tiere. Hoppel und
  // Mia steigen ein.» Auf «mittel» sind die Fenster beschlagen: Man sieht nur,
  // wer einsteigt. Auf «schwer» gibt es nur die Geschichte – das Bild kommt zur
  // Kontrolle.
  function tierFigur(A, id, x, y, r = 16) {
    return `<g class="rw-wartet" data-tier="${id}" transform="translate(${x} ${y})"><ellipse cx="0" cy="${r * 1.9}" rx="${r * 1.1}" ry="${r * 0.35}" fill="#243047" fill-opacity="0.15"/><rect x="${-r * 0.7}" y="${r * 0.6}" width="${r * 1.4}" height="${r * 1.3}" rx="${r * 0.5}" fill="${A.C.blau}" fill-opacity="0.25"/>${A.kopf(id, 0, 0, r)}</g>`;
  }
  R.spiel({
    id: "einsteigen",
    titel: "Einsteigen bitte!",
    help: "Einsteigen bitte! Der Zug hält am Perron. Hör gut zu: Wie viele Tiere sitzen schon im Zug, und wie viele steigen ein? Dann tippe auf die Zahl, wie viele jetzt mitfahren.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const t = ctx.ziehe(() => {
        const a = ctx.rnd(1, max - 1);
        const b = ctx.rnd(1, Math.min(5, max - a));
        return { a, b, key: `${a}+${b}` };
      });
      const { a, b } = t;
      const plaetze = max <= 5 ? 5 : 10;
      const tiere = ctx.mische(TIER_IDS);
      const sitzen = tiere.slice(0, a);
      const steigen = tiere.slice(a, a + b);
      const beschlagen = ctx.stufe !== "leicht";
      const nurGeschichte = ctx.stufe === "schwer";
      const W = 600;
      const wagenX = 30;
      const pw = A.personenWagen(plaetze, sitzen, { beschlagen, W });
      // Der Perron rechts, die Wartenden darauf.
      let perron = `<rect x="660" y="${SPUR - 18}" width="340" height="26" fill="#c9d1df"/><rect x="660" y="${SPUR - 18}" width="340" height="5" fill="#e8edf3"/>
        <rect x="900" y="${SPUR - 150}" width="6" height="132" fill="#5d6882"/><rect x="866" y="${SPUR - 168}" width="74" height="26" rx="5" fill="#ffffff" stroke="${A.C.blau}" stroke-width="3"/>
        <text x="903" y="${SPUR - 149}" text-anchor="middle" font-size="16" ${A.FONT} fill="${A.C.blau}">Perron</text>`;
      steigen.forEach((id, i) => { perron += tierFigur(A, id, 700 + i * 46, SPUR - 70, 16); });
      ctx.zeichne(`${A.raum(SPUR)}
        <rect x="0" y="0" width="1000" height="300" fill="#dff1f7"/>
        <path d="M0 230 Q200 180 420 214 T1000 200 V300 H0 Z" fill="#9ed27f"/>
        <rect x="0" y="250" width="1000" height="50" fill="#7cc05e"/>
        <g class="rw-perron"${nurGeschichte ? ' opacity="0"' : ""}>${perron}</g>
        <g class="rw-pw" transform="translate(${wagenX} ${SPUR})"${nurGeschichte ? ' opacity="0"' : ""}>${pw.svg}</g>`);
      const wagenG = ctx.q(".rw-pw");
      const nameListe = (ids) => (ids.length === 1 ? NAMEN[ids[0]] : `${ids.slice(0, -1).map((id) => NAMEN[id]).join(", ")} und ${NAMEN[ids[ids.length - 1]]}`);
      const einsteigenSatz = b <= 2 ? `${nameListe(steigen)} ${b === 1 ? "steigt" : "steigen"} ein.` : `${b} Tiere steigen ein.`;
      await ctx.sage(`Im Zug ${a === 1 ? "sitzt 1 Tier" : `sitzen ${a} Tiere`}. ${einsteigenSatz}`);
      if (!ctx.lebt()) return false;
      // Einsteigen: Jedes wartende Tier hüpft in das nächste freie Fenster.
      if (!nurGeschichte) {
        const figuren = [...ctx.svg.querySelectorAll(".rw-wartet")];
        for (let i = 0; i < figuren.length; i += 1) {
          if (!ctx.lebt()) return false;
          const fig = figuren[i];
          const ort = pw.orte[a + i];
          const [x0, y0] = fig.getAttribute("transform").match(/-?[\d.]+/g).map(Number);
          const x1 = wagenX + ort.x;
          const y1 = SPUR + ort.y;
          await ctx.tween(560, (p) => fig.setAttribute("transform", `translate(${(x0 + (x1 - x0) * p).toFixed(1)} ${(y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 60).toFixed(1)}) scale(${(1 - p * 0.35).toFixed(2)})`));
          ctx.blip(i);
          if (beschlagen) fig.setAttribute("opacity", "0.25");
        }
      }
      if (!ctx.lebt()) return false;
      ctx.sage("Wie viele Tiere fahren jetzt mit?");
      const { ok } = await ctx.frage({ lo: 1, hi: max, richtig: a + b, aufgabe: { a, op: "+", b } });
      if (!ctx.lebt()) return ok;
      // Zur Kontrolle: Die Fenster werden klar, und gezählt wird.
      ctx.svg.querySelectorAll(".rw-wartet").forEach((f) => f.remove());
      const klar = A.personenWagen(plaetze, [...sitzen, ...steigen], { beschlagen: false, W });
      wagenG.innerHTML = klar.svg;
      wagenG.setAttribute("opacity", "1");
      ctx.q(".rw-perron")?.setAttribute("opacity", "1");
      const orte = klar.orte.slice(0, a + b).map((o) => ({ g: wagenG, x: o.x + o.r * 0.9, y: o.top + 4 }));
      if (!(await ctx.zaehle(orte, ctx.stufe === "leicht" ? 320 : 220))) return ok;
      await ctx.sage(ok ? `Genau! ${a} und ${b} sind ${a + b}.` : `Schau: Es fahren ${a + b} Tiere mit. ${a} und ${b} sind ${a + b}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Hüpf-Gleis
  // ===========================================================================
  // Ein Brettspiel als gerades Gleis: Bahnhöfe 1 bis 10 (leicht), 20 (mittel)
  // oder 30 (schwer), in Reihen zu zehn, die zweite Reihe zurück wie eine
  // Schlange. Das Kind und Fino würfeln abwechselnd. Auf «leicht» tippt das
  // Kind jeden Hüpfer selbst, und die Stimme sagt die Zahl; darüber sagt es
  // zuerst, wo die Lok landet, dann hüpft sie. Auf «schwer» zwei Würfel und
  // Weichen, die zwei vor oder zurück schicken. Fino verliert gern.
  R.spiel({
    id: "huepfgleis",
    titel: "Hüpf-Gleis",
    help: "Hüpf-Gleis. Du und Fino würfelt abwechselnd. Deine Lok hüpft so viele Bahnhöfe weiter, wie der Würfel zeigt. Wer zuerst am Ziel ist, gewinnt!",
    async runde(ctx) {
      const A = ctx.art;
      const ende = Math.min(ctx.stufe === "leicht" ? 10 : ctx.stufe === "mittel" ? 20 : 30, Math.max(10, ctx.deckel));
      const zweiWuerfel = ctx.stufe === "schwer";
      const augenMax = ctx.stufe === "leicht" ? 3 : 6;
      const weichen = ctx.stufe === "schwer" ? { 6: 2, 13: -2, 17: 2, 24: -2, 27: 2 } : {};
      const reihen = Math.ceil(ende / 10);
      const dy = reihen === 1 ? 0 : 300 / (reihen - 1);
      const ort = (n) => {
        if (n <= 0) return { x: 40, y: 480 };
        const r = Math.floor((n - 1) / 10);
        let c = (n - 1) % 10;
        if (r % 2 === 1) c = 9 - c;
        return { x: 120 + c * 86, y: 480 - r * dy - (reihen === 1 ? 140 : 0) };
      };
      let gleis = "";
      for (let n = 1; n < ende; n += 1) {
        const p = ort(n);
        const q = ort(n + 1);
        gleis += `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#8b95a8" stroke-width="10" stroke-linecap="round"/>`;
      }
      const s0 = ort(0);
      const s1 = ort(1);
      gleis += `<line x1="${s0.x}" y1="${s0.y}" x2="${s1.x}" y2="${s1.y}" stroke="#8b95a8" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 12"/>`;
      let bahnhoefe = "";
      for (let n = 1; n <= ende; n += 1) {
        const p = ort(n);
        const farbe = A.fuenfer((n - 1) % 10);
        const weiche = weichen[n];
        bahnhoefe += `<g class="rw-bhf" data-n="${n}"><circle cx="${p.x}" cy="${p.y}" r="27" fill="#ffffff" stroke="${farbe}" stroke-width="6"/><text x="${p.x}" y="${p.y + 9}" text-anchor="middle" font-size="26" ${A.FONT} fill="${A.C.ink}">${n}</text>${weiche ? `<g transform="translate(${p.x + 20} ${p.y - 24})"><circle r="13" fill="${weiche > 0 ? "#3fbf74" : A.C.rot}"/><text y="5" text-anchor="middle" font-size="13" ${A.FONT} fill="#ffffff">${weiche > 0 ? "+2" : "−2"}</text></g>` : ""}</g>`;
      }
      const ziel = ort(ende);
      const figur = (farbe, gesicht) => `<g><circle r="22" fill="${farbe}" stroke="#ffffff" stroke-width="4"/>${A.kopf(gesicht, 0, -2, 13)}</g>`;
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/><rect y="520" width="1000" height="40" fill="#cfe9d8"/>
        ${gleis}${bahnhoefe}
        <g transform="translate(${ziel.x} ${ziel.y - 44})"><rect x="-2" y="-30" width="4" height="32" fill="#5d6882"/><path d="M2 -30 L30 -22 L2 -14 Z" fill="${A.C.rot}"/></g>
        <g transform="translate(${s0.x} ${s0.y})"><rect x="-28" y="-14" width="56" height="28" rx="8" fill="#ffffff" stroke="${A.C.ink}" stroke-opacity="0.25" stroke-width="2"/><text y="7" text-anchor="middle" font-size="16" ${A.FONT} fill="${A.C.ink}">Start</text></g>
        <g class="rw-figur-fino" transform="translate(${s0.x + 10} ${s0.y - 54})">${figur("#e8763a", "fox")}</g>
        <g class="rw-figur-kind" transform="translate(${s0.x - 10} ${s0.y - 40})">${figur(A.C.lila, "rabbit")}</g>
        <g class="rw-wuerfelplatz" transform="translate(860 60)"></g>`);
      const kind = ctx.q(".rw-figur-kind");
      const fino = ctx.q(".rw-figur-fino");
      const platz = ctx.q(".rw-wuerfelplatz");
      const pos = { kind: 0, fino: 0 };
      const versatz = { kind: [-10, -40], fino: [10, -54] };
      let richtig = 0;
      let fragen = 0;

      const setze = (wer, n) => { const p = ort(n); ctx.setPos(wer === "kind" ? kind : fino, p.x + versatz[wer][0], p.y + versatz[wer][1]); };
      async function huepfe(wer, von, nach) {
        const g = wer === "kind" ? kind : fino;
        const schritt = nach > von ? 1 : -1;
        for (let n = von + schritt; schritt > 0 ? n <= nach : n >= nach; n += schritt) {
          if (!ctx.lebt()) return;
          const a = ort(n - schritt);
          const b = ort(n);
          await ctx.tween(320, (p) => ctx.setPos(g, a.x + (b.x - a.x) * p + versatz[wer][0], a.y + (b.y - a.y) * p - Math.sin(p * Math.PI) * 40 + versatz[wer][1]));
          ctx.blip(n);
          ctx.zeige(String(n));
          try { if (ctx.kids?.speak && wer === "kind") ctx.kids.speak(String(n)); } catch { /* ohne Stimme */ }
          await ctx.warte(wer === "kind" ? 260 : 120);
        }
      }
      function wuerfelZeigen(werte) {
        platz.innerHTML = werte.map((w, i) => A.wuerfel(i * 74 - (werte.length - 1) * 37 - 30, 0, 60, w, i ? A.C.blau : A.C.rot)).join("");
      }
      async function wuerfeln() {
        const werte = Array.from({ length: zweiWuerfel ? 2 : 1 }, () => ctx.rnd(1, augenMax));
        for (let k = 0; k < 6; k += 1) {
          wuerfelZeigen(werte.map(() => ctx.rnd(1, augenMax)));
          await ctx.warte(70);
        }
        wuerfelZeigen(werte);
        ctx.klack();
        return werte;
      }
      // Ein Knopf zum Würfeln in der Leiste.
      function warteAufWurf() {
        return new Promise((fertig) => {
          ctx.leereLeiste();
          const leiste = document.querySelector(".rechen-antworten");
          const knopf = document.createElement("button");
          knopf.type = "button";
          knopf.className = "rechen-wurf";
          knopf.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ffffff" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="8" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="16" cy="16" r="1.8" fill="currentColor"/></svg><span>Würfeln</span>`;
          knopf.addEventListener("click", () => { knopf.disabled = true; fertig(); }, { once: true });
          leiste?.append(knopf);
          window.setTimeout(() => knopf.focus?.({ preventScroll: true }), 30);
        });
      }
      // Auf «leicht» tippt das Kind seine Lok so oft an, wie der Würfel zeigt.
      function tippHuepfer(anzahl) {
        return new Promise((fertig) => {
          let rest = anzahl;
          kind.classList.add("rw-tippmich");
          const tipp = async () => {
            if (rest <= 0 || !ctx.lebt()) return;
            rest -= 1;
            const von = pos.kind;
            pos.kind = Math.min(ende, pos.kind + 1);
            kind.removeEventListener("click", tipp);
            await huepfe("kind", von, pos.kind);
            if (rest > 0 && pos.kind < ende) kind.addEventListener("click", tipp);
            else { kind.classList.remove("rw-tippmich"); fertig(); }
          };
          kind.addEventListener("click", tipp);
        });
      }

      await ctx.sage("Du bist der Hase, Fino ist der Fuchs. Würfle!");
      while (ctx.lebt() && pos.kind < ende) {
        await warteAufWurf();
        if (!ctx.lebt()) return null;
        const werte = await wuerfeln();
        const augen = werte.reduce((x, y) => x + y, 0);
        ctx.leereLeiste();
        if (ctx.stufe === "leicht") {
          await ctx.sage(`${augen === 1 ? "Ein Auge" : `${augen} Augen`}! Tippe ${augen === 1 ? "einmal" : `${augen} Mal`} auf deine Lok.`);
          await tippHuepfer(augen);
        } else {
          const nach = Math.min(ende, pos.kind + augen);
          const wurfText = werte.length === 2 ? `${werte[0]} und ${werte[1]}, zusammen ${augen}` : String(augen);
          ctx.sage(`Du hast ${wurfText}! Du stehst auf ${pos.kind === 0 ? "Start" : pos.kind}. Wo landest du?`);
          fragen += 1;
          const { ok } = await ctx.frage({ werte: R.auswahl(nach, 1, ende), richtig: nach, aufgabe: pos.kind > 0 ? { a: pos.kind, op: "+", b: augen } : null });
          if (ok) richtig += 1;
          if (!ctx.lebt()) return null;
          const von = pos.kind;
          pos.kind = nach;
          await huepfe("kind", von, nach);
        }
        if (!ctx.lebt()) return null;
        const w = weichen[pos.kind];
        if (w && pos.kind < ende) {
          await ctx.sage(w > 0 ? "Eine Weiche! Zwei Bahnhöfe vor." : "Eine Weiche! Zwei Bahnhöfe zurück.");
          const von = pos.kind;
          pos.kind = Math.max(1, Math.min(ende, pos.kind + w));
          await huepfe("kind", von, pos.kind);
        }
        if (pos.kind >= ende) break;
        // Fino ist dran. Er kommt nie vor dem Kind ins Ziel.
        await ctx.warte(400);
        const finoWerte = await wuerfeln();
        let finoAugen = finoWerte.reduce((x, y) => x + y, 0);
        if (pos.fino + finoAugen >= ende) finoAugen = Math.max(0, ende - 1 - pos.fino);
        await ctx.sage(finoAugen > 0 ? `Fino hüpft ${finoAugen} weiter.` : "Fino bleibt stehen.");
        if (!ctx.lebt()) return null;
        const vonF = pos.fino;
        pos.fino += finoAugen;
        if (finoAugen) await huepfe("fino", vonF, pos.fino);
        setze("fino", pos.fino);
        await ctx.warte(300);
      }
      if (!ctx.lebt()) return null;
      ctx.jingle("win");
      await ctx.sage("Ziel! Du hast gewonnen!");
      if (ctx.stufe === "leicht" || fragen === 0) return { punkte: 1, von: 1, detail: "Gewonnen!", speech: "Gewonnen!" };
      return { punkte: richtig, von: fragen, detail: `Gewonnen! ${richtig} von ${fragen} Mal richtig gelandet`, speech: `Gewonnen! ${richtig} von ${fragen} Mal hast du richtig gesagt, wo du landest.` };
    },
  });

  // ===========================================================================
  // Zahlenhaus
  // ===========================================================================
  // Auf dem Dach steht eine Zahl. Jedes Stockwerk hat zwei Zimmer: Links wohnen
  // schon Tiere, rechts ziehen so viele ein, dass es zusammen die Dachzahl ist.
  // Ist das Haus voll, sieht man die Treppe: 0 und 5, 1 und 4, 2 und 3 …
  function punkte(A, n, x, y, farbe, r = 7) {
    let s = "";
    for (let i = 0; i < n; i += 1) {
      const reihe = Math.floor(i / 5);
      const spalte = i % 5;
      s += `<circle cx="${x + spalte * (r * 2.6)}" cy="${y + reihe * (r * 2.6)}" r="${r}" fill="${farbe}"/>`;
    }
    return s;
  }
  R.spiel({
    id: "zahlenhaus",
    titel: "Zahlenhaus",
    help: "Zahlenhaus. Auf dem Dach steht eine Zahl. In jedem Stockwerk wohnen links schon Tiere. Wie viele müssen rechts einziehen, damit es zusammen die Zahl auf dem Dach ist?",
    async runde(ctx) {
      const A = ctx.art;
      const hoch = Math.min(ctx.deckel, 10);
      const zahl = ctx.stufe === "leicht" ? ctx.rnd(3, Math.min(5, hoch)) : ctx.stufe === "mittel" ? ctx.rnd(Math.min(5, hoch), Math.min(7, hoch)) : ctx.rnd(Math.min(6, hoch), hoch);
      // Leicht und mittel: alle Stockwerke 0 bis zahl. Schwer: fünf davon.
      let linke = Array.from({ length: zahl + 1 }, (_, i) => i);
      if (ctx.stufe === "schwer") linke = ctx.mische(linke).slice(0, 5).sort((x, y) => x - y);
      const stockwerke = linke.length;
      const H = Math.min(64, 360 / stockwerke);
      const breite = 420;
      const x0 = 290;
      const unten = 520;
      const r = H >= 54 ? 7 : 5.5;
      const reihenfolge = ctx.mische(linke.map((_, i) => i));
      let haus = `<rect width="1000" height="560" fill="#dff1f7"/><rect y="${unten}" width="1000" height="40" fill="#7cc05e"/>
        <path d="M${x0 - 30} ${unten - stockwerke * H} L${x0 + breite / 2} ${unten - stockwerke * H - 110} L${x0 + breite + 30} ${unten - stockwerke * H} Z" fill="${A.C.rot}"/>
        <circle cx="${x0 + breite / 2}" cy="${unten - stockwerke * H - 48}" r="36" fill="#ffffff"/>
        <text x="${x0 + breite / 2}" y="${unten - stockwerke * H - 34}" text-anchor="middle" font-size="44" ${A.FONT} fill="${A.C.rot}">${zahl}</text>`;
      linke.forEach((l, k) => {
        const y = unten - (k + 1) * H;
        haus += `<g class="rw-stock" data-k="${k}"><rect x="${x0}" y="${y}" width="${breite}" height="${H}" fill="#ffffff" stroke="#e2c389" stroke-width="3"/>
          <path d="M${x0 + breite / 2} ${y} V${y + H}" stroke="#e2c389" stroke-width="3"/>
          <g class="rw-links">${punkte(A, l, x0 + 22, y + (H - (l > 5 ? r * 2.6 : 0)) / 2, A.C.rot, r)}</g>
          <g class="rw-rechts"></g>
          <text class="rw-plus" x="${x0 + breite + 20}" y="${y + H / 2 + 8}" font-size="22" ${A.FONT} fill="${A.C.ink}" opacity="0">${l} + ${zahl - l}</text></g>`;
      });
      ctx.zeichne(haus);
      await ctx.sage(`Auf dem Dach steht ${zahl}. In jedes Stockwerk ziehen zusammen ${zahl} Tiere.`);
      let richtig = 0;
      for (const k of reihenfolge) {
        if (!ctx.lebt()) return null;
        const l = linke[k];
        const stock = ctx.svg.querySelector(`.rw-stock[data-k="${k}"]`);
        stock.querySelector("rect").setAttribute("fill", "#fff6c2");
        ctx.sage(`Links ${l === 1 ? "wohnt 1 Tier" : `wohnen ${l} Tiere`}. Wie viele ziehen rechts ein?`);
        const { ok } = await ctx.frage({ lo: 0, hi: zahl, richtig: zahl - l, aufgabe: { a: l, op: "+", b: zahl - l } });
        if (!ctx.lebt()) return null;
        if (ok) richtig += 1;
        const y = unten - (k + 1) * H;
        const rechts = zahl - l;
        stock.querySelector(".rw-rechts").innerHTML = punkte(A, rechts, x0 + breite / 2 + 22, y + (H - (rechts > 5 ? r * 2.6 : 0)) / 2, A.C.blau, r);
        stock.querySelector("rect").setAttribute("fill", "#ffffff");
        stock.querySelector(".rw-plus").setAttribute("opacity", "1");
        ctx.blip(k);
        await ctx.sage(ok ? `Ja! ${l} und ${rechts} sind ${zahl}.` : `Schau: ${rechts}. ${l} und ${rechts} sind ${zahl}.`);
        await ctx.warte(500);
      }
      if (!ctx.lebt()) return null;
      ctx.jingle("unlock");
      ctx.svg.querySelectorAll(".rw-stock rect").forEach((rect) => rect.setAttribute("fill", "#fffbe6"));
      await ctx.sage(ctx.stufe === "schwer" ? `Das Haus ist voll! Alle Stockwerke sind zusammen ${zahl}.` : `Das Haus ist voll! Siehst du die Treppe? Links wird es immer eins mehr, rechts immer eins weniger.`);
      return { punkte: richtig, von: stockwerke };
    },
  });
})();
