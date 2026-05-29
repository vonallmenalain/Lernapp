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
  { givens: [[0, 0, 1], [3, 3, 1]], solution: [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]] },
  { givens: [[0, 1, 4], [2, 2, 4]], solution: [[1, 4, 2, 3], [3, 2, 1, 4], [2, 3, 4, 1], [4, 1, 3, 2]] },
  { givens: [[1, 0, 2], [3, 2, 1]], solution: [[4, 1, 2, 3], [2, 3, 4, 1], [1, 4, 3, 2], [3, 2, 1, 4]] },
  { givens: [[0, 3, 2], [2, 1, 1]], solution: [[3, 4, 1, 2], [1, 2, 3, 4], [4, 1, 2, 3], [2, 3, 4, 1]] },
  { givens: [[1, 2, 2], [3, 0, 2]], solution: [[1, 2, 4, 3], [3, 4, 2, 1], [4, 3, 1, 2], [2, 1, 3, 4]] },
  { givens: [[0, 2, 4], [2, 0, 3]], solution: [[2, 1, 4, 3], [4, 3, 2, 1], [3, 2, 1, 4], [1, 4, 3, 2]] },
  { givens: [[1, 3, 3], [3, 1, 1]], solution: [[2, 3, 1, 4], [1, 4, 2, 3], [3, 2, 4, 1], [4, 1, 3, 2]] },
  { givens: [[0, 0, 4], [2, 3, 2]], solution: [[4, 3, 2, 1], [2, 1, 4, 3], [1, 4, 3, 2], [3, 2, 1, 4]] },
  { givens: [[0, 2, 1], [3, 0, 3]], solution: [[2, 4, 1, 3], [1, 3, 2, 4], [4, 2, 3, 1], [3, 1, 4, 2]] },
  { givens: [[1, 1, 2], [2, 2, 2]], solution: [[3, 1, 4, 2], [4, 2, 1, 3], [1, 3, 2, 4], [2, 4, 3, 1]] },
].map((level, index) => ({
  ...level,
  game: "sudoku",
  size: 4,
  difficulty: "easy",
  levelName: `S 1-${index + 1}`,
  title: `S 1-${index + 1} · Sudoku · Einfach`,
  description: "Ein 4×4 Sudoku mit nur zwei Startzahlen.",
}));

const GAME_COPY = {
  arukone: {
    heading: "Arukone Levels",
    description: "Wähle eine Kachel. A 1 steht für einfache Levels, A 2 für mittlere Levels und A 3 für schwere Levels.",
    rules: [
      "Verbinde immer zwei gleiche Symbole miteinander.",
      "Gehe nur waagerecht oder senkrecht über Nachbarfelder.",
      "Wege dürfen sich nicht kreuzen.",
      "Am Schluss soll jedes Feld Teil eines Weges sein.",
    ],
    help: [
      "Ziehe von einem Symbol über benachbarte Felder zum gleichen Symbol.",
      "Du darfst nur waagerecht oder senkrecht weitergehen.",
      "Die Wege dürfen sich nicht kreuzen und sollen jedes Feld füllen.",
      "Mit dem Pfeil nimmst du die zuletzt gezogene Linie zurück.",
    ],
    success: "Super gemacht! Du hast alle passenden Symbole verbunden und das ganze Feld ausgefüllt.",
  },
  sudoku: {
    heading: "Sudoku Levels",
    description: "Wähle ein einfaches 4×4 Sudoku. S 1 steht für Sudoku-Levels. Jedes Level hat nur zwei Startzahlen.",
    rules: [
      "Fülle die leeren Felder mit den Zahlen 1, 2, 3 und 4.",
      "In jeder Reihe darf jede Zahl nur einmal vorkommen.",
      "In jeder Spalte darf jede Zahl nur einmal vorkommen.",
      "Auch in jeder dicken 2×2 Box gehört jede Zahl genau einmal hinein.",
    ],
    help: [
      "Tippe zuerst auf ein leeres Feld.",
      "Wähle danach unten eine Zahl von 1 bis 4 aus.",
      "Startzahlen sind fest und können nicht verändert werden.",
      "Mit dem Pfeil nimmst du deine letzte Zahl zurück.",
    ],
    success: "Super gemacht! Jede Reihe, jede Spalte und jede Box ist richtig gefüllt.",
  },
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
const homeButton = document.querySelector("#home-button");
const successOverlay = document.querySelector("#success-overlay");
const successClose = document.querySelector("#success-close");
const nextPuzzleButton = document.querySelector("#next-puzzle-button");
const successText = document.querySelector("#success-text");
const gamePanel = document.querySelector("#game-panel");
const gameControls = document.querySelector("#game-controls");

let currentGame = null;
let currentKey = null;
let paths = {};
let activePair = null;
let selectedSudokuCell = null;
let sudokuValues = [];
let fixedSudokuCells = new Set();
let history = [];
let winShown = false;
let isDrawing = false;
let lastDrawnCell = null;
let suppressNextClick = false;
let activeMoveSnapshot = null;
let activeMoveHistoryPushed = false;

function cellKey(row, col) {
  return `${row},${col}`;
}

function sameCell(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isNeighbor(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function getPuzzle() {
  return currentGame === "sudoku" ? SUDOKU_LEVELS[Number(currentKey)] : PUZZLES[currentKey];
}

function getLevelKeys(game = currentGame) {
  if (game === "sudoku") {
    return SUDOKU_LEVELS.map((_, index) => String(index));
  }
  return Object.keys(PUZZLES);
}

function getPairColor(pair) {
  return DEFAULT_COLORS[pair] ?? "#6c5ce7";
}

function fillList(element, items) {
  element.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.append(li);
  });
}

function showHome() {
  finishMove();
  hideSuccess();
  isDrawing = false;
  currentGame = null;
  window.location.href = "index.html";
}

function showLevelSelectForGame(game) {
  currentGame = game;
  const copy = GAME_COPY[game];
  levelHeading.textContent = copy.heading;
  levelDescription.textContent = copy.description;
  fillList(rulesList, copy.rules);
  fillList(gameHelpList, copy.help);
  renderLevelTiles();
  if (homePanel) homePanel.hidden = true;
  levelPanel.hidden = false;
  gamePanel.hidden = true;
  gameControls.hidden = true;
  document.body.classList.remove("puzzle-active");
}

function chooseGame(game) {
  showLevelSelectForGame(game);
}

function renderLevelTiles() {
  levelGrid.innerHTML = "";
  getLevelKeys(currentGame).forEach((key) => {
    const puzzle = currentGame === "sudoku" ? SUDOKU_LEVELS[Number(key)] : PUZZLES[key];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `level-tile ${puzzle.difficulty}`;
    button.dataset.key = key;
    button.innerHTML = `<span>${puzzle.levelName}</span><small>${puzzle.game === "sudoku" ? "Sudoku 4×4" : `${puzzle.size}×${puzzle.size}`}</small>`;
    button.addEventListener("click", () => setPuzzle(key));
    levelGrid.append(button);
  });
}

function showGame() {
  if (homePanel) homePanel.hidden = true;
  levelPanel.hidden = true;
  gamePanel.hidden = false;
  gameControls.hidden = false;
  document.body.classList.add("puzzle-active");
}

function showLevelSelect() {
  finishMove();
  hideSuccess();
  isDrawing = false;
  levelPanel.hidden = false;
  if (homePanel) homePanel.hidden = true;
  gamePanel.hidden = true;
  gameControls.hidden = true;
  document.body.classList.remove("puzzle-active");
}

function setPuzzle(key) {
  currentKey = key;
  const puzzle = getPuzzle();
  board.style.setProperty("--size", puzzle.size);
  board.className = `board ${currentGame}-board`;
  board.setAttribute("aria-label", currentGame === "sudoku" ? "Sudoku Spielfeld" : "Arukone Spielfeld");
  numberPad.innerHTML = "";
  numberPad.hidden = currentGame !== "sudoku";
  puzzleTitle.textContent = puzzle.title;
  puzzleDescription.textContent = puzzle.description;
  successText.textContent = GAME_COPY[currentGame].success;
  showGame();
  resetPuzzle();
}

function goToNextPuzzle() {
  const keys = getLevelKeys(currentGame);
  const currentIndex = keys.indexOf(String(currentKey));
  const nextIndex = (currentIndex + 1) % keys.length;
  setPuzzle(keys[nextIndex]);
}

function snapshot() {
  return {
    paths: structuredClone(paths),
    activePair,
    selectedSudokuCell: selectedSudokuCell ? [...selectedSudokuCell] : null,
    sudokuValues: structuredClone(sudokuValues),
    winShown,
  };
}

function restore(state) {
  paths = structuredClone(state.paths);
  activePair = state.activePair;
  selectedSudokuCell = state.selectedSudokuCell ? [...state.selectedSudokuCell] : null;
  sudokuValues = structuredClone(state.sudokuValues);
  winShown = state.winShown;
  hideSuccess();
  render();
}

function beginMove() {
  activeMoveSnapshot = snapshot();
  activeMoveHistoryPushed = false;
}

function finishMove() {
  activeMoveSnapshot = null;
  activeMoveHistoryPushed = false;
}

function pushHistory() {
  if (activeMoveSnapshot) {
    if (!activeMoveHistoryPushed) {
      history.push(activeMoveSnapshot);
      activeMoveHistoryPushed = true;
    }
  } else {
    history.push(snapshot());
  }
  undoButton.disabled = false;
}

function showSuccess() {
  winShown = true;
  successOverlay.hidden = false;
  successOverlay.classList.remove("hidden");
  statusText.textContent = "Geschafft!";
}

function hideSuccess() {
  winShown = false;
  successOverlay.hidden = true;
  successOverlay.classList.add("hidden");
}

function resetPuzzle() {
  finishMove();
  history = [];
  hideSuccess();
  if (currentGame === "sudoku") {
    resetSudoku();
    return;
  }
  const puzzle = getPuzzle();
  paths = Object.fromEntries(Object.entries(puzzle.pairs).map(([pair, ends]) => [pair, [ends[0]]]));
  activePair = null;
  render("Ziehe von einem Symbol zum passenden zweiten Symbol.");
}

function getEndpointAt(row, col) {
  const puzzle = getPuzzle();
  return Object.entries(puzzle.pairs).find(([, ends]) =>
    ends.some((point) => sameCell(point, [row, col])),
  )?.[0] ?? null;
}

function getOwnerAt(row, col) {
  const key = cellKey(row, col);
  return Object.entries(paths).find(([, path]) =>
    path.some((point) => cellKey(...point) === key),
  )?.[0] ?? null;
}

function isCompleted(pair) {
  const ends = getPuzzle().pairs[pair];
  const path = paths[pair];
  const startsAtFirstEnd = sameCell(path[0], ends[0]) && sameCell(path.at(-1), ends[1]);
  const startsAtSecondEnd = sameCell(path[0], ends[1]) && sameCell(path.at(-1), ends[0]);
  return path.length > 1 && (startsAtFirstEnd || startsAtSecondEnd);
}

function canUseCell(pair, row, col) {
  const endpointPair = getEndpointAt(row, col);
  const owner = getOwnerAt(row, col);
  if (endpointPair && endpointPair !== pair) return false;
  if (owner && owner !== pair) return false;
  const pairEnds = getPuzzle().pairs[pair];
  return !endpointPair || sameCell(pairEnds[0], [row, col]) || sameCell(pairEnds[1], [row, col]);
}

function checkArukoneWin() {
  const puzzle = getPuzzle();
  const filledCells = new Set();
  const allPairsDone = Object.keys(puzzle.pairs).every((pair) => isCompleted(pair));
  Object.values(paths).forEach((path) => path.forEach((point) => filledCells.add(cellKey(...point))));
  return allPairsDone && filledCells.size === puzzle.size * puzzle.size;
}

function handleWin() {
  activePair = null;
  selectedSudokuCell = null;
  showSuccess();
}

function handleArukoneCell(row, col) {
  if (checkArukoneWin()) return;
  const endpointPair = getEndpointAt(row, col);
  if (endpointPair && (!activePair || endpointPair !== activePair || isCompleted(activePair))) {
    pushHistory();
    activePair = endpointPair;
    paths[endpointPair] = [[row, col]];
    render(`Weg ${endpointPair} gestartet. Ziehe zum gleichen Symbol.`);
    return;
  }
  if (!activePair) {
    render("Bitte zuerst ein Symbol auswählen.");
    return;
  }
  if (isCompleted(activePair)) {
    render("Dieser Weg ist fertig. Wähle ein anderes Symbol.");
    return;
  }
  const path = paths[activePair];
  const last = path.at(-1);
  if (!isNeighbor(last, [row, col])) {
    render("Ziehe nur waagerecht oder senkrecht auf ein Nachbarfeld.");
    return;
  }
  const existingIndex = path.findIndex((point) => sameCell(point, [row, col]));
  if (existingIndex >= 0) {
    pushHistory();
    paths[activePair] = path.slice(0, existingIndex + 1);
    render("Ein Stück zurückgegangen.");
    return;
  }
  if (!canUseCell(activePair, row, col)) {
    render("Dieses Feld gehört schon zu einem anderen Weg.");
    return;
  }
  pushHistory();
  paths[activePair] = [...path, [row, col]];
  if (isCompleted(activePair)) {
    activePair = null;
    if (checkArukoneWin()) {
      handleWin();
      render();
      return;
    }
    render("Super! Ziehe nun das nächste Symbolpaar zusammen.");
    return;
  }
  render(`Weg ${activePair}: weiter zum gleichen Symbol ziehen.`);
}

function resetSudoku() {
  const puzzle = getPuzzle();
  sudokuValues = Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill(null));
  fixedSudokuCells = new Set();
  puzzle.givens.forEach(([row, col, value]) => {
    sudokuValues[row][col] = value;
    fixedSudokuCells.add(cellKey(row, col));
  });
  selectedSudokuCell = null;
  render("Tippe auf ein leeres Feld und wähle unten eine Zahl.");
}

function checkSudokuWin() {
  const puzzle = getPuzzle();
  return sudokuValues.every((row, rowIndex) =>
    row.every((value, colIndex) => value === puzzle.solution[rowIndex][colIndex]),
  );
}

function hasSudokuConflict(row, col, value) {
  if (!value) return false;
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 2) * 2;
  for (let index = 0; index < 4; index += 1) {
    if (index !== col && sudokuValues[row][index] === value) return true;
    if (index !== row && sudokuValues[index][col] === value) return true;
  }
  for (let r = boxRow; r < boxRow + 2; r += 1) {
    for (let c = boxCol; c < boxCol + 2; c += 1) {
      if ((r !== row || c !== col) && sudokuValues[r][c] === value) return true;
    }
  }
  return false;
}

function selectSudokuCell(row, col) {
  if (fixedSudokuCells.has(cellKey(row, col))) {
    render("Diese Startzahl bleibt stehen. Wähle ein leeres Feld.");
    return;
  }
  selectedSudokuCell = [row, col];
  render("Wähle jetzt unten eine Zahl von 1 bis 4.");
}

function setSudokuNumber(value) {
  if (!selectedSudokuCell) {
    render("Tippe zuerst auf ein leeres Feld.");
    return;
  }
  const [row, col] = selectedSudokuCell;
  pushHistory();
  sudokuValues[row][col] = value;
  if (checkSudokuWin()) {
    handleWin();
    render();
    return;
  }
  render(hasSudokuConflict(row, col, value) ? "Fast! Diese Zahl kommt hier doppelt vor." : "Gut! Fülle weiter die leeren Felder.");
}

function getCellFromPoint(clientX, clientY) {
  const element = document.elementFromPoint(clientX, clientY);
  return element?.closest(".cell");
}

function drawToCell(cell) {
  if (!cell || !board.contains(cell) || currentGame !== "arukone") return;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const key = cellKey(row, col);
  if (key === lastDrawnCell) return;
  lastDrawnCell = key;
  handleArukoneCell(row, col);
}

function render(message = statusText.textContent) {
  if (currentGame === "sudoku") {
    renderSudoku(message);
  } else {
    renderArukone(message);
  }
  undoButton.disabled = history.length === 0;
}

function renderArukone(message = statusText.textContent) {
  const puzzle = getPuzzle();
  board.innerHTML = "";
  numberPad.innerHTML = "";
  numberPad.hidden = true;
  if (!winShown) statusText.textContent = message;
  for (let row = 0; row < puzzle.size; row += 1) {
    for (let col = 0; col < puzzle.size; col += 1) {
      const cell = document.createElement("button");
      const endpointPair = getEndpointAt(row, col);
      const owner = getOwnerAt(row, col);
      const pair = endpointPair ?? owner;
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("aria-label", `Zeile ${row + 1}, Spalte ${col + 1}`);
      cell.style.setProperty("--pair-color", getPairColor(pair));
      if (endpointPair) {
        cell.textContent = endpointPair;
        cell.classList.add("endpoint");
      }
      if (owner) cell.classList.add("filled");
      if (pair && pair === activePair) cell.classList.add("active");
      if (pair && isCompleted(pair)) cell.classList.add("completed");
      if (checkArukoneWin()) cell.classList.add("board-won");
      cell.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        isDrawing = true;
        suppressNextClick = true;
        lastDrawnCell = null;
        beginMove();
        board.setPointerCapture?.(event.pointerId);
        drawToCell(cell);
      });
      cell.addEventListener("click", (event) => {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }
        if (event.detail === 0) handleArukoneCell(row, col);
      });
      board.append(cell);
    }
  }
}

function renderSudoku(message = statusText.textContent) {
  const puzzle = getPuzzle();
  board.innerHTML = "";
  numberPad.innerHTML = "";
  numberPad.hidden = false;
  if (!winShown) statusText.textContent = message;
  for (let row = 0; row < puzzle.size; row += 1) {
    for (let col = 0; col < puzzle.size; col += 1) {
      const value = sudokuValues[row][col];
      const key = cellKey(row, col);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell sudoku-cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.textContent = value ?? "";
      cell.setAttribute("aria-label", `Sudoku Zeile ${row + 1}, Spalte ${col + 1}`);
      if (fixedSudokuCells.has(key)) cell.classList.add("given");
      if (selectedSudokuCell && sameCell(selectedSudokuCell, [row, col])) cell.classList.add("selected");
      if (hasSudokuConflict(row, col, value)) cell.classList.add("conflict");
      if (checkSudokuWin()) cell.classList.add("board-won");
      cell.addEventListener("click", () => selectSudokuCell(row, col));
      board.append(cell);
    }
  }
  [1, 2, 3, 4].forEach((number) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = number;
    button.addEventListener("click", () => setSudokuNumber(number));
    numberPad.append(button);
  });
}

document.querySelectorAll(".choose-game-button[data-game]").forEach((button) => {
  button.addEventListener("click", () => chooseGame(button.dataset.game));
});

const pageGame = document.body.dataset.gamePage;
if (pageGame) {
  showLevelSelectForGame(pageGame);
}

undoButton.addEventListener("click", () => {
  finishMove();
  const previous = history.pop();
  if (previous) {
    restore(previous);
    statusText.textContent = "Der letzte Schritt wurde rückgängig gemacht.";
  }
});
resetButton.addEventListener("click", resetPuzzle);
backButton.addEventListener("click", showLevelSelect);
if (homeButton.tagName === "BUTTON") {
  homeButton.addEventListener("click", showHome);
}
successClose.addEventListener("click", hideSuccess);
nextPuzzleButton.addEventListener("click", goToNextPuzzle);
successOverlay.addEventListener("click", (event) => {
  if (event.target === successOverlay) hideSuccess();
});

document.addEventListener("pointermove", (event) => {
  if (!isDrawing || currentGame !== "arukone") return;
  event.preventDefault();
  drawToCell(getCellFromPoint(event.clientX, event.clientY));
});

document.addEventListener("pointerup", () => {
  isDrawing = false;
  lastDrawnCell = null;
  finishMove();
});
