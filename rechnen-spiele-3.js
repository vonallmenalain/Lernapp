/*
 * rechnen-spiele-3.js – Die Spiele der Etappe 3: bis 20, Formen, Daten.
 *
 *   doppelexpress     ein Zug vor dem Spiegel: Verdoppeln, Fast-Verdoppeln
 *   zehnerfuellen     wie viele passen noch in den Zehnerwagen?
 *   waage             wie viele Kugeln noch dazu, damit sie gerade steht?
 *   zehnersprung      8 + 5: erst den Zehnerwagen voll, dann der Rest
 *   rechenkette       Start 3, + 2, − 1, + 4 – wo kommt der Zug an?
 *   schuettelbecher   wie viele Kugeln sind unter dem Becher?
 *   drachenfutter     der Drache will genau 7 Beeren, 4 hat er schon
 *   rueckwaerts       Rückwärts-Hüpfer: die Lok hüpft zurück
 *   zahlenstrahl      Wo hält der Zug? Die Zahl auf dem Gleis finden
 *   schlange          wie viele Wagen lang ist die Schlange?
 *   strichliste       Autos am Bahnübergang: Striche machen, Fünferbündel
 *   formen            Formen-Güterzug: Ladung in den passenden Wagen
 *   formpuzzle        Tangram-Lok: Formen in den Umriss legen
 *   spiegelsignal     die andere Hälfte spiegeln
 */
(() => {
  "use strict";

  const R = window.LernappRechenSpiel;
  if (!R) return;

  const SPUR = 448;
  const bis = (ctx, leicht = 5, mittel = 10, schwer = 20) => Math.max(3, Math.min({ leicht, mittel, schwer }[ctx.stufe] || mittel, ctx.deckel));
  const zahlwort = (n, ein, mehr) => (n === 1 ? `1 ${ein}` : `${n} ${mehr}`);

  // ===========================================================================
  // Doppel-Express
  // ===========================================================================
  R.spiel({
    id: "doppelexpress",
    titel: "Doppel-Express",
    help: "Doppel-Express. Ein Zug fährt vor den Spiegel: Im Spiegel sind gleich viele Wagen. Wie viele sind es zusammen?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 6, 10, 19);
      const fast = ctx.stufe === "schwer" && max >= 9;
      const t = ctx.ziehe(() => { const a = ctx.rnd(1, Math.floor((max - (fast ? 1 : 0)) / 2)); return { a, key: String(a) }; });
      const a = t.a;
      const b = fast ? a + 1 : a;
      // Links der Zug, rechts sein Spiegelbild (der zweite Zug fährt gespiegelt).
      let links = "";
      for (let i = 0; i < a; i += 1) links += A.wagen(500 - (i + 1) * 46, A.fuenfer(i), 0.72, i);
      let rechts = "";
      for (let i = 0; i < b; i += 1) rechts += A.wagen(504 + i * 46, i < a ? A.fuenfer(i) : A.C.gelb, 0.72, a + i);
      ctx.zeichne(`${A.raum(SPUR)}<rect x="496" y="120" width="8" height="340" fill="#9aa3b5"/><rect x="420" y="100" width="160" height="30" rx="8" fill="#c9d1df"/><text x="500" y="122" text-anchor="middle" font-size="20" ${A.FONT} fill="${A.C.ink}">Spiegel</text>
        <g class="rw-z1" transform="translate(0 ${SPUR})">${links}</g><g class="rw-z2" transform="translate(0 ${SPUR})" opacity="0.85">${rechts}</g>`);
      await ctx.sage(fast ? `Links ${zahlwort(a, "Wagen", "Wagen")}, rechts einer mehr. Wie viele sind es zusammen?` : `${zahlwort(a, "Wagen", "Wagen")} und im Spiegel noch einmal ${a}. Wie viele sind es zusammen?`);
      const { ok } = await ctx.frage({ werte: R.auswahl(a + b, 2, 20), richtig: a + b, aufgabe: { a, op: "+", b } });
      if (!ctx.lebt()) return ok;
      const orte = [...ctx.wagenOrte(ctx.q(".rw-z1")).reverse(), ...ctx.wagenOrte(ctx.q(".rw-z2"))];
      await ctx.zaehle(orte, 200);
      const satz = fast ? `${a} und ${a} sind ${2 * a}, und eins mehr: ${a + b}.` : `${a} und ${a} sind ${2 * a}.`;
      await ctx.sage(ok ? `Genau! ${satz}` : `Schau: ${satz}`);
      return ok;
    },
  });

  // ===========================================================================
  // Zehnerwagen füllen
  // ===========================================================================
  R.spiel({
    id: "zehnerfuellen",
    titel: "Zehnerwagen füllen",
    help: "Zehnerwagen füllen. Im Wagen sitzen schon ein paar Tiere. Wie viele passen noch hinein, bis er voll ist?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const fuenf = ctx.stufe === "leicht" || ctx.deckel < 10;
      const voll = fuenf ? 5 : 10;
      const t = ctx.ziehe(() => { const n = ctx.rnd(1, voll - 1); return { n, key: String(n) }; });
      const n = t.n;
      const start = ctx.rnd(0, 9);
      const w = A.fensterWagen(n, fuenf ? 1 : 2, 520, A.TIERE, start);
      ctx.zeichne(`${A.fensterBlick()}`);
      const zug = ctx.q(".rw-fensterzug");
      ctx.setPos(zug, 240, 404);
      zug.innerHTML = w.svg;
      ctx.sage(`Im Wagen ${n === 1 ? "sitzt 1 Tier" : `sitzen ${n} Tiere`}. Wie viele passen noch hinein?`);
      const { ok } = await ctx.frage({ lo: 0, hi: voll, richtig: voll - n, aufgabe: { a: n, op: "+", b: voll - n } });
      if (!ctx.lebt()) return ok;
      const neu = A.fensterWagen(voll, fuenf ? 1 : 2, 520, A.TIERE, start);
      zug.innerHTML = neu.svg;
      await ctx.zaehle(neu.plaetze.slice(n).map((p) => ({ g: zug, x: p.x, y: p.y + 6 })), 240);
      await ctx.sage(ok ? `Genau! ${n} und ${voll - n} sind ${voll}.` : `Schau: ${n} und ${voll - n} sind ${voll}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Waage
  // ===========================================================================
  function waageBild(A, links, rechts, neigung, extra = "") {
    const kugeln = (n, cx, farbe) => Array.from({ length: n }, (_, i) => `<circle cx="${cx - 48 + (i % 5) * 24}" cy="${-24 - Math.floor(i / 5) * 22}" r="11" fill="${farbe}"/>`).join("");
    const winkel = Math.max(-12, Math.min(12, neigung));
    return `<rect width="1000" height="560" fill="#fff1cf"/><rect y="470" width="1000" height="90" fill="#d9a46c"/>
      <rect x="490" y="200" width="20" height="270" fill="#8a5a35"/><rect x="420" y="460" width="160" height="16" rx="6" fill="#8a5a35"/>
      <g class="rw-balken" transform="rotate(${winkel} 500 200)">
        <rect x="190" y="194" width="620" height="12" rx="6" fill="#8a5a35"/><circle cx="500" cy="200" r="12" fill="#f4b400"/>
        <g transform="translate(240 206)"><path d="M0 0 L-60 120 M0 0 L60 120" stroke="#9aa3b5" stroke-width="3"/><g transform="rotate(${-winkel} 0 120)"><path d="M-90 120 Q0 160 90 120 Z" fill="#c9d1df"/><g transform="translate(0 120)" class="rw-links">${kugeln(links, 0, "#e8543f")}</g></g></g>
        <g transform="translate(760 206)"><path d="M0 0 L-60 120 M0 0 L60 120" stroke="#9aa3b5" stroke-width="3"/><g transform="rotate(${-winkel} 0 120)"><path d="M-90 120 Q0 160 90 120 Z" fill="#c9d1df"/><g transform="translate(0 120)" class="rw-rechts">${kugeln(rechts, 0, "#3d7be0")}</g></g></g>
      </g>${extra}`;
  }
  R.spiel({
    id: "waage",
    titel: "Waage",
    help: "Waage. Links liegen mehr Kugeln als rechts, darum hängt die Waage schief. Wie viele Kugeln müssen rechts noch dazu, damit sie gerade steht?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 15);
      const t = ctx.ziehe(() => { const a = ctx.rnd(2, max); const b = ctx.rnd(0, a - 1); return { a, b, key: `${a}|${b}` }; });
      const { a, b } = t;
      ctx.zeichne(waageBild(A, a, b, -(a - b) * 2.4));
      ctx.sage(`Links ${zahlwort(a, "Kugel", "Kugeln")}, rechts ${zahlwort(b, "Kugel", "Kugeln")}. Wie viele müssen rechts noch dazu?`);
      const { ok } = await ctx.frage({ lo: 0, hi: max, richtig: a - b, aufgabe: { a: b, op: "+", b: a - b } });
      if (!ctx.lebt()) return ok;
      for (let k = b + 1; k <= a; k += 1) {
        if (!ctx.lebt()) return ok;
        ctx.zeichne(waageBild(A, a, k, -(a - k) * 2.4));
        ctx.blip(k);
        await ctx.warte(220);
      }
      await ctx.sage(ok ? `Genau! Jetzt ist es gleich viel: ${a} und ${a}.` : `Schau: Es fehlten ${a - b}. Jetzt ist es gleich viel.`);
      return ok;
    },
  });

  // ===========================================================================
  // Zehner-Sprung
  // ===========================================================================
  R.spiel({
    id: "zehnersprung",
    titel: "Zehner-Sprung",
    help: "Zehner-Sprung. Zuerst wird der Zehnerwagen voll gemacht, dann kommt der Rest in den nächsten Wagen. So geht Rechnen über die Zehn.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const t = ctx.ziehe(() => { const a = ctx.rnd(6, 9); const b = ctx.rnd(11 - a, Math.min(9, 20 - a)); return a + b > Math.max(11, ctx.deckel) ? null : { a, b, key: `${a}+${b}` }; });
      const { a, b } = t;
      const voll = 10 - a;
      const rest = b - voll;
      const zeichne = (n1, n2) => {
        const w1 = A.fensterWagen(n1, 2, 400, A.TIERE, 0);
        const w2 = A.fensterWagen(n2, 2, 400, A.TIERE, 3);
        ctx.zeichne(`${A.fensterBlick()}`);
        const zug = ctx.q(".rw-fensterzug");
        ctx.setPos(zug, 92, 404);
        zug.innerHTML = `${w1.svg}<rect x="400" y="-40" width="16" height="6" fill="#2f3a52"/><g transform="translate(416 0)">${w2.svg}</g>`;
        return { zug, w1, w2 };
      };
      zeichne(a, 0);
      await ctx.sage(`${a} + ${b}. Zuerst machen wir den Zehnerwagen voll: Wie viele passen noch hinein?`, `${a} plus ${b}. Zuerst machen wir den Zehnerwagen voll: Wie viele passen noch hinein?`);
      const erst = await ctx.frage({ lo: 0, hi: 9, richtig: voll, aufgabe: { a, op: "+", b: voll } });
      if (!ctx.lebt()) return erst.ok;
      zeichne(10, 0);
      await ctx.sage(`${voll}. Dann bleiben von ${b} noch ${rest}. Wie viel ist ${a} + ${b}?`, `${voll}. Dann bleiben von ${b} noch ${rest}. Wie viel ist ${a} plus ${b}?`);
      const { ok } = await ctx.frage({ werte: R.auswahl(a + b, 10, 20), richtig: a + b, aufgabe: { a, op: "+", b } });
      if (!ctx.lebt()) return ok;
      zeichne(10, rest);
      await ctx.sage(ok ? `Genau! 10 und ${rest} sind ${a + b}.` : `Schau: 10 und ${rest} sind ${a + b}.`);
      return ok && erst.ok;
    },
  });

  // ===========================================================================
  // Rechenkette
  // ===========================================================================
  R.spiel({
    id: "rechenkette",
    titel: "Rechenkette",
    help: "Rechenkette. Der Zug fährt eine Strecke: Er beginnt bei einer Zahl, und an jedem Bahnhof kommt etwas dazu oder geht weg. Wo kommt er an?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 10, 10, 20);
      const schritte = ctx.stufe === "leicht" ? 2 : ctx.stufe === "mittel" ? 3 : 4;
      const t = ctx.ziehe(() => {
        let wert = ctx.rnd(1, max - 3);
        const start = wert;
        const kette = [];
        for (let i = 0; i < schritte; i += 1) {
          const minus = ctx.minus && ctx.stufe !== "leicht" && Math.random() < 0.45 && wert > 1;
          const z = minus ? ctx.rnd(1, Math.min(4, wert - 0)) : ctx.rnd(1, Math.min(4, max - wert));
          if (!minus && wert + z > max) return null;
          wert += minus ? -z : z;
          kette.push({ minus, z, wert });
        }
        return { start, kette, ende: wert, key: `${start}|${kette.map((k) => (k.minus ? -k.z : k.z)).join(",")}` };
      });
      const { start, kette, ende } = t;
      const dx = 820 / schritte;
      let bild = `${A.raum(SPUR)}<g transform="translate(90 ${SPUR})"><rect x="-38" y="-112" width="76" height="48" rx="10" fill="#ffffff" stroke="${A.C.blau}" stroke-width="4"/><text y="-76" text-anchor="middle" font-size="34" ${A.FONT} fill="${A.C.ink}">${start}</text><rect x="-3" y="-64" width="6" height="64" fill="#5d6882"/></g>`;
      kette.forEach((k, i) => {
        const x = 90 + (i + 1) * dx;
        bild += `<g transform="translate(${x - dx / 2} ${SPUR - 160})"><rect x="-44" y="-26" width="88" height="48" rx="12" fill="${k.minus ? "#ffe3dd" : "#e3f6ea"}" stroke="${k.minus ? A.C.rot : "#3fbf74"}" stroke-width="3"/><text y="10" text-anchor="middle" font-size="30" ${A.FONT} fill="${A.C.ink}">${k.minus ? "−" : "+"} ${k.z}</text></g>`;
        bild += `<g class="rw-kette" data-i="${i}" transform="translate(${x} ${SPUR})"><rect x="-38" y="-112" width="76" height="48" rx="10" fill="#ffffff" stroke="${A.C.blau}" stroke-width="4"/><text class="rw-kz" y="-76" text-anchor="middle" font-size="34" ${A.FONT} fill="${A.C.rot}">?</text><rect x="-3" y="-64" width="6" height="64" fill="#5d6882"/></g>`;
      });
      ctx.zeichne(bild);
      const satz = `Start bei ${start}. ${kette.map((k) => `${k.minus ? "Minus" : "Plus"} ${k.z}.`).join(" ")} Wo kommt der Zug an?`;
      // Gesprochen mit «!»: Hinter «Start bei 3.» beginnt für kids.js kein
      // neuer Satz (wie bei «der 3. Stock»), und die Stücke fänden ihre
      // Aufnahmen nicht.
      ctx.sage(satz, `Start bei ${start}! ${kette.map((k) => `${k.minus ? "Minus" : "Plus"} ${k.z}!`).join(" ")} Wo kommt der Zug an?`);
      const { ok } = await ctx.frage({ werte: R.auswahl(ende, 0, max), richtig: ende });
      if (!ctx.lebt()) return ok;
      for (let i = 0; i < kette.length; i += 1) {
        ctx.svg.querySelectorAll(".rw-kz")[i].textContent = String(kette[i].wert);
        ctx.svg.querySelectorAll(".rw-kz")[i].setAttribute("fill", A.C.ink);
        ctx.blip(i);
        await ctx.warte(380);
      }
      await ctx.sage(ok ? `Genau! Der Zug kommt bei ${ende} an.` : `Schau: ${[start, ...kette.map((k) => k.wert)].join(", ")}. Er kommt bei ${ende} an.`, ok ? null : `Schau: Er kommt bei ${ende} an.`);
      return ok;
    },
  });

  // ===========================================================================
  // Schüttelbecher
  // ===========================================================================
  R.spiel({
    id: "schuettelbecher",
    titel: "Schüttelbecher",
    help: "Schüttelbecher. Im Becher sind Kugeln. Geschüttelt fallen sie auf zwei Seiten – eine Seite ist zugedeckt. Wie viele sind darunter?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const n = ctx.stufe === "leicht" ? ctx.rnd(3, max) : ctx.rnd(5, max);
      const t = ctx.ziehe(() => { const k = ctx.rnd(0, n); return { k, key: `${n}|${k}` }; });
      const k = t.k;
      const kugeln = (anzahl, x, farbe) => Array.from({ length: anzahl }, (_, i) => `<circle cx="${x + (i % 5) * 34}" cy="${330 + Math.floor(i / 5) * 34}" r="14" fill="${farbe}"/>`).join("");
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/><path d="M80 300 Q260 440 440 300 Z" fill="#c9d1df"/><path d="M560 300 Q740 440 920 300 Z" fill="#c9d1df"/>
        ${kugeln(k, 180, A.C.rot)}${kugeln(n - k, 660, A.C.blau)}
        <g class="rw-becher" transform="translate(740 380)"><path d="M-120 0 L-90 -220 L90 -220 L120 0 Z" fill="${A.C.lila}"/><rect x="-100" y="-236" width="200" height="22" rx="8" fill="#8577f0"/></g>
        <text x="500" y="120" text-anchor="middle" font-size="64" ${A.FONT} fill="${A.C.ink}">${n}</text>`);
      ctx.klack();
      ctx.sage(`${n} Kugeln. Links ${zahlwort(k, "Kugel", "Kugeln")}. Wie viele sind unter dem Becher?`);
      const { ok } = await ctx.frage({ lo: 0, hi: n, richtig: n - k, aufgabe: { a: k, op: "+", b: n - k } });
      if (!ctx.lebt()) return ok;
      const becher = ctx.q(".rw-becher");
      await ctx.tween(600, (p) => becher.setAttribute("transform", `translate(${740 + p * 120} ${380 - p * 260}) rotate(${p * 20})`));
      await ctx.sage(ok ? `Genau! ${k} und ${n - k} sind ${n}.` : `Schau: ${n - k}. ${k} und ${n - k} sind ${n}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Drachenfutter
  // ===========================================================================
  R.spiel({
    id: "drachenfutter",
    titel: "Drachenfutter",
    help: "Drachenfutter. Dein Drache möchte genau so viele Beeren, wie auf seinem Schild steht. Ein paar liegen schon auf dem Teller. Tippe Beeren aus der Schale an, bis es genau stimmt.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 15);
      const t = ctx.ziehe(() => { const n = ctx.rnd(3, max); const k = ctx.rnd(1, n - 1); return { n, k, key: `${n}|${k}` }; });
      const { n, k } = t;
      let gegeben = 0;
      const zeichne = () => {
        const beeren = (anzahl, x, y, klasse = "") => Array.from({ length: anzahl }, (_, i) => `<circle class="${klasse}" cx="${x + (i % 5) * 30}" cy="${y + Math.floor(i / 5) * 30}" r="12" fill="#c2185b"/>`).join("");
        ctx.zeichne(`<rect width="1000" height="560" fill="#fff1cf"/><rect y="440" width="1000" height="120" fill="#d9a46c"/>
          <g transform="translate(220 430) scale(1.2)">${A.drache({ leben: ctx.stand.drache().leben, stufe: ctx.stand.drache().stufe })}</g>
          <g transform="translate(220 90)">${A.schild(0, 0, n, A.C.rot)}</g>
          <ellipse cx="560" cy="420" rx="150" ry="30" fill="#ffffff" stroke="#c9d1df" stroke-width="4"/>${beeren(k + gegeben, 500, 380)}
          <path d="M760 380 Q860 460 960 380 Z" fill="#8a5a35"/><g class="rw-schale">${Array.from({ length: 10 }, (_, i) => `<circle class="rw-beere" cx="${790 + (i % 5) * 34}" cy="${340 + Math.floor(i / 5) * 32}" r="14" fill="#c2185b" role="button" tabindex="0" aria-label="Beere"/>`).join("")}</g>`);
        ctx.svg.querySelectorAll(".rw-beere").forEach((b) => b.addEventListener("click", () => { if (k + gegeben < 20) { gegeben += 1; ctx.blip(gegeben); zeichne(); } }));
        ctx.zeige(gegeben ? `${k} und ${gegeben} sind ${k + gegeben}.` : `Dein Drache möchte ${n} Beeren. ${k} hat er schon.`);
      };
      zeichne();
      await ctx.sage(`Dein Drache möchte ${n} Beeren. ${k} hat er schon. Gib ihm, was fehlt!`);
      await ctx.aktion({ text: "Fertig", icon: "haken" });
      if (!ctx.lebt()) return false;
      const ok = gegeben === n - k;
      ctx.jingle(ok ? "correct" : "retry");
      if (ok) ctx.lauf.richtig += 1;
      ctx.stand.aufgabeGeuebt(ctx.stand.aufgabeKey(k, "+", n - k), ok, Infinity);
      await ctx.sage(ok ? `Mmh, genau ${n}! ${k} und ${n - k} sind ${n}.` : `Es fehlten ${n - k}: ${k} und ${n - k} sind ${n}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Rückwärts-Hüpfer und Wo hält der Zug?
  // ===========================================================================
  function strahl(A, bisZahl, y = 360) {
    const x0 = 70;
    const x1 = 930;
    const dx = (x1 - x0) / bisZahl;
    let s = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#8b95a8" stroke-width="10" stroke-linecap="round"/>`;
    const beschrift = bisZahl <= 20 ? 1 : 10;
    for (let n = 0; n <= bisZahl; n += 1) {
      const x = x0 + n * dx;
      const lang = n % 5 === 0;
      if (bisZahl > 20 && n % 5 !== 0) continue;
      s += `<line x1="${x}" y1="${y - (lang ? 22 : 14)}" x2="${x}" y2="${y + (lang ? 22 : 14)}" stroke="${A.C.ink}" stroke-width="${lang ? 4 : 2}"/>`;
      if (n % beschrift === 0 && (bisZahl <= 10 || lang || bisZahl <= 20)) s += `<text x="${x}" y="${y + 56}" text-anchor="middle" font-size="${bisZahl > 10 ? 22 : 30}" ${A.FONT} fill="${A.C.ink}">${n}</text>`;
    }
    return { svg: s, xVon: (n) => x0 + n * dx, nVon: (x) => (x - x0) / dx };
  }
  R.spiel({
    id: "rueckwaerts",
    titel: "Rückwärts-Hüpfer",
    help: "Rückwärts-Hüpfer. Die Lok steht auf einer Zahl und hüpft zurück, so weit wie auf dem Billett steht. Wo landet sie?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 10, 10, 20);
      const t = ctx.ziehe(() => { const a = ctx.rnd(3, max); const b = ctx.rnd(1, Math.min(5, a)); return { a, b, key: `${a}-${b}` }; });
      const { a, b } = t;
      const s = strahl(A, max);
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/>${s.svg}<g transform="translate(500 90)"><rect x="-90" y="-40" width="180" height="80" rx="12" fill="#ffffff" stroke="${A.C.rot}" stroke-width="4" stroke-dasharray="10 6"/><text y="20" text-anchor="middle" font-size="54" ${A.FONT} fill="${A.C.rot}">− ${b}</text></g><g class="rw-boegen"></g><g class="rw-mini" transform="translate(${s.xVon(a)} 360)"><g transform="translate(42 -18) scale(-1 1)">${A.lok(0.78, false)}</g></g>`);
      ctx.sage(`Die Lok steht bei ${a} und hüpft ${b} zurück. Wo landet sie?`);
      const { ok } = await ctx.frage({ werte: R.auswahl(a - b, 0, max), richtig: a - b, aufgabe: { a, op: "-", b } });
      if (!ctx.lebt()) return ok;
      const mini = ctx.q(".rw-mini");
      const boegen = ctx.q(".rw-boegen");
      for (let n = a - 1; n >= a - b; n -= 1) {
        const xa = s.xVon(n + 1);
        const xb = s.xVon(n);
        boegen.insertAdjacentHTML("beforeend", `<path d="M${xa} 340 Q${(xa + xb) / 2} 270 ${xb} 340" stroke="${A.C.rot}" stroke-width="5" fill="none"/>`);
        await ctx.tween(300, (p) => ctx.setPos(mini, xa + (xb - xa) * p, 360 - Math.sin(p * Math.PI) * 70));
        ctx.blip(n);
        try { ctx.kids?.speak?.(String(n)); } catch { /* ohne Stimme */ }
        await ctx.warte(160);
      }
      await ctx.sage(ok ? `Genau! ${a} minus ${b} sind ${a - b}.` : `Schau: ${a} minus ${b} sind ${a - b}.`);
      return ok;
    },
  });
  R.spiel({
    id: "zahlenstrahl",
    titel: "Wo hält der Zug?",
    help: "Wo hält der Zug? Oben steht eine Zahl. Tippe auf die Stelle am Gleis, wo diese Zahl liegt.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = ctx.stufe === "leicht" ? 10 : ctx.stufe === "mittel" ? 20 : Math.min(100, Math.max(20, ctx.deckel));
      const t = ctx.ziehe(() => { const n = ctx.rnd(1, max - 1); return { n, key: String(n) }; });
      const n = t.n;
      const s = strahl(A, max);
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/><text x="500" y="150" text-anchor="middle" font-size="96" ${A.FONT} fill="${A.C.ink}">${n}</text>${s.svg}<rect class="rw-gleisfeld" x="40" y="300" width="920" height="120" fill="#000" fill-opacity="0"/><g class="rw-marken"></g>`);
      ctx.sage(`Wo liegt die ${n}? Tippe aufs Gleis!`);
      const x = await new Promise((fertig) => {
        ctx.q(".rw-gleisfeld").addEventListener("click", (e) => {
          const p = ctx.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
          const m = ctx.svg.getScreenCTM();
          fertig(m ? p.matrixTransform(m.inverse()).x : 500);
        }, { once: true });
      });
      if (!ctx.lebt()) return false;
      const getippt = Math.max(0, Math.min(max, s.nVon(x)));
      const daneben = Math.abs(getippt - n);
      const ok = daneben <= Math.max(0.6, max / 20);
      ctx.jingle(ok ? "correct" : "retry");
      if (ok) ctx.lauf.richtig += 1;
      ctx.q(".rw-marken").innerHTML = `<g transform="translate(${s.xVon(getippt)} 360)"><path d="M0 -30 L-14 -56 L14 -56 Z" fill="${A.C.lila}"/></g><g transform="translate(${s.xVon(n)} 300)"><rect x="-34" y="-58" width="68" height="44" rx="8" fill="#ffffff" stroke="#3fbf74" stroke-width="4"/><text y="-26" text-anchor="middle" font-size="28" ${A.FONT} fill="${A.C.ink}">${n}</text><path d="M0 -14 V40" stroke="#3fbf74" stroke-width="4"/></g>`;
      await ctx.sage(ok ? "Genau getroffen!" : `Die ${n} liegt hier – schau, wo das grüne Schild steht.`);
      return ok;
    },
  });

  // ===========================================================================
  // Wie lang ist die Schlange?
  // ===========================================================================
  R.spiel({
    id: "schlange",
    titel: "Wie lang ist die Schlange?",
    help: "Wie lang ist die Schlange? Miss mit den Wagen: Wie viele Wagen lang ist sie?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 6, 10, 12);
      const t = ctx.ziehe(() => { const n = ctx.rnd(3, max); return { n, key: String(n) }; });
      const n = t.n;
      const w = 64 * Math.min(1, 12 / Math.max(n, 12));
      const x0 = 500 - (n * w) / 2;
      let schlange = `<path d="M${x0} 260 ${Array.from({ length: n * 2 }, (_, i) => `Q${x0 + (i + 0.5) * (w / 2)} ${i % 2 ? 230 : 290} ${x0 + (i + 1) * (w / 2)} 260`).join(" ")}" stroke="#3fbf74" stroke-width="30" fill="none" stroke-linecap="round"/><circle cx="${x0 + n * w + 6}" cy="260" r="22" fill="#3fbf74"/><circle cx="${x0 + n * w + 12}" cy="252" r="4" fill="${A.C.ink}"/>`;
      let wagen = "";
      for (let i = 0; i < n; i += 1) wagen += A.wagen(i * w + 3, A.fuenfer(i), w / 64, i);
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/>${schlange}<g class="rw-mess" transform="translate(${x0} 420)" opacity="0">${wagen}</g><path d="M${x0} 320 V350 M${x0 + n * w} 320 V350" stroke="${A.C.ink}" stroke-width="3"/>`);
      ctx.sage("Wie viele Wagen lang ist die Schlange?");
      const { ok } = await ctx.frage({ lo: 1, hi: max, richtig: n });
      if (!ctx.lebt()) return ok;
      const mess = ctx.q(".rw-mess");
      await ctx.tween(300, (p) => mess.setAttribute("opacity", String(p)));
      await ctx.zaehle(ctx.wagenOrte(mess), 200);
      await ctx.sage(ok ? `Genau, ${n} Wagen lang!` : `Schau: ${n} Wagen lang.`);
      return ok;
    },
  });

  // ===========================================================================
  // Strichliste am Bahnübergang
  // ===========================================================================
  const AUTOFARBEN = [{ id: "rot", f: "#e8543f", name: "rote" }, { id: "blau", f: "#3d7be0", name: "blaue" }, { id: "gelb", f: "#f4b400", name: "gelbe" }];
  R.spiel({
    id: "strichliste",
    titel: "Strichliste",
    help: "Strichliste am Bahnübergang. Tippe jedes Auto einmal an – für jedes gibt es einen Strich bei seiner Farbe. Der fünfte Strich geht quer. Dann: Welche Farbe kam am meisten?",
    aufgaben: 3,
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = ctx.stufe === "leicht" ? 6 : ctx.stufe === "mittel" ? 10 : 14;
      const zahlen = AUTOFARBEN.map(() => ctx.rnd(1, Math.floor(max / 2)));
      const top = Math.max(...zahlen);
      if (zahlen.filter((z) => z === top).length > 1) zahlen[ctx.rnd(0, 2)] = top + 1;
      const autos = ctx.mische(zahlen.flatMap((z, i) => Array.from({ length: z }, () => i)));
      const striche = [0, 0, 0];
      const zeichneListe = () => AUTOFARBEN.map((c, i) => {
        let s = `<g transform="translate(70 ${110 + i * 60})"><rect x="0" y="-22" width="44" height="30" rx="8" fill="${c.f}"/>`;
        for (let k = 0; k < striche[i]; k += 1) {
          const gruppe = Math.floor(k / 5);
          const inGruppe = k % 5;
          const gx = 70 + gruppe * 70;
          s += inGruppe === 4 ? `<line x1="${gx - 6}" y1="0" x2="${gx + 50}" y2="-26" stroke="${A.C.ink}" stroke-width="5" stroke-linecap="round"/>` : `<line x1="${gx + inGruppe * 12}" y1="-28" x2="${gx + inGruppe * 12}" y2="4" stroke="${A.C.ink}" stroke-width="5" stroke-linecap="round"/>`;
        }
        return `${s}</g>`;
      }).join("");
      let bild = `<rect width="1000" height="560" fill="#e8f6ee"/><rect x="40" y="60" width="430" height="200" rx="16" fill="#ffffff" stroke="#c9d1df" stroke-width="3"/><g class="rw-liste">${zeichneListe()}</g><rect y="380" width="1000" height="90" fill="#9aa3b5"/>`;
      autos.forEach((farbe, i) => {
        const x = 70 + (i % 9) * 100;
        const y = 330 + Math.floor(i / 9) * 70;
        bild += `<g class="rw-auto" data-farbe="${farbe}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${AUTOFARBEN[farbe].name} Auto"><rect x="-36" y="-26" width="72" height="34" rx="10" fill="${AUTOFARBEN[farbe].f}"/><rect x="-22" y="-42" width="44" height="22" rx="8" fill="${AUTOFARBEN[farbe].f}"/><circle cx="-20" cy="10" r="9" fill="#2f3a52"/><circle cx="20" cy="10" r="9" fill="#2f3a52"/><rect x="-40" y="-46" width="80" height="66" fill="#000" fill-opacity="0"/></g>`;
      });
      ctx.zeichne(bild);
      await ctx.sage("Tippe jedes Auto an!");
      let rest = autos.length;
      while (rest > 0 && ctx.lebt()) {
        const g = await new Promise((fertig) => {
          const alle = [...ctx.svg.querySelectorAll(".rw-auto:not(.ist-weg)")];
          alle.forEach((h) => h.addEventListener("click", () => { alle.forEach((x) => { if (x !== h) x.replaceWith(x.cloneNode(true)); }); fertig(h); }, { once: true }));
        });
        g.classList.add("ist-weg");
        g.setAttribute("opacity", "0.25");
        striche[Number(g.dataset.farbe)] += 1;
        ctx.q(".rw-liste").innerHTML = zeichneListe();
        ctx.blip(striche[Number(g.dataset.farbe)]);
        rest -= 1;
      }
      if (!ctx.lebt()) return false;
      ctx.sage("Welche Farbe kam am meisten?");
      const meist = zahlen.indexOf(Math.max(...zahlen));
      const { ok } = await ctx.waehle({ knoepfe: AUTOFARBEN.map((c, i) => ({ wert: i, html: `<svg viewBox="-40 -48 80 64" aria-hidden="true"><rect x="-36" y="-26" width="72" height="34" rx="10" fill="${c.f}"/><rect x="-22" y="-42" width="44" height="22" rx="8" fill="${c.f}"/></svg>`, label: c.name })), richtig: meist });
      if (!ctx.lebt()) return ok;
      await ctx.sage(`${AUTOFARBEN.map((c, i) => `${zahlen[i]} ${c.name}`).join(", ")}. Am meisten: ${AUTOFARBEN[meist].name}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Formen-Güterzug
  // ===========================================================================
  const FORMEN = {
    kreis: { name: "Kreis", zeichne: (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>` },
    dreieck: { name: "Dreieck", zeichne: (x, y, r, f) => `<path d="M${x} ${y - r} L${x + r} ${y + r * 0.8} L${x - r} ${y + r * 0.8} Z" fill="${f}"/>` },
    quadrat: { name: "Quadrat", zeichne: (x, y, r, f) => `<rect x="${x - r * 0.85}" y="${y - r * 0.85}" width="${r * 1.7}" height="${r * 1.7}" fill="${f}"/>` },
    rechteck: { name: "Rechteck", zeichne: (x, y, r, f) => `<rect x="${x - r * 1.2}" y="${y - r * 0.6}" width="${r * 2.4}" height="${r * 1.2}" fill="${f}"/>` },
    kugel: { name: "Kugel", zeichne: (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8543f"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.35}" rx="${r * 0.3}" ry="${r * 0.2}" fill="#ffffff" fill-opacity="0.5"/>` },
    wuerfel: { name: "Würfel", zeichne: (x, y, r) => `<path d="M${x - r} ${y - r * 0.4} L${x - r * 0.4} ${y - r} L${x + r} ${y - r} L${x + r} ${y + r * 0.4} L${x + r * 0.4} ${y + r} L${x - r} ${y + r} Z" fill="#3d7be0"/><path d="M${x - r} ${y - r * 0.4} H${x + r * 0.4} V${y + r} M${x + r * 0.4} ${y - r * 0.4} L${x + r} ${y - r}" stroke="#ffffff" stroke-width="3" fill="none"/>` },
    zylinder: { name: "Zylinder", zeichne: (x, y, r) => `<rect x="${x - r * 0.7}" y="${y - r}" width="${r * 1.4}" height="${r * 2}" fill="#f4b400"/><ellipse cx="${x}" cy="${y - r}" rx="${r * 0.7}" ry="${r * 0.25}" fill="#ffd166"/><ellipse cx="${x}" cy="${y + r}" rx="${r * 0.7}" ry="${r * 0.25}" fill="#f4b400"/>` },
  };
  R.spiel({
    id: "formen",
    titel: "Formen-Güterzug",
    help: "Formen-Güterzug. Jeder Wagen hat seine Form. Tippe auf den Wagen, in den die Ladung passt.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const arten = ctx.stufe === "schwer" ? ["kugel", "wuerfel", "zylinder", "kreis"] : ctx.stufe === "mittel" ? ["kreis", "dreieck", "quadrat", "rechteck"] : ["kreis", "dreieck", "quadrat"];
      const t = ctx.ziehe(() => { const f = arten[ctx.rnd(0, arten.length - 1)]; return { f, key: f + ctx.rnd(0, 3) }; });
      const farbe = ["#e8543f", "#3d7be0", "#3fbf74", "#ef6fa8"][ctx.rnd(0, 3)];
      let bild = `${A.raum(SPUR)}`;
      arten.forEach((f, i) => {
        const x = 70 + i * (860 / arten.length);
        const w = 860 / arten.length - 30;
        bild += `<g class="rw-gw" data-f="${f}" transform="translate(${x} ${SPUR})"><rect x="0" y="-140" width="${w}" height="110" rx="12" fill="${A.C.holz}"/><g opacity="0.35">${FORMEN[f].zeichne(w / 2, -85, 36, "#ffffff")}</g><circle cx="${w * 0.2}" cy="-16" r="15" fill="${A.C.dunkel}"/><circle cx="${w * 0.8}" cy="-16" r="15" fill="${A.C.dunkel}"/></g>`;
      });
      bild += `<g class="rw-ladung">${FORMEN[t.f].zeichne(500, 140, 54, farbe)}</g>`;
      ctx.zeichne(bild);
      ctx.sage(ctx.stufe === "schwer" ? `Wohin gehört der ${FORMEN[t.f].name}?`.replace("der Kugel", "die Kugel") : `Wohin gehört das ${FORMEN[t.f].name}?`.replace("das Kreis", "der Kreis"));
      const ziele = [...ctx.svg.querySelectorAll(".rw-gw")].map((el) => ({ el, wert: el.dataset.f }));
      const { ok } = await ctx.waehle({ ziele, richtig: t.f });
      if (!ctx.lebt()) return ok;
      await ctx.sage(ok ? `Genau: ${FORMEN[t.f].name}!` : `Schau: Das ist ${t.f === "kugel" || t.f === "zylinder" || t.f === "wuerfel" ? "ein" : "ein"} ${FORMEN[t.f].name}.`.replace("ein Kugel", "eine Kugel"));
      return ok;
    },
  });

  // ===========================================================================
  // Tangram-Lok (Formen-Puzzle)
  // ===========================================================================
  const PUZZLES = [
    { name: "Lok", teile: [["rechteck", 400, 300, 60, "#6c5ce7"], ["quadrat", 560, 270, 44, "#3d7be0"], ["kreis", 420, 380, 30, "#2f3a52"], ["kreis", 540, 380, 30, "#2f3a52"], ["dreieck", 320, 300, 34, "#e8543f"]] },
    { name: "Haus", teile: [["quadrat", 500, 330, 70, "#ffd166"], ["dreieck", 500, 200, 70, "#e8543f"], ["rechteck", 500, 380, 22, "#8a5a35"]] },
    { name: "Fisch", teile: [["kreis", 460, 300, 70, "#3d7be0"], ["dreieck", 580, 300, 50, "#3fbf74"], ["kreis", 430, 280, 10, "#2f3a52"]] },
    { name: "Rakete", teile: [["rechteck", 500, 320, 44, "#c9d1df"], ["dreieck", 500, 230, 44, "#e8543f"], ["dreieck", 440, 390, 26, "#f4b400"], ["dreieck", 560, 390, 26, "#f4b400"]] },
  ];
  R.spiel({
    id: "formpuzzle",
    titel: "Tangram-Lok",
    help: "Tangram-Lok. Unten liegen Formen. Tippe eine Form an, dann tippe auf den Umriss, wo sie hinpasst – bis das Bild fertig ist.",
    aufgaben: 3,
    async aufgabe(ctx) {
      const t = ctx.ziehe(() => { const i = ctx.rnd(0, PUZZLES.length - 1); return { i, key: String(i) }; });
      const puzzle = PUZZLES[t.i];
      const reihe = ctx.mische(puzzle.teile.map((_, i) => i));
      let bild = `<rect width="1000" height="560" fill="#fff1cf"/>`;
      puzzle.teile.forEach(([f, x, y, r], i) => { bild += `<g class="rw-platz" data-i="${i}" data-f="${f}" data-r="${r}" role="button" tabindex="0" aria-label="Umriss: ${FORMEN[f].name}">${FORMEN[f].zeichne(x, y, r, "#ffffff")}${FORMEN[f].zeichne(x, y, r, "none").replace(/fill="none"/g, `fill="none" stroke="#9aa3b5" stroke-width="4" stroke-dasharray="8 6"`)}</g>`; });
      reihe.forEach((i, k) => { const [f, , , r, farbe] = puzzle.teile[i]; bild += `<g class="rw-teil" data-i="${i}" data-f="${f}" data-r="${r}" role="button" tabindex="0" aria-label="${FORMEN[f].name}">${FORMEN[f].zeichne(140 + k * 180, 490, Math.min(r, 40), farbe)}<rect x="${80 + k * 180}" y="440" width="120" height="100" fill="#000" fill-opacity="0"/></g>`; });
      ctx.zeichne(bild);
      await ctx.sage(`Bau ${puzzle.name === "Lok" ? "eine Lok" : puzzle.name === "Haus" ? "ein Haus" : puzzle.name === "Fisch" ? "einen Fisch" : "eine Rakete"}!`);
      let fehler = 0;
      for (let k = 0; k < puzzle.teile.length; k += 1) {
        if (!ctx.lebt()) return false;
        const teil = await new Promise((fertig) => {
          const alle = [...ctx.svg.querySelectorAll(".rw-teil:not(.ist-fertig)")];
          alle.forEach((h) => h.addEventListener("click", () => { alle.forEach((x) => { if (x !== h) x.replaceWith(x.cloneNode(true)); }); fertig(h); }, { once: true }));
        });
        teil.setAttribute("opacity", "0.5");
        let gesetzt = false;
        while (!gesetzt && ctx.lebt()) {
          const platz = await new Promise((fertig) => {
            const alle = [...ctx.svg.querySelectorAll(".rw-platz:not(.ist-fertig)")];
            alle.forEach((h) => h.addEventListener("click", () => { alle.forEach((x) => { if (x !== h) x.replaceWith(x.cloneNode(true)); }); fertig(h); }, { once: true }));
          });
          gesetzt = platz.dataset.f === teil.dataset.f && Math.abs(Number(platz.dataset.r) - Number(teil.dataset.r)) < 1;
          if (!gesetzt) { fehler += 1; ctx.jingle("retry"); ctx.zeige("Diese Form passt dort nicht."); }
          else {
            const [f, x, y, r, farbe] = puzzle.teile[Number(platz.dataset.i)];
            platz.innerHTML = FORMEN[f].zeichne(x, y, r, farbe);
            platz.classList.add("ist-fertig");
            teil.classList.add("ist-fertig");
            teil.setAttribute("opacity", "0");
            ctx.klack();
          }
        }
      }
      const ok = fehler === 0;
      if (ok) ctx.lauf.richtig += 1;
      ctx.jingle("win");
      await ctx.sage(`Fertig! ${puzzle.name === "Haus" ? "Ein Haus" : puzzle.name === "Fisch" ? "Ein Fisch" : puzzle.name === "Lok" ? "Eine Lok" : "Eine Rakete"}!`);
      return ok;
    },
  });

  // ===========================================================================
  // Spiegel-Signal
  // ===========================================================================
  R.spiel({
    id: "spiegelsignal",
    titel: "Spiegel-Signal",
    help: "Spiegel-Signal. Links ist ein Muster. Mach rechts genau das Spiegelbild: Tippe die Felder an, die farbig werden sollen. Dann tippe auf den Haken.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const n = ctx.stufe === "leicht" ? 3 : 4;
      const halb = ctx.stufe === "schwer" ? 3 : 2;
      const links = Array.from({ length: n }, () => Array.from({ length: halb }, () => Math.random() < 0.4));
      if (!links.some((r) => r.some(Boolean))) links[0][0] = true;
      const rechts = Array.from({ length: n }, () => new Array(halb).fill(false));
      const zelle = 300 / Math.max(n, halb * 2) * 1.2;
      const x0 = 500 - halb * zelle;
      const y0 = 60;
      const zeichne = (zeigen = false) => {
        let s = `<rect width="1000" height="560" fill="#fff1cf"/>`;
        for (let r = 0; r < n; r += 1) {
          for (let c = 0; c < halb; c += 1) {
            s += `<rect x="${x0 + c * zelle}" y="${y0 + r * zelle}" width="${zelle - 4}" height="${zelle - 4}" rx="6" fill="${links[r][c] ? A.C.rot : "#ffffff"}" stroke="#c9d1df" stroke-width="2"/>`;
            const an = rechts[r][c];
            const soll = links[r][halb - 1 - c];
            const farbe = zeigen ? (soll ? (an ? A.C.rot : "#ffb3a6") : an ? "#9aa3b5" : "#ffffff") : an ? A.C.rot : "#ffffff";
            s += `<rect class="rw-feld" data-r="${r}" data-c="${c}" x="${500 + c * zelle + 4}" y="${y0 + r * zelle}" width="${zelle - 4}" height="${zelle - 4}" rx="6" fill="${farbe}" stroke="#9aa3b5" stroke-width="2" role="button" tabindex="0"/>`;
          }
        }
        s += `<rect x="497" y="${y0 - 10}" width="6" height="${n * zelle + 20}" fill="${A.C.blau}"/>`;
        ctx.zeichne(s);
        if (!zeigen) ctx.svg.querySelectorAll(".rw-feld").forEach((f) => f.addEventListener("click", () => { const r = Number(f.dataset.r); const c = Number(f.dataset.c); rechts[r][c] = !rechts[r][c]; ctx.blip(r + c); zeichne(); }));
      };
      zeichne();
      ctx.sage("Mach rechts das Spiegelbild!");
      await ctx.aktion({ text: "Fertig", icon: "haken" });
      if (!ctx.lebt()) return false;
      const ok = rechts.every((reihe, r) => reihe.every((v, c) => v === links[r][halb - 1 - c]));
      ctx.jingle(ok ? "correct" : "retry");
      if (ok) ctx.lauf.richtig += 1;
      zeichne(true);
      await ctx.sage(ok ? "Genau gespiegelt!" : "Fast: Die hellen Felder fehlen noch, die grauen sind zu viel.");
      return ok;
    },
  });
})();
