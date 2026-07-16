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
  medium: { label: "Mittel", code: 2, icon: "🪐" },
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
    rules: ["Die Zahlen am oberen und linken Rand zeigen, wie viele Schiffsteile in der jeweiligen Spalte oder Zeile liegen.", "Am rechten und unteren Rand siehst du die Flotte, die im Raster versteckt ist.", "Kurz tippen markiert Wasser. Langer Druck setzt ein Schiffsteil. Kurzes Antippen auf ein Schiffsteil löscht es."],
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
    rules: ["Lies die Rechenaufgabe genau.", "Tippe auf die passende Zahl.", "Wenn es nicht passt, probiere es in Ruhe noch einmal."],
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
  oddOneOut: {
    title: "Was passt nicht?", eyebrow: "Kategorien finden", code: "O",
    subtitle: "Finde den Gegenstand, der nicht zu den anderen passt.",
    success: "Adlerauge! Du hast alle Kuckuckseier gefunden.",
    rules: ["Schau dir die vier Bilder genau an.", "Überlege, was drei der Bilder gemeinsam haben.", "Tippe auf das Bild, das als Einziges anders ist."],
  },
  whatFits: {
    title: "Was passt?", eyebrow: "Zusammenhänge finden", code: "V",
    subtitle: "Finde den Gegenstand, der am besten zum Hauptbild passt.",
    success: "Sehr gut kombiniert! Du hast gefunden, was zusammenpasst.",
    rules: ["Schau dir zuerst den grossen Hauptgegenstand an.", "Überlege, was man damit benutzt oder was logisch dazugehört.", "Tippe auf die Antwortkarte, die am besten passt."],
  },
  readingPuzzle: {
    title: "Wortdetektiv", eyebrow: "Leserätsel", code: "W",
    subtitle: "Erkenne Buchstaben, Wörter und kurze Sätze passend zum Bild.",
    success: "Richtig gelesen! Du hast die Leserätsel geschafft.",
    rules: ["Schau dir zuerst das Bild an.", "Lies das Wort oder den Satz in Ruhe.", "Tippe auf die Antwort, die genau passt."],
  },
  spatialPuzzle: {
    title: "Raumdetektiv", eyebrow: "Würfelblick", code: "D",
    subtitle: "Erkenne Würfelgebäude, Ansichten, Drehungen und Würfelnetze.",
    success: "Stark kombiniert! Du hast den Würfelbau durchschaut.",
    rules: ["Schau dir den Würfelbau oder Würfel genau an.", "Drehe ihn im Kopf oder vergleiche die Ansicht.", "Tippe auf die Antwortkarte, die wirklich passt."],
  },
  backpack: {
    title: "Rucksack packen", eyebrow: "Endlosspiel", code: "R",
    subtitle: "Merke dir, was schon im Rucksack liegt, und packe alles in der richtigen Reihenfolge ein.",
    success: "Super gemerkt! Der Rucksack ist richtig gepackt.",
    rules: ["Wähle zuerst einen neuen Gegenstand für den Rucksack.", "Packe danach alle Gegenstände in der gemerkten Reihenfolge ein.", "Nach einer gespielten Runde wird die nächste Schwierigkeit frei."],
  },
  memory: {
    title: "Memory",
    eyebrow: "Merken & Paare finden",
    code: "M",
    subtitle: "Decke immer zwei Karten auf und finde alle Paare mit möglichst wenigen Zügen.",
    success: "Stark gemerkt! Du hast alle Paare gefunden.",
    rules: [
      "Decke zwei Karten auf.",
      "Sind beide Karten gleich, verschwinden sie.",
      "Sind sie verschieden, merke sie dir gut.",
      "Wenn alle Paare gefunden sind, ist das Level geschafft.",
    ],
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
  easy: { choiceCount: 3, poolSize: 45, showLabels: true },
  medium: { choiceCount: 4, poolSize: 60, showLabels: true },
  hard: { choiceCount: 5, poolSize: 75, showLabels: false },
  extreme: { choiceCount: 6, poolSize: 90, showLabels: false },
};
const BACKPACK_ITEMS = [
  { id: "apple", emoji: "🍎", label: "Apfel" },
  { id: "ball", emoji: "⚽", label: "Ball" },
  { id: "book", emoji: "📘", label: "Buch" },
  { id: "kite", emoji: "🪁", label: "Flugdrachen" },
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
  { id: "gift", emoji: "🎁", label: "Geschenk" },
  { id: "balloon", emoji: "🎈", label: "Ballon" },
  { id: "cup", emoji: "🥤", label: "Becher" },
  { id: "sandwich", emoji: "🥪", label: "Sandwich" },
  { id: "cheese", emoji: "🧀", label: "Käse" },
  { id: "grapes", emoji: "🍇", label: "Trauben" },
  { id: "carrot", emoji: "🥕", label: "Rüebli" },
  { id: "corn", emoji: "🌽", label: "Mais" },
  { id: "strawberry", emoji: "🍓", label: "Erdbeere" },
  { id: "chocolate", emoji: "🍫", label: "Schoggi" },
  { id: "lollipop", emoji: "🍭", label: "Lolli" },
  { id: "shoe", emoji: "👟", label: "Schuh" },
  { id: "sock", emoji: "🧦", label: "Socke" },
  { id: "glove", emoji: "🧤", label: "Handschuh" },
  { id: "scarf", emoji: "🧣", label: "Schal" },
  { id: "sunglasses", emoji: "🕶️", label: "Sonnenbrille" },
  { id: "camera", emoji: "📷", label: "Kamera" },
  { id: "phone", emoji: "📱", label: "Telefon" },
  { id: "headphones", emoji: "🎧", label: "Kopfhörer" },
  { id: "microphone", emoji: "🎤", label: "Mikrofon" },
  { id: "drum", emoji: "🥁", label: "Trommel" },
  { id: "guitar", emoji: "🎸", label: "Gitarre" },
  { id: "trumpet", emoji: "🎺", label: "Trompete" },
  { id: "violin", emoji: "🎻", label: "Geige" },
  { id: "crown", emoji: "👑", label: "Krone" },
  { id: "ring", emoji: "💍", label: "Ring" },
  { id: "gem", emoji: "💎", label: "Edelstein" },
  { id: "envelope", emoji: "✉️", label: "Brief" },
  { id: "mailbox", emoji: "📮", label: "Briefkasten" },
  { id: "paperclip", emoji: "📎", label: "Büroklammer" },
  { id: "scissors", emoji: "✂️", label: "Schere" },
  { id: "ruler", emoji: "📏", label: "Lineal" },
  { id: "calculator", emoji: "🧮", label: "Rechner" },
  { id: "laptop", emoji: "💻", label: "Laptop" },
  { id: "battery", emoji: "🔋", label: "Batterie" },
  { id: "flashlight", emoji: "🔦", label: "Taschenlampe" },
  { id: "magnet", emoji: "🧲", label: "Magnet" },
  { id: "compass", emoji: "🧭", label: "Kompass" },
  { id: "telescope", emoji: "🔭", label: "Fernrohr" },
  { id: "hammer", emoji: "🔨", label: "Hammer" },
  { id: "wrench", emoji: "🔧", label: "Schraubenschlüssel" },
  { id: "gear", emoji: "⚙️", label: "Zahnrad" },
  { id: "bucket", emoji: "🪣", label: "Eimer" },
  { id: "soap", emoji: "🧼", label: "Seife" },
  { id: "toothbrush", emoji: "🪥", label: "Zahnbürste" },
  { id: "bandage", emoji: "🩹", label: "Pflaster" },
  { id: "thermometer", emoji: "🌡️", label: "Thermometer" },
  { id: "pill", emoji: "💊", label: "Tablette" },
  { id: "tent", emoji: "⛺", label: "Zelt" },
  { id: "house", emoji: "🏠", label: "Haus" },
  { id: "bicycle", emoji: "🚲", label: "Velo" },
  { id: "bus", emoji: "🚌", label: "Bus" },
  { id: "airplane", emoji: "✈️", label: "Flugzeug" },
  { id: "boat", emoji: "⛵", label: "Segelboot" },
  { id: "anchor", emoji: "⚓", label: "Anker" },
  { id: "sun", emoji: "☀️", label: "Sonne" },
  { id: "moon", emoji: "🌙", label: "Mond" },
  { id: "cloud", emoji: "☁️", label: "Wolke" },
  { id: "rainbow", emoji: "🌈", label: "Regenbogen" },
  { id: "snowflake", emoji: "❄️", label: "Schneeflocke" },
  { id: "fire", emoji: "🔥", label: "Feuer" },
  { id: "drop", emoji: "💧", label: "Wassertropfen" },
  { id: "leaf", emoji: "🍃", label: "Blatt" },
  { id: "tree", emoji: "🌳", label: "Baum" },
  { id: "mushroom", emoji: "🍄", label: "Pilz" },
  { id: "butterfly", emoji: "🦋", label: "Schmetterling" },
  { id: "bee", emoji: "🐝", label: "Biene" },
  { id: "ladybug", emoji: "🐞", label: "Marienkäfer" },
  { id: "fish", emoji: "🐟", label: "Fisch" },
  { id: "frog", emoji: "🐸", label: "Frosch" },
  { id: "turtle", emoji: "🐢", label: "Schildkröte" },
  { id: "bird", emoji: "🐦", label: "Vogel" },
  { id: "cat", emoji: "🐱", label: "Katze" },
  { id: "dog", emoji: "🐶", label: "Hund" },
  { id: "mouse", emoji: "🐭", label: "Maus" },
  { id: "rabbit", emoji: "🐰", label: "Hase" },
  { id: "horse", emoji: "🐴", label: "Pferd" },
  { id: "cow", emoji: "🐮", label: "Kuh" },
  { id: "lion", emoji: "🦁", label: "Löwe" },
  { id: "elephant", emoji: "🐘", label: "Elefant" },
  { id: "whale", emoji: "🐳", label: "Wal" },
];
const BACKPACK_ITEM_BY_ID = Object.fromEntries(BACKPACK_ITEMS.map((item) => [item.id, item]));
const BACKPACK_LEVELS = DIFFICULTY_KEYS.map((difficulty) => makeLevel("backpack", difficulty, 1, {
  id: `backpack-${difficulty}`,
  badge: "Endlos",
  description: `${DIFFICULTIES[difficulty].label}: ${BACKPACK_DIFFICULTY_RULES[difficulty].choiceCount} Auswahlkarten pro Schritt.`,
}));

const MEMORY_DIFFICULTY_RULES = {
  easy: { showLabels: true, flipBackDelayMs: 1100 },
  medium: { showLabels: true, flipBackDelayMs: 1000 },
  hard: { showLabels: false, flipBackDelayMs: 900 },
  extreme: { showLabels: false, flipBackDelayMs: 800 },
};
const MEMORY_MATCH_HIDE_DELAY_MS = 1000;

const MEMORY_LEVEL_DATA = {
  easy: [
    { pairCount: 4, threeStarMoves: 7, twoStarMoves: 10, oneStarFrom: 11 },
    { pairCount: 4, threeStarMoves: 7, twoStarMoves: 10, oneStarFrom: 11 },
    { pairCount: 5, threeStarMoves: 8, twoStarMoves: 12, oneStarFrom: 13 },
    { pairCount: 5, threeStarMoves: 8, twoStarMoves: 12, oneStarFrom: 13 },
    { pairCount: 6, threeStarMoves: 10, twoStarMoves: 15, oneStarFrom: 16 },
    { pairCount: 6, threeStarMoves: 10, twoStarMoves: 15, oneStarFrom: 16 },
    { pairCount: 7, threeStarMoves: 12, twoStarMoves: 17, oneStarFrom: 18 },
    { pairCount: 7, threeStarMoves: 12, twoStarMoves: 17, oneStarFrom: 18 },
    { pairCount: 8, threeStarMoves: 13, twoStarMoves: 20, oneStarFrom: 21 },
    { pairCount: 8, threeStarMoves: 13, twoStarMoves: 20, oneStarFrom: 21 },
  ],
  medium: [
    { pairCount: 8, threeStarMoves: 14, twoStarMoves: 21, oneStarFrom: 22 },
    { pairCount: 9, threeStarMoves: 16, twoStarMoves: 24, oneStarFrom: 25 },
    { pairCount: 9, threeStarMoves: 16, twoStarMoves: 24, oneStarFrom: 25 },
    { pairCount: 10, threeStarMoves: 18, twoStarMoves: 26, oneStarFrom: 27 },
    { pairCount: 10, threeStarMoves: 18, twoStarMoves: 26, oneStarFrom: 27 },
    { pairCount: 11, threeStarMoves: 20, twoStarMoves: 29, oneStarFrom: 30 },
    { pairCount: 11, threeStarMoves: 20, twoStarMoves: 29, oneStarFrom: 30 },
    { pairCount: 12, threeStarMoves: 21, twoStarMoves: 32, oneStarFrom: 33 },
    { pairCount: 12, threeStarMoves: 21, twoStarMoves: 32, oneStarFrom: 33 },
    { pairCount: 13, threeStarMoves: 23, twoStarMoves: 34, oneStarFrom: 35 },
  ],
  hard: [
    { pairCount: 12, threeStarMoves: 23, twoStarMoves: 35, oneStarFrom: 36 },
    { pairCount: 13, threeStarMoves: 25, twoStarMoves: 38, oneStarFrom: 39 },
    { pairCount: 14, threeStarMoves: 27, twoStarMoves: 40, oneStarFrom: 41 },
    { pairCount: 14, threeStarMoves: 27, twoStarMoves: 40, oneStarFrom: 41 },
    { pairCount: 15, threeStarMoves: 29, twoStarMoves: 43, oneStarFrom: 44 },
    { pairCount: 15, threeStarMoves: 29, twoStarMoves: 43, oneStarFrom: 44 },
    { pairCount: 16, threeStarMoves: 31, twoStarMoves: 46, oneStarFrom: 47 },
    { pairCount: 16, threeStarMoves: 31, twoStarMoves: 46, oneStarFrom: 47 },
    { pairCount: 18, threeStarMoves: 35, twoStarMoves: 52, oneStarFrom: 53 },
    { pairCount: 18, threeStarMoves: 35, twoStarMoves: 52, oneStarFrom: 53 },
  ],
  extreme: [
    { pairCount: 16, threeStarMoves: 33, twoStarMoves: 52, oneStarFrom: 53 },
    { pairCount: 18, threeStarMoves: 37, twoStarMoves: 58, oneStarFrom: 59 },
    { pairCount: 18, threeStarMoves: 37, twoStarMoves: 58, oneStarFrom: 59 },
    { pairCount: 20, threeStarMoves: 41, twoStarMoves: 64, oneStarFrom: 65 },
    { pairCount: 20, threeStarMoves: 41, twoStarMoves: 64, oneStarFrom: 65 },
    { pairCount: 21, threeStarMoves: 44, twoStarMoves: 68, oneStarFrom: 69 },
    { pairCount: 21, threeStarMoves: 44, twoStarMoves: 68, oneStarFrom: 69 },
    { pairCount: 22, threeStarMoves: 46, twoStarMoves: 71, oneStarFrom: 72 },
    { pairCount: 24, threeStarMoves: 50, twoStarMoves: 77, oneStarFrom: 78 },
    { pairCount: 24, threeStarMoves: 50, twoStarMoves: 77, oneStarFrom: 78 },
  ],
};

const MEMORY_LEVEL_DESCRIPTIONS = {
  easy: "Kleine Memory-Felder mit gut erkennbaren Bildern.",
  medium: "Mehr Paare und etwas mehr Merkarbeit.",
  hard: "Viele Karten und keine Textlabels mehr.",
  extreme: "Sehr viele Paare für echte Memory-Profis.",
};

const MEMORY_LEVELS = DIFFICULTY_KEYS.flatMap((difficulty) =>
  MEMORY_LEVEL_DATA[difficulty].map((data, index) =>
    makeLevel("memory", difficulty, index + 1, {
      ...data,
      targetCount: data.pairCount,
      badge: `${data.pairCount} Paare`,
      description: MEMORY_LEVEL_DESCRIPTIONS[difficulty],
    })
  )
);

const MEMORY_ITEMS = [
  { id: "apple", emoji: "🍎", label: "Apfel" },
  { id: "banana", emoji: "🍌", label: "Banane" },
  { id: "grapes", emoji: "🍇", label: "Trauben" },
  { id: "strawberry", emoji: "🍓", label: "Erdbeere" },
  { id: "carrot", emoji: "🥕", label: "Rüebli" },
  { id: "corn", emoji: "🌽", label: "Mais" },
  { id: "cheese", emoji: "🧀", label: "Käse" },
  { id: "bread", emoji: "🍞", label: "Brot" },
  { id: "sandwich", emoji: "🥪", label: "Sandwich" },
  { id: "cookie", emoji: "🍪", label: "Keks" },
  { id: "chocolate", emoji: "🍫", label: "Schoggi" },
  { id: "lollipop", emoji: "🍭", label: "Lolli" },
  { id: "ball", emoji: "⚽", label: "Ball" },
  { id: "dice", emoji: "🎲", label: "Würfel" },
  { id: "puzzle", emoji: "🧩", label: "Puzzle" },
  { id: "teddy", emoji: "🧸", label: "Teddy" },
  { id: "book", emoji: "📘", label: "Buch" },
  { id: "pencil", emoji: "✏️", label: "Stift" },
  { id: "scissors", emoji: "✂️", label: "Schere" },
  { id: "ruler", emoji: "📏", label: "Lineal" },
  { id: "key", emoji: "🔑", label: "Schlüssel" },
  { id: "lock", emoji: "🔒", label: "Schloss" },
  { id: "gift", emoji: "🎁", label: "Geschenk" },
  { id: "balloon", emoji: "🎈", label: "Ballon" },
  { id: "crown", emoji: "👑", label: "Krone" },
  { id: "flower", emoji: "🌸", label: "Blume" },
  { id: "leaf", emoji: "🍃", label: "Blatt" },
  { id: "tree", emoji: "🌳", label: "Baum" },
  { id: "mushroom", emoji: "🍄", label: "Pilz" },
  { id: "sun", emoji: "☀️", label: "Sonne" },
  { id: "moon", emoji: "🌙", label: "Mond" },
  { id: "cloud", emoji: "☁️", label: "Wolke" },
  { id: "rainbow", emoji: "🌈", label: "Regenbogen" },
  { id: "snowflake", emoji: "❄️", label: "Schneeflocke" },
  { id: "fire", emoji: "🔥", label: "Feuer" },
  { id: "drop", emoji: "💧", label: "Wassertropfen" },
  { id: "umbrella", emoji: "☂️", label: "Schirm" },
  { id: "hat", emoji: "🧢", label: "Kappe" },
  { id: "shoe", emoji: "👟", label: "Schuh" },
  { id: "sock", emoji: "🧦", label: "Socke" },
  { id: "glove", emoji: "🧤", label: "Handschuh" },
  { id: "scarf", emoji: "🧣", label: "Schal" },
  { id: "sunglasses", emoji: "🕶️", label: "Sonnenbrille" },
  { id: "camera", emoji: "📷", label: "Kamera" },
  { id: "phone", emoji: "📱", label: "Telefon" },
  { id: "headphones", emoji: "🎧", label: "Kopfhörer" },
  { id: "drum", emoji: "🥁", label: "Trommel" },
  { id: "guitar", emoji: "🎸", label: "Gitarre" },
  { id: "trumpet", emoji: "🎺", label: "Trompete" },
  { id: "train", emoji: "🚂", label: "Zug" },
  { id: "car", emoji: "🚗", label: "Auto" },
  { id: "bicycle", emoji: "🚲", label: "Velo" },
  { id: "airplane", emoji: "✈️", label: "Flugzeug" },
  { id: "boat", emoji: "⛵", label: "Segelboot" },
  { id: "rocket", emoji: "🚀", label: "Rakete" },
  { id: "compass", emoji: "🧭", label: "Kompass" },
  { id: "magnifier", emoji: "🔎", label: "Lupe" },
  { id: "telescope", emoji: "🔭", label: "Fernrohr" },
  { id: "magnet", emoji: "🧲", label: "Magnet" },
  { id: "battery", emoji: "🔋", label: "Batterie" },
  { id: "flashlight", emoji: "🔦", label: "Taschenlampe" },
  { id: "hammer", emoji: "🔨", label: "Hammer" },
  { id: "wrench", emoji: "🔧", label: "Schraubenschlüssel" },
  { id: "bucket", emoji: "🪣", label: "Eimer" },
  { id: "soap", emoji: "🧼", label: "Seife" },
  { id: "toothbrush", emoji: "🪥", label: "Zahnbürste" },
  { id: "bandage", emoji: "🩹", label: "Pflaster" },
  { id: "thermometer", emoji: "🌡️", label: "Thermometer" },
  { id: "cat", emoji: "🐱", label: "Katze" },
  { id: "dog", emoji: "🐶", label: "Hund" },
  { id: "rabbit", emoji: "🐰", label: "Hase" },
  { id: "fish", emoji: "🐟", label: "Fisch" },
  { id: "butterfly", emoji: "🦋", label: "Schmetterling" },
  { id: "bee", emoji: "🐝", label: "Biene" },
  { id: "turtle", emoji: "🐢", label: "Schildkröte" },
  { id: "elephant", emoji: "🐘", label: "Elefant" },
];

function buildMemoryCards(level) {
  const selectedItems = shuffleOptions(MEMORY_ITEMS).slice(0, level.pairCount);

  const cards = selectedItems.flatMap((item) => [
    {
      cardId: `${item.id}-a`,
      pairId: item.id,
      emoji: item.emoji,
      label: item.label,
      isFaceUp: false,
      isMatched: false,
    },
    {
      cardId: `${item.id}-b`,
      pairId: item.id,
      emoji: item.emoji,
      label: item.label,
      isFaceUp: false,
      isMatched: false,
    },
  ]);

  return shuffleOptions(cards);
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
const SEQUENCE_OPTION_MIN = 0;
const SEQUENCE_OPTION_MAX = 999;
const SEQUENCE_DISTRACTOR_OFFSETS = {
  easy: [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5],
  medium: [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -10, 10],
  hard: [-1, 1, -2, 2, -3, 3, -5, 5, -10, 10, -20, 20, -50, 50],
  extreme: [-1, 1, -2, 2, -3, 3, -5, 5, -10, 10, -20, 20, -50, 50, -100, 100],
};
function sequenceDistractorCandidates(item, difficulty, optionCount) {
  const visibleValues = new Set(item.seq.filter(Number.isInteger));
  const offsets = shuffleOptions(SEQUENCE_DISTRACTOR_OFFSETS[difficulty] || SEQUENCE_DISTRACTOR_OFFSETS.easy)
    .filter((offset) => {
      const value = item.answer + offset;
      return value >= SEQUENCE_OPTION_MIN && value <= SEQUENCE_OPTION_MAX && !visibleValues.has(value);
    });
  const selectedOffsets = offsets.slice(0, optionCount - 1);
  if (selectedOffsets.length === 2 && selectedOffsets.every((offset) => Math.abs(offset) === 1)) {
    const replacement = offsets.find((offset) => Math.abs(offset) !== 1);
    if (Number.isInteger(replacement)) {
      const neighbor = pickRandom(selectedOffsets);
      const orderedOffsets = [neighbor, replacement, ...offsets.filter((offset) => offset !== neighbor && offset !== replacement)];
      return orderedOffsets.map((offset) => item.answer + offset);
    }
  }
  return offsets.map((offset) => item.answer + offset);
}
function generateSequenceTask(difficulty) {
  const safeDifficulty = DIFFICULTIES[difficulty] ? difficulty : "easy";
  const pool = SEQUENCE_ITEMS.filter((item) => item.diff === safeDifficulty);
  const item = pickRandom(pool);
  const optionCount = safeDifficulty === "easy" || safeDifficulty === "medium" ? 3 : 4;
  const candidates = sequenceDistractorCandidates(item, safeDifficulty, optionCount);
  return {
    id: `seq-${safeDifficulty}-${item.id}-${Date.now()}-${randomInt(1000, 9999)}`,
    sourceId: item.id,
    puzzleType: "sequencePuzzle",
    difficulty: safeDifficulty,
    sequence: item.seq,
    correctAnswer: item.answer,
    options: ensureUniqueOptions(item.answer, candidates, optionCount, SEQUENCE_OPTION_MIN, SEQUENCE_OPTION_MAX),
  };
}
function sequenceTaskKey(task) {
  return [task.puzzleType, task.difficulty, task.sourceId || task.id].join(":");
}

const SHAPE_POOL = ["🔴", "🔵", "🟡", "🟢", "🟥", "🟦", "🟨", "🟩", "🔺", "🔻", "🪐", "🌙", "☀️", "☁️", "💖", "🔶", "🔷"];

const SHAPE_SEQUENCE_ITEMS = [
  { id: "e1", seq: ["🔴", "🔵", "🔴", "🔵", null], answer: "🔴", diff: "easy" },
  { id: "e2", seq: ["🟩", "🟩", "🟡", "🟡", null], answer: "🟩", diff: "easy" },
  { id: "e3", seq: ["🔺", "🪐", "🔺", "🪐", null], answer: "🔺", diff: "easy" },
  { id: "e4", seq: ["🟦", "🔴", "🟡", "🟦", null], answer: "🔴", diff: "easy" },
  { id: "e5", seq: ["🪐", "🌙", "🪐", "🌙", null], answer: "🪐", diff: "easy" },
  { id: "e6", seq: ["💖", "🟩", "💖", "🟩", null], answer: "💖", diff: "easy" },
  { id: "e7", seq: ["🔵", "🔵", "🔴", "🔵", null], answer: "🔵", diff: "easy" },
  { id: "e8", seq: ["🔺", "🔻", "🔺", "🔻", null], answer: "🔺", diff: "easy" },
  { id: "e9", seq: ["🟡", "🟩", "🔵", "🟡", null], answer: "🟩", diff: "easy" },
  { id: "e10", seq: ["🟥", "🟦", "🟥", "🟦", null], answer: "🟥", diff: "easy" },
  { id: "e11", seq: ["🔴", "🔴", "🔵", "🔴", null], answer: "🔴", diff: "easy" },
  { id: "e12", seq: ["🔶", "🔷", "🔶", "🔷", null], answer: "🔶", diff: "easy" },

  { id: "m1", seq: ["🔴", "🟦", "🟡", "🔴", "🟦", null], answer: "🟡", diff: "medium" },
  { id: "m2", seq: ["🪐", "🌙", "☁️", "🪐", "🌙", null], answer: "☁️", diff: "medium" },
  { id: "m3", seq: ["🔺", "🔴", "🔺", "🟦", "🔺", null], answer: "🔴", diff: "medium" },
  { id: "m4", seq: ["🟩", "🟡", "🟡", "🟩", "🟡", null], answer: "🟡", diff: "medium" },
  { id: "m5", seq: ["🔴", "🔴", "🟦", "🟦", "🟡", null], answer: "🟡", diff: "medium" },
  { id: "m6", seq: ["💖", "🪐", "💖", "🌙", "💖", null], answer: "🪐", diff: "medium" },
  { id: "m7", seq: ["🔵", "🔺", "🟩", "🔵", "🔺", null], answer: "🟩", diff: "medium" },
  { id: "m8", seq: ["🟨", "🟨", "🟥", "🟨", "🟨", null], answer: "🟥", diff: "medium" },
  { id: "m9", seq: ["🔻", "🔺", "🪐", "🔻", "🔺", null], answer: "🪐", diff: "medium" },
  { id: "m10", seq: ["🔴", "🟩", "🔵", "🟡", "🔴", null], answer: "🟩", diff: "medium" },
  { id: "m11", seq: ["🔶", "🔷", "🔶", "🔷", "🔶", null], answer: "🔷", diff: "medium" },
  { id: "m12", seq: ["🌙", "☀️", "☁️", "🌙", "☀️", null], answer: "☁️", diff: "medium" },

  { id: "h1", seq: ["🔴", "🟦", "🟦", "🔴", "🟦", null], answer: "🟦", diff: "hard" },
  { id: "h2", seq: ["🪐", "🔺", "🟩", "🪐", "🔺", null], answer: "🟩", diff: "hard" },
  { id: "h3", seq: ["🔴", "🟡", "🟢", "🔵", "🔴", null], answer: "🟡", diff: "hard" },
  { id: "h4", seq: ["🟩", "🟥", "🟩", "🟥", "🟥", null], answer: "🟩", diff: "hard" },
  { id: "h5", seq: ["🔵", "🔵", "🔴", "🔵", "🔵", null], answer: "🔴", diff: "hard" },
  { id: "h6", seq: ["🔺", "🔻", "🔻", "🔺", "🔻", null], answer: "🔻", diff: "hard" },
  { id: "h7", seq: ["🪐", "🌙", "☀️", "☁️", "🪐", null], answer: "🌙", diff: "hard" },
  { id: "h8", seq: ["💖", "💖", "🔵", "💖", "💖", null], answer: "🔵", diff: "hard" },
  { id: "h9", seq: ["🔴", "🔴", "🔴", "🟦", "🔴", null], answer: "🔴", diff: "hard" },
  { id: "h10", seq: ["🟨", "🟩", "🟦", "🟨", "🟩", null], answer: "🟦", diff: "hard" },
  { id: "h11", seq: ["🔶", "🔶", "🔷", "🔶", "🔶", null], answer: "🔷", diff: "hard" },
  { id: "h12", seq: ["☀️", "☁️", "☁️", "☀️", "☁️", null], answer: "☁️", diff: "hard" },

  { id: "x1", seq: ["🔴", "🟥", "🔵", "🟦", "🟡", null], answer: "🟨", diff: "extreme" },
  { id: "x2", seq: ["🟢", "🟩", "🔴", "🟥", "🔵", null], answer: "🟦", diff: "extreme" },
  { id: "x3", seq: ["🔴", "🔵", "🔴", "🔴", "🔵", null], answer: "🔴", diff: "extreme" },
  { id: "x4", seq: ["🔺", "🪐", "🔺", "🔺", "🪐", null], answer: "🔺", diff: "extreme" },
  { id: "x5", seq: ["🟥", "🟨", "🟩", "🟦", "🟥", null], answer: "🟨", diff: "extreme" },
  { id: "x6", seq: ["🌙", "🪐", "☀️", "🌙", "🪐", null], answer: "☀️", diff: "extreme" },
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

const ODD_ONE_OUT_ITEMS = [
  { id: "e1", items: ["🐶", "🐱", "🐭", "🚗"], answer: "🚗", diff: "easy" },
  { id: "e2", items: ["🍎", "🍌", "🍇", "⚽"], answer: "⚽", diff: "easy" },
  { id: "e3", items: ["🚗", "🚌", "🚂", "🍎"], answer: "🍎", diff: "easy" },
  { id: "e4", items: ["👕", "👖", "👗", "🐶"], answer: "🐶", diff: "easy" },
  { id: "e5", items: ["☀️", "🌧️", "☁️", "🎸"], answer: "🎸", diff: "easy" },
  { id: "e6", items: ["🎸", "🎺", "🥁", "🍕"], answer: "🍕", diff: "easy" },
  { id: "e7", items: ["⚽", "🏀", "🎾", "📱"], answer: "📱", diff: "easy" },
  { id: "e8", items: ["🍕", "🍔", "🍟", "🌲"], answer: "🌲", diff: "easy" },
  { id: "e9", items: ["🌲", "🌳", "🌴", "🚗"], answer: "🚗", diff: "easy" },
  { id: "e10", items: ["📱", "💻", "📺", "🍌"], answer: "🍌", diff: "easy" },
  { id: "e11", items: ["🦅", "🦉", "🦆", "🐱"], answer: "🐱", diff: "easy" },
  { id: "e12", items: ["🐟", "🐬", "🦈", "🦁"], answer: "🦁", diff: "easy" },

  { id: "m1", items: ["🍎", "🍌", "🍇", "🥕"], answer: "🥕", diff: "medium" },
  { id: "m2", items: ["🦅", "🦉", "🕊️", "✈️"], answer: "✈️", diff: "medium" },
  { id: "m3", items: ["🚗", "🚌", "🚓", "⛵"], answer: "⛵", diff: "medium" },
  { id: "m4", items: ["🛋️", "🛏️", "🪑", "🏠"], answer: "🏠", diff: "medium" },
  { id: "m5", items: ["🐶", "🐱", "🐹", "🐺"], answer: "🐺", diff: "medium" },
  { id: "m6", items: ["🐝", "🦋", "🐞", "🦅"], answer: "🦅", diff: "medium" },
  { id: "m7", items: ["🎸", "🎻", "🪕", "🥁"], answer: "🥁", diff: "medium" },
  { id: "m8", items: ["⚽", "🏀", "🏐", "🏈"], answer: "🏈", diff: "medium" },
  { id: "m9", items: ["🛳️", "⛵", "🛶", "🚁"], answer: "🚁", diff: "medium" },
  { id: "m10", items: ["☀️", "🪐", "🌙", "🌲"], answer: "🌲", diff: "medium" },
  { id: "m11", items: ["✏️", "🖊️", "🖍️", "✂️"], answer: "✂️", diff: "medium" },
  { id: "m12", items: ["🍓", "🍒", "🍎", "🍋"], answer: "🍋", diff: "medium" },

  { id: "h1", items: ["🦁", "🐯", "🐻", "🐮"], answer: "🐮", diff: "hard" },
  { id: "h2", items: ["🐷", "🐮", "🐔", "🦓"], answer: "🦓", diff: "hard" },
  { id: "h3", items: ["✈️", "🚁", "🚀", "🚗"], answer: "🚗", diff: "hard" },
  { id: "h4", items: ["🍎", "🍅", "🍓", "🥦"], answer: "🥦", diff: "hard" },
  { id: "h5", items: ["🍋", "🍌", "🧀", "🫐"], answer: "🫐", diff: "hard" },
  { id: "h6", items: ["🌲", "🌳", "🌵", "🌹"], answer: "🌹", diff: "hard" },
  { id: "h7", items: ["🥛", "☕", "🍵", "🍔"], answer: "🍔", diff: "hard" },
  { id: "h8", items: ["🚲", "🛴", "🛹", "🚗"], answer: "🚗", diff: "hard" },
  { id: "h9", items: ["🎸", "🎹", "🥁", "🎧"], answer: "🎧", diff: "hard" },
  { id: "h10", items: ["🔨", "🔧", "🪛", "🔪"], answer: "🔪", diff: "hard" },
  { id: "h11", items: ["🌞", "🌻", "🍋", "🍎"], answer: "🍎", diff: "hard" },
  { id: "h12", items: ["🦅", "🦇", "🦋", "🐧"], answer: "🐧", diff: "hard" },

  { id: "x1", items: ["⚽", "🏀", "🌎", "🎲"], answer: "🎲", diff: "extreme" },
  { id: "x2", items: ["🚗", "🚲", "🏍️", "🚁"], answer: "🚁", diff: "extreme" },
  { id: "x3", items: ["🐟", "🦈", "🐠", "🐬"], answer: "🐬", diff: "extreme" },
  { id: "x4", items: ["🍅", "🍆", "🥒", "🍎"], answer: "🍎", diff: "extreme" },
  { id: "x5", items: ["🕰️", "⌚", "⏰", "📱"], answer: "📱", diff: "extreme" },
  { id: "x6", items: ["📓", "📕", "📗", "📜"], answer: "📜", diff: "extreme" },
  { id: "x7", items: ["👢", "👟", "🥾", "🧤"], answer: "🧤", diff: "extreme" },
  { id: "x8", items: ["🌕", "🌖", "🌗", "☀️"], answer: "☀️", diff: "extreme" },
  { id: "x9", items: ["💻", "📱", "📺", "📻"], answer: "📻", diff: "extreme" },
  { id: "x10", items: ["🚆", "🚋", "🚈", "🚌"], answer: "🚌", diff: "extreme" },
  { id: "x11", items: ["🍕", "🥧", "🍩", "🌭"], answer: "🌭", diff: "extreme" },
  { id: "x12", items: ["🧊", "⛄", "❄️", "🔥"], answer: "🔥", diff: "extreme" },
];

function generateOddOneOutTask(difficulty) {
  const safeDifficulty = DIFFICULTIES[difficulty] ? difficulty : "easy";
  const pool = ODD_ONE_OUT_ITEMS.filter((item) => item.diff === safeDifficulty);
  const item = pickRandom(pool);
  const options = shuffleOptions([...item.items]);

  return {
    id: `odd-${safeDifficulty}-${item.id}-${Date.now()}-${randomInt(1000, 9999)}`,
    sourceId: item.id,
    puzzleType: "oddOneOut",
    difficulty: safeDifficulty,
    correctAnswer: item.answer,
    options,
  };
}

function oddOneOutTaskKey(task) {
  return [task.puzzleType, task.difficulty, task.sourceId || task.id].join(":");
}

const WHAT_FITS_LEVEL_DATA = {
  easy: [
    {
      main: { emoji: "🪥", label: "Zahnbürste" },
      correctId: "toothpaste",
      options: [
        { id: "toothpaste", emoji: "🦷", label: "Zahnpasta" },
        { id: "fork", emoji: "🍴", label: "Gabel" },
        { id: "sock", emoji: "🧦", label: "Socke" },
        { id: "ball", emoji: "⚽", label: "Ball" }
      ],
      explanation: "Zur Zahnbürste passt Zahnpasta, weil man damit die Zähne putzt."
    },
    {
      main: { emoji: "🔒", label: "Schloss" },
      correctId: "key",
      options: [
        { id: "key", emoji: "🔑", label: "Schlüssel" },
        { id: "banana", emoji: "🍌", label: "Banane" },
        { id: "pencil", emoji: "✏️", label: "Stift" },
        { id: "fish", emoji: "🐟", label: "Fisch" }
      ],
      explanation: "Zum Schloss passt der Schlüssel, weil man damit auf- und zuschliessen kann."
    },
    {
      main: { emoji: "🚲", label: "Fahrrad" },
      correctId: "helmet",
      options: [
        { id: "helmet", emoji: "⛑️", label: "Helm" },
        { id: "pillow", emoji: "🛏️", label: "Kissen" },
        { id: "spoon", emoji: "🥄", label: "Löffel" },
        { id: "book", emoji: "📘", label: "Buch" }
      ],
      explanation: "Zum Fahrrad passt der Helm, weil er den Kopf schützt."
    },
    {
      main: { emoji: "🍲", label: "Suppe" },
      correctId: "spoon",
      options: [
        { id: "spoon", emoji: "🥄", label: "Löffel" },
        { id: "hammer", emoji: "🔨", label: "Hammer" },
        { id: "shoe", emoji: "👟", label: "Schuh" },
        { id: "drum", emoji: "🥁", label: "Trommel" }
      ],
      explanation: "Zur Suppe passt der Löffel, weil man Suppe damit essen kann."
    },
    {
      main: { emoji: "🌷", label: "Blume" },
      correctId: "wateringCan",
      options: [
        { id: "wateringCan", emoji: "🚿", label: "Giesskanne" },
        { id: "phone", emoji: "📱", label: "Telefon" },
        { id: "car", emoji: "🚗", label: "Auto" },
        { id: "scissors", emoji: "✂️", label: "Schere" }
      ],
      explanation: "Zur Blume passt die Giesskanne, weil Blumen Wasser brauchen."
    },
    {
      main: { emoji: "✂️", label: "Schere" },
      correctId: "paper",
      options: [
        { id: "paper", emoji: "📄", label: "Papier" },
        { id: "apple", emoji: "🍎", label: "Apfel" },
        { id: "moon", emoji: "🌙", label: "Mond" },
        { id: "train", emoji: "🚂", label: "Zug" }
      ],
      explanation: "Zur Schere passt Papier, weil man Papier gut schneiden kann."
    },
    {
      main: { emoji: "🐶", label: "Hund" },
      correctId: "leash",
      options: [
        { id: "leash", emoji: "🪢", label: "Hundeleine" },
        { id: "fishbowl", emoji: "🐠", label: "Fisch" },
        { id: "saddle", emoji: "🏇", label: "Sattel" },
        { id: "bucket", emoji: "🪣", label: "Eimer" }
      ],
      explanation: "Zum Hund passt die Hundeleine, weil man damit sicher spazieren gehen kann."
    },
    {
      main: { emoji: "🎒", label: "Schulranzen" },
      correctId: "book",
      options: [
        { id: "book", emoji: "📘", label: "Schulbuch" },
        { id: "fish", emoji: "🐟", label: "Fisch" },
        { id: "cloud", emoji: "☁️", label: "Wolke" },
        { id: "cake", emoji: "🍰", label: "Kuchen" }
      ],
      explanation: "Zum Schulranzen passt das Schulbuch, weil man es in die Schule mitnimmt."
    },
    {
      main: { emoji: "🎂", label: "Geburtstagskuchen" },
      correctId: "candle",
      options: [
        { id: "candle", emoji: "🕯️", label: "Kerze" },
        { id: "train", emoji: "🚆", label: "Zug" },
        { id: "glove", emoji: "🧤", label: "Handschuh" },
        { id: "leaf", emoji: "🍃", label: "Blatt" }
      ],
      explanation: "Zum Geburtstagskuchen passt die Kerze, weil man sie oft auspustet."
    },
    {
      main: { emoji: "🏖️", label: "Sandburg" },
      correctId: "bucket",
      options: [
        { id: "bucket", emoji: "🪣", label: "Eimer" },
        { id: "tv", emoji: "📺", label: "Fernseher" },
        { id: "violin", emoji: "🎻", label: "Geige" },
        { id: "carrot", emoji: "🥕", label: "Rüebli" }
      ],
      explanation: "Zur Sandburg passt der Eimer, weil man damit Sand formen kann."
    }
  ],
  medium: [
    {
      main: { emoji: "✉️", label: "Brief" },
      correctId: "stamp",
      options: [
        { id: "stamp", emoji: "🏷️", label: "Briefmarke" },
        { id: "sock", emoji: "🧦", label: "Socke" },
        { id: "banana", emoji: "🍌", label: "Banane" },
        { id: "rocket", emoji: "🚀", label: "Rakete" }
      ],
      explanation: "Zum Brief passt die Briefmarke, weil sie zum Verschicken gehört."
    },
    {
      main: { emoji: "🐝", label: "Biene" },
      correctId: "flower",
      options: [
        { id: "flower", emoji: "🌼", label: "Blume" },
        { id: "bus", emoji: "🚌", label: "Bus" },
        { id: "piano", emoji: "🎹", label: "Klavier" },
        { id: "snowman", emoji: "⛄", label: "Schneemann" }
      ],
      explanation: "Zur Biene passt die Blume, weil Bienen dort Nektar sammeln."
    },
    {
      main: { emoji: "🧑‍🚒", label: "Feuerwehr" },
      correctId: "hose",
      options: [
        { id: "hose", emoji: "🚿", label: "Wasserschlauch" },
        { id: "icecream", emoji: "🍦", label: "Glace" },
        { id: "book", emoji: "📚", label: "Bücher" },
        { id: "moon", emoji: "🌙", label: "Mond" }
      ],
      explanation: "Zur Feuerwehr passt der Wasserschlauch, weil sie damit Feuer löschen kann."
    },
    {
      main: { emoji: "⛄", label: "Schneemann" },
      correctId: "carrot",
      options: [
        { id: "carrot", emoji: "🥕", label: "Rüebli-Nase" },
        { id: "sunglasses", emoji: "🕶️", label: "Sonnenbrille" },
        { id: "pizza", emoji: "🍕", label: "Pizza" },
        { id: "hammer", emoji: "🔨", label: "Hammer" }
      ],
      explanation: "Zum Schneemann passt das Rüebli, weil es oft seine Nase ist."
    },
    {
      main: { emoji: "🥅", label: "Fussballtor" },
      correctId: "football",
      options: [
        { id: "football", emoji: "⚽", label: "Fussball" },
        { id: "tooth", emoji: "🦷", label: "Zahn" },
        { id: "cake", emoji: "🍰", label: "Kuchen" },
        { id: "lamp", emoji: "💡", label: "Lampe" }
      ],
      explanation: "Zum Fussballtor passt der Fussball, weil man Tore damit schiesst."
    },
    {
      main: { emoji: "📷", label: "Kamera" },
      correctId: "photo",
      options: [
        { id: "photo", emoji: "🖼️", label: "Foto" },
        { id: "plate", emoji: "🍽️", label: "Teller" },
        { id: "anchor", emoji: "⚓", label: "Anker" },
        { id: "shoe", emoji: "👞", label: "Schuh" }
      ],
      explanation: "Zur Kamera passt das Foto, weil man Fotos mit einer Kamera macht."
    },
    {
      main: { emoji: "🧑‍🍳", label: "Bäcker" },
      correctId: "bread",
      options: [
        { id: "bread", emoji: "🍞", label: "Brot" },
        { id: "telescope", emoji: "🔭", label: "Fernrohr" },
        { id: "fish", emoji: "🐟", label: "Fisch" },
        { id: "magnet", emoji: "🧲", label: "Magnet" }
      ],
      explanation: "Zum Bäcker passt Brot, weil Bäcker Brot und Gebäck herstellen."
    },
    {
      main: { emoji: "🧑‍🎣", label: "Fischer" },
      correctId: "rod",
      options: [
        { id: "rod", emoji: "🎣", label: "Angel" },
        { id: "paint", emoji: "🎨", label: "Farbe" },
        { id: "snowflake", emoji: "❄️", label: "Schnee" },
        { id: "balloon", emoji: "🎈", label: "Ballon" }
      ],
      explanation: "Zum Fischer passt die Angel, weil man damit Fische fangen kann."
    },
    {
      main: { emoji: "🎸", label: "Gitarre" },
      correctId: "music",
      options: [
        { id: "music", emoji: "🎵", label: "Musik" },
        { id: "wrench", emoji: "🔧", label: "Schraubenschlüssel" },
        { id: "tomato", emoji: "🍅", label: "Tomate" },
        { id: "umbrella", emoji: "☂️", label: "Schirm" }
      ],
      explanation: "Zur Gitarre passt Musik, weil man mit ihr Musik machen kann."
    },
    {
      main: { emoji: "🧑‍🎨", label: "Maler" },
      correctId: "palette",
      options: [
        { id: "palette", emoji: "🎨", label: "Farbpalette" },
        { id: "train", emoji: "🚆", label: "Zug" },
        { id: "cookie", emoji: "🍪", label: "Guetzli" },
        { id: "key", emoji: "🔑", label: "Schlüssel" }
      ],
      explanation: "Zum Maler passt die Farbpalette, weil er damit Farben auswählt."
    }
  ],
  hard: [
    {
      main: { emoji: "🧭", label: "Kompass" },
      correctId: "map",
      options: [
        { id: "map", emoji: "🗺️", label: "Karte" },
        { id: "cake", emoji: "🎂", label: "Kuchen" },
        { id: "soap", emoji: "🧼", label: "Seife" },
        { id: "drum", emoji: "🥁", label: "Trommel" }
      ],
      explanation: "Zum Kompass passt die Karte, weil beide beim Orientieren helfen."
    },
    {
      main: { emoji: "🌡️", label: "Thermometer" },
      correctId: "fever",
      options: [
        { id: "fever", emoji: "🤒", label: "Fieber" },
        { id: "ball", emoji: "🏀", label: "Basketball" },
        { id: "flower", emoji: "🌸", label: "Blume" },
        { id: "bike", emoji: "🚲", label: "Fahrrad" }
      ],
      explanation: "Zum Thermometer passt Fieber, weil man damit Temperatur misst."
    },
    {
      main: { emoji: "🐛", label: "Raupe" },
      correctId: "butterfly",
      options: [
        { id: "butterfly", emoji: "🦋", label: "Schmetterling" },
        { id: "car", emoji: "🚗", label: "Auto" },
        { id: "bread", emoji: "🍞", label: "Brot" },
        { id: "pencil", emoji: "✏️", label: "Stift" }
      ],
      explanation: "Zur Raupe passt der Schmetterling, weil aus einer Raupe ein Schmetterling werden kann."
    },
    {
      main: { emoji: "🔦", label: "Taschenlampe" },
      correctId: "battery",
      options: [
        { id: "battery", emoji: "🔋", label: "Batterie" },
        { id: "ice", emoji: "🧊", label: "Eiswürfel" },
        { id: "fish", emoji: "🐠", label: "Fisch" },
        { id: "shoe", emoji: "👟", label: "Schuh" }
      ],
      explanation: "Zur Taschenlampe passt die Batterie, weil sie Strom liefert."
    },
    {
      main: { emoji: "🚆", label: "Zug" },
      correctId: "rails",
      options: [
        { id: "rails", emoji: "🛤️", label: "Schienen" },
        { id: "cloud", emoji: "☁️", label: "Wolke" },
        { id: "banana", emoji: "🍌", label: "Banane" },
        { id: "scarf", emoji: "🧣", label: "Schal" }
      ],
      explanation: "Zum Zug passen Schienen, weil Züge darauf fahren."
    },
    {
      main: { emoji: "🧑‍⚕️", label: "Ärztin" },
      correctId: "stethoscope",
      options: [
        { id: "stethoscope", emoji: "🩺", label: "Stethoskop" },
        { id: "guitar", emoji: "🎸", label: "Gitarre" },
        { id: "sailboat", emoji: "⛵", label: "Segelboot" },
        { id: "cookie", emoji: "🍪", label: "Guetzli" }
      ],
      explanation: "Zur Ärztin passt das Stethoskop, weil sie damit abhören kann."
    },
    {
      main: { emoji: "🗑️", label: "Abfall" },
      correctId: "recycle",
      options: [
        { id: "recycle", emoji: "♻️", label: "Recycling" },
        { id: "moon", emoji: "🌙", label: "Mond" },
        { id: "cake", emoji: "🍰", label: "Kuchen" },
        { id: "train", emoji: "🚂", label: "Zug" }
      ],
      explanation: "Zu Abfall passt Recycling, weil manche Dinge wiederverwertet werden können."
    },
    {
      main: { emoji: "🧶", label: "Wolle" },
      correctId: "sweater",
      options: [
        { id: "sweater", emoji: "🧥", label: "Pullover" },
        { id: "rocket", emoji: "🚀", label: "Rakete" },
        { id: "tomato", emoji: "🍅", label: "Tomate" },
        { id: "fish", emoji: "🐟", label: "Fisch" }
      ],
      explanation: "Zur Wolle passt der Pullover, weil man Kleidung daraus machen kann."
    },
    {
      main: { emoji: "🌰", label: "Samen" },
      correctId: "tree",
      options: [
        { id: "tree", emoji: "🌳", label: "Baum" },
        { id: "car", emoji: "🚗", label: "Auto" },
        { id: "phone", emoji: "📱", label: "Telefon" },
        { id: "spoon", emoji: "🥄", label: "Löffel" }
      ],
      explanation: "Zum Samen passt der Baum, weil aus einem Samen eine Pflanze wachsen kann."
    },
    {
      main: { emoji: "🌙", label: "Mond" },
      correctId: "telescope",
      options: [
        { id: "telescope", emoji: "🔭", label: "Fernrohr" },
        { id: "soup", emoji: "🍲", label: "Suppe" },
        { id: "sock", emoji: "🧦", label: "Socke" },
        { id: "hammer", emoji: "🔨", label: "Hammer" }
      ],
      explanation: "Zum Mond passt das Fernrohr, weil man ihn damit besser beobachten kann."
    }
  ],
  extreme: [
    {
      main: { emoji: "⬛", label: "Schatten" },
      correctId: "sun",
      options: [
        { id: "sun", emoji: "☀️", label: "Sonne" },
        { id: "pizza", emoji: "🍕", label: "Pizza" },
        { id: "train", emoji: "🚆", label: "Zug" },
        { id: "glove", emoji: "🧤", label: "Handschuh" }
      ],
      explanation: "Zum Schatten passt die Sonne, weil Licht einen Schatten entstehen lässt."
    },
    {
      main: { emoji: "💨", label: "Rauch" },
      correctId: "fire",
      options: [
        { id: "fire", emoji: "🔥", label: "Feuer" },
        { id: "book", emoji: "📘", label: "Buch" },
        { id: "icecream", emoji: "🍦", label: "Glace" },
        { id: "flower", emoji: "🌷", label: "Blume" }
      ],
      explanation: "Zu Rauch passt Feuer, weil bei Feuer oft Rauch entsteht."
    },
    {
      main: { emoji: "⛵", label: "Segelboot" },
      correctId: "wind",
      options: [
        { id: "wind", emoji: "🌬️", label: "Wind" },
        { id: "battery", emoji: "🔋", label: "Batterie" },
        { id: "pencil", emoji: "✏️", label: "Stift" },
        { id: "cake", emoji: "🎂", label: "Kuchen" }
      ],
      explanation: "Zum Segelboot passt Wind, weil Wind die Segel antreibt."
    },
    {
      main: { emoji: "🔲", label: "Solarzelle" },
      correctId: "sun",
      options: [
        { id: "sun", emoji: "☀️", label: "Sonnenlicht" },
        { id: "fish", emoji: "🐟", label: "Fisch" },
        { id: "shoe", emoji: "👟", label: "Schuh" },
        { id: "drum", emoji: "🥁", label: "Trommel" }
      ],
      explanation: "Zur Solarzelle passt Sonnenlicht, weil sie daraus Strom erzeugen kann."
    },
    {
      main: { emoji: "🧲", label: "Magnet" },
      correctId: "paperclip",
      options: [
        { id: "paperclip", emoji: "📎", label: "Büroklammer" },
        { id: "banana", emoji: "🍌", label: "Banane" },
        { id: "cloud", emoji: "☁️", label: "Wolke" },
        { id: "bread", emoji: "🍞", label: "Brot" }
      ],
      explanation: "Zum Magnet passt die Büroklammer, weil sie aus Metall ist."
    },
    {
      main: { emoji: "🥚", label: "Ei" },
      correctId: "chick",
      options: [
        { id: "chick", emoji: "🐣", label: "Küken" },
        { id: "car", emoji: "🚗", label: "Auto" },
        { id: "guitar", emoji: "🎸", label: "Gitarre" },
        { id: "moon", emoji: "🌙", label: "Mond" }
      ],
      explanation: "Zum Ei passt das Küken, weil ein Küken aus einem Ei schlüpfen kann."
    },
    {
      main: { emoji: "🌾", label: "Mehl" },
      correctId: "bread",
      options: [
        { id: "bread", emoji: "🍞", label: "Brot" },
        { id: "helmet", emoji: "⛑️", label: "Helm" },
        { id: "key", emoji: "🔑", label: "Schlüssel" },
        { id: "frog", emoji: "🐸", label: "Frosch" }
      ],
      explanation: "Zu Mehl passt Brot, weil Brot oft aus Mehl gebacken wird."
    },
    {
      main: { emoji: "🧊", label: "Eiswürfel" },
      correctId: "freezer",
      options: [
        { id: "freezer", emoji: "❄️", label: "Gefrierfach" },
        { id: "sunflower", emoji: "🌻", label: "Sonnenblume" },
        { id: "bus", emoji: "🚌", label: "Bus" },
        { id: "violin", emoji: "🎻", label: "Geige" }
      ],
      explanation: "Zum Eiswürfel passt das Gefrierfach, weil er dort gefroren bleibt."
    },
    {
      main: { emoji: "💧", label: "Pfütze" },
      correctId: "rain",
      options: [
        { id: "rain", emoji: "🌧️", label: "Regen" },
        { id: "clock", emoji: "⏰", label: "Wecker" },
        { id: "cookie", emoji: "🍪", label: "Guetzli" },
        { id: "rocket", emoji: "🚀", label: "Rakete" }
      ],
      explanation: "Zur Pfütze passt Regen, weil Regenwasser Pfützen bilden kann."
    },
    {
      main: { emoji: "🔬", label: "Mikroskop" },
      correctId: "germ",
      options: [
        { id: "germ", emoji: "🦠", label: "Keim" },
        { id: "elephant", emoji: "🐘", label: "Elefant" },
        { id: "car", emoji: "🚗", label: "Auto" },
        { id: "tree", emoji: "🌳", label: "Baum" }
      ],
      explanation: "Zum Mikroskop passt der Keim, weil sehr kleine Dinge damit sichtbar werden."
    }
  ]
};

function whatFitsItemSourceId(item, difficulty, pool = WHAT_FITS_LEVEL_DATA[difficulty] || []) {
  const poolIndex = pool.findIndex((candidate) => candidate === item || (candidate.correctId === item.correctId && candidate.main?.label === item.main?.label));
  return item.id || (poolIndex >= 0 ? `${difficulty}-${poolIndex + 1}` : item.correctId);
}

function generateWhatFitsTask(source, usedKeys = []) {
  const safeDifficulty = DIFFICULTIES[source?.difficulty || source] ? (source?.difficulty || source) : "easy";
  const pool = WHAT_FITS_LEVEL_DATA[safeDifficulty] || WHAT_FITS_LEVEL_DATA.easy;
  const unusedPool = source?.main ? [] : pool.filter((item) => !usedKeys.includes(["whatFits", safeDifficulty, whatFitsItemSourceId(item, safeDifficulty, pool)].join(":")));
  const item = source?.main ? source : pickRandom(unusedPool.length ? unusedPool : pool);
  const sourceId = whatFitsItemSourceId(item, safeDifficulty, pool);
  return {
    id: `what-fits-${safeDifficulty}-${sourceId}-${Date.now()}-${randomInt(1000, 9999)}`,
    sourceId,
    puzzleType: "whatFits",
    difficulty: safeDifficulty,
    main: clone(item.main),
    correctId: item.correctId,
    correctAnswer: item.correctId,
    options: shuffleOptions(item.options.map((option) => clone(option))),
    explanation: item.explanation,
  };
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
  if (task.puzzleType === "oddOneOut") return oddOneOutTaskKey(task);
  if (task.puzzleType === "whatFits") return [task.puzzleType, task.difficulty, task.sourceId || task.correctId || task.id].join(":");
  if (task.puzzleType === "shapeSequencePuzzle") return shapeSequenceTaskKey(task);
  if (task.puzzleType === "sequencePuzzle") return sequenceTaskKey(task);
  return task.puzzleType === "mathPuzzle" ? mathTaskKey(task) : readingTaskKey(task);
}
function generateUniquePracticeTask(taskFactory, difficulty, usedKeys = []) {
  const used = new Set(usedKeys);
  let fallback = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const task = taskFactory === generateWhatFitsTask ? taskFactory(difficulty, usedKeys) : taskFactory(difficulty);
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
const ODD_ONE_OUT_LEVEL_DESCRIPTIONS = {
  easy: "Sehr unterschiedliche Bilder, z.B. Tiere und Autos.",
  medium: "Ähnliche Bilder, z.B. verschiedene Obst- und Gemüsesorten.",
  hard: "Gleiche Gruppen, aber kleine Unterschiede (Bauernhof oder Wildnis?).",
  extreme: "Hier musst du genau nachdenken (rund oder eckig, Rollen oder Kufen?).",
};
const WHAT_FITS_LEVEL_DESCRIPTIONS = {
  easy: "Direkte Paare aus dem Alltag: Was benutzt man zusammen?",
  medium: "Alltag, Berufe und Natur: Was gehört sinnvoll zusammen?",
  hard: "Hier brauchst du mehr Wissen: Werkzeug, Verwandlung, Orientierung.",
  extreme: "Ursache, Wirkung und Veränderung: Denke einen Schritt weiter.",
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
const ODD_ONE_OUT_LEVELS = makePracticeLevels("oddOneOut", ODD_ONE_OUT_LEVEL_DESCRIPTIONS);
const WHAT_FITS_LEVELS = makePracticeLevels("whatFits", WHAT_FITS_LEVEL_DESCRIPTIONS);

const SPATIAL_LEVEL_DESCRIPTIONS = {
  easy: "Zwei Antwortkarten und einfache Würfelbauten mit 3 bis 4 Würfeln.",
  medium: "Drei Antwortkarten, mehr Ansichten und erste verdeckte Würfel.",
  hard: "Vier ähnliche Antwortkarten mit Drehungen, Kippbewegungen und Würfelnetzen.",
  extreme: "Sehr ähnliche Körper, mehrere Bewegungen und Würfelnetze mit ähnlichen Farben.",
};
const SPATIAL_OPTION_COUNTS = { easy: 2, medium: 3, hard: 4, extreme: 4 };
const SPATIAL_VIEW_NAMES = { front: "vorne", left: "links", right: "rechts", top: "oben" };
const SPATIAL_NET_VISIBLE_FACES = ["front", "right", "top"];
const SPATIAL_NET_FACE_ORDER = ["top", "left", "front", "right", "back", "bottom"];
const SPATIAL_NET_BASE_COLS = 4;
const SPATIAL_NET_BASE_ROWS = 3;
const SPATIAL_NET_BASE_POSITIONS = {
  top: [1, 0],
  left: [0, 1],
  front: [1, 1],
  right: [2, 1],
  back: [3, 1],
  bottom: [1, 2],
};

function makeSpatialLevels(levels = window.SPATIAL_PUZZLES || []) {
  const counters = Object.fromEntries(DIFFICULTY_KEYS.map((difficulty) => [difficulty, 0]));
  return levels.map((levelData) => {
    counters[levelData.difficulty] += 1;
    return makeLevel("spatialPuzzle", levelData.difficulty, counters[levelData.difficulty], {
      ...levelData,
      badge: `${levelData.options?.length || 0} Antworten`,
      description: levelData.description || SPATIAL_LEVEL_DESCRIPTIONS[levelData.difficulty],
    });
  });
}

function spatialFaceSignature(faceDef) {
  const face = typeof faceDef === "string" ? { color: faceDef } : (faceDef || {});
  const mark = face.mark || "";
  const rotation = mark ? Number(face.rotation || 0) % 360 : 0;
  return [face.color || "", mark, rotation].join(":");
}

function normalizeSpatialCubes(cubes = []) {
  if (!Array.isArray(cubes) || cubes.length === 0) return [];
  const mapped = cubes.map((cube) => ({
    x: Number(cube.x),
    y: Number(cube.y),
    z: Number(cube.z),
    ...(cube.color ? { color: cube.color } : {}),
  }));
  const minX = Math.min(...mapped.map((cube) => cube.x));
  const minY = Math.min(...mapped.map((cube) => cube.y));
  const minZ = Math.min(...mapped.map((cube) => cube.z));
  return mapped
    .map((cube) => ({ ...cube, x: cube.x - minX, y: cube.y - minY, z: cube.z - minZ }))
    .sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
}

function spatialCubeSignature(cubes = []) {
  return normalizeSpatialCubes(cubes).map((cube) => `${cube.x},${cube.y},${cube.z}`).join("|");
}

function spatialTransformPoint(cube, operation) {
  const { x, y, z } = cube;
  if (operation === "yawRight") return { ...cube, x: y, y: -x, z };
  if (operation === "yawLeft") return { ...cube, x: -y, y: x, z };
  if (operation === "yawAround") return { ...cube, x: -x, y: -y, z };
  if (operation === "tiltForward") return { ...cube, x, y: z, z: -y };
  if (operation === "tiltBack") return { ...cube, x, y: -z, z: y };
  if (operation === "tiltRight") return { ...cube, x: z, y, z: -x };
  if (operation === "tiltLeft") return { ...cube, x: -z, y, z: x };
  if (operation === "mirrorX") return { ...cube, x: -x, y, z };
  if (operation === "mirrorY") return { ...cube, x, y: -y, z };
  return { ...cube };
}

function applySpatialOperations(cubes = [], operations = null) {
  const steps = Array.isArray(operations) ? operations : (operations ? [operations] : []);
  return steps.reduce((current, operation) => normalizeSpatialCubes(current.map((cube) => spatialTransformPoint(cube, operation))), normalizeSpatialCubes(cubes));
}

function colorizeSpatialCubes(cubes = []) {
  return normalizeSpatialCubes(cubes).map((cube, index) => (
    cube.color ? cube : { ...cube, color: SPATIAL_BLOCK_COLORS[index % SPATIAL_BLOCK_COLORS.length] }
  ));
}

function spatialResolveOptionCubes(level, option = {}) {
  const source = colorizeSpatialCubes(option.cubes || level.mainGraphic?.cubes || []);
  return applySpatialOperations(source, option.operation || null);
}

function spatialProjectionCells(cubes = [], view = "front") {
  const normalized = normalizeSpatialCubes(cubes);
  if (!normalized.length) return [];
  const maxY = Math.max(...normalized.map((cube) => cube.y));
  const cells = new Map();
  normalized.forEach((cube) => {
    let col = cube.x;
    let row = cube.z;
    if (view === "left") {
      col = maxY - cube.y;
      row = cube.z;
    } else if (view === "right") {
      col = cube.y;
      row = cube.z;
    } else if (view === "top") {
      col = cube.x;
      row = cube.y;
    }
    cells.set(`${col},${row}`, { col, row });
  });
  const values = [...cells.values()];
  const minCol = Math.min(...values.map((cell) => cell.col));
  const minRow = Math.min(...values.map((cell) => cell.row));
  return values
    .map((cell) => ({ col: cell.col - minCol, row: cell.row - minRow }))
    .sort((a, b) => a.row - b.row || a.col - b.col);
}

function spatialProjectionSignature(cubes = [], view = "front") {
  return spatialProjectionCells(cubes, view).map((cell) => `${cell.col},${cell.row}`).join("|");
}

function permutationParity(perm) {
  let inversions = 0;
  for (let i = 0; i < perm.length; i += 1) for (let j = i + 1; j < perm.length; j += 1) if (perm[i] > perm[j]) inversions += 1;
  return inversions % 2 === 0 ? 1 : -1;
}

function spatialRotationSignatures(cubes = []) {
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const signs = [-1, 1];
  const points = normalizeSpatialCubes(cubes).map((cube) => [cube.x, cube.y, cube.z]);
  const signatures = [];
  perms.forEach((perm) => {
    signs.forEach((sx) => signs.forEach((sy) => signs.forEach((sz) => {
      const signTriple = [sx, sy, sz];
      const determinant = permutationParity(perm) * sx * sy * sz;
      if (determinant !== 1) return;
      const rotated = points.map((point) => ({
        x: signTriple[0] * point[perm[0]],
        y: signTriple[1] * point[perm[1]],
        z: signTriple[2] * point[perm[2]],
      }));
      signatures.push(spatialCubeSignature(rotated));
    })));
  });
  return [...new Set(signatures)].sort();
}

function spatialCanonicalRotationSignature(cubes = []) {
  return spatialRotationSignatures(cubes)[0] || "";
}

function spatialOptionSignature(level, option) {
  if (option.kind === "projection") {
    return `projection:${spatialProjectionSignature(spatialResolveOptionCubes(level, option), option.view)}`;
  }
  if (option.kind === "net") {
    return `net:${SPATIAL_NET_FACE_ORDER.map((name) => spatialFaceSignature(option.faces?.[name])).join("|")}`;
  }
  return `cubes:${spatialCubeSignature(spatialResolveOptionCubes(level, option))}`;
}

function spatialNetVisibleSignature(faces) {
  return SPATIAL_NET_VISIBLE_FACES.map((name) => spatialFaceSignature(faces?.[name])).join("|");
}

function spatialNetLayout(turns = 0) {
  const turnCount = ((Number(turns) || 0) % 4 + 4) % 4;
  let cols = SPATIAL_NET_BASE_COLS;
  let rows = SPATIAL_NET_BASE_ROWS;
  let positions = Object.fromEntries(Object.entries(SPATIAL_NET_BASE_POSITIONS).map(([name, position]) => [name, [...position]]));

  for (let index = 0; index < turnCount; index += 1) {
    positions = Object.fromEntries(Object.entries(positions).map(([name, [col, row]]) => [name, [rows - 1 - row, col]]));
    [cols, rows] = [rows, cols];
  }

  return { positions, cols, rows };
}

function validateSpatialLevel(level) {
  const errors = [];
  const label = level.id || level.levelName || "spatial level";
  const expectedOptionCount = SPATIAL_OPTION_COUNTS[level.difficulty];
  if (!["viewMatch", "sameShape", "rotateBuild", "cubeNet"].includes(level.type)) errors.push(`${label} has unknown type`);
  if (!level.prompt || !level.explanation) errors.push(`${label} needs prompt and explanation`);
  if (!Array.isArray(level.options) || level.options.length !== expectedOptionCount) errors.push(`${label} should have ${expectedOptionCount} options`);
  if (level.options?.filter((option) => option.id === level.correctAnswer).length !== 1) errors.push(`${label} needs exactly one marked correct option`);

  const signatures = new Set();
  (level.options || []).forEach((option) => {
    const signature = spatialOptionSignature(level, option);
    if (signatures.has(signature)) errors.push(`${label} has duplicate answer graphics`);
    signatures.add(signature);
  });

  if (["sameShape", "rotateBuild"].includes(level.type)) {
    const bodySignatures = new Set();
    (level.options || [])
      .filter((option) => option.kind === "cubes")
      .forEach((option) => {
        const signature = spatialCanonicalRotationSignature(spatialResolveOptionCubes(level, option));
        if (bodySignatures.has(signature)) errors.push(`${label} has duplicate answer bodies`);
        bodySignatures.add(signature);
      });
  }

  if (level.type === "viewMatch") {
    const expected = spatialProjectionSignature(level.mainGraphic?.cubes, level.view);
    const matches = (level.options || []).filter((option) =>
      option.kind === "projection" && spatialProjectionSignature(spatialResolveOptionCubes(level, option), option.view) === expected
    );
    if (matches.length !== 1 || matches[0]?.id !== level.correctAnswer) errors.push(`${label} has ambiguous or wrong view answer`);
  }

  if (level.type === "rotateBuild") {
    const expected = spatialCanonicalRotationSignature(level.mainGraphic?.cubes);
    const matches = (level.options || []).filter((option) => option.kind === "cubes" && spatialCanonicalRotationSignature(spatialResolveOptionCubes(level, option)) === expected);
    if (matches.length !== 1 || matches[0]?.id !== level.correctAnswer) errors.push(`${label} has ambiguous or wrong matching body answer`);
  }

  if (level.type === "sameShape") {
    const expected = spatialCanonicalRotationSignature(level.mainGraphic?.cubes);
    const matches = (level.options || []).filter((option) => option.kind === "cubes" && spatialCanonicalRotationSignature(spatialResolveOptionCubes(level, option)) === expected);
    if (matches.length !== 1 || matches[0]?.id !== level.correctAnswer) errors.push(`${label} has ambiguous or wrong same-shape answer`);
  }

  if (level.type === "cubeNet") {
    const expected = spatialNetVisibleSignature(level.mainGraphic?.faces);
    const matches = (level.options || []).filter((option) => option.kind === "net" && spatialNetVisibleSignature(option.faces) === expected);
    if (matches.length !== 1 || matches[0]?.id !== level.correctAnswer) errors.push(`${label} has ambiguous or wrong cube-net answer`);
  }

  return errors;
}

function validateSpatialLevels(levels = []) {
  const errors = [];
  if (levels.length !== 40) errors.push(`spatialPuzzle should have 40 levels, found ${levels.length}`);
  DIFFICULTY_KEYS.forEach((difficulty) => {
    const byDifficulty = levels.filter((level) => level.difficulty === difficulty);
    if (byDifficulty.length !== 10) errors.push(`spatialPuzzle ${difficulty} should have 10 levels`);
    const typeSet = new Set(byDifficulty.map((level) => level.type));
    ["viewMatch", "sameShape", "rotateBuild", "cubeNet"].forEach((type) => {
      if (!typeSet.has(type)) errors.push(`spatialPuzzle ${difficulty} misses ${type}`);
    });
  });
  levels.forEach((level) => errors.push(...validateSpatialLevel(level)));
  return { valid: errors.length === 0, errors };
}

const SPATIAL_LEVELS = makeSpatialLevels();

if (typeof window !== "undefined") {
  window.LernappPuzzleGenerators = {
    generateMathTask,
    generateReadingTask,
    generateSequenceTask,
    generateShapeSequenceTask,
    generateOddOneOutTask,
    generateWhatFitsTask,
    validateMathTask,
    validateReadingTask,
    validateSpatialLevels,
    ensureUniqueOptions,
    shuffleOptions,
    readingWords: READING_WORD_ITEMS,
    readingSentences: READING_SENTENCE_ITEMS,
    sequenceItems: SEQUENCE_ITEMS,
    shapeSequenceItems: SHAPE_SEQUENCE_ITEMS,
    oddOneOutItems: ODD_ONE_OUT_ITEMS,
    whatFitsLevels: WHAT_FITS_LEVELS,
    whatFitsLevelData: WHAT_FITS_LEVEL_DATA,
    spatialLevels: SPATIAL_LEVELS,
    spatialProjectionSignature,
    spatialCubeSignature,
    spatialCanonicalRotationSignature,
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
  oddOneOut: normalizeLevelCounts(ODD_ONE_OUT_LEVELS),
  whatFits: normalizeLevelCounts(WHAT_FITS_LEVELS),
  spatialPuzzle: normalizeLevelCounts(SPATIAL_LEVELS),
  backpack: normalizeLevelCounts(BACKPACK_LEVELS),
  memory: normalizeLevelCounts(MEMORY_LEVELS),
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
const puzzleTitle = document.querySelector("#puzzle-title");
const puzzleDescription = document.querySelector("#puzzle-description");
const statusText = document.querySelector("#status");
const undoButton = document.querySelector("#undo-button");
const resetButton = document.querySelector("#reset-button");
const backButton = document.querySelector("#back-button");
let successOverlay = document.querySelector("#success-overlay");
let successRestartButton = document.querySelector("#success-restart-button");
let nextPuzzleButton = document.querySelector("#next-puzzle-button");
let successContent = document.querySelector("#success-content");
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
let memoryFlipTimer = null;
let practiceAdvanceTimer = null;
let ignoreNextHidokuClick = false;
let ignoreNextShikakuClick = false;
let activeMoveSnapshot = null;
let pushedActiveSnapshot = false;
let appAudioContext = null;
let audioToggleButton = null;
let successTimers = [];
const BIMARU_LONG_PRESS_MS = 480;
const LOCAL_SOLVED_PREFIX = "lernapp.solved.";
const AUDIO_FEEDBACK_STORAGE_KEY = "lernapp.audioFeedback";
const SUCCESS_TONE_SEQUENCE = [
  { frequency: 523.25, delay: 0, duration: 0.12, type: "triangle", volume: 0.03 },
  { frequency: 659.25, delay: 0.09, duration: 0.14, type: "triangle", volume: 0.034 },
  { frequency: 783.99, delay: 0.19, duration: 0.16, type: "sine", volume: 0.038 },
  { frequency: 1046.5, delay: 0.34, duration: 0.24, type: "sine", volume: 0.03 },
];
const PRACTICE_GAMES = new Set(["mathPuzzle", "readingPuzzle", "sequencePuzzle", "shapeSequencePuzzle", "oddOneOut", "whatFits"]);

function progressKey(game, levelId) { return `${LOCAL_SOLVED_PREFIX}${game}.${levelId}`; }
function cloudProgress() { return window.LernappFirebase || null; }
function isSignedIn() { return Boolean(cloudProgress()?.isSignedIn?.()); }
function isSolved(level) {
  if (isSignedIn()) return Boolean(cloudProgress()?.isLevelSolved?.(level));
  return localStorage.getItem(progressKey(level.game, level.id || level.levelName)) === "1";
}
function markSolved(level, result = {}) {
  const id = level.id || level.levelName;
  const resultData = typeof result === "object" && result ? result : {};
  if (!isSignedIn()) {
    localStorage.setItem(progressKey(level.game, id), "1");
  }
  cloudProgress()?.recordSolve?.(level, resultData);
}
function recordMoveMetric() { cloudProgress()?.recordMove?.(); }
function recordResetMetric() { cloudProgress()?.recordReset?.(currentLevel()); }
function refreshProgressView() {
  if (!currentGame || !levelPanel || document.body.classList.contains("puzzle-active")) return;
  if (selectedDifficulty) renderLevelSelect();
  else renderDifficultySelect();
}
window.LernappRefreshProgress = refreshProgressView;
function currentLevel() { return LEVELS_BY_GAME[currentGame][currentIndex]; }
function setStatus(message) { if (statusText) statusText.textContent = message || ""; }
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
function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}
function audioFeedbackEnabled() {
  try {
    const setting = localStorage.getItem(AUDIO_FEEDBACK_STORAGE_KEY);
    return setting !== "0" && setting !== "false" && setting !== "off";
  } catch (error) {
    return true;
  }
}
function setAudioFeedbackEnabled(enabled) {
  try {
    localStorage.setItem(AUDIO_FEEDBACK_STORAGE_KEY, enabled ? "1" : "0");
  } catch (error) {}
  if (!enabled && appAudioContext?.state === "running") {
    appAudioContext.suspend().catch(() => {});
  }
  updateAudioToggleButton();
}
function updateAudioToggleButton() {
  if (!audioToggleButton) return;
  const muted = !audioFeedbackEnabled();
  audioToggleButton.classList.toggle("muted", muted);
  audioToggleButton.setAttribute("aria-pressed", muted ? "true" : "false");
  audioToggleButton.setAttribute("aria-label", muted ? "Ton einschalten" : "Ton stummschalten");
  audioToggleButton.title = muted ? "Ton einschalten" : "Ton stummschalten";
}
function setupAudioToggle() {
  if (audioToggleButton || !document.body || typeof document.createElement !== "function") return;
  audioToggleButton = document.createElement("button");
  audioToggleButton.type = "button";
  audioToggleButton.className = "sound-toggle";
  audioToggleButton.dataset.audioToggle = "true";
  audioToggleButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path class="sound-core" d="M11 5 6 9H3v6h3l5 4V5z"/>
      <path class="sound-wave" d="M15.5 8.5a5 5 0 0 1 0 7"/>
      <path class="sound-wave sound-wave-wide" d="M18.3 5.7a9 9 0 0 1 0 12.6"/>
      <path class="sound-off-line" d="M4 4l16 16"/>
    </svg>
  `;
  audioToggleButton.addEventListener("click", () => setAudioFeedbackEnabled(!audioFeedbackEnabled()));
  document.body.append(audioToggleButton);
  updateAudioToggleButton();
}
function ensureAppAudioContext() {
  if (!audioFeedbackEnabled()) return null;
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;
  try {
    if (!appAudioContext) appAudioContext = new AudioContextConstructor();
    if (appAudioContext.state === "suspended") appAudioContext.resume().catch(() => {});
    return appAudioContext;
  } catch (error) {
    return null;
  }
}
function playTone(frequency, options = {}) {
  const context = ensureAppAudioContext();
  if (!context) return;
  const duration = options.duration ?? 0.07;
  const volume = options.volume ?? 0.035;
  const attack = options.attack ?? 0.012;
  const startAt = context.currentTime + (options.delay ?? 0);
  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = options.type || "sine";
    oscillator.frequency.setValueAtTime(Math.max(1, frequency), startAt);
    if (options.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, options.endFrequency), startAt + duration);
    }
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  } catch (error) {
    // Audio feedback is decorative; ignore browser-specific playback failures.
  }
}
function playTapFeedback() {
  playTone(760, { duration: 0.045, endFrequency: 540, volume: 0.018, type: "triangle" });
}
function playSuccessTone() {
  SUCCESS_TONE_SEQUENCE.forEach((note) => {
    playTone(note.frequency, {
      delay: note.delay,
      duration: note.duration,
      volume: note.volume,
      type: note.type,
    });
  });
}
function feedbackTargetFromEvent(event) {
  const target = event.target?.closest?.("button, a.icon-button, a.selection-back-button");
  if (!target) return null;
  if (target.closest?.("[data-audio-toggle]")) return null;
  if (target instanceof HTMLButtonElement && target.disabled) return null;
  if (target.getAttribute("aria-disabled") === "true") return null;
  return target;
}
function setupAudioFeedback() {
  setupAudioToggle();
  document.addEventListener("pointerdown", (event) => {
    if (!feedbackTargetFromEvent(event)) return;
    playTapFeedback();
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    if (!feedbackTargetFromEvent(event)) return;
    playTapFeedback();
  });
}

const MEASURED_BOARD_SELECTOR = [
  ".arukone-board",
  ".sudoku-board",
  ".kakuro-board",
  ".hidoku-board",
  ".shikaku-board",
  ".count-board",
  ".bimaru-count-board",
].join(", ");
let activeBoardLayoutFrame = null;

function parseCssPixel(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isVisibleElement(element) {
  if (!element || element.hidden) return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function outerBlockSize(element) {
  if (!isVisibleElement(element)) return 0;
  const style = window.getComputedStyle(element);
  return element.getBoundingClientRect().height + parseCssPixel(style.marginTop) + parseCssPixel(style.marginBottom);
}

function outerInlineSize(element) {
  if (!isVisibleElement(element)) return 0;
  const style = window.getComputedStyle(element);
  return element.getBoundingClientRect().width + parseCssPixel(style.marginLeft) + parseCssPixel(style.marginRight);
}

function updateActiveBoardLayout() {
  activeBoardLayoutFrame = null;
  if (!board) return;
  if (!document.body.classList.contains("puzzle-active") || !board.matches(MEASURED_BOARD_SELECTOR)) {
    board.style.removeProperty("--active-board-size");
    board.style.removeProperty("--active-board-offset");
    return;
  }

  const gameCard = document.querySelector(".game-card");
  if (!isVisibleElement(gameCard)) return;

  const cardRect = gameCard.getBoundingClientRect();
  const cardStyle = window.getComputedStyle(gameCard);
  const paddingLeft = parseCssPixel(cardStyle.paddingLeft);
  const paddingRight = parseCssPixel(cardStyle.paddingRight);
  const paddingTop = parseCssPixel(cardStyle.paddingTop);
  const paddingBottom = parseCssPixel(cardStyle.paddingBottom);
  const rowGap = parseCssPixel(cardStyle.rowGap || cardStyle.gap);
  const contentWidth = Math.max(0, cardRect.width - paddingLeft - paddingRight);
  const contentTop = cardRect.top + paddingTop;
  const contentBottom = cardRect.bottom - paddingBottom;
  let boardTop = contentTop;

  [document.querySelector(".status-row")].forEach((element) => {
    if (!isVisibleElement(element)) return;
    boardTop = Math.max(boardTop, element.getBoundingClientRect().bottom + rowGap);
  });

  let reservedBottom = 0;
  let availableWidth = contentWidth;
  const numberPadVisible = isVisibleElement(numberPad);
  const numberPadBesideBoard = numberPadVisible && isCompactLandscapeViewport();
  if (numberPadBesideBoard) availableWidth = Math.max(0, contentWidth - outerInlineSize(numberPad) - rowGap);
  else if (numberPadVisible) reservedBottom += outerBlockSize(numberPad) + rowGap;

  const availableHeight = Math.max(0, contentBottom - boardTop - reservedBottom - 4);
  const currentRect = board.getBoundingClientRect();
  const blockRatio = currentGame === "bimaru" ? 1 : (currentRect.width > 0 ? Math.max(1, currentRect.height / currentRect.width) : 1);
  const maxBoardWidth = currentGame === "bimaru" ? 760 : 860;
  const measuredSize = Math.floor(Math.min(availableWidth, availableHeight / blockRatio, maxBoardWidth));
  const measuredOffset = Math.max(0, Math.ceil(boardTop - currentRect.top));

  if (Number.isFinite(measuredSize) && measuredSize > 0) {
    board.style.setProperty("--active-board-size", `${measuredSize}px`);
  }
  if (Number.isFinite(measuredOffset) && measuredOffset > 0) {
    board.style.setProperty("--active-board-offset", `${measuredOffset}px`);
  } else {
    board.style.removeProperty("--active-board-offset");
  }
}

function scheduleActiveBoardLayout() {
  if (activeBoardLayoutFrame) window.cancelAnimationFrame(activeBoardLayoutFrame);
  activeBoardLayoutFrame = window.requestAnimationFrame(updateActiveBoardLayout);
}

function handleViewportLayoutChange() {
  if (document.body.classList.contains("puzzle-active") && currentGame === "memory") {
    render();
    return;
  }
  scheduleActiveBoardLayout();
}

function currentSolveResult() {
  const result = {};
  if (PRACTICE_GAMES.has(currentGame)) {
    result.flawless = Number(state.flawlessCount || 0);
    result.correct = Number(state.correctCount || 0);
    result.target = currentLevel().targetCount || 10;
  }
  if (currentGame === "spatialPuzzle") {
    result.mistakes = Number(state.mistakes || 0);
    result.explanation = state.feedback || currentLevel().explanation || "";
  }
  if (currentGame === "backpack") result.best = Number(state.best || 0);
  if (currentGame === "memory") {
    result.moves = Number(state.memory?.moves || 0);
    result.bestMoves = Number(state.memory?.bestMoves || loadMemoryBest(currentLevel()) || 0);
  }
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
  renderSelectionActions("levels");
  levelGrid.className = "level-grid";
  levelGrid.setAttribute("aria-label", `${config.title} ${difficulty.label} Levels`);
  levelGrid.innerHTML = "";
  levelsForDifficulty(selectedDifficulty).forEach((level) => {
    const index = LEVELS_BY_GAME[currentGame].indexOf(level);
    const solved = isSolved(level);
    const unlocked = isLevelUnlocked(level);
    const detail = level.badge || (level.size ? `${level.size}×${level.size}` : (level.rows && level.cols ? `${level.rows}×${level.cols}` : "Rätsel"));
    const button = document.createElement("button");
    button.className = `level-tile ${selectedDifficulty}${solved ? " solved" : ""}${unlocked ? "" : " locked"}`;
    button.type = "button";
    button.disabled = !unlocked;
    button.setAttribute("aria-label", `${level.title}${solved ? ", geschafft" : ""}${unlocked ? "" : ", gesperrt"}`);
    button.innerHTML = `
      <span class="level-name">${level.levelName}</span>
      <small${unlocked ? "" : " class=\"lock-icon\" aria-hidden=\"true\""}>${solved ? "geschafft" : (unlocked ? detail : "🔒")}</small>
    `;
    button.addEventListener("click", () => startLevel(index));
    levelGrid.append(button);
  });
}
function showLevelSelect() { finishMove(); clearPracticeAdvanceTimer(); if (currentGame === "backpack") clearBackpackTimer(); if (currentGame === "memory") clearMemoryTimer(); cloudProgress()?.flushCurrentSession?.({ close: true, includeElapsed: true }); hideSuccess(); if (levelPanel) levelPanel.hidden = false; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = true; if (gameControls) gameControls.hidden = true; document.body.classList.remove("puzzle-active", "number-pad-open"); board?.style.removeProperty("--active-board-size"); board?.style.removeProperty("--active-board-offset"); renderLevelSelect(); }
function showGame() { if (levelPanel) levelPanel.hidden = true; if (homePanel) homePanel.hidden = true; if (gamePanel) gamePanel.hidden = false; if (gameControls) gameControls.hidden = false; document.body.classList.add("puzzle-active"); }
function startLevel(index) { const levelToStart = LEVELS_BY_GAME[currentGame]?.[index]; if (!isLevelUnlocked(levelToStart)) { if (levelToStart) selectedDifficulty = levelToStart.difficulty; renderLevelSelect(); return; } clearPracticeAdvanceTimer(); hideSuccess(); currentIndex = index; const level = currentLevel(); selectedDifficulty = level.difficulty; const config = GAME_CONFIGS[currentGame]; history = []; winShown = false; if (undoButton) undoButton.disabled = true; const boardSize = level.cols || level.size || 5; board.className = `board ${currentGame}-board board-size-${boardSize}`; board.style.setProperty("--size", boardSize); board.setAttribute("aria-label", `${config.title} Spielfeld`); puzzleTitle.textContent = level.title; puzzleDescription.textContent = level.description || config.subtitle; cloudProgress()?.recordLevelStart?.(level); resetState(); showGame(); render(); }
function resetGame() { history = []; if (undoButton) undoButton.disabled = true; hideSuccess(); cloudProgress()?.recordLevelStart?.(currentLevel()); resetState(); recordResetMetric(); render("Neu gestartet. Viel Spass!"); }
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
function clearSuccessTimers() {
  successTimers.forEach((timer) => clearTimeout(timer));
  successTimers = [];
}
function scheduleSuccessStep(callback, delay) {
  if (delay <= 0) {
    callback();
    return;
  }
  const timer = setTimeout(() => {
    successTimers = successTimers.filter((entry) => entry !== timer);
    callback();
  }, delay);
  successTimers.push(timer);
}
function revealSuccessContent() {
  clearSuccessTimers();
  const details = Array.from(successContent?.querySelectorAll(".success-summary") || []);
  details.forEach((detail) => detail.classList.remove("revealed"));
  playSuccessTone();
  scheduleSuccessStep(() => details.forEach((detail) => detail.classList.add("revealed")), prefersReducedMotion() ? 0 : 180);
}
function showSuccess() {
  const level = currentLevel();
  const result = currentSolveResult();
  winShown = true;
  markSolved(level, result);
  updateNextPuzzleButton();
  updateSuccessContent();
  if (successOverlay) {
    successOverlay.hidden = false;
    successOverlay.classList.remove("hidden");
  }
  revealSuccessContent();
  setStatus("Geschafft!");
}
function hideSuccess() {
  winShown = false;
  clearSuccessTimers();
  if (successOverlay) {
    successOverlay.hidden = true;
    successOverlay.classList.add("hidden");
  }
}
function updateSuccessContent() {
  if (!successContent) return;
  const successTitle = successOverlay?.querySelector("#success-title");
  if (successTitle) successTitle.textContent = "Geschafft!";
  successContent.innerHTML = "";
  const summary = document.createElement("p");
  summary.className = "success-summary";
  summary.textContent = "Level geschafft.";
  successContent.append(summary);
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
      <div id="success-content" class="success-content"></div>
      <div class="success-actions" aria-label="Level-Aktionen">
        <button id="success-restart-button" class="success-icon-button" type="button" aria-label="Level neu starten" title="Level neu starten">↻</button>
        <button id="next-puzzle-button" class="success-icon-button primary" type="button" aria-label="Nächstes Level" title="Nächstes Level">→</button>
      </div>
    </div>`;
  shell.append(overlay);

  successOverlay = overlay;
  successRestartButton = overlay.querySelector("#success-restart-button");
  nextPuzzleButton = overlay.querySelector("#next-puzzle-button");
  successContent = overlay.querySelector("#success-content");
  successRestartButton.addEventListener("click", resetGame);
  nextPuzzleButton.addEventListener("click", nextLevel);
}
function handleWin() { if (!winShown) showSuccess(); render(); }
function checkAndWin() { if (GAME_HANDLERS[currentGame].checkWin()) handleWin(); }
function resetState() { GAME_HANDLERS[currentGame].resetState(currentLevel()); }
function render(message) { numberPad.hidden = true; GAME_HANDLERS[currentGame].render(currentLevel()); if (message) setStatus(message); document.body.classList.toggle("number-pad-open", isVisibleElement(numberPad)); scheduleActiveBoardLayout(); }

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
    state.feedback = typeof messages.correct === "function" ? messages.correct(state.task) : pickRandom(messages.correct);
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
  state.feedback = pickRandom(messages.retry);
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
  options.className = `practice-options ${state.task.puzzleType}-options`;
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
  const usedIds = new Set(state.sequence);
  const unused = pool.filter((item) => !usedIds.has(item.id));
  if (unused.length < rule.choiceCount) return [];
  return shuffleOptions(unused).slice(0, rule.choiceCount);
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
function memoryRule(level) {
  return MEMORY_DIFFICULTY_RULES[level.difficulty] || MEMORY_DIFFICULTY_RULES.easy;
}
function memoryState() {
  return state.memory || {
    cards: [],
    flippedCardIds: [],
    moves: 0,
    matchedPairs: 0,
    isLocked: false,
    completed: false,
  };
}
function memoryMoveLabel(moves) {
  return `${moves} ${moves === 1 ? "Zug" : "Zügen"}`;
}
function memoryMoveCountLabel(moves) {
  return `${moves} ${moves === 1 ? "Zug" : "Züge"}`;
}
function memoryBestKey(level) {
  return `lernapp.memory.best.${level.id || level.levelName}`;
}
function loadMemoryBest(level) {
  const value = Number(localStorage.getItem(memoryBestKey(level)) || 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}
function saveMemoryBest(level, moves) {
  localStorage.setItem(memoryBestKey(level), String(moves));
}
function clearMemoryTimer() {
  if (memoryFlipTimer) window.clearTimeout(memoryFlipTimer);
  memoryFlipTimer = null;
}
function memoryBoardColumns(level) {
  return Math.max(2, Math.ceil(Math.sqrt(Math.max(1, level.pairCount * 2))));
}
function isCompactLandscapeViewport() {
  return window.matchMedia?.("(orientation: landscape) and (max-height: 540px)")?.matches;
}
function memoryCardMaxSize(level) {
  if (isCompactLandscapeViewport()) {
    if (level.pairCount <= 8) return 60;
    if (level.pairCount <= 13) return 52;
    if (level.pairCount <= 18) return 46;
    return 40;
  }
  if (level.pairCount <= 8) return 108;
  if (level.pairCount <= 13) return 92;
  if (level.pairCount <= 18) return 80;
  return 70;
}
function applyMemoryBoardLayout(grid, level) {
  const columns = memoryBoardColumns(level);
  const gap = 10;
  grid.style.setProperty("--memory-columns", columns);
  grid.style.setProperty("--memory-card-percent", `${100 / columns}%`);
  grid.style.setProperty("--memory-gap-share", `${((columns - 1) * gap) / columns}px`);
  grid.style.setProperty("--memory-board-max", `${columns * memoryCardMaxSize(level) + (columns - 1) * gap}px`);
}
function makeMemoryStat(label, value) {
  const item = document.createElement("span");
  const small = document.createElement("small");
  small.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value;
  item.append(small, strong);
  return item;
}
function renderMemoryStats(level) {
  const memory = memoryState();
  const stats = document.createElement("div");
  stats.className = "memory-stats";
  stats.append(
    makeMemoryStat("Schwierigkeit", DIFFICULTIES[level.difficulty].label),
    makeMemoryStat("Paare", level.pairCount),
    makeMemoryStat("Züge", memory.moves),
    makeMemoryStat("Gefunden", `${memory.matchedPairs} / ${level.pairCount}`),
  );
  if (memory.bestMoves) stats.append(makeMemoryStat("Bestwert", memoryMoveCountLabel(memory.bestMoves)));
  return stats;
}
function memoryCardClass(card, rule) {
  return `memory-card${card.isFaceUp ? " is-face-up" : ""}${card.isMatched ? " is-matched" : ""}${rule.showLabels ? "" : " no-label"}`;
}
function memoryCardAriaLabel(card) {
  if (card.isMatched) return `Paar ${card.label} gefunden`;
  if (card.isFaceUp) return card.label;
  return "Verdeckte Karte aufdecken";
}
function renderMemoryCard(card, level) {
  const memory = memoryState();
  const rule = memoryRule(level);
  const button = document.createElement("button");
  button.type = "button";
  button.className = memoryCardClass(card, rule);
  button.setAttribute("aria-label", memoryCardAriaLabel(card));
  button.disabled = memory.completed || memory.isLocked || card.isFaceUp || card.isMatched;

  const inner = document.createElement("span");
  inner.className = "memory-card-inner";
  const front = document.createElement("span");
  front.className = "memory-card-front";
  front.setAttribute("aria-hidden", "true");
  front.textContent = "?";
  const back = document.createElement("span");
  back.className = "memory-card-back";
  back.setAttribute("aria-hidden", "true");
  const emoji = document.createElement("span");
  emoji.className = "memory-card-emoji";
  emoji.textContent = card.emoji;
  back.append(emoji);
  if (rule.showLabels) {
    const label = document.createElement("span");
    label.className = "memory-card-label";
    label.textContent = card.label;
    back.append(label);
  }
  inner.append(front, back);
  button.append(inner);
  button.addEventListener("click", () => GAME_HANDLERS.memory.flip(card.cardId));
  return button;
}
function renderMemoryBoard(level) {
  const memory = memoryState();
  board.innerHTML = "";
  board.className = "board memory-game";
  board.style.setProperty("--size", 1);
  board.append(renderMemoryStats(level));

  const grid = document.createElement("div");
  grid.className = `memory-board${memory.isLocked ? " is-locked" : ""}`;
  grid.setAttribute("aria-label", `${level.pairCount} Memory-Paare`);
  applyMemoryBoardLayout(grid, level);
  memory.cards.forEach((card) => grid.append(renderMemoryCard(card, level)));
  board.append(grid);
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
function makeOddOneOutTaskView() {
  const view = document.createElement("div");
  view.className = "practice-task oddOneOut-task";
  const instruction = document.createElement("p");
  instruction.className = "oddOneOut-instruction";
  instruction.textContent = "Tippe auf das Bild, das nicht passt.";
  view.append(instruction);
  return view;
}
function makeWhatFitsTaskView() {
  const task = state.task;
  const view = document.createElement("div");
  view.className = "practice-task whatFits-task";
  const prompt = document.createElement("p");
  prompt.className = "whatFits-question";
  prompt.textContent = "Was passt dazu?";
  const mainCard = document.createElement("div");
  mainCard.className = "whatFits-main-card";
  mainCard.setAttribute("aria-label", `Hauptgegenstand: ${task.main.label}`);
  const emoji = document.createElement("span");
  emoji.className = "whatFits-main-emoji";
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = task.main.emoji;
  const label = document.createElement("span");
  label.className = "whatFits-main-label";
  label.textContent = task.main.label;
  mainCard.append(emoji, label);
  view.append(prompt, mainCard);
  return view;
}
function whatFitsOptionStateClass(option) {
  if ((state.awaitingNext || state.completed) && option.id === state.task.correctId) return " correct";
  if (!state.awaitingNext && !state.completed && state.selectedAnswer === option.id && option.id !== state.task.correctId) return " wrong";
  return "";
}
function renderWhatFitsOptions() {
  const options = document.createElement("div");
  options.className = "whatFits-options";
  state.task.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `practice-option whatFits-option${whatFitsOptionStateClass(option)}`;
    button.disabled = state.awaitingNext || state.completed;
    button.setAttribute("aria-label", `Antwort: ${option.label}`);
    const emoji = document.createElement("span");
    emoji.className = "whatFits-option-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = option.emoji;
    const label = document.createElement("span");
    label.className = "whatFits-option-label";
    label.textContent = option.label;
    button.append(emoji, label);
    button.addEventListener("click", () => GAME_HANDLERS.whatFits.answer(option.id));
    options.append(button);
  });
  return options;
}
function renderWhatFitsFeedback() {
  const feedback = document.createElement("div");
  feedback.className = `practice-feedback whatFits-feedback${state.feedback ? " visible" : ""}`;
  if (state.feedback) {
    const text = document.createElement("p");
    text.textContent = state.feedback;
    feedback.append(text);
  }
  return feedback;
}
function makeReadingDisplay(task) {
  const display = document.createElement("div");
  display.className = task.taskType === "sentenceMissingWord" ? "reading-display sentence-gap" : "letter-row";
  task.displayText.split(" ").forEach((part, index) => {
    const span = document.createElement("span");
    span.textContent = part;
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
  return view;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const SPATIAL_FACE_COLORS = {
  rose: "#ef476f",
  sky: "#118ab2",
  sun: "#ffd166",
  mint: "#06d6a0",
  violet: "#8338ec",
  orange: "#f77f00",
  teal: "#2ec4b6",
  blue: "#3a86ff",
};
const SPATIAL_BLOCK_COLORS = ["#7acdf0", "#ffd166", "#8fd694", "#f6a6b8", "#b6a6ff", "#f4a261", "#9be7d8", "#9fc5ff"];

function svgEl(name, attrs = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function hexToRgb(hex) {
  const clean = String(hex || "#8fd694").replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function shadeColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const mix = amount > 0 ? 255 : 0;
  const weight = Math.abs(amount);
  const blend = (channel) => Math.round(channel * (1 - weight) + mix * weight);
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

function spatialColorValue(color) {
  return SPATIAL_FACE_COLORS[color] || color || "#8fd694";
}

function spatialCubeColor(cube) {
  if (cube.color) return spatialColorValue(cube.color);
  return SPATIAL_BLOCK_COLORS[Math.abs(cube.x * 31 + cube.y * 17 + cube.z * 13) % SPATIAL_BLOCK_COLORS.length];
}

function pointsAttr(points) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function appendSpatialTextMark(parent, cx, cy, face, size) {
  const mark = face?.mark;
  if (!mark) return;
  const text = svgEl("text", {
    x: cx,
    y: cy,
    "text-anchor": "middle",
    "dominant-baseline": "central",
    transform: `rotate(${Number(face.rotation || 0)} ${cx} ${cy})`,
  });
  text.classList.add("spatial-face-mark");
  text.style.fontSize = `${size}px`;
  text.textContent = mark;
  parent.append(text);
}

function renderSpatialIso(cubes = [], { compact = false } = {}) {
  const normalized = normalizeSpatialCubes(cubes);
  const size = compact ? 30 : 42;
  const dx = size * 0.62;
  const dy = size * 0.36;
  const dz = size * 0.72;
  const keySet = new Set(normalized.map((cube) => `${cube.x},${cube.y},${cube.z}`));
  const faces = [];
  const project = (x, y, z) => ({ x: (x - y) * dx, y: (x + y) * dy - z * dz });
  const hasCube = (x, y, z) => keySet.has(`${x},${y},${z}`);

  normalized
    .slice()
    .sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z) || a.y - b.y || a.x - b.x)
    .forEach((cube) => {
      const { x, y, z } = cube;
      const base = spatialCubeColor(cube);
      if (!hasCube(x, y + 1, z)) {
        faces.push({
          depth: x + y + z + 0.1,
          color: shadeColor(base, -0.12),
          points: [project(x, y + 1, z), project(x + 1, y + 1, z), project(x + 1, y + 1, z + 1), project(x, y + 1, z + 1)],
        });
      }
      if (!hasCube(x + 1, y, z)) {
        faces.push({
          depth: x + y + z + 0.2,
          color: shadeColor(base, -0.24),
          points: [project(x + 1, y, z), project(x + 1, y + 1, z), project(x + 1, y + 1, z + 1), project(x + 1, y, z + 1)],
        });
      }
      if (!hasCube(x, y, z + 1)) {
        faces.push({
          depth: x + y + z + 0.3,
          color: shadeColor(base, 0.16),
          points: [project(x, y, z + 1), project(x + 1, y, z + 1), project(x + 1, y + 1, z + 1), project(x, y + 1, z + 1)],
        });
      }
    });

  const allPoints = faces.flatMap((face) => face.points);
  const minX = Math.min(...allPoints.map((point) => point.x));
  const maxX = Math.max(...allPoints.map((point) => point.x));
  const minY = Math.min(...allPoints.map((point) => point.y));
  const maxY = Math.max(...allPoints.map((point) => point.y));
  const pad = compact ? 12 : 22;
  const svg = svgEl("svg", {
    class: `spatial-iso-svg${compact ? " compact" : ""}`,
    viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
    role: "img",
    "aria-label": "Würfelbau",
  });
  faces.sort((a, b) => a.depth - b.depth).forEach((face) => {
    svg.append(svgEl("polygon", {
      points: pointsAttr(face.points),
      fill: face.color,
      stroke: "#243047",
      "stroke-width": compact ? 1.4 : 1.8,
      "stroke-linejoin": "round",
    }));
  });
  return svg;
}

function renderSpatialProjection(cubes = [], view = "front") {
  const cells = spatialProjectionCells(cubes, view);
  const cell = 34;
  const gap = 4;
  const maxCol = Math.max(...cells.map((item) => item.col), 0);
  const maxRow = Math.max(...cells.map((item) => item.row), 0);
  const width = (maxCol + 1) * cell + maxCol * gap + 8;
  const height = (maxRow + 1) * cell + maxRow * gap + 8;
  const svg = svgEl("svg", {
    class: "spatial-projection-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": `Ansicht von ${SPATIAL_VIEW_NAMES[view] || view}`,
  });
  cells.forEach(({ col, row }) => {
    const x = 4 + col * (cell + gap);
    const y = 4 + (maxRow - row) * (cell + gap);
    svg.append(svgEl("rect", { x, y, width: cell, height: cell, rx: 7, fill: "#e9f8ff", stroke: "#118ab2", "stroke-width": 3 }));
  });
  return svg;
}

function renderSpatialSingleCube(faces) {
  const size = 84;
  const cx = 120;
  const top = [
    { x: cx, y: 12 },
    { x: cx + size * 0.74, y: 48 },
    { x: cx, y: 84 },
    { x: cx - size * 0.74, y: 48 },
  ];
  const front = [
    { x: cx - size * 0.74, y: 48 },
    { x: cx, y: 84 },
    { x: cx, y: 158 },
    { x: cx - size * 0.74, y: 122 },
  ];
  const right = [
    { x: cx, y: 84 },
    { x: cx + size * 0.74, y: 48 },
    { x: cx + size * 0.74, y: 122 },
    { x: cx, y: 158 },
  ];
  const svg = svgEl("svg", { class: "spatial-colored-cube", viewBox: "0 0 240 174", role: "img", "aria-label": "farbiger Würfel" });
  [
    ["top", top, 120, 50],
    ["front", front, 82, 104],
    ["right", right, 158, 104],
  ].forEach(([name, points, markX, markY]) => {
    const face = faces?.[name] || {};
    svg.append(svgEl("polygon", {
      points: pointsAttr(points),
      fill: spatialColorValue(face.color),
      stroke: "#243047",
      "stroke-width": 2.4,
      "stroke-linejoin": "round",
    }));
    appendSpatialTextMark(svg, markX, markY, face, 22);
  });
  return svg;
}

function renderSpatialNet(faces, { turns = 0 } = {}) {
  const cell = 42;
  const gap = 5;
  const { positions, cols, rows } = spatialNetLayout(turns);
  const width = cols * cell + (cols - 1) * gap + 8;
  const height = rows * cell + (rows - 1) * gap + 8;
  const svg = svgEl("svg", { class: "spatial-net-svg", viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Würfelnetz" });
  SPATIAL_NET_FACE_ORDER.forEach((name) => {
    const [col, row] = positions[name];
    const x = 4 + col * (cell + gap);
    const y = 4 + row * (cell + gap);
    const face = faces?.[name] || {};
    svg.append(svgEl("rect", { x, y, width: cell, height: cell, rx: 6, fill: spatialColorValue(face.color), stroke: "#243047", "stroke-width": 2.2 }));
    appendSpatialTextMark(svg, x + cell / 2, y + cell / 2, face, 18);
  });
  return svg;
}

function renderSpatialGraphic(level, graphic = level.mainGraphic, option = null) {
  if (graphic?.kind === "cube") return renderSpatialSingleCube(graphic.faces);
  if (option?.kind === "projection") return renderSpatialProjection(spatialResolveOptionCubes(level, option), option.view);
  if (option?.kind === "net") return renderSpatialNet(option.faces, { turns: option.turns });
  if (option?.kind === "cubes") return renderSpatialIso(spatialResolveOptionCubes(level, option), { compact: true });
  return renderSpatialIso(colorizeSpatialCubes(graphic?.cubes || []));
}

function makeSpatialTaskView(level) {
  const view = document.createElement("div");
  view.className = `practice-task spatial-task spatial-type-${level.type}`;
  const prompt = document.createElement("p");
  prompt.className = "spatial-prompt";
  prompt.textContent = level.prompt;
  const main = document.createElement("div");
  main.className = "spatial-main-graphic";
  main.append(renderSpatialGraphic(level));
  view.append(prompt, main);
  return view;
}

function spatialOptionStateClass(option) {
  if (state.completed && option.id === currentLevel().correctAnswer) return " correct";
  if (!state.completed && state.selectedAnswer === option.id && option.id !== currentLevel().correctAnswer) return " wrong";
  return "";
}

function renderSpatialOptions(level) {
  const options = document.createElement("div");
  options.className = "spatial-options";
  options.style.setProperty("--option-count", Math.min(level.options.length, 4));
  level.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `practice-option spatial-option${spatialOptionStateClass(option)}`;
    button.disabled = state.completed;
    button.setAttribute("aria-label", `Antwort ${option.id}`);
    const letter = document.createElement("span");
    letter.className = "spatial-option-letter";
    letter.textContent = option.id;
    const graphic = document.createElement("span");
    graphic.className = "spatial-option-graphic";
    graphic.append(renderSpatialGraphic(level, null, option));
    button.append(graphic, letter);
    button.addEventListener("click", () => GAME_HANDLERS.spatialPuzzle.answer(option.id));
    options.append(button);
  });
  return options;
}

function renderSpatialFeedback() {
  const feedback = document.createElement("div");
  feedback.className = `practice-feedback spatial-feedback${state.feedback ? " visible" : ""}`;
  if (state.feedback) {
    const text = document.createElement("p");
    text.textContent = state.feedback;
    feedback.append(text);
  }
  return feedback;
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
      if (!state.options.length) {
        state.phase = "gameOver";
        setStatus("Für diese Schwierigkeit sind nicht genug Gegenstände vorbereitet.");
        return;
      }
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
            if (!state.unlockRecorded) {
              state.unlockRecorded = true;
              markSolved(level, currentSolveResult());
            }
            const nextOptions = backpackNewOptions(level);
            if (!nextOptions.length) {
              state.phase = "gameOver";
              state.options = [];
              render("Unglaublich! Du hast alle Gegenstände eingepackt.");
              return;
            }
            state.phase = "chooseNew";
            state.repeatIndex = 0;
            state.options = nextOptions;
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

  memory: {
    resetState(level) {
      clearMemoryTimer();
      state = {
        memory: {
          cards: buildMemoryCards(level),
          flippedCardIds: [],
          moves: 0,
          matchedPairs: 0,
          isLocked: false,
          completed: false,
          bestMoves: loadMemoryBest(level),
          lockToken: null,
        },
      };
      setStatus("Decke zwei Karten auf.");
    },
    checkWin() { return Boolean(state.memory?.completed); },
    complete(level) {
      const memory = memoryState();
      memory.completed = true;
      const savedBest = loadMemoryBest(level);
      if (!savedBest || memory.moves < savedBest) {
        saveMemoryBest(level, memory.moves);
        memory.bestMoves = memory.moves;
      } else {
        memory.bestMoves = savedBest;
      }
      handleWin();
    },
    flip(cardId) {
      const level = currentLevel();
      const memory = memoryState();
      if (memory.completed || memory.isLocked || memory.flippedCardIds.length >= 2) return;

      const card = memory.cards.find((item) => item.cardId === cardId);
      if (!card || card.isFaceUp || card.isMatched) return;

      card.isFaceUp = true;
      memory.flippedCardIds = [...memory.flippedCardIds, card.cardId];

      if (memory.flippedCardIds.length === 1) {
        render("Merke dir diese Karte.");
        return;
      }

      const [firstId, secondId] = memory.flippedCardIds;
      const first = memory.cards.find((item) => item.cardId === firstId);
      const second = memory.cards.find((item) => item.cardId === secondId);
      if (!first || !second) return;

      memory.moves += 1;
      recordMoveMetric();

      if (first.pairId === second.pairId) {
        memory.matchedPairs += 1;
        memory.isLocked = true;
        memory.lockToken = `${Date.now()}-${Math.random()}`;
        const lockToken = memory.lockToken;
        render(`Paar gefunden! ${memory.matchedPairs} von ${level.pairCount} Paaren.`);
        clearMemoryTimer();
        memoryFlipTimer = window.setTimeout(() => {
          const currentMemory = memoryState();
          if (currentGame !== "memory" || currentMemory.lockToken !== lockToken || currentMemory.completed) return;
          [firstId, secondId].forEach((matchedId) => {
            const matchedCard = currentMemory.cards.find((item) => item.cardId === matchedId);
            if (matchedCard) {
              matchedCard.isMatched = true;
              matchedCard.isFaceUp = false;
            }
          });
          currentMemory.flippedCardIds = [];
          currentMemory.isLocked = false;
          currentMemory.lockToken = null;
          memoryFlipTimer = null;
          if (currentMemory.matchedPairs >= level.pairCount) {
            this.complete(level);
            return;
          }
          render("Weiter so. Decke zwei Karten auf.");
        }, MEMORY_MATCH_HIDE_DELAY_MS);
        return;
      }

      memory.isLocked = true;
      memory.lockToken = `${Date.now()}-${Math.random()}`;
      const lockToken = memory.lockToken;
      render("Nicht gleich. Merke dir beide Karten.");
      clearMemoryTimer();
      memoryFlipTimer = window.setTimeout(() => {
        const currentMemory = memoryState();
        if (currentGame !== "memory" || currentMemory.lockToken !== lockToken || currentMemory.completed) return;
        currentMemory.flippedCardIds.forEach((openId) => {
          const openCard = currentMemory.cards.find((item) => item.cardId === openId);
          if (openCard && !openCard.isMatched) openCard.isFaceUp = false;
        });
        currentMemory.flippedCardIds = [];
        currentMemory.isLocked = false;
        currentMemory.lockToken = null;
        memoryFlipTimer = null;
        render("Versuche es weiter.");
      }, memoryRule(level).flipBackDelayMs);
    },
    render(level) {
      renderMemoryBoard(level);
    },
  },

  mathPuzzle: {
    resetState(level) { resetPracticeState(level, generateMathTask, "Rechne in Ruhe und tippe auf die passende Zahl."); },
    checkWin() { return Boolean(state.completed); },
    answer(answer) {
      answerPracticeTask(answer, generateMathTask, {
        correct: ["Richtig!", "Super!", "Gut gerechnet!"],
        retry: ["Fast! Versuch es noch einmal.", "Du bist nah dran. Zähl noch einmal in Ruhe."],
      }, "Neue Aufgabe. Du schaffst das.");
    },
    render(level) {
      renderPracticeShell(level, "mathPuzzle-board", makeMathTaskView(), (answer) => this.answer(answer), generateMathTask, "Neue Aufgabe. Du schaffst das.");
    },
  },

  sequencePuzzle: {
    resetState(level) { resetPracticeState(level, generateSequenceTask, "Schau dir die Reihe genau an. Welche Zahl fehlt?"); },
    checkWin() { return Boolean(state.completed); },
    answer(answer) {
      answerPracticeTask(answer, generateSequenceTask, {
        correct: ["Richtig!", "Genial erkannt!", "Ganz genau!", "Du bist ein Mathe-Profi!"],
        retry: ["Fast! Prüfe den Abstand der Zahlen nochmal.", "Knapp daneben. Rechne noch einmal nach."],
      }, "Neue Zahlenreihe. Du schaffst das.");
    },
    render(level) {
      renderPracticeShell(level, "sequencePuzzle-board", makeSequenceTaskView(), (answer) => this.answer(answer), generateSequenceTask, "Neue Zahlenreihe. Du schaffst das.");
    },
  },

  shapeSequencePuzzle: {
    resetState(level) { resetPracticeState(level, generateShapeSequenceTask, "Schau dir die Reihe genau an. Welche Figur fehlt?"); },
    checkWin() { return Boolean(state.completed); },
    answer(answer) {
      answerPracticeTask(answer, generateShapeSequenceTask, {
        correct: ["Richtig!", "Genial erkannt!", "Ganz genau!", "Super gemacht!"],
        retry: ["Fast! Prüfe das Muster noch einmal.", "Knapp daneben. Schau dir die Reihenfolge genau an."],
      }, "Neue Figurenfolge. Du schaffst das.");
    },
    render(level) {
      renderPracticeShell(level, "shapeSequencePuzzle-board", makeShapeSequenceTaskView(), (answer) => this.answer(answer), generateShapeSequenceTask, "Neue Figurenfolge. Du schaffst das.");
    },
  },

  oddOneOut: {
    resetState(level) { resetPracticeState(level, generateOddOneOutTask, "Was passt nicht zu den anderen drei Bildern?"); },
    checkWin() { return Boolean(state.completed); },
    answer(answer) {
      answerPracticeTask(answer, generateOddOneOutTask, {
        correct: ["Richtig! Das passt nicht.", "Adlerauge! Genau richtig.", "Super erkannt!"],
        retry: ["Fast! Schau noch einmal, was drei der Bilder gemeinsam haben.", "Das war es nicht ganz. Überlege nochmal."],
      });
    },
    render(level) {
      renderPracticeShell(level, "oddOneOut-board", makeOddOneOutTaskView(), (answer) => this.answer(answer), generateOddOneOutTask, "Neues Rätsel. Finde das Kuckucksei.");
    },
  },

  whatFits: {
    resetState(level) { resetPracticeState(level, generateWhatFitsTask, "Wähle die Antwortkarte, die am besten passt."); },
    checkWin() { return Boolean(state.completed); },
    answer(optionId) {
      answerPracticeTask(optionId, generateWhatFitsTask, {
        correct: (task) => task.explanation || "Richtig! Das passt zusammen.",
        retry: ["Fast! Überlege, was man zusammen benutzt oder was logisch dazugehört."],
      }, "Neue Aufgabe. Was passt dazu?");
    },
    render(level) {
      board.innerHTML = "";
      board.className = "board task-board whatFits-board";
      board.style.setProperty("--size", 1);
      board.append(
        renderPracticeProgress(level),
        makeWhatFitsTaskView(),
        renderWhatFitsOptions(),
        renderWhatFitsFeedback(),
      );
    },
  },

  readingPuzzle: {
    resetState(level) { resetPracticeState(level, generateReadingTask, "Schau auf das Bild und lies genau."); },
    checkWin() { return Boolean(state.completed); },
    answer(answer) {
      answerPracticeTask(answer, generateReadingTask, {
        correct: ["Richtig gelesen!", "Super!", "Das war das richtige Wort!"],
        retry: ["Fast! Schau noch einmal genau hin.", "Vergleiche das Wort mit dem Bild."],
      }, "Neue Leseaufgabe.");
    },
    render(level) {
      renderPracticeShell(level, "readingPuzzle-board", makeReadingTaskView(), (answer) => this.answer(answer), generateReadingTask, "Neue Leseaufgabe.");
    },
  },

  spatialPuzzle: {
    resetState() {
      state = {
        selectedAnswer: null,
        feedback: "",
        mistakes: 0,
        completed: false,
      };
      setStatus("Wähle die passende Antwortkarte.");
    },
    checkWin() { return Boolean(state.completed); },
    answer(optionId) {
      if (state.completed) return;
      const level = currentLevel();
      state.selectedAnswer = optionId;
      if (optionId === level.correctAnswer) {
        state.completed = true;
        state.feedback = level.explanation;
        render("Richtig erkannt.");
        handleWin();
        return;
      }
      state.mistakes += 1;
      state.feedback = "Das passt noch nicht. Schau dir Richtung, Höhe und Nachbarschaft noch einmal an.";
      render("Noch nicht ganz.");
    },
    render(level) {
      board.innerHTML = "";
      board.className = "board task-board spatialPuzzle-board";
      board.style.setProperty("--size", 1);
      board.append(
        makeSpatialTaskView(level),
        renderSpatialOptions(level),
        renderSpatialFeedback(),
      );
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
    input(r,c,options={}) { if (this.checkWin()) return; const endpoint=this.endpointAt(r,c); const endpointPath=endpoint ? state.paths[endpoint] : null; if(endpoint && options.restartOnEndpoint && endpointPath?.length>1 && !this.isCompleted(endpoint)) { pushHistory(); state.activePair=endpoint; state.paths[endpoint]=[[r,c]]; render(`Weg ${endpoint} gestartet.`); return; } if(endpoint && (!state.activePair || endpoint!==state.activePair || this.isCompleted(state.activePair))) { pushHistory(); state.activePair=endpoint; state.paths[endpoint]=[[r,c]]; render(`Weg ${endpoint} gestartet.`); return; } if(!state.activePair) { render("Bitte zuerst ein Symbol auswählen."); return; } if(this.isCompleted(state.activePair)) { render("Dieser Weg ist fertig. Wähle ein anderes Symbol."); return; } const path=state.paths[state.activePair], last=path.at(-1); if(!isNeighbor(last,[r,c])) { render("Ziehe nur auf ein Nachbarfeld."); return; } const existing=path.findIndex((pt)=>sameCell(pt,[r,c])); if(existing>=0) { pushHistory(); state.paths[state.activePair]=path.slice(0,existing+1); render("Ein Stück zurückgegangen."); return; } if(!this.canUse(state.activePair,r,c)) { render("Dieses Feld gehört schon zu einem anderen Weg."); return; } pushHistory(); state.paths[state.activePair]=[...path,[r,c]]; if(this.isCompleted(state.activePair)) state.activePair=null; this.checkWin()?handleWin():render("Gut! Weiter zum passenden Symbol."); },
    render(level) { board.innerHTML=""; board.style.setProperty("--size", level.size); for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const endpoint=this.endpointAt(r,c), owner=this.ownerAt(r,c); const cell=makeButtonCell(r,c,`cell arukone-cell${endpoint?" endpoint":""}${owner?" filled":""}${state.activePair&&owner===state.activePair?" active":""}`, endpoint || ""); const pair=endpoint||owner; if(pair) cell.style.setProperty("--pair-color", getPairColor(pair)); cell.addEventListener("keydown",(event)=>{ if(event.key==="Enter"||event.key===" ") { event.preventDefault(); this.input(r,c,{ restartOnEndpoint: true }); } }); board.append(cell); } },
  },
  sudoku: {
    resetState(level) { state={ values: zeros(level.size, level.size, null), fixed: {}, selected: null }; level.givens.forEach(([r,c,v])=>{state.values[r][c]=v; state.fixed[keyOf(r,c)]=true;}); setStatus("Tippe auf ein leeres Feld."); },
    checkWin() { return state.values.every((row,r)=>row.every((v,c)=>Boolean(v) && !this.conflict(r,c,v))); },
    conflict(r,c,v) { if(!v) return false; const level=currentLevel(); const br=Math.floor(r/level.boxRows)*level.boxRows, bc=Math.floor(c/level.boxCols)*level.boxCols; for(let i=0;i<level.size;i++){ if(i!==c&&state.values[r][i]===v) return true; if(i!==r&&state.values[i][c]===v) return true; } for(let y=br;y<br+level.boxRows;y++) for(let x=bc;x<bc+level.boxCols;x++) if((y!==r||x!==c)&&state.values[y][x]===v) return true; return false; },
    select(r,c) { if(state.fixed[keyOf(r,c)]) { state.selected=null; render("Diese Startzahl bleibt stehen."); return; } state.selected=[r,c]; render("Wähle eine Zahl aus."); this.renderPad(); },
    setNumber(v) { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=v; state.selected=null; this.checkWin()?handleWin():render(this.conflict(r,c,v)?"Fast! Diese Zahl kommt hier doppelt vor.":"Gut gemacht, weiter so!"); },
    clear() { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=null; state.selected=null; render("Die Zahl ist weg."); },
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
      return bimaruSolved(currentLevel(), state.grid);
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
    render(level) { board.innerHTML=""; board.style.setProperty("--size", level.size); if(numberPad){ numberPad.hidden=true; numberPad.classList.remove("hidoku-pad"); numberPad.innerHTML=""; } for(let r=0;r<level.size;r++) for(let c=0;c<level.size;c++){ const fixed=state.fixed[keyOf(r,c)]; const value=state.values[r][c] || ""; const selected=state.selected&&sameCell(state.selected,[r,c]); const cell=makeButtonCell(r,c,`cell hidoku-cell${fixed?" given":""}${selected?" selected":""}${this.conflict(r,c)?" conflict":""}`, value); cell.addEventListener("click",()=>{ if(ignoreNextHidokuClick){ ignoreNextHidokuClick=false; return; } this.select(r,c); }); board.append(cell); } if (undoButton) undoButton.disabled = !this.hasUserEntries(); },
  },
  kakuro: {
    resetState(level) { state = { values: zeros(level.size, level.size, null), selected: null }; setStatus("Tippe auf ein weißes Feld und wähle eine Zahl."); },
    checkWin() { const level=currentLevel(); const filled=level.solution.every((row,r)=>row.every((value,c)=>!value || Boolean(state.values[r][c]))); return filled && level.runs.every((run)=>!this.runConflict(run)); },
    isWhite(level,r,c) { return level.solution[r]?.[c] > 0; },
    select(r,c) { const level=currentLevel(); if(!this.isWhite(level,r,c)) return; state.selected=[r,c]; render("Wähle eine Zahl von 1 bis 9."); this.renderPad(); },
    setNumber(v) { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=v; state.selected=null; this.checkWin()?handleWin():render(this.conflict(r,c) ? "Schau noch einmal auf Summe und doppelte Zahlen." : "Gut! Prüfe die kreuzenden Summen."); },
    clear() { if(!state.selected) return; const [r,c]=state.selected; pushHistory(); state.values[r][c]=null; state.selected=null; render("Die Zahl ist weg."); },
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
function bimaruSolved(level, grid) {
  // A Bimaru is solved when the placement obeys the puzzle rules, regardless of
  // whether it matches the single stored solution. Puzzles can have several
  // valid solutions, and every one of them must finish the level.
  const currentCounts = bimaruGridCounts(grid);
  // 1. Every row and column tally must match its clue exactly.
  if (!level.rowCounts.every((target, row) => currentCounts.rowCounts[row] === target)) return false;
  if (!level.colCounts.every((target, col) => currentCounts.colCounts[col] === target)) return false;
  // 2. Every ship must be a straight line and the fleet must be used exactly.
  const ships = collectBimaruShips(grid);
  if (ships.some((ship) => !ship.validStraight)) return false;
  const usedByLength = {};
  ships.forEach((ship) => { usedByLength[ship.length] = (usedByLength[ship.length] || 0) + 1; });
  const fleet = level.fleet || {};
  const lengths = new Set([...Object.keys(fleet), ...Object.keys(usedByLength)].map(Number));
  for (const length of lengths) {
    if ((usedByLength[length] || 0) !== (fleet[length] || 0)) return false;
  }
  // 3. No two ships may touch, not even diagonally.
  for (let row = 0; row < level.size; row += 1) for (let col = 0; col < level.size; col += 1) {
    if (!isBimaruShipAt(grid, row, col)) continue;
    if (isBimaruShipAt(grid, row + 1, col + 1) || isBimaruShipAt(grid, row + 1, col - 1)) return false;
  }
  return true;
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
if (backButton) backButton.addEventListener("click", showLevelSelect);
setupSuccessOverlay();
setupAudioFeedback();
if (typeof window.addEventListener === "function") {
  window.addEventListener("resize", handleViewportLayoutChange);
  window.addEventListener("orientationchange", handleViewportLayoutChange);
}

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

function drawArukoneCell(row, col, options = {}) {
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
  GAME_HANDLERS.arukone.input(row, col, options);
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
    drawArukoneCell(Number(cell.dataset.row), Number(cell.dataset.col), { restartOnEndpoint: true });
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
