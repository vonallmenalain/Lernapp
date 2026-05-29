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
    success: "Prima gerechnet! Alle Felder sind ausgefüllt und es gibt keine Fehler.",
    rules: ["Tippe auf ein leeres Feld.", "Wähle unten die passende Zahl aus.", "Jede Zahl darf in Reihe, Spalte und Box nur einmal vorkommen."],
  },
  bimaru: {
    title: "Meerestiere", eyebrow: "Im Wasser suchen", code: "B",
    subtitle: "Finde alle versteckten Meerestiere im Wasser.",
    success: "Alle Meerestiere sind gefunden!", 
    rules: ["Die Zahlen zeigen, wie viele Tierfelder in Reihe und Spalte sind.", "Tippe: leer, Tier, Wasser und wieder leer.", "Wasser ist nur eine Hilfe: Für den Erfolg müssen nur die Tier-Anzahlen stimmen."],
  },
  kakuro: {
    title: "Kakuro", eyebrow: "Summen knobeln", code: "K",
    subtitle: "Fülle die weißen Felder so, dass jede Zahlenkette ihre Summe erreicht.",
    success: "Klasse kombiniert! Alle Kakuro-Summen stimmen.",
    rules: ["Tippe auf ein weißes Feld und wähle unten eine Zahl.", "Die kleinen Zahlen zeigen die Summe nach rechts oder nach unten.", "In jeder zusammenhängenden Summe darf jede Zahl nur einmal vorkommen."],
  },
};

function clone(value) { return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function keyOf(row, col) { return `${row}-${col}`; }
function sameCell(a, b) { return a && b && a[0] === b[0] && a[1] === b[1]; }
function isNeighbor(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1; }
function zeros(rows, cols = rows, fill = 0) { return Array.from({ length: rows }, () => Array(cols).fill(fill)); }
function counts(grid) { return { rowCounts: grid.map((r) => r.reduce((a, b) => a + b, 0)), colCounts: grid[0].map((_, c) => grid.reduce((a, r) => a + r[c], 0)) }; }
function sameCounts(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
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
function makeSudokuSolution(size, boxRows, rowOrder, colOrder, symbols) {
  const pattern = (row, col) => (boxRows * (row % boxRows) + Math.floor(row / boxRows) + col) % size;
  return rowOrder.map((row) => colOrder.map((col) => symbols[pattern(row, col)]));
}
function givensFromCells(solution, cells) { return cells.map(([row, col]) => [row, col, solution[row][col]]); }

const SUDOKU_EASY_SETUPS = [
  { rows: [0,1,2,3], cols: [0,1,2,3], symbols: [1,2,3,4], cells: [[0,0],[0,3],[1,1],[2,2],[3,0],[3,3]] },
  { rows: [0,1,2,3], cols: [1,0,3,2], symbols: [2,1,4,3], cells: [[0,0],[0,2],[1,1],[2,2],[3,1],[3,3]] },
  { rows: [2,3,0,1], cols: [0,1,2,3], symbols: [3,4,1,2], cells: [[0,1],[0,3],[1,0],[2,2],[3,0],[3,3]] },
  { rows: [1,0,3,2], cols: [0,1,2,3], symbols: [1,2,3,4], cells: [[0,0],[0,2],[1,3],[2,1],[3,0],[3,3]] },
  { rows: [0,1,2,3], cols: [2,3,0,1], symbols: [4,3,2,1], cells: [[0,1],[0,2],[1,0],[2,3],[3,1],[3,2]] },
  { rows: [2,3,0,1], cols: [1,0,3,2], symbols: [1,3,2,4], cells: [[0,0],[0,3],[1,2],[2,1],[3,0],[3,3]] },
  { rows: [0,1,3,2], cols: [0,1,3,2], symbols: [2,4,1,3], cells: [[0,0],[0,3],[1,1],[2,0],[3,2],[3,3]] },
  { rows: [1,0,2,3], cols: [1,0,2,3], symbols: [3,1,4,2], cells: [[0,0],[0,2],[1,1],[2,3],[3,0],[3,2]] },
  { rows: [2,3,1,0], cols: [2,3,1,0], symbols: [4,1,3,2], cells: [[0,1],[0,3],[1,0],[2,2],[3,0],[3,3]] },
  { rows: [3,2,0,1], cols: [3,2,0,1], symbols: [1,4,2,3], cells: [[0,0],[0,2],[1,1],[2,3],[3,1],[3,2]] },
];
const SUDOKU_EASY = SUDOKU_EASY_SETUPS.map((setup, i) => {
  const solution = makeSudokuSolution(4, 2, setup.rows, setup.cols, setup.symbols);
  return makeLevel("sudoku", "easy", i + 1, { solution, givens: givensFromCells(solution, setup.cells), size: 4, boxRows: 2, boxCols: 2, description: "Ein leichtes 4×4 Sudoku mit den Zahlen 1 bis 4." });
});
const SUDOKU_MEDIUM = SUDOKU_LEVELS.map((l, i) => makeLevel("sudoku", "medium", i + 1, { ...l, description: "Ein mittleres 6×6 Sudoku mit den Zahlen 1 bis 6." }));
const SUDOKU_HARD = SUDOKU_LEVELS.map((l, i) => makeLevel("sudoku", "hard", i + 1, { ...l, givens: l.givens.filter((_, n) => n % 2 === i % 2), description: "Ein schweres 6×6 Sudoku mit weniger Startzahlen." }));


function makeKakuroLevel(difficulty, index, solution, description) {
  const size = solution.length;
  const clues = {};
  const runFor = {};
  const runs = [];
  const isWhite = (row, col) => solution[row]?.[col] > 0;
  const addRun = (type, cells) => {
    const id = `${type}-${runs.length}`;
    const sum = cells.reduce((total, [row, col]) => total + solution[row][col], 0);
    runs.push({ id, type, cells, sum });
    cells.forEach(([row, col]) => {
      runFor[keyOf(row, col)] = { ...(runFor[keyOf(row, col)] || {}), [type]: id };
    });
    return sum;
  };

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (isWhite(row, col)) continue;
      const clue = {};
      const acrossCells = [];
      for (let nextCol = col + 1; nextCol < size && isWhite(row, nextCol); nextCol += 1) acrossCells.push([row, nextCol]);
      const downCells = [];
      for (let nextRow = row + 1; nextRow < size && isWhite(nextRow, col); nextRow += 1) downCells.push([nextRow, col]);
      if (acrossCells.length >= 2) clue.across = addRun("across", acrossCells);
      if (downCells.length >= 2) clue.down = addRun("down", downCells);
      if (clue.across || clue.down) clues[keyOf(row, col)] = clue;
    }
  }

  return makeLevel("kakuro", difficulty, index, { size, solution, clues, runs, runFor, description });
}

const KAKURO_LEVELS = [
  makeKakuroLevel("easy", 1, [
    [0, 0, 0, 0, 0],
    [0, 6, 3, 0, 0],
    [0, 8, 4, 6, 9],
    [0, 0, 7, 4, 2],
    [0, 0, 0, 1, 5],
  ], "Ein übersichtliches Kakuro wie in der einfachen Vorlage."),
  makeKakuroLevel("medium", 1, [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 6, 2, 0, 0, 5, 7],
    [0, 2, 5, 0, 6, 8, 1],
    [0, 0, 1, 8, 3, 0, 0],
    [0, 0, 0, 4, 9, 3, 0],
    [0, 3, 9, 6, 0, 2, 8],
    [0, 9, 3, 0, 0, 1, 3],
  ], "Ein mittleres Kakuro mit mehreren verzahnten Summen."),
  makeKakuroLevel("hard", 1, [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 4, 0, 1, 7, 5],
    [0, 8, 4, 1, 5, 6, 2, 3],
    [0, 1, 5, 0, 6, 2, 3, 1],
    [0, 9, 2, 3, 4, 0, 1, 7],
    [0, 0, 8, 5, 1, 3, 4, 2],
    [0, 5, 9, 6, 0, 7, 9, 4],
    [0, 9, 7, 4, 0, 4, 5, 8],
  ], "Ein schweres Kakuro mit langen Zahlenketten und vielen Kreuzungen."),
];

function sea(lines, fleet) { const solution = gridFromStrings(lines, "1"); return { solution, ...counts(solution), fleet, size: solution.length }; }
const BIMARU_LEVEL_COUNTS = { easy: 0, medium: 0, hard: 0 };
const BIMARU_LEVELS = [
  ["easy", sea(["10001","00000","01100","00000","10010"], {1:3,2:2})],
  ["easy", sea(["01000","00011","00000","10000","00110"], {1:2,2:2})],
  ["easy", sea(["00100","00000","11000","00001","01100"], {1:2,2:2})],
  ["easy", sea(["10000","00110","00000","01000","00011"], {1:1,2:2})],
  ["easy", sea(["01100","00000","10001","00000","00100"], {1:3,2:1})],
  ["easy", sea(["00010","11000","00000","00101","00000"], {1:2,2:1})],
  ["easy", sea(["10010","00000","00110","00000","01000"], {1:3,2:1})],
  ["easy", sea(["00001","01100","00000","10000","00011"], {1:2,2:2})],
  ["easy", sea(["01000","00000","10011","00000","00100"], {1:2,2:1})],
  ["easy", sea(["00100","00011","00000","01000","10000"], {1:3,2:1})],

  ["medium", sea(["100001","000000","011100","000000","110010","000010"], {1:2,2:1,3:1})],
  ["medium", sea(["011000","000001","100000","000110","000000","111000"], {1:2,2:2,3:1})],
  ["medium", sea(["100100","000100","011000","000000","100011","000000"], {1:2,2:2,3:1})],
  ["medium", sea(["000110","100000","000001","011100","000000","100010"], {1:3,2:1,3:1})],
  ["medium", sea(["101000","000000","001110","000000","110000","000101"], {1:4,2:1,3:1})],
  ["medium", sea(["000001","011000","000100","100100","000000","001110"], {1:2,2:1,3:2})],
  ["medium", sea(["110000","000010","000010","001000","000001","011000"], {1:2,2:2})],
  ["medium", sea(["001100","000000","100001","000000","011010","000010"], {1:2,2:2})],
  ["medium", sea(["100010","000010","000000","111000","000001","001100"], {1:2,2:1,3:1})],
  ["medium", sea(["000100","110100","000000","000011","100000","001000"], {1:3,2:2})],

  ["hard", sea(["10000001","00011000","00000000","11100010","00000010","01000010","01000100","00000100"], {1:3,2:2,3:2})],
  ["hard", sea(["01100000","00000100","10000100","00000100","00000000","11100001","00000000","00111000"], {1:2,2:1,3:3})],
  ["hard", sea(["10001000","00001000","01100001","00000000","00111000","00000010","11000010","00000010"], {1:2,2:2,3:2})],
  ["hard", sea(["00000111","10000000","10011000","00000000","00100001","00100001","00000001","11000000"], {1:2,2:2,3:2})],
  ["hard", sea(["11000000","00001000","00001000","00001000","00110000","00000001","01110000","00000001"], {1:2,2:2,3:2})],
  ["hard", sea(["00010001","00010001","00010000","01100000","00000000","10000111","00000000","00110000"], {1:2,2:2,3:2})],
  ["hard", sea(["00111000","00000001","11000001","00000001","00000000","00001100","10000000","10000110"], {1:2,2:2,3:2})],
  ["hard", sea(["10000000","10001100","00000000","00111000","00000010","01100010","00000010","00000100"], {1:2,2:2,3:2})],
  ["hard", sea(["00000100","11100100","00000000","01000011","01000000","00010000","00010000","00010001"], {1:2,2:2,3:2})],
  ["hard", sea(["11000001","00000001","00111000","00000000","10010000","00010000","00000011","00010000"], {1:2,2:2,3:2})],
].map(([difficulty, data]) => {
  BIMARU_LEVEL_COUNTS[difficulty] += 1;
  return makeLevel("bimaru", difficulty, BIMARU_LEVEL_COUNTS[difficulty], { ...data, description: "Finde die Tierfelder im Wasser." });
});
const LEVELS_BY_GAME = {
  arukone: ARUKONE_LEVELS,
  sudoku: [...SUDOKU_EASY, ...SUDOKU_MEDIUM, ...SUDOKU_HARD],
  bimaru: BIMARU_LEVELS,
  kakuro: KAKURO_LEVELS,
};

const board = document.querySelector("#board");
const numberPad = document.querySelector("#number-pad");
const homePanel = document.querySelector("#home-panel");
const levelPanel = document.querySelector("#level-panel");
const appIntro = document.querySelector("#app-intro");
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
let selectedDifficulty = null;
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

function levelsForDifficulty(difficulty) { return LEVELS_BY_GAME[currentGame].filter((level) => level.difficulty === difficulty); }
function countSolved(levels) { return levels.filter((level) => isSolved(level)).length; }
function renderSelectionActions(mode) {
  if (!levelPanel) return;
  levelPanel.querySelector(".selection-actions")?.remove();
  const actions = document.createElement("div");
  actions.className = "selection-actions";
  const homeLink = document.createElement("a");
  homeLink.className = "selection-back-button home-back-button";
  homeLink.href = "index.html";
  homeLink.textContent = "← Zurück zu den Rätseln";
  homeLink.setAttribute("aria-label", "Zurück zur Auswahl der Rätsel");
  actions.append(homeLink);
  if (mode === "levels") {
    const difficultyButton = document.createElement("button");
    difficultyButton.className = "selection-back-button";
    difficultyButton.type = "button";
    difficultyButton.textContent = "← Schwierigkeit ändern";
    difficultyButton.addEventListener("click", showDifficultySelect);
    actions.append(difficultyButton);
  }
  levelPanel.querySelector(".start-copy")?.after(actions);
}
function renderDifficultySelect() {
  if (!currentGame || !levelPanel) return;
  const config = GAME_CONFIGS[currentGame];
  levelPanel.classList.add("difficulty-step");
  levelHeading.textContent = `${config.title}: Schwierigkeit wählen`;
  if (appIntro) appIntro.textContent = `Wähle zuerst den Schwierigkeitsgrad für ${config.title}.`;
  levelDescription.textContent = "Wähle zuerst, wie knifflig dein Rätsel sein soll. Danach zeigen wir dir nur die passenden Levels.";
  fillList(rulesList, config.rules);
  renderSelectionActions("difficulty");
  levelGrid.className = "difficulty-grid";
  levelGrid.setAttribute("aria-label", "Schwierigkeitsgrad auswählen");
  levelGrid.innerHTML = "";
  ["easy", "medium", "hard"].forEach((difficulty) => {
    const info = DIFFICULTIES[difficulty];
    const levels = levelsForDifficulty(difficulty);
    const solved = countSolved(levels);
    const button = document.createElement("button");
    button.className = `difficulty-card ${difficulty}`;
    button.type = "button";
    button.setAttribute("aria-label", `${info.label} wählen, ${levels.length} Levels, ${solved} gelöst`);
    button.innerHTML = `
      <span class="difficulty-icon" aria-hidden="true">${difficulty === "easy" ? "🌱" : difficulty === "medium" ? "⭐" : "🚀"}</span>
      <span class="difficulty-name">${info.label}</span>
      <small>${levels.length} Levels · ${solved} gelöst</small>
    `;
    button.addEventListener("click", () => selectDifficulty(difficulty));
    levelGrid.append(button);
  });
}
function selectDifficulty(difficulty) { selectedDifficulty = difficulty; renderLevelSelect(); }
function showDifficultySelect() { selectedDifficulty = null; currentIndex = -1; renderDifficultySelect(); }
function renderLevelSelect() {
  if (!currentGame || !levelPanel) return;
  if (!selectedDifficulty) { renderDifficultySelect(); return; }
  const config = GAME_CONFIGS[currentGame];
  const difficulty = DIFFICULTIES[selectedDifficulty];
  levelPanel.classList.remove("difficulty-step");
  levelHeading.textContent = `${config.title}: ${difficulty.label} Levels`;
  if (appIntro) appIntro.textContent = `Wähle ein ${difficulty.label}-Level für ${config.title}.`;
  levelDescription.textContent = `Du hast ${difficulty.label} gewählt. Such dir jetzt ein Level aus.`;
  fillList(rulesList, config.rules);
  renderSelectionActions("levels");
  levelGrid.className = "level-grid";
  levelGrid.setAttribute("aria-label", `${config.title} ${difficulty.label} Levels`);
  levelGrid.innerHTML = "";
  levelsForDifficulty(selectedDifficulty).forEach((level) => {
    const index = LEVELS_BY_GAME[currentGame].indexOf(level);
    const button = document.createElement("button");
    button.className = `level-tile ${selectedDifficulty}${isSolved(level) ? " solved" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `${level.title}${isSolved(level) ? ", gelöst" : ""}`);
    button.innerHTML = `<span>${level.levelName}</span><small>${isSolved(level) ? "★ gelöst" : (level.size ? `${level.size}×${level.size}` : "Rätsel")}</small>`;
    button.addEventListener("click", () => startLevel(index));
    levelGrid.append(button);
  });
}
function showLevelSelect() { finishMove(); hideSuccess(); if (levelPanel) levelPanel.hidden = false; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = true; if (gameControls) gameControls.hidden = true; document.body.classList.remove("puzzle-active"); renderLevelSelect(); }
function showGame() { if (levelPanel) levelPanel.hidden = true; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = false; if (gameControls) gameControls.hidden = false; document.body.classList.add("puzzle-active"); }
function startLevel(index) { hideSuccess(); currentIndex = index; const level = currentLevel(); selectedDifficulty = level.difficulty; const config = GAME_CONFIGS[currentGame]; history = []; winShown = false; if (undoButton) undoButton.disabled = true; board.className = `board ${currentGame}-board`; board.style.setProperty("--size", level.size || 5); board.setAttribute("aria-label", `${config.title} Spielfeld`); puzzleTitle.textContent = level.title; puzzleDescription.textContent = level.description || config.subtitle; fillList(gameHelpList, config.rules); resetState(); showGame(); render(); }
function resetGame() { history = []; if (undoButton) undoButton.disabled = true; hideSuccess(); resetState(); render("Neu gestartet. Viel Spass!"); }
function undo() { finishMove(); if (!history.length) return; restore(history.pop()); if (undoButton) undoButton.disabled = history.length === 0; setStatus("Ein Schritt zurück."); }
function nextLevel() { const levels = levelsForDifficulty(selectedDifficulty || currentLevel().difficulty); const currentDifficultyIndex = levels.indexOf(currentLevel()); const next = levels[(currentDifficultyIndex + 1) % levels.length]; startLevel(LEVELS_BY_GAME[currentGame].indexOf(next)); }
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
    checkWin() {
      const level = currentLevel();
      const filled = new Set();
      const done = Object.keys(level.pairs).every((pair) => this.isConnected(pair));
      Object.entries(state.paths).forEach(([pair, path]) => {
        path.forEach((pt) => filled.add(keyOf(...pt)));
        if (this.isConnected(pair)) level.pairs[pair].forEach((pt) => filled.add(keyOf(...pt)));
      });
      return done && filled.size === level.size * level.size;
    },
    reachesEndpoint(path, endpoint) { const last=path.at(-1); return sameCell(last, endpoint) || isNeighbor(last, endpoint); },
    isConnected(pair) { const ends=currentLevel().pairs[pair], path=state.paths[pair]; return path.length>1 && ((sameCell(path[0],ends[0])&&this.reachesEndpoint(path,ends[1]))||(sameCell(path[0],ends[1])&&this.reachesEndpoint(path,ends[0]))); },
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
    checkWin() { return state.values.every((row,r)=>row.every((v,c)=>Boolean(v) && !this.conflict(r,c,v))); },
    conflict(r,c,v) { if(!v) return false; const level=currentLevel(); const br=Math.floor(r/level.boxRows)*level.boxRows, bc=Math.floor(c/level.boxCols)*level.boxCols; for(let i=0;i<level.size;i++){ if(i!==c&&state.values[r][i]===v) return true; if(i!==r&&state.values[i][c]===v) return true; } for(let y=br;y<br+level.boxRows;y++) for(let x=bc;x<bc+level.boxCols;x++) if((y!==r||x!==c)&&state.values[y][x]===v) return true; return false; },
    select(r,c) { if(state.fixed[keyOf(r,c)]) { state.selected=null; render("Diese Startzahl bleibt stehen."); return; } state.selected=[r,c]; render("Wähle eine Zahl aus."); this.renderPad(); },
    setNumber(v) { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=v; state.selected=null; this.checkWin()?handleWin():render(this.conflict(r,c,v)?"Fast! Diese Zahl kommt hier doppelt vor.":"Gut gemacht, weiter so!"); },
    clear() { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=null; state.selected=null; render("Die Zahl ist weg."); },
    hint() { const level=currentLevel(); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++) if(!state.fixed[keyOf(r,c)] && state.values[r][c]!==level.solution[r][c]) { pushHistory(); state.values[r][c]=level.solution[r][c]; render("Tipp: Ich habe ein sicheres Feld eingesetzt."); checkAndWin(); return; } },
    renderPad() { const level=currentLevel(); numberPad.innerHTML=""; numberPad.hidden=false; numberPad.style.setProperty("--pad-cols", Math.min(level.size, 3)); for(let n=1;n<=level.size;n++){ const b=document.createElement("button"); b.type="button"; b.textContent=n; b.addEventListener("click",()=>this.setNumber(n)); numberPad.append(b); } const clear=document.createElement("button"); clear.type="button"; clear.className="clear-number-button"; clear.textContent="Löschen"; clear.addEventListener("click",()=>this.clear()); numberPad.append(clear); },
    render(level) { board.innerHTML=""; board.style.setProperty("--size", level.size); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const v=state.values[r][c], fixed=state.fixed[keyOf(r,c)], selected=state.selected&&sameCell(state.selected,[r,c]); const edgeR=(c+1)%level.boxCols===0&&c<level.size-1, edgeB=(r+1)%level.boxRows===0&&r<level.size-1; const cell=makeButtonCell(r,c,`cell sudoku-cell${fixed?" given":""}${selected?" selected":""}${this.conflict(r,c,v)?" conflict":""}${edgeR?" box-edge-right":""}${edgeB?" box-edge-bottom":""}`, v || ""); cell.addEventListener("click",()=>this.select(r,c)); board.append(cell); } if(state.selected) this.renderPad(); },
  },
  bimaru: simpleGridGame("bimaru", "solution", ["","animal","water"], { animal:"🐟", water:"~" }),
  kakuro: {
    resetState(level) { state = { values: zeros(level.size, level.size, null), selected: null }; setStatus("Tippe auf ein weißes Feld und wähle eine Zahl."); },
    checkWin() { const level=currentLevel(); const filled=level.solution.every((row,r)=>row.every((value,c)=>!value || Boolean(state.values[r][c]))); return filled && level.runs.every((run)=>!this.runConflict(run)); },
    isWhite(level,r,c) { return level.solution[r]?.[c] > 0; },
    select(r,c) { const level=currentLevel(); if(!this.isWhite(level,r,c)) return; state.selected=[r,c]; render("Wähle eine Zahl von 1 bis 9."); this.renderPad(); },
    setNumber(v) { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=v; state.selected=null; this.checkWin()?handleWin():render(this.conflict(r,c) ? "Schau noch einmal auf Summe und doppelte Zahlen." : "Gut! Prüfe die kreuzenden Summen."); },
    clear() { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=null; state.selected=null; render("Die Zahl ist weg."); },
    hint() { const level=currentLevel(); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++) if(level.solution[r][c] && state.values[r][c]!==level.solution[r][c]) { pushHistory(); state.values[r][c]=level.solution[r][c]; render("Tipp: Ein sicheres Feld ist eingetragen."); checkAndWin(); return; } },
    runConflict(run) { const values=run.cells.map(([r,c])=>state.values[r][c]).filter(Boolean); const duplicate=new Set(values).size!==values.length; const sum=values.reduce((total,value)=>total+value,0); return duplicate || sum>run.sum || (values.length===run.cells.length && sum!==run.sum); },
    conflict(r,c) { const level=currentLevel(); const ids=level.runFor[keyOf(r,c)] || {}; return Object.values(ids).some((id)=>this.runConflict(level.runs.find((run)=>run.id===id))); },
    renderPad() { numberPad.innerHTML=""; numberPad.hidden=false; numberPad.style.setProperty("--pad-cols", 3); for(let n=1;n<=9;n++){ const b=document.createElement("button"); b.type="button"; b.textContent=n; b.addEventListener("click",()=>this.setNumber(n)); numberPad.append(b); } const clear=document.createElement("button"); clear.type="button"; clear.className="clear-number-button"; clear.textContent="Löschen"; clear.addEventListener("click",()=>this.clear()); numberPad.append(clear); },
    render(level) { board.innerHTML=""; board.style.setProperty("--size", level.size); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ if(this.isWhite(level,r,c)){ const selected=state.selected&&sameCell(state.selected,[r,c]); const value=state.values[r][c] || ""; const cell=makeButtonCell(r,c,`cell kakuro-cell kakuro-entry${selected?" selected":""}${this.conflict(r,c)?" conflict":""}`, value); cell.addEventListener("click",()=>this.select(r,c)); board.append(cell); } else { const clue=level.clues[keyOf(r,c)] || {}; const cell=document.createElement("div"); cell.className=`cell kakuro-cell kakuro-clue${clue.across||clue.down?" has-clue":""}`; cell.innerHTML=`${clue.down ? `<span class="kakuro-down">${clue.down}</span>` : ""}${clue.across ? `<span class="kakuro-across">${clue.across}</span>` : ""}`; board.append(cell); } } if(state.selected) this.renderPad(); },
  },
};

function simpleGridGame(game, solutionField, cycle, symbols) {
  return {
    resetState(level) { state = { grid: zeros(level.size, level.size, "") }; setStatus("Finde alle Meerestiere im Wasser."); },
    checkWin() {
      const level=currentLevel();
      if(game === "bimaru") {
        const animalCounts = counts(state.grid.map((row)=>row.map((v)=>v === cycle[1] ? 1 : 0)));
        return sameCounts(animalCounts.rowCounts, level.rowCounts) && sameCounts(animalCounts.colCounts, level.colCounts);
      }
      return state.grid.every((row,r)=>row.every((v,c)=>(v === cycle[1]) === Boolean(level[solutionField][r][c])));
    },
    input(r,c) { pushHistory(); const i=cycle.indexOf(state.grid[r][c]); state.grid[r][c]=cycle[(i+1)%cycle.length]; this.checkWin()?handleWin():render("Gut! Schau weiter auf die Zahlen."); },
    hint() {
      const level=currentLevel();
      for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){
        const want=level[solutionField][r][c] ? cycle[1] : cycle[2];
        if(game === "bimaru" && state.grid[r][c]===cycle[1] && !level[solutionField][r][c]) { pushHistory(); state.grid[r][c]=cycle[0]; render("Tipp: Ein Tier passt hier nicht zu den Zahlen."); checkAndWin(); return; }
        if(state.grid[r][c]!==want && (game !== "bimaru" || want === cycle[1])){ pushHistory(); state.grid[r][c]=want; render("Tipp: Ein sicheres Feld ist markiert."); checkAndWin(); return; }
      }
    },
    render(level) { renderCountBoard(level, (r,c)=>{ const v=state.grid[r][c]; const cell=makeButtonCell(r,c,`cell ${game}-cell ${v}`, symbols[v] || ""); cell.addEventListener("click",()=>this.input(r,c)); return cell; }); },
  };
}
function renderCountBoard(level, makeCell) { board.innerHTML=""; board.style.setProperty("--size", level.size + 1); board.classList.add("count-board"); board.append(Object.assign(document.createElement("div"), { className:"count-corner" })); level.colCounts.forEach((n)=>{ const d=document.createElement("div"); d.className="count-label col-count"; d.textContent=n; board.append(d); }); for(let r=0;r<level.size;r++){ const lab=document.createElement("div"); lab.className="count-label row-count"; lab.textContent=level.rowCounts[r]; board.append(lab); for(let c=0;c<level.size;c++) board.append(makeCell(r,c)); } }


if (currentGame && LEVELS_BY_GAME[currentGame]) renderDifficultySelect();
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
