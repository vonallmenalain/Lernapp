/*
 * rechnen-spiele-4.js – Die Spiele der Etappe 4: für die Grösseren.
 *
 *   zahlenmauer      zwei Ziegel unten ergeben den Ziegel darüber
 *   wachsendetuerme  1, 3, 5 Ziegel – wie hoch wird der nächste Turm?
 *   hunderter        der Hunderter-Fahrplan: welche Zahl fehlt?
 *   bahnhofsuhr      wie spät ist es?
 *   rueckgeld        Kiosk mit Rückgeld
 *   blitzrechnen     Blitzrechnen-Express: 45 Sekunden, so viele wie möglich
 *   rechenpost       Rechen-Postkarten der Fahrgäste
 *   geradeungerade   sitzen alle zu zweit, oder sitzt einer allein?
 *   waskommtoefter   ein Glücksrad: was kommt öfter?
 */
(() => {
  "use strict";

  const R = window.LernappRechenSpiel;
  if (!R) return;

  const SPUR = 448;
  const bis = (ctx, leicht = 10, mittel = 20, schwer = 100) => Math.max(5, Math.min({ leicht, mittel, schwer }[ctx.stufe] || mittel, ctx.deckel));

  // ===========================================================================
  // Zahlenmauer
  // ===========================================================================
  function ziegel(A, x, y, w, text, { frage = false, leer = false } = {}) {
    return `<g><rect x="${x - w / 2}" y="${y - 34}" width="${w}" height="68" rx="8" fill="${frage ? "#fff6c2" : leer ? "#f6e3b4" : "#e07a4f"}" stroke="#8a5a35" stroke-width="3"/><text class="rw-ziegel" x="${x}" y="${y + 13}" text-anchor="middle" font-size="36" ${A.FONT} fill="${frage ? A.C.rot : "#ffffff"}">${text}</text></g>`;
  }
  R.spiel({
    id: "zahlenmauer",
    titel: "Zahlenmauer",
    help: "Zahlenmauer. Zwei Ziegel nebeneinander ergeben zusammen den Ziegel darüber. Welche Zahl gehört in den gelben Ziegel?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const reihen = ctx.stufe === "leicht" ? 2 : 3;
      const unten = ctx.stufe === "leicht" ? 5 : ctx.stufe === "mittel" ? 5 : 9;
      const t = ctx.ziehe(() => {
        const b = Array.from({ length: reihen }, () => ctx.rnd(1, unten));
        const m = reihen === 3 ? [b[0] + b[1], b[1] + b[2]] : [];
        const oben = reihen === 3 ? m[0] + m[1] : b[0] + b[1];
        if (oben > Math.max(10, ctx.deckel)) return null;
        return { b, m, oben, key: b.join(",") };
      });
      const { b, m, oben } = t;
      // Welcher Ziegel fehlt: leicht oben, mittel in der Mitte oder oben,
      // schwer unten (dann wird zurückgerechnet).
      const zellen = reihen === 3 ? [...b.map((v, i) => ({ v, x: 380 + i * 120, y: 470 })), ...m.map((v, i) => ({ v, x: 440 + i * 120, y: 400 })), { v: oben, x: 500, y: 330 }] : [...b.map((v, i) => ({ v, x: 440 + i * 120, y: 470 })), { v: oben, x: 500, y: 400 }];
      let gesucht;
      if (ctx.stufe === "schwer") gesucht = ctx.rnd(0, reihen - 1);
      else if (ctx.stufe === "mittel" && reihen === 3) gesucht = ctx.rnd(3, 5);
      else gesucht = zellen.length - 1;
      let bild = `<rect width="1000" height="560" fill="#e8f6ee"/>`;
      zellen.forEach((z, i) => { bild += ziegel(A, z.x, z.y, 116, i === gesucht ? "?" : z.v, { frage: i === gesucht }); });
      ctx.zeichne(bild);
      ctx.sage("Welche Zahl gehört in den gelben Ziegel?");
      const richtig = zellen[gesucht].v;
      const { ok } = await ctx.frage({ werte: R.auswahl(richtig, 0, 30), richtig });
      if (!ctx.lebt()) return ok;
      ctx.svg.querySelectorAll(".rw-ziegel")[gesucht].textContent = String(richtig);
      await ctx.sage(ok ? "Genau! Die Mauer stimmt." : `Schau: Da gehört ${richtig} hin.`);
      return ok;
    },
  });

  // ===========================================================================
  // Wachsende Türme
  // ===========================================================================
  R.spiel({
    id: "wachsendetuerme",
    titel: "Wachsende Türme",
    help: "Wachsende Türme. Jeder Turm wächst nach einer Regel. Wie viele Ziegel hat der nächste Turm?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const regeln = ctx.stufe === "leicht" ? [[1, 1], [2, 1]] : ctx.stufe === "mittel" ? [[1, 2], [2, 2], [1, 1], [3, 1]] : [[1, 2], [2, 3], [1, 3], [4, 2]];
      const t = ctx.ziehe(() => { const [start, schritt] = regeln[ctx.rnd(0, regeln.length - 1)]; return { start, schritt, key: `${start}+${schritt}` }; });
      const hoehen = [0, 1, 2, 3].map((i) => t.start + i * t.schritt);
      let bild = `<rect width="1000" height="560" fill="#e8f6ee"/><rect y="500" width="1000" height="60" fill="#7cc05e"/>`;
      hoehen.forEach((h, i) => {
        const x = 170 + i * 220;
        if (i === 3) { bild += `<text x="${x}" y="440" text-anchor="middle" font-size="90" ${A.FONT} fill="${A.C.rot}">?</text>`; return; }
        for (let k = 0; k < h; k += 1) bild += `<rect x="${x - 40}" y="${470 - (k + 1) * 34}" width="80" height="30" rx="5" fill="${A.fuenfer(k)}"/>`;
        bild += `<text x="${x}" y="540" text-anchor="middle" font-size="30" ${A.FONT} fill="${A.C.ink}">${h}</text>`;
      });
      ctx.zeichne(bild);
      ctx.sage(`${hoehen.slice(0, 3).join(", ")} – wie viele Ziegel hat der nächste Turm?`);
      const { ok } = await ctx.frage({ werte: R.auswahl(hoehen[3], 1, 20), richtig: hoehen[3] });
      if (!ctx.lebt()) return ok;
      await ctx.sage(ok ? `Genau! Jedes Mal ${t.schritt} mehr.` : `Schau: Jedes Mal ${t.schritt} mehr – also ${hoehen[3]}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Hunderter-Fahrplan
  // ===========================================================================
  R.spiel({
    id: "hunderter",
    titel: "Hunderter-Fahrplan",
    help: "Hunderter-Fahrplan. Die Zahlen stehen in Reihen zu zehn. Ein Feld leuchtet gelb – welche Zahl gehört dorthin?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = ctx.stufe === "leicht" ? 20 : ctx.stufe === "mittel" ? 50 : 100;
      const t = ctx.ziehe(() => { const n = ctx.rnd(2, Math.min(max, Math.max(20, ctx.deckel))); return { n, key: String(n) }; });
      const n = t.n;
      const reihen = Math.ceil(Math.min(max, Math.max(20, ctx.deckel)) / 10);
      const zelle = Math.min(84, 500 / reihen);
      const x0 = 500 - 5 * zelle;
      let bild = `<rect width="1000" height="560" fill="#fff1cf"/>`;
      for (let k = 1; k <= reihen * 10; k += 1) {
        const r = Math.floor((k - 1) / 10);
        const c = (k - 1) % 10;
        const gesucht = k === n;
        const zeigen = !gesucht && (ctx.stufe === "leicht" || k % 10 === 1 || k % 10 === 5 || k % 10 === 0 || Math.abs(k - n) > 12 || k % 2 === 0);
        bild += `<rect x="${x0 + c * zelle}" y="${30 + r * zelle}" width="${zelle - 4}" height="${zelle - 4}" rx="6" fill="${gesucht ? "#fff6c2" : "#ffffff"}" stroke="${gesucht ? A.C.rot : "#e2c389"}" stroke-width="${gesucht ? 4 : 2}"/>`;
        if (zeigen || gesucht) bild += `<text class="${gesucht ? "rw-gesucht" : ""}" x="${x0 + c * zelle + zelle / 2 - 2}" y="${30 + r * zelle + zelle * 0.62}" text-anchor="middle" font-size="${zelle * 0.4}" ${A.FONT} fill="${gesucht ? A.C.rot : A.C.ink}">${gesucht ? "?" : k}</text>`;
      }
      ctx.zeichne(bild);
      ctx.sage("Welche Zahl gehört ins gelbe Feld?");
      const { ok } = await ctx.frage({ werte: R.auswahl(n, 1, 100), richtig: n });
      if (!ctx.lebt()) return ok;
      const feld = ctx.q(".rw-gesucht");
      if (feld) { feld.textContent = String(n); feld.setAttribute("fill", A.C.ink); }
      const zehner = Math.floor(n / 10);
      await ctx.sage(ok ? `Genau, das ist die ${n}!` : `Schau: ${n} – ${zehner === 1 ? "ein Zehner" : `${zehner} Zehner`} und ${n % 10} Einer.`);
      return ok;
    },
  });

  // ===========================================================================
  // Bahnhofsuhr
  // ===========================================================================
  const ZAHLWORT = ["zwölf", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"];
  function uhrText(h, m) {
    const naechste = (h % 12) + 1;
    if (m === 0) return `${h} Uhr`;
    if (m === 30) return `halb ${naechste}`;
    if (m === 15) return `Viertel nach ${h}`;
    return `Viertel vor ${naechste}`;
  }
  function uhrBild(A, h, m) {
    let s = `<circle cx="500" cy="270" r="210" fill="#ffffff" stroke="${A.C.dunkel}" stroke-width="14"/>`;
    for (let i = 0; i < 60; i += 1) {
      const lang = i % 5 === 0;
      s += `<rect x="497" y="${74}" width="${lang ? 8 : 3}" height="${lang ? 30 : 14}" fill="${A.C.dunkel}" transform="rotate(${i * 6} 500 270)"/>`;
    }
    for (let z = 1; z <= 12; z += 1) {
      const a = (z / 12) * Math.PI * 2;
      s += `<text x="${500 + Math.sin(a) * 140}" y="${270 - Math.cos(a) * 140 + 12}" text-anchor="middle" font-size="34" ${A.FONT} fill="${A.C.ink}">${z}</text>`;
    }
    const stunde = ((h % 12) + m / 60) * 30;
    const minute = m * 6;
    s += `<rect x="492" y="160" width="16" height="118" rx="8" fill="${A.C.ink}" transform="rotate(${stunde} 500 270)"/>`;
    s += `<rect x="495" y="96" width="10" height="182" rx="5" fill="${A.C.ink}" transform="rotate(${minute} 500 270)"/>`;
    s += `<circle cx="500" cy="270" r="14" fill="${A.C.rot}"/>`;
    return s;
  }
  R.spiel({
    id: "bahnhofsuhr",
    titel: "Bahnhofsuhr",
    help: "Bahnhofsuhr. Der kurze Zeiger zeigt die Stunde, der lange die Minuten. Wie spät ist es?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const minuten = ctx.stufe === "leicht" ? [0] : ctx.stufe === "mittel" ? [0, 30] : [0, 15, 30, 45];
      const t = ctx.ziehe(() => { const h = ctx.rnd(1, 12); const m = minuten[ctx.rnd(0, minuten.length - 1)]; return { h, m, key: `${h}:${m}` }; });
      const { h, m } = t;
      ctx.zeichne(`<rect width="1000" height="560" fill="#fff1cf"/>${uhrBild(A, h, m)}`);
      ctx.sage("Wie spät ist es?");
      const richtig = uhrText(h, m);
      const andere = new Set([richtig]);
      while (andere.size < 3) {
        const hh = ctx.rnd(1, 12);
        const mm = minuten[ctx.rnd(0, minuten.length - 1)];
        andere.add(uhrText(hh, mm));
      }
      const { ok } = await ctx.waehle({ knoepfe: ctx.mische([...andere]).map((txt) => ({ wert: txt, text: txt })), richtig });
      if (!ctx.lebt()) return ok;
      await ctx.sage(ok ? `Genau: ${richtig}!` : `Schau: Es ist ${richtig}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Kiosk mit Rückgeld
  // ===========================================================================
  R.spiel({
    id: "rueckgeld",
    titel: "Kiosk mit Rückgeld",
    help: "Kiosk mit Rückgeld. Das Tier bezahlt mit einer grossen Münze oder einer Note. Wie viel bekommt es zurück?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const gross = ctx.stufe === "leicht" ? 5 : ctx.stufe === "mittel" ? 10 : 20;
      const t = ctx.ziehe(() => { const preis = ctx.rnd(1, gross - 1); return { preis, key: String(preis) }; });
      const preis = t.preis;
      const ware = ["🍦", "🥨", "🧃", "🍎", "🥕", "🍌"][ctx.rnd(0, 5)];
      ctx.zeichne(`<rect width="1000" height="560" fill="#fff1cf"/><rect x="100" y="250" width="800" height="160" rx="10" fill="${A.C.gelb}"/>
        <text x="300" y="230" text-anchor="middle" font-size="110">${ware}</text><g transform="translate(420 140)"><rect x="-50" y="-26" width="100" height="48" rx="8" fill="#ffffff" stroke="${A.C.rot}" stroke-width="3"/><text y="12" text-anchor="middle" font-size="30" ${A.FONT} fill="${A.C.rot}">${preis} Fr.</text></g>
        <g transform="translate(700 330)">${gross === 5
          ? `<circle r="70" fill="#c9d1df" stroke="#8b95a8" stroke-width="6"/><text y="24" text-anchor="middle" font-size="64" ${A.FONT} fill="#4a5568">5</text>`
          : `<rect x="-120" y="-60" width="240" height="120" rx="10" fill="${gross === 10 ? "#f4b400" : "#e8543f"}" stroke="#8a5a35" stroke-width="3"/><text y="22" text-anchor="middle" font-size="64" ${A.FONT} fill="#ffffff">${gross} Fr.</text>`}</g>`);
      ctx.sage(`Es kostet ${preis} Franken. Bezahlt wird mit ${gross} Franken. Wie viel gibt es zurück?`);
      const { ok } = await ctx.frage({ werte: R.auswahl(gross - preis, 0, gross), richtig: gross - preis, aufgabe: { a: gross, op: "-", b: preis } });
      if (!ctx.lebt()) return ok;
      await ctx.sage(ok ? `Genau! ${preis} und ${gross - preis} sind ${gross}.` : `Schau: ${preis} und ${gross - preis} sind ${gross}. Zurück gibt es ${gross - preis} Franken.`);
      return ok;
    },
  });

  // ===========================================================================
  // Blitzrechnen-Express
  // ===========================================================================
  const ZEIT_MS = 45000;
  R.spiel({
    id: "blitzrechnen",
    titel: "Blitzrechnen-Express",
    help: "Blitzrechnen-Express. 45 Sekunden: Rechne so viele Aufgaben wie du kannst. Nur wer schon sicher ist, braucht dafür nicht zu zählen.",
    async runde(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 10, 10, 20);
      const ende = performance.now() + ZEIT_MS;
      let richtig = 0;
      let gestellt = 0;
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/><rect x="100" y="40" width="800" height="24" rx="12" fill="#ffffff"/><rect class="rw-zeit" x="100" y="40" width="800" height="24" rx="12" fill="${A.C.blau}"/><text class="rw-aufgabe" x="500" y="300" text-anchor="middle" font-size="140" ${A.FONT} fill="${A.C.ink}"></text><text class="rw-punkte" x="500" y="460" text-anchor="middle" font-size="40" ${A.FONT} fill="#3fbf74">0</text>`);
      const balken = ctx.q(".rw-zeit");
      const uhr = window.setInterval(() => { const rest = Math.max(0, ende - performance.now()); balken.setAttribute("width", String(800 * rest / ZEIT_MS)); }, 200);
      await ctx.sage("Los!");
      while (performance.now() < ende && ctx.lebt()) {
        const minus = ctx.minus && Math.random() < 0.4;
        const a = ctx.rnd(minus ? 2 : 1, max - 1);
        const b = minus ? ctx.rnd(1, a - 1) : ctx.rnd(1, max - a);
        const loesung = minus ? a - b : a + b;
        ctx.q(".rw-aufgabe").textContent = `${a} ${minus ? "−" : "+"} ${b}`;
        gestellt += 1;
        const antwort = await Promise.race([
          ctx.frage({ werte: R.auswahl(loesung, 0, max), richtig: loesung, aufgabe: { a, op: minus ? "-" : "+", b } }),
          new Promise((fertig) => window.setTimeout(() => fertig(null), Math.max(0, ende - performance.now()))),
        ]);
        if (!antwort) break;
        if (antwort.ok) { richtig += 1; ctx.q(".rw-punkte").textContent = String(richtig); }
        await ctx.warte(250);
      }
      window.clearInterval(uhr);
      if (!ctx.lebt()) return null;
      ctx.leereLeiste();
      const best = Number(ctx.stand.stand().spiele?.blitzrechnen?.best) || 0;
      await ctx.sage(`${richtig} richtig in 45 Sekunden!${richtig > best && best > 0 ? " Neuer Rekord!" : ""}`);
      const stars = richtig >= 14 ? 3 : richtig >= 8 ? 2 : 1;
      return { punkte: richtig, von: Math.max(richtig, gestellt), stars, detail: `${richtig} richtig in 45 Sekunden${best ? ` · Bestwert ${Math.max(best, richtig)}` : ""}`, speech: `${richtig} richtig in 45 Sekunden.` };
    },
  });

  // ===========================================================================
  // Rechen-Postkarten
  // ===========================================================================
  const POST = [
    { von: "Pino", tier: "penguin", text: "Liebe Grüsse vom See! Am Morgen habe ich 4 Enten gesehen, am Abend noch 3. Wie viele Enten waren es?", a: 4, b: 3, op: "+" },
    { von: "Flitz", tier: "squirrel", text: "Hallo! Ich hatte 9 Nüsse. 4 habe ich vergraben. Wie viele Nüsse habe ich noch?", a: 9, b: 4, op: "-" },
    { von: "Ella", tier: "owl", text: "Grüsse aus dem Wald! Auf einem Ast sitzen 5 Eulen, auf dem anderen 5. Wie viele sind es zusammen?", a: 5, b: 5, op: "+" },
    { von: "Bruno", tier: "bear", text: "Hallo aus den Bergen! Ich habe 8 Beeren gepflückt und 3 gegessen. Wie viele sind noch im Korb?", a: 8, b: 3, op: "-" },
    { von: "Hoppel", tier: "rabbit", text: "Juhu! Im Garten wachsen 6 Rüebli und 6 Salate. Wie viele sind es zusammen?", a: 6, b: 6, op: "+" },
    { von: "Pippa", tier: "panda", text: "Grüsse vom Bambuswald! Ich hatte 12 Bambusstangen. 5 habe ich verschenkt. Wie viele habe ich noch?", a: 12, b: 5, op: "-" },
    { von: "Leo", tier: "lion", text: "Hallo! Im Zug sitzen 7 Löwen. Am Bahnhof steigen 6 ein. Wie viele fahren jetzt mit?", a: 7, b: 6, op: "+" },
    { von: "Mia", tier: "mouse", text: "Liebe Grüsse! Ich habe 10 Käsestücke gesammelt. Tim hat 2 geholt. Wie viele habe ich noch?", a: 10, b: 2, op: "-" },
    { von: "Fred", tier: "frog", text: "Quak! Auf dem Seerosenblatt sitzen 3 Frösche. 4 hüpfen dazu. Wie viele sind es jetzt?", a: 3, b: 4, op: "+" },
    { von: "Sepp", tier: "ibex", text: "Grüsse vom Gipfel! Ich war auf 15 Bergen. 9 davon im Sommer. Auf wie vielen im Winter?", a: 15, b: 9, op: "-" },
  ];
  R.spiel({
    id: "rechenpost",
    titel: "Rechen-Postkarten",
    help: "Rechen-Postkarten. Die Fahrgäste der Reise schreiben dir. Lies die Karte und rechne. Brauchst du Hilfe, tippe auf den Lautsprecher auf der Karte.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const passend = POST.filter((p) => (p.op === "+" ? p.a + p.b : p.a) <= Math.max(10, ctx.deckel) && (ctx.minus || p.op === "+"));
      const t = ctx.ziehe(() => { const i = ctx.rnd(0, passend.length - 1); return { i, key: String(i) }; });
      const karte = passend[t.i];
      const loesung = karte.op === "+" ? karte.a + karte.b : karte.a - karte.b;
      // Den Text in Zeilen zu etwa 34 Zeichen umbrechen.
      const woerter = karte.text.split(" ");
      const zeilen = [];
      let zeile = "";
      woerter.forEach((w) => { if ((`${zeile} ${w}`).trim().length > 34) { zeilen.push(zeile.trim()); zeile = w; } else zeile = `${zeile} ${w}`; });
      if (zeile.trim()) zeilen.push(zeile.trim());
      ctx.zeichne(`<rect width="1000" height="560" fill="#dff1f7"/><g transform="rotate(-2 500 280)"><rect x="90" y="40" width="820" height="460" rx="16" fill="#fffdf6" stroke="#e2c389" stroke-width="4"/>
        <rect x="760" y="70" width="110" height="130" rx="6" fill="#ffffff" stroke="${A.C.rot}" stroke-width="4" stroke-dasharray="8 6"/>${A.kopf(karte.tier, 815, 140, 34)}
        ${zeilen.map((z, i) => `<text x="130" y="${110 + i * 52}" font-size="32" font-family="Andika, Nunito, sans-serif" font-weight="700" fill="${A.C.ink}">${z}</text>`).join("")}
        <text x="130" y="${130 + zeilen.length * 52}" font-size="30" font-family="Andika, Nunito, sans-serif" font-style="italic" fill="${A.C.blau}">${karte.von}</text>
        <g class="rw-vorlesen" transform="translate(830 450)" role="button" tabindex="0" aria-label="Vorlesen"><circle r="34" fill="${A.C.lila}"/><path d="M-14 -8 h8 l10 -10 v36 l-10 -10 h-8 z" fill="#ffffff"/><path d="M8 -8 q8 8 0 16" stroke="#ffffff" stroke-width="3" fill="none"/></g></g>`);
      ctx.q(".rw-vorlesen")?.addEventListener("click", () => { try { ctx.kids?.speak?.(karte.text); } catch { /* ohne Stimme */ } });
      ctx.zeige("Lies die Postkarte und rechne!");
      const { ok } = await ctx.frage({ werte: R.auswahl(loesung, 0, 30), richtig: loesung, aufgabe: { a: karte.a, op: karte.op, b: karte.b } });
      if (!ctx.lebt()) return ok;
      const satz = karte.op === "+" ? `${karte.a} und ${karte.b} sind ${loesung}.` : `${karte.a} minus ${karte.b} sind ${loesung}.`;
      await ctx.sage(ok ? `Genau! ${satz}` : `Schau: ${satz}`);
      return ok;
    },
  });

  // ===========================================================================
  // Gerade oder ungerade?
  // ===========================================================================
  R.spiel({
    id: "geradeungerade",
    titel: "Gerade oder ungerade?",
    help: "Gerade oder ungerade? Die Fahrgäste setzen sich immer zu zweit. Sitzen alle zu zweit, ist die Zahl gerade. Sitzt einer allein, ist sie ungerade.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const t = ctx.ziehe(() => { const n = ctx.rnd(2, Math.min(ctx.stufe === "leicht" ? 8 : 16, Math.max(8, ctx.deckel))); return { n, key: String(n) }; });
      const n = t.n;
      const tiere = ctx.mische([...A.TIERE, ...A.TIERE]);
      let sitze = "";
      for (let i = 0; i < n; i += 1) {
        const paar = Math.floor(i / 2);
        const x = 130 + paar * 104 + (i % 2) * 44;
        sitze += `<g class="rw-sitz" data-i="${i}" opacity="0">${A.kopf(tiere[i], x, 300, 18)}</g>`;
      }
      let baenke = "";
      for (let p = 0; p < Math.ceil(n / 2); p += 1) baenke += `<rect x="${104 + p * 104}" y="324" width="96" height="22" rx="6" fill="${A.C.blau}"/>`;
      ctx.zeichne(`<rect width="1000" height="560" fill="#fff1cf"/><rect x="60" y="200" width="880" height="200" rx="20" fill="#e8f1fb" stroke="${A.C.blau}" stroke-width="6"/>${baenke}${sitze}<text x="500" y="140" text-anchor="middle" font-size="80" ${A.FONT} fill="${A.C.ink}">${n}</text>`);
      ctx.sage(`${n} Fahrgäste. Sitzen alle zu zweit, oder sitzt einer allein?`);
      const { ok } = await ctx.waehle({ knoepfe: [{ wert: "gerade", text: "Alle zu zweit" }, { wert: "ungerade", text: "Einer allein" }], richtig: n % 2 ? "ungerade" : "gerade" });
      if (!ctx.lebt()) return ok;
      const figuren = [...ctx.svg.querySelectorAll(".rw-sitz")];
      for (const f of figuren) { f.setAttribute("opacity", "1"); ctx.blip(Number(f.dataset.i)); await ctx.warte(120); }
      await ctx.sage(n % 2 ? `${n} ist ungerade: Einer sitzt allein.` : `${n} ist gerade: Alle sitzen zu zweit.`);
      return ok;
    },
  });

  // ===========================================================================
  // Was kommt öfter?
  // ===========================================================================
  R.spiel({
    id: "waskommtoefter",
    titel: "Was kommt öfter?",
    help: "Was kommt öfter? Auf dem Glücksrad sind Felder in zwei Farben. Rate zuerst, welche Farbe öfter kommt. Dann dreht das Rad zehnmal, und wir machen Striche.",
    aufgaben: 3,
    async aufgabe(ctx) {
      const A = ctx.art;
      const felder = 6;
      const rot = [1, 2, 4, 5][ctx.rnd(0, 3)];
      const sektoren = Array.from({ length: felder }, (_, i) => (i < rot ? "rot" : "blau"));
      const farbe = { rot: A.C.rot, blau: A.C.blau };
      const rad = sektoren.map((s, i) => {
        const a0 = (i / felder) * Math.PI * 2;
        const a1 = ((i + 1) / felder) * Math.PI * 2;
        return `<path d="M300 280 L${300 + Math.sin(a0) * 180} ${280 - Math.cos(a0) * 180} A180 180 0 0 1 ${300 + Math.sin(a1) * 180} ${280 - Math.cos(a1) * 180} Z" fill="${farbe[s]}" stroke="#ffffff" stroke-width="4"/>`;
      }).join("");
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/><g class="rw-rad">${rad}</g><path d="M300 80 L284 50 L316 50 Z" fill="${A.C.ink}"/><circle cx="300" cy="280" r="16" fill="#ffffff"/>
        <g transform="translate(600 200)"><rect x="0" y="-30" width="50" height="40" rx="8" fill="${A.C.rot}"/><g class="rw-str-rot"></g><rect x="0" y="70" width="50" height="40" rx="8" fill="${A.C.blau}"/><g class="rw-str-blau"></g></g>`);
      ctx.sage("Welche Farbe kommt öfter?");
      const mehr = rot > felder / 2 ? "rot" : "blau";
      const { ok } = await ctx.waehle({ knoepfe: [{ wert: "rot", html: `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="${A.C.rot}"/></svg>`, label: "Rot" }, { wert: "blau", html: `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="${A.C.blau}"/></svg>`, label: "Blau" }], richtig: mehr });
      if (!ctx.lebt()) return ok;
      const zaehler = { rot: 0, blau: 0 };
      let winkel = 0;
      const radG = ctx.q(".rw-rad");
      for (let k = 0; k < 10 && ctx.lebt(); k += 1) {
        const ziel = winkel + 360 + Math.random() * 360;
        const start = winkel;
        await ctx.tween(380, (p) => { winkel = start + (ziel - start) * p; radG.setAttribute("transform", `rotate(${winkel.toFixed(1)} 300 280)`); });
        const oben = Math.floor((((360 - (winkel % 360)) % 360) / 360) * felder) % felder;
        const s = sektoren[oben];
        zaehler[s] += 1;
        const g = ctx.q(`.rw-str-${s}`);
        const nr = zaehler[s] - 1;
        const gx = 70 + Math.floor(nr / 5) * 70;
        const y = s === "rot" ? -10 : 90;
        g.insertAdjacentHTML("beforeend", nr % 5 === 4 ? `<line x1="${gx - 6}" y1="${y + 10}" x2="${gx + 50}" y2="${y - 18}" stroke="${A.C.ink}" stroke-width="5"/>` : `<line x1="${gx + (nr % 5) * 12}" y1="${y - 20}" x2="${gx + (nr % 5) * 12}" y2="${y + 12}" stroke="${A.C.ink}" stroke-width="5"/>`);
        ctx.blip(k);
      }
      await ctx.sage(`${zaehler.rot} Mal rot, ${zaehler.blau} Mal blau. ${mehr === "rot" ? "Rot" : "Blau"} hat mehr Felder – darum kommt es meistens öfter.`);
      return ok;
    },
  });
})();
