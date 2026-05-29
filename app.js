const DEFAULT_COLORS = {
  A: "#ef476f",
  B: "#118ab2",
  C: "#06d6a0",
  D: "#ffd166",
  E: "#8e44ad",
  F: "#f77f00",
  G: "#2ec4b6",
  H: "#ff9f1c",
  I: "#3a86ff",
  J: "#8338ec",
  1: "#ffd166",
  2: "#ef476f",
  3: "#7b9eb8",
  4: "#8fd694",
  5: "#f4a261",
};

const PUZZLES = {
  easy01: {
    title: "Rätsel 01 · Leicht · 5×5",
    description: "Kurzes Einsteiger-Rätsel mit drei gut sichtbaren Wegen.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [1, 0]],
      B: [[2, 0], [3, 3]],
      C: [[3, 2], [4, 4]],
    },
  },
  easy02: {
    title: "Rätsel 02 · Leicht · 5×5",
    description: "Übe eine lange Verbindung und zwei kürzere Wege.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [1, 3]],
      B: [[1, 2], [2, 2]],
      C: [[2, 3], [4, 4]],
    },
  },
  easy03: {
    title: "Rätsel 03 · Leicht · 5×5",
    description: "Drei übersichtliche Wege führen gemeinsam durch das ganze Feld.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 4]],
      B: [[1, 4], [2, 1]],
      C: [[2, 2], [4, 4]],
    },
  },
  easy04: {
    title: "Rätsel 04 · Leicht · 5×5",
    description: "Starte mit den oberen Symbolen und arbeite dich nach unten.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [1, 1]],
      B: [[1, 0], [3, 3]],
      C: [[3, 2], [4, 4]],
    },
  },
  easy05: {
    title: "Rätsel 05 · Leicht · 5×5",
    description: "Ein sanfter Einstieg mit vier Symbolpaaren.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 3]],
      B: [[0, 4], [1, 0]],
      C: [[2, 0], [3, 1]],
      D: [[3, 0], [4, 4]],
    },
  },
  easy06: {
    title: "Rätsel 06 · Leicht · 5×5",
    description: "Kurze und lange Wege wechseln sich ab.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 2]],
      B: [[0, 3], [1, 3]],
      C: [[1, 2], [2, 4]],
      D: [[3, 4], [4, 4]],
    },
  },
  easy07: {
    title: "Rätsel 07 · Leicht · 5×5",
    description: "Achte darauf, die mittleren Felder nicht zu früh zu blockieren.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 1]],
      B: [[0, 2], [1, 4]],
      C: [[1, 3], [3, 4]],
      D: [[3, 3], [4, 4]],
    },
  },
  easy08: {
    title: "Rätsel 08 · Leicht · 5×5",
    description: "Vier klare Verbindungen mit viel Platz zum Ziehen.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 4]],
      B: [[1, 4], [1, 0]],
      C: [[2, 0], [3, 3]],
      D: [[3, 2], [4, 4]],
    },
  },
  easy09: {
    title: "Rätsel 09 · Leicht · 5×5",
    description: "Beginne am besten mit den Paaren am oberen Rand.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 2]],
      B: [[0, 3], [1, 0]],
      C: [[2, 0], [2, 4]],
      D: [[3, 4], [4, 4]],
    },
  },
  easy10: {
    title: "Rätsel 10 · Leicht · 5×5",
    description: "Dieses Rätsel trainiert das Zurückziehen entlang des eigenen Wegs.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 1]],
      B: [[0, 2], [1, 2]],
      C: [[1, 1], [3, 2]],
      D: [[3, 1], [4, 4]],
    },
  },
  easy11: {
    title: "Rätsel 11 · Leicht · 5×5",
    description: "Fünf kurze Wege machen das Spielfeld schnell voll.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 1]],
      B: [[0, 2], [1, 4]],
      C: [[1, 3], [2, 0]],
      D: [[2, 1], [3, 3]],
      E: [[3, 2], [4, 4]],
    },
  },
};



const MEDIUM_PUZZLES = [
  { A: [[0, 0], [1, 1]], B: [[1, 0], [2, 5]], C: [[3, 5], [4, 4]], D: [[4, 5], [5, 3]], E: [[5, 2], [5, 0]] },
  { A: [[0, 0], [4, 0]], B: [[5, 0], [2, 2]], C: [[3, 2], [0, 3]], D: [[0, 4], [5, 5]], E: [[4, 5], [0, 5]] },
  { A: [[5, 0], [5, 5]], B: [[4, 5], [3, 4]], C: [[3, 5], [2, 4]], D: [[2, 3], [1, 4]], E: [[1, 5], [0, 0]] },
  { A: [[5, 0], [0, 0]], B: [[0, 1], [2, 1]], C: [[3, 1], [3, 2]], D: [[2, 2], [4, 4]], E: [[3, 4], [5, 5]] },
  { A: [[0, 5], [0, 1]], B: [[0, 0], [2, 4]], C: [[2, 3], [2, 0]], D: [[3, 0], [4, 5]], E: [[4, 4], [5, 5]] },
  { A: [[0, 5], [4, 4]], B: [[3, 4], [0, 4]], C: [[0, 3], [0, 2]], D: [[0, 1], [2, 1]], E: [[3, 1], [0, 0]] },
  { A: [[5, 5], [4, 1]], B: [[4, 2], [3, 4]], C: [[3, 3], [2, 2]], D: [[2, 3], [1, 1]], E: [[1, 0], [0, 5]] },
  { A: [[5, 5], [3, 4]], B: [[4, 4], [2, 2]], C: [[3, 2], [1, 1]], D: [[0, 1], [1, 0]], E: [[2, 0], [5, 0]] },
  { A: [[0, 0], [1, 5]], B: [[1, 4], [2, 1]], C: [[2, 2], [3, 5]], D: [[3, 4], [4, 1]], E: [[4, 2], [5, 0]] },
  { A: [[0, 0], [5, 1]], B: [[4, 1], [4, 2]], C: [[5, 2], [3, 3]], D: [[2, 3], [5, 4]], E: [[5, 5], [0, 5]] },
];

const HARD_PUZZLES = [
  { A: [[0, 0], [0, 5]], B: [[0, 6], [2, 3]], C: [[2, 4], [3, 6]], D: [[3, 5], [3, 3]], E: [[3, 2], [5, 5]], F: [[5, 4], [6, 2]], G: [[6, 3], [6, 6]] },
  { A: [[0, 0], [3, 0]], B: [[4, 0], [1, 1]], C: [[0, 1], [6, 2]], D: [[6, 3], [0, 4]], E: [[1, 4], [4, 4]], F: [[5, 4], [3, 5]], G: [[2, 5], [6, 6]] },
  { A: [[6, 0], [5, 2]], B: [[5, 1], [4, 2]], C: [[4, 3], [3, 4]], D: [[3, 3], [3, 0]], E: [[2, 0], [1, 5]], F: [[1, 4], [0, 3]], G: [[0, 4], [0, 6]] },
  { A: [[6, 0], [0, 1]], B: [[1, 1], [3, 1]], C: [[4, 1], [2, 2]], D: [[1, 2], [6, 3]], E: [[6, 4], [4, 5]], F: [[5, 5], [6, 6]], G: [[5, 6], [0, 6]] },
  { A: [[0, 6], [1, 2]], B: [[1, 3], [2, 2]], C: [[2, 1], [3, 0]], D: [[3, 1], [3, 5]], E: [[3, 6], [4, 0]], F: [[5, 0], [5, 4]], G: [[5, 5], [6, 0]] },
  { A: [[0, 6], [5, 5]], B: [[4, 5], [2, 4]], C: [[3, 4], [2, 3]], D: [[1, 3], [5, 2]], E: [[6, 2], [2, 1]], F: [[1, 1], [1, 0]], G: [[2, 0], [6, 0]] },
  { A: [[6, 6], [6, 1]], B: [[6, 0], [5, 6]], C: [[4, 6], [3, 1]], D: [[3, 2], [2, 4]], E: [[2, 3], [2, 0]], F: [[1, 0], [0, 3]], G: [[0, 2], [0, 0]] },
  { A: [[6, 6], [1, 6]], B: [[0, 6], [2, 5]], C: [[3, 5], [5, 5]], D: [[6, 5], [0, 3]], E: [[1, 3], [4, 2]], F: [[3, 2], [2, 1]], G: [[3, 1], [0, 0]] },
  { A: [[0, 0], [1, 4]], B: [[1, 3], [3, 6]], C: [[3, 5], [3, 1]], D: [[3, 0], [4, 3]], E: [[4, 4], [5, 5]], F: [[5, 4], [6, 2]], G: [[6, 3], [6, 6]] },
  { A: [[0, 0], [4, 0]], B: [[5, 0], [1, 2]], C: [[2, 2], [4, 2]], D: [[5, 2], [0, 3]], E: [[0, 4], [5, 5]], F: [[4, 5], [0, 6]], G: [[1, 6], [6, 6]] },
];

MEDIUM_PUZZLES.forEach((pairs, index) => {
  const number = String(index + 1).padStart(2, "0");
  PUZZLES[`medium${number}`] = {
    title: `Rätsel ${number} · Mittel · 6×6`,
    description: "Mittleres Rätsel mit mehr Feldern und fünf Symbolpaaren.",
    size: 6,
    difficulty: "medium",
    pairs,
  };
});

HARD_PUZZLES.forEach((pairs, index) => {
  const number = String(index + 1).padStart(2, "0");
  PUZZLES[`hard${number}`] = {
    title: `Rätsel ${number} · Schwer · 7×7`,
    description: "Schweres Rätsel mit langen Wegen und sieben Symbolpaaren.",
    size: 7,
    difficulty: "hard",
    pairs,
  };
});

const DIFFICULTY_INFO = {
  easy: { label: "Einfach", code: 1 },
  medium: { label: "Mittel", code: 2 },
  hard: { label: "Schwer", code: 3 },
};

Object.entries(PUZZLES).forEach(([key, puzzle]) => {
  const sameDifficultyKeys = Object.entries(PUZZLES)
    .filter(([, item]) => item.difficulty === puzzle.difficulty)
    .map(([itemKey]) => itemKey);
  const index = sameDifficultyKeys.indexOf(key) + 1;
  const difficulty = DIFFICULTY_INFO[puzzle.difficulty];
  puzzle.game = "arukone";
  puzzle.levelName = `A ${difficulty.code}-${index}`;
  puzzle.title = `${puzzle.levelName} · Arukone · ${difficulty.label}`;
});

const SUDOKU_LEVELS = [
  {
    givens: [[0, 3, 4], [1, 0, 4], [1, 4, 5], [2, 0, 2], [2, 2, 1], [2, 4, 3], [3, 1, 3], [3, 3, 5], [3, 5, 2], [4, 1, 4], [4, 5, 3], [5, 2, 3]],
    solution: [[3, 1, 5, 4, 2, 6], [4, 2, 6, 3, 5, 1], [2, 5, 1, 6, 3, 4], [6, 3, 4, 5, 1, 2], [5, 4, 2, 1, 6, 3], [1, 6, 3, 2, 4, 5]],
  },
  {
    givens: [[0, 0, 3], [0, 3, 1], [0, 5, 4], [1, 2, 4], [2, 1, 2], [3, 0, 5], [3, 1, 4], [3, 5, 3], [4, 2, 1], [4, 4, 2], [5, 3, 3]],
    solution: [[3, 5, 2, 1, 6, 4], [6, 1, 4, 5, 3, 2], [1, 2, 3, 4, 5, 6], [5, 4, 6, 2, 1, 3], [4, 3, 1, 6, 2, 5], [2, 6, 5, 3, 4, 1]],
  },
  {
    givens: [[0, 4, 3], [1, 0, 1], [1, 2, 4], [2, 0, 4], [2, 3, 6], [3, 1, 1], [4, 0, 3], [4, 2, 5], [4, 4, 4], [4, 5, 6]],
    solution: [[5, 6, 2, 4, 3, 1], [1, 3, 4, 2, 6, 5], [4, 5, 3, 6, 1, 2], [2, 1, 6, 3, 5, 4], [3, 2, 5, 1, 4, 6], [6, 4, 1, 5, 2, 3]],
  },
  {
    givens: [[0, 5, 4], [1, 3, 5], [1, 4, 2], [2, 0, 2], [3, 1, 5], [3, 3, 4], [3, 4, 3], [4, 2, 2], [4, 5, 3], [5, 1, 1], [5, 2, 6]],
    solution: [[1, 2, 5, 3, 6, 4], [4, 6, 3, 5, 2, 1], [2, 3, 4, 1, 5, 6], [6, 5, 1, 4, 3, 2], [5, 4, 2, 6, 1, 3], [3, 1, 6, 2, 4, 5]],
  },
  {
    givens: [[0, 3, 6], [0, 4, 1], [1, 3, 2], [1, 5, 3], [2, 4, 6], [3, 1, 4], [3, 3, 3], [4, 3, 4], [5, 0, 5], [5, 5, 6]],
    solution: [[4, 3, 2, 6, 1, 5], [1, 5, 6, 2, 4, 3], [2, 1, 3, 5, 6, 4], [6, 4, 5, 3, 2, 1], [3, 6, 1, 4, 5, 2], [5, 2, 4, 1, 3, 6]],
  },
  {
    givens: [[0, 0, 1], [0, 3, 2], [0, 5, 5], [2, 0, 5], [2, 2, 3], [3, 3, 6], [4, 0, 3], [4, 2, 1], [5, 1, 4], [5, 2, 6]],
    solution: [[1, 3, 4, 2, 6, 5], [6, 2, 5, 3, 1, 4], [5, 6, 3, 1, 4, 2], [4, 1, 2, 6, 5, 3], [3, 5, 1, 4, 2, 6], [2, 4, 6, 5, 3, 1]],
  },
  {
    givens: [[0, 2, 3], [0, 3, 1], [0, 5, 6], [2, 0, 5], [3, 1, 4], [3, 3, 5], [3, 4, 2], [5, 0, 2], [5, 2, 4], [5, 5, 3]],
    solution: [[4, 2, 3, 1, 5, 6], [1, 6, 5, 4, 3, 2], [5, 1, 2, 3, 6, 4], [3, 4, 6, 5, 2, 1], [6, 3, 1, 2, 4, 5], [2, 5, 4, 6, 1, 3]],
  },
  {
    givens: [[0, 0, 4], [1, 3, 1], [1, 4, 3], [2, 2, 6], [3, 1, 5], [3, 5, 3], [4, 2, 2], [4, 5, 5], [5, 3, 2], [5, 4, 6]],
    solution: [[4, 3, 1, 5, 2, 6], [6, 2, 5, 1, 3, 4], [3, 1, 6, 4, 5, 2], [2, 5, 4, 6, 1, 3], [1, 6, 2, 3, 4, 5], [5, 4, 3, 2, 6, 1]],
  },
  {
    givens: [[0, 3, 4], [0, 5, 6], [1, 1, 2], [1, 4, 1], [2, 3, 6], [3, 0, 1], [3, 4, 3], [4, 2, 2], [4, 4, 6], [5, 0, 3], [5, 2, 1]],
    solution: [[5, 1, 3, 4, 2, 6], [6, 2, 4, 3, 1, 5], [2, 3, 5, 6, 4, 1], [1, 4, 6, 5, 3, 2], [4, 5, 2, 1, 6, 3], [3, 6, 1, 2, 5, 4]],
  },
  {
    givens: [[0, 3, 6], [0, 4, 1], [1, 5, 4], [2, 0, 2], [2, 1, 6], [3, 0, 4], [3, 5, 3], [4, 2, 5], [5, 0, 1], [5, 1, 4], [5, 2, 6]],
    solution: [[5, 3, 4, 6, 1, 2], [6, 1, 2, 5, 3, 4], [2, 6, 3, 4, 5, 1], [4, 5, 1, 2, 6, 3], [3, 2, 5, 1, 4, 6], [1, 4, 6, 3, 2, 5]],
  },
].map((level, index) => ({
  ...level,
  game: "sudoku",
  size: 6,
  boxRows: 2,
  boxCols: 3,
  difficulty: "medium",
  levelName: `S 2-${index + 1}`,
  title: `S 2-${index + 1} · Sudoku · Mittel`,
  description: "Ein mittleres 6×6 Sudoku mit den Zahlen 1 bis 6.",
}));


const DIFFICULTIES = {
  easy: { label: "Leicht", code: 1 },
  medium: { label: "Mittel", code: 2 },
  hard: { label: "Schwer", code: 3 },
};

const GAME_CONFIGS = {
  arukone: {
    title: "Arukone", eyebrow: "Wege finden", code: "A",
    subtitle: "Verbinde gleiche Symbole. Die Wege dürfen sich nicht kreuzen.",
    success: "Toll verbunden! Alle Wege passen zusammen.",
    rules: ["Tippe oder ziehe von einem Symbol los.", "Verbinde nur gleiche Symbole miteinander.", "Wege laufen waagerecht oder senkrecht und füllen am Ende das Feld."],
  },
  sudoku: {
    title: "Sudoku", eyebrow: "Zahlen ordnen", code: "S",
    subtitle: "Fülle jede Reihe, Spalte und Box mit den passenden Zahlen.",
    success: "Prima gerechnet! Alle Zahlen stehen am richtigen Platz.",
    rules: ["Tippe auf ein leeres Feld.", "Wähle unten die passende Zahl aus.", "Jede Zahl darf in Reihe, Spalte und Box nur einmal vorkommen."],
  },
  nonogram: {
    title: "Bildrätsel", eyebrow: "Bild entdecken", code: "N",
    subtitle: "Fülle Felder aus und entdecke das versteckte Bild.",
    success: "Das Bild ist da! Super entdeckt.",
    rules: ["Die Zahlen zeigen gefüllte Felder in Reihe oder Spalte.", "Tippe: leer, gefüllt, X und wieder leer.", "X ist nur eine Hilfe für dich."],
  },
  bimaru: {
    title: "Meerestiere", eyebrow: "Im Wasser suchen", code: "B",
    subtitle: "Finde alle versteckten Meerestiere im Wasser.",
    success: "Alle Meerestiere sind gefunden!", 
    rules: ["Die Zahlen zeigen, wie viele Tierfelder in Reihe und Spalte sind.", "Tippe: leer, Tier, Wasser und wieder leer.", "Tiere berühren sich nicht, auch nicht an den Ecken."],
  },
  shikaku: {
    title: "Tiergehege", eyebrow: "Gehege bauen", code: "G",
    subtitle: "Baue für jedes Tier ein Gehege mit genau der richtigen Grösse.",
    success: "Alle Tiere haben ein passendes Gehege!",
    rules: ["Tippe zuerst auf eine Zahl.", "Tippe danach auf die zweite Ecke des Rechtecks.", "Das Rechteck muss genau so viele Felder haben wie die Zahl."],
  },
  thermometer: {
    title: "Zaubertrank", eyebrow: "Röhren füllen", code: "T",
    subtitle: "Fülle die Zaubertrank-Röhren genau richtig.",
    success: "Die Zaubertränke sind richtig gefüllt!",
    rules: ["Tippe auf eine Röhre, um sie bis dorthin zu füllen.", "Die Zahlen zeigen gefüllte Felder in Reihe und Spalte.", "Eine Röhre wird immer vom Anfang an gefüllt."],
  },
  patterns: {
    title: "Muster", eyebrow: "Zeichen erkennen", code: "M",
    subtitle: "Erkenne das Muster und wähle das richtige Zeichen.",
    success: "Du hast das Muster erkannt!",
    rules: ["Schau dir die Reihe genau an.", "Tippe unten auf das passende Zeichen.", "Bei zwei Lücken wählst du nacheinander die richtigen Zeichen."],
  },
  maze: {
    title: "Labyrinth", eyebrow: "Weg finden", code: "L",
    subtitle: "Finde den Weg zum Ziel und beachte die Regel.",
    success: "Du bist sicher am Ziel angekommen!",
    rules: ["Tippe immer auf ein Nachbarfeld.", "Wände kannst du nicht betreten.", "Sammle wichtige Dinge, bevor du zum Ziel gehst."],
  },
};

function clone(value) { return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function keyOf(row, col) { return `${row}-${col}`; }
function sameCell(a, b) { return a && b && a[0] === b[0] && a[1] === b[1]; }
function isNeighbor(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1; }
function zeros(rows, cols = rows, fill = 0) { return Array.from({ length: rows }, () => Array(cols).fill(fill)); }
function counts(grid) { return { rowCounts: grid.map((r) => r.reduce((a, b) => a + b, 0)), colCounts: grid[0].map((_, c) => grid.reduce((a, r) => a + r[c], 0)) }; }
function cluesFor(lines) { return lines.map((line) => { const out=[]; let n=0; line.forEach((v)=>{ if(v) n++; else if(n){out.push(n); n=0;} }); if(n) out.push(n); return out.length ? out : [0]; }); }
function gridFromStrings(lines, mark = "#") { return lines.map((line) => [...line].map((char) => char === mark ? 1 : 0)); }
function makeLevel(game, difficulty, index, data) {
  const config = GAME_CONFIGS[game];
  const diff = DIFFICULTIES[difficulty];
  return { ...data, id: `${game}-${difficulty}-${index}`, game, difficulty, levelName: `${config.code} ${diff.code}-${index}`, title: `${config.code} ${diff.code}-${index} · ${config.title} · ${diff.label}` };
}

// Bestehende Arukone- und Sudoku-Level in die neue Struktur übernehmen.
const ARUKONE_LEVELS = Object.entries(PUZZLES).map(([, level]) => {
  const number = level.levelName.split("-").at(-1);
  return { ...level, description: level.description, title: level.title.replace("Einfach", "Leicht") };
});
const SUDOKU_EASY = [
  { solution: [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]], givens: [[0,0,1],[0,3,4],[1,1,4],[2,2,4],[3,0,4],[3,3,1]] },
  { solution: [[2,1,4,3],[4,3,2,1],[1,2,3,4],[3,4,1,2]], givens: [[0,0,2],[0,2,4],[1,1,3],[2,2,3],[3,1,4],[3,3,2]] },
  { solution: [[3,4,1,2],[1,2,3,4],[4,3,2,1],[2,1,4,3]], givens: [[0,1,4],[0,3,2],[1,0,1],[2,2,2],[3,0,2],[3,3,3]] },
].map((l, i) => makeLevel("sudoku", "easy", i + 1, { ...l, size: 4, boxRows: 2, boxCols: 2, description: "Ein leichtes 4×4 Sudoku mit den Zahlen 1 bis 4." }));
const SUDOKU_MEDIUM = SUDOKU_LEVELS.map((l, i) => makeLevel("sudoku", "medium", i + 1, { ...l, description: "Ein mittleres 6×6 Sudoku mit den Zahlen 1 bis 6." }));
const SUDOKU_HARD = SUDOKU_LEVELS.slice(0, 5).map((l, i) => makeLevel("sudoku", "hard", i + 1, { ...l, givens: l.givens.filter((_, n) => n % 2 === 0), description: "Ein schweres 6×6 Sudoku mit weniger Startzahlen." }));

const NONOGRAM_LEVELS = [
  ["easy", ["01010","11111","11111","01110","00100"], "Herz"],
  ["easy", ["00100","01110","11111","01110","01010"], "Stern"],
  ["easy", ["00100","01110","11111","01010","01010"], "Haus"],
  ["medium", ["001100","011110","110011","111111","011110","001100"], "Fisch"],
  ["medium", ["011110","010010","111111","100001","111111","100001"], "Roboter"],
  ["medium", ["001100","011110","111111","101101","001100","011110"], "Käfer"],
  ["hard", ["00011000","00111100","01111110","11111111","11011011","00011000","00100100","01000010"], "Schmetterling"],
  ["hard", ["00111100","01111110","11011011","11111111","01111110","00111100","00011000","00111100"], "Eule"],
  ["hard", ["00011000","00111100","01111110","11111111","00111100","00111100","01111110","01000010"], "Rakete"],
].map(([difficulty, lines, title], i) => makeLevel("nonogram", difficulty, (i % 3) + 1, { size: lines.length, solution: gridFromStrings(lines, "1"), description: `Bildrätsel: ${title}.` }));
function sea(lines, fleet) { const solution = gridFromStrings(lines, "1"); return { solution, ...counts(solution), fleet, size: solution.length }; }
const BIMARU_LEVELS = [
  ["easy", sea(["10001","00000","01100","00000","10010"], {1:3,2:2})],
  ["easy", sea(["01000","00011","00000","10000","00110"], {1:2,2:2})],
  ["easy", sea(["00100","00000","11000","00001","01100"], {1:2,2:2})],
  ["medium", sea(["100001","000000","011100","000000","110010","000010"], {1:2,2:1,3:1})],
  ["medium", sea(["011000","000001","100000","000110","000000","111000"], {1:2,2:2,3:1})],
  ["medium", sea(["100100","000100","011000","000000","100011","000000"], {1:2,2:2,3:1})],
  ["hard", sea(["10000001","00011000","00000000","11100010","00000010","01000010","01000100","00000100"], {1:3,2:2,3:2})],
  ["hard", sea(["01100000","00000100","10000100","00000100","00000000","11100001","00000000","00111000"], {1:2,2:1,3:3})],
  ["hard", sea(["10001000","00001000","01100001","00000000","00111000","00000010","11000010","00000010"], {1:2,2:2,3:2})],
].map(([difficulty, data], i) => makeLevel("bimaru", difficulty, (i % 3) + 1, { ...data, description: "Finde die Tierfelder im Wasser." }));
function rectRegions(size, rects) { const g=zeros(size,size,""); rects.forEach((r, idx)=>{ for(let y=r[0]; y<=r[2]; y++) for(let x=r[1]; x<=r[3]; x++) g[y][x]=String(idx+1); }); return g; }
function cluesFromRegions(regions) { const seen={}; regions.forEach((row,r)=>row.forEach((id,c)=>{ if(!seen[id]) seen[id]={id,row:r,col:c,value:0}; seen[id].value++; })); return Object.values(seen).map(({row,col,value})=>({row,col,value})); }
const SHIKAKU_RECTS = {
  easy: [ [[0,0,0,1],[0,2,1,3],[1,0,3,0],[2,1,3,3]], [[0,0,1,1],[0,2,0,3],[1,2,3,2],[1,3,3,3],[2,0,3,1]], [[0,0,2,0],[0,1,1,2],[0,3,3,3],[2,1,3,2]] ],
  medium: [ [[0,0,1,1],[0,2,2,2],[0,3,1,4],[2,0,4,0],[2,1,4,2],[2,3,4,4]], [[0,0,0,4],[1,0,2,1],[1,2,3,2],[1,3,2,4],[3,0,4,1],[4,2,4,4]], [[0,0,2,0],[0,1,1,2],[0,3,0,4],[1,3,4,3],[1,4,4,4],[2,1,4,2]] ],
  hard: [ [[0,0,1,2],[0,3,2,3],[0,4,0,6],[1,4,3,4],[1,5,3,6],[2,0,4,0],[2,1,4,2],[3,3,6,3],[4,4,6,6],[5,0,6,2]], [[0,0,0,6],[1,0,2,1],[1,2,3,2],[1,3,3,4],[1,5,3,6],[3,0,6,0],[3,1,4,1],[4,2,6,4],[4,5,6,6]], [[0,0,2,0],[0,1,0,3],[0,4,1,6],[1,1,3,2],[1,3,4,3],[2,4,4,6],[3,0,6,0],[4,1,6,2],[5,3,6,6]] ]
};
const SHIKAKU_LEVELS = Object.entries(SHIKAKU_RECTS).flatMap(([difficulty, list]) => list.map((rects, i) => { const regions=rectRegions(difficulty === "hard" ? 7 : difficulty === "medium" ? 5 : 4, rects); return makeLevel("shikaku", difficulty, i+1, { size: regions.length, solutionRegions: regions, clues: cluesFromRegions(regions), description: "Baue Rechtecke um die Zahlen." }); }));
function thermo(size, thermometers, fillLengths) { const solution=zeros(size); thermometers.forEach((path,i)=>path.slice(0,fillLengths[i]).forEach(([r,c])=>solution[r][c]=1)); return { size, thermometers, fillLengths, solutionFilled: solution, ...counts(solution) }; }
const THERMOMETER_LEVELS = [
  ["easy", thermo(4, [[[0,0],[1,0]],[[0,1],[0,2],[0,3]],[[1,1],[2,1],[3,1]],[[2,2],[2,3],[3,3]]], [1,2,3,2])],
  ["easy", thermo(4, [[[0,0],[0,1]],[[1,0],[2,0],[3,0]],[[1,1],[1,2],[1,3]],[[2,2],[3,2],[3,3]]], [2,1,3,1])],
  ["easy", thermo(4, [[[0,3],[0,2],[0,1]],[[0,0],[1,0],[2,0]],[[1,1],[2,1],[3,1]],[[2,2],[2,3],[3,3]]], [2,2,1,3])],
  ["medium", thermo(6, [[[0,0],[0,1],[1,1]],[[0,2],[1,2],[2,2]],[[0,3],[0,4],[0,5]],[[1,0],[2,0],[3,0]],[[2,3],[3,3],[4,3]],[[3,1],[4,1],[5,1]],[[4,4],[5,4],[5,5]]], [2,3,1,2,2,3,2])],
  ["medium", thermo(6, [[[0,5],[1,5],[2,5]],[[0,0],[1,0],[1,1]],[[0,2],[0,3],[1,3]],[[2,0],[3,0],[4,0]],[[2,2],[3,2],[3,3]],[[4,2],[5,2],[5,3]],[[4,4],[4,5],[5,5]]], [1,3,2,1,3,2,2])],
  ["medium", thermo(6, [[[0,0],[0,1],[0,2]],[[1,0],[2,0],[2,1]],[[0,3],[1,3],[2,3]],[[0,5],[1,5],[2,5]],[[3,0],[4,0],[5,0]],[[3,2],[4,2],[5,2]],[[3,4],[4,4],[5,4],[5,5]]], [3,2,1,3,2,2,3])],
  ["hard", thermo(8, [[[0,0],[0,1],[1,1],[2,1]],[[0,2],[0,3],[1,3],[2,3]],[[0,4],[1,4],[1,5],[1,6]],[[0,7],[1,7],[2,7],[3,7]],[[3,0],[4,0],[4,1],[5,1]],[[3,2],[4,2],[5,2],[6,2]],[[3,4],[4,4],[4,5],[5,5]],[[5,6],[6,6],[7,6],[7,7]],[[6,0],[7,0],[7,1],[7,2]]], [3,2,4,1,3,4,2,3,2])],
  ["hard", thermo(8, [[[0,0],[1,0],[2,0],[2,1]],[[0,1],[0,2],[1,2],[2,2]],[[0,4],[0,5],[0,6],[0,7]],[[1,4],[2,4],[3,4],[3,5]],[[3,0],[4,0],[5,0],[6,0]],[[4,2],[4,3],[5,3],[6,3]],[[5,5],[6,5],[6,6],[7,6]],[[7,0],[7,1],[7,2],[7,3]]], [2,3,2,3,1,4,2,3])],
  ["hard", thermo(8, [[[0,7],[1,7],[1,6],[2,6]],[[0,0],[0,1],[0,2],[1,2]],[[1,0],[2,0],[3,0],[3,1]],[[2,2],[2,3],[3,3],[4,3]],[[0,4],[1,4],[2,4],[3,4]],[[4,0],[5,0],[6,0],[7,0]],[[5,2],[6,2],[7,2],[7,3]],[[4,5],[5,5],[6,5],[7,5]],[[5,7],[6,7],[7,7]]], [4,2,3,2,4,2,3,1,3])],
].map(([difficulty, data], i) => makeLevel("thermometer", difficulty, (i % 3) + 1, { ...data, description: "Fülle die Röhren passend zu den Zahlen." }));
const PATTERN_LEVELS = [
  ["easy", ["🔴","🔵","🔴","🔵",null], ["🔴","🔵","🟢"], ["🔴"], "Rot und Blau wechseln sich ab."],
  ["easy", ["⭐","⭐","🌙","⭐","⭐",null], ["⭐","🌙","☀️"], ["🌙"], "Zwei Sterne, ein Mond."],
  ["easy", ["🟧","🟩","🟧","🟩",null], ["🟧","🟩","🟦"], ["🟧"], "Orange, Grün, Orange, Grün."],
  ["easy", ["🐶","🐱","🐶","🐱",null], ["🐶","🐱","🐰"], ["🐶"], "Hund und Katze wechseln."],
  ["easy", ["🍎","🍎","🍌","🍎","🍎",null], ["🍎","🍌","🍐"], ["🍌"], "Zwei Äpfel, eine Banane."],
  ["medium", ["🔴","🔵","🟢","🔴","🔵",null], ["🔴","🔵","🟢"], ["🟢"], "Drei Farben wiederholen sich."],
  ["medium", ["▲","▲","●","●","▲","▲",null], ["▲","●","■"], ["●"], "Zwei Dreiecke, zwei Kreise."],
  ["medium", ["🟥","🔵","🟨","🟥","🔵",null], ["🟥","🔵","🟨"], ["🟨"], "Rot, Blau, Gelb."],
  ["medium", ["🐟","🐟","🐙","🐟","🐟",null], ["🐟","🐙","🦀"], ["🐙"], "Zwei Fische, ein Oktopus."],
  ["medium", ["🌼","🌷","🌻","🌼",null,"🌻"], ["🌼","🌷","🌻"], ["🌷"], "Blumen kommen in der gleichen Reihenfolge."],
  ["hard", ["1","2","3","1",null,"3","1",null], ["1","2","3"], ["2","2"], "Die Zahlen laufen 1, 2, 3."],
  ["hard", ["🔺","🔵","🟨","🔺",null,"🟨","🔺",null], ["🔺","🔵","🟨"], ["🔵","🔵"], "Formen wiederholen sich in Dreierschritten."],
  ["hard", ["🐸","🐸","🦊","🐼","🐸","🐸",null,"🐼"], ["🐸","🦊","🐼"], ["🦊"], "Zwei Frösche, Fuchs, Panda."],
  ["hard", ["☀️","🌧️","🌈","☀️",null,"🌈","☀️",null], ["☀️","🌧️","🌈"], ["🌧️","🌧️"], "Wetterzeichen wiederholen sich."],
  ["hard", ["A","B","B","C","A",null,"B","C"], ["A","B","C"], ["B"], "Nach A kommen zwei B und dann C."],
].map(([difficulty, sequence, options, answers, hint], i) => makeLevel("patterns", difficulty, (i % 5) + 1, { sequence: sequence.map((v)=> v === null ? null : { text: v }), missingIndices: sequence.map((v,idx)=>v===null?idx:null).filter(v=>v!==null), options: options.map((text)=>({text})), answers: answers.map((text)=>({text})), hint, description: "Wähle das Zeichen, das in die Lücke passt." }));
function maze(size, start, goal, walls, solutionPath, extra={}) { return { size, start, goal, walls, solutionPath, ...extra }; }
const MAZE_LEVELS = [
  ["easy", maze(5,[0,0],[4,4],[[1,1],[1,2],[3,1],[3,3]],[[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,4],[3,4],[4,4]], {ruleText:"Finde den Weg zum Ziel."})],
  ["easy", maze(5,[4,0],[0,4],[[1,1],[2,1],[2,3],[3,3]],[[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,4]], {ruleText:"Gehe um die Mauern herum."})],
  ["easy", maze(5,[2,0],[2,4],[[1,2],[2,2],[3,2]],[[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,4]], {ruleText:"Der Weg macht einen kleinen Bogen."})],
  ["medium", maze(6,[0,0],[5,5],[[1,1],[1,2],[2,4],[3,1],[4,3]],[[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,4],[4,4],[5,4],[5,5]], {keys:[[3,3]], ruleText:"Sammle zuerst den Schlüssel 🔑."})],
  ["medium", maze(6,[5,0],[0,5],[[4,1],[3,1],[2,2],[1,3],[4,4]],[[5,0],[5,1],[5,2],[4,2],[3,2],[3,3],[3,4],[2,4],[1,4],[0,4],[0,5]], {keys:[[3,3]], ruleText:"Nimm den Schlüssel mit."})],
  ["medium", maze(6,[0,5],[5,0],[[1,4],[2,4],[3,2],[4,2],[1,1]],[[0,5],[0,4],[0,3],[1,3],[2,3],[2,2],[2,1],[3,1],[4,1],[5,1],[5,0]], {keys:[[2,2]], ruleText:"Erst Schlüssel, dann Ziel."})],
  ["hard", maze(8,[0,0],[7,7],[[1,1],[1,2],[2,5],[3,1],[3,3],[4,5],[5,2],[6,4]],[[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,4],[3,4],[4,4],[5,4],[5,5],[6,5],[7,5],[7,6],[7,7]], {keys:[[2,4],[5,5]], ruleText:"Sammle beide Schlüssel."})],
  ["hard", maze(8,[7,0],[0,7],[[6,1],[5,1],[4,3],[3,3],[2,5],[1,5],[6,5],[2,1]],[[7,0],[7,1],[7,2],[6,2],[5,2],[5,3],[5,4],[4,4],[3,4],[2,4],[1,4],[0,4],[0,5],[0,6],[0,7]], {keys:[[5,4],[2,4]], ruleText:"Sammle die Schlüssel auf deinem Weg."})],
  ["hard", maze(8,[0,7],[7,0],[[1,6],[2,6],[3,4],[4,4],[5,2],[6,2],[2,2],[5,6]],[[0,7],[0,6],[0,5],[1,5],[2,5],[3,5],[4,5],[4,6],[4,7],[5,7],[6,7],[7,7],[7,6],[7,5],[7,4],[7,3],[7,2],[7,1],[7,0]], {keys:[[3,5],[7,3]], ruleText:"Nicht durch Mauern: sammle die Schlüssel."})],
].map(([difficulty, data], i) => makeLevel("maze", difficulty, (i % 3) + 1, { ...data, description: data.ruleText }));

const LEVELS_BY_GAME = {
  arukone: ARUKONE_LEVELS,
  sudoku: [...SUDOKU_EASY, ...SUDOKU_MEDIUM, ...SUDOKU_HARD],
  nonogram: NONOGRAM_LEVELS,
  bimaru: BIMARU_LEVELS,
  shikaku: SHIKAKU_LEVELS,
  thermometer: THERMOMETER_LEVELS,
  patterns: PATTERN_LEVELS,
  maze: MAZE_LEVELS,
};

const board = document.querySelector("#board");
const numberPad = document.querySelector("#number-pad");
const homePanel = document.querySelector("#home-panel");
const levelPanel = document.querySelector("#level-panel");
const levelHeading = document.querySelector("#level-heading");
const levelDescription = document.querySelector("#level-description");
const levelGrid = document.querySelector("#level-grid");
const rulesList = document.querySelector("#rules-list");
const gameHelpList = document.querySelector("#game-help-list");
const puzzleTitle = document.querySelector("#puzzle-title");
const puzzleDescription = document.querySelector("#puzzle-description");
const statusText = document.querySelector("#status");
const undoButton = document.querySelector("#undo-button");
const resetButton = document.querySelector("#reset-button");
const backButton = document.querySelector("#back-button");
let successOverlay = document.querySelector("#success-overlay");
let successRestartButton = document.querySelector("#success-restart-button");
let nextPuzzleButton = document.querySelector("#next-puzzle-button");
const gamePanel = document.querySelector("#game-panel");
const gameControls = document.querySelector("#game-controls");

let currentGame = document.body.dataset.gamePage || null;
let currentIndex = -1;
let state = {};
let history = [];
let winShown = false;
let isDrawing = false;
let lastDrawnKey = null;
let activePointerId = null;
let activeMoveSnapshot = null;
let pushedActiveSnapshot = false;

function progressKey(game, levelId) { return `lernapp.solved.${game}.${levelId}`; }
function isSolved(level) { return localStorage.getItem(progressKey(level.game, level.id || level.levelName)) === "1"; }
function markSolved(level) { localStorage.setItem(progressKey(level.game, level.id || level.levelName), "1"); }
function currentLevel() { return LEVELS_BY_GAME[currentGame][currentIndex]; }
function setStatus(message) { if (statusText) statusText.textContent = message || ""; }
function fillList(element, items) { if (!element) return; element.innerHTML = ""; items.forEach((text) => { const li = document.createElement("li"); li.textContent = text; element.append(li); }); }
function snapshot() { return { state: clone(state), winShown }; }
function restore(snap) { state = clone(snap.state); winShown = snap.winShown; hideSuccess(); render(); }
function pushHistory() { if (activeMoveSnapshot) { if (!pushedActiveSnapshot) { history.push(activeMoveSnapshot); pushedActiveSnapshot = true; } } else history.push(snapshot()); if (undoButton) undoButton.disabled = false; }
function beginMove() { activeMoveSnapshot = snapshot(); pushedActiveSnapshot = false; }
function finishMove() { activeMoveSnapshot = null; pushedActiveSnapshot = false; }

function renderLevelSelect() {
  if (!currentGame || !levelPanel) return;
  const config = GAME_CONFIGS[currentGame];
  levelHeading.textContent = `${config.title} Levels`;
  levelDescription.textContent = `${config.subtitle} Wähle Leicht, Mittel oder Schwer.`;
  fillList(rulesList, config.rules);
  levelGrid.innerHTML = "";
  ["easy","medium","hard"].forEach((difficulty) => {
    const group = document.createElement("div"); group.className = "difficulty-group";
    const h = document.createElement("h3"); h.textContent = DIFFICULTIES[difficulty].label; group.append(h);
    const wrap = document.createElement("div"); wrap.className = "difficulty-levels";
    LEVELS_BY_GAME[currentGame].filter((l)=>l.difficulty===difficulty).forEach((level) => {
      const index = LEVELS_BY_GAME[currentGame].indexOf(level);
      const button = document.createElement("button");
      button.className = `level-tile ${difficulty}${isSolved(level) ? " solved" : ""}`;
      button.type = "button";
      button.setAttribute("aria-label", `${level.title}${isSolved(level) ? ", gelöst" : ""}`);
      button.innerHTML = `<span>${level.levelName}</span><small>${isSolved(level) ? "★ gelöst" : (level.size ? `${level.size}×${level.size}` : "Rätsel")}</small>`;
      button.addEventListener("click", () => startLevel(index));
      wrap.append(button);
    });
    group.append(wrap); levelGrid.append(group);
  });
}
function showLevelSelect() { finishMove(); hideSuccess(); if (levelPanel) levelPanel.hidden = false; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = true; if (gameControls) gameControls.hidden = true; document.body.classList.remove("puzzle-active"); renderLevelSelect(); }
function showGame() { if (levelPanel) levelPanel.hidden = true; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = false; if (gameControls) gameControls.hidden = false; document.body.classList.add("puzzle-active"); }
function startLevel(index) { hideSuccess(); currentIndex = index; const level = currentLevel(); const config = GAME_CONFIGS[currentGame]; history = []; winShown = false; if (undoButton) undoButton.disabled = true; board.className = `board ${currentGame}-board`; board.style.setProperty("--size", level.size || 5); board.setAttribute("aria-label", `${config.title} Spielfeld`); puzzleTitle.textContent = level.title; puzzleDescription.textContent = level.description || config.subtitle; fillList(gameHelpList, config.rules); resetState(); showGame(); render(); }
function resetGame() { history = []; if (undoButton) undoButton.disabled = true; hideSuccess(); resetState(); render("Neu gestartet. Viel Spass!"); }
function undo() { finishMove(); if (!history.length) return; restore(history.pop()); if (undoButton) undoButton.disabled = history.length === 0; setStatus("Ein Schritt zurück."); }
function nextLevel() { const levels = LEVELS_BY_GAME[currentGame]; startLevel((currentIndex + 1) % levels.length); }
function showSuccess() { const level = currentLevel(); winShown = true; markSolved(level); if (successOverlay) { successOverlay.hidden = false; successOverlay.classList.remove("hidden"); } setStatus("Geschafft!"); }
function hideSuccess() { winShown = false; if (successOverlay) { successOverlay.hidden = true; successOverlay.classList.add("hidden"); } }

function setupSuccessOverlay() {
  if (!currentGame) return;
  const existingOverlay = document.querySelector("#success-overlay");
  if (existingOverlay) existingOverlay.remove();

  const shell = document.querySelector(".app-shell") || document.body;
  const overlay = document.createElement("section");
  overlay.id = "success-overlay";
  overlay.className = "success-overlay hidden";
  overlay.setAttribute("aria-labelledby", "success-title");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("role", "dialog");
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="success-modal">
      <div class="fireworks" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <h2 id="success-title">Geschafft!</h2>
      <div class="success-actions" aria-label="Level-Aktionen">
        <button id="success-restart-button" class="success-icon-button" type="button" aria-label="Level neu starten" title="Level neu starten">↻</button>
        <button id="next-puzzle-button" class="success-icon-button primary" type="button" aria-label="Nächstes Level" title="Nächstes Level">→</button>
      </div>
    </div>`;
  shell.append(overlay);

  successOverlay = overlay;
  successRestartButton = overlay.querySelector("#success-restart-button");
  nextPuzzleButton = overlay.querySelector("#next-puzzle-button");
  successRestartButton.addEventListener("click", resetGame);
  nextPuzzleButton.addEventListener("click", nextLevel);
}
function handleWin() { if (!winShown) showSuccess(); render(); }
function checkAndWin() { if (GAME_HANDLERS[currentGame].checkWin()) handleWin(); }
function resetState() { GAME_HANDLERS[currentGame].resetState(currentLevel()); }
function render(message) { numberPad.hidden = true; GAME_HANDLERS[currentGame].render(currentLevel()); if (message) setStatus(message); }

function makeButtonCell(row, col, className, text = "") { const b=document.createElement("button"); b.type="button"; b.className=className; b.dataset.row=row; b.dataset.col=col; b.textContent=text; return b; }
function getPairColor(pair) { return DEFAULT_COLORS[pair] || "#6c5ce7"; }

const GAME_HANDLERS = {
  arukone: {
    resetState(level) { state = { paths: Object.fromEntries(Object.entries(level.pairs).map(([p, ends]) => [p, [ends[0]]])), activePair: null }; setStatus("Ziehe von einem Symbol zum passenden zweiten Symbol."); },
    checkWin() { const level=currentLevel(); const filled=new Set(); const done=Object.keys(level.pairs).every((p)=>this.isCompleted(p)); Object.values(state.paths).forEach((path)=>path.forEach((pt)=>filled.add(keyOf(...pt)))); return done && filled.size === level.size * level.size; },
    isCompleted(pair) { const ends=currentLevel().pairs[pair], path=state.paths[pair]; return path.length>1 && ((sameCell(path[0],ends[0])&&sameCell(path.at(-1),ends[1]))||(sameCell(path[0],ends[1])&&sameCell(path.at(-1),ends[0]))); },
    endpointAt(r,c) { return Object.entries(currentLevel().pairs).find(([,ends])=>ends.some((pt)=>sameCell(pt,[r,c])))?.[0] || null; },
    ownerAt(r,c) { const k=keyOf(r,c); return Object.entries(state.paths).find(([,path])=>path.some((pt)=>keyOf(...pt)===k))?.[0] || null; },
    canUse(pair,r,c) { const endpoint=this.endpointAt(r,c), owner=this.ownerAt(r,c), ends=currentLevel().pairs[pair]; if(endpoint && endpoint!==pair) return false; if(owner && owner!==pair) return false; return !endpoint || sameCell(ends[0],[r,c]) || sameCell(ends[1],[r,c]); },
    input(r,c) { if (this.checkWin()) return; const endpoint=this.endpointAt(r,c); if(endpoint && (!state.activePair || endpoint!==state.activePair || this.isCompleted(state.activePair))) { pushHistory(); state.activePair=endpoint; state.paths[endpoint]=[[r,c]]; render(`Weg ${endpoint} gestartet.`); return; } if(!state.activePair) { render("Bitte zuerst ein Symbol auswählen."); return; } if(this.isCompleted(state.activePair)) { render("Dieser Weg ist fertig. Wähle ein anderes Symbol."); return; } const path=state.paths[state.activePair], last=path.at(-1); if(!isNeighbor(last,[r,c])) { render("Ziehe nur auf ein Nachbarfeld."); return; } const existing=path.findIndex((pt)=>sameCell(pt,[r,c])); if(existing>=0) { pushHistory(); state.paths[state.activePair]=path.slice(0,existing+1); render("Ein Stück zurückgegangen."); return; } if(!this.canUse(state.activePair,r,c)) { render("Dieses Feld gehört schon zu einem anderen Weg."); return; } pushHistory(); state.paths[state.activePair]=[...path,[r,c]]; if(this.isCompleted(state.activePair)) state.activePair=null; this.checkWin()?handleWin():render("Gut! Weiter zum passenden Symbol."); },
    hint() { const open=Object.keys(currentLevel().pairs).find((p)=>!this.isCompleted(p)); setStatus(open ? `Tipp: Schau dir das Paar ${open} an. Es braucht noch einen Weg.` : "Alle Paare sind verbunden."); },
    render(level) { board.innerHTML=""; board.style.setProperty("--size", level.size); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const endpoint=this.endpointAt(r,c), owner=this.ownerAt(r,c); const cell=makeButtonCell(r,c,`cell arukone-cell${endpoint?" endpoint":""}${owner?" filled":""}${state.activePair&&owner===state.activePair?" active":""}`, endpoint || ""); const pair=endpoint||owner; if(pair) cell.style.setProperty("--pair-color", getPairColor(pair)); cell.addEventListener("keydown",(event)=>{ if(event.key==="Enter"||event.key===" ") { event.preventDefault(); this.input(r,c); } }); board.append(cell); } },
  },
  sudoku: {
    resetState(level) { state={ values: zeros(level.size, level.size, null), fixed: {}, selected: null }; level.givens.forEach(([r,c,v])=>{state.values[r][c]=v; state.fixed[keyOf(r,c)]=true;}); setStatus("Tippe auf ein leeres Feld."); },
    checkWin() { const level=currentLevel(); return state.values.every((row,r)=>row.every((v,c)=>v===level.solution[r][c])); },
    conflict(r,c,v) { if(!v) return false; const level=currentLevel(); const br=Math.floor(r/level.boxRows)*level.boxRows, bc=Math.floor(c/level.boxCols)*level.boxCols; for(let i=0;i<level.size;i++){ if(i!==c&&state.values[r][i]===v) return true; if(i!==r&&state.values[i][c]===v) return true; } for(let y=br;y<br+level.boxRows;y++) for(let x=bc;x<bc+level.boxCols;x++) if((y!==r||x!==c)&&state.values[y][x]===v) return true; return false; },
    select(r,c) { if(state.fixed[keyOf(r,c)]) { state.selected=null; render("Diese Startzahl bleibt stehen."); return; } state.selected=[r,c]; render("Wähle eine Zahl aus."); this.renderPad(); },
    setNumber(v) { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=v; state.selected=null; this.checkWin()?handleWin():render(this.conflict(r,c,v)?"Fast! Diese Zahl kommt hier doppelt vor.":"Gut gemacht, weiter so!"); },
    clear() { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=null; state.selected=null; render("Die Zahl ist weg."); },
    hint() { const level=currentLevel(); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++) if(!state.fixed[keyOf(r,c)] && state.values[r][c]!==level.solution[r][c]) { pushHistory(); state.values[r][c]=level.solution[r][c]; render("Tipp: Ich habe ein sicheres Feld eingesetzt."); checkAndWin(); return; } },
    renderPad() { const level=currentLevel(); numberPad.innerHTML=""; numberPad.hidden=false; numberPad.style.setProperty("--pad-cols", Math.min(level.size, 3)); for(let n=1;n<=level.size;n++){ const b=document.createElement("button"); b.type="button"; b.textContent=n; b.addEventListener("click",()=>this.setNumber(n)); numberPad.append(b); } const clear=document.createElement("button"); clear.type="button"; clear.className="clear-number-button"; clear.textContent="Löschen"; clear.addEventListener("click",()=>this.clear()); numberPad.append(clear); },
    render(level) { board.innerHTML=""; board.style.setProperty("--size", level.size); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const v=state.values[r][c], fixed=state.fixed[keyOf(r,c)], selected=state.selected&&sameCell(state.selected,[r,c]); const edgeR=(c+1)%level.boxCols===0&&c<level.size-1, edgeB=(r+1)%level.boxRows===0&&r<level.size-1; const cell=makeButtonCell(r,c,`cell sudoku-cell${fixed?" given":""}${selected?" selected":""}${this.conflict(r,c,v)?" conflict":""}${edgeR?" box-edge-right":""}${edgeB?" box-edge-bottom":""}`, v || ""); cell.addEventListener("click",()=>this.select(r,c)); board.append(cell); } if(state.selected) this.renderPad(); },
  },
  nonogram: simpleGridGame("nonogram", "solution", ["","filled","x"], { filled:"■", x:"×" }),
  bimaru: simpleGridGame("bimaru", "solution", ["","animal","water"], { animal:"🐟", water:"~" }),
  shikaku: {
    resetState(level){ state={ regions: zeros(level.size, level.size, ""), selectedClue: null, nextColor: 1 }; setStatus("Tippe zuerst auf eine Zahl."); },
    checkWin(){ const sol=currentLevel().solutionRegions; return state.regions.every((row,r)=>row.every((v,c)=>String(v)===String(sol[r][c]))); },
    clueAt(r,c){ return currentLevel().clues.find((cl)=>cl.row===r&&cl.col===c); },
    input(r,c){ const clue=this.clueAt(r,c); if(clue){ state.selectedClue=clue; render(`Gehege mit ${clue.value} Feldern: Tippe auf die andere Ecke.`); return; } if(!state.selectedClue){ render("Tippe zuerst auf eine Zahl."); return; } const cl=state.selectedClue, r1=Math.min(r,cl.row), r2=Math.max(r,cl.row), c1=Math.min(c,cl.col), c2=Math.max(c,cl.col), area=(r2-r1+1)*(c2-c1+1); if(area!==cl.value){ render("Das Gehege braucht genau die Zahl an Feldern."); return; } pushHistory(); const id=currentLevel().solutionRegions[cl.row][cl.col]; for(let y=r1;y<=r2;y++) for(let x=c1;x<=c2;x++) state.regions[y][x]=id; state.selectedClue=null; this.checkWin()?handleWin():render("Schönes Gehege! Baue weiter."); },
    hint(){ const level=currentLevel(); const clue=level.clues.find((cl)=>state.regions[cl.row][cl.col]!==level.solutionRegions[cl.row][cl.col]); if(!clue) return; pushHistory(); const id=level.solutionRegions[clue.row][clue.col]; for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++) if(level.solutionRegions[r][c]===id) state.regions[r][c]=id; render("Tipp: Ein passendes Gehege ist eingezeichnet."); checkAndWin(); },
    render(level){ board.innerHTML=""; board.style.setProperty("--size", level.size); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const clue=this.clueAt(r,c), id=state.regions[r][c]; const cell=makeButtonCell(r,c,`cell shikaku-cell${clue?" clue":""}${id?" region":""}${state.selectedClue&&sameCell([r,c],[state.selectedClue.row,state.selectedClue.col])?" selected":""}`, clue ? clue.value : ""); if(id) cell.style.setProperty("--region-hue", (Number(id)*47)%360); cell.addEventListener("click",()=>this.input(r,c)); board.append(cell); } },
  },
  thermometer: {
    resetState(level){ state={ fillLengths: level.thermometers.map(()=>0) }; setStatus("Tippe eine Zaubertrank-Röhre an."); },
    filledGrid(){ const level=currentLevel(), g=zeros(level.size); level.thermometers.forEach((path,i)=>path.slice(0,state.fillLengths[i]).forEach(([r,c])=>g[r][c]=1)); return g; },
    thermoAt(r,c){ let found=null; currentLevel().thermometers.forEach((p,i)=>{ const idx=p.findIndex((pt)=>sameCell(pt,[r,c])); if(idx>=0) found=[i,idx]; }); return found; },
    input(r,c){ const hit=this.thermoAt(r,c); if(!hit) return; pushHistory(); const [i,idx]=hit; state.fillLengths[i] = state.fillLengths[i] === idx+1 ? idx : idx+1; this.checkWin()?handleWin():render("Blubb! Die Röhre ist gefüllt."); },
    checkWin(){ const g=this.filledGrid(), level=currentLevel(), cc=counts(g); return JSON.stringify(g)===JSON.stringify(level.solutionFilled) && JSON.stringify(cc.rowCounts)===JSON.stringify(level.rowCounts) && JSON.stringify(cc.colCounts)===JSON.stringify(level.colCounts); },
    hint(){ const level=currentLevel(); const i=state.fillLengths.findIndex((v,idx)=>v!==level.fillLengths[idx]); if(i<0) return; pushHistory(); state.fillLengths[i]=level.fillLengths[i]; render("Tipp: Eine Röhre ist passend gefüllt."); checkAndWin(); },
    render(level){ const g=this.filledGrid(); renderCountBoard(level, (r,c)=>{ const hit=this.thermoAt(r,c); const cell=makeButtonCell(r,c,`cell thermo-cell${hit?" tube":""}${g[r][c]?" filled-potion":""}`, hit ? (hit[1]===0 ? "●" : "") : ""); cell.addEventListener("click",()=>this.input(r,c)); return cell; }); },
  },
  patterns: {
    resetState(level){ state={ answers: Array(level.missingIndices.length).fill(null) }; setStatus("Wähle unten das passende Zeichen."); },
    checkWin(){ const level=currentLevel(); return state.answers.every((a,i)=>a && a.text===level.answers[i].text); },
    choose(opt){ const idx=state.answers.findIndex((a)=>!a); if(idx<0) return; pushHistory(); state.answers[idx]=opt; this.checkWin()?handleWin():render(state.answers[idx].text===currentLevel().answers[idx].text?"Richtig! Eine Lücke ist gefüllt.":"Schau noch einmal genau auf das Muster."); },
    hint(){ setStatus(`Tipp: ${currentLevel().hint}`); },
    render(level){ board.innerHTML=""; board.className="board patterns-board"; board.style.setProperty("--size", level.sequence.length); level.sequence.forEach((item,i)=>{ const missingIndex=level.missingIndices.indexOf(i); let text=item?.text || "?"; if(missingIndex>=0 && state.answers[missingIndex]) text=state.answers[missingIndex].text; const cell=makeButtonCell(0,i,`cell pattern-cell${missingIndex>=0?" missing":""}`, text); board.append(cell); }); const options=document.createElement("div"); options.className="pattern-options"; level.options.forEach((opt)=>{ const b=document.createElement("button"); b.type="button"; b.textContent=opt.text; b.addEventListener("click",()=>this.choose(opt)); options.append(b); }); board.append(options); },
  },
  maze: {
    resetState(level){ state={ path:[level.start], keys:[] }; setStatus(level.ruleText); },
    hasWall(r,c){ return currentLevel().walls.some((pt)=>sameCell(pt,[r,c])); },
    keyAt(r,c){ return (currentLevel().keys||[]).find((pt)=>sameCell(pt,[r,c])); },
    checkWin(){ const level=currentLevel(), last=state.path.at(-1); const keys=(level.keys||[]); return sameCell(last, level.goal) && keys.every((k)=>state.keys.some((got)=>sameCell(got,k))); },
    input(r,c){ const last=state.path.at(-1); if(this.hasWall(r,c)){ render("Da ist eine Mauer. Suche einen anderen Weg."); return; } if(!isNeighbor(last,[r,c])){ render("Gehe Schritt für Schritt auf ein Nachbarfeld."); return; } if(state.path.some((pt)=>sameCell(pt,[r,c]))){ render("Dort warst du schon. Nutze Zurück, wenn du anders laufen willst."); return; } pushHistory(); state.path.push([r,c]); if(this.keyAt(r,c)) state.keys.push([r,c]); if(sameCell([r,c], currentLevel().goal) && !this.checkWin()){ render("Vor dem Ziel fehlt noch ein Schlüssel."); return; } this.checkWin()?handleWin():render(this.keyAt(r,c)?"Schlüssel gesammelt!":"Guter Schritt!"); },
    hint(){ const level=currentLevel(); const next=level.solutionPath.find((pt)=>!state.path.some((p)=>sameCell(p,pt))); if(next) setStatus(`Tipp: Versuche als Nächstes ein Feld neben deinem Weg Richtung Zeile ${next[0]+1}, Spalte ${next[1]+1}.`); else setStatus(level.ruleText); },
    render(level){ board.innerHTML=""; board.style.setProperty("--size", level.size); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const inPath=state.path.some((pt)=>sameCell(pt,[r,c])), wall=this.hasWall(r,c), start=sameCell(level.start,[r,c]), goal=sameCell(level.goal,[r,c]), key=this.keyAt(r,c), got=state.keys.some((pt)=>sameCell(pt,[r,c])); const text=start?"🚩":goal?"🏁":key&&!got?"🔑":""; const cell=makeButtonCell(r,c,`cell maze-cell${wall?" wall":""}${inPath?" path":""}${start?" start":""}${goal?" goal":""}${key?" key":""}`, text); if(!wall) cell.addEventListener("click",()=>this.input(r,c)); board.append(cell); } },
  },
};

function simpleGridGame(game, solutionField, cycle, symbols) {
  return {
    resetState(level) { state = { grid: zeros(level.size, level.size, "") }; setStatus(game === "nonogram" ? "Fülle Felder und entdecke das Bild." : "Finde alle Meerestiere im Wasser."); },
    checkWin() { const level=currentLevel(); return state.grid.every((row,r)=>row.every((v,c)=>(v === cycle[1]) === Boolean(level[solutionField][r][c]))); },
    input(r,c) { pushHistory(); const i=cycle.indexOf(state.grid[r][c]); state.grid[r][c]=cycle[(i+1)%cycle.length]; this.checkWin()?handleWin():render("Gut! Schau weiter auf die Zahlen."); },
    hint() { const level=currentLevel(); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const want=level[solutionField][r][c] ? cycle[1] : cycle[2]; if(state.grid[r][c]!==want){ pushHistory(); state.grid[r][c]=want; render("Tipp: Ein sicheres Feld ist markiert."); checkAndWin(); return; } } },
    render(level) { if(game === "nonogram") renderNonogram(level, this); else renderCountBoard(level, (r,c)=>{ const v=state.grid[r][c]; const cell=makeButtonCell(r,c,`cell ${game}-cell ${v}`, symbols[v] || ""); cell.addEventListener("click",()=>this.input(r,c)); return cell; }); },
  };
}
function renderCountBoard(level, makeCell) { board.innerHTML=""; board.style.setProperty("--size", level.size + 1); board.classList.add("count-board"); board.append(Object.assign(document.createElement("div"), { className:"count-corner" })); level.colCounts.forEach((n)=>{ const d=document.createElement("div"); d.className="count-label col-count"; d.textContent=n; board.append(d); }); for(let r=0;r<level.size;r++){ const lab=document.createElement("div"); lab.className="count-label row-count"; lab.textContent=level.rowCounts[r]; board.append(lab); for(let c=0;c<level.size;c++) board.append(makeCell(r,c)); } }
function renderNonogram(level, handler) { const rowClues=cluesFor(level.solution), colClues=cluesFor(level.solution[0].map((_,c)=>level.solution.map((r)=>r[c]))); board.innerHTML=""; board.style.setProperty("--size", level.size + 1); board.classList.add("clue-board"); board.append(Object.assign(document.createElement("div"), { className:"count-corner" })); colClues.forEach((cl)=>{ const d=document.createElement("div"); d.className="count-label col-clue"; d.textContent=cl.join(" "); board.append(d); }); for(let r=0;r<level.size;r++){ const lab=document.createElement("div"); lab.className="count-label row-clue"; lab.textContent=rowClues[r].join(" "); board.append(lab); for(let c=0;c<level.size;c++){ const v=state.grid[r][c]; const cell=makeButtonCell(r,c,`cell nonogram-cell ${v}`, v==="filled"?"":v==="x"?"×":""); cell.addEventListener("click",()=>handler.input(r,c)); board.append(cell); } } }

if (currentGame && LEVELS_BY_GAME[currentGame]) renderLevelSelect();
if (undoButton) undoButton.addEventListener("click", undo);
if (resetButton) resetButton.addEventListener("click", resetGame);
if (backButton) backButton.addEventListener("click", showLevelSelect);
setupSuccessOverlay();

function cellKeyFromPoint(row, col) { return `${row},${col}`; }
function arukoneCellFromPoint(clientX, clientY) {
  if (!board || currentGame !== "arukone") return null;
  const direct = document.elementFromPoint(clientX, clientY)?.closest(".arukone-cell");
  if (direct && board.contains(direct)) return direct;
  const level = currentLevel();
  const rect = board.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
  const col = Math.min(level.size - 1, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * level.size)));
  const row = Math.min(level.size - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * level.size)));
  return board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}
function drawArukoneCell(row, col) {
  const nextKey = cellKeyFromPoint(row, col);
  if (nextKey === lastDrawnKey) return;
  if (lastDrawnKey) {
    const [lastRow, lastCol] = lastDrawnKey.split(",").map(Number);
    if (lastRow === row && Math.abs(lastCol - col) > 1) {
      const step = Math.sign(col - lastCol);
      for (let c = lastCol + step; c !== col; c += step) GAME_HANDLERS.arukone.input(row, c);
    } else if (lastCol === col && Math.abs(lastRow - row) > 1) {
      const step = Math.sign(row - lastRow);
      for (let r = lastRow + step; r !== row; r += step) GAME_HANDLERS.arukone.input(r, col);
    }
  }
  lastDrawnKey = nextKey;
  GAME_HANDLERS.arukone.input(row, col);
}
function finishArukonePointer() {
  isDrawing = false;
  lastDrawnKey = null;
  activePointerId = null;
  finishMove();
}

document.addEventListener("pointermove", (event) => {
  if (!isDrawing || currentGame !== "arukone" || event.pointerId !== activePointerId) return;
  event.preventDefault();
  const el = arukoneCellFromPoint(event.clientX, event.clientY);
  if (!el) return;
  drawArukoneCell(Number(el.dataset.row), Number(el.dataset.col));
}, { passive: false });
document.addEventListener("pointerup", (event) => { if (event.pointerId === activePointerId) finishArukonePointer(); });
document.addEventListener("pointercancel", (event) => { if (event.pointerId === activePointerId) finishArukonePointer(); });
if (board) board.addEventListener("pointerdown", (event) => { const cell=event.target.closest(".arukone-cell"); if(!cell || currentGame!=="arukone") return; event.preventDefault(); beginMove(); isDrawing=true; activePointerId=event.pointerId; board.setPointerCapture?.(event.pointerId); drawArukoneCell(Number(cell.dataset.row), Number(cell.dataset.col)); }, { passive: false });
