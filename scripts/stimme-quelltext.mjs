/*
 * Die Zeichenketten eines Skripts – für die Liste der Sätze, die die App
 * sagt (scripts/stimme-app-texte.mjs).
 * ---------------------------------------------------------------------------
 * Ein kleiner Zerleger statt eines ganzen JavaScript-Parsers: Er kennt
 * Kommentare, Zeichenketten in "…" und '…', Vorlagen in `…` mit ${…} darin
 * (auch verschachtelt) und reguläre Ausdrücke – genug, um jede Zeichenkette
 * richtig herauszulösen. Eine Liste, die mit join(" ") zusammengefügt wird
 * (const HELP = ["…", "…"].join(" ")), kommt als ein Text heraus.
 *
 * Eine Vorlage liefert ihren Text mit LUECKE an der Stelle jedes ${…}; was
 * in ${…} steht, wird selbst wieder zerlegt (darin stehen oft weitere
 * Zeichenketten: ${n === 1 ? "Silbe" : "Silben"}).
 */
export const LUECKE = "\u0000";

const SCHLUSS = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", 0: "\0" };

function entschluessle(roh) {
  return roh.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r\n|[\s\S])/g, (_, z) => {
    if (z[0] === "u" && z[1] === "{") return String.fromCodePoint(parseInt(z.slice(2, -1), 16));
    if (z[0] === "u" && z.length === 5) return String.fromCharCode(parseInt(z.slice(1), 16));
    if (z[0] === "x" && z.length === 3) return String.fromCharCode(parseInt(z.slice(1), 16));
    if (z === "\n" || z === "\r\n") return "";
    return SCHLUSS[z] ?? z;
  });
}

// Vor einem / beginnt ein regulärer Ausdruck, wenn davor kein Wert steht.
const VOR_AUSDRUCK = new Set(["return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "instanceof", "yield", "await"]);

// [{ art: "text" | "vorlage" | "zeichen" | "wort", wert }]
export function zerlege(quelle) {
  const marken = [];
  let i = 0;
  const n = quelle.length;
  const letzte = () => marken[marken.length - 1];
  const regexErlaubt = () => {
    const m = letzte();
    if (!m) return true;
    if (m.art === "text" || m.art === "vorlage" || m.art === "zahl" || m.art === "regex") return false;
    if (m.art === "wort") return VOR_AUSDRUCK.has(m.wert);
    return !(m.wert === ")" || m.wert === "]" || m.wert === "}");
  };

  // Liest eine Vorlage ab dem `; gibt ihre Teile zurück und hängt die
  // Zeichenketten aus ihren ${…} an die Marken an.
  function vorlage() {
    i += 1;
    const teile = [];
    let roh = "";
    while (i < n) {
      const c = quelle[i];
      if (c === "\\") { roh += quelle.slice(i, i + 2); i += 2; continue; }
      if (c === "`") { i += 1; teile.push(entschluessle(roh)); return teile; }
      if (c === "$" && quelle[i + 1] === "{") {
        teile.push(entschluessle(roh));
        roh = "";
        i += 2;
        ausdruck("}");
        continue;
      }
      roh += c;
      i += 1;
    }
    teile.push(entschluessle(roh));
    return teile;
  }

  // Liest Code bis zur passenden schliessenden Klammer (oder bis zum Ende).
  function ausdruck(ende) {
    let tiefe = 0;
    while (i < n) {
      const c = quelle[i];
      if (c === "/" && quelle[i + 1] === "/") { while (i < n && quelle[i] !== "\n") i += 1; continue; }
      if (c === "/" && quelle[i + 1] === "*") { const e = quelle.indexOf("*/", i + 2); i = e < 0 ? n : e + 2; continue; }
      if (/\s/.test(c)) { i += 1; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < n && quelle[j] !== c && quelle[j] !== "\n") j += quelle[j] === "\\" ? 2 : 1;
        marken.push({ art: "text", wert: entschluessle(quelle.slice(i + 1, j)) });
        i = j + 1;
        continue;
      }
      if (c === "`") {
        const platz = marken.length;
        const teile = vorlage();
        marken.splice(platz, 0, { art: "vorlage", wert: teile.join(LUECKE) });
        continue;
      }
      if (c === "/" && regexErlaubt()) {
        let j = i + 1;
        let klasse = false;
        while (j < n && quelle[j] !== "\n") {
          if (quelle[j] === "\\") { j += 2; continue; }
          if (quelle[j] === "[") klasse = true;
          else if (quelle[j] === "]") klasse = false;
          else if (quelle[j] === "/" && !klasse) break;
          j += 1;
        }
        j += 1;
        while (j < n && /[a-z]/.test(quelle[j])) j += 1;
        marken.push({ art: "regex", wert: quelle.slice(i, j) });
        i = j;
        continue;
      }
      if (/[A-Za-z_$À-ɏ]/.test(c)) {
        let j = i + 1;
        while (j < n && /[\w$À-ɏ]/.test(quelle[j])) j += 1;
        marken.push({ art: "wort", wert: quelle.slice(i, j) });
        i = j;
        continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i + 1;
        while (j < n && /[\w.]/.test(quelle[j])) j += 1;
        marken.push({ art: "zahl", wert: quelle.slice(i, j) });
        i = j;
        continue;
      }
      if (c === "{" || c === "(" || c === "[") tiefe += 1;
      if (c === "}" || c === ")" || c === "]") {
        if (tiefe === 0 && c === ende) { i += 1; return; }
        tiefe -= 1;
      }
      marken.push({ art: "zeichen", wert: c });
      i += 1;
    }
  }

  ausdruck(null);
  return marken;
}

// Alle Zeichenketten eines Skripts: [{ wert, vorlage }]. Listen mit
// .join(" ") kommen zusammengefügt als ein Eintrag.
export function zeichenketten(quelle) {
  const marken = zerlege(quelle);
  const ergebnis = [];
  const istText = (m) => m && (m.art === "text" || m.art === "vorlage");
  for (let k = 0; k < marken.length; k += 1) {
    const m = marken[k];
    if (m.art === "zeichen" && m.wert === "[") {
      // [ "…", "…", ] .join(" ")
      const teile = [];
      let j = k + 1;
      while (istText(marken[j])) {
        teile.push(marken[j]);
        j += 1;
        if (marken[j]?.wert === ",") j += 1;
      }
      if (teile.length && marken[j]?.wert === "]" && marken[j + 1]?.wert === "." && marken[j + 2]?.wert === "join"
        && marken[j + 3]?.wert === "(" && marken[j + 4]?.art === "text" && marken[j + 5]?.wert === ")") {
        const fuge = marken[j + 4].wert;
        ergebnis.push({ wert: teile.map((t) => t.wert).join(fuge), vorlage: teile.some((t) => t.art === "vorlage") });
        k = j + 5;
        continue;
      }
    }
    if (istText(m)) ergebnis.push({ wert: m.wert, vorlage: m.art === "vorlage" });
  }
  return ergebnis;
}
