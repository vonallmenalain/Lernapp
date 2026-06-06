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

HARD_PUZZLES.forEach((pairs, index) => {
  const number = String(index + 1).padStart(2, "0");
  PUZZLES[`extreme${number}`] = {
    title: `Rätsel ${number} · Extrem · 7×7`,
    description: "Extremes Rätsel mit besonders verzahnten langen Wegen.",
    size: 7,
    difficulty: "extreme",
    pairs: Object.fromEntries(Object.entries(pairs).map(([symbol, endpoints]) => [
      symbol,
      endpoints.map(([row, col]) => [col, 6 - row]),
    ])),
  };
});

const DIFFICULTY_INFO = {
  easy: { label: "Einfach", code: 1 },
  medium: { label: "Mittel", code: 2 },
  hard: { label: "Schwer", code: 3 },
  extreme: { label: "Extrem", code: 4 },
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
  easy: { label: "Leicht", code: 1, icon: "🌱" },
  medium: { label: "Mittel", code: 2, icon: "⭐" },
  hard: { label: "Schwer", code: 3, icon: "🚀" },
  extreme: { label: "Extrem", code: 4, icon: "🟣" },
};
const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES);
const LEVELS_PER_DIFFICULTY = 10;

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
    title: "Battleships", eyebrow: "Schiffe finden", code: "B",
    subtitle: "Bestimme die Positionen der versteckten Flotte im Raster.",
    success: "Alle Schiffe sind korrekt platziert!",
    rules: ["Die Zahlen am oberen und linken Rand zeigen, wie viele Schiffsteile in der jeweiligen Spalte oder Zeile liegen.", "Am rechten und unteren Rand siehst du die Flotte, die im Raster versteckt ist.", "Kurz tippen markiert Wasser. Langer Druck setzt ein Schiffsteil. Kurzer Tipp auf ein Schiffsteil löscht es."],
  },
  kakuro: {
    title: "Kakuro", eyebrow: "Summen knobeln", code: "K",
    subtitle: "Fülle die weißen Felder so, dass jede Zahlenkette ihre Summe erreicht.",
    success: "Klasse kombiniert! Alle Kakuro-Summen stimmen.",
    rules: ["Tippe auf ein weißes Feld und wähle unten eine Zahl.", "Die kleinen Zahlen zeigen die Summe nach rechts oder nach unten.", "In jeder zusammenhängenden Summe darf jede Zahl nur einmal vorkommen."],
  },
  hidoku: {
    title: "Hidoku", eyebrow: "Zahlenkette", code: "H",
    subtitle: "Trage die fehlenden Zahlen so ein, dass jede Zahl die nächste berührt.",
    success: "Wunderbar verbunden! Die komplette Hidoku-Zahlenkette ist geschlossen.",
    rules: ["Starte mit Maus oder Finger auf einer bestehenden Zahl und fahre von dort weiter.", "Jedes berührte leere Feld bekommt automatisch die nächste fehlende Zahl nach deiner Startzahl.", "Rot wird nur markiert, was wegen doppelten Zahlen oder fehlender Nachbarschaft theoretisch nicht verbunden sein kann; du kannst trotzdem weiterzeichnen."],
  },
  shikaku: {
    title: "Tiergehege", eyebrow: "Gehege bauen", code: "G",
    subtitle: "Baue für jedes Tier ein Gehege mit genau der richtigen Grösse.",
    success: "Alle Tiere haben ein passendes Gehege!",
    rules: ["Ziehe von einer Ecke des geplanten Geheges zur gegenüberliegenden Ecke.", "Das Tier darf auch mitten im Rechteck liegen; das Rechteck muss genau ein Tier enthalten.", "Jedes Gehege braucht genau so viele Felder, wie die Zahl zeigt.", "Tippe auf ein Tier in einem fertigen Gehege, um dieses Gehege wieder zu löschen."],
  },
  mathPuzzle: {
    title: "Zahlenzauber", eyebrow: "Rechenrätsel", code: "Z",
    subtitle: "Löse Plus- und Minusaufgaben mit freundlichen Antwortkarten.",
    success: "Gut gerechnet! Du hast die Aufgaben geschafft.",
    rules: ["Lies die Rechenaufgabe genau.", "Tippe auf die passende Zahl.", "Nach einem zweiten Versuch hilft dir ein Tipp beim Weiterrechnen."],
  },
  sequencePuzzle: {
    title: "Zahlenfolge", eyebrow: "Muster erkennen", code: "F",
    subtitle: "Finde heraus, nach welcher Regel die Zahlenreihe weitergeht.",
    success: "Klasse! Du hast die schwierigen Muster erkannt.",
    rules: ["Schau dir die Zahlenreihe genau an.", "Finde heraus, in welchen Schritten gerechnet wird (+, -, oder sogar verdoppeln).", "Tippe auf die Zahl, die an die Stelle des Fragezeichens gehört."],
  },
  shapeSequencePuzzle: {
    title: "Figurenfolge", eyebrow: "Muster erkennen", code: "P",
    subtitle: "Welche Figur kommt als Nächstes in der Reihe?",
    success: "Klasse! Du hast alle Muster richtig erkannt.",
    rules: ["Schau dir die Figurenreihe genau an.", "Finde heraus, nach welcher Regel sich Formen oder Farben abwechseln.", "Tippe auf die Figur, die an die Stelle des Fragezeichens gehört."],
  },
  readingPuzzle: {
    title: "Wortdetektiv", eyebrow: "Leserätsel", code: "W",
    subtitle: "Erkenne Buchstaben, Wörter und kurze Sätze passend zum Bild.",
    success: "Richtig gelesen! Du hast die Leserätsel geschafft.",
    rules: ["Schau dir zuerst das Bild an.", "Lies das Wort oder den Satz in Ruhe.", "Tippe auf die Antwort, die genau passt."],
  },
  backpack: {
    title: "Rucksack packen", eyebrow: "Endlosspiel", code: "R",
    subtitle: "Merke dir, was schon im Rucksack liegt, und packe alles in der richtigen Reihenfolge ein.",
    success: "Super gemerkt! Der Rucksack ist richtig gepackt.",
    rules: ["Wähle zuerst einen neuen Gegenstand für den Rucksack.", "Packe danach alle Gegenstände in der gemerkten Reihenfolge ein.", "Nach einer gespielten Runde wird die nächste Schwierigkeit frei."],
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
  const levelName = `${config.code} ${diff.code}-${index}`;
  return { ...data, id: data.id || `${game}-${difficulty}-${index}`, game, difficulty, levelName, title: data.title || `${levelName} · ${config.title} · ${diff.label}` };
}

const BACKPACK_DIFFICULTY_RULES = {
  easy: { choiceCount: 3, poolSize: 10, showLabels: true },
  medium: { choiceCount: 4, poolSize: 14, showLabels: true },
  hard: { choiceCount: 5, poolSize: 18, showLabels: false },
  extreme: { choiceCount: 6, poolSize: 24, showLabels: false },
};
const BACKPACK_ITEMS = [
  { id: "apple", emoji: "🍎", label: "Apfel" },
  { id: "ball", emoji: "⚽", label: "Ball" },
  { id: "book", emoji: "📘", label: "Buch" },
  { id: "star", emoji: "⭐", label: "Stern" },
  { id: "banana", emoji: "🍌", label: "Banane" },
  { id: "bear", emoji: "🧸", label: "Teddy" },
  { id: "pencil", emoji: "✏️", label: "Stift" },
  { id: "cookie", emoji: "🍪", label: "Keks" },
  { id: "car", emoji: "🚗", label: "Auto" },
  { id: "key", emoji: "🔑", label: "Schlüssel" },
  { id: "flower", emoji: "🌸", label: "Blume" },
  { id: "rocket", emoji: "🚀", label: "Rakete" },
  { id: "clock", emoji: "⏰", label: "Wecker" },
  { id: "shell", emoji: "🐚", label: "Muschel" },
  { id: "puzzle", emoji: "🧩", label: "Puzzle" },
  { id: "train", emoji: "🚂", label: "Zug" },
  { id: "umbrella", emoji: "☂️", label: "Schirm" },
  { id: "light", emoji: "💡", label: "Lampe" },
  { id: "hat", emoji: "🧢", label: "Kappe" },
  { id: "magnifier", emoji: "🔎", label: "Lupe" },
  { id: "dice", emoji: "🎲", label: "Würfel" },
  { id: "paint", emoji: "🎨", label: "Farbe" },
  { id: "map", emoji: "🗺️", label: "Karte" },
  { id: "medal", emoji: "🏅", label: "Medaille" },
];
const BACKPACK_ITEM_BY_ID = Object.fromEntries(BACKPACK_ITEMS.map((item) => [item.id, item]));
const BACKPACK_LEVELS = DIFFICULTY_KEYS.map((difficulty) => makeLevel("backpack", difficulty, 1, {
  id: `backpack-${difficulty}`,
  badge: "Endlos",
  description: `${DIFFICULTIES[difficulty].label}: ${BACKPACK_DIFFICULTY_RULES[difficulty].choiceCount} Auswahlkarten pro Schritt.`,
}));

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
const CURATED_LEVEL_DATA = {"shikaku":{"easy":[{"rows":4,"cols":4,"clues":[[0,0,4],[1,1,6],[2,0,3],[2,3,3]],"solutionRegions":["aaaa","cbbd","cbbd","cbbd"]},{"rows":4,"cols":4,"clues":[[0,0,2],[0,3,2],[1,0,2],[2,0,2],[2,1,2],[3,2,6]],"solutionRegions":["aabb","ccff","deff","deff"]},{"rows":4,"cols":4,"clues":[[0,0,4],[1,0,2],[3,0,2],[3,1,2],[3,2,6]],"solutionRegions":["aaaa","bbee","cdee","cdee"]},{"rows":4,"cols":4,"clues":[[1,0,6],[2,1,3],[3,1,3],[3,3,4]],"solutionRegions":["aaad","aaad","bbbd","cccd"]},{"rows":4,"cols":4,"clues":[[0,2,3],[0,3,2],[2,2,3],[3,0,3],[3,1,3],[3,3,2]],"solutionRegions":["aaab","decb","decf","decf"]},{"rows":4,"cols":4,"clues":[[0,3,2],[1,1,4],[3,0,2],[3,1,2],[3,2,4],[3,3,2]],"solutionRegions":["bbea","bbea","cdef","cdef"]},{"rows":4,"cols":4,"clues":[[0,2,6],[1,3,4],[2,2,2],[3,0,4]],"solutionRegions":["aaab","aaab","ddcb","ddcb"]},{"rows":4,"cols":4,"clues":[[0,2,4],[0,3,2],[1,0,2],[2,2,3],[2,3,2],[3,2,3]],"solutionRegions":["caab","caab","ddde","fffe"]},{"rows":4,"cols":4,"clues":[[0,1,2],[0,3,2],[2,0,3],[3,2,6],[3,3,3]],"solutionRegions":["aabb","cdde","cdde","cdde"]},{"rows":4,"cols":4,"clues":[[0,3,2],[1,0,6],[3,1,4],[3,2,4]],"solutionRegions":["bbba","bbba","ccdd","ccdd"]}],"medium":[{"rows":6,"cols":6,"clues":[[1,0,6],[1,4,6],[2,5,8],[3,0,2],[3,1,2],[3,2,8],[4,0,4]],"solutionRegions":["aaabbb","aaabbb","deffcc","deffcc","ggffcc","ggffcc"]},{"rows":6,"cols":6,"clues":[[0,4,4],[1,0,4],[1,2,2],[1,3,2],[2,0,2],[3,4,4],[4,0,4],[4,3,8],[5,1,2],[5,4,4]],"solutionRegions":["bbcdaa","bbcdaa","eehhff","gghhff","gghhjj","iihhjj"]},{"rows":6,"cols":6,"clues":[[0,0,3],[1,2,4],[2,2,8],[2,4,8],[4,5,6],[5,0,3],[5,3,4]],"solutionRegions":["abbdde","abbdde","accdde","fccdde","fccgge","fccgge"]},{"rows":6,"cols":6,"clues":[[0,3,4],[0,5,2],[1,4,4],[4,0,8],[4,2,8],[4,5,6],[5,2,4]],"solutionRegions":["aaaabb","ddeecc","ddeecc","ddeeff","ddeeff","ggggff"]},{"rows":6,"cols":6,"clues":[[0,1,8],[1,4,4],[3,4,4],[4,0,4],[4,1,4],[5,2,8],[5,4,4]],"solutionRegions":["aaaabb","aaaabb","deffcc","deffcc","deffgg","deffgg"]},{"rows":6,"cols":6,"clues":[[0,1,2],[1,4,6],[1,5,2],[2,0,5],[2,3,3],[2,4,2],[3,3,5],[4,1,5],[5,1,4],[5,4,2]],"solutionRegions":["dabbbc","dabbbc","deeeff","dggggg","dhhhhh","iiiijj"]},{"rows":6,"cols":6,"clues":[[0,0,8],[0,3,2],[1,2,4],[1,4,6],[3,3,6],[3,4,2],[5,0,4],[5,4,4]],"solutionRegions":["aabbdd","aaccdd","aaccdd","aaeeff","ggeehh","ggeehh"]},{"rows":6,"cols":6,"clues":[[0,4,5],[1,1,4],[1,2,4],[1,3,8],[2,0,6],[3,5,4],[5,3,5]],"solutionRegions":["eaaaaa","ebcddf","ebcddf","ebcddf","ebcddf","eggggg"]},{"rows":6,"cols":6,"clues":[[0,0,2],[0,1,2],[0,2,2],[2,4,8],[3,0,4],[3,2,2],[3,3,4],[4,3,2],[4,5,4],[5,1,6]],"solutionRegions":["abcgdd","abcgdd","eefgdd","eefgdd","jjjhii","jjjhii"]},{"rows":6,"cols":6,"clues":[[1,0,6],[1,4,3],[2,2,6],[2,5,3],[3,1,3],[3,4,3],[4,5,3],[5,1,6],[5,4,3]],"solutionRegions":["aaccbd","aaccbd","aaccbd","eeefff","hhhggg","hhhiii"]}],"hard":[{"rows":8,"cols":8,"clues":[[0,0,5],[1,0,2],[1,2,3],[2,4,5],[2,7,9],[4,0,5],[4,1,10],[4,4,9],[4,7,3],[5,3,5],[6,4,6],[6,7,2]],"solutionRegions":["aaaaaeee","bbccceee","dddddeee","fggjhhhi","fggjhhhi","fggjhhhi","fggjkkkl","fggjkkkl"]},{"rows":8,"cols":8,"clues":[[0,2,5],[0,5,3],[1,1,4],[1,7,4],[2,0,4],[2,3,5],[3,1,2],[3,2,6],[3,3,5],[4,1,2],[4,4,3],[4,6,6],[5,4,6],[6,1,4],[7,3,5]],"solutionRegions":["aaaaabbb","ccccdddd","eghfffff","eghiiiii","ejhkkkll","ejhmmmll","nnhmmmll","nnhooooo"]},{"rows":8,"cols":8,"clues":[[0,3,4],[0,7,6],[1,3,4],[1,4,2],[3,2,6],[3,5,3],[4,2,3],[4,6,6],[5,2,3],[5,4,4],[6,2,6],[6,4,2],[6,5,6],[7,3,6],[7,6,3]],"solutionRegions":["aaaadbbb","ccccdbbb","eeenjfhh","eeenjfhh","gggnjfhh","iiinjmmm","kkknlmmm","kkknlooo"]},{"rows":8,"cols":8,"clues":[[0,0,10],[0,2,5],[0,6,4],[1,6,4],[1,7,2],[2,7,5],[4,5,8],[4,7,2],[5,4,5],[6,1,9],[6,3,10]],"solutionRegions":["aabcccce","aabdddde","aabfffff","aabggggh","aabggggh","jjjiiiii","jjjkkkkk","jjjkkkkk"]},{"rows":8,"cols":8,"clues":[[0,2,4],[0,4,3],[0,6,6],[0,7,3],[1,3,2],[2,2,6],[3,2,4],[3,4,3],[4,3,8],[5,6,9],[6,7,8],[7,0,4],[7,1,4]],"solutionRegions":["aaaabccd","fffebccd","fffebccd","gggghjjj","lmiihjjj","lmiihjjj","lmiikkkk","lmiikkkk"]},{"rows":8,"cols":8,"clues":[[0,1,4],[0,4,2],[1,5,2],[1,6,6],[2,2,10],[3,4,5],[3,6,2],[4,0,3],[4,2,10],[5,6,4],[7,0,2],[7,1,2],[7,2,4],[7,4,2],[7,6,6]],"solutionRegions":["aaaabbdd","eeeeecdd","eeeeecdd","hfffffgg","hiiiiijj","hiiiiijj","klmmnooo","klmmnooo"]},{"rows":8,"cols":8,"clues":[[0,0,5],[0,3,4],[0,5,5],[2,4,3],[3,1,5],[3,4,2],[4,2,6],[4,6,10],[5,2,8],[5,7,2],[6,6,6],[7,1,2],[7,2,2],[7,6,4]],"solutionRegions":["aebbdchh","aebbdchh","aeggdchh","aeggfchh","aeggfchh","iiiikkkj","iiiikkkj","llmmnnnn"]},{"rows":8,"cols":8,"clues":[[0,7,3],[1,0,6],[1,1,6],[1,4,6],[1,6,4],[4,1,10],[5,6,10],[6,0,2],[6,4,8],[6,5,7],[7,4,2]],"solutionRegions":["bccddaaa","bccddjee","bccddjee","bffiijgg","bffiijgg","bffiijgg","hffiijgg","hffkkjgg"]},{"rows":8,"cols":8,"clues":[[0,1,3],[0,4,2],[0,7,3],[1,3,9],[1,6,9],[2,0,3],[2,4,3],[4,2,8],[5,2,5],[5,6,3],[6,3,10],[7,5,4],[7,7,2]],"solutionRegions":["aaabbccc","fdddgeee","fdddgeee","fdddgeee","hhhhhhhh","iiiiijjj","kkkkkllm","kkkkkllm"]},{"rows":8,"cols":8,"clues":[[1,1,4],[1,3,4],[1,6,6],[2,1,4],[3,0,4],[3,3,2],[3,4,4],[3,7,4],[4,0,5],[4,6,3],[6,1,8],[6,7,8],[7,1,2],[7,3,2],[7,5,4]],"solutionRegions":["eaabbccc","eaabbccc","eddfgghh","eddfgghh","iiiiijjj","kkkkllll","kkkkllll","mmnnoooo"]}],"extreme":[{"rows":10,"cols":10,"clues":[[0,7,6],[1,1,10],[1,4,6],[2,6,5],[2,8,3],[3,3,4],[3,5,5],[4,0,5],[4,8,6],[5,5,2],[5,8,3],[6,2,2],[6,3,2],[6,9,3],[7,2,6],[7,9,6],[8,1,10],[9,4,5],[9,6,8],[9,9,3]],"solutionRegions":["hbbccgdaaa","hbbccgdaaa","hbbccgdeee","hbbffgdiii","hbbffgdiii","qqlmrjjkkk","qqlmrssnnn","qqoorssppp","qqoorssppp","qqoorssttt"]},{"rows":10,"cols":10,"clues":[[0,0,4],[0,5,4],[1,9,2],[3,8,10],[4,2,8],[4,6,12],[5,1,8],[5,3,8],[5,8,4],[5,9,6],[6,1,4],[7,4,8],[7,7,2],[8,0,6],[8,4,6],[9,9,8]],"solutionRegions":["aaehlbbddc","aaehlbbddc","ggehlffddj","ggehlffddj","ggehlffddj","ggehlffiij","kkehlffiij","kkehlffmmj","nnnooopppp","nnnooopppp"]},{"rows":10,"cols":10,"clues":[[0,2,9],[0,4,6],[1,7,3],[2,8,6],[3,0,6],[3,2,3],[3,4,10],[3,6,8],[3,8,4],[3,9,2],[6,6,8],[7,2,6],[7,7,12],[8,1,4],[8,3,4],[8,4,2],[8,6,4],[9,9,3]],"solutionRegions":["aaabbhhcdd","aaabbhhcdd","aaabbhhcdd","eefgghhiij","eefggkkiij","eefggkkmmm","lllggkkmmm","lllggkkmmm","nnoopqqmmm","nnoopqqrrr"]},{"rows":10,"cols":10,"clues":[[0,1,6],[0,7,6],[1,5,2],[1,6,2],[2,6,3],[2,8,3],[3,0,8],[4,8,6],[5,2,4],[5,3,9],[5,7,4],[6,0,6],[6,4,9],[7,9,3],[8,1,3],[8,5,7],[8,8,9],[9,3,8],[9,9,2]],"solutionRegions":["aaajmcdbbb","aaajmcdbbb","ggijmpefff","ggijmpehhh","ggijmpehhh","ggijmpkkkk","llljmpqqqn","llljmpqqqn","ooojmpqqqn","rrrrrrrrss"]},{"rows":10,"cols":10,"clues":[[0,0,4],[0,7,9],[1,4,3],[2,1,4],[2,2,2],[2,3,2],[2,9,6],[3,0,3],[3,4,4],[3,9,6],[4,0,3],[4,3,3],[5,1,3],[5,7,8],[6,2,12],[7,3,4],[7,7,12],[9,5,6],[9,7,6]],"solutionRegions":["aaaacbbbgg","ddefcbbbgg","ddefcbbbgg","hhhliiiijj","kkklnnnnjj","mmmlnnnnjj","ooopqqqqqq","ooopqqqqqq","oooprrrsss","oooprrrsss"]},{"rows":10,"cols":10,"clues":[[0,9,5],[1,0,10],[1,8,5],[2,7,8],[4,2,3],[4,4,9],[4,6,2],[4,9,2],[5,3,4],[6,1,10],[6,4,2],[6,5,2],[6,9,8],[7,4,8],[7,7,3],[7,8,2],[8,0,2],[8,9,5],[9,1,2],[9,9,8]],"solutionRegions":["bbbbbaaaaa","bbbbbccccc","jjefffdddd","jjefffdddd","jjefffgghh","jjiiklmmmm","jjiiklmmmm","qnnnnooopp","qnnnnrrrrr","sstttttttt"]},{"rows":10,"cols":10,"clues":[[0,1,2],[0,5,4],[0,6,2],[1,0,6],[1,4,3],[1,9,6],[2,4,6],[2,5,3],[2,6,8],[4,8,2],[4,9,4],[5,3,6],[5,8,6],[6,2,6],[6,5,6],[7,5,4],[8,0,6],[8,2,6],[8,9,2],[9,3,8],[9,7,4]],"solutionRegions":["aabbbbcfff","ddeeehcfff","ddggghiiii","ddggghiiii","qnnlloojjk","qnnlloommk","qnnlloommk","qrrppppmmk","qrrttttuus","qrrttttuus"]},{"rows":10,"cols":10,"clues":[[0,4,2],[0,6,2],[0,8,8],[1,6,4],[2,3,4],[2,4,2],[2,5,6],[3,0,12],[4,7,3],[4,8,12],[5,4,2],[5,5,3],[5,6,3],[6,1,5],[7,0,5],[7,4,2],[8,2,10],[8,4,2],[8,5,3],[8,7,6],[9,0,4]],"solutionRegions":["hhheaabbcc","hhheddddcc","hhhefgggcc","hhhefgggcc","onqqklmijj","onqqklmijj","onqqplmijj","onqqpsttjj","onqqrsttjj","uuuursttjj"]},{"rows":10,"cols":10,"clues":[[1,1,6],[1,3,2],[1,5,8],[1,9,2],[2,1,3],[2,6,6],[2,8,2],[2,9,2],[3,1,9],[3,3,4],[3,4,6],[4,6,10],[6,6,8],[6,8,2],[7,4,6],[8,9,6],[9,0,4],[9,1,8],[9,4,6]],"solutionRegions":["aaabkccccd","aaabkccccd","eeejkfffgh","iiijkfffgh","iiijklllll","iiijklllll","qrrooommnn","qrrooommpp","qrrsssmmpp","qrrsssmmpp"]},{"rows":10,"cols":10,"clues":[[0,9,5],[1,0,2],[1,1,2],[1,6,8],[1,9,3],[2,1,2],[2,3,9],[3,1,2],[3,3,3],[3,6,4],[5,1,6],[5,3,2],[5,4,2],[5,5,8],[5,7,6],[6,1,3],[6,4,8],[7,7,6],[8,2,9],[9,6,4],[9,8,6]],"solutionRegions":["bcgggaaaaa","bcgggdddde","ffgggdddde","hhiiijjjje","kkklmnnooo","kkklmnnooo","pppqqnnrrr","sssqqnnrrr","sssqqttuuu","sssqqttuuu"]}]},"hidoku":{"easy":[{"size":4,"solution":[[15,16,3,2],[13,14,1,4],[11,12,7,5],[10,9,8,6]],"givens":[[1,2,1],[0,3,2],[1,3,4],[2,3,5],[2,2,7],[3,1,9],[3,0,10],[2,1,12],[1,1,14],[0,1,16]]},{"size":4,"solution":[[5,7,8,9],[4,6,11,10],[3,12,14,16],[2,1,13,15]],"givens":[[3,1,1],[3,0,2],[2,0,3],[1,0,4],[0,0,5],[0,1,7],[0,3,9],[2,1,12],[2,2,14],[2,3,16]]},{"size":4,"solution":[[6,7,8,11],[5,9,10,12],[4,1,13,15],[2,3,16,14]],"givens":[[2,1,1],[3,1,3],[1,0,5],[0,1,7],[0,2,8],[1,2,10],[2,2,13],[3,3,14],[3,2,16]]},{"size":4,"solution":[[6,5,4,2],[8,7,1,3],[9,12,15,14],[10,11,13,16]],"givens":[[1,2,1],[0,3,2],[0,2,4],[0,1,5],[0,0,6],[1,1,7],[3,1,11],[3,2,13],[2,3,14],[3,3,16]]},{"size":4,"solution":[[6,7,8,15],[5,9,16,14],[3,4,10,13],[2,1,11,12]],"givens":[[3,1,1],[2,0,3],[2,1,4],[0,2,8],[3,3,12],[2,3,13],[1,3,14],[1,2,16]]},{"size":4,"solution":[[2,1,5,6],[3,4,8,7],[16,13,11,9],[15,14,12,10]],"givens":[[0,1,1],[0,0,2],[1,3,7],[2,2,11],[3,2,12],[2,1,13],[3,0,15],[2,0,16]]},{"size":4,"solution":[[14,15,11,10],[16,13,12,9],[3,4,8,7],[1,2,5,6]],"givens":[[3,0,1],[3,1,2],[2,1,4],[2,3,7],[2,2,8],[0,2,11],[1,1,13],[0,1,15],[1,0,16]]},{"size":4,"solution":[[6,5,3,2],[7,8,4,1],[9,11,13,14],[10,12,15,16]],"givens":[[1,3,1],[0,2,3],[1,0,7],[2,0,9],[3,0,10],[3,1,12],[3,2,15],[3,3,16]]},{"size":4,"solution":[[5,6,8,9],[4,7,11,10],[3,12,16,15],[2,1,13,14]],"givens":[[3,1,1],[2,0,3],[1,0,4],[0,0,5],[0,1,6],[1,3,10],[2,1,12],[3,3,14],[2,2,16]]},{"size":4,"solution":[[5,4,3,2],[6,7,8,1],[15,13,12,9],[14,16,11,10]],"givens":[[1,3,1],[0,1,4],[1,0,6],[1,1,7],[2,3,9],[3,3,10],[3,2,11],[2,2,12],[3,0,14],[3,1,16]]}],"medium":[{"size":5,"solution":[[11,12,14,15,16],[10,13,20,18,17],[9,21,25,19,1],[8,22,23,24,2],[7,6,5,4,3]],"givens":[[2,4,1],[3,4,2],[4,2,5],[4,0,7],[3,0,8],[0,1,12],[0,4,16],[1,4,17],[1,3,18],[1,2,20],[2,2,25]]},{"size":5,"solution":[[6,7,9,10,11],[5,8,24,23,12],[4,19,22,25,13],[3,18,20,21,14],[2,1,17,16,15]],"givens":[[4,1,1],[3,0,3],[1,0,5],[0,1,7],[0,4,11],[2,4,13],[4,4,15],[4,3,16],[4,2,17],[3,3,21],[2,2,22],[1,3,23],[2,3,25]]},{"size":5,"solution":[[2,3,5,6,7],[1,4,11,10,8],[15,14,13,12,9],[16,19,20,22,24],[17,18,21,25,23]],"givens":[[1,0,1],[0,1,3],[0,2,5],[0,4,7],[1,4,8],[2,3,12],[2,2,13],[3,0,16],[4,0,17],[3,1,19],[3,2,20],[4,4,23],[3,4,24],[4,3,25]]},{"size":5,"solution":[[22,25,24,17,15],[21,23,18,16,14],[20,19,12,13,4],[9,10,11,5,3],[8,7,6,2,1]],"givens":[[4,4,1],[2,4,4],[3,3,5],[4,1,7],[4,0,8],[3,1,10],[2,2,12],[2,3,13],[1,3,16],[1,0,21],[0,0,22],[1,1,23],[0,1,25]]},{"size":5,"solution":[[4,3,2,19,18],[5,6,1,20,17],[7,25,23,21,16],[8,24,22,15,14],[9,10,11,12,13]],"givens":[[1,2,1],[0,1,3],[0,0,4],[1,0,5],[2,0,7],[4,0,9],[4,4,13],[3,3,15],[0,3,19],[1,3,20],[2,3,21],[2,2,23],[3,1,24],[2,1,25]]},{"size":5,"solution":[[21,20,19,3,2],[22,24,18,1,4],[25,23,17,11,5],[15,16,12,10,6],[14,13,9,8,7]],"givens":[[1,3,1],[0,3,3],[2,4,5],[3,4,6],[3,3,10],[3,0,15],[2,2,17],[0,1,20],[2,1,23],[1,1,24],[2,0,25]]},{"size":5,"solution":[[2,1,21,23,25],[3,19,20,22,24],[4,10,18,17,16],[5,9,11,15,14],[6,7,8,12,13]],"givens":[[0,1,1],[0,0,2],[3,0,5],[4,0,6],[3,1,9],[3,2,11],[4,3,12],[3,4,14],[3,3,15],[1,1,19],[1,2,20],[1,3,22],[1,4,24],[0,4,25]]},{"size":5,"solution":[[2,3,4,5,6],[1,24,22,8,7],[18,23,25,21,9],[17,19,20,13,10],[16,15,14,12,11]],"givens":[[1,0,1],[0,2,4],[1,4,7],[1,3,8],[3,4,10],[4,4,11],[4,3,12],[4,0,16],[3,0,17],[2,0,18],[3,1,19],[3,2,20],[1,1,24],[2,2,25]]},{"size":5,"solution":[[25,22,4,3,2],[21,24,23,5,1],[15,20,19,18,6],[14,16,17,10,7],[13,12,11,8,9]],"givens":[[1,4,1],[0,4,2],[0,2,4],[3,4,7],[4,4,9],[3,3,10],[3,0,14],[2,0,15],[3,2,17],[1,0,21],[1,2,23],[1,1,24],[0,0,25]]},{"size":5,"solution":[[11,12,13,14,15],[10,25,22,21,16],[9,24,23,20,17],[7,8,19,18,1],[6,5,4,3,2]],"givens":[[3,4,1],[4,0,6],[3,1,8],[2,0,9],[1,0,10],[0,2,13],[0,3,14],[0,4,15],[1,4,16],[3,3,18],[1,2,22],[2,2,23],[2,1,24],[1,1,25]]}],"hard":[{"size":6,"solution":[[11,13,14,15,19,20],[10,12,16,18,21,22],[8,9,1,17,25,23],[7,3,2,27,26,24],[4,6,28,32,33,35],[5,29,30,31,34,36]],"givens":[[2,2,1],[4,0,4],[3,0,7],[2,1,9],[1,1,12],[0,2,14],[1,2,16],[0,5,20],[1,4,21],[2,5,23],[2,4,25],[5,3,31],[4,4,33],[5,4,34],[5,5,36]]},{"size":6,"solution":[[31,34,33,36,2,3],[30,32,35,1,5,4],[29,28,27,15,7,6],[23,26,25,16,14,8],[22,24,19,17,13,9],[21,20,18,12,11,10]],"givens":[[1,3,1],[1,5,4],[2,5,6],[4,5,9],[5,5,10],[3,4,14],[4,3,17],[4,2,19],[4,1,24],[3,2,25],[2,2,27],[2,1,28],[2,0,29],[1,0,30],[0,0,31],[0,1,34],[1,2,35],[0,3,36]]},{"size":6,"solution":[[21,22,25,26,28,29],[20,23,24,27,31,30],[9,19,18,32,33,36],[8,10,11,17,35,34],[6,7,1,12,16,15],[5,4,3,2,13,14]],"givens":[[4,2,1],[5,1,4],[5,0,5],[4,1,7],[3,1,10],[4,5,15],[4,4,16],[0,1,22],[1,2,24],[0,3,26],[1,5,30],[2,3,32],[2,4,33],[3,5,34],[2,5,36]]},{"size":6,"solution":[[4,3,7,8,10,11],[5,6,2,9,13,12],[25,24,23,1,15,14],[26,31,32,22,21,16],[27,30,35,33,20,17],[28,29,34,36,19,18]],"givens":[[2,3,1],[1,2,2],[1,0,5],[1,1,6],[1,3,9],[0,5,11],[1,4,13],[2,4,15],[4,5,17],[5,4,19],[4,0,27],[5,1,29],[4,1,30],[3,2,32],[5,2,34],[4,2,35],[5,3,36]]},{"size":6,"solution":[[18,17,16,14,12,11],[19,20,23,15,13,10],[21,22,25,24,9,7],[33,34,35,26,8,6],[32,36,29,27,5,4],[31,30,28,1,2,3]],"givens":[[5,3,1],[5,5,3],[4,5,4],[3,5,6],[2,5,7],[2,4,9],[0,5,11],[1,4,13],[0,3,14],[0,0,18],[1,1,20],[2,3,24],[4,3,27],[4,2,29],[5,0,31],[3,1,34],[4,1,36]]},{"size":6,"solution":[[4,5,7,9,10,11],[3,6,8,14,13,12],[2,1,16,15,27,28],[19,18,17,26,30,29],[20,23,25,31,33,34],[21,22,24,32,36,35]],"givens":[[2,1,1],[0,0,4],[1,1,6],[1,2,8],[0,4,10],[1,5,12],[2,3,15],[3,2,17],[5,1,22],[5,2,24],[4,2,25],[2,5,28],[4,3,31],[5,5,35],[5,4,36]]},{"size":6,"solution":[[30,32,33,36,15,14],[29,31,35,34,16,13],[28,27,24,23,17,12],[26,25,22,20,18,11],[3,1,21,19,10,9],[2,4,5,6,7,8]],"givens":[[4,1,1],[4,0,3],[4,5,9],[1,5,13],[0,5,14],[2,4,17],[4,3,19],[4,2,21],[3,2,22],[3,1,25],[3,0,26],[2,0,28],[1,1,31],[1,2,35],[0,3,36]]},{"size":6,"solution":[[2,1,6,7,8,9],[3,5,24,25,10,11],[4,23,33,32,26,12],[22,36,34,31,27,13],[21,35,30,29,28,14],[20,19,18,17,16,15]],"givens":[[0,1,1],[2,0,4],[0,2,6],[0,5,9],[1,4,10],[3,5,13],[4,5,14],[5,5,15],[5,4,16],[5,3,17],[5,0,20],[2,4,26],[3,4,27],[2,3,32],[3,2,34],[4,1,35],[3,1,36]]},{"size":6,"solution":[[23,22,20,19,13,12],[24,25,21,18,14,11],[28,27,26,17,15,10],[29,30,31,16,9,8],[36,33,32,1,7,6],[34,35,2,3,4,5]],"givens":[[4,3,1],[4,5,6],[4,4,7],[3,4,9],[1,5,11],[0,4,13],[2,3,17],[1,3,18],[0,2,20],[0,0,23],[1,1,25],[2,0,28],[3,1,30],[4,2,32],[5,1,35],[4,0,36]]},{"size":6,"solution":[[32,33,34,2,3,4],[31,35,36,1,5,6],[30,29,28,16,8,7],[26,27,22,17,15,9],[25,23,21,18,14,10],[24,20,19,13,12,11]],"givens":[[1,3,1],[0,4,3],[1,4,5],[1,5,6],[2,5,7],[3,5,9],[5,3,13],[3,4,15],[2,3,16],[3,3,17],[5,1,20],[4,0,25],[3,0,26],[2,1,29],[0,0,32],[0,1,33],[1,1,35],[1,2,36]]}],"extreme":[{"size":7,"solution":[[36,37,41,42,43,1,2],[35,38,40,44,48,49,3],[34,33,39,45,46,47,4],[20,21,32,31,29,28,5],[16,19,22,30,26,27,6],[15,17,18,23,24,25,7],[14,13,12,11,10,9,8]],"givens":[[0,5,1],[0,6,2],[4,6,6],[5,6,7],[6,1,13],[5,0,15],[4,1,19],[3,1,21],[5,4,24],[5,5,25],[4,5,27],[4,3,30],[2,1,33],[2,0,34],[0,1,37],[1,1,38],[2,2,39],[0,4,43],[2,4,46],[2,5,47],[1,5,49]]},{"size":7,"solution":[[16,17,23,24,25,34,35],[15,18,22,26,33,36,37],[14,19,21,27,32,39,38],[2,13,20,28,31,40,42],[3,1,12,29,30,43,41],[4,7,10,11,47,49,44],[5,6,8,9,48,46,45]],"givens":[[4,1,1],[4,0,3],[6,1,6],[6,2,8],[5,2,10],[3,1,13],[2,0,14],[0,1,17],[1,1,18],[2,2,21],[0,3,24],[1,3,26],[4,3,29],[3,4,31],[2,4,32],[1,4,33],[1,5,36],[1,6,37],[2,5,39],[3,5,40],[3,6,42],[4,5,43],[6,4,48],[5,5,49]]},{"size":7,"solution":[[36,35,34,33,31,28,29],[37,38,41,42,32,30,27],[6,39,40,43,47,48,26],[5,7,15,44,49,46,25],[4,8,14,16,45,24,23],[3,9,12,13,17,22,21],[2,1,10,11,18,19,20]],"givens":[[6,1,1],[4,0,4],[2,0,6],[3,1,7],[5,1,9],[6,2,10],[6,3,11],[5,2,12],[4,2,14],[5,4,17],[6,4,18],[6,5,19],[5,6,21],[4,6,23],[0,5,28],[1,4,32],[0,0,36],[1,1,38],[2,2,40],[1,3,42],[3,3,44],[4,4,45],[2,4,47],[3,4,49]]},{"size":7,"solution":[[21,20,1,2,3,4,5],[22,23,19,11,10,8,6],[49,48,24,18,12,9,7],[47,46,43,25,17,13,14],[45,44,42,27,26,16,15],[40,41,37,34,28,32,30],[39,38,36,35,33,29,31]],"givens":[[0,2,1],[0,4,3],[1,5,8],[1,4,10],[3,5,13],[3,6,14],[2,3,18],[0,1,20],[0,0,21],[4,3,27],[6,5,29],[5,6,30],[5,5,32],[5,3,34],[6,2,36],[6,1,38],[6,0,39],[4,2,42],[4,1,44],[3,1,46],[2,1,48],[2,0,49]]},{"size":7,"solution":[[15,14,13,1,2,3,4],[16,17,18,12,10,6,5],[22,21,20,19,11,9,7],[23,25,26,27,41,42,8],[24,29,28,40,43,44,45],[30,33,35,37,39,47,46],[31,32,34,36,38,49,48]],"givens":[[0,3,1],[0,5,3],[0,6,4],[1,5,6],[2,4,11],[1,0,16],[1,1,17],[2,3,19],[2,2,20],[3,1,25],[3,2,26],[6,0,31],[5,1,33],[5,2,35],[5,3,37],[3,4,41],[3,5,42],[5,6,46],[5,5,47],[6,5,49]]},{"size":7,"solution":[[47,46,45,43,41,32,31],[49,48,44,42,40,33,30],[13,37,38,39,34,29,25],[12,14,36,35,28,26,24],[4,11,15,16,27,23,22],[3,5,10,9,17,20,21],[1,2,6,7,8,18,19]],"givens":[[6,0,1],[5,1,5],[6,3,7],[4,1,11],[3,0,12],[4,3,16],[5,5,20],[5,6,21],[4,5,23],[3,6,24],[3,4,28],[1,6,30],[0,5,32],[3,2,36],[2,3,39],[1,4,40],[1,3,42],[0,3,43],[0,2,45],[1,1,48],[1,0,49]]},{"size":7,"solution":[[21,22,33,34,36,37,38],[20,23,32,35,42,41,39],[19,24,31,43,49,47,40],[18,25,30,44,48,46,1],[15,17,26,29,45,8,2],[14,16,27,28,9,7,3],[13,12,11,10,6,5,4]],"givens":[[3,6,1],[5,6,3],[6,4,6],[6,2,11],[6,1,12],[5,0,14],[4,0,15],[2,0,19],[0,0,21],[1,1,23],[2,1,24],[3,1,25],[4,2,26],[5,3,28],[0,2,33],[1,3,35],[1,6,39],[1,5,41],[2,3,43],[4,4,45],[3,5,46],[3,4,48],[2,4,49]]},{"size":7,"solution":[[43,44,2,3,4,6,7],[42,49,45,1,5,9,8],[41,46,48,24,13,12,10],[39,40,47,25,23,14,11],[38,37,36,26,22,21,15],[34,35,31,29,27,20,16],[33,32,30,28,19,18,17]],"givens":[[1,3,1],[0,2,2],[1,4,5],[0,6,7],[1,6,8],[3,6,11],[3,5,14],[5,6,16],[5,5,20],[4,4,22],[3,3,25],[5,4,27],[5,3,29],[6,2,30],[5,2,31],[5,0,34],[5,1,35],[3,0,39],[3,1,40],[0,1,44],[1,2,45],[2,1,46],[1,1,49]]},{"size":7,"solution":[[30,31,33,35,36,40,41],[29,32,34,37,39,43,42],[28,27,26,2,38,44,45],[24,25,1,3,6,46,49],[23,22,4,5,7,47,48],[19,20,21,8,14,13,12],[18,17,16,15,9,10,11]],"givens":[[3,2,1],[3,3,3],[4,3,5],[6,5,10],[6,6,11],[5,6,12],[5,4,14],[5,0,19],[5,1,20],[5,2,21],[3,0,24],[2,1,27],[0,1,31],[0,2,33],[1,3,37],[1,6,42],[1,5,43],[2,6,45],[4,6,48],[3,6,49]]},{"size":7,"solution":[[12,11,8,7,6,2,3],[13,14,10,9,1,5,4],[15,17,18,19,20,21,22],[16,41,42,43,26,25,23],[40,49,46,45,44,27,24],[39,47,48,35,33,31,28],[38,37,36,34,32,30,29]],"givens":[[1,4,1],[0,5,2],[1,6,4],[0,4,6],[0,3,7],[0,2,8],[1,2,10],[1,0,13],[2,1,17],[2,2,18],[2,4,20],[2,6,22],[3,4,26],[6,6,29],[5,5,31],[5,4,33],[5,3,35],[6,2,36],[5,0,39],[3,1,41],[4,3,45],[5,2,48],[4,1,49]]}]},"sudoku_extreme":[{"solution":[[4,8,9,2,7,1,6,3,5],[2,1,7,5,6,3,9,8,4],[5,3,6,4,9,8,7,1,2],[6,4,3,9,8,2,1,5,7],[9,2,8,7,1,5,3,4,6],[7,5,1,6,3,4,8,2,9],[1,6,5,3,4,9,2,7,8],[8,7,2,1,5,6,4,9,3],[3,9,4,8,2,7,5,6,1]],"givens":[[0,1,8],[0,5,1],[0,6,6],[0,8,5],[1,0,2],[1,1,1],[1,2,7],[1,3,5],[1,4,6],[1,7,8],[1,8,4],[2,1,3],[2,3,4],[2,5,8],[2,6,7],[3,2,3],[3,4,8],[3,5,2],[3,6,1],[3,8,7],[4,2,8],[4,4,1],[4,5,5],[4,6,3],[4,7,4],[4,8,6],[5,3,6],[5,5,4],[5,6,8],[6,1,6],[6,5,9],[6,7,7],[6,8,8],[7,2,2],[7,4,5],[7,5,6],[8,0,3],[8,1,9],[8,4,2],[8,7,6],[8,8,1]]},{"solution":[[9,7,3,2,6,1,5,8,4],[1,2,6,5,4,8,7,9,3],[8,5,4,7,3,9,2,1,6],[7,4,9,3,1,2,6,5,8],[2,3,1,6,8,5,4,7,9],[5,6,8,4,9,7,3,2,1],[3,9,2,1,5,6,8,4,7],[4,8,7,9,2,3,1,6,5],[6,1,5,8,7,4,9,3,2]],"givens":[[0,2,3],[0,3,2],[0,5,1],[0,6,5],[0,7,8],[0,8,4],[1,0,1],[1,1,2],[1,3,5],[1,4,4],[1,5,8],[1,8,3],[2,1,5],[2,7,1],[3,0,7],[3,1,4],[3,4,1],[3,5,2],[3,6,6],[3,7,5],[3,8,8],[4,1,3],[4,2,1],[4,3,6],[4,4,8],[5,3,4],[5,6,3],[5,7,2],[6,2,2],[6,4,5],[6,5,6],[6,8,7],[7,0,4],[7,3,9],[7,4,2],[7,6,1],[7,8,5],[8,1,1],[8,2,5],[8,4,7],[8,5,4]]},{"solution":[[2,5,1,4,8,3,9,6,7],[8,4,3,6,9,7,2,5,1],[9,6,7,5,2,1,8,4,3],[3,9,4,2,7,6,1,8,5],[1,8,5,9,3,4,7,2,6],[7,2,6,8,1,5,3,9,4],[4,7,9,1,6,2,5,3,8],[6,1,2,3,5,8,4,7,9],[5,3,8,7,4,9,6,1,2]],"givens":[[0,0,2],[0,3,4],[0,6,9],[0,8,7],[1,2,3],[1,4,9],[1,7,5],[1,8,1],[2,2,7],[2,3,5],[2,4,2],[2,5,1],[2,6,8],[2,7,4],[3,0,3],[3,1,9],[3,3,2],[3,4,7],[3,7,8],[4,1,8],[4,3,9],[4,5,4],[4,6,7],[4,7,2],[5,2,6],[5,3,8],[5,5,5],[5,6,3],[6,0,4],[6,2,9],[6,4,6],[7,2,2],[7,5,8],[7,6,4],[7,7,7],[7,8,9],[8,0,5],[8,1,3],[8,2,8],[8,4,4],[8,8,2]]},{"solution":[[7,8,5,1,6,9,4,3,2],[2,4,3,8,5,7,1,6,9],[9,1,6,4,3,2,8,5,7],[6,2,4,7,8,3,9,1,5],[5,9,1,2,4,6,7,8,3],[3,7,8,9,1,5,2,4,6],[4,3,7,5,9,8,6,2,1],[1,6,2,3,7,4,5,9,8],[8,5,9,6,2,1,3,7,4]],"givens":[[0,0,7],[0,2,5],[0,4,6],[0,6,4],[1,1,4],[1,4,5],[1,8,9],[2,1,1],[2,3,4],[2,8,7],[3,1,2],[3,3,7],[3,4,8],[3,5,3],[3,6,9],[3,8,5],[4,0,5],[4,1,9],[4,3,2],[4,5,6],[5,0,3],[5,1,7],[5,4,1],[5,6,2],[5,7,4],[6,0,4],[6,1,3],[6,2,7],[6,3,5],[6,5,8],[6,7,2],[6,8,1],[7,0,1],[7,1,6],[7,4,7],[7,5,4],[7,8,8],[8,3,6],[8,7,7]]},{"solution":[[7,2,5,6,4,3,9,8,1],[6,3,4,1,9,8,5,2,7],[1,8,9,7,5,2,4,3,6],[8,9,7,2,6,5,1,4,3],[2,5,6,3,1,4,7,9,8],[3,4,1,8,7,9,6,5,2],[9,7,2,5,3,6,8,1,4],[4,1,8,9,2,7,3,6,5],[5,6,3,4,8,1,2,7,9]],"givens":[[0,4,4],[0,6,9],[0,7,8],[0,8,1],[1,0,6],[1,4,9],[1,5,8],[1,7,2],[2,1,8],[3,1,9],[3,3,2],[3,4,6],[3,5,5],[3,8,3],[4,1,5],[4,2,6],[4,3,3],[4,6,7],[4,7,9],[5,0,3],[5,1,4],[5,2,1],[5,5,9],[5,6,6],[5,8,2],[6,1,7],[6,2,2],[6,3,5],[6,6,8],[7,0,4],[7,1,1],[7,4,2],[7,6,3],[8,1,6],[8,2,3],[8,5,1],[8,6,2],[8,7,7]]},{"solution":[[8,6,2,9,1,3,5,7,4],[3,9,1,4,5,7,2,8,6],[7,4,5,6,2,8,1,3,9],[4,1,7,5,8,6,3,9,2],[9,2,3,1,7,4,8,6,5],[6,5,8,2,3,9,7,4,1],[2,8,9,3,4,1,6,5,7],[5,7,6,8,9,2,4,1,3],[1,3,4,7,6,5,9,2,8]],"givens":[[0,0,8],[0,3,9],[0,5,3],[0,6,5],[1,1,9],[1,2,1],[1,3,4],[1,5,7],[2,0,7],[2,1,4],[2,3,6],[2,4,2],[2,5,8],[2,7,3],[2,8,9],[3,6,3],[4,1,2],[4,7,6],[4,8,5],[5,0,6],[5,2,8],[5,4,3],[5,5,9],[5,7,4],[5,8,1],[6,4,4],[6,5,1],[6,6,6],[6,7,5],[6,8,7],[7,1,7],[7,3,8],[7,4,9],[7,7,1],[8,2,4],[8,7,2]]},{"solution":[[5,7,9,4,1,3,8,2,6],[4,3,1,2,8,6,9,5,7],[2,6,8,5,9,7,1,4,3],[9,5,6,1,7,4,3,8,2],[1,4,7,8,3,2,6,9,5],[8,2,3,9,6,5,7,1,4],[7,1,5,3,4,8,2,6,9],[3,8,4,6,2,9,5,7,1],[6,9,2,7,5,1,4,3,8]],"givens":[[0,0,5],[0,2,9],[0,6,8],[0,7,2],[1,0,4],[1,2,1],[1,4,8],[1,5,6],[1,6,9],[1,7,5],[1,8,7],[2,1,6],[2,2,8],[2,5,7],[2,8,3],[3,0,9],[3,1,5],[3,2,6],[3,3,1],[3,4,7],[3,7,8],[3,8,2],[4,1,4],[4,2,7],[4,3,8],[4,5,2],[5,1,2],[5,3,9],[5,6,7],[6,1,1],[6,2,5],[6,3,3],[6,4,4],[6,5,8],[7,2,4],[7,5,9],[7,7,7],[7,8,1],[8,1,9],[8,3,7],[8,5,1],[8,8,8]]},{"solution":[[7,4,6,2,1,8,3,5,9],[3,9,5,4,6,7,8,1,2],[8,2,1,9,5,3,7,6,4],[4,1,8,5,3,2,9,7,6],[2,5,3,6,7,9,4,8,1],[9,6,7,1,8,4,2,3,5],[1,3,2,7,9,5,6,4,8],[6,8,4,3,2,1,5,9,7],[5,7,9,8,4,6,1,2,3]],"givens":[[0,1,4],[0,4,1],[0,5,8],[0,6,3],[1,0,3],[1,5,7],[1,6,8],[1,7,1],[1,8,2],[2,0,8],[2,5,3],[2,7,6],[2,8,4],[3,3,5],[3,7,7],[4,3,6],[4,4,7],[4,5,9],[4,6,4],[4,7,8],[4,8,1],[5,0,9],[5,2,7],[5,3,1],[5,4,8],[5,8,5],[6,0,1],[6,3,7],[6,4,9],[6,6,6],[6,8,8],[7,0,6],[7,1,8],[7,3,3],[7,6,5],[8,1,7],[8,2,9],[8,3,8],[8,4,4],[8,5,6],[8,6,1],[8,7,2]]},{"solution":[[3,2,6,7,4,5,8,1,9],[7,5,4,8,1,9,3,6,2],[8,9,1,3,6,2,7,4,5],[9,1,7,2,8,6,5,3,4],[2,6,8,5,3,4,9,7,1],[5,4,3,9,7,1,2,8,6],[6,8,9,4,2,3,1,5,7],[4,3,2,1,5,7,6,9,8],[1,7,5,6,9,8,4,2,3]],"givens":[[0,1,2],[0,4,4],[0,5,5],[0,8,9],[1,0,7],[1,2,4],[1,3,8],[1,4,1],[1,5,9],[1,6,3],[2,2,1],[2,3,3],[2,5,2],[2,7,4],[3,0,9],[3,2,7],[3,6,5],[4,0,2],[4,1,6],[4,5,4],[4,6,9],[5,1,4],[5,2,3],[5,3,9],[5,4,7],[5,7,8],[6,0,6],[6,2,9],[6,3,4],[6,4,2],[6,6,1],[7,0,4],[7,4,5],[7,5,7],[7,8,8],[8,1,7],[8,3,6],[8,4,9],[8,5,8]]},{"solution":[[8,5,3,1,6,9,7,4,2],[7,4,2,5,8,3,6,1,9],[6,1,9,4,7,2,8,5,3],[2,8,4,6,3,5,9,7,1],[9,7,1,8,2,4,3,6,5],[3,6,5,7,9,1,2,8,4],[4,3,8,9,5,6,1,2,7],[1,2,7,3,4,8,5,9,6],[5,9,6,2,1,7,4,3,8]],"givens":[[0,1,5],[0,3,1],[0,4,6],[0,5,9],[0,6,7],[0,7,4],[1,0,7],[1,1,4],[1,3,5],[1,5,3],[1,7,1],[2,0,6],[2,1,1],[2,2,9],[2,3,4],[2,6,8],[3,1,8],[3,2,4],[3,3,6],[3,6,9],[4,2,1],[4,4,2],[4,7,6],[5,6,2],[5,7,8],[5,8,4],[6,1,3],[6,2,8],[6,5,6],[6,7,2],[7,0,1],[7,5,8],[7,6,5],[8,0,5],[8,1,9],[8,3,2],[8,5,7],[8,7,3]]}],"sudoku_hard":[{"solution":[[5,1,2,6,4,3],[4,3,6,2,5,1],[6,5,3,1,2,4],[2,4,1,3,6,5],[3,2,5,4,1,6],[1,6,4,5,3,2]],"givens":[[0,2,2],[1,0,4],[1,5,1],[2,0,6],[2,5,4],[3,2,1],[3,3,3],[4,1,2],[5,3,5],[5,4,3]]},{"solution":[[5,2,4,6,1,3],[1,3,6,4,5,2],[2,6,1,5,3,4],[3,4,5,1,2,6],[6,5,3,2,4,1],[4,1,2,3,6,5]],"givens":[[0,2,4],[0,4,1],[1,1,3],[2,1,6],[2,3,5],[3,3,1],[3,4,2],[4,0,6],[4,1,5],[4,3,2],[4,4,4]]},{"solution":[[4,5,3,1,6,2],[2,1,6,5,3,4],[6,4,5,2,1,3],[3,2,1,4,5,6],[5,3,2,6,4,1],[1,6,4,3,2,5]],"givens":[[0,1,5],[0,4,6],[0,5,2],[1,1,1],[2,2,5],[3,3,4],[3,5,6],[4,4,4],[5,0,1],[5,1,6]]},{"solution":[[6,2,1,3,5,4],[3,5,4,6,2,1],[4,3,2,1,6,5],[1,6,5,4,3,2],[2,4,6,5,1,3],[5,1,3,2,4,6]],"givens":[[0,0,6],[0,5,4],[1,0,3],[1,1,5],[2,4,6],[2,5,5],[3,3,4],[4,2,6],[4,3,5],[4,4,1],[5,2,3]]},{"solution":[[1,2,6,4,3,5],[4,5,3,1,6,2],[5,3,1,2,4,6],[2,6,4,5,1,3],[3,1,2,6,5,4],[6,4,5,3,2,1]],"givens":[[0,0,1],[0,2,6],[0,5,5],[1,5,2],[2,3,2],[2,5,6],[3,4,1],[4,2,2],[4,5,4],[5,0,6],[5,2,5]]},{"solution":[[3,1,4,2,6,5],[5,2,6,1,4,3],[6,3,2,5,1,4],[4,5,1,3,2,6],[1,6,5,4,3,2],[2,4,3,6,5,1]],"givens":[[0,1,1],[0,5,5],[1,4,4],[2,2,2],[2,5,4],[3,0,4],[3,1,5],[4,1,6],[4,2,5],[4,4,3],[5,5,1]]},{"solution":[[6,2,3,1,4,5],[5,4,1,3,2,6],[4,3,5,6,1,2],[2,1,6,5,3,4],[1,5,2,4,6,3],[3,6,4,2,5,1]],"givens":[[0,1,2],[1,0,5],[1,2,1],[2,0,4],[2,3,6],[2,4,1],[3,1,1],[3,5,4],[4,0,1],[4,3,4],[5,0,3],[5,4,5]]},{"solution":[[6,5,3,1,2,4],[1,2,4,6,5,3],[4,6,5,3,1,2],[3,1,2,4,6,5],[2,4,6,5,3,1],[5,3,1,2,4,6]],"givens":[[0,1,5],[0,3,1],[0,5,4],[1,1,2],[1,5,3],[2,0,4],[2,1,6],[2,2,5],[4,0,2],[4,1,4],[4,3,5],[5,2,1]]},{"solution":[[4,1,6,3,5,2],[5,2,3,6,4,1],[6,5,2,1,3,4],[3,4,1,2,6,5],[1,6,5,4,2,3],[2,3,4,5,1,6]],"givens":[[0,0,4],[0,2,6],[1,1,2],[1,2,3],[2,0,6],[2,3,1],[2,5,4],[3,5,5],[4,3,4],[4,5,3],[5,0,2],[5,1,3]]},{"solution":[[5,1,2,6,3,4],[6,3,4,5,1,2],[2,6,3,4,5,1],[4,5,1,2,6,3],[1,2,6,3,4,5],[3,4,5,1,2,6]],"givens":[[0,0,5],[0,4,3],[1,2,4],[2,3,4],[2,4,5],[3,3,2],[3,4,6],[3,5,3],[4,0,1],[4,1,2],[4,2,6],[5,0,3]]}]};

const SUDOKU_MEDIUM = SUDOKU_LEVELS.map((l, i) => makeLevel("sudoku", "medium", i + 1, { ...l, description: "Ein mittleres 6×6 Sudoku mit den Zahlen 1 bis 6." }));
const SUDOKU_HARD = CURATED_LEVEL_DATA.sudoku_hard.map((level, index) => makeLevel("sudoku", "hard", index + 1, {
  ...level,
  size: 6,
  boxRows: 2,
  boxCols: 3,
  description: "Ein schweres 6×6 Sudoku mit sorgfältig ausgewählten Startzahlen.",
}));

const SUDOKU_EXTREME = CURATED_LEVEL_DATA.sudoku_extreme.map((level, index) => makeLevel("sudoku", "extreme", index + 1, {
  ...level,
  size: 9,
  boxRows: 3,
  boxCols: 3,
  description: "Ein extremes, aber kindgerechtes 9×9 Sudoku mit den Zahlen 1 bis 9.",
}));


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

const KAKURO_EASY_SOLUTIONS = [
  [
    [0, 0, 0, 0],
    [0, 1, 2, 0],
    [0, 3, 4, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 3, 0],
    [0, 2, 4, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 2, 3, 0],
    [0, 4, 5, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 4, 0],
    [0, 3, 5, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 2, 4, 0],
    [0, 5, 7, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 3, 4, 0],
    [0, 5, 6, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 4, 5, 0],
    [0, 6, 7, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 2, 5, 0],
    [0, 6, 8, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 3, 6, 0],
    [0, 7, 9, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 4, 7, 0],
    [0, 8, 9, 0],
    [0, 0, 0, 0],
  ],
];

const KAKURO_OLD_EASY_SOLUTION = [
  [0, 0, 0, 0, 0],
  [0, 6, 3, 0, 0],
  [0, 8, 4, 6, 9],
  [0, 0, 7, 4, 2],
  [0, 0, 0, 1, 5],
];

const KAKURO_OLD_MEDIUM_SOLUTION = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 6, 2, 0, 0, 5, 7],
  [0, 2, 5, 0, 6, 8, 1],
  [0, 0, 1, 8, 3, 0, 0],
  [0, 0, 0, 4, 9, 3, 0],
  [0, 3, 9, 6, 0, 2, 8],
  [0, 9, 3, 0, 0, 1, 3],
];

const KAKURO_DIGIT_VARIANTS = [
  null,
  { 1: 2, 2: 4, 3: 6, 4: 8, 5: 1, 6: 3, 7: 5, 8: 7, 9: 9 },
  { 1: 3, 2: 6, 3: 9, 4: 2, 5: 5, 6: 8, 7: 1, 8: 4, 9: 7 },
  { 1: 4, 2: 8, 3: 3, 4: 7, 5: 2, 6: 6, 7: 1, 8: 5, 9: 9 },
  { 1: 5, 2: 1, 3: 6, 4: 2, 5: 7, 6: 3, 7: 8, 8: 4, 9: 9 },
  { 1: 6, 2: 3, 3: 9, 4: 5, 5: 2, 6: 8, 7: 4, 8: 1, 9: 7 },
  { 1: 7, 2: 5, 3: 3, 4: 1, 5: 8, 6: 6, 7: 4, 8: 2, 9: 9 },
  { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1, 9: 9 },
  { 1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3, 8: 2, 9: 1 },
  { 1: 1, 2: 4, 3: 7, 4: 3, 5: 6, 6: 9, 7: 2, 8: 5, 9: 8 },
];

function remapKakuroSolution(solution, digitMap) {
  if (!digitMap) return solution.map((row) => [...row]);
  return solution.map((row) => row.map((value) => digitMap[value] || value));
}

const KAKURO_LEVELS = [
  ...KAKURO_EASY_SOLUTIONS.map((solution, index) => makeKakuroLevel(
    "easy",
    index + 1,
    solution,
    "Ein sehr leichtes Kakuro mit nur vier Feldern und kurzen Zweier-Summen.",
  )),
  ...KAKURO_DIGIT_VARIANTS.map((digitMap, index) => makeKakuroLevel(
    "medium",
    index + 1,
    remapKakuroSolution(KAKURO_OLD_EASY_SOLUTION, digitMap),
    "Ein mittleres Kakuro im Schwierigkeitsgrad der bisherigen leichten Vorlage.",
  )),
  ...KAKURO_DIGIT_VARIANTS.map((digitMap, index) => makeKakuroLevel(
    "hard",
    index + 1,
    remapKakuroSolution(KAKURO_OLD_MEDIUM_SOLUTION, digitMap),
    "Ein schweres Kakuro im Schwierigkeitsgrad der bisherigen mittleren Vorlage.",
  )),
  ...KAKURO_DIGIT_VARIANTS.map((digitMap, index) => makeKakuroLevel(
    "extreme",
    index + 1,
    remapKakuroSolution(KAKURO_OLD_MEDIUM_SOLUTION, digitMap),
    "Ein extremes Kakuro mit grossen Feldern und anspruchsvollen Summen.",
  )),
];

function bimaruGivens(solution) {
  const shipCells = [];
  for (let r = 0; r < solution.length; r += 1) for (let c = 0; c < solution.length; c += 1) if (solution[r][c]) shipCells.push([r, c, "ship"]);
  const count = solution.length <= 6 ? 2 : 3;
  return Array.from({ length: count }, (_, index) => shipCells[Math.floor(((index + 1) * shipCells.length) / (count + 1))]).filter(Boolean);
}
function sea(lines, fleet) {
  const solution = gridFromStrings(lines, "1");
  return { solution, ...counts(solution), fleet, givens: bimaruGivens(solution), size: solution.length };
}
const BIMARU_LEVEL_COUNTS = { easy: 0, medium: 0, hard: 0, extreme: 0 };
const BIMARU_LEVELS = [
  ["easy", sea(["01100","00001","00100","00000","01101"], {"1":3,"2":2})],
  ["easy", sea(["01101","00000","00001","00100","10100"], {"1":3,"2":2})],
  ["easy", sea(["00000","01101","00000","00100","10101"], {"1":3,"2":2})],
  ["easy", sea(["10101","00000","00000","11001","00001"], {"1":3,"2":2})],
  ["easy", sea(["00001","01101","00000","10100","00001"], {"1":3,"2":2})],
  ["easy", sea(["00001","01000","01000","00001","10101"], {"1":3,"2":2})],
  ["easy", sea(["00001","01000","00001","01000","01011"], {"1":3,"2":2})],
  ["easy", sea(["10110","10000","00000","10001","00100"], {"1":3,"2":2})],
  ["easy", sea(["00001","10100","00001","11001","00000"], {"1":3,"2":2})],
  ["easy", sea(["10101","00000","00001","01101","00000"], {"1":3,"2":2})],

  ["medium", sea(["101000","000010","011010","000000","111010","000000"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["010000","000101","110100","000101","000001","001000"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["010010","000010","101010","000000","010010","010010"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["011010","000000","111001","000000","011000","000010"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["101001","001000","100010","000010","011010","000000"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["010110","000000","110000","000010","001010","100010"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["000000","000111","100000","101011","000000","001010"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["100101","000100","000100","010001","010101","000000"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["110101","000000","010010","010010","010000","000100"], {"1":3,"2":2,"3":1})],
  ["medium", sea(["010010","000010","101000","000000","110111","000000"], {"1":3,"2":2,"3":1})],

  ["hard", sea(["10001010","00001000","00100000","00000111","11000000","00010000","00000110","01110000"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["00000000","00000111","11000000","00001001","10001000","00101000","10000011","10010000"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["00001011","00100000","10000000","10001110","00100000","00000000","10101110","10000000"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["00000001","10011100","10000000","00101110","10100000","00000101","00000100","01000000"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["00000001","11100000","00000000","01100110","00000000","10101110","00000000","11000001"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["10100000","10100100","10000100","00000100","00010001","11000000","00000000","11010001"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["00011001","11000001","00000001","01110000","00000000","00000001","10010100","10000001"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["01101010","00000000","00000000","11101110","00000000","00001101","01100000","00000010"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["00101000","00000001","00000100","11010000","00010110","10000000","10011100","10000000"], {"1":4,"2":3,"3":2})],
  ["hard", sea(["00001101","10100000","00001101","00000001","01110100","00000100","00000100","10000000"], {"1":4,"2":3,"3":2})],

  ["extreme", sea(["001000000","101011100","000000000","101001001","101001000","101000010","001000010","100000000","000100000"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["010000000","000010001","111000101","000000100","100000000","001111000","000000001","110000000","000011100"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["100100000","000000010","111100010","000000010","111001000","000000000","000000001","000010101","011000100"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["111000110","000000000","010000001","010010000","010000000","000000000","111100101","000000000","011000110"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["000010010","010010000","010000100","010010101","000010100","000000101","100000000","100000010","100001010"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["100100111","000100000","000000101","000010000","010010011","010000000","010000000","010111010","000000000"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["010000000","000111011","110000000","000010000","000000000","000000111","111100000","000000000","010001101"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["000010000","101010000","100010001","101010001","000000000","110001010","000000010","001110000","000000001"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["011100100","000000000","001000011","100010000","000010001","101010000","101000000","000011110","000000000"], {"1":4,"2":3,"3":2,"4":1})],
  ["extreme", sea(["000010000","010010100","000000000","111001000","000000010","001110000","100000001","101111001","000000000"], {"1":4,"2":3,"3":2,"4":1})],
].map(([difficulty, data]) => {
  BIMARU_LEVEL_COUNTS[difficulty] += 1;
  return makeLevel("bimaru", difficulty, BIMARU_LEVEL_COUNTS[difficulty], { ...data, description: "Bestimme die Positionen der Schiffe im Raster." });
});
const HIDOKU_DESCRIPTIONS = {
  easy: "Ein leichtes 4×4 Hidoku mit den Zahlen 1 bis 16.",
  medium: "Ein mittleres 5×5 Hidoku mit den Zahlen 1 bis 25.",
  hard: "Ein schweres 6×6 Hidoku mit den Zahlen 1 bis 36.",
  extreme: "Ein extremes 7×7 Hidoku mit den Zahlen 1 bis 49.",
};

const HIDOKU_LEVELS = DIFFICULTY_KEYS.flatMap((difficulty) =>
  CURATED_LEVEL_DATA.hidoku[difficulty].map((level, index) => makeLevel("hidoku", difficulty, index + 1, {
    ...level,
    description: HIDOKU_DESCRIPTIONS[difficulty],
  }))
);

function makeShikakuLevel(difficulty, index, title, rows, cols, clues, solutionRegions) {
  const code = DIFFICULTIES[difficulty].code;
  return makeLevel("shikaku", difficulty, index, {
    id: `G ${code}-${index}`,
    title,
    rows,
    cols,
    size: cols,
    clues,
    solutionRegions,
    description: "Baue für jedes Tier ein Gehege mit genau der richtigen Grösse.",
  });
}

const SHIKAKU_LEVEL_TITLES = {
  easy: ["Kleine Wiese", "Bunte Koppel", "Hasenpfad", "Froschteich", "Waldwiese", "Sonnenacker", "Panda-Park", "Tierfreunde", "Kleine Safari", "Bauernhof"],
  medium: ["Tiergarten", "Waldlichtung", "Sonnenweide", "Bärenwald", "Affeninsel", "Fuchsbau", "Löwenpark", "Dschungelweg", "Bergweide", "Tierdorf"],
  hard: ["Grosser Park", "Safari", "Abenteuer-Weide", "Regenwald", "Savannenpfad", "Wildnis", "Dschungelcamp", "Bergzoo", "Tierparadies", "Entdeckerland"],
  extreme: ["Riesen-Safari", "Dschungel-Labyrinth", "Grosser Tierpark", "Expedition", "Savannen-Abenteuer", "Wildnis-Profi", "Zoo-Meisterstück", "Regenwald-Profi", "Tierwelt", "Gehege-Champion"],
};

const SHIKAKU_LEVELS = DIFFICULTY_KEYS.flatMap((difficulty) =>
  CURATED_LEVEL_DATA.shikaku[difficulty].map((level, index) => {
    const levelNumber = index + 1;
    const code = DIFFICULTIES[difficulty].code;
    return makeShikakuLevel(
      difficulty,
      levelNumber,
      `G ${code}-${levelNumber} · ${SHIKAKU_LEVEL_TITLES[difficulty][index]}`,
      level.rows,
      level.cols,
      level.clues.map(([row, col, value]) => ({ row, col, value })),
      level.solutionRegions.map((row) => [...row]),
    );
  })
);

const MATH_DIFFICULTY_RULES = {
  easy: { max: 10, operators: ["+"], optionCount: 3, missing: { result: 1 } },
  medium: { max: 10, operators: ["+", "-"], optionCount: 3, missing: { result: 1 } },
  hard: { max: 20, operators: ["+", "-"], optionCount: 4, missing: { result: 0.75, left: 0.125, right: 0.125 } },
  extreme: { max: 20, operators: ["-"], optionCount: 4, missing: { result: 0.5, left: 0.25, right: 0.25 } },
};

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickRandom(items) { return items[randomInt(0, items.length - 1)]; }
function shuffleOptions(values) {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function pickWeighted(weights) {
  const entries = Object.entries(weights);
  const roll = Math.random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = 0;
  for (const [value, weight] of entries) {
    cursor += weight;
    if (roll <= cursor) return value;
  }
  return entries.at(-1)[0];
}
function ensureUniqueOptions(correctAnswer, candidates, optionCount, min = 0, max = 20) {
  const options = [correctAnswer];
  const add = (value) => {
    if (options.length >= optionCount) return;
    if (!Number.isInteger(value) || value < min || value > max || options.includes(value)) return;
    options.push(value);
  };
  candidates.forEach(add);
  for (let distance = 1; options.length < optionCount && distance <= max + 4; distance += 1) {
    add(correctAnswer - distance);
    add(correctAnswer + distance);
  }
  while (options.length < optionCount) add(randomInt(min, max));
  return shuffleOptions(options);
}
function mathCorrectAnswer(left, right, result, missingPosition) {
  if (missingPosition === "left") return left;
  if (missingPosition === "right") return right;
  return result;
}
function mathQuestionText(task) {
  const left = task.missingPosition === "left" ? "?" : task.left;
  const right = task.missingPosition === "right" ? "?" : task.right;
  const result = task.missingPosition === "result" ? "?" : task.result;
  return `${left} ${task.operator} ${right} = ${result}`;
}
function mathDistractorCandidates(task) {
  const correct = task.correctAnswer;
  const candidates = [correct - 2, correct - 1, correct + 1, correct + 2, correct + 3, correct - 3];
  if (task.operator === "+") {
    candidates.push(Math.abs(task.left - task.right), task.result + 10, Math.max(task.left, task.right));
  } else {
    candidates.push(task.left + task.right, Math.abs(task.right - task.left), task.result + task.right - 1);
  }
  return candidates;
}
function generateMathOperands(difficulty, operator) {
  const max = MATH_DIFFICULTY_RULES[difficulty].max;
  if (operator === "+") {
    let left = randomInt(0, max);
    let right = randomInt(0, max);
    while (left + right > max) {
      left = randomInt(0, max);
      right = randomInt(0, max);
    }
    return { left, right, result: left + right };
  }
  const left = randomInt(0, max);
  const right = randomInt(0, left);
  return { left, right, result: left - right };
}
function generateMathTask(difficulty) {
  const safeDifficulty = MATH_DIFFICULTY_RULES[difficulty] ? difficulty : "easy";
  const rules = MATH_DIFFICULTY_RULES[safeDifficulty];
  const operator = pickRandom(rules.operators);
  const operands = generateMathOperands(safeDifficulty, operator);
  const missingPosition = pickWeighted(rules.missing);
  const correctAnswer = mathCorrectAnswer(operands.left, operands.right, operands.result, missingPosition);
  const task = {
    id: `math-${safeDifficulty}-${Date.now()}-${randomInt(1000, 9999)}`,
    puzzleType: "mathPuzzle",
    difficulty: safeDifficulty,
    operator,
    left: operands.left,
    right: operands.right,
    result: operands.result,
    missingPosition,
    correctAnswer,
  };
  task.questionText = mathQuestionText(task);
  task.options = ensureUniqueOptions(correctAnswer, mathDistractorCandidates(task), rules.optionCount, 0, rules.max);
  return validateMathTask(task) ? task : generateMathTask(safeDifficulty);
}
function validateMathTask(task) {
  const rules = MATH_DIFFICULTY_RULES[task.difficulty];
  if (!rules || !rules.operators.includes(task.operator)) return false;
  if (task.left < 0 || task.right < 0 || task.result < 0) return false;
  if (task.left > rules.max || task.right > rules.max || task.result > rules.max) return false;
  if (task.operator === "+" && task.left + task.right !== task.result) return false;
  if (task.operator === "-" && task.left - task.right !== task.result) return false;
  if (task.correctAnswer !== mathCorrectAnswer(task.left, task.right, task.result, task.missingPosition)) return false;
  if (task.options.length !== rules.optionCount || new Set(task.options).size !== task.options.length) return false;
  return task.options.filter((option) => option === task.correctAnswer).length === 1;
}
function mathTaskKey(task) {
  return [task.puzzleType, task.difficulty, task.operator, task.left, task.right, task.result, task.missingPosition].join(":");
}

const SEQUENCE_ITEMS = [
  { id: "e1", seq: [2, 4, 6, 8, null], answer: 10, diff: "easy" },
  { id: "e2", seq: [10, 20, 30, 40, null], answer: 50, diff: "easy" },
  { id: "e3", seq: [5, 10, 15, 20, null], answer: 25, diff: "easy" },
  { id: "e4", seq: [12, 14, 16, 18, null], answer: 20, diff: "easy" },
  { id: "e5", seq: [30, 40, 50, 60, null], answer: 70, diff: "easy" },
  { id: "e6", seq: [25, 30, 35, 40, null], answer: 45, diff: "easy" },
  { id: "e7", seq: [8, 10, 12, 14, null], answer: 16, diff: "easy" },
  { id: "e8", seq: [50, 60, 70, 80, null], answer: 90, diff: "easy" },
  { id: "e9", seq: [45, 50, 55, 60, null], answer: 65, diff: "easy" },
  { id: "e10", seq: [18, 20, 22, 24, null], answer: 26, diff: "easy" },
  { id: "e11", seq: [40, 50, 60, 70, null], answer: 80, diff: "easy" },
  { id: "e12", seq: [15, 20, 25, 30, null], answer: 35, diff: "easy" },
  { id: "m1", seq: [3, 6, 9, 12, null], answer: 15, diff: "medium" },
  { id: "m2", seq: [4, 8, 12, 16, null], answer: 20, diff: "medium" },
  { id: "m3", seq: [20, 18, 16, 14, null], answer: 12, diff: "medium" },
  { id: "m4", seq: [1, 5, 9, 13, null], answer: 17, diff: "medium" },
  { id: "m5", seq: [5, 8, 11, 14, null], answer: 17, diff: "medium" },
  { id: "m6", seq: [15, 12, 9, 6, null], answer: 3, diff: "medium" },
  { id: "m7", seq: [7, 10, null, 16, 19], answer: 13, diff: "medium" },
  { id: "m8", seq: [null, 22, 33, 44, 55], answer: 11, diff: "medium" },
  { id: "m9", seq: [30, null, 20, 15, 10], answer: 25, diff: "medium" },
  { id: "m10", seq: [12, 16, 20, 24, null], answer: 28, diff: "medium" },
  { id: "m11", seq: [24, 21, 18, 15, null], answer: 12, diff: "medium" },
  { id: "m12", seq: [2, 5, 8, 11, null], answer: 14, diff: "medium" },
  { id: "h1", seq: [13, 23, 33, 43, null], answer: 53, diff: "hard" },
  { id: "h2", seq: [88, 78, 68, 58, null], answer: 48, diff: "hard" },
  { id: "h3", seq: [2, 4, 8, 16, null], answer: 32, diff: "hard" },
  { id: "h4", seq: [95, 100, 105, 110, null], answer: 115, diff: "hard" },
  { id: "h5", seq: [null, 17, 27, 37, 47], answer: 7, diff: "hard" },
  { id: "h6", seq: [100, 75, 50, 25, null], answer: 0, diff: "hard" },
  { id: "h7", seq: [5, 10, 20, 40, null], answer: 80, diff: "hard" },
  { id: "h8", seq: [98, 96, 94, 92, null], answer: 90, diff: "hard" },
  { id: "h9", seq: [24, 34, 44, 54, null], answer: 64, diff: "hard" },
  { id: "h10", seq: [111, 222, 333, 444, null], answer: 555, diff: "hard" },
  { id: "h11", seq: [42, 40, 38, 36, null], answer: 34, diff: "hard" },
  { id: "h12", seq: [200, 150, 100, 50, null], answer: 0, diff: "hard" },
  { id: "x1", seq: [7, 14, 21, 28, null], answer: 35, diff: "extreme" },
  { id: "x2", seq: [8, 16, 24, 32, null], answer: 40, diff: "extreme" },
  { id: "x3", seq: [9, 18, 27, 36, null], answer: 45, diff: "extreme" },
  { id: "x4", seq: [6, 12, 18, 24, null], answer: 30, diff: "extreme" },
  { id: "x5", seq: [1, 3, 6, 10, null], answer: 15, diff: "extreme" },
  { id: "x6", seq: [1, 4, 9, 16, null], answer: 25, diff: "extreme" },
  { id: "x7", seq: [50, 45, null, 35, 30], answer: 40, diff: "extreme" },
  { id: "x8", seq: [30, 27, 24, 21, null], answer: 18, diff: "extreme" },
  { id: "x9", seq: [99, 88, 77, 66, null], answer: 55, diff: "extreme" },
  { id: "x10", seq: [null, 7, 14, 21, 28], answer: 0, diff: "extreme" },
  { id: "x11", seq: [3, 9, 27, 81, null], answer: 243, diff: "extreme" },
  { id: "x12", seq: [144, 122, 100, 78, null], answer: 56, diff: "extreme" },
];
function generateSequenceTask(difficulty) {
  const safeDifficulty = DIFFICULTIES[difficulty] ? difficulty : "easy";
  const pool = SEQUENCE_ITEMS.filter((item) => item.diff === safeDifficulty);
  const item = pickRandom(pool);
  const optionCount = safeDifficulty === "easy" || safeDifficulty === "medium" ? 3 : 4;
  const candidates = [
    item.answer - 1, item.answer + 1,
    item.answer - 2, item.answer + 2,
    item.answer - 10, item.answer + 10,
    item.answer - 5, item.answer + 5,
  ];
  return {
    id: `seq-${safeDifficulty}-${item.id}-${Date.now()}-${randomInt(1000, 9999)}`,
    sourceId: item.id,
    puzzleType: "sequencePuzzle",
    difficulty: safeDifficulty,
    sequence: item.seq,
    correctAnswer: item.answer,
    options: ensureUniqueOptions(item.answer, candidates, optionCount, 0, 999),
  };
}
function sequenceTaskKey(task) {
  return [task.puzzleType, task.difficulty, task.sourceId || task.id].join(":");
}

const SHAPE_POOL = ["🔴", "🔵", "🟡", "🟢", "🟥", "🟦", "🟨", "🟩", "🔺", "🔻", "⭐", "🌙", "☀️", "☁️", "💖", "🔶", "🔷"];

const SHAPE_SEQUENCE_ITEMS = [
  { id: "e1", seq: ["🔴", "🔵", "🔴", "🔵", null], answer: "🔴", diff: "easy" },
  { id: "e2", seq: ["🟩", "🟩", "🟡", "🟡", null], answer: "🟩", diff: "easy" },
  { id: "e3", seq: ["🔺", "⭐", "🔺", "⭐", null], answer: "🔺", diff: "easy" },
  { id: "e4", seq: ["🟦", "🔴", "🟡", "🟦", null], answer: "🔴", diff: "easy" },
  { id: "e5", seq: ["⭐", "🌙", "⭐", "🌙", null], answer: "⭐", diff: "easy" },
  { id: "e6", seq: ["💖", "🟩", "💖", "🟩", null], answer: "💖", diff: "easy" },
  { id: "e7", seq: ["🔵", "🔵", "🔴", "🔵", null], answer: "🔵", diff: "easy" },
  { id: "e8", seq: ["🔺", "🔻", "🔺", "🔻", null], answer: "🔺", diff: "easy" },
  { id: "e9", seq: ["🟡", "🟩", "🔵", "🟡", null], answer: "🟩", diff: "easy" },
  { id: "e10", seq: ["🟥", "🟦", "🟥", "🟦", null], answer: "🟥", diff: "easy" },
  { id: "e11", seq: ["🔴", "🔴", "🔵", "🔴", null], answer: "🔴", diff: "easy" },
  { id: "e12", seq: ["🔶", "🔷", "🔶", "🔷", null], answer: "🔶", diff: "easy" },

  { id: "m1", seq: ["🔴", "🟦", "🟡", "🔴", "🟦", null], answer: "🟡", diff: "medium" },
  { id: "m2", seq: ["⭐", "🌙", "☁️", "⭐", "🌙", null], answer: "☁️", diff: "medium" },
  { id: "m3", seq: ["🔺", "🔴", "🔺", "🟦", "🔺", null], answer: "🔴", diff: "medium" },
  { id: "m4", seq: ["🟩", "🟡", "🟡", "🟩", "🟡", null], answer: "🟡", diff: "medium" },
  { id: "m5", seq: ["🔴", "🔴", "🟦", "🟦", "🟡", null], answer: "🟡", diff: "medium" },
  { id: "m6", seq: ["💖", "⭐", "💖", "🌙", "💖", null], answer: "⭐", diff: "medium" },
  { id: "m7", seq: ["🔵", "🔺", "🟩", "🔵", "🔺", null], answer: "🟩", diff: "medium" },
  { id: "m8", seq: ["🟨", "🟨", "🟥", "🟨", "🟨", null], answer: "🟥", diff: "medium" },
  { id: "m9", seq: ["🔻", "🔺", "⭐", "🔻", "🔺", null], answer: "⭐", diff: "medium" },
  { id: "m10", seq: ["🔴", "🟩", "🔵", "🟡", "🔴", null], answer: "🟩", diff: "medium" },
  { id: "m11", seq: ["🔶", "🔷", "🔶", "🔷", "🔶", null], answer: "🔷", diff: "medium" },
  { id: "m12", seq: ["🌙", "☀️", "☁️", "🌙", "☀️", null], answer: "☁️", diff: "medium" },

  { id: "h1", seq: ["🔴", "🟦", "🟦", "🔴", "🟦", null], answer: "🟦", diff: "hard" },
  { id: "h2", seq: ["⭐", "🔺", "🟩", "⭐", "🔺", null], answer: "🟩", diff: "hard" },
  { id: "h3", seq: ["🔴", "🟡", "🟢", "🔵", "🔴", null], answer: "🟡", diff: "hard" },
  { id: "h4", seq: ["🟩", "🟥", "🟩", "🟥", "🟥", null], answer: "🟩", diff: "hard" },
  { id: "h5", seq: ["🔵", "🔵", "🔴", "🔵", "🔵", null], answer: "🔴", diff: "hard" },
  { id: "h6", seq: ["🔺", "🔻", "🔻", "🔺", "🔻", null], answer: "🔻", diff: "hard" },
  { id: "h7", seq: ["⭐", "🌙", "☀️", "☁️", "⭐", null], answer: "🌙", diff: "hard" },
  { id: "h8", seq: ["💖", "💖", "🔵", "💖", "💖", null], answer: "🔵", diff: "hard" },
  { id: "h9", seq: ["🔴", "🔴", "🔴", "🟦", "🔴", null], answer: "🔴", diff: "hard" },
  { id: "h10", seq: ["🟨", "🟩", "🟦", "🟨", "🟩", null], answer: "🟦", diff: "hard" },
  { id: "h11", seq: ["🔶", "🔶", "🔷", "🔶", "🔶", null], answer: "🔷", diff: "hard" },
  { id: "h12", seq: ["☀️", "☁️", "☁️", "☀️", "☁️", null], answer: "☁️", diff: "hard" },

  { id: "x1", seq: ["🔴", "🟥", "🔵", "🟦", "🟡", null], answer: "🟨", diff: "extreme" },
  { id: "x2", seq: ["🟢", "🟩", "🔴", "🟥", "🔵", null], answer: "🟦", diff: "extreme" },
  { id: "x3", seq: ["🔴", "🔵", "🔴", "🔴", "🔵", null], answer: "🔴", diff: "extreme" },
  { id: "x4", seq: ["🔺", "⭐", "🔺", "🔺", "⭐", null], answer: "🔺", diff: "extreme" },
  { id: "x5", seq: ["🟥", "🟨", "🟩", "🟦", "🟥", null], answer: "🟨", diff: "extreme" },
  { id: "x6", seq: ["🌙", "⭐", "☀️", "🌙", "⭐", null], answer: "☀️", diff: "extreme" },
  { id: "x7", seq: ["🟡", "🟨", "🔴", "🟥", "🟢", null], answer: "🟩", diff: "extreme" },
  { id: "x8", seq: ["🔵", "🔵", "🔵", "🔴", "🔵", null], answer: "🔵", diff: "extreme" },
  { id: "x9", seq: ["🔻", "🔺", "🔻", "🔻", "🔺", null], answer: "🔻", diff: "extreme" },
  { id: "x10", seq: ["💖", "🔶", "🔷", "💖", "🔶", null], answer: "🔷", diff: "extreme" },
  { id: "x11", seq: ["🟩", "🟢", "🟦", "🔵", "🟥", null], answer: "🔴", diff: "extreme" },
  { id: "x12", seq: ["🟨", "🟡", "🟩", "🟢", "🟦", null], answer: "🔵", diff: "extreme" },
];

function generateShapeSequenceTask(difficulty) {
  const safeDifficulty = DIFFICULTIES[difficulty] ? difficulty : "easy";
  const pool = SHAPE_SEQUENCE_ITEMS.filter((item) => item.diff === safeDifficulty);
  const item = pickRandom(pool);
  const optionCount = safeDifficulty === "easy" || safeDifficulty === "medium" ? 3 : 4;
  const availableDistractors = shuffleOptions(SHAPE_POOL.filter((shape) => shape !== item.answer));
  const options = shuffleOptions([item.answer, ...availableDistractors].slice(0, optionCount));

  return {
    id: `shapes-${safeDifficulty}-${item.id}-${Date.now()}-${randomInt(1000, 9999)}`,
    sourceId: item.id,
    puzzleType: "shapeSequencePuzzle",
    difficulty: safeDifficulty,
    sequence: item.seq,
    correctAnswer: item.answer,
    options,
  };
}
function shapeSequenceTaskKey(task) {
  return [task.puzzleType, task.difficulty, task.sourceId || task.id].join(":");
}

function wordItem(id, word, article, imageKey, difficulty, category, syllables, allowedTaskTypes) {
  return { id, word, displayWord: word, article, imageKey, difficulty, category, syllables, allowedTaskTypes };
}
const READING_WORD_ITEMS = [
  wordItem("apfel", "APFEL", "der", "apple", "easy", "food", ["AP", "FEL"], ["missingLetter", "chooseWord", "sentenceMissingWord"]),
  wordItem("ball", "BALL", "der", "ball", "easy", "toy", ["BALL"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("hund", "HUND", "der", "dog", "easy", "animal", ["HUND"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("auto", "AUTO", "das", "car", "easy", "thing", ["AU", "TO"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("haus", "HAUS", "das", "house", "easy", "place", ["HAUS"], ["missingLetter", "chooseWord"]),
  wordItem("buch", "BUCH", "das", "book", "easy", "thing", ["BUCH"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("baum", "BAUM", "der", "tree", "easy", "nature", ["BAUM"], ["missingLetter", "chooseWord"]),
  wordItem("fisch", "FISCH", "der", "fish", "easy", "animal", ["FISCH"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("mond", "MOND", "der", "moon", "easy", "nature", ["MOND"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("sonne", "SONNE", "die", "sun", "easy", "nature", ["SON", "NE"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("katze", "KATZE", "die", "cat", "medium", "animal", ["KAT", "ZE"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("blume", "BLUME", "die", "flower", "medium", "nature", ["BLU", "ME"], ["missingLetter", "chooseWord"]),
  wordItem("tasse", "TASSE", "die", "cup", "medium", "thing", ["TAS", "SE"], ["missingLetter", "chooseWord"]),
  wordItem("vogel", "VOGEL", "der", "bird", "medium", "animal", ["VO", "GEL"], ["missingLetter", "chooseWord", "sentenceMatch"]),
  wordItem("wolke", "WOLKE", "die", "cloud", "medium", "nature", ["WOL", "KE"], ["missingLetter", "chooseWord"]),
  wordItem("kerze", "KERZE", "die", "candle", "medium", "thing", ["KER", "ZE"], ["missingLetter", "chooseWord"]),
  wordItem("gabel", "GABEL", "die", "fork", "medium", "thing", ["GA", "BEL"], ["missingLetter", "chooseWord"]),
  wordItem("schuh", "SCHUH", "der", "shoe", "medium", "thing", ["SCHUH"], ["missingLetter", "chooseWord"]),
  wordItem("puppe", "PUPPE", "die", "doll", "medium", "toy", ["PUP", "PE"], ["missingLetter", "chooseWord"]),
  wordItem("nase", "NASE", "die", "nose", "medium", "body", ["NA", "SE"], ["missingLetter", "chooseWord"]),
  wordItem("banane", "BANANE", "die", "banana", "hard", "food", ["BA", "NA", "NE"], ["missingLetter", "missingSyllable", "chooseWord"]),
  wordItem("tomate", "TOMATE", "die", "tomato", "hard", "food", ["TO", "MA", "TE"], ["missingLetter", "missingSyllable", "chooseWord"]),
  wordItem("schule", "SCHULE", "die", "school", "hard", "place", ["SCHU", "LE"], ["missingLetter", "missingSyllable", "chooseWord"]),
  wordItem("flasche", "FLASCHE", "die", "bottle", "hard", "thing", ["FLA", "SCHE"], ["missingLetter", "missingSyllable", "chooseWord"]),
  wordItem("brille", "BRILLE", "die", "glasses", "hard", "thing", ["BRIL", "LE"], ["missingLetter", "missingSyllable", "chooseWord"]),
  wordItem("teller", "TELLER", "der", "plate", "hard", "thing", ["TEL", "LER"], ["missingLetter", "missingSyllable", "chooseWord"]),
  wordItem("rakete", "RAKETE", "die", "rocket", "hard", "thing", ["RA", "KE", "TE"], ["missingLetter", "missingSyllable", "chooseWord"]),
  wordItem("krokodil", "KROKODIL", "das", "crocodile", "hard", "animal", ["KRO", "KO", "DIL"], ["missingSyllable", "chooseWord"]),
  wordItem("schmetterling", "SCHMETTERLING", "der", "butterfly", "hard", "animal", ["SCHMET", "TER", "LING"], ["missingSyllable", "chooseWord"]),
  wordItem("elefant", "ELEFANT", "der", "elephant", "hard", "animal", ["E", "LE", "FANT"], ["missingLetter", "missingSyllable", "chooseWord"]),
];
const READING_IMAGE_MAP = {
  apple: "🍎", ball: "⚽", dog: "🐶", car: "🚗", house: "🏠", book: "📕", tree: "🌳", fish: "🐟", moon: "🌙", sun: "☀️",
  cat: "🐱", flower: "🌼", cup: "☕", bird: "🐦", cloud: "☁️", candle: "🕯️", fork: "🍴", shoe: "👟", doll: "🧸", nose: "👃",
  banana: "🍌", tomato: "🍅", school: "🏫", bottle: "🍼", glasses: "👓", plate: "🍽️", rocket: "🚀", crocodile: "🐊", butterfly: "🦋", elephant: "🐘",
  dog_running: "🐕", cat_sleeping: "🐈", bird_flying: "🐦", child_eating: "🧒🍎", red_book: "📕",
};
const READING_EXTRA_DISTRACTORS = ["HAND", "HASE", "SOCKE", "SUPPE", "FROSCH", "FLUG", "BOOT", "BIRNE", "LAMPE", "MAMA", "PAPA", "KIND", "BETT", "TISCH"];
const READING_DIFFICULTY_RANK = { easy: 1, medium: 2, hard: 3, extreme: 4 };
const READING_TASK_TYPES = {
  easy: ["missingLetter"],
  medium: ["chooseWord"],
  hard: ["missingLetter", "missingSyllable", "chooseWord"],
  extreme: ["sentenceMatch", "sentenceMissingWord"],
};
const READING_SENTENCE_ITEMS = [
  { id: "hund-rennt", sentence: "Der Hund rennt.", imageKey: "dog_running", correctWordIds: ["hund"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "katze-schlaeft", sentence: "Die Katze schläft.", imageKey: "cat_sleeping", correctWordIds: ["katze"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "auto-faehrt", sentence: "Das Auto fährt.", imageKey: "car", correctWordIds: ["auto"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "fisch-schwimmt", sentence: "Der Fisch schwimmt.", imageKey: "fish", correctWordIds: ["fisch"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "vogel-fliegt", sentence: "Der Vogel fliegt.", imageKey: "bird_flying", correctWordIds: ["vogel"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "sonne-scheint", sentence: "Die Sonne scheint.", imageKey: "sun", correctWordIds: ["sonne"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "ball-rollt", sentence: "Der Ball rollt.", imageKey: "ball", correctWordIds: ["ball"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "kind-isst", sentence: "Das Kind isst.", imageKey: "child_eating", correctWordIds: [], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "buch-rot", sentence: "Das Buch ist rot.", imageKey: "red_book", correctWordIds: ["buch"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "mond-hell", sentence: "Der Mond ist hell.", imageKey: "moon", correctWordIds: ["mond"], difficulty: "extreme", taskTypes: ["sentenceMatch"] },
  { id: "kind-isst-apfel", sentence: "Das Kind isst einen Apfel.", prompt: "Das Kind isst einen ___.", imageKey: "child_eating", correctWordId: "apfel", difficulty: "extreme", taskTypes: ["sentenceMissingWord"] },
  { id: "hund-frisst", sentence: "Der Hund frisst.", prompt: "Der ___ frisst.", imageKey: "dog", correctWordId: "hund", difficulty: "extreme", taskTypes: ["sentenceMissingWord"] },
  { id: "ball-ist-rot", sentence: "Der Ball ist rot.", prompt: "Der ___ ist rot.", imageKey: "ball", correctWordId: "ball", difficulty: "extreme", taskTypes: ["sentenceMissingWord"] },
  { id: "buch-ist-rot", sentence: "Das Buch ist rot.", prompt: "Das ___ ist rot.", imageKey: "red_book", correctWordId: "buch", difficulty: "extreme", taskTypes: ["sentenceMissingWord"] },
];

function titleCaseWord(word) { return word.charAt(0) + word.slice(1).toLowerCase(); }
function wordsForReadingDifficulty(difficulty) {
  const rank = READING_DIFFICULTY_RANK[difficulty] || 1;
  return READING_WORD_ITEMS.filter((item) => READING_DIFFICULTY_RANK[item.difficulty] <= rank);
}
function ensureUniqueTextOptions(correctAnswer, candidates, optionCount) {
  const options = [correctAnswer];
  candidates.forEach((candidate) => {
    if (candidate && candidate !== correctAnswer && !options.includes(candidate)) options.push(candidate);
  });
  while (options.length < optionCount) {
    const candidate = pickRandom([...READING_WORD_ITEMS.map((item) => item.word), ...READING_EXTRA_DISTRACTORS]);
    if (candidate !== correctAnswer && !options.includes(candidate)) options.push(candidate);
  }
  return shuffleOptions(options.slice(0, optionCount));
}
function readingOptionCount(difficulty) { return difficulty === "easy" || difficulty === "medium" ? 3 : 4; }
function missingLetterIndexes(item, difficulty) {
  const letters = [...item.word];
  if (difficulty === "easy") return letters.map((_, index) => index).filter((index) => index > 0 && index < letters.length - 1);
  return letters.map((_, index) => index).filter((index) => index > 0);
}
function generateMissingLetterTask(difficulty) {
  const pool = wordsForReadingDifficulty(difficulty)
    .filter((item) => item.allowedTaskTypes.includes("missingLetter"))
    .filter((item) => difficulty !== "easy" || item.word.length <= 5);
  const item = pickRandom(pool);
  const letters = [...item.word];
  const missingIndex = pickRandom(missingLetterIndexes(item, difficulty));
  const correctAnswer = letters[missingIndex];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ".split("");
  const candidates = [
    letters[missingIndex - 1],
    letters[missingIndex + 1],
    ...READING_EXTRA_DISTRACTORS.join("").split(""),
    ...alphabet,
  ].filter((letter) => letter && letter !== correctAnswer);
  return {
    id: `reading-${difficulty}-letter-${Date.now()}-${randomInt(1000, 9999)}`,
    puzzleType: "readingPuzzle",
    difficulty,
    taskType: "missingLetter",
    imageKey: item.imageKey,
    prompt: "Welcher Buchstabe fehlt?",
    displayText: letters.map((letter, index) => index === missingIndex ? "_" : letter).join(" "),
    options: ensureUniqueTextOptions(correctAnswer, candidates, readingOptionCount(difficulty)),
    correctAnswer,
    wordId: item.id,
    fullText: item.word,
    missingIndex,
  };
}
function chooseWordDistractors(item, difficulty, optionCount) {
  const pool = wordsForReadingDifficulty(difficulty)
    .filter((candidate) => candidate.id !== item.id && candidate.imageKey !== item.imageKey)
    .sort((a, b) => {
      const aScore = (a.word[0] === item.word[0] ? 2 : 0) + (a.category === item.category ? 1 : 0);
      const bScore = (b.word[0] === item.word[0] ? 2 : 0) + (b.category === item.category ? 1 : 0);
      return bScore - aScore || Math.random() - 0.5;
    })
    .map((candidate) => candidate.word);
  const extras = READING_EXTRA_DISTRACTORS.filter((word) => word !== item.word).sort((a, b) => {
    const aScore = a[0] === item.word[0] ? 1 : 0;
    const bScore = b[0] === item.word[0] ? 1 : 0;
    return bScore - aScore || Math.random() - 0.5;
  });
  return [...pool, ...extras].slice(0, optionCount + 4);
}
function generateChooseWordTask(difficulty) {
  const pool = wordsForReadingDifficulty(difficulty).filter((item) => item.allowedTaskTypes.includes("chooseWord"));
  const item = pickRandom(pool);
  const optionCount = readingOptionCount(difficulty);
  return {
    id: `reading-${difficulty}-word-${Date.now()}-${randomInt(1000, 9999)}`,
    puzzleType: "readingPuzzle",
    difficulty,
    taskType: "chooseWord",
    imageKey: item.imageKey,
    prompt: "Welches Wort passt zum Bild?",
    displayText: "",
    options: ensureUniqueTextOptions(item.word, chooseWordDistractors(item, difficulty, optionCount), optionCount),
    correctAnswer: item.word,
    wordId: item.id,
    fullText: item.word,
  };
}
function generateMissingSyllableTask(difficulty) {
  const pool = wordsForReadingDifficulty("hard")
    .filter((item) => item.allowedTaskTypes.includes("missingSyllable") && item.syllables.length > 1);
  const item = pickRandom(pool);
  const missingIndex = item.syllables.length > 2 ? 1 : item.syllables.length - 1;
  const correctAnswer = item.syllables[missingIndex];
  const candidates = READING_WORD_ITEMS.flatMap((word) => word.syllables).filter((syllable) => syllable !== correctAnswer);
  return {
    id: `reading-${difficulty}-syllable-${Date.now()}-${randomInt(1000, 9999)}`,
    puzzleType: "readingPuzzle",
    difficulty,
    taskType: "missingSyllable",
    imageKey: item.imageKey,
    prompt: "Welcher Wortteil fehlt?",
    displayText: item.syllables.map((syllable, index) => index === missingIndex ? "_" : syllable).join(" "),
    options: ensureUniqueTextOptions(correctAnswer, candidates, 4),
    correctAnswer,
    wordId: item.id,
    fullText: item.word,
    missingIndex,
  };
}
function generateSentenceMatchTask(difficulty) {
  const item = pickRandom(READING_SENTENCE_ITEMS.filter((sentence) => sentence.taskTypes.includes("sentenceMatch")));
  const candidates = READING_SENTENCE_ITEMS
    .filter((sentence) => sentence.id !== item.id && sentence.taskTypes.includes("sentenceMatch"))
    .map((sentence) => sentence.sentence);
  return {
    id: `reading-${difficulty}-sentence-${Date.now()}-${randomInt(1000, 9999)}`,
    puzzleType: "readingPuzzle",
    difficulty,
    taskType: "sentenceMatch",
    imageKey: item.imageKey,
    prompt: "Welcher Satz passt zum Bild?",
    displayText: "",
    options: ensureUniqueTextOptions(item.sentence, candidates, 4),
    correctAnswer: item.sentence,
    sentenceId: item.id,
    fullText: item.sentence,
  };
}
function generateSentenceMissingWordTask(difficulty) {
  const item = pickRandom(READING_SENTENCE_ITEMS.filter((sentence) => sentence.taskTypes.includes("sentenceMissingWord")));
  const word = READING_WORD_ITEMS.find((candidate) => candidate.id === item.correctWordId);
  const correctAnswer = titleCaseWord(word.word);
  const candidates = READING_WORD_ITEMS
    .filter((candidate) => candidate.id !== word.id)
    .map((candidate) => titleCaseWord(candidate.word));
  return {
    id: `reading-${difficulty}-missing-word-${Date.now()}-${randomInt(1000, 9999)}`,
    puzzleType: "readingPuzzle",
    difficulty,
    taskType: "sentenceMissingWord",
    imageKey: item.imageKey,
    prompt: "Welches Wort fehlt?",
    displayText: item.prompt,
    options: ensureUniqueTextOptions(correctAnswer, candidates, 4),
    correctAnswer,
    wordId: word.id,
    sentenceId: item.id,
    fullText: item.sentence,
  };
}
function generateReadingTask(difficulty, taskType = null) {
  const safeDifficulty = READING_TASK_TYPES[difficulty] ? difficulty : "easy";
  const allowedTypes = READING_TASK_TYPES[safeDifficulty];
  const type = allowedTypes.includes(taskType) ? taskType : pickRandom(allowedTypes);
  const task = type === "missingLetter" ? generateMissingLetterTask(safeDifficulty)
    : type === "chooseWord" ? generateChooseWordTask(safeDifficulty)
    : type === "missingSyllable" ? generateMissingSyllableTask(safeDifficulty)
    : type === "sentenceMissingWord" ? generateSentenceMissingWordTask(safeDifficulty)
    : generateSentenceMatchTask(safeDifficulty);
  return validateReadingTask(task) ? task : generateReadingTask(safeDifficulty, taskType);
}
function validateReadingTask(task) {
  if (!task.imageKey || !task.prompt || !task.correctAnswer) return false;
  if (!Array.isArray(task.options) || task.options.length < 3 || new Set(task.options).size !== task.options.length) return false;
  if (task.options.filter((option) => option === task.correctAnswer).length !== 1) return false;
  if (task.taskType === "missingLetter" && task.displayText.split(" ").filter((part) => part === "_").length !== 1) return false;
  if (task.taskType === "missingSyllable" && task.displayText.split(" ").filter((part) => part === "_").length !== 1) return false;
  return true;
}
function readingTaskKey(task) {
  if (task.taskType === "missingLetter" || task.taskType === "missingSyllable") return [task.puzzleType, task.difficulty, task.taskType, task.wordId, task.missingIndex].join(":");
  if (task.taskType === "chooseWord") return [task.puzzleType, task.difficulty, task.taskType, task.wordId].join(":");
  return [task.puzzleType, task.difficulty, task.taskType, task.sentenceId].join(":");
}
function practiceTaskKey(task) {
  if (task.puzzleType === "shapeSequencePuzzle") return shapeSequenceTaskKey(task);
  if (task.puzzleType === "sequencePuzzle") return sequenceTaskKey(task);
  return task.puzzleType === "mathPuzzle" ? mathTaskKey(task) : readingTaskKey(task);
}
function generateUniquePracticeTask(taskFactory, difficulty, usedKeys = []) {
  const used = new Set(usedKeys);
  let fallback = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const task = taskFactory(difficulty);
    const key = practiceTaskKey(task);
    task.practiceKey = key;
    if (!used.has(key)) return task;
    fallback = fallback || task;
  }
  return fallback || taskFactory(difficulty);
}

const MATH_LEVEL_DESCRIPTIONS = {
  easy: "Plusaufgaben von 0 bis 10 mit drei Antwortmöglichkeiten.",
  medium: "Plus und Minus bis 10, immer ohne negative Ergebnisse.",
  hard: "Plus und Minus bis 20, manchmal fehlt ein Teil der Aufgabe.",
  extreme: "Minusaufgaben bis 20 mit mehr fehlenden Zahlen und vier Antworten.",
};
const READING_LEVEL_DESCRIPTIONS = {
  easy: "Bild und Wort mit einem fehlenden Buchstaben.",
  medium: "Bild ansehen und das passende Wort auswählen.",
  hard: "Längere Wörter mit fehlendem Buchstaben oder fehlender Silbe.",
  extreme: "Kurze Sätze lesen oder ein fehlendes Wort ergänzen.",
};
const SEQUENCE_LEVEL_DESCRIPTIONS = {
  easy: "Zahlenreihen in 2er-, 5er- und 10er-Schritten vorwärts.",
  medium: "3er- und 4er-Schritte, Lücken in der Mitte und rückwärts zählen.",
  hard: "Übergang über 100, Verdoppeln und 10er-Sprünge ab ungeraden Zahlen.",
  extreme: "Große Sprünge, das große Einmaleins und verrückte Muster.",
};
const SHAPE_SEQUENCE_LEVEL_DESCRIPTIONS = {
  easy: "Einfache Muster wie ABAB oder AABB.",
  medium: "Längere Muster mit 3 oder 4 verschiedenen Figuren.",
  hard: "Muster, bei denen sich die Anzahl der Figuren verändert.",
  extreme: "Wechsel von Farben und Formen. Schau ganz genau hin!",
};
function makePracticeLevels(game, descriptions) {
  return DIFFICULTY_KEYS.flatMap((difficulty) =>
    Array.from({ length: LEVELS_PER_DIFFICULTY }, (_, index) => makeLevel(game, difficulty, index + 1, {
      targetCount: 10,
      badge: "10 Aufgaben",
      description: descriptions[difficulty],
    }))
  );
}
const MATH_LEVELS = makePracticeLevels("mathPuzzle", MATH_LEVEL_DESCRIPTIONS);
const READING_LEVELS = makePracticeLevels("readingPuzzle", READING_LEVEL_DESCRIPTIONS);
const SEQUENCE_LEVELS = makePracticeLevels("sequencePuzzle", SEQUENCE_LEVEL_DESCRIPTIONS);
const SHAPE_SEQUENCE_LEVELS = makePracticeLevels("shapeSequencePuzzle", SHAPE_SEQUENCE_LEVEL_DESCRIPTIONS);

if (typeof window !== "undefined") {
  window.LernappPuzzleGenerators = {
    generateMathTask,
    generateReadingTask,
    generateSequenceTask,
    generateShapeSequenceTask,
    validateMathTask,
    validateReadingTask,
    ensureUniqueOptions,
    shuffleOptions,
    readingWords: READING_WORD_ITEMS,
    readingSentences: READING_SENTENCE_ITEMS,
    sequenceItems: SEQUENCE_ITEMS,
    shapeSequenceItems: SHAPE_SEQUENCE_ITEMS,
    shapePool: SHAPE_POOL,
  };
}

function normalizeLevelCounts(levels) {
  return DIFFICULTY_KEYS.flatMap((difficulty) => levels
    .filter((level) => level.difficulty === difficulty)
    .slice(0, LEVELS_PER_DIFFICULTY));
}

const LEVELS_BY_GAME = {
  arukone: normalizeLevelCounts(ARUKONE_LEVELS),
  sudoku: normalizeLevelCounts([...SUDOKU_EASY, ...SUDOKU_MEDIUM, ...SUDOKU_HARD, ...SUDOKU_EXTREME]),
  bimaru: normalizeLevelCounts(BIMARU_LEVELS),
  kakuro: normalizeLevelCounts(KAKURO_LEVELS),
  hidoku: normalizeLevelCounts(HIDOKU_LEVELS),
  shikaku: normalizeLevelCounts(SHIKAKU_LEVELS),
  mathPuzzle: normalizeLevelCounts(MATH_LEVELS),
  readingPuzzle: normalizeLevelCounts(READING_LEVELS),
  sequencePuzzle: normalizeLevelCounts(SEQUENCE_LEVELS),
  shapeSequencePuzzle: normalizeLevelCounts(SHAPE_SEQUENCE_LEVELS),
  backpack: normalizeLevelCounts(BACKPACK_LEVELS),
};

function publicLevelInfo(level) {
  return {
    id: level.id || level.levelName,
    game: level.game,
    difficulty: level.difficulty,
    levelName: level.levelName,
    title: level.title,
    size: level.size || null,
    rows: level.rows || null,
    cols: level.cols || null,
    badge: level.badge || null,
  };
}

window.LernappLevelCatalog = Object.fromEntries(
  Object.entries(LEVELS_BY_GAME).map(([game, levels]) => [game, levels.map(publicLevelInfo)])
);
window.LernappFirebase?.registerLevels?.(window.LernappLevelCatalog);

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
const hintButton = document.querySelector("#hint-button");
const backButton = document.querySelector("#back-button");
let successOverlay = document.querySelector("#success-overlay");
let successRestartButton = document.querySelector("#success-restart-button");
let nextPuzzleButton = document.querySelector("#next-puzzle-button");
let successStars = document.querySelector("#success-stars");
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
let shikakuDrag = null;
let hidokuDrag = null;
let backpackTimer = null;
let practiceAdvanceTimer = null;
let starTimer = null;
let starTimerStartedAt = 0;
let starTimerBestTier = 3;
let starTimerElement = null;
let ignoreNextHidokuClick = false;
let ignoreNextShikakuClick = false;
let activeMoveSnapshot = null;
let pushedActiveSnapshot = false;
const BIMARU_LONG_PRESS_MS = 480;
const LOCAL_SOLVED_PREFIX = "lernapp.solved.";
const LOCAL_STARS_PREFIX = "lernapp.stars.";
const MAX_STARS = 3;
const TIMED_STAR_GAMES = new Set(["arukone", "bimaru", "kakuro", "shikaku", "hidoku", "sudoku"]);
const PRACTICE_GAMES = new Set(["mathPuzzle", "readingPuzzle", "sequencePuzzle", "shapeSequencePuzzle"]);
const TIMED_STAR_LIMITS = { three: 30, two: 60 };

function progressKey(game, levelId) { return `${LOCAL_SOLVED_PREFIX}${game}.${levelId}`; }
function starsKey(game, levelId) { return `${LOCAL_STARS_PREFIX}${game}.${levelId}`; }
function cloudProgress() { return window.LernappFirebase || null; }
function isSignedIn() { return Boolean(cloudProgress()?.isSignedIn?.()); }
function normalizeStars(value, fallback = 0) {
  const stars = Number(value);
  if (!Number.isFinite(stars)) return fallback;
  return Math.max(0, Math.min(MAX_STARS, Math.floor(stars)));
}
function isSolved(level) {
  if (isSignedIn()) return Boolean(cloudProgress()?.isLevelSolved?.(level));
  return localStorage.getItem(progressKey(level.game, level.id || level.levelName)) === "1";
}
function localLevelStars(level) {
  const id = level.id || level.levelName;
  const saved = normalizeStars(localStorage.getItem(starsKey(level.game, id)));
  if (saved) return saved;
  return isSolved(level) ? 1 : 0;
}
function levelStars(level) {
  if (!level) return 0;
  if (isSignedIn()) return normalizeStars(cloudProgress()?.levelStars?.(level), isSolved(level) ? 1 : 0);
  return localLevelStars(level);
}
function markSolved(level, result = {}) {
  const id = level.id || level.levelName;
  const resultData = typeof result === "number" ? { stars: result } : (result || {});
  const stars = normalizeStars(resultData.stars, 1) || 1;
  if (!isSignedIn()) {
    localStorage.setItem(progressKey(level.game, id), "1");
    localStorage.setItem(starsKey(level.game, id), String(Math.max(localLevelStars(level), stars)));
  }
  cloudProgress()?.recordSolve?.(level, { ...resultData, stars });
}
function recordMoveMetric() { cloudProgress()?.recordMove?.(); }
function recordResetMetric() { cloudProgress()?.recordReset?.(currentLevel()); }
function recordHintMetric() { cloudProgress()?.recordHint?.(currentLevel()); }
function refreshProgressView() {
  if (!currentGame || !levelPanel || document.body.classList.contains("puzzle-active")) return;
  if (selectedDifficulty) renderLevelSelect();
  else renderDifficultySelect();
}
window.LernappRefreshProgress = refreshProgressView;
function currentLevel() { return LEVELS_BY_GAME[currentGame][currentIndex]; }
function setStatus(message) { if (statusText) statusText.textContent = message || ""; }
function fillList(element, items) { if (!element) return; element.innerHTML = ""; items.forEach((text) => { const li = document.createElement("li"); li.textContent = text; element.append(li); }); }
function snapshot() { return { state: clone(state), winShown }; }
function restore(snap) { state = clone(snap.state); winShown = snap.winShown; hideSuccess(); render(); }
function pushHistory() { if (activeMoveSnapshot) { if (!pushedActiveSnapshot) { history.push(activeMoveSnapshot); pushedActiveSnapshot = true; recordMoveMetric(); } } else { history.push(snapshot()); recordMoveMetric(); } if (undoButton) undoButton.disabled = false; }
function beginMove() { activeMoveSnapshot = snapshot(); pushedActiveSnapshot = false; }
function finishMove() { activeMoveSnapshot = null; pushedActiveSnapshot = false; }

function levelsForDifficulty(difficulty) { return LEVELS_BY_GAME[currentGame].filter((level) => level.difficulty === difficulty); }
function countSolved(levels) { return levels.filter((level) => isSolved(level)).length; }
function levelId(level) { return level?.id || level?.levelId || level?.levelName || ""; }
function levelIndex(level) {
  const levels = LEVELS_BY_GAME[level?.game] || [];
  const id = levelId(level);
  return levels.findIndex((candidate) => levelId(candidate) === id);
}
function isUnlockedModeEnabled() {
  return Boolean(isSignedIn() && cloudProgress()?.isUnlockedModeEnabled?.());
}
function isLevelUnlocked(level) {
  if (!level) return false;
  if (isUnlockedModeEnabled()) return true;
  const levels = LEVELS_BY_GAME[level.game] || [];
  const index = levelIndex(level);
  if (index === 0 && level.difficulty === "easy") return true;
  if (index < 0) return false;
  return isSolved(level) || isSolved(levels[index - 1]);
}
function countUnlocked(levels) { return levels.filter((level) => isLevelUnlocked(level)).length; }
function nextPlayableLevel(level) {
  const levels = LEVELS_BY_GAME[level?.game] || [];
  const next = levels[levelIndex(level) + 1];
  return next && isLevelUnlocked(next) ? next : null;
}
function starLabel(stars) { return `${stars} ${stars === 1 ? "Stern" : "Sterne"}`; }
function starsMarkup(stars) {
  const earned = normalizeStars(stars);
  return Array.from({ length: MAX_STARS }, (_, index) => `<span class="${index < earned ? "filled" : "empty"}">★</span>`).join("");
}
function levelStarsMarkup(stars) {
  return `<span class="level-stars stars-${normalizeStars(stars)}" aria-hidden="true">${starsMarkup(stars)}</span>`;
}
function isTimedStarGame(game = currentGame) { return TIMED_STAR_GAMES.has(game); }
function formatTimerSeconds(seconds) {
  const value = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
function timedStarsForElapsed(seconds) {
  if (seconds <= TIMED_STAR_LIMITS.three) return 3;
  if (seconds <= TIMED_STAR_LIMITS.two) return 2;
  return 1;
}
function starTimerElapsedSeconds() {
  return starTimerStartedAt ? Math.max(0, (Date.now() - starTimerStartedAt) / 1000) : 0;
}
function ensureStarTimerElement() {
  if (starTimerElement) return starTimerElement;
  const gameCard = document.querySelector(".game-card");
  const statusRow = document.querySelector(".status-row");
  if (!gameCard || !statusRow) return null;
  starTimerElement = document.createElement("div");
  starTimerElement.id = "star-timer";
  starTimerElement.className = "star-timer hidden";
  starTimerElement.setAttribute("role", "status");
  starTimerElement.setAttribute("aria-live", "polite");
  starTimerElement.innerHTML = `
    <div class="star-timer-top">
      <span class="star-timer-stars" aria-hidden="true"></span>
      <strong class="star-timer-label"></strong>
      <span class="star-timer-time"></span>
    </div>
    <div class="star-timer-track" aria-hidden="true"><span></span></div>
  `;
  statusRow.after(starTimerElement);
  return starTimerElement;
}
function updateStarTimer() {
  const element = ensureStarTimerElement();
  if (!element || !isTimedStarGame()) return;
  const elapsed = starTimerElapsedSeconds();
  const stars = timedStarsForElapsed(elapsed);
  const tierStart = stars === 3 ? 0 : (stars === 2 ? TIMED_STAR_LIMITS.three : TIMED_STAR_LIMITS.two);
  const tierEnd = stars === 3 ? TIMED_STAR_LIMITS.three : (stars === 2 ? TIMED_STAR_LIMITS.two : null);
  const remaining = tierEnd ? Math.max(0, tierEnd - elapsed) : elapsed;
  const progress = tierEnd ? Math.max(0, Math.min(1, (tierEnd - elapsed) / (tierEnd - tierStart))) : 0;
  element.className = `star-timer tier-${stars}`;
  element.querySelector(".star-timer-stars").innerHTML = starsMarkup(stars);
  element.querySelector(".star-timer-label").textContent = `${starLabel(stars)} erreichbar`;
  element.querySelector(".star-timer-time").textContent = tierEnd ? formatTimerSeconds(remaining) : formatTimerSeconds(elapsed);
  element.querySelector(".star-timer-track span").style.width = `${Math.round(progress * 100)}%`;
  element.setAttribute("aria-label", `${starLabel(stars)} erreichbar`);
  if (stars < starTimerBestTier) {
    starTimerBestTier = stars;
    element.classList.add("tier-dropped");
  }
}
function startStarTimer(level) {
  stopStarTimer();
  if (!level || !isTimedStarGame(level.game)) {
    ensureStarTimerElement()?.classList.add("hidden");
    return;
  }
  starTimerStartedAt = Date.now();
  starTimerBestTier = 3;
  ensureStarTimerElement()?.classList.remove("hidden");
  updateStarTimer();
  starTimer = window.setInterval(updateStarTimer, 250);
}
function stopStarTimer({ hide = false } = {}) {
  if (starTimer) window.clearInterval(starTimer);
  starTimer = null;
  if (hide) ensureStarTimerElement()?.classList.add("hidden");
}
function currentTimedStars() {
  if (!isTimedStarGame()) return 0;
  return timedStarsForElapsed(starTimerElapsedSeconds());
}
function practiceStars(level, practiceState = state) {
  const target = level.targetCount || 10;
  const flawless = Number(practiceState.flawlessCount || 0);
  if (flawless >= target) return 3;
  if (flawless >= Math.ceil(target * 0.8)) return 2;
  return 1;
}
function backpackStars(best) {
  if (Number(best || 0) >= 8) return 3;
  if (Number(best || 0) >= 4) return 2;
  return 1;
}
function currentLevelStars() {
  const level = currentLevel();
  if (!level) return 1;
  if (isTimedStarGame()) return currentTimedStars() || 1;
  if (PRACTICE_GAMES.has(currentGame)) return practiceStars(level);
  if (currentGame === "backpack") return backpackStars(state.best);
  return 1;
}
function currentSolveResult(stars = currentLevelStars()) {
  const result = { stars };
  if (isTimedStarGame()) result.elapsedSeconds = Math.round(starTimerElapsedSeconds());
  if (PRACTICE_GAMES.has(currentGame)) {
    result.flawless = Number(state.flawlessCount || 0);
    result.correct = Number(state.correctCount || 0);
    result.target = currentLevel().targetCount || 10;
  }
  if (currentGame === "backpack") result.best = Number(state.best || 0);
  return result;
}
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
  levelHeading.textContent = "Schwierigkeit wählen";
  if (appIntro) appIntro.textContent = "";
  levelDescription.textContent = "";
  levelDescription.hidden = true;
  fillList(rulesList, config.rules);
  renderSelectionActions("difficulty");
  levelGrid.className = "difficulty-grid";
  levelGrid.setAttribute("aria-label", "Schwierigkeitsgrad auswählen");
  levelGrid.innerHTML = "";
  DIFFICULTY_KEYS.forEach((difficulty) => {
    const info = DIFFICULTIES[difficulty];
    const levels = levelsForDifficulty(difficulty);
    const solved = countSolved(levels);
    const unlocked = countUnlocked(levels);
    const button = document.createElement("button");
    button.className = `difficulty-card ${difficulty}${unlocked ? "" : " locked"}`;
    button.type = "button";
    button.disabled = unlocked === 0;
    button.setAttribute("aria-label", `${info.label} waehlen, ${levels.length} Levels, ${solved} geloest, ${unlocked} frei`);
    button.innerHTML = `
      <span class="difficulty-icon" aria-hidden="true">${info.icon}</span>
      <span class="difficulty-name">${info.label}</span>
      <small>${solved} geloest · ${unlocked}/${levels.length} frei</small>
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
  levelHeading.textContent = `${difficulty.label} Levels`;
  if (appIntro) appIntro.textContent = "";
  levelDescription.hidden = false;
  levelDescription.textContent = `Du hast ${difficulty.label} gewaehlt. Such dir jetzt ein freies Level aus.${isUnlockedModeEnabled() ? " Der freie Modus ist aktiv." : ""}`;
  fillList(rulesList, config.rules);
  renderSelectionActions("levels");
  levelGrid.className = "level-grid";
  levelGrid.setAttribute("aria-label", `${config.title} ${difficulty.label} Levels`);
  levelGrid.innerHTML = "";
  levelsForDifficulty(selectedDifficulty).forEach((level) => {
    const index = LEVELS_BY_GAME[currentGame].indexOf(level);
    const solved = isSolved(level);
    const stars = levelStars(level);
    const unlocked = isLevelUnlocked(level);
    const detail = level.badge || (level.size ? `${level.size}×${level.size}` : (level.rows && level.cols ? `${level.rows}×${level.cols}` : "Rätsel"));
    const button = document.createElement("button");
    button.className = `level-tile ${selectedDifficulty}${solved ? " solved" : ""}${stars ? " starred" : ""}${unlocked ? "" : " locked"}`;
    button.type = "button";
    button.disabled = !unlocked;
    button.setAttribute("aria-label", `${level.title}${stars ? `, ${starLabel(stars)}` : (solved ? ", geloest" : "")}${unlocked ? "" : ", gesperrt"}`);
    button.innerHTML = `
      <span class="level-name">${level.levelName}</span>
      <small${unlocked ? "" : " class=\"lock-icon\" aria-hidden=\"true\""}>${stars ? `${stars}/3 Sterne` : (solved ? "geloest" : (unlocked ? detail : "🔒"))}</small>
      ${stars ? levelStarsMarkup(stars) : ""}
    `;
    button.addEventListener("click", () => startLevel(index));
    levelGrid.append(button);
  });
}
function showLevelSelect() { finishMove(); stopStarTimer({ hide: true }); clearPracticeAdvanceTimer(); if (currentGame === "backpack") clearBackpackTimer(); cloudProgress()?.flushCurrentSession?.({ close: true, includeElapsed: true }); hideSuccess(); if (levelPanel) levelPanel.hidden = false; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = true; if (gameControls) gameControls.hidden = true; document.body.classList.remove("puzzle-active"); renderLevelSelect(); }
function showGame() { if (levelPanel) levelPanel.hidden = true; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = false; if (gameControls) gameControls.hidden = false; document.body.classList.add("puzzle-active"); }
function startLevel(index) { const levelToStart = LEVELS_BY_GAME[currentGame]?.[index]; if (!isLevelUnlocked(levelToStart)) { if (levelToStart) selectedDifficulty = levelToStart.difficulty; renderLevelSelect(); return; } stopStarTimer({ hide: true }); clearPracticeAdvanceTimer(); hideSuccess(); currentIndex = index; const level = currentLevel(); selectedDifficulty = level.difficulty; const config = GAME_CONFIGS[currentGame]; history = []; winShown = false; if (undoButton) undoButton.disabled = true; const boardSize = level.cols || level.size || 5; board.className = `board ${currentGame}-board board-size-${boardSize}`; board.style.setProperty("--size", boardSize); board.setAttribute("aria-label", `${config.title} Spielfeld`); puzzleTitle.textContent = level.title; puzzleDescription.textContent = level.description || config.subtitle; fillList(gameHelpList, config.rules); cloudProgress()?.recordLevelStart?.(level); resetState(); showGame(); startStarTimer(level); render(); }
function resetGame() { history = []; if (undoButton) undoButton.disabled = true; hideSuccess(); cloudProgress()?.recordLevelStart?.(currentLevel()); resetState(); startStarTimer(currentLevel()); recordResetMetric(); render("Neu gestartet. Viel Spass!"); }
function undo() {
  finishMove();
  if (currentGame === "hidoku") {
    GAME_HANDLERS.hidoku.clear(false);
    return;
  }
  if (!history.length) return;
  restore(history.pop());
  if (undoButton) undoButton.disabled = history.length === 0;
  setStatus("Ein Schritt zurück.");
}
function nextLevel() { const next = nextPlayableLevel(currentLevel()); if (next) startLevel(LEVELS_BY_GAME[currentGame].indexOf(next)); else showLevelSelect(); }
function updateNextPuzzleButton() {
  if (!nextPuzzleButton || !currentGame) return;
  const next = nextPlayableLevel(currentLevel());
  nextPuzzleButton.textContent = next ? "\u2192" : "OK";
  nextPuzzleButton.title = next ? "Naechstes Level" : "Zur Levelauswahl";
  nextPuzzleButton.setAttribute("aria-label", next ? "Naechstes Level" : "Zur Levelauswahl");
}
function showSuccess() { const level = currentLevel(); const stars = currentLevelStars(); const result = currentSolveResult(stars); winShown = true; stopStarTimer(); markSolved(level, result); updateNextPuzzleButton(); updateSuccessStars(stars, result); if (successOverlay) { successOverlay.hidden = false; successOverlay.classList.remove("hidden"); } setStatus(`Geschafft! ${starLabel(stars)} erspielt.`); }
function hideSuccess() { winShown = false; if (successOverlay) { successOverlay.hidden = true; successOverlay.classList.add("hidden"); } }
function updateSuccessStars(stars, result = {}) {
  if (!successStars) return;
  const detail = [];
  if (Number.isFinite(result.elapsedSeconds)) detail.push(`Zeit ${formatTimerSeconds(result.elapsedSeconds)}`);
  if (Number.isFinite(result.flawless) && Number.isFinite(result.target)) detail.push(`${result.flawless}/${result.target} fehlerfrei`);
  successStars.innerHTML = `
    <div class="success-stars-row" aria-label="${starLabel(stars)}">${starsMarkup(stars)}</div>
    <p>${starLabel(stars)}${detail.length ? ` - ${detail.join(" - ")}` : ""}</p>
  `;
}

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
      <div id="success-stars" class="success-stars"></div>
      <div class="success-actions" aria-label="Level-Aktionen">
        <button id="success-restart-button" class="success-icon-button" type="button" aria-label="Level neu starten" title="Level neu starten">↻</button>
        <button id="next-puzzle-button" class="success-icon-button primary" type="button" aria-label="Nächstes Level" title="Nächstes Level">→</button>
      </div>
    </div>`;
  shell.append(overlay);

  successOverlay = overlay;
  successRestartButton = overlay.querySelector("#success-restart-button");
  nextPuzzleButton = overlay.querySelector("#next-puzzle-button");
  successStars = overlay.querySelector("#success-stars");
  successRestartButton.addEventListener("click", resetGame);
  nextPuzzleButton.addEventListener("click", nextLevel);
}
function handleHint() { const handler = GAME_HANDLERS[currentGame]; if (!handler?.hint) return; recordHintMetric(); handler.hint(); }
function handleWin() { if (!winShown) showSuccess(); render(); }
function checkAndWin() { if (GAME_HANDLERS[currentGame].checkWin()) handleWin(); }
function resetState() { GAME_HANDLERS[currentGame].resetState(currentLevel()); }
function render(message) { numberPad.hidden = true; GAME_HANDLERS[currentGame].render(currentLevel()); if (message) setStatus(message); }

function makeButtonCell(row, col, className, text = "") { const b=document.createElement("button"); b.type="button"; b.className=className; b.dataset.row=row; b.dataset.col=col; b.textContent=text; return b; }
function getPairColor(pair) { return DEFAULT_COLORS[pair] || "#6c5ce7"; }

function answerKey(value) { return String(value); }
function sameAnswer(a, b) { return answerKey(a) === answerKey(b); }
function practiceProgressKey(level) { return `lernapp.practice.${level.game}.${level.id || level.levelName}`; }
function loadPracticeProgress(level) {
  const fallback = { solved: 0, correct: 0, answers: 0, currentDifficulty: level.difficulty };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(practiceProgressKey(level)) || "{}") };
  } catch {
    return fallback;
  }
}
function savePracticeProgress(level, progress) {
  try { localStorage.setItem(practiceProgressKey(level), JSON.stringify(progress)); } catch {}
}
function recordPracticeAnswer(level, isCorrect) {
  const progress = loadPracticeProgress(level);
  progress.answers += 1;
  progress.currentDifficulty = level.difficulty;
  if (isCorrect) {
    progress.solved += 1;
    progress.correct += 1;
  }
  savePracticeProgress(level, progress);
}
function resetPracticeState(level, taskFactory, status) {
  clearPracticeAdvanceTimer();
  const task = generateUniquePracticeTask(taskFactory, level.difficulty);
  state = {
    task,
    usedTaskKeys: [practiceTaskKey(task)],
    solvedCount: 0,
    correctCount: 0,
    flawlessCount: 0,
    attempts: 0,
    selectedAnswer: null,
    feedback: "",
    tipVisible: false,
    awaitingNext: false,
    completed: false,
  };
  setStatus(status);
}
function clearPracticeAdvanceTimer() {
  if (practiceAdvanceTimer) window.clearTimeout(practiceAdvanceTimer);
  practiceAdvanceTimer = null;
}
function nextPracticeTask(taskFactory, status) {
  clearPracticeAdvanceTimer();
  const level = currentLevel();
  const task = generateUniquePracticeTask(taskFactory, level.difficulty, state.usedTaskKeys || []);
  state.task = task;
  state.usedTaskKeys = [...(state.usedTaskKeys || []), practiceTaskKey(task)];
  state.attempts = 0;
  state.selectedAnswer = null;
  state.feedback = "";
  state.tipVisible = false;
  state.awaitingNext = false;
  render(status);
}
function schedulePracticeAdvance(taskFactory, nextStatus) {
  clearPracticeAdvanceTimer();
  practiceAdvanceTimer = window.setTimeout(() => {
    practiceAdvanceTimer = null;
    if (!PRACTICE_GAMES.has(currentGame) || !state.awaitingNext || state.completed) return;
    nextPracticeTask(taskFactory, nextStatus);
  }, 1000);
}
function answerPracticeTask(answer, taskFactory, messages, nextStatus = "Neue Aufgabe.") {
  if (!state.task || state.awaitingNext || state.completed) return;
  const level = currentLevel();
  const correct = sameAnswer(answer, state.task.correctAnswer);
  state.selectedAnswer = answer;
  if (correct) {
    state.solvedCount += 1;
    state.correctCount += 1;
    if (state.attempts === 0) state.flawlessCount += 1;
    state.feedback = pickRandom(messages.correct);
    recordPracticeAnswer(level, true);
    if (state.solvedCount >= (level.targetCount || 10)) {
      state.completed = true;
      handleWin();
      return;
    }
    state.awaitingNext = true;
    render();
    schedulePracticeAdvance(taskFactory, nextStatus);
    return;
  }
  state.attempts += 1;
  state.tipVisible = state.attempts >= 2;
  state.feedback = state.tipVisible ? messages.hint : pickRandom(messages.retry);
  recordPracticeAnswer(level, false);
  render();
}
function renderPracticeProgress(level) {
  const target = level.targetCount || 10;
  const progress = document.createElement("div");
  progress.className = "practice-progress";
  [
    `Aufgabe ${Math.min(state.solvedCount + 1, target)} von ${target}`,
  ].forEach((text) => {
    const item = document.createElement("span");
    item.textContent = text;
    progress.append(item);
  });
  return progress;
}
function optionStateClass(option) {
  const correct = sameAnswer(option, state.task.correctAnswer);
  const revealCorrect = state.awaitingNext || state.completed;
  if (correct && revealCorrect) return " correct";
  return "";
}
function renderPracticeOptions(onAnswer) {
  const options = document.createElement("div");
  options.className = "practice-options";
  options.style.setProperty("--option-count", Math.min(state.task.options.length, 4));
  state.task.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `practice-option${optionStateClass(option)}`;
    button.textContent = option;
    button.disabled = state.awaitingNext || state.completed;
    button.addEventListener("click", () => onAnswer(option));
    options.append(button);
  });
  return options;
}
function renderPracticeFeedback(taskFactory, nextStatus) {
  const feedback = document.createElement("div");
  feedback.className = `practice-feedback${state.feedback ? " visible" : ""}`;
  if (state.feedback) {
    const text = document.createElement("p");
    text.textContent = state.feedback;
    feedback.append(text);
  }
  if (state.awaitingNext && state.task.fullText) {
    const full = document.createElement("strong");
    full.textContent = state.task.fullText;
    feedback.append(full);
  }
  return feedback;
}
function renderPracticeShell(level, className, taskView, onAnswer, taskFactory, nextStatus) {
  board.innerHTML = "";
  board.className = `board task-board ${className}`;
  board.style.setProperty("--size", 1);
  board.append(
    renderPracticeProgress(level),
    taskView,
    renderPracticeOptions(onAnswer),
    renderPracticeFeedback(taskFactory, nextStatus),
  );
}
function backpackRule(level) { return BACKPACK_DIFFICULTY_RULES[level.difficulty] || BACKPACK_DIFFICULTY_RULES.easy; }
function backpackPool(level) { return BACKPACK_ITEMS.slice(0, backpackRule(level).poolSize); }
function backpackBestKey(level) { return `lernapp.backpack.best.${level.id || level.levelName}`; }
function loadBackpackBest(level) { return Number(localStorage.getItem(backpackBestKey(level)) || 0); }
function saveBackpackBest(level, value) { localStorage.setItem(backpackBestKey(level), String(value)); }
function clearBackpackTimer() {
  if (backpackTimer) window.clearTimeout(backpackTimer);
  backpackTimer = null;
}
function scheduleBackpack(callback, delay = 560) {
  clearBackpackTimer();
  const token = state.token;
  backpackTimer = window.setTimeout(() => {
    backpackTimer = null;
    if (currentGame === "backpack" && state.token === token) callback();
  }, delay);
}
function backpackNewOptions(level) {
  const rule = backpackRule(level);
  const pool = backpackPool(level);
  const unused = pool.filter((item) => !state.sequence.includes(item.id));
  const source = unused.length ? unused : pool;
  return shuffleOptions(source).slice(0, Math.min(rule.choiceCount, source.length));
}
function backpackRepeatOptions(level) {
  const rule = backpackRule(level);
  const pool = backpackPool(level);
  const correctId = state.sequence[state.repeatIndex];
  const correct = BACKPACK_ITEM_BY_ID[correctId];
  const distractors = shuffleOptions(pool.filter((item) => item.id !== correctId)).slice(0, Math.max(0, rule.choiceCount - 1));
  return shuffleOptions([correct, ...distractors].filter(Boolean));
}
function backpackPhaseLabel() {
  if (state.phase === "chooseNew") return "Neuen Gegenstand wählen";
  if (state.phase === "packingNew") return "Gegenstand wird eingepackt";
  if (state.phase === "correctPacking") return "Richtig eingepackt";
  if (state.phase === "wrong") return "Noch nicht richtig";
  if (state.phase === "gameOver") return "Runde vorbei";
  return "Reihenfolge packen";
}
function backpackStatusText() {
  if (state.phase === "chooseNew") return state.sequence.length ? "Wähle etwas Neues dazu." : "Wähle den ersten Gegenstand.";
  if (state.phase === "packingNew") return "Merke dir den neuen Gegenstand.";
  if (state.phase === "correctPacking") return "Stimmt. Weiter in der Reihenfolge.";
  if (state.phase === "wrong") return "Das war nicht die gemerkte Reihenfolge.";
  if (state.phase === "gameOver") return "Starte eine neue Runde oder wähle eine andere Schwierigkeit.";
  return `Packe Gegenstand ${state.repeatIndex + 1} von ${state.sequence.length}.`;
}
function makeBackpackStat(label, value) {
  const stat = document.createElement("span");
  const small = document.createElement("small");
  small.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value;
  stat.append(small, strong);
  return stat;
}
function renderBackpackStats() {
  const stats = document.createElement("div");
  stats.className = "backpack-stats";
  stats.append(
    makeBackpackStat("Runde", state.round),
    makeBackpackStat("Bestwert", state.best),
    makeBackpackStat("Sterne", `${backpackStars(state.best)}/3`),
    makeBackpackStat("Länge", state.sequence.length),
  );
  return stats;
}
function renderBackpackScene() {
  const scene = document.createElement("div");
  scene.className = "backpack-scene";
  const mode = document.createElement("div");
  mode.className = `backpack-mode ${state.phase}`;
  mode.textContent = backpackPhaseLabel();
  const emoji = document.createElement("div");
  emoji.className = `backpack-emoji${state.phase === "packingNew" || state.phase === "correctPacking" ? " bouncing" : ""}`;
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = "🎒";
  const dots = document.createElement("div");
  dots.className = "backpack-progress";
  const filledCount = state.phase === "repeat" || state.phase === "correctPacking" || state.phase === "wrong" ? state.repeatIndex : 0;
  state.sequence.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = `backpack-dot${index < filledCount ? " filled" : ""}`;
    dots.append(dot);
  });
  const phase = document.createElement("p");
  phase.className = "backpack-phase";
  phase.textContent = backpackStatusText();
  scene.append(mode, emoji, dots, phase);
  return scene;
}
function backpackItemClass(item) {
  if (state.phase === "chooseNew") return " new-choice";
  if (state.phase === "packingNew" && item.id === state.selectedId) return " packing";
  if (state.phase === "correctPacking" && item.id === state.selectedId) return " correct";
  if (state.phase === "wrong" && item.id === state.selectedId) return " wrong";
  if (state.phase === "wrong" && item.id === state.correctId) return " correct";
  return "";
}
function renderBackpackChoices(level) {
  const rule = backpackRule(level);
  const choices = document.createElement("div");
  choices.className = "backpack-choice-grid";
  choices.style.setProperty("--choice-count", Math.max(1, Math.min(rule.choiceCount, state.options.length)));
  state.options.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `backpack-item-card${rule.showLabels ? "" : " no-label"}${backpackItemClass(item)}`;
    button.disabled = state.phase !== "chooseNew" && state.phase !== "repeat";
    button.setAttribute("aria-label", item.label);
    const emoji = document.createElement("span");
    emoji.className = "backpack-item-emoji";
    emoji.textContent = item.emoji;
    button.append(emoji);
    if (rule.showLabels) {
      const label = document.createElement("span");
      label.className = "backpack-item-label";
      label.textContent = item.label;
      button.append(label);
    }
    button.addEventListener("click", () => GAME_HANDLERS.backpack.choose(item.id));
    choices.append(button);
  });
  return choices;
}
function renderBackpackGameOver(level) {
  if (state.phase !== "gameOver") return null;
  const overlay = document.createElement("div");
  overlay.className = "backpack-game-over";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-labelledby", "backpack-game-over-title");
  overlay.innerHTML = `
    <div class="backpack-game-over-dialog">
      <h3 id="backpack-game-over-title">Runde vorbei</h3>
      <p>Geschafft: ${state.round} ${state.round === 1 ? "Runde" : "Runden"}</p>
      <div class="backpack-stars" aria-label="${starLabel(backpackStars(state.best))}">${starsMarkup(backpackStars(state.best))}</div>
      <p class="backpack-record">Bestwert: ${state.best}</p>
      <div class="backpack-game-over-actions">
        <button type="button" data-backpack-restart>Noch einmal</button>
        <button type="button" class="secondary-action" data-backpack-levels>Schwierigkeit wählen</button>
      </div>
    </div>`;
  overlay.querySelector("[data-backpack-restart]").addEventListener("click", resetGame);
  overlay.querySelector("[data-backpack-levels]").addEventListener("click", showLevelSelect);
  return overlay;
}
function makeMathTaskView() {
  const task = state.task;
  const view = document.createElement("div");
  view.className = "practice-task math-task";
  const equation = document.createElement("div");
  equation.className = "math-equation";
  equation.textContent = task.questionText;
  view.append(equation);
  return view;
}
function makeSequenceTaskView() {
  const task = state.task;
  const view = document.createElement("div");
  view.className = "practice-task sequence-task";
  const display = document.createElement("div");
  display.className = "sequence-display";
  display.setAttribute("aria-label", "Zahlenreihe mit Lücke");
  task.sequence.forEach((num) => {
    const span = document.createElement("span");
    span.className = num === null ? "sequence-gap" : "sequence-num";
    span.textContent = num === null ? "?" : num;
    display.append(span);
  });
  view.append(display);
  return view;
}
function makeShapeSequenceTaskView() {
  const task = state.task;
  const view = document.createElement("div");
  view.className = "practice-task sequence-task";
  const display = document.createElement("div");
  display.className = "sequence-display";
  display.setAttribute("aria-label", "Figurenreihe mit Lücke");
  task.sequence.forEach((shape) => {
    const span = document.createElement("span");
    span.className = shape === null ? "sequence-gap" : "sequence-shape";
    span.textContent = shape === null ? "?" : shape;
    display.append(span);
  });
  view.append(display);
  return view;
}
function readingHintText(task) {
  if (task.taskType === "missingLetter") return `Achte auf den ersten Buchstaben: ${task.fullText[0]}.`;
  if (task.taskType === "chooseWord") return `Das passende Wort beginnt mit ${task.fullText[0]}.`;
  if (task.taskType === "missingSyllable") return `Sprich das Wort langsam: ${task.fullText}.`;
  if (task.taskType === "sentenceMissingWord") return "Lies den Satz noch einmal und schau auf das Bild.";
  return "Vergleiche jeden Satz mit dem Bild.";
}
function makeReadingDisplay(task) {
  const display = document.createElement("div");
  display.className = task.taskType === "sentenceMissingWord" ? "reading-display sentence-gap" : "letter-row";
  task.displayText.split(" ").forEach((part, index) => {
    const span = document.createElement("span");
    span.textContent = part;
    if (state.tipVisible && index === 0 && part !== "_") span.className = "letter-tip";
    display.append(span);
  });
  return display;
}
function makeReadingTaskView() {
  const task = state.task;
  const view = document.createElement("div");
  view.className = "practice-task reading-task";
  const image = document.createElement("div");
  image.className = "reading-image";
  image.setAttribute("aria-label", task.imageKey);
  image.textContent = READING_IMAGE_MAP[task.imageKey] || "◼";
  const prompt = document.createElement("p");
  prompt.className = "reading-prompt";
  prompt.textContent = task.prompt;
  view.append(image, prompt);
  if (task.displayText) view.append(makeReadingDisplay(task));
  if (state.tipVisible) {
    const hint = document.createElement("p");
    hint.className = "practice-tip";
    hint.textContent = readingHintText(task);
    view.append(hint);
  }
  return view;
}

const GAME_HANDLERS = {

  backpack: {
    resetState(level) {
      clearBackpackTimer();
      state = {
        sequence: [],
        repeatIndex: 0,
        round: 0,
        best: loadBackpackBest(level),
        phase: "chooseNew",
        options: [],
        selectedId: null,
        correctId: null,
        token: `${Date.now()}-${Math.random()}`,
        unlockRecorded: isSolved(level),
      };
      state.options = backpackNewOptions(level);
      setStatus("Wähle den ersten Gegenstand für deinen Rucksack.");
    },
    checkWin() { return false; },
    choose(itemId) {
      if (!["chooseNew", "repeat"].includes(state.phase)) return;
      if (!state.options.some((item) => item.id === itemId)) return;
      const level = currentLevel();
      recordMoveMetric();
      if (state.phase === "chooseNew") {
        state.sequence.push(itemId);
        state.selectedId = itemId;
        state.correctId = null;
        state.phase = "packingNew";
        state.options = [BACKPACK_ITEM_BY_ID[itemId]];
        render("Gepackt. Merke dir die Reihenfolge.");
        scheduleBackpack(() => {
          state.phase = "repeat";
          state.repeatIndex = 0;
          state.selectedId = null;
          state.options = backpackRepeatOptions(level);
          render("Packe jetzt alles in der richtigen Reihenfolge ein.");
        });
        return;
      }

      const correctId = state.sequence[state.repeatIndex];
      state.selectedId = itemId;
      state.correctId = correctId;
      if (itemId === correctId) {
        state.phase = "correctPacking";
        render("Richtig eingepackt.");
        scheduleBackpack(() => {
          state.repeatIndex += 1;
          state.selectedId = null;
          state.correctId = null;
          if (state.repeatIndex >= state.sequence.length) {
            state.round += 1;
            state.best = Math.max(state.best, state.round);
            saveBackpackBest(level, state.best);
            if (!state.unlockRecorded || backpackStars(state.best) > levelStars(level)) {
              state.unlockRecorded = true;
              markSolved(level, currentSolveResult(backpackStars(state.best)));
            }
            state.phase = "chooseNew";
            state.repeatIndex = 0;
            state.options = backpackNewOptions(level);
            render(`Runde ${state.round} geschafft. Wähle etwas Neues dazu.`);
            return;
          }
          state.phase = "repeat";
          state.options = backpackRepeatOptions(level);
          render("Weiter in der Reihenfolge.");
        }, 430);
        return;
      }

      state.phase = "wrong";
      render("Fast. Gleich siehst du deinen Bestwert.");
      scheduleBackpack(() => {
        state.phase = "gameOver";
        state.options = [];
        render("Runde vorbei.");
      }, 720);
    },
    render(level) {
      board.innerHTML = "";
      board.className = "board backpack-board";
      board.style.setProperty("--size", 1);
      board.append(renderBackpackStats(), renderBackpackScene());
      if (state.options.length) board.append(renderBackpackChoices(level));
      const gameOver = renderBackpackGameOver(level);
      if (gameOver) board.append(gameOver);
    },
  },

  mathPuzzle: {
    resetState(level) { resetPracticeState(level, generateMathTask, "Rechne in Ruhe und tippe auf die passende Zahl."); },
    checkWin() { return Boolean(state.completed); },
    hint() { if (!state.task || state.completed || state.awaitingNext) return; state.tipVisible = true; render("Tipp: Lies die Aufgabe langsam und prüfe die fehlende Zahl."); },
    answer(answer) {
      answerPracticeTask(answer, generateMathTask, {
        correct: ["Richtig!", "Super!", "Gut gerechnet!"],
        retry: ["Fast! Versuch es noch einmal.", "Du bist nah dran. Zähl noch einmal in Ruhe."],
        hint: "Fast! Die Hilfe zeigt dir einen guten Weg.",
      }, "Neue Aufgabe. Du schaffst das.");
    },
    render(level) {
      renderPracticeShell(level, "mathPuzzle-board", makeMathTaskView(), (answer) => this.answer(answer), generateMathTask, "Neue Aufgabe. Du schaffst das.");
    },
  },

  sequencePuzzle: {
    resetState(level) { resetPracticeState(level, generateSequenceTask, "Schau dir die Reihe genau an. Welche Zahl fehlt?"); },
    checkWin() { return Boolean(state.completed); },
    hint() { if (!state.task || state.completed || state.awaitingNext) return; state.tipVisible = true; render("Tipp: Wie groß ist der Abstand zwischen den Zahlen?"); },
    answer(answer) {
      answerPracticeTask(answer, generateSequenceTask, {
        correct: ["Richtig!", "Genial erkannt!", "Ganz genau!", "Du bist ein Mathe-Profi!"],
        retry: ["Fast! Prüfe den Abstand der Zahlen nochmal.", "Knapp daneben. Rechne noch einmal nach."],
        hint: "Tipp: Schau dir an, ob die Zahlen größer oder kleiner werden und um wie viel.",
      }, "Neue Zahlenreihe. Du schaffst das.");
    },
    render(level) {
      renderPracticeShell(level, "sequencePuzzle-board", makeSequenceTaskView(), (answer) => this.answer(answer), generateSequenceTask, "Neue Zahlenreihe. Du schaffst das.");
    },
  },

  shapeSequencePuzzle: {
    resetState(level) { resetPracticeState(level, generateShapeSequenceTask, "Schau dir die Reihe genau an. Welche Figur fehlt?"); },
    checkWin() { return Boolean(state.completed); },
    hint() { if (!state.task || state.completed || state.awaitingNext) return; state.tipVisible = true; render("Tipp: Sprich das Muster laut vor dich hin."); },
    answer(answer) {
      answerPracticeTask(answer, generateShapeSequenceTask, {
        correct: ["Richtig!", "Genial erkannt!", "Ganz genau!", "Super gemacht!"],
        retry: ["Fast! Prüfe das Muster noch einmal.", "Knapp daneben. Schau dir die Reihenfolge genau an."],
        hint: "Tipp: Achte auf die Farben und die Formen der vorherigen Bilder.",
      }, "Neue Figurenfolge. Du schaffst das.");
    },
    render(level) {
      renderPracticeShell(level, "shapeSequencePuzzle-board", makeShapeSequenceTaskView(), (answer) => this.answer(answer), generateShapeSequenceTask, "Neue Figurenfolge. Du schaffst das.");
    },
  },

  readingPuzzle: {
    resetState(level) { resetPracticeState(level, generateReadingTask, "Schau auf das Bild und lies genau."); },
    checkWin() { return Boolean(state.completed); },
    hint() { if (!state.task || state.completed || state.awaitingNext) return; state.tipVisible = true; render("Tipp: Schau noch einmal genau auf Bild und Anfang."); },
    answer(answer) {
      answerPracticeTask(answer, generateReadingTask, {
        correct: ["Richtig gelesen!", "Super!", "Das war das richtige Wort!"],
        retry: ["Fast! Schau noch einmal genau hin.", "Vergleiche das Wort mit dem Bild."],
        hint: "Achte auf den Anfang und lies langsam weiter.",
      }, "Neue Leseaufgabe.");
    },
    render(level) {
      renderPracticeShell(level, "readingPuzzle-board", makeReadingTaskView(), (answer) => this.answer(answer), generateReadingTask, "Neue Leseaufgabe.");
    },
  },

  shikaku: {
    resetState() { state = { regions: {}, selected: null, dragPreview: null }; setStatus("Ziehe von einer Ecke des Geheges zur gegenüberliegenden Ecke."); },
    clueKey(clue) { return keyOf(clue.row, clue.col); },
    clueAt(level, r, c) { return level.clues.find((clue) => clue.row === r && clue.col === c) || null; },
    ownerAt(r, c) {
      const key = keyOf(r, c);
      return Object.entries(state.regions).find(([, region]) => region.cells.some((cell) => keyOf(cell.row, cell.col) === key))?.[0] || null;
    },
    solutionIdForClue(level, clue) { return level.solutionRegions[clue.row][clue.col]; },
    solutionCells(level, clue) {
      const id = this.solutionIdForClue(level, clue);
      const cells = [];
      for (let r = 0; r < level.rows; r += 1) for (let c = 0; c < level.cols; c += 1) if (level.solutionRegions[r][c] === id) cells.push({ row: r, col: c });
      return cells;
    },
    regionMatchesSolution(level, clue) {
      const region = state.regions[this.clueKey(clue)];
      if (!region) return false;
      const want = new Set(this.solutionCells(level, clue).map((cell) => keyOf(cell.row, cell.col)));
      return region.cells.length === want.size && region.cells.every((cell) => want.has(keyOf(cell.row, cell.col)));
    },
    checkWin() { const level = currentLevel(); return level.clues.every((clue) => this.regionMatchesSolution(level, clue)); },
    selectClue(clue) { state.selected = { row: clue.row, col: clue.col }; state.dragPreview = null; render(`Das Tier braucht ${clue.value} Felder.`); },
    clearClueRegion(clue) {
      const selectedKey = this.clueKey(clue);
      if (!state.regions[selectedKey]) return false;
      pushHistory();
      delete state.regions[selectedKey];
      state.selected = null;
      state.dragPreview = null;
      render("Gehege gelöscht.");
      return true;
    },
    rectangleCellsFromCorners(startRow, startCol, endRow, endCol) {
      const minRow = Math.min(startRow, endRow), maxRow = Math.max(startRow, endRow);
      const minCol = Math.min(startCol, endCol), maxCol = Math.max(startCol, endCol);
      const cells = [];
      for (let row = minRow; row <= maxRow; row += 1) for (let col = minCol; col <= maxCol; col += 1) cells.push({ row, col });
      return cells;
    },
    rectangleCells(level, clue, r, c) { return this.rectangleCellsFromCorners(clue.row, clue.col, r, c); },
    cluesInCells(level, cells) {
      return cells.map((cell) => this.clueAt(level, cell.row, cell.col)).filter(Boolean);
    },
    clueFromKey(level, clueKey) {
      return level.clues.find((clue) => this.clueKey(clue) === clueKey) || null;
    },
    previewCells(cells, target) {
      const level = currentLevel();
      const clues = this.cluesInCells(level, cells);
      const clue = clues.length === 1 ? clues[0] : null;
      state.selected = clue ? { row: clue.row, col: clue.col } : null;
      state.dragPreview = {
        cells,
        area: cells.length,
        target,
        clueKey: clue ? this.clueKey(clue) : null,
        clueCount: clues.length,
      };
      if (!clue) {
        render(clues.length > 1 ? "Dieses Rechteck enthält mehrere Tiere." : "Ziehe das Rechteck über genau ein Tier.");
        return;
      }
      const sizeText = cells.length === clue.value ? "passt genau" : `${cells.length} von ${clue.value} Feldern`;
      render(`Ziehe das Rechteck: ${sizeText}.`);
    },
    previewDrag(clue, r, c) {
      const level = currentLevel();
      this.previewCells(this.rectangleCells(level, clue, r, c), { row: r, col: c });
    },
    previewRectangle(startRow, startCol, endRow, endCol) {
      this.previewCells(this.rectangleCellsFromCorners(startRow, startCol, endRow, endCol), { row: endRow, col: endCol });
    },
    clearDragPreview() { state.dragPreview = null; },
    finishRectangle(startRow, startCol, endRow, endCol, shouldCommit) {
      const cells = this.rectangleCellsFromCorners(startRow, startCol, endRow, endCol);
      this.clearDragPreview();
      if (shouldCommit) this.commitCells(cells);
      else render("Ziehe ein Rechteck über genau ein Tier.");
    },
    commitCells(cells) {
      const level = currentLevel();
      const clues = this.cluesInCells(level, cells);
      if (clues.length > 1) { render("In ein Gehege darf nur eine Zahl."); return false; }
      if (clues.length !== 1) { render("Das Gehege muss genau ein Tier enthalten."); return false; }
      const selectedClue = clues[0];
      const area = cells.length;
      if (area < selectedClue.value) { render("Dieses Gehege ist zu klein."); return false; }
      if (area > selectedClue.value) { render("Dieses Gehege ist zu gross."); return false; }
      const selectedKey = this.clueKey(selectedClue);
      for (const cell of cells) {
        const owner = this.ownerAt(cell.row, cell.col);
        if (owner && owner !== selectedKey) { render("Hier liegt schon ein anderes Gehege."); return false; }
      }
      pushHistory();
      state.regions[selectedKey] = { cells, color: (level.clues.indexOf(selectedClue) % 12) + 1 };
      state.selected = null;
      state.dragPreview = null;
      this.checkWin() ? handleWin() : render("Gehege gesetzt. Wenn am Ende alles aufgeht, ist es richtig.");
      return true;
    },
    input(r, c) {
      const level = currentLevel();
      const clue = this.clueAt(level, r, c);
      if (!state.selected) {
        if (!clue) { render("Bitte tippe zuerst auf ein Tier mit Zahl."); return; }
        if (this.clearClueRegion(clue)) return;
        this.selectClue(clue);
        return;
      }
      const selectedClue = this.clueAt(level, state.selected.row, state.selected.col);
      if (!selectedClue) { state.selected = null; render("Bitte tippe zuerst auf ein Tier mit Zahl."); return; }
      if (clue && this.clueKey(clue) !== this.clueKey(selectedClue)) { this.selectClue(clue); return; }
      const cells = this.rectangleCells(level, selectedClue, r, c);
      this.commitCells(cells);
    },
    render(level) {
      board.innerHTML = "";
      board.style.setProperty("--size", level.cols);
      board.style.setProperty("--rows", level.rows);
      const dragKeys = new Set((state.dragPreview?.cells || []).map((cell) => keyOf(cell.row, cell.col)));
      const previewClue = state.dragPreview?.clueKey ? this.clueFromKey(level, state.dragPreview.clueKey) : null;
      const dragAreaMatches = state.dragPreview?.clueCount === 1 && state.dragPreview.area === (previewClue?.value || 0);
      for (let r = 0; r < level.rows; r += 1) for (let c = 0; c < level.cols; c += 1) {
        const clue = this.clueAt(level, r, c);
        const selected = state.selected && state.selected.row === r && state.selected.col === c;
        const owner = this.ownerAt(r, c);
        const region = owner ? state.regions[owner] : null;
        const color = region?.color || 0;
        const isDragPreview = dragKeys.has(keyOf(r, c));
        const cell = makeButtonCell(r, c, `cell shikaku-cell${clue ? " clue" : ""}${selected ? " selected" : ""}${owner ? ` region shikaku-region-${color}` : ""}${isDragPreview ? ` shikaku-drag-preview${dragAreaMatches ? " valid" : ""}` : ""}`, "");
        cell.setAttribute("aria-label", clue ? `Tier mit Zahl ${clue.value}, Reihe ${r + 1}, Spalte ${c + 1}${owner ? ", Gehege antippen zum Löschen" : ""}` : `Feld Reihe ${r + 1}, Spalte ${c + 1}`);
        if (clue) {
          const animal = document.createElement("span");
          animal.className = "shikaku-animal";
          animal.setAttribute("aria-hidden", "true");
          animal.textContent = ["🐰","🐸","🐻","🦊","🐼","🐨","🐯","🐵","🦁","🐮","🐷","🐶"][level.clues.indexOf(clue) % 12];
          const number = document.createElement("span");
          number.className = "shikaku-number";
          number.textContent = clue.value;
          cell.append(animal, number);
        }
        cell.addEventListener("click", () => {
          if (ignoreNextShikakuClick) { ignoreNextShikakuClick = false; return; }
          this.input(r, c);
        });
        board.append(cell);
      }
    },
  },
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
  bimaru: {
    resetState(level) {
      state = { grid: zeros(level.size, level.size, ""), fixed: {} };
      (level.givens || []).forEach(([r, c, value = "ship"]) => {
        state.grid[r][c] = value;
        state.fixed[keyOf(r, c)] = value;
      });
      setStatus("Kurz tippen markiert Wasser. Langer Druck setzt ein Schiffsteil.");
    },
    checkWin() {
      const level = currentLevel();
      return level.solution.every((row, r) => row.every((value, c) => (state.grid[r][c] === "ship") === Boolean(value)));
    },
    setCell(r, c, value, message) {
      if (state.grid[r][c] === value) return;
      pushHistory();
      state.grid[r][c] = value;
      this.checkWin() ? handleWin() : render(message);
    },
    shortInput(r, c) {
      if (state.fixed?.[keyOf(r, c)]) {
        render("Dieses vorgegebene Feld bleibt stehen.");
        return;
      }
      const value = state.grid[r][c];
      if (value === "ship") {
        this.setCell(r, c, "", "Schiffsteil gelöscht.");
        return;
      }
      if (value === "water") {
        this.setCell(r, c, "", "Wasserfeld gelöscht.");
        return;
      }
      this.setCell(r, c, "water", "Wasser markiert.");
    },
    placeShip(r, c) {
      if (state.fixed?.[keyOf(r, c)]) {
        render("Dieses vorgegebene Feld bleibt stehen.");
        return;
      }
      this.setCell(r, c, "ship", "Schiffsteil gesetzt. Prüfe Zahlen und Flotte.");
    },
    hint() {
      const level = currentLevel();
      for (let r = 0; r < level.size; r += 1) for (let c = 0; c < level.size; c += 1) {
        if (state.grid[r][c] === "ship" && !level.solution[r][c]) {
          this.setCell(r, c, "", "Tipp: Dieses Schiffsteil passt hier nicht.");
          return;
        }
      }
      for (let r = 0; r < level.size; r += 1) for (let c = 0; c < level.size; c += 1) {
        if (level.solution[r][c] && state.grid[r][c] !== "ship") {
          this.setCell(r, c, "ship", "Tipp: Ein sicheres Schiffsteil ist gesetzt.");
          return;
        }
      }
    },
    attachInput(cell, r, c) {
      let pressTimer = null;
      let longPressFired = false;
      const clearPressTimer = () => {
        if (pressTimer) window.clearTimeout(pressTimer);
        pressTimer = null;
      };
      cell.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        longPressFired = false;
        clearPressTimer();
        pressTimer = window.setTimeout(() => {
          longPressFired = true;
          pressTimer = null;
          this.placeShip(r, c);
        }, BIMARU_LONG_PRESS_MS);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((type) => cell.addEventListener(type, clearPressTimer));
      cell.addEventListener("click", (event) => {
        if (longPressFired) {
          event.preventDefault();
          longPressFired = false;
          return;
        }
        this.shortInput(r, c);
      });
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        this.placeShip(r, c);
      });
      cell.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.shortInput(r, c);
        } else if (event.key.toLowerCase() === "s") {
          event.preventDefault();
          this.placeShip(r, c);
        }
      });
    },
    render(level) {
      const invalidShips = bimaruInvalidShipKeys(level, state.grid);
      renderBimaruBoard(level, (r, c) => {
        const value = state.grid[r][c];
        const isShip = value === "ship";
        const fixed = state.fixed?.[keyOf(r, c)];
        const cell = makeButtonCell(r, c, `cell bimaru-cell ${value}${fixed ? " given" : ""}${invalidShips.has(keyOf(r, c)) ? " conflict" : ""}`, "");
        cell.setAttribute("aria-label", `Reihe ${r + 1}, Spalte ${c + 1}: ${fixed ? "vorgegebenes " : ""}${isShip ? "Schiffsteil" : value === "water" ? "Wasser" : "leer"}`);
        if (isShip) cell.append(makeBimaruShipMark(state.grid, r, c));
        this.attachInput(cell, r, c);
        return cell;
      });
    },
  },

  hidoku: {
    resetState(level) { state={ values: zeros(level.size, level.size, null), fixed: {}, selected: null, activeNumber: null }; level.givens.forEach(([r,c,v])=>{ state.values[r][c]=v; state.fixed[keyOf(r,c)]=true; }); setStatus("Du kannst eine bestehende Zahl oder direkt ein leeres Feld waehlen."); },
    maxNumber(level=currentLevel()) { return level.size * level.size; },
    numberPosition(value) { for(let r=0;r<state.values.length;r++) for(let c=0;c<state.values[r].length;c++) if(state.values[r][c]===value) return [r,c]; return null; },
    hasUserEntries() { for(let r=0;r<state.values.length;r++) for(let c=0;c<state.values[r].length;c++) if(state.values[r][c] && !state.fixed[keyOf(r,c)]) return true; return false; },
    duplicate(value, row, col) { if(!value) return false; for(let r=0;r<state.values.length;r++) for(let c=0;c<state.values[r].length;c++) if((r!==row||c!==col) && state.values[r][c]===value) return true; return false; },
    touches(a,b) { return a && b && Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1])) === 1; },
    conflict(r,c) { const level=currentLevel(), value=state.values[r][c], max=this.maxNumber(level); if(!value) return false; if(value<1 || value>max || this.duplicate(value,r,c)) return true; const current=[r,c]; const prev=value>1 ? this.numberPosition(value-1) : null; const next=value<max ? this.numberPosition(value+1) : null; return Boolean(prev && !this.touches(current,prev)) || Boolean(next && !this.touches(current,next)); },
    hasConflict() { const level=currentLevel(); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++) if(this.conflict(r,c)) return true; return false; },
    nextNumber() { const max=this.maxNumber(); for(let n=1;n<=max;n++) if(!this.numberPosition(n)) return n; return max + 1; },
    nextStatusNumber() { const next=this.nextNumber(); return next <= this.maxNumber() ? next : null; },
    activeNumberStatus(value) { const next=this.nextStatusNumber(); if(!next) return `Die ${value} ist aktuell das Ende der Kette.`; if(next===value+1) return `Weiter ab ${value}: Fahre zum Feld fuer ${next}.`; return `Aktive Zahl ${value}. Die naechste fehlende Zahl ist ${next}.`; },
    dragStartStatus(value) { const next=this.nextStatusNumber(); if(!next) return `Gestartet bei ${value}. Die Kette ist schon vollstaendig.`; if(next===value+1) return `Gestartet bei ${value}. Fahre zum Feld fuer ${next}.`; return `Gestartet bei ${value}. Die naechste fehlende Zahl ist ${next}.`; },
    activateNumber(value, row, col) { state.activeNumber=value; state.selected=[row,col]; render(this.activeNumberStatus(value)); },
    checkWin() { const level=currentLevel(), max=this.maxNumber(level); const seen=new Set(); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const value=state.values[r][c]; if(!value || value<1 || value>max || seen.has(value) || this.conflict(r,c)) return false; seen.add(value); } return seen.size===max; },
    select(r,c) { const value=state.values[r][c]; if(value) { this.activateNumber(value,r,c); return; } if(!this.input(r,c)) setStatus("Die Zahlenkette ist bereits vollstaendig."); },
    input(r,c) { const value=state.values[r][c], max=this.maxNumber(); if(value) { state.activeNumber=value; state.selected=[r,c]; if(!hidokuDrag) render(this.activeNumberStatus(value)); return true; } const next=this.nextNumber(); if(next>max) return false; pushHistory(); state.values[r][c]=next; state.activeNumber=next; state.selected=[r,c]; const hasError=this.conflict(r,c); if(this.checkWin()) { handleWin(); return true; } render(hasError ? `Die ${next} ist theoretisch nicht verbunden. Du kannst trotzdem ab ${next} weiterfahren.` : `Gut! Weiter mit ${this.nextStatusNumber() || "dem Pruefen der Kette"}.`); return true; },
    clear(trackHistory = true) { const level=currentLevel(); for(let n=this.maxNumber(level); n>=1;n--){ const pos=this.numberPosition(n); if(pos && !state.fixed[keyOf(pos[0],pos[1])]) { if(trackHistory) pushHistory(); state.values[pos[0]][pos[1]]=null; state.activeNumber=null; state.selected=null; render("Die groesste eingegebene Zahl ist entfernt."); return true; } } return false; },
    hint() { const level=currentLevel(); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++) if(!state.fixed[keyOf(r,c)] && state.values[r][c]!==level.solution[r][c]) { pushHistory(); state.values[r][c]=level.solution[r][c]; state.activeNumber=level.solution[r][c]; state.selected=[r,c]; render("Tipp: Eine sichere Zahl ist eingetragen. Du kannst dort weiterfahren."); checkAndWin(); return; } },
    render(level) { board.innerHTML=""; board.style.setProperty("--size", level.size); if(numberPad){ numberPad.hidden=true; numberPad.classList.remove("hidoku-pad"); numberPad.innerHTML=""; } for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const fixed=state.fixed[keyOf(r,c)]; const value=state.values[r][c] || ""; const selected=state.selected&&sameCell(state.selected,[r,c]); const cell=makeButtonCell(r,c,`cell hidoku-cell${fixed?" given":""}${selected?" selected":""}${this.conflict(r,c)?" conflict":""}`, value); cell.addEventListener("click",()=>{ if(ignoreNextHidokuClick){ ignoreNextHidokuClick=false; return; } this.select(r,c); }); board.append(cell); } if (undoButton) undoButton.disabled = !this.hasUserEntries(); },
  },
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

function isBimaruShipValue(value) { return value === 1 || value === "ship"; }
function isBimaruShipAt(grid, row, col) { return Boolean(grid[row]?.[col] !== undefined && isBimaruShipValue(grid[row][col])); }
function bimaruGridCounts(grid) { return counts(grid.map((row) => row.map((value) => isBimaruShipValue(value) ? 1 : 0))); }
function bimaruShipSegmentClass(grid, row, col) {
  const up = isBimaruShipAt(grid, row - 1, col);
  const down = isBimaruShipAt(grid, row + 1, col);
  const left = isBimaruShipAt(grid, row, col - 1);
  const right = isBimaruShipAt(grid, row, col + 1);
  const horizontal = left || right;
  const vertical = up || down;
  if (!horizontal && !vertical) return "ship-single";
  if (horizontal && !vertical) {
    if (!left) return "ship-left";
    if (!right) return "ship-right";
    return "ship-middle-horizontal";
  }
  if (vertical && !horizontal) {
    if (!up) return "ship-top";
    if (!down) return "ship-bottom";
    return "ship-middle-vertical";
  }
  return "ship-invalid";
}
function makeBimaruShipMark(grid, row, col) {
  const mark = document.createElement("span");
  mark.className = `bimaru-ship-mark ${bimaruShipSegmentClass(grid, row, col)}`;
  mark.setAttribute("aria-hidden", "true");
  return mark;
}
function collectBimaruShips(grid) {
  const ships = [];
  const visited = new Set();
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  for (let row = 0; row < rows; row += 1) for (let col = 0; col < cols; col += 1) {
    const startKey = keyOf(row, col);
    if (!isBimaruShipAt(grid, row, col) || visited.has(startKey)) continue;
    const stack = [[row, col]];
    const cells = [];
    visited.add(startKey);
    while (stack.length) {
      const [r, c] = stack.pop();
      cells.push({ row: r, col: c });
      [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([nextRow, nextCol]) => {
        const nextKey = keyOf(nextRow, nextCol);
        if (!isBimaruShipAt(grid, nextRow, nextCol) || visited.has(nextKey)) return;
        visited.add(nextKey);
        stack.push([nextRow, nextCol]);
      });
    }
    const rowSet = new Set(cells.map((cell) => cell.row));
    const colSet = new Set(cells.map((cell) => cell.col));
    ships.push({ cells, length: cells.length, validStraight: cells.length === 1 || rowSet.size === 1 || colSet.size === 1 });
  }
  return ships;
}
function bimaruInvalidShipKeys(level, grid) {
  const invalid = new Set();
  const currentCounts = bimaruGridCounts(grid);
  const maxFleetLength = Math.max(...Object.keys(level.fleet || {}).map(Number));
  collectBimaruShips(grid).forEach((ship) => {
    if (!ship.validStraight || ship.length > maxFleetLength || !level.fleet[ship.length]) {
      ship.cells.forEach((cell) => invalid.add(keyOf(cell.row, cell.col)));
    }
  });
  const byLength = {};
  collectBimaruShips(grid)
    .filter((ship) => ship.validStraight && level.fleet[ship.length])
    .forEach((ship) => {
      byLength[ship.length] = byLength[ship.length] || [];
      byLength[ship.length].push(ship);
    });
  Object.entries(byLength).forEach(([length, ships]) => {
    ships.slice(level.fleet[length] || 0).forEach((ship) => ship.cells.forEach((cell) => invalid.add(keyOf(cell.row, cell.col))));
  });
  currentCounts.rowCounts.forEach((count, row) => {
    if (count <= level.rowCounts[row]) return;
    grid[row].forEach((value, col) => { if (isBimaruShipValue(value)) invalid.add(keyOf(row, col)); });
  });
  currentCounts.colCounts.forEach((count, col) => {
    if (count <= level.colCounts[col]) return;
    grid.forEach((row, r) => { if (isBimaruShipValue(row[col])) invalid.add(keyOf(r, col)); });
  });
  for (let row = 0; row < level.size; row += 1) for (let col = 0; col < level.size; col += 1) {
    if (!isBimaruShipAt(grid, row, col)) continue;
    [[row + 1, col + 1], [row + 1, col - 1]].forEach(([nextRow, nextCol]) => {
      if (!isBimaruShipAt(grid, nextRow, nextCol)) return;
      invalid.add(keyOf(row, col));
      invalid.add(keyOf(nextRow, nextCol));
    });
  }
  return invalid;
}
function bimaruFleetLengths(level) {
  return Object.entries(level.fleet || {})
    .flatMap(([length, count]) => Array.from({ length: count }, () => Number(length)))
    .sort((a, b) => a - b);
}
function splitBimaruFleet(level) {
  const right = [];
  const bottom = [];
  bimaruFleetLengths(level).forEach((length) => (length === 1 ? right : bottom).push(length));
  while (bottom.length > 3) right.push(bottom.shift());
  if (!right.length && bottom.length > 2) right.push(bottom.shift());
  return { right, bottom };
}
function bimaruFleetUsedCounts(level, grid) {
  const used = {};
  collectBimaruShips(grid).forEach((ship) => {
    if (!ship.validStraight || !level.fleet[ship.length]) return;
    used[ship.length] = Math.min((used[ship.length] || 0) + 1, level.fleet[ship.length]);
  });
  return used;
}
function bimaruFleetSegmentClass(length, index, orientation) {
  if (length === 1) return "ship-single";
  if (orientation === "vertical") {
    if (index === 0) return "ship-top";
    if (index === length - 1) return "ship-bottom";
    return "ship-middle-vertical";
  }
  if (index === 0) return "ship-left";
  if (index === length - 1) return "ship-right";
  return "ship-middle-horizontal";
}
function makeBimaruFleetShip(length, orientation, placed) {
  const ship = document.createElement("div");
  ship.className = `bimaru-fleet-ship ${orientation}${placed ? " placed" : ""}`;
  ship.setAttribute("aria-label", `${length}er-Schiff${placed ? " platziert" : ""}`);
  for (let index = 0; index < length; index += 1) {
    const part = document.createElement("span");
    part.className = `bimaru-fleet-segment ${bimaruFleetSegmentClass(length, index, orientation)}`;
    ship.append(part);
  }
  return ship;
}
function renderBimaruFleetPanel(lengths, orientation, used, usedCursor) {
  const panel = document.createElement("div");
  panel.className = `bimaru-fleet-panel ${orientation}`;
  panel.setAttribute("aria-label", orientation === "vertical" ? "Flotte am rechten Rand" : "Flotte am unteren Rand");
  lengths.forEach((length) => {
    usedCursor[length] = usedCursor[length] || 0;
    const placed = usedCursor[length] < (used[length] || 0);
    usedCursor[length] += 1;
    panel.append(makeBimaruFleetShip(length, orientation, placed));
  });
  return panel;
}
function makeBimaruCountLabel(target, current, kind, index) {
  const label = document.createElement("div");
  label.className = `count-label ${kind}-count${current === target ? " complete" : ""}${current > target ? " over" : ""}`;
  label.textContent = target;
  label.setAttribute("aria-label", `${kind === "row" ? "Zeile" : "Spalte"} ${index + 1}: ${target} Schiffsteile, aktuell ${current}`);
  return label;
}
function placeGridItem(element, row, col, rowSpan = 1, colSpan = 1) {
  element.style.gridRow = rowSpan === 1 ? String(row) : `${row} / span ${rowSpan}`;
  element.style.gridColumn = colSpan === 1 ? String(col) : `${col} / span ${colSpan}`;
  board.append(element);
}
function renderBimaruBoard(level, makeCell) {
  board.innerHTML = "";
  board.classList.add("bimaru-count-board");
  board.style.setProperty("--size", level.size);
  board.style.setProperty("--bimaru-size", level.size);
  const currentCounts = bimaruGridCounts(state.grid);
  const fleet = splitBimaruFleet(level);
  const used = bimaruFleetUsedCounts(level, state.grid);
  const usedCursor = {};
  placeGridItem(Object.assign(document.createElement("div"), { className: "count-corner" }), 1, 1);
  level.colCounts.forEach((target, col) => placeGridItem(makeBimaruCountLabel(target, currentCounts.colCounts[col], "col", col), 1, col + 2));
  placeGridItem(renderBimaruFleetPanel(fleet.right, "vertical", used, usedCursor), 2, level.size + 2, level.size);
  for (let r = 0; r < level.size; r += 1) {
    placeGridItem(makeBimaruCountLabel(level.rowCounts[r], currentCounts.rowCounts[r], "row", r), r + 2, 1);
    for (let c = 0; c < level.size; c += 1) placeGridItem(makeCell(r, c), r + 2, c + 2);
  }
  placeGridItem(renderBimaruFleetPanel(fleet.bottom, "horizontal", used, usedCursor), level.size + 2, 2, 1, level.size);
}


if (currentGame && LEVELS_BY_GAME[currentGame]) renderDifficultySelect();
if (undoButton) undoButton.addEventListener("click", undo);
if (resetButton) resetButton.addEventListener("click", resetGame);
if (hintButton) hintButton.addEventListener("click", handleHint);
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

function shikakuCellFromPoint(clientX, clientY) {
  if (!board || currentGame !== "shikaku") return null;
  const direct = document.elementFromPoint(clientX, clientY)?.closest(".shikaku-cell");
  if (direct && board.contains(direct)) return direct;
  const level = currentLevel();
  const rect = board.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
  const col = Math.min(level.cols - 1, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * level.cols)));
  const row = Math.min(level.rows - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * level.rows)));
  return board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function hidokuCellFromPoint(clientX, clientY) {
  if (!board || currentGame !== "hidoku") return null;
  const direct = document.elementFromPoint(clientX, clientY)?.closest(".hidoku-cell");
  if (direct && board.contains(direct)) return direct;
  const level = currentLevel();
  const rect = board.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
  const col = Math.min(level.size - 1, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * level.size)));
  const row = Math.min(level.size - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * level.size)));
  return board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}
function drawHidokuCell(row, col) {
  if (!hidokuDrag) return;
  const nextKey = cellKeyFromPoint(row, col);
  if (nextKey === hidokuDrag.lastKey) return;
  hidokuDrag.lastKey = nextKey;
  GAME_HANDLERS.hidoku.input(row, col);
}
function startHidokuPointer(event, cell) {
  const handler = GAME_HANDLERS.hidoku;
  const row = Number(cell.dataset.row), col = Number(cell.dataset.col);
  const value = state.values[row][col];
  if (!value && !handler.nextStatusNumber()) return false;
  event.preventDefault();
  if (value) {
    state.activeNumber = value;
    state.selected = [row, col];
  } else {
    state.selected = null;
  }
  hidokuDrag = { pointerId: event.pointerId, lastKey: null };
  activePointerId = event.pointerId;
  board.setPointerCapture?.(event.pointerId);
  if (value) setStatus(handler.dragStartStatus(value));
  drawHidokuCell(row, col);
  return true;
}
function finishHidokuPointer() {
  if (!hidokuDrag) return;
  hidokuDrag = null;
  activePointerId = null;
  ignoreNextHidokuClick = true;
  finishMove();
}
function startShikakuPointer(event, cell) {
  const handler = GAME_HANDLERS.shikaku;
  const level = currentLevel();
  const row = Number(cell.dataset.row), col = Number(cell.dataset.col);
  const touchedClue = handler.clueAt(level, row, col);
  const selectedClue = state.selected ? handler.clueAt(level, state.selected.row, state.selected.col) : null;
  event.preventDefault();
  beginMove();
  shikakuDrag = {
    pointerId: event.pointerId,
    startRow: row,
    startCol: col,
    lastRow: row,
    lastCol: col,
    moved: false,
    touchedClueKey: touchedClue ? handler.clueKey(touchedClue) : null,
    selectedClueKey: selectedClue ? handler.clueKey(selectedClue) : null,
  };
  activePointerId = event.pointerId;
  board.setPointerCapture?.(event.pointerId);
  if (touchedClue) handler.previewDrag(touchedClue, row, col);
  else if (selectedClue) handler.previewDrag(selectedClue, row, col);
  else handler.previewRectangle(row, col, row, col);
  return true;
}
function updateShikakuPointer(clientX, clientY) {
  if (!shikakuDrag) return;
  const el = shikakuCellFromPoint(clientX, clientY);
  if (!el) return;
  const row = Number(el.dataset.row), col = Number(el.dataset.col);
  if (row === shikakuDrag.lastRow && col === shikakuDrag.lastCol) return;
  shikakuDrag.lastRow = row;
  shikakuDrag.lastCol = col;
  shikakuDrag.moved = shikakuDrag.moved || row !== shikakuDrag.startRow || col !== shikakuDrag.startCol;
  GAME_HANDLERS.shikaku.previewRectangle(shikakuDrag.startRow, shikakuDrag.startCol, row, col);
}
function finishShikakuPointer() {
  if (!shikakuDrag) return;
  const { startRow, startCol, lastRow, lastCol, moved, touchedClueKey, selectedClueKey } = shikakuDrag;
  shikakuDrag = null;
  activePointerId = null;
  ignoreNextShikakuClick = true;
  const handler = GAME_HANDLERS.shikaku;
  const level = currentLevel();
  const touchedClue = touchedClueKey ? handler.clueFromKey(level, touchedClueKey) : null;
  const selectedClue = selectedClueKey ? handler.clueFromKey(level, selectedClueKey) : null;
  if (!moved && touchedClue) {
    handler.clearDragPreview();
    if (handler.clearClueRegion(touchedClue)) { finishMove(); return; }
    handler.selectClue(touchedClue);
  } else if (!moved && selectedClue) {
    handler.clearDragPreview();
    handler.commitCells(handler.rectangleCells(level, selectedClue, lastRow, lastCol));
  } else {
    handler.finishRectangle(startRow, startCol, lastRow, lastCol, moved);
  }
  finishMove();
}
function cancelShikakuPointer() {
  if (!shikakuDrag) return;
  shikakuDrag = null;
  activePointerId = null;
  ignoreNextShikakuClick = true;
  GAME_HANDLERS.shikaku.finishRectangle(0, 0, 0, 0, false);
  finishMove();
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
  if (currentGame === "arukone" && isDrawing && event.pointerId === activePointerId) {
    event.preventDefault();
    const el = arukoneCellFromPoint(event.clientX, event.clientY);
    if (!el) return;
    drawArukoneCell(Number(el.dataset.row), Number(el.dataset.col));
  } else if (currentGame === "shikaku" && shikakuDrag && event.pointerId === activePointerId) {
    event.preventDefault();
    updateShikakuPointer(event.clientX, event.clientY);
  } else if (currentGame === "hidoku" && hidokuDrag && event.pointerId === activePointerId) {
    event.preventDefault();
    const el = hidokuCellFromPoint(event.clientX, event.clientY);
    if (!el) return;
    drawHidokuCell(Number(el.dataset.row), Number(el.dataset.col));
  }
}, { passive: false });
document.addEventListener("pointerup", (event) => {
  if (currentGame === "arukone" && event.pointerId === activePointerId) finishArukonePointer();
  else if (currentGame === "shikaku" && shikakuDrag && event.pointerId === activePointerId) finishShikakuPointer();
  else if (currentGame === "hidoku" && hidokuDrag && event.pointerId === activePointerId) finishHidokuPointer();
});
document.addEventListener("pointercancel", (event) => {
  if (currentGame === "arukone" && event.pointerId === activePointerId) finishArukonePointer();
  else if (currentGame === "shikaku" && shikakuDrag && event.pointerId === activePointerId) cancelShikakuPointer();
  else if (currentGame === "hidoku" && hidokuDrag && event.pointerId === activePointerId) finishHidokuPointer();
});
if (board) board.addEventListener("pointerdown", (event) => {
  if (currentGame === "arukone") {
    const cell = event.target.closest(".arukone-cell");
    if (!cell) return;
    event.preventDefault();
    beginMove();
    isDrawing = true;
    activePointerId = event.pointerId;
    board.setPointerCapture?.(event.pointerId);
    drawArukoneCell(Number(cell.dataset.row), Number(cell.dataset.col));
  } else if (currentGame === "shikaku") {
    const cell = event.target.closest(".shikaku-cell");
    if (!cell) return;
    startShikakuPointer(event, cell);
  } else if (currentGame === "hidoku") {
    const cell = event.target.closest(".hidoku-cell");
    if (!cell) return;
    beginMove();
    const started = startHidokuPointer(event, cell);
    if (!started || !hidokuDrag) finishMove();
  }
}, { passive: false });
