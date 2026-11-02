/*
 * rechnen-spiele-2.js – Die Spiele der Etappe 2: Zahlen festigen und Minus.
 *
 *   Zählen und Zahlen
 *     fahrplanluecke  die Bahnhöfe 1, 2, _, 4, 5 – welches Schild fehlt?
 *     countdown       die Wagen rückwärts antippen: drei, zwei, eins, los!
 *     zahlenpaare     dieselbe Zahl in verschiedenen Kleidern finden
 *     fingerzahlen    Finger hochtippen, bis die Zahl stimmt
 *     ziffernpunkte   Ziffern-Gleis: die Bahnhöfe der Reihe nach antippen,
 *                     das Gleis wird zur Ziffer
 *     alleeinsteigen  jedes Tier antippen, es steigt ein – wie viele?
 *     werhatmehr      zwei Güterwagen: welcher hat mehr, oder gleich viel?
 *     zaehlfenster    wie viele Kühe hast du gesehen?
 *     wagenordnen     nummerierte Wagen der Reihe nach ankuppeln
 *     musterzug       rot, blau, rot, blau – welcher Wagen kommt?
 *     stolperwagen    ein Wagen passt nicht ins Muster
 *   Plus festigen
 *     huepflok        die Lok steht bei 4, auf dem Billett «+ 3»
 *     wuerfelplus     zwei Würfel, die Augen zusammen
 *     tunnelversteck  wie viele Wagen stecken im Tunnel?
 *   Minus
 *     abkuppeln       Wagen abkuppeln – wie viele bleiben?
 *     aussteigen      Tiere steigen aus
 *     ballonwagen     Ballone platzen lassen
 *     plusoderminus   kommen welche dazu oder gehen welche weg?
 *   Geld
 *     kiosk           mit Franken bezahlen
 */
(() => {
  "use strict";

  const R = window.LernappRechenSpiel;
  if (!R) return;

  const SPUR = 448;
  const NAMEN = { fox: "Fino", rabbit: "Hoppel", mouse: "Mia", bear: "Bruno", panda: "Pippa", owl: "Ella", penguin: "Pino", lion: "Leo", frog: "Fred", cat: "Tim" };
  const TIER_IDS = Object.keys(NAMEN);
  const wagenWort = (n) => (n === 1 ? "1 Wagen" : `${n} Wagen`);
  const bis = (ctx, leicht = 5, mittel = 10, schwer = 10) => Math.max(3, Math.min({ leicht, mittel, schwer }[ctx.stufe] || mittel, ctx.deckel));
  const FARBEN = [
    { id: "rot", farbe: "#e8543f", name: "rot" },
    { id: "blau", farbe: "#3d7be0", name: "blau" },
    { id: "gelb", farbe: "#ffd166", name: "gelb" },
    { id: "gruen", farbe: "#3fbf74", name: "grün" },
  ];

  // Ein Bahnhofsschild mit Zahl, auf einem Pfosten. Ursprung unten am Pfosten.
  function bahnhof(A, x, y, text, { frage = false, leuchtet = false } = {}) {
    return `<g class="rw-bahnhof" transform="translate(${x} ${y})"><rect x="-3" y="-70" width="6" height="70" fill="#5d6882"/>
      <rect x="-34" y="-112" width="68" height="48" rx="10" fill="${frage ? "#fff6c2" : "#ffffff"}" stroke="${leuchtet ? "#3fbf74" : A.C.blau}" stroke-width="${leuchtet ? 6 : 4}"/>
      <text class="rw-bahnhof-zahl" x="0" y="-76" text-anchor="middle" font-size="34" ${A.FONT} fill="${frage ? A.C.rot : A.C.ink}">${text}</text></g>`;
  }

  // ===========================================================================
  // Fahrplan-Lücke
  // ===========================================================================
  R.spiel({
    id: "fahrplanluecke",
    titel: "Fahrplan-Lücke",
    help: "Fahrplan-Lücke. Die Bahnhöfe tragen Zahlen, der Reihe nach. Ein Schild ist leer. Welche Zahl fehlt? Tippe sie unten an.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 6, 10, 20);
      const lang = ctx.stufe === "leicht" ? 5 : 6;
      const t = ctx.ziehe(() => {
        const rueck = ctx.stufe === "schwer" && Math.random() < 0.5;
        const start = ctx.stufe === "leicht" ? 1 : ctx.rnd(rueck ? lang : 1, Math.max(lang, max - (rueck ? 0 : lang - 1)));
        const reihe = Array.from({ length: lang }, (_, i) => (rueck ? start - i : start + i));
        if (reihe.some((n) => n < 0 || n > max)) return null;
        const luecke = ctx.rnd(1, lang - 1);
        return { reihe, luecke, rueck, key: `${reihe.join(",")}|${luecke}` };
      });
      const { reihe, luecke, rueck } = t;
      const dx = 820 / (lang - 1);
      let bild = `${A.raum(SPUR)}`;
      reihe.forEach((n, i) => { bild += bahnhof(A, 90 + i * dx, SPUR, i === luecke ? "?" : n, { frage: i === luecke }); });
      bild += `<g class="rw-lok" transform="translate(-120 ${SPUR})">${A.lok(0.8, false)}</g>`;
      ctx.zeichne(bild);
      ctx.sage(rueck ? "Hier wird rückwärts gezählt. Welche Zahl fehlt?" : "Welche Zahl fehlt?");
      const richtig = reihe[luecke];
      const lo = Math.max(0, richtig - 5);
      const { ok } = await ctx.frage({ werte: R.auswahl(richtig, lo, Math.max(richtig + 4, 10)).concat([]), richtig });
      if (!ctx.lebt()) return ok;
      const schilder = ctx.svg.querySelectorAll(".rw-bahnhof-zahl");
      schilder[luecke].textContent = String(richtig);
      schilder[luecke].setAttribute("fill", A.C.ink);
      // Die Lok fährt die Bahnhöfe ab, und die Zahlen leuchten nacheinander.
      const lok = ctx.q(".rw-lok");
      for (let i = 0; i < lang; i += 1) {
        if (!ctx.lebt()) return ok;
        const ziel = 90 + i * dx - 40;
        const von = i === 0 ? -120 : 90 + (i - 1) * dx - 40;
        await ctx.tween(260, (p) => ctx.setPos(lok, von + (ziel - von) * p, SPUR));
        ctx.svg.querySelectorAll(".rw-bahnhof rect:nth-of-type(2)")[i]?.setAttribute("stroke", "#3fbf74");
        ctx.blip(i);
      }
      await ctx.sage(ok ? `Genau! ${reihe.join(", ")}.` : `Schau: ${reihe.join(", ")}. Es fehlte die ${richtig}.`, ok ? null : `Schau: Es fehlte die ${richtig}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Countdown!
  // ===========================================================================
  R.spiel({
    id: "countdown",
    titel: "Countdown!",
    help: "Countdown! Der Zug fährt erst ab, wenn du rückwärts zählst: Tippe die Wagen an, die grösste Zahl zuerst, dann immer eins weniger.",
    aufgaben: 3,
    async aufgabe(ctx) {
      const A = ctx.art;
      const hoch = ctx.stufe === "leicht" ? 5 : ctx.stufe === "mittel" ? 10 : Math.min(20, Math.max(10, ctx.deckel));
      const tief = ctx.stufe === "schwer" ? hoch - 9 : 1;
      const zahlen = [];
      for (let n = hoch; n >= tief; n -= 1) zahlen.push(n);
      const plaetze = ctx.mische(zahlen);
      const spalten = Math.min(5, zahlen.length);
      let bild = `${A.raum(null)}`;
      plaetze.forEach((n, i) => {
        const x = 130 + (i % spalten) * 180;
        const y = 220 + Math.floor(i / spalten) * 150;
        bild += `<g class="rw-cd" data-n="${n}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${n}"><g transform="translate(-77 50) scale(1.6)">${A.wagenBasis(A.fuenfer((n - 1) % 10))}</g>
          <circle cx="-31" cy="-14" r="27" fill="#ffffff" stroke="${A.C.ink}" stroke-opacity="0.2" stroke-width="2"/><text x="-31" y="-3" text-anchor="middle" font-size="30" ${A.FONT} fill="${A.C.ink}">${n}</text>
          <rect x="-84" y="-48" width="110" height="100" fill="#000" fill-opacity="0"/></g>`;
      });
      ctx.zeichne(bild);
      await ctx.sage(`Zähl rückwärts von ${hoch}!`);
      let fehlerfrei = true;
      for (const n of zahlen) {
        if (!ctx.lebt()) return false;
        const getippt = await new Promise((fertig) => {
          const knoten = [...ctx.svg.querySelectorAll(".rw-cd:not(.ist-weg)")];
          const weg = () => knoten.forEach((k) => k.replaceWith(k.cloneNode(true)));
          knoten.forEach((k) => k.addEventListener("click", () => { weg(); fertig(Number(k.dataset.n)); }, { once: true }));
        });
        if (getippt !== n) {
          fehlerfrei = false;
          ctx.jingle("retry");
          ctx.zeige(`Jetzt kommt die ${n}.`);
          const richtig = ctx.svg.querySelector(`.rw-cd[data-n="${n}"]`);
          richtig?.querySelector("circle")?.setAttribute("stroke", "#3fbf74");
          richtig?.querySelector("circle")?.setAttribute("stroke-width", "6");
          // nochmals, bis die richtige kommt
          let ok = false;
          while (!ok && ctx.lebt()) {
            const z = await new Promise((fertig) => {
              const knoten = [...ctx.svg.querySelectorAll(".rw-cd:not(.ist-weg)")];
              const weg = () => knoten.forEach((k) => k.replaceWith(k.cloneNode(true)));
              knoten.forEach((k) => k.addEventListener("click", () => { weg(); fertig(Number(k.dataset.n)); }, { once: true }));
            });
            ok = z === n;
          }
        }
        if (!ctx.lebt()) return false;
        const g = ctx.svg.querySelector(`.rw-cd[data-n="${n}"]`);
        g.classList.add("ist-weg");
        g.setAttribute("opacity", "0.35");
        ctx.blip(n);
        ctx.zeige(String(n));
        try { ctx.kids?.speak?.(String(n)); } catch { /* ohne Stimme */ }
      }
      ctx.jingle("win");
      await ctx.sage("Los! Der Zug fährt ab!");
      ctx.svg.querySelectorAll(".rw-cd").forEach((g) => g.setAttribute("opacity", "1"));
      await ctx.tween(900, (p) => ctx.svg.querySelectorAll(".rw-cd").forEach((g, i) => g.setAttribute("transform", `${g.getAttribute("transform").replace(/ translate\([^)]*\)$/, "")} translate(${(p * 1100).toFixed(0)} 0)`)));
      if (fehlerfrei) ctx.lauf.richtig += 1;
      return fehlerfrei;
    },
  });

  // ===========================================================================
  // Zahlen-Paare
  // ===========================================================================
  function darstellung(A, art, n, x, y, w) {
    const s = w / 120;
    if (art === "ziffer") return `<text x="${x}" y="${y + 26 * s}" text-anchor="middle" font-size="${76 * s}" ${A.FONT} fill="${A.C.ink}">${n}</text>`;
    if (art === "wuerfel") {
      if (n <= 6) return A.wuerfel(x - 40 * s, y - 40 * s, 80 * s, n, A.C.rot);
      return A.wuerfel(x - 86 * s, y - 36 * s, 72 * s, 6, A.C.rot) + A.wuerfel(x + 14 * s, y - 36 * s, 72 * s, n - 6, A.C.blau);
    }
    if (art === "finger") {
      // Zwei Hände: die linke zuerst voll, dann die rechte – wie die Kraft der Fünf.
      const hand = (hx, anzahl) => {
        let t = `<rect x="${hx - 26 * s}" y="${y}" width="${52 * s}" height="${40 * s}" rx="${16 * s}" fill="#f6c89f"/>`;
        for (let f = 0; f < 5; f += 1) {
          const oben = f < anzahl;
          const fx = hx - 24 * s + f * 11 * s;
          t += `<rect x="${fx}" y="${y - (oben ? 44 : 10) * s}" width="${9 * s}" height="${(oben ? 48 : 14) * s}" rx="${4.5 * s}" fill="${oben ? "#f6c89f" : "#e2ad83"}"/>`;
        }
        return t;
      };
      return hand(x - 34 * s, Math.min(5, n)) + hand(x + 34 * s, Math.max(0, n - 5));
    }
    // Punkte im Zehnerfeld
    let t = `<rect x="${x - 56 * s}" y="${y - 24 * s}" width="${112 * s}" height="${48 * s}" rx="${6 * s}" fill="#ffffff" stroke="#e2c389" stroke-width="2"/>`;
    for (let i = 0; i < 10; i += 1) {
      const cx = x - 44 * s + (i % 5) * 22 * s;
      const cy = y - 11 * s + Math.floor(i / 5) * 22 * s;
      t += `<circle cx="${cx}" cy="${cy}" r="${8 * s}" fill="${i < n ? A.fuenfer(i) : "#efe6cf"}"/>`;
    }
    return t;
  }
  R.spiel({
    id: "zahlenpaare",
    titel: "Zahlen-Paare",
    help: "Zahlen-Paare. Jede Zahl kommt zweimal vor, aber anders gezeigt: als Ziffer, als Würfel, mit Fingern oder als Punkte. Tippe zwei Karten an, die gleich viel zeigen.",
    async runde(ctx) {
      const A = ctx.art;
      const paare = ctx.stufe === "leicht" ? 3 : ctx.stufe === "mittel" ? 4 : 5;
      const max = bis(ctx, 5, 10, 10);
      const zahlen = ctx.mische(Array.from({ length: max }, (_, i) => i + 1)).slice(0, paare);
      const arten = ["ziffer", "wuerfel", "finger", "punkte"];
      const karten = [];
      zahlen.forEach((n) => {
        const [a, b] = ctx.mische(arten).slice(0, 2);
        karten.push({ n, art: a }, { n, art: b });
      });
      const liste = ctx.mische(karten);
      const spalten = liste.length <= 6 ? 3 : liste.length <= 8 ? 4 : 5;
      const breite = 900 / spalten;
      const zeilen = Math.ceil(liste.length / spalten);
      const hoehe = Math.min(240, 500 / zeilen);
      let bild = `<rect width="1000" height="560" fill="#fff1cf"/>`;
      liste.forEach((k, i) => {
        const x = 50 + (i % spalten) * breite + breite / 2;
        const y = 30 + Math.floor(i / spalten) * hoehe + hoehe / 2;
        bild += `<g class="rw-karte" data-i="${i}" data-n="${k.n}" role="button" tabindex="0"><rect x="${x - breite / 2 + 10}" y="${y - hoehe / 2 + 8}" width="${breite - 20}" height="${hoehe - 16}" rx="18" fill="#ffffff" stroke="#d6cfa8" stroke-width="3"/>${darstellung(A, k.art, k.n, x, y, Math.min(breite - 30, hoehe * 1.1))}</g>`;
      });
      ctx.zeichne(bild);
      await ctx.sage("Finde die Paare: Welche zwei Karten zeigen gleich viel?");
      let gefunden = 0;
      let fehler = 0;
      while (gefunden < paare && ctx.lebt()) {
        const wahl = [];
        await new Promise((fertig) => {
          const offen = [...ctx.svg.querySelectorAll(".rw-karte:not(.ist-fertig)")];
          const klick = (k) => () => {
            if (wahl.includes(k)) return;
            wahl.push(k);
            k.querySelector("rect").setAttribute("stroke", A.C.blau);
            k.querySelector("rect").setAttribute("stroke-width", "6");
            ctx.blip(wahl.length);
            if (wahl.length === 2) { offen.forEach((o) => o.replaceWith(o.cloneNode(true))); fertig(); }
          };
          offen.forEach((k) => k.addEventListener("click", klick(k)));
        });
        if (!ctx.lebt()) return null;
        const [x, y] = wahl.map((k) => ctx.svg.querySelector(`.rw-karte[data-i="${k.dataset.i}"]`));
        if (x.dataset.n === y.dataset.n) {
          gefunden += 1;
          [x, y].forEach((k) => { k.classList.add("ist-fertig"); k.querySelector("rect").setAttribute("stroke", "#3fbf74"); k.querySelector("rect").setAttribute("fill", "#e9f8ef"); });
          ctx.jingle("correct");
          await ctx.sage(`Ja! Beide zeigen ${x.dataset.n}.`);
        } else {
          fehler += 1;
          ctx.jingle("retry");
          await ctx.sage(`Nicht ganz: Das eine zeigt ${x.dataset.n}, das andere ${y.dataset.n}.`);
          [x, y].forEach((k) => { k.querySelector("rect").setAttribute("stroke", "#d6cfa8"); k.querySelector("rect").setAttribute("stroke-width", "3"); });
        }
      }
      if (!ctx.lebt()) return null;
      return { punkte: Math.max(0, paare - fehler), von: paare, detail: `${paare} Paare gefunden${fehler ? `, ${fehler} Mal daneben` : " – ohne Fehler"}`, speech: `Alle ${paare} Paare gefunden!` };
    },
  });

  // ===========================================================================
  // Finger-Zahlen
  // ===========================================================================
  R.spiel({
    id: "fingerzahlen",
    titel: "Finger-Zahlen",
    help: "Finger-Zahlen. Zeig die Zahl mit den Fingern: Tippe Finger an, damit sie hochgehen oder wieder runter. Fünf ist eine ganze Hand. Dann tippe auf den Haken.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const t = ctx.ziehe(() => { const n = ctx.rnd(1, max); return { n, key: String(n) }; });
      const n = t.n;
      const hoch = new Array(10).fill(false);
      const zeichne = () => {
        let bild = `<rect width="1000" height="560" fill="#fff1cf"/><text x="500" y="110" text-anchor="middle" font-size="96" ${A.FONT} fill="${A.C.ink}">${n}</text>`;
        const hand = (hx, start, spiegel) => {
          let s = `<g transform="translate(${hx} 300) scale(${spiegel ? -1 : 1} 1)"><rect x="-110" y="40" width="220" height="170" rx="70" fill="#f6c89f"/>`;
          for (let f = 0; f < 5; f += 1) {
            const i = start + f;
            const oben = hoch[i];
            const fx = -100 + f * 44;
            const h = f === 0 ? 90 : 150;
            const fy = f === 0 ? 90 : 0;
            s += `<g class="rw-finger" data-f="${i}" role="button" tabindex="0" aria-label="Finger ${i + 1}"><rect x="${fx}" y="${(oben ? fy - 60 : fy + 50)}" width="36" height="${oben ? h + 60 : h - 50}" rx="18" fill="${oben ? "#f6c89f" : "#e2ad83"}" stroke="${oben ? A.fuenfer(i) : "none"}" stroke-width="5"/><rect x="${fx - 6}" y="-80" width="48" height="300" fill="#000" fill-opacity="0"/></g>`;
          }
          return `${s}</g>`;
        };
        bild += hand(300, 0, true) + (max > 5 ? hand(700, 5, false) : "");
        ctx.zeichne(bild);
        ctx.svg.querySelectorAll(".rw-finger").forEach((g) => g.addEventListener("click", () => { const f = Number(g.dataset.f); hoch[f] = !hoch[f]; ctx.blip(f); zeichne(); }));
      };
      zeichne();
      ctx.sage(`Zeig ${n} mit den Fingern!`);
      await ctx.aktion({ text: "Fertig", icon: "haken" });
      if (!ctx.lebt()) return false;
      const gezeigt = hoch.filter(Boolean).length;
      const ok = gezeigt === n;
      ctx.jingle(ok ? "correct" : "retry");
      if (ok) ctx.lauf.richtig += 1;
      // Vorführen: so geht es mit der Kraft der Fünf.
      hoch.fill(false);
      for (let i = 0; i < n; i += 1) hoch[i] = true;
      zeichne();
      await ctx.sage(ok ? `Genau, ${n}!${n > 5 ? ` Eine ganze Hand und noch ${n - 5}.` : ""}` : `Schau: So sind es ${n} Finger.${n > 5 ? ` Eine ganze Hand und noch ${n - 5}.` : ""}`);
      return ok;
    },
  });

  // ===========================================================================
  // Ziffern-Gleis: Punkt zu Punkt
  // ===========================================================================
  // Jede Ziffer als Gleis mit Bahnhöfen (in der Schreibrichtung); das Kind
  // tippt sie der Reihe nach an, die Lok fährt hin, das Gleis wird zur Ziffer.
  // Punkte in der Schreibrichtung; null hebt den Stift (die 4). Kommt ein
  // Punkt zum zweiten Mal (die 0, die 8, die 9 schliessen sich), fährt die
  // Lok von selbst hin – getippt wird nur, was neu ist, und die Nummern auf
  // den Bahnhöfen zählen nur diese.
  const ZIFFERN = {
    0: [[500, 110], [430, 160], [400, 280], [430, 400], [500, 450], [570, 400], [600, 280], [570, 160], [500, 110]],
    1: [[440, 180], [520, 110], [520, 280], [520, 450]],
    2: [[420, 170], [500, 110], [585, 160], [570, 260], [420, 450], [600, 450]],
    3: [[420, 140], [500, 110], [580, 160], [510, 270], [585, 360], [500, 450], [415, 410]],
    4: [[530, 110], [420, 340], [610, 340], null, [560, 240], [560, 450]],
    5: [[590, 110], [440, 110], [430, 260], [530, 240], [600, 330], [540, 440], [420, 420]],
    6: [[575, 115], [475, 190], [425, 300], [430, 400], [500, 450], [575, 400], [570, 320], [500, 290]],
    7: [[410, 110], [600, 110], [520, 280], [470, 450]],
    8: [[500, 270], [420, 185], [500, 110], [580, 185], [500, 270], [410, 360], [500, 450], [590, 360], [500, 270]],
    9: [[580, 190], [500, 110], [420, 190], [500, 270], [580, 190], [560, 330], [470, 450]],
  };
  R.spiel({
    id: "ziffernpunkte",
    titel: "Ziffern-Gleis",
    help: "Ziffern-Gleis. Tippe die Bahnhöfe der Reihe nach an: eins, zwei, drei … Die Lok fährt hin, und das Gleis wird zu einer Ziffer.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const t = ctx.ziehe(() => { const z = ctx.rnd(ctx.stufe === "leicht" ? 1 : 0, ctx.stufe === "leicht" ? 5 : 9); return { z, key: String(z) }; });
      // Die Schritte: jeder Punkt mit seiner Nummer (nur neue zählen), ob er
      // neu ist und ob davor der Stift abgesetzt wurde.
      const schritte = [];
      let nummer = 0;
      let abheben = false;
      ZIFFERN[t.z].forEach((p) => {
        if (!p) { abheben = true; return; }
        const frueher = schritte.find((s) => s.x === p[0] && s.y === p[1]);
        schritte.push({ x: p[0], y: p[1], neu: !frueher, nr: frueher ? frueher.nr : (nummer += 1), abheben });
        abheben = false;
      });
      let bild = `<rect width="1000" height="560" fill="#fff1cf"/><g class="rw-spur"></g>`;
      schritte.filter((s) => s.neu).forEach((s) => {
        bild += `<g class="rw-pkt" data-nr="${s.nr}" role="button" tabindex="0" aria-label="${s.nr}"><circle cx="${s.x}" cy="${s.y}" r="24" fill="#ffffff" stroke="${A.C.blau}" stroke-width="4"/><text x="${s.x}" y="${s.y + 8}" text-anchor="middle" font-size="22" ${A.FONT} fill="${A.C.ink}">${s.nr}</text><circle cx="${s.x}" cy="${s.y}" r="34" fill="#000" fill-opacity="0"/></g>`;
      });
      bild += `<g class="rw-mini" transform="translate(${schritte[0].x} ${schritte[0].y})"><circle r="16" fill="${A.C.lila}" stroke="#ffffff" stroke-width="4"/></g>`;
      ctx.zeichne(bild);
      await ctx.sage("Tippe die Bahnhöfe der Reihe nach an!");
      const spur = ctx.q(".rw-spur");
      const mini = ctx.q(".rw-mini");
      ctx.svg.querySelector('.rw-pkt[data-nr="1"] circle')?.setAttribute("fill", "#e9f8ef");
      let fehler = 0;
      for (let i = 1; i < schritte.length; i += 1) {
        if (!ctx.lebt()) return false;
        const soll = schritte[i];
        if (soll.neu) {
          let getroffen = false;
          while (!getroffen && ctx.lebt()) {
            const wahl = await new Promise((fertig) => {
              const alle = [...ctx.svg.querySelectorAll(".rw-pkt")];
              alle.forEach((g) => g.addEventListener("click", () => { alle.forEach((h) => h.replaceWith(h.cloneNode(true))); fertig(Number(g.dataset.nr)); }, { once: true }));
            });
            getroffen = wahl === soll.nr;
            if (!getroffen) { fehler += 1; ctx.jingle("retry"); ctx.zeige(`Jetzt kommt die ${soll.nr}.`); }
          }
          ctx.svg.querySelector(`.rw-pkt[data-nr="${soll.nr}"] circle`)?.setAttribute("fill", "#e9f8ef");
        }
        if (!ctx.lebt()) return false;
        const vor = schritte[i - 1];
        if (!soll.abheben) spur.insertAdjacentHTML("beforeend", `<line x1="${vor.x}" y1="${vor.y}" x2="${soll.x}" y2="${soll.y}" stroke="${A.C.rot}" stroke-width="18" stroke-linecap="round"/>`);
        await ctx.tween(soll.abheben ? 160 : 280, (p) => ctx.setPos(mini, vor.x + (soll.x - vor.x) * p, vor.y + (soll.y - vor.y) * p));
        ctx.blip(i);
      }
      if (!ctx.lebt()) return false;
      const ok = fehler === 0;
      if (ok) ctx.lauf.richtig += 1;
      ctx.jingle("win");
      ctx.svg.insertAdjacentHTML("beforeend", `<text x="800" y="320" text-anchor="middle" font-size="200" ${A.FONT} fill="${A.C.blau}">${t.z}</text>`);
      await ctx.sage(`Das ist die ${t.z}!`);
      return ok;
    },
  });

  // ===========================================================================
  // Alle einsteigen!
  // ===========================================================================
  R.spiel({
    id: "alleeinsteigen",
    titel: "Alle einsteigen!",
    help: "Alle einsteigen! Tippe jedes Tier am Perron an, dann steigt es ein, und die Stimme zählt mit. Wie viele sind eingestiegen?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const t = ctx.ziehe(() => { const n = ctx.rnd(2, max); return { n, key: String(n) }; });
      const n = t.n;
      const tiere = ctx.mische([...TIER_IDS, ...TIER_IDS]).slice(0, n);
      const plaetze = max <= 5 ? 5 : 10;
      const pw = A.personenWagen(plaetze, [], { W: 600 });
      let bild = `${A.raum(SPUR)}<rect x="0" y="0" width="1000" height="300" fill="#dff1f7"/><rect x="0" y="250" width="1000" height="50" fill="#7cc05e"/>
        <rect x="0" y="${SPUR + 14}" width="1000" height="40" fill="#c9d1df"/><g class="rw-pw" transform="translate(30 ${SPUR})">${pw.svg}</g>`;
      tiere.forEach((id, i) => {
        const x = 60 + (i % 10) * 92;
        bild += `<g class="rw-wartet" data-i="${i}" role="button" tabindex="0" aria-label="${NAMEN[id]}" transform="translate(${x} ${SPUR + 70})">${A.kopf(id, 0, 0, 22)}<circle r="34" fill="#000" fill-opacity="0"/></g>`;
      });
      ctx.zeichne(bild);
      await ctx.sage("Tippe jedes Tier an, dann steigt es ein!");
      const wagenG = ctx.q(".rw-pw");
      for (let k = 0; k < n; k += 1) {
        if (!ctx.lebt()) return false;
        const tier = await new Promise((fertig) => {
          const alle = [...ctx.svg.querySelectorAll(".rw-wartet:not(.ist-weg)")];
          alle.forEach((g) => g.addEventListener("click", () => { alle.forEach((h) => { if (h !== g) h.replaceWith(h.cloneNode(true)); }); fertig(g); }, { once: true }));
        });
        tier.classList.add("ist-weg");
        const ort = pw.orte[k];
        const [x0, y0] = tier.getAttribute("transform").match(/-?[\d.]+/g).map(Number);
        const x1 = 30 + ort.x;
        const y1 = SPUR + ort.y;
        ctx.zeige(String(k + 1));
        try { ctx.kids?.speak?.(String(k + 1)); } catch { /* ohne Stimme */ }
        await ctx.tween(420, (p) => tier.setAttribute("transform", `translate(${(x0 + (x1 - x0) * p).toFixed(1)} ${(y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 50).toFixed(1)}) scale(${(1 - p * 0.35).toFixed(2)})`));
        ctx.blip(k);
      }
      if (!ctx.lebt()) return false;
      ctx.sage("Wie viele sind eingestiegen?");
      const { ok } = await ctx.frage({ lo: 1, hi: max, richtig: n });
      if (!ctx.lebt()) return ok;
      await ctx.sage(ok ? `Genau! Die letzte Zahl sagt es: ${n}.` : `Schau: Du hast bis ${n} gezählt. Die letzte Zahl sagt, wie viele: ${n}.`);
      void wagenG;
      return ok;
    },
  });

  // ===========================================================================
  // Wer hat mehr?
  // ===========================================================================
  const LADUNG = ["🍎", "🐟", "🥕", "⭐", "🌰"];
  function gueterwagen(A, x, n, ding, { ziffer = false, W = 380 } = {}) {
    let s = `<g transform="translate(${x} ${SPUR})"><rect x="0" y="-150" width="${W}" height="120" rx="12" fill="${A.C.holz}"/><rect x="0" y="-150" width="${W}" height="14" rx="7" fill="${A.C.holzDunkel}"/>`;
    if (ziffer) s += `<text x="${W / 2}" y="-58" text-anchor="middle" font-size="80" ${A.FONT} fill="#ffffff">${n}</text>`;
    else for (let i = 0; i < n; i += 1) s += `<text x="${30 + (i % 5) * 70}" y="${-88 + Math.floor(i / 5) * 48}" text-anchor="middle" font-size="40">${ding}</text>`;
    [0.2, 0.8].forEach((q) => { s += `<circle cx="${W * q}" cy="-16" r="16" fill="${A.C.dunkel}"/><circle cx="${W * q}" cy="-16" r="6" fill="#c9d1df"/>`; });
    return `${s}</g>`;
  }
  R.spiel({
    id: "werhatmehr",
    titel: "Wer hat mehr?",
    help: "Wer hat mehr? Schau dir die beiden Wagen an. Tippe auf den Wagen mit mehr – oder auf «gleich viel», wenn beide gleich viel haben.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 20);
      const ziffer = ctx.stufe === "schwer";
      const t = ctx.ziehe(() => {
        const a = ctx.rnd(1, max);
        let b = ctx.rnd(1, max);
        if (Math.random() < 0.2) b = a;
        if (ctx.stufe === "leicht" && a !== b && Math.abs(a - b) < 2) return null;
        return { a, b, key: `${a}|${b}` };
      });
      const { a, b } = t;
      const ding = LADUNG[ctx.rnd(0, LADUNG.length - 1)];
      ctx.zeichne(`${A.raum(SPUR)}${gueterwagen(A, 60, a, ding, { ziffer })}${gueterwagen(A, 560, b, ding, { ziffer })}`);
      ctx.sage(ziffer ? "Welche Zahl ist grösser?" : "Welcher Wagen hat mehr?");
      const richtig = a > b ? "links" : a < b ? "rechts" : "gleich";
      const { ok } = await ctx.waehle({
        knoepfe: [{ wert: "links", text: "◀ Der linke" }, { wert: "gleich", text: "= Gleich viel" }, { wert: "rechts", text: "Der rechte ▶" }],
        richtig,
      });
      if (!ctx.lebt()) return ok;
      const satz = a === b ? `Beide haben ${a}. Gleich viel!` : `${Math.max(a, b)} ist mehr als ${Math.min(a, b)}.`;
      await ctx.sage(ok ? `Genau! ${satz}` : `Schau: ${satz}`);
      return ok;
    },
  });

  // ===========================================================================
  // Zähl-Fenster
  // ===========================================================================
  const DINGE = [{ e: "🐄", w: "Kühe" }, { e: "🐑", w: "Schafe" }, { e: "🌳", w: "Bäume" }, { e: "🏠", w: "Häuser" }, { e: "🐦", w: "Vögel" }];
  R.spiel({
    id: "zaehlfenster",
    titel: "Zähl-Fenster",
    help: "Zähl-Fenster. Draussen ist viel los. Zähl genau, was die Stimme fragt, und tippe die Zahl an.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 15);
      const ziel = DINGE[ctx.rnd(0, DINGE.length - 1)];
      const t = ctx.ziehe(() => { const n = ctx.rnd(1, max); return { n, key: `${ziel.e}${n}` }; });
      const n = t.n;
      const andere = ctx.stufe === "leicht" ? 0 : ctx.rnd(3, 7);
      const orte = [];
      const frei = (x, y) => orte.every((o) => Math.hypot(o.x - x, o.y - y) > 70);
      const setze = (e) => { for (let k = 0; k < 200; k += 1) { const x = ctx.rnd(110, 890); const y = ctx.rnd(130, 410); if (frei(x, y)) { orte.push({ x, y, e }); return; } } };
      for (let i = 0; i < n; i += 1) setze(ziel.e);
      const sonst = DINGE.filter((d) => d.e !== ziel.e);
      for (let i = 0; i < andere; i += 1) setze(sonst[ctx.rnd(0, sonst.length - 1)].e);
      let bild = A.fensterBlick();
      orte.forEach((o) => { bild += `<text class="rw-ding${o.e === ziel.e ? " ist-ziel" : ""}" x="${o.x}" y="${o.y}" text-anchor="middle" font-size="54">${o.e}</text>`; });
      ctx.zeichne(bild);
      ctx.sage(`Wie viele ${ziel.w} siehst du?`);
      const { ok } = await ctx.frage({ lo: 1, hi: max, richtig: n });
      if (!ctx.lebt()) return ok;
      const ziele = [...ctx.svg.querySelectorAll(".rw-ding.ist-ziel")];
      if (!(await ctx.zaehle(ziele.map((z) => ({ g: ctx.svg, x: Number(z.getAttribute("x")) + 26, y: Number(z.getAttribute("y")) - 44 })), 200))) return ok;
      await ctx.sage(ok ? `Genau, ${n} ${ziel.w}!` : `Schau: ${n} ${ziel.w}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Wagen ordnen
  // ===========================================================================
  R.spiel({
    id: "wagenordnen",
    titel: "Wagen ordnen",
    help: "Wagen ordnen. Die Wagen stehen durcheinander. Kuppel sie der Reihe nach an die Lok: zuerst die kleinste Zahl.",
    aufgaben: 3,
    async aufgabe(ctx) {
      const A = ctx.art;
      const anzahl = ctx.stufe === "leicht" ? 4 : 5;
      const max = bis(ctx, 6, 10, 20);
      let zahlen;
      if (ctx.stufe === "schwer") {
        const s = new Set();
        while (s.size < anzahl) s.add(ctx.rnd(1, max));
        zahlen = [...s].sort((x, y) => x - y);
      } else {
        const start = ctx.stufe === "leicht" ? 1 : ctx.rnd(1, Math.max(1, max - anzahl + 1));
        zahlen = Array.from({ length: anzahl }, (_, i) => start + i);
      }
      const durcheinander = ctx.mische(zahlen);
      let bild = `${A.raum(SPUR)}<rect x="0" y="300" width="1000" height="10" fill="#8b95a8" opacity="0.5"/><g class="rw-zug" transform="translate(30 ${SPUR})">${A.lok(1, true)}</g>`;
      durcheinander.forEach((n, i) => {
        bild += `<g class="rw-lose" data-n="${n}" role="button" tabindex="0" aria-label="Wagen ${n}" transform="translate(${130 + i * 170} 300)">${A.wagen(0, A.fuenfer(i % 10), 1.4, i)}<circle cx="40" cy="-104" r="24" fill="#ffffff" stroke="${A.C.ink}" stroke-opacity="0.2" stroke-width="2"/><text x="40" y="-95" text-anchor="middle" font-size="26" ${A.FONT} fill="${A.C.ink}">${n}</text><rect x="-10" y="-130" width="100" height="135" fill="#000" fill-opacity="0"/></g>`;
      });
      ctx.zeichne(bild);
      await ctx.sage("Kuppel die Wagen der Reihe nach an!");
      const zug = ctx.q(".rw-zug");
      let fehler = 0;
      for (let k = 0; k < zahlen.length; k += 1) {
        if (!ctx.lebt()) return false;
        const soll = zahlen[k];
        let g = null;
        while (ctx.lebt()) {
          g = await new Promise((fertig) => {
            const alle = [...ctx.svg.querySelectorAll(".rw-lose:not(.ist-dran)")];
            alle.forEach((h) => h.addEventListener("click", () => { alle.forEach((x) => { if (x !== h) x.replaceWith(x.cloneNode(true)); }); fertig(h); }, { once: true }));
          });
          if (Number(g.dataset.n) === soll) break;
          fehler += 1;
          ctx.jingle("retry");
          ctx.zeige(`Zuerst kommt die ${soll}.`);
          g.replaceWith(g.cloneNode(true));
        }
        if (!ctx.lebt()) return false;
        g.classList.add("ist-dran");
        const x1 = 30 + 116 + k * 64 - 6;
        const [x0, y0] = g.getAttribute("transform").match(/-?[\d.]+/g).map(Number);
        g.querySelector(".rw-wagen > g")?.setAttribute("transform", "translate(0 0) scale(1)");
        await ctx.tween(420, (p) => g.setAttribute("transform", `translate(${(x0 + (x1 - x0) * p).toFixed(1)} ${(y0 + (SPUR - y0) * p).toFixed(1)})`));
        ctx.klack();
        g.querySelector("circle")?.setAttribute("cy", "-80");
        g.querySelector("text")?.setAttribute("y", "-71");
        void zug;
      }
      const ok = fehler === 0;
      if (ok) ctx.lauf.richtig += 1;
      // Gesprochen ohne die Zahlen: Sie stehen auf den Wagen, und für jede
      // Reihe gäbe es eine eigene Aufnahme.
      await ctx.sage(ok ? `Perfekt: ${zahlen.join(", ")}!` : `Geschafft: ${zahlen.join(", ")}.`, ok ? "Perfekt! Alle Wagen sind in der richtigen Reihe." : "Geschafft! Alle Wagen sind in der richtigen Reihe.");
      return ok;
    },
  });

  // ===========================================================================
  // Muster-Zug und Stolperwagen
  // ===========================================================================
  const MUSTER = { leicht: ["AB", "AAB", "ABB"], mittel: ["AB", "AAB", "ABB", "ABC", "AABB"], schwer: ["ABC", "AABB", "ABCC", "AABC"] };
  function musterReihe(ctx, laenge) {
    const art = MUSTER[ctx.stufe][ctx.rnd(0, MUSTER[ctx.stufe].length - 1)];
    const farben = ctx.mische(FARBEN).slice(0, 3);
    const reihe = Array.from({ length: laenge }, (_, i) => farben[art.charCodeAt(i % art.length) - 65]);
    return { art, reihe, farben };
  }
  function musterBild(A, reihe, { luecke = -1, x0 = 150 } = {}) {
    let zug = A.lok(1, true);
    reihe.forEach((f, i) => {
      zug += i === luecke
        ? `<g class="rw-wagen" data-i="${i}" data-bx="${116 + i * 64 + 29}" data-by="-56"><rect x="${116 + i * 64}" y="-56" width="58" height="42" rx="7" fill="#ffffff" stroke="${A.C.grau}" stroke-width="3" stroke-dasharray="6 5"/><text x="${116 + i * 64 + 29}" y="-26" text-anchor="middle" font-size="26" ${A.FONT} fill="${A.C.grau}">?</text></g>`
        : A.wagen(116 + i * 64, f.farbe, 1, i);
    });
    return `${A.raum(SPUR)}<g class="rw-zug" transform="translate(${x0 - 116} ${SPUR})">${zug}</g>`;
  }
  R.spiel({
    id: "musterzug",
    titel: "Muster-Zug",
    help: "Muster-Zug. Die Wagen haben ein Muster: rot, blau, rot, blau … Welcher Wagen kommt als Nächstes? Tippe auf die richtige Farbe.",
    async aufgabe(ctx) {
      const A = ctx.art;
      if (ctx.stufe === "schwer" && Math.random() < 0.4) {
        // Zahlenfolgen
        const t = ctx.ziehe(() => { const schritt = ctx.rnd(2, 3); const start = ctx.rnd(1, 6); return { schritt, start, key: `${start}+${schritt}` }; });
        const reihe = Array.from({ length: 5 }, (_, i) => t.start + i * t.schritt);
        let bild = `${A.raum(SPUR)}`;
        reihe.forEach((n, i) => { bild += bahnhof(A, 120 + i * 190, SPUR, i === 4 ? "?" : n, { frage: i === 4 }); });
        ctx.zeichne(bild);
        ctx.sage(`Welche Zahl kommt nach ${reihe.slice(0, 4).join(", ")}?`);
        const { ok } = await ctx.frage({ werte: R.auswahl(reihe[4], 1, 40), richtig: reihe[4] });
        if (!ctx.lebt()) return ok;
        ctx.svg.querySelectorAll(".rw-bahnhof-zahl")[4].textContent = String(reihe[4]);
        await ctx.sage(ok ? `Genau! Immer ${t.schritt} mehr.` : `Schau: Immer ${t.schritt} mehr – also ${reihe[4]}.`);
        return ok;
      }
      const laenge = 7;
      const { reihe, farben } = musterReihe(ctx, laenge);
      ctx.zeichne(musterBild(A, reihe, { luecke: laenge - 1 }));
      ctx.sage("Welcher Wagen kommt als Nächstes?");
      const richtig = reihe[laenge - 1].id;
      const { ok } = await ctx.waehle({
        knoepfe: farben.map((f) => ({ wert: f.id, html: `<svg viewBox="-4 -60 66 64" aria-hidden="true">${A.wagenBasis(f.farbe)}</svg>`, label: f.name })),
        richtig,
      });
      if (!ctx.lebt()) return ok;
      ctx.zeichne(musterBild(A, reihe));
      await ctx.sage(ok ? "Genau! Das Muster geht weiter." : `Schau: Es kommt ${reihe[laenge - 1].name}.`);
      return ok;
    },
  });
  R.spiel({
    id: "stolperwagen",
    titel: "Stolperwagen",
    help: "Stolperwagen. Ein Wagen passt nicht ins Muster. Tippe ihn an, dann kommt der richtige.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const laenge = 8;
      const { reihe, farben } = musterReihe(ctx, laenge);
      const falsch = ctx.rnd(2, laenge - 1);
      const echt = reihe[falsch];
      const fremd = farben.concat(FARBEN).find((f) => f.id !== echt.id && f.id !== reihe[falsch - 1].id) || FARBEN[3];
      const zug = reihe.map((f, i) => (i === falsch ? fremd : f));
      ctx.zeichne(musterBild(A, zug, { x0: 110 }));
      ctx.sage("Welcher Wagen passt nicht?");
      const ziele = [...ctx.svg.querySelectorAll(".rw-zug .rw-wagen")].map((el) => ({ el, wert: Number(el.dataset.i) }));
      const { ok } = await ctx.waehle({ ziele, richtig: falsch });
      if (!ctx.lebt()) return ok;
      const w = ctx.svg.querySelector(`.rw-zug .rw-wagen[data-i="${falsch}"] .wb`);
      w?.setAttribute("fill", echt.farbe);
      ctx.klack();
      await ctx.sage(ok ? "Gefunden! Jetzt stimmt das Muster." : "Schau: Dieser Wagen passte nicht. Jetzt stimmt das Muster.");
      return ok;
    },
  });

  // ===========================================================================
  // Hüpf-Lok
  // ===========================================================================
  function zahlenstrahl(A, bisZahl, { y = 380, x0 = 70, x1 = 930 } = {}) {
    const dx = (x1 - x0) / bisZahl;
    let s = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#8b95a8" stroke-width="10" stroke-linecap="round"/>`;
    for (let n = 0; n <= bisZahl; n += 1) {
      const x = x0 + n * dx;
      const lang = n % 5 === 0;
      s += `<line x1="${x}" y1="${y - (lang ? 22 : 14)}" x2="${x}" y2="${y + (lang ? 22 : 14)}" stroke="${A.C.ink}" stroke-width="${lang ? 4 : 2}"/>`;
      if (bisZahl <= 10 || n % (bisZahl > 20 ? 10 : 5) === 0 || bisZahl <= 20) s += `<text x="${x}" y="${y + 56}" text-anchor="middle" font-size="${bisZahl > 10 ? 22 : 30}" ${A.FONT} fill="${A.C.ink}">${n}</text>`;
    }
    return { svg: s, xVon: (n) => x0 + n * dx, dx };
  }
  R.spiel({
    id: "huepflok",
    titel: "Hüpf-Lok",
    help: "Hüpf-Lok. Die Lok steht auf einer Zahl, auf dem Billett steht, wie weit sie hüpft. Zähl weiter, nicht von vorn! Wo landet sie?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 10, 10, 20);
      const t = ctx.ziehe(() => { const b = ctx.rnd(1, Math.min(5, max - 1)); const a = ctx.rnd(1, max - b); return { a, b, key: `${a}+${b}` }; });
      const { a, b } = t;
      const strahl = zahlenstrahl(A, max);
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/>${strahl.svg}
        <g class="rw-billett" transform="translate(500 90)"><rect x="-90" y="-40" width="180" height="80" rx="12" fill="#ffffff" stroke="${A.C.rot}" stroke-width="4" stroke-dasharray="10 6"/><text y="20" text-anchor="middle" font-size="54" ${A.FONT} fill="${A.C.rot}">+ ${b}</text></g>
        <g class="rw-boegen"></g>
        <g class="rw-mini" transform="translate(${strahl.xVon(a)} 380)"><g transform="translate(-42 -18)">${A.lok(0.78, false)}</g></g>`);
      const mini = ctx.q(".rw-mini");
      const boegen = ctx.q(".rw-boegen");
      const huepfen = async (von, nach) => {
        for (let n = von + 1; n <= nach; n += 1) {
          if (!ctx.lebt()) return;
          const xa = strahl.xVon(n - 1);
          const xb = strahl.xVon(n);
          boegen.insertAdjacentHTML("beforeend", `<path d="M${xa} 360 Q${(xa + xb) / 2} 290 ${xb} 360" stroke="${A.C.lila}" stroke-width="5" fill="none"/>`);
          await ctx.tween(300, (p) => ctx.setPos(mini, xa + (xb - xa) * p, 380 - Math.sin(p * Math.PI) * 70));
          ctx.blip(n);
          try { ctx.kids?.speak?.(String(n)); } catch { /* ohne Stimme */ }
          await ctx.warte(180);
        }
      };
      if (ctx.stufe === "leicht") {
        await ctx.sage(`Die Lok steht bei ${a} und hüpft ${b} weiter: Tippe ${b === 1 ? "einmal" : `${b} Mal`} auf die Lok!`);
        mini.classList.add("rw-tippmich");
        let pos = a;
        await new Promise((fertig) => {
          const tipp = async () => {
            mini.removeEventListener("click", tipp);
            await huepfen(pos, pos + 1);
            pos += 1;
            if (pos < a + b && ctx.lebt()) mini.addEventListener("click", tipp);
            else { mini.classList.remove("rw-tippmich"); fertig(); }
          };
          mini.addEventListener("click", tipp);
        });
        if (!ctx.lebt()) return false;
        ctx.sage("Wo ist die Lok jetzt?");
        const { ok } = await ctx.frage({ werte: R.auswahl(a + b, 0, max), richtig: a + b, aufgabe: { a, op: "+", b } });
        await ctx.sage(ok ? `Genau! ${a} und ${b} sind ${a + b}.` : `Schau: ${a} und ${b} sind ${a + b}.`);
        return ok;
      }
      ctx.sage(`Die Lok steht bei ${a} und hüpft ${b} weiter. Wo landet sie?`);
      const { ok } = await ctx.frage({ werte: R.auswahl(a + b, 0, max), richtig: a + b, aufgabe: { a, op: "+", b } });
      if (!ctx.lebt()) return ok;
      await huepfen(a, a + b);
      await ctx.sage(ok ? `Genau! ${a} und ${b} sind ${a + b}.` : `Schau: ${a} und ${b} sind ${a + b}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Würfel-Plus
  // ===========================================================================
  R.spiel({
    id: "wuerfelplus",
    titel: "Würfel-Plus",
    help: "Würfel-Plus. Zwei Würfel: Wie viele Augen sind es zusammen? Wer die Würfelbilder kennt, muss nicht zählen.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const seiten = ctx.stufe === "leicht" ? 3 : 6;
      const t = ctx.ziehe(() => { const a = ctx.rnd(1, seiten); const b = ctx.rnd(1, seiten); return a + b > ctx.deckel ? null : { a, b, key: `${a}+${b}` }; });
      const { a, b } = t;
      ctx.zeichne(`<rect width="1000" height="560" fill="#e8f6ee"/><g class="rw-w">${A.wuerfel(250, 160, 200, a, A.C.rot)}${A.wuerfel(550, 160, 200, b, A.C.blau)}</g>`);
      ctx.klack();
      if (ctx.stufe === "schwer") {
        await ctx.sage("Schau schnell!");
        await ctx.warte(1800);
        ctx.q(".rw-w")?.setAttribute("opacity", "0.06");
      }
      ctx.sage("Wie viele Augen sind es zusammen?");
      const { ok } = await ctx.frage({ lo: 2, hi: seiten * 2, richtig: a + b, aufgabe: { a, op: "+", b } });
      if (!ctx.lebt()) return ok;
      ctx.q(".rw-w")?.setAttribute("opacity", "1");
      await ctx.sage(ok ? `Genau! ${a} und ${b} sind ${a + b}.` : `Schau: ${a} und ${b} sind ${a + b}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Wer versteckt sich im Tunnel?
  // ===========================================================================
  R.spiel({
    id: "tunnelversteck",
    titel: "Tunnel-Versteck",
    help: "Tunnel-Versteck. Auf dem Schild steht, wie viele Wagen der Zug hat. Ein paar siehst du, die anderen sind im Tunnel. Wie viele sind drin?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 9, 9);
      const t = ctx.ziehe(() => { const n = ctx.rnd(3, max); const sicht = ctx.rnd(1, n - 1); return { n, sicht, key: `${n}-${sicht}` }; });
      const { n, sicht } = t;
      const TS = 46;
      const K = 0.72;
      let zug = A.lok(K, false);
      for (let i = 0; i < n; i += 1) zug += A.wagen(-(i + 1) * TS + 4, A.fuenfer(i), K, i);
      zug += A.schild(-((n * TS) / 2) + 40, -96, n);
      // So weit im Tunnel, dass genau «sicht» Wagen davor stehen.
      const x = 410 + sicht * TS - 4;
      ctx.zeichne(`${A.raum(SPUR)}<g class="rw-zug-a" transform="translate(${x + (n - sicht) * TS} ${SPUR})">${zug}</g><g class="rw-berg">${A.tunnelBerg(410, SPUR)}</g>`);
      // Das Schild steht über dem Tunnel, wo man es sieht.
      const zugG = ctx.q(".rw-zug-a");
      const schildG = zugG.querySelector(".rw-schild");
      if (schildG) { schildG.remove(); ctx.svg.insertAdjacentHTML("beforeend", `<g transform="translate(260 120)">${A.schild(0, 0, `${n} Wagen`)}</g>`); }
      ctx.sage(`Der Zug hat ${n} Wagen. ${sicht === 1 ? "1 Wagen siehst du" : `${sicht} Wagen siehst du`}. Wie viele sind im Tunnel?`);
      const { ok } = await ctx.frage({ lo: 0, hi: max, richtig: n - sicht, aufgabe: { a: sicht, op: "+", b: n - sicht } });
      if (!ctx.lebt()) return ok;
      const berg = ctx.q(".rw-berg");
      await ctx.tween(750, (p) => berg.setAttribute("transform", `translate(${(p * 30).toFixed(1)} ${(-p * 470).toFixed(1)})`));
      await ctx.sage(ok ? `Genau! ${sicht} und ${n - sicht} sind ${n}.` : `Schau: Im Tunnel ${n - sicht === 1 ? "war 1 Wagen" : `waren ${n - sicht} Wagen`}. ${sicht} und ${n - sicht} sind ${n}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Abkuppeln
  // ===========================================================================
  R.spiel({
    id: "abkuppeln",
    titel: "Abkuppeln",
    help: "Abkuppeln. Ein paar Wagen rollen aufs Abstellgleis. Wie viele bleiben an der Lok?",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const t = ctx.ziehe(() => { const a = ctx.rnd(3, max); const b = ctx.rnd(1, a - 1); return { a, b, key: `${a}-${b}` }; });
      const { a, b } = t;
      let zug = A.lok(1, true);
      for (let i = 0; i < a; i += 1) zug += A.wagen(116 + i * 64, A.fuenfer(i), 1, i);
      const versteckt = ctx.stufe === "schwer";
      ctx.zeichne(`${A.raum(SPUR)}<rect x="560" y="${SPUR - 120}" width="440" height="6" fill="#8b95a8" opacity="0.6"/>
        ${versteckt ? `<text class="rw-rechnung" x="500" y="200" text-anchor="middle" font-size="104" ${A.FONT} fill="${A.C.ink}">${a} − ${b} = ?</text>` : ""}
        <g class="rw-zug-a" transform="translate(40 ${SPUR})" ${versteckt ? 'opacity="0"' : ""}>${zug}</g>`);
      const zugG = ctx.q(".rw-zug-a");
      const abrollen = async () => {
        const hinten = [...zugG.querySelectorAll(".rw-wagen")].filter((w) => Number(w.dataset.i) >= a - b);
        ctx.klack();
        await ctx.tween(900, (p) => hinten.forEach((w) => w.setAttribute("transform", `translate(${(p * (980 - (116 + a * 64))).toFixed(1)} ${(-p * 120).toFixed(1)})`)));
        hinten.forEach((w) => w.classList.add("ist-ab"));
      };
      if (versteckt) {
        ctx.sage(`${a} − ${b} = ?`, `${a} minus ${b}. Wie viel ist das?`);
        const { ok } = await ctx.frage({ lo: 0, hi: max, richtig: a - b, aufgabe: { a, op: "-", b } });
        if (!ctx.lebt()) return ok;
        zugG.setAttribute("opacity", "1");
        ctx.q(".rw-rechnung")?.setAttribute("opacity", "0.25");
        await abrollen();
        await ctx.zaehle(ctx.wagenOrte(zugG).filter((o) => !o.w.classList.contains("ist-ab")), 230);
        await ctx.sage(ok ? `Richtig! ${a} minus ${b} sind ${a - b}.` : `Schau: ${a} minus ${b} sind ${a - b}.`);
        return ok;
      }
      if (ctx.stufe === "leicht") {
        await ctx.sage(`Der Zug hat ${wagenWort(a)}. Tippe auf den letzten Wagen: ${b === 1 ? "1 Wagen rollt" : `${b} Wagen rollen`} weg.`);
        const letzter = zugG.querySelector(`.rw-wagen[data-i="${a - 1}"]`);
        letzter?.classList.add("rw-tippmich");
        await new Promise((fertig) => letzter?.addEventListener("click", fertig, { once: true }) || fertig());
        letzter?.classList.remove("rw-tippmich");
      } else {
        await ctx.sage(`Der Zug hat ${wagenWort(a)}. ${b === 1 ? "1 Wagen rollt" : `${b} Wagen rollen`} aufs Abstellgleis.`);
      }
      if (!ctx.lebt()) return false;
      await abrollen();
      ctx.sage("Wie viele Wagen sind noch an der Lok?");
      const { ok } = await ctx.frage({ lo: 0, hi: max, richtig: a - b, aufgabe: { a, op: "-", b } });
      if (!ctx.lebt()) return ok;
      await ctx.zaehle(ctx.wagenOrte(zugG).filter((o) => !o.w.classList.contains("ist-ab")), 260);
      await ctx.sage(ok ? `Genau! ${a} minus ${b} sind ${a - b}.` : `Schau: ${a - b === 1 ? "Es ist 1 Wagen" : `Es sind ${a - b} Wagen`}. ${a} minus ${b} sind ${a - b}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Aussteigen bitte! und Plus oder Minus?
  // ===========================================================================
  async function perronGeschichte(ctx, { a, b, plus, sehen = true }) {
    const A = ctx.art;
    const max = 10;
    const plaetze = Math.max(a, plus ? a + b : a) <= 5 ? 5 : 10;
    const tiere = ctx.mische(TIER_IDS);
    const drin = tiere.slice(0, a);
    const neu = plus ? tiere.slice(a, a + b) : [];
    const pw = A.personenWagen(plaetze, drin, { W: 600 });
    let perron = `<rect x="660" y="${SPUR - 18}" width="340" height="26" fill="#c9d1df"/><rect x="900" y="${SPUR - 150}" width="6" height="132" fill="#5d6882"/><rect x="866" y="${SPUR - 168}" width="74" height="26" rx="5" fill="#ffffff" stroke="${A.C.blau}" stroke-width="3"/><text x="903" y="${SPUR - 149}" text-anchor="middle" font-size="16" ${A.FONT} fill="${A.C.blau}">Perron</text>`;
    neu.forEach((id, i) => { perron += `<g class="rw-wartet" transform="translate(${700 + i * 46} ${SPUR - 70})">${A.kopf(id, 0, 0, 16)}</g>`; });
    ctx.zeichne(`${A.raum(SPUR)}<rect x="0" y="0" width="1000" height="300" fill="#dff1f7"/><rect x="0" y="250" width="1000" height="50" fill="#7cc05e"/>${perron}<g class="rw-pw" transform="translate(30 ${SPUR})"${sehen ? "" : ' opacity="0"'}>${pw.svg}</g>`);
    const wagenG = ctx.q(".rw-pw");
    if (!sehen) return { wagenG, pw, drin, neu, max, plaetze };
    if (plus) {
      const figuren = [...ctx.svg.querySelectorAll(".rw-wartet")];
      for (let i = 0; i < figuren.length; i += 1) {
        const fig = figuren[i];
        const ort = pw.orte[a + i];
        const [x0, y0] = fig.getAttribute("transform").match(/-?[\d.]+/g).map(Number);
        await ctx.tween(520, (p) => fig.setAttribute("transform", `translate(${(x0 + (30 + ort.x - x0) * p).toFixed(1)} ${(y0 + (SPUR + ort.y - y0) * p - Math.sin(p * Math.PI) * 60).toFixed(1)})`));
        ctx.blip(i);
      }
    } else {
      // Die letzten b steigen aus und hüpfen auf den Perron.
      for (let i = 0; i < b; i += 1) {
        const idx = a - 1 - i;
        const ort = pw.orte[idx];
        const id = drin[idx];
        const neuSvg = A.personenWagen(plaetze, drin.slice(0, idx), { W: 600 });
        wagenG.innerHTML = neuSvg.svg;
        ctx.svg.insertAdjacentHTML("beforeend", `<g class="rw-raus" transform="translate(${30 + ort.x} ${SPUR + ort.y})">${A.kopf(id, 0, 0, 16)}</g>`);
        const fig = ctx.svg.querySelector(".rw-raus:last-of-type");
        const x1 = 700 + i * 46;
        const y1 = SPUR - 70;
        await ctx.tween(520, (p) => fig.setAttribute("transform", `translate(${(30 + ort.x + (x1 - 30 - ort.x) * p).toFixed(1)} ${(SPUR + ort.y + (y1 - SPUR - ort.y) * p - Math.sin(p * Math.PI) * 60).toFixed(1)})`));
        ctx.blip(i);
      }
    }
    return { wagenG, pw, drin, neu, max, plaetze };
  }
  R.spiel({
    id: "aussteigen",
    titel: "Aussteigen bitte!",
    help: "Aussteigen bitte! Der Zug hält am Perron, ein paar Tiere steigen aus. Wie viele fahren noch mit?",
    async aufgabe(ctx) {
      const max = bis(ctx, 5, 10, 10);
      const mischen = ctx.stufe === "schwer";
      const plus = mischen && Math.random() < 0.5;
      const t = ctx.ziehe(() => {
        if (plus) { const a = ctx.rnd(1, max - 1); const b = ctx.rnd(1, Math.min(5, max - a)); return { a, b, plus, key: `${a}+${b}` }; }
        const a = ctx.rnd(2, max); const b = ctx.rnd(1, Math.min(5, a - 1)); return { a, b, plus, key: `${a}-${b}` };
      });
      const { a, b } = t;
      await ctx.sage(`Im Zug ${a === 1 ? "sitzt 1 Tier" : `sitzen ${a} Tiere`}. ${b === 1 ? "1 Tier steigt" : `${b} Tiere steigen`} ${plus ? "ein" : "aus"}.`);
      if (!ctx.lebt()) return false;
      await perronGeschichte(ctx, { a, b, plus: t.plus });
      if (!ctx.lebt()) return false;
      ctx.sage("Wie viele Tiere fahren jetzt mit?");
      const richtig = t.plus ? a + b : a - b;
      const { ok } = await ctx.frage({ lo: 0, hi: max, richtig, aufgabe: { a, op: t.plus ? "+" : "-", b } });
      if (!ctx.lebt()) return ok;
      const satz = t.plus ? `${a} und ${b} sind ${richtig}.` : `${a} minus ${b} sind ${richtig}.`;
      await ctx.sage(ok ? `Genau! ${satz}` : `Schau: Es fahren ${richtig} Tiere mit. ${satz}`);
      return ok;
    },
  });
  R.spiel({
    id: "plusoderminus",
    titel: "Plus oder Minus?",
    help: "Plus oder Minus? Hör die Geschichte: Kommen Tiere dazu oder gehen welche weg? Tippe auf Plus oder auf Minus.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const plus = Math.random() < 0.5;
      const max = bis(ctx, 5, 10, 10);
      const t = ctx.ziehe(() => {
        if (plus) { const a = ctx.rnd(1, max - 1); const b = ctx.rnd(1, Math.min(4, max - a)); return { a, b, key: `${a}+${b}` }; }
        const a = ctx.rnd(2, max); const b = ctx.rnd(1, Math.min(4, a - 1)); return { a, b, key: `${a}-${b}` };
      });
      const { a, b } = t;
      ctx.zeichne(`${A.raum(SPUR)}<rect x="0" y="0" width="1000" height="300" fill="#dff1f7"/>`);
      await ctx.sage(`Im Zug ${a === 1 ? "sitzt 1 Tier" : `sitzen ${a} Tiere`}. ${b === 1 ? "1 Tier steigt" : `${b} Tiere steigen`} ${plus ? "ein" : "aus"}. Werden es mehr oder weniger?`);
      if (!ctx.lebt()) return false;
      const { ok } = await ctx.waehle({
        knoepfe: [{ wert: "plus", text: "+ mehr", label: "Plus: es werden mehr" }, { wert: "minus", text: "− weniger", label: "Minus: es werden weniger" }],
        richtig: plus ? "plus" : "minus",
      });
      if (!ctx.lebt()) return ok;
      await perronGeschichte(ctx, { a, b, plus });
      if (!ctx.lebt()) return ok;
      const richtig = plus ? a + b : a - b;
      await ctx.sage(plus ? `Plus: Es kommen welche dazu. ${a} und ${b} sind ${richtig}.` : `Minus: Es gehen welche weg. ${a} minus ${b} sind ${richtig}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Ballon-Wagen
  // ===========================================================================
  R.spiel({
    id: "ballonwagen",
    titel: "Ballon-Wagen",
    help: "Ballon-Wagen. An einem Wagen hängen Ballone. Lass so viele platzen, wie die Stimme sagt – dann zähl, wie viele noch fliegen.",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = bis(ctx, 5, 10, 10);
      const t = ctx.ziehe(() => { const a = ctx.rnd(3, max); const b = ctx.rnd(1, a - 1); return { a, b, key: `${a}-${b}` }; });
      const { a, b } = t;
      const farben = ["#e8543f", "#3d7be0", "#ffd166", "#3fbf74", "#ef6fa8"];
      let schnuere = "";
      let ballone = "";
      for (let i = 0; i < a; i += 1) {
        const x = 260 + (i % 5) * 110 + (Math.floor(i / 5) % 2) * 55;
        const y = 120 + Math.floor(i / 5) * 105;
        schnuere += `<path class="rw-schnur" data-i="${i}" d="M${x} ${y + 46} Q${x + 10} ${(y + 46 + SPUR - 160) / 2} 500 ${SPUR - 160}" stroke="#5d6882" stroke-width="2" fill="none"/>`;
        ballone += `<g class="rw-ballon" data-i="${i}" role="button" tabindex="0" aria-label="Ballon"><ellipse cx="${x}" cy="${y}" rx="40" ry="48" fill="${farben[i % farben.length]}"/><ellipse cx="${x - 13}" cy="${y - 18}" rx="9" ry="13" fill="#ffffff" fill-opacity="0.45"/><circle cx="${x}" cy="${y}" r="52" fill="#000" fill-opacity="0"/></g>`;
      }
      ctx.zeichne(`${A.raum(SPUR)}${schnuere}<g transform="translate(330 ${SPUR})">${A.wagen(0, A.C.gelb, 2.9, 0)}</g>${ballone}`);
      await ctx.sage(`${a} Ballone. Lass ${b} platzen!`);
      let geplatzt = 0;
      while (geplatzt < b && ctx.lebt()) {
        const g = await new Promise((fertig) => {
          const alle = [...ctx.svg.querySelectorAll(".rw-ballon:not(.ist-weg)")];
          alle.forEach((h) => h.addEventListener("click", () => { alle.forEach((x) => { if (x !== h) x.replaceWith(x.cloneNode(true)); }); fertig(h); }, { once: true }));
        });
        g.classList.add("ist-weg");
        geplatzt += 1;
        ctx.klack();
        ctx.zeige(String(geplatzt));
        g.style.pointerEvents = "none";
        ctx.svg.querySelector(`.rw-schnur[data-i="${g.dataset.i}"]`)?.remove();
        await ctx.tween(220, (p) => { g.setAttribute("opacity", String(1 - p)); });
        g.remove();
      }
      if (!ctx.lebt()) return false;
      ctx.sage("Wie viele Ballone fliegen noch?");
      const { ok } = await ctx.frage({ lo: 0, hi: max, richtig: a - b, aufgabe: { a, op: "-", b } });
      if (!ctx.lebt()) return ok;
      const uebrig = [...ctx.svg.querySelectorAll(".rw-ballon:not(.ist-weg) ellipse:first-of-type")];
      await ctx.zaehle(uebrig.map((e) => ({ g: ctx.svg, x: Number(e.getAttribute("cx")), y: Number(e.getAttribute("cy")) - 64 })), 240);
      await ctx.sage(ok ? `Genau! ${a} minus ${b} sind ${a - b}.` : `Schau: ${a} minus ${b} sind ${a - b}.`);
      return ok;
    },
  });

  // ===========================================================================
  // Kiosk
  // ===========================================================================
  const WAREN = [{ e: "🍦", w: "eine Glace" }, { e: "🥕", w: "ein Rüebli" }, { e: "🍎", w: "einen Apfel" }, { e: "🥨", w: "eine Brezel" }, { e: "🧃", w: "einen Saft" }, { e: "🍌", w: "eine Banane" }];
  function muenze(A, wert, x, y, r = 34) {
    const farbe = wert === 5 ? "#c9d1df" : wert === 2 ? "#dfe3ea" : "#e8edf3";
    return `<g class="rw-muenze" data-wert="${wert}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${wert} Franken"><circle r="${r}" fill="${farbe}" stroke="#8b95a8" stroke-width="4"/><circle r="${r - 8}" fill="none" stroke="#a3abba" stroke-width="2"/><text y="${r * 0.32}" text-anchor="middle" font-size="${r * 0.9}" ${A.FONT} fill="#4a5568">${wert}</text></g>`;
  }
  R.spiel({
    id: "kiosk",
    titel: "Kiosk",
    help: "Kiosk. Ein Tier möchte etwas kaufen. Zahl genau so viele Franken, wie es kostet: Tippe die Münzen an, sie fallen in die Schale. Dann tippe auf «Bezahlen».",
    async aufgabe(ctx) {
      const A = ctx.art;
      const max = Math.min(10, ctx.deckel);
      const zwei = ctx.stufe !== "leicht";
      const werte = ctx.stufe === "schwer" ? [1, 2, 5] : zwei ? [1, 2] : [1];
      const t = ctx.ziehe(() => {
        const ware = ctx.mische(WAREN).slice(0, zwei ? 2 : 1);
        const preise = ware.map(() => ctx.rnd(1, zwei ? 5 : Math.min(5, max)));
        const summe = preise.reduce((x, y) => x + y, 0);
        return summe > max ? null : { ware, preise, summe, key: `${ware.map((w) => w.e).join("")}${preise.join("+")}` };
      });
      const { ware, preise, summe } = t;
      const tier = TIER_IDS[ctx.rnd(0, TIER_IDS.length - 1)];
      let bild = `<rect width="1000" height="560" fill="#fff1cf"/><rect x="0" y="380" width="1000" height="180" fill="${A.C.boden}"/>`;
      for (let k = 0; k < 9; k += 1) bild += `<rect x="${100 + k * 90}" y="40" width="90" height="50" fill="${k % 2 ? "#ffffff" : A.C.rot}"/>`;
      bild += `<rect x="100" y="230" width="810" height="160" rx="10" fill="${A.C.gelb}"/>`;
      ware.forEach((w, i) => {
        const x = 220 + i * 230;
        bild += `<text x="${x}" y="215" text-anchor="middle" font-size="90">${w.e}</text><g transform="translate(${x + 60} 140)"><rect x="-38" y="-22" width="76" height="40" rx="8" fill="#ffffff" stroke="${A.C.rot}" stroke-width="3"/><text y="10" text-anchor="middle" font-size="26" ${A.FONT} fill="${A.C.rot}">${preise[i]} Fr.</text></g>`;
      });
      bild += `${A.kopf(tier, 800, 170, 44)}`;
      bild += `<g class="rw-schale"><ellipse cx="500" cy="330" rx="150" ry="34" fill="#e8edf3" stroke="#8b95a8" stroke-width="4"/></g><g class="rw-drin"></g>`;
      werte.forEach((w, i) => { bild += muenze(A, w, 380 + i * 120, 470, w === 5 ? 44 : w === 2 ? 38 : 32); });
      bild += `<text class="rw-summe" x="500" y="300" text-anchor="middle" font-size="30" ${A.FONT} fill="${A.C.ink}"></text>`;
      ctx.zeichne(bild);
      const satzWare = ware.length === 1 ? `${ware[0].w} für ${preise[0]} ${preise[0] === 1 ? "Franken" : "Franken"}` : `${ware[0].w} für ${preise[0]} Franken. Und ${ware[1].w} für ${preise[1]} Franken`;
      await ctx.sage(`${NAMEN[tier]} möchte ${satzWare}. Bezahl genau!`);
      let bezahlt = [];
      const drin = ctx.q(".rw-drin");
      const summeText = ctx.q(".rw-summe");
      const zeichneSchale = () => {
        drin.innerHTML = bezahlt.map((w, i) => muenze(A, w, 400 + (i % 8) * 28, 322 - Math.floor(i / 8) * 14, 22).replace('class="rw-muenze"', 'class="rw-drin-muenze"')).join("");
        const s = bezahlt.reduce((x, y) => x + y, 0);
        summeText.textContent = s ? `${s} Fr.` : "";
        drin.querySelectorAll(".rw-drin-muenze").forEach((m, i) => m.addEventListener("click", () => { bezahlt.splice(i, 1); zeichneSchale(); }));
      };
      ctx.svg.querySelectorAll(".rw-muenze").forEach((m) => m.addEventListener("click", () => { if (bezahlt.length < 20) { bezahlt.push(Number(m.dataset.wert)); ctx.blip(bezahlt.length); zeichneSchale(); } }));
      await ctx.aktion({ text: "Bezahlen", icon: "haken" });
      if (!ctx.lebt()) return false;
      const gezahlt = bezahlt.reduce((x, y) => x + y, 0);
      const ok = gezahlt === summe;
      ctx.jingle(ok ? "correct" : "retry");
      if (ok) ctx.lauf.richtig += 1;
      if (preise.length === 2) ctx.stand.aufgabeGeuebt(ctx.stand.aufgabeKey(preise[0], "+", preise[1]), ok, Infinity);
      await ctx.sage(ok ? `Genau ${summe} Franken. Danke!` : gezahlt > summe ? `Das ist zu viel: ${gezahlt} Franken. Es kostet ${summe}.` : `Das ist zu wenig: ${gezahlt} Franken. Es kostet ${summe}.`);
      return ok;
    },
  });
})();
